# Controller Object 상수

Natural-JS의 Controller 객체에는 중요한 요소와 컨텍스트 정보에 접근할 수 있는 여러 내장 상수가 포함되어 있습니다. 이러한 상수는 자동으로 정의되며 모든 Controller 객체 내에서 사용할 수 있습니다.

## 사용 가능한 상수

| 이름 | 타입 | 설명 |
|------|------|-------------|
| view | jQuery 객체 | Controller가 바인딩된 뷰 요소입니다. 이는 `init` 함수에 전달된 첫 번째 인수와 동일합니다. 이 상수를 사용하여 뷰 내의 요소를 찾고 조작합니다. |
| request | Communicator.request | 이 페이지를 로드하는 데 사용된 Communicator.request 객체 인스턴스입니다. 이는 `init` 함수에 전달된 두 번째 인수와 동일합니다. 이를 사용하여 요청 매개변수 및 요청 관련 기능에 접근합니다. |
| caller | N.popup 인스턴스 또는 N.tab 인스턴스 | 페이지가 N.popup 또는 N.tab 컴포넌트를 통해 로드된 경우, 이 상수에는 이 페이지를 로드한 컴포넌트의 인스턴스에 대한 참조가 포함됩니다. 이를 통해 로드된 페이지 내에서 호출 컴포넌트를 제어할 수 있습니다. |
| opener | Controller 객체 | 페이지가 N.popup 또는 N.tab 컴포넌트를 통해 로드된 경우, 이 상수에는 부모 페이지의 Controller 객체(N.popup 또는 N.tab 인스턴스를 포함하는 Controller 객체)에 대한 참조가 포함됩니다. 이를 통해 팝업/탭 페이지와 부모 페이지 간의 통신이 가능합니다. |

## 사용 예제

### 뷰 요소 접근하기

```javascript
N(".myView").cont({
    init: function(view, request) {
        // 두 접근 방식은 동일합니다
        N("button", this.view).button();
        // 또는
        N("button", view).button();
    },
    
    someMethod: function() {
        // 상수를 사용하여 모든 메서드에서 뷰에 접근
        var elements = this.view.find(".some-class");
    }
});
```

### Request 객체 사용하기

```javascript
N(".myView").cont({
    init: function(view, request) {
        // 두 접근 방식은 동일합니다
        var id = this.request.attr("id");
        // 또는
        var id = request.attr("id");
        
        this.loadData(id);
    },
    
    loadData: function(id) {
        // 모든 메서드에서 요청 매개변수에 접근
        var otherParam = this.request.attr("otherParam");
    }
});
```

### Caller 및 Opener 활용하기

```javascript
N(".myView").cont({
    init: function(view, request) {
        // 이 페이지가 팝업이나 탭으로 열렸는지 확인
        if (this.caller) {
            // 이 페이지를 연 팝업/탭에 접근
            var popupInstance = this.caller;
            
            // 호출자의 메서드에 접근
            this.caller.close(); // 팝업/탭 닫기
        }
        
        // 부모 페이지의 Controller 객체에 접근
        if (this.opener) {
            // 부모 페이지의 Controller에서 메서드 호출
            this.opener.refreshData();
            
            // 부모 페이지의 컴포넌트에 접근
            var parentGrid = this.opener["p.grid.main"];
        }
    }
});
```

## 중요 참고 사항

1. **Opener 구성**: `opener` 상수를 사용하려면 opener 옵션을 사용하여 N.popup 또는 N.tab 컴포넌트 인스턴스를 생성할 때 Controller 객체를 지정해야 합니다:

   ```javascript
   // 부모 페이지 Controller에서
   N("#target").popup({
       url: "page.html",
       opener: this // 현재 Controller를 opener로 전달
   }).open();
   ```

2. **컨텍스트 인식**: 요소를 선택할 때 항상 `view` 상수를 사용하여 Controller의 범위 내에서만 작업하고 있는지 확인하세요.

3. **범위 일관성**: 이러한 상수는 어떤 메서드에 있든 관계없이 중요한 객체에 일관되게 접근할 수 있게 해주어, 이러한 객체를 메서드 간에 전달할 필요가 없습니다.
