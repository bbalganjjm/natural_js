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

###이달의 날짜 목록 가져오기
N.date.dateList 함수를 사용하면 일정관리 등의 달력 이 필요한 컨텐츠를 쉽게 만들 수 있습니다.
```
var dateList = N.date.dateList(2020, 04);
N(dateList).each(function(i, week) {
    N(week).each(function(j, date) {
        N.log(date.formatDate("Y-m-d"), "week : " + i, "day : " + j);
    });
});
```

###작은 화면에서(모바일 등) 팝업을 화면에 꽉 채워서 표시 하기
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