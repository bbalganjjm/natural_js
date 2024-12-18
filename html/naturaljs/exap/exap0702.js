"use strict";
(function () {
    const cont = N(".exap0702").cont({
        init: function (view, request) {
            var _a;
            cont.caller = (_a = cont.request) === null || _a === void 0 ? void 0 : _a.attr("caller");
            cont.setCodes(["gender", "eyeColor", "company", "favoriteFruit"], function () {
                // The N.select component must be initialized before data-related components such as N.grid or N.form are initialized.
                cont.setComponents();
                cont.setEvents();
            });
        },
        setCodes: function (codeParams, afterCodeInitFn) {
            // 1. initialize N.select and bind the code data.
            N({ codes: codeParams }).comm("html/naturaljs/exap/data/code.json").submit(function (data, request) {
                N(codeParams).each(function (i, code) {
                    N(data).datafilter("code === '" + code + "'").select(N("#detail #" + code, cont.view)).bind();
                });
                afterCodeInitFn.call(cont);
            });
        },
        setComponents: function () {
            var _a, _b, _c, _d;
            // 2. initialize buttons
            N(".buttons a", cont.view).button();
            // 3. initialize N.form
            cont.form = (_a = cont.request) === null || _a === void 0 ? void 0 : _a.attr("selData").data.form({
                context: N("#detail", cont.view),
                addTop: true,
                revert: true
            });
            if (((_b = cont.request) === null || _b === void 0 ? void 0 : _b.attr("mode")) === "create") {
                // 3-1. Create mode - add data
                cont.form.add();
            }
            else {
                // 3-1. Edit mode - bind data
                cont.form.bind((_c = cont.request) === null || _c === void 0 ? void 0 : _c.attr("selData").row, (_d = cont.request) === null || _d === void 0 ? void 0 : _d.attr("selData").data);
            }
        },
        setEvents: function () {
            // 4. bind events
            // 4-1 Confirm button
            N("#btnConfirm", cont.view).on("click", function (e) {
                var _a;
                e.preventDefault();
                if (cont.form.validate()) {
                    (_a = cont.caller) === null || _a === void 0 ? void 0 : _a.close();
                }
            });
            // 4-2 Cancel button - Revert data & close this popup
            N("#btnCancel", cont.view).on("click", function (e) {
                var _a, _b;
                e.preventDefault();
                if (((_a = cont.request) === null || _a === void 0 ? void 0 : _a.attr("mode")) === "create") {
                    // remove created row
                    cont.form.remove();
                }
                else {
                    cont.form.revert();
                }
                (_b = cont.caller) === null || _b === void 0 ? void 0 : _b.close();
            });
        }
    });
})();
