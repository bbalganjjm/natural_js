팁
===

###데이터 관련 컴포넌트에 비어있는 객체를 바인드하여 초기화 하기
```
nFormInstance.unbind().bind(0, []); // N.form
nGridInstance.bind([]); // N.grid
nListInstance.bind([]); // N.list
nSelectInstance.bind([]); // N.select
nPaginationInstance.bind([]); // N.pagination
nTreeInstance.bind([]); // N.tree
```

###작은 화면에서(모바일 등) 팝업을 화면에 꽉 채워서 표시 하기
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