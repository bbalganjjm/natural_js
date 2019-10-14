(function(window, N) {

    var IndexController = {
        docs : null,
        init : function() {
            this.mobileResponsiveView();
        	this.setLocale();
            this.loadHeader();
            this.loadLefter();
            this.loadBody();
            this.loadFooter();
            this.reloadCss();
            this.initBrowserHistorySystem();
            if(location.hostname === "bbalganjjm.github.io") {
                this.googleAnalytics();
            }
        },
        loadHeader : function() {
            N("header").comm("html/com/app/comm/index/header.html").submit();
        },
        loadLefter : function() {
            N(".main-nav").comm("html/com/app/comm/index/lefter.html").submit();
        },
        loadBody : function() {
            N(".main-contents").comm("html/com/app/comm/index/contents.html").submit();
        },
        loadFooter : function() {
            N("footer").comm("html/com/app/comm/index/footer.html").submit();
        },
        initBrowserHistorySystem : function() {
            var self = this;
            $(window).on("hashchange.index", function() {
                var docId, docNm, url;
                if (N.string.trim(location.hash).length === 0) {
                    docId = "home0100";
                    docNm = "Home";

                    url = "html/naturaljs/" + docId.substring(0, 4) + "/" + docId + ".html";
                }

                if ((docId === "home0100" || N.string.trim(location.hash).length > 35) && !N.string.endsWith(location.href, "#")) {
                    var menuInfoStr = "";
                    var menuInfo = "";
                    try {
                        menuInfoStr = location.hash.replace("#", "");
                        menuInfo = decodeURIComponent(atob(menuInfoStr)).split("$");
                    } catch(e) {
                        N.warn(e);
                    };

                    if (menuInfo.length > 1) {
                        if(!N.string.isEmpty(menuInfo[0])) {
                            docId = menuInfo[0];
                        }
                        if(!N.string.isEmpty(menuInfo[1])) {
                            docNm = menuInfo[1];
                        }

                        // FIXME 메뉴 DB 만들어 지고 페이지 불러오는 서비스 만들어지면 아래 url 수정 해서 살리고 url = menuInfo[2]; 는 제거 바람.
                        // url = "html/com/app/sample/" + docId + ".html";
                        if(menuInfo[2]) {
                            url = menuInfo[2];
                        }
                    }

                    if(self.docs) {
                        if(self.docs.options.order[0] !== docId) {
                            // N.docs MDI 탭 닫을 때 페이지에서 사용된 라이브러리 제거
                            var onRemove;
                            if(docId === "documents") {
                                onRemove = function(docId) {
                                    showdown = undefined;
                                }
                            }

                            self.docs.add(docId, docNm, {
                                "url" : url,
                                "onRemove" : onRemove
                            });
                        }
                    }
                }

            });
        },
        "colorPalette" : {
            red : ["#FFEBEE", "#FFCDD2", "#EF9A9A", "#E57373", "EF5350", "#F44336", "#E53935", "#D32F2F", "#C62828", "#B71C1C", "#FF8A80", "#FF5252", "#FF1744", "#D50000"],
            pink : ["#FCE4EC", "#F8BBD0", "#F48FB1", "#F06292", "EC407A", "#E91E63", "#D81B60", "#C2185B", "#AD1457", "#880E4F", "#FF80AB", "#FF4081", "#F50057", "#C51162"],
            purple : ["#F3E5F5", "#E1BEE7", "#CE93D8", "#BA68C8", "AB47BC", "#9C27B0", "#8E24AA", "#7B1FA2", "#6A1B9A", "#4A148C", "#EA80FC", "#EA80FC", "#D500F9", "#AA00FF"],
            deepPurple : ["#EDE7F6", "#D1C4E9", "#B39DDB", "#9575CD", "#7E57C2", "#673AB7", "#5E35B1", "#512DA8", "#4527A0", "#311B92", "#B388FF", "#7C4DFF", "#651FFF", "#6200EA"],
            indigo : ["#E8EAF6", "#C5CAE9", "#9FA8DA", "#7986CB", "#5C6BC0", "#3F51B5", "#3949AB", "#303F9F", "#283593", "#1A237E", "#8C9EFF", "#536DFE", "#3D5AFE", "#304FFE"],
            blue : ["#E3F2FD", "#BBDEFB", "#90CAF9", "#64B5F6", "#42A5F5", "#2196F3", "#1E88E5", "#1976D2", "#1565C0", "#0D47A1", "#82B1FF", "#448AFF", "#2979FF", "#2962FF"],
            lightBlue : ["#E1F5FE", "#B3E5FC", "#81D4FA", "#4FC3F7", "#29B6F6", "#03A9F4", "#039BE5", "#0288D1", "#0277BD", "#01579B", "#80D8FF", "#40C4FF", "#00B0FF", "#0091EA"],
            cyan : ["#E0F7FA", "#B2EBF2", "#80DEEA", "#4DD0E1", "#26C6DA", "#00BCD4", "#00ACC1", "#0097A7", "#00838F", "#006064", "#84FFFF", "#18FFFF", "#00E5FF", "#00B8D4"],
            teal : ["#E0F2F1", "#B2DFDB", "#80CBC4", "#4DB6AC", "#26A69A", "#009688", "#00897B", "#00796B", "#00695C", "#004D40", "#A7FFEB", "#64FFDA", "#1DE9B6", "#00BFA5"],
            green : ["#E8F5E9", "#C8E6C9", "#A5D6A7", "#81C784", "#66BB6A", "#4CAF50", "#43A047", "#388E3C", "#2E7D32", "#1B5E20", "#B9F6CA", "#69F0AE", "#00E676", "#00C853"],
            lightGreen : ["#F1F8E9", "#DCEDC8", "#C5E1A5", "#AED581", "#9CCC65", "#8BC34A", "#7CB342", "#689F38", "#558B2F", "#33691E", "#CCFF90", "#B2FF59", "#76FF03", "#64DD17"],
            lime : ["#F9FBE7", "#F0F4C3", "#E6EE9C", "#DCE775", "#D4E157", "#CDDC39", "#C0CA33", "#AFB42B", "#9E9D24", "#827717", "#F4FF81", "#EEFF41", "#C6FF00", "#AEEA00"],
            yellow : ["#FFFDE7", "#FFF9C4", "#FFF59D", "#FFF176", "#FFEE58", "#FFEB3B", "#FDD835", "#FBC02D", "#F9A825", "#F57F17", "#FFFF8D", "#FFFF00", "#FFEA00", "#FFD600"],
            amber : ["#FFF8E1", "#FFECB3", "#FFE082", "#FFD54F", "#FFCA28", "#FFC107", "#FFB300", "#FFA000", "#FF8F00", "#FF6F00", "#FFE57F", "#FFD740", "#FFC400", "#FFAB00"],
            orange : ["#FFF3E0", "#FFE0B2", "#FFCC80", "#FFB74D", "#FFA726", "#FF9800", "#FB8C00", "#F57C00", "#EF6C00", "#E65100", "#FFD180", "#FFAB40", "#FF9100", "#FF6D00"],
            deepOrange : ["#FBE9E7", "#FFCCBC", "#FFAB91", "#FF8A65", "#FF7043", "#FF5722", "#F4511E", "#E64A19", "#D84315", "#BF360C", "#FF9E80", "#FF6E40", "#FF3D00", "#DD2C00"],
            brown : ["#EFEBE9", "#D7CCC8", "#BCAAA4", "#A1887F", "#8D6E63", "#795548", "#6D4C41", "#5D4037", "#4E342E", "#3E2723", "", "", "", ""],
            grey : ["#FAFAFA", "#F5F5F5", "#EEEEEE", "#E0E0E0", "#BDBDBD", "#9E9E9E", "#757575", "#616161", "#424242", "#212121", "", "", "", ""],
            blueGrey : ["#ECEFF1", "#CFD8DC", "#B0BEC5", "#90A4AE", "#78909C", "#607D8B", "#546E7A", "#455A64", "#37474F", "#263238", "", "", "", ""] // ,
            // blackWhite : ["#000000", "#000000", "#000000", "#000000", "#FFFFFF", "#FFFFFF", "#FFFFFF", "#FFFFFF", "#FFFFFF", "#FFFFFF", "", "", "", ""]
        },
        reloadCss : function() {
        	if(!window.localStorage.themeColor || window.localStorage.themeColor === "undefined") {
    			window.localStorage.themeColor = "green";
    		}

            if(window.localStorage.themeColor !== "green") {
                $("head > link[rel=stylesheet]").each(function() {
                    N.comm({
                        url : $(this).attr("href"),
                        contentType : "text/css",
                        dataType : "html",
                        type : "GET"
                    }).submit(function(data) {
                        $('<style type="text/css">\n' + data + '</style>').appendTo("head");
                    });
                });
            }
        },
        setLocale : function() {
    		N.locale(window.sessionStorage.locale !== undefined ? window.sessionStorage.locale : IndexController.getLocale().toLowerCase().indexOf("ko") > -1 ? "ko_KR" : "en_US");
    	},
        getLocale : function() {
        	if(navigator) {
	   			if (navigator.language) {
	   				return navigator.language;
	   			} else if (navigator.browserLanguage) {
	   				return navigator.browserLanguage;
	   			} else if (navigator.systemLanguage) {
	   				return navigator.systemLanguage;
	   			} else if (navigator.userLanguage) {
	   				return navigator.userLanguage;
	   			}
	   		}
	   	},
        i18n : function(locale, view) {
    		if(locale === undefined) {
    			locale = N.locale();
    		}
    		if(locale === "ko_KR") {
        		$("[lang='ko_KR']", view).show();
    			$("[lang='en_US']", view).remove();
    		} else {
    			$("[lang='en_US']", view).show();
    			$("[lang='ko_KR']", view).remove();
    		}
    	},
    	/**
         * Google Analytics
         */
        googleAnalytics : function() {
            if(N.browser.msieVersion() === 0 || N.browser.msieVersion() > 9) {
                (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
                (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
                m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
                })(window,document,'script','//www.google-analytics.com/analytics.js','ga');
            }
        },
        mobileResponsiveView : function() {

            // API 문서 모바일 용 보기 처리 이벤트
            N(window).on("resize.mobile", function(e, view) {

        		if ($(e.target).is(window) || view) { // 모바일에서 scroll 시 resize 이벤트가 firing 되서(ios, android 동일).

                    N(".agrsIndex", view).remove();
                    N(".function-desc", view).removeClass("function-desc");

                    if($(window).width() <= 414) {
                        $("td:contains('N/A')", view).css({
                            "visibility": "hidden",
                            "padding" : 0,
                            "margin" : 0,
                            "height" : 0,
                            "line-height" : 0
                        });

                        var idx = -1;
                        $("tr", view).each(function() {
                            if($(this).find(">td:eq(0)").text().length > 0) {
                                idx = -1;
                                $(this).find(">td:eq(0)").siblings("td").addClass("function-desc");
                            }
                            $(this).find(">td:eq(1)").prepend('<strong class="agrsIndex">[' + idx + '] : </strong>');
                            idx++;
                        });

                    } else {
                        $("td:contains('N/A')", view).css({
                            "visibility": "visible",
                            "padding" : "",
                            "margin" : "",
                            "height" : "",
                            "line-height" : ""
                        });
                    }

        		}

            });

        }
    };

    if (!window.APP) {
        window.APP = {};
    }
    window.APP.indx = IndexController;

})(window, N);
