# Natural-JS 가이드북

## Natural-JS 개요

Natural-JS는 기업용 웹 애플리케이션의 사용자 인터페이스를 직관적이고 쉽고 빠르게 구현할 수 있도록 설계된 JavaScript 아키텍처 프레임워크입니다. 

### Natural-JS의 특징

1. **CVC 아키텍처 패턴** 기반의 Natural-ARCHITECTURE 프레임워크 제공
2. **AOP(Aspect-Oriented Programming)** - Controller 객체의 사용자 정의 함수에 AOP를 적용 가능
3. **Communication Filter** - 서버와 주고받는 모든 데이터를 필터링할 수 있는 기능 제공
4. **웹 컴포넌트** - 페이지를 블록 단위로 개발할 수 있는 아키텍처 제공
   - 페이지 블록들은 Tab이나 Popup의 콘텐츠나 SPA(Single Page Application)의 페이지 콘텐츠, MSA(Micro Service Architecture)의 웹 컴포넌트로 로드 가능
5. **UI 개발의 분업화** - UI 소스 코드 안에서 개발 영역과 프레젠테이션 영역을 완벽하게 분리하여 역할 분담 가능
6. **다양한 UI 컴포넌트** 제공
   - **데이터 처리 컴포넌트**: Grid, List, Form, Select, Pagination, Tree
   - **UI 컴포넌트**: Alert, Popup, Tab, Button, Datepicker, Notify, Documents
7. **양방향 데이터 바인딩** - 서로 다른 UI 컴포넌트에 같은 데이터를 바인딩하면 실시간 동기화 및 상호작용
8. **컴포넌트 디자인** - 컴포넌트 스타일을 쉽게 변경 가능, 사이트의 공통 스타일 자동 적용 가능
9. **데이터 처리 라이브러리** 제공
   - **데이터 서식화**: Formatter 라이브러리
   - **데이터 유효성 검증**: Validator 라이브러리
   - **데이터 유틸리티**: filter, sort 등의 라이브러리
10. **모바일 지원** - 모바일 브라우저(ES5이상)와 터치 디바이스 지원, 모바일 하이브리드 앱과의 연동 지원
11. **TypeScript 지원** - 타입 선언 파일 제공

### Natural-JS의 구성

Natural-JS는 다음과 같은 주요 패키지로 구성되어 있습니다:

1. **Natural-CORE**: Natural-JS 내에서 전역적으로 사용되는 공통 라이브러리 패키지
2. **Natural-ARCHITECTURE**: Natural-JS의 아키텍처를 구성하는 라이브러리 패키지
3. **Natural-DATA**: 데이터 동기화, 포맷팅, 검증 및 가공을 지원하는 라이브러리 패키지
4. **Natural-UI**: HTML 기반의 UI 컴포넌트를 제공하는 라이브러리 패키지

## Natural-CORE

### N() & N

- **N()**: Natural-JS 코어 메서드로, 전달된 인수를 기반으로 DOM에서 요소를 찾거나 HTML 문자열을 전달하여 생성된 일치하는 요소의 컬렉션을 반환합니다.
- **N**: Natural-JS의 코어 함수들이 정의되어 있는 객체 클래스입니다.

자세한 내용은 [Natural-CORE 가이드](DEVELOPER-GUIDE-CORE.md)를 참조하세요.

N()과 N은 다음과 같은 jQuery 확장 기능과 유틸리티 클래스를 제공합니다:

