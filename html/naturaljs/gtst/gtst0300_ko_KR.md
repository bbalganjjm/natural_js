Grid 로 데이터 조회/변경 하기
===

Grid 로 생성/조회/수정/삭제를 처리 하기 위해 조회조건 영역과 조회 결과 Grid 로 이루어진 프로그램을 개발 해 보겠습니다.

코드 데이터들은 [Select](#cmVmcjA0MDYlMjRTZWxlY3QkaHRtbCUyRm5hdHVyYWxqcyUyRnJlZnIlMkZyZWZyMDQwNi5odG1s)(N.select) 컴포넌트를 사용하여 데이터를 바인딩 하고 [Form](#cmVmcjA0MDclMjRGb3JtJGh0bWwlMkZuYXR1cmFsanMlMkZyZWZyJTJGcmVmcjA0MDcuaHRtbA==)(N.form) 컴포넌트로 조회조건 영역을 폼으로 생성하고  [Grid](#cmVmcjA0MDklMjRHcmlkJGh0bWwlMkZuYXR1cmFsanMlMkZyZWZyJTJGcmVmcjA0MDkuaHRtbA==)(N.grid) 컴포넌트로 입력/조회/수정/삭제 할 수 있는 그리드를 생성 할 것 입니다.
버튼 들은 [Button](#cmVmcjA0MDIlMjRCdXR0b24kaHRtbCUyRm5hdHVyYWxqcyUyRnJlZnIlMkZyZWZyMDQwMi5odG1s)(N.button) 컴포넌트를 사용 합니다.

[웹 어플리케이션 기본 프레임 만들기](#Z3RzdDAyMDAlMjQlRUMlOUIlQjklMjAlRUMlOTYlQjQlRUQlOTQlOEMlRUIlQTYlQUMlRUMlQkMlODAlRUMlOUQlQjQlRUMlODUlOTglMjAlRUElQjglQjAlRUIlQjMlQjglMjAlRUQlOTQlODQlRUIlQTAlODglRUMlOUUlODQlMjAlRUIlQTclOEMlRUIlOTMlQTQlRUElQjglQjAkaHRtbCUyRm5hdHVyYWxqcyUyRmd0c3QlMkZndHN0MDIwMC5odG1s) 에서 생성한 기본 프레임에 메뉴를 추가하여 실습을 진행 해 보겠습니다.

먼저 **/html/index/lefter.html** 파일을 열어 다음과 같이 ul 태그의 마지막에 li 요소를 추가 하고 지금부터 작업 할 메뉴링크(page6.html)를 추가 해 줍니다.

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

메뉴 추가가 완료 되었으면 데이터 조회 및 저장을 실행 하기 위해 [data.json](html/naturaljs/gtst/data/data.json) 파일을 다운로드하여 프로젝트의 Context Root 에 저장 합니다.
<p class="alert">data.json 파일 링크를 클릭 했을 때 다운로드 되지 않으면 data.json 링크에서 마우스 오른버튼을 클릭 한 다음 [다른 이름으로 링크 저장] 을 클릭 주세요.</p>
<p class="alert">이 자습서는 Web Server 에서 구동 되는 예제로 조회 파라미터나 저장/수정/삭제 된 데이터가 저장 되지 않습니다. 서버로 전송 되는 파라미터만 개발자도구의 네트워크 탭에서 확인 바랍니다. 서버(DBMS)와 연동 되는 예제는 <a href="#Z3RzdDIwMDAlMjQlRUMlODMlOTglRUQlOTQlOEMlMjAlRUQlOTQlODQlRUIlQTElOUMlRUMlQTAlOUQlRUQlOEElQjglRUIlQTElOUMlMjAlRUMlOEIlOUMlRUMlOUUlOTElRUQlOTUlOTglRUElQjglQjAkaHRtbCUyRm5hdHVyYWxqcyUyRmd0c3QlMkZndHN0MjAwMC5odG1s">샘플 프로젝트로 시작하기</a> 문서를 참고 바랍니다.</p>


##View 영역 코딩

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

코드가 좀 기네요? Style, View 영역과 Controller 영역을 구분 해 보면 간단 해 집니다. 30초만 집중 해서 봅시다. 매트릭스 네오처럼 코드들이 한눈에 들어오지 않나요? -.-;

위 Style 영역을 공통 css 파일로 통합 하면 Style 영역은 필요 없습니다. 그러나 Natural-JS 의 컴포넌트에 정의 된 context 요소의 스타일이 그대로 적용 되는것을 간단하게 확인하기 위해서 페이지에 Style 을 정의 했습니다.
<p class="alert">Natural-JS 로 프로젝트를 진행 할 때 웹 퍼블리셔와 협업하면 UI 품질과 개발 생산성을 동시에 향상 시킬 수 있습니다. 웹 퍼블리셔는 Natural-JS 를 위한 학습이 필요 없고 웹 표준에 따라 퍼블리싱 하면 됩니다.</p>

위 코드에서 집중해야 할 부분은 View 영역 입니다. Controller 는 일부러 틀만 만들고 비워 놓았습니다. 하나씩 채워가면서 진행 하려구요.

View 의 하위 요소 중 첫번째에 있는 **.search-conditions** 요소는 검색조건을 입력 할 수 있는 검색 폼 입니다. 그 아래 **.buttons** 요소에는 버튼들이 배치 되고 **.result** 요소에는 조회 된 결과 데이터를 Grid 로 표현하기 위해 N.grid 의 context 요소인 Table 을 만들었습니다. N.grid 컴포넌트를 적용하려면 반드시 그리드로 생성 될 **table** 태그가 작성되어 있어야 하고 table 태그에 **thead**(그리드 헤더) 와 **tbody**(그리드 바디) 태그가 작성되어 있어야 합니다. N.grid 의 행 들은 **tbody** 요소를 리스트 데이터의 길이 만큼 복제 해서 표현 해 줍니다. 각 컴포넌트에 대한 자세한 내용은 관련 문서를 참고 하기 바랍니다.

##Controller 영역 코딩

Controller 영역을 보면 이전 예제들과 다르게 cont 변수에 Controller Object 인스턴스를 담는 코드와 이를 함수로 감싸서 바로 실행하는 코드가 작성 되어 있습니다.

```
(function() {

    var cont = N(".page6").cont({
        ...
    });

})();
```

이유는 Function Scope 에 상관 없이 Contoller(N.cont) Object 에 접근하기 위해서 입니다.
위와 같이 Controller 를 정의하하고 cont 변수를 선언하고 N().cont() 함수를 실행하면 함수의 어떤 위치에서나 cont 변수로 Controller Object 에 접근 할 수 있습니다.
<p class="alert">Natural-JS 로 프로젝트를 진행하다 보면 view 나 request, caller 등의 Controller 오브젝트에 담겨있는 고유 객체들을 참고하거나 페이지 전역변수를 담기 위해 Controller Object 에 접근해야 할 때가 많이 있습니다.</p>
<p class="alert">SPA 로 메뉴 컨텐츠 들을 개발 할 때는 Controller Object 가 해당 페이지의 최상위 객체라 생각하고 페이지 별 전역변수를 정의 해야 합니다. 그렇게 하지 않고 window 객체에 전역변수를 선언 하면 데이터가 꼬이거나 메모리 사용량이 크게 증가 하는 문제가 발생 할 수 있습니다. Natural-JS 는 Controller Object 에 대해서 리소스 관리를 해 주지만 window 객체에 바인딩 되어 있는 전역 변수들에 대해서는 관여 하지 않습니다.</p>

###컴포넌트 초기화
이제 View 에서 선언 한 각 요소들에 다음과 같은 컴포넌트를 적용하여 생명을 불어 넣어 보겠습니다.

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

<p class="alert">Natural-JS 의 모든 함수 및 메서드 들은 N([]).select.bind() 와 같이 명령을 연달아 실행 할 수 있는 메서드체이닝을 지원 합니다.</a>

N.select 와 같은 데이터 관련 컴포넌트들은 컴포넌트 초기화와 데이터 바인딩이 분리 되어 있습니다. ```var grid = N([object, object, ...]).grid()``` 명령을 실행하면 컴포넌트 인스턴스가 반환되고 컴포넌트 인스턴스에서 bind() 메서드를 실행하면 데이터가 바인딩 되고 add() 메서드를 호출 하면 새로운 행 데이터가 생성 됩니다.

N() 함수의 첫번째 인자에 JSON Array 타입의 데이터를 입력 한 다음 bind() 메서드를 호출하면 인스턴스 생성 시 입력 된 데이터가 바인딩 됩니다. 데이터를 동적으로 바인딩 해야 한다면 N() 함수에 ```var grid = N([]).grid()``` 처럼 비어있는 array 를 입력하여 컴포넌트를 초기화 하고 bind() 메서드의 첫번째 인자에 json array 타입의 데이터를 입력 하여 호출하면 됩니다.

N.select 에 바인딩 할 데이터를 서버에서 조회 해 온다면 다음 코드와 비슷하게 변경하면 됩니다.

```
...
initComponents : function() {
   cont.eyeColor = N([]).select({
        context : N("#eyeColor", cont.view),
        key : "codeName", // option 태그의 text 로 표시 될 프로퍼티명
        val : "codeValue" // option 태그의 value 속성으로 표시 될 프로퍼티명
    });
   cont.gender = N([]).select({
        context : N("#gender", cont.view),
        key : "codeName",
        val : "codeValue"
    });

   N.comm("data/url.json").submit(function(data) {
           cont.eyeColor.bind(data["eyeColorList"]);
      cont.gender.bind(data["genderList"]);
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

**.search-conditions** 요소에 N.form 컴포넌틀를 적용하고 add() 메서드를 호출하여 비어있는 데이터를 생성 했습니다. add() 메서드를 호출 했기 때문에 cont.form 인스턴스에 다음과 같은 데이터가 생성 되었을 것입니다. ```cont.form.data()``` 메서드를 실행하면 확인 할 수 있습니다.

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

앞에서 설명한 N.form 과 옵션만 다르고 선언 방식이 비슷합니다.

N.grid 는 비어있는 array 객체를 바인딩 하면 "조회를 하지 않았거나 조회된 데이터가 없습니다." 라는 메시지를 그리드에 표시 해 줍니다. 페이지 로딩 완료 후 서버에서 조회 한 데이터를 그리드에 즉시 바인딩 해야 되는 경우라면 컴포넌트 인스턴스 생성만 하면 되지만 사용자가 조회를 직접 실행 할 때는 기본 행이 아무 의미없이 표시 되니 bind() 메서드를 호출 해서 자연스러운 그리드의 모양을 만들어 주세요.

### 이벤트 바인딩

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

<p class="alert">위 코드 에서 N.comm 의 옵션들 중 type 프로퍼티는 웹 서버에 POST 방식으로 요청 할 수 없어서 임의로 정의 한 옵션 입니다. 서버가 POST 요청을 처리 할 수 있는 환경이라면 natural.config.js 에 type 의 기본값이 "POST" 로 정의 되어 있으니 type 옵션을 제거 바랍니다. type 옵션 에 대한 자세한 내용은 <a href="#cmVmcjAyMDQlMjRDb21tdW5pY2F0b3IucmVxdWVzdCRodG1sJTJGbmF0dXJhbGpzJTJGcmVmciUyRnJlZnIwMjA0Lmh0bWw=">Communicator.request</a> 문서의 [기본옵션] 탭을 참고 해 주세요.</p>

조회 버튼의 이벤트 핸들러는 다음과 같은 로직을 실행 합니다.
 1. 검색 폼(cont.form)의 데이터를 파라미터로 서버에서 데이터 조회
 2. 그리드(cont.grid)에 조회한 데이터를 바인딩

```cont.form.validate()``` 메서드는 검색 폼의 입력 요소의 태그에 선언 된 data-validate 옵션([Form](#cmVmcjA0MDclMjRGb3JtJGh0bWwlMkZuYXR1cmFsanMlMkZyZWZyJTJGcmVmcjA0MDcuaHRtbA==) 문서의 [선언형옵션] 참고)을 한번에 체크하여 입력 데이터에 대한 유효성 검증을 실행하는 메서드 입니다. validate() 메서드는 유효성 검증을 모두 통과 해야만 true 를 반환하므로 위 코드와 같이 if 조건으로 선언해 놓으면 "필수 입력 체크" 등의 귀찮은 작업들을 편리하게 처리 할 수 있습니다.
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

3. 저장 할 것인지 물어보는 Confirm 다이얼로그 표시 :
```
...
N(window).alert({
    msg : "Do you want to save?",
    confirm : true,
...
```

4. N.comm 을 이용하여 그리드의 변경 된 데이터(```cont.grid.data("modified")```)를 서버파라미터로 전송.
<p class="alert">위 코드 에서 N.comm 의 옵션들 중 "type" 은 웹 서버에 POST 방식으로 요청 할 수 없어서 임의로 정의 한 옵션 입니다. 서버가 POST 요청을 처리 할 수 있는 환경이라면 natural.config.js 에 type 의 기본값이 "POST" 로 정의 되어 있으니 type 옵션을 제거 바랍니다. type 옵션 에 대한 자세한 내용은 <a href="#cmVmcjAyMDQlMjRDb21tdW5pY2F0b3IucmVxdWVzdCRodG1sJTJGbmF0dXJhbGpzJTJGcmVmciUyRnJlZnIwMjA0Lmh0bWw=">Communicator.request</a> 문서의 [기본옵션] 탭을 참고 해 주세요.</p>
<p class="alert">서버로 object 가 아닌 array[object] 형태의 파라미터를 전달 하려면 dataIsArray 옵션을 활성화 해 주어야 합니다. dataIsArray 옵션에 대한 자세한 내용은 <a href="#cmVmcjAyMDQlMjRDb21tdW5pY2F0b3IucmVxdWVzdCRodG1sJTJGbmF0dXJhbGpzJTJGcmVmciUyRnJlZnIwMjA0Lmh0bWw=">Communicator.request</a> 문서의 [기본옵션] 탭을 참고 해 주세요.</p>
5. 저장 완료 후 N.notify 컴포넌트를 사용하여 메시지 표시
<p class="alert">입력요소의 값을 변경하거나 cont.grid.val() 메서드로 데이터를 변경하면 <strong>rowStatus</strong> 프로퍼티가 생성 됩니다. rowStatus 값은 "insert", "update", "delete" 중 하나가 됩니다. <strong>서버 에서는</strong> 행 데이터 객체 마다 정의 되어 있는 <strong>rowStatus 값으로 입력/수정/삭제 를 구분 해서 처리</strong> 하면 됩니다.</p>
6. Retrieve 버튼을 클릭 하여 변경 된 데이터 재 조회

지금까지 작성한 소스 파일들을 웹 서버에 배포한 다음 **/index.html** 에 접속 했을때 다음과 같은 화면이 표시 되면 실습을 성공 한 것 입니다.

![완료 화면](images/gtst/gtst0300/0.png)

전체 소스코드는 [여기](html/naturaljs/gtst/codes/natural_js_gtst0300.zip) 에서 다운로드 할 수 있습니다.

학습을 계속 하기 원한다면 예제 메뉴에 있는 여러 예제들의 소스코드들을 분석 해 보기 바랍니다.