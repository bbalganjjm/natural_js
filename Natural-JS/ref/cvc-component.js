/**
 * 본 소프트웨어(CVCAF(Communicator-View-Controller Architecture Framework))를 허가 없이 사용하는 행위는,
 * 소프트웨어 소유자(대우정보시스템(주))에 대한 권리를 침해하는 것이며,
 * 이 행위를 한 자는 소프트웨어 소유자(대우정보시스템(주))로부터 저작권법에 의거 소송을 당할 수 있습니다.
 * 사용권 문서를 받은 자는, 사용권 문서에 명기된 조항에 의거하여 소프트웨어를 사용하는 것이 허가됩니다.
 * 사용권에 대한 침해가 있을 경우, 사용을 제한하거나 소송을 당할 수 있습니다.
 */
;(function($) {
    /**
     * DataSelectComponent jQuery plugin
     *
     * @param {}
     *            options
     * @return Data Binded HTML Input Component
     */
    $.fn.DataSelectComponent = function(options) {
        this.each(function() {
            options.container = this;
            options.nameField = options.nameField != null ? options.nameField : "fullKnm";
            options.valueField = options.valueField != null ? options.valueField : "code";

            var dataSelectComponent = null;

            if ($(this).is("select") && $(this).attr("multiple") != "multiple") {
                ComboBox.prototype = new DataSelectComponent();
                dataSelectComponent = new ComboBox(options);
            } else if ($(this).is("select") && $(this).attr("multiple") == "multiple") {
                ComboListBox.prototype = new DataSelectComponent();
                dataSelectComponent = new ComboListBox(options);
            } else if ($(this).is("input:radio")) {
                RadioBox.prototype = new DataSelectComponent();
                dataSelectComponent = new RadioBox(options);
            } else if ($(this).is("input:checkbox")) {
                CheckListBox.prototype = new DataSelectComponent();
                dataSelectComponent = new CheckListBox(options);
            }
            // add observing to DataComponentObserver
            var dataComponentObserver = DataComponentObserver.getInstance();
            dataComponentObserver.add(dataSelectComponent);

            // auto bind
            if (options.dataList != null)
                dataSelectComponent.bindDataList();

            var options_ = options;
            this.bindDataList = function(options) {
                var opts = jQuery.extend(options_, options_, options);
                dataSelectComponent.bindDataList(opts);
            };
            this.setValue = function(value) {
                if(SystemUtils.realTypeOf(value) == "string") {
                    dataSelectComponent.setValue({
                        "value" : value
                    });
                } else {
                    dataSelectComponent.setValue(value);
                }
            };
            this.getValue = function() {
                return dataSelectComponent.getValue();
            };
            this.getDataSet = function() {
                return dataSelectComponent.getDataSet();
            };
            this.getDataList = function() {
                return dataSelectComponent.getDataList();
            };
            this.getContainer = function() {
                return $(options.container);
            };
        });
        if (this.length == 1) {
            return options.container;
        } else {
            return this;
        }
    };

    /**
     * BindValues jQuery plugin
     *
     * @param {}
     *            options
     * @return DataBindComponent class
     */
    $.fn.BindValues = function(options) {
        if (this.length > 1) {
            throw new Error("[jQuery.BindValues]To use this component, you must select single element");
        }
        var defaultOptions = {
            container : this,
            dataList : null,
            rowIndex : -1
        };

        this.options = $.extend(defaultOptions, defaultOptions, options);
        BindValues.prototype = new DataBindComponent();
        this.dataBindComponent = new BindValues(this.options);

        // add observing to DataComponentObserver
        var dataComponentObserver = DataComponentObserver.getInstance();
        dataComponentObserver.add(this.dataBindComponent);

        return this.dataBindComponent;
    };

    /**
     * BindFields jQuery plugin
     *
     * @param {}
     *            options
     * @return DataBindComponent class
     */
    $.fn.BindFields = function(options) {
        if (this.length > 1) {
            throw new Error("[jQuery.BindFields]To use this component, you must select single element");
        }
        var defaultOptions = {
            container : this,
            dataList : null,
            rowIndex : Config.defaultSelectedIndex
        };

        this.options = $.extend(defaultOptions, defaultOptions, options);
        BindFields.prototype = new DataBindComponent();
        var dataBindComponent = new BindFields(this.options);

        // add observing to DataComponentObserver
        var dataComponentObserver = DataComponentObserver.getInstance();
        dataComponentObserver.add(dataBindComponent);

        return dataBindComponent;
    };

    /**
     * BindData jQuery plugin
     *
     * @param {}
     *            options
     * @return DataBindComponent class
     */
    $.fn.DataBindComponent = function(options) {
        if (this.length > 1) {
            throw new Error("[jQuery.DataBindComponent]To use this component, you must select single element");
        }
        var defaultOptions = {
            container : this,
            dataList : null,
            rowIndex : -1
        };

        this.options = $.extend(defaultOptions, defaultOptions, options);
        BindData.prototype = new DataBindComponent();
        var dataBindComponent = new BindData(this.options);

        // add observing to DataComponentObserver
        var dataComponentObserver = DataComponentObserver.getInstance();
        dataComponentObserver.add(dataBindComponent);

        return dataBindComponent;
    };

    /**
     * DataGridComponent jQuery plugin
     *
     * @param {}
     *            options
     * @return dataGrid class
     */
    $.fn.DataGridComponent = function(options) {
        if (this.length > 1) {
            throw new Error("[jQuery.DataGridComponent]To use this component, you must select single element");
        }
        var defaultOptions = {
            container : this,
            dataList : null
        };

        this.options = $.extend(defaultOptions, defaultOptions, options);
        DataGrid.prototype = new DataGridComponent();
        this.dataGridComponent = new DataGrid(this.options);

        // add observing to DataComponentObserver
        var dataComponentObserver = DataComponentObserver.getInstance();
        dataComponentObserver.add(this.dataGridComponent);

        return this.dataGridComponent;
    };

    $.fn.monthpicker = function( options ) {
        if (this.length > 1) {
            throw new Error("[jQuery.monthpicker]To use this component, you must select single element");
        }

        var defaultOptions = {
            container : null,
            beforeShow : null,
            onOpen : null,
            onClose : null
        };
        var opts = $.extend(defaultOptions, defaultOptions, options);

        var sb = new StringBuffer();
        sb.append("<div id='monthpickerContainer' class='ui-datepicker ui-widget ui-widget-content ui-helper-clearfix ui-corner-all'>");
        sb.append("<div class='ui-datepicker-header ui-widget-header ui-helper-clearfix ui-corner-all'>");
        sb.append("<a class='ui-datepicker-prev ui-corner-all' onmousedown=\"var $year=$(this).parent().find('#year');$year.text(String(Number($year.text()) - 1));$year=null;\">");
        sb.append("<span class='ui-icon ui-icon-circle-triangle-w'></span>");
        sb.append("</a>");
        sb.append("<a class='ui-datepicker-next ui-corner-all' onmousedown=\"var $year=$(this).parent().find('#year');$year.text(String(Number($year.text()) + 1));$year=null;\">");
        sb.append("<span class='ui-icon ui-icon-circle-triangle-e'></span>");
        sb.append("</a>");
        sb.append("<div class='ui-datepicker-title'>");
        sb.append("<span id='year' class='ui-datepicker-year'></span>");
        sb.append("</div>");
        sb.append("</div>");
        sb.append("<div style='height:5px;'></div>");
        sb.append("<table id='monthpicker' class='ui-datepicker-calendar'>");
        sb.append("<tbody>");
        for ( var i = 1; i <= 12; i++) {
            if (i == 1 || i == 5 || i == 9) {
                sb.append("<tr align='center'>");
            }
            if (i < 10) {
                month = "0" + i;
            } else {
                month = i;
            }
            sb.append("<td><a class='ui-state-default' href='#' style='text-align:center;'>" + month + "</a></td>");
            if (i % 4 == 0) {
                sb.append("</tr>");
            }
        }
        sb.append("</tbody>");
        sb.append("</table>");
        sb.append("</div>");

        return function($input) {
            var removeNClose = function() {
                if(opts.onClose != null) {
                    opts.onClose($input, opts.container);
                }
                if(opts.container != null) {
                    opts.container.remove();
                    opts.container = null;
                }
                if ($("div#monthpickerContainer").size() > 0) {
                    $("div#monthpickerContainer").remove();
                    opts.container = null;
                }
            };

            var createNOpenContainer = function() {
                if ($("div#monthpickerContainer").length == 0) {
                    var date = new Date();
                    var year = date.getFullYear();
                    var month = (date.getMonth() + 1);

                    opts.container = $(sb.toString()).appendTo(Config.pageContext);

                    var _top = $input.offset().top + $input.height() + 6;
                    if ($(document.body).height() < $input.offset().top + opts.container.height()) {
                        _top = $input.offset().top - $input.height() - opts.container.height() - 10;
                    }
                    opts.container.css({
                        "position" : "absolute",
                        "top" : _top,
                        "left" : $input.offset().left,
                        "z-index" : LayerUtils.getMaxZIndex() + 1
                    }).fadeIn("fast");
                    _top = null;

                    opts.container.find("#year").text(String(year));

                    opts.container.find("tbody a").hover(function() {
                        $(this).addClass("ui-state-hover");
                    }, function() {
                        $(this).removeClass("ui-state-hover");
                    }).mousedown(function(e) {
                        e.preventDefault();
                        $(this).addClass("ui-state-active");
                    });

                    opts.container.find("tbody a").each(function() {
                        if ($(this).text() == month) {
                            $(this).addClass("ui-state-default ui-state-highlight ui-state-hover");
                        }
                    });

                    if (StringUtils.trimToNull($input.val()) != null) {
                        var inputStr = StringUtils.trimToEmpty($input.val()).replaceAll(Config.dateSeperator, "");
                        var currYear = inputStr.substring(0, 4);
                        var currMonth = inputStr.substring(4, 6);
                        if (StringUtils.trimToNull(currYear) != null) {
                            opts.container.find("#year").text(currYear);
                        }
                        opts.container.find("tbody a").each(function() {
                            if ($(this).text() == currMonth) {
                                $(this).addClass("ui-state-active");
                            }
                        });
                    }

                    opts.container.find("tbody a").click(function(e) {
                        e.preventDefault();
                        $input.val(opts.container.find(".ui-datepicker-year").text() + $(this).text());
                        $input.get(0).blur();
                        removeNClose();
                    });

                    $("div#monthpickerContainer").data("input", $input);
                }
            };


            $input.unbind("focusin.jQuery.monthpicker, click.jQuery.monthpicker");
            $input.bind("focusin.jQuery.monthpicker, click.jQuery.monthpicker", function() {
                if(opts.beforeShow != null) {
                    opts.beforeShow($input);
                }
                createNOpenContainer();
                if(opts.onOpen != null) {
                    opts.onOpen($input, opts.container);
                }
            });

            $(document).unbind("click.jQuery.monthpicker");
            $(document).bind("click.jQuery.monthpicker", function(e) {
                if($("div#monthpickerContainer").size() > 0 && $("div#monthpickerContainer").is(":visible")) {
                    if (!$(e.target).parents("div#monthpickerContainer").is("div#monthpickerContainer") && !$(e.target).is($("div#monthpickerContainer").data("input"))) {
                        removeNClose();
                    }
                }
            });
        }(this);
    };

    /**
     * PopupComponent jQuery plugin
     *
     * @param {}
     *            options
     * @return popupComponent class
     */
    $.fn.PopupComponent = function(options) {
        if (this.length > 1) {
            throw new Error("[jQuery.PopupComponent]To use this component, you must select single element");
        }
        var defaultOptions = {
            container : this,
            context : Config.pageContext,
            contents : this
        };

        this.options = $.extend(defaultOptions, defaultOptions, options);

        Popup.prototype = new PopupComponent();
        this.popupComponent = new Popup(this.options);
        this.popupComponent.init();

        return this.popupComponent;
    };

    /**
     * ButtonComponent jQuery plugin
     *
     * @param {}
     *            options
     * @return Button Object
     */
    $.fn.ButtonComponent = function(options) {
        return this.each(function() {
            this.options = jQuery.extend({}, {
                container : $(this)
            }, options);

            Button.prototype = new ButtonComponent();
            var buttonComponent = new Button(this.options);
            buttonComponent.init();

            this.disable = buttonComponent.disable;
            this.enable = buttonComponent.enable;
            this.remove = buttonComponent.remove;

            return this;
        });
    };

})(jQuery);

/**
 * DataComponentObserver
 *
 * @param [] $scope - Context scope
 */
var DataComponentObserver = function(scope) {
    if (DataComponentObserver.caller != DataComponentObserver.getInstance) {
        throw new Error("[DataComponentObserver.class]There is no public constructor for DataComponentObserver, use getInstance method");
    }

    if ($("#contextDataRepository").length == 0)
        $(Config.pageContext).append("<var id='contextDataRepository'></var>");
    this.context = scope == null ? "#contextDataRepository" : scope;

    if ($(this.context).data("data_component_observer_instance")) {
        return $(this.context).data("data_component_observer_instance");
    }
    $(this.context).data("data_component_observer_instance", this);

    this.obserable = new Array();

    this.add = function(observer) {
        this.obserable[this.obserable.length] = observer;
    };

    this.remove = function(observer) {
        for ( var i = 0; i < this.obserable.length; i++) {
            if (this.obserable[i] == observer && this.obserable[i].options.dataList == observer.options.dataList) {
                this.obserable.splice(i, 1);
            }
        }
    };

    this.notify = function(observer, rowIndex, fieldName, socketInfo) {
        if (observer != null) {
            if (observer.options && observer.options.dataList) {
                for ( var i = 0; i < this.obserable.length; i++) {
                    if (observer != this.obserable[i] && observer.options.dataList == this.obserable[i].options.dataList) {
                        this.obserable[i].update(rowIndex, fieldName);
                    }
                }
            } else {
                for ( var i = 0; i < this.obserable.length; i++) {
                    //observer 가 dataList 일때
                    if (observer == this.obserable[i].options.dataList) {
                        this.obserable[i].update(rowIndex, fieldName);
                    }
                }
            }
        } else {
        	if(Config.cvcSocket == null) {
                for ( var i = 0; i < this.obserable.length; i++) {
            		this.obserable[i].update(rowIndex, fieldName);
                }
        	}
        }

        if(Config.cvcSocket != null) {
        	if(typeof socketInfo == "undefined") {
        		var targetIndexs = new Array();
            	for ( var i = 0; i < this.obserable.length; i++) {
            		if (observer.options.dataList == this.obserable[i].options.dataList) {
            			targetIndexs.push(i);
            		}
            	}
        		Config.cvcSocket.emit("notify", {
        			"locationHref" : location.href,
        			"targetIndexs" : targetIndexs.join(","),
            		"value" : observer.options.dataList[rowIndex][fieldName],
            		"rowIndex" : rowIndex,
            		"fieldName" : fieldName
                });
        	} else {
        		for(var i=0; i<socketInfo.targetIndexs.length; i++) {
        			this.obserable[socketInfo.targetIndexs[i]].options.dataList[rowIndex][fieldName] = socketInfo.value;
        			this.obserable[socketInfo.targetIndexs[i]].update(rowIndex, fieldName);
        		}
        	}
        }
    };

};

DataComponentObserver.getInstance = function(scope) {
    return new DataComponentObserver(scope);
};

/**
 * ButtonComponent Interface class
 *
 * @param {}
 *            options
 */
var ButtonComponent = function(options) {
    /**
     * 컴포넌트 옵션
     */
    this.options = null;
    /**
     * 버튼을 초기화 한다.
     */
    this.init = function() {
        throw new Error("must override init method");
    };
    /**
     * 버튼을 비활성화 한다.
     */
    this.disable = function() {
        throw new Error("must override disable method");
    };
    /**
     * 버튼을 활성화 한다.
     */
    this.enable = function() {
        throw new Error("must override enable method");
    };
    /**
     * 버튼을 완전 제거한다.
     */
    this.remove = function() {
        throw new Error("must override remove method");
    };
};

var Button = function(options) {
    var defaultOptions = {
        container : null,
        width : 38,
        color : "white", // white, blue, skyblue, gray
        size : "small", // smaller, small, medium, large
        disable : false
    };

    this.options = SystemUtils.mergeOptions(defaultOptions, options);

    this.init = function() {
        var opts = jQuery.extend(this.options, this.options, SystemUtils.getClassOpts(this.options.container));

        if (opts.container.is("a") || opts.container.is("button") || opts.container.is("input[type='button']")) {
            if (!opts.container.parent().is("span.btn_common_wrap")) {
                var tagName = "";
                if(opts.container.is("a")) {
                    tagName = "a_";
                } else if(opts.container.is("button")) {
                    tagName = "button_";
                } else if(opts.container.is("input[type='button']")) {
                    tagName = "input_";
                }
                opts.container.wrap('<span class="' + tagName + ' btn_common_wrap btn_' + opts.color + '_wrap btn_' + opts.size + '_wrap"></span>');

                opts.container.addClass("btn_common btn_" + opts.color + " btn_" + opts.size);

                var backgroundImageUrl = $(this.options.container).css("background-image");
                var stratIndex = backgroundImageUrl.indexOf("js/");
                if(stratIndex < 0) {
                	stratIndex = backgroundImageUrl.indexOf("images/");
                }
                backgroundImageUrl = backgroundImageUrl.substring(stratIndex, backgroundImageUrl.lastIndexOf("."));

                opts.container.mouseover(function() {
                    if (!this.options.container.hasClass("disabled")) {
            		if (!($.browser.msie && BrowserUtils.getMsieVersion() < 9 && !$(this).is("a")) && !StringUtils.isEmpty(backgroundImageUrl)) {
            		    $(this).css("background-image", "url('" + Config.CONTEXT_ROOT + backgroundImageUrl + "_over.gif')");
                            $(this).parent("span.btn_common_wrap").css("background-image", "url('" + Config.CONTEXT_ROOT + backgroundImageUrl + "_over.gif')");
                    	} else {
                    	    $(this).css("opacity", "0.9");
                    	}
                    }
                });
                opts.container.mousedown(function() {
                    if (!this.options.container.hasClass("disabled")) {
                    	if (!($.browser.msie && BrowserUtils.getMsieVersion() < 9 && !$(this).is("a"))) {
                    		if ($.browser.msie && BrowserUtils.getMsieVersion() < 9 && !$(this).is("a")) {
                                $(this).parent("span.btn_common_wrap").css("background-image", "none");
                            }
                    	}
                        $(this).css("opacity", "0.7");
                        $(this).parent("span.btn_common_wrap").css("opacity", "0.85");
                    }
                });
                opts.container.mouseup(function() {
                    if (!this.options.container.hasClass("disabled")) {
                    	if (!($.browser.msie && BrowserUtils.getMsieVersion() < 9 && !$(this).is("a")) && !StringUtils.isEmpty(backgroundImageUrl)) {
                    	    if ($.browser.msie && BrowserUtils.getMsieVersion() < 9 && !$(this).is("a")) {
                                $(this).parent("span.btn_common_wrap").css("background-image", "url('" + Config.CONTEXT_ROOT + backgroundImageUrl + ".gif')");
                            }
                    	}
                        $(this).css("opacity", "1");
                        $(this).parent("span.btn_common_wrap").css("opacity", "1");
                    }
                });
                opts.container.mouseout(function() {
                    if (!this.options.container.hasClass("disabled")) {
                    	if (!($.browser.msie && BrowserUtils.getMsieVersion() < 9 && !$(this).is("a")) && !StringUtils.isEmpty(backgroundImageUrl)) {
                    	    $(this).css("background-image", "url('" + Config.CONTEXT_ROOT + backgroundImageUrl + ".gif')");
                            $(this).parent("span.btn_common_wrap").css("background-image", "url('" + Config.CONTEXT_ROOT + backgroundImageUrl + ".gif')");
                            if ($.browser.msie && BrowserUtils.getMsieVersion() < 9 && !$(this).is("a")) {
                                $(this).parent("span.btn_common_wrap").css("background-image", "url('" + Config.CONTEXT_ROOT + backgroundImageUrl + ".gif')");
                            }
                    	}
                        $(this).css("opacity", "1");
                        $(this).parent("span.btn_common_wrap").css("opacity", "1");
                    }
                });
                if (opts.width > 38) {
                    opts.container.width(opts.width);
                }
            }
        }
    };

    this.disable = function() {
        this.options.container.css("opacity", "0.6");
        this.options.container.parent().css("opacity", "0.6");
        if (this.options.container.is("a")) {
            this.options.container.bindFirst("click", SystemUtils.disableLink);
        } else {
            this.options.container.prop("disabled", true);
        }
        this.options.container.addClass("disabled");
    };

    this.enable = function() {
        this.options.container.css("opacity", "1");
        this.options.container.parent().css("opacity", "1");
        if (this.options.container.is("a")) {
            this.options.container.unbind("click", SystemUtils.disableLink);
        } else {
            this.options.container.prop("disabled", false);
        }
        this.options.container.removeClass("disabled");
    };

    this.remove = function() {
        this.options.container.parent().remove();
    };
};

