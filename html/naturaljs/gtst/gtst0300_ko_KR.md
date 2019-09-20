Grid 로 CRUD 하기
===

Grid 로 입력/조회/수정/삭제를 처리 하기 위해 조회조건 영역과 조회 결과 Grid 로 이루어진 프로그램을 개발 해 보겠습니다.

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

코드가 길어서 그렇지 Style, View 영역과 Controller 영역을 구분 해 보면 간단 해 집니다. 30초만 집중 해서 봅시다. 매트릭스 네오처럼 코드들이 한눈에 들어오지 않나요? -.-; 

Style 영역을 공통 css 파일로 통합 하면 위 Style 영역은 없어도 되는데 Natural-JS 의 Data 관련 컴포넌트들에 정의 된 context 요소의 스타일이 그대로 적용 되는것을 보기 위해 페이지에 Style 을 정의 했습니다.
<p class="alert">Natural-JS 로 프로젝트를 진행 할 때는 HTML 과 CSS 로 화면을 퍼블리싱 해 주는 퍼블리셔와 함께하면 UI 품질과 생산성을 동시에 얻을 수 있습니다. 퍼블리셔는 Natural-JS 를 위한 별도의 학습과정이 필요 없고 웹 표준에 맞춰 퍼블리싱 해 주면 됩니다.</p>

위 코드에서 집중해야 할 부분은 View 영역 입니다. Controller 부분은 일부러 틀만 만들고 비워 놓았습니다. 하나씩 채워 가려구요.

View 의 하위 요소 중 첫번째에 있는 **.search-conditions** 요소는 검색조건을 입력 할 검색 박스 입니다. 그 아래 **.buttons** 요소에는 버튼들이 배치 되고 **.result** 요소에는 조회 된 결과 데이터를 Grid 로 표현하기 위해 N.grid 의 context 요소인 Table 을 만들었습니다. N.grid 컴포넌트를 적용하려면 반드시 그리드로 만들어질 **table** 태그가 있어야 하고 table 태그에 **thead**(그리드 헤더) 와 **tbody**(그리드 바디) 요소가 있어야 합니다. N.grid 의 행 들은 **tbody** 요소를 그대로 복제하여 데이터의 행 수 만큼 표시 해 줍니다. 각 컴포넌트에 대한 상세한 내용은 관련 문서를 참고 하기 바랍니다.

##Controller 영역 코딩

이번 예제에서 Controller 영역을 보면 기존 방식과 다르게 cont 변수에 Controller Object 인스턴스를 담는 코드와 이를 함수로 감싸서 바로 실행하는 코드가 작성 되어 있습니다.

```
(function() {

    var cont = N(".page6").cont({
        ...
    });

})();
```

이유는 어떠한 Function Scope 에서나 Contoller(N.cont) Object 에 접근하기 위해서 입니다.
만약 init 함수에 이 페이지와 관련 된 모든 코드를 넣는다면 가독성이 떨어져 개발이 어려워질 것 입니다. 자연스럽게 함수 셋들이 여러개로 나누어 지고 함수 셋의 하위 함수나 이벤트 핸들러, 콜백 함수 안 에서는 this 가 바라보는 객체가 달라져 Contoller Object 에 접근하기 위한 추가 코드들이 필요하게 될 것 입니다.

위와 같이 Controller 를 정의하하고 cont 변수에 N().cont() 함수 를 실행 하면 함수의 어떤 위치에서나 cont 변수로 Controller Object 에 접근 할 수 있습니다.
<p class="alert">Natural-JS 로 프로젝트를 진행하다 보면 view 나 request, caller 등의 Controller 오브젝트에 담겨있는 고유 객체들을 참고하거나 페이지 전역변수를 담기 위해 Controller Object 에 접근해야 할 때가 많습니다.</p>
<p class="alert">SPA 로 메뉴 컨텐츠 들을 개발 할 때는 최상위 객체인 window 객체는 없다라고 생각 해 주세요. Controller Object 가 해당 페이지의 최상위 객체라 생각하고 페이지 별 전역변수를 정의 해야 합니다. 만일 window 객체에 전역변수를 무분별하게 선언 하면 프로그램을 쓰면 쓸수록 느려 지는 문제가 발생 합니다. Natural-JS 는 Controller Object 에 대해서 리소스 관리를 해 주지만 window 객체에 바인딩 되어 있는 전역 변수들에 대해서는 리소스 관리를 하지 않습니다.</p>

