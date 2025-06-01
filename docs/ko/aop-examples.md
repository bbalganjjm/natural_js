# AOP 예제

이 문서는 Natural-JS에서 관점 지향 프로그래밍(AOP)을 사용하여 애플리케이션 전반에 걸친 횡단 관심사와 공통 기능을 구현하는 방법에 대한 실용적인 예제를 제공합니다.

## 1. AOP 구성

AOP 설정은 `natural.config.js` 구성 파일의 `N.context.attr("architecture").cont` 속성에 정의됩니다. 다음 예제는 다양한 유형의 어드바이스가 포함된 완전한 AOP 구성을 보여줍니다:

```javascript
N.context.attr("architecture", {
    "cont": {
        "pointcuts": {
            "regexp": {
                "fn": function(param, cont, fnChain) {
                    var regexp = param instanceof RegExp ? param : new RegExp(param);
                    return regexp.test(fnChain);
                }
            },
            "errorPointcut": {
                "fn": function(param, cont, fnChain) {
                    // 무조건 허용
                    return true;
                }
            }
        },
        "advisors": [{
            "pointcut": "^before.*",
            "adviceType": "before",
            "fn": function(cont, fnChain, args) {
                console.log("call me before %s", fnChain);
            }
        }, {
            "pointcut": "^after.*",
            "adviceType": "after",
            "fn": function(cont, fnChain, args, result) {
                console.log("call me after %s", fnChain);
                console.log("result", result);
            }
        }, {
            "pointcut": "^around.*",
            "adviceType": "around",
            "fn": function(cont, fnChain, args, joinPoint) {
                console.log("call me around %s", fnChain);
                var result = joinPoint.proceed();
                console.log("result ", result);
                return result;
            }
        }, {
            "pointcut": {
                "type": "errorPointcut",
                "param": ""
            },
            "adviceType": "error",
            "fn": function(cont, fnChain, args, result, e) {
                console.log("call me error %s", fnChain);
            }
        }]
    }
});
```

이 구성은:
1. 두 가지 포인트컷을 정의합니다: `regexp`(정규식으로 함수 이름 매칭)와 `errorPointcut`(오류 처리용)
2. 모든 어드바이스 유형을 보여주는 네 가지 어드바이저를 설정합니다:
   - `before`: "before"로 시작하는 이름을 가진 함수 전에 실행
   - `after`: "after"로 시작하는 이름을 가진 함수 후에 실행
   - `around`: "around"로 시작하는 이름을 가진 함수 주변에서 실행
   - `error`: 모든 함수에서 오류가 발생할 때 실행

## 2. 모든 페이지에 대한 공통 코드 로딩

다음 예제는 모든 페이지에 대한 공통 코드를 로드하고, N.select 컴포넌트를 사용하여 요소에 바인딩한 다음, Controller의 init 함수를 실행하는 방법을 보여줍니다:

```javascript
N.context.attr("architecture", {
    "cont": {
        "advisors": [{
            "pointcut": "^init$",
            "adviceType": "around",
            "fn": function(cont, fnChain, args, joinPoint) {
                // 1. 공통코드 데이터 가져오기
                N.comm("getCommCodeList.json").submit(function(data) {
                    // 2. N.select로 선택 요소에 공통코드 바인딩
                    N(data).select({
                        context: N("#select", cont.view)
                    }).bind()

                    // 3. init 함수 실행
                    joinPoint.proceed();
                });
            }
        }]
    }
});
```

이 어드바이저는:
1. Controller 객체의 모든 `init` 함수를 가로챕니다
2. `N.comm`을 사용하여 서버에서 공통 코드 데이터를 로드합니다
3. Controller의 뷰 내의 선택 요소에 데이터를 바인딩합니다
4. 마지막으로 원래의 `init` 함수를 실행합니다

## 3. 자동 컴포넌트 초기화

이 예제는 페이지가 로드될 때 Controller의 init 함수가 실행되기 전에 UI 컴포넌트(버튼, 폼, 그리드, 리스트)를 자동으로 초기화하는 방법을 보여줍니다:

```javascript
N.context.attr("architecture", {
    "cont": {
        "advisors": [{
            "pointcut": "^init$",
            "adviceType": "around",
            "fn": function(cont, fnChain, args, joinPoint) {
                // 1. 버튼 컴포넌트 초기화
                N(".button").button();

                // 2. 폼 컴포넌트 초기화
                N(".form", cont.view).each(function() {
                    N([]).form(this);
                });

                // 3. 리스트 컴포넌트 초기화
                N(".list", cont.view).each(function() {
                    N([]).list(this);
                });

                // 4. 그리드 컴포넌트 초기화
                N(".grid", cont.view).each(function() {
                    N([]).grid(this);
                });

                // 5. 원래의 init 함수 실행
                joinPoint.proceed();

                // 6. 초기화 후, 컨텍스트에서 컴포넌트 인스턴스를 가져와 사용
                var grid01 = N("#grid01", cont.view).instance("grid");
                grid01.bind([]);
            }
        }]
    }
});
```

