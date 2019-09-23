package framework.exception;

import java.lang.invoke.MethodHandles;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.StringUtils;
import org.mybatis.spring.MyBatisSystemException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.core.env.Environment;
import org.springframework.web.servlet.HandlerExceptionResolver;
import org.springframework.web.servlet.ModelAndView;

/**
 * @author KIM HWANG MAN( bbalganjjm@gmail.com )
 * @since 2018.12.05
 */
public class ExceptionResolver implements HandlerExceptionResolver {

    private final Logger logger = LoggerFactory.getLogger(MethodHandles.lookup().lookupClass());

    @Autowired
    private Environment environment;
    
    @Autowired
    private MessageSource messageSource;
    
    private String json = null;
    private String form = null;

    public void setJson(String json) {
        this.json = json;
    }

    public void setForm(String form) {
        this.form = form;
    }

    public ModelAndView resolveException(HttpServletRequest request, HttpServletResponse response, Object obj, Exception e) {
    	
    	int code = -1;
    	String message = null;
    	
    	String contentType = StringUtils.trimToEmpty(request.getHeader("Content-Type")).toLowerCase();

    	if(e instanceof BizException) {
    		response.setStatus(HttpServletResponse.SC_PRECONDITION_FAILED);
    		
    		code = ((BizException)e).getCode();
    		message = ((BizException)e).getMessage();
    	} else if(e instanceof CommonException) {
    		response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
    		
    		code = ((CommonException)e).getCode();
    		message = ((CommonException)e).getMessage();
    		
    		logger.error(request.getRequestURI(), e);
    	} else if(e instanceof MyBatisSystemException) {
    		if(((MyBatisSystemException)e).getMostSpecificCause() instanceof CommonException) {
    			response.setStatus(HttpServletResponse.SC_REQUEST_ENTITY_TOO_LARGE);
    			
    			CommonException ce = (CommonException)((MyBatisSystemException)e).getMostSpecificCause();
    			
    			code = ((CommonException)ce).getCode();
        		message = ((CommonException)ce).getMessage();
        		
        		logger.info(request.getRequestURI(), ce);
    		} else {
    			response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        		
        		code = -1;
        		
        		if("prod".equals(environment.getActiveProfiles()[0])) {
        			message = messageSource.getMessage("error.default.message", null, Locale.getDefault());
        		} else {
        			message = e.getMessage() == null ? e.toString() : e.getMessage();
        		}
                logger.error(request.getRequestURI(), e);
    		}
    	} else {
    		response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
    		
    		code = -1;
    		
    		if("prod".equals(environment.getActiveProfiles()[0])) {
    			message = messageSource.getMessage("error.default.message", null, Locale.getDefault());
    		} else {
    			message = e.getMessage() == null ? e.toString() : e.getMessage();
    		}
            logger.error(request.getRequestURI(), e);
    	}

        Map<String, Object> errorVO = new HashMap<String, Object>();
        errorVO.put("code", code);
        errorVO.put("message", message);
        
        // 엑셀 관련 쿠키 제거
        Cookie[] cookies = request.getCookies();
		if (cookies != null) {
			for (Cookie cookie : cookies) {
				if ("n-excel-filename".equals(cookie.getName()) 
						|| cookie.getName().startsWith("n-excel-column-names")
						|| "n-excel-stream".equals(cookie.getName())) {
					// Remove Cookie
					cookie.setValue("");
					cookie.setPath("/");
					cookie.setMaxAge(0);
					response.addCookie(cookie);
				}
			}
		}

        if (contentType.indexOf("json") > -1 || (contentType.indexOf("html") < 0 && "XMLHttpRequest".equalsIgnoreCase(request.getHeader("x-requested-with")))) {
            return new ModelAndView(json, "error", errorVO);
        } else {
            return new ModelAndView(form, "error", errorVO);
        }
    }
}