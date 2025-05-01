# Natural-JS Form 컴포넌트 개발자 가이드

Form(N.form)은 context 옵션으로 지정한 요소(div, table 등의 block 요소)에 단건 로우 데이터를 바인딩하거나 생성하는 UI 컴포넌트입니다.

## 목차

1. [개요](#개요)
2. [생성자](#생성자)
3. [기본 옵션](#기본-옵션)
4. [선언형 옵션](#선언형-옵션)
5. [함수](#함수)
6. [예제](#예제)

## 개요

Form(N.form)은 context 옵션으로 지정한 요소(div, table 등의 block 요소)에 단건 로우 데이터를 바인딩하거나 생성하는 UI 컴포넌트입니다. 폼 요소와 데이터 간의 매핑과 데이터 바인딩, 유효성 검증 등을 간편하게 처리할 수 있도록 도와줍니다.

주요 특징:
- Natural-DATA 패키지의 컴포넌트들과 연동하여 데이터 포맷팅 및 입력 데이터의 유효성 검증 프로세스를 단순화합니다.
- 바인딩된 데이터 오브젝트의 프로퍼티명(컬럼명)과 요소의 id 속성 값이 일치하면 데이터가 바인딩됩니다.
- 데이터가 요소에 바인딩되어야 데이터 포맷팅과 유효성 검증이 활성화됩니다.
- 입력 요소의 값을 변경하거나 val 메서드로 데이터가 변경되면 rowStatus 프로퍼티가 생성되고 입력은 "insert", 수정은 "update", 삭제는 "delete" 값이 입력됩니다.

> **주의**: N.form의 context 요소 안에 있는 요소를 N.form이나 데이터 관련 컴포넌트(N.grid, N.list 등)의 context로 다시 지정하면 오류가 발생하거나 데이터 동기화에 문제가 생길 수 있습니다. N.form의 context 요소들을 중복되지 않게 나누어 지정하거나 컬럼 데이터가 중복되지 않게 데이터를 나누어서 바인딩해야 합니다.

> **주의**: 이미 생성된 폼 요소에 add()를 한 후 bind()하거나 bind() 한 후 add() 또는 bind() 후 bind()하면 폼의 입력 요소의 데이터 동기화 로직에 문제가 생길 수 있습니다. 이때는 반드시 중간에 unbind 메서드를 실행해 주세요.
```javascript
var formInst = N([]).form().add();
formInst.unbind().bind(0, [{ "col01" : "abcd" }])
```

## 생성자

### N.form
```javascript
var form = new N.form(data, opts|context);
```

Form 컴포넌트의 인스턴스를 생성합니다.

- **data** (json object array): 컴포넌트에 바인딩할 데이터
- **opts|context** (object | jQuery selector string | jQuery object): 컴포넌트의 기본 옵션 객체 또는 context 요소

### N(obj).form
```javascript
var form = N(data).form(opts|context);
```

N.form의 객체 인스턴스를 jQuery 플러그인 방식으로 생성합니다. N() 함수의 첫 번째 인수가 new N.form 생성자의 첫 번째 인수로 설정됩니다.

## 기본 옵션

| 이름 | 타입 | 기본값 | 필수 | 설명 |
|------|------|--------|------|------|
| data | json object array | undefined | O | N.form에 바인딩할 데이터를 지정합니다. N.form은 단일 데이터를 표현하는 컴포넌트이지만 바인딩되는 데이터는 json object array 타입입니다. |
| row | number | -1 | X | data옵션으로 지정한 목록 데이터에서 폼에 바인딩할 행의 index 값을 입력합니다. 기본값은 –1이지만 값을 입력하지 않으면 0으로 세팅되어 목록 데이터의 첫 번째 행 데이터를 바인딩합니다. |
| context | jQuery object\|jquery selector string | null | O | N.form을 적용할 context 요소를 지정합니다. N.form의 context 요소는 table, div, section 등 영역을 표현하는 태그로 작성하면 됩니다. **데이터의 프로퍼티명과 요소의 id 속성 값이 같으면 데이터가 바인딩됩니다.** |
| validate | boolean | true | X | false로 설정하면 입력 요소에서 focus-out 되었을 때 입력 값에 대한 유효성 검증을 실행하지 않습니다. |
| html | boolean | false | X | true로 설정하면 data를 bind 할 때 데이터의 HTML이 적용됩니다. |
| revert | boolean | false | X | true로 설정하면 revert 기능이 활성화되고 revert 메서드를 사용할 수 있습니다. revert 기능이 활성화되면 최초 바인딩된 데이터가 메모리에 적제되므로 메모리 사용량이 증가합니다. |
| unbind | boolean | true | X | true로 설정하면 unbind 기능이 활성화되고 unbind 메서드를 사용할 수 있습니다. unbind 기능이 활성화되면 최초 바인딩된 데이터가 메모리에 적제되므로 메모리 사용량이 증가합니다. |
| autoUnbind | boolean | false | X | true로 설정하면 폼에 데이터를 바인딩하거나 생성 한 다음 같은 폼 요소에 다시 데이터를 바인딩하기 전에 unbind 메서드를 자동으로 호출해 주어서 폼 요소를 재 활용할 수 있게 해 줍니다. |
| addTop | boolean | false | X | true로 설정하면 add 메서드를 호출했을 때 로우 데이터가 데이터 목록의 맨 앞에 추가됩니다. |
| tpBind | boolean | false | X | true로 설정하면 컴포넌트 초기화 전에 입력 요소에 바인딩되어 있는 이벤트와 format, validate, dataSync 등의 컴포넌트 이벤트의 충돌을 방지해 줍니다. |
| fRules | object | null | X | 대상 요소의 data-format 속성이 아닌 객체 타입으로 format 룰을 지정합니다. |
| vRules | object | null | X | 대상 요소의 data-validate 속성이 아닌 객체 타입으로 유효성 검증 룰을 지정합니다. |
| onBeforeBindValue | function | null | X | 데이터 프로퍼티 값이 요소에 바인딩되기 전에 실행되는 이벤트 핸들러를 정의합니다. |
| onBindValue | function | null | X | 데이터 프로퍼티 값이 요소에 바인딩된 후에 실행되는 이벤트 핸들러를 정의합니다. |
| onBeforeBind | function | null | X | 폼에 데이터가 바인딩되기 전에 실행되는 이벤트 핸들러를 정의합니다. |
| onBind | function | null | X | 데이터가 바인딩이 완료된 후에 실행되는 이벤트 핸들러를 정의합니다. |

## 선언형 옵션

Form 컴포넌트는 HTML 요소에 직접 data-* 속성을 통해 다양한 옵션을 지정할 수 있습니다. 특히 Natural-DATA 패키지의 컴포넌트(Formatter, Validator)와 연동하여 입력 데이터의 포맷팅 및 유효성 검증을 선언적으로 지정할 수 있습니다.

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
formInstance.data([selFlag][, propName1, propName2, ...]);
```

컴포넌트에 바인딩된 최신 데이터를 반환합니다.

- **selFlag** (boolean, 선택적): 반환되는 데이터의 타입을 결정하는 구분 값입니다.
  - **undefined**: json object array 타입의 데이터를 반환합니다. (selFlag 옵션이 지정되지 않은 경우)
  - **true**: 폼에 바인딩되어 있는 데이터만 추출하여 반환합니다.
  - **false**: 컴포넌트에 바인딩되어 있는 jQuery object[json object array] 타입의 원래 유형의 데이터를 반환합니다.

> **주의**: data 메서드로 가져온 데이터를 다른 데이터 관련 컴포넌트에 바인딩할 때는 반드시 "false"로 설정하여 원래 유형의 데이터를 바인딩해야 양방향 데이터 바인딩이 활성화됩니다.

- **propName1, propName2, ...** (string, 선택적): data 메서드의 두 번째 인수부터 n 번째 인수까지 데이터의 프로퍼티명을 인수로 지정하면 지정한 프로퍼티 값만 추출한 객체를 반환합니다. 첫 번째 인수를 true로 지정했을 때만 작동됩니다.

```javascript
var formInst = N([]).form(".context")
    .bind(0, [{ col01 : "", col02 : "", col03 : "", col04 : "", col05 : "", col06 : "" }]);
formInst.data(true, "col01", "col02", "col03");
    // [{ col01 : "", col02 : "", col03 : "" }]
```

### row
```javascript
formInstance.row([before]);
```

바인딩되어 있는 데이터 배열에서 Form 에 바인딩된 데이터의 index를 반환합니다.

- **before** (string, 선택적): "before"를 지정하면 직전에 바인딩된 데이터의 인덱스를 반환합니다.

### context
```javascript
formInstance.context([selector]);
```

context 요소를 반환합니다.

- **selector** (string, 선택적): jQuery selector 구문을 입력하면 context 요소에서 지정한 요소를 찾아서 반환합니다.

### bind
```javascript
formInstance.bind([row][, data][, propName1, propName2, ...]);
```

context 옵션으로 지정한 요소 안에서 id 속성 값을 갖고 있는 요소들에 데이터를 바인딩합니다.

- **row** (number, 선택적): 지정한 data(json object array)에서 바인딩할 데이터 오브젝트의 행 index를 설정합니다.
- **data** (json object array, 선택적): 바인딩할 데이터를 지정합니다.
- **propName1, propName2, ...** (string, 선택적): bind 메서드의 세 번째 인수부터 n 번째 인수까지 데이터의 프로퍼티명을 지정하면 프로퍼티명과 id 속성 값이 일치하는 요소만 데이터가 바인딩됩니다.

```javascript
// 바인딩할 데이터
var data = [{ col01 : "", col02 : "", col03 : "", col04 : "", col05 : "", col06 : "" }]
// "col01", "col02", "col03" id 속성 값을 갖고 있는 요소에만 바인딩.
formInstance.bind(0, data, "col01", "col02", "col03");
```

> **주의**: data 만 바꿔서 다시 바인딩하면 N.form이 제대로 동작하지 않을 수 있습니다. 데이터가 바인딩된 context 요소에 다시 바인딩할 때는 unbind 메서드를 먼저 실행한 다음 bind 메서드를 실행해야 합니다.

### unbind
```javascript
formInstance.unbind();
```

context로 지정한 요소에서 N.form 관련 이벤트나 상태, 스타일등을 제거하여 bind 하기 전 상태로 되돌려 줍니다.

> **주의**: 폼에 바인딩되어있는 data는 제거되지 않고 선택된 row 값(this.options.row)도 그대로 유지됩니다.

### add
```javascript
formInstance.add([data][, row]);
```

새로운 행 데이터를 추가합니다. 행 데이터 생성 시 context 요소 안에 있는 입력 요소들의 id 속성명과 값으로 데이터 객체를 생성합니다.

- **data** (object|number, 선택적): data 객체를 지정하면 생성된 데이터와 지정 한 data가 병합되어 바인딩됩니다. data 인수가 number 타입이면 row(arguments[1]) 인수로 지정됩니다.
- **row** (number, 선택적): 새로운 데이터가 추가될 행 인덱스를 row 인수로 지정하면 지정한 행 인덱스 바로 앞에 행 데이터가 추가됩니다.

> **주의**: N.form 초기화 후 add 메서드를 실행하면 새로 생성된 데이터로 바인딩됩니다.

### remove
```javascript
formInstance.remove();
```

데이터 배열에서 Form 에 바인딩된 데이터 개체를 제거합니다.

> **주의**: rowStatus 가 "insert" 인 경우 행 데이터를 제거하고, 그렇지 않으면 rowStatus 를 "delete"로 변경합니다.

### revert
```javascript
formInstance.revert();
```

최초 바인딩된 초기 데이터나 add 시 생성된 초기 데이터로 되돌립니다.

### validate
```javascript
formInstance.validate();
```

추가/수정된 전체 데이터에 대한 유효성 검증 결과를 반환합니다. 유효성 검증 성공 시 true를 반환하고 실패 시 false가 반환되면서 해당 입력 요소 옆에 툴팁으로 실패 메시지를 표시합니다.

### val
```javascript
formInstance.val(key[, val]);
```

컴포넌트에 바인딩되어 있는 데이터의 프로퍼티 값을 얻어오거나 설정합니다.

- **key** (string): 바인딩된 데이터 객체의 프로퍼티명
- **val** (string|number|boolean|null, 선택적): 설정 값. val 인수가 설정되면 지정된 값을 바인딩된 데이터에 세팅하거나 추가하고 val 인수가 설정되지 않으면 지정된 값을 얻어옵니다.

> **주의**: 데이터 값이 바인딩된 요소가 있으면 null 은 빈 문자열로, number 타입은 숫자 문자열로, boolean 은 "true" 나 "false" 문자열로 변환되어 설정됩니다. 바인딩된 요소가 없으면 설정한 값의 원래 타입으로 저장됩니다.

## 예제

### 기본 폼 생성 및 데이터 바인딩

```html
<table id="form-example">
    <tr>
        <th><label for="name">이름</label></th>
        <td><input id="name" type="text" data-validate='[["required"]]'></td>
    </tr>
    <tr>
        <th><label for="email">이메일</label></th>
        <td><input id="email" type="text" data-validate='[["required"], ["email"]]'></td>
    </tr>
    <tr>
        <th><label for="age">나이</label></th>
        <td><input id="age" type="number" data-validate='[["required"], ["number"]]'></td>
    </tr>
</table>

<script type="text/javascript">
    // 데이터 객체
    var data = [{
        "name": "홍길동",
        "email": "hong@example.com",
        "age": 30
    }];
    
    // Form 컴포넌트 생성 및 데이터 바인딩
    var form = N(data).form("#form-example").bind();
    
    // 유효성 검증
    if (form.validate()) {
        console.log("유효성 검증 성공");
    }
    
    // 데이터 가져오기
    var formData = form.data(true);
    console.log(formData);
</script>
```

### 새 데이터 추가하기

```javascript
// 빈 데이터로 Form 인스턴스 생성
var form = N([]).form("#form-example");

// 새 데이터 추가 (빈 폼 생성)
form.add();

// 사용자가 폼을 작성한 후, 데이터 검증 및 저장
if (form.validate()) {
    var newData = form.data(true);
    console.log("새 데이터:", newData);
}
```

### 데이터 수정 및 되돌리기

```javascript
// 데이터를 가진 Form 인스턴스 생성
var form = N(data).form("#form-example", {
    revert: true // revert 기능 활성화
}).bind();

// 데이터 수정
form.val("name", "김철수");
form.val("age", 25);

// 원래 데이터로 되돌리기
form.revert();
```

### 데이터 바인딩 해제 및 재바인딩

```javascript
// 데이터를 가진 Form 인스턴스 생성
var form = N(data).form("#form-example", {
    unbind: true // unbind 기능 활성화
}).bind();

// 바인딩 해제
form.unbind();

// 새 데이터로 재바인딩
var newData = [{
    "name": "이영희",
    "email": "lee@example.com",
    "age": 28
}];
form.bind(0, newData);
```