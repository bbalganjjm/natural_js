# Natural-JS Context (N.context) 개발 가이드

## 개요

Context(N.context)는 Natural-JS 기반 애플리케이션의 Life-Cycle(페이지가 적재되고 다른 URL로 redirect되기 전까지) 안에서 데이터의 영속성을 보장하는 공간입니다. Natural-JS의 환경 설정 값(Config), 프레임워크 공통 메시지 등이 N.context 객체에 저장됩니다.

N.context는 애플리케이션 내에서 전역적으로 데이터를 공유하기 위한 안전한 저장소 역할을 합니다. 페이지 간 이동 시에도 데이터가 유지되므로, 세션 데이터와 유사한 기능을 클라이언트 측에서 구현할 수 있습니다.

## N.context 사용법

### 기본 사용법

```javascript
// 데이터 저장
N.context.attr("key", "value");

// 데이터 가져오기
var value = N.context.attr("key");

// 여러 데이터 한 번에 저장
N.context.attr({
    "key1": "value1",
    "key2": "value2",
    "key3": "value3"
});

// 데이터 삭제
N.context.removeAttr("key");

// 모든 데이터 삭제
N.context.clearAttr();
```

N.context는 애플리케이션 내에서 간단하게 데이터를 저장하고 관리할 수 있는 API를 제공합니다. 주요 메서드는 다음과 같습니다:

- **attr(key, value)**: 데이터 저장 또는 조회
- **removeAttr(key)**: 특정 키의 데이터 삭제
- **clearAttr()**: 모든 데이터 삭제
- **hasAttr(key)**: 특정 키의 데이터 존재 여부 확인

### 중첩 객체 처리

N.context는 중첩된 객체 구조에서도 데이터를 저장하고 가져올 수 있습니다:

```javascript
// 중첩 객체 저장
N.context.attr("user", {
    id: "user123",
    name: "John Doe",
    preferences: {
        theme: "dark",
        language: "en_US"
    }
});

// 중첩 객체의 특정 속성 가져오기
var userName = N.context.attr("user.name"); // "John Doe"
var userTheme = N.context.attr("user.preferences.theme"); // "dark"

// 중첩 객체의 특정 속성 업데이트
N.context.attr("user.preferences.theme", "light");
```

중첩 객체를 처리할 때는 점(.) 표기법을 사용하여 깊은 경로의 속성에 접근할 수 있습니다. 이는 복잡한 데이터 구조를 효율적으로 관리할 수 있게 해줍니다. 특히 설정 값이나 사용자 정보와 같은 계층적 데이터를 다룰 때 유용합니다.

### 데이터 존재 여부 확인

```javascript
// 특정 키의 데이터가 존재하는지 확인
if (N.context.attr("key") !== undefined) {
    // 데이터가 존재함
}

// 또는
if (N.context.hasAttr("key")) {
    // 데이터가 존재함
}
```

N.context는 특정 키의 데이터 존재 여부를 확인하는 두 가지 방법을 제공합니다:
1. `N.context.attr(key)`가 `undefined`가 아닌지 확인
2. `N.context.hasAttr(key)` 메서드 사용 (더 명시적인 방법)

## Natural-JS 패키지별 설정 값

N.context는 Natural-JS의 각 패키지별 설정 값을 저장하는 데 사용됩니다:

```javascript
// Natural-CORE 패키지 설정 값
var coreConfig = N.context.attr("core");

// Natural-ARCHITECTURE 패키지 설정 값
var architectureConfig = N.context.attr("architecture");

// Natural-DATA 패키지 설정 값
var dataConfig = N.context.attr("data");

// Natural-UI 패키지 설정 값
var uiConfig = N.context.attr("ui");

// Natural-UI.Shell 패키지 설정 값
var uiShellConfig = N.context.attr("ui.shell");

// Natural-TEMPLATE 패키지 설정 값
var templateConfig = N.context.attr("template");
```

