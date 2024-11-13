N.locale("en-US");
N.string.trimToZero("");
N.string.rpad("Hello", 10, "World");
N.gc.ds();
N.event.disable(Event);

const selector = N("asdf").selector;

N("").datasort("asd", false);
N([]).pagination({});
N.validator.frn_rrn("");
N.comm(N([]), "https://localhost:8080").submit(function () {});
N([]).comm("http://localhost:8080").submit(function () {});
N.comm(N([]), "https://localhost:8080").request.attr("asd", "").submit(function () {});
N([]).comm("http://localhost:8080").request.attr("asd", "").request.attr("asd", "asd").submit(function () {});

N.context.attr("asdf");
N.cont(N(".context"), {});
N(".context").cont({});

N.formatter.rpad("asf", []);
N.validator.rrn("asf");
N([]).datasort([], false);

N(window).alert({}).show();
new N.alert(N(window), {}).show();
N([]).pagination({}).bind();
new N.pagination([], {});

N({}).notify({}).add("asd");
N.notify({}, {}).add("asd");
N.notify({}).add("asd");
N.notify.add("asd", "");

const docs1 = N(".context").docs({});
const docs2 = new N.docs(N(".context"), {});
