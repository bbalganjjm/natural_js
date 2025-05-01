# Natural-JS Grid 컴포넌트 개발자 가이드

Natural-JS의 Grid(N.grid)는 table 요소를 context로 지정하여 멀티 컬럼 형태로 데이터 목록을 생성해 주는 UI 컴포넌트입니다.

## 개요

Grid 컴포넌트는 데이터를 테이블 형태로 표시하고 관리하는 강력한 도구입니다. 다음과 같은 주요 특징을 제공합니다:

- Natural-DATA 패키지의 컴포넌트들과 연동하여 데이터 포맷팅 및 입력 데이터의 유효성 검증 프로세스 단순화
- 헤더고정형, 리스트형 두 가지 타입의 그리드 제공
- 데이터 상태 관리 (입력, 수정, 삭제 상태를 rowStatus 속성으로 관리)
- Excel 데이터 붙여넣기, 데이터 필터링, 정렬 등 다양한 기능 제공
- 컬럼 넓이 조절, 컬럼 숨기기/보이기, 상세 팝업 등의 기능 제공

그리드로 만들어질 table 요소의 넓이는 고정 길이(px 등)든 가변 길이(%)든 반드시 지정되어야 합니다.

## 생성자

### N.grid

```javascript
var grid = new N.grid(data, opts|context);
```

- **data** (json object array): data 옵션을 설정합니다. 기본 옵션의 data 옵션과 동일합니다.
- **opts|context** (object | jQuery selector string | jQuery object): 컴포넌트의 기본 옵션 객체를 지정합니다. jQuery 셀렉터 문자열 또는 jQuery 객체를 입력하면 기본 옵션의 context 옵션으로 설정됩니다.
- **반환 값**: N.grid 인스턴스

### N(obj).grid

```javascript
var grid = N(data).grid(opts|context);
```

- **data** (json object array): data 옵션을 설정합니다. 기본 옵션의 data 옵션과 동일합니다.
- **opts|context** (object | jQuery Selector(string | jQuery object)): N.grid 함수의 두번째 인자(opts)와 동일합니다.
- **반환 값**: N.grid 인스턴스

`new N.grid()`로 생성한 인스턴스와 `N().grid`로 생성한 인스턴스는 객체 인스턴스를 생성하는 방법만 다를 뿐 동일합니다. N() 함수의 첫 번째 인자는 new N.grid 생성자의 첫 번째 인자로 설정됩니다.

## 기본 옵션

