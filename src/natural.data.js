/*!
 * Natural-DATA v0.10.56
 *
 * Released under the LGPL v2.1 license
 * Date: 2014-09-26T11:11Z
 *
 * Copyright 2014 KIM HWANG MAN(bbalganjjm@gmail.com)
 */
(function(window, $) {
		N.version["Natural-DATA"] = "0.10.56";

	$.fn.extend($.extend(N.prototype, {
		datafilter : function(callBack) {
			return N.data.filter(this, callBack);
		},
		datarefine : function(listId) {
			return N.data.refine(this, listId);
		},
		datasort : function(key, reverse) {
			return N.data.sort(this, key, reverse);
		},
		formatter : function(row) {
			return new N.formatter(this, row);
		},
		validator : function(row) {
			return new N.validator(this, row);
		}
	}));

	(function(N) {

		N.data = {
			refine : function(obj, listId) {
				if (N.isWrappedSet(obj)) {
					if (obj.length == 1) {
						if (N.isPlainObject(obj.get(0))) {
							return N(this.refine(obj.get(0), listId));
						} else {
							return obj;
						}
					} else {
						return N(this.refine(obj.toArray(), listId));
					}
				} else {
					if (listId !== undefined) {
						return obj[listId] || [];
					} else {
						for ( var key in obj) {
							return N.isNumeric(key) ? obj : obj[key];
						}
					}
				}
			},
			filter : function(arr, condition) {
				if(N.type(condition) === "function") {
					return N.isWrappedSet(arr) ? N($.grep(arr.toArray(), condition)) : $.grep(arr, condition);
				} else if(N.type(condition) === "string") {
					condition = condition.replace(/ /g, "").replace(/\|\|/g, " || item.").replace(/\&\&/g, " || item.");
					var testFn = new Function("item", "return item." + condition);
					return N.isWrappedSet(arr) ? N($.grep(arr.toArray(), function(item) {
						return testFn(item);
					})) : $.grep(arr, function(item) {
						return testFn(item);
					});
				} else {
					return arr;
				}
			},
			sortBy : function(key, reverse) {
				return function(a, b) {
					a = a[key];
					b = b[key];
					if (Number(a) && Number(b)) {
						a = Number(a);
						b = Number(b);
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
				if(reverse) {
					reverse = -1;
				} else {
					reverse = 1;
				}
				return arr.sort(this.sortBy(key, reverse));
			}
		};

		//DataSync
		var DataSync = N.ds = function(inst, isReg) {
			if (N.ds.caller != N.ds.instance) {
				throw new Error("[N.datasync]There is no public constructor for N.ds, use instance method");
			}

			var pageContext = $(N.context.attr("architecture").page.context);
			if(pageContext.length === 0) {
				N.warn("[N.ds]Context element is missing. Please specify the correct Natural-JS's main context element selector to \"N.context.attr(\"architecture\").page.context\" property in \"natural.config.js\" file");
			}
			var dataSyncTemp = pageContext.find("var#data_sync_temp__");
			if(dataSyncTemp.length === 0) {
				dataSyncTemp = pageContext.append('<var id="data_sync_temp__"></var>').find("var#data_sync_temp__");
			}
			this.viewContext = dataSyncTemp;

			var siglInst = this.viewContext.instance("ds");
			if (siglInst !== undefined) {
				siglInst.inst = inst;
				if(isReg !== undefined && isReg === true) {
					siglInst.observable.push(inst);
				}
			} else {
				siglInst = this;
				siglInst.inst = inst;
				siglInst.observable = [];
				siglInst.observable.push(inst);
				this.viewContext.instance("ds", siglInst);
			}

			return siglInst;
		};

		$.extend(DataSync, {
			//singleton
			"instance" : function(inst, isReg) {
				return new N.ds(inst, isReg);
			}
		});

		$.extend(DataSync.prototype, {
			"remove" : function() {
				var inst = this.inst;
				var observable = this.observable;
				if (inst && observable) {
					for (var i = 0; i < observable.length; i++) {
						if (observable[i] == inst) {
							observable.splice(i, 1);
						}
					}
				}
				return this;
			},
			"notify" : function(row, key) {
				var inst = this.inst;
				var observable = this.observable;
				if (inst && observable) {
					for (var i = 0; i < observable.length; i++) {
						if (inst !== observable[i] && inst.options.data === observable[i].options.data) {
							if(observable[i] instanceof N.form) {
								if(row === observable[i].row()) {
									observable[i].update(row, key);
								}
							} else {
								observable[i].update(row, key);
							}
						}
					}
				}
				return this;
			}
		});

		// Formatter
		var Formatter = N.formatter = function(obj, rules) {
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

		$.extend(Formatter, {
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
			/**
			 * Resident registration number
			 */
			"rrn" : function(str, args) {
				if (N.isEmptyObject(str)) {
					return str;
				}
				str = str.replace(/-/g, "");
				if (str.length == 13) {
					var strToPad = "*";
					if (args !== undefined && args[1] !== undefined) {
						strToPad = args[1];
					}
					if (args !== undefined && args[0] !== undefined) {
						str = N.string.rpad(str.substring(0, 13 - Number(args[0])), 13, strToPad);
						str = str.substring(0, 6) + "-" + str.substring(6, 13);
					} else {
						str = str.substring(0, 6) + "-" + str.substring(6, 13);
					}
				}
				return str;
			},
			/**
			 * Resident registration number or US Social Security Number
			 * TODO Later, "rrn"(Resident registration number) check logic will be removed
			 */
			"ssn" : function(str, args) {
				if (str.length === 13) {
					return this.rrn(str, args);
				} else if (str.length === 9) {
					str = str.replace(/-/g, "");
					return str.substr(0, 3) + "-" + str.substr(3, 2) + "-" + str.substr(5, 4);
				}
				return str;
			},
			/**
			 * Korean business registration number
			 */
			"kbrn" : function(str, args) {
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
			/**
			 * Deprecated.
			 * Use kbrn rule.
			 */
			"cno" : function(str, args) {
				return this.kbrn(str);
			},
			/**
			 * Korean corporation number
			 */
			"kcn" : function(str, args) {
				return this.rrn(str);
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
			"phone" : function(str, args) {
				if (N.isEmptyObject(str)) {
					return str;
				}
				str = str.replace(/-/g, "");
				return str.replace(/(^02.{0}|^01.{1}|[0-9]{3})([0-9]+)([0-9]{4})/, "$1-$2-$3");
			},
			/**
			 * Deprecated 2017.07.26
			 * phonenum to phone
			 */
			"phonenum" : function(str, args) {
				return this.phone(str, args);
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
				if (args === undefined || args[0] === undefined) {
					throw N.error("[N.formatter.trimtoval]You must input args[0](default value)");
				}
				return N.string.trimToVal(str, args[0]);
			},
			"date" : function(str, args, ele) {
				if(args === undefined) {
					return str;
				}
				str = str.replace(/[^0-9]/g, "");

				//use datepicker, monthpicker
				if(N.datepicker !== undefined) {
					if(args[1] !== undefined && (args[1] === "date" || args[1] === "month") && ele !== undefined && !ele.hasClass("datepicker__") && ele.is("input")) {
						var isMonth = args[1] === "month" ? true : false;
						var dateVal;
						var formInst;
						var colId;

						var options = {
							monthonly : isMonth
						};

						if(args[2] !== undefined) {
							$.extend(options, args[2]);
						}
						var datepicker = ele.datepicker(options);
						var opts = datepicker.options;

						var orgOnBeforeShow = opts.onBeforeShow;
						opts.onBeforeShow = function(context, contents) {
							if(contents.closest(".view_context__").length > 0
									&& !(contents.closest(".view_context__").css("position") === "relative"
										|| contents.closest(".view_context__").css("position") === "absolute"
										|| contents.closest(".view_context__").css("position") === "sticky")) {
								contents.closest(".view_context__").css("position", "relative");
								contents.closest(".context_wrap__").css("position", "relative");
								this.isApplyRelative = true;
							} else {
								this.isApplyRelative = false;
							}
							// for md format without Y format
							context.trigger("unformat");

							if(orgOnBeforeShow !== null) {
								return orgOnBeforeShow.apply(this, arguments);
							}
						};

						var orgOnSelect = opts.onSelect;
						opts.onSelect = function(context, date, monthonly) {
							dateVal = date.obj.formatDate(monthonly ? "Ym" : "Ymd");

							context.parents(".form__").each(function() {
								formInst = $(this).instance("form");
								if(formInst !== undefined) {
									return false;
								}
							});

							colId = context.attr("id");
							if(formInst !== undefined && dateVal !== formInst.val(colId)) {
								formInst.val(colId, dateVal);
							}

							if(orgOnSelect !== null) {
								return orgOnSelect.apply(this, arguments);
							}
						};

						var orgOnBeforeHide = opts.onBeforeHide;
						opts.onBeforeHide = function(context, contents) {
							if(dateVal !== undefined && colId !== undefined && formInst !== undefined) {
								context.trigger("focusout.dataSync.form").trigger("focusout.form.format");
							}

							if(orgOnBeforeHide !== null) {
								return orgOnBeforeHide.apply(this, arguments);
							}
						};

						var orgOnHide = opts.onHide;
						opts.onHide = function(context, contents) {
							if(this.isApplyRelative === true) {
								context.closest(".context_wrap__").css("position", "");
								context.closest(".view_context__").css("position", "");
								this.isApplyRelative = false;
							}

							if(orgOnHide !== null) {
								return orgOnHide.apply(this, arguments);
							}
						};

						if(opts.yearChangeInput) {
							var orgOnChangeYear = opts.onChangeYear;
							opts.onChangeYear = function() {
								opts.context.trigger("focusout.dataSync.form");
								if(orgOnChangeYear !== null) {
									return orgOnChangeYear.apply(this, arguments);
								}
							};
						}

						if(opts.monthChangeInput) {
							var orgOnChangeMonth = opts.onChangeMonth;
							opts.onChangeMonth = function() {
								opts.context.trigger("focusout.dataSync.form");
								if(orgOnChangeMonth !== null) {
									return orgOnChangeMonth.apply(this, arguments);
								}
							};
						}
					}
				} else {
					N.warn("if you use date or month option, you must import Natural-UI library");
				}

				if (args[0] !== undefined) {
					var formats = N.context.attr("data").formatter.date;
					var val;

					if(N.type(args[0]) === "number") {
						if (args[0] === 4) {
							val = N.date.format(str, "Y");
						} else if (args[0] === 6) {
							val = N.date.format(str, formats.Ym());
						} else if (args[0] === 8) {
							val = N.date.format(str, formats.Ymd());
						} else if (args[0] === 10) {
							val = N.date.format(str, formats.YmdH());
						} else if (args[0] === 12) {
							val = N.date.format(str, formats.YmdHi());
						} else if (args[0] === 14) {
							val = N.date.format(str, formats.YmdHis());
						} else {
							val = N.date.format(str, formats.Ymd());
						}
					} else {
						val = N.date.format(str, args[0]);
					}

					return Number(str) > 0 ? val : "";
				}
			},
			"time" : function(str, args) {
				str = str.replace(/[^0-9]/g, "");
				if (N.string.trimToEmpty(str) > 6) {
					str = N.string.rpad(str, 6, "0");
				} else {
					str = str.substring(0, 6);
				}
				if (args !== undefined && args[0] !== undefined && args[0] == '2') {
					str = str.substring(0, 2);
				} else if (args !== undefined && args[0] !== undefined && args[0] == '4') {
					str = str.substring(0, 2) + N.context.attr("data").formatter.date.timeSepa + str.substring(2, 4);
				} else if (args !== undefined && args[0] !== undefined && args[0] == '6') {
					str = str.substring(0, 2) + N.context.attr("data").formatter.date.timeSepa + str.substring(2, 4) +
							N.context.attr("data").formatter.date.timeSepa + str.substring(4, 6);
				} else {
					str = str.substring(0, 2) + N.context.attr("data").formatter.date.timeSepa + str.substring(2, 4);
				}

				return str;
			},
			"limit" : function(str, args, ele) {
				if (args === undefined || args[0] === undefined) {
					throw N.error("[N.formatter.limit]You must input args[0](cut length)");
				}
				if(str.substr(str.length - args[1].length, args[1].length) !== args[1]) {
					if (ele !== undefined) {
						ele.attr("title", str);
					}
					var l = 0;
					for (var i = 0; i < str.length; i++) {
						l += (str.charCodeAt(i) > 128) ? 2 : 1;
						if (l > args[0]) {
							if (args !== undefined && args[1] !== undefined) {
								return N.string.trimToEmpty(str.substring(0, i)) + args[1];
							} else {
								return str.substring(0, i);
							}
						}
					}
				}
				return str;
			},
			"replace" : function(str, args, ele) {
				if (args === undefined || args.length < 2) {
					throw N.error("[N.formatter.replace]You must input args[0](target string) and args[1](replace string)");
				}
				var replaceStr = str.split(String(args[0])).join(String(args[1]));
				if (typeof args[2] != "undefined" && String(args[2]) == "true") {
					this.vo[ele.attr("name")] = replaceStr;
				}
				return replaceStr;
			},
			"lpad" : function(str, args) {
				if (args === undefined || args.length < 2) {
					throw N.error("[N.formatter.lpad]You must input args[0](fill length) and args[1](replace string)");
				}
				return N.string.lpad(str, Number(args[0]), args[1]);
			},
			"rpad" : function(str, args) {
				if (args === undefined || args.length < 2) {
					throw N.error("[N.formatter.rpad]You must input args[0](fill length) and  args[1](replace string)");
				}
				return N.string.rpad(str, Number(args[0]), args[1]);
			},
			"mask" : function(str, args) {
				if (args === undefined || args.length < 1) {
					throw N.error("[N.formatter.rpad]You must input args[0](masking rule)");
				}
				var replaceStr = "*";
				if(args.length === 2 && !N.string.isEmpty(args[1])) {
					replaceStr = args[1];
				}

				if(args[0] === "phone") {
					var rtnStr;
					str = N.string.trim(str);
					rtnStr = this.phonenum(str);
					var frontNum = rtnStr.substring(0, rtnStr.indexOf("-")+1);
					var rearNum = rtnStr.substring(rtnStr.lastIndexOf("-"), rtnStr.length);
					var middleNum = rtnStr.replace(frontNum, "").replace(rearNum, "");
					return frontNum + middleNum.replace(/\d/g, replaceStr) + rearNum;
				} else if(args[0] === "email") {
					str = N.string.trim(str);
					if(N.validator.email(str)) {
						var rplcStr = "";
						for(var i=0;i<3;i++) {
							rplcStr += replaceStr;
						}
						return str.replace(/@.*/, "").replace(/.{1,3}$/, rplcStr) + str.replace(/.*@/, "@");
					}
				} else if(args[0] === "address") {
					str = N.string.trim(str);
					var firstCheckChars = "_경기_강원_충북_충남_전북_전남_경북_경남_제주_";
					var secondCheckChars = "_도_시_군_구_";
					var thirdCheckChars = "_읍_면_동_리_로_길_가_";

					var addrFrags = str.split(" ");
					var maskedAddr = "";
					var addrFrag;
					var firstChar;
					var lastChar;
					$(addrFrags).each(function() {
						addrFrag = N.string.trim(this);
					    firstChar = addrFrag.substring(0, 1);
						lastChar = addrFrag.substring(addrFrag.length - 1, addrFrag.length);
					    if(firstCheckChars.indexOf("_" + addrFrag + "_") < 0 && secondCheckChars.indexOf("_" + lastChar + "_") < 0) {
							var rplcStr = "";
							if(thirdCheckChars.indexOf("_" + lastChar + "_") > -1 && (new RegExp(/[^0-9]/)).test(firstChar)) {
								for(var i=0;i<addrFrag.length-1;i++) {
					            	rplcStr += replaceStr;
					        	}
								addrFrag = rplcStr + lastChar;
							} else {
								for(var i=0;i<addrFrag.length;i++) {
					            	rplcStr += replaceStr;
					        	}
								addrFrag = rplcStr;
					        }
						}
						maskedAddr += addrFrag + " ";
					});
					return N.string.trim(maskedAddr);
				} else if(args[0] === "name") {
					str = N.string.trim(str);

					// if str is alphabet and number and dot(.)
					if((new RegExp(/^[a-z-?\d\s\.]+$/i)).test(str)) {
						return $(str.split("")).map(function(i){
						    if((i > 2 && i < 10) && this != " ") {
						        return replaceStr;
						    } else {
								return this;
							}
						}).get().join("");
					}

					// if str is Hanguel
					var firstCheckChars = "_남궁_제갈_선우_독고_황보_강전_동방_망절_사공_서문_소봉_장곡_";
					var frontIdx = 1;
					if(str.length > 1 && firstCheckChars.indexOf("_" + str.substring(0, 2) + "_") > -1) {
						frontIdx = 2;
					}

					return str.substring(0, frontIdx) + replaceStr + str.substring(frontIdx + 1, str.length);
				} else if(args[0] === "rrn") {
					str = N.string.trim(str);
					var rplcStr = "";
					for(var i=0;i<7;i++) {
						rplcStr += replaceStr;
					}
					return this.rrn(str.replace(/.{1,7}$/, rplcStr));
				}

				return str;
			},
			"generic" : function(str, args) {
				if (args === undefined || args[0] === undefined) {
					throw N.error("[N.formatter.generic]You must input args[0](user format rule)");
				}
				var mask = new N.Mask(args[0]);
				return mask.setGeneric(String(str));
			},
			"numeric" : function(str, args) {
				if (args === undefined || args[0] === undefined) {
					throw N.error("[N.formatter.numeric]You must input args[0](user format rule)");
				}
				var mask = new N.Mask(args[0]);
				return mask.setNumeric(String(str), args[1]);
			}
		});

		$.extend(Formatter.prototype, {
			"format" : function(row) {
				var opts = this.options;
				var self = this;
				var retArr = [];
				var retObj;
				var tempValue;
				var ele;
				if (row !== undefined) {
					if (row < opts.data.length && row >= 0) {
						opts.data = [ opts.data[row] ];
					} else {
						throw N.error("[N.formatter.prototype.format]Row index out of range");
					}
				} else {
					if (opts.isElement) {
						row = 0;
						opts.data = [ opts.data[row] ];
					}
				}
				$(opts.data).each(function(i, obj) {
					retObj = {};
					for ( var k in opts.rules ) {
						tempValue = N.string.trimToEmpty(obj[k]);

						if (opts.isElement) {
							ele = opts.targetEle.filter("#" + k);

							if(ele.length > 0) {
								if(ele.data("format") !== undefined) {
									// Replace with the latest rule.
									opts.rules[k] = ele.data("format");
								}
							} else {
								ele = undefined;
							}
						}

						$(opts.rules[k]).each(function() {
							try {
								tempValue = Formatter[N.string.trimToEmpty(this[0]).toLowerCase()](tempValue, N(this).remove_(0).toArray(), ele);
							} catch (e) {
								if (e.toString().indexOf("is not a function") > -1) {
									throw N.error("N.formatter.prototype.format(\"" + this[0] + "\" is invalid format rule)", e);
								} else {
									throw N.error("N.formatter.prototype.format", e);
								}
							}
						});
						retObj[k] = tempValue;
						if (opts.isElement) {
							ele = opts.targetEle.filter("#" + k);
							if (ele.is("[type='text'], [type='tel'], textarea")) {
								ele.val(tempValue);
								if(opts.createEvent) {
									ele.unbind("format.formatter unformat.formatter");
									ele.bind("format.formatter", function() {
										ele = opts.context.filter("#" + $(this).attr("id"));
										if(ele.length === 0) {
											ele = opts.context.find("#" + $(this).attr("id"));
										}

										// TODO Temporary code, think more
										var fmdVals = self.format();
										if(fmdVals.length === 1) {
											row = 0;
										}

										$(this).val(fmdVals[row][$(this).attr("id")]);
									}).bind("unformat.formatter", function() {
										// TODO Temporary code, think more
										if(opts.data.length === 1) {
											row = 0;
										}

										$(this).val(self.unformat(row, $(this).attr("id")));
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

		// Validator
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
				var self = this;
				opts.targetEle = opts.targetEle.map(function() {
					if($(this).data("validate") !== undefined) {
						if(opts.createEvent) {
							var thisEle = $(this);
							thisEle.unbind("validate.validator");
							thisEle.bind("validate.validator", function() {
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

		$.extend(Validator, {
			"required" : function(str) {
				return !N.string.isEmpty(str);
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
				var length = (args !== undefined && args[0] !== undefined) ? args[0] : 10;
				return new RegExp(/^-?\d+$/).test(str) || new RegExp("^-?\\d*\\.\\d{0," + String(length) + "}$").test(str);
			},
			"phone" : function(str, args) {
				if (args !== undefined && args[0] !== undefined) {
					if (args[0] == "true") {
						return new RegExp(/^\d{2,3}-\d{3,4}-\w+|"("")"$/).test(str);
					}
				}
				return new RegExp(/^\d{2,3}-\d{3,4}-\d{4}$/).test(str);
			},
			"rrn" : function(str, args) {
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
			/**
			 * Deprecated 2017.07.26
			 * Use rrn rule
			 * TODO Later, "ssn" will be replaced by the US Social Security Number
			 */
			"ssn" : function(str, args) {
				return this.rrn(str, args);
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
				if (Number(str.substr(7, 2)) % 2 !== 0) {
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
			"frn_rrn" : function(str, args) {
				str = str.replace(/-/g, '');
				if (N.string.trimToEmpty(str).length != 13) {
					str = null;
					return false;
				}
				if (Number(str.charAt(6)) >= 5 && Number(str.charAt(6)) <= 8) {
					return this.frn();
				} else {
					return this.rrn();
				}
			},
			/**
			 * Deprecated 2017.07.26
			 * Use frn_rrn rule
			 */
			"frn_ssn" : function(str, args) {
				return this.frn_rrn(str, args);
			},
			/**
			 * Deprecated 2017.09.26
			 * Use kbrn rule
			 */
			"cno" : function(str, args) {
				return this.kbrn(str, args);
			},
			/**
			 * Korean business registration number
			 */
			"kbrn" : function(str, args) {
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
			/**
			 * Deprecated 2017.09.26
			 * Use kcn rule
			 */
			"cpno" : function(str, args) {
				return this.kcn(str, args);
			},
			/**
			 * Korean corporation number
			 */
			"kcn" : function(str, args) {
				var numStr = N.string.trim(str).replace(/-/g, '');
				if (numStr.length != 13) {
					return false;
				}
				var arr_regno = numStr.split("");
				var arr_wt = [1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2];
				var iSum_regno = 0;
				var iCheck_digit = 0;

				for (var i = 0; i < 12; i++) {
					iSum_regno += parseInt(arr_regno[i]) * arr_wt[i];
				}

				iCheck_digit = 10 - (iSum_regno % 10);

				iCheck_digit = iCheck_digit % 10;

				if (iCheck_digit != arr_regno[12]) {
					return false;
				}
				return true;
			},
			"date" : function(str, args) {
				// Check date format length
				var isDateFormat = function(d) {
					if (N.string.trimToEmpty(d).length == 8) {
						return true;
					} else {
						return false;
					}
				};
				// Check leap year
				var isLeaf = function(year) {
					var leaf = false;
					if (year % 4 === 0) {
						leaf = true;

						if (year % 100 === 0) {
							leaf = false;
						}

						if (year % 400 === 0) {
							leaf = true;
						}
					}
					return leaf;
				};

				var d = str.replace(new RegExp("\\" + N.context.attr("data").formatter.date.dateSepa, "gi"), '');
				if (!isDateFormat(d)) {
					return false;
				}

				var month_day = [ 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ];

				var year = d.substring(0, 4);
				var month = d.substring(4, 6);
				var day = d.substring(6, 8);

				if (day === 0) {
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
				if (args === undefined || args[0] === undefined) {
					throw new Error("[Validator.accept]You must input args[0](accept string)");
				}
				return (new RegExp("^(" + args[0] + ")$")).test(str);
			},
			"match" : function(str, args) {
				if (args === undefined || args[0] === undefined) {
					throw new Error("[Validator.match]You must input args[0](match string)");
				}
				return (new RegExp(args[0])).test(str);
			},
			"acceptfileext" : function(str, args) {
				if (args === undefined || args[0] === undefined) {
					throw new Error("[Validator.acceptFileExt]You must input args[0](file extention)");
				}
				return (new RegExp(".(" + args[0] + ")$", "i")).test(str);
			},
			"notaccept" : function(str, args) {
				if (args === undefined || args[0] === undefined) {
					throw new Error("[Validator.notAccept]You must input args[0](refused string)");
				}
				return !(new RegExp("^(" + args[0] + ")$")).test(str);
			},
			"notmatch" : function(str, args) {
				if (args === undefined || args[0] === undefined) {
					throw new Error("[Validator.notMatch]You must input args[0](unmatch String)");
				}
				return !(new RegExp(args[0])).test(str);
			},
			"notacceptfileext" : function(str, args) {
				if (args === undefined || args[0] === undefined) {
					throw new Error("[Validator.notAcceptFileExt]You must input args[0](file extention)");
				}
				return !(new RegExp(".(" + args[0] + ")$", "i")).test(str);
			},
			"equalTo" : function(str, args) {
				if (args === undefined || args[0] === undefined) {
					throw new Error("[Validator.equalTo]You must input args[0](selector string(:input))");
				}
				if (N.string.trimToNull($(args[0]).val()) === null) {
					return true;
				}
				return str === $(args[0]).val();
			},
			"maxlength" : function(str, args) {
				if (args === undefined || args[0] === undefined) {
					throw new Error("[Validator.maxlength]You must input args[0](length)");
				}
				return N.string.trimToEmpty(str).length <= Number(N.string.trimToZero(args[0]));
			},
			"minlength" : function(str, args) {
				if (args === undefined || args[0] === undefined) {
					throw new Error("[Validator.minlength]You must input args[0](length)");
				}
				return Number(N.string.trimToZero(args[0])) <= N.string.trimToEmpty(str).length;
			},
			"rangelength" : function(str, args) {
				if (args === undefined || args.length < 2) {
					throw new Error("[Validator.rangelength]You must input args[0](minimum length) and args[1](maximum length");
				}
				return Number(N.string.trimToZero(args[0])) <= N.string.trimToEmpty(str).length &&
						N.string.trimToZero(str).length <= Number(N.string.trimToEmpty(args[1]));
			},
			"maxbyte" : function(str, args) {
				if (args === undefined || args[0] === undefined) {
					throw new Error("[Validator.maxbyte]You must input args[0](maximum byte)");
				}
				if(args[1] === undefined) {
					args[1] = N.context.attr("core").charByteLength;
				}
				return N.string.byteLength(N.string.trimToEmpty(str), args[1]) <= Number(N.string.trimToZero(args[0]));
			},
			"minbyte" : function(str, args) {
				if (args === undefined || args[0] === undefined) {
					throw new Error("[Validator.minbyte]You must input args[0](minimum byte)");
				}
				if(args[1] === undefined) {
					args[1] = N.context.attr("core").charByteLength;
				}
				return Number(N.string.trimToZero(args[0])) <= N.string.byteLength(N.string.trimToEmpty(str), args[1]);
			},
			"rangebyte" : function(str, args) {
				if (args === undefined || args.length < 2) {
					throw new Error("[Validator.rangebyte]You must input args[0](minimum byte) and args[1](maximum byte)");
				}
				if(args[2] === undefined) {
					args[2] = N.context.attr("core").charByteLength;
				}
				return Number(N.string.trimToZero(args[0])) <= N.string.byteLength(N.string.trimToEmpty(str), args[2]) &&
						N.string.byteLength(N.string.trimToEmpty(str), args[2]) <= Number(N.string.trimToZero(args[1]));
			},
			"maxvalue" : function(str, args) {
				if (args === undefined || args[0] === undefined) {
					throw new Error("[Validator.maxvalue]You must input args[0](maximum value)");
				}
				return Number(N.string.trimToZero(str)) <= Number(N.string.trimToZero(args[0]));
			},
			"minvalue" : function(str, args) {
				if (args === undefined || args[0] === undefined) {
					throw new Error("[Validator.minvalue]You must input args[0](minimum value)");
				}
				return Number(N.string.trimToZero(args[0])) <= Number(N.string.trimToZero(str));
			},
			"rangevalue" : function(str, args) {
				if (args === undefined || args.length < 2) {
					throw new Error("[Validator.rangevalue]You must input args[0](minimum value) and args[1](maximum value)");
				}
				return Number(N.string.trimToZero(args[0])) <= Number(N.string.trimToZero(str)) &&
						Number(N.string.trimToZero(str)) <= Number(N.string.trimToZero(args[1]));
			},
			"regexp" : function(str, args) {
				if (args === undefined || args.length < 2) {
					throw new Error("[Validator.regexp]You must input args[0](regular expression string) and args[1](flag)");
				}
				var regExp = N.string.trimToUndefined(args[1]) ? new RegExp(args[0], args[1]) : new RegExp(args[0]);
				return regExp.test(str);
			}
		});

		$.extend(Validator.prototype, {
			"validate" : function(row) {
				var opts = this.options;
				var retArr = [];
				var retObj;
				var retTempObj;
				var retTempArr;
				var data = opts.data.length > 0 ? opts.data : N(N.element.toData(opts.targetEle));
				if (row !== undefined) {
					if (row < data.length && row >= 0) {
						data = [ data[row] ];
					} else {
						throw N.error("[N.validator.prototype.validate]Row index out of range");
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
				$(data).each(function(i, obj) {
					retObj = {};
					for ( var k in opts.rules ) {
						retTempArr = [];
						var pass = true;
						$(opts.rules[k]).each(function() {
							retTempObj = {};
							retTempObj.rule = this.toString();
							args = N(this).remove_(0).toArray();
							rule = N.string.trimToEmpty(this[0]).toLowerCase();
							if (rule.indexOf("+") > -1) {
								rule = rule.split("+").sort().toString().replace(/\,/g, "_");
							}
							try {
								if (opts.rules[k].toString().indexOf("required") < 0 && rule !== "required" && N.string.isEmpty(String(obj[k]))) {
									retTempObj.result = true;
								} else {
									retTempObj.result = Validator[rule](N.string.trimToEmpty(obj[k]), args);
								}
							} catch (e) {
								if (e.toString().indexOf("is not a function") > -1) {
									throw N.error("N.validator.prototype.validate(\"" + this[0] + "\" is invalid format rule)");
								} else {
									throw N.error("N.validator.prototype.validate", e);
								}
							}
							retTempObj.msg = null;
							if (!retTempObj.result) {
								var valiMsg;
								if (!(valiMsg = N.context.attr("data").validator.message[N.locale()][rule])) {
									valiMsg = N.context.attr("data").validator.message[N.locale()].global;
								}
								retTempObj.msg = N.message.replaceMsgVars(valiMsg, args);

								pass = false;
							}
							retTempArr.push(retTempObj);
						});
						if (opts.isElement) {
							var ele;
							if(opts.targetEle.is("input:radio, input:checkbox")) {
								ele = opts.targetEle.filter("[name='" + k + "'].select_template__");
							} else {
								ele = opts.targetEle.filter("#" + k);
							}
							if(!pass) {
								ele.addClass("validate_false__");
								if (N().alert !== undefined) {
									alert = N(opts.targetEle !== null ? ele : undefined).alert($(retTempArr).map(function() {
										if (this.msg !== undefined) {
											return this.msg;
										}
									}).get()).show();
								} else {
									throw N.error("[N.validator.prototype.validate]You must import Natural-UI library");
								}
							} else {
								ele.removeClass("validate_false__");
								if (N().alert !== undefined) {
									alertInst = ele.instance("alert");
									if(alertInst !== undefined) {
										alertInst.remove();
									}
								} else {
									throw N.error("[N.validator.prototype.validate]You must import Natural-UI library");
								}
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

	})(N);

})(window, jQuery);