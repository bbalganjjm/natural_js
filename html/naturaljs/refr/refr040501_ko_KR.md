개요
===

Tab(N.tab)은  div>ul>li 태그로 구성된 요소를 context 옵션으로 지정하여 탭 페이지 뷰를 만들어 주는 UI 컴포넌트입니다.

 * url 옵션으로 지정한 페이지를 팝업으로 생성 하면 생성된 팝업의 Controller object에 caller(자신을 호출한 N.popup instance)와 opener(자신을 호출한 부모페이지 Controller object, 팝업 생성 시 옵션으로 전달해 줘야 합니다.) 속성이 추가 됩니다. opener를 사용하여 상위 페이지를 제어하거나 caller 사용하여 자신을 닫거나 부모 Controller에 데이터를 보낼 수 있습니다.
 * N.tab의 인스턴스에서 cont 메서드를 호출 하면 각 탭 페이지 들의 Controller object를 가져 올 수 있습니다. cont 메서드에 대한 자세한 내용은 [함수] 탭을 참고해 주세요.