| 옵션명 | 타입 | 기본값 | 필수 여부 | 설명 |
|--------|------|--------|-----------|------|
| data | json object array | undefined | O | N.grid에 바인딩할 데이터를 지정합니다. |
| context | jQuery object 또는 jQuery 셀렉터 문자열 | null | O | N.grid를 적용할 context 요소를 지정합니다.<br>N.grid의 context 요소는 반드시 table 태그로 작성해야 합니다.<br><br>**thead - Grid header**<br>그리드의 컬럼 타이틀을 작성합니다.<br>thead의 셀은 th 태그를 사용합니다.<br>header가 필요 없으면 작성하지 않아도 되지만 헤더에서 구동되는 sortable 나 filter 등의 옵션은 사용할 수 없습니다.<br>thead 태그 안에 tr 태그를 여러 개 작성할 수 있습니다.<br><br>**tbody - Grid body**<br>행을 표현하는 최상위 요소는 tbody이고 목록 데이터의 길이만큼 tbody가 복제됩니다.<br>tbody의 셀은 td 태그를 사용합니다.<br>행 데이터의 프로퍼티명과 요소의 id 속성 값이 같으면 데이터가 바인딩됩니다.<br>Natural-JS의 모든 데이터 관련 컴포넌트는 빠른 바인딩 속도를 위해 어쩔 수 없이 id 속성을 사용합니다.<br>1개의 셀(td) 안에 2개 이상의 컬럼 데이터를 바인딩하려면 셀안에 요소를 2개 이상 만들고 id 속성 값을 추가해 주면 됩니다. 이때 thead의 th에 data-id 속성 값에 정렬/필터 등의 기준이 되는 데이터 프로퍼티명을 설정해 주어야 합니다.<br>tbody 태그 안에 tr 태그를 여러 개 작성하여 행 그룹을 만들 수 있습니다.<br><br>**tfoot - Grid footer**<br>Grid footer가 필요 없으면 작성하지 않아도 됩니다.<br>tfoot의 셀은 td 태그를 사용합니다.<br><br>```html<br><table class="grid-context"><br>    <thead><br>        <tr><br>            <th>name</th><br>            <th data-id="age">age</th><br>            <th>email</th><br>            <th>registered</th><br>        </tr><br>    </thead><br>    <tbody><br>        <tr><br>            <td><input id="name" type="text"></td><br>            <td><br>                <input id="age" type="text"><br>                <span id="gender"><span><br>            </td><br>            <td><input id="email" type="text"></td><br>            <td id="registered"></td><br>        </tr><br>    </tbody><br></table>```|
| height | number | 0 | X | 그리드 body의 높이를 지정합니다.<br>설정한 값이 0보다 크면 헤더가 고정되고 그리드 바디에 스크롤바가 생기면서 설정한 높이로 고정됩니다. 0으로 설정하면 헤더를 고정하지 않고 모든 데이터를 그리드 바디에 보여 줍니다.<br>Pagination(N.pagination) 컴포넌트와 결합하여 페이징 된 데이터를 N.grid에 바인딩할 때는 0으로 설정하여 모든 데이터를 한번에 표시하는 것을 권장합니다. |
| fixedcol | number | 0 | X | 지정한 열들은 고정되고 다른 열 들은 가로로 스크롤될 수 있게 해 줍니다.<br>0으로 설정하면 열을 고정하지 않고 1 이상의 숫자로 설정하면 첫 번째 열부터 설정한 숫자(열 개수)만큼 열을 고정해 줍니다.<br>헤더(thead) 영역은 반드시 있어야 하고 푸터(tfoot) 영역은 없어야 합니다.<br>그리드의 헤더나 바디가 2행 이상의 세트로 구성되어 있거나 height 옵션이 0보다 크면 작동하지 않습니다.<br>고정된 셀들이 비 정상적으로 표시되면 misc.fixedcolHeadMarginTop, misc.fixedcolHeadMarginLeft, misc.fixedcolHeadHeight, misc.fixedcolBodyMarginTop, misc.fixedcolBodyMarginLeft, fixedcolBodyBindHeight, fixedcolBodyAddHeight 옵션 값 들을 조절해 주세요. |
| more | boolean\|array | false | X | true로 설정하면 컬럼을 숨기거나 보이게 할 수 있는 기능과 상세 팝업을 자동으로 생성해 주는 기능이 활성화됩니다.<br>그리드의 마지막 열 다음에 위의 기능을 실행하는 버튼을 생성해 줍니다.<br>true로 설정하면 그리드 헤더에 정의되어 있는 모든 컬럼들을 모두 상세 팝업에 보여주고 array에 컬럼 명 들을 지정하여 옵션으로 설정하면 지정한 컬럼들만 보여 줍니다.<br>컬럼들의 제목은 그리드 헤더의 제목 텍스트를 그대로 사용하기 때문에 그리드 헤더에 정의되어 있지 않은 컬럼은 표시되지 않습니다. 그리드 헤더에 없는 컬럼을 상세 팝업에 표시하려면 그리드에 컬럼을 추가하고 그리드를 초기화 한 다음 hide 메서드로 추가한 컬럼을 숨기면 상세 팝업에서만 볼 수 있습니다.<br>fixedcol 옵션으로 열이 고정된 경우 컬럼 숨기기/보이기 기능이 제대로 작동하지 않을 수 있습니다.<br>상세 팝업의 컬럼 타이틀 정보는 tbody의 td 나 td 안에 있는 요소들의 id 값을 기준으로 추출됩니다. 그러나 tbody의 td 안에 id 속성을 가진 요소가 2개 이상 존재하거나 그리드 헤더와 바디의 요소 구성이 많이 다를 경우에는 제대로 추출이 되지 않을 수 있습니다. 이때는 th 요소의 data-id 속성에 추출될 컬럼명을 선언해 주면 정상적으로 작동됩니다. |
| validate | boolean | true | X | false로 설정하면 입력 요소에서 focus-out 되었을 때 입력 값에 대한 유효성 검증을 실행하지 않습니다. |
| html | boolean | false | X | true로 설정하면 data를 bind 할 때 데이터의 HTML이 적용됩니다. |
| addTop | boolean | false | X | true로 설정하면 add 메서드를 호출했을 때 행 요소와 로우 데이터가 목록의 맨 앞에 추가됩니다.<br>addTop 옵션을 false로 설정하면 데이터 동기화 문제가 발생하여 scrollPaging.size와 createRowDelay 옵션의 설정 값이 0으로 강제 설정됩니다. 이로 인해 데이터 바인딩 성능이 저하될 수 있습니다. |
| resizable | boolean | false | X | true로 설정하면 컬럼의 넓이를 조절할 수 있습니다.<br>colgroup의 col 태그를 사용하여 셀의 넓이를 지정했을 때 resizable 옵션이 true 이면 그리드가 초기화될 때 col 태그에 정의되어 있는 셀의 넓이 값을 thead의 th에 이관하고 colgroup 태그를 제거합니다. 때문에 컬럼 리사이징 기능을 사용하려면 col 태그에 넓이를 지정하지 말고 thead의 th에 컬럼 넓이를 설정하는 것을 권장합니다.<br>thead의 th에 colspan 속성이 있을 경우 컬럼 리사이즈 기능이 제대로 작동하지 않을 수 있습니다.<br>컬럼 리사이징 할 때 그리드의 모양이 깨지면 misc.resizableCorrectionWidth, misc.resizableLastCellCorrectionWidth, misc.resizeBarCorrectionLeft, misc.resizeBarCorrectionHeight 옵션 값 들을 조절해 주세요. |
| vResizable | boolean | false | X | true로 설정하면 그리드 바디의 높이를 조절할 수 있습니다. |
| sortable | boolean | false | X | true로 설정하면 선택 한 컬럼을 기준으로 데이터를 정렬할 수 있습니다.<br>정렬될 컬럼의 정보는 tbody의 td 나 td 안에 있는 요소들의 id 값을 기준으로 정렬합니다. 그러나 tbody의 td 안에 id 속성을 가진 요소가 2개 이상 존재하거나 그리드 헤더와 바디의 요소 구성이 많이 다를 경우에는 제대로 정렬이 되지 않을 수 있습니다. 이때는 th 요소의 data-id 속성에 정렬될 컬럼명을 선언해 주면 정상적으로 작동됩니다. |
| filter | boolean | false | X | true로 설정하면 선택 한 컬럼을 기준으로 데이터를 필터링할 수 있습니다.<br>filter 옵션이 false 인 상태에서 th 요소의 속성으로 data-filter="true" 옵션을 선언해 주면 컬럼 별로 필터 기능을 활성화할 수 있습니다.<br>필터링될 컬럼의 정보는 tbody의 td 나 td 안에 있는 요소들의 id 값을 기준으로 필터링됩니다. 그러나 tbody의 td 안에 id 속성을 가진 요소가 2개 이상 존재하거나 그리드 헤더와 바디의 요소 구성이 많이 다를 경우에는 제대로 필터링되지 않을 수 있습니다. 이때는 th 요소의 data-id 속성에 필터링될 컬럼명을 선언해 주면 정상적으로 작동됩니다. |
| windowScrollLock | boolean | true | X | true로 설정하면 데이터 목록 요소 위에서 마우스 휠로 스크롤할 때 브라우저의 윈도우 스크롤을 비활성화합니다.<br>데이터 목록 요소가 처음이나 마지막으로 스크롤되었을 때 브라우저 윈도우 스크롤이 위나 아래로 스크롤되는 브라우저의 기본 동작을 차단합니다. |
| revert | boolean | false | X | true로 설정하면 revert 기능이 활성화되고 revert 메서드를 사용할 수 있습니다.<br>revert 기능이 활성화되면 최초 바인딩된 데이터가 메모리에 적제되므로 메모리 사용량이 증가합니다. |
| select | boolean | false | X | true로 설정하면 행을 선택(단일 행 선택)했을 때 onSelect 이벤트가 발생하고 행 요소(tbody)의 class 속성에 grid_selected__ 값이 토글 됩니다. |
| unselect | boolean | true | X | false로 설정하면 select 옵션이 true 일 때 선택된 행을 다시 선택해도 선택이 취소되지 않습니다.<br>multiselect 옵션이 true 일 경우에는 unselect 옵션이 적용되지 않습니다. |
| multiselect | boolean | false | X | true로 설정하면 행을 선택(다중 행 선택)했을 때 onSelect 이벤트가 발생하고 행 요소(tbody)의 class 속성에 grid_selected__ 값이 토글 됩니다. |
| checkAll | string | null | X | checkAllTarget 옵션으로 지정한 모든 체크박스를 선택하기 위한 input[type=checkbox] 요소를 지정합니다.<br>지정한 요소는 반드시 thead 영역에 있어야 합니다.<br>jQuery selector 구문으로 지정하며 selector의 context는 그리드의 헤더 요소(thead)로 자동 지정됩니다.<br>체크박스를 체크만 하고 클릭 이벤트를 발생시키지 않습니다. |
| checkAllTarget | string | null | X | 그리드의 행을 다중 선택하기 위한 input[type=checkbox] 요소를 지정합니다.<br>지정된 요소는 check 함수로 선택된 행의 인덱스를 가져오거나 선택할 수 있습니다.<br>checkSingleTarget 대상 요소는 반드시 tbody 요소 안에 있어야 합니다.<br>jQuery selector 구문으로 지정하며 selector의 context는 그리드의 행 요소(tbody)로 자동 지정됩니다.<br>checkAllTarget 옵션과 checkSingleTarget 옵션은 둘 중 하나만 사용할 수 있습니다.<br>체크박스에 id 속성을 설정하여 데이터를 바인딩하면 제대로 작동하지 않을 수 있습니다. 선택된 행의 인덱스를 가져오는 용도로만 사용 바랍니다. |
| checkSingleTarget | string | null | X | 그리드의 행을 단일 선택하기 위한 input[type=checkbox] 요소를 지정합니다.<br>지정된 요소는 check 함수로 선택된 행의 인덱스를 가져오거나 선택할 수 있습니다.<br>checkSingleTarget 대상 요소는 반드시 tbody 요소 안에 있어야 합니다.<br>jQuery selector 구문으로 지정하며 selector의 context는 그리드의 행 요소(tbody)로 자동 지정됩니다.<br>checkAllTarget 옵션과 checkSingleTarget 옵션은 둘 중 하나만 사용할 수 있습니다.<br>체크박스에 id 속성을 설정하여 데이터를 바인딩하면 제대로 작동하지 않을 수 있습니다. 선택된 행의 인덱스를 가져오는 용도로만 사용 바랍니다. |
| hover | boolean | false | X | true로 설정하면 행에 마우스가 over 되었을 때 행 요소에 "list_hover__" 클래스 속성 값이 추가되고 out 되면 추가된 클래스 속성 값이 제거됩니다. |
| createRowDelay | number(ms) | 1 | X | 1 이상으로 설정하면 바인딩할 때 그리드의 각 행이 별도로 생성됩니다. 이때 다음 행이 생성되기까지의 시간 간격을 설정합니다.<br>0으로 설정하면 모든 행을 한번에 생성하여 데이터를 바인딩하는 동안 브라우저가 멈출 수도 있습니다. |
| scrollPaging.size | number | 100 | X | 스크롤 페이징 할 때 한번에 바인딩할 행 수를 지정합니다.<br>헤더 고정형 N.grid는 스크롤 페이징 기능이 기본적으로 활성화되며 0을 지정하면 스크롤 페이징 기능이 비활성화됩니다.<br>size 옵션 값은 다음과 같이 scrollPaging 옵션 객체의 하위 속성으로 지정해야 합니다.<br>```javascript<br>...<br>    scrollPaging : {<br>        size : 50<br>    }<br>...```<br>너무 작게 지정하면 스크롤이 생성되지 않아 데이터가 모두 표시되지 않습니다. 반드시 행들이 그리드 바디를 넘칠 수 있는 양을 지정해 주어야 합니다.<br>너무 크게 지정하면 스크롤 페이징이 작동될 때 브라우저에 부하가 발생되므로 그리드에 입력 요소나 이미지가 들어 있다면 100 이하로 설정하고 그렇지 않다면 1000 이하로 설정하는 것을 권장합니다. |
| fRules | object | null | X | 대상 요소의 data-format 속성이 아닌 객체 타입으로 format 룰을 지정합니다.<br>옵션 오브젝트는 Formatter 메뉴의 [ 생성자 ] 탭의 rules 인수의 설명을 참고해서 작성 바랍니다. |
| vRules | object | null | X | 대상 요소의 data-validate 속성이 아닌 객체 타입으로 유효성 검증 룰을 지정합니다.<br>옵션 오브젝트는 Validator 메뉴의 [ 생성자 ] 탭의 rules 인수의 설명을 참고해서 작성 바랍니다. |
| addSelect | boolean | false | X | true로 설정하면 add 메서드를 호출했을 때 추가된 행이 자동으로 선택됩니다.<br>select 옵션이 true로 설정되어 있어야 합니다. |
| addScroll | boolean | true | X | false로 설정하면 add 메서드를 호출했을 때 추가된 행으로 스크롤되지 않습니다. |
| selectScroll | boolean | true | X | false로 설정하면 select 메서드를 호출했을 때 선택된 마지막 행으로 스크롤되지 않습니다. |
| checkScroll | boolean | true | X | false로 설정하면 check 메서드를 호출했을 때 체크된 마지막 행으로 스크롤되지 않습니다. |
| validateScroll | boolean | true | X | false로 설정하면 validate 메서드를 호출했을 때 유효성 검증에 실패 한 마지막 행으로 스크롤되지 않습니다. |
| appendScroll | boolean | true | X | false로 설정하면 두 번째 인수에 "append" 옵션을 지정하여 bind 메서드를 호출했을 때 append 된 행으로 자동 스크롤되지 않습니다. |
| tpBind | boolean | false | X | true로 설정하면 컴포넌트 초기화 전에 입력 요소에 바인딩되어 있는 이벤트와 format, validate, dataSync 등의 컴포넌트 이벤트의 충돌을 방지해 줍니다.<br>format이 정상적으로 동작하지 않거나 바인딩되어 있는 데이터가 의도한 대로 핸들링되지 않을 때, 알 수 없는 오류가 발생했을 때 true로 설정 바랍니다. |
| pastiable | boolean | false | X | true로 설정하면 엑셀에서 복사한 셀 데이터를 그리드에 붙여넣기(Ctrl + V)할 수 있습니다.<br>Excel에서 복사한 데이터 외에도 행을 엔터키(\n)로 구분하고 열을 탭키(\t)로 구분하는 텍스트도 붙여 넣을 수 있습니다.<br>텍스트 입력 커서가 표시되는 셀을 기준으로 id 속성을 갖고 있는 요소들에 순서대로 붙여 넣기 합니다. 입력 요소가 아닌 경우에도 id 속성이 있으면 셀 값이 업데이트됩니다.<br>readonly 또는 disabled 속성을 갖고 있는 요소는 값을 입력하지 않습니다. |

