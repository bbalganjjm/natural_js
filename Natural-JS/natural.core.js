(function(window, $) {
	var version = "0.5.1.6", NTR;

	// Define a local copy of jQuery
	NTR = function(selector, context) {
		return new $.fn.init(selector, context);
	};

	// NTR local variables
	$.fn.extend(NTR, {
		"Natural-CORE" : version,
		locale : function(str) {
			if(str === undefined) {
				return N.context.attr("core")["locale"];
			} else {
				N.context.attr("core")["locale"] = str;
			}
		},
		error : function(msg) {
			throw new Error(msg);
		},
		isFunction : $.isFunction,
		isArray : $.isArray,
		isWindow : $.isWindow,
		isNumeric : $.isNumeric,
		isEmptyObject : function(obj) {
			if(obj !== undefined && this.isString(obj)) {
				if(obj.length > 0) {
					return false;
				}
			} else {
				for (var name in obj) {
					return false;
				}
			}
			return true;
		},
		isPlainObject : $.isPlainObject,
		isString : function(str) {
			return typeof str === "string";
		},
		globalEval : $.globalEval,
		type : function(obj) {
	        if (typeof obj == "object") {
	            if (obj === null) {
	                return "null";
	            }
	            if (obj.constructor == (new String).constructor) {
	                return "string";
	            }
	            if (obj.constructor == (new Array).constructor) {
	                return "array";
	            }
	            if (obj.constructor == (new Date).constructor) {
	                return "date";
	            }
	            if (obj.constructor == (new RegExp).constructor) {
	                return "regex";
	            }
	            if (obj.constructor.toString().toUpperCase().indexOf("HTML") > -1 && obj.constructor.toString().toUpperCase().indexOf("ELEMENT")) {
	                return "html";
	            }
	            return "object";
	        }
	        return typeof obj;
	    },
		isElement : function(obj) {
			if(N.isString(obj)) {
				obj = N(obj);
			}
			return obj !== undefined && obj.length > 0 && obj.get(0).getElementsByTagName ? true : false;
		},
		isArraylike : function(obj) {
			var length = obj.length, type = NTR.type(obj);
			if (type === "function" || NTR.isWindow(obj)) {
				return false;
			}
			if (obj.nodeType === 1 && length) {
				return true;
			}
			return type === "array" || length === 0 || typeof length === "number" && length > 0 && (length - 1) in obj;
		},
		isWrappedSet : function(obj) {
			return this.isArraylike(obj) && obj.jquery;
		},
		"string" : {
			contains : function(needle, haystack) {
				return haystack && (haystack.indexOf(needle) != -1);
			},
			endsWith : function(str, postfix) {
				if (this.isEmpty(str) || this.isEmpty(postfix)) {
					return false;
				}
				return str.lastIndexOf(postfix) == str.length - postfix.length;
			},
			startsWith : function(str, prefix) {
				if (this.isEmpty(str)) {
					return false;
				}
				return str.indexOf(prefix) == 0;
			},
			insertAt : function(str, strToInsert, index) {
				return str.substring(0, index) + strToInsert + str.substring(index);
			},
			matches : function(str, matchExp, ignoreCase) {
				var ignoreCase_ = arguments.length >= 3 ? ignoreCase : false;
				matchExp = this.trim(matchExp);
				matchExp = matchExp.replace(/\s+/, "*");
				matchExp = matchExp.replace(/\*/, ".*?");
				matchExp = matchExp.replace(/\?/, ".{0,1}");
				var regExp = new RegExp("^" + matchExp, (ignoreCase_ ? "i" : ""));
				return regExp.test(str);
			},
			removeWhitespace : function(str) {
				if (this.isEmpty(str)) {
					return str;
				}
				return str.replace(/\s/g, "");
			},
			lpad : function(originalstr, length, strToPad) {
				while (originalstr.length < length) {
					originalstr = strToPad + originalstr;
				}
				return originalstr;
			},
			rpad : function(originalstr, length, strToPad) {
				while (originalstr.length < length) {
					originalstr = originalstr + strToPad;
				}
				return originalstr;
			},
			/**
			 * 문자열의 바이트 길이를 반환
			 */
			byteLength : function(str) {
				var byteLength = 0;
				for (var inx = 0; inx < str.length; inx++) {
					var oneChar = escape(str.charAt(inx));
					if (oneChar.length == 1) {
						byteLength++;
					} else if (oneChar.indexOf("%u") != -1) {
						byteLength += 2;
					} else if (oneChar.indexOf("%") != -1) {
						byteLength += oneChar.length / 3;
					}
				}
				return byteLength;
			},
			trim : function(str) {
				return String(str).replace(/^\s*/, "").replace(/\s*$/, "");
			},
			/**
			 * 값이 비어 있는지 체크
			 */
			isEmpty : function(str) {
				return this.trimToNull(str) == null ? true : false;
			},
			/**
			 * null이나 스트링을 트림 하여 스트링으로 반환
			 */
			trimToEmpty : function(str) {
				return (str != null && typeof str != "undefined" && this.trim(str).length > 0) ? this.trim(str) : "";
			},
			/**
			 * null이나 스트링을 트림 하여 스트링으로 반환
			 */
			nullToEmpty : function(str) {
				return (str == null || typeof str == "undefined") ? "" : str;
			},
			/**
			 * null이나 스트링을 트림하여 값이 없으면 null 반환
			 */
			trimToNull : function(str) {
				return (str != null && typeof str != "undefined" && this.trim(str).length > 0) ? this.trim(str) : null;
			},
			/**
			 * null이나 스트링을 트림하여 값이 없으면 0을 반환
			 */
			trimToZero : function(str) {
				return (str != null && typeof str != "undefined" && this.trim(str).length > 0) ? this.trim(str) : "0";
			},
			/**
			 * null이나 스트링을 트림하여 값이 없으면 valStr 을 반환
			 */
			trimToVal : function(str, valStr) {
				return (str != null && typeof str != "undefined" && this.trim(str).length > 0) ? this.trim(str) : valStr;
			}
		},
		"date" : {
			/**
			 * 두 날짜의 차수를 리턴한다.
			 */
			diff : function(str1, str2) {
				if (NTR.type(str1) == "string") {
					str1 = this.stringToDateObj(str1).obj;
				}
				if (NTR.type(str2) == "string") {
					str2 = this.stringToDateObj(str2).obj;
				}
				return Math.ceil((str2 - str1) / 1000 / 24 / 60 / 60);
			},
			/**
			 * 날짜스트링을 Date Object와 기본 데이트포멧이 담긴 dateInfo 오브젝트 반환
			 */
			strToDate : function(str) {
				str = NTR.string.trimToEmpty(str).replace(/\s/g, "").replace(/-/g, "").replace(/\//g, "").replace(/:/g, "");
				var dateInfo = null;
				if (str.length == 6) {
					dateInfo = {
						obj : new Date(str.substring(0, 4), Number(str.substring(4, 6)), 0, 0, 0, 0),
						format : NTR.context.attr("data")["formater"]["date"]["Ym"]()
					};
				} else if (str.length == 8) {
					dateInfo = {
						obj : new Date(str.substring(0, 4), Number(str.substring(4, 6)) - 1, str.substring(6, 8), 0, 0, 0),
						format : NTR.context.attr("data")["formater"]["date"]["Ymd"]()
					};
				} else if (str.length == 10) {
					dateInfo = {
						obj : new Date(str.substring(0, 4), Number(str.substring(4, 6)) - 1, str.substring(6, 8), str.substring(8, 10), 0, 0),
						format : NTR.context.attr("data")["formater"]["date"]["YmdH"]()
					};
				} else if (str.length == 12) {
					dateInfo = {
						obj : new Date(str.substring(0, 4), Number(str.substring(4, 6)) - 1, str.substring(6, 8), str.substring(8, 10), str.substring(10, 12),
								0),
						format : NTR.context.attr("data")["formater"]["date"]["YmdHi"]()
					};
				} else if (str.length >= 14) {
					dateInfo = {
						obj : new Date(str.substring(0, 4), Number(str.substring(4, 6)) - 1, str.substring(6, 8), str.substring(8, 10), str.substring(10, 12),
								str.substring(12, 14)),
						format : NTR.context.attr("data")["formater"]["date"]["YmdHis"]()
					};
				}
				return dateInfo;
			},
			/**
			 * 날짜를 형식에 맞게 리턴
			 */
			format : function(str, format) {
				var dateInfo = this.strToDate(str);
				return dateInfo != null ? dateInfo.obj.formatDate(format != null ? format : dateInfo.format) : str;
			},
			/**
			 * DATE 형식의 오브젝트를 TIMESTAMP로 변환한다.
			 */
			dateToTs : function(dateObj) {
				var d = null;
				if (dateObj == null) {
					d = new Date(obj.time);
				}
				return Math.round(d.getTime() / 1000);
			},
			/**
			 * TIMESTAMP를 DATE 형식의 오브젝트로 변환한다.
			 */
			tsToDate : function(timestamp) {
				var d = new Date(timestamp);
				return d;
			}
		},
		"element" : {
			/**
			 * make options object from class attribute
			 */
			toOpts : function(ele) {
				var opts = NTR.string.trimToNull(NTR(ele).attr("class"));
				if (opts != null && opts.indexOf("{") > -1 && opts.indexOf("}") > -1) {
					return JSON.parse(opts.substring(opts.indexOf("{"), opts.indexOf("}") + 1));
				}
			},
			/**
			 * make rules object from input element
			 */
			toRules : function(ele, ruleset) {
				var retRules = new Object();
				var rules;
				ele.each(function() {
					rules = N.element.toOpts(this);
					if(rules !== undefined && rules[ruleset] != undefined) {
						retRules[$(this).attr("id")] = rules[ruleset];
					}
				});
				return retRules;
			},
			/**
			 * make data object from input element
			 */
			toData : function(eles) {
				var retData = new Object();
				var key, ele;
				eles.each(function() {
					key = $(this).attr("id");
					ele = $(this);
					if(ele.is("input:radio") || ele.is("input:checkbox")) {
						//TODO 이미 radio나 checkbox 로 잡았다면 루프의 다음번은 통과하도록 더 최적화 필요
						ele = ele.siblings("input:" + ele.attr("type") + "[id^='" + ele.attr("name") + "']");
						ele.push(this);
						if(ele.length > 1) {
							key = ele.attr("name");
						} else if (ele.length === 1) {
							key = ele.attr("id");
							if(key === undefined) {
								key = ele.attr("name");
							}
						}
						if(key !== undefined) {
							retData[key] = ele.vals();
						}
					} else {
						if(key !== undefined) {
							if(!ele.is("select")) {
								retData[key] = ele.val();
							} else {
								retData[key] = ele.vals();
							}
						}
					}
				});
				return retData;
			},
			maxZindex : function(nContext) {
				if (nContext == null) {
					nContext = $("div, span");
				}
				return Math.max.apply(null, $.map(nContext, function(e, n) {
					if ($(e).css("z-index") >= parseInt("2147483647")) {
						$(e).css("z-index", String(parseInt("2147483647") - 999));
						$(e).attr("fixed", "[Natural-JS]limited_z-index_value(-999)");
					}
					return parseInt($(e).css("z-index")) || 1;
				}));
			},
			disable : function(e) {
		        e.preventDefault();
		        e.stopImmediatePropagation();
		        e.stopPropagation();
		        return false;
		    },
		    dataChanged : function(ele) {
		    	ele.animate({"opacity": "0.5"}, "fast").animate({"opacity": "1"}, "slow");
		    }
		},
		"browser" : {
			"cookie" : function(name, value, expiredays) {
				if (value === undefined) {
					var getCookieVar = function(offset) {
						var endstr = document.cookie.indexOf(";", offset);
						if (endstr == -1) {
							endstr = document.cookie.length;
						}
						return unescape(document.cookie.substring(offset, endstr));
					};

					var arg = name + "=";
					var alen = arg.length;
					var clen = document.cookie.length;
					var i = 0;
					while (i < clen) {
						var j = i + alen;
						if (document.cookie.substring(i, j) == arg) {
							return getCookieVar(j);
						}
						i = document.cookie.indexOf(" ", i) + 1;
						if (i == 0) {
							break;
						}
					}
					return null;
				} else {
					var expires = -1;
					if (expiredays != null) {
						var today = new Date();
						today.setDate(today.getDate() + expiredays);
						expires = today.toGMTString();
					}
					document.cookie = name + "=" + escape(value) + "; path=/; expires=" + expires + ";";
				}
			},
			removeCookie : function(name, domain) {
				if (domain) {
					document.cookie = name + "=; path=/; expires=" + (new Date(1)) + "; domain=" + domain;
				} else {
					document.cookie = name + "=; path=/; expires=" + (new Date(1)) + ";";
				}
			},
			msieVersion : function() {
				var ua = window.navigator.userAgent;
				var msie = ua.indexOf("MSIE ");
				var trident = ua.match(/Trident\/(\d.\d)/i);
				if (msie < 0) {
					return -1;
				} else {
					if (trident == null) {
						return parseInt(ua.substring(msie + 5, ua.indexOf(".", msie)));
					} else {
						return parseInt(trident[1]) + 4.0;
					}
				}
			},
			documentHeight : function() {
				return Math.max(Math.max(document.body.scrollHeight, document.documentElement.scrollHeight), Math.max(document.body.offsetHeight,
						document.documentElement.offsetHeight), Math.max(document.body.clientHeight, document.documentElement.clientHeight));
			},
			browserHeight : function() {
				var totalHeight = 0;
				if ($.browser.msie) {
					var scrollHeight = document.documentElement.scrollHeight;
					var browserHeight = document.documentElement.clientHeight;
					totalHeight = scrollHeight < browserHeight ? browserHeight : scrollHeight;
				} else if ($.browser.mozilla) {
					var bodyHeight = document.body.clientHeight;
					totalHeight = window.innerHeight < bodyHeight ? bodyHeight : window.innerHeight;
				} else if ($.browser.webkit) {
					totalHeight = document.body.scrollHeight;
				}
				return totalHeight;
			},
			type : function() {
				var ua = navigator.userAgent.toLowerCase();
		        var match = /(chrome)[ \/]([\w.]+)/.exec( ua ) ||
		            /(webkit)[ \/]([\w.]+)/.exec( ua ) ||
		            /(opera)(?:.*version|)[ \/]([\w.]+)/.exec( ua ) ||
		            /(msie) ([\w.]+)/.exec( ua ) ||
		            ua.indexOf("compatible") < 0 && /(mozilla)(?:.*? rv:([\w.]+)|)/.exec( ua ) ||
		            [];
		        return {
		            browser: match[ 1 ] || "",
		            version: match[ 2 ] || "0"
		        };
			},
			scrollbarWidth : function() {
				var div = $('<div class="antiscroll-inner" style="width:50px;height:50px;overflow-y:scroll;'
					+ 'position:absolute;top:-200px;left:-200px;"><div style="height:100px;width:100%"/>'
					+ '</div>');

				$("body").append(div);
				var w1 = $(div).innerWidth();
				var w2 = $("div", div).innerWidth();
				$(div).remove();

				return w1 - w2;
			}
		},
		"message" : {
			replaceMsgVars : function(msg, vars) {
				if (vars !== undefined) {
					for (var i = 0; i < vars.length; i++) {
						msg = msg.split("{" + String(i) + "}").join(vars[i]);
					}
				}
				return msg;
			},
			get : function(resource, k, vars) {
				var msg = resource[NTR.locale()][k];
				return msg !== undefined ? N.message.replaceMsgVars(msg, vars) : k;
			}
		},
		"json" : {
			"format" : function(oData, sIndent) {
				if (oData != null && !NTR.isEmptyObject(oData)) {
					if (NTR.isString(oData)) {
						oData = JSON.parse(oData);
					}
					if(sIndent === undefined) {
						sIndent = 4;
					}
					return JSON.stringify(oData, undefined, sIndent);
				} else {
					return null;
				}
			}
		}
	});
	$.fn.extend(NTR.fn);

	NTR.fn = NTR.prototype = {
		constructor : NTR,
		get : $.fn.get,
		"remove_" : function(idx, length) {
			if (idx !== undefined) {
				if (!NTR.isNumeric(idx)) {
					idx = this.toArray().indexOf(idx);
				}
				if (length === undefined) {
					length = 1;
				}
				this.splice(idx, length);
			}
			return this;
		},
		toArray : $.fn.toArray,
		tpBind : function(event, handler) {
			this.each(function() {
				if($._data(this, "events") !== undefined) {
		            $(this).bind(event, handler);
		            $(this).each(function() {
		                var handlers = $._data(this, "events")[event.split(".")[0]];
		                var handler = handlers.pop();
		                handlers.splice(0, 0, handler);
		            });
		        } else {
		        	$(this).bind(event, handler);
		        }
			});
	    },
	    instance : function(name, instance) {
	    	if(instance !== undefined) {
	    		if(NTR.type(instance) === "function") {
	    			//instance is callback function
	    			var inst;
	    			this.each(function(i) {
	    				inst = $(this).data(name + "__");
	    				instance.call(inst, i, inst);
	    			});
	    		} else {
	    			//set instance
	    			this.data(name + "__", instance);
	    		}
	    	}
	    	return this.data(name + "__");
	    },
	    vals : function(vals) {
	    	var tagName = this.get(0).tagName.toLowerCase();
	    	var type = N.string.trimToEmpty(this.attr("type")).toLowerCase();
	    	var selEle;
	    	//TODO function 쪽 다시 테스트 바람
	    	if(vals !== undefined && NTR.type(vals) !== "function") {
	    		if (tagName === "select") {
	    			if(NTR.string.trimToNull(vals) == null && !this.is("select[multiple='multiple']")) {
	    				opts.context.get(0).selectedIndex = 0;
	    			} else {
	    				this.val(vals);
	    			}
		        } else if (type === "checkbox") {
		        	if(NTR.type(vals) === "string") {
		        		vals = [ vals ];
		        	}
		        	if(this.length > 1) {
		        		this.prop("checked", false);
		        		var this_ = this;
		        		NTR(vals).each(function() {
		        			this_.filter("[value='" + String(this) + "']").prop("checked", true);
		        		});
		        	} else if(this.length === 1) {
		        		//TODO test 해야됨
		        		if(NTR.context.attr("core")["sgChkdVal"] === vals[0]) {
		        			this.prop("checked", true);
		        		} else if (NTR.context.attr("core")["sgUnChkdVal"] === vals[0]) {
		        			this.prop("checked", false);
		        		} else {
		        			this.filter("[value='" + String(vals[0]) + "']").prop("checked", true);
		        		}
		        		this.val(vals[0]);
	        		}
		        } else if (type === "radio") {
		        	this.filter("[value='" + String(vals) + "']").prop("checked", true);
		        }
	    		return this;
	    	} else {
		        if (tagName === "select") {
		        	selEle = this.find("> option:selected");
		        	if(selEle.length > 1) {
		        		if(NTR.type(vals) !== "function") {
		        			return selEle.map(function() {
			                    return $(this).val();
				            });
		        		} else {
		        			var ele = this.find("> option");
		        			return selEle.each(function() {
		        				vals.call(this, ele.index(this), this);
		        			});
		        		}
		        	} else if(selEle.length === 1) {
	        			if(NTR.type(vals) !== "function") {
	        				if(selEle.attr("value") !== undefined) {
	        					return selEle.val();
	        				} else {
	        					return "";
	        				}
	        			} else {
	        				vals.call(selEle, this.find("> option:not(.select_default__)").index(selEle), selEle);
	        				return selEle;
	        			}
		        	}
		        } else if (type === "radio") {
		        	selEle = this.filter("[name='" + this.attr("name") + "']:checked");
		        	if(NTR.type(vals) !== "function") {
		        		return NTR.string.trimToNull(selEle.val());
		        	} else {
		        		vals.call(selEle, this.filter("[name='" + this.attr("name") + "']").index(selEle), selEle);
        				return selEle;
		        	}
		        } else if (type === "checkbox") {
		        	selEle = this.filter("[name='" + this.attr("name") + "']:checked");
		        	if(this.length > 1) {
		        		if(NTR.type(vals) !== "function") {
		        			return selEle.length === 1 ? $(selEle).val() : selEle.map(function() {
			                    return $(this).val();
				            });
		        		} else {
		        			var ele = this.filter("[name='" + this.attr("name") + "']");
		        			return selEle.each(function() {
		        				vals.call(this, ele.index(this), this);
		        			});
		        		}
		        	} else if( this.length === 1) {
		        		if(selEle.length === 0) {
		        			selEle = this.filter("[id='" + this.attr("id") + "']");
		        		}
	        			if(NTR.type(vals) !== "function") {
	        				var val = selEle.val();
	        				if(NTR.context.attr("core")["sgChkdVal"] === val || NTR.context.attr("core")["sgUnChkdVal"] === val || selEle.attr("value") === undefined) {
	        					if(selEle.prop("checked")) {
	        						val = NTR.context.attr("core")["sgChkdVal"];
	        						selEle.val(val);
		        					return val;
				        		} else if (!selEle.prop("checked")) {
				        			val = NTR.context.attr("core")["sgUnChkdVal"];
	        						selEle.val(val);
		        					return val;
				        		}
	        				} else {
			        			return val;
			        		}
	        			} else {
	        				vals.call(selEle, this.filter("[name='" + this.attr("name") + "']").index(selEle), selEle);
	        				return selEle;
	        			}
	        		}
	        	}
	    	}
	    	return null;
	    }
	};

	(function(N) {

	})(NTR);

	/**
	*  Base64 encode / decode
	*  http://www.webtoolkit.info/
	**/
	NTR.Base64 = {
		// private property
		_keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

		// public method for encoding
		encode : function(input) {
			var output = "";
			var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
			var i = 0;
			input = Base64._utf8_encode(input);
			while (i < input.length) {
				chr1 = input.charCodeAt(i++);
				chr2 = input.charCodeAt(i++);
				chr3 = input.charCodeAt(i++);

				enc1 = chr1 >> 2;
				enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
				enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
				enc4 = chr3 & 63;

				if (isNaN(chr2)) {
					enc3 = enc4 = 64;
				} else if (isNaN(chr3)) {
					enc4 = 64;
				}
				output = output + this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) + this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);
			}
			return output;
		},
		// public method for decoding
		decode : function(input) {
			var output = "";
			var chr1, chr2, chr3;
			var enc1, enc2, enc3, enc4;
			var i = 0;
			input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
			while (i < input.length) {
				enc1 = this._keyStr.indexOf(input.charAt(i++));
				enc2 = this._keyStr.indexOf(input.charAt(i++));
				enc3 = this._keyStr.indexOf(input.charAt(i++));
				enc4 = this._keyStr.indexOf(input.charAt(i++));

				chr1 = (enc1 << 2) | (enc2 >> 4);
				chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
				chr3 = ((enc3 & 3) << 6) | enc4;

				output = output + String.fromCharCode(chr1);

				if (enc3 != 64) {
					output = output + String.fromCharCode(chr2);
				}
				if (enc4 != 64) {
					output = output + String.fromCharCode(chr3);
				}
			}
			output = Base64._utf8_decode(output);
			return output;
		},
		// private method for UTF-8 encoding
		_utf8_encode : function(string) {
			string = string.replace(/\r\n/g, "\n");
			var utftext = "";
			for (var n = 0; n < string.length; n++) {
				var c = string.charCodeAt(n);

				if (c < 128) {
					utftext += String.fromCharCode(c);
				} else if ((c > 127) && (c < 2048)) {
					utftext += String.fromCharCode((c >> 6) | 192);
					utftext += String.fromCharCode((c & 63) | 128);
				} else {
					utftext += String.fromCharCode((c >> 12) | 224);
					utftext += String.fromCharCode(((c >> 6) & 63) | 128);
					utftext += String.fromCharCode((c & 63) | 128);
				}
			}
			return utftext;
		},
		// private method for UTF-8 decoding
		_utf8_decode : function(utftext) {
			var string = "";
			var i = 0;
			var c = 0;
			var c2 = 0;
			var c3 = 0;
			while (i < utftext.length) {
				c = utftext.charCodeAt(i);

				if (c < 128) {
					string += String.fromCharCode(c);
					i++;
				} else if ((c > 191) && (c < 224)) {
					c2 = utftext.charCodeAt(i + 1);
					string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
					i += 2;
				} else {
					c2 = utftext.charCodeAt(i + 1);
					c3 = utftext.charCodeAt(i + 2);
					string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
					i += 3;
				}
			}

			return string;
		}
	};

	// formatDate :
	// a PHP date like function, for formatting date strings
	// authored by Svend Tofte <www.svendtofte.com>
	// the code is in the public domain
	//
	// see http://www.svendtofte.com/javascript/javascript-date-string-formatting/
	// and http://www.php.net/date
	//
	// thanks to
	// - Daniel Berlin <mail@daniel-berlin.de>,
	// major overhaul and improvements
	// - Matt Bannon,
	// correcting some stupid bugs in my days-in-the-months list!
	// - levon ghazaryan. pointing out an error in z switch.
	// - Andy Pemberton. pointing out error in c switch
	//
	// input : format string
	// time : epoch time (seconds, and optional)
	//
	// if time is not passed, formatting is based on
	// the current "this" date object's set time.
	//
	// supported switches are
	// a, A, B, c, d, D, F, g, G, h, H, i, I (uppercase i), j, l (lowecase L),
	// L, m, M, n, N, O, P, r, s, S, t, U, w, W, y, Y, z, Z
	//
	// unsupported (as compared to date in PHP 5.1.3)
	// T, e, o
	Date.prototype.formatDate = function(input, time) {
		var daysLong = [ "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday" ];
		var daysShort = [ "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat" ];
		var monthsShort = [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ];
		var monthsLong = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];

		var switches = { // switches object
			a : function() {
				// Lowercase Ante meridiem and Post meridiem
				return date.getHours() > 11 ? "pm" : "am";
			},
			A : function() {
				// Uppercase Ante meridiem and Post meridiem
				return (this.a().toUpperCase());
			},
			B : function() {
				// Swatch internet time. code simply grabbed from ppk,
				// since I was feeling lazy:
				// http://www.xs4all.nl/~ppk/js/beat.html
				var off = (date.getTimezoneOffset() + 60) * 60;
				var theSeconds = (date.getHours() * 3600) + (date.getMinutes() * 60) + date.getSeconds() + off;
				var beat = Math.floor(theSeconds / 86.4);
				if (beat > 1000)
					beat -= 1000;
				if (beat < 0)
					beat += 1000;
				if ((String(beat)).length == 1)
					beat = "00" + beat;
				if ((String(beat)).length == 2)
					beat = "0" + beat;
				return beat;
			},
			c : function() {
				// ISO 8601 date (e.g.: "2004-02-12T15:19:21+00:00"), as per
				// http://www.cl.cam.ac.uk/~mgk25/iso-time.html
				return (this.Y() + "-" + this.m() + "-" + this.d() + "T" + this.H() + ":" + this.i() + ":" + this.s() + this.P());
			},
			d : function() {
				// Day of the month, 2 digits with leading zeros
				var j = String(this.j());
				return (j.length == 1 ? "0" + j : j);
			},
			D : function() {
				// A textual representation of a day, three letters
				return daysShort[date.getDay()];
			},
			F : function() {
				// A full textual representation of a month
				return monthsLong[date.getMonth()];
			},
			g : function() {
				// 12-hour format of an hour without leading zeros, 1 through 12!
				if (date.getHours() == 0) {
					return 12;
				} else {
					return date.getHours() > 12 ? date.getHours() - 12 : date.getHours();
				}
			},
			G : function() {
				// 24-hour format of an hour without leading zeros
				return date.getHours();
			},
			h : function() {
				// 12-hour format of an hour with leading zeros
				var g = String(this.g());
				return (g.length == 1 ? "0" + g : g);
			},
			H : function() {
				// 24-hour format of an hour with leading zeros
				var G = String(this.G());
				return (G.length == 1 ? "0" + G : G);
			},
			i : function() {
				// Minutes with leading zeros
				var min = String(date.getMinutes());
				return (min.length == 1 ? "0" + min : min);
			},
			I : function() {
				// Whether or not the date is in daylight saving time (DST)
				// note that this has no bearing in actual DST mechanics,
				// and is just a pure guess. buyer beware.
				var noDST = new Date("January 1 " + this.Y() + " 00:00:00");
				return (noDST.getTimezoneOffset() == date.getTimezoneOffset() ? 0 : 1);
			},
			j : function() {
				// Day of the month without leading zeros
				return date.getDate();
			},
			l : function() {
				// A full textual representation of the day of the week
				return daysLong[date.getDay()];
			},
			L : function() {
				// leap year or not. 1 if leap year, 0 if not.
				// the logic should match iso's 8601 standard.
				// http://www.uic.edu/depts/accc/software/isodates/leapyear.html
				var Y = this.Y();
				if ((Y % 4 == 0 && Y % 100 != 0) || (Y % 4 == 0 && Y % 100 == 0 && Y % 400 == 0)) {
					return 1;
				} else {
					return 0;
				}
			},
			m : function() {
				// Numeric representation of a month, with leading zeros
				var n = String(this.n());
				return (n.length == 1 ? "0" + n : n);
			},
			M : function() {
				// A short textual representation of a month, three letters
				return monthsShort[date.getMonth()];
			},
			n : function() {
				// Numeric representation of a month, without leading zeros
				return date.getMonth() + 1;
			},
			N : function() {
				// ISO-8601 numeric representation of the day of the week
				var w = this.w();
				return (w == 0 ? 7 : w);
			},
			O : function() {
				// Difference to Greenwich time (GMT) in hours
				var os = Math.abs(date.getTimezoneOffset());
				var h = String(Math.floor(os / 60));
				var m = String(os % 60);
				h.length == 1 ? h = "0" + h : 1;
				m.length == 1 ? m = "0" + m : 1;
				return date.getTimezoneOffset() < 0 ? "+" + h + m : "-" + h + m;
			},
			P : function() {
				// Difference to GMT, with colon between hours and minutes
				var O = this.O();
				return (O.substr(0, 3) + ":" + O.substr(3, 2));
			},
			r : function() {
				// RFC 822 formatted date
				var r; // result
				// Thu , 21 Dec 2000
				r = this.D() + ", " + this.d() + " " + this.M() + " " + this.Y() +
				// 16 : 01 : 07 0200
				" " + this.H() + ":" + this.i() + ":" + this.s() + " " + this.O();
				return r;
			},
			s : function() {
				// Seconds, with leading zeros
				var sec = String(date.getSeconds());
				return (sec.length == 1 ? "0" + sec : sec);
			},
			S : function() {
				// English ordinal suffix for the day of the month, 2 characters
				switch (date.getDate()) {
				case 1:
					return ("st");
				case 2:
					return ("nd");
				case 3:
					return ("rd");
				case 21:
					return ("st");
				case 22:
					return ("nd");
				case 23:
					return ("rd");
				case 31:
					return ("st");
				default:
					return ("th");
				}
			},
			t : function() {
				// thanks to Matt Bannon for some much needed code-fixes here!
				var daysinmonths = [ null, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ];
				if (this.L() == 1 && this.n() == 2)
					return 29; // ~leap day
				return daysinmonths[this.n()];
			},
			U : function() {
				// Seconds since the Unix Epoch (January 1 1970 00:00:00 GMT)
				return Math.round(date.getTime() / 1000);
			},
			w : function() {
				// Numeric representation of the day of the week
				return date.getDay();
			},
			W : function() {
				// Weeknumber, as per ISO specification:
				// http://www.cl.cam.ac.uk/~mgk25/iso-time.html

				var DoW = this.N();
				var DoY = this.z();

				// If the day is 3 days before New Year's Eve and is Thursday or earlier,
				// it's week 1 of next year.
				var daysToNY = 364 + this.L() - DoY;
				if (daysToNY <= 2 && DoW <= (3 - daysToNY)) {
					return 1;
				}

				// If the day is within 3 days after New Year's Eve and is Friday or later,
				// it belongs to the old year.
				if (DoY <= 2 && DoW >= 5) {
					return new Date(this.Y() - 1, 11, 31).formatDate("W");
				}

				var nyDoW = new Date(this.Y(), 0, 1).getDay();
				nyDoW = nyDoW != 0 ? nyDoW - 1 : 6;

				if (nyDoW <= 3) { // First day of the year is a Thursday or earlier
					return (1 + Math.floor((DoY + nyDoW) / 7));
				} else { // First day of the year is a Friday or later
					return (1 + Math.floor((DoY - (7 - nyDoW)) / 7));
				}
			},
			y : function() {
				// A two-digit representation of a year
				var y = String(this.Y());
				return y.substring(y.length - 2, y.length);
			},
			Y : function() {
				// A full numeric representation of a year, 4 digits

				// we first check, if getFullYear is supported. if it
				// is, we just use that. ppks code is nice, but wont
				// work with dates outside 1900-2038, or something like that
				if (date.getFullYear) {
					var newDate = new Date("January 1 2001 00:00:00 +0000");
					var x = newDate.getFullYear();
					if (x == 2001) {
						// i trust the method now
						return date.getFullYear();
					}
				}
				// else, do this:
				// codes thanks to ppk:
				// http://www.xs4all.nl/~ppk/js/introdate.html
				var x = date.getYear();
				var y = x % 100;
				y += (y < 38) ? 2000 : 1900;
				return y;
			},
			z : function() {
				// The day of the year, zero indexed! 0 through 366
				var s = "January 1 " + this.Y() + " 00:00:00 GMT" + this.O();
				var t = new Date(s);
				var diff = date.getTime() - t.getTime();
				return Math.floor(diff / 1000 / 60 / 60 / 24);
			},
			Z : function() {
				// Timezone offset in seconds
				return (date.getTimezoneOffset() * -60);
			}
		};

		var date = time ? new Date(time) : this;

		var formatString = input.split("");
		var i = 0;
		while (i < formatString.length) {
			if (formatString[i] == "%") {
				// this is our way of allowing users to escape stuff
				formatString.splice(i, 1);
			} else {
				formatString[i] = switches[formatString[i]] != undefined ? switches[formatString[i]]() : formatString[i];
			}
			i++;
		}
		return formatString.join("");
	};

	/**
	 * @reference Mask JavaScript API(http://www.pengoworks.com/workshop/js/mask/,
	 *            dswitzer@pengoworks.com)
	 */
	NTR.Mask = function(m) {
		this.format = m;
		this.error = [];
		this.errorCodes = [];
		this.strippedValue = "";
		this.allowPartial = false;

		this.throwError = function(c, e, v) {
			this.error[this.error.length] = e;
			this.errorCodes[this.errorCodes.length] = c;
			if (typeof v == "string") {
				return v;
			}
			return true;
		};

		this.setGeneric = function(_v, _d) {
			var v = _v, m = this.format;
			var r = "@#*", rt = new Array(), nv = "", t, x, a = new Array(), j = 0, rx = {
				"@" : "A-Za-z",
				"#" : "0-9",
				"*" : "A-Za-z0-9"
			};

			// strip out invalid characters
			v = v.replace(new RegExp("[^" + rx["*"] + "]", "gi"), "");
			if ((_d == true) && (v.length == this.strippedValue.length)) {
				v = v.substring(0, v.length - 1);
			}
			this.strippedValue = v;
			var b = new Array();
			for (var i = 0; i < m.length; i++) {
				// grab the current character
				x = m.charAt(i);
				// check to see if current character is a mask, escape commands are
				// not a mask character
				t = (r.indexOf(x) > -1);
				// if the current character is an escape command, then grab the next
				// character
				if (x == "!") {
					x = m.charAt(i++);
				}
				// build a regex to test against
				if ((t && !this.allowPartial) || (t && this.allowPartial && (rt.length < v.length))) {
					rt[rt.length] = "[" + rx[x] + "]";
				}
				// build mask definition table
				a[a.length] = {
					"chr" : x,
					"mask" : t
				};
			}

			var hasOneValidChar = false;
			// if the regex fails, return an error
			if (!this.allowPartial && !(new RegExp(rt.join(""))).test(v)) {
				return this.throwError(1, "The value \"" + _v + "\" must be in the format " + this.format + ".", _v);
			} else if ((this.allowPartial && (v.length > 0)) || !this.allowPartial) {
				for (i = 0; i < a.length; i++) {
					if (a[i].mask) {
						while (v.length > 0 && !(new RegExp(rt[j])).test(v.charAt(j))) {
							v = (v.length == 1) ? "" : v.substring(1);
						}
						if (v.length > 0) {
							nv += v.charAt(j);
							hasOneValidChar = true;
						}
						j++;
					} else {
						nv += a[i].chr;
					}
					if (this.allowPartial && (j > v.length)) {
						break;
					}
				}
			}

			if (this.allowPartial && !hasOneValidChar) {
				nv = "";
			}
			if (this.allowPartial) {
				if (nv.length < a.length) {
					this.nextValidChar = rx[a[nv.length].chr];
				} else {
					this.nextValidChar = null;
				}
			}

			return nv;
		};

		this.setNumeric = function(_v, _p, _d) {
			var v = String(_v).replace(/[^\d.-]*/gi, ""), m = this.format;
			// make sure there's only one decimal point
			v = v.replace(/\./, "d").replace(/\./g, "").replace(/d/, ".");

			// check to see if an invalid mask operation has been entered
			if (!/^[\$]?((\$?[\+-]?([0#]{1,3},)?[0#]*(\.[0#]*)?)|([\+-]?\([\+-]?([0#]{1,3},)?[0#]*(\.[0#]*)?\)))$/.test(m)) {
				return this.throwError(1, "An invalid numeric user format was specified for the \nNumeric user format constructor.", _v);
			}

			if ((_d == true) && (v.length == this.strippedValue.length)) {
				v = v.substring(0, v.length - 1);
			}

			if (this.allowPartial && (v.replace(/[^0-9]/, "").length == 0)) {
				return v;
			}
			this.strippedValue = v;

			if (v.length == 0) {
				v = NaN;
			}
			var vn = Number(v);
			if (isNaN(vn)) {
				return this.throwError(2, "The value entered was not a number.", _v);
			}

			// if no mask, stop processing
			if (m.length == 0) {
				return v;
			}

			// get the value before the decimal point
			var vi = String(Math.abs((v.indexOf(".") > -1) ? v.split(".")[0] : v));
			// get the value after the decimal point
			var vd = (v.indexOf(".") > -1) ? v.split(".")[1] : "";
			var _vd = vd;

			var isNegative = (vn != 0 && Math.abs(vn) * -1 == vn);

			// check for masking operations
			var show = {
				"$" : /^[\$]/.test(m),
				"(" : (isNegative && (m.indexOf("(") > -1)),
				"+" : ((m.indexOf("+") != -1) && !isNegative)
			};
			show["-"] = (isNegative && (!show["("] || (m.indexOf("-") != -1)));

			// replace all non-place holders from the mask
			m = m.replace(/[^#0.,]*/gi, "");

			// make sure there are the correct number of decimal places
			// get number of digits after decimal point in mask
			var dm = (m.indexOf(".") > -1) ? m.split(".")[1] : "";
			if (dm.length == 0) {
				if (_p != null && _p == "round") {
					vi = String(Math.round(Number(vi)));
				} else if (_p != null && _p == "ceil") {
					vi = String(Math.ceil(Number(vi)));
				} else {
					vi = String(Math.floor(Number(vi)));
				}
				vd = "";
			} else {
				// find the last zero, which indicates the minimum number
				// of decimal places to show
				var md = dm.lastIndexOf("0") + 1;
				// if the number of decimal places is greater than the mask, then
				// round off
				if (vd.length > dm.length) {
					if (_p != null && _p == "round") {
						vd = String(Math.round(Number(vd.substring(0, dm.length + 1)) / 10));
					} else if (_p != null && _p == "ceil") {
						vd = String(Math.ceil(Number(vd.substring(0, dm.length + 1)) / 10));
					} else {
						vd = String(Math.floor(Number(vd.substring(0, dm.length + 1)) / 10));
					}
				} else {
					// otherwise, pad the string w/the required zeros
					while (vd.length < md) {
						vd += "0";
					}
				}
			}

			/*
			 * pad the int with any necessary zeros
			 */
			// get number of digits before decimal point in mask
			var im = (m.indexOf(".") > -1) ? m.split(".")[0] : m;
			im = im.replace(/[^0#]+/gi, "");
			// find the first zero, which indicates the minimum length
			// that the value must be padded w/zeros
			var mv = im.indexOf("0") + 1;
			// if there is a zero found, make sure it's padded
			if (mv > 0) {
				mv = im.length - mv + 1;
				while (vi.length < mv) {
					vi = "0" + vi;
				}
			}

			// check to see if we need commas in the thousands place holder
			if (/[#0]+,[#0]{3}/.test(m)) {
				// add the commas as the place holder
				var x = [], i = 0, n = Number(vi);
				while (n > 999) {
					x[i] = "00" + String(n % 1000);
					x[i] = x[i].substring(x[i].length - 3);
					n = Math.floor(n / 1000);
					i++;
				}
				x[i] = String(n % 1000);
				vi = x.reverse().join(",");
			}

			// combine the new value together
			if ((vd.length > 0 && !this.allowPartial) || ((dm.length > 0) && this.allowPartial && (v.indexOf(".") > -1) && (_vd.length >= vd.length))) {
				v = vi + "." + vd;
			} else if ((dm.length > 0) && this.allowPartial && (v.indexOf(".") > -1) && (_vd.length < vd.length)) {
				v = vi + "." + _vd;
			} else {
				v = vi;
			}

			if (show["$"]) {
				v = this.format.replace(/(^[\$])(.+)/gi, "$") + v;
			}
			if (show["+"]) {
				v = "+" + v;
			}
			if (show["-"]) {
				v = "-" + v;
			}
			if (show["("]) {
				v = "(" + v + ")";
			}
			return v;
		};

	};

	// Some (not all) predefined format strings from PHP 5.1.1, which
	// offer standard date representations.
	// See: http://www.php.net/manual/en/ref.datetime.php#datetime.constants

	// Atom "2005-08-15T15:52:01+00:00"
	Date.DATE_ATOM = "Y-m-d%TH:i:sP";
	// ISO-8601 "2005-08-15T15:52:01+0000"
	Date.DATE_ISO8601 = "Y-m-d%TH:i:sO";
	// RFC 2822 "Mon, 15 Aug 2005 15:52:01 +0000"
	Date.DATE_RFC2822 = "D, d M Y H:i:s O";
	// W3C "2005-08-15 15:52:01+00:00"
	Date.DATE_W3C = "Y-m-d%TH:i:sP";

	/*
	 * json2.js 2013-05-26 Public Domain. NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK. See http://www.JSON.org/js.html
	 *
	 * This code should be minified before deployment. See http://javascript.crockford.com/jsmin.html USE YOUR OWN COPY. IT IS EXTREMELY UNWISE TO LOAD CODE FROM SERVERS YOU DO NOT CONTROL.
	 *
	 * This file creates a global JSON object containing two methods: stringify and parse. JSON.stringify(value, replacer, space) value any JavaScript value, usually an object or array. replacer an optional parameter that determines how object values are stringified for objects. It can be a function or an array of
	 * strings. space an optional parameter that specifies the indentation of nested structures. If it is omitted, the text will be packed without extra whitespace. If it is a number, it will specify the number of spaces to indent at each level. If it is a string (such as '\t' or '&nbsp;'), it contains the characters
	 * used to indent at each level. This method produces a JSON text from a JavaScript value. When an object value is found, if the object contains a toJSON method, its toJSON method will be called and the result will be stringified. A toJSON method does not serialize: it returns the value represented by the
	 * name/value pair that should be serialized, or undefined if nothing should be serialized. The toJSON method will be passed the key associated with the value, and this will be bound to the value For example, this would serialize Dates as ISO strings. Date.prototype.toJSON = function (key) { function f(n) { //
	 * Format integers to have at least two digits. return n < 10 ? '0' + n : n; } return this.getUTCFullYear() + '-' + f(this.getUTCMonth() + 1) + '-' + f(this.getUTCDate()) + 'T' + f(this.getUTCHours()) + ':' + f(this.getUTCMinutes()) + ':' + f(this.getUTCSeconds()) + 'Z'; }; You can provide an optional replacer
	 * method. It will be passed the key and value of each member, with this bound to the containing object. The value that is returned from your method will be serialized. If your method returns undefined, then the member will be excluded from the serialization. If the replacer parameter is an array of strings, then
	 * it will be used to select the members to be serialized. It filters the results such that only members with keys listed in the replacer array are stringified. Values that do not have JSON representations, such as undefined or functions, will not be serialized. Such values in objects will be dropped; in arrays
	 * they will be replaced with null. You can use a replacer function to replace those with JSON values. JSON.stringify(undefined) returns undefined. The optional space parameter produces a stringification of the value that is filled with line breaks and indentation to make it easier to read. If the space parameter
	 * is a non-empty string, then that string will be used for indentation. If the space parameter is a number, then the indentation will be that many spaces. Example: text = JSON.stringify(['e', {pluribus: 'unum'}]); // text is '["e",{"pluribus":"unum"}]'
	 *
	 * text = JSON.stringify(['e', {pluribus: 'unum'}], null, '\t'); // text is '[\n\t"e",\n\t{\n\t\t"pluribus": "unum"\n\t}\n]' text = JSON.stringify([new Date()], function (key, value) { return this[key] instanceof Date ? 'Date(' + this[key] + ')' : value; }); // text is '["Date(---current time---)"]'
	 *
	 * JSON.parse(text, reviver) This method parses a JSON text to produce an object or array. It can throw a SyntaxError exception. The optional reviver parameter is a function that can filter and transform the results. It receives each of the keys and values, and its return value is used instead of the original
	 * value. If it returns what it received, then the structure is not modified. If it returns undefined then the member is deleted. Example: // Parse the text. Values that look like ISO date strings will // be converted to Date objects. myData = JSON.parse(text, function (key, value) { var a; if (typeof value ===
	 * 'string') { a = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value); if (a) { return new Date(Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4], +a[5], +a[6])); } } return value; }); myData = JSON.parse('["Date(09/09/2001)"]', function (key, value) { var d; if (typeof value === 'string' &&
	 * value.slice(0, 5) === 'Date(' && value.slice(-1) === ')') { d = new Date(value.slice(5, -1)); if (d) { return d; } } return value; });
	 *
	 * This is a reference implementation. You are free to copy, modify, or redistribute.
	 */

	/* jslint evil: true, regexp: true */
	/*
	 * members "", "\b", "\t", "\n", "\f", "\r", "\"", JSON, "\\", apply, call, charCodeAt, getUTCDate, getUTCFullYear, getUTCHours, getUTCMinutes, getUTCMonth, getUTCSeconds, hasOwnProperty, join, lastIndex, length, parse, prototype, push, replace, slice, stringify, test, toJSON, toString, valueOf
	 */

	// Create a JSON object only if one does not already exist. We create the
	// methods in a closure to avoid creating global variables.
	if (typeof JSON !== 'object') {
		JSON = {};
	}

	(function() {
		'use strict';

		function f(n) {
			// Format integers to have at least two digits.
			return n < 10 ? '0' + n : n;
		}

		if (typeof Date.prototype.toJSON !== 'function') {

			Date.prototype.toJSON = function() {

				return isFinite(this.valueOf()) ? this.getUTCFullYear() + '-' + f(this.getUTCMonth() + 1) + '-' + f(this.getUTCDate()) + 'T'
						+ f(this.getUTCHours()) + ':' + f(this.getUTCMinutes()) + ':' + f(this.getUTCSeconds()) + 'Z' : null;
			};

			String.prototype.toJSON = Number.prototype.toJSON = Boolean.prototype.toJSON = function() {
				return this.valueOf();
			};
		}

		var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g, escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g, gap, indent, meta = { // table of character substitutions
			'\b' : '\\b',
			'\t' : '\\t',
			'\n' : '\\n',
			'\f' : '\\f',
			'\r' : '\\r',
			'"' : '\\"',
			'\\' : '\\\\'
		}, rep;

		function quote(string) {

			// If the string contains no control characters, no quote characters, and no
			// backslash characters, then we can safely slap some quotes around it.
			// Otherwise we must also replace the offending characters with safe escape
			// sequences.

			escapable.lastIndex = 0;
			return escapable.test(string) ? '"' + string.replace(escapable, function(a) {
				var c = meta[a];
				return typeof c === 'string' ? c : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
			}) + '"' : '"' + string + '"';
		}

		function str(key, holder) {

			// Produce a string from holder[key].

			var i, // The loop counter.
			k, // The member key.
			v, // The member value.
			length, mind = gap, partial, value = holder[key];

			// If the value has a toJSON method, call it to obtain a replacement value.

			if (value && typeof value === 'object' && typeof value.toJSON === 'function') {
				value = value.toJSON(key);
			}

			// If we were called with a replacer function, then call the replacer to
			// obtain a replacement value.

			if (typeof rep === 'function') {
				value = rep.call(holder, key, value);
			}

			// What happens next depends on the value's type.

			switch (typeof value) {
			case 'string':
				return quote(value);

			case 'number':

				// JSON numbers must be finite. Encode non-finite numbers as null.

				return isFinite(value) ? String(value) : 'null';

			case 'boolean':
			case 'null':

				// If the value is a boolean or null, convert it to a string. Note:
				// typeof null does not produce 'null'. The case is included here in
				// the remote chance that this gets fixed someday.

				return String(value);

				// If the type is 'object', we might be dealing with an object or an array or
				// null.

			case 'object':

				// Due to a specification blunder in ECMAScript, typeof null is 'object',
				// so watch out for that case.

				if (!value) {
					return 'null';
				}

				// Make an array to hold the partial results of stringifying this object value.

				gap += indent;
				partial = [];

				// Is the value an array?

				if (Object.prototype.toString.apply(value) === '[object Array]') {

					// The value is an array. Stringify every element. Use null as a placeholder
					// for non-JSON values.

					length = value.length;
					for (i = 0; i < length; i += 1) {
						partial[i] = str(i, value) || 'null';
					}

					// Join all of the elements together, separated with commas, and wrap them in
					// brackets.

					v = partial.length === 0 ? '[]' : gap ? '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']' : '[' + partial.join(',') + ']';
					gap = mind;
					return v;
				}

				// If the replacer is an array, use it to select the members to be stringified.

				if (rep && typeof rep === 'object') {
					length = rep.length;
					for (i = 0; i < length; i += 1) {
						if (typeof rep[i] === 'string') {
							k = rep[i];
							v = str(k, value);
							if (v) {
								partial.push(quote(k) + (gap ? ': ' : ':') + v);
							}
						}
					}
				} else {

					// Otherwise, iterate through all of the keys in the object.

					for (k in value) {
						if (Object.prototype.hasOwnProperty.call(value, k)) {
							v = str(k, value);
							if (v) {
								partial.push(quote(k) + (gap ? ': ' : ':') + v);
							}
						}
					}
				}

				// Join all of the member texts together, separated with commas,
				// and wrap them in braces.

				v = partial.length === 0 ? '{}' : gap ? '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}' : '{' + partial.join(',') + '}';
				gap = mind;
				return v;
			}
		}

		// If the JSON object does not yet have a stringify method, give it one.

		if (typeof JSON.stringify !== 'function') {
			JSON.stringify = function(value, replacer, space) {

				// The stringify method takes a value and an optional replacer, and an optional
				// space parameter, and returns a JSON text. The replacer can be a function
				// that can replace values, or an array of strings that will select the keys.
				// A default replacer method can be provided. Use of the space parameter can
				// produce text that is more easily readable.

				var i;
				gap = '';
				indent = '';

				// If the space parameter is a number, make an indent string containing that
				// many spaces.

				if (typeof space === 'number') {
					for (i = 0; i < space; i += 1) {
						indent += ' ';
					}

					// If the space parameter is a string, it will be used as the indent string.

				} else if (typeof space === 'string') {
					indent = space;
				}

				// If there is a replacer, it must be a function or an array.
				// Otherwise, throw an error.

				rep = replacer;
				if (replacer && typeof replacer !== 'function' && (typeof replacer !== 'object' || typeof replacer.length !== 'number')) {
					throw new Error('JSON.stringify');
				}

				// Make a fake root object containing our value under the key of ''.
				// Return the result of stringifying the value.

				return str('', {
					'' : value
				});
			};
		}

		// If the JSON object does not yet have a parse method, give it one.

		if (typeof JSON.parse !== 'function') {
			JSON.parse = function(text, reviver) {

				// The parse method takes a text and an optional reviver function, and returns
				// a JavaScript value if the text is a valid JSON text.

				var j;

				function walk(holder, key) {

					// The walk method is used to recursively walk the resulting structure so
					// that modifications can be made.

					var k, v, value = holder[key];
					if (value && typeof value === 'object') {
						for (k in value) {
							if (Object.prototype.hasOwnProperty.call(value, k)) {
								v = walk(value, k);
								if (v !== undefined) {
									value[k] = v;
								} else {
									delete value[k];
								}
							}
						}
					}
					return reviver.call(holder, key, value);
				}

				// Parsing happens in four stages. In the first stage, we replace certain
				// Unicode characters with escape sequences. JavaScript handles many characters
				// incorrectly, either silently deleting them, or treating them as line endings.

				text = String(text);
				cx.lastIndex = 0;
				if (cx.test(text)) {
					text = text.replace(cx, function(a) {
						return '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
					});
				}

				// In the second stage, we run the text against regular expressions that look
				// for non-JSON patterns. We are especially concerned with '()' and 'new'
				// because they can cause invocation, and '=' because it can cause mutation.
				// But just to be safe, we want to reject all unexpected forms.

				// We split the second stage into 4 regexp operations in order to work around
				// crippling inefficiencies in IE's and Safari's regexp engines. First we
				// replace the JSON backslash pairs with '@' (a non-JSON character). Second, we
				// replace all simple value tokens with ']' characters. Third, we delete all
				// open brackets that follow a colon or comma or that begin the text. Finally,
				// we look to see that the remaining characters are only whitespace or ']' or
				// ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.

				if (/^[\],:{}\s]*$/.test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@').replace(
						/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {

					// In the third stage we use the eval function to compile the text into a
					// JavaScript structure. The '{' operator is subject to a syntactic ambiguity
					// in JavaScript: it can begin a block or an object literal. We wrap the text
					// in parens to eliminate the ambiguity.

					j = eval('(' + text + ')');

					// In the optional fourth stage, we recursively walk the new structure, passing
					// each name/value pair to a reviver function for possible transformation.

					return typeof reviver === 'function' ? walk({
						'' : j
					}, '') : j;
				}

				// If the text is not JSON parseable, then a SyntaxError is thrown.

				throw new SyntaxError('JSON.parse');
			};
		}
	}());

	window.$.NTR = window.N = window.NTR = NTR;

})(window, jQuery);