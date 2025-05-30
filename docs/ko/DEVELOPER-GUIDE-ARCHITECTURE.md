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
   - [개요](#communicator-개요)
   - [생성자](#communicator-생성자)
   - [함수](#communicator-함수)
   - [예제](#communicator-예제)
4. [Communicator.request](#communicator-request)
   - [개요](#communicator-request-개요)
   - [기본 옵션](#communicator-request-기본-옵션)
   - [함수](#communicator-request-함수)
   - [예제](#communicator-request-예제)
5. [Communication Filter](#communication-filter)
   - [개요](#communication-filter-개요)
   - [필터 객체의 기본 옵션 및 함수](#필터-객체의-기본-옵션-및-함수)
     - [beforeInit](#필터-객체의-기본-옵션-및-함수)
     - [afterInit](#필터-객체의-기본-옵션-및-함수)
     - [beforeSend](#필터-객체의-기본-옵션-및-함수)
     - [success](#필터-객체의-기본-옵션-및-함수)
     - [error](#필터-객체의-기본-옵션-및-함수)
     - [complete](#필터-객체의-기본-옵션-및-함수)
   - [예제](#communication-filter-예제)
6. [Context](#context)
   - [개요](#context-개요)
   - [함수](#context-함수)
   - [예제](#context-예제)

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

### 개요 {#aop-개요}

Natural-ARCHITECTURE는 Controller object를 대상으로 AOP(Aspect-Oriented Programming)를 지원합니다.

AOP 선언은 Config(natural.config.js)의 N.context.attr("architecture").cont.pointcuts 객체와 N.context.attr("architecture").cont.advisors 속성에 정의할 수 있고 pointcut으로 대상 Controller object를 지정하고 before / after / around / error adviceType을 지정하여 공통 로직을 실행할 수 있습니다.

Natural-JS의 AOP를 사용하면 UI 개발의 반복되는 로직들을 공통화하거나 템플릿화할 수 있어서 개발 생산성이 크게 향상됩니다.

> 주의: Controller object의 함수를 new 연산자를 통해 객체 인스턴스화하여 사용하면 오류가 발생합니다. 이런 경우 pointcut에서 해당 함수를 제외 바랍니다.

### pointcuts 객체 {#pointcuts-객체}

natural.config.js 파일의 N.context.attr("architecture").cont.pointcuts 속성에 정의합니다.

| Name | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| pointcut name | object key string | undefined | X | advisor에서 사용할 사용자 pointcut을 정의합니다.<br>pointcut은 반드시 fn 속성에 param(정규표현식 문자열 혹은 RegExp 객체), cont(Controller object), fnChain(Controller object의 함수 체인(뷰의 selector:fnName.fnName...)) 인수를 갖고 있는 함수로 정의해야 합니다.<br>함수 수행 결과(boolean)는 advice의 적용 여부를 판단하는 데 사용됩니다. |

```javascript
"pointcuts" : {
    /** pointcut 객체를 유일한 속성명으로 정의합니다. */
    "regexp" : {
        /**
         * 정규 표현식으로 평가하는 사용자 포인트컷입니다.
         * (Built-in 함수를 제외하고 사용자가 정의한 함수에만 적용됩니다.)
         */
        "fn" : function(param, cont, fnChain){
            var regexp = param instanceof RegExp ? param : new RegExp(param);
            return regexp.test(fnChain);
        }
    },
    "errorPointcut" : {
        "fn" : function(param, cont, fnChain){
            // 무조건 허용
            return true;
        }
    }
}
```

Natural-ARCHITECTUE의 AOP 에는 정규식으로 평가하는 regexp 포인트컷이 기본 내장되어 있어 특별한 경우가 아니면 포인트컷을 따로 지정하지 않아도 됩니다.

### advisors 객체 {#advisors-객체}

natural.config.js 파일의 N.context.attr("architecture").cont.advisors 속성에 정의합니다.

| Name | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| pointcut | object key string\|object | undefined | O | advisor가 적용될 pointcut을 정의합니다.<br>Controller object의 함수명을 대상으로 지정합니다.<br><br>`"pointcut" : { "type" : "regexp", "param" : "^init$" }`<br><br>위와 같은 경우 pointcuts에서 regexp pointcut의 param 속성에 정의된 객체를 파라미터로 전달합니다.<br><br>`"pointcut" : "^init$"`<br><br>위와 같이 pointcut의 값이 객체가 아니고 regexp 문자열인 경우 내장된 "regexp" pointcut을 기본값으로 사용합니다.<br><br>pointcut param 속성 값 앞에 콜론(:)으로 구분하여 view 요소를 식별할 수 있는 jQuery selector 구문을 입력하면 선택된 페이지만 적용됩니다.<br><br>`"pointcut" : ".page01,#page02,.page03:^init$"` |
| adviceType | string | undefined | O | advisor의 실행 시점을 설정합니다.<br>**before**: pointcut으로 지정한 함수가 실행되기 전에 실행됩니다.<br>**after**: pointcut으로 지정한 함수가 실행된 후에 실행됩니다. pointcut으로 지정한 함수의 반환 값이 함께 전달됩니다.<br>**around**: pointcut으로 지정한 함수를 실행할 수 있는 joinPoint가 인수로 전달됩니다.<br>**error**: pointcut으로 지정한 함수에서 예외가 발생했을 때 실행됩니다. |
| fn | function | undefined | O | advisor 함수를 정의합니다.<br>adviceType 별 함수의 인수는 다음과 같습니다.<br><br>**before**<br>cont: Controller object<br>fnChain: 함수(명) 체인 문자열<br>args: 원본 함수의 arguments<br><br>**after**<br>cont: Controller object<br>fnChain: 함수(명) 체인 문자열<br>args: 원본 함수의 arguments<br>result: 원본 함수의 반환 값<br><br>**around**<br>joinPoint.proceed() 함수로 원본 함수를 실행합니다.<br>cont: Controller object<br>fnChain: 함수(명) 체인 문자열<br>args: 원본 함수의 arguments<br>joinPoint: 원본 함수 실행 객체<br><br>**error**<br>cont: Controller object<br>fnChain: 함수(명) 체인 문자열<br>args: 원본 함수의 arguments<br>e: errorThrown |

**before 예제**:
```javascript
"advisors" : [{
    "pointcut" : "^init$",
    "adviceType" : "before",
    "fn" : function(cont, fnChain, args) {
        // 페이지가 로딩된 후 init 함수가 호출되기 전에 실행됩니다.
    }
}]
```

**after 예제**:
```javascript
"advisors" : [{
    "pointcut" : "^init$",
    "adviceType" : "after",
    "fn" : function(cont, fnChain, args, result) {
        // 페이지가 로딩된 후 init 함수가 호출된 후에 실행됩니다.
    }
}]
```

**around 예제**:
```javascript
"advisors" : [{
    "pointcut" : "^init$",
    "adviceType" : "around",
    "fn" : function(cont, fnChain, args, joinPoint) {
        // 페이지가 로딩된 후 init 함수가 호출되기 전에 실행됩니다.

        // before
        var result = joinPoint.proceed();
        // after
    }
}]
```

**error 예제**:
```javascript
"advisors" : [{
    "pointcut" : {
        "type" : "errorPointcut", // pointcuts 객체 설명의 errorPointcut 참고(무조건 허용)
        "param" : ""
    },
    "adviceType" : "error",
    "fn" : function(cont, fnChain, args, result, e) {
        // Controller object에 정의한 함수에서 에러가 발생할 때마다 실행됩니다.
    }
}]
```

### 예제 {#aop-예제}

#### 1. AOP 선언

AOP 설정은 natural.config.js 파일의 N.context.attr("architecture").cont 속성에 설정합니다.

```javascript
N.context.attr("architecture", {
    ...
    "cont" : {
        "pointcuts" : {
            "regexp" : {
                "fn" : function(param, cont, fnChain){
                    var regexp = param instanceof RegExp ? param : new RegExp(param);
                    return regexp.test(fnChain);
                }
            },
            "errorPointcut" : {
                "fn" : function(param, cont, fnChain){
                    // Unconditionally allowed
                    return true;
                }
            }
        },
        "advisors" : [{
            "pointcut" : "^before.*",
            "adviceType" : "before",
            "fn" : function(cont, fnChain, args){
                console.log("call me before %s", fnChain);
            }
        }, {
            "pointcut" : "^after.*",
            "adviceType" : "after",
            "fn" : function(cont, fnChain, args, result){
                console.log("call me after %s", fnChain);
                console.log("reuslt", result);
            }
        }, {
            "pointcut" : "^around.*",
            "adviceType" : "around",
            "fn" : function(cont, fnChain, args, joinPoint){
                console.log("call me around %s", fnChain);
                var result = joinPoint.proceed();
                console.log("result ", result);
                return result;
            }
        }, {
            "pointcut" : {
                "type" : "errorPointcut",
                "param" : ""
            },
            "adviceType" : "error",
            "fn" : function(cont, fnChain, args, result, e) {
                console.log("call me error %s", fnChain);
            }
        }]
    },
    ...
}
```

#### 2. 모든 페이지에 공통코드를 불러와 N.select 컴포넌트로 요소들에 바인딩한 후 Controller object의 init을 지연 실행하기

```javascript
N.context.attr("architecture", {
    ...
    "cont" : {
        "advisors" : [{
            "pointcut" : "^init$",
            "adviceType" : "around",
            "fn" : function(cont, fnChain, args, joinPoint){
                // 1. 공통코드 데이터 가져오기
                N.comm("getCommCodeList.json").submit(function(data) {
                    // 2. N.select로 선택 요소에 공통코드 바인딩
                    N(data).select({
                        context : N("#select", cont.view)
                    }).bind()

                    // 3. init 함수 실행.
                    joinPoint.proceed();
                });
            }
        }]
    },
    ...
}
```

#### 3. 로드된 페이지의 버튼, 폼, 그리드, 리스트 컴포넌트들을 자동으로 초기화해 준 후에 init 함수 실행하기

```javascript
N.context.attr("architecture", {
    ...
    "cont" : {
        "advisors" : [{
            "pointcut" : "^init$",
            "adviceType" : "around",
            "fn" : function(cont, fnChain, args, joinPoint){
                // 1. 버튼 컴포넌트 초기화
                N(".button").button();

                // 2. 폼 컴포넌트 초기화
                N(".form", cont.view).each(function() {
                    N([]).form(this);
                })

                // 3. 리스트 컴포넌트 초기화
                N(".list", cont.view).each(function() {
                    N([]).list(this);
                })

                // 4. 그리드 컴포넌트 초기화
                N(".grid", cont.view).each(function() {
                    N([]).grid(this);
                })

                // 5. init 함수 실행.
                joinPoint.proceed();

                // 6. 이후에 각 컴포넌트의 인스턴스는 context에서 꺼내와서 사용.
                var grid01 = N("#grid01", cont.view).instance("grid"); // Natural-CORE의 instance 메서드 참고.
                grid01.bind([]);
            }
        }]
    },
    ...
}
```

## Communicator

### 개요 {#communicator-개요}

Communicator(N.comm)는 CVC Architecture Pattern의 Communicator 레이어를 구현한 클래스입니다. N.comm은 서버에 콘텐츠나 데이터를 요청하거나 파라미터를 전달하는 등 서버와의 Ajax 통신을 지원하는 라이브러리입니다.

N.comm 함수나 N().comm 메서드를 호출할 때 설정한 옵션(opts)은 Communicator.request 객체의 옵션으로 설정됩니다. Communicator.request 객체의 옵션에 대한 자세한 내용은 [Communicator.request](#communicator-request) 섹션의 기본 옵션 부분을 참고 바랍니다.

### 생성자 {#communicator-생성자}

| Name | Arguments | Type | Return | Description |
|------|-----------|------|--------|-------------|
| N.comm | N/A | N/A | N.comm | N.comm 인스턴스를 생성합니다. N.comm은 new 연산자로 인스턴스를 생성하지 않고 N.comm 객체를 직접 사용할 수 있습니다. N.comm 함수가 호출되거나 new 연산자로 N.comm 인스턴스를 생성하면 객체의 request 속성 값에 Communicator.request 객체 인스턴스가 생성되어 바인딩됩니다. |

```javascript
var comm = N.comm(param|element|url, opts|url);
```

| 인자 | 타입 | 반환 | 설명 |
|------|------|------|------|
| param\|element\|url | jQuery object[array[object]]\|jQuery object[object]\|jQuery object[element]\|object\|string | N/A | 첫 번째 인수에 object나 array[object] 타입의 객체가 들어있는 jQuery object로 설정하고 두 번째 인수(url)에 JSON 데이터를 반환하는 서버 URL을 설정하면 설정된 객체를 문자열로 변환한 후에 서버에 GET이나 POST 파라미터로 전달합니다. 이때 이 인수값은 Communicator.request의 기본 옵션의 data속성 값으로 설정됩니다. |
| opts\|url | object\|string | N/A | object 타입을 설정하면 Communicator.request 객체의 기본 옵션으로 설정됩니다. string 타입을 설정하면 Communicator.request 객체의 기본 옵션의 url 옵션으로 설정됩니다. |

데이터 전송 및 요청 예:
```javascript
N.comm({ "param" : "value" }, "data.json").submit(function(data) {});
```

type(HTTP METHOD) 옵션이 GET 일 경우 data속성 값(param)이 object 이거나 array[object] 타입이면 "q" 파라미터 키에 URL encoding된 파라미터 문자열이 값으로 설정됩니다.

예제:
```
data.json?q=%5B%7B%22param%22%3A%22value%22%7D%5D
// q=[{"param":"value"}]
```

GET 파라미터는 전송할 수 있는 데이터의 최대값이 있기 때문에 브라우저별 GET 파라미터의 최대 전송량을 파악하여 사용하기 바랍니다.

HTML 페이지 로딩:
```javascript
N.comm(N("#contents"), "page.html").submit();
```

첫 번째 인수에 HTML 요소가 담겨있는 jQuery object 타입을 설정하고 두 번째 인수(url)에 HTML 페이지를 반환하는 서버 URL을 설정하면 로드된 페이지가 지정된 요소에 삽입됩니다.

페이지에 파라미터를 전달하는 경우:
```javascript
N.comm(N("#contents"), "page.html").request.attr("pageParam", "value").submit();
```

| Name | Arguments | Type | Return | Description |
|------|-----------|------|--------|-------------|
| N().comm | N/A | N/A | N.comm | N.comm의 객체 인스턴스를 jQuery 플러그인 방식으로 생성합니다. |

```javascript
var comm = N(param|element).comm(opts|url);
```

객체 인스턴스를 생성하는 방식은 다르지만 "new N.comm()"로 생성한 인스턴스와 "N().comm"로 생성한 인스턴스는 동일합니다. N() 함수의 첫 번째 인수가 new N.comm 생성자의 첫 번째 인수로 설정됩니다.

N() 함수의 인수 타입 중에서 string 타입은 N.comm 생성자의 첫 번째 인수(url)로 설정되지 않습니다.

### 함수 {#communicator-함수}

| Name | Arguments | Type | Return | Description |
|------|-----------|------|--------|-------------|
| submit | N/A | N/A | N.comm | 서버에 요청을 보내고 성공한 서버 응답이 수신될 때 실행될 콜백 함수를 등록합니다. |

submit 함수에 callback 인수를 입력하지 않으면 Promise와 호환되는 xhr 객체가 반환되어 async/await 문법을 사용할 수 있습니다.

```javascript
// JSON Data
const fn1 = async () => {
    const data = await N.comm("data.json").submit();
};

// Catch exception
const fn2 = () => await N.comm("data.json").submit().then((data) => {
    console.log(data);
}).catch((e) => {
    console.error(e);
});

// HTML page
const fn3 = async () => {
    const data = await N("#page-container").comm("page.html").submit();
    console.log(data); // HTML Text
};
```

| 인자 | 타입 | 반환 | 설명 |
|------|------|------|------|
| callback | function(사용자 정의) | N/A | 요청이 성공했을 때 서버의 응답을 처리하는 콜백 함수를 정의합니다. HTML 페이지를 요청하면 콜백 함수의 인수로 로드한 페이지의 Controller object가 반환되고 이 외의 요청은 data 객체와 Communicator.request 객체가 반환됩니다. |

```javascript
// JSON Data
N.comm("data.json").submit(function(data, request) {
    N.log(data, request);
});

// HTML page
N("#page-container").comm("page.html").submit(function(cont) {
    N.log(cont); // cont : Controller object
});
```

| Name | Arguments | Type | Return | Description |
|------|-----------|------|--------|-------------|
| error | N/A | N/A | N.comm | submit 함수 호출 후 서버에서 Error 응답이 수신되거나 submit 메서드의 콜백 함수에서 에러가 발생했을 때 실행될 콜백 함수를 등록합니다. error 메서드를 여러 번 호출하여 콜백 함수를 여러 개 등록할 수 있습니다. |

| 인자 | 타입 | 반환 | 설명 |
|------|------|------|------|
| callback | function(사용자 정의) | N/A | 에러가 발생했을 때 에러를 처리하는 콜백 함수를 정의합니다. 콜백 함수의 this는 생성된 N.comm 인스턴스이고 다음과 같은 인수를 반환합니다: <br> - xhr(arguments[2]): jQuery XMLHTTPRequest <br> - textStatus(arguments[3]): "success"(submit 콜백에서 에러 발생 시) 또는 "error"(서버에서 오류 발생 시) <br> - e(arguments[0]): ErrorThrown <br> - request(arguments[1]): Communicator.request <br> - callback(arguments[4]): textStatus 값이 "success" 일 때 submit 메서드의 인수로 지정한 콜백 함수. |

```javascript
N.comm("data.json").error(function(xhr, textStatus, e, request, callback) {
    // 2. col01.length 오류에 대한 첫 번째 오류 처리
}).error(function(xhr, textStatus, e, request, callback) {
    // 3. col01.length 오류에 대한 두 번째 오류 처리
}).submit(function(data, request) {
    var col01;
    col01.length; // 1. undefined 관련 오류 발생
});
```

### 예제 {#communicator-예제}

1. 서버에서 데이터 조회
```javascript
// callback
N.comm("data.json").submit(function(data) {
    N.log(data);
});

// async / await
const fn = async () => {
    const data = await N.comm("data.json").submit();
    console.log(data);
};
fn();
```

2. 서버에 파라미터 전송 및 결과 데이터 조회
```javascript
// N 함수의 인수가 파라미터로 전송됩니다.
N({ "param1": 1, "param2": "Mark" }).comm("data.json").submit(function(data) {
    N.log(data);
});
```

3. 지정한 요소에 HTML 페이지 삽입하기
```html
<article id="view-0001"></article>

<script type="text/javascript">
    // "#view-0001" 요소에 "page.html" 페이지를 로드하고 "page.html" 페이지의 Controller object의 init 메서드를 실행해 줍니다.
    N("#view-0001").comm("page.html").submit(function(cont) {
        // cont : 불러온 페이지의 Controller object
        // 페이지 삽입이 완료된 후 실행됩니다.
    });

    const fn = async () => {
        const data = await N("#view-0001").comm("page.html").submit();
        console.log(data); // HTML Text
        const cont = N("#view-0001 .view_context__").instance("cont");
        console.log(cont); // 불러온 페이지의 Controller object
    };
    fn();
</script>
```

## Communicator.request

### 개요 {#communicator-request-개요}

Communicator.request는 N.comm이 초기화될 때마다 생성되는 요청 정보 객체입니다. N.comm() 함수의 옵션은 Communicator.request.options 객체에 저장이 되어 서버 요청의 헤더나 파라미터로 전달됩니다.

페이지 파일을 요청하면 Controller object의 init 함수의 두 번째 인수나 Controller object의 멤버 변수(this.request)로 전달됩니다. 전달된 request 객체로 요청 정보를 확인하거나 페이지 파라미터를 전달받을 수 있습니다.

### 기본 옵션 {#communicator-request-기본-옵션}

| Name | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| append | boolean | false | X | true로 설정하면 로드된 페이지를 덮어쓰지 않고 target 옵션으로 지정한 요소에 추가합니다. |
| urlSync | boolean | true | X | false로 설정하면 서버로 요청할 때의 location.href와 서버에서 응답을 받았을 때의 location.href가 다르더라도 응답을 차단하지 않습니다. 알 수 없는 이유로 서버 응답이 차단되었을 경우 이 옵션을 false로 설정해서 테스트해 보세요. |
| dataIsArray | boolean | false | X | true로 설정하면 N().comm에서 N 함수의 인수로 지정한 파라미터 객체를 array 타입으로 지정할 수 있습니다. Communicator를 N(params).comm(url).submit();와 같이 사용할 때 params의 객체 타입이 array일 때 dataIsArray 옵션이 false로 지정되어 있다면 array의 첫 번째 오브젝트만 전송됩니다. 이 문제의 원인은 jQuery 함수의 인수를 array(jQuery([{}])) 또는 object($({}))로 설정한 후에 get 함수를 호출하면 둘 다 array([{}])를 반환하기 때문입니다. 불편하더라도 array를 서버에 전송할 때는 dataIsArray를 true로 설정하거나 object에 array를 담아서 사용 바랍니다. Communicator를 N.comm(params, url).submit();와 같이 사용하면 dataIsArray 옵션을 true로 지정하지 않아도 params를 jQuery object로 만들지 않기 때문에 array 타입으로 전송됩니다. Natural-ARCHITECTURE v0.8.1.4 버전 이후에 적용되었습니다. |
| target | jQuery object | null | X | HTML 콘텐츠를 삽입할 요소를 지정합니다. Communicator를 N(".block").comm("page.html").submit();와 같이 사용할 경우 N("#block") 요소 오브젝트가 target 속성 값으로 지정됩니다. |
| contentType | string | application/json; charset=utf-8 | O | 서버 요청에 대한 contentType을 지정합니다. contentType 옵션은 jQuery.ajax 함수의 옵션이 그대로 적용됩니다. [jQuery.ajax](https://api.jquery.com/jQuery.ajax/) 매뉴얼의 settings 부분에서 contentType 속성을 참고하세요. |
| cache | boolean | false | X | true로 설정하면 요청된 페이지가 브라우저에 의해 캐싱됩니다. cache 옵션은 jQuery.ajax 함수의 옵션이 그대로 적용됩니다. [jQuery.ajax](https://api.jquery.com/jQuery.ajax/) 매뉴얼의 settings 부분에서 cache 속성을 참고하세요. |
| type | string | POST | X | 요청에 사용할 HTTP method(예: "POST", "GET", "PUT"). type 옵션은 jQuery.ajax 함수의 옵션이 그대로 적용됩니다. [jQuery.ajax](https://api.jquery.com/jQuery.ajax/) 매뉴얼의 settings 부분에서 type 속성을 참고하세요. |
| data | json object array 또는 json object | null | X | 서버로 전송될 데이터. string이 아닌 경우 string으로 변환됩니다. data 옵션은 jQuery.ajax 함수의 옵션이 그대로 적용됩니다. [jQuery.ajax](https://api.jquery.com/jQuery.ajax/) 매뉴얼의 settings 부분에서 data 속성을 참고하세요. |
| dataType | string(xml, json, script, or html) | "json" | X | 서버 응답 데이터의 유형(xml, json, script, or html)을 설정합니다. dataType 옵션은 jQuery.ajax 함수의 옵션이 그대로 적용됩니다. [jQuery.ajax](https://api.jquery.com/jQuery.ajax/) 매뉴얼의 settings 부분에서 dataType 속성을 참고하세요. |
| crossDomain | boolean | false | X | 동일한 도메인에서 crossDomain 요청(예: JSONP)을 강제로 수행하려면 crossDomain 값을 true로 설정하세요. 이를 통해서 다른 도메인으로 서버 사이드 리다이렉션 하는 것 등이 가능해집니다. crossDomain 옵션은 jQuery.ajax 함수의 옵션이 그대로 적용됩니다. [jQuery.ajax](https://api.jquery.com/jQuery.ajax/) 매뉴얼의 settings 부분에서 crossDomain 속성을 참고하세요. |

> N.comm은 jQuery.ajax 모듈을 사용하여 Ajax 요청을 처리합니다. jQuery.ajax의 beforeSend, success, error, complete 옵션을 제외한 옵션들은 N.comm에서도 그대로 적용됩니다.

### 함수 {#communicator-request-함수}

| Name | Arguments | Type | Return | Description |
|------|-----------|------|--------|-------------|
| attr | N/A | N/A | set: Controller.request 또는 get: anything | 로드할 페이지로 전달할 데이터를 지정하거나 전달된 데이터를 가져옵니다. attr 메서드의 인수의 개수가 2개이면 set으로 작동하고 1개이면 get으로 작동합니다. |

#### 매개변수

| 인자 | 타입 | 반환 | 설명 |
|------|------|------|------|
| name | string | N/A | 데이터명을 지정합니다. |
| obj | anything | N/A | 데이터 값을 지정합니다. |

### 예제 {#communicator-request-예제}

1. 로딩할 페이지에 데이터(페이지 파라미터) 전달하기:

```javascript
// 1.1. submit 메서드를 호출하기 전에 (Comunicator instance).request.attr("name", object) 명령을 실행합니다.
N(".view").cont({
    init : function(view, request) {
        N("#section").comm("page.html")
            .request.attr("data1", { data : ["1", "2"] })
            .request.attr("data2", ["3", "4"])
                .submit();
    }
});

// 1.2. 로딩된 페이지의 Controller object의 init 메서드에서 Communicator.request 인스턴스의 attr 메서드로 전달된 데이터를 가져옵니다.
N(".view").cont({
    init : function(view, request) {
        var data1 = request.attr("data1"); // { data : ["1", "2"] }
        var data2 = request.attr("data2"); // ["3", "4"]
    }
});
```

## Communication Filter

### 개요 {#communication-filter-개요}

Communication Filter는 N.comm을 통해 서버와 통신하는 모든 요청과 응답 또는 에러 발생 단계에서 공통 로직을 실행할 수 있는 기능입니다.

필터의 선언은 Config(natural.config.js)의 N.context.attr("architecture").comm.filters 객체의 속성에 정의할 수 있고 필터의 단계는 다음과 같습니다:

- beforeInit: N.comm이 초기화되기 전 실행됩니다.
- afterInit: N.comm이 초기화된 후에 실행됩니다.
- beforeSend: 서버에 요청을 보내기 전에 실행됩니다.
- success: 서버에서 성공 응답이 전달됐을 때 실행됩니다.
- error: 서버에서 에러 응답이 전달됐을 때 실행됩니다.
- complete: 서버의 응답이 완료되면 실행됩니다.

N.comm 대신 jQuery.ajax를 사용하면 Communication Filter를 사용할 수 없습니다.

### 필터 객체의 기본 옵션 및 함수 {#필터-객체의-기본-옵션-및-함수}

| Name | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| order | number | undefined | X | 필터 오브젝트의 실행 순서를 설정합니다. order 속성이 정의된 필터들이 먼저 실행된 다음 order 속성이 정의되지 않은 필터들이 실행됩니다. |
| beforeInit | function | undefined | X | N.comm이 초기화되기 전 실행되는 함수입니다. Controller object의 init 메서드가 실행되기 전이 아니고 N.comm이 인스턴스화 되기 전에 실행되는 이벤트입니다. |

**beforeInit 함수의 인수**:
- obj: Communicator의 comm 메서드를 호출하기 전에 N() 함수의 인수로 지정된 파라미터 데이터 객체 또는 페이지가 삽입될 요소입니다. 파라미터 데이터가 object 타입이면 Communicator에서 문자열로 변환하기 전의 원래 오브젝트(jQuery object 타입)가 반환되고 element 타입이면 선택한 요소가 반환됩니다. obj를 수정하여 반환하면 반환된 obj가 모든 Communicator에 적용됩니다.

이벤트 핸들러 함수에서 Error 객체를 반환하면 다음 단계의 필터가 실행되지 않습니다:

```javascript
afterInit : function(obj) {
    if(data && data.fail){
        return new Error("The filter stops executing after this.");
    }
}
```

| Name | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| afterInit | function | undefined | X | N.comm이 초기화된 후 실행되는 함수입니다. Controller object의 init 메서드가 실행되기 전이 아니고 N.comm이 인스턴스화 되기 전에 실행되는 이벤트입니다. |

**afterInit 함수의 인수**:
- request(arguments[0]): Communicator.request

이벤트 핸들러 함수에서 Error 객체를 반환하면 다음 단계의 필터가 실행되지 않습니다:

```javascript
afterInit : function(request) {
    if(data && data.fail){
        return new Error("stop filter execution after this");
    }
}
```

| Name | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| beforeSend | function | undefined | X | 서버에 요청을 보내기 전에 실행되는 함수입니다. |

**beforeSend 함수의 인수**:
- request(arguments[0]): Communicator.request
- xhr(arguments[1]): jQuery XMLHTTPRequest
- settings(arguments[2]): jQuery XMLHTTPRequest의 요청 정보

이벤트 핸들러 함수에서 Error 객체를 반환하면 다음 단계의 필터가 실행되지 않습니다:

```javascript
beforeSend : function(request, xhr, settings) {
    if(data && data.fail){
        return new Error("stop filter execution after this");
    }
}
```

| Name | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| success | function | undefined | X | 요청이 성공했을 때 실행되는 함수입니다. data 인수를 수정해서 return하면 수정된 data를 모든 N.comm의 응답 data로 받을 수 있습니다. |

**success 함수의 인수**:
- request(arguments[0]): Communicator.request
- data(arguments[1]): 서버 응답 데이터(JSON, HTML 등)
- textStatus(arguments[2]): 서버 응답 상태("success", "notmodified", "nocontent", "error", "timeout", "abort", or "parsererror")
- xhr(arguments[3]): jQuery XMLHTTPRequest

이벤트 핸들러 함수에서 Error 객체를 반환하면 다음 단계의 필터가 실행되지 않습니다:

```javascript
success : function(request, data, textStatus, xhr) {
    if(data && data.fail){
        return new Error("stop filter execution after this");
    }
}
```

| Name | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| error | function | undefined | X | 서버에서 에러가 발생했을 때 실행되는 함수입니다. |

**error 함수의 인수**:
- request(arguments[0]): Communicator.request
- xhr(arguments[1]): jQuery XMLHTTPRequest
- textStatus(arguments[2]): 서버 응답 상태("timeout", "error", "abort", and "parsererror")
- errorThrown(arguments[3]): Error thrown object

이벤트 핸들러 함수에서 Error 객체를 반환하면 다음 단계의 필터가 실행되지 않습니다:

```javascript
error : function(request, xhr, textStatus, errorThrown) {
    if(data && data.fail){
        return new Error("stop filter execution after this");
    }
}
```

| Name | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| complete | function | undefined | X | 서버의 응답이 완료되면 실행되는 함수입니다. |

**complete 함수의 인수**:
- request(arguments[0]): Communicator.request
- xhr(arguments[1]): jQuery XMLHTTPRequest
- textStatus(arguments[2]): 서버 응답 상태("success", "notmodified", "nocontent", "error", "timeout", "abort", or "parsererror")

이벤트 핸들러 함수에서 Error 객체를 반환하면 다음 단계의 필터가 실행되지 않습니다:

```javascript
complete : function(request, xhr, textStatus) {
    if(data && data.fail){
        return new Error("stop filter execution after this");
    }
}
```

### 예제 {#communication-filter-예제}

N.comm으로 호출되는 모든 요청과 응답이 정의한 필터를 통과하게 되므로 서버 요청과 응답 사이에 공통으로 적용해야 할 로직 등을 정의하면 됩니다. 필터 이벤트 핸들러 함수의 request 인수에는 Ajax 요청에 대한 유용한 정보가 포함되어 있습니다. request 객체에 대한 자세한 내용은 [Communicator.request](#communicator-request) 섹션을 참고 바랍니다.

필터를 여러 개 선언할 수 있으며 필터 오브젝트의 명칭(filters 객체의 필터 프로퍼티 명)은 자유롭게 지정하면 됩니다. filter 설정은 natural.config.js 파일의 N.context.attr("architecture").comm.filters 속성에 정의합니다.

```javascript
N.context.attr("architecture", {
    "comm" : {
        "filters" : {
            "exFilter1" : {
                /**
                 * 필터 실행 순서
                 */
                order : 1,
                /**
                 * N.comm이 초기화되기 전 실행됩니다. string으로 변환되지 않은 원래 유형의 파라미터를 가져올 수 있습니다.
                 */
                beforeInit : function(obj) {
                },
                /**
                 * N.comm이 초기화된 후 실행됩니다.(N.cont의 "init"이 아닙니다.)
                 */
                afterInit : function(request) {
                },
                /**
                 * 서버에 요청을 보내기 전에 실행됩니다.
                 */
                beforeSend : function(request, xhr, settings) {
                },
                /**
                 * 서버에서 성공 응답이 전달됐을 때 실행됩니다.
                 */
                success : function(request, data, textStatus, xhr) {
                    // data를 수정해서 반환하면 모든 Communicator의 submit 콜백 함수의 data 인수 값으로 반환됩니다.
                },
                /**
                 * 서버에서 에러 응답이 전달됐을 때 실행됩니다.
                 */
                error : function(request, xhr, textStatus, errorThrown) {
                },
                /**
                 * 서버의 응답이 완료되면 실행됩니다.
                 */
                complete : function(request, xhr, textStatus) {
                }
            },
            "exFilter2" : {
                order : 2,
                beforeInit : function(obj) {
                },
                afterInit : function(request) {
                },
                beforeSend : function(request, xhr, settings) {
                },
                success : function(request, data, textStatus, xhr) {
                },
                error : function(request, xhr, textStatus, errorThrown) {
                },
                complete : function(request, xhr, textStatus) {
                }
            }
        }
    }
});
```

## Context

### 개요 {#context-개요}

Context(N.context)는 Natural-JS 기반 애플리케이션의 Life-Cycle(페이지가 적재되고 다른 URL로 redirect 되기 전까지) 안에서 데이터의 영속성을 보장하는 공간입니다.

Natural-JS의 환경설정 값, 프레임워크 공통 메시지 등이 N.context 객체에 저장됩니다.

### 함수 {#context-함수}

| Name | Arguments | Type | Return | Description |
|------|-----------|------|--------|-------------|
| attr | N/A | N/A | set: N.context \| get: anything | Context에 저장할 데이터를 지정하거나 지정된 데이터를 얻어옵니다.<br>attr 메서드의 인수의 개수가 2개이면 set으로 작동하고 1개이면 get으로 작동합니다. |

#### 매개변수

| 인자 | 타입 | 반환 | 설명 |
|------|------|------|------|
| name | string | N/A | 데이터명을 지정합니다. |
| obj | anything | N/A | 데이터 값을 지정합니다. |

### 예제 {#context-예제}

1. Context에 데이터 저장하기:

```javascript
N.context.attr("globalInfo", {
    userId : "jeff1942",
    userNm : "Jeff beck"
});
```

2. Context에 저장된 데이터 가져오기:

```javascript
var globalInfo = N.context.attr("globalInfo");
```