(function(window, $) {
	var version = "0.5.1.6";

	// NTR local variables
	$.fn.extend(NTR, {
		"Natural-DATA" : version
	});

	$.extend(NTR.fn, {
		constructor : NTR,
		datafilter : function(queryString) {
			return NTR.data.filter(this, queryString);
		},
		datarefine : function(listId) {
			return NTR.data.refine(this, listId);
		},
		datasort : function(key, reverse) {
			return NTR.data.sort(this, key, reverse);
		},
		formater : function(row) {
			return new NTR.formater(this, row);
		},
		validator : function(row) {
			return new NTR.validator(this, row);
		}
	});
	$.fn.extend(NTR.fn);

	NTR.data = {
		refine : function(obj, listId) {
			if (N.isWrappedSet(obj)) {
				if (obj.length == 1) {
					if (N.isPlainObject(obj.get(0))) {
						return NTR(this.refine(obj.get(0), listId));
					} else {
						return obj;
					}
				} else {
					return NTR(this.refine(obj.toArray(), listId));
				}
			} else {
				if (listId != null) {
					return obj[listId] || [];
				} else {
					for ( var key in obj) {
						return N.isNumeric(key) ? obj : obj[key];
					}
				}
			}
		},
		filter : function(arr, queryString) {
			if (queryString == null) {
				return arr;
			}
			return N.isWrappedSet(arr) ? NTR(this.filter(arr.toArray(), queryString)) : $.grep(arr, function(data) {
				return eval(queryString);
			});
		},
		sortBy : function(key, reverse) {
			if (reverse === undefined) {
				reverse = 1;
			} else {
				if(reverse) {
					reverse = -1;
				} else {
					reverse = 1;
				}
			}

			return function(a, b) {
				a = N.string.trimToEmpty(String(a[key])).replace(/-|\./g, "");
				b = N.string.trimToEmpty(String(b[key])).replace(/-|\./g, "");
				if (parseInt(a) && parseInt(b)) {
					a = parseInt(a);
					b = parseInt(b);
				}
				if (a < b) {
					return reverse * -1;
				}
				if (a > b) {
					return reverse * 1;
				}
				return 0;
			};
		},
		sort : function(arr, key, reverse) {
			return N.isWrappedSet(arr) ? NTR(arr.sort(this.sortBy(key, reverse))) : arr.sort(this.sortBy(key, reverse));
		}
	};

	(function(N) {
		//DataSync
		var DataSync = N.ds = function(instance, addFlag) {
			if (N.ds.caller != N.ds.instance) {
				throw new Error("[N.datasync]There is no public constructor for N.ds, use instance method");
			}

			this.obserable = new Array();
			this.instance = instance;

			var viewContext = N(instance.options.context).closest(".view_context__");
			if(viewContext.length == 0) {
				var dataSyncTemp = N(N.context.attr("architecture")["page"]["context"]).find("var#data_sync_temp__");
				if(dataSyncTemp.length == 0) {
					dataSyncTemp = N(N.context.attr("architecture")["page"]["context"]).append('<var id="data_sync_temp__"></var>').find("var#data_sync_temp__");
				}
				viewContext = dataSyncTemp;
			}
			if (viewContext.data("ds_instance__") !== undefined) {
				if(addFlag !== undefined && addFlag) {
					viewContext.data("ds_instance__").obserable.push(instance);
				}
				return viewContext.data("ds_instance__");
			}

			this.obserable.push(instance);
			viewContext.data("ds_instance__", this);

			return this;
		}
		DataSync.fn = DataSync.prototype;

		$.extend(DataSync.fn, {
			"remove" : function() {
				var instance = this.instance;
				for (var i = 0; i < this.obserable.length; i++) {
					if (this.obserable[i] == instance) {
						this.obserable.splice(i, 1);
					}
				}
				return this;
			},
			"notify" : function(row, key) {
				var instance = this.instance;
				if (instance != null) {
					for (var i = 0; i < this.obserable.length; i++) {
						if (instance !== this.obserable[i] && instance.options.data === this.obserable[i].options.data) {
							this.obserable[i].update(row, key);
						}
					}
				}
				return this;
			}
		});
		$.extend(DataSync, {
			//singleton
			"instance" : function(instance) {
				return new N.ds(instance);
			}
		});

		// Formater
		var Formater = N.formater = function(obj, rules) {
			this.options = {
				data : N.isPlainObject(obj) ? N(obj) : obj,
				rules : rules,
				isElement : false,
				createEvent : true,
				context : null,
				targetEle : N()
			};

			if (N.isElement(rules) || N.isString(rules)) {
				var opts = this.options;
				opts.isElement = true;
				opts.context = N(rules);
				if (obj.length > 0) {
					if (obj[0][opts.context.attr("id")] !== undefined) {
						opts.targetEle.push(opts.context.get(0));
					} else {
						for ( var k in obj[0]) {
							if (opts.context.find("#" + k).length > 0) {
								opts.targetEle.push(opts.context.find("#" + k).get(0));
							}
						}
					}
					opts.rules = N.element.toRules(opts.targetEle, "format");
				}
			}
		};
		Formater.fn = Formater.prototype;
		$.extend(Formater.fn, {
			"format" : function(row) {
				var opts = this.options;
				var this_ = this;
				var retArr = new Array();
				var retObj;
				var tempValue;
				var ele;
				if (row !== undefined) {
					if (row < opts.data.length && row >= 0) {
						opts.data = [ opts.data[row] ];
					} else {
						N.error("[Formater.fn.format]Row index out of range");
					}
				} else {
					if (opts.isElement) {
						row = 0;
						opts.data = [ opts.data[row] ];
					}
				}
				N(opts.data).each(function(i, obj) {
					retObj = new Object();
					for ( var k in opts.rules ) {
						tempValue = String(obj[k]);
						N(opts.rules[k]).each(function() {
							try {
								tempValue = Formater[N.string.trimToEmpty(this[0]).toLowerCase()](tempValue, N(this).remove_(0).toArray());
							} catch (e) {
								if (e.toString().indexOf("is not a function") > -1) {
									N.error("[Formater.fn.format]\"" + this[0] + "\" is invalid format rule");
								} else {
									N.error(e, e);
								}
							}
						});
						retObj[k] = tempValue;
						if (opts.isElement) {
							var ele = opts.targetEle.filter("#" + k);
							if (ele.is("input:text, textarea")) {
								ele.val(tempValue);
								if(opts.createEvent) {
									ele.unbind("format.formater unformat.formater");
									ele.bind("format.formater", function() {
										ele = opts.context.filter("#" + $(this).attr("id"));
										if(ele.length === 0) {
											ele = opts.context.find("#" + $(this).attr("id"));
										}
										N(this).val(this_.format()[row][$(this).attr("id")]);
									}).bind("unformat.formater", function() {
										N(this).val(this_.unformat(row, $(this).attr("id")));
									});
								}
							} else {
								if(!ele.is(":input")) {
									ele.text(tempValue);
								}
							}
						}
						tempValue = null;
					}
					retArr.push(retObj);
					retObj = null;
				});
				return retArr;
			},
			"unformat" : function(row, key) {
				return this.options.data[row][key];
			}
		});

		$.extend(Formater, {
			"commas" : function(str, args) {
				if (N.isEmptyObject(str)) {
					return str;
				}
				str = str.replace(/,/g, "");
				var reg = /(^[+-]?\d+)(\d{3})/;
				str += '';
				while (reg.test(str)) {
					str = str.replace(reg, '$1' + ',' + '$2');
				}
				return str;
			},
			"ssn" : function(str, args) {
				if (N.isEmptyObject(str)) {
					return str;
				}
				str = str.replace(/-/g, "");
				if (str.length == 13) {
					var strToPad = "*";
					if (args != null && args[1] != null) {
						strToPad = args[1];
					}
					if (args != null && args[0] != null) {
						str = N.string.rpad(str.substring(0, 13 - Number(args[0])), 13, strToPad);
						str = str.substring(0, 6) + "-" + str.substring(6, 13);
					} else {
						str = str.substring(0, 6) + "-" + str.substring(6, 13);
					}
				}
				return str;
			},
			"cno" : function(str, args) {
				if (N.string.trimToEmpty(str).length < 5) {
					return str;
				}
				str = str.replace(/-/g, "");
				str = str.replace(/\s/g, "");
				if (str.length > 10) {
					str = str.substring(0, 10);
				}
				return str.substring(0, 3) + "-" + str.substring(3, 5) + "-" + str.substring(5, 10);
			},
			"upper" : function(str, args) {
				if (N.isEmptyObject(str)) {
					return str;
				}
				return str.toUpperCase();
			},
			"lower" : function(str, args) {
				if (N.isEmptyObject(str)) {
					return str;
				}
				return str.toLowerCase();
			},
			"capitalize" : function(str, args) {
				if (N.isEmptyObject(str)) {
					return str;
				}
				var result = str.substring(0, 1).toUpperCase();
				if (str.length > 1) {
					result = result + str.substring(1);
				}
				return result;
			},
			"zipcode" : function(str, args) {
				if (N.isEmptyObject(str)) {
					return str;
				}
				str = str.replace(/-/g, "");
				return str.substring(0, 3) + "-" + str.substring(3, 6);
			},
			"phoneNum" : function(str, args) {
				if (N.isEmptyObject(str)) {
					return str;
				}
				str = str.replace(/-/g, "");
				return str.replace(/(^02.{0}|^01.{1}|[0-9]{3})([0-9]+)([0-9]{4})/, "$1-$2-$3");
			},
			"realnum" : function(str, args) {
				try {
					str = String(parseFloat(str));
				} catch (e) {
					return str;
				}
				return str == "NaN" ? str.replace("NaN", "") : str;
			},
			"trimtoempty" : function(str, args) {
				return N.string.trimToEmpty(str);
			},
			"trimtozero" : function(str, args) {
				return N.string.trimToZero(str);
			},
			"trimtoval" : function(str, args) {
				if (args == null || args[0] == null) {
					N.error("[Formater.trimToVal]You must input args[0](default value)");
				}
				return N.string.trimToVal(str, args[0]);
			},
			"date" : function(str, args) {
				str = N.string.trimToEmpty(str);
				var format = N.context.attr("data")["formater"]["date"]["Ymd"]();
				if (args != null && args[0] != null) {
					if (args[0] == "day" && this.$input != null) {
						// TODO
						var $input = this.$input;
						$input.css("cursor", "pointer");
						var thisInputFocusout = null;

						var numberOfMonths = 1;
						if (typeof args[1] != "undefined" && args[1] != null) {
							numberOfMonths = Number(args[1]);
						}

						$input.datepicker({
							yearRange : "-100:+50",
							showOtherMonths : true,
							selectOtherMonths : true,
							showButtonPanel : true,
							showMonthAfterYear : true,
							changeMonth : true,
							changeYear : true,
							numberOfMonths : numberOfMonths,
							dateFormat : Config.datepickerServerDateFormat,
							duration : 0,
							beforeShow : function(event, ui) {
								setTimeout(function() {
									ui.dpDiv.css("z-index", LayerUtils.maxZindex());
								}, 30);
								if ($input.prop("readonly")) {
									return false;
								}
								if ($(this).data("events") != null && $(this).data("events")["focusout"] != null) {
									thisInputFocusout = $(this).data("events")["focusout"];
									try {
										delete $(this).data("events").focusout;
									} catch (e) {
										$(this).data("events").focusout = undefined;
									}
								}
								$(this).unbind("keydown");
								if (Config.datePickerUnloadKeyEvents) {
									$(this).unbind("keypress");
									$(this).unbind("keyup");
								}
							},
							onClose : function(dateText, inst) {
								$this = $(this);
								if ($this.data("events") != null) {
									$this.data("events").focusout = thisInputFocusout;
								}
								thisInputFocusout = null;

								// document 영역 클릭시 input의 focusout 보다 먼저 실행되어 포멧팅이 풀림.
								// 나중에 실행되게 처리
								setTimeout(function() {
									if (N.string.trimToNull($this.val()) != null) {
										$this.val($this.val().replace(new RegExp(N.context.attr("data")["formater"]["date"]["dateSepa"], "gi"), "").substring(0, 8));
									}
									$this.trigger("focusout.BindFields.bindDataList");
									$this.trigger("focusout.format");

									// for HYIN
									$this.removeClass("txt_on");
								}, 120);
							},
							onChangeMonthYear : function(year, month, inst) {
								setTimeout(function() {
									inst.dpDiv.find("a:not('.ui-priority-secondary')").each(function() {
										if (Number($(this).text()) == inst.selectedDay) {
											$(this).addClass("ui-state-active");
										}
									});
								}, 30);
							}
						});
						$input.addClass("calendarField");
						format = N.context.attr("data")["formater"]["date"]["Ymd"]();
					} else if (args[0] == "month" && this.$input != null) {
						// TODO
						var thisInputFocusout = null;
						this.$input.monthpicker({
							beforeShow : function($input) {
								if ($input.prop("readonly")) {
									return false;
								}
								if ($input.data("events") != null && $input.data("events")["focusout"] != null) {
									thisInputFocusout = $input.data("events")["focusout"];
									try {
										delete $input.data("events").focusout;
									} catch (e) {
										$input.data("events").focusout = undefined;
									}
								}
							},
							onClose : function($input, container) {
								if ($input.data("events") != null) {
									$input.data("events").focusout = thisInputFocusout;
								}
								thisInputFocusout = null;

								$input.focusout();
							}
						});
						this.$input.addClass("calendarField");
						format = N.context.attr("data")["formater"]["date"]["Ym"]();
					} else if (args[0] == '6') {
						format = N.context.attr("data")["formater"]["date"]["Ym"]();
					} else if (args[0] == '8') {
						format = N.context.attr("data")["formater"]["date"]["Ymd"]();
					} else if (args[0] == '10') {
						format = N.context.attr("data")["formater"]["date"]["YmdH"]();
					} else if (args[0] == '12') {
						format = N.context.attr("data")["formater"]["date"]["YmdHi"]();
					} else if (args[0] == '14') {
						format = N.context.attr("data")["formater"]["date"]["YmdHis"]();
					} else {
						format = args[0];
					}
				}
				return Number(str) != 0 ? N.date.format(str, format) : "";
			},
			"time" : function(str, args) {
				str = str.replace(/:/g, "");
				if (N.string.trimToEmpty(str) > 6) {
					str = N.string.rpad(str, 6, "0");
				} else {
					str = str.substring(0, 6);
				}
				if (args != null && args[0] != null && args[0] == '2') {
					str = str.substring(0, 2);
				} else if (args != null && args[0] != null && args[0] == '4') {
					str = str.substring(0, 2) + N.context.attr("data")["formater"]["date"]["timeSepa"] + str.substring(2, 4);
				} else if (args != null && args[0] != null && args[0] == '6') {
					str = str.substring(0, 2) + N.context.attr("data")["formater"]["date"]["timeSepa"] + str.substring(2, 4)
							+ N.context.attr("data")["formater"]["date"]["timeSepa"] + str.substring(4, 6);
				} else {
					str = str.substring(0, 2) + N.context.attr("data")["formater"]["date"]["timeSepa"] + str.substring(2, 4);
				}

				return str;
			},
			"limit" : function(str, args) {
				if (args == null || args[0] == null) {
					N.error("[Formater.limit]You must input args[0](cut length)");
				}
				if(str.substr(str.length - args[1].length, args[1].length) !== args[1]) {
					if (this.$input) {
						this.$input.attr("title", str);
					}
					var l = 0;
					for (var i = 0; i < str.length; i++) {
						l += (str.charCodeAt(i) > 128) ? 2 : 1;
						if (l > args[0]) {
							if (args != null && args[1] != null) {
								return N.string.trimToEmpty(str.substring(0, i)) + args[1];
							} else {
								return str.substring(0, i);
							}
						}
					}
				}
				return str;
			},
			"replace" : function(str, args) {
				if (args == null || args[0] == null) {
					N.error("[Formater.replace]You must input args[0](target string)");
				}
				if (args == null || args[1] == null) {
					N.error("[Formater.replace]You must input args[1](replace string)");
				}
				var replaceStr = str.split(String(args[0])).join(String(args[1]));
				if (typeof args[2] != "undefined" && String(args[2]) == "true") {
					this.vo[this.$input.attr("name")] = replaceStr;
				}
				return replaceStr;
			},
			"lpad" : function(str, args) {
				if (args == null || args[0] == null) {
					N.error("[Formater.lpad]You must input args[0](fill length)");
				}
				if (args == null || args[1] == null) {
					N.error("[Formater.lpad]You must input args[1](replace string)");
				}
				return N.string.lpad(str, Number(args[0]), args[1]);
			},
			"rpad" : function(str, args) {
				if (args == null || args[0] == null) {
					N.error("[Formater.rpad]You must input args[0](fill length)");
				}
				if (args == null || args[1] == null) {
					N.error("[Formater.rpad]You must input args[1](replace string)");
				}
				return N.string.rpad(str, Number(args[0]), args[1]);
			},
			"generic" : function(str, args) {
				if (args == null || args[0] == null) {
					N.error("[Formater.generic]You must input args[0](user format rule)");
				}
				var mask = new N.Mask(args[0]);
				return mask.setGeneric(String(str));
			},
			"numeric" : function(str, args) {
				if (args == null || args[0] == null) {
					N.error("[Formater.numeric]You must input args[0](user format rule)");
				}
				var mask = new N.Mask(args[0]);
				return mask.setNumeric(String(str), args[1]);
			}
		});

		// Validator
		// TODO 전체 validation 룰 테스트 해봐야 함.
		var Validator = N.validator = function(obj, rules) {
			this.options = {
				data : N.isPlainObject(obj) ? N(obj) : obj,
				rules : rules,
				isElement : false,
				createEvent : true,
				context : null,
				targetEle : null
			};

			if (N.isElement(rules) || N.isString(rules)) {
				var opts = this.options;
				opts.isElement = true;
				opts.context = N(rules);
				opts.targetEle = opts.context.is(":input") ? opts.context : opts.context.find(":input");
				var this_ = this;
				opts.targetEle = opts.targetEle.map(function() {
					if($(this).attr("class") !== undefined && $(this).attr("class").indexOf("\"validate\"") > -1) {
						if(opts.createEvent) {
							var ele = $(this);
							ele.unbind("validate.validator");
							ele.bind("validate.validator", function() {
								N().validator(N(this)).validate();
							});
						}
						return this;
					}
				});
				opts.rules = N.element.toRules(opts.targetEle, "validate");
			}

			this.options.data = obj.length > 0 ? obj : N(N.element.toData(this.options.targetEle));
		};
		Validator.fn = Validator.prototype;
		$.extend(Validator.fn, {
			"validate" : function(row) {
				var opts = this.options;
				var retArr = new Array();
				var retObj;
				var retTempObj;
				var retTempArr;
				var data = opts.data.length > 0 ? opts.data : N(N.element.toData(opts.targetEle));
				if (row !== undefined) {
					if (row < data.length && row >= 0) {
						data = [ data[row] ];
					} else {
						N.error("[Validator.fn.validate]Row index out of range");
					}
				} else {
					if (opts.isElement) {
						row = 0;
						data = [ data[row] ];
					}
				}

				var args;
				var alert;
				var rule;
				N(data).each(function(i, obj) {
					retObj = new Object();
					for ( var k in opts.rules ) {
						retTempArr = new Array();
						var pass = true;
						N(opts.rules[k]).each(function() {
							retTempObj = new Object();
							retTempObj["rule"] = this.toString();
							args = N(this).remove_(0).toArray();
							rule = N.string.trimToEmpty(this[0]).toLowerCase();
							if (rule.indexOf("+") > -1) {
								rule = rule.split("+").sort().toString().replace(/\,/g, "_");
							}
							try {
								retTempObj["result"] = Validator[rule](String(obj[k]), args);
							} catch (e) {
								if (e.toString().indexOf("is not a function") > -1) {
									N.error("[Validator.fn.validate]\"" + this[0] + "\" is invalid format rule");
								} else {
									N.error(e, e);
								}
							}
							retTempObj["msg"] = null;
							if (!retTempObj["result"]) {
								var valiMsg;
								if (!(valiMsg = N.context.attr("data")["validator"]["message"][N.locale()][rule])) {
									valiMsg = N.context.attr("data")["validator"]["message"][N.locale()]["global"];
								}
								retTempObj["msg"] = N.message.replaceMsgVars(valiMsg, args);

								pass = false;
							}
							retTempArr.push(retTempObj);
						});
						if (opts.isElement) {
							var ele = opts.targetEle.filter("#" + k);
							if(!pass) {
								ele.addClass("validate_false__");
							} else {
								ele.removeClass("validate_false__");
							}
							if (N().alert !== undefined) {
								alert = N(opts.targetEle != null ? ele : undefined).alert(N(retTempArr).map(function() {
									if (this.msg != null) {
										return this.msg;
									}
								}).get()).show();
							} else {
								N.error("You must import Natural-UI library");
							}
						}
						retObj[k] = retTempArr;
					}
					retArr.push(retObj);
					retObj = null;
				});
				return retArr;
			}
		});
		$.extend(Validator, {
			"required" : function(str) {
				return (N.string.trimToNull(str) != null) ? true : false;
			},
			"alphabet" : function(str) {
				return new RegExp(/^[a-z\s]+$/i).test(str);
			},
			"integer" : function(str) {
				return new RegExp(/^[+-]?\d+$/).test(str);
			},
			"korean" : function(str) {
				return new RegExp(/^[ㄱ-ㅎ|ㅏ-ㅣ|가-힣\s]+$/).test(str);
			},
			"alphabet_integer" : function(str) {
				return new RegExp(/^[a-z-?\d\s]+$/i).test(str);
			},
			"integer_korean" : function(str) {
				return new RegExp(/^[ㄱ-ㅎ|ㅏ-ㅣ|가-힣-?\d\s]+$/).test(str);
			},
			"alphabet_korean" : function(str) {
				return new RegExp(/^[ㄱ-ㅎ|ㅏ-ㅣ|가-힣a-z\s]+$/i).test(str);
			},
			"alphabet_integer_korean" : function(str) {
				return new RegExp(/^[ㄱ-ㅎ|ㅏ-ㅣ|가-힣a-z-?\d\s]+$/i).test(str);
			},
			"dash_integer" : function(str) {
				return new RegExp(/^(\d|-)+$/).test(str);
			},
			"commas_integer" : function(str) {
				return new RegExp(/^(\d|,)+$/).test(str);
			},
			"number" : function(str) {
				return new RegExp(/^[+-]?(\d|,|\.)+$/).test(str);
			},
			"email" : function(str) {
				return new RegExp(
						/^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)*(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i)
						.test(str);
			},
			"url" : function(str) {
				return new RegExp(
						/^(https?|ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)*(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i)
						.test(str);
			},
			"zipcode" : function(str) {
				return new RegExp(/^\d{3}-\d{3}$/).test(str);
			},
			"decimal" : function(str, args) {
				var length = (args != null && args[0] != null) ? args[0].trim() : 10;
				return new RegExp(/^-?\d+$/).test(str) || new RegExp("^-?\\d*\\.\\d{0," + length + "}$").test(str);
			},
			"phone" : function(str, args) {
				if (args != null && args[0] != null) {
					if (args[0] == "true") {
						return new RegExp(/^\d{2,3}-\d{3,4}-\w+|"("")"$/).test(str);
					}
				}
				return new RegExp(/^\d{2,3}-\d{3,4}-\d{4}$/).test(str);
			},
			"ssn" : function(str, args) {
				str = str.replace(/-/g, '');
				if (N.string.trimToEmpty(str).length != 13) {
					str = null;
					return false;
				}

				var a1 = str.substring(0, 1);
				var a2 = str.substring(1, 2);
				var a3 = str.substring(2, 3);
				var a4 = str.substring(3, 4);
				var a5 = str.substring(4, 5);
				var a6 = str.substring(5, 6);
				var checkdigit = a1 * 2 + a2 * 3 + a3 * 4 + a4 * 5 + a5 * 6 + a6 * 7;

				var b1 = str.substring(6, 7);
				var b2 = str.substring(7, 8);
				var b3 = str.substring(8, 9);
				var b4 = str.substring(9, 10);
				var b5 = str.substring(10, 11);
				var b6 = str.substring(11, 12);
				var b7 = str.substring(12, 13);
				checkdigit = checkdigit + b1 * 8 + b2 * 9 + b3 * 2 + b4 * 3 + b5 * 4 + b6 * 5;

				checkdigit = checkdigit % 11;
				checkdigit = 11 - checkdigit;
				checkdigit = checkdigit % 10;

				if (checkdigit != b7) {
					return false;
				}

				return true;
			},
			"frn" : function(str, args) {
				str = str.replace(/-/g, '');
				if (N.string.trimToEmpty(str).length != 13) {
					str = null;
					return false;
				}
				var sum = 0;

				if (str.substr(6, 1) != 5 && str.substr(6, 1) != 6 && str.substr(6, 1) != 7 && str.substr(6, 1) != 8) {
					return false;
				}
				if (Number(str.substr(7, 2)) % 2 != 0) {
					return false;
				}
				for (var i = 0; i < 12; i++) {
					sum += Number(str.substr(i, 1)) * ((i % 8) + 2);
				}
				if ((((11 - (sum % 11)) % 10 + 2) % 10) == Number(str.substr(12, 1))) {
					return true;
				}
				return false;
			},
			"frn_ssn" : function(str, args) {
				str = str.replace(/-/g, '');
				if (N.string.trimToEmpty(str).length != 13) {
					str = null;
					return false;
				}
				if (Number(str.charAt(6)) >= 5 && Number(str.charAt(6)) <= 8) {
					return this.frn();
				} else {
					return this.ssn();
				}
			},
			"cno" : function(str, args) {
				var re = /-/g;
				var bizID = str.replace(re, '');
				var checkID = new Array(1, 3, 7, 1, 3, 7, 1, 3, 5, 1);
				var i, chkSum = 0, c2, remander;
				for (i = 0; i <= 7; i++) {
					chkSum += checkID[i] * bizID.charAt(i);
				}
				c2 = "0" + (checkID[8] * bizID.charAt(8));
				c2 = c2.substring(c2.length - 2, c2.length);

				chkSum += Math.floor(c2.charAt(0)) + Math.floor(c2.charAt(1));

				remander = (10 - (chkSum % 10)) % 10;

				if (Math.floor(bizID.charAt(9)) == remander) {
					return true;
				}
				return false;
			},
			"cpno" : function(str, args) {
				var re = /-/g;
				var cc = str.replace(re, '');

				if (cc.length != 13) {
					return false;
				}

				var arr_regno = cc.split("");
				var arr_wt = new Array(1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2);
				var iSum_regno = 0;
				var iCheck_digit = 0;

				for (var i = 0; i < 12; i++) {
					iSum_regno += eval(arr_regno[i]) * eval(arr_wt[i]);
				}

				iCheck_digit = 10 - (iSum_regno % 10);

				iCheck_digit = iCheck_digit % 10;

				if (iCheck_digit != arr_regno[12]) {
					return false;
				}
				return true;
			},
			"date" : function(str, args) {
				/*
				 * 날짜포맷에 맞는지 검사
				 */
				var isDateFormat = function(d) {
					if (N.string.trimToEmpty(d).length == 8) {
						return true;
					} else {
						return false;
					}
				};
				/*
				 * 윤년여부 검사
				 */
				var isLeaf = function(year) {
					var leaf = false;
					if (year % 4 == 0) {
						leaf = true;

						if (year % 100 == 0) {
							leaf = false;
						}

						if (year % 400 == 0) {
							leaf = true;
						}
					}
					return leaf;
				};

				var d = str.replace(new RegExp(N.context.attr("data")["formater"]["date"]["dateSepa"], "gi"), '');
				if (!isDateFormat(d)) {
					return false;
				}

				var month_day = [ 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ];

				var year = d.substring(0, 4);
				var month = d.substring(4, 6);
				var day = d.substring(6, 8);

				if (day == 0) {
					return false;
				}

				var isValid = false;

				if (isLeaf(year)) {
					if (month == 2) {
						if (day <= month_day[month - 1] + 1) {
							isValid = true;
						}
					} else {
						if (day <= month_day[month - 1]) {
							isValid = true;
						}
					}
				} else {
					if (day <= month_day[month - 1]) {
						isValid = true;
					}
				}

				return isValid;
			},
			"time" : function(str, args) {
				return new RegExp(/^([01]\d|2[0-3])([0-5]\d){0,2}$/).test(str.replace(/:/g, ""));
			},
			"accept" : function(str, args) {
				if (args == null || args[0] == null) {
					throw new Error("[Validator.accept]You must input args[0](accept string)");
				}
				return (new RegExp("^(" + args[0] + ")$")).test(str);
			},
			"match" : function(str, args) {
				if (args == null || args[0] == null) {
					throw new Error("[Validator.match]You must input args[0](match string)");
				}
				return (new RegExp(args[0])).test(str);
			},
			"acceptfileext" : function(str, args) {
				if (args == null || args[0] == null) {
					throw new Error("[Validator.acceptFileExt]You must input args[0](file extention)");
				}
				return (new RegExp(".(" + args[0] + ")$", "i")).test(str);
			},
			"notaccept" : function(str, args) {
				if (args == null || args[0] == null) {
					throw new Error("[Validator.notAccept]You must input args[0](refused string)");
				}
				return !(new RegExp("^(" + args[0] + ")$")).test(str);
			},
			"notmatch" : function(str, args) {
				if (args == null || args[0] == null) {
					throw new Error("[Validator.notMatch]You must input args[0](unmatch String)");
				}
				return !(new RegExp(args[0])).test(str);
			},
			"notacceptfileext" : function(str, args) {
				if (args == null || args[0] == null) {
					throw new Error("[Validator.notAcceptFileExt]You must input args[0](file extention)");
				}
				return !(new RegExp(".(" + args[0] + ")$", "i")).test(str);
			},
			"equalTo" : function(str, args) {
				if (args == null || args[0] == null) {
					throw new Error("[Validator.equalTo]You must input args[0](selector string(:input))");
				}
				if (N.string.trimToNull($(args[0]).val()) == null) {
					return true;
				}
				return N.string.trimToEmpty(str) == N.string.trimToEmpty($(args[0]).val());
			},
			"maxlength" : function(str, args) {
				if (args == null || args[0] == null) {
					throw new Error("[Validator.maxlength]You must input args[0](length)");
				}
				return N.string.trimToEmpty(str).length <= Number(N.string.trimToZero(args[0]));
			},
			"minlength" : function(str, args) {
				if (args == null || args[0] == null) {
					throw new Error("[Validator.minlength]You must input args[0](length)");
				}
				return Number(N.string.trimToZero(args[0])) <= N.string.trimToEmpty(str).length;
			},
			"rangelength" : function(str, args) {
				if (args == null || args[0] == null) {
					throw new Error("[Validator.rangelength]You must input args[0](minimum length)");
				}
				if (args == null || args[1] == null) {
					throw new Error("[Validator.rangelength]You must input args[1](maximum length");
				}
				return Number(N.string.trimToZero(args[0])) <= N.string.trimToEmpty(str).length
						&& N.string.trimToZero(str).length <= Number(N.string.trimToEmpty(args[1]));
			},
			"maxbyte" : function(str, args) {
				if (args == null || args[0] == null) {
					throw new Error("[Validator.maxbyte]You must input args[0](maximum byte)");
				}
				return N.string.byteLength(N.string.trimToEmpty(str)) <= Number(N.string.trimToZero(args[0]));
			},
			"minbyte" : function(str, args) {
				if (args == null || args[0] == null) {
					throw new Error("[Validator.minbyte]You must input args[0](minimum byte)");
				}
				return Number(N.string.trimToZero(args[0])) <= N.string.byteLength(N.string.trimToEmpty(str));
			},
			"rangebyte" : function(str, args) {
				if (args == null || args[0] == null) {
					throw new Error("[Validator.rangebyte]You must input args[0](minimum byte)");
				}
				if (args == null || args[1] == null) {
					throw new Error("[Validator.rangebyte]You must input args[0](maximum byte)");
				}
				return Number(N.string.trimToZero(args[0])) <= N.string.byteLength(N.string.trimToEmpty(str))
						&& N.string.byteLength(N.string.trimToEmpty(str)) <= Number(N.string.trimToZero(args[1]));
			},
			"maxvalue" : function(str, args) {
				if (args == null || args[0] == null) {
					throw new Error("[Validator.maxvalue]You must input args[0](maximum value)");
				}
				return Number(N.string.trimToZero(str)) <= Number(N.string.trimToZero(args[0]));
			},
			"minvalue" : function(str, args) {
				if (args == null || args[0] == null) {
					throw new Error("[Validator.minvalue]You must input args[0](minimum value)");
				}
				return Number(N.string.trimToZero(args[0])) <= Number(N.string.trimToZero(str));
			},
			"rangevalue" : function(str, args) {
				if (args == null || args[0] == null) {
					throw new Error("[Validator.rangevalue]You must input args[0](minimum value)");
				}
				if (args == null || args[1] == null) {
					throw new Error("[Validator.rangevalue]You must input args[0](maximum value)");
				}
				return Number(N.string.trimToZero(args[0])) <= Number(N.string.trimToZero(str))
						&& Number(N.string.trimToZero(str)) <= Number(N.string.trimToZero(args[1]));
			},
			"regexp" : function(str, args) {
				if (args == null || args[0] == null) {
					throw new Error("[Validator.regexp]You must input args[0](regular expression string)");
				}
				var regExp = args[1] !== undefined ? regExp = new RegExp(args[0], args[1]) : new RegExp(args[0]);
				return regExp.test(str);
			}
		});

	})(NTR);

})(window, jQuery);