###컴포넌트 초기화
이제 각 요소들에 다음과 같은 컴포넌트들를 적용하여 생명을 불어 넣어 보겠습니다.

 * .search-conditions : **N.form**
 * .search-conditions #gender : **N.select**
 
 * .buttons #btnAdd : **N.button**
 * .buttons #btnDelete : **N.button**
 * .buttons #btnSave : **N.button**
 * .buttons #btnSearch : **N.button**
 
 * .result .grid : **N.grid**
 * .result .grid #eyeColor : **N.select**
 
#### N.select 초기화

**N.select** 컴포넌트로 **.search-conditions #gender** 요소와  **.result .grid #eyeColor** 요소에 코드 데이터 들을 바인딩 해 보겠습니다.

initComponents 함수에 다음 코드를 작성 합니다.

```
...
initComponents : function() {
    cont.eyeColor = N([
        { key: "blue", val: "EYE_COLOR_01" },
        { key: "brown", val: "EYE_COLOR_02" },
        { key: "green", val: "EYE_COLOR_03" },
    ]).select({
        context : N("#eyeColor", cont.view)
    }).bind();
    
    cont.gender = N([
        { key: "female", val: "GENDER_01" },
        { key: "male", val: "GENDER_02"}
    ]).select({
        context : N("#gender", cont.view)
    }).bind();
},
...
```

<p class="alert">Natural-JS 의 모든 함수, 메서드들은 N([]).select.bind() 와 같이 함수들을 연달아서 실행 할 수 있는 메서드체이닝을 지원 합니다.</a> 

N.select 와 같은 데이터 관련 컴포넌트들은 컴포넌트 초기화와 데이터 바인딩이 분리 되어 있습니다. ```var grid = N([object, object, ...]).grid()``` 명령을 실행하면 컴포넌트 인스턴스가 반환되고 컴포넌트 인스턴스(select) 에서 .bind() 함수를 실행하면 데이터가 바인딩 되고 .add() 함수를 호출 하면 새로운 행 데이터가 생성 됩니다.  
N() 함수의 첫번째 인자에 JSON(array[object]) 타입의 데이터를 입력하고 .bind() 함수를 호출하면 인스턴스 생성 시 입력 된 데이터가 바인딩 되고 데이터를 동적으로 바인딩 해야 한다면 N() 함수에 ```var grid = N([]).grid()``` 처럼 비어있는 array 를 입력하고 bind() 함수의 첫번째 인자에 ```grid.bind([object, object, ...])``` 처럼 데이터를 입력 하면 됩니다.

서버에서 데이터 조회 해서 N.select 에 데이터를 바인딩 한다면 다음 코드와 비슷하게 변경하면 됩니다. 

```
...
initComponents : function() {
   cont.eyeColor = N([]).select({
		context : N("#eyeColor", cont.view),
		key : "option 태그의 text 로 표시 될 프로퍼티명",
		val : "option 태그의 value 속성으로 표시 될 프로퍼티명"
	});
   cont.gender = N([]).select({
		context : N("#gender", cont.view),
		key : "option 태그의 text 로 표시 될 프로퍼티명",
		val : "option 태그의 value 속성으로 표시 될 프로퍼티명"
	});
    
   N.comm("조회URL").submit(function(data) {
   		cont.eyeColor.bind(data["eyeColor 데이터 리스트"]);
   		cont.gender.bind(data["gender 데이터 리스트"]);
   })
},
...
```