/**
 * PopupComponent Interface class
 *
 * @param {}
 *            options
 */
var PopupComponent = function(options) {
    /**
     * 컴포넌트 옵션
     */
    this.options = null;
    /**
     * 컨테이너 요소를 반환 한다.
     */
    this.getContainer = function(selector) {
        throw new Error("must override getContainer method");
    };
    /**
     * 팝업을 초기화 한다.
     */
    this.init = function() {
        throw new Error("must override init method");
    };
    /**
     * 팝업을 띄운다.
     */
    this.open = function(options) {
        throw new Error("must override open method");
    };
    /**
     * 팝업을 닫는다. data : onClose 콜백 핸들러 메소드에 전달될 값
     */
    this.close = function(data) {
        throw new Error("must override close method");
    };
    /**
     * 팝업을 완전 제거한다.
     */
    this.remove = function() {
        throw new Error("must override remove method");
    };
};

var Popup = function(options) {
    var defaultOptions = {
        context : null,
        container : null,
        headerSize : "medium", // medium, large
        contents : null,
        url : null,
        onOpen : null,
        onClose : null, //확인버튼(데이터 넘길때)
        onCloseX : null, //팝업헤더의 X 버튼 클릭했을때
        left : null,
        top : null,
        width : 400,
        height : null,
        scrollbars : "auto",
        position : "fixed", // absolute
        modal : true,
        draggable : true,
        selectable : true,
        paginable : false,
        dataBindComponent : null,
        browserPopup : false,
        browserPopupContainer : Config.popupComponentConfig.browserPopupContainer,
        preLoad : false,
        preInit : false,
        modalOverlayCss : {
            "background-color" : "#777777",
            "position" : "fixed",
            "left" : "0px",
            "top" : "0px",
            "cursor" : "wait",
            "opacity" : 0.6,
            "height" : "100%",
            "width" : "100%"
        },
        overlay : null,
        isOpened : false
    };

    this.options = SystemUtils.mergeOptions(defaultOptions, options);

    var $currPopupElement = null;
    var _this = this;

    var pageLoaded = false;

    this.getContainer = function(selector) {
        return selector !== undefined ? this.options.container.find(selector) : this.options.container;
    };

    this.init = function( callBack ) {
        var opts = jQuery.extend(this.options, this.options, SystemUtils.getClassOpts(this.options.container));
        if(opts.browserPopup != true && opts.scrollbars != "auto") {
            opts.scrollbars = opts.scrollbars == "1" || opts.scrollbars == "yes" ? "scroll" : "hidden";
        }
        if (!opts.browserPopup) {
            var wrappingContents = function() {
                var popTmpl = new StringBuffer();

                var containerClass;
                var strong_;
                var _strong;
                var serviceName;
                if (opts.headerSize == "large") {
                    containerClass = "largeHeader";
                    strong_ = "<strong>";
                    _strong = "</strong>";
                    if(Config.popupComponentConfig.serviceName != null) {
                        serviceName = "<span>" + Config.popupComponentConfig.serviceName + "</span>";
                    } else {
                        serviceName = "";
                    }
                } else {
                    containerClass = "mediumHeader";
                    strong_ = "";
                    _strong = "";
                    serviceName = "";
                }

                var onselectstart = "";
                if(!opts.selectable) {
                    onselectstart = 'onselectstart="return false;"';
                }

                popTmpl.append('<div ' + onselectstart +' class="popupComponent ' + containerClass + '">');
                if ($(opts.contents).attr("title") != null) {
                    popTmpl.append('<h1>' + strong_ + $(opts.contents).attr("title") + _strong + serviceName + '</h1>');
                } else {
                    popTmpl.append('<h1>' + strong_ + CvcafI18nComponents.defaultPopUpMessage[Config.locale] + _strong + serviceName + '</h1>');
                }

                popTmpl.append('<div id="popupContents" class="section"></div>');

                if (opts.paginable) {
                    if (opts.dataBindComponent == null) {
                        popTmpl = null;
                        throw new Error("[Popup.init]To use popup paging. you must assign a DataBindComponent");
                    }
                    popTmpl.append('<div class="common_pop_paging">');
                    popTmpl.append('<a id="firstPage" href="#"><img src="' + Config.popupComponentConfig.pagingButtonSet.firstPage + '" alt="처음" /></a>');
                    popTmpl.append('<a id="prevPage" href="#"><img src="' + Config.popupComponentConfig.pagingButtonSet.prevPage + '" alt="이전" /></a>');
                    popTmpl.append('<p><strong id="pageNo">0</strong> / <span id="totalPage">0</span></p>');
                    popTmpl.append('<a id="nextPage" href="#"><img src="' + Config.popupComponentConfig.pagingButtonSet.nextPage + '" alt="다음" /></a>');
                    popTmpl.append('<a id="lastPage" href="#"><img src="' + Config.popupComponentConfig.pagingButtonSet.lastPage + '" alt="끝" /></a>');
                    popTmpl.append('</div>');
                }

                popTmpl.append('<p class="btn_close"><a href="#"><img src="' + Config.popupComponentConfig.closeButtonImage + '" alt="닫기" /></a></p>');
                popTmpl.append('</div>');

                opts.container = $(popTmpl.toString());

                if (opts.height != null) {
                    opts.container.find("#popupContents").css({
                        "height" : opts.height + "px",
                        "overflow-y" : opts.scrollbars
                    });
                }
                $(opts.contents).show();
                opts.container.find("#popupContents").html($(opts.contents).removeAttr("title"));
                $(opts.context).append(opts.container);

                // run popup ServiceController init method
                var events = $(Config.pageContext + " #contextDataRepository").data("events");
                if (events != null && events.popInit != null && events.popInit.length > 0) {
                    $currPopupElement = $(opts.context).find("div.popupComponent");
                    $currPopupElement = $($currPopupElement.get($currPopupElement.length - 1));
                    $currPopupElement.unbind("popInit");
                    $currPopupElement.bind("popInit", function() { });
                    $currPopupElement.data("events").popInit.push(events.popInit.pop());
                    $currPopupElement.data("childServiceControllerId", $(Config.pageContext + " #contextDataRepository").data("childServiceControllerId"));
                    if (opts.preInit) {
                        SystemUtils.popInit($currPopupElement);
                    }
                }

                opts.container.find("p.btn_close a").click(function(e) {
                    e.preventDefault();
                    if(opts.onCloseX != null) {
                        opts.onCloseX();
                    }
                    _this.close();
                });

                opts.container.bind("popClose", function(event, data) { _this.close(data); });
                opts.container.bind("popRemove", function() { _this.remove(); });

                if (opts.paginable) {
                    if (opts.dataBindComponent != null) {
                        var dataBindComponent = opts.dataBindComponent;
                        opts.container.find(".common_pop_paging #firstPage").click(function(e) {
                            e.preventDefault();
                            if (dataBindComponent.options.dataList.length > 0) {
                                if ($(".noPassedValidateField").length == 0) {
                                    dataBindComponent.bindDataList({
                                        rowIndex : 0
                                    });
                                    $(this).parent().find("#pageNo").text("1");

                                    $(".objectMessage").remove();
                                    $(".noPassedValidateField").removeClass("noPassedValidateField");
                                }
                            }
                        });

                        opts.container.find(".common_pop_paging #prevPage").click(function(e) {
                            e.preventDefault();
                            if (dataBindComponent.options.rowIndex - 1 > -1) {
                                if ($(".noPassedValidateField").length == 0) {
                                    dataBindComponent.bindDataList({
                                        rowIndex : dataBindComponent.options.rowIndex - 1
                                    });
                                    $(this).parent().find("#pageNo").text(String(dataBindComponent.options.rowIndex + 1));

                                    $(".objectMessage").remove();
                                    $(".noPassedValidateField").removeClass("noPassedValidateField");
                                }
                            }
                        });

                        opts.container.find(".common_pop_paging #nextPage").click(function(e) {
                            e.preventDefault();
                            if (dataBindComponent.options.rowIndex + 1 < dataBindComponent.options.dataList.length) {
                                if ($(".noPassedValidateField").length == 0) {
                                    dataBindComponent.bindDataList({
                                        rowIndex : dataBindComponent.options.rowIndex + 1
                                    });
                                    $(this).parent().find("#pageNo").text(String(dataBindComponent.options.rowIndex + 1));

                                    $(".objectMessage").remove();
                                    $(".noPassedValidateField").removeClass("noPassedValidateField");
                                }
                            }
                        });

                        opts.container.find(".common_pop_paging #lastPage").click(function(e) {
                            e.preventDefault();
                            if ($(".noPassedValidateField").length == 0) {
                                dataBindComponent.bindDataList({
                                    rowIndex : dataBindComponent.options.dataList.length - 1
                                });
                                $(this).parent().find("#pageNo").text(String(dataBindComponent.options.dataList.length));

                                $(".objectMessage").remove();
                                $(".noPassedValidateField").removeClass("noPassedValidateField");
                            }
                        });
                    }
                }
            };

            if (opts.url != null) {
                if(this.options.preLoad) {
                    Controller.contentType = "application/x-www-form-urlencoded";
                    Controller.method = "GET";
                    Controller.dataType = "html";
                    Controller.submit(opts.url, function(page) {
                        opts.contents = page;
                        wrappingContents();
                        pageLoaded = true;
                        if(callBack) {
                            callBack();
                        }
                    });
                }
            } else {
                if (opts.contents == null) {
                    throw new Error("[Popup.init]Popup contents is null. you must assign a popup contents");
                }
                wrappingContents();
                pageLoaded = true;
                if(callBack) {
                    callBack();
                }
            }
        }

        return this;
    };

    var beforeContentsHeight = "";

    this.open = function(options) {
        var opts = jQuery.extend(_this.options, _this.options, options);

        var open = function() {
            if (opts.paginable) {
                if (opts.dataBindComponent == null) {
                    throw new Error("[Popup.open]To use popup paging. you must assign a DataBindComponent");
                }
                opts.container.find("div.common_pop_paging p #pageNo").text(String(opts.dataBindComponent.options.rowIndex + 1));
                opts.container.find("div.common_pop_paging p #totalPage").text(opts.dataBindComponent.options.dataList.length);
            }

            if (!opts.browserPopup) {
                if (opts.modal) {
                    if (opts.overlay != null) {
                        opts.overlay.remove();
                        opts.overlay = null;
                    }
                    opts.overlay = $('<div id="popupBlock" onselectstart="return false;"></div>');
                    opts.overlay.css(opts.modalOverlayCss);
                    opts.overlay.css("z-index", $(Config.BlockContext + " #popupBlock").length > 0 ? Number($(Config.BlockContext + " #popupBlock").css("z-index")) + 1 : LayerUtils.getMaxZIndex() + 1);
                    $(Config.BlockContext).append(opts.overlay);
                } else {
                    if (opts.overlay != null) {
                        opts.overlay.remove();
                        opts.overlay = null;
                    }
                }

                if (opts.draggable) {
                    if (opts.container.attr("class") != null && opts.container.attr("class").indexOf("ui-draggable") > -1) {
                        opts.container.draggable("enable");
                    } else {
                        opts.container.draggable({
                            cursor : "pointer",
                            opacity : 0.8,
                            handle : "h1",
                            containment : "window",
                            appendTo : opts.context,
                            stop: function( event, ui ) {
                                if(Number(opts.container.css("top").replace("px", "")) < 0) {
                                    opts.container.animate({
                                        top : "0px"
                                    });
                                }
                            }
                        });
                    }
                } else {
                    if (opts.container.attr("class") != null && opts.container.attr("class").indexOf("ui-draggable") > -1) {
                        opts.container.draggable("disable");
                    }
                }

                opts.container.width(opts.width);
                opts.container.css({
                    "position" : "fixed",
                    "z-index" : opts.modal ? Number(opts.overlay.css("z-index")) + 1 : Math.max(LayerUtils.getMaxZIndex($(opts.context + " div.popupComponent")), LayerUtils.getMaxZIndex()) + 1
                });

                opts.container.fadeIn(150);
                if (!opts.isOpened && !opts.preInit) {
                    if ($currPopupElement != null && opts.url != null) {
                		SystemUtils.popInit($currPopupElement);
                    }
                }

                if (opts.height == null) {
                    opts.container.find("#popupContents").css("height", "auto");
                    var popupContentsHeight = opts.container.find("#popupContents").outerHeight();
                    var containerHeight = opts.container.height();
                    if(containerHeight > $(window).height() - 10) {
                        opts.container.find("#popupContents").css({
                            "height" : $(window).height() - (containerHeight - popupContentsHeight) - 10 + "px",
                            "overflow-y" : opts.scrollbars
                        });
                    }
                }

                if(opts.left == null) opts.left = ($(window).width() / 2) - (opts.container.width() / 2);
                if(opts.top == null) opts.top = ($(window).height() / 2) - (opts.container.height() / 2) < 0 ? 0 : ($(window).height() / 2) - (opts.container.height() / 2);
                opts.container.css({
                    "background-color" : "#FFFFFF",
                    "left" : opts.left + "px",
                    "top" : opts.top + "px"
                });

                if(opts.position != "fixed") {
                    opts.container.css({
                        "top" : opts.container.offset().top + "px",
                        "position" : opts.position
                    });
                }
                if(!opts.isOpened) {
                    beforeContentsHeight = opts.container.find("#popupContents").css("height");
                }

                if ($.browser.msie) {
                    $("object, embed").not("div.popupComponent object, div.popupComponent embed").hide();
                }
                opts.isOpened = true;
            } else {
                if (opts.modal) {
                    throw new Error("[Popup.open]To use browserPopup. you must assign modal option to false");
                }
                if (opts.url == null) {
                    throw new Error("[Popup.open]To use browserPopup. you must assign url option");
                }

                if(opts.left == null) opts.left = ($(window).width() / 2) - (opts.width / 2);
                if(opts.top == null) opts.top = ($(window).height() / 2) - ((opts.height + 64) / 2) < 0 ? 0 : ($(window).height() / 2) - ((opts.height + 64) / 2);
                opts.window = window.open(Config.CONTEXT_ROOT + opts.browserPopupContainer + encodeURIComponent(opts.url) + "&scrollbars=" + opts.scrollbars, null, "scrollbars=" + opts.scrollbars + ", width=" + opts.width + ", height=" + (opts.height + 64) + ", left=" + opts.left + ", top=" + opts.top);
                window.currPopup = _this;
            }

            if (opts.onOpen != null && SystemUtils.realTypeOf(opts.onOpen) == "string") {
                if (opts.browserPopup) {
                    window.currPopupOptions = opts;
                } else {
                    var serviceController = null;
                    if(typeof ChildServiceControllers != "undefined" && ChildServiceControllers != null) {
                        serviceController = ChildServiceControllers[$currPopupElement.data("childServiceControllerId")];
                    } else {
                        if(typeof ServiceController != "undefined" && ServiceController != null) {
                            serviceController = ServiceController;
                        }
                    }
                    if(serviceController != null && serviceController[opts.onOpen] != null) {
                        serviceController[opts.onOpen](opts.onOpenData);
                    }
                }
            }

            // for HYIN
            if (typeof ContextInitializer != 'undefined') {
                if (typeof ContextInitializer.dynamicElementInit != 'undefined') {
                    ContextInitializer.dynamicElementInit();
                }
            }
        };

        if(!this.options.preLoad && !pageLoaded && !opts.browserPopup) {
            this.options.preLoad = true;
            this.init(function() {
                open();
            });
        } else {
            open();
        }

        var KEYCODE_ESC = 27;
        $(document).unbind("keyup.Popup.open");
        $(document).bind("keyup.Popup.open", function(e) {
            if (e.keyCode == KEYCODE_ESC) {
            	if(opts.onCloseX != null) {
                    opts.onCloseX();
                }
                _this.close();
            }
        });

        $(window).unbind("resize.Popup.open");
        $(window).bind("resize.Popup.open", function(e) {
            var popupContentsHeight = opts.container.find("#popupContents").outerHeight();
            var containerHeight = opts.container.height();
            if(Number(StringUtils.trimToEmpty(opts.container.css("top")).replace("px", "")) + containerHeight > $(window).height() - 10) {
                if(Number(opts.container.css("top").replace("px", "")) > 10) {
                    opts.container.css("top", ($(window).height() - containerHeight - 10) + "px");
                    if(Number(opts.container.css("top").replace("px", "")) < 0) {
                        opts.container.css("top", "10px");
                    }
                } else {
                    opts.container.find("#popupContents").css({
                        "height" : ($(window).height() - (containerHeight - popupContentsHeight) - 10) + "px"
                    });
                }
            }
            popupContentsHeight = null;
            containerHeight = null;
        });

        return this;
    };

    this.close = function(data) {
    	if ($.browser.msie) {
            $("object, embed").not("div.popupComponent object, div.popupComponent embed").show();
        }

        if (data != null && data.onCloseData != null) {
            data = data.onCloseData;
        }
        if (data != null && this.options.onClose == null) {
            throw new Error("[Popup.close]To return popup data, you must assign \"onClose\" callback function");
        }

        if (this.options.onClose != null && data != null) {
            this.options.onClose(data);
        }

        if (!this.options.browserPopup) {
            if (this.options.modal) {
                this.options.container.hide();
                this.options.overlay.remove();
            } else {
                this.options.container.hide();
            }
        } else {
            this.options.window.close();
            this.options.window = undefined;
        }

        $(".objectMessage").remove();
        $(".noPassedValidateField").removeClass("noPassedValidateField");

        $(document).unbind("keyup.Popup.init");
        $(window).unbind("resize.Popup.open");
        this.options.container.find("#popupContents").css("height", beforeContentsHeight);

        return this;
    };

    this.remove = function() {
        if ($(".noPassedValidateField").length == 0) {
            this.options.container.remove();
            if (this.options.modal) {
                this.options.overlay.remove();
            }
            this.options.container.remove();

            $(".objectMessage").remove();
            $(".noPassedValidateField").removeClass("noPassedValidateField");
        }
    };
};

