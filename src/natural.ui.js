/*!
 * Natural-UI v0.30.68
 *
 * Released under the LGPL v2.1 license
 * Date: 2014-09-26T11:11Z
 *  
 * Copyright 2014 KIM HWANG MAN(bbalganjjm@gmail.com)
 */
(function(window, $) {
	N.version["Natural-UI"] = "v0.30.68";

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

		var UI = N.ui = {
			iteration : {
				render : function(i, limit, delay, lastIdx, callType) {
					var opts = this.options;
					var self = this;

					// clone li for create new row
					var tempRowEleClone = self.tempRowEle.clone(true, true);
					opts.context.append(tempRowEleClone);

					// for row data bind, use N.form
					var form = N(opts.data[i]).form({
						context : tempRowEleClone,
						html: opts.html,
						validate : opts.validate,
						extObj : self,
						extRow : i,
						revert : opts.revert,
						unbind : false
					});

					if(opts.rowHandlerBeforeBind !== null) {
						opts.rowHandlerBeforeBind.call(self, i, tempRowEleClone, opts.data[i]);
					}

					form.bind();

					if(opts.rowHandler !== null) {
						opts.rowHandler.call(self, i, tempRowEleClone, opts.data[i]);
					}

					if(opts.fixedcol > 0) {
						tempRowEleClone.find(".grid_body_fixed__").outerHeight(tempRowEleClone.height() + opts.misc.fixedcolBodyBindHeight);
					}

					if(self.rowSpanIds !== undefined) {
						self.rowSpanIds.each(function() {
							Grid.rowSpan.call(self, i, tempRowEleClone, opts.context.find("tbody:eq(" + (i-1) + ")"), opts.data[i], opts.data[i-1], String(this));
						});
					}

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
							if(delay > 0) {
								setTimeout(function() {
									UI.iteration.render.call(self, i, limit, delay, lastIdx, callType);
								}, delay);
							} else {
								UI.iteration.render.call(self, i, limit, delay, lastIdx, callType);
							}
						}
					} else if(i === lastIdx + 1) {
						if(opts.onBind !== null) {
							opts.onBind.call(self, opts.context, opts.data);
						}
						opts.scrollPaging.limit = opts.scrollPaging.size === 0 ? opts.data.length : opts.scrollPaging.size;

						opts.isBinding = false;
						opts.context.dequeue("bind");
					}
				},
				select : function(compNm) {
					var opts = this.options;
					var self = this;

					var lineTag = compNm === "grid" ? "tbody" : "li";

					// set style class name to context element for select, multiselect options
					opts.context.addClass(compNm + "_select__");

					// bind tbody click event for select, multiselect options
					this.tempRowEle.bind("click." + compNm, function(e) {
						var thisEle = $(this);
						var retFlag;
						var isSelected;

						if(!$(e.target).is(opts.checkAllTarget) && !$(e.target).is(opts.checkSingleTarget)) {
							// save the selected row index
							if(thisEle.hasClass(compNm + "_selected__")) {
								opts.row = -1;
								isSelected = false;
							} else {
								opts.row = opts.context.find(">" + lineTag).index(thisEle);
								isSelected = true;
							}

							// apply unselect option
							if(!opts.multiselect && !opts.unselect) {
								opts.row = opts.context.find(">" + lineTag).index(thisEle);
								isSelected = true;
							}

							if(opts.onSelect !== null) {
								retFlag = opts.onSelect.call(self, opts.row, thisEle, opts.data, opts.beforeRow, e);
							}

							if(retFlag === undefined || retFlag === true) {
								if(isSelected) {
									if(!opts.multiselect) {
										opts.context.find("> " + lineTag + ":eq(" + opts.beforeRow + ")").removeClass(compNm + "_selected__");
									}
									thisEle.addClass(compNm + "_selected__");
									opts.beforeRow = opts.row;
								} else {
									thisEle.removeClass(compNm + "_selected__");
								}
							}
						}
					});
				},
				checkAll : function(compNm) {
					var opts = this.options;
					var contextEle = this.contextEle;

					var checkAll = compNm === "grid" ? this.thead.find(opts.checkAll) : $(opts.checkAll);
					var cellTag = compNm === "grid" ? "tbody > tr > td" : "li";
					checkAll.bind("click." + compNm + ".checkAll", function() {
						if(!$(this).prop("checked")) {
							contextEle.find(cellTag + " " + opts.checkAllTarget + ":checked").removeProp("checked");
						} else {
							contextEle.find(cellTag + " " + opts.checkAllTarget + ":not(':checked')").prop("checked", true);
						}
					});
					contextEle.on("click." + compNm + ".checkAllTarget", cellTag + " " + opts.checkAllTarget, function() {
						if(contextEle.find(cellTag + " " + opts.checkAllTarget).length
								=== contextEle.find(cellTag + " " + opts.checkAllTarget + ":checked").length) {
							checkAll.prop("checked", true);
						} else {
							checkAll.removeProp("checked");
						}
					});
				},
				checkSingle : function(compNm) {
	        		var opts = this.options;
	        		var contextEle = this.contextEle;

	    	        var cellTag = compNm === "grid" ? "tbody > tr > td" : "li";
					contextEle.on("click.grid.checkSingleTarget", cellTag + " " + opts.checkSingleTarget, function() {
						contextEle.find(cellTag + " " + opts.checkSingleTarget).not(this).removeAttr("checked");
					});
	        	},
	        	move : function(fromRow, toRow, compNm) {
					if(fromRow !== toRow) {
						var opts = this.options;

						var insertPos;
						if(toRow > opts.data.length - 1) {
							insertPos = "after";
							toRow = opts.data.length - 1;
							opts.data.push(opts.data.splice(fromRow, 1)[0]);
						} else {
							insertPos = "before";
							opts.data.splice(fromRow < toRow ? toRow - 1 : toRow, 0, opts.data.splice(fromRow, 1)[0]);
						}

						var rowTag = compNm === "grid" ? "tbody" : "li";
						if(opts.context.find(rowTag + ":eq(" + toRow + ")").length > 0) {
							opts.context.find(rowTag + ":eq(" + toRow + ")")[insertPos](opts.context.find(rowTag + ":eq(" + fromRow + ")"));
						} else {
							opts.currMoveToRow = toRow;
							opts.context.find(rowTag + ":eq(" + fromRow + ")").remove();
						}
					}

					return this;
				},
				copy : function(fromRow, toRow, compNm) {
					if(fromRow !== toRow) {
						var opts = this.options;

						var insertPos;
						if(toRow > opts.data.length - 1) {
							insertPos = "after";
							toRow = opts.data.length - 1;
							opts.data.push(opts.data[fromRow]);
						} else {
							insertPos = "before";
							opts.data.splice(toRow, 0, opts.data[fromRow]);
						}
						
						var rowTag = compNm === "grid" ? "tbody" : "li";
						opts.context.find(rowTag + ":eq(" + toRow + ")")[insertPos](opts.context.find(rowTag + ":eq(" + fromRow + ")").clone(true, true));
					}

					return this;
				}
			},
			draggable : {
				events : function(eventNameSpace, startHandler, moveHandler, endHandler) {
					var selfEle = this;

					this.bind("mousedown" + eventNameSpace + " touchstart" + eventNameSpace, function(e) {
						var se = e.originalEvent.touches ? e.originalEvent.touches[0] : e;

						if(e.originalEvent.touches || (e.which || e.button) === 1) {
							$(document).bind("dragstart" + eventNameSpace + " selectstart" + eventNameSpace, function() {
								return false;
							});

							var isContinue;
							if(startHandler !== undefined) {
								isContinue = startHandler.call(this, e, selfEle, se.pageX, se.pageY)
							}
							if(isContinue !== false) {
								$(document).bind("mousemove" + eventNameSpace + " touchmove" + eventNameSpace, function(e) {
									var me = e.originalEvent.touches ? e.originalEvent.touches[0] : e;
									if(moveHandler !== undefined) {
										moveHandler.call(this, e, selfEle, me.pageX, me.pageY);
									}

									if(!e.originalEvent.touches) {
										e.preventDefault();
									}
									e.stopImmediatePropagation();
									e.stopPropagation();
									if(!e.originalEvent.touches) {
										return false;
									}
								});

			            		$(document).bind("mouseup" + eventNameSpace + " touchend" + eventNameSpace, function(e) {
			            			if(endHandler !== undefined) {
			            				endHandler.call(this, e, selfEle)
			            			};
			            			$(document).unbind("dragstart" + eventNameSpace + " selectstart" + eventNameSpace + " mousemove" + eventNameSpace + " touchmove" + eventNameSpace + " mouseup" + eventNameSpace + " touchend" + eventNameSpace);

			            			if(!e.originalEvent.touches) {
										e.preventDefault();
									}
			            			e.stopImmediatePropagation();
			            			e.stopPropagation();
			            			if(!e.originalEvent.touches) {
			            				return false;
			            			}
			            		});
		            		}
		            	}

						if(!e.originalEvent.touches) {
							e.preventDefault();
						}
		            	e.stopImmediatePropagation();
		            	e.stopPropagation();
		            	if(!e.originalEvent.touches) {
            				return false;
            			}
		        	});
				},
				/**
				 * This function is not working in less than IE 9
				 */
				moveX : function(x, min, max) {
					var ele = this;
					if(min !== undefined && x < min) {
						x = min;
						return false;
					}
					if(max !== undefined && x > max) {
						x = max;
						return false;
					}
					
					var propNm = ["-webkit-transform", "-ms-transform", "transform"];
					$(propNm).each(function() {
						ele.css(this, "translateX(" + x + "px)");		
					});
				},
				/**
				 * This function is not working in less than IE 9
				 */
				moveY : function(y, min, max) {
					var ele = this;
					if(min !== undefined && y < min) {
						y = min;
						return false;
					}
					if(max !== undefined && y > max) {
						y = max;
						return false;
					}
					
					var propNm = ["-webkit-transform", "-ms-transform", "transform"];
					$(propNm).each(function() {
						ele.css(this, "translateY(" + y + "px)");						
					});
				}
			},
			scroll : {
				paging : function(contextWrapEle, defSPSize, rowEleLength, rowTagName, bindOpt) {
					var opts = this.options;
	        		var self = this;

					contextWrapEle.scroll(function() {
			        	if(opts.scrollPaging.size > 0 && opts.isBinding === false) {
				        	var thisWrap = $(this);
		                    if (thisWrap.scrollTop() >= opts.context.height() - thisWrap.height()) {
		                    	rowEleLength = opts.context.find(rowTagName).length;
		                    	if(opts.currMoveToRow > -1 && rowEleLength < opts.currMoveToRow) {
		                    		defSPSize -= 1;
		                    	}
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
			                        	self.bind(undefined, bindOpt);
			                        } else if(opts.scrollPaging.idx === opts.data.length) {
			                        	opts.scrollPaging.limit = opts.scrollPaging.size === 0 ? opts.data.length : opts.scrollPaging.size;
			                        }
			                    }
			                }
			        	}
		            });
				}
			}
		};

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
				// 2. If defined the N.context.attr("ui").alert.container value to N.config this.options.container value is defined from N.config's value
				$.extend(true, this.options, N.context.attr("ui").alert);
				
				if(N.isString(this.options.container)) {
					this.options.container = N(this.options.container);
				}
			} catch (e) {
				throw N.error("[N.alert]" + e, e);
			}

			if(N(this.options.container).length === 0) {
				throw N.error("[N.alert]Container element is missing. please specify the correct element selector that will contain the message dialog's element. it can be defined in the \"N.context.attr(\"ui\").alert.container\" property of \"natural.config.js\" file.");
			}
			
			if (obj.is(":input")) {
				this.options.isInput = true;
			}
			if(msg !== undefined && N.isPlainObject(msg)) {
				$.extend(true, this.options, msg);
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
						if(opts.onCancel.call(self, opts.msgContext, opts.msgContents) !== 0) {
							self[opts.closeMode]();
						}
					} else {
						self[opts.closeMode]();
					}
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
			        	N.event.windowScrollLock(opts.msgContents.find(".msg_box__"));
			        }
				}

				//set confirm button style and bind click event
				opts.msgContents.find(".buttonBox__ a.confirm__").button(opts.global.okBtnStyle);
				opts.msgContents.find(".buttonBox__ a.confirm__").bind("click.alert", function(e) {
					e.preventDefault();
					if (opts.onOk !== null) {
						if(opts.onOk.call(self, opts.msgContext, opts.msgContents) !== 0) {
							self[opts.closeMode]();
						}
					} else {
						self[opts.closeMode]();
					}
				});

				// remove modal overlay layer when opts.modal value is false
				if(!opts.modal) {
					opts.msgContext.remove();
				} else {
					if(opts.overlayClose) {
						opts.msgContext.bind("click.alert", function() {
							if (opts.onCancel !== null) {
								if(opts.onCancel.call(self, opts.msgContext, opts.msgContents) !== 0) {
									self[opts.closeMode]();
								}
							} else {
								self[opts.closeMode]();
							}
						});
					}
				}

				// set cancel button style and bind click event
				if(opts.confirm) {
					opts.msgContents.find(".buttonBox__ a.cancel__").button(opts.global.cancelBtnStyle);
					opts.msgContents.find(".buttonBox__ a.cancel__").bind("click.alert", function(e) {
						e.preventDefault();
						if (opts.onCancel !== null) {
							if(opts.onCancel.call(self, opts.msgContext, opts.msgContents) !== 0) {
								self[opts.closeMode]();
							}
						} else {
							self[opts.closeMode]();
						}
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
										if(opts.msgContents.css("position") === "fixed") {
											offset.top -= parseFloat(opts.msgContents.css("margin-top"));
										}
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
					var windowHeight = $(window).height();
					var windowWidth = $(window).width();
					var msgContentsHeight = opts.msgContents.height();
					var msgContentsWidth = opts.msgContents.width();
					
					// reset message context(overlay) position
					var msgContextCss = {
						"height" : opts.isWindow ? (window.innerHeight ? window.innerHeight : windowHeight) : opts.context.outerHeight() + "px",
						"width" : opts.isWindow ? (window.innerWidth ? window.innerWidth : windowWidth) : opts.context.outerWidth() + "px"
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
								msgContentsCss["margin-top"] = String(opts.msgContext.height() / 2 - msgContentsHeight / 2) + "px";
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
								msgContentsCss["margin-top"] = "-" + String(opts.msgContext.height() / 2 + msgContentsHeight / 2 + parseFloat(opts.context.css("margin-bottom"))) + "px";
							}
						}
						if(opts.left !== undefined) {
							msgContentsCss.left = String(opts.left) + "px";
						} else {
							msgContentsCss.left = String(opts.context.position().left + marginLeft + (opts.msgContext.width() / 2 - msgContentsWidth / 2)) + "px";
						}
						
						if(msgContentsHeight > windowHeight) {
							msgContentsCss["margin-top"] = String($(window).scrollTop()) + "px";
							msgContentsCss.position = "absolute";
						}
						if(msgContentsWidth > windowWidth) {
							msgContentsCss["left"] = "0";
							msgContentsCss.position = "absolute";
						}
						
						if(opts.isWindow && windowHeight > msgContentsHeight && windowWidth > msgContentsWidth) {
							msgContentsCss.position = "fixed";
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
							opts.msgContext.removeClass("orgin_left__").addClass("orgin_right__");
							isBeforeShow = true;
						} else {
							opts.msgContext = opts.context.after('<span class="msg__ alert_after_show__" style="display: none;"><ul class="msg_line_box__"></ul></span>').next(".msg__");
							opts.msgContext.removeClass("orgin_right__").addClass("orgin_left__");
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
					if(opts.dynPos && !opts.isWindow) {
						Alert.resetOffSetEle(opts);
						opts.time = setInterval(function() {
							if(opts.context.is(":visible")) {
								Alert.resetOffSetEle(opts);
							}
						}, 500);
					} else {
						opts.resizeHandler =  function() {
							Alert.resetOffSetEle(opts);
						};
						$(window).unbind("resize.alert", opts.resizeHandler).bind("resize.alert", opts.resizeHandler).trigger("resize.alert");
					}

					if(!opts.isWindow) {
						opts.msgContext.closest(".msg_box__").css("position", "relative");
					}

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
							opts.context.parent().css({
								"white-space": ""
							});
							self[opts.closeMode]();
						}, opts.input.displayTimeout);

						opts.msgContext.removeClass("hidden__").addClass("visible__");
					}
				}

				// if press the "ESC" key, alert dialog will be removed
				opts.keyupHandler = function(e) {
					if ((e.keyCode ? e.keyCode : (e.which ? e.which : e.charCode)) == 27) {
						if (opts.onCancel !== null) {
							if(opts.onCancel.call(self, opts.msgContext, opts.msgContents) !== 0) {
								self[opts.closeMode]();
							}
						} else {
							self[opts.closeMode]();
						}
		        	}
				};
		        $(document).unbind("keyup.alert", opts.keyupHandler).bind("keyup.alert", opts.keyupHandler);

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
					opts.msgContents.one(N.event.whichTransitionEvent(opts.msgContents), function(e){
						opts.msgContents.hide();
			        }).trigger("nothing");

				} else {
					opts.msgContents.removeClass("visible__").addClass("hidden__");
					opts.msgContents.one(N.event.whichTransitionEvent(opts.msgContents), function(e){
						clearTimeout(opts.iTime);
						opts.msgContext.remove();
			        }).trigger("nothing");
				}

				$(window).unbind("resize.alert", opts.resizeHandler);
				$(document).unbind("keyup.alert", opts.keyupHandler);

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
					opts.msgContents.one(N.event.whichTransitionEvent(opts.msgContents), function(e){
						opts.msgContents.remove();
						
						if(opts.msgContents.hasClass("popup__")) {
							// Removes garbage instances from obserables of N.ds 
							N.gc.ds();
						}
			        }).trigger("nothing");
				} else {
					opts.msgContext.removeClass("visible__").addClass("hidden__");
					opts.msgContext.one(N.event.whichTransitionEvent(opts.msgContext), function(e){
						clearTimeout(opts.iTime);
						opts.msgContext.remove();
			        }).trigger("nothing");
				}

				$(window).unbind("resize.alert", opts.resizeHandler);
				$(document).unbind("keyup.alert", opts.keyupHandler);
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
				$.extend(this.options, N.context.attr("ui").button);
			} catch (e) {
				throw N.error("[N.button]" + e, e);
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
			context : function(sel) {
				return sel !== undefined ? this.options.context.find(sel) : this.options.context;
			},
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
		            context.tpBind("click.button", N.event.disable);
		        } else {
		            context.prop("disabled", true);
		        }
		        context.addClass("btn_disabled__");
				return this;
			},
			enable : function() {
				var context = this.options.context;
		        if (context.is("a")) {
		            context.unbind("click", N.event.disable);
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
				$.extend(this.options, N.context.attr("ui").datepicker);
			} catch (e) {
				throw N.error("[N.datepicker]" + e, e);
			}

			if(opts !== undefined) {
				$.extend(this.options, opts);
			}

			// set style class name to context element
			this.options.context.addClass("datepicker__");

			if(this.options.monthonly) {
				if(this.options.shareEle && N(".datepicker__.datepicker_month_master__").length > 0) {
					DatePicker.wrapSingleEle.call(this);
				} else {
					DatePicker.wrapEle.call(this);
				}
			} else {
				if(this.options.shareEle && N(".datepicker__.datepicker_date_master__").length > 0) {
					DatePicker.wrapSingleEle.call(this);
				} else {
					DatePicker.wrapEle.call(this);
				}
			}

			// set this instance to context element
			this.options.context.instance("datepicker", this);

			return this;
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
				opts.context.unbind("click.datepicker").bind("click.datepicker", function(e) {
					e.stopPropagation();
				});

				if(opts.monthonly) {
					opts.context.attr("maxlength", "6");
					opts.contents.addClass("datepicker_monthonly__");
					if(opts.shareEle) {
						opts.context.addClass("datepicker_month_master__");
						opts.contents.addClass("datepicker_contents_month_master__");
					}
				} else {
					opts.context.attr("maxlength", "8");
					if(opts.shareEle) {
						opts.context.addClass("datepicker_date_master__");
						opts.contents.addClass("datepicker_contents_date_master__");
					}
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
					yearsPanel.find(".datepicker_year_item__.datepicker_year_selected__").removeClass("datepicker_year_selected__");
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

				var yearPaging = $('<div class="datepicker_year_paging__" align="center"><a href="#" class="datepicker_year_prev__" title="' + N.message.get(opts.message, "prev") + '">◀</a><a href="#" class="datepicker_year_next__" title="' + N.message.get(opts.message, "next") + '">▶</a></div>');
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

				var beforeSelectedDay;
				monthItem.css({
					"line-height": "25px",
					"width": "28px",
					"float": "left"
				}).click(function(e, ke) {
					e.preventDefault();
					monthsPanel.find(".datepicker_month_item__.datepicker_month_selected__").removeClass("datepicker_month_selected__");
					$(this).addClass("datepicker_month_selected__");
					if(opts.monthonly) {
						var selDate = N.date.strToDate(N.string.lpad(yearsPanel.find(".datepicker_year_selected__").text(), 4, "0") + N.string.lpad($(this).text(), 2, "0"), "Ym");
						// set date format of global config
						selDate.format = N.context.attr("data").formatter.date.Ym().replace(/[^Y|^m|^d]/g, "");

						var onSelectContinue;
						if(opts.onSelect !== null) {
							onSelectContinue = opts.onSelect.call(self, opts.context, selDate, opts.monthonly);
						}
						if(onSelectContinue === undefined || onSelectContinue === true) {
							opts.context.val(selDate.obj.formatDate(selDate.format.replace(/[^Y|^m|^d]/g, "")));
						}
						opts.context.trigger("onSelect", [opts.context, selDate, opts.monthonly]);

						self.hide(ke);
					} else {
						var selectedDay = daysPanel.find(".datepicker_day_selected__").text();
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
							beforeSelectedDay = parseInt(beforeSelectedDay === undefined ? d.formatDate("d") : beforeSelectedDay );
							if(beforeSelectedDay > gEndDate) {
								beforeSelectedDay = gEndDate;
							}
							daysPanel.find(".datepicker_day_item__:contains(" + String(beforeSelectedDay) + "):eq(0)").addClass("datepicker_day_selected__");
						}
						
						beforeSelectedDay = selectedDay;
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
						daysPanel.find(".datepicker_prev_day_item__.datepicker_day_selected__, .datepicker_day_item__.datepicker_day_selected__, .datepicker_next_day_item__.datepicker_day_selected__").removeClass("datepicker_day_selected__");
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
							onSelectContinue = opts.onSelect.call(self, opts.context, selDate, opts.monthonly);
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
					opts.context.unbind("focusin.datepicker").bind("focusin.datepicker", function() {
						// Hide opened other datepicker dialogs
						var openedContents = N(".datepicker_contents__:visible");
						if(openedContents.length > 0) {
							openedContents.removeClass("visible__").addClass("hidden__").hide();

							var context = openedContents.prev(".datepicker__");
							if(context.length > 0) {
								var prevOpts = context.instance("datepicker").options;
								if(prevOpts.onHide !== null) {
									prevOpts.onHide.call(self, prevOpts.context, prevOpts.contents);
								}
								context.trigger("onHide", [prevOpts.context, prevOpts.contents]);
							}
						}
						
						if(!opts.contents.is(":visible")) {
							if(opts.shareEle) {
								// Replace the options for the shared instance with the Datepicker instance options for the selected input element.
								self = $(this).instance("datepicker");
								opts = self.options;
								
								// Reuse the datepicker panel element
								var contents;
								if(opts.monthonly) {
									contents = N(".datepicker_contents_month_master__.datepicker_monthonly__");
								} else {
									contents = N(".datepicker_contents_date_master__:not(.datepicker_monthonly__)");
								}

								if(contents.length === 0) {
									contents = DatePicker.wrapEle.call(self);
								}

								opts.context.after(contents);
								opts.contents = contents;
							}
							
							if(!opts.context.prop("readonly") && !opts.context.prop("disabled")) {
								// auto select datepicker items from before input value
								if(!N.string.isEmpty(opts.context.val())) {
									DatePicker.selectItems(opts,
											opts.context.val().replace(/[^0-9]/g, ""),
											(!opts.monthonly ? N.context.attr("data").formatter.date.Ymd() : N.context.attr("data").formatter.date.Ym()).replace(/[^Y|^m|^d]/g, ""),
											opts.contents.find(".datepicker_years_panel__"),
											opts.contents.find(".datepicker_months_panel__"),
											opts.contents.find(".datepicker_days_panel__"));
								}
								
								self.show();
							}							
						}
					});
				}

				// bind key events
				opts.context.unbind("keydown.datepicker").bind("keydown.datepicker", function(e) {
					var keyCode = e.keyCode ? e.keyCode : (e.which ? e.which : e.charCode);
					if(!N.event.isNumberRelatedKeys(e) || opts.context.val().length > 8) {
						e.preventDefault();
						return false;
					} else if (keyCode == 13) { // When press the ENTER key
						opts.context.get(0).blur();
						self.hide();
					}
				}).unbind("keyup.datepicker").bind("keyup.datepicker", function(e) {
					// Hangul does not apply e.preventDefault() of keydown event
					e.target.value = e.target.value.replace(/[^0-9]/g, "");

					var value = opts.context.val();
					var keyCode = e.keyCode ? e.keyCode : (e.which ? e.which : e.charCode);

					// when press the number keys
					if (value.length%2 === 0) {
						var dateStrArr = N.date.strToDateStrArr(value, format);
						var dateStrStrArr = N.date.strToDateStrArr(value, format, true);

						// validate input value
						if(dateStrStrArr[0].length === 4 && dateStrArr[0] < 100) {
							opts.context.alert(N.message.get(opts.message, "yearNaN")).show();
							opts.context.val(value.replace(dateStrStrArr[0], ""));
							return false;
						} else if(dateStrStrArr[1].length === 2 && (dateStrArr[1] < 1 || dateStrArr[1] > 12)) {
        					opts.context.alert(N.message.get(opts.message, "monthNaN")).show();
    						opts.context.val(value.replace(dateStrStrArr[1], ""));
        					return false;
        				} else if(!opts.monthonly && dateStrStrArr[2].length === 2 && (dateStrArr[2] < 1 || dateStrArr[2] > parseInt(gEndDate))) {
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
					}

					if (keyCode == 9 && keyCode == 27) { // When press the TAB key & ESC key
						e.preventDefault();
						self.hide();
		        	}
				}).unbind("focusout.datepicker").bind("focusout.datepicker", function(e) {
					// Hangul does not apply e.preventDefault() of keydown event
					if(!opts.context.prop("readonly") && !opts.context.prop("disable")) {
						e.target.value = e.target.value.replace(/[^0-9]/g, "");
					}
				});

				return opts.contents;
			},
			wrapSingleEle : function() {
				var opts = this.options;
				var self = this;

				opts.contents.unbind("click.datepicker").bind("click.datepicker", function(e) {
					e.stopPropagation();
				});
				opts.context.unbind("click.datepicker").bind("click.datepicker", function(e) {
					e.stopPropagation();
				});

				var format = (!opts.monthonly ? N.context.attr("data").formatter.date.Ymd() : N.context.attr("data").formatter.date.Ym()).replace(/[^Y|^m|^d]/g, "");
				var yearsPanel = N((opts.monthonly ? ".datepicker_contents__.datepicker_monthonly__" : ".datepicker_contents__:not(.datepicker_monthonly__)") + " .datepicker_years_panel__");
				var monthsPanel = N((opts.monthonly ? ".datepicker_contents__.datepicker_monthonly__" : ".datepicker_contents__:not(.datepicker_monthonly__)") + " .datepicker_months_panel__");
				var daysPanel = N((opts.monthonly ? ".datepicker_contents__.datepicker_monthonly__" : ".datepicker_contents__:not(.datepicker_monthonly__)") + " .datepicker_days_panel__");

				// bind focusin event
				if(opts.focusin) {
					var focusinHandler = opts.monthonly ? $(".datepicker__.datepicker_month_master__").events("focusin", "datepicker")
							: $(".datepicker__.datepicker_date_master__").events("focusin", "datepicker");

					if(focusinHandler !== undefined) {
						opts.context.bind("focusin.datepicker", focusinHandler[0].handler);
					}
				}

				// bind key events
				var keyupHandler = opts.monthonly ? $(".datepicker__.datepicker_month_master__").events("keyup", "datepicker")
						: $(".datepicker__.datepicker_date_master__").events("keyup", "datepicker");
				if(keyupHandler !== undefined) {
					opts.context.bind("keyup.datepicker", keyupHandler[0].handler);
				}
				var keydownHandler = opts.monthonly ? $(".datepicker__.datepicker_month_master__").events("keydown", "datepicker")
						: $(".datepicker__.datepicker_date_master__").events("keydown", "datepicker");
				if(keydownHandler !== undefined) {
					opts.context.bind("keydown.datepicker", keydownHandler[0].handler);
				}
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
			context : function(sel) {
				return sel !== undefined ? this.options.context.find(sel) : this.options.context;
			},
			show : function() {
				var opts = this.options;
				var self = this;

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
					if(parentEle.length > 0 && parentEle.innerWidth() > opts.contents.outerWidth()) {
						limitWidth = parentEle.position().left + parentEle.width();
					} else {
						limitWidth = (window.innerWidth ? window.innerWidth : $(window).width());
					}
					if(leftOfs + opts.contents.width() > limitWidth) {
						opts.contents.css("left", "");
						opts.contents.css("right", (limitWidth - (leftOfs + opts.context.outerWidth())) + "px");
						opts.contents.removeClass("orgin_left__").addClass("orgin_right__");
					} else {
						opts.contents.css("right", "");
						opts.contents.css("left", leftOfs + "px");
						opts.contents.removeClass("orgin_right__").addClass("orgin_left__");
					}
				}).trigger("resize.datepicker");

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
					opts.contents.one(N.event.whichTransitionEvent(opts.contents), function(e){
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
				opener : null,
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
				$.extend(true, this.options, N.context.attr("ui").popup);
			} catch (e) {
				throw N.error("[N.popup]" + e, e);
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
			
			$.extend(true, this.options, opts);
			
			// if title option value is undefined
			this.options.title = opts !== undefined ? N.string.trimToNull(opts.title) : null;

			// Auto opener Settings(parent page's Controller)
			if(this.options.opener == null) {
				var self = this;
				try {
					var caller = arguments.callee.caller;
					var callers = [caller];
					while(caller != null) {
					    caller = caller.arguments.callee.caller;
					    callers.push(caller);
					    if(caller != null && caller.arguments.length > 0 && N(caller.arguments[0]).hasClass("view_context__") && caller.arguments[0].instance != null && N.type(caller.arguments[0].instance) === "function") {
							self.options.opener = caller.arguments[0].instance("cont");
							break;
						}

					    // Infinite loop prevention processing
					    if(caller == $.event.dispatch) {
					    	callers = undefined;
					    	throw N.error("[N.popup]Opener not found");
					    }
					    if(callers.indexOf(caller) > -1) {
					    	callers = undefined;
					    	throw N.error("[N.popup]Opener not found");
					    }
					}
				} catch(e) {
					callers = undefined;
					if(this.options.url !== null) {
						N.warn("[N.popup][" + e.toString().replace("Error: ", "") + "]opener(parent's N.cont object) auto setup failed. please define the opener option value of N.popup.");
					}
				}
				callers = undefined;				
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
						if(opts.opener != null) {
							cont.opener = opts.opener;
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
			popOpen : function(onOpenData, cont) {
				var opts = this.options;
				var self = this;

				if(opts.url === null) {
					opts.context.show();
				}
				self.alert.show();

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

						Popup.popOpen.call(self, onOpenData, cont);
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
				$.extend(true, this.options, N.context.attr("ui").tab);
			} catch (e) {
				throw N.error("[N.tab]" + e, e);
			}

			if (N.isPlainObject(obj)) {
				$.extend(true, this.options, obj);
				this.options.context = N(obj.context);
			}
			this.options.links = this.options.context.find(">ul>li");
			this.options.contents = this.options.context.find(">div");

			var self = this;
			var opt;
			if(this.options.tabOpts.length === 0) {
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
								// excute "onLoad" event
								if(opts.onLoad !== null) {
									opts.onLoad.call(self, i, opts.links.eq(i), selContentEle_, cont);
								}
							});
						}
					}
				});

				var marginLeft;
				opts.links.bind("mousedown.tab touchstart.tab", function(e) {
					e.preventDefault();
					
					marginLeft = parseInt(opts.context.find(">ul").css("margin-left"));
				});
				
				opts.links.bind("click.tab touchend.tab", function(e, onOpenData, isFirst) {
					e.preventDefault();

					if(marginLeft !== undefined && Math.abs(parseInt(opts.context.find(">ul").css("margin-left")) - marginLeft) > 15 && isFirst !== true) {
						marginLeft = undefined;
						return false;
					}
					marginLeft = undefined;
					
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
									opts.onActive.call(self, selTabIdx, selTabEle, selContentEle, opts.links, opts.contents);
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

						// Synchronize the animation and page load
						var visibleDefer = $.Deferred(); 
						var loadDefer = $.Deferred();
						$.when(visibleDefer, loadDefer).done(function() {
							opts.context.dequeue("open");
						});
						
						// hide tab contents
						var beforeActivatedContent = opts.contents.filter(".tab_content_active__");
						if(beforeActivatedContent.length > 0) {
							var isRelative = false;
							if(opts.context.css("position") !== "relative") {
								opts.context.css("position", "relative");
								isRelative = true;
							}
							beforeActivatedContent.removeClass("tab_content_active__ visible__").one(N.event.whichTransitionEvent(beforeActivatedContent), function(e){
								$(this).hide();
								if(isRelative) {
									opts.context.css("position", "");
								}
								visibleDefer.resolve();
							}).addClass("hidden__").trigger("nothing");
						} else {
							visibleDefer.resolve();
						}

						if(!selDeclarativeOpts.preload && selDeclarativeOpts.url !== undefined && !selContentEle.data("loaded") || selDeclarativeOpts.stateless) {
							// load content
							Tab.loadContent.call(self, selDeclarativeOpts.url, selTabIdx, function(cont, selContentEle_) {
								selContentEle_.addClass("tab_content_active__");

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

								selContentEle.data("loaded", true);
								
								// show tab contents
								selContentEle_.show(0, function() {
									selContentEle_.addClass("visible__");
									
									loadDefer.resolve();
								}).removeClass("hidden__");
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
				this.open(defSelIdx, undefined, true);
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
					
					lastDistance = prevBtnEle.outerWidth();
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

				var sPageX;
				var prevDefGap = 0;
				var nextDefGap = 0;
				var isMoved = false;
				if(scrollBtnEles.length > 1) {
					prevDefGap = prevBtnEle.outerWidth();
					nextDefGap = nextBtnEle.outerWidth();
				}

				UI.draggable.events.call(tabContainerEle, eventNameSpace, function(e, tabContainerEle_, pageX, pageY) { // start
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
						isMoved = true;
					}
				}, function(e, tabContainerEle_) { //end
					if(isMoved) {
						if(lastDistance + (scrollBtnEles.length > 1 ? 0 : 30) >= 0 && lastDistance <= prevDefGap) {
							if(scrollBtnEles.length > 1) {
								lastDistance = prevDefGap;
								nextBtnEle.removeClass("disabled__");
								prevBtnEle.addClass("disabled__");
							} else {
								lastDistance = 0;
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
			},
			loadContent : function(url, targetIdx, callback, isFirst) {
				var opts = this.options;
				var self = this;
				var selContentEle = opts.contents.eq(targetIdx);

				N.comm({
					url : url,
					contentType : "text/html; charset=UTF-8",
					dataType : "html",
					type : "GET",
					urlSync : isFirst ? false : true,
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
			open : function(idx, onOpenData, isFirst) {
				var opts = this.options;
				if(idx !== undefined) {
					opts.context.queue("open", function() {
						if(onOpenData !== undefined) {
							$(opts.links.get(idx)).trigger("click.tab", [onOpenData, isFirst]);
						} else {
							$(opts.links.get(idx)).trigger("click.tab", [undefined, isFirst]);
						}						
					});
					clearTimeout(opts.openTime);
					opts.openTime = setTimeout(function() {
						opts.context.dequeue("open");
					}, 0);
					
					if(opts.tabScroll) {
						var tabContainerEle = opts.context.find(">ul");
						if(tabContainerEle.outerWidth() > opts.context.innerWidth()) {
							var marginLeft = parseInt(tabContainerEle.css("margin-left")) - $(opts.links.get(idx)).position().left + (opts.context.innerWidth() / 2 - $(opts.links.get(idx)).outerWidth() / 2);
							var prevBtnEle = opts.context.find(">a.tab_scroll_prev__");
							var nextBtnEle = opts.context.find(">a.tab_scroll_next__");
							
							if(marginLeft > opts.context.find(">a.tab_scroll_prev__").outerWidth()) {
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
					return {
						index : opts.links.index(opts.links.filter(".tab_active__")),
						tab : opts.links.filter(".tab_active__"),
						content : opts.context.find("> div.tab_content_active__"),
						cont : opts.context.find("> div.tab_content_active__ > .view_context__").instance("cont")
					}
				}
				return this;
			},
			disable : function(idx) {
				if(idx !== undefined) {
					$(this.options.links.get(idx))
						.unbind("click.tab.disable")
						.unbind("touchstart.tab.disable")
						.unbind("touchend.tab.disable")
						.tpBind("click.tab.disable", N.event.disable)
						.tpBind("touchstart.tab.disable", N.event.disable)
						.tpBind("touchend.tab.disable", N.event.disable)
						.addClass("tab_disabled__");
				}
				return this;
			},
			enable : function(idx) {
				if(idx !== undefined) {
					$(this.options.links.get(idx))
						.unbind("click", N.event.disable)
						.unbind("touchstart", N.event.disable)
						.unbind("touchend", N.event.disable)
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
				$.extend(this.options, N.context.attr("ui").select);
			} catch (e) {
				throw N.error("[N.select]" + e, e);
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
			data : function(selFlag) {
				var opts = this.options;
				if(selFlag !== undefined && selFlag === true) {
					var selectEles = opts.type === 1 || opts.type === 2 ? opts.context.find("option") : opts.context.closest(".select_input_container__").children("label");
		    		var defSelCnt = selectEles.filter(".select_default__").length;
		    		var idxs = this.index();
		    		if(N.type(idxs) !== "array") {
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
		    			var container = $('<form class="select_input_container__" style="display: inline;" />');
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
				autoUnbind : false,
				state : null, // add, bind, revert, update
				html : false,
				addTop : false,
				fRules : null,
				vRules : null,
				extObj : null, // extObj : for N.grid
				extRow : -1, // extRow : for N.grid
				revert : false,
				unbind : true,
				onBeforeBind : null,
				onBind : null,
				InitialData : null // for unbind
			};

			try {
				$.extend(this.options, N.context.attr("ui").form);
			} catch (e) {
				throw N.error("[N.form]" + e, e);
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
					this.options.InitialData = N.element.toData(this.options.context.find("[id]").not(":button"));
				}
			}

			// set style class name to context element
			this.options.context.addClass("form__");

			if(this.options.revert) {
				this.options.revertData = $.extend({}, this.options.data[this.options.row]);
			}

			// set this instance to context element
			this.options.context.instance("form", this);

			// register this to N.ds for realtime data synchronization
			if(this.options.extObj === null) {
				N.ds.instance(this, true);
			}

			return this;
		};

		$.extend(Form.prototype, {
			data : function(selFlag) { // key name : argument1, argument2... argumentN
				var opts = this.options;
				if(selFlag !== undefined && selFlag === true) {
					var retData = [];
					// clone arguments
					var args = Array.prototype.slice.call(arguments, 0);
					if(arguments.length > 1) {
						args[0] = opts.data[opts.row];
						retData.push(N.json.mapFromKeys.apply(N.json, args));
					} else {
						retData.push(opts.data[opts.row]);
					}
					return retData;
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
			/**
			 * arguments[2]... arguments[n] are the columns to be bound.
			 */
			bind : function(row, data) {
				var opts = this.options;
				
				if(data === "add" || data === "bind" || data === "revert" || data === "update") {
					if(opts.autoUnbind) {
						this.unbind();
					}
					opts.state = data;
					data = undefined;
				} else {
					opts.state = "bind";
				}
				
				if(row !== undefined) {
					opts.row = row;
				}
				if(data != null) {
					opts.data = N.type(data) === "array" ? N(data) : data;
					if(opts.revert) {
						opts.revertData = $.extend({}, data[row]);
					}
				}

				var self = this;
				var vals;
				if (!N.isEmptyObject(opts.data) && !N.isEmptyObject(vals = opts.data[opts.row])) {
					if(arguments.length < 3 && opts.onBeforeBind !== null && this.options.extObj === null) {
						opts.onBeforeBind.call(self, opts.context, vals);
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
					var idContext, rcContext, eles, ele, val, tagName, type;

					var spltSepa = N.context.attr("core").spltSepa;
					var cols;
					if(arguments.length > 2) {
						cols = spltSepa + Array.prototype.slice.call(arguments, 2).join(spltSepa) + spltSepa;
					}
					
					idContext = opts.context.find("[id]:not(:radio, :checkbox)"); // normal elements
					rcContext = opts.context.find(":radio, :checkbox"); // radio and checkbox elements
					for ( var key in vals ) {
						if(cols !== undefined && cols.indexOf(spltSepa + key + spltSepa) < 0) {
							continue;
						}
						ele = idContext.filter("#" + key);
						if (ele.length > 0) {
							// add data changed flag
							if (vals.rowStatus === "update") {
								ele.addClass("data_changed__");
							} else {
								ele.removeClass("data_changed__");
							}

							tagName = ele.get(0).tagName.toLowerCase();
							type = N.string.trimToEmpty(ele.attr("type")).toLowerCase();
							if (tagName === "textarea" || type === "text" || type === "password" || type === "hidden" || type === "file"
								// Support HTML5 Form's input types
								|| type === "number" || type === "tel" || type === "email" || type === "search" || type === "color"
								// The date type does not support formatting, so it does not support it.
								// || type === "date" || type === "datetime-local" || type === "month" || type === "time" || type === "week"
								|| type === "range"
								|| type === "url") {
								//validate
								if(ele.data("validate") !== undefined) {
									if (type !== "hidden") {
										N().validator(opts.vRules !== null ? opts.vRules : ele);

										// remove validator's dregs for rebind
										ele.removeClass("validate_false__");
										if(ele.instance("alert") !== undefined) {
											ele.instance("alert").remove();
											ele.removeData("alert__");
										}

										if(N.isEmptyObject(ele.events("focusout", "form.validate"))) {
											ele.bind("focusout.form.validate", function() {
												var currEle = $(this);
					                            if (!currEle.prop("disabled") && !currEle.prop("readonly") && opts.validate) {
				                            		currEle.trigger("validate.validator");
					                            }
					                        });
										}
									}
								}

								//dataSync
								if(N.isEmptyObject(ele.events("focusout", "dataSync.form"))) {
									ele.bind("focusout.form.dataSync", function(e) {
										var currEle = $(this);
										var currVal = currEle.val();

										// for val method
										if(vals !== opts.data[opts.row]) {
											vals = opts.data[opts.row];
										}

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
								}

								//Enter key event
								if(N.isEmptyObject(ele.events("keyup", "dataSync.form"))) {
									 ele.bind("keyup.form.dataSync", function(e) {
			                        	if ((e.keyCode ? e.keyCode : (e.which ? e.which : e.charCode)) == 13) {
			                        		e.preventDefault();
			                            	$(this).trigger("focusout.form.validate");
			                            	// notify data changed
		                            		$(this).trigger("focusout.form.dataSync");
			                            }
			                        });
								}

			                    //format
		                        if(ele.data("format") !== undefined) {
									if (type !== "password" && type !== "hidden" && type !== "file") {
										N(opts.data).formatter(opts.fRules !== null ? opts.fRules : ele).format(opts.row);

										if(N.isEmptyObject(ele.events("focusin", "form.unformat"))) {
											ele.bind("focusin.form.unformat", function() {
												var currEle = $(this);
					                            if (!currEle.prop("disabled") && !currEle.prop("readonly") && (!opts.validate || (opts.validate && !currEle.hasClass("validate_false__")))) {
					                                currEle.trigger("unformat.formatter");
					                            }
					                        });
										}

										if(N.isEmptyObject(ele.events("focusout", "form.format"))) {
											ele.bind("focusout.form.format", function() {
												var currEle = $(this);
					                            if (!currEle.prop("disabled") && !currEle.prop("readonly") && (!opts.validate || (opts.validate && !currEle.hasClass("validate_false__")))) {
					                            	currEle.trigger("format.formatter");
					                            }
					                        });
										}
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
								if(N.isEmptyObject(ele.events("change", "dataSync.form"))) {
									ele.bind("change.form.dataSync", function(e) {
										var currEle = $(this);
										var currVals = currEle.vals();

										// for val method
										if(vals !== opts.data[opts.row]) {
											vals = opts.data[opts.row];
										}

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
								}

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
						} else {
							//radio, checkbox
							eles = rcContext.filter("[name='" + key + "']");
							if(eles.length === 0) {
								eles = rcContext.filter("#" + key);
							}
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
								eles.data("eles", eles).tpBind("click.form.dataSync select.form.dataSync", function(e) {
									var currEle = $(this);
									var currKey = currEle.attr("name");
									if(currKey === undefined) {
										currKey = currEle.attr("id");
									}
									var currVals = $(this).data("eles").vals();

									// for val method
									if(vals !== opts.data[opts.row]) {
										vals = opts.data[opts.row];
									}

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

					if(arguments.length < 3 && opts.onBind !== null && this.options.extObj === null) {
						opts.onBind.call(self, opts.context, vals);
					}
					// empty variables
					idContext = rcContext = eles = ele = val = tagName = type = undefined;
				}
				return this;
			},
			unbind : function(state) {
				var opts = this.options;
				
				if(opts.unbind && opts.InitialData !== null) {
					opts.context.removeClass("row_data_changed__");
					var vals = opts.InitialData;
					var idContext, rcContext, eles, ele, val, tagName, type;
					
					idContext = opts.context.find("[id]:not(:radio, :checkbox)"); // normal elements
					rcContext = opts.context.find(":radio, :checkbox"); // radio and checkbox elements
					for ( var key in vals ) {
						ele = idContext.filter("#" + key);
						if (ele.length > 0) {
							ele.removeClass("data_changed__");
							tagName = ele.get(0).tagName.toLowerCase();
							type = N.string.trimToEmpty(ele.attr("type")).toLowerCase();
							if (tagName === "textarea" || type === "text" || type === "password" || type === "hidden" || type === "file"
								// Support HTML5 Form's input types
								|| type === "number" || type === "tel" || type === "email" || type === "search" || type === "color"
								// The date type does not support formatting, so it does not support it.
								// || type === "date" || type === "datetime-local" || type === "month" || type === "time" || type === "week"
								|| type === "range"
								|| type === "url") {
								// unbind events
								ele.unbind("focusout.form.validate focusout.form.dataSync keyup.form.dataSync focusin.form.unformat focusout.form.format format.formatter unformat.formatter");
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
						} else {
							//radio, checkbox
							eles = rcContext.filter("[name='" + key + "']");
							if(eles.length === 0) {
								eles = rcContext.filter("#" + key);
							}
							
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
					// empty variables
					idContext = rcContext = eles = ele = val = tagName = type = undefined;
				}
				return this;
			},
			add : function(data, row) {
				var opts = this.options;
				opts.state = "add";
				if(opts.autoUnbind) {
					this.unbind();
				}

		        if (opts.data === null) {
		            throw new Error("[Form.add]Data is null. you must input data");
		        }

		        var extractedData = N.element.toData(opts.context.find(":input:not(:button)"));
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

	        	if(!opts.addTop) {
	        		if(row === undefined) {
	        			opts.data.push(extractedData);
	        			row = opts.data.length - 1;
	        		} else {
	        			opts.data.splice(row, 0, extractedData);
	        		}
	        	} else {
	        		if(row === undefined) {
		        		row = 0;
	        		}
	        		opts.data.splice(row, 0, extractedData);
	        	}
	        	opts.row = row;

	        	// row index of N.grid's form is 0;
	        	if(opts.extObj !== null) {
        			opts.data = $(opts.data[opts.row]);
        			opts.row = 0;
        			
        			// for scroll paging
        			// just +1 is inappropriate on android 4.4.2 webkit
        			var rowEleLength = opts.extObj.options.context.find(opts.extObj instanceof N.grid ? ">tbody" : ">li").length;
        			var pagingSize = opts.extObj.options.scrollPaging.size;
        			var rest = rowEleLength % pagingSize;
        			opts.extObj.options.scrollPaging.idx = parseInt(rowEleLength / pagingSize) * pagingSize - pagingSize + rest;
        		}
	        	
	        	// Set revert data
	        	if(opts.revert) {
	        		opts.revertData = $.extend({}, opts.data[opts.row]);
	        	}

	        	this.bind(opts.row, opts.state);

	        	N.ds.instance(opts.extObj !== null ? opts.extObj : this).notify(opts.extRow > -1 ? opts.extRow : opts.row);

				return this;
			},
			remove : function() {
				var opts = this.options;

				if (opts.data[opts.row].rowStatus === "insert") {
		            opts.data.splice(opts.row, 1);
		            opts.row = -1;
		            N.ds.instance(opts.extObj !== null ? opts.extObj : this).notify();
		        } else {
		        	opts.data[opts.row].rowStatus = "delete";
		        	opts.context.addClass("row_data_deleted");
		        	N.ds.instance(opts.extObj !== null ? opts.extObj : this).notify(opts.extRow > -1 ? opts.extRow : opts.row);
		        }
				
				return this;
			},
			revert : function() {
				var opts = this.options;
				if(!opts.revert) {
					throw N.error("[N.form.prototype.revert]Can not revert. N.form's revert option value is false");
				}
				
				opts.state = "revert";
				
				var orgRow = opts.row;
				opts.row = orgRow;
				for(var k in opts.data[opts.row]){
					delete opts.data[opts.row][k];
				}
				$.extend(opts.data[opts.row], opts.data[opts.row], opts.revertData);
				opts.data[opts.row]._isRevert = true;
				
				this.bind(opts.row, opts.state);
				
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

				return eles.filter(".validate_false__").length > 0 ? false : true;
			},
			val : function(key, val, notify) {
				var opts = this.options;
				var vals = opts.data[opts.row];

				if(val === undefined) {
					return vals[key];
				}

				var eles, ele, val, tagName, type;
				var self = this;
				var rdonyFg = false;
				var dsabdFg = false;
				var ele = opts.context.find("#" + key); 
				
				if (ele.length > 0) {
					tagName = ele.get(0).tagName.toLowerCase();
					type = N.string.trimToEmpty(ele.attr("type")).toLowerCase();

					ele = ele.not(":radio, :checkbox");
					if (ele.length > 0) {
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
							|| type === "number" || type === "tel" || type === "email" || type === "search" || type === "color"
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

							// rebind for sync and validate, format, etc. realted events bind
							if(ele.events("focusout", "dataSync.form") === undefined) {
								vals[key] = null;
								self.bind(undefined, undefined, key);
							}

							// put value
							ele.val(val);

							// validate
							if(ele.data("validate") !== undefined) {
								if (type !== "hidden") {
									ele.trigger("focusout.form.validate");
								}
							}

							if(notify !== false) {
								// dataSync & add data changed flag
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

							// rebind for data sync and validate, format, etc. realted events bind
							if(ele.events("change", "dataSync.form") === undefined) {
								vals[key] = null;
								self.bind(undefined, undefined, key);
							}

							// select value
							ele.vals(val);

							if(notify !== false) {
								// dataSync & add data changed flag
								ele.trigger("change.form.dataSync");
							} else {
								// add data changed flag
								ele.addClass("data_changed__");
							}
						} else if(tagName === "img") {
							// update dataset value
							vals[key] = val;

							// change row status
							if (vals.rowStatus !== "insert" && vals.rowStatus !== "delete") {
								vals.rowStatus = "update";
								// add data changed flag
								ele.addClass("data_changed__");
							}

							// put image path
							ele.attr("src", val);

							// notify data changed
							if(notify !== false) {
								N.ds.instance(opts.extObj !== null ? opts.extObj : self).notify(opts.extRow > -1 ? opts.extRow : opts.row, key);
							}
						} else {
							// update dataset value
							vals[key] = val;

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
									ele.text(val === null ? "" : val);
								} else {
									ele.html(val);
								}
							}

							// notify data changed
							if(notify !== false) {
								N.ds.instance(opts.extObj !== null ? opts.extObj : self).notify(opts.extRow > -1 ? opts.extRow : opts.row, key);
							}
						}

						// reset prevent event condition of input element
						if(rdonyFg) {
							ele.prop("readonly", true);
		                }
		                if(dsabdFg) {
		                	ele.prop("disabled", true);
		                }
					} else {
						//radio, checkbox
						eles = opts.context.find("[name='" + key + "']:radio, [name='" + key + "']:checkbox");
						if(eles.length === 0) {
							eles = opts.context.find("#" + key);
						}
						
						if(eles.length > 0) {
							// remove validator's dregs for rebind
							eles.removeClass("validate_false__");
							var a = eles.instance("alert", function() {
								this.remove()
							}).removeData("alert__");

							// rebind for data sync and validate, format, etc. realted events bind
							if($(eles.get(0)).events("select", "dataSync.form") === undefined) {
								vals[$(eles.get(0)).attr("id")] = null;
								self.bind(undefined, undefined, key);
							}

							// select value
							eles.vals(val);

							if(notify !== false) {
								// dataSync & add data changed flag
								$(eles.get(0)).trigger("select.form.dataSync");
							} else {
								// add data changed flag
								$(eles.get(0)).addClass("data_changed__");
							}
						}
					}

					// empty variables
					eles = ele = val = tagName = type = undefined;
				} else {
					// put value
					if(opts.data[opts.row][key] !== val) {
						opts.data[opts.row][key] = val;

						// change row status
	                    if (opts.data[opts.row].rowStatus !== "insert" && opts.data[opts.row].rowStatus !== "delete") {
	                    	opts.data[opts.row].rowStatus = "update";
	                    }

	                    // dataSync
                    	N.ds.instance(opts.extObj !== null ? opts.extObj : self).notify(opts.extRow > -1 ? opts.extRow : opts.row, key);
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

				opts.state = "update"
				
				if (key === undefined) {
					this.bind(row, opts.state);
				} else {
					if(row === this.row()) {
						this.val(key, opts.data[row][key], false);
						var changedEle = opts.context.find("#" + key + ":not(:radio, :checkbox)");
						if(changedEle.length === 0) {
							changedEle = opts.context.find("[name='" + key + "']").filter(":radio, :checkbox");
						}
						if(changedEle.length === 0) {
							changedEle = opts.context.find("#" + key).filter(":radio, :checkbox");
						}
						N.element.dataChanged(changedEle);
					}
				}
				return this;
			}
		});

		// List
		var List = N.list = function(data, opts) {
			this.options = {
				data : N.type(data) === "array" ? N(data) : data,
				row : -1, // selected row index
				beforeRow : -1, // before selected row index
				context : null,
				height : 0,
				validate : true,
				html : false,
				addTop : false,
				addSelect : false,
				vResizable : false,
				windowScrollLock : true,
				select : false,
				selectWithCheck : false,
				unselect : true,
				multiselect : false,
				checkAll : null, // selector
				checkAllTarget : null, // selector
				checkSingleTarget : null,
				checkWidthSelect : false,
				hover : false,
				revert : false,
				createRowDelay : 1,
				scrollPaging : {
					idx : 0,
					size : 100
				},
				fRules : null,
				vRules : null,
				appendScroll : true,
				addScroll : true,
				selectScroll : true,
				checkScroll : true,
				validateScroll : true,
				rowHandlerBeforeBind : null,
				rowHandler : null,
				onSelect : null,
				onBind : null
			};

			try {
				$.extend(true, this.options, N.context.attr("ui").list);
			} catch (e) {
				throw N.error("[N.list]" + e, e);
			}

			if (N.isPlainObject(opts)) {
				//convert data to wrapped set
				opts.data = N.type(opts.data) === "array" ? N(opts.data) : opts.data;

				$.extend(true, this.options, opts);

				//for scroll paging limit
				this.options.scrollPaging.limit = this.options.scrollPaging.size;

				if(N.type(this.options.context) === "string") {
					this.options.context = N(this.options.context);
				}
			} else {
				this.options.context = N(opts);
			}

			// If the value of the opts.scrollPaging.size option is greater than 0, the addTop option is unconditionally set to true.
			if(!this.options.addTop) {
				this.options.scrollPaging.size = 0;
				this.options.createRowDelay = 0;
			}

			// for bind "append"
			this.options.scrollPaging.defSize = this.options.scrollPaging.size;

			// set li template
			this.tempRowEle = this.options.context.find("> li").clone(true, true);

			// set style class name to context element
			this.options.context.addClass("list__");
			// set style class name to context element for hover option
			if(this.options.hover) {
				this.options.context.addClass("list_hover__");
			}
			if(this.options.select || this.options.multiselect) {
				UI.iteration.select.call(this, "list");
			}

			// Create scroll
			if(this.options.height > 0) {
				List.createScroll.call(this);
			}

			this.contextEle = this.options.context;
			if(this.options.height > 0) {
				this.contextEle = this.options.context.closest("div.context_wrap__ > .list__");
        	}

			// set function for check all checkbox in list
			if(this.options.checkAll !== null && this.options.checkAllTarget !== null) {
				UI.iteration.checkAll.call(this, "list");
			} else {
				if(this.options.checkSingleTarget !== null) {
					// set function for check single checkbox in list
					UI.iteration.checkSingle.call(this, "list");
				}
			}

			// set this instance to context element
			this.options.context.instance("list", this);

			// register this to N.ds for realtime data synchronization
			N.ds.instance(this, true);

			return this;
		};

		$.extend(List, {
			createScroll : function() {
				var opts = this.options;

				opts.context.css({
					"margin" : "0"
				});

		        //Create list header
		        var scrollbarWidth = N.browser.scrollbarWidth();

		        //Create list body
		        var contextWrapEle = opts.context.wrap('<div class="context_wrap__"/>').parent().css({
		        	"height" : String(opts.height) + "px",
		        	"overflow-y" : "scroll",
		        	"margin-left" : "-1px"
		        });

		        // for IE
		        if(N.browser.is("ie")) {
		        	contextWrapEle.css("overflow-x", "hidden");
		        }

		        if(opts.windowScrollLock) {
		        	N.event.windowScrollLock(contextWrapEle);
		        }

		        // Scroll paging
		        var self = this;
		        var defSPSize = opts.scrollPaging.limit;
		        var rowEleLength;
		        UI.scroll.paging.call(self, contextWrapEle, defSPSize, rowEleLength, "> li", "list.bind");

		        // Vertical height resizing
		        if(opts.vResizable) {
		        	List.vResize.call(this, contextWrapEle);
		        }
			},
			vResize : function(contextWrapEle) {
        		var pressed = false;
	        	var vResizable = $('<div class="v_resizable__" align="center"></div>');
	        	vResizable.css("cursor", "n-resize");
	        	vResizable.css("margin-bottom", contextWrapEle.css("margin-bottom"));
	        	contextWrapEle.css("margin-bottom", "0");

	        	var currHeight, contextWrapOffset;
	        	var eventNameSpace = ".list.vResize";
	        	UI.draggable.events.call(vResizable, eventNameSpace, function(e, tabContainerEle_, pageX, pageY) { // start
        			contextWrapOffset = contextWrapEle.offset();
				}, function(e, tabContainerEle_, pageX, pageY) { // move
					currHeight = (pageY - contextWrapOffset.top) + "px";
					contextWrapEle.css({
						"height" : currHeight,
						"max-height" : currHeight
					});
				});

	        	contextWrapEle.after(vResizable);
        	}
		});

		$.extend(List.prototype, {
			data : function(rowStatus) { // key name : argument1, argument2... argumentN
				var opts = this.options;

				if(rowStatus === undefined) {
					return opts.data.get();
				} else if(rowStatus === false) {
					return opts.data;
				} else if(rowStatus === "modified") {
					return opts.data.datafilter(function(data) {
						return data.rowStatus !== undefined;
					}).get();
				} else if(rowStatus === "selected") {
					if(opts.select || opts.multiselect) {
						var retData = [];

						// clone arguments
						var args = Array.prototype.slice.call(arguments, 0);

						var rowEles = this.contextEle.find(">li.form__"); 
						rowEles.filter(".list_selected__").each(function() {
							var thisEle = $(this);
							if(arguments.length > 1) {
								args[0] = opts.data[rowEles.index(this)];
								retData.push(N.json.mapFromKeys.apply(N.json, args));
							} else {
								retData.push(opts.data[rowEles.index(this)]);
							}
						});
						return retData;
					}
				} else if(rowStatus === "checked") {
					var opts = opts;
					var retData = [];

					// clone arguments
					var args = Array.prototype.slice.call(arguments, 0);

					var rowEles = this.contextEle.find(">li.form__");
					rowEles.find(opts.checkAllTarget||opts.checkSingleTarget).filter(":checked").each(function() {
						var thisEle = $(this);
						if(arguments.length > 1) {
							args[0] = opts.data[rowEles.index(thisEle.closest("li.form__"))];
							retData.push(N.json.mapFromKeys.apply(N.json, args));
						} else {
							retData.push(opts.data[rowEles.index(thisEle.closest("li.form__"))]);
						}
					});
					return retData;
				} else {
					if(arguments.length > 1) {
						var args = Array.prototype.slice.call(arguments, 0);

						return opts.data.datafilter(function(data) {
							return data.rowStatus === rowStatus;
						}).map(function() {
							args[0] = this;
							return N.json.mapFromKeys.apply(N.json, args);
						}).get();
					} else {
						return opts.data.datafilter(function(data) {
							return data.rowStatus === rowStatus;
						}).get();
					}
				}
			},
			context : function(sel) {
				return sel !== undefined ? this.options.context.find(sel) : this.options.context;
			},
			contextBodyTemplate : function(sel) {
				return sel !== undefined ? this.tempRowEle.find(sel) : this.tempRowEle;
			},
			select : function(row, isAppend) {
				var opts = this.options;
				if(!opts.select && !opts.multiselect) {
					N.warn("[N.list.select]The \"select\" option value is false. please enable the select feature.");
					return false;
				}
				if(row === undefined) {
					var rowEles = this.contextEle.find(">li.form__");
					var rtnArr = rowEles.filter(".list_selected__").map(function() {
						return rowEles.index(this);
					}).get();
					return rtnArr;
				} else {
					if(N.type(row) !== "array") {
						row = [row];
					}

					var self = this;
					var selRowEle;

					if(!isAppend) {
						self.contextEle.find(">li.list_selected__").removeClass("list_selected__");
					}
					$(row).each(function() {
						selRowEle = self.contextEle.find(">li.form__").eq(this);
						if(selRowEle.hasClass("list_selected__")) {
							selRowEle.removeClass("list_selected__");
						}
						selRowEle.click();
					});

					if(opts.selectScroll) {
						scrollTop = (row[row.length - 1] * selRowEle.outerHeight()) - (opts.height / 2) + (selRowEle.outerHeight() / 2);
						if(scrollTop < 0) {
							scrollTop = 0;
						}
						opts.context.parent(".context_wrap__").stop().animate({ "scrollTop" : scrollTop }, 300, 'swing');						
					}

					return this;
				}
			},
			check : function(row, isAppend) {
				var opts = this.options;
				if(row === undefined) {
					var rowEles = this.contextEle.find(">li");
					var rtnArr = rowEles.find(opts.checkAllTarget||opts.checkSingleTarget).filter(":checked").map(function() {
						return rowEles.index(N(this).closest("li.form__"));
					}).get();
					return rtnArr;
				} else {
					if(N.type(row) !== "array") {
						row = [row];
					}

					var self = this;
					var checkboxEle;
					if(!isAppend) {
						self.contextEle.find(">li").find((opts.checkAllTarget||opts.checkSingleTarget) + ":checked").prop("checked", false);
					}
					$(row).each(function() {
						checkboxEle = self.contextEle.find(">li").find(opts.checkAllTarget||opts.checkSingleTarget).eq(this);
						if(checkboxEle.is(":checked")) {
							checkboxEle.prop("checked", false);
						}
						checkboxEle.click();
					});

					if(opts.checkScroll) {
						var selRowEle = checkboxEle.closest("li.form__");
						scrollTop = (row[row.length - 1] * selRowEle.outerHeight()) - (opts.height / 2) + (selRowEle.outerHeight() / 2);
						if(scrollTop < 0) {
							scrollTop = 0;
						}
						opts.context.parent(".context_wrap__").stop().animate({ "scrollTop" : scrollTop }, 300, 'swing');						
					}

					return this;
				}
			},
			/**
			 * callType arguments is call type about scrollPaging(internal) or data filter(internal) or data append(external)
			 * callType : "append", "list.bind"
			 */
			bind : function(data, callType) {
				var opts = this.options;

				if(!opts.isBinding) {
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

					if(opts.checkAll !== null) {
						$(opts.checkAll).prop("checked", false);
					}
					if (opts.data.length > 0 || (callType === "append" && data && data.length > 0)) {
						//clear li visual effect
						opts.context.find(">li").clearQueue().stop();

						if(callType !== "list.bind") {
							if(callType === "append" && data.length > 0) {
								opts.scrollPaging.idx = opts.data.length - data.length;
							} else {
								opts.scrollPaging.idx = 0;
							}
						}

						if(opts.scrollPaging.idx === 0) {
							//remove lis in list body area
							if(callType === "append" && data.length > 0) {
								opts.context.find(">li.empty__").remove();
							} else {
								opts.context.find(">li").remove();
							}
						}

						var i = opts.scrollPaging.idx;
						var limit;
						if(opts.height === 0 || opts.scrollPaging.size === 0 || (callType === "append" && data.length > 0 && data.length <= opts.scrollPaging.size)) {
							limit = opts.data.length;
						} else {
							limit = Math.min(opts.scrollPaging.limit, opts.data.length);
						}

						var delay = opts.createRowDelay;
						var lastIdx;

						UI.iteration.render.call(this, i, limit, delay, lastIdx, callType);

						if(opts.appendScroll && callType === "append") {
							opts.context.parent(".context_wrap__").stop().animate({
								"scrollTop" : opts.context.parent(".context_wrap__").prop("scrollHeight")
							}, 300, 'swing');
						}
					} else {
						//remove lis in list body area
						opts.context.find(">li").remove();
						opts.context.append('<li class="empty__">' +
								N.message.get(opts.message, "empty") + '</li>');
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
				if (opts.context.find(">li.empty__").length > 0) {
					opts.context.find(">li").remove();
				}
				var tempRowEleClone = this.tempRowEle.clone(true, true);

				if(N.isNumeric(data)) {
	        		row = data;
	        		data = undefined;
	        	}

				if(row > opts.data.length || row < 0) {
					row = undefined;
				}

				if(row === undefined) {
					if(opts.addTop) {
						opts.context.prepend(tempRowEleClone);
					} else {
						opts.context.append(tempRowEleClone);
					}
				} else {
					var selRowEle = opts.context.find(">li:eq(" + row + ")");
					var scrollTop;

					if(row === 0) {
						opts.context.prepend(tempRowEleClone);
					} else if(row === opts.context.find(">li").length) {
						selRowEle = opts.context.find(">li:eq(" + (row - 1) + ")");
					} else {
						opts.context.find(">li:eq(" + row + ")").before(tempRowEleClone);
					}

					if(opts.addScroll) {
						scrollTop = (row * selRowEle.outerHeight()) - (opts.height / 2) + (selRowEle.outerHeight() / 2);
						if(scrollTop < 0) {
							scrollTop = 0;
						}
						opts.context.parent(".context_wrap__").stop().animate({ "scrollTop" : scrollTop }, 300, 'swing', function() {
							if(opts.addSelect) {
								$(this).find(">ul>li:eq(" + row + ")").trigger("click.list");
							}
						});	
					} else {
						if(opts.addSelect) {
							setTimeout(function() {
								opts.context.parent(".context_wrap__").find(">ul>li:eq(" + row + ")").trigger("click.list");
							}, 0);
						}
					}
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
				})

				if(opts.rowHandlerBeforeBind !== null) {
					opts.rowHandlerBeforeBind.call(this, form.options.extRow, tempRowEleClone, data);
				}

				form.add(data, row);

				if(opts.rowHandler !== null) {
					opts.rowHandler.call(this, form.options.extRow, tempRowEleClone, form.data(true)[0]);
				}

				// unselect rows
				opts.context.find(">li").removeClass("list_selected__");

				// scroll to created row element
				if(row === undefined) {
					opts.context.parent(".context_wrap__").stop().animate({
						"scrollTop" : (opts.addTop ? 0 : opts.context.parent(".context_wrap__").prop("scrollHeight"))
					}, 300, 'swing', function() {
						if(opts.addSelect) {
							$(this).find("> ul > li:" + (opts.addTop ? "first" : "last")).trigger("click.list");
						}
					});
				}

				return this;
			},
			remove : function(row) {
				var opts = this.options;
				if(row !== undefined) {
					if(N.type(row) !== "array") {
						row = [row];
					}
					$(row.sort().reverse()).each(function(i, row) {
						if (opts.data[this] === undefined) {
							throw N.error("[N.list.prototype.remove]Row index is out of range");
						}
						if (opts.data[this].rowStatus === "insert") {
				            opts.data.splice(this, 1);
				            opts.context.find(">li:eq(" + row + ")").remove();
				            
				         	// for scroll paging
		        			// just +1 is inappropriate on android 4.4.2 webkit
		        			var rowEleLength = opts.context.find(">li").length;
		        			var pagingSize = opts.scrollPaging.size;
		        			var rest = rowEleLength % pagingSize;
		        			opts.scrollPaging.idx = parseInt(rowEleLength / pagingSize) * pagingSize - pagingSize + rest;
				        } else {
				        	opts.data[this].rowStatus = "delete";
				        	opts.context.find(">li:eq(" + row + ")").addClass("row_data_deleted__");
				        }
					});
				}

				N.ds.instance(this).notify();
				return this;
			},
			revert : function(row) {
				var opts = this.options;
				if(!opts.revert) {
					throw N.error("[N.form.prototype.revert]Can not revert. N.form's revert option value is false");
				}

				if(row !== undefined) {
					if(N.type(row) !== "array") {
						row = [row];
					}
					$(row).each(function() {
						opts.context.find(">li:eq(" + String(this) + ")").instance("form").revert();
					});
				} else {
					opts.context.find("li").instance("form", function(i) {
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
					valiRslt = opts.context.find(">li:eq(" + String(row) + ")").instance("form").validate();
				} else {
					var rowStatus;
					opts.context.find(">li").instance("form", function(i) {
						if(this.options !== undefined && this.options.data.length > 0) {
							rowStatus = this.options.data[0].rowStatus;
							// Select the rows that data was changed
							if(this.context(".validate_false__").length > 0 || rowStatus === "update" || rowStatus === "insert") {
								if(!this.validate()) {
									valiRslt = false;
								}
							}
						}
					});
				}

				if(!valiRslt && opts.validateScroll) {
					var valiLastTbody = opts.context.find(".validate_false__:last").closest("li.form__");
					opts.context.parent(".context_wrap__").stop().animate({
						"scrollTop" : opts.context.parent(".context_wrap__").scrollTop() + valiLastTbody.position().top - opts.height + (valiLastTbody.outerHeight() * 2)
					}, 300, 'swing');
				}

				return valiRslt;
			},
			val : function(row, key, val) {
				if(val === undefined) {
					return this.options.data[row][key];
				}
				this.options.context.find(">li:eq(" + String(row) + ")").instance("form").val(key, val);
				return this;
			},
			move : function(fromRow, toRow) {
				UI.iteration.move.call(this, fromRow, toRow, "list");

				return this;
			},
			copy : function(fromRow, toRow) {
				UI.iteration.copy.call(this, fromRow, toRow, "list");

				return this;
			},
			update : function(row, key) {
				if(row !== undefined) {
					if(key !== undefined) {
						this.options.context.find(">li:eq(" + String(row) + ")").instance("form").update(0, key);
					} else if(this.options.data[row]._isRevert !== true && this.options.data[row].rowStatus === "insert") {
						if(this.options.data[row].rowStatus === "insert") {
							this.bind(undefined, "list.update");
						} else {
							this.add(this.options.data[row]);
						}
					} else {
						this.options.context.find(">li:eq(" + String(row) + ")").instance("form").update(0);
					}
				} else {
					this.bind(undefined, "list.update");
				}
				return this;
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
				fixedcol : 0,
				more : false, // true or column names array
				validate : true,
				html : false,
				addTop : false,
				addSelect : false,
				filter : false,
				resizable : false,
				vResizable : false,
				sortable : false,
				windowScrollLock : true,
				select : false,
				selectWithCheck : false,
				unselect : true,
				multiselect : false,
				checkAll : null, // selector
				checkAllTarget : null, // selector
				checkSingleTarget : null, // selector
				checkWidthSelect : false,
				hover : false,
				revert : false,
				createRowDelay : 1,
				scrollPaging : {
					idx : 0,
					size : 100
				},
				fRules : null,
				vRules : null,
				appendScroll : true,
				addScroll : true,
				selectScroll : true,
				checkScroll : true,
				validateScroll : true,
				rowHandlerBeforeBind : null,
				rowHandler : null,
				onSelect : null,
				onBind : null,
				misc : {
					withoutTbodyLength : 0, // garbage rows count in table -> Deprecated.
					resizableCorrectionWidth : 0,
					resizableLastCellCorrectionWidth : 0,
					resizeBarCorrectionLeft : 0,
					resizeBarCorrectionHeight : 0,
					fixedcolHeadMarginTop : 0,
					fixedcolHeadMarginLeft : 0,
					fixedcolHeadHeight : 0,
					fixedcolBodyMarginTop : 0,
					fixedcolBodyMarginLeft : 0,
					fixedcolBodyBindHeight : 0,
					fixedcolBodyAddHeight : 1,
					fixedcolRootContainer : null // for mobile browser, input selector string
				},
				currMoveToRow : -1
			};

			try {
				$.extend(true, this.options, N.context.attr("ui").grid);
			} catch (e) {
				throw N.error("[N.grid]" + e, e);
			}

			if (N.isPlainObject(opts)) {
				//convert data to wrapped set
				opts.data = N.type(opts.data) === "array" ? N(opts.data) : opts.data;

				$.extend(true, this.options, opts);

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

			// set selectable
			if(this.options.select || this.options.multiselect) {
				UI.iteration.select.call(this, "grid");
			}

			//remove colgroup when the resizable option is true
			if(this.options.resizable) {
				Grid.removeColgroup.call(this);
			}

			// view details
			if(this.options.more) {
				Grid.more.call(this);
			}
			
			// fixed header
			if(this.options.height > 0) {
				// fixed header
				Grid.fixHeader.call(this);
			}

			// create table cell element map
			this.tableMap = Grid.tableMap.call(this);

			// set tbody cell's id attribute into th cell in thead
			Grid.setTheadCellInfo.call(this);
			
			// set this.thead
			if (this.options.height > 0) {
				this.thead = this.options.context.closest(".grid_wrap__").find(">.thead_wrap__>table>thead");
	        } else {
	        	this.thead = this.options.context.find(">thead");
	        }

			// fixed column
			if(this.options.height === 0) {
				Grid.fixColumn.call(this);
			}

			// set context element
			this.contextEle = this.options.context;
			if(this.options.height > 0) {
				this.contextEle = this.options.context.closest("div.tbody_wrap__ > .grid__");
        	}

			// set rowspan column info
			this.rowSpanIds = this.thead.find("th:regexp(data:rowspan,true)").map(function() {
				return $(this).data("id");
			});

			// set function for check all checkbox in list
			if(this.options.checkAll !== null && this.options.checkAllTarget !== null) {
				UI.iteration.checkAll.call(this, "grid");
			} else {
				if(this.options.checkSingleTarget !== null) {
					// set function for check single checkbox in list
					UI.iteration.checkSingle.call(this, "grid");
				}
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
			/**
			 * Convert HTML Table To 2D Array
			 * Reference from CHRIS WEST'S BLOG : http://cwestblog.com/2016/08/21/javascript-snippet-convert-html-table-to-2d-array/
			 */
			tableCells : function(tbl, opt_cellValueGetter) {
				var rows = tbl.find(">tr");
				opt_cellValueGetter = opt_cellValueGetter || function(td) { return td.textContent || td.innerText; };
				var twoD = [];
				for (var rowCount = rows.length, rowIndex = 0; rowIndex < rowCount; rowIndex++) {
					twoD.push([]);
				}
				for (var rowIndex = 0, tr; rowIndex < rowCount; rowIndex++) {
					var tr = rows[rowIndex];
					for (var colIndex = 0, colCount = tr.cells.length, offset = 0; colIndex < colCount; colIndex++) {
						var td = tr.cells[colIndex], text = opt_cellValueGetter(td, colIndex, rowIndex, tbl);
						while (twoD[rowIndex].hasOwnProperty(colIndex + offset)) {
							offset++;
						}
						for (var i = 0, colSpan = parseInt(td.colSpan, 10) || 1; i < colSpan; i++) {
							for (var j = 0, rowSpan = parseInt(td.rowSpan, 10) || 1; j < rowSpan; j++) {
								$(td).addClass("col_" + (colIndex + offset + i) + "__");
								if(twoD[rowIndex + j] !== undefined) {
									twoD[rowIndex + j][colIndex + offset + i] = td;
								} else {
									N.warn("[N.grid.tableCells]The rowspan property of table is defined incorrectly.");
								}
							}
						}
					}
				}
				return twoD;
			},
			tableMap : function() {
				var opts = this.options;
				
				var colgroup = [];
				var thead;
				var tfoot;
				
				if(opts.context.find("> colgroup").length > 0) {
					colgroup.push(opts.context.find("> colgroup > col").each(function(i) {
						$(this).addClass("col_" + String(i) + "__");
					}).get());					
				}
				
				if(opts.height > 0) {
					if(opts.context.find("> colgroup").length > 0) {
						colgroup.unshift(opts.context.closest(".grid_wrap__").find(">.thead_wrap__>table>colgroup>col").each(function(i) {
	    					$(this).addClass("col_" + String(i) + "__");
	    				}).get());
						colgroup.push(opts.context.closest(".grid_wrap__").find(">.tfoot_wrap__>table>colgroup>col").each(function(i) {
	    					$(this).addClass("col_" + String(i) + "__");
	    				}).get());
					}
					thead = Grid.tableCells(opts.context.closest(".grid_wrap__").find(">.thead_wrap__>table>thead"));
					thead = thead.concat(Grid.tableCells(opts.context.closest(".grid_wrap__").find("> .tbody_wrap__>table>thead")));
					tfoot = Grid.tableCells(opts.context.closest(".grid_wrap__").find(">.tfoot_wrap__>table>tfoot"));
				} else {
					thead = Grid.tableCells(opts.context.find("> thead"));
					tfoot = Grid.tableCells(opts.context.find("> tfoot"));
				}
				
    			return {
    				colgroup : colgroup,
    				thead : thead,
    				tbody : Grid.tableCells(this.tempRowEle),
    				tfoot : tfoot
    			};
			},
        	setTheadCellInfo : function() {
        		var opts = this.options;
        		var tableMap = this.tableMap;
        		if(tableMap.thead.length === 0) {
        			return;
        		}
        		var nextCnt = 0;
        		$(tableMap.tbody).each(function(i, cells) {
        			$(cells).each(function(j, cell) {
        				if(tableMap.thead[i+nextCnt] === undefined || tableMap.thead[i+nextCnt][j] === undefined) {
        					return false;
        				}
        				var theadCell = $(tableMap.thead[i+nextCnt][j]);
        				var tbodyCell = $(cell);
        				if(tbodyCell.attr("colspan") === theadCell.attr("colspan")) {
        					var id = tbodyCell.attr("id");
            				if(id === undefined) {
            					id = tbodyCell.find("[id]").attr("id");
            				}
            				if(id !== undefined) {
            					theadCell.data("id", id);
            				}
        				} else {
        					nextCnt++;
        					return true;
        				}
        			});
        		});
        	},
			removeColgroup : function() {
				var opts = this.options;
				if(opts.context.find("colgroup").length > 0) {
					var theadMap = Grid.tableCells(opts.context.find("> thead"));
					if(opts.height > 0) {
						var tfootMap = Grid.tableCells(opts.context.find("> tfoot"));						
					}
					
					opts.context.find("colgroup>col").each(function(i, colEle) {
						$(theadMap).each(function(j, rowEles) {
							if($(rowEles[i]).attr("colspan") === undefined) {
								$(rowEles[i]).css("width", colEle.style.width).removeAttr("scope");
							}
						})
						
						if(opts.height > 0) {
							$(tfootMap).each(function(j, rowEles) {
								if($(rowEles[i]).attr("colspan") === undefined) {
									$(rowEles[i]).css("width", colEle.style.width).removeAttr("scope");
								}
							})	
						}
					}).parent().remove();
					this.options.misc.withoutTbodyLength -= 1;
				}
			},
			fixColumn : function() {
				var opts = this.options;
				var self = this;

				if(opts.fixedcol > 0) {
					opts.context.width("auto").css({
						"table-layout" : "fixed",
						"width" : self.thead.find("> tr > th").toArray().splice(opts.fixedcol).reduce(function(sum, ele) {
							return sum + parseInt(window.getComputedStyle(ele,null).getPropertyValue("width"));
						}, 0)
					});

					var gridWrap = opts.context.wrap($("<div/>", {
						"css" : { "overflow-x" : (N.browser.is("ios") ? "scroll" : "auto") },
						"class" : "grid_wrap__"
					})).parent("div");

					var gridContainer = gridWrap.wrap($("<div/>", {
						"class" : "grid_container__"
					})).parent("div");

					if(opts.misc.fixedcolRootContainer === null) {
						gridContainer.css("position", "relative");						
					} else {
						opts.context.closest(opts.misc.fixedcolRootContainer).css("position", "relative");
					}

					var theadTrHeight = self.thead.find("> tr").height();
					self.thead.find("> tr").height(theadTrHeight);

					var cellLeft = 0;
					var leftMargin = 0;
					for(var i=0;i<opts.fixedcol;i++) {
						var targetTheadCellEle;
						var targetTbodyCellEle;

						targetTheadCellEle = $(self.tableMap.thead).map(function() {
							return this[i];
						}).addClass("grid_head_fixed__");
						targetTbodyCellEle = $(self.tableMap.tbody).map(function() {
							return this[i];
						}).addClass("grid_body_fixed__");

						var cellWidth = targetTheadCellEle.outerWidth();
						var borderLeftWidth = parseInt(targetTheadCellEle.css("border-left-width"));
						var theadBorderTopWidth = parseInt(targetTheadCellEle.css("border-top-width"));
						leftMargin += (cellWidth - borderLeftWidth + opts.misc.fixedcolHeadMarginLeft);

						targetTheadCellEle.css({
							"position" : "absolute",
							"margin-top" : (-theadBorderTopWidth + opts.misc.fixedcolHeadMarginTop) + "px",
							"box-sizing" : "border-box",
							"width" : cellWidth + "px",
							"height" : (theadTrHeight + theadBorderTopWidth + opts.misc.fixedcolHeadHeight) + "px"
						});
						targetTbodyCellEle.css({
							"position" : "absolute",
							"margin-top" : opts.misc.fixedcolBodyMarginTop + "px",
							"box-sizing" : "border-box",
							"width" : cellWidth + "px"
						});

						if(targetTheadCellEle.prev().length > 0) {
							cellLeft += targetTheadCellEle.prev().outerWidth() - borderLeftWidth + opts.misc.fixedcolBodyMarginLeft;
						}

						targetTheadCellEle.css({
							"left" : cellLeft + "px"
						});
						targetTbodyCellEle.css({
							"left" : cellLeft + "px"
						});

						// remove colgroup's first col elements width
						if(self.tableMap.colgroup.length > 0) {
							$(self.tableMap.colgroup).each(function() {
								if(i === 0) {
									$(this[i]).width(0);
								} else {
									$(this[i]).hide();
								}
							});
						}
					}
					
					gridWrap.css("margin-left", leftMargin);
				}
			},
			fixHeader : function() {
				var opts = this.options;

				opts.context.css({
					"table-layout" : "fixed",
					"margin" : "0"
				});

		        var sampleCell = opts.context.find(">tbody td:eq(0)");
		        var borderLeft = sampleCell.css("border-left-width") + " " + sampleCell.css("border-left-style") + " " + sampleCell.css("border-left-color");
		        var borderBottom = sampleCell.css("border-bottom-width") + " " + sampleCell.css("border-bottom-style") + " " + sampleCell.css("border-bottom-color");

		        // Root grid container
		        var gridWrap = opts.context.wrap('<div class="grid_wrap__"/>').parent();
		        gridWrap.css({
		        	"border-left" : borderLeft
		        });

		        //Create grid header
		        var scrollbarWidth = N.browser.scrollbarWidth();
		        var contextClone = opts.context.clone(true, true);
		        var theadClone = opts.context.find("> thead").clone();
		        contextClone.find(">thead").remove();
		        contextClone.find(">tbody").remove();
		        contextClone.find(">tfoot").remove();
		        contextClone.append(opts.context.find("> thead"));
		        var theadWrap = contextClone.wrap('<div class="thead_wrap__"/>').parent().css({
		        	"padding-right" : scrollbarWidth + "px",
		        	"margin-left" : "-1px"
		        });
		        gridWrap.prepend(theadWrap);

		        opts.context.append(theadClone);
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
		        var contextWrapEle = opts.context.wrap('<div class="tbody_wrap__"/>').parent().css({
		        	"height" : String(opts.height) + "px",
		        	"overflow-y" : "scroll",
		        	"overflow-x" : "hidden",
		        	"margin-left" : "-1px",
		        	"border-bottom" : borderBottom
		        });

		        // for IE
		        if(N.browser.is("ie")) {
		        	contextWrapEle.css("overflow-x", "hidden");
		        }

		        if(opts.windowScrollLock) {
		        	N.event.windowScrollLock(contextWrapEle);
		        }

		        // Scroll paging
		        var self = this;
		        var defSPSize = opts.scrollPaging.limit;
		        var rowEleLength;
		        UI.scroll.paging.call(self, contextWrapEle, defSPSize, rowEleLength, "> tbody", "grid.bind");

		        // Create grid footer
		        var tfootWrap;
		        if(opts.context.find("> tfoot").length > 0) {
		        	var contextClone = opts.context.clone(true, true);
		        	contextClone.find(">thead").remove();
		        	contextClone.find(">tbody").remove();
		        	contextClone.find(">tfoot").remove();
		        	contextClone.append(opts.context.find("> tfoot"));
			        tfootWrap = contextClone.wrap('<div class="tfoot_wrap__"/>').parent().css({
			        	"padding-right" : scrollbarWidth + "px",
			        	"margin-left" : "-1px"
			        });
			        gridWrap.append(tfootWrap);
		        }

		        // Vertical height resizing
		        if(opts.vResizable) {
		        	Grid.vResize.call(this, gridWrap, contextWrapEle, tfootWrap);
		        }
			},
			vResize : function(gridWrap, contextWrapEle, tfootWrap) {
        		var pressed = false;
	        	var vResizable = $('<div class="v_resizable__" align="center"></div>');
	        	vResizable.css("cursor", "n-resize");
	        	vResizable.css("margin-bottom", gridWrap.css("margin-bottom"));
	        	gridWrap.css("margin-bottom", "0");

	        	var currHeight, contextWrapOffset, tfootHeight = 0;
	        	var eventNameSpace = ".grid.vResize";
	        	UI.draggable.events.call(vResizable, eventNameSpace, function(e, tabContainerEle_, pageX, pageY) { // start
	        		if(tfootWrap !== undefined) {
        				tfootHeight = tfootWrap.height();
        			}
        			contextWrapOffset = contextWrapEle.offset();
				}, function(e, tabContainerEle_, pageX, pageY) { // move
					currHeight = (pageY - contextWrapOffset.top - tfootHeight) + "px";
					contextWrapEle.css({
						"height" : currHeight,
						"max-height" : currHeight
					});
				});

	        	vResizable.bind("mousedown.grid.vResize touchstart.grid.vResize", function(e) {
					if(e.originalEvent.touches) {
						e.preventDefault();
						e.stopPropagation();
					}

	        		if(e.originalEvent.touches || (e.which || e.button) === 1) {


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
	        					currHeight = ((mte !== undefined ? mte.pageY : e.pageY) - contextWrapOffset.top - tfootHeight) + "px";
	        					contextWrapEle.css({
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
        	more : function() {
        		var opts = this.options;
        		var self = this;

        		if(opts.more === true) {
        			opts.more = self.tempRowEle.find("[id]").map(function() {
        				return $(this).attr("id");
        			}).get();
        		}

        		
        		// Append col element to colgroup
        		if(opts.context.find("> colgroup").length > 0) {
        			opts.context.find("> colgroup").append('<col class="grid_more_colgroup_col__">')
        		}
        		
        		// Column for hide and show button.
        		var theadCol;
        		var theadRowCnt = Grid.tableCells(opts.context.find(">thead")).length;
        		if(theadRowCnt > 0) {
        			theadCol = $('<th></th>').addClass("grid_more_thead_col__");
        			if(theadRowCnt > 1) {
        				theadCol.attr("rowspan", String(theadRowCnt));
        			}
        		}
        		// Hide and show button.
				var colShowHideBtn = $('<a href="#" title="' + N.message.get(opts.message, "showHide") + '"><span></span></a>').addClass("grid_col_show_hide_btn__").appendTo(theadCol);
				// Append column to tr in thead
				if(theadCol !== undefined) {
					opts.context.find(">thead > tr:first").append(theadCol);
				}
				
        		// Column for detail popup button.
				var tbodyCol;
        		var tbodyRowCnt = Grid.tableCells(this.tempRowEle).length;
        		if(tbodyRowCnt > 0) {
        			tbodyCol = $('<td></td>').addClass("grid_more_tbody_col__");
        			if(tbodyRowCnt > 1) {
        				tbodyCol.attr("rowspan", String(tbodyRowCnt));
        			}
        		}
        		// Detail popup button. 
        		var detailBtn = $('<a href="#" title="' + N.message.get(opts.message, "more") + '"><span></span></a>').addClass("grid_more_btn__").appendTo(tbodyCol);
        		// Append column to tr in tbody
        		if(tbodyCol !== undefined) {
					self.tempRowEle.find("> tr:first").append(tbodyCol);
				}

        		// Empty column in tfoot
        		var tfootCol;
        		var tfootRowCnt = Grid.tableCells(opts.context.find(">tfoot")).length;
        		if(tfootRowCnt > 0) {
        			tfootCol = $('<td></td>').addClass("grid_more_tfoot_col__")
        			if(tfootRowCnt > 1) {
        				tfootCol.attr("rowspan", String(tfootRowCnt));
        			}
        		}
        		// Append column to tr in tfoot
				if(tfootCol !== undefined) {
					opts.context.find(">tfoot > tr:first").append(tfootCol);
				}

        		var excludeThClasses = ".btn_data_filter_full__, .data_filter_panel__, .btn_data_filter__, .resize_bar__, .sortable__";

        		// Hide and show panel
    			var panel = $('<div class="grid_more_panel__ hidden__">'
						+ 	'<div class="grid_more_checkall_box__"><label><input type="checkbox">' + N.message.get(opts.message, "selectAll") + '<span class="grid_more_total_cnt__"></span></label></div>'
						+ 	'<ul class="grid_more_col_list__"></ul>'
						+ '</div>');
        		colShowHideBtn.after(panel);

        		var gridMoreColList;

        		// Hide and show panel's checkbox click event
        		panel.find(".grid_more_checkall_box__ :checkbox").bind("click.grid.more", function() {
        			var thisEle = $(this);
					if(thisEle.is(":checked")) {
						gridMoreColList.find("input[name='hideshow']:not(':checked')").click();
					} else {
						gridMoreColList.find("input[name='hideshow']:checked").click();
					}
        		});
    			panel.css("position", "absolute");

    			var calibDialogItems = function(currColShowHideBtn, currPanel) {
					currPanel.css({
						"left" : (currColShowHideBtn.position().left - currPanel.outerWidth() + currColShowHideBtn.outerWidth()) + "px"
					});
	    			if(gridMoreColList.find("input[name='hideshow']").length === gridMoreColList.find("input[name='hideshow']:checked").length) {
						currPanel.find(".grid_more_checkall_box__ :checkbox").prop("checked", true);
					} else {
						currPanel.find(".grid_more_checkall_box__ :checkbox").prop("checked", false);
					}
				};

				// Hide and show button event.
        		colShowHideBtn.bind("click.grid.more", function(e) {
					e.preventDefault();
					e.stopPropagation();
					e.stopImmediatePropagation();

					var thisBtn = $(this);
					var panel = thisBtn.next(".grid_more_panel__ ");

					if(self.tableMap.thead.length > 0 && gridMoreColList === undefined) {
		    			gridMoreColList = panel.find(".grid_more_col_list__");
		    			$(self.tableMap.thead[0]).each(function(i) {
		    				var thisEleClone = $(this).clone();
		    				if(!thisEleClone.hasClass("grid_more_thead_col__")) {
		    					thisEleClone.find(excludeThClasses).remove();
			    				var cols = $('<li class="grid_more_cols__" title="' + String(i+1) + '">'
									+ '<label><input name="hideshow" type="checkbox" checked="checked" value="' + String(i) + '">'
									+ String(i+1) + " " + N.message.get(opts.message, "column") + '</label></li>')
									.appendTo(gridMoreColList)
									.find("input[name='hideshow']").bind("click.grid.more", function() {
										var thisEle = $(this);
										if(!thisEle.is(":checked")) {
											self.hide(parseInt(thisEle.val()));
										} else {
											self.show(parseInt(thisEle.val()));
										}
										calibDialogItems(thisBtn, panel);
									});
		    				}
		    			});

		    			calibDialogItems(thisBtn, panel);
					}

					$(document).unbind("click.grid.more");
					$(document).bind("click.grid.more", function(e) {
						if($(e.target).parents(".grid_more_panel__, .grid_col_show_hide_btn__").length === 0 && !$(e.target).hasClass("grid_col_show_hide_btn__")) {
							panel.removeClass("visible__").addClass("hidden__");
							panel.one(N.event.whichTransitionEvent(panel), function(){
								panel.hide();

								// The touchstart event is not removed when using the one method
								$(document).unbind("click.grid.more touchstart.grid.more");
					        }).trigger("nothing");
						}
					});

					panel.show(0, function() {
						$(this).removeClass("hidden__").addClass("visible__");
					});
        		});

        		// Detail popup button event.
				detailBtn.bind("click.grid.more", function(e) {
					e.preventDefault();
					e.stopPropagation();
					e.stopImmediatePropagation();
					
					var rowIdx = opts.context.find(">tbody").index($(this).closest("tbody.form__"));

					var morePopupContects = $("<div></div>").addClass("grid_more_popup_contents__");
					var moreContents = $("<div></div>").addClass("grid_more_contents__").appendTo(morePopupContects).css({
						"overflow-y" : "auto",
						"max-height" : ($(window).height() - 200) + "px"
					});
					var table = $("<table></table>").appendTo(moreContents);
					var tbody = $("<tbody></tbody>").appendTo(table);
					$(opts.more).each(function() {
						var tr = $("<tr></tr>").appendTo(tbody);
						var filteredThClone = self.thead.find(">tr > th:regexp(data:id, " + this + ")").clone();
						filteredThClone.find(excludeThClasses).remove();
						filteredThClone.removeAttr("rowspan").removeAttr("colspan");
						var th = $("<th></th>", {
							text : filteredThClone.text()
						}).appendTo(tr);

						var td = opts.context.find(">tbody:eq(" + rowIdx + ") #" + this);
						if(td.is("td")) {
							td.clone().removeAttr("rowspan").removeAttr("colspan").removeAttr("class").removeAttr("style").appendTo(tr);
						} else {
							if(td.hasClass("datepicker__")) {
								td.next(".datepicker_contents__").remove(); 
							}
							
							var tdClone = td.closest("td").clone();
							tdClone.find(".datepicker__").removeClass("datepicker__");
							
							tdClone.removeAttr("rowspan").removeAttr("colspan").removeAttr("class").removeAttr("style").appendTo(tr);
						}
					});

					var form = opts.data.form(moreContents).unbind().bind(rowIdx);

					var btnBox = $('<div class="btn_box__"></div>').appendTo(morePopupContects);
					var prevBtn = $('<a href="#" class="prev_btn__">' + N.message.get(opts.message, "prev") + '</a>').bind("click.grid.more", function(e) {
						e.preventDefault();

						if(rowIdx > 0 && form.validate()) {
							rowIdx -= 1;
							form.bind(rowIdx);
							page.text(String(rowIdx + 1));
						}
					}).appendTo(btnBox);
					var page = $('<span class="page__">' + String(rowIdx + 1) +'</span>').appendTo(btnBox);
					var nextBtn = $('<a href="#" class="next_btn__">' + N.message.get(opts.message, "next") + '</a>').bind("click.grid.more", function(e) {
						e.preventDefault();

						if(rowIdx + 1 < form.data().length && form.validate()) {
							rowIdx += 1;
							form.bind(rowIdx);
							page.text(String(rowIdx + 1));
						}
					}).appendTo(btnBox);

					morePopupContects.popup({
						title : "데이터 상세 조회",
						closeMode : "remove",
						button : false,
						draggable : true,
						alwaysOnTop : true,
						onCancel : function() {
							if(!form.validate()) {
								return 0;
							};
						}
					}).open();
				});
        	},
        	resize : function() {
        		var self = this;
// TODO colgroup  
//        		var tableMap = this.tableMap;
      		
//        		if(tableMap.colgroup.length > 0) {
        			/*
        			N.ui.draggable.events.call(docsTabs, ".docs.scroll", function(e, ele, x, y) { // start

					}, function(e, ele, x, y) { // move
						N.ui.draggable.moveX.call(ele, x);
					}, function(e, ele) { //end
						
					});
					*/
//        		} else {
        			var resizeBar, currResizeBar, resizeBarHeight, cellEle, currCellEle, currNextCellEle, targetCellEle, targetNextCellEle,
        			targetTfootCellEle, targetNextTfootCellEle, currResizeBarEle,
					defWidth, nextDefWidth, currWidth, nextCurrWidth, startOffsetX,
					minPx, maxPx, defPx, movedPx;

					var opts = this.options;
					var theadCells = this.thead.find("> tr th:not(.grid_head_fixed__)");
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
						resizeBarHeight = (opts.height > 0 ? self.contextEle.closest(".grid_wrap__").height() - 3 : self.contextEle.height() + resizeBarCorrectionHeight) + 1 + opts.misc.resizeBarCorrectionHeight;
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
			            		currNextCellEle = currCellEle.next();
			            		var islast = false;
			            		if(currNextCellEle.length === 0) {
			            			currNextCellEle = context;
			            			islast = true;
			            		}
	
			            		if(opts.height > 0) {
			            			targetCellEle = opts.context.find("thead th:eq(" + theadCells.index(currCellEle) + ")");
			            			targetNextCellEle = targetCellEle.next();
			            			if(opts.height > 0 && opts.context.parent().parent(".grid_wrap__").find("tfoot").length > 0) {
			            				targetTfootCellEle = opts.context.parent().parent(".grid_wrap__").find("tfoot > tr > td:eq(" + theadCells.index(currCellEle) + ")");
				            			targetNextTfootCellEle = targetTfootCellEle.next();
			            			}
			            		}
			            		// Convert flexible cell width to absolute cell width when the clicked resizeBar is last last resizeBar
			            		if(isFirstTimeLastClick && islast) {
			            			theadCells.each(function(i) {
		            					$(this).width(Math.floor($(this).width()) + (opts.height > 0 ? opts.misc.resizableLastCellCorrectionWidth : 0) + opts.misc.resizableCorrectionWidth).removeAttr("width");
	
		            					if(targetCellEle !== undefined) {
		            						opts.context.find("thead th:eq(" + theadCells.index(this) + ")").width(Math.floor($(this).width()) + opts.misc.resizableCorrectionWidth).removeAttr("width");
		            					}
		            					if(opts.height > 0 && targetTfootCellEle !== undefined) {
		            						opts.context.parent().parent(".grid_wrap__").find("tfoot > tr > td:eq(" + theadCells.index(this) + ")").width(Math.floor($(this).width()) + opts.misc.resizableCorrectionWidth).removeAttr("width");
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
			            						if(targetTfootCellEle !== undefined) {
			            							targetTfootCellEle.css("width", currWidth + "px");
			            							targetNextTfootCellEle.css("width", nextCurrWidth + "px");
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
//        		}
			},
        	sort : function() {
    	        var opts = this.options;
    	        var thead = this.thead;

    	        var theadCells = thead.find(">tr>th:not(.grid_more_thead_col__)");
    	        theadCells.css("cursor", "pointer");
    	        var self = this;
    	        theadCells.filter(function(i, cell) {
    	        	return $(cell).data("id") !== undefined;
    	        }).bind("click.grid.sort", function(e) {
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
    	                    	theadCells.find(".sortable__").remove();
    	                    	currEle.append('<span class="sortable__ desc__">' + opts.sortableItem.asc + '</span>');
    	                    } else {
    	                    	self.bind(N(opts.data).datasort($(this).data("id")), "grid.sort");
    	                    	theadCells.find(".sortable__").remove();
    	                    	currEle.append('<span class="sortable__ asc__">' + opts.sortableItem.desc + '</span>');
    	                    }
    	        		}
    	        	}
    	        });
        	},
			dataFilter : function() {
				var opts = this.options;
				var thead = this.thead;
				var theadCells = thead.find("> tr th").filter(function(i, cell) {
    	        	return $(cell).data("id") !== undefined;
    	        });
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
							var eventNm = N.event.whichTransitionEvent(visiblePanel);
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

						$(document).unbind("click.grid.dataFilter");
						$(document).one("click.grid.dataFilter", function(e) {
							if($(e.target).closest(".data_filter_panel__, .btn_data_filter__").length === 0 && !$(e.target).hasClass("btn_data_filter__")) {
								var panel = thead.find(".data_filter_panel__.visible__");
								if(panel.length > 0) {
									panel.removeClass("visible__").addClass("hidden__");
									var eventNm = N.event.whichTransitionEvent(panel);
									panel.unbind(eventNm);
									panel.one(eventNm, function(e){
						            	$(this).hide();

						            	// The touchstart event is not removed when using the one method
										$(document).unbind("touchstart.grid.dataFilter");
							        }).trigger("nothing");
								}
							}
						});

						bfrSelId = id;
					}).prependTo(theadCells.filter("[data-filter='true']:not(.grid_more_thead_col__)"));
			},
			rowSpan : function(i, rowEle, bfRowEle, rowData, bfRowData, colId) {
				var opts = this.options;
				if(bfRowData !== undefined && rowData[colId] === bfRowData[colId]) {
					var bfRowCell = bfRowEle.find("#" + colId + ", .grid_rowspan__").closest("td");
					var prevColId = this.thead.find("th:eq(" + bfRowEle.find("> tr > td").index(bfRowCell.prev("td")) + ")").data("id");

					if((this.rowSpanIds.get().join("|") + "|").indexOf(prevColId) < 0 || bfRowCell.prev("td").hasClass("grid_rowspan__")) {
						var cell = rowEle.find("#" + colId).closest("td");
						var bfCellBgColor = bfRowCell.css("background-color");
						if(bfCellBgColor === "rgba(0, 0, 0, 0)" || bfCellBgColor === "transparent") {
							bfCellBgColor = bfRowCell.parent().css("background-color");
						}
						if(bfCellBgColor === "rgba(0, 0, 0, 0)" || bfCellBgColor === "transparent") {
							bfCellBgColor = bfRowCell.parent().parent().css("background-color");
						}

						bfRowCell.css("border-bottom-color", bfCellBgColor);

						bfRowCell.css("background-color", bfCellBgColor);
						cell.css("background-color", bfCellBgColor);

						bfRowCell.addClass("grid_rowspan__");

						var cldr = cell.children();
						if(cldr.length > 0) {
							cldr.hide();
						} else {
							cell.empty();
						}
					}
				}
		    }
		});

		$.extend(Grid.prototype, {
			data : function(rowStatus) { // key name : argument1, argument2... argumentN
				var opts = this.options;

				if(rowStatus === undefined) {
					return opts.data.get();
				} else if(rowStatus === false) {
					return opts.data;
				} else if(rowStatus === "modified") {
					return opts.data.datafilter(function(data) {
						return data.rowStatus !== undefined;
					}).get();
				} else if(rowStatus === "selected") {
					if(opts.select || opts.multiselect) {
						var retData = [];

						// clone arguments
						var args = Array.prototype.slice.call(arguments, 0);

						var rowEles = this.contextEle.find(">tbody.form__");
						rowEles.filter(".grid_selected__").each(function() {
							var thisEle = N(this);
							if(arguments.length > 1) {
								args[0] = opts.data[rowEles.index(this)];
								retData.push(N.json.mapFromKeys.apply(N.json, args));
							} else {
								retData.push(opts.data[rowEles.index(this)]);
							}
						});
						return retData;
					}
				} else if(rowStatus === "checked") {
					var opts = opts;
					var retData = [];

					// clone arguments
					var args = Array.prototype.slice.call(arguments, 0);

					var rowEles = this.contextEle.find(">tbody.form__");
					rowEles.find(opts.checkAllTarget||opts.checkSingleTarget).filter(":checked").each(function() {
						var thisEle = N(this);
						if(arguments.length > 1) {
							args[0] = opts.data[rowEles.index(thisEle.closest("tbody.form__"))];
							retData.push(N.json.mapFromKeys.apply(N.json, args));
						} else {
							retData.push(opts.data[rowEles.index(thisEle.closest("tbody.form__"))]);
						}
					});
					return retData;
				} else {
					if(arguments.length > 1) {
						var args = Array.prototype.slice.call(arguments, 0);

						return opts.data.datafilter(function(data) {
							return data.rowStatus === rowStatus;
						}).map(function() {
							args[0] = this;
							return N.json.mapFromKeys.apply(N.json, args);
						}).get();
					} else {
						return opts.data.datafilter(function(data) {
							return data.rowStatus === rowStatus;
						}).get();
					}
				}
			},
			context : function(sel) {
				return sel !== undefined ? this.options.context.find(sel) : this.options.context;
			},
			contextHead : function(sel) {
				return sel !== undefined ? this.thead.find(sel) : this.thead;
			},
			contextBodyTemplate : function(sel) {
				return sel !== undefined ? this.tempRowEle.find(sel) : this.tempRowEle;
			},
			select : function(row, isAppend) {
				var opts = this.options;
				if(!opts.select && !opts.multiselect) {
					N.warn("[N.list.select]The \"select\" option value is false. please enable the select feature.");
					return false;
				}
				if(row === undefined) {
					var rowEles = this.contextEle.find(">tbody.form__");
					var rtnArr = rowEles.filter(".grid_selected__").map(function() {
						return rowEles.index(this);
					}).get();
					return rtnArr;
				} else {
					if(N.type(row) !== "array") {
						row = [row];
					}

					var self = this;
					var selRowEle;

					if(!isAppend) {
						self.contextEle.find(">tbody.grid_selected__").removeClass("grid_selected__");
					}
					$(row).each(function() {
						selRowEle = self.contextEle.find(">tbody.form__").eq(this);
						if(selRowEle.hasClass("grid_selected__")) {
							selRowEle.removeClass("grid_selected__");
						}
						selRowEle.click();
					});

					if(opts.selectScroll) {
						scrollTop = (row[row.length - 1] * selRowEle.outerHeight()) - (opts.height / 2) + (selRowEle.outerHeight() / 2);
						if(scrollTop < 0) {
							scrollTop = 0;
						}
						opts.context.parent(".tbody_wrap__").stop().animate({ "scrollTop" : scrollTop }, 300, 'swing');						
					}

					return this;
				}
			},
			check : function(row, isAppend) {
				var opts = this.options;
				if(row === undefined) {
					var rowEles = this.contextEle.find(">tbody.form__");
					var rtnArr = rowEles.find(opts.checkAllTarget||opts.checkSingleTarget).filter(":checked").map(function() {
						return rowEles.index(N(this).closest("tbody.form__"));
					}).get();
					return rtnArr;
				} else {
					if(N.type(row) !== "array") {
						row = [row];
					}

					var self = this;
					var checkboxEle;
					if(!isAppend) {
						self.contextEle.find(">tbody").find((opts.checkAllTarget||opts.checkSingleTarget) + ":checked").prop("checked", false);
					}
					$(row).each(function() {
						checkboxEle = self.contextEle.find(">tbody").find(opts.checkAllTarget||opts.checkSingleTarget).eq(this);
						if(checkboxEle.is(":checked")) {
							checkboxEle.prop("checked", false);
						}
						checkboxEle.click();
					});

					if(opts.checkScroll) {
						var selRowEle = checkboxEle.closest("tbody.form__");
						scrollTop = (row[row.length - 1] * selRowEle.outerHeight()) - (opts.height / 2) + (selRowEle.outerHeight() / 2);
						if(scrollTop < 0) {
							scrollTop = 0;
						}
						opts.context.parent(".tbody_wrap__").stop().animate({ "scrollTop" : scrollTop }, 300, 'swing');						
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
				// remove all sort status
				if(opts.sortable && callType !== "grid.sort") {
					this.thead.find(".sortable__").remove();
				}
				if(!opts.isBinding) {
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
						opts.context.find(">tbody").clearQueue().stop();
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
								opts.context.find(">tbody>tr>td.empty__").parent().parent().remove();
							} else {
								opts.context.find(">tbody").remove();
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

						UI.iteration.render.call(this, i, limit, delay, lastIdx, callType);

						if(opts.appendScroll && i > 0 && callType === "append") {
							opts.context.parent(".tbody_wrap__").stop().animate({
								"scrollTop" : opts.context.parent(".tbody_wrap__").prop("scrollHeight")
							}, 300, 'swing');
						}
					} else {
						//remove tbodys in grid body area
						opts.context.find(">tbody").remove();
						
						var colspan = 0;
						if(this.tableMap.colgroup[0] !== undefined && this.tableMap.colgroup[0].length > 0) {
							colspan = $(this.tableMap.colgroup[0]).not(":regexp(css:display, none)").length;
						} else {
							$(this.tableMap.tbody).each(function(i, eles) {
								var currLen = $(eles).not(":regexp(css:display, none)").length;
								if(colspan < currLen) {
									colspan = currLen;	
								}
							});
						}
						
						var emptyEle = $('<tbody><tr><td class="empty__" ' + (colspan > 0 ? 'colspan=' + String(colspan) : '') + '>'
							+ N.message.get(opts.message, "empty") + '</td></tr></tbody>');

						opts.context.append(emptyEle);

						if(opts.fixedcol > 0) {
							setTimeout(function() {
								var emptyCellEle = emptyEle.find(".empty__");
								var emptyCellEleBLW = parseInt(N.string.trimToZero(emptyCellEle.css("border-left")));
								var emptyCellEleBRW = parseInt(N.string.trimToZero(emptyCellEle.css("border-right")));

								emptyCellEle.css({
									"position" : "absolute",
									"left" : 0,
									"padding-left" : 0,
									"padding-right" : 0,
									"width" : opts.context.parent(".grid_wrap__").parent(".grid_container__").outerWidth() - emptyCellEleBLW - emptyCellEleBRW
								});
								emptyCellEle.parent("tr").css("height", emptyCellEle.outerHeight());
							}, 0);
						}
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
					opts.context.find(">tbody").remove();
				}
				var tempRowEleClone = this.tempRowEle.clone(true, true);

				if(N.isNumeric(data)) {
	        		row = data;
	        		data = undefined;
	        	}

				if(row > opts.data.length || row < 0) {
					row = undefined;
				}

				if(row === undefined) {
					if(opts.addTop) {
						opts.context.find(">thead").after(tempRowEleClone);
					} else {
						opts.context.append(tempRowEleClone);
					}
				} else {
					var selRowEle = opts.context.find(">tbody:eq(" + row + ")");
					var scrollTop;

					if(row === 0) {
						opts.context.find("thead").after(tempRowEleClone);
					} else if(row === opts.context.find(">tbody").length) {
						selRowEle = opts.context.find(">tbody:eq(" + (row - 1) + ")");
					} else {
						opts.context.find(">tbody:eq(" + row + ")").before(tempRowEleClone);
					}

					if(opts.addScroll) {
						scrollTop = (row * selRowEle.outerHeight()) - (opts.height / 2) + (selRowEle.outerHeight() / 2);
						if(scrollTop < 0) {
							scrollTop = 0;
						}
						opts.context.parent(".tbody_wrap__").stop().animate({ "scrollTop" : scrollTop }, 300, 'swing', function() {
							if(opts.addSelect) {
								$(this).find(">table>tbody:eq(" + row + ")").trigger("click.grid");
							}
						});						
					} else {
						if(opts.addSelect) {
							setTimeout(function() {
								opts.context.parent(".tbody_wrap__").find(">table>tbody:eq(" + row + ")").trigger("click.grid");
							}, 0);
						}
					}
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
				});

				if(opts.rowHandlerBeforeBind !== null) {
					opts.rowHandlerBeforeBind.call(this, form.options.extRow, tempRowEleClone, data);
				}

				form.add(data, row);

				if(opts.rowHandler !== null) {
					opts.rowHandler.call(this, form.options.extRow, tempRowEleClone, form.data(true)[0]);
				}

				if(opts.fixedcol > 0) {
					tempRowEleClone.find(".grid_body_fixed__").outerHeight(tempRowEleClone.height() + opts.misc.fixedcolBodyAddHeight);
				}

				// unselect rows
				opts.context.find("> tbody").removeClass("grid_selected__");

				// scroll to created row element
				if(row === undefined) {
					opts.context.parent(".tbody_wrap__").stop().animate({
						"scrollTop" : (opts.addTop ? 0 : opts.context.parent(".tbody_wrap__").prop("scrollHeight"))
					}, 300, 'swing', function() {
						if(opts.addSelect) {
							$(this).find("> table > tbody:" + (opts.addTop ? "first" : "last")).trigger("click.grid");
						}
					});
				}

				return this;
			},
			remove : function(row) {
				var opts = this.options;
				if(row !== undefined) {
					if(N.type(row) !== "array") {
						row = [row];
					}
					$(row.sort().reverse()).each(function(i, row) {
						if (opts.data[this] === undefined) {
							throw N.error("[N.grid.prototype.remove]Row index is out of range");
						}
						if (opts.data[this].rowStatus === "insert") {
				            opts.data.splice(this, 1);
				            opts.context.find(">tbody:eq(" + row + ")").remove();
				            
				            
				            // for scroll paging
		        			// just +1 is inappropriate on android 4.4.2 webkit
		        			var rowEleLength = opts.context.find(">tbody").length;
		        			var pagingSize = opts.scrollPaging.size;
		        			var rest = rowEleLength % pagingSize;
		        			opts.scrollPaging.idx = parseInt(rowEleLength / pagingSize) * pagingSize - pagingSize + rest;
				        } else {
				        	opts.data[this].rowStatus = "delete";
				        	opts.context.find(">tbody:eq(" + row + ")").addClass("row_data_deleted__");
				        }
					});
				}

				N.ds.instance(this).notify();
				return this;
			},
			revert : function(row) {
				var opts = this.options;
				if(!opts.revert) {
					throw N.error("[N.form.prototype.revert]Can not revert. N.form's revert option value is false");
				}

				if(row !== undefined) {
					if(N.type(row) !== "array") {
						row = [row];
					}
					$(row).each(function() {
						opts.context.find(">tbody:eq(" + String(this) + ")").instance("form").revert();
					});
				} else {
					opts.context.find(">tbody").instance("form", function(i) {
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
					valiRslt = opts.context.find(">tbody:eq(" + String(row) + ")").instance("form").validate();
				} else {
					var rowStatus;
					opts.context.find(">tbody").instance("form", function(i) {
						if(this.options !== undefined && this.options.data.length > 0) {
							rowStatus = this.options.data[0].rowStatus;
							// Select the rows that data was changed
							if(this.context(".validate_false__").length > 0 || rowStatus === "update" || rowStatus === "insert") {
								if(!this.validate()) {
									valiRslt = false;
								}
							}
						}
					});
				}

				if(!valiRslt && opts.validateScroll) {
					var valiLastTbody = opts.context.find(".validate_false__:last").closest("tbody.form__");
					opts.context.parent(".tbody_wrap__").stop().animate({
						"scrollTop" : opts.context.parent(".tbody_wrap__").scrollTop() + valiLastTbody.position().top - opts.height + (valiLastTbody.outerHeight() * 2)
					}, 300, 'swing');
				}

				return valiRslt;
			},
			val : function(row, key, val) {
				if(val === undefined) {
					return this.options.data[row][key];
				}
				this.options.context.find(">tbody:eq(" + String(row) + ")").instance("form").val(key, val);
				return this;
			},
			move : function(fromRow, toRow) {
				UI.iteration.move.call(this, fromRow, toRow, "grid");

				return this;
			},
			copy : function(fromRow, toRow) {
				UI.iteration.copy.call(this, fromRow, toRow, "grid");

				return this;
			},
			show : function(colIdxs) {
				var opts = this.options;
				var self = this;
				if(colIdxs !== undefined) {
					if(N.type(colIdxs) !== "array") {
						colIdxs = [colIdxs];
					}
				}

				$(colIdxs).each(function(i, v) {
					var context = opts.height > 0 ? opts.context.parent(".tbody_wrap__").parent(".grid_wrap__") : opts.context;
					context = context.add(self.tempRowEle);
					context.find(".col_" + v + "__").each(function(i, ele) {
						var colEle = $(ele);
						var colSpanCnt = parseInt(colEle.attr("colspan"));
						var orgColspan = colEle.data("colspan");
						if(colSpanCnt < orgColspan) {
							colEle.attr("colspan", colSpanCnt + 1);
						}
						colEle.css("display", "");
					});
				});
				
				var emptyEle = opts.context.find(">tbody>tr>.empty__");
				if(emptyEle.length > 0) {
					if(this.tableMap.colgroup[0] !== undefined && this.tableMap.colgroup[0].length > 0) {
						emptyEle.attr("colspan", String($(this.tableMap.colgroup[0]).not(":regexp(css:display, none)").length));
					} else {
						$(this.tableMap.tbody).each(function(i, eles) {
							var currLen = String($(eles).not(":regexp(css:display, none)").length);
							if(N.string.trimToZero(emptyEle.attr("colspan")) < currLen) {
								emptyEle.attr("colspan", currLen);
							}
						});						
					}
				}

				return this;
			},
			hide : function(colIdxs) {
				var opts = this.options;
				var self = this;
				if(colIdxs !== undefined) {
					if(N.type(colIdxs) !== "array") {
						colIdxs = [colIdxs];
					}
				}

				$(colIdxs).each(function() {
					var context = opts.height > 0 ? opts.context.parent(".tbody_wrap__").parent(".grid_wrap__") : opts.context;
					context = context.add(self.tempRowEle);
					context.find(".col_" + this + "__").each(function() {
						var colEle = $(this);
						var colSpanCnt = parseInt(colEle.attr("colspan"));
						if(colSpanCnt > 0) {
							if(colEle.data("colspan") === undefined) {
								colEle.data("colspan", colSpanCnt);
							}
							colEle.attr("colspan", colSpanCnt - 1);
							if(colEle.attr("colspan") == "0") {
								colEle.css("display", "none");
							}
						} else {
							colEle.css("display", "none");
						}
					});
				});

				var emptyEle = opts.context.find(">tbody>tr>.empty__");
				if(emptyEle.length > 0) {
					if(this.tableMap.colgroup[0] !== undefined && this.tableMap.colgroup[0].length > 0) {
						emptyEle.attr("colspan", String($(this.tableMap.colgroup[0]).not(":regexp(css:display, none)").length));
					} else {
						$(this.tableMap.tbody).each(function(i, eles) {
							var currLen = String($(eles).not(":regexp(css:display, none)").length);
							if(N.string.trimToZero(emptyEle.attr("colspan")) < currLen) {
								emptyEle.attr("colspan", currLen);							
							}
						});
					}
				}
				
				return this;
			},
			update : function(row, key) {
				if(row !== undefined) {
					if(key !== undefined) {
						this.options.context.find(">tbody:eq(" + String(row) + ")").instance("form").update(0, key);
					} else if(this.options.data[row]._isRevert !== true && this.options.data[row].rowStatus === "insert") {
						if(this.options.data[row].rowStatus === "insert") {
							this.bind(undefined, "list.update");
						} else {
							this.add(this.options.data[row]);
						}
					} else {
						this.options.context.find(">tbody:eq(" + String(row) + ")").instance("form").update(0);
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
				$.extend(this.options, N.context.attr("ui").pagination);
			} catch (e) {
				throw N.error("[N.pagination]" + e, e);
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
				var self = this;

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
                    		opts.onChange.call(self, opts.pageNo, this, selData, currPageNavInfo);
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
				$.extend(this.options, N.context.attr("ui").tree);
			} catch (e) {
				throw N.error("[N.tree]" + e, e);
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
				var self = this;

				//to rebind new data
				if(data != null) {
					opts.data = N.type(data) === "array" ? N(data) : data;
				}

				var rootNode = N('<ul class="tree_level1_folder__"></ul>').appendTo(opts.context.empty());
				var isAleadyRoot = false;
				N(opts.data).each(function(i, rowData) {
					if(rowData[opts.level] === 1 || !isAleadyRoot) {
						N('<li data-index="' + i + '" class="tree_' + rowData[opts.val] + '__ tree_level1_node__ tree_close__"><span class="tree_icon__"></span>' + (opts.checkbox ? '<span class="tree_check__"><input type="checkbox" /></span>' : '') + '<a class="tree_key__" href="#"><span>' + rowData[opts.key] + '</span></a><ul id="' + rowData[opts.val] + '" class="tree_level' + (opts.level !== null ? String(Number(rowData[opts.level]) + 1) : '') + '_folder__"></ul></li>').appendTo(rootNode);
						isAleadyRoot = true;
					} else {
						N('<li data-index="' + i + '" class="tree_' + rowData[opts.val] + '__ tree_level' + N.string.trim(rowData[opts.level]) + '_node__ tree_close__"><span class="tree_icon__"></span>' + (opts.checkbox ? '<span class="tree_check__"><input type="checkbox" /></span>' : '') + '<a class="tree_key__" href="#"><span>' + rowData[opts.key] + '</span></a><ul id="' + rowData[opts.val] + '" class="tree_level' + (opts.level !== null ? String(Number(rowData[opts.level]) + 1) : '') + '_folder__"></ul></li>').appendTo(rootNode.find("#" + rowData[opts.parent]));
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
							opts.onCheck.call(self
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
						opts.onSelect.call(self, parentLi.data("index"), parentLi, opts.data[parentLi.data("index")]);
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