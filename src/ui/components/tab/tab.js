/**
 * Natural-JS UI Tab Component
 * Full version from original natural.ui.js lines 2576-3351
 */

import { error as createError, warn } from '../../../core/helpers/logger.js';
import { ElementUtils } from '../../../core/utils/element.js';
import { EventUtils } from '../../../core/utils/event.js';
import { Context } from '../../../architecture/context/context.js';
import { Communicator } from '../../../architecture/communication/communicator.js';
import { Controller } from '../../../architecture/controller/controller.js';
import { UIUtils } from '../../shared/utils.js';
import { Draggable } from '../../shared/draggable.js';

// Import N at runtime to avoid circular dependency
const N = () => window.N;

export class Tab {

        constructor(obj, opts) {
            this.options = {
                context : obj.length > 0 ? obj : null,
                links : obj.length > 0 ? obj.find(">ul>li") : null,
                tabOpts : [], // tabOpts : [{ url: undefined, active: false, preload: false, onOpen: undefined, disable : false, stateless : false }]
                randomSel : false,
                opener : null,
                onActive : null,
                onLoad : null,
                blockOnActiveWhenCreate : false,
                contents : obj.length > 0 ? obj.find(">div") : null,
                tabScroll : false,
                tabScrollCorrection : {
                    tabContainerWidthCorrectionPx : 0,
                    tabContainerWidthReCalcDelayTime : 0
                }
            };

            // To prevent "maximum call stack size exceeded" error in jQuery's extend method when define the opener option.
            let isOpenerHas = false;
            if(opts && opts.opener) {
                const opener = opts.opener;
                opts.opener = undefined;
                isOpenerHas = true;
            }

            try {
                jQuery.extend(true, this.options, Context.attr("ui").tab);
            } catch (e) {
                throw createError("Tab", e);
            }

            if (isPlainObject(obj)) {
                // Wraps the global event options in Context and event options for this component.
                UIUtils.wrapHandler(opts, "tab", "onActive");
                UIUtils.wrapHandler(opts, "tab", "onLoad");

                jQuery.extend(true, this.options, obj);
                this.options.context = N()(obj.context);
            }
            this.options.links = this.options.context.find(">ul>li");
            this.options.contents = this.options.context.find(">div");

            const self = this;
            let opt;
            if(this.options.tabOpts.length === 0) {
                this.options.links.each(function(i) {
                    const thisEle = N()(this);
                    opt = ElementUtils.toOpts(thisEle);
                    if(opt === undefined) {
                        opt = {};
                    }
                    opt.target = thisEle.find("a").attr("href");
                    self.options.tabOpts.push(opt);
                });
            }

            jQuery.extend(this.options, opts);

            // To prevent "maximum call stack size exceeded" error in jQuery's extend method when define the opener option.
            if(isOpenerHas) {
                opts.opener = opener;
                this.options.opener = opts.opener;
                opener = undefined;
            }

            // set style class name to context element
            this.options.context.addClass("tab__");

            Tab.wrapEle.call(this);

            // set this instance to context element
            this.options.context.instance("tab", this);
        };

