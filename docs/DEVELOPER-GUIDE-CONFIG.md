# Natural-JS Config 레퍼런스 가이드

## 개요

Config(natural.config.js)는 Natural-JS의 운영 환경 설정, AOP 설정, Communication Filter 설정, UI 컴포넌트의 전역 옵션 값 등을 저장하는 공간입니다.

natural.config.js 파일에 정의되어 있으며 설정 값은 N.context에 각 패키지 별 속성 값으로 별도로 저장됩니다.

- N.context.attr("core"): Natural-CORE 패키지 라이브러리들의 기본 설정 값
- N.context.attr("architecture"): Natural-ARCHITECTURE 패키지 라이브러리들의 기본 설정 값
- N.context.attr("data"): Natural-DATA 패키지 라이브러리들의 기본 설정 값
- N.context.attr("ui"): Natural-UI 패키지 라이브러리들의 기본 설정 값
- N.context.attr("ui.shell"): Natural-UI.Shell 패키지 라이브러리들의 기본 설정 값

### Natural-JS 적용 시 설정해야 할 필수 속성 값

1. **N.context.attr("architecture").page.context**: 웹 애플리케이션의 콘텐츠가 표시되는 컨테이너 영역(요소)을 jQuery selector 문자열로 지정합니다.
   - Documents(N.docs) 컴포넌트를 사용하면 자동으로 입력됩니다.
   - SPA(Single Page Application) 구조로 제작되는 웹 애플리케이션이라면 메뉴 페이지를 적제하는 요소를 지정하고 아니라면 "body" 나 전체 콘텐츠를 감싸고 있는 요소를 입력해 주세요.

2. **N.context.attr("ui").alert.container**: N.alert, N.popup 컴포넌트의 요소들이 저장될 영역(요소)을 jQuery selector 문자열로 지정합니다.
   - Documents(N.docs) 컴포넌트를 사용하면 자동으로 입력됩니다.
   - SPA(Single Page Application) 구조로 제작되는 웹 애플리케이션이라면 메뉴 페이지를 적제하는 요소를 지정하고 아니라면 "body" 나 전체 콘텐츠를 감싸고 있는 요소를 입력해 주세요.

### 컴포넌트 옵션이 적용되는 순서

1. 컴포넌트를 초기화할 때 지정한 옵션 값
2. Config(natural.config.js)에서 지정한 옵션 값
3. 컴포넌트의 기본 옵션 값

전역 이벤트 옵션을 설정하면 전역 이벤트가 먼저 실행된 다음 컴포넌트 초기화 시 지정한 이벤트가 실행됩니다.

## N.context.attr("core") - Natural-CORE 환경설정

| 속성 | 기본값 | 필수 | 설명 |
|------|--------|------|------|
| locale | ko_KR | O | 기본 로케일<br>Natural-JS는 이 설정값으로 다국어 메시지를 처리합니다.<br>ko_KR처럼 Full Locale을 지정해야 하고 N.locale 함수로 설정값을 명령으로 변경할 수 있습니다. |
| sgChkdVal | Y | O | N().vals 메서드에서 체크박스가 한 개 일 경우 체크되었을 때 기본 값<br>"Y", "1", "on" 등 프로젝트 데이터 표준에 맞춰 정의 바랍니다. |
| sgUnChkdVal | N | O | N().vals 메서드에서 체크박스가 한 개 일 경우 체크 해제되었을 때 기본 값<br>"N", "0", "off" 등 프로젝트 데이터 표준에 맞춰 정의 바랍니다. |
| spltSepa | $@^ | O | Natural-JS에서 사용하는 문자열 구분자 |
| gcMode | full | O | N.gc 함수의 가비지 컬렉션 모드<br>자세한 내용은 N() & N 메뉴의 [N.gc 객체의 함수] 탭을 참고하세요. |
| charByteLength | 3 | O | 영문, 숫자 등 1바이트 문자를 제외한 문자들의 기본 바이트 길이를 설정합니다.<br>charByteLength는 N.string.byteLength 함수 및 maxbyte, minbyte, rangebyte 검증 룰 등 문자열의 길이를 체크하는 로직에서 사용합니다. |

## N.context.attr("architecture") - Natural-ARCHITECTURE 환경설정

