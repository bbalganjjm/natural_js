var IndexController = {
	docs : null,
	init : function(window) {
		this.setLocale();
		//this.loadWebFont();
		this.loadHeader();
		this.loadFooter();
		this.docs = $("#docsContainer__").docs({
			entireLoadScreenBlock : false
		});
		if(location.hostname === "bbalganjjm.github.io") {
			this.googleAnalytics();
		}
		if(N.locale() === "en_US") {
			// this.notice();
		}
	},
	/**
	 * 웹폰트
	 */
	loadWebFont : function() {
		WebFontConfig = {
			custom: {
				families: ['Noto Sans KR'],
				urls: ['http://fonts.googleapis.com/earlyaccess/notosanskr.css']
			}
		};
		(function(d) {
			var wf = d.createElement('script'), s = d.scripts[0];
			wf.src = 'https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js';
			wf.async = true;
			s.parentNode.insertBefore(wf, s);
		})(document);
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
			var i18nButtons = $(".header #i18nButtons");
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

			setTimeout(function() {
				IndexController.loadBodySection();
			}, 0);
		});
	},
	loadBodySection : function() {
		var docId;
		var docNm;
		var url;
		if(N.string.trimToNull(location.hash) !== null) {
			var fileName = N.string.trimToEmpty(location.hash).replace("#", "").split("/");
			fileName = fileName[0] + "/" + fileName[1];
			docId = fileName.substring(fileName.indexOf("/") + 1);
			docNm = $(".header > nav > ul a[href='" + "html/" + fileName + ".html']").text();
			url = "html/" + fileName + ".html";
		} else {
			var docId = "home0100";
			var docNm = "Home";
			var url = "html/home/home0100.html";
		}

		this.docs.add(docId, docNm, {
			"url" : url
		});
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
		N(eles).bind("click", function(e) {
			var href = N(this).attr("href");
			var text = N(this).text();
			if(N.string.trimToEmpty(href).indexOf("#") < 0
					&& N.string.trimToEmpty(href).indexOf("www.") < 0
					&& N.string.trimToEmpty(href).indexOf(".html") > -1
					&& N.string.trimToNull(href) !== null) {
				e.preventDefault();

				var hash_ = href.replace("http://bbalganjjm.github.io/natural_js/", "").replace(/\.html/g, "").replace(/html\//g, "");
				location.hash = hash_;
				var docId = hash_.substring(hash_.indexOf("/") + 1);
				IndexController.docs.add(docId, text, {
					url : href
					/*
					,
					"onBeforeLoad" : function(docId, target) {
						N.log("L_onBeforeLoad", this, docId, target);
					},
					"onLoad" : function(docId, cont) {
						N.log("L_onLoad", this, docId, cont);
					},
					"onBeforeActive" : function(docId, isFromDocsTabList, isNotLoaded) {
						N.log("L_onBeforeActive", this, docId, isFromDocsTabList, isNotLoaded);
					},
					"onActive" : function(docId, isFromDocsTabList, isNotLoaded) {
						N.log("L_onActive", this, docId, isFromDocsTabList, isNotLoaded);
					},
					"onBeforeInactive" : function(docId) {
						N.log("L_onBeforeInactive", this, docId);
					},
					"onInactive" : function(docId) {
						N.log("L_onInactive", this, docId);
					},
					"onBeforeRemoveState" : function(docId) {
						N.log("L_onBeforeRemoveState", this, docId);
					},
					"onRemoveState" : function(docId) {
						N.log("L_onRemoveState", this, docId);
					},
					"onBeforeRemove" : function(docId) {
						N.log("L_onBeforeRemove", this, docId);
					},
					"onRemove" : function(docId) {
						N.log("L_onRemove", this, docId);
					}
					*/
				});
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