        static wrapEle = function() {
            const opts = this.options;
            // hide div contents
            opts.contents.hide();

            const self = this;

            let defSelIdx;
            N()(opts.tabOpts).each(function(i) {
                if(this.disable) {
                    self.disable(i);
                } else {
                    self.enable(i);
                }

                // set default select index
                if(this.active === true) {
                    // active option select
                    defSelIdx = i;
                } else {
                    if(opts.randomSel) {
                        // random select
                        defSelIdx = Math.floor(Math.random() * opts.links.length);
                    } else {
                        // default select
                        if(i === 0) {
                            defSelIdx = i;
                        }
                    }
                }

                if(this.preload) {
                    if(this.url !== undefined) {
                        Tab.loadContent.call(self, this.url, i, function(cont, selContentEle_) {
                            // execute "onLoad" event
                            if(opts.onLoad !== null) {
                                opts.onLoad.call(self, i, opts.links.eq(i), selContentEle_, cont);
                            }
                        });
                    }
                }
            });

            let marginLeft;
            opts.links.on("mousedown.tab" + (BrowserUtils.scrollbarWidth() > 0 ? "touchstart.tab" : ""), function(e) {
                e.preventDefault();

                marginLeft = parseInt(opts.context.find(">ul").css("margin-left"));
            });

            opts.links.on("click.tab" + (BrowserUtils.scrollbarWidth() > 0 ? "touchend.tab" : ""), function(e, onOpenData, isFirst) {
                e.preventDefault();

                if(marginLeft !== undefined && Math.abs(parseInt(opts.context.find(">ul").css("margin-left")) - marginLeft) > 15 && isFirst !== true) {
                    marginLeft = undefined;
                    return false;
                }
                marginLeft = undefined;

                if(!N()(this).hasClass("tab_active__")) {
                    const selTabEle = N()(this);
                    const selTabIdx = opts.beforeOpenIdx = opts.links.index(this);
                    const selDeclarativeOpts = opts.tabOpts[selTabIdx];
                    const selContentEle = opts.contents.eq(selTabIdx);

                    opts.links.filter(".tab_active__").removeClass("tab_active__");
                    selTabEle.addClass("tab_active__");

                    const onActiveProcFn__ = function() {
                        // execute "onActive" event
                        if(opts.onActive !== null) {
                            if(opts.blockOnActiveWhenCreate === false || (opts.blockOnActiveWhenCreate === true && isFirst !== true)) {
                                opts.onActive.call(self, selTabIdx, selTabEle, selContentEle, opts.links, opts.contents);
                            }
                        }
                    }

                    const onOpenProcFn__ = function() {
                        // execute "onOpen"(declarative option) event
                        if(selDeclarativeOpts.onOpen !== undefined) {
                            const cont = selContentEle.children(".view_context__:last").instance("cont");
                            if(cont[selDeclarativeOpts.onOpen] !== undefined) {
                                //thisDeclarativeOpts.onOpen
                                cont[selDeclarativeOpts.onOpen](onOpenData);
                            } else {
                                warn("[Tab.wrapEle]The onOpen event handler(" + selDeclarativeOpts.onOpen + ") is not defined on the Controller of the tab(Tab)'s contents.");
                            }
                        }
                    }

                    // Synchronize the animation and page load
                    const visibleDefer = jQuery.Deferred();
                    const loadDefer = jQuery.Deferred();
                    jQuery.when(visibleDefer, loadDefer).done(function() {
                        opts.context.dequeue("open");
                    });

                    // hide tab contents
                    const beforeActivatedContent = opts.contents.filter(".tab_content_active__");
                    if(beforeActivatedContent.length > 0) {
                        let isRelative = false;
                        if(opts.context.css("position") !== "relative") {
                            opts.context.css("position", "relative");
                            isRelative = true;
                        }
                        beforeActivatedContent.removeClass("tab_content_active__ visible__").one(EventUtils.whichTransitionEvent(beforeActivatedContent), function(e){
                            N()(this).hide();
                            if(isRelative) {
                                opts.context.css("position", "");
                            }
                            visibleDefer.resolve();
                        }).addClass("hidden__").trigger("nothing");
                    } else {
                        visibleDefer.resolve();
                    }

                    if(!selDeclarativeOpts.preload && selDeclarativeOpts.url !== undefined && !selContentEle.data("loaded") || selDeclarativeOpts.stateless) {
                        // show tab contents
                        selContentEle.show(0, function() {
                            selContentEle.addClass("visible__");
                        }).removeClass("hidden__");

                        // load content
                        Tab.loadContent.call(self, selDeclarativeOpts.url, selTabIdx, function(cont, selContentEle_) {
                            selContentEle_.addClass("tab_content_active__");

                            // execute "onLoad" event
                            if(opts.onLoad !== null) {
                                opts.onLoad.call(self, selTabIdx, selTabEle, selContentEle_, cont);
                            }

                            onActiveProcFn__();
                            onOpenProcFn__();

                            selContentEle_.data("loaded", true);
                            loadDefer.resolve();
                        }, isFirst);
                    } else {
                        selContentEle.addClass("tab_content_active__");

                        onActiveProcFn__();
                        onOpenProcFn__();

                        // show tab contents
                        selContentEle.show(0, function() {
                            selContentEle.addClass("visible__");

                            loadDefer.resolve();
                        }).removeClass("hidden__");
                    }
                }
            });

            if(opts.tabScroll) {
                Tab.wrapScroll.call(this);
            }

            // select tab
            this.open(defSelIdx, undefined, true);
        };

