/*!
 * Natural-DATA v1.0.0
 *
 * Released under the LGPL v2.1 license
 * Date: 2014-09-26T11:11Z
 *
 * Copyright 2014 Goldman Kim(bbalganjjm@gmail.com)
 */

import { N } from "./natural.js.js";
import { NC } from "./natural.core.js";
import { NA } from "./natural.architecture.js";
import { NU } from "./natural.ui.js";

export class ND {

	datafilter(condition) {
		return ND.data.filter(this, condition);
	};

	datasort(key, reverse) {
		return ND.data.sort(this, key, reverse);
	};

	formatter(rules) {
		return new ND.formatter(this, rules);
	};

	validator(rules) {
		return new ND.validator(this, rules);
	};
	
	// DataSync(ND.ds)
	static ds = class {
		
		constructor(inst, isReg) {
			const pageContext = jQuery(NA.context.attr("architecture").page.context);
			if(pageContext.length === 0) {
				NC.warn("[ND.ds]Context element is missing. Please specify the correct Natural-JS's main context element selector to \"NA.context.attr(\"architecture\").page.context\" property in \"natural.config.js\" file");
			}
			let dataSyncTemp = pageContext.find("var#data_sync_temp__");
			if(dataSyncTemp.length === 0) {
				dataSyncTemp = pageContext.append('<var id="data_sync_temp__"></var>').find("var#data_sync_temp__");
			}
			this.viewContext = dataSyncTemp;

			let siglInst = this.viewContext.instance("ds");
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

		static instance = function(inst, isReg) {
			return new ND.ds(inst, isReg);
		};

		remove() {
			const inst = this.inst;
			const observable = this.observable;
			if (inst && observable) {
				for (let i = 0; i < observable.length; i++) {
					if (observable[i] === inst) {
						observable.splice(i, 1);
					}
				}
			}
			return this;
		};

		notify(row, key) {
			const inst = this.inst;
			const observable = this.observable;
			if (inst && observable) {
				for (let i = 0; i < observable.length; i++) {
					if (inst !== observable[i] && inst.options.data === observable[i].options.data) {
						if(observable[i] instanceof NU.form) {
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
		};

	}

	// Formatter
	static formatter = class {

		constructor(obj, rules) {
			this.options = {
				data : NC.isPlainObject(obj) ? N(obj) : obj,
				rules : rules,
				isElement : false,
				createEvent : true,
				context : null,
				targetEle : N()
			};

			if (NC.isElement(rules) || NC.isString(rules)) {
				const opts = this.options;
				opts.isElement = true;
				opts.context = N(rules);
				if (obj.length > 0) {
					if (obj[0][opts.context.attr("id")] !== undefined) {
						opts.targetEle.push(opts.context.get(0));
					} else {
						for ( const k in obj[0]) {
							if (opts.context.find("#" + k).length > 0) {
								opts.targetEle.push(opts.context.find("#" + k).get(0));
							}
						}
					}
					opts.rules = NC.element.toRules(opts.targetEle, "format");
				}
			}
		};

		format(row) {
			const opts = this.options;
			const self = this;
			const retArr = [];
			let retObj;
			let tempValue;
			let ele;
			if (row !== undefined) {
				if (row < opts.data.length && row >= 0) {
					opts.data = [ opts.data[row] ];
				} else {
					throw NC.error("[ND.formatter.prototype.format]Row index out of range");
				}
			} else {
				if (opts.isElement) {
					row = 0;
					opts.data = [ opts.data[row] ];
				}
			}
			jQuery(opts.data).each(function(i, obj) {
				retObj = {};
				for ( const k in opts.rules ) {
					tempValue = NC.string.trimToEmpty(obj[k]);

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

					jQuery(opts.rules[k]).each(function() {
						try {
							tempValue = ND.formatter[NC.string.trimToEmpty(this[0]).toLowerCase()](tempValue, N(this).remove_(0).toArray(), ele);
						} catch (e) {
							if (e.toString().indexOf("is not a function") > -1) {
								throw NC.error("ND.formatter.prototype.format(\"" + this[0] + "\" is invalid format rule)", e);
							} else {
								throw NC.error("ND.formatter.prototype.format", e);
							}
						}
					});
					retObj[k] = tempValue;
					if (opts.isElement) {
						ele = opts.targetEle.filter("#" + k);
						if (ele.is("[type='text'], [type='tel'], textarea")) {
							ele.val(tempValue);
							if(opts.createEvent) {
								ele.off("format.formatter unformat.formatter");
								ele.on("format.formatter", function() {
									ele = opts.context.filter("#" + jQuery(this).attr("id"));
									if(ele.length === 0) {
										ele = opts.context.find("#" + jQuery(this).attr("id"));
									}

									// TODO Temporary code, think more
									const fmdVals = self.format();
									if(fmdVals.length === 1) {
										row = 0;
									}

									jQuery(this).val(fmdVals[row][jQuery(this).attr("id")]);
								}).on("unformat.formatter", function() {
									// TODO Temporary code, think more
									if(opts.data.length === 1) {
										row = 0;
									}

									jQuery(this).val(self.unformat(row, jQuery(this).attr("id")));
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
		};

		unformat(row, key) {
			return this.options.data[row][key];
		};

		static commas = function(str) {
			if (NC.string.isEmpty(str)) {
				return str;
			}
			str = str.replace(/,/g, "");
			const reg = /(^[+-]?\d+)(\d{3})/;
			str += '';
			while (reg.test(str)) {
				str = str.replace(reg, '$1' + ',' + '$2');
			}
			return str;
		};
		/**
		 * Resident registration number
		 */
		static rrn = function(str, args) {
			if (NC.string.isEmpty(str)) {
				return str;
			}
			str = str.replace(/[^0-9*]/g, "");
			if (str.length === 13) {
				let strToPad = "*";
				if (args !== undefined && args[1] !== undefined) {
					strToPad = args[1];
				}
				if (args !== undefined && args[0] !== undefined) {
					str = NC.string.rpad(str.substring(0, 13 - Number(args[0])), 13, strToPad);
					str = str.substring(0, 6) + "-" + str.substring(6, 13);
				} else {
					str = str.substring(0, 6) + "-" + str.substring(6, 13);
				}
			}
			return str;
		};
		/**
		 * US Social Security Number
		 */
		static ssn = function(str) {
			if (str.length === 9) {
				str = str.replace(/[^0-9*]/g, "");
				return str.substring(0, 3) + "-" + str.substring(3, 5) + "-" + str.substring(5, 9);
			}
			return str;
		};
		/**
		 * Korean business registration number
		 */
		static kbrn = function(str) {
			if (NC.string.trimToEmpty(str).length < 5) {
				return str;
			}
			str = str.replace(/[^0-9*]/g, "");
			if (str.length > 10) {
				str = str.substring(0, 10);
			}
			return str.substring(0, 3) + "-" + str.substring(3, 5) + "-" + str.substring(5, 10);
		};
		/**
		 * Korean corporation number
		 */
		static kcn = function(str) {
			return this.rrn(str);
		};
		static upper = function(str) {
			if (NC.string.isEmpty(str)) {
				return str;
			}
			return str.toUpperCase();
		};
		static lower = function(str) {
			if (NC.string.isEmpty(str)) {
				return str;
			}
			return str.toLowerCase();
		};
		static capitalize = function(str) {
			if (NC.string.isEmpty(str)) {
				return str;
			}
			let result = str.substring(0, 1).toUpperCase();
			if (str.length > 1) {
				result = result + str.substring(1);
			}
			return result;
		};
		static zipcode = function(str) {
			if (NC.string.isEmpty(str)) {
				return str;
			}
			str = str.replace(/[^0-9*]/g, "");
			return str.substring(0, 3) + "-" + str.substring(3, 6);
		};
		static phone = function(str) {
			if (NC.string.isEmpty(str)) {
				return str;
			}
			str = str.replace(/[^0-9*]/g, "");
			return str.replace(/(^02.{0}|^01.{1}|[0-9*]{3})([0-9*]+)([0-9*]{4})/, "$1-$2-$3");
		};
		static realnum = function(str) {
			try {
				str = String(parseFloat(str));
			} catch (e) {
				return str;
			}
			return str === "NaN" ? str.replace("NaN", "") : str;
		};
		static trimtoempty = function(str) {
			return NC.string.trimToEmpty(str);
		};
		static trimtozero = function(str) {
			return NC.string.trimToZero(str);
		};
		static trimtoval = function(str, args) {
			if (args === undefined || args[0] === undefined) {
				throw NC.error("[ND.formatter.trimtoval]You must input args[0](default value)");
			}
			return NC.string.trimToVal(str, args[0]);
		};
		static date = function(str, args, ele) {
			if(args === undefined) {
				return str;
			}
			str = str.replace(/[^0-9]/g, "");

			//use datepicker, monthpicker
			if(NU.datepicker !== undefined) {
				if(args[1] !== undefined && (args[1] === "date" || args[1] === "month") && ele !== undefined && !ele.hasClass("datepicker__") && ele.is("input")) {
					const isMonth = args[1] === "month";
					let dateVal;
					let formInst;
					let colId;

					const options = {
						monthonly : isMonth
					};

					if(args[2] !== undefined) {
						jQuery.extend(options, args[2]);
					}
					const datepicker = ele.datepicker(options);
					const opts = datepicker.options;

					const orgOnBeforeShow = opts.onBeforeShow;
					opts.onBeforeShow = function(context, contents) {
						// for md format without Y format
						context.trigger("unformat");

						if(orgOnBeforeShow !== null) {
							return orgOnBeforeShow.apply(this, arguments);
						}
					};

					const orgOnSelect = opts.onSelect;
					opts.onSelect = function(context, date, monthonly) {
						dateVal = date.obj.formatDate(monthonly ? "Ym" : "Ymd");

						context.parents(".form__").each(function() {
							formInst = jQuery(this).instance("form");
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

					const orgOnBeforeHide = opts.onBeforeHide;
					opts.onBeforeHide = function(context, contents) {
						context.val(context.val().replace(/[^0-9]/g, ""));
						context.trigger("focusout.dataSync.form").trigger("focusout.form.format");

						if(orgOnBeforeHide !== null) {
							return orgOnBeforeHide.apply(this, arguments);
						}
					};

					const orgOnHide = opts.onHide;
					opts.onHide = function(context, contents) {
						if(orgOnHide !== null) {
							return orgOnHide.apply(this, arguments);
						}
					};

					if(opts.yearChangeInput) {
						const orgOnChangeYear = opts.onChangeYear;
						opts.onChangeYear = function() {
							opts.context.trigger("focusout.dataSync.form");
							if(orgOnChangeYear !== null) {
								return orgOnChangeYear.apply(this, arguments);
							}
						};
					}

					if(opts.monthChangeInput) {
						const orgOnChangeMonth = opts.onChangeMonth;
						opts.onChangeMonth = function() {
							opts.context.trigger("focusout.dataSync.form");
							if(orgOnChangeMonth !== null) {
								return orgOnChangeMonth.apply(this, arguments);
							}
						};
					}
				}
			} else {
				NC.warn("if you use date or month option, you must import Natural-UI library");
			}

			if (args[0] !== undefined) {
				const formats = NA.context.attr("data").formatter.date;
				let val;

				if(NC.type(args[0]) === "number") {
					if (args[0] === 4) {
						val = NC.date.format(str, "Y");
					} else if (args[0] === 6) {
						val = NC.date.format(str, formats.Ym());
					} else if (args[0] === 8) {
						val = NC.date.format(str, formats.Ymd());
					} else if (args[0] === 10) {
						val = NC.date.format(str, formats.YmdH());
					} else if (args[0] === 12) {
						val = NC.date.format(str, formats.YmdHi());
					} else if (args[0] === 14) {
						val = NC.date.format(str, formats.YmdHis());
					} else {
						val = NC.date.format(str, formats.Ymd());
					}
				} else {
					val = NC.date.format(str, args[0]);
				}

				return Number(str) > 0 ? val : "";
			}
		};
		static time = function(str, args) {
			str = str.replace(/[^0-9]/g, "");
			if (NC.string.trimToEmpty(str) > 6) {
				str = NC.string.rpad(str, 6, "0");
			} else {
				str = str.substring(0, 6);
			}
			if (args !== undefined && args[0] !== undefined && Number(args[0]) === 2) {
				str = str.substring(0, 2);
			} else if (args !== undefined && args[0] !== undefined && Number(args[0]) === 4) {
				str = str.substring(0, 2) + NA.context.attr("data").formatter.date.timeSepa + str.substring(2, 4);
			} else if (args !== undefined && args[0] !== undefined && Number(args[0]) === 6) {
				str = str.substring(0, 2) + NA.context.attr("data").formatter.date.timeSepa + str.substring(2, 4) +
					NA.context.attr("data").formatter.date.timeSepa + str.substring(4, 6);
			} else {
				str = str.substring(0, 2) + NA.context.attr("data").formatter.date.timeSepa + str.substring(2, 4);
			}

			return str;
		};
		static limit = function(str, args, ele) {
			if (args === undefined || args[0] === undefined) {
				throw NC.error("[ND.formatter.limit]You must input args[0](cut length)");
			}
			if(str.substring(str.length - args[1].length, str.length) !== args[1]) {
				if (ele !== undefined) {
					ele.attr("title", str);
				}
				let l = 0;
				for (let i = 0; i < str.length; i++) {
					l += (str.charCodeAt(i) > 128) ? 2 : 1;
					if (l > args[0]) {
						if (args[1] !== undefined) {
							return NC.string.trimToEmpty(str.substring(0, i)) + args[1];
						} else {
							return str.substring(0, i);
						}
					}
				}
			}
			return str;
		};
		static replace = function(str, args, ele) {
			if (args === undefined || args.length < 2) {
				throw NC.error("[ND.formatter.replace]You must input args[0](target string) and args[1](replace string)");
			}
			const replaceStr = str.split(String(args[0])).join(String(args[1]));
			if (typeof args[2] != "undefined" && String(args[2]) === "true") {
				this.vo[ele.attr("name")] = replaceStr;
			}
			return replaceStr;
		};
		static lpad = function(str, args) {
			if (args === undefined || args.length < 2) {
				throw NC.error("[ND.formatter.lpad]You must input args[0](fill length) and args[1](replace string)");
			}
			return NC.string.lpad(str, Number(args[0]), args[1]);
		};
		static rpad = function(str, args) {
			if (args === undefined || args.length < 2) {
				throw NC.error("[ND.formatter.rpad]You must input args[0](fill length) and  args[1](replace string)");
			}
			return NC.string.rpad(str, Number(args[0]), args[1]);
		};
		static mask = function(str, args) {
			if (args === undefined || args.length < 1) {
				throw NC.error("[ND.formatter.rpad]You must input args[0](masking rule)");
			}
			let replaceStr = "*";
			if(args.length === 2 && !NC.string.isEmpty(args[1])) {
				replaceStr = args[1];
			}

			if(args[0] === "phone") {
				let rtnStr;
				str = NC.string.trimToEmpty(str);
				rtnStr = this.phone(str);
				const frontNum = rtnStr.substring(0, rtnStr.indexOf("-")+1);
				const rearNum = rtnStr.substring(rtnStr.lastIndexOf("-"), rtnStr.length);
				const middleNum = rtnStr.replace(frontNum, "").replace(rearNum, "");
				return frontNum + middleNum.replace(/\d/g, replaceStr) + rearNum;
			} else if(args[0] === "email") {
				str = NC.string.trimToEmpty(str);
				if(ND.validator.email(str)) {
					let rplcStr = "";
					for(let i=0;i<3;i++) {
						rplcStr += replaceStr;
					}
					return str.replace(/@.*/, "").replace(/.{1,3}$/, rplcStr) + str.replace(/.*@/, "@");
				}
			} else if(args[0] === "address") {
				str = NC.string.trimToEmpty(str);
				const firstCheckChars = "_경기_강원_충북_충남_전북_전남_경북_경남_제주_";
				const secondCheckChars = "_도_시_군_구_";
				const thirdCheckChars = "_읍_면_동_리_로_길_가_";

				const addrFrags = str.split(" ");
				let maskedAddr = "";
				let addrFrag;
				let firstChar;
				let lastChar;
				jQuery(addrFrags).each(function() {
					addrFrag = NC.string.trimToEmpty(this);
					firstChar = addrFrag.substring(0, 1);
					lastChar = addrFrag.substring(addrFrag.length - 1, addrFrag.length);
					if(firstCheckChars.indexOf("_" + addrFrag + "_") < 0 && secondCheckChars.indexOf("_" + lastChar + "_") < 0) {
						let rplcStr = "";
						if(thirdCheckChars.indexOf("_" + lastChar + "_") > -1 && (new RegExp(/[^0-9*]/)).test(firstChar)) {
							for(let i=0;i<addrFrag.length-1;i++) {
								rplcStr += replaceStr;
							}
							addrFrag = rplcStr + lastChar;
						} else {
							for(let i=0;i<addrFrag.length;i++) {
								rplcStr += replaceStr;
							}
							addrFrag = rplcStr;
						}
					}
					maskedAddr += addrFrag + " ";
				});
				return NC.string.trimToEmpty(maskedAddr);
			} else if(args[0] === "name") {
				str = NC.string.trimToEmpty(str);

				// if str is alphabet and number and dot(.)
				if((new RegExp(/^[a-z-?\d\s\.]+$/i)).test(str)) {
					return jQuery(str.split("")).map(function(i){
						if((i > 2 && i < 10) && this !== " ") {
							return replaceStr;
						} else {
							return this;
						}
					}).get().join("");
				}

				// if str is Hanguel
				const firstCheckChars = "_남궁_제갈_선우_독고_황보_강전_동방_망절_사공_서문_소봉_장곡_";
				let frontIdx = 1;
				if(str.length > 1 && firstCheckChars.indexOf("_" + str.substring(0, 2) + "_") > -1) {
					frontIdx = 2;
				}

				return str.substring(0, frontIdx) + replaceStr + str.substring(frontIdx + 1, str.length);
			} else if(args[0] === "rrn") {
				str = NC.string.trimToEmpty(str);
				let rplcStr = "";
				for(let i=0;i<7;i++) {
					rplcStr += replaceStr;
				}
				return this.rrn(str.replace(/.{1,7}$/, rplcStr));
			}

			return str;
		};
		static generic = function(str, args) {
			if (args === undefined || args[0] === undefined) {
				throw NC.error("[ND.formatter.generic]You must input args[0](user format rule)");
			}
			const mask = new NC.mask(args[0]);
			return mask.setGeneric(String(str));
		};
		static numeric = function(str, args) {
			if (args === undefined || args[0] === undefined) {
				throw NC.error("[ND.formatter.numeric]You must input args[0](user format rule)");
			}
			const mask = new NC.mask(args[0]);
			return mask.setNumeric(String(str), args[1]);
		};

	};

	// Validator
	static validator = class {

		constructor(obj, rules) {
			this.options = {
				data : NC.isPlainObject(obj) ? N(obj) : obj,
				rules : rules,
				isElement : false,
				createEvent : true,
				context : null,
				targetEle : null
			};

			if (NC.isElement(rules) || NC.isString(rules)) {
				const opts = this.options;
				opts.isElement = true;
				opts.context = N(rules);
				opts.targetEle = opts.context.is(":input") ? opts.context : opts.context.find(":input");
				opts.targetEle = opts.targetEle.map(function() {
					if(jQuery(this).data("validate") !== undefined) {
						if(opts.createEvent) {
							const thisEle = jQuery(this);
							thisEle.off("validate.validator");
							thisEle.on("validate.validator", function() {
								N().validator(N(this)).validate();
							});
						}
						return this;
					}
				});
				opts.rules = NC.element.toRules(opts.targetEle, "validate");
			}

			this.options.data = obj.length > 0 ? obj : N(NC.element.toData(this.options.targetEle));
		};

		validate = function(row) {
			const opts = this.options;
			const retArr = [];
			let retObj;
			let retTempObj;
			let retTempArr;
			let data = opts.data.length > 0 ? opts.data : N(NC.element.toData(opts.targetEle));
			if (row !== undefined) {
				if (row < data.length && row >= 0) {
					data = [ data[row] ];
				} else {
					throw NC.error("[ND.validator.prototype.validate]Row index out of range");
				}
			} else {
				if (opts.isElement) {
					row = 0;
					data = [ data[row] ];
				}
			}

			let args;
			let alert;
			let rule;
			jQuery(data).each(function(i, obj) {
				retObj = {};
				for ( const k in opts.rules ) {
					retTempArr = [];
					let pass = true;
					jQuery(opts.rules[k]).each(function() {
						retTempObj = {};
						retTempObj.rule = this.toString();
						args = N(this).remove_(0).toArray();
						rule = NC.string.trimToEmpty(this[0]).toLowerCase();
						if (rule.indexOf("+") > -1) {
							rule = rule.split("+").sort().toString().replace(/\,/g, "_");
						}
						try {
							if (opts.rules[k].toString().indexOf("required") < 0 && rule !== "required" && NC.string.isEmpty(String(obj[k]))) {
								retTempObj.result = true;
							} else {
								retTempObj.result = ND.validator[rule](NC.string.trimToEmpty(obj[k]), args);
							}
						} catch (e) {
							if (e.toString().indexOf("is not a function") > -1) {
								throw NC.error("ND.validator.prototype.validate(\"" + this[0] + "\" is invalid format rule)");
							} else {
								throw NC.error("ND.validator.prototype.validate", e);
							}
						}
						retTempObj.msg = null;
						if (!retTempObj.result) {
							let valiMsg;
							if (!(valiMsg = NA.context.attr("data").validator.message[NC.locale()][rule])) {
								valiMsg = NA.context.attr("data").validator.message[NC.locale()].global;
							}
							retTempObj.msg = NC.message.replaceMsgVars(valiMsg, args);

							pass = false;
						}
						retTempArr.push(retTempObj);
					});
					if (opts.isElement) {
						let ele;
						if(opts.targetEle.is("input:radio, input:checkbox")) {
							ele = opts.targetEle.filter("[name='" + k + "'].select_template__");
						} else {
							ele = opts.targetEle.filter("#" + k);
						}
						if(!pass) {
							ele.addClass("validate_false__");
							if (N().alert !== undefined) {
								alert = N(opts.targetEle !== null ? ele : undefined).alert(jQuery(retTempArr).map(function() {
									if (this.msg !== undefined) {
										return this.msg;
									}
								}).get()).show();
							} else {
								throw NC.error("[ND.validator.prototype.validate]You must import Natural-UI library");
							}
						} else {
							ele.removeClass("validate_false__");
							if (N().alert !== undefined) {
								const alertInst = ele.instance("alert");
								if(alertInst !== undefined) {
									alertInst.remove();
								}
							} else {
								throw NC.error("[ND.validator.prototype.validate]You must import Natural-UI library");
							}
						}
					}
					retObj[k] = retTempArr;
				}
				retArr.push(retObj);
				retObj = null;
			});
			return retArr;
		};

		static required = function(str) {
			return !NC.string.isEmpty(str);
		};
		static alphabet = function(str) {
			return new RegExp(/^[a-z\s]+$/i).test(str);
		};
		static integer = function(str) {
			return new RegExp(/^[+-]?\d+$/).test(str);
		};
		static korean = function(str) {
			return new RegExp(/^[ㄱ-ㅎ|ㅏ-ㅣ|가-힣\s]+$/).test(str);
		};
		static alphabet_integer = function(str) {
			return new RegExp(/^[a-z-?\d\s]+$/i).test(str);
		};
		static integer_korean = function(str) {
			return new RegExp(/^[ㄱ-ㅎ|ㅏ-ㅣ|가-힣-?\d\s]+$/).test(str);
		};
		static alphabet_korean = function(str) {
			return new RegExp(/^[ㄱ-ㅎ|ㅏ-ㅣ|가-힣a-z\s]+$/i).test(str);
		};
		static alphabet_integer_korean = function(str) {
			return new RegExp(/^[ㄱ-ㅎ|ㅏ-ㅣ|가-힣a-z-?\d\s]+$/i).test(str);
		};
		static dash_integer = function(str) {
			return new RegExp(/^(\d|-)+$/).test(str);
		};
		static commas_integer = function(str) {
			return new RegExp(/^(\d|,)+$/).test(str);
		};
		static number = function(str) {
			return new RegExp(/^[+-]?(\d|,|\.)+$/).test(str);
		};
		static email = function(str) {
			return new RegExp(
				/^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)*(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i)
				.test(str);
		};
		static url = function(str) {
			return new RegExp(
				/^(https?|ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)*(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i)
				.test(str);
		};
		static zipcode = function(str) {
			return new RegExp(/^\d{3}-\d{3}$/).test(str);
		};
		static decimal = function(str, args) {
			const length = (args !== undefined && args[0] !== undefined) ? args[0] : 10;
			return new RegExp(/^-?\d+$/).test(str) || new RegExp("^-?\\d*\\.\\d{0," + String(length) + "}$").test(str);
		};
		static phone = function(str, args) {
			if (args !== undefined && args[0] !== undefined) {
				if (args[0] === "true") {
					return new RegExp(/^\d{2,3}-\d{3,4}-\w+|"("")"$/).test(str);
				}
			}
			return new RegExp(/^\d{2,3}-\d{3,4}-\d{4}$/).test(str);
		};
		static rrn = function(str) {
			str = str.replace(/[^0-9*]/g, "");
			if (NC.string.trimToEmpty(str).length !== 13) {
				str = null;
				return false;
			}

			const a1 = str.substring(0, 1);
			const a2 = str.substring(1, 2);
			const a3 = str.substring(2, 3);
			const a4 = str.substring(3, 4);
			const a5 = str.substring(4, 5);
			const a6 = str.substring(5, 6);
			let checkdigit = a1 * 2 + a2 * 3 + a3 * 4 + a4 * 5 + a5 * 6 + a6 * 7;

			const b1 = str.substring(6, 7);
			const b2 = str.substring(7, 8);
			const b3 = str.substring(8, 9);
			const b4 = str.substring(9, 10);
			const b5 = str.substring(10, 11);
			const b6 = str.substring(11, 12);
			const b7 = str.substring(12, 13);
			checkdigit = checkdigit + b1 * 8 + b2 * 9 + b3 * 2 + b4 * 3 + b5 * 4 + b6 * 5;

			checkdigit = checkdigit % 11;
			checkdigit = 11 - checkdigit;
			checkdigit = checkdigit % 10;

			return checkdigit === b7;
		};
		/**
		 * US Social Security Number
		 */
		static ssn = function(str) {
			return new RegExp(/\d{3}-\d{2}-\d{4}/).test(str);
		};
		static frn = function(str) {
			str = str.replace(/[^0-9*]/g, "");
			if (NC.string.trimToEmpty(str).length !== 13) {
				str = null;
				return false;
			}
			let sum = 0;

			const checkValue = Number(str.substring(6, 7));
			if ([5, 6, 8].indexOf(checkValue) === -1) {
				return false;
			}
			if (Number(str.substring(7, 9)) % 2 !== 0) {
				return false;
			}
			for (let i = 0; i < 12; i++) {
				sum += Number(str.substring(i, i + 1)) * ((i % 8) + 2);
			}
			return (((11 - (sum % 11)) % 10 + 2) % 10) === Number(str.substring(12, 13));

		};
		static frn_rrn = function(str) {
			str = str.replace(/[^0-9*]/g, "");
			if (NC.string.trimToEmpty(str).length !== 13) {
				str = null;
				return false;
			}
			if (Number(str.charAt(6)) >= 5 && Number(str.charAt(6)) <= 8) {
				return this.frn();
			} else {
				return this.rrn();
			}
		};
		/**
		 * Korean business registration number
		 */
		static kbrn = function(str) {
			const bizID = str.replace(/[^0-9*]/g, "");
			const checkID = [1, 3, 7, 1, 3, 7, 1, 3, 5, 1];
			let i, chkSum = 0, c2, remander;
			for (i = 0; i <= 7; i++) {
				chkSum += checkID[i] * bizID.charAt(i);
			}
			c2 = "0" + (checkID[8] * bizID.charAt(8));
			c2 = c2.substring(c2.length - 2, c2.length);

			chkSum += Math.floor(Number(c2.charAt(0))) + Math.floor(Number(c2.charAt(1)));

			remander = (10 - (chkSum % 10)) % 10;

			return Math.floor(Number(bizID.charAt(9))) === remander;
		};
		/**
		 * Korean corporation number
		 */
		static kcn = function(str) {
			const numStr = str.replace(/[^0-9*]/g, "");
			if (numStr.length !== 13) {
				return false;
			}
			const arr_regno = numStr.split("");
			const arr_wt = [1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2];
			let iSum_regno = 0;
			let iCheck_digit;

			for (let i = 0; i < 12; i++) {
				iSum_regno += parseInt(arr_regno[i]) * arr_wt[i];
			}

			iCheck_digit = 10 - (iSum_regno % 10);
			iCheck_digit = iCheck_digit % 10;

			return iCheck_digit === arr_regno[12];

		};
		static date = function(str) {
			// Check date format length
			const isDateFormat = function(d) {
				return NC.string.trimToEmpty(d).length === 8;
			};

			// Check leap year
			const isLeaf = function(year) {
				let leaf = false;
				if (year % 4 === 0) {
					leaf = year % 100 !== 0;
					if (year % 400 === 0) {
						leaf = true;
					}
				}
				return leaf;
			};

			const d = str.replace(new RegExp("\\" + NA.context.attr("data").formatter.date.dateSepa, "gi"), '');
			if (!isDateFormat(d)) {
				return false;
			}

			const month_day = [ 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ];

			const year = d.substring(0, 4);
			const month = d.substring(4, 6);
			const day = d.substring(6, 8);

			if (day === 0) {
				return false;
			}

			let isValid = false;

			if (isLeaf(year)) {
				if (Number(month) === 2) {
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
		};
		static time = function(str) {
			return new RegExp(/^([01]\d|2[0-3])([0-5]\d){0,2}$/).test(str.replace(/[^0-9]/g, ""));
		};
		static accept = function(str, args) {
			if (args === undefined || args[0] === undefined) {
				throw new Error("[ND.validator.accept]You must input args[0](accept string)");
			}
			return (new RegExp("^(" + args[0] + ")$")).test(str);
		};
		static match = function(str, args) {
			if (args === undefined || args[0] === undefined) {
				throw new Error("[ND.validator.match]You must input args[0](match string)");
			}
			return (new RegExp(args[0])).test(str);
		};
		static acceptfileext = function(str, args) {
			if (args === undefined || args[0] === undefined) {
				throw new Error("[ND.validator.acceptFileExt]You must input args[0](file extention)");
			}
			return (new RegExp(".(" + args[0] + ")$", "i")).test(str);
		};
		static notaccept = function(str, args) {
			if (args === undefined || args[0] === undefined) {
				throw new Error("[ND.validator.notAccept]You must input args[0](refused string)");
			}
			return !(new RegExp("^(" + args[0] + ")$")).test(str);
		};
		static notmatch = function(str, args) {
			if (args === undefined || args[0] === undefined) {
				throw new Error("[ND.validator.notMatch]You must input args[0](unmatch String)");
			}
			return !(new RegExp(args[0])).test(str);
		};
		static notacceptfileext = function(str, args) {
			if (args === undefined || args[0] === undefined) {
				throw new Error("[ND.validator.notAcceptFileExt]You must input args[0](file extention)");
			}
			return !(new RegExp(".(" + args[0] + ")$", "i")).test(str);
		};
		static equalTo = function(str, args) {
			if (args === undefined || args[0] === undefined) {
				throw new Error("[ND.validator.equalTo]You must input args[0](selector string(:input))");
			}
			if (NC.string.trimToNull(jQuery(args[0]).val()) === null) {
				return true;
			}
			return str === jQuery(args[0]).val();
		};
		static maxlength = function(str, args) {
			if (args === undefined || args[0] === undefined) {
				throw new Error("[ND.validator.maxlength]You must input args[0](length)");
			}
			return NC.string.trimToEmpty(str).length <= Number(NC.string.trimToZero(args[0]));
		};
		static minlength = function(str, args) {
			if (args === undefined || args[0] === undefined) {
				throw new Error("[ND.validator.minlength]You must input args[0](length)");
			}
			return Number(NC.string.trimToZero(args[0])) <= NC.string.trimToEmpty(str).length;
		};
		static rangelength = function(str, args) {
			if (args === undefined || args.length < 2) {
				throw new Error("[ND.validator.rangelength]You must input args[0](minimum length) and args[1](maximum length");
			}
			return Number(NC.string.trimToZero(args[0])) <= NC.string.trimToEmpty(str).length &&
				NC.string.trimToZero(str).length <= Number(NC.string.trimToEmpty(args[1]));
		};
		static maxbyte = function(str, args) {
			if (args === undefined || args[0] === undefined) {
				throw new Error("[ND.validator.maxbyte]You must input args[0](maximum byte)");
			}
			if(args[1] === undefined) {
				args[1] = NA.context.attr("core").charByteLength;
			}
			return NC.string.byteLength(NC.string.trimToEmpty(str), args[1]) <= Number(NC.string.trimToZero(args[0]));
		};
		static minbyte = function(str, args) {
			if (args === undefined || args[0] === undefined) {
				throw new Error("[ND.validator.minbyte]You must input args[0](minimum byte)");
			}
			if(args[1] === undefined) {
				args[1] = NA.context.attr("core").charByteLength;
			}
			return Number(NC.string.trimToZero(args[0])) <= NC.string.byteLength(NC.string.trimToEmpty(str), args[1]);
		};
		static rangebyte = function(str, args) {
			if (args === undefined || args.length < 2) {
				throw new Error("[ND.validator.rangebyte]You must input args[0](minimum byte) and args[1](maximum byte)");
			}
			if(args[2] === undefined) {
				args[2] = NA.context.attr("core").charByteLength;
			}
			return Number(NC.string.trimToZero(args[0])) <= NC.string.byteLength(NC.string.trimToEmpty(str), args[2]) &&
				NC.string.byteLength(NC.string.trimToEmpty(str), args[2]) <= Number(NC.string.trimToZero(args[1]));
		};
		static maxvalue = function(str, args) {
			if (args === undefined || args[0] === undefined) {
				throw new Error("[ND.validator.maxvalue]You must input args[0](maximum value)");
			}
			return Number(NC.string.trimToZero(str)) <= Number(NC.string.trimToZero(args[0]));
		};
		static minvalue = function(str, args) {
			if (args === undefined || args[0] === undefined) {
				throw new Error("[ND.validator.minvalue]You must input args[0](minimum value)");
			}
			return Number(NC.string.trimToZero(args[0])) <= Number(NC.string.trimToZero(str));
		};
		static rangevalue = function(str, args) {
			if (args === undefined || args.length < 2) {
				throw new Error("[ND.validator.rangevalue]You must input args[0](minimum value) and args[1](maximum value)");
			}
			return Number(NC.string.trimToZero(args[0])) <= Number(NC.string.trimToZero(str)) &&
				Number(NC.string.trimToZero(str)) <= Number(NC.string.trimToZero(args[1]));
		};
		static regexp = function(str, args) {
			if (args === undefined || args.length < 2) {
				throw new Error("[ND.validator.regexp]You must input args[0](regular expression string) and args[1](flag)");
			}
			const regExp = NC.string.trimToUndefined(args[1]) ? new RegExp(args[0], args[1]) : new RegExp(args[0]);
			return regExp.test(str);
		};

	};

	static data = class {

		static filter = function(arr, condition) {
			if(typeof condition === "function") {
				return NC.isWrappedSet(arr) ? N(jQuery.grep(arr.toArray(), condition)) : jQuery.grep(arr, condition);
			} else if(NC.type(condition) === "string") {
				condition = condition.replace(/ /g, "").replace(/\|\|/g, " || item.").replace(/\&\&/g, " || item.");
				const testFn = new Function("item", "return item." + condition);
				return NC.isWrappedSet(arr) ? N(jQuery.grep(arr.toArray(), function(item) {
					return testFn(item);
				})) : jQuery.grep(arr, function(item) {
					return testFn(item);
				});
			} else {
				return arr;
			}
		};

		static sortBy = function(key, reverse) {
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
		};

		static sort = function(arr, key, reverse) {
			if(reverse) {
				reverse = -1;
			} else {
				reverse = 1;
			}
			return arr.sort(this.sortBy(key, reverse));
		};

	}

}