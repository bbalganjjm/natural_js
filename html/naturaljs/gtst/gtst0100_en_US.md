Getting Started
===

## Configuring Natural-JS Execution Environment

First, download the Natural-JS library files in one of the following ways.

1.  Directly download from [GitHub](https://github.com/bbalganjjm/natural_js)
2.  Bower : bower install natural_js

Among the downloaded files, the necessary library files for running Natural-JS are as follows.

1.  **jquery-1.12.4.min.js** - You must import the jQuery library. because Natural-JS operates based on jQuery.
2.  **natural.ui.css** - This is style sheet file related with the Natural-UI design.
3.  **natural.js.min.js** - This is a minified file that combines the entire library files of Natural-JS.
4.  **natural.config.js** - This is Natural-JS's configuration file.

Now you can create a top-level HTML file and import the above files into the page in the following order.

```
<script type="text/javascript" src="js/natural_js/lib/jquery-1.12.4.min.js"></script>
<link rel="stylesheet" type="text/css" href="js/natural_js/css/natural.ui.css" />
<script type="text/javascript" src="js/natural_js/natural.js.min.js" charset="utf-8"></script>
<script type="text/javascript" src="js/natural_js/natural.config.js" charset="utf-8"></script>
```

If you want to use the entire CORE, ARCHITECTURE, DATA, UI, UI.Shell, import natural.js.min.js and if you want to use it separately for each package, you can import it separately.

The dependencies for each package are as follows.

*   When using only Natural-CORE : natural.core.js
*   When using only Natural-ARCHITECTURE : natural.core.js, natural.architecture.js
*   When using only Natural-DATA : natural.core.js, natural.data.js
*   When using only Natural-UI : natural.core.js, natural.data.js, natural.ui.js
*   When using only Natural-UI.Shell : natural.core.js, natural.ui.js, natural.ui.shell.js

Importing only natural.js.min.js does not have a significant impact on performance, as natural.js.min.js has a combined capacity of 214kb for all Natural-JS libraries.

Now that you have imported the library, let's set up the environment for running Natural-JS.

Open the natural.config.js file that is a configuration file of Natural-JS.

```
/* Natural-ARCHITECTURE Config */
N.context.attr("architecture", {
	"page" : {
		"context" : "#contents"
	},
	...
/* Natural-UI Config */
N.context.attr("ui", {
	"alert" : {
		"container" : "#contents"
	...
```

You will see the syntax of above look like JSON format. you might known what is the JSON. that is very easy. if you don't know, refer to the following URL

[http://www.json.org](http://www.json.org)

JSON is very important on Natrual-JS. The data type that send and receive to server is a string of JSON type, and the data bound to the UI components is also an array object composed of JSON objects.

Back to the point... Natural-JS environment settings are stored in the Context(N.context) object. N.context.attr("architecture").page.context value in the above syntaxes is a very important value among the environment settings. This value is specify for jQuery-selector string of the container element that contained Natural-JS's component elements. In other words, specify the dynamically unchanging element box that contained page content. In addition, Specify the container element selector that stores the N.alert HTML element in N.context.attr("ui").alert.context value. You specify the same element usually as the N.context.attr("architecture").page.context value. Resources of components supported by Natural-UI such as Tab (N.tab), Popup (N.popup), and Datepicker (N.datepicker) are created in the area specified here(N.context.attr...context) and when the page is changed, it will return the browser's resources by overwriting it again. When developing a Single Page Web Application that does not redirect pages, you don't have to manage browser resources separately. For other environment setting values, refer to [Config Example] in [API/DEMO] > [Natural-CORE] > [[Config](#cmVmcjAxMDIlMjRDb25maWckaHRtbCUyRm5hdHVyYWxqcyUyRnJlZnIlMkZyZWZyMDEwMi5odG1s)] menu.

<p class="alert">If you are using the Documents (N.docs) component, you do not need to specify it.</p>
<p class="alert">If it is not a SPA (Single Page Application), set it to "body".</p>

In N.config (natural.config.js), the global settings for most UI components are specified, and all components are based on the options set here.

Natural-JS's component option's applied priority is as follows.

1.  The specified option values when initializing the component
2.  The specified options values in N.config
3.  The default option values ​​of component

Option values ​​not specified in the configuration file (natural.config.js) among the default option values ​​of the component class is if you do not specify any options at component initialization it works as the default option value of the component class. If you want to set the default option value of a component class that is not defined in the configuration file as the site global option value you can add it to the component part of the configuration file. For example, if you want to set the default height of all grid components body areas within the site to 300 pixels you can add the following to the N.context.attr ("ui").grid property

```
N.context.attr("ui", {
	...
	"grid" : {
		...
		"height" : 300,
		...
	}
	...
```

You have finished configuring your execution environment. Now let's write some sample code.

##Controller(N.cont) and Communicator(N.comm)

Natural-JS has a simple source code composition rule to separate development areas and design areas within a source code of page block and to guarantee the scope between elements and scripts. It is not so difficult. You just need to separate the view area and the Controller area as shown below and arrange them in order.

<p class="alert">View 와 Controller 에 대한 자세한 내용은 <a href="#cmVmcjAyMDElMjRDb250cm9sbGVyJGh0bWwlMkZuYXR1cmFsanMlMkZyZWZyJTJGcmVmcjAyMDEuaHRtbA==">Controller</a> 메뉴를 참고 해 주세요.</a>

**block01.html**

```
<!-- View -->
<article id="block01">
	<div id="result">
	</div>
</article>

<script type="text/javascript">
N(".block01").cont({ // Controller Object
	init : function(view, request) {
    	N.comm("data.json").submit(function(data) {
			// data is received data from the server
			N("#result", view).text(JSON.stringify(data));
		});
	}
});
</script>
```

Natural-ARCHITECTURE 기반의 모든 페이지나 페이지 블록 들은 반드시 위와 같은 코드 폼으로 구성되어 있어야 합니다.

위 코드를 **block01.html** 파일로 저장 해 주세요.

N(".block01").cont object 의 init 함수의 N.comm 함수는 서버에서 데이터를 조회 하는 구문 입니다.

<p class="alert">Natural-JS는 서버와의 데이터 및 파일을 송수신 하는데 Communicator(N.comm) 모듈을 사용 합니다. N.comm 에 대한 자세한 내용은 <a href="#cmVmcjAyMDMlMjRDb21tdW5pY2F0b3IkaHRtbCUyRm5hdHVyYWxqcyUyRnJlZnIlMkZyZWZyMDIwMy5odG1s">Communicator</a> 메뉴를 참고 해 주세요.</p>

Natural-JS 의 컴포넌트 데이터 및 데이터 송수신을 위한 데이터 타입은 JSON 이라고 했었죠?

먼저 json 타입으로 데이터를 서비스 해 주는 서버가 필요 하지만 이 문서에서는 데이터를 서비스 해 주는 서버단의 작업에 대해서는 생략 하겠습니다. Spring MVC 나 PHP 로 간단하게 List 나 Map 타입의 객체를 JSON 타입으로 변환 해 주는 모듈들이 많이 있습니다. 아래 사이트에 방문하면 프로그래밍 언어별 변환모듈에 대한 정보가 많이 있습니다.

[http://www.json.org/json-ko.html](http://www.json.org/json-ko.html)

데이터를 임의로 받기 위해 JSON 문자열로 구성 된 데이터 파일(data.json)을 다음과 같이 생성 하고 저장 합니다.

**data.json**

```
[
  {
    "key": "53e21cba9f982281b3459438",
    "index": 0,
    "guid": "1a9e5450-c664-4bfd-8174-d03005eca08d",
    "isActive": "Y",
    "balance": "$1,284.38",
    "picture": "http://placehold.it/32x32",
    "age": 26,
    "eyeColor": "green",
    "name": "Dean Stanley",
    "gender": "male",
    "company": "ZENTIA",
    "email": "deanstanley@zentia.com",
    "phone": "+1 (920) 409-2680",
    "address": "936 Meserole Street, Vicksburg, Massachusetts, 1198",
    "about": "Mollit elit qui reprehenderit fugiat excepteur adipisicing sunt id proident laborum sint proident.",
    "registered": "2014-02-20T03:58:09 -09:00",
    "latitude": 81.131606,
    "longitude": 87.110498,
    "greeting": "Hello, Dean Stanley! You have 1 unread messages.",
    "favoriteFruit": "strawberry"
  },
  {
    "key": "53e21cba47868d69889d7910",
    "index": 1,
    "guid": "9b855e26-2903-4b9a-b04a-e96544db2543",
    "isActive": "N",
    "balance": "$1,461.27",
    "picture": "http://placehold.it/32x32",
    "age": 31,
    "eyeColor": "green",
    "name": "Howard Kramer",
    "gender": "male",
    "company": "ASSISTIX",
    "email": "howardkramer@assistix.com",
    "phone": "+1 (806) 435-3679",
    "address": "173 Harwood Place, Yonah, Guam, 8467",
    "about": "Nisi velit eu non in dolor in. Qui aliquip sunt sit ut reprehenderit exercitation deserunt do.",
    "registered": "2014-03-24T22:55:08 -09:00",
    "latitude": -80.020226,
    "longitude": -153.640872,
    "greeting": "Hello, Howard Kramer! You have 9 unread messages.",
    "favoriteFruit": "apple"
  },
  {
    "key": "53e21cba7a3cbdd773b7449d",
    "index": 2,
    "guid": "95b45a67-64ae-4bd6-a61f-c9226cfdf5af",
    "isActive": "Y",
    "balance": "$2,923.03",
    "picture": "http://placehold.it/32x32",
    "age": 26,
    "eyeColor": "green",
    "name": "Grace Hardy",
    "gender": "female",
    "company": "PROSELY",
    "email": "gracehardy@prosely.com",
    "phone": "+1 (872) 553-3815",
    "address": "526 Havemeyer Street, Holtville, Puerto Rico, 6513",
    "about": "Cillum incididunt reprehenderit elit laborum et sunt veniam. Velit pariatur id velit id occaecat.",
    "registered": "2014-03-13T16:54:10 -09:00",
    "latitude": 17.758973,
    "longitude": -112.334365,
    "greeting": "Hello, Grace Hardy! You have 8 unread messages.",
    "favoriteFruit": "strawberry"
  }
]
```

이제 블록 페이지 1개가 완성 되었습니다. 이 페이지는 Tab 이나 Popup, Documents 컴포넌트로 불러올 수 있고 N.comm 으로 원하는 위치에 넣어 줄 수 있습니다.

간단하게 인덱스 페이지를 만들고 N.comm 으로 **block01.html** 페이지를 원하는 위치에 불러 와 볼까요?

다음 코드를 **index.html** 파일로 저장 해 주세요.

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

<script type="text/javascript">
	$(document).ready(function() {
		N(N.context.attr("architecture").page.context).comm("block01.html").submit()
	});
</script>

</head>
<body>
	<!-- Page Context(N.context.attr("architecture").page.context) elelemt. -->
	<div id="contents"></div>
</body>
</html>
```

**index.html** 파일의 $(document).ready 함수의 콜백 인자는 Communicator(N.comm) 를 이용하여 **block01.html** 페이지를 **#contents**(N.context.attr("architecture").page.context) 요소 안에 불러오는 코드 입니다. N.comm 은 **block01.html** 페이지 로딩이 완료 되면 Controller(N.cont) object 의 init 함수를 실행 해 줍니다.

<p class="alert">$(document).ready는 불러 온 HTML 파일의 DOM 요소들이 브라우저에 적재가 완료 된 다음에 인자로 지정한 콜백함수를 실행 시켜주는 jQuery 에서 제공하는 함수 입니다.</p>

이제 Natural-JS 를 구동하기 위한 소스 코드 작성이 모두 완료 되었습니다.

지금 까지 작성한 코드들을 실행 하려면 웹서버가 필요 합니다.

먼저 웹 서버를 설치 하고 웹 Context Root 에 위 index.html, block01.html, data.json 파일을 복사 합니다. 그 다음 웹서버를 구동하고 브라우저로 **index.html** 파일의 주소(URL)를 입력하여 페이지를 열어 보세요.

index.html 페이지에 의해 **block01.html** 파일이 로딩되고 N.cont 의 인자로 지정 한 오브젝트의 init 함수가 실행 될 것 입니다. 그 다음 **block01.html** 페이지의 id 가 result 인 div 요소 안에 서버에서 전달 된 데이터가 표시 될 것 입니다.

<p class="alert">데이터를 조회 할 수 있는 서버가 있다면 N.comm 의 url 옵션에 <strong>data.json</strong> 대신 해당 서비스의 URL 을 입력 하면 됩니다.</p>
<p class="alert">서버에서 JSON 타입의 파라미터 문자열을 Map 이나 List 같은 객체로 변환 해서 사용하려면 <a href="http://www.json.org/json-ko.html" target="blank">JSON 변환 모듈</a> 이 있어야 합니다.</p>

이제 기본 환경 구성과 실행 방법을 알았으니 블록 페이지 들이 구동 될 환경을 만들어 볼까요?

[Create a web application base frame](#Z3RzdDAyMDAlMjRDcmVhdGUlMjBhJTIwd2ViJTIwYXBwbGljYXRpb24lMjBiYXNlJTIwZnJhbWUkaHRtbCUyRm5hdHVyYWxqcyUyRmd0c3QlMkZndHN0MDIwMC5odG1s) 메뉴를 클릭 해 주세요.

<p class="alert">이 사이트는 Natural-JS 로 개발 된 사이트 입니다. 이 사이트의 소스 코드는 <a href="https://github.com/bbalganjjm/natural_js/tree/gh-pages">Github 의 gh-pages 브랜치</a>에 공개 되어 있으니 참고 바랍니다.