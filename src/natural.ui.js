/*!
 * Natural-UI v0.8.14.81
 * bbalganjjm@gmail.com
 *
 * Copyright 2014 KIM HWANG MAN
 * Released under the LGPL license
 *
 * Date: 2014-09-26T11:11Z
 */
(function(window, $) {
	N.version["Natural-UI"] = "v0.8.14.81";

	$.fn.extend($.extend(N.prototype, {
		alert : function(msg, vars) {
			return new N.alert(this, msg, vars);
		},
		button : function(opts) {
			if(this.is("input[type='button'], button, a")) {
				return this.each(function() {
					return new N.button(N(this), opts);
				});
			}
		},
		select : function(opts) {
			return new N.select(this, opts);
		},
		form : function(opts) {
			return new N.form(this, opts);
		},
		list : function(opts) {
			return new N.list(this, opts);
		},
		grid : function(opts) {
			return new N.grid(this, opts);
		},
		popup : function(opts) {
			return new N.popup(this, opts);
		},
		tab : function(opts) {
			return new N.tab(this, opts);
		},
		datepicker : function(opts) {
			return new N.datepicker(this, opts);
		},
		tree : function(opts) {
			return new N.tree(this, opts);
		},
		pagination : function(opts) {
			return new N.pagination(this, opts);
		}
	}));

	(function(N) {

		// Alert
		var Alert = N.alert = function(obj, msg, vars) {
			this.options = {
				obj : obj,
				context : obj,
				container : null,
				msgContext : N(),
				msgContents : null,
				msg : msg,
				vars : vars,
				html : false,
				top : undefined,
				left : undefined,
				width : 0,
		        height : 0,
				isInput : false,
				isWindow : obj.get(0) === window || obj.is(window.document) || obj.is("body"),
				title : obj.get(0) === window || obj.get(0) === window.document ? undefined : obj.attr("title"),
				button : true,
				closeMode : "remove", // closeMode : hide - keep element, remove - remove element
				modal : true,
				onOk : null,
				onCancel : null,
				overlayColor : null,
				overlayClose : true,
				"confirm" : false,
				alwaysOnTop : false,
				alwaysOnTopCalcTarget : "div, span, ul, p, nav, article, section",
				dynPos : true, // dynamic positioning for massage context and message overlay
				windowScrollLock : true,
				draggable : false,
				draggableOverflowCorrection : true,
				draggableOverflowCorrectionAddValues : {
					top : 0,
					bottom : 0,
					left : 0,
					right : 0
				}
			};

			try {
				// 1. When N.context.attr("ui").alert.container value is undefined
				this.options.container = N.context.attr("architecture").page.context;
				// 2. If defined the N.context.attr("ui").alert.container value to N.config, this.options.container value is defined from N.config's value
				this.options = $.extend({}, this.options, N.context.attr("ui").alert);
				if(N.isString(this.options.container)) {
					this.options.container = N(this.options.container);
				}
				this.options.draggableOverflowCorrectionAddValues = $.extend({}, this.options.draggableOverflowCorrectionAddValues, N.context.attr("ui").alert.draggableOverflowCorrectionAddValues);
			} catch (e) {
				N.error("[N.alert]" + e, e);
			}

			if (obj.is(":input")) {
				this.options.isInput = true;
			}
			if(msg !== undefined && N.isPlainObject(msg)) {
				$.extend(this.options, msg);
				if(N.isString(this.options.container)) {
					this.options.container = N(this.options.container);
				}
				// when the title option value is undefined
				// $.extend method does not extend undefined value
				if(msg.hasOwnProperty("title")) {
					this.options.title = msg.title;
				}
			}

			if(this.options.isWindow) {
				this.options.context = N("body");
			}

			if (!this.options.isInput) {
				Alert.wrapEle.call(this);

				// set this instance to msgContext element
				this.options.msgContents.instance("alert", this);
			} else {
				Alert.wrapInputEle.call(this);

				// set this instance to context element
				this.options.context.instance("alert", this);
			}

			return this;
		};

		$.extend(Alert, {
			wrapEle : function() {
				var opts = this.options;

				// set message overlay's default style
				var blockOverlayCss = {
					"display" : "none",
					"position" : opts.isWindow ? "fixed" : "absolute",
					"cursor" : "not-allowed",
					"padding" : 0
				};

				if(!opts.isWindow) {
					blockOverlayCss["border-radius"] = opts.context.css("border-radius") != "0px" ? opts.context.css("border-radius") : "0px";
				}

				var maxZindex = 0;
				if(opts.alwaysOnTop) {
					// get maximum "z-index" value
					maxZindex = N.element.maxZindex(N(opts.alwaysOnTopCalcTarget));
					blockOverlayCss["z-index"] = String(maxZindex + 1);
				}

				if (opts.overlayColor !== null) {
					blockOverlayCss["background-color"] = opts.overlayColor;
				}

				// create message overlay
				opts.msgContext = opts[opts.isWindow ? "container" : "context"][opts.isWindow ? "append" : "after"]($('<div class="block_overlay__" onselectstart="return false;"></div>')
						.css(blockOverlayCss))[opts.isWindow ? "find" : "siblings"](".block_overlay__:" + (opts.isWindow ? "last" : "first"));

				// set style class name to msgContext element
				opts.msgContext.addClass("alert_overlay__");

				if (opts.vars !== undefined) {
					opts.msg = N.message.replaceMsgVars(opts.msg, opts.vars);
				}

				// set message box's default style
				var blockOverlayMsgCss = {
					"display" : "none",
					"position" : opts.isWindow ? "fixed" : "absolute"
				};

				if(opts.alwaysOnTop) {
					blockOverlayMsgCss["z-index"] = String(maxZindex + 2);
				}

				// create title bar element
				var titleBox = '';
				if(opts.title !== undefined) {
					titleBox = '<div class="msg_title_box__"><span class="msg_title__">' + opts.title + '</span><a href="#" class="msg_title_close_btn__"><span class="msg_title_close__" title="' + N.message.get(opts.message, "close") + '"></span></a></div>';
				}

				// create button box elements
				var buttonBox = '';
				if(opts.button) {
					buttonBox = '<div class="buttonBox__">' +
						'<a href="#" class="confirm__"><span>' + N.message.get(opts.message, "confirm") + '</span></a>' +
						'<a href="#" class="cancel__"><span>' + N.message.get(opts.message, "cancel") + '</span></a>' +
						'</div>';
				}

				// create message box elements
				opts.msgContents = opts.msgContext.after(
						$('<div class="block_overlay_msg__">' +
								titleBox +
								'<div class="msg_box__"></div>' +
								buttonBox +
								'</div>').css(blockOverlayMsgCss)).next(".block_overlay_msg__:last");

				// set style class name to msgContents element
				opts.msgContents.addClass("alert__ hidden__");

				// bind event to close(X) button
				var self = this;
				opts.msgContents.find(".msg_title_box__ .msg_title_close_btn__").bind("click.alert touchend.alert", function(e) {
					e.preventDefault();
					if (opts.onCancel !== null) {
						opts.onCancel(opts.msgContext, opts.msgContents);
					}
					self[opts.closeMode]();
				});

				// set message
				opts.msgContents.find(".msg_box__")[ opts.html ? "html" : "text" ](opts.msg);

				// set width
				if(opts.width > 0) {
					opts.msgContents.find(".msg_box__").width(opts.width);
				}

				// set height
				if(opts.height > 0) {
					opts.msgContents.find(".msg_box__").height(opts.height).css("overflow-y", "auto");

					if(opts.windowScrollLock) {
			        	N.element.windowScrollLock(opts.msgContents.find(".msg_box__"));
			        }
				}

				//set confirm button style and bind click event
				opts.msgContents.find(".buttonBox__ a.confirm__").button(opts.global.okBtnStyle);
				opts.msgContents.find(".buttonBox__ a.confirm__").bind("click.alert", function(e) {
					e.preventDefault();
					if (opts.onOk !== null) {
						opts.onOk.call(self, opts.msgContext, opts.msgContents);
					}
					self[opts.closeMode]();
				});

				// remove modal overlay layer when opts.modal value is false
				if(!opts.modal) {
					opts.msgContext.remove();
				} else {
					if(opts.overlayClose) {
						opts.msgContext.bind("click.alert", function() {
							self[opts.closeMode]();
						});
					}
				}

				// set cancel button style and bind click event
				if(opts.confirm) {
					opts.msgContents.find(".buttonBox__ a.cancel__").button(opts.global.cancelBtnStyle);
					opts.msgContents.find(".buttonBox__ a.cancel__").bind("click.alert", function(e) {
						e.preventDefault();
						if (opts.onCancel !== null) {
							opts.onCancel(opts.msgContext, opts.msgContents);
						}
						self[opts.closeMode]();
					});
				} else {
					opts.msgContents.find(".cancel__").remove();
				}

				if(opts.draggable) {
					var pressed;
					var moved;
					var startX;
					var startY;
					var defMargin;
					opts.msgContents.addClass("draggable__").find(".msg_title_box__").bind("mousedown.alert touchstart.alert", function(e) {
						var dte;
						if(e.originalEvent.touches) {
							e.preventDefault();
							e.stopPropagation();
							dte = e.originalEvent.touches[0];
						}

						defMargin = opts.msgContents.css("margin");

						if(!$(dte !== undefined ? dte.target : e.target).is(".msg_title_close__") && (e.originalEvent.touches || (e.which || e.button) === 1)) {
							pressed = true;
							opts.msgContents.data("isMoved", true);

							startX = (dte !== undefined ? dte.pageX : e.pageX)- opts.msgContents.offset().left;
							startY = (dte !== undefined ? dte.pageY : e.pageY) - opts.msgContents.offset().top;

							$(window.document).bind("dragstart.alert selectstart.alert", function(e) {
			                    return false;
			                });

							moved = true;
							$(window.document).bind("mousemove.alert touchmove.alert", function(e) {
								var mte;
								if(e.originalEvent.touches) {
									e.stopPropagation();
									mte = e.originalEvent.touches[0];
								}
								if(pressed) {
									opts.msgContents.offset({
										top :  (mte !== undefined ? mte.pageY : e.pageY) - startY,
										left : (mte !== undefined ? mte.pageX : e.pageX) - startX
									});
								}

								if(moved) {
									opts.msgContents.fadeTo(200, "0.4");
									moved = false;
								}
							});

							var documentWidth = $(window.document).width();
							$(window.document).bind("mouseup.alert touchend.alert", function(e) {
								pressed = false;
								if(opts.draggableOverflowCorrection) {
									var offset = {};
									var windowHeight = window.innerHeight ? window.innerHeight : $(window).height();
									var windowScrollTop = $(window).scrollTop();
									var msgContentsOffsetTop = opts.msgContents.offset().top;
									var msgContentsOuterHeight = opts.msgContents.outerHeight();

									if(msgContentsOffsetTop - windowScrollTop < 0) {
										offset.top = (opts.isWindow ? 0
												: msgContentsOffsetTop + (windowScrollTop - msgContentsOffsetTop)) + opts.draggableOverflowCorrectionAddValues.top;
										offset.top -= parseFloat(opts.msgContents.css("margin-top"));
									} else if(msgContentsOffsetTop + msgContentsOuterHeight > windowScrollTop + windowHeight) {
										offset.top = (opts.isWindow ? windowHeight - msgContentsOuterHeight
												: windowScrollTop + windowHeight - msgContentsOuterHeight) + opts.draggableOverflowCorrectionAddValues.bottom;
										offset.top -= parseFloat(opts.msgContents.css("margin-top"));
									}
									if(offset.top < 0) {
										offset.top = 0 + opts.draggableOverflowCorrectionAddValues.top;
										offset.top -= parseFloat(opts.msgContents.css("margin-top"));
									}
									if(opts.msgContents.offset().left < 0) {
										offset.left = 0 + opts.draggableOverflowCorrectionAddValues.left;
									} else if(opts.msgContents.offset().left + opts.msgContents.outerWidth() > documentWidth) {
										offset.left = documentWidth - opts.msgContents.outerWidth() + opts.draggableOverflowCorrectionAddValues.right;
									}
									if(!N.isEmptyObject(offset)) {
										opts.msgContents.animate(offset, 200);
									}
								}

								opts.msgContents.fadeTo(100, "1.0");
								$(window.document).unbind("dragstart.alert selectstart.alert mousemove.alert touchmove.alert mouseup.alert touchend.alert");
							});
						}
					});
				}
			},
			resetOffSetEle : function(opts) {
				var position = opts.context.position();
				if(opts.context.is(":visible")) {
					// reset message context(overlay) position
					var msgContextCss = {
						"height" : opts.isWindow ? (window.innerHeight ? window.innerHeight : $(window).height()) : opts.context.outerHeight() + "px",
						"width" : opts.isWindow ? (window.innerWidth ? window.innerWidth : $(window).width()) : opts.context.outerWidth() + "px"
					}
					var marginLeft = 0;
					if(opts.isWindow) {
						msgContextCss.top = "0";
						msgContextCss.left = "0";
					} else {
						msgContextCss["margin-top"] = "-" + (parseFloat(msgContextCss.height) + parseFloat(opts.context.css("margin-bottom"))) + "px";
						marginLeft = parseFloat(opts.context.css("margin-left"));
						msgContextCss.left = String(opts.context.position().left + marginLeft) + "px";
					}
					opts.msgContext.css(msgContextCss).hide().show();

					if(opts.msgContents.data("isMoved") !== true) {
						// reset message contents position
						var msgContentsCss = {};
						if(opts.isWindow) {
							if(opts.top !== undefined) {
								msgContentsCss.position = "absolute";
								msgContentsCss.top = String(opts.top) + "px";
							} else {
								msgContentsCss.top = "0";
								msgContentsCss["margin-top"] = String(opts.msgContext.height() / 2 - opts.msgContents.height() / 2) + "px";
							}
							if(opts.left !== undefined) {
								msgContentsCss.left = String(opts.left) + "px";
							} else {
								msgContentsCss.left = "0";
							}
						} else {
							if(opts.top !== undefined) {
								msgContentsCss.position = "absolute";
								msgContentsCss.top = String(opts.top) + "px";
							} else {
								msgContentsCss["margin-top"] = "-" + String(opts.msgContext.height() / 2 + opts.msgContents.height() / 2 + parseFloat(opts.context.css("margin-bottom"))) + "px";
							}
						}
						if(opts.left !== undefined) {
							msgContentsCss.left = String(opts.left) + "px";
						} else {
							msgContentsCss.left = String(opts.context.position().left + marginLeft + (opts.msgContext.width() / 2 - opts.msgContents.width() / 2)) + "px";
						}
						opts.msgContents.css(msgContentsCss);
					}

					opts.msgContents.show();
				} else {
					// for non-active tab
					opts.msgContext.hide();
					opts.msgContents.hide();
				}
			},
			wrapInputEle : function() {
				var opts = this.options;

				if(opts.context.instance("alert") !== undefined) {
					opts.context.instance("alert").remove();
				}

				if (opts.msg.length > 0) {
					opts.msgContext = opts.context.next(".msg__");
					var isBeforeShow = false;
					if (opts.msgContext.length === 0) {
						var limitWidth = opts.context.offset().left + opts.context.outerWidth() + 150;

						if(limitWidth > (window.innerWidth ? window.innerWidth : $(window).width())) {
							opts.msgContext = opts.context.before('<span class="msg__ alert_before_show__" style="display: none;"><ul class="msg_line_box__"></ul></span>').prev(".msg__");
							opts.msgContext.addClass("orgin_right__");
							isBeforeShow = true;
						} else {
							opts.msgContext = opts.context.after('<span class="msg__ alert_after_show__" style="display: none;"><ul class="msg_line_box__"></ul></span>').next(".msg__");
							opts.msgContext.addClass("orgin_left__");
							isBeforeShow = false;
						}

						// set style class to msgContext element
						opts.msgContext.addClass("alert__ alert_tooltip__ hidden__");

						opts.msgContext.append('<a href="#" class="msg_close__" title="' + N.message.get(opts.message, "close") + '"></a>');
					}
					if(opts.alwaysOnTop) {
						opts.msgContext.css("z-index", N.element.maxZindex(opts.container.find(opts.alwaysOnTopCalcTarget)) + 1);
					}

					var self = this;
					opts.msgContext.find(".msg_close__").click(function(e) {
						e.preventDefault();
						self.remove();
					});

					var ul_ = opts.msgContext.find(".msg_line_box__").empty();
					if (N.isArray(opts.msg)) {
						opts.msgContext.find(".msg_line_box__").empty();
						$(opts.msg).each(function(i, msg_) {
							if (opts.vars !== undefined) {
								opts.msg[i] = N.message.replaceMsgVars(msg_, opts.vars);
							}
							ul_.append('<li>' + opts.msg[i] + '</li>');
						});
					} else {
						if (opts.vars !== undefined) {
							opts.msg = N.message.replaceMsgVars(msg, opts.vars);
						}
						ul_.append('<li>' + opts.msg + '</li>');
					}
					if(isBeforeShow) {
						opts.msgContext.css("margin-left", "-" + String(opts.msgContext.outerWidth()) + "px");
					}
				} else {
					this.remove();
				}
			}
		});

		$.extend(Alert.prototype, {
			"context" : function(sel) {
				return sel !== undefined ? this.options.context.find(sel) : this.options.context;
			},
			"show" : function() {
				var opts = this.options;
				var self = this;

				if (!opts.isInput) {
					Alert.resetOffSetEle(opts);

					if(opts.dynPos && !opts.isWindow) {
						opts.time = setInterval(function() {
							if(opts.context.is(":visible")) {
								Alert.resetOffSetEle(opts);
							}
						}, 500);
					}

					if(!opts.isWindow) {
						opts.msgContext.closest(".msg_box__").css("position", "relative");
					}

					// for when the window size is changed.
					$(window).bind("resize.alert", function() {
						Alert.resetOffSetEle(opts);
					});
					if(opts.button === true) {
						opts.msgContents.find(".buttonBox__ a.confirm__").get(0).focus();
					}

					opts.msgContents.removeClass("hidden__").addClass("visible__");
				} else {
					if (!N.isEmptyObject(opts.msg)) {
						opts.context.parent().css({
							"white-space": "normal"
						});

						opts.msgContext.show();

						opts.iTime = setTimeout(function() {
							clearTimeout(opts.iTime);
							opts.context.parent().css({
								"white-space": ""
							});
							self[opts.closeMode]();
						}, opts.input.displayTimeout);

						opts.msgContext.removeClass("hidden__").addClass("visible__");
					}
				}

				// if press the "ESC" key, alert dialog will be removed
				opts.onKeyup = function(e) {
					if ((e.keyCode ? e.keyCode : (e.which ? e.which : e.charCode)) == 27) {
		        		self[opts.closeMode]();
		        	}
				};
		        $(document).bind("keyup.alert", opts.onKeyup);

				return this;
			},
			"hide" : function() {
				var opts = this.options;
				if (!opts.isInput) {
					if(!opts.isWindow) {
						opts.msgContext.closest(".msg_box__").css("position", "");
					}
					opts.msgContext.hide();

					opts.msgContents.removeClass("visible__").addClass("hidden__");
					opts.msgContents.one(N.element.whichTransitionEvent(opts.msgContents), function(e){
						opts.msgContents.hide();
			        }).trigger("nothing");

				} else {
					opts.msgContents.removeClass("visible__").addClass("hidden__");
					opts.msgContents.one(N.element.whichTransitionEvent(opts.msgContents), function(e){
						clearTimeout(opts.iTime);
						opts.msgContext.remove();
			        }).trigger("nothing");
				}

				$(window).unbind("resize.alert");
				$(document).unbind("keyup.alert", opts.onKeyup);

				return this;
			},
			"remove" : function() {
				var opts = this.options;
				if (!opts.isInput) {
					clearInterval(opts.time);
					if(!opts.isWindow) {
						opts.msgContext.closest(".msg_box__").css("position", "");
					}
					opts.msgContext.remove();

					opts.msgContents.removeClass("visible__").addClass("hidden__");
					opts.msgContents.one(N.element.whichTransitionEvent(opts.msgContents), function(e){
						opts.msgContents.remove();
			        }).trigger("nothing");
				} else {
					opts.msgContext.removeClass("visible__").addClass("hidden__");
					opts.msgContext.one(N.element.whichTransitionEvent(opts.msgContext), function(e){
						clearTimeout(opts.iTime);
						opts.msgContext.remove();
			        }).trigger("nothing");
				}

				$(window).unbind("resize.alert");
				$(document).unbind("keyup.alert", opts.onKeyup);
				return this;
			}
		});

		// Button
		var Button = N.button = function(obj, opts) {
			this.options = {
				context : obj,
				size : "medium", // size : smaller, small, medium, large, big
				color : "white", // color : white, blue, skyblue, gray, green, yellowgreen
				iconClass : null,
				disable : false,
				customStyle : false
			};

			try {
				this.options = $.extend({}, this.options, N.context.attr("ui").button);
			} catch (e) {
				N.error("[N.button]" + e, e);
			}
			$.extend(this.options, N.element.toOpts(this.options.context));
			if(opts !== undefined) {
				$.extend(this.options, opts);
			}

			// set style class name to context element
			this.options.context.addClass("button__");

			Button.wrapEle.call(this);

			// set this instance to context element
			this.options.context.instance("button", this);

			return this;
		};

		$.extend(Button, {
			wrapEle : function() {
				var opts = this.options;

				if(opts.iconClass !== null) {
					opts.context.prepend('<span class="' + opts.iconClass + '"></span>');
				}

				if(opts.disable) {
					this.disable();
				} else {
					this.enable();
				}

				if(opts.context.is("a")) {
					opts.context.attr("onselectstart", "return false;");
	            }
		        if (opts.context.is("a") || opts.context.is("button") || opts.context.is("input[type='button']")) {
		        	opts.context.removeClass("btn_common__ btn_white__ btn_blue__ btn_skyblue__ btn_gray__ btn_smaller__ btn_small__ btn_medium__ btn_large__ btn_big__");
	                opts.context.addClass("btn_common__ btn_" + opts.color + "__ btn_" + opts.size + "__");

	                if(!opts.customStyle) {
	                	// for ie8
	                	if(N.browser.msieVersion() === 8 && opts.context.is("a")) {
	                		opts.context.css("line-height", "");
	                		if(opts.size === "smaller") {
	                			opts.context.css("line-height", "17px");
	                		} else if(opts.size === "small") {
	                			opts.context.css("line-height", "21px");
	                		} else if(opts.size === "medium") {
	                			opts.context.css("line-height", "26px");
	                		} else if(opts.size === "large") {
	                			opts.context.css("line-height", "34px");
	                		} else if(opts.size === "big") {
	                			opts.context.css("line-height", "48px");
	                		}
	                	}

	                	if(N.browser.msieVersion() === 9) {
	                		if(opts.context.is("a")) {
	                			opts.context.css("line-height", "");
	                		}
	                		opts.context.css("line-height", (parseInt(opts.context.css("line-height")) - 3) + "px");
	                	}
	                }

	                opts.context.unbind("mouseover.button mousedown.button mouseup.button mouseout.button");
	                opts.context.bind("mouseover.button", function() {
                		if (!opts.context.hasClass("btn_disabled__")) {
                			if(!opts.customStyle) {
                				if(N.browser.msieVersion() === 0 || N.browser.msieVersion() > 8) {
                					$(this).css("box-shadow", "rgba(0, 0, 0, 0.2) 1px 1px 1px inset");
                				} else {
            						$(this).css("opacity", "0.9");
                				}
                			}
                			$(this).removeClass("btn_mouseover__ btn_mousedown__ btn_mouseup__ btn_mouseout__");
                			$(this).addClass("btn_mouseover__");
                		}
	                });
	                opts.context.bind("mousedown.button", function() {
	                    if (!opts.context.hasClass("btn_disabled__")) {
	                    	if(!opts.customStyle) {
	                    		if(N.browser.msieVersion() === 0 || N.browser.msieVersion() > 8) {
	                    			$(this).css("box-shadow", "rgba(0, 0, 0, 0.2) 3px 3px 3px inset");
	                    		} else {
                    				$(this).css("opacity", "0.7");
	                    		}
	                    	}
	                    	$(this).removeClass("btn_mouseover__ btn_mousedown__ btn_mouseup__ btn_mouseout__");
	                    	$(this).addClass("btn_mousedown__");
	                    }
	                });
	                opts.context.bind("mouseup.button", function() {
	                    if (!opts.context.hasClass("btn_disabled__")) {
	                    	if(!opts.customStyle) {
	                    		if(N.browser.msieVersion() === 0 || N.browser.msieVersion() > 8) {
	                    			$(this).css("box-shadow", "none");
	                    		} else {
                    				$(this).css("opacity", "1");
	                    		}
	                    	}
	                    	$(this).removeClass("btn_mouseover__ btn_mousedown__ btn_mouseup__ btn_mouseout__");
	                    	$(this).addClass("btn_mouseup__");
	                    }
	                });
	                opts.context.bind("mouseout.button", function() {
	                    if (!opts.context.hasClass("btn_disabled__")) {
	                    	if(!opts.customStyle) {
	                    		if(N.browser.msieVersion() === 0 || N.browser.msieVersion() > 8) {
	                    			$(this).css("box-shadow", "none");
	                    		} else {
                    				$(this).css("opacity", "1");
	                    		}
	                    	}
	                    	$(this).removeClass("btn_mouseover__ btn_mousedown__ btn_mouseup__ btn_mouseout__");
	                    }
	                });
	            }
			}
		});

		$.extend(Button.prototype, {
			context : function(sel) {
				return sel !== undefined ? this.options.context.find(sel) : this.options.context;
			},
			disable : function() {
				var context = this.options.context;
		        if (context.is("a")) {
		        	context.unbind("click.button");
		            context.tpBind("click.button", N.element.disable);
		        } else {
		            context.prop("disabled", true);
		        }
		        context.addClass("btn_disabled__");
				return this;
			},
			enable : function() {
				var context = this.options.context;
		        if (context.is("a")) {
		            context.unbind("click", N.element.disable);
		        } else {
		            context.prop("disabled", false);
		        }
		        context.removeClass("btn_disabled__");
				return this;
			}
		});

		// DatePicker
		var DatePicker = N.datepicker = function(obj, opts) {
			this.options = {
				context : obj,
				contents : $('<div class="datepicker__"></div>'),
				monthonly : false,
				focusin : true,
				onSelect : null,
				onBeforeShow : null,
				onBeforeHide : null,
				onHide : null,
				shareEle : true
			};

			try {
				this.options = $.extend({}, this.options, N.context.attr("ui").datepicker);
			} catch (e) {
				N.error("[N.datepicker]" + e, e);
			}

			if(opts !== undefined) {
				$.extend(this.options, opts);
			}

			// set style class name to context element
			this.options.context.addClass("datepicker__");

			if(opts.monthonly) {
				if(this.options.shareEle && N(".datepicker_contents__.datepicker_monthonly__").length > 0) {
					DatePicker.wrapSingleEle.call(this);
				} else {
					if(this.options.shareEle) {
						this.options.context.addClass("datepicker_month_master__");
					}
					DatePicker.wrapEle.call(this);
				}
			} else {
				if(this.options.shareEle && N(".datepicker_contents__:not(.datepicker_monthonly__)").length > 0) {
					DatePicker.wrapSingleEle.call(this);
				} else {
					if(this.options.shareEle) {
						this.options.context.addClass("datepicker_date_master__");
					}
					DatePicker.wrapEle.call(this);
				}
			}

			// set this instance to context element
			this.options.context.instance("datepicker", this);
		};

		$.extend(DatePicker, {
			context : function() {
				return this.options.context;
			},
			wrapEle : function() {
				var opts = this.options;
				var self = this;

				var d = new Date();
				var currYear = parseInt(d.formatDate("Y"));
				var format = (!opts.monthonly ? N.context.attr("data").formatter.date.Ymd() : N.context.attr("data").formatter.date.Ym()).replace(/[^Y|^m|^d]/g, "");

				opts.contents = $('<div class="datepicker_contents__"></div>').bind("click.datepicker", function(e) {
					e.stopPropagation();
				}).addClass("hidden__");
				opts.context.bind("click.datepicker", function(e) {
					e.stopPropagation();
				});

				if(opts.monthonly) {
					opts.context.attr("maxlength", "6");
					opts.contents.addClass("datepicker_monthonly__");
				} else {
					opts.context.attr("maxlength", "8");
				}
				opts.contents.css({
					display: "none",
					position: "absolute"
				});

				// create year items
				var yearsPanel = $('<div class="datepicker_years_panel__"></div>');
				yearsPanel.css({
					"width": "40px",
					"float": "left"
				});
				var yearItem = $('<div align="center"></div>');
				yearItem.css({
					"line-height": "25px"
				}).click(function(e) {
					e.preventDefault();
					yearsPanel.find(".datepicker_year_item__").removeClass("datepicker_year_selected__");
					$(this).addClass("datepicker_year_selected__");
				});
				var yearItemClone;
				yearsPanel.append(yearItem.clone(true).addClass("datepicker_year_title__").text(N.message.get(opts.message, "year")));
				// render year items
				var i;
				for(i=currYear-2;i<=currYear+2;i++) {
					yearItemClone = yearItem.clone(true).addClass("datepicker_year_item__");
					if(i === currYear) {
						yearItemClone.addClass("datepicker_curr_year__");
						yearItemClone.addClass("datepicker_year_selected__");
					}
					yearsPanel.append(yearItemClone.text(String(i)));
				}

				var yearPaging = $('<div class="datepicker_year_paging__" align="center"><a href="#" class="datepicker_year_prev__" title="이전">◀</a><a href="#" class="datepicker_year_next__" title="다음">▶</a></div>');
				yearPaging.css({
					"line-height": "25px"
				});
				yearPaging.find(".datepicker_year_prev__").click(function(e) {
					e.preventDefault();
					DatePicker.yearPaging(yearsPanel.find(".datepicker_year_item__"), currYear, -5);
				});
				yearPaging.find("a.datepicker_year_next__").click(function(e) {
					e.preventDefault();
					DatePicker.yearPaging(yearsPanel.find(".datepicker_year_item__"), currYear, 5);
				});
				yearsPanel.append(yearPaging);
				opts.contents.append(yearsPanel);

				// create month items
				var monthsPanel = $('<div class="datepicker_months_panel__"></div>');
				monthsPanel.css({
					"width": "60px",
					"float": "left",
					"margin-left": "3px"
				});
				var monthItem = $('<div align="center"></div>');
				var gEndDate;

				monthItem.css({
					"line-height": "25px",
					"width": "28px",
					"float": "left"
				}).click(function(e, ke) {
					e.preventDefault();
					monthsPanel.find(".datepicker_month_item__").removeClass("datepicker_month_selected__");
					$(this).addClass("datepicker_month_selected__");
					if(opts.monthonly) {
						var selDate = N.date.strToDate(N.string.lpad(yearsPanel.find(".datepicker_year_selected__").text(), 4, "0") + N.string.lpad($(this).text(), 2, "0"), "Ym");
						// set date format of global config
						selDate.format = N.context.attr("data").formatter.date.Ym().replace(/[^Y|^m|^d]/g, "");

						var onSelectContinue;
						if(opts.onSelect !== null) {
							onSelectContinue = opts.onSelect.call(this, opts.context, selDate, opts.monthonly);
						}
						if(onSelectContinue === undefined || onSelectContinue === true) {
							opts.context.val(selDate.obj.formatDate(selDate.format.replace(/[^Y|^m|^d]/g, "")));
						}
						opts.context.trigger("onSelect", [opts.context, selDate, opts.monthonly]);

						self.hide(ke);
					} else {
						daysPanel.empty();
						var endDateCls = N.date.strToDate(N.string.lpad(yearsPanel.find(".datepicker_year_selected__").text(), 4, "0") +  N.string.lpad(String(parseInt($(this).text())+1), 2, "0") + "00", "Ymd");
						var endDate = endDateCls.obj.getDate();
						gEndDate = endDate;
						if(format !== "Ymd") {
							gEndDate = 31;
						}
						endDateCls.obj.setDate(1);
						var startDay = endDateCls.obj.getDay();
						//render week
						var j;
						for(j=0;j<days.length;j++) {
							daysPanel.append(dayItem.clone().addClass("datepicker_day__").text(days[j]));
						}

						var prevEndDateCls = N.date.strToDate(N.string.lpad(yearsPanel.find(".datepicker_year_selected__").text(), 4, "0") +  N.string.lpad($(this).text(), 2, "0") + "00", "Ymd");
						var prevEndDate = prevEndDateCls.obj.getDate();
						var date;
						var dateItem;
						//render date items
						for(j=1-startDay;j<=42-startDay;j++) {
							date = String(j);
							dateItem = dayItem.clone(true);
							if(j<=0) {
								dateItem.addClass("datepicker_prev_day_item__");
								date = String(prevEndDate + j);
							} else if(j > endDate) {
								dateItem.addClass("datepicker_next_day_item__");
								date = String(j-endDate);
							} else {
								dateItem.addClass("datepicker_day_item__");
							}
							daysPanel.append(dateItem.text(date));
						}

						if(daysPanel.find(".datepicker_day_selected__").length === 0) {
							daysPanel.find(".datepicker_day_item__:contains(" + String(parseInt(d.formatDate("d"))) + "):eq(0)").addClass("datepicker_day_selected__");
						}
					}
				});
				monthsPanel.append(monthItem.clone().css("width", "58px").addClass("datepicker_month_title__").text(N.message.get(opts.message, "month")));

				// render month items
				for(i=1;i<=12;i++) {
					monthsPanel.append(monthItem.clone(true).addClass("datepicker_month_item__").text(String(i)));
					if(monthsPanel.find(".datepicker_month_selected__").length === 0) {
						monthsPanel.find(".datepicker_month_item__:contains(" + String(parseInt(d.formatDate("m"))) + "):eq(0)").addClass("datepicker_month_selected__");
					}
				}
				opts.contents.append(monthsPanel);

				if(!opts.monthonly) {
					// create day items
					var days = N.message.get(opts.message, "days").split(",");
					var daysPanel = $('<div class="datepicker_days_panel__"></div>');
					daysPanel.css({
						"width": "210px",
						"float": "left",
						"margin-left": "3px"
					});
					var dayItem = $('<div align="center"></div>');
					dayItem.css({
						"line-height": "25px",
						"width": "28px",
						"float": "left"
					}).click(function(e, ke) {
						e.preventDefault();
						var thisEle = $(this);
						daysPanel.find(".datepicker_prev_day_item__, .datepicker_day_item__, .datepicker_next_day_item__").removeClass("datepicker_day_selected__");
						thisEle.addClass("datepicker_day_selected__");
						var selMonth;
						if(thisEle.hasClass("datepicker_prev_day_item__")) {
							selMonth = String(parseInt(monthsPanel.find(".datepicker_month_selected__").text()) - 1);
						} else if(thisEle.hasClass("datepicker_next_day_item__")) {
							selMonth = String(parseInt(monthsPanel.find(".datepicker_month_selected__").text()) + 1);
						} else {
							selMonth = monthsPanel.find(".datepicker_month_selected__").text();
						}
						var selDate = N.date.strToDate(N.string.lpad(yearsPanel.find(".datepicker_year_selected__").text(), 4, "0") +
								N.string.lpad(selMonth, 2, "0") +
								N.string.lpad(thisEle.text(), 2, "0"), "Ymd");
						// set date format of global config
						selDate.format = N.context.attr("data").formatter.date.Ymd().replace(/[^Y|^m|^d]/g, "");

						var onSelectContinue;
						if(opts.onSelect !== null) {
							onSelectContinue = opts.onSelect.call(this, opts.context, selDate, opts.monthonly);
						}
						if(onSelectContinue === undefined || onSelectContinue === true) {
							opts.context.val(selDate.obj.formatDate(selDate.format.replace(/[^Y|^m|^d]/g, "")));
						}
						opts.context.trigger("onSelect", [opts.context, selDate, opts.monthonly]);
						self.hide(ke);
					});
					opts.contents.append(daysPanel);

					// click current month
					monthsPanel.find(".datepicker_month_item__:contains(" + String(parseInt(d.formatDate("m"))) + "):eq(0)").click();
				}

				// append datepicker panel after context
				opts.context.after(opts.contents);

				// bind focusin event
				if(opts.focusin) {
					opts.context.bind("focusin.datepicker", function(e) {
						// reuse datepicker panel element
						if(opts.shareEle) {
							var datepickerInst;
							if(opts.monthonly) {
								datepickerInst = N(".datepicker__.datepicker_month_master__").instance("datepicker");
							} else {
								datepickerInst = N(".datepicker__.datepicker_date_master__").instance("datepicker");
							}
							if(!datepickerInst.options.context.is(e.target)) {
								datepickerInst.options.context = N(e.target);
								opts.contents.hide().removeClass("visible__").addClass("hidden__");
							}
						}
						if(!opts.contents.is(":visible")) {
							self.show();
						}
					});
				}

				// bind key event
				opts.context.bind("keyup.datepicker", function(e) {
					var value = opts.context.val().replace(/[^0-9]/g, "");
					var keyCode = e.keyCode ? e.keyCode : (e.which ? e.which : e.charCode);

					// when press the number keys
					if (keyCode >= 48 && keyCode <= 57 && value.length <= 8 && value.length%2 === 0) {
		        		var dateStrArr = N.date.strToDateStrArr(value, format);
		        		var dateStrStrArr = N.date.strToDateStrArr(value, format, true);

        				// validate input value
	        			if(!isNaN(dateStrArr[0]) && dateStrStrArr[0].length === 4 && dateStrArr[0] < 100) {
        					opts.context.alert(N.message.get(opts.message, "yearNaN")).show();
    						opts.context.val(value.replace(dateStrStrArr[0], ""));
        					return false;
        				} else if(!isNaN(dateStrArr[1]) && dateStrStrArr[1].length === 2 && (dateStrArr[1] < 1 || dateStrArr[1] > 12)) {
        					opts.context.alert(N.message.get(opts.message, "monthNaN")).show();
    						opts.context.val(value.replace(dateStrStrArr[1], ""));
        					return false;
        				} else if(!opts.monthonly && !isNaN(dateStrArr[2]) && dateStrStrArr[2].length === 2 && (dateStrArr[2] < 1 || dateStrArr[2] > parseInt(gEndDate))) {
        					opts.context.alert(N.message.get(opts.message, "dayNaN", [String(parseInt(gEndDate))])).show();
    						opts.context.val(value.replace(dateStrStrArr[2], ""));
        					return false;
        				}
	        			if((format.length === 3 && format.indexOf("md") > -1) || format.length === 2) {
	        				DatePicker.selectItems(opts, value, format, yearsPanel, monthsPanel, daysPanel);
	        			} else {
	        				if(!opts.monthonly) {
	        					if(value.length === 8) {
	        						DatePicker.selectItems(opts, value, format, yearsPanel, monthsPanel, daysPanel);
	        					}
	        				} else {
	        					if(value.length === 6) {
	        						DatePicker.selectItems(opts, value, format, yearsPanel, monthsPanel, daysPanel);
	        					}
	        				}
	        			}
					} else if (keyCode == 13) { // When press the ENTER key
						e.preventDefault();
					} else if (keyCode == 27) { // When press the ESC key
						e.preventDefault();
						setTimeout(function() {
							self.hide();
						}, 0);
		        	}
				}).bind("keydown.datepicker", function(e) {
					var keyCode = e.keyCode ? e.keyCode : (e.which ? e.which : e.charCode);
					if (keyCode == 9) { // When press the TAB key
						setTimeout(function() {
							self.hide();
						}, 0);
		        	}
				});
			},
			wrapSingleEle : function() {
				var opts = this.options;
				var self = this;

				opts.contents.bind("click.datepicker", function(e) {
					e.stopPropagation();
				});
				opts.context.bind("click.datepicker", function(e) {
					e.stopPropagation();
				});

				// bind focusin event
				if(opts.focusin) {
					opts.context.bind("focusin.datepicker", function() {
						if(!opts.contents.is(":visible")) {
							self.show();
						}
					});
				}

				var format = (!opts.monthonly ? N.context.attr("data").formatter.date.Ymd() : N.context.attr("data").formatter.date.Ym()).replace(/[^Y|^m|^d]/g, "");
				var yearsPanel = N((opts.monthonly ? ".datepicker_contents__.datepicker_monthonly__" : ".datepicker_contents__:not(.datepicker_monthonly__)") + " .datepicker_years_panel__");
				var monthsPanel = N((opts.monthonly ? ".datepicker_contents__.datepicker_monthonly__" : ".datepicker_contents__:not(.datepicker_monthonly__)") + " .datepicker_months_panel__");
				var daysPanel = N((opts.monthonly ? ".datepicker_contents__.datepicker_monthonly__" : ".datepicker_contents__:not(.datepicker_monthonly__)") + " .datepicker_days_panel__");

				// bind focusin event
				if(opts.focusin) {
					opts.context.bind("focusin.datepicker", function(e) {
						// reuse datepicker panel element
						if(opts.shareEle) {
							var datepickerInst;
							if(opts.monthonly) {
								datepickerInst = N(".datepicker__.datepicker_month_master__").instance("datepicker");
							} else {
								datepickerInst = N(".datepicker__.datepicker_date_master__").instance("datepicker");
							}
							datepickerInst.options.context = opts.context;
							opts.contents.hide().removeClass("visible__").addClass("hidden__");
						}
						if(!opts.contents.is(":visible")) {
							self.show();
						}
					});
				}

				// bind key event
				opts.context.bind("keyup.datepicker", function(e) {
					var value = opts.context.val().replace(/[^0-9]/g, "");

					var endDateCls = N.date.strToDate(N.string.lpad(yearsPanel.find(".datepicker_year_selected__").text(), 4, "0") +  N.string.lpad(String(parseInt(monthsPanel.find(".datepicker_month_selected__").text())+1), 2, "0") + "00", "Ymd");
					var endDate = endDateCls.obj.getDate();
					var gEndDate = endDate;
					if(format !== "Ymd") {
						gEndDate = 31;
					}

					var keyCode = e.keyCode ? e.keyCode : (e.which ? e.which : e.charCode);
					// when press the number keys
					if (keyCode >= 48 && keyCode <= 57 && value.length <= 8 && value.length%2 === 0) {
		        		var dateStrArr = N.date.strToDateStrArr(value, format);
		        		var dateStrStrArr = N.date.strToDateStrArr(value, format, true);

        				// validate input value
	        			if(!isNaN(dateStrArr[0]) && dateStrStrArr[0].length === 4 && dateStrArr[0] < 100) {
        					opts.context.alert(N.message.get(opts.message, "yearNaN")).show();
    						opts.context.val(value.replace(dateStrStrArr[0], ""));
        					return false;
        				} else if(!isNaN(dateStrArr[1]) && dateStrStrArr[1].length === 2 && (dateStrArr[1] < 1 || dateStrArr[1] > 12)) {
        					opts.context.alert(N.message.get(opts.message, "monthNaN")).show();
    						opts.context.val(value.replace(dateStrStrArr[1], ""));
        					return false;
        				} else if(!opts.monthonly && !isNaN(dateStrArr[2]) && dateStrStrArr[2].length === 2 && (dateStrArr[2] < 1 || dateStrArr[2] > parseInt(gEndDate))) {
        					opts.context.alert(N.message.get(opts.message, "dayNaN", [String(parseInt(gEndDate))])).show();
    						opts.context.val(value.replace(dateStrStrArr[2], ""));
        					return false;
        				}
	        			if((format.length === 3 && format.indexOf("md") > -1) || format.length === 2) {
	        				DatePicker.selectItems(opts, value, format, yearsPanel, monthsPanel, daysPanel);
	        			} else {
	        				if(!opts.monthonly) {
	        					if(value.length === 8) {
	        						DatePicker.selectItems(opts, value, format, yearsPanel, monthsPanel, daysPanel);
	        					}
	        				} else {
	        					if(value.length === 6) {
	        						DatePicker.selectItems(opts, value, format, yearsPanel, monthsPanel, daysPanel);
	        					}
	        				}
	        			}
					} else if (keyCode == 13) { // When press the ENTER key
						e.preventDefault();
					} else if (keyCode == 27) { // When press the ESC key
						e.preventDefault();
						self.hide();
		        	}
				}).bind("keydown.datepicker", function(e) {
					var keyCode = e.keyCode ? e.keyCode : (e.which ? e.which : e.charCode);
					if (keyCode == 9) { // When press the TAB key
						self.hide();
		        	}
				});
			},
			yearPaging : function(yearItems, currYear, addCnt, absolute) {
				// Date Object's year value must be greater 2 digits
				yearItems.removeClass("datepicker_curr_year__");
				var thisEle;
				var yearNum;
				yearItems.each(function(i) {
					thisEle = $(this);
					if(absolute !== undefined && absolute === true) {
						yearNum = parseInt(currYear) + i;
					} else {
						yearNum = parseInt(thisEle.text());
					}
					if(yearNum <= 100 - addCnt) {
						thisEle.text(100 + i);
					} else {
						thisEle.text(String(yearNum + addCnt));
					}
					if(thisEle.text() === String(currYear)) {
						thisEle.addClass("datepicker_curr_year__");
					}
				});
			},
			selectItems : function(opts, value, format, yearsPanel, monthsPanel, daysPanel) {
				var dateStrArr = N.date.strToDateStrArr(value, format);
        		var dateStrStrArr = N.date.strToDateStrArr(value, format, true);

				// year item selection
    			if(!isNaN(dateStrStrArr[0]) && dateStrStrArr[0].length === 4) {
    				yearsPanel.find(".datepicker_year_item__").removeClass("datepicker_year_selected__");
					DatePicker.yearPaging(yearsPanel.find(".datepicker_year_item__"), dateStrArr[0], -2, true);
					yearsPanel.find(".datepicker_year_item__:contains('" + String(dateStrArr[0]) + "')").click();
    			}
    			// month item selection
    			if(!isNaN(dateStrStrArr[1]) && dateStrStrArr[1].length === 2) {
					monthsPanel.find(".datepicker_month_item__").removeClass("datepicker_month_selected__");
					if(!opts.monthonly) {
						monthsPanel.find(".datepicker_month_item__:contains(" + String(dateStrArr[1]) + "):eq(0)").click();
					} else {
						monthsPanel.find(".datepicker_month_item__:contains(" + String(dateStrArr[1]) + "):eq(0)").addClass("datepicker_month_selected__");
					}
				}
    			// day item selection
    			if(!isNaN(dateStrStrArr[2]) && dateStrStrArr[2].length === 2) {
					daysPanel.find(".datepicker_prev_day_item__, .datepicker_day_item__, .datepicker_next_day_item__").removeClass("datepicker_day_selected__");
					daysPanel.find(".datepicker_day_item__:contains(" + String(dateStrArr[2]) + "):eq(0)").addClass("datepicker_day_selected__");
				}
			}
		});

		$.extend(DatePicker.prototype, {
			show : function() {
				var opts = this.options;

				// reuse datepicker panel element
				if(opts.shareEle) {
					var datepickerInst;
					var contents;
					if(opts.monthonly) {
						datepickerInst = N(".datepicker__.datepicker_month_master__").instance("datepicker");
						contents = N(".datepicker_contents__.datepicker_monthonly__");

					} else {
						datepickerInst = N(".datepicker__.datepicker_date_master__").instance("datepicker");
						contents = N(".datepicker_contents__:not(.datepicker_monthonly__)");
					}
					datepickerInst.options.context = opts.context;
					opts.context.after(contents.detach());
					opts.contents = contents;
				}

				// auto select datepicker items from before input value
				if(!N.string.isEmpty(opts.context.val())) {
					DatePicker.selectItems(opts,
							opts.context.val().replace(/[^0-9]/g, ""),
							(!opts.monthonly ? N.context.attr("data").formatter.date.Ymd() : N.context.attr("data").formatter.date.Ym()).replace(/[^Y|^m|^d]/g, ""),
							opts.contents.find(".datepicker_years_panel__"),
							opts.contents.find(".datepicker_months_panel__"),
							opts.contents.find(".datepicker_days_panel__"));
				}

				if(opts.onBeforeShow !== null) {
					var result = opts.onBeforeShow.call(this, opts.context, opts.contents);
					if(result !== undefined && result === false) {
						return this;
					}
				}
				opts.context.trigger("onBeforeShow", [opts.context, opts.contents]);

		        // set datapicker position
				$(window).bind("resize.datepicker", function() {
					var leftOfs = opts.context.position().left;
					var parentEle = opts.contents.closest(".form__");
					var limitWidth;
					if(parentEle.length > 0) {
						limitWidth = parentEle.position().left + parentEle.width();
					} else {
						limitWidth = (window.innerWidth ? window.innerWidth : $(window).width());
					}
					if(leftOfs + opts.contents.width() > limitWidth) {
						opts.contents.css("right", (limitWidth - (leftOfs + opts.context.outerWidth())) + "px");
						opts.contents.addClass("orgin_right__");
					} else {
						opts.contents.css("left", leftOfs + "px");
						opts.contents.addClass("orgin_left__");
					}
				}).trigger("resize.datepicker");

				var self = this;

				setTimeout(function() {
					opts.contents.show(0, function() {
						$(this).removeClass("hidden__").addClass("visible__");

						$(document).unbind("click.datepicker");
				        $(document).bind("click.datepicker", function(e) {
				        	self.hide();
			        	});
					});
				}, 0);

				return this;
			},
			hide : function() {
				var opts = this.options;

				if(opts.contents.hasClass("visible__")) {
					var self = this;
					if(opts.onBeforeHide !== null) {
						 // arguments[0] - because of firefox, firefox does not have window.event object
						var result = opts.onBeforeHide.call(this, opts.context, opts.contents, arguments.length > 0 ? arguments[0] : undefined);
						if(result !== undefined && result === false) {
							return this;
						}
					}
					opts.context.trigger("onBeforeHide", [opts.context, opts.contents, arguments.length > 0 ? arguments[0] : undefined]);

					$(window).unbind("resize.datepicker");
					$(document).unbind("click.datepicker");
					opts.context.unbind("blur.datepicker");

					opts.contents.removeClass("visible__").addClass("hidden__");
					opts.contents.one(N.element.whichTransitionEvent(opts.contents), function(e){
			            $(this).hide();
			            if(opts.onHide !== null) {
							opts.onHide.call(self, opts.context, opts.contents);
						}
			            opts.context.trigger("onHide", [opts.context, opts.contents]);
			        }).trigger("nothing");
				}

				return this;
			}
		});

		// Popup
		var Popup = N.popup = function(obj, opts) {
			//TODO think more : whether the "onload" event needs or not
			this.options = {
				context : obj,
				url : null,
				title : null,
				button : true,
				modal : true,
				top : undefined,
				left : undefined,
				height : 0,
				width : 0,
				closeMode : "hide",
				alwaysOnTop : false,
				"confirm" : true,
				onOk : null,
				onCancel : null,
				overlayClose : true,
				onOpen : null,
				onOpenData : null,
				delayContInit : false,
				onClose : null,
				onCloseData : null,
				preload : false,
				dynPos : true,
				windowScrollLock : true,
				draggable : false,
				draggableOverflowCorrection : true,
				draggableOverflowCorrectionAddValues : {
					top : 0,
					bottom : 0,
					left : 0,
					right : 0
				}
			};

			try {
				this.options = $.extend({}, this.options, N.context.attr("ui").popup);
			} catch (e) {
				N.error("[N.popup]" + e, e);
			}

			if(opts !== undefined) {
				if(N.type(opts) === "string") {
					this.options.url = opts;
				}
			} else {
				if(arguments.length === 1 && N.isPlainObject(obj)) {
					opts = obj;
					obj = N(window);
				}
			}
			$.extend(this.options, opts);
			// if title option value is undefined
			this.options.title = N.string.trimToNull(opts.title);

			//set opener(parent page's Controller)
			var self = this;
			try {
				var caller = arguments.callee.caller;
				while(caller != null) {
				    caller = caller.arguments.callee.caller;
				    if(caller != null && caller.arguments.length > 0 && N(caller.arguments[0]).hasClass("view_context__") && caller.arguments[0].instance != null && N.type(caller.arguments[0].instance) === "function") {
						self.opener = caller.arguments[0].instance("cont");
						break;
					}
				}
			} catch(e) {
				if(this.options.url !== null) {
					N.warn("[N.popup][" + e + "]N.popup failed to set the opener object on the Controller(N.cont) of the popup.");
				}
			}

			if(this.options.url !== null) {
				if(this.options.preload) {
					Popup.loadContent.call(this, function(cont, context) {
						// this callback function is for async page load
						this.options.context = context;

						// set this instance to context element
						this.options.context.instance("popup", this);
					});
				}
			} else {
				Popup.wrapEle.call(this);

				// set this instance to context element
				this.options.context.instance("popup", this);
			}

	        return this;
		};

		$.extend(Popup, {
			wrapEle : function() {
				var opts = this.options;
				opts.context.hide();

				// use alert
				// opts.context is alert message
				opts.html = true;
				opts.msg = opts.context;
				if(opts.title === null) {
					opts.title = opts.context.attr("title");
				}
				if(opts.title !== null) {
					opts.context.removeAttr("title");
				}

				this.alert = N(window).alert(opts);
				this.alert.options.msgContext.addClass("popup_overlay__");
				this.alert.options.msgContents.addClass("popup__");
			},
			loadContent : function(callback) {
				var opts = this.options;
				var self = this;

				N.comm({
					url : opts.url,
					contentType : "text/html; charset=UTF-8",
					dataType : "html",
					type : "GET"
				}).submit(function(page) {
					// set loaded page instance to options.context
					opts.context = $(page);

					// set title
					if(opts.title === null) {
						opts.title = opts.context.filter(":not('style, script'):last").attr("title");
						if(opts.title !== null) {
							opts.context.filter(":not('style, script'):last").removeAttr("title");
						}
					}

					// opts.context is alert message;
					opts.html = true;
					opts.msg = opts.context;
					self.alert = N(window).alert(opts);
					self.alert.options.msgContext.addClass("popup_overlay__");
					self.alert.options.msgContents.addClass("popup__");

					// set request target
					this.request.options.target = opts.context.parent();

					var cont = opts.context.filter(".view_context__:last").instance("cont");

					// set popup instance to popup's Controller
					if(cont !== undefined) {
						// set caller attribute in Conteroller in tab content, that is Popup instance
						cont.caller = self;

						// set opener to popup's Controller
						if(self.opener !== undefined) {
							cont.opener = self.opener;
						}

						// if delayContInit options is true, *ProcFn__ function is must set to Controller's attribute before the aop processing
						if(opts.delayContInit) {
							callback.call(self, cont, opts.context);

							// triggering "init" method
							N.cont.trInit.call(this, cont, this.request);
						} else {
							// triggering "init" method
							N.cont.trInit.call(this, cont, this.request);

							callback.call(self, cont, opts.context);
						}
					} else {
						callback.call(self, cont, opts.context);
					}

	        	});
			},
			popOpen : function(onOpenData) {
				var opts = this.options;
				var self = this;

				if(opts.url === null) {
					opts.context.show();
				}
				self.alert.show();
			}
		});

		$.extend(Popup.prototype, {
			context : function(sel) {
				return sel !== undefined ? this.options.context.find(sel) : this.options.context;
			},
			open : function(onOpenData) {
				var opts = this.options;
				var self = this;

				if(onOpenData === undefined && opts.onOpenData !== null) {
					onOpenData = opts.onOpenData;
				}

				if(this.options.url !== null && !opts.preload) {
					Popup.loadContent.call(this, function(cont, context) {
						// this callback function is for async page load
						opts.context = context;
						opts.context.instance("popup", this);

						Popup.popOpen.call(self, onOpenData);

						var onOpenProcFn__ = function() {
							// execute "onOpen" event
							if(opts.onOpen !== null) {
								opts.onOpenData = onOpenData !== undefined ? onOpenData : null;
								if(opts.context.filter(".view_context__:last").instance("cont")[opts.onOpen] !== undefined) {
									opts.context.filter(".view_context__:last").instance("cont")[opts.onOpen](onOpenData);
								} else {
									N.warn("[N.popup.popOpen]The onOpen event handler(" + opts.onOpen + ") is not defined on the Controller(N.cont) of the Popup.");
								}
							}
						};
						if(opts.delayContInit && cont !== undefined) {
							cont.onOpenProcFn__ = onOpenProcFn__;
						} else {
							onOpenProcFn__();
						}
					});
					opts.preload = true;
				} else {
					Popup.popOpen.call(this, onOpenData);
				}
				return this;
			},
			close : function(onCloseData) {
				var opts = this.options;

				if(onCloseData === undefined && opts.onCloseData !== null) {
					onCloseData = opts.onCloseData;
				}

				// "onClose" event execute
				if(opts.onClose !== null) {
					opts.onClose.call(this, onCloseData);
				}
				this.alert[opts.closeMode]();
				return this;
			},
			changeEvent : function(name, callback) {
				this.options[name] = callback;
				this.alert.options[name] = this.options[name];
			},
			remove : function() {
				this.alert.remove();
				return this;
			}
		});

		// Tab
		var Tab = N.tab = function(obj, opts) {
			this.options = {
				context : obj.length > 0 ? obj : null,
				links : obj.length > 0 ? obj.find(">ul>li") : null,
				tabOpts : [], // tabOpts : [{ url: undefined, active: false, preload: false, onOpen: undefined, disable : false, stateless : false }]
				delayContInit : false,
				randomSel : false,
				onActive : null,
				onLoad : null,
				blockOnActiveWhenCreate : false,
				contents : obj.length > 0 ? obj.find(">div") : null,
				effect : false, // Deprecated
				tabScroll : false,
				tabScrollCorrection : {
					tabContainerWidthCorrectionPx : 0,
					tabContainerWidthReCalcDelayTime : 0
				}
			};

			try {
				this.options = $.extend({}, this.options, N.context.attr("ui").tab);
			} catch (e) {
				N.error("[N.tab]" + e, e);
			}

			if (N.isPlainObject(obj)) {
				$.extend(this.options, obj);
				this.options.context = N(obj.context);
			}
			this.options.links = this.options.context.find(">ul>li");
			this.options.contents = this.options.context.find(">div");

			var self = this;
			var opt;
			if(N.isEmptyObject(this.options.tabOpts)) {
				this.options.links.each(function(i) {
					var thisEle = $(this);
					opt = N.element.toOpts(thisEle);
					if(opt === undefined) {
						opt = {};
					}
					opt.target = thisEle.find("a").attr("href");
					self.options.tabOpts.push(opt);
				});
			}

			if(opts !== undefined) {
				$.extend(this.options, opts);
			}

			// set style class name to context element
			this.options.context.addClass("tab__");

			Tab.wrapEle.call(this);

			// set this instance to context element
			this.options.context.instance("tab", this);
		};

		$.extend(Tab, {
			wrapEle : function() {
				var opts = this.options;
				// hide div contents
				opts.contents.hide();

				var self = this;

				var defSelIdx;
				$(opts.tabOpts).each(function(i) {
					if(this.disable) {
						self.disable(i);
					} else {
						self.enable(i);
					}

					// set default select index
					if(this.active !== undefined && this.active) {
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
								// excute "onLoad" event
								if(opts.onLoad !== null) {
									opts.onLoad.call(self, i, opts.links.eq(i), selContentEle_, cont);
								}
							});
						}
					}
				});

				opts.links.bind("click.tab", function(e, onOpenData, isFirst) {
					e.preventDefault();

					if(!$(this).hasClass("tab_active__")) {
						var selTabEle = $(this);
						var selTabIdx = opts.links.index(this);
						var selDeclarativeOpts = opts.tabOpts[selTabIdx];
						var selContentEle = opts.contents.eq(selTabIdx);

						opts.links.filter(".tab_active__").removeClass("tab_active__");
						selTabEle.addClass("tab_active__");

						var onActiveProcFn__ = function() {
							// excute "onActive" event
							if(opts.onActive !== null) {
								if(opts.blockOnActiveWhenCreate === false || (opts.blockOnActiveWhenCreate === true && isFirst !== true)) {
									opts.onActive.call(this, selTabIdx, selTabEle, selContentEle, opts.links, opts.contents);
			                	}
							}
						}

						var onOpenProcFn__ = function() {
							// excute "onOpen"(declarative option) event
							if(selDeclarativeOpts.onOpen !== undefined) {
								var cont = selContentEle.children(".view_context__:last").instance("cont");
								if(cont[selDeclarativeOpts.onOpen] !== undefined) {
									//thisDeclarativeOpts.onOpen
									cont[selDeclarativeOpts.onOpen](onOpenData);
								} else {
									N.warn("[N.tab.wrapEle]The onOpen event handler(" + selDeclarativeOpts.onOpen + ") is not defined on the Controller(N.cont) of the tab(N.tab)'s contents.");
								}
							}
						}

						// hide tab contents
						var beforeActivatedContent = opts.contents.filter(".tab_content_active__");
						if(beforeActivatedContent.length > 0) {
							var isRelative = false;
							if(opts.context.css("position") !== "relative") {
								opts.context.css("position", "relative");
								isRelative = true;
							}
							beforeActivatedContent.removeClass("tab_content_active__ visible__").addClass("hidden__");
							beforeActivatedContent.one(N.element.whichTransitionEvent(beforeActivatedContent), function(e){
								$(this).hide();
								if(isRelative) {
									opts.context.css("position", "");
								}
							}).trigger("nothing");
						}

						if(!selDeclarativeOpts.preload && selDeclarativeOpts.url !== undefined && !selContentEle.data("loaded") || selDeclarativeOpts.stateless) {
							// load content
							Tab.loadContent.call(self, selDeclarativeOpts.url, selTabIdx, function(cont, selContentEle_) {
								// excute "onLoad" event
								if(opts.onLoad !== null) {
									opts.onLoad.call(self, selTabIdx, selTabEle, selContentEle_, cont);
								}

								if(opts.delayContInit) {
									cont.onActiveProcFn__ = onActiveProcFn__;
									cont.onOpenProcFn__ = onOpenProcFn__;
								} else {
									onActiveProcFn__();
									onOpenProcFn__();
								}

								// show tab contents
								selContentEle_.show(0, function() {
									selContentEle_.addClass("tab_content_active__ visible__");
								}).removeClass("hidden__");

								selContentEle.data("loaded", true);
							});
						} else {
							onActiveProcFn__();
							onOpenProcFn__();

							// show tab contents
							selContentEle.show(0, function() {
								selContentEle.addClass("tab_content_active__ visible__");
							}).removeClass("hidden__");
						}

						// Deprecated
						if (opts.effect) {
							selContentEle.children().hide()[opts.effect[0]](opts.effect[1], opts.effect[2]);
						}
					}
				});

				if(opts.tabScroll) {
					Tab.wrapScroll.call(this);
				}

				// select tab
				$(opts.links.get(defSelIdx)).trigger("click.tab", [undefined, true]);
			},
			wrapScroll : function() {
				var opts = this.options;
				var eventNameSpace = ".tab.scroll";
				var tabContainerEle = opts.context.find(">ul").addClass("effect__");

				var scrollBtnEles = opts.context.find(">a");
				var prevBtnEle;
				var nextBtnEle;
				var lastDistance = 0;

				if(scrollBtnEles.length > 1) {
					opts.context.css("position", "relative");
					scrollBtnEles.css({
						"position" : "absolute",
						"top" : 0
					});

					prevBtnEle = scrollBtnEles.eq(0).addClass("tab_scroll_prev__").css("left", 0).bind("click" + eventNameSpace,  function(e) {
						e.preventDefault();
						tabContainerEle.addClass("effect__");
						lastDistance = prevBtnEle.outerWidth();
						tabContainerEle.css("margin-left", lastDistance + "px");
						nextBtnEle.removeClass("disabled__");
						prevBtnEle.addClass("disabled__");
					});
					nextBtnEle = scrollBtnEles.eq(1).addClass("tab_scroll_next__").css("right", 0).bind("click" + eventNameSpace,  function(e) {
						e.preventDefault();
						tabContainerEle.addClass("effect__");
						lastDistance = opts.context.outerWidth() - tabContainerEle.width() - nextBtnEle.outerWidth() + 1;
						tabContainerEle.css("margin-left", lastDistance + "px");
						prevBtnEle.removeClass("disabled__");
						nextBtnEle.addClass("disabled__");
					});
				}

				$(window).bind("resize" + eventNameSpace, function() {
					var ulWidth = 0;
					opts.links.each(function() {
						ulWidth += ($(this).outerWidth() + parseInt(N.string.trimToZero($(this).css("margin-left"))) + parseInt(N.string.trimToZero($(this).css("margin-right"))));
					});
					ulWidth += opts.tabScrollCorrection.tabContainerWidthCorrectionPx;

					if(ulWidth > 0 && ulWidth > opts.context.width()) {
						opts.context.css("overflow", "hidden");
						tabContainerEle.addClass("tab_scroll__").width(ulWidth);
						if(scrollBtnEles.length > 1) {
							tabContainerEle.css("margin-left", prevBtnEle.outerWidth() + "px");
							prevBtnEle.addClass("disabled__");
							scrollBtnEles.show();
						}
					} else {
						opts.context.css("overflow", "");
						tabContainerEle.css("width", "");
						if(scrollBtnEles.length > 1) {
							tabContainerEle.css("margin-left", "");
							prevBtnEle.removeClass("disabled__");
							scrollBtnEles.hide();
						}
					}
				}).trigger("resize" + eventNameSpace);

				if(opts.tabScrollCorrection.tabContainerWidthReCalcDelayTime > 0) {
					setTimeout(function() {
						$(window).trigger("resize" + eventNameSpace);
					}, opts.tabScrollCorrection.tabContainerWidthReCalcDelayTime);
				}

				$.fn.drag = function(nameSpace, startHandler, moveHandler, endHandler) {
					var selfEle = this;
					this.bind("mousedown" + nameSpace + " touchstart" + nameSpace, function(e) {
		            	var se = e.originalEvent.touches ? e.originalEvent.touches[0] : e;
		            	e.stopImmediatePropagation();
		            	e.stopPropagation();

		            	if(e.originalEvent.touches || (e.which || e.button) === 1) {
		            		$(document).bind("dragstart" + nameSpace + " selectstart" + nameSpace, function() {
		            			return false;
		            		});

		            		var isContinue = startHandler.call(this, e, selfEle, se.pageX, se.pageY);
		            		if(isContinue !== false) {
		            			$(document).bind("mousemove" + nameSpace + " touchmove" + nameSpace, function(e) {
			            			var me = e.originalEvent.touches ? e.originalEvent.touches[0] : e;
			            			e.stopImmediatePropagation();
			            			e.stopPropagation();
			            			moveHandler.call(this, e, selfEle, me.pageX, me.pageY);
			            		});

			            		$(document).bind("mouseup" + nameSpace + " touchend" + nameSpace, function(e) {
			            			e.stopImmediatePropagation();
			            			e.stopPropagation();
			            			endHandler.call(this, e, selfEle);
			            			$(document).unbind("dragstart" + nameSpace + " selectstart" + nameSpace + " mousemove" + nameSpace + " touchmove" + nameSpace + " mouseup" + nameSpace + " touchend" + nameSpace);
			            		});
		            		}
		            	}
		        	});
				};

				var sPageX;
				var prevDefGap = 0;
				var nextDefGap = 0;
				if(scrollBtnEles.length > 1) {
					prevDefGap = prevBtnEle.outerWidth();
					nextDefGap = nextBtnEle.outerWidth();
				}
				tabContainerEle.drag(eventNameSpace, function(e, tabContainerEle_, pageX, pageY) { // start
					tabContainerEle_.removeClass("effect__");
					if(tabContainerEle_.outerWidth() <= opts.context.innerWidth()) {
						return false;
					}
					sPageX = pageX - lastDistance;
				}, function(e, tabContainerEle_, pageX, pageY) { // move
					var distance = (sPageX - pageX) * -1;
					if(distance > prevDefGap || opts.context.outerWidth() >= tabContainerEle_.width() + nextDefGap + distance) {
						return false;
					} else {
						lastDistance = distance;
						tabContainerEle_.css("margin-left", distance + "px");
					}
				}, function(e, tabContainerEle_) { //end
					if(lastDistance + (scrollBtnEles.length > 1 ? 0 : 30) >= 0 && lastDistance <= prevDefGap) {
						if(scrollBtnEles.length > 1) {
							lastDistance = prevDefGap;
							nextBtnEle.removeClass("disabled__");
							prevBtnEle.addClass("disabled__");
						} else {
							lastDistance = 0;
						}
						tabContainerEle_.addClass("effect__").css("margin-left", lastDistance + "px");
					} else if(nextDefGap + (scrollBtnEles.length > 1 ? 0 : 30) >= tabContainerEle_.width() - (opts.context.outerWidth() + lastDistance * -1)) {
						lastDistance = (tabContainerEle_.width() - opts.context.outerWidth() - 1) * -1;
						if(scrollBtnEles.length > 1) {
							lastDistance -= nextDefGap;
							prevBtnEle.removeClass("disabled__");
							nextBtnEle.addClass("disabled__");
						}
						tabContainerEle_.addClass("effect__").css("margin-left", lastDistance + "px");
					} else {
						scrollBtnEles.removeClass("disabled__");
					}
				});
			},
			loadContent : function(url, targetIdx, callback) {
				var opts = this.options;
				var self = this;
				var selContentEle = opts.contents.eq(targetIdx);

				N.comm({
					url : url,
					contentType : "text/html; charset=UTF-8",
					dataType : "html",
					type : "GET",
					target : selContentEle
				}).submit(function(page) {
					var cont = selContentEle.html(page).children(".view_context__:last").instance("cont");

					// set tab instance to tab contents Controller
					if(cont !== undefined) {
						// set caller attribute in conteroller in tab content that is Tab instance
						cont.caller = self;

						// if delayContInit options is true, *ProcFn__ function is must set to Controller's attribute before the aop processing
						if(opts.delayContInit) {
							callback.call(this, cont, selContentEle);

							// triggering "init" method
							N.cont.trInit.call(this, cont, this.request);
						} else {
							// triggering "init" method
							N.cont.trInit.call(this, cont, this.request);

							callback.call(this, cont, selContentEle);
						}

					} else {
						callback.call(this, cont, selContentEle);
					}

					var activeTabEle = opts.links.eq(targetIdx);
	        	});
			}
		});

		$.extend(Tab.prototype, {
			context : function(sel) {
				return sel !== undefined ? this.options.context.find(sel) : this.options.context;
			},
			open : function(idx, onOpenData) {
				if(idx !== undefined) {
					if(onOpenData !== undefined) {
						$(this.options.links.get(idx)).trigger("click.tab", [onOpenData]);
					} else {
						$(this.options.links.get(idx)).trigger("click.tab");
					}
				}
				return this;
			},
			disable : function(idx) {
				if(idx !== undefined) {
					$(this.options.links.get(idx))
						.unbind("click.tab.disable")
						.tpBind("click.tab.disable", N.element.disable)
						.addClass("tab_disabled__");
				}
				return this;
			},
			enable : function(idx) {
				if(idx !== undefined) {
					$(this.options.links.get(idx))
						.unbind("click", N.element.disable)
						.removeClass("tab_disabled__");
				}
				return this;
			}
		});

		// Select
		var Select = N.select = function(data, opts) {
			this.options = {
				data : N.type(data) === "array" ? N(data) : data,
				context : null,
				key : null,
				val : null,
				append : true,
				direction : "h", // direction : h(orizontal), v(ertical)
				type : 0, // type : 1: select, 2: select[multiple='multiple'], 3: radio, 4: checkbox
				template : null
			};

			try {
				this.options = $.extend({}, this.options, N.context.attr("ui").select);
			} catch (e) {
				N.error("[N.select]" + e, e);
			}
			$.extend(this.options, N.element.toOpts(this.options.context));

			if (N.isPlainObject(opts)) {
				$.extend(this.options, opts);
				this.options.context = N(opts.context);
			} else {
				this.options.context = N(opts);
			}
			this.options.template = this.options.context;

			Select.wrapEle.call(this);

			// set style class name to context element
			this.options.context.addClass("select__");

			// set this instance to context element
			this.options.context.instance("select", this);

			return this;
		};

		$.extend(Select, {
			wrapEle : function() {
				var opts = this.options;
				if (opts.context.is("select") && opts.context.attr("multiple") != "multiple") {
					this.options.context.find("option").addClass("select_default__");
					opts.type = 1;
	            } else if (opts.context.is("select") && opts.context.attr("multiple") == "multiple") {
	            	this.options.context.find("option").addClass("select_default__");
	            	opts.type = 2;
	            } else if (opts.context.is("input:radio")) {
	            	opts.type = 3;
	            } else if (opts.context.is("input:checkbox")) {
	            	opts.type = 4;
	            }
			}
		});

		$.extend(Select.prototype, {
			data : function(selFlag) { // TODO key name : argument2, argument3... argumentN
				var opts = this.options;
				if(selFlag !== undefined && selFlag === true) {
					var selectEles = opts.type === 1 || opts.type === 2 ? opts.context.find("option") : opts.context.closest(".select_input_container__").children("label");
		    		var defSelCnt = selectEles.filter(".select_default__").length;
		    		var idxs = this.index();
		    		if(N.type(idxs) === "string") {
		    			idxs = [idxs];
		    		}
					return $(idxs).map(function() {
						if(this - defSelCnt > -1) {
							return opts.data.get(this - defSelCnt);
						}
					}).get();
				} else if(selFlag !== undefined && selFlag === false) {
					return opts.data;
				} else {
					return opts.data.get();
				}
			},
			context : function(sel) {
				return sel !== undefined ? this.options.context.find(sel) : this.options.context;
			},
		    bind : function(data) {
		    	var opts = this.options;

		    	//to rebind new data
				if(data != null) {
					opts.data = N.type(data) === "array" ? N(data) : data;
				}

		    	if(opts.type === 1 || opts.type === 2) {
		    		var defaultSelectEle = opts.template.find(".select_default__").clone(true);
	    			opts.context.addClass("select_template__").empty();
					if(opts.append) {
	    				opts.context.append(defaultSelectEle);
	    			}
					opts.data.each(function(i, data) {
						opts.context.append("<option value='" + data[opts.val] + "'>" + data[opts.key] + "</option>");
					});
		    	} else if(opts.type === 3 || opts.type === 4) {
		    		if(opts.context.filter(".select_template__").length === 0) {
		    			var id = opts.context.attr("id")
		    			var container = $('<span class="select_input_container__"/>');
		    			if (opts.direction === "h") {
		    				container.addClass("select_input_horizental__");
		    			} else if (opts.direction === "v") {
		    				container.addClass("select_input_vertical__");
		    			}
		    			opts.data.each(function(i, data) {
			    			var labelEle = $('<label class="select_input_label__ ' + id + "_" + String(i) + '__"></label>');
			    			var labelTextEle = $('<span>' + data[opts.key] + '</span>');
			    			if(i === 0) {
			    				opts.template.attr("name", id).attr("value", data[opts.val]).addClass("select_input__ select_template__")
			    					.wrap(labelEle)
			    					.parent().append(labelTextEle).wrap(container);
			    				container = opts.template.closest(".select_input_container__");
			    			} else {
			    				labelEle.append(opts.template.clone(true).attr("name", id).attr("value", data[opts.val]).removeAttr("id").removeClass("select_template__"));
			    				labelEle.append(labelTextEle);
			    				container.append(labelEle);
			    			}
			    		});
		    		}
		    	}
		    	return this;
		    },
		    index : function(idx) {
		    	var opts = this.options;
		    	var self = this;

		    	var selectSiblingEles = opts.type === 1 || opts.type === 2 ? opts.context.find("option") : opts.context.closest(".select_input_container__").children("label");
		    	var selectEles = opts.type === 1 || opts.type === 2 ? opts.context : selectSiblingEles.find(":radio, :checkbox");
		    	if(idx === undefined) {
		    		var rslt = selectEles.vals();
		    		var spltSepa = N.context.attr("core").spltSepa;
		    		var rsltStr = spltSepa + (N.type(rslt) === "array" ? rslt.join(spltSepa) : String(rslt)) + spltSepa;
		    		var rsltArr = [];
		    		(opts.type === 1 || opts.type === 2 ? selectSiblingEles : selectEles).each(function(i) {
		    			if(rsltStr.indexOf(spltSepa + this.value + spltSepa) > -1) {
		    				rsltArr.push(i);
		    			}
		    		});
		    		return rsltArr.length > 0 ? rsltArr.length === 1 ? rsltArr[0] : rsltArr : -1;
		    	}

		    	var vals = [];
	    		$(N.type(idx) === "number" ? [idx] : idx).each(function() {
		    		vals.push((opts.type === 1 || opts.type === 2 ? selectSiblingEles : selectEles).get(this).value);
	    		});
	    		selectEles.vals(vals);

	    		return this;
		    },
		    val : function(val) {
		    	var opts = this.options;

		    	var rtnVal = $(opts.type === 3 || opts.type === 4
		    				? this.options.context.closest(".select_input_container__").find(":input") : this.options.context).vals(val);
		    	if(val === undefined) {
		    		return rtnVal;
		    	}

		    	return this;
		    },
		    remove : function(val) {
		    	var opts = this.options;
		    	if(val !== undefined) {
		    		var selectEles = opts.type === 1 || opts.type === 2 ? opts.context.find("option") : opts.context.closest(".select_input_container__").children("label");

		    		selOptEle = opts.type === 1 || opts.type === 2 ? selectEles.filter("[value='" + val + "']") : selectEles.find("input[value='" + val + "']").parent("label");
		    		var idx = selOptEle.index();
		    		var defSelCnt = selectEles.filter(".select_default__").length;

		    		//remove element
		    		selOptEle.remove();

		    		// remove data
		    		if(idx - defSelCnt > -1) {
		    			opts.data.splice(idx - defSelCnt, 1);
		    		}
		    	}
		    	return this;
		    },
		    reset : function(selFlag) {
		    	var opts = this.options;
		    	if(opts.type === 1 || opts.type === 2) {
		    		if(selFlag !== undefined && selFlag === true) {
		    			opts.context.get(0).selectedIndex = 0;
		    		} else {
		    			opts.context.val(opts.context.prop("defaultSelected"));
		    		}
		    	} else if(opts.type === 3 || opts.type === 4) {
		    		opts.context.prop("checked", false);
		    	}
		    	return this;
		    }
		});

		// Form
		var Form = N.form = function(data, opts) {
			this.options = {
				data : N.type(data) === "array" ? N(data) : data,
				row : -1,
				context : null,
				validate : true,
				html : false,
				addTop : false,
				fRules : null,
				vRules : null,
				extObj : null, // extObj : for N.grid
				extRow : -1, // extRow : for N.grid
				revert : false,
				unbind : true,
				initialInputData : null, // for unbind
				onBindBefore : null,
				onBindAfter : null
			};

			try {
				this.options = $.extend({}, this.options, N.context.attr("ui").form);
			} catch (e) {
				N.error("[N.form]" + e, e);
			}

			if (N.isPlainObject(opts)) {
				//convert data to wrapped set
				opts.data = N.type(opts.data) === "array" ? N(opts.data) : opts.data;

				$.extend(this.options, opts);
				if(N.type(this.options.context) === "string") {
					this.options.context = N(this.options.context);
				}
				if(opts.row === undefined) {
					this.options.row = 0;
				}
			} else {
				this.options.row = 0;
				this.options.context = N(opts);
			}

			// for unbind
			if(this.options.unbind) {
				if(this.options.context !== null) {
					this.options.initialInputData = N.element.toData(this.options.context.find(":input, img").not(":button"));
				}
			}

			// set style class name to context element
			this.options.context.addClass("form__");

			if(this.options.revert) {
				this.revertData = $.extend({}, this.options.data[this.options.row]);
			}

			// set this instance to context element
			this.options.context.instance("form", this);

			// register this to N.ds for realtime data synchronization
			if(this.options.extObj === null) {
				N.ds.instance(this, true);
			}

			return this;
		};

		$.extend(Form, {
			getRadioNCheckBoxSelectorStr : function(key) {
				return "input:radio[name='" + key + "'], input:checkbox[name='" + key + "'], input:radio[id='" + key + "'], input:checkbox[id='" + key + "']";
			}
		});

		$.extend(Form.prototype, {
			data : function(selFlag) { // TODO key name : argument2, argument3... argumentN
				var opts = this.options;
				if(selFlag !== undefined && selFlag === true) {
					return [ opts.data[opts.row] ];
				} else if(selFlag !== undefined && selFlag === false) {
						return opts.data;
				} else {
					return opts.data.get();
				}
			},
			row : function(before) {
				return before !== undefined && before === "before" ? this.options.beforeRow : this.options.row;
			},
			context : function(sel) {
				return sel !== undefined ? this.options.context.find(sel) : this.options.context;
			},
			bind : function(row, data) {
				var opts = this.options;
				if(row !== undefined) {
					opts.row = row;
				}
				if(data != null) {
					opts.data = N.type(data) === "array" ? N(data) : data;
					if(opts.revert) {
						this.revertData = $.extend({}, data[row]);
					}
				}

				var self = this;
				var vals;
				if (!N.isEmptyObject(opts.data) && !N.isEmptyObject(vals = opts.data[opts.row])) {
					if(opts.onBindBefore !== null && this.options.extObj === null) {
						opts.onBindBefore.call(opts.context, opts.context, vals);
					}

					// add row data changed flag
					if (vals.rowStatus === "insert" || vals.rowStatus === "update") {
						opts.context.addClass("row_data_changed__");
					} else {
						opts.context.removeClass("row_data_changed__");
					}
					if (vals.rowStatus === "delete") {
						opts.context.addClass("row_data_deleted__");
					} else {
						opts.context.removeClass("row_data_deleted__");
					}
					var eles, ele, val, tagName, type;
					for ( var key in vals ) {
						eles = $("#" + key, opts.context);
						type = N.string.trimToEmpty(eles.attr("type")).toLowerCase();
						if (eles.length > 0 && $(opts.context).find(Form.getRadioNCheckBoxSelectorStr(key)).length === 0) {
							eles.each(function() {
								ele = $(this);
								// add data changed flag
								if (vals.rowStatus === "update") {
									ele.addClass("data_changed__");
								} else {
									ele.removeClass("data_changed__");
								}

								tagName = this.tagName.toLowerCase();
								type = N.string.trimToEmpty(ele.attr("type")).toLowerCase();
								if (tagName === "textarea" || type === "text" || type === "password" || type === "hidden" || type === "file"
									// Support HTML5 Form's input types
									|| type === "number" || type === "email" || type === "search" || type === "color"
									// The date type does not support formatting, so it does not support it.
									// || type === "date" || type === "datetime-local" || type === "month" || type === "time" || type === "week"
									|| type === "range"
									|| type === "url") {
									//validate
									if(ele.data("validate") !== undefined) {
										if (type !== "hidden") {
											N().validator(opts.vRules !== null ? opts.vRules : ele);

											ele.unbind("focusout.form.validate");

											// remove validator's dregs for rebind
											ele.removeClass("validate_false__");
											if(ele.instance("alert") !== undefined) {
												ele.instance("alert").remove();
												ele.removeData("alert__");
											}

											ele.bind("focusout.form.validate", function() {
												var currEle = $(this);
					                            if (!currEle.prop("disabled") && !currEle.prop("readonly") && opts.validate) {
				                            		currEle.trigger("validate");
					                            }
					                        });
										}
									}

									//dataSync
									ele.unbind("focusout.form.dataSync");
									ele.bind("focusout.form.dataSync", function(e) {
										var currEle = $(this);
										var currVal = currEle.val();
										if (String(vals[currEle.attr("id")]) !== currVal) {
											if (!currEle.prop("disabled") && !currEle.prop("readonly") && (!opts.validate || (opts.validate && !currEle.hasClass("validate_false__")))) {
												// update dataset value
												vals[currEle.attr("id")] = currVal;

												// change row status
												if (vals.rowStatus !== "insert" && vals.rowStatus !== "delete") {
													vals.rowStatus = "update";
													// add data changed flag
													currEle.addClass("data_changed__");
													if(!opts.context.hasClass("row_data_changed__")) {
														opts.context.addClass("row_data_changed__");
													}
												}

												// notify data changed
												N.ds.instance(opts.extObj !== null ? opts.extObj : self).notify(opts.extRow > -1 ? opts.extRow : opts.row, currEle.attr("id"));
											}
                                        }
									});

									//Enter key event
									ele.unbind("keyup.form.dataSync");
			                        ele.bind("keyup.form.dataSync", function(e) {
			                        	if ((e.keyCode ? e.keyCode : (e.which ? e.which : e.charCode)) == 13) {
			                        		e.preventDefault();
			                            	$(this).trigger("focusout.form.validate");
			                            	// notify data changed
		                            		$(this).trigger("focusout.form.dataSync");
			                            }
			                        });

				                    //format
			                        if(ele.data("format") !== undefined) {
										if (type !== "password" && type !== "hidden" && type !== "file") {
											N(opts.data).formatter(opts.fRules !== null ? opts.fRules : ele).format(opts.row);

											ele.unbind("focusin.form.unformat");
											ele.bind("focusin.form.unformat", function() {
												var currEle = $(this);
					                            if (!currEle.prop("disabled") && !currEle.prop("readonly") && (!opts.validate || (opts.validate && !currEle.hasClass("validate_false__")))) {
					                                currEle.trigger("unformat");
					                            }
					                        });

											ele.unbind("focusout.form.format");
											ele.bind("focusout.form.format", function() {
												var currEle = $(this);
					                            if (!currEle.prop("disabled") && !currEle.prop("readonly") && (!opts.validate || (opts.validate && !currEle.hasClass("validate_false__")))) {
					                                currEle.trigger("format");
					                            }
					                        });
										}
									} else {
										// put value
										ele.val(vals[key] != null ? String(vals[key]) : "");
									}
								} else if(tagName === "select") {
									//validate
									if(ele.data("validate") !== undefined) {
										// remove validator's dregs for rebind
										ele.removeClass("validate_false__");
										if(ele.instance("alert") !== undefined) {
											ele.instance("alert").remove();
											ele.removeData("alert__");
										}

										if (opts.validate) {
											N().validator(opts.vRules !== null ? opts.vRules : ele);
										}
									}

									//dataSync
									ele.unbind("change.form.dataSync");
									ele.bind("change.form.dataSync", function(e) {
										var currEle = $(this);
										var currVals = currEle.vals();
										if (vals[currEle.attr("id")] !== currVals) {
											// update dataset value
											vals[currEle.attr("id")] = currVals;

											// change row status
											if (vals.rowStatus !== "insert" && vals.rowStatus !== "delete") {
												vals.rowStatus = "update";
												// add data changed flag
												currEle.addClass("data_changed__");
												if(!opts.context.hasClass("row_data_changed__")) {
													opts.context.addClass("row_data_changed__");
												}
											}


											// notify data changed
											if (!currEle.prop("disabled") && !currEle.prop("readonly")) {
												N.ds.instance(opts.extObj !== null ? opts.extObj : self).notify(opts.extRow > -1 ? opts.extRow : opts.row, currEle.attr("id"));
											}
                                        }
									});

									// select value
									ele.vals(vals[key] != null ? String(vals[key]) : "");
								} else if(tagName === "img") {
									// put image path
									ele.attr("src", vals[key] != null ? String(vals[key]) : "");
								} else {
									if(ele.data("format") !== undefined) {
										N(opts.data).formatter(opts.fRules !== null ? opts.fRules : ele).format(opts.row);
									} else {
										val = vals[key] != null ? String(vals[key]) : "";
										// put value
										if(!opts.html) {
											ele.text(val);
										} else {
											ele.html(val);
										}
									}
								}
							});
						} else {
							//radio, checkbox
							eles = $(opts.context).find(Form.getRadioNCheckBoxSelectorStr(key));

							if(eles.length > 0) {
								//validate
								if(eles.filter(".select_template__").data("validate") !== undefined) {
									// remove validator's dregs for rebind
									ele.removeClass("validate_false__");
									if(ele.instance("alert") !== undefined) {
										ele.instance("alert").remove();
										ele.removeData("alert__");
									}

									if (opts.validate) {
										N().validator(opts.vRules !== null ? opts.vRules : eles.filter(".select_template__"));
									}
								}

								//dataSync
								eles.unbind("click.form.dataSync select.form.dataSync");
								eles.data("eles", eles).bind("click.form.dataSync select.form.dataSync", function(e) {
									var currEle = $(this);
									var currKey = currEle.attr("name");
									if(currKey === undefined) {
										currKey = currEle.attr("id");
									}
									var currVals = $(this).data("eles").vals();
									if (vals[currKey] !== currVals) {
										// update dataset value
										vals[currKey] = currVals;

										// change row status
										if (vals.rowStatus !== "insert" && vals.rowStatus !== "delete") {
											vals.rowStatus = "update";
											// add data changed flag
											$(this).data("eles").addClass("data_changed__");
											if(!opts.context.hasClass("row_data_changed__")) {
												opts.context.addClass("row_data_changed__");
											}
										}

										// notify data changed
										if (!currEle.prop("disabled") && !currEle.prop("readonly")) {
											N.ds.instance(opts.extObj !== null ? opts.extObj : self).notify(opts.extRow > -1 ? opts.extRow : opts.row, currKey);
										}
	                                }
								});

								// select value
								eles.vals(vals[key] != null ? vals[key] : "");

								// add data changed flag
								if (vals.rowStatus === "update") {
									eles.addClass("data_changed__");
								} else {
									eles.removeClass("data_changed__");
								}
							}
						}
					}

					if(opts.onBindAfter !== null && this.options.extObj === null) {
						opts.onBindAfter.call(opts.context, opts.context, vals);
					}
					// Empty variables
					eles = val = undefined;
				}
				return this;
			},
			unbind : function() {
				var opts = this.options;
				if(opts.unbind && opts.initialInputData !== null) {
					opts.row = -1;
					opts.context.removeClass("row_data_changed__");
					var vals = opts.initialInputData;
					var eles, ele, val, tagName, type;
					for ( var key in vals ) {
						eles = $("#" + key, opts.context);
						type = N.string.trimToEmpty(eles.attr("type")).toLowerCase();
						if (eles.length > 0 && type !== "radio" && type !== "checkbox") {
							eles.each(function() {
								ele = $(this);
								ele.removeClass("data_changed__");
								tagName = this.tagName.toLowerCase();
								type = N.string.trimToEmpty(ele.attr("type")).toLowerCase();
								if (tagName === "textarea" || type === "text" || type === "password" || type === "hidden" || type === "file"
									// Support HTML5 Form's input types
									|| type === "number" || type === "email" || type === "search" || type === "color"
									// The date type does not support formatting, so it does not support it.
									// || type === "date" || type === "datetime-local" || type === "month" || type === "time" || type === "week"
									|| type === "range"
									|| type === "url") {
									// unbind events
									ele.unbind("focusout.form.validate focusout.form.dataSync keyup.form.dataSync focusin.form.unformat focusout.form.format");
									// remove validator's dregs for rebind
									ele.removeClass("validate_false__");
									if(ele.instance("alert") !== undefined) {
										ele.instance("alert").remove();
										ele.removeData("alert__");
									}
									// bind initial value
									ele.val(vals[key] != null ? String(vals[key]) : "");
								} else if(tagName === "select") {
									// unbind events
									ele.unbind("change.form.dataSync");
									// remove validator's dregs for rebind
									ele.removeClass("validate_false__");
									if(ele.instance("alert") !== undefined) {
										ele.instance("alert").remove();
										ele.removeData("alert__");
									}
									// bind initial value
									ele.vals(vals[key] != null ? String(vals[key]) : "");
								} else if(tagName === "img") {
									// bind initial value
									if(vals[key] !== undefined) {
										ele.attr("src", vals[key] != null ? String(vals[key]) : "");
									}
								} else {
									// bind initial value
									ele.text(vals[key] != null ? String(vals[key]) : "");
								}
							});
						} else {
							//radio, checkbox
							eles = $(opts.context).find(Form.getRadioNCheckBoxSelectorStr(key));
							eles.removeClass("data_changed__");
							if(eles.length > 0) {
								// unbind events
								eles.unbind("click.form.dataSync select.form.dataSync");
								// remove validator's dregs for rebind
								ele.removeClass("validate_false__");
								if(ele.instance("alert") !== undefined) {
									ele.instance("alert").remove();
									ele.removeData("alert__");
								}
								// bind initial value
								eles.vals(vals[key] != null ? vals[key] : "");
							}
						}
					}
					eles = val = undefined;
				}
				return this;
			},
			add : function(data, row) {
				var opts = this.options;
		        if (opts.data === null) {
		            throw new Error("[Form.add]Data is null. you must input data");
		        }

		        var extractedData = N.element.toData(opts.context.find(":input").not(":button"));
		        if(data != null) {
		        	if(N.isNumeric(data)) {
		        		row = data;
		        		data = undefined;
		        	} else {
		        		$.extend(extractedData, data);
		        	}
		        }
	        	extractedData.rowStatus = "insert";

	        	if(row > opts.data.length || row < 0) {
					row = undefined;
				}

	        	if(row === undefined) {
	        		if(!opts.addTop) {
		        		opts.data.push(extractedData);
		        		opts.row = opts.data.length - 1;
		        	} else {
		        		opts.data.splice(0, 0, extractedData);
		        		opts.row = 0;
		        	}
	        	} else {
		        	if(row === opts.data.length) {
		        		opts.data.push(extractedData);
		        		opts.row = opts.data.length - 1;
		        	} else {
		        		opts.data.splice(row, 0, extractedData);
		        		opts.row = row;
		        	}
	        	}
	        	// Set revert data
	        	if(opts.revert) {
	        		this.revertData = $.extend({}, opts.data[opts.row]);
	        	}

	        	this.bind();

	        	N.ds.instance(opts.extObj !== null ? opts.extObj : this).notify(opts.extRow > -1 ? opts.extRow : opts.row);

				return this;
			},
			remove : function(row) {
				var opts = this.options;
				if(row === undefined || row > opts.data.length - 1) {
		        	N.error("[N.grid.remove]Row index out of range");
		        }

				opts.data.splice(row, 1);
				opts.context.find("tbody:eq(" + row + ")").addClass("row_data_deleted");

				N.ds.instance(this).notify();
				return this;
			},
			revert : function() {
				var opts = this.options;
				if(!opts.revert) {
					N.error("[N.form.revert]Can not revert. N.form's revert option value is false");
				}
				var orgRow = opts.row;
				this.unbind();
				opts.row = orgRow;
				for(var k in opts.data[opts.row]){
					delete opts.data[opts.row][k];
				}
				$.extend(opts.data[opts.row], opts.data[opts.row], this.revertData);
				opts.data[opts.row]._isRevert = true;
				this.update(opts.row);
				N.ds.instance(opts.extObj !== null ? opts.extObj : this).notify(opts.extRow > -1 ? opts.extRow : opts.row);
				if(opts.data[opts.row]._isRevert !== undefined) {
					try {
						delete opts.data[opts.row]._isRevert
					} catch(e) {}
				}
				return this;
			},
			validate : function() {
				var opts = this.options;
				var eles = opts.context.find(":input:not(:radio, :checkbox), :radio.select_template__, :checkbox.select_template__");
				if(opts.validate) {
					eles.not(".validate_false__").trigger("unformat.formatter");
				} else {
					eles.trigger("unformat.formatter");
				}

				eles.trigger("validate.validator");
				eles.not(".validate_false__").trigger("format.formatter");

				// Focus to first input element with failed validation
				if(eles.filter(".validate_false__:eq(0)").length > 0) {
					eles.filter(".validate_false__:eq(0)").get(0).focus();
				}

				return eles.filter(".validate_false__").length > 0 ? false : true;
			},
			val : function(key, val, notify) {
				var opts = this.options;
				if(val === undefined) {
					return opts.data[opts.row][key];
				} else {
					if(val === null) {
						val = "";
					}
				}

				var vals = opts.data[opts.row];
				var eles, ele;
				var self = this;
				var rdonyFg = false;
				var dsabdFg = false;
				eles = $(opts.context).find("#" + key + ", input:radio[name='" + key + "'], input:checkbox[name='" + key + "'], input:radio[id='" + key + "'], input:checkbox[id='" + key + "']");
				if (eles.length > 0) {
					var tagName = eles.get(0).tagName.toLowerCase();
					var type = N.string.trimToEmpty(eles.attr("type")).toLowerCase();
					var currVal;
					if (type !== "radio" && type !== "checkbox") {
						eles.each(function() {
							ele = $(this);

							// remove prevent event condition of input element
			                if(ele.prop("readonly")) {
			                	ele.removeAttr("readonly");
			                    rdonyFg = true;
			                }
			                if(ele.prop("disabled")) {
			                	ele.removeAttr("disabled");
			                	dsabdFg = true;
			                }

							if (tagName === "textarea" || type === "text" || type === "password" || type === "hidden" || type === "file"
								// Support HTML5 Form's input types
								|| type === "number" || type === "email" || type === "search" || type === "color"
								// The date type does not support formatting, so it does not support it.
								// || type === "date" || type === "datetime-local" || type === "month" || type === "time" || type === "week"
								|| type === "range"
								|| type === "url") {
								// remove validator's dregs for rebind
								ele.removeClass("validate_false__");
								if(ele.instance("alert") !== undefined) {
									ele.instance("alert").remove();
									ele.removeData("alert__");
								}

								// put value
								ele.val(String(val));

								// validate
								if(ele.data("validate") !== undefined) {
									if (type !== "hidden") {
										ele.trigger("focusout.form.validate");
									}
								}

								if(notify !== false) {
									// dataSync
									ele.trigger("focusout.form.dataSync");
								} else {
									// add data changed flag
									ele.addClass("data_changed__");
								}

								// format
								if(ele.data("format") !== undefined) {
									if (type !== "hidden" && type !== "password") {
										ele.trigger("focusin.form.unformat");
										ele.trigger("focusout.form.format");
									}
								}
							} else if(tagName === "select") {
								// remove validator's dregs for rebind
								ele.removeClass("validate_false__");
								if(ele.instance("alert") !== undefined) {
									ele.instance("alert").remove();
									ele.removeData("alert__");
								}

								// select value
								ele.vals(val);

								if(notify !== false) {
									// dataSync
									ele.trigger("change.form.dataSync");
								} else {
									// add data changed flag
									ele.addClass("data_changed__");
								}
							} else if(tagName === "img") {
								currVal = String(val);

								// update dataset value
								vals[ele.attr("id")] = currVal;

								// change row status
								if (vals.rowStatus !== "insert" && vals.rowStatus !== "delete") {
									vals.rowStatus = "update";
									// add data changed flag
									ele.addClass("data_changed__");
								}

								// put image path
								ele.attr("src", currVal);

								// notify data changed
								N.ds.instance(opts.extObj !== null ? opts.extObj : self).notify(opts.extRow > -1 ? opts.extRow : opts.row, ele.attr("id"));
							} else {
								currVal = String(val);

								// update dataset value
								vals[ele.attr("id")] = currVal;

								// change row status
								if (vals.rowStatus !== "insert" && vals.rowStatus !== "delete") {
									vals.rowStatus = "update";
									// add data changed flag
									ele.addClass("data_changed__");
								}

								// put value
								if(ele.data("format") !== undefined) {
									N(opts.data).formatter(opts.fRules !== null ? opts.fRules : ele).format(opts.row);
								} else {
									if(!opts.html) {
										ele.text(currVal);
									} else {
										ele.html(currVal);
									}
								}

								// notify data changed
								N.ds.instance(opts.extObj !== null ? opts.extObj : self).notify(opts.extRow > -1 ? opts.extRow : opts.row, ele.attr("id"));
							}

							// reset prevent event condition of input element
							if(rdonyFg) {
								ele.prop("readonly", true);
			                }
			                if(dsabdFg) {
			                	ele.prop("disabled", true);
			                }
						});
					} else {
						//radio, checkbox
						eles = $(opts.context).find(Form.getRadioNCheckBoxSelectorStr(key));
						if(eles.length > 0) {
							// remove validator's dregs for rebind
							eles.removeClass("validate_false__");
							var a = eles.instance("alert", function() {
								this.remove()
							}).removeData("alert__");

							// select value
							eles.vals(val);
							if(notify !== false) {
								// dataSync
								$(eles.get(0)).trigger("select.form.dataSync");
							} else {
								// add data changed flag
								$(eles.get(0)).addClass("data_changed__");
							}
						}
					}

					// Empty variables
					eles = ele = currVal = undefined;
				} else {
					// put value
					if(opts.data[opts.row][key] !== val) {
						opts.data[opts.row][key] = val;

						// change row status
	                    if (opts.data[opts.row].rowStatus !== "insert" && opts.data[opts.row].rowStatus !== "delete") {
	                    	opts.data[opts.row].rowStatus = "update";
	                    }

	                    // dataSync
	                    if(notify !== false) {
	                    	N.ds.instance(opts.extObj !== null ? opts.extObj : self).notify(opts.extRow > -1 ? opts.extRow : opts.row, key);
	                    }
					}
				}

				// add data changed flag
            	if(opts.data[opts.row].rowStatus !== "insert"
        			&& opts.data[opts.row].rowStatus !== "delete"
        			&& !opts.context.hasClass("row_data_changed__")) {
            		opts.context.addClass("row_data_changed__");
            	}

            	return this;
			},
			update : function(row, key) {
				var opts = this.options;
				if (key === undefined) {
					this.bind(row);
				} else {
					if(row === this.row()) {
						this.val(key, opts.data[row][key], false);
						N.element.dataChanged(opts.context.find("#" + key + ":not(:radio, :checkbox), " + Form.getRadioNCheckBoxSelectorStr(key)));
					}
				}
				return this;
			}
		});

		// List
		var List = N.list = function(data, opts) {
			return this;
		};

		$.extend(List, {
        	render : function(i, limit, delay, lastIdx, callType) {
        		var opts = this.options;
        		var self = this;

				// clone li for create new row
				tempRowEleClone = self.tempRowEle.clone(true, true).hide();
				opts.context.append(tempRowEleClone);

				if(opts.rowHandler !== null) {
					opts.rowHandler.call(tempRowEleClone, i, tempRowEleClone, opts.data[i]);
				}

				// for row data bind, use N.form
				N(opts.data[i]).form({
					context : tempRowEleClone,
					html: opts.html,
					validate : opts.validate,
					extObj : self,
					extRow : i,
					revert : opts.revert,
					unbind : false
				}).bind();

				tempRowEleClone.show(delay, function() {
					i++;
					if(opts.height === 0 || opts.scrollPaging.size === 0 || (callType === "append" && data.length > 0 && data.length <= opts.scrollPaging.size)) {
						lastIdx = opts.data.length - 1;
					} else {
						lastIdx = opts.scrollPaging.idx + (limit - 1);
					}
					// -4(5) is visualization rendering buffer;
					if(i-4 === lastIdx) {
						delay = 0;
					} else {
						delay = opts.createRowDelay;
					}
					if(i <= lastIdx) {
						if (opts.data.length > 0) {
							opts.isBinding = true;

							List.render.call(self, i, limit, delay, lastIdx, callType);
						}
					} else if(i === lastIdx + 1) {
						if(opts.onBind !== null) {
							opts.onBind.call(opts.context, opts.context, opts.data);
						}
						opts.scrollPaging.limit = opts.scrollPaging.size === 0 ? opts.data.length : opts.scrollPaging.size;

						opts.isBinding = false;
						opts.context.dequeue("bind");
					}
				});
			}
		});

		// Grid
		var Grid = N.grid = function(data, opts) {
			this.options = {
				data : N.type(data) === "array" ? N(data) : data,
				row : -1, // selected row index
				beforeRow : -1, // before selected row index
				context : null,
				height : 0,
				validate : true,
				html : false,
				addTop : false,
				addSelect : true,
				appendScroll : true,
				filter : false,
				resizable : false,
				vResizable : false,
				sortable : false,
				windowScrollLock : true,
				select : false,
				multiselect : false,
				checkAll : null, // selector
				checkAllTarget : null, // selector
				checkSingleTarget : null, // TODO
				hover : false,
				revert : false,
				createRowDelay : 1,
				scrollPaging : {
					idx : 0,
					size : 100
				},
				fRules : null,
				vRules : null,
				rowHandler : null,
				onSelect : null,
				onBind : null,
				misc : {
					withoutTbodyLength : 0, // garbage rows count in table
					resizableCorrectionWidth : 0,
					resizableLastCellCorrectionWidth : 0,
					resizeBarCorrectionLeft : 0,
					resizeBarCorrectionHeight : 0
				}
			};

			try {
				this.options = $.extend({}, this.options, N.context.attr("ui").grid);

				//For $.extend method does not extend object type
				this.options.scrollPaging = $.extend({}, this.options.scrollPaging, N.context.attr("ui").grid.scrollPaging);
				this.options.misc = $.extend({}, this.options.misc, N.context.attr("ui").grid.misc);
			} catch (e) {
				N.error("[N.grid]" + e, e);
			}

			if (N.isPlainObject(opts)) {
				//convert data to wrapped set
				opts.data = N.type(opts.data) === "array" ? N(opts.data) : opts.data;

				$.extend(this.options, opts);
				//For $.extend method does not extend object type
				if(opts.scrollPaging !== undefined) {
					$.extend(this.options.scrollPaging, opts.scrollPaging);
				}

				//for scroll paging limit
				this.options.scrollPaging.limit = this.options.scrollPaging.size;

				if(N.type(this.options.context) === "string") {
					this.options.context = N(this.options.context);
				}
			} else {
				this.options.context = N(opts);
			}

			// set garbage rows count in table
			this.options.misc.withoutTbodyLength = this.options.context.children().length - this.options.context.children("tbody").length - this.options.context.children("tfoot").length;

			// If the value of the opts.scrollPaging.size option is greater than 0, the addTop option is unconditionally set to true.
			if(!this.options.addTop) {
				this.options.scrollPaging.size = 0;
				this.options.createRowDelay = 0;
			}

			// for bind "append"
			this.options.scrollPaging.defSize = this.options.scrollPaging.size;

			// set tbody template
			this.tempRowEle = this.options.context.find("> tbody").clone(true, true);

			// set style class name to context element
			this.options.context.addClass("grid__");
			// set style class name to context element for hover option
			if(this.options.hover) {
				this.options.context.addClass("grid_hover__");
			}
			if(this.options.select || this.options.multiselect) {
				// set style class name to context element for select, multiselect options
				this.options.context.addClass("grid_select__");

				var self = this;
				// bind tbody click event for select, multiselect options
				this.tempRowEle.bind("click.grid.tbody", function(e) {
					var thisEle = $(this);
					var retFlag;
					var selected;

					// save the selected row index
					if(thisEle.hasClass("grid_selected__")) {
						self.options.row = -1;
						selected = true;
					} else {
						self.options.row = thisEle.index() - self.options.misc.withoutTbodyLength;
						selected = false;
					}

					if(self.options.onSelect !== null) {
						retFlag = self.options.onSelect.call(thisEle, self.options.row, thisEle, self.options.data, self.options.beforeRow, e);
					}

					if(retFlag === undefined || retFlag === true) {
						if(selected) {
							thisEle.removeClass("grid_selected__");
						} else {
							if(!self.options.multiselect) {
								self.options.context.find("> tbody:eq(" + self.options.beforeRow + ")").removeClass("grid_selected__");
							}
							thisEle.addClass("grid_selected__");
							self.options.beforeRow = self.options.row;
						}
					}
				});
			}

			// set cell count in tbody
			this.cellCnt = Grid.cellCnt(this.tempRowEle);

			//remove colgroup when the resizable option is true
			if(this.options.resizable) {
				Grid.removeColgroup.call(this);
			}

			// fixed header
			if(this.options.height > 0) {
				Grid.fixHeader.call(this);
			}

			// set tbody cell's id attribute into th cell in thead
			this.thead = Grid.setTheadCellInfo.call(this);
			this.rowContainerEle = this.options.context;
			if(this.options.height > 0) {
				this.rowContainerEle = this.options.context.closest("div.tbody_wrap__ > .grid__");
        	}

			// set function for check all checkbox in grid
			if(this.options.checkAll !== null && this.options.checkAllTarget !== null) {
				Grid.checkAll.call(this);
			}

			// set function for check single checkbox in grid
			if(this.options.checkSingleTarget !== null) {
				Grid.checkSingle.call(this);
			}

			// sortable, v(ertical)Resizable
			if(this.options.sortable) {
				Grid.sort.call(this);
			}

			// resizable column width
			if(this.options.resizable) {
				Grid.resize.call(this);
			}

			// data filter
			if(this.options.filter || this.thead.find("> tr th[data-filter='true']").length > 0) {
				if(this.options.filter) {
					this.thead.find("> tr th").attr("data-filter", "true");
				}
				Grid.dataFilter.call(this);
			}

			// set this instance to context element
			this.options.context.instance("grid", this);

			// register this to N.ds for realtime data synchronization
			N.ds.instance(this, true);

			return this;
		};

		$.extend(Grid, {
			removeColgroup : function() {
				var opts = this.options;
				if(opts.context.find("colgroup").length > 0) {
					var firstTr = opts.context.find("thead > tr:first");
					opts.context.find("colgroup > col").each(function(i) {
						firstTr.find("th:eq(" + String(i) + ")").css("width", this.style.width).removeAttr("scope");
					}).parent().remove();
					this.options.misc.withoutTbodyLength -= 1;
				}
			},
			fixHeader : function() {
				var opts = this.options;

				opts.context.css({
					"table-layout" : "fixed",
					"margin" : "0"
				});

		        var sampleCell = opts.context.find("tbody td:eq(0)");
		        var borderLeft = sampleCell.css("border-left-width") + " " + sampleCell.css("border-left-style") + " " + sampleCell.css("border-left-color");
		        var borderBottom = sampleCell.css("border-bottom-width") + " " + sampleCell.css("border-bottom-style") + " " + sampleCell.css("border-bottom-color");

		        // Root grid container
		        var gridWrap = opts.context.wrap('<div class="grid_wrap__"/>').parent();
		        gridWrap.css({
		        	"border-left" : borderLeft
		        });

		        //Create grid header
		        var scrollbarWidth = N.browser.scrollbarWidth();
		        var thead = opts.context.clone(true, true);
		        thead.find("tbody").remove();
		        thead.find("tfoot").remove();
		        var theadWrap = thead.wrap('<div class="thead_wrap__"/>').parent().css({
		        	"padding-right" : scrollbarWidth + "px",
		        	"margin-left" : "-1px"
		        });
		        gridWrap.prepend(theadWrap);

		        //Create grid body
		        opts.context.find("> thead th").empty().css({
		        	"height" : "0",
	                "padding-top" : "0",
	                "padding-bottom" : "0",
	                "border-top" : "none",
	                "border-bottom" : "none"
		        });
		        opts.context.find("> tbody td").css({
	                "border-top" : "none"
		        });
		        this.tempRowEle.find("td").css({
	                "border-top" : "none"
		        });
		        var tbodyWrap = opts.context.wrap('<div class="tbody_wrap__"/>').parent().css({
		        	"height" : String(opts.height) + "px",
		        	"overflow-y" : "scroll",
		        	"margin-left" : "-1px",
		        	"border-bottom" : borderBottom
		        });

		        // for IE
		        if(N.browser.is("ie")) {
		        	tbodyWrap.css("overflow-x", "hidden");
		        }

		        if(opts.windowScrollLock) {
		        	N.element.windowScrollLock(tbodyWrap);
		        }

		        // Scroll paging
		        var self = this;
		        var defSPSize = opts.scrollPaging.limit;
		        var rowEleLength;
		        tbodyWrap.scroll(function() {
		        	if(opts.scrollPaging.size > 0) {
			        	var thisWrap = $(this);
	                    if (thisWrap.scrollTop() >= opts.context.height() - thisWrap.height()) {
	                    	rowEleLength = opts.context.find("> tbody").length;
	                    	if (rowEleLength >= opts.scrollPaging.idx + defSPSize) {
		                        if (rowEleLength > 0 && rowEleLength <= opts.data.length) {
		                            opts.scrollPaging.idx += defSPSize;
		                        }

		                        if (opts.scrollPaging.idx + opts.scrollPaging.limit >= opts.data.length) {
		                        	opts.scrollPaging.limit = opts.data.length - opts.scrollPaging.idx;
		                        } else {
		                        	opts.scrollPaging.limit = defSPSize;
		                        }

		                        if(opts.scrollPaging.idx < opts.data.length) {
		                        	self.bind(undefined, "grid.bind");
		                        } else if(opts.scrollPaging.idx === opts.data.length) {
		                        	opts.scrollPaging.limit = opts.scrollPaging.size === 0 ? opts.data.length : opts.scrollPaging.size;
		                        }
		                    }
		                }
		        	}
	            });

		        // Create grid footer
		        var tfootWrap;
		        if(opts.context.find("> tfoot").length > 0) {
		        	var tfoot = opts.context.clone(true, true);
			        opts.context.find("> tfoot").remove();
			        tfoot.find("thead").remove();
			        tfoot.find("tbody").remove();
			        tfootWrap = tfoot.wrap('<div class="tfoot_wrap__"/>').parent().css({
			        	"padding-right" : scrollbarWidth + "px",
			        	"margin-left" : "-1px"
			        });
			        gridWrap.append(tfootWrap);
		        }

		        // Vertical height resizing
		        if(opts.vResizable) {
		        	Grid.vResize.call(this, gridWrap, tbodyWrap, tfootWrap);
		        }
			},
			vResize : function(gridWrap, tbodyWrap, tfootWrap) {
        		var pressed = false;
	        	var vResizable = $('<div class="v_resizable__" align="center"></div>');
	        	vResizable.css("cursor", "n-resize");
	        	vResizable.css("margin-bottom", gridWrap.css("margin-bottom"));
	        	gridWrap.css("margin-bottom", "0");

	        	var currHeight, tbodyOffset, tfootHeight = 0;
	        	vResizable.bind("mousedown.grid.vResize touchstart.grid.vResize", function(e) {
					if(e.originalEvent.touches) {
						e.preventDefault();
						e.stopPropagation();
					}

	        		if(e.originalEvent.touches || (e.which || e.button) === 1) {
	        			if(tfootWrap !== undefined) {
	        				tfootHeight = tfootWrap.height();
	        			}
	        			tbodyOffset = tbodyWrap.offset();

	        			$(document).bind("dragstart.grid.vResize selectstart.grid.vResize", function() {
	        				return false;
	        			});
	        			pressed = true;

	        			$(window.document).bind("mousemove.grid.vResize touchmove.grid.vResize", function(e) {
	        				var mte;
							if(e.originalEvent.touches) {
								e.stopPropagation();
								mte = e.originalEvent.touches[0];
							}
	        				if(pressed) {
	        					currHeight = ((mte !== undefined ? mte.pageY : e.pageY) - tbodyOffset.top - tfootHeight) + "px";
	        					tbodyWrap.css({
	        						"height" : currHeight,
	        						"max-height" : currHeight
	        					});
	        				}
	        			});

	        			$(window.document).bind("mouseup.grid.vResize touchend.grid.vResize", function(e) {
	        				$(document).unbind("dragstart.grid.vResize selectstart.grid.vResize mousemove.grid.vResize touchmove.grid.vResize mouseup.grid.vResize touchend.grid.vResize");
	        				pressed = false;
	        			});
	        		}
	        	});

	        	gridWrap.after(vResizable);
        	},
        	resize : function() {
        		var self = this;

        		var resizeBar, currResizeBar, resizeBarHeight, cellEle, currCellEle, currNextCellEle, targetNextCellEle, targetCellEle, currResizeBarEle,
					defWidth, nextDefWidth, currWidth, nextCurrWidth, startOffsetX,
					minPx, maxPx, defPx, movedPx;

				var opts = this.options;
				var theadCells = this.thead.find("> tr th");
				var isPressed = false;
				var scrollbarWidth = N.browser.scrollbarWidth();

				if(N.browser.is("safari")){
					theadCells.css("padding-left", "0");
					theadCells.css("padding-right", "0");
				}
				var resizeBarWidth = 5;
				var resizeBarCorrectionHeight = N.browser.is("ie") ? -2 : 0;
				var context;
				if (opts.height > 0) {
					context = opts.context.closest(".grid_wrap__");
    	        } else {
    	        	context = opts.context;
    	        }

				this.thead.bind("mouseover.grid.resize touchstart.grid.resize", function() {
					resizeBarHeight = (opts.height > 0 ? self.rowContainerEle.closest(".grid_wrap__").height() - 3 : self.rowContainerEle.height() + resizeBarCorrectionHeight) + 1 + opts.misc.resizeBarCorrectionHeight;
					theadCells.each(function() {
						var cellEle = $(this);
						cellEle.find("> .resize_bar__").css({
							"top" : cellEle.position().top + 1,
							"left" : (cellEle.position().left + cellEle.outerWidth() - resizeBarWidth / 2 + opts.misc.resizeBarCorrectionLeft) + "px"
						});
					});
        		});

				var isFirstTimeLastClick = true;
				theadCells.each(function() {
					cellEle = $(this);
		            resizeBar = $('<div class="resize_bar__"></div>').css({
		            	"padding": "0px",
		            	"position": "absolute",
		            	"width": resizeBarWidth + "px",
		            	"height": String(cellEle.outerHeight()) + "px",
		            	"opacity": "0",
		            	"background-color" : "#000",
		            	"z-index" : 9999999
		            }).appendTo(cellEle);

		            resizeBar.bind("mousedown.grid.resize touchstart.grid.resize", function(e) {
		            	var dte;
						if(e.originalEvent.touches) {
							dte = e.originalEvent.touches[0];
						}

		            	if(e.originalEvent.touches || (e.which || e.button) === 1) {
		            		$(this).css({
		            			"opacity": ""
		            		}).animate({
		            			"height" : resizeBarHeight + "px"
		            		}, 150);

		            		startOffsetX = dte !== undefined ? dte.pageX : e.pageX;
		            		currResizeBarEle = $(this);
		            		currCellEle = currResizeBarEle.parent("th");
		            		currNextCellEle = currResizeBarEle.parent("th").next();
		            		var islast = false;
		            		if(currNextCellEle.length === 0) {
		            			currNextCellEle = context;
		            			islast = true;
		            		}

		            		if(opts.height > 0) {
		            			targetCellEle = opts.context.find("thead th:eq(" + theadCells.index(currCellEle) + ")");
		            			targetNextCellEle = opts.context.find("thead th:eq(" + (theadCells.index(currCellEle) + 1) + ")");
		            		}
		            		// Convert flexible cell width to absolute cell width when the clicked resizeBar is last last resizeBar
		            		if(isFirstTimeLastClick && islast) {
		            			theadCells.each(function(i) {
	            					$(this).width(Math.floor($(this).width()) + (opts.height > 0 ? opts.misc.resizableLastCellCorrectionWidth : 0) + opts.misc.resizableCorrectionWidth).removeAttr("width");

	            					if(targetCellEle !== undefined) {
	            						opts.context.find("thead th:eq(" + theadCells.index(this) + ")").width(Math.floor($(this).width()) + opts.misc.resizableCorrectionWidth).removeAttr("width");
	            					}
		    					});
		            			isFirstTimeLastClick = false;
	            			}

		            		// to block sort event
		            		currCellEle.data("sortLock", true);

		            		defWidth = Math.floor(currCellEle.width()) + opts.misc.resizableCorrectionWidth;
		            		nextDefWidth = !islast ? Math.floor(currNextCellEle.width()) + opts.misc.resizableCorrectionWidth : Math.floor(context.width());

		            		$(document).bind("dragstart.grid.resize selectstart.grid.resize", function() {
		            			return false;
		            		});
		            		isPressed = true;

		            		minPx = !islast ? Math.floor(currNextCellEle.offset().left) : Math.floor(currCellEle.offset().left) + Math.floor(currCellEle.outerWidth());
		            		maxPx = minPx + (!islast ? Math.floor(currNextCellEle.outerWidth()) : 7680);
		            		movedPx = defPx = Math.floor(currResizeBarEle.parent("th").offset().left);
		            		$(window.document).bind("mousemove.grid.resize touchmove.grid.resize", function(e) {
		            			var mte;
								if(e.originalEvent.touches) {
									e.stopPropagation();
									mte = e.originalEvent.touches[0];
								}
		            			if(isPressed) {
		            				var mPageX = mte !== undefined ? mte.pageX : e.pageX;
		            				if(defPx < mPageX && maxPx > mPageX) {
		            					movedPx = mPageX - startOffsetX;
	            						currWidth = defWidth + movedPx;
	            						nextCurrWidth = !islast ? nextDefWidth - movedPx : nextDefWidth + movedPx;
		            					if(currWidth > 0 && nextCurrWidth > 0) {
		            						currCellEle.css("width", currWidth + "px");
	            							currNextCellEle.css("width", nextCurrWidth + "px");
		            						if(targetCellEle !== undefined) {
		            							targetCellEle.css("width", currWidth + "px");
	            								targetNextCellEle.css("width", nextCurrWidth + "px");
		            						}
		            					}
		            					currCellEle.find(".resize_bar__").offset({
			            					"left" : minPx - resizeBarWidth/2 + movedPx + opts.misc.resizeBarCorrectionLeft
			            				});
		            				}
		            			}
		            		});

		            		var currResizeBar = $(this);
		            		$(window.document).bind("mouseup.grid.resize touchend.grid.resize", function(e) {
		            			currResizeBar.animate({
	            					"height" : String(cellEle.outerHeight()) + "px"
	            				}, 200, function() {
            						$(this).css({
            							"opacity": "0"
            						});
	            				});

		            			$(document).unbind("dragstart.grid.resize selectstart.grid.resize mousemove.grid.resize touchmove.grid.resize mouseup.grid.resize touchend.grid.resize");
		            			isPressed = false;
		            		});
		            	}
		        	});
				});
			},
        	sort : function() {
    	        var opts = this.options;
    	        var thead = this.thead;

    	        var theadCells = thead.find("> tr th");
    	        theadCells.css("cursor", "pointer");
    	        var self = this;
    	        theadCells.bind("click.grid.sort", function(e) {
    	        	var currEle = $(this);
    	        	if(currEle.data("sortLock")) {
    	        		currEle.data("sortLock", false);
    	        		return false;
    	        	}
    	        	if (opts.data.length > 0) {
    	        		if(N.string.trimToNull($(this).text()) !== null && $(this).find(opts.checkAll).length === 0) {
    	        			var isAsc = false;
    	        			if (currEle.find(".sortable__").hasClass("asc__")) {
    	        				isAsc = true;
    	        			}
    	                    if (isAsc) {
    	                    	self.bind(N(opts.data).datasort($(this).data("id"), true), "grid.sort");
    	                    	currEle.append('<span class="sortable__ desc__">' + opts.sortableItem.asc + '</span>');
    	                    } else {
    	                    	self.bind(N(opts.data).datasort($(this).data("id")), "grid.sort");
    	                    	currEle.append('<span class="sortable__ asc__">' + opts.sortableItem.desc + '</span>');
    	                    }
    	        		}
    	        	}
    	        });
        	},
			dataFilter : function() {
				var opts = this.options;
				var thead = this.thead;
				var theadCells = thead.find("> tr th");
				var self = this;

				var clonedData;

				var filterKeys;
				var filteredKeys;
				var bfrSelId;

				var changeBtnIcon = function(th, kind) {
					th.find(".btn_data_filter__")
					.removeClass("btn_data_filter_empty__ btn_data_filter_part__ btn_data_filter_full__")
					.addClass("btn_data_filter_" + kind + "__");
				};

				var btnEle = $('<a href="#" class="btn_data_filter__" title="' + N.message.get(opts.message, "dFilter") + '"><span>' + N.message.get(opts.message, "dFilter") + '</span><a>')
					.addClass("btn_data_filter_full__")
					.bind("click.grid.dataFilter", function(e) {
						e.preventDefault();
						e.stopPropagation();

						var thisEle = $(this);
						var visiblePanel = thead.find(".data_filter_panel__.visible__");
						if(visiblePanel.length > 0) {
							visiblePanel.removeClass("visible__").addClass("hidden__");
							var eventNm = N.element.whichTransitionEvent(visiblePanel);
							visiblePanel.unbind(eventNm);
							visiblePanel.one(eventNm, function(e){
								if(!thisEle.hasClass("btn_data_filter__")) {
									$(this).hide();
								}
					        }).trigger("nothing");
						}

						var theadCell = $(this).closest("th");

						var panel;
						var searchBox;
						var filterListBox;
						var id = theadCell.data("id");
						var dataFilterProgress;

						if(theadCell.find(".data_filter_panel__").length > 0) {
							panel = theadCell.find(".data_filter_panel__").hide().removeClass("visible__").addClass("hidden__");
							dataFilterProgress = theadCell.find(".data_filter_progress__");
							searchBox = panel.find(".data_filter_search__");
							panel.find(".data_filter_checkall_box__ .data_filter_total_cnt__").text('(' + opts.data.length + ')');
							filterListBox = panel.find(".data_filter_list__");

							// Index filter keys
							if(bfrSelId !== id) {
								filterKeys = {};
								$.each(clonedData, function(i, v) {
									if(filterKeys[id + "_" + v[id]] === undefined) {
										filterKeys[id + "_" + v[id]] = [i];
									} else {
										filterKeys[id + "_" + v[id]].push(i);
									}
								});
							}

							// Index filter keys from filtered data
							filteredKeys = {};
							$.each(opts.data, function(i, v) {
								if(filteredKeys[id + "_" + v[id]] === undefined) {
									filteredKeys[id + "_" + v[id]] = [i];
								} else {
									filteredKeys[id + "_" + v[id]].push(i);
								}
							});
						} else {
							if(theadCells.find(".data_filter_panel__").length === 0) {
								clonedData = opts.data.get().slice(0);
							}

							panel = $('<div align="left" class="data_filter_panel__ hidden__">'
									+ 	'<div class="data_filter_search__">'
									+ 		'<input class="data_filter_search_word__" type="text">'
									+		'<a class="data_filter_search_btn__" href="#" title="' + N.message.get(opts.message, "search") + '">'
									+			'<span>' + N.message.get(opts.message, "search") + '</span>'
									+		'</a>'
									+ 	'</div>'
									+ 	'<div class="data_filter_checkall_box__"><label><input type="checkbox" checked="checked">' + N.message.get(opts.message, "selectAll") + '<span class="data_filter_total_cnt__">(' + opts.data.length + ')</span></label></div>'
									+ 	'<ul class="data_filter_list__"></ul>'
									+ '</div>')
							.css("z-index", 1)
							.hide()
							.appendTo(theadCell).bind("click.grid.dataFilter, mouseover.grid.dataFilter", function(e) {
								e.stopPropagation();
							});

							dataFilterProgress = $('<div class="data_filter_progress__"></div>')
							.css({
								"z-index" : 2,
								"opacity" : 0.3
							})
							.appendTo(panel);

							searchBox = panel.find(".data_filter_search__");

							// search btn event
							panel.find(".data_filter_search_btn__").bind("click.grid.dataFilter", function(e) {
								e.preventDefault();
								var searchWord = panel.find(".data_filter_search_word__").val();
								if(N.string.trimToNull(searchWord) !== null) {
									var retChkbxs = filterListBox.find("li:contains('" + searchWord + "')").show().find(":checkbox").prop("checked", true);
									filterListBox.find("li:not(:contains('" + searchWord + "'))").hide().find(":checkbox").prop("checked", false).last().trigger("do.grid.dataFilter");
									retChkbxs.each(function() {
										chkboxEle = $(this);
										chkboxEle.parent().children("span").text('(' + String(chkboxEle.data("length")) + ')')
									});
								} else {
									filterListBox.find("li").show();
									filterListBox.find("li :checkbox").prop("checked", true).last().trigger("do.grid.dataFilter");
								}
							});
							panel.find(".data_filter_search_word__").bind("keyup.grid.dataFilter", function(e) {
								var keyCode = (e.keyCode ? e.keyCode : (e.which ? e.which : e.charCode));
			                    if (keyCode == 13) {
			                    	panel.find(".data_filter_search_btn__").click();
			                    }
							});

							// select all checkbox event
							panel.find(".data_filter_checkall_box__ :checkbox").bind("click.grid.dataFilter", function() {
								if($(this).is(":checked")) {
									var chkboxEle;
									panel.find(".data_filter_search_word__").val("");
									filterListBox.find("li").show();
									filterListBox.find("li :checkbox").prop("checked", true).each(function() {
										chkboxEle = $(this);
										chkboxEle.parent().children("span").text('(' + String(chkboxEle.data("length")) + ')')
									}).last().trigger("do.grid.dataFilter");
								} else {
									filterListBox.find("li :checkbox").prop("checked", false).last().trigger("do.grid.dataFilter");
									filterListBox.find("li span").text("(0)");
								}
							});

							filterListBox = panel.find(".data_filter_list__").css({
								"max-height" : opts.height - searchBox.outerHeight() - panel.find(".data_filter_checkall_box__").height() - 15
							});

							// Index filter keys
							filterKeys = {};
							$.each(clonedData, function(i, v) {
								if(filterKeys[id + "_" + v[id]] === undefined) {
									filterKeys[id + "_" + v[id]] = [i];
								} else {
									filterKeys[id + "_" + v[id]].push(i);
								}
							});

							// Index filter keys from filtered data
							if(!N.isEmptyObject(filteredKeys) && clonedData.length !== opts.data.length) {
								filteredKeys = {};
								$.each(opts.data, function(i, v) {
									if(filteredKeys[id + "_" + v[id]] === undefined) {
										filteredKeys[id + "_" + v[id]] = [i];
									} else {
										filteredKeys[id + "_" + v[id]].push(i);
									}
								});
							} else {
								filteredKeys = filterKeys;
							}
						}

						panel.show(0, function() {
							N(this).removeClass("hidden__").addClass("visible__");
						});

						var itemSeq = 0;
						for(var k in filterKeys) {
							var filterItemEle;
							var length = filteredKeys[k] === undefined ? 0 : filteredKeys[k].length;

							var prevFilterItemEle = filterListBox.find(".data_filter_item_" + String(itemSeq) + "__");
							if(prevFilterItemEle.length > 0) {
								filterItemEle = prevFilterItemEle;
								filterItemEle.find(".data_filter_cnt__").text("(" + String(length) + ")");
							} else {
								filterItemEle = $('<li class="data_filter_item_' + String(itemSeq) + '__">'
										+ '<label><input type="checkbox" checked="checked" class="data_filter_checkbox__">'
										+ k.replace(id + "_", "") + '<span class="data_filter_cnt__">(' + String(length) + ')</span></label></li>');

								filterItemEle.find(".data_filter_checkbox__")
								.data("rowIdxs", filterKeys[k])
								.data("length", length)
								.bind("click.grid.dataFilter, do.grid.dataFilter", function() {
									// Update clicked checkbox(filter) row count
									var thisEle = $(this);
									if(thisEle.is(":checked")) {
										thisEle.parent().children("span").text("(" + String(thisEle.data("length")) + ")");
									} else {
										thisEle.parent().children("span").text("(0)");
									}

									// dataFilterListUnCheckedEles is current thead's cell unchecked data filter list
									var dataFilterListUnCheckedEles = theadCell.find(".data_filter_list__ li :checkbox:not(:checked)");
									if(dataFilterListUnCheckedEles.length > 0) {
										panel.find(".data_filter_checkall_box__ :checkbox").prop("checked", false);
										if(theadCell.find(".data_filter_list__ li :checkbox:checked").length > 0) {
											changeBtnIcon(theadCell, "part");
										} else {
											changeBtnIcon(theadCell, "empty");
										}
									} else {
										panel.find(".data_filter_checkall_box__ :checkbox").prop("checked", true);
										changeBtnIcon(theadCell, "full");
									}

									// dataFilterListUnCheckedEles is all thead's cells unchecked data filter list
									dataFilterListUnCheckedEles = theadCells.find(".data_filter_list__ li :checkbox:not(:checked)");

									var filterIdxs = [];
									dataFilterListUnCheckedEles.each(function() {
										$.each($(this).data("rowIdxs"), function(i, v) {
											filterIdxs[v] = v;
										});
									});

									filterIdxs = $.grep(filterIdxs, function(n){ return n == 0 || n });

									dataFilterProgress.show().fadeTo(50, 0.5, function() {
										// init scrollPaging index
										opts.scrollPaging.idx = 0;

										if(filterIdxs.length > 0 && filterIdxs.length !== clonedData.length) {
											var extrData = clonedData.slice(0);
											var bfrFilterIdx = -1;
											var addUnits = 0;
											for(var i = 0; i < filterIdxs.length; i++){
												if(filterIdxs[i] - bfrFilterIdx === 1) {
													addUnits++;
												} else {
													extrData.splice((bfrFilterIdx - addUnits + 1) - (i - addUnits), addUnits);
													addUnits = 1;
												}
												bfrFilterIdx = filterIdxs[i];
										    }
											extrData.splice((bfrFilterIdx - addUnits + 1) - (i - addUnits), addUnits);

											self.bind(extrData, "grid.dataFilter");
										} else {
											if(filterIdxs.length > 0) {
												self.bind([], "grid.dataFilter");
											} else {
												self.bind(clonedData, "grid.dataFilter");
											}
										}

										// Update total count.
										theadCell.find(".data_filter_total_cnt__").text("(" + String(opts.data.length) + ")");

										// Prevent event propagation when browser is stoped.
										setTimeout(function() {
											dataFilterProgress.hide();
										}, 0);
									});
								});

								filterListBox.append(filterItemEle);
							}

							if(length === 0) {
								filterItemEle.find(".data_filter_checkbox__").prop("checked", false);
							}
							itemSeq++;
						}

						$(document).unbind("click.grid.dataFilter touchstart.grid.dataFilter");
						$(document).one("click.grid.dataFilter touchstart.grid.dataFilter", function(e) {
							if($(e.target).closest(".data_filter_panel__").length === 0 && !$(e.target).hasClass("btn_data_filter__")) {
								var panel = thead.find(".data_filter_panel__.visible__");
								if(panel.length > 0) {
									panel.removeClass("visible__").addClass("hidden__");
									var eventNm = N.element.whichTransitionEvent(panel);
									panel.unbind(eventNm);
									panel.one(eventNm, function(e){
						            	$(this).hide();
							        }).trigger("nothing");
								}
							}
						});

						bfrSelId = id;
					}).prependTo(theadCells.filter("[data-filter='true']"));
			},
        	checkAll : function() {
        		var opts = this.options;
    	        var thead = this.thead;
    	        var rowContainerEle = this.rowContainerEle;

				var checkAll = thead.find(this.options.checkAll);
				checkAll.bind("click.grid.checkAll", function() {
					if(!$(this).prop("checked")) {
						rowContainerEle.find("tbody td " + opts.checkAllTarget + ":checked").removeProp("checked");
					} else {
						rowContainerEle.find("tbody td " + opts.checkAllTarget + ":not(':checked')").prop("checked", true);
					}
				});
				rowContainerEle.on("click.grid.checkAllTarget", "tbody td " + opts.checkAllTarget, function() {
					if(rowContainerEle.find("tbody td " + opts.checkAllTarget).length
							=== rowContainerEle.find("tbody td " + opts.checkAllTarget + ":checked").length) {
						checkAll.prop("checked", true);
					} else {
						checkAll.removeProp("checked");
					}
				});
        	},
        	checkSingle : function() {
        		var opts = this.options;
    	        var rowContainerEle = this.rowContainerEle;

				rowContainerEle.on("click.grid.checkSingleTarget", "tbody td " + opts.checkSingleTarget, function() {
					rowContainerEle.find("tbody td " + opts.checkSingleTarget).not(this).removeAttr("checked");
				});
        	},
        	setTheadCellInfo : function() {
        		var opts = this.options;
        		var thead;
    			if (opts.height > 0) {
    	        	thead = opts.context.closest(".grid_wrap__").find("> .thead_wrap__ thead");
    	        } else {
    	        	thead = opts.context.find("thead");
    	        }
    			var id;
    			this.tempRowEle.find("> tr td").each(function(i) {
    				id = $(this).attr("id");
    				if(id === undefined) {
    					id = $(this).find("[id]").attr("id");
    				}
    				if(thead.find("> tr th:eq(" + i + ")").data("id") === undefined) {
    					thead.find("> tr th:eq(" + i + ")").data("id", id);
    				}
                });
    			return thead;
        	},
			cellCnt : function(ele) {
		        return Math.max.apply(null, $.map(ele.find("tr"), function(el) {
		            var cellCnt = 0;
		            $(el).find("td, th").each(function() {
		                cellCnt += N.string.trimToZero($(this).attr("colspan")) == "0" ? 1 : Number(N.string.trimToZero($(this).attr("colspan")));
		            });
		            return cellCnt;
		        }));
		    }
		});

		$.extend(Grid.prototype, {
			data : function(rowStatus) { // key name : argument2, argument3... argumentN
				if(rowStatus === undefined) {
					return this.options.data.get();
				} else if(rowStatus === false) {
					return this.options.data;
				} else if(rowStatus === "modified") {
					return this.options.data.datafilter(function(data) {
						return data.rowStatus !== undefined;
					}).get();
				} else if(rowStatus === "selected") {
					if(this.options.select || this.options.multiselect) {
						// TODO
					} else {
						N.error("[N.grid.data]select or multiselect option is must be true(boolean)");
					}
				} else if(rowStatus === "checked") {
					var opts = this.options;
					var retData = [];

					// clone arguments
					var args = Array.prototype.slice.call(arguments, 0);

					this.rowContainerEle.find("tbody td " + N.string.trimToEmpty(this.options.checkAllTarget) + N.string.trimToEmpty(this.options.checkSingleTarget) + ":checked").each(function() {
						if(arguments.length > 1) {
							args[0] = opts.data[N(this).closest("tbody").index() - opts.misc.withoutTbodyLength];
							retData.push(N.json.mapFromKeys.apply(N.json, args));
						} else {
							retData.push(opts.data[N(this).closest("tbody").index()  - opts.misc.withoutTbodyLength]);
						}
					});
					return retData;
				} else {
					if(arguments.length > 1) {
						var args = Array.prototype.slice.call(arguments, 0);

						return this.options.data.datafilter(function(data) {
							return data.rowStatus === rowStatus;
						}).map(function() {
							args[0] = this;
							return N.json.mapFromKeys.apply(N.json, args);
						}).get();
					} else {
						return this.options.data.datafilter(function(data) {
							return data.rowStatus === rowStatus;
						}).get();
					}
				}
			},
			context : function(sel) {
				return sel !== undefined ? this.options.context.find(sel) : this.options.context;
			},
			select : function(indexArr) {
				var opts = this.options;
				if(indexArr === undefined) {
					// TODO
				} else {
					if(N.type(indexArr) === "number") {
						// TODO
					} else if(N.type(indexArr) === "array") {
						// TODO
					}

					return this;
				}
			},
			check : function(indexArr) {
				var opts = this.options;
				if(indexArr === undefined) {
					var rtnArr = this.rowContainerEle.find("tbody td " + N.string.trimToEmpty(this.options.checkAllTarget) + N.string.trimToEmpty(this.options.checkSingleTarget) + ":checked").map(function() {
						return N(this).closest("tbody").index() - opts.misc.withoutTbodyLength;
					}).get();
					return rtnArr;
				} else {
					if(N.type(indexArr) === "number") {
						// TODO
					} else if(N.type(indexArr) === "array") {
						// TODO
					}

					return this;
				}
			},
			/**
			 * callType arguments is call type about scrollPaging(internal) or data filter(internal) or data append(external)
			 * callType : "append", "grid.bind", "grid.dataFilter", "grid.sort"
			 */
			bind : function(data, callType) {
				var opts = this.options;

				if(!opts.isBinding) {
					// remove all sort status
					if(opts.sortable) {
						this.thead.find(".sortable__").remove();
					}

					if(opts.data && callType === "append") {
						opts.scrollPaging.size = 0;
						// Merge data to binded data;
						opts.scrollPaging.idx = opts.data.length - 1;
						$.merge(opts.data, data);
					} else {
						opts.scrollPaging.size = opts.scrollPaging.defSize;
						// rebind new data
						if(data != null) {
							opts.data = N.type(data) === "array" ? N(data) : data;
						}
					}

					// remove all data filter status
					if(opts.filter || this.thead.find("> tr th[data-filter='true']").length > 0) {
						// [callType === "grid.sort"]To keep your filter list even after sorting delete this codes.
						if(callType !== "grid.dataFilter" && callType !== "grid.sort"
							|| (!(callType !== "grid.dataFilter" && callType !== "grid.sort") && callType === "grid.sort")) {
							this.thead.find("th .data_filter_panel__").remove();

							if(callType !== "grid.dataFilter" && callType !== "grid.sort") {
								this.thead.find(".btn_data_filter__")
								.removeClass("btn_data_filter_empty__ btn_data_filter_part__ btn_data_filter_full__")
								.addClass("btn_data_filter_full__");

								if(opts.data.length > 0) {
									this.thead.find(".btn_data_filter__").removeClass("hidden__").addClass("visible__");
								} else {
									this.thead.find(".btn_data_filter__").removeClass("visible__").addClass("hidden__");
								}
							}
						}
					}

					var tempRowEleClone;

					if(opts.checkAll !== null) {
						this.thead.find(opts.checkAll).prop("checked", false);
					}
					if (opts.data.length > 0 || (callType === "append" && data && data.length > 0)) {
						//clear tbody visual effect
						opts.context.find("tbody").clearQueue().stop();
						if(callType !== "grid.bind") {
							if(callType === "append" && data.length > 0) {
								opts.scrollPaging.idx = opts.data.length - data.length;
							} else {
								opts.scrollPaging.idx = 0;
							}
						}

						if(opts.scrollPaging.idx === 0) {
							//remove tbodys in grid body area
							if(callType === "append" && data.length > 0) {
								opts.context.find("tbody > tr > td.empty__").parent().parent().remove();
							} else {
								opts.context.find("tbody").remove();
							}
						}

						var i = opts.scrollPaging.idx;
						var limit;
						if(opts.height === 0 || opts.scrollPaging.size === 0 || (callType === "append" && data.length > 0 && data.length <= opts.scrollPaging.size)) {
							limit = opts.data.length;
						} else {
							limit = Math.min(opts.scrollPaging.limit, opts.data.length);
						}

						var self = this;
						var delay = opts.createRowDelay;
						var lastIdx;

						List.render.call(this, i, limit, delay, lastIdx, callType);
						if(opts.appendScroll && i > 0 && callType === "append") {
							opts.context.parent(".tbody_wrap__").stop().animate({
								"scrollTop" : opts.context.parent(".tbody_wrap__").prop("scrollHeight")
							}, 300, 'swing');
						}
					} else {
						//remove tbodys in grid body area
						opts.context.find("tbody").remove();
						opts.context.append('<tbody><tr><td class="empty__" colspan="' + this.cellCnt + '">' +
								N.message.get(opts.message, "empty") + '</td></tr></tbody>');
						opts.context.append(tempRowEleClone);
					}

				} else {
					var self = this;
					var args = arguments;
					opts.context.queue("bind", function() {
						self.bind.apply(self, args);
					});
				}
				return this;
			},
			add : function(data, row) {
				var opts = this.options;
				if (opts.context.find("td.empty__").length > 0) {
					opts.context.find("tbody").remove();
				}
				var tempRowEleClone = this.tempRowEle.clone(true, true);

				if(N.isNumeric(data)) {
	        		row = data;
	        	}

				if(row > opts.data.length || row < 0) {
					row = undefined;
				}

				if(row === undefined) {
					if(opts.addTop) {
						opts.context.find("thead").after(tempRowEleClone);
					} else {
						opts.context.append(tempRowEleClone);
					}
				} else {
					var selRowEle = opts.context.find("tbody:eq(" + row + ")");
					var scrollTop;

					if(row === 0) {
						opts.context.find("thead").after(tempRowEleClone);
					} else if(row === opts.context.find("tbody").length) {
						selRowEle = opts.context.find("tbody:eq(" + (row - 1) + ")");
					} else {
						opts.context.find("tbody:eq(" + row + ")").before(tempRowEleClone);
					}

					scrollTop = (row * selRowEle.outerHeight()) - (opts.height / 2) + (selRowEle.outerHeight() / 2);
					if(scrollTop < 0) {
						scrollTop = 0;
					}
					opts.context.parent(".tbody_wrap__").stop().animate({ "scrollTop" : scrollTop }, 300, 'swing', function() {
						if(opts.addSelect) {
							$(this).find("tbody:eq(" + row + ")").trigger("click.grid.tbody");
						}
					});
				}

				// for new row data bind, use N.form
				var form = opts.data.form({
					context : tempRowEleClone,
					html: opts.html,
					validate : opts.validate,
					extObj : this,
					extRow : row === undefined ? (opts.addTop ? 0 : opts.data.length) : row,
					addTop : opts.addTop,
					revert : opts.revert
				}).add(data, row);

				if(opts.rowHandler !== null) {
					opts.rowHandler.call(tempRowEleClone, form.options.extRow, tempRowEleClone, form.data(true)[0]);
				}

				// unselect rows
				opts.context.find("> tbody").removeClass("grid_selected__");

				// focus to first input element

				if(row === undefined) {
					opts.context.parent(".tbody_wrap__").stop().animate({
						"scrollTop" : (opts.addTop ? 0 : opts.context.parent(".tbody_wrap__").prop("scrollHeight"))
					}, 300, 'swing', function() {
						if(opts.addSelect) {
							$(this).find("> table > tbody:" + (opts.addTop ? "first" : "last")).trigger("click.grid.tbody");
						}
					});
				}

				return this;
			},
			remove : function(row) {
				var opts = this.options;
				if(row === undefined || row > opts.data.length - 1) {
		        	N.error("[N.grid.remove]Row index out of range");
		        }

				if (opts.data[row].rowStatus === "insert") {
		            opts.data.splice(row, 1);
		            opts.context.find("tbody:eq(" + row + ")").remove();
		        } else {
		        	opts.data[row].rowStatus = "delete";
		        	opts.context.find("tbody:eq(" + row + ")").addClass("row_data_deleted__");
		        }

				N.ds.instance(this).notify();
				return this;
			},
			revert : function(row) {
				var opts = this.options;
				if(!opts.revert) {
					N.error("[N.form.revert]Can not revert. N.form's revert option value is false");
				}

				if(row !== undefined) {
					opts.context.find("tbody:eq(" + String(row) + ")").instance("form").revert();
				} else {
					opts.context.find("tbody").instance("form", function(i) {
						if(this.options !== undefined && (this.options.data[0].rowStatus === "update" || this.options.data[0].rowStatus === "insert")) {
							this.revert();
						}
					});
				}
				return this;
			},
			validate : function(row) {
				var opts = this.options;
				var valiRslt = true;
				if(row !== undefined) {
					valiRslt = opts.context.find("tbody:eq(" + String(row) + ")").instance("form").validate();
				} else {
					// Select the rows that rows data was not changed but that has failed validation input elements
					if(this.options.context.find(".validate_false__").length > 0) {
						this.options.context.find(".validate_false__").focusout();
						valiRslt = false;
					}

					var rowStatus;
					opts.context.find("tbody").instance("form", function(i) {
						if(this.options !== undefined && this.options.data.length > 0) {
							rowStatus = this.options.data[0].rowStatus;
							// Select the rows that data was changed
							if(rowStatus === "update" || rowStatus === "insert") {
								if(!this.validate()) {
									valiRslt = false;
								}
							}
						}
					});
				}

				return valiRslt;
			},
			val : function(row, key, val) {
				if(val === undefined) {
					return this.options.data[row][key];
				}
				this.options.context.find("tbody:eq(" + String(row) + ")").instance("form").val(key, val);
				return this;
			},
			update : function(row, key) {
				if(row !== undefined) {
					if(key !== undefined) {
						this.options.context.find("tbody:eq(" + String(row) + ")").instance("form").update(0, key);
					} else if(this.options.data[row]._isRevert !== true && this.options.data[row].rowStatus === "insert") {
						this.add(this.options.data);
					} else {
						this.options.context.find("tbody:eq(" + String(row) + ")").instance("form").update(0);
					}
				} else {
					this.bind(undefined, "grid.update");
				}
				return this;
			}
		});

		// Pagination
		var Pagination = N.pagination = function(data, opts) {
			this.options = {
				data : N.type(data) === "array" ? N(data) : data,
				context : null,
		        totalCount : 0,
		        countPerPage : 10,
		        countPerPageSet : 10,
		        pageNo : 1,
		        onChange : null,
		        blockOnChangeWhenBind : false,
		        currPageNavInfo : null
			};

			try {
				this.options = $.extend({}, this.options, N.context.attr("ui").pagination);
			} catch (e) {
				N.error("[N.pagination]" + e, e);
			}

			if(this.options.data.length > 0) {
				this.options.totalCount = this.options.data.length;
			}

			if (N.isPlainObject(opts)) {
				//convert data to wrapped set
				opts.data = N.type(opts.data) === "array" ? N(opts.data) : opts.data;

				$.extend(this.options, opts);

				if(N.type(this.options.context) === "string") {
					this.options.context = N(this.options.context);
				}
			} else {
				this.options.context = N(opts);
			}

			// Initialize paging panel
			this.linkEles = Pagination.wrapEle.call(this);

			// set style class name to context element
			this.options.context.addClass("pagination__");

			// set this instance to context element
			this.options.context.instance("pagination", this);

			return this;
		};

		$.extend(Pagination, {
			wrapEle : function() {
				var opts = this.options;

				// pagination link element set
				var linkEles = {};

				var lefter = opts.context.find("ul:eq(0)").addClass("pagination_lefter__");

				linkEles.body = opts.context.find("ul:eq(1)").addClass("pagination_body__");
				linkEles.page = linkEles.body.find("li").addClass("pagination_page__");

				var righter = opts.context.find("ul:eq(2)").addClass("pagination_righter__");

				if(lefter.find("li").length === 2) {
					linkEles.first = lefter.find("li:eq(0)").addClass("pagination_first__ pagination_disable__");
					linkEles.prev = lefter.find("li:eq(1)").addClass("pagination_prev__ pagination_disable__");
				} else if(lefter.length === 1) {
					linkEles.prev = lefter.find("li:eq(0)").addClass("pagination_prev__ pagination_disable__");
				}
				if(righter.find("li").length === 2) {
					linkEles.next = righter.find("li:eq(0)").addClass("pagination_next__ pagination_disable__");
					linkEles.last = righter.find("li:eq(1)").addClass("pagination_last__ pagination_disable__");
				} else if(righter.length === 1) {
					linkEles.next = righter.find("li:eq(0)").addClass("pagination_next__ pagination_disable__");
				}

				return linkEles;
			},
			changePageSet : function(linkEles, opts, isRemake) {
				var pageCount = Math.ceil(opts.totalCount / opts.countPerPage);
                var pageSetCount = Math.ceil(pageCount / opts.countPerPageSet);
                var currSelPageSet = Math.ceil(opts.pageNo / opts.countPerPageSet);
                if (currSelPageSet > pageSetCount) { currSelPageSet = pageSetCount; };

                var startPage = (currSelPageSet - 1) * opts.countPerPageSet + 1;
                var endPage = startPage + opts.countPerPageSet - 1;

                if (startPage < 1) {
                	startPage = 1;
                }
                if (endPage > pageCount) {
                	endPage = pageCount;
                }
                if (endPage < 1) {
                	endPage = 1;
                }

                if(isRemake === undefined || isRemake === false) {
                	var pageClone;
                    linkEles.body.empty();
                    for(var i = startPage; i <= endPage; i++) {
                    	pageClone = linkEles.page.clone(true, true);
                    	pageClone.attr("data-pageno", String(i));
                    	pageClone.find("a > span").text(String(i));
                    	linkEles.body.append(pageClone);
                    }
                }

                if(currSelPageSet > 0 && currSelPageSet > 1 && startPage >= currSelPageSet) {
                	$(linkEles.prev).removeClass("pagination_disable__");
                } else {
                	$(linkEles.prev).addClass("pagination_disable__");
                }
                if(linkEles.first !== undefined) {
                	if(1 !== opts.pageNo) {
                		$(linkEles.first).removeClass("pagination_disable__");
                	} else {
                		$(linkEles.first).addClass("pagination_disable__");
                	}
                }

                if(pageSetCount > currSelPageSet) {
                	$(linkEles.next).removeClass("pagination_disable__");
                } else {
                	$(linkEles.next).addClass("pagination_disable__");
                }
                if(linkEles.last !== undefined) {
                	if(pageCount > 0 && opts.pageNo !== pageCount) {
                		$(linkEles.last).removeClass("pagination_disable__");
                	} else {
                		$(linkEles.last).addClass("pagination_disable__");
                	}
                }

                var startRowIndex = (opts.pageNo - 1) * opts.countPerPage;
                var endRowIndex = (startRowIndex + opts.countPerPage) - 1;
                if(endRowIndex > opts.totalCount - 1) {
                	endRowIndex = opts.totalCount - 1;
                }

                return currPageNavInfo = {
                	"pageNo" : opts.pageNo,
                	"countPerPage" : opts.countPerPage,
                	"countPerPageSet" : opts.countPerPageSet,
                	"totalCount" : opts.totalCount,
                	"pageCount" : pageCount,
                	"pageSetCount" : pageSetCount,
                	"currSelPageSet" : currSelPageSet,
                	"startPage" : startPage,
                	"endPage" : endPage,
                	"startRowIndex" : startRowIndex,
                	"startRowNum" : startRowIndex + 1,
                	"endRowIndex" : endRowIndex,
                	"endRowNum" : endRowIndex + 1
                };
			}
		});

		$.extend(Pagination.prototype, {
			data : function(selFlag) {
				if(selFlag === undefined) {
					return this.options.data.get();
				} else if(selFlag === false) {
					return this.options.data;
				}
			},
			context : function(sel) {
				return sel !== undefined ? this.options.context.find(sel) : this.options.context;
			},
			bind : function(data, totalCount) {
				var opts = this.options;

				if(arguments.length > 0 && N.type(arguments[0]) === "number") {
					// reset totalCount
					opts.totalCount = arguments[0];
				} else if(arguments.length > 0 && N.type(arguments[0]) === "array") {
					// to rebind new data
					opts.data = N.type(data) === "array" ? N(data) : data;

					// reset totalCount
					if(totalCount !== undefined) {
						opts.totalCount = totalCount;
					} else {
						if(data != null) {
							opts.totalCount = data.length;
						}
					}
				}

                var linkEles = this.linkEles;
                var currPageNavInfo = Pagination.changePageSet(linkEles, opts);

                // first button event
                if(linkEles.first !== undefined) {
                	linkEles.first.unbind("click.pagination");
                	linkEles.first.bind("click.pagination", function(e) {
                		e.preventDefault();
                		if(1 !== opts.pageNo) {
                			opts.pageNo = 1;
                			currPageNavInfo = Pagination.changePageSet(linkEles, opts);
                			linkEles.body.find("li a:first").trigger("click.pagination");
                		}
                	});
                }

                // previous button event
                linkEles.prev.unbind("click.pagination");
                linkEles.prev.bind("click.pagination", function(e) {
                    e.preventDefault();
                    if(currPageNavInfo.currSelPageSet > 1 && currPageNavInfo.startPage >= currPageNavInfo.currSelPageSet) {
                    	opts.pageNo = currPageNavInfo.startPage - opts.countPerPageSet;
                    	currPageNavInfo = Pagination.changePageSet(linkEles, opts);
                    	linkEles.body.find("li a:first").trigger("click.pagination");
                    }
                });

                // page number button event
                linkEles.body.off("click.pagination");
                linkEles.body.on("click.pagination", "li > a", function(e, isFirst) {
                	e.preventDefault();

                	opts.pageNo = Number($(this).parent().data("pageno"));
                	currPageNavInfo = Pagination.changePageSet(linkEles, opts, true);

                    if(opts.onChange !== null) {
                    	var selData = [];
                    	if(opts.data.length > 0 && opts.data.length <= opts.totalCount) {
                    		for(var i = currPageNavInfo.startRowIndex; i <= currPageNavInfo.endRowIndex; i++) {
                        		if(opts.data[i] !== undefined) {
                        			selData.push(opts.data[i]);
                        		}
                        	}
                    	}
                    	if(opts.blockOnChangeWhenBind === false || (opts.blockOnChangeWhenBind === true && isFirst !== true)) {
                    		opts.onChange.call(this, opts.pageNo, this, selData, currPageNavInfo);
                    	}
                    }

                    linkEles.body.find("li.pagination_active__").removeClass("pagination_active__");
                    $(this).parent().addClass("pagination_active__");
                }).find("li a:eq(" + String(opts.pageNo - currPageNavInfo.startPage) +  ")").trigger("click.pagination", [true]);

                // next button event
                linkEles.next.unbind("click.pagination");
                linkEles.next.bind("click.pagination", function(e) {
                    e.preventDefault();
                    if(currPageNavInfo.pageSetCount > currPageNavInfo.currSelPageSet) {
                    	opts.pageNo = currPageNavInfo.startPage + opts.countPerPageSet;
                    	currPageNavInfo = Pagination.changePageSet(linkEles, opts);
                    	linkEles.body.find("li a:first").trigger("click.pagination");
                    }
                });

                // last button event
                if(linkEles.last !== undefined) {
                	linkEles.last.unbind("click.pagination");
                	linkEles.last.bind("click.pagination", function(e) {
                		e.preventDefault();
                		if(opts.pageNo !== currPageNavInfo.pageCount) {
                			opts.pageNo = currPageNavInfo.pageCount;
                			currPageNavInfo = Pagination.changePageSet(linkEles, opts);
                			linkEles.body.find("li a:last").trigger("click.pagination");
                		}
                	});
                }

				return this;
			},
			totalCount : function(totalCount) {
				var opts = this.options;
				if(totalCount != undefined) {
					opts.totalCount = totalCount;
					return this;
				} else {
					return opts.totalCount;
				}
			},
			pageNo : function(pageNo) {
				var opts = this.options;
				if(pageNo != undefined) {
					opts.pageNo = pageNo;
					return this;
				} else {
					return opts.pageNo;
				}
			},
			countPerPage : function(countPerPage) {
				if(countPerPage !== undefined) {
					var opts = this.options;
					opts.countPerPage = countPerPage;
					opts.pageNo = 1;
				} else {
					return this.options.countPerPage;
				}
				return this;
			},
			countPerPageSet : function(countPerPageSet) {
				if(countPerPageSet !== undefined) {
					var opts = this.options;
					opts.countPerPageSet = countPerPageSet;
					opts.pageNo = 1;
				} else {
					return this.options.countPerPageSet;
				}
				return this;
			},
			currPageNavInfo : function() {
				return this.options.currPageNavInfo;
			}
		});

		// Tree
		var Tree = N.tree = function(data, opts) {
			this.options = {
				data : N.type(data) === "array" ? N(data) : data,
				context : null,
				key : null,
				val : null,
				level : null, // optional
				parent : null,
				folderSelectable : false,
				checkbox : false,
				onSelect : null,
				onCheck : null
			};

			try {
				this.options = $.extend({}, this.options, N.context.attr("ui").tree);
			} catch (e) {
				N.error("[N.tree]" + e, e);
			}

			if (N.isPlainObject(opts)) {
				//convert data to wrapped set
				opts.data = N.type(opts.data) === "array" ? N(opts.data) : opts.data;

				$.extend(this.options, opts);

				if(N.type(this.options.context) === "string") {
					this.options.context = N(this.options.context);
				}
			} else {
				this.options.context = N(opts);
			}

			// set style class name to context element
			this.options.context.addClass("tree__");

			// set this instance to context element
			this.options.context.instance("tree", this);

			// register this to N.ds for realtime data synchronization
			N.ds.instance(this, true);

			return this;
		};

		$.extend(Tree.prototype, {
			data : function(selFlag) {
				if(selFlag === undefined) {
					return this.options.data.get();
				} else if(selFlag === false) {
					return this.options.data;
				} else if(selFlag === "checked") {
					var data = this.options.data;
					if(arguments.length > 1) {
						// clone arguments
						var args = Array.prototype.slice.call(arguments, 0);
						return this.options.context.find(":checked").map(function() {
							args[0] = data[N(this).closest("li").data("index")];
							return N.json.mapFromKeys.apply(N.json, args);
						}).get();
					} else {
						return this.options.context.find(":checked").map(function() {
							return data[N(this).closest("li").data("index")];
						}).get();
					}
				} else if(selFlag === "checkedInLastNode") {
					var data = this.options.data;

					if(arguments.length > 1) {
						var args = Array.prototype.slice.call(arguments, 0);
						return this.options.context.find(".tree_last_node__ :checked").map(function() {
							args[0] = data[N(this).closest("li").data("index")];
							return N.json.mapFromKeys.apply(N.json, args);
						}).get();
					} else {
						return this.options.context.find(".tree_last_node__ :checked").map(function() {
							return data[N(this).closest("li").data("index")];
						}).get();
					}
				}
			},
			context : function(sel) {
				return sel !== undefined ? this.options.context.find(sel) : this.options.context;
			},
			bind : function(data) {
				var opts = this.options;

				//to rebind new data
				if(data != null) {
					opts.data = N.type(data) === "array" ? N(data) : data;
				}

				var rootNode = N('<ul class="tree_level1_folder__"></ul>').appendTo(opts.context.empty());
				var isAleadyRoot = false;
				N(opts.data).each(function(i, rowData) {
					if(rowData[opts.level] === 1 || !isAleadyRoot) {
						N('<li data-index="' + i + '" class="tree_level1_node__ tree_close__"><span class="tree_icon__"></span>' + (opts.checkbox ? '<span class="tree_check__"><input type="checkbox" /></span>' : '') + '<a class="tree_key__" href="#"><span>' + rowData[opts.key] + '</span></a><ul id="' + rowData[opts.val] + '" class="tree_level' + (opts.level !== null ? String(Number(rowData[opts.level]) + 1) : '') + '_folder__"></ul></li>').appendTo(rootNode);
						isAleadyRoot = true;
					} else {
						N('<li data-index="' + i + '" class="tree_level' + N.string.trim(rowData[opts.level]) + '_node__ tree_close__"><span class="tree_icon__"></span>' + (opts.checkbox ? '<span class="tree_check__"><input type="checkbox" /></span>' : '') + '<a class="tree_key__" href="#"><span>' + rowData[opts.key] + '</span></a><ul id="' + rowData[opts.val] + '" class="tree_level' + (opts.level !== null ? String(Number(rowData[opts.level]) + 1) : '') + '_folder__"></ul></li>').appendTo(rootNode.find("#" + rowData[opts.parent]));
					}
				});

				// add class to elements with no have chiidren
				var emptyUls = rootNode.find("ul:empty");
				emptyUls.parent().addClass("tree_last_node__");
				emptyUls.remove();

				// checkbox click event bind
				if(opts.checkbox) {
					rootNode.find(".tree_check__ > :checkbox").bind("click.tree", function(e) {
						var checkFlag;
						var siblingNodesEle = N(this).closest("li").parent().children("li");
						var parentNodesEle = N(this).parents("li");
						var parentNodeEle = N(this).closest("ul").parent();
						N(this).removeClass("tree_auto_parents_select__");
						if(N(this).is(":checked")) {
							N(this).parent().siblings("ul").find(":not(:checked)").prop("checked", true);
							checkFlag = true;
						} else {
							N(this).parent().siblings("ul").find(":checked").prop("checked", false);
							checkFlag = false;
						}

						var checkboxLength = siblingNodesEle.find(":checkbox").length;
						var checkedLength = siblingNodesEle.find(":checked").length;
						var parentNodeCheckboxEle = parentNodeEle.find("> span.tree_check__ > :checkbox");
						var parentNodesCheckedEle = parentNodesEle.not(":first").find("> span.tree_check__ > :checkbox");
						if(checkFlag) {
							if(checkedLength > 0) {
								if(checkedLength < checkboxLength) {
									parentNodesEle.find("> span.tree_check__ > :not(:checked)").prop("checked", true).addClass("tree_auto_parents_select__");
								} else if(checkedLength === checkboxLength) {
									parentNodeCheckboxEle.prop("checked", true).removeClass("tree_auto_parents_select__");
									// apply click effect to parents nodes
									// FIXME this code is temporary code
									parentNodeCheckboxEle.trigger("click.tree").trigger("click.tree");
								}
							}
						} else {
							if(checkedLength > 0 && checkedLength < checkboxLength) {
								parentNodesCheckedEle.addClass("tree_auto_parents_select__");
							} else if(checkedLength === 0) {
								parentNodesCheckedEle.prop("checked", false).removeClass("tree_auto_parents_select__");
								// apply click effect to parents nodes
								// FIXME this code is temporary code
								parentNodeCheckboxEle.trigger("click.tree").trigger("click.tree");
							}
						}

						// run onCheck event callback
						// FIXME "e.clientX > 0 && e.clientY > 0" is temporary code
						if(opts.onCheck !== null && e.clientX > 0 && e.clientY > 0) {
							var closestLi = N(this).closest("li");
							var checkedEle = N(this).closest("ul").find(".tree_last_node__ :checked");
							opts.onCheck.call(closestLi
									, closestLi.data("index")
									, closestLi
									, opts.data[closestLi.data("index")]
							, checkedEle.map(function() {
								return N(this).closest("li").data("index");
							}).get()
							, checkedEle
							, checkedEle.map(function() {
								return opts.data[N(this).closest("li").data("index")];
							}).get()
							, checkFlag);
						}
					});
				}

				// node name click event bind
				rootNode.find("li" + (!opts.folderSelectable ? ".tree_last_node__" : "") + " .tree_key__").bind("click.tree", function(e) {
					e.preventDefault();
					var parentLi = N(this).parent("li");
					if(opts.onSelect !== null) {
						opts.onSelect.call(parentLi, parentLi.data("index"), parentLi, opts.data[parentLi.data("index")]);
					}
					rootNode.find("li > a.tree_key__.tree_active__").removeClass("tree_active__");
					N(this).addClass("tree_active__");
				});

				// icon click event bind
				rootNode.find(".tree_icon__" + (!opts.folderSelectable ? ", li:not('.tree_last_node__') .tree_key__" : "")).bind("click.tree", function(e) {
					e.preventDefault();
					var parentLi = N(this).parent("li");
					if(parentLi.find("> ul > li").length > 0) {
						if(parentLi.hasClass("tree_open__")) {
							parentLi.removeClass("tree_open__").addClass("tree_close__");
						} else {
							parentLi.removeClass("tree_close__").addClass("tree_open__");
						}
					}
				});

				if(opts.folderSelectable) {
					rootNode.find("li:not('.tree_last_node__') .tree_key__").bind("click.tree", function(e) {
						e.preventDefault();
					});
				}

				this.closeAll(true);

				return this;
			},
			val : function(row, key, val) {
				// TODO
				// notify
				return this;
			},
			openAll : function() {
				N("li.tree_close__:not(.tree_last_node__)").removeClass("tree_close__").addClass("tree_open__");
				return this;
			},
			closeAll : function(isFirstNodeOpen) {
				N("li.tree_open__:not(.tree_last_node__)").removeClass("tree_open__").addClass("tree_close__");
				if(isFirstNodeOpen) {
					this.options.context.find("li.tree_close__:first").removeClass("tree_close__").addClass("tree_open__");
				}
				return this;
			},
			update : function(row, key) {
				// TODO
				return this;
			}
		});

	})(N);

})(window, jQuery);