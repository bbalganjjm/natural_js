# AOP 개요

관점 지향 프로그래밍(Aspect-Oriented Programming, AOP)은 횡단 관심사의 분리를 허용하여 모듈성을 증가시키는 프로그래밍 패러다임입니다. Natural-JS는 Controller 객체에 대한 AOP 지원을 제공하여 개발자가 코드 중복 없이 여러 컴포넌트에 공통 로직을 적용할 수 있게 합니다.

## AOP란 무엇인가?

AOP는 프로그램 구조에 대한 또 다른 사고 방식을 제공하여 객체 지향 프로그래밍(OOP)을 보완합니다. OOP가 클래스와 객체를 사용하여 애플리케이션을 모듈화하는 반면, AOP는 애스펙트를 사용하여 모듈화합니다. 애스펙트는 여러 타입과 객체에 걸쳐 있는 관심사(로깅, 보안, 트랜잭션 관리 등)의 모듈화를 가능하게 합니다.

Natural-JS에서 AOP는 Controller 객체의 함수 실행을 가로채서 이러한 함수의 실행 전, 후 또는 주변에 추가 동작을 적용하거나 오류가 발생했을 때 동작을 적용할 수 있게 합니다.

## AOP의 핵심 개념

### 포인트컷(Pointcut)

포인트컷은 어드바이스가 적용되어야 하는 특정 조인 포인트(Natural-JS에서는 Controller 객체의 함수)를 선택하는 표현식입니다. Natural-JS는 대상 함수를 쉽게 선택할 수 있는 내장 포인트컷 유형을 제공합니다:

- **regexp**: 정규 표현식을 사용하여 함수 이름을 매칭하는 가장 일반적으로 사용되는 포인트컷 유형

### 어드바이스(Advice)

어드바이스는 특정 조인 포인트에서 취해야 할 동작을 정의합니다. Natural-JS는 여러 유형의 어드바이스를 지원합니다:

- **before**: 대상 함수 전에 실행됨
- **after**: 대상 함수 후에 실행되며, 함수의 반환 값을 받음
- **around**: 함수 실행에 대한 완전한 제어를 제공하며, 입력과 출력을 수정할 수 있음
- **error**: 대상 함수에서 예외가 발생했을 때 실행됨

### 어드바이저(Advisor)

어드바이저는 포인트컷과 어드바이스를 결합하여, 어떤 함수를 대상으로 하고 그 함수가 실행될 때 어떤 동작을 취할지를 정의합니다.

## Natural-JS에서 AOP의 이점

- **코드 재사용성**: 중복 없이 여러 Controller 객체에 걸쳐 공통 로직 적용
- **관심사의 깔끔한 분리**: 비즈니스 로직과 횡단 관심사를 분리하여 유지
- **중앙 집중식 구성**: 중앙 구성에서 횡단 관심사 관리
- **생산성 향상**: 상용구 코드 감소 및 유지 보수 간소화
- **표준화**: 애플리케이션 전체에 걸쳐 일관된 동작 강제

## Natural-JS에서 AOP 사용하기

AOP 선언은 Natural-JS 구성 파일(`natural.config.js`)의 `N.context.attr("architecture").cont` 섹션에 정의됩니다. 이 중앙 집중식 접근 방식을 통해 한 곳에서 모든 애스펙트를 관리할 수 있습니다.

```javascript
N.context.attr("architecture", {
    "cont": {
        "pointcuts": {
            // 여기에 사용자 정의 포인트컷 정의 (선택 사항, regexp는 내장되어 있음)
            "customPointcut": {
                "fn": function(param, cont, fnChain) {
                    // 포인트컷 로직
                    return true; // 어드바이스를 적용할지 결정하기 위한 불리언 반환
                }
            }
        },
        "advisors": [{
            // 대상 함수 정의
            "pointcut": "^init$",  // 모든 init 함수 대상 (regexp 사용)
            
            // 어드바이스 실행 시점 정의
            "adviceType": "before", // before, after, around, 또는 error
            
            // 어드바이스 함수 정의
            "fn": function(cont, fnChain, args) {
                // 어드바이스 로직
                console.log("init 함수 실행 전");
            }
        }]
    }
});
```

## 일반적인 사용 사례

### 1. 로깅 및 디버깅

디버깅 및 모니터링을 위한 함수 호출, 매개변수 및 실행 시간 추적:

```javascript
"advisors": [{
    "pointcut": ".*",  // 모든 함수에 적용
    "adviceType": "around",
    "fn": function(cont, fnChain, args, joinPoint) {
        console.log("함수 진입: " + fnChain);
        var startTime = new Date().getTime();
        
        var result = joinPoint.proceed();
        
        var endTime = new Date().getTime();
        console.log("함수 종료: " + fnChain + " (실행 시간: " + (endTime - startTime) + "ms)");
        
        return result;
    }
}]
```

### 2. 데이터 전처리

대상 함수에서 처리하기 전에 데이터 검증 또는 변환:

```javascript
"advisors": [{
    "pointcut": "^save",  // 모든 save 함수에 적용
    "adviceType": "before",
    "fn": function(cont, fnChain, args) {
        // 입력 데이터 정제
        if (args[0] && args[0].data) {
            args[0].data = sanitizeData(args[0].data);
        }
    }
}]
```

### 3. 오류 처리

애플리케이션 전체에 걸쳐 중앙 집중식 오류 처리 제공:

```javascript
"advisors": [{
    "pointcut": ".*",  // 모든 함수에 적용
    "adviceType": "error",
    "fn": function(cont, fnChain, args, result, error) {
        console.error("함수 " + fnChain + "에서 오류 발생:", error);
        N().alert("오류가 발생했습니다: " + error.message).show();
    }
}]
```

### 4. 컴포넌트 초기화

페이지 로딩 후 UI 컴포넌트 자동 초기화:

```javascript
"advisors": [{
    "pointcut": "^init$",  // 모든 init 함수 대상
    "adviceType": "after",
    "fn": function(cont, fnChain, args) {
        // 버튼 초기화
        N("button", cont.view).button();
        
        // 다른 컴포넌트 초기화
        N(".datepicker", cont.view).datepicker();
    }
}]
```

## 중요 참고 사항

- Natural-JS의 AOP는 내장 프레임워크 함수가 아닌 Controller 객체의 사용자 정의 함수에만 적용할 수 있습니다.
- `new` 연산자로 Controller 객체 함수를 사용하면 오류가 발생할 수 있습니다. 이런 경우에는 해당 함수를 포인트컷에서 제외하세요.
- AOP를 적절히 사용하세요 - 모듈성을 크게 향상시킬 수 있지만, 과도한 사용은 애플리케이션 흐름을 이해하기 어렵게 만들 수 있습니다.
- 어드바이스 함수를 구현할 때는 특히 많은 함수에 적용되는 어드바이스의 경우 성능에 미치는 영향을 고려하세요.

Natural-JS에서 AOP를 효과적으로 활용하면 코드 구성, 유지 관리성 및 개발 생산성을 크게 향상시킬 수 있습니다.
