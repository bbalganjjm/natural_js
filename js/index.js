var IndexController = {
	init : function(window) {
		this.loadWebFont();
		this.setLocale();
		this.googleAnalytics();
		this.loadHeader();
		this.loadBodySection();
		this.loadFooter();
		if(N.locale() === "en_US") {
			this.notice();
		}
	},
	/**
	 * 웹폰트
	 */
	loadWebFont : function() {
		WebFontConfig = {
			custom: {
				families: ['Nanum Gothic Coding'],
				urls: ['http://fonts.googleapis.com/earlyaccess/nanumgothiccoding.css']
			}
		};
		(function() {
			var wf = document.createElement('script');
			wf.src = ('https:' == document.location.protocol ? 'https' : 'http') +
				'://ajax.googleapis.com/ajax/libs/webfont/1.4.10/webfont.js';
			wf.type = 'text/javascript';
			wf.async = 'true';
			var s = document.getElementsByTagName('script')[0];
			s.parentNode.insertBefore(wf, s);
		})();
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
	setLocale : function() {
		N.locale(window.sessionStorage.locale !== undefined ? window.sessionStorage.locale : CommonUtilController.getLocale().toLowerCase().indexOf("ko") > -1 ? "ko_KR" : "en_US");
	},
	loadHeader : function() {
		N("header").comm("html/indx/header.html").submit(function() {
			var i18nButtons = $("#__header #i18nButtons");
			i18nButtons.find("#korean").click(function(e) {
				e.preventDefault();
				window.sessionStorage.locale = "ko_KR";
				window.location.reload();
			});
			i18nButtons.find("#english").click(function(e) {
				e.preventDefault();
				window.sessionStorage.locale = "en_US";
				window.location.reload();
			});
		});
	},
	loadBodySection : function() {
		if(N.string.trimToNull(location.hash) !== null) {
			N(N.context.attr("architecture").page.context).comm("html/" + N.string.trimToEmpty(location.hash).replace("#", "") + ".html").submit(function() {
				// Google Analytics
				if(N.browser.msieVersion() === 0 || N.browser.msieVersion() > 9) {
					ga('create', 'UA-58001949-2', 'auto');
					ga('send', {
						'hitType': 'pageview',
						'page': location.hash
					});
				}
			});
		} else {
			N(N.context.attr("architecture").page.context).comm("html/home/home0100.html").submit(function() {
				// Google Analytics
				if(N.browser.msieVersion() === 0 || N.browser.msieVersion() > 9) {
					ga('create', 'UA-58001949-2', 'auto');
					ga('send', {
						'hitType': 'pageview',
						'page': '#home/home0100'
					});
				}
			});
		}
	},
	loadFooter : function() {
		N("footer").comm("html/indx/footer.html").submit();
	},
	notice : function() {
		if(N.string.isEmpty(location.hash)) {
			var msg = [];
			setTimeout(function() {
				if(N.locale() === "ko_KR") {
					msg.push("공지사항.");
				} else {
					msg.push("i'm working on translate to english but i don't speak english well. please understand.");
				}
				$("section>article").prepend('<p id="notice" class="alert" style="display: none;">' + msg.join(" ") + '</p>').find("#notice").slideDown(300);
			}, 1000);
		}
	}
};

var CommonUtilController = {
    setPageLinks : function(eles) {
		N(eles).bind("click touchstart", function(e) {
			var href = N(this).attr("href");
			if(N.string.trimToEmpty(href).indexOf("#") < 0
					&& N.string.trimToEmpty(href).indexOf(".html") > -1
					&& N.string.trimToNull(href) !== null) {
				e.preventDefault();
				var hash_ = href.replace("http://bbalganjjm.github.io/natural_js/", "").replace(/\.html/g, "").replace(/html\//g, "");
				N(N.context.attr("architecture").page.context).comm(href).submit(function() {
					// Google Analytics
					if(N.browser.msieVersion() === 0 || N.browser.msieVersion() > 9) {
						ga('create', 'UA-58001949-2', 'auto');
						ga('send',  {
							'hitType': 'pageview',
							'page': "#" + hash_
						});
					}
				});
				location.hash = hash_;
			}
		});
	},
	sourceCode : function(view, url) {
		var btnEle = N('<a class="click">View Source Code</a>');
		if(view.find(btnEle).length === 0) {
			view.append(btnEle);
			view.append('<pre id="sourceCodeBox" class="line-numbers" style="display: none;"><code id="sourceCode" class="language-markup"></code></pre>');
			btnEle.click(function() {
				var sourceCodeBox = btnEle.next("#sourceCodeBox");
				if(!sourceCodeBox.is(":visible")) {
					sourceCodeBox.slideDown();
				} else {
					sourceCodeBox.slideUp();
				}
			});
	    	N.comm({
	       		url : url,
	       		contentType : "text/plain; charset=UTF-8",
				dataType : "text",
				type : "GET"
	       	}).submit(function(html) {
	       		N("#sourceCode", view).text(html);

	       		// code highlight
	       		if(N.browser.msieVersion() === 0 || N.browser.msieVersion() > 8) {
	       			view.find("code").each(function() {
	       				Prism.highlightElement(this);
	       			});
	       		}
	       	});
		}
	},
	getLocale : function() {
		 if (navigator) {
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
	}
};