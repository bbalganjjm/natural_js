# Natural-JS AOP 개발자 가이드

Natural-JS는 Controller 객체를 대상으로 AOP(Aspect-Oriented Programming) 기능을 제공합니다. 이 문서에서는 Natural-JS의 AOP 기능과 활용 방법에 대해 상세히 설명합니다.

## 목차

1. [개요](#개요)
2. [AOP 주요 구성요소](#aop-주요-구성요소)
3. [Pointcuts 객체](#pointcuts-객체)
4. [Advisors 객체](#advisors-객체)
5. [Advice 유형](#advice-유형)
6. [JoinPoint 객체](#joinpoint-객체)
7. [AOP 활용 예제](#aop-활용-예제)
8. [고급 활용 패턴](#고급-활용-패턴)
9. [성능 고려사항](#성능-고려사항)
10. [보안 고려사항](#보안-고려사항)
11. [디버깅 기법](#디버깅-기법)
12. [주의사항](#주의사항)
13. [다른 컴포넌트와의 통합](#다른-컴포넌트와의-통합)

## 개요

AOP(Aspect-Oriented Programming)는 횡단 관심사(Cross-cutting Concerns)를 모듈화하고 비즈니스 로직과 분리하여 관리할 수 있게 해주는 프로그래밍 패러다임입니다. Natural-JS에서는 Controller 객체에 대한 AOP를 지원하여 UI 개발에서 반복되는 로직들을 공통화하거나 템플릿화할 수 있습니다.

AOP의 핵심 개념은 애플리케이션의 여러 부분에 걸쳐 나타나는 공통 기능(로깅, 보안, 트랜잭션 관리 등)을 분리하여 모듈화하는 것입니다. 이를 통해 핵심 비즈니스 로직과 횡단 관심사를 명확히 분리할 수 있습니다.

Natural-JS의 AOP 기능을 사용하면 다음과 같은 이점이 있습니다:

- **코드 중복 감소**: 여러 Controller에서 반복되는 코드를 하나의 Aspect로 추출하여 중복을 제거합니다.
- **관심사의 분리**: 핵심 비즈니스 로직과 부가 기능을 명확히 분리합니다.
- **개발 생산성 향상**: 개발자가 핵심 로직에만 집중할 수 있게 해줍니다.
- **유지보수성 향상**: 공통 기능 변경 시 한 곳만 수정하면 됩니다.
- **공통 로직 집중화**: 로깅, 보안, 유효성 검사 등의 공통 로직을 중앙에서 관리합니다.
- **선언적 프로그래밍**: 어떤 로직에 어떤 공통 기능을 적용할지 선언적으로 지정할 수 있습니다.

## AOP 주요 구성요소

Natural-JS의 AOP는 다음과 같은 주요 구성요소로 이루어져 있습니다:

1. **Pointcut**: AOP가 적용될 대상 Controller 객체와 메서드를 지정합니다. 여러 Controller와 메서드에 대한 선택 패턴을 정의합니다.
2. **Advice**: Pointcut에 적용될 공통 로직을 정의합니다. 메서드 실행 전, 실행 후, 예외 발생 시 등 다양한 시점에 실행될 수 있습니다.
3. **Advisor**: Pointcut과 Advice를 연결합니다. 어떤 Pointcut에 어떤 Advice를 적용할지 지정합니다.
4. **JoinPoint**: Advice가 실행되는 시점의 컨텍스트 정보를 제공합니다. 원본 함수의 실행이나 반환값 조회 등을 지원합니다.
5. **Weaving**: 런타임에 Pointcut 패턴과 일치하는 Controller 메서드에 Advice를 적용하는 과정입니다.

이러한 구성요소들은 Config(natural.config.js) 파일에서 설정하며, Natural-JS 프레임워크는 이 설정을 바탕으로 런타임에 AOP를 적용합니다.

## Pointcuts 객체

Pointcut은 AOP가 적용될 대상 Controller 객체와 메서드를 지정합니다. Natural-JS에서는 Config(natural.config.js)의 `N.context.attr("architecture").cont.pointcuts` 객체에 Pointcut을 정의합니다.

```javascript
N.context.attr("architecture", {
    cont : {
        pointcuts : [{
            // Pointcut 식별자
            id : "pointcutId",
            // 대상 Controller 객체의 선택자(Selector)
            selector : ".selector1:^func1$, .selector2:^func2$, .selector3"
        }]
    }
});
```

### Pointcut 선택자 문법

Pointcut의 selector는 다음과 같은 형식으로 작성합니다:

- `.selector`: 클래스 이름이 'selector'인 Controller 객체의 모든 함수
- `.selector:^func$`: 클래스 이름이 'selector'인 Controller 객체의 'func' 함수만 선택
- `.selector1, .selector2`: 여러 Controller 객체를 선택할 경우 콤마(,)로 구분
- `!.selector`: 해당 선택자와 일치하는 대상을 제외
- `.*`: 모든 Controller 객체 선택
- `.prefix.*`: 특정 접두사로 시작하는 모든 Controller 객체 선택
- `.selector:^prefix.*$`: 특정 접두사로 시작하는 모든 함수 선택

### 복잡한 선택자 패턴 예제

```javascript
// admin으로 시작하는 모든 Controller 객체에서 save, update, delete 함수만 선택
".admin.*:^save$, .admin.*:^update$, .admin.*:^delete$"

// user 관련 Controller 객체의 모든 함수에서 list 함수만 제외
".user.*, !.user.*:^list$"

// 모든 Controller 객체의 init 함수만 선택
".*:^init$"
```

선택자 문법을 잘 활용하면 매우 정교하게 AOP 적용 대상을 지정할 수 있습니다. 특히 대규모 애플리케이션에서는 명확한 선택자 패턴을 사용하여 의도치 않은 사이드 이펙트를 방지하는 것이 중요합니다.

## Advisors 객체

Advisor는 Pointcut과 Advice를 연결합니다. Natural-JS에서는 Config(natural.config.js)의 `N.context.attr("architecture").cont.advisors` 객체에 Advisor를 정의합니다.

```javascript
N.context.attr("architecture", {
    cont : {
        advisors : [{
            // 적용할 Pointcut의 ID
            pointcut : "pointcutId",
            // Advice 유형
            adviceType : "before",
            // Advice 함수
            fn : function(cont, fnChain, args, joinPoint) {
                // 공통 로직
                // cont: Controller 객체
                // fnChain: Controller 함수의 호출 체인
                // args: Controller 함수의 인자
                // joinPoint: JoinPoint 객체
                
                // around나 before adviceType인 경우 joinPoint.proceed()를
                // 호출하여 원래 함수를 실행해야 합니다.
                joinPoint.proceed();
            }
        }]
    }
});
```

### Advisor 파라미터 상세 설명

Advisor 함수는 다음과 같은 파라미터를 받습니다:

1. **cont**: 현재 실행 중인 Controller 객체 인스턴스. 컨트롤러의 다른 메서드나 속성에 접근할 수 있습니다.
2. **fnChain**: 현재 실행 중인 Controller 함수의 전체 호출 체인(경로). 예: "init", "save", "user.save" 등.
3. **args**: Controller 함수에 전달된 원본 인자들의 배열. 이 인자들을 수정하거나 새 인자를 추가할 수 있습니다.
4. **joinPoint**: Advice 실행 컨텍스트 정보와 원본 함수 제어 메서드를 제공하는 객체.

### 다중 Advisor 등록

동일한 Pointcut에 여러 Advisor를 등록할 수 있습니다. 이 경우 등록 순서대로 실행됩니다.

```javascript
N.context.attr("architecture", {
    cont : {
        advisors : [
            {
                pointcut : "commonPointcut",
                adviceType : "before",
                fn : function(cont, fnChain, args, joinPoint) {
                    console.log("First advisor");
                    joinPoint.proceed();
                }
            },
            {
                pointcut : "commonPointcut",
                adviceType : "before",
                fn : function(cont, fnChain, args, joinPoint) {
                    console.log("Second advisor");
                    joinPoint.proceed();
                }
            }
        ]
    }
});
```

이 경우 "First advisor"가 먼저 출력되고, 그 다음 "Second advisor"가 출력됩니다.

## Advice 유형

Natural-JS에서는 다음과 같은 Advice 유형을 제공합니다:

1. **before**: 원래 함수 실행 전에 Advice 로직을 실행합니다. 메서드 호출 전 사전 조건 검사나 입력 파라미터 변환에 유용합니다.

2. **after**: 원래 함수 실행 후에 Advice 로직을 실행합니다. 반환값 변환, 로깅, 성능 측정 등에 활용할 수 있습니다.

3. **around**: 원래 함수 실행 전과 후에 Advice 로직을 실행합니다. `joinPoint.proceed()`를 호출하여 원래 함수를 실행해야 합니다. 트랜잭션 관리, 캐싱, 성능 측정 등 복잡한 로직에 사용됩니다.

4. **error**: 원래 함수 실행 중 오류가 발생했을 때 Advice 로직을 실행합니다. 예외 처리와 에러 로깅에 유용합니다.

### Advice 유형별 사용 예시

#### before Advice

```javascript
{
    pointcut : "formValidation",
    adviceType : "before",
    fn : function(cont, fnChain, args, joinPoint) {
        // 사전 조건 검사
        if(cont.form && !cont.form.validate()) {
            N.notify.add("폼 데이터가 유효하지 않습니다.");
            return; // 원래 함수 실행하지 않음
        }
        // 원래 함수 실행
        joinPoint.proceed();
    }
}
```

#### after Advice

```javascript
{
    pointcut : "afterFetch",
    adviceType : "after",
    fn : function(cont, fnChain, args, joinPoint) {
        // 원래 함수의 반환값 가져오기
        var result = joinPoint.returnValue();
        
        // 반환값 변환 또는 후처리
        if(result && result.data) {
            result.data = result.data.map(function(item) {
                // 데이터 가공 로직
                return item;
            });
        }
    }
}
```

#### around Advice

```javascript
{
    pointcut : "performanceMeasurement",
    adviceType : "around",
    fn : function(cont, fnChain, args, joinPoint) {
        // 함수 실행 전 작업
        var startTime = new Date().getTime();
        console.log("함수 실행 시작: " + fnChain);
        
        // 원래 함수 실행
        joinPoint.proceed();
        
        // 함수 실행 후 작업
        var endTime = new Date().getTime();
        console.log("함수 실행 완료: " + fnChain + ", 소요 시간: " + (endTime - startTime) + "ms");
    }
}
```

#### error Advice

```javascript
{
    pointcut : "errorHandling",
    adviceType : "error",
    fn : function(cont, fnChain, args, error, joinPoint) {
        // 오류 발생 시 처리
        console.error("함수 실행 중 오류 발생: " + fnChain, error);
        
        // 사용자에게 오류 알림
        N.alert("작업 중 오류가 발생했습니다: " + error.message).show();
        
        // 오류 로깅 또는 서버 전송
        N.comm("error/log", {
            errorType: "CLIENT_ERROR",
            message: error.message,
            stack: error.stack,
            controller: cont.ctx,
            function: fnChain
        });
    }
}
```

## JoinPoint 객체

JoinPoint 객체는 Advice가 실행되는 시점의 컨텍스트 정보를 제공합니다. JoinPoint 객체는 다음과 같은 메서드를 제공합니다:

- **proceed()**: 원래 함수를 실행합니다. around와 before adviceType에서 사용해야 합니다.
- **returnValue()**: 원래 함수의 반환값을 가져옵니다. after adviceType에서 사용할 수 있습니다.

## AOP 활용 예제

### 예제 1: 로깅 Aspect

모든 Controller 함수의 실행 전후에 로깅을 추가하는 Aspect를 구현하는 예제입니다.

```javascript
N.context.attr("architecture", {
    cont : {
        pointcuts : [{
            id : "allControllers",
            selector : ".*"
        }],
        advisors : [{
            pointcut : "allControllers",
            adviceType : "around",
            fn : function(cont, fnChain, args, joinPoint) {
                console.log("Before executing: " + cont.ctx + " - " + fnChain);
                
                var startTime = new Date().getTime();
                joinPoint.proceed();
                var endTime = new Date().getTime();
                
                console.log("After executing: " + cont.ctx + " - " + fnChain + 
                           ", Execution time: " + (endTime - startTime) + "ms");
            }
        }]
    }
});
```

### 예제 2: 유효성 검사 Aspect

Form 제출 전에 유효성 검사를 수행하는 Aspect를 구현하는 예제입니다.

```javascript
N.context.attr("architecture", {
    cont : {
        pointcuts : [{
            id : "formSubmit",
            selector : ".form:^submit$"
        }],
        advisors : [{
            pointcut : "formSubmit",
            adviceType : "before",
            fn : function(cont, fnChain, args, joinPoint) {
                if(cont.form && cont.form.validate()) {
                    // 유효성 검사 통과, 원래 함수 실행
                    joinPoint.proceed();
                } else {
                    // 유효성 검사 실패, 원래 함수 실행하지 않음
                    N.notify.add("폼 데이터가 유효하지 않습니다.");
                }
            }
        }]
    }
});
```

### 예제 3: 권한 검사 Aspect

특정 기능 실행 전에 사용자 권한을 검사하는 Aspect를 구현하는 예제입니다.

```javascript
N.context.attr("architecture", {
    cont : {
        pointcuts : [{
            id : "adminFeatures",
            selector : ".admin:^.*$"
        }],
        advisors : [{
            pointcut : "adminFeatures",
            adviceType : "before",
            fn : function(cont, fnChain, args, joinPoint) {
                if(isAdmin()) {
                    // 관리자 권한이 있는 경우, 원래 함수 실행
                    joinPoint.proceed();
                } else {
                    // 권한이 없는 경우, 오류 메시지 표시
                    N(window).alert("관리자 권한이 필요합니다.").show();
                }
            }
        }]
    }
});

function isAdmin() {
    // 사용자 권한 확인 로직
    return sessionStorage.getItem("userRole") === "ADMIN";
}
```

## 주의사항

Natural-JS의 AOP를 사용할 때 다음 사항에 주의해야 합니다:

1. Controller 객체의 함수를 new 연산자를 통해 객체 인스턴스화하여 사용하면 오류가 발생할 수 있습니다. 이런 경우 pointcut에서 해당 함수를 제외해야 합니다.

2. around와 before adviceType에서는 반드시 `joinPoint.proceed()`를 호출하여 원래 함수를 실행해야 합니다. 그렇지 않으면 원래 함수가 실행되지 않습니다.

3. AOP는 강력한 도구이지만 남용하면 코드의 흐름을 파악하기 어려워질 수 있습니다. 꼭 필요한 경우에만 사용하고, 주석을 통해 AOP의 적용 내용을 명확히 기술하는 것이 좋습니다.

4. Pointcut 선택자를 작성할 때는 가능한 구체적으로 작성하여 의도하지 않은 함수에 AOP가 적용되지 않도록 주의해야 합니다.

Natural-JS의 AOP 기능을 활용하면 UI 개발의 반복되는 로직들을 공통화하거나 템플릿화할 수 있어 개발 생산성이 크게 향상됩니다. 특히 로깅, 유효성 검사, 권한 관리 등의 횡단 관심사를 효과적으로 모듈화할 수 있습니다.

## 고급 활용 패턴

Natural-JS의 AOP를 더 효과적으로 활용할 수 있는 고급 패턴을 소개합니다.

### 조건부 AOP 적용

특정 조건에 따라 AOP를 적용하거나 무시하는 패턴입니다:

```javascript
N.context.attr("architecture", {
    cont : {
        pointcuts : [{
            id : "conditionalPointcut",
            selector : ".*:^save$, .*:^update$"
        }],
        advisors : [{
            pointcut : "conditionalPointcut",
            adviceType : "before",
            fn : function(cont, fnChain, args, joinPoint) {
                // 애플리케이션 상태나 설정에 따라 AOP 적용 여부 결정
                if(N.context.attr("appConfig").enableValidation) {
                    // 유효성 검사 로직 실행
                    if(!validateData(args[0])) {
                        return; // 원래 함수 실행하지 않음
                    }
                }
                
                // 원래 함수 실행
                joinPoint.proceed();
            }
        }]
    }
});

function validateData(data) {
    // 데이터 유효성 검사 로직
    return true;
}
```

### 데이터 변환 체인

여러 Advisor를 순차적으로 적용하여 데이터 변환 파이프라인을 구성하는 패턴입니다:

```javascript
N.context.attr("architecture", {
    cont : {
        pointcuts : [{
            id : "dataTransformChain",
            selector : ".data:^process$"
        }],
        advisors : [
            {
                pointcut : "dataTransformChain",
                adviceType : "before",
                fn : function(cont, fnChain, args, joinPoint) {
                    // 첫 번째 변환: 데이터 정규화
                    if(args[0] && args[0].data) {
                        args[0].data = normalizeData(args[0].data);
                    }
                    joinPoint.proceed();
                }
            },
            {
                pointcut : "dataTransformChain",
                adviceType : "before",
                fn : function(cont, fnChain, args, joinPoint) {
                    // 두 번째 변환: 데이터 검증
                    if(args[0] && args[0].data) {
                        args[0].data = validateAndFilterData(args[0].data);
                    }
                    joinPoint.proceed();
                }
            },
            {
                pointcut : "dataTransformChain",
                adviceType : "before",
                fn : function(cont, fnChain, args, joinPoint) {
                    // 세 번째 변환: 데이터 포맷팅
                    if(args[0] && args[0].data) {
                        args[0].data = formatData(args[0].data);
                    }
                    joinPoint.proceed();
                }
            }
        ]
    }
});

function normalizeData(data) {
    // 데이터 정규화 로직
    return data;
}

function validateAndFilterData(data) {
    // 데이터 검증 및 필터링 로직
    return data;
}

function formatData(data) {
    // 데이터 포맷팅 로직
    return data;
}
```

### 메서드 재정의 패턴

AOP를 사용하여 Controller 메서드의 동작을 동적으로 재정의하는 패턴입니다:

```javascript
N.context.attr("architecture", {
    cont : {
        pointcuts : [{
            id : "methodOverride",
            selector : ".myController:^specificMethod$"
        }],
        advisors : [{
            pointcut : "methodOverride",
            adviceType : "around",
            fn : function(cont, fnChain, args, joinPoint) {
                // 특정 조건에 따라 원래 메서드를 실행하지 않고 다른 동작 수행
                if(shouldOverride()) {
                    // 완전히 다른 구현으로 대체
                    return alternativeImplementation(args);
                } else {
                    // 원래 메서드 실행
                    joinPoint.proceed();
                }
            }
        }]
    }
});

function shouldOverride() {
    // 재정의 여부 결정 로직
    return N.context.attr("environment") === "test";
}

function alternativeImplementation(args) {
    // 대체 구현 로직
    return { status: "success", message: "Test implementation" };
}
```

## 성능 고려사항

AOP는 강력한 기능이지만, 잘못 사용하면 성능에 영향을 줄 수 있습니다. 다음은 AOP 사용 시 성능 최적화를 위한 고려사항입니다:

### 1. Pointcut 선택자 최적화

- 너무 광범위한 선택자(예: `.*)는 많은 함수에 AOP가 적용되어 성능 저하를 일으킬 수 있습니다.
- 가능한 한 구체적인 선택자를 사용하여 필요한 함수에만 AOP를 적용하세요.

```javascript
// 안좋은 예: 모든 Controller의 모든 함수에 적용
{
    id : "badPerformance",
    selector : ".*"
}

// 좋은 예: 특정 패턴의 함수에만 적용
{
    id : "goodPerformance",
    selector : ".user:^save$, .user:^update$, .user:^delete$"
}
```

### 2. Advice 함수 최적화

- Advice 함수 내에서 무거운 연산이나 불필요한 작업을 피하세요.
- 특히 자주 호출되는 함수에 적용되는 Advice는 가볍게 유지해야 합니다.

```javascript
// 안좋은 예: 모든 함수 호출마다 무거운 연산 수행
{
    pointcut : "heavyAdvice",
    adviceType : "before",
    fn : function(cont, fnChain, args, joinPoint) {
        // 무거운 DOM 조작이나 복잡한 계산
        $("body").find("*").each(function() {
            // 복잡한 처리
        });
        
        joinPoint.proceed();
    }
}

// 좋은 예: 필요한 최소한의 작업만 수행
{
    pointcut : "lightweightAdvice",
    adviceType : "before",
    fn : function(cont, fnChain, args, joinPoint) {
        // 간단한 로깅만 수행
        console.log("함수 실행: " + fnChain);
        
        joinPoint.proceed();
    }
}
```

### 3. 캐싱 활용

- 반복적인 계산이나 검사가 필요한 경우, 결과를 캐싱하여 성능을 개선할 수 있습니다.

```javascript
// 캐싱을 활용한 권한 검사 예제
var permissionCache = {};

{
    pointcut : "cachedPermissionCheck",
    adviceType : "before",
    fn : function(cont, fnChain, args, joinPoint) {
        var userId = getCurrentUserId();
        var actionKey = cont.ctx + ":" + fnChain;
        
        // 캐시된 권한 정보가 있으면 사용
        if(permissionCache[userId] && permissionCache[userId][actionKey] !== undefined) {
            if(permissionCache[userId][actionKey]) {
                joinPoint.proceed();
            } else {
                handleNoPermission();
            }
            return;
        }
        
        // 캐시된 정보가 없으면 권한 확인 후 캐싱
        var hasPermission = checkUserPermission(userId, actionKey);
        
        if(!permissionCache[userId]) {
            permissionCache[userId] = {};
        }
        permissionCache[userId][actionKey] = hasPermission;
        
        if(hasPermission) {
            joinPoint.proceed();
        } else {
            handleNoPermission();
        }
    }
}
```

## 보안 고려사항

AOP를 사용할 때 보안 측면에서 고려해야 할 사항들입니다:

### 1. 권한 관리

AOP는 권한 검사를 중앙화하는 데 매우 유용합니다:

```javascript
N.context.attr("architecture", {
    cont : {
        pointcuts : [{
            id : "securityCheck",
            selector : ".admin:^.*$, .sensitive:^.*$"
        }],
        advisors : [{
            pointcut : "securityCheck",
            adviceType : "before",
            fn : function(cont, fnChain, args, joinPoint) {
                // 사용자 인증 상태 확인
                if(!isAuthenticated()) {
                    redirectToLogin();
                    return;
                }
                
                // 필요한 권한 확인
                var requiredRole = getRequiredRoleForFunction(cont.ctx, fnChain);
                if(!hasRole(requiredRole)) {
                    showAccessDenied();
                    return;
                }
                
                // 권한이 있는 경우 원래 함수 실행
                joinPoint.proceed();
            }
        }]
    }
});

function getRequiredRoleForFunction(controllerName, functionName) {
    // 컨트롤러와 함수에 따른 필요 권한 반환
    var securityMap = {
        "admin.users": {
            "delete": "ADMIN",
            "update": "ADMIN",
            "view": "MANAGER"
        },
        "sensitive.data": {
            "access": "DATA_ANALYST",
            "export": "DATA_MANAGER"
        }
    };
    
    if(securityMap[controllerName] && securityMap[controllerName][functionName]) {
        return securityMap[controllerName][functionName];
    }
    
    return "USER"; // 기본 권한
}
```

### 2. 입력 데이터 검증

AOP를 사용하여 모든 입력 데이터를 일관되게 검증할 수 있습니다:

```javascript
N.context.attr("architecture", {
    cont : {
        pointcuts : [{
            id : "inputValidation",
            selector : ".*:^save$, .*:^update$, .*:^process$"
        }],
        advisors : [{
            pointcut : "inputValidation",
            adviceType : "before",
            fn : function(cont, fnChain, args, joinPoint) {
                // 입력 데이터가 있는지 확인
                if(!args[0] || typeof args[0] !== "object") {
                    N.notify.add("유효하지 않은 입력 데이터입니다.");
                    return;
                }
                
                // XSS 방지를 위한 문자열 필터링
                if(typeof args[0] === "object") {
                    sanitizeObject(args[0]);
                }
                
                // 원래 함수 실행
                joinPoint.proceed();
            }
        }]
    }
});

function sanitizeObject(obj) {
    // 객체의 모든 문자열 속성을 살균
    for(var key in obj) {
        if(typeof obj[key] === "string") {
            obj[key] = sanitizeString(obj[key]);
        } else if(typeof obj[key] === "object" && obj[key] !== null) {
            sanitizeObject(obj[key]);
        }
    }
}

function sanitizeString(str) {
    // XSS 방지를 위한 문자열 살균
    return str.replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
```

### 3. 민감한 정보 처리

로깅이나 데이터 처리 시 민감한 정보를 보호하기 위한 AOP 패턴:

```javascript
N.context.attr("architecture", {
    cont : {
        pointcuts : [{
            id : "sensitiveDataProtection",
            selector : ".*:^login$, .*:^register$, .*:^updateProfile$"
        }],
        advisors : [{
            pointcut : "sensitiveDataProtection",
            adviceType : "around",
            fn : function(cont, fnChain, args, joinPoint) {
                // 입력 인자에서 민감한 정보 마스킹
                var maskedArgs = maskSensitiveData(args);
                
                // 마스킹된 데이터로 로깅
                console.log("함수 호출: " + fnChain + ", 인자:", JSON.stringify(maskedArgs));
                
                // 원래 함수는 원본 데이터로 실행
                joinPoint.proceed();
                
                // 반환값에서도 민감한 정보 마스킹
                var result = joinPoint.returnValue();
                if(result) {
                    var maskedResult = maskSensitiveData(result);
                    console.log("함수 반환값:", JSON.stringify(maskedResult));
                }
            }
        }]
    }
});

function maskSensitiveData(data) {
    // 데이터의 깊은 복사본 생성
    var clonedData = JSON.parse(JSON.stringify(data));
    
    // 민감한 필드 목록
    var sensitiveFields = ["password", "creditCard", "ssn", "pin", "securityAnswer"];
    
    // 객체를 순회하며 민감한 필드 마스킹
    function processObject(obj) {
        for(var key in obj) {
            if(sensitiveFields.indexOf(key) >= 0) {
                obj[key] = "********";
            } else if(typeof obj[key] === "object" && obj[key] !== null) {
                processObject(obj[key]);
            }
        }
    }
    
    if(typeof clonedData === "object" && clonedData !== null) {
        processObject(clonedData);
    }
    
    return clonedData;
}
```

## 디버깅 기법

AOP를 사용하는 애플리케이션을 디버깅할 때 도움이 되는 기법들입니다:

### 1. AOP 적용 추적

현재 어떤 AOP가 어디에 적용되었는지 확인하는 디버깅 도구:

```javascript
// 디버깅용 AOP 적용 목록 추적기
(function() {
    var appliedAspects = {};
    
    // 모든 Controller 함수에 AOP 추적 기능 추가
    N.context.attr("architecture", {
        cont : {
            pointcuts : [{
                id : "_aopDebugger",
                selector : ".*" // 모든 Controller 함수 대상
            }],
            advisors : [{
                pointcut : "_aopDebugger",
                adviceType : "around",
                fn : function(cont, fnChain, args, joinPoint) {
                    // 현재 함수에 적용된 AOP 기록
                    var key = cont.ctx + "." + fnChain;
                    if(!appliedAspects[key]) {
                        appliedAspects[key] = [];
                    }
                    
                    // 적용된 다른 AOP 목록 (자기 자신 제외)
                    var aspects = N.context.attr("architecture").cont.advisors
                        .filter(function(advisor) {
                            return advisor.pointcut !== "_aopDebugger" && 
                                   isPointcutMatch(advisor.pointcut, cont.ctx, fnChain);
                        })
                        .map(function(advisor) {
                            return {
                                pointcut: advisor.pointcut,
                                adviceType: advisor.adviceType
                            };
                        });
                    
                    appliedAspects[key] = aspects;
                    
                    // 원래 함수 실행
                    joinPoint.proceed();
                }
            }]
        }
    });
    
    // 현재 적용된 AOP 목록 출력 함수
    window.printAppliedAspects = function() {
        console.log("=== Applied AOP Aspects ===");
        for(var key in appliedAspects) {
            if(appliedAspects[key].length > 0) {
                console.log(key + ":");
                appliedAspects[key].forEach(function(aspect, index) {
                    console.log("  " + (index + 1) + ". Pointcut: " + aspect.pointcut + 
                                ", Type: " + aspect.adviceType);
                });
            }
        }
    };
    
    function isPointcutMatch(pointcutId, controllerName, functionName) {
        // 포인트컷과 컨트롤러/함수 일치 여부 확인 로직
        var pointcut = N.context.attr("architecture").cont.pointcuts.find(function(p) {
            return p.id === pointcutId;
        });
        
        if(!pointcut) {
            return false;
        }
        
        // 간단한 구현 - 실제로는 더 복잡한 선택자 매칭 로직 필요
        return pointcut.selector.indexOf(controllerName) >= 0 || 
               pointcut.selector.indexOf(".*") >= 0;
    }
})();
```

### 2. AOP 로깅 강화

개발 환경에서 AOP 동작을 자세히 로깅하여 디버깅하는 방법:

```javascript
// AOP 로깅 강화 함수
function enableAopDebugLogging() {
    if(N.context.attr("environment") !== "development") {
        return; // 개발 환경에서만 활성화
    }
    
    var originalAdvisors = N.context.attr("architecture").cont.advisors.slice();
    var pointcuts = N.context.attr("architecture").cont.pointcuts;
    
    // 모든 Advisor에 로깅 기능 추가
    N.context.attr("architecture").cont.advisors = originalAdvisors.map(function(advisor) {
        var originalFn = advisor.fn;
        var pointcutName = advisor.pointcut;
        var adviceType = advisor.adviceType;
        
        // 포인트컷 선택자 찾기
        var pointcutSelector = "unknown";
        for(var i = 0; i < pointcuts.length; i++) {
            if(pointcuts[i].id === pointcutName) {
                pointcutSelector = pointcuts[i].selector;
                break;
            }
        }
        
        return {
            pointcut: advisor.pointcut,
            adviceType: advisor.adviceType,
            fn: function(cont, fnChain, args, joinPoint) {
                console.group("AOP " + adviceType + " - " + pointcutName + 
                             " (selector: " + pointcutSelector + ")");
                console.log("Controller:", cont.ctx);
                console.log("Function:", fnChain);
                console.log("Arguments:", args);
                
                var result;
                var error;
                var startTime = new Date().getTime();
                
                try {
                    result = originalFn.apply(this, arguments);
                    return result;
                } catch (e) {
                    error = e;
                    throw e;
                } finally {
                    var endTime = new Date().getTime();
                    
                    if(error) {
                        console.error("Error in AOP:", error);
                    }
                    
                    if(adviceType === "after" || adviceType === "around") {
                        console.log("Return value:", joinPoint.returnValue());
                    }
                    
                    console.log("Execution time:", (endTime - startTime) + "ms");
                    console.groupEnd();
                }
            }
        };
    });
}

// 개발 환경에서 AOP 디버깅 활성화
if(N.context.attr("environment") === "development") {
    enableAopDebugLogging();
}
```

## 다른 컴포넌트와의 통합

Natural-JS의 다른 컴포넌트들과 AOP를 효과적으로 통합하는 방법을 소개합니다.

### Communicator(N.comm)와의 통합

AOP를 사용하여 서버 통신 전후에 공통 로직을 적용하는 예제:

```javascript
N.context.attr("architecture", {
    cont : {
        pointcuts : [{
            id : "commIntegration",
            selector : ".*:^fetch$, .*:^save$, .*:^remove$"
        }],
        advisors : [{
            pointcut : "commIntegration",
            adviceType : "around",
            fn : function(cont, fnChain, args, joinPoint) {
                // 통신 시작 전 로딩 표시
                var loadingIndicator = N.comm.showLoadingBar();
                
                // 원래 함수 실행 (대부분 N.comm 호출 포함)
                joinPoint.proceed();
                
                // 통신 완료 후 로딩 표시 제거
                N.comm.hideLoadingBar(loadingIndicator);
                
                // 결과 처리
                var result = joinPoint.returnValue();
                if(result && result.then) {
                    // Promise 결과 처리
                    result.then(function(data) {
                        // 성공 처리
                        N.notify.add("작업이 성공적으로 완료되었습니다.");
                    }).catch(function(error) {
                        // 오류 처리
                        N.notify.add("작업 중 오류가 발생했습니다: " + error.message, "error");
                    });
                }
            }
        }]
    }
});
```

### Context(N.context)와의 통합

AOP와 Context를 함께 사용하여 상태 관리를 개선하는 예제:

```javascript
N.context.attr("architecture", {
    cont : {
        pointcuts : [{
            id : "contextIntegration",
            selector : ".*:^updateState$, .*:^changeView$"
        }],
        advisors : [{
            pointcut : "contextIntegration",
            adviceType : "after",
            fn : function(cont, fnChain, args, joinPoint) {
                // 상태 변경 후 Context에 현재 상태 저장
                var currentState = {
                    controller: cont.ctx,
                    view: getCurrentView(),
                    lastAction: fnChain,
                    timestamp: new Date().getTime()
                };
                
                // 애플리케이션 상태 이력 관리
                var stateHistory = N.context.attr("stateHistory") || [];
                stateHistory.push(currentState);
                
                // 최대 50개 상태만 유지
                if(stateHistory.length > 50) {
                    stateHistory.shift();
                }
                
                N.context.attr("stateHistory", stateHistory);
                N.context.attr("currentState", currentState);
            }
        }]
    }
});

function getCurrentView() {
    // 현재 활성화된 뷰 정보 반환
    return document.querySelector(".active-view")?.id || "unknown";
}
```

### UI 컴포넌트와의 통합

AOP를 사용하여 UI 컴포넌트의 동작을 확장하는 예제:

```javascript
N.context.attr("architecture", {
    cont : {
        pointcuts : [{
            id : "uiIntegration",
            selector : ".*:^showGrid$, .*:^showForm$"
        }],
        advisors : [{
            pointcut : "uiIntegration",
            adviceType : "after",
            fn : function(cont, fnChain, args, joinPoint) {
                // UI 컴포넌트가 표시된 후 공통 스타일 적용
                var componentType = fnChain.includes("Grid") ? "grid" : 
                                   (fnChain.includes("Form") ? "form" : "unknown");
                
                // 컴포넌트 종류에 따라 다른 스타일 적용
                if(componentType === "grid") {
                    applyGridStyles(cont);
                } else if(componentType === "form") {
                    applyFormStyles(cont);
                }
                
                // 공통 UI 이벤트 핸들러 등록
                attachCommonUIHandlers(cont, componentType);
            }
        }]
    }
});

function applyGridStyles(cont) {
    // 그리드 컴포넌트에 공통 스타일 적용
    if(cont.grid) {
        cont.grid.$el.addClass("corporate-theme");
        cont.grid.$el.find("thead th").addClass("sortable-header");
    }
}

function applyFormStyles(cont) {
    // 폼 컴포넌트에 공통 스타일 적용
    if(cont.form) {
        cont.form.$el.addClass("corporate-form");
        cont.form.$el.find("input, select, textarea").addClass("form-control");
    }
}

function attachCommonUIHandlers(cont, componentType) {
    // 공통 UI 이벤트 핸들러 등록
    if(componentType === "grid" && cont.grid) {
        // 그리드 행 클릭 이벤트 핸들러
        cont.grid.$el.on("click", "tbody tr", function() {
            $(this).addClass("selected").siblings().removeClass("selected");
        });
    }
}
```

Natural-JS의 AOP 기능을 다양한 방식으로 활용하면 코드의 재사용성을 높이고, 관심사를 명확히 분리하며, 애플리케이션의 유지보수성과 확장성을 크게 향상시킬 수 있습니다.
