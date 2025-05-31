# jQuery Plugin 확장 메서드

jQuery plugin 형태로 제공되는 CORE 유틸리티 함수들은 다음과 같습니다.

## N("selector").instance

UI 컴포넌트의 context 요소나 View 요소에서 컴포넌트 객체의 인스턴스 또는 Controller object를 반환하거나 객체 인스턴스를 요소에 저장합니다.

> Natural-JS는 탭이나 팝업 등의 블록 콘텐츠를 쉽게 제어하기 위해서 컴포넌트나 라이브러리 초기화 시 지정한 템플릿(context 나 view) 요소에 생성된 객체 인스턴스를 저장합니다.

다음과 같이 인수의 개수와 타입에 따라서 다르게 작동됩니다:

1. 선택한 요소에 저장되어 있는 모든 인스턴스를 반환.
   
   반환된 인스턴스가 1이면 원래 인스턴스 객체가 반환됩니다. 인스턴스가 두 개 이상인 경우 배열에 저장되어 반환됩니다. 반환된 인스턴스가 없으면 undefined가 반환됩니다.
   
   ```javascript
   var all = N(".grid01", ".grid02").instance();
   ```

2. 선택한 요소에 저장되어 있는 모든 인스턴스를 콜백의 함수의 인수로 지정.
   
   > 인스턴스의 개수만큼 콜백 함수가 실행됩니다.
   
   ```javascript
   var all = N(".grid01", ".grid02").instance(function(instanceId, instance) {
       // this : instance
       // instanceId : 저장된 인스턴스의 식별자
       // instance : 저장된 인스턴스
   });
   ```

3. 선택한 요소에 instanceId가 "name"으로 저장되어 있는 모든 인스턴스를 반환.
   
   반환된 인스턴스가 1이면 원래 인스턴스 객체가 반환됩니다. 인스턴스가 두 개 이상인 경우 배열에 저장되어 반환됩니다. 반환된 인스턴스가 없으면 undefined가 반환됩니다.
   
   ```javascript
   var all = N(".grid01", ".grid02").instance("name");
   ```

4. 선택한 요소에 instanceId가 "name"으로 저장되어 있는 모든 인스턴스를 콜백 함수의 인수로 반환.
   
   > 인스턴스의 개수만큼 콜백 함수가 실행됩니다.
   
   ```javascript
   var all = N(".grid01", ".grid02").instance("name", function(instanceId, instance) {
       // this : instance
       // instanceId : 저장된 인스턴스의 식별자
       // instance : 저장된 인스턴스
   });
   ```

5. 선택한 요소에 instance를 "name"으로 저장.
   
   ```javascript
   N(".grid01").instance("name", instance);
   ```
   
   > 인스턴스 저장 시 instance 인수가 function 타입이면 정상작동하지 않을 수 있습니다. function 타입을 제외한 object 나 string과 같은 타입을 instance 인수로 지정해야 합니다.

### 매개변수

#### name

Type: string

인스턴스 명

미리 정의되어 있는 인스턴스 명은 다음과 같습니다:

- N.cont의 Controller object: cont
- N.alert의 instance: alert
  > .block_overlay_msg__ 요소에 저장되어 있음.
- N.button의 instance: button
- N.datepicker의 instance: datepicker
- N.popup의 instance: popup
  > 로드된 팝업 콘텐츠의 Controller object는 .block_overlay_msg__ > .msg_box__ > .view_context__ 요소에 저장되어 있음.
- N.tab의 instance: tab
  > 로드된 탭 콘텐츠의 Controller object는 .tab__ > .{tab 콘텐츠 요소 id} > .view_context__ 요소에 저장되어 있음.
- N.select의 instance: select
- N.form의 instance: form
- N.list의 instance: list
- N.grid의 instance: grid
- N.pagination의 instance: pagination
- N.tree의 instance: tree
- N.notify의 instance: notify
- N.docs의 instance: docs

> 인스턴스의 저장 위치가 별도로 명시되어 있지 않은 컴포넌트는 context 옵션으로 지정한 요소에 저장됩니다.

#### instance

Type: object|function

선택한 요소에 저장할 인스턴스나 인스턴스를 가져올 callback function.

> callback의 인수로 index(arguments[0])와 각각의 instance(arguments[1])가 반환됩니다. 이 callback function의 "this"는 각각의 instance를 가리킵니다.

## N("selector").tpBind

선택한 요소에 같은 이름의 이벤트 정의되어 있더라도 tpBind로 정의한 이벤트가 제일 먼저 실행되게해 줍니다.

기본적인 사용법은 [jQuery().bind](//api.jquery.com/bind) 메서드와 같습니다.

### 매개변수

#### event

Type: string

이벤트 유형

#### handler

Type: function

이벤트 핸들러

## N("selector").vals

select, select[multiple=multiple], input[type=radio], input[type=checkbox]와 같은 선택 요소의 선택된 값을 가져오거나 선택합니다.

- vals 인수를 입력하지 않으면 선택한 값이 반환됩니다. vals 인수가 지정되면 입력한 값과 일치하는 선택 요소가 선택됩니다.
- 하나만 선택하면 string 유형의 값이 하나만 반환되고 둘 이상인 경우 값이 배열로 반환됩니다.

> checkbox의 경우 선택지가 1개만 있다면 Y/N 또는 1/0과 같이 여부를 결정하는 모드로 작동하게 됩니다.
>
> 단일 선택의 표준 값이 Y/N 인지 1/0 인지 on/off 인지 설정은 natural.config.js의 **N.context.attr("core").sgChkdVal("체크 값")** 변수와 **N.context.attr("core").sgUnChkdVal("언체크 값")** 변수 값으로 설정할 수 있습니다.

### 매개변수

#### vals

Type: array|string|function

단일 값을 지정할 때는 문자열로 값을 지정하고 둘 이상의 선택지를 선택할 때는 배열에 문자열을 담아 값을 지정합니다.

function을 지정하면 선택된 선택지 요소 개수만큼 지정한 콜백 함수를 실행해 줍니다. 콜백 함수의 인수는 다음과 같습니다:

- this: 선택된 선택지 요소
- arguments[0]: 선택된 선택지 요소의 index
- arguments[1]: 선택된 선택지 요소

## N(array).remove_

인수로 지정한 array의 요소를 제거합니다.

### 매개변수

#### idx

Type: number

배열에서 제거할 요소의 Index

#### length

Type: number

제거할 배열 요소들의 개수

## N(selector).events

선택한 요소에 바인딩되어 있는 이벤트들을 반환합니다.

> eventType 인수와 namespace 인수를 둘 다 입력하지 않으면 모든 이벤트들을 반환하고 namespace를 입력하지 않으면 지정한 eventType에 해당하는 이벤트들만 반환합니다.
>
> namespace 인수가 입력되면 배열 객체 타입으로 이벤트를 반환하고 그렇지 않은 경우에는 jQuery object 타입으로 이벤트들을 반환합니다. 바인딩되어 있는 이벤트가 없으면 undefined를 반환합니다.

### 매개변수

#### eventType

Type: string

이벤트 유형

#### namespace

Type: string

이벤트 네임스페이스