        static wrapScroll = function() {
            const opts = this.options;
            const eventNameSpace = ".tab.scroll";
            const tabContainerEle = opts.context.find(">ul").addClass("effect__");

            const scrollBtnEles = opts.context.find(">a").hide();
            let prevBtnEle;
            let nextBtnEle;
            const liMarginRight = parseInt(StringUtils.trimToZero(tabContainerEle.find(">li:first").css("margin-right")));
            let lastDistance = liMarginRight;
            let prevBtnEleOuterWidth = 0;
            let nextBtnEleOuterWidth = 0;
            let tabNativeScroll;

            if(scrollBtnEles.length > 1) {
                opts.context.css("position", "relative");
                scrollBtnEles.css({
                    "position" : "absolute",
                    "top" : 0
                });

                prevBtnEle = scrollBtnEles.eq(0).addClass("tab_scroll_prev__").css("left", 0).on("click" + eventNameSpace,  function(e) {
                    e.preventDefault();
                    if(BrowserUtils.scrollbarWidth() > 0) {
                        tabContainerEle.addClass("effect__");
                        lastDistance = prevBtnEleOuterWidth + liMarginRight;
                        tabContainerEle.css("margin-left", lastDistance + "px");
                        nextBtnEle.removeClass("disabled__");
                        prevBtnEle.addClass("disabled__");
                    } else {
                        tabNativeScroll.animate({
                            scrollLeft: 0
                        }, 300, "swing");
                    }
                });
                prevBtnEleOuterWidth = prevBtnEle.outerWidth();

                nextBtnEle = scrollBtnEles.eq(1).addClass("tab_scroll_next__").css("right", 0).on("click" + eventNameSpace,  function(e) {
                    e.preventDefault();
                    if(BrowserUtils.scrollbarWidth() > 0) {
                        tabContainerEle.addClass("effect__");
                        lastDistance = opts.context.outerWidth() - tabContainerEle.width() - nextBtnEleOuterWidth + liMarginRight;
                        tabContainerEle.css("margin-left", lastDistance + "px");
                        prevBtnEle.removeClass("disabled__");
                        nextBtnEle.addClass("disabled__");
                    } else {
                        tabNativeScroll.animate({
                            scrollLeft: tabContainerEle.outerWidth()
                        }, 300, "swing");
                    }
                });
                nextBtnEleOuterWidth = nextBtnEle.outerWidth();

                lastDistance = prevBtnEleOuterWidth + liMarginRight;
            }

            N()(window).on("resize" + eventNameSpace, function() {
                if(!tabContainerEle.is(":visible")) {
                    return false;
                }

                let ulWidth = 0;
                opts.links.each(function() {
                    ulWidth += (N()(this).outerWidth() + parseInt(StringUtils.trimToZero(N()(this).css("margin-left"))) + parseInt(StringUtils.trimToZero(N()(this).css("margin-right"))));
                });
                ulWidth += opts.tabScrollCorrection.tabContainerWidthCorrectionPx;

                if(ulWidth > 0 && ulWidth > opts.context.width() + liMarginRight) {
                    if(BrowserUtils.scrollbarWidth() > 0) {
                        opts.context.css("overflow", "hidden");
                        if(tabContainerEle.parent().hasClass("tab_native_scroll__")) {
                            tabContainerEle.unwrap();
                        }
                        if(scrollBtnEles.length > 1 && prevBtnEleOuterWidth > 0 && nextBtnEleOuterWidth > 0) {
                            tabContainerEle.css("margin-left", (prevBtnEleOuterWidth + liMarginRight) + "px");
                            prevBtnEle.addClass("disabled__");
                            scrollBtnEles.show();
                        }
                    } else {
                        if(!tabContainerEle.parent().hasClass("tab_native_scroll__")) {
                            tabNativeScroll = tabContainerEle.wrap('<div class="tab_native_scroll__"></div>').parent();
                            if(prevBtnEleOuterWidth > 0) {
                                tabNativeScroll.css("margin-left", prevBtnEleOuterWidth + liMarginRight);
                            }
                            if(nextBtnEleOuterWidth > 0) {
                                tabNativeScroll.css("margin-right", nextBtnEleOuterWidth - liMarginRight);
                            }
                        }
                        if(scrollBtnEles.length > 1) {
                            scrollBtnEles.show();
                        }
                    }

                    tabContainerEle.addClass("tab_scroll__").width(ulWidth);
                } else {
                    if(scrollBtnEles.length > 1 && prevBtnEleOuterWidth > 0 && nextBtnEleOuterWidth > 0) {
                        scrollBtnEles.hide();
                        tabContainerEle.css("margin-left", "");
                        prevBtnEle.removeClass("disabled__");
                    }

                    if(BrowserUtils.scrollbarWidth() > 0) {
                        opts.context.css("overflow", "");
                    }

                    if(tabContainerEle.parent().hasClass("tab_native_scroll__")) {
                        tabContainerEle.unwrap();
                    }

                    tabContainerEle.css("width", "");
                }

            }).trigger("resize" + eventNameSpace);

            if(opts.tabScrollCorrection.tabContainerWidthReCalcDelayTime > 0) {
                setTimeout(function() {
                    N()(window).trigger("resize" + eventNameSpace);
                }, opts.tabScrollCorrection.tabContainerWidthReCalcDelayTime);
            }

            if(BrowserUtils.scrollbarWidth() > 0) {
                let sPageX;
                let prevDefGap = 0;
                let nextDefGap = 0;
                let isMoved = false;
                if(scrollBtnEles.length > 1) {
                    prevDefGap = prevBtnEleOuterWidth;
                    nextDefGap = nextBtnEleOuterWidth;
                }

                Draggable.events.call(tabContainerEle, eventNameSpace, function(e, tabContainerEle_, pageX, pageY) { // start
                    tabContainerEle_.removeClass("effect__");
                    if(tabContainerEle_.outerWidth() <= opts.context.innerWidth()) {
                        return false;
                    }
                    sPageX = pageX - lastDistance;
                }, function(e, tabContainerEle_, pageX, pageY) { // move
                    const distance = (sPageX - pageX) * -1;
                    if(distance > prevDefGap || opts.context.outerWidth() >= tabContainerEle_.width() + nextDefGap + distance) {
                        return false;
                    } else {
                        lastDistance = distance + liMarginRight;
                        tabContainerEle_.css("margin-left", distance + "px");
                        isMoved = true;
                    }
                }, function(e, tabContainerEle_) { //end
                    if(isMoved) {
                        if(lastDistance + (scrollBtnEles.length > 1 ? 0 : 30) >= 0 && lastDistance <= prevDefGap) {
                            if(scrollBtnEles.length > 1) {
                                lastDistance = prevDefGap;
                                if(prevBtnEleOuterWidth > 0 && nextBtnEleOuterWidth > 0) {
                                    lastDistance += liMarginRight;
                                }
                                nextBtnEle.removeClass("disabled__");
                                prevBtnEle.addClass("disabled__");
                            } else {
                                lastDistance = 0;
                                if(prevBtnEleOuterWidth > 0 && nextBtnEleOuterWidth > 0) {
                                    lastDistance += liMarginRight;
                                }
                            }
                            tabContainerEle_.addClass("effect__").css("margin-left", lastDistance + "px");
                            isMoved = false;
                        } else if(nextDefGap + (scrollBtnEles.length > 1 ? 0 : 30) >= tabContainerEle_.width() - (opts.context.outerWidth() + lastDistance * -1)) {
                            lastDistance = (tabContainerEle_.width() - opts.context.outerWidth() - 1) * -1;
                            if(scrollBtnEles.length > 1) {
                                lastDistance -= nextDefGap;
                                prevBtnEle.removeClass("disabled__");
                                nextBtnEle.addClass("disabled__");
                            }
                            tabContainerEle_.addClass("effect__").css("margin-left", lastDistance + "px");
                            isMoved = false;
                        } else {
                            scrollBtnEles.removeClass("disabled__");
                        }
                    }
                });
            }
        };

