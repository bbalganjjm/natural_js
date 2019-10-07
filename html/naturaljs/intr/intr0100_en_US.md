Natural-JS
===
Natural-JS is a Javascript framework library that can be easily and quickly development the enterprise web application UI such as ERP, CRM, etc.

Structure
===

Natural-JS 는 Natural-CORE, Natural-ARCHITECTURE, Natural-DATA, Natural-UI 라이브러리 패키지로 구성 됩니다. Natural-CORE 는 Natural-JS 에서 전역으로 사용하는 공통 라이브러리 패키지 이고 Natural-JS 의 아키텍처를 구성 하는 라이브러리 패키지 입니다. Natural-DATA 는 데이터의 동기화, Format 및  Validation, 가공을 지원하는 라이브러리 패키지 이고 Natural-UI 는 HTML 기반의 UI 컴포넌트를 지원하는 라이브러리 패키지 입니다. 

![](images/intr/pic3.png)

<center>[그림2] Natural-JS Structure</center>

##Natural-CORE

Natural-CORE 는 Natural-JS 에서 전역으로 사용하는 공통 라이브러리 패키지입니다. 

Natural-CORE 는 다음과 같은 jQuery 확장 기능과 유틸리티 클래스를 제공 합니다.

* jQuery selector 확장 : style 이나 data 속성으로도 selector 를 정의 할 수 있는 jQuery selector 확장 기능 
* jQuery plugin 확장 메서드 : jQuery Plugin 으로 제작된 Natural-JS 유틸리티 메서드
* N : Natural-JS 의 코어 함수들이 정의 되어 있는 오브젝트 클래스
* N.gc : Natural-JS 내부 Garbage Collection 관련 유틸리티 집합 클래스
* N.string : 문자열 조작 관련 함수 집합 클래스
* N.element : HTML 요소 제어에 관련된 함수 집합 클래스
* N.date : 날짜 관련 함수 집합 클래스
* N.browser : 웹 브라우저와 관련 된 함수 집합 클래스
* N.message : 메시지 처리 관련 함수 집합 클래스, 메시지 리소스의 데이터 처리 및 다국어 처리등의 역할을 수행
* N.array : Array 데이터 조작 관련 함수 집합 클래스
* N.json : JSON 데이터 조작 관련 함수 집합 클래스
* N.event : 이벤트 관련 함수 집합 클래스

##Natural-ARCHITECTURE

Natural-ARCHITECTURE 는 Natural-JS 의 아키텍처를 구성 하는 라이브러리 패키지 입니다.

![](images/intr/pic4.png)

<center>[그림3] Natural-ARCHITECTURE</center>

###CVC Architecture Pattern

CVC(Communicator-View-Controller) 패턴은 MVC(Model-View-Controlelr) 패턴을 변형한 아키텍처 패턴 으로서 [그림5] 와 같이 클라이언트 브라우저 영역을 Communicator-View-Controller 아키텍처로 구성 하고 서버를 전체를 Model 영역으로 정의하는 클라이언트 중심의 아키텍처 패턴 입니다. CVC(Communicator-View-Controller) 패턴을 적용하면 클라이언트 브라우저의 구현 기술들이 서버 기술과 아키텍처의 종속성으로부터 벗어날 수 있고 디자인영역과 개발영역을 완벽하게 분리하여 개발의 복잡도를 낮출 수 있습니다.

![](images/intr/pic5.png)

<center>[그림4] CVC Architecture Pattern</center>

###Natural Architecture Framework

Natural Architecture Framework 는 CVC Architecture Pattern 을 구현한 아키텍쳐 프레임워크 입니다.
<p class="alert">Natural Architecture Framework 는 개발 업무 영역을 명확하게 구분 해 주어 각 영역별 전문가들로 분업 할 수 있는 기반을 제공 합니다.</p>

![](images/intr/pic6.png)

<center>[그림5] Natural Architecture Framework</center>

#### Controller

