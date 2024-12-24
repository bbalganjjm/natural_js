<h1 class="logo title">Natural-JS</h1>
Natural-JS는 기업용 웹 애플리케이션의 사용자 인터페이스를 직관적이고 쉽고 빠르게 구현할 수 있도록 설계된 JavaScript 아키텍처 프레임워크입니다.

구성
===

Natural-JS는 Natural-CORE, Natural-ARCHITECTURE, Natural-DATA, Natural-UI 라이브러리 패키지로 구성됩니다. 
Natural-CORE는 Natural-JS 내에서 전역적으로 사용되는 공통 라이브러리 패키지이고 Natural-ARCHITECTURE는 Natural-JS의 아키텍처를 구성하는 라이브러리 패키지입니다. 
Natural-DATA는 데이터 동기화, 포맷팅, 검증 및 가공을 지원하는 라이브러리 패키지이고 Natural-UI는 HTML 기반의 UI 컴포넌트를 제공하는 라이브러리 패키지입니다.

![Natural-JS 의 구조](images/intr/pic3.png)

<center>[ Natural-JS 의 구조 ]</center>

![Natural-JS Architecture Framework](images/intr/pic0.png)

<center>[ Natural-JS Architecture Framework ]</center>

## Natural-CORE

### CORE Utilities - N() & N
N()은 Natural-JS 코어 메서드입니다. 전달된 인수를 기반으로 DOM에서 요소를 찾거나 HTML 문자열을 전달하여 생성된 일치하는 요소의 컬렉션을 반환합니다.

N은 Natural-JS의 코어 함수들이 정의되어 있는 객체 클래스입니다.

[N()과 N](?page=html/naturaljs/refr/refr0101.html)은 다음과 같은 jQuery 확장 기능과 유틸리티 클래스를 제공합니다.
* 
* jQuery 셀렉터 확장: HTML 의 style 이나 data- 속성으로도 셀렉터를 정의할 수 있는 jQuery 셀렉터 확장 기능
* jQuery 플러그인 확장 메서드: jQuery 플러그인으로 제작된 Natural-JS 유틸리티 메서드
* N: Natural-JS의 코어 함수들이 정의되어 있는 객체 클래스
* N.gc: Natural-JS 내부 가비지 컬렉션을 위한 유틸리티 집합 클래스
* N.string: 문자열 제어를 위한 함수 집합 클래스
* N.element: HTML 요소 제어를 위한 함수 집합 클래스
* N.date: 날짜 제어를 위한 함수 집합 클래스
* N.browser: 웹 브라우저 정보 관련 함수 집합 클래스
* N.message: 메시지(다국어) 처리를 위한 함수 집합 클래스
* N.array: 배열 데이터 조작을 위한 함수 집합 클래스
* N.json: JSON 데이터 조작을 위한 함수 집합 클래스
* N.event: 이벤트 제어를 위한 함수 집합 클래스

### Natural Config - Config(natural.config.js)

[Config(natural.config.js)](?page=html/naturaljs/refr/refr0102.html)는 Natural-JS의 운영 환경 설정, AOP 설정, Communication Filter 설정, UI 컴포넌트의 기본 옵션 값 등을 저장하는 공간입니다.

## Natural-ARCHITECTURE

Natural-ARCHITECTURE는 Natural-JS의 아키텍처를 구성하는 라이브러리 패키지입니다.

![Natural-ARCHITECTURE](images/intr/pic4.png)

<center>[ Natural-ARCHITECTURE ]</center>

### Communicator-View-Controller(CVC) Architecture Pattern

CVC 패턴은 Model-View-Controller(MVC) 패턴을 기반으로 하는 아키텍처 패턴입니다. 아래 그림과 같이 클라이언트 브라우저 영역을 Communicator-View-Controller 아키텍처로 구성하고, 서버 전체를 Model 영역으로 정의하는 클라이언트 중심의 아키텍처 패턴입니다. 
CVC 패턴을 적용하면 클라이언트 브라우저 구현 기술이 서버 기술 및 서버 아키텍처 종속성에서 벗어날 수 있고, 디자인 영역과 개발 영역을 완벽하게 분리하여 개발의 복잡성을 낮출 수 있습니다.

