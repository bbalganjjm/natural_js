# Natural-UI Button 컴포넌트 개발자 가이드

Natural-UI의 Button(N.button) 컴포넌트는 "a, input[type=button], button" 요소를 context 옵션으로 지정하여 일관된 스타일과 기능을 가진 버튼을 생성하는 UI 컴포넌트입니다.

## 목차

1. [개요](#개요)
2. [생성자](#생성자)
3. [기본 옵션](#기본-옵션)
4. [선언적 옵션](#선언적-옵션)
5. [메소드](#메소드)
6. [사용 예제](#사용-예제)

## 개요

Button(N.button) 컴포넌트는 웹 애플리케이션에서 일관된 형태의 버튼을 쉽게 생성하고 관리할 수 있게 해주는 UI 컴포넌트입니다. 이 컴포넌트는 "a", "input[type=button]", "button" 태그로 작성된 요소를 대상으로 동작하며, 크기, 색상, 유형 등 다양한 스타일 옵션을 제공합니다. 또한 버튼의 활성화/비활성화 상태를 제어하는 메소드도 포함되어 있습니다.

## 생성자

### N.button

`N.button` 인스턴스를 생성합니다.

```javascript
var button = new N.button(context, opts);
```

| 인자 | 타입 | 설명 |
|------|------|------|
| context | jQuery object\|jquery selector string | N.button을 적용할 컨텍스트 요소를 지정합니다.<br>N.button의 컨텍스트 요소는 반드시 a, button, input[type=button] 태그로 작성되어야 합니다.<br>N.button은 한 번에 여러 요소를 선택하여 컨텍스트로 설정할 수 있습니다. |
| opts | object | 버튼의 옵션을 지정하는 객체입니다. |

### N(obj).button

jQuery 플러그인 메소드로 N.button 객체 인스턴스를 생성합니다.

```javascript
var button = N(context).button(opts);
```

객체 인스턴스를 생성하는 방법은 다르지만, "new N.button()"로 생성된 인스턴스와 "N().button"으로 생성된 인스턴스는 동일합니다. N() 함수의 첫 번째 인자는 새 N.button 생성자의 첫 번째 인자로 설정됩니다.

| 인자 | 타입 | 설명 |
|------|------|------|
| opts | object | 버튼의 옵션을 지정하는 객체입니다. |

## 기본 옵션

| 옵션명 | 타입 | 기본값 | 필수 | 설명 |
|--------|------|--------|------|------|
| context | jQuery object\|jquery selector string | null | O | N.button을 적용할 컨텍스트 요소를 지정합니다.<br>N.button의 컨텍스트 요소는 반드시 a, button, input[type=button] 태그로 작성되어야 합니다.<br>N.button은 한 번에 여러 요소를 선택하여 컨텍스트로 설정할 수 있습니다.<br><br>```<a class="button-context" data-opts='{ "size" : "big" }'>Button</a>```<br>```<input class="button-context" type="button" value="Button" data-opts='{ "color": "primary" }'>```<br>```<button class="button-context" data-opts='{ "color": "primary", "size" : "large" }'>Button</button>``` |
| size | string | none | X | 버튼의 크기를 설정합니다.<br>크기는 "none", "smaller", "small", "medium", "large", "big" 중 하나일 수 있습니다. |
| color | string | none | X | 버튼의 색상을 설정합니다.<br>색상은 "none", "primary", "primary_container", "secondary", "secondary_container", "tertiary", "tertiary_container" 중 하나일 수 있습니다.<br>버튼 색상의 명명 규칙과 기본값은 [Material Design 3의 Color token](https://m3.material.io/foundations/design-tokens/overview)을 기반으로 합니다.<br>버튼의 스타일을 변경하려면 natural.ui.css 파일에서 "btn_"로 시작하는 클래스를 편집하면 됩니다.<br><br>```a.btn_{color}__,input[type='button'].btn_{color}__,button.btn_{color}__ {```<br>```    color: var(--md-sys-color-on-tertiary);```<br>```    background-color: var(--md-sys-color-tertiary);```<br>```    border: 1px solid var(--md-sys-color-tertiary);```<br>```}``` |
| type | string | none | X | 버튼의 배경을 채울지 또는 테두리만 표시할지 설정합니다.<br>유형은 "none", "filled", "outlined", "elevated" 중 하나일 수 있습니다.<br>"filled"와 "outlined"의 색상은 color 옵션에 의해 정의된 색상으로 지정됩니다. color 옵션이 "none"이면 버튼의 배경이나 테두리가 표시되지 않습니다. |
| disable | boolean | false | X | true로 설정하면 버튼이 비활성화 상태로 생성됩니다. |
| onBeforeCreate | function | null | X | 버튼 옵션이 적용되기 전에 실행되는 이벤트 핸들러를 정의합니다.<br>외부 버튼 라이브러리를 사용할 때 버튼 요소의 외부나 내부에 필요한 HTML 요소를 추가하거나, 다른 목적으로 HTML 요소를 편집해야 할 때 사용할 수 있습니다.<br><br>```onBeforeCreate : function(context, opts) {```<br>```    // this : N.button 인스턴스```<br>```    // context : 컨텍스트 요소```<br>```    // opts : 버튼 생성 시 지정한 옵션```<br>```}``` |
| onCreate | function | null | X | 버튼 옵션이 적용된 후에 실행되는 이벤트 핸들러를 정의합니다.<br>외부 버튼 라이브러리를 사용할 때 버튼 요소에 효과 이벤트를 정의하거나, 다른 목적으로 버튼 처리가 필요할 때 사용할 수 있습니다.<br><br>```onCreate : function(context, opts) {```<br>```    // this : N.button 인스턴스```<br>```    // context : 컨텍스트 요소```<br>```    // opts : 버튼 생성 시 지정한 옵션```<br>```}``` |

## 선언적 옵션

N.button 컴포넌트는 HTML 요소에 직접 `data-opts` 속성을 사용하여 선언적으로 옵션을 지정할 수 있습니다. 이 방법을 사용하면 JavaScript 코드에서 옵션을 별도로 지정하지 않아도 HTML 마크업만으로 버튼을 구성할 수 있습니다.

```html
<!-- 선언적 옵션 예제 -->
<a class="button" data-opts='{ "size": "large", "color": "primary", "type": "filled" }'>큰 버튼</a>
<button class="button" data-opts='{ "size": "small", "color": "secondary", "type": "outlined" }'>작은 버튼</button>
<input type="button" class="button" value="비활성 버튼" data-opts='{ "disable": true }'>
```

그리고 나서 JavaScript에서 해당 요소들을 선택하여 버튼을 초기화합니다:

```javascript
// HTML에 선언된 옵션을 사용하여 버튼 초기화
N("a.button, button.button, input.button").button();
```

## 메소드

### disable

버튼을 비활성화 상태로 설정합니다.

```javascript
N("button").instance("button", function() {
    this.disable();
});
```

### enable

버튼을 활성화 상태로 설정합니다.

```javascript
N("button").instance("button", function() {
    this.enable();
});
```

## 사용 예제

### 기본 사용법

```javascript
// a 태그를 버튼으로 생성
N("a#myButton").button({
    size: "large",
    color: "primary",
    type: "filled"
});

// input[type=button] 태그를 버튼으로 생성
N("input#myInputButton").button({
    size: "medium",
    color: "secondary",
    type: "outlined"
});

// button 태그를 버튼으로 생성
N("button#myButtonElement").button({
    size: "small",
    color: "tertiary"
});

// 여러 요소를 한 번에 버튼으로 생성
N("a.button, button.button, input.button").button();
```

### 버튼 상태 변경하기

```javascript
// 버튼 비활성화
N("button#myButton").instance("button", function() {
    this.disable();
});

// 버튼 활성화
N("button#myButton").instance("button", function() {
    this.enable();
});
```

### 이벤트 핸들러 사용하기

```javascript
// 버튼 생성 전후에 이벤트 핸들러 실행
N("button#myButton").button({
    size: "large",
    color: "primary",
    onBeforeCreate: function(context, opts) {
        // 버튼 요소에 커스텀 데이터 추가
        N(context).data("customData", "someValue");
        console.log("버튼 생성 전:", context, opts);
    },
    onCreate: function(context, opts) {
        // 버튼 생성 후 이벤트 바인딩
        N(context).on("click", function() {
            console.log("버튼이 클릭되었습니다!");
        });
        console.log("버튼 생성 후:", context, opts);
    }
});
```

### 다양한 스타일의 버튼 사용하기

```javascript
// 다양한 크기의 버튼
N("button#smallButton").button({ size: "small" });
N("button#mediumButton").button({ size: "medium" });
N("button#largeButton").button({ size: "large" });

// 다양한 색상의 버튼
N("button#primaryButton").button({ color: "primary", type: "filled" });
N("button#secondaryButton").button({ color: "secondary", type: "filled" });
N("button#tertiaryButton").button({ color: "tertiary", type: "filled" });

// 다양한 유형의 버튼
N("button#filledButton").button({ color: "primary", type: "filled" });
N("button#outlinedButton").button({ color: "primary", type: "outlined" });
N("button#elevatedButton").button({ color: "primary", type: "elevated" });
```

### HTML 마크업과 함께 선언적으로 사용하기

```html
<div class="button-container">
    <a href="#" class="button-context" data-opts='{ "size": "large", "color": "primary", "type": "filled" }'>큰 버튼</a>
    <button class="button-context" data-opts='{ "size": "medium", "color": "secondary", "type": "outlined" }'>중간 버튼</button>
    <input type="button" value="작은 버튼" class="button-context" data-opts='{ "size": "small", "color": "tertiary", "type": "elevated" }'>
</div>
```

```javascript
// 선언적 옵션을 사용하여 버튼 초기화
N(".button-container .button-context").button();
```