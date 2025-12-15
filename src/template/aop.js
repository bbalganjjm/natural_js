/**
 * Natural-JS Template
 * Full version from natural.template.js lines 19-390
 */

import { error as createError, warn, log } from '../core/helpers/logger.js';
import { type as getType, isPlainObject, isString, isEmptyObject } from '../core/helpers/type-checker.js';
import { StringUtils } from '../core/utils/string.js';
import { ElementUtils } from '../core/utils/element.js';
import { BrowserUtils } from '../core/utils/browser.js';
import { Context } from '../architecture/context/context.js';
import { Controller } from '../architecture/controller/controller.js';
import { Communicator } from '../architecture/communication/communicator.js';
import { Formatter } from '../data/formatter/formatter.js';

export class Template {

        static codes = function(cont, joinPoint) {
            const options = {
                codeUrl : null,
                codeKey : null
            }
            try {
                jQuery.extend(true, options, Context.attr("template").aop.codes);
            } catch (e) {
                throw createError("Template.codes", e);
            }

            const codeList = [];
            const commList = [];
            const selectList = [];
            for(const prop in cont) {
                if(getType(prop) === "string" && StringUtils.startsWith(prop, "p.select.")) {
                    // When the parameter is an array.
                    if(getType(cont[prop]) === "array" && cont[prop].length > 0) {
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
                jQuery(selectList).each(function(i, selectStr) {
                    const selectInfoArr = selectStr.split("|");
                    const opts = cont["p.select." + selectInfoArr[0]];

                    if(opts.data) {
                        cont["p.select." + selectInfoArr[0]] = jQuery("[id='" + selectInfoArr[0] + "']", cont.view)
                            .filter("select,input[type='checkbox'],input[type='radio']")
                            .map(function(i, ele) {
                                opts.context = ele;
                                if(opts.filter) {
                                    opts.data = opts.filter(opts.data);
                                }
                                const select = jQuery().select(opts).bind();
                                if(opts.selected) {
                                    select.val(opts.selected);
                                }
                                return select;
                            }).get();
                    } else {
                        throw createError(NC.message.get(Context.attr("template").message, "MSG-0001"));
                    }
                });
            }

            if(codeList.length > 0 || commList.length > 0) {
                const xhrs = [];

                // Common code list
                if(codeList.length > 0) {
                    const codeParam = jQuery(codeList).map(function(i, codeInfo) {
                        return codeInfo.split("|")[1];
                    }).get();
                    xhrs.push(jQuery({
                        codes : codeParam != null && codeParam.length === 0 ? undefined : codeParam
                    }).comm({
                        url : options.codeUrl
                    }).submit(function(data) {
                        jQuery(codeList).each(function(i, codeInfo) {
                            const codeInfoArr = codeInfo.split("|");
                            const opts = cont["p.select." + codeInfoArr[0]];
                            cont["p.select." + codeInfoArr[0]] = jQuery("[id='" + codeInfoArr[0] + "']", cont.view)
                                .filter("select,input[type='checkbox'],input[type='radio']")
                                .map(function(i, ele) {
                                    opts.context = ele;
                                    const selData = jQuery.grep(data, function(d) {
                                        return d[options.codeKey] === codeInfoArr[1];
                                    });
                                    const select = jQuery(opts.filter ? opts.filter(selData) : selData).select(opts).bind();
                                    if(opts.selected) {
                                        select.val(opts.selected);
                                    }
                                    return select;
                                }).get();
                        });
                    }).error(function(e) {
                        warn(e);
                        throw createError(NC.message.get(Context.attr("template").message, "MSG-0002"));
                    }).request.obj.xhr);
                }

                // Data code list
                jQuery(commList).each(function(i, commStr) {
                    const codeInfoArr = commStr.split("|");

                    if(!cont[codeInfoArr[1]]) {
                        throw createError(NC.message.get(Context.attr("template").message, "MSG-0003", [ codeInfoArr[1] ]));
                    }

                    xhrs.push(cont[codeInfoArr[1]]().submit(function(data) {
                        const opts = cont["p.select." + codeInfoArr[0]];
                        cont["p.select." + codeInfoArr[0]] = jQuery("[id='" + codeInfoArr[0] + "']", cont.view)
                            .filter("select,input[type='checkbox'],input[type='radio']")
                            .map(function(i, ele) {
                                opts.context = ele;
                                const select = jQuery(opts.filter ? opts.filter(data) : data).select(opts).bind();
                                if(opts.selected) {
                                    select.val(opts.selected);
                                }
                                return select;
                            }).get();
                    }).error(function(e) {
                        warn(e);
                        throw createError(NC.message.get(Context.attr("template").message, "MSG-0004", [ codeInfoArr[0] ]));
                    }).request.obj.xhr);
                });

                jQuery.when.apply($, xhrs).done(function() {
                    Template.template(cont, joinPoint);
                });
            } else {
                Template.template(cont, joinPoint);
            }
        };

        static template = function(cont, joinPoint) {
            const options = {
                onBeforeInitComponents : null,
                onInitComponents : null,
                onBeforeInitEvents : null,
                onInitEvents : null
            }
            try {
                jQuery.extend(true, options, Context.attr("template").aop.template);
            } catch (e) {
                throw createError("Template.template", e);
            }

            if (options.onBeforeInitComponents) {
                options.onBeforeInitComponents.call(this, cont, joinPoint);
            }

            const compActionDefer = [];
            for(const prop in cont) {
                if(getType(prop) === "string" && StringUtils.startsWith(prop, "p.")) {
                    Template.components(cont, prop, compActionDefer);
                }
            }

            if (options.onBeforeInitEvents) {
                options.onBeforeInitEvents.call(this, cont, joinPoint);
            }

            for(const prop in cont) {
                if(getType(prop) === "string" && StringUtils.startsWith(prop, "e.")) {
                    Template.events(cont, prop);
                }
            }

            if (options.onInitEvents) {
                options.onInitEvents.call(this, cont, joinPoint);
            }

            if(compActionDefer.length > 0) {
                jQuery(compActionDefer).each(function() {
                    this.resolve();
                    if (options.onInitComponents) {
                        options.onInitComponents.call(this, cont, joinPoint);
                    }
                });
            }

            joinPoint.proceed();

            // In order to run onOpen after a delayed init is executed in a popup or tab.
            setTimeout(function() {
                if(cont.onOpenDefer) {
                    cont.onOpenDefer.resolve();
                }
            }, 0);
        };

        static components = function(cont, prop, compActionDefer) {
            const props = prop.split("."); // props[1] : Component name, props[2] : Component id
            if(props.length > 2) {
                const comp = "p." + props[1] + "." + props[2];
                let contextEle = jQuery("#" + props[2], cont.view);
                const opts = cont[comp];
                if(opts !== undefined && opts.context !== undefined) {
                    contextEle = jQuery(opts.context, cont.view);
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
                            cont[comp] = jQuery([])[props[1]](opts);
                        }
                    }

                    if(opts.usage) {
                        const usageOptions = {
                            "search-box" : {
                                "defaultButton" : ".btn-search",
                                "events" : []
                            }
                        };

                        if(getType(opts.usage) === "object") {
                            jQuery.extend(true, usageOptions, opts.usage);
                        }

                        // search-box
                        if(opts.usage === "search-box" || usageOptions["search-box"] !== undefined) {
                            opts.context.addClass("search_box__");
                            if(opts.action === undefined || opts.action !== "add") {
                                cont[comp].add();
                            }

                            const targets = [];
                            const events = usageOptions["search-box"].events;
                            if(events.length > 0) {
                                jQuery(events).each(function() {
                                    targets.push(this.target);
                                    opts.context.find(this.target).on(this.event + "." + cont.view.data("pageid"), this.handler);
                                });
                            }

                            opts.context.on("keyup." + cont.view.data("pageid"), ":input:not(" + targets.join(",") + ")", function(e) {
                                const keyCode = e.keyCode ? e.keyCode : (e.which ? e.which : e.charCode);
                                if (keyCode === 13) { // enter key
                                    cont.view.find(usageOptions["search-box"].defaultButton).trigger("click");
                                }
                            });

                            if(BrowserUtils.is("ie")) {
                                opts.context.on("keyup." + cont.view.data("pageid"), ":input", function(e) {
                                    const keyCode = e.keyCode ? e.keyCode : (e.which ? e.which : e.charCode);
                                    if (keyCode === 13) { // enter key
                                        this.blur();
                                    }
                                });
                            }
                        }
                    }

                    if(opts.action) {
                        compActionDefer.push(jQuery.Deferred().done(function() {
                            if(getType(opts.action) === "string") {
                                cont[comp][opts.action]();
                            } else if(getType(opts.action) === "array" && opts.action.length > 1) {
                                cont[comp][opts.action[0]].apply(cont[comp], opts.action.splice(1));
                            }
                        }));
                    }
                } else {
                    throw createError(NC.message.get(Context.attr("template").message, "MSG-0005", [ cont.view.data("pageid") + ":" + prop ]));
                }
            } else {
                throw createError(NC.message.get(Context.attr("template").message, "MSG-0005", [ cont.view.data("pageid") + ":" + prop ]));
            }
        };

