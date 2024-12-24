시작하기
===

## Natural-JS 실행 환경 구성

먼저 다음 중 한 가지 방법으로 Natural-JS 라이브러리 파일들을 다운로드하세요.

1.  [GitHub](https://github.com/bbalganjjm/natural_js)에서 직접 다운로드
2.  Bower : bower install natural_js
3.  npm : npm install @bbalganjjm@natural_js

다운로드된 파일 들 중 Natural-JS를 구동하기 위한 필수 라이브러리 파일들은 다음과 같습니다.

1.  **lib/jquery-3.7.1.min.js** - Natural-JS는 jQuery에 의존성이 있으므로 반드시 임포트해야 합니다.
2.  **css/natural.ui.css** - Natural-UI 디자인과 관련된 스타일시트 파일입니다.
    > css 폴더에 있는 `dark.css`, `light.css`, `css/tokens.css` 파일이 모두 포함되어야 합니다.
3.  **dist/natural.js{+code}{+template}.{es5|es6}.min.js** - Natural-JS의 전체 라이브러리 파일이 합쳐진 Minified 파일입니다.
    > 지원되는 ECMAScript 버전 및 패키지에 따라 아래 파일 중 하나를 선택해서 사용할 수 있습니다:
    > - dist/natural.js+code+template.es5.min.js: ES5 기반의 Natural-CODE 와 Natural-TEMPLATE 패키지가 포함된 Natural-JS 파일
    > - dist/natural.js+code+template.es6.min.js: ES6 기반의 Natural-CODE 와 Natural-TEMPLATE 패키지가 포함된 Natural-JS 파일
    > - dist/natural.js+code.es5.min.js: ES5 기반의 Natural-CODE 패키지가 포함된 Natural-JS 파일
    > - dist/natural.js+code.es6.min.js: ES6 기반의 Natural-CODE 패키지가 포함된 Natural-JS 파일
    > - dist/natural.js+template.es5.min.js: ES5 기반의 Natural-TEMPLATE 패키지가 포함된 Natural-JS 파일
    > - dist/natural.js+template.es6.min.js: ES6 기반의 Natural-TEMPLATE 패키지가 포함된 Natural-JS 파일
    > - dist/natural.js.es5.min.js: ES5 기반의 Natural-JS 파일
    > - dist/natural.js.es6.min.js: ES6 기반의 Natural-JS 파일
    > > natural_js 소스코드에 포함된 `compiler/closure-compiler.jar`를 사용하여 ES3 이상의 원하는 패키지를 포함하여 직접 생성할 수도 있습니다.
4.  **dist/natural.config.js** - Natural-JS의 환경설정 파일입니다.

Natural-JS 는 TypeScript 를 지원하기위해 타입 선언 파일을 제공합니다.

아래와 같이 `tsconfig.json` 파일에 Natural-JS 의 타입 선언파일이 있는 경로를 추가하면 Typescript 로 개발이 가능합니다.
```
{
  "compilerOptions": {
    ...
    "types": ["js/natural_js/@types"]
  }
}
```

이제 최상위 HTML 파일을 생성하고 위 파일들을 아래 순서대로 페이지에 가져오기(import) 해줍니다.

```
<script type="text/javascript" src="js/natural_js/lib/jquery-3.7.1.min.js"></script>
<link rel="stylesheet" type="text/css" href="js/natural_js/css/natural.ui.css" />
<script type="module" charset="utf-8" src="js/natural_js/dist/natural.js+code+template.es6.min.js"></script>
<script type="module" charset="utf-8" src="js/natural_js/dist/natural.config.js"></script>
```

CORE, ARCHITECTURE, DATA, UI, UI.Shell 전체를 사용하기 원한다면 natural.js.min.js를 임포트(Import)하고 각 패키지 별로 따로 사용하기 원한다면 따로 임포트하면 됩니다.

각 패키지 별 의존 관계는 다음과 같습니다.

*   Natural-CORE 만 사용할 경우 : natural.core.js
*   Natural-ARCHITECTURE 만 사용할 경우 : natural.core.js, natural.architecture.js
*   Natural-DATA 만 사용할 경우 : natural.core.js, natural.data.js
*   Natural-UI 만 사용할 경우 : natural.core.js, natural.data.js, natural.ui.js
*   Natural-UI.Shell 만 사용할 경우 : natural.core.js, natural.ui.js, natural.ui.shell.js

Natural-JS의 모든 라이브러리가 합쳐진 natural.js.min.js의 용량이 145kb 정도밖에 되지 않기 때문에 natural.js.min.js 만 임포트해도 성능에 큰 영향을 미치지 않습니다.

라이브러리를 임포트 했으니 Natural-JS의 구동 환경을 설정해 볼까요?

Natural-JS의 환경설정 파일인 natural.config.js 파일을 열어보세요.

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

Natural-JS의 환경설정값은 Context(N.context) 객체에 저장됩니다. 환경설정값 중 위 구문에 해당하는 N.context.attr("architecture").page.context 값은 아주 중요한 값입니다. 이 값은 Natural-JS의 컴포넌트 요소들이 적재될 컨테이너 요소를 jQuery Selector 문자열로 지정하면 됩니다. 쉽게 말해 페이지 콘텐츠들을 표시할 동적으로 변하지 않는 박스 요소를 지정하면 됩니다. 더불어, N.context.attr("ui").alert.context 값에 N.alert HTML 요소를 저장하는 컨테이너 요소의 selector 를 지정해 주세요. 보통 N.context.attr("architecture").page.context 값과 같은 요소를 지정하면 됩니다. Tab(N.tab)이나 Popup(N.popup), Datepicker(N.datepicker)등 Natural-UI 에서 지원하는 컴포넌트들의 자원이 여기(N.context.attr...context)에서 지정한 영역에 생성되고 페이지가 전환될 때 이 영역에 다시 덮어 씌움으로써 브라우저의 자원을 반환하게 됩니다. 페이지 Redirect 를 하지 않는 Single Page Web Application 을 개발할 때 브라우저 리소스를 따로 관리하지 않아도 되어서 편리하겠죠? 그 외 환경설정 값들은 [Config](?page=html/naturaljs/refr/refr0102.html) 메뉴의 내용을 참고해 주세요.

<p class="alert"><a href="?page=html/naturaljs/refr/refr0502.html">Documents</a>(N.docs) 컴포넌트를 사용하는 경우에는 지정할 필요가 없습니다.</p>
<p class="alert">SPA(Single Page Application)가 아니면 "body"로 설정해 주세요.</p>

<a href="?page=html/naturaljs/refr/refr0102.html">Config(natural.config.js)</a> 에는 대부분 UI 컴포넌트들의 전역 설정값들이 지정되어 있고 모든 컴포넌트들은 여기에서 설정한 옵션 값들을 기본으로 구동됩니다.

Natural-JS의 컴포넌트 옵션의 적용 우선순위는 다음과 같습니다.

1.  컴포넌트를 초기화할 때 지정한 옵션 값
2.  <a href="?page=html/naturaljs/refr/refr0102.html">Config(natural.config.js)</a>에서 지정한 옵션 값
3.  컴포넌트의 기본 옵션 값

컴포넌트 클래스의 기본 옵션 값 중 <a href="?page=html/naturaljs/refr/refr0102.html">Config(natural.config.js)</a>에 지정되지 않은 옵션 값들은 컴포넌트 초기화 시 따로 옵션을 지정하지 않았다면 컴포넌트 클래스의 기본 옵션 값으로 동작됩니다. 환경설정 파일에 정의되지 않은 컴포넌트 클래스의 기본 옵션 값을 사이트 전역 옵션 값으로 설정하고 싶다면 환경설정 파일의 해당 컴포넌트 부분에 추가하면 됩니다. 예를 들어 사이트 내에서 동작되는 모든 그리드 컴포넌트 Body 영역의 높이를 300픽셀로 기본값을 설정하고 싶다면 N.context.attr("ui").grid 부분에 다음과 같이 추가하면 됩니다.

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

실행 환경 구성을 완료했습니다. 이제 샘플 코드를 작성해 봅시다.

##Controller(N.cont)와 Communicator(N.comm)

Natural-JS는 페이지 블록의 소스코드에서 개발 영역과 디자인 영역을 구분하고 요소(Element) 간, 스크립트 간 영역(scope)을 보장해 주기 위한 간단한 소스코드의 구성 규칙이 있습니다. 별로 어렵지 않습니다. 다음과 같이 View 영역과 Controller 영역을 구분하고 순서대로 배치만 해 주면 됩니다.

<p class="alert">View 와 Controller 에 대한 자세한 내용은 <a href="?page=html/naturaljs/refr/refr0201.html">Controller</a> 메뉴를 참고해 주세요.</p>

**block01.html**

```
<!-- View -->
<article id="block01">
    <div id="result">
    </div>
</article>

<script type="text/javascript">
N(".block01").cont({ // Controller object
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

위 코드를 **block01.html** 파일로 저장해 주세요.

".block01" Controller object의 init 함수 안에 있는 N.comm 함수는 서버에서 데이터를 조회하는 구문입니다.

<p class="alert">Natural-JS는 서버와의 데이터 및 파일을 송수신하는데 Communicator(N.comm) 모듈을 사용합니다. N.comm 에 대한 자세한 내용은 <a href="?page=html/naturaljs/refr/refr0203.html">Communicator</a> 메뉴를 참고해 주세요.</p>

앞에서 Natural-JS의 컴포넌트 데이터 및 데이터 송수신을 위한 데이터 타입은 JSON 이라고 했었습니다.

먼저 json 타입으로 데이터를 서비스해 주는 서버가 필요 하지만 이 문서에서는 서버 작업에 대한 설명은 생략하겠습니다. Spring MVC 나 PHP 로 간단하게 List 나 Map 타입의 객체를 JSON 타입으로 변환해 주는 모듈들이 많이 있습니다. 프로그래밍 언어 별 JSON 변환 모듈에 대한 정보를 얻으려면 아래 사이트를 방문해 보기 바랍니다.

[http://www.json.org/json-ko.html](http://www.json.org/json-ko.html)

임시로 데이터를 수신하기 위해 다음과 같이 JSON 문자열로 구성된 데이터 파일(data.json)을 작성하고 저장합니다.

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
  }, {
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
  }, {
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

이제 하나의 블록 페이지가 완성되었습니다. 이 페이지는 Tab(N.tab)이나 Popup(N.popup), <a href="?page=html/naturaljs/refr/refr0502.html">Documents</a>(N.docs) 컴포넌트로 불러올 수 있고 Communicator(N.comm)를 사용하여이 이 페이지의 요소를 원하는 위치에 추가할 수 있습니다.

간단한 인덱스 페이지를 만들고 **block 01.html** 페이지를 N.comm 을 사용하여 원하는 위치에 추가해 볼까요?

다음 코드를 **index.html** 파일로 저장해 주세요.

**index.html**

```
<!DOCTYPE html>
<html>
<head>
<meta content="text/html; charset=utf-8" />
<title>Natural-JS</title>
<script type="text/javascript" src="js/natural_js/lib/jquery-3.7.1.min.js"></script>
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

**index.html** 파일의 $(document).ready 함수의 콜백 인수는 N.comm 을 이용하여 **block01.html** 페이지를 **#contents**(N.context.attr("architecture").page.context) 요소 안에 불러오는 코드입니다. N.comm 은 **block01.html** 페이지 로딩이 완료되면 Controller(N.cont) object의 init 함수를 실행해 줍니다.

<p class="alert">$ (document).ready 는 페이지 요소를 로딩한 후 인수로 지정된 콜백 함수를 실행해 주는 jQuery 에서 제공하는 함수입니다.</p>

이제 Natural-JS를 실행하기 위한 모든 작업을 완료했습니다.

지금 까지 작성한 코드들을 실행하려면 웹서버가 필요합니다.

먼저 웹 서버를 설치하고 웹 Context Root 에 위 index.html, block01.html, data.json 파일을 복사합니다. 그다음 웹서버를 구동하고 브라우저로 **index.html** 파일의 주소(URL)를 입력하여 페이지를 열어 보세요.

** block01.html ** 파일은 index.html 페이지에 의해 로드되고 N.cont 의 인수로 지정된 객체의 init 함수가 실행될 것입니다. 그다음 **block01.html** 페이지의 요소 id가 result 인 div 요소 안에 서버에서 조회된 데이터가 표시될 것입니다.

<p class="alert">데이터를 조회할 수 있는 서버가 있는 경우 N.comm 의 url 옵션에서 <strong>data.json</strong> 대신 서비스 URL 을 입력하세요.</p>

이제 Natural-JS의 기본 환경을 구성하고 실행하는 방법을 알았으니 블록 페이지가 실행될 사이트 환경을 만들어 볼까요?

[웹 애플리케이션 기본 프레임 만들기](?page=html/naturaljs/gtst/gtst0200.html) 메뉴를 클릭해 주세요.

<p class="alert">이 사이트는 Natural-JS로 개발되었습니다. 이 사이트의 소스 코드는 <a href="https://github.com/bbalganjjm/natural_js/tree/gh-pages">Github 의 gh-pages 브랜치</a>에 공개되어 있으니 참고 바랍니다.