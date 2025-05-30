# Natural-UI Alert 컴포넌트 개발자 가이드

Natural-UI의 Alert(N.alert) 컴포넌트는 일반적인 window.alert나 window.confirm과 같은 메시지 대화 상자를 레이어 팝업 형태로 표시하는 UI 컴포넌트입니다.

## 목차

1. [개요](#개요)
2. [생성자](#생성자)
3. [기본 옵션](#기본-옵션)
4. [메소드](#메소드)
5. [사용 예제](#사용-예제)
6. [주의 사항](#주의-사항)

## 개요

Alert(N.alert)은 일반적인 window.alert나 window.confirm과 같은 메시지 대화 상자를 레이어 팝업 형태로 표시하는 UI 컴포넌트입니다. 메시지 대화 상자가 표시되지 않고 오류가 발생하는 경우 Config(natural.config.js)의 N.context.attr("ui").alert.container 속성에 N.alert 관련 요소들이 저장될 요소를 jQuery 셀렉터 문자열로 지정해야 합니다.

## 생성자

### N.alert

`N.alert` 인스턴스를 생성합니다.

```javascript
var alert = new N.alert(context, opts|msg);
// 또는
var alert = new N.alert(context, opts|msg, vars);
```

| 인자 | 타입 | 설명 |
|------|------|------|
| context | window\|jQuery object\|jquery selector string | context 옵션을 설정합니다. 기본 옵션의 context 옵션과 동일합니다. |
| opts\|msg | string\|object | 문자열 타입으로 인자를 입력하면 기본 옵션의 msg 옵션으로 설정됩니다.<br>msg 인자에는 메시지 문자열, jQuery 객체, HTML 문자열 또는 HTML 요소를 지정할 수 있습니다.<br>객체 타입으로 인자를 입력하면 컴포넌트의 기본 옵션 객체로 지정됩니다. |
| vars | array | 기본 옵션의 vars 옵션으로 설정됩니다. |

### N(obj).alert

jQuery 플러그인 메소드로 N.alert 객체 인스턴스를 생성합니다.

```javascript
var alert = N(context).alert(opts|msg);
// 또는
var alert = N(context).alert(opts|msg, vars);
```

객체 인스턴스를 생성하는 방법은 다르지만, "new N.alert()"로 생성된 인스턴스와 "N().alert"로 생성된 인스턴스는 동일합니다. N() 함수의 첫 번째 인자는 새 N.alert 생성자의 첫 번째 인자로 설정됩니다.

| 인자 | 타입 | 설명 |
|------|------|------|
| opts\|msg | string\|object | N.alert 함수의 두 번째 인자(opts\|msg)와 동일합니다. |
| vars | array | N.alert 함수의 세 번째 인자(vars)와 동일합니다. |

## 기본 옵션

| 옵션명 | 타입 | 기본값 | 필수 | 설명 |
|--------|------|--------|------|------|
| context | window\|jQuery object\|jquery selector string | null | O | N.alert 메시지 대화 상자가 표시될 영역을 지정합니다.<br>modal 옵션이 true로 설정되면 N.alert의 오버레이 요소는 context로 지정된 요소만큼 덮습니다.<br>window 객체를 지정하면 전체 화면을 덮고, jquery 셀렉터나 jQuery 객체를 입력하면 지정된 요소만 덮습니다.<br>입력 요소(select, input, textarea 등)가 지정되면 입력 요소 옆에 툴팁으로 메시지가 표시됩니다. |
| msg | string\|object | undefined | O | 메시지 내용.<br>메시지 문자열, jQuery 객체, HTML 문자열 또는 HTML 요소를 지정할 수 있습니다. |
| vars | array | undefined | X | 메시지의 변수를 입력된 값으로 대체합니다.<br>메시지에 선언된 {index}와 같은 변수는 vars 옵션에 설정된 배열의 해당 인덱스에 대응하는 값으로 대체됩니다.<br><br>```N(window).alert({<br>    msg : "{0} {1}-JS.",<br>    vars : ["Hello", "Natural"]<br>}).show();<br><br>// 결과 메시지: "Hello Natural-JS"``` |
| html | boolean | false | X | true로 설정하면 메시지의 HTML이 적용됩니다. |
| confirm | boolean | false | X | true로 설정하면 OK / Cancel 버튼이 표시됩니다. false로 설정하면 OK 버튼만 표시됩니다. |
| top | number | undefined | X | 메시지 대화 상자의 상단(px) 위치를 설정합니다. |
| left | number | undefined | X | 메시지 대화 상자의 왼쪽(px) 위치를 설정합니다. |
| width | number\|function | 0 | X | 메시지 대화 상자의 너비를 설정합니다.<br>number 타입으로 설정하면, 입력된 값(px)이 요소 너비로 설정됩니다.<br>function 타입으로 설정하면, msgContext(modal 옵션이 true일 때 화면을 덮는 요소)와 msgContents(메시지 내용 요소)가 인자로 전달되고, 반환된 값이 요소의 너비로 설정됩니다.<br><br>```// 화면에 대화 상자의 너비를 완전히 채우기<br>width : function(msgContext, msgContents) {<br>    return $(window).width();<br>},``` |
| height | number\|function | 0 | X | 메시지 대화 상자의 제목 영역을 제외한 내용의 높이를 설정합니다.<br>number 타입으로 설정하면, 입력된 값(px)이 요소 높이로 설정됩니다.<br>function 타입으로 설정하면, msgContext(modal 옵션이 true일 때 화면을 덮는 요소)와 msgContents(메시지 내용 요소)가 인자로 전달되고, 반환된 값이 요소의 높이로 설정됩니다.<br><br>```// 화면에 대화 상자의 높이를 완전히 채우기<br>height : function(msgContext, msgContents) {<br>// 메시지 내용이 대화 상자가 열릴 때 숨겨져 있기 때문에 show() 함수를 호출한 다음 제목 영역의 높이를 가져와야 합니다.<br>return $(window).height() - msgContents.show().find(".msg_title_box__").height();<br>},``` |
| title | string | undefined | X | 메시지 대화 상자의 제목을 설정합니다. 설정하지 않으면 제목 표시줄이 생성되지 않습니다.<br>context 요소의 title 속성으로도 설정할 수 있습니다. |
| button | boolean | true | X | false로 설정하면, 기본 버튼(OK/Cancel 버튼) 관련 요소를 생성하지 않습니다. |
| okButtonOpts | object | true | X | 메시지 대화 상자의 OK 버튼에 적용되는 N.button 컴포넌트의 옵션을 정의합니다. |
| cancelButtonOpts | object | true | X | 메시지 대화 상자의 Cancel 버튼에 적용되는 N.button 컴포넌트의 옵션을 정의합니다. |
| closeMode | string | remove | X | 메시지 대화 상자가 닫힐 때 대화 상자 요소를 숨길지 제거할지 설정합니다.<br>hide : 이전 상태를 유지하기 위해 메시지 대화 상자 요소를 숨깁니다.<br>remove : 메시지 대화 상자 요소를 제거하여 상태를 초기화합니다. |
| modal | boolean | true | X | true로 설정하면, context로 지정된 요소를 덮는 오버레이 요소를 생성하여 메시지 대화 상자 내용을 제외한 모든 이벤트를 차단합니다. |
| alwaysOnTop | boolean | false | X | true로 설정하면, 메시지 대화 상자가 항상 맨 위에 표시됩니다. |
| alwaysOnTopCalcTarget | string | div, span, ul, p, nav, article, section, header, footer, aside | X | alwaysOnTop 옵션을 적용할 때 가장 높은 z-index를 계산하기 위한 대상 요소를 지정합니다.<br>jQuery 셀렉터 구문을 사용하여 지정합니다.<br>N.alert 또는 N.popup 관련 요소가 다른 요소에 가려질 때 가려진 요소 셀렉터를 추가합니다. |
| dynPos | boolean | true | X | false로 설정하면, 브라우저 크기가 조정되거나 부모 내용의 높이가 동적으로 변경될 때 블록 오버레이의 크기와 메시지 대화 상자의 위치를 자동으로 조정하지 않습니다. |
| draggable | boolean | false | X | true로 설정하면, 메시지 대화 상자를 제목 표시줄로 끌어서 이동할 수 있습니다. |
| draggableOverflowCorrection | boolean | true | X | false로 설정하면, 메시지 대화 상자가 화면 밖으로 끌려 벗어났을 때 자동으로 안쪽으로 이동하지 않습니다. |
| draggableOverflowCorrectionAddValues | object | { top : 0, bottom : 0, left : 0, right : 0 } | X | 메시지 대화 상자가 화면 밖으로 끌려 벗어났을 때 안쪽으로 이동할 위치를 지정합니다.<br>메시지 대화 상자가 완전히 안쪽으로 돌아오지 않아 화면에 스크롤 바가 나타날 때 1씩 증감하여 메시지 대화 상자의 위치를 보정합니다. |
| overlayClose | boolean | true | X | false로 설정하면, msgContext(modal 옵션이 true일 때 화면을 덮는 요소)를 클릭해도 메시지 대화 상자가 닫히지 않습니다. |
| overlayColor | string | null | X | msgContext(modal 옵션이 true일 때 화면을 덮는 요소)의 배경색을 지정합니다. CSS의 color 속성 값으로 정의할 수 있습니다. |
| escClose | boolean | true | X | false로 설정하면, ESC 키를 눌러도 메시지 대화 상자가 닫히지 않습니다. |
| windowScrollLock | boolean | true | X | true로 설정하면, 메시지 대화 상자 요소 위에서 마우스 휠로 스크롤할 때 브라우저 창 스크롤을 비활성화합니다.<br>브라우저의 기본 동작인 메시지 대화 상자 요소가 먼저 또는 마지막으로 스크롤될 때 브라우저 창을 위아래로 스크롤하는 것을 차단합니다.<br>modal 옵션이 true로 설정된 경우에만 작동합니다. |
| saveMemory | boolean | false | X | true로 설정하면, 불필요한 참조 요소를 제거하여 메모리 사용량을 절약합니다. |
| onOk | function | null | X | OK 버튼을 클릭했을 때 실행되는 이벤트 핸들러를 정의합니다.<br><br>```onOk : function(msgContext, msgContents) {<br>    // this : N.alert 인스턴스<br>    // msgContext : 메시지 오버레이 요소<br>    // msgContents : 메시지 대화 상자 요소<br>}```<br><br>0을 반환하면 이벤트 핸들러만 실행되고 대화 상자는 닫히지 않습니다.<br>button 옵션이 true로 설정된 경우 생성된 Ok 버튼에서 작동합니다. |
| onCancel | function | null | X | Cancel 버튼을 클릭하거나, X 버튼을 클릭하거나, 메시지 오버레이 요소를 클릭하거나, ESC 키를 눌러 메시지 대화 상자를 닫을 때 실행되는 이벤트 핸들러를 정의합니다.<br><br>```onCancel : function(msgContext, msgContents) {<br>    // this : N.alert 인스턴스<br>    // msgContext : 메시지 오버레이 요소<br>    // msgContents : 메시지 대화 상자 요소<br>}```<br><br>0을 반환하면 이벤트 핸들러만 실행되고, 메시지 대화 상자는 닫히지 않습니다.<br>button 옵션이 true로 설정된 경우 생성된 Cancel 버튼에서 작동합니다. |
| onBeforeShow | function | null | X | 메시지 대화 상자가 표시되기 전에 실행되는 이벤트 핸들러를 정의합니다.<br><br>```onBeforeShow : function(msgContext, msgContents) {<br>    // this : N.alert 인스턴스<br>    // msgContext : 메시지 오버레이 요소<br>    // msgContents : 메시지 대화 상자 요소<br>}``` |
| onShow | function | null | X | 메시지 대화 상자가 표시된 후 실행되는 이벤트 핸들러를 정의합니다.<br><br>```onShow : function(msgContext, msgContents) {<br>    // this : N.alert 인스턴스<br>    // msgContext : 메시지 오버레이 요소<br>    // msgContents : 메시지 대화 상자 요소<br>}``` |
| onBeforeHide | function | null | X | 메시지 대화 상자가 숨겨지기 전에 실행되는 이벤트 핸들러를 정의합니다.<br><br>```onBeforeHide : function(msgContext, msgContents) {<br>    // this : N.alert 인스턴스<br>    // msgContext : 메시지 오버레이 요소<br>    // msgContents : 메시지 대화 상자 요소<br>}```<br><br>closeMode 옵션이 remove로 설정된 경우 onBeforeHide 이벤트가 발생하지 않습니다. |
| onHide | function | null | X | 메시지 대화 상자가 숨겨진 후 실행되는 이벤트 핸들러를 정의합니다.<br><br>```onHide : function(msgContext, msgContents) {<br>    // this : N.alert 인스턴스<br>    // msgContext : 메시지 오버레이 요소<br>    // msgContents : 메시지 대화 상자 요소<br>}```<br><br>closeMode 옵션이 remove로 설정된 경우 onHide 이벤트가 발생하지 않습니다. |
| onBeforeRemove | function | null | X | 메시지 대화 상자가 제거되기 전에 실행되는 이벤트 핸들러를 정의합니다.<br><br>```onBeforeRemove : function(msgContext, msgContents) {<br>    // this : N.alert 인스턴스<br>    // msgContext : 메시지 오버레이 요소<br>    // msgContents : 메시지 대화 상자 요소<br>}```<br><br>closeMode 옵션이 hide로 설정된 경우 onBeforeRemove 이벤트가 발생하지 않습니다. |
| onRemove | function | null | X | 메시지 대화 상자가 제거된 후 실행되는 이벤트 핸들러를 정의합니다.<br><br>```onRemove : function(msgContext, msgContents) {<br>    // this : N.alert 인스턴스<br>    // msgContext : 메시지 오버레이 요소<br>    // msgContents : 메시지 대화 상자 요소<br>}```<br><br>closeMode 옵션이 hide로 설정된 경우 onRemove 이벤트가 발생하지 않습니다. |

## 메소드

### show

메시지 대화 상자를 표시합니다.

```javascript
N(context).alert(options).show();
```

| 인자 | 타입 | 설명 |
|------|------|------|
| N/A | N/A | 인자가 필요하지 않습니다. |

### hide

메시지 대화 상자를 숨깁니다. closeMode 옵션이 hide로 설정된 경우에만 사용할 수 있습니다.

```javascript
N(context).alert(options).hide();
```

| 인자 | 타입 | 설명 |
|------|------|------|
| N/A | N/A | 인자가 필요하지 않습니다. |

### remove

메시지 대화 상자를 제거합니다. closeMode 옵션이 remove로 설정된 경우에만 사용할 수 있습니다.

```javascript
N(context).alert(options).remove();
```

| 인자 | 타입 | 설명 |
|------|------|------|
| N/A | N/A | 인자가 필요하지 않습니다. |

## 사용 예제

### 기본 사용법

```javascript
// 기본 알림 표시
N(window).alert("안녕하세요!").show();

// 제목과 함께 알림 표시
N(window).alert({
    msg : "환영합니다!",
    title : "인사말"
}).show();

// 확인 대화 상자 표시
N(window).alert({
    msg : "계속 진행하시겠습니까?",
    confirm : true,
    onOk : function() {
        console.log("사용자가 OK를 클릭했습니다.");
    },
    onCancel : function() {
        console.log("사용자가 Cancel을 클릭했습니다.");
    }
}).show();

// HTML 내용을 포함한 알림
N(window).alert({
    msg : "<strong>굵은</strong> 텍스트와 <em>이탤릭</em> 텍스트",
    html : true
}).show();

// 변수 대체 사용
N(window).alert({
    msg : "{0}님, {1}에 오신 것을 환영합니다!",
    vars : ["사용자", "Natural-JS"]
}).show();

// 특정 요소에 툴팁 형태로 메시지 표시
N("#username").alert("사용자 이름을 입력하세요.").show();

// 특정 컨테이너 내에 모달 알림 표시
N("#container").alert({
    msg : "컨테이너 내부에 표시되는 알림",
    title : "컨테이너 알림"
}).show();
```

### 고급 사용법

```javascript
// 커스텀 크기와 위치 지정
N(window).alert({
    msg : "커스텀 크기와 위치를 가진 알림",
    width : 400,
    height : 200,
    top : 100,
    left : 100
}).show();

// 드래그 가능한 알림
N(window).alert({
    msg : "이 알림은 드래그할 수 있습니다.",
    title : "드래그 가능",
    draggable : true
}).show();

// 항상 최상위에 표시되는 알림
N(window).alert({
    msg : "이 알림은 항상 최상위에 표시됩니다.",
    alwaysOnTop : true
}).show();

// 커스텀 버튼 옵션
N(window).alert({
    msg : "커스텀 버튼 스타일",
    confirm : true,
    okButtonOpts : {
        size : "large",
        theme : "primary"
    },
    cancelButtonOpts : {
        size : "large",
        theme : "danger"
    }
}).show();

// 오버레이 색상 지정
N(window).alert({
    msg : "커스텀 오버레이 색상",
    overlayColor : "rgba(0, 0, 0, 0.8)"
}).show();
```

## 주의 사항

1. Alert 컴포넌트가 표시되지 않고 오류가 발생하는 경우 Config(natural.config.js)의 N.context.attr("ui").alert.container 속성에 N.alert 관련 요소들이 저장될 요소를 jQuery 셀렉터 문자열로 지정해야 합니다.

2. 크기 자동 조정이 필요한 경우 width와 height 옵션을 함수로 정의하여 동적으로 계산할 수 있습니다.

3. closeMode 옵션에 따라 발생하는 이벤트가 다르므로, 이벤트 핸들러를 정의할 때 closeMode 설정을 고려해야 합니다.

4. 높은 z-index 값을 가진 다른 요소에 Alert이 가려지는 경우 alwaysOnTop 옵션을 사용하고 필요에 따라 alwaysOnTopCalcTarget을 조정하세요.

5. onOk 또는 onCancel 이벤트 핸들러에서 0을 반환하면 대화 상자가 자동으로 닫히지 않으므로, 사용자 정의 로직 후에 명시적으로 hide() 또는 remove() 메소드를 호출해야 합니다.