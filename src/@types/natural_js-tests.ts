N(".button").remove_(1, 2);
N(".button").tpBind("click", function (e: Event) {});
N(".button").events("click", "grid");
N.locale("en-US");
N(".button").on("click", function (e) {
    N.event.disable(e);
    N.event.isNumberRelatedKeys(e);
});
NC.serialExecute(function (a: any) {

}, function (b: any, c: any) {

});
N.gc.full();
N.gc.ds();
N.gc.minimum();
N.string.trimToZero("");
N.string.rpad("Hello", 10, "World");
N.element.toOpts(N("div"));
N.browser.scrollbarWidth();
N.browser.cookie("test", "test cookie value", 1, "localhost");

const selector = N("asdf").selector;

N("").datasort("asd", false);
N.validator.frn_rrn("");

N.ajax({
    url: "http://localhost:8080",
    type: NA.Request.HttpMethod.POST,
    dataType: NA.Request.DataType.JSON,
    enctype: NA.Request.Enctype.URLENCODED
});
N.comm(N([]), {
    url: "https://localhost:8080"
}).submit(function () {});
N([]).comm({
    url: "http://localhost:8080",
    type: NA.Request.HttpMethod.POST,
    dataType: NA.Request.DataType.JSON,
    enctype: NA.Request.Enctype.URLENCODED
}).submit(function () {});
N.comm(N([]), "https://localhost:8080").request.attr("asd", "").error(function(xhr, textStatus, e, request, submitCallback) {

}).submit(function () {

});
N([]).comm("http://localhost:8080").request.attr("asd", "").request.attr("asd", "asd").submit(function () {

});

N.context.attr("asdf");
N.cont(N(".context"), {
    init: function (view, request) {
        this.view = view;
    }
});
N(".context").cont({
    init: function (view, request) {
        
    }
});

N.formatter.rpad("asf", []);
N.validator.rrn("asf");
N([]).datasort([], false);

N(window).alert({}).show();
new N.alert(N(window), {
    msg: "Hello"
}).show();
N([]).pagination({}).bind();
new N.pagination([], {});

N({}).notify({}).add("asd");
N.notify({}, {}).add("asd");
N.notify({}).add("asd");
N.notify.add("asd", "");

const docs1 = N(".context").docs({});
const docs2 = new N.docs(N(".context"), {});
