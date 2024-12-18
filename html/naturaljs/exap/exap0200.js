"use strict";
(function () {
    const cont = N(".exap0200").cont({
        init: function (view, request) {
            cont._key = "101";
            cont.setComponents();
        },
        setComponents: function () {
            // 1. initialize buttons
            N(".buttons a", cont.view).button();
            // 2. initialize N.form
            cont.form = N([]).form(N("#detail", cont.view));
            // 2-1. Bind form data
            N.comm("html/naturaljs/exap/data/" + cont._key + ".json").submit(function (data) {
                // Data bind by N.form
                cont.form.bind(0, data);
            });
        },
        messages: {
            "ko_KR": {},
            "en_US": {}
        }
    });
})();