/**
 * DataBindComponent Interface class
 *
 * @param {}
 *            options
 */
var DataBindComponent = function(options) {
    /**
     * 컴포넌트 옵션
     */
    this.options = null;
    /**
     * 컨테이너 요소를 반환 한다.
     */
    this.getContainer = function(selector) {
        throw new Error("must override getContainer method");
    };
    /**
     * 지정한 컨텍스트안의 요소에 JSON데이터를 바인딩 한다.
     */
    this.bindDataList = function(options) {
        throw new Error("must override bindDataList method");
    };
    /**
     * 새로운 Row DataSet을 생성한다.
     * @returns rowIndex
     */
    this.addRow = function(options) {
        throw new Error("must override addRow method");
    };
    /**
     * 데이터리스트를 추가, 수정하기 전으로 복원한다 되돌린다.
     * @returns rowIndex
     */
    this.revertRow = function() {
        throw new Error("must override revertRow method");
    };
    /**
     * 해당로우의 데이터를 초기화 한다.
     * @returns rowIndex
     */
    this.resetRow = function(options) {
        throw new Error("must override resetRow method");
    };
    /**
     * 데이터 검증을 실행한다.
     *
     * @returns Boolean - validate 성공 유무
     */
    this.validate = function(options) {
        throw new Error("must override validate method");
    };
    /**
     * 지정한 인풋필드에 바인드된 데이터를 가져온다.
     */
    this.getValue = function(fieldName) {
        throw new Error("must override getValue method");
    };
    /**
     * 지정된 값을 해당 인풋필드에 바인드 하고 데이터리스트(dataList)를 수정한다.
     */
    this.setValue = function(fieldName, value) {
        throw new Error("must override setValue method");
    };
    /**
     * 컨텍스트안의 데이터가 담긴 JSON Object를 가져온다.
     */
    this.getDataSet = function(options) {
        throw new Error("must override getDataSet method");
    };
    /**
     * 컨텍스트안의 데이터가 담긴 JSON Array를 가져온다.
     */
    this.getDataList = function() {
        throw new Error("must override getDataList method");
    };
    /**
     * 데이터바인드컴포넌트를 적용하기전 컨텍스트로 복원한다.
     */
    this.unbind = function() {
        throw new Error("must override unbind method");
    };
    /**
     * 컴포넌트의 내용을 최신의 데이터로 변경한다.
     */
    this.update = function(rowIndex, fieldName) {
        throw new Error("must override update method");
    };
};

/**
 * This class is BindValues that implement DataBindComponent
 *
 * @param {}
 *            options
 */
var BindValues = function(options) {
    var defaultOptions = {
        container : null,
        dataList : null,
        rowIndex : -1,
        escapeHTML : true
    };

    this.options = SystemUtils.mergeOptions(defaultOptions, options);

    this.getContainer = function(selector) {
        return selector !== undefined ? this.options.container.find(selector) : this.options.container;
    };

    /**
     * JSON오브젝트의 필드명과 HTML Element중 id 속성이 일치하는 요소에 값을 자동으로 대입 해 준다.
     */
    this.bindDataList = function(options) {
        var opts = SystemUtils.mergeOptions(this.options, options);
        if (opts.dataList == null) {
            throw new Error("[BindValues.bindDataList]dataList is null. you must input dataList(JSONArray type)");
        }
        if (opts.dataList[opts.rowIndex] != null) {
            var $cell = null;
            var vo = opts.dataList[opts.rowIndex];
            for (var key in vo) {
                $cell = $(opts.container).find("#" + key);
                if (!$cell.is(":input") && $cell.children().filter(":input").length == 0) {
                    if ($cell.length > 0) {
                        if (SystemUtils.realTypeOf(vo[key]) == "array") {
                            if(opts.escapeHTML) {
                                $cell.text(Formater.format($cell, SystemUtils.arrayToString(vo[key], ",")));
                            } else {
                                $cell.html(Formater.format($cell, SystemUtils.arrayToString(vo[key], ",")));
                            }
                        } else {
                            if (!$cell.is("img")) {
                                if(opts.escapeHTML) {
                                    $cell.text(Formater.format($cell, vo[key] != null ? vo[key] : ""));
                                } else {
                                    $cell.html(Formater.format($cell, vo[key] != null ? vo[key] : ""));
                                }
                            } else {
                                $cell.attr("src", vo[key]);
                            }
                        }
                        $cell.removeClass("changedEditableCell");
                    }
                }
            }
            $cell = null;
        }
        return opts.rowIndex;
    };

    this.getDataSet = function(options) {
        var opts = SystemUtils.mergeOptions(this.options, options);
        var returnArray = new Array();
        returnArray.push(opts.dataList[opts.rowIndex]);
        return opts.rowIndex > -1 ? returnArray : null;
    };

    this.getDataList = function() {
        return this.options.dataList;
    };

    this.getValue = function(fieldName) {
        return this.options.rowIndex > -1 ? this.options.dataList[this.options.rowIndex][fieldName] : null;
    };

    this.setValue = function(fieldName, value, escapeHTML, options) {
        jQuery.extend(this.options, this.options, options);
        if (this.options.rowIndex > -1) {
            var $cell = this.options.container.find("#" + fieldName);
            if(!$cell.is(":input")) {
            	if(this.options.escapeHTML) {
                    $cell.text(Formater.format($cell, value));
                } else {
                    $cell.html(Formater.format($cell, value));
                }
                if(this.options.dataList[this.options.rowIndex][fieldName] != value) {
                    this.options.dataList[this.options.rowIndex][fieldName] = value;
                    if(StringUtils.trimToEmpty(this.options.dataList[this.options.rowIndex].rowStatus) != "insert") {
                        this.options.dataList[this.options.rowIndex].rowStatus = "update";
                    }
                }
                DataComponentObserver.getInstance().notify(this, this.options.rowIndex, fieldName);
                $cell = null;
            }
        }
    };

    this.resetRow = function(options) {
        var opts = SystemUtils.mergeOptions(this.options, options);
        if (opts.dataList == null) {
            throw new Error("[BindValues.resetRow]dataList is null. you must input dataList(JSONArray type)");
        }

        for (var id in opts.dataList[opts.rowIndex]) {
            opts.container.find("#" + id).empty();
            opts.dataList[opts.rowIndex][id] = null;
            DataComponentObserver.getInstance().notify(opts.dataList, opts.rowIndex, id);
        }

        return opts.rowIndex;
    };

    this.update = function(rowIndex, fieldName) {
        if (rowIndex != null && fieldName != null && this.options.dataList != null && this.options.dataList.length > 0) {
            var $cell = $(this.options.container).find("#" + fieldName);
            if (!$cell.is(":input") && $cell.children().filter(":input").length == 0) {
                if (SystemUtils.realTypeOf(this.options.dataList[rowIndex][fieldName]) == "array") {
                    var tempArray = new Array();
                    $(this.options.dataList[rowIndex][fieldName]).each(function() {
                        tempArray.push(Formater.format($cell, String(this)));
                    });
                    if(this.options.escapeHTML) {
                        $cell.text(tempArray.toString());
                    } else {
                        $cell.html(tempArray.toString());
                    }
                    tempArray = null;
                } else {
                    if(this.options.escapeHTML) {
                        $cell.text(Formater.format($cell, this.options.dataList[rowIndex][fieldName]));
                    } else {
                        $cell.html(Formater.format($cell, this.options.dataList[rowIndex][fieldName]));
                    }
                }
                $cell.addClass("changedEditableCell");
                AnimateUtils.dataChanged($cell);
            }
        } else {
            this.bindDataList({
                rowIndex : rowIndex
            });
        }
    };
};

/**
 * This class is BindFields that implement DataBindComponent
 *
 * @param {}
 *            options
 */