- **jQuery 셀렉터 확장**: HTML의 style이나 data- 속성으로도 셀렉터를 정의할 수 있는 jQuery 셀렉터 확장 기능
- **jQuery 플러그인 확장 메서드**: jQuery 플러그인으로 제작된 Natural-JS 유틸리티 메서드
- **N.gc**: Natural-JS 내부 가비지 컬렉션을 위한 유틸리티 집합 클래스
- **N.string**: 문자열 제어를 위한 함수 집합 클래스
- **N.element**: HTML 요소 제어를 위한 함수 집합 클래스
- **N.date**: 날짜 제어를 위한 함수 집합 클래스
- **N.browser**: 웹 브라우저 정보 관련 함수 집합 클래스
- **N.message**: 메시지(다국어) 처리를 위한 함수 집합 클래스
- **N.array**: 배열 데이터 조작을 위한 함수 집합 클래스
- **N.json**: JSON 데이터 조작을 위한 함수 집합 클래스
- **N.event**: 이벤트 제어를 위한 함수 집합 클래스
- **N.message**: 메시지(다국어) 처리를 위한 함수 집합 클래스
- **N.array**: 배열 데이터 조작을 위한 함수 집합 클래스
- **N.json**: JSON 데이터 조작을 위한 함수 집합 클래스
- **N.event**: 이벤트 제어를 위한 함수 집합 클래스

### Config(natural.config.js)

Config(natural.config.js)는 Natural-JS의 운영 환경 설정, AOP 설정, Communication Filter 설정, UI 컴포넌트의 기본 옵션 값 등을 저장하는 공간입니다. 자세한 내용은 [Config 레퍼런스](DEVELOPER-GUIDE-CONFIG.md)를 참조하세요.

## Natural-ARCHITECTURE

Natural-ARCHITECTURE는 Natural-JS의 아키텍처를 구성하는 라이브러리 패키지입니다. 자세한 내용은 [Natural-ARCHITECTURE 가이드](DEVELOPER-GUIDE-ARCHITECTURE.md)를 참조하세요.

### Communicator-View-Controller(CVC) 아키텍처 패턴

CVC 패턴은 Model-View-Controller(MVC) 패턴을 기반으로 하는 아키텍처 패턴입니다. 클라이언트 브라우저 영역을 Communicator-View-Controller 아키텍처로 구성하고, 서버 전체를 Model 영역으로 정의하는 클라이언트 중심의 아키텍처 패턴입니다.

CVC 패턴의 장점:
- 클라이언트 브라우저 구현 기술이 서버 기술 및 서버 아키텍처 종속성에서 벗어날 수 있습니다.
- 디자인 영역과 개발 영역을 완벽하게 분리하여 개발의 복잡성을 낮출 수 있습니다.

### Natural Architecture Framework

Natural Architecture Framework는 CVC Architecture Pattern을 구현한 아키텍처 프레임워크입니다. 개발 업무 영역을 명확하게 구분해주어 각 영역별 전문가들로 분업할 수 있는 기반을 제공합니다.

#### Controller

Controller(N.cont)는 CVC Architecture Pattern의 Controller 레이어를 구현한 클래스입니다. 자세한 내용은 [Controller 가이드](DEVELOPER-GUIDE-CONTROLLER.md)를 참조하세요.
- Controller object는 블록 페이지를 제어하는 사용자 정의 함수들이 구현되는 객체입니다.
- N.cont는 Controller object의 init 함수를 실행해주고 Controller object를 반환합니다.
- Natural-ARCHITECTURE는 Controller object를 대상으로 AOP(Aspect-Oriented Programming)를 지원합니다. 자세한 내용은 [AOP 가이드](DEVELOPER-GUIDE-AOP.md)를 참조하세요.

#### View

View는 별도의 구현체가 없으며, 블록 페이지의 HTML 요소 영역이 View로 정의됩니다.

#### Communicator

Communicator(N.comm)는 CVC 아키텍처 패턴의 커뮤니케이터 레이어를 구현한 클래스입니다. 자세한 내용은 [Communicator 가이드](DEVELOPER-GUIDE-COMMUNICATOR.md)를 참조하세요.
- N.comm은 서버에 콘텐츠나 데이터를 요청하거나 매개변수를 전달하는 등, 서버와의 Ajax 통신을 지원하는 라이브러리입니다.
- N.comm은 서버와 통신하는 모든 요청 및 응답 또는 오류 발생 단계에서 공통 로직을 실행할 수 있는 Communication Filter 기능을 제공합니다.

