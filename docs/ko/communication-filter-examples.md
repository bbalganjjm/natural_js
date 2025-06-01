# 예제

## 1. 필터 선언

Natural-JS에서 Communication Filters를 사용할 때 알아야 할 중요한 사항:

- N.comm으로 호출되는 모든 요청과 응답이 정의한 필터를 통과하게 되므로 서버 요청과 응답 사이에 공통으로 적용해야 할 로직 등을 정의하면 됩니다.
- 필터 이벤트 핸들러 함수의 request 인수에는 Ajax 요청에 대한 유용한 정보가 포함되어 있습니다. request 객체에 대한 자세한 내용은 [Communicator.request](communicator-request-overview.md) 문서를 참고 바랍니다.
- 필터를 여러 개 선언할 수 있으며 필터 오브젝트의 명칭(filters 객체의 필터 프로퍼티 명)은 자유롭게 지정하면 됩니다.
- filter 설정은 natural.config.js 파일의 N.context.attr("architecture").comm.filters 속성에 설정합니다.

```javascript
N.context.attr("architecture", {
    "comm" : {
        "filters" : {
            "exFilter1" : {
                /**
                 * 필터 실행 순서
                 */
                order : 1,
                /**
                 * N.comm이 초기화되기 전에 실행됩니다. string으로 변환되지 않은 원래 유형의 파라미터를 가져올 수 있습니다.
                 */
                beforeInit : function(obj) {
                },
                /**
                 * N.comm이 초기화된 후에 실행됩니다.(N.cont의 "init"이 아닙니다.)
                 */
                afterInit : function(request) {
                },
                /**
                 * 서버에 요청을 보내기 전에 실행됩니다.
                 */
                beforeSend : function(request, xhr, settings) {
                },
                /**
                 * 서버에서 성공 응답이 전달됐을 때 실행됩니다.
                 */
                success : function(request, data, textStatus, xhr) {
                    // data를 수정해서 반환하면 모든 Communicator의 submit 콜백 함수의 data 인수 값으로 반환됩니다.
                },
                /**
                 * 서버에서 에러 응답이 전달됐을 때 실행됩니다.
                 */
                error : function(request, xhr, textStatus, errorThrown) {
                },
                /**
                 * 서버의 응답이 완료되면 실행됩니다.
                 */
                complete : function(request, xhr, textStatus) {
                }
            },
            "exFilter2" : {
                order : 2,
                beforeInit : function(obj) {
                },
                afterInit : function(request) {
                },
                beforeSend : function(request, xhr, settings) {
                },
                success : function(request, data, textStatus, xhr) {
                },
                error : function(request, xhr, textStatus, errorThrown) {
                },
                complete : function(request, xhr, textStatus) {
                }
            }
        }
    }
});
```

## 2. 인증 필터 예제

다음 예제는 모든 발신 요청에 인증 토큰을 추가하고 인증 실패를 처리하는 인증 필터를 구현하는 방법을 보여줍니다:

```javascript
N.context.attr("architecture", {
    "comm" : {
        "filters" : {
            "authFilter" : {
                order : 1,
                beforeSend : function(request, xhr, settings) {
                    // 모든 요청에 인증 토큰 추가
                    if (!settings.headers) {
                        settings.headers = {};
                    }
                    
                    // localStorage 또는 세션에서 토큰 가져오기
                    var authToken = localStorage.getItem("authToken");
                    if (authToken) {
                        settings.headers["Authorization"] = "Bearer " + authToken;
                    } else {
                        // 토큰이 없는 경우 로그인으로 리디렉션
                        window.location.href = "/login.html";
                        return new Error("인증 필요");
                    }
                },
                error : function(request, xhr, textStatus, errorThrown) {
                    // 인증 실패 처리
                    if (xhr.status === 401 || xhr.status === 403) {
                        // 토큰 삭제 및 로그인으로 리디렉션
                        localStorage.removeItem("authToken");
                        window.location.href = "/login.html?reason=auth_failed";
                        return new Error("인증 실패");
                    }
                }
            }
        }
    }
});
```

## 3. 로딩 인디케이터 필터 예제

이 예제는 모든 Ajax 요청에 대한 로딩 인디케이터를 표시하고 숨기는 필터를 구현하는 방법을 보여줍니다:

```javascript
N.context.attr("architecture", {
    "comm" : {
        "filters" : {
            "loadingIndicator" : {
                beforeSend : function(request, xhr, settings) {
                    // 필요한 경우 백그라운드 요청은 건너뛰기
                    if (settings.background === true) {
                        return;
                    }
                    
                    // 로딩 인디케이터 표시
                    var $indicator = $("#loading-indicator");
                    if ($indicator.length === 0) {
                        $indicator = $("<div id='loading-indicator'>로딩 중...</div>");
                        $("body").append($indicator);
                    }
                    
                    $indicator.show();
                },
                complete : function(request, xhr, textStatus) {
                    // 로딩 인디케이터 숨기기
                    $("#loading-indicator").hide();
                }
            }
        }
    }
});
```

## 4. 데이터 변환 필터 예제

이 예제는 서버로 보내기 전과 서버에서 받은 후 데이터를 변환하는 필터를 보여줍니다:

```javascript
N.context.attr("architecture", {
    "comm" : {
        "filters" : {
            "dataTransform" : {
                beforeSend : function(request, xhr, settings) {
                    // 발신 데이터에서 날짜 객체를 ISO 문자열로 변환
                    if (settings.data && typeof settings.data === "string") {
                        try {
                            var data = JSON.parse(settings.data);
                            
                            var convertDates = function(obj) {
                                for (var key in obj) {
                                    if (obj[key] instanceof Date) {
                                        obj[key] = obj[key].toISOString();
                                    } else if (typeof obj[key] === "object" && obj[key] !== null) {
                                        convertDates(obj[key]);
                                    }
                                }
                            };
                            
                            convertDates(data);
                            settings.data = JSON.stringify(data);
                        } catch (e) {
                            // JSON 데이터가 아님, 변환 건너뛰기
                        }
                    }
                },
                success : function(request, data, textStatus, xhr) {
                    // 필요한 경우 서버 응답 데이터 변환
                    if (data && typeof data === "object") {
                        // 예를 들어, 문자열 날짜를 Date 객체로 변환
                        var convertStringsToDates = function(obj) {
                            for (var key in obj) {
                                if (typeof obj[key] === "string" && 
                                    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(obj[key])) {
                                    obj[key] = new Date(obj[key]);
                                } else if (typeof obj[key] === "object" && obj[key] !== null) {
                                    convertStringsToDates(obj[key]);
                                }
                            }
                        };
                        
                        convertStringsToDates(data);
                        return data; // 수정된 데이터 반환
                    }
                }
            }
        }
    }
});
```