var BindFields = function(options) {
    var defaultOptions = {
        container : null,
        dataList : null,
        rowIndex : -1,
        singleRow : false,
        validatable : true,
        posAddNewLine : typeof Config.dataBindComponentConfig.globalPosAddNewLine != "undefined" ? Config.dataBindComponentConfig.globalPosAddNewLine : "top"
    };

    this.addedRow = false;
    var beforeDataSet = false;

    this.options = SystemUtils.mergeOptions(defaultOptions, options);

    this.getContainer = function(selector) {
        return selector !== undefined ? this.options.container.find(selector) : this.options.container;
    };

    /**
     * JSON오브젝트의 필드명과 HTML 컴포넌트중 name속성이 일치하는 요소에 값을 자동으로 대입 해 준다.
     */
    this.bindDataList = function(options) {
        var opts;
        if(options.dataGrid) {
            //그리드에서 바인드할 경우 - 속도때문
            this.options.rowIndex = options.rowIndex;
            this.options.container = options.container;
        	this.options.dataList = options.dataList;
        	opts = this.options;
        	opts.dataGrid = options.dataGrid;
        } else {
            opts = SystemUtils.mergeOptions(this.options, options);
        }

        if (opts.dataList == null) {
            throw new Error("[BindFields.bindDataList]dataList is null. you must input dataList(JSONArray type)");
        }
        if (opts.dataList[opts.rowIndex] != null) {
            var $fieldArray = $(opts.container).find(":input");
            var vo = opts.dataList[opts.rowIndex];
            var $field = "";
            var fieldName = "";
            var this_ = this;

            $fieldArray.each(function() {
                if(StringUtils.trimToNull($(this).attr("name")) != null) {
                    $field = $(this);
                    fieldName = $field.attr('name');
                    $field.removeClass("changedEditableCell");
                    if (StringUtils.trimToEmpty($field.attr("class")).indexOf("required") > -1) {
                        $field.addClass("requiredField");
                    }
                    if ($field.attr('type') == 'text' || $field.attr('type') == 'hidden' || $field.attr('type') == 'password' || $field.is('textarea')) {
                        $field.val(Formater.format($field, StringUtils.trimToEmpty(vo[fieldName] != null ? vo[fieldName] : ""), vo));

                        $field.unbind("focusin.BindFields.bindDataList");
                        $field.bind("focusin.BindFields.bindDataList", function() {
                            if (!$(this).prop("readonly")) {
                                $(this).val(Formater.unformat(vo, $(this).attr("name")));
                            }
                        });

                        $field.unbind("focusout.BindFields.bindDataList");
                        $field.bind("focusout.BindFields.bindDataList", function(e) {
                            if (!$(this).prop("disabled")) {
                                if (!$(this).prop("readonly")) {
                                    var $thisField = $(this);
                                    if ($(".noPassedValidateField").length > 0) {
                                        if ($(opts.container).parent("tbody").length > 0) {
                                            $thisField = $(opts.container).parent("tbody").find(".noPassedValidateField");
                                        } else {
                                            $thisField = $(opts.container).find(".noPassedValidateField");
                                        }
                                    }
                                    var validate = true;
                                    if (opts.validatable) {
                                        validate = Validator.validate($thisField);
                                    }
                                    if (validate) {
                                        if (vo[$thisField.attr("name")] != $thisField.val()) {
                                            vo[$thisField.attr("name")] = $thisField.val();
                                            if (vo.rowStatus != "insert") {
                                                vo.rowStatus = "update";
                                            }
                                            $thisField.addClass("changedEditableCell");

                                            $(opts.dataList).map(function(i) {
                                            	if(this == vo) {
                                            		opts.rowIndex = i;
                                            		return false;
                                            	}
                                            });
                                            DataComponentObserver.getInstance().notify(opts.dataGrid ? opts.dataGrid : this_, opts.rowIndex, $thisField.attr("name"));
                                        }
                                        $thisField.removeClass("noPassedValidateField");
                                    } else {
                                        if ($thisField.css("display") != 'none') {
                                            setTimeout(function() {
                                            	// XP - IE8 에서 입력요소가 disable 되어 있거나 display: none 되어 있을때 focus 함수 호출하면 에러나는것 처리
                                            	try {
                                            		$thisField.trigger("focusin.BindFields.bindDataList").select();
                                            	} catch(e) {}
                                            }, 50);
                                        }
                                        if ($(".noPassedValidateField").length == 0) {
                                            $thisField.addClass("noPassedValidateField");
                                        }
                                        return false;
                                    }
                                    $thisField.val(Formater.format($thisField, vo[$thisField.attr("name")], vo));
                                }
                            }
                        });

                        var eventName = "keydown.BindFields.bindDataList";
                        if ($.browser.mozilla) {
                        	eventName = "keypress.BindFields.bindDataList";
                        }
                        $field.bind(eventName, function(e) {
                            if (e.which == 13) {
                            	e.preventDefault();
                            	$(this).trigger("focusout.BindFields.bindDataList");
                            }
                        });
                    } else if ($field.attr('type') == 'file') {
                        $field.val((vo != null && vo[fieldName] != null) ? vo[fieldName] : "");
                        if (opts.validatable) {
                            $field.unbind("change.BindFields.bindDataList");
                            $field.bind("change.BindFields.bindDataList", function() {
                                if (!Validator.validate($(this))) {
                                    $(this).val("");
                                    if ($.browser.msie) {
                                    	// XP - IE8 에서 입력요소가 disable 되어 있거나 display: none 되어 있을때 focus 함수 호출하면 에러나는것 처리
                                    	try {
                                    		$(this).select();
                                    		document.selection.clear();
                                    	} catch(e) {}
                                    }
                                    return;
                                }
                            });
                        }
                    } else if ($field.attr('type') == 'radio') {
                        if (vo != null && StringUtils.trimToNull(vo[fieldName]) != null) {
                            if (vo[fieldName] == $field.val()) {
                                $field.attr("checked", "checked");
                            }
                        } else {
                            $field.removeAttr("checked");
                        }

                        $field.unbind("click.BindFields.bindDataList");
                        $field.bind("click.BindFields.bindDataList", function() {
                            var $checkedRadios = $(this).parent().find("input[type='radio'][name='" + $(this).attr('name') + "']");
                            $checkedRadios.removeAttr("checked");
                            $(this).attr("checked", "checked");
                            if (StringUtils.trimToNull(vo[$(this).attr("name")]) != $(this).val()) {
                                vo[$(this).attr("name")] = $(this).val();
                                if (vo.rowStatus != "insert") {
                                    vo.rowStatus = "update";
                                }
                                $checkedRadios.addClass("changedEditableCell");

                                $(opts.dataList).map(function(i) {
                                	if(this == vo) {
                                		opts.rowIndex = i;
                                		return false;
                                	}
                                });

                                DataComponentObserver.getInstance().notify(opts.dataGrid ? opts.dataGrid : this_, opts.rowIndex, $(this).attr("name"));
                            }
                        });

                    } else if ($field.attr('type') == 'checkbox') {
                        $checkBoxs = $(opts.container).find("input[type='checkbox'][name='" + $field.attr('name') + "']");
                        if (vo != null && StringUtils.trimToNull(vo[fieldName]) != null && $checkBoxs.length > 0) {
                            if ($checkBoxs.length == 1) {
                                if (String(vo[fieldName]) == "1" || String(vo[fieldName]) == "on" || String(vo[fieldName]).toUpperCase() == "Y") {
                                    $field.attr("checked", "checked");
                                } else {
                                    $field.removeAttr("checked");
                                }
                            } else {
                                if (SystemUtils.realTypeOf(vo[fieldName]) == "array") {
                                    $(opts.container).find("input[type='checkbox'][name='" + $field.attr('name') + "']").val(vo[fieldName]);
                                } else {
                                    var rValues = String(vo[fieldName]).split(",");
                                    if (rValues.length > 1) {
                                        $(opts.container).find("input[type='checkbox'][name='" + $field.attr('name') + "']").val(rValues);
                                    } else {
                                        if (String(vo[fieldName]) == $field.val()) {
                                            $field.attr("checked", "checked");
                                        } else {
                                            $field.removeAttr("checked");
                                        }
                                    }
                                }
                            }
                        }

                        $field.unbind("click.BindFields.bindDataList");
                        $field.bind("click.BindFields.bindDataList", function(e) {
                            $checkBoxs = $(this).parent().find("input[type='checkbox'][name='" + $(this).attr('name') + "']");
                            var rFieldName = $(this).attr("name");
                            var rValue = null;
                            if ($checkBoxs.length == 1) {
                                rValue = SystemUtils.getSingleCheckboxValue($(this), vo[rFieldName]);
                            } else {
                                rValue = SystemUtils.getMultiCheckBoxValues($checkBoxs);
                            }
                            if (vo[rFieldName] != rValue) {
                                vo[rFieldName] = rValue;
                                if (vo.rowStatus != "insert") {
                                    vo.rowStatus = "update";
                                }
                                $(this).addClass("changedEditableCell");

                                $(opts.dataList).map(function(i) {
                                	if(this == vo) {
                                		opts.rowIndex = i;
                                		return false;
                                	}
                                });

                                DataComponentObserver.getInstance().notify(opts.dataGrid ? opts.dataGrid : this_, opts.rowIndex, rFieldName);
                            }
                            rFieldName = null;
                            $checkBoxs = null;
                        });
                    } else if ($field.is("select")) {
                        if (vo != null && StringUtils.trimToNull(vo[fieldName]) != null) {
                            $field.val(vo[fieldName]);
                        } else {
                            $field.get(0).selectedIndex = Config.defaultSelectedIndex;
                        }

                        $field.unbind("change.BindFields.bindDataList");
                        $field.bind("change.BindFields.bindDataList", function() {
                            if (StringUtils.trimToNull(vo[$(this).attr("name")]) != StringUtils.trimToNull($(this).val())) {
                                vo[$(this).attr("name")] = $(this).val();
                                if (vo.rowStatus != "insert") {
                                    vo.rowStatus = "update";
                                }
                                $(this).addClass("changedEditableCell");

                                $(opts.dataList).map(function(i) {
                                	if(this == vo) {
                                		opts.rowIndex = i;
                                		return false;
                                	}
                                });

                                DataComponentObserver.getInstance().notify(opts.dataGrid ? opts.dataGrid : this_, opts.rowIndex, $(this).attr("name"));
                            }
                        });
                    }
                }
            });

            //for HYIN - innoditor
            innoditorDataBindDeferreds = [];
            var $innoditors = $(opts.container).find("iframe[name^='editor_']");
            var excflag = 0;
            $innoditors.each(function(i) {
                innoditorDataBindDeferreds.push($.Deferred());
                fieldName = StringUtils.trimToEmpty($(this).attr("name")).replace("editor_", "");
                if(vo[fieldName]) {
                    if(typeof this.contentWindow.fnSetEditorHTMLCode != "undefined") {
                        this.contentWindow.fnSetEditorHTMLCode(vo[fieldName], false, 0);
                    } else {
                        SystemUtils.onLoadIframe($(this), function() {
                            innoditorDataBindDeferreds[($("iframe[name^='editor_']").index(this))].resolve();
                            excflag = i;
                        });
                    }
                }
            });

            //최후의 보루
            if(excflag == 0 && innoditorDataBindDeferreds.length > 0) {
            	$innoditors.each(function(i) {
            		var this_ = this;
            		var time0 = 0;
            		var time1 = 0;
            		var time2 = 0;
            		var time3 = 0;
            		var time4 = 0;
            		setTimeout(function() {
            			var deferIndex = ($("iframe[name^='editor_']").index(this_));
						if(innoditorDataBindDeferreds[deferIndex]) {
							innoditorDataBindDeferreds[deferIndex].resolve();
							clearTimeout(time0);
							clearTimeout(time1);
							clearTimeout(time2);
							clearTimeout(time3);
							clearTimeout(time4);
						}
                    }, 1000);
            		time0 = setTimeout(function() {
            			if(excflag == 0) {
            				var deferIndex = ($("iframe[name^='editor_']").index(this_));
							if(innoditorDataBindDeferreds[deferIndex]) {
								innoditorDataBindDeferreds[deferIndex].resolve();
								clearTimeout(time1);
								clearTimeout(time2);
								clearTimeout(time3);
								clearTimeout(time4);
							}
            			}
                    }, 2000);
            		time1 = setTimeout(function() {
            			if(excflag == 0) {
            				var deferIndex = ($("iframe[name^='editor_']").index(this_));
							if(innoditorDataBindDeferreds[deferIndex]) {
								innoditorDataBindDeferreds[deferIndex].resolve();
								clearTimeout(time2);
								clearTimeout(time3);
								clearTimeout(time4);
							}
            			}
                    }, 3000);
            		time2 = setTimeout(function() {
            			if(excflag == 0) {
            				var deferIndex = ($("iframe[name^='editor_']").index(this_));
							if(innoditorDataBindDeferreds[deferIndex]) {
								innoditorDataBindDeferreds[deferIndex].resolve();
								clearTimeout(time3);
								clearTimeout(time4);
							}
            			}
                    }, 4000);
            		time3 = setTimeout(function() {
            			if(excflag == 0) {
            				var deferIndex = ($("iframe[name^='editor_']").index(this_));
							if(innoditorDataBindDeferreds[deferIndex]) {
								innoditorDataBindDeferreds[deferIndex].resolve();
								clearTimeout(time4);
							}
            			}
                    }, 5000);
            		time4 = setTimeout(function() {
            			if(excflag == 0) {
            				var deferIndex = ($("iframe[name^='editor_']").index(this_));
							if(innoditorDataBindDeferreds[deferIndex]) {
								innoditorDataBindDeferreds[deferIndex].resolve();
							}
            			}
                    }, 6000);
            	});
            }

            $.when.apply($, innoditorDataBindDeferreds).done(function(){
                $innoditors.each(function() {
                    innoditorDataBindDeferreds.push($.Deferred());
                    fieldName = StringUtils.trimToEmpty($(this).attr("name")).replace("editor_", "");
                    if(vo[fieldName]) {
                        this.contentWindow.fnSetEditorHTMLCode(vo[fieldName], false, 0);
                    }
                });
                innoditorDataBindDeferreds = [];
            });

            $fieldArray = null;
            $field = null;
            fieldName = null;
            textContainerOpts = null;

            beforeDataSet = jQuery.extend({}, opts.dataList[opts.rowIndex]);
        }
        return opts.rowIndex;
    };

    this.addRow = function(options) {
        var opts = SystemUtils.mergeOptions(this.options, options);
        if (opts.dataList == null) {
            throw new Error("[BindFields.addRow]dataList is null. you must input dataList(JSONArray type)");
        }
        FormUtils.reset(opts.container, false);
        var obj = $(opts.container).extractToJSON();
        if (obj == null) {
            obj = {};
        }
        obj.rowStatus = "insert";

        //for HYIN - innoditor
        $("iframe[name^='editor_']").each(function() {
            obj[$(this).attr("name").replace("editor_", "")] = null;
        });

        if (opts.singleRow == true) {
            if (this.addedRow == false) {
                opts.dataList.push(obj);
                this.addedRow = true;
                this.options.rowIndex = opts.dataList.length - 1;
            }
        } else {
        	if(opts.posAddNewLine == "bottom") {
        		opts.dataList.push(obj);
        		this.options.rowIndex = opts.dataList.length - 1;
        	} else {
        		opts.dataList.splice(0, 0, obj);
        		this.options.rowIndex = 0;
        	}
        }

        DataComponentObserver.getInstance().notify(opts.dataList, this.options.rowIndex);

        return opts.rowIndex;
    };

    this.revertRow = function() {
        if (this.options.dataList == null) {
            throw new Error("[BindFields.revertRow]dataList is null. you must input dataList(JSONArray type)");
        }
        if (this.options.rowIndex == -1) {
            throw new Error("[BindFields.revertRow]rowIndex is -1, Execute bindDataList before revertRow");
        }
        if (!ArrayUtils.isEmpty(this.options.dataList) && this.options.dataList[this.options.rowIndex] != null && this.options.dataList[this.options.rowIndex].rowStatus != null) {
            if (this.options.dataList[this.options.rowIndex].rowStatus == "update") {
                this.options.dataList[this.options.rowIndex] = beforeDataSet;
                beforeDataSet = null;
            } else {
                this.options.dataList.splice(this.options.rowIndex, 1);
            }
            DataComponentObserver.getInstance().notify(this.options.dataList, this.options.rowIndex);
        }

        return this.options.rowIndex;
    };

    this.resetRow = function(options) {
        var opts = SystemUtils.mergeOptions(this.options, options);
        if (opts.dataList == null) {
            throw new Error("[BindFields.resetRow]dataList is null. you must input dataList(JSONArray type)");
        }

        for (var name in opts.dataList[opts.rowIndex]) {
            //for HYIN - innoditor
            opts.container.find("iframe[name$='" + name + "']").each(function() {
                this.contentWindow.fnSetEditorHTMLCode("", false, 0);
                if(opts.dataList[opts.rowIndex][name]) opts.dataList[opts.rowIndex][name] = null;
            });

            if(opts.container.find("[name='" + name + "']").size() > 0) {
                opts.container.find("[name='" + name + "']").empty();
                if(opts.dataList[opts.rowIndex][name]) opts.dataList[opts.rowIndex][name] = null;
            }

            DataComponentObserver.getInstance().notify(opts.dataList, opts.rowIndex, name);
        }

        return opts.rowIndex;
    };

    this.validate = function(options) {
        if ($(".noPassedValidateField").length > 0) {
            return false;
        }
        var opts = SystemUtils.mergeOptions(this.options, options);
        var pass = true;
        var validateResult = true;
        var vo = opts.dataList[opts.rowIndex];

        $(opts.container).find(":input").each(function() {
            if (!$(this).prop("disabled")) {
                var beforeValue = $(this).val();
                if ($(this).attr('type') == 'hidden' || $(this).attr('type') == 'text' || $(this).is('textarea')) {
                    $(this).val(Formater.unformat(vo, $(this).attr("name")));
                }
                validateResult = Validator.validate($(this));
                if ($(this).attr('type') == 'hidden' || $(this).attr('type') == 'text' || $(this).is('textarea')) {
                    $(this).val(beforeValue);
                }
                if (!validateResult) {
                    if ($(this).attr('type') == 'file') {
                        $(this).val("");
                        if ($.browser.msie) {
                            if ($(this).css("display") != 'none') {
                            	// XP - IE8 에서 입력요소가 disable 되어 있거나 display: none 되어 있을때 focus 함수 호출하면 에러나는것 처리
                            	try {
                            		$(this).select();
                            		document.selection.clear();
                            	} catch(e) {}
                            }
                        }
                    }
                    if ($(this).css("display") != 'none') {
                    	// XP - IE8 에서 입력요소가 disable 되어 있거나 display: none 되어 있을때 focus 함수 호출하면 에러나는것 처리
                    	try {
                    		$(this).focus().select();
                    	} catch(e) {}
                    }
                    pass = false;
                    return false;
                }
            }
        });
        return pass;
    };

    this.getDataSet = function(options) {
        var opts = SystemUtils.mergeOptions(this.options, options);
        var returnArray = new Array();
        returnArray.push(opts.dataList[opts.rowIndex]);
        return opts.rowIndex > -1 ? returnArray : null;
    };

    this.getDataList = function() {
        return this.options.dataList;
    };

    this.getValue = function(fieldName) {
        return this.options.rowIndex > -1 ? this.options.dataList[this.options.rowIndex][fieldName] : null;
    };

    this.setValue = function(fieldName, value) {
        if (this.options.rowIndex > -1) {
            var $input = this.options.container.find(":input[name='" + fieldName + "']");
            if($input.size() > 0) {
                var readOnlyFlag = false;
                if($input.prop("readonly")) {
                    $input.removeAttr("readonly");
                    readOnlyFlag = true;
                }
                if($input.is("input[type='radio']")) {
                    $input.filter("[value='" + value + "']").attr("checked", "checked");
                    this.options.dataList[this.options.rowIndex][fieldName] = value;
                } else if($input.is("input[type='checkbox']")) {
                    $input.removeAttr("checked");
                    if(SystemUtils.realTypeOf(value) == "array") {
                        $input.val(value);
                    } else if(SystemUtils.realTypeOf(value) == "string") {
                    	if(value == Config.checkedValue) {
                    		$input.attr("checked", "checked");
                    	} else if(value == Config.unCheckedValue) {
                    		$input.removeAttr("checked");
                    	}
                    }
                    this.options.dataList[this.options.rowIndex][fieldName] = value;
                } else if($input.is("select")) {
                    $input.val(value);
                    this.options.dataList[this.options.rowIndex][fieldName] = value;
                } else {
                    $input.val(value);
                    $input.trigger("focusout.BindFields.bindDataList");
                }
                if(readOnlyFlag) {
                    $input.attr("readonly", "readonly");
                }
            }
            if(this.options.dataList[this.options.rowIndex][fieldName] != value) {
                this.options.dataList[this.options.rowIndex][fieldName] = value;
                if(StringUtils.trimToEmpty(this.options.dataList[this.options.rowIndex].rowStatus) != "insert" && fieldName != "rowStatus") {
                    this.options.dataList[this.options.rowIndex].rowStatus = "update";
                }
            }
            DataComponentObserver.getInstance().notify(this, this.options.rowIndex, fieldName);
            $input = null;
        }
    };

    this.unbind = function() {
        FormUtils.reset(this.options.container, true, "*", "*");
        this.options.rowIndex = -1;
    };

    this.update = function(rowIndex, fieldName) {
        if (rowIndex != null && fieldName != null && this.options.dataList != null && this.options.dataList.length > 0) {
            var $input = this.options.container.find(":input[name='" + fieldName + "']");
            if($input.is("input[type='radio']")) {
                $input.filter("[value='" + this.options.dataList[rowIndex][fieldName] + "']").attr("checked", "checked");
            } else if($input.is("input[type='checkbox']")) {
            	if($.browser.msie && BrowserUtils.getMsieVersion() < 9) {
            		if($input.filter("[value='" + this.options.dataList[rowIndex][fieldName] + "']").length > 0) {
            			$input.removeAttr("checked");
            		}
            	}
                if(SystemUtils.realTypeOf(this.options.dataList[rowIndex][fieldName]) == "array") {
                    $input.val(this.options.dataList[rowIndex][fieldName]);
                } else if(SystemUtils.realTypeOf(this.options.dataList[rowIndex][fieldName]) == "string") {
                    $input.filter("[value='" + this.options.dataList[rowIndex][fieldName] + "']").attr("checked", "checked");
                }
            } else if($input.is("select")) {
                $input.val(this.options.dataList[rowIndex][fieldName]);
            } else {
                if (SystemUtils.realTypeOf(this.options.dataList[rowIndex][fieldName]) == "array") {
                    $input.val(this.options.dataList[rowIndex][fieldName]);
                } else {
                    $input.val(Formater.format($input, this.options.dataList[rowIndex][fieldName]));
                }
            }
            $input.addClass("changedEditableCell");
            AnimateUtils.dataChanged($input);
        } else {
            this.bindDataList({
                rowIndex : rowIndex
            });
        }
    };

};

/**
 * This class is BindData that implement DataBindComponent
 *
 * @param {}
 *            options
 */
var BindData = function(options) {
    var defaultOptions = {
        container : null,
        dataList : null,
        rowIndex : -1,
        singleRow : false,
        validatable : true
    };

    this.addedRow = false;

    this.options = SystemUtils.mergeOptions(defaultOptions, options);

    this.getContainer = function(selector) {
        return selector !== undefined ? this.options.container.find(selector) : this.options.container;
    };

    var bindValues = new BindValues(this.options);
    var bindFields = new BindFields(this.options);

    this.bindDataList = function(options) {
        var opts = SystemUtils.mergeOptions(this.options, options);
        bindValues.bindDataList(opts);
        return bindFields.bindDataList(opts);
    };

    this.addRow = function(options) {
        var opts = SystemUtils.mergeOptions(this.options, options);
        this.options.rowIndex = bindFields.addRow(opts);
        return this.options.rowIndex;
    };

    this.revertRow = function() {
        return bindFields.revertRow();
    };

    this.resetRow = function(options) {
        var opts = SystemUtils.mergeOptions(this.options, options);
        bindValues.resetRow(opts);
        return bindFields.resetRow(opts);
    };

    this.validate = function(options) {
        var opts = SystemUtils.mergeOptions(this.options, options);
        return bindFields.validate(opts);
    };

    this.getDataSet = function(options) {
        var opts = SystemUtils.mergeOptions(this.options, options);
        return bindFields.getDataSet(opts);
    };

    this.getDataList = function() {
        return bindFields.getDataList();
    };

    this.getValue = function(fieldName) {
        return bindValues.getValue(fieldName);
    };

    this.setValue = function(fieldName, value) {
        if (this.options.container.find("[name='" + fieldName + "']").is(":input")) {
        	return bindFields.setValue(fieldName, value);
        } else {
        	return bindValues.setValue(fieldName, value);
        }
    };

    this.unbind = function() {
        bindFields.unbind();
    };

    this.update = function(rowIndex, fieldName) {
		bindFields.update(rowIndex, fieldName);
		bindValues.update(rowIndex, fieldName);
    };

};

/**
 * DataSelectComponent Interface class
 *
 * @param {}
 *            options
 */
var DataSelectComponent = function(options) {
    /**
     * 컴포넌트 옵션
     */
    this.options = null;
    /**
     * 컨테이너 요소를 반환 한다.
     */
    this.getContainer = function(selector) {
        throw new Error("must override getContainer method");
    };
    /**
     * 지정한 컴포넌트에 JSON 데이터를 바인딩한다.
     */
    this.bindDataList = function(options) {
        throw new Error("must override bindDataList method");
    };
    /**
     * 지정한 컴포넌트의 값을 지정(선택)한다.
     */
    this.setValue = function(options) {
        throw new Error("must override setValue method");
    };
    /**
     * 컴포넌트의 선택된 값을 가져온다.
     */
    this.getValue = function(options) {
        throw new Error("must override getValue method");
    };
    /**
     * 컴포넌트의 선택된 값에 해당하는 JSON Object를 가져온다.
     */
    this.getDataSet = function(options) {
        throw new Error("must override getDataSet method");
    };

    /**
     * 컴포넌트에 바인드 되어 있는 dataList를 가져온다.
     */
    this.getDataList = function(options) {
        throw new Error("must override getDataList method");
    };

    /**
     * 컴포넌트의 내용을 최신의 데이터로 변경한다.
     */
    this.update = function(rowIndex, fieldName) {
        throw new Error("must override update method");
    };
};

/**
 * This class is ComboBox that implement DataSelectComponent
 *
 * @param {}
 *            options
 */
var ComboBox = function(options) {

    var defaultOptions = {
        container : null,
        dataList : null,
        value : null,
        nameField : null,
        valueField : null
    };

    this.options = SystemUtils.mergeOptions(defaultOptions, options);

    this.getContainer = function(selector) {
        return selector !== undefined ? this.options.container.find(selector) : this.options.container;
    };

    this.getDataList = function() {
        return this.options.dataList;
    };

    this.bindDataList = function(options) {
        var opts = SystemUtils.mergeOptions(this.options, options);
        var innerHtml = "";
        var selected;

        if (opts.dataList != null) {
            $.each(opts.dataList, function(i, list) {
                if (opts.value != null && opts.value.indexOf(list[opts.valueField]) > -1) {
                    selected = "selected='selected'";
                } else {
                    selected = "";
                }
                innerHtml += ("<option value='" + StringUtils.trimToEmpty(list[opts.valueField]) + "' " + selected + ">" + StringUtils.trimToEmpty(list[opts.nameField]) + "</option>");
            });
        }
        $(opts.container).html(innerHtml);
    };
    this.setValue = function(options) {
        var opts = SystemUtils.mergeOptions(this.options, options);
        $(opts.container).val(opts.value);
    };
    this.getValue = function(options) {
        var opts = SystemUtils.mergeOptions(this.options, options);
        return SystemUtils.getMultyValues($(opts.container));
    };
    this.getDataSet = function(options) {
        var opts = SystemUtils.mergeOptions(this.options, options);
        return opts.dataList[opts.container.selectedIndex];
    };
    this.update = function(rowIndex, fieldName) {
        this.bindDataList();
    };
};

/**
 * This class is ComboListBox that implement DataSelectComponent
 *
 * @param {}
 *            options
 */
var ComboListBox = function(options) {

    var defaultOptions = {
        container : null,
        dataList : null,
        value : null,
        nameField : null,
        valueField : null
    };

    this.options = SystemUtils.mergeOptions(defaultOptions, options);

    this.getContainer = function(selector) {
        return selector !== undefined ? this.options.container.find(selector) : this.options.container;
    };

    this.getDataList = function() {
        return this.options.dataList;
    };

    this.bindDataList = function(options) {
        var opts = SystemUtils.mergeOptions(this.options, options);
        var innerHtml = "";
        var selected;
        if (opts.dataList != null) {
            $.each(opts.dataList, function(i, list) {
                if (opts.value != null && String(opts.value).indexOf(list[opts.valueField]) > -1) {
                    selected = "selected='selected'";
                } else {
                    selected = "";
                }
                innerHtml += ("<option value='" + StringUtils.trimToEmpty(list[opts.valueField]) + "' " + selected + ">" + StringUtils.trimToEmpty(list[opts.nameField]) + "</option>");
            });
        }
        $(opts.container).html(innerHtml);
    };
    this.setValue = function(options) {
        var opts = SystemUtils.mergeOptions(this.options, options);
        $(opts.container).val(opts.value);
    };
    this.getValue = function(options) {
        var opts = SystemUtils.mergeOptions(this.options, options);
        return SystemUtils.getMultyValues($(opts.container));
    };
    this.getDataSet = function(options) {
        var opts = SystemUtils.mergeOptions(this.options, options);
        var returnDataList = new Array();
        $(opts.container).find("option:selected").each(function(i) {
            returnDataList[i] = opts.dataList[this.index];
        });
        return returnDataList;
    };
    this.update = function(rowIndex, fieldName) {
        this.bindDataList();
    };
};

/**
 * This class is RadioBox that implement DataSelectComponent
 *
 * @param {}
 *            options
 */