#### Context

Context(N.context)는 Natural-JS 기반 애플리케이션의 Life-Cycle(페이지가 적재되고 다른 URL로 redirect되기 전까지) 안에서 데이터의 영속성을 보장하는 공간입니다. 자세한 내용은 [Context 가이드](DEVELOPER-GUIDE-CONTEXT.md)를 참조하세요.
- Natural-JS의 환경 설정 값(Config(natural.config.js)), 프레임워크 공통 메시지 등이 N.context 객체에 저장됩니다.

## Natural-DATA

Natural-DATA는 데이터의 동기화, 포맷팅, 유효성 검사, 가공을 지원하는 라이브러리 패키지입니다. 자세한 내용은 [Natural-DATA 가이드](DEVELOPER-GUIDE-DATA.md)를 참조하세요.

### DataSync

DataSync는 컴포넌트나 라이브러리에 의해 변경된 데이터를 실시간으로 동기화해주는 라이브러리입니다.
- DataSync는 컴포넌트 간 양방향 데이터 바인딩을 지원합니다.

### Formatter

Formatter(N.formatter)는 입력한 데이터셋(json object array)을 포맷팅하고 포맷팅된 데이터셋을 반환해 주는 라이브러리입니다.

### Validator

Validator(N.validator)는 입력한 데이터셋(json object array)에 대한 유효성을 검사하고 검사 결과 데이터셋을 반환해 주는 라이브러리입니다.

### Natural-DATA Library

Natural-DATA Library는 json object array 유형의 데이터를 정렬, 필터링 및 정제하기 위한 메서드 및 함수를 제공합니다.

## Natural-UI

Natural-UI는 HTML 기반의 UI 컴포넌트를 지원하는 라이브러리 패키지입니다. Grid, List, Form 등의 컴포넌트는 자체 스타일이 없습니다. 컴포넌트를 초기화하기 전에 컴포넌트의 컨텍스트 요소(table, ul/li 등)에 스타일을 정의해 놓으면 정의된 스타일대로 컴포넌트가 생성됩니다. 자세한 내용은 [Natural-UI 가이드](DEVELOPER-GUIDE-UI.md)를 참조하세요.

### Alert

Alert(N.alert)은 window.alert이나 window.confirm 같은 메시지 대화상자를 레이어 팝업 형태로 표현해주는 UI 컴포넌트입니다. 자세한 내용은 [Alert 가이드](DEVELOPER-GUIDE-UI-Alert.md)를 참조하세요.

### Button

Button(N.button)은 context 옵션으로 지정된 "a, input[type=button], button" 요소를 사용하여 버튼을 만드는 UI 컴포넌트입니다. 자세한 내용은 [Button 가이드](DEVELOPER-GUIDE-UI-Button.md)를 참조하세요.

### Datepicker

Datepicker(N.datepicker)는 context 옵션으로 지정한 텍스트 입력 요소에 날짜나 월을 선택하여 입력할 수 있는 달력 팝업을 표시해 주는 UI 컴포넌트입니다. 자세한 내용은 [Datepicker 가이드](DEVELOPER-GUIDE-UI-Datepicker.md)를 참조하세요.

### Popup

Popup(N.popup)은 context 옵션으로 지정한 내부 요소나 url 옵션으로 지정한 페이지를 레이어 팝업 형태로 만들어 주는 UI 컴포넌트입니다. 자세한 내용은 [Popup 가이드](DEVELOPER-GUIDE-UI-Popup.md)를 참조하세요.

### Tab

Tab(N.tab)은 div>ul>li 태그로 구성된 요소를 context 옵션으로 지정하여 탭 페이지 뷰를 만들어 주는 UI 컴포넌트입니다. 자세한 내용은 [Tab 가이드](DEVELOPER-GUIDE-UI-Tab.md)를 참조하세요.

