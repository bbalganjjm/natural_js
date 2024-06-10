Tips
===

###⊙ Initialize by binding empty objects to data-related components
```
nFormInstance.unbind().bind(0, []); // N.form
nGridInstance.bind([]); // N.grid
nListInstance.bind([]); // N.list
nSelectInstance.bind([]); // N.select
nPaginationInstance.bind([]); // N.pagination
nTreeInstance.bind([]); // N.tree
```

###⊙ Getting a list of dates for the specified year and month.
The N.date.dateList function makes it easy to create content that requires a calendar, such as a schedule management.
```
var dateList = N.date.dateList(2020, 04);
N(dateList).each(function(i, week) {
    N(week).each(function(j, date) {
        N.log(date.formatDate("Y-m-d"), "week : " + i, "day : " + j);
    });
});
```

###⊙ Fill the screen with pop-up on the small screen(mobile, etc.)
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

###⊙ Resolving data synchronization problems that occur when the add method is executed on a data-related component
If data is stored as a variable of the Controller object and shared, when creating new data with the add method of the component, the problem that data in the variable is not created new row data.
The reason for this problem is the data related components of Natural-JS are convert data of array[object] type to data of jQuery object[array[object]] type when data is input.

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
    // No row data is added.
    this.data.length // 2
},
...
```
To solve the above problem, just convert the data to a jQuery object in advance and then bind it.

```
...
data : [{ col01 : 1, col01 : 2 }, { col01 : 3, col01 : 4 }],
init : function() {
    // Converts to jQuery object.
    this.data = N(this.data);

    var grid = N([]).grid();
    grid.bind(this.data);

    grid.data() === this.data // true
    grid.data()[0] === this.data[0] // true

    grid.add();
    grid.data().length // 3
    // Row data is added.
    this.data.length // 3
},
...
```
Binding the returned data to another component with setting the first argument of the data method to false will also fix the problem

```
...
init : function() {
    var form = N([]).form();
    var grid = N([]).grid();

    N.comm("data url").submit(function(data) {
        form.bind(0, data);
        // You must set the first argument of the data method to false so that the data object of the original type is returned.
        grid.bind(form.data(false));
    });

    form.data() === grid.data() // true
},
...
```