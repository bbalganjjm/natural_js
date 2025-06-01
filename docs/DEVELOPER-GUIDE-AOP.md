# Natural-JS AOP 개발자 가이드

Natural-JS는 Controller 객체를 대상으로 AOP(Aspect-Oriented Programming) 기능을 제공합니다. 이 문서에서는 Natural-JS의 AOP 기능과 활용 방법에 대해 설명합니다.

## 목차

1. [개요](#개요)
2. [AOP 주요 구성요소](#aop-주요-구성요소)
3. [Pointcuts 객체](#pointcuts-객체)
4. [Advisors 객체](#advisors-객체)
5. [Advice 유형](#advice-유형)
6. [JoinPoint 객체](#joinpoint-객체)
7. [AOP 활용 예제](#aop-활용-예제)
8. [주의사항](#주의사항)

## 개요

AOP(Aspect-Oriented Programming)는 횡단 관심사(Cross-cutting Concerns)를 모듈화하고 비즈니스 로직과 분리하여 관리할 수 있게 해주는 프로그래밍 패러다임입니다. Natural-JS에서는 Controller 객체에 대한 AOP를 지원하여 UI 개발에서 반복되는 로직들을 공통화하거나 템플릿화할 수 있습니다.

Natural-JS의 AOP 기능을 사용하면 다음과 같은 이점이 있습니다:

- 코드 중복 감소
- 관심사의 분리
- 개발 생산성 향상
- 유지보수성 향상
- 공통 로직 집중화

## AOP 주요 구성요소

Natural-JS의 AOP는 다음과 같은 주요 구성요소로 이루어져 있습니다:

1. **Pointcut**: AOP가 적용될 대상 Controller 객체와 메서드를 지정합니다.
2. **Advice**: Pointcut에 적용될 공통 로직을 정의합니다.
3. **Advisor**: Pointcut과 Advice를 연결합니다.
4. **JoinPoint**: Advice가 실행되는 시점의 컨텍스트 정보를 제공합니다.

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

Pointcut의 selector는 다음과 같은 형식으로 작성합니다:

- `.selector`: 클래스 이름이 'selector'인 Controller 객체의 모든 함수
- `.selector:^func$`: 클래스 이름이 'selector'인 Controller 객체의 'func' 함수만 선택
- `.selector1, .selector2`: 여러 Controller 객체를 선택할 경우 콤마(,)로 구분

selector 문자열 앞에 `!`를 붙이면 해당 선택자와 일치하는 대상을 제외합니다.

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

## Advice 유형

Natural-JS에서는 다음과 같은 Advice 유형을 제공합니다:

1. **before**: 원래 함수 실행 전에 Advice 로직을 실행합니다.
2. **after**: 원래 함수 실행 후에 Advice 로직을 실행합니다.
3. **around**: 원래 함수 실행 전과 후에 Advice 로직을 실행합니다. `joinPoint.proceed()`를 호출하여 원래 함수를 실행해야 합니다.
4. **error**: 원래 함수 실행 중 오류가 발생했을 때 Advice 로직을 실행합니다.

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
