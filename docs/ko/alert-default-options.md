# Alert 기본 옵션

Alert 컴포넌트는 외관과 동작을 사용자 정의할 수 있는 다양한 구성 옵션을 제공합니다. 이 문서는 Alert 인스턴스를 생성할 때 사용할 수 있는 모든 기본 옵션을 자세히 설명합니다.

## 기본 구성 옵션

### context
**Type**: window | jQuery object | jQuery selector string  
**기본값**: null  
**필수**: 예

N.alert의 메시지 대화상자가 표시될 영역을 지정합니다. modal 옵션이 true로 설정되었을 때 N.alert의 overlay 요소가 context로 지정한 요소만큼 가려 줍니다.

> **참고**: window 객체를 지정하면 화면 전체를 덮어 주고 jQuery selector나 jQuery object를 입력하면 지정한 요소만큼만 가려줍니다.

입력 요소(select, input, textarea 등)를 지정하면 입력 요소 옆에 툴팁으로 메시지를 표시해 줍니다.

### msg
**Type**: string | object  
**기본값**: undefined  
**필수**: 예

알림 대화 상자에 표시할 메시지 내용.

> **참고**: 메시지 문자열, jQuery object, HTML 문자열이나 HTML 요소를 지정할 수 있습니다.

### vars
**Type**: array  
**기본값**: undefined  
**필수**: 아니오

메시지의 변수를 입력한 값으로 치환해 줍니다.

> **참고**: 메시지에 선언된 {index}와 같은 변수가 vars 옵션으로 설정한 배열의 index에 해당하는 값으로 치환됩니다.

```javascript
N(window).alert({
    msg: "{0} {1}-JS.",
    vars: ["Hello", "Natural"]
}).show();

// 결과 메시지: "Hello Natural-JS"
```

### html
**Type**: boolean  
**기본값**: false  
**필수**: 아니오

true로 설정하면 메시지의 HTML이 적용됩니다.

### confirm
**Type**: boolean  
**기본값**: false  
**필수**: 아니오

true로 설정하면 확인/취소 버튼이 표시되고 false로 설정하면 확인 버튼만 표시됩니다.

## 위치 및 크기 옵션

### top
**Type**: number  
**기본값**: undefined  
**필수**: 아니오

메시지 대화상자의 상단(px) 위치.

### left
**Type**: number  
**기본값**: undefined  
**필수**: 아니오

메시지 대화상자의 좌측(px) 위치.

### width
**Type**: number | function  
**기본값**: 0  
**필수**: 아니오

메시지 대화상자의 넓이.

- number 타입으로 설정할 경우 입력한 수치(px)가 요소의 넓이로 설정됩니다.
- function 타입으로 설정할 경우 msgContext(modal 옵션이 true일 때 화면에 덮는 요소), msgContents(메시지 콘텐츠 요소)가 인수로 전달되고 return 된 값으로 요소의 넓이가 설정됩니다.

```javascript
// 대화상자의 넓이를 화면에 꽉 채우기
width: function(msgContext, msgContents) {
    return $(window).width();
}
```

### height
**Type**: number | function  
**기본값**: 0  
**필수**: 아니오

메시지 대화상자의 타이틀 영역을 제외한 콘텐츠의 높이.

- number 타입으로 설정할 경우 입력한 수치(px)가 요소의 높이로 설정됩니다.
- function 타입으로 설정할 경우 msgContext(modal 옵션이 true일 때 화면에 덮는 요소), msgContents(메시지 콘텐츠 요소)가 인수로 전달되고 return 된 값으로 요소의 높이가 설정됩니다.

```javascript
// 대화상자의 높이를 화면에 꽉 채우기
height: function(msgContext, msgContents) {
    // 메시지 대화상자가 열릴 때 msgContents는 숨겨져 있기 때문에 
    // show() 함수를 호출한 다음 타이틀 영역의 높이를 가져와야 합니다.
    return $(window).height() - msgContents.show().find(".msg_title_box__").height();
}
```

## 외관 옵션

### title
**Type**: string  
**기본값**: undefined  
**필수**: 아니오

메시지 대화상자의 제목을 설정합니다. 설정하지 않으면 타이틀바가 생성되지 않습니다.

> **참고**: context 요소의 title 속성으로도 설정할 수 있습니다.

### button
**Type**: boolean  
**기본값**: true  
**필수**: 아니오

false로 설정하면 기본 버튼(확인/취소 버튼) 관련 요소들을 생성하지 않습니다.

