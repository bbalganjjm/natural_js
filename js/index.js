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
		$("nav > ul > li > ul a").click(function(e) {
			if(N.string.trimToEmpty(this.href).indexOf("#") < 0
					&& N.string.trimToEmpty(this.href).indexOf(".html") > -1
					&& N.string.trimToNull(this.href) !== null) {
				e.preventDefault();
				N(N.context.attr("architecture").page.context).comm(this.href).submit();

				// Google Analytics
				ga('create', 'UA-58001949-1', 'auto');
				ga('send', 'pageview');
			}
		});
	},
	loadMainContents : function() {
		if(N.string.trimToNull(location.hash) !== null) {
			console.log("html/" + N.string.trimToEmpty(location.hash).replace("#", "") + ".html");
			N(N.context.attr("architecture").page.context).comm("html/" + N.string.trimToEmpty(location.hash).replace("#", "") + ".html").submit();
		} else {
			N(N.context.attr("architecture").page.context).comm("html/gtst/gtst0100.html").submit();
		}
	}
}