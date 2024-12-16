(function(window, N) {

    var IndexController = {
        docs : null,
        init : function(initPageId) {
            this.mobileResponsiveView();
            this.setLocale();
            if(initPageId) {
                this.loadPageForSEO(initPageId);
            } else {
                this.loadLefter();
                this.loadHeader();
                this.loadFooter();
            }
            this.reloadCss();
            this.initRouter();
            if(location.hostname === "bbalganjjm.github.io") {
                this.googleAnalytics();
            }
        },
        loadPageForSEO : function(initPageId) {
            N("body").css("padding", "30px");
            N('<a href="./"><span>Go Home(https://bbalganjjm.github.io/natural_js/)</span></a>').css({
                "padding": "0 0 7px 0",
                "margin": "0 0 35px 0",
                "display": "block",
                "font-size": "var(--njs-font-size-xl)",
                "border-bottom": "3px double var(--md-sys-color-outline-variant)"
            }).prependTo("body");
            N(".page-wrap").comm({
                url : initPageId
            }).submit();
        },
        loadHeader : function() {
            N("header").comm("html/com/app/comm/index/header.html").submit();
        },
        loadLefter : function() {
            N(".main-nav").comm("html/com/app/comm/index/lefter.html").submit(function () {
                APP.indx.loadBody();
            });
        },
        loadBody : function() {
            N(".main-contents").comm("html/com/app/comm/index/contents.html").submit();
        },
        loadFooter : function() {
            N("footer").comm("html/com/app/comm/index/footer.html").submit();
        },
        initRouter : function() {
            var self = this;

            var tabSelector = function(state) {
                var tabInst = APP.indx.docs.context(".docs_contents__." + state.pageId + "__ .tab__:eq(0)").instance("tab");
                if(tabInst) {
                    if(!N.string.isEmpty(state["tab"])) {
                        var openedTabEle = tabInst.options.links.filter(":regexp(data-opts, " + state["tab"] + ")");
                        if(openedTabEle.length > 0 && !openedTabEle.is(".tab_active__")) {
                            tabInst.isPopstate = true;
                            tabInst.open(tabInst.options.links.index(openedTabEle));
                        }
                    } else {
                        if(!tabInst.isFirstOpened) {
                            tabInst.isPopstate = false;
                        } else {
                            tabInst.isPopstate = true;
                        }
                        tabInst.open(0);
                        tabInst.isFirstOpened = true;
                    }
                }
            };

            $(window).on("popstate.index", function(e, state) {
                if(!N.isEmptyObject(e.originalEvent)) {
                    state = e.originalEvent.state;
                }
                if(!N.isEmptyObject(state) && !N.string.isEmpty(state.page)) {
                    var url = state.page;
                    if(self.docs.options.order[0] !== state.pageId) {
                        self.docs.isPopstate = true;
                        self.docs.add(state.pageId, state.pageNm, {
                            "url": url,
                            "onLoad": function () {
                                tabSelector(state);
                            }
                        });
                    } else {
                        tabSelector(state);
                    }
                } else {
                    if(N.string.isEmpty(location.hash)) {
                        self.docs.isPopstate = true;
                        self.docs.add("home0100", "Home", {
                            "url" : "html/naturaljs/home/home0100.html"
                        });
                    }
                }
            });
        },
        reloadCss : function() {
            if(!window.localStorage.themeColor || window.localStorage.themeColor === "undefined") {
                window.localStorage.themeColor = "green";
            }

            if(window.localStorage.themeColor !== "green") {
                $("head > link[rel=stylesheet]").each(function() {
                    var cssUrl = $(this).attr("href");
                    if(!N.string.startsWith(cssUrl, "http")) {
                        N.comm({
                            url : cssUrl,
                            contentType : "text/css",
                            dataType : "html",
                            type : "GET"
                        }).submit(function(data) {
                            $('<style type="text/css">\n' + data + '</style>').appendTo("head");
                        });
                    }
                });
            }
        },
        setLocale : function() {
            N.locale(window.sessionStorage.locale !== undefined ? window.sessionStorage.locale : IndexController.getLocale().toLowerCase().indexOf("ko") > -1 ? "ko_KR" : "en_US");
            // N("html").attr("lang", N.locale().substring(0, 2)); // 이게 있으면 md-icon 그림이 안나옴.
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
                if (N("head .ko.hidden").length === 0) {
                    $( "<style class='ko hidden'>[lang='ko_KR'] { display: revert-layer !important; }</style>" ).appendTo( "head" )
                }
                $("[lang='en_US']", view).remove();
            } else if(locale === "en_US") {
                if (N("head .en.hidden").length === 0) {
                    $( "<style class='en hidden'>[lang='en_US'] { display: revert-layer !important; }</style>" ).appendTo( "head" )
                }
                $("[lang='ko_KR']", view).remove();
            }
        },
        /**
         * Google Analytics
         */
        googleAnalytics : function() {
            if(N.browser.msieVersion() === 0 || N.browser.msieVersion() > 9) {
                window.dataLayer = window.dataLayer || [];
                window.gtag = function(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', 'G-GL64Q27TWZ', {
                    'page_title' : 'Home',
                    'page_location' : location.href,
                    'page_path': location.search,
                    'send_page_view': true
                });
            }
        },
        /**
         * Google Analytics
         */
        googleAnalyticsGa3 : function() {
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
                var windowWith = N(window).width();

                if (e.target == window || view) { // 모바일에서 scroll 시 resize 이벤트가 실행되서(ios, android 동일).
                    if(view === undefined) {
                        view = N(".apiDoc").filter(":visible");
                    }
                    if(!view) {
                        return false;
                    }

                    N(".agrsIndex", view).remove();
                    N(".function-desc", view).removeClass("function-desc");

                    if(windowWith <= 731 || view.hasClass("api-view-list-type")) { // 748 - 17px(?)
                        view.addClass("api-view-list-type");

                        N("td:contains('N/A'), td:empty", view).css({
                            "display": "none",
                            "padding" : 0,
                            "margin" : 0,
                            "height" : 0,
                            "line-height" : 0
                        });

                        var idx = -1;
                        N("tr", view).each(function() {
                            var selfEle = N(this);
                            if(N(this).find(">td:eq(0)").text().length > 0) {
                                idx = -1;
                                N(this).find(">td:eq(0)").siblings("td").addClass("function-desc");
                            }
                            if (idx > -1) {
                                N(this).find(">td:eq(1)").prepend('<strong class="agrsIndex">[' + idx + '] : </strong>');
                            }
                            idx++;
                        });

                        N(".api-view-list-type p, .api-view-list-type pre").css("max-width", windowWith - 72);
                    } else {
                        N("tr .function-desc", view).removeClass("function-desc");
                        N("tr .agrsIndex", view).remove();

                        N("td:contains('N/A'), td:empty", view).css({
                            "display": "",
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
