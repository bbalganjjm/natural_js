N.grid 로 데이터 CRUD(입력/조회/수정/삭제) 하기
===

조회조건 영역과 조회 결과 Grid 로 이루어진 프로그램을 개발 해 보겠습니다.

코드 데이터들은 [Select](#cmVmcjA0MDYlMjRTZWxlY3QkaHRtbCUyRm5hdHVyYWxqcyUyRnJlZnIlMkZyZWZyMDQwNi5odG1s)(N.select) 컴포넌트를 사용하여 데이터를 바인딩 하고 [Form](#cmVmcjA0MDclMjRGb3JtJGh0bWwlMkZuYXR1cmFsanMlMkZyZWZyJTJGcmVmcjA0MDcuaHRtbA==)(N.form) 컴포넌트로 조회조건 영역을 폼으로 생성하고  [Grid](#cmVmcjA0MDklMjRHcmlkJGh0bWwlMkZuYXR1cmFsanMlMkZyZWZyJTJGcmVmcjA0MDkuaHRtbA==)(N.grid) 컴포넌트로 입력/조회/수정/삭제 할 수 있는 그리드를 생성 할 것 입니다.
버튼 들은 [Button](#cmVmcjA0MDIlMjRCdXR0b24kaHRtbCUyRm5hdHVyYWxqcyUyRnJlZnIlMkZyZWZyMDQwMi5odG1s)(N.button) 컴포넌트를 사용 합니다.

[웹 어플리케이션 기본 프레임 만들기](#Z3RzdDAyMDAlMjQlRUMlOUIlQjklMjAlRUMlOTYlQjQlRUQlOTQlOEMlRUIlQTYlQUMlRUMlQkMlODAlRUMlOUQlQjQlRUMlODUlOTglMjAlRUElQjglQjAlRUIlQjMlQjglMjAlRUQlOTQlODQlRUIlQTAlODglRUMlOUUlODQlMjAlRUIlQTclOEMlRUIlOTMlQTQlRUElQjglQjAkaHRtbCUyRm5hdHVyYWxqcyUyRmd0c3QlMkZndHN0MDIwMC5odG1s) 에서 생성한 기본 프레임에 메뉴를 추가하여 실습을 진행 해 보겠습니다.

먼저 **/html/index/lefter.html** 파일을 열어 다음과 같이 ul 태그의 마지막 자식요소 li 요소를 추가 하고 지금부터 작업 할 메뉴링크(page6.html)를 추가 해 줍니다.

```
...
<ul class="menu">
    <li><a href="html/contents/page1.html" data-docid="page1">MENU-1</a></li>
    <li><a href="html/contents/page2.html" data-docid="page2">MENU-2</a></li>
    <li><a href="html/contents/page3.html" data-docid="page3">MENU-3</a></li>
    <li><a href="html/contents/page4.html" data-docid="page4">MENU-4</a></li>
    <li><a href="html/contents/page5.html" data-docid="page5">MENU-5</a></li>
    
    <li><a href="html/contents/page6.html" data-docid="page6">Grid CRUD</a></li>
    
</ul>
...
```

##View 영역 코딩

메뉴 추가가 완료 되었으면
**/html/contents/page6.html** 파일을 생성하고 다음과 같이 코드를 작성 합니다.

```
<!-- Style -->
<style type="text/css">
    .page6 {
        padding: 15px;
    }
    
    .page6 .search-conditions {
        border: 1px solid #000;
        padding: 10px;
    }
    .page6 .search-conditions > label {
        margin-right: 40px;
    }
    .page6 .search-conditions input,
    .page6 .search-conditions select {
        margin-left: 10px;
    }
    
    .page6 .buttons {
        padding: 10px;
        text-align: right;
    }
    
    /* Grid Style */
    .page6 .result input {
        width: 90%;
        border-width: 1px;
    }
    .page6 table {
        border-spacing: 0;
        border-collapse: collapse;
        table-layout: fixed;
        width: 100%;
    }
    .page6 table th, 
    .page6 table td {
        border: 1px solid #000;
        box-sizing: border-box;
    }
</style>

<!-- View -->
<article class="page6" >

	<div class="search-conditions">
		<label>Name<input id="name" type="text" data-validate='[["alphabet+integer"]]'></label>
		<label>Gender<input id="gender" type="radio"></label>
	</div>

    <div class="buttons">
        <a id="btnAdd" href="#" data-opts='{ "color": "green" }'>추가</a>
        <a id="btnDelete" href="#" data-opts='{ "color": "green" }'>삭제</a>
        <a id="btnSave" href="#" data-opts='{ "color" : "gray" }'>저장</a>
        <a id="btnSearch" href="#">조회</a>
    </div>
    
    <div class="result">
    	<table class="grid">
    		<colgroup>
    			<col style="width: 50px;">
    			<col style="width: 120px;">
    			<col style="width: auto;">
    			<col style="width: 90px;">
    			<col style="width: 50px;">
    			<col style="width: 110px;">
    			<col style="width: 60px;">
    		</colgroup>
    		<thead>
    			<tr>
    				<th><input lang="ko_KR" id="checkAll" type="checkbox" title="전체 체크"></th>
    				<th>Name</th>
    				<th data-filter="true">Email</th>
    				<th data-filter="true">Eye Color</th>
    				<th data-filter="true">Age</th>
    				<th data-filter="true">Registered</th>
    				<th data-filter="true">Active</th>
    			</tr>
    		</thead>
    		<tbody>
    			<tr>
    				<td style="text-align: center;"><input class="checkAllTarget" type="checkbox"></td>
    				<td><input id="name" type="text" data-validate='[["required"]]'></td>
    				<td><input id="email" type="text" data-validate='[["required"], ["email"]]'></td>
    				<td style="text-align: center;">
    					<select id="eyeColor" data-validate='[["required"]]'>
    						<option value="">선택</option>
    					</select>
    				</td>
    				<td><input id="age" type="text" data-validate='[["required"], ["integer"]]'></td>
    				<td><input id="registered" type="text" data-format='[["date", 8, "date"]]' data-validate='[["required"]]'></td>
    				<td style="text-align: center;"><input id="isActive" type="checkbox"></td>
    			</tr>
    		</tbody>
    	</table>
    </div>

</article>

<!-- Controller -->
<script type="text/javascript">
(function() {

    var cont = N(".page6").cont({
        init : function(view, request) {
            cont.initComponents();
            cont.bindEvents(this);
        },
        initComponents : function() {},
        bindEvents : function() {}
    });

})();
</script>
```

코드가 길어서 그렇지 Style, View 영역과 Controller 영역을 구분 해 보면 간단 해 집니다. 30초만 집중 해서 봐 봅시다. 매트릭스 네오처럼 코드들이 한눈에 들어오지 않나요? -.-; 

실제 Style 을 공통 css 파일로 통합 하면 위 Style 영역은 없어도 되는데 Natural-JS 의 Data 관련 컴포넌트들은 정의 된 요소의 스타일을 그대로 따르니 단독으로 실행 시켜보기 위해 Style 을 정의 할 수 밖에 없었습니다.
<p class="alert">Natural-JS 기반의 프로젝트를 진행 할 때는 HTML 과 CSS 로 화면을 퍼블리싱 해 주는 퍼블리셔와 함께하면 UI 품질과 생산성을 동시에 얻을 수 있습니다. 퍼블리셔는 Natural-JS 를 위한 별도의 학습이 필요도 없고 웹 표준대로만 퍼블리싱 해 주면 됩니다.</p>

위 코드에서 집중해야 할 부분은 View 영역 입니다. Controller 부분은 일부러 틀만 만들고 비워 놓았습니다. 하나씩 채워 가려구요.

맨위에 **.search-conditions** 요소는 검색조건을 입력 할 검색 박스 입니다. 그 아래 **.buttons** 요소에는 버튼들이 배치 되고 **.result** 요소에는 조회된 결과 데이터를 Grid 로 표현하기 위해 N.grid 의 context 요소인 Table 태그를 정의 했습니다. N.grid 컴포넌트를 적용하려면 반드시 그리드로 만들어질 **table** 태그가 있어야 하고 table 태그에 반드시 **thead**(그리드 헤더) 와 **tbody**(그리드 바디) 요소가 있어야 합니다. N.grid 의 행 들은 **tbody** 요소를 그대로 복제하여 데이터의 행 수 만큼 표시 해 줍니다. 각 컴포넌트에 대한 상세한 내용은 관련 문서를 참고 하기 바랍니다.

##Controller 영역 코딩

Controller 영역을 보면 기존 방식과 다르게

```
(function() {

    var cont = N(".page6").cont({
        ...
    });

})();
```

와 같이 Controller 영역을 정의 했습니다. 이유는 어떠한 Function Scope 에서나 Contoller(N.cont) Object 를 접근하기 위해  cont 라는 변수로 Contoller(N.cont) Object 인스턴스를 담아 놓았습니다. Natural-JS 에서는 init 함수만 다루지만 init 함수에 모든 코드를 넣는다면 가독성이 떨어져 개발이 어려워 져 용도별로 함수 셋들을 나누고 싶어 할 것 입니다. 함수 셋들이 여러개로 나뉘어 지고 함수 셋의 하위 함수나 이벤트 핸들러, 콜백 함수안에서는 this 가 달라지기 때문에 Contoller Object 에 접근하기 위한 추가 코드들이 필요 합니다. 

위와 같이 Controller 를 정의하하고 cont 변수에 N().cont() 함수 를 실행 하면 함수의 어떤 위치에서나 cont 변수로 Controller Object 에 접근 할 수 있습니다.
<p class="alert">실제 Natural-JS 로 프로젝트를 진행하다 보면 view 나 request, caller 등의 Controller 오브젝트에 담겨있는 고유 객체들을 참고하거나 페이지 전역변수를 담기 위해 Controller Object 에 접근해야 할 때가 많습니다.</p>
<p class="alert">SPA 로 메뉴 컨텐츠 들을 개발 할 때는 최상위 객체인 window 객체는 없다라고 생각 해 주세요. Controller Object 가 해당 페이지의 최상위 객체라 생각하고 페이지 별 전역변수를 정의 해야 합니다. 만일 window 객체에 전역변수를 무분별하게 정의 하면 프로그램을 쓰면 쓸수록 느려 질 것 입니다. Natural-JS 는 Controller Object 에 대해서는 리소스 관리를 해 주지만 window 객체에 바인딩 되어 있는 전역 변수들에 대해서는 리소스 관리를 하지 않습니다.</p>

이제 각 요소들에 다음과 같은 컴포넌트들를 적용하여 생명을 불어 넣어 줘 보겠습니다.

 * .search-conditions : **N.form**
 * .search-conditions #gender : **N.select**
 
 * .buttons #btnAdd : **N.button**
 * .buttons #btnDelete : **N.button**
 * .buttons #btnSave : **N.button**
 * .buttons #btnSearch : **N.button**
 
 * .result .grid : **N.grid**
 * .result .grid #eyeColor : **N.select**
 
 
<p class="alert">문서 작업이 진행 중 입니다.</p>
 
 

