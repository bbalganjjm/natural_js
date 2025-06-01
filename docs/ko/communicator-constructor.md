# Communicator 생성자

Communicator(N.comm) 생성자는 서버 요청을 수행하기 위한 Communicator 인스턴스를 생성하고 구성하는 다양한 방법을 제공합니다.

## Communicator 인스턴스 생성하기

Communicator 인스턴스를 생성하는 여러 방법이 있습니다:

### N.comm 함수 직접 사용하기

```javascript
var comm = N.comm(param|element|url, opts|url);
```

**참고**: `new` 연산자로 인스턴스화하지 않고 N.comm 객체를 직접 사용할 수 있습니다. N.comm 함수가 호출되거나 `new` 연산자로 N.comm 인스턴스가 생성되면, Communicator.request 객체 인스턴스가 생성되어 객체의 `request` 속성에 바인딩됩니다.

### jQuery 플러그인 방식 사용하기

```javascript
var comm = N(param|element).comm(opts|url);
```

객체 인스턴스를 생성하는 방식은 다르지만, `new N.comm()`으로 생성한 인스턴스와 `N().comm`으로 생성한 인스턴스는 기능적으로 동일합니다. N() 함수의 첫 번째 인수는 N.comm 생성자의 첫 번째 인수로 설정됩니다.

**참고**: N() 함수를 사용할 때, 문자열 타입 인수는 N.comm 생성자의 첫 번째 인수(url)로 설정되지 않습니다.

## 생성자 매개변수

### 첫 번째 매개변수 (param|element|url)

**Type**: jQuery object[array[object]]|jQuery object[object]|jQuery object[element]|object|string

#### 객체 또는 배열 매개변수

첫 번째 인수에 object나 array[object] 타입의 객체가 들어있는 jQuery object를 설정하고, 두 번째 인수에 JSON 데이터를 반환하는 서버 URL을 설정하면, 설정된 객체를 문자열로 변환한 후 서버에 GET이나 POST 매개변수로 전달합니다.

```javascript
N.comm({ "param": "value" }, "data.json").submit(function(data) {});
```

**GET 요청에 대한 중요 참고사항**: type(HTTP METHOD) 옵션이 GET이고 data 속성 값(param)이 object나 array[object] 타입이면, URL 인코딩된 매개변수 문자열이 "q" 매개변수 키의 값으로 설정됩니다:

```
data.json?q=%5B%7B%22param%22%3A%22value%22%7D%5D  // 디코딩: q=[{"param":"value"}]
```

브라우저는 GET 매개변수의 최대 길이에 제한이 있습니다. 애플리케이션을 설계할 때 다양한 브라우저의 GET 매개변수 최대 길이를 확인하고 이해하세요.

#### HTML 요소 매개변수

첫 번째 인수에 HTML 요소가 포함된 jQuery object를 설정하고, 두 번째 인수에 HTML 페이지를 반환하는 서버 URL을 설정하면, 로드된 페이지가 지정된 요소에 삽입됩니다:

```javascript
N.comm(N("#contents"), "page.html").submit();
```

로드된 페이지에 매개변수를 전달하려면 Communicator.request 객체의 attr 메서드를 사용하세요:

```javascript
N.comm(N("#contents"), "page.html").request.attr("pageParam", "value").submit();
```

#### 객체 구성

객체 타입을 설정하면 Communicator.request 객체의 기본 옵션으로 설정됩니다:

```javascript
N.comm({ "param": "value" }, {
    url: "data.json"
}).submit(function(data) {});
```

#### URL 문자열

문자열 타입을 설정하면 Communicator.request 객체의 기본 옵션의 url 옵션으로 설정됩니다:

```javascript
N.comm("data.json").submit(function(data) {});
```

### 두 번째 매개변수 (opts|url)

**Type**: object|string

#### 객체 구성

객체 타입을 설정하면 Communicator.request 객체의 기본 옵션으로 설정됩니다:

```javascript
N.comm(params, {
    url: "data.json",
    type: "POST",
    dataType: "json"
}).submit(function(data) {});
```

#### URL 문자열

문자열 타입을 설정하면 Communicator.request 객체의 기본 옵션의 url 옵션으로 설정됩니다:

```javascript
N.comm(params, "data.json").submit(function(data) {});
```

## 반환 값

생성자는 N.comm 객체의 인스턴스를 반환하며, 이를 통해 추가 메서드를 체인으로 연결할 수 있습니다:

```javascript
N.comm("data.json")
    .request.attr("userId", 123)
    .submit(function(data) {
        console.log(data);
    })
    .error(function(e) {
        console.error(e);
    });
```

## 예제

### JSON 데이터 로드하기

```javascript
// URL과 함께 기본 사용법
var comm1 = N.comm("data/users.json");

// 매개변수 포함
var comm2 = N.comm({ userId: 123 }, "data/user-details.json");

// 전체 구성
var comm3 = N.comm({
    url: "data/users.json",
    type: "GET",
    dataType: "json",
    contentType: "application/json; charset=utf-8"
});

// jQuery 플러그인 방식 사용
var comm4 = N({ userId: 123 }).comm("data/user-details.json");
```

### HTML 페이지 로드하기

```javascript
// 대상 요소와 함께 기본 사용법
var comm5 = N.comm(N("#contentArea"), "pages/userProfile.html");

// 옵션 포함
var comm6 = N("#contentArea").comm({
    url: "pages/userProfile.html",
    type: "GET",
    dataType: "html"
});

// 페이지 매개변수 포함
var comm7 = N("#contentArea").comm("pages/userProfile.html");
comm7.request.attr("userId", 123);
```

## 모범 사례

1. **사용 사례에 맞는 구문 선택하기**: 라이브러리는 Communicator 인스턴스를 생성하고 구성하는 여러 방법을 제공합니다. 특정 요구 사항에 가장 적합한 방법을 선택하세요.

2. **GET 매개변수 제한 유의하기**: 객체 매개변수와 함께 GET 요청을 사용할 때 URL 길이에 대한 브라우저 제한에 주의하세요.

3. **체인 작업 활용하기**: 간결한 코드를 작성하기 위해 API의 체인 특성을 활용하세요.

4. **Controller 통합**: Controller 객체 내에서 작업할 때, 더 나은 구성을 위해 "c." 접두사가 붙은 메서드로 Communicator 인스턴스를 정의하는 것을 고려하세요:

```javascript
"c.getUserData": function() {
    return N({ userId: this.userId }).comm("data/user-details.json");
}

// 코드 후반부에서
this["c.getUserData"]().submit(function(data) {
    // 데이터 처리
});
```

Communicator 인스턴스를 생성하고 구성하는 다양한 방법을 이해함으로써, Natural-JS 애플리케이션에서 서버 통신을 효과적으로 관리할 수 있습니다.