### 이벤트 핸들러 옵션

| 옵션명 | 타입 | 기본값 | 필수 여부 | 설명 |
|--------|------|--------|-----------|------|
| rowHandlerBeforeBind | function | null | X | bind 하거나 add 했을 때 생성된 행 요소에 데이터가 바인딩되기 전에 실행되는 이벤트 핸들러를 정의합니다.<br>```javascript<br>rowHandlerBeforeBind : function(rowIdx, rowEle, rowData) {<br>    // this : N.grid 인스턴스<br>    // rowIdx : 생성된 행 index<br>    // rowEle : 생성된 행 요소(li)<br>    // rowData : 생성될 행의 Data<br>}```<br>rowHandlerBeforeBind 이벤트 핸들러는 행 요소가 생성될 때마다 실행됩니다. |
| rowHandler | function | null | X | bind 하거나 add 했을 때 생성된 행 요소에 데이터가 바인딩된 후에 실행되는 이벤트 핸들러를 정의합니다.<br>```javascript<br>rowHandler : function(rowIdx, rowEle, rowData) {<br>    // this : N.grid 인스턴스<br>    // rowIdx : 생성된 행 index<br>    // rowEle : 생성된 행 요소(li)<br>    // rowData : 생성된 행의 Data<br>}```<br>rowHandler 이벤트 핸들러는 행 요소가 생성될 때마다 실행됩니다. |
| onBeforeSelect | function | null | X | 행이 선택 되기전에 실행되는 이벤트 핸들러를 정의합니다.<br>```javascript<br>onBeforeSelect : function(rowIdx, rowEle, rowData, beforeRowIdx, e) {<br>    // this : N.grid 인스턴스<br>    // rowIdx : 선택된 행 index<br>    // rowEle : 선택된 행 요소(li)<br>    // rowData : 선택된 행 data<br>    // beforeRowIdx : 바로 전에 선택된 행의 index<br>    // e : click 이벤트 객체<br>}```<br>onBeforeSelect 이벤트 핸들러에서 false 를 반환하면 행이 선택되지 않습니다. 이때 onSelect 이벤트는 onBeforeSelect 이벤트와 같은 조건으로 실행 됩니다.<br>select 나 multiselect 옵션이 true로 설정되었을 경우에만 실행됩니다.<br>unselect 옵션이 false로 설정되었을 경우 선택이 해제되면 rowIdx 인수 값에 -1을 반환하고 선택되면 선택된 행의 인덱스를 반환합니다. |
| onSelect | function | null | X | 행이 선택된 후에 실행되는 이벤트 핸들러를 정의합니다.<br>```javascript<br>onSelect : function(rowIdx, rowEle, rowData, beforeRowIdx, e) {<br>    // this : N.grid 인스턴스<br>    // rowIdx : 선택된 행 index<br>    // rowEle : 선택된 행 요소(li)<br>    // rowData : 선택된 행 data<br>    // beforeRowIdx : 바로 전에 선택된 행의 index<br>    // e : click 이벤트 객체<br>}```<br>select 나 multiselect 옵션이 true로 설정되었을 경우에만 실행됩니다.<br>unselect 옵션이 false로 설정되었을 경우 선택이 해제되면 rowIdx 인수 값에 -1을 반환하고 선택되면 선택된 행의 인덱스를 반환합니다. |
| onBind | function | null | X | 데이터가 바인딩이 완료된 후에 실행되는 이벤트 핸들러를 정의합니다.<br>```javascript<br>onBind : function(context, data, isFirstPage, isLastPage) {<br>    // this : N.grid 인스턴스<br>    // context : context 요소<br>    // data : 바인딩된 데이터<br>    // isFirstPage : 스크롤 페이징 할 때 첫 페이지인지 여부(스크롤 페이징 하지 않으면 true 반환)<br>    // isLastPage : 스크롤 페이징 할 때 마지막 페이지 인지 여부(스크롤 페이징 하지 않으면 true 반환)<br>}```<br>스크롤 페이징이 활성화되었을 경우 페이징 된 데이터가 바인딩될 때마다 실행됩니다. |

