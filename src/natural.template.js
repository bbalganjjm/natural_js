/*!
 * Natural-TEMPLATE v0.0.8
 *
 * Released under the LGPL v2.1 license
 * Date: 2019-02-28T18:00Z
 *
 * Copyright 2019 KIM HWANG MAN(bbalganjjm@gmail.com)
 */
(function(window, $) {
    N.version["Natural-TEMPLATE"] = "0.0.8";

    (function(N) {

        var TEMPLATE = N.template = {
            aop : {
                codes : function(cont, joinPoint, opts) {
                    var options = {
                        codeUrl : function(cont) {
                            return "sample/code/getSampleCodeList.json";
                        },
                        codeKey : "code",
                    }

                    if(opts) {
                        try {
                            $.extend(true, options, opts);
                        } catch (e) {
                            throw N.error("N.template", e);
                        }
                    }

                    var codeList = [];
                    var commList = [];
                    var selectList = [];
                    for(var prop in cont) {
                        if(N.type(prop) === "string" && N.string.startsWith(prop, "p.select.")) {
                            // 파라미터가 Array 로 들어왔을때.
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
                                throw N.error("data 옵션을 정의 해 주세요.");
                            }
                        });
                    }

                    if(codeList.length > 0 || commList.length > 0) {
                        var xhrs = [];

                        // 공통코드
                        if(codeList.length > 0) {
                            var codeParam = N(codeList).map(function(i, codeInfo) {
                                return codeInfo.split("|")[1];
                            }).get();
                            xhrs.push(N({
                                codes : codeParam != null && codeParam.length === 0 ? undefined : codeParam
                            }).comm({
                                url : options.codeUrl(cont)
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
                                throw N.error("서버에러가 발생하여 공통코드를 조회하지 못했습니다.");
                            }).request.obj.xhr);
                        }

                        // 데이터 코드
                        N(commList).each(function(i, commStr) {
                            var codeInfoArr = commStr.split("|");

                            if(!cont[codeInfoArr[1]]) {
                                throw N.error("데이터 코드를 조회하는 N.comm(" + codeInfoArr[1] + ") 이 없습니다.");
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
                                throw N.error("서버에러가 발생하여 데이터[" + codeInfoArr[0] + "] 코드를 조회하지 못했습니다.");
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

                    if(compActionDefer.length > 0) {
                        $(compActionDefer).each(function() {
                            this.resolve();
                        });
                        compActionDefer = undefined;
                    }

                    joinPoint.proceed();

                    // 팝업이나 탭에서 지연 된 init 이 실행 된 후에 onOpen을 실행하기 위해서.
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
                                            cont.view.find(usageOptions["search-box"].defaultButton).click();
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
                            throw N.error("컴포넌트(" + cont.view.data("pageid") + ":" + prop + ")가 잘못 지정 되었습니다.");
                        }
                    } else {
                        throw N.error("컴포넌트(" + cont.view.data("pageid") + ":" + prop + ")가 잘못 지정 되었습니다.");
                    }
                },
                events : function(cont, prop) {
                    var props = prop.split(".");
                    if(props.length > 2) {
                        var targetProp;
                        var handler;
                        var eventName = props[2];
                        var idSelector = "";
                        if(N.type(cont[prop]) === "function") {
                            targetProp = props[1];
                            handler = cont[prop];
                            idSelector = "#";
                        } else if(N.type(cont[prop]) === "object") {
                            targetProp = cont[prop].target;
                            handler = cont[prop].handler;
                        } else {
                            throw N.error("이벤트(" + cont.view.data("pageid") + ":" + prop + ")가 잘못 지정 되었습니다.");
                        }

                        var targetEle = N(idSelector + targetProp, cont.view);
                        var listCompEle = targetEle.closest(".list__, .grid__");

                        var compInst;
                        if(listCompEle.length > 0) {
                            if(listCompEle.hasClass("list__")) {
                                compInst = listCompEle.instance("list");
                            } else if(listCompEle.hasClass("grid__")) {
                                compInst = listCompEle.instance("grid");
                            }

                            if(compInst) {
                                targetEle = compInst.tempRowEle.find(idSelector + targetProp);

                                // 대상요소가 checkbox 나 radio 이면 name selector 로 요소가 지정 됨(#eleId -> [name='eleId']).
                                if(targetEle.is(":radio, :checkbox") && N("[name='" + targetProp + "']", compInst.tempRowEle).length > 1) {
                                    targetEle = N("[name='" + targetProp + "']", compInst.tempRowEle);
                                }
                            }
                        } else {
                            // 대상요소가 checkbox 나 radio 이면 name selector 로 요소가 지정 됨(#eleId -> [name='eleId']).
                            if(targetEle.is(":radio, :checkbox") && N("[name='" + targetProp + "']", cont.view).length > 1) {
                                targetEle = N("[name='" + targetProp + "']", cont.view);
                            }
                        }

                        // 대상요소가 버튼요소(a, button, input[type=button]) 이면 N.button 컴포넌트가 적용 됨.
                        if(targetEle.is("a, button, input[type=button]")) {
                            targetEle.button();
                        } else {
                            if(eventName && eventName.indexof("click") > -1) {
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
                    } else {
                        throw N.error("이벤트(" + cont.view.data("pageid") + ":" + prop + ")가 잘못 지정 되었습니다.");
                    }
                }
            }
        };

    })(N);

})(window, jQuery);