var RadioBox = function(options) {

    var defaultOptions = {
        container : null,
        dataList : null,
        value : null,
        nameField : null,
        valueField : null,
        clickOnLabel : true,
        direction : "horizontal"
    };

    this.options = SystemUtils.mergeOptions(defaultOptions, options);

    this.getContainer = function(selector) {
        return selector !== undefined ? this.options.container.find(selector) : this.options.container;
    };

    this.getDataList = function() {
        return this.options.dataList;
    };

    this.bindDataList = function(options) {
        var opts = SystemUtils.mergeOptions(this.options, options);
        var innerHtml = "";
        var selected;
        var removeTargetClass;
        var containerName = $(opts.container).attr("name");
        if (opts.dataList != null) {
            $.each(opts.dataList, function(i, list) {
                if (opts.value != null && opts.value.indexOf(list[opts.valueField]) > -1) {
                    selected = "checked='checked'";
                } else {
                    selected = "";
                }
                if (i > 0) {
                    removeTargetClass = containerName;
                } else {
                    removeTargetClass = "";
                }
                if (opts.direction == "vertical") {
                    br = "<br class='" + containerName + "'/>";
                } else {
                    br = "";
                }
                innerHtml += ("<input id='" + containerName + "-" + String(i) + "' name='" + containerName + "' type='radio' value='" + StringUtils.trimToEmpty(list[opts.valueField]) + "' " + selected + " class='dataSelectInput " + removeTargetClass + "'>" + "<label class='dataSelectLabel " + containerName + "' for='" + containerName + "-" + String(i) + "'>" + StringUtils.trimToEmpty(list[opts.nameField]) + "</label>" + br);
            });
        }
        var $containers = $("input:radio[name='" + containerName + "']");
        if ($containers.length != 0) {
            if ($containers.length == 1 && $("." + containerName).length == 0) {
                if (innerHtml.trim().length > 0) {
                    $containers.replaceWith(innerHtml);
                }
            } else {
                $("." + containerName).remove();
                if (innerHtml.trim().length > 0) {
                    $containers.replaceWith(innerHtml);
                }
            }
        }
    };
    this.setValue = function(options) {
        var opts = SystemUtils.mergeOptions(this.options, options);
        $("input:radio[name='" + $(opts.container).attr("name") + "'][value='" + opts.value + "']").attr("checked", "checked");
    };
    this.getValue = function(options) {
        var opts = SystemUtils.mergeOptions(this.options, options);
        return $("input:radio[name='" + $(opts.container).attr("name") + "']:checked").val();
    };
    this.getDataSet = function(options) {
        var opts = SystemUtils.mergeOptions(this.options, options);
        return opts.dataList[Number($("input:radio[name='" + $(opts.container).attr("name") + "']:checked").attr("id").replace($(opts.container).attr("name") + "-", ""))];
    };
    this.update = function(rowIndex, fieldName) {
        this.bindDataList();
    };
};

/**
 * This class is CheckListBox that implement DataSelectComponent
 *
 * @param {}
 *            options
 */
var CheckListBox = function(options) {

    var defaultOptions = {
        container : null,
        dataList : null,
        value : null,
        nameField : null,
        valueField : null,
        clickOnLabel : true,
        direction : "horizontal"
    };
    this.options = SystemUtils.mergeOptions(defaultOptions, options);

    this.getContainer = function(selector) {
        return selector !== undefined ? this.options.container.find(selector) : this.options.container;
    };

    this.getDataList = function() {
        return this.options.dataList;
    };

    this.bindDataList = function(options) {
        var opts = SystemUtils.mergeOptions(this.options, options);
        var innerHtml = "";
        var selected;
        var removeTargetClass;
        var containerName = $(opts.container).attr("name");
        var br;
        if (opts.dataList != null) {
            $.each(opts.dataList, function(i, list) {
                if (opts.value != null && String(opts.value).indexOf(list[opts.valueField]) > -1) {
                    selected = "checked='checked'";
                } else {
                    selected = "";
                }
                if (i > 0) {
                    removeTargetClass = containerName;
                } else {
                    removeTargetClass = "";
                }
                if (opts.direction == "vertical") {
                    br = "<br class='" + containerName + "'/>";
                } else {
                    br = "";
                }
                innerHtml += ("<input id='" + containerName + "-" + String(i) + "' name='" + containerName + "' type='checkbox' value='" + StringUtils.trimToEmpty(list[opts.valueField]) + "' " + selected + " class='dataSelectInput " + removeTargetClass + "'>" + "<label for='" + containerName + "-" + String(i) + "' class='dataSelectLabel " + containerName + "'>" + StringUtils.trimToEmpty(list[opts.nameField]) + "</label>" + br);
            });
        }
        var $containers = $("input:checkbox[name='" + containerName + "']");
        if ($containers.length != 0) {
            if ($containers.length == 1 && $("." + containerName).length == 0) {
                if (innerHtml.trim().length > 0) {
                    $containers.replaceWith(innerHtml);
                }
            } else {
                $("." + containerName).remove();
                if (innerHtml.trim().length > 0) {
                    $containers.replaceWith(innerHtml);
                }
            }
        }
    };
    this.setValue = function(options) {
        var opts = SystemUtils.mergeOptions(this.options, options);
        $("input:checkbox[name='" + $(opts.container).attr("name") + "']").val(opts.value);
    };
    this.getValue = function(options) {
        var opts = SystemUtils.mergeOptions(this.options, options);
        return SystemUtils.getMultyValues($(opts.container));
    };
    this.getDataSet = function(options) {
        var opts = SystemUtils.mergeOptions(this.options, options);
        var returnDataList = new Array();
        var arrayIndex = 0;
        $("input:checkbox[name='" + $(opts.container).attr("name") + "']").each(function(i) {
            if (this.checked == true) {
                returnDataList[arrayIndex++] = opts.dataList[i];
            }
        });
        return returnDataList;
    };
    this.update = function(rowIndex, fieldName) {
        this.bindDataList();
    };
};

/**
 * DataGridComponent Interface class
 *
 * @param {}
 *            options
 */
var DataGridComponent = function(options) {
    /**
     * 컴포넌트 옵션
     */
    this.options = null;
    /**
     * 컨테이너 요소를 반환 한다.
     */
    this.getContainer = function(selector) {
        throw new Error("must override getContainer method");
    };
    /**
     * 그리드에 JSON 데이터를 바인딩한다.
     */
    this.bindDataList = function(options) {
        throw new Error("must override bindDataList method");
    };
    /**
     * 새로 추가된 DataList만 가져온다.
     */
    this.getAddedDataList = function(options) {
        throw new Error("must override getAddedDataList method");
    };
    /**
     * 최종 수정된 DataList만 가져온다.
     */
    this.getEditedDataList = function(options) {
        throw new Error("must override getEditedDataList method");
    };
    /**
     * 최종 제거된 DataList만 가져온다.
     */
    this.getRemovedDataList = function(options) {
        throw new Error("must override getRomovedDataList method");
    };
    /**
     * 추가, 수정, 삭제된 모든 데이터 리스트를 가져온다.
     */
    this.getChangedAllDataList = function(options) {
        throw new Error("must override getRomovedDataList method");
    };
    /**
     * 선택한 셀의 Data를 가져온다.
     */
    this.getCellData = function(options) {
        throw new Error("must override getCellData method");
    };
    /**
     * 선택한 로우의 지정한셀의 값을 가져온다.
     */
    this.getValue = function(options) {
        throw new Error("must override getCellData method");
    };
    /**
     * 선택한 로우의 지정한셀의 값을 지정한다.
     */
    this.setValue = function(options) {
        throw new Error("must override getCellData method");
    };
    /**
     * 선택한 셀이 속한 행의 DataSet을 가져온다.
     */
    this.getRowDataFromCell = function(options) {
        throw new Error("must override getRowDataFromCell method");
    };
    /**
     * 선택한 행의 Row DataSet을 가져온다.
     */
    this.getRowData = function(options) {
        throw new Error("must override getRowDataSet method");
    };
    /**
     * 화면에 표시된 DataList를 모두 가져온다.
     */
    this.getDataList = function(options) {
        throw new Error("must override getDataList method");
    };
    /**
     * 페이징 라인을 만든다.
     */
    this.getPagingLine = function(options) {
        throw new Error("must override getPagingLine method");
    };
    /**
     * 페이지 번호를 초기화 한다.
     *
     * @return 초기화된 페이지 번호
     */
    this.resetPaging = function() {
        throw new Error("must override resetPaging method");
    };
    /**
     * 새로운 행을 추가한다.
     */
    this.addRow = function(options) {
        throw new Error("must override addRow method");
    };
    /**
     * 선택한 행을 제거한다.
     */
    this.removeRow = function(options) {
        throw new Error("must override removeRow method");
    };
    /**
     * 추가, 수정된 건에 대해서 데이터 검증을 실행한다. options에 rowIndex 값이 있으면 해당 row 만 검사한다.
     *
     * @returns Boolean - validate 성공 유무
     */
    this.validate = function(options) {
        throw new Error("must override validate method");
    };
    /**
     * 컴포넌트의 내용을 최신의 데이터로 변경한다.
     */
    this.update = function(rowIndex, fieldName) {
        throw new Error("must override update method");
    };
    /**
     * rowStatus 값을 없애고 삭제된 데이터 리스트도 제거한다.
     *
     * @return dataList 전체건수
     */
    this.resetRowStauts = function() {
        throw new Error("must override resetRowStauts method");
    };
};

/**
 * This class is DataGrid that implement DataGridComponent
 */
