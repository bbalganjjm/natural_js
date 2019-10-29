package framework.file;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.io.PrintWriter;
import java.lang.invoke.MethodHandles;
import java.math.BigDecimal;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;

import javax.servlet.http.HttpServletResponse;

import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellType;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.MessageSource;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.multipart.MultipartHttpServletRequest;

import framework.exception.CommonException;
import framework.file.service.XlsxFIleService;
import framework.utils.SecurityUtils;

/**
 * @author KIM HWANG MAN( bbalganjjm@gmail.com )
 * @since 2019.06.25
 */

@Controller
@RequestMapping("file")
public class XlsxToJSONController {

	private final Logger logger = LoggerFactory.getLogger(MethodHandles.lookup().lookupClass());
	
	@Autowired(required = false)
	@Qualifier("xlsxFIleServiceImpl")
	private XlsxFIleService xlsxFIleService;

	@Autowired
	private MessageSource messageSource;
	
	@RequestMapping("getDataListFromXlsx.json")
	public void getDataListFromXlsx(MultipartHttpServletRequest mRequest, HttpServletResponse response) throws Exception {
		Map<String, Object> paramMap = getMultipartParameters(mRequest);

		if (xlsxFIleService != null) {
			sendJSONData(paramMap, response, xlsxFIleService.postProcessing(mRequest, paramMap));
		} else {
			sendJSONData(paramMap, response, mRequest.getFile("xlsxFile").getInputStream());
		}
	}

	public Map<String, Object> getMultipartParameters(MultipartHttpServletRequest mRequest) {
		Map<String, Object> paramMap = new HashMap<String, Object>();
		@SuppressWarnings("unchecked")
		Enumeration<String> e = mRequest.getParameterNames();
		String name;
		String[] values;
		while (e.hasMoreElements()) {
			name = e.nextElement();
			values = mRequest.getParameterValues(name);
			if (values != null) {
				if (values.length > 1) {
					int i = 0;
					for (String value : values) {
						paramMap.put(name + "[" + String.valueOf(i) + "]", SecurityUtils.cleanXSSString(value));
						i++;
					}
				} else {
					paramMap.put(name, SecurityUtils.cleanXSSString(values[0]));
				}
			}
		}
		return paramMap;
	}

	private void sendJSONData(Map<String, Object> paramMap, HttpServletResponse response, File file)
	        throws FileNotFoundException, IOException, CommonException {
		sendJSONData(paramMap, response, new FileInputStream(file));
		
		if(file.exists()) {
			if(!file.delete()) {
				if(logger.isWarnEnabled()) {
					logger.warn(messageSource.getMessage("-31", new String[] { file.getName() }, Locale.getDefault()));
				}
			}
		}
	}

	private void sendJSONData(Map<String, Object> paramMap, HttpServletResponse response, InputStream inputStream)
	        throws FileNotFoundException, IOException, CommonException {
		Workbook workBook = null;
		PrintWriter pw = null;

		String[] header;
		if (paramMap.get("header") != null) {
			header = ((String) paramMap.get("header")).split(",");
		} else {
			throw new CommonException(-30);
		}

		try {
			// workBook = new SXSSFWorkbook(new XSSFWorkbook(inputStream));
			workBook = new XSSFWorkbook(inputStream);

			Sheet sheet = workBook.getSheetAt(0);
			String sheetName = sheet.getSheetName();
			boolean isError = false;
			
			if (sheetName != null && sheetName.length() > 0) {
				int firstRowNum = paramMap.get("start") != null ? Integer.valueOf((String) paramMap.get("start")) : 1;
				int lastRowNum = sheet.getLastRowNum();

				if (lastRowNum > 0) {
					response.setContentType("application/json; charset=utf-8");
					response.setCharacterEncoding("utf-8");
					response.setHeader("Cache-Control", "no-cache");
					pw = response.getWriter();

					StringBuffer rowStrSb = null;
					
					pw.print("[");
					for (int i = firstRowNum; i < lastRowNum + 1; i++) {
						rowStrSb = new StringBuffer();
						
						Row row = sheet.getRow(i);
						if (row == null) {
							break;
						}

						rowStrSb.append("{");
						int headerLength = header.length;
						for (int j = 0; j < headerLength; j++) {
							Cell cell = row.getCell(j);
							
							if(cell == null) {
								rowStrSb.append("\"" + header[j] + "\":null");
							} else {
								CellType cellType = cell.getCellType();
								if (cellType.equals(CellType.NUMERIC)) {
									double numberValue = cell.getNumericCellValue();
									String stringCellValue = BigDecimal.valueOf(numberValue).toPlainString();
									rowStrSb.append("\"" + header[j] + "\":" + stringCellValue);
								} else if (cellType.equals(CellType.STRING)) {
									rowStrSb.append("\"" + header[j] + "\":\"" + cell.getStringCellValue().replaceAll("\\n", " ") + "\"");
								} else if (cellType.equals(CellType.BOOLEAN)) {
									boolean numberValue = cell.getBooleanCellValue();
									String stringCellValue = String.valueOf(numberValue);
									rowStrSb.append("\"" + header[j] + "\":" + stringCellValue);
								} else if (cellType.equals(CellType.BLANK)) {
									rowStrSb.append("\"" + header[j] + "\":\"\"");
								}
							}
							
							if (headerLength > j+1) {
								rowStrSb.append(",");
							}
						}
						
						int lastIndexOfRowStr = rowStrSb.lastIndexOf(",");
						if(rowStrSb.toString().length() == lastIndexOfRowStr + 1) {
							rowStrSb.deleteCharAt(lastIndexOfRowStr);
							isError = true;
						}
						
						rowStrSb.append("}");
						if (lastRowNum != i && sheet.getRow(i+1) != null) {
							rowStrSb.append(",");
						}
						
						pw.print(rowStrSb.toString());
						
						if (i % 1000 == 0) {
							pw.flush();
						}
					}

					workBook.close();

					pw.print("]");
					pw.flush();

					if(isError && logger.isErrorEnabled()) {
						logger.error(messageSource.getMessage("excel.not.match.column.count", null, Locale.getDefault()));
					}
					
					rowStrSb = null;
				}
			}
		} finally {
			if(inputStream != null) {
				inputStream.close();
			}
			if (workBook != null) {
				workBook.close();
			}
			if (pw != null) {
				pw.close();
			}
		}
	}

}