![CVC Architecture Pattern](images/intr/pic5.png)

<center>[ Communicator-View-Controller(CVC) Architecture Pattern ]</center>

### Natural Architecture Framework

Natural Architecture Framework는 CVC Architecture Pattern을 구현한 아키텍처 프레임워크입니다.

![Natural Architecture Framework](images/intr/pic6.png)

<center>[ Natural Architecture Framework ]</center>

- Natural Architecture Framework는 개발 업무 영역을 명확하게 구분해주어 각 영역별 전문가들로 분업할 수 있는 기반을 제공합니다.

#### Controller

[Controller(N.cont)](?page=html/naturaljs/refr/refr0201.html)는 CVC Architecture Pattern의 Controller 레이어를 구현한 클래스입니다.
 * Controller object는 블록 페이지를 제어하는 사용자 정의 함수들이 구현되는 객체입니다.
   <p class="alert">N.cont는 Controller object의 init 함수를 실행해주고 Controller object를 반환합니다.</p>
 * Natural-ARCHITECTURE는 Controller object를 대상으로 AOP(Aspect-Oriented Programming)를 지원합니다.

#### View

View는 별도의 구현체가 없으며, 블록 페이지의 HTML 요소 영역이 View로 정의됩니다.

#### Communicator

[Communicator(N.comm)](?page=html/naturaljs/refr/refr0203.html)는 CVC 아키텍처 패턴의 커뮤니케이터 레이어를 구현한 클래스입니다.
 * N.comm은 서버에 콘텐츠나 데이터를 요청하거나 매개변수를 전달하는 등, 서버와의 Ajax 통신을 지원하는 라이브러리입니다.
 * N.comm은 서버와 통신하는 모든 요청 및 응답 또는 오류 발생 단계에서 공통 로직을 실행할 수 있는 [Communication Filter](?page=html/naturaljs/refr/refr0205.html) 기능을 제공합니다.

[Context(N.context)](?page=html/naturaljs/refr/refr0206.html)는 Natural-JS 기반 애플리케이션의 Life-Cycle(페이지가 적재되고 다른 URL로 redirect되기 전까지) 안에서 데이터의 영속성을 보장하는 공간입니다.
* Natural-JS의 환경 설정 값([Config(natural.config.js)](?page=html/naturaljs/refr/refr0102.html)), 프레임워크 공통 메시지 등이 N.context 객체에 저장됩니다.


## Natural-DATA

Natural-DATA는 데이터의 동기화, 포맷팅, 유효성 검사, 가공을 지원하는 라이브러리 패키지입니다.

### DataSync

DataSync는 컴포넌트나 라이브러리에 의해 변경된 데이터를 실시간으로 동기화해주는 라이브러리입니다.
<p class="alert">DataSync는 컴포넌트 간 양방향 데이터 바인딩을 지원합니다.</p>

### Formatter

[Formatter(N.formatter)](?page=html/naturaljs/refr/refr0301.html)는 입력한 데이터셋(json object array)을 포맷팅하고 포맷팅된 데이터셋을 반환해 주는 라이브러리입니다.

### Validator

[Validator(N.validator)](?page=html/naturaljs/refr/refr0302.html)는 입력한 데이터셋(json object array)에 대한 유효성을 검사하고 검사 결과 데이터셋을 반환해 주는 라이브러리입니다.

### Natural-DATA Library

[Natural-DATA Library](?page=html/naturaljs/refr/refr0303.html)는 json object array 유형의 데이터를 정렬, 필터링 및 정제하기 위한 메서드 및 함수를 제공합니다.


## Natural-UI

Natural-UI는 HTML 기반의 UI 컴포넌트를 지원하는 라이브러리 패키지입니다.

<p class="alert">Grid, List, Form 등의 컴포넌트는 자체 스타일이 없습니다. 컴포넌트를 초기화하기 전에 컴포넌트의 컨텍스트 요소(table, ul/li 등)에 스타일을 정의해 놓으면 정의된 스타일대로 컴포넌트가 생성됩니다.</p>

![Natural-UI](images/intr/pic7.png)

