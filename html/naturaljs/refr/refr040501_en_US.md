Overview
===

Tab(N.tab) 은  UL, LI 태그로 이루어진 탭 템플릿 요소를 기반으로 tab 페이지 뷰를 만들어 주는 UI 컴포넌트입니다.
<p class="alert">N.tab 의 url 옵션으로 다른 페이지를 탭 컨텐츠로 생성 할 때 생성된 탭 컨텐츠의 Controller 에는 caller(자신을 호출한 N.tab instance) 와 opener(자신을 호출한 부모페이지의 Controller, 옵션으로 직접 지정 해야 함) 속성이 추가 되어 탭 컨텐츠들의 컨트롤러에서 자신을 호출한 탭 객체와 부모 컨트롤러를 제어 할 수 있습니다.</p>
<p class="alert">N.tab 을 생성한 부모페이지에서 자식 탭 컨텐츠의 Controller(N.cont) 오브젝트를 가져오려면 cont 메서드를 사용하면 됩니다.</p>