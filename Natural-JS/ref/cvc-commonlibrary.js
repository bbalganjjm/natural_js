/**
 * 본 소프트웨어(CVCAF(Communicator-View-Controller Architecture Framework))를 허가 없이 사용하는 행위는,
 * 소프트웨어 소유자(대우정보시스템(주))에 대한 권리를 침해하는 것이며,
 * 이 행위를 한 자는 소프트웨어 소유자(대우정보시스템(주))로부터 저작권법에 의거 소송을 당할 수 있습니다.
 * 사용권 문서를 받은 자는, 사용권 문서에 명기된 조항에 의거하여 소프트웨어를 사용하는 것이 허가됩니다.
 * 사용권에 대한 침해가 있을 경우, 사용을 제한하거나 소송을 당할 수 있습니다.
 */
;(function($) {
    /**
     * Convert serialized array to serialized object
     *
     * @return Object
     */
    $.fn.serializeObject = function() {
        var o = {};
        var a = this.serializeArray();
        $.each(a, function() {
            if (o[this.name] !== undefined) {
                if (!o[this.name].push) {
                    o[this.name] = [ o[this.name] ];
                }
                o[this.name].push(this.value || '');
            } else {
                o[this.name] = this.value || '';
            }
        });
        return o;
    };

    /**
     * Make serialized object from inputElements value
     *
     * @return Object
     */
    $.fn.extractToJSON = function() {
        if (!this.length) {
            return false;
        }
        var $el = this, data = {}, lookup = data;
        var cap = null, named = null;
        var value = null;
        $el.find(":input").each(function() {
            if ($(this).prop("disabled") == false && typeof this.name != "undefined") {
                named = this.name.replace(/\[([^\]]+)?\]/g, ',$1').split(',');
                cap = named.length - 1;
                if (named[0]) {
                    for ( var i = 0; i < cap; i++) {
                        lookup = lookup[named[i]] = lookup[named[i]] || (named[i + 1] == "" ? [] : {});
                    }
                    if (lookup.length != undefined) {
                        lookup.push($(this).val());
                    } else {
                        if ($(this).is("input[type='checkbox']")) {
                            var $checkBoxs = $(this).parent().find("input[type='checkbox'][name='" + $(this).attr("name") + "']");
                            if ($checkBoxs.length == 1) {
                                value = SystemUtils.getSingleCheckboxValue($(this), null);
                            } else {
                                value = SystemUtils.getMultyValues($checkBoxs);
                            }
                        } else if ($(this).is("input[type='radio']")) {
                            if($(this).find(":checked").size() > 0) {
                                value = $(this).find(":checked").val();
                            } else {
                                value = "";
                            }
                        } else if ($(this).is("select")) {
                            value = SystemUtils.getMultyValues($(this));
                        } else {
                            value = $(this).val();
                        }
                        if (SystemUtils.realTypeOf(value) == "string") {
                            lookup[named[cap]] = StringUtils.trimToEmpty(value);
                        } else {
                            lookup[named[cap]] = value;
                        }
                        value = null;
                    }
                    lookup = data;
                }
            }
        });
        cap = null;
        named = null;
        $el = null;
        lookup = null;
        return data;
    };

    /**
     * Formating single HTMLInputElement value
     *
     * @return Object
     */
    $.fn.format = function() {
        return this.each(function() {
            $(this).bind("focusin.format", function() {
                $(this).val(Formater.unformatTextInput($(this)));
            });
            $(this).bind("focusout.format", function() {
                $(this).val(Formater.format($(this), Formater.unformatTextInput($(this))));
            });
            if ($(this).attr('type') == 'hidden' || $(this).attr('type') == 'text' || $(this).is('textarea')) {
                $(this).val(Formater.format($(this), $(this).val()));
            } else {
                $(this).text(Formater.format($(this), $(this).text()));
            }
        });
    };

    /**
     * Validate single HTMLInputElement value
     *
     * @return Object
     */
    $.fn.validate = function() {
        var pass = true;
        this.each(function() {
            if (!Validator.validate($(this), false)) {
                if ($(this).attr('type') == 'file') {
                    $(this).val("");
                    if ($.browser.msie) {
                    	// XP - IE8 에서 입력요소가 disable 되어 있거나 display: none 되어 있을때 focus 함수 호출하면 에러나는것 처리
                    	try {
                    		$(this).select();
                    		document.selection.clear();
                    	} catch(e) {}
                    }
                }
                // XP - IE8 에서 입력요소가 disable 되어 있거나 display: none 되어 있을때 focus 함수 호출하면 에러나는것 처리
            	try {
            		$(this).focus();
            		$(this).select();
            	} catch(e) {}
                pass = false;
                return false;
            }
        });
        return pass;
    };

    /**
     * Message Show
     *
     * @return Object
     */
    $.fn.message = function(msg, msgVars) {
        MessageUtils.show(msg, msgVars, this);
    };

    /**
     * jQuery Util
     */
    $.fn.outerHTML = function() {
        var $this = $(this);
        if ($this.length > 1) {
            return $.map($this, function(el) {
                return $(el).outerHTML();
            }).join('');
        }
        return $this.clone().wrap('<div/>').parent().html();
    };

    /**
     * jQuery Util
     */
    $.fn.bindFirst = function(event, handler) {
        if(this.data('events')) {
            this.bind(event, handler);
            this.each(function() {
                var handlers = $._data(this, 'events')[event.split('.')[0]];
                var handler = handlers.pop();
                handlers.splice(0, 0, handler);
            });
        } else {
            this.bind(event, handler);
        }
    };

    /**
     * $.cellPos() 에서 쓰는 펑션
     */
    var scanTable = function( $table ) {
        var m = [];
        $table.children( "tr" ).each( function( y, row ) {
            $( row ).children( "td, th" ).each( function( x, cell ) {
                var $cell = $( cell ),
                    cspan = $cell.attr( "colspan" ) | 0,
                    rspan = $cell.attr( "rowspan" ) | 0,
                    tx, ty;
                cspan = cspan ? cspan : 1;
                rspan = rspan ? rspan : 1;
                for( ; m[y] && m[y][x]; ++x );  //skip already occupied cells in current row
                for( tx = x; tx < x + cspan; ++tx ) {  //mark matrix elements occupied by current cell with true
                    for( ty = y; ty < y + rspan; ++ty ) {
                        if( !m[ty] ) {  //fill missing rows
                            m[ty] = [];
                        }
                        m[ty][tx] = true;
                    }
                }
                var pos = { top: y, left: x };
                $cell.data( "cellPos", pos );
            } );
        } );
    };

    /**
     * table 의 cell 위치 가져오기
     * ex) $("table thead th").each(function(){ console.log($(this).cellPos().top +","+ $(this).cellPos().left ); });
     */
    $.fn.cellPos = function( rescan ) {
        var $cell = this.first(),
            pos = $cell.data( "cellPos" );
        if( !pos || rescan ) {
            var $table = $cell.closest( "table, thead, tbody, tfoot" );
            scanTable( $table );
        }
        pos = $cell.data( "cellPos" );
        return pos;
    };

    /**
     * $.browser.chrome
     * @param month
     */
    $.browser.chrome = /chrome\//.test(navigator.userAgent.toLowerCase());

})(jQuery);

Date.prototype.calcMonth = function(month) {
    this.setMonth(this.getMonth() + month * 1);
};
Date.prototype.calcDay = function(day) {
    this.setDate(this.getDate() + day * 1);
};
Date.prototype.calcHours = function(hour) {
    this.setHours(this.getHours() + hour * 1);
};
String.prototype.trim = function() {
    return StringUtils.trim(this);
};
String.prototype.replaceAll = function(oldStr, newStr) {
    return this.split(oldStr).join(newStr);
};

