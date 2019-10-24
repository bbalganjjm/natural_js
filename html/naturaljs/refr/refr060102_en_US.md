Tips
===

###Initialize by binding empty objects to data-related components
```
nFormInstance.unbind().bind(0, []); // N.form
nGridInstance.bind([]); // N.grid
nListInstance.bind([]); // N.list
nSelectInstance.bind([]); // N.select
nPaginationInstance.bind([]); // N.pagination
nTreeInstance.bind([]); // N.tree
```

###Fill the screen with pop-up on the small screen(mobile, etc.)
```
var cont = this;

popupOpts = {
	closeMode : "remove",
	opener : cont
};

if($(window).width() <= 414) {
 	popupOpts.draggable = false;
 	popupOpts.onShow = function(msgContext, msgContents) {
 		cont.scrollTop = $(window).scrollTop();
		$("html, body").css("overflow", "hidden");
	}
 	popupOpts.onRemove = function(msgContext, msgContents) {
 		$("html, body").css("overflow", "");
 		$(window).scrollTop(cont.scrollTop);
	}
	popupOpts.width = function(msgContext, msgContents) {
		return $(window).width(); 
	};
	popupOpts.height = function(msgContext, msgContents) {
		return $(window).height() - msgContents.show().find(".msg_title_box__").height(); 
	};
}

N().popup(popupOpts).open();
```