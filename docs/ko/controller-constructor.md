# Controller 생성자

`N.cont` 생성자는 DOM의 특정 뷰 요소에 대한 Controller 객체를 초기화합니다. 이 Controller 객체는 뷰와 관련 데이터를 제어하기 위한 진입점 역할을 합니다.

## 개요

Controller 객체는 Natural-JS 아키텍처의 핵심 부분으로, UI 상호작용, 데이터 바인딩 및 비즈니스 로직을 관리하는 구조화된 방법을 제공합니다. 생성자는 Controller 객체를 초기화하고 뷰 요소와 연결하는 역할을 담당합니다.

## 생성자 구문

```javascript
N(selector).cont(controllerObject)
```

또는 대안으로:

```javascript
new N.cont(viewElement, controllerObject)
```

## 매개변수

| 매개변수 | 타입 | 설명 |
|-----------|------|-------------|
| selector / viewElement | 문자열 / jQuery 객체 | 제어할 뷰 요소를 식별하는 CSS 선택자 문자열 또는 jQuery 객체 |
| controllerObject | 객체 | 뷰를 제어하기 위한 메서드와 속성을 포함하는 객체 |

## 반환 값

생성자는 사용자 정의 속성과 메서드, 그리고 시스템 정의 속성을 포함하는 초기화된 Controller 객체를 반환합니다.

## 핵심 개념

1. **뷰 바인딩**: Controller는 DOM의 특정 뷰 요소에 바인딩되어 해당 인터페이스 부분을 조작하고 상호작용할 수 있습니다.

2. **초기화 프로세스**: Controller가 있는 페이지가 로드되면(`N.comm`, `N.popup` 또는 `N.tab`을 통해), 시스템은 자동으로 Controller의 `init` 함수를 호출합니다.

3. **범위 관리**: Controller는 모든 메서드에 대해 일관된 범위를 제공하여 뷰 요소와 상태에 대한 적절한 접근을 보장합니다.

## 시스템 정의 속성

초기화 후, Controller 객체는 다음과 같은 시스템 정의 속성을 포함합니다:

| 속성 | 타입 | 설명 |
|----------|------|-------------|
| view | jQuery 객체 | Controller가 바인딩된 뷰 요소 (init 함수의 첫 번째 인수와 동일) |
| request | Communicator.request | 페이지를 로드하는 데 사용된 요청 객체 (init 함수의 두 번째 인수와 동일) |
| caller | 컴포넌트 인스턴스 | 페이지가 `N.popup` 또는 `N.tab`과 같은 컴포넌트에 의해 열린 경우, 호출한 컴포넌트의 인스턴스를 포함 |

## 예제

### 기본 Controller 초기화

```javascript
N(".myView").cont({
    init: function(view, request) {
        // 컴포넌트 초기화, 이벤트 바인딩 등
        N("button", view).button();
        
        // 필요한 경우 요청 매개변수 접근
        var id = request.attr("id");
        
        // 이 Controller에 정의된 다른 메서드 호출
        this.loadData(id);
    },
    
    loadData: function(id) {
        // 구현 세부 사항...
    }
});
```

### 변수 참조를 통한 대안적 초기화

```javascript
(function() {
    // 어떤 함수 범위에서도 Controller 객체에 접근할 수 있도록 참조 저장
    var cont = N(".myView").cont({
        init: function(view, request) {
            this.setupUI();
        },
        
        setupUI: function() {
            // controller 참조를 통해 view에 접근
            N("button", cont.view).on("click", function() {
                // 무언가 수행
            });
        }
    });
})();
```

## 모범 사례

1. **항상 뷰 컨텍스트 사용하기**: Controller 메서드 내에서 요소를 선택할 때 항상 `view` 매개변수를 컨텍스트로 사용하여 페이지의 다른 부분에서 요소를 선택하지 않도록 합니다:
   ```javascript
   // 올바른 방법
   N("selector", view).hide();
   // 또는
   view.find("selector").hide();
   
   // 잘못된 방법 - 뷰 외부의 요소를 선택할 수 있음
   N("selector").hide();
   ```

2. **변수 참조 사용하기**: 모든 메서드에서 Controller 객체에 쉽게 접근하기 위해 변수에 저장합니다:
   ```javascript
   var cont = N(".view").cont({...});
   ```

3. **Controller에 상태 유지하기**: 충돌과 메모리 문제를 방지하기 위해 전역 변수가 아닌 Controller 객체 내에 페이지별 상태를 저장합니다.
