(function(window, $) {
	var version = "0.5.1.1";

	// NTR local variables
	$.fn.extend(NTR, {
		"Natural-UI" : version
	});

	NTR.fn = NTR.prototype = {
		constructor : NTR,
		alert : function(msg, vars) {
			return new NTR.alert(this, msg, vars);
		},
		confirm : function(callback, msg, vars) {
			return new NTR.alert(this, {
				"msg" : msg,
				"vars" : vars,
				"confirm" : true,
				"callback" : callback
			});
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
		popup : function() {
			//TODO
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
				context : obj.get(0) === window || obj.get(0) === window.document ? N("body") : obj,
				msgContext : N(),
				msgContents : null,
				msg : N.isPlainObject(msg) && msg.msg !== undefined ? msg.msg : msg,
				vars : N.isPlainObject(msg) && msg.vars !== undefined ? msg.vars : vars,
				isInput : false,
				isWindow : obj.get(0) === window || obj.get(0) === window.document,
				//TODO 여기밑으로 extend 처리, 위로는 extend 한 후 대입
				title : N.isPlainObject(msg) && msg.title !== undefined ? msg.title : null,
				button : N.isPlainObject(msg) && msg.button !== undefined ? msg.button : true,
				"callback" : N.isPlainObject(msg) && msg.callback !== undefined ? msg.callback : null,
				overlayColor : N.isPlainObject(msg) && msg.overlayColor !== undefined ? msg.overlayColor : null,
				"confirm" : N.isPlainObject(msg) && msg.confirm !== undefined ? msg.confirm : false
			};

			if (obj.is(":input")) {
				this.options.isInput = true;
			}

			var opts = this.options;
			if (!opts.isInput) {
				var blockOverlayCss = {
					"display" : "none",
					"position" : opts.isWindow ? "fixed" : "absolute",
					"left" : opts.context.offset().left + "px",
					"top" : opts.context.offset().top + "px",
					"cursor" : "not-allowed",
					"height" : opts.isWindow ? (obj).outerHeight() : opts.context.outerHeight() + "px",
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
				if (vars !== undefined) {
					opts.msg = N.message.replaceMsgVars(opts.msg, vars);
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
				opts.msgContents.find("li.buttonBox__ a.confirm__").button(NTR.context.attr("ui")["alert"]["global"]["okBtnStyle"]).click(function(e) {
					e.preventDefault();
					if (opts.callback !== null) {
						opts.callback(opts.msgContext, opts.msgContents);
					}
					this_.remove();
				});

				if(opts.confirm) {
					opts.msgContents.find("li.buttonBox__ a.cancel__").button(NTR.context.attr("ui")["alert"]["global"]["cancelBtnStyle"]).click(function(e) {
						e.preventDefault();
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
			} else {
				if(opts.context.instance("alert") !== undefined) {
					opts.context.instance("alert").remove();
				}
				opts.msgContext = opts.context.next("span.msg__");
				if (opts.msgContext.length == 0) {
					opts.msgContext = opts.context.after('<span class="msg__"><ul></ul><a href="#" id="msgClose__">' + N.context.attr("ui")["alert"]["input"]["closeBtn"] + '</a></span>')
										.next("span.msg__");
				}
				if (N.isEmptyObject(opts.msg)) {
					this.remove();
				}

				var this_ = this;
				opts.msgContext.find("a#msgClose__").click(function(e) {
					e.preventDefault();
					this_.remove();
				});

				var ul_ = opts.msgContext.find("ul");
				if (N.isArray(opts.msg)) {
					opts.msgContext.find("ul").empty();
					$(opts.msg).each(function(i, msg_) {
						if (vars !== undefined) {
							opts.msg[i] = N.message.replaceMsgVars(msg_, vars);
						}
						ul_.append('<li>' + N.context.attr("ui")["alert"]["input"]["bullets"] + opts.msg[i] + '</li>');
					});
				} else {
					if (vars !== undefined) {
						opts.msg = N.message.replaceMsgVars(msg, vars);
					}
					ul_.append('<li>' + N.context.attr("ui")["alert"]["input"]["bullets"] + opts.msg + '</li>');
				}
			}

			opts.context.instance("alert", this);

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
					}).fadeIn(150);
				} else {
					if (!N.isEmptyObject(opts.msg)) {
						var position = "left";
						if ((opts.context.offset().left + opts.context.outerWidth() + 200) > $(window).width()) {
							position = "right";
						}
						if (position == "right") {
							var msgBoxWidth = opts.msgContext.outerWidth();
							var leftPos = opts.context.offset().left - msgBoxWidth;
							if (leftPos < 0) {
								opts.msgContext.width((msgBoxWidth + leftPos) - 2);
							}
							opts.msgContext.offset({
								left : opts.context.offset().left - opts.msgContext.outerWidth() - 1,
								top : opts.context.offset().top
							});
						} else {
							opts.msgContext.offset({
								left : opts.context.offset().left + opts.context.outerWidth(),
								top : opts.context.offset().top
							});
						}
						opts.msgContext.css("z-index", N.element.maxZindex(opts.context) + 1);
						opts.msgContext.show(0, function() {
							setTimeout(function() {
								opts.msgContext.fadeOut(150, function() {
									opts.msgContext.find("a#msgClose__").click();
								});
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

			opts = this.options;

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
                    	$(this).css("opacity", "0.9");
                    }
                });
                opts.context.bind("mousedown.button", function() {
                    if (!opts.context.hasClass("disabled")) {
                        $(this).css("opacity", "0.7");
                    }
                });
                opts.context.bind("mouseup.button", function() {
                    if (!opts.context.hasClass("disabled")) {
                        $(this).css("opacity", "1");
                    }
                });
                opts.context.bind("mouseout.button", function() {
                    if (!opts.context.hasClass("disabled")) {
                        $(this).css("opacity", "1");
                    }
                });
            }

	        opts.context.instance("button", this);

	        return opts.context;
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
				$.extend(this.options, N.context.attr("ui")["select"]);
			} catch (e) { }

			$.extend(this.options, N.element.toOpts(this.options.context));
			if (N.isPlainObject(opts)) {
				$.extend(this.options, opts);
				this.options.context = N(opts.context);
			} else {
				this.options.context = N(opts);
			}
			this.options.template = this.options.context;

			opts = this.options;
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

			opts.context.instance("select", this);

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

		// Form
		var Form = N.form = function(obj, opts) {
			this.options = {
				data : obj,
				row : -1,
				context : null,
				html : false,
				addTop : false,
				validate : true,
				fRules : null, //TODO test
				vRules : null //TODO test
			};

			try {
				$.extend(this.options, N.context.attr("ui")["form"]);
			} catch (e) { }

			if (N.isPlainObject(opts)) {
				$.extend(this.options, opts);
				if(opts.row === undefined) {
					this.options.row = 0;
				}
			} else {
				this.options.row = 0;
				this.options.context = N(opts);
			}

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
			add : function(addTop) {
				var opts = this.options;
		        if (opts.data == null) {
		            throw new Error("[Form.add]data is null. you must input data(Array)");
		        }

		        //FormUtils.reset(opts.context, false);

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
				data : obj,
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
				vResizable : false,
				sortable : false
			};

			try {
				$.extend(this.options, N.context.attr("ui")["grid"]);

				//object 에 object 가 포함되어 있으면 해당오브젝트 객체로 단순 덮어쓰기가 되어서 처리
				this.options.scrollPaging.idx = 0;
			} catch (e) { }

			if (N.isPlainObject(opts)) {
				$.extend(this.options, opts);
			} else {
				this.options.context = N(opts);
			}
			this.revertData = $.extend({}, this.options.data[this.options.row]);
			this.tbodyTemp = this.options.context.find("> tbody").clone(true, true);
			this.cellCnt = Grid.cellCnt(this.tbodyTemp);

			//Fixed header
			if (this.options.height > 0) {
				Grid.fixHeader.call(this);
			}

			if (this.options.sortable) {
				Grid.sort.call(this);
			}

			this.options.context.instance("grid", this);

			NTR.ds.instance(this, true);

			return this;
		};
		Grid.fn = Grid.prototype;
		$.extend(Grid.fn, {
			data : function(rowStatus) {
				var opts = this.options;
				return opts.data
			},
			context : function(sel) {
				return sel !== undefined ? this.options.context.find(sel) : this.options.context;
			},
			bind : function(data) {
				var opts = this.options;
				var interCall = arguments[1] !== undefined && arguments[1] === true ? true : false;
				if(data !== undefined) {
					opts.data = data;
				}
				var tbodyTempClone;

				// Clean rows
				if (opts.data.length > 0) {
					opts.context.find("tbody").clearQueue().stop();
					if(!interCall) {
						opts.scrollPaging.idx = 0;
					}
					if(opts.scrollPaging.idx === 0) {
						opts.context.find("tbody").remove();
					}
					var i = opts.scrollPaging.idx;
					var this_ = this;
					var limit = opts.scrollPaging.size;
					var render = function() {
						tbodyTempClone = this_.tbodyTemp.clone(true, true).hide();
						opts.context.append(tbodyTempClone);
						N(opts.data).form({
							context : tbodyTempClone
						}).bind(i);
						tbodyTempClone.show(opts.createRowDelay, function() {
							i++;
							if(i < opts.scrollPaging.idx + opts.scrollPaging.size) {
								render();
							}
						});
					};
					render();
				} else {
					opts.context.find("tbody").remove();
					tbodyTempClone = this.tbodyTemp.clone();
					tbodyTempClone.html('<tr><td class="empty__" align="center" colspan="' + this.cellCnt + '">' + N.message.get(NTR.context.attr("ui")["grid"]["message"], "empty") + '</td></tr>');
					opts.context.append(tbodyTempClone);
				}

				return this;
			},
			add : function(addTop) {
				//TODO Form instance after add new row element
				return this;
			},
			revert : function(row) {
				//TODO Form instance
				return this;
			},
			validate : function() {
				//TODO Form instance
				return false;
			},
			val : function(row, key, val, notify) {
				//TODO Form instance
				return this;
			},
			update : function(row, key) {
				//TODO Form instance
				return this;
			}
		});

		$.extend(Grid, {
			//TODO Correct the crashed grid layout every browsers
			fixHeader : function() {
				var opts = this.options;

				opts.context.css({
					"table-layout" : "fixed",
					"margin" : "0"
				});

				var width = opts.context.attr("width");
		        if (N.string.trimToNull(width) === null || width.indexOf("100%") < 0) {
		        	opts.context.css("width", "100%");
		        }

		        // Root grid container
		        var gridWrap = opts.context.wrap('<div class="grid_wrap__"/>').parent();

		        //Create grid header
		        var thead = opts.context.clone(true, true);
		        thead.find("tbody").remove();
		        thead.find("tfoot").remove();
		        var theadWrap = thead.wrap('<div class="thead_wrap__"/>').parent().css({
		        	"overflow-y" : "scroll"
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
		        	"max-height" : String(opts.height) + "px",
		        	"overflow-y" : "scroll"
		        });

		        //Scroll paging
		        var this_ = this;
		        tbodyWrap.scroll(function() {
		        	var thisWrap = $(this);
		        	var tbodyLength = opts.context.find("> tbody").length;
		        	var defSPSize = N.context.attr("ui")["grid"]["scrollPaging"]["size"];
                    if (thisWrap.scrollTop() >= opts.context.height() - thisWrap.height()) {
                    	if (tbodyLength === opts.scrollPaging.idx + defSPSize) {
	                    	thisWrap.css("cursor", "wait");

	                        if (tbodyLength > 1 && tbodyLength <= opts.data.length) {
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

	                        thisWrap.css("cursor", "default");
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
			        	"overflow-y" : "scroll"
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
	        	vResizable.bind("mousedown.grid.vResizable", function() {
	        		if(tfootWrap !== undefined) {
		        		tfootHeight = tfootWrap.height();
		        	}
		        	tbodyOffset = tbodyWrap.offset();

	        		$(document).bind("dragstart.grid.vResizable, selectstart.grid.vResizable", function() {
	                    return false;
	                });
	        		pressed = true;
	        	});

	        	$(window.document).bind("mousemove.grid.vResizable", function(e) {
	        		if(pressed) {
	        			currHeight = (e.pageY - tbodyOffset.top - tfootHeight) + "px";
	        			tbodyWrap.css({
	        				"height" : currHeight,
	        				"max-height" : currHeight
	        			});
	        		}
		        });

	        	$(window.document).bind("mouseup.grid.vResizable", function() {
	        		$(document).unbind("dragstart.grid.vResizable, selectstart.grid.vResizable");
	        		pressed = false;
	        	});

	        	gridWrap.append(vResizable);
        	},
        	sort : function() {
    	        var opts = this.options;

    	        /*
    	        var $tbodyTr = opts.container.find("tbody").find("tr").children();
    	        var $theadCells = $thead.find("tr").children();
    	        $theadCells.css("cursor", "pointer");
    	        $theadCells.addClass("sortable");
    	        $theadCells.data("reverse", false);

    	        var this_ = this;

    	        $theadCells.click(function(e) {
    	            if (opts.dataList != null && opts.dataList.length > 0) {
    	                if(StringUtils.trimToNull($(this).text()) != null && $(this).find("input[type='checkbox']").size() == 0) {
    	                    $thead.find("span.sortableAsc, span.sortableDesc").remove();
    	                    var $titleBox = $(this);
    	                    if($(this).find("div.resizeText").size() > 0) {
    	                        $titleBox = $(this).find("div.resizeText");
    	                    }
    	                    if ($(this).data("reverse") == true) {
    	                        $titleBox.append("<span class='sortable_desc__'>▲</span>");
    	                    } else {
    	                        $titleBox.append("<span class='sortable_asc__'>▼</span>");
    	                    }
    	                    $titleBox = null;

    	                    var fieldName = null;
    	                    var currCellIndex = $(this).cellPos().left;
    	                    if($($tbodyTr[currCellIndex]).attr("id")) {
    	                        fieldName = $($tbodyTr[currCellIndex]).attr("id");
    	                    } else {
    	                        if($($tbodyTr[currCellIndex]).children().is(":input")) {
    	                            fieldName = $($tbodyTr[currCellIndex]).find("*").attr("name");
    	                        } else {
    	                            fieldName = $($tbodyTr[currCellIndex]).find("*").attr("id");
    	                        }
    	                    }
    	                    opts.dataList.sort(JSONUtils.sortBy(fieldName, $(this).data("reverse")));
    	                    currCellIndex = null;
    	                    fieldName = null;

    	                    $(this).data("reverse", !$(this).data("reverse"));
    	                    this_.bindDataList({ action : "sortable" });
    	                }
    	            }
    	        });
    	        */
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

	})(NTR);

})(window, jQuery);