Natural-JS의 각 패키지별 설정 값은 natural.config.js 파일에서 정의되며, 이 설정 값들은 N.context 객체에 저장됩니다. 설정 값에 접근하려면 위와 같이 각 패키지명을 키로 사용하면 됩니다.

주요 패키지별 설정 항목은 다음과 같습니다:

- **core**: 로케일, 문자열 처리, 가비지 컬렉션 등 기본 설정
- **architecture**: 페이지 컨텍스트, 컨트롤러, AOP, 통신 필터 설정
- **data**: 데이터 포맷, 유효성 검사 등 데이터 관련 설정
- **ui**: UI 컴포넌트의 기본 옵션 및 동작 설정
- **ui.shell**: Documents, Notify 등 UI.Shell 컴포넌트 설정
- **template**: 템플릿 엔진 및 코드 생성 관련 설정

## 사용 사례

### 사용자 정보 관리

```javascript
// 로그인 시 사용자 정보 저장
function login(userData) {
    N.context.attr("currentUser", userData);
}

// 사용자 정보 가져오기
function getCurrentUser() {
    return N.context.attr("currentUser");
}

// 로그아웃 시 사용자 정보 삭제
function logout() {
    N.context.removeAttr("currentUser");
}

// 사용자 권한 확인
function hasPermission(permissionName) {
    var user = N.context.attr("currentUser");
    if (!user || !user.permissions) {
        return false;
    }
    return user.permissions.indexOf(permissionName) > -1;
}
```

사용자 정보 관리는 N.context의 가장 일반적인 사용 사례 중 하나입니다. 로그인 후 사용자 정보를 N.context에 저장하고, 필요할 때마다 가져와서 사용할 수 있습니다. 또한 권한 확인 같은 로직도 쉽게 구현할 수 있습니다.

### 다국어 지원

```javascript
// 다국어 메시지 설정
N.context.attr("messages", {
    "ko_KR": {
        "welcome": "환영합니다",
        "goodbye": "안녕히 가세요"
    },
    "en_US": {
        "welcome": "Welcome",
        "goodbye": "Goodbye"
    }
});

// 현재 로케일 설정
N.context.attr("currentLocale", "ko_KR");

// 메시지 가져오기
function getMessage(key) {
    var locale = N.context.attr("currentLocale");
    var messages = N.context.attr("messages." + locale);
    return messages[key] || key;
}

// 사용 예
var welcomeMessage = getMessage("welcome"); // "환영합니다"
```

N.context를 활용하여 다국어 지원 기능을 쉽게 구현할 수 있습니다. 위 예제에서는 언어별 메시지를 N.context에 저장하고, 현재 선택된 로케일에 따라 적절한 메시지를 반환하는 함수를 구현했습니다. 이 패턴은 확장성이 좋아 많은 수의 메시지와 언어를 쉽게 관리할 수 있습니다.

### 페이지 간 데이터 전달

```javascript
// 페이지 A에서 데이터 저장
function onPageALeave() {
    N.context.attr("pageAData", {
        selectedItems: getSelectedItems(),
        searchKeyword: getSearchKeyword()
    });
}

// 페이지 B에서 데이터 사용
function onPageBLoad() {
    var pageAData = N.context.attr("pageAData");
    if (pageAData) {
        setSelectedItems(pageAData.selectedItems);
        setSearchKeyword(pageAData.searchKeyword);
    }
}
```

N.context는 페이지 간 데이터 전달에 매우 유용합니다. 일반적인 웹 애플리케이션에서는 URL 매개변수나 세션 스토리지를 사용해야 하지만, Natural-JS에서는 N.context를 사용하여 더 간편하고 강력하게 데이터를 공유할 수 있습니다.

이 방식은 특히 SPA(Single Page Application)나 Natural-JS의 Documents(N.docs) 컴포넌트를 사용하는 경우 더욱 효과적입니다. 페이지 전환 시 사용자의 선택 상태, 입력 값, 검색 조건 등을 유지할 수 있어 UX를 크게 향상시킬 수 있습니다.

