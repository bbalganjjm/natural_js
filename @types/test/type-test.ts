N("#asd").alert({
    msg: "asd",
    onOk: function (msgContext?: NHTMLElement, msgContents?: NHTMLElement): void {
        console.log(1);
    }
}).show();

N.alert(N("#asd"), {
    msg: "asd",
    onOk: function (msgContext?: NHTMLElement, msgContents?: NHTMLElement): void {
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
