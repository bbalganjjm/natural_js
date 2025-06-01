# Communicator API 데모

이 문서는 Natural-JS에서 Communicator(N.comm) API의 기본 사용법을 보여주며, 서버에서 데이터를 로드하는 방법과 HTML 페이지를 로드하는 방법을 설명합니다.

## 1. 서버에서 데이터 로드하기

다음 예제는 서버 엔드포인트에서 JSON 데이터를 로드하는 방법을 보여줍니다.

### 기본 설정

```javascript
// Communicator 옵션 구성
var opts = {
    url: "data/users.json",  // 데이터를 가져올 URL
    type: "GET",             // HTTP 메서드 (GET, POST, PUT, DELETE)
    dataType: "json"         // 예상 응답 유형
};

// Communicator 인스턴스 생성 및 요청 제출
N.comm(opts).submit(function(data, request) {
    // 응답 데이터 처리
    console.log(data);
    
    // request 객체는 요청에 관한 정보를 포함합니다
    console.log(request);
});
```

### 매개변수 포함

```javascript
// 요청을 위한 매개변수 생성
var params = {
    userId: 123,
    includeDetails: true
};

// 요청과 함께 매개변수 전송
N(params).comm("data/user-details.json").submit(function(data, request) {
    // 응답 데이터 처리
    console.log(data);
});
```

### 대체 구문

```javascript
// 대체 매개변수 전달 방식
N.comm(params, "data/user-details.json").submit(function(data, request) {
    // 응답 데이터 처리
    console.log(data);
});
```

## 2. HTML 페이지 로드하기

다음 예제는 HTML 페이지를 로드하고 지정된 요소에 삽입하는 방법을 보여줍니다.

### 기본 설정

```javascript
// 옵션 구성
var opts = {
    url: "pages/userProfile.html",  // HTML 페이지의 URL
    type: "GET",                    // HTTP 메서드
    dataType: "html"                // 예상 응답 유형
};

// HTML을 삽입할 대상 요소
var targetElement = "#contentArea";

// HTML 페이지를 대상 요소에 로드
N(targetElement).comm(opts).submit(function(controller) {
    // 이 콜백은 페이지가 로드되고 초기화된 후 실행됩니다
    // controller는 로드된 페이지의 Controller 객체입니다
    console.log(controller.view);    // 로드된 페이지의 뷰(DOM 요소)
    console.log(controller.request); // 매개변수가 포함된 request 객체
});
```

### 로드된 페이지에 매개변수 전달

```javascript
// 옵션 구성
var opts = {
    url: "pages/userProfile.html",
    type: "GET",
    dataType: "html"
};

// 매개변수와 함께 HTML 페이지 로드
N("#contentArea").comm(opts)
    .request.attr("userId", 123)    // 요청에 매개변수 추가
    .submit(function(controller) {
        // 로드된 페이지는 controller.request를 통해 매개변수에 접근할 수 있습니다
        console.log("userId와 함께 페이지 로드됨:", controller.request.attr("userId"));
    });
```

## 3. 폼 및 기타 컴포넌트와 함께 작업하기

Communicator는 다른 Natural-JS 컴포넌트와 원활하게 통합됩니다:

```javascript
// 폼 데이터를 가져와 서버로 전송
N("#myForm").data().comm("data/save-user.json").submit(function(response) {
    if (response.success) {
        N().alert("사용자 데이터가 성공적으로 저장되었습니다").show();
    }
});

// 또는 Controller 객체 내에서
"c.saveUser": function() {
    return this["p.form.user"].data().comm("data/save-user.json");
},

// 코드 후반부에서
this["c.saveUser"]().submit(function(response) {
    // 응답 처리
});
```

## 4. 오류 처리

```javascript
N.comm("data/users.json").submit(function(data) {
    // 성공 핸들러
}).error(function(e) {
    // 오류 핸들러
    console.error("데이터 로드 실패:", e);
    N().alert("데이터 로드 실패: " + e.message).show();
});
```

## 5. 완전한 예제

다음은 데이터 로드와 페이지 로드를 모두 보여주는 완전한 예제입니다:

```javascript
// JSON 데이터 로드
document.getElementById("loadDataButton").addEventListener("click", function() {
    var dataUrl = document.getElementById("dataUrl").value;
    
    N.comm({
        url: dataUrl,
        type: "GET",
        dataType: "json"
    }).submit(function(data, request) {
        document.getElementById("dataResult").textContent = JSON.stringify(data, null, 2);
    }).error(function(e) {
        N().alert("데이터 로드 오류: " + e.message).show();
    });
});

// HTML 페이지 로드
document.getElementById("loadPageButton").addEventListener("click", function() {
    var pageUrl = document.getElementById("pageUrl").value;
    var targetElement = document.getElementById("pageTarget").value;
    var pageParam = document.getElementById("pageParam").value;
    
    N(targetElement).comm({
        url: pageUrl,
        type: "GET",
        dataType: "html"
    }).request.attr("param", pageParam)
      .submit(function(controller) {
          console.log("페이지가 성공적으로 로드되었습니다");
      }).error(function(e) {
          N().alert("페이지 로드 오류: " + e.message).show();
      });
});
```

## 참고 사항

- `submit()` 메서드는 요청을 시작하고 요청이 성공적으로 완료되면 호출될 콜백 함수를 받습니다.
- HTML 페이지를 로드할 때, 콜백 함수는 로드된 페이지의 Controller 객체를 받습니다.
- 데이터를 로드할 때, 콜백 함수는 응답 데이터와 request 객체를 받습니다.
- `error()` 메서드를 사용하면 오류를 처리하기 위한 콜백을 정의할 수 있습니다.
- 더 고급 옵션 및 구성에 대해서는 Communicator 옵션 및 함수 문서를 참조하세요.

이 API 데모는 Communicator 컴포넌트에 대한 기본 소개를 제공합니다. 실제 구현은 특정 서버 엔드포인트 및 애플리케이션 요구 사항에 따라 추가 구성이 필요할 수 있습니다.