| 속성 | 기본값 | 필수 | 설명 |
|------|--------|------|------|
| page.context | .docs__ > .docs_contents__.visible__ | O | 메인 콘텐츠가 삽입될 요소를 jQuery Selector 문법으로 지정합니다.<br>Documents(N.docs) 컴포넌트를 사용하면 따로 지정하지 않아도 되지만 그렇지 않은 경우에는 **반드시 지정**해야 합니다.<br>SPA(Single Page Application)가 아니면 "body"로 설정해 주세요. |
| cont | - | X | [Controller](https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0201.html) 관련 설정. |
| aop | - | X | [AOP](https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0202.html) 관련 설정. |
| comm.filters | - | X | [Communication Filter](https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0204.html) 관련 설정. |
| comm.request | - | X | [Communicator.request](https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0203.html&tab=html/naturaljs/refr/refr020302.html)의 전역 옵션. |

## N.context.attr("data") - Natural-DATA 환경설정

| 속성 | 기본값 | 필수 | 설명 |
|------|--------|------|------|
| formatter.userRules | - | X | 사용자 정의 포맷 룰<br><pre>```javascript<br>"userRules" : {<br>    /*<br>     * 함수 명이 룰 명이 됨.<br>     *<br>     * str : 포맷 대상 문자열<br>     * args : 포맷 옵션<br>     *<br>     * return : 포맷된 문자열을 반환<br>    */<br>    "userRule" : function(str, args) {<br>        return str;<br>    }<br>}<br>```</pre> |
| formatter.date | - | X | 응용 프로그램에 전체적으로 사용될 날짜 형식을 지정합니다.<br>날짜/시간 포맷 : Y : 년, m : 월, d : 일, H : 시, i : 분, s : 초 |
| formatter.date.dateSepa | - | O | 년, 월, 일 구분 문자 |
| formatter.date.timeSepa | : | O | 시, 분, 초 구분 문자 |
| formatter.date.Ym | function() {<br>    return "Y" + this.dateSepa + "m";<br>} | O | 년, 월 포맷 함수, return 구문에서 포맷을 지정합니다. |
| formatter.date.Ymd | function() {<br>    return "Y" + this.dateSepa + "m" + this.dateSepa + "d";<br>} | O | 년, 월, 일 Format 함수, return 구문에서 포맷을 지정합니다. |
| formatter.date.YmdH | function() {<br>    return this.Ymd() + " H";<br>} | O | 년, 월, 일, 시 Format 함수, return 구문에서 포맷을 지정합니다. |
| formatter.date.YmdHi | function() {<br>    return this.Ymd() + " H" + this.timeSepa + "i";<br>} | O | 년, 월, 일, 시, 분 Format 함수, return 구문에서 포맷을 지정합니다. |
| formatter.date.YmdHis | function() {<br>    return this.Ymd() + " H" + this.timeSepa + "i" + this.timeSepa + "s";<br>} | O | 시, 분, 초 Format 함수, return 구문에서 포맷을 지정합니다. |
| validator.userRules | - | X | 사용자 정의 유효성 검증 룰<br><pre>```javascript<br>"userRules" : {<br>    /*<br>     * 함수 명이 룰 명이 됨.<br>     * 검증 실패 메시지는 아래 N.context.attr("data").validator.message 객체에 언어별로 함수명과 같은 프로퍼티명으로 정의.<br>     *<br>     * str : 유효성 검증 대상 문자열<br>     * args : 유효성 검증 옵션<br>     *<br>     * return : 유효성 검증에 성공하면 true를, 실패하면 false를 반환합니다.<br>     */<br>    "userRule" : function(str, args) {<br>        return true;<br>    }<br>}<br>```</pre> |
| validator.message | {<br>    "ko_KR" : { ... },<br>    "en_US" : { ... }<br>} | O | 유효성 검증 오류 다국어 메시지<br>언어를 추가하려면 언어 세트를 복사하고 언어 세트 오브젝트 프로퍼티 명을 해당 로케일 문자열로 지정하고 메시지를 정의합니다. |

## N.context.attr("ui") - Natural-UI 환경설정

