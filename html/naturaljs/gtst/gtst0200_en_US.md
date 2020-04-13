Create a web application base frame
===

Let's develop a Single Page Web Application by using the Documents (N.docs) component that places the menu on the left and displays the page in MDI form on the right.

<p class="alert">For more information about Documents (N.docs), please refer to the <a href="#cmVmcjA1MDIlMjREb2N1bWVudHMkaHRtbCUyRm5hdHVyYWxqcyUyRnJlZnIlMkZyZWZyMDUwMi5odG1s">Documents</a> menu.</p>

First, create the following folders to structure the development project.

 * /js/natural_js - Natural-JS Javascript library files folder
 * /js/natural_js/lib - jQuery library files folder
 * /js/natural_js/css - Default CSS file folder of Natural-JS UI components
 * /html/contents - Menu content file folder
 * /html/index - Files folder associated with the main index

When the folder creation is completed, download the following files from the master branch of [GitHub](https://github.com/bbalganjjm/natural_js) and copy them to the corresponding location.

 * js/natural_js/lib/jquery-1.12.4.min.js - In the "lib" folder of the compressed file downloaded from the master branch on GitHub
 * js/natural_js/css/natural.ui.css - In the "css" folder of the compressed file downloaded from the master branch on GitHub
 * js/natural_js/natural.js.min.js - In the "dist" folder of the compressed file downloaded from the master branch on GitHub
 * js/natural_js/natural.config.js - In the "dist" folder of the compressed file downloaded from the master branch on GitHub

The final project folder and files are structured as follows. I plan to explain the files by filling them one by one, so just create a folder.

![Development project structure](images/gtst/gtst0200/0.png)

When the development project configuration is completed, save the following code as **/index.html** file.

**/index.html**

```
<!DOCTYPE html>
<html>
<head>
<meta content="text/html; charset=utf-8" />
<title>Natural-JS</title>
<script type="text/javascript" src="js/natural_js/lib/jquery-1.12.4.min.js"></script>
<link rel="stylesheet" type="text/css" href="js/natural_js/css/natural.ui.css" />
<script type="text/javascript" src="js/natural_js/natural.js.min.js" charset="utf-8"></script>
<script type="text/javascript" src="js/natural_js/natural.config.js" charset="utf-8"></script>

<style type="text/css">
html {
    height: 100%;
}

body {
    display: flex;
    flex-direction: row;
    font-size: 13px;
    margin: 0;
    height: 100%;
}

#lefter {
	flex: 1;
    max-width: 200px;
    border-right: 1px solid #66BB6A;
    height: 100%;
}

#docs {
	flex: 1;
    height: 100%;
}
</style>

<script type="text/javascript">
	// Global N.docs instance.
	window.docs;

	$(document).ready(function() {
	    // Import left menu page.
	    N("#lefter").comm("html/index/lefter.html").submit(function() {
	        // Create new N.docs instance;
	        docs = N("#docs").docs();
	    });

	});
</script>
</head>
<body>
    <!-- lefter -->
	<div id="lefter"></div>
	<!-- N.docs context elelemt. -->
	<div id="docs"></div>
</body>
</html>
```

**/index.html** is the main index page accessed by this application. Because it is SPA(Single Page Application), the browser URL will not change while using the web application.

**/index.html** At the top of the head tag area, statements for loading JavaScript and CSS files are placed. These files are  loaded only once while using the application, and will be share the features with pages that are loaded later.

See the callback function in the $(document).ready function.

```
	// Global N.docs instance.
	window.docs;

	$(document).ready(function() {
	    // Import left menu page.
	    N("#lefter").comm("html/index/lefter.html").submit(function() {
	        // Create new N.docs instance;
	        docs = N("#docs").docs();
	    });

	});
```

**/index.html** 의 DOM 이 모두 로딩 된 다음 N.comm 으로 #lefter 요소에 좌측 블록 페이지를 불러와 넣어주는 구문입니다. **/html/index/lefter.html** 파일은 좌측 메뉴의 링크 요소와 이를 활성 화 시켜 주는 Controller(N.cont) Object 가 들어 있습니다.
N("#lefter").comm("html/index/lefter.html").submit 함수의 인자는 **/html/index/lefter.html** 파일 로딩이 완료 된 후 실행 되는 콜백 함수 입니다. 여기에서 N.docs 컴포넌트로 #docs 요소 안에 MDI 페이지 컨테이너를 생성 해 주고 있습니다. N.docs 컴포넌트의 인스턴스는 어플리케이션당 1개만 생성 되므로 window 객체에 담아 전역으로 사용 할 것입니다.
<p class="alert">N.docs 인스턴스는 반드시 window 가 아니더라도 어플리케이션에서 정의한 전역으로 접근할 수 있는 아무 객체에 담아도 됩니다.</p>

이제 이 N.docs 인스턴스에서 제공 하는 기능들로 링크를 클릭하면 우측 컨텐츠 영역에 메뉴 페이지가 추가되는 왼쪽 메뉴 블록 페이지(/html/index/lefter.html)를 작성 해 보겠습니다.

다음 코드를 **/html/index/lefter.html** 파일로 저장 해 주세요.

```
<style type="text/css">
.index-lefter .menu a {
    text-decoration: none;
    line-height: 2em;
    color: #000;
}
</style>

<article class="index-lefter">
    <ul class="menu">
        <li><a href="html/contents/page1.html" data-docid="page1">MENU-1</a></li>
        <li><a href="html/contents/page2.html" data-docid="page2">MENU-2</a></li>
        <li><a href="html/contents/page3.html" data-docid="page3">MENU-3</a></li>
        <li><a href="html/contents/page4.html" data-docid="page4">MENU-4</a></li>
        <li><a href="html/contents/page5.html" data-docid="page5">MENU-5</a></li>
    </ul>
</article>

<script type="text/javascript">
N(".index-lefter").cont({
    init : function(view, request) {
		N(".menu", view).on("click", "a", function(e) {
		    e.preventDefault();

			window.docs.add(N(this).data("docid"), N(this).text(), {
			    url : N(this).attr("href")
			});
		});
    }
});
</script>
```

위 코드를 보면 특이한 부분이 있습니다.
view 영역 위에 style 태그가 추가 되어 있습니다. 이 영역은 이 페이지의 view 에만 적용되는 스타일을 정의 하기 위한 부분 입니다.
주의해야 할 부분은 ```.index-lefter .menu a { ... }``` 의 **.index-lefter** 처럼  CSS 셀렉터를 정의 할 때 반드시 view 를 가리키는 class(.) 나 id(#) 로 시작 해야 이 페이지에서만 스타일이 적용 됩니다.
<p class="alert">이렇게 정의한 스타일은 페이지가 닫히면 해당 자원도 메모리에서 제거 되어 스타일이 사라집니다.</p>

N.cont 오브젝트의 init 함수에는 메뉴링크 요소를 클릭하면 **/index.html** 에서 window 객체에 담아둔 N.docs 인스턴스로 선택한 메뉴 컨텐츠를 여는 구문이 있습니다.

N.docs 인스턴스로 ```add(페이지ID, 페이지명, { url : "페이지URL" }``` 함수 를 실행 하면 우측 MDI 영역에 페이지가 추가 됩니다. ```N(".menu", view).on("click", "a", function(e) { ... }, N(this).data("docid"), N(this).text(), N(this).attr("href")``` 는 모두 jQuery 에서 제공 하는 기능이니 [jQuery API 메뉴얼](https://api.jquery.com)을 참고 바랍니다.

이제 기반 작업은 끝났 습니다. 메뉴 링크로 걸려있는 컨텐츠 파일들만 만들어 주면 모든 작업이 완료 됩니다.

아래 메뉴 컨텐츠 파일들을 생성 해 주세요.

 * **/html/contents/page1.html**
 * **/html/contents/page2.html**
 * **/html/contents/page3.html**
 * **/html/contents/page4.html**
 * **/html/contents/page5.html**

위 파일들은 View 와 Controller 구조로만 이루어진 아주 아주 아주 아주..간단한 내용으로 구성 된 페이지들 입니다.

**/html/contents/page1.html**
```
<style type="text/css">
    .page1 .text {
        font-size: 15em;
        text-align: center;
    }
</style>

<article class="page1">
    <p class="text">page1</p>
</article>

<script type="text/javascript">
N(".page01").cont({
    init : function(view, request) {

    }
});
</script>
```

**/html/contents/page2.html**
```
<style type="text/css">
    .page2 .text {
        font-size: 15em;
        text-align: center;
    }
</style>

<article class="page2">
    <p class="text">page2</p>
</article>

<script type="text/javascript">
N(".page01").cont({
    init : function(view, request) {

    }
});
</script>
```

**/html/contents/page3.html**
```
<style type="text/css">
    .page3 .text {
        font-size: 15em;
        text-align: center;
    }
</style>

<article class="page3">
    <p class="text">page3</p>
</article>

<script type="text/javascript">
N(".page01").cont({
    init : function(view, request) {

    }
});
</script>
```

**/html/contents/page4.html**
```
<style type="text/css">
    .page4 .text {
        font-size: 15em;
        text-align: center;
    }
</style>

<article class="page4">
    <p class="text">page4</p>
</article>

<script type="text/javascript">
N(".page01").cont({
    init : function(view, request) {

    }
});
</script>
```

**/html/contents/page1.html**
```
<style type="text/css">
    .page5 .text {
        font-size: 15em;
        text-align: center;
    }
</style>

<article class="page5">
    <p class="text">page5</p>
</article>

<script type="text/javascript">
N(".page01").cont({
    init : function(view, request) {

    }
});
</script>
```

웹 서버에 지금까지 작성한 소스 파일들을 배포한 다음 **/index.html** 에 접속 하면 웹 어플리케이션을 실행 해 볼 수 있습니다.

다음과 같은 화면이 표시 되면 실습 성공!

![완료 화면](images/gtst/gtst0200/1.png)

전체 소스코드는 [여기](html/naturaljs/gtst/codes/natural_js_gtst0200.zip) 에서 다운로드 할 수 있습니다.

다음 단계([Retrieving / Modifying Data with Grid](#Z3RzdDAzMDAlMjRSZXRyaWV2aW5nJTJGTW9kaWZ5aW5nJTIwRGF0YSUyMHdpdGglMjBHcmlkJGh0bWwlMkZuYXR1cmFsanMlMkZndHN0JTJGZ3RzdDAzMDAuaHRtbA==)) 에서는 Natural-UI 패키지에서 제공하는 컴포넌트들로 이 컨텐츠 영역을 채워 보겠습니다.