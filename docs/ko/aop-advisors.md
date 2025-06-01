# Advisors 객체

advisors 객체는 Natural-JS의 관점 지향 프로그래밍(AOP) 구현에서 핵심 구성 요소입니다. Controller 객체의 특정 함수에 어떤 어드바이스를 적용할지, 언제 어떻게 적용할지를 정의합니다.

## 구성 위치

Advisors는 `natural.config.js` 구성 파일의 `N.context.attr("architecture").cont.advisors` 속성에 정의됩니다.

## 구조

어드바이저 정의는 다음 속성으로 구성됩니다:

### pointcut

**Type**: object key string|object  
**Required**: Yes

어드바이저가 적용될 포인트컷을 정의합니다. 포인트컷은 Controller 객체의 함수명을 대상으로 지정합니다.

#### 객체로 지정하기

```javascript
"pointcut": {
    "type": "regexp",
    "param": "^init$"
}
```

이 경우, param 속성에 정의된 객체가 type 속성으로 지정된 포인트컷 함수에 매개변수로 전달됩니다.

#### 문자열로 지정하기

```javascript
"pointcut": "^init$"
```

포인트컷의 값이 객체가 아닌 문자열인 경우, 내장된 "regexp" 포인트컷이 기본값으로 사용됩니다.

#### 특정 뷰 대상으로 지정하기

포인트컷 매개변수 앞에 jQuery 선택자와 콜론을 접두사로 추가하여 특정 뷰로 포인트컷을 제한할 수 있습니다:

```javascript
"pointcut": ".page01,#page02,.page03:^init$"
```

이렇게 하면 지정된 선택자와 일치하는 페이지에만 어드바이스가 적용됩니다.

### adviceType

**Type**: string  
**Required**: Yes

어드바이저의 실행 시점을 설정합니다. 가능한 값:

- **before**: 포인트컷으로 지정한 함수가 실행되기 전에 실행됩니다.
- **after**: 포인트컷으로 지정한 함수가 실행된 후에 실행됩니다.
- **around**: 포인트컷으로 지정한 함수를 실행할 수 있는 joinPoint가 제공됩니다.
- **error**: 포인트컷으로 지정한 함수에서 예외가 발생했을 때 실행됩니다.

### fn

**Type**: function  
**Required**: Yes

어드바이저 함수를 정의합니다. 함수의 인수는 adviceType에 따라 다릅니다:

#### before

```javascript
function(cont, fnChain, args) {
    // 어드바이스 로직
}
```

- **cont**: Controller 객체
- **fnChain**: 함수(명) 체인 문자열
- **args**: 원본 함수의 인수

#### after

```javascript
function(cont, fnChain, args, result) {
    // 어드바이스 로직
}
```

- **cont**: Controller 객체
- **fnChain**: 함수(명) 체인 문자열
- **args**: 원본 함수의 인수
- **result**: 원본 함수의 반환 값

#### around

```javascript
function(cont, fnChain, args, joinPoint) {
    // 실행 전 로직
    var result = joinPoint.proceed();
    // 실행 후 로직
    return result;
}
```

- **cont**: Controller 객체
- **fnChain**: 함수(명) 체인 문자열
- **args**: 원본 함수의 인수
- **joinPoint**: proceed() 메서드를 통해 원본 함수를 실행할 수 있는 객체

#### error

```javascript
function(cont, fnChain, args, result, e) {
    // 오류 처리 로직
}
```

- **cont**: Controller 객체
- **fnChain**: 함수(명) 체인 문자열
- **args**: 원본 함수의 인수
- **result**: 함수에서 오류 발생 전에 반환된 값(있는 경우)
- **e**: 발생한 오류 객체

## 예제

### 기본 Before 어드바이스

```javascript
"advisors": [{
    "pointcut": "^init$",
    "adviceType": "before",
    "fn": function(cont, fnChain, args) {
        console.log("init 함수 실행 전");
    }
}]
```

### 반환 값이 있는 After 어드바이스

```javascript
"advisors": [{
    "pointcut": "^getData$",
    "adviceType": "after",
    "fn": function(cont, fnChain, args, result) {
        // getData가 호출된 후 결과 처리
        if (result && result.length > 0) {
            console.log("데이터가 성공적으로 검색됨");
        }
    }
}]
```

### 데이터 처리용 Around 어드바이스

```javascript
"advisors": [{
    "pointcut": "^save",
    "adviceType": "around",
    "fn": function(cont, fnChain, args, joinPoint) {
        // 데이터 전처리
        if (args[0] && args[0].data) {
            args[0].data = sanitizeData(args[0].data);
        }
        
        // 원본 함수 실행
        var result = joinPoint.proceed();
        
        // 결과 후처리
        console.log("저장 작업 완료");
        
        return result;
    }
}]
```

### 전역 오류 처리

```javascript
"advisors": [{
    "pointcut": {
        "type": "errorPointcut",
        "param": ""
    },
    "adviceType": "error",
    "fn": function(cont, fnChain, args, result, e) {
        console.error("함수 " + fnChain + "에서 오류:", e);
        N().alert("오류가 발생했습니다: " + e.message).show();
    }
}]
```

## 모범 사례

1. **어드바이스 함수를 단순하게 유지하기**: 복잡한 어드바이스 함수는 특히 많은 Controller 함수에 적용될 경우 성능에 영향을 미칠 수 있습니다.

2. **Around 어드바이스를 신중하게 사용하기**: Around 어드바이스가 가장 많은 제어를 제공하지만, 코드를 이해하기 어렵게 만들 수 있습니다. 입력과 출력을 모두 수정해야 할 때만 사용하세요.

3. **횡단 관심사에 집중하기**: AOP는 로깅, 유효성 검사 또는 오류 처리와 같이 여러 함수에 적용되는 관심사에 가장 적합합니다.

4. **포인트컷 충돌 확인하기**: 여러 어드바이저가 동일한 함수를 대상으로 할 때는 실행 순서와 잠재적 상호 작용에 주의하세요.

5. **어드바이저 문서화하기**: AOP는 명백하지 않은 방식으로 함수의 동작을 변경할 수 있으므로 좋은 문서화가 필수적입니다.

## 중요 참고 사항

- 어드바이저는 내장 프레임워크 함수가 아닌 Controller 객체의 사용자 정의 함수에만 적용할 수 있습니다.
- Controller 객체 함수를 `new` 연산자와 함께 사용하면 오류가 발생할 수 있습니다. 이런 경우에는 해당 함수를 포인트컷에서 제외하세요.
- 어드바이저를 구현할 때는 특히 많은 함수에 적용되는 어드바이스의 경우 성능에 미치는 영향에 주의하세요.
- 어드바이저의 fn 매개변수는 일부 컨텍스트에서 `this` 바인딩에 방해가 될 수 있으므로 화살표 함수가 아니어야 합니다.
