Natural-JS 시작하기
===

## Natural-JS 환경설정과 Communicator(N.comm), Controller(N.cont)

먼저 다음 중 한 가지 방법으로 Natural-JS 라이브러리 파일들을 다운로드 하세요.

1.  [GitHub](https://github.com/bbalganjjm/natural_js) 에서 직접 다운로드
2.  npm : npm install @bbalganjjm/natural_js
3.  Bower : bower install natural_js

다운로드 된 파일 들 중 Natural-JS 를 구동하기 위한 필수 라이브러리 파일들은 다음과 같습니다.

1.  **jquery-1.12.4.min.js** - Natural-JS 는 jQuery 를 기반으로 동작 하므로 반드시 임포트 해야합니다.
2.  **natural.ui.css** - Natural-UI 디자인과 관련 된 스타일시트 파일 입니다.
3.  **natural.js.min.js** - Natural-JS 의 전체 라이브러리 파일들이 합쳐진 Minified 파일 입니다.
4.  **natural.config.js** - Natural-JS 의 환경설정 파일 입니다.

이제 최상위 HTML 파일을 만들고 위 파일들을 다음과 같은 순서로 페이지에 Import 해 줍니다.

    <script type="text/javascript" src="js/natural_js/lib/jquery-1.12.4.min.js"></script>
    <link rel="stylesheet" type="text/css" href="js/natural_js/css/natural.ui.css" />
    <script type="text/javascript" src="js/natural_js/natural.js.min.js"></script>
    <script type="text/javascript" src="js/natural_js/natural.config.js"></script>

CORE, ARCHITECTURE, DATA, UI, UI.Shell 전체를 사용하기 원한다면 natural.js.min.js 를 임포트(Import) 하고 각 패키지 별로 따로 사용하기 원한다면 따로 임포트 하면 됩니다.

각 패키지 별 의존 관계는 다음과 같습니다.

*   Natural-CORE 만 사용할 경우 : natural.core.js
*   Natural-ARCHITECTURE 만 사용할 경우 : natural.core.js, natural.architecture.js
*   Natural-DATA 만 사용할 경우 : natural.core.js, natural.data.js
*   Natural-UI 만 사용할 경우 : natural.core.js, natural.data.js, natural.ui.js
*   Natural-UI.Shell 만 사용할 경우 : natural.core.js, natural.ui.js, natural.ui.shell.js

Natural-JS의 모든 라이브러리가 합쳐진 natural.js.min.js 의 용량이 210kb 정도 밖에 되지 않기 때문에 natural.js.min.js 만 임포트 해도 성능에 큰 영향을 미치지 않습니다.

라이브러리를 임포트 했으니 Natural-JS 의 구동 환경을 설정 해 볼까요?

Natural-JS 의 환경설정 파일인 natural.config.js 파일을 열어보세요.

    /* Natural-ARCHITECTURE Config */
    N.context.attr("architecture", {
    	"page" : {
    		"context" : "#natural_contents"
    	},
    	...
    /* Natural-UI Config */
    N.context.attr("ui", {
    	"alert" : {
    		"container" : "#natural_contents"
    	...

위와 같은 JSON 타입의 구문이 보일겁니다. JSON 이 뭔지는 아시죠? 아주 쉬워요. 모르시면 아래 URL 을 클릭 해서 참고 하시구요.

[http://www.json.org/json-ko.html](http://www.json.org/json-ko.html)

Natrual-JS 에서 JSON 은 아주 중요 합니다. 서버와 송수신하는 데이터 타입이 JSON 형태의 문자열이고 컴포넌트에 바인드 되는 데이터도 JSON 객체들로 구성 된 배열 객체 입니다.

다시 본론으로... Natural-JS의 환경설정값은 Context(N.context) 객체에 저장 됩니다. 환경설정값중 위 구문에 해당하는 N.context.attr("architecture").page.context 값은 아주 중요한 값입니다. 이 값은 Natural-JS의 컴포넌트 요소들이 적재 될 컨테이너 요소를 jQuery Selector 문자열로 지정하면 됩니다. 쉽게말해 페이지 컨텐츠들을 표시 할 동적으로 변하지 않는 박스 요소를 지정 하면 됩니다. 더불어, N.context.attr("ui").alert.context 값에 N.alert HTML 요소를 저장하는 컨테이너 요소의 selector 를 지정 해 주세요. 보통 N.context.attr("architecture").page.context 값과 같은 요소를 지정하면 됩니다. Tab(N.tab) 이나 Popup(N.popup), Datepicker(N.datepicker)등 Natural-UI에서 지원하는 컴포넌트들의 자원이 여기(N.context.attr...context)에서 지정한 영역에 생성되고 페이지가 전환 될 때 이 영역에 다시 덮어 씌움으로서 브라우저의 자원을 반환하게 됩니다. 페이지 Redirect를 하지 않는 Single Page Web Application을 개발 할 때 브라우저 리소스를 따로 관리 하지 않아도 되어서 편리 하겠죠? 그 외 환경설정 값들은 [API/DEMO] > [Natural-CORE] > [Config 탭]의 내용중 [Config 예시] 부분을 참고 하세요.

N.config(natural.config.js) 에는 대부분 UI 컴포넌트들의 전역 설정값들이 지정 되어 있고 모든 컴포넌트들은 여기에서 설정한 옵션값들을 기본으로 구동 됩니다.

Natural-JS의 컴포넌트 옵션의 적용 우선순위는 다음과 같습니다.

1.  컴포넌트를 초기화 할 때 지정한 옵션 값
2.  환경설정(N.config)에서 지정한 옵션 값
3.  컴포넌트의 기본 옵션 값

컴포넌트 클래스의 기본 옵션값중 환경설정 파일(natural.config.js)에 지정되지 않은 옵션값들은 컴포넌트 초기화 시 따로 옵션을 지정하지 않았다면 컴포넌트 클래스의 기본옵션값으로 동작 됩니다. 환경설정 파일에 정의되지 않은 컴포넌트 클래스의 기본 옵션값을 사이트 전역 옵션값으로 설정하고 싶다면 환경설정 파일의 해당 컴포넌트 부분에 추가 하면 됩니다. 예를 들어 사이트내에서 동작되는 모든 그리드 컴포넌트 Body영역의 높이를 300픽셀로 기본값을 설정하고 싶다면 N.context.attr("ui").grid 부분에 다음과 같이 추가하면 됩니다.

    N.context.attr("ui", {
    	...
    	"grid" : {
    		...
    		"height" : 300,
    		...
    	}
    	...

"..." 은 생략 기호이니 그대로 넣지 마세요. ^^
자~ 그럼 이제 환경설정은 끝났으니 본격적으로 개발을 시작 해 볼까요?

Natural-JS는 페이지 블록의 소스코드에서 개발영역과 디자인영역을 구분하고 요소(Element)간, 스크립트 간 영역(scope)을 보장 해 주기위한 간단한 소스코드의 구성 규칙이 있습니다. 별로 어렵지 않습니다. 다음과 같이 View 영역과 Controller 영역을 구분하고 순서대로 배치만 해 주면 됩니다.

[c:/natural\_js/test_html.html]

    <!-- View Context -->
    <div id="viewCont">
    	<div id="result">
    	</div>
    </div>
    <!-- View Context -->

    <script type="text/javascript">
    N("#viewCont").cont({
    	/* Controller Context */
    	init : function(view, request) {
        	// Start here.
        }
        /* Controller Context */
    });

    </script>

Natural-ARCHITECTURE 기반의 모든 페이지나 페이지 블록 들은 반드시 위와 같은 코드 폼으로 구성되어 있어야 합니다.

위 코드를 "c:/natural\_js/test\_html.html" 파일로 저장하고 아래 코드를 "c:/natural\_js/index.html" 파일로 저장 해 주세요.
"c:/natural\_js/index.html" 파일에서 "c:/natural\_js/test_html.html" 파일을 불러와 보겠습니다.

[c:/natural\_js/index.html]

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
        ...
    });
    </script>

    </head>
    <body>
    	<div id="header">
    		<a id="logo" href="index.html">Natural-JS</a>
    	</div>
    	<div id="natural_contents">
    		<!-- This area is the page context(N.context.attr("architecture").page.context). -->
    	</div>
    </body>
    </html>

$(document).ready는 불러 온 HTML 파일의 DOM 요소들이 브라우저에 적재가 완료 된 다음에 인자로 지정한 콜백함수를 실행 시켜주는 jQuery 에서 제공하는 함수 입니다.

이제 메인 페이지에서 위에서 작성 한 "test_html.html" 파일의 내용을 불러와 볼겁니다. Natural-JS는 서버와의 데이터 및 파일을 송수신 하는데 Communicator(N.comm)(이하 N.comm) 모듈을 사용 합니다. Communicator에 대한 자세한 내용은 [API/DEMO > Natural-ARCHITECTURE > Communicator탭] 화면의 내용를 참고 해 주세요.
$(document).ready() 함수의 콜백 인자의 내용을 아래 구문으로 바꿔 주세요.

    ...
    $(document).ready(function() {
    	N(N.context.attr("architecture").page.context).comm("test_html.html").submit()
    })
    ...

이제 "index.html" 파일을 실행하면 natural.config.js에서 정의한 N.context.attr("architecture").page.context의 값으로 지정한 "#natural_contents" 요소에 N.comm을 통해 가져온 HTML파일의 내용을 넣어 주고 바로 Controller(N.cont)의 init 함수를 실행 해 줍니다.

페이지를 불러왔으니 이제는 N.comm 으로 데이터를 불러와 보겠습니다.

Natural-JS 의 컴포넌트 데이터 및 데이터 송수신을 위한 데이터 타입은 JSON 이라고 했었죠?

먼저 json 타입으로 데이터를 서비스 해 주는 서버가 필요 하지만 이 문서에서는 데이터를 서비스 해 주는 서버단의 작업에 대해서는 생략 하겠습니다. Spring MVC 나 PHP 로 간단하게 List 나 Map 타입의 객체를 JSON 타입으로 변환 해 주는 모듈들이 많이 있습니다. 아래 사이트에 방문하면 프로그래밍 언어별 변환모듈에 대한 정보가 많이 있습니다.

[http://www.json.org/json-ko.html](http://www.json.org/json-ko.html)

이제 다음과 같은 JSON 문자열로 구성 된 데이터 파일(c:/natural\_js/test_data.json)을 생성 하고 저장 합니다.

[c:/natural\_js/test\_data.json]

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

위 파일 들을 웹 서버 에서 구동 해야 정상 이지만 간단하게 확인하기 위해서 웹 브라우저로 로컬 파일들을 불러와 처리 해 보겠습니다.

대부분의 웹 브라우저는 Ajax로 로컬파일을 참조할 수 없도록 막혀 있습니다. 그러나 파이어폭스는 그냥 열려있네요? IE 도 보안 경고 메시지가 표시 되면 허용 해 주면 됩니다. 크롬도 이걸 해제 할 수 있는 방법이 있는데 찾아 보세요. ^^ 일단 파이어폭스로 해 보겠습니다.

    ...
    N("#viewCont").cont({
    	init : function(view, request) {
    		N.comm("test_data.json").submit(function(data) {
    			// data is received data from the server
    			N("#result", view).text(JSON.stringify(data));
    		});
        }
    });

미리 만들어 놓은 "c:/natural\_js/index.html" 파일을 웹 브라우저로 열어 보세요. index 페이지에 의해 "c:/natural\_js/test\_html.html" 파일이 로딩되고 N.cont 의 인자로 지정 한 오브젝트의 init 함수가 실행 될 것 입니다. 그 다음 위 코드가 실행 되면서 id 가 result 인 div 요소안에 불러온 파일의 내용이 표시 될 것 입니다.
데이터를 조회 할 수 있는 서버가 있다면 "c:/natural\_js/test\_data.json" 대신 해당 서비스의 URL 을 입력 하면 됩니다.
서버에 파라미터를 보내고 싶다면 다음과 같이 N()함수의 인자로 JSON 타입의 파라미터를 넣고 실행 해 주세요. 그러면 그 값이 HTTP Request Body 에 실려 서버로 보내지게 됩니다.

서버에서 JSON 타입의 파라미터 문자열을 Map 이나 List 같은 객체로 변환 해서 사용하려면 [JSON 변환 모듈](http://www.json.org/json-ko.html) 이 있어야 합니다.

    ...
    N("#viewCont").cont({
    	init : function(view, request) {
    		N({ "param1" : "This is parameter 1" }).comm("test_data.json").submit(function(data) {
    			// data is received data from the server
    			N("#result", view).text(JSON.stringify(data));
    		});
        }
    });

[Fiddler](https://www.telerik.com/fiddler)나 브라우저에서 제공하는 개발자 도구의 Network 탭을 선택하고 페이지를 리프레쉬 한 다음 요청한 URL을 확인 해 보면 { "param1" : "This is parameter 1" } 라는 텍스트가 요청 한 URL 로 전송 되는 것을 확인 할 수 있습니다.

N().comm 에서 N() 함수의 인자로 HTML 요소나 jQuery select 문자열이 지정 되면 지정 한 요소 안에 불러 온 HTML 블록 페이지를 넣어주고 JSON 형태의 오브젝트를 지정 하면 요청한 URL의 요청 파라미터가 됩니다.
N.comm 과 N.cont 에서 제공되는 기능에 대한 자세한 내용은 [Natural-ARCHITECTURE API 문서](html/refr/refr0103.html)를 참고 하세요.

이제 기본 구조를 알았으니 [API 문서](html/refr/refr0101.html)를 참고 해서 신나게 개발 해 볼까요?

지금 보고 있는 이 사이트도 Natural-JS 로 개발 된 사이트 입니다. 이 사이트의 소스 코드는 [Github 의 gh-pages 브랜치](https://github.com/bbalganjjm/natural_js/tree/gh-pages)에 공개 되어 있으니 참고 바랍니다.