        static loadContent = function(url, targetIdx, callback, isFirst) {
            const opts = this.options;
            const self = this;
            const selContentEle = opts.contents.eq(targetIdx);

            new Communicator({
                url : url,
                contentType : "text/html; charset=UTF-8",
                dataType : "html",
                type : "GET",
                urlSync : !isFirst,
                target : selContentEle
            }).submit(function(page) {
                const cont = selContentEle.html(page).children(".view_context__:last").instance("cont");

                // set tab instance to tab contents Controller
                if(cont !== undefined) {
                    // set caller attribute in controller in tab content that is Tab instance
                    cont.caller = self;

                    // set opener to popup's Controller
                    if(opts.opener != null) {
                        cont.opener = opts.opener;
                    }

                    // triggering "init" method
                    Controller.trInit.call(this, cont, this.request);

                    callback.call(this, cont, selContentEle);
                } else {
                    callback.call(this, cont, selContentEle);
                }

                const activeTabEle = opts.links.eq(targetIdx);
            });
        };

        context(sel) {
            return sel !== undefined ? this.options.context.find(sel) : this.options.context;
        };

        open(idx, onOpenData, isFirst) {
            const opts = this.options;
            if(idx !== undefined) {
                if(opts.beforeOpenIdx !== idx) {
                    opts.context.queue("open", function() {
                        if(onOpenData !== undefined) {
                            N()(opts.links.get(idx)).trigger("click.tab", [onOpenData, isFirst]);
                        } else {
                            N()(opts.links.get(idx)).trigger("click.tab", [undefined, isFirst]);
                        }
                    });
                    clearTimeout(opts.openTime);
                    opts.openTime = setTimeout(function() {
                        opts.context.dequeue("open");
                    }, 0);
                }
                opts.beforeOpenIdx = idx;

                if(opts.tabScroll) {
                    const tabContainerEle = opts.context.find(">ul");
                    if(tabContainerEle.outerWidth() > opts.context.innerWidth()) {
                        let marginLeft = parseInt(tabContainerEle.css("margin-left")) - N()(opts.links.get(idx)).position().left + (opts.context.innerWidth() / 2 - N()(opts.links.get(idx)).outerWidth() / 2);
                        const prevBtnEle = opts.context.find(">.tab_scroll_prev__");
                        const nextBtnEle = opts.context.find(">.tab_scroll_next__");

                        if(marginLeft > opts.context.find(">.tab_scroll_prev__").outerWidth()) {
                            marginLeft = prevBtnEle.length > 0 ? prevBtnEle.outerWidth() : 0;
                            nextBtnEle.removeClass("disabled__");
                            prevBtnEle.addClass("disabled__");
                        } else if(opts.context.innerWidth() > tabContainerEle.outerWidth() + marginLeft) {
                            marginLeft = -(tabContainerEle.outerWidth() - opts.context.innerWidth() + (nextBtnEle.length > 0 ? nextBtnEle.outerWidth() : 0) - 1);
                            prevBtnEle.removeClass("disabled__");
                            nextBtnEle.addClass("disabled__");
                        } else {
                            prevBtnEle.removeClass("disabled__");
                            nextBtnEle.removeClass("disabled__");
                        }
                        tabContainerEle.removeClass("effect__").addClass("effect__").css("margin-left", marginLeft + "px");
                    }
                }
            } else {
                if(opts.links.index(opts.links.filter(".tab_active__")) === opts.beforeOpenIdx) {
                    return {
                        index : opts.links.index(opts.links.filter(".tab_active__")),
                        tab : opts.links.filter(".tab_active__"),
                        content : opts.context.find("> div.tab_content_active__"),
                        cont : opts.context.find("> div.tab_content_active__ > .view_context__").instance("cont")
                    }
                } else {
                    return {
                        index : opts.beforeOpenIdx,
                        tab : "Tab content has not yet been loaded.",
                        content : "Tab content has not yet been loaded.",
                        cont : "Tab content has not yet been loaded."
                    }
                }
            }
            return this;
        };

