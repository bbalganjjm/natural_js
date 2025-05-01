# Natural-JS List 컴포넌트

## 개요

List(N.list)는 ul>li 요소를 context 옵션으로 지정하여 단일 컬럼 형태로 데이터 목록을 생성해 주는 UI 컴포넌트입니다. 리스트 형태의 데이터를 표시하고 관리하는 다양한 기능을 제공합니다.

주요 특징:
- Natural-DATA 패키지의 컴포넌트들과 연동하여 데이터 포맷팅 및 입력 데이터의 유효성 검증 프로세스를 단순화합니다.
- 바인딩된 데이터 오브젝트의 프로퍼티명(컬럼명)과 요소의 id 속성 값이 일치하면 데이터가 바인딩됩니다.
- 데이터가 요소에 바인딩되어야 데이터 포맷팅과 유효성 검증이 활성화됩니다.
- 입력 요소의 값을 변경하거나 val 메서드로 데이터가 변경되면 rowStatus 프로퍼티가 생성되고 입력은 "insert", 수정은 "update", 삭제는 "delete" 값이 입력됩니다.
- 행 선택(단일 또는 다중), 체크박스 통합, 스크롤 페이징 등의 기능을 제공합니다.

## 생성자

### N.list
```javascript
var list = new N.list(data, opts|context);
```

List 컴포넌트의 인스턴스를 생성합니다.

- **data** (json object array): 컴포넌트에 바인딩할 데이터
- **opts|context** (object | jQuery selector string | jQuery object): 컴포넌트의 기본 옵션 객체 또는 context 요소

### N(obj).list
```javascript
var list = N(data).list(opts|context);
```

N.list의 객체 인스턴스를 jQuery 플러그인 방식으로 생성합니다. N() 함수의 첫 번째 인수가 new N.list 생성자의 첫 번째 인수로 설정됩니다.

## 기본 옵션

