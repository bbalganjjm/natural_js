# Natural-JS Communicator (N.comm) 개발 가이드

## 개요

Communicator(N.comm)는 Natural-JS의 CVC Architecture Pattern의 Communicator 레이어를 구현한 클래스입니다. N.comm은 서버에 콘텐츠나 데이터를 요청하거나 파라미터를 전달하는 등 서버와의 Ajax 통신을 지원하는 라이브러리입니다.

![Natural-ARCHITECTURE](images/intr/pic4.png)

N.comm은 jQuery.ajax를 기반으로 구현되었지만 추가적으로 다음과 같은 기능을 제공합니다:

- **Communication Filter**: 서버와 통신하는 모든 요청 및 응답 또는 오류 발생 단계에서 공통 로직을 실행할 수 있는 기능
- **요청 정보 객체(Communicator.request)**: 페이지 간 파라미터 전달 및 요청 정보 추적 기능
- **Controller Integration**: Controller 객체와의 원활한 통합을 위한 인터페이스

## N.comm 사용법

### 기본 사용법

```javascript
// 기본 요청
N.comm({
    url: "sample/getSampleData.json"
}).submit(function(data) {
    // 성공 시 실행되는 콜백 함수
    console.log(data);
}, function(data, status, error) {
    // 실패 시 실행되는 콜백 함수
    console.error("Error:", error);
});

// 요청 시 파라미터 전달
N.comm({
    url: "sample/getSampleData.json",
    data: {
        id: "sample_id",
        name: "sample_name"
    }
}).submit();

// 여러 옵션 설정
N.comm({
    url: "sample/getSampleData.json",
    contentType: "application/json",
    dataType: "json",
    type: "POST",
    data: JSON.stringify({
        id: "sample_id",
        name: "sample_name"
    })
}).submit();
```

N.comm은 서버에 데이터를 요청하거나 페이지를 로드하는 등의 다양한 통신 작업을 수행할 수 있습니다. 기본적인 사용 방법은 위 예제와 같이 옵션 객체를 생성자에 전달하고 submit() 메서드를 호출하는 것입니다.

### 페이지 요청 및 로드

```javascript
// 페이지 요청 및 로드
N.comm({
    url: "sample/samplePage.html"
}).submit(function(data, request) {
    // 페이지 데이터 로드 후 실행되는 콜백 함수
    $("#container").html(data);
});

// 지정된 컨테이너에 페이지 로드
N.comm({
    url: "sample/samplePage.html",
    target: "#container" // 페이지가 로드될 대상 요소
}).submit();
```

N.comm은 페이지를 요청하고 로드하는 기능도 제공합니다. 페이지 로드 방식은 두 가지가 있습니다:

1. submit() 콜백 함수 내에서 직접 데이터를 DOM에 삽입하는 방식
2. target 옵션을 지정하여 자동으로 페이지를 로드하는 방식

두 번째 방식을 사용하면 코드를 더 간결하게 작성할 수 있으며, 페이지 로드 이벤트 등이 자동으로 처리됩니다.

## Communicator.request 객체

Communicator.request는 N.comm이 초기화될 때마다 생성되는 요청 정보 객체입니다. N.comm() 함수의 옵션은 Communicator.request.options 객체에 저장되어 서버 요청의 헤더나 파라미터로 전달됩니다.

페이지 파일을 요청하면 Controller object의 init 함수의 두 번째 인수나 Controller object의 멤버 변수(this.request)로 전달됩니다. 전달된 request 객체로 요청 정보를 확인하거나 페이지 파라미터를 전달받을 수 있습니다.

Communicator.request 객체는 다음과 같은 속성을 포함합니다:

- **options**: N.comm() 생성자에 전달된 모든 옵션 값
- **xhr**: jQuery XHR 객체 (요청이 완료된 후 사용 가능)
- **referrer**: 이전 페이지의 URL 정보 (페이지 간 이동 시 사용)
- **params**: 페이지 간 전달되는 파라미터 (options.data와 동일)

### Controller와의 통합

```javascript
// 컨트롤러 정의
var SampleController = {
    // init 함수는 페이지가 로드될 때 자동으로 호출됨
    init: function(view, request) {
        // request 객체를 통해 전달된 파라미터에 접근
        console.log("Page parameters:", request.options.data);
        
        // 클래스 내에서 request 객체 접근
        this.request = request;
    },
    
    // 사용자 정의 함수
    getData: function() {
        // 컨트롤러 내에서 N.comm 사용
        N.comm({
            url: "sample/getSampleData.json"
        }).submit(function(data) {
            console.log(data);
        });
    }
};

// 컨트롤러 초기화
N.cont(SampleController);
```

