/*!
 * Natural-UI.Shell v1.0.0
 *
 * Released under the LGPL v2.1 license
 * Date: 2014-09-26T11:11Z
 *  
 * Copyright 2014 Goldman Kim(bbalganjjm@gmail.com)
 */

import { N } from "./natural.js";
import { NC } from "./natural.core";
import { NA } from "./natural.architecture";
import { NU } from "./natural.ui";

export class NUS {

    notify(opts) {
        return new NUS.notify(this, opts);
    };

    docs(opts) {
        return new NUS.docs(this, opts);
    };

    // Notify
    static notify = class {
        constructor(position, opts) {
            if(!NC.isEmptyObject(position) && opts === undefined) {
                return new NUS.notify(null, position);
            }

            this.options = {
                position : {
                    top : 10,
                    right : 10
                },
                container : N("body"),
                context : null,
                displayTime : 7,
                alwaysOnTop : false,
                html : false,
                alwaysOnTopCalcTarget : "div, span, ul, p, nav, article, section, header, footer, aside",
            };

            try {
                jQuery.extend(this.options, NA.context.attr("ui.shell").notify);

                if(position) {
                    if(NC.isWrappedSet(position)) {
                        if(position.length > 0) {
                            this.options.position = position.get(0);
                        }
                    } else {
                        if(!NC.isEmptyObject(position)) {
                            this.options.position = position;
                        }
                    }
                }
            } catch (e) {
                NC.error("NUS.notify", e);
            }

            if(!NC.isEmptyObject(opts)) {
                jQuery.extend(this.options, opts);
            }

            NUS.notify.wrapEle.call(this);

            this.options.context.instance("notify", this);

            return this;
        };

        static add = function(msg, url) {
            (new NUS.notify()).add(msg, url);
        };

        static wrapEle = function() {
            const opts = this.options;
            if(opts.container.find(".notify__").length > 0) {
                opts.context = opts.container.find(".notify__");
            } else {
                opts.context = N("<div></div>").addClass("notify__").css({
                    "position" : "fixed"
                }).appendTo(opts.container);
            }
            if(opts.alwaysOnTop) {
                // get maximum "z-index" value
                opts.context.css("z-index", String(NC.element.maxZindex(N(opts.alwaysOnTopCalcTarget)) + 1));
            }
        };

        context(sel) {
            return sel !== undefined ? this.options.context.find(sel) : this.options.context;
        };

        add(msg, url) {
            const opts = this.options;
            const self = this;

            opts.context.css({
                top : "",
                right : "",
                bottom : "",
                left : ""
            });
            opts.context.css(opts.position);

            const msgEle = N(url !== undefined ? '<a href="#"></a>' : '<span></span>');
            msgEle[ opts.html ? "html" : "text" ](msg);

            if(url !== undefined) {
                msgEle.on("click.notify", function(e) {
                    e.preventDefault();
                    if(typeof url === "function") {
                        url.call(this);
                    } else {
                        if(NC.string.startsWith(url, "#")) {
                            location.hash = url;
                        } else {
                            location.href = url;
                        }
                    }
                });
            }

            const msgBoxEle = N("<div></div>", {
                "class" : "notify_msg__"
            }).css({
                "display": "none",
                "position" : "relative"
            }).append(msgEle).appendTo(opts.context).show().addClass("visible__");

            N('<a href="#" class="notify_msg_close__" title="' + NC.message.get(opts.message, "close") + '"><span></span></a>')
                .appendTo(msgBoxEle).on("click.notify", function(e) {
                e.preventDefault();
                self.remove(msgBoxEle);
            });

            setTimeout(function() {
                self.remove(msgBoxEle);
            }, opts.displayTime * 1000);

            return this;
        };

        remove(msgBoxEle) {
            msgBoxEle.removeClass("visible__").addClass("hidden__");

            msgBoxEle.one(NC.event.whichTransitionEvent(msgBoxEle), function(e){
                N(this).remove();
            }).trigger("nothing");

            return this;
        };

    }

