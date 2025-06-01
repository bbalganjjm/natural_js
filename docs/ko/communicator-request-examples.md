# 예제

## 1. 로딩할 페이지에 데이터(페이지 파라미터) 전달 하기

### 1.1. submit 메서드를 호출하기 전에 (Comunicator instance).request.attr("name", object) 명령을 실행합니다

```javascript
N(".view").cont({
    init : function(view, request) {
        N("#section").comm("page.html")
            .request.attr("data1", { data : ["1", "2"] })
            .request.attr("data2", ["3", "4"])
                .submit();
    }
});
```

### 1.2. 로딩된 페이지의 Controller object의 init 메서드에서 Communicator.request 인스턴스의 attr 메서드로 전달된 데이터 가져옵니다

```javascript
N(".view").cont({
    init : function(view, request) {
        var data1 = request.attr("data1"); // { data : ["1", "2"] }
        var data2 = request.attr("data2"); // ["3", "4"]
    }
});
```

## 2. URL 파라미터 작업하기

### 2.1. 모든 URL 파라미터 검색하기

```javascript
N(".view").cont({
    init : function(view, request) {
        // URL: example.com?id=123&type=user&status=active 인 경우
        var allParams = request.param(); 
        // 반환값: { id: "123", type: "user", status: "active" }
        
        console.log(allParams);
    }
});
```

### 2.2. 특정 URL 파라미터 검색하기

```javascript
N(".view").cont({
    init : function(view, request) {
        // URL: example.com?id=123&type=user&status=active 인 경우
        var id = request.param("id"); // "123"
        var type = request.param("type"); // "user"
        
        console.log("ID:", id);
        console.log("유형:", type);
    }
});
```

## 3. 새 데이터로 페이지 다시 로드하기

```javascript
N(".view").cont({
    init : function(view, request) {
        // 초기 페이지 로드
        this.loadData();
    },
    
    loadData : function() {
        var self = this;
        
        // 서버에서 새 데이터 가져오기
        N.comm("data.json").submit(function(data) {
            // 요청 데이터 업데이트 및 페이지 다시 로드
            self.request.attr("newData", data);
            self.request.reload(function(html, request) {
                console.log("새 데이터로 페이지가 다시 로드되었습니다");
            });
        });
    }
});
```

## 4. 요청 옵션 접근하기

```javascript
N(".view").cont({
    init : function(view, request) {
        // 모든 옵션 가져오기
        var options = request.get();
        console.log("모든 옵션:", options);
        
        // 특정 옵션 가져오기
        var contentType = request.get("contentType");
        console.log("콘텐츠 타입:", contentType);
        
        // 참조 URL 가져오기
        var referrer = request.get("referrer");
        console.log("참조 URL:", referrer);
    }
});
```

## 5. 페이지 간 복잡한 데이터 전달

```javascript
// 소스 페이지에서
N(".view").cont({
    init : function(view, request) {
        // 복잡한 데이터 구조 준비
        var userData = {
            profile: {
                id: 12345,
                name: "홍길동",
                email: "hong@example.com"
            },
            permissions: ["read", "write", "admin"],
            settings: {
                theme: "dark",
                notifications: {
                    email: true,
                    sms: false,
                    push: true
                }
            }
        };
        
        // 복잡한 데이터를 다른 페이지로 전달
        N("#target").comm("details.html")
            .request.attr("userData", userData)
            .submit();
    }
});

// 대상 페이지에서
N(".details").cont({
    init : function(view, request) {
        // 복잡한 데이터 검색
        var userData = request.attr("userData");
        
        // 중첩된 속성에 접근
        console.log("사용자 ID:", userData.profile.id);
        console.log("권한:", userData.permissions.join(", "));
        console.log("테마:", userData.settings.theme);
        console.log("푸시 알림:", 
            userData.settings.notifications.push ? "활성화" : "비활성화");
        
        // 데이터를 사용하여 페이지 초기화
        this.renderUserProfile(userData.profile);
        this.setupPermissions(userData.permissions);
        this.applyTheme(userData.settings.theme);
    },
    
    renderUserProfile: function(profile) {
        // 구현...
    },
    
    setupPermissions: function(permissions) {
        // 구현...
    },
    
    applyTheme: function(theme) {
        // 구현...
    }
});
```