var DataGrid = function(options) {
    this.defaultOptions = {
        container : null,
        dataList : null,
        extendRowData : null, // dataList의 로우데이터에 더해질 로우데이터
        removedDataList : [],
        sortable : false,
        height : 0,
        posAddNewLine : typeof Config.dataGridComponentConfig.globalPosAddNewLine != "undefined" ? Config.dataGridComponentConfig.globalPosAddNewLine : "top",
        paginable : false,
        pagingOpts : null,
        innerPaginable : false,
        scrollPagingOpts : null,
        resizable : false,
        heightResizable : false,
        editableInputDisplay : true,
        validatable : true, // 실시간 validation 유무
        escapeHTML : true,
        onBindDataList : null, //bindDataList 완료후 실행되는 이벤트
        onBeforeSelect : null,  //행이 선택되기전에 실행되는 콜백
        onAfterSelect : null,  //행이 선택된 후 실행되는 콜백
        globalLeftMargin : null
    };
    this.pagingOpts = {
        pagingPanel : null,
        totalSize : 0,
        totalSizeField : "totalCnt",
        pageNo : 1,
        pageSize : 10,
        pageSizeInput : null,
        pageListSize : 10,
        pageClickFunctionName : 'ServiceController.goPage',
        onChangePage : null,
        showUnlinkedSymbols : true,
        dataListId : null
    };
    this.scrollPagingOpts = {
        pageSize : 30,
        loopStartIndex : 0
    };
    this.defaultOptions.pagingOpts = this.pagingOpts;
    this.defaultOptions.scrollPagingOpts = this.scrollPagingOpts;
    this.defaultOptions.globalLeftMargin = Config.dataGridComponentConfig.globalLeftMargin(options.container);

    this.options = SystemUtils.mergeOptions(this.defaultOptions, options);

    this.getContainer = function(selector) {
        return selector !== undefined ? this.options.container.find(selector) : this.options.container;
    };

    this.getHeader = function(selector) {
        return this.options.height > 0 ? this.options.container.closest("div.rootContainer").find("thead:eq(0) " + StringUtils.trimToEmpty(selector))
        		: this.options.container.find("thead " + StringUtils.trimToEmpty(selector));
    };

    DataGridUtils.init(this.options);

    var tbodyLength = DataGridUtils.getMaxCellCntByRow(this.options.container.find("tbody"));

    var $thead = this.options.container.find("thead");
    var $tfoot = this.options.container.find("tfoot");

    // fixed table header
    if (this.options.height > 0) {
        var opts = this.options;
        opts.container.css("table-layout", "fixed");

        $thead.height($thead.height());
        if ($tfoot.length > 0) {
            $tfoot.height($tfoot.height());
        }

        var gridWidth = opts.container.attr("width");
        if (StringUtils.trimToNull(gridWidth) == null || gridWidth.indexOf("100%") < 0) {
            opts.container.css("width", "100%");
        }

        if ($tfoot != null && $tfoot.length > 0) {
            opts.container.find("tfoot").remove();
        }
        opts.container.wrap("<div class='rootContainer' />");
        opts.container.wrap("<div class='containerWrapper' style='height:" + this.options.height + "px;' />");

        // 내부 스크롤 페이징
        if (opts.innerPaginable) {
            opts.container.parent(".containerWrapper").scroll(function() {
                if (opts.container.find("tbody tr").length < opts.dataList.length) {
                    if (opts.container.parent(".containerWrapper").scrollTop() >= opts.container.height() - opts.container.parent(".containerWrapper").height()) {
                        opts.container.parent(".containerWrapper").css("cursor", "wait");

                        var loopStartIndex = 0;
                        var pageSize = 0;
                        var trLength = opts.container.find("tbody tr").length;
                        if (trLength > 2 && trLength < opts.dataList.length) {
                            loopStartIndex += trLength;
                        }
                        if ((loopStartIndex + opts.scrollPagingOpts.pageSize) > opts.dataList.length) {
                            pageSize = opts.dataList.length - loopStartIndex;
                        } else {
                            pageSize = opts.scrollPagingOpts.pageSize;
                        }
                        opts.container.dataGridComponent.bindDataList({
                            scrollPagingOpts : {
                                loopStartIndex : loopStartIndex,
                                pageSize : pageSize
                            }
                        });
                        trLength = null;
                        loopStartIndex = null;
                        pageSize = null;

                        opts.container.parent(".containerWrapper").css("cursor", "default");
                    }
                }
            });
        }

        var defGridClassName = "";
        if (opts.container != null && StringUtils.trimToNull(opts.container.attr("class")) != null) {
            opts.container.removeClass("dataGridContainer");
            defGridClassName = "dataGridContainer " + opts.container.attr("class");
        } else {
            defGridClassName = "dataGridContaine grid-container";
        }

        var scrollWidth = opts.container.parent().width() - opts.container.width();
        var $rootContainer = null;
        var $cloneTable = null;
        if($thead.size() > 0) {
        	$rootContainer = opts.container.parent().parent().prepend("<div class='fixedWrapper' style='width:100%;overflow-y: scroll;'><table class='" + defGridClassName + " fixedHeader' style='table-layout: fixed;width: 100%;'><thead>" + $thead.html() + "</thead></table></div>");
            //<!-- 헤더 스크롤 여백 매꾸기
        	if(scrollWidth > 1) {
        		$cloneTable = $rootContainer.find("div.fixedWrapper table:first").clone();
        		$cloneTable.addClass("scrollWidthElement");
                $cloneTable.removeClass("fixedHeader");
                $cloneTable.removeClass("dataGridContainer");
                $cloneTable.removeAttr("width");

                var scrollBlockMarginTop = ($rootContainer.find("div.fixedWrapper:last table:first").height());
                if($.browser.mozilla) {
                	if(scrollBlockMarginTop < 34) {
                    	scrollBlockMarginTop = 34;
                    	$rootContainer.find("div.fixedWrapper:last table:first").height(34);
                    } else {
                    	scrollBlockMarginTop += 1;
                    }
                } else if($.browser.msie && BrowserUtils.getMsieVersion() > 8 && document.documentMode > 8) {
                	scrollBlockMarginTop += 1;
                }
                var borderMargin = $.browser.msie ? 0 : 1;
                $cloneTable.css({
                	"width": (scrollWidth + borderMargin) + "px",
                	"position": "absolute",
                	"margin-top" : "-" + scrollBlockMarginTop + "px",
                	"z-index" : "1"
                });

                var cbHeight = 1;
                if($.browser.mozilla) {
                	cbHeight = 0;
                }
                $cloneTable.html('<thead><tr height="' + ($rootContainer.find("div.fixedWrapper table:first").height() - cbHeight) + '"><th bgcolor="#FFFFFF" width="100%" style="border-left: none;"></th></tr></thead>');
                $rootContainer.find("div.fixedWrapper").append($cloneTable);

                scrollBlockMarginTop = null;
                $cloneTable = null;
                cbHeight = null;
        	}
            //헤더 스크롤 여백 매꾸기 -->
        }

        if ($tfoot.size() > 0) {
        	$rootContainer = opts.container.parent().parent().append("<div class='fixedWrapper' style='width:100%;overflow-y: scroll;'><table class='" + defGridClassName + "' style='width:100%;table-layout: fixed;'><tfoot>" + $tfoot.html() + "</tfoot></table></div>");
            //<!-- 푸터 스크롤 여백 매꾸기
            if(scrollWidth > 1) {
                $cloneTable = $rootContainer.find("div.fixedWrapper:last table:first").clone();
                $cloneTable.addClass("scrollWidthElement");
                $cloneTable.removeClass("fixedHeader");
                $cloneTable.removeClass("dataGridContainer");
                $cloneTable.removeAttr("width");

                var scrollBlockMarginTop = ($rootContainer.find("div.fixedWrapper:last table:first").height());
                if($.browser.mozilla) {
                	if(scrollBlockMarginTop < 34) {
                    	scrollBlockMarginTop = 34;
                    	$rootContainer.find("div.fixedWrapper:last table:first").height(34);
                    } else {
                    	scrollBlockMarginTop += 1;
                    }
                }
                var borderMargin = $.browser.msie ? 0 : 1;
                $cloneTable.css({
                	"width": (scrollWidth + borderMargin) + "px",
                	"position": "absolute",
                	"margin-top" : "-" + scrollBlockMarginTop + "px",
                	"z-index" : "1"
                });
                var cbHeight = 1;
                if($.browser.msie && (BrowserUtils.getMsieVersion() == 8 || document.documentMode == 8)) {
                	cbHeight = 0;
                }
                $cloneTable.html('<tfoot><tr height="' + (($rootContainer.find("div.fixedWrapper:last table:first").height()) - cbHeight) + '"><td bgcolor="#FFFFFF" width="100%" style="border-left: none;"></td></tr></tfoot>');
                $rootContainer.find("div.fixedWrapper:last").append($cloneTable);

                scrollBlockMarginTop = null;
                $cloneTable = null;
                cbHeight = null;
            }
            //푸터 스크롤 여백 매꾸기 -->
        }

        //<!-- 스크롤 여백 매꾸기
        var moveScrollWidthElement = function() {
    		if($rootContainer.parents("div.popupComponent").size() > 0) {
    			setTimeout(function() {
    				$rootContainer.find("table.scrollWidthElement").css("left", ($rootContainer.find("div.fixedWrapper:first").offset().left - $rootContainer.parents("div.popupComponent").offset().left + $rootContainer.find("div.fixedWrapper:first table:first").width() - opts.globalLeftMargin) + "px");
    			}, 50);
    		} else {
    			$rootContainer.find("table.scrollWidthElement").css("left", ($rootContainer.find("div.fixedWrapper:first").offset().left + $rootContainer.find("div.fixedWrapper:first table:first").width() - opts.globalLeftMargin) + "px");
    		}
        };
        if ($thead.size() > 0 || $tfoot.size() > 0) {
        	var prevWindowWidth = 0;
            $(window).bind("resize.DataGrid.initHeight", function() {
            	var windowWidth = $(window).width();
            	if(prevWindowWidth != windowWidth) {
            		moveScrollWidthElement();
            		prevWindowWidth = windowWidth;
            	}
            }).resize();
        }
        //스크롤 여백 매꾸기 -->

        $thead.height(0);
        $thead.find("tr").each(function(i) {
            $(this).removeClass();
            $(this).height(0);
            $(this).css("border-top", "none");
            $(this).css("border-bottom", "none");
            $(this).children().each(function() {
            	//<!-- for SNU
            	$(this).removeAttr("lang");
            	//-->

                $(this).removeClass();
                $(this).empty();
                $(this).height(0);
                $(this).css("padding", "0px");
                $(this).css("border-top", "none");
                $(this).css("border-bottom", "none");
            });
        });
        gridWidth = null;

        $thead = this.options.container.parent().parent().find(".fixedWrapper").find("table:first thead:first-child");
    }

    // Grid column resizing
    if (this.options.resizable) {
        var opts = this.options;
        var pressed = false;
        var $start = null;
        var $startUpper = null;
        var $fixedBodyStart = null;
        var startX = null;
        var startWidth = null;
        var fixedBodyStartWidth = null;
        var lastStartWidth = null;
        var startUpperWidth = null;
        var rootStartWidth = null;
        var $theadTr = $thead.find("tr");

        if (opts.height > 0 && $theadTr.length > 1) {
            // TODO 컬럼리사이즈 기능과 헤더고정기능을 동시에 사용 할 경우 테이블 헤더의 로우수는 2라인 까지 가능하게 변경.
            throw new Error("[DataGrid.options.resizable]컬럼리사이즈 기능과 헤더고정기능을 동시에 사용 할 경우 테이블 헤더의 로우수는 1라인을 초과할 수 없습니다.");
        } else if ($theadTr.length > 2) {
            throw new Error("[DataGrid.options.resizable]컬럼리사이즈 기능을 사용하기 위해서는 테이블 헤더의 로우수가 2라인 이하여야 합니다.");
        }

        var tidiedTrs = SystemUtils.cellTidify($theadTr);
        var resizeBarHeight = 30;
        if ($.browser.msie) {
            resizeBarHeight = $theadTr.innerHeight() / $theadTr.length;
        } else {
            resizeBarHeight = $theadTr.innerHeight();
        }

        $(window).unbind("resize.DataGrid.resizable");
        $(window).bind("resize.DataGrid.resizable", function() {
            $theadTr.children().each(function(i) {
                $(this).find(".resizeBar").css("left", $(this).innerWidth() - 6 + "px");
            });
        });
        $theadTr.children().each(function(i) {
            $theadCell = $(this);
            $theadCell.html("<div class='resizeText'>" + $theadCell.text() + "</div>");
            $theadCell.append("<div class='onResize resizeBar'></div>");
            $theadCell.css("padding", "0px");
            $theadCell.css("line-height", resizeBarHeight - 1 + "px");
            $theadCell.find(".resizeBar").height(resizeBarHeight - 1);
            $theadCell.find(".resizeBar").css("left", $theadCell.innerWidth() - 6 + "px");
            $theadCell.find(".resizeBar").click(function(e) {
                return false;
            });

            $theadCell.find(".resizeBar").mousedown(function(e) {
                if (!$.browser.msie) {
                    if ($(".resizeBar").css("display").indexOf("block") > -1)
                        $(".resizeBar").hide();
                }
                $(document).bind("dragstart.DataGrid.resizable, selectstart.DataGrid.resizable", function() {
                    return false;
                });
                $start = $(this).parent();
                $start.removeClass("onResize").addClass("onResize");

                pressed = true;
                startX = e.pageX;
                startWidth = $start.width();
                lastStartWidth = $(this).closest("table").width();

                if ($theadTr.length > 1) {
                    $startUpper = SystemUtils.getUpperCell(tidiedTrs, $start);
                    if ($startUpper != null) {
                        startUpperWidth = $startUpper.width();
                    }
                }

                if (opts.height > 0) {
                    rootStartWidth = $(this).closest(".rootContainer").width();
                    $fixedBodyStart = $(this).closest(".rootContainer").find(".containerWrapper table thead th:eq(" + $start.index() + ")");
                    fixedBodyStartWidth = $fixedBodyStart.width();
                }
            });
        });
        breakRowIndex = null;

        var width = null;
        $(document).bind("mousemove.DataGrid.resizable", function(e) {
            if (pressed) {
                width = startWidth + (e.pageX - startX);
                var lastWidth = lastStartWidth + (e.pageX - startX);
                var upperWidth = null;
                var fixedBodyWidth = null;
                if (startUpperWidth != null) {
                    upperWidth = startUpperWidth + (e.pageX - startX);
                }
                if (opts.height > 0) {
                    rootWidth = rootStartWidth + (e.pageX - startX);
                    if (fixedBodyStartWidth != null) {
                        fixedBodyWidth = fixedBodyStartWidth + (e.pageX - startX);
                    }
                }
                if (width > 1) {
                    $start.width(width);
                    if ($startUpper != null) {
                        $startUpper.width(upperWidth);
                    }
                    $start.closest("table").width(lastWidth);
                    if (opts.height > 0) {
                        $start.closest(".rootContainer").width(rootWidth);
                        if ($fixedBodyStart != null && fixedBodyWidth != null) {
                            $fixedBodyStart.width(fixedBodyWidth);

                            moveScrollWidthElement();
                        }
                    }
                }
                fixedBodyWidth = null;
                upperWidth = null;
                lastWidth = null;
            }
        });

        $(document).bind("mouseup.DataGrid.resizable", function() {
            if (pressed) {
                $theadTr.children().each(function(i) {
                    $(this).find(".resizeBar").css("left", $(this).innerWidth() - 6 + "px");
                });
                $start.removeClass("onResize");
                $(document).unbind("dragstart.DataGrid.resizable, selectstart.DataGrid.resizable");
                if ($(".resizeBar").css("display").indexOf("none") > -1)
                    $(".resizeBar").show();
                pressed = false;

                moveScrollWidthElement();

                width = null;
            }
        });

        startUpperWidth = null;
        lastStartWidth = null;
        startWidth = null;
        startX = null;
        $start = null;
        $fixedBodyStart = null;
        pressed = null;
    }

    // sortable
    if (this.options.sortable) {
        var opts = this.options;
        var $tbodyTr = opts.container.find("tbody").find("tr").children();
        var $theadCells = $thead.find("tr").children();
        $theadCells.css("cursor", "pointer");
        $theadCells.addClass("sortable");
        $theadCells.data("reverse", false);

        var this_ = this;

        $theadCells.click(function(e) {
            if (opts.dataList != null && opts.dataList.length > 0) {
                if(StringUtils.trimToNull($(this).text()) != null && $(this).find("input[type='checkbox']").size() == 0) {
                    $thead.find("span.sortableAsc, span.sortableDesc").remove();
                    var $titleBox = $(this);
                    if($(this).find("div.resizeText").size() > 0) {
                        $titleBox = $(this).find("div.resizeText");
                    }
                    if ($(this).data("reverse") == true) {
                        $titleBox.append("<span class='sortableDesc'>▲</span>");
                    } else {
                        $titleBox.append("<span class='sortableAsc'>▼</span>");
                    }
                    $titleBox = null;

                    var fieldName = null;
                    var currCellIndex = $(this).cellPos().left;
                    if($($tbodyTr[currCellIndex]).attr("id")) {
                        fieldName = $($tbodyTr[currCellIndex]).attr("id");
                    } else {
                        if($($tbodyTr[currCellIndex]).children().is(":input")) {
                            fieldName = $($tbodyTr[currCellIndex]).find("*").attr("name");
                        } else {
                            fieldName = $($tbodyTr[currCellIndex]).find("*").attr("id");
                        }
                    }
                    opts.dataList.sort(JSONUtils.sortBy(fieldName, $(this).data("reverse")));
                    currCellIndex = null;
                    fieldName = null;

                    $(this).data("reverse", !$(this).data("reverse"));
                    this_.bindDataList({ action : "sortable" });
                }
            }
        });
        $theadCells = null;
    }

    // paging for JCF
    if (this.options.paginable) {
        var $form = $(this.options.container).closest("form");
        if ($form.length > 0) {
            if (typeof $form.get(0).maxRows == "undefined") {
                $form.prepend("<input type='hidden' id='maxRows' name='maxRows' value='10'>");
            }
            if (typeof $form.get(0).skipRows == "undefined") {
                $form.prepend("<input type='hidden' id='skipRows' name='skipRows' value='0'>");
            }
        } else {
            throw new Error("[DataGrid.options.paginable]To use paging, you must wrap datagrid by FORM tag");
        }
    }

    /**
     * heightResizable
     * used lib : jQuery UI - draggable;
     */
    if (this.options.heightResizable) {
        var $fixedWrapper = this.options.container.closest(".rootContainer").find(".fixedWrapper:last");
        var $containerWrapper = this.options.container.closest(".rootContainer").find(".containerWrapper");
        if ($fixedWrapper.length == 0 || this.options.height == 0) {
            throw new Error("[DataGrid.options.heightResizable]To use heightResizable, height option is greater than 0 and create TFOOT element in grid table");
        }

        $fixedWrapper.css("cursor", "pointer");

        $fixedWrapper.draggable({
            axis : "y",
            drag : function(event, ui) {
                $containerWrapper.height(ui.offset.top - $containerWrapper.offset().top);
            }
        }).css("position", "inherit");

    }

    this.bindDataList = function(options) {
        var opts = SystemUtils.mergeOptions(this.options, options);
        opts.removedDataList = [];

        if (opts.innerPaginable && opts.height > 0) {
            if (opts.scrollPagingOpts.loopStartIndex == 0) {
                opts.container.find("tbody").empty();
            }
        } else {
            opts.container.find("tbody").empty();
        }

        var rowSpanIndexs = new Array();

        BindData.prototype = new DataBindComponent();
        var bindFields = new BindFields({
            dataList : opts.dataList,
            validatable : opts.validatable,
            dataGrid : this
        });

        var loopStartIndex = 0;
        var loopEndIndex = opts.dataList == null ? 0 : opts.dataList.length;
        if (opts.innerPaginable && opts.height > 0) {
            loopStartIndex = opts.scrollPagingOpts.loopStartIndex;
            if (opts.dataList != null && opts.dataList.length < opts.scrollPagingOpts.pageSize) {
                loopEndIndex = opts.scrollPagingOpts.loopStartIndex + opts.dataList.length;
            } else {
                loopEndIndex = opts.scrollPagingOpts.loopStartIndex + opts.scrollPagingOpts.pageSize;
                opts.scrollPagingOpts.pageSize = 30;
            }
        }
        opts.scrollPagingOpts.loopStartIndex = 0;

        if (options != null && StringUtils.trimToEmpty(options.action) != "sortable") {
            $thead.find("span.sortableAsc, span.sortableDesc").remove();
        }

        if (opts.dataList != null && opts.dataList.length > 0 && loopEndIndex > 0) {
            var $tbody = opts.container.find("tbody");
            var $defaultTbody = null;
            for ( var i = loopStartIndex; i < loopEndIndex; i++) {
                var $cell;
                var cellOpts;
                $defaultTbody = opts.container.data("$defaultTbody").clone();
                if (opts.resizable) {
                    $defaultTbody.find("tr").children().addClass("resizeTbodyTd");
                }
                for (var key in opts.dataList[i]) {
                    $cell = $defaultTbody.find("#" + key);
                    cellOpts = SystemUtils.getClassOpts($cell);

                    if (!$cell.is("img")) {
                        if (SystemUtils.realTypeOf(opts.dataList[i][key]) == "array") {
                            if (!$cell.is("img")) {
                                if(opts.escapeHTML) {
                                    $cell.text(Formater.format($cell, SystemUtils.arrayToString(opts.dataList[i][key], ",")));
                                } else {
                                    $cell.html(Formater.format($cell, SystemUtils.arrayToString(opts.dataList[i][key], ",")));
                                }
                            } else {
                                $cell.attr("src", opts.dataList[i][key]);
                            }
                        } else {
                            if(opts.escapeHTML) {
                                $cell.text(Formater.format($cell, opts.dataList[i][key] != null ? opts.dataList[i][key] : ""));
                            } else {
                                $cell.html(Formater.format($cell, opts.dataList[i][key] != null ? opts.dataList[i][key] : ""));
                            }
                        }
                    } else {
                        $cell.attr("src", opts.dataList[i][key]);
                    }
                    $cell.removeClass("changedEditableCell");

                    if (cellOpts != null) {
                        // Editable cells(editable)
                        if (cellOpts.editable != null && cellOpts.editable == true) {
                            if (opts.editableInputDisplay) {
                                $cell.html("<input style='width:90%;' type='text' name='" + $cell.attr("id") + "'>");
                            } else {
                                $cell.attr("onclick", "DataGridUtils.editableCellClickEvent.apply(this)" + ($cell.attr("onclick") != null ? ";" + $cell.attr("onclick") : ""));
                            }
                        }

                        // Merge cells(rowSpan)
                        if (cellOpts.rowSpan != null && cellOpts.rowSpan == true) {
                            if (rowSpanIndexs.length == 0 || (rowSpanIndexs.length > 0 && JSON.stringify(rowSpanIndexs).indexOf($cell.index()) == -1)) {
                                rowSpanIndexs.push($cell.index());
                            }
                        }

                        // Call cell handler function
                        if (cellOpts.cellHandler != null) {
                            cellOpts.cellHandler(i, $cell, opts.dataList[i]);
                            cellOpts.cellHandler == null;
                        }

                        if ($cell.find(":input").length > 0) {
                            var inheritanceOptsClassString = SystemUtils.getInheritanceOptsClassString(cellOpts);
                            if (inheritanceOptsClassString != null) {
                                $cell.children().filter(":input").each(function() {
                                    $(this).attr("class", inheritanceOptsClassString + ($(this).attr("class") != null ? (" " + $(this).attr("class")) : ""));
                                });
                            }
                            $cell.removeAttr("id");
                            inheritanceOptsClassString = null;
                        }
                    }
                    cellOpts = null;
                }
                $cell = null;
                cellValue = null;
                var rowOpts = SystemUtils.getClassOpts($defaultTbody);
                if (rowOpts != null && rowOpts.rowSetHandler != null) {
                    rowOpts.rowSetHandler(i, $defaultTbody, opts.dataList[i]);
                    rowOpts.rowSetHandler = null;
                }
                $tbody.append($defaultTbody.html());

                var rowLength = $defaultTbody.find("tr").length;
                var container = null;
                if(rowLength > 1) {
                	var selString = "";
                	for(var j=i*rowLength;j<i*rowLength + rowLength;j++) {
                		selString += ("> tr:eq(" + j + "),");
                	}
                	container = $tbody.find(selString);
                	selString = null;
                } else {
                	container = $tbody.find("> tr:last");
                }
                bindFields.bindDataList({
                    container : container,
                    rowIndex : i
                });

                rowOpts = null;
                $defaultTbody = null;
            }
            rowSpanIndexs.sort( function(a, b){ return a-b; });
            for (index in rowSpanIndexs) {
                DataGridUtils.rowSpan(opts.container.find("tbody"), rowSpanIndexs[index]);
            }
            $tbody.find("tr:odd").addClass('odd');
            $tbody.find("tr:even").addClass('even');

            $tbody.find("tr").click(function(e) {
                var classOpts = SystemUtils.getClassOpts(e.target);
                if((classOpts == null || classOpts.selectable == null) || (classOpts != null && classOpts.selectable != null && classOpts.selectable != false)) {
                	var throughSelected = true;
                	if(opts.onBeforeSelect != null) {
                		throughSelected = opts.onBeforeSelect($(this).index(), $(this), opts.dataList[$(this).index()]);
                	}
                	if(throughSelected) {
                		if (opts.container.hasClass("select-multy")) {
                            if ($(this).hasClass("selected")) {
                                $(this).removeClass("selected");
                            } else {
                                $(this).addClass("selected");
                            }
                        } else {
                            $tbody.find("tr").removeClass("selected");
                            $(this).addClass("selected");
                        }
                	}
                	if(opts.onAfterSelect != null) {
                		opts.onAfterSelect($(this).index(), $(this), opts.dataList[$(this).index()]);
                	}
                }
            });

            opts.container.css("height", "");
        } else {
            opts.container.find("tbody").html("<tr><td class='emptyDataList' colspan='" + tbodyLength + "'>" + CvcafI18nComponents.emptyList[Config.locale] + "</td></tr>");
        }
        bindFields = null;

        if (opts.paginable && options != null && StringUtils.trimToEmpty(options.action) != "sortable") {
        	$(this.options.container).parents("form").find("#pagingPanel").show();
            this.getPagingLine();
            this.resetPaging();
        }
        //데이터가 없다면 페이징 라인 제거
        if(ArrayUtils.isEmpty(opts.dataList)) {
        	$(this.options.container).parents("form").find("#pagingPanel").hide();
        }

        // for HYIN
        if (typeof ContextInitializer != 'undefined') {
            if (typeof ContextInitializer.dynamicElementInit != 'undefined') {
                ContextInitializer.dynamicElementInit();
            }
        }

        if(opts.onBindDataList != null) {
            opts.onBindDataList();
        }

        return this;
    };

    this.getAddedDataList = function(options) {
        var opts = SystemUtils.mergeOptions(this.options, options);

        var returnDataList = new Array();
        $(opts.dataList).each(function(i) {
            if (this.rowStatus != null && this.rowStatus == "insert") {
                if (opts.extendRowData != null) {
                    returnDataList.push($.extend({}, opts.dataList[i], opts.extendRowData));
                } else {
                    returnDataList.push(opts.dataList[i]);
                }
            }
        });
        return returnDataList.length > 0 ? returnDataList : null;
    };

    this.getEditedDataList = function(options) {
        var opts = SystemUtils.mergeOptions(this.options, options);

        var returnDataList = new Array();
        $(opts.dataList).each(function(i) {
            if (this.rowStatus != null && this.rowStatus == "update") {
                if (opts.extendRowData != null) {
                    returnDataList.push($.extend({}, opts.dataList[i], opts.extendRowData));
                } else {
                    returnDataList.push(opts.dataList[i]);
                }
            }
        });
        return returnDataList.length > 0 ? returnDataList : null;
    };

    this.getRemovedDataList = function(options) {
        var opts = SystemUtils.mergeOptions(this.options, options);

        if (opts.extendRowData != null) {
            $(opts.removedDataList).each(function(i) {
                opts.removedDataList[i] = $.extend({}, opts.removedDataList[i], opts.extendRowData);
            });
        }
        return opts.removedDataList.length > 0 ? opts.removedDataList : null;
    };

    this.getChangedAllDataList = function(options) {
        var changedAllDataList = new Array();
        if (this.getRemovedDataList(options) != null) {
            changedAllDataList = changedAllDataList.concat(this.getRemovedDataList(options));
        }
        if (this.getEditedDataList(options) != null) {
            changedAllDataList = changedAllDataList.concat(this.getEditedDataList(options));
        }
        if (this.getAddedDataList(options) != null) {
            changedAllDataList = changedAllDataList.concat(this.getAddedDataList(options));
        }
        return changedAllDataList.length > 0 ? changedAllDataList : null;
    };

    this.getCellData = function(options) {
        var opts = SystemUtils.mergeOptions(this.options, options);

        var rowIndex = opts.cell != null ? $(opts.cell).parents("tr").index() : opts.rowIndex;
        var id = opts.cell != null ? $(opts.cell).attr("id") : opts.id;
        return opts.dataList != null ? opts.dataList[rowIndex][id] : null;
    };

    this.getValue = function(rowIndex, fieldName) {
        if(rowIndex == null) {
        	throw new Error("[DataGrid.getValue]rowIndex(arg1) is null. you must input rowIndex");
        }
        if(fieldName == null) {
        	throw new Error("[DataGrid.getValue]fieldName(arg2) is null. you must input column name");
        }
        return ArrayUtils.isEmpty(this.options.dataList) ? null : this.options.dataList[rowIndex][fieldName];
    };

    this.setValue = function(rowIndex, fieldName, value) {
    	if(rowIndex == null) {
        	throw new Error("[DataGrid.getValue]rowIndex(arg1) is null. you must input rowIndex");
        }
    	if(fieldName == null) {
        	throw new Error("[DataGrid.getValue]fieldName(arg2) is null. you must input column name");
        }
    	if(value == null) {
			throw new Error("[DataGrid.setValue]value(arg3) is null. you must input value");
		}
        if(ArrayUtils.isEmpty(this.options.dataList)) {
        	throw new Error("[DataGrid.setValue]dataList is null");
        }
        if(this.options.dataList && this.options.rowIndex > this.options.dataList.length-1) {
        	throw new Error("[DataGrid.setValue]Max rowIndex value is " + (this.options.dataList.length-1));
        }

        var selString = "";
        var rowLength = this.options.container.data("$defaultTbody").find("tr").length;
        var trIndex = rowIndex*rowLength;
        for(var i=trIndex;i<trIndex+rowLength;i++) {
    		selString += ("tbody > tr:eq(" + i + "),");
    	}
		if(!ArrayUtils.isEmpty(this.options.dataList)) {
			var $input = this.options.container.find(selString).find("[name='" + fieldName + "']");
			if($input.size() > 0) {
	            if($input.size() > 0) {
	                var readOnlyFlag = false;
	                if($input.prop("readonly")) {
	                    $input.removeAttr("readonly");
	                    readOnlyFlag = true;
	                }
	                if($input.is("input[type='radio']")) {
	                    $input.filter("[value='" + value + "']").attr("checked", "checked");
	                    this.options.dataList[rowIndex][fieldName] = value;
	                } else if($input.is("input[type='checkbox']")) {
	                    $input.removeAttr("checked");
	                    if(SystemUtils.realTypeOf(value) == "array") {
	                        $input.val(value);
	                    } else if(SystemUtils.realTypeOf(value) == "string") {
	                    	if(value == Config.checkedValue) {
	                    		$input.attr("checked", "checked");
	                    	} else if(value == Config.unCheckedValue) {
	                    		$input.removeAttr("checked");
	                    	}
	                    }
	                    this.options.dataList[rowIndex][fieldName] = value;
	                } else if($input.is("select")) {
	                    $input.val(value);
	                    this.options.dataList[rowIndex][fieldName] = value;
	                } else {
	                    $input.val(value);
	                    $input.trigger("focusout.BindFields.bindDataList");
	                }
	                if(readOnlyFlag) {
	                    $input.attr("readonly", "readonly");
	                }
	            }
	            $input = null;
			} else {
				var $cell = this.options.container.find(selString).find("#" + fieldName);
				if($cell.size() > 0) {
					if(this.options.escapeHTML) {
			            $cell.text(Formater.format($cell, value));
			        } else {
			            $cell.html(Formater.format($cell, value));
			        }
				}
				$cell = null;
			}
			if(this.options.dataList[rowIndex][fieldName] != value) {
                this.options.dataList[rowIndex][fieldName] = value;
                if(StringUtils.trimToEmpty(this.options.dataList[rowIndex].rowStatus) != "insert" && fieldName != "rowStatus") {
                    this.options.dataList[rowIndex].rowStatus = "update";
                }
            }
            DataComponentObserver.getInstance().notify(this, rowIndex, fieldName);
		}
		rowLength = null;
        selString = null;

		this.options.dataList[rowIndex][fieldName] = value;
        if(StringUtils.trimToEmpty(this.options.dataList[rowIndex].rowStatus) != "insert") {
            this.options.dataList[rowIndex].rowStatus = "update";
        }
        DataComponentObserver.getInstance().notify(this, rowIndex, fieldName);

		return this;
    };

    this.getRowDataFromCell = function(options) {
        var opts = SystemUtils.mergeOptions(this.options, options);
        var rowIndex = opts.cell != null ? $(opts.cell).parents("tr").index() : opts.rowIndex;
        return opts.dataList != null ? opts.dataList[rowIndex] : null;
    };

    this.getRowData = function(options) {
        var opts = SystemUtils.mergeOptions(this.options, options);

        var rowIndex = opts.row != null ? $(opts.row).index() : opts.rowIndex;
        return opts.dataList != null ? opts.dataList[rowIndex] : null;
    };

    this.getDataList = function(options) {
        var opts = SystemUtils.mergeOptions(this.options, options);

        return opts.dataList;
    };

    this.getPagingLine = function() {
        if ($(this.options.container).parents("form").length > 0) {
            var opts = this.options.pagingOpts;

            var $form = $(this.options.container).parents("form");
            if (opts.pagingPanel == null)
                opts.pagingPanel = "form[name='" + $form.attr("name") + "'] #pagingPanel";
            if (opts.pageSizeInput == null)
                opts.pageSizeInput = "form[name='" + $form.attr("name") + "'] #maxRows";
            if (opts.totalSizeField != null)
                opts.totalSize = ArrayUtils.isEmpty(this.options.dataList) ? 0 : this.options.dataList[0][opts.totalSizeField];
            if (opts.totalSize == null)
                opts.totalSize = 0;
            if ($(opts.pageSizeInput).length > 0)
                opts.pageSize = Number(StringUtils.trimToZero($(opts.pageSizeInput).val()));

            var this_ = this;
            var goPage = function(linkA) {
                var pageNo = $(linkA).data("pageNo");
                var $pagingForm = $(this_.options.container).parents("form[name='" + $form.attr("name") + "']");
                $pagingForm.find("#skipRows").val((pageNo <= 1) ? 0 : (pageNo - 1) * Number($pagingForm.find("#maxRows").val()));

                Controller.setParams(null, null, $pagingForm);
                Controller.submit($pagingForm.attr("action"), function(dataList) {
                    this_.bindDataList({
                        dataList : Config.getDataList(dataList, opts.dataListId),
                        pagingOpts : {
                            pageNo : pageNo,
                            dataListId : opts.dataListId
                        }
                    });
                    if(this_.options.pagingOpts.onChangePage != null) {
                        this_.options.pagingOpts.onChangePage(pageNo);
                    }
                });
            };

            var pageClickFunctionUse = false;
            if(SystemUtils.stringToFunction(opts.pageClickFunctionName) != undefined) {
                pageClickFunctionUse = true;
            }

            var Paginator = {
                init : function() {
                    var totalPage = Math.ceil(opts.totalSize / opts.pageSize);
                    var totalPageList = Math.ceil(totalPage / opts.pageListSize);
                    var pageList = Math.ceil(opts.pageNo / opts.pageListSize);
                    if (pageList < 1)
                        pageList = 1;
                    if (pageList > totalPageList)
                        pageList = totalPageList;
                    var startPageList = (pageList - 1) * opts.pageListSize + 1;
                    var endPageList = startPageList + opts.pageListSize - 1;

                    if (startPageList < 1)
                        startPageList = 1;
                    if (endPageList > totalPage)
                        endPageList = totalPage;
                    if (endPageList < 1)
                        endPageList = 1;

                    $(opts.pagingPanel).empty();

                    var innerHTML = this.getPageItemLink(1, '<img src="' + Config.dataGridComponentConfig.pagingButtonSet.firstPage + '" alt="처음">&nbsp;', opts.pageNo > 1, '');
                    var lastA = null;

                    $(opts.pagingPanel).append(innerHTML);
                    if(!pageClickFunctionUse && opts.pageNo > 1) {
                        lastA = $(opts.pagingPanel).find("a:last");
                        lastA.data("pageNo", 1);
                        lastA.click(function(e) {
                            e.preventDefault();
                            goPage(this);
                        });
                    }

                    innerHTML = this.getPageItemLink((startPageList - 1), '<img src="' + Config.dataGridComponentConfig.pagingButtonSet.prevPage + '" alt="이전">', startPageList > 1, '');
                    $(opts.pagingPanel).append(innerHTML);
                    if(!pageClickFunctionUse && startPageList > 1) {
                        lastA = $(opts.pagingPanel).find("a:last");
                        lastA.data("pageNo", startPageList - 1);
                        lastA.click(function(e) {
                            e.preventDefault();
                            goPage(this);
                        });
                    }

                    $(opts.pagingPanel).append('<span class="numberLink"></span>');
                    for ( var i = startPageList; i <= endPageList; i++) {
                        innerHTML = this.getNumberLink(i, null, (opts.pageNo != i), ((opts.pageNo == i) ? 'strong' : ''));
                        if (i < endPageList) {
                            innerHTML += ' | ';
                        }
                        $(opts.pagingPanel).find("span.numberLink").append(innerHTML);
                        if(!pageClickFunctionUse && opts.pageNo != i) {
                            lastA = $(opts.pagingPanel).find("a:last");
                            lastA.data("pageNo", i);
                            lastA.click(function(e) {
                                e.preventDefault();
                                goPage(this);
                            });
                        }
                    }
                    innerHTML = this.getPageItemLink((endPageList + 1), '&nbsp;<img src="' + Config.dataGridComponentConfig.pagingButtonSet.nextPage + '" alt="다음">', endPageList < totalPage, '');
                    $(opts.pagingPanel).append(innerHTML);
                    if(!pageClickFunctionUse && endPageList < totalPage) {
                        lastA = $(opts.pagingPanel).find("a:last");
                        lastA.data("pageNo", startPageList + opts.pageListSize);
                        lastA.click(function(e) {
                            e.preventDefault();
                            goPage(this);
                        });
                    }

                    innerHTML = this.getPageItemLink(totalPage, '&nbsp;<img src="' + Config.dataGridComponentConfig.pagingButtonSet.lastPage + '" alt="끝">', opts.pageNo < totalPage, 'arrow next');
                    $(opts.pagingPanel).append(innerHTML);
                    if(!pageClickFunctionUse && opts.pageNo < totalPage) {
                        lastA = $(opts.pagingPanel).find("a:last");
                        lastA.data("pageNo", totalPage);
                        lastA.click(function(e) {
                            e.preventDefault();
                            goPage(this);
                        });
                    }

                    innerHTML = null;
                    lastA = null;
                },
                getNumberLink : function(pageNo, text, useLink, className) {
                    if (useLink) {
                        var onclick = "";
                        if(pageClickFunctionUse) {
                            onclick = 'onclick="' + opts.pageClickFunctionName + '(' + pageNo + ')"';
                        }
                        return '<a style="cursor: pointer;" ' + onclick + '>' + ((text != null && text != '') ? text : pageNo) + '</a>';
                    } else {
                        return '<span ' + ((className != null && className != '') ? ' class="' + className + '"' : '') + ' style="font-weight:bold;color:#296BAE;">' + ((text != null && text != '') ? text : pageNo) + '</span>';
                    }
                },
                getPageItemLink : function(pageNo, text, useLink, className) {
                    if (useLink) {
                        var onclick = "";
                        if(pageClickFunctionUse) {
                            onclick = 'onclick="' + opts.pageClickFunctionName + '(' + pageNo + ')"';
                        }
                        return '<a style="cursor: pointer;" ' + onclick + ' ' + ((className != null && className != '') ? ' class="' + className + '"' : '') + '>' + '<span>' + ((text != null && text != '') ? text : pageNo) + '</span>' + '</a>\n';
                    } else {
                        if (opts.showUnlinkedSymbols) {
                            return '<span>' + ((StringUtils.trimToNull(text) != null) ? text : pageNo) + '</span>\n';
                        } else {
                            return '\n';
                        }
                    }
                }
            };
            Paginator.init();
        } else {
            throw new Error("[DataGrid.getPagingLine]To use paging, you must wrap datagrid by FORM tag");
        }
    };

    this.resetPaging = function() {
        var $form = $(this.options.container).closest("form");
        if ($form.size() > 0) {
            $form.find("input[name='skipRows']").val("0");
        }
        this.options.pagingOpts.pageNo = 1;
        return this.options.pagingOpts.pageNo;
    };

    this.addRow = function(options) {
        var opts = SystemUtils.mergeOptions(this.options, options);

        if (opts.innerPaginable && StringUtils.trimToEmpty(opts.posAddNewLine) == 'bottom') {
            throw new Error("[DataGrid.addRow]To use posAddNewLine option value \"bottom\", you must assign \"false\" to innerPaginable option value");
        }

        var $defaultTbodyClone = opts.container.data("$defaultTbody").clone();
        if (opts.resizable) {
            $defaultTbodyClone.find("tr").children().addClass("resizeTbodyTd");
        }
        var $tbody = opts.container.find("tbody");
        var cellOpts = null;

        var addedDataSet = $defaultTbodyClone.extractToJSON();
        addedDataSet.rowStatus = "insert";
        var rowIndex = 0;
        if (StringUtils.trimToEmpty(opts.posAddNewLine) == 'bottom') {
            rowIndex = ArrayUtils.isEmpty(opts.dataList) ? 0 : opts.dataList.length;
        }
        $defaultTbodyClone.find("tr").each(function(i) {
            $(this).children().each(function(index) {
                $(this).removeAttr("onclick");
                if ($(this).children().length == 0) {
                    cellOpts = SystemUtils.getClassOpts($(this));
                    if (cellOpts != null) {
                        // Call cell handler function
                        if (cellOpts.cellHandler != null) {
                            cellOpts.cellHandler(rowIndex, $(this), addedDataSet);
                            cellOpts.cellHandler = null;
                        } else {
                        	if (cellOpts.editable != null && cellOpts.editable == true) {
                                if (opts.editableInputDisplay) {
                                	$(this).html("<input style='width:90%;' type='text' name='" + $(this).attr("id") + "'>");
                                } else {
                                	$(this).attr("onclick", "DataGridUtils.editableCellClickEvent.apply(this)" + ($cell.attr("onclick") != null ? ";" + $cell.attr("onclick") : ""));
                                }
                            }
                        }
                        if ($(this).find(":input").length > 0) {
                            var inheritanceOptsClassString = SystemUtils.getInheritanceOptsClassString(cellOpts);
                            if (inheritanceOptsClassString != null) {
                                $(this).children().filter(":input").each(function() {
                                    $(this).attr("class", inheritanceOptsClassString + ($(this).attr("class") != null ? (" " + $(this).attr("class")) : ""));
                                });
                            }
                            $(this).removeAttr("id");
                            inheritanceOptsClassString = null;
                        }
                    }
                    cellOpts = null;
                }
                $tbodyCell = null;
            });
        });
        addedDataSet = $.extend({}, addedDataSet, $defaultTbodyClone.extractToJSON());

        var rowOpts = SystemUtils.getClassOpts($defaultTbodyClone);
        if (rowOpts != null && rowOpts.rowSetHandler != null) {
            rowOpts.rowSetHandler(rowIndex, $defaultTbodyClone, addedDataSet);
        }

        BindData.prototype = new DataBindComponent();
        var dataBindComponent = new BindData({
            validatable : opts.validatable
        });

        var rowLength = $defaultTbodyClone.find("tr").length;
        var container = null;
        if (ArrayUtils.isEmpty(opts.dataList)) {
            $tbody.html($defaultTbodyClone.html());
            if($tbody.find("> tr:first :input:first").size() > 0) {
            	// XP - IE8 에서 입력요소가 disable 되어 있거나 display: none 되어 있을때 focus 함수 호출하면 에러나는것 처리
            	try {
            		$tbody.find("> tr:first :input:first").get(0).focus();
            	} catch(e) {}
            }
            if(opts.dataList == null) {
                opts.dataList = new Array();
            }
            opts.dataList.push(addedDataSet);

            if(rowLength > 1) {
            	var selString = "";
            	for(var i=0;i<rowLength;i++) {
            		selString += ("> tr:eq(" + i + "),");
            	}
            	container = $tbody.find(selString);
            } else {
            	container = $tbody.find("> tr:first");
            }
            dataBindComponent.bindDataList({
                dataList : opts.dataList,
                container : container,
                rowIndex : rowIndex,
                dataGrid : this
            });
        } else {
            if (opts.posAddNewLine == null || (opts.posAddNewLine != null && opts.posAddNewLine != 'bottom')) {
                $tbody.prepend($defaultTbodyClone.html());
                if($tbody.find("> tr:first :input:first").size() > 0) {
                	// XP - IE8 에서 입력요소가 disable 되어 있거나 display: none 되어 있을때 focus 함수 호출하면 에러나는것 처리
                	try {
                		$tbody.find("> tr:first :input:first").get(0).focus();
                	} catch(e) {}
                }
                opts.dataList.splice(0, 0, addedDataSet);

                if(rowLength > 1) {
                	var selString = "";
                	for(var i=0;i<rowLength;i++) {
                		selString += ("> tr:eq(" + i + "),");
                	}
                	container = $tbody.find(selString);
                	selString = null;
                } else {
                	container = $tbody.find("> tr:first");
                }
                dataBindComponent.bindDataList({
                    dataList : opts.dataList,
                    container : container,
                    rowIndex : rowIndex,
                    dataGrid : this
                });
            } else {
                $tbody.append($defaultTbodyClone.html());
                if($tbody.find("tr:last :input:first").size() > 0) {
                	// XP - IE8 에서 입력요소가 disable 되어 있거나 display: none 되어 있을때 focus 함수 호출하면 에러나는것 처리
                	try {
                		$tbody.find("tr:last :input:first").get(0).focus();
                	} catch(e) {}
                }
                opts.dataList.push(addedDataSet);

                if(rowLength > 1) {
                	var selString = "";
                	for(var i=(opts.dataList.length-1) * rowLength;i<opts.dataList.length * rowLength;i++) {
                		selString += ("> tr:eq(" + i + "),");
                	}
                	container = $tbody.find(selString);
                	selString = null;
                } else {
                	container = $tbody.find("> tr:last");
                }
                dataBindComponent.bindDataList({
                    dataList : opts.dataList,
                    container : container,
                    rowIndex : rowIndex,
                    dataGrid : this
                });
            }
        }

        container = null;
        rowIndex = null;
        dataBindComponent = null;
        rowOpts = null;
        $tbody = null;
        $defaultTbodyClone = null;
        isEmptyRow = null;

        // for HYIN
        if (typeof ContextInitializer != 'undefined') {
            if (typeof ContextInitializer.dynamicElementInit != 'undefined') {
                ContextInitializer.dynamicElementInit();
            }
        }
        DataComponentObserver.getInstance().notify(this, rowIndex);
        return this;
    };

    this.removeRow = function(options) {
        var opts = SystemUtils.mergeOptions(this.options, options);

        if(ArrayUtils.isEmpty(opts.dataList)) {
        	throw new Error("[DataGrid.removeRow]dataList is null");
        }
        if(opts.dataList && opts.rowIndex > opts.dataList.length-1) {
        	throw new Error("[DataGrid.removeRow]Max rowIndex value is " + (opts.dataList.length-1));
        }

        var rowIndex = opts.rowIndex;

        if(typeof opts.trigger != "undefined") {
        	rowIndex = $(opts.trigger).parentsUntil("tr").parent().index();
        };

        var selString = "";
        var rowLength = opts.container.data("$defaultTbody").find("tr").length;
        var trIndex = rowIndex*rowLength;
        for(var i=trIndex;i<trIndex+rowLength;i++) {
    		selString += ("tbody > tr:eq(" + i + "),");
    	}
    	opts.container.find(selString).remove();
    	rowLength = null;
        selString = null;

        if (opts.dataList[rowIndex].rowStatus == "insert") {
            opts.dataList.splice(rowIndex, 1);
        } else {
            if (opts.removedDataList == null) {
                opts.removedDataList = [];
            }
            var removedRow = opts.dataList.splice(rowIndex, 1)[0];
            removedRow.rowStatus = "delete";
            opts.removedDataList.push(removedRow);
        }
        DataComponentObserver.getInstance().notify(this);
        return this;
    };

    this.validate = function(options) {
        if ($(".noPassedValidateField").length > 0) {
            return false;
        }
        var opts = SystemUtils.mergeOptions(this.options, options);

        BindData.prototype = new DataBindComponent();
        var dataBindComponent = new BindData({
            dataList : opts.dataList
        });
        var returnValue = true;

        var getContainer = function(rowIndex) {
        	var rowLength = opts.container.data("$defaultTbody").find("tr").length;
        	if(rowLength > 1) {
            	var selString = "";
            	for(var i=0;i<rowLength;i++) {
            		selString += ("tbody tr:eq(" + ((rowIndex+1) * rowLength - (i + 1)) + "), ");
            	}
            	return opts.container.find(selString);
            } else {
            	return opts.container.find("tbody tr:eq(" + rowIndex + ")");
            }
        	selString = null;
        };

        if (opts.rowIndex != null && opts.rowIndex != "all") {
            returnValue = dataBindComponent.validate({
                container : getContainer(opts.rowIndex),
                rowIndex : opts.rowIndex
            });
        } else {
        	if(opts.rowIndex != null && opts.rowIndex == "all") {
        		$(opts.dataList).each(function(i) {
                    returnValue = dataBindComponent.validate({
                        container : getContainer(i),
                        rowIndex : i
                    });
                    if (returnValue == false) {
                        return false;
                    }
                });
        	} else {
        		$(opts.dataList).each(function(i) {
                    if (this.rowStatus != null && (this.rowStatus == 'insert' || this.rowStatus == 'update')) {
                        returnValue = dataBindComponent.validate({
                            container : getContainer(i),
                            rowIndex : i
                        });
                        if (returnValue == false) {
                            return false;
                        }
                    }
                });
        	}
        }
        dataBindComponent = null;
        return returnValue;
    };

    this.resetRowStauts = function() {
        $(this.options.dataList).each(function() {
            if(this.rowStatus) delete this.rowStatus;
        });
        this.options.removedDataList = [];
        return this;
    };

    this.update = function(rowIndex, fieldName) {
        var opts = this.options;
    	var rowLength = opts.container.data("$defaultTbody").find("tr").length;
    	var container = null;
    	if(rowLength > 1) {
        	var selString = "";
        	for(var i=0;i<rowLength;i++) {
        		selString += ("tbody tr:eq(" + ((rowIndex+1) * rowLength - (i + 1)) + "), ");
        	}
        	container = opts.container.find(selString);
        } else {
        	container = opts.container.find("tbody tr:eq(" + rowIndex + ")");
        }
        if (typeof rowIndex != "undefined" && typeof fieldName != "undefined" && opts.dataList != null && opts.dataList.length > 0) {
            var $cell = container.find("#" + fieldName);
            if ($cell.length == 0) {
                $cell = container.find("[name='" + fieldName + "']");
            }
            var cellOpts = null;
            if ($cell.length > 0) {
                if ($cell.is(":input")) {
                    $cell.val(Formater.format($cell, opts.dataList[rowIndex][fieldName]));
                } else {
                    if (SystemUtils.realTypeOf(opts.dataList[rowIndex][fieldName]) == "array") {
                        var tempArray = new Array();
                        $(opts.dataList[rowIndex][fieldName]).each(function() {
                            tempArray.push(Formater.format($cell, String(this)));
                        });
                        if(opts.escapeHTML) {
                            $cell.text(tempArray.toString());
                        } else {
                            $cell.html(tempArray.toString());
                        }
                        tempArray = null;
                    } else {
                        if(opts.escapeHTML) {
                            $cell.text(Formater.format($cell, opts.dataList[rowIndex][fieldName]));
                        } else {
                            $cell.html(Formater.format($cell, opts.dataList[rowIndex][fieldName]));
                        }
                    }
                }

                // Call cell handler function
                cellOpts = SystemUtils.getClassOpts($cell);
                if (cellOpts != null && cellOpts.cellHandler != null) {
                    cellOpts.cellHandler(rowIndex, $cell, opts.dataList[rowIndex]);
                    cellOpts.cellHandler == null;
                }

                $cell.addClass("changedEditableCell");
                AnimateUtils.dataChanged($cell);
            }
            $cell = null;
            cellOpts = null;
        } else {
            this.bindDataList();
        }
        container = null;
    };

};