### okButtonOpts
**Type**: object  
**기본값**: true  
**필수**: 아니오

메시지 다이얼로그의 확인 버튼에 적용되어 있는 N.button 컴포넌트의 옵션을 정의합니다.

### cancelButtonOpts
**Type**: object  
**기본값**: true  
**필수**: 아니오

메시지 다이얼로그의 취소 버튼에 적용되어 있는 N.button 컴포넌트의 옵션을 정의합니다.

### closeMode
**Type**: string  
**기본값**: "remove"  
**필수**: 아니오

메시지 대화상자가 닫혔을 때 대화상자 요소를 감출 것인지, 제거할 것인지를 설정합니다.

- **hide**: 메시지 대화상자 요소를 숨겨서 이전 상태를 유지합니다.
- **remove**: 메시지 대화상자 요소를 제거하여 상태를 초기화합니다.

## 동작 옵션

### modal
**Type**: boolean  
**기본값**: true  
**필수**: 아니오

true로 설정하면 context로 지정한 요소를 가리는 overlay 요소를 생성하여 메시지 대화상자의 콘텐츠를 제외하고 모든 이벤트를 차단합니다.

### alwaysOnTop
**Type**: boolean  
**기본값**: false  
**필수**: 아니오

true로 설정하면 메시지 대화 상자를 항상 최상위에 표시합니다.

### alwaysOnTopCalcTarget
**Type**: string  
**기본값**: "div, span, ul, p, nav, article, section, header, footer, aside"  
**필수**: 아니오

alwaysOnTop 옵션 적용 시 최상위 z-index를 계산하기 위한 대상 요소들을 지정합니다.

> **참고**: jQuery selector 구문으로 지정합니다. N.alert이나 N.popup 관련 요소들이 다른 요소에 의해 가려질 때 가리고 있는 요소 셀렉터를 추가해 주세요.

### dynPos
**Type**: boolean  
**기본값**: true  
**필수**: 아니오

false로 설정하면 브라우저의 크기를 조절하거나 부모 콘텐츠의 높이가 동적으로 변경되었을 때 블록 오버레이의 크기와 메시지 대화상자의 위치를 자동으로 조정하지 않습니다.

### draggable
**Type**: boolean  
**기본값**: false  
**필수**: 아니오

true로 설정하면 제목 표시 줄로 메시지 대화 상자를 드래그할 수 있습니다.

### draggableOverflowCorrection
**Type**: boolean  
**기본값**: true  
**필수**: 아니오

false로 설정하면 메시지 대화 상자를 화면 바깥으로 드롭했을 때 자동으로 내부로 이동시키지 않습니다.

### draggableOverflowCorrectionAddValues
**Type**: object  
**기본값**:
```javascript
{
    top: 0,
    bottom: 0,
    left: 0,
    right: 0
}
```
**필수**: 아니오

메시지 대화 상자를 화면 바깥으로 드롭했을 때 내부로 이동할 위치를 지정합니다.

> **참고**: 메시지 대화상자가 내부로 완전하게 돌아오지 않아 화면에 스크롤바가 생겼을 때 1씩 증감하여 메시지 대화상자의 위치를 보정하세요.

### overlayClose
**Type**: boolean  
**기본값**: true  
**필수**: 아니오

false로 설정하면 msgContext(modal 옵션이 true일 때 화면에 덮는 요소)를 클릭해도 메시지 대화상자가 닫히지 않습니다.

### overlayColor
**Type**: string  
**기본값**: null  
**필수**: 아니오

msgContext(modal 옵션이 true일 때 화면에 덮는 요소)의 배경색상을 지정합니다. CSS의 color 속성값으로 정의할 수 있습니다.

### escClose
**Type**: boolean  
**기본값**: true  
**필수**: 아니오

false로 설정하면 ESC 키를 눌러도 메시지 대화상자가 닫히지 않습니다.

### windowScrollLock
**Type**: boolean  
**기본값**: true  
**필수**: 아니오

true로 설정하면 메시지 대화상자 요소 위에서 마우스 휠로 스크롤할 때 브라우저의 윈도우 스크롤을 비활성화합니다. 메시지 대화상자 요소가 처음이나 마지막으로 스크롤되었을 때 브라우저 윈도우 스크롤이 위나 아래로 스크롤되는 브라우저의 기본 동작을 차단합니다.

> **참고**: modal 옵션이 true로 설정되어 있을 때만 작동합니다.

### saveMemory
**Type**: boolean  
**기본값**: false  
**필수**: 아니오

