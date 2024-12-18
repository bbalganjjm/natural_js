(function () {

    const cont = N(".exap0702").cont({
        init : function(view, request) {
            cont.caller = cont.request?.attr("caller");

            cont.setCodes([ "gender", "eyeColor", "company", "favoriteFruit" ], function() {
                // The N.select component must be initialized before data-related components such as N.grid or N.form are initialized.
                cont.setComponents();
                cont.setEvents();
            });
        },
        setCodes : function(codeParams: string[], afterCodeInitFn: Function) {
            // 1. initialize N.select and bind the code data.
            N({ codes : codeParams }).comm("html/naturaljs/exap/data/code.json").submit(function(data, request) {
                N(codeParams).each(function(i, code) {
                    N(data as NC.JSONObject[]).datafilter("code === '" + code + "'").select(N("#detail #" + code, cont.view)).bind();
                });

                afterCodeInitFn.call(cont);
            });
        },
        setComponents : function() {
            // 2. initialize buttons
            N(".buttons a", cont.view).button();

            // 3. initialize N.form
            cont.form = cont.request?.attr("selData").data.form({
                context : N("#detail", cont.view),
                addTop : true,
                revert : true
            });
            if(cont.request?.attr("mode") === "create") {
                // 3-1. Create mode - add data
                cont.form.add();
            } else {
                // 3-1. Edit mode - bind data
                cont.form.bind(cont.request?.attr("selData").row, cont.request?.attr("selData").data);
            }
        },
        setEvents : function() {
            // 4. bind events
            // 4-1 Confirm button
            N("#btnConfirm", cont.view).on("click", function(e) {
                e.preventDefault();
                if(cont.form.validate()) {
                    cont.caller?.close()
                }
            });
            // 4-2 Cancel button - Revert data & close this popup
            N("#btnCancel", cont.view).on("click", function(e) {
                e.preventDefault();
                if(cont.request?.attr("mode") === "create") {
                    // remove created row
                    cont.form.remove();
                } else {
                    cont.form.revert();
                }
                cont.caller?.close()
            });
        }
    });

})();