var DataGridUtils = {
    options : null,
    applied : false,
    preCellValue : null,
    init : function(options) {
        this.options = options;
        options.removedDataList = [];
        if (StringUtils.trimToNull(options.container.attr("class")) == null) {
            options.container.addClass("grid-container");
        }
        options.container.removeClass("dataGridContainer");
        options.container.attr("class", "dataGridContainer " + options.container.attr("class"));
        if (options.container != null && options.container.data("$defaultTbody") == null) {
            options.container.data("$defaultTbody", options.container.find("tbody").clone(true));
        }
    },
    /**
     * input필드의 값이 변경된걸 DataObserver에 알리는 focusOut 이벤트를 주입한다.
     *
     * @deprecated - 그리드에서 쓰던건데 이제 쓰지 않음. 삭제해도 됨.
     * @param $cell
     */
    setFocusOutEvents : function($cell) {
        var $input = $cell.find("select");
        $input.attr("onchange", ($input.attr("onchange") != null ? $input.attr("onchange") + ";" : "") + "DataGridUtils.changeValue.apply(this)");
        $input = $cell.find("input[type='text']");
        $input.attr("onblur", ($input.attr("onblur") != null ? $input.attr("onblur") + ";" : "") + "DataGridUtils.changeValue.apply(this)");
        $input = $cell.find("input[type='checkbox'], input[type='radio']");
        $input.attr("onclick", ($input.attr("onclick") != null ? $input.attr("onclick") + ";" : "") + "DataGridUtils.changeValue.apply(this)");
        $input = null;
    },
    editableCellClickEvent : function() {
        var html = "<input name=\"" + $(this).attr("id") + "\" " + "type=\"text\" " + "onblur=\"DataGridUtils.editableCellInputBlurEvent.apply(this)\"" + ">";
        if (DataGridUtils.applied != true) {
            var cellValue = Formater.unformat(DataGridUtils.options.dataList[$(this).closest("tr").index()], $(this).attr("id"));
            $(this).html(html);
            var $input = $(this).find('input:first-child');
            $input.val(cellValue);
            DataGridUtils.preCellValue = cellValue;
            // XP - IE8 에서 입력요소가 disable 되어 있거나 display: none 되어 있을때 focus 함수 호출하면 에러나는것 처리
        	try {
        		$input.focus();
        	} catch(e) {}
        }
        DataGridUtils.applied = true;
    },
    editableCellInputBlurEvent : function() {
        var dataList = DataGridUtils.options.dataList;
        var $cell = $(this).closest("td");
        if (StringUtils.trimToEmpty(DataGridUtils.preCellValue).trim() != $(this).val().trim()) {
            $cell.addClass("changedEditableCell");
            var rowIndex = -1;
            rowIndex = $cell.closest("tr").index();
            if (rowIndex > -1) {
                var rowDataSet = dataList[rowIndex];
                if (rowDataSet.rowStatus == null || (rowDataSet.rowStatus != null && rowDataSet.rowStatus != 'insert')) {
                    rowDataSet.rowStatus = "update";
                }
                rowDataSet[$cell.attr("id")] = this.value;
            }
            DataComponentObserver.getInstance().notify(DataGridUtils.options.container.dataGridComponent, rowIndex, $cell.attr("id"));
            rowIndex = -1;
        }
        if(DataGridUtils.options.escapeHTML) {
            $cell.text(Formater.format($cell, $(this).val()));
        } else {
            $cell.html(Formater.format($cell, $(this).val()));
        }

        DataGridUtils.applied = false;
        DataGridUtils.preCellValue = null;
        $cell = null;
    },
    /**
     * dataList 의 값을 바꾼다.
     */
    changeValue : function() {
        var dataList = DataGridUtils.options.dataList;
        $cell = $(this).parent();
        $cell.addClass("changedEditableCell");
        var rowIndex = -1;
        rowIndex = $cell.closest("tr").index();
        if (rowIndex > -1) {
            var rowDataSet = dataList[rowIndex];
            if (rowDataSet.rowStatus == null || (rowDataSet.rowStatus != null && rowDataSet.rowStatus != 'insert')) {
                rowDataSet.rowStatus = "update";
            }
            if ($(this).is("input[type='checkbox']")) {
                var $checkBoxs = $(this).parent().find("input[type='checkbox'][name='" + $(this).attr("name") + "']");
                var rValue = null;
                if ($checkBoxs.length == 1) {
                    rValue = SystemUtils.getSingleCheckboxValue($(this), null);
                } else {
                    rValue = SystemUtils.getMultyValues($checkBoxs);
                }
                rowDataSet[$cell.attr("id")] = rValue;
                rValue = null;
            } else {
                rowDataSet[$cell.attr("id")] = $(this).val();
            }
        }
        rowIndex = -1;
        DataComponentObserver.getInstance().notify(DataGridUtils.options.container.dataGridComponent);
    },
    /**
     * rowSpan처리 : 데이터가 같더라도 앞컬럼이 rowSpan 이 풀리면 현재셀도 같이 풀림
     *
     * @param container
     * @param colIdx
     */
    rowSpan : function(container, colIdx) {
        return container.each(function() {
            var that = null;
            var $ltd = null;
            var $td = null;
            var rowSpan;
            var lCellOpts = null;
            var secondMergeField = false;
            $('tr', this).each(function(row) {
                if (colIdx > 0) {
                    $ltd = $('td:eq(' + (colIdx - 1) + ')', this).not("[style*='display'][style*='none']");
                    if (lCellOpts == null) {
                        lCellOpts = SystemUtils.getClassOpts($ltd);
                    }
                }
                $td = $('td:eq(' + colIdx + ')', this).not("[style*='display'][style*='none']");
                $td.each(function(col) {
                    if (colIdx > 0 && lCellOpts != null && lCellOpts.rowSpan != undefined && lCellOpts.rowSpan == true) {
                        secondMergeField = $(this).html() == $(that).html() && $ltd.length == 0;
                    } else {
                        secondMergeField = $(this).html() == $(that).html();
                    }
                    if (secondMergeField) {
                        rowSpan = that.rowSpan;
                        if (typeof rowSpan == "undefined") {
                            that.rowSpan = 1;
                            rowSpan = that.rowSpan;
                        }
                        rowSpan += 1;
                        that.rowSpan = rowSpan;
                        $(this).attr("style", "display:none;");
                    } else {
                        that = this;
                    }
                    that = (that == null) ? this : that;
                });
            });
        });
    },
    getFieldSumValue : function($sourceElemet) {
        var currValue = 0;
        var sumArray = $.map($sourceElemet, function(element, n) {
            if($sourceElemet.is(":input")) {
                currValue += parseFloat(StringUtils.trimToZero($(element).val().replaceAll(",", "")));
            } else {
                currValue += parseFloat(StringUtils.trimToZero($(element).text().replaceAll(",", "")));
            }
            return parseFloat(currValue.toFixed(10));
        });
        return sumArray[sumArray.length-1];
    },
    getFieldAvrValue : function($sourceElemet) {
        var currValue = 0;
        var avrArray = $.map($sourceElemet, function(element, n) {
            if($sourceElemet.is(":input")) {
                currValue += parseFloat(StringUtils.trimToZero($(element).val().replaceAll(",", "")));
            } else {
                currValue += parseFloat(StringUtils.trimToZero($(element).text().replaceAll(",", "")));
            }
            return parseFloat((currValue.toFixed(10) / $sourceElemet.length).toFixed(10));
        });
        return avrArray[avrArray.length - 1];
    },
    fieldSum : function($sourceElement, $targetElement) {
        if(ArrayUtils.isEmpty($sourceElement)) {
            return 0;
        }
        if($targetElement != null) {
            if($targetElement.is(":input")) {
                $targetElement.val(this.getFieldSumValue($sourceElement));
            } else {
                $targetElement.text(this.getFieldSumValue($sourceElement));
            }
            $targetElement.format();
        } else {
            this.getFieldSumValue($sourceElement);
        }
    },
    fieldAvr : function($sourceElement, $targetElement) {
        if(ArrayUtils.isEmpty($sourceElement)) {
            return 0;
        }
        if($targetElement != null) {
            if($targetElement.is(":input")) {
                $targetElement.val(this.getFieldAvrValue($sourceElement));
            } else {
                $targetElement.text(this.getFieldAvrValue($sourceElement));
            }
            $targetElement.format();
        } else {
            this.getFieldAvrValue($sourceElement);
        }
    },
    getMaxCellCntByRow : function($element) {
        return Math.max.apply(null, $.map($element.find("tr"), function(el) {
            var cellCount = 0;
            $(el).find("td, th").each(function() {
                cellCount += StringUtils.trimToZero($(this).attr("colspan")) == "0" ? 1 : Number(StringUtils.trimToZero($(this).attr("colspan")));
            });
            return cellCount;
        }));
    }
};


