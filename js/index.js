(function(window, N) {

    var IndexController = {
        docs : null,
        init : function(initPageId) {
            this.mobileResponsiveView();
            this.setLocale();
            if(initPageId) {
                this.loadPageForSEO(initPageId);
            } else {
                this.loadHeader();
                this.loadLefter();
                this.loadFooter();
            }
            this.reloadCss();
            this.initBrowserHistorySystem();
            if(location.hostname === "bbalganjjm.github.io") {
                this.googleAnalytics();
            }
        },
        loadPageForSEO : function(initPageId) {
            N("body").css("padding", "30px");
            N('<a href="./"><span>Go Home(https://bbalganjjm.github.io/natural_js/)</span></a>').css({
                "padding": "0 0 5px 0",
                "margin": "0 0 35px 0",
                "display": "block",
                "font-size": "20px",
                "border-bottom": "3px double var(--md-sys-color-outline)"
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
        initBrowserHistorySystem : function() {
            var self = this;
            $(window).on("hashchange.index", function() {
                if(self.docs) {
                    if (!N.string.isEmpty(location.hash)
                        && (N.string.endsWith(location.hash, ".html") || N.string.endsWith(location.hash, ".view"))) {
                        var url = location.hash.replace("#", "");
                        var selectedMenuEle = N(".index-lefter.view_context__ a[href='" + url + "']");
                        var docId = selectedMenuEle.find("span:last").text();
                        if(self.docs.options.order[0] !== docId) {
                            self.docs.add(selectedMenuEle.data("pageid"), docId, {
                                "url" : url
                            });
                        }
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
            N("html").attr("lang", N.locale().substring(0, 2));
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
                window.dataLayer = window.dataLayer || [];
                window.gtag = function(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', 'G-GL64Q27TWZ', {
                    'page_title' : 'Home',
                    'page_location' : location.href,
                    'page_path': location.hash,
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
        webFont : function(locale) {
            // 웹 폰트
            var fontFamily = "Lato:300,400,600";
            if(locale == "en") {
                fontFamily = "Lato:400,600";
            }
            WebFont.load({
                google: {
                   families: [fontFamily]
                }
            });
        },
        mobileResponsiveView : function() {
            // API 문서 모바일 용 보기 처리 이벤트
            N(window).on("resize.mobile", function(e, view) {

                if (e.target == window || view) { // 모바일에서 scroll 시 resize 이벤트가 실행되서(ios, android 동일).

                    if(view === undefined) {
                        view = N(".view-mobile-layout").filter(":visible");
                    }

                    if(!view) {
                        return false;
                    }
                    if(!view.hasClass("view-mobile-layout")) {
                        return false;
                    }

                    N(".agrsIndex", view).remove();
                    N(".function-desc", view).removeClass("function-desc");

                    if(N(window).width() <= 751 || view.hasClass("api-view-list-type")) { // 768 - 17px(?)
                        N("td:contains('N/A')", view).css({
                            "visibility": "hidden",
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
                            N(this).find(">td:eq(1)").prepend('<strong class="agrsIndex">[' + idx + '] : </strong>');
                            idx++;
                        });
                    } else {
                        N("tr .function-desc", view).removeClass("function-desc");
                        N("tr .agrsIndex", view).remove();

                        N("td:contains('N/A')", view).css({
                            "visibility": "",
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
