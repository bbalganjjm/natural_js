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
N.comm(N([]), "https://localhost:8080").request.attr("asd", "").error(function(xhr: JQuery.jqXHR, textStatus: JQuery.Ajax.TextStatus, e: Error, request: NA.Request, submitCallback: NA.Request.SubmitCallback) {

}).submit(function () {

});
N([]).comm("http://localhost:8080").request.attr("asd", "").request.attr("asd", "asd").submit(function () {

});

N.context.attr("asdf");

// FIXME fn01 안보임.
const cont = new N.cont(N(".context"), {
    init: function (view, request) {
        view.each(function () {});
    },
    fn01: function () {
        this.view!.each(function () {});
        console.log(this.request!.attr("param"));
    }
});

// FIXME fn01 안보임.
N(".context").cont({
    init: function (view, request) {
        view.each(function () {});
    },
    fn01: function () {
        this.view!.each(function () {});
        this.request!.attr("param", {a:1});
    }
});

cont.fn01();

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
const alertInst = new N.alert(N(window), {
    msg: "Hello"
}).show();
alertInst.context("span").each(function (index, element) {});

N(".button").button({
    color: "primary_container"
}).disable();
new N.button(N(".button"), {
    color: "primary_container"
}).disable();

N(".tab").tab({
    tabOpts: [{
        url: "http://localhost:8080",
    }]
}).cont().view!.find(".tab-pane").remove();
new N.tab(N(".tab"), {
    tabOpts: [{
        url: "http://localhost:8080",
    }]
}).cont(0).view!.find(".tab-pane").remove();
N(".tab").tab({
    tabOpts: [{
        url: "http://localhost:8080",
    }]
}).open().cont.view!.find(".tab-pane").remove();


N([{}, {}]).each((index, element) => {});


new N.select(N([{a:1}]), N(".select", cont.view)).data(false).each((index, element) => {});
new N.select(N([{a:1}]), N(".select", cont.view)).data().forEach(function (item) {});
new N.select(N([{a:1}]), N(".select", cont.view)).data(true).forEach(function (item) {});
new N.select(N([{a:1}]), N(".select", cont.view)).context("option").get().forEach(function (item) {});
N([{a:1}]).select(N(".select", cont.view)).data(false).each((index, element) => {});
N([{a:1}]).select(N(".select", cont.view)).data().forEach(function (item) {});
N([{a:1}]).select(N(".select", cont.view)).data(true).forEach(function (item) {});
N([{a:1}]).select(N(".select", cont.view)).context("option").get().forEach(function (item) {});


N([{a:1}]).form({
    context: N(".form", cont.view)
}).data(false).each((index, element) => {});
N([{a:1}]).form(N(".form", cont.view)).data().forEach(function (item) {});
N([{a:1}]).form(N(".form", cont.view)).data(true).forEach(function (item) {});
N([{a:1}]).form(N(".form", cont.view)).context("option").get().forEach(function (item) {});

N([]).pagination({}).bind();
new N.pagination(N([]), {

}).bind();

N({}).notify({}).add("asd");
N.notify({}, {}).add("asd");
N.notify({}).add("asd");
N.notify.add("asd", "");

const docs1 = N(".context").docs({});
const docs2 = new N.docs(N(".context"), {});
