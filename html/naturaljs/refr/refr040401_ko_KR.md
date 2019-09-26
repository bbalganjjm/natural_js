개요
===

Popup(N.popup) 은 지정한 요소나 다른페이지를 레이어팝업 타입으로 만들어 주는 UI 컴포넌트입니다.
<p class="alert">N.popup 의 url 옵션으로 다른 페이지를 팝업으로 생성 할 때 생성된 팝업의 Controller 에는 caller(자신을 호출한 N.popup instance) 와 opener(자신을 호출한 부모페이지 Controller, 옵션으로 직접 지정 해야 함) 속성이 추가 되어 팝업의 컨트롤러에서 자신을 호출한 팝업 객체와 부모 컨트롤러를 제어할 수 있습니다.</p>
<p class="alert">Popup 대화 상자가 표시 되지 않으면 natural.config.js 파일의 N.context.attr("ui").alert.container 속성에 Alert 관련 HTML 요소들이 저장될 영역을 jQuery selector로 지정 해 주세요.</p>