    // Documents
    static docs = class {
        
        constructor(obj, opts) {
            this.options = {
                context : obj.length > 0 ? obj : null,
                multi : true,
                maxStateful : 0, // 0 is unlimit
                maxTabs : 0, // 0 is unlimit
                addLast : false,
                tabScroll : false,
                closeAllRedirectURL : null,
                tabScrollCorrection : {
                    rightCorrectionPx : 0,
                },
                msgContext : N(window),
                entireLoadIndicator : false,
                entireLoadScreenBlock : false,
                entireLoadExcludeURLs : [],
                entireLoadRequestCnt : 0,
                entireLoadRequestMaxCnt : 0,
                onBeforeLoad : null,
                onLoad : null,
                onBeforeEntireLoad : null,
                onErrorEntireLoad : null,
                onEntireLoad : null,
                onBeforeActive : null,
                onActive : null,
                onBeforeInactive : null,
                onInactive : null,
                onBeforeRemoveState : null,
                onRemoveState : null,
                onBeforeRemove : null,
                onRemove : null,
                saveHistory : true,
                docs : {},
                alwaysOnTop : false,
                alwaysOnTopCalcTarget : "div, span, ul, p, nav, article, section, header, footer, aside",
                order : [],
                loadedDocId : null
            };

            try {
                jQuery.extend(true, this.options, NA.context.attr("ui.shell").docs);
            } catch (e) {
                NC.error("NUS.docs", e);
            }
            jQuery.extend(this.options, opts);

            const self = this;
            if(self.options.onBeforeEntireLoad !== null
                || self.options.onEntireLoad !== null
                || self.options.entireLoadIndicator
                || self.options.entireLoadScreenBlock) {
                const entireLoadExcludeURLs = "|" + this.options.entireLoadExcludeURLs.join("|") + "|";

                NA.context.attr("architecture").comm.filters.docsFilter__ = {
                    "beforeSend" : function(request, xhr, settings) {
                        if(self.options.loadedDocId !== null) {
                            if(self.options.entireLoadRequestCnt === 0) {
                                if(self.options.onBeforeEntireLoad !== null) {
                                    self.options.onBeforeEntireLoad.call(self, self.options.loadedDocId);
                                }

                                NUS.docs.createLoadIndicator.call(self);
                            }

                            if(entireLoadExcludeURLs.indexOf(request.options.url) < 0) {
                                self.options.entireLoadRequestCnt++;
                                if(self.options.entireLoadIndicator) {
                                    self.options.entireLoadRequestMaxCnt++;
                                }
                            }

                            // Direct regist the error handler to NA.comm's errorHandlers
                            this.errorHandlers.push(function(e, request, xhr, textStatus, callback) {
                                if(self.options.onErrorEntireLoad !== null) {
                                    self.options.onErrorEntireLoad.call(self, e, request, xhr, textStatus, callback);
                                }

                                NUS.docs.errorLoadIndicator.call(self);

                                self.options.entireLoadRequestCnt = 0;
                                if(self.options.entireLoadIndicator) {
                                    self.options.entireLoadRequestMaxCnt = 0;
                                }
                            })

                        }
                    },
                    "complete" : function(request, xhr, textStatus) {
                        if(self.options.loadedDocId !== null) {
                            if(entireLoadExcludeURLs.indexOf(request.options.url) < 0) {
                                self.options.entireLoadRequestCnt--;

                                if(self.options.entireLoadIndicator) {
                                    NUS.docs.updateLoadIndicator.call(self);
                                }
                            }
                            if(self.options.entireLoadRequestCnt <= 0) {
                                if(self.options.onEntireLoad !== null) {
                                    self.options.onEntireLoad.call(self, self.options.loadedDocId, self.options.entireLoadRequestCnt, self.options.entireLoadRequestMaxCnt);
                                }

                                NUS.docs.removeLoadIndicator.call(self);

                                self.options.entireLoadRequestMaxCnt = 0;

                                // Correct the wrong entireLoadRequestCnt value.
                                self.options.entireLoadRequestCnt = 0;
                            }
                        }
                    }
                };

                NA.comm.resetFilterConfig();
            }

            // set Controller's request instance
            this.request = new NA.comm.request(this);

            NUS.docs.wrapEle.call(this);

            if(this.options.tabScroll) {
                NUS.docs.wrapScroll.call(this);
            }

            this.options.context.instance("docs", this);

            return this;
        };

        static createLoadIndicator = function() {
            const opts = this.options;

            let maxZindex;
            if(opts.entireLoadScreenBlock) {
                maxZindex = NC.element.maxZindex(N(opts.alwaysOnTopCalcTarget).not(".entire_load_screen_block__, .entire_load_indicator__")) + 1;
                let entireLoadScreenBlock = N(".entire_load_screen_block__");
                if(entireLoadScreenBlock.length > 0) {
                    entireLoadScreenBlock.removeClass("hidden__").show().css("z-index", String(maxZindex));
                } else {
                    const entireLoadScreenBlock = N('<div class="entire_load_screen_block__"></div>')
                        .css("z-index", String(maxZindex))
                        .on("click", function(e) {
                            e.stopPropagation();
                        });
                    entireLoadScreenBlock.appendTo("body").on(NC.event.whichTransitionEvent(entireLoadScreenBlock), function(e){
                        N(this).hide().removeClass("hidden__");
                    }).trigger("nothing");
                }
                entireLoadScreenBlock = undefined;
            }

            if(opts.entireLoadIndicator) {
                if(maxZindex === undefined) {
                    maxZindex = NC.element.maxZindex(N(opts.alwaysOnTopCalcTarget).not(".entire_load_screen_block__, .entire_load_indicator__")) + 1;
                } else {
                    maxZindex += 1;
                }
                let entireLoadIndicator = opts.context.find("> .entire_load_indicator__");
                if(entireLoadIndicator.length > 0) {
                    entireLoadIndicator.css("z-index", String(maxZindex)).removeClass("hidden__").show();
                    entireLoadIndicator.find("> .entire_load_indicator_bar__").css("left", "");
                } else {
                    const entireLoadIndicator = N('<div class="entire_load_indicator__"><div class="entire_load_indicator_bar__"></div></div>').on("click", function(e) {
                        e.stopPropagation();
                    }).css("z-index", String(maxZindex));
                    opts.context.find(".docs_tab_context__").after(entireLoadIndicator);
                }
                entireLoadIndicator = undefined;
            }

            return this;
        };
        
        static updateLoadIndicator = function(entireLoadRequestCnt, entireLoadRequestMaxCnt) {
            const opts = this.options;

            opts.context.find("> .entire_load_indicator__ > .entire_load_indicator_bar__")
                .css("left", "-" + ((entireLoadRequestCnt ? entireLoadRequestCnt : opts.entireLoadRequestCnt) * 100 / (entireLoadRequestMaxCnt ? entireLoadRequestMaxCnt : opts.entireLoadRequestMaxCnt)) + "%");

            return this;
        };
        
        static removeLoadIndicator = function() {
            const opts = this.options;

            if(opts.entireLoadIndicator) {
                const entireLoadIndicator = opts.context.find("> .entire_load_indicator__");
                entireLoadIndicator.addClass("hidden__").one(NC.event.whichTransitionEvent(entireLoadIndicator), function(e){
                    N(this).hide();
                }).trigger("nothing");
                entireLoadIndicator.find("> .entire_load_indicator_bar__").css("left", "0");
            }
            if(opts.entireLoadScreenBlock) {
                N(".entire_load_screen_block__").trigger("nothing");
            }

            return this;
        };
        
        static errorLoadIndicator = function() {
            const opts = this.options;

            if(opts.entireLoadIndicator) {
                const entireLoadIndicator = opts.context.find("> .entire_load_indicator__");
                entireLoadIndicator.one(NC.event.whichTransitionEvent(entireLoadIndicator), function(e){
                    N(this).hide();
                }).trigger("nothing");

                opts.context.find("> .entire_load_indicator__ > .entire_load_indicator_bar__").css("left", "");
            }
            if(opts.entireLoadScreenBlock) {
                N(".entire_load_screen_block__").trigger("nothing");
            }

            return this;
        };
        
        static wrapEle = function() {
            const opts = this.options;

            opts.context.addClass("docs__");
            if(NC.browser.is("ios")) {
                opts.context.addClass("ios__");
            }
            if(NC.browser.is("android")) {
                opts.context.addClass("android__");
            }

            if(opts.multi) {
                opts.context.addClass("multi__");

                const docsTabContext = N("<nav></nav>", {
                    "class" : "docs_tab_context__"
                }).appendTo(opts.context);

                const docsTabs = N("<ul/>", {
                    "class" : "docs_tabs__"
                }).appendTo(docsTabContext);

                const docsTabUtils = N("<ul/>", {
                    "class" : "docs_tab_utils__"
                }).appendTo(docsTabContext);

                const docsTabCloseAllItem = N("<li/>", {
                    "class" : "docs_tab_close_all_item__"
                });

                const self = this;
                N("<a/>", {
                    "href" : "#",
                    "text" : NC.message.get(opts.message, "closeAll"),
                    "title" : NC.message.get(opts.message, "closeAllTitle")
                }).on("click.docs", function(e) {
                    e.preventDefault();
                    if(opts.closeAllRedirectURL !== null) {
                        opts.msgContext.alert({
                            msg : NC.message.get(opts.message, "closeAllDQ"),
                            confirm : true,
                            onOk : function() {
                                window.location.href = opts.closeAllRedirectURL;
                            }
                        }).show();
                    } else {
                        const activeTab = opts.context.find("> .docs_tab_context__ > .docs_tabs__ > .docs_tab__.active__");
                        const activeSiblingTabs = activeTab.siblings();
                        if(activeSiblingTabs.length > 0) {
                            opts.msgContext.alert({
                                msg : NC.message.get(opts.message, "closeAllQ"),
                                confirm : true,
                                onOk : function() {
                                    const docId = activeTab.data("docOpts").docId;
                                    activeSiblingTabs.remove();
                                    opts.context.find("> .docs_contents__." + docId + "__").siblings(".docs_contents__").remove();
                                    NUS.docs.closeBtnControl.call(self);
                                    NUS.docs.clearScrollPosition.call(self, 0);
                                }
                            }).show();
                        }
                    }
                }).appendTo(docsTabCloseAllItem);
                docsTabCloseAllItem.appendTo(docsTabUtils);

                const docsTabListItem = N("<li/>", {
                    "class" : "docs_tab_list_item__"
                });
                const docsTabListBtn = N("<a/>", {
                    "href" : "#",
                    "text" : NC.message.get(opts.message, "docList"),
                    "title" : NC.message.get(opts.message, "docListTitle")
                }).on("click.docs", function(e) {
                    e.preventDefault();
                    e.stopPropagation();

                    docsTabListBtn.find(".docs_tab_list__").remove();
                    const docsTabList = N("<ul/>").addClass("docs_tab_list__ hidden__").hide();

                    if(opts.alwaysOnTop) {
                        // get maximum "z-index" value
                        docsTabList.css("z-index", String(NC.element.maxZindex(N(opts.alwaysOnTopCalcTarget)) + 1));
                    }

                    if(!docsTabList.hasClass("visible__")) {
                        docsTabList
                            .empty()
                            .append(opts.context.find("> .docs_tab_context__ > .docs_tabs__ > .docs_tab__:not('.remove__')").clone(true, true))
                            .addClass("hidden__")
                            .appendTo(docsTabListBtn);
                        setTimeout(function() {
                            docsTabList.removeClass("hidden__").show().addClass("visible__");
                        }, 0);
                    }

                    N(document).on("click.docs", function(e) {
                        N(document).off("click.docs");
                        docsTabList.removeClass("visible__").addClass("hidden__");
                        docsTabList.one(NC.event.whichTransitionEvent(docsTabList), function(e){
                            N(this).remove();
                        }).trigger("nothing");
                    });

                    N(document).on("touchstart.docs", function(e) {
                        N(document).off("touchstart.docs");
                        if(N(e.target).closest(".docs_tab_list__").length === 0) {
                            docsTabList.removeClass("visible__").addClass("hidden__");
                            docsTabList.one(NC.event.whichTransitionEvent(docsTabList), function(e){
                                N(this).remove();
                            }).trigger("nothing");
                        }
                    });
                });

                docsTabListBtn.appendTo(docsTabListItem);
                docsTabListItem.appendTo(docsTabUtils);
            }
        };
        
        static wrapScroll = function() {
            const opts = this.options;
            const eventNameSpace = ".docs.scroll";
            const tabContext = opts.context.find(">nav");
            const tabContainerEle = tabContext.find(">ul.docs_tabs__");
            const tabUtilsEleWidth = tabContext.find(">ul.docs_tab_utils__").outerWidth() + opts.tabScrollCorrection.rightCorrectionPx;

            let lastDistance = 0;

            N(window).on("resize" + eventNameSpace, function() {
                let ulWidth = 0;
                tabContainerEle.find(">li").each(function() {
                    ulWidth += (N(this).outerWidth() + parseInt(NC.string.trimToZero(N(this).css("margin-left"))) + parseInt(NC.string.trimToZero(N(this).css("margin-right"))));
                });

                if(ulWidth > 0 && ulWidth > tabContext.width() - tabUtilsEleWidth) {
                    tabContainerEle.addClass("docs_scroll__").width(ulWidth);
                } else {
                    tabContainerEle.css("width", "");
                }
            }).trigger("resize" + eventNameSpace);

            N(window).trigger("resize" + eventNameSpace);

            let sPageX;
            const prevDefGap = 77;
            const nextDefGap = 77;
            let isMoved = false;
            NU.ui.draggable.events.call(tabContainerEle, eventNameSpace, function(e, tabContainerEle_, pageX, pageY) { // start
                tabContainerEle_.removeClass("effect__");
                if(tabContainerEle_.outerWidth() <= tabContext.innerWidth() - tabUtilsEleWidth) {
                    return false;
                }
                sPageX = pageX - parseInt(tabContainerEle_.css("margin-left"));
            }, function(e, tabContainerEle_, pageX, pageY) { // move
                const distance = (sPageX - pageX) * -1;
                if(distance > prevDefGap || tabContext.outerWidth() - tabUtilsEleWidth >= tabContainerEle_.width() + nextDefGap + distance) {
                    return false;
                } else {
                    lastDistance = distance;
                    tabContainerEle_.css("margin-left", distance + "px");
                    isMoved = true;
                }
            }, function(e, tabContainerEle_) { //end
                if(isMoved) {
                    if(lastDistance >= 0 && lastDistance <= prevDefGap) {
                        lastDistance = 0;
                    } else if(nextDefGap >= tabContainerEle_.width() - (tabContext.outerWidth() - tabUtilsEleWidth + lastDistance * -1)) {
                        lastDistance = (tabContainerEle_.width() - tabContext.outerWidth() - 1) * -1 - tabUtilsEleWidth;
                    }
                    tabContainerEle_.addClass("effect__").css("margin-left", lastDistance + "px");
                    isMoved = false;
                }
            });
        };
        
        static clearScrollPosition = function(tabEle, isActive) {
            const opts = this.options;

            const tabContext = opts.context.find(">nav");
            const tabContainerEle = tabContext.find(">ul.docs_tabs__");
            let marginLeft;

            if(NC.type(tabEle) === "number") {
                marginLeft = tabEle;
            } else {
                const tabUtilsEleWidth = tabContext.find(">ul.docs_tab_utils__").outerWidth() + opts.tabScrollCorrection.rightCorrectionPx;
                const tabContainerEleMarginLeft = parseInt(NC.string.trimToZero(tabContainerEle.css("margin-left")));
                if(tabEle.position().left + tabEle.outerWidth() + tabContainerEleMarginLeft > tabContext.innerWidth() - tabUtilsEleWidth
                    || tabContainerEleMarginLeft > 0 && tabContainerEle.outerWidth() > tabContext.innerWidth() - tabUtilsEleWidth) {
                    marginLeft = (tabEle.position().left + 1 + tabEle.outerWidth() - tabContext.outerWidth() + tabUtilsEleWidth) * -1;
                } else if(tabEle.position().left < tabContainerEleMarginLeft * -1){
                    marginLeft = tabEle.position().left * -1;
                } else if(tabContainerEle.outerWidth() < tabContext.innerWidth() - tabUtilsEleWidth) {
                    marginLeft = 0;
                } else if(tabContext.innerWidth() > tabContainerEle.outerWidth() - (tabContainerEleMarginLeft * -1) - tabUtilsEleWidth
                    && tabContainerEleMarginLeft < 0 && !isActive){
                    tabEle = tabContainerEle.find(".docs_tab__:last");
                    marginLeft = (tabEle.position().left + 1 + tabEle.outerWidth() - tabContext.outerWidth() + tabUtilsEleWidth) * -1;
                }
            }

            if(marginLeft !== undefined) {
                tabContainerEle.addClass("effect__").css("margin-left", String(marginLeft) + "px");
            }
        };
        
        static loadContent = function(docOpts, callback) {
            const opts = this.options;
            opts.loadedDocId = docOpts.docId;

            if(!opts.multi) {
                const docsContents = opts.context.find("section.docs_contents__")
                if(docsContents.length > 0) {
                    docsContents.one(NC.event.whichTransitionEvent(docsContents), function(e){
                        N(this).remove();
                    }).trigger("nothing");
                }
            }
            const target = N("<section></section>", {
                "class" : "docs_contents__ " + docOpts.docId + "__ " + "hidden__"
            }).appendTo(opts.context);

            const self = this;
            if(opts.onBeforeLoad !== null) {
                opts.onBeforeLoad.call(this, docOpts.docId, target);
            }
            if(docOpts.onBeforeLoad !== null) {
                docOpts.onBeforeLoad.call(this, docOpts.docId, target);
            }

            const comm = new NA.comm({
                url : docOpts.url,
                urlSync : docOpts.urlSync,
                contentType : "text/html; charset=UTF-8",
                dataType : "html",
                type : "GET",
                target : target
            });

            // set current NA.comm's request from NUS.docs's request;
            jQuery.extend(comm.request.attrObj, this.request.attrObj);
            this.request.attrObj = {};

            comm.submit(function(document) {
                // Reset page context
                NA.context.attr("architecture").page.context = NA.context.attr("ui").alert.container = target;

                const cont = target.html(document).children(".view_context__:last").instance("cont");

                // set tab instance to tab contents Controller
                if(cont !== undefined) {
                    // set caller attribute in conteroller in tab content that is Tab instance
                    cont.caller = self;

                    // triggering "init" method
                    NA.cont.trInit.call(this, cont, this.request);
                    cont.docOpts = docOpts;
                }

                if(callback !== undefined) {
                    callback.call(self, target);
                }

                if(opts.onLoad !== null) {
                    opts.onLoad.call(self, docOpts.docId);
                }
                if(docOpts.onLoad !== null) {
                    docOpts.onLoad.call(self, docOpts.docId);
                }
            });
        };
        
        static closeBtnControl = function() {
            const opts = this.options;
            const tabs = opts.context.find("> .docs_tab_context__ > .docs_tabs__ > .docs_tab__:not('.remove__')");
            if(tabs.length === 1) {
                tabs.find("> .docs_tab_close_btn__").hide();
            } else {
                tabs.find("> .docs_tab_close_btn__:not(':visible')").show();
            }
        };
        
        static inactivateTab = function() {
            const opts = this.options;

            const currActiveTab = opts.context.find(".docs_tab_context__ > .docs_tabs__ > .docs_tab__.active__");
            const currActiveTabDocOpts = currActiveTab.data("docOpts");

            if(currActiveTabDocOpts && currActiveTab.length > 0) {
                if(opts.onBeforeInactive !== null) {
                    opts.onBeforeInactive.call(this, currActiveTabDocOpts.docId);
                }
                if(currActiveTabDocOpts.onBeforeInactive !== null) {
                    currActiveTabDocOpts.onBeforeInactive.call(this, currActiveTabDocOpts.docId);
                }
                currActiveTab.removeClass("active__").addClass("inactive__");
                if(opts.onInactive !== null) {
                    opts.onInactive.call(this, currActiveTabDocOpts.docId);
                }
                if(currActiveTabDocOpts.onInactive !== null) {
                    currActiveTabDocOpts.onInactive.call(this, currActiveTabDocOpts.docId);
                }
            }
        };
        
        static activateTab = function(docId_, isFromDocsTabList_, isNotLoaded_) {
            const opts = this.options;

            const tabToActivate = opts.context.find("> .docs_tab_context__ > .docs_tabs__ > .docs_tab__." + docId_ + "__");

            // Activate inactived tab and tab contents
            if(isFromDocsTabList_ && !opts.tabScroll) {
                tabToActivate.prependTo(tabToActivate.parent());
            }
            if(opts.tabScroll) {
                NUS.docs.clearScrollPosition.call(this, tabToActivate, true);
            }

            if(opts.onBeforeActive !== null) {
                opts.onBeforeActive.call(this, docId_, isFromDocsTabList_ === undefined ? false : isFromDocsTabList_, isNotLoaded_ === undefined ? false : isNotLoaded_);
            }
            if(opts.docs[docId_].onBeforeActive !== null) {
                opts.docs[docId_].onBeforeActive.call(this, docId_, isFromDocsTabList_ === undefined ? false : isFromDocsTabList_, isNotLoaded_ === undefined ? false : isNotLoaded_);
            }
            setTimeout(function() {
                tabToActivate.removeClass("inactive__").addClass("active__");
            }, 0);
        };
        
        static showTabContents = function(docId_) {
            const opts = this.options;

            const tabContents_ = opts.context.find("> .docs_contents__." + docId_ + "__");

            if(tabContents_.hasClass("visible__")) {
                return false;
            }

            // Reset page context
            NA.context.attr("architecture").page.context = NA.context.attr("ui").alert.container = tabContents_;

            tabContents_.show(0, function() {
                tabContents_.addClass("visible__").one(NC.event.whichTransitionEvent(tabContents_), function(e){
                    tabContents_.siblings(".docs_contents__.hidden__").hide();
                }).removeClass("hidden__");
            });
        };
        
        static hideTabContents = function(docId_) {
            const opts = this.options;

            const tabContents_ = opts.context.find("> .docs_contents__." + docId_ + "__");

            if(tabContents_.siblings(".docs_contents__.visible__").length > 0) {
                opts.context.css("position", "relative");
                tabContents_.siblings(".docs_contents__.visible__").removeClass("visible__").one(NC.event.whichTransitionEvent(tabContents_), function(e){
                    opts.context.css("position", "");
                    if(N(this).hasClass("hidden__")) {
                        N(this).hide();
                    }
                }).addClass("hidden__").trigger("nothing");
            }
        };
        
        static remove = function(targetTabEle) {
            const opts = this.options;
            const targetTabDocOpts = targetTabEle.data("docOpts");
            const targetTabPrevEle = targetTabEle.prev();
            const targetTabNextEle = targetTabEle.next();
            const isActiveTargetTabEle = targetTabEle.hasClass("active__");

            if(isActiveTargetTabEle) {
                targetTabEle.addClass("remove__");

                let isRemoved = false;
                targetTabEle.one(NC.event.whichTransitionEvent(targetTabEle), function(e){
                    if(!isRemoved) {
                        N(this).remove();
                        isRemoved = true;
                    }
                }).trigger("nothing");

                // Because targetTabEle does not remove in old version ios
                setTimeout(function() {
                    if(!isRemoved) {
                        targetTabEle.remove();
                        isRemoved = true;
                    }
                }, NC.event.getMaxDuration(targetTabEle, "transition-duration"));
            } else {
                targetTabEle.remove();
            }

            let targetTabContents = opts.context.find("> .docs_contents__." + targetTabDocOpts.docId + "__");
            if(targetTabContents.hasClass("visible__")) {
                targetTabContents.addClass("remove__");
                targetTabContents.one(NC.event.whichTransitionEvent(targetTabContents), function(e){
                    N(this).find("*").off();
                    N(this).remove();
                    targetTabContents = undefined;
                }).trigger("nothing");
            } else {
                targetTabContents.find("*").off();
                targetTabContents.remove();
                targetTabContents = undefined;
            }

            NUS.docs.closeBtnControl.call(this);

            delete opts.docs[targetTabDocOpts.docId];

            opts.order = N(opts.order).filter(function(i, val) {
                return val !== targetTabDocOpts.docId;
            }).get();

            if(opts.onRemove !== null) {
                opts.onRemove.call(this, targetTabDocOpts.docId);
            }
            if(targetTabDocOpts.onRemove !== null) {
                targetTabDocOpts.onRemove.call(this, targetTabDocOpts.docId);
            }

            if(isActiveTargetTabEle) {
                if(targetTabPrevEle.length > 0) {
                    targetTabPrevEle.find(".docs_tab_active_btn__").trigger("click");
                } else {
                    if(targetTabNextEle.length > 0) {
                        targetTabNextEle.find(".docs_tab_active_btn__").trigger("click");
                    }
                }
            } else {
                if(opts.tabScroll) {
                    const activatedTab = opts.context.find("> .docs_tab_context__ > .docs_tabs__ > .docs_tab__.active__");
                    if(activatedTab.length > 0) {
                        NUS.docs.clearScrollPosition.call(this, activatedTab);
                    }
                }
            }
        }

        context(sel) {
            return sel !== undefined ? this.options.context.find(sel) : this.options.context;
        };
        
        add(docId, docNm, docOpts) {
            const opts = this.options;
            const self = this;

            let beforeTabContents = opts.context.find("> .docs_contents__." + docId + "__");
            if(beforeTabContents.length > 0 && beforeTabContents.hasClass("remove__")) {
                opts.context.find("> .docs_tab_context__ > .docs_tabs__ > .docs_tab__." + docId + "__").remove();
                beforeTabContents.find("*").off();
                beforeTabContents.remove();
                beforeTabContents = undefined;
            }

            if(opts.context.find("> .docs_tab_context__ > .docs_tabs__ > .docs_tab__." + docId + "__").length === 0) {
                if(opts.maxTabs !== 0 && opts.context.find("> .docs_tab_context__ > .docs_tabs__ > .docs_tab__").not(".remove__").length >= opts.maxTabs) {
                    NUS.notify({
                        html : true
                    }).add(NC.message.get(opts.message, "maxTabs", [String(opts.maxTabs)]));
                    return this;
                }

                const defer = jQuery.Deferred().done(function(docId, docNm, docOpts) {
                    opts.docs[docId] = {
                        docId : docId,
                        docNm : docNm,
                        url : null,
                        urlSync : true,
                        onBeforeLoad : null,
                        onLoad : null,
                        onBeforeActive : null,
                        onActive : null,
                        onBeforeInactive : null,
                        onInactive : null,
                        onBeforeRemoveState : null,
                        onRemoveState : null,
                        onBeforeRemove : null,
                        onRemove : null,
                        stateless : false
                    };
                    jQuery.extend(opts.docs[docId], docOpts);

                    const docsTabContext = opts.context.find("> .docs_tab_context__");

                    if(opts.multi) {
                        // Create tab
                        const tab = N("<li/>", {
                            "class" : "docs_tab__ " + opts.docs[docId].docId + "__ " + "inactive__"
                        }).data("docOpts", opts.docs[docId]);
                        N('<a/>', {
                            "href" : "#",
                            "class" : "docs_tab_active_btn__",
                            "title" : NC.message.get(opts.message, "selDocument", [ opts.docs[docId].docNm ])
                        })
                            .append(N("<span></span>", {
                                "text" : opts.docs[docId].docNm
                            }))
                            .on("click.docs", function(e) {
                                e.preventDefault();
                                self.active(docId, N(this).closest(".docs_tab_list__").length > 0);
                            }).appendTo(tab);

                        // Create tab's close button
                        N('<a/>', {
                            "href" : "#",
                            "class" : "docs_tab_close_btn__",
                            "title" : NC.message.get(opts.message, "close")
                        })
                            .append("<span></span>")
                            .on("click.docs", function(e) {
                                e.preventDefault();
                                if(N(this).closest(".docs_tab_list__").length === 0) {
                                    e.stopPropagation();
                                }

                                self.remove(docId);
                            }).appendTo(tab);
                        if(opts.addLast) {
                            tab.appendTo(docsTabContext.find("> .docs_tabs__"));
                        } else {
                            tab.prependTo(docsTabContext.find("> .docs_tabs__"));
                        }


                        NUS.docs.inactivateTab.call(self);

                        NUS.docs.closeBtnControl.call(self);
                    }

                    NUS.docs.loadContent.call(self, opts.docs[docId], function() {
                        this.active(docId, false, true);
                    });
                });

                self.removeState(function() {
                    defer.resolve(docId, docNm, docOpts);
                });
            } else {
                this.active(docId);
            }

            return this;
        };
        
        active(docId, isFromDocsTabList, isNotLoaded) {
            const opts = this.options;
            const self = this;

            if(opts.docs[docId] === undefined) {
                NC.warn("[NUS.docs]\"" + docId + "\" is invalid document id(docId)");
                return this;
            }

            if(opts.multi) {
                if(opts.docs[docId].stateless) {
                    self.removeState(function() {
                        NUS.docs.loadContent.call(this, opts.docs[docId], function() {
                            opts.docs[docId].stateless = false;
                            opts.context.find("> .docs_tab_context__ > .docs_tabs__ > .docs_tab__." + docId + "__").removeClass("stateless__");

                            self.active(docId, false, true);
                        });
                    });
                } else {
                    // Inactivate the current activated tab.
                    NUS.docs.inactivateTab.call(this);
                    // Hide the selected tab contents.
                    NUS.docs.hideTabContents.call(this, docId);

                    // Activate the selected tab.
                    NUS.docs.activateTab.call(self, docId, isFromDocsTabList, isNotLoaded);
                    // Show the selected tab contents.
                    NUS.docs.showTabContents.call(this, docId);
                }

                opts.order = N(opts.order).filter(function(i, val) {
                    return val !== docId;
                }).get();
                opts.order.unshift(docId);
                if(opts.order.length > opts.maxStateful) {
                    opts.order.pop();
                }

                if(!opts.docs[docId].stateless && opts.onActive !== null) {
                    opts.onActive.call(this, docId, isFromDocsTabList === undefined ? false : isFromDocsTabList, isNotLoaded === undefined ? false : isNotLoaded);
                }
                if(!opts.docs[docId].stateless && opts.docs[docId].onActive !== null) {
                    opts.docs[docId].onActive.call(this, docId, isFromDocsTabList === undefined ? false : isFromDocsTabList, isNotLoaded === undefined ? false : isNotLoaded);
                }
            } else {
                NUS.docs.hideTabContents.call(this, docId);
                NUS.docs.showTabContents.call(this, docId);
            }

            return this;
        };
        
        removeState(docId, callback) { // type of docId argument is undefined or string or function
            const opts = this.options;

            if(typeof docId === "function") {
                callback = docId;
                docId = undefined;
            }
            if(docId === undefined) {
                docId = opts.order[opts.order.length-1];
            }

            if(opts.maxStateful !== 0 && opts.order.length >= opts.maxStateful) {
                const targetTabEle = opts.context.find("> .docs_tab_context__ > .docs_tabs__ > .docs_tab__." + docId + "__");
                const targetTabDocOpts = targetTabEle.data("docOpts");

                if(opts.onBeforeRemoveState !== null) {
                    opts.onBeforeRemoveState.call(this, docId);
                }
                if(targetTabDocOpts.onBeforeRemoveState !== null) {
                    targetTabDocOpts.onBeforeRemoveState.call(this, docId);
                }

                const self = this;

                NA.context.attr("ui").alert.container = opts.context.find("> .docs_contents__:visible");
                opts.msgContext.alert({
                    html : true,
                    confirm : true,
                    msg : NC.message.get(opts.message, "maxStateful", [ targetTabDocOpts.docNm, String(opts.maxStateful) ]),
                    onOk : function() {
                        targetTabEle.addClass("stateless__");
                        targetTabDocOpts.stateless = true;
                        opts.context.find("> .docs_contents__." + docId + "__").remove();

                        if(opts.onRemoveState !== null) {
                            opts.onRemoveState.call(this, docId);
                        }
                        if(targetTabDocOpts.onRemoveState !== null) {
                            targetTabDocOpts.onRemoveState.call(this, docId);
                        }

                        callback.call(self, docId);
                    }
                }).show();
            } else {
                callback.call(this, docId);
            }

            return this;
        };
        
        remove(docId, unconditional) {
            const opts = this.options;

            if(opts.docs[docId] === undefined) {
                NC.warn("[NUS.docs]\"" + docId + "\" is invalid document id(docId)");
                return this;
            }

            const self = this;

            const targetTabEle = opts.context.find("> .docs_tab_context__ > .docs_tabs__ > .docs_tab__." + docId + "__");
            const targetTabDocOpts = targetTabEle.data("docOpts");

            if(opts.onBeforeRemove !== null) {
                opts.onBeforeRemove.call(this, docId);
            }
            if(targetTabDocOpts.onBeforeRemove !== null) {
                targetTabDocOpts.onBeforeRemove.call(this, docId);
            }

            const dataChangedInputEle = opts.context.find("> .docs_contents__." + docId + "__ .data_changed__");
            if(dataChangedInputEle.length === 0 || unconditional === true) {
                NUS.docs.remove.call(self, targetTabEle);
            } else {
                opts.msgContext.alert({
                    msg : NC.message.get(opts.message, "closeConf", [ opts.docs[docId].docNm ]),
                    confirm : true,
                    onOk : function() {
                        NUS.docs.remove.call(self, targetTabEle);
                    },
                    onCancel : function() {
                        dataChangedInputEle.get(0).focus();
                    }
                }).show();
            }
            return this;
        };
        
        doc(docId) {
            if(docId !== undefined) {
                return this.options.docs[docId];
            }
            return this.options.docs;
        };
        
        cont(docId) {
            return this.context(".docs_contents__." + docId + "__ > .view_context__").instance("cont");
        };
        
        reload(docId, callback) {
            const cont = this.cont(docId);

            if(!cont) {
                NC.warn("[NUS.docs]\"" + docId + "\" is invalid document id(docId)");
                return this;
            }

            const comm = cont.request.options.target.comm(cont.request.options.url);
            comm.request = cont.request;

            // set current NA.comm's request from NUS.docs's request;
            jQuery.extend(comm.request.attrObj, this.request.attrObj);
            this.request.attrObj = {};

            comm.submit(callback);

            return this;
        };
        
    }

}

