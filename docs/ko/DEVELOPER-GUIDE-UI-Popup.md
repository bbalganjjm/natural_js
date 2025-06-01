# Natural-JS Popup 컴포넌트 개발자 가이드

Natural-JS의 Popup(N.popup)은 context 옵션으로 지정한 페이지 내 요소나 url 옵션으로 지정한 페이지를 레이어 팝업으로 만들어주는 UI 컴포넌트입니다.

## 개요

Popup 컴포넌트는 기존 페이지의 요소를 팝업으로 표시하거나, 새로운 페이지를 로드하여 팝업으로 표시하는 기능을 제공합니다.

url 옵션으로 지정한 페이지로 팝업을 만들 때, 생성된 팝업의 Controller 객체에 caller(해당 팝업을 호출한 N.popup 인스턴스)와 opener(해당 팝업을 호출한 부모 페이지의 Controller 객체, 옵션으로 전달함) 속성이 추가됩니다. opener를 사용해 부모 페이지를 제어하거나, caller를 사용해 자기 자신을 닫거나 부모 Controller에게 데이터를 전송할 수 있습니다.

만약 Popup 대화상자가 표시되지 않고 오류가 발생한다면, [Config(natural.config.js)](https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0102.html)의 N.context.attr("ui").alert.container 속성에 N.alert 관련 요소가 저장될 요소를 jQuery 셀렉터 문자열로 지정해야 합니다.