### misc 옵션 (기타 상수)

| 옵션명 | 타입 | 기본값 | 필수 여부 | 설명 |
|--------|------|--------|-----------|------|
| misc.resizableCorrectionWidth | number | 0 | X | resizable 옵션이 활성화되었을 때 그리드 바디 컬럼의 넓이와 그리드 헤더 컬럼 넓이가 일치하지 않을 수 있습니다. 이때 값을 0.1 씩 증가 또는 감소해서 보정하는 옵션입니다.<br>그리드 열의 너비/높이는 td, th와 같은 테이블 관련 요소에 적용되는 스타일(padding, box-sizing 등)에 따라 변경될 수 있습니다. |
| misc.resizableLastCellCorrectionWidth | number | 0 | X | 헤더 고정형 그리드에서 resizable 옵션이 활성화되었을 때 마지막 컬럼을 클릭하면 다른 컬럼들이 밀릴 수 있습니다. 이때 값을 0.1 씩 증가 또는 감소해서 보정하는 옵션입니다.<br>그리드 열의 너비/높이는 td, th와 같은 테이블 관련 요소에 적용되는 스타일(padding, box-sizing 등)에 따라 변경될 수 있습니다. |
| misc.resizeBarCorrectionLeft | number | 0 | X | resizable 옵션이 활성화되었을 때 리사이즈바의 left 포지션이 컬럼 보더를 기준으로 가운데에 위치하지 않을 수 있습니다. 이때 값을 0.1 씩 증가 또는 감소해서 보정하는 옵션입니다.<br>그리드 열의 너비/높이는 td, th와 같은 테이블 관련 요소에 적용되는 스타일(padding, box-sizing 등)에 따라 변경될 수 있습니다. |
| misc.resizeBarCorrectionHeight | number | 0 | X | resizable 옵션이 활성화되었을 때 리사이즈 바의 높이가 꽉 차지 않을 수 있습니다. 이때 값을 0.1 씩 증가 또는 감소해서 보정하는 옵션입니다.<br>그리드 열의 너비/높이는 td, th와 같은 테이블 관련 요소에 적용되는 스타일(padding, box-sizing 등)에 따라 변경될 수 있습니다. |
| misc.fixedcolHeadMarginTop | number | 0 | X | fixedcol 옵션이 활성화되었을 때 고정된 헤더 셀(th)의 상단 위치가 맞지 않을 수 있습니다. 이때 값을 0.1 씩 증가 또는 감소해서 보정하는 옵션입니다.<br>그리드 열의 너비/높이는 td, th와 같은 테이블 관련 요소에 적용되는 스타일(padding, box-sizing 등)에 따라 변경될 수 있습니다. |
| misc.fixedcolHeadMarginLeft | number | 0 | X | fixedcol 옵션이 활성화되었을 때 고정된 헤더 셀(th)의 좌측 위치가 맞지 않을 수 있습니다. 이때 값을 0.1 씩 증가 또는 감소해서 보정하는 옵션입니다.<br>그리드 열의 너비/높이는 td, th와 같은 테이블 관련 요소에 적용되는 스타일(padding, box-sizing 등)에 따라 변경될 수 있습니다. |
| misc.fixedcolHeadHeight | number | 0 | X | fixedcol 옵션이 활성화되었을 때 고정된 헤더 셀(th)의 높이가 맞지 않을 수 있습니다. 이때 값을 0.1 씩 증가 또는 감소해서 보정하는 옵션입니다.<br>그리드 열의 너비/높이는 td, th와 같은 테이블 관련 요소에 적용되는 스타일(padding, box-sizing 등)에 따라 변경될 수 있습니다. |
| misc.fixedcolBodyMarginTop | number | 0 | X | fixedcol 옵션이 활성화되었을 때 고정된 바디 셀(td)의 상단 위치가 맞지 않을 수 있습니다. 이때 값을 0.1 씩 증가 또는 감소해서 보정하는 옵션입니다.<br>그리드 열의 너비/높이는 td, th와 같은 테이블 관련 요소에 적용되는 스타일(padding, box-sizing 등)에 따라 변경될 수 있습니다. |
| misc.fixedcolBodyMarginLeft | number | 0 | X | fixedcol 옵션이 활성화되었을 때 고정된 바디 셀(td)의 좌측 위치가 맞지 않을 수 있습니다. 이때 값을 0.1 씩 증가 또는 감소해서 보정하는 옵션입니다.<br>그리드 열의 너비/높이는 td, th와 같은 테이블 관련 요소에 적용되는 스타일(padding, box-sizing 등)에 따라 변경될 수 있습니다. |
| misc.fixedcolBodyBindHeight | number | 0 | X | fixedcol 옵션이 활성화되었을 때 고정된 바디 셀(td)의 높이가 맞지 않을 수 있습니다. 이때 값을 0.1 씩 증가 또는 감소해서 보정하는 옵션입니다.<br>그리드 열의 너비/높이는 td, th와 같은 테이블 관련 요소에 적용되는 스타일(padding, box-sizing 등)에 따라 변경될 수 있습니다. |
| misc.fixedcolBodyAddHeight | number | 1 | X | fixedcol 옵션이 활성화되었을 때 추가된 행의 셀(td)의 높이가 맞지 않을 수 있습니다. 이때 값을 0.1 씩 증가 또는 감소해서 보정하는 옵션입니다.<br>그리드 열의 너비/높이는 td, th와 같은 테이블 관련 요소에 적용되는 스타일(padding, box-sizing 등)에 따라 변경될 수 있습니다. |
| misc.fixedcolRootContainer | string | null | X | fixed col 옵션을 적용하여 그리드 인스턴스를 생성한 이후 그리드를 감싸고 있는 요소의 높이가 동적으로 변경되었을 때 그리드의 모양이 깨질 수 있습니다. 이때 이 옵션에 높이가 변경되는 요소 지정해 주면 그리드 모양이 깨지지 않습니다.<br>jQuery selector 문자열로 요소를 지정합니다.<br>그리드 열의 너비/높이는 td, th와 같은 테이블 관련 요소에 적용되는 스타일(padding, box-sizing 등)에 따라 변경될 수 있습니다. |

