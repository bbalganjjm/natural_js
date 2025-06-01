# Config 예제

다음은 Natural-JS를 설정하는 방법을 보여주는 샘플 설정 파일(natural.config.js)입니다.

```javascript
(function(N) {
    // Natural-JS Config 설정
    N.context.attr("core", {
        // 기본 설정
        "locale" : "ko_KR",
        "sgChkdVal" : "Y", // N().vals 메서드에서 체크박스가 한 개 일 경우 체크되었을 때 기본 값
        "sgUnChkdVal" : "N", // N().vals 메서드에서 체크박스가 한 개 일 경우 체크 해제되었을 때 기본 값
        "spltSepa" : "$@^", // Natural-JS에서 사용하는 문자열 구분자
        "gcMode" : "full", // N.gc 함수의 가비지 컬렉션 모드
        "charByteLength" : 3 // 다중 바이트 문자의 기본 바이트 길이 설정
    });

    N.context.attr("architecture", {
        // 페이지 기반 애플리케이션에 필요
        "page" : {
            "context" : ".main-content"
        },
        "cont" : {
            // AOP 설정을 여기에 정의
        },
        "comm" : {
            "filters" : [
                // Communication Filter 설정을 여기에 정의
            ],
            "request" : {
                // N.comm.request의 전역 옵션
            }
        }
    });

    N.context.attr("data", {
        "formatter" : {
            "date" : {
                "dateSepa" : "-", // 년, 월, 일 구분 문자
                "timeSepa" : ":", // 시, 분, 초 구분 문자
                // 날짜 포맷 함수
                "Ym" : function() {
                    return "Y" + this.dateSepa + "m";
                },
                "Ymd" : function() {
                    return "Y" + this.dateSepa + "m" + this.dateSepa + "d";
                }
                // ... 기타 날짜 포맷
            }
        },
        "validator" : {
            // 사용자 정의 유효성 검증 룰
            "userRules" : {
                // 여기에 사용자 정의 유효성 검증 룰 정의
            },
            // 오류 메시지
            "message" : {
                "ko_KR" : {
                    // 한국어 오류 메시지
                },
                "en_US" : {
                    // 영어 오류 메시지
                }
            }
        }
    });

    N.context.attr("ui", {
        // UI 컴포넌트에 필요
        "alert" : {
            "container" : ".main-content",
            "global" : {
                "okBtnStyle" : {
                    "color" : "yellowgreen",
                    "size" : "medium"
                },
                "cancelBtnStyle" : {
                    "size" : "medium"
                }
            }
        },
        // 기타 UI 컴포넌트 설정
        "datepicker" : {
            "monthonlyOpts" : {
                "yearsPanelPosition" : "top",
                "monthsPanelPosition" : "top"
            }
        }
    });

    // 필요에 따라 추가 패키지 구성
    N.context.attr("ui.shell", {
        // Shell UI 컴포넌트 설정
    });

    N.context.attr("template", {
        // 템플릿 설정
    });

    N.context.attr("code", {
        // 코드 검사 설정
    });

})(N);
```

이 예제는 Natural-JS 설정 파일의 기본 구조를 보여줍니다. 애플리케이션의 요구 사항에 맞게 사용자 정의해야 합니다.