<center>[ Natural-UI ]</center>

### Alert

[Alert(N.alert)](?page=html/naturaljs/refr/refr0401.html)은 window.alert이나 window.confirm 같은 메시지 대화상자를 레이어 팝업 형태로 표현해주는 UI 컴포넌트입니다.

### Button

[Button(N.button)](?page=html/naturaljs/refr/refr0402.html)은 context 옵션으로 지정된 "a, input[type=button], button" 요소를 사용하여 버튼을 만드는 UI 컴포넌트입니다.

### Datepicker

[Datepicker(N.datepicker)](?page=html/naturaljs/refr/refr0403.html)는 context 옵션으로 지정한 텍스트 입력 요소에 날짜나 월을 선택하여 입력할 수 있는 달력 팝업을 표시해 주는 UI 컴포넌트입니다.

### Popup

[Popup(N.popup)](?page=html/naturaljs/refr/refr0404.html)은 context 옵션으로 지정한 내부 요소나 url 옵션으로 지정한 페이지를 레이어 팝업 형태로 만들어 주는 UI 컴포넌트입니다.

### Tab

[Tab(N.tab)](?page=html/naturaljs/refr/refr0405.html)은  div>ul>li 태그로 구성된 요소를 context 옵션으로 지정하여 탭 페이지 뷰를 만들어 주는 UI 컴포넌트입니다.

### Select

[Select(N.select)](?page=html/naturaljs/refr/refr0406.html)는 select, input[type=checkbox], input[type=radio] 요소에 데이터를 바인딩하여 선택 요소를 만들어 주고 해당 컨트롤의 기능을 확장해 주는 UI 컴포넌트입니다.

### Form

[Form(N.form)](?page=html/naturaljs/refr/refr0407.html)은 context 옵션으로 지정한 요소(div, table 등의 block 요소)에 단건 로우 데이터를 바인딩하거나 생성하는  UI 컴포넌트입니다.

### List

[List(N.list)](?page=html/naturaljs/refr/refr0408.html)는 ul>li 요소를 context 옵션으로 지정하여 단일 컬럼 형태로 데이터 목록을 생성해 주는 UI 컴포넌트입니다.

### Grid

[Grid(N.grid)](?page=html/naturaljs/refr/refr0409.html)는 table 요소를 context 옵션으로 지정하여 멀티 컬럼 형태로 데이터 목록을 생성해 주는 UI 컴포넌트입니다.

### Pagination

[Pagination(N.pagination)](?page=html/naturaljs/refr/refr0410.html)은 목록 데이터나 전체 행 수로 페이징 인덱스를 생성해 주는 UI 컴포넌트입니다.

### Tree

[Tree(N.tree)](?page=html/naturaljs/refr/refr0411.html)는 계층적 데이터를 트리 요소로 만들어 주는 UI 컴포넌트입니다.

## Natural-UI.Shell

Natural-UI가 콘텐츠 영역의 UI 개발을 지원한다면 Natural-UI.Shell은 콘텐츠 영역 밖의 셸(Shell) 영역의 개발을 지원하는 컴포넌트 패키지입니다.

### Notify(N.notify)

[Notify(N.notify)](?page=html/naturaljs/refr/refr0501.html)는 사용자의 확인 과정이 필요 없는 전역 알림 메시지를 지정된 위치에 표시해 주는 UI 컴포넌트입니다.

### Documents(N.docs)

[Documents(N.docs)](?page=html/naturaljs/refr/refr0502.html)는 Natural-JS 기반의 메뉴 페이지를 MDI(Multi Document Interface) 또는 SDI(Single Document Interface) 구조로 표시하는 페이지 컨테이너입니다.

지원
===

### 지원 브라우저

* ECMAScript5(ES5) 이상을 지원하는 모든 PC/모바일 웹 브라우저.

### 교육 및 지원

* <bbalganjjm@gmail.com>으로 문의 바랍니다.

### 라이센스
This software is licensed under the [LGPL v2.1](https://github.com/bbalganjjm/natural_js/blob/master/LICENSE) &copy; Goldman Kim&lt;<bbalganjjm@gmail.com>&gt;