| 이름 | 타입 | 기본값 | 필수 | 설명 |
|------|------|--------|------|------|
| data | json object array | undefined | O | N.list에 바인딩할 데이터를 지정합니다. |
| context | jQuery object\|jquery selector string | null | O | N.list를 적용할 context 요소를 지정합니다. N.list의 context 요소는 반드시 ul과 li 태그로 작성해야 합니다. **행 데이터의 프로퍼티명과 요소의 id 속성 값이 같으면 데이터가 바인딩됩니다.** |
| height | number | 0 | X | 리스트 body의 높이를 지정합니다. 설정한 값이 0보다 크면 리스트 바디에 스크롤바가 생기면서 설정한 높이로 고정됩니다. 0으로 설정하면 모든 데이터를 리스트 바디에 보여 줍니다. |
| validate | boolean | true | X | false로 설정하면 입력 요소에서 focus-out 되었을 때 입력 값에 대한 유효성 검증을 실행하지 않습니다. |
| html | boolean | false | X | true로 설정하면 data를 bind 할 때 데이터의 HTML이 적용됩니다. |
| addTop | boolean | false | X | true로 설정하면 add 메서드를 호출했을 때 행 요소와 로우 데이터가 목록의 맨 앞에 추가됩니다. |
| vResizable | boolean | false | X | true로 설정하면 리스트 바디의 높이를 조절할 수 있습니다. |
| windowScrollLock | boolean | true | X | true로 설정하면 데이터 목록 요소 위에서 마우스 휠로 스크롤할 때 브라우저의 윈도우 스크롤을 비활성화합니다. |
| revert | boolean | false | X | true로 설정하면 revert 기능이 활성화되고 revert 메서드를 사용할 수 있습니다. revert 기능이 활성화되면 최초 바인딩된 데이터가 메모리에 적제되므로 메모리 사용량이 증가합니다. |
| select | boolean | false | X | true로 설정하면 행을 선택(단일 행 선택)했을 때 onSelect 이벤트가 발생하고 행 요소(li)의 class 속성에 list_selected__ 값이 토글 됩니다. |
| unselect | boolean | true | X | false로 설정하면 select 옵션이 true 일 때 선택된 행을 다시 선택해도 선택이 취소되지 않습니다. |
| multiselect | boolean | false | X | true로 설정하면 행을 선택(다중 행 선택)했을 때 onSelect 이벤트가 발생하고 행 요소(li)의 class 속성에 list_selected__ 값이 토글 됩니다. |
| checkAll | jQuery object | null | X | checkAllTarget 옵션으로 지정한 모든 체크박스를 선택하기 위한 input[type=checkbox] 요소를 지정합니다. |
| checkAllTarget | string | null | X | 리스트의 행을 다중 선택하기 위한 input[type=checkbox] 요소를 지정합니다. jQuery selector 구문으로 지정하며 selector의 context는 리스트의 행 요소(li)로 자동 지정됩니다. |
| checkSingleTarget | string | null | X | 리스트의 행을 단일 선택하기 위한 input[type=checkbox] 요소를 지정합니다. jQuery selector 구문으로 지정하며 selector의 context는 리스트의 행 요소(li)로 자동 지정됩니다. |
| hover | boolean | false | X | true로 설정하면 행에 마우스가 over 되었을 때 행 요소에 "list_hover__" 클래스 속성 값이 추가되고 out 되면 추가된 클래스 속성 값이 제거됩니다. |
| createRowDelay | number(ms) | 1 | X | 1 이상으로 설정하면 바인딩할 때 리스트의 각 행이 별도로 생성됩니다. 이때 다음 행이 생성되기까지의 시간 간격을 설정합니다. |
| scrollPaging.size | number | 100 | X | 스크롤 페이징 할 때 한번에 바인딩할 행 수를 지정합니다. N.list는 스크롤 페이징 기능이 기본적으로 활성화되며 0을 지정하면 스크롤 페이징 기능이 비활성화됩니다. |
| fRules | object | null | X | 대상 요소의 data-format 속성이 아닌 객체 타입으로 format 룰을 지정합니다. |
| vRules | object | null | X | 대상 요소의 data-validate 속성이 아닌 객체 타입으로 유효성 검증 룰을 지정합니다. |
| addSelect | boolean | false | X | true로 설정하면 add 메서드를 호출했을 때 추가된 행이 자동으로 선택됩니다. |
| addScroll | boolean | true | X | false로 설정하면 add 메서드를 호출했을 때 추가된 행으로 스크롤되지 않습니다. |
| selectScroll | boolean | true | X | false로 설정하면 select 메서드를 호출했을 때 선택된 마지막 행으로 스크롤되지 않습니다. |
| checkScroll | boolean | true | X | false로 설정하면 check 메서드를 호출했을 때 체크된 마지막 행으로 스크롤되지 않습니다. |
| validateScroll | boolean | true | X | false로 설정하면 validate 메서드를 호출했을 때 유효성 검증에 실패한 마지막 행으로 스크롤되지 않습니다. |
| appendScroll | boolean | true | X | false로 설정하면 두 번째 인수에 "append" 옵션을 지정하여 bind 메서드를 호출했을 때 append 된 행으로 자동 스크롤되지 않습니다. |
| tpBind | boolean | false | X | true로 설정하면 컴포넌트 초기화 전에 입력 요소에 바인딩되어 있는 이벤트와 format, validate, dataSync 등의 컴포넌트 이벤트의 충돌을 방지해 줍니다. |
| rowHandlerBeforeBind | function | null | X | bind 하거나 add 했을 때 생성된 행 요소에 데이터가 바인딩되기 전에 실행되는 이벤트 핸들러를 정의합니다. |
| rowHandler | function | null | X | bind 하거나 add 했을 때 생성된 행 요소에 데이터가 바인딩된 후에 실행되는 이벤트 핸들러를 정의합니다. |
| onBeforeSelect | function | null | X | 행이 선택 되기전에 실행되는 이벤트 핸들러를 정의합니다. |
| onSelect | function | null | X | 행이 선택된 후에 실행되는 이벤트 핸들러를 정의합니다. |
| onBind | function | null | X | 데이터가 바인딩이 완료된 후에 실행되는 이벤트 핸들러를 정의합니다. |

