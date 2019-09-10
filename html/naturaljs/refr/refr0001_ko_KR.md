API 문서 안내
===

API 문서는 Natural-JS 의 컴포넌트와 라이브러리에서 제공하는 기능과 옵션에 대한 사용법과 설명을 제공하는 문서입니다.

문서는 컴포넌트 라이브러리 단위로 메뉴가 구분 되어 있고 메뉴 별 단락은 다음과 같이 구성 되어 있습니다.

* __개요__ : 컴포넌트나 라이브러리에 대한 개요.

* __API DEMO__ : 해당 라이브러리나 컴포넌트를 실시간으로 테스트 할 수 있는 데모 프로그램

<p class="alert">Grid 나 Form, Popup 등의 컴포넌트 디자인은 사이트에서 전역으로 정의한 table, div, input 등 각 __컴포넌트의 생성을 위한 템플릿 요소에 정의된 Style 속성에 따라 UI 컴포넌트의 모양 및 색상이 결정__ 됩니다. UI 컴포넌트들의 상세 디자인을 변경하려면 __"natural_js/css/natural.ui.css"__ 파일을 수정하기 바랍니다.</p>

<p class="alert">Internet Explorer 8 브라우저에서만 textarea에 text로 지정된 구문이 실제 Function객체로 인스턴스화 되지않아 오류가 발생합니다. 이는 데모페이지안에서 컴포넌트들의 이벤트 콜백을 지정하는 부분에서만 발생하는 오류이므로 안심하고 사용해도 됩니다. 실제 개발에서는 이런오류가 발생하지 않습니다.</p>


* __생성자__ : 컴포넌트나 라이브러리를 생성할 때 실행되는 기능과 생성자 arguments 에 대한 설명

	예) __N.grid__[<sup>1)</sup>](#fn1)(___argument[0]___[<sup>2)</sup>](#fn2)), __N().grid__(___argument[0]___)

* __기본옵션__ : 컴포넌트나 라이브러리를 생성할 때 생성자 argument로 지정되는 옵션에 대한 설명

	예) N([]).grid(__{ resizeable : true }__[<sup>3)</sup>](#fn3))

* __선언형옵션__ : 컴포넌트나 라이브러리에서 사용하는 HTML 요소(Element)들의 data-* 속성에 정의되는 JSON 타입의 문자열로 정의 되는 옵션

	예) &lt;input id="date" type="text" __data-format='[["date", 8]]'__[<sup>4)</sup>](#fn4) /&gt;

	* 선언형 옵션은 다음과 같은 속성으로 정의 할 수 있습니다.
		1. 포멧 룰(Format Rules) : data-format
		2. 검증 룰(Validation Rules) : data-validate
		3. a, b를 제외한 모든 컴포넌트 옵션 : data-opts

<p class="alert">선언형 옵션은 JSON 표준 양식을 정확히 지켜줘야 합니다. 예를 들면 key 값에도 큰따옴표(")로 무조건 감싸줘야 하는 등 JSON 표준 양식을 지키지 않으면 선언형 옵션이 인식되지 않거나 오류가 발생합니다.</p>

<div class="alert">data-format 이나 data-validate 등 선언형 옵션으로 실행되는 룰 들의 인자들(arguments)은 배열(array) 타입으로 정의하고 인자 순서대로 나열 합니다.
<div class="alert">예) data-format='[["date", 8], ["lpad", 10, "@"]]'</div></div>
* __함수__ : 컴포넌트나 라이브러리 인스턴스에서 제공하는 기능과 arguments 에 대한 설명

	예) N([]).grid( { resizeable : true } ).__revert__[<sup>5)</sup>](#fn5)(__3__[<sup>6)</sup>](#fn6))

* __예제__ : 간단한 예제

---

__용어__
* jquery object : jQuery()를 실행하면 반환되는 jQuery 확장 객체 나 jQuery selector
* selector : jQuery에서 CSS selector 타입으로 지정하는 string 타입의 문자열이나 object, array, html element, function 등의 object

---

__주석__
1. <span id="fn1">생성자</span>
2. <span id="fn2">생성자 arguments</span>
3. <span id="fn3">기본옵션</span>
4. <span id="fn4">선언형옵션</span>
5. <span id="fn5">함수</span>
6. <span id="fn6">함수 arguments</span>