var SystemUtils = {
    initServiceController : function(SC) {
        var currentTimeMillis = 0;
        try {
            currentTimeMillis = new Date().getTime();
            var init = function() {
            	if (typeof SC != 'undefined' && SC != null && typeof SC.init != 'undefined' && SC.init != null) {
	                SC.init();
	            } else {
	                if(SC == "popInit") {
	                    SystemUtils.popInit();
	                }
	            }
            };
            if(Config.ServiceControllerTemplateUse) {
            	var scInitDeferred = Config.ServiceControllerTemplate().init(SC);
            	if(scInitDeferred !== undefined) {
            		scInitDeferred.promise().done(function() {
            			init();
                	});
            	} else {
            		init();
            	}
            } else {
            	init();
            }
        } catch (e) {
            Communicator.deferredsReset();

            if (Config["blockServerMessage_" + Config.locale] != null) {
                MessageUtils.show(Config["blockServerMessage_" + Config.locale]);
            } else {
                MessageUtils.show(e.message);
            }

            SystemUtils.serviceControllerLogTracer({
                currentTimeMillis : currentTimeMillis,
                error : e
            });
        }
    },
    communicatorLogTracer : function(options, logger, data) {
        var currentTimeMillis = new Date().getTime();
        var debugString = "\n";
        debugString += ("------------------------------------ CVCAF Error Trace Log(Communicator) ---------------------------------------\n");
        debugString += (" - Request method     : " + options.method + "\n");
        debugString += (" - Request contentType: " + options.contentType + "\n");
        debugString += (" - Async              : " + options.async + "\n");
        debugString += (" - Request url        : " + options.url + "\n");
        debugString += (" - Request parameter  : ");
        if (StringUtils.trimToEmpty(options.method).toUpperCase() == "POST" && StringUtils.trimToEmpty(options.contentType).toUpperCase().indexOf("application/json") > -1) {
            debugString += (JSONUtils.format(options.params, "\t\t\t") + "\n");
        } else {
            debugString += (options.params + "\n");
        }
        debugString += (" - Response dataType  : " + options.dataType + "\n");
        if (typeof data != "undefined" && data != null) {
            debugString += (" - Response data      : ");
            debugString += (data + "\n");
        }
        if (typeof options.currentTimeMillis != "undefined") {
            debugString += (" - Elapsed time for Ajax communication : " + (currentTimeMillis - options.currentTimeMillis) + "ms\n");
        }
        debugString += ("----------------------------------------------------------------------------------------------------------------\n");
        if (!Config.live){logger.log(debugString);}
    },
    serviceControllerLogTracer : function(options) {
        var currentTimeMillis = new Date().getTime();
        var debugString = "\n";
        debugString += ("----------------------------------- CVCAF Error Trace Log(ServiceController) -----------------------------------\n");
        if (options.error.stack) {
            debugString += (options.error.stack + "\n");
        } else {
            debugString += ("This browser is not support CVCAF script debug \n");
        }
        debugString += "\n";
        if (options.currentTimeMillis) {
            debugString += (" - Elapsed time for until the script error : " + (currentTimeMillis - options.currentTimeMillis) + "ms\n");
        }
        debugString += ("----------------------------------------------------------------------------------------------------------------\n");
        if (typeof console != 'undefined') {
            if (!Config.live){console.log(debugString);}
        }
        throw options.error;
    },
    mergeOptions : function(thisOptions, options) {
        if(typeof options != "undefined" && options != null) {
        	if(typeof options.noMergeOptions == "undefined" || options.noMergeOptions != true) {
        		var dataListEmptyCheck;
        		if(Config.mergeOptionsAllowEmpty) {
        			dataListEmptyCheck = !ArrayUtils.isEmpty(options.dataList);
        		} else {
        			dataListEmptyCheck = options.dataList != null;
        		}
	            if(dataListEmptyCheck && thisOptions.dataList != options.dataList) {
	                if(thisOptions.dataList != null) {
	                    thisOptions.dataList.length = 0;
	                    thisOptions.dataList = $.merge(thisOptions.dataList, options.dataList);
	                    options.dataList = thisOptions.dataList;
	                }
	            }

	            //DataGrid paging options
	            if(options.pagingOpts && thisOptions.pagingOpts != options.pagingOpts) {
	                $.extend(thisOptions.pagingOpts, thisOptions.pagingOpts, options.pagingOpts);
	                options.pagingOpts = thisOptions.pagingOpts;
	            }
	            //DataGrid inner paging options
	            if(options.scrollPagingOpts && thisOptions.scrollPagingOpts != options.scrollPagingOpts) {
	                $.extend(thisOptions.scrollPagingOpts, thisOptions.scrollPagingOpts, options.scrollPagingOpts);
	                options.scrollPagingOpts = thisOptions.scrollPagingOpts;
	            }
        	}
            $.extend(thisOptions, thisOptions, options);
        }
        return thisOptions;
    },
    getLocale : function() {
        if (navigator) {
            if (navigator.language) {
                return navigator.language.substring(0, 2);
            } else if (navigator.browserLanguage) {
                return navigator.browserLanguage.substring(0, 2);
            } else if (navigator.systemLanguage) {
                return navigator.systemLanguage.substring(0, 2);
            } else if (navigator.userLanguage) {
                return navigator.userLanguage.substring(0, 2);
            }
        }
    },
    getClassOpts : function($cell) {
        var cellOpts = null;
        var jsonString = this.getClassJSONString($cell);
        if (jsonString != null) {
            cellOpts = JSON.parse(jsonString);
            if (cellOpts.cellHandler != null) {
                try {
                    var func = cellOpts.cellHandler.split(".");
                    if (func.length == 2) {
                        cellOpts.cellHandler = window[func[0]][func[1]];
                    } else if (func.length == 3) {
                        cellOpts.cellHandler = window[func[0]][func[1]][func[2]];
                    } else if (func.length == 4) {
                        cellOpts.cellHandler = window[func[0]][func[1]][func[2]][func[3]];
                    } else if (func.length == 5) {
                        cellOpts.cellHandler = window[func[0]][func[1]][func[2]][func[3]][func[4]];
                    } else {
                        cellOpts.cellHandler = window[cellOpts.cellHandler];
                    }
                } catch (e) {
                    if (e.toString().indexOf("TypeError") > -1) {
                        throw new Error("[SystemUtils.getClassOpts]" + cellOpts.cellHandler + " is invalid function");
                    } else {
                        throw new Error(e);
                    }
                } finally {
                    func = null;
                }
            }
            if (cellOpts.rowSetHandler != null) {
                try {
                    var func = cellOpts.rowSetHandler.split(".");
                    if (func.length == 2) {
                        cellOpts.rowSetHandler = window[func[0]][func[1]];
                    } else if (func.length == 3) {
                        cellOpts.rowSetHandler = window[func[0]][func[1]][func[2]];
                    } else if (func.length == 4) {
                        cellOpts.rowSetHandler = window[func[0]][func[1]][func[2]][func[3]];
                    } else if (func.length == 5) {
                        cellOpts.rowSetHandler = window[func[0]][func[1]][func[2]][func[3]][func[4]];
                    } else {
                        cellOpts.rowSetHandler = window[cellOpts.rowSetHandler];
                    }
                } catch (e) {
                    if (e.toString().indexOf("TypeError") > -1) {
                        throw new Error("[SystemUtils.getClassOpts]" + cellOpts.rowSetHandler + " is invalid function");
                    } else {
                        throw new Error(e);
                    }
                } finally {
                    func = null;
                }
            }
        }
        jsonString = null;
        return cellOpts;
    },
    getInheritanceOptsClassString : function(cellOpts) {
        var className = null;
        if (cellOpts != null) {
            className = "{ ";
            if (cellOpts.format != null) {
                className += "\"format\" : \"" + cellOpts.format + "\"";
            }
            if (cellOpts.format != null && cellOpts.validate != null) {
                className += ", ";
            }
            if (cellOpts.validate != null) {
                className += "\"validate\" : \"" + cellOpts.validate + "\"";
            }
            className += " }";
            if (cellOpts.format == null && cellOpts.validate == null) {
                className = null;
            }
        }
        return className;
    },
    //XXX
    getClassJSONString : function(cell) {
        var classString = StringUtils.trimToNull($(cell).attr("class"));
        var jsonString = null;
        if (classString != null && classString.indexOf("{") > -1 && classString.indexOf("}") > -1) {
            jsonString = classString.substring(classString.indexOf("{"), classString.indexOf("}") + 1);
        }
        classString = null;
        return jsonString;
    },
    /**
     * validate, format rule 문자를 제외한 argument만 가져온다.
     *
     * @param str
     * @returns
     */
  //XXX
    getStringArg : function(str) {
        return (StringUtils.trimToNull(str) != null && str.indexOf("(") > -1 && str.indexOf(")") > -1) ? (str.substring(str.indexOf("(") + 1, str.indexOf(")"))).replaceAll("_", " ") : null;
    },
    /**
     * validate, format argument를 제외한 rule 문자만 가져온다.
     *
     * @param str
     * @returns
     */
  //XXX
    getRule : function(str) {
        if (str.indexOf("(") > -1 && str.indexOf(")") > -1) {
            str = str.substring(0, str.indexOf("("));
        } else {
            if (str.indexOf("+") > -1) {
                var multyRule = str.split("+");
                multyRule.sort();
                str = SystemUtils.arrayToString(multyRule, "_");
            }
        }
        return str;
    },
    getSingleCheckboxValue : function($checkbox, defValue) {
        var value;
        if ($checkbox.prop("checked")) {
            if (defValue == "1" || defValue == "0") {
                value = "1";
            } else if (defValue == "Y" || defValue == "N") {
                value = "Y";
            } else {
                value = Config.checkedValue;
            }
        } else {
            if (defValue == "1" || defValue == "0") {
                value = "0";
            } else if (defValue == "Y" || defValue == "N") {
                value = "N";
            } else {
                value = Config.unCheckedValue;
            }
        }
        return value;
    },
    getMultyValues : function($input) {
        var values;
        var $targetInputs = null;
        if ($input.is("input[type='checkbox']")) {
            $targetInputs = $("input:checkbox[name='" + $input.attr("name") + "']:checked");
        } else if ($input.is("input[type='radio']")) {
            $targetInputs = $("input:radio[name='" + $input.attr("name") + "']:checked");
        } else if ($input.is("select")) {
            $targetInputs = $input.find("option:selected");
        }
        if (Config.multyValuesArray && $targetInputs != null && $targetInputs.length > 1) {
            values = [];
        } else {
            values = "";
        }
        if ($targetInputs != null) {
            $targetInputs.each(function(i) {
                if (SystemUtils.realTypeOf(values) == "array") {
                    values.push(this.value);
                } else {
                    values += this.value + ",";
                }
            });
        }
        if (SystemUtils.realTypeOf(values) == "array") {
            if (values.length == 0) {
                values = "";
            }
        } else {
            if (values != "") {
                values = values.substring(0, values.length - 1);
            } else {
                values = StringUtils.trimToEmpty(values);
            }
        }
        return values;
    },
    getMultiCheckBoxValues : function($checkBoxs) {
       var value = [];
       if($checkBoxs.length == 1) {
           value.push($checkBoxs.val());
       } else if($checkBoxs.length > 1) {
           $checkBoxs.each(function() {
               if($(this).prop("checked")) {
                   value.push($(this).val());
               }
           });
       }
       if (!Config.multyValuesArray) {
           return value.toString();
       } else {
           return value;
       }
    },
    cellTidify : function($trs) {
        var tidiedTrs = new Array();
        var tr = new Array();
        $trs.each(function(trIndex) {
            $(this).children().each(function() {
                if (StringUtils.trimToZero($(this).attr("rowspan")) <= 1) {
                    if (StringUtils.trimToZero($(this).attr("colspan")) > 1) {
                        for ( var i = 1; i <= Number($(this).attr("colspan")); i++) {
                            tr.push(this);
                        }
                    } else {
                        tr.push(this);
                    }
                }
            });
            tidiedTrs.push(tr);
            tr = [];
        });
        return tidiedTrs;
    },
    getUpperCell : function(tidiedTrs, $srcCell) {
        $srcTrs = $srcCell.closest("table").find("thead tr");
        // TODO 로우수에 상관없이 리사이징 할려면 상위에 있는 모든 로우를 Array 로 빼서 로우수에 관계없이 지원.
        // - 로우가 많아질수록 버벅거려서 재대로 동작안할 수 있음.
        if ($srcCell.closest("tr").index() > 0 && StringUtils.trimToZero($srcCell.attr("rowspan")) <= 1) {
            return $(tidiedTrs[$srcCell.closest("tr").index() - 1][$srcCell.index()]);
        } else {
            return null;
        }
    },
    realTypeOf : function(v) {
        if (typeof (v) == "object") {
            if (v === null) {
                return "null";
            }
            if (v.constructor == (new String).constructor) {
                return "string";
            }
            if (v.constructor == (new Array).constructor) {
                return "array";
            }
            if (v.constructor == (new Date).constructor) {
                return "date";
            }
            if (v.constructor == (new RegExp).constructor) {
                return "regex";
            }
            if (v.constructor.toString().toUpperCase().indexOf("HTML") > -1 && v.constructor.toString().toUpperCase().indexOf("ELEMENT")) {
                return "html";
            }
            return "object";
        }
        return typeof (v);
    },
    arrayToString : function(array, delimiter) {
        var value = null;
        if (array != null) {
            value = "";
            $(array).each(function() {
                value += (this + delimiter);
            });
            value = value.substring(0, value.trim().length - 1);
        }
        return value;
    },
    functionToString : function(functionObj) {
        var functionStr = StringUtils.trimToEmpty(functionObj.toString());
        if (functionStr.length > 1) {
            if (functionStr.indexOf("\n") > -1) {
                functionStr = functionStr.substring(functionStr.indexOf("\n"), functionStr.length - 1);
            }
        }
        return StringUtils.trim(functionStr);
    },
    block : function(context) {
        $.blockUI.defaults.fadeIn = 0;
        $.blockUI.defaults.fadeOut = 400;
        $.blockUI.defaults.overlayCSS = {
            backgroundColor : '#CCCCCC',
            opacity : 0.6
        };
        $.blockUI.defaults.message = "<img src='js/cvcaf/images/ajax-loader.gif' width='45' height='45'>";
        $.blockUI.defaults.css = {
            border : 'none',
            padding : '15px',
            height : '45px',
            width : '45px',
            backgroundColor : '#555555',
            '-webkit-border-radius' : '15px',
            '-moz-border-radius' : '15px',
            opacity : 0.6,
            color : '#CCCCCC'
        };
        if (context == null) {
            context = Config.BlockUIContext;
        }
        $(context).block();
    },
    unblock : function(context) {
        if (context == null) {
            context = Config.BlockUIContext;
        }
        setTimeout(function() {
            $(context).unblock();
        }, 50);
    },
    initPage : function(serviceController, childServiceControllerId, multyLoad) {
        if (serviceController != null) {
            if (JSONUtils.isEmpty(window.ServiceController)) {
                window.ServiceController = serviceController;
            } else {
                if (childServiceControllerId != null) {
                    if (typeof window.ChildServiceControllers == "undefined" || window.ChildServiceControllers == null) {
                        window.ChildServiceControllers = {};
                        window.ChildServiceControllers = {};
                    }
                    if (multyLoad) {
                        childServiceControllerId += ("-" + Math.uuid());
                    }
                    window.ChildServiceControllers[childServiceControllerId] = serviceController;
                }
            }

            if (typeof serviceController.init != 'undefined' && serviceController.init != null) {
                this.initPop(serviceController.init, childServiceControllerId);
            }
        }
    },
    initPop : function(init, childServiceControllerId) {
        return function() {
            if ($("#contextDataRepository").length == 0){$(Config.pageContext).append("<var id='contextDataRepository'></var>");}
            $(Config.pageContext + " #contextDataRepository").unbind("popInit");
            $(Config.pageContext + " #contextDataRepository").bind("popInit", init);
            if (childServiceControllerId != null) {
                $(Config.pageContext + " #contextDataRepository").data("childServiceControllerId", childServiceControllerId);
            }
        }();
    },
    popInit : function($element) {
        if ($element == null) {
            $element = $(Config.pageContext + " #contextDataRepository");
        }
    	if(Config.ServiceControllerTemplateUse) {
    		var serviceController = null;
    		if(typeof window.ChildServiceControllers == "undefined") {
    			serviceController = window.ServiceController;
    		} else {
    			serviceController = window.ChildServiceControllers[$(Config.pageContext + " #contextDataRepository").data("childServiceControllerId")];
    		}
    		serviceController.self = $element;
    		var scInitDeferred = Config.ServiceControllerTemplate().init(serviceController);
        	if(scInitDeferred !== undefined) {
        		scInitDeferred.promise().done(function() {
        			$element.trigger("popInit");
            	});
        	} else {
        		$element.trigger("popInit");
        	}
        } else {
        	$element.trigger("popInit");
        }
    },
    functionReady : function(functionName, arg, container) {
        return function() {
            var time = null;
            var loopCount = 0;
            time = setInterval(function() {
                try {
                    var func = functionName.split(".");
                    if (func.length == 2) {
                        if (container != null) {
                            if (container[func[0]] != null && container[func[0]][func[1]] != null) {
                                if (!Config.live) {
                                    if (typeof console != 'undefined'){console.log("[SystemUtils.functionReady]\"" + functionName + "\" function Ready!");}
                                }
                                container[func[0]][func[1]](arg);
                                clearInterval(time);
                            }
                        } else {
                            if (window[func[0]] != null && window[func[0]][func[1]] != null) {
                                if (!Config.live) {
                                    if (typeof console != 'undefined'){console.log("[SystemUtils.functionReady]\"" + functionName + "\" function Ready!");}
                                }
                                window[func[0]][func[1]](arg);
                                clearInterval(time);
                            }
                        }
                    } else {
                        if (container != null) {
                            if (container[functionName] != null) {
                                if (!Config.live) {
                                    if (typeof console != 'undefined'){console.log("[SystemUtils.functionReady]\"" + functionName + "\" function Ready!");}
                                }
                                container[functionName](arg);
                                clearInterval(time);
                            }
                        } else {
                            if (window[functionName] != null) {
                                if (!Config.live) {
                                    if (typeof console != 'undefined'){console.log("[SystemUtils.functionReady]\"" + functionName + "\" function Ready!");}
                                }
                                window[functionName](arg);
                                clearInterval(time);
                            }
                        }
                    }
                    if (loopCount > 30) {
                        throw new Error("[SystemUtils.functionReady]Undefined function \"" + functionName + "\"");
                    }
                    loopCount++;
                } catch (e) {
                    clearInterval(time);
                    throw new Error("[SystemUtils.functionReady]" + e);
                }
                return true;
            }, 100);
        }();
    },
    stringToFunction : function(funcStr) {
        try {
            var func = funcStr.split(".");
            if (func.length == 2) {
                return window[func[0]][func[1]];
            } else if (func.length == 3) {
                return window[func[0]][func[1]][func[2]];
            } else if (func.length == 4) {
                return window[func[0]][func[1]][func[2]][func[3]];
            } else if (func.length == 5) {
                return window[func[0]][func[1]][func[2]][func[3]][func[4]];
            } else {
                return window[funcStr];
            }
        } catch(e) {
            return undefined;
        }
    },
    imagePreloader : function(images) {
        var imageObj = new Image();
        for ( var i = 0; i < images.length; i++) {
            imageObj.src = images[i];
        }
    },
    disableLink : function(e) {
        e.preventDefault();
        e.stopImmediatePropagation();
        e.stopPropagation();
        return false;
    },
    preventDoubleSubmitOffTime : 0,
    preventDoubleSubmitStatus : "off",
    /**
     * deprecated Config.preventDoubleSubmitOn, Config.preventDoubleSubmitOff 를 직접 호출함;
     * @param status
     */
    preventDoubleSubmit : function(status) {
        if (status != null && status == "on") {
            if(SystemUtils.preventDoubleSubmitStatus == "off") {
            	Config.preventDoubleSubmitOn({});
            	SystemUtils.preventDoubleSubmitStatus = "on";
            }
        } else {
            $("div.popupContentsBlock").css("cursor", "auto");
            if(SystemUtils.preventDoubleSubmitOffTime > 0) {
                clearTimeout(SystemUtils.preventDoubleSubmitOffTime);
            }
            SystemUtils.preventDoubleSubmitOffTime = setTimeout(function() {
                if(SystemUtils.preventDoubleSubmitOffTime > 0) {
                	Config.preventDoubleSubmitOff();
                }

                SystemUtils.preventDoubleSubmitOffTime = 0;
                SystemUtils.preventDoubleSubmitStatus = "off";
            }, 250);
        }
    },
    resetComponentEvents : function() {
        // monthpicker 이벤트 제거
        $(document).unbind("click.jQuery.monthpicker");
        // grid document 이벤트 제거
        $(document).unbind("mouseup.DataGrid.resizable");
        $(document).unbind("mousemove.DataGrid.resizable");
        $(window).unbind("resize.DataGrid.resizable");
        $(window).unbind("resize.DataGrid.initHeight");

        //for HYIN
        $(window).unbind("resize.rd");
    },
    resetFrameworkDefaultResource : function() {
     // ChildServiceControllers 초기화
        if (typeof ChildServiceControllers != 'undefined' && ChildServiceControllers != null) {
            try {
                delete ChildServiceControllers;
            } catch (e) {
                ChildServiceControllers = undefined;
            }
        }

        // 메모리 회수 - ServiceController 제거
        if (typeof ServiceController != 'undefined' && ServiceController != null) {
            try {
                if (!delete ServiceController) {
                    ServiceController = undefined;
                }
            } catch (e) {
                ServiceController = undefined;
            }
        }

        // 메모리 회수 - Config.pageContext 영역 비우기
        $(Config.pageContext).find("script").remove();
        $(Config.pageContext).empty();

        // 메모리 회수 - 메시지 제거
        MessageUtils.hide();

        // 메모리 회수 - DatePicker 초기화
        $("input[type='text'].hasDatepicker").datepicker("destroy");
        $("div#ui-datepicker-div.ui-datepicker").hide();
    },
    disableTextSelect : function(target) {
        if ($.browser.webkit) {//Webkit
            $(target).css('webkitUserSelect', 'none');
        } else if ($.browser.mozilla) {//Firefox
            $(target).css('MozUserSelect', 'none');
        }
        $(target).bind('selectstart.SystemUtils.disableTextSelect', function() {
            return false;
        });
    },
    enableTextSelect : function(target) {
        if ($.browser.webkit) {//Webkit
            $(target).css('webkitUserSelect', 'text');
        } else if ($.browser.mozilla) {//Firefox
            $(target).css('MozUserSelect', 'text');
        }
        $(target).unbind('selectstart.SystemUtils.disableTextSelect');
    },
    onLoadIframe : function( $iframe, eventHandler ) {
        if($.browser.msie) {
            try {
                $($iframe.get(0).contentWindow.document).ready(eventHandler);
            } catch(e) {
                $iframe.get(0).onload = eventHandler;
            }
        } else {
            $iframe.load( eventHandler );
        }
    }
};