## 성능 및 보안 고려사항

### 성능 최적화

- **큰 데이터 저장 주의**: N.context에 대용량 데이터를 저장하면 메모리 사용량이 증가하고 성능이 저하될 수 있습니다.
- **필요 없는 데이터 삭제**: 더 이상 필요하지 않은 데이터는 removeAttr()로 삭제하여 메모리를 확보하세요.
- **중첩 깊이 제한**: 너무 깊은 중첩 객체 구조는 접근 속도를 느리게 만들 수 있습니다.
- **데이터 캐싱 활용**: 자주 접근하는 데이터는 지역 변수에 캐싱하여 성능을 향상시키세요.
- **대용량 데이터 분할**: 대용량 데이터는 필요한 부분만 선택적으로 저장하거나 분할하여 저장하세요.

### 보안 고려사항

- **민감 정보 저장 금지**: 비밀번호, 토큰 등의 민감한 정보는 N.context에 저장하지 마세요.
- **데이터 검증**: N.context에서 가져온 데이터는 항상 유효성을 검증한 후 사용하세요.
- **사용자 입력 데이터**: 사용자 입력 데이터를 N.context에 저장하기 전에 적절한 검증 및 이스케이프 처리를 수행하세요.
- **XSS 방지**: HTML이나 스크립트를 포함할 수 있는 데이터는 출력 시 반드시 이스케이프 처리하세요.
- **권한 확인**: 권한이 필요한 데이터는 접근 전에 사용자 권한을 확인하는 로직을 구현하세요.

```javascript
// 안전한 데이터 접근 예제
function safeGetUserData() {
    var userData = N.context.attr("userData");
    
    // 데이터 유효성 검증
    if (!userData || typeof userData !== "object") {
        return null;
    }
    
    // 권한 확인
    if (!hasPermission("USER_DATA_ACCESS")) {
        console.error("권한 없음: USER_DATA_ACCESS");
        return null;
    }
    
    // 민감 정보 필터링
    var safeData = Object.assign({}, userData);
    delete safeData.password;
    delete safeData.token;
    
    return safeData;
}
```

## 고급 사용법

### 데이터 변경 감지

N.context는 데이터 변경 시 콜백 함수를 실행하는 기능을 제공합니다:

```javascript
// 데이터 변경 감지 콜백 등록
var unwatch = N.context.watch("themeSettings", function(newValue, oldValue) {
    console.log("테마 설정 변경:", oldValue, "->", newValue);
    applyTheme(newValue);
});

// 데이터 변경
N.context.attr("themeSettings.darkMode", true);

// 감시 중단
unwatch();
```

### 임시 데이터 저장소

임시로 사용할 데이터 저장소를 만들 수 있습니다:

```javascript
// 임시 데이터 저장소 생성
var tempStore = N.context.create();

// 데이터 저장
tempStore.attr("tempKey", "임시 값");

// 데이터 조회
var value = tempStore.attr("tempKey");

// 임시 저장소 삭제
tempStore.destroy();
```

### 기본값 설정

데이터가 없을 경우 기본값을 사용하는 패턴:

```javascript
// 기본값을 사용하는 도우미 함수
function getWithDefault(key, defaultValue) {
    var value = N.context.attr(key);
    return value !== undefined ? value : defaultValue;
}

// 사용 예
var pageSize = getWithDefault("settings.pageSize", 20);
```

## 관련 문서

- [Config(natural.config.js) 레퍼런스](DEVELOPER-GUIDE-CONFIG.md)
- [Natural-ARCHITECTURE 개발 가이드](DEVELOPER-GUIDE-ARCHITECTURE.md)
- [Natural-CORE 개발 가이드](DEVELOPER-GUIDE-CORE.md)
- [Communicator 개발 가이드](DEVELOPER-GUIDE-COMMUNICATOR.md)
- [Controller 개발 가이드](DEVELOPER-GUIDE-CONTROLLER.md)
