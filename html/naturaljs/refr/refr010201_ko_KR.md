개요
===

<a href="#cmVmcjAxMDIlMjRDb25maWckaHRtbCUyRm5hdHVyYWxqcyUyRnJlZnIlMkZyZWZyMDEwMi5odG1s">Config(natural.config.js)</a>는 Natural-JS의 운영 환경 설정, AOP 설정, Communication Filter 설정, UI 컴포넌트의 전역 옵션 값 등을 저장하는 공간 입니다.

natural.config.js 파일에 정의 되어 있으며 설정 값은 N.context 에 각 패키지 별 속성 값으로 별도로 저장 됩니다.
 * N.context.attr("core") : Natural-CORE 패키지 라이브러리들의 기본 설정 값.
 * N.context.attr("architecture") : Natural-ARCHITECTURE 패키지 라이브러리들의 기본 설정 값.
 * N.context.attr("data") : Natural-DATA 패키지 라이브러리들의 기본 설정 값.
 * N.context.attr("ui") : Natural-UI 패키지 라이브러리들의 기본 설정 값.
 * N.context.attr("ui.shell") : Natural-UI.Shell 패키지 라이브러리들의 기본 설정 값.

Natural-JS 적용 시 설정 해야 할 필수 속성값은 다음 두가지 입니다.
 1. N.context.attr("architecture").page.context : 웹 어플리케이션의 컨텐츠가 표시 되는 컨테이너 영역(요소)을 jQuery selector 문자열로 지정 합니다.
    <div class="alert" style="display: block;"><a href="#cmVmcjA1MDIlMjREb2N1bWVudHMkaHRtbCUyRm5hdHVyYWxqcyUyRnJlZnIlMkZyZWZyMDUwMi5odG1s">Documents</a>(N.docs) 컴포넌트를 사용하면 자동으로 입력 됩니다.</div>
    <div class="alert" style="display: block;">SPA(Single Page Application) 구조로 제작되는 웹 어플리케이션 이라면 메뉴 페이지를 적제하는 요소를 지정 하고 아니라면 "body" 나 전체 컨텐츠를 감싸고 있는 요소를 입력 해 주세요.</div>
 2. N.context.attr("ui").alert.container : N.alert, N.popup 컴포넌트의 요소들이 저장 될 영역(요소)을 jQuery selector 문자열로 지정 합니다.
    <div class="alert" style="display: block;"><a href="#cmVmcjA1MDIlMjREb2N1bWVudHMkaHRtbCUyRm5hdHVyYWxqcyUyRnJlZnIlMkZyZWZyMDUwMi5odG1s">Documents</a>(N.docs) 컴포넌트를 사용하면 자동으로 입력 됩니다.</div>
    <div class="alert" style="display: block;">SPA(Single Page Application) 구조로 제작되는 웹 어플리케이션 이라면 메뉴 페이지를 적제하는 요소를 지정 하고 아니라면 "body" 나 전체 컨텐츠를 감싸고 있는 요소를 입력 해 주세요.</div>

컴포넌트 옵션이 적용 되는 순서는 다음과 같습니다.

1. 컴포넌트를 초기화 할 때 지정한 옵션 값.
2. Config(natural.config.js)에서 지정한 옵션 값.
3. 컴포넌트의 기본 옵션 값.
    <div class="alert" style="display: block;">전역 이벤트 옵션을 설정하면 전역 이벤트가 먼저 실행 된 다음 컴포넌트 초기화 시 지정한 이벤트가 실행 됩니다.</div>