/*!
 * Natural-UI.Shell v0.8.1.7, Works fine in IE9 and above
 * bbalganjjm@gmail.com
 *
 * Copyright 2017 KIM HWANG MAN
 * Released under the LGPL license
 *
 * Date: 2017-05-11T20:00Z
 */
(function(window, $) {
	N.version["Natural-UI.Shell"] = "v0.8.1.7";

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
				alwaysOnTopCalcTarget : "div, span, ul, p, nav, article, section",
			};

			try {
				this.options = $.extend({}, this.options, N.context.attr("ui.shell").notify);
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
				N.error("[N.notify]" + e, e);
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
				opts.context.css(opts.position);
			}
		});

		$.extend(Notify.prototype, {
			"context" : function(sel) {
				return sel !== undefined ? this.options.context.find(sel) : this.options.context;
			},
			"add" : function(msg, url) {
				var opts = this.options;
				var self = this;

				var msgEle = $(url !== undefined ? '<a href="#"></a>' : '<span></span>');
				msgEle[ opts.html ? "html" : "text" ](msg);

				if(url !== undefined) {
					msgEle.bind("click.notify", function(e) {
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
				.appendTo(msgBoxEle).bind("click.notify", function(e) {
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

				msgBoxEle.one(N.element.whichTransitionEvent(msgBoxEle), function(e){
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
				entireLoadIndicator : false,
				entireLoadScreenBlock : false,
				onEntireLoadXhrCaptureDuration : 300,
				onBeforeLoad : null,
				onLoad : null,
				onBeforeEntireLoad : null,
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
				alwaysOnTopCalcTarget : "div, span, ul, p, nav, article, section",
				order : [],
				docsFilterDefers : [],
				loadedDocId : null
			};

			try {
				this.options = $.extend({}, this.options, N.context.attr("ui.shell").docs);
			} catch (e) {
				N.error("[N.docs]" + e, e);
			}
			$.extend(this.options, opts);

			var self = this;
			if(self.options.onBeforeEntireLoad !== null
					|| self.options.onEntireLoad !== null
					|| self.options.entireLoadIndicator
					|| self.options.entireLoadScreenBlock) {
				var isStarted = false;
				var isBeforeDone = false;
				N.context.attr("architecture").comm.filters.docsFilter__ = {
					"beforeSend" : function(request, xhr, settings) {
						if(!isBeforeDone) {
							self.options.docsFilterDefers.push(xhr);
						}

						if(!isStarted) {
							isStarted = true;

							if(self.options.loadedDocId !== null) {
								if(self.options.dataType === "html" && self.options.target.closest("docs_contents__." + self.options.loadedDocId + "__").length === 0) {
									isStarted = false;
									return false;
								}

								if(self.options.entireLoadIndicator) {
									if(self.options.context.find("> .entire_load_indicator__").length > 0) {
										self.options.context.find("> .entire_load_indicator__").removeClass("hidden__").show();
									} else {
										var entireLoadIndicator = $('<div class="entire_load_indicator__"></div>').click(function(e) {
											e.stopPropagation();
										});
										entireLoadIndicator.bind(N.element.whichAnimationEvent(entireLoadIndicator), function(e){
											$(this).hide().removeClass("hidden__");
								        }).trigger("nothing");
										self.options.context.find(".docs_tab_context__").after(entireLoadIndicator);
									}
								}

								if(self.options.entireLoadScreenBlock) {
									var maxZindex = N.element.maxZindex(N(self.options.alwaysOnTopCalcTarget)) + 1;
									if($(".entire_load_screen_block__").length > 0) {
										$(".entire_load_screen_block__").css({
											"z-index" : String(maxZindex)
										}).removeClass("hidden__").show();
									} else {
										var entireLoadScreenBlock = $('<div class="entire_load_screen_block__"></div>').css({
											"z-index" : String(maxZindex)
										}).click(function(e) {
											e.stopPropagation();
										});
										entireLoadScreenBlock.appendTo("body").bind(N.element.whichAnimationEvent(entireLoadScreenBlock), function(e){
											$(this).hide().removeClass("hidden__");
								        }).trigger("nothing");
									}
								}
								if(self.options.onBeforeEntireLoad !== null) {
									self.options.onBeforeEntireLoad.call(self, self.options.loadedDocId);
								}

								setTimeout(function() {
									isBeforeDone = true;
									$.when.apply($, self.options.docsFilterDefers).done(function() {
										if(self.options.onEntireLoad !== null) {
											self.options.onEntireLoad.call(self, self.options.loadedDocId);
										}
										if(self.options.entireLoadIndicator) {
											self.options.context.find("> .entire_load_indicator__").trigger("nothing");
										}
										if(self.options.entireLoadScreenBlock) {
											$(".entire_load_screen_block__").trigger("nothing");
										}
										self.options.docsFilterDefers = [];
										isBeforeDone = false;
										isStarted = false;
									});
								}, self.options.onEntireLoadXhrCaptureDuration);
							} else {
								isStarted = false;
							}
						}
					}
				};
			}

			// set Controller's request instance
			this.request = new N.comm.request(this);

			Documents.wrapEle.call(this);

			this.options.context.instance("docs", this);

			return this;
		};

		$.extend(Documents, {
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
					}).bind("click.docs", function(e) {
						e.preventDefault();
						var activeTab = opts.context.find("> .docs_tab_context__ > .docs_tabs__ > .docs_tab__.active__");
						var activeSiblingTabs = activeTab.siblings();
						if(activeSiblingTabs.length > 0) {
							opts.context.find("> .docs_tab_context__").alert({
								msg : N.message.get(opts.message, "closeAllQ"),
								confirm : true,
								onOk : function() {
									var docId = activeTab.data("docOpts").docId;
									activeSiblingTabs.remove();
									opts.context.find("> .docs_contents__." + docId + "__").siblings(".docs_contents__").remove();
									Documents.closeBtnControl.call(self);
								}
							}).show();
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
					}).bind("click.docs", function(e) {
						e.preventDefault();
						e.stopPropagation();

						docsTabListBtn.find(".docs_tab_list__").remove();
						var docsTabList = $("<ul/>").addClass("docs_tab_list__ hidden__").hide();

						if(opts.alwaysOnTop) {
							// get maximum "z-index" value
							docsTabList.css("z-index", String(N.element.maxZindex(N(opts.alwaysOnTopCalcTarget)) + 1));
						}
						docsTabList
							.html(opts.context.find("> .docs_tab_context__ > .docs_tabs__ > .docs_tab__:not('.remove__')").clone(true, true))
							.show().removeClass("hidden__")
							.appendTo(docsTabListBtn);
						setTimeout(function() {
							docsTabList.addClass("visible__");
						}, 0);

						$(document).bind("click.docs", function(e) {
							$(document).unbind("click.docs");
							docsTabList.removeClass("visible__").addClass("hidden__");
							docsTabList.one(N.element.whichTransitionEvent(docsTabList), function(e){
					            $(this).remove();
					        }).trigger("nothing");
						});

						$(document).bind("touchstart.docs", function(e) {
							$(document).unbind("touchstart.docs");
							if($(e.target).closest(".docs_tab_list__").length === 0) {
								docsTabList.removeClass("visible__").addClass("hidden__");
								docsTabList.one(N.element.whichTransitionEvent(docsTabList), function(e){
						            $(this).remove();
						        }).trigger("nothing");
							}
						});
					});

					docsTabListBtn.appendTo(docsTabListItem);
					docsTabListItem.appendTo(docsTabUtils);
				}
			},
			loadContent : function(docOpts, callback) {
				var opts = this.options;
				opts.loadedDocId = docOpts.docId;

				if(!opts.multi) {
					var docsContents = opts.context.find("section.docs_contents__")
					if(docsContents.length > 0) {
						docsContents.one(N.element.whichTransitionEvent(docsContents), function(e){
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
				if(isFromDocsTabList_) {
					tabToActivate.prependTo(tabToActivate.parent());
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
				tabContents_.parent().append(tabContents_);

				// Reset page context
				N.context.attr("architecture").page.context = N.context.attr("ui").alert.container = tabContents_;

				tabContents_.show(0, function() {
					tabContents_.addClass("visible__").removeClass("hidden__");
				});
			},
			hideTabContents : function(docId_) {
				var opts = this.options;

				var tabContents_ = opts.context.find("> .docs_contents__." + docId_ + "__");

				if(tabContents_.siblings(".docs_contents__.visible__").length > 0) {
					opts.context.css("position", "relative");
					tabContents_.siblings(".docs_contents__.visible__").one(N.element.whichTransitionEvent(tabContents_), function(e){
						$(this).hide();
						opts.context.css("position", "");
			        }).addClass("hidden__").removeClass("visible__").trigger("nothing");
				}
			},
			remove : function(targetTabEle) {
				var opts = this.options;
				var targetTabDocOpts = targetTabEle.data("docOpts");

				if(targetTabEle.hasClass("active__")) {
					targetTabEle.addClass("remove__");
					targetTabEle.one(N.element.whichTransitionEvent(targetTabEle), function(e){
			            $(this).remove();
			        }).trigger("nothing");
				} else {
					targetTabEle.remove();
				}

				var targetTabContents = opts.context.find("> .docs_contents__." + targetTabDocOpts.docId + "__");
				if(targetTabContents.hasClass("visible__")) {
					targetTabContents.addClass("remove__");
					targetTabContents.one(N.element.whichTransitionEvent(targetTabContents), function(e){
			            $(this).remove();
			        }).trigger("nothing");
				} else {
					targetTabContents.remove();
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

				if(targetTabEle.hasClass("active__")) {
					if(targetTabEle.prev().length > 0) {
						targetTabEle.prev().find(".docs_tab_active_btn__").click();
					} else {
						if(targetTabEle.next().length > 0) {
							targetTabEle.next().find(".docs_tab_active_btn__").click();
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

				if(opts.context.find("> .docs_tab_context__ > .docs_tabs__ > .docs_tab__." + docId + "__").length === 0) {
					if(opts.maxTabs !== 0 && opts.context.find("> .docs_tab_context__ > .docs_tabs__ > .docs_tab__").length >= opts.maxTabs) {
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
							.bind("click.docs", function(e) {
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
							.bind("click.docs", function(e) {
								e.preventDefault();
								if($(this).closest(".docs_tab_list__").length === 0) {
									e.stopPropagation();
								}

								self.remove(docId);
							}).appendTo(tab);
							tab.prependTo(docsTabContext.find("> .docs_tabs__"));

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
					N(window).alert({
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
			"remove" : function(docId) {
				var opts = this.options;

				if(opts.docs[docId] === undefined) {
					return false;
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
				if(dataChangedInputEle.length > 0) {
					N(window).alert({
						msg : N.message.get(opts.message, "closeConf", [ opts.docs[docId].docNm ]),
						confirm : true,
						onOk : function() {
							Documents.remove.call(self, targetTabEle);
						},
						onCancel : function() {
							dataChangedInputEle.get(0).focus();
						}
					}).show();
				} else {
					Documents.remove.call(self, targetTabEle);
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
				var comm = cont.request.options.target.comm(cont.request.options.url);
				comm.request = cont.request;

				// set current N.comm's request from N.docs's request;
				$.extend(comm.request.attrObj, this.request.attrObj);
				this.request.attrObj = {};

				comm.submit(callback);
			}
		});

	})(N);

})(window, jQuery);