var JCFUtils = {
    makeJCFParams4JSON : function(paramsId, params) {
        return "{\"" + paramsId + "\":" + params + "}";
    },
    getDataListKeys : function(jsonArray) {
        var keys = [];
        for (var key in jsonArray) {
            //for HYIN if(key != "success") {
            if(key != "success") {
                keys.push(key);
            }
        }
        return keys.length > 0 ? keys : null;
    },
    getFirstDataList : function(jsonArray) {
        return jsonArray != null && this.getDataListKeys(jsonArray) != null ? jsonArray[this.getDataListKeys(jsonArray)[0]] : null;
    },
    getFirstArray : function(jsonArray) {
        return jsonArray != null && jsonArray[this.getDataListKeys(jsonArray)[0]] != null ? jsonArray[this.getDataListKeys(jsonArray)[0]] : [];
    },
    getDataList : function(jsonArray, dataListId) {
        if (dataListId != null) {
            return jsonArray != null && jsonArray[dataListId] && jsonArray[dataListId][0].list != null ? jsonArray[dataListId][0].list : [];
        } else {
            return jsonArray != null && this.getFirstDataList(jsonArray) != null && this.getFirstDataList(jsonArray)[0].list != null ? this.getFirstDataList(jsonArray)[0].list : [];
        }
    },
    getNullDataList : function(jsonArray, dataListId) {
        if (dataListId != null) {
            return jsonArray != null && jsonArray[dataListId] && jsonArray[dataListId][0].list != null ? jsonArray[dataListId][0].list : null;
        } else {
            return jsonArray != null && this.getFirstDataList(jsonArray)[0].list != null ? this.getFirstDataList(jsonArray)[0].list : null;
        }
    },
    /**
     * @deprecated getResultDataList 에서 dataListId 를 넣지 않으면 똑같은 기능을 수행함
     */
    getFirstResultDataList : function(jsonArray) {
        return this.getFirstDataList(jsonArray) != null ? JCFUtils.getFirstDataList(jsonArray)[0].list : null;
    },
    /**
     * @deprecated getDataList 에서 dataListId 를 넣지 않으면 똑같은 기능을 수행함
     */
    getFirstResultArray : function(jsonArray) {
        return JCFUtils.getFirstDataList(jsonArray)[0].list != null ? JCFUtils.getFirstDataList(jsonArray)[0].list : [];
    },
    getMessage : function(array) {
        var msg = null;

        return msg;
    },
    getActionString : function(url) {
        url = StringUtils.trimToEmpty(url);
        url = url.split("/");
        if (url.length > 0) {
            url = url[url.length - 1];
        }
        return url;
    }
};

