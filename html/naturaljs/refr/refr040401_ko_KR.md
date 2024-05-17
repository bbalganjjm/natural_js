개요
===

Popup(N.popup)은 context 옵션으로 지정한 내부 요소나 url 옵션으로 지정한 페이지를 레이어 팝업 형태로 만들어 주는 UI 컴포넌트입니다.

 * url 옵션으로 지정한 페이지를 팝업으로 생성하면 생성된 팝업의 Controller object에 caller(자신을 호출한 N.popup instance)와 opener(자신을 호출한 부모페이지 Controller object, 팝업 생성 시 옵션으로 전달해 줘야 합니다.) 속성이 추가됩니다. opener를 사용하여 상위 페이지를 제어하거나 caller 사용하여 자신을 닫거나 부모 Controller에 데이터를 전송할 수 있습니다.

<p class="alert">Popup 대화 상자가 표시되지 않고 오류가 발생하면 <a href="#html/naturaljs/refr/refr0102.html">Config(natural.config.js)</a>의 N.context.attr("ui").alert.container 속성에 jQuery selector 문자열로 N.alert 관련 요소들이 저장될 요소를 지정해야 합니다.</p>