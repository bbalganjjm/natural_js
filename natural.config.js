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
	    gcMode : "minimum" //minimum, full
	});

	/**
	 * Natural-ARCHITECTURE Config
	 */
	N.context.attr("architecture", {
		"page" : {
			"context" : "div#contents"
		},
		"comm" : {
			/**
			* Global ajax request filter
			*/
			"filters" : {
				/**
				 * 필터를 여러개 걸수 있으며 단위 필터명은 아무거나 지정하면 됨.
				 */
				"pageFilter" : {
					afterInit : function(request) {
					},
					beforeSend : function(request, xhr, settings) {
						if(request.options.dataType === "html" && request.obj.length > 0 && request.append === false) {
							request.obj.html('<div align="center" style="margin-top: 140px;margin-bottom: 140px;">페이지를 불러오는 중...</div>');
						}
					},
					success : function(request, data, textStatus, xhr) {
					},
					error : function(request, xhr, textStatus, errorThrown) {
						if(request.obj.html !== undefined) {
							request.obj.html('<div align="center" style="margin-top: 140px;margin-bottom: 140px;">[ ' + request.options.url + ' ] 페이지를 불러오는 도중 에러가 발생 했습니다.</div>');
						} else {
							N(window).alert('[ ' + request.options.url + ' ] 페이지를 불러오는 도중 에러가 발생 했습니다.').show();
						}
					},
					complete : function(request, xhr, textStatus) {
					}
				},
				"dataFilter" : {
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
			},
			"request" : {
				"options" : {
					/**
					 * 기본 contentType
					 */
					"contentType" : "application/json; charset=utf-8",
					/**
					 * Ajax 통신 시 브라우저 캐시 적용 여부, 운영 시에는 true로 변경 바람
					 */
					"cache" : false,
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
					"effect" : ["slideDown", 300, null]
				}
			}
		}
	});

	/**
	 * Natural-DATA Config
	 */
	N.context.attr("data", {
		/**
		 * TODO Natural-LIVE
		 */
		"datasync" : {
			"socket" : null
		},
		"formatter" : {
			/**
			 * define user format rules
			 *
			 * function name = rule name
			 * return = boolean
			 */
			"userRules" : {

			},
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
					return "Y" + this.dateSepa + "m" + this.dateSepa + "d H";
				},
				/**
				 * 년월일 시분 날짜포멧
				 */
				YmdHi : function() {
					return "Y" + this.dateSepa + "m" + this.dateSepa + "d H" + this.timeSepa + "i";
				},
				/**
				 * 년월일 시분초 날짜포멧
				 */
				YmdHis : function() {
					return "Y" + this.dateSepa + "m" + this.dateSepa + "d H" + this.timeSepa + "i" + this.timeSepa + "s";
				}
			}
		},
		"validator" : {
			/**
			 * define user validate rules
			 *
			 * function name = rule name
			 * return = boolean
			 */
			"userRules" : {

			},
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
	$.extend(N.formatter, N.context.attr("data")["formatter"]["userRules"]);
	$.extend(N.validator, N.context.attr("data")["validator"]["userRules"]);

	/**
	 * Natural-UI Config
	 */
	N.context.attr("ui", {
		"alert" : {
			/**
			 * Popup Element 가 담길 영역
			 */
			"container" : "div#contents",
			/**
			 * 필수 값
			 */
			"global" : {
				"okBtnStyle" : {
					color : "skyblue",
					size : "medium"
				},
				"cancelBtnStyle" : {
					size : "medium"
				}
			},
			"alwaysOnTop" : false,
			/**
			 * 필수 값
			 */
			"input" : {
				/**
				 * 메시지 표시시간(ms)
				 */
				displayTimeout : 5000,
				/**
				 * 메시지 글머리 기호
				 */
				bullets : "*&nbsp;",
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
					"days" : "일,월,화,수,목,금,토"
				},
				"en_US" : {
					"year" : "Year",
					"month" : "Month",
					"days" : "Sun,Mon,Tue,Wed,Thu,Fri,Sat"
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
			 * 그리드에서 스크롤할때 위, 아래 끝에 다다르면 페이지가 스크롤 되는것을 방지하기 위해 true 로 지정하면 window의 스크롤을 감췄다가 그리드 영역을 벗어나면 다시 보여줌
			 */
			"windowScrollLock" : false,
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
					"empty" : "조회를 하지 않았거나 조회된 데이터가 없습니다."
				},
				"en_US" : {
					"empty" : "No inquired data or no data available."
				}
			}
		}
	});

})(N);