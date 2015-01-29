var IndexController = {
	initWebfont : function(window) {
		window.WebFontConfig = {
			custom : {
				families : [ 'Nanum Gothic' ],
				urls : [ 'http://fonts.googleapis.com/earlyaccess/nanumgothic.css' ]
			}
		};
		var wf = document.createElement('script');
		wf.src = ('https:' == document.location.protocol ? 'https' : 'http')
				+ '://ajax.googleapis.com/ajax/libs/webfont/1.4.10/webfont.js';
		wf.type = 'text/javascript';
		wf.async = 'true';
		var s = document.getElementsByTagName('script')[0];
		s.parentNode.insertBefore(wf, s);
	},
	init : function(window) {
		this.setMenuEvent();
		this.loadMainContents();
	},
	setMenuEvent : function() {
		N("nav > ul > li > ul a").click(function(e) {
			var href = N(this).attr("href");
			if(N.string.trimToEmpty(href).indexOf("#") < 0
					&& N.string.trimToEmpty(href).indexOf(".html") > -1
					&& N.string.trimToNull(href) !== null) {

				e.preventDefault();
				var hash_ = href.replace("http://bbalganjjm.github.io/natural_js/", "").replace(/\.html/g, "").replace(/html\//g, "");
				N(N.context.attr("architecture").page.context).comm(href).submit(function() {
					// Google Analytics
					ga('create', 'UA-58001949-2', 'auto');
					ga('send',  {
						'hitType': 'pageview',
						'page': "#" + hash_
					});
				});
				location.hash = hash_;
			}
		});
	},
	loadMainContents : function() {
		if(N.string.trimToNull(location.hash) !== null) {
			N(N.context.attr("architecture").page.context).comm("html/" + N.string.trimToEmpty(location.hash).replace("#", "") + ".html").submit(function() {
				// Google Analytics
				ga('create', 'UA-58001949-2', 'auto');
				ga('send', {
					'hitType': 'pageview',
					'page': location.hash
				});
			});
		} else {
			N(N.context.attr("architecture").page.context).comm("html/gtst/gtst0100.html").submit(function() {
				// Google Analytics
				ga('create', 'UA-58001949-2', 'auto');
				ga('send', {
					'hitType': 'pageview',
					'page': '#gtst/gtst0100'
				});
			});
		}
	}
}