        static events = function(cont, prop) {
            const props = prop.split(".");
            if(props.length > 2) {
                let targetProp;
                let handler;
                const eventName = props[2];
                let idSelector = "";
                if(typeof cont[prop] === "function") {
                    targetProp = props[1];
                    handler = cont[prop];
                    idSelector = "#";
                } else if(getType(cont[prop]) === "object") {
                    targetProp = cont[prop].target;
                    handler = cont[prop].handler;
                } else {
                    throw createError(NC.message.get(Context.attr("template").message, "MSG-0006", [ cont.view.data("pageid") + ":" + prop ]));
                }

                let targetEle = jQuery(idSelector + targetProp, cont.view);

                if(targetEle.length > 0) {
                    const listCompEle = targetEle.closest(".list__, .grid__");

                    let compInst;
                    if(listCompEle.length > 0 && targetEle.closest("header").length === 0) {
                        if(listCompEle.hasClass("list__")) {
                            compInst = listCompEle.instance("list");
                        } else if(listCompEle.hasClass("grid__")) {
                            compInst = listCompEle.instance("grid");
                        }

                        if(compInst) {
                            targetEle = compInst.tempRowEle.find(idSelector + targetProp);

                            // If the target element is a checkbox or radio, the element is imported by name selector.(#eleId -> [name='eleId']).
                            if(targetEle.is(":radio, :checkbox") && jQuery("[name='" + targetProp + "']", compInst.tempRowEle).length > 1) {
                                targetEle = jQuery("[name='" + targetProp + "']", compInst.tempRowEle);
                            }
                        }
                    } else {
                        // If the target element is a checkbox or radio, the element is imported by name selector.(#eleId -> [name='eleId']).
                        if(targetEle.is(":radio, :checkbox") && jQuery("[name='" + targetProp + "']", cont.view).length > 1) {
                            targetEle = jQuery("[name='" + targetProp + "']", cont.view);
                        }
                    }

                    // If the target element is a button element(a, button, input[type=button]), the NU.button component is automatically applied.
                    if(targetEle.is("a, button, input[type=button]")) {
                        targetEle.button();
                    } else {
                        if(eventName && eventName.indexOf("click") > -1) {
                            targetEle.css("cursor", "pointer");
                        }
                    }

                    if(compInst) {
                        let targetStr;
                        if(targetEle.is(":radio") || (targetEle.is(":checkbox") && targetEle.length > 1)) {
                            targetStr = ">.form__ [name='" + targetProp + "']:radio, >.form__ [name='" + targetProp + "']:checkbox";
                        } else {
                            targetStr = ">.form__ " + idSelector + targetProp;
                        }

                        cont[prop] = listCompEle.on(eventName + "." + cont.view.data("pageid"), targetStr, function() {
                            const args = Array.apply(null, arguments);
                            args.push(listCompEle.find(">.form__").index(jQuery(this).closest(".form__")));
                            handler.apply(this, args);
                        });
                    } else {
                        cont[prop] = targetEle.on(eventName + "." + cont.view.data("pageid"), handler);
                    }
                }
            } else {
                throw createError(NC.message.get(Context.attr("template").message, "MSG-0006", [ cont.view.data("pageid") + ":" + prop ]));
            }
        };

    }


export const aop = (...args) => new Template(...args);
export default Template;
