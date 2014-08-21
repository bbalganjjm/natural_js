/**
 * 본 소프트웨어(CVCAF(Communicator-View-Controller Architecture Framework))를 허가 없이 사용하는 행위는,
 * 소프트웨어 소유자(대우정보시스템(주))에 대한 권리를 침해하는 것이며,
 * 이 행위를 한 자는 소프트웨어 소유자(대우정보시스템(주))로부터 저작권법에 의거 소송을 당할 수 있습니다.
 * 사용권 문서를 받은 자는, 사용권 문서에 명기된 조항에 의거하여 소프트웨어를 사용하는 것이 허가됩니다.
 * 사용권에 대한 침해가 있을 경우, 사용을 제한하거나 소송을 당할 수 있습니다.
 */
var Communicator = {
	xhr : null,
    deferreds : [],
    reqCnt : 0,
    deferredsReset : function(options) {
        Config.preventDoubleSubmitOff(options);
        Communicator.deferreds = [];
        Communicator.reqCnt = 0;
    },
    /**
     * debug mode, 에러메시지와 전송되는 파라메터를 표시한다.
     * @type Boolean
     */
    debuggable : false,
    /**
     * Ajax 방식으로 서버와 통신한다.
     * @param {} url
     * @param {} paramsaa
     * @param {} method
     * @param {} async
     * @return {}
     */
    ajaxCall : function( options ) {
        Config.preventDoubleSubmitOn(options);

        this.defaultOptions = {
            url : null,
            params : null,
            method : "POST",
            async : false,
            dataType : "json",
            contentType : Config.contentType,
            successCallback : null
        };
        options = jQuery.extend({}, this.defaultOptions, options);
        var returnData = null;
        var errorMsg = null;
        var beforeSendLocationHref = null;
        if(typeof this.debuggable == "undefined" || this.debuggable == false) {
        this.xhr = $.ajax({
                url : options.url,
                dataType : options.dataType,
                type : options.method,
                cache : Config.live,
                async : options.async,
                contentType : options.contentType,
                data : options.params,
                crossDomain : false,
                beforeSend : function(xhr) {
                	beforeSendLocationHref = window.location.href;
                	Communicator.deferreds.push(xhr);
                    options.currentTimeMillis = new Date().getTime();
                },
                success : function(data, textStatus, xhr) {
                    Config.globalRequestFilter.post(data, textStatus, xhr, options);

                    // for JCF if(data != null && data.exception != null) {
                    if(data != null && data.exception != null) {
                        errorMsg = data.exception;
                    } else {
                        if(options.async == true) {
                            try {
                                currentTimeMillis = new Date().getTime();
                                if($.browser.msie) {
                                    if(options.asyncUrlCheck) {
                                        if(options.successCallback != null && (beforeSendLocationHref.replaceAll("!", "") == window.location.href.replaceAll("!", "") || StringUtils.endsWith(window.location.href, "#"))) {
                                            options.successCallback(data);
                                        } else {
                                            xhr.abort();
                                        }
                                    } else {
                                        options.successCallback(data);
                                    }
                                } else {
                                    if(options.asyncUrlCheck) {
                                        if(options.successCallback != null && (beforeSendLocationHref.replaceAll("!", "") == window.location.href.replaceAll("!", "") || StringUtils.endsWith(window.location.href, "#"))) {
                                            options.successCallback(data);
                                        } else {
                                            xhr.abort();
                                        }
                                    } else {
                                        options.successCallback(data);
                                    }
                                }
                            } catch (e) {
                                Communicator.deferredsReset();

                                if (Config["blockServerMessage_" + Config.locale] != null) {
                                    MessageUtils.show(Config["blockServerMessage_" + Config.locale]);
                                } else {
                                    MessageUtils.show(e.message);
                                }

                                SystemUtils.serviceControllerLogTracer({
                                    currentTimeMillis : currentTimeMillis,
                                    error : e
                                });
                            }
                        } else {
                            returnData = data;
                        }
                    }

                    // for JCF
                    if(SystemUtils.realTypeOf(data) == "object" && ArrayUtils.isEmpty(data.success) == false) {
                        MessageUtils.show(data.success[0]);
                    }
                },
                statusCode : {
                    404 : function() {
                        errorMsg = "[HTTP Status 404]Not found, 문서를 찾을 수 없음";
                    },
                    412 : function() {
                        errorMsg = "[HTTP Status 412]Precondition failed, 선결조건 실패";
                    },
                    500 : function(xhr, textStatus, data) {
                        if(StringUtils.trimToNull(errorMsg) == null) {
                            if(StringUtils.trimToNull(xhr.responseText) != null) {
                                try {
                                    errorMsg = "[HTTP Status 500] " + data + "\n" + JSON.parse(xhr.responseText)["exception"];
                                } catch(e) {
                                    errorMsg = "[HTTP Status 500] " + data;
                                }
                            } else {
                                errorMsg = "[HTTP Status 500] " + data;
                            }
                        }
                    }
                },
                error : function(xhr, textStatus, data) {
                    Config.globalRequestFilter.error(xhr, textStatus, data, options);

                    if(StringUtils.trimToNull(xhr.responseText) != null) {
                        try {
                            errorMsg = JSON.parse(xhr.responseText)["exception"];
                        } catch(e) {
                            errorMsg = "[Unknown server error]" + xhr.responseText;
                        }
                    } else {
                        errorMsg = data;
                    }

                    if(Config.live == false) {
                        if(typeof console != 'undefined'){SystemUtils.communicatorLogTracer(options, console, xhr.responseText);}
                    }
                },
                complete : function(xhr, textStatus) {
                    Config.globalRequestFilter.after(xhr, textStatus, errorMsg, options);

                    if(StringUtils.trimToNull(errorMsg) != null) {
                        if(options.errorCallback != null) {
                            options.errorCallback(errorMsg);
                        }
                    } else {
                        if((StringUtils.startsWith(JCFUtils.getActionString(options.url), Config.reservedActionPrefix.CREATE)
                                || StringUtils.startsWith(JCFUtils.getActionString(options.url), Config.reservedActionPrefix.UPDATE)
                                || StringUtils.startsWith(JCFUtils.getActionString(options.url), Config.reservedActionPrefix.DELETE))
                                && $(Config.pageContext).find(".changedEditableCell").length > 0) {
                            $(Config.pageContext).find(".changedEditableCell").filter(":input").each(function() {
                                var $this = $(this);
                                if(options.params.indexOf($this.attr("name")) > -1) {
                                    $this.removeClass("changedEditableCell");
                                }
                            });
                        }
                    }
                }
            });

            $.when.apply($, Communicator.deferreds).then(function() {
                if(beforeSendLocationHref.replaceAll("!", "") != window.location.href.replaceAll("!", "")) {
                    Communicator.deferredsReset(options);
                }
                if(Communicator.deferreds.length > 0) {
                    Communicator.reqCnt = Communicator.deferreds.length;
                }
                if(Communicator.reqCnt == arguments.length || SystemUtils.realTypeOf(arguments[0]) == "object" || SystemUtils.realTypeOf(arguments[0]) == "array") {
                    Communicator.deferredsReset(options);
                }
            }, function() {
                Communicator.deferredsReset(options);
            });
        } else {
            if(Config.live == false) {
                if(typeof console != 'undefined'){SystemUtils.communicatorLogTracer(options, console, returnData);}
            }
        }

        return returnData;
    }
};