[Controller(N.cont)](#cmVmcjAyMDElMjRDb250cm9sbGVyJGh0bWwlMkZuYXR1cmFsanMlMkZyZWZyJTJGcmVmcjAyMDEuaHRtbA==) 는 CVC Architecture Pattern 의 Controller 레이어를 구현한 클래스 입니다.
 * N.cont 는 Controller object 의 init 함수를 실행 해 주고 Controller object 를 반환 합니다.
   <p class="alert">Controller object 는 View 의 요소들과 Communicator 에서 검색 한 데이터를 제어하는 객체 입니다.</p> 
 * Natural-ARCHITECTURE 는 Controller object 를 대상으로 AOP(Aspect-Oriented Programming) 를 지원 합니다.
 
View 는 별도의 구현체는 없고 단순하게 HTML 요소 영역이  View 로 정의 되어 있습니다.

#### Communicator
 
[Communicator(N.comm)](#cmVmcjAyMDMlMjRDb21tdW5pY2F0b3IkaHRtbCUyRm5hdHVyYWxqcyUyRnJlZnIlMkZyZWZyMDIwMy5odG1s) 는 CVC Architecture Pattern 의 Communicator 레이어를 구현한 클래스 입니다.
 * N.comm 은 서버에 컨텐츠나 데이터를 요청하거나 파라미터를 전달 하는 등 서버와의 Ajax 통신을 지원하는 라이브러리 입니다.
 * N.comm 을 통해 서버와 통신하는 모든 요청과 응답 또는 에러 발생 단계에서 공통 로직을 실행 할 수 있는 Communication Filter 기능을 제공 합니다.

#### Context 

[Context(N.context)](#cmVmcjAyMDYlMjRDb250ZXh0JGh0bWwlMkZuYXR1cmFsanMlMkZyZWZyJTJGcmVmcjAyMDYuaHRtbA==) 는 Natural-JS 기반 어플리케이션의 Life-Cycle(페이지가 적제 되고 다른 URL로 redirect 되기 전까지) 안 에서 데이터의 영속성을 보장 하는 공간 입니다.
 * N.context 에는 Natural-JS 의 환경설정 값([Config(N.config)](#cmVmcjAxMDIlMjRDb25maWckaHRtbCUyRm5hdHVyYWxqcyUyRnJlZnIlMkZyZWZyMDEwMi5odG1s)), 프레임워크 공통 메시지 등이 N.context 객체에 저장 됩니다.

 
##Natural-DATA

Natural-DATA 는 데이터의 동기화, Format 및  Validation, 가공을 지원하는 라이브러리 패키지 입니다. 

###DataSync

DataSync 는 컴포넌트나 라이브러리에 의해 변경 된 데이터를 실시간으로 동기화 해 주는 라이브러리 입니다.
<p class="alert">DataSync 는 컴포넌트간 양방향 데이터 바인딩을 지원 합니다.</p>

###Formatter

Formatter(N.formatter) 는 입력 한 데이터 셋(array[json object]을 포멧팅 하고 포멧팅 된 데이터 셋을 반환 해 주는 라이브러리 입니다.

###Validator

Validator(N.validator) 는 입력 한 데이터 셋(array[json object]에 대한 유효성을 검사하고 검사 결과 데이터 셋을 반환 해 주는 라이브러리 입니다.

###Natural-DATA Libraries

Natural-DATA 라이브러리는 array[json object] 유형의 데이터를 정렬, 필터링 및 정제 하기위한 메소드 및 함수를 제공합니다.


##Natural-UI

Natural-UI 는 HTML 기반의 UI 컴포넌트를 지원하는 라이브러리 패키지 입니다. 

![](images/intr/pic7.png)

<center>[그림6] Natural-UI</center>

###Alert

Alert(N.alert) 은 window.alert 이나 window.confirm 같은 메시지 대화상자를 레이어 팝업 형태로 표현 해 주는 UI 컴포넌트 입니다.

###Button

Button(N.button) 은 context 옵션으로 지정된 "a, input[type=button], button" 요소를 사용하여 버튼을 만드는 UI 컴포넌트 입니다.

###Datepicker

Datepicker(N.datepicker)는 context 옵션으로 지정 한 텍스트 입력요소에 날짜나 월을 선택 해서 입력 할 수 있는 달력 팝업을 표시 해 주는 UI 컴포넌트 입니다.

###Popup

Popup(N.popup) 은 context 옵션으로 지정 한 내부 요소나 url 옵션으로 지정한 페이지를 레이어 팝업 형태로 만들어 주는 UI 컴포넌트입니다.

###Tab

Tab(N.tab) 은  div>ul>li 태그로 구성 된 요소를 context 옵션으로 지정하여 탭 페이지 뷰를 만들어 주는 UI 컴포넌트입니다.

###Select

Select(N.select) 는 select, input[type=checkbox], input[type=radio] 요소에 데이터를 바인딩 하여 선택요소를 만들어 주고 해당 컨트롤의 기능을 확장 해 주는 UI 컴포넌트입니다.

###Form

Form(N.form) 은 context 옵션으로 지정한 요소(div, table 등의 block 요소)에 단건 로우 데이터를 바인드하거나 생성하는  UI 컴포넌트입니다.

###List

List(N.list)는 ul>li 요소를 context 옵션으로 지정하여 단일 컬럼 형태로 데이터 목록을 생성 해 주는 UI 컴포넌트입니다.

###Grid

Grid(N.grid)는 table 요소를 context 옵션으로 지정하여 멀티 컬럼 형태로 데이터 목록을 생성 해 주는 UI 컴포넌트입니다.

###Pagination

Pagination(N.pagination) 은 목록 데이터나 전체 행 수로 페이징 인덱스를 생성 해 주는 UI 컴포넌트입니다.

###Tree

Tree(N.tree) 는 계층적 데이터를 트리 요소로 만들어 주는 UI 컴포넌트입니다.

##Natural-UI.Shell

Natural-UI 가 컨텐츠 영역의 UI 개발을 지원 한다면 Natural-UI.Shell 은 컨텐츠영역 바깥의 쉘(Shell) 영역의 개발을 지원 하는 컴포넌트 패키지 입니다.

###Notify(N.notify)

Notify(N.notify) 는 사용자의 확인 과정이 필요없는 전역 알림 메시지를 지정 한 위치에 표시 해주는 UI 컴포넌트 입니다.

###Documents(N.docs)

Documents (N.docs)는 Natural-JS 기반의 메뉴 페이지를 MDI (Multi Document Interface) 또는 SDI (Single Document Interface) 구조로 표시하는 페이지 컨테이너입니다.

지원
===

###개발 언어

* ECMA Script 4 이상 / jQuery 1.12.4
* HTML / DHTML / HTML5
* CSS2 / CSS3

###지원 브라우저

* PC : Internet Explorer 8 이상(Internet Explorer 9 이상에 최적화 되어 있음), Chrome, Firefox, Safari(OSX), Opera 최신 버전
* 모바일 : iOS Safari, iOS UIWebView, Android Browser, Android Chrome, Android WebView

###교육 및 지원

* bbalganjjm@gmail.com 으로 문의

###라이센스
This software is licensed under the [LGPL v2.1](https://github.com/bbalganjjm/natural_js/blob/master/LICENSE) &copy; KIM HWANG MAN&lt;<bbalganjjm@gmail.com>&gt;