## 메서드(Methods)

### bind

컴포넌트 생성 시 지정한 context 대상 요소에 데이터를 바인딩합니다.

```javascript
grid.bind([data [, "append"]]);
```

- **data** (json object array, 선택 사항): 바인딩할 데이터를 지정합니다. 지정하지 않으면 생성자에서 지정한 기본 옵션의 data 값이 사용됩니다.
- **"append"** (string, 선택 사항): "append"를 지정하면 기존 데이터를 남겨두고 추가로 바인딩합니다.
- **반환 값**: N.grid 인스턴스

### data

컴포넌트에 바인딩되어 있는 데이터를 반환합니다.

```javascript
grid.data([flag]);
```

- **flag** (string 또는 boolean, 선택 사항): 반환할 데이터의 유형을 지정합니다.
  - **"modified"**: 수정된 데이터를 반환합니다.
  - **"insert"**: 입력된 데이터를 반환합니다.
  - **"update"**: 수정된 데이터를 반환합니다.
  - **"delete"**: 삭제된 데이터를 반환합니다.
  - **"selected"**: 선택된 데이터를 반환합니다.
  - **"checked"**: 체크된 데이터를 반환합니다.
  - **undefined** (인자를 지정하지 않은 경우): json object array 타입의 모든 데이터를 반환합니다.
  - **false**: jQuery object 타입의 모든 데이터를 반환합니다.
