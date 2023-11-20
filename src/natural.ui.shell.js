/*!
 * Natural-UI.Shell v0.9.47, Works fine in IE9 and above
 *
 * Released under the LGPL v2.1 license
 * Date: 2014-09-26T11:11Z
 *  
 * Copyright 2014 KIM HWANG MAN(bbalganjjm@gmail.com)
 */
(function(window, $) {
    N.version["Natural-UI.Shell"] = "0.9.47";

    $.fn.extend($.extend(N.prototype, {
        notify : function(opts) {
            return new N.notify(this, opts);
        },
        docs : function(opts) {
            return new N.docs(this, opts);
        }
    }));

    (function(N) {
        // Notify
        var Notify = N.notify = function(position, opts) {
            if(arguments.length === 1 && !N.isEmptyObject(position)) {
                return new N.notify(null, position);
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
                $.extend(this.options, N.context.attr("ui.shell").notify);
                
                if(position) {
                    if(N.isWrappedSet(position)) {
                        if(position.length > 0) {
                            this.options.position = position.get(0);
                        }
                    } else {
                        if(!N.isEmptyObject(position)) {
                            this.options.position = position;
                        }
                    }
                }
            } catch (e) {
                N.error("N.notify", e);
            }

            if(!N.isEmptyObject(opts)) {
                $.extend(this.options, opts);
            }

            Notify.wrapEle.call(this);

            this.options.context.instance("notify", this);

            return this;
        };

        $.extend(Notify, {
            add : function(msg, url) {
                (new N.notify()).add(msg, url);
            },
            wrapEle : function() {
                var opts = this.options;
                if(opts.container.find(".notify__").length > 0) {
                    opts.context = opts.container.find(".notify__");
                } else {
                    opts.context = $("<div></div>").addClass("notify__").css({
                        "position" : "fixed"
                    }).appendTo(opts.container);
                }
                if(opts.alwaysOnTop) {
                    // get maximum "z-index" value
                    opts.context.css("z-index", String(N.element.maxZindex(N(opts.alwaysOnTopCalcTarget)) + 1));
                }
            }
        });

        $.extend(Notify.prototype, {
            "context" : function(sel) {
                return sel !== undefined ? this.options.context.find(sel) : this.options.context;
            },
            "add" : function(msg, url) {
                var opts = this.options;
                var self = this;

                opts.context.css({
                   top : "",
                   right : "",
                   bottom : "",
                   left : ""
                });
                opts.context.css(opts.position);
                
                var msgEle = $(url !== undefined ? '<a href="#"></a>' : '<span></span>');
                msgEle[ opts.html ? "html" : "text" ](msg);

                if(url !== undefined) {
                    msgEle.on("click.notify", function(e) {
                        e.preventDefault();
                        if(N.type(url) === "function") {
                            url.call(this);
                        } else {
                            if(N.string.startsWith(url, "#")) {
                                location.hash = url;
                            } else {
                                location.href = url;
                            }
                        }
                    });
                }

                var msgBoxEle = $("<div></div>", {
                    "class" : "notify_msg__"
                }).css({
                    "display": "none",
                    "position" : "relative"
                }).append(msgEle).appendTo(opts.context).show().addClass("visible__");

                $('<a href="#" class="notify_msg_close__" title="' + N.message.get(opts.message, "close") + '"><span></span></a>')
                .appendTo(msgBoxEle).on("click.notify", function(e) {
                    e.preventDefault();
                    self.remove(msgBoxEle);
                });

                setTimeout(function() {
                    self.remove(msgBoxEle);
                }, opts.displayTime * 1000);

                return this;
            },
            "remove" : function(msgBoxEle) {
                msgBoxEle.removeClass("visible__").addClass("hidden__");

                msgBoxEle.one(N.event.whichTransitionEvent(msgBoxEle), function(e){
                    $(this).remove();
                }).trigger("nothing");

                return this;
            }
        });

        // Documents
        var Documents = N.docs = function(obj, opts) {
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
                msgContext : $(window),
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
                docsFilterDefers : [],
                loadedDocId : null
            };

            try {
                $.extend(true, this.options, N.context.attr("ui.shell").docs);
            } catch (e) {
                N.error("N.docs", e);
            }
            $.extend(this.options, opts);

            var self = this;
            if(self.options.onBeforeEntireLoad !== null
                    || self.options.onEntireLoad !== null
                    || self.options.entireLoadIndicator
                    || self.options.entireLoadScreenBlock) {
                var entireLoadExcludeURLs = "|" + this.options.entireLoadExcludeURLs.join("|") + "|";
                
                N.context.attr("architecture").comm.filters.docsFilter__ = {
                    "beforeSend" : function(request, xhr, settings) {
                        if(self.options.loadedDocId !== null) {
                            if(self.options.entireLoadRequestCnt === 0) {
                                if(self.options.onBeforeEntireLoad !== null) {
                                    self.options.onBeforeEntireLoad.call(self, self.options.loadedDocId);
                                }
                                
                                Documents.createLoadIndicator.call(self);
                            }
                            
                            if(entireLoadExcludeURLs.indexOf(request.options.url) < 0) {
                                self.options.entireLoadRequestCnt++;
                                if(self.options.entireLoadIndicator) {
                                    self.options.entireLoadRequestMaxCnt++;
                                }
                            }
                            
                            // Direct regist the error handler to N.comm's errorHandlers
                            this.errorHandlers.push(function(e, request, xhr, textStatus, callback) {
                                if(self.options.onErrorEntireLoad !== null) {
                                    self.options.onErrorEntireLoad.call(self, e, request, xhr, textStatus, callback);
                                }
                                
                                Documents.errorLoadIndicator.call(self);
                                
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
                                    Documents.updateLoadIndicator.call(self);
                                }
                            }
                            if(self.options.entireLoadRequestCnt <= 0) {
                                if(self.options.onEntireLoad !== null) {
                                    self.options.onEntireLoad.call(self, self.options.loadedDocId, self.options.entireLoadRequestCnt, self.options.entireLoadRequestMaxCnt);
                                }

                                Documents.removeLoadIndicator.call(self);
                                
                                self.options.entireLoadRequestMaxCnt = 0;
                                
                                // Correct the wrong entireLoadRequestCnt value.
                                self.options.entireLoadRequestCnt = 0;
                            }
                        }
                    }
                };

                N.comm.resetFilterConfig();
            }

            // set Controller's request instance
            this.request = new N.comm.request(this);

            Documents.wrapEle.call(this);

            if(this.options.tabScroll) {
                Documents.wrapScroll.call(this);
            }
            
            this.options.context.instance("docs", this);

            return this;
        };

        $.extend(Documents, {
            createLoadIndicator : function() {
                var opts = this.options;
                
                var maxZindex;
                if(opts.entireLoadScreenBlock) {
                    maxZindex = N.element.maxZindex(N(opts.alwaysOnTopCalcTarget).not(".entire_load_screen_block__, .entire_load_indicator__")) + 1;
                    var entireLoadScreenBlock = $(".entire_load_screen_block__");
                    if(entireLoadScreenBlock.length > 0) {
                        entireLoadScreenBlock.removeClass("hidden__").show().css("z-index", String(maxZindex));
                    } else {
                        var entireLoadScreenBlock = $('<div class="entire_load_screen_block__"></div>')
                        .css("z-index", String(maxZindex))
                        .on("click", function(e) {
                            e.stopPropagation();
                        });
                        entireLoadScreenBlock.appendTo("body").on(N.event.whichTransitionEvent(entireLoadScreenBlock), function(e){
                            $(this).hide().removeClass("hidden__");
                        }).trigger("nothing");
                    }
                    entireLoadScreenBlock = undefined;
                }
                
                if(opts.entireLoadIndicator) {
                    if(maxZindex === undefined) {
                        maxZindex = N.element.maxZindex(N(opts.alwaysOnTopCalcTarget).not(".entire_load_screen_block__, .entire_load_indicator__")) + 1;
                    } else {
                        maxZindex += 1;
                    }
                    var entireLoadIndicator = opts.context.find("> .entire_load_indicator__");
                    if(entireLoadIndicator.length > 0) {
                        entireLoadIndicator.css("z-index", String(maxZindex)).removeClass("hidden__").show();
                        entireLoadIndicator.find("> .entire_load_indicator_bar__").css("left", "");
                    } else {
                        var entireLoadIndicator = $('<div class="entire_load_indicator__"><div class="entire_load_indicator_bar__"></div></div>').on("click", function(e) {
                            e.stopPropagation();
                        }).css("z-index", String(maxZindex));
                        opts.context.find(".docs_tab_context__").after(entireLoadIndicator);
                    }
                    entireLoadIndicator = undefined;
                }
                
                return this;
            },
            updateLoadIndicator : function(entireLoadRequestCnt, entireLoadRequestMaxCnt) {
                var opts = this.options;
                
                opts.context.find("> .entire_load_indicator__ > .entire_load_indicator_bar__")
                    .css("left", "-" + ((entireLoadRequestCnt ? entireLoadRequestCnt : opts.entireLoadRequestCnt) * 100 / (entireLoadRequestMaxCnt ? entireLoadRequestMaxCnt : opts.entireLoadRequestMaxCnt)) + "%");
                
                return this;
            },
            removeLoadIndicator : function() {
                var opts = this.options;
                
                if(opts.entireLoadIndicator) {
                    var entireLoadIndicator = opts.context.find("> .entire_load_indicator__");
                    entireLoadIndicator.addClass("hidden__").one(N.event.whichTransitionEvent(entireLoadIndicator), function(e){
                        $(this).hide();
                    }).trigger("nothing");
                    entireLoadIndicator.find("> .entire_load_indicator_bar__").css("left", "0");
                }
                if(opts.entireLoadScreenBlock) {
                    N(".entire_load_screen_block__").trigger("nothing");
                }
                
                return this;
            },
            errorLoadIndicator : function() {
                var opts = this.options;
                
                if(opts.entireLoadIndicator) {
                    var entireLoadIndicator = opts.context.find("> .entire_load_indicator__");
                    entireLoadIndicator.one(N.event.whichTransitionEvent(entireLoadIndicator), function(e){
                        $(this).hide();
                    }).trigger("nothing");
                    
                    opts.context.find("> .entire_load_indicator__ > .entire_load_indicator_bar__").css("left", "");
                }
                if(opts.entireLoadScreenBlock) {
                    N(".entire_load_screen_block__").trigger("nothing");
                }
                
                return this;
            },
            wrapEle : function() {
                var opts = this.options;

                opts.context.addClass("docs__");
                if(N.browser.is("ios")) {
                    opts.context.addClass("ios__");
                }
                if(N.browser.is("android")) {
                    opts.context.addClass("android__");
                }

                if(opts.multi) {
                    opts.context.addClass("multi__");

                    var docsTabContext = $("<nav></nav>", {
                        "class" : "docs_tab_context__"
                    }).appendTo(opts.context);

                    var docsTabs = $("<ul/>", {
                        "class" : "docs_tabs__"
                    }).appendTo(docsTabContext);

                    var docsTabUtils = $("<ul/>", {
                        "class" : "docs_tab_utils__"
                    }).appendTo(docsTabContext);

                    var docsTabCloseAllItem = $("<li/>", {
                        "class" : "docs_tab_close_all_item__"
                    });

                    var self = this;
                    $("<a/>", {
                        "href" : "#",
                        "text" : N.message.get(opts.message, "closeAll"),
                        "title" : N.message.get(opts.message, "closeAllTitle")
                    }).on("click.docs", function(e) {
                        e.preventDefault();
                        if(opts.closeAllRedirectURL !== null) {
                            opts.msgContext.alert({
                                msg : N.message.get(opts.message, "closeAllDQ"),
                                confirm : true,
                                onOk : function() {
                                    window.location.href = opts.closeAllRedirectURL;
                                }
                            }).show();
                        } else {
                            var activeTab = opts.context.find("> .docs_tab_context__ > .docs_tabs__ > .docs_tab__.active__");
                            var activeSiblingTabs = activeTab.siblings();
                            if(activeSiblingTabs.length > 0) {
                                opts.msgContext.alert({
                                    msg : N.message.get(opts.message, "closeAllQ"),
                                    confirm : true,
                                    onOk : function() {
                                        var docId = activeTab.data("docOpts").docId;
                                        activeSiblingTabs.remove();
                                        opts.context.find("> .docs_contents__." + docId + "__").siblings(".docs_contents__").remove();
                                        Documents.closeBtnControl.call(self);
                                        Documents.clearScrollPosition.call(self, 0);
                                    }
                                }).show();
                            }                           
                        }
                    }).appendTo(docsTabCloseAllItem);
                    docsTabCloseAllItem.appendTo(docsTabUtils);

                    var docsTabListItem = $("<li/>", {
                        "class" : "docs_tab_list_item__"
                    });
                    var docsTabListBtn = $("<a/>", {
                        "href" : "#",
                        "text" : N.message.get(opts.message, "docList"),
                        "title" : N.message.get(opts.message, "docListTitle")
                    }).on("click.docs", function(e) {
                        e.preventDefault();
                        e.stopPropagation();

                        docsTabListBtn.find(".docs_tab_list__").remove();
                        var docsTabList = $("<ul/>").addClass("docs_tab_list__ hidden__").hide();

                        if(opts.alwaysOnTop) {
                            // get maximum "z-index" value
                            docsTabList.css("z-index", String(N.element.maxZindex(N(opts.alwaysOnTopCalcTarget)) + 1));
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

                        $(document).on("click.docs", function(e) {
                            $(document).off("click.docs");
                            docsTabList.removeClass("visible__").addClass("hidden__");
                            docsTabList.one(N.event.whichTransitionEvent(docsTabList), function(e){
                                $(this).remove();
                            }).trigger("nothing");
                        });

                        $(document).on("touchstart.docs", function(e) {
                            $(document).off("touchstart.docs");
                            if($(e.target).closest(".docs_tab_list__").length === 0) {
                                docsTabList.removeClass("visible__").addClass("hidden__");
                                docsTabList.one(N.event.whichTransitionEvent(docsTabList), function(e){
                                    $(this).remove();
                                }).trigger("nothing");
                            }
                        });
                    });

                    docsTabListBtn.appendTo(docsTabListItem);
                    docsTabListItem.appendTo(docsTabUtils);
                }
            },
            wrapScroll : function() {
                var opts = this.options;
                var eventNameSpace = ".docs.scroll";
                var tabContext = opts.context.find(">nav");
                var tabContainerEle = tabContext.find(">ul.docs_tabs__");
                var tabUtilsEleWidth = tabContext.find(">ul.docs_tab_utils__").outerWidth() + opts.tabScrollCorrection.rightCorrectionPx;
                
                var lastDistance = 0;

                $(window).on("resize" + eventNameSpace, function() {
                    var ulWidth = 0;
                    tabContainerEle.find(">li").each(function() {
                        ulWidth += ($(this).outerWidth() + parseInt(N.string.trimToZero($(this).css("margin-left"))) + parseInt(N.string.trimToZero($(this).css("margin-right"))));
                    });

                    if(ulWidth > 0 && ulWidth > tabContext.width() - tabUtilsEleWidth) {
                        tabContainerEle.addClass("docs_scroll__").width(ulWidth);
                    } else {
                        tabContainerEle.css("width", "");
                    }
                }).trigger("resize" + eventNameSpace);

                $(window).trigger("resize" + eventNameSpace);

                var sPageX;
                var prevDefGap = 77;
                var nextDefGap = 77;
                var isMoved = false;
                N.ui.draggable.events.call(tabContainerEle, eventNameSpace, function(e, tabContainerEle_, pageX, pageY) { // start
                    tabContainerEle_.removeClass("effect__");
                    if(tabContainerEle_.outerWidth() <= tabContext.innerWidth() - tabUtilsEleWidth) {
                        return false;
                    }
                    sPageX = pageX - parseInt(tabContainerEle_.css("margin-left"));
                }, function(e, tabContainerEle_, pageX, pageY) { // move
                    var distance = (sPageX - pageX) * -1;
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
            },
            clearScrollPosition : function(tabEle, isActive) {
                var opts = this.options;
                
                var tabContext = opts.context.find(">nav");
                var tabContainerEle = tabContext.find(">ul.docs_tabs__");
                var marginLeft;
                
                if(N.type(tabEle) === "number") {
                    marginLeft = tabEle;
                } else {
                    var tabUtilsEleWidth = tabContext.find(">ul.docs_tab_utils__").outerWidth() + opts.tabScrollCorrection.rightCorrectionPx;
                    var tabContainerEleMarginLeft = parseInt(N.string.trimToZero(tabContainerEle.css("margin-left")));
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
            },
            loadContent : function(docOpts, callback) {
                var opts = this.options;
                opts.loadedDocId = docOpts.docId;

                if(!opts.multi) {
                    var docsContents = opts.context.find("section.docs_contents__")
                    if(docsContents.length > 0) {
                        docsContents.one(N.event.whichTransitionEvent(docsContents), function(e){
                            $(this).remove();
                        }).trigger("nothing");
                    }
                }
                var target = $("<section></section>", {
                    "class" : "docs_contents__ " + docOpts.docId + "__ " + "hidden__"
                }).appendTo(opts.context);

                var self = this;
                if(opts.onBeforeLoad !== null) {
                    opts.onBeforeLoad.call(this, docOpts.docId, target);
                }
                if(docOpts.onBeforeLoad !== null) {
                    docOpts.onBeforeLoad.call(this, docOpts.docId, target);
                }

                var comm = N.comm({
                    url : docOpts.url,
                    urlSync : docOpts.urlSync,
                    contentType : "text/html; charset=UTF-8",
                    dataType : "html",
                    type : "GET",
                    target : target
                });

                // set current N.comm's request from N.docs's request;
                $.extend(comm.request.attrObj, this.request.attrObj);
                this.request.attrObj = {};

                comm.submit(function(document) {
                    // Reset page context
                    N.context.attr("architecture").page.context = N.context.attr("ui").alert.container = target;

                    var cont = target.html(document).children(".view_context__:last").instance("cont");

                    // set tab instance to tab contents Controller
                    if(cont !== undefined) {
                        // set caller attribute in conteroller in tab content that is Tab instance
                        cont.caller = self;

                        // triggering "init" method
                        N.cont.trInit.call(this, cont, this.request);
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
            },
            closeBtnControl : function() {
                var opts = this.options;
                var tabs = opts.context.find("> .docs_tab_context__ > .docs_tabs__ > .docs_tab__:not('.remove__')");
                if(tabs.length === 1) {
                    tabs.find("> .docs_tab_close_btn__").hide();
                } else {
                    tabs.find("> .docs_tab_close_btn__:not(':visible')").show();
                }
            },
            inactivateTab : function() {
                var opts = this.options;

                var currActiveTab = opts.context.find(".docs_tab_context__ > .docs_tabs__ > .docs_tab__.active__");
                var currActiveTabDocOpts = currActiveTab.data("docOpts");

                if(currActiveTab.length > 0) {
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
            },
            activateTab : function(docId_, isFromDocsTabList_, isNotLoaded_) {
                var opts = this.options;

                var tabToActivate = opts.context.find("> .docs_tab_context__ > .docs_tabs__ > .docs_tab__." + docId_ + "__");

                // Activate inactived tab and tab contents
                if(isFromDocsTabList_ && !opts.tabScroll) {
                    tabToActivate.prependTo(tabToActivate.parent());                        
                }
                if(opts.tabScroll) {
                    Documents.clearScrollPosition.call(this, tabToActivate, true);
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
            },
            showTabContents : function(docId_) {
                var opts = this.options;

                var tabContents_ = opts.context.find("> .docs_contents__." + docId_ + "__");

                if(tabContents_.hasClass("visible__")) {
                    return false;
                }
                
                // Reset page context
                N.context.attr("architecture").page.context = N.context.attr("ui").alert.container = tabContents_;

                tabContents_.show(0, function() {
                    tabContents_.addClass("visible__").one(N.event.whichTransitionEvent(tabContents_), function(e){
                        tabContents_.siblings(".docs_contents__.hidden__").hide();
                    }).removeClass("hidden__");
                });
            },
            hideTabContents : function(docId_) {
                var opts = this.options;

                var tabContents_ = opts.context.find("> .docs_contents__." + docId_ + "__");

                if(tabContents_.siblings(".docs_contents__.visible__").length > 0) {
                    opts.context.css("position", "relative");
                    tabContents_.siblings(".docs_contents__.visible__").removeClass("visible__").one(N.event.whichTransitionEvent(tabContents_), function(e){
                        opts.context.css("position", "");
                        if($(this).hasClass("hidden__")) {
                            $(this).hide();
                        }
                    }).addClass("hidden__").trigger("nothing");
                }
            },
            remove : function(targetTabEle) {
                var opts = this.options;
                var targetTabDocOpts = targetTabEle.data("docOpts");
                var targetTabPrevEle = targetTabEle.prev();
                var targetTabNextEle = targetTabEle.next();
                var isActiveTargetTabEle = targetTabEle.hasClass("active__");
                
                if(isActiveTargetTabEle) {
                    targetTabEle.addClass("remove__");

                    var isRemoved = false;
                    targetTabEle.one(N.event.whichTransitionEvent(targetTabEle), function(e){
                        if(!isRemoved) {
                            $(this).remove();
                            isRemoved = true;                           
                        }
                    }).trigger("nothing");

                    // Because targetTabEle does not remove in old version ios 
                    setTimeout(function() {
                        if(!isRemoved) {
                            targetTabEle.remove();
                            isRemoved = true;
                        }
                    }, N.event.getMaxDuration(targetTabEle, "transition-duration"));
                } else {
                    targetTabEle.remove();
                }

                var targetTabContents = opts.context.find("> .docs_contents__." + targetTabDocOpts.docId + "__");
                if(targetTabContents.hasClass("visible__")) {
                    targetTabContents.addClass("remove__");
                    targetTabContents.one(N.event.whichTransitionEvent(targetTabContents), function(e){
                        $(this).find("*").off();
                        $(this).remove();
                        targetTabContents = undefined;
                    }).trigger("nothing");
                } else {
                    targetTabContents.find("*").off();
                    targetTabContents.remove();
                    targetTabContents = undefined;
                }

                Documents.closeBtnControl.call(this);

                delete opts.docs[targetTabDocOpts.docId];

                opts.order = $(opts.order).filter(function(i, val) {
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
                        var activatedTab = opts.context.find("> .docs_tab_context__ > .docs_tabs__ > .docs_tab__.active__");
                        if(activatedTab.length > 0) {
                            Documents.clearScrollPosition.call(this, activatedTab);
                        }
                    }
                }
            }
        });

        $.extend(Documents.prototype, {
            "context" : function(sel) {
                return sel !== undefined ? this.options.context.find(sel) : this.options.context;
            },
            "add" : function(docId, docNm, docOpts) {
                var opts = this.options;
                var self = this;

                var beforeTabContents = opts.context.find("> .docs_contents__." + docId + "__");
                if(beforeTabContents.length > 0 && beforeTabContents.hasClass("remove__")) {
                    opts.context.find("> .docs_tab_context__ > .docs_tabs__ > .docs_tab__." + docId + "__").remove();
                    beforeTabContents.find("*").off();
                    beforeTabContents.remove();
                    beforeTabContents = undefined;
                }
                
                if(opts.context.find("> .docs_tab_context__ > .docs_tabs__ > .docs_tab__." + docId + "__").length === 0) {
                    if(opts.maxTabs !== 0 && opts.context.find("> .docs_tab_context__ > .docs_tabs__ > .docs_tab__").not(".remove__").length >= opts.maxTabs) {
                        N.notify({
                            html : true
                        }).add(N.message.get(opts.message, "maxTabs", [String(opts.maxTabs)]));
                        return this;
                    }

                    var defer = $.Deferred().done(function(docId, docNm, docOpts) {
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
                        $.extend(opts.docs[docId], docOpts);

                        var docsTabContext = opts.context.find("> .docs_tab_context__");

                        if(opts.multi) {
                            // Create tab
                            var tab = $("<li/>", {
                                "class" : "docs_tab__ " + opts.docs[docId].docId + "__ " + "inactive__"
                            }).data("docOpts", opts.docs[docId]);
                            $('<a/>', {
                                "href" : "#",
                                "class" : "docs_tab_active_btn__",
                                "title" : N.message.get(opts.message, "selDocument", [ opts.docs[docId].docNm ])
                            })
                            .append($("<span></span>", {
                                "text" : opts.docs[docId].docNm
                            }))
                            .on("click.docs", function(e) {
                                e.preventDefault();
                                self.active(docId, $(this).closest(".docs_tab_list__").length > 0);
                            }).appendTo(tab);

                            // Create tab's close button
                            $('<a/>', {
                                "href" : "#",
                                "class" : "docs_tab_close_btn__",
                                "title" : N.message.get(opts.message, "close")
                            })
                            .append("<span></span>")
                            .on("click.docs", function(e) {
                                e.preventDefault();
                                if($(this).closest(".docs_tab_list__").length === 0) {
                                    e.stopPropagation();
                                }

                                self.remove(docId);
                            }).appendTo(tab);
                            if(opts.addLast) {
                                tab.appendTo(docsTabContext.find("> .docs_tabs__"));    
                            } else {
                                tab.prependTo(docsTabContext.find("> .docs_tabs__"));
                            }
                            

                            Documents.inactivateTab.call(self);

                            Documents.closeBtnControl.call(self);
                        }

                        Documents.loadContent.call(self, opts.docs[docId], function() {
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
            },
            "active" : function(docId, isFromDocsTabList, isNotLoaded) {
                var opts = this.options;
                var self = this;

                if(opts.docs[docId] === undefined) {
                    N.warn("[N.docs]\"" + docId + "\" is invalid document id(docId)");
                    return this;
                }
                
                if(opts.multi) {
                    if(opts.docs[docId].stateless) {
                        self.removeState(function() {
                            Documents.loadContent.call(this, opts.docs[docId], function() {
                                opts.docs[docId].stateless = false;
                                opts.context.find("> .docs_tab_context__ > .docs_tabs__ > .docs_tab__." + docId + "__").removeClass("stateless__");

                                self.active(docId, false, true);
                            });
                        });
                    } else {
                        // Inactivate the current activated tab.
                        Documents.inactivateTab.call(this);
                        // Hide the selected tab contents.
                        Documents.hideTabContents.call(this, docId);

                        // Activate the selected tab.
                        Documents.activateTab.call(self, docId, isFromDocsTabList, isNotLoaded);
                        // Show the selected tab contents.
                        Documents.showTabContents.call(this, docId);
                    }

                    opts.order = $(opts.order).filter(function(i, val) {
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
                    Documents.hideTabContents.call(this, docId);
                    Documents.showTabContents.call(this, docId);
                }

                return this;
            },
            "removeState" : function(docId, callback) { // type of docId argument is undefined or string or function
                var opts = this.options;

                if(N.type(docId) === "function") {
                    callback = docId;
                    docId = undefined;
                }
                if(docId === undefined) {
                    docId = opts.order[opts.order.length-1];
                }

                if(opts.maxStateful !== 0 && opts.order.length >= opts.maxStateful) {
                    var targetTabEle = opts.context.find("> .docs_tab_context__ > .docs_tabs__ > .docs_tab__." + docId + "__");
                    var targetTabDocOpts = targetTabEle.data("docOpts");

                    if(opts.onBeforeRemoveState !== null) {
                        opts.onBeforeRemoveState.call(this, docId);
                    }
                    if(targetTabDocOpts.onBeforeRemoveState !== null) {
                        targetTabDocOpts.onBeforeRemoveState.call(this, docId);
                    }

                    var self = this;

                    N.context.attr("ui").alert.container = opts.context.find("> .docs_contents__:visible");
                    opts.msgContext.alert({
                        html : true,
                        confirm : true,
                        msg : N.message.get(opts.message, "maxStateful", [ targetTabDocOpts.docNm, String(opts.maxStateful) ]),
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
            },
            "remove" : function(docId, unconditional) {
                var opts = this.options;

                if(opts.docs[docId] === undefined) {
                    N.warn("[N.docs]\"" + docId + "\" is invalid document id(docId)");
                    return this;
                }

                var self = this;

                var targetTabEle = opts.context.find("> .docs_tab_context__ > .docs_tabs__ > .docs_tab__." + docId + "__");
                var targetTabDocOpts = targetTabEle.data("docOpts");

                if(opts.onBeforeRemove !== null) {
                    opts.onBeforeRemove.call(this, docId);
                }
                if(targetTabDocOpts.onBeforeRemove !== null) {
                    targetTabDocOpts.onBeforeRemove.call(this, docId);
                }

                var dataChangedInputEle = opts.context.find("> .docs_contents__." + docId + "__ .data_changed__");
                if(dataChangedInputEle.length === 0 || unconditional === true) {
                    Documents.remove.call(self, targetTabEle);                  
                } else {
                    opts.msgContext.alert({
                        msg : N.message.get(opts.message, "closeConf", [ opts.docs[docId].docNm ]),
                        confirm : true,
                        onOk : function() {
                            Documents.remove.call(self, targetTabEle);
                        },
                        onCancel : function() {
                            dataChangedInputEle.get(0).focus();
                        }
                    }).show();
                }
                return this;
            },
            "doc" : function(docId) {
                if(docId !== undefined) {
                    return this.options.docs[docId];
                }
                return this.options.docs;
            },
            "cont" : function(docId) {
                return this.context(".docs_contents__." + docId + "__ > .view_context__").instance("cont");
            },
            "reload" : function(docId, callback) {
                var cont = this.cont(docId);
                
                if(!cont) {
                    N.warn("[N.docs]\"" + docId + "\" is invalid document id(docId)");
                    return this;
                }
                
                var comm = cont.request.options.target.comm(cont.request.options.url);
                comm.request = cont.request;

                // set current N.comm's request from N.docs's request;
                $.extend(comm.request.attrObj, this.request.attrObj);
                this.request.attrObj = {};

                comm.submit(callback);
                
                return this;
            }
        });

    })(N);

})(window, jQuery);