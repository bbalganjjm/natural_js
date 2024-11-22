import SubmitCallback = NA.Request.SubmitCallback;

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
new Date().formatDate("Y-m-d");

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
// FIXME
N.comm(N([]), "https://localhost:8080").request.attr("asd", "").error(function(xhr: JQuery.jqXHR, textStatus: JQuery.Ajax.TextStatus, e: Error, request?: NA.Request, submitCallback: NA.Request.SubmitCallback) {

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

N.ds.instance(class {}, true)
    .remove()
    .notify(1, "");

new N.formatter(N([{}]), {
    "numeric" : [[ND.FormatRules.TRIMTOEMPTY], [ND.FormatRules.NUMERIC, "#,###.##0000"]],
    "generic" : [[ND.FormatRules.TRIMTOEMPTY], [ND.FormatRules.GENERIC, "@@ABCD"]],
    "limit" : [[ND.FormatRules.TRIMTOEMPTY], [ND.FormatRules.LIMIT, "13", "..."]],
    "etc" : [[ND.FormatRules.DATE, 12]]
}).format(1);
N([{}]).formatter({
    "numeric" : [[ND.FormatRules.TRIMTOEMPTY], [ND.FormatRules.NUMERIC, "#,###.##0000"]],
    "generic" : [[ND.FormatRules.TRIMTOEMPTY], [ND.FormatRules.GENERIC, "@@ABCD"]],
    "limit" : [[ND.FormatRules.TRIMTOEMPTY], [ND.FormatRules.LIMIT, "13", "..."]],
    "etc" : [[ND.FormatRules.DATE, 12]]
}).format(1);
N.formatter.rpad("asf", []);
new N.validator(N([{}]), {
    "numeric" : [[ND.ValidationRules.REQUIRED], [ND.ValidationRules.COMMAS_INTEGER]],
    "generic" : [[ND.ValidationRules.REQUIRED], [ND.ValidationRules.KOREAN]],
    "limit" : [[ND.ValidationRules.REQUIRED], [ND.ValidationRules.ALPHABET]]
}).validate(1);
N([{}]).validator({
    "numeric" : [[ND.ValidationRules.REQUIRED], [ND.ValidationRules.COMMAS_INTEGER]],
    "generic" : [[ND.ValidationRules.REQUIRED], [ND.ValidationRules.KOREAN]],
    "limit" : [[ND.ValidationRules.REQUIRED], [ND.ValidationRules.ALPHABET]]
}).validate(1);
N.validator.rrn("asf");
N([]).datasort("key", false);

N(window).alert("Hello").show();
new N.alert(N(window), {
    msg: "Hello"
}).show();

N(".button").button({
    color: "primary_container"
}).disable();
new N.button(N(".button"), {
    color: "primary_container"
}).disable();

N([]).pagination({}).bind();
new N.pagination([], {}).bind();

N({}).notify({}).add("asd");
N.notify({}, {}).add("asd");
N.notify({}).add("asd");
N.notify.add("asd", "");

const docs1 = N(".context").docs({});
const docs2 = new N.docs(N(".context"), {});
