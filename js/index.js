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
		this.loadMainContents();

		setTimeout(function() {
			N(window).alert("홈페이지 작업 중 입니다.<br>예제, 참고문서 작업 해야함.").show();
		}, 1000);
	},
	loadMainContents : function() {
		N(N.context.attr("architecture").page.context).comm("html/gtst/gtst0100.html").submit();
	}
}