## 목차
- [개요](#개요)
- [목차](#목차)
- [생성자(Constructor)](#생성자constructor)
- [기본 옵션(Default Options)](#기본-옵션default-options)
- [메서드(Methods)](#메서드methods)
- [예제(Examples)](#예제examples)

## 생성자(Constructor)

### N.popup

```javascript
var popup = new N.popup(context, opts);
```

- **context** (jQuery 객체 또는 jQuery 셀렉터 문자열): Popup이 적용될 요소를 설정합니다. 기본 옵션의 context 옵션과 동일합니다.
- **opts** (객체): 컴포넌트의 기본 옵션 객체를 지정합니다.
- **반환 값**: N.popup 인스턴스

### N(obj).popup

jQuery 플러그인 메서드로 N.popup 객체 인스턴스를 생성합니다.

```javascript
var popup = N(context).popup(opts);
```

- **opts** (객체): N.popup 함수의 두번째 인자(opts)와 동일합니다.
- **반환 값**: N.popup 인스턴스

`new N.popup()`로 생성한 인스턴스와 `N().popup`로 생성한 인스턴스는 객체 인스턴스를 생성하는 방법만 다를 뿐 동일합니다.

## 기본 옵션(Default Options)

| 옵션명 | 타입 | 기본값 | 필수 여부 | 설명 |
|--------|------|---------|-----------|------|
| context | jQuery 객체 또는 jQuery 셀렉터 문자열 | null | X | N.popup으로 생성할 페이지 내의 Block 요소를 지정합니다.<br>페이지 내 요소로 팝업을 만들기 때문에 url 옵션은 설정하지 않아야 합니다.<br>`N("context").popup();` |
| url | string | null | X | 팝업으로 생성할 페이지의 URL을 지정합니다.<br>팝업 페이지 로딩이 완료되면 팝업 페이지의 init 메서드가 호출됩니다.<br>다른 페이지를 로드하여 팝업을 만들기 때문에 context 옵션은 설정하지 않아야 합니다.<br>`N().popup("url");` |
| title | string | undefined | X | 팝업의 제목을 설정합니다. 설정하지 않으면 타이틀바가 생성되지 않습니다.<br>url 옵션이 설정된 경우, 로드할 페이지의 view 요소의 title 속성으로도 설정할 수 있습니다.<br>context를 지정하여 팝업을 생성할 때는 context 요소의 title 속성으로 설정할 수 있습니다. |
| button | boolean | true | X | false로 설정하면 기본 버튼(확인/취소 버튼) 관련 요소를 생성하지 않습니다. |
| okButtonOpts | object | true | X | 메시지 대화상자의 확인 버튼에 적용되는 N.button 컴포넌트의 옵션을 정의합니다. |
| cancelButtonOpts | object | true | X | 메시지 대화상자의 취소 버튼에 적용되는 N.button 컴포넌트의 옵션을 정의합니다. |
| closeMode | string | hide | X | 팝업이 닫힐 때 팝업 요소를 숨길지 제거할지 설정합니다.<br>hide: 이전 상태를 유지하기 위해 팝업 요소를 숨깁니다.<br>remove: 팝업 요소를 제거하여 상태를 초기화합니다. |
| modal | boolean | true | X | true로 설정하면 전체 화면을 덮고 팝업 컨텐츠를 제외한 모든 이벤트를 차단하는 오버레이 요소를 생성합니다. |
| top | number | undefined | X | 팝업의 상단(px) 위치를 지정합니다. |
| left | number | undefined | X | 팝업의 왼쪽(px) 위치를 지정합니다. |
| width | number 또는 function | 0 | X | 팝업의 너비를 지정합니다.<br>number 타입으로 설정하면 입력한 값(px)이 요소 너비로 설정됩니다.<br>function 타입으로 설정하면 msgContext(modal 옵션이 true일 때 화면을 덮는 요소)와 msgContents(메시지 내용 요소)가 인수로 전달되며, 반환되는 값이 요소의 너비로 설정됩니다.<br>```width: function(msgContext, msgContents) { return $(window).width(); }``` |
| height | number 또는 function | 0 | X | 제목 영역을 제외한 팝업의 내용 영역 높이를 지정합니다.<br>number 타입으로 설정하면 입력한 값(px)이 요소 높이로 설정됩니다.<br>function 타입으로 설정하면 msgContext(modal 옵션이 true일 때 화면을 덮는 요소)와 msgContents(메시지 내용 요소)가 인수로 전달되며, 반환되는 값이 요소의 높이로 설정됩니다.<br>```height: function(msgContext, msgContents) { return $(window).height() - msgContents.show().find(".msg_title_box__").height(); }``` |
| alwaysOnTop | boolean | false | X | true로 설정하면 팝업 대화상자가 항상 맨 위에 표시됩니다. |
| dynPos | boolean | true | X | false로 설정하면 브라우저 크기가 조정되거나 부모 컨텐츠의 높이가 동적으로 변경될 때 블록 오버레이의 크기와 팝업의 위치를 자동으로 조정하지 않습니다. |
| draggable | boolean | false | X | true로 설정하면 제목 표시줄로 팝업 대화상자를 드래그할 수 있습니다. |
| draggableOverflowCorrection | boolean | true | X | false로 설정하면 화면 밖으로 팝업이 드롭될 때 자동으로 화면 안으로 이동하지 않습니다. |
| draggableOverflowCorrectionAddValues | object | { top: 0, bottom: 0, left: 0, right: 0 } | X | 팝업이 화면 밖으로 드롭될 때 화면 안으로 이동할 위치를 지정합니다.<br>화면에 스크롤바가 나타나 팝업이 화면 안으로 완전히 돌아오지 않을 때 팝업의 위치를 1씩 증감하여 보정합니다. |
| overlayClose | boolean | true | X | false로 설정하면 msgContext(modal 옵션이 true일 때 화면을 덮는 요소)를 클릭해도 팝업이 닫히지 않습니다. |
| escClose | boolean | true | X | false로 설정하면 ESC 키를 눌러도 팝업이 닫히지 않습니다. |
| preload | boolean | false | X | true로 설정하면 팝업이 초기화될 때 팝업 내용이 미리 로드됩니다.<br>false로 설정하면 팝업이 처음 열릴 때 팝업 내용이 로드됩니다.<br>url 옵션을 설정하여 다른 페이지를 팝업 내용으로 생성할 때만 작동합니다. |
| windowScrollLock | boolean | true | X | true로 설정하면 팝업 요소 위에서 마우스 휠로 스크롤할 때 브라우저 창 스크롤을 비활성화합니다.<br>팝업 요소가 먼저 스크롤되거나 마지막으로 스크롤될 때 브라우저 창이 위아래로 스크롤되는 기본 동작을 차단합니다.<br>modal 옵션이 true로 설정된 경우에만 작동합니다. |
| opener | N.cont의 객체 | null | X | 팝업의 Controller 객체에서 부모 페이지의 Controller 객체를 참조하기 위한 옵션입니다.<br>팝업 인스턴스를 생성하는 페이지의 Controller 객체를 opener 옵션으로 설정하면 팝업의 Controller 객체의 opener 속성으로 전달됩니다.<br>url 옵션을 설정하여 다른 페이지를 팝업 내용으로 생성할 때만 작동합니다. |
| saveMemory | boolean | false | X | true로 설정하면 불필요한 참조 요소를 제거하여 메모리 사용량을 절약합니다. |
| onOk | function | null | X | 확인 버튼을 클릭했을 때 실행되는 이벤트 핸들러를 정의합니다.<br>`onOk: function(msgContext, msgContents) { ... }`<br>0을 반환하면 이벤트 핸들러만 실행되고 대화상자가 닫히지 않습니다.<br>button 옵션이 true로 설정되었을 때 생성되는 확인 버튼에서 작동합니다. |
| onCancel | function | null | X | 취소 버튼, X 버튼을 클릭하거나 팝업 오버레이 요소를 클릭하거나 ESC 키를 눌러 팝업이 닫힐 때 실행되는 이벤트 핸들러를 정의합니다.<br>`onCancel: function(msgContext, msgContents) { ... }`<br>0을 반환하면 이벤트 핸들러만 실행되고 팝업이 닫히지 않습니다.<br>button 옵션이 true로 설정되었을 때 생성되는 취소 버튼에서 작동합니다. |
| onBeforeShow | function | null | X | 팝업이 표시되기 전에 실행되는 이벤트 핸들러를 정의합니다.<br>`onBeforeShow: function(msgContext, msgContents) { ... }` |
| onShow | function | null | X | 팝업이 표시된 후에 실행되는 이벤트 핸들러를 정의합니다.<br>`onShow: function(msgContext, msgContents) { ... }` |
| onBeforeHide | function | null | X | 팝업이 숨겨지기 전에 실행되는 이벤트 핸들러를 정의합니다.<br>`onBeforeHide: function(msgContext, msgContents) { ... }`<br>closeMode 옵션이 remove로 설정된 경우 onBeforeHide 이벤트가 발생하지 않습니다. |
| onHide | function | null | X | 팝업이 숨겨진 후에 실행되는 이벤트 핸들러를 정의합니다.<br>`onHide: function(msgContext, msgContents) { ... }`<br>closeMode 옵션이 remove로 설정된 경우 onHide 이벤트가 발생하지 않습니다. |
| onBeforeRemove | function | null | X | 팝업이 제거되기 전에 실행되는 이벤트 핸들러를 정의합니다.<br>`onBeforeRemove: function(msgContext, msgContents) { ... }`<br>closeMode 옵션이 hide로 설정된 경우 onBeforeRemove 이벤트가 발생하지 않습니다. |
| onRemove | function | null | X | 팝업이 제거된 후에 실행되는 이벤트 핸들러를 정의합니다.<br>`onRemove: function(msgContext, msgContents) { ... }`<br>closeMode 옵션이 hide로 설정된 경우 closeMode 이벤트가 발생하지 않습니다. |
| onOpen | string | null | X | 팝업이 열릴 때마다 실행되는 이벤트 핸들러를 정의합니다.<br>문자열로 함수 이름만 정의하고, 로드할 팝업 컨텐츠의 Controller 객체에 정의된 함수 이름으로 실제 이벤트 핸들러 메서드를 구현해야 합니다.<br>open 메서드의 첫 번째 인자가 onOpen 이벤트 핸들러 함수의 첫 번째 인자(onOpenData)로 전달됩니다.<br>팝업 컨텐츠가 처음 로드되면 Controller 객체의 init 함수가 실행된 다음 onOpen 함수가 실행됩니다.<br>url 옵션을 설정하여 다른 페이지를 팝업 내용으로 생성할 때만 작동합니다. |
| onOpenData | anything | null | X | onOpen 이벤트 핸들러 함수의 첫 번째 인자로 전달할 부모 페이지의 데이터를 설정합니다.<br>open 메서드의 첫 번째 인자 값이 이 값으로 설정됩니다.<br>url 옵션을 설정하여 다른 페이지를 팝업 내용으로 생성할 때만 작동합니다. |
| onClose | function | null | X | 팝업이 닫힐 때마다 실행되는 이벤트 핸들러를 정의합니다.<br>`onClose: function(onCloseData) { ... }`<br>팝업 컨텐츠 로딩이 완료되면 팝업의 Controller 객체에 caller 속성이 생성됩니다. 이 caller는 이 팝업을 생성한 부모 페이지의 N.popup 인스턴스입니다.<br>팝업에서 자체 팝업을 닫을 때는 팝업의 Controller 객체에서 "this.caller.close(onCloseData);" 명령만 실행하면 됩니다. 이 명령이 실행되면 팝업이 닫히고 onCloseData가 onClose 이벤트 핸들러 함수의 첫 번째 인자로 전달됩니다.<br>url 옵션을 설정하여 다른 페이지를 팝업 내용으로 생성할 때만 작동합니다. |
| onCloseData | anything | null | X | onClose 이벤트 핸들러 함수의 첫 번째 인자로 전달할 팝업 페이지의 데이터를 설정합니다.<br>팝업 Controller 객체의 this.caller.close 메서드의 첫 번째 인자 값이 이 값으로 설정됩니다.<br>url 옵션을 설정하여 다른 페이지를 팝업 내용으로 생성할 때만 작동합니다. |
| onLoad | function | null | X | 팝업 컨텐츠 로딩이 완료되었을 때 실행되는 이벤트 핸들러를 정의합니다.<br>`onLoad: function(cont) { ... }`<br>url 옵션을 설정하여 다른 페이지를 팝업 내용으로 생성할 때만 작동합니다. |

### 이벤트 핸들러 함수 매개변수

#### onOk, onCancel, onBeforeShow, onShow, onBeforeHide, onHide, onBeforeRemove, onRemove

```javascript
function(msgContext, msgContents) {
    // this: N.alert 인스턴스
    // msgContext: 팝업 오버레이 요소
    // msgContents: 팝업 요소
}
```

#### onClose

```javascript
function(onCloseData) {
    // this: N.popup 인스턴스
    // onCloseData: 팝업에서 호출된 (Controller 객체).caller.close 함수의 첫 번째 인자 값이 전달됩니다.
}
```

#### onLoad

```javascript
function(cont) {
    // this: N.popup 인스턴스
    // cont: 팝업의 Controller 객체
}
```

## 메서드(Methods)

### context

```javascript
popup.context([selector]);
```

- **selector** (string, 선택 사항): jQuery 셀렉터 문법을 입력하면 context 요소에서 지정된 요소를 찾아 반환합니다.
- **반환 값**: jQuery 객체 (context 요소를 반환합니다.)

### open

```javascript
popup.open([onOpenData]);
```

- **onOpenData** (object, 선택 사항): onOpen 이벤트 옵션으로 지정한 onOpen 함수의 첫 번째 인자로 전달됩니다. 자세한 내용은 [기본 옵션] 탭의 onOpen 옵션을 참조하세요.
- **반환 값**: N.popup (팝업을 엽니다.)

### close

```javascript
popup.close([onCloseData]);
```

- **onCloseData** (object, 선택 사항): onClose 이벤트 옵션으로 지정한 함수의 첫 번째 인자로 전달됩니다. 자세한 내용은 [기본 옵션] 탭의 onClose 옵션을 참조하세요.
- **반환 값**: N.popup (팝업을 닫거나 제거합니다.)

### remove

```javascript
popup.remove();
```

- **반환 값**: N.popup (N.popup 관련 모든 요소를 제거합니다.)

## 예제(Examples)

### 1. 지정한 요소(.popupArea)로 팝업 생성하기

```html
<div title="Popup Example" class="popupArea" style="height: 200px;border: 3px dotted var(--md-sys-color-outline-variant);">Popup Block...</div>

<script type="text/javascript">
    N(".popupArea").popup().open();
</script>
```

### 2. 페이지를 로드하여 팝업으로 생성하기

```javascript
var popup = N().popup("page.html");
popup.open();
```

### 3. 페이지를 로드하여 드래그 가능한 팝업으로 생성하기

```javascript
var popup = N().popup({
    url: "page.html",
    title: "Title",
    width: 800,
    draggable: true
});
popup.open();
```

### 4. 팝업이 열릴 때마다 페이지를 다시 로드하는 팝업 생성하기

### 5. 팝업에서 데이터 전달 및 수신하기

#### 5.1. 팝업 페이지(popup.html)

```html
<!-- Style -->
<style>
    .popup-0001 .result { width: 400px; height: 300px; border: 1px solid var(--md-sys-color-outline-variant); }
</style>

<!-- View -->
<article class="popup-0001" title="onOpen Example">
    <p class="result"></p>
    <button class="btn-ok">Ok</button>
</article>

<!-- Controller -->
<script type="text/javascript">
N(".popup-0001").cont({
    init : function(view, request) {
        var caller = this.caller; // caller는 이 팝업 페이지를 연 부모 페이지의 N.popup 인스턴스입니다.
        N(".btn-ok", view).on("click", function(onCloseData) { // Ok 버튼에 이벤트를 바인딩합니다.
            caller.close("Hello onClose."); // close 함수의 첫 번째 인자로 onCloseData 데이터를 전달합니다.
        });
    },
    // 이 함수는 팝업이 열릴 때마다 실행됩니다.
    onOpenFn : function(onOpenData) {
        N(".result", this.view).text(onOpenData);
    }
});
</script>
```

#### 5.2. 부모 페이지(parent.html)

```html
<!-- Style -->
<style>
    .parent-0001 .result { width: 400px; height: 300px; border: 1px solid var(--md-sys-color-outline-variant); }
</style>

<!-- View -->
<article class="parent-0001" title="onOpen Example">
    <p class="result"></p>
</article>

<!-- Controller -->
<script type="text/javascript">
N(".parent-0001").cont({
    init : function(view, request) {
        var popup = N().popup({
            url: "./popup.html",
            onOpen: "onOpenFn", // 팝업이 열릴 때마다 실행할 함수 이름
            onClose: function(onCloseData) { // 팝업이 닫힐 때마다 실행될 onClose 이벤트 핸들러
                N(".result", view).text(onCloseData);
            }
        });
        popup.open("Hello onOpen."); // open 함수의 첫 번째 인자로 onOpenData 데이터를 전달합니다.
    }
});
</script>
```