(function () {

    const cont = N(".exap0100").cont({
        init: function (view, request) {
            cont.setCodes(["gender", "eyeColor"], function () {
                // The N.select component must be initialized before data-related components such as N.grid or N.form are initialized.
                cont.setComponents();
                cont.setEvents();
            });
        },
        setCodes: function (codeParams: string[], afterCodeInitFn: Function) {
            // 1. initialize N.select and bind the code data.
            N({codes: codeParams}).comm("html/naturaljs/exap/data/code.json").submit(function (data, request) {
                N(codeParams).each(function (i, code) {
                    N(data as NC.JSONObject[]).datafilter("code === '" + code + "'").select(N(".searchBox #" + code, cont.view)).bind();
                });

                afterCodeInitFn.call(cont);
            });
        },
        setComponents: function () {
            // 2. initialize N.button
            N(".buttons a", cont.view).button();

            // 3. initialize N.form and add new row data
            cont.form = N([]).form({
                context: N("div.searchBox li.inputs", cont.view),
                revert: true
            }).add();

            // 4. initialize N.grid and bind empty data
            cont.grid = N([]).grid({
                context: N("#grid", cont.view),
                data: [],
                height: 350,
                resizable: true,
                sortable: true,
                filter: true
            }).bind();
        },
        setEvents: function () {
            // 5. bind events
            N("#btnSearch", cont.view).on("click", function (e) {
                e.preventDefault();
                if (cont.form.validate()) {
                    N(cont.form.data(true)).comm("html/naturaljs/exap/data/sample.json").submit(function (data, request) {
                        cont.grid.bind(data);
                    });
                }
            });
        },
        messages: {
            "ko_KR": {},
            "en_US": {}
        }
    });

})();