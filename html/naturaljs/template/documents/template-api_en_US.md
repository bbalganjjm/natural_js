Natural-TEMPLATE
===
Natural-TEMPLATE is a package that formalizes the development of Natural-JS-based web applications. Natural-TEMPLATE significantly improves code readability and development productivity.

목차
===
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

#Install
1. Download the natural.template.min.js file from [Github](https://github.com/bbalganjjm/natural_js/tree/master/dist) and load the library as follows.

```
<script type="text/javascript" src="js/natural_js/natural.template.min.js" charset="utf-8"></script>
```

2. Add the following setting to [Config(natural.config.js)](#cmVmcjAxMDIlMjRDb25maWckaHRtbCUyRm5hdHVyYWxqcyUyRnJlZnIlMkZyZWZyMDEwMi5odG1s). For a description of properties, refer to the **N.context.attr("template")** tab in the [Config(natural.config.js)](#cmVmcjAxMDIlMjRDb25maWckaHRtbCUyRm5hdHVyYWxqcyUyRnJlZnIlMkZyZWZyMDEwMi5odG1s) menu.

```
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

```
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

##Rules for creating property names for Controller object
Natural-TEMPLATE functions can be executed using the naming convention for controller object property names. Automate repetitive tasks such as initializing components and binding events.

###1. Starts with "p." - UI component initialization
Automatically initialize the components of Natural-UI.
Component initialization property names can be used in combination as follows.

```
"p.{Component name}.{Element id}" : {
    // Component options
}
```

When initialization is complete, the component option object specified by the `p.{Component name}.{Element id}` property value is replaced with an instance of the created component.

> The `p.select.{id}` declaration initializes the Select(N.select) component for all selected elements that have the corresponding id attribute value in the page view, stores the created component instances in the Array, and replaces the property value. When using an instance of the Select component, an instance to be used such as `cont["p.select.{id}"][1]` must be taken out of the Array and used.

> Component initialization options can be accessed with `cont["p.{Component name}.{Element id}"].options`, but direct use of the options is not recommended.

```
...
var cont = N(".page-id").cont({
    "p.select.id" : {
        // Component options
    },
    init : function(view, request) {
        N.log(cont["p.select.id"].val()); // Using component instances.
    }
});
...
```

In the context option of the component, the element specified by {id} is automatically assigned, but if you want to specify another selector, such as a class selector other than id, you can set the context option directly.

```
...
"p.form.detail" : {
    context : ".detail",
    revert : true,
    autoUnbind : true
},
...
```

As above, even if no context is specified in the selector of the context option, the view element of the page is automatically specified as the context argument of the selector .

`context : ".detail"` => `context : N(".detail", cont.view)`

>**The function name string of the `onOpen option of N.tab and N.popup components must start with onOpen (“onOpen”, “onOpenABC”, etc.). Otherwise, the onOpen function is executed before the init function of the Controller object, so you may not be able to reference component instances.**

>**Use the onActive option of N.tab component with caution. There is no countermeasure against delayed execution of the init function, so onActive is executed before init. Use onOpen if you want a similar, stable feature.**

As for component options, in addition to the default options for each component of Natural-UI, the option to specify the usage of the component or to execute the function immediately after initialization is added.
Additional options for each component available only in Natural-TEMPLATE are as follows.

###1.1. N.select - Common code data binding

**To use this function, the service URL that provides common code data and the common code classification code column name must be set in the N.context.attr("template").codes property of [Config(natural.config.js)](#cmVmcjAxMDIlMjRDb25maWckaHRtbCUyRm5hdHVyYWxqcyUyRnJlZnIlMkZyZWZyMDEwMi5odG1s).**

| Property | Option name | Type | Required | Property value | Description |
| :--: | :--: | :--: | :--: | :--: | -- |
| p.select.{id} | - | - | - | - | Initialize the N.select component. |
| - | code | string | O | Common code classification code | Set the classification code value of the code list to be bound. |
| - | filter | function | | Data filter | Filter and bind common code data. |
| - | selected | string | | Default selection value | When initializing a component, set the value of the option to be selected by default. |

```
...
"p.select.gender" : {
    "code" : "gender",
    "selected" : "male"
},
...
```

 * You can also simply declare by an array type option like p.select.{id} : [ "code", filterFunction ]. If you don't need a filter, you can also only declare ["code"].

```
...
"p.select.gender" : [ "gender" ],
...
```

 * Example "filter" option
```
...
"filter" : function (data) {
    // When the data (original data) is processed and returned, the processed data is bound.
    return N(N.array.deduplicate(data, "age")).datasort("age"); // Sort after deduplication.
}
...
```

###1.2. N.select - Binding general list data to select elements(select, radio, checkbox)
| Property | Option name | Type | Required | Property value | Description |
| :--: | :--: | :--: | :--: | :--: | -- |
| p.select.{id} | - | - | - | - | Initialize the N.select component. |
| - | comm | string | | Communicator(N.comm) for get the list | Specify "c.{actionName}" declared in the Controller object. |
| - | data | array[object] | | Data to bind | You can directly create and bind data such as [{}, {}] with the data option without specifying the comm option. |
| - | key | string | O | Data property name to be bound to the name of the option element | Set the property name to be bound in the retrieved data object. |
| - | val | string | O | Data property name to be bound to the value of the option element | Set the property name to be bound in the retrieved data object. |
| - | filter | function | | Data filter | Filter and bind common code data. |
| - | selected | string | | Default selection value | When initializing a component, set the value of the option to be selected by default. |

```
...
"p.select.age" : {
    "comm" : "c.getSampleCodeList",
    key : "age",
    val : "age",
    "filter" : function(data) {
        return N(N.array.deduplicate(data, "age")).datasort("age");
    },
    "selected" : "22"
},
...
```

 * You can also simply declare by an array type option like p.select.{id} : [ "comm", "key", "val", filterFunction ]. If you don't need a filter, you can also only declare [ "comm", "key", "val" ].

```
...
"p.select.age" : [ "c.getSampleCodeList", "age", "age", function(data) {
    return N(N.array.deduplicate(data, "age")).datasort("age");
}],
...
```

###1.3. N.form
| Property | Option name | Type | Required | Property value | Description |
| :--: | :--: | :--: | :--: | :--: | -- |
| p.form.{id} | - | - | - | - | Initialize the N.form component. |
| - | usage | string or object | O | Usage of Form | If you input the string "search-box", the specified area is created as a search box form. You can specify more detailed options with the object type(See description below). |

 * General form example
```
...
"p.form.detail" : { // N.form component options
    revert : true,
    autoUnbind : true
},
...
```


 * Search form example

```
...
"p.form.search" : {
    "usage" : "search-box"
},
...
```

>In order to automatically handle the Enter key event in the search form, you must add a button element(a element) with a class attribute value of "btn-search"(search button) into the view element.

To set more detailed options, you can specify the "search-box" option as object as in the following example.

>Form with the "usage" option set to "search-box" is automatically bound to the event handler that is searched with the Enter key on the input element. To block the execution of this Enter key event handler and bind another event handler, define as many event handlers as necessary in the "events" property of the "search-box" option object.

```
...
"p.form.search" : {
    "usage" : {
        "search-box" : {
            "defaultButton" : ".btn-search", // A selector string that selects the button element to be clicked when the enter key is pressed.
            "events" : [{ // Add when you want to block the Enter key event and assign the event directly to the input element.
                "event" : "focusin", // Event name
                "target" : "#name", // Selector string to select the target element in the search box
                "handler" : function(e) { // Event handler
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
| Property | Option name | Type | Required | Property value | Description |
| :--: | :--: | :--: | :--: | :--: | -- |
| p.{component}.{id} | - | - | - | - | N.{component} 컴포넌트를 초기화 합니다. N.alert 을 제외한 모든 컴포넌트를 이와 같은 방법으로 초기화 가능합니다. |

 * Tab(N.tab) example

```
...
"p.tab.master" : { },
...
```

 * Popup(N.popup) example

```
...
"p.popup.dept" : {
    url : "html/naturaljs/template/samples/type04P0.html",
    onOpen : "onOpen",
    height: 621,
    onClose : function(onCloseData) {
        if (onCloseData) {
            cont["p.form.detail"]
            .val("deptNm", onCloseData.deptNm)
            .val("deptCd", onCloseData.deptCd);
        }
    }
},
...
```

 * Grid(N.grid) example

```
...
"p.grid.master" : {
    height : 200,
    select : true,
    selectScroll : false,
    onBind : function(context, data, isFirstPage, isLastPage) {
        if(isFirstPage) {
            this.select(0);
        }
    }
},
...
```

##2. Starts with "c." - Communicator(N.comm) declaration
서버와 통신하는 모든 Communicator(N.comm) 들을 Controller object 의 멤버변수로 정의 할 수 있습니다. Communicator를 미리 선언 해 놓으면 데이터의 흐름을 한눈에 확인할 수 있고 Communicator 들에 대한 AOP 설정이 가능 합니다.
N.comm 의 초기화 속성명은 다음과 같이 조합하여 사용할 수 있습니다.

```
"c.{action name}" : function() { return N.comm; }
```

>가능 하다면 액션명은 호출하는 URL 의 서비스명과 맞춰 주고 불가능 하면 반드시 목록 조회는 get{ActionName}List, 한건 조회는 get{ActionName}, 입력은 insert{ActionName}, 수정은 update{ActionName}, 삭제는 delete{ActionName}, 입력/수정/삭제를 한번에 처리하는 Communicator는 save{ActionName}로 정의 바랍니다.

```
...
var cont = N(".page-id").cont({
    "c.PAGEID" : {
        // "sample/PAGEID.html" 페이지를 .box 요소안에 불러오는 커뮤니케이터 정의
        return N(".box").comm("sample/PAGEID.html");
    },
    "c.getSampleList" : {
        // cont["p.form.search"] 의 data 를 파라미터로 "sample/getSampleList.json" 서비스 호출
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

>N.comm의 선언은 직접 오브젝트나 값을 대입하는것이 아닌 함수를 선언하는 방식이므로 `cont["c.{액션명}"]().submit` 와 같이 선언된 함수를 실행해야 N.comm 인스턴스가 반환 됩니다.

>N.comm의 파라미터를 위 예제와 같이 데이터관련 컴포넌트(Grid, List, Form 등)의 data() 메서드에 연결(정의) 해 놓으면 N.comm의 submit 메서드가 호출 되는 시점의 컴포넌트 데이터가 서버의 요청 파라미터로 전송 됩니다.

##3. Starts with "e." - Event binding
페이지의 view 요소 안에 있는 요소들에 이벤트 바인딩을 선언 할 수 있습니다.

>a, button, input[type=button] 요소에 이벤트를 정의 하면 N.button 컴포넌트가 자동으로 초기화 되어 버튼으로 생성 됩니다.

이벤트의 초기화 속성명은 다음과 같이 조합하여 사용할 수 있습니다.

```
"e.{요소id}.{이벤트명}" : 이벤트 핸들러
```

또는

```
"e.{이벤트구분자}.{이벤트명}" : {
    target : "{요소 Selector}",
    handler : 이벤트 핸들러
}
```

요소의 id 가 아닌 다른 속성으로 선택할 때는 target 속성에 jQuery selector 문자열을 지정 하면 됩니다. 이때 셀렉터의 context 에 view 요소를 지정하지 않아도 자동으로 지정 됩니다.

이벤트 바인딩이 완료 되면 `e.{요소id}.{이벤트명}` 속성값으로 지정한 이벤트 핸들러 함수는 id로 지정한 요소(jQuery object)로 바뀝니다.

```
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

```
...
var cont = N(".page-id").cont({
    "e.dateInput.onSelect" : function(e, inputEle, selDate, isMonthonly, idx) { // N.datepicker 의 onSelect 이벤트
        e.preventDefault();

        N.log(selDate.obj.formatDate(selDate.format)); // 선택한 날짜를 설정된 데이트포멧으로 추출하여 브라우저 콘솔에 출력.
    },
});
...
```

N.grid 나 N.list 컴포넌트 안의 요소를 지정 하면 이벤트 핸들러 함수의 마지막 인자에 `해당 요소가 포함된 행의 인덱스를 반환` 해 줍니다.
>rowHandler 에서 행 요소마다 이벤트를 바인딩 하면 브라우저 Heap 메모리 사용량이 (이벤트 수 X 행 수) 만큼 늘어나 웹 어플리케이션 성능이 저하 됩니다. 아래 방법(내부적으로 Event Delegation 기법 적용)을 사용하면 이벤트에 의한 메모리 사용량을 크게 줄일 수 있습니다.
```
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

```
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

```
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