var IndexController = {
	docs : null,
	init : function(window) {
		this.setLocale();
		if(!window.localStorage.themeColor || window.localStorage.themeColor === "undefined") {
			window.localStorage.themeColor = "green";
		}
		this.reloadCss();
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
	/**
	 * CSS 를 다시 불러오면 filter 에서 컬러값을 치환 함.
	 */
	reloadCss : function() {
		if(window.localStorage.themeColor !== "green") {
			$("head > link[rel=stylesheet]").each(function() {
				N.comm({
					url : $(this).attr("href"),
					contentType : "text/css",
					dataType : "html"
				}).submit(function(data) {
					$('<style type="text/css">\n' + data + '</style>').appendTo("head");
				});
			});
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
    setPageLinks : function(eles, view) {
    	view.on("click." + view.data("pageid"), eles, function(e) {
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
	setIndex : function(view) {
		var contents = view.find(".contents");

    	if(contents.length > 0) {
    		contents.prepend('<li class="title">' + (N.locale() === "ko_KR" ? "색인" : "Index") + '</li>');

    		var isHasH2 = view.find("h2").not(".notIndex").length > 0 ? true : false;
    		view.find(isHasH2 ? "h2, h3" : "h3, h4").not(".notIndex").each(function() {
				var selfEle = $(this);
				var sId = location.hash.replace("#", "") + "/" + view.data("pageid") + "/" + Math.random();
				selfEle.attr("id", sId);
				if(selfEle.is(isHasH2 ? "h3" : "h4")) {
					if(contents.children("li:last").find("ul").length > 0) {
						contents.children("li:last").find("ul").append('<li><a class="link" href="#' + sId + '">' + N.string.trim(selfEle.text()) + '</a></li>');
					} else {
						$('<ul><li><a class="link" href="#' + sId + '">' + N.string.trim(selfEle.text()) + '</a></li></ul>').appendTo(contents.find("li:last"));
					}
				} else {
					contents.append('<li><a class="link" href="#' + sId + '">' + N.string.trim(selfEle.text()) + '</a></li>');
				}
			});
    	}

    	var navHeight = N(".header nav").outerHeight();
    	var marginTop = 179 + $("header").height();
		N(window).unbind("scroll.aop").bind("scroll.aop", function(e) {
			if(N(this).scrollTop() > marginTop - navHeight) {
				contents.css({
					"position" : "fixed",
					"top" : navHeight
				});
			} else {
				contents.css({
					"position" : "absolute",
					"top" : marginTop
				});
			}
		}).trigger("scroll.aop");
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