# Natural-JS 아키텍처 가이드

Natural-JS는 CVC(Controller-View-Communicator) 아키텍처 패턴을 기반으로 설계되어 있습니다. 이 문서에서는 Natural-JS 아키텍처의 핵심 요소들을 설명합니다.

## 목차

1. [Controller](#controller)
   - [개요](#개요)
   - [생성자](#생성자)
   - [Controller 객체의 상수](#controller-객체의-상수)
   - [Controller 객체의 함수](#controller-객체의-함수)
   - [예제](#예제)
2. [AOP](#aop)
   - [개요](#aop-개요)
   - [pointcuts 객체](#pointcuts-객체)
   - [advisors 객체](#advisors-객체)
   - [예제](#aop-예제)
3. [Communicator](#communicator)
4. [Communicator.request](#communicator-request)
5. [Communication Filter](#communication-filter)
6. [Context](#context)

## Controller

### 개요

Controller(N.cont)는 CVC Architecture Pattern의 Controller 레이어를 구현한 클래스입니다. N.cont는 Controller 객체의 init 함수를 실행해 주고 Controller 객체를 반환합니다. Controller 객체는 View의 요소들과 Communicator에서 검색한 데이터를 제어하는 역할을 합니다.

N.cont는 다음과 같이 페이지의 View 영역 바로 아래 선언되어야 합니다:

```html
<article class="view">
    <p>View 영역</p>
</article>

<script type="text/javascript">
    N(".view").cont({ //  Controller object
        init : function(view, request) {
        }
    });
</script>
```

N.popup, N.tab 컴포넌트나 N.comm 라이브러리로 위와 같은 구조의 페이지를 불러오면 페이지 로딩이 완료되었을 때 Controller 객체의 init 함수가 호출됩니다.

Natural-ARCHITECTURE 기반 페이지가 제대로 작동하려면 반드시 N.comm 라이브러리나 N.popup, N.tab 컴포넌트로 로딩되어야 합니다.

페이지의 요소를 선택할 때는 반드시 view에서 find하거나 view를 jQuery 함수의 context 인수(두 번째 인수)로 지정해야 합니다. 그렇지 않으면 다른 블록 페이지의 의도하지 않은 요소까지 선택되어 예측이 어려운 오류가 발생할 수 있습니다.

N(".view").cont()를 실행하면 selector로 지정한 `.view` 요소에 data-pageid="view"와 같이 pageid data 속성값이 생성됩니다. 이 pageid는 ".(점), #(샵), [(왼쪽 대괄호), ](오른쪽 대괄호), '(작은따옴표), :(콜론), ((왼쪽 괄호), )(오른쪽 괄호), >(오른쪽 화살괄호), 공백(스페이스), -(하이픈)" 문자들이 제거되어 pageid가 생성되니 페이지 식별값은 앞의 문자들이 포함되지 않도록 정의하는 것이 좋습니다.

예를 들면 N("page.view-01").cont()은 점과 하이픈이 제거되어 "pageview01"으로 pageid가 생성됩니다.

블록 페이지나 탭 콘텐츠 등에서 특정 페이지를 제어하기 위해 다음과 같이 Controller 오브젝트를 얻을 수 있습니다:

```javascript
var page01Cont = N("#page01").instance("cont");
page01Cont.gridInst.bind([]);
```

### 생성자

| Name | Arguments | Type | Return | Description |
|------|-----------|------|--------|-------------|
| N.cont | N/A | N/A | Controller object | Controller object를 초기화하고 Controller object를 반환합니다. N.cont는 Controller object를 등록하고 관리해 줍니다. |

```javascript
var controllerObject = N.cont(N(view), Controller object);
```

| 인자 | 타입 | 반환 | 설명 |
|------|------|------|------|
| view | jQuery object | N/A | view 영역을 jQuery object 타입으로 지정합니다. |
| Controller object | object | N/A | Controller object를 정의합니다. Controller object에 init 함수를 생성하면 view 로딩이 완료되면 init 함수를 실행해 줍니다. init 함수의 인수로 view 요소와 Communicator.request 객체가 반환됩니다. |

```javascript
N(".view").cont({
    init : function(view, request) {
    }
});
```

Controller object에서 jQuery나 $, N으로 요소를 선택할 때는 반드시 context 인수를 view로 지정해 줘야 합니다:

```javascript
N(".view").cont({
    init : function(view, request) {
        N("selector", view);
    }
});
```

| Name | Arguments | Type | Return | Description |
|------|-----------|------|--------|-------------|
| N().cont | N/A | N/A | N/A | Controller object를 jQuery 플러그인 방식으로 초기화합니다. |

```javascript
var controllerObject = N(view).cont(Controller object);
```

Controller object를 초기화하는 방식은 다르지만 "new N.cont"로 초기화한 Controller object와 "N().cont"로 초기화한 Controller object는 동일합니다. N() 함수의 첫 번째 인수가 new N.cont 생성자의 첫 번째 인수로 설정됩니다.

| 인자 | 타입 | 반환 | 설명 |
|------|------|------|------|
| Controller object | object | N/A | N.cont 함수의 두 번째 인수(Controller object)와 같습니다. |

### Controller 객체의 상수

Controller object에는 다음과 같은 상수 값들이 정의되어 있습니다:

| Name | Type | Description |
|------|------|-------------|
| view | jQuery object | view 요소입니다. init 함수의 첫 번째 인수 값과 동일합니다. |
| request | Communicator.request | Communicator.request 객체 인스턴스입니다. init 함수의 두 번째 인수 값과 동일합니다. |
| caller | N.popup instance\|N.tab instance | N.popup이나 N.tab 컴포넌트로 호출된 페이지일 경우 이 페이지를 로드한 N.popup이나 N.tab 인스턴스가 정의되어 있습니다. |
| opener | N.cont's object | N.popup이나 N.tab 컴포넌트로 호출된 페이지일 경우 이 페이지를 로드한 N.popup이나 N.tab 인스턴스가 포함된 Controller object(부모 페이지의 Controller object)가 정의되어 있습니다. opener 속성은 N.popup이나 N.tab 컴포넌트 인스턴스를 생성할 때 opener 옵션으로 해당 페이지의 Controller object를 지정해 줘야 합니다. |

### Controller 객체의 함수

| Name | Arguments | Type | Return | Description |
|------|-----------|------|--------|-------------|
| init | N/A | N/A | function(사용자 정의) | view 로딩과 Controller object 초기화가 완료된 다음 호출되는 사용자 정의 함수입니다. |

```javascript
N(".view").cont({
    init : function(view, request) {
    }
});
```

| 인자 | 타입 | 반환 | 설명 |
|------|------|------|------|
| view | jQuery object | N/A | view 요소입니다. |
| request | Communicator.request | N/A | 이 페이지를 로드한 Communicator(N.comm)의 Communicator.request 객체입니다. |

### 예제

1. View와 Controller 정의:

```html
<!-- View -->
<article class="view">
    <p>View</p>
</article>

<!-- Controller -->
<script type="text/javascript">
    N(".view").cont({
        init : function(view, request) {
            N("p", view).css("padding", "10px");
        }
    });
</script>
```

2. Controller object에 구현된 모든 함수의 scope에서 Controller object 참조하기:

```html
<article class="view">
    <p>View</p>
</article>

<script type="text/javascript">
(function() {

    var cont = N(".view").cont({
        init : function(view, request) {
            this.fn();
        },
        fn : function() {
           N("p", cont.view).css("padding", "10px");
        }
    });

})();
</script>
```

## AOP

### 개요

Natural-ARCHITECTURE는 Controller object를 대상으로 AOP(Aspect-Oriented Programming)를 지원합니다.

AOP 선언은 Config(natural.config.js)의 N.context.attr("architecture").cont.pointcuts 객체와 N.context.attr("architecture").cont.advisors 속성에 정의할 수 있고 pointcut으로 대상 Controller object를 지정하고 before / after / around / error adviceType을 지정하여 공통 로직을 실행할 수 있습니다.

Natural-JS의 AOP를 사용하면 UI 개발의 반복되는 로직들을 공통화하거나 템플릿화할 수 있어서 개발 생산성이 크게 향상됩니다.

> 주의: Controller object의 함수를 new 연산자를 통해 객체 인스턴스화하여 사용하면 오류가 발생합니다. 이런 경우 pointcut에서 해당 함수를 제외 바랍니다.

### pointcuts 객체

pointcuts 객체는 AOP 적용 대상이 되는 Controller object를 지정하는 객체입니다. 

> 자세한 pointcuts 객체 정보는 추후 내용이 추가될 예정입니다.

### advisors 객체

advisors 객체는 실제 AOP 동작을 정의하는 객체입니다.

> 자세한 advisors 객체 정보는 추후 내용이 추가될 예정입니다.

### 예제

> AOP 사용 예제는 추후 내용이 추가될 예정입니다.

## Communicator

(이 섹션은 추후 내용이 추가될 예정입니다)

## Communicator.request

(이 섹션은 추후 내용이 추가될 예정입니다)

## Communication Filter

(이 섹션은 추후 내용이 추가될 예정입니다)

## Context

(이 섹션은 추후 내용이 추가될 예정입니다)