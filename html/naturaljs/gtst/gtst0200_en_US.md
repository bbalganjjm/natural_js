Linking menu programs with Documents(Working..)
===

Documents(N.docs) 컴포넌트를 사용하여 일반적인 업무용 프로그램 처럼 좌측에 업무메뉴를 배치하고 우측에 MDI 형태로 페이지를 표시 해 주는 웹 어플리케이션을 개발 해 보겠습니다.
<p class="alert">Documents(N.docs) 에 대한 자세한 내용은 <a href="#cmVmcjA1MDIlMjREb2N1bWVudHMkaHRtbCUyRm5hdHVyYWxqcyUyRnJlZnIlMkZyZWZyMDUwMi5odG1s">Documents</a> 메뉴를 참고 해 주세요.</p>

먼저 개발 프로젝트를 구성하기 위해 다음 폴더들을 생성 합니다.

 * /js
 * /js/natural_js
 * /js/natural_js/lib
 * /js/natural_js/css
 * /html

폴더 생성이 완료 되었으면 다음 파일들을 [GitHub](https://github.com/bbalganjjm/natural_js) 의 dist 와 css, lib 폴더에서 다운로드 하여 해당 위치에 복사 합니다.

 * js/natural_js/lib/jquery-1.12.4.min.js
 * js/natural_js/css/natural.ui.css
 * js/natural_js/natural.js.min.js
 * js/natural_js/natural.config.js

프로젝트 구성이 완료 되었으면 다음 코드를 **/html/index.html** 파일로 저장 해 주세요.

**index.html**

```
<!DOCTYPE html>
<html>
<head>
<meta content="text/html; charset=utf-8" />
<title>Natural-JS</title>
<script type="text/javascript" src="js/natural_js/lib/jquery-1.12.4.min.js"></script>
<link rel="stylesheet" type="text/css" href="js/natural_js/css/natural.ui.css" />
<script type="text/javascript" src="js/natural_js/natural.js.min.js"></script>
<script type="text/javascript" src="js/natural_js/natural.config.js"></script>
<style type="text/css">
	#gnb {
		flex...
	}
	
	#docs {
		flex...
	}
</style>

<script type="text/javascript">
	var docs;
	$(document).ready(function() {
		docs = N("#docs").docs();
	});
</script>

</head>
<body>
	<nav id="gnb">
		<ul>
			<li></li>
		</ul>
	</nav>
	<!-- N.docs context elelemt. -->
	<div id="docs"></div>
</body>
</html>
```