# Natural-JS Select 컴포넌트 개발자 가이드

Natural-JS의 Select(N.select)는 select, input[type=checkbox], input[type=radio] 요소에 데이터를 바인딩하여 선택 기능을 구현하고 해당 컨트롤의 기능을 확장하는 UI 컴포넌트입니다.

## 개요

Select 컴포넌트는 다양한 HTML 선택 요소(select, checkbox, radio)에 데이터를 쉽게 바인딩하고, 선택된 값을 가져오거나 설정하는 기능을 제공합니다. 이 컴포넌트를 사용하면 데이터 기반의 동적인 선택 요소를 쉽게 구현할 수 있습니다.

## 생성자(Constructor)

### N.select

```javascript
var select = new N.select(data, opts|context);
```

- **data** (json object array): data 옵션을 설정합니다. 기본 옵션의 data 옵션과 동일합니다.
- **opts|context** (object | jQuery selector string | jQuery object): 컴포넌트의 기본 옵션 객체를 지정합니다. jQuery 셀렉터 문자열 또는 jQuery 객체를 입력하면 기본 옵션의 context 옵션으로 설정됩니다.
- **반환 값**: N.select 인스턴스

### N(obj).select

jQuery 플러그인 메서드로 N.select 객체 인스턴스를 생성합니다.

```javascript
var select = N(data).select(opts|context);
```

- **opts|context** (object | jQuery Selector(string | jQuery object)): N.select 함수의 두번째 인자(opts)와 동일합니다.
- **반환 값**: N.select 인스턴스

`new N.select()`로 생성한 인스턴스와 `N().select`로 생성한 인스턴스는 객체 인스턴스를 생성하는 방법만 다를 뿐 동일합니다. N() 함수의 첫 번째 인자는 new N.select 생성자의 첫 번째 인자로 설정됩니다.

## 기본 옵션(Default Options)

| 옵션명 | 타입 | 기본값 | 필수 여부 | 설명 |
|--------|------|--------|-----------|------|
| data | json object array | undefined | O | N.select에 바인딩할 데이터를 지정합니다. |
| context | jQuery 객체 또는 jQuery 셀렉터 문자열 | null | O | N.select를 적용할 context 요소를 지정합니다.<br>N.select의 context 요소는 select 또는 input[type=checkbox] 또는 input[type=radio]로 작성해야 합니다.<br><br>```html<br><select class="select-context"><br>    <option value="">Select</option><br></select><br><select class="select-context" multiple="multiple"></select><br><input class="select-context" type="radio"><br><input class="select-context" type="checkbox">``` |
| key | string | null | O | 선택 요소의 이름(name) 속성에 바인딩할 데이터의 속성 이름을 지정합니다. |
| val | string | null | O | 선택 요소의 값(value) 속성에 바인딩할 데이터의 속성 이름을 지정합니다. |
| append | boolean | true | X | false로 설정하면 select 요소의 기본 옵션을 비우고 데이터를 바인딩합니다. |
| direction | string | h | X | context가 input[type=checkbox] 또는 input[type=radio]인 경우, 선택 요소의 배치 방향을 설정합니다.<br>h : 수평(horizontal)<br>v : 수직(vertical) |

## 메서드(Methods)

### data

```javascript
select.data([selFlag]);
```

- **selFlag** (boolean, 선택 사항): 반환되는 데이터 유형을 결정하는 구분 값입니다.
  - **undefined** (selFlag 옵션이 지정되지 않은 경우): json object array 유형의 데이터를 반환합니다.
  - **true**: 현재 선택된 행 데이터만 추출하여 배열 유형으로 반환합니다.
  - **false**: 컴포넌트에 바인딩된 원래 유형의 jQuery 객체[json object array] 유형의 데이터를 반환합니다.
    - data 메서드로 가져온 데이터를 다른 데이터 관련 컴포넌트에 바인딩할 때는 양방향 데이터 바인딩을 가능하게 하기 위해 원래 유형의 데이터를 바인딩할 수 있도록 반드시 "false"를 설정해야 합니다.
- **반환 값**: json object array | jQuery object[json object array] (컴포넌트에 바인딩된 최신 데이터를 반환합니다.)

### context

```javascript
select.context([selector]);
```

- **selector** (string, 선택 사항): jQuery 셀렉터 문법을 입력하면 context 요소에서 지정된 요소를 찾아 반환합니다.
- **반환 값**: jQuery object (context 요소를 반환합니다.)

### bind

```javascript
select.bind([data]);
```

- **data** (json object array, 선택 사항): 바인딩할 데이터를 지정합니다.
- **반환 값**: N.select (context 옵션으로 지정된 요소에 데이터를 바인딩합니다.)

context 요소가 checkbox인 경우, 요소의 상태가 checked이면 데이터가 바인딩될 때 생성된 요소도 checked 상태로 생성됩니다.

