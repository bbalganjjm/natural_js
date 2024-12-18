(function () {

    const cont = N(".exap0300").cont({
        init : function(view, request) {
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
            // 2. initialize N.button.
            N(".buttons a", cont.view).button();

            // 3. initialize N.form and generate new data
            cont.form = N([]).form({
                context : N("#detail", cont.view),
                revert : true
            }).add();
        },
        setEvents : function() {
            // 4. bind events
            // 4-1 Save data to server
            N("#btnSave", cont.view).on("click", function(e) {
                e.preventDefault();
                if(cont.form.validate()) {
                    N(window).alert({
                        msg : N.message.get(cont.messages, "EXAP0300-0003"),
                        confirm : true,
                        onOk : function() {
                            N(cont.form.data(true)).comm({
                                type : NA.Objects.Request.HttpMethod.POST,
                                url : "html/naturaljs/exap/data/sample.json"
                            }).submit(function(data) {
                                let msg;
                                if(data as number > 0) {
                                    msg = N.message.get(cont.messages, "EXAP0300-0001");
                                } else {
                                    msg = N.message.get(cont.messages, "EXAP0300-0002");
                                }
                                N(window).alert(msg).show();
                            });
                        }
                    }).show();
                }
            });
            // 4-2 Reset to initialized data
            N("#btnRevert", cont.view).on("click", function(e) {
                e.preventDefault();
                cont.form.revert();
            });
        },
        messages : {
            "ko_KR" : {
                "EXAP0300-0001" : "저장이 완료되었습니다.",
                "EXAP0300-0002" : "저장이 완료되지 않았습니다. 관리자에게 문의 바랍니다.",
                "EXAP0300-0003" : "저장이 하겠습니까?"
            },
            "en_US" : {
                "EXAP0300-0001" : "Saving is complete.",
                "EXAP0300-0002" : "Saving is not complete. Please contact the administrator.",
                "EXAP0300-0003" : "Do you want to save it?"
            }
        }
    });

})();