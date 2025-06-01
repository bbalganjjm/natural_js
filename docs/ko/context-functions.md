# 함수

N.context 객체는 애플리케이션 전반의 데이터와 설정을 저장하고 검색하기 위한 간단하면서도 강력한 API를 제공합니다. 다음 표는 사용 가능한 메서드를 문서화합니다:

| 이름 | 인자 | 유형 | 반환 | 설명 |
|------|------|------|------|------|
| attr | N/A | N/A | set:N.context<br>get:anything | Context에 저장할 데이터를 지정하거나 지정된 데이터를 얻어옵니다.<br><br>**참고**: attr 메서드의 인수의 개수가 2개이면 set으로 작동하고 1개이면 get으로 작동합니다. |
| | name | string | N/A | 데이터명을 지정합니다. |
| | obj | anything | N/A | 데이터 값을 지정합니다. |

## attr() 메서드 사용하기

`attr()` 메서드는 N.context 객체와 상호 작용하기 위한 주요 인터페이스입니다. 제공된 인수의 수에 따라 getter와 setter 역할을 모두 수행합니다:

### Context에 값 설정하기

두 개의 인수로 호출하면 `attr()`는 setter로 기능합니다:

```javascript
// 간단한 값 설정
N.context.attr("myFlag", true);

// 복잡한 객체 설정
N.context.attr("userSettings", {
    theme: "dark",
    fontSize: "medium",
    notifications: {
        email: true,
        push: false
    }
});

// 중첩된 값 설정
N.context.attr("app.version", "1.2.3");
N.context.attr("app.releaseDate", new Date(2023, 5, 15));

// 메서드 체이닝 지원
N.context
    .attr("mode", "development")
    .attr("debug", true)
    .attr("logLevel", "verbose");
```

### Context에서 값 가져오기

단일 인수로 호출하면 `attr()`는 getter로 기능합니다:

```javascript
// 간단한 값 가져오기
var myFlag = N.context.attr("myFlag"); // true

// 복잡한 객체 가져오기
var userSettings = N.context.attr("userSettings");
console.log(userSettings.theme); // "dark"
console.log(userSettings.notifications.email); // true

// 중첩된 값 가져오기
var appVersion = N.context.attr("app.version"); // "1.2.3"
```

### 기본 구성 값 접근하기

N.context는 일반적으로 프레임워크의 구성 값에 접근하는 데 사용됩니다:

```javascript
// 코어 설정 가져오기
var coreSettings = N.context.attr("core");

// 특정 코어 설정 가져오기
var defaultLocale = N.context.attr("core.locale"); 

// 아키텍처 설정 가져오기
var architecture = N.context.attr("architecture");

// 특정 Communicator 필터 가져오기
var commFilters = N.context.attr("architecture.comm.filters");
```

## 모범 사례

N.context를 사용할 때 다음과 같은 모범 사례를 고려하세요:

1. **네임스페이싱 사용**: 충돌을 피하기 위해 의미 있는 네임스페이스로 데이터를 구성합니다
   ```javascript
   // 좋음
   N.context.attr("myApp.user.preferences", {...});
   
   // 권장하지 않음 - 너무 일반적임
   N.context.attr("preferences", {...});
   ```

2. **대용량 데이터 세트 저장 피하기**: N.context는 대용량 데이터 세트가 아닌 구성 및 작은 영구 데이터를 위한 것입니다
   ```javascript
   // 좋음
   N.context.attr("myApp.datasetId", "12345");
   
   // 권장하지 않음
   N.context.attr("myApp.fullDataset", 수천 개의 항목이 있는 대형 배열);
   ```

3. **데이터 지속성 요구 사항 고려**: N.context 데이터는 현재 페이지 수명 주기 동안만 지속됨을 기억하세요
   ```javascript
   // 페이지 새로 고침 후에도 유지해야 하는 데이터의 경우 스토리지 메커니즘 사용
   localStorage.setItem("persistentPreference", JSON.stringify(preferences));
   
   // 현재 페이지 데이터만
   N.context.attr("currentPageState", state);
   ```