이 어드바이저는:
1. Controller의 뷰 내에서 요소를 선택하여 다양한 UI 컴포넌트를 초기화합니다
2. 원래의 `init` 함수를 실행합니다
3. 초기화 후, 컴포넌트 인스턴스를 검색하고 추가 작업을 수행합니다

## 4. 로깅 및 성능 모니터링

다음 예제는 모든 Controller 함수에 로깅 및 성능 모니터링을 추가하는 방법을 보여줍니다:

```javascript
N.context.attr("architecture", {
    "cont": {
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
    }
});
```

이 어드바이저는:
1. 모든 Controller 객체의 모든 함수를 가로챕니다
2. 함수가 시작될 때 로그를 남깁니다
3. 실행 시간을 측정합니다
4. 함수가 종료될 때 실행 시간과 함께 로그를 남깁니다

## 5. 저장 작업 전 데이터 유효성 검사

이 예제는 저장 작업 전에 유효성 검사를 추가하는 방법을 보여줍니다:

```javascript
N.context.attr("architecture", {
    "cont": {
        "advisors": [{
            "pointcut": "^save",  // "save"로 시작하는 모든 함수에 적용
            "adviceType": "before",
            "fn": function(cont, fnChain, args) {
                // 진행하기 전에 폼이 유효한지 확인
                var form = N("form", cont.view);
                if (form.length > 0) {
                    var validator = N(form).validator();
                    if (!validator.validate()) {
                        throw N.error("저장하기 전에 폼의 오류를 수정해 주세요.");
                    }
                }
            }
        }]
    }
});
```

이 어드바이저는:
1. "save"로 시작하는 모든 함수를 가로챕니다
2. Controller의 뷰 내에서 폼을 찾습니다
3. 저장 작업이 진행되기 전에 폼의 유효성을 검사합니다
4. 유효성 검사가 실패하면 오류를 발생시킵니다

## 6. 중앙 집중식 오류 처리

다음 예제는 모든 Controller 함수에 대한 중앙 집중식 오류 처리를 구현합니다:

```javascript
N.context.attr("architecture", {
    "cont": {
        "advisors": [{
            "pointcut": {
                "type": "errorPointcut",
                "param": ""
            },
            "adviceType": "error",
            "fn": function(cont, fnChain, args, result, e) {
                // 오류 로깅
                console.error("함수 " + fnChain + "에서 오류:", e);
                
                // 사용자 친화적 메시지 표시
                if (e.message) {
                    N().alert(e.message).show();
                } else {
                    N().alert("예기치 않은 오류가 발생했습니다. 다시 시도해 주세요.").show();
                }
                
                // 추가 오류 처리 로직
                if (fnChain.indexOf("save") > -1) {
                    // 저장 작업에 대한 특별 처리
                    N(".saveBtn", cont.view).prop("disabled", false);
                }
            }
        }]
    }
});
```

이 어드바이저는:
1. 모든 Controller 함수의 모든 오류를 캐치합니다
2. 콘솔에 상세한 오류 정보를 로깅합니다
3. 사용자 친화적인 메시지를 표시합니다
4. 특정 유형의 함수에 대한 특별 처리를 적용합니다

## 모범 사례

1. **AOP 선언 구성하기**: 관련 어드바이저를 함께 그룹화하여 가독성과 유지 관리성을 향상시킵니다.

2. **구체적인 포인트컷 사용하기**: 어드바이스를 너무 광범위하게 적용하기보다는 필요한 함수만 대상으로 지정합니다.

3. **어드바이스 함수를 단순하게 유지하기**: 여러 관심사를 결합하기보다는 각 어드바이스가 한 가지 일을 잘 수행하도록 구현합니다.

4. **성능 고려하기**: 특히 자주 호출되는 함수의 경우 AOP가 오버헤드를 추가할 수 있음을 인지합니다.

5. **철저한 테스트하기**: AOP는 애플리케이션 전체의 동작을 변경할 수 있으므로 철저한 테스트가 필수적입니다.

Natural-JS에서 AOP를 효과적으로 사용하면 코드 구성을 크게 개선하고, 중복을 줄이고, 애플리케이션 전체에 걸쳐 일관된 동작을 강제할 수 있습니다.