- **반환 값**: json object array | jQuery object[json object array] (설정한 flag에 따라 해당하는 데이터를 반환합니다)

### add

빈 행을 추가합니다.

```javascript
grid.add([idx [, data]]);
```

- **idx** (number, 선택 사항): 추가할 행 인덱스를 지정합니다. 지정하지 않으면 addTop 옵션의 설정이 적용됩니다.
- **data** (object, 선택 사항): 추가할 행에 바인딩할 데이터를 지정합니다.
- **반환 값**: N.grid 인스턴스

### remove

행을 삭제합니다.

```javascript
grid.remove(idx);
```

- **idx** (number 또는 array): 삭제할 행 인덱스를 지정합니다. 배열을 지정하면 여러 행을 동시에 삭제할 수 있습니다.
- **반환 값**: N.grid 인스턴스

### select

행을 선택합니다.

```javascript
grid.select(idx [, isAdd]);
```

- **idx** (number 또는 array): 선택할 행 인덱스를 지정합니다. 배열을 지정하면 여러 행을 동시에 선택할 수 있습니다.
- **isAdd** (boolean, 선택 사항): true를 지정하면 기존 선택된 행을 유지하면서 추가로 선택합니다. 기본값은 false입니다.
- **반환 값**: N.grid 인스턴스

