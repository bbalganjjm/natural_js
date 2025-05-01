# Natural-JS 시작하기 가이드

본 문서는 Natural-JS 프레임워크의 시작하기 가이드와 기본 튜토리얼을 제공합니다. Natural-JS를 처음 접하는 개발자가 기본적인 환경 구성부터 샘플 애플리케이션 개발까지 단계별로 학습할 수 있도록 구성되어 있습니다.

## 목차

1. [Natural-JS 실행 환경 구성](#natural-js-실행-환경-구성)
2. [웹 애플리케이션 기본 프레임 만들기](#웹-애플리케이션-기본-프레임-만들기)
3. [Grid로 데이터 조회/변경 하기](#grid로-데이터-조회변경-하기)

## Natural-JS 실행 환경 구성

### 라이브러리 다운로드

먼저 다음 중 한 가지 방법으로 Natural-JS 라이브러리 파일들을 다운로드하세요.

- GitHub에서 직접 다운로드
- Bower: `bower install natural_js`
- npm: `npm install @bbalganjjm@natural_js`

### 필수 라이브러리 파일

Natural-JS를 구동하기 위한 필수 라이브러리 파일들은 다음과 같습니다:

1. **lib/jquery-3.7.1.min.js**
   - Natural-JS는 jQuery에 의존성이 있으므로 반드시 임포트해야 합니다.

2. **css/natural.ui.css**
   - Natural-UI 디자인과 관련된 스타일시트 파일입니다.
   - css 폴더에 있는 `dark.css`, `light.css`, `css/tokens.css` 파일이 모두 포함되어야 합니다.

3. **dist/natural.js{+code}{+template}.{es5|es6}.min.js**
   - Natural-JS의 전체 라이브러리 파일이 합쳐진 Minified 파일입니다.
   - 지원되는 ECMAScript 버전 및 패키지에 따라 아래 파일 중 하나를 선택해서 사용할 수 있습니다:
     - dist/natural.js+code+template.es5.min.js: ES5 기반의 Natural-CODE와 Natural-TEMPLATE 패키지가 포함된 Natural-JS 파일
     - dist/natural.js+code+template.es6.min.js: ES6 기반의 Natural-CODE와 Natural-TEMPLATE 패키지가 포함된 Natural-JS 파일
     - dist/natural.js+code.es5.min.js: ES5 기반의 Natural-CODE 패키지가 포함된 Natural-JS 파일
     - dist/natural.js+code.es6.min.js: ES6 기반의 Natural-CODE 패키지가 포함된 Natural-JS 파일
     - dist/natural.js+template.es5.min.js: ES5 기반의 Natural-TEMPLATE 패키지가 포함된 Natural-JS 파일
     - dist/natural.js+template.es6.min.js: ES6 기반의 Natural-TEMPLATE 패키지가 포함된 Natural-JS 파일
     - dist/natural.js.es5.min.js: ES5 기반의 Natural-JS 파일
     - dist/natural.js.es6.min.js: ES6 기반의 Natural-JS 파일

   > natural_js 소스코드에 포함된 `compiler/closure-compiler.jar`를 사용하여 ES3 이상의 원하는 패키지를 포함하여 직접 생성할 수도 있습니다.

4. **dist/natural.config.js**
   - Natural-JS의 환경설정 파일입니다.

### TypeScript 지원

Natural-JS는 TypeScript를 지원하기 위해 타입 선언 파일을 제공합니다. 아래와 같이 `tsconfig.json` 파일에 Natural-JS의 타입 선언파일이 있는 경로를 추가하면 TypeScript로 개발이 가능합니다.

```json
{
  "compilerOptions": {
    ...
    "types": ["js/natural_js/@types"]
  }
}
```

### 파일 임포트

최상위 HTML 파일을 생성하고 위 파일들을 아래 순서대로 페이지에 가져오기(import) 해줍니다.

```html
<script type="text/javascript" src="js/natural_js/lib/jquery-3.7.1.min.js"></script>
<link rel="stylesheet" type="text/css" href="js/natural_js/css/natural.ui.css" />
<script type="module" charset="utf-8" src="js/natural_js/dist/natural.js+code+template.es6.min.js"></script>
<script type="module" charset="utf-8" src="js/natural_js/dist/natural.config.js"></script>
```

### 패키지별 사용

CORE, ARCHITECTURE, DATA, UI, UI.Shell 전체를 사용하기 원한다면 natural.js.min.js를 임포트하고 각 패키지별로 따로 사용하기 원한다면 각각 임포트하면 됩니다.

각 패키지별 의존 관계는 다음과 같습니다:

- Natural-CORE만 사용할 경우: natural.core.js
- Natural-ARCHITECTURE만 사용할 경우: natural.core.js, natural.architecture.js
- Natural-DATA만 사용할 경우: natural.core.js, natural.data.js
- Natural-UI만 사용할 경우: natural.core.js, natural.data.js, natural.ui.js
- Natural-UI.Shell만 사용할 경우: natural.core.js, natural.ui.js, natural.ui.shell.js

> Natural-JS의 모든 라이브러리가 합쳐진 natural.js.min.js의 용량이 145kb 정도밖에 되지 않기 때문에 natural.js.min.js만 임포트해도 성능에 큰 영향을 미치지 않습니다.

### 환경설정

Natural-JS의 환경설정 파일인 natural.config.js 파일을 열어보면 다음과 같은 설정이 있습니다:

```javascript
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

Natural-JS의 환경설정값은 Context(N.context) 객체에 저장됩니다. 환경설정값 중 `N.context.attr("architecture").page.context` 값은 아주 중요한 값입니다. 이 값은 Natural-JS의 컴포넌트 요소들이 적재될 컨테이너 요소를 jQuery Selector 문자열로 지정하면 됩니다. 쉽게 말해 페이지 콘텐츠들을 표시할 동적으로 변하지 않는 박스 요소를 지정하면 됩니다.

더불어, `N.context.attr("ui").alert.context` 값에 N.alert HTML 요소를 저장하는 컨테이너 요소의 selector를 지정해 주세요. 보통 `N.context.attr("architecture").page.context` 값과 같은 요소를 지정하면 됩니다.

Tab(N.tab)이나 Popup(N.popup), Datepicker(N.datepicker) 등 Natural-UI에서 지원하는 컴포넌트들의 자원이 여기(`N.context.attr...context`)에서 지정한 영역에 생성되고 페이지가 전환될 때 이 영역에 다시 덮어 씌움으로써 브라우저의 자원을 반환하게 됩니다. 페이지 Redirect를 하지 않는 Single Page Web Application을 개발할 때 브라우저 리소스를 따로 관리하지 않아도 되어서 편리합니다.

> Documents(N.docs) 컴포넌트를 사용하는 경우에는 지정할 필요가 없습니다.
> SPA(Single Page Application)가 아니면 "body"로 설정해 주세요.

### 컴포넌트 옵션의 적용 우선순위

Natural-JS의 컴포넌트 옵션의 적용 우선순위는 다음과 같습니다:

1. 컴포넌트를 초기화할 때 지정한 옵션 값
2. Config(natural.config.js)에서 지정한 옵션 값
3. 컴포넌트의 기본 옵션 값

컴포넌트 클래스의 기본 옵션 값 중 Config(natural.config.js)에 지정되지 않은 옵션 값들은 컴포넌트 초기화 시 따로 옵션을 지정하지 않았다면 컴포넌트 클래스의 기본 옵션 값으로 동작됩니다. 환경설정 파일에 정의되지 않은 컴포넌트 클래스의 기본 옵션 값을 사이트 전역 옵션 값으로 설정하고 싶다면 환경설정 파일의 해당 컴포넌트 부분에 추가하면 됩니다.

예를 들어 사이트 내에서 동작되는 모든 그리드 컴포넌트 Body 영역의 높이를 300픽셀로 기본값을 설정하고 싶다면 N.context.attr("ui").grid 부분에 다음과 같이 추가하면 됩니다:

```javascript
N.context.attr("ui", {
    ...
    "grid" : {
        ...
        "height" : 300,
        ...
    }
    ...
```

### 샘플 코드 작성

Natural-JS는 페이지 블록의 소스코드에서 개발 영역과 디자인 영역을 구분하고 요소(Element) 간, 스크립트 간 영역(scope)을 보장해 주기 위한 간단한 소스코드의 구성 규칙이 있습니다. 다음과 같이 View 영역과 Controller 영역을 구분하고 순서대로 배치만 해 주면 됩니다.

```html
<!-- block01.html -->
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

Natural-ARCHITECTURE 기반의 모든 페이지나 페이지 블록들은 반드시 위와 같은 코드 폼으로 구성되어 있어야 합니다.

위 코드를 `block01.html` 파일로 저장해 주세요.

".block01" Controller object의 init 함수 안에 있는 N.comm 함수는 서버에서 데이터를 조회하는 구문입니다.

Natural-JS는 서버와의 데이터 및 파일을 송수신하는데 Communicator(N.comm) 모듈을 사용합니다.

### JSON 데이터 처리

Natural-JS의 컴포넌트 데이터 및 데이터 송수신을 위한 데이터 타입은 JSON입니다. JSON 타입으로 데이터를 서비스해 주는 서버가 필요하며, 프로그래밍 언어별 JSON 변환 모듈에 대한 정보는 [http://www.json.org/json-ko.html](http://www.json.org/json-ko.html)에서 확인할 수 있습니다.

임시로 데이터를 수신하기 위해 다음과 같이 JSON 문자열로 구성된 데이터 파일(data.json)을 작성하고 저장합니다:

```json
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
  // ... 생략 ...
]
```

### 인덱스 페이지 작성

이제 간단한 인덱스 페이지를 만들고 `block01.html` 페이지를 N.comm을 사용하여 원하는 위치에 추가해 볼까요? 다음 코드를 `index.html` 파일로 저장해 주세요:

```html
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
    <!-- Page Context(N.context.attr("architecture").page.context) element. -->
    <div id="contents"></div>
</body>
</html>
```

`index.html` 파일의 $(document).ready 함수의 콜백 인수는 N.comm을 이용하여 `block01.html` 페이지를 `#contents`(N.context.attr("architecture").page.context) 요소 안에 불러오는 코드입니다. N.comm은 `block01.html` 페이지 로딩이 완료되면 Controller(N.cont) object의 init 함수를 실행해 줍니다.

이제 Natural-JS를 실행하기 위한 모든 작업을 완료했습니다. 실행하려면 웹서버가 필요합니다. 웹 서버를 설치하고 웹 Context Root에 위 index.html, block01.html, data.json 파일을 복사한 후, 웹서버를 구동하고 브라우저로 `index.html` 파일의 주소(URL)를 입력하여 페이지를 열어 보세요.

## 웹 애플리케이션 기본 프레임 만들기

이 섹션에서는 메뉴를 좌측에 배치하고 우측에 MDI 형태로 페이지를 표시해 주는 Documents(N.docs) 컴포넌트를 사용하여 Single Page Web Application을 개발하는 방법을 알아보겠습니다.

### 개발 프로젝트 구성

먼저 개발 프로젝트를 구성하기 위해 다음 폴더들을 생성합니다:

- /js/natural_js - Natural-JS Javascript 라이브러리 파일 폴더
- /js/natural_js/lib - jQuery 라이브러리 파일 폴더
- /js/natural_js/css - Natural-JS UI 컴포넌트들의 기본 CSS 파일 폴더
- /html/contents - 메뉴 콘텐츠 파일 폴더
- /html/index - 메인 인덱스와 관련된 파일 폴더

폴더 생성이 완료되었으면 GitHub의 마스터 브랜치에서 다음 파일을 다운로드하여 해당 경로로 복사해 주세요:

- js/natural_js/lib/jquery-3.7.1.min.js
- js/natural_js/css/natural.ui.css
- js/natural_js/natural.js.min.js
- js/natural_js/natural.config.js

### 인덱스 페이지 작성

개발 프로젝트 환경설정이 완료되었으면 다음 코드를 `/index.html` 파일로 저장해 주세요:

```html
<!DOCTYPE html>
<html>
<head>
<meta content="text/html; charset=utf-8" />
<title>Natural-JS</title>
<script type="text/javascript" src="js/natural_js/lib/jquery-3.7.1.min.js"></script>
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
    border-right: 1px solid var(--md-sys-color-outline-variant);
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
    <!-- N.docs context element. -->
    <div id="docs"></div>
</body>
</html>
```

`/index.html`는 이 애플리케이션으로 접속하는 메인 인덱스 페이지입니다. SPA(Single Page Application)이기 때문에 브라우저 URL은 웹 애플리케이션을 사용하는 동안 변동되지 않을 것입니다.

$(document).ready 함수의 콜백 함수에서는 `/html/index/lefter.html`을 불러와 좌측 메뉴를 설정하고, N.docs 컴포넌트로 MDI 페이지 컨테이너를 생성합니다. N.docs 컴포넌트의 인스턴스는 애플리케이션당 1개만 생성되므로 window 객체에 담아 전역으로 사용합니다.

### 좌측 메뉴 작성

이제 메뉴 콘텐츠를 불러오는 좌측 메뉴 블록 페이지(`/html/index/lefter.html`)를 생성해 보겠습니다:

```html
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

위 코드의 style 코드 블록은 이 페이지의 view에만 적용되는 스타일을 정의하기 위한 부분입니다. 페이지가 닫히면 스타일도 같이 제거됩니다.

N.cont 오브젝트의 init 함수에는 메뉴 링크 요소를 클릭했을 때 `/index.html`에서 window 객체에 담아둔 N.docs 인스턴스의 add 메서드로 메뉴 콘텐츠를 불러오는 코드가 작성되어 있습니다.

### 콘텐츠 페이지 작성

다음으로 메뉴 콘텐츠 파일들을 생성합니다. 여기서는 5개의 간단한 페이지를 만들어 보겠습니다.

`/html/contents/page1.html`부터 `/html/contents/page5.html`까지 동일한 구조의 파일을 생성합니다. 예시로 page1.html의 코드는 다음과 같습니다:

```html
<style type="text/css">
    .page1 .text {
        text-align: center;
    }
</style>

<article class="page1">
    <p class="text">page1</p>
</article>

<script type="text/javascript">
N(".page01").cont({
    init : function(view, request) {
        // 초기화 코드
    }
});
</script>
```

모든 페이지를 동일한 구조로 만들되, 클래스 이름과 텍스트 내용만 페이지 번호에 맞게 변경하면 됩니다.

## Grid로 데이터 조회/변경 하기

이 섹션에서는 Grid로 생성/조회/수정/삭제를 처리하기 위해 조회 조건 영역과 조회 결과 Grid로 이루어진 프로그램을 개발해 보겠습니다.

- 코드 데이터들은 Select(N.select) 컴포넌트를 사용하여 데이터를 바인딩
- Form(N.form) 컴포넌트로 조회 조건 영역을 폼으로 생성
- Grid(N.grid) 컴포넌트로 입력/조회/수정/삭제할 수 있는 그리드를 생성
- 버튼들은 Button(N.button) 컴포넌트를 사용

### 메뉴 추가

먼저 `/html/index/lefter.html` 파일을 열어 다음과 같이 ul 태그의 마지막에 li 요소를 추가하고 Grid CRUD 메뉴 링크(page6.html)를 추가합니다:

```html
<ul class="menu">
    <li><a href="html/contents/page1.html" data-docid="page1">MENU-1</a></li>
    <li><a href="html/contents/page2.html" data-docid="page2">MENU-2</a></li>
    <li><a href="html/contents/page3.html" data-docid="page3">MENU-3</a></li>
    <li><a href="html/contents/page4.html" data-docid="page4">MENU-4</a></li>
    <li><a href="html/contents/page5.html" data-docid="page5">MENU-5</a></li>
    <li><a href="html/contents/page6.html" data-docid="page6">Grid CRUD</a></li>
</ul>
```

### CRUD 페이지 View 영역 작성

`/html/contents/page6.html` 파일을 생성하고 다음과 같이 코드를 작성합니다:

```html
<!-- Style -->
<style type="text/css">
    .page6 {
        padding: 15px;
    }

    .page6 .search-conditions {
        border: 1px solid var(--md-sys-color-outline-variant);
        padding: 10px;
    }
    .page6 .search-conditions > label {
        margin-right: 40px;
    }
    .page6 .search-conditions input,
    .page6 .search-conditions select {
        margin-left: 10px;
    }

    .page6 .buttons {
        padding: 10px;
        text-align: right;
    }

    /* Grid Style */
    .page6 .result input {
        width: 90%;
        border-width: 1px;
    }
    .page6 table {
        border-spacing: 0;
        border-collapse: collapse;
        table-layout: fixed;
        width: 100%;
    }
    .page6 table th,
    .page6 table td {
        border: 1px solid var(--md-sys-color-outline-variant);
        box-sizing: border-box;
    }
</style>

<!-- View -->
<article class="page6">

    <div class="search-conditions">
        <label>Name<input id="name" type="text" data-validate='[["alphabet+integer"]]'></label>
        <label>Gender<input id="gender" type="radio"></label>
    </div>

    <div class="buttons">
        <a id="btnAdd" href="#">New</a>
        <a id="btnDelete" href="#">Delete</a>
        <a id="btnSave" href="#">Save</a>
        <a id="btnSearch" href="#">Search</a>
    </div>

    <div class="result">
        <table class="grid">
            <colgroup>
                <col style="width: 50px;">
                <col style="width: 120px;">
                <col style="width: auto;">
                <col style="width: 90px;">
                <col style="width: 50px;">
                <col style="width: 110px;">
                <col style="width: 60px;">
            </colgroup>
            <thead>
                <tr>
                    <th><input lang="ko_KR" id="checkAll" type="checkbox" title="Check All"></th>
                    <th>Name</th>
                    <th data-filter="true">Email</th>
                    <th data-filter="true">Eye Color</th>
                    <th data-filter="true">Age</th>
                    <th data-filter="true">Registered</th>
                    <th data-filter="true">Active</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td style="text-align: center;"><input class="checkAllTarget" type="checkbox"></td>
                    <td><input id="name" type="text" data-validate='[["required"]]'></td>
                    <td><input id="email" type="text" data-validate='[["required"], ["email"]]'></td>
                    <td style="text-align: center;">
                        <select id="eyeColor" data-validate='[["required"]]'>
                            <option value=""></option>
                        </select>
                    </td>
                    <td><input id="age" type="text" data-validate='[["required"], ["integer"]]'></td>
                    <td><input id="registered" type="text" data-format='[["date", 8, "date"]]' data-validate='[["required"]]'></td>
                    <td style="text-align: center;"><input id="isActive" type="checkbox"></td>
                </tr>
            </tbody>
        </table>
    </div>

</article>

<!-- Controller -->
<script type="text/javascript">
(function() {

    var cont = N(".page6").cont({
        init : function(view, request) {
            cont.initComponents();
            cont.bindEvents(this);
        },
        initComponents : function() {},
        bindEvents : function() {}
    });

})();
</script>
```

위에서 만든 HTML 구조에서:
- `.search-conditions` 요소는 검색조건을 입력할 수 있는 검색 폼입니다.
- `.buttons` 요소에는 CRUD 버튼들이 배치됩니다.
- `.result` 요소에는 조회된 결과 데이터를 Grid로 표현하기 위한 테이블이 있습니다.

### CRUD 페이지 Controller 구현

이제 컨트롤러 구현을 통해 각 컴포넌트를 초기화하고 이벤트를 바인딩해 보겠습니다.

#### N.select 초기화

먼저 N.select 컴포넌트로 코드 데이터를 바인딩합니다:

```javascript
initComponents : function() {
    cont.eyeColor = N([
        { key: "blue", val: "EYE_COLOR_01" },
        { key: "brown", val: "EYE_COLOR_02" },
        { key: "green", val: "EYE_COLOR_03" },
    ]).select({
        context : N("#eyeColor", cont.view)
    }).bind();

    cont.gender = N([
        { key: "female", val: "GENDER_01" },
        { key: "male", val: "GENDER_02"}
    ]).select({
        context : N("#gender", cont.view)
    }).bind();
}
```

서버에서 데이터를 조회해 온다면 다음과 같이 구현할 수 있습니다:

```javascript
initComponents : function() {
   cont.eyeColor = N([]).select({
        context : N("#eyeColor", cont.view),
        key : "codeName", // option 태그의 text로 표시될 프로퍼티명
        val : "codeValue" // option 태그의 value 속성으로 표시될 프로퍼티명
    });
   cont.gender = N([]).select({
        context : N("#gender", cont.view),
        key : "codeName",
        val : "codeValue"
    });

   N.comm("data/url.json").submit(function(data) {
           cont.eyeColor.bind(data["eyeColorList"]);
      cont.gender.bind(data["genderList"]);
   })
}
```

#### N.form 초기화

검색 폼 영역에 N.form 컴포넌트를 적용합니다:

```javascript
initComponents : function() {
   // ... 이전 코드 ...

   cont.form = N([]).form({
        context : N(".search-conditions", cont.view)
    }).add();
}
```

`.add()` 메서드를 호출하여 비어있는 데이터를 생성합니다. 이 경우 `cont.form.data()` 메서드를 실행하면 다음과 같은 데이터가 생성됩니다:

```javascript
[{
    "name" : "",
    "gender" : "",
    "rowStatus" : "insert"
}]
```

#### N.grid 초기화

그리드 영역에 N.grid 컴포넌트를 적용합니다:

```javascript
initComponents : function() {
    // ... 이전 코드 ...
    
    cont.grid = N([]).grid({
        context : N(".grid", cont.view),
        height : 300,
        resizable : true,
        sortable : true,
        checkAll : "#checkAll",
        checkAllTarget : ".checkAllTarget"
    }).bind();
}
```

### 이벤트 바인딩

이제 각 버튼에 대한 이벤트를 바인딩합니다:

#### Search 버튼 이벤트

```javascript
bindEvents : function() {
    N("#btnSearch", cont.view).on("click", function(e) {
        e.preventDefault();
        if(cont.form.validate()) {
            N(cont.form.data(true)).comm({
                url : "data.json",
                type : "GET"
            }).submit(function(data) {
                 // Data bind by N.grid
                 cont.grid.bind(data);
             });
        }
    }).button();
}
```

#### New 버튼 이벤트

```javascript
bindEvents : function() {
    // ... 이전 코드 ...
    
    N("#btnAdd", cont.view).on("click", function(e) {
        e.preventDefault();
        cont.grid.add();
    }).button();
}
```

#### Delete 버튼 이벤트

```javascript
bindEvents : function() {
    // ... 이전 코드 ...
    
    N("#btnDelete", cont.view).on("click", function(e) {
        e.preventDefault();
        var checkedIndexs = cont.grid.check();
        if(checkedIndexs.length > 0) {
            N(window).alert({
                msg : "Are you sure you want to delete?<br/>It will not be saved in DBMS until you press the Save button.",
                confirm : true,
                onOk : function() {
                    cont.grid.remove(checkedIndexs);
                }
            }).show();
        } else {
            N(window).alert("No rows selected.").show();
        }
    }).button();
}
```

#### Save 버튼 이벤트

```javascript
bindEvents : function() {
    // ... 이전 코드 ...
    
    N("#btnSave", cont.view).on("click", function(e) {
        e.preventDefault();

        if(cont.grid.data("modified").length === 0) {
            N.notify.add("No data has been changed.");
            return false;
        }

        if(cont.grid.validate()) {
            N(window).alert({
                msg : "Do you want to save?",
                confirm : true,
                onOk : function() {
                    N(cont.grid.data("modified")).comm({
                       type : "GET",
                        dataIsArray : true,
                        url : "data.json"
                    }).submit(function(data) {
                        N.notify.add("Save completed.");
                        N("#btnSearch", cont.view).trigger("click");
                    });
                }
            }).show();
        }
    }).button();
}
```

저장 이벤트의 주요 특징:
1. 변경된 데이터 체크: `cont.grid.data("modified").length === 0`
2. 입력 값에 대한 유효성 체크: `cont.grid.validate()`
3. 저장할 것인지 물어보는 Confirm 다이얼로그 표시
4. 변경된 데이터를 서버로 전송: `N(cont.grid.data("modified")).comm(...)`

입력 요소의 값을 변경하거나 `cont.grid.val()` 메서드로 데이터를 변경하면 `rowStatus` 프로퍼티가 생성됩니다. rowStatus 값은 "insert", "update", "delete" 중 하나가 되며, 서버에서는 행 데이터 객체마다 정의되어 있는 rowStatus 값으로 입력/수정/삭제를 구분해서 처리하면 됩니다.

----

Natural-JS의 기본 환경 구성, 웹 애플리케이션 프레임 구현, Grid CRUD 기능 구현을 통해 Natural-JS의 핵심 기능과 사용법을 살펴보았습니다. 

이 가이드를 따라 진행하면 Natural-JS의 기본적인 기능을 이해하고 실제 웹 애플리케이션을 개발할 수 있는 기반을 마련할 수 있습니다. 더 많은 예제와 상세한 API 문서는 각 컴포넌트별 문서를 참고하시기 바랍니다.