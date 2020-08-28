Natural-JS
===
Natural-JS는 ERP, CRM 등의 기업용 웹 어플리케이션 UI를 쉽고 빠르게 구현할 수 있는 Javascript 프레임워크입니다.

구조
===

Natural-JS는 Natural-CORE, Natural-ARCHITECTURE, Natural-DATA, Natural-UI 라이브러리 패키지로 구성됩니다. Natural-CORE는 Natural-JS에서 전역으로 사용하는 공통 라이브러리 패키지이고 Natural-ARCHITECTURE는 Natural-JS의 아키텍처를 구성하는 라이브러리 패키지입니다. Natural-DATA는 데이터의 동기화, Formatting, Validation, 가공을 지원하는 라이브러리 패키지이고 Natural-UI는 HTML 기반의 UI 컴포넌트를 지원하는 라이브러리 패키지입니다.

![Natural-JS 구조](images/intr/pic3.png)

<center>[ Natural-JS 구조 ]</center>

## Natural-CORE

### CORE Utitlities - N() & N
N()은 Natural-JS 코어 메서드입니다. 전달된 인수를 기반으로 DOM에서 요소를 찾거나 HTML 문자열을 전달하여 생성된 일치하는 요소의 컬렉션을 반환합니다.

N은 Natural-JS의 코어 함수들이 정의되어 있는 오브젝트 클래스입니다.

