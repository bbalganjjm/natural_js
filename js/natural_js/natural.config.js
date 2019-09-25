/**
 * Natural-JS에서 제공하는 라이브러리 및 컴포넌트의 전역 옵션 값 설정
 * 여기에 기본으로 정의 된 값들은 제거하면 안 됨. 추가만 가능
 *
 * 컴포넌트들의 옵션 적용 순서
 * 1. 컴포넌트 초기화시 지정한 옵션 값
 *
 * 2. 여기(N.Config)에서 지정한 옵션 값
 *    2.1. 각 영역별로 지정 하세요. 컴포넌트 초기화 시 각 영역별 값들을 자동으로 기본옵션으로 지정 해 줍니다.
 *         ex) 2.1.1 모든 N.grid의 높이를 300으로 지정하고 싶음.
 *                   - N.context.attr("ui") 의 grid 키에 height 속성을 추가하고 값은 300 을 지정
 *             2.1.2 모든 N.form에 html을 인식 시키고 싶음.
 *                   - N.context.attr("ui") 의 form 키에 html 속성을 추가하고 값은 true 로 지정
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
	     * 체크박스가 1개 일 경우 선택 했을 때 기본 값
	     */
	    sgChkdVal : "Y", //Y, 1, on
	    /**
	     * 체크박스가 1개 일 경우 선택 안 했을 때 기본 값
	     */
	    sgUnChkdVal : "N", //N, 0, off
	    /**
	     * 문자열 구분자
	     */
	    spltSepa : "$@^",
	    /**
	     * N.context.attr("architecture").page.context 로 페이지가 전환될때 마다 실행될 가비지 컬렉터의 모드
	     */
	    gcMode : "full", //minimum, full
	    /**
	     * N.string.byteLength 함수 및 maxbyte / minbyte / rangebyte 룰에서 영문, 숫자, 기본 특수문자등을 제외한 한글, 한글특수 문자 등의 기본 바이트 길이를 설정
	     */
	    charByteLength : 3
	});

	/**
	 * Natural-ARCHITECTURE Config
	 */
	N.context.attr("architecture", {
		/**
		 * Natural-JS Page Context(지정 필수, 메인 컨텐츠가 들어갈 자리를 지정 해 주세요.)
		 * Documents 컴포넌트를 사용하면 따로 지정 하지 않아도 됩니다.
		 * SPA(Single Page Application) 가 아니면 "body" 로 설정 해 주세요.
		 */
		"page" : {
			"context" : ".main-contents"
		},
		/**
		 * N.cont(Controller)에 정의한 오브젝트들을 대상으로 하는 관점 지향 프로그래밍(AOP) 설정
		 *   - 아래는 AOP 관련 된 예제코드 이므로 사용하지 않는다면 cont 하위의 모든 구문을 삭제하고 사용 바랍니다.
		 */
		"cont" : {
			"advisors" : [{
                "pointcut" : "^init$",
                "adviceType" : "around",
                "fn" : function(cont, fnChain, args, joinPoint) {
                	// 다국어 처리
			    	APP.indx.i18n(undefined, cont.request.options.target);

                	N.template.aop.codes(cont, joinPoint);
            	}
            }, { // 팝업이나 탭에서 지연 된 init 이 실행 된 후에 onOpen을 실행하기 위해서.
                "pointcut" : "^onOpen",
                "adviceType" : "around",
                "fn" : function(cont, fnChain, args, joinPoint) {
                    if(cont.onOpenDefer || (cont.caller && cont.caller.options.preload)) {
                        joinPoint.proceed();
                    } else {
                        cont.onOpenDefer = $.Deferred().done(function() {
                            joinPoint.proceed();
                        });
                    }
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
			* 수행 순서는 order 속성(숫자가 적을 수록 먼저 실행 됨)이 정의 된 필터가 실행 된 다음 order 속성이 정의 되지 않은 필터들이 실행 됨.
			* 여기에서 지정한 pageFilter, dataFilter 는 상수값이 아니므로 자유롭게 지정하면 됨.
			*/
			"filters" : {
				"basicFilter" : {
					/**
					 * N.comm 이 초기화 되기 전 실행됨(N.cont 의 init 아님). string 으로 변환되지 않은 원형의 파라미터를 꺼내올 수 있음.
					 */
					beforeInit : function(obj) {
					},
					/**
					 * N.comm 이 초기화 된 후 실행됨(N.cont 의 init 아님).
					 */
					afterInit : function(request) {
					},
					/**
					 * 서버에 요청을 보내기 전 실행됨.
					 */
					beforeSend : function(request, xhr, settings) {
					    // github pages 는 GET 요청 만 보낼 수 있어서 서버로 데이터를 전송하는 예제는 여기서 파라미터 정보만 보여주고 요청을 중단 함.
                        if(request.options.type !== "GET" || (request.options.data != null && request.options.data.indexOf("q=%7B%22name%22") > -1)) {
                            var msg;
                            if(request.options.type !== "GET") {
                                msg = request.options.data;
                                xhr.abort();
                            } else {
                                msg = JSON.parse(decodeURIComponent(request.options.data.replace("q=", "")));
                            }

                            N(window).alert({
                                title : N.message.get({
                                    "ko_KR" : {
                                        "COMM_TITLE" : "이 예제는 DB 서버와 연동 되지 않음 / 서버로 전송 되는 파라미터 확인"
                                    },
                                    "en_US" : {
                                        "COMM_TITLE" : "This example does not work with the DB server / Check parameters sent to the server"
                                    }
                                }, "COMM_TITLE"),
                                msg : "<pre style='white-space: pre-wrap;'>" + N.json.format(msg) + "</pre>",
                                width : 480
                            }).show();
                            
                            setTimeout(function() {
                                N.docs.removeLoadIndicator.call(APP.indx.docs);
                            }, 500);
                        }
                        
                        // Display page loading image.
                        if(request.options.dataType === "html" && request.options.target !== null && request.options.append === false) {
                            request.options.target.html('<div style="text-align: center; vertical-align: middle;border: 0; border: none;width: 100%;height: 100%;"><img src="images/loading.gif" height="24"></div>');
                        }
					},
					/**
					 * 서버에 요청이 성공 했을 경우 실행됨.
					 * return data 를 하면 N.comm.submit 의 콜백의 인자로 넘어오는 data 가 리턴한 데이터로 치환 됨.
					 */
					success : function(request, data, textStatus, xhr) {
						var opts = request.options;
						if((opts.target && N.isElement(opts.target)) || opts.dataType === "html" || opts.contentType === "text/css") {
						    if(location.hostname === "localhost" || location.hostname === "127.0.0.1") {
						        if(data.indexOf("<script") > -1) {
	                                // Natural-CODE : 코드 인스펙션
	                                var excludes = [
	                                    ".index-header",                        // view 컨텍스트 정의 안함.
	                                    ".page-header",                         // view 컨텍스트 정의 안함.
	                                    ".index-lefter",                        // view 컨텍스트 정의 안함.
	                                    ".index-contents",                      // view 컨텍스트 정의 안함.
	                                    ".index-footer",                        // view 컨텍스트 정의 안함.

	                                    'N("#selectDocs", view)).bind().val'    // jQuery val 을 사용하여 입력 값을 수정
	                                ];

	                                var inspectionReport = N.code.inspection.test(data, excludes);

	                                var color = "black";
	                                N(inspectionReport).each(function() {
	                                    if(this.level === "ERROR") {
	                                        color = "red";
	                                    } else if(this.level === "ERROR") {
	                                        color = "blue";
	                                    }
	                                    N[this.level.toLowerCase()]("%c[" + this.level + "] " + opts.url + " - " + this.line + " : " + this.code, "color: " + color + "; font-weight: bold; line-height: 200%;",
	                                            "\n" + this.message);
	                                });
	                            }
						    }

						    // color theme
                            if(window.localStorage.themeColor !== "green") {
                                $(APP.indx.colorPalette.green).each(function(i, color) {
                                    data = data.replace(new RegExp(color, "gi"), APP.indx.colorPalette[window.localStorage.themeColor][i]);

                                    if(opts.contentType === "text/css") {
                                        data = data.replace(/url\(/gi, "*url(");
                                    }
                                });
                            }

						    // Natural-CODE : 디버깅 지원을 위한 컨트롤러의 sourceURL 자동 삽입 처리
							return N.code.addSourceURL(data, opts.url);
						}
					},
					/**
					 * 서버에 요청 후 서버에러가 발생 했을 경우 실행됨.
					 */
					error : function(request, xhr, textStatus, errorThrown) {
						if((xhr.getResponseHeader("Content-Type") && xhr.getResponseHeader("Content-Type").indexOf("html") > -1) || request.options.dataType === "html") {
							if(request.options.target != null && request.options.target.html !== undefined) {
								request.options.target.html('<div style="text-align: center; margin-top: 140px;margin-bottom: 140px;">[ ' + request.options.url + ' ] 페이지를 불러오는 도중 에러가 발생 했습니다.</div>');
							} else {
								N(window).alert('[ ' + request.options.url + ' ] 페이지를 불러오는 도중 에러가 발생 했습니다.').show();
							}
							if(request.options.target != null && request.options.target.is(".docs_contents")) {
							    request.options.target.removeClass("hidden__").addClass("visible__")
							        .siblings(".docs_contents__").removeClass("visible__").addClass("hidden__");
							}
						} else {
							var code;
							var message;
							if(xhr.responseJSON) {
							    if(xhr.responseJSON.error) {
							        code = xhr.responseJSON.error.code;
	                                message = xhr.responseJSON.error.message;
							    } else {
							        if(xhr.responseJSON.message) {
	                                    message = xhr.responseJSON.message;
	                                }
							    }
							}
							if(xhr.status == 500 || xhr.status == 413) {
								if(message) {
									N.notify({
										html : true
									}).add('<div style="white-space: pre-line;">' + message + '</div>');
								}
							} else if(xhr.status == 412) {
								N(window).alert(message).show();
							}
						}
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
                     * GET 으로 되어 있으면 JSON 형태의 파라미터가 q라는 파라미터명으로 q={a:1} 와 같이 전달 됩니다.
                     * JSON Object String 을 Request Body 에 담아 전송하려면 반드시 POST로 설정 바랍니다.
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
					 * Single Page Application(SPA) 개발 시 N.comm(async) 으로 데이터를 요청하고 요청이 오기전에 다른 페이지로 전환 했을때
					 * 요청할 때 location.href 와 응답 올때 location.href 을 비교하여 틀리면 요청을 중지 할 건지 여부
					 */
					"urlSync" : true,
					/**
					 * 특정 영역에 html 페이지를 불러올때 browser history(뒤로가기버튼) 를 적용할 지 여부
					 */
					"browserHistory" : false,
					/**
					 * 특정 영역에 html 페이지를 불러올때 덮어 쓸건지 더할건지 여부
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
					email : "e-mail 형식에 맞지 않습니다.",
					url : "URL 형식에 맞지 않습니다.",
					zipcode : "우편번호 형식에 맞지 않습니다.",
					decimal : "(유한)소수만 입력 할 수 있습니다.",
                    decimal_ : "(유한)소수 {0}번째 자리까지 입력 할 수 있습니다.", // TODO
					phone : "전화번호 형식이 아닙니다.",
					rrn : "주민등록번호 형식에 맞지 않습니다.",
					ssn : "주민등록번호 형식에 맞지 않습니다.", // Deprecated
					frn : "외국인등록번호 형식에 맞지 않습니다.",
					frn_rrn : "주민번호나 외국인등록번호 형식에 맞지 않습니다.", // Deprecated
					frn_ssn : "주민번호나 외국인등록번호 형식에 맞지 않습니다.",
					cno : "사업자등록번호 형식에 맞지 않습니다.", // Deprecated
					kbrn : "사업자등록번호 형식에 맞지 않습니다.",
					cpno : "법인번호 형식에 맞지 않습니다.", // Deprecated
					kcn : "법인번호 형식에 맞지 않습니다.",
					date : "날짜 형식에 맞지 않습니다.",
					time : "시간 형식에 맞지 않습니다.",
					accept : "\"{0}\" 값만 입력 할 수 있습니다.",
					match : "\"{0}\" 이(가) 포함된 값만 입력 할 수 있습니다.",
					acceptFileExt : "\"{0}\" 이(가) 포함된 확장자만 입력 할 수 있습니다.",
					notAccept : "\"{0}\" 값은 입력 할 수 없습니다.",
					notMatch : "\"{0}\" 이(가) 포함된 값은 입력 할 수 없습니다.",
					notAcceptFileExt : "\"{0}\" 이(가) 포함된 확장자는 입력 할 수없습니다.",
					equalTo : "\"{1}\" 의 값과 같아야 합니다.",
					maxlength : "{0} 글자 이하만 입력 가능합니다.",
					minlength : "{0} 글자 이상만 입력 가능합니다.",
					rangelength : "{0} 글자 에서 {1} 글자 까지만 입력 가능합니다.",
					maxbyte : "{0} 바이트 이하만 입력 가능합니다.<br> - 영문, 숫자 : 1 바이트<br> - 한글, 특수문자 : {1} 바이트",
					minbyte : "{0} 바이트 이상만 입력 가능합니다.<br> - 영문, 숫자 : 1 바이트<br> - 한글, 특수문자 : {1} 바이트",
					rangebyte : "{0} 바이트 에서 {1} 바이트 까지만 입력 가능합니다.<br> - 영문, 숫자 한글자 : 1 바이트<br> - 한글, 특수문자 : {2} 바이트",
					maxvalue : "{0} 이하의 값만 입력 가능합니다.",
					minvalue : "{0} 이상의 값만 입력 가능합니다.",
					rangevalue : "{0} 에서 {1} 사이의 값만 입력 가능합니다.",
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
					ssn : "Don't fit the format of the resident registration number.", // Deprecated.
					frn : "Don't fit the format of foreign registration number.",
					frn_rrn : "Don't fit the format of the resident registration number or foreign registration number.",
					frn_ssn : "Don't fit the format of the resident registration number or foreign registration number.", // Deprecated.
					cno : "Don't fit the format of registration of enterpreneur.", // Deprecated
					kbrn : "Don't fit the format of registration of enterpreneur.",
					cpno : "Don't fit the format of corporation number.", // Deprecated
					kcn : "Don't fit the format of corporation number.",
					date : "Don't fit the format of date.",
					time : "Don't fit the format of time.",
					accept : "Can enter only \"{0}\" value.",
					match : "Can enter only value ​​that contains \"{0}\".",
					acceptFileExt : "Can enter only extension that includes \"{0}\".",
					notAccept : "Can't enter \"{0}\" value.",
					notMatch : "Can't enter only value ​​that contains \"{0}\".",
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
	// 아래 extend 구문은 사용자 정의 룰 정의 시 적용되게 하는 코드이므로 사용자 정의 룰을 정의 했다면 절대 지우면 안됨.
	$.extend(N.formatter, N.context.attr("data").formatter.userRules);
	$.extend(N.validator, N.context.attr("data").validator.userRules);

	/**
	 * Natural-UI Config
	 */
	N.context.attr("ui", {
		"alert" : {
			/**
			 * N.alert, N.popup 컴포넌트의 요소들이 저장 되는 영역(지정 필수)
			 * N.context.attr("architecture").page.context 와 같게 설정해도 됩니다.
			 * Documents 컴포넌트를 사용하면 따로 지정 하지 않아도 됩니다.
			 * SPA(Single Page Application) 가 아니면 "body" 로 설정 해 주세요.
			 */
			"container" : ".docs__ > .docs_contents__.visible__",
			/**
			 * 버튼 스타일(Required)
			 */
			"global" : {
				"okBtnStyle" : {
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
			 * html 인식 여부
			 */
			html : true,
			/**
			 * 메모리를 절약 해 준다.
			 */
			"saveMemory" : true,
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
			"draggable" : true,
			"alwaysOnTop" : true,
			"button" : false,
			"windowScrollLock" : false,
			/**
             * 메모리를 절약 해 준다.
             */
            "saveMemory" : true
		},
		"tab" : {
		    "tabScrollCorrection" : {
		        tabContainerWidthCorrectionPx : 1,
		        tabContainerWidthReCalcDelayTime : 0
		    }
		},
		"datepicker" : {
			"focusin" : true,
			/**
			 * 다국어 메시지
			 */
			"message" : {
				"ko_KR" : {
					"year" : "년",
					"month" : "월",
					"days" : "일,월,화,수,목,금,토",
					"yearNaN" : "년도는 서기 100년 이하는 입력 할 수 없습니다.",
					"monthNaN" : "월은 1월 부터 12월 까지 입력 할 수 있습니다.",
					"dayNaN" : "일은 1일부터 {0}일 까지 입력 할 수 있습니다.",
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
			},
			"yearsPanelPosition" : "top",
			"monthsPanelPosition" : "top",
			/**
			 * monthonly 옵션이 true 일때 전역 옵션
			 */
			"monthonlyOpts" : {
			    "yearsPanelPosition" : "left",
	            "monthsPanelPosition" : "left",
			},
			"yearChangeInput" : true,
			"monthChangeInput" : true,
			"touchMonthChange" : true,
			"scrollMonthChange" : true
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
			 * XSS 필터링 목록
			 */
			"xssReverseChars" : [
			    ["&amp;", "&"],
			    ["&#x2F;", "/"],
			    ["&lt;", "<"], ["&gt;", ">"],
			    ["&#x27;", "'"],
			    ["&quot;", '"']
			],
			/**
			 * 서버에서 XSS 필터링 된 값을 입력 요소에 바인드 할때는 원복해서 바인드하는 이벤트 핸들러.
			 *
			 * onBeforeBindValue 이벤트
			 *  - 값이 바인드 되기전 실행 되는 이벤트, 반드시 val 을 (가공 후) 다시 리턴 해야 함.
			 *  - N.form 을 사용하는 N.grid, N.list 에도 같이 적용 됨.
			 *    - ele : 바인드 될 요소
			 *    - ele : 바인드 될 값
			 *    - ele : 호출 함수 명 - "bind" | "val"
			 */
			"onBeforeBindValue" : function(ele, val, action) {
			    if(N.type(val) === "array") {
			        for (var j = 0; j < val.length; j++) {
			            if(N.type(val[j]) === "string"){
			                for (var i = 0; i < this.options.xssReverseChars.length; i++) {
                                val[j] = val[j].replace(new RegExp(this.options.xssReverseChars[i][0], "g"), this.options.xssReverseChars[i][1]);
                            }
			            }
			        }
			        return val;
			    } else if(N.type(val) === "string"){
		            for (var i = 0; i < this.options.xssReverseChars.length; i++) {
		                val = val.replace(new RegExp(this.options.xssReverseChars[i][0], "g"), this.options.xssReverseChars[i][1]);
		            }
		            return val;
			    } else {
			        return val;
			    }
			},
			"tpBind" : true
		},
		"list" : {
			/**
			 * 다국어 메시지
			 */
			"message" : {
				"ko_KR" : {
					"empty" : "조회를 하지 않았거나 조회된 데이터가 없습니다."
				},
				"en_US" : {
					"empty" : "No inquired data or no data available."
				}
			},
			/**
			 * 스크롤 페이징 시 한번에 몇개를 가져올것인지 설정
			 */
			"scrollPaging" : {
				"size" : 30
			},
            "unselect" : false,
       		"addSelect" : false,
       		"html" : false,
       		"tpBind" : false
		},
		"grid" : {
			/**
			 * 그리드에서 스크롤할때 위, 아래 끝에 다다르면 전체 페이지가(window scroll) 스크롤 되는것을 방지하기 위한 기능 활성 여부
			 */
			"windowScrollLock" : true,
			/**
			 * 컬럼 넓이조절 기능 활성화 여부
			 */
			"resizable" : true,
			/**
			 * 소트 기능 활성화 여부
			 */
			"sortable" : true,
			/**
			 * 필터 기능 활성화 여부
			 */
			"filter" : true,
			/**
			 * 소트기능 활설화 시 표시 구분자(html 태그 가능)
			 */
			"sortableItem" : {
				"asc" : "▼",
				"desc" : "▲"
			},
			/**
			 * 스크롤 페이징 시 한번에 몇개를 가져올것인지 설정
			 */
			"scrollPaging" : {
				"size" : 30
			},
            "unselect" : false,
            "resizable" : true,
       		"sortable" : true,
       		"addSelect" : false,
       		"html" : false,
       		"tpBind" : false,
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
				"resizableCorrectionWidth" : N.browser.is("safari") ? -6 : -7,
				/**
				 * 헤더고정형 중 마지막 컬럼 리사이즈 시 다른컬럼이 밀릴때 아래 수치 조절(기본값 : 0)
				 */
				"resizableLastCellCorrectionWidth" : 8,
				/**
				 * 리사이즈바의 left 포지션이 컬럼 보더를 기준으로 가운데에 위치하지 않을때 아래 수치 조절(기본값 : 0)
				 */
				"resizeBarCorrectionLeft" : N.browser.is("firefox") ? -1 : N.browser.is("safari") ? 1 : 0,
				/**
				 * 리사이즈바의 높이가 밑에까지 꽉 차지 않을때 아래 수치 조절(기본값 : 0)
				 */
				"resizeBarCorrectionHeight" : 0,
				/**
				 * 컬럼 고정 시 고정 된 헤더 셀(TH)의 상단 위치가 맞지 않을때 아래 수치 조절(기본값 : 0)
				 */
				"fixedcolHeadMarginTop" : N.browser.is("ie") || N.browser.is("firefox") ? 1 : 2,
				/**
				 * 컬럼 고정 시 고정 된 헤더 셀(TH)의 좌측 위치가 맞지 않을때 아래 수치 조절(기본값 : 0)
				 */
				"fixedcolHeadMarginLeft" : N.browser.is("ie") || N.browser.is("firefox") ? -1 : 0,
				/**
				 * 컬럼 고정 시 고정 된 헤더 셀(TH)의 높이가 맞지 않을때 아래 수치 조절(기본값 : 0)
				 */
				"fixedcolHeadHeight" : N.browser.is("ie") || N.browser.is("firefox") ? 0 : -1,
				/**
				 * 컬럼 고정 시 고정 된 바디 셀(TD)의 상단 위치가 맞지 않을때 아래 수치 조절(기본값 : 0)
				 */
				"fixedcolBodyMarginTop" : N.browser.is("ie") ? -0.5 : N.browser.is("firefox") ? -1 : 0,
				/**
				 * 컬럼 고정 시 고정 된 바디 셀(TD)의 좌측 위치가 맞지 않을때 아래 수치 조절(기본값 : 0)
				 */
				"fixedcolBodyMarginLeft" : N.browser.is("ie") || N.browser.is("firefox") ? -1 : 0,
				/**
				 * 컬럼 고정 시 데이터를 바인드 할 때 고정 된 바디 셀(TD)의 높이가 맞지 않을때 아래 수치 조절(기본값 : 0)
				 */
				"fixedcolBodyBindHeight" : N.browser.is("ie") ? 1.3 : 1,
				/**
				 * 컬럼 고정 시 데이터를 Add 할 때 고정 된 바디 셀(TD)의 높이가 맞지 않을때 아래 수치 조절(기본값 : 1)
				 */
				"fixedcolBodyAddHeight" : 1,
				/**
				 * 컬럼 고정 시 그리드 위에 있는 요소가 동적으로 높이가 조절 될때 그리드 모양이 깨지면 동적으로 높이가 조절 되는 요소와 그리드 요소를 모두 포함하고 있는 요소를 jQuery selector 문자열로 지정.
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
			"alwaysOnTop" : true,
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
			"alwaysOnTop" : true,
			"maxStateful" : 20,
			"maxTabs" : 0,
			"entireLoadIndicator" : true,
			"entireLoadScreenBlock" : true,
			"addLast" : true,
			"tabScroll" : true,
			"closeAllRedirectURL" : "./",
			"entireLoadExcludeURLs" : ["contents.html", "footer.html"],
			/*
			"onBeforeLoad" : function(docId, target) {
			},
			"onLoad" : function(docId) {
			},
			"onBeforeEntireLoad" : function(docId) {
			},
			"onEntireLoad" : function(docId) {
			},
			*/
			"onBeforeActive" : function(docId, isFromDocsTabList, isNotLoaded) {
			    if(!isNotLoaded) {
			        // FIXME 메뉴 DB 만들어 지고 페이지 불러오는 서비스 만들어지면 아래 코드(var hashVal 이전) 제거 바람.
			        var url = N(".index-lefter.view_context__ a[data-pageid='" + docId + "']").attr("href");
			        if (N.string.trim(location.hash).length === 0 || docId === "home0100") {
			            docId = "home0100";
			            url = "html/naturaljs/" + docId.substring(0, 4) + "/" + docId + ".html";
			        }
			        
			        var hashVal = docId + "$" + this.options.docs[docId].docNm + "$" + url;
			        if(decodeURIComponent(atob(location.hash.replace("#", ""))) != hashVal) {
			            location.hash = btoa(encodeURIComponent(hashVal));
			        }
                }
			},
			"onActive" : function(docId, isFromDocsTabList, isNotLoaded) {
                if(location.hostname === "bbalganjjm.github.io") {
                    try {
                        ga('create', 'UA-58001949-2', 'auto');
                        ga('set', 'location', location.href);
                        ga('set', 'title', this.doc(docId).docNm);
                        ga('send', {
                            'hitType': 'pageview',
                            'page': location.hash
                        });
                    } catch (e) {}
                }
			},
			/*
			"onBeforeInactive" : function(docId) {
			},
			"onInactive" : function(docId) {
			},
			"onBeforeRemoveState" : function(docId) {
			},
			"onRemoveState" : function(docId) {
			},
			"onBeforeRemove" : function(docId) {
			},
			"onRemove" : function(docId) {
			},
			*/
			"message" : {
				"ko_KR" : {
					"closeAllTitle" : "메뉴 전체 닫기",
					"closeAll" : "전체 닫기",
					"closeAllQ" : "선택한 메뉴를 제외하고 열린 메뉴 전체를 닫겠습니까?",
					"closeAllDQ" : "열려있는 메뉴 전체를 닫고 메인(홈) 화면으로 이동 하겠습니까?",
					"docListTitle" : "열린 메뉴 목록",
					"docList" : "메뉴 목록",
					"selDocument" : "{0} 메뉴 선택",
					"close" : "메뉴 닫기",
					"closeConf" : "\"{0}\" 메뉴에 편집중인 항목이 있습니다. 무시하고 메뉴를 닫겠습니까?",
					"maxTabs" : "최대 {0} 개의 메뉴 만 열 수 있습니다. <br>다른 메뉴 탭을 닫고 다시 시도 하세요.",
					"maxStateful" : "선택한 메뉴가 활성화 되면 설정 된 최대 상태유지 메뉴 개수(최대 {1} 개)가 초과 되어 마지막으로 선택 된 \"{0}\" 메뉴 페이지가 다시 로딩 됩니다.<br>메뉴를 선택 하겠습니까?"
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

	// Natural-JS API 메뉴얼 용 advisors
	N.context.attr("architecture").cont.advisors.push({ // md 파일 변환
        "pointcut" : [
            ".intr0100",
            ".gtst0100",
            ".gtst0200",
            ".gtst0300",
            ".gtst2000",
            ".refr0001",
            ".refr010101",
            ".refr010201",
            ".refr020101",
            ".refr020201",
            ".refr020301",
            ".refr060101",
            ".refr060102:init$"
        ].join(","),
        "adviceType" : "before",
        "fn" : function(cont, fnChain, args){ /* cont 컨트롤러, fnChain 함수명, args 인자 */
            /* markdown 파일 로딩 후  html 로 변환 */
            if(typeof showdown == "undefined") {
                N.comm({
                    url : "js/lib/markdown/github-markdown.css",
                    contentType : "text/css",
                    dataType : "html"
                }).submit(function(data) {
                    $('<style type="text/css">\n' + data + '</style>').appendTo("head");
                    $.getScript("js/lib/markdown/showdown.min.js", function() {
                        N.comm({
                            url : cont.request.options.url.replace(/.html/, ".md").replace(/\.md/g, "_" + N.locale() + ".md"),
                            dataType : "text",
                            type : "GET"
                        }).submit(function(data) {
                            cont.view.addClass("markdown-body").html((new showdown.Converter()).makeHtml(data));
                        });
                    }); 
                });
            } else {
                N.comm({
                    url : cont.request.options.url.replace(/\.html/, ".md").replace(/\.md/g, "_" + N.locale() + ".md"),
                    dataType : "text",
                    type : "GET"
                }).submit(function(data) {
                    cont.view.addClass("markdown-body").html((new showdown.Converter()).makeHtml(data));
                });
            }
        }
    }, { // API DEMO 페이지 자동 삽입.
        "pointcut" : [
            ".refr020102",
            ".refr020302",
            ".refr030102",
            ".refr030202",
            ".refr040102",
            ".refr040202",
            ".refr040302",
            ".refr040402",
            ".refr040502",
            ".refr040602",
            ".refr040702",
            ".refr040802",
            ".refr040902",
            ".refr041002",
            ".refr041102",
            ".refr050102:init$"
        ].join(","),
        "adviceType" : "before",
        "fn" : function(cont, fnChain, args){
            var view = args[0];

            //load api demo page
            N(".apidemo", view).each(function() {
                N(this).comm("html/naturaljs/apid/" + N(this).data("page") + ".html").submit(function() {
                    var view_ = view.find(".view_context__");

                    // inject description to option inputs
                    if(view.closest(".refr0104").length === 0) {
                        var descTableEle;
                        if(view.closest(".refr010302").length === 0) {
                            descTableEle = $("h3:contains('기본옵션'), h3:contains('Default Options')", view).next("table:first");
                        } else {
                            descTableEle = $("h4:contains('기본옵션'), h4:contains('Default Options')", view).next("table:first");
                        }
                        var optNm;
                        N(".form:first, .form#otherPage", view_).find(":input[id]").each(function() {
                            optNm = this.id;
                            $(this).after('<div class="demo-desc">' + $.trim(descTableEle.find("tr").find(">td:first").filter(":contains('" + optNm + "'):first").siblings(":last").html()) + '</div>');
                        });
                    }
                });
            });
        }
    }, { // API 문서 모바일 용 보기 처리
        "pointcut" : [
            ".refr010103",
            ".refr010104",
            ".refr010105",
            ".refr010106",
            ".refr010107",
            ".refr010108",
            ".refr010109",
            ".refr010110",
            ".refr010111",
            ".refr010112",
            ".refr010113",
            ".refr020103",
            ".refr020105",
            ".refr020303",
            ".refr020305",
            ".refr020403",
            ".refr020602",
            ".refr030103",
            ".refr030104",
            ".refr030203",
            ".refr030204",
            ".refr030302",
            ".refr040103",
            ".refr040105",
            ".refr040203",
            ".refr040206",
            ".refr040303",
            ".refr040306",
            ".refr040403",
            ".refr040405",
            ".refr040503",
            ".refr040506",
            ".refr040603",
            ".refr040605",
            ".refr040703",
            ".refr040706",
            ".refr040803",
            ".refr040806",
            ".refr040903",
            ".refr040906",
            ".refr041003",
            ".refr041005",
            ".refr041103",
            ".refr041105",
            ".refr050103",
            ".refr050105",
            ".refr050202",
            ".refr050205",
            ".refr050206:init$"
        ].join(","),
        "adviceType" : "before",
        "fn" : function(cont, fnChain, args){
            N(window).trigger("resize.mobile", [ cont.view ]);
        }
    }, { // 소스보기 버튼 처리
        "pointcut" : "^init$",
        "adviceType" : "before",
        "fn" : function(cont, fnChain, args){ /* cont 컨트롤러, fnChain 함수명, args 인자 */
            var view = args[0];
            var url = cont.request.get("url");
            
            if(cont.view.hasClass("view-code")) {
                var btnEle = N('<a class="click">View Source Code</a>');
                if(view.find(btnEle).length === 0) {
                    view.append(btnEle);
                    view.append('<pre id="sourceCodeBox" class="line-numbers" style="display: none;"><code id="sourceCode" class="language-markup"></code></pre>');
                    btnEle.click(function() {
                        var sourceCodeBox = btnEle.next("#sourceCodeBox");
                        if(!sourceCodeBox.is(":visible")) {
                            sourceCodeBox.slideDown();
                        } else {
                            sourceCodeBox.slideUp();
                        }
                    });
                    N.comm({
                        url : url,
                        contentType : "text/plain; charset=UTF-8",
                        dataType : "text",
                        type : "GET"
                    }).submit(function(html) {
                        var tempView = $("<div>" + html + "</div>");
                        APP.indx.i18n(undefined, tempView);
                        N("#sourceCode", view).text(tempView.html().replace(/&quot;/g, '"'));
                    });
                }
            }
        }
    });

})(N);