## 선언형 옵션

List 컴포넌트는 HTML 요소에 직접 data-* 속성을 통해 다양한 옵션을 지정할 수 있습니다. 특히 Natural-DATA 패키지의 컴포넌트(Formatter, Validator)와 연동하여 입력 데이터의 포맷팅 및 유효성 검증을 선언적으로 지정할 수 있습니다.

### data-format
```html
<input id="balance" type="tel" data-format='[["numeric", "$#,###.##0"]]'>
```
표시되는 데이터의 형식을 지정합니다. Formatter 컴포넌트와 연동됩니다.

### data-validate
```html
<input id="name" type="text" data-validate='[["required"]]'>
```
입력 데이터의 유효성 검증 규칙을 지정합니다. Validator 컴포넌트와 연동됩니다.

## 함수

### data
```javascript
listInstance.data([selFlag][, propName1, propName2, ...]);
```

컴포넌트에 바인딩된 최신 데이터를 반환합니다.

- **selFlag** (boolean|string, 선택적): 반환되는 데이터의 타입을 결정하는 구분 값입니다.
  - **undefined**: json object array 타입의 데이터를 반환합니다. (selFlag 옵션이 지정되지 않은 경우)
  - **false**: 컴포넌트에 바인딩되어 있는 jQuery object[json object array] 타입의 원래 유형의 데이터를 반환합니다.
  - **"modified"**: 추가, 수정, 삭제된 데이터를 반환합니다(json object array 타입).
  - **"selected"**: select 옵션이나 multiselect 옵션을 설정했을 때 선택된 데이터를 반환합니다(json object array 타입).
  - **"checked"**: checkAll 옵션과 checkAllTarget 옵션이나 checkOnlyTarget 옵션을 설정했을 때 체크된 데이터를 반환합니다(json object array 타입).
  - **"insert"**: 추가된 데이터를 반환합니다(json object array 타입).
  - **"update"**: 수정된 데이터를 반환합니다(json object array 타입).
  - **"delete"**: 삭제된 데이터를 반환합니다(json object array 타입).

> **주의**: data 메서드로 가져온 데이터를 다른 데이터 관련 컴포넌트에 바인딩할 때는 반드시 "false"로 설정하여 원래 유형의 데이터를 바인딩해야 양방향 데이터 바인딩이 활성화됩니다.

- **propName1, propName2, ...** (string, 선택적): data 메서드의 두 번째 인수부터 n 번째 인수까지 데이터의 프로퍼티명을 인수로 지정하면 지정한 프로퍼티 값만 추출한 객체를 반환합니다. 첫 번째 인수를 "modified", "selected", "checked", "insert", "update", "delete"로 지정했을 때만 작동됩니다.

```javascript
var listInst = N([]).list(".context")
    .bind([{ col01 : "", col02 : "", col03 : "", col04 : "", col05 : "", col06 : "" }]);
listInst.data("modified", "col01", "col02", "col03");
    // [{ col01 : "", col02 : "", col03 : "" }]
```

### context
```javascript
listInstance.context([selector]);
```

context 요소를 반환합니다.

- **selector** (string, 선택적): jQuery selector 구문을 입력하면 context 요소에서 지정한 요소를 찾아서 반환합니다.

### contextBodyTemplate
```javascript
listInstance.contextBodyTemplate([selector]);
```

context 옵션으로 지정한 요소의 행 요소(li)를 반환합니다. 반환된 요소를 수정한 다음 bind 함수를 실행하면 수정된 요소로 행들이 생성됩니다.

