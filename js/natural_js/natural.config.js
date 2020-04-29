/**
 * Config(N.config) is a place to save Natural-JS operation environment setting, AOP setting, Communication Filter setting, UI global option value, etc.
 *
 * For more information on settings, please refer to the
 * Natural-CORE > Config( https://bbalganjjm.github.io/natural_js/#cmVmcjAxMDIlMjRDb25maWckaHRtbCUyRm5hdHVyYWxqcyUyRnJlZnIlMkZyZWZyMDEwMi5odG1s )
 * menu on the Natural-JS site.
 */
(function(N) {
    /**
     * Natural-CORE Config
     */
    N.context.attr("core", {
        /**
         * Default locale
         */
        "locale" : "ko_KR",
        /**
         * Default value when one checkbox is checked in N().vals method
         *  - Define according to the project data standards such as "Y", "1", and "on".
         */
        "sgChkdVal" : "Y",
        /**
         * Default value when one checkbox is unchecked in N().vals method
         *  - Define according to the project data standards such as "N", "0", and "off".
         */
        "sgUnChkdVal" : "N",
        /**
         * String separator used in Natural-JS
         */
        "spltSepa" : "$@^",
        /**
         * Garbage collection mode of N.gc function
         *  - minimum, full
         */
        "gcMode" : "full",
        /**
         * Set the default byte length of characters except single-byte characters such as English and numeric characters.
         *  - charByteLength is used in logic that checks the length of a string, such as N.string.byteLength function and maxbyte, minbyte, rangebyte verification rules, etc.
         */
        "charByteLength" : 3
    });

	/**
	 * Natural-ARCHITECTURE Config
	 */
	N.context.attr("architecture", {
	    /**
         * Specify the element to insert the main content in jQuery Selector syntax.
         *  - If you use the Documents(N.docs) component, you don't have to specify it, but otherwise you must.
         *  - If it is not SPA(Single Page Application), please set it to "body".
         */
        "page" : {
            "context" : ".docs__ > .docs_contents__.visible__"
        },
        /**
         * Controller AOP related settings.
         *  - Refer to the
         *    https://bbalganjjm.github.io/natural_js/#cmVmcjAyMDIlMjRBT1AkaHRtbCUyRm5hdHVyYWxqcyUyRnJlZnIlMkZyZWZyMDIwMi5odG1s
         */
		"cont" : {
			"advisors" : [{
                "pointcut" : "^init$",
                "adviceType" : "around",
                "fn" : function(cont, fnChain, args, joinPoint) {
                	// Multilingual processing
			    	APP.indx.i18n(undefined, cont.request.options.target);
			    	// Natural-CODE
                	N.template.aop.codes(cont, joinPoint);
            	}
            }, { // Pointcut for executing onOpen after a delayed init on a popup or tab
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
             * Communication Filter related settings.
             *  - Refer to the
             *    https://bbalganjjm.github.io/natural_js/#cmVmcjAyMDUlMjRDb21tdW5pY2F0aW9uJTIwRmlsdGVyJTI0aHRtbCUyRm5hdHVyYWxqcyUyRnJlZnIlMkZyZWZyMDIwNS5odG1s
             */
			"filters" : {
				"basicFilter" : {
					/**
					 * This function is executed before N.comm is initialized.
					 */
					beforeInit : function(obj) {
					},
					/**
					 * This function is executed after N.comm is initialized.
					 */
					afterInit : function(request) {
					},
					/**
					 * This function is executed before sending a request to the server.
					 */
					beforeSend : function(request, xhr, settings) {
					    // github pages 는 GET 요청 만 보낼 수 있어서 서버로 데이터를 전송하는 예제는 여기서 파라미터 정보만 보여주고 요청을 중단 함.
                        if(request.options.type !== "GET" || (request.options.data != null && request.options.data.indexOf("q=%7B%22name%22") > -1)) {
                            var msg;
                            if(request.options.type !== "GET") {
                                msg = request.options.data;
                                xhr.abort();

                                setTimeout(function() {
                                    N.docs.removeLoadIndicator.call(APP.indx.docs);
                                }, 1000);
                            } else {
                                msg = JSON.parse(decodeURIComponent(request.options.data.replace("q=", "")));
                            }

                            N.notify({
                                html: true
                            }).add("<strong>" + N.message.get({
                                    "ko_KR" : {
                                        "COMM_TITLE" : "이 예제의 데이터는 서버에 저장 되지 않습니다. 서버로 전송 되는 파라미터 만 확인 바랍니다."
                                    },
                                    "en_US" : {
                                        "COMM_TITLE" : "The parameters in this example are not sent to the server. Check only the parameters sent to the server."
                                    }
                                }, "COMM_TITLE") + "</strong><br><br>" + "<pre class=\"shell\" style=\"max-height: 500px; overflow-y: auto;\"><code>" + N.json.format(msg) + "</code></pre>"
                            );
                        }

                        // Display page loading image.
                        if(request.options.dataType === "html" && request.options.target !== null && request.options.append === false) {
                            request.options.target.html('<div style="text-align: center; vertical-align: middle;border: 0; border: none;width: 100%;height: 100%;"><img src="images/loading.gif" height="24"></div>');
                        }
					},
					/**
					 * This function is executed when the request is successful.
					 *  - If you return by modifying the data argument, you can receive the modified data as response data of all N.comm.
					 */
					success : function(request, data, textStatus, xhr) {
						var opts = request.options;
						if((opts.target && N.isElement(opts.target)) || opts.dataType === "html" || opts.contentType === "text/css") {
						    if(location.hostname === "localhost" || location.hostname === "127.0.0.1") {
                                // [ Natural-CODE ] 코드 인스펙션
                                N.code.inspection.report.console(N.code.inspection.test(data), opts.url);

                                // [ Natural-CODE ] Controller object 의 디버깅을 위해 HTML 요청 마다 sourceURL 을 자동으로 삽입.
                                data = N.code.addSourceURL(data, opts.url);
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

                            return data;
						}
					},
					/**
					 * This function is executed when an error occurs on the server.
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
					 * This function is executed when the server response is completed.
					 */
					complete : function(request, xhr, textStatus) {
					}
				}
			},
			"request" : {
			    /**
                 * Global options of Communicator.request.
                 *  - Refer to the
                 *    https://bbalganjjm.github.io/natural_js/#cmVmcjAyMDQlMjRDb21tdW5pY2F0b3IucmVxdWVzdCUyNGh0bWwlMkZuYXR1cmFsanMlMkZyZWZyJTJGcmVmcjAyMDQuaHRtbA==
                 */
				"options" : {
					"type" : "GET",
					"contentType" : "application/json; charset=utf-8",
					"cache" : true,
					"urlSync" : true,
					"browserHistory" : false,
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
             * Custom format rules
             */
            "userRules" : {
                /*
                 * Function name becomes rule name.
                 *
                 * str : Target string of format
                 * args : Format option
                 *
                 * return : Returns a formatted string
                "userRule" : function(str, args) {
                    return str;
                }
                 */
            },
            /**
             * Specifies the date format to be used globally for the application.
             *  - Date/time format : Y : year, m : month, d : day, H : hour, i : minute, s : second
             */
			"date" : {
			    /**
                 * Year, month, day separator
                 */
                "dateSepa" : "-",
                /**
                 * Hour, minute, second separator
                 */
                "timeSepa" : ":",
                /**
                 * Year, month format function, The format is specified in the return statement.
                 */
                "Ym" : function() {
                    return "Y" + this.dateSepa + "m";
                },
                /**
                 * Year, month, day Format function, The format is specified in the return statement.
                 */
                "Ymd" : function() {
                    return "Y" + this.dateSepa + "m" + this.dateSepa + "d";
                },
                /**
                 * Year, month, day, hour Format function, The format is specified in the return statement.
                 */
                "YmdH" : function() {
                    return this.Ymd() + " H";
                },
                /**
                 * Year, month, day, hour, minute Format function, The format is specified in the return statement.
                 */
                "YmdHi" : function() {
                    return this.Ymd() + " H" + this.timeSepa + "i";
                },
                /**
                 * Hour, minute, second Format function, The format is specified in the return statement.
                 */
                "YmdHis" : function() {
                    return this.Ymd() + " H" + this.timeSepa + "i" + this.timeSepa + "s";
                }
			}
		},
		"validator" : {
		    /**
             * Custom validation rules
             */
            "userRules" : {
                /*
                 * Function name becomes rule name.
                 * The validation failure message is defined in the following N.context.attr("data").validator.message object with a property name same a function name for each language.
                 *
                 * str : Target string of validation
                 * args : validation options
                 *
                 * return : Returns true if validation succeeds, false if it fails.
                "userRule" : function(str, args) {
                    return true;
                }
                 */
            },
            /**
             * Validation error multilingual message
             *  - To add a language, copy the language set, specify the language set object property name as its locale string, and define the message.
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

	// The extend statement below should never be deleted if you have defined a custom format rule.
    $.extend(N.formatter, N.context.attr("data").formatter.userRules);
    // The extend statement below should never be deleted if you have defined a custom validation rule.
    $.extend(N.validator, N.context.attr("data").validator.userRules);

	/**
	 * Natural-UI Config
	 */
	N.context.attr("ui", {
		"alert" : {
		    /**
             * Set the element to save the elements of N.alert and N.popup components using jQuery Selector syntax.
             * Define the same value as the value of N.context.attr("architecture").page.context unless it is a special case.
             *  - If you use the Documents(N.docs) component, you don't have to specify it, but otherwise you must.
             *  - If it is not SPA(Single Page Application), please set it to "body".
             */
			"container" : ".docs__ > .docs_contents__.visible__",
			"global" : {
                /**
                 * N.alert's OK button style
                 *  - It is specified as an option of the Button(N.button) component.
                 */
                "okBtnStyle" : {
                    color : "yellowgreen",
                    size : "medium"
                },
                /**
                 * N.alert's Cancel button style
                 *  - It is specified as an option of the Button(N.button) component.
                 */
                "cancelBtnStyle" : {
                    size : "medium"
                }
            },
            /**
             * Global draggableOverflowCorrectionAddValues option
             *  - Specifies the position to move to inside when the message dialog is dropped off the screen.
             *  - Correct the position of the message dialog  by incrementing or decrementing by 1 when a scroll bar appears on the screen because the message dialog  does not completely return to the inside.
             */
			"draggableOverflowCorrectionAddValues" : {
				top : 0,
				bottom : 0,
				left : +2,
				right : -2
			},
			/**
             * Global draggable option
             *  - If set to true, the message dialog will be draggable by the title bar.
             */
			"draggable" : true,
			/**
             * Global alwaysOnTop option
             *  - If set to true, The message dialog is always displayed at the top.
             */
			"alwaysOnTop" : true,
			"input" : {
                /**
                 * Display time of message dialog displayed when input element is specified in context option(ms)
                 */
                displayTimeout : 7000,
                /**
                 * Design of the close button of the message dialog displayed when an input element is specified in the context option(html tags can be entered)
                 */
                closeBtn : "&times;"
            },
			/**
			 * Global html option
			 * - If set to true, the HTML of the message is applied.
			 */
			"html" : true,
			/**
             * Global saveMemory option
             *  - If set to true, save memory usage by removing unnecessary reference elements.
             */
			"saveMemory" : true,
			/**
             * Multilingual messages
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
             * Global draggable option
             *  - If set to true, the popup dialog will be draggable by the title bar.
             */
			"draggable" : true,
			/**
             * Global alwaysOnTop option
             *  - If set to true, The popup dialog is always displayed at the top.
             */
			"alwaysOnTop" : true,
			/**
             * Global button option
             *  - If set to false, It does not create basic button(OK/Cancel buttons) related elements.
             */
			"button" : false,
			"windowScrollLock" : false,
			/**
             * Global saveMemory option
             *  - If set to true, save memory usage by removing unnecessary reference elements.
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
             * Multilingual messages of N.datepicker
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
			"monthonlyOpts" : {
			    /**
			     * Global yearsPanelPosition option when monthonly option is true.
			     *  - Specifies the position of the year selection element when the monthonly option is true.
			     */
			    "yearsPanelPosition" : "left",
			    /**
			     * Global monthsPanelPosition option when monthonly option is true.
                 *  - Specifies the position of the month selection element when the monthonly option is true.
                 */
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
			 * select 요소에 option 을 덮어쓸지 더할지 여부
			 */
			"append" : true
		},
		"form" : {
			/**
			 * 실시간 데이터 검증을할지 여부
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
             * Multilingual messages
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
             * Sort sort indicator when sort function is activated, You can also enter HTML tags
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
       		"tpBind" : false,
       		/**
             * Multilingual messages
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
             * Miscellaneous settings
             */
			"misc" : {
			    /**
                 * Global misc.resizableCorrectionWidth option
                 *  - The grid body column width and grid header column width may not match when the resizable option is activated.
                 *    At this time, it is an option to correct by increasing or decreasing the value by 0.1.
                 */
				"resizableCorrectionWidth" : N.browser.is("safari") ? -6 : -7,
		        /**
                 * Global misc.resizableLastCellCorrectionWidth option
                 *  - Clicking on the last column may cause other columns to be pushed when the resizable option is enabled in the header fixed grid.
                 *    At this time, it is an option to correct by increasing or decreasing the value by 0.1.
                 */
				"resizableLastCellCorrectionWidth" : 8,
				/**
                 * Global misc.resizeBarCorrectionLeft option
                 *  - The left position of the resize bar may not be centered relative to the column border when the resizable option is activated. At this time,
                 *    it is an option to correct by increasing or decreasing the value by 0.1.
                 */
				"resizeBarCorrectionLeft" : N.browser.is("firefox") ? -1 : N.browser.is("safari") ? 1 : 0,
		        /**
                 * Global misc.resizeBarCorrectionHeight option
                 *  - The height of the resizing bar may not be full when the resizable option is activated.
                 *    At this time, it is an option to correct by increasing or decreasing the value by 0.1.
                 */
				"resizeBarCorrectionHeight" : 0,
				/**
                 * Global misc.fixedcolHeadMarginTop option
                 *  - The top position of the fixed header cell(th) may not match when the fixedcol option is activated.
                 *    At this time, it is an option to correct by increasing or decreasing the value by 0.1.
                 */
				"fixedcolHeadMarginTop" : N.browser.is("ie") || N.browser.is("firefox") ? 1 : 2,
		        /**
                 * Global misc.fixedcolHeadMarginLeft option
                 *  - The left position of the fixed header cell(th) may not match when the fixedcol option is activated.
                 *    At this time, it is an option to correct by increasing or decreasing the value by 0.1.
                 */
				"fixedcolHeadMarginLeft" : N.browser.is("ie") || N.browser.is("firefox") ? -1 : 0,
		        /**
                 * Global misc.fixedcolHeadHeight option
                 *  - The height of the fixed header cell(th) may not match when the fixedcol option is activated.
                 *    At this time, it is an option to correct by increasing or decreasing the value by 0.1..
                 */
				"fixedcolHeadHeight" : N.browser.is("ie") || N.browser.is("firefox") ? 0 : -1,
		        /**
                 * Global misc.fixedcolBodyMarginTop option
                 *  - The top position of the fixed body cell(td) may not match when the fixedcol option is activated.
                 *    At this time, it is an option to correct by increasing or decreasing the value by 0.1.
                 */
				"fixedcolBodyMarginTop" : N.browser.is("ie") ? -0.5 : N.browser.is("firefox") ? -1 : 0,
		        /**
                 * Global misc.fixedcolBodyMarginLeft option
                 *  - The left position of the fixed body cell(td) may not match when the fixedcol option is activated.
                 *    At this time, it is an option to correct by increasing or decreasing the value by 0.1.
                 */
				"fixedcolBodyMarginLeft" : N.browser.is("ie") || N.browser.is("firefox") ? -1 : 0,
		        /**
                 * Global misc.fixedcolBodyBindHeight option
                 *  - The height of the fixed body cell(td) may not match when the fixedcol option is activated.
                 *    At this time, it is an option to correct by increasing or decreasing the value by 0.1.
                 */
				"fixedcolBodyBindHeight" : N.browser.is("ie") ? 1.3 : 1,
		        /**
                 * Global misc.fixedcolBodyAddHeight option
                 *  - The height of the cell(td) of the added row may not match when the fixedcol option is activated.
                 *    At this time, it is an option to correct by increasing or decreasing the value by 0.1.
                 */
				"fixedcolBodyAddHeight" : 1,
				/**
                 * Global misc.fixedcolRootContainer option
                 *  - After creating a grid instance by applying the fixed col option, the grid shape may break when the height of the element wrapping the grid is dynamically changed.
                 *    At this time, if you specify the element whose height is changed in this option, the grid shape will not be broken.
                 *  - Specify an element with the jQuery selector string.
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
             * Global alwaysOnTop option
             *  - If set to true, The message dialog is always displayed at the top.
             */
			"alwaysOnTop" : true,
			/**
             * Multilingual messages
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
		    /**
             * Global alwaysOnTop option
             *  - If set to true, The menu list dialog is always displayed at the top.
             */
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
			/**
             * Multilingual messages
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

	/**
     * Natural-TEMPLATE Config
     */
    N.context.attr("template", {
        aop : {
            /**
             * 공통코드 조회 정보
             *
             * @codeUrl 공통코드 조회 URL
             * @codeKey 그룹코드 프로퍼티 명
             */
            codes : {
                codeUrl : "sample/code/getSampleCodeList.json",
                codeKey : "code"
            }
        },
        /**
         * 다국어 메시지
         */
        "message" : {
            "ko_KR" : {
                "MSG-0001" : "data 옵션을 정의 해 주세요.",
                "MSG-0002" : "서버 오류가 발생하여 공통 코드 목록을 조회 하지 못했습니다.",
                "MSG-0003" : "데이터 코드 목록을 조회하는 N.comm({0}) 이 없습니다.",
                "MSG-0004" : "서버 오류가 발생하여 데이터 코드 목록을 조회 하지 못했습니다.",
                "MSG-0005" : "컴포넌트({0})가 잘못 지정 되었습니다.",
                "MSG-0006" : "이벤트({0})가 잘못 지정 되었습니다."
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
             * Specifies whether to stop the logic by throwing an ERROR when a code of ERROR type is detected.
             */
            abortOnError : false,
            /**
             * Defines the statements to exclude from the scan as a string.
             *
             * If the detected code contains the following string, it is excluded.
             *  ex) excludes : [ ".index-header", ".page-header", ".index-lefter", ".index-contents", ".index-footer" ]
             */
            excludes : [
                ".index-header",
                ".page-header",
                ".index-lefter",
                ".index-contents",
                ".index-footer"
            ],
            /**
             * Multilingual Message
             */
            "message" : {
                "ko_KR" : {
                    "NoContextSpecifiedInSelector" : 'Controller object 의 함수 안 에서 요소를 선택할 때는 반드시 $() 나 N() 함수의 두번째 인자(context)에 view 요소를 입력 하거나 view 요소에서 find 해야 합니다. '
                        + 'view(context) 요소를 입력하지 않으면 다른 View 의 요소까지 선택 되어 의도하지 않은 오류가 발생 할 수 있습니다. '
                        + '\nex) N("selector", cont.view).hide();'
                        + '\n    cont.view.find("selector").hide();',
                    "UseTheComponentsValMethod" : 'jQuery 의 val 메서드로 입력 요소의 value 속성 값을 변경하면 컴포넌트에 바인드 되어 있는 데이터는 업데이트 되지 않습니다. '
                        + '컴포넌트의 내부 데이터와 연동 된 입력 요소들은 적용 된 데이터 관련 컴포넌트(N.form, N.grid 등)에서 제공하는 val 메서드를 사용해야 합니다.'
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

	// Natural-JS API 메뉴얼 용 advisors
	N.context.attr("architecture").cont.advisors.push({ // md 파일 변환
        "pointcut" : ".view-markdown:^init$",
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
        "pointcut" : ".view-apidemo:^init$",
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
        "pointcut" : ".view-mobile-layout:^init$",
        "adviceType" : "before",
        "fn" : function(cont, fnChain, args){
            N(window).trigger("resize.mobile", [ cont.view ]);
        }
    }, { // 소스보기 버튼 처리
        "pointcut" : ".view-code:^init$",
        "adviceType" : "before",
        "fn" : function(cont, fnChain, args){ /* cont 컨트롤러, fnChain 함수명, args 인자 */
            var view = args[0];
            var url = cont.request.get("url");

            var btnEle = N('<br><a class="click">View Source Code</a>');
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
    });

})(N);