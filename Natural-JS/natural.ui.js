(function(window, $) {
	var version = "0.5.1.8";

	// NTR local variables
	$.fn.extend(NTR, {
		"Natural-UI" : version
	});

	NTR.fn = NTR.prototype = {
		constructor : NTR,
		alert : function(msg, vars) {
			return new NTR.alert(this, msg, vars);
		},
		button : function(opts) {
			if(this.is("input[type='button'], button, a")) {
				return new NTR.button(this, opts);
			} else {
				return this.find("input[type='button'], button, a").each(function() {
					return new NTR.button(N(this), opts);
				});
			}
		},
		select : function(opts) {
			return new NTR.select(this, opts);
		},
		form : function(opts) {
			return new NTR.form(this, opts);
		},
		grid : function(opts) {
			return new NTR.grid(this, opts);
		},
		popup : function(opts) {
			return new NTR.popup(this, opts);
		},
		tab : function() {
			//TODO integration jquery plugin
		},
		date : function() {
			//TODO integration jquery plugin
		},
		month : function() {
			//TODO integration jquery plugin
		}
	};
	$.fn.extend(NTR.fn);

	(function(N) {

		// Alert(Confirm)
		var Alert = N.alert = function(obj, msg, vars) {
			this.options = {
				obj : obj,
				context : obj,
				msgContext : N(),
				msgContents : null,
				msg : msg,
				vars : vars,
				isInput : false,
				isWindow : obj.get(0) === window || obj.get(0) === window.document,
				title : null,
				button : true,
				modal : true,
				onOk : null,
				onCancel : null,
				overlayColor : null,
				"confirm" : false
			};

			if (obj.is(":input")) {
				this.options.isInput = true;
			}
			if(msg !== undefined && N.isPlainObject(msg)) {
				$.extend(this.options, msg);
			}
			if(obj.get(0) === window || obj.get(0) === window.document) {
				this.options.context = N("body");
			}

			if (!this.options.isInput) {
				Alert.wrapEle.call(this);
			} else {
				Alert.wrapInputEle.call(this);
			}

			this.options.context.instance("alert", this);

			return this;
		};

		Alert.fn = Alert.prototype;
		$.extend(Alert.fn, {
			"show" : function() {
				var opts = this.options;
				if (!opts.isInput) {
					opts.msgContext.show();
					opts.msgContents.css({
						"top" : ((opts.msgContext.height() / 2 + opts.context.offset().top) - opts.msgContents.height() / 2) + "px",
						"left" : ((opts.msgContext.width() / 2 + opts.context.offset().left) - opts.msgContents.width() / 2) + "px",
					})
					opts.msgContents.fadeIn(150);
				} else {
					if (!N.isEmptyObject(opts.msg)) {
						var setOffset = function() {
							var position = "left";
							if ((opts.context.offset().left + opts.context.outerWidth() + 200) > $(window).width()) {
								position = "right";
							}
							if (position === "right") {
								var msgBoxWidth = opts.msgContext.outerWidth();
								var leftPos = opts.context.offset().left - msgBoxWidth;
								if (leftPos < 0) {
									opts.msgContext.width((msgBoxWidth + leftPos) - 2);
								}

								/* TODO 닫기하고 화살표 바꾸기
								opts.msgContext.find("a.msg_close__").detach().prependTo(opts.msgContext);
								opts.msgContext.find("a.msg_arrow__").detach().appendTo(opts.msgContext);
								*/

								opts.msgContext.offset({
									left : opts.context.offset().left - opts.msgContext.outerWidth() - 1,
									top : opts.context.offset().top + 1
								});
							} else {
								opts.msgContext.offset({
									left : opts.context.offset().left + opts.context.outerWidth(),
									top : opts.context.offset().top + 1
								});
							}
						}
						setOffset();

						// sync msgContext offset
						var time = setInterval(function() {
							setOffset();
						}, 100);

						opts.msgContext.css("z-index", N.element.maxZindex(opts.context) + 1);
						opts.msgContext.show(0, function() {
							setTimeout(function() {
								opts.msgContext.fadeOut(150, function() {
									opts.msgContext.find("a.msg_close__").click();
								});
								clearInterval(time);
							}, NTR.context.attr("ui")["alert"]["input"]["displayTimeout"]);
						});
					}
				}
				return opts.obj;
			},
			"hide" : this.remove,
			"remove" : function() {
				var opts = this.options;
				if (!opts.isInput) {
					opts.msgContext.remove();
					opts.msgContents.remove();
				} else {
					opts.msgContext.remove();
				}
				return opts.obj;
			}
		});

		$.extend(Alert, {
			wrapEle : function() {
				var opts = this.options;

				var blockOverlayCss = {
					"display" : "none",
					"position" : opts.isWindow ? "fixed" : "absolute",
					"left" : opts.context.offset().left + "px",
					"top" : opts.context.offset().top + "px",
					"cursor" : "not-allowed",
					"height" : opts.isWindow ? this.options.obj.outerHeight() : opts.context.outerHeight() + "px",
					"width" : opts.context.outerWidth() + "px",
					"padding" : 0,
					"border-radius" : opts.context.css("border-radius") != "0px" ? opts.context.css("border-radius") : "0px",
					"z-index" : N.element.maxZindex(opts.context.find("div, span, ul, p")) + 1
				};
				if (opts.overlayColor !== null) {
					blockOverlayCss["background-color"] = opts.overlayColor;
				}

				opts.msgContext = opts.context.append(N('<div class="block_overlay__" onselectstart="return false;"></div>')
						.css(blockOverlayCss)).find("div.block_overlay__:last");
				if (opts.vars !== undefined) {
					opts.msg = N.message.replaceMsgVars(opts.msg, opts.vars);
				}

				var blockOverlayMsgCss = {
					"display" : "none",
					"position" : opts.isWindow ? "fixed" : "absolute",
					"top" : opts.context.offset().top + "px",
					"left" : opts.context.offset().left + "px",
					"z-index" : N.element.maxZindex(opts.context.find("div, span, ul, p")) + 1
				};
				var titleBox = '';
				if(opts.title !== null) {
					titleBox = '<li class="msg_title_box__">' + opts.title + '</li>';
				}
				var buttonBox = '';
				if(opts.button) {
					buttonBox = '<li class="buttonBox__">'
						+ '<a href="#" class="confirm__">' + N.message.get(NTR.context.attr("ui")["alert"]["message"], "confirm") + '</a>'
						+ '<a href="#" class="cancel__">' + N.message.get(NTR.context.attr("ui")["alert"]["message"], "cancel") + '</a>'
						+ '</li>';
				}
				opts.msgContents = opts.msgContext.after(
						N('<span class="block_overlay_msg__"><ul>'
								+ titleBox
								+ '<li class="msg_box__">' + opts.msg + '</li>'
								+ buttonBox
								+ '</ul></span>').css(blockOverlayMsgCss)).next("span.block_overlay_msg__:last");
				var this_ = this;
				opts.msgContents.find("li.buttonBox__ a.confirm__").button(NTR.context.attr("ui")["alert"]["global"]["okBtnStyle"]);
				opts.msgContents.find("li.buttonBox__ a.confirm__").click(function(e) {
					e.preventDefault();
					if (opts.onOk !== null) {
						opts.onOk(opts.msgContext, opts.msgContents);
					}
					this_.remove();
				});

				if(!opts.modal) {
					opts.msgContext.remove();
				}

				if(opts.confirm) {
					opts.msgContents.find("li.buttonBox__ a.cancel__").button(NTR.context.attr("ui")["alert"]["global"]["cancelBtnStyle"])
					opts.msgContents.find("li.buttonBox__ a.cancel__").click(function(e) {
						e.preventDefault();
						if (opts.onCancel !== null) {
							opts.onCancel(opts.msgContext, opts.msgContents);
						}
						this_.remove();
					});
				} else {
					opts.msgContents.find("a.cancel__").hide();
				}

				$(document).unbind("keyup.alert");
		        $(document).bind("keyup.alert", function(e) {
		        	if (e.keyCode == 27) {
		        		this_.remove();
		        	}
				});

				$(window).resize(function() {
					opts.msgContext.css({
						"width" : opts.context.width() + "px"
					});
					if (opts.isWindow) {
						opts.msgContext.css({
							"height" : (obj).height() + "px"
						});
					}
					opts.msgContents.css({
						"left" : (((opts.msgContext.width() / 2) + opts.context.offset().left) - (opts.msgContents.width() / 2)) + "px"
					});
					if (opts.isWindow) {
						opts.msgContents.css({
							"top" : (((opts.msgContext.height() / 2) + opts.context.offset().top) - opts.msgContents.height()) + "px"
						});
					}
				});
			},
			wrapInputEle : function() {
				var opts = this.options;

				if(opts.context.instance("alert") !== undefined) {
					opts.context.instance("alert").remove();
				}
				opts.msgContext = opts.context.next("span.msg__");
				if (opts.msgContext.length == 0) {
					opts.msgContext = opts.context.after('<span class="msg__"><ul class="msg_line_box__"></ul></span>')
										.next("span.msg__");
					opts.msgContext.append('<a href="#" class="msg_close__">' + N.context.attr("ui")["alert"]["input"]["closeBtn"] + '</a>');
					opts.msgContext.prepend('<ul class="msg_arrow__"></ul>');
				}
				if (N.isEmptyObject(opts.msg)) {
					this.remove();
				}

				var this_ = this;
				opts.msgContext.find("a.msg_close__").click(function(e) {
					e.preventDefault();
					this_.remove();
				});

				var ul_ = opts.msgContext.find("ul.msg_line_box__");
				if (N.isArray(opts.msg)) {
					opts.msgContext.find("ul.msg_line_box__").empty();
					$(opts.msg).each(function(i, msg_) {
						if (opts.vars !== undefined) {
							opts.msg[i] = N.message.replaceMsgVars(msg_, opts.vars);
						}
						ul_.append('<li>' + N.context.attr("ui")["alert"]["input"]["bullets"] + opts.msg[i] + '</li>');
					});
				} else {
					if (opts.vars !== undefined) {
						opts.msg = N.message.replaceMsgVars(msg, opts.vars);
					}
					ul_.append('<li>' + N.context.attr("ui")["alert"]["input"]["bullets"] + opts.msg + '</li>');
				}
			}
		});

		// Button
		var Button = N.button = function(obj, opts) {
			this.options = {
				context : obj,
				width : 38,
				height : 20,
				size : "medium", // smaller, small, medium, large, big
				color : "white", // white, blue, skyblue, gray
				disable : false
			};

			$.extend(this.options, N.element.toOpts(this.options.context));
			if(opts !== undefined) {
				$.extend(this.options, opts);
			}

			Button.initElement.call(this);

			this.options.context.instance("button", this);

			return this;
		};

		Button.fn = Button.prototype;
		$.extend(Button.fn, {
			disable : function() {
				var context = this.options.context;
				context.css("opacity", "0.6");
		        if (context.is("a")) {
		        	context.unbind("click.button");
		            context.tpBind("click.button", N.element.disable);
		        } else {
		            context.prop("disabled", true);
		        }
		        context.addClass("disabled");
				return this;
			},
			enable : function() {
				var context = this.options.context;
				context.css("opacity", "1");
		        if (context.is("a")) {
		            context.unbind("click", N.element.disable);
		        } else {
		            context.prop("disabled", false);
		        }
		        context.removeClass("disabled");
				return this;
			}
		});

		$.extend(Button, {
			initElement : function() {
				var opts = this.options;

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

	                opts.context.unbind("mouseover.button mousedown.button mouseup.button mouseout.button");
	                opts.context.bind("mouseover.button", function() {
	                    if (!opts.context.hasClass("disabled")) {
	                    	if(N.browser.msieVersion() === 0 || N.browser.msieVersion() > 8) {
	                    		$(this).css("box-shadow", "rgba(0, 0, 0, 0.2) 1px 1px 1px inset");
	                    	} else {
	                    		$(this).css("opacity", "0.9");
	                    	}
	                    }
	                });
	                opts.context.bind("mousedown.button", function() {
	                    if (!opts.context.hasClass("disabled")) {
	                    	if(N.browser.msieVersion() === 0 || N.browser.msieVersion() > 8) {
	                    		$(this).css("box-shadow", "rgba(0, 0, 0, 0.2) 3px 3px 3px inset");
	                    	} else {
	                    		$(this).css("opacity", "0.7");
	                    	}
	                    }
	                });
	                opts.context.bind("mouseup.button", function() {
	                    if (!opts.context.hasClass("disabled")) {
	                    	if(N.browser.msieVersion() === 0 || N.browser.msieVersion() > 8) {
	                    		$(this).css("box-shadow", "none");
	                    	} else {
	                    		$(this).css("opacity", "1");
	                    	}
	                    }
	                });
	                opts.context.bind("mouseout.button", function() {
	                    if (!opts.context.hasClass("disabled")) {
	                    	if(N.browser.msieVersion() === 0 || N.browser.msieVersion() > 8) {
	                    		$(this).css("box-shadow", "none");
	                    	} else {
	                    		$(this).css("opacity", "1");
	                    	}
	                    }
	                });
	            }
			}
		});

		// Select
		var Select = N.select = function(obj, opts) {
			this.options = {
				data : obj,
				context : null,
				key : null,
				val : null,
				append : true,
				direction : "h", //h(orizontal), v(ertical)
				type : 0, // 1: select, 2: select[multiple='multiple'], 3: radio, 4: checkbox
				template : null
			};

			try {
				this.options = $.extend({}, this.options, N.context.attr("ui")["select"]);
			} catch (e) { }

			$.extend(this.options, N.element.toOpts(this.options.context));
			if (N.isPlainObject(opts)) {
				$.extend(this.options, opts);
				this.options.context = N(opts.context);
			} else {
				this.options.context = N(opts);
			}
			this.options.template = this.options.context;

			Select.initElement.call(this);

			this.options.context.instance("select", this);

			return this;
		};

		Select.fn = Select.prototype;
		$.extend(Select.fn, {
			data : function(selFlag) {
				var opts = this.options;
				if(selFlag !== undefined && selFlag === true) {
					var rtnData = [];
					$(opts.context).vals(function(i) {
						rtnData.push(opts.data[i]);
					});
					return rtnData.length === 1 ? rtnData[0] : rtnData;
				} else {
					return opts.data;
				}
			},
			context : function(sel) {
				return sel !== undefined ? this.options.context.find(sel) : this.options.context;
			},
		    bind : function() {
		    	opts = this.options;
		    	if(opts.type === 1 || opts.type === 2) {
		    		var defaultSelectEle = opts.template.find("option.select_default__").clone(true);
	    			opts.context.addClass("select_template__").empty();
					if(opts.append) {
	    				opts.context.append(defaultSelectEle);
	    			}
					opts.data.each(function(i, data) {
						opts.context.append("<option value='" + data[opts.val] + "'>" + data[opts.key] + "</option>");
					});
		    	} else if(opts.type === 3 || opts.type === 4) {
		    		if(opts.context.filter(".select_template__").length == 0) {
		    			var id = opts.context.attr("id");
			    		opts.data.each(function(i, data) {
			    			if(i === 0) {
			    				opts.context.attr("name", id).attr("id", id + "_" + String(i)).attr("value", data[opts.val])
			    					.addClass("select_input__ select_template__");
			    			} else {
			    				opts.context.push(N(opts.template.filter("input:eq(0)")).clone(true).attr("name", id).attr("id", id + "_" + String(i)).attr("value", data[opts.val]).removeClass("select_template__").get(0));
			    			}
			    			opts.context.push(N('<label class="select_input_label__" for="' + id + "_" + String(i) + '">' + data[opts.key] + '</label>').get(0));
			    			if (opts.direction === "v" && opts.data.length - 1 != i) {
			    				opts.context.push(N('<br class="select_input_br__" />').get(0));
			    			}
			    		});
			    		N(opts.template.filter("input:eq(0)")).after(opts.context);
		    		}
		    	}
		    	return this;
		    },
		    val : function(val) {
		    	return $(this.options.context).vals(val);
		    },
		    reset : function(selFlag) {
		    	opts = this.options;
		    	if(opts.type === 1 || opts.type === 2) {
		    		if(selFlag !== undefined && selFlag === true) {
		    			opts.context.get(0).selectedIndex = 0;
		    		} else {
		    			opts.context.val(opts.context.prop("defaultSelected"));
		    		}
		    	} else if(opts.type === 3 || opts.type === 4) {
		    		opts.context.prop("checked", false)
		    	}
		    	return this;
		    }
		});

		$.extend(Select, {
			initElement : function() {
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

		// Form
		var Form = N.form = function(obj, opts) {
			this.options = {
				data : N.type(obj) === "array" ? N(obj) : obj,
				row : -1,
				context : null,
				html : false,
				addTop : false,
				validate : true,
				fRules : null, //TODO test
				vRules : null //TODO test
			};

			try {
				this.options = $.extend({}, this.options, N.context.attr("ui")["form"]);
			} catch (e) { }

			if (N.isPlainObject(opts)) {
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
			this.options.context.addClass("form__");

			this.revertData = $.extend({}, this.options.data[this.options.row]);

			this.options.context.instance("form", this);

			NTR.ds.instance(this, true);

			return this;
		};
		Form.fn = Form.prototype;
		$.extend(Form.fn, {
			data : function(selFlag) {
				var opts = this.options;
				if(selFlag !== undefined && selFlag === true) {
					return opts.data[opts.row];
				} else {
					return opts.data;
				}
			},
			context : function(sel) {
				return sel !== undefined ? this.options.context.find(sel) : this.options.context;
			},
			bind : function(row) {
				var opts = this.options;
				if(row !== undefined) {
					opts.row = row;
				}
				var this_ = this;
				var vals;
				if (!N.isEmptyObject(opts.data) && !N.isEmptyObject(vals = opts.data[opts.row])) {
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
								if (tagName === "textarea" || type === "text" || type === "password" || type === "hidden" || type === "file") {
									//validate
									if(ele.attr("class") !== undefined && ele.attr("class").indexOf("\"validate\"") > -1) {
										if (type !== "hidden") {
											N().validator(opts.fRules !== null ? opts.fRules : ele);

											ele.unbind("focusout.form.validate");
											ele.bind("focusout.form.validate", function() {
												var currEle = $(this);
					                            if (!currEle.prop("disabled") && !currEle.prop("readonly")) {
					                                currEle.trigger("validate");
					                            }
					                        });
										}
									}

									//dataSync
									ele.unbind("focusout.form.dataSync");
									ele.bind("focusout.form.dataSync", function() {
										var currEle = $(this);
										var currVal = currEle.val();
										if (String(vals[currEle.attr("id")]) !== currVal) {
											if (!currEle.prop("disabled") && !currEle.prop("readonly") && !currEle.hasClass("validate_false__")) {
												vals[currEle.attr("id")] = currVal;
	                                            if (vals["rowStatus"] != "insert") {
	                                                vals["rowStatus"] = "update";
	                                            }
	                                            currEle.addClass("data_changed__");
	                                            N.ds.instance(this_).notify(opts.row, currEle.attr("id"));
											}
                                        }
									});
									//Enter key event
									ele.unbind("keyup.form.dataSync");
			                        ele.bind("keyup.form.dataSync", function(e) {
			                            if (e.which == 13) {
			                            	e.preventDefault();
			                            	$(this).trigger("focusout.form.validate");
			                            	$(this).trigger("focusout.form.dataSync");
			                            }
			                        });

				                    //format
			                        if(ele.attr("class") !== undefined && ele.attr("class").indexOf("\"format\"") > -1) {
										if (type !== "password" && type !== "hidden" && type !== "file") {
											N(opts.data).formater(opts.fRules !== null ? opts.fRules : ele).format(opts.row);

											ele.unbind("focusin.form.unformat");
											ele.bind("focusin.form.unformat", function() {
												var currEle = $(this);
					                            if (!currEle.prop("disabled") && !currEle.prop("readonly") && !currEle.hasClass("validate_false__")) {
					                                currEle.trigger("unformat");
					                            }
					                        });

											ele.unbind("focusout.form.format");
											ele.bind("focusout.form.format", function() {
												var currEle = $(this);
					                            if (!currEle.prop("disabled") && !currEle.prop("readonly") && !currEle.hasClass("validate_false__")) {
					                                currEle.trigger("format");
					                            }
					                        });
										}
									} else {
										ele.val(N.string.nullToEmpty(String(vals[key])));
									}
								} else if(tagName === "select") {
									//validate
									if(ele.attr("class") !== undefined
											&& ele.attr("class").indexOf("\"validate\"") > -1) {
										if (opts.validate) {
											N().validator(opts.fRules !== null ? opts.fRules : ele);
										}
									}

									//dataSync
									ele.unbind("change.form.dataSync");
									ele.bind("change.form.dataSync", function() {
										var currEle = $(this);
										var currVals = currEle.vals();
										if (vals[currEle.attr("id")] !== currVals) {
											if (!currEle.prop("disabled") && !currEle.prop("readonly") && !currEle.hasClass("validate_false__")) {
												vals[currEle.attr("id")] = currVals;
	                                            if (vals["rowStatus"] != "insert") {
	                                                vals["rowStatus"] = "update";
	                                            }
	                                            currEle.addClass("data_changed__");
	                                            N.ds.instance(this_).notify(opts.row, currEle.attr("id"));
											}
                                        }
									});

									//Data bind
									ele.vals(vals[key]);
								} else if(tagName === "img") {
									ele.attr("src", N.string.nullToEmpty(String(vals[key])));
								} else {
									if(ele.attr("class") !== undefined && ele.attr("class").indexOf("\"format\"") > -1) {
										N(opts.data).formater(opts.fRules !== null ? opts.fRules : ele).format(opts.row);
									} else {
										val = N.string.nullToEmpty(String(vals[key]));
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
							eles = $(opts.context).find("input:radio[id^='" + key + "'], input:checkbox[id^='" + key + "']");
							eles.removeClass("data_changed__");
							if(eles.length > 0) {
								eles.vals(vals[key]);

								//dataSync
								eles.unbind("click.form.dataSync select.form.dataSync");
								eles.bind("click.form.dataSync select.form.dataSync", function() {
									var currEle = $(this);
									var currKey = currEle.attr("name");
									if(currKey === undefined) {
										currKey = currEle.attr("id");
									}
									var currEles = currEle.siblings("input:" + currEle.attr("type") + "[id^='" + currEle.attr("name") + "']");
									currEles.push(this);
									var currVals = currEles.vals();
									if (vals[currKey] !== currVals) {
										if (!currEle.prop("disabled") && !currEle.prop("readonly")) {
											vals[currKey] = currVals;
	                                        if (vals["rowStatus"] != "insert") {
	                                            vals["rowStatus"] = "update";
	                                        }
	                                        currEles.addClass("data_changed__");
	                                        N.ds.instance(this_).notify(opts.row, currKey);
										}
	                                }
								});
							}
						}
					}
					eles = val = undefined;
				}

				return this;
			},
			add : function() {
				var opts = this.options;
		        if (opts.data === null) {
		            throw new Error("[Form.add]data is null. you must input data");
		        }

		        // set default values
		        var vals = N.element.toData(opts.context.find(":input"));
		        if (vals == null) {
		            vals = {};
		        }
		        vals.rowStatus = "insert";

	        	if(!opts.addTop) {
	        		opts.data.push(vals);
	        		this.options.row = opts.data.length - 1;
	        	} else {
        			opts.data.splice(0, 0, vals);
	        		this.options.row = 0;
	        	}

	        	//TODO opts.row만 들어왔을때 그리드에서 어떻게 update 할건지 고민
		        N.ds.instance(this).notify(opts.row);
		        this.update(opts.row);
				return this;
			},
			revert : function() {
				var opts = this.options;
				opts.data[opts.row] = $.extend({}, this.revertData);
				N.ds.instance(this).notify(opts.row);
				this.update(opts.row);
				return this;
			},
			validate : function() {
				var opts = this.options;
				var eles = opts.context.find(":input");
				eles.trigger("unformat.formater");
				eles.trigger("validate.validator");
				eles.not(".validate_false__").trigger("format.formater");
				return eles.filter(".validate_false__").length > 0 ? false : true;
			},
			val : function(key, val, notify) {
				if(val === undefined) {
					return this.options.data[this.options.row][key];
				}
				var opts = this.options;
				var vals = opts.data[opts.row];
				var eles, ele;
				var this_ = this;
				var rdonyFg = false;
				var dsabdFg = false;
				eles = $(opts.context).find("#" + key);
				var tagName = eles.get(0).tagName.toLowerCase();
				var type = N.string.trimToEmpty(eles.attr("type")).toLowerCase();
				if (eles.length > 0 && type !== "radio" && type !== "checkbox") {
					eles.each(function() {
						ele = $(this);

		                if(ele.prop("readonly")) {
		                	ele.removeAttr("readonly");
		                    rdonyFg = true;
		                }
		                if(ele.prop("disabled")) {
		                	ele.removeAttr("disabled");
		                	dsabdFg = true;
		                }

						if (tagName === "textarea" || type === "text" || type === "password" || type === "hidden" || type === "file") {
							if(ele.attr("class") !== undefined
									&& (ele.attr("class").indexOf("\"format\"") > -1 || ele.attr("class").indexOf("\"validate\"") > -1)) {
								ele.val(String(val));
								//validate
								if (type !== "hidden") {
									ele.trigger("focusout.form.validate");
								}
								//dataSync
								ele.trigger("focusout.form.dataSync");
								//format
								if (!ele.is("input:password, input:hidden, input:file")) {
									ele.trigger("focusin.form.format");
									ele.trigger("focusout.form.unformat");
								}
							} else {
								ele.val(String(val));
								//dataSync
								ele.trigger("focusout.form.dataSync");
							}
						} else if(tagName === "select") {
							ele.vals(val);
							//dataSync
							ele.trigger("change.form.dataSync");
						} else if(tagName === "img") {
							var currVal = String(val);
							vals[ele.attr("id")] = currVal;
                            if (vals["rowStatus"] != "insert") {
                                vals["rowStatus"] = "update";
                            }
                            ele.addClass("data_changed__");
                            N.ds.instance(this_).notify(opts.row, ele.attr("id"));

							ele.attr("src", currVal);
						} else {
							var currVal = String(val);
							vals[ele.attr("id")] = currVal;
                            if (vals["rowStatus"] != "insert") {
                                vals["rowStatus"] = "update";
                            }
                            ele.addClass("data_changed__");
                            N.ds.instance(this_).notify(opts.row, ele.attr("id"));

							if(ele.attr("class") !== undefined && ele.attr("class").indexOf("\"format\"") > -1) {
								N(opts.data).formater(opts.fRules !== null ? opts.fRules : ele).format(opts.row);
							} else {
								if(!opts.html) {
									ele.text(currVal);
								} else {
									ele.html(currVal);
								}
							}
						}

						if(rdonyFg) {
							ele.prop("readonly", true);
		                }
		                if(dsabdFg) {
		                	ele.prop("disabled", true);
		                }
					});
				} else {
					//radio, checkbox
					eles = $(opts.context).find("input:radio[id^='" + key + "'], input:checkbox[id^='" + key + "']");
					if(eles.length > 0) {
						eles.vals(val);
						//dataSync
						$(eles.get(0)).trigger("select.form.dataSync");
					}
				}
				return this;
			},
			update : function(row, key) {
				var opts = this.options;
				if (key === undefined) {
					this.bind(row);
				} else {
					this.val(key, opts.data[row][key], false);
				}
				N.element.dataChanged(opts.context.find("#" + key + ", input:radio[id='" + key + "'][name='" + key + "'], input:checkbox[id='" + key + "'][name='" + key + "']"));
				return this;
			}
		});

		// Grid
		var Grid = N.grid = function(obj, opts) {
			this.options = {
				data : N.type(obj) === "array" ? N(obj) : obj,
				removedData : [],
				row : -1,
				context : null,
				html : false,
				addTop : false,
				validate : true,
				fRules : null,
				vRules : null,
				createRowDelay : 0,
				heigth : 0,
				scrollPaging : {
					idx : 0,
					size : 100
				},
				serverPaging : {
					// TODO
				},
				resizable : true,
				vResizable : false,
				sortable : false
				//TODO onBind 추가
			};

			try {
				this.options = $.extend({}, this.options, N.context.attr("ui")["grid"]);

				//because $.extend method is not extend object type value
				this.options.scrollPaging = $.extend({}, this.options.scrollPaging, N.context.attr("ui")["grid"]["scrollPaging"]);
			} catch (e) { }

			if (N.isPlainObject(opts)) {
				$.extend(this.options, opts);
				if(N.type(this.options.context) === "string") {
					this.options.context = N(this.options.context);
				}
			} else {
				this.options.context = N(opts);
			}

			this.options.context.addClass("grid__");

			// set tbody template
			this.tbodyTemp = this.options.context.find("> tbody").clone(true, true);

			// set cell count in tbody
			this.cellCnt = Grid.cellCnt(this.tbodyTemp);

			// fixed header
			if(this.options.height > 0) {
				Grid.fixHeader.call(this);
			}

			// set tbody cell id info into th cell in thead
			this.thead = Grid.setTheadCellInfo.call(this);

			// sortable, v(ertical)Resizable
			if(this.options.sortable) {
				Grid.sort.call(this);
			}

			// resizable column width
			if(this.options.resizable) {
				Grid.resize.call(this);
			}

			this.options.context.instance("grid", this);

			NTR.ds.instance(this, true);

			return this;
		};
		Grid.fn = Grid.prototype;
		$.extend(Grid.fn, {
			data : function(rowStatus) {
				if(rowStatus === undefined) {
					return this.options.data.get();
				} else if(rowStatus === "modified") {
					return this.options.data.datafilter("data.rowStatus !== undefined").get().concat(this.options.removedData);
				} else if(rowStatus === "delete") {
					return this.options.removedData;
				} else {
					return this.options.data.datafilter("data.rowStatus === '" + rowStatus + "'").get();
				}
			},
			context : function(sel) {
				return sel !== undefined ? this.options.context.find(sel) : this.options.context;
			},
			bind : function(data) {
				var opts = this.options;
				//empty removedData;
				opts.removedData = [];
				//for internal call bind method by scrollPaging
				var interCall = arguments[1] !== undefined && arguments[1] === true ? true : false;
				//for rebind new data
				if(data !== undefined) {
					opts.data = N.type(data) === "array" ? N(data) : data;
				}
				var tbodyTempClone;

				if (opts.data.length > 0) {
					//clear tbody visual effect
					opts.context.find("tbody").clearQueue().stop();
					if(!interCall) {
						opts.scrollPaging.idx = 0;
					}
					if(opts.scrollPaging.idx === 0) {
						//remove tbodys in grid body area
						opts.context.find("tbody").remove();
					}

					var i = opts.scrollPaging.idx;
					var this_ = this;
					var limit;
					if(opts.height > 0) {
						limit = opts.scrollPaging.size;
					} else {
						limit = opts.data.length
					}
					var classOpts;
					var render = function() {
						// clone tbody for create new line
						tbodyTempClone = this_.tbodyTemp.clone(true, true).hide();
						opts.context.append(tbodyTempClone);

						classOpts = N.element.toOpts(tbodyTempClone);
						if(classOpts !== undefined && classOpts.rowHandler !== undefined) {
							(new Function("return " + classOpts.rowHandler))()(i, tbodyTempClone, opts.data[i]);
						}

						N(opts.data[i]).form({
							context : tbodyTempClone
						}).bind();
						tbodyTempClone.show(opts.createRowDelay, function() {
							i++;
							if(i < opts.scrollPaging.idx + limit) {
								render();
							}
						});
					};
					render();
				} else {
					//remove tbodys in grid body area
					opts.context.find("tbody").remove();
					opts.context.append('<tbody><tr><td class="empty__" align="center" colspan="' + this.cellCnt + '">'
							+ N.message.get(opts.message, "empty") + '</td></tr></tbody>');
					opts.context.append(tbodyTempClone);
				}

				return this;
			},
			add : function() {
				var opts = this.options;
				if (opts.context.find("td.empty__").length > 0) {
					opts.context.find("tbody").remove();
				}
				var tbodyTempClone = this.tbodyTemp.clone(true, true);

				if(opts.addTop) {
					opts.context.find("thead").after(tbodyTempClone);
				} else {
					opts.context.append(tbodyTempClone);
				}

				//TODO 여기서 ds.noty, form 에서는 noty 하면 안됨...이 그리드가 업뎃되어버릴꺼임
				opts.data.form({
					context : tbodyTempClone,
					addTop : opts.addTop
				}).add();

				//focus to first input element
				tbodyTempClone.find(":input:eq(0)").get(0).focus();

				return this;
			},
			remove : function(row) {
				var opts = this.options;
				if(row === undefined || row > opts.data.length - 1) {
		        	N.error("[N.grid.remove]Row index out of range");
		        }

				opts.context.find("tbody:eq(" + row + ")").remove();

				if (opts.data[row].rowStatus === "insert") {
		            opts.data.splice(row, 1);
		        } else {
		        	var removedData = opts.data.splice(row, 1)[0];
		        	removedData["rowStatus"] = "delete";
		            opts.removedData.push(removedData);
		        }

				N.ds.instance(this).notify();
			},
			revert : function(row) {
				var opts = this.options;
				if(row !== undefined) {
					opts.context.find("tbody:eq(" + String(row) + ")").instance("form").revert();
				} else {
					opts.context.find("tbody").instance("form", function(i) {
						if(this.options !== undefined && this.options.data[0].rowStatus === "update") {
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
					opts.context.find("tbody:eq(" + String(row) + ")").instance("form").validate();
				} else {
					var rowStatus;
					opts.context.find("tbody").instance("form", function(i) {
						if(this.options !== undefined && this.options.data.length > 0) {
							rowStatus = this.options.data[0].rowStatus;
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
					return this.options.context.find("tbody:eq(" + String(row) + ")").instance("form").val(key);
				}
				this.options.context.find("tbody:eq(" + String(row) + ")").instance("form").val(key, val);
				return this;
			},
			update : function(row, key) {
				if(row === undefined && row === undefined) {
					this.bind();
				} else {
					this.options.context.find("tbody:eq(" + String(row) + ")").instance("form").update(row, key);
				}
				return this;
			}
		});

		$.extend(Grid, {
			fixHeader : function() {
				var opts = this.options;

				// addTop option is unconditional [true] when fixed header mode
				opts.addTop = true;

				opts.context.css({
					"table-layout" : "fixed",
					"margin" : "0"
				});

				var width = opts.context.attr("width");
		        if (N.string.trimToNull(width) === null || width.indexOf("100%") < 0) {
		        	opts.context.css("width", "100%");
		        }

		        var sampleCell = opts.context.find("tbody td:eq(0)");
		        var borderLeft = sampleCell.css("border-left-width") + " " + sampleCell.css("border-left-style") + " " + sampleCell.css("border-left-color");
		        var borderBottom = sampleCell.css("border-bottom-width") + " " + sampleCell.css("border-bottom-style") + " " + sampleCell.css("border-bottom-color");

		        // Root grid container
		        var gridWrap = opts.context.wrap('<div class="grid_wrap__"/>').parent();
		        gridWrap.css({
		        	"border-left" : borderLeft,
		        });

		        //Create grid header
		        var scrollbarWidth = N.browser.scrollbarWidth();
		        var thead = opts.context.clone(true, true);
		        thead.find("tbody").remove();
		        thead.find("tfoot").remove();
		        var theadWrap = thead.wrap('<div class="thead_wrap__"/>').parent().css({
		        	"padding-right" : scrollbarWidth + "px",
		        	"margin-left" : "-1px",
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
	                "border-top" : "none",
		        });
		        this.tbodyTemp.find("td").css({
	                "border-top" : "none",
		        });
		        var tbodyWrap = opts.context.wrap('<div class="tbody_wrap__"/>').parent().css({
		        	"height" : String(opts.height) + "px",
		        	"overflow-y" : "scroll",
		        	"margin-left" : "-1px",
		        	"border-bottom" : borderBottom,
		        });

		        //Scroll paging
		        var this_ = this;
		        var defSPSize = N.context.attr("ui")["grid"]["scrollPaging"]["size"];
		        var tbodyLength;
		        tbodyWrap.scroll(function() {
		        	var thisWrap = $(this);
                    if (thisWrap.scrollTop() >= opts.context.height() - thisWrap.height()) {
                    	tbodyLength = opts.context.find("> tbody").length;
                    	if (tbodyLength === opts.scrollPaging.idx + defSPSize) {
	                        if (tbodyLength > 0 && tbodyLength <= opts.data.length) {
	                            opts.scrollPaging.idx += defSPSize;
	                        }

	                        if (opts.scrollPaging.idx + opts.scrollPaging.size >= opts.data.length) {
	                        	opts.scrollPaging.size = opts.data.length - opts.scrollPaging.idx;
	                        } else {
	                        	opts.scrollPaging.size = defSPSize;
	                        }

	                        if(opts.scrollPaging.idx < opts.data.length) {
	                        	this_.bind(undefined, true);
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
			        	"margin-left" : "-1px",
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

	        	var currHeight, tbodyOffset, tfootHeight = 0;
	        	vResizable.bind("mousedown.grid.vResize", function() {
	        		if(tfootWrap !== undefined) {
		        		tfootHeight = tfootWrap.height();
		        	}
		        	tbodyOffset = tbodyWrap.offset();

	        		$(document).bind("dragstart.grid.vResize, selectstart.grid.vResize", function() {
	                    return false;
	                });
	        		pressed = true;

		        	$(window.document).bind("mousemove.grid.vResize", function(e) {
		        		if(pressed) {
		        			currHeight = (e.pageY - tbodyOffset.top - tfootHeight) + "px";
		        			tbodyWrap.css({
		        				"height" : currHeight,
		        				"max-height" : currHeight
		        			});
		        		}
			        });

		        	$(window.document).bind("mouseup.grid.vResize", function() {
		        		$(document).unbind("dragstart.grid.vResize, selectstart.grid.vResize, mousemove.grid.vResize, mouseup.grid.vResize");
		        		pressed = false;
		        	});
	        	});

	        	gridWrap.after(vResizable);
        	},
			resize : function() {
				var opts = this.options;
				var theadCells = this.thead.find("> tr th");
				var resizeBar;
				var ele;

				var pressed = false;
				var defWidth;
				var currWidth;
				var currCellEle;
				var currCellEleTable;
				var targetCellEle;
				var targetCellEleWrap;
				var currResizeBarEle;
				var startOffsetX;
				var initHeight;
				var innerHeight;
				var scrollbarWidth = N.browser.scrollbarWidth();
				theadCells.each(function() {
					cellEle = $(this);
		            resizeBar = cellEle.append('<span class="resize_bar__"></span>').find("span.resize_bar__");
		            var resizeBarWidth = 6;

		            if(N.browser.msieVersion() > 0) {
		            	 innerHeight = String(cellEle.innerHeight());
		            } else {
		            	 innerHeight = String(cellEle.innerHeight() + 1);
		            }
		            resizeBar.css({
		            	"padding": "0px",
		            	"margin": "-" + cellEle.css("padding-top") + " -" + (resizeBarWidth/2 + parseInt(cellEle.css("padding-right"))) + "px -" + cellEle.css("padding-bottom") + " 0",
		            	"height" : innerHeight + "px",
		            	"float" : "right",
		            	"width" : resizeBarWidth + "px",
		            	"cursor": "e-resize"
		            });

		            resizeBar.bind("mousedown.grid.resize", function(e) {
		            	startOffsetX = e.pageX;
		            	currResizeBarEle = $(e.target);
		            	currCellEle = currResizeBarEle.parent("th");

		            	// cell 안의 text 와 float 속성이 먹은 resizeBar 가 줄넘김 되어 cell 의 높이가 변하는것 방지
		            	theadCells.find("span.resize_bar__").css("float", "none");

		            	if(opts.height > 0) {
		            		targetCellEle = opts.context.find("thead th:eq(" + theadCells.index(currCellEle) + ")");
		            		currCellEleTable = currCellEle.parents("table.grid__");
		            		targetCellEleWrap = targetCellEle.parents("div.tbody_wrap__");
		            	}

		            	// for prevent sort event
		            	currCellEle.data("sortLock", true);

		            	defWidth = currCellEle.innerWidth();

		            	initHeight = currCellEle.innerHeight() + 1;

		        		$(document).bind("dragstart.grid.resize, selectstart.grid.resize", function() {
		                    return false;
		                });
		        		pressed = true;

		        		$(window.document).bind("mousemove.grid.resize", function(e) {
			        		if(pressed) {
			        			currWidth = defWidth + (e.pageX - startOffsetX);
			        			if(currWidth > 0) {
			        				currCellEle.css("width", currWidth + "px");
			        				if(targetCellEle !== undefined) {
			        					targetCellEle.css("width", currWidth + "px");
			        					targetCellEleWrap.width(currCellEleTable.width() + scrollbarWidth);
			        				}
			        			}
			        		}
				        });

			        	$(window.document).bind("mouseup.grid.resize", function(e) {
			        		$(document).unbind("dragstart.grid.resize, selectstart.grid.resize, mousemove.grid.resize, mouseup.grid.resize");
			        		theadCells.find("span.resize_bar__").css("float", "right");

			        		// for keeping table layout
			        		if(currCellEle.innerHeight() + 1 > initHeight) {
			        			currCellEle.css("width", "");
			        			targetCellEle.css("width", "");
			        			targetCellEleWrap.width(currCellEleTable.width() + scrollbarWidth);
			        		}

			        		pressed = false;
			        	});
		        	});
				});
			},
        	sort : function() {
    	        var opts = this.options;
    	        var thead = this.thead;

    	        var theadCells = thead.find("> tr th");
    	        theadCells.css("cursor", "pointer");
    	        var this_ = this;
    	        theadCells.bind("click.grid.sort", function(e) {
    	        	var currEle = $(this);
    	        	if(currEle.data("sortLock")) {
    	        		currEle.data("sortLock", false);
    	        		return false;
    	        	}
    	        	if (opts.data.length > 0) {
    	        		if(N.string.trimToNull($(this).text()) != null && $(this).find("input[type='checkbox']").length == 0) {
    	        			var isAsc = false;
    	        			if (currEle.find("span.sortable__").hasClass("asc__")) {
    	        				isAsc = true;
    	        			}
    	        			thead.find("span.sortable__").remove();
    	                    if (isAsc) {
    	                    	currEle.append('<span class="sortable__ desc__">' + opts.sortableItem.asc + '</span>')
    	                    	this_.bind(N(opts.data).datasort($(this).data("id"), true));
    	                    } else {
    	                    	currEle.append('<span class="sortable__ asc__">' + opts.sortableItem.desc + '</span>')
    	                    	this_.bind(N(opts.data).datasort($(this).data("id")));
    	                    }
    	        		}
    	        	}
    	        });
        	},
        	serverPaging : function() {
        		//TODO
        	},
        	setTheadCellInfo : function() {
        		var opts = this.options;
        		var thead;
    			if (opts.height > 0) {
    	        	thead = opts.context.closest("div.grid_wrap__").find("> div.thead_wrap__ thead");
    	        } else {
    	        	thead = opts.context.find("thead");
    	        }
    			var id;
    			this.tbodyTemp.find("> tr td").each(function(i) {
    				id = $(this).attr("id");
    				if(id === undefined) {
    					id = $(this).find("*").attr("id");
    				}
    				thead.find("> tr th:eq(" + i + ")").data("id", id);
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

		// Popup
		var Popup = N.popup = function(obj, opts) {
			this.options = {
					context : obj,
					title : null,
					button : true,
					modal : true,
					onOk : null,
					onCancel : null,
					"confirm" : true
				};

				try {
					this.options = $.extend({}, this.options, N.context.attr("ui")["popup"]);
				} catch (e) { }

				$.extend(this.options, N.element.toOpts(this.options.context));
				if(opts !== undefined) {
					$.extend(this.options, opts);
				}

				Popup.initElement.call(this);

				this.options.context.instance("popup", this);

		        return this.options.context;
		};
		Popup.fn = Popup.prototype;
		$.extend(Popup.fn, {
			open : function() {

			}
		});

		$.extend(Popup, {
			initElement : function() {

			}
		});

	})(NTR);

})(window, jQuery);