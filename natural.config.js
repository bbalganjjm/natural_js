/**
 * Natural-JS에서 제공하는 라이브러리 및 컴포넌트의 전역 옵션 값 설정
 *
 * 컴포넌트들의 옵션 적용 순서
 * 1. 컴포넌트 초기화시 지정한 옵션 값
 * 2. 여기(N.Config)에서 지정한 옵션 값
 * 3. 컴포넌트 클래스의 기본 옵션 값
 */
(function(N) {
	/**
	 * Natural-CORE Config
	 */
	N.context.attr("core", {
		"locale" : "ko_KR",
		"message" : {
			"ko_KR" : {},
			"en_US" : {}
		},
		/**
	     * 체크박스 선택시 기본 값
	     */
	    sgChkdVal : "Y", //Y, 1, on
	    /**
	     * 체크박스 선택 안됐을때 기본 값
	     */
	    sgUnChkdVal : "N", //N, 0, off
	    spltSepa : "$@^",
	    /**
	     * N.context.attr("architecture").page.context 로 페이지가 전환될때 마다 실행될 가비지 컬렉터의 모드
	     */
	    gcMode : "full" //minimum, full
	});

	/**
	 * Natural-ARCHITECTURE Config
	 */
	N.context.attr("architecture", {
		/**
		 * Natural-JS 의 구동영역(지정 필수)
		 */
		"page" : {
			"context" : "#naturalJsContents"
		},
		/**
		 * N.cont(Controller)에 정의한 오브젝트들을 대상으로 하는 관점 지향 프로그래밍(AOP) 설정
		 *   - 아래는 AOP 관련 된 예제코드 이므로 사용하지 않는다면 cont 하위의 모든 구문을 삭제하고 사용 바랍니다.
		 */
		"cont" : {
			/** advisor에서 참조할 pointcut을 정의한다.
			 * pointcut은 반드시 fn 속성에 function(param, cont, fnChain) 함수를 정의해야 한다.
			 * 함수 수행 결과는 advice의 적용 여부를 판단하는데 사용된다.
			 */
			"pointcuts" : {
				/** pointcut 객체는 유일한 속성명으로 정의한다. */
				"regexp" : {
					/**
					 * 정규표현식으로 평가하는 사용자 포인트 컷(예제이므로 삭제해도 됨)
					 * param : 정규표현식 문자열 혹은 RegExp 객체,
					 * cont : 컨트롤러 객체
					 * fnChain : 컨트롤러에 정의된 함수채인(뷰의selector.:functionName.functionName...)(Built-in 함수를 제외한 사용자가 정의한 함수만 대상으로 한다)
					 */
					"fn" : function(param, cont, fnChain){
						var regexp = param instanceof RegExp ? param : new RegExp(param);
						return regexp.test(fnChain);
					}
				}
			},
			/** 컨트롤러의 함수에 적용하고자 하는 기능을 정의한다 */
			"advisors" : [{
				/**
				 * advisor가 적용될 pointcut을 정의한다
				 * "pointcut" : {
				 *     "type" : "regexp"
				 *     "param" : "something"
				 * }
				 * 위의 경우 pointcuts에서 regexp pointcut을 찾아 pointcut에 정의된 객체를 파라미터로 전달한다.
				 * "pointcut" : "someregexp"
				 * 위와 같이 pointcut의 값이 객체가 아닌 경우 regexp pointcut을 기본값으로 사용한다.
				 */
				"pointcut" : ":init",
				/**
				 * adviecType은 아래와 같다.
				 * before : 원본 함수를 실행하기 전에 실행된다.
				 * after : 원본 함수를 실행 후 실행된다. 원본 함수의 반환값이 함께 전달된다.
				 * error : 원본 함수에서 예외 발생 시 실행된다.
				 * around : 원본 함수를 실행할 수 있는 joinPoint가 파라미터로 전달
				 * 각 사용방식은 아래의 각 예제를 참고
				 */
				"adviceType" : "before",
				"fn" : function(cont, fnChain, args){ /* cont 컨트롤러, fnChain 뷰의selector:functionName.functionName... , args 인자 */
					console.log("call me before %s", fnChain);
				}
			},
			{
				"pointcut" : "after.*",
				"adviceType" : "after",
				"fn" : function(cont, fnChain, args, result){ /* cont 컨트롤러, fnChain 함수명, args 인자, 반환값 */
					console.log("call me after %s", fnChain);
					console.log("\treuslt", result);
				}
			},
			{
				"pointcut" : "around.*",
				"adviceType" : "around",
				"fn" : function(cont, fnChain, args, joinPoint){ /* cont 컨트롤러, fnChain 함수명, args 인자, joinPoint 원본 함수 실행 객체 */
					console.log("call me around %s", fnChain);
					var result = joinPoint.proceed();
					console.log("result ", result);
					return result;
				}
			}]
		},
		"comm" : {
			/**
			* Global ajax request filter
			*
			* N.comm 으로 호출되는 모든요청이 아래에서 정의한 필터를 통과하게 되므로 서버 요청 시 공통적으로 적용해야 할 부분을 정의 하면 됨.
			* 필터 인자 중 request 인자에 요청에 대한 여러가지 정보가 있으니 잘 활용하면 엄청난 효과를 누릴 수 있음.
			* request 객체에서 제공 해 주는 정보는 http://bbalganjjm.github.io/natural_js/#refr/refr0103 에서 > Communicatior 탭 > Communicator.request 챕터 > 3) 기본옵션(Default options)을 참고
			* 필터를 여러개 걸수 있으며 단위 필터명은 아무거나 지정하면 됨.
			* 여기에서 지정한 pageFilter, dataFilter 는 상수값이 아니므로 자유롭게 지정하면 됨.
			*/
			"filters" : {
				"exFilter1" : {
					/**
					 * N.comm 이 초기화 된 후 실행됨(N.cont 의 init 아님)
					 */
					afterInit : function(request) {
					},
					/**
					 * 서버에 요청을 보내기 전 실행됨.
					 */
					beforeSend : function(request, xhr, settings) {
					},
					/**
					 * 서버에 요청이 성공 했을 경우 실행됨.
					 */
					success : function(request, data, textStatus, xhr) {
						// return data 를 하면 N.comm.submit 의 콜백의 인자로 넘어오는 data 가 리턴한 데이터로 치환 됨.
					},
					/**
					 * 서버에 요청 후 서버에러가 발생 했을 경우 실행됨.
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
					 * 기본 Method
					 */
					"type" : "GET",
					/**
					 * 기본 contentType
					 */
					"contentType" : "application/json; charset=utf-8",
					/**
					 * Ajax 통신 시 브라우저 캐시 적용 여부, 운영 시에는 true로 변경 바람
					 */
					"cache" : true,
					/**
					 * 페이지 전환 없는 방식의 사이트 구현 시 Ajax 통신 시(async)
					 * 요청할 때 location.href 와 응답 올때 location.href 을 비교하여 오류 방지 할건지 여부
					 */
					"urlSync" : true,
					/**
					 * 특정 영역에 html 페이지를 불러올때 browser history(뒤로가기버튼) 를 적용할 지 여부
					 */
					"browserHistory" : false,
					/**
					 * 특정 영역에 html 페이지를 불러올때 덮어 쓸건지 더할건지 여부
					 */
					"append" : false,
					/**
					 * 특정 영역에 html 페이지를 불러올때 전환 효과 지정, false 이면 효과 없음.
					 * ex) ["fadeIn", 300, null], 적용안할때는 false
					 */
					"effect" : false
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
			 * 사용자 정의 포멧 룰 - 기본제공되는 데이터 포멧 룰 외에 추가로 지정하고 싶을 때 작성
			 * userRules 오브젝트 안에 function 명이 룰 명이 되고 포멧된 값을 반환(return)하면 됨.
			 */
			"userRules" : {
				// 함수 첫번째 인자는 검증 데이터가 들어오고 두번째 인자는 옵션값이 들어옴. natural.data.js 소스의 Formatter 부분 참고
			},
			/**
			 * 사이트 전역으로 사용할 날짜포멧 지정
			 * Y : 년, m : 월, d : 일, H : 시, i : 분, s : 초
			 */
			"date" : {
				/**
				 * 년월일 구분 문자
				 */
				dateSepa : "-",
				/**
				 * 시간 구분 문자
				 */
				timeSepa : ":",
				/**
				 * 년월 날짜포멧
				 */
				Ym : function() {
					return "Y" + this.dateSepa + "m";
				},
				/**
				 * 년월일 날짜포멧
				 */
				Ymd : function() {
					return "Y" + this.dateSepa + "m" + this.dateSepa + "d";
				},
				/**
				 * 년월일 시 날짜포멧
				 */
				YmdH : function() {
					return this.Ymd() + " H";
				},
				/**
				 * 년월일 시분 날짜포멧
				 */
				YmdHi : function() {
					return this.Ymd() + " H" + this.timeSepa + "i";
				},
				/**
				 * 년월일 시분초 날짜포멧
				 */
				YmdHis : function() {
					return this.Ymd() + " H" + this.timeSepa + "i" + this.timeSepa + "s";
				}
			}
		},
		"validator" : {
			/**
			 * 사용자 정의 검증 룰 - 기본제공되는 데이터 검증 룰 외에 추가로 지정하고 싶을 때 작성
			 * userRules 오브젝트 안에 function 명이 룰 명이 되고 검증에 성공하면 true를 실패하면 false를 반환(return)하면 됨.
			 */
			"userRules" : {
				// 함수 첫번째 인자는 검증 데이터가 들어오고 두번째 인자는 옵션값이 들어옴. natural.data.js 소스의 Validator 부분 참고
			},
			/**
			 * 데이터 검증 오류 다국어 메시지
			 * 다른언어 추가 시 해당언어의 로케일 값을 오브젝트명으로 하고 동인한 속성명들에 해당언어로 된 메시지를 추가하면 됨.
			 */
			"message" : {
				"ko_KR" : {
					global : "필드검증에 통과하지 못했습니다.",
					required : "필수입력 필드 입니다.",
					alphabet : "영문자만 입력 할 수 있습니다.",
					integer : "숫자(정수)만 입력 할 수 있습니다.",
					korean : "한글만 입력 할 수 있습니다.",
					alphabet_integer : "영문자와 숫자(정수)만 입력 할 수 있습니다.",
					integer_korean : "숫자(정수)와 한글만 입력 할 수 있습니다.",
					alphabet_korean : "영문자와 한글만 입력 할 수 있습니다.",
					alphabet_integer_korean : "영문자, 숫자(정수), 한글만 입력 할 수 있습니다.",
					dash_integer : "숫자(정수), 대쉬(-) 만 입력 할 수 있습니다.",
					commas_integer : "숫자(정수), 콤마(,) 만 입력 할 수 있습니다.",
					number : "숫자(+-,. 포함)만 입력 할 수 있습니다.",
					decimal : "(유한)소수만 입력 할 수 있습니다.",
					decimal_ : "(유한)소수 {0}번째 자리까지 입력 할 수 있습니다.",
					email : "e-mail 형식에 맞지 않습니다.",
					url : "URL 형식에 맞지 않습니다.",
					zipcode : "우편번호 형식에 맞지 않습니다.",
					phone : "전화번호 형식이 아닙니다.",
					phone_ : "전화번호 형식이 아닙니다.",
					ssn : "주민등록번호 형식에 맞지 않습니다.",
					frn : "외국인등록번호 형식에 맞지 않습니다.",
					frn_ssn : "주민번호나 외국인등록번호 형식에 맞지 않습니다.",
					cno : "사업자등록번호 형식에 맞지 않습니다.",
					cpno : "법인번호 형식에 맞지 않습니다.",
					date : "날짜 형식에 맞지 않습니다.",
					time : "시간 형식에 맞지 않습니다.",
					accept_ : "\"{0}\" 값만 입력 할 수 있습니다.",
					match_ : "\"{0}\" 이(가) 포함된 값만 입력 할 수 있습니다.",
					acceptFileExt_ : "\"{0}\" 이(가) 포함된 확장자만 입력 할 수 있습니다.",
					notAccept_ : "\"{0}\" 값은 입력 할 수 없습니다.",
					notMatch_ : "\"{0}\" 이(가) 포함된 값은 입력 할 수 없습니다.",
					notAcceptFileExt_ : "\"{0}\" 이(가) 포함된 확장자는 입력 할 수없습니다.",
					equalTo_ : "\"{1}\" 의 값과 같아야 합니다.",
					maxlength_ : "{0} 글자 이하만 입력 가능합니다.",
					minlength_ : "{0} 글자 이상만 입력 가능합니다.",
					rangelength_ : "{0} 글자 에서 {1} 글자 까지만 입력 가능합니다.",
					maxbyte_ : "{0} 바이트 이하만 입력 가능합니다.<br> - 영문, 숫자 : 1 바이트<br> - 한글, 특수문자 : 3 바이트",
					minbyte_ : "{0} 바이트 이상만 입력 가능합니다.<br> - 영문, 숫자 : 1 바이트<br> - 한글, 특수문자 : 3 바이트",
					rangebyte_ : "{0} 바이트 에서 {1} 바이트 까지만 입력 가능합니다.<br> - 영문, 숫자 한글자 : 1 바이트<br> - 한글, 특수문자 : 3 바이트",
					maxvalue_ : "{0} 이하의 값만 입력 가능합니다.",
					minvalue_ : "{0} 이상의 값만 입력 가능합니다.",
					rangevalue_ : "{0} 에서 {1} 사이의 값만 입력 가능합니다.",
					regexp_ : "{1}"
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
					decimal : "Can enter only (finite)decimal",
					decimal_ : "Can enter up to {0} places of (finite)decimal.",
					email : "Don't conform to the format of E-mail.",
					url : "Don't conform to the format of URL.",
					zipcode : "Don't conform to the format of zip code.",
					phone : "There is no format of phone number.",
					phone_ : "There is no format of phone number.",
					ssn : "Don't fit the format of the resident registration number.",
					frn : "Don't fit the format of foreign registration number.",
					frn_ssn : "Don't fit the format of the resident registration number or foreign registration number.",
					cno : "Don't fit the format of registration of enterpreneur.",
					cpno : "Don't fit the format of corporation number.",
					date : "Don't fit the format of date.",
					time : "Don't fit the format of time.",
					accept_ : "Can enter only \"{0}\" value.",
					match_ : "Can enter only value ​​that contains \"{0}\".",
					acceptFileExt_ : "Can enter only extension that includes \"{0}\".",
					notAccept_ : "Can't enter \"{0}\" value.",
					notMatch_ : "Can't enter only value ​​that contains \"{0}\".",
					notAcceptFileExt_ : "Can't enter only extension that includes \"{0}\".",
					equalTo_ : "Must be the same as \"{1}\" value.",
					maxlength_ : "Can enter only below {0} letters.",
					minlength_ : "Can enter only more than {0} letters.",
					rangelength_ : "It can be entered from {0} to {1} letters.",
					maxbyte_ : "Can enter only below {0} bytes.",
					minbyte_ : "Can enter only more than {0} bytes.",
					rangebyte_ : "It can be entered from {0} to {1} bytes.",
					maxvalue_ : "Can enter only below {0} value.",
					minvalue_ : "Can enter only more than {0} value.",
					rangevalue_ : "Can be entered value from {0} to {1}.",
					regexp_ : "{1}"
				}
			}
		}
	});
	// 아래 extend 구문은 사용자 정의 룰 정의 시 적용되게 하는 코드이므로 사용자 정의 룰을 정의 했다면 절대 지우면 안됨.
	$.extend(N.formatter, N.context.attr("data").formatter.userRules);
	$.extend(N.validator, N.context.attr("data").validator.userRules);

	/**
	 * Natural-UI Config
	 */
	N.context.attr("ui", {
		"alert" : {
			/**
			 * Popup Element 가 담길 영역
			 */
			"container" : "#naturalJsContents",
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
			"draggable" : true,
			"alwaysOnTop" : true,
			/**
			 * 페이지의 요소들이 동적으로 사이즈가 조절될 때 N.alert 의 모달오버레이와 메시지 박스의 위치를 자동으로 맞춰줄지 여부
			 *  주) 성능적으로 최적화하기 위해서는 false로 지정하는게 좋고 false로 지정 시 탭(N.tab)이 전환되거나 페이지가 리다이렉트 되지않고 논리적으로 전환될때 N.alert 의 요소가 남아있음.
			 */
			"dynPos" : true,
			/**
			 * 필수 값
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
			 * 필수 값
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
			"draggable" : true,
			"alwaysOnTop" : true,
			/**
			 * 버튼 상태 변경에 따른 fade 효과 적용 유무
			 */
			"button" : {
				"effect" : true
			}
		},
		"tab" : {
			/**
			 * 탭 컨텐츠 표시할때 효과
			 */
			"effect" : ["fadeIn", 300, undefined]
		},
		"datepicker" : {
			"focusin" : true,
			"message" : {
				"ko_KR" : {
					"year" : "년",
					"month" : "월",
					"days" : "일,월,화,수,목,금,토",
					"yearNaN" : "년도는 서기 100년 이하는 입력 할 수 없습니다.",
					"monthNaN" : "월은 1월 부터 12월 까지 입력 할 수 있습니다.",
					"dayNaN" : "일은 1일부터 {0}일 까지 입력 할 수 있습니다."
				},
				"en_US" : {
					"year" : "Year",
					"month" : "Month",
					"days" : "Sun,Mon,Tue,Wed,Thu,Fri,Sat",
					"yearNaN" : "You can not enter less AD 100 years",
					"monthNaN" : "You can enter 1 to 12 months value",
					"dayNaN" : "You can enter 1 to {0} days value"
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
			"val" : "val",
			/**
			 * select 요소에 option 을 덮어쓸건지 더할건지 지정
			 */
			"append" : true
		},
		"form" : {
			/**
			 * 바인드된 데이터의 html 을 인식 할건지 여부
			 */
			"html" : false,
			/**
			 * 실시간 데이터 검증을 할 건지 여부
			 */
			"validate" : true,
			/**
			 * 바인드된 데이터의 새로운 row 생성시 위치를 최상단에 만들건지 여부
			 */
			"addTop" : false
		},
		"grid" : {
			/**
			 * 그리드에서 스크롤할때 위, 아래 끝에 다다르면 전체 페이지가(window scroll) 스크롤 되는것을 방지하기 위한 기능 활성 여부
			 */
			"windowScrollLock" : true,
			/**
			 * bind 시 row 생성 delay(ms)
			 */
			"createRowDelay" : 1,
			/**
			 * 헤더픽스형일 경우 스크롤 페이징 사이즈(대용량 데이터 처리)
			 */
			/**
			 * 바인드된 데이터의 새로운 row 생성시 위치를 최상단에 만들건지 여부
			 */
			"addTop" : false,
			"scrollPaging" : {
				"size" : 50
			},
			/**
			 * 세로 길이조절 기능 활성화 여부
			 */
			"vResizable" : false,
			/**
			 * 소트 기능 활성화 여부
			 */
			"sortable" : false,
			/**
			 * 소트기능 활설화 시 표시 구분자(html 태그 가능)
			 */
			"sortableItem" : {
				"asc" : "▼",
				"desc" : "▲"
			},
			/**
			 * Grid 에서 사용 할 메시지 다국어 처리
			 */
			"message" : {
				"ko_KR" : {
					"empty" : "조회를 하지 않았거나 조회된 데이터가 없습니다.",
					"search" : "검색",
					"selectAll" : "전체선택",
					"dFilter" : "데이터 필터"
				},
				"en_US" : {
					"empty" : "No inquired data or no data available.",
					"search" : "Search",
					"selectAll" : "Select all",
					"dFilter" : "Data filter"
				}
			},
			/**
			 * 기타 설정
			 */
			"misc" : {
				/**
				 * 컬럼 리사이즈 시 다른컬럼이 밀릴때 아래 수치 조절(기본값 : 0)
				 */
				"resizableCorrectionWidth" : N.browser.is("chrome") ? 1 : N.browser.is("safari") ? 2 : 0,
				/**
				 * 헤더고정형 중 마지막 컬럼 클릭 시 다른컬럼이 밀릴때 아래 수치 조절(기본값 : 0)
				 */
				"resizableLastCellCorrectionWidth" : 0,
				/**
				 * 리사이즈바의 left 포지션이 컬럼 보더를 기준으로 가운데에 위치하지 않을때 아래 수치 조절(기본값 : 0)
				 */
				"resizeBarCorrectionLeft" : N.browser.is("firefox") ? -1 : N.browser.is("safari") ? 1 : 0,
				/**
				 * 리사이즈바의 높이가 밑에까지 꽉 차지 않을때 아래 수치 조절(기본값 : 0)
				 */
				"resizeBarCorrectionHeight" : 0
			}
		}
	});

	/**
	 * Natural-UI.Shell Config
	 */
	N.context.attr("ui.shell", {
		"notify" : {
			"position" : {
				top : 10,
				right : 10
			},
			"alwaysOnTop" : true,
			"message" : {
				"ko_KR" : {
					"close" : "닫기"
				},
				"en_US" : {
					"close" : "Close"
				}
			}
		}
	});

})(N);