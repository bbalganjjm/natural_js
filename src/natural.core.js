/*!
 * Natural-CORE v0.20.32
 *
 * Released under the LGPL v2.1 license
 * Date: 2014-09-26T11:11Z
 *
 * Copyright 2023 KIM HWANG MAN(bbalganjjm@gmail.com)
 *
 * Includes formatdate.js & Mask JavaScript API
 * formatdate.js : http://www.svendtofte.com/javascript/javascript-date-string-formatting/
 * Mask JavaScript API : http://www.pengoworks.com/workshop/js/mask/, dswitzer@pengoworks.com
 */
(function(window, $) {
    var N;

    // Use jQuery init
    N = function(selector, context) {
        var obj = new $.fn.init(selector, context);
        obj.selector = N.toSelector(selector);
        return obj;
    };

    $.fn.extend($.extend(N.prototype, {
        /**
         * Remove element in array
         */
        "remove_" : function(idx, length) {
            if (idx !== undefined) {
                if (!N.isNumeric(idx)) {
                    idx = this.toArray().indexOf(idx);
                }
                if (length === undefined) {
                    length = 1;
                }
                this.splice(idx, length);
            }
            return this;
        },
        /**
         * Bind an event to top priority
         */
        tpBind : function() {
            var args = arguments;
            var self = this;
            return this.each(function() {
                if($._data(this, "events") !== undefined) {
                    self.on.apply(self, args);
                    $(this).each(function() {
                        var handlers = $._data(this, "events")[args[0].split(".")[0]];
                        var handler = handlers.pop();
                        handlers.splice(0, 0, handler);
                    });
                } else {
                    self.on.apply(self, args);
                }
            });
        },
        /**
         * Get instance from context element of component or library
         */
        instance : function(name, instance) {
            if(arguments.length === 0) {
                return this.map(function() {
                    return $.map($(this).data(), function(v, i) {
                        if(N.string.endsWith(i, "__")) {
                            return v;
                        }
                    });
                });
            } else if(arguments.length === 1) {
                if(N.type(name) === "function") {
                    return this.each(function() {
                        return $.each($(this).data(), function(i, v) {
                            if(N.string.endsWith(i, "__")) {
                                name.call(v, i.replace("__", ""), v);
                            }
                        });
                    });
                } else {
                    var insts = this.map(function() {
                        return $.map($(this).data(), function(v, i) {
                            if(i === name + "__") {
                                return v;
                            }
                        });
                    });
                    return insts.length <= 1 ? insts[0] : insts;
                }
            } else if(arguments.length === 2) {
                if(N.type(instance) === "function") {
                    return this.each(function() {
                        return $.each($(this).data(), function(i, v) {
                            if(name + "__" === i) {
                                instance.call(v, i.replace("__", ""), v);
                            }
                        });
                    });
                } else {
                    //set instance
                    this.data(name + "__", instance);
                    return this;
                }
            }
        },
        /**
         * Get or set the value to (multiple)select input elements
         * if vals(arg[0]) argument is undefined, it works in get mode
         */
        vals : function(vals) {
            var tagName = this.get(0).tagName.toLowerCase();
            var type = N.string.trimToEmpty(this.attr("type")).toLowerCase();
            var selEle;
            var ele;
            if(vals !== undefined && N.type(vals) !== "function") {
                if (tagName === "select") {
                    if(N.string.trimToNull(vals) === null && !this.is("select[multiple='multiple']")) {
                        if(this.length > 0) {
                            this.get(0).selectedIndex = 0;
                        }
                    } else {
                        this.val(vals);
                    }
                } else if (type === "checkbox") {
                    if(N.type(vals) === "string") {
                        vals = [ vals ];
                    }
                    if(this.length > 1) {
                        this.prop("checked", false);
                        var self = this;
                        N(vals).each(function() {
                            self.filter("[value='" + String(this) + "']").prop("checked", true);
                        });
                    } else if(this.length === 1) {
                        if(vals[0] !== N.context.attr("core").sgChkdVal && vals[0] !== N.context.attr("core").sgUnChkdVal) {
                            vals[0] = N.context.attr("core").sgUnChkdVal;
                        }
                        if(N.context.attr("core").sgChkdVal === vals[0]) {
                            this.prop("checked", true);
                        } else if (N.context.attr("core").sgUnChkdVal === vals[0]) {
                            this.prop("checked", false);
                        } else {
                            this.filter("[value='" + String(vals[0]) + "']").prop("checked", true);
                        }
                        this.val(vals[0]);
                    }
                } else if (type === "radio") {
                    this.each(function() {
                        var thisEle = N(this);
                        if(thisEle.attr("value") === String(vals)) {
                            thisEle.prop("checked", true);
                        } else {
                            thisEle.prop("checked", false);
                        }
                    });
                }
                return this;
            } else {
                if (tagName === "select") {
                    selEle = this.find("> option:selected");
                    if(selEle.length > 1) {
                        if(N.type(vals) !== "function") {
                            return selEle.map(function() {
                                return N.string.trimToEmpty($(this).val());
                            }).toArray();
                        } else {
                            ele = this.find("> option");
                            return selEle.each(function() {
                                vals.call(this, ele.index(this), this);
                            });
                        }
                    } else if(selEle.length === 1) {
                        if(N.type(vals) !== "function") {
                            if(selEle.attr("value") !== undefined) {
                                return N.string.trimToEmpty(selEle.val());
                            } else {
                                return "";
                            }
                        } else {
                            vals.call(selEle, this.find("> option:not(.select_default__)").index(selEle), selEle);
                            return selEle;
                        }
                    } else if(selEle.length === 0 && this.is("[multiple]")) {
                        return [];
                    }
                } else if (type === "radio") {
                    selEle = this.filter("[name='" + this.attr("name") + "']:checked");
                    if(N.type(vals) !== "function") {
                        return N.string.trimToEmpty(selEle.val());
                    } else {
                        vals.call(selEle, this.filter("[name='" + this.attr("name") + "']").index(selEle), selEle);
                        return selEle;
                    }
                } else if (type === "checkbox") {
                    selEle = this.filter("[name='" + this.attr("name") + "']:checked");
                    if(this.length > 1) {
                        if(N.type(vals) !== "function") {
                            var chkedVals = selEle.map(function() {
                                return N.string.trimToEmpty($(this).val());
                            }).toArray();
                            return selEle.length === 1 ? N.string.trimToEmpty($(selEle).val()) : chkedVals.length === 0 ? [] : chkedVals;
                        } else {
                            ele = this.filter("[name='" + this.attr("name") + "']");
                            return selEle.each(function() {
                                vals.call(this, ele.index(this), this);
                            });
                        }
                    } else if( this.length === 1) {
                        if(selEle.length === 0) {
                            selEle = this.filter("[id='" + this.attr("id") + "']");
                        }
                        if(N.type(vals) !== "function") {
                            var val = N.string.trimToEmpty(selEle.val());
                            if(val !== N.context.attr("core").sgChkdVal && val !== N.context.attr("core").sgUnChkdVal) {
                                val = N.context.attr("core").sgUnChkdVal;
                            }
                            if(N.context.attr("core").sgChkdVal === val || N.context.attr("core").sgUnChkdVal === val || selEle.attr("value") === undefined) {
                                if(selEle.prop("checked")) {
                                    val = N.context.attr("core").sgChkdVal;
                                    selEle.val(val);
                                    return val;
                                } else if (!selEle.prop("checked")) {
                                    val = N.context.attr("core").sgUnChkdVal;
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
            return "";
        },
        /**
         * Returns the event bound to the element.
         */
        events : function(eventName, namespace) {
            var ele = $(this);
            if(ele.length > 0 && $._data(ele.get(0), "events") !== undefined) {
                if(eventName !== undefined && namespace !== undefined) {
                    var e_ = $($._data(ele.get(0), "events")[eventName]).filter(function() {
                        return namespace === this.namespace;
                    }).get();
                    return N.isEmptyObject(e_) ? undefined : e_;
                } else if(eventName !== undefined && namespace === undefined) {
                    return $._data(ele.get(0), "events")[eventName];
                } else {
                    return $._data(ele.get(0), "events");
                }
            }
        }
    }));

    // Extend regexp filter selector to jQuery filter selector
    (function(){
        var paramMatch = /^([^,]+),(.+)/;
        var getterMap = {
                "default": function($el, attrName, propertyName){
                    return $el.attr(attrName) ? [ $el.attr(attrName) ] : [];
                },
                "data": function($el, attrName, propertyName){
                    return $el.data(propertyName) ? [ $el.data(propertyName) ] : [];
                },
                "class": function($el, attrName, propertyName){
                    return $el.attr('class') ? $el.attr('class').split(' ') : [];
                },
                "css": function($el, attrName, propertyName){
                    return $el.css(propertyName) ? [ $el.css(propertyName) ] : [];
                }
        };
        $.expr.pseudos.regexp = $.expr.createPseudo(function(meta){
            if(!meta) return $.noop;

            var params = meta.match(paramMatch);
            if(!params) return $.noop;

            var attrNames = params[1].trim().split(':'), attrName = attrNames[0].trim(), propertyName = attrNames.length === 2 ? attrNames[1].trim() : '';
            var regexp = new RegExp(params[2].trim());
            var getter = getterMap[attrName] || getterMap['default'];

            return function(el){
                $el = $(el);
                var values = getter($el, attrName, propertyName);
                for(var i = 0, len = values.length; i < len; i++)
                    if(regexp.test(values[i])) return true;
                return false;
            };
        });
    })();


    (function(N) {
        // N local variables
        $.extend(N, {
            version : {
                "Natural-CORE" : "0.20.32"
            },
            /**
             * Set and get locale value
             */
            locale : function(str) {
                if(str === undefined) {
                    return N.context.attr("core").locale;
                } else {
                    N.context.attr("core").locale = str;
                }
            },
            /**
             * Display the error log to console
             */
            error : function(msg, e) {
                if(N.type(e) !== "error") {
                    e = new Error(msg);

                    if(Error.captureStackTrace !== undefined) {
                        Error.captureStackTrace(e, N.error);
                    }
                } else {
                    e.message = (msg != null ? "[" + msg + "]" : "") + e.message;
                }
                return e;
            },
            /**
             * Check object type
             */
            type : function(obj) {
                return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
            },
            /**
             * Check whether arg[0] is a String type
             */
            isString : function(obj) {
                return N.type(obj) === "string";
            },
            /**
             * Check whether arg[0] is a numeric type
             */
            isNumeric : function(obj) {
                return ( typeof obj === "number" || typeof obj === "string" ) &&
                    !isNaN( obj - parseFloat( obj ) );
            },
            /**
             * Check whether arg[0] is a plain object type
             */
            isPlainObject : $.isPlainObject,
            /**
             * Check whether object is empty
             */
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
            /**
             * Check whether arg[0] is a Array type
             */
            isArray : Array.isArray,
            /**
             * Checks whether an object of a type similar(array or jquery object etc.) to an array
             */
            isArraylike : function(obj) {
                var length = obj.length, type = N.type(obj);
                if(!obj.length) {
                    return false;
                }
                if (type === "function"
                    || type === "string"
                    || type === "number"
                    || type === "date"
                    || type === "boolean"
                    || obj === obj.window){
                    return false;
                }
                if (obj.nodeType === 1 && length) {
                    return true;
                }
                return type === "array" || length === 0 || typeof length === "number" && length > 0 && (length - 1) in obj;
            },
            /**
             * Check whether arg[0] is a jQuery Object type
             */
            isWrappedSet : function(obj) {
                return obj != null && this.isArraylike(obj) && obj.jquery !== undefined;
            },
            /**
             * Check whether arg[0] is an element type
             */
            isElement : function(obj) {
                if(this.isWrappedSet(obj)) {
                    obj = obj.get(0);
                }
                return !!(obj && obj !== document && obj.getElementsByTagName);
            },
            toSelector : function (el) {
                if (typeof el === "string") {
                    return el;
                }
                if(this.isWrappedSet(el)) {
                    el = el.get(0);
                }
                if(this.isElement(el)) {
                    return el.tagName.toLowerCase() + (el.id ? '#' + el.id : "") + '.' + (Array.from(el.classList)).join('.');
                } else if(N.type(el) === "array") {
                    if(el.length > 0) {
                        return String(el[0]) + " x " + el.length;
                    } else {
                        return "[]";
                    }
                } else {
                    return String(el);
                }
            },
            /**
             * Run asynchronous execution sequentially
             */
            serialExecute : function() {
                var self = this;
                self.defers = [];
                $(arguments).each(function(i, fn){
                    var defer = $.Deferred();
                    self.defers.push(defer);
                    if(self.defers.length > 1) {
                        self.defers[i-1].done(function() {
                            fn.apply(self.defers, $.merge([defer], arguments));
                        });
                    } else {
                        fn.apply(self.defers, [defer]);
                    }
                });
                return self.defers;
            },
            /**
             * Natural-JS resource garbage collector
             */
            gc : {
                /**
                 * Minimum collection
                 */
                minimum : function() {
                    $(window).off("resize.datepicker");
                    $(window).off("resize.alert");
                    $(document).off("click.datepicker");
                    $(document).off("keyup.alert");
                    $(document).off("click.grid.dataFilter");
                    $(document).off("click.grid.more touchstart.grid.more");
                    return true;
                },
                /**
                 * Full collection
                 */
                full : function() {
                    $(window).off("resize.datepicker");
                    $(window).off("resize.alert");
                    $(document).off("dragstart.alert selectstart.alert mousemove.alert touchmove.alert mouseup.alert touchend.alert");
                    $(document).off("click.datepicker");
                    $(document).off("keyup.alert");
                    $(document).off("dragstart.grid.vResize selectstart.grid.vResize mousemove.grid.vResize touchmove.grid.vResize mouseup.grid.vResize touchend.grid.vResize");
                    $(document).off("dragstart.grid.resize selectstart.grid.resize mousemove.grid.resize touchmove.grid.resize mouseup.grid.resize touchend.grid.resize");
                    $(document).off("click.grid.dataFilter");
                    $(document).off("click.grid.more touchstart.grid.more");
                    return true;
                },
                /**
                 * Removes garbage instances from observables of N.ds
                 */
                ds : function() {
                    if($(N.context.attr("architecture").page.context).find(">#data_sync_temp__").length > 0) {
                        $(N.context.attr("architecture").page.context).find(">#data_sync_temp__").instance("ds").obserable
                            = $.uniqueSort($(".grid__, .list__, .form__:not('.grid__>tbody, .list__>li'), .tree__", N.context.attr("architecture").page.context).instance());
                    }
                }
            },
            /**
             * N.string package
             */
            "string" : {
                contains : function(context, str) {
                    if (this.isEmpty(context) || this.isEmpty(str)) {
                        return false;
                    }
                    return context && (context.indexOf(str) != -1);
                },
                endsWith : function(context, str) {
                    if (this.isEmpty(context) || this.isEmpty(str)) {
                        return false;
                    }
                    return context.lastIndexOf(str) === context.length - str.length;
                },
                startsWith : function(context, str) {
                    if (this.isEmpty(context)) {
                        return false;
                    }
                    return context.indexOf(str) === 0;
                },
                insertAt : function(context, idx, str) {
                    return context.substring(0, idx) + str + context.substring(idx);
                },
                removeWhitespace : function(str) {
                    if (this.isEmpty(str)) {
                        return str;
                    }
                    return str.replace(/\s/g, "");
                },
                lpad : function(str, length, padStr) {
                    while (str.length < length) {
                        str = padStr + str;
                    }
                    return str;
                },
                rpad : function(str, length, padStr) {
                    while (str.length < length) {
                        str = str + padStr;
                    }
                    return str;
                },
                isEmpty : function(str) {
                    return N.string.trimToEmpty(str).length === 0;
                },
                byteLength : function(str, charByteLength) {
                    if(charByteLength === undefined) {
                        charByteLength = N.context.attr("core").charByteLength !== undefined ? N.context.attr("core").charByteLength : 3;
                    }
                    return (function(s,b,i,c){
                        for(b=i=0;c=s.charCodeAt(i++);b+=c>>11?charByteLength:c>>7?2:1){}
                        return b;
                    })(str);
                },
                trimToEmpty : function(str) {
                    return str ? String(str).trim() : "";
                },
                nullToEmpty : function(str) {
                    return str === null || str === undefined ? "" : str;
                },
                trimToNull : function(str) {
                    return N.string.trimToEmpty(str).length === 0 ? null : N.string.trimToEmpty(str);
                },
                trimToUndefined : function(str) {
                    return N.string.trimToEmpty(str).length === 0 ? undefined : N.string.trimToEmpty(str);
                },
                trimToZero : function(str) {
                    return N.string.trimToEmpty(str).length === 0 ? "0" : N.string.trimToEmpty(str);
                },
                trimToVal : function(str, val) {
                    return N.string.trimToEmpty(str).length === 0 ? val : N.string.trimToEmpty(str);
                }
            },
            /**
             * N.date package
             */
            "date" : {
                /**
                 * Calculate the difference between two dates
                 */
                diff : function(refDateStr, targetDateStr) {
                    if (N.type(refDateStr) === "string") {
                        refDateStr = this.strToDate(refDateStr).obj;
                    }
                    if (N.type(targetDateStr) === "string") {
                        targetDateStr = this.strToDate(targetDateStr).obj;
                    }
                    return Math.ceil((targetDateStr - refDateStr) / 1000 / 24 / 60 / 60);
                },
                /**
                 * Return to re-place the date string for a given format.
                 */
                strToDateStrArr : function(str, format, isString) {
                    var dateStrArr = [];
                    var fixNum = 0;
                    if(format.length === 3 && str.length === 7 || format.length === 2 && str.length === 5) {
                        fixNum = -1;
                    }
                    if(N.string.startsWith(format, "Ymd")) {
                        dateStrArr.push(str.substring(0, 4 + fixNum)); //year
                        dateStrArr.push(str.substring(4 + fixNum, 6 + fixNum)); //month
                        dateStrArr.push(str.substring(6 + fixNum, 8 + fixNum)); //day
                    } else if(N.string.startsWith(format, "mdY")) {
                        dateStrArr.push(str.substring(4, 8 + fixNum)); //year
                        dateStrArr.push(str.substring(0, 2)); //month
                        dateStrArr.push(str.substring(2, 4)); //day
                    } else if(N.string.startsWith(format, "dmY")) {
                        dateStrArr.push(str.substring(4, 8 + fixNum)); //year
                        dateStrArr.push(str.substring(2, 4)); //month
                        dateStrArr.push(str.substring(0, 2)); //day
                    } else if(N.string.startsWith(format, "Ym")) {
                        dateStrArr.push(str.substring(0, 4 + fixNum)); //year
                        dateStrArr.push(str.substring(4 + fixNum, 6 + fixNum)); //month
                    } else if(N.string.startsWith(format, "mY")) {
                        dateStrArr.push(str.substring(2, 6 + fixNum)); //year
                        dateStrArr.push(str.substring(0, 2)); //month
                    } else {
                        throw N.error("[N.date.strToDateStrArr]\"" + format + "\" date format is not support. please change return value of N.context.attr(\"data\").formatter.date's functions");
                    }
                    if(isString === undefined || isString === false) {
                        $(dateStrArr).each(function(i) {
                            dateStrArr[i] = parseInt(this);
                        });
                    }
                    return dateStrArr;
                },
                /**
                 * Convert a date string to a date object
                 */
                strToDate : function(str, format) {
                    str = N.string.trimToEmpty(str).replace(/[^0-9]/g, "");
                    var dateInfo = null;
                    var dateStrArr;
                    if (str.length > 2 && str.length <= 4) {
                        dateInfo = {
                            obj : new Date(str, 1, 1, 0, 0, 0),
                            format : "Y"
                        };
                    } else if (str.length === 6) {
                        if(format === undefined) {
                            format = N.context.attr("data").formatter.date.Ym();
                        }
                        dateStrArr = N.date.strToDateStrArr(str, format.replace(/[^Y|^m|^d]/g, ""));
                        dateInfo = {
                            obj : new Date(dateStrArr[0], dateStrArr[1]-1, 1, 0, 0, 0),
                            format : format
                        };
                    } else if (str.length === 8) {
                        if(format === undefined) {
                            format = N.context.attr("data").formatter.date.Ymd();
                        }
                        dateStrArr = N.date.strToDateStrArr(str, format.replace(/[^Y|^m|^d]/g, ""));
                        dateInfo = {
                            obj : new Date(dateStrArr[0], dateStrArr[1]-1, dateStrArr[2], 0, 0, 0),
                            format : format
                        };
                    } else if (str.length === 10) {
                        if(format === undefined) {
                            format = N.context.attr("data").formatter.date.YmdH();
                        }
                        dateStrArr = N.date.strToDateStrArr(str, format.replace(/[^Y|^m|^d]/g, ""));
                        dateInfo = {
                            obj : new Date(dateStrArr[0], dateStrArr[1]-1, dateStrArr[2], str.substring(8, 10), 0, 0),
                            format : format
                        };
                    } else if (str.length === 12) {
                        if(format === undefined) {
                            format = N.context.attr("data").formatter.date.YmdHi();
                        }
                        dateStrArr = N.date.strToDateStrArr(str, format.replace(/[^Y|^m|^d]/g, ""));
                        dateInfo = {
                            obj : new Date(dateStrArr[0], dateStrArr[1]-1, dateStrArr[2], str.substring(8, 10), str.substring(10, 12),
                                    0),
                            format : format
                        };
                    } else if (str.length >= 14) {
                        if(format === undefined) {
                            format = N.context.attr("data").formatter.date.YmdHis();
                        }
                        dateStrArr = N.date.strToDateStrArr(str, format.replace(/[^Y|^m|^d]/g, ""));
                        dateInfo = {
                            obj : new Date(dateStrArr[0], dateStrArr[1]-1, dateStrArr[2], str.substring(8, 10), str.substring(10, 12),
                                    str.substring(12, 14)),
                            format : format
                        };
                    }
                    return dateInfo;
                },
                /**
                 * Format the date string
                 */
                format : function(str, format) {
                    var dateInfo = this.strToDate(str);
                    return dateInfo !== null ? dateInfo.obj.formatDate(format !== undefined ? format : dateInfo.format) : str;
                },
                /**
                 * Convert date object to timestamp number
                 */
                dateToTs : function(dateObj) {
                    var d = dateObj;
                    if (d === undefined) {
                        d = new Date();
                    }
                    return Math.round(d.getTime() / 1000);
                },
                /**
                 * Convert timestamp number to date object
                 */
                tsToDate : function(tsNum) {
                    if (tsNum === undefined) {
                        return new Date();
                    } else {
                        return new Date(tsNum);
                    }
                },
                /**
                 * Get a list of monthly date objects
                 *
                 * @param year
                 * @param month
                 * @return array[array[date]]
                 */
                dateList : function(year, month) {
                    var weekArr = [];
                    var prevDate = new Date(year, month-1, 0);
                    var currDate = new Date(year, month, 0);
                    var nextDate = new Date(year, month+1, 0);

                    var lastDate = currDate.getDate();
                    var prevLastDate = prevDate.getDate();
                    var prevLastDay = prevDate.getDay();
                    var daysOfWeek = [];

                    if(prevLastDay !== 6) {
                        for(var i=prevLastDate-prevLastDay;i<=prevLastDate;i++) {
                            prevDate.setDate(i);
                            daysOfWeek.push(new Date(prevDate.getFullYear(), prevDate.getMonth(), prevDate.getDate(), 0));
                        }
                    }

                    for(var i=1;i<=lastDate;i++) {
                        currDate.setDate(i);
                        daysOfWeek.push(new Date(currDate.getFullYear(), currDate.getMonth(), currDate.getDate(), 0));
                        if(i > 0 && daysOfWeek.length === 7) {
                            weekArr.push(daysOfWeek);
                            daysOfWeek = [];
                        }
                    }

                    weekArr.push(daysOfWeek);

                    var daysOfLastWeek = weekArr[weekArr.length-1];
                    var lastDayOfCalendar;
                    for(var i=1, length=daysOfLastWeek.length;i<=7-length;i++) {
                        nextDate.setDate(i);
                        daysOfLastWeek.push(new Date(nextDate.getFullYear(), nextDate.getMonth(), nextDate.getDate(), 0));
                        lastDayOfCalendar = i;
                    }
                    if(weekArr.length === 5) {
                        daysOfLastWeek = [];
                        for(var i=lastDayOfCalendar+1;i<=lastDayOfCalendar+7;i++) {
                            nextDate.setDate(i);
                            daysOfLastWeek.push(new Date(nextDate.getFullYear(), nextDate.getMonth(), nextDate.getDate(), 0));
                        }
                        weekArr.push(daysOfLastWeek);
                    }

                    prevDate = currDate = nextDate = lastDate = prevLastDate = prevLastDay = daysOfWeek = undefined;
                    return weekArr;
                }
            },
            /**
             * N.element package
             */
            "element" : {
                /**
                 * make options object from class attribute
                 */
                toOpts : function(ele) {
                    return N(ele).data("opts");
                },
                /**
                 * make rules object from input element
                 */
                toRules : function(ele, ruleset) {
                    var retRules = {};
                    var thisEle;
                    var id;
                    ele.each(function() {
                        thisEle = $(this);
                        if(thisEle.is("input:radio, input:checkbox")) {
                            id = thisEle.attr("name");
                        } else {
                            id = thisEle.attr("id");
                        }
                        retRules[id] = thisEle.data(ruleset);
                    });
                    return retRules;
                },
                /**
                 * make data object from input element
                 */
                toData : function(eles) {
                    var retData = {};
                    var key, ele;
                    var beforeCheckboxNRadios = $();
                    eles.each(function() {
                        key = $(this).attr("id");
                        ele = $(this);
                        if(ele.is("input:radio") || ele.is("input:checkbox")) {
                            if(beforeCheckboxNRadios.filter(ele).length === 0) {
                                if(ele.closest(".select_input_container__").length > 0) {
                                    ele = ele.closest(".select_input_container__").find("input:" + ele.attr("type") + "[name='" + ele.attr("name") + "']");
                                    beforeCheckboxNRadios = ele;
                                } else if(ele.parent("label").length > 0) {
                                    ele = ele.parent().siblings("label").find("input:" + ele.attr("type") + "[name='" + ele.attr("name") + "']");
                                    ele.push(this);
                                    beforeCheckboxNRadios = ele;
                                } else {
                                    ele = ele.siblings("input:" + ele.attr("type") + "[name='" + ele.attr("name") + "']");
                                    ele.push(this);
                                    beforeCheckboxNRadios = ele;
                                }

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
                            }
                        } else {
                            if(key !== undefined) {
                                if(!ele.is("select")) {
                                    if(ele.is("img")) {
                                        retData[key] = ele.attr("src");
                                    } else {
                                        if(!ele.is(":input")) {
                                            retData[key] = ele.text();
                                        } else {
                                            retData[key] = ele.val();
                                        }
                                    }
                                } else {
                                    retData[key] = ele.vals();
                                }
                            }
                        }
                    });
                    return retData;
                },
                /**
                 * Data change effect for N.ds
                 */
                dataChanged : function(ele) {
                    ele.addClass("data_changed__");
                    ele.fadeOut(150).fadeIn(300);
                },
                /**
                 * Get the maximum z-index of all elements
                 */
                maxZindex : function(ele) {
                    if (ele === undefined) {
                        ele = $("div, span, ul, p, nav, article, section");
                    }
                    return Math.max.apply(null, $.map(ele, function(e, n) {
                        var zIndex = parseInt($(e).css("z-index"));
                        if (zIndex >= 2147483647) {
                            $(e).css("z-index", String(2147483647 - 999));
                            $(e).attr("fixed", "[Natural-JS]limited_z-index_value(-999)");
                        }
                        return zIndex || 0;
                    }));
                }
            },
            /**
             * N.browser package
             */
            "browser" : {
                /**
                 * Set and get cookie
                 *  - get : when value is undefined
                 */
                "cookie" : function(name, value, expiredays, domain) {
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
                            if (i === 0) {
                                break;
                            }
                        }
                    } else {
                        var expires;
                        if (expiredays !== undefined) {
                            var today = new Date();
                            today.setDate(today.getDate() + expiredays);
                            expires = "; expires=" + today.toGMTString();
                        } else {
                            expires = "";
                        }
                        var domain_;
                        if (domain !== undefined) {
                            domain_ = "; domain=" + domain;
                        } else {
                            domain_ = "";
                        }
                        document.cookie = name + "=" + escape(value) + "; path=/" + expires + domain_;
                    }
                },
                /**
                 * Remove cookie
                 */
                removeCookie : function(name, domain) {
                    if (domain !== undefined) {
                        document.cookie = name + "=; path=/; expires=" + (new Date(1)) + "; domain=" + domain;
                    } else {
                        document.cookie = name + "=; path=/; expires=" + (new Date(1)) + ";";
                    }
                },
                /**
                 * Get Microsoft Internet Explorer version
                 *  - MSIE trident version has been applied
                 */
                msieVersion : function() {
                    var ua = window.navigator.userAgent;
                    var msie = ua.indexOf("MSIE ");
                    // for IE11
                    if(msie < 0) {
                        msie = ua.indexOf(".NET");
                    }
                    var trident = ua.match(/Trident\/(\d.\d)/i);
                    if (msie < 0) {
                        return 0;
                    } else {
                        if (trident === undefined) {
                            return parseInt(ua.substring(msie + 5, ua.indexOf(".", msie)));
                        } else {
                            return parseInt(trident[1]) + 4.0;
                        }
                    }
                },
                /**
                 * Check the connected browser
                 */
                "is" : function(name) {
                    if(!!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0) {
                        return name === "opera";
                    } else if(typeof InstallTrigger !== 'undefined') {
                        return name === "firefox";
                    } else if(name !== "ios" && navigator.userAgent.match(/^((?!chrome|android|crios|fxios).)*safari/i)) {
                        return name === "safari";
                    } else if(!!window.chrome && !(!!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0)) {
                        return name === "chrome";
                    } else if(N.browser.msieVersion() > 0) {
                        return name === "ie";
                    } else if(navigator.userAgent.match(/like Mac OS X/i)) {
                        return name === "ios";
                    } else if(navigator.userAgent.match(/android/i)) {
                        return name === "android";
                    }
                    return false;
                },
                /**
                 * Get context path from current window url
                 */
                contextPath : function(){
                    var offset = location.href.indexOf(location.host) + location.host.length;
                    return location.href.substring(offset, location.href.indexOf('/', offset + 1));
                },
                /**
                 * Get scrollbars width for connected browser
                 */
                scrollbarWidth : function() {
                    var div = $('<div class="antiscroll-inner" style="width:50px;height:50px;overflow-y:scroll;' +
                        'position:absolute;top:-200px;left:-200px;"><div style="height:100px;width:100%"/>' +
                        '</div>');

                    $("body").append(div);
                    var w1 = $(div).innerWidth();
                    var w2 = $("div", div).innerWidth();
                    $(div).remove();

                    return w1 - w2;
                }
            },
            /**
             * N.message package
             */
            "message" : {
                /**
                 * Replace message variables for N.message.get
                 */
                replaceMsgVars : function(msg, vars) {
                    if (vars !== undefined) {
                        for (var i = 0; i < vars.length; i++) {
                            msg = msg.split("{" + String(i) + "}").join(vars[i]);
                        }
                    }
                    return msg;
                },
                /**
                 * Get message from message resource
                 */
                get : function(resource, key, vars) {
                    var msg = resource[N.locale()][key];
                    return msg !== undefined ? N.message.replaceMsgVars(msg, vars) : key;
                }
            },
            /**
             * N.array package
             */
            "array" : {
                /**
                 * Remove duplicated value(object | etc.)
                 */
                "deduplicate" : function(arr, key) {
                    var rtnArr = [];
                    $(arr).each(function(i, obj) {
                        if(N.type(obj) === "object" && key !== undefined) {
                            if($.inArray(obj[key], $(rtnArr).map(function() {
                                    return this[key];
                                }).get()) < 0) {
                                rtnArr.push(obj);
                            }
                        } else {
                            if($.inArray(obj, rtnArr) < 0) {
                                rtnArr.push(obj);
                            }
                        }
                    });
                    return rtnArr;
                }
            },
            /**
             * N.json package
             */
            "json" : {
                "mapFromKeys" : function(obj) {
                    if(arguments.length > 1) {
                        var args = Array.prototype.slice.call(arguments, 0);
                        if(N.context.attr("core").excludeMapFromKeys !== undefined) {
                            args = args.concat(N.context.attr("core").excludeMapFromKeys);
                        }
                        if(N.type(obj) === "array") {
                            if(obj.length === 0) {
                                return obj;
                            }
                            return $(obj).map(function() {
                                var retObj = {};
                                for(var i=1,length=args.length;i<length;i++) {
                                    if(args[i] !== undefined && this[args[i]] !== undefined) {
                                        retObj[args[i]] = this[args[i]];
                                    }
                                }
                                return retObj;
                            }).get();
                        } else {
                            var retObj = {};
                            for(var i=1,length=args.length;i<length;i++) {
                                if(args[i] !== undefined && obj[args[i]] !== undefined) {
                                    retObj[args[i]] = obj[args[i]];
                                }
                            }
                            return retObj;
                        }
                    } else {
                        return obj;
                    }
                },
                /**
                 * Merge JSON Array by key
                 */
                "mergeJsonArray" : function(arr1, arr2, key) {
                    var keySet = $(arr1).map(function() {
                        return this[key];
                    }).get().join(",");
                    $(arr2).each(function() {
                        if(keySet.indexOf(this[key]) < 0) {
                            arr1.push(this);
                        }
                    });
                    return arr1;
                },
                /**
                 * Return formated JSON String
                 */
                "format" : function(oData, sIndent) {
                    if (!N.isEmptyObject(oData)) {
                        if (N.isString(oData)) {
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
            },
            "event" : {
                /**
                 * This function was taken from "https://stackoverflow.com/a/13952775" and modified.
                 */
                isNumberRelatedKeys : function(e) {
                    e = (e) ? e : window.event;
                    var key;
                    var charsKeys = [
                        97, // a Ctrl + a Select All
                        65, // A Ctrl + A Select All
                        99, // c Ctrl + c Copy
                        67, // C Ctrl + C Copy
                        118, // v Ctrl + v paste
                        86, // V Ctrl + V paste
                        115, // s Ctrl + s save
                        83, // S Ctrl + S save
                        112, // p Ctrl + p print
                        80 // P Ctrl + P print
                    ];

                    var specialKeys = [
                        8, // backspace
                        9, // tab
                        27, // escape
                        13, // enter
                        35, // Home & shiftKey + #
                        36, // End & shiftKey + $
                        37, // left arrow & shiftKey + %
                        39, // right arrow & '
                        46, // delete & .
                        45 // Ins & -
                    ];

                    key = e.keyCode ? e.keyCode : e.which ? e.which : e.charCode;

                    // check if pressed key is not number
                    if (key && !((key >= 48 && key <= 57) || (key >= 96 && key <= 105))) {

                        // Allow: Ctrl + char for action save, print, copy,
                        // ...etc
                        if ((e.ctrlKey && charsKeys.indexOf(key) !== -1) ||
                            // Fix Issue: f1 : f12 Or Ctrl + f1 : f12, in
                            // Firefox browser
                            (navigator.userAgent.indexOf("Firefox") !== -1 && ((e.ctrlKey && e.keyCode && e.keyCode > 0 && key >= 112 && key <= 123) || (e.keyCode && e.keyCode > 0 && key && key >= 112 && key <= 123)))) {
                            return true
                        }
                            // Allow: Special Keys
                        else if (specialKeys.indexOf(key) !== -1) {
                            // Fix Issue: right arrow & Delete & ins in FireFox
                            if (navigator.userAgent.indexOf("Firefox") !== -1 && (key == 39 || key == 45 || key == 46)) {
                                return e.keyCode !== undefined && e.keyCode > 0;
                            }
                                // DisAllow : "#" & "$" & "%"
                            else return !(e.shiftKey && (key == 35 || key == 36 || key == 37));
                        }
                        else {
                            return false;
                        }
                    } else {
                        return true;
                    }
                },
                /**
                 * Prevent all events
                 */
                disable : function(e) {
                    try {
                        e.preventDefault();
                        e.stopImmediatePropagation();
                        e.stopPropagation();
                    } catch(e) {}
                    return false;
                },
                /**
                 * This method is locked window scroll when scrolling in the ele(arg1)
                 */
                windowScrollLock : function(ele) {
                    ele.on("mousewheel.ui DOMMouseScroll.ui",function(e) {
                        var delta = e.originalEvent.wheelDelta || -e.originalEvent.detail;
                        if (delta > 0 && $(this).scrollTop() <= 0) return false;
                        return !(delta < 0 && $(this).scrollTop() >= this.scrollHeight - $(this).height());

                    });
                },
                /**
                 * Detect the duration of animation or transition of css3
                 */
                getMaxDuration : function(ele, css) {
                    if(!ele.css(css) || ele.css(css).startsWith("0")) {
                        return 0;
                    }
                    return Math.max.apply(undefined, $(ele.css(css).split(",")).map(function() {
                        if(this.indexOf("ms") > -1) {
                            return parseInt(N.string.trimToZero(this));
                        } else {
                            return parseFloat(N.string.trimToZero(this)) * 1000;
                        }
                    }).get());
                },
                /**
                 * Detect the end event name of CSS animations
                 * Reference from David Walsh: http://davidwalsh.name/css-animation-callback
                 */
                whichAnimationEvent  : function(ele){
                    var el;
                    if(ele !== undefined && ele.length > 0) {
                        if(this.getMaxDuration(ele, "animation-duration") === 0) {
                            return "nothing";
                        }
                        el = ele.get(0);
                    } else {
                        el = document.createElement("fakeelement");
                    }

                    var animations = {
                        "animation" : "animationend",
                        "OAnimation" : "oAnimationEnd",
                        "MSAnimation" : "MSAnimationEnd",
                        "WebkitAnimation" : "webkitAnimationEnd"
                    };
                    for(var t in animations){
                        if( animations.hasOwnProperty(t) && el.style[t] !== undefined ){
                            return animations[t];
                        }
                    }

                    return "nothing";
                },
                /**
                 * Detect the end event name of CSS transitions
                 * Reference from David Walsh: http://davidwalsh.name/css-animation-callback
                 */
                whichTransitionEvent  : function(ele){
                    if(ele !== undefined) {
                        if(this.getMaxDuration(ele, "transition-duration") === 0) {
                            return "nothing";
                        }
                    }

                    var el = document.createElement("fakeelement");
                    var transitions = {
                        "transition" : "transitionend",
                        "OTransition" : "oTransitionEnd",
                        "MozTransition" : "transitionend",
                        "WebkitTransition" : "webkitTransitionEnd"
                    };
                    for(var t in transitions){
                        if( transitions.hasOwnProperty(t) && el.style[t] !== undefined ){
                            return transitions[t];
                        }
                    }

                    return "nothing";
                }
            }
        });

        // Config
        var Config = N.config = function() {
            //TODO
        };

    })(N);

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
    // a, A, B, c, d, D, F, g, G, h, H, i, I (uppercase i), j, l (lowercase L),
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
                if ((String(beat)).length === 1)
                    beat = "00" + beat;
                if ((String(beat)).length === 2)
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
                return (j.length === 1 ? "0" + j : j);
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
                if (date.getHours() === 0) {
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
                return (g.length === 1 ? "0" + g : g);
            },
            H : function() {
                // 24-hour format of an hour with leading zeros
                var G = String(this.G());
                return (G.length === 1 ? "0" + G : G);
            },
            i : function() {
                // Minutes with leading zeros
                var min = String(date.getMinutes());
                return (min.length === 1 ? "0" + min : min);
            },
            I : function() {
                // Whether or not the date is in daylight saving time (DST)
                // note that this has no bearing in actual DST mechanics,
                // and is just a pure guess. buyer beware.
                var noDST = new Date("January 1 " + this.Y() + " 00:00:00");
                return (noDST.getTimezoneOffset() === date.getTimezoneOffset() ? 0 : 1);
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
                if ((Y % 4 === 0 && Y % 100 !== 0) || (Y % 4 === 0 && Y % 100 === 0 && Y % 400 === 0)) {
                    return 1;
                } else {
                    return 0;
                }
            },
            m : function() {
                // Numeric representation of a month, with leading zeros
                var n = String(this.n());
                return (n.length === 1 ? "0" + n : n);
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
                return (w === 0 ? 7 : w);
            },
            O : function() {
                // Difference to Greenwich time (GMT) in hours
                var os = Math.abs(date.getTimezoneOffset());
                var h = String(Math.floor(os / 60));
                var m = String(os % 60);
                if(h.length === 1) h = "0" + h;
                if(m.length === 1) m = "0" + m;
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
                return (sec.length === 1 ? "0" + sec : sec);
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
                if (this.L() === 1 && this.n() === 2)
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
                nyDoW = nyDoW !== 0 ? nyDoW - 1 : 6;

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
                var x;
                if (date.getFullYear) {
                    var newDate = new Date("January 1 2001 00:00:00 +0000");
                    x = newDate.getFullYear();
                    if (x === 2001) {
                        // i trust the method now
                        return date.getFullYear();
                    }
                }
                // else, do this:
                // codes thanks to ppk:
                // http://www.xs4all.nl/~ppk/js/introdate.html
                x = date.getYear();
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
            if (formatString[i] === "%") {
                // this is our way of allowing users to escape stuff
                formatString.splice(i, 1);
            } else {
                formatString[i] = switches[formatString[i]] !== undefined ? switches[formatString[i]]() : formatString[i];
            }
            i++;
        }
        return formatString.join("");
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

    /**
     * @reference Mask JavaScript API(http://www.pengoworks.com/workshop/js/mask/,
     *            dswitzer@pengoworks.com)
     */
    N.Mask = function(m) {
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
            var r = "@#~", rt = [], nv = "", t, x, a = [], j = 0, rx = {
                "@" : "a-zA-Z가-힣ㄱ-ㅎㅏ-ㅣ\x20\s",
                "#" : "0-9\s",
                "~" : "0-9a-zA-Z가-힣ㄱ-ㅎㅏ-ㅣ\x20\s"
            };

            // strip out invalid characters
            v = v.replace(new RegExp("[^" + rx["~"] + "]", "gi"), "");
            if ((_d === true) && (v.length === this.strippedValue.length)) {
                v = v.substring(0, v.length - 1);
            }
            this.strippedValue = v;
            var b = [];
            for (var i = 0; i < m.length; i++) {
                // grab the current character
                x = m.charAt(i);
                // check to see if current character is a mask, escape commands are not a mask character
                t = (r.indexOf(x) > -1);
                // if the current character is an escape command, then grab the next character
                if (x === "!") {
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
                            v = (v.length === 1) ? "" : v.substring(1);
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

            if ((_d === true) && (v.length === this.strippedValue.length)) {
                v = v.substring(0, v.length - 1);
            }

            if (this.allowPartial && (v.replace(/[^0-9]/, "").length === 0)) {
                return v;
            }
            this.strippedValue = v;

            if (v.length === 0) {
                v = NaN;
            }
            var vn = Number(v);
            if (isNaN(vn)) {
                return this.throwError(2, "The value entered was not a number.", _v);
            }

            // if no mask, stop processing
            if (m.length === 0) {
                return v;
            }

            // get the value before the decimal point
            var vi = String(Math.abs((v.indexOf(".") > -1) ? v.split(".")[0] : v));
            // get the value after the decimal point
            var vd = (v.indexOf(".") > -1) ? v.split(".")[1] : "";
            var _vd = vd;

            var isNegative = (vn !== 0 && Math.abs(vn) * -1 === vn);

            // check for masking operations
            var show = {
                "$" : /^[\$]/.test(m),
                "(" : (isNegative && (m.indexOf("(") > -1)),
                "+" : ((m.indexOf("+") !== -1) && !isNegative)
            };
            show["-"] = (isNegative && (!show["("] || (m.indexOf("-") !== -1)));

            // replace all non-placeholders from the mask
            m = m.replace(/[^#0.,]*/gi, "");

            // make sure there are the correct number of decimal places
            // get number of digits after decimal point in mask
            var dm = (m.indexOf(".") > -1) ? m.split(".")[1] : "";
            if (dm.length === 0) {
                if (_p !== undefined && _p === "round") {
                    vi = String(Math.round(Number(vi)));
                } else if (_p !== undefined && _p === "ceil") {
                    vi = String(Math.ceil(Number(vi)));
                } else {
                    vi = String(Math.floor(Number(vi)));
                }
                vd = "";
            } else {
                // find the last zero, which indicates the minimum number
                // of decimal places to show
                var md = dm.lastIndexOf("0") + 1;
                // if the number of decimal places is greater than the mask, then round off
                if (vd.length > dm.length) {
                    if (_p !== undefined && _p === "round") {
                        vd = String(Math.round(Number(vd.substring(0, dm.length + 1)) / 10));
                    } else if (_p !== undefined && _p === "ceil") {
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

            // check to see if we need commas in the thousands placeholder
            if (/[#0]+,[#0]{3}/.test(m)) {
                // add the commas as the placeholder
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

            if (show.$) {
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

    N.debug = console && console.debug ? console.debug.bind(window.console) : function() {};
    N.log = console && console.log ? console.log.bind(window.console) : function() {};
    N.info = console && console.info ? console.info.bind(window.console) : function() {};
    N.warn = console && console.warn ? console.warn.bind(window.console) : function() {};

    window.$.N = window.N = N;

})(window, jQuery);