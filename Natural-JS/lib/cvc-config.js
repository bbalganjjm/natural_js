/**
 * ver. 1.0.8.6
 */
var Config = {
    /**
     * 시스템 개발중 false, 운영중 true, true 이면 Ajax 캐시등이 활성화 된다.
     */
    live : false,
    /**
     * 서버 푸시 활성화
     */
    socket : true,
    /**
     * 서버 푸시 활성화시 소켓 객체, 전역 index 페이지에서 설정
     */
    cvcSocket : null,
    /**
     * 서버 푸시 활성화시 소켓 서버
     */
    cvcSocketHost : "http://10.201.7.4",
    /**
     * 팝업컴포넌트 디자인 설정
     */
    popupComponentConfig : {
        /**
         * 서비스이름 - 팝업컴포넌트의 large 헤더 스타일에 표시됨.
         */
        serviceName : "Communicator-View-Controller Architecture Framework",
        /**
         * 팝업 헤더의 닫기 버튼 이미지
         */
        closeButtonImage : "/js/cvcaf/images/popup/btn_close.gif",
        /**
         * 팝업 페이징 버튼이미지
         */
        pagingButtonSet : {
            firstPage : "/js/cvcaf/images/popup/btn_first.gif",
            prevPage : "/js/cvcaf/images/popup/btn_prev.gif",
            nextPage : "/js/cvcaf/images/popup/btn_next.gif",
            lastPage : "/js/cvcaf/images/popup/btn_last.gif"
        },
        /**
         * 팝업컴포넌트에서 브라우저팝업 으로 띄울경우 해당페이지를 표시할 기본페이지 URL
         * CVCAF의 모든모듈과 디자인 CSS파일이 로딩될 기본페이지
         */
        browserPopupContainer : "pidx0100.html?url="
    },
    /**
     * 팝업컴포넌트 디자인 설정
     */
    dataGridComponentConfig : {
        /**
         * 페이징 버튼이미지
         */
        pagingButtonSet : {
            firstPage : "/js/cvcaf/images/popup/btn_first.gif",
            prevPage : "/js/cvcaf/images/popup/btn_prev.gif",
            nextPage : "/js/cvcaf/images/popup/btn_next.gif",
            lastPage : "/js/cvcaf/images/popup/btn_last.gif"
        },
        /**
         * addRow시 그리드 탑에 생성될건지 바텀에 생성될건지 전역 설정
         */
        globalPosAddNewLine : "top",
        /**
         * 그리드 헤더와 푸터의 스크롤을  덮기 위한 기본 마진
         * 화면안의 그리드중 제일 왼쪽에 붙어있는 그리드의 offset().left 값.
         */
        globalLeftMargin : function(container) {
        	return 1;
        }
    },
    /**
     * 데이터바인드컴포넌트 설정
     */
    dataBindComponentConfig : {
        /**
         * addRow시 연계된 그리드 탑에 생성될건지 바텀에 생성될건지 전역 설정
         */
        globalPosAddNewLine : "bottom"
    },
    /**
     * dataList 등의 옵션의 메모리 참조를 연결 해 줄 때 null 로 체크할건지 비어있는걸로 체크할건지 여부
     * true : dataList가 비어있는것도 메모리 참조를 강제 연결하지 않음.
     * false : dataList가 null 인것만 메모리 참조를 강제 연결하지 않음.
     */
    mergeOptionsAllowEmpty : false,
    /**
     * null 이 아니면 서버의 모든 메시지를 차단한다. 메시지를 넣으면 해당메시지가 서버에서 전달되는 에러메시지나 공통메시지가 입력한 메시지로 표시된다.
     * ex) 서버에 요청중 에러가 발생 했습니다. 관리자에게 문의 바랍니다.
     */
    blockServerMessage_ko : null,
    blockServerMessage_en : null,
    blockServerMessage_zh : null,
    /**
     * CVCAF_HOME 디렉토리 지정
     */
    CVCAF_HOME : "js/cvcaf/",
    /**
     * 서버 Context Root
     */
    CONTEXT_ROOT : "/",
    /**
     * 로케일 기본값
     */
    locale : "ko",
    /**
     * 컨텐츠 영역
     */
    pageContext : "#cvcafContents",
    /**
     * 모달 팝업의 가려지는 부분 context
     */
    BlockContext : "#cvcafContents",
    /**
     * 다이얼로그 메시지의 context
     */
    messageContext : "body",
    /**
     * 서버에 Ajax 요청시 기본 contentType
     */
    contentType : "application/json; charset=utf-8",
    /**
     * 체크박스 선택시 기본 값
     */
    checkedValue : "1",
    /**
     * 체크박스 선택 안됐을때 기본 값
     */
    unCheckedValue : "0",
    /**
     * 체크박스가 여러개 있을경우 값의 형태, true = array, false = string
     */
    multyValuesArray : true,
    /**
     * 셀렉트 박스의 기본 값
     */
    defaultSelectedIndex : 0,
    /**
     * 기본 split 구분자
     */
    splitSeparator : "$@^",
    /**
     * 년월일 구분 문자
     */
    dateSeperator : "-",
    /**
     * 시간 구분 문자
     */
    timeSeperator : ":",
    /**
     * 서버에 전송될 date 형식
     */
    datepickerServerDateFormat : "yymmdd",
    /**
     * 년월 날짜포멧
     */
    Ym : function() {
        return "Y" + this.dateSeperator + "m";
    },
    /**
     * 년월일 날짜포멧
     */
    Ymd : function() {
        return "Y" + this.dateSeperator + "m" + this.dateSeperator + "d";
    },
    /**
     * 년월일 시 날짜포멧
     */
    YmdH : function() {
        return "Y" + this.dateSeperator + "m" + this.dateSeperator + "d H";
    },
    /**
     * 년월일 시분 날짜포멧
     */
    YmdHi : function() {
        return "Y" + this.dateSeperator + "m" + this.dateSeperator + "d H" + this.timeSeperator + "i";
    },
    /**
     * 년월일 시분초 날짜포멧
     */
    YmdHis : function() {
        return "Y" + this.dateSeperator + "m" + this.dateSeperator + "d H" + this.timeSeperator + "i" + this.timeSeperator + "s";
    },
    /**
     * datePicker 충돌 방지를 위해 datePicker 의 기본 키이벤트를 모두 없엘지 여부
     * HYIN - true,
     * 그외 - false
     */
    datePickerUnloadKeyEvents : false,
    /**
     * 페이지로딩 이미지 및 메시지
     */
    getPageLoadingBar : function() {
        return "<div id='pageLoadingBar' align='center' style='padding:120px;'><img src='/js/cvcaf/images/ajax-page-loader.gif'><br/><br/>" + CommonI18nMessages.pageLoading[Config.locale] + "</div>";
    },
    /**
     * 탭 컨텐츠 로딩
     */
    loadTab : function(event, ui) {
		if (jQuery(ui.tab).data("load.tabs")) {
            var url = jQuery(ui.tab).data("load.tabs");
            if (url) {
                jQuery(ui.panel).html(Config.getPageLoadingBar());
                Controller.contentType = "application/x-www-form-urlencoded";
                Controller.method = "GET";
                Controller.dataType = "html";
                Controller.submit(url, function(page) {
                    jQuery(ui.panel).html(page);
                    ContextInitializer.dynamicElementInit();
                    SystemUtils.initServiceController("popInit");
                });

                jQuery(ui.tab).removeData("load.tabs");
            }
        }
	},
	/**
     * 탭 기본옵션
     */
    tabOptions : {
    	load : function(event, ui) {
    		Config.loadTab(event, ui);
            return true;
        },
        select : function(event, ui) {
        	Config.loadTab(event, ui);
            return true;
        }
    },
    /**
     * LayerUtils.block 호출시 메시지
     */
    getContentsBlockMsg : function(msg) {
    	if(typeof msg == "undefined") {
    		msg = "화면이 차단 되었습니다.";
    	}
    	msg = window.lang.convert(msg);
    	var html = new StringBuffer();
    	html.append('<div class="pop_alert">');
    	html.append('	<div class="pop_cont">');
    	html.append('		<table class="alert_txt"><tr><td><span>' + msg + '</span></td></tr></table>');
    	html.append('		<p class="pop_btn">');
    	html.append('			<span class="button_ btn_common_wrap btn_white_wrap btn_large_wrap"><button class="btn_common btn_white btn_large"><span>' + window.lang.convert("이전페이지") + '</span></button></span>');
    	html.append('		</p>');
    	html.append('	</div>');
    	html.append('</div>');
    	return html.toString();
    },
    getContentsBlockMsgContainer : function(htmlMsg, overlayZIndex) {
    	$(Config.pageContext).append('<div class="contentsBlock" style="position: fixed; top: ' + ($(window).height() / 4) + 'px; left: ' + (760 / 2 - 174)  + 'px; z-index: ' + (overlayZIndex + 1) + ';">' + htmlMsg + '<div>');
        var param = Controller.getRequest().getAttr("param");
        if(param != null && param.pageUrl) {
        	$("div.pop_alert p.pop_btn button").click(function() {
        		window.location.reload();
        	});
        } else {
        	$("div.pop_alert p.pop_btn").remove();
        }
        param = null;
    },
    excludePreventDoubleSubmit : function(url) {
        for(var key in {
            "dummy.do" : true
        }) {
            if(url.indexOf(key) > -1) return true;
        }
        return false;
    },
    /**
     * 컨텐츠 영역이 모두 로딩되고 서버요청이 시작될때 처리. 요청후 0.25 안에 다시요청이 들어오면 하나의 요청으로 묶여짐(물리적인 전송은 묵이지 않고 preventDoubleSubmitOn 만 한번 실행).
     */
    preventDoubleSubmitOn : function(options) {
        //로딩바가 표시되는 조건
        if(options.dataType != "html" && !Config.excludePreventDoubleSubmit(options.url)) {
            //팝업일경우
            if ($("div#popupContents").filter(":visible").length > 0) {
                var blockOverlayCss = {
                        "background-color" : "#FFFFFF",
                        "position" : "absolute",
                        "left" : "0px",
                        "top" : "0px",
                        "cursor" : "wait",
                        "opacity" : 0.6,
                        "height" : "100%",
                        "width" : "100%"
                };

                $("div#popupContents").filter(":visible").each(function() {
                    this.overlay = $('<div class="popupContentsBlock" onselectstart="return false;" align="center"><table height="80%"><tr><td height="80% valign="middle"><img src="/js/cvcaf/images/popup-ajax-loader.gif"></td></tr></table></div>');
                    blockOverlayCss["margin-top"] = $(this).prev("h1").outerHeight();
                    this.overlay.css(blockOverlayCss);
                    this.overlay.css("z-index", Number($(this).css("z-index")) + 1);
                    $(this).append(this.overlay);
                    this.overlay = null;
                });

                blockOverlayCss = null;
            //일반적인경우
            } else {
                if($("#ajaxLoadingBar").size() > 0) {
                    $("#ajaxLoadingBar").fadeIn(200);
                    $(Config.pageContext + " [id^='btn_']:visible").each(function() {
                        if (this.disable != null){this.disable();}
                    });
                } else {
                    if($(Config.pageContext).size() > 0) {
                        //ajax 요청마다 실행되므로 반드시 넣어야 함. Off 는 마지막에 한번만 실행됨.
                        if($("div[id='contentsBlock']").size() == 0) {
                            //메뉴링크, 버튼 비활성
                            $("a").bindFirst("click.preventDoubleSubmitOn", SystemUtils.disableLink);

                            var lnbWidth = $("#lnb_wrap").is(":visible") ? 200 : 0;
                            var zIndex = LayerUtils.getMaxZIndex($(Config.pageContext + " div, " + Config.pageContext + " span")) + 1;
                            var height = $(window.document).height() - 173;
                            var blockOverlayCss = {
                                "background-color" : "#FFFFFF",
                                "left" : $(Config.pageContext).offset().left + "px",
                                "top" : $(Config.pageContext).offset().top + "px",
                                "cursor" : "wait",
                                "opacity" : 0,
                                "height" : height + "px",
                                "width" : $(window).width() - lnbWidth + "px",
                                "z-index" : zIndex
                            };

                            var overlay = $('<div id="contentsBlock" class="popupContentsBlock" onselectstart="return false;" align="center" style="position: absolute;"></div>');
                            overlay.css(blockOverlayCss);
                            $(Config.pageContext).append(overlay);
                            $(Config.pageContext).append('<img class="popupContentsBlock" src="/js/cvcaf/images/popup-ajax-loader.gif" style="opacity: 0.9; position: fixed; top: ' + $(window).height() / 2 + 'px; right: ' + ($(window).width() - lnbWidth) / 2 + 'px;">');
                            overlay = null;

                            zIndex = null;
                            blockOverlayCss = null;
                            height = null;
                        }
                    }
                }
            }
        }
    },
    /**
     * 서버요청이 끝날때 처리.
     */
    preventDoubleSubmitOff : function(options) {
    	if($("#ajaxLoadingBar:visible").size() > 0) {
    	    $("#ajaxLoadingBar").fadeOut(300, function() {
            	//메뉴링크, 버튼 활성
                $("a").unbind("click.preventDoubleSubmitOn", SystemUtils.disableLink);
            });
            $(Config.pageContext + " [id^='btn_']:visible").each(function() {
                if (this.enable != null){this.enable();}
            });
        } else {
        	if ($(".popupContentsBlock").length > 0) {
                $(".popupContentsBlock").css("cursor", "auto");
                $(".popupContentsBlock").fadeOut(300, function() {
                	$(this).remove();
                	//메뉴링크, 버튼 활성
                    $("a").unbind("click.preventDoubleSubmitOn", SystemUtils.disableLink);
                });
            }
        }
    },
    /**
     * FormExtender 의 대상폼의 enctype 이 text/plain 으로 지정된 폼들만 처리할건지 enctype 에 상관없이 모두 처리한건지 설정.
     */
    formExtenderRestrictEnctype : false,
    /**
     * 비동기 Ajax 요청시 페이지 URL 변경 체크 유무,
     * true 이면 서버응답이 오기전에 페이지의 URL이 변경되면 요청시 지정한 successCallBack 을 실행하지 않음.
     */
    communicatorAsyncUrlCheck : true,
    /**
     * 서버 에러 발생시 에러메시지 전역 처리
     * @param errorMsg
     */
    getErrorMessage : function(errorMsg) {
        if(StringUtils.trimToEmpty(errorMsg).split("\n").length > 2) {
            MessageUtils.show(StringUtils.trimToEmpty(errorMsg).split("\n")[2]);
        } else {
            MessageUtils.show(errorMsg);
        }
    },
    /**
     * 예약된 action URL 의 접두어 naming rule
     */
    reservedActionPrefix : {
        CREATE : "save",
        READ : "find",
        UPDATE : "save",
        DELETE : "save"
    },
    /**
     * CVCAF Request Filter
     */
    globalRequestFilter : {
        pre : function(Controller) {
        	//!- pgmId, menuId, rTk 자동처리
            var pageInfo = GlobalServiceController.getPageInfo();
            if(pageInfo != null && !Config.excludePreventDoubleSubmit(Controller.action)) {
                var actionParams = StringUtils.trimToEmpty(Controller.action.slice(Controller.action.indexOf("?") + 1));
                if(actionParams != Controller.action) {
                	if(actionParams.indexOf("menuId=") < 0) {
                        Controller.action += "&menuId=" + pageInfo.menuId;
                    }
                    if(actionParams.indexOf("pgmId=") < 0 && typeof pageInfo.pgmId != "undefined") {
                        Controller.action += "&pgmId=" + pageInfo.pgmId;
                    }
                    if(actionParams.indexOf("rTk=") < 0) {
                        Controller.action += "&rTk=" + pageInfo.rTk;
                    }
                } else {
                	Controller.action += "?menuId=" + pageInfo.menuId ;
                	if(typeof pageInfo.pgmId != "undefined") {
                		Controller.action += "&pgmId=" + pageInfo.pgmId;
                	}
                	Controller.action += "&rTk=" + pageInfo.rTk;
                }
                actionParams = null;
            }
            pageInfo = null;
            //-- pgmId, menuId, rTk 자동처리
        },
        error : function(xhr, textStatus, data, options) {

        },
        post : function(data, textStatus, xhr, options) {

        },
        after : function(xhr, textStatus, errorMsg, options) {
        	if(StringUtils.trimToNull(errorMsg) != null) {
        		Config.getErrorMessage(errorMsg);
        	}
        }
    },
    /**
     * Controller target Request Filter
     */
    controllerTargetFilter : {
        pre : function(request) {

        },
        post : function(request) {

        }
    },
    /**
     * ServiceControllerTemplate 활성화 여부,
     * ServiceControllerTemplate에관한 내용은 ServiceControllerTemplate 주석 참조
     */
    ServiceControllerTemplateUse : false,
    /**
     * ServiceController 구조를 커스터마이징 하기위한 클래스 지정
     * 구현된 클래스에는 반드시 init(ServiceController) 메서드를 만들어줘야 함.
     * ServiceController.init을 호출하기전 자동으로 [지정된클래스].init(ServiceController) 가 호출됨.
     */
    ServiceControllerTemplate : function() {
    	return DefaultServiceControllerTemplate;
    }
};