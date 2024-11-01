N("#asd").alert({
    msg: "asd",
    onOk: function (msgContext?: NHTMLElement, msgContents?: NHTMLElement): undefined {
        console.log(1);
    }
}).show();

N.alert(N("#asd"), {
    msg: "asd",
    onOk: function (msgContext?: NHTMLElement, msgContents?: NHTMLElement): undefined {
        console.log(1);
    }
}).show();

N({}).comm("ttt").error(function (){}).submit(function () {});

const form = N.form({});
form.bind(0, [{}]);

N("#button").button({
    onBeforeCreate: function (btnContext: NHTMLElement, btnOpts: ButtonOpts): void {

    }
});

N({

}).notify({
    displayTime: 1
}).add("asd");

N.notify({
    position: {
        top: 12,
        right: 12
    },
    displayTime: 2
}).add("asd");

const docs = N("#asds").docs({
    onBeforeLoad: function (docContext: NHTMLElement, docOpts: DocOpts): void {
        console.log(1);
    }
});
docs.active("asd");;
docs.removeState("asd", function () {});
