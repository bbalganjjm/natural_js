# Natural-TEMPLATE 개발 가이드

Natural-TEMPLATE은 Natural-JS 기반 웹 애플리케이션 개발을 정형화하여 코드 가독성과 개발 생산성을 크게 향상시켜 주는 라이브러리입니다. 이 가이드는 Natural-TEMPLATE의 코드 작성 규칙을 설명합니다.

## 목차

- [소개](#소개)
- [설치](#설치)
- [개발 가이드](#개발-가이드)
  - [페이지 소스코드 작성 규칙](#페이지-소스코드-작성-규칙)
  - [Controller object(N.cont) 의 속성명 작성 규칙](#controller-objectncont-의-속성명-작성-규칙)
    - ["p." 으로 시작 - UI 컴포넌트 생성](#p-으로-시작---ui-컴포넌트-생성)
    - ["c." 으로 시작 - Communicator(N.comm) 선언](#c-으로-시작---communicatorncomm-선언)
    - ["e." 으로 시작 - 이벤트 바인딩](#e-으로-시작---이벤트-바인딩)

## 소개

Natural-TEMPLATE은 Natural-JS 기반 웹 애플리케이션 개발을 정형화하여 코드 가독성과 개발 생산성을 크게 향상시켜 줍니다. Natural-JS의 기본적인 사용법을 학습하려면 [Natural-JS 시작하기](DEVELOPER-GUIDE-GETTINGSTARTED.md) 문서를 참고하세요.

## 설치

1. [Github](https://github.com/bbalganjjm/natural_js)에서 natural.template.min.js 파일을 다운로드해서 다음과 같이 라이브러리를 import 합니다.

```html
<script type="text/javascript" src="js/natural_js/natural.template.min.js" charset="utf-8"></script>
```

2. [Config(natural.config.js)](DEVELOPER-GUIDE-CONFIG.md)에 다음 설정을 추가합니다. 속성에 대한 설명은 [Config(natural.config.js)](DEVELOPER-GUIDE-CONFIG.md) 메뉴의 N.context.attr("template") 탭을 참고하세요.

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
        "ko_KR" : {
            "MSG-0001" : "data 옵션을 정의해 주세요.",
            "MSG-0002" : "서버 오류가 발생하여 공통 코드 목록을 조회하지 못했습니다.",
            "MSG-0003" : "데이터 코드 목록을 조회하는 N.comm({0}) 이 없습니다.",
            "MSG-0004" : "서버 오류가 발생하여 데이터 코드 목록을 조회하지 못했습니다.",
            "MSG-0005" : "컴포넌트({0})가 잘못 지정되었습니다.",
            "MSG-0006" : "이벤트({0})가 잘못 지정되었습니다."
        }
    }
});
```

3. 마지막으로 [Config(natural.config.js)](DEVELOPER-GUIDE-CONFIG.md)의 N.context.attr("architecture").cont 속성에 다음과 같이 AOP Advice를 추가하여 설치를 완료합니다. Natural-JS의 AOP에 대한 설명은 [AOP](DEVELOPER-GUIDE-ARCHITECTURE.md) 페이지를 참고 바랍니다.

```javascript
"cont" : {
    "advisors" : [{
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
```

## 개발 가이드

### 페이지 소스코드 작성 규칙

기본적으로 Natural-JS의 블록 페이지들의 소스코드는 다음과 같이 구성해야 합니다. 먼저 [Controller](DEVELOPER-GUIDE-ARCHITECTURE.md) 메뉴에서 N.cont의 사용법과 유의사항을 참고하세요.

```html
<style>
    /* View(CSS) - 생략 가능하고 이 파일의 View에만 스타일을 적용하고 싶을 때만 추가 합니다. */
    .page-id {
        /* CSS 셀렉터를 선언할 때 .page-id #target { } 처럼 .page-id 를 먼저 추가해야 합니다. 그렇지 않으면 다른 페이지에도 영향을 미칩니다. */
    }
</style>

<article class="page-id">
    <!-- article 태그에 class 속성으로 page-id를 지정합니다. -->
</article>

<script type="text/javascript">
(function() {

    // N.cont 함수 실행시 View의 class 속성으로 정의된 "page-id" 값을 N의 인수로 넣어 줍니다.
    var cont = N(".page-id").cont({
        init : function(view, request) {
            // "init" 함수는 페이지 로드가 완료되면 자동으로 실행됩니다.
        }
    });

})();
</script>
```

### Controller object(N.cont) 의 속성명 작성 규칙

Natural-TEMPLATE의 기능은 Controller object 프로퍼티명의 명명규칙으로 실행할 수 있습니다. 컴포넌트를 초기화하거나 이벤트를 바인딩하는 등의 반복적인 작업들을 자동화해 줍니다.

#### "p." 으로 시작 - UI 컴포넌트 생성

아래와 같이 선언하면 Natural-UI의 컴포넌트를 지정한 요소에 생성하고 생성된 컴포넌트 인스턴스를 반환해 줍니다.
컴포넌트를 선언하는 Controller object의 속성명은 다음과 같이 조합하여 사용할 수 있습니다.

```javascript
"p.{컴포넌트명}.{요소id}" : {
    // 컴포넌트 옵션
}
```

초기화가 완료되면 `p.{컴포넌트명}.{요소id}` 속성 값으로 지정한 컴포넌트 옵션 객체는 생성된 컴포넌트의 인스턴스로 대체됩니다.

`p.select.{id}` 선언은 페이지의 view에서 해당 id 속성 값을 갖고 있는 모든 선택 요소에 Select(N.select) 컴포넌트를 초기화하고 생성된 컴포넌트 인스턴스들을 Array에 저장한 다음 속성 값을 대체합니다. Select 컴포넌트의 인스턴스를 사용할 때는 `cont["p.select.{id}"][1]`와 같이 사용할 인스턴스를 배열에서 꺼내어 사용해야 합니다.

컴포넌트 초기화 옵션은 `cont["p.{컴포넌트명}.{요소id}"].options`로 접근할 수 있으나 옵션의 직접 사용은 권장하지 않습니다.

```javascript
var cont = N(".page-id").cont({
    "p.select.id" : {
        // 컴포넌트 옵션
    },
    init : function(view, request) {
        N.log(cont["p.select.id"].val()); // 컴포넌트 인스턴스 사용.
    }
});
```

컴포넌트의 context 옵션은 id로 지정한 요소가 자동으로 할당되지만 id 아닌 class 셀렉터 등, 다른 셀렉터로 지정하려면 context 옵션을 직접 설정하면 됩니다.

```javascript
"p.form.detail" : {
    context : ".detail",
    revert : true,
    autoUnbind : true
},
```

위와 같이 context 옵션을 선언하면 `N(".detail", view)`와 같이 View 내에서 찾을 수 있는 구문이 자동으로 생성됩니다.

N.tab과 N.popup 컴포넌트의 **onOpen 옵션의 함수명 문자열은 반드시 onOpen으로 시작("onOpen", "onOpenABC" 등)해야 합니다**. 그렇지 않으면 Controller object의 init 함수보다 onOpen 함수가 먼저 실행되어서 컴포넌트 인스턴스 등을 참조하지 못할 수 있습니다.

N.tab 컴포넌트의 onActive 옵션은 주의해서 사용 바랍니다. init 함수의 지연 실행에 대한 대책이 아직 없어서 onActive가 init 보다 먼저 실행됩니다. 비슷한 안정적인 기능을 원한다면 onOpen을 사용해 주세요.

컴포넌트 옵션은 Natural-UI의 컴포넌트별 기본 옵션 외에 해당 컴포넌트의 용도를 지정하거나 초기화 후 바로 실행할 함수 등을 지정할 수 있는 옵션이 더 추가되어 있습니다.

##### N.select - 공통코드 데이터 바인딩

이 기능을 사용하려면 공통코드 데이터를 제공하는 서비스 URL과 공통코드 분류코드 컬럼명을 [Config(natural.config.js)](DEVELOPER-GUIDE-CONFIG.md)의 N.context.attr("template").codes 속성에 설정해 주어야 합니다.

| 속성 | 옵션명 | 타입 | 필수 여부 | 속성 값 | 설명 |
|-----|-------|-----|----------|---------|------|
| p.select.{id} | - | - | - | - | N.select 컴포넌트를 초기화합니다. |
| - | code | string | O | 공통코드 분류코드 | 바인딩할 코드 목록의 분류 코드값을 설정합니다. |
| - | filter | function | | 데이터 필터 | 공통코드 데이터를 필터링하여 바인딩합니다. |
| - | selected | string | | 기본 선택 값 | 컴포넌트 초기화 시 기본으로 선택될 선택지의 값을 설정합니다. |

```javascript
"p.select.gender" : {
    "code" : "gender",
    "selected" : "male"
}
```

`p.select.{id} : [ "code", filterFunction ]` 처럼 array 타입으로도 간단하게 선언할 수 있습니다. filter가 필요 없으면 `[ "code" ]` 만 선언해도 됩니다.

```javascript
"p.select.gender" : [ "gender" ]
```

"filter" 옵션 예제:

```javascript
"filter" : function (data) {
    // data(원래 데이터)를 가공하여 return 하면 가공된 데이터가 바인딩됩니다.
    return N(N.array.deduplicate(data, "age")).datasort("age"); // 중복 제거 후 정렬.
}
```

##### N.select - 일반 목록 데이터를 선택요소(select, radio, checkbox)에 바인딩

| 속성 | 옵션명 | 타입 | 필수 여부 | 속성 값 | 설명 |
|-----|-------|-----|----------|---------|------|
| p.select.{id} | - | - | - | - | N.select 컴포넌트를 초기화합니다. |
| - | comm | string | | 목록을 조회할 Communicator(N.comm) | Controller object에 선언한 "c.{serviceName}"을 지정합니다. |
| - | data | array[object] | | 바인딩할 데이터 | comm 옵션을 지정하지 않고 data 옵션으로 [{}, {}]와 같은 데이터를 직접 생성하여 바인딩할 수 있습니다. |
| - | key | string | O | 선택 요소의 명칭에 바인딩될 데이터 속성 명 | 조회한 데이터 객체에서 바인딩할 프로퍼티명을 설정합니다. |
| - | val | string | O | 선택 요소의 값에 바인딩될 데이터 속성 명 | 조회한 데이터 객체에서 바인딩할 프로퍼티명을 설정합니다. |
| - | filter | function | | 데이터 필터 | 공통코드 데이터를 필터링하여 바인딩합니다. |
| - | selected | string | | 기본 선택 값 | 컴포넌트 초기화 시 기본으로 선택될 선택지의 값을 설정합니다. |

```javascript
"p.select.age" : {
    "comm" : "c.getSampleCodeList",
    key : "age",
    val : "age",
    "filter" : function(data) {
        return N(N.array.deduplicate(data, "age")).datasort("age");
    },
    "selected" : "22"
}
```

`p.select.{id} : [ "comm", "key", "val", filterFunction ]` 처럼 Array 타입으로도 간단하게 선언할 수 있습니다. filter가 필요 없으면 `[ "comm", "key", "val" ]` 만 선언해도 됩니다.

```javascript
"p.select.age" : [ "c.getSampleCodeList", "age", "age", function(data) {
    return N(N.array.deduplicate(data, "age")).datasort("age");
}]
```

##### N.form

| 속성 | 옵션명 | 타입 | 필수 여부 | 속성 값 | 설명 |
|-----|-------|-----|----------|---------|------|
| p.form.{id} | - | - | - | - | N.form 컴포넌트를 초기화합니다. |
| - | usage | string or object | O | Form의 용도 | "search-box" 문자열을 입력하면 지정한 영역을 검색 박스 Form으로 생성해 줍니다. object 타입으로 좀 더 상세한 옵션을 지정할 수 있습니다.(하단 설명 참고). |

일반 폼 예제:

```javascript
"p.form.detail" : { // N.form 컴포넌트의 옵션
    revert : true,
    autoUnbind : true
}
```

검색 폼 예제:

```javascript
"p.form.search" : {
    "usage" : "search-box"
}
```

검색 폼에서 Enter 키 이벤트를 자동으로 처리하기 위해서는 메인 조회 버튼에 클래스 속성 값 "btn-search"를 추가해야 합니다.

좀더 상세한 옵션을 설정하려면 다음 예제와 같이 "search-box" 옵션을 object로 지정하면 됩니다.

"usage" 옵션이 "search-box"로 설정된 Form은 입력 요소에 Enter 키로 조회하는 이벤트 핸들러가 자동으로 바인딩됩니다. 이 Enter 키 이벤트 핸들러의 실행을 차단하고 다른 이벤트 핸들러를 등록하려면 "search-box" 옵션 객체의 "events" 속성에 이벤트 핸들러를 array 객체 안에 필요한 만큼 정의해 주면 됩니다.

```javascript
"p.form.search" : {
    "usage" : {
        "search-box" : {
            "defaultButton" : ".btn-search", // 엔터키를 눌렀을 때 클릭될 버튼 요소를 선택하는 selector 문자열
            "events" : [{ // 엔터키 이벤트를 차단하고 입력 요소에 이벤트를 직접 지정하고 싶을 때 추가합니다.
                "event" : "focusin", // 이벤트 유형
                "target" : "#name", // 검색 박스 안의 대상 요소를 선택하는 selector 문자열
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
}
```

##### 다른 모든 컴포넌트

| 속성 | 옵션 | 타입 | 필수 여부 | 속성 값 | 설명 |
|-----|------|-----|----------|---------|------|
| p.{component}.{id} | - | - | - | - | N.{component} 컴포넌트를 초기화합니다. N.alert을 제외한 모든 컴포넌트를 이와 같은 방법으로 초기화할 수 있습니다. |
| - | action | string | - | 컴포넌트 함수명 | 컴포넌트가 초기화 된 후에 지정한 함수를 바로 실행해 줍니다. |

Tab(N.tab) 예제:

```javascript
"p.tab.master" : { }
```

Popup(N.popup) 예제:

```javascript
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
}
```

Grid(N.grid) 예제:

```javascript
"p.grid.master" : {
    height : 200,
    select : true,
    selectScroll : false,
    onBind : function(context, data, isFirstPage, isLastPage) {
        if(isFirstPage) {
            this.select(0);
        }
    }
}
```

#### "c." 으로 시작 - Communicator(N.comm) 선언

서버와 통신하는 모든 [Communicator(N.comm)](DEVELOPER-GUIDE-ARCHITECTURE.md)를 Controller object의 멤버 변수로 선언할 수 있습니다. Communicator를 미리 선언해 놓으면 데이터의 흐름을 한눈에 확인할 수 있고 선언된 Communicator에 AOP를 적용할 수 있습니다.

Communicator를 선언하는 Controller object의 속성명은 다음과 같이 조합하여 사용할 수 있습니다.

```javascript
"c.{서비스명}" : function() { 
    return N(params).comm({url}); 
}
```

가능하다면 서비스명은 호출하는 URL의 마지막 경로의 서비스명과 동일하게 정의하고 중복되는 서비스명이 있다면 `getSampleListJson`과 같이 확장자까지 조합하여 정의합니다.

그래도 중복되는 서비스명이 있다면 목록 조회는 `get + {serviceName} + List`, 한건 조회는 `get + {serviceName}`, 다건(CUD) 저장은 `save + {serviceName} + List`, 입력은 `insert + {serviceName}`, 수정은 `update + {serviceName}`, 삭제는 `delete + {serviceName}`으로 정의 바랍니다.

```javascript
var cont = N(".page-id").cont({
    "c.PAGEID" : function() {
        // "sample/PAGEID.html" 페이지를 .box 요소 안에 불러오는 Communicator 정의
        return N(".box").comm("sample/PAGEID.html");
    },
    "c.getSampleList" : function() {
        // cont["p.form.search"]의 data를 파라미터로 사용하여 "sample/getSampleList.json" 서비스 호출
        return cont["p.form.search"].data(false).comm("sample/getSampleList.json");
    },
    init : function(view, request) {
        // Communicator를 사용하여 다른 페이지 삽입하기
        cont["c.PAGEID"]().submit();

        // Communicator를 사용하여 데이터 불러오기
        cont["c.getSampleList"]().submit(function(data) {
           cont["p.grid.master"].bind(data);
        });
    }
});
```

Communicator 선언은 직접 오브젝트나 값을 대입하는것이 아닌 실행 함수를 지정하는 방식으로, 사용 시 `cont["c.{서비스명}"]().submit`와 같이 함수 실행 구문 `()`을 추가하는것에 유의 바랍니다.

N.comm의 파라미터를 위 예제와 같이 N.form이나 N.grid, N.list 등의 데이터 관련 컴포넌트의 data() 메서드에 연결해 놓으면 컴포넌트의 최신 데이터가 요청 파라미터로 자동으로 지정됩니다.

#### "e." 으로 시작 - 이벤트 바인딩

view 안에 있는 요소들에 이벤트 바인딩을 Controller object에 선언하고 이벤트 핸들러를 정의할 수 있습니다.

a, button, input[type=button] 요소에 이벤트를 선언하면 N.button 컴포넌트가 자동으로 적용되고 Controller object 속성 값으로 정의한 이벤트 핸들러가 N.button의 인스턴스로 대체됩니다.

```javascript
"e.{요소id}.{이벤트유형}" : function(e, [idx]) {
    // 이벤트 핸들러
}
```

또는

```javascript
"e.{이벤트구분자}.{이벤트유형}" : {
    target : "{요소 selector}",
    handler : function(e, [idx]) {
        // Event handler
    }
}
```

id 이외의 속성을 가진 요소를 선택할 때는 target 속성에 jQuery selector 문자열을 지정하면 됩니다. 이때 셀렉터의 context를 view 요소로 지정하지 않아도 view 요소가 context 인수로 자동으로 지정됩니다.

이벤트 바인딩이 완료되면 `e.{요소id}.{이벤트유형}` 속성 값으로 정의한 이벤트 핸들러 함수는 대상요소(jQuery object)로 대체됩니다.

```javascript
var cont = N(".page-id").cont({
    "e.id.click" : function(e) { // 이벤트 바인딩이 완료되면 이 이벤트 핸들러 함수는 대상 요소(jQuery object)로 대체됩니다.
        e.preventDefault();

        cont["p.popup.dept"].open();
    },
    "e.id.click" : {
        target : ".div #id",
        handler : function(e) { // 이벤트 바인딩이 완료되면 이 이벤트 핸들러 함수는 대상 요소(jQuery object)로 대체됩니다.
            e.preventDefault();

            cont["p.popup.company"].open();
        }
    },
    init : function(view, request) {
        cont["e.id.click"].trigger("click"); // DOM 로딩이 완료되면 이 이벤트를 실행합니다.
    }
});
```

다음과 같이 컴포넌트에서 제공하는 이벤트도 적용 가능합니다.

```javascript
var cont = N(".page-id").cont({
    "e.dateInput.onSelect" : function(e, inputEle, selDate, isMonthonly, idx) { // N.datepicker의 onSelect 이벤트
        e.preventDefault();

        N.log(selDate.obj.formatDate(selDate.format)); // 선택한 날짜를 설정된 Date 포맷으로 추출하여 브라우저 콘솔에 출력.
    }
});
```

N.grid나 N.list 컴포넌트 안의 요소를 지정하면 이벤트 핸들러 함수의 마지막 인수에 **해당 요소가 포함된 행의 인덱스를 반환**해 줍니다.

rowHandler나 rowHandlerBeforeBind에서 행마다 이벤트를 바인딩하면 브라우저 Heap 메모리 사용량이 이벤트 수 X 행 수만큼 늘어나 웹 애플리케이션 성능이 저하됩니다. 아래 방법(이벤트 위임 적용)을 사용하면 이벤트에 의한 메모리 사용량을 크게 줄일 수 있습니다.

```javascript
var cont = N(".page-id").cont({
    "e.id.click" : function(e, idx) {
        e.preventDefault();

        N.log(cont["p.grid.id"].data()[idx]); // Print row data containing the clicked button to the browser console.
    }
});
```

아래와 같이 target 속성으로 요소를 지정하면 Selector의 context가 view 요소가 아닌 N.grid의 행 요소(tbody)로 설정됩니다.

```javascript
"e.col01.click" : {
    target : ".col01", // Selector의 context가 view 요소가 아닌 N.grid의 행 요소(tbody)로 설정됩니다.
    handler : function(e, idx) {
        // TODO
    }
}
```

Natural-JS는 내부 데이터와 입력된 데이터를 동기화하기 위해서 select 요소는 change 이벤트를, radio, checkbox 요소는 click 이벤트를, 그 외 text 입력 요소(text, textarea, number 등)는 focusout 이벤트를 사용합니다.

컴포넌트의 내부 데이터를 가져올 때는 반드시 위와 같은 이벤트유형으로 바인딩해 줘야 합니다. 그렇지 않으면 변경되기 이전의 데이터가 반환됩니다.

```javascript
var cont = N(".page-id").cont({
    "e.textInput.focusout" : function(e, idx) { // change 이벤트로 바인딩하면 변경되기 이전의 데이터가 반환됩니다.
        e.preventDefault();

        N.log(cont["p.grid.id"].val(idx, "textInput"));
    }
});
```