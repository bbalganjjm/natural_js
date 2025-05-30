# Natural-JS Tab 컴포넌트 개발자 가이드

Natural-JS의 Tab(N.tab)은 div>ul>li 태그로 구성된 요소를 context 옵션으로 지정하여 탭 페이지 뷰를 생성하는 UI 컴포넌트입니다.

## 개요

Tab 컴포넌트는 사용자가 여러 콘텐츠 영역을 쉽게 전환할 수 있게 해주는 인터페이스를 제공합니다. 각 탭은 텍스트 링크로 표시되며, 클릭하면 해당 콘텐츠가 표시됩니다. 또한 url 옵션을 설정하여 다른 페이지를 탭 내용으로 로드할 수 있습니다.

url 옵션으로 지정한 페이지를 탭 내용으로 생성할 때, caller(해당 탭을 호출한 N.popup 인스턴스)와 opener(해당 탭을 호출한 부모 페이지의 Controller 객체, 옵션으로 전달함) 속성이 생성된 탭의 Controller 객체에 추가됩니다. 이를 통해 opener를 사용하여 부모 페이지를 제어하거나, caller를 사용하여 자기 자신을 닫거나 부모 Controller에 데이터를 전송할 수 있습니다.

N.tab 인스턴스의 cont 메서드를 호출하여 각 탭 페이지의 Controller 객체를 가져올 수 있습니다. cont 메서드에 대한 자세한 내용은 [메서드](#메서드methods) 섹션을 참조하십시오.

## 목차

- [Natural-JS Tab 컴포넌트 개발자 가이드](#natural-js-tab-컴포넌트-개발자-가이드)
  - [개요](#개요)
  - [목차](#목차)
  - [생성자(Constructor)](#생성자constructor)
    - [N.tab](#ntab)
    - [N(obj).tab](#nobjtab)
  - [기본 옵션(Default Options)](#기본-옵션default-options)
  - [선언적 옵션(Declarative Options)](#선언적-옵션declarative-options)
  - [메서드(Methods)](#메서드methods)
    - [context](#context)
    - [open](#open)
    - [enable](#enable)
    - [disable](#disable)
    - [cont](#cont)
  - [예제(Examples)](#예제examples)
    - [1. li 요소에 옵션을 선언하여 탭 생성하기](#1-li-요소에-옵션을-선언하여-탭-생성하기)
    - [2. 옵션 객체를 지정하여 탭 생성하기](#2-옵션-객체를-지정하여-탭-생성하기)
    - [3. 스크롤 가능한 탭 생성하기](#3-스크롤-가능한-탭-생성하기)

## 생성자(Constructor)

### N.tab

```javascript
var tab = new N.tab(context, opts);
```

- **context** (jQuery 객체 또는 jQuery 셀렉터 문자열): Tab이 적용될 요소를 설정합니다. 기본 옵션의 context 옵션과 동일합니다.
- **opts** (객체): 컴포넌트의 기본 옵션 객체를 지정합니다.
- **반환 값**: N.tab 인스턴스

### N(obj).tab

jQuery 플러그인 메서드로 N.tab 객체 인스턴스를 생성합니다.

```javascript
var tab = N(context).tab(opts);
```

- **opts** (객체): N.tab 함수의 두번째 인자(opts)와 동일합니다.
- **반환 값**: N.tab 인스턴스

`new N.tab()`로 생성한 인스턴스와 `N().tab`로 생성한 인스턴스는 객체 인스턴스를 생성하는 방법만 다를 뿐 동일합니다. N() 함수의 첫 번째 인자는 new N.tab 생성자의 첫 번째 인자로 설정됩니다.

## 기본 옵션(Default Options)

| 옵션명 | 타입 | 기본값 | 필수 여부 | 설명 |
|--------|------|---------|-----------|------|
| context | jQuery 객체 또는 jQuery 셀렉터 문자열 | null | O | N.tab을 적용할 context 요소를 지정합니다.<br>N.tab의 context 요소는 div 태그 안에 ul, li 및 div 태그로 작성해야 합니다.<br><br>**탭**<br>탭 요소는 ul 태그의 li 태그를 사용합니다.<br>탭 링크(a 태그)의 href 속성 값을 탭 내용(div) 태그의 id 속성 값과 일치시킵니다.<br><br>**탭 내용**<br>탭 내용 요소는 div 태그를 사용합니다.<br>탭(li)의 순서와 수에 따라 탭 내용(div)을 생성합니다.<br>탭 내용(div) 태그의 id 속성을 탭 링크(a 태그)의 href 속성 값과 일치시킵니다.<br>탭 옵션에서 url 옵션을 설정하여 다른 페이지를 로드하거나 탭 내용 요소(div) 내부에 직접 내용을 작성할 수도 있습니다.<br><br>```html<br><div class="tab-context"><br>    <ul><br>        <li><a href="#tab1">Tab1</a></li><br>        <li data-opts='{ "url" : "tab1.html" }'><br>            <a href="#tab2">Tab2</a><br>        </li><br>        <li data-opts='{ "url" : "tab2.html"}'><br>            <a href="#tab3">Tab3</a><br>        </li><br>    </ul><br>    <div id="tab1">Tab1</div><br>    <div id="tab2"></div><br>    <div id="tab3"></div><br></div>``` |
| tabOpts | array[object] | [] | X | 탭 요소의 data-opts 속성이 아닌 array[object] 타입으로 개별 탭에 대한 옵션을 지정합니다.<br>탭의 순서와 수만큼 옵션 객체를 설정합니다.<br><br>```javascript<br>N("#tab").tab({<br>    tabOpts : [<br>        { width: "auto", url: "tab1.html", preload: false, active: false }, //Tab1<br>        { width: "auto", url: "tab2.html", preload: false, active: false }, //Tab2<br>        { width: "auto", url: "tab3.html", preload: false, active: false, onOpen: "onOpen" }  //Tab3<br>    ]<br>});<br>```<br><br>탭 태그(li)에서 data-opts 속성으로 직접 옵션을 지정할 수도 있습니다.<br>개별 옵션에 대한 자세한 내용은 [선언적 옵션](#선언적-옵션declarative-options) 섹션을 참조하십시오. |
| tabScroll | boolean | false | X | true로 설정하면 마우스 드래그나 터치 또는 첫/마지막 버튼으로 탭을 스크롤할 수 있습니다.<br>첫/마지막 버튼으로 탭을 스크롤하려면 ul 태그의 첫/마지막 자식 요소에 a 태그와 span 태그를 작성합니다.<br><br>```html<br><div><br>    <a href="#"><span></span></a> <!-- First button --><br>    <ul><br>        <li><a href="#tab1">tab1</a></li><br>        <li><a href="#tab2">tab2</a></li><br>        <li><a href="#tab3">tab3</a></li><br>    </ul><br>    <a href="#"><span></span></a> <!-- Last button --><br>    <div id="tab1">tab1</div><br>    <div id="tab2">tab2</div><br>    <div id="tab3">tab3</div><br></div>``` |
| tabScrollCorrection | boolean | false | X | 탭 요소에 영향을 주는 스타일(CSS)로 인해 마지막 탭이 잘리거나 여백이 생길 수 있습니다. 이 경우 tabScrollCorrection 객체의 속성으로 다음 옵션 값을 조정하여 정상적으로 표시할 수 있습니다.<br><br>**tabContainerWidthCorrectionPx**: 마지막 탭이 잘리거나 여백이 생길 때 1씩 증감하여 탭의 모양을 보정할 수 있는 옵션입니다.<br>**tabContainerWidthReCalcDelayTime**: 탭이 처음 표시될 때 탭이 잘리거나 여백이 생기면 1씩 증분하여 탭의 모양을 수정하는 옵션입니다.<br><br>```javascript<br>N("#tab").tab({<br>    tabScrollCorrection : {<br>        tabContainerWidthCorrectionPx : 1,<br>        tabContainerWidthReCalcDelayTime : 0<br>    }<br>});<br>```<br><br>[Config(natural.config.js)](https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0102.html)의 N.context.attr("ui").tab 속성에 tabScrollCorrection 옵션을 설정하면 모든 N.tab 컴포넌트에 적용됩니다. |
| randomSel | boolean | false | X | true로 설정하면 탭이 초기화될 때 탭과 탭 내용이 무작위로 표시됩니다. false로 설정하면 첫 번째 탭이 표시됩니다.<br>탭 옵션 중 active 옵션이 true로 설정된 경우 active 옵션이 우선적으로 적용됩니다. |
| blockOnActiveWhenCreate | boolean | false | X | true로 설정하면 탭이 생성된 후 기본 탭이 선택될 때 onActive 이벤트가 발생하지 않습니다. |
| opener | N.cont의 객체 | null | X | 탭 옵션에서 url 옵션을 설정하여 다른 페이지를 로드하는 경우, 탭 내용의 Controller(N.cont) 객체에서 N.tab 인스턴스를 생성한 부모 페이지의 Controller 객체를 참조하는 옵션입니다.<br>N.tab 인스턴스를 생성할 때 Controller 객체를 opener 옵션에 지정하면 탭 내용 페이지의 Controller 객체의 opener 속성으로 전달됩니다. |
| onActive | function | null | X | 탭이 활성화될 때마다 실행되는 이벤트 핸들러를 정의합니다.<br><br>```javascript<br>onActive : function(tabIdx, tabEle, contentEle, tabEles, contentEles) {<br>    // this : N.tab 인스턴스<br>    // tabIdx : 활성 탭의 인덱스<br>    // tabEle : 활성 탭 요소<br>    // contentEle : 활성 탭 내용 요소<br>    // tabEles : 전체 탭 요소<br>    // contentEles : 전체 내용 요소<br>}<br>```<br><br>탭 내용이 처음으로 로드되면 Controller 객체의 init 함수가 실행된 다음 onActive 함수가 실행됩니다. |
| onLoad | function | null | X | 탭 내용 로딩이 완료되었을 때 실행되는 이벤트 핸들러를 정의합니다.<br><br>```javascript<br>onLoad : function(tabIdx, tabEle, contentEle, cont) {<br>    // this : N.tab 인스턴스<br>    // tabIdx : 활성 탭의 인덱스<br>    // tabEle : 활성 탭 요소<br>    // contentEle : 활성 탭 내용 요소<br>    // cont : 로드된 탭 내용의 Controller 객체<br>}<br>``` |

## 선언적 옵션(Declarative Options)

N.tab의 선언적 옵션은 탭(li) 요소의 data-opts 속성에 설정됩니다.

```html
<li data-opts='{ "url" : "page.html", "onOpen" : "onOpenFn", "preload" : true, "active" : true }'><a href="#tab01">Tab01</a></li>
```

선언적 옵션은 정확히 JSON 표준 형식(속성 이름은 큰따옴표로 묶어야 함)을 준수해야 합니다. JSON 표준 형식을 준수하지 않으면 선언적 옵션이 인식되지 않거나 오류가 발생합니다.

선언적 옵션에 대한 설명은 [API 문서 가이드](https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0001.html)의 [선언적 옵션](https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0001.html) 섹션을 참조하십시오.

| 옵션명 | 타입 | 기본값 | 설명 |
|--------|------|---------|------|
| url | string | undefined | 탭 내용으로 생성할 페이지의 URL을 지정합니다. |
| active | boolean | false | true로 설정하면 N.tab이 초기화되고 해당 탭과 탭 내용이 기본적으로 선택됩니다.<br>기본적으로 표시할 탭은 하나만 active 옵션을 true로 설정해야 합니다. |
| preload | boolean | false | true로 설정하면 탭 내용이 처음으로 선택될 때 페이지를 로드하지 않고 탭이 초기화될 때 페이지를 미리 로드합니다.<br>탭을 초기화할 때 탭 내용의 요소나 Controller 객체를 참조할 때 사용됩니다. |
| onOpen | string | undefined | 탭이 열릴 때마다 로드된 내용에서 실행할 onOpen 이벤트 핸들러 함수의 이름을 문자열로 지정합니다.<br>onOpen 이벤트 핸들러 함수는 로드할 페이지의 Controller 객체에 지정된 이름으로 정의해야 합니다.<br>onOpen 이벤트 핸들러 함수의 첫 번째 인자는 open 함수를 호출할 때 두 번째 인자로 지정한 onOpenData입니다.<br>탭 내용이 처음 로드되면 N.cont 객체의 init 함수가 실행된 다음 onOpen 함수가 실행됩니다.<br>onActive 이벤트가 정의된 경우 onActive 함수가 실행된 다음 onOpen 함수가 실행됩니다. |
| disable | boolean | false | true로 설정하면 지정된 탭이 비활성화된 상태로 생성됩니다. |
| stateless | boolean | false | true로 설정하면 탭 내용의 상태를 유지하지 않고 탭을 선택할 때마다 연결된 탭 내용이 다시 로드되고 초기화됩니다. |

## 메서드(Methods)

### context

```javascript
tab.context([selector]);
```

- **selector** (string, 선택 사항): jQuery 셀렉터 문법을 입력하면 context 요소에서 지정된 요소를 찾아 반환합니다.
- **반환 값**: jQuery 객체 (context 요소를 반환합니다.)

### open

```javascript
tab.open([index], [onOpenData]);
```

- **index** (number, 선택 사항): 열 탭의 인덱스를 지정합니다.
- **onOpenData** (object, 선택 사항): 페이지가 열릴 때마다 실행되는 onOpen 이벤트 핸들러 함수의 첫 번째 인자로 전달될 데이터를 지정합니다.
- **반환 값**: 인자가 지정되지 않은 경우 다음 탭 상태 정보가 객체 형식으로 반환됩니다:
  - **index**: 활성화된 탭 인덱스
  - **tab**: 활성화된 탭 요소
  - **content**: 활성화된 탭 내용 요소
  - **cont**: 활성화된 탭 내용의 Controller 객체
  
  인자가 지정된 경우 N.tab이 반환됩니다.

### enable

```javascript
tab.enable(index);
```

- **index** (number): 활성화할 탭의 인덱스를 지정합니다.
- **반환 값**: N.tab (지정된 탭을 활성화합니다.)

### disable

```javascript
tab.disable(index);
```

- **index** (number): 비활성화할 탭의 인덱스를 지정합니다.
- **반환 값**: N.tab (지정된 탭을 비활성화합니다.)

### cont

```javascript
tab.cont([index]);
```

- **index** (number, 선택 사항): 찾고자 하는 controller 객체가 있는 탭의 인덱스를 입력합니다. 인덱스를 제공하지 않으면 활성화된 탭의 controller 객체를 반환합니다.
- **반환 값**: N.cont의 객체 (탭 내용의 Controller 객체를 반환합니다.)

  탭 내용이 내부적으로 생성되거나 preload 옵션이 false인 경우 Controller 객체가 없기 때문에 undefined가 반환됩니다.

## 예제(Examples)

### 1. li 요소에 옵션을 선언하여 탭 생성하기

```html
<div class="tab">
    <ul>
        <!-- Tabs -->
        <li><a href="#tab1">Tab1</a></li>
        <li data-opts='{ "url" : "html/naturaljs/apid/form.html", "onOpen" : "onOpen", "preload" : true }'><a href="#tab2">Form</a></li>
        <li data-opts='{ "url" : "html/naturaljs/apid/button.html", "active" : true }'><a href="#tab3">Button</a></li>
    </ul>
    <!-- Tab Contents -->
    <div id="tab1">Hello~ Tab1</div>
    <div id="tab2"></div>
    <div id="tab3"></div>
</div>

<script type="text/javascript">
    N(".tab").tab();
</script>
```

### 2. 옵션 객체를 지정하여 탭 생성하기

```html
<div class="tab">
    <ul>
        <li><a href="#tab1">Tab1</a></li>
        <li><a href="#tab2">Form</a></li>
        <li><a href="#tab3">Button</a></li>
    </ul>
    <div id="tab1">Hello~ Tab1</div>
    <div id="tab2"></div>
    <div id="tab3"></div>
</div>

<script type="text/javascript">
    N(".tab").tab({
        tabOpts : [
            {}, //Tab1,
            { "url" : "html/naturaljs/apid/form.html", "onOpen" : "onOpen", "preload" : true }, //Tab2
            { "url" : "html/naturaljs/apid/button.html", "active" : true }  //Tab3
        ]
    });
</script>
```

### 3. 스크롤 가능한 탭 생성하기

```html
<div class="tab">
    <a href="#"><span></span></a> <!-- 첫 번째로 스크롤하는 버튼 -->
    <ul>
        <li><a href="#tab1">Tab1</a></li>
        <li data-opts='{ "url" : "html/naturaljs/apid/form.html", "onOpen" : "onOpen", "preload" : true }'><a href="#tab2">Form</a></li>
        <li data-opts='{ "url" : "html/naturaljs/apid/button.html", "active" : true }'><a href="#tab3">Button</a></li>
    </ul>
    <a href="#"><span></span></a> <!-- 마지막으로 스크롤하는 버튼 -->
    <div id="tab1">Hello~ Tab1</div>
    <div id="tab2"></div>
    <div id="tab3"></div>
</div>

<script type="text/javascript">
    N(".tab").tab({
        tabScroll : true
    });
</script>
```