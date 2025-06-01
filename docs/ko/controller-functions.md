# Controller Object 함수

Natural-JS의 Controller 객체에는 Controller가 뷰와 상호 작용하고 라이프사이클 이벤트에 응답하는 방법을 정의하는 특수 함수가 있습니다. 이 문서에서는 내장 함수와 사용자 정의 함수를 구현하는 방법을 다룹니다.

## 내장 함수

### init

`init` 함수는 뷰 로딩과 Controller 객체 초기화가 완료된 후 자동으로 호출되는 특수 라이프사이클 함수입니다. 이는 애플리케이션 로직의 주요 진입점입니다.

**구문:**

```javascript
N(".view").cont({
    init: function(view, request) {
        // 초기화 코드
    }
});
```

**매개변수:**

| 매개변수 | 타입 | 설명 |
|-----------|------|-------------|
| view | jQuery 객체 | Controller가 바인딩된 뷰 요소입니다. Controller 객체의 `view` 상수와 동일합니다. |
| request | Communicator.request | 이 페이지를 로드한 Communicator(N.comm)의 Communicator.request 객체입니다. Controller 객체의 `request` 상수와 동일합니다. |

**반환 값:** 없음

**사용법:**

`init` 함수에서는 다음을 수행해야 합니다:
- UI 컴포넌트 초기화
- 이벤트 핸들러 설정
- 초기 데이터 로드
- 애플리케이션 상태 구성

**예제:**

```javascript
N(".myView").cont({
    init: function(view, request) {
        // UI 컴포넌트 초기화
        N("button", view).button();
        N("#dataGrid", view).grid({
            columns: [
                { name: "id", label: "ID" },
                { name: "name", label: "이름" }
            ]
        });
        
        // 이벤트 핸들러 설정
        N("#searchButton", view).on("click", this.search);
        
        // 초기 데이터 로드
        this.loadData();
    },
    
    loadData: function() {
        // 구현...
    },
    
    search: function() {
        // 구현...
    }
});
```

## 사용자 정의 함수

`init` 함수 외에도 Controller 객체 내에 원하는 수의 사용자 정의 함수를 정의할 수 있습니다. 이러한 함수는 Controller 내의 다른 함수에서 호출하거나 UI 이벤트에 바인딩할 수 있습니다.

**사용자 정의 함수에 대한 모범 사례:**

1. **함수 구성:**
   - 관련 함수들을 함께 그룹화
   - 명확하고 설명적인 이름 사용
   - 복잡한 로직은 주석으로 문서화

2. **이벤트 핸들러:**
   - 이벤트 처리를 위한 전용 함수 생성
   - `$.proxy()` 또는 화살표 함수를 사용하여 적절한 컨텍스트 보장

3. **데이터 관리:**
   - 데이터 작업(로드, 저장, 업데이트)을 위한 함수 생성
   - 데이터 조작 로직과 UI 로직 분리

**사용자 정의 함수가 있는 예제:**

```javascript
N(".userManagement").cont({
    init: function(view, request) {
        this.setupUI();
        this.bindEvents();
        this.loadUsers();
    },
    
    // UI 설정
    setupUI: function() {
        this.userGrid = N("#userGrid", this.view).grid({
            columns: [
                { name: "id", label: "ID" },
                { name: "name", label: "이름" },
                { name: "email", label: "이메일" }
            ]
        });
        
        this.userForm = N("#userForm", this.view).form();
    },
    
    // 이벤트 바인딩
    bindEvents: function() {
        N("#addButton", this.view).on("click", $.proxy(this.addUser, this));
        N("#saveButton", this.view).on("click", $.proxy(this.saveUser, this));
        N("#deleteButton", this.view).on("click", $.proxy(this.deleteUser, this));
        
        this.userGrid.on("select", $.proxy(this.onUserSelect, this));
    },
    
    // 데이터 작업
    loadUsers: function() {
        N.comm("api/users").submit($.proxy(function(data) {
            this.userGrid.bind(data);
        }, this));
    },
    
    saveUser: function() {
        if (!this.userForm.validate()) {
            return;
        }
        
        var userData = this.userForm.getData();
        N.comm("api/users/save")
            .request.data(userData)
            .submit($.proxy(function(response) {
                if (response.success) {
                    this.loadUsers();
                    this.userForm.clear();
                }
            }, this));
    },
    
    // 이벤트 핸들러
    onUserSelect: function(row) {
        this.userForm.bind(row.data);
    },
    
    addUser: function() {
        this.userForm.clear();
    },
    
    deleteUser: function() {
        var selectedUser = this.userGrid.selected();
        if (!selectedUser) {
            return;
        }
        
        if (confirm("이 사용자를 삭제하시겠습니까?")) {
            N.comm("api/users/delete")
                .request.data({ id: selectedUser.id })
                .submit($.proxy(function(response) {
                    if (response.success) {
                        this.loadUsers();
                        this.userForm.clear();
                    }
                }, this));
        }
    }
});
```

## 함수 컨텍스트

Controller 객체의 모든 함수 내에서 `this` 키워드는 Controller 객체 자체를 참조합니다. 이를 통해 다음에 접근할 수 있습니다:

- Controller 내의 다른 함수들
- 내장 상수(view, request, caller, opener)
- 정의한 모든 사용자 정의 속성

콜백 함수나 이벤트 핸들러에서 Controller의 컨텍스트를 유지해야 하는 경우, 다음 접근 방식 중 하나를 사용하세요:

1. **$.proxy 사용:**
   ```javascript
   N("#button").on("click", $.proxy(this.handleClick, this));
   ```

2. **화살표 함수 사용(ES6):**
   ```javascript
   N("#button").on("click", () => this.handleClick());
   ```

3. **Controller 참조 저장:**
   ```javascript
   var self = this;
   N("#button").on("click", function() {
       self.handleClick();
   });
   ```