N.comm과 Controller(N.cont)는 긴밀하게 통합되어 있습니다. 페이지를 요청할 때 N.comm을 통해 생성된 request 객체는 페이지의 Controller 객체의 init 함수에 자동으로 전달됩니다. 이를 통해 페이지 간 파라미터 전달이 쉽게 이루어집니다.

또한 Controller 객체 내에서 N.comm을 사용하여 추가적인 데이터 요청이나 페이지 로드를 수행할 수 있습니다. 이러한 통합은 Natural-JS의 CVC 아키텍처 패턴을 구현하는 핵심 요소입니다.

## Communication Filter

Communication Filter는 N.comm을 통해 서버와 통신하는 모든 요청과 응답 또는 에러 발생 단계에서 공통 로직을 실행할 수 있는 기능입니다.

> **중요**: jQuery.ajax 함수를 사용하면 Communication Filter 기능을 사용할 수 없습니다. 반드시 서버와의 통신은 Communicator(N.comm)를 사용해야 합니다.

Communication Filter는 Natural-JS에서 매우 강력한 기능으로, 다음과 같은 상황에서 특히 유용합니다:

- 인증 토큰 추가 및 관리
- API 응답 데이터 표준화 및 검증
- 공통 에러 처리 및 로깅
- 로딩 인디케이터 표시/숨김
- 응답 캐싱 및 최적화

### Filter 단계

필터의 선언은 [Config(natural.config.js)](DEVELOPER-GUIDE-CONFIG.md)의 N.context.attr("architecture").comm.filters 객체의 속성에 정의할 수 있고 필터의 단계는 다음과 같습니다:

- **beforeInit**: N.comm이 초기화되기 전에 실행됩니다.
- **afterInit**: N.comm이 초기화된 후에 실행됩니다.
- **beforeSend**: 서버에 요청을 보내기 전에 실행됩니다.
- **success**: 서버에서 성공 응답이 전달됐을 때 실행됩니다.
- **error**: 서버에서 에러 응답이 전달됐을 때 실행됩니다.
- **complete**: 서버의 응답이 완료되면 실행됩니다.

### Filter 구현 예제

```javascript
// natural.config.js 파일에 정의
N.context.attr("architecture").comm.filters = {
    // 모든 N.comm 요청 전에 실행
    beforeSend: {
        addAuthToken: function(request) {
            // 인증 토큰을 모든 요청 헤더에 추가
            request.options.headers = request.options.headers || {};
            request.options.headers["Authorization"] = "Bearer " + localStorage.getItem("token");
            return request;
        },
        showLoading: function(request) {
            // 로딩 인디케이터 표시
            if (!request.options.noLoading) {
                N.ui.showLoading();
            }
            return request;
        }
    },
    // 서버 응답이 성공일 때 실행
    success: {
        checkResponseData: function(request, data, textStatus, jqXHR) {
            // 서버 응답 데이터 검증 로직
            if (data && data.resultCode === "00") {
                return data.resultData; // 필터를 통과한 데이터 반환
            } else {
                // 에러 발생 시 예외 처리
                throw new Error(data.message || "Unknown error");
            }
        }
    },
    // 에러 발생 시 실행
    error: {
        handleApiError: function(request, jqXHR, textStatus, errorThrown) {
            // API 에러 공통 처리 로직
            if (jqXHR.status === 401) {
                // 인증 에러 처리
                alert("로그인이 필요합니다.");
                location.href = "login.html";
            } else if (jqXHR.status === 500) {
                // 서버 에러 처리
                alert("서버 오류가 발생했습니다.");
            }
            
            // 에러 로깅
            console.error("API Error:", {
                url: request.options.url,
                status: jqXHR.status,
                error: errorThrown
            });
            
            return {
                error: true,
                message: errorThrown
            };
        }
    },
    // 요청 완료 후 항상 실행
    complete: {
        hideLoading: function(request) {
            // 로딩 인디케이터 숨김
            if (!request.options.noLoading) {
                N.ui.hideLoading();
            }
            return request;
        }
    }
};
```

위 예제는 다음과 같은 필터 구현을 보여줍니다:

1. **beforeSend 단계**:
   - `addAuthToken`: 모든 요청에 인증 토큰을 자동으로 추가
   - `showLoading`: 요청 시작 시 로딩 인디케이터 표시

2. **success 단계**:
   - `checkResponseData`: 서버 응답 데이터의 표준 포맷 검증 및 추출

3. **error 단계**:
   - `handleApiError`: HTTP 상태 코드에 따른 공통 에러 처리 로직

