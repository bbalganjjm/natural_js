# Pointcuts 객체

pointcuts 객체는 Natural-JS의 AOP(Aspect-Oriented Programming) 구현에서 핵심 구성 요소입니다. Controller 객체의 어떤 함수에 어드바이스를 적용할지 선택하는 기준을 정의합니다.

## 구성 위치

Pointcuts는 `natural.config.js` 구성 파일의 `N.context.attr("architecture").cont.pointcuts` 속성에 정의됩니다.

## 구조

포인트컷 정의는 고유한 이름(객체 키로 사용)과 Controller 객체의 특정 함수가 어드바이스의 영향을 받아야 하는지 여부를 결정하는 함수를 포함하는 객체로 구성됩니다.

```javascript
N.context.attr("architecture", {
    "cont": {
        "pointcuts": {
            "pointcutName": {
                "fn": function(param, cont, fnChain) {
                    // 포인트컷 로직...
                    return true; // 어드바이스를 적용하려면 true, 건너뛰려면 false 반환
                }
            }
        }
    }
});
```

## 포인트컷 함수 매개변수

포인트컷 함수는 세 가지 매개변수를 받습니다:

| 매개변수 | 타입 | 설명 |
|-----------|------|-------------|
| param | RegExp 또는 문자열 | 어드바이저 정의에서 전달된 정규 표현식 문자열 또는 RegExp 객체 |
| cont | 객체 | 평가 중인 함수를 포함하는 Controller 객체 |
| fnChain | 문자열 | "viewSelector:functionName.functionName..." 형식의 함수 체인 문자열 표현 |

## 반환 값

포인트컷 함수는 불리언 값을 반환해야 합니다:

- `true`: 함수에 어드바이스가 적용됨
- `false`: 함수에 어드바이스가 적용되지 않음

## 내장 포인트컷

Natural-JS에는 사용자 정의 없이 사용할 수 있는 내장 포인트컷이 제공됩니다:

### regexp

정규 표현식을 기반으로 함수를 평가하는 가장 일반적으로 사용되는 포인트컷입니다. 이는 Natural-JS에 내장되어 있으며 대부분의 사용 사례를 다룹니다.

```javascript
"regexp": {
    "fn": function(param, cont, fnChain) {
        var regexp = param instanceof RegExp ? param : new RegExp(param);
        return regexp.test(fnChain);
    }
}
```

어드바이저에서의 사용:

```javascript
"advisors": [{
    "pointcut": "^init$", // regexp 포인트컷을 사용하여 "init"이라는 모든 함수 매칭
    "adviceType": "before",
    "fn": function(cont, fnChain, args) {
        // 어드바이스 로직...
    }
}]
```

### errorPointcut

무조건 true를 반환하여 모든 함수에 어드바이스를 적용할 수 있게 하는 오류 처리를 위한 내장 포인트컷입니다.

```javascript
"errorPointcut": {
    "fn": function(param, cont, fnChain) {
        // 무조건 허용
        return true;
    }
}
```

## 사용자 정의 포인트컷 생성

내장 포인트컷이 대부분의 사용 사례를 다루지만, 더 구체적인 요구 사항에 맞는 사용자 정의 포인트컷을 생성할 수 있습니다:

### 예: 함수 매개변수 포인트컷

이 사용자 정의 포인트컷은 특정 매개변수 타입을 가진 함수를 대상으로 합니다:

```javascript
"parameterTypePointcut": {
    "fn": function(param, cont, fnChain) {
        // 평가 중인 함수 가져오기
        var fn = cont;
        var parts = fnChain.split(":");
        if (parts.length > 1) {
            var functionPath = parts[1].split(".");
            for (var i = 0; i < functionPath.length; i++) {
                fn = fn[functionPath[i]];
                if (typeof fn !== "function") {
                    return false;
                }
            }
        }
        
        // 매개변수 타입 체크를 위한 함수 소스 코드 확인
        var fnSource = fn.toString();
        return fnSource.indexOf("instanceof " + param) > -1;
    }
}
```

사용법:

```javascript
"advisors": [{
    "pointcut": {
        "type": "parameterTypePointcut",
        "param": "FormData"
    },
    "adviceType": "before",
    "fn": function(cont, fnChain, args) {
        // 이 어드바이스는 FormData 매개변수를 확인하는 함수에 적용됩니다
    }
}]
```

### 예: 함수 이름 패턴 포인트컷

이 포인트컷은 단순한 정규 표현식 이상의 명명 패턴을 기반으로 함수를 매칭합니다:

```javascript
"namingPatternPointcut": {
    "fn": function(param, cont, fnChain) {
        // 체인에서 함수 이름 추출
        var parts = fnChain.split(":");
        var functionName = parts.length > 1 ? parts[1].split(".").pop() : "";
        
        // 함수가 지정된 명명 패턴을 따르는지 확인
        var patternParts = param.split("*");
        return functionName.startsWith(patternParts[0]) && 
               (patternParts.length === 1 || functionName.endsWith(patternParts[1]));
    }
}
```

사용법:

```javascript
"advisors": [{
    "pointcut": {
        "type": "namingPatternPointcut",
        "param": "save*Data"
    },
    "adviceType": "around",
    "fn": function(cont, fnChain, args, joinPoint) {
        // 이 어드바이스는 saveUserData, saveProductData 등과 같은 함수에 적용됩니다
    }
}]
```

## 모범 사례

1. **가능한 내장 포인트컷 사용하기**: 내장 `regexp` 포인트컷은 대부분의 경우에 충분하며 성능에 최적화되어 있습니다.

2. **포인트컷 로직 단순화하기**: 복잡한 포인트컷 로직은 특히 많은 Controller 함수가 있는 애플리케이션에서 성능에 영향을 미칠 수 있습니다.

3. **집중된 포인트컷 만들기**: 모든 함수에 복잡한 로직을 적용하기보다는 특정 함수 카테고리를 대상으로 하는 포인트컷을 설계하세요.

4. **사용자 정의 포인트컷 문서화하기**: 사용자 정의 포인트컷을 만드는 경우 다른 개발자를 위해 그 목적과 사용 패턴을 문서화하세요.

5. **포인트컷 적용 범위 테스트하기**: 포인트컷이 의도한 함수만 정확하게 선택하는지 확인하세요.

## 중요 참고 사항

- 포인트컷은 내장 프레임워크 함수가 아닌 Controller 객체의 사용자 정의 함수에만 적용됩니다.
- 함수 체인을 평가할 때 깊게 중첩된 함수는 긴 체인 표현을 가질 수 있다는 점을 유의하세요.
- 포인트컷 함수에서 오류가 발생하면 AOP 시스템은 해당 함수에 어드바이스 적용을 건너뜁니다.
- 많은 Controller가 있는 복잡한 애플리케이션의 경우 포인트컷 로직의 성능 영향을 고려하세요.
