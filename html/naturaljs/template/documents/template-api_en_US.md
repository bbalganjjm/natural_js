Natural-TEMPLATE
===

목차
===
* [**Summary**](#summary)
* [**Install**](#install)
* [**API Menual**](#apimenual)
    * [Basic code writing rules for each file](#basiccodewritingrulesforeachfile)

    * [Rules for creating property names for Controller Objects](#rulesforcreatingpropertynamesforcontrollerobjects)

        * [1. Starts with "p."(UI component initialization)](#1startswithpuicomponentinitialization)
            * [1.1. N.select - Common code data binding](#11nselectcommoncodedatabinding)
            * [1.2. N.select - Binding general list data to select elements(select, radio, checkbox)](#12nselectbindinggenerallistdatatoselectelementsselectradiocheckbox)
            * [1.3. N.form](#13nform)
            * [1.4. All other components](#14allothercomponents)

        * [2. Starts with "c."(Communicator(N.comm) declaration)](#2startswithccommunicatorncommdeclaration)

        * [3. Starts with "e."(Event binding)](#3startswitheeventbinding)

# Summary
Natural-TEMPLATE is a package that formalizes the development of Natural-JS-based web applications. Natural-TEMPLATE significantly improves code readability and development productivity.

#Install
1. Download the natural.template.min.js file from [Github](https://github.com/bbalganjjm/natural_js/tree/master/dist) and load the library as follows.

```
<script type="text/javascript" src="js/natural_js/natural.template.min.js" charset="utf-8"></script>
```

2. Add the following setting to Config(natural.config.js).

```javascript
/**
 * Natural-TEMPLATE Config
 */
N.context.attr("template", {
    aop : {
        /**
         * Common code request information
         *
         * @codeUrl Common Code request URL
         * @codeKey Group code property name
         */
        codes : {
            codeUrl : "html/naturaljs/exap/data/code.json",
            codeKey : "code"
        }
    },
    /**
     * Multilingual Message
     */
    "message" : {
        "en_US" : {
            "MSG-0001" : "Define the data option.",
            "MSG-0002" : "The common code list could not be queried because a server error occurred.",
            "MSG-0003" : "There is no N.comm({0}) to query the data code list.",
            "MSG-0004" : "The data code list could not be queried because a server error occurred.",
            "MSG-0005" : "Component({0}) was incorrectly specified.",
            "MSG-0006" : "Event({0}) was incorrectly specified."
        }
    }
});
```

3. Finally, add AOP pointcut as follows to complete installation.

```javascript
...
"cont" : {
    "advisors" : [{ // Pointcut for executing onOpen after a delayed init on a popup or tab
        "pointcut" : "^onOpen",
        "adviceType" : "around",
        "fn" : function(cont, fnChain, args, joinPoint) {
            if(cont.onOpenDefer || (cont.caller && cont.caller.options.preload)) {
                joinPoint.proceed();
            } else {
                cont.onOpenDefer = $.Deferred().done(function() {
                    joinPoint.proceed();
                });
            }
        }
    }]
},
...
```


#API Menual

##Basic code writing rules for each file

Each page block is written as follows.

```javascript
<style>
    .page-id {
        /* View(CSS) - 퍼블리셔가 작성, 생략 가능하고 이 파일의 View 에만 스타일을 적용하고 싶을 때만 추가. */
        /* CSS 셀렉터를 선언 할 때는 반드시 .page-id #target { } 처럼 .page-id 를 맨 앞에 적어 주세요. 안그러면 다른 페이지에도 영향을 미칩니다. */
    }
</style>

<article class="page-id">
    <!-- View - 퍼블리셔가 작성 -->
    <!-- article 태그에 class 속성으로 page-id 를 지정 합니다. -->
</article>

<script type="text/javascript">
    (function() {

        // Controller - 업무 개발자가 작성
        // N.cont 함수를 실행 시킬 때 N의 인자로 view 의 class 속성으로 정의 한 "page-id" 값을 넣어 줍니다.
        var cont = N(".page-id").cont({
            init : function(view, request) {
                // 페이지 로딩 후 init 함수가 자동으로 실행 됩니다.
            }
        });

    })();
</script>
```

##Rules for creating property names for Controller Objects
N.cont 함수의 인자인 컨트롤러 객체는 미리 정의 된 속성명 룰 들이 있습니다. 미리 정의 된 속성명으로 객체 변수명을 선언 하고 객체나 함수등을 할당하면 AOP에 의해 N.cont 객체의 init 함수가 실행 되기 전에 정의한 작업들을 처리 해 줍니다.

###1. Starts with "p."(UI component initialization)
Natural-UI 의 컴포넌트 들을 자동으로 초기 화 해 줍니다.
컴포넌트 초기화 속성명은 다음과 같이 조합하여 사용할 수 있습니다.

```
"p.{컴포넌트명}.{요소ID}" : { 컴포넌트 옵션 }
```

초기화가 완료 되면 `p.{컴포넌트명}.{요소ID}` 속성값으로 지정한 컴포넌트 옵션 객체는 생성 된 컴포넌트의 인스턴스로 바뀝니다.

> 공통코드등을 처리하는 `p.select.{id}` 선언(N.select 컴포넌트)은 해당 view 페이지 안에 해당 id 로 정의 된 모든 요소들에 같은 데이터를 바인드 한 후 Array 객체 타입으로 인스턴스들을 담아 줍니다. 생성된 N.select 인스턴스를 직접 사용 할 때는 `cont["p.select.{id}"][index]` 와 같이 인스턴스의 `index 를 지정` 해 줘야 합니다.

> 컴포넌트 초기화 옵션은 `cont["p.{컴포넌트명}.{요소ID}"].options` 로 접근 할 수 있으나 옵션의 직접사용은 권장하지 않습니다. 컴포넌트의 안정성을 보장 받으려면 컴포넌트의 인스턴스에서 제공하는 메서드를 통해 기능을 사용 바랍니다.

```javascript
...
var cont = N(".page-id").cont({
    "p.select.id" : {
        // 컴포넌트 옵션
    },
    init : function(view, request) {
        N.log(cont["p.select.id"].val()); // 컴포넌트 인스턴스 사용.
    }
});
...
```

컴포넌트의 context 옵션은 {id}로 지정한 요소가 자동으로 할당 되나 id 아닌 class 셀렉터등의 다른 셀렉터로 직접 지정하려면 컴포넌트 context 옵션을 선언 하면 됩니다.

```javascript
...
"p.form.detail" : {
    context : ".detail",
    revert : true,
    autoUnbind : true
},
...
```

위와같이 context 옵션을 선언하면 내부에서는 `N(".detail", view)` 와 같이 view 안에서 찾아주는 구문을 자동으로 생성 해 줍니다.

>**N.tab 과 N.popup 컴포넌트의 `onOpen 옵션의 함수명 문자열은 반드시 onOpen 으로 시작("onOpen", "onOpenABC" 등)` 해야 합니다. 그렇지 않으면 AOP 에 의해 init 이 지연 실행 되기 때문에 init 보다 onOpen 이 먼저 실행 되어 자동으로 초기화 된 컴포넌트 인스턴스들을 참조하지 못할 수 있습니다.**

>**N.tab 컴포넌트의 onActive 옵션은 주의해서 사용바랍니다. init 지연 실행에 대한 대책이 아직 나오지 않아 onActive 가 init 보다 먼저 실행 됩니다. 안정적인 비슷한 기능을 원한다면 onOpen 을 사용 해 주세요.**

컴포넌트 옵션은 Natural-UI 의 컴포넌트별 기본 옵션 외에 해당 컴포넌트의 용도를 지정 하거나 초기화 후 바로 실행 할 함수 등을 지정 할 수 있는 옵션이 더 추가 되어 있습니다.
N.cont의 컴포넌트 별 추가 옵션들은 다음과 같습니다.

###1.1. N.select - Common code data binding
| 속성명 | 옵션명 | 변수타입 | 필수여부 | 기능 | 설명 |
| :--: | :--: | :--: | :--: | :--: | -- |
| p.select.{id} | - | - | - | - | N.select 컴포넌트를 초기화 한다 |
| - | code | string | O | 공통코드 분류코드 | 초기화 한 N.select 컴포넌트에 입력한 공통코드를 바인드 한다. |
| - | filter | function | | 데이터 필터 | 조회한 데이터를 가공하여 바인드 한다. |
| - | selected | string | | 기본 선택 코드 값 | 데이터를 바인드 한 후 기본으로 선택할 값. |
>p.select.{id} : [ "code", filterFunction ] 처럼 Array 타입으로도 간단하게 선언 할 수 있습니다.. filter 가 필요 없으면 [ "code" ] 만 선언 해도 됩니다.

###1.2. N.select - Binding general list data to select elements(select, radio, checkbox)
| 속성명 | 옵션명 | 변수타입 | 필수여부 | 기능 | 설명 |
| :--: | :--: | :--: | :--: | :--: | -- |
| p.select.{id} | - | - | - | - | N.select 컴포넌트를 초기화 한다 |
| - | comm | string | | 목록을 조회 할 N.comm(Communicator) | N.cont 오브젝트로 선언한 "c.{actionName}"(N.comm 참고) 을 입력한다. |
| - | data | array[object] | | comm 옵션을 지정 하지 않고 data 옵션으로 [{}, {}] 와 같이 데이터를 직접 작성 하여 바인드 할 수 있다. |
| - | key | string | O | 선택 요소의 명칭에 바인드 될 데이터 컬럼 명 | 조회 데이터의 컬럼명을 입력한다. |
| - | val | string | O | 선택 요소의 값에 바인드 될 데이터 컬럼 명 | 조회 데이터의 컬럼명을 입력한다. |
| - | filter | function | | 데이터 필터 | 조회한 데이터를 가공하여 바인드 한다. |
| - | selected | string | | 기본 선택 코드 값 | 데이터를 바인드 한 후 기본으로 선택할 값. |
####1.2.1. "filter" 옵션 예제
```javascript
...
"filter" : function (data) {
    // data : 원 데이터
    // return : 가공 된 데이터
    return N(N.array.deduplicate(data, "age")).datasort("age"); // 중복 제거 후 정렬
}
...
```
>p.select.{id} : [ "comm", "key", "val", filterFunction ] 처럼 Array 타입으로도 간단하게 선언 할 수 있습니다. filter 가 필요 없으면 [ "comm", "key", "val" ] 만 선언 해도 됩니다.

###1.3. N.form
| 속성명 | 옵션명 | 변수타입 | 필수여부 | 기능 | 설명 |
| :--: | :--: | :--: | :--: | :--: | -- |
| p.form.{id} | - | - | - | - | N.form 컴포넌트를 초기화 한다 |
| - | usage | string or object | O | Form 의 용도 | "search-box" 문자열 입력 시 지정한 영역을 검색박스 Form 으로 생성 해 준다. object 타입으로 좀 더 상세한 옵션을 지정할 수 있다(하단 설명 참고). |
>엔터 키 이벤트를 자동으로 처리하기 위해서 반드시 "btn-search"(조회버튼) 라는 class 속성값을 갖고있는 버튼요소(a 요소) 를 view 안에 추가 해 주어야 합니다.

 * "search-box" 옵션을 object 타입으로 지정.
```javascript
...
"p.form.search" : {
    "usage" : {
        "search-box" : {
            "defaultButton" : ".btn-search", // 엔터키를 눌렀을때 클릭 될 버튼 요소 selector
            "events" : [{ // 엔터키 이벤트가 실행되지 않고 입력요소의 이벤트를 직접 지정 하고 싶을 때 추가.
                "event" : "focusin", // 이벤트 명
                "target" : "#name", // 검색박스 안의 대상 요소 selector
                "handler" : function(e) { // 이벤트 핸들러
                    N.log(e);
                }
            }, {
                "event" : "click",
                "target" : ".id",
                "handler" : function(e) {
                    N.log(e);
                }
            }]
        }
    }
},
...
```

###1.4. All other components
| 속성명 | 추가옵션 | 변수타입 | 필수여부 | 기능 | 설명 |
| :--: | :--: | :--: | :--: | :--: | -- |
| p.{component}.{id} | - | - | - | - | 지정한 컴포넌트를 초기화 한다. N.alert 을 제외한 모든 컴포넌트를 이와 같은 방법으로 초기화 가능 하다. |


##2. Starts with "c."(Communicator(N.comm) declaration)
해당 컨트롤러 내에서 서버와 통신하는 모든 N.comm(Communicator) 들을 모두 정의 합니다.
N.comm 의 초기화 속성명은 다음과 같이 조합하여 사용할 수 있습니다.

```
"c.{액션명}" : function() { return N.comm; }
```

>액션명은 가능 하다면 호출하는 URL 의 액션명과 맞춰 주고 불가능 하면 반드시 목록 조회는 get{ActionName}List, 한건 조회는 get{ActionName}, 다건(CUD) 저장은 save{ActionName}, 입력은 insert{ActionName}, 수정은 update{ActionName}, 삭제는 delete{ActionName} 으로 정의 바랍니다.
```javascript
...
var cont = N(".page-id").cont({
    "c.PAGEID" : {
        // "sample/PAGEID.html" 페이지를 .box 요소안에 불러오는 커뮤니케이터 정의
        return N(".box").comm("sample/PAGEID.html");
    },
    "c.getSampleList" : {
        // cont["p.form.search"] 의 data 를 파라미터로 "sample/getSampleList.json" URL 호출
        return cont["p.form.search"].data(false).comm("sample/getSampleList.json");
    },
    init : function(view, request) {
        // 커뮤니케이터로 다른 페이지 삽입
        cont["c.PAGEID"]().submit();

        // 커뮤니케이터로 데이터 불러오기
        cont["c.getSampleList"]().submit(function(data) {
           cont["p.grid.master"].bind(data);
        });
    }
});
```

>커뮤니케이터들의 정의는 직접 오브젝트나 값을 대입하는것이 아닌 실행 함수를 지정 하는 방식이므로 사용시 `cont["c.{액션명}"]().submit` 와 같이 함수 실행 구문 `()` 을 추가하는것에 유의 바랍니다.
>커뮤니케이터의 파라미터를 위 예제와 같이 N.form 이나 N.grid / N.list 의 data() 메서드에 연결(정의) 해 놓으면 커뮤케이터의 submit 메서드가 호출 되는 시점의 컴포넌트 데이터를 서버로의 요청 파라미터로 쉽게 추출 할 수 있습니다.


##3. Starts with "e."(Event binding)
페이지(View) 안의 모든 요소들에 이벤트를 간단하게 정의 할 수 있습니다.
>a, button, input[type=button] 요소에 이벤트를 정의 하면 N.button 컴포넌트가 자동으로 초기화 되어 버튼으로 생성 됩니다.

이벤트의 초기화 속성명은 다음과 같이 조합하여 사용할 수 있습니다.

```
"e.{요소ID}.{이벤트명}" : 이벤트 핸들러
```

또는
```
"e.{이벤트구분자}.{이벤트명}" : {
    target : "{요소 Selector}",
    handler : 이벤트 핸들러
}
```


초기화가 완료 되면 `e.{요소ID}.{이벤트명}` 속성값으로 지정한 이벤트 핸들러 함수는 id로 지정한 요소(jQuery Object)로 바뀝니다.

```javascript
...
var cont = N(".page-id").cont({
    "e.id.click" : function(e) { // 선언한 이벤트 핸들러는 초기화 후(init 함수가 실행 되기 바로전) id 로 지정한 요소(jQuery Object)로 바뀝니다.
        e.preventDefault(); // e.preventDefault() 는 버튼 이벤트에는 반드시 추가 해 주세요.

        cont["p.popup.dept"].open();
    },
    "e.id.click" : {
        target : ".div #id",
        handler : function(e) { // 선언한 이벤트 핸들러는 초기화 후(init 함수가 실행 되기 바로전) target 으로 지정한 요소(jQuery Object)로 바뀝니다.
            e.preventDefault(); // e.preventDefault() 는 버튼 이벤트에는 반드시 추가 해 주세요.

            cont["p.popup.company"].open();
        }
    },
    init : function(view, request) {
        cont["e.id.click"].click(); // 페이지 초기화가 완료 되면 이벤트 실행.
    }
});
...
```

다음과 같이 컴포넌트에서 제공하는 이벤트도 적용 가능 합니다.
```javascript
...
var cont = N(".page-id").cont({
    "e.dateInput.onSelect" : function(e, inputEle, selDate, isMonthonly, idx) { // N.datepicker 의 onSelect 이벤트
        e.preventDefault();

        N.log(selDate.obj.formatDate(selDate.format)); // 선택한 날짜를 설정된 데이트포멧으로 추출하여 브라우저 콘솔에 출력.
    },
});
...
```

N.grid 나 N.list 컴포넌트 안의 요소를 지정 하면 이벤트 핸들러 함수의 마지막 인자에 `해당 요소가 속한 행 인덱스를 반환` 해 줍니다.
>rowHandler 에서 행 요소마다 이벤트를 바인딩 하면 브라우저 Heap 메모리 사용량이 (이벤트 수 X 행 수) 만큼 늘어나 웹 어플리케이션 성능이 저하 됩니다. 아래 방법(내부적으로 Event Delegation 기법 적용)을 사용하면 이벤트에 의한 메모리 사용량을 크게 줄일 수 있습니다.
```javascript
...
var cont = N(".page-id").cont({
    "e.id.click" : function(e, idx) {
        e.preventDefault(); // e.preventDefault() 는 버튼 이벤트에는 반드시 추가 해 주세요.

        N.log(cont["p.grid.id"].data()[idx]); // 클릭한 버튼이 속한 행 데이터를 브라우저 콘솔에 출력.
    }
});
...
```

> N.grid 나 N.list 컴포넌트 내부 요소의 id 와 다른 컴포넌트(N.form 등)의 id 가 중복되어 target 옵션으로 대상 요소를 직접 지정 할 때는 target 으로 지정한 selector 의 context 가 행(tbody 나 li) 요소로 자동 지정 됩니다. 때문에 이를 구분하기 위해서는 아래와 같이 대상요소에 class 속성을 추가하여 ".class#id" 와 같이 구분 해 줘야 합니다.

```javascript
...
<div class="sampleForm">
    <input id="col01">
</div>
<table class="sampleGrid">
    <tbody>
        <tr>
            <td>
                <input class="col01" id="col01">
            </td>
        </tr>
    </tbody>
</table>
...
var cont = N(".page-id").cont({
    "e.col01.click" : {
        target : ".col01#col01", // "#grid #col01" 로 지정하면 찾지 못함. 최상위 요소는 N.grid 의 <tr> 이라고 생각해야 함.
        handler : function(e, idx) {
            // TODO
        }
    }
});
...
```

>Natural-JS 는 내부 데이터와 입력 된 데이터를 동기화 하기 위해서 select 요소는 change 이벤트를, radio, checkbox 요소는 click 이벤트를, 그외 text 나 textarea 등의 요소는 focusout 이벤트를 사용 합니다.
때문에 대상 요소가 포함 된 컴포넌트의 내부 데이터를 가져올 때는 같은 이벤트로 바인딩 해 줘야 합니다. 그렇지 않으면 변경 되기 이전의 데이터가 반환 됩니다.

```javascript
...
var cont = N(".page-id").cont({
    "e.selectInput.change" : function(e, idx) {
        e.preventDefault();

        N.log(cont["p.grid.id"].val(idx, "selectInput")); // focusin 이벤트로 바인딩 하면 변경 되기 전 데이터가 반환 됩니다.
    },
    "e.radioCheckboxInput.click" : function(e, idx) {
        e.preventDefault();

        N.log(cont["p.grid.id"].val(idx, "radioCheckboxInput")); // focusin 이벤트로 바인딩 하면 변경 되기 전 데이터가 반환 됩니다.
    },
    "e.textInput.focusout" : function(e, idx) {
        e.preventDefault();

        N.log(cont["p.grid.id"].val(idx, "textInput")); // change 이벤트로 바인딩 하면 변경 되기 전 데이터가 반환 됩니다.
    }
});
...
```