#### N.form 초기화

검색 폼 영역(.search-conditions)에 N.form 컴포넌트를 적용하기 위해 initComponents 함수에 다음과 같은 코드를 추가 합니다.

```
...
initComponents : function() {
   ...
   
   cont.form = N([]).form({
		context : N(".search-conditions", cont.view)
	}).add();
},
...
```

**.search-conditions** 요소에 N.form 컴포넌틀를 적용하고 .add() 함수를 호출하여 비어있는 데이터를 생성 했습니다. .add() 함수를 호출 했기 때문에 cont.form 인스턴스에 다음과 같인 데이터가 생성 되었을 것입니다. ```cont.form.data()``` 함수를 실행하면 확인 할 수 있습니다.

```
[{
	"name" : "",
	"gender" : "",
	"rowStatus" : "insert"
}]
```

이 생성 된 데이터는 입력요소의 값이 바뀔 때 마다 동기화 됩니다. 때문에 다음과 같이 서버에서 데이터를 조회 할 때 다음과 같이 선언만 해 놓으면 마지막 입력한 검색조건이 서버로 전달이 됩니다.

```
N(cont.form.data()).comm("getSampleList.json").submit(function(data) {
	N.log(data);
});
```

#### N.grid 초기화

그리드 영역(.grid)에 N.grid 컴포넌트를 적용하기 위해 initComponents 함수에 다음과 같은 코드를 추가 합니다.

```
...
initComponents : function() {
	...
	cont.grid = N([]).grid({
		height : 300,
		context : N(".grid", cont.view),
		resizable : true,
		sortable : true,
		checkAll : "#checkAll",
		checkAllTarget : ".checkAllTarget"
	}).bind();
},
...
```

앞에서 설명 한 N.form 과 옵션만 다르고 선언 방식이 비슷합니다. N.grid 는 비어있는 array 를 바인딩 하면 "조회를 하지 않았거나 조회된 데이터가 없습니다." 라는 메시지를 행에 표시 해 줍니다. 이 메시지는 natural.config.js 파일의 N.context.attr("ui").grid.message 에서 변경 할 수 있습니다.
bind()를 호출 하지 않으면 기본 행이 아무 의미없이 표시 되니 bind() 를 호출 해서 자연스러운 그리드의 모양을 만들어 주세요. 만약 페이지 로딩완료 후 서버에서 조회 된 데이터를 즉시 바인딩 한다면 컴포넌트를 초기화 하면서 .bind() 함수를 호출 할 필요는 없겠죠?

###이벤트 바인딩

이벤트 바인딩은 jQuery 에서 제공하는 기능을 사용 합니다. 

#### [조회] 버튼 이벤트

```
bindEvents : function() {
	N("#btnSearch", cont.view).click(function(e) {
	    e.preventDefault();
	    if(cont.form.validate()) {
	    	cont.form.data(false).comm({
	    	    url : "getSampleList.json",
	    	    type : "GET"
	    	}).submit(function(data) {
	     		// Data bind by N.grid
	     		cont.grid.bind(data);
	     	});
	    }
	}).button();
}
```

<p class="alert">위 코드 에서 N.comm 의 옵션 중 type 은 웹 서버에 POST 방식으로 요청을 할 수 없어 임의로 정의 한 옵션 입니다. WAS 나 PHP 와 연동하여 사용 할 경우에는 natural.config.js 에 type 의 기본값이 "POST" 로 정의 되어 있으니 type 옵션을 제거 바랍니다. type 옵션 에 대한 자세한 내용은 <a href="#cmVmcjAyMDQlMjRDb21tdW5pY2F0b3IucmVxdWVzdCRodG1sJTJGbmF0dXJhbGpzJTJGcmVmciUyRnJlZnIwMjA0Lmh0bWw=">Communicator.request</a> 문서의 [기본옵션]탭을 참고 해 주세요.</p>

