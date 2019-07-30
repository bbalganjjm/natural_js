package framework.aspects;

import java.lang.invoke.MethodHandles;
import java.net.URLDecoder;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import javax.annotation.Resource;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.util.AntPathMatcher;
import org.springframework.util.Base64Utils;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import com.fasterxml.jackson.databind.ObjectMapper;

import egovframework.rte.fdl.property.EgovPropertyService;
import framework.utils.SecurityUtils;

/**
 * @author KIM HWANG MAN( bbalganjjm@gmail.com )
 * @since 2018.12.05
 */

@Aspect
public class VOFilterAspect {

	private final Logger logger = LoggerFactory.getLogger(MethodHandles.lookup().lookupClass());

	@Resource(name = "propertiesService")
	private EgovPropertyService propertiesService;

	private String[] xssExcludeUrls = null;

	private boolean isCleanXSS = true;
	
	@SuppressWarnings("unchecked")
	@Around("within(@org.springframework.stereotype.Controller *)")
	private Object filterBeforeAllMethods(ProceedingJoinPoint joinPoint) throws Throwable {
		Object[] args = joinPoint.getArgs();

		ServletRequestAttributes servletRequestAttributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
		HttpServletRequest request = servletRequestAttributes.getRequest();
		HttpServletResponse response = servletRequestAttributes.getResponse();

		this.xssExcludeUrls = propertiesService.getStringArray("xss.exclude.urls");
		
		if (this.xssExcludeUrls.length > 0) {
			AntPathMatcher antPathMatcher = new AntPathMatcher();
			String requestURI = request.getRequestURI();
			for (int i = 0; i < this.xssExcludeUrls.length; i++) {
				if (antPathMatcher.match(this.xssExcludeUrls[i].trim(), requestURI)) {
					isCleanXSS = false;
					break;
				}
			}
		}
		
		for (int i = 0; i < args.length; i++) {
			if (args[i] instanceof List) {
				putCommParameters((List<Map<String, Object>>) args[i], request);
			} else if (args[i] instanceof Map) {
				putCommParameter((Map<String, Object>) args[i], request);
			} else {
				if(args[i] == null) {
					// EXCEL Download Parameters
					Cookie[] cookies = request.getCookies();
					String excelParametersStr = null;
					if (cookies != null) {
					    for (Cookie cookie : cookies) {
					        if("n-excel-params".equals(cookie.getName())){
					        	excelParametersStr = URLDecoder.decode(new String(Base64Utils.decodeFromString(URLDecoder.decode(cookie.getValue(), "UTF-8").replaceAll(" ", "+")), "UTF-8"), "UTF-8");
					        	
					        	// Remove Cookie
					        	cookie.setValue("");
					            cookie.setPath("/");
					            cookie.setMaxAge(0);
					            response.addCookie(cookie);
					        }
					    }
					}
					if(excelParametersStr != null) {
						ObjectMapper mapper = new ObjectMapper();
						if(excelParametersStr.trim().startsWith("[")) {
							List<Map<String, Object>> excelParams = (List<Map<String, Object>>)mapper.readValue(excelParametersStr.getBytes(), List.class);
							
							Iterator<Map<String, Object>> iter = excelParams.iterator();
							Map<String, Object> excelParam;
							while (iter.hasNext()) {
								excelParam = (Map<String, Object>) iter.next();
								setExcelParams(excelParam);
							}

							args[i] = excelParams;
						} else {
							Map<String, Object> excelParams = (Map<String, Object>)mapper.readValue(excelParametersStr.getBytes(), Map.class);
							setExcelParams(excelParams);

							args[i] = excelParams;
						}
					}
				}
			}
			
			if (logger.isDebugEnabled() && (args[i] instanceof List || args[i] instanceof Map)) {
				logger.debug("| SQL parameters");
				logger.debug("+- " + args[i].toString());
			}
		}
		
		return joinPoint.proceed(args);
	}

	private void setExcelParams(Map<String, Object> excelParams) {
		excelParams.put("isXlsxRequest", true);
		// Remove pagination parameters 
		excelParams.remove("pageNo");
		excelParams.remove("countPerPage");
		excelParams.remove("countPerPageSet");
		excelParams.remove("totalCount");
		excelParams.remove("pageCount");
		excelParams.remove("pageSetCount");
		excelParams.remove("currSelPageSet");
		excelParams.remove("startPage");
		excelParams.remove("endPage");
		excelParams.remove("startRowIndex");
		excelParams.remove("startRowNum");
		excelParams.remove("endRowIndex");
		excelParams.remove("endRowNum");
	}
	
	private void putCommParameters(List<Map<String, Object>> voList, HttpServletRequest request) {
		if (voList == null) {
			return;
		}

		for (int i = 0; i < voList.size(); i++) {
			if(voList.get(i) instanceof Map) {
				Map<String, Object> vo = voList.get(i);

				putCommParameter(vo, request);
			}
		}
	}

	private void putCommParameter(Map<String, Object> vo, HttpServletRequest request) {
		if (vo == null) {
			return;
		}

		recursion(vo, request);

		HttpSession session = request.getSession();
		// TODO Put session parameters to VO
	}

	@SuppressWarnings("unchecked")
	private void recursion(Map<String, Object> vo, HttpServletRequest request) {
		Iterator<String> iter = vo.keySet().iterator();
		String key;
		String orgValue;
		String value;
		while (iter.hasNext()) {
			key = (String) iter.next();
			if (vo.get(key) instanceof String && isCleanXSS) {
				orgValue = (String) vo.get(key);
				value = SecurityUtils.cleanXSSString((String) vo.get(key));
				vo.put(key, value);
				if (logger.isWarnEnabled()) {
					if (!orgValue.equals(vo.get(key))) {
						logger.warn("An unacceptable string has been detected for XSS\n" 
								+ " - URI : " + request.getRequestURI() + "\n"
								+ " - Key : " + key + "\n"
								+ " - Value : " + orgValue + "\n" 
								+ " - Replacement Value : " + value);
					}
				}
			} else if (vo.get(key) instanceof Map) {
				putCommParameter((Map<String, Object>) vo.get(key), request);
			} else if (vo.get(key) instanceof List) {
				putCommParameters((List<Map<String, Object>>) vo.get(key), request);
			}
		}
	}
}