[N()과 N](#cmVmcjAxMDElMjROKCklMjAlMjYlMjBOJGh0bWwlMkZuYXR1cmFsanMlMkZyZWZyJTJGcmVmcjAxMDEuaHRtbA==)은 다음과 같은 jQuery 확장 기능과 유틸리티 클래스를 제공합니다.

* jQuery selector 확장 : style이나 data속성으로도 selector를 정의할 수 있는 jQuery selector 확장 기능
* jQuery plugin 확장 메서드 : jQuery Plugin으로 제작된 Natural-JS 유틸리티 메서드
* N : Natural-JS의 코어 함수들이 정의되어 있는 오브젝트 클래스
* N.gc : Natural-JS 내부 Garbage Collection을 위한 유틸리티 집합 클래스
* N.string : 문자열 제어를 위한 함수 집합 클래스
* N.element : HTML 요소 제어를 위한 함수 집합 클래스
* N.date : 날짜  제어를 위한 함수 집합 클래스
* N.browser : 웹 브라우저 정보 관련 함수 집합 클래스
* N.message : 메시지(다국어) 처리를 위한 함수 집합 클래스
* N.array : Array 데이터 조작을 위한 함수 집합 클래스
* N.json : JSON 데이터 조작을 위한 함수 집합 클래스
* N.event : 이벤트 제어를 위한 함수 집합 클래스

### Natural Config - Config(natural.config.js)

[Config(natural.config.js)](#cmVmcjAxMDIlMjRDb25maWckaHRtbCUyRm5hdHVyYWxqcyUyRnJlZnIlMkZyZWZyMDEwMi5odG1s)는 Natural-JS의 운영 환경 설정, AOP 설정, Communication Filter 설정, UI 컴포넌트의 기본 옵션 값 등을 저장하는 공간입니다.

## Natural-ARCHITECTURE

Natural-ARCHITECTURE는 Natural-JS의 아키텍처를 구성하는 라이브러리 패키지입니다.

![Natural-ARCHITECTURE](images/intr/pic4.png)

<center>[ Natural-ARCHITECTURE ]</center>

### Communicator-View-Controller(CVC) Architecture Pattern

CVC 패턴은 Model-View-Controlelr(MVC) 패턴을 기반으로 하는 아키텍처 패턴입니다. 아래 그림과 같이 클라이언트 브라우저 영역을 Communicator-View-Controller 아키텍처로 구성하고 서버 전체를 Model 영역으로 정의하는 클라이언트 중심의 아키텍처 패턴입니다.
CVC 패턴을 적용하면 클라이언트 브라우저 구현 기술이 서버 기술 및 서버 아키텍처 종속성에서 벗어날 수 있고 디자인 영역과 개발 영역을 완벽하게 분리하여 개발의 복잡도를 낮출 수 있습니다.

![CVC Architecture Pattern](images/intr/pic5.png)

<center>[ Communicator-View-Controller(CVC) Architecture Pattern ]</center>

### Natural Architecture Framework

Natural Architecture Framework는 CVC Architecture Pattern을 구현한 아키텍처 프레임워크입니다.

![Natural Architecture Framework](images/intr/pic6.png)

<center>[ Natural Architecture Framework ]</center>

Natural Architecture Framework는 개발 업무 영역을 명확하게 구분 해 주어 각 영역별 전문가들로 분업할 수 있는 기반을 제공합니다.

#### Controller

[Controller(N.cont)](#cmVmcjAyMDElMjRDb250cm9sbGVyJGh0bWwlMkZuYXR1cmFsanMlMkZyZWZyJTJGcmVmcjAyMDEuaHRtbA==)는 CVC Architecture Pattern의 Controller 레이어를 구현한 클래스입니다.
 * Controller object는 블록 페이지를 제어하는 사용자 정의 함수들이 구현되는 객체입니다.
   <p class="alert">N.cont는 Controller object의 init 함수를 실행해 주고 Controller object를 반환합니다.</p>
 * Natural-ARCHITECTURE는 Controller object를 대상으로 AOP(Aspect-Oriented Programming)를 지원합니다.

#### View

View는 별도의 구현체는 없고 블록 페이지의 HTML 요소 영역이  View로 정의됩니다.

#### Communicator

[Communicator(N.comm)](#cmVmcjAyMDMlMjRDb21tdW5pY2F0b3IkaHRtbCUyRm5hdHVyYWxqcyUyRnJlZnIlMkZyZWZyMDIwMy5odG1s)는 CVC Architecture Pattern의 Communicator 레이어를 구현한 클래스입니다.
 * N.comm 은 서버에 컨텐츠나 데이터를 요청하거나 파라미터를 전달하는 등 서버와의 Ajax 통신을 지원하는 라이브러리입니다.
 * N.comm 은 서버와 통신하는 모든 요청 및 응답 또는 오류 생성 단계에서 공통 로직을 실행할 수 있는 [Communication Filter](#cmVmcjAyMDUlMjRDb21tdW5pY2F0aW9uJTIwRmlsdGVyJGh0bWwlMkZuYXR1cmFsanMlMkZyZWZyJTJGcmVmcjAyMDUuaHRtbA==) 기능을 제공합니다.

[Context(N.context)](#cmVmcjAyMDYlMjRDb250ZXh0JGh0bWwlMkZuYXR1cmFsanMlMkZyZWZyJTJGcmVmcjAyMDYuaHRtbA==)는 Natural-JS 기반 어플리케이션의 Life-Cycle(페이지가 적제 되고 다른 URL로 redirect 되기 전까지) 안에서 데이터의 영속성을 보장하는 공간입니다.
 * Natural-JS의 환경설정 값([Config(natural.config.js)](#cmVmcjAxMDIlMjRDb25maWckaHRtbCUyRm5hdHVyYWxqcyUyRnJlZnIlMkZyZWZyMDEwMi5odG1s)), 프레임워크 공통 메시지 등이 N.context 객체에 저장됩니다.


## Natural-DATA

Natural-DATA는 데이터의 동기화, Formatting,  Validation, 가공을 지원하는 라이브러리 패키지입니다.

### DataSync

DataSync는 컴포넌트나 라이브러리에 의해 변경된 데이터를 실시간으로 동기화해 주는 라이브러리입니다.
<p class="alert">DataSync는 컴포넌트 간 양방향 데이터 바인딩을 지원합니다.</p>

### Formatter

[Formatter(N.formatter)](#cmVmcjAzMDElMjRGb3JtYXR0ZXIkaHRtbCUyRm5hdHVyYWxqcyUyRnJlZnIlMkZyZWZyMDMwMS5odG1s)는 입력 한 데이터 셋(array[json object]을 포멧팅 하고 포멧팅 된 데이터 셋을 반환해 주는 라이브러리입니다.

### Validator

[Validator(N.validator)](#cmVmcjAzMDIlMjRWYWxpZGF0b3IkaHRtbCUyRm5hdHVyYWxqcyUyRnJlZnIlMkZyZWZyMDMwMi5odG1s)는 입력 한 데이터 셋(array[json object]에 대한 유효성을 검사하고 검사 결과 데이터 셋을 반환해 주는 라이브러리입니다.

### Natural-DATA Library

[Natural-DATA Library](#cmVmcjAzMDMlMjROYXR1cmFsLURBVEElMjBMaWJyYXJpZXMkaHRtbCUyRm5hdHVyYWxqcyUyRnJlZnIlMkZyZWZyMDMwMy5odG1s)는 array[json object] 유형의 데이터를 정렬, 필터링 및 정제 하기 위한 메서드 및 함수를 제공합니다.


## Natural-UI

Natural-UI는 HTML 기반의 UI 컴포넌트를 지원하는 라이브러리 패키지입니다.

<p class="alert">Grid, List, Form 등의 컴포넌트는 자체 스타일을 갖고 있지 않습니다. 컴포넌트를 초기화하기 전에 컴포넌트의 context 요소(table, ul/li 등)에 스타일을 정의해 놓으면 정의된 스타일대로 컴포넌트가 생성됩니다.</p>

![Natural-UI](images/intr/pic7.png)

<center>[ Natural-UI ]</center>

### Alert

[Alert(N.alert)](#cmVmcjA0MDElMjRBbGVydCRodG1sJTJGbmF0dXJhbGpzJTJGcmVmciUyRnJlZnIwNDAxLmh0bWw=)은 window.alert이나 window.confirm 같은 메시지 대화 상자를 레이어 팝업 형태로 표현해 주는 UI 컴포넌트입니다.

### Button

[Button(N.button)](#cmVmcjA0MDIlMjRCdXR0b24kaHRtbCUyRm5hdHVyYWxqcyUyRnJlZnIlMkZyZWZyMDQwMi5odG1s)은 context 옵션으로 지정된 "a, input[type=button], button" 요소를 사용하여 버튼을 만드는 UI 컴포넌트입니다.

### Datepicker

[Datepicker(N.datepicker)](#cmVmcjA0MDMlMjREYXRlcGlja2VyJGh0bWwlMkZuYXR1cmFsanMlMkZyZWZyJTJGcmVmcjA0MDMuaHRtbA==)는 context 옵션으로 지정한 텍스트 입력 요소에 날짜나 월을 선택해서 입력할 수 있는 달력 팝업을 표시해 주는 UI 컴포넌트입니다.

### Popup

[Popup(N.popup)](#cmVmcjA0MDQlMjRQb3B1cCRodG1sJTJGbmF0dXJhbGpzJTJGcmVmciUyRnJlZnIwNDA0Lmh0bWw=)은 context 옵션으로 지정한 내부 요소나 url 옵션으로 지정한 페이지를 레이어 팝업 형태로 만들어 주는 UI 컴포넌트입니다.

### Tab

[Tab(N.tab)](#cmVmcjA0MDUlMjRUYWIkaHRtbCUyRm5hdHVyYWxqcyUyRnJlZnIlMkZyZWZyMDQwNS5odG1s)은  div>ul>li 태그로 구성 된 요소를 context 옵션으로 지정하여 탭 페이지 뷰를 만들어 주는 UI 컴포넌트입니다.

### Select

[Select(N.select)](#cmVmcjA0MDYlMjRTZWxlY3QkaHRtbCUyRm5hdHVyYWxqcyUyRnJlZnIlMkZyZWZyMDQwNi5odG1s)는 select, input[type=checkbox], input[type=radio] 요소에 데이터를 바인딩 하여 선택요소를 만들어 주고 해당 컨트롤의 기능을 확장 해 주는 UI 컴포넌트입니다.

### Form

[Form(N.form)](#cmVmcjA0MDclMjRGb3JtJGh0bWwlMkZuYXR1cmFsanMlMkZyZWZyJTJGcmVmcjA0MDcuaHRtbA==)은 context 옵션으로 지정한 요소(div, table 등의 block 요소)에 단건 로우 데이터를 바인드하거나 생성하는  UI 컴포넌트입니다.

### List

[List(N.list)](#cmVmcjA0MDglMjRMaXN0JGh0bWwlMkZuYXR1cmFsanMlMkZyZWZyJTJGcmVmcjA0MDguaHRtbA==)는 ul>li 요소를 context 옵션으로 지정하여 단일 컬럼 형태로 데이터 목록을 생성 해 주는 UI 컴포넌트입니다.

### Grid

[Grid(N.grid)](#cmVmcjA0MDklMjRHcmlkJGh0bWwlMkZuYXR1cmFsanMlMkZyZWZyJTJGcmVmcjA0MDkuaHRtbA==)는 table 요소를 context 옵션으로 지정하여 멀티 컬럼 형태로 데이터 목록을 생성 해 주는 UI 컴포넌트입니다.

### Pagination

[Pagination(N.pagination)](#cmVmcjA0MTAlMjRQYWdpbmF0aW9uJGh0bWwlMkZuYXR1cmFsanMlMkZyZWZyJTJGcmVmcjA0MTAuaHRtbA==)은 목록 데이터나 전체 행 수로 페이징 인덱스를 생성 해 주는 UI 컴포넌트입니다.

### Tree

[Tree(N.tree)](#cmVmcjA0MTElMjRUcmVlJGh0bWwlMkZuYXR1cmFsanMlMkZyZWZyJTJGcmVmcjA0MTEuaHRtbA==)는 계층적 데이터를 트리 요소로 만들어 주는 UI 컴포넌트입니다.

## Natural-UI.Shell

Natural-UI 가 컨텐츠 영역의 UI 개발을 지원 한다면 Natural-UI.Shell 은 컨텐츠영역 바깥의 쉘(Shell) 영역의 개발을 지원 하는 컴포넌트 패키지입니다.

### Notify(N.notify)

[Notify(N.notify)](#cmVmcjA1MDElMjROb3RpZnkkaHRtbCUyRm5hdHVyYWxqcyUyRnJlZnIlMkZyZWZyMDUwMS5odG1s)는 사용자의 확인 과정이 필요없는 전역 알림 메시지를 지정한 위치에 표시해주는 UI 컴포넌트입니다.

### Documents(N.docs)

[Documents(N.docs)](#cmVmcjA1MDIlMjREb2N1bWVudHMkaHRtbCUyRm5hdHVyYWxqcyUyRnJlZnIlMkZyZWZyMDUwMi5odG1s)는 Natural-JS 기반의 메뉴 페이지를 MDI (Multi Document Interface) 또는 SDI (Single Document Interface) 구조로 표시하는 페이지 컨테이너입니다.

지원
===

### 개발 언어

* Javascript(ECMAScript 3 이상) / jQuery 1.12.4
* HTML / DHTML / HTML5
* CSS2 / CSS3

### 지원 브라우저

* PC : Internet Explorer 8 이상(Internet Explorer 9 이상에 최적화 되어 있음), Chrome, Firefox, Safari, Opera 최신 버전
* 모바일 : iOS Safari, iOS UIWebView, Android Browser, Android Chrome, Android WebView

### 교육 및 지원

* <bbalganjjm@gmail.com> 으로 문의 바랍니다.

### 라이센스
This software is licensed under the [LGPL v2.1](https://github.com/bbalganjjm/natural_js/blob/master/LICENSE) &copy; KIM HWANG MAN&lt;<bbalganjjm@gmail.com>&gt;