- **selector** (string, 선택적): jQuery selector 구문을 입력하면 contextBodyTemplate 요소에서 지정한 요소를 찾아서 반환합니다.

### bind
```javascript
listInstance.bind([data][, "append"]);
```

context 옵션으로 지정한 요소 안에서 id 속성 값을 갖고 있는 요소들에 데이터를 바인딩하고 data의 길이만큼 행 요소를 생성합니다.

- **data** (json object array, 선택적): 바인딩할 데이터를 지정합니다.
- **"append"** (string, 선택적): "append" 문자열을 인수로 설정하여 바인딩하면 이전에 바인딩된 데이터와 새로 바인딩한 데이터를 병합하고 이전에 생성된 행 요소에 새로운 행 요소를 추가해 줍니다.

> **주의**: "append" 인수 값이 설정되면 scrollPaging.size 옵션 값이 자동으로 0으로 지정되어 스크롤 페이징 기능이 비활성화됩니다.

### add
```javascript
listInstance.add([data][, row]);
```

새로운 행 요소와 데이터를 추가합니다. 행 데이터 생성 시 context 요소 안에 있는 입력 요소들의 id 속성명과 값으로 데이터 객체를 생성합니다.

- **data** (object|number, 선택적): data 객체를 지정하면 생성된 데이터와 지정한 data가 병합되어 바인딩됩니다. data 인수가 number 타입이면 row(arguments[1]) 인수로 지정됩니다.
- **row** (number, 선택적): 새로운 데이터가 추가될 행 인덱스를 row 인수로 지정하면 지정한 행 인덱스 바로 앞에 행 데이터와 행 요소가 추가됩니다.

### remove
```javascript
listInstance.remove([row]);
```

행 요소와 데이터를 제거합니다.

- **row** (number|array[number], 선택적): 제거할 행의 index를 지정합니다. 행 index를 array에 담아 row 인수로 지정하면 한번에 여러 행을 제거합니다.

> **주의**: rowStatus가 "insert"인 경우 행 데이터를 제거하고, 그렇지 않으면 rowStatus를 "delete"로 변경합니다.

### revert
```javascript
listInstance.revert([row]);
```

최초 바인딩된 초기 데이터나 add 시 생성된 초기 데이터로 되돌립니다.

- **row** (number|array[number], 선택적): 되돌릴 행 index를 지정합니다. row 인수에 행 index를 지정하면 지정된 행 데이터만 되돌리고 row 인수를 입력하지 않으면 전체 행 데이터를 되돌립니다. 행 index를 array에 담아 row 인수로 지정하면 한번에 여러 행을 되돌립니다.

### validate
```javascript
listInstance.validate([row]);
```

추가/수정된 전체 데이터에 대한 유효성 검증 결과를 반환합니다. 유효성 검증 성공 시 true를 반환하고 실패 시 false가 반환되면서 해당 입력 요소 옆에 툴팁으로 실패 메시지를 표시합니다.

- **row** (number, 선택적): row 인수에 행 index를 지정하면 지정된 행 데이터만 유효성 검증되고 row 인수를 입력하지 않으면 전체 행 데이터의 유효성이 검사됩니다.

### val
```javascript
listInstance.val(row, key[, val]);
```

컴포넌트에 바인딩되어 있는 데이터의 프로퍼티 값을 얻어오거나 설정합니다.

- **row** (number): 행 index
- **key** (string): 바인딩된 데이터 객체의 프로퍼티명
- **val** (string|number|boolean|null, 선택적): 설정 값. val 인수가 설정되면 지정된 값을 바인딩된 데이터에 세팅하거나 추가하고 val 인수가 설정되지 않으면 지정된 값을 얻어옵니다.

> **주의**: 데이터 값이 바인딩된 요소가 있으면 null은 빈 문자열로, number 타입은 숫자 문자열로, boolean은 "true"나 "false" 문자열로 변환되어 설정됩니다. 바인딩된 요소가 없으면 설정한 값의 원래 타입으로 저장됩니다.

