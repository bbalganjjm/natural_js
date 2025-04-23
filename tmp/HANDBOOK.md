# Natural-JS 핸드북

## 목차

1. [소개](#소개)
2. [Natural-CORE](#natural-core)
3. [Natural-ARCHITECTURE](#natural-architecture)
4. [Natural-DATA](#natural-data)
5. [Natural-UI](#natural-ui)
6. [Natural-UI.Shell](#natural-uishell)
7. [Natural-CODE](#natural-code)
8. [Natural-TEMPLATE](#natural-template)

## 소개

Natural-JS는 웹 애플리케이션 개발을 위한 JavaScript 프레임워크입니다. jQuery를 기반으로 하며, 다양한 UI 컴포넌트와 데이터 처리 기능을 제공합니다. Natural-JS는 다음과 같은 패키지로 구성되어 있습니다:

- **Natural-CORE**: 기본 유틸리티 함수와 확장 기능
- **Natural-ARCHITECTURE**: 통신, 컨트롤러, 애플리케이션 컨텍스트 관리
- **Natural-DATA**: 데이터 처리, 검증, 포맷팅, 데이터 바인딩
- **Natural-UI**: 버튼, 데이트피커, 팝업, 탭, 폼, 그리드 등의 UI 컴포넌트
- **Natural-UI.Shell**: 전역 알림, 문서 컨테이너 등의 UI 컴포넌트
- **Natural-CODE**: 코드 관리 기능
- **Natural-TEMPLATE**: 템플릿 관리 기능

Natural-JS는 `N()` 함수를 통해 접근할 수 있으며, 이 함수는 jQuery의 `$()` 함수를 확장한 것입니다. 따라서 jQuery의 모든 기능을 사용할 수 있으며, Natural-JS의 추가 기능도 사용할 수 있습니다.

```javascript
// jQuery 방식
$("#element").html("Hello, World!");

// Natural-JS 방식
N("#element").html("Hello, World!");
```

## Natural-CORE

Natural-CORE는 Natural-JS의 기본 유틸리티 함수와 확장 기능을 제공하는 패키지입니다.

### 주요 함수

#### N.locale

현재 로케일을 설정하거나 가져옵니다.

```javascript
// 로케일 설정
N.locale("ko_KR");

// 현재 로케일 가져오기
var currentLocale = N.locale();
```

#### N.debug, N.log, N.info, N.warn, N.error

콘솔에 메시지를 출력하는 함수입니다.

```javascript
N.debug("디버그 메시지");
N.log("로그 메시지");
N.info("정보 메시지");
N.warn("경고 메시지");
N.error("에러 메시지");
```

#### N.type

객체의 타입을 반환합니다.

```javascript
N.type("문자열"); // "string"
N.type(123); // "number"
N.type([]); // "array"
N.type({}); // "object"
N.type(function() {}); // "function"
N.type(new Date()); // "date"
```

#### N.isString, N.isNumeric, N.isPlainObject, N.isEmptyObject, N.isArray, N.isArraylike, N.isWrappedSet, N.isElement

객체의 타입을 확인하는 함수입니다.

```javascript
N.isString("문자열"); // true
N.isNumeric("123"); // true
N.isPlainObject({}); // true
N.isEmptyObject({}); // true
N.isArray([]); // true
N.isArraylike(document.querySelectorAll("div")); // true
N.isWrappedSet(N("div")); // true
N.isElement(document.body); // true
```

#### N.toSelector

객체를 선택자 문자열로 변환합니다.

```javascript
N.toSelector(document.body); // "body"
```

#### N.serialExecute

함수를 직렬로 실행합니다.

```javascript
N.serialExecute([
    function() {
        console.log("첫 번째 함수");
    },
    function() {
        console.log("두 번째 함수");
    }
]);
```

#### N.gc

가비지 컬렉션을 수행합니다.

```javascript
N.gc();
```

#### N.string

문자열 관련 유틸리티 함수를 제공합니다.

```javascript
// 문자열 포맷팅
N.string.format("Hello, {0}!", "World"); // "Hello, World!"

// 문자열 바이트 길이 계산
N.string.byteLength("안녕하세요"); // 15 (UTF-8 기준)

// 문자열 자르기
N.string.cut("안녕하세요", 6); // "안녕"
```

#### N.date

날짜 관련 유틸리티 함수를 제공합니다.

```javascript
// 현재 날짜를 포맷팅
N.date.format(new Date(), "yyyy-MM-dd"); // "2023-07-01"

// 날짜 문자열 파싱
var date = N.date.parse("2023-07-01", "yyyy-MM-dd");
```

#### N.element

DOM 엘리먼트 관련 유틸리티 함수를 제공합니다.

```javascript
// 엘리먼트의 절대 위치 가져오기
var pos = N.element.offset(document.body);
```

#### N.browser

브라우저 정보를 제공합니다.

```javascript
N.browser.name; // 브라우저 이름
N.browser.version; // 브라우저 버전
```

#### N.message

메시지 리소스를 관리합니다.

```javascript
// 메시지 리소스 추가
N.message.add({
    "greeting": {
        "ko_KR": "안녕하세요",
        "en_US": "Hello"
    }
});

// 메시지 가져오기
N.message.get("greeting"); // 현재 로케일에 맞는 메시지 반환
```

#### N.array

배열 관련 유틸리티 함수를 제공합니다.

```javascript
// 배열에서 특정 값 제거
N.array.remove([1, 2, 3], 2); // [1, 3]
```

#### N.json

JSON 관련 유틸리티 함수를 제공합니다.

```javascript
// JSON 문자열 파싱
var obj = N.json.parse('{"name":"홍길동"}');
```

#### N.event

이벤트 관련 유틸리티 함수를 제공합니다.

```javascript
// 이벤트 바인딩
N.event.on(document.body, "click", function(e) {
    console.log("클릭!");
});
```

#### N.mask

마스킹 관련 유틸리티 함수를 제공합니다.

```javascript
// 전화번호 마스킹
N.mask.phone("01012345678"); // "010-1234-5678"
```

## Natural-ARCHITECTURE

Natural-ARCHITECTURE는 통신, 컨트롤러, 애플리케이션 컨텍스트 관리 기능을 제공하는 패키지입니다.

### 주요 함수

#### N.ajax

비동기 HTTP 요청을 수행합니다.

```javascript
N.ajax({
    url: "/api/data",
    type: "GET",
    success: function(data) {
        console.log(data);
    },
    error: function(xhr, status, error) {
        console.error(error);
    }
});
```

#### N.comm

서버와의 통신을 지원하는 라이브러리입니다.

```javascript
// 데이터 요청
N.comm({
    url: "/api/data",
    success: function(data) {
        console.log(data);
    }
});

// 파라미터 전달
N.comm({
    url: "/api/data",
    data: {
        id: 1,
        name: "홍길동"
    },
    success: function(data) {
        console.log(data);
    }
});
```

##### 옵션

- **url** (string): 요청을 보낼 URL입니다.
- **contentType** (string): 서버로 데이터를 보낼 때 사용할 콘텐츠 타입입니다. 기본값은 "application/x-www-form-urlencoded; charset=UTF-8"입니다.
- **enctype** (string): 서버에 폼을 제출할 때 사용되는 MIME 타입입니다. 가능한 값은 "application/x-www-form-urlencoded", "multipart/form-data", "text/plain"입니다.
- **cache** (boolean): false로 설정하면 브라우저가 요청된 페이지를 캐시하지 않도록 합니다.
- **async** (boolean): 비동기 요청 여부를 설정합니다. 기본값은 true입니다.
- **type** (string): HTTP 메서드를 지정합니다. "GET", "POST", "PUT", "DELETE" 등이 가능합니다.
- **data** (object | string): 서버로 보낼 데이터입니다.
- **dataType** (string): 서버에서 받을 데이터 타입을 지정합니다. "xml", "html", "script", "json", "jsonp", "text" 등이 가능합니다.
- **crossDomain** (boolean): 크로스 도메인 요청 여부를 설정합니다.
- **referrer** (string): 요청 시 브라우저의 location.href 값입니다.
- **dataIsArray** (boolean): true로 설정하면 N 함수의 인수로 지정된 파라미터 객체를 배열 타입으로 지정할 수 있습니다.
- **urlSync** (boolean): false로 설정하면 서버에 요청할 때의 location.href와 서버에서 응답을 받을 때의 location.href가 다르더라도 응답이 차단되지 않습니다.
- **append** (boolean): true로 설정하면 로드된 페이지가 target 옵션으로 지정된 요소에 덮어쓰기가 아닌 추가됩니다.
- **target** (NJS<HTMLElement[]>): HTML 콘텐츠를 삽입할 요소를 지정합니다.

#### N.cont

컨트롤러 객체를 생성하고 초기화합니다.

```javascript
// 컨트롤러 생성
N(".view").cont({
    init: function(view, request) {
        // 초기화 코드
        console.log("컨트롤러 초기화");
    },
    search: function() {
        // 검색 기능 구현
    }
});

// 특정 페이지의 컨트롤러 가져오기
var pageCont = N("#page01").instance("cont");
```

##### 컨트롤러 객체 속성

- **init** (function): 컨트롤러가 초기화될 때 호출되는 함수입니다. view(뷰 요소)와 request(요청 객체) 두 개의 인자를 받습니다.
- **view** (NJS<HTMLElement[]>): 뷰 요소입니다. init 함수의 첫 번째 인자와 동일합니다.
- **request** (NA.Request): Communicator.request 객체의 인스턴스입니다. init 함수의 두 번째 인자와 동일합니다.
- **caller** (NU.Popup & NU.Tab): N.popup 또는 N.tab 컴포넌트에 의해 팝업 페이지가 호출된 경우, 이는 호출 컴포넌트의 인스턴스입니다. 이 인스턴스를 사용하여 부모 페이지를 제어할 수 있습니다.
- **opener** (BaseObject & NT.Objects.Controller.Object): N.popup 또는 N.tab 컴포넌트에 의해 팝업 페이지가 호출된 경우, 이는 부모 페이지의 컨트롤러 객체 인스턴스입니다. 이 인스턴스를 사용하여 부모 페이지를 제어할 수 있습니다.
- **onOpen** (function): 팝업 및 탭에서 문자열로 지정된 onOpen 옵션의 함수 구현입니다.

#### N.context

애플리케이션의 생명주기 동안 데이터 지속성을 보장하는 공간입니다.

```javascript
// 데이터 저장
N.context.attr("key", "value");

// 데이터 가져오기
var value = N.context.attr("key");
```

#### N.config

Natural-JS의 환경 설정, AOP 설정, 통신 필터 설정, UI 컴포넌트의 전역 옵션 값을 저장합니다.

```javascript
// 설정 가져오기
var coreConfig = N.context.attr("core");
var uiConfig = N.context.attr("ui");

// 설정 변경
N.context.attr("ui").alert.container = "body";
```

## Natural-DATA

Natural-DATA는 데이터 처리, 검증, 포맷팅, 데이터 바인딩 기능을 제공하는 패키지입니다.

### 주요 함수

#### N.ds

양방향 데이터 바인딩을 처리하는 모듈입니다.

```javascript
// 데이터 바인딩
var ds = N.ds("form");
ds.bind({
    name: "홍길동",
    age: 30
});

// 데이터 가져오기
var data = ds.data();
```

#### N.formatter

데이터 포맷팅 기능을 제공합니다.

```javascript
// 숫자 포맷팅
N.formatter.number(1234567); // "1,234,567"

// 날짜 포맷팅
N.formatter.date("20230701", "yyyy-MM-dd"); // "2023-07-01"
```

##### 포맷 규칙

Natural-JS는 다양한 포맷 규칙을 제공합니다. 이러한 규칙은 데이터 바인딩 컴포넌트(N.form, N.list, N.grid 등)에서 data-format 속성을 통해 선언적으로 사용할 수 있습니다.

- **commas** (콤마): 숫자에 천 단위 구분 기호를 추가합니다.
- **rrn** (주민등록번호): 주민등록번호 형식으로 포맷팅합니다.
- **ssn** (사회보장번호): 미국 사회보장번호 형식으로 포맷팅합니다.
- **kbrn** (사업자등록번호): 한국 사업자등록번호 형식으로 포맷팅합니다.
- **kcn** (법인등록번호): 한국 법인등록번호 형식으로 포맷팅합니다.
- **upper** (대문자): 문자열을 대문자로 변환합니다.
- **lower** (소문자): 문자열을 소문자로 변환합니다.
- **capitalize** (첫 글자 대문자): 문자열의 첫 글자를 대문자로 변환합니다.
- **zipcode** (우편번호): 우편번호 형식으로 포맷팅합니다.
- **phone** (전화번호): 전화번호 형식으로 포맷팅합니다.
- **realnum** (실수): 실수 형식으로 포맷팅합니다.
- **trimtoempty** (공백 제거 후 빈 문자열): 문자열의 앞뒤 공백을 제거하고, 결과가 빈 문자열이면 빈 문자열을 반환합니다.
- **trimtozero** (공백 제거 후 0): 문자열의 앞뒤 공백을 제거하고, 결과가 빈 문자열이면 "0"을 반환합니다.
- **trimtoval** (공백 제거 후 값): 문자열의 앞뒤 공백을 제거하고, 결과가 빈 문자열이면 지정된 값을 반환합니다.
- **date** (날짜): 날짜 형식으로 포맷팅합니다.
- **time** (시간): 시간 형식으로 포맷팅합니다.
- **limit** (제한): 문자열의 길이를 제한합니다.
- **replace** (대체): 문자열의 일부를 다른 문자열로 대체합니다.
- **lpad** (왼쪽 패딩): 문자열의 왼쪽에 지정된 문자를 추가하여 지정된 길이로 만듭니다.
- **rpad** (오른쪽 패딩): 문자열의 오른쪽에 지정된 문자를 추가하여 지정된 길이로 만듭니다.
- **mask** (마스킹): 문자열의 일부를 마스킹 처리합니다.
- **generic** (일반): 사용자 정의 포맷 함수를 사용합니다.
- **numeric** (숫자): 숫자 형식으로 포맷팅합니다.

##### 마스킹 규칙

- **phone** (전화번호): 전화번호를 마스킹 처리합니다.
- **email** (이메일): 이메일 주소를 마스킹 처리합니다.
- **address** (주소): 주소를 마스킹 처리합니다.
- **name** (이름): 이름을 마스킹 처리합니다.
- **rrn** (주민등록번호): 주민등록번호를 마스킹 처리합니다.

#### N.validator

데이터 검증 기능을 제공합니다.

```javascript
// 필수 입력 검증
N.validator.required(""); // false

// 이메일 형식 검증
N.validator.email("test@example.com"); // true
```

##### 검증 규칙

Natural-JS는 다양한 검증 규칙을 제공합니다. 이러한 규칙은 데이터 바인딩 컴포넌트(N.form, N.list, N.grid 등)에서 data-validate 속성을 통해 선언적으로 사용할 수 있습니다.

- **required** (필수): 필수 입력 항목을 검증합니다.
- **alphabet** (알파벳): 알파벳만 포함되어 있는지 검증합니다.
- **integer** (정수): 정수만 포함되어 있는지 검증합니다.
- **korean** (한글): 한글만 포함되어 있는지 검증합니다.
- **alphabet_integer** (알파벳과 정수): 알파벳과 정수만 포함되어 있는지 검증합니다.
- **integer_korean** (정수와 한글): 정수와 한글만 포함되어 있는지 검증합니다.
- **alphabet_korean** (알파벳과 한글): 알파벳과 한글만 포함되어 있는지 검증합니다.
- **alphabet_integer_korean** (알파벳, 정수, 한글): 알파벳, 정수, 한글만 포함되어 있는지 검증합니다.
- **dash_integer** (대시와 정수): 대시(-)와 정수만 포함되어 있는지 검증합니다.
- **commas_integer** (콤마와 정수): 콤마(,)와 정수만 포함되어 있는지 검증합니다.
- **number** (숫자): 숫자만 포함되어 있는지 검증합니다.
- **email** (이메일): 이메일 형식인지 검증합니다.
- **url** (URL): URL 형식인지 검증합니다.
- **zipcode** (우편번호): 우편번호 형식인지 검증합니다.
- **decimal** (소수): 소수 형식인지 검증합니다.
- **phone** (전화번호): 전화번호 형식인지 검증합니다.
- **rrn** (주민등록번호): 주민등록번호 형식인지 검증합니다.
- **ssn** (사회보장번호): 미국 사회보장번호 형식인지 검증합니다.
- **frn** (외국인등록번호): 외국인등록번호 형식인지 검증합니다.
- **frn_rrn** (외국인등록번호 또는 주민등록번호): 외국인등록번호 또는 주민등록번호 형식인지 검증합니다.
- **kbrn** (사업자등록번호): 한국 사업자등록번호 형식인지 검증합니다.
- **kcn** (법인등록번호): 한국 법인등록번호 형식인지 검증합니다.
- **date** (날짜): 날짜 형식인지 검증합니다.
- **time** (시간): 시간 형식인지 검증합니다.
- **accept** (허용): 지정된 값만 허용합니다.
- **match** (일치): 지정된 패턴과 일치하는지 검증합니다.
- **acceptfileext** (허용 파일 확장자): 지정된 파일 확장자만 허용합니다.
- **notaccept** (불허): 지정된 값을 허용하지 않습니다.
- **notmatch** (불일치): 지정된 패턴과 일치하지 않는지 검증합니다.
- **notacceptfileext** (불허 파일 확장자): 지정된 파일 확장자를 허용하지 않습니다.
- **equalTo** (동일): 다른 필드와 값이 동일한지 검증합니다.
- **maxlength** (최대 길이): 최대 길이를 검증합니다.
- **minlength** (최소 길이): 최소 길이를 검증합니다.
- **rangelength** (길이 범위): 길이가 지정된 범위 내에 있는지 검증합니다.
- **maxbyte** (최대 바이트): 최대 바이트 수를 검증합니다.
- **minbyte** (최소 바이트): 최소 바이트 수를 검증합니다.
- **rangebyte** (바이트 범위): 바이트 수가 지정된 범위 내에 있는지 검증합니다.
- **maxvalue** (최대 값): 최대 값을 검증합니다.
- **minvalue** (최소 값): 최소 값을 검증합니다.
- **rangevalue** (값 범위): 값이 지정된 범위 내에 있는지 검증합니다.
- **regexp** (정규식): 정규식 패턴과 일치하는지 검증합니다.

#### N.data

배열 형태의 JSON 객체 데이터를 정렬, 필터링, 정제하는 기능을 제공합니다.

```javascript
// 데이터 정렬
var sortedData = N.data([
    { name: "홍길동", age: 30 },
    { name: "김철수", age: 25 }
]).sort("age");

// 데이터 필터링
var filteredData = N.data([
    { name: "홍길동", age: 30 },
    { name: "김철수", age: 25 }
]).filter(function(item) {
    return item.age > 25;
});
```

## Natural-UI

Natural-UI는 다양한 UI 컴포넌트를 제공하는 패키지입니다.

### 주요 컴포넌트

#### N.alert

알림 메시지를 표시합니다.

```javascript
// 알림 메시지 표시
N.alert("알림 메시지");

// 확인 대화상자 표시
N.alert({
    msg: "계속 진행하시겠습니까?",
    type: "confirm",
    onOk: function() {
        console.log("확인 버튼 클릭");
    },
    onCancel: function() {
        console.log("취소 버튼 클릭");
    }
});
```

##### 옵션

- **context** (Window | NJS<HTMLElement[]>): 메시지 대화 상자가 표시될 영역을 지정합니다. modal 옵션이 true로 설정된 경우, Alert의 오버레이 요소는 context로 지정된 요소만큼 덮습니다.
- **msg** (string | NJS<HTMLElement[]>): 메시지 내용입니다. 메시지 문자열, jQuery 객체, HTML 문자열 또는 HTML 요소를 지정할 수 있습니다.
- **vars** (string[]): 메시지의 변수를 입력된 값으로 대체합니다. 메시지에 선언된 {index}와 같은 변수는 vars 옵션으로 설정된 배열의 인덱스에 해당하는 값으로 대체됩니다.
- **html** (boolean): true로 설정하면 메시지의 HTML이 적용됩니다. 기본값은 false입니다.
- **top** (number): 메시지 대화 상자의 상단 위치(px)입니다.
- **left** (number): 메시지 대화 상자의 왼쪽 위치(px)입니다.
- **width** (number | function): 메시지 대화 상자의 너비입니다. 숫자 타입으로 설정하면 입력된 숫자(px)가 요소의 너비로 설정됩니다. 함수 타입으로 설정하면 msgContext(modal 옵션이 true일 때 화면을 덮는 요소)와 msgContents(메시지 내용 요소)가 인수로 전달되고, 반환된 값으로 요소의 너비가 설정됩니다. 기본값은 0입니다.
- **height** (number | function): 제목 영역을 제외한 메시지 대화 상자 내용의 높이입니다. 숫자 타입으로 설정하면 입력된 숫자(px)가 요소의 높이로 설정됩니다. 함수 타입으로 설정하면 msgContext(modal 옵션이 true일 때 화면을 덮는 요소)와 msgContents(메시지 내용 요소)가 인수로 전달되고, 반환된 값으로 요소의 높이가 설정됩니다. 기본값은 0입니다.
- **title** (string): 메시지 대화 상자의 제목을 설정합니다. 설정하지 않으면 제목 표시줄이 생성되지 않습니다.
- **button** (boolean): false로 설정하면 기본 버튼(확인/취소 버튼) 관련 요소가 생성되지 않습니다. 기본값은 true입니다.
- **okButtonOpts** (NU.Options.Button | null): 메시지 대화 상자의 확인 버튼에 적용되는 Button 컴포넌트의 옵션을 정의합니다. 기본값은 null입니다.
- **cancelButtonOpts** (NU.Options.Button | null): 메시지 대화 상자의 취소 버튼에 적용되는 Button 컴포넌트의 옵션을 정의합니다. 기본값은 null입니다.
- **closeMode** ("hide" | "remove"): 메시지 대화 상자가 닫힐 때 대화 상자 요소를 숨길지 제거할지 설정합니다. "hide"는 이전 상태를 유지하기 위해 메시지 대화 상자 요소를 숨깁니다. "remove"는 메시지 대화 상자 요소를 제거하여 상태를 재설정합니다. 기본값은 "remove"입니다.
- **modal** (boolean): true로 설정하면 context로 지정된 요소를 덮는 오버레이 요소를 생성하여 메시지 대화 상자 내용을 제외한 모든 이벤트를 차단합니다. 기본값은 true입니다.
- **overlayClose** (boolean): false로 설정하면 msgContext(modal 옵션이 true일 때 화면을 덮는 요소)를 클릭해도 메시지 대화 상자가 닫히지 않습니다. 기본값은 true입니다.
- **overlayColor** (string | null): msgContext(modal 옵션이 true일 때 화면을 덮는 요소)의 배경색을 지정합니다. CSS의 color 속성 값으로 정의할 수 있습니다. 기본값은 null입니다.
- **escClose** (boolean): false로 설정하면 ESC 키를 눌러도 메시지 대화 상자가 닫히지 않습니다. 기본값은 true입니다.
- **confirm** (boolean): true로 설정하면 확인/취소 버튼이 표시되고, false로 설정하면 확인 버튼만 표시됩니다. 기본값은 false입니다.
- **alwaysOnTop** (boolean): true로 설정하면 메시지 대화 상자가 항상 맨 위에 표시됩니다. 기본값은 false입니다.
- **alwaysOnTopCalcTarget** (string): alwaysOnTop 옵션을 적용할 때 최상위 z-index를 계산하기 위한 대상 요소를 지정합니다. jQuery 선택자 구문으로 지정합니다. 기본값은 "div, span, ul, p, nav, article, section, header, footer, aside"입니다.
- **dynPos** (boolean): false로 설정하면 브라우저 크기가 조정되거나 부모 콘텐츠의 높이가 동적으로 변경될 때 블록 오버레이가 크기 조정되지 않고 메시지 대화 상자가 자동으로 재배치되지 않습니다. 기본값은 true입니다.
- **windowScrollLock** (boolean): true로 설정하면 메시지 대화 상자 요소 위에서 마우스 휠로 스크롤할 때 브라우저 창 스크롤을 비활성화합니다. 기본값은 true입니다.
- **draggable** (boolean): true로 설정하면 제목 표시줄로 메시지 대화 상자를 드래그할 수 있습니다. 기본값은 false입니다.
- **draggableOverflowCorrection** (boolean): false로 설정하면 화면 밖으로 드롭될 때 메시지 대화 상자가 자동으로 안쪽으로 이동하지 않습니다. 기본값은 true입니다.
- **draggableOverflowCorrectionAddValues** (object): 화면 밖으로 드롭될 때 메시지 대화 상자가 안쪽으로 이동할 위치를 지정합니다. 기본값은 { top: 0, bottom: 0, left: 0, right: 0 }입니다.
- **saveMemory** (boolean): true로 설정하면 불필요한 참조 요소를 제거하여 메모리 사용량을 절약합니다. 기본값은 false입니다.
- **onOk** (function | null): 확인 버튼을 클릭할 때 실행되는 이벤트 핸들러를 정의합니다. 0을 반환하면 이벤트 핸들러만 실행하고 대화 상자를 닫지 않습니다. 기본값은 undefined입니다.
- **onCancel** (function | null): 취소 버튼을 클릭할 때 실행되는 이벤트 핸들러를 정의합니다. 0을 반환하면 이벤트 핸들러만 실행하고 대화 상자를 닫지 않습니다. 기본값은 undefined입니다.

#### N.button

버튼을 생성합니다.

```javascript
// 버튼 생성
N("a.button").button();

// 옵션 지정
N("a.button").button({
    size: "large",
    color: "blue",
    type: "submit",
    onClick: function() {
        console.log("버튼 클릭");
    }
});
```

##### 옵션

- **context** (NJS<HTMLElement[]>): 버튼으로 만들 요소를 지정합니다.
- **size** (string): 버튼의 크기를 지정합니다. 가능한 값은 "none", "smaller", "small", "medium", "large", "big"입니다. 기본값은 "none"입니다.
- **color** (string): 버튼의 색상을 지정합니다. 가능한 값은 "none", "primary", "primary_container", "secondary", "secondary_container", "tertiary", "tertiary_container"입니다. 기본값은 "none"입니다.
- **type** (string): 버튼의 타입을 지정합니다. 가능한 값은 "none", "filled", "outlined", "elevated"입니다. 기본값은 "none"입니다.
- **label** (string): 버튼의 레이블을 지정합니다. 기본값은 context 요소의 텍스트입니다.
- **iconClass** (string): 버튼에 추가할 아이콘의 클래스를 지정합니다. 기본값은 undefined입니다.
- **iconStyle** (object): 버튼 아이콘의 스타일을 지정합니다. 기본값은 undefined입니다.
- **disabled** (boolean): true로 설정하면 버튼이 비활성화됩니다. 기본값은 false입니다.
- **addClass** (string): 버튼 요소에 추가할 클래스를 지정합니다. 기본값은 undefined입니다.
- **removeClass** (string): 버튼 요소에서 제거할 클래스를 지정합니다. 기본값은 undefined입니다.
- **onClick** (function): 버튼을 클릭할 때 실행되는 이벤트 핸들러를 정의합니다. 기본값은 undefined입니다.

#### N.datepicker

날짜 선택 캘린더를 표시합니다.

```javascript
// 데이트피커 생성
N("input.date").datepicker();

// 옵션 지정
N("input.date").datepicker({
    format: "yyyy-MM-dd",
    monthOnly: false,
    onSelect: function(context, selDate, monthonly) {
        console.log("선택된 날짜:", selDate);
    }
});
```

##### 옵션

- **context** (NJS<HTMLElement[]>): 데이트피커를 적용할 텍스트 입력 요소를 지정합니다.
- **format** (string): 날짜 형식을 지정합니다. 기본값은 "yyyy-MM-dd"입니다.
- **monthOnly** (boolean): true로 설정하면 월 선택 모드로 설정됩니다. 기본값은 false입니다.
- **yearRange** (number): 연도 선택 범위를 지정합니다. 기본값은 10입니다.
- **minDate** (string | Date): 선택 가능한 최소 날짜를 지정합니다. 기본값은 undefined입니다.
- **maxDate** (string | Date): 선택 가능한 최대 날짜를 지정합니다. 기본값은 undefined입니다.
- **onSelect** (function): 날짜를 선택할 때 실행되는 이벤트 핸들러를 정의합니다. 기본값은 undefined입니다.
- **onClose** (function): 데이트피커가 닫힐 때 실행되는 이벤트 핸들러를 정의합니다. 기본값은 undefined입니다.
- **onOpen** (function): 데이트피커가 열릴 때 실행되는 이벤트 핸들러를 정의합니다. 기본값은 undefined입니다.
- **onChangeMonth** (function): 월이 변경될 때 실행되는 이벤트 핸들러를 정의합니다. 기본값은 undefined입니다.
- **onChangeYear** (function): 연도가 변경될 때 실행되는 이벤트 핸들러를 정의합니다. 기본값은 undefined입니다.
- **onChangeYearRange** (function): 연도 범위가 변경될 때 실행되는 이벤트 핸들러를 정의합니다. 기본값은 undefined입니다.
- **button** (boolean): true로 설정하면 데이트피커 버튼이 표시됩니다. 기본값은 true입니다.
- **buttonStyle** (object): 데이트피커 버튼의 스타일을 지정합니다. 기본값은 undefined입니다.
- **buttonClass** (string): 데이트피커 버튼에 추가할 클래스를 지정합니다. 기본값은 undefined입니다.
- **inputReadOnly** (boolean): true로 설정하면 입력 필드가 읽기 전용으로 설정됩니다. 기본값은 false입니다.
- **holidays** (object): 휴일을 지정합니다. 기본값은 undefined입니다.
- **weekNames** (string[]): 요일 이름을 지정합니다. 기본값은 ["일", "월", "화", "수", "목", "금", "토"]입니다.
- **monthNames** (string[]): 월 이름을 지정합니다. 기본값은 ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"]입니다.
- **todayBtnVisible** (boolean): true로 설정하면 오늘 버튼이 표시됩니다. 기본값은 true입니다.
- **todayBtnText** (string): 오늘 버튼의 텍스트를 지정합니다. 기본값은 "오늘"입니다.
- **closeBtnVisible** (boolean): true로 설정하면 닫기 버튼이 표시됩니다. 기본값은 true입니다.
- **closeBtnText** (string): 닫기 버튼의 텍스트를 지정합니다. 기본값은 "닫기"입니다.
- **alwaysOnTop** (boolean): true로 설정하면 데이트피커가 항상 맨 위에 표시됩니다. 기본값은 false입니다.
- **alwaysOnTopCalcTarget** (string): alwaysOnTop 옵션을 적용할 때 최상위 z-index를 계산하기 위한 대상 요소를 지정합니다. jQuery 선택자 구문으로 지정합니다. 기본값은 "div, span, ul, p, nav, article, section, header, footer, aside"입니다.

#### N.popup

레이어 팝업을 생성합니다.

```javascript
// 내부 엘리먼트로 팝업 생성
N("#popupContent").popup();

// URL로 팝업 생성
N().popup({
    url: "/popup.html",
    width: 500,
    height: 400,
    onLoad: function(cont) {
        console.log("팝업 로드 완료");
    }
});
```

##### 옵션

- **context** (NJS<HTMLElement[]>): 팝업으로 만들 내부 요소를 지정합니다.
- **url** (string): 팝업으로 로드할 페이지의 URL을 지정합니다. 기본값은 undefined입니다.
- **urlSync** (boolean): false로 설정하면 서버에 요청할 때의 location.href와 서버에서 응답을 받을 때의 location.href가 다르더라도 응답이 차단되지 않습니다. 기본값은 true입니다.
- **width** (number | string): 팝업의 너비를 지정합니다. 숫자 타입으로 설정하면 픽셀 단위로 적용되고, 문자열 타입으로 설정하면 CSS 단위(%, em, rem 등)로 적용됩니다. 기본값은 300입니다.
- **height** (number | string): 팝업의 높이를 지정합니다. 숫자 타입으로 설정하면 픽셀 단위로 적용되고, 문자열 타입으로 설정하면 CSS 단위(%, em, rem 등)로 적용됩니다. 기본값은 200입니다.
- **top** (number | string): 팝업의 상단 위치를 지정합니다. 숫자 타입으로 설정하면 픽셀 단위로 적용되고, 문자열 타입으로 설정하면 CSS 단위(%, em, rem 등)로 적용됩니다. 기본값은 undefined입니다.
- **left** (number | string): 팝업의 왼쪽 위치를 지정합니다. 숫자 타입으로 설정하면 픽셀 단위로 적용되고, 문자열 타입으로 설정하면 CSS 단위(%, em, rem 등)로 적용됩니다. 기본값은 undefined입니다.
- **right** (number | string): 팝업의 오른쪽 위치를 지정합니다. 숫자 타입으로 설정하면 픽셀 단위로 적용되고, 문자열 타입으로 설정하면 CSS 단위(%, em, rem 등)로 적용됩니다. 기본값은 undefined입니다.
- **bottom** (number | string): 팝업의 하단 위치를 지정합니다. 숫자 타입으로 설정하면 픽셀 단위로 적용되고, 문자열 타입으로 설정하면 CSS 단위(%, em, rem 등)로 적용됩니다. 기본값은 undefined입니다.
- **draggable** (boolean): true로 설정하면 팝업을 드래그할 수 있습니다. 기본값은 false입니다.
- **resizable** (boolean): true로 설정하면 팝업의 크기를 조정할 수 있습니다. 기본값은 false입니다.
- **alwaysOnTop** (boolean): true로 설정하면 팝업이 항상 맨 위에 표시됩니다. 기본값은 false입니다.
- **alwaysOnTopCalcTarget** (string): alwaysOnTop 옵션을 적용할 때 최상위 z-index를 계산하기 위한 대상 요소를 지정합니다. jQuery 선택자 구문으로 지정합니다. 기본값은 "div, span, ul, p, nav, article, section, header, footer, aside"입니다.
- **modal** (boolean): true로 설정하면 모달 팝업으로 생성됩니다. 기본값은 true입니다.
- **title** (string): 팝업의 제목을 지정합니다. 기본값은 undefined입니다.
- **overlayClose** (boolean): false로 설정하면 오버레이를 클릭해도 팝업이 닫히지 않습니다. 기본값은 true입니다.
- **escClose** (boolean): false로 설정하면 ESC 키를 눌러도 팝업이 닫히지 않습니다. 기본값은 true입니다.
- **button** (boolean): false로 설정하면 팝업의 닫기 버튼이 표시되지 않습니다. 기본값은 true입니다.
- **opener** (object): 팝업을 호출한 부모 페이지의 컨트롤러 객체를 지정합니다. 기본값은 undefined입니다.
- **contentCaching** (boolean): true로 설정하면 팝업 내용을 캐싱합니다. 기본값은 false입니다.
- **onOpen** (string | function): 팝업이 열릴 때 실행되는 이벤트 핸들러를 정의합니다. 기본값은 undefined입니다.
- **onClose** (function): 팝업이 닫힐 때 실행되는 이벤트 핸들러를 정의합니다. 기본값은 undefined입니다.
- **onLoad** (function): 팝업 내용이 로드될 때 실행되는 이벤트 핸들러를 정의합니다. 기본값은 undefined입니다.
- **onContentLoad** (function): 팝업 내용이 로드된 후 실행되는 이벤트 핸들러를 정의합니다. 기본값은 undefined입니다.
- **onResize** (function): 팝업 크기가 조정될 때 실행되는 이벤트 핸들러를 정의합니다. 기본값은 undefined입니다.
- **onDrag** (function): 팝업이 드래그될 때 실행되는 이벤트 핸들러를 정의합니다. 기본값은 undefined입니다.

#### N.tab

탭 페이지 뷰를 생성합니다.

```javascript
// 탭 생성
N("#tabContainer").tab();

// 옵션 지정
N("#tabContainer").tab({
    activeIndex: 0,
    onActive: function(selTabIdx, selTabEle, selContentEle, links, contents) {
        console.log("활성화된 탭:", selTabIdx);
    }
});
```

##### 옵션

- **context** (NJS<HTMLElement[]>): 탭을 적용할 요소를 지정합니다. 탭 컨텍스트 요소는 div 태그로 작성되어야 하며, 내부에 ul, li, div 태그가 포함되어야 합니다.
- **links** (NJS<HTMLElement[]>): 탭 링크 요소의 인스턴스만 포함하는 변수입니다. 기본값은 null입니다.
- **contents** (NJS<HTMLElement[]>): 탭 콘텐츠 요소의 인스턴스만 포함하는 변수입니다. 기본값은 null입니다.
- **tabOpts** (NU.Options.EachTab[]): 개별 탭의 옵션을 배열로 지정합니다. 기본값은 []입니다.
  - **url** (string): 탭 콘텐츠로 생성될 페이지의 URL을 지정합니다. 기본값은 undefined입니다.
  - **active** (boolean): true로 설정하면 탭 초기화 후 해당 탭과 콘텐츠가 기본으로 선택됩니다. 기본값은 false입니다.
  - **preload** (boolean): true로 설정하면 탭이 처음 선택될 때가 아닌 탭 초기화 시 탭 콘텐츠용 페이지가 미리 로드됩니다. 기본값은 false입니다.
  - **onOpen** (string | function): 탭이 열릴 때마다 실행될 onOpen 이벤트 핸들러 함수의 이름을 문자열로 지정합니다. 기본값은 undefined입니다.
  - **disable** (boolean): true로 설정하면 지정된 탭이 비활성화된 상태로 생성됩니다. 기본값은 false입니다.
  - **stateless** (boolean): true로 설정하면 탭 콘텐츠의 상태가 유지되지 않고, 탭이 선택될 때마다 관련 탭 콘텐츠가 다시 로드되고 초기화됩니다. 기본값은 false입니다.
- **randomSel** (boolean): true로 설정하면 탭 초기화 시 탭과 탭 콘텐츠가 무작위로 표시됩니다. false로 설정하면 첫 번째 탭이 표시됩니다. 기본값은 false입니다.
- **opener** (NA.Objects.Controller.Object): 탭 인스턴스가 생성된 부모 페이지의 컨트롤러 객체를 참조할 수 있게 합니다. 기본값은 null입니다.
- **onActive** (function): 탭이 활성화될 때마다 실행되는 이벤트 핸들러를 정의합니다. 기본값은 undefined입니다.
- **onLoad** (function): 탭 콘텐츠 로딩이 완료되었을 때 실행되는 이벤트 핸들러를 정의합니다. 기본값은 null입니다.
- **blockOnActiveWhenCreate** (boolean): true로 설정하면 탭이 생성되고 기본 탭이 선택될 때 onActive 이벤트가 트리거되지 않습니다. 기본값은 false입니다.
- **tabScroll** (boolean): true로 설정하면 마우스 드래그, 터치 또는 처음/마지막 버튼을 사용하여 탭을 스크롤할 수 있습니다. 기본값은 false입니다.
- **tabScrollCorrection** (object): 탭 요소에 영향을 주는 스타일(CSS)로 인해 마지막 탭이 잘리거나 간격이 생길 수 있습니다. 이때 tabScrollCorrection 객체의 속성을 사용하여 다음 옵션 값을 조정하여 정상적으로 표시할 수 있습니다. 기본값은 { tabContainerWidthCorrectionPx: 0, tabContainerWidthReCalcDelayTime: 0 }입니다.
  - **tabContainerWidthCorrectionPx** (number): 마지막 탭이 잘리거나 간격이 생길 때 탭 모양을 보정하기 위해 1씩 증감할 수 있는 옵션입니다.
  - **tabContainerWidthReCalcDelayTime** (number): 탭이 처음 표시될 때 잘리거나 간격이 생기는 경우 탭 모양을 재조정하기 위해 1씩 증감할 수 있는 옵션입니다.

##### 함수

- **context(sel?: JQuery.Selector)**: 컨텍스트 요소를 반환합니다. 선택적으로 jQuery 선택자를 사용하여 컨텍스트 내의 특정 요소를 선택할 수 있습니다.
- **open(idx: number, onOpenData?: any, isFirst?: boolean)**: 지정된 인덱스의 탭을 엽니다. onOpenData는 탭이 열릴 때 처리할 데이터를 지정하며, isFirst는 탭이 인스턴스화되고 기본 활성 탭이 자동으로 선택될 때 내부적으로 사용되는 옵션입니다.
- **open()**: 인수 없이 호출하면 현재 활성화된 탭의 상태 정보(인덱스, 탭 요소, 콘텐츠 요소, 컨트롤러 객체)를 반환합니다.
- **disable(idx: number)**: 지정된 인덱스의 탭을 비활성화합니다.
- **enable(idx: number)**: 지정된 인덱스의 탭을 활성화합니다.
- **cont(idx?: number)**: 탭 콘텐츠의 컨트롤러 객체를 반환합니다. 인덱스를 지정하지 않으면 현재 활성화된 탭의 컨트롤러 객체를 반환합니다.

#### N.select

선택 요소를 생성합니다.

```javascript
// 셀렉트 박스 생성
N("select").select();

// 데이터 바인딩
N("select").select().bind([
    { code: "01", name: "옵션 1" },
    { code: "02", name: "옵션 2" }
]);
```

##### 옵션

- **data** (NJS<NC.JSONObject[]>): Select 요소에 바인딩할 데이터를 지정합니다. 기본값은 undefined입니다.
- **context** (NJS<HTMLElement[]>): Select를 적용할 요소를 지정합니다. Select 컨텍스트 요소는 select 태그 또는 type=checkbox나 type=radio인 input 태그로 작성되어야 합니다. 기본값은 null입니다.
- **key** (string): 선택 요소의 이름 속성에 바인딩될 데이터의 속성 이름을 지정합니다. 기본값은 null입니다.
- **val** (string): 선택 요소의 값 속성에 바인딩될 데이터의 속성 이름을 지정합니다. 기본값은 null입니다.
- **append** (boolean): false로 설정하면 데이터를 바인딩하기 전에 select 요소의 기본 옵션을 지웁니다. 기본값은 true입니다.
- **direction** (string): context가 input[type=checkbox] 또는 input[type=radio]인 경우 선택 요소가 배치되는 방향을 지정합니다. "h"는 가로, "v"는 세로입니다. 기본값은 "h"입니다.
- **type** (number): Select 요소 유형을 지정합니다. 1은 select, 2는 select[multiple='multiple'], 3은 radio, 4는 checkbox입니다. 기본값은 0입니다.
- **template** (NJS<HTMLElement[]>): radio 또는 checkbox인 경우 기본 템플릿 요소의 인스턴스가 할당됩니다. 기본값은 null입니다.

##### 함수

- **data(selFlag?: boolean)**: 컴포넌트에 바인딩된 최신 데이터를 반환합니다. selFlag가 true이면 현재 선택된 행 데이터만 추출하여 JSONObject[] 타입으로 반환하고, false이면 컴포넌트에 바인딩된 원본 타입의 데이터를 NJS<NC.JSONObject[]> 타입으로 반환합니다.
- **context(sel?: JQuery.Selector)**: 컨텍스트 요소를 반환합니다. 선택적으로 jQuery 선택자를 사용하여 컨텍스트 내의 특정 요소를 선택할 수 있습니다.
- **bind(data?: NJS<NC.JSONObject[]> | NC.JSONObject[])**: context 옵션으로 지정된 요소에 데이터를 바인딩합니다.
- **index()**: 선택된 옵션의 인덱스를 반환합니다.
- **index(idx: number)**: 지정된 인덱스에 해당하는 옵션을 선택합니다.
- **val()**: 선택된 옵션의 값을 반환합니다.
- **val(val?: NC.Primitive | NC.Primitive[])**: 지정된 값에 해당하는 옵션을 선택합니다.
- **remove(val: NC.Primitive)**: val 인수로 지정된 값과 동일한 옵션 요소와 행 데이터 객체를 제거합니다.
- **reset(selFlag?: boolean)**: 선택을 초기화합니다. select 요소의 경우 selFlag를 true로 설정하면 아무것도 선택하지 않고, false로 설정하면 기본(첫 번째) 옵션 요소를 선택합니다.

#### N.form

단일 행 데이터를 바인딩하거나 생성합니다.

```javascript
// 폼 생성
var formInst = N("#formContainer").form();

// 데이터 바인딩
formInst.bind({
    name: "홍길동",
    age: 30
});

// 데이터 가져오기
var formData = formInst.data();
```

##### 옵션

- **data** (NJS<NC.JSONObject[]>): Form에 바인딩할 데이터를 지정합니다. Form은 단일 데이터 컴포넌트이지만, 바인딩되는 데이터는 JSON 객체 배열 타입입니다. 기본값은 undefined입니다.
- **row** (number): data 옵션으로 지정된 리스트 데이터에서 폼에 바인딩할 행의 인덱스 값을 지정합니다. 기본값은 -1이지만, 값을 입력하지 않으면 0으로 설정되어 리스트 데이터의 첫 번째 행이 폼에 바인딩됩니다.
- **context** (NJS<HTMLElement[]>): Form을 적용할 요소를 지정합니다. Form의 컨텍스트 요소는 table, div, section 등과 같은 영역을 나타내는 태그로 작성할 수 있습니다. 기본값은 null입니다.
- **validate** (boolean): false로 설정하면 입력 요소에서 포커스가 사라질 때 입력 값의 유효성 검사를 수행하지 않습니다. 기본값은 true입니다.
- **autoUnbind** (boolean): true로 설정하면 동일한 폼 요소를 다시 바인딩하기 전에 unbind 메서드가 자동으로 호출되어 폼 요소를 재사용할 수 있습니다. 기본값은 false입니다.
- **html** (boolean): true로 설정하면 폼에 바인딩하는 동안 데이터의 HTML이 적용됩니다. 기본값은 false입니다.
- **addTop** (boolean): true로 설정하면 add 메서드가 호출될 때 행 데이터가 데이터 목록의 맨 위에 추가됩니다. 기본값은 true입니다.
- **fRules** (ND.FormatRuleObject): 대상 요소의 data-format 속성을 사용하는 대신 객체 타입으로 형식 규칙을 지정합니다. 기본값은 null입니다.
- **vRules** (ND.ValidationRuleObject): 대상 요소의 data-validate 속성을 사용하는 대신 객체 타입으로 유효성 검사 규칙을 지정합니다. 기본값은 null입니다.

##### 함수

- **data(selFlag?: boolean, ...cols: string[])**: 컴포넌트에 바인딩된 최신 데이터를 반환합니다. selFlag가 true이면 현재 선택된 행 데이터만 추출하여 JSONObject[] 타입으로 반환하고, false이면 컴포넌트에 바인딩된 원본 타입의 데이터를 NJS<NC.JSONObject[]> 타입으로 반환합니다. cols 인수를 지정하면 지정된 속성 값만 추출된 객체가 반환됩니다.
- **row(before?: "before")**: 바인딩된 데이터 배열에서 Form에 바인딩된 데이터의 인덱스를 반환합니다. "before"를 지정하면 바로 이전에 바인딩된 데이터의 인덱스가 반환됩니다.
- **context(sel?: JQuery.Selector)**: 컨텍스트 요소를 반환합니다. 선택적으로 jQuery 선택자를 사용하여 컨텍스트 내의 특정 요소를 선택할 수 있습니다.
- **bind(row: number, data?: NJS<NC.JSONObject[]> | NC.JSONObject[], ...cols: string[])**: context 옵션으로 지정된 요소 내에서 id 속성 값을 가진 요소에 데이터를 바인딩합니다. cols 인수를 지정하면 속성 이름과 id 속성 값이 일치하는 요소에만 데이터가 바인딩됩니다.
- **add(data?: number | NC.JSONObject, row?: number)**: 새 행 데이터를 추가합니다. 컨텍스트 요소의 입력 요소의 id 속성 이름과 값으로 데이터 객체가 생성됩니다.
- **remove()**: Form에 바인딩된 데이터 객체를 데이터 배열에서 제거합니다. rowStatus가 "insert"인 경우 행 데이터를 제거하고, 그렇지 않으면 rowStatus를 "delete"로 변경합니다.
- **revert()**: 초기 데이터가 바인딩된 상태 또는 추가할 때 생성된 초기 데이터 상태로 되돌립니다.
- **validate()**: 추가/수정된 모든 데이터에 대한 유효성 검사 결과를 반환합니다. 유효성 검사가 성공하면 true를 반환하고, 실패하면 false를 반환하며 해당 입력 요소 옆에 실패 메시지를 툴팁으로 표시합니다.
- **val(key: string)**: 컴포넌트에 바인딩된 데이터 객체의 속성 값을 검색합니다.
- **val(key: string, val: NC.Primitive | NC.Primitive[], notify?: boolean)**: 컴포넌트에 바인딩된 데이터 객체의 속성 값을 업데이트하거나 추가합니다. notify를 false로 설정하면 동일한 데이터를 참조하는 컴포넌트에 데이터 변경 알림이 표시되지 않습니다.
- **update(row: number, key?: string)**: 데이터 컴포넌트 간의 양방향 데이터 바인딩을 위한 실시간 데이터 동기화 로직을 처리합니다.

#### N.list

단일 컬럼 형식의 데이터 목록을 생성합니다.

```javascript
// 리스트 생성
var listInst = N("#listContainer").list();

// 데이터 바인딩
listInst.bind([
    { name: "홍길동", age: 30 },
    { name: "김철수", age: 25 }
]);

// 선택 이벤트 처리
listInst.bind({
    onSelect: function(rowIdx, rowEle, rowData, beforeRowIdx, e) {
        console.log("선택된 행:", rowData);
    }
});
```

##### 옵션

- **data** (NJS<NC.JSONObject[]>): List에 바인딩할 데이터를 지정합니다. List의 컨텍스트 요소는 ul 및 li 태그로 작성되어야 합니다. 기본값은 undefined입니다.
- **context** (NJS<HTMLElement[]>): List를 적용할 요소를 지정합니다. 기본값은 null입니다.
- **height** (number): 리스트 본문의 높이를 지정합니다. 지정된 값이 0보다 크면 리스트 본문 내에 스크롤바가 나타나고 높이가 지정된 값으로 고정됩니다. 0으로 설정하면 모든 데이터가 리스트 본문에 표시됩니다. 기본값은 0입니다.
- **validate** (boolean): false로 설정하면 입력 요소에서 포커스가 사라질 때 입력 값의 유효성 검사를 수행하지 않습니다. 기본값은 true입니다.
- **html** (boolean): true로 설정하면 데이터를 바인딩할 때 데이터의 HTML이 적용됩니다. 기본값은 false입니다.
- **addTop** (boolean): true로 설정하면 add 메서드가 호출될 때 새 행 요소와 행 데이터가 목록의 시작 부분에 추가됩니다. 기본값은 true입니다.
- **addSelect** (boolean): true로 설정하면 add 메서드로 추가된 행이 자동으로 선택됩니다. select 옵션이 true로 설정되어야 합니다. 기본값은 false입니다.
- **vResizable** (boolean): true로 설정하면 마우스로 리스트 본문의 높이를 조정할 수 있습니다. 기본값은 false입니다.
- **windowScrollLock** (boolean): true로 설정하면 데이터 리스트 요소 위에서 마우스 휠로 스크롤할 때 브라우저 창 스크롤이 비활성화됩니다. 기본값은 true입니다.
- **select** (boolean): true로 설정하면 행 선택 기능이 활성화되고, 행 요소(li)의 클래스 속성에 'list_selected__' 값이 토글됩니다. 기본값은 false입니다.
- **unselect** (boolean): false로 설정하면 이미 선택된 행을 다시 선택해도 선택이 해제되지 않습니다. multiselect 옵션이 true인 경우에는 적용되지 않습니다. 기본값은 true입니다.
- **multiselect** (boolean): true로 설정하면 다중 행 선택 기능이 활성화되고, 행 요소(li)의 클래스 속성에 'list_selected__' 값이 토글됩니다. 기본값은 false입니다.
- **checkAll** (JQuery.Selector): checkAllTarget 옵션으로 지정된 모든 체크박스를 선택하는 input[type=checkbox] 요소를 지정합니다. 기본값은 null입니다.
- **checkAllTarget** (JQuery.Selector): 리스트에서 다중 행 선택에 사용되는 input[type=checkbox] 요소를 지정합니다. check 함수를 사용하여 선택된 행의 인덱스를 가져오거나 설정할 수 있습니다. 기본값은 null입니다.
- **checkSingleTarget** (JQuery.Selector): 리스트에서 단일 행 선택에 사용되는 input[type=checkbox] 요소를 지정합니다. check 함수를 사용하여 선택된 행의 인덱스를 가져오거나 설정할 수 있습니다. 기본값은 null입니다.
- **hover** (boolean): true로 설정하면 마우스가 행 위에 있을 때 행 요소에 "list_hover__" 클래스 속성 값이 추가되고, 마우스가 벗어나면 제거됩니다. 기본값은 false입니다.
- **revert** (boolean): true로 설정하면 revert 기능이 활성화되어 revert 메서드를 사용할 수 있습니다. 기본값은 false입니다.
- **createRowDelay** (number): 1 이상의 값으로 설정하면 바인딩 시 리스트의 각 행이 개별적으로 생성되며, 다음 행이 생성될 때까지의 간격을 설정합니다. 기본값은 1입니다.
- **scrollPaging** (object): 스크롤 페이징 시 한 번에 바인딩할 행 수를 지정합니다. 리스트는 기본적으로 스크롤 페이징이 활성화되어 있으며, 0으로 설정하면 스크롤 페이징 기능이 비활성화됩니다. 기본값은 { idx: 0, size: 100 }입니다.
- **fRules** (ND.FormatRuleObject): 대상 요소의 data-format 속성을 사용하는 대신 객체 타입으로 형식 규칙을 지정합니다. 기본값은 null입니다.
- **vRules** (ND.ValidationRuleObject): 대상 요소의 data-validate 속성을 사용하는 대신 객체 타입으로 유효성 검사 규칙을 지정합니다. 기본값은 null입니다.
- **appendScroll** (boolean): false로 설정하면 bind 메서드의 두 번째 인수로 "append" 옵션을 지정하여 추가된 행이 자동으로 스크롤 뷰로 이동하지 않습니다. 기본값은 true입니다.
- **addScroll** (boolean): false로 설정하면 add 메서드로 추가된 행이 자동으로 스크롤 뷰로 이동하지 않습니다. 기본값은 true입니다.
- **selectScroll** (boolean): false로 설정하면 select 메서드로 선택된 마지막 행이 자동으로 스크롤 뷰로 이동하지 않습니다. 기본값은 true입니다.
- **checkScroll** (boolean): false로 설정하면 check 메서드로 체크된 마지막 행이 자동으로 스크롤 뷰로 이동하지 않습니다. 기본값은 true입니다.
- **validateScroll** (boolean): false로 설정하면 validate 메서드로 유효성 검사에 실패한 마지막 행이 자동으로 스크롤 뷰로 이동하지 않습니다. 기본값은 true입니다.
- **cache** (boolean): true로 설정하면 요소 검색 시 캐싱을 적용하여 성능을 약간 향상시킵니다. 기본값은 true입니다.
- **tpBind** (boolean): true로 설정하면 컴포넌트 초기화 전에 기존 바인딩 이벤트(format, validate, dataSync 등)와 컴포넌트 이벤트 간의 충돌을 방지합니다. 기본값은 false입니다.
- **rowHandlerBeforeBind** (function): bind 또는 add 시 생성된 행 요소에 데이터가 바인딩되기 전에 실행되는 이벤트 핸들러를 정의합니다. 기본값은 null입니다.
- **rowHandler** (function): bind 또는 add 시 생성된 행 요소에 데이터가 바인딩된 후에 실행되는 이벤트 핸들러를 정의합니다. 기본값은 null입니다.
- **onBeforeSelect** (function): 행이 선택되기 전에 실행되는 이벤트 핸들러를 정의합니다. 기본값은 null입니다.
- **onSelect** (function): 행이 선택된 후에 실행되는 이벤트 핸들러를 정의합니다. 기본값은 null입니다.
- **onBind** (function): 데이터 바인딩이 완료된 후에 실행되는 이벤트 핸들러를 정의합니다. 기본값은 null입니다.

##### 함수

- **data(selFlag?: string | boolean, ...cols: string[])**: 컴포넌트에 바인딩된 최신 데이터를 반환합니다. selFlag가 "modified", "selected", "checked", "insert", "update", "delete"인 경우 해당 상태의 데이터만 JSONObject[] 타입으로 반환하고, false이면 컴포넌트에 바인딩된 원본 타입의 데이터를 NJS<NC.JSONObject[]> 타입으로 반환합니다. cols 인수를 지정하면 지정된 속성 값만 추출된 객체가 반환됩니다.
- **context(sel?: JQuery.Selector)**: 컨텍스트 요소를 반환합니다. 선택적으로 jQuery 선택자를 사용하여 컨텍스트 내의 특정 요소를 선택할 수 있습니다.
- **contextBodyTemplate(sel?: JQuery.Selector)**: context 옵션으로 지정된 요소의 행 요소(li)를 반환합니다. 반환된 요소를 수정한 후 bind 함수를 실행하면 수정된 요소로 행이 생성됩니다.
- **select()**: 선택된 행의 인덱스를 반환합니다. select 또는 multiselect 옵션이 true로 설정되어야 합니다.
- **select(row: number | number[], isAppend?: boolean)**: 행을 선택합니다. select 또는 multiselect 옵션이 true로 설정되어야 합니다. isAppend가 true이면 기존 선택된 행을 유지하고 선택합니다.
- **check()**: checkAllTarget 및 checkSingleTarget 옵션으로 지정된 체크박스 요소가 체크된 행의 인덱스를 반환합니다.
- **check(row: number | number[], isAppend?: boolean)**: checkAllTarget 및 checkSingleTarget 옵션으로 지정된 체크박스 요소를 체크합니다. isAppend가 true이면 기존 체크된 행을 유지하고 체크합니다.
- **bind(data?: NJS<NC.JSONObject[]> | NC.JSONObject[], callType?: "append" | "list.bind" | "list.update")**: context 옵션으로 지정된 요소 내에서 id 속성 값을 가진 요소에 데이터를 바인딩하고 데이터 길이와 동일한 행 요소를 생성합니다. callType이 "append"이면 이전에 바인딩된 데이터와 새로 바인딩된 데이터를 병합하고 이전에 생성된 행 요소에 새 행 요소를 추가합니다.
- **add(data?: number | NC.JSONObject, row?: number)**: 새 행 요소와 데이터를 추가합니다. 컨텍스트 요소의 입력 요소의 id 속성 이름과 값으로 데이터 객체가 생성됩니다.
- **remove(row: number)**: 데이터 배열에서 Form에 바인딩된 데이터 객체를 제거합니다. rowStatus가 "insert"인 경우 행 데이터를 제거하고, 그렇지 않으면 rowStatus를 "delete"로 변경합니다.
- **revert(row?: number)**: 초기 데이터가 바인딩된 상태 또는 추가할 때 생성된 초기 데이터 상태로 되돌립니다. row를 지정하지 않으면 전체 행 데이터를 되돌립니다.
- **validate(row?: number)**: 추가/수정된 모든 데이터에 대한 유효성 검사 결과를 반환합니다. row를 지정하지 않으면 전체 행 데이터를 검증합니다. 유효성 검사가 성공하면 true를 반환하고, 실패하면 false를 반환하며 해당 입력 요소 옆에 실패 메시지를 툴팁으로 표시합니다.
- **val(row: number, key: string)**: 컴포넌트에 바인딩된 데이터 객체의 속성 값을 검색합니다.
- **val(row: number, key: string, val: NC.Primitive | NC.Primitive[])**: 컴포넌트에 바인딩된 데이터 객체의 속성 값을 업데이트하거나 추가합니다.
- **move(fromRow: number, toRow: number)**: 리스트 내에서 한 위치에서 다른 위치로 요소와 행 데이터를 이동합니다.

#### N.grid

다중 컬럼 형식의 데이터 목록을 생성합니다.

```javascript
// 그리드 생성
var gridInst = N("#gridContainer").grid();

// 데이터 바인딩
gridInst.bind([
    { name: "홍길동", age: 30, gender: "남" },
    { name: "김철수", age: 25, gender: "남" }
]);

// 선택 이벤트 처리
gridInst.bind({
    onSelect: function(rowIdx, rowEle, rowData, beforeRowIdx, e) {
        console.log("선택된 행:", rowData);
    }
});
```

##### 옵션

- **data** (NJS<NC.JSONObject[]>): Grid에 바인딩할 데이터를 지정합니다. 기본값은 undefined입니다.
- **context** (NJS<HTMLElement[]>): Grid를 적용할 요소를 지정합니다. Grid의 컨텍스트 요소는 항상 table 태그로 작성되어야 합니다. 기본값은 null입니다.
- **height** (number): 그리드 본문의 높이를 지정합니다. 값이 0보다 크면 헤더가 고정되고 그리드 본문에 스크롤바가 나타나며 지정된 높이로 고정됩니다. 0으로 설정하면 헤더가 고정되지 않고 모든 데이터가 그리드 본문에 표시됩니다. 기본값은 0입니다.
- **fixedcol** (number): 고정할 열을 지정하여 다른 열이 수평으로 스크롤되도록 합니다. 0으로 설정하면 열이 고정되지 않습니다. 1 이상의 숫자를 설정하면 첫 번째 열부터 해당 수만큼의 열이 고정됩니다. 기본값은 0입니다.
- **more** (boolean | string[]): true로 설정하면 열을 숨기거나 표시하는 기능이 활성화되고 상세 팝업이 자동으로 생성됩니다. 문자열 배열로 설정하면 지정된 열만 상세 팝업에 표시됩니다. 기본값은 false입니다.
- **validate** (boolean): false로 설정하면 입력 요소에서 포커스가 사라질 때 입력 값의 유효성 검사를 수행하지 않습니다. 기본값은 true입니다.
- **html** (boolean): true로 설정하면 데이터를 바인딩할 때 데이터의 HTML이 적용됩니다. 기본값은 false입니다.
- **addTop** (boolean): true로 설정하면 add 메서드가 호출될 때 행 요소와 행 데이터가 목록의 시작 부분에 추가됩니다. 기본값은 true입니다.
- **addSelect** (boolean): true로 설정하면 add 메서드로 추가된 행이 자동으로 선택됩니다. select 옵션이 true로 설정되어야 합니다. 기본값은 false입니다.
- **filter** (boolean): true로 설정하면 선택한 열을 기준으로 데이터를 필터링할 수 있습니다. 기본값은 false입니다.
- **resizable** (boolean): true로 설정하면 열의 너비를 조정할 수 있습니다. 기본값은 false입니다.
- **vResizable** (boolean): true로 설정하면 마우스로 그리드 본문의 높이를 조정할 수 있습니다. 기본값은 false입니다.
- **sortable** (boolean): true로 설정하면 선택한 열을 기준으로 데이터를 정렬할 수 있습니다. 기본값은 false입니다.
- **windowScrollLock** (boolean): true로 설정하면 데이터 그리드 요소 위에서 마우스 휠로 스크롤할 때 브라우저 창 스크롤이 비활성화됩니다. 기본값은 true입니다.
- **select** (boolean): true로 설정하면 행 선택 기능이 활성화되고, 행 요소(tbody)의 클래스 속성에 'grid_selected__' 값이 토글됩니다. 기본값은 false입니다.
- **unselect** (boolean): false로 설정하면 이미 선택된 행을 다시 선택해도 선택이 해제되지 않습니다. multiselect 옵션이 true인 경우에는 적용되지 않습니다. 기본값은 true입니다.
- **multiselect** (boolean): true로 설정하면 다중 행 선택 기능이 활성화되고, 행 요소(tbody)의 클래스 속성에 'grid_selected__' 값이 토글됩니다. 기본값은 false입니다.
- **checkAll** (JQuery.Selector): checkAllTarget 옵션으로 지정된 모든 체크박스를 선택하는 input[type=checkbox] 요소를 지정합니다. 지정된 요소는 thead 섹션에 있어야 합니다. 기본값은 null입니다.
- **checkAllTarget** (JQuery.Selector): 그리드에서 다중 행 선택에 사용되는 input[type=checkbox] 요소를 지정합니다. check 함수를 사용하여 선택된 행의 인덱스를 가져오거나 설정할 수 있습니다. 기본값은 null입니다.
- **checkSingleTarget** (JQuery.Selector): 그리드에서 단일 행 선택에 사용되는 input[type=checkbox] 요소를 지정합니다. check 함수를 사용하여 선택된 행의 인덱스를 가져오거나 설정할 수 있습니다. 기본값은 null입니다.
- **hover** (boolean): true로 설정하면 마우스가 행 위에 있을 때 행 요소에 "list_hover__" 클래스 속성 값이 추가되고, 마우스가 벗어나면 제거됩니다. 기본값은 false입니다.
- **revert** (boolean): true로 설정하면 revert 기능이 활성화되어 revert 메서드를 사용할 수 있습니다. 기본값은 false입니다.
- **createRowDelay** (number): 1 이상의 값으로 설정하면 바인딩 시 그리드의 각 행이 개별적으로 생성되며, 다음 행이 생성될 때까지의 간격을 설정합니다. 기본값은 1입니다.
- **scrollPaging** (object): 스크롤 페이징 시 한 번에 바인딩할 행 수를 지정합니다. 헤더가 고정된 리스트의 경우 기본적으로 스크롤 페이징이 활성화되어 있으며, 0으로 설정하면 스크롤 페이징 기능이 비활성화됩니다. 기본값은 { idx: 0, size: 100 }입니다.
- **fRules** (ND.FormatRuleObject): 대상 요소의 data-format 속성을 사용하는 대신 객체 타입으로 형식 규칙을 지정합니다. 기본값은 null입니다.
- **vRules** (ND.ValidationRuleObject): 대상 요소의 data-validate 속성을 사용하는 대신 객체 타입으로 유효성 검사 규칙을 지정합니다. 기본값은 null입니다.
- **appendScroll** (boolean): false로 설정하면 bind 메서드의 두 번째 인수로 "append" 옵션을 지정하여 추가된 행이 자동으로 스크롤 뷰로 이동하지 않습니다. 기본값은 true입니다.
- **addScroll** (boolean): false로 설정하면 add 메서드로 추가된 행이 자동으로 스크롤 뷰로 이동하지 않습니다. 기본값은 true입니다.
- **selectScroll** (boolean): false로 설정하면 select 메서드로 선택된 마지막 행이 자동으로 스크롤 뷰로 이동하지 않습니다. 기본값은 true입니다.
- **checkScroll** (boolean): false로 설정하면 check 메서드로 체크된 마지막 행이 자동으로 스크롤 뷰로 이동하지 않습니다. 기본값은 true입니다.
- **validateScroll** (boolean): false로 설정하면 validate 메서드로 유효성 검사에 실패한 마지막 행이 자동으로 스크롤 뷰로 이동하지 않습니다. 기본값은 true입니다.
- **cache** (boolean): true로 설정하면 요소 검색 시 캐싱을 적용하여 성능을 약간 향상시킵니다. 기본값은 true입니다.
- **tpBind** (boolean): true로 설정하면 컴포넌트 초기화 전에 기존 바인딩 이벤트(format, validate, dataSync 등)와 컴포넌트 이벤트 간의 충돌을 방지합니다. 기본값은 false입니다.
- **pastiable** (boolean): true로 설정하면 Excel에서 복사한 데이터를 그리드에 붙여넣기(Ctrl + V)할 수 있습니다. 기본값은 false입니다.
- **rowHandlerBeforeBind** (function): bind 또는 add 시 생성된 행 요소에 데이터가 바인딩되기 전에 실행되는 이벤트 핸들러를 정의합니다. 기본값은 null입니다.
- **rowHandler** (function): bind 또는 add 시 생성된 행 요소에 데이터가 바인딩된 후에 실행되는 이벤트 핸들러를 정의합니다. 기본값은 null입니다.
- **onBeforeSelect** (function): 행이 선택되기 전에 실행되는 이벤트 핸들러를 정의합니다. 기본값은 null입니다.
- **onSelect** (function): 행이 선택된 후에 실행되는 이벤트 핸들러를 정의합니다. 기본값은 null입니다.
- **onBind** (function): 데이터 바인딩이 완료된 후에 실행되는 이벤트 핸들러를 정의합니다. 기본값은 null입니다.
- **misc** (object): 그리드 컴포넌트의 다양한 상수를 설정합니다. 기본값은 { resizableCorrectionWidth: 0, resizableLastCellCorrectionWidth: 0, resizeBarCorrectionLeft: 0, resizeBarCorrectionHeight: 0, fixedcolHeadMarginTop: 0, fixedcolHeadMarginLeft: 0, fixedcolHeadHeight: 0, fixedcolBodyMarginTop: 0, fixedcolBodyMarginLeft: 0, fixedcolBodyBindHeight: 0, fixedcolBodyAddHeight: 1, fixedcolRootContainer: null }입니다.

#### N.pagination

페이징 인덱스를 생성합니다.

```javascript
// 페이지네이션 생성
var paginationInst = N("#paginationContainer").pagination();

// 페이지 정보 설정
paginationInst.bind({
    totalCount: 100,
    currPage: 1,
    countPerPage: 10,
    unitPage: 5
});

// 페이지 변경 이벤트 처리
paginationInst.bind({
    onChange: function(pageNo, selEle, selData, currPageNavInfo) {
        console.log("현재 페이지:", pageNo);
    }
});
```

##### 옵션

- **data** (NJS<NC.JSONObject[]>): Pagination에 바인딩할 데이터를 지정합니다. data 옵션이 지정되면 totalCount 값이 자동으로 계산되어 설정됩니다. 기본값은 undefined입니다.
- **context** (NJS<HTMLElement[]>): Pagination을 적용할 요소를 지정합니다. Pagination의 컨텍스트 요소는 ul 및 li 태그를 포함하는 div 태그를 사용해야 합니다. 기본값은 null입니다.
- **totalCount** (number): 전체 행 수를 지정합니다. 데이터베이스를 통한 페이징의 경우 data 옵션을 지정하지 말고 서버에서 totalCount 값만 가져와 설정하세요. 기본값은 0입니다.
- **countPerPage** (number): 페이지당 행 수를 지정합니다. 기본값은 10입니다.
- **countPerPageSet** (number): 페이지 세트당 페이지 수를 지정합니다. 기본값은 10입니다.
- **pageNo** (number): Pagination이 초기화된 후 표시할 초기 페이지 번호를 설정합니다. 기본값은 1입니다.
- **onChange** (function): 페이지가 전환될 때 실행되는 이벤트 핸들러를 정의합니다. 기본값은 undefined입니다.

#### N.tree

계층적 데이터로부터 트리 요소를 생성합니다.

```javascript
// 트리 생성
var treeInst = N("#treeContainer").tree();

// 데이터 바인딩
treeInst.bind([
    {
        id: "1",
        name: "부모 노드",
        children: [
            { id: "1-1", name: "자식 노드 1" },
            { id: "1-2", name: "자식 노드 2" }
        ]
    }
]);

// 선택 이벤트 처리
treeInst.bind({
    onSelect: function(selNodeIndex, selNodeEle, selNodeData) {
        console.log("선택된 노드:", selNodeData);
    }
});
```

##### 옵션

- **data** (NJS<NC.JSONObject[]>): Tree에 바인딩할 데이터를 지정합니다. 기본값은 undefined입니다.
- **context** (NJS<HTMLElement[]>): Tree를 적용할 요소를 지정합니다. 기본값은 null입니다.
- **key** (string): 노드 이름으로 표시될 데이터의 속성 이름을 지정합니다. 기본값은 null입니다.
- **val** (string): 노드 값으로 설정될 데이터의 속성 이름을 지정합니다. 기본값은 null입니다.
- **level** (string): 노드 레벨로 설정될 데이터의 속성 이름을 지정합니다. 기본값은 null입니다.
- **parent** (string): 부모 노드 값으로 설정될 데이터의 속성 이름을 지정합니다. 기본값은 null입니다.
- **folderSelectable** (boolean): true로 설정하면 폴더 노드를 선택할 수 있습니다. 기본값은 false입니다.
- **checkbox** (boolean): true로 설정하면 노드 이름 앞에 체크박스가 추가됩니다. 기본값은 false입니다.
- **onSelect** (function): 노드가 선택될 때 실행되는 이벤트 핸들러를 정의합니다. 기본값은 null입니다.
- **onCheck** (function): 노드가 체크될 때 실행되는 이벤트 핸들러를 정의합니다. 기본값은 null입니다.

## Natural-UI.Shell

Natural-UI.Shell은 전역 알림, 문서 컨테이너 등의 UI 컴포넌트를 제공하는 패키지입니다.

### 주요 컴포넌트

#### N.notify

사용자 확인이 필요 없는 전역 알림을 표시합니다.

```javascript
// 알림 표시
N.notify("top", {
    msg: "알림 메시지",
    timeout: 3000
});

// 알림 추가
N.notify.add("top", {
    msg: "추가 알림 메시지",
    timeout: 3000
});
```

##### 옵션

- **position** (object): 메시지가 표시될 위치를 설정합니다. left, right, top, bottom 속성으로 지정할 수 있습니다. 기본값은 { top: 10, right: 10 }입니다.
- **container** (NJS<HTMLElement[]>): 메시지 요소를 포함하는 전역 메시지 컨테이너를 지정합니다. 기본값은 N("body")입니다.
- **context** (NJS<HTMLElement[]>): 메시지를 표시하는 요소의 인스턴스가 할당됩니다. 기본값은 undefined입니다.
- **displayTime** (number): 메시지가 표시되는 시간(초)을 설정합니다. 기본값은 7입니다.
- **alwaysOnTop** (boolean): true로 설정하면 메시지 대화 상자가 항상 맨 위에 표시됩니다. 기본값은 false입니다.
- **html** (boolean): true로 설정하면 메시지의 HTML 코드가 적용됩니다. 기본값은 false입니다.
- **alwaysOnTopCalcTarget** (string): alwaysOnTop 옵션을 적용할 때 최상위 z-index를 계산하기 위한 대상 요소를 지정합니다. jQuery 선택자 구문으로 지정합니다. 기본값은 "div, span, ul, p, nav, article, section, header, footer, aside"입니다.

#### N.docs

Natural-JS 기반의 메뉴 페이지를 MDI(Multi Document Interface) 또는 SDI(Single Document Interface) 구조로 표시하는 페이지 컨테이너입니다.

```javascript
// 문서 컨테이너 생성
N("#docsContainer").docs();

// 페이지 추가
N("#docsContainer").instance("docs").addPage({
    url: "/page.html",
    title: "페이지 제목"
});
```

##### 옵션

- **context** (NJS<HTMLElement[]>): N.docs를 적용할 요소를 지정합니다. 기본값은 undefined입니다.
- **multi** (boolean): true로 설정하면 N.docs가 탭 기반의 다중 문서 인터페이스(MDI) 형식으로 생성되고, false로 설정하면 일반적인 단일 문서 인터페이스(SDI) 형식으로 생성됩니다. 기본값은 true입니다.
- **maxStateful** (number): multi 옵션이 true인 경우, 웹 브라우저가 추가 탭 콘텐츠가 열릴 때마다 느려지는 것을 방지하기 위해 상태를 유지하는 탭 콘텐츠의 최대 수를 설정할 수 있습니다. 0으로 설정하면 상태 유지 콘텐츠의 최대 수를 제한하지 않습니다. 기본값은 0입니다.
- **maxTabs** (number): multi 옵션이 true인 경우, 웹 브라우저가 추가 탭 콘텐츠가 열릴 때마다 느려지는 것을 방지하기 위해 탭 콘텐츠의 최대 수를 설정할 수 있습니다. 0으로 설정하면 탭의 최대 수를 제한하지 않습니다. 기본값은 0입니다.
- **addLast** (boolean): true로 설정하면 add 메서드를 호출할 때 새 탭이 마지막에 추가됩니다. 기본값은 false입니다.
- **tabScroll** (boolean): true로 설정하면 마우스 드래그나 터치로 탭을 스크롤할 수 있습니다. 기본값은 false입니다.
- **tabScrollCorrection** (object): 탭 요소에 영향을 주는 스타일(CSS)로 인해 마지막 탭이 잘리거나 간격이 생길 수 있습니다. 이때 tabScrollCorrection 객체의 속성을 사용하여 다음 옵션 값을 조정하여 정상적으로 표시할 수 있습니다. 기본값은 { rightCorrectionPx: 0 }입니다.
- **closeAllRedirectURL** (string | null): "모두 닫기" 버튼을 클릭할 때 closeAllRedirectURL 옵션 값이 null이면 활성 탭을 제외한 모든 탭이 닫히고, url 문자열을 입력하면 해당 url로 리디렉션됩니다. 기본값은 null입니다.
- **entireLoadIndicator** (boolean): true로 설정하면 페이지가 로드될 때 실행되는 모든 Ajax 요청이 완료될 때까지 진행 표시줄이 표시됩니다. 기본값은 false입니다.
- **entireLoadScreenBlock** (boolean): true로 설정하면 페이지가 로드될 때 실행되는 모든 Ajax 요청이 완료될 때까지 화면을 차단하여 이중 제출을 방지합니다. 기본값은 false입니다.
- **entireLoadExcludeURLs** (string[]): entireLoad 관련 이벤트나 옵션(entireLoadIndicator, entireLoadScreenBlock 등)에서 entireLoadExcludeURLs로 지정된 URL은 캡처에서 제외됩니다. 기본값은 []입니다.
- **onBeforeLoad** (function | null): 콘텐츠가 로드되기 전에 실행되는 이벤트입니다. 기본값은 null입니다.
- **onLoad** (function | null): 페이지가 로드된 후 실행되는 이벤트입니다. 기본값은 null입니다.
- **onBeforeEntireLoad** (function | null): 페이지가 로드될 때 Ajax 요청이 캡처되기 전에 실행되는 이벤트입니다. 기본값은 null입니다.
- **onErrorEntireLoad** (function | null): 페이지 로딩이 완료되고 모든 Ajax 요청이 완료되기 전에 오류가 발생할 때 실행되는 이벤트 핸들러를 정의합니다. 기본값은 null입니다.
- **onEntireLoad** (function | null): 페이지 로딩이 완료되고 모든 Ajax 요청이 완료된 후 실행되는 이벤트 핸들러를 정의합니다. 기본값은 null입니다.
- **onBeforeActive** (function | null): 선택한 탭이 활성화되기 전에 실행되는 이벤트 핸들러를 정의합니다. 기본값은 null입니다.
- **onActive** (function | null): 선택한 탭이 활성화된 후 실행되는 이벤트 핸들러를 정의합니다. 기본값은 null입니다.
- **onBeforeInactive** (function | null): 선택한 탭이 비활성화되기 전에 실행되는 이벤트 핸들러를 정의합니다. 기본값은 null입니다.
- **onInactive** (function | null): 선택한 탭이 비활성화된 후 실행되는 이벤트 핸들러를 정의합니다. 기본값은 null입니다.
- **onBeforeRemoveState** (function | null): 선택한 탭의 상태가 제거되기 전에 실행되는 이벤트 핸들러를 정의합니다. 기본값은 null입니다.
- **onRemoveState** (function | null): 선택한 탭의 상태가 제거된 후 실행되는 이벤트 핸들러를 정의합니다. 기본값은 null입니다.
- **onBeforeRemove** (function | null): 선택한 탭이 제거되기 전에 실행되는 이벤트 핸들러를 정의합니다. 기본값은 null입니다.
- **onRemove** (function | null): 선택한 탭이 제거된 후 실행되는 이벤트 핸들러를 정의합니다. 기본값은 null입니다.
- **alwaysOnTop** (boolean): true로 설정하면 메뉴 목록 대화 상자가 항상 맨 위에 표시됩니다. 기본값은 false입니다.
- **alwaysOnTopCalcTarget** (string): alwaysOnTop 옵션을 적용할 때 최상위 z-index를 계산하기 위한 대상 요소를 지정합니다. jQuery 선택자 구문으로 지정합니다. 기본값은 "div, span, ul, p, nav, article, section, header, footer, aside"입니다.

## Natural-CODE

### NCD.SeverityLevels
- **설명**: 코드 검사 결과의 심각도 수준을 정의하는 열거형입니다.
- **값**:
    - `BLOCKER`: 심각한 문제로 즉시 수정이 필요.
    - `CRITICAL`: 중요한 문제로 가능한 빨리 수정이 필요.
    - `MAJOR`: 주요 문제로 수정이 권장됨.
    - `MINOR`: 경미한 문제로 수정이 선택 사항.
- **사용법**:
  ```typescript
  const level = NCD.SeverityLevels.BLOCKER;
  console.log(level); // "Blocker"
  ```

### NCD.CodeInspectionResult
- **설명**: 코드 검사 결과를 나타내는 객체입니다.
- **속성**:
    - `level` (SeverityLevels): 문제의 심각도 수준.
    - `message` (string): 문제에 대한 설명 메시지.
    - `line` (number): 문제가 발생한 코드의 줄 번호.
    - `code` (string): 문제가 발생한 코드의 내용.
- **사용법**:
  ```typescript
  const result: NCD.CodeInspectionResult = {
      level: NCD.SeverityLevels.CRITICAL,
      message: "Selector is missing a context.",
      line: 42,
      code: "N('.button')"
  };
  console.log(result.message);
  ```

### NCD.inspection.test
- **설명**: 코드 검사 도구로, 제공된 코드와 규칙을 기반으로 문제를 검사합니다.
- **옵션/인수**:
    - `codes` (string): 검사할 코드 문자열.
    - `rules` (string[], 선택적): 적용할 검사 규칙의 이름 배열. 생략 시 모든 규칙이 적용됩니다.
- **반환값**:
    - `boolean`: 문제가 없으면 `true`.
    - `NCD.CodeInspectionResult[]`: 문제가 있으면 문제 목록을 반환.
- **사용법**:
  ```typescript
  const codes = "N('.button')";
  const results = NCD.inspection.test(codes);
  if (Array.isArray(results)) {
      results.forEach(result => console.log(result.message));
  }
  ```

### NCD.inspection.rules
- **설명**: 코드 검사 규칙을 정의합니다.
- **메서드**:
    - `NoContextSpecifiedInSelector(codes: string, excludes: string[], report: NCD.CodeInspectionResult[])`: 선택자에 컨텍스트가 지정되지 않은 경우를 검사.
    - `UseTheComponentsValMethod(codes: string, excludes: string[], report: NCD.CodeInspectionResult[])`: `val()` 메서드 대신 `N.vals()`를 사용하도록 권장.
- **사용법**:
  ```typescript
  const report: NCD.CodeInspectionResult[] = [];
  NCD.inspection.rules.NoContextSpecifiedInSelector("N('.button')", [], report);
  console.log(report);
  ```

### NCD.inspection.report.console
- **설명**: 검사 결과를 브라우저 콘솔에 출력합니다.
- **옵션/인수**:
    - `data` (NCD.CodeInspectionResult[]): 검사 결과 배열.
    - `url` (string): 관련 문서나 리소스의 URL.
- **반환값**: `false` 또는 `undefined`.
- **사용법**:
  ```typescript
  const results: NCD.CodeInspectionResult[] = [
      { level: NCD.SeverityLevels.MAJOR, message: "Example issue", line: 10, code: "N('.example')" }
  ];
  NCD.inspection.report.console(results, "https://example.com/docs");
  ```

### NCD.addSourceURL
- **설명**: 코드 문자열에 소스 URL을 추가합니다. 디버깅 시 유용합니다.
- **옵션/인수**:
    - `codes` (string): 소스 URL을 추가할 코드 문자열.
    - `sourceURL` (string): 추가할 소스 URL.
- **반환값**: 소스 URL이 추가된 코드 문자열.
- **사용법**:
  ```typescript
  const codes = "console.log('Hello, world!');";
  const updatedCodes = NCD.addSourceURL(codes, "example.js");
  console.log(updatedCodes);
  ```

## Natural-TEMPLATE

Natural-TEMPLATE는 템플릿 관리 기능을 제공하는 패키지입니다.

```javascript
// 템플릿 렌더링
var html = N.template.render("template-id", {
    name: "홍길동",
    age: 30
});

// 템플릿 추가
N.template.add("template-id", "<div>이름: {{name}}, 나이: {{age}}</div>");
```

### 옵션

#### 추가 옵션 (Extra)

- **action** (string | [string, ...any[]]): 컴포넌트가 초기화된 후 지정된 함수가 즉시 실행됩니다. 문자열 타입으로 설정하면 함수 이름이 지정되고, 배열 타입으로 설정하면 첫 번째 요소는 함수 이름, 나머지 요소는 함수의 인수로 사용됩니다. 기본값은 undefined입니다.
- **usage** (string | object): 폼의 목적을 지정합니다. "search-box" 문자열을 입력하면 지정된 영역이 검색 상자 폼으로 생성됩니다. 객체 타입으로 더 자세한 옵션을 지정할 수 있습니다. 기본값은 undefined입니다.

#### 선택 옵션 (Select)

- **code** (string): 바인딩할 코드 목록의 분류 코드 값을 설정합니다. 기본값은 undefined입니다.
- **comm** (string): 목록을 검색하는 Communicator를 지정합니다. 컨트롤러 객체에 선언된 `c.{serviceName}`을 지정합니다. 기본값은 undefined입니다.
- **data** (NC.JSONObject[]): 바인딩할 데이터를 지정합니다. `comm` 옵션을 지정하지 않고 `data` 옵션을 통해 [{}, {}]와 같이 직접 데이터를 생성하고 바인딩할 수 있습니다. 기본값은 undefined입니다.
- **key** (string): 선택 요소의 레이블에 바인딩되는 데이터의 속성 이름을 지정합니다. 검색된 데이터 객체에서 바인딩할 속성 이름을 설정합니다. 기본값은 undefined입니다.
- **val** (string): 선택 요소의 값에 바인딩되는 데이터의 속성 이름을 지정합니다. 검색된 데이터 객체에서 바인딩할 속성 이름을 설정합니다. 기본값은 undefined입니다.
- **filter** (function): 공통 코드 데이터를 바인딩하기 전에 필터링합니다. 기본값은 undefined입니다.
- **selected** (string): 기본 선택 값을 지정합니다. 컴포넌트가 초기화될 때 기본 선택의 값을 설정합니다. 기본값은 undefined입니다.

## 결론

Natural-JS는 웹 애플리케이션 개발을 위한 강력한 JavaScript 프레임워크입니다. 다양한 UI 컴포넌트와 데이터 처리 기능을 제공하여 개발자가 효율적으로 웹 애플리케이션을 개발할 수 있도록 도와줍니다. 이 핸드북이 Natural-JS를 사용하는 데 도움이 되기를 바랍니다.