true로 설정하면 필요 없는 참조 요소를 제거하여 메모리 사용을 절약합니다.

## 이벤트 핸들러 옵션

### onOk
**Type**: function  
**기본값**: null  
**필수**: 아니오

확인 버튼을 클릭했을 때 실행되는 이벤트 핸들러를 정의합니다.

```javascript
onOk: function(msgContext, msgContents) {
    // this: N.alert 인스턴스
    // msgContext: 메시지 오버레이 요소
    // msgContents: 메시지 대화상자 요소
}
```

> **참고**: 0을 return 하면 이벤트 핸들러만 실행되고 대화 상자를 닫지 않습니다. button 옵션을 true로 설정했을 때 생성되는 확인 버튼에서 작동됩니다.

### onCancel
**Type**: function  
**기본값**: null  
**필수**: 아니오

취소 버튼 클릭하거나 X 버튼을 클릭하거나 메시지 오버레이 요소 클릭하거나 ESC 키를 눌러서 메시지 대화상자가 닫혔을 때 실행되는 이벤트 핸들러를 정의합니다.

```javascript
onCancel: function(msgContext, msgContents) {
    // this: N.alert 인스턴스
    // msgContext: 메시지 오버레이 요소
    // msgContents: 메시지 대화상자 요소
}
```

> **참고**: 0을 return 하면 이벤트 핸들러만 실행되고 메시지 대화 상자를 닫지 않습니다. button 옵션을 true로 설정했을 때 생성되는 취소 버튼에서 작동됩니다.

### onBeforeShow
**Type**: function  
**기본값**: null  
**필수**: 아니오

메시지 대화상자가 표시되기 전에 실행되는 이벤트 핸들러를 정의합니다.

```javascript
onBeforeShow: function(msgContext, msgContents) {
    // this: N.alert 인스턴스
    // msgContext: 메시지 오버레이 요소
    // msgContents: 메시지 대화상자 요소
}
```

### onShow
**Type**: function  
**기본값**: null  
**필수**: 아니오

메시지 대화상자가 표시된 후에 실행되는 이벤트 핸들러를 정의합니다.

```javascript
onShow: function(msgContext, msgContents) {
    // this: N.alert 인스턴스
    // msgContext: 메시지 오버레이 요소
    // msgContents: 메시지 대화상자 요소
}
```

### onBeforeHide
**Type**: function  
**기본값**: null  
**필수**: 아니오

메시지 대화상자가 숨겨지기 전에 실행되는 이벤트 핸들러를 정의합니다.

```javascript
onBeforeHide: function(msgContext, msgContents) {
    // this: N.alert 인스턴스
    // msgContext: 메시지 오버레이 요소
    // msgContents: 메시지 대화상자 요소
}
```

> **참고**: closeMode 옵션이 remove로 설정된 경우 onBeforeHide 이벤트는 실행되지 않습니다.

### onHide
**Type**: function  
**기본값**: null  
**필수**: 아니오

메시지 대화상자가 숨겨진 후에 실행되는 이벤트 핸들러를 정의합니다.

```javascript
onHide: function(msgContext, msgContents) {
    // this: N.alert 인스턴스
    // msgContext: 메시지 오버레이 요소
    // msgContents: 메시지 대화상자 요소
}
```

> **참고**: closeMode 옵션이 remove로 설정된 경우 onHide 이벤트는 실행되지 않습니다.

### onBeforeRemove
**Type**: function  
**기본값**: null  
**필수**: 아니오

메시지 대화상자가 제거되기 전에 실행되는 이벤트 핸들러를 정의합니다.

```javascript
onBeforeRemove: function(msgContext, msgContents) {
    // this: N.alert 인스턴스
    // msgContext: 메시지 오버레이 요소
    // msgContents: 메시지 대화상자 요소
}
```

> **참고**: closeMode 옵션이 hide로 설정된 경우 onBeforeRemove 이벤트는 실행되지 않습니다.

### onRemove
**Type**: function  
**기본값**: null  
**필수**: 아니오

메시지 대화상자가 제거된 후에 실행되는 이벤트 핸들러를 정의합니다.

```javascript
onRemove: function(msgContext, msgContents) {
    // this: N.alert 인스턴스
    // msgContext: 메시지 오버레이 요소
    // msgContents: 메시지 대화상자 요소
}
```

> **참고**: closeMode 옵션이 hide로 설정된 경우 onRemove 이벤트는 실행되지 않습니다.
