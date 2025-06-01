# 함수

Communicator.request 객체는 요청 데이터를 관리하고, 파라미터를 검색하며, 페이지 리로딩을 제어하는 여러 메서드를 제공합니다. 이러한 메서드는 요청 생명주기와 상호 작용하기 위한 강력한 인터페이스를 제공합니다.

| 이름 | 인자 | 유형 | 반환 | 설명 |
|------|------|------|------|------|
| attr | N/A | N/A | set:Controller.request<br>get:anything | 로드할 페이지로 전달할 데이터를 지정하거나 전달된 데이터를 가져옵니다.<br><br>**참고**: attr 메서드의 인수의 개수가 2개이면 set으로 작동하고 1개이면 get으로 작동합니다.<br><br>데이터 전달 하기:<br>```javascript
N(".view").cont({
    init : function(view, request) {
        N("#section").comm("page.html")
            .request.attr("data1", { data : ["1", "2"] })
            .request.attr("data2", ["3", "4"])
                .submit();
    }
});
```<br><br>로딩된 페이지에서 데이터 가져오기:<br>```javascript
N(".view").cont({
    init : function(view, request) {
        var data1 = request.attr("data1"); // { data : ["1", "2"] }
        var data2 = request.attr("data2"); // ["3", "4"]
    }
});
``` |
| | name | string | N/A | 데이터명을 지정합니다. |
| | value | anything | N/A | 데이터 값을 지정합니다. |
| param | N/A | N/A | string\|object | 브라우저의 URL에서 GET 파라미터 값을 추출합니다. |
| | name | string | N/A | 파라미터의 key를 지정합니다. 지정하지 않으면 GET 파라미터 전체를 object 타입으로 반환합니다. |
| get | N/A | N/A | Value object | Communicator.request 인스턴스에 설정된 기본 옵션 정보를 가져옵니다.<br><br>기본 옵션 외에도 "referrer"(submit 메서드를 호출할 때의 브라우저 URL) 값을 추가로 가져올 수 있습니다. |
| | key | string | N/A | 기본 옵션명을 지정합니다. 지정하지 않으면 기본 옵션 객체가 반환됩니다. |
| reload | N/A | N/A | Controller object | Communicator로 로드한 블록 페이지를 다시 로딩합니다.<br><br>**참고**: reload 메서드를 호출하기 전에 attr 메서드로 값을 지정하지 않았다면 reload 전의 request 객체의 값은 reload해도 유지됩니다.<br><br>**참고**: attr 메서드로 reload 되는 페이지의 Communicator.request 데이터를 다시 지정할 수 있습니다.<br>```javascript
request.attr("param", { param : 1 });
request.reload();
```<br><br>**참고**: reload 함수는 메서드 체이닝을 지원하지 않습니다.<br>```javascript
request.attr("param", { param : 1 }).reload(); // 이렇게 사용할 수 없습니다.
``` |
| | callback | string | N/A | 리로드가 완료되면 실행되는 콜백을 지정합니다. 필요 없으면 지정하지 않아도 됩니다.<br>```javascript
request.reload(function(html, request) {
    N.log(html, request);
});
``` |

## Communicator.request 메서드 사용하기

Communicator.request 객체의 메서드는 요청 데이터와 동작을 관리하는 일관된 방법을 제공하도록 함께 작동하도록 설계되었습니다. 다음은 이러한 메서드를 사용하는 일반적인 패턴입니다:

### 페이지 간 데이터 전달

```javascript
// 소스 페이지에서
N("#target-container").comm("destination-page.html")
    .request.attr("userData", {
        id: 12345,
        name: "홍길동",
        preferences: {
            theme: "dark",
            language: "ko"
        }
    })
    .submit();

// 대상 페이지에서
N("#destination-container").cont({
    init: function(view, request) {
        const userData = request.attr("userData");
        console.log(userData.id); // 12345
        console.log(userData.name); // "홍길동"
        console.log(userData.preferences.theme); // "dark"
    }
});
```

### URL 파라미터 작업

```javascript
N("#container").cont({
    init: function(view, request) {
        // URL: example.com?id=123&type=user 인 경우
        const allParams = request.param(); // { id: "123", type: "user" }
        const id = request.param("id"); // "123"
        const type = request.param("type"); // "user"
        
        // 페이지를 초기화하는 데 파라미터 사용
        if (type === "user") {
            this.loadUserData(id);
        }
    },
    
    loadUserData: function(id) {
        // 구현...
    }
});
```

### 업데이트된 데이터로 페이지 다시 로드하기

```javascript
// 사용자 작업에 새 데이터로 페이지를 새로 고쳐야 하는 경우
updatePage: function(newData) {
    this.request.attr("refreshData", newData);
    this.request.reload(function(html, request) {
        console.log("새 데이터로 페이지가 다시 로드되었습니다");
        // 다시 로드 후 추가 작업
    });
}
```