4. **complete 단계**:
   - `hideLoading`: 요청 완료 시 로딩 인디케이터 숨김

이러한 필터를 구현하면 애플리케이션 전체에서 일관된 방식으로 서버 통신을 처리할 수 있으며, 코드 중복을 크게 줄일 수 있습니다.

## 주요 옵션

N.comm() 함수에서 사용할 수 있는 주요 옵션들은 다음과 같습니다:

| 옵션 | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| url | String | - | 요청할 URL 주소 (필수) |
| data | Object, String | null | 서버로 전송할 데이터 |
| type | String | "GET" | HTTP 메서드 (GET, POST, PUT, DELETE 등) |
| dataType | String | "json" | 응답 데이터 타입 (json, html, text 등) |
| contentType | String | "application/x-www-form-urlencoded; charset=UTF-8" | 요청 데이터의 콘텐츠 타입 |
| cache | Boolean | true | 브라우저 캐시 사용 여부 |
| timeout | Number | 30000 | 요청 타임아웃 시간 (밀리초) |
| async | Boolean | true | 비동기 요청 여부 |
| target | String, jQuery | null | 페이지가 로드될 대상 요소 |
| headers | Object | {} | HTTP 요청 헤더 |
| noHistory | Boolean | false | 브라우저 히스토리에 추가하지 않음 (페이지 요청 시) |
| noLoading | Boolean | false | 로딩 인디케이터를 표시하지 않음 |
| isProcessData | Boolean | true | 데이터 자동 처리 여부 |
| isUpload | Boolean | false | 파일 업로드 요청 여부 |
| jsonp | Boolean, String | false | JSONP 요청 설정 |
| jsonpCallback | String | null | JSONP 콜백 함수명 |
| beforeSend | Function | null | 요청 전 실행될 콜백 함수 |
| complete | Function | null | 요청 완료 후 실행될 콜백 함수 |

### 예제: 주요 옵션 사용

```javascript
// 다양한 옵션 활용 예제
N.comm({
    url: "api/users",
    type: "POST",
    dataType: "json",
    contentType: "application/json",
    cache: false,
    timeout: 10000,
    headers: {
        "X-Custom-Header": "CustomValue",
        "Accept-Language": "ko-KR"
    },
    data: JSON.stringify({
        name: "홍길동",
        age: 30,
        email: "hong@example.com"
    }),
    noLoading: true,
    beforeSend: function(xhr) {
        console.log("요청 전 처리");
    },
    complete: function(xhr, status) {
        console.log("요청 완료 후 처리");
    }
}).submit(function(data) {
    console.log("성공:", data);
}, function(xhr, status, error) {
    console.error("실패:", error);
});
```

## 고급 기능

### Promise 스타일 사용

N.comm은 Promise 스타일의 API를 지원합니다. 이를 통해 비동기 요청을 더 깔끔하게 처리할 수 있습니다.

```javascript
// Promise 스타일로 N.comm 사용
N.comm({
    url: "sample/getSampleData.json"
}).submit()
    .then(function(data) {
        // 성공 시
        console.log("데이터 조회 성공:", data);
        return data;
    })
    .catch(function(error) {
        // 실패 시
        console.error("데이터 조회 실패:", error);
        throw error;
    })
    .finally(function() {
        // 항상 실행
        console.log("요청 처리 완료");
    });
```

### 연속적인 요청 처리

여러 API를 순차적으로 호출해야 하는 경우, Promise 체인을 활용하여 연속적인 요청을 깔끔하게 처리할 수 있습니다.

```javascript
// Promise 체인을 활용한 연속 요청
N.comm({
    url: "sample/getUser.json"
}).submit()
    .then(function(userData) {
        console.log("사용자 정보:", userData);
        
        // 첫 번째 요청의 결과를 기반으로 두 번째 요청
        return N.comm({
            url: "sample/getUserDetails.json",
            data: {
                userId: userData.id
            }
        }).submit();
    })
    .then(function(userDetails) {
        console.log("사용자 상세 정보:", userDetails);
        
        // 두 번째 요청의 결과를 기반으로 세 번째 요청
        return N.comm({
            url: "sample/getUserOrders.json",
            data: {
                userId: userDetails.id
            }
        }).submit();
    })
    .then(function(orderData) {
        console.log("사용자 주문 정보:", orderData);
        
        // 최종 처리
        return {
            user: userData,
            details: userDetails,
            orders: orderData
        };
    })
    .catch(function(error) {
        // 모든 요청 중 발생한 에러 처리
        console.error("API 요청 실패:", error);
    });
```