### check

체크박스를 체크합니다.

```javascript
grid.check(idx [, isAdd]);
```

- **idx** (number 또는 array): 체크할 행 인덱스를 지정합니다. 배열을 지정하면 여러 행을 동시에 체크할 수 있습니다.
- **isAdd** (boolean, 선택 사항): true를 지정하면 기존 체크된 행을 유지하면서 추가로 체크합니다. 기본값은 false입니다.
- **반환 값**: Array (체크된 행의 인덱스 배열)

### val

지정한 행의 특정 컬럼 값을 가져오거나 설정합니다.

```javascript
grid.val(idx, key [, val]);
```

- **idx** (number): 대상 행 인덱스를 지정합니다.
- **key** (string): 대상 컬럼(키) 명을 지정합니다.
- **val** (any, 선택 사항): 지정한 컬럼에 설정할 값을 지정합니다. 지정하지 않으면 현재 값을 반환합니다.
- **반환 값**: any (값을 조회할 때) 또는 N.grid 인스턴스 (값을 설정할 때)

### revert

변경된 데이터를 원래 상태로 복원합니다.

```javascript
grid.revert([idx]);
```

- **idx** (number, 선택 사항): 복원할 행 인덱스를 지정합니다. 지정하지 않으면 모든 행 데이터를 복원합니다.
- **반환 값**: N.grid 인스턴스

### hide

컬럼을 숨깁니다.

```javascript
grid.hide(idx);
```

- **idx** (number): 숨길 컬럼 인덱스를 지정합니다.
- **반환 값**: N.grid 인스턴스

### show

숨겨진 컬럼을 다시 표시합니다.

```javascript
grid.show(idx);
```

- **idx** (number): 표시할 컬럼 인덱스를 지정합니다.
- **반환 값**: N.grid 인스턴스

### move

행을 이동합니다.

```javascript
grid.move(fromIdx, toIdx);
```

- **fromIdx** (number): 이동 대상 행의 인덱스를 지정합니다.
- **toIdx** (number): 이동할 위치의 행 인덱스를 지정합니다.
- **반환 값**: N.grid 인스턴스

### copy

행을 복사합니다.

```javascript
grid.copy(fromIdx, toIdx);
```

- **fromIdx** (number): 복사 대상 행의 인덱스를 지정합니다.
- **toIdx** (number): 복사할 위치의 행 인덱스를 지정합니다.
- **반환 값**: N.grid 인스턴스

### validate

입력 데이터의 유효성을 검증합니다.

```javascript
grid.validate([idx]);
```

- **idx** (number, 선택 사항): 검사할 행 인덱스를 지정합니다. 지정하지 않으면 모든 행 데이터를 검사합니다.
- **반환 값**: boolean (유효성 검증 성공 여부)

## 예제(Examples)

### 1. 기본 그리드 생성

```html
<table id="sampleGrid" class="table" style="width: 100%;">
    <thead>
        <tr>
            <th>이름</th>
            <th>나이</th>
            <th>이메일</th>
            <th>등록일</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td><input id="name" type="text"></td>
            <td><input id="age" type="text"></td>
            <td><input id="email" type="text"></td>
            <td id="registered"></td>
        </tr>
    </tbody>
</table>

<script>
    var data = [
        {
            "name": "홍길동",
            "age": 30,
            "email": "hong@example.com",
            "registered": "2023-01-15"
        },
        {
            "name": "김철수",
            "age": 25,
            "email": "kim@example.com",
            "registered": "2023-02-20"
        }
    ];
    
    var grid = N(data).grid("#sampleGrid").bind();
</script>
```

### 2. 헤더 고정형 그리드 생성 (height 옵션 사용)

