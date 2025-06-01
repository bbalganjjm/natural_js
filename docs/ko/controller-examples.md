# Controller 예제

이 문서는 Natural-JS 애플리케이션에서 Controller를 사용하는 방법에 대한 실용적인 예제를 제공합니다. 이 예제들은 Controller를 효과적으로 구현하기 위한 모범 사례와 일반적인 패턴을 보여줍니다.

## 기본 Controller 구조

가장 기본적인 Controller 구현은 뷰와 해당 Controller 객체를 정의합니다:

```html
<!-- View -->
<article class="view">
    <p>View</p>
</article>

<!-- Controller -->
<script type="text/javascript">
    N(".view").cont({
        init: function(view, request) {
            N("p", view).css("padding", "10px");
        }
    });
</script>
```

이 예제에서:
- 뷰는 "view" 클래스를 가진 HTML article 요소로 정의됩니다.
- Controller는 `N(".view").cont({...})`로 초기화됩니다.
- `init` 함수는 페이지가 로드될 때 자동으로 호출됩니다.
- `init` 함수 내에서는 뷰를 컨텍스트로 사용하여 요소를 선택합니다.

## 모든 함수에서 Controller 객체 접근

Controller 내의 모든 함수에서 Controller 객체에 접근하려면 변수에 참조를 저장하세요:

```html
<article class="view">
    <p>View</p>
</article>

<script type="text/javascript">
(function() {
    var cont = N(".view").cont({
        init: function(view, request) {
            this.fn();
        },
        fn: function() {
           N("p", cont.view).css("padding", "10px");
        }
    });
})();
</script>
```

주요 포인트:
- Controller 초기화를 IIFE(즉시 실행 함수 표현식)로 감싸기
- Controller 객체를 `cont` 변수에 저장하기
- 모든 함수에서 `cont`를 사용하여 Controller 속성에 접근하기
- 이 패턴은 함수 범위에 관계없이 Controller 객체에 대한 접근을 보장합니다.

## 컴포넌트 초기화 및 관리

일반적인 패턴은 Controller 내에서 UI 컴포넌트를 초기화하고 관리하는 것입니다:

```javascript
N(".userManagementView").cont({
    init: function(view, request) {
        // UI 컴포넌트 초기화
        this.initComponents();
        
        // 이벤트 바인딩
        this.bindEvents();
        
        // 초기 데이터 로드
        this.loadData();
    },
    
    initComponents: function() {
        // 폼 초기화
        this.userForm = N("#userForm", this.view).form();
        
        // 그리드 초기화
        this.userGrid = N("#userGrid", this.view).grid({
            columns: [
                { name: "id", label: "ID" },
                { name: "name", label: "이름" },
                { name: "email", label: "이메일" }
            ]
        });
        
        // 버튼 초기화
        N(".action-buttons button", this.view).button();
    },
    
    bindEvents: function() {
        var self = this;
        
        // 버튼 이벤트 핸들러
        N("#addButton", this.view).on("click", function() {
            self.userForm.clear();
        });
        
        N("#saveButton", this.view).on("click", function() {
            self.saveUser();
        });
        
        // 그리드 이벤트 핸들러
        this.userGrid.on("select", function(row) {
            self.userForm.bind(row.data);
        });
    },
    
    loadData: function() {
        var self = this;
        
        N.comm("users/list").submit(function(data) {
            self.userGrid.bind(data);
        });
    },
    
    saveUser: function() {
        var self = this;
        var userData = this.userForm.getData();
        
        N.comm("users/save")
            .request.data(userData)
            .submit(function(response) {
                if (response.success) {
                    self.loadData();
                }
            });
    }
});
```

## Controller 간의 통신

여러 Controller(팝업이나 탭과 같은)로 작업할 때 Controller 간에 통신을 설정할 수 있습니다:

```javascript
// 부모 페이지 Controller
N(".parentView").cont({
    init: function(view, request) {
        this.setupActions();
    },
    
    setupActions: function() {
        var self = this;
        
        N("#openDetailButton", this.view).on("click", function() {
            // 팝업을 열고 현재 Controller를 opener로 전달
            N().popup({
                url: "detail.html",
                title: "사용자 상세",
                width: 600,
                height: 400,
                opener: self  // 이 Controller를 팝업에 전달
            }).open();
        });
    },
    
    // 자식 Controller에서 호출될 메서드
    refreshData: function() {
        console.log("자식 업데이트 후 부모 데이터 새로고침");
        // 구현...
    }
});

// 자식 페이지 Controller (detail.html)
N(".detailView").cont({
    init: function(view, request) {
        this.setupActions();
    },
    
    setupActions: function() {
        var self = this;
        
        N("#saveButton", this.view).on("click", function() {
            // 데이터 저장...
            
            // 그런 다음 부모 Controller에게 새로고침하도록 알림
            if (self.opener) {
                self.opener.refreshData();
            }
            
            // 이 팝업 닫기
            self.caller.close();
        });
    }
});
```

## Controller 간의 매개변수 전달

request 객체를 사용하여 Controller 간에 매개변수를 전달할 수 있습니다:

```javascript
// 부모 Controller
N(".listView").cont({
    init: function(view, request) {
        // 사용자 데이터로 그리드 초기화...
        
        this.userGrid.on("select", function(row) {
            // 선택된 사용자 데이터로 상세 페이지 열기
            N().popup({
                url: "userDetail.html",
                title: "사용자 상세",
                width: 600,
                height: 400
            })
            .request.attr("userData", row.data)  // 상세 페이지에 데이터 전달
            .open();
        });
    }
});

// 상세 Controller (userDetail.html)
N(".userDetailView").cont({
    init: function(view, request) {
        // 부모 페이지에서 전달된 사용자 데이터 가져오기
        var userData = request.attr("userData");
        
        if (userData) {
            // 사용자 데이터를 폼에 바인딩
            this.userForm = N("#detailForm", view).form();
            this.userForm.bind(userData);
        }
    }
});
```

## 네임스페이스를 사용한 고급 컴포넌트 관리

여러 컴포넌트가 있는 복잡한 페이지의 경우 컴포넌트를 효과적으로 관리하기 위해 명명 규칙을 사용할 수 있습니다:

```javascript
N(".dashboardView").cont({
    // 컴포넌트 네임스페이스 - UI 컴포넌트에는 "p." 접두사 사용
    "p.grid.users": {
        columns: [
            { name: "id", label: "ID" },
            { name: "name", label: "이름" }
        ]
    },
    
    "p.grid.orders": {
        columns: [
            { name: "id", label: "주문 ID" },
            { name: "date", label: "날짜" },
            { name: "total", label: "총액" }
        ]
    },
    
    "p.form.userDetail": {
        validate: true
    },
    
    // 통신 네임스페이스 - 통신자에는 "c." 접두사 사용
    "c.getUsers": function() {
        return N.comm("api/users");
    },
    
    "c.getOrders": function() {
        return N.comm("api/orders");
    },
    
    // 이벤트 핸들러 - 이벤트에는 "e." 접두사 사용
    "e.refreshButton.click": function() {
        this.loadData();
    },
    
    "e.userGrid.select": function(row) {
        this["p.form.userDetail"].bind(row.data);
    },
    
    // 일반 메서드
    init: function(view, request) {
        this.initComponents();
        this.bindEvents();
        this.loadData();
    },
    
    initComponents: function() {
        // 그리드 초기화
        N("#userGrid", this.view).grid(this["p.grid.users"]);
        N("#orderGrid", this.view).grid(this["p.grid.orders"]);
        
        // 폼 초기화
        N("#userDetailForm", this.view).form(this["p.form.userDetail"]);
    },
    
    bindEvents: function() {
        // 새로고침 버튼 클릭 이벤트 바인딩
        N("#refreshButton", this.view).on("click", $.proxy(this["e.refreshButton.click"], this));
        
        // 사용자 그리드 선택 이벤트 바인딩
        N("#userGrid", this.view).on("select", $.proxy(this["e.userGrid.select"], this));
    },
    
    loadData: function() {
        var self = this;
        
        // 사용자 데이터 로드
        this["c.getUsers"]().submit(function(data) {
            N("#userGrid", self.view).grid("instance").bind(data);
        });
        
        // 주문 데이터 로드
        this["c.getOrders"]().submit(function(data) {
            N("#orderGrid", self.view).grid("instance").bind(data);
        });
    }
});
```

이 접근 방식은 여러 이점을 제공합니다:
- 컴포넌트, 이벤트 및 통신자의 명확한 구성
- 각 부분의 목적을 쉽게 찾고 이해할 수 있음
- 유지 관리 및 디버깅 단순화
