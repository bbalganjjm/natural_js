/*!
 * Natural-TEMPLATE v0.3.11
 *
 * Released under the LGPL v2.1 license
 * Date: 2019-02-28T18:00Z
 *
 * Copyright 2023 KIM HWANG MAN(bbalganjjm@gmail.com)
 */
(function(window, $) {
    N.version["Natural-TEMPLATE"] = "0.3.11";

    (function(N) {

        var TEMPLATE = N.template = {
            design : {
                material : function(callback) {
                    // Polyfill
                    if (!String.prototype.includes) {
                        Object.defineProperty(String.prototype, "includes", {
                            enumerable: false,
                            writable: true,
                            value: function(search, start) {
                                'use strict';
                                if (typeof start !== 'number') {
                                    start = 0;
                                }

                                if (start + search.length > this.length) {
                                    return false;
                                } else {
                                    return this.indexOf(search, start) !== -1;
                                }
                            }
                        });
                    }
                    if (!Array.prototype.includes) {
                        Object.defineProperty(Array.prototype, "includes", {
                            enumerable: false,
                            writable: true,
                            value: function(searchElement /*, fromIndex*/ ) {
                                'use strict';
                                var O = Object(this);
                                var len = parseInt(O.length) || 0;
                                if (len === 0) {
                                    return false;
                                }
                                var n = parseInt(arguments[1]) || 0;
                                var k;
                                if (n >= 0) {
                                    k = n;
                                } else {
                                    k = len + n;
                                    if (k < 0) {k = 0;}
                                }
                                var currentElement;
                                while (k < len) {
                                    currentElement = O[k];
                                    if (searchElement === currentElement ||
                                        (searchElement !== searchElement && currentElement !== currentElement)) { // NaN !== NaN
                                            return true;
                                        }
                                        k++;
                                }
                                return false;
                            }
                        });
                    }

                    // Load libraries
                    $.getScript("js/natural_js/lib/material/material-components-web.min.js").done(function(data, textStatus, jqxhr) {
                        $("<link/>", {
                            rel: "stylesheet",
                            type: "text/css",
                            href: "js/natural_js/css/natural.ui." + N.context.attr("template").design + ".css"
                        }).appendTo("head");
                        $("<link/>", {
                            rel: "stylesheet",
                            type: "text/css",
                            href: "css/common." + N.context.attr("template").design + ".css"
                        }).appendTo("head");
                        // Load Material Design Libraries.
                        $("<link/>", {
                            rel: "stylesheet",
                            type: "text/css",
                            href: "js/natural_js/lib/material/icon" + (N.browser.is("ie") ? "_ie" : "") + ".css"
                        }).appendTo("head");
                        $("<link/>", {
                            rel: "stylesheet",
                            type: "text/css",
                            href: "js/natural_js/lib/material/material-components-web.min.css"
                        }).appendTo("head");

                        // Disable mouse related events of N.button.
                        if(N.context.attr("ui").button === undefined) {
                            N.context.attr("ui").button = {};
                        }
                        N.context.attr("ui").button.customStyle = true;
                        // Alert, Popup
                        N.context.attr("ui").alert.onBeforeShow = N.context.attr("ui").popup.onBeforeShow = TEMPLATE.aop.design.material.onBeforeShow;

                        callback();
                    }).fail(function(data) {
                        N.log(data);
                        N.context.attr("template").design = undefined;
                        callback();
                    });
                }
            },
            aop : {
                design : {
                    /**
                     * Material Design
                     */
                    material : {
                        init : function(cont, isAfterCompInited) {
                            if(isAfterCompInited) {
                                this.button(cont);
                                this.textfield(cont);
                                this.select(cont);
                            } else {
                                this.iconButton(cont);
                                this.list(cont);
                            }
                        },
                        /**
                         * Button style classes : mdc-button__ripple | mdc-button--outlined | mdc-button--raised
                         */
                        button : function(cont) {
                            N('.mdc-button', cont.view).each(function(i, el) {
                                el.className = N.string.trimToEmpty(el.className.replace(/btn_.*?__/g, ""));
                                var icon = el.getAttribute('data-icon');
                                var html = '<div class="mdc-button__ripple"></div>';
                                if(icon) {
                                    icon = '<span class="material-icons mdc-icon-button__icon">' + icon + '</span>';
                                    if(N.string.trimToEmpty(el.innerText).length > 0) {
                                        icon += "&nbsp;";
                                    }
                                    html += icon;
                                }
                                if(N.string.trimToEmpty(el.innerText).length > 0) {
                                    html += ('<span class="mdc-button__label">' + el.innerText + '</span>');
                                }

                                el.innerHTML = html;
                                mdc.ripple.MDCRipple.attachTo(el);
                            });
                        },
                        /**
                         * Button style classes : mdc-button__ripple | mdc-button--outlined | mdc-button--raised
                         */
                        iconButton : function(cont) {
                            N('.mdc-icon-button', cont.view).each(function(i, el) {
                                el.className = "material-icons mdc-ripple-upgraded--unbounded mdc-ripple-upgraded " + N.string.trimToEmpty(el.className.replace(/btn_.*?__/g, ""));
                                const iconButtonRipple = mdc.ripple.MDCRipple.attachTo(el);
                                iconButtonRipple.unbounded = true;
                            });
                        },
                        onBeforeShow : function(msgContext, msgContents) {
                            if(this.options.isInput) {
                                return false;
                            }
                            if(this.options.title !== undefined) {
                                msgContents.find(".msg_box__").css("padding-top", 0);
                            }
                            msgContents.find(".buttonBox__ .button__").each(function(i, el) {
                                el.className = "mdc-button " + N.string.trimToEmpty(el.className.replace(/btn_.*?__/g, ""));
                                var icon = el.getAttribute('data-icon');
                                if(icon) {
                                    icon = '<span class="material-icons mdc-icon-button__icon">' + icon + '</span>&nbsp;';
                                } else {
                                    icon = "";
                                }
                                el.innerHTML = '<div class="mdc-button__ripple"></div>' + icon + '<span class="mdc-button__label">' + el.innerText + '</span>';

                                mdc.ripple.MDCRipple.attachTo(el);
                            });
                        },
                        textfield : function(cont) { // textarea, input
                            N('.mdc-text-field', cont.view).each(function(i, el) {
                                el = $(el);
                                var id = el.attr("id");
                                var label = el.data("label");
                                var uid = String(Math.random()).replace("0.", "");
                                var isNoLabel = el.data("nolabel") ? el.data("nolabel") : false;

                                var mdcTextField;
                                if(el.is("textarea")) {
                                    el.addClass("mdc-text-field__input").removeClass("mdc-text-field");
                                    el.attr("aria-label", label);

                                    if(el.data("type") === "outlined") { // filled | outlined
                                        mdcTextField = el.wrap('<span class="mdc-text-field__resizer"></span>').parent();
                                        mdcTextField = mdcTextField.wrap('<label class="mdc-text-field mdc-text-field--outlined mdc-text-field--textarea' + (isNoLabel ? ' mdc-text-field--no-label' : '') + '"></label>').parent();
                                        mdcTextField.prepend('<span class="mdc-notched-outline">'
                                            + '<span class="mdc-notched-outline__leading"></span>'
                                            + '<span class="mdc-notched-outline__notch">'
                                            + (!isNoLabel ? '<span class="mdc-floating-label" id="' + id + '-label-' + uid + '">' + label +'</span>' : '')
                                            + '</span>'
                                            + '<span class="mdc-notched-outline__trailing"></span>'
                                        + '</span>');
                                    } else {
                                        mdcTextField = el.wrap('<span class="mdc-text-field__resizer"></span>').parent();
                                        mdcTextField = mdcTextField.wrap('<label class="mdc-text-field mdc-text-field--filled mdc-text-field--textarea' + (isNoLabel ? ' mdc-text-field--no-label' : '') + '"></label>').parent();
                                        mdcTextField.prepend('<span class="mdc-floating-label" id="' + id + '-label-' + uid + '">' + label +'</span>');
                                        mdcTextField.prepend('<span class="mdc-text-field__ripple"></span>');
                                        mdcTextField.append('<span class="mdc-line-ripple"></span>');
                                    }
                                } else {
                                    el.css({
                                        "padding": "0",
                                        "border": "none"
                                    });

                                    el.addClass("mdc-text-field__input").removeClass("mdc-text-field");
                                    el.attr("aria-labelledby", id + "-label-" + uid);

                                    if(el.data("type") === "outlined") { // filled | outlined
                                        mdcTextField = el.wrap('<label class="mdc-text-field mdc-text-field--outlined' + (isNoLabel ? ' mdc-text-field--no-label' : '') + '"></label>').parent();
                                        mdcTextField.prepend('<span class="mdc-notched-outline">'
                                            + '<span class="mdc-notched-outline__leading"></span>'
                                            + '<span class="mdc-notched-outline__notch">'
                                                + (!isNoLabel ? '<span class="mdc-floating-label" id="' + id + '-label-' + uid + '">' + label +'</span>' : '')
                                            + '</span>'
                                            + '<span class="mdc-notched-outline__trailing"></span>'
                                        + '</span>');
                                    } else {
                                        mdcTextField = el.wrap('<label class="mdc-text-field mdc-text-field--filled' + (isNoLabel ? ' mdc-text-field--no-label' : '') + '"></label>').parent();
                                        if(!isNoLabel) {
                                            mdcTextField.prepend('<span class="mdc-floating-label" id="' + id + '-label-' + uid + '">' + label +'</span>');
                                        }
                                        mdcTextField.prepend('<span class="mdc-text-field__ripple"></span>');
                                        mdcTextField.append('<span class="mdc-line-ripple"></span>');
                                    }
                                    var btnId = el.data("btnid");
                                    var btnIdAttr = "";
                                    if(btnId) {
                                        btnIdAttr = ' id="' + btnId + '"';
                                    }
                                    if(el.data("trailingicon")) {
                                        mdcTextField.addClass("mdc-text-field--with-trailing-icon");
                                        el.after('<i' + btnIdAttr + ' class="material-icons mdc-text-field__icon mdc-text-field__icon--leading" tabindex="0" role="button">' + el.data("trailingicon") + '</i>');
                                    } else if(el.data("format") && el.data("format")[0] && el.data("format")[0][0] === "date") {
                                        mdcTextField.addClass("mdc-text-field--with-trailing-icon");
                                        var btn = N('<i class="material-icons mdc-text-field__icon mdc-text-field__icon--leading" tabindex="0" role="button">date_range</i>');
                                        btn.on("click.material.textfield.trailing.icon", function(e) {
                                            e.preventDefault();
                                            var dpInst = el.instance("datepicker");
                                            el.trigger("focusin.datepicker");
                                        });
                                        el.after(btn);
                                    }
                                    if(el.data("leadingicon")) {
                                        mdcTextField.addClass("mdc-text-field--with-leading-icon");
                                        el.before('<i' + btnIdAttr + ' class="material-icons mdc-text-field__icon mdc-text-field__icon--trailing" tabindex="0" role="button">' + el.data("leadingicon") + '</i>');
                                    }
                                    if(btnId) {
                                        cont["e." + btnId + ".click"] = N("#" + btnId, cont.view).on("click", cont["e." + btnId + ".click"]);
                                    }
                                }
                                el.data("md_textfield_inst", mdc.textField.MDCTextField.attachTo(mdcTextField.get(0)));
                            });
                        },
                        select : function(cont) {
                            N('.mdc-njs-select', cont.view).each(function(i, el) {
                                el = N(el);
                                el.attr("required", true);
                                var mdcNjsSelect = el.wrap('<div class="mdc-njs-select-wrap"></div>').parent();
                                mdcNjsSelect.append('<span class="mdc-njs-select-highlight"></span>');
                                mdcNjsSelect.append('<span class="mdc-njs-select-bar"></span>');
                                mdcNjsSelect.append('<label class="mdc-njs-select-label">' + el.data("label") + '</label>');
                            });
                        },
                        list : function(cont) {
                            N('.mdc-list', cont.view).each(function(i, el) {
                                el = N(el);
                                if(el.is("ul")) {
                                    var liEl = el.find("li").addClass("mdc-list-item");
                                    liEl.prepend('<span class="mdc-list-item__ripple"></span>');
                                    liEl.find("[id]").addClass("mdc-list-item__text");
                                    // mdc.list.MDCList.attachTo(this);
                                    // mdc.ripple.MDCRipple.attachTo(liEl.get(0)); // Clone된 요소는 ripple 적용 안됨.
                                }
                            });
                        }
                    }
                },
                codes : function(cont, joinPoint, opts) {
                    var options = {
                        codeUrl : null,
                        codeKey : null
                    }

                    try {
                        $.extend(true, options, N.context.attr("template").aop.codes);
                    } catch (e) {
                        throw N.error("N.tab", e);
                    }

                    $.extend(true, options, opts);

                    var codeList = [];
                    var commList = [];
                    var selectList = [];
                    for(var prop in cont) {
                        if(N.type(prop) === "string" && N.string.startsWith(prop, "p.select.")) {
                            // When the parameter is an array.
                            if(N.type(cont[prop]) === "array" && cont[prop].length > 0) {
                                if(cont[prop].length > 2) {
                                    cont[prop] = {
                                        "comm" : cont[prop][0],
                                        "key" : cont[prop][1],
                                        "val" : cont[prop][2],
                                        "filter" : cont[prop][3]
                                    };
                                } else {
                                    cont[prop] = {
                                        "code" : cont[prop][0],
                                        "filter" : cont[prop][1]
                                    };
                                }
                            }

                            if(cont[prop].code) {
                                codeList.push(prop.split(".")[2] + "|" + cont[prop].code);
                            } else if(cont[prop].comm) {
                                commList.push(prop.split(".")[2] + "|" + cont[prop].comm);
                            } else {
                                selectList.push(prop.split(".")[2] + "|select__");
                            }
                        }
                    }

                    if(selectList.length > 0) {
                        N(selectList).each(function(i, selectStr) {
                            var selectInfoArr = selectStr.split("|");
                            var opts = cont["p.select." + selectInfoArr[0]];

                            if(opts.data) {
                                cont["p.select." + selectInfoArr[0]] = N("[id='" + selectInfoArr[0] + "']", cont.view)
                                .filter("select,input[type='checkbox'],input[type='radio']")
                                .map(function(i, ele) {
                                    opts.context = ele;
                                    if(opts.filter) {
                                        opts.data = opts.filter(opts.data);
                                    }
                                    var select = N().select(opts).bind();
                                    if(opts.selected) {
                                        select.val(opts.selected);
                                    }
                                    return select;
                                }).get();
                            } else {
                                throw N.error(N.message.get(N.context.attr("template").message, "MSG-0001"));
                            }
                        });
                    }

                    if(codeList.length > 0 || commList.length > 0) {
                        var xhrs = [];

                        // Common code list
                        if(codeList.length > 0) {
                            var codeParam = N(codeList).map(function(i, codeInfo) {
                                return codeInfo.split("|")[1];
                            }).get();
                            xhrs.push(N({
                                codes : codeParam != null && codeParam.length === 0 ? undefined : codeParam
                            }).comm({
                                url : options.codeUrl
                            }).submit(function(data) {
                                N(codeList).each(function(i, codeInfo) {
                                    var codeInfoArr = codeInfo.split("|");
                                    var opts = cont["p.select." + codeInfoArr[0]];
                                    cont["p.select." + codeInfoArr[0]] = N("[id='" + codeInfoArr[0] + "']", cont.view)
                                    .filter("select,input[type='checkbox'],input[type='radio']")
                                    .map(function(i, ele) {
                                        opts.context = ele;
                                        var selData = $.grep(data, function(d) {
                                            return d[options.codeKey] === codeInfoArr[1];
                                        });
                                        var select = N(opts.filter ? opts.filter(selData) : selData).select(opts).bind();
                                        if(opts.selected) {
                                            select.val(opts.selected);
                                        }
                                        return select;
                                    }).get();
                                });
                            }).error(function(e) {
                                N.warn(e);
                                throw N.error(N.message.get(N.context.attr("template").message, "MSG-0002"));
                            }).request.obj.xhr);
                        }

                        // Data code list
                        N(commList).each(function(i, commStr) {
                            var codeInfoArr = commStr.split("|");

                            if(!cont[codeInfoArr[1]]) {
                                throw N.error(N.message.get(N.context.attr("template").message, "MSG-0003", [ codeInfoArr[1] ]));
                            }

                            xhrs.push(cont[codeInfoArr[1]]().submit(function(data) {
                                var opts = cont["p.select." + codeInfoArr[0]];
                                cont["p.select." + codeInfoArr[0]] = N("[id='" + codeInfoArr[0] + "']", cont.view)
                                .filter("select,input[type='checkbox'],input[type='radio']")
                                .map(function(i, ele) {
                                    opts.context = ele;
                                    var select = N(opts.filter ? opts.filter(data) : data).select(opts).bind();
                                    if(opts.selected) {
                                        select.val(opts.selected);
                                    }
                                    return select;
                                }).get();
                            }).error(function(e) {
                                N.warn(e);
                                throw N.error(N.message.get(N.context.attr("template").message, "MSG-0004", [ codeInfoArr[0] ]));
                            }).request.obj.xhr);
                        });

                        $.when.apply($, xhrs).done(function() {
                            TEMPLATE.aop.template(cont, joinPoint);
                        });
                    } else {
                        TEMPLATE.aop.template(cont, joinPoint);
                    }
                },
                template : function(cont, joinPoint) {
                    if(N.context.attr("template").design) {
                        TEMPLATE.aop.design[N.context.attr("template").design].init(cont);
                    }

                    var compActionDefer = [];
                    for(var prop in cont) {
                        if(N.type(prop) === "string" && N.string.startsWith(prop, "p.")) {
                            TEMPLATE.aop.components(cont, prop, compActionDefer);
                        }
                    }
                    for(var prop in cont) {
                        if(N.type(prop) === "string" && N.string.startsWith(prop, "e.")) {
                            TEMPLATE.aop.events(cont, prop);
                        }
                    }

                    if(N.context.attr("template").design) {
                        TEMPLATE.aop.design[N.context.attr("template").design].init(cont, true);
                    }

                    if(compActionDefer.length > 0) {
                        $(compActionDefer).each(function() {
                            this.resolve();
                        });
                        compActionDefer = undefined;
                    }

                    joinPoint.proceed();

                    // In order to run onOpen after a delayed init is executed in a popup or tab.
                    setTimeout(function() {
                        if(cont.onOpenDefer) {
                            cont.onOpenDefer.resolve();
                        }
                    }, 0);
                },
                components : function(cont, prop, compActionDefer) {
                    var props = prop.split("."); // props[1] : Component name, props[2] : Component id
                    if(props.length > 2) {
                        var comp = "p." + props[1] + "." + props[2];
                        var contextEle = N("#" + props[2], cont.view);
                        var opts = cont[comp];
                        if(opts !== undefined && opts.context !== undefined) {
                            contextEle = N(opts.context, cont.view);
                        }

                        // Common file popup
                        if(props[1] === "popup" && props[2] === "file") {
                            opts.url = "file/manager.view";
                            opts.top = 20;
                            opts.onOpen = "onOpen";
                            opts.overlayClose = false;
                            opts.escClose = false;
                        }

                        if (opts !== undefined && (!(contextEle.length === 0 && opts.context === undefined) || !(contextEle.length === 0 && opts.url === undefined))) {
                            opts.context = contextEle;
                            if(props[1] === "button" || props[1] === "popup" || props[1] === "tab" || props[1] === "datepicker") {
                                if((opts.url && props[1] === "popup") || props[1] === "tab") {
                                    if(opts.opener === undefined) {
                                        opts.opener = cont;
                                    }
                                }
                                cont[comp] = opts.context[props[1]](opts);
                            } else {
                                if(props[1] !== "select" && !opts.code) {
                                    cont[comp] = N([])[props[1]](opts);
                                }
                            }

                            if(opts.usage) {
                                var usageOptions = {
                                    "search-box" : {
                                        "defaultButton" : ".btn-search",
                                        "events" : []
                                    }
                                };

                                if(N.type(opts.usage) === "object") {
                                    $.extend(true, usageOptions, opts.usage);
                                }

                                // search-box
                                if(opts.usage === "search-box" || usageOptions["search-box"] !== undefined) {
                                    opts.context.addClass("search_box__");
                                    if(opts.action === undefined || opts.action !== "add") {
                                        cont[comp].add();
                                    }

                                    var targets = [];
                                    var events = usageOptions["search-box"].events;
                                    if(events.length > 0) {
                                        $(events).each(function() {
                                            targets.push(this.target);
                                            opts.context.find(this.target).on(this.event + "." + cont.view.data("pageid"), this.handler);
                                        });
                                    }

                                    opts.context.on("keyup." + cont.view.data("pageid"), ":input:not(" + targets.join(",") + ")", function(e) {
                                        var keyCode = e.keyCode ? e.keyCode : (e.which ? e.which : e.charCode);
                                        if (keyCode == 13) { // enter key
                                            cont.view.find(usageOptions["search-box"].defaultButton).trigger("click");
                                        }
                                    });

                                    if(N.browser.is("ie")) {
                                        opts.context.on("keyup." + cont.view.data("pageid"), ":input", function(e) {
                                            var keyCode = e.keyCode ? e.keyCode : (e.which ? e.which : e.charCode);
                                            if (keyCode == 13) { // enter key
                                                this.blur();
                                            }
                                        });
                                    }
                                }
                            }

                            if(opts.action) {
                                compActionDefer.push($.Deferred().done(function() {
                                    if(N.type(opts.action) === "string") {
                                        cont[comp][opts.action]();
                                    } else if(N.type(opts.action) === "array" && opts.action.length > 1) {
                                        cont[comp][opts.action[0]].apply(cont[comp], opts.action.splice(1));
                                    }
                                }));
                            }
                        } else {
                            throw N.error(N.message.get(N.context.attr("template").message, "MSG-0005", [ cont.view.data("pageid") + ":" + prop ]));
                        }
                    } else {
                        throw N.error(N.message.get(N.context.attr("template").message, "MSG-0005", [ cont.view.data("pageid") + ":" + prop ]));
                    }
                },
                events : function(cont, prop) {
                    var props = prop.split(".");
                    if(props.length > 2) {
                        var targetProp;
                        var handler;
                        var eventName = props[2];
                        var idSelector = "";
                        if(typeof cont[prop] === "function") {
                            targetProp = props[1];
                            handler = cont[prop];
                            idSelector = "#";
                        } else if(N.type(cont[prop]) === "object") {
                            targetProp = cont[prop].target;
                            handler = cont[prop].handler;
                        } else {
                            throw N.error(N.message.get(N.context.attr("template").message, "MSG-0006", [ cont.view.data("pageid") + ":" + prop ]));
                        }

                        var targetEle = N(idSelector + targetProp, cont.view);

                        if(targetEle.length > 0) {
                            var listCompEle = targetEle.closest(".list__, .grid__");

                            var compInst;
                            if(listCompEle.length > 0 && targetEle.closest("header").length === 0) {
                                if(listCompEle.hasClass("list__")) {
                                    compInst = listCompEle.instance("list");
                                } else if(listCompEle.hasClass("grid__")) {
                                    compInst = listCompEle.instance("grid");
                                }

                                if(compInst) {
                                    targetEle = compInst.tempRowEle.find(idSelector + targetProp);

                                    // If the target element is a checkbox or radio, the element is imported by name selector.(#eleId -> [name='eleId']).
                                    if(targetEle.is(":radio, :checkbox") && N("[name='" + targetProp + "']", compInst.tempRowEle).length > 1) {
                                        targetEle = N("[name='" + targetProp + "']", compInst.tempRowEle);
                                    }
                                }
                            } else {
                                // If the target element is a checkbox or radio, the element is imported by name selector.(#eleId -> [name='eleId']).
                                if(targetEle.is(":radio, :checkbox") && N("[name='" + targetProp + "']", cont.view).length > 1) {
                                    targetEle = N("[name='" + targetProp + "']", cont.view);
                                }
                            }

                            // If the target element is a button element(a, button, input[type=button]), the N.button component is automatically applied.
                            if(targetEle.is("a, button, input[type=button]")) {
                                targetEle.button();
                            } else {
                                if(eventName && eventName.indexOf("click") > -1) {
                                    targetEle.css("cursor", "pointer");
                                }
                            }

                            if(compInst) {
                                var targetStr;
                                if(targetEle.is(":radio") || (targetEle.is(":checkbox") && targetEle.length > 1)) {
                                    targetStr = ">.form__ [name='" + targetProp + "']:radio, >.form__ [name='" + targetProp + "']:checkbox";
                                } else {
                                    targetStr = ">.form__ " + idSelector + targetProp;
                                }

                                cont[prop] = listCompEle.on(eventName + "." + cont.view.data("pageid"), targetStr, function() {
                                    var args = Array.apply(null, arguments);
                                    args.push(listCompEle.find(">.form__").index($(this).closest(".form__")));
                                    handler.apply(this, args);
                                });
                            } else {
                                cont[prop] = targetEle.on(eventName + "." + cont.view.data("pageid"), handler);
                            }
                        }
                    } else {
                        throw N.error(N.message.get(N.context.attr("template").message, "MSG-0006", [ cont.view.data("pageid") + ":" + prop ]));
                    }
                }
            }
        };

    })(N);

})(window, jQuery);