### select
```javascript
listInstance.select([row][, isAppend]);
```

행을 선택하거나 선택된 행의 index를 반환합니다.

- **row** (number|array[number], 선택적): 선택할 행 index를 지정합니다. 행 index를 array에 담아 row 인수로 지정하면 한번에 여러 행을 선택합니다. 첫 번째 인수(row)를 입력하지 않으면 선택된 행들의 index들을 반환하고 입력하면 지정된 행을 선택합니다.
- **isAppend** (boolean, 선택적): 입력하지 않거나 false를 입력하면 선택된 행들을 모두 선택 해제한 후에 선택하고 true를 입력하면 기존 선택에 추가로 선택합니다.

> **주의**: select 메서드를 사용하려면 select나 multiselect 옵션이 true로 설정되어 있어야 합니다.

### check
```javascript
listInstance.check([row][, isAppend]);
```

checkAllTarget과 checkSingleTarget 옵션으로 지정한 요소들을 체크하거나 체크된 행의 index를 반환합니다.

- **row** (number|array[number], 선택적): 체크할 행 index를 지정합니다. 행 index를 array에 담아 row 인수로 지정하면 한번에 여러 행을 체크합니다. 첫 번째 인수(row)를 입력하지 않으면 체크된 행들의 index들을 반환하고 입력하면 지정된 행을 체크합니다.
- **isAppend** (boolean, 선택적): 입력하지 않거나 false를 입력하면 체크된 요소들을 모두 체크 해제한 후에 체크하고 true를 입력하면 기존 체크에 추가로 체크합니다.

### move
```javascript
listInstance.move(fromRow, toRow);
```

선택한 행 요소와 데이터를 이동합니다.

- **fromRow** (number): 이동할 행의 index를 입력합니다.
- **toRow** (number): 이동할 위치의 행 index를 입력합니다.

> **주의**: 지정한 행 바로 이전으로 이동됩니다. 마지막 행으로 이동하려면 마지막 행 index 값에 1을 더해서 입력해 주세요. 입력한 값이 바인딩되어 있는 데이터의 전체 행 수보다 클 경우 항상 마지막 행 다음으로 이동됩니다.

### copy
```javascript
listInstance.copy(fromRow, toRow);
```

선택한 행 요소와 데이터를 복사합니다.

- **fromRow** (number): 복사할 행의 index를 입력합니다.
- **toRow** (number): 복사할 위치의 행 index를 입력합니다.

> **주의**: 지정한 행 바로 이전으로 복사됩니다. 마지막 행으로 복사하려면 마지막 행 index 값에 1을 더해서 입력해 주세요. 입력한 값이 바인딩되어 있는 데이터의 전체 행 수보다 클 경우 항상 마지막 행 다음으로 복사됩니다.

## 예제

### 기본 List 생성 및 데이터 바인딩

```html
<ul id="basic-list">
    <li>
        <span id="name"></span>
        <span id="age"></span>
        <span id="email"></span>
    </li>
</ul>

<script type="text/javascript">
    // 데이터 객체
    var data = [
        {
            "name": "홍길동",
            "age": 30,
            "email": "hong@example.com"
        },
        {
            "name": "김철수",
            "age": 25,
            "email": "kim@example.com"
        },
        {
            "name": "이영희",
            "age": 28,
            "email": "lee@example.com"
        }
    ];
    
    // List 컴포넌트 생성 및 데이터 바인딩
    var list = N(data).list("#basic-list").bind();
</script>
```

### 행 선택 기능 추가