        disable(idx) {
            if(idx !== undefined) {
                N()(this.options.links.get(idx))
                    .off("click.tab.disable")
                    .off("touchstart.tab.disable")
                    .off("touchend.tab.disable")
                    .tpBind("click.tab.disable", EventUtils.disable)
                    .tpBind("touchstart.tab.disable", EventUtils.disable)
                    .tpBind("touchend.tab.disable", EventUtils.disable)
                    .addClass("tab_disabled__");
            }
            return this;
        };

        enable(idx) {
            if(idx !== undefined) {
                N()(this.options.links.get(idx))
                    .off("click", EventUtils.disable)
                    .off("touchstart", EventUtils.disable)
                    .off("touchend", EventUtils.disable)
                    .removeClass("tab_disabled__");
            }
            return this;
        };

        cont(idx) {
            const opts = this.options;
            let cont;
            if(idx !== undefined) {
                cont = opts.context.find("> div:eq(" + String(idx) + ") > .view_context__").instance("cont");
            } else {
                cont = opts.context.find("> .tab_content_active__ > .view_context__").instance("cont");
            }

            if(cont === undefined) {
                warn("Tab content has not been loaded yet or Controller object is missing.");
            }

            return cont;
        };

    }

    // Select

    // Form


export const tab = (data, options) => new Tab(data, options);
export default Tab;