조회 버튼의 이벤트 핸들러는 검색 폼(cont.form)의 데이터를 파라미터로 서버에서 데이터를 조회 해서 그리드(cont.grid)에 데이터를 바인딩하는 로직을 정의 한 것 입니다.
```cont.form.validate()``` 함수는 검색 폼의 입력 요소의 태그에 선언 된 data-validate 옵션([Form](#cmVmcjA0MDclMjRGb3JtJGh0bWwlMkZuYXR1cmFsanMlMkZyZWZyJTJGcmVmcjA0MDcuaHRtbA==) 문서의 [선언형옵션] 참고)을 한번에 체크하여 입력 데이터에 대한 유효성 검증을 실행하는 함수 입니다. 유효성 검증에 모두 통과 해야만 true 를 반환해서 위 코드와 같이 if 조건으로 선언해 놓으면 "필수 입력 체크" 등의 귀찮은 작업들을 편리하게 처리 할 수 있습니다.  
그리고 구문의 끝 부분에 .button() 함수를 호출 하여 이벤트 바인딩하는 요소에 버튼 컴포넌를 적용 했습니다.

#### [추가] 버튼 이벤트

```
bindEvents : function() {
	...
	N("#btnAdd", cont.view).click(function(e) {
		e.preventDefault();
		cont.grid.add();
	}).button();
}
```

N.grid 컴포넌트의 인스턴스에서 add() 함수를 호출 하면 그리드에 행이 추가 됩니다.

#### [삭제] 버튼 이벤트

```
bindEvents : function() {
	...
	N("#btnDelete", cont.view).click(function(e) {
		e.preventDefault();
		var checkedIndexs = cont.grid.check();
		if(checkedIndexs.length > 0) {
		    N(window).alert({
				msg : "삭제 하겠습니까?<br/>저장 버튼을 누르기 전까지는 DB 에 반영 되지 않습니다.",
				confirm : true,
				onOk : function() {
					cont.grid.remove(checkedIndexs);
				}
			}).show();
		} else {
			N(window).alert("선택된 행이 없습니다.").show();
		}
	}).button();
}
```

N.grid 컴포넌트의 인스턴스에서 check() 함수를 호출 하면 그리드 첫번째 컬럼의 체크박스가 체크 된 행 인덱스를 반환 하고 반환 된 인덱스를  remove() 함수에 인자로 전달하면 그리드에서 선택 된 행이 삭제 됩니다.

#### [저장] 버튼 이벤트

```
bindEvents : function() {
	...
	N("#btnSave", cont.view).click(function(e) {
		e.preventDefault();
		
		if(cont.grid.data("modified").length === 0) {
			N(window).alert("변경된 데이터가 없습니다.").show();
			return false;
		}
		
		if(cont.grid.validate()) {
			N(window).alert({
				msg : "저장 하겠습니까?",
				confirm : true,
				onOk : function() {
					N(cont.grid.data("modified")).comm({
					   type : "GET",
						dataIsArray : true,
						url : "getSampleList.json"
					}).submit(function(data) {
						N.notify.add("저장이 완료 되었습니다.");
						N("#btnSearch", cont.view).click();
					});
				}
			}).show();
		}
	}).button();
}
```

저장 이벤트의 로직은 다음 순서로 진행 이 됩니다.

1. 변경된 데이터 체크 : ```if(cont.grid.data("modified").length === 0) {```
2. 추가, 수정 된 입력 값에 대한 유효성 체크 :  ```if(cont.grid.validate()) {```
3. 저장 할 지 물어보는 N.alert 컴포넌트로 다이얼로그 표시
4. N.comm 의 파라미터로 그리드의 변경 된 데이터만 추출(```cont.grid.data("modified")```)하여 서버에 전송.
5. 저장 완료 후 N.notify 컴포넌트로 전역 메시지 표시
6. 조회버튼을 클릭 하여 변경 된 데이터 재 조회


<p class=“alert”>이 문서는 완성 된 문서가 아닙니다.</p>

