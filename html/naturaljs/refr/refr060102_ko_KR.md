팁
===

###⊙ 데이터 관련 컴포넌트에 비어있는 객체를 바인드하여 초기화 하기
```
nFormInstance.unbind().bind(0, []); // N.form
nGridInstance.bind([]); // N.grid
nListInstance.bind([]); // N.list
nSelectInstance.bind([]); // N.select
nPaginationInstance.bind([]); // N.pagination
nTreeInstance.bind([]); // N.tree
```

###⊙ 지정한 연도와 월에 해당하는 날짜 목록을 가져오기
N.date.dateList 함수를 사용하면 일정관리등의 달력 이 필요한 컨텐츠를 쉽게 만들 수 있습니다.
```
var dateList = N.date.dateList(2020, 5);
N(dateList).each(function(i, week) {
    N(week).each(function(j, date) {
        N.log(date.formatDate("Y-m-d"), "week : " + i, "day : " + j);
    });
});
```

###⊙ 작은 화면에서(모바일 등) 팝업을 화면에 꽉 채워서 표시 하기
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

###⊙ 데이터 관련 컴포넌트에서 add 메서드를 실행 했을 때 발생 하는 데이터 동기화 문제 해결 하기
Natural-JS의 데이터 관련 컴포넌트들은 array[object] 타입의 data 가 입력 되면 jquery object[array[object]] 형태로 변환(jquery object 로 변환) 하여 사용하기 때문에 data 를 Controller object의 변수로 담아 놓고 공유 해서 사용하는 경우 컴포넌트의 add 메서드로 새로운 데이터를 생성했을 때 변수로 담아 놓은 데이터는 새로운 행 데이터가 생성 되지 않는 문제가 발생 됩니다.

```
...
data : [{ col01 : 1, col01 : 2 }, { col01 : 3, col01 : 4 }],
init : function() {
    var grid = N([]).grid();
    grid.bind(this.data);

    grid.data() === this.data // false

    grid.data()[0] === this.data[0] // true

    grid.add();
    grid.data().length // 3
    // 행 데이터가 추가 되지 않음.
    this.data.length // 2
},
...
```
위와 같은 문제를 해결 하려면 미리 data 를 jquery object 로 변환 한 다음 바인딩하면 됩니다.

```
...
data : [{ col01 : 1, col01 : 2 }, { col01 : 3, col01 : 4 }],
init : function() {
    // Converts to jquery object.
    <strong>this.data = N(this.data);</strong>

    var grid = N([]).grid();
    grid.bind(this.data);

    grid.data() === this.data // true
    grid.data()[0] === this.data[0] // true

    grid.add();
    grid.data().length // 3
    // 행 데이터가 추가 되어 있음
    this.data.length // 3
},
...
```
data 메서드의 첫번째 인자를 false 로 설정해서 반환 된 데이터를 다른 컴포넌트에 바인딩 해도 문제가 해결 됩니다.

```
...
init : function() {
    var form = N([]).form();
    var grid = N([]).grid();

    N.comm("data url").submit(function(data) {
        form.bind(0, data);
        // 원래 유형의 데이터 객체가 반환 되도록 data 메소드의 첫 번째 인자를 false로 설정해야합니다.
        grid.bind(form.data(false));
    });

    form.data() === grid.data() // true
},
...
```