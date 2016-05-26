var IndexController = {
	init : function(window) {
		this.setLocale();
		this.googleAnalytics();
		this.loadHeader();
		this.loadBodySection();
		this.loadFooter();
		this.notice();
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
		N("header").comm("html/indx/header.html").submit();

		N("h2#desc").one("dblclick", function(){
			var sorryCnt=0;
			var sorryArea = N("#natural-js-logo").parent();
			var time = setInterval(function() {
			   sorryCnt++;
			   sorryArea.html("<span style='font-size: 72px; line-height: 100px'>그때 그런 만행을 저질러<br>" + String(sorryCnt) + " 번 사죄 합니다.</span>");
			   if(sorryCnt > 9999) {
			      clearInterval(time);
			   }
			}, 10000);
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
			N(N.context.attr("architecture").page.context).comm("html/gtst/gtst0100.html").submit(function() {
				// Google Analytics
				if(N.browser.msieVersion() === 0 || N.browser.msieVersion() > 9) {
					ga('create', 'UA-58001949-2', 'auto');
					ga('send', {
						'hitType': 'pageview',
						'page': '#gtst/gtst0100'
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
					msg.push("영문 번역 중입니다.");
					msg.push("쪽팔림을 무릅쓰고 번역기 돌려가면서 콩글리시로 번역하고 있습니다.");
					msg.push("도움 주실분은 GitHub 의 gh-pages 브랜치에 소스가 올라가 있으니 동참 해 주시면 감사 하겠습니다.");
					msg.push("기타 문의사항은 bbalganjjm@gmail.com 으로 문의 바랍니다.");
					msg.push('[<a id="korean" href="#" class="link">한국어</a>] | [<a id="english" href="#" class="link">영어</a>]');
				} else {
					msg.push("Translation work is in progress.");
					msg.push("I don't speak English well. Please understand.");
					msg.push('[<a id="korean" href="#" class="link">KOREAN</a>] | [<a id="english" href="#" class="link">ENGLISH</a>]');
				}
				var noticeBox = $("section>article").prepend('<p id="notice" class="alert" style="display: none;">' + msg.join(" ") + '</p>').find("#notice").slideDown(300);
				noticeBox.find("#korean").click(function(e) {
					e.preventDefault();
					window.sessionStorage.locale = "ko_KR";
					window.location.reload();
				});
				noticeBox.find("#english").click(function(e) {
					e.preventDefault();
					window.sessionStorage.locale = "en_US";
					window.location.reload();
				});
			}, 1500);
		}
	}
};

var CommonUtilController = {
    setPageLinks : function(eles) {
		N(eles).click(function(e) {
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