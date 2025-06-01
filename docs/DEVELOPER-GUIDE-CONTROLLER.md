# Natural-JS Controller 개발자 가이드

Natural-JS의 Controller(N.cont)는 CVC(Controller-View-Communicator) 아키텍처 패턴의 Controller 레이어를 구현한 클래스입니다. 이 문서에서는 Controller의 개념, 사용법, 주요 기능에 대해 설명합니다.

## 목차

1. [개요](#개요)
2. [Controller 구조](#controller-구조)
3. [Controller 생성자](#controller-생성자)
4. [Controller 객체의 상수](#controller-객체의-상수)
5. [Controller 객체의 함수](#controller-객체의-함수)
6. [Controller 객체의 속성](#controller-객체의-속성)
7. [Controller 사용 패턴](#controller-사용-패턴)
8. [Controller와 View의 관계](#controller와-view의-관계)
9. [실전 예제](#실전-예제)
10. [주의사항](#주의사항)

## 개요

Controller(N.cont)는 CVC 아키텍처 패턴의 Controller 레이어를 구현한 클래스입니다. Controller 객체는 View의 요소들과 Communicator에서 검색한 데이터를 제어하는 역할을 합니다.

![Natural-ARCHITECTURE](../images/intr/pic4.png)

<center>[ Natural-ARCHITECTURE ]</center>

N.cont는 Controller 객체의 init 함수를 실행하고 Controller 객체를 반환합니다. Controller 객체는 페이지의 View 영역 바로 아래에 선언되어야 합니다.

## Controller 구조

Controller는 다음과 같은 기본 구조를 가집니다:

```html
<article class="view">
    <p>View 영역</p>
</article>

<script type="text/javascript">
    N(".view").cont({ // Controller 객체
        init : function(view, request) {
            // 초기화 코드
        }
    });
</script>
```

N.popup, N.tab 컴포넌트나 N.comm 라이브러리로 위와 같은 구조의 페이지를 불러오면 페이지 로딩이 완료되었을 때 Controller 객체의 init 함수가 호출됩니다.

> Natural-ARCHITECTURE 기반 페이지가 제대로 작동하려면 반드시 N.comm 라이브러리나 N.popup, N.tab 컴포넌트로 로딩되어야 합니다.

## Controller 생성자

### N.cont

N.cont 생성자는 다음과 같은 형식으로 사용합니다:

```javascript
var controller = N(view).cont(obj);
```

| 인자 | 타입 | 설명 |
|------|------|------|
| view | jQuery 객체 또는 selector 문자열 | Controller 객체가 제어할 View 영역을 지정합니다. |
| obj | Object | Controller 객체를 정의합니다. |

반환값:
- **Object**: 초기화된 Controller 객체를 반환합니다.

Controller 객체는 다음과 같은 기본 구조를 가집니다:

```javascript
{
    // 필수: Controller 객체가 초기화될 때 자동으로 호출됩니다.
    init : function(view, request) {
        // 초기화 코드
    },
    
    // 선택: 사용자 정의 함수들
    fn1 : function() {
        // 사용자 정의 함수 1
    },
    fn2 : function() {
        // 사용자 정의 함수 2
    }
}
```

## Controller 객체의 상수

Controller 객체는 다음과 같은 상수를 제공합니다:

| 상수명 | 설명 |
|-------|------|
| CONTINUE | 함수 체인에서 다음 함수로 계속 진행할 것을 나타냅니다. |
| BREAK | 함수 체인에서 다음 함수로의 진행을 중단할 것을 나타냅니다. |

이 상수들은 함수 체인에서 흐름 제어를 위해 사용됩니다.

## Controller 객체의 함수

Controller 객체는 다음과 같은 기본 함수를 제공합니다:

### init

Controller 객체가 초기화될 때 자동으로 호출되는 함수입니다.

```javascript
init : function(view, request) {
    // 초기화 코드
}
```

| 인자 | 타입 | 설명 |
|------|------|------|
| view | jQuery 객체 | Controller 객체가 제어하는 View 영역입니다. |
| request | Object | 페이지 요청 시 전달된 파라미터 객체입니다. |

### get

Controller 객체 내의 다른 함수나 속성에 접근하기 위한 함수입니다.

```javascript
controller.get("fn1");
```

| 인자 | 타입 | 설명 |
|------|------|------|
| name | String | 접근하려는 함수나 속성의 이름입니다. |

반환값:
- **Function 또는 Object**: 지정된 이름의 함수나 속성을 반환합니다.

### set

Controller 객체에 새로운 함수나 속성을 추가하기 위한 함수입니다.

```javascript
controller.set("fn3", function() {
    // 새로운 함수
});
```

| 인자 | 타입 | 설명 |
|------|------|------|
| name | String | 추가할 함수나 속성의 이름입니다. |
| fn | Function 또는 Object | 추가할 함수나 속성의 값입니다. |

반환값:
- **Object**: Controller 객체 자신을 반환합니다.

## Controller 객체의 속성

Controller 객체는 다음과 같은 기본 속성을 가집니다:

| 속성명 | 타입 | 설명 |
|-------|------|------|
| view | jQuery 객체 | Controller 객체가 제어하는 View 영역입니다. |
| ctx | String | Controller 객체의 컨텍스트(selector)입니다. |
| request | Object | 페이지 요청 시 전달된 파라미터 객체입니다. |
| caller | Object | 이 Controller 객체를 호출한 객체입니다. |

## Controller 사용 패턴

Controller 객체는 다양한 패턴으로 사용할 수 있습니다. 가장 일반적인 패턴은 다음과 같습니다:

### 1. 즉시 실행 함수 패턴

```javascript
(function() {
    var cont = N(".view").cont({
        init : function(view, request) {
            // 초기화 코드
        },
        fn1 : function() {
            // 사용자 정의 함수 1
        }
    });
})();
```

이 패턴은 Controller 객체를 즉시 실행 함수로 감싸서 전역 네임스페이스를 오염시키지 않도록 합니다.

### 2. 초기화 함수 분리 패턴

```javascript
(function() {
    var cont = N(".view").cont({
        init : function(view, request) {
            cont.initComponents();
            cont.bindEvents();
        },
        initComponents : function() {
            // 컴포넌트 초기화 코드
        },
        bindEvents : function() {
            // 이벤트 바인딩 코드
        }
    });
})();
```

이 패턴은 초기화 코드를 여러 함수로 분리하여 가독성과 유지보수성을 높입니다.

### 3. 모듈화 패턴

```javascript
(function() {
    var cont = N(".view").cont({
        init : function(view, request) {
            cont.module1.init();
            cont.module2.init();
        },
        module1 : {
            init : function() {
                // 모듈 1 초기화 코드
            },
            fn1 : function() {
                // 모듈 1 함수 1
            }
        },
        module2 : {
            init : function() {
                // 모듈 2 초기화 코드
            },
            fn1 : function() {
                // 모듈 2 함수 1
            }
        }
    });
})();
```

이 패턴은 Controller 객체를 여러 모듈로 분리하여 대규모 애플리케이션에서의 코드 관리를 용이하게 합니다.

## Controller와 View의 관계

Controller 객체는 View 영역의 요소들을 제어합니다. View 영역의 요소를 선택할 때는 다음과 같은 방법을 사용합니다:

```javascript
// 방법 1: view.find() 사용
var element1 = view.find("#element1");

// 방법 2: N() 함수에 view를 context로 전달
var element2 = N("#element2", view);
```

> 페이지의 요소를 선택할 때는 반드시 view에서 find하거나 view를 jQuery 함수의 context 인수(두 번째 인수)로 지정해야 합니다. 그렇지 않으면 다른 블록 페이지의 의도하지 않은 요소까지 선택되어 예측이 어려운 오류가 발생할 수 있습니다.

## 실전 예제

### 예제 1: 기본 Controller 객체

```javascript
(function() {
    var cont = N(".view").cont({
        init : function(view, request) {
            // 버튼 클릭 이벤트 바인딩
            N("#btnSearch", view).on("click", function() {
                cont.search();
            });
        },
        search : function() {
            // 검색 로직
            N.comm("search.json").submit(function(data) {
                // 검색 결과 처리
            });
        }
    });
})();
```

### 예제 2: Grid와 연동하는 Controller 객체

```javascript
(function() {
    var cont = N(".view").cont({
        init : function(view, request) {
            cont.initComponents();
            cont.bindEvents();
        },
        initComponents : function() {
            // Grid 초기화
            cont.grid = N([]).grid({
                context : N(".grid", cont.view),
                height : 300
            }).bind();
            
            // Form 초기화
            cont.form = N([]).form({
                context : N(".form", cont.view)
            }).add();
        },
        bindEvents : function() {
            // 검색 버튼 이벤트
            N("#btnSearch", cont.view).on("click", function() {
                if(cont.form.validate()) {
                    cont.search();
                }
            });
        },
        search : function() {
            N(cont.form.data(true)).comm({
                url : "search.json"
            }).submit(function(data) {
                cont.grid.bind(data);
            });
        }
    });
})();
```

## 주의사항

1. **View 요소 선택**: 페이지의 요소를 선택할 때는 반드시 view에서 find하거나 view를 jQuery 함수의 context 인수로 지정해야 합니다.

2. **페이지 로딩**: Natural-ARCHITECTURE 기반 페이지가 제대로 작동하려면 반드시 N.comm 라이브러리나 N.popup, N.tab 컴포넌트로 로딩되어야 합니다.

3. **init 함수**: Controller 객체에는 반드시 init 함수가 정의되어 있어야 합니다.

4. **객체 인스턴스화**: Controller 객체의 함수를 new 연산자를 통해 객체 인스턴스화하여 사용하면 AOP가 적용되지 않을 수 있습니다.

5. **전역 변수 사용**: 전역 변수를 사용하면 여러 Controller 객체 간에 충돌이 발생할 수 있으므로, 가능한 Controller 객체 내부에 변수를 정의하는 것이 좋습니다.

Controller 객체는 Natural-JS의 CVC 아키텍처 패턴에서 핵심적인 역할을 수행합니다. 이 가이드를 통해 Controller 객체의 개념, 사용법, 주요 기능을 이해하고 효과적으로 활용할 수 있기를 바랍니다.