```html
<ul id="selectable-list">
    <li>
        <span id="name"></span>
        <span id="age"></span>
        <span id="email"></span>
    </li>
</ul>

<script type="text/javascript">
    // 데이터 객체
    var data = [
        {
            "name": "홍길동",
            "age": 30,
            "email": "hong@example.com"
        },
        {
            "name": "김철수",
            "age": 25,
            "email": "kim@example.com"
        }
    ];
    
    // List 컴포넌트 생성 및 데이터 바인딩 (행 선택 기능 추가)
    var list = N(data).list({
        context: "#selectable-list",
        select: true,
        onSelect: function(rowIdx, rowEle, rowData) {
            console.log("선택된 행:", rowIdx);
            console.log("선택된 데이터:", rowData);
        }
    }).bind();
    
    // 프로그래밍 방식으로 행 선택
    list.select(0);
</script>
```

### 체크박스 통합 기능

```html
<div>
    <input type="checkbox" id="check-all"> <label for="check-all">모두 선택</label>
</div>

<ul id="checkbox-list">
    <li>
        <input type="checkbox" class="row-check">
        <span id="name"></span>
        <span id="age"></span>
    </li>
</ul>

<script type="text/javascript">
    // 데이터 객체
    var data = [
        { "name": "홍길동", "age": 30 },
        { "name": "김철수", "age": 25 }
    ];
    
    // List 컴포넌트 생성 및 데이터 바인딩 (체크박스 통합 기능)
    var list = N(data).list({
        context: "#checkbox-list",
        checkAll: $("#check-all"),
        checkAllTarget: ".row-check"
    }).bind();
    
    // 체크된 데이터 확인
    $("#check-button").on("click", function() {
        var checkedData = list.data("checked");
        console.log("체크된 데이터:", checkedData);
    });
</script>
```

### 스크롤 페이징

```html
<ul id="scroll-paging-list" style="height: 300px; overflow-y: auto;">
    <li>
        <span id="name"></span>
        <span id="age"></span>
        <span id="email"></span>
    </li>
</ul>

<script type="text/javascript">
    // 대량의 데이터
    var data = [];
    for (var i = 0; i < 1000; i++) {
        data.push({
            "name": "사용자" + i,
            "age": 20 + Math.floor(Math.random() * 30),
            "email": "user" + i + "@example.com"
        });
    }
    
    // List 컴포넌트 생성 및 데이터 바인딩 (스크롤 페이징 기능)
    var list = N(data).list({
        context: "#scroll-paging-list",
        scrollPaging: {
            size: 50 // 한 페이지당 50개씩 로드
        },
        onBind: function(context, data, isFirstPage, isLastPage) {
            console.log("페이지 로드 - 첫 페이지:", isFirstPage, "마지막 페이지:", isLastPage);
        }
    }).bind();
</script>
```

### 데이터 편집 및 유효성 검증

```html
<ul id="edit-list">
    <li>
        <input id="name" type="text" data-validate='[["required"]]'>
        <input id="age" type="number" data-validate='[["required"], ["number"]]'>
        <input id="email" type="text" data-validate='[["required"], ["email"]]'>
        <button class="update-btn">저장</button>
    </li>
</ul>

<button id="add-row">행 추가</button>
<button id="validate-all">전체 검증</button>

<script type="text/javascript">
    // 데이터 객체
    var data = [
        { "name": "홍길동", "age": 30, "email": "hong@example.com" }
    ];
    
    // List 컴포넌트 생성 및 데이터 바인딩
    var list = N(data).list({
        context: "#edit-list",
        validate: true,
        revert: true,
        rowHandler: function(rowIdx, rowEle, rowData) {
            // 각 행에 버튼 이벤트 추가
            $(rowEle).find(".update-btn").on("click", function() {
                if (list.validate(rowIdx)) {
                    console.log("저장된 데이터:", list.data("modified"));
                }
            });
        }
    }).bind();
    
    // 새 행 추가
    $("#add-row").on("click", function() {
        list.add();
    });
    
    // 전체 유효성 검증
    $("#validate-all").on("click", function() {
        if (list.validate()) {
            console.log("모든 데이터 유효함");
        } else {
            console.log("유효하지 않은 데이터가 있음");
        }
    });
</script>
```