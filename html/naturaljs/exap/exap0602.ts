(function () {

    const cont = N(".exap0602").cont({
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
            // 2. initialize buttons
            N(".buttons a", cont.view).button();

            // 3. initialize N.form
            cont.form = N([]).form({
                context : N("#detail", cont.view),
                revert : true
            });
            if(cont.request?.attr("selData") !== undefined) {
                // 3-1-1. N.form data bind
                cont.form.bind(0, cont.request?.attr("selData"));
            } else {
                // 3-1-2. N.form data bind
                cont.form.add();
            }
        },
        setEvents : function() {
            // 4. bind events
            // 4-1 Save data to server
            N("#btnSave", cont.view).on("click", function(e) {
                e.preventDefault();
                if(cont.form.data(true)[0].rowStatus === undefined) {
                    N(window).alert(N.message.get(cont.messages, "EXAP0602-0004")).show();
                    return false;
                }
                if(cont.form.validate()) {
                    N(window).alert({
                        msg : N.message.get(cont.messages, "EXAP0602-0003"),
                        confirm : true,
                        onOk : function(): undefined {
                            N(cont.form.data(true)).comm({
                                type : cont.request?.attr("selData") !== undefined ? NA.Objects.Request.HttpMethod.PATCH : NA.Objects.Request.HttpMethod.POST,
                                url : "html/naturaljs/exap/data/sample.json" + (cont.request?.attr("selData") !== undefined ? "/" + cont.form.val("key") : "")
                            }).submit(function(data) {
                                let msg;
                                if(data as number > 0) {
                                    msg = N.message.get(cont.messages, "EXAP0602-0001");
                                } else {
                                    msg = N.message.get(cont.messages, "EXAP0602-0002");
                                }
                                N(window).alert({
                                    msg : msg,
                                    onOk : function(): undefined {
                                        N(cont.view?.parent("#subContext")).comm("html/naturaljs/exap/exap0601.html")
                                            .request.attr("selData", cont.form.data(true))
                                            .request.attr("scData", cont.request?.attr("scData"))
                                            .request.attr("pageNo", cont.request?.attr("pageNo"))
                                            .submit();
                                    }
                                }).show();
                            });
                        }
                    }).show();
                }
            });
            // 4-2 Revert to initialized data
            N("#btnRevert", cont.view).on("click", function(e) {
                e.preventDefault();
                cont.form.revert();
            });

            // 3-3 Go to list page
            N("#btnList", cont.view).on("click", function(e) {
                e.preventDefault();
                // Return list page with search condition data
                N(N.context.attr("architecture").page.context).comm("html/naturaljs/exap/exap0600.html")
                    .request.attr("scData", cont.request?.attr("scData"))
                    .request.attr("pageNo", cont.request?.attr("pageNo"))
                    .submit();
            });
        },
        messages : {
            "ko_KR" : {
                "EXAP0602-0001" : "저장이 완료되었습니다.",
                "EXAP0602-0002" : "저장이 완료되지 않았습니다. 관리자에게 문의 바랍니다.",
                "EXAP0602-0003" : "저장이 하겠습니까?",
                "EXAP0602-0004" : "변경된 데이터가 없습니다."
            },
            "en_US" : {
                "EXAP0602-0001" : "Saving is complete.",
                "EXAP0602-0002" : "Saving is not complete. Please contact the administrator.",
                "EXAP0602-0003" : "Do you want to save it?",
                "EXAP0602-0004" : "No changed data."
            }
        }
    });

})();