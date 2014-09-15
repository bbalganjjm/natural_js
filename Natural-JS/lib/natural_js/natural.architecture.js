(function(window, $) {
	var version = "0.7.0.0";

	// NTR local variables
	$.fn.extend(NTR, {
		"Natural-ARCHITECTURE" : version
	});

	$.extend(NTR.fn, {
		constructor : NTR,
		communicator : function(opts) {
			return NTR.communicator(opts);
		},
		controller : function(url) {
			return new NTR.controller(this, url);
		},
		request : function() {
			return this.get(0).request;
		},
		service : function(callback) {
			return new NTR.service(this, callback);
		}
	});
	$.fn.extend(NTR.fn);

	(function(N) {
		// Config
		var Config = N.config = function(url) {
			//TODO
		};

		// Comunicator
		var Comunicator = $.ajax;
		N.communicator = Comunicator;

		// Common Controller
		// TODO demo 페이지 만들어야 함. html 불러올경우 ServiceController 에 request 객체 넣어줌
		var Controller = N.controller = function(obj, url) {
			if (obj === undefined) {
				N.error("[Controller]You must input arguments[0]");
			} else {
				if ((N.isPlainObject(obj) || N.isString(obj)) && url == undefined) {
					url = obj;
					obj = [];
				} else {
					if (!N.isWrappedSet(obj) && !N.isArray(obj)) {
						obj = [ obj ];
					}
				}
			}

			obj.request = new Controller.request(obj, N.isString(url) ? {
				"url" : url
			} : url);

			obj.submit = function(callback) {
				return Controller.submit.call(obj, callback);
			};
			return obj;
		};

		$.extend(Controller, {
			xhr : null,
			submit : function(callback) {
				var obj = this;
				if (N.isElement(obj)) {
					$.extend(this.request.options, {
						contentType : "application/x-www-form-urlencoded",
						dataType : "html"
					});
				}

				var afterInitFilters = new Array();
				var beforeSendFilters = new Array();
				var successFilters = new Array();
				var errorFilters = new Array();
				var completeFilters = new Array();
				var filters = N.context.attr("architecture")["controller"]["filters"];
				for ( var key in filters) {
					for ( var filterKey in filters[key]) {
						if (filterKey === "afterInit") {
							afterInitFilters.push(filters[key][filterKey]);
						} else if (filterKey === "beforeSend") {
							beforeSendFilters.push(filters[key][filterKey]);
						} else if (filterKey === "success") {
							successFilters.push(filters[key][filterKey]);
						} else if (filterKey === "error") {
							errorFilters.push(filters[key][filterKey]);
						} else if (filterKey === "complete") {
							completeFilters.push(filters[key][filterKey]);
						}
					}
				}

				// request filter
				$(afterInitFilters).each(function(i) {
					this(obj.request);
				});

				$.extend(obj.request.options, {
					beforeSend : function(xhr, settings) {
						// request filter
						$(beforeSendFilters).each(function(i) {
							this(obj.request, xhr, settings);
						});

					},
					success : function(data, textStatus, xhr) {
						// request filter
						$(successFilters).each(function(i) {
							this(obj.request, data, textStatus, xhr);
						});

						if (!N.isElement(obj)) {
							if (callback === undefined) {
								N.error("[Controller.submit]You must input callback function to arguments[0]");
							}
							if (obj.request.options.urlSync && obj.request.options.referrer.replace(/!/g, "") != window.location.href.replace(/!/g, "")) {
								xhr.abort();
								return false;
							}
							try {
								callback(data, obj.request);
							} catch (e) {
								N.error("[Controller.submit.success.callback]" + e, e);
							}
						} else {
							if (!obj.request.options.append) {
								obj.html(data);
							} else {
								obj.append(data);
							}
							if (obj.request.options.effect) {
								obj.hide()[obj.request.options.effect[0]](obj.request.options.effect[1], obj.request.options.effect[2]);
							}
							if(obj.children(":first").length > 0) {
								obj.children(":first").service().request = obj.request;
							}
						}
					},
					error : function(xhr, textStatus, errorThrown) {
						// request filter
						$(errorFilters).each(function(i) {
							this(obj.request, xhr, textStatus, errorThrown);
						});

						N.error("[N.communicator." + textStatus + "]" + errorThrown, errorThrown);
					},
					complete : function(xhr, textStatus) {
						// request filter
						$(completeFilters).each(function(i) {
							this(obj.request, xhr, textStatus);
						});
					}
				});
				this.xhr = N.communicator(obj.request.options);
				return obj;
			}
		});

		Controller.request = function(obj, opts) {
			this.options = {
				referrer : window.location.href,
				contentType : "application/json; charset=utf-8",
				cache : false,
				type : "POST",
				async : true,
				data : null,
				dataType : "json",
				urlSync : true,
				crossDomain : false,
				browserHistory : true, // TODO To do
				append : false,
				effect : false
			};

			// global config
			try {
				$.extend(this.options, N.context.attr("architecture")["controller"]["request"]["options"]);
			} catch (e) {
			}
			$.extend(this.options, opts);

			this.attrObj = {};

			this.obj = obj;
			// define params data
			var params = this.options.data === null ? N.isWrappedSet(obj) ? !N.isElement(obj) ? obj.toArray()[0] : null : obj[0] : this.options.data;
			if (params != null) {
				this.options.data = JSON.stringify(params);
			}
		};

		Controller.request.fn = Controller.request.prototype;
		// Controller.request local variable;
		$.fn.extend(Controller.request.fn, {
			/**
			 * get request attribute
			 */
			attr : function(name, obj_) {
				if (name === undefined) {
					return this.attrObj;
				}
				if (obj_ === undefined) {
					return this.attrObj != null ? (typeof this.attrObj[name] != "undefined" ? this.attrObj[name] : undefined) : undefined;
				} else {
					if (this.attrObj === undefined) {
						this.attrObj = {};
					}
					this.attrObj[name] = obj_;
					// this.obj : Defined from Controller.request constructor;
					return this.obj;
				}
			},
			/**
			 * get query parmas from request url
			 */
			param : function(name) {
				if (N.isEmptyObject(name)) {
					if (this.options.url.indexOf("?") < 0) {
						return {};
					} else {
						var params = {};
						var parts = this.options.url.split("?")[1].substring(1).split('&');
						for (var i = 0; i < parts.length; i++) {
							var nv = parts[i].split('=');
							if (!nv[0])
								continue;
							params[nv[0]] = decodeURIComponent(nv[1]) || true;
						}
						return params;
					}
				} else {
					return this.param()[name];
				}
			}
		});

		/**
		 * TODO ServiceController 의 생명주기는 view 엘레먼트가 없어지면 같이 없어져야 한다. 옵져버 싱글톤도 함께.
		 */
		var ServiceController = N.service = function(obj, callback) {
			if(callback === undefined) {
				return obj.data(obj.attr("id"));
			}
			if(obj.length > 1) {
				obj = N($.grep(obj, function(ele) { return !$(ele).hasClass(obj.attr("id") + "__ view_context__"); }));
			}
			obj.addClass(obj.attr("id") + "__ view_context__");

			obj.instance("service", callback);

			callback.view = obj;
			if(N.service.init && callback.init !== undefined) {
				callback.init(callback.view);
			}
			return callback;
		};
		N.service.init = true;

		// Context Object
		N.context = {
			attrObj : {},
			attr : Controller.request.fn.attr
		};

	})(NTR);

})(window, jQuery);