### 파일 업로드 처리

N.comm을 사용하여 파일 업로드를 처리할 수 있습니다.

```javascript
// 파일 업로드 처리 예제
var formData = new FormData();
formData.append("file", $("#fileInput")[0].files[0]);
formData.append("name", "파일명");

N.comm({
    url: "api/upload",
    type: "POST",
    data: formData,
    isUpload: true,        // 파일 업로드 요청임을 명시
    isProcessData: false,  // jQuery가 데이터를 처리하지 않도록 설정
    contentType: false     // 브라우저가 자동으로 Content-Type 헤더를 설정하도록 함
}).submit(function(response) {
    console.log("업로드 성공:", response);
}, function(xhr, status, error) {
    console.error("업로드 실패:", error);
});
```

## 모범 사례

Natural-JS의 Communicator(N.comm)를 효과적으로 활용하기 위한 모범 사례는 다음과 같습니다:

1. **항상 N.comm 사용하기**: 
   - jQuery.ajax 대신 N.comm을 사용하여 Communication Filter의 이점을 활용하세요.
   - 일관된 에러 처리와 로딩 인디케이터 등 전역 설정의 혜택을 받을 수 있습니다.

2. **에러 처리 구현하기**: 
   - 모든 N.comm 요청에 에러 처리 로직을 구현하여 사용자 경험을 향상시키세요.
   - 필요한 경우 특정 요청에 대한 사용자 정의 에러 처리를 추가하세요.
   ```javascript
   N.comm({
       url: "api/data"
   }).submit(function(data) {
       // 성공 처리
   }, function(xhr, status, error) {
       // 사용자 정의 에러 처리
       if (xhr.status === 404) {
           N.alert("요청한 데이터를 찾을 수 없습니다.");
       }
   });
   ```

3. **Communication Filter 활용하기**: 
   - 공통 로직을 Communication Filter에 구현하여 코드 중복을 줄이세요.
   - 자주 사용되는 기능(인증, 로깅, 에러 처리 등)은 필터로 구현하는 것이 좋습니다.

4. **요청 제한 설정하기**: 
   - 장시간 실행되는 요청에는 적절한 timeout 값을 설정하세요.
   - 특히 외부 API 연동 시 타임아웃 설정이 중요합니다.
   ```javascript
   N.comm({
       url: "external-api/data",
       timeout: 10000  // 10초 타임아웃
   }).submit();
   ```

5. **데이터 검증 구현하기**: 
   - 서버 응답 데이터를 항상 검증하여 안전한 데이터 처리를 보장하세요.
   - 데이터 형식과 필수 속성 존재 여부를 확인하세요.

6. **Promise 체인 활용하기**:
   - 복잡한 비동기 로직은 Promise 체인을 활용하여 깔끔하게 구현하세요.
   - 중첩된 콜백 대신 .then() 체인을 사용하면 코드 가독성이 향상됩니다.

7. **페이지 로드 최적화**:
   - 페이지 로드 시 target 옵션을 활용하여 코드를 간결하게 유지하세요.
   - 페이지 캐싱이 필요한 경우 cache 옵션을 활용하세요.

8. **통신 로깅 구현**:
   - 개발 환경에서는 통신 로그를 활성화하여 디버깅을 용이하게 하세요.
   - 프로덕션 환경에서는 중요 오류만 로깅하도록 설정하세요.

9. **공통 API 래퍼 구현**:
   - 자주 사용되는 API 호출은 N.comm을 래핑한 유틸리티 함수로 구현하세요.
   ```javascript
   // API 유틸리티 예제
   var ApiUtils = {
       getUser: function(userId) {
           return N.comm({
               url: "api/users/" + userId
           }).submit();
       },
       updateUser: function(userId, userData) {
           return N.comm({
               url: "api/users/" + userId,
               type: "PUT",
               data: JSON.stringify(userData),
               contentType: "application/json"
           }).submit();
       }
   };
   
   // 사용 예
   ApiUtils.getUser(123).then(function(user) {
       console.log(user);
   });
   ```

## 관련 문서

- [Natural-ARCHITECTURE 가이드](DEVELOPER-GUIDE-ARCHITECTURE.md)
- [Config(natural.config.js) 레퍼런스](DEVELOPER-GUIDE-CONFIG.md)
- [Controller 개발 가이드](DEVELOPER-GUIDE-CONTROLLER.md)
- [AOP 개발 가이드](DEVELOPER-GUIDE-AOP.md)
- [Context 개발 가이드](DEVELOPER-GUIDE-CONTEXT.md)