데이터가 radio 또는 checkbox input 요소에 바인딩되면, context로 설정된 요소는 id 속성과 name 속성을 가지며, 추가로 생성된 옵션 요소에는 name 속성만 추가됩니다. 이벤트를 생성된 checkbox 또는 radio에 바인딩할 때 id 셀렉터로 요소를 선택하면 첫 번째 옵션 요소에만 이벤트가 적용되므로, name 속성으로 요소를 선택하세요.

```javascript
$("input[name='name']").on("click", function(e) { ... });
```

### val

```javascript
select.val([val]);
```

- **val** (string, 선택 사항): 선택할 옵션의 값입니다. 값이 제공되지 않으면 현재 선택된 옵션 요소의 값을 가져옵니다.
- **반환 값**: string|array (선택된 옵션 요소의 값을 가져오거나 옵션을 선택합니다.)

### index

```javascript
select.index([index]);
```

- **index** (number|array[number], 선택 사항): 선택할 옵션의 인덱스입니다. 값이 제공되지 않으면 현재 선택된 옵션 요소의 인덱스를 가져옵니다.
- **반환 값**: number|array (선택된 옵션 요소의 인덱스를 가져오거나 옵션을 선택합니다.)

### remove

```javascript
select.remove(val);
```

- **val** (number): val 인수로 지정된 값과 동일한 선택적 요소 및 데이터 개체를 제거합니다.
- **반환 값**: N.select

### reset

```javascript
select.reset([selFlag]);
```

- **selFlag** (boolean, 선택 사항): 
  - select 요소의 경우 true로 설정하면 아무것도 선택되지 않고, false로 설정하면 기본(첫 번째) 옵션 요소가 선택됩니다.
- **반환 값**: N.select (선택을 초기화합니다.)

## 예제(Examples)

### ⊙예제 데이터
```javascript
var data = [{
        "key" : "blue",
        "val" : "blue"
    },{
        "key" : "brown",
        "val" : "brown"
    },{
        "key" : "green",
        "val" : "green"
}]
```

key 및 val 옵션은 [Config(natural.config.js)](https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0102.html)에서 다음과 같이 전역 옵션으로 설정함으로써 `N(data).select(".eyeColor").bind();`로 편리하게 사용할 수 있습니다:

```javascript
N.context.attr("ui", {
    ...
    "select": {
        "key": "key",
        "val": "val"
    }
    ...
});
```

다음 예제들은 [Config(natural.config.js)](https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0102.html)가 위와 같이 구성되어 있다고 가정합니다. 그렇지 않은 경우 컴포넌트를 초기화할 때 key 및 val 옵션을 설정해야 합니다.

### 1. select 요소에 데이터 바인딩하기

예제 1-4에서 context 요소는 다르지만 컴포넌트 초기화 방법은 동일합니다.

```html
<select class="eyeColor">
    <option>Select</option>
</select>
<script type="text/javascript">
    N(data).select(".eyeColor").bind();
</script>
```

### 1.1. select 요소에 데이터 바인딩하고 "brown"을 기본값으로 선택하기

```html
<select class="eyeColor">
    <option>Select</option>
</select>
<script type="text/javascript">
    N(data).select(".eyeColor").bind().val("brown");
</script>
```

### 2. select[multiple=multiple] 요소에 데이터 바인딩하기

```html
<select class="eyeColor" multiple="multiple"></select>
<script type="text/javascript">
    N(data).select(".eyeColor").bind();
</script>
```

### 2.1. select[multiple=multiple] 요소에 데이터 바인딩하고 "brown"과 "green"을 기본값으로 선택하기

```html
<select class="eyeColor" multiple="multiple"></select>
<script type="text/javascript">
    N(data).select(".eyeColor").bind().val(["brown", "green"]);
</script>
```

### 3. input[type=radio] 요소에 데이터 바인딩하기

```html
<input class="eyeColor" type="radio">
<script type="text/javascript">
    N(data).select(".eyeColor").bind();
</script>
```

### 3.1. input[type=radio] 요소에 데이터 바인딩하고 "brown"을 기본값으로 선택하기

```html
<input class="eyeColor" type="radio">
<script type="text/javascript">
    N(data).select(".eyeColor").bind().val("brown");
</script>
```

### 4. input[type=checkbox] 요소에 데이터 바인딩하기

```html
<input class="eyeColor" type="checkbox">
<script type="text/javascript">
    N(data).select(".eyeColor").bind();
</script>
```

### 4.1. input[type=checkbox] 요소에 데이터 바인딩하고 "brown"과 "green"을 기본값으로 선택하기

```html
<input class="eyeColor" type="checkbox">
<script type="text/javascript">
    N(data).select(".eyeColor").bind().val(["brown", "green"]);
</script>
```