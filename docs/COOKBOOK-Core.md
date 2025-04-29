# Natural-JS Core 가이드북

## Natural-JS 소개

Natural-JS는 기업용 웹 애플리케이션의 사용자 인터페이스를 직관적이고 쉽고 빠르게 구현할 수 있도록 설계된 JavaScript 아키텍처 프레임워크입니다.

### Natural-JS의 특징

1. **CVC 아키텍처 패턴 기반**의 Natural-ARCHITECTURE 프레임워크를 제공합니다.
2. **AOP**: Controller 객체의 사용자 정의 함수에 AOP(Aspect-Oriented Programming)를 적용할 수 있습니다.
3. **Communication Filter**: 서버와 주고받는 모든 데이터를 필터링할 수 있는 기능을 제공합니다.
4. **웹 컴포넌트**: 페이지를 블록 단위로 개발할 수 있는 아키텍처를 제공합니다. 이 페이지 블록들은 Tab이나 Popup의 콘텐츠나 SPA(Single Page Application)의 페이지 콘텐츠, MSA(Micro Service Architecture)의 웹 컴포넌트로 로드할 수 있습니다.
5. **UI 개발의 분업화**: UI 소스 코드 안에서 개발 영역과 프레젠테이션 영역을 완벽하게 분리하여 웹 퍼블리셔와 스크립트 개발자 또는 백엔드 개발자와 프론트엔드 개발자의 역할을 분리하여 프로젝트를 진행할 수 있습니다.

### Natural-JS의 구성

Natural-JS는 다음과 같은 4가지 주요 라이브러리 패키지로 구성됩니다:

1. **Natural-CORE**: Natural-JS 내에서 전역적으로 사용되는 공통 라이브러리 패키지입니다.
2. **Natural-ARCHITECTURE**: Natural-JS의 아키텍처를 구성하는 라이브러리 패키지입니다.
3. **Natural-DATA**: 데이터 동기화, 포맷팅, 검증 및 가공을 지원하는 라이브러리 패키지입니다.
4. **Natural-UI**: HTML 기반의 UI 컴포넌트를 제공하는 라이브러리 패키지입니다.

### 주요 수상 경력
- 2018 제12회 공개SW 개발자대회 - 금상
- 2016 제10회 공개SW 개발자대회 - 동상
- 2012 제24회 글로벌 소프트웨어 공모대전 - 동상

### 지원 브라우저
- ECMAScript5(ES5) 이상을 지원하는 모든 PC/모바일 웹 브라우저.

### 라이센스
- This software is licensed under the LGPL v2.1
- © Goldman Kim (bbalganjjm@gmail.com)

## Natural-CORE

Natural-JS의 핵심 기능을 제공하는 모듈입니다.

### N() & N

#### 개요

**N()** 은 Natural-JS 코어 메서드입니다. 전달된 인수를 기반으로 DOM에서 요소를 찾거나 HTML 문자열을 전달하여 생성된 일치하는 요소의 컬렉션을 반환합니다.

**N** 은 Natural-JS의 코어 함수들이 정의되어 있는 객체 클래스입니다.

N()은 jQuery() 함수를 확장한 객체입니다. 때문에 $() 나 jQuery()로 대체하여 사용 가능합니다. 그러나 N 오브젝트의 로컬 함수들은 jQuery 나 $ 오브젝트에서 사용이 불가능합니다.

#### jQuery selector 확장

Natural-CORE 에는 CSS1~3에서 지원되지 않는 형태의 패턴 검색을 위해 요소의 속성 값을 정규 표현식으로 평가할 수 있는 regexp 필터 셀렉터가 확장되어 있습니다. 이를 통해 보다 복잡한 형태의 요소 검색을 지원합니다.

**셀렉터 구문**
```
:regexp(attributeName[:propertyName], expr)
```

- **selector**: 기본 selector 문자열입니다. 생략할 경우 모든 요소에 대해 평가가 이뤄지기 때문에 가능하면 지정하는 것이 좋습니다.
- **attributeName**: 평가하려는 값을 갖고 있는 HTML DOM 요소의 속성 명입니다.
  - **data**: 요소의 data속성을 추출합니다. 반드시 propertyName으로 하위 속성을 지정해야 합니다. .data(properyName) 함수의 반환 값과 같습니다.
  - **css**: 요소의 css 속성을 추출합니다. 반드시 propertyName으로 하위 속성을 지정해야 합니다. .css(propertyName) 함수의 반환 값과 같습니다.
  - **class**: 요소의 class 속성을 추출합니다. class 속성 값이 둘 이상인 요소의 경우 각 클래스에 대해 평가가 수행됩니다.
- **expr**: 정규 표현식 문자열입니다. 큰따옴표나 작은따옴표로 감싸지 않아야 합니다.

**예제**
```javascript
// href 속성에 "Mr.Lee" 혹은 "Mr.Kim"을 포함하는 모든 a 태그 추출
N("a:regexp(href, Mr\\.(Lee|K
im))");

// 다중 class 속성 값을 가진 요소 필터링
N("div:regexp(class, ^someClass)");

// data속성의 프로퍼티 명으로 필터링
N("div:regexp(data:sample, test-[1-2])");

// css 속성의 프로퍼티 명으로 필터링
N("div:regexp(css:width, ^128px)");

// id 속성 값으로 필터링
N("div:regexp(id, page-[0-9])");
```

#### jQuery plugin 확장 메서드

jQuery plugin 형태로 제공되는 CORE 유틸리티 함수들은 다음과 같습니다.

##### N("selector").instance
UI 컴포넌트의 context 요소나 View 요소에서 컴포넌트 객체의 인스턴스 또는 Controller object를 반환하거나 객체 인스턴스를 요소에 저장합니다.

Natural-JS는 탭이나 팝업 등의 블록 콘텐츠를 쉽게 제어하기 위해서 컴포넌트나 라이브러리 초기화 시 지정한 템플릿(context 나 view) 요소에 생성된 객체 인스턴스를 저장합니다.

다음과 같이 인수의 개수와 타입에 따라서 다르게 작동됩니다:

- **인수 없음**: 선택한 요소에 저장되어 있는 모든 인스턴스를 반환합니다. 인스턴스가 1개면 원래 인스턴스 객체가, 두 개 이상이면 배열로 반환됩니다.
- **콜백 함수**: 선택한 요소에 저장되어 있는 모든 인스턴스를 콜백 함수의 인수로 전달합니다. 인스턴스 개수만큼 콜백 함수가 실행됩니다.
- **instanceId**: 선택한 요소에 특정 이름으로 저장된 인스턴스를 반환합니다.
- **instanceId, 콜백 함수**: 선택한 요소에 특정 이름으로 저장된 인스턴스를 콜백 함수의 인수로 전달합니다.
- **name, instance**: 선택한 요소에 instance를 name으로 저장합니다.

미리 정의된 인스턴스 명은 다음과 같습니다:
- N.cont의 Controller object: cont
- N.alert의 instance: alert
- N.button의 instance: button
- N.datepicker의 instance: datepicker
- N.popup의 instance: popup
- N.tab의 instance: tab
- N.select의 instance: select
- N.form의 instance: form
- N.list의 instance: list
- N.grid의 instance: grid
- N.pagination의 instance: pagination
- N.tree의 instance: tree
- N.notify의 instance: notify
- N.docs의 instance: docs

##### N("selector").tpBind
선택한 요소에 같은 이름의 이벤트 정의되어 있더라도 tpBind로 정의한 이벤트가 제일 먼저 실행되게 해 줍니다. 기본적인 사용법은 jQuery().bind 메서드와 같습니다.

##### N("selector").vals
select, select[multiple=multiple], input[type=radio], input[type=checkbox]와 같은 선택 요소의 선택된 값을 가져오거나 선택합니다.

vals 인수를 입력하지 않으면 선택한 값이 반환되고, 인수가 지정되면 입력한 값과 일치하는 선택 요소가 선택됩니다.
하나만 선택하면 string 유형의 값이 반환되고 둘 이상인 경우 값이 배열로 반환됩니다.

##### N(array).remove_
인수로 지정한 array의 요소를 제거합니다.

##### N(selector).events
선택한 요소에 바인딩되어 있는 이벤트들을 반환합니다.

#### N 객체의 함수

N 객체의 코어 및 유틸리티 함수입니다.

##### N.version ["package name"]
Natural-JS의 패키지별 버전을 반환합니다.
- Natural-CORE의 패키지의 버전: N.version["Natural-CORE"]
- Natural-ARCHITECTURE의 패키지의 버전: N.version["Natural-ARCHITECTURE"]
- Natural-DATA의 패키지의 버전: N.version["Natural-DATA"]
- Natural-UI의 패키지의 버전: N.version["Natural-UI"]
- Natural-UI.Shell의 패키지의 버전: N.version["Natural-UI.Shell"]

##### N.locale
프레임웍에 설정된 로케일 값을 가져오거나 설정할 수 있습니다. 설정된 로케일 값에 따라서 프레임워크의 기본 메시지들이 다국어 처리됩니다.

미리 등록된 다국어 메시지 세트는 en_US, ko_KR이 있고 Config(natural.config.js)의 message 속성에서 수정할 수 있습니다.

##### N.debug, N.log, N.info, N.warn, N.error
브라우저 콘솔에 각각 debug, log, info, warn, error 메시지를 출력합니다. window.console의 해당 함수들과 같은 기능을 합니다.

##### N.type(obj)
지정한 객체의 타입("number", "string", "array", "object", "function", "date")을 반환합니다.

##### N.isString(obj), N.isNumeric(obj), N.isPlainObject(obj), N.isEmptyObject(obj), N.isArray(obj), N.isArraylike(obj), N.isWrappedSet(obj), N.isElement(obj)
입력한 객체가 각각 string 타입, 숫자 타입, 순수한 객체 타입, 빈 객체, array 타입, array와 비슷한 타입, jQuery object 타입, HTML 요소인지 검사합니다.

##### N.toSelector(obj)
N() 함수의 인수로 입력된 객체의 selector를 추출합니다.

##### N.serialExecute(function(defer) { ... }, ...)
비동기 실행 로직의 계층적 콜백들을 jQuery.Deferred를 사용하여 직렬로 표기할 수 있게 해 주는 함수입니다.

#### N.gc 객체의 함수

N.gc는 Natural-JS의 가비지 컬렉션 관련 유틸리티 함수들을 모아놓은 객체입니다.

##### N.gc.minimum()
Natural-JS의 컴포넌트와 라이브러리에서 사용되는 요소와 이벤트에 대한 최소한의 자원을 회수합니다.
N.comm으로 Config(natural.config.js)의 N.context.attr("architecture").page.context 영역에 페이지를 불러올 경우 N.gc[N.context.attr("core").gcMode]()가 자동으로 실행됩니다.

##### N.gc.full()
Natural-JS의 컴포넌트와 라이브러리에서 사용되는 요소와 이벤트에 대한 모든 자원을 회수합니다.
SPA(Single Page Application)로 사이트를 제작할 때 브라우저의 메모리가 페이지를 열 때마다 증가한다면 어딘가에서 메모리 누수가 발생하는 것입니다.
N.comm에서 자동으로 포착할 수 없는 부분을 파악하여 N.gc.full()을 실행해 주면 해당 현상이 개선될 수 있습니다.

##### N.gc.ds()
N.ds의 observable 들에서 가비지 인스턴스를 제거합니다.
N.comm으로 Config(natural.config.js)의 N.context.attr("architecture").page.context 영역이 아닌 곳에 페이지를 불러올 경우 N.gc.ds()가 자동으로 실행됩니다.

### Config(natural.config.js)

(이 부분은 추가 정보 수집 후 작성 예정)

## 제한 및 팁

### 제한

#### jQuery 기능 사용제한
- jQuery.ajax 함수를 사용하면 Communication Filter 기능을 사용할 수 없습니다. 반드시 서버와의 통신은 Communicator(N.comm)를 사용해야 합니다.
- UI 컴포넌트를 사용해서 데이터를 바인딩 한 입력 요소에 jQuery.val 함수를 사용하여 값을 변경하면 화면의 값만 변경되고 내부 데이터는 변경되지 않습니다. 반드시 컴포넌트 인스턴스의 val 메서드를 사용해야 합니다.

#### 요소 선택 시 주의 사항
페이지의 요소를 선택할 때는 반드시 view에서 find하거나 view를 jQuery 함수의 context 인수(두 번째 인수)로 지정해야 합니다. 그렇지 않으면 다른 블록 페이지의 의도하지 않은 요소까지 선택되어 예측이 어려운 오류가 발생할 수 있습니다.

```javascript
N(".pageId").cont({
    init: function(view, request) {
        $("selector", view);
        view.find("selector");
    }
});
```