/**
 * TreeComponent Interface class
 *
 * @param {} options
 */
var TreeComponent = function(options) {

    /**
     * 컴포넌트 옵션
     */
    this.options = null;
    /**
     * 컨테이너 요소를 반환 한다.
     */
    this.getContainer = function(selector) {
        throw new Error("must override getContainer method");
    };
    /**
     * 그리드에 JSON 데이터를 바인딩한다.
     */
    this.bindDataList = function(options) {
        throw new Error("must override bindDataList method");
    };
    /**
     * 새로 추가된 DataList만 가져온다.
     */
    this.getAddedDataList = function(options) {
        throw new Error("must override getAddedDataList method");
    };
    /**
     * 최종 수정된 DataList만 가져온다.
     */
    this.getEditedDataList = function(options) {
        throw new Error("must override getEditedDataList method");
    };
    /**
     * 최종 제거된 DataList만 가져온다.
     */
    this.getRemovedDataList = function(options) {
        throw new Error("must override getRomovedDataList method");
    };
    /**
     * 추가, 수정, 삭제된 모든 데이터 리스트를 가져온다.
     */
    this.getChangedAllDataList = function(options) {
        throw new Error("must override getRomovedDataList method");
    };
    /**
     * 선택한 노드의 Data를 가져온다.
     */
    this.getNodeData = function(options) {
        throw new Error("must override getCellData method");
    };
    /**
     * 선택한 로우의 지정한셀의 값을 가져온다.
     */
    this.getValue = function(options) {
        throw new Error("must override getCellData method");
    };
    /**
     * 선택한 로우의 지정한셀의 값을 지정한다.
     */
    this.setValue = function(options) {
        throw new Error("must override getCellData method");
    };

    /**
     * 화면에 표시된 DataList를 모두 가져온다.
     */
    this.getDataList = function(options) {
        throw new Error("must override getDataList method");
    };

    /**
     * 새로운 노드를 추가한다.
     */
    this.addNode = function(options) {
        throw new Error("must override addRow method");
    };

    /**
     * 선택한 노드를 제거한다.
     */
    this.removeNode = function(options) {
        throw new Error("must override removeRow method");
    };
    /**
     * 추가, 수정된 건에 대해서 데이터 검증을 실행한다. options에 rowIndex 값이 있으면 해당 row 만 검사한다.
     *
     * @returns Boolean - validate 성공 유무
     */
    this.validate = function(options) {
        throw new Error("must override validate method");
    };
    /**
     * 컴포넌트의 내용을 최신의 데이터로 변경한다.
     */
    this.update = function(rowIndex, fieldName) {
        throw new Error("must override update method");
    };

};

var Tree = function(options) {

    var defaultOptions = {
            container : null,
            dataList : null
        };

        this.options = SystemUtils.mergeOptions(defaultOptions, options);

        this.getContainer = function(selector) {
            return selector !== undefined ? this.options.container.find(selector) : this.options.container;
        };

        this.bindDataList = function(options) {
            var opts = SystemUtils.mergeOptions(this.options, options);
        };


    /**
     * 새로 추가된 DataList만 가져온다.
     */
    this.getAddedDataList = function(options) {
        throw new Error("must override getAddedDataList method");
    };
    /**
     * 최종 수정된 DataList만 가져온다.
     */
    this.getEditedDataList = function(options) {
        throw new Error("must override getEditedDataList method");
    };
    /**
     * 최종 제거된 DataList만 가져온다.
     */
    this.getRemovedDataList = function(options) {
        throw new Error("must override getRomovedDataList method");
    };
    /**
     * 추가, 수정, 삭제된 모든 데이터 리스트를 가져온다.
     */
    this.getChangedAllDataList = function(options) {
        throw new Error("must override getRomovedDataList method");
    };
    /**
     * 선택한 노드의 Data를 가져온다.
     */
    this.getNodeData = function(options) {
        throw new Error("must override getCellData method");
    };
    /**
     * 선택한 로우의 지정한셀의 값을 가져온다.
     */
    this.getValue = function(options) {
        throw new Error("must override getCellData method");
    };
    /**
     * 선택한 로우의 지정한셀의 값을 지정한다.
     */
    this.setValue = function(options) {
        throw new Error("must override getCellData method");
    };

    /**
     * 화면에 표시된 DataList를 모두 가져온다.
     */
    this.getDataList = function(options) {
        throw new Error("must override getDataList method");
    };

    /**
     * 새로운 노드를 추가한다.
     */
    this.addNode = function(options) {
        throw new Error("must override addRow method");
    };

    /**
     * 선택한 노드를 제거한다.
     */
    this.removeNode = function(options) {
        throw new Error("must override removeRow method");
    };
    /**
     * 추가, 수정된 건에 대해서 데이터 검증을 실행한다. options에 rowIndex 값이 있으면 해당 row 만 검사한다.
     *
     * @returns Boolean - validate 성공 유무
     */
    this.validate = function(options) {
        throw new Error("must override validate method");
    };
    /**
     * 컴포넌트의 내용을 최신의 데이터로 변경한다.
     */
    this.update = function(rowIndex, fieldName) {
        throw new Error("must override update method");
    };

};