| 속성 | 기본값 | 필수 | 설명 |
|------|--------|------|------|
| alert.container | .docs__ > .docs_contents__.visible__ | O | N.alert, N.popup 컴포넌트의 요소들이 저장될 요소를 jQuery Selector 문법으로 지정합니다.<br>특별한 경우가 아니면 N.context.attr("architecture").page.context 값과 같은 값을 정의해 주세요.<br>Documents(N.docs) 컴포넌트를 사용하면 따로 지정하지 않아도 되지만 그렇지 않은 경우에는 **반드시 지정**해야 합니다.<br>SPA(Single Page Application)가 아니면 "body"로 설정해 주세요. |
| alert.global.okBtnStyle | {<br>    color : "yellowgreen",<br>    "size" : "medium"<br>} | X | N.alert의 확인 버튼 스타일<br>버튼 컴포넌트의 옵션으로 지정합니다. |
| alert.global.cancelBtnStyle | {<br>    "size" : "medium"<br>} | X | N.alert의 취소 버튼 스타일<br>버튼 컴포넌트의 옵션으로 지정합니다. |
| alert.input.displayTimeout | 7000 | O | context 옵션에 입력 요소를 지정했을 때 표시되는 메시지 다이얼로그의 표시 시간(ms) |
| alert.input.closeBtn | &times; | O | context 옵션에 입력 요소를 지정했을 때 표시되는 메시지 다이얼로그의 닫기 버튼 디자인, html 태그 입력 가능 |
| alert.message | {<br>    "ko_KR" : { ... },<br>    "en_US" : { ... }<br>} | O | N.alert의 다국어 메시지 |
| datepicker.monthonlyOpts.yearsPanelPosition | top | O | monthonly 옵션이 true 일 때 연도 선택 요소의 위치를 지정합니다.<br>"left" 나 "top"으로 설정해 주세요. |
| datepicker.monthonlyOpts.monthsPanelPosition | top | O | monthonly 옵션이 true 일 때 월 선택 요소의 위치를 지정합니다.<br>"left" 나 "top"으로 설정해 주세요. |
| datepicker.message | {<br>    "ko_KR" : { ... },<br>    "en_US" : { ... }<br>} | O | N.datepicker의 다국어 메시지 |
| list.message | {<br>    "ko_KR" : { ... },<br>    "en_US" : { ... }<br>} | O | N.list의 다국어 메시지 |
| grid.message | {<br>    "asc" : "▼",<br>    "desc" : "▲"<br>} | O | Sort 기능이 활성화되었을 때 정렬 방향 표시 구분자, HTML 태그를 입력해도 됩니다 |
| grid.message | {<br>    "ko_KR" : { ... },<br>    "en_US" : { ... }<br>} | O | N.grid의 다국어 메시지 |

## N.context.attr("ui.shell") - Natural-UI.Shell 환경설정

| 속성 | 기본값 | 필수 | 설명 |
|------|--------|------|------|
| notify.message | {<br>    "ko_KR" : { ... },<br>    "en_US" : { ... }<br>} | O | N.notify의 다국어 메시지 |
| docs.message | {<br>    "ko_KR" : { ... },<br>    "en_US" : { ... }<br>} | O | N.docs의 다국어 메시지 |

## N.context.attr("template") - Natural-TEMPLATE 환경설정

| 속성 | 기본값 | 필수 | 설명 |
|------|--------|------|------|
| codes | {<br>    codeUrl : null,<br>    codeKey : null<br>} | O | 공통코드 조회 정보<br>codeUrl : 공통코드 조회 URL<br>codeKey : 그룹코드 프로퍼티 명 |
| message | {<br>    "ko_KR" : { ... },<br>    "en_US" : { ... }<br>} | O | Natural-TEMPLATE의 다국어 메시지 |

## N.context.attr("code") - Natural-CODE 환경설정

| 속성 | 기본값 | 필수 | 설명 |
|------|--------|------|------|
| abortOnError | false | O | ERROR 유형의 코드가 검출되었을 때 ERROR를 발생하여 로직을 중단할지 여부를 지정합니다. |
| excludes | [] | O | 검사 대상에서 제외할 구문들을 문자열로 정의합니다.<br>검출된 코드 내용 중 다음 문자열이 포함되어 있으면 제외 처리됩니다.<br>예: `excludes : [ ".index-header", ".page-header", ".index-lefter", ".index-contents", ".index-footer" ]` |
| message | {<br>    "ko_KR" : { ... },<br>    "en_US" : { ... }<br>} | O | 코드 검사 다국어 메시지 |