var JSONUtils = {
    format : function(oData, sIndent) {
        if (oData != null && !this.isEmpty(oData)) {
            if (typeof oData == "string") {
                oData = JSON.parse(oData);
            }
            if (arguments.length < 2) {
                sIndent = "";
            }
            var sIndentStyle = "    ";
            var sDataType = SystemUtils.realTypeOf(oData);

            var sHTML;
            if (sDataType == "array") {
                if (oData.length == 0) {
                    return "[]";
                }
                sHTML = "[";
            } else {
                var iCount = 0;
                $.each(oData, function() {
                    iCount++;
                    return;
                });
                if (iCount == 0) {
                    return "{}";
                }
                sHTML = "{";
            }
            var iCount = 0;
            $.each(oData, function(sKey, vValue) {
                if (iCount > 0) {
                    sHTML += ",";
                }
                if (sDataType == "array") {
                    sHTML += ("\n" + sIndent + sIndentStyle);
                } else {
                    sHTML += ("\n" + sIndent + sIndentStyle + "\"" + sKey + "\"" + ": ");
                }
                switch (SystemUtils.realTypeOf(vValue)) {
                case "array":
                case "object":
                    sHTML += JSONUtils.format(vValue, (sIndent + sIndentStyle));
                    break;
                case "boolean":
                case "number":
                    sHTML += vValue.toString();
                    break;
                case "null":
                    sHTML += "null";
                    break;
                case "string":
                    sHTML += ("\"" + vValue + "\"");
                    break;
                default:
                    sHTML += ("TYPEOF: " + typeof (vValue));
                }
                iCount++;
            });
            if (sDataType == "array") {
                sHTML += ("\n" + sIndent + "]");
            } else {
                sHTML += ("\n" + sIndent + "}");
            }
            return sHTML;
        } else {
            return null;
        }
    },
    sortBy : function(field, reverse) {
        reverse = reverse ? -1 : 1;
        return function(a, b) {
            a = StringUtils.nullToEmpty(String(a[field])).replaceAll(".", "").replaceAll("-", "");
            b = StringUtils.nullToEmpty(String(b[field])).replaceAll(".", "").replaceAll("-", "");

            if(parseInt(a) && parseInt(b)) {
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
    sort : function(jsonArray, field, reverse) {
        return jsonArray.sort(JSONUtils.sortBy(field, reverse));
    },
    getMaxValue : function(jsonArray, field) {
        if(!this.isEmpty(jsonArray)) {
            return Math.max.apply(null, $.map(jsonArray, function(json) {
                if(isNaN(parseFloat(json[field]))) {
                    return 0;
                } else {
                    return parseFloat(json[field]);
                }
            }));
        } else {
            return null;
        }
    },
    isEmpty : function(obj) {
        if (typeof obj != "undefined" && obj != null) {
            for (i in obj) {
                return false;
            }
        }
        return true;
    },
    clone : function(o) {
        function c(o) {
            for ( var i in o) {
                this[i] = o[i];
            }
        }
        if (SystemUtils.realTypeOf(o) == 'array') {
        	var cloneO = [];
        	for (var i=0; i<o.length; i++) {
        		cloneO.push(new c(o[i]));
        	}
        	return cloneO;
        } else {
        	return new c(o);
        }
    }
};

var ArrayUtils = {
    isEmpty : function(array) {
        if (typeof array != "undefined" && array != null && array.length > 0) {
            return StringUtils.trimToNull(array) != null ? false : true;
        }
        return true;
    },
    replace : function(sourceArray, targetArray) {
        if(sourceArray == null) {
            sourceArray = [];
        }
        if(sourceArray.length > 0) {
            sourceArray.length = 0;
        }
        if(targetArray != null) {
            sourceArray = $.merge(sourceArray, targetArray);
        }
        return sourceArray;
    },
    remove : function(array, idx) {
        return (idx < 0 || idx > array.length) ? array : array.slice(0, idx).concat(array.slice(idx + 1, array.length));
    }
};

/**
 * required : 필수입력 필드<br>
 * alphabet : 영문자만 입력 가능<br>
 * integer : 숫자(정수)만 입력가능<br>
 * korean : 한글만 입력 가능<br>
 * alphabet+integer : 영문자와 숫자(정수)만 입력 가능(+로 구분하고 순서는 관계없음)<br>
 * integer+korean : 숫자(정수)와 한글만 입력 가능(+로 구분하고 순서는 관계없음)<br>
 * alphabet+korean : 영문자와 한글만 입력 가능(+로 구분하고 순서는 관계없음)<br>
 * alphabet+integer+korean : 영문자, 숫자(정수), 한글만 입력 가능(+로 구분하고 순서는 관계없음)<br>
 * integer+dash : 숫자(정수)와 대쉬(-)만 입력가능<br>
 * decimal : (유한)소수만 입력 가능<br>
 * decimal(length) : (유한)소수 length 번째 자리까지 입력 가능<br>
 * email : e-mail 형식에 맞는지 검사<br>
 * url : URL 형식에 맞는지 검사<br>
 * zipcode : 우편번호 형식에 맞는지 검사<br>
 * ssn : 주민등록번호 형식에 맞지 검사<br>
 * frn : 외국인번호 형식에 맞지 검사<br>
 * frn+ssn : 주민번호+외국인번호 형식에 맞지 검사<br>
 * cno : 사업자등록번호 형식에 맞는지 검사<br>
 * cpno : 법인번호 형식에 맞는지 검사<br>
 * date : 날짜 형식에 맞는지 검사<br>
 * time : 시간 형식에 맞는지 검사<br>
 * accept(word) : word 값만 입력 가능<br>
 * match(word) : word 가 포함된 값만 입력 가능<br>
 * acceptFileExt(ext) : ext 포함된 확장자만 입력 가능<br>
 * notAccept(word) : word 값만 입력 불가능<br>
 * notMatch(word) : word 가 포함된 값은 입력 불가능<br>
 * notAcceptFileExt(ext) : ext 가 포함된 확장자는 입력 불가능<br>
 * equalTo(input) : input 의 값과 같아야 함.<br>
 * maxlength(length) : length 글자 이하만 입력 가능<br>
 * minlength(length) : length 글자 이상만 입력 가능<br>
 * rangelength(startLength,endLength) : stratLength 글자 에서 endLength 글자 까지만 입력
 * 가능.<br>
 * maxbyte(byteLength) : length 바이트 이하만 입력 가능<br>
 * minbyte(byteLength) : length 바이트 이상만 입력 가능<br>
 * rangebyte(startByteLength,endByteLength) : startByteLength 바이트 에서
 * endByteLength 바이트 까지만 입력 가능.<br>
 * maxvalue(value) : value 이하의 값만 입력 가능<br>
 * minvalue(value) : value 이상의 값만 입력 가능<br>
 * rangevalue(stratValue,endValue) : stratValue 값 에서 endValue 값 까지만 입력 가능.<br>
 * regexp(regexp,message) : 입력한 regexp 의 조건으로 검사
 */
var Validator = {
    "massages_ko" : {
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
        maxbyte_ : "{0} 바이트 이하만 입력 가능합니다.<br> - 영문, 숫자 : 1 바이트<br> - 한글, 특수문자 : 2 바이트",
        minbyte_ : "{0} 바이트 이상만 입력 가능합니다.<br> - 영문, 숫자 : 1 바이트<br> - 한글, 특수문자 : 2 바이트",
        rangebyte_ : "{0} 바이트 에서 {1} 바이트 까지만 입력 가능합니다.<br> - 영문, 숫자 한글자 : 1 바이트<br> - 한글, 특수문자 : 2 바이트",
        maxvalue_ : "{0} 이하의 값만 입력 가능합니다.",
        minvalue_ : "{0} 이상의 값만 입력 가능합니다.",
        rangevalue_ : "{0} 에서 {1} 사이의 값만 입력 가능합니다.",
        regexp_ : "{1}"
    },
    "massages_en" : {
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
    },
	"massages_zh" : {
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
    },
    validate : function($input) {
        ValidationUtils.$input = $input;
        var cellOpts = SystemUtils.getClassOpts($input);
        if (cellOpts != null && cellOpts.validate != null) {
            var rules = cellOpts.validate.split(" ");
            var argsString = null;
            var rule = null;
            var msgArgs = [];
            for ( var i = 0; i < rules.length; i++) {
                argsString = SystemUtils.getStringArg(rules[i]);
                if (argsString != null) {
                    ValidationUtils.stringArguments = argsString.split(",");
                    msgArgs = argsString.split(",");
                }

                rule = SystemUtils.getRule(rules[i]);
                var validateResult = true;
                try {
                    validateResult = ValidationUtils[rule]();
                } catch (e) {
                    if (e.toString().indexOf("is not a function") > -1) {
                        throw new Error("[Validator.validate]" + rule + " is invalid validation rule");
                    } else {
                        throw new Error(e);
                    }
                }

                if (!validateResult) {
                    if (rule != "required" && StringUtils.trimToNull($input.val()) == null) {
                        return true;
                    }
                    var msg = this["massages_" + Config.locale][rule];
                    if (msgArgs.length > 0){msg = this["massages_" + Config.locale][rule + "_"];}
                    if (typeof msg == "undefined") {
                        msg = this["massages_" + Config.locale]["global"];
                    }
                    MessageUtils.show(msg, msgArgs, $input);
                    msg = null;
                    ValidationUtils.$input = null;
                    return false;
                } else {
                    $(Config.messageContext + " div.objectMessage").remove();
                    if (MessageUtils.timeOut != null) {
                        clearTimeout(MessageUtils.timeOut);
                    }
                }
                msgArgs = [];
            }
            rule = null;
            argsString = null;
            msgArgs = null;
        }
        cellOpts = null;
        ValidationUtils.$input = null;
        return true;
    }
};

var ValidationUtils = {
    "$input" : null,
    "stringArguments" : null,
    /**
     * Makes the element always required.
     *
     * @returns {Boolean}
     */
    "required" : function() {
        return (StringUtils.trimToNull(this.$input.val()) != null) ? true : false;
    },
    /**
     * Makes the element require alphabet only.
     *
     * @returns {Boolean}
     */
    "alphabet" : function() {
        return new RegExp(/^[a-z\s]+$/i).test(this.$input.val());
    },
    /**
     * Makes the element require integer only.
     *
     * @returns {Boolean}
     */
    "integer" : function() {
        return new RegExp(/^-?\d+$/).test(this.$input.val());
    },
    /**
     * Makes the element require korean only.
     *
     * @returns434 {Boolean}
     */
    "korean" : function() {
        return new RegExp(/^[ㄱ-ㅎ|ㅏ-ㅣ|가-힣\s]+$/).test(this.$input.val());
    },
    /**
     * Makes the element require alphabet, integer only.
     *
     * @returns {Boolean}
     */
    "alphabet_integer" : function() {
        return new RegExp(/^[a-z-?\d\s]+$/i).test(this.$input.val());
    },
    /**
     * Makes the element require integer, korean only.
     *
     * @returns {Boolean}
     */
    "integer_korean" : function() {
        return new RegExp(/^[ㄱ-ㅎ|ㅏ-ㅣ|가-힣-?\d\s]+$/).test(this.$input.val());
    },
    /**
     * Makes the element require alphabet, korean only.
     *
     * @returns {Boolean}
     */
    "alphabet_korean" : function() {
        return new RegExp(/^[ㄱ-ㅎ|ㅏ-ㅣ|가-힣a-z\s]+$/i).test(this.$input.val());
    },
    /**
     * Makes the element require alphabet, integer, korean only.
     *
     * @returns {Boolean}
     */
    "alphabet_integer_korean" : function() {
        return new RegExp(/^[ㄱ-ㅎ|ㅏ-ㅣ|가-힣a-z-?\d\s]+$/i).test(this.$input.val());
    },
    /**
     * Makes the element require integer & dash only.
     *
     * @returns {Boolean}
     */
    "dash_integer" : function() {
        return new RegExp(/^(\d|-)+$/).test(this.$input.val());
    },
    /**
     * Makes the element require integer & dash only.
     *
     * @returns {Boolean}
     */
    "commas_integer" : function() {
        return new RegExp(/^(\d|,)+$/).test(this.$input.val());
    },
    /**
     * Makes the element require decimal only.
     *
     * @returns {Boolean}
     */
    "decimal" : function() {
        var length = (this.stringArguments != null && this.stringArguments[0] != null) ? this.stringArguments[0].trim() : 10;
        return new RegExp(/^-?\d+$/).test(this.$input.val()) || new RegExp("^-?\\d*\\.\\d{0," + length + "}$").test(this.$input.val());
    },
    /**
     * Makes the element require a valid email
     *
     * @returns {Boolean}
     */
    "email" : function() {
        return new RegExp(/^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)*(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i)
                .test(this.$input.val());
    },
    /**
     * Makes the element require a valid url
     *
     * @returns {Boolean}
     */
    "url" : function() {
        return new RegExp(/^(https?|ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)*(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i)
                .test(this.$input.val());
    },
    /**
     * Makes the element require a valid zipcode
     *
     * @returns {Boolean}
     */
    "zipcode" : function() {
        return new RegExp(/^\d{3}-\d{3}$/).test(this.$input.val());
    },
    /**
     * Makes the element require a valid phone number
     *
     * @returns {Boolean}
     */
    "phone" : function() {
    	if (this.stringArguments != null && this.stringArguments[0] != null) {
    		if(this.stringArguments[0] == "true") {
    			return new RegExp(/^\d{2,3}-\d{3,4}-\w+|"("")"$/).test(this.$input.val());
    		}
    	}
        return new RegExp(/^\d{2,3}-\d{3,4}-\d{4}$/).test(this.$input.val());
    },
    /**
     * Makes the element require a valid social security number
     *
     * @returns {Boolean}
     */
    "ssn" : function() {
        var str = this.$input.val().replace(/-/g, '');
        if (StringUtils.trimToEmpty(str).length != 13) {
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
     * Makes the element require a valid foreign registration number
     *
     * @returns {Boolean}
     */
    "frn" : function() {
        var str = this.$input.val().replace(/-/g, '');
        if (StringUtils.trimToEmpty(str).length != 13) {
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
    /**
     * Makes the element require a valid social security number and foreign registration number
     *
     * @returns {Boolean}
     */
    "frn_ssn" : function() {
        var str = this.$input.val().replace(/-/g, '');
        if (StringUtils.trimToEmpty(str).length != 13) {
            str = null;
            return false;
        }
        if(Number(str.charAt(6)) >= 5 && Number(str.charAt(6)) <= 8) {
        	return ValidationUtils.frn();
        } else {
        	return ValidationUtils.ssn();
        }
    },
    /**
     * Makes the element require a valid company registration number
     *
     * @returns {Boolean}
     */
    "cno" : function() {
        var re = /-/g;
        var bizID = this.$input.val().replace(re, '');
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
     * Makes the element require a valid corporate code
     *
     * @returns {Boolean}
     */
    "cpno" : function() {
        var re = /-/g;
        var cc = this.$input.val().replace(re, '');

        if (cc.length != 13) {
            return false;
        }

        var arr_regno = cc.split("");
        var arr_wt = new Array(1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2);
        var iSum_regno = 0;
        var iCheck_digit = 0;

        for ( var i = 0; i < 12; i++) {
            iSum_regno += eval(arr_regno[i]) * eval(arr_wt[i]);
        }

        iCheck_digit = 10 - (iSum_regno % 10);

        iCheck_digit = iCheck_digit % 10;

        if (iCheck_digit != arr_regno[12]) {
            return false;
        }
        return true;
    },
    /**
     * Makes the element require a valid date form
     *
     * @returns {Boolean}
     */
    "date" : function() {
        /*
         * 날짜포맷에 맞는지 검사
         */
        var isDateFormat = function(d) {
            if(StringUtils.trimToEmpty(d).length == 8) {
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

        var d = this.$input.val().replaceAll(Config.dateSeperator, '');
        if (!isDateFormat(d)) {
            return false;
        }

        var month_day = [ 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ];

        var year = d.substring(0,4);
        var month = d.substring(4,6);
        var day = d.substring(6,8);

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
    /**
     * Makes the element require a valid time form
     *
     * @returns {Boolean}
     */
    "time" : function() {
        return new RegExp(/^([01]\d|2[0-3])([0-5]\d){0,2}$/).test(this.$input.val().replaceAll(":", ""));
    },
    /**
     * Makes the element require a certain given word.
     *
     * @returns {Boolean}
     */
    "accept" : function() {
        if (this.stringArguments == null || this.stringArguments[0] == null) {
            throw new Error("[ValidationUtils.accept]Please Enter accept String");
        }
        return (new RegExp("^(" + this.stringArguments[0] + ")$")).test(this.$input.val());
    },
    "match" : function() {
        if (this.stringArguments == null || this.stringArguments[0] == null) {
            throw new Error("[ValidationUtils.match]Please Enter match String");
        }
        return (new RegExp(this.stringArguments[0])).test(this.$input.val());
    },
    /**
     * Makes the element require a certain file extension.
     *
     * @returns {Boolean}
     */
    "acceptFileExt" : function() {
        if (this.stringArguments == null || this.stringArguments[0] == null) {
            throw new Error("[ValidationUtils.acceptFileExt]Please Enter accept file extention String");
        }
        return (new RegExp(".(" + this.stringArguments[0] + ")$", "i")).test(this.$input.val());
    },
    /**
     * Makes the element refuse a certain word.
     *
     * @returns {Boolean}
     */
    "notAccept" : function() {
        if (this.stringArguments == null || this.stringArguments[0] == null) {
            throw new Error("[ValidationUtils.notAccept]Please Enter refused String");
        }
        return !(new RegExp("^(" + this.stringArguments[0] + ")$")).test(this.$input.val());
    },
    /**
     * Makes the element refuse a certain word.
     *
     * @returns {Boolean}
     */
    "notMatch" : function() {
        if (this.stringArguments == null || this.stringArguments[0] == null) {
            throw new Error("[ValidationUtils.notMatch]Please Enter unmatched String");
        }
        return !(new RegExp(this.stringArguments[0])).test(this.$input.val());
    },
    /**
     * Makes the element refuse a certain file extension.
     *
     * @returns {Boolean}
     */
    "notAcceptFileExt" : function() {
        if (this.stringArguments == null || this.stringArguments[0] == null) {
            throw new Error("[ValidationUtils.notAcceptFileExt]Please Enter refused file extention String");
        }
        return !(new RegExp(".(" + this.stringArguments[0] + ")$", "i")).test(this.$input.val());
    },
    /**
     * Requires the element to be the same as another one
     *
     * @returns {Boolean}
     */
    "equalTo" : function() {
        if (this.stringArguments == null || this.stringArguments[0] == null) {
            throw new Error("[ValidationUtils.equalTo]Please Enter target INPUTElement(jQuery Selector String)");
        }
        if (this.stringArguments == null || this.stringArguments[0] == null) {
            throw new Error("[ValidationUtils.equalTo]Please Enter target INPUTElement name(desc)");
        }
        if (StringUtils.trimToNull($(this.stringArguments[0]).val()) == null) {
            return true;
        }
        return StringUtils.trimToEmpty(this.$input.val()) == StringUtils.trimToEmpty($(this.stringArguments[0]).val());
    },
    /**
     * Makes the element require a given minimum length.
     *
     * @returns {Boolean}
     */
    "maxlength" : function() {
        if (this.stringArguments == null || this.stringArguments[0] == null) {
            throw new Error("[ValidationUtils.maxlength]Please Enter maximum length value");
        }
        return StringUtils.trimToEmpty(this.$input.val()).length <= Number(StringUtils.trimToZero(this.stringArguments[0]));
    },
    /**
     * Makes the element require a given maxmimum length.
     *
     * @returns {Boolean}
     */
    "minlength" : function() {
        if (this.stringArguments == null || this.stringArguments[0] == null) {
            throw new Error("[ValidationUtils.minlength]Please Enter minimum length value");
        }
        return Number(StringUtils.trimToZero(this.stringArguments[0])) <= StringUtils.trimToEmpty(this.$input.val()).length;
    },
    /**
     * Makes the element require a given value range.
     *
     * @returns {Boolean}
     */
    "rangelength" : function() {
        if (this.stringArguments == null || this.stringArguments[0] == null) {
            throw new Error("[ValidationUtils.rangelength]Please Enter minimum length value");
        }
        if (this.stringArguments == null || this.stringArguments[1] == null) {
            throw new Error("[ValidationUtils.rangelength]Please Enter maximum length value");
        }
        return Number(StringUtils.trimToZero(this.stringArguments[0])) <= StringUtils.trimToEmpty(this.$input.val()).length && StringUtils.trimToZero(this.$input.val()).length <= Number(StringUtils.trimToEmpty(this.stringArguments[1]));
    },
    /**
     * Makes the element require a given minimum length.
     *
     * @returns {Boolean}
     */
    "maxbyte" : function() {
        if (this.stringArguments == null || this.stringArguments[0] == null) {
            throw new Error("[ValidationUtils.maxbyte]Please Enter maximum byte value");
        }
        return StringUtils.getByteLength(StringUtils.trimToEmpty(this.$input.val())) <= Number(StringUtils.trimToZero(this.stringArguments[0]));
    },
    /**
     * Makes the element require a given maxmimum length.
     *
     * @returns {Boolean}
     */
    "minbyte" : function() {
        if (this.stringArguments == null || this.stringArguments[0] == null) {
            throw new Error("[ValidationUtils.minbyte]Please Enter minimum byte value");
        }
        return Number(StringUtils.trimToZero(this.stringArguments[0])) <= StringUtils.getByteLength(StringUtils.trimToEmpty(this.$input.val()));
    },
    /**
     * Makes the element require a given value range.
     *
     * @returns {Boolean}
     */
    "rangebyte" : function() {
        if (this.stringArguments == null || this.stringArguments[0] == null) {
            throw new Error("[ValidationUtils.rangebyte]Please Enter minimum byte value");
        }
        if (this.stringArguments == null || this.stringArguments[1] == null) {
            throw new Error("[ValidationUtils.rangebyte]Please Enter maximum byte value");
        }
        return Number(StringUtils.trimToZero(this.stringArguments[0])) <= StringUtils.getByteLength(StringUtils.trimToEmpty(this.$input.val())) && StringUtils.getByteLength(StringUtils.trimToEmpty(this.$input.val())) <= Number(StringUtils.trimToZero(this.stringArguments[1]));
    },
    /**
     * Makes the element require a given minimum value.
     *
     * @returns {Boolean}
     */
    "maxvalue" : function() {
        if (this.stringArguments == null || this.stringArguments[0] == null) {
            throw new Error("[ValidationUtils.maxvalue]Please Enter maximum value");
        }
        return Number(StringUtils.trimToZero(this.$input.val())) <= Number(StringUtils.trimToZero(this.stringArguments[0]));
    },
    /**
     * Makes the element require a given maximum value.
     *
     * @returns {Boolean}
     */
    "minvalue" : function() {
        if (this.stringArguments == null || this.stringArguments[0] == null) {
            throw new Error("[ValidationUtils.minvalue]Please Enter minimum value");
        }
        return Number(StringUtils.trimToZero(this.stringArguments[0])) <= Number(StringUtils.trimToZero(this.$input.val()));
    },
    /**
     * Makes the element require a given value range.
     *
     * @returns {Boolean}
     */
    "rangevalue" : function() {
        if (this.stringArguments == null || this.stringArguments[0] == null) {
            throw new Error("[ValidationUtils.rangevalue]Please Enter minimum value value");
        }
        if (this.stringArguments == null || this.stringArguments[1] == null) {
            throw new Error("[ValidationUtils.rangevalue]Please Enter maximum value value");
        }
        return Number(StringUtils.trimToZero(this.stringArguments[0])) <= Number(StringUtils.trimToZero(this.$input.val())) && Number(StringUtils.trimToZero(this.$input.val())) <= Number(StringUtils.trimToZero(this.stringArguments[1]));
    },
    /**
     * Makes the element require a given regex string.
     *
     * @returns {Boolean}
     */
    "regexp" : function() {
        if (this.stringArguments == null || this.stringArguments[0] == null) {
            throw new Error("[ValidationUtils.regexp]Please Enter regular expression String");
        }
        var regExp = new RegExp(this.stringArguments[0].replaceAll("`", ","));
        if (this.stringArguments[2] != null) {
            regExp = new RegExp(this.stringArguments[0].replaceAll("`", ","), this.stringArguments[2]);
        }
        return regExp.test(this.$input.val());
    }
};

/**
 * 그리드의 format 옵션이나 bindValues, bindFields 할때 텍스트양식을 처리해주는 클래스<br>
 * ssn - 주민등록번호 형식으로 바꾼다.<br>
 * cno - 사업자등록번호 형식으로 바꾼다.<br>
 * upper - 대문자로 바꾼다.<br>
 * lower - 소문자로 바꾼다.<br>
 * capitalize - 첫번째 영문자를 대문자로 변경한다.<br>
 * zipcode - 우편번호 형식으로 변경한다.<br>
 * phoneNum - 전화번호 형식으로 변경한다.<br>
 * realnum - 의미없는 0은 지운다. (0100.0 -> 100, 0100.10 -> 100.1)<br>
 * trimToEmpty - trim 후 값이 없으면 공백으로 표시한다.<br>
 * trimToZero - trim 후 값이 없으면 0 으로 표시한다.<br>
 * trimToVal(valStr) - trim 후 값이 없으면 지정한 값으로 표시한다.<br>
 * date(opts) - Date 형식으로 바꾼다. (month : 월 달력표시, day : 일 달력 표시,
 * 6:년-월,8:년-월-일,10:년-월-일 시, 12:년-월-일 시:분, 14:년-월-일 시:분:초, 기본:8)<br>
 * limit(cutLength,replaceStr) - 문자열을 cutLength 만큼 자르고 replaceStr로 치환한다.<br>
 * replace(targetStr,replaceStr,true) - targetStr을 replaceStr로 치환한다. true 지정시 메모리의 데이터도 바꾼다(,(콤마)는 comma 란 문자로 입력해야함).<br>
 * lpad(length,fillStr) - length만큼 왼쪽부터 replaceStr문자로 채운다.<br>
 * rpad(length,fillStr) - length만큼 오른쪽부터 replaceStr문자로 채운다.<br>
 * generic(mask) - 엑셀사용자지정서식 참고 [ (예1) \#,###.### (# 숫자, @ 영문자) (예2) #,##0 ],
 * option : [ceil : #,###.## 무조건 올림 (소수점 처리가능), floor : 무조건 버림 (소수점 처리가능), round :
 * 반올림(소수점 처리가능)]<br>
 * numeric(mask, option) - 엑셀사용자지정서식 참고 [ (예1) \#,###.### (# 숫자, @ 영문자) (예2)
 * #,##0 ], option : [ceil : #,###.## 무조건 올림 (소수점 처리가능), floor : 무조건 버림 (소수점
 * 처리가능), round : 반올림(소수점 처리가능)]
 */
var Formater = {
    format : function($cell, str, vo) {
        FormatUtils.$input = $cell;
        var cellOpts = SystemUtils.getClassOpts($cell);
        if (cellOpts != null && cellOpts.format != null) {
            var rules = cellOpts.format.split(" ");
            var argsString = null;
            var rule = null;
            for ( var i = 0; i < rules.length; i++) {
                argsString = SystemUtils.getStringArg(rules[i]);
                if (argsString != null) {
                    FormatUtils.stringArguments = argsString.split(",");
                } else {
                	FormatUtils.stringArguments = null;
                }
                if (vo != null) {
                    FormatUtils.vo = vo;
                }
                rule = SystemUtils.getRule(rules[i]);

                try {
                    str = FormatUtils[rule](str != null ? String(str) : str);
                } catch (e) {
                    if (e.toString().indexOf("is not a function") > -1) {
                        throw new Error("[Formater.format]" + rule + " is invalid format rule");
                    } else {
                        throw new Error(e);
                    }
                }
                FormatUtils.stringArguments = null;
            }
            rule = null;
            argsString = null;
        }
        cellOpts = null;
        return str;
    },
    unformat : function(vo, fieldName) {
        return vo != null && vo[fieldName] != null ? vo[fieldName] : null;
    },
    unformatTextInput : function($input) {
        return $input.val().replaceAll(Config.dateSeperator, "").replaceAll("-", "").replaceAll(":", "").replaceAll(",", "");
    }
};

var FormatUtils = {
    "vo" : null,
    "$input" : null,
    "stringArguments" : null,
    /**
     * 숫자 세 자리마다 콤마를 삽입한다.
     */
    "commas" : function(str) {
        if (StringUtils.isEmpty(str)) {
            return str;
        }
        str = str.replace(/,/gi, "");
        var reg = /(^[+-]?\d+)(\d{3})/;
        str += '';
        while (reg.test(str)) {
            str = str.replace(reg, '$1' + ',' + '$2');
        }
        return str;
    },
    /**
     * 주민번호 중간에 '-'를 삽입
     */
    "ssn" : function(str) {
        if (StringUtils.isEmpty(str)) {
            return str;
        }
        str = str.replace(/-/gi, "");
        if (str.length == 13) {
            var strToPad = "*";
            if (this.stringArguments != null && this.stringArguments[1] != null) {
                strToPad = this.stringArguments[1];
            }
            if (this.stringArguments != null && this.stringArguments[0] != null) {
                str = StringUtils.rpad(str.substring(0, 13 - Number(this.stringArguments[0])), 13, strToPad);
                str = str.substring(0, 6) + "-" + str.substring(6, 13);
            } else {
                str = str.substring(0, 6) + "-" + str.substring(6, 13);
            }
        }
        return str;
    },
    /**
     * 사업자번호 중간에 Dash(-)를 삽입
     */
    "cno" : function(str) {
        if (StringUtils.trimToEmpty(str).length < 5) {
            return str;
        }
        str = str.replace(/-/gi, "");
        str = str.replace(/\s/gi, "");
        if (str.length > 10) {
            str = str.substring(0, 10);
        }
        return str.substring(0, 3) + "-" + str.substring(3, 5) + "-" + str.substring(5, 10);
    },
    /**
     * 영문자 대문자로 변경
     *
     * @param string
     * @returns
     */
    "upper" : function(str) {
        if (StringUtils.isEmpty(str)) {
            return str;
        }
        return str.toUpperCase();
    },
    /**
     * 영문자 소문자로 변경
     *
     * @param string
     * @returns
     */
    "lower" : function(str) {
        if (StringUtils.isEmpty(str)) {
            return str;
        }
        return str.toLowerCase();
    },
    /**
     * 첫번째 영문자 대문자로 변경
     *
     * @param string
     * @returns
     */
    "capitalize" : function(str) {
        if (StringUtils.isEmpty(str)) {
            return str;
        }
        var result = str.substring(0, 1).toUpperCase();
        if (str.length > 1){result = result + str.substring(1);}
        return result;
    },
    /**
     * 우편번호 형식으로 변경
     *
     * @param str
     * @returns
     */
    "zipcode" : function(str) {
        if (StringUtils.isEmpty(str)) {
            return str;
        }
        str = str.replace(/-/gi, "");
        return str.substring(0, 3) + "-" + str.substring(3, 6);
    },
    /**
     * 우편번호 형식으로 변경
     *
     * @param str
     * @returns
     */
    "phoneNum" : function(str) {
        if (StringUtils.isEmpty(str)) {
            return str;
        }
        str = str.replace(/-/gi, "");
        return str.replace(/(^02.{0}|^01.{1}|[0-9]{3})([0-9]+)([0-9]{4})/, "$1-$2-$3");
    },
    /**
     * 소수점 이하 의미없는 0은 지운다. (100.0 -> 100, 100.10 -> 100.1)
     *
     * @param str
     * @returns
     */
    "realnum" : function(str) {
        try {
            str = String(parseFloat(str));
        } catch (e) {
            return str;
        }
        return str == "NaN" ? str.replace("NaN", "") : str;
    },
    /**
     * trim 후 값이 없으면 공백으로 표시한다.
     *
     * @param str
     * @returns
     */
    "trimToEmpty" : function(str) {
        return StringUtils.trimToEmpty(str);
    },
    /**
     * trim 후 값이 없으면 0으로 표시한다.
     *
     * @param str
     * @returns
     */
    "trimToZero" : function(str) {
        return StringUtils.trimToZero(str);
    },
    /**
     * trim 후 값이 없으면 지정한 값으로 표시한다.
     *
     * @param str
     * @returns
     */
    "trimToVal" : function(str) {
        if (this.stringArguments == null || this.stringArguments[0] == null) {
            throw new Error("[FormatUtils.trimToVal]Please Enter default value");
        }
        return StringUtils.trimToVal(str, this.stringArguments[0]);
    },
    /**
     * Date 형식으로 바꾼다. - opts(month : 월 달력표시, day : 일 달력 표시,
     * 6:년-월,8:년-월-일,10:년-월-일 시, 12:년-월-일 시:분, 14:년-월-일 시:분:초, 기본:8)
     *
     * @param str
     * @returns
     */
    "date" : function(str) {
        str = StringUtils.trimToEmpty(str);
        var format = Config.Ymd();
        if (this.stringArguments != null && this.stringArguments[0] != null) {
            if (this.stringArguments[0] == "day" && this.$input != null) {
                var $input = this.$input;
                $input.css("cursor", "pointer");
                var thisInputFocusout = null;

                var numberOfMonths = 1;
                if(typeof this.stringArguments[1] != "undefined" && this.stringArguments[1] != null) {
                    numberOfMonths = Number(this.stringArguments[1]);
                }

                $input.datepicker({
                	yearRange: "-100:+50",
                    showOtherMonths : true,
                    selectOtherMonths : true,
                    showButtonPanel : true,
                    showMonthAfterYear:true,
                    changeMonth : true,
                    changeYear : true,
                    numberOfMonths: numberOfMonths,
                    dateFormat : Config.datepickerServerDateFormat,
                    duration : 0,
                    beforeShow : function(event, ui) {
                    	setTimeout(function() {
                    		ui.dpDiv.css("z-index", LayerUtils.getMaxZIndex());
                    	}, 30);
                        if($input.prop("readonly")) {
                            return false;
                        }
                        if ($(this).data("events") != null && $(this).data("events")["focusout"] != null) {
                            thisInputFocusout = $(this).data("events")["focusout"];
                            try {
                                delete $(this).data("events").focusout;
                            } catch(e) {
                                $(this).data("events").focusout = undefined;
                            }
                        }
                        $(this).unbind("keydown");
                        if(Config.datePickerUnloadKeyEvents) {
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
                            if (StringUtils.trimToNull($this.val()) != null) {
                                $this.val($this.val().replaceAll(Config.dateSeperator, "").substring(0, 8));
                            }
                            $this.trigger("focusout.BindFields.bindDataList");
                            $this.trigger("focusout.format");

                            //for HYIN
                            $this.removeClass("txt_on");
                        }, 120);
                    },
                    onChangeMonthYear : function(year, month, inst) {
                    	setTimeout(function() {
                    		inst.dpDiv.find("a:not('.ui-priority-secondary')").each(function() {
                    			if(Number($(this).text()) == inst.selectedDay) {
                    				$(this).addClass("ui-state-active");
                    			}
                    		});
                    	}, 30);
                    }
                });
                $input.addClass("calendarField");
                format = Config.Ymd();
            } else if (this.stringArguments[0] == "month" && this.$input != null) {
                var thisInputFocusout = null;
                this.$input.monthpicker({
                    beforeShow : function($input) {
                        if($input.prop("readonly")) {
                            return false;
                        }
                        if ($input.data("events") != null && $input.data("events")["focusout"] != null) {
                            thisInputFocusout = $input.data("events")["focusout"];
                            try {
                                delete $input.data("events").focusout;
                            } catch(e) {
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
                format = Config.Ym();
            } else if (this.stringArguments[0] == '6') {
                format = Config.Ym();
            } else if (this.stringArguments[0] == '8') {
                format = Config.Ymd();
            } else if (this.stringArguments[0] == '10') {
                format = Config.YmdH();
            } else if (this.stringArguments[0] == '12') {
                format = Config.YmdHi();
            } else if (this.stringArguments[0] == '14') {
                format = Config.YmdHis();
            } else {
                format = this.stringArguments[0];
            }
        }
        return Number(str) != 0 ? DateUtils.dateFormater(str, format) : "";
    },
    /**
     * 시간 형식으로 바꾼다.
     *
     * @param str
     * @returns
     */
    "time" : function(str) {
    	str = str.replaceAll(":", "");
    	if(StringUtils.trimToEmpty(str) > 6) {
    		str = StringUtils.rpad(str, 6, "0");
    	} else {
    		str = str.substring(0, 6);
    	}
    	if (this.stringArguments != null && this.stringArguments[0] != null && this.stringArguments[0] == '2') {
    		str = str.substring(0, 2);
        } else if (this.stringArguments != null && this.stringArguments[0] != null && this.stringArguments[0] == '4') {
        	str = str.substring(0, 2) + Config.timeSeperator + str.substring(2, 4);
        } else if (this.stringArguments != null && this.stringArguments[0] != null && this.stringArguments[0] == '6') {
        	str = str.substring(0, 2) + Config.timeSeperator + str.substring(2, 4) + Config.timeSeperator + str.substring(4, 6);
        } else {
        	str = str.substring(0, 2) + Config.timeSeperator + str.substring(2, 4);
        }

    	return str;
    },
    /**
     * 문자열을 cutLength 만큼 자르고 replaceStr로 치환한다.
     *
     * @param str
     * @returns
     */
    "limit" : function(str) {
        if (this.stringArguments == null || this.stringArguments[0] == null) {
            throw new Error("[FormatUtils.limit]Please Enter to cut length in the string");
        }
        if(this.$input) {
        	this.$input.attr("title", str);
        }
        var l = 0;
        for ( var i = 0; i < str.length; i++) {
            l += (str.charCodeAt(i) > 128) ? 2 : 1;
            if (l > this.stringArguments[0]) {
                if (this.stringArguments != null && this.stringArguments[1] != null) {
                    return str.substring(0, i) + this.stringArguments[1];
                } else {
                    return str.substring(0, i);
                }
            }
        }
        return str;
    },
    /**
     * targetStr을 replaceStr로 치환한다.
     *
     * @param str
     * @returns
     */
    "replace" : function(str) {
        if (this.stringArguments == null || this.stringArguments[0] == null) {
            throw new Error("[FormatUtils.replace]Please Enter to replaced target string");
        }
        if (this.stringArguments == null || this.stringArguments[1] == null) {
            throw new Error("[FormatUtils.replace]Please Enter to replace string");
        }
        if(this.stringArguments[0] == "comma") {
        	this.stringArguments[0] = ",";
        }
        if(this.stringArguments[1] == "comma") {
        	this.stringArguments[1] = ",";
        }
        var replaceStr = str.split(String(this.stringArguments[0])).join(String(this.stringArguments[1]));
        if (typeof this.stringArguments[2] != "undefined" && String(this.stringArguments[2]) == "true") {
        	this.vo[this.$input.attr("name")] = replaceStr;
        }
        return replaceStr;
    },
    /**
     * length만큼 왼쪽부터 replaceStr문자로 채운다.
     *
     * @param str
     * @returns
     */
    "lpad" : function(str) {
        if (this.stringArguments == null || this.stringArguments[0] == null) {
            throw new Error("[FormatUtils.lpad]Please Enter fill length vlaue");
        }
        if (this.stringArguments == null || this.stringArguments[1] == null) {
            throw new Error("[FormatUtils.lpad]Please Enter to replace character");
        }
        return StringUtils.lpad(str, Number(this.stringArguments[0]), this.stringArguments[1]);
    },
    /**
     * length만큼 오른쪽부터 replaceStr문자로 채운다.
     *
     * @param str
     * @returns
     */
    "rpad" : function(str) {
        if (this.stringArguments == null || this.stringArguments[0] == null) {
            throw new Error("[FormatUtils.rpad]Please Enter fill length vlaue");
        }
        if (this.stringArguments == null || this.stringArguments[1] == null) {
            throw new Error("[FormatUtils.rpad]Please Enter to replace character");
        }
        return StringUtils.rpad(str, Number(this.stringArguments[0]), this.stringArguments[1]);
    },
    /**
     * 문자 사용자 서식 엑셀사용자지정서식 참고 [ 예1) \#,###*.### (# : 숫자, @ : 영문자, * : 와일드카드 문자) ]
     * @param str
     * @returns
     */
    "generic" : function(str) {
        if (this.stringArguments == null || this.stringArguments[0] == null) {
            throw new Error("[FormatUtils.generic]Please Enter user format vlaue");
        }
        var userFormatUtils = new UserFormatUtils(this.stringArguments[0]);
        str = userFormatUtils.setGeneric(str);
        genericMask = null;
        return str;
    },
    /**
     * 숫자 사용자 서식 엑셀사용자지정서식 참고 [ 예) #,##0 (# : 숫자) ] option : floor(Default) :
     * 무조건 버림 (소수점 처리가능) ceil : 무조건 올림 (소수점 처리가능) round : 반올림(소수점 처리가능)]
     *
     * @param str
     * @returns
     */
    "numeric" : function(str) {
        if (this.stringArguments == null || this.stringArguments[0] == null) {
            throw new Error("[FormatUtils.numeric]Please Enter user format vlaue");
        }
        var userFormatUtils = new UserFormatUtils(this.stringArguments[0]);
        str = userFormatUtils.setNumeric(str, this.stringArguments[1]);
        numericMask = null;
        return str;
    }
};

/**
 * @reference Mask JavaScript API(http://www.pengoworks.com/workshop/js/mask/,
 *            dswitzer@pengoworks.com)
 */
var UserFormatUtils = function(m) {
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
        var r = "@~*", rt = new Array(), nv = "", t, x, a = new Array(), j = 0, rx = {
            "@" : "A-Za-z",
            "~" : "0-9",
            "*" : "A-Za-z0-9"
        };

        // strip out invalid characters
        v = v.replace(new RegExp("[^" + rx["*"] + "]", "gi"), "");
        if ((_d == true) && (v.length == this.strippedValue.length)){v = v.substring(0, v.length - 1);}
        this.strippedValue = v;
        var b = new Array();
        for ( var i = 0; i < m.length; i++) {
            // grab the current character
            x = m.charAt(i);
            // check to see if current character is a mask, escape commands are
            // not a mask character
            t = (r.indexOf(x) > -1);
            // if the current character is an escape command, then grab the next
            // character
            if (x == "!"){x = m.charAt(i++);}
            // build a regex to test against
            if ((t && !this.allowPartial) || (t && this.allowPartial && (rt.length < v.length))){rt[rt.length] = "[" + rx[x] + "]";}
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
                    while (v.length > 0 && !(new RegExp(rt[j])).test(v.charAt(j))){v = (v.length == 1) ? "" : v.substring(1);}
                    if (v.length > 0) {
                        nv += v.charAt(j);
                        hasOneValidChar = true;
                    }
                    j++;
                } else {nv += a[i].chr;}
                if (this.allowPartial && (j > v.length)) {
                    break;
                }
            }
        }

        if (this.allowPartial && !hasOneValidChar){nv = "";}
        if (this.allowPartial) {
            if (nv.length < a.length){this.nextValidChar = rx[a[nv.length].chr];} else {this.nextValidChar = null;}
        }

        return nv;
    };

    this.setNumeric = function(_v, _p, _d) {
        var v = String(_v).replace(/[^\d.-]*/gi, ""), m = this.format;
        // make sure there's only one decimal point
        v = v.replace(/\./, "d").replace(/\./g, "").replace(/d/, ".");

        // check to see if an invalid mask operation has been entered
        if (!/^[\$]?((\$?[\+-]?([0~]{1,3},)?[0~]*(\.[0~]*)?)|([\+-]?\([\+-]?([0~]{1,3},)?[0~]*(\.[0~]*)?\)))$/.test(m)) {
            return this.throwError(1, "An invalid numeric user format was specified for the \nNumeric user format constructor.", _v);
        }

        if ((_d == true) && (v.length == this.strippedValue.length)){v = v.substring(0, v.length - 1);}

        if (this.allowPartial && (v.replace(/[^0-9]/, "").length == 0)) {
            return v;
        }
        this.strippedValue = v;

        if (v.length == 0){v = NaN;}
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
        m = m.replace(/[^~0.,]*/gi, "");

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
        im = im.replace(/[^0~]+/gi, "");
        // find the first zero, which indicates the minimum length
        // that the value must be padded w/zeros
        var mv = im.indexOf("0") + 1;
        // if there is a zero found, make sure it's padded
        if (mv > 0) {
            mv = im.length - mv + 1;
            while (vi.length < mv){vi = "0" + vi;}
        }

        // check to see if we need commas in the thousands place holder
        if (/[~0]+,[~0]{3}/.test(m)) {
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

        if (show["$"]){v = this.format.replace(/(^[\$])(.+)/gi, "$") + v;}
        if (show["+"]){v = "+" + v;}
        if (show["-"]){v = "-" + v;}
        if (show["("]){v = "(" + v + ")";}
        return v;
    };

};

var MessageUtils = {
    timeOut : null,
    beforeMsg : null,
    msgDialog : null,
    show : function(msg, vars, element) {
        var options = null;
        if(SystemUtils.realTypeOf(msg) == "object") {
            options = msg;
            msg = msg.msg;
            vars = msg.vars;
            element = msg.element;
            if(options.msg) delete options.msg;
            if(options.vars) delete options.vars;
            if(options.element) delete options.element;
        }

        //msg = this.getServerMessageText(msg);
        if (vars != null) {
            msg = this.msgVarReplacer(msg, vars);
        }
        if (element != null && typeof element == "object") {
            if (($(Config.messageContext + " .objectMessage").length == 0 && MessageUtils.beforeMsg == msg) || MessageUtils.beforeMsg != msg) {
                $(Config.messageContext + " div.objectMessage").remove();
                if (MessageUtils.timeOut != null) {
                    clearTimeout(MessageUtils.timeOut);
                }

                var position = "left";
                if (($(element).offset().left + $(element).outerWidth() + 200) > $(window).width()) {
                    position = "right";
                }

                var notiPopHtml = new StringBuffer();
                notiPopHtml.append('<div class="objectMessage">');
                notiPopHtml.append('<table id="notiPopTable">');
                notiPopHtml.append('<tr>');

                if (position == "left") {
                    notiPopHtml.append('<td rowspan="3" id="notiPopArrowLeft"></td>');
                }

                notiPopHtml.append('<td id="notiPopLeftTopEage"></td>');
                notiPopHtml.append('<td class="notiPopSpace"></td>');
                notiPopHtml.append('<td class="notiPopSpace"></td>');
                notiPopHtml.append('<td id="notiPopRightTopEage"></td>');

                if (position == "right") {
                    notiPopHtml.append('<td rowspan="3" id="notiPopArrowRight"></td>');
                }

                notiPopHtml.append('</tr>');
                notiPopHtml.append('<tr>');
                notiPopHtml.append('<td class="notiPopSpace"></td>');
                notiPopHtml.append('<td id="notiPopText" class="notiPopSpace">' + msg + '</td>');
                notiPopHtml.append('<td class="notiPopSpace" valign="middle"><div id="notiPopClose"></div></td>');
                notiPopHtml.append('<td class="notiPopSpace"></td>');
                notiPopHtml.append('</tr>');
                notiPopHtml.append('<tr>');
                notiPopHtml.append('<td id="notiPopLeftBottomEage"></td>');
                notiPopHtml.append('<td class="notiPopSpace"></td>');
                notiPopHtml.append('<td class="notiPopSpace"></td>');
                notiPopHtml.append('<td id="notiPopRightBottomEage"></td>');
                notiPopHtml.append('</tr>');
                notiPopHtml.append('</table>');
                notiPopHtml.append('</div>');
                $(Config.messageContext).append(notiPopHtml.toString());

                if (position == "right") {
                	var msgBoxWidth = $(Config.messageContext + " div.objectMessage").outerWidth();
                	var leftPos = $(element).offset().left - msgBoxWidth;
                	if(leftPos < 0) {
                		$(Config.messageContext + " div.objectMessage").width((msgBoxWidth + leftPos) - 2);
                	}
                    $(Config.messageContext + " div.objectMessage").offset({
                        left : $(element).offset().left - $(Config.messageContext + " div.objectMessage").outerWidth() - 1,
                        top : $(element).offset().top
                    });
                } else {
                    $(Config.messageContext + " div.objectMessage").offset({
                        left : $(element).offset().left + $(element).outerWidth(),
                        top : $(element).offset().top
                    });
                }
                $(Config.messageContext + " div.objectMessage table#notiPopTable td div#notiPopClose").click(MessageUtils.hide);
                $(Config.messageContext + " div.objectMessage").css("z-index", LayerUtils.getMaxZIndex() + 2);
                $(Config.messageContext + " div.objectMessage").show();

                this.timeOut = setTimeout(MessageUtils.hide, 5000);
                MessageUtils.beforeMsg = msg;
            }
        } else {
            if(jQuery.fn.dialog) {
                MessageUtils.hide();
                var buttonOption = {};
                buttonOption[CvcafI18nComponents.messageUtilsDialogOkButton[Config.locale]] = function() {
                    MessageUtils.hide();
                };
                MessageUtils.msgDialog = $("<div id='messageBox' title='" + CvcafI18nComponents.messageUtilsDialogTitle[Config.locale] + "'><br>" + msg + "</div>").dialog(jQuery.extend({}, {
                    modal : true,
                    buttons : buttonOption
                }, options));
                buttonOption = null;
                MessageUtils.msgDialog.parents("div.ui-dialog").css("z-index", LayerUtils.getMaxZIndex() + 1);
            } else {
                throw new Error(msg);
            }
        }
    },
    hide : function() {
        if ($(Config.messageContext + " div.objectMessage").length > 0) {
            $(Config.messageContext + " div.objectMessage").hide('fast', function() {
                $(this).remove();
                if (MessageUtils.timeOut != null) {
                    clearTimeout(MessageUtils.timeOut);
                }
            });
        } else {
            if (MessageUtils.msgDialog != null) {
                if(jQuery.fn.dialog) {
                    if(MessageUtils.msgDialog != null) {
                        MessageUtils.msgDialog.dialog("close");
                    }
                    if(MessageUtils.msgDialog != null) {
                        MessageUtils.msgDialog.dialog("destroy");
                    }
                    MessageUtils.msgDialog = null;
                }
                $("#messageBox").remove();
            }
        }
    },
    msgVarReplacer : function(msg, vars) {
        for ( var i = 0; i < vars.length; i++) {
            msg = msg.replaceAll("{" + String(i) + "}", vars[i].replaceAll("|", ",").replaceAll("_", " "));
        }
        return msg;
    },
    getServerMessageText : function(key) {
        if ($(window).data("serverMessageResource") == null) {
            return key;
        }
        var $message = $($(window).data("serverMessageResource").getElementsByTagName("properties")).find("entry[key='" + key + "']");
        return $message.length > 0 ? $message.text() : key;
    }
};

var StringUtils = {
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
        while (originalstr.length < length){originalstr = strToPad + originalstr;}
        return originalstr;
    },
    rpad : function(originalstr, length, strToPad) {
        while (originalstr.length < length){originalstr = originalstr + strToPad;}
        return originalstr;
    },
    /**
     * 문자열의 바이트 길이를 반환
     */
    getByteLength : function(str) {
        var byteLength = 0;
        for ( var inx = 0; inx < str.length; inx++) {
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
        return StringUtils.trimToNull(str) == null ? true : false;
    },
    /**
     * null이나 스트링을 트림 하여 스트링으로 반환
     */
    trimToEmpty : function(str) {
        return (str != null && typeof str != "undefined" && StringUtils.trim(str).length > 0) ? StringUtils.trim(str) : "";
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
        return (str != null && typeof str != "undefined" && StringUtils.trim(str).length > 0) ? StringUtils.trim(str) : null;
    },
    /**
     * null이나 스트링을 트림하여 값이 없으면 0을 반환
     */
    trimToZero : function(str) {
        return (str != null && typeof str != "undefined" && StringUtils.trim(str).length > 0) ? StringUtils.trim(str) : "0";
    },
    /**
     * null이나 스트링을 트림하여 값이 없으면 valStr 을 반환
     */
    trimToVal : function(str, valStr) {
        return (str != null && typeof str != "undefined" && StringUtils.trim(str).length > 0) ? StringUtils.trim(str) : valStr;
    }
};

var StringBuffer = function() {
    this.buffer = new Array();

    this.append = function(str) {
        this.buffer[this.buffer.length] = str;
        return this;
    };

    this.insert = function(idx, str) {
        this.buffer.splice(idx, 0, str);
        return this;
    };

    this.replace = function(from, to) {
        for ( var i = this.buffer.length - 1; i >= 0; i--) {
            this.buffer[i] = this.buffer[i].replace(new RegExp(from, "g"), to);
        }
        return this;
    };

    this.toString = function() {
        return this.buffer.join("");
    };
};

var DateUtils = {
    /**
     * 두 날짜의 차수를 리턴한다.
     */
    "dayDiff" : function(str1, str2) {
        if(SystemUtils.realTypeOf(str1) == "string") {
            str1 = this.stringToDateObj(str1).obj;
        }
        if(SystemUtils.realTypeOf(str2) == "string") {
            str2 = this.stringToDateObj(str2).obj;
        }
        return Math.ceil((str2 - str1) / 1000 / 24 / 60 / 60);
    },
    /**
     * 날짜스트링을 Date Object와 기본 데이트포멧이 담긴 dateInfo 오브젝트 반환
     */
    "stringToDateObj" : function(str) {
        str = StringUtils.trimToEmpty(str).replace(/ /gi, "").replace(/-/gi, "").replace(/\//gi, "").replace(/:/gi, "");
        var dateInfo = null;
        if (str.length == 6) {
            dateInfo = {
                obj : new Date(str.substring(0, 4), Number(str.substring(4, 6)), 0, 0, 0, 0),
                format : Config.Ym()
            };
        } else if (str.length == 8) {
            dateInfo = {
                obj : new Date(str.substring(0, 4), Number(str.substring(4, 6)) - 1, str.substring(6, 8), 0, 0, 0),
                format : Config.Ymd()
            };
        } else if (str.length == 10) {
            dateInfo = {
                obj : new Date(str.substring(0, 4), Number(str.substring(4, 6)) - 1, str.substring(6, 8), str.substring(8, 10), 0, 0),
                format : Config.YmdH()
            };
        } else if (str.length == 12) {
            dateInfo = {
                obj : new Date(str.substring(0, 4), Number(str.substring(4, 6)) - 1, str.substring(6, 8), str.substring(8, 10), str.substring(10, 12), 0),
                format : Config.YmdHi()
            };
        } else if (str.length >= 14) {
            dateInfo = {
                obj : new Date(str.substring(0, 4), Number(str.substring(4, 6)) - 1, str.substring(6, 8), str.substring(8, 10), str.substring(10, 12), str.substring(12, 14)),
                format : Config.YmdHis()
            };
        }
        return dateInfo;
    },
    /**
     * 날짜를 형식에 맞게 리턴
     */
    "dateFormater" : function(str, format) {
        var returnStr = null;
        var dateInfo = this.stringToDateObj(str);
        if (dateInfo != null) {
            returnStr = dateInfo.obj.formatDate(format != null ? format : dateInfo.format);
        } else {
            returnStr = str;
        }

        return returnStr;
    },
    /**
     * DATE 형식의 오브젝트를 TIMESTAMP로 변환한다.
     */
    "dateToTimestamp" : function(dateObj) {
        var d = null;
        if (dateObj == null) {
            d = new Date(obj.time);
        }
        return Math.round(d.getTime() / 1000);
    },
    /**
     * TIMESTAMP를 DATE 형식의 오브젝트로 변환한다.
     */
    "timestampToDate" : function(timestamp) {
        var d = new Date(timestamp);
        return d;
    },
    "getDBServerDate" : function(strFormat) {
        var format = "YYYY-MM-DD HH24:MI:SS";
        if (strFormat != null) {
            format = strFormat;
        }
        Controller.setParams(null, {
            "strFormat" : format
        });
        return this.stringToDateObj(JCFUtils.getDataList(Controller.submit("/CodeAct/findSystemDate.do"), "DS_DUMMY")[0].val).obj;
    }
};

var FormUtils = {
    "sendPost" : function(action, params, target) {
        var $form = $('<form method="POST" action="' + action + '"></form>').appendTo("body");
        if(target != null) {
            $form.attr("target", target);
        }
        for (var key in params ) {
            $form.append('<input type="hidden" name="' + key + '" value="' + params[key] + '" />');
        }
        $form.submit();
    },
    /**
     * Reset Form
     * @param {} form, event, styleClass
     */
    "reset" : function(form, applyDataList, event, styleClass) {
        $(form).find(":input").not("input[type='button']").each(function() {
            var type = this.type;
            var tag = this.tagName.toLowerCase();
            if (type == 'checkbox' || type == 'radio') {
                $(this).prop("checked", false);
                if(applyDataList) {
                    $(this).trigger("click.BindFields.bindDataList");
                    $(this).trigger("click.BindFields.bindDataList");
                }
            } else if (tag == 'select') {
                this.selectedIndex = Config.defaultSelectedIndex;
                if(applyDataList) {
                    $(this).trigger("change.BindFields.bindDataList");
                }
            } else {
                $(this).val("");
                if(applyDataList) {
                    $(this).trigger("focusout.BindFields.bindDataList");
                }
            }
            if (event != null) {
                if(event = "*") {
                    $(this).unbind("focusin.BindFields.bindDataList focusout.BindFields.bindDataList change.BindFields.bindDataList click.BindFields.bindDataList");
                } else {
                    $(this).unbind(event);
                }
            }
            if (styleClass != null) {
                if(event = "*") {
                    $(this).removeClass("requiredField noPassedValidateField changedEditableCell");
                } else {
                    $(this).removeClass(styleClass);
                }
            }
        });

        //for HYIN - innoditor
        $(form).find("iframe[name^='editor_']").each(function() {
            if(this.contentWindow && this.contentWindow.fnSetEditorHTMLCode) {
                this.contentWindow.fnSetEditorHTMLCode("", false, 0);
            }
        });
    },
    /**
     *
     * Use jQuery
     *
     * @param {}
     *            triger
     * @param {}
     *            checkbox
     */
    "checkAll" : function(triger, checkbox) {
        if ($(triger).is(':checked')) {
            $(checkbox).each(function() {
                if ($(this).is(':checked')) {
                    $(this).attr('checked', '');
                } else {
                    $(this).attr('checked', 'checked');
                }
            });
        } else {
            $(checkbox).each(function() {
                $(this).attr('checked', '');
            });
        }
    }
};

var BrowserUtils = {
    /**
     * 모달창 열기
     */
    "openModalPopupNoScroll" : function(sUrl, sParam, width, height) {
        try {
            var strReturn;

            var winx = (screen.width - width) / 2;
            var winy = (screen.height - height) / 2;
            var settings = "dialogHeight:    " + height + "px; ";
            settings += "dialogWidth:     " + width + "px; ";
            settings += "dialogTop:       " + winy + "px; ";
            settings += "dialogLeft:      " + winx + "px; ";
            settings += "scroll    :no; ";
            settings += "resizable :no; ";
            settings += "help      :no; ";
            settings += "status    :no; ";
            settings += "unadorned:no";
            strReturn = window.showModalDialog(sUrl, sParam, settings);
            return strReturn;
        } catch (exception) {
            throw new Error("[BrowserUtils.openModalDialogNoScroll]" + exception.description);
        }
    },

    /**
     * 모달창 열기
     */
    "openModalPopup" : function(sUrl, sParam, width, height) {
        try {
            var strReturn;
            var winx = (screen.width - width) / 2;
            var winy = (screen.height - height) / 2;
            var settings = "dialogHeight:    " + height + "px; ";
            settings += "dialogWidth:     " + width + "px; ";
            settings += "dialogTop:       " + winy + "px; ";
            settings += "dialogLeft:      " + winx + "px; ";

            settings += "resizable :no; ";
            settings += "help      :no; ";
            settings += "status    :yes; ";
            settings += "unadorned:no";

            if (scroll == "YES") {
                settings += "scroll    :yes; ";
            } else {
                settings += "scroll    :no; ";
            }
            strReturn = window.showModalDialog(sUrl, sParam, settings);
            return strReturn;
        } catch (exception) {
            throw new Error("[BrowserUtils.openModalDialog]" + exception.description);
        }
    },
    /**
     * 쿠키를 저장한다.
     */
    "setCookie" : function(name, value, expiredays) {
        var expires = -1;
        if(expiredays != null) {
            var today = new Date();
            today.setDate(today.getDate() + expiredays);
            expires = today.toGMTString();
        }
        document.cookie = name + "=" + escape(value) + "; path=/; expires=" + expires + ";";
    },
    /**
     * 쿠키를 가져온다.
     */
    "getCookie" : function(name) {
        var arg = name + "=";
        var alen = arg.length;
        var clen = document.cookie.length;
        var i = 0;
        while (i < clen) {
            var j = i + alen;
            if (document.cookie.substring(i, j) == arg) {
                return this.getCookieVar(j);
            }
            i = document.cookie.indexOf(" ", i) + 1;
            if (i == 0) {
                break;
            }
        }
        return null;
    },
    /**
     * 쿠키명을 가져온다.
     */
    "getCookieVar" : function(offset) {
        var endstr = document.cookie.indexOf(";", offset);
        if (endstr == -1){endstr = document.cookie.length;}
        return unescape(document.cookie.substring(offset, endstr));
    },
    /**
     * 쿠키를 제거한다.
     */
    "removeCookie" : function(name, domain) {
        if(domain) {
            document.cookie = name + "=; path=/; expires=" + (new Date(1)) + "; domain=" + domain;
        } else {
            document.cookie = name + "=; path=/; expires=" + (new Date(1)) + ";";
        }
    },
    "getMsieVersion" : function() {
    	var ua = window.navigator.userAgent;
    	var msie = ua.indexOf("MSIE ");
    	var trident = ua.match(/Trident\/(\d.\d)/i);
    	if(msie < 0) {
    		return 0;
    	} else {
    		if(trident == null) {
    			return parseInt(ua.substring (msie + 5, ua.indexOf (".", msie)));
    		} else {
    			return parseInt(trident[1]) + 4.0;
    		}
    	}
    }
};

var SecurityUtils = {
    checkPassword : function(pass) {
        if (!pass.match(/([a-zA-Z].*[!,@,#,$,%,^,&,*,?,_,~,0-9])|([!,@,#,$,%,^,&,*,?,_,~,0-9].*[a-zA-Z])/)) {
            MessageUtils.show(CvcafI18nComponents.checkPassword1[Config.locale]);
            return false;
        }

        var equalCount = 0;
        var yeonsokPlusCount = 0;
        var yeonsokMinusCount = 0;
        for ( var i = 0; i < pass.length; i++) {
            // 동일문자 카운트
            if (pass.charAt(i) == pass.charAt(i + 1)) {
                equalCount++;
                if (equalCount >= 3) {
                    MessageUtils.show(CvcafI18nComponents.checkPassword2[Config.locale]);
                    return false;
                }
            } else {
                equalCount = 0;
            }
            if (i < pass.length - 1) {
                if (pass.charAt(i).charCodeAt(0) - pass.charAt(i + 1).charCodeAt(0) == 1) {
                    yeonsokPlusCount++;
                    if (yeonsokPlusCount > 2) {
                        MessageUtils.show(CvcafI18nComponents.checkPassword3[Config.locale]);
                        return false;
                    }
                } else {
                    yeonsokPlusCount = 0;
                }

                if (pass.charAt(i).charCodeAt(0) - pass.charAt(i + 1).charCodeAt(0) == -1) {
                    yeonsokMinusCount++;
                    if (yeonsokMinusCount > 2) {
                        MessageUtils.show(CvcafI18nComponents.checkPassword3[Config.locale]);
                        return false;
                    }
                } else {
                    yeonsokMinusCount = 0;
                }
            }
        }
        return true;
    }
};

var LayerUtils = {
    getMaxZIndex : function($context) {
        if ($context == null) {
            $context = $("div, span");
        }
        return Math.max.apply(null, $.map($context, function(e, n) {
            //z-index 최대치 처리
            if($(e).css("z-index") >= parseInt("2147483647")) {
                $(e).css("z-index", String(parseInt("2147483647") - 999));
                $(e).attr("fixed", "[cvcaf]limited_z-index_value(-999)");
            }
            return parseInt($(e).css("z-index")) || 1;
        }));
    },
    getDocumentHeight : function() {
        return Math.max(Math.max(document.body.scrollHeight, document.documentElement.scrollHeight), Math.max(document.body.offsetHeight, document.documentElement.offsetHeight), Math.max(document.body.clientHeight, document.documentElement.clientHeight));
    },
    getBrowserHeight : function() {
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
    pageBlocker : {
        show : function(msg) {
            $("#pageBlockOverlay").remove();
            var browserHeight = LayerUtils.getBrowserHeight();
            jQuery('<div id="pageBlockOverlay" style="z-index : ' + LayerUtils.getMaxZIndex() + ';height :' + browserHeight + 'px; padding-top: ' + (browserHeight/2 - 40) + 'px;" ></div>').appendTo("body");
            jQuery('#pageBlockOverlay').append(msg);
        },
        remove : function() {
            $("#pageBlockOverlay").remove();
        }
    },
    block : function(htmlMsg) {
    	var zIndex = LayerUtils.getMaxZIndex($(Config.pageContext + " div, " + Config.pageContext + " span")) + 1;
        var height = $(window).height();
        var blockOverlayCss = {
            "background-color" : "#828282",
            "left" : $(Config.pageContext).offset().left + "px",
            "top" : $(Config.pageContext).offset().top + "px",
            "cursor" : "not-allowed",
            "opacity" : 0.45,
            "height" : height + "px",
            "width" : $(window).width() + "px",
            "z-index" : zIndex
        };

        var overlay = $('<div id="contentsBlock" class="contentsBlock" onselectstart="return false;" align="center" style="position: fixed;"></div>');
        overlay.css(blockOverlayCss);
        $(Config.pageContext).append(overlay);

        $(window).resize(function() {
        	$("div#contentsBlock", Config.pageContext).css("height", $(window).height());
        });

        Config.getContentsBlockMsgContainer(htmlMsg, zIndex);

        overlay = null;

        zIndex = null;
        blockOverlayCss = null;
        height = null;
    },
    unBlock : function(delay) {
    	if(typeof delay == "undefined") {
    		delay = 300;
    	}
    	if ($(".contentsBlock").length > 0) {
            $(".contentsBlock").css("cursor", "auto");
            $(".contentsBlock").fadeOut(delay, function() {
            	$(this).remove();
            });
        }
    }
};

var AnimateUtils = {
    dataChanged : function(input) {
    	var orgBorderColor = $(input).css("color");
    	$(input).stop().animate({"color": "#efefef"}, "fast").animate({"color": orgBorderColor}, "slow");
    	orgBorderColor = null;
    }
};

var DefaultServiceControllerTemplate = {
	init : function(SC) {
		var scInitDeferred = $.Deferred();
		if(typeof SC.selectSet !== "undefined" && typeof SC.selectSet.dataList !== "undefined") {
			var deferred = $.Deferred();
			SC.selectSet.dataList(deferred);
			deferred.promise().done(function(dataList) {
				ServiceController.selectSet.dataList = dataList;
				DefaultServiceControllerTemplate.initializeComponentSet(SC);
				setTimeout(function() {
					scInitDeferred.resolve();
				}, 1);
			});
		} else {
			this.initializeComponentSet(SC);
			scInitDeferred.resolve();
		}
		return scInitDeferred;
	},
	initializeComponentSet : function(SC) {
		$(Config.pageContext + " [id^='btn_']:visible").each(function() {
            if (this.enable != null){this.enable();}
        });
		var sets = ["selectSet", "bindSet", "gridSet", "popSet"];
		$(sets).each(function(i, componentSet) {
			if(typeof SC[componentSet] !== "undefined") {
				for(var itemKey in SC[componentSet]) {
					if(typeof SC[componentSet][itemKey] !== "undefined") {
						if(typeof SC[componentSet][itemKey]["instance"] !== "undefined") {
							SC[componentSet][itemKey]["instance"] = SC[componentSet][itemKey]["instance"]();
						}
						if(typeof SC[componentSet][itemKey]["events"] !== "undefined") {
							SC[componentSet][itemKey]["events"](SC[componentSet][itemKey]["instance"]);
                        }
					}
                }
			}
		});
	}
};

/**
*  Base64 encode / decode
*  http://www.webtoolkit.info/
**/
var Base64 = {
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
        for ( var n = 0; n < string.length; n++) {
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