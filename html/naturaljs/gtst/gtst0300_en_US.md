Retrieving / Modifying Data with Grid
===

In order to process creation / retrieval / modification / deletion with Grid, we will develop a program consisting of the search condition area and the search result Grid.

Code data will use [Select](#cmVmcjA0MDYlMjRTZWxlY3QkaHRtbCUyRm5hdHVyYWxqcyUyRnJlZnIlMkZyZWZyMDQwNi5odG1s)(N.select) component to bind data, [Form](#cmVmcjA0MDclMjRGb3JtJGh0bWwlMkZuYXR1cmFsanMlMkZyZWZyJTJGcmVmcjA0MDcuaHRtbA==)(N.form) component will create search condition area as form, and [Grid](#cmVmcjA0MDklMjRHcmlkJGh0bWwlMkZuYXR1cmFsanMlMkZyZWZyJTJGcmVmcjA0MDkuaHRtbA==)(N.grid) component will create a grid that can be input / viewed / modified / deleted. Buttons use the[Button](#cmVmcjA0MDIlMjRCdXR0b24kaHRtbCUyRm5hdHVyYWxqcyUyRnJlZnIlMkZyZWZyMDQwMi5odG1s)(N.button) component.

Let's practice by adding a menu to the basic frame created in [Create a web application base frame](#Z3RzdDAyMDAlMjRDcmVhdGUlMjBhJTIwd2ViJTIwYXBwbGljYXRpb24lMjBiYXNlJTIwZnJhbWUkaHRtbCUyRm5hdHVyYWxqcyUyRmd0c3QlMkZndHN0MDIwMC5odG1s).

First, open the  **/html/index/lefter.html** file, add the li element to the end of the ul tag as follows, and add a menu link(page6.html) to work from now on.

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

When the menu addition is complete, download the [data.json](html/naturaljs/gtst/data/data.json) file and save it in the context root of your project for the execute data searching and saving.
<p class="alert">If the data.json file is not downloaded when you click the link, right-click on the data.json link, then click [Save Link As].</p>
<p class="alert">This tutorial is an example running on the Web Server, and the inquiry parameter or saved / modified / deleted data is not saved. Please check only the parameters transmitted to the server in the network tab of the developer tool. For an example that works with a server(DBMS), please refer to the document <a href="#Z3RzdDIwMDAlMjRHZXR0aW5nJTIwU3RhcnRlZCUyMHdpdGglMjBTYW1wbGUlMjBwcm9qZWN0JGh0bWwlMkZuYXR1cmFsanMlMkZndHN0JTJGZ3RzdDIwMDAuaHRtbA==">Getting Started with Sample project</a>.</p>


##Coding the view area

Create the **/html/contents/page6.html** file and write the code as follows.

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
<article class="page6">

	<div class="search-conditions">
		<label>Name<input id="name" type="text" data-validate='[["alphabet+integer"]]'></label>
		<label>Gender<input id="gender" type="radio"></label>
	</div>

    <div class="buttons">
        <a id="btnAdd" href="#" data-opts='{ "color": "green" }'>New</a>
        <a id="btnDelete" href="#" data-opts='{ "color": "green" }'>Delete</a>
        <a id="btnSave" href="#" data-opts='{ "color" : "gray" }'>Save</a>
        <a id="btnSearch" href="#">Retrieve</a>
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
    				<th><input lang="ko_KR" id="checkAll" type="checkbox" title="Check All"></th>
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
    						<option value=""></option>
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

The code is long? It becomes simple by separating Style, View area and Controller area. Let's focus on just 30 seconds. Isn't the code at a glance like Matrix Neo? -.-;

If the above style area is integrated into a common css file, the style area is unnecessary. However, to make it simple to see that the style of the context element defined in the Natural-JS component is applied as it is, the Style is defined on the page.
<p class="alert">If you collaborating with web publishers when working on a project with Natural-JS can simultaneously improve UI quality and development productivity. Web publishers do not need to learn Natural-JS, they just publish according to web standards.</p>

The part to focus on in the code above is the view area. Controller deliberately made a frame and left it empty. I'm going to fill in one by one.

The **.search-conditions** element at the first of the sub-elements on View is a search form where you can enter search conditions. Below, buttons are placed in the **.buttons** element, and in the **.result** element, a table, the context element of N.grid, is created to express the searched result data in a grid. To apply N.grid component, **table** tag to be created as grid must be written, and **thead** (grid header) and **tbody** tag must be written in table tag. The rows of N.grid represent the **tbody** element by duplicating as much as the length of the list data.
For more information about each component, please refer to the related document.

##Controller area coding

Looking at the Controller area, unlike the previous examples, the code that contains the Controller Object instance in the cont variable and the code that wraps it in a function and executes it are written.

```
(function() {

    var cont = N(".page6").cont({
        ...
    });

})();
```

The reason is to access the Contoller(N.cont) Object regardless of the function scope.
Define Controller as above, declare cont variable and execute N().cont() function, you can access Controller Object with cont variable at any position of function.
<p class="alert">When working on a project with Natural-JS, there are many times when you need to access the Controller Object to refer to the constant objects contained in the Controller object such as view, request, and caller, or to save or reference the page global variables.</p>
<p class="alert">When developing page contents with SPA, think that the Controller Object is the top-level object of the page and define global variables for each page. If you don't do so, declaring a global variable in the window object can cause data is twisted or a large increase in memory usage. Natural-JS manages the resource for the Controller Object, but does not participate in global variables bound to the window object.</p>

###Component initialization
Now, let's breathe the life by applying the following components to each element declared in View.

 * .search-conditions : **N.form**
 * .search-conditions #gender : **N.select**

 * .buttons #btnAdd : **N.button**
 * .buttons #btnDelete : **N.button**
 * .buttons #btnSave : **N.button**
 * .buttons #btnSearch : **N.button**

 * .result .grid : **N.grid**
 * .result .grid #eyeColor : **N.select**

#### N.select initialization

Let's bind the code data to the  **.search-conditions #gender** element and the **.result .grid #eyeColor** element with the **N.select** component.

Write the following code in the initComponents function.

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

<p class="alert">All functions and methods of Natural-JS support method chaining that can execute commands one after another, such as N([]).select.bind().</a>

Data-related components such as N.select are separated from component initialization and data binding. ```var grid = N([object, object, ...]).grid()``` The "a" command returns the component instance, the bind() method on the component instance binds the data, and the add() method calls creates new row data.

N() 함수의 첫번째 인자에 JSON(array[object]) 타입의 데이터를 입력하고 bind() 메서드를 호출하면 인스턴스 생성 시 입력 된 데이터가 바인딩 되고 데이터를 동적으로 바인딩 해야 한다면 N() 함수에 ```var grid = N([]).grid()``` 처럼 비어있는 array 를 입력하고 bind() 메서드의 첫번째 인자에 json array 타입의 데이터를 입력 하면 됩니다.

N.select 에 바인딩 할 데이터를 서버에서 조회 해 온다면 다음 코드와 비슷하게 변경하면 됩니다.

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

**.search-conditions** 요소에 N.form 컴포넌틀를 적용하고 .add() 메서드를 호출하여 비어있는 데이터를 생성 했습니다. .add() 메서드를 호출 했기 때문에 cont.form 인스턴스에 다음과 같은 데이터가 생성 되었을 것입니다. ```cont.form.data()``` 메서드를 실행하면 확인 할 수 있습니다.

```
[{
	"name" : "",
	"gender" : "",
	"rowStatus" : "insert"
}]
```

이 생성 된 데이터는 입력요소의 값이 바뀔 때 마다 내부 데이터셋과 동기화 되기 때문에 다음과 같이 선언만 해 놓으면 마지막 입력한 검색조건 데이터가 서버에 파라미터로 전달 됩니다.

```
N(cont.form.data()).comm("data.json").submit(function(data) {
	N.log(data);
});
```

#### N.grid 초기화

그리드 영역(.grid)에 있는 table 요소에 N.grid 컴포넌트를 적용하기 위해 initComponents 함수에 다음과 같은 코드를 추가 합니다.

```
...
initComponents : function() {
	...
	cont.grid = N([]).grid({
		context : N(".grid", cont.view),
		height : 300,
		resizable : true,
		sortable : true,
		checkAll : "#checkAll",
		checkAllTarget : ".checkAllTarget"
	}).bind();
},
...
```

앞에서 설명 한 N.form 과 옵션만 다르고 선언 방식이 비슷합니다.

N.grid 는 비어있는 array 객체를 바인딩 하면 "조회를 하지 않았거나 조회된 데이터가 없습니다." 라는 메시지를 그리드에 표시 해 줍니다. 페이지 로딩 완료 후 서버에서 조회 한 데이터를 그리드에 즉시 바인딩 해야 되는 경우라면 컴포넌트 인스턴스 생성만 하면 되지만 사용자가 조회를 직접 실행 할 때는 기본 행이 아무 의미없이 표시 되니 bind() 메서드를 호출 해서 자연스러운 그리드의 모양을 만들어 주세요.

###이벤트 바인딩

이벤트 바인딩은 jQuery 에서 제공하는 기능을 사용 합니다.

#### [Retrieve] 버튼 이벤트

```
bindEvents : function() {
	N("#btnSearch", cont.view).click(function(e) {
	    e.preventDefault();
	    if(cont.form.validate()) {
	    	N(cont.form.data(true)).comm({
	    	    url : "data.json",
	    	    type : "GET"
	    	}).submit(function(data) {
	     		// Data bind by N.grid
	     		cont.grid.bind(data);
	     	});
	    }
	}).button();
}
```

<p class="alert">위 코드 에서 N.comm 의 옵션 중 type 은 웹 서버에 POST 방식으로 요청 할 수 없어서 임의로 정의 한 옵션 입니다. WAS 나 PHP 와 연동하여 사용 할 경우에는 natural.config.js 에 type 의 기본값이 "POST" 로 정의 되어 있으니 type 옵션을 제거 바랍니다. type 옵션 에 대한 자세한 내용은 <a href="#cmVmcjAyMDQlMjRDb21tdW5pY2F0b3IucmVxdWVzdCRodG1sJTJGbmF0dXJhbGpzJTJGcmVmciUyRnJlZnIwMjA0Lmh0bWw=">Communicator.request</a> 문서의 [기본옵션] 탭을 참고 해 주세요.</p>

조회 버튼의 이벤트 핸들러는 다음과 같은 로직을 실행 합니다.
 1. 검색 폼(cont.form)의 데이터를 파라미터로 서버에서 데이터 조회
 2. 그리드(cont.grid)에 조회한 데이터를 바인딩

```cont.form.validate()``` 메서드는 검색 폼의 입력 요소의 태그에 선언 된 data-validate 옵션([Form](#cmVmcjA0MDclMjRGb3JtJGh0bWwlMkZuYXR1cmFsanMlMkZyZWZyJTJGcmVmcjA0MDcuaHRtbA==) 문서의 [선언형옵션] 참고)을 한번에 체크하여 입력 데이터에 대한 유효성 검증을 실행하는 메서드 입니다. 유효성 검증에 모두 통과 해야만 true 를 반환해서 위 코드와 같이 if 조건으로 선언해 놓으면 "필수 입력 체크" 등의 귀찮은 작업들을 편리하게 처리 할 수 있습니다.
그리고 구문의 끝 부분에 .button() 메서드를 실행 해서 이벤트 타겟 요소에 Button(N.button) 컴포넌를 적용 했습니다.

#### [New] 버튼 이벤트

```
bindEvents : function() {
	...
	N("#btnAdd", cont.view).click(function(e) {
		e.preventDefault();
		cont.grid.add();
	}).button();
}
```

N.grid 컴포넌트의 인스턴스에서 add() 메서드를 호출 하면 그리드에 행이 추가 됩니다.

#### [Delete] 버튼 이벤트

```
bindEvents : function() {
	...
	N("#btnDelete", cont.view).click(function(e) {
		e.preventDefault();
		var checkedIndexs = cont.grid.check();
		if(checkedIndexs.length > 0) {
		    N(window).alert({
				msg : "Are you sure you want to delete?<br/>It will not be saved in DBMS until you press the Save button.",
				confirm : true,
				onOk : function() {
					cont.grid.remove(checkedIndexs);
				}
			}).show();
		} else {
			N(window).alert("No rows selected.").show();
		}
	}).button();
}
```

cont.grid.check() 메서드를 호출 하면 그리드 첫번째 컬럼의 체크박스가 체크 된 행 인덱스를 반환 하고 반환 된 인덱스를  cont.grid.remove() 메서드의 인자로 전달하면 그리드에서 선택 된 행이 삭제 됩니다.

#### [Save] 버튼 이벤트

```
bindEvents : function() {
	...
	N("#btnSave", cont.view).click(function(e) {
		e.preventDefault();

		if(cont.grid.data("modified").length === 0) {
			N.notify.add("No data has been changed.");
			return false;
		}

		if(cont.grid.validate()) {
			N(window).alert({
				msg : "Do you want to save?",
				confirm : true,
				onOk : function() {
					N(cont.grid.data("modified")).comm({
					   type : "GET",
						dataIsArray : true,
						url : "data.json"
					}).submit(function(data) {
						N.notify.add("Save completed.");
						N("#btnSearch", cont.view).click();
					});
				}
			}).show();
		}
	}).button();
}
```

저장 이벤트의 실행 로직은 다음과 같습니다.

1. 변경된 데이터 체크 : ```if(cont.grid.data("modified").length === 0) {```

2. 추가, 수정 된 입력 값에 대한 유효성 체크 :  ```if(cont.grid.validate()) {```

3. 저장 할 것인지 물어보는 Confirm 다이얼로그 표시:
```
...
N(window).alert({
	msg : "Do you want to save?",
	confirm : true,
...
```

4. N.comm 의 파라미터로 그리드의 변경 된 데이터만 추출(```cont.grid.data("modified")```)하여 서버에 전송.
<p class="alert">위 코드 에서 N.comm 의 옵션 중 type 은 웹 서버에 POST 방식으로 요청 할 수 없어서 임의로 정의 한 옵션 입니다. WAS 나 PHP 와 연동하여 사용 할 경우에는 natural.config.js 에 type 의 기본값이 "POST" 로 정의 되어 있으니 type 옵션을 제거 바랍니다. type 옵션 에 대한 자세한 내용은 <a href="#cmVmcjAyMDQlMjRDb21tdW5pY2F0b3IucmVxdWVzdCRodG1sJTJGbmF0dXJhbGpzJTJGcmVmciUyRnJlZnIwMjA0Lmh0bWw=">Communicator.request</a> 문서의 [기본옵션] 탭을 참고 해 주세요.</p>
<p class="alert">서버로 object 가 아닌 array[object] 형태의 파라미터를 전달 하려면 dataIsArray 을 활성 화 해 주어야 합니다. dataIsArray 옵션에 대한 자세한 내용은 <a href="#cmVmcjAyMDQlMjRDb21tdW5pY2F0b3IucmVxdWVzdCRodG1sJTJGbmF0dXJhbGpzJTJGcmVmciUyRnJlZnIwMjA0Lmh0bWw=">Communicator.request</a> 문서의 [기본옵션] 탭을 참고 해 주세요.</p>
5. 저장 완료 후 N.notify 컴포넌트로 메시지 표시
<p class="alert">입력요소의 값을 변경하거나 cont.grid.val() 메서드로 데이터를 변경하면 <strong>rowStatus</strong> 프로퍼티가 생성되고, 입력은 "insert", 수정은 "update", 삭제는 "delete" 값이 입력 됩니다. <strong>서버 에서는</strong> 행 데이터 객체 마다 정의 되어 있는 <strong>rowStatus 값으로 입력/수정/삭제 를 구분 해서 처리</strong> 하면 됩니다.</p>
6. 조회버튼을 클릭 하여 변경 된 데이터 재 조회

웹 서버에 지금까지 작성한 소스 파일들을 배포한 다음 **/index.html** 에 접속 한 다음 [Grid CRUD] 메뉴를 클릭하면 지금까지 작성한 코드를 실행 해 볼 수 있습니다.

다음과 같은 화면이 표시 되면 실습 성공!

![완료 화면](images/gtst/gtst0300/0.png)

전체 소스코드는 [여기](html/naturaljs/gtst/codes/natural_js_gtst0300.zip) 에서 다운로드 할 수 있습니다.

학습을 계속 하기 원한다면 예제 메뉴에 있는 여러 예제들의 소스코드들을 분석 해 보기 바랍니다.