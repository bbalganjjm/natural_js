# API 문서 안내

API 문서는 Natural-JS의 구성 요소와 라이브러리가 지원하는 기능과 옵션에 대한 사용 방법과 설명을 제공합니다.

문서는 구성 요소별로 페이지로 나뉘며, 페이지 문단은 탭으로 구분됩니다.

* **개요**: 컴포넌트 또는 라이브러리 개요.

* **API DEMO**: 실시간으로 컴포넌트나 라이브러리를 테스트하기 위한 데모 프로그램.

* **생성자**: 컴포넌트 인스턴스나 라이브러리 인스턴스가 생성될 때 실행되는 함수와 생성자 인수에 대한 설명.

    예) **N.grid**[<sup>1)</sup>](#fn1)(***argument[0]***[<sup>2)</sup>](#fn2)), **N().grid**(***argument[0]***)

* **기본 옵션**: 컴포넌트 또는 라이브러리의 기본 옵션에 대한 설명.

    예) N([]).grid(**{ resizeable: true }**[<sup>3)</sup>](#fn3))

* **선언형 옵션**: 컴포넌트나 라이브러리가 사용하는 템플릿 HTML 요소의 data-* 속성에 JSON 형식으로 정의된 옵션.

    예) &lt;input id="date" type="text" **data-format='[["date", 8]]'**[<sup>4)</sup>](#fn4) /&gt;
    
    * 선언형 옵션은 다음과 같은 속성으로 정의할 수 있습니다:
      1. 포맷 룰(Format Rules): data-format
      2. 검증 룰(Validation Rules): data-validate
      3. a와 b를 제외한 모든 컴포넌트 옵션: data-opts

> 선언형 옵션은 JSON 표준 형식을 정확하게 준수해야 합니다(키 값은 반드시 큰 따옴표로 감싸야합니다). JSON 표준 포맷을 지키지 않으면 선언형 옵션이 인식되지 않거나 오류가 발생합니다.

> data-format이나 data-validate 등 선언형 옵션으로 실행되는 룰은 배열 형태의 문자열로 정의하고 룰명 다음에 인수들을 순서대로 나열합니다.
> 예) data-format='[["date", 8], ["lpad", 10, "@"]]'

* **함수**: 컴포넌트나 라이브러리 인스턴스에서 제공하는 메서드와 arguments에 대한 설명

    예) N([]).grid({ resizeable: true }).**revert**[<sup>5)</sup>](#fn5)(**3**[<sup>6)</sup>](#fn6))

* **예제**: 컴포넌트나 라이브러리 사용예제

---

**용어**
* jQuery object: jQuery() 나 $(), N() 함수를 실행했을 때 반환되는 jQuery 확장 객체 나 jQuery selector.
* selector: jQuery에서 CSS selector 폼으로 지정하는 문자열이나 object, array, html element, function 등.

---

**주석**
1. <span id="fn1">생성자</span>
2. <span id="fn2">생성자 arguments</span>
3. <span id="fn3">기본 옵션</span>
4. <span id="fn4">선언형 옵션</span>
5. <span id="fn5">함수</span>
6. <span id="fn6">함수 arguments</span>
