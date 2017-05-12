/*!
 * Natural-UI.Shell v0.0.1.00
 * bbalganjjm@gmail.com
 *
 * Copyright 2017 KIM HWANG MAN
 * Released under the LGPL license
 *
 * Date: 2017-05-11T20:00Z
 */
(function(window, $) {
	N.version["Natural-UI.Shell"] = "v0.0.1.00";

	$.fn.extend($.extend(N.prototype, {
		notify : function(opts) {
			return new N.notify(this, opts);
		}
	}));

	(function(N) {

		// Notify
		var Notify = N.notify = function(position, opts) {
			this.options = {
				position : position,
				container : N("body"),
				context : null,
				displayTime : 7,
				alwaysOnTop : false,
				alwaysOnTopCalcTarget : "div, span, ul, p",
			};

			try {
				this.options = $.extend({}, this.options, N.context.attr("ui.shell").notify);
				if(position.length > 0) {
					this.options.position = position.get(0);
				}
			} catch (e) {
				N.error("[N.notify]" + e, e);
			}

			$.extend(this.options, opts);

			Notify.wrapEle.call(this);

			this.options.context.instance("notify", this);

			return this;
		};

		$.extend(Notify, {
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

				var msgEle = $(url !== undefined ? '<a href="#">' + msg + '</a>' : '<span>' + msg + '</span>');

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
				}).append(msgEle).appendTo(opts.context).slideDown(300);

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
				msgBoxEle.slideUp(300, function() {
					$(this).remove();
				});
				return this;
			}
		});

	})(N);

})(window, jQuery);