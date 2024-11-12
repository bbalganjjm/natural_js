N.locale("en-US");
N.string.trimToZero("");
N.string.rpad("Hello", 10, "World");
const selector = N("asdf").selector;

N("").datasort("asd", false);
N([]).pagination({});
N.validator.frn_rrn("");
N.comm(N([]), "https://localhost:8080").submit(function () {});
N([]).comm("http://localhost:8080").submit(function () {});
N.comm(N([]), "https://localhost:8080").request.attr("asd", "").submit(function () {});
N([]).comm("http://localhost:8080").request.attr("asd", "").submit(function () {});

N.context.attr("asdf");
N.cont(N(".context"), {});
N(".context").cont({}); // TODO Type 검사 제대로 안돼는것 같음.

// TODO N.notify.add