```html
<table id="fixedHeaderGrid" class="table" style="width: 100%;">
    <thead>
        <tr>
            <th>이름</th>
            <th>나이</th>
            <th>이메일</th>
            <th>등록일</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td><input id="name" type="text"></td>
            <td><input id="age" type="text"></td>
            <td><input id="email" type="text"></td>
            <td id="registered"></td>
        </tr>
    </tbody>
</table>

<script>
    var data = [
        // ... 데이터 배열
    ];
    
    var grid = N(data).grid({
        context: "#fixedHeaderGrid",
        height: 300 // 그리드 높이 300px로 설정
    }).bind();
</script>
```

### 3. 정렬 및 필터 기능 추가

```html
<table id="sortFilterGrid" class="table" style="width: 100%;">
    <thead>
        <tr>
            <th>이름</th>
            <th>나이</th>
            <th>이메일</th>
            <th>등록일</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td><input id="name" type="text"></td>
            <td><input id="age" type="text"></td>
            <td><input id="email" type="text"></td>
            <td id="registered"></td>
        </tr>
    </tbody>
</table>

<script>
    var data = [
        // ... 데이터 배열
    ];
    
    var grid = N(data).grid({
        context: "#sortFilterGrid",
        sortable: true,  // 정렬 기능 활성화
        filter: true     // 필터 기능 활성화
    }).bind();
</script>
```

### 4. 행 선택 이벤트 사용

```html
<table id="selectEventGrid" class="table" style="width: 100%;">
    <thead>
        <tr>
            <th>이름</th>
            <th>나이</th>
            <th>이메일</th>
            <th>등록일</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td><input id="name" type="text"></td>
            <td><input id="age" type="text"></td>
            <td><input id="email" type="text"></td>
            <td id="registered"></td>
        </tr>
    </tbody>
</table>

<script>
    var data = [
        // ... 데이터 배열
    ];
    
    var grid = N(data).grid({
        context: "#selectEventGrid",
        select: true,  // 행 선택 기능 활성화
        onSelect: function(rowIdx, rowEle, rowData) {
            console.log("선택된 행:", rowIdx);
            console.log("선택된 데이터:", rowData);
        }
    }).bind();
</script>
```

### 5. CRUD 기능 사용

```html
<table id="crudGrid" class="table" style="width: 100%;">
    <thead>
        <tr>
            <th>이름</th>
            <th>나이</th>
            <th>이메일</th>
            <th>등록일</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td><input id="name" type="text"></td>
            <td><input id="age" type="text"></td>
            <td><input id="email" type="text"></td>
            <td id="registered"></td>
        </tr>
    </tbody>
</table>

<button id="btnAdd">행 추가</button>
<button id="btnRemove">선택 행 삭제</button>
<button id="btnSave">저장</button>

<script>
    var data = [
        // ... 데이터 배열
    ];
    
    var grid = N(data).grid({
        context: "#crudGrid",
        select: true,
        revert: true // 데이터 복원 기능 활성화
    }).bind();
    
    $("#btnAdd").on("click", function() {
        grid.add(); // 행 추가
    });
    
    $("#btnRemove").on("click", function() {
        var selectedIdx = grid.select();
        if (selectedIdx >= 0) {
            grid.remove(selectedIdx); // 선택된 행 삭제
        }
    });
    
    $("#btnSave").on("click", function() {
        // 수정된 데이터만 가져오기
        var modifiedData = grid.data("modified");
        console.log("수정된 데이터:", modifiedData);
        
        // 서버에 데이터 전송 로직...
    });
</script>
```

### 6. 포매터와 유효성 검증 규칙 사용

```html
<table id="validateGrid" class="table" style="width: 100%;">
    <thead>
        <tr>
            <th>이름</th>
            <th>나이</th>
            <th>이메일</th>
            <th>등록일</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td><input id="name" type="text" data-validate="required"></td>
            <td><input id="age" type="text" data-format="number" data-validate="required|number|min:1|max:120"></td>
            <td><input id="email" type="text" data-validate="required|email"></td>
            <td id="registered" data-format="date"></td>
        </tr>
    </tbody>
</table>

<button id="btnValidate">유효성 검증</button>

<script>
    var data = [
        // ... 데이터 배열
    ];
    
    var grid = N(data).grid({
        context: "#validateGrid"
    }).bind();
    
    $("#btnValidate").on("click", function() {
        if (grid.validate()) {
            alert("유효성 검증 성공!");
        } else {
            alert("유효성 검증 실패. 입력 값을 확인해주세요.");
        }
    });
</script>
```

### 7. 열 고정 및 그리드 리사이징 기능 사용

```html
<table id="resizableGrid" class="table" style="width: 100%;">
    <thead>
        <tr>
            <th style="width: 150px;">이름</th>
            <th style="width: 80px;">나이</th>
            <th style="width: 200px;">이메일</th>
            <th style="width: 120px;">등록일</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td><input id="name" type="text"></td>
            <td><input id="age" type="text"></td>
            <td><input id="email" type="text"></td>
            <td id="registered"></td>
        </tr>
    </tbody>
</table>

<script>
    var data = [
        // ... 데이터 배열
    ];
    
    var grid = N(data).grid({
        context: "#resizableGrid",
        height: 300,
        fixedcol: 1,   // 첫 번째 열 고정
        resizable: true, // 컬럼 리사이징 활성화
        vResizable: true // 그리드 높이 리사이징 활성화
    }).bind();
</script>
```