### Select

Select(N.select)는 select, input[type=checkbox], input[type=radio] 요소에 데이터를 바인딩하여 선택 요소를 만들어 주고 해당 컨트롤의 기능을 확장해 주는 UI 컴포넌트입니다. 자세한 내용은 [Select 가이드](DEVELOPER-GUIDE-UI-Select.md)를 참조하세요.

### Form

Form(N.form)은 context 옵션으로 지정한 요소(div, table 등의 block 요소)에 단건 로우 데이터를 바인딩하거나 생성하는 UI 컴포넌트입니다. 자세한 내용은 [Form 가이드](DEVELOPER-GUIDE-UI-Form.md)를 참조하세요.

### List

List(N.list)는 ul>li 요소를 context 옵션으로 지정하여 단일 컬럼 형태로 데이터 목록을 생성해 주는 UI 컴포넌트입니다. 자세한 내용은 [List 가이드](DEVELOPER-GUIDE-UI-List.md)를 참조하세요.

### Grid

Grid(N.grid)는 table 요소를 context 옵션으로 지정하여 멀티 컬럼 형태로 데이터 목록을 생성해 주는 UI 컴포넌트입니다. 자세한 내용은 [Grid 가이드](DEVELOPER-GUIDE-UI-Grid.md)를 참조하세요.

### Pagination

Pagination(N.pagination)은 목록 데이터나 전체 행 수로 페이징 인덱스를 생성해 주는 UI 컴포넌트입니다. 자세한 내용은 [Pagination 가이드](DEVELOPER-GUIDE-UI-Pagination.md)를 참조하세요.

### Tree

Tree(N.tree)는 계층적 데이터를 트리 요소로 만들어 주는 UI 컴포넌트입니다. 자세한 내용은 [Tree 가이드](DEVELOPER-GUIDE-UI-Tree.md)를 참조하세요.

## Natural-UI.Shell

Natural-UI가 콘텐츠 영역의 UI 개발을 지원한다면 Natural-UI.Shell은 콘텐츠 영역 밖의 셸(Shell) 영역의 개발을 지원하는 컴포넌트 패키지입니다.

### Notify

Notify(N.notify)는 사용자의 확인 과정이 필요 없는 전역 알림 메시지를 지정된 위치에 표시해 주는 UI 컴포넌트입니다. 자세한 내용은 [Notify 가이드](DEVELOPER-GUIDE-UI.Shell-Notify.md)를 참조하세요.

### Documents

Documents(N.docs)는 Natural-JS 기반의 메뉴 페이지를 MDI(Multi Document Interface) 또는 SDI(Single Document Interface) 구조로 표시하는 페이지 컨테이너입니다. 자세한 내용은 [Documents 가이드](DEVELOPER-GUIDE-UI.Shell-Documents.md)를 참조하세요.

## Natural-TEMPLATE

Natural-TEMPLATE은 Natural-JS 기반 웹 애플리케이션 개발을 정형화하여 코드 가독성과 개발 생산성을 크게 향상시켜 주는 라이브러리입니다. 자세한 내용은 [Natural-TEMPLATE 가이드](DEVELOPER-GUIDE-TEMPLATE.md)와 [예제](DEVELOPER-GUIDE-TEMPLATE-EXAMPLES.md)를 참조하세요.

## API 문서 안내

Natural-JS API 문서는 프레임워크의 구성 요소와 라이브러리가 지원하는 기능과 옵션에 대한 사용 방법과 설명을 제공합니다. 문서는 구성 요소별로 페이지로 나뉘며, 페이지 문단은 다음과 같은 탭으로 구분됩니다:

### 1. 개요
컴포넌트 또는 라이브러리에 대한 개요를 설명합니다.

### 2. API DEMO
실시간으로 컴포넌트나 라이브러리를 테스트하기 위한 데모 프로그램을 제공합니다.

### 3. 생성자
컴포넌트 인스턴스나 라이브러리 인스턴스가 생성될 때 실행되는 함수와 생성자 인수에 대한 설명을 제공합니다.

**예시:**
```javascript
N.grid(argument[0])
N().grid(argument[0])
```

### 4. 기본 옵션
컴포넌트 또는 라이브러리의 기본 옵션에 대한 설명을 제공합니다.

**예시:**
```javascript
N([]).grid({ resizeable: true })
```

### 5. 선언형 옵션
컴포넌트나 라이브러리가 사용하는 템플릿 HTML 요소의 data-* 속성에 JSON 형식으로 정의된 옵션에 대해 설명합니다.

**예시:**
```html
<input id="date" type="text" data-format='[["date", 8]]' />
```

선언형 옵션은 다음과 같은 속성으로 정의할 수 있습니다:
- **포맷 룰(Format Rules)**: `data-format`
- **검증 룰(Validation Rules)**: `data-validate`
- **기타 컴포넌트 옵션**: `data-opts`

선언형 옵션은 JSON 표준 형식을 정확하게 준수해야 합니다(키 값은 반드시 큰 따옴표로 감싸야 함). JSON 표준 포맷을 지키지 않으면 선언형 옵션이 인식되지 않거나 오류가 발생합니다.

`data-format`이나 `data-validate` 등 선언형 옵션으로 실행되는 룰은 배열 형태의 문자열로 정의하고 룰명 다음에 인수들을 순서대로 나열합니다.

**예시:**
```
data-format='[["date", 8], ["lpad", 10, "@"]]'
```

### 6. 함수
컴포넌트나 라이브러리 인스턴스에서 제공하는 메서드와 arguments에 대한 설명을 제공합니다.

**예시:**
```javascript
N([]).grid({ resizeable: true }).revert(3)
```

### 7. 예제
컴포넌트나 라이브러리의 사용 예제를 제공합니다.

### API 문서 용어 정리

- **jQuery object**: `jQuery()` 또는 `$()`, `N()` 함수를 실행했을 때 반환되는 jQuery 확장 객체 또는 jQuery selector
- **selector**: jQuery에서 CSS selector 형식으로 지정하는 문자열 또는 object, array, HTML element, function 등

## 지원 정보

### 지원 브라우저

ECMAScript5(ES5) 이상을 지원하는 모든 PC/모바일 웹 브라우저

### 교육 및 지원

bbalganjjm@gmail.com으로 문의

### 라이센스

이 소프트웨어는 LGPL v2.1 라이센스로 제공됩니다.
© Goldman Kim (bbalganjjm@gmail.com)

## 제한 및 팁

### 제한 사항

#### jQuery 기능 사용제한

1. **jQuery.ajax 함수 사용 제한**
   - jQuery.ajax 함수를 사용하면 Communication Filter 기능을 사용할 수 없습니다.
   - 반드시 서버와의 통신은 Communicator(N.comm)를 사용해야 합니다.

2. **데이터 바인딩 요소의 값 변경 제한**
   - UI 컴포넌트를 사용해서 데이터를 바인딩한 입력 요소에 jQuery.val 함수를 사용하여 값을 변경하면 화면의 값만 변경되고 내부 데이터는 변경되지 않습니다.
   - 반드시 컴포넌트 인스턴스의 val 메서드를 사용해야 합니다.

#### 요소 선택 시 주의 사항

페이지의 요소를 선택할 때는 반드시 view에서 find하거나 view를 jQuery 함수의 context 인수(두 번째 인수)로 지정해야 합니다. 그렇지 않으면 다른 블록 페이지의 의도하지 않은 요소까지 선택되어 예측이 어려운 오류가 발생할 수 있습니다.

```javascript
N(".pageId").cont({
    init: function(view, request) {
        $("selector", view);  // 올바른 선택 방법
        view.find("selector"); // 올바른 선택 방법
    }
});
```