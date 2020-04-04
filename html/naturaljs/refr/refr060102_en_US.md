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

###Get list of dates for this month
The N.date.dateList function makes it easy to create content that requires a calendar, such as a schedule management.
```
var dateList = N.date.dateList(2020, 04);
N(dateList).each(function(i, week) {
    N(week).each(function(j, date) {
        N.log(date.formatDate("Y-m-d"), "week : " + i, "day : " + j);
    });
});
```

###Fill the screen with pop-up on the small screen(mobile, etc.)
```
var cont = this;

popupOpts = {
	closeMode : "remove",
	opener : cont
};

if(N(window).width() <= 414) {
	popupOpts.draggable = false;
	popupOpts.onShow = function(msgContext, msgContents) {
		cont.scrollTop = N(window).scrollTop();
		N("html, body").css("overflow", "hidden");
	}
	popupOpts.onBeforeRemove = function(msgContext, msgContents) {
		N("html, body").css("overflow", "");
		N(window).scrollTop(cont.scrollTop);
	}
	popupOpts.width = function(msgContext, msgContents) {
		return N(window).width();
	};
	popupOpts.height = function(msgContext, msgContents) {
		return N(window).height() - msgContents.show().find(".msg_title_box__").height();
	};
}

N().popup(popupOpts).open();
```