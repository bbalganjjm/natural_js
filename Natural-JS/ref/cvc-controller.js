/**
 * 본 소프트웨어(CVCAF(Communicator-View-Controller Architecture Framework))를 허가 없이 사용하는 행위는,
 * 소프트웨어 소유자(대우정보시스템(주))에 대한 권리를 침해하는 것이며,
 * 이 행위를 한 자는 소프트웨어 소유자(대우정보시스템(주))로부터 저작권법에 의거 소송을 당할 수 있습니다.
 * 사용권 문서를 받은 자는, 사용권 문서에 명기된 조항에 의거하여 소프트웨어를 사용하는 것이 허가됩니다.
 * 사용권에 대한 침해가 있을 경우, 사용을 제한하거나 소송을 당할 수 있습니다.
 */
;(function ($) {
    /**
     * FormExtender jQuery plugin
     * @return Extened HTMLFormElement
     */
    $.fn.FormExtender = function( options ) {
        var opts = (typeof options != "undefined") ? options : {};
        if(typeof opts.ajax == "undefined") opts.ajax = true;

        var extendedForm = null;
        if(opts.ajax == true) {
            this.each(function(){
                extendedForm = Controller.extendingForm(this);
            });
            if ($.browser.mozilla) {
                $("input").bind("keydown", function( event ) {
                    if (event.keyCode == 13) {
                        event.preventDefault();
                        event.returnValue = false;
                    }
                });
            } else {
                $("input").bind("keypress", function( event ) {
                    if (event.keyCode == 13) {
                        event.preventDefault();
                        event.returnValue = false;
                    }
                });
            }
        } else {
            extendedForm = this;
        }

        if(typeof opts.defaultFocus != "undefined" && opts.defaultFocus != null) {

        }
        if(typeof opts.validate != "undefined" && opts.validate != null) {

        }
        return extendedForm;
    };
})(jQuery);

/**
 * Common Controller
 */
var Controller = {
    debuggable : false,
    action : null,
    params : null,
    target : null, //서버응답을 표시할 영역
    targetHistory : true, //뒤로가기 히스토리 남김 유무
    targetChangedMessage : true, //수정중인데이터 있을경우 메시지 표시
    paramsId : null,
    method : "POST",
    async : false,
    dataType : "json",
    contentType : Config.contentType,
    asyncUrlCheck : Config.communicatorAsyncUrlCheck,
    successCallback : null,
    errorCallback : null,
    paginable : true,
    xhr : null,
    submit : function(url, successCallback) {
        if(url != null) {
            if(SystemUtils.realTypeOf(url) == "string") {
                Controller.action = url;
                if(successCallback != null) {
                    Controller.async = true;
                    Controller.successCallback = successCallback;
                }
            } else {
                Controller.async = true;
                Controller.successCallback = url;
            }
        }

        Communicator.debuggable = Controller.debuggable;

        if(this.target != null) {
        	Config.controllerTargetFilter.pre(CVCRequest);

        	if(this.targetChangedMessage) {
                //데이터 수정 체크 - 제거
                //if(!GlobalServiceController.checkModifyData()) return false;
            }

            this.dataType = "html";
            this.contentType = "application/x-www-form-urlencoded";

            //for JCF, POST방식일때 JSON형태의 파라메터는 파싱안됨, 때문에 key, value 쌍 파라메터형식으로 변환
            if(Controller.method.toUpperCase() != "GET"
                    && StringUtils.trimToNull(this.params) != null
                    && this.params.length > 2
                    && this.params.charAt(0) == "{"
                    && this.params.charAt(this.params.length - 1) == "}") {
                var jsonParams = JSON.parse(this.params);
                this.params = "";
                for (var key in jsonParams) {
                    if (jsonParams.hasOwnProperty(key)) {
                        this.params += (key + "=" + jsonParams[key] + "&");
                    }
                }
                jsonParams = null;
            }

            this.async = false;
        }

        Config.globalRequestFilter.pre(Controller);

        var dataList = Communicator.ajaxCall({
            url : Controller.action,
            params : Controller.params,
            method : Controller.method,
            async : Controller.async,
            dataType : Controller.dataType,
            contentType : Controller.contentType,
            asyncUrlCheck : Controller.asyncUrlCheck,
            successCallback : Controller.successCallback,
            errorCallback : Controller.errorCallback
        });
        this.xhr = Communicator.xhr;
        Communicator.xhr = null;

        if(this.target != null) {
            this.getRequest().setAttr("params", Controller.params);
            if($.browser.msie && StringUtils.trimToEmpty(currLocationHash).length > 1800) {
                //MSIE 에서 window.location.hash 값이 2046 byte 가 넘어가면 오류남. Controller.getRequest().getAttr("params") 로 받으면 됨.
                Controller.params = null;
            };

            if(this.targetHistory) {
                var currLocationHash = "!" + Base64.encode("CONTROLLER" + Config.splitSeparator
                        + Controller.target + Config.splitSeparator
                        + StringUtils.trimToEmpty(Controller.params) + Config.splitSeparator
                        + Controller.action);
                $(window).data("currLocationHash", currLocationHash);
                window.location.hash = currLocationHash;
            }
            if(this.target == Config.pageContext) {
                //<!-- for HYIN 컨텐츠 헤더 부분 복사
                var prevHeader = $(Config.pageContext + " div.header").clone(true);
                GlobalServiceController.systemResourceCollector();
                if(prevHeader.length > 0) {
                    $(this.target).html(prevHeader);
                    prevHeader = null;
                }
                //-->

                $(this.target).append(dataList);

                Controller.target = null;
                this.reset();
                ContextInitializer.staticElementInit();
                ContextInitializer.dynamicElementInit();
                ContextInitializer.serviceControllerInit();
            } else {
                $(this.target).html(dataList);
                Controller.target = null;
                this.reset();
                SystemUtils.popInit();
                ContextInitializer.dynamicElementInit();
            }
            Config.controllerTargetFilter.post(CVCRequest);
            dataList = null;
        } else {
            this.reset();
        }
        return dataList;
    },
    getRequest : function() {
        return CVCRequest;
    },
    getContext : function() {
        return CVCContext;
    }
};

