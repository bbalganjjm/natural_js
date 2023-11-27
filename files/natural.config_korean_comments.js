/**
 * Natural-JS에서 제공하는 라이브러리 및 컴포넌트의 전역 옵션 값 설정
 * 여기에 기본으로 정의된 값들은 제거하면 안 됨. 추가만 가능
 *
 * 컴포넌트들의 옵션 적용 순서
 * 1. 컴포넌트 초기화시 지정한 옵션 값
 *
 * 2. 여기(N.Config)에서 지정한 옵션 값
 *    2.1. 각 영역별로 지정하세요. 컴포넌트 초기화 시 각 영역별 값들을 자동으로 기본 옵션으로 지정해 줍니다.
 *         ex) 2.1.1 모든 N.grid의 높이를 300으로 지정하고 싶음.
 *                   - N.context.attr("ui")의 grid 키에 height 속성을 추가하고 값은 300을 지정
 *             2.1.2 모든 N.form에 html을 인식 시키고 싶음.
 *                   - N.context.attr("ui")의 form 키에 html 속성을 추가하고 값은 true로 지정
 *
 * 3. 컴포넌트 클래스의 기본 옵션 값
 */
(function(N) {
    /**
     * Natural-CORE Config
     */
    N.context.attr("core", {
        /**
         * 기본 로케일(N.locale 함수로 정의)
         */
        "locale" : "ko_KR",
        /**
         * 전역 다국어 메시지
         */
        "message" : {
            "ko_KR" : {},
            "en_US" : {}
        },
        /**
         * 체크박스가 1개 일 경우 선택했을 때 기본 값
         */
        sgChkdVal : "Y", //Y, 1, on
        /**
         * 체크박스가 1개 일 경우 선택 안했을 때 기본 값
         */
        sgUnChkdVal : "N", //N, 0, off
        /**
         * 문자열 구분자
         */
        spltSepa : "$@^",
        /**
         * N.context.attr("architecture").page.context로 페이지가 전환될 때마다 실행될 가비지 컬렉터의 모드
         */
        gcMode : "full", //minimum, full
        /**
         * N.string.byteLength 함수 및 maxbyte / minbyte / rangebyte 룰에서 영문, 숫자, 기본 특수문자등을 제외한 한글, 한글 특수 문자 등의 기본 바이트 길이를 설정
         */
        charByteLength : 3
    });

    /**
     * Natural-ARCHITECTURE Config
     */
    N.context.attr("architecture", {
        /**
         * Natural-JS Page Context(지정 필수, 메인 컨텐츠가 들어갈 자리를 지정해 주세요.)
         * Documents 컴포넌트를 사용하면 따로 지정하지 않아도 됩니다.
         * SPA(Single Page Application)가 아니면 "body"로 설정해 주세요.
         */
        "page" : {
            "context" : ".docs__ > .docs_contents__.visible__"
        },
        /**
         * Controller object를 대상으로 Aspect Oriented Programing(AOP)를 적용할 수 있습니다.
         *  - 아래는 샘플코드 이므로 사용하지 않는다면 cont 하위의 모든 구문을 삭제하고 사용 바랍니다.
         */
        "cont" : {
            /**
             * advisor에서 참조할 pointcut을 정의합니다.
             * pointcut 은 반드시 fn 속성에 param, cont, fnChain 인자를 가진 함수로 정의해야 합니다.
             * 함수 수행 결과(boolean)는 advice의 적용 여부를 판단하는 데 사용됩니다.
             */
            "pointcuts" : {
                /** pointcut 객체는 유일한 속성명으로 정의합니다. */
                "regexp" : {
                    /**
                     * 정규표현식으로 평가하는 사용자 포인트 컷(기본으로 내장 포인트컷으로 삭제해도 됩니다)
                     * param : 정규표현식 문자열 혹은 RegExp 객체,
                     * cont : 컨트롤러 객체
                     * fnChain : 컨트롤러에 정의된 함수체인(뷰의selector:functionName.functionName...)(Built-in 함수를 제외한 사용자가 정의한 함수만 대상으로 합니다)
                     */
                    "fn" : function(param, cont, fnChain){
                        var regexp = param instanceof RegExp ? param : new RegExp(param);
                        return regexp.test(fnChain);
                    }
                }
            },
            /** 컨트롤러(N.cont)의 함수에 적용하고자 하는 기능을 정의합니다. */
            "advisors" : [{
                /**
                 * advisor가 적용될 pointcut을 정의합니다.
                 * "pointcut" : {
                 *     "type" : "regexp"
                 *     "param" : "something"
                 * }
                 * 위와 같은 경우 pointcuts에서 regexp pointcut에 param 속성에 정의된 객체를 파라미터로 전달합니다.
                 * "pointcut" : "someregexp"
                 * 위와 같이 pointcut의 값이 객체가 아닌 경우 "regexp" pointcut을 기본값으로 사용합니다.
                 */
                "pointcut" : "^before.*",
                /**
                 * adviecType 은 아래와 같습니다.
                 * before : 원본 함수를 실행하기 전에 실행됩니다.
                 * after : 원본 함수가 실행된 후 실행됩니다. 원본 함수의 반환 값이 함께 전달됩니다.
                 * error : 원본 함수에서 예외 발생 시 실행됩니다.
                 * around : 원본 함수를 실행할 수 있는 joinPoint가 파라미터로 전달됩니다.
                 * 각 adviecType의 사용방법은 아래의 예제들을 참고 바랍니다.
                 */
                "adviceType" : "before",
                "fn" : function(cont, fnChain, args){ /* cont 컨트롤러, fnChain 함수체인, args 인자 */
                    console.log("call me before %s", fnChain);
                }
            }, {
                "pointcut" : "^after.*",
                "adviceType" : "after",
                "fn" : function(cont, fnChain, args, result){ /* cont 컨트롤러, fnChain 함수체인, args 인자, result 반환값 */
                    console.log("call me after %s", fnChain);
                    console.log("reuslt", result);
                }
            }, {
                "pointcut" : "^around.*",
                "adviceType" : "around",
                "fn" : function(cont, fnChain, args, joinPoint){ /* cont 컨트롤러, fnChain 함수체인, args 인자, joinPoint 원본 함수 실행 객체 */
                    console.log("call me around %s", fnChain);
                    var result = joinPoint.proceed();
                    console.log("result ", result);
                    return result;
                }
            }]
        },
        "comm" : {
            /**
             * Communication Filter
             *  - N.comm으로 호출되는 모든요청이 아래에서 정의한 필터를 통과하게 되므로 서버 요청 시 공통적으로 적용해야 할 부분을 정의하면 됨.
             *  - 필터 인자 중 request 인자에 요청에 대한 유용한 정보가 담겨 있음.
             *  - request 객체에서 제공해 주는 정보는 http://bbalganjjm.github.io/natural_js/에서 Communicator.request 메뉴를 참고 바람.
             *  - 필터를 여러 개 걸수 있으며 단위 필터명은 아무거나 지정하면 됨.
             *  - 수행 순서는 order 속성(숫자가 적을 수록 먼저 실행 됨)이 정의된 필터가 실행된 다음 order 속성이 정의되지 않은 필터들이 실행 됨.
             *  - 아래 예제에서 지정한 basicFilter는 상수값이 아니므로 자유롭게 지정하면 됨.
             */
            "filters" : {
                "basicFilter" : {
                    /**
                     * 필터 실행 순서
                     */
                    order : 1,
                    /**
                     * N.comm이 초기화되기 전 실행됨(N.cont의 init 아님). string으로 변환되지 않은 원형의 파라미터를 꺼내올 수 있음.
                     */
                    beforeInit : function(obj) {
                    },
                    /**
                     * N.comm이 초기화된 후 실행됨(N.cont의 init 아님)
                     */
                    afterInit : function(request) {
                    },
                    /**
                     * 서버에 요청을 보내기 전 실행됨.
                     */
                    beforeSend : function(request, xhr, settings) {
                    },
                    /**
                     * 서버에 요청이 성공했을 경우 실행됨.
                     */
                    success : function(request, data, textStatus, xhr) {
                        // return data를하면 N.comm.submit의 콜백의 인자로 넘어오는 data가 리턴한 데이터로 치환 됨.
                    },
                    /**
                     * 서버에 요청 후 서버에러가 발생했을 경우 실행됨.
                     */
                    error : function(request, xhr, textStatus, errorThrown) {
                    },
                    /**
                     * 모든 요청완료 후 실행 됨.
                     */
                    complete : function(request, xhr, textStatus) {
                    }
                }
            },
            "request" : {
                "options" : {
                    /**
                     * 기본 Request Method
                     * GET 으로되어 있으면 JSON 형태의 파라미터가 q라는 파라미터명으로 q={a:1}와 같이 전달됩니다.
                     * JSON Object String을 Request Body에 담아 전송하려면 반드시 POST로 설정 바랍니다.
                     */
                    "type" : "POST",
                    /**
                     * 기본 contentType
                     */
                    "contentType" : "application/json; charset=utf-8",
                    /**
                     * Ajax 통신 시 브라우저 캐시 적용 여부, 운영 시에는 true로 변경 바람
                     */
                    "cache" : true,
                    /**
                     * Single Page Application(SPA) 개발 시 N.comm(async)으로 데이터를 요청하고 요청이 오기전에 다른 페이지로 전환 했을때
                     * 요청할 때 location.href와 응답 올때 location.href을 비교하여 틀리면 요청을 중지 할지 여부
                     */
                    "urlSync" : true,
                    /**
                     * 특정 영역에 html 페이지를 불러올때 browser history(뒤로가기버튼)를 적용할 지 여부
                     */
                    "browserHistory" : false,
                    /**
                     * 특정 영역에 html 페이지를 불러올때 덮어 쓸지 더할지 여부
                     */
                    "append" : false
                }
            }
        }
    });

    /**
     * Natural-DATA Config
     */
    N.context.attr("data", {
        "formatter" : {
            /**
             * 사용자 정의 포맷 룰
             */
            "userRules" : {
                /*
                 * 함수 명이 룰 명이 됨.
                 *
                 * str : 포맷 대상 문자열
                 * args : 포맷 옵션
                 *
                 * return : 포맷된 문자열을 반환
                "userRule" : function(str, args) {
                    return str
                }
                */
            },
            /**
             * 사이트 전역으로 사용할 날짜포맷 지정
             * Y : 년, m : 월, d : 일, H : 시, i : 분, s : 초
             */
            "date" : {
                /**
                 * 연월일 구분 문자
                 */
                dateSepa : "-",
                /**
                 * 시간 구분 문자
                 */
                timeSepa : ":",
                /**
                 * 년월 날짜포맷
                 */
                Ym : function() {
                    return "Y" + this.dateSepa + "m";
                },
                /**
                 * 연월일 날짜포맷
                 */
                Ymd : function() {
                    return "Y" + this.dateSepa + "m" + this.dateSepa + "d";
                },
                /**
                 * 연월일 시 날짜포맷
                 */
                YmdH : function() {
                    return this.Ymd() + " H";
                },
                /**
                 * 연월일 시분 날짜포맷
                 */
                YmdHi : function() {
                    return this.Ymd() + " H" + this.timeSepa + "i";
                },
                /**
                 * 연월일 시분초 날짜포맷
                 */
                YmdHis : function() {
                    return this.Ymd() + " H" + this.timeSepa + "i" + this.timeSepa + "s";
                }
            }
        },
        "validator" : {
            /**
             * 사용자 정의 검증 룰
             */
            "userRules" : {
                /*
                 * 함수 명이 룰 명이 됨.
                 * 검증 실패 메시지는 아래 N.context.attr("data").validator.message 객체에 언어별로 함수명과 같은 프로퍼티명으로 정의.
                 *
                 * str : 검증 대상 문자열
                 * args : 검증 옵션
                 *
                 * return : 검증에 성공하면 true를 실패하면 false를 반환
                "userRule" : function(str, args) {
                    return true;
                }
                */
            },
            /**
             * 데이터 검증 오류 다국어 메시지
             * 다른언어 추가 시 해당언어의 로케일 값을 오브젝트명으로하고 동일한 속성명에 해당 언어로된 메시지를 추가하면 됨.
             */
            "message" : {
                "ko_KR" : {
                    global : "필드 검증에 통과하지 못했습니다.",
                    required : "필수 입력 필드입니다.",
                    alphabet : "영문자만 입력할 수 있습니다.",
                    integer : "숫자(정수)만 입력할 수 있습니다.",
                    korean : "한글만 입력할 수 있습니다.",
                    alphabet_integer : "영문자와 숫자(정수)만 입력할 수 있습니다.",
                    integer_korean : "숫자(정수)와 한글만 입력할 수 있습니다.",
                    alphabet_korean : "영문자와 한글만 입력할 수 있습니다.",
                    alphabet_integer_korean : "영문자, 숫자(정수), 한글만 입력할 수 있습니다.",
                    dash_integer : "숫자(정수), 대시(-)만 입력할 수 있습니다.",
                    commas_integer : "숫자(정수), 콤마(,)만 입력할 수 있습니다.",
                    number : "숫자(+-,. 포함)만 입력할 수 있습니다.",
                    email : "e-mail 형식에 맞지 않습니다.",
                    url : "URL 형식에 맞지 않습니다.",
                    zipcode : "우편번호 형식에 맞지 않습니다.",
                    decimal : "(유한)소수만 입력할 수 있습니다.",
                    decimal_ : "(유한)소수 {0}번째 자리까지 입력할 수 있습니다.", // TODO
                    phone : "전화번호 형식이 아닙니다.",
                    rrn : "주민등록번호 형식에 맞지 않습니다.",
                    ssn : "미국 사회보장번호 형식에 맞지 않습니다.",
                    frn : "외국인등록번호 형식에 맞지 않습니다.",
                    frn_ssn : "주민번호나 외국인등록번호 형식에 맞지 않습니다.",
                    kbrn : "사업자등록번호 형식에 맞지 않습니다.",
                    kcn : "법인번호 형식에 맞지 않습니다.",
                    date : "날짜 형식에 맞지 않습니다.",
                    time : "시간 형식에 맞지 않습니다.",
                    accept : "\"{0}\" 값만 입력할 수 있습니다.",
                    match : "\"{0}\" 이(가) 포함된 값만 입력할 수 있습니다.",
                    acceptFileExt : "\"{0}\" 이(가) 포함된 확장자만 입력할 수 있습니다.",
                    notAccept : "\"{0}\" 값은 입력할 수 없습니다.",
                    notMatch : "\"{0}\" 이(가) 포함된 값은 입력할 수 없습니다.",
                    notAcceptFileExt : "\"{0}\" 이(가) 포함된 확장자는 입력할 수 없습니다.",
                    equalTo : "\"{1}\" 의 값과 같아야 합니다.",
                    maxlength : "{0} 글자 이하만 입력 가능합니다.",
                    minlength : "{0} 글자 이상만 입력 가능합니다.",
                    rangelength : "{0} 글자에서 {1} 글자 까지만 입력 가능합니다.",
                    maxbyte : "{0} 바이트 이하만 입력 가능합니다.<br> - 영문, 숫자 : 1 바이트<br> - 한글, 특수문자 : {1} 바이트",
                    minbyte : "{0} 바이트 이상만 입력 가능합니다.<br> - 영문, 숫자 : 1 바이트<br> - 한글, 특수문자 : {1} 바이트",
                    rangebyte : "{0} 바이트에서 {1} 바이트 까지만 입력 가능합니다.<br> - 영문, 숫자 한글자 : 1 바이트<br> - 한글, 특수문자 : {2} 바이트",
                    maxvalue : "{0} 이하의 값만 입력 가능합니다.",
                    minvalue : "{0} 이상의 값만 입력 가능합니다.",
                    rangevalue : "{0}에서 {1} 사이의 값만 입력 가능합니다.",
                    regexp : "{2}"
                },
                "en_US" : {
                    global : "It Can't pass the field verification.",
                    required : "It is a field to input obligatorily.",
                    alphabet : "Can enter only alphabetical characters.",
                    integer : "Can enter only number(integer).",
                    korean : "Can enter only Korean alphabet.",
                    alphabet_integer : "Can enter only alphabetical characters and number(integer).",
                    integer_korean : "Can enter only number(integer) and Korean alphabet.",
                    alphabet_korean : "Can enter only alphabetical characters and Korean alphabet.",
                    alphabet_integer_korean : "Can enter only alphabetical characters and number(integer) and Korean alphabet.",
                    dash_integer : "Can enter only number(integer) and dash(-).",
                    commas_integer : "Can enter only number(integer) and commas(,).",
                    number : "Can enter only number and (+-,.)",
                    email : "Don't conform to the format of E-mail.",
                    url : "Don't conform to the format of URL.",
                    zipcode : "Don't conform to the format of zip code.",
                    decimal : "Can enter only (finite)decimal",
                    decimal_ : "Can enter up to {0} places of (finite)decimal.", // TODO
                    phone : "There is no format of phone number.",
                    rrn : "Don't fit the format of the resident registration number.",
                    ssn : "Don't fit the format of the Social Security number.",
                    frn : "Don't fit the format of foreign registration number.",
                    frn_rrn : "Don't fit the format of the resident registration number or foreign registration number.",
                    kbrn : "Don't fit the format of registration of enterpreneur.",
                    kcn : "Don't fit the format of corporation number.",
                    date : "Don't fit the format of date.",
                    time : "Don't fit the format of time.",
                    accept : "Can enter only \"{0}\" value.",
                    match : "Can enter only value that contains \"{0}\".",
                    acceptFileExt : "Can enter only extension that includes \"{0}\".",
                    notAccept : "Can't enter \"{0}\" value.",
                    notMatch : "Can't enter only value that contains \"{0}\".",
                    notAcceptFileExt : "Can't enter only extension that includes \"{0}\".",
                    equalTo : "Must be the same as \"{1}\" value.",
                    maxlength : "Can enter only below {0} letters.",
                    minlength : "Can enter only more than {0} letters.",
                    rangelength : "It can be entered from {0} to {1} letters.",
                    maxbyte : "Can enter only below {0} bytes.",
                    minbyte : "Can enter only more than {0} bytes.",
                    rangebyte : "It can be entered from {0} to {1} bytes.",
                    maxvalue : "Can enter only below {0} value.",
                    minvalue : "Can enter only more than {0} value.",
                    rangevalue : "Can be entered value from {0} to {1}.",
                    regexp : "{2}"
                }
            }
        }
    });

    // 아래 extend 구문은 사용자 정의 룰 정의 시 적용되게 하는 코드이므로 사용자 정의 룰을 정의 했다면 절대 지우지 마십시오.
    $.extend(N.formatter, N.context.attr("data").formatter.userRules);
    $.extend(N.validator, N.context.attr("data").validator.userRules);

    /**
     * Natural-UI Config
     */
    N.context.attr("ui", {
        "alert" : {
            /**
             * N.alert, N.popup 컴포넌트의 요소들이 저장되는 영역(지정 필수)
             * N.context.attr("architecture").page.context와 같게 설정해도 됩니다.
             * Documents 컴포넌트를 사용하면 따로 지정하지 않아도 됩니다.
             * SPA(Single Page Application)가 아니면 "body"로 설정해 주세요.
             */
            "container" : ".docs__ > .docs_contents__.visible__",
            /**
             * 버튼 스타일(Required)
             */
            "global" : {
                "okBtnStyle" : {
                    color : "yellowgreen",
                    size : "medium"
                },
                "cancelBtnStyle" : {
                    size : "medium"
                }
            },
            /**
             * 드래그하면서 다이얼로그가 window영역을 벗어날때 다시 돌아올 위치를 추가로 지정(기본값은 0, 드래그 시 횡 스크롤이 생겨 화면이 지저분 해질때 조절바람)
             * N.popup 도 적용가능
             */
            "draggableOverflowCorrectionAddValues" : {
                top : 0,
                bottom : 0,
                left : +2,
                right : -2
            },
            /**
             * 인풋 메시지 설정
             */
            "input" : {
                /**
                 * 메시지 표시시간(ms)
                 */
                displayTimeout : 7000,
                /**
                 * 닫기 버튼 디자인(html 태그 입력 가능)
                 */
                closeBtn : "&times;"
            },
            /**
             * 다국어 메시지
             */
            "message" : {
                "ko_KR" : {
                    "confirm" : "확인",
                    "cancel" : "취소"
                },
                "en_US" : {
                    "confirm" : "OK",
                    "cancel" : "Cancel"
                }
            }
        },
        "popup" : {

        },
        "tab" : {

        },
        "datepicker" : {
            /**
             * 다국어 메시지
             */
            "message" : {
                "ko_KR" : {
                    "year" : "년",
                    "month" : "월",
                    "days" : "일,월,화,수,목,금,토",
                    "yearNaN" : "연도는 서기 100년 이하는 입력할 수 없습니다.",
                    "monthNaN" : "월은 1월부터 12월까지 입력할 수 있습니다.",
                    "dayNaN" : "일은 1일부터 {0}일까지 입력할 수 있습니다.",
                    "prev" : "이전",
                    "next" : "다음"
                },
                "en_US" : {
                    "year" : "Year",
                    "month" : "Month",
                    "days" : "Sun,Mon,Tue,Wed,Thu,Fri,Sat",
                    "yearNaN" : "You can not enter less AD 100 years",
                    "monthNaN" : "You can enter 1 to 12 months value",
                    "dayNaN" : "You can enter 1 to {0} days value",
                    "prev" : "Previous",
                    "next" : "Next"
                }
            }
        },
        "select" : {
            /**
             * 기본 key 값
             */
            "key" : "key",
            /**
             * 기본 value 값
             */
            "val" : "val"
        },
        "form" : {

        },
        "grid" : {
            /**
             * 소트기능 활성화 시 표시 구분자(html 태그 입력 가능)
             */
            "sortableItem" : {
                "asc" : "▼",
                "desc" : "▲"
            },
            /**
             * 다국어 메시지
             */
            "message" : {
                "ko_KR" : {
                    "empty" : "조회를 하지 않았거나 조회된 데이터가 없습니다.",
                    "search" : "검색",
                    "selectAll" : "전체선택",
                    "dFilter" : "데이터 필터",
                    "more" : "더보기",
                    "column" : "열",
                    "showHide" : "열 감추기 / 보이기",
                    "prev" : "이전",
                    "next" : "다음"
                },
                "en_US" : {
                    "empty" : "No inquired data or no data available.",
                    "search" : "Search",
                    "selectAll" : "Select all",
                    "dFilter" : "Data filter",
                    "more" : "MORE",
                    "column" : "Column",
                    "showHide" : "Hide and show columns",
                    "prev" : "Previous",
                    "next" : "Next"
                }
            },
            /**
             * 기타 설정
             */
            "misc" : {
                /**
                 * 컬럼 리사이즈 시 다른컬럼이 밀릴때 아래 수치 조절(기본값 : 0)
                 */
                "resizableCorrectionWidth" : N.browser.is("safari") ? 1 : 0,
                /**
                 * 헤더고정형 중 마지막 컬럼 리사이즈 시 다른컬럼이 밀릴때 아래 수치 조절(기본값 : 0)
                 */
                "resizableLastCellCorrectionWidth" : N.browser.is("ie") || N.browser.is("firefox") ? 10.8 : 12,
                /**
                 * 리사이즈바의 left 포지션이 컬럼 보더를 기준으로 가운데에 위치하지 않을 때 아래 수치 조절(기본값 : 0)
                 */
                "resizeBarCorrectionLeft" : N.browser.is("firefox") ? -1 : N.browser.is("safari") ? 1 : 0,
                /**
                 * 리사이즈바의 높이가 밑에까지 꽉 차지 않을 때 아래 수치 조절(기본값 : 0)
                 */
                "resizeBarCorrectionHeight" : 0,
                /**
                 * 컬럼 고정 시 고정된 헤더 셀(TH)의 상단 위치가 맞지 않을 때 아래 수치 조절(기본값 : 0)
                 */
                "fixedcolHeadMarginTop" : N.browser.is("ie") || N.browser.is("firefox") ? -1 : 0,
                /**
                 * 컬럼 고정 시 고정된 헤더 셀(TH)의 좌측 위치가 맞지 않을 때 아래 수치 조절(기본값 : 0)
                 */
                "fixedcolHeadMarginLeft" : N.browser.is("ie") || N.browser.is("firefox") ? -1 : 0,
                /**
                 * 컬럼 고정 시 고정된 헤더 셀(TH)의 높이가 맞지 않을 때 아래 수치 조절(기본값 : 0)
                 */
                "fixedcolHeadHeight" : 0,
                /**
                 * 컬럼 고정 시 고정된 바디 셀(TD)의 상단 위치가 맞지 않을 때 아래 수치 조절(기본값 : 0)
                 */
                "fixedcolBodyMarginTop" : N.browser.is("ie") || N.browser.is("firefox") ? -1 : 0,
                /**
                 * 컬럼 고정 시 고정된 바디 셀(TD)의 좌측 위치가 맞지 않을 때 아래 수치 조절(기본값 : 0)
                 */
                "fixedcolBodyMarginLeft" : N.browser.is("ie") || N.browser.is("firefox") ? -1 : 0,
                /**
                 * 컬럼 고정 시 데이터를 바인딩할 때 고정된 바디 셀(TD)의 높이가 맞지 않을 때 아래 수치 조절(기본값 : 0)
                 */
                "fixedcolBodyBindHeight" : N.browser.is("ie") || N.browser.is("firefox") ? 1 : 1,
                /**
                 * 컬럼 고정 시 데이터를 Add할 때 고정된 바디 셀(TD)의 높이가 맞지 않을 때 아래 수치 조절(기본값 : 1)
                 */
                "fixedcolBodyAddHeight" : 1,
                /**
                 * 컬럼 고정 시 그리드 위에 있는 요소가 동적으로 높이가 조절 될때 그리드 모양이 깨지면 동적으로 높이가 조절되는 요소와 그리드 요소를 모두 포함하고 있는 요소를 jQuery selector 문자열로 지정.
                 */
                "fixedcolRootContainer" : ".view_context__"
            }
        }
    });

    /**
     * Natural-UI.Shell Config
     */
    N.context.attr("ui.shell", {
        "notify" : {
            /**
             * 다국어 메시지
             */
            "message" : {
                "ko_KR" : {
                    "close" : "닫기"
                },
                "en_US" : {
                    "close" : "Close"
                }
            }
        },
        "docs" : {
            "message" : {
                "ko_KR" : {
                    "closeAllTitle" : "메뉴 전체 닫기",
                    "closeAll" : "전체 닫기",
                    "closeAllQ" : "선택한 메뉴를 제외하고 열린 메뉴 전체를 닫겠습니까?",
                    "closeAllDQ" : "열려있는 메뉴 전체를 닫고 메인(홈) 화면으로 이동하겠습니까?",
                    "docListTitle" : "열린 메뉴 목록",
                    "docList" : "메뉴 목록",
                    "selDocument" : "{0} 메뉴 선택",
                    "close" : "메뉴 닫기",
                    "closeConf" : "\"{0}\" 메뉴에 편집 중인 항목이 있습니다. 무시하고 메뉴를 닫겠습니까?",
                    "maxTabs" : "최대 {0} 개의 메뉴 만 열 수 있습니다. <br>다른 메뉴 탭을 닫고 다시 시도하세요.",
                    "maxStateful" : "선택한 메뉴가 활성화되면 설정된 최대 상태 유지 메뉴 개수(최대 {1} 개)가 초과되어 마지막으로 선택된 \"{0}\" 메뉴 페이지가 다시 로딩됩니다.<br>메뉴를 선택하겠습니까?"
                },
                "en_US" : {
                    "closeAllTitle" : "Close all menus",
                    "closeAll" : "Close all",
                    "closeAllQ" : "Are you sure you want to close the all open menus except for the selected menu?",
                    "closeAllDQ" : "Are you sure you want to close the all open menus and go to home page?",
                    "docListTitle" : "Opened menu list",
                    "docList" : "Menu list",
                    "selDocument" : "Select the {0} menu",
                    "close" : "Close the menu",
                    "closeConf" : "There is an item being edited in the \"{0}\" memu. Are you sure you want to close the menu?",
                    "maxTabs" : "You can only open up to {0} menus. <br>Close other menu tabs and try again.",
                    "maxStateful" : "When the selected menu is activated, the maximum number of menu items (maximum of {1}) is exceeded and the last selected menu page \"{0}\" will be  reloaded.<br>Do you want to select the menu?"
                }
            }
        }
    });

    /**
     * Natural-TEMPLATE Config
     */
    N.context.attr("template", {
        aop : {
            /**
             * 공통코드 요청 정보
             *
             * @codeUrl 공통코드 요청 URL
             * @codeKey : 그룹코드 프로퍼티 명
             */
            codes : {
                codeUrl : null,
                codeKey : null
            }
        },
        /**
         * 다국어 메시지
         */
        "message" : {
            "ko_KR" : {
                "MSG-0001" : "data 옵션을 정의해 주세요.",
                "MSG-0002" : "서버 오류가 발생하여 공통 코드 목록을 조회하지 못했습니다.",
                "MSG-0003" : "데이터 코드 목록을 조회하는 N.comm({0}) 이 없습니다.",
                "MSG-0004" : "서버 오류가 발생하여 데이터 코드 목록을 조회하지 못했습니다.",
                "MSG-0005" : "컴포넌트({0})가 잘못 지정되었습니다.",
                "MSG-0006" : "이벤트({0})가 잘못 지정되었습니다."
            },
            "en_US" : {
                "MSG-0001" : "Define the data option.",
                "MSG-0002" : "The common code list could not be queried because a server error occurred.",
                "MSG-0003" : "There is no N.comm({0}) to query the data code list.",
                "MSG-0004" : "The data code list could not be queried because a server error occurred.",
                "MSG-0005" : "Component({0}) was incorrectly specified.",
                "MSG-0006" : "Event({0}) was incorrectly specified."
            }
        }
    });

    /**
     * Natural-CODE Config
     */
    N.context.attr("code", {
        inspection : {
            /**
             * ERROR 유형의 코드가 검출되었을 때 ERROR를 발생하여 로직을 중단 할지 여부를 지정합니다.
             */
            abortOnError : false,
            /**
             * 검사 대상에서 제외할 구문들을 문자열로 정의합니다.
             *
             * 검출된 코드 내용 중 다음 문자열이 포함되어 있으면 제외 처리됩니다.
             *  ex) excludes : [ ".index-header", ".page-header", ".index-lefter", ".index-contents", ".index-footer" ]
             */
            excludes : [],
            /**
             * 다국어 메시지
             */
            "message" : {
                "ko_KR" : {
                    "NoContextSpecifiedInSelector" : 'Controller object의 함수 안에서 요소를 선택할 때는 반드시 $() 나 N() 함수의 두 번째 인자(context)에 view 요소를 입력하거나 view 요소에서 find해야 합니다. '
                        + 'view(context) 요소를 입력하지 않으면 다른 View의 요소까지 선택되어 의도하지 않은 오류가 발생할 수 있습니다. '
                        + '\nex) N("selector", cont.view).hide();'
                        + '\n    cont.view.find("selector").hide();',
                    "UseTheComponentsValMethod" : 'jQuery의 val 메서드로 입력 요소의 value 속성 값을 변경하면 컴포넌트에 바인딩되어 있는 데이터는 업데이트되지 않습니다. '
                        + '컴포넌트의 내부 데이터와 연동된 입력 요소들은 적용된 데이터 관련 컴포넌트(N.form, N.grid 등)에서 제공하는 val 메서드를 사용해야 합니다.'
                        + '\nex) cont["p.form.id"].val("columnName", "value")'
                        + '\n    cont["p.grid.id"].val(index, "columnName", "value")'
                        + '\n    cont["p.list.id"].val(index, "columnName", "value")'
                },
                "en_US" : {
                    "NoContextSpecifiedInSelector" : 'When selecting an element within a function of a Controller object, you must input the view element in the second argument of the $ () or N () function or find it in the view element. '
                        + "If you don't type view(context) element, you can get unintended errors as the elements of other views are also selected. "
                        + '\nex) N("selector", cont.view).hide();'
                        + '\n    cont.view.find("selector").hide();',
                    "UseTheComponentsValMethod" : "If you change the value of an input element's value attribute using jQuery's val method, the data bound to the component will not be updated. "
                        + 'Input elements linked with the internal data of the component should use the val method provided by the applied data-related components(N.form, N.grid, etc.).'
                        + '\nex) cont["p.form.id"].val("columnName", "value")'
                        + '\n    cont["p.grid.id"].val(index, "columnName", "value")'
                        + '\n    cont["p.list.id"].val(index, "columnName", "value")'
                }
            }
        }
    });

})(N);