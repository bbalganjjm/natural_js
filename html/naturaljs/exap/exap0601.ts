(function () {

    const cont = N(".exap0601").cont({
        init : function(view, request) {
            this.setComponents(this);
            this.setEvents(this);
        },
        setComponents : function() {
            // 1. initialize buttons
            N(".buttons a", cont.view).button();

            // 2. initialize N.form
            cont.form = N([]).form(N("#detail", cont.view));

            // 2-1. Data bind that transferred by request
            const data = cont.request?.attr("selData");
            cont.form.bind(0, data);
        },
        setEvents : function() {
            // 3. bind events
            // 3-1 Go to edit page
            N("#btnEdit", cont.view).on("click", function(e) {
                e.preventDefault();
                // Grid row select event
                N(cont.view?.parent()).comm("html/naturaljs/exap/exap0602.html")
                    .request.attr("selData", cont.request?.attr("selData")) // send selected row data
                    .request.attr("scData", cont.request?.attr("scData")) // send search condition data
                    .request.attr("pageNo", cont.request?.attr("pageNo"))
                    .submit();
            });
            // 3-2 Delete
            N("#btnDelete", cont.view).on("click", function(e) {
                e.preventDefault();
                N(window).alert({
                    msg : N.message.get(cont.messages, "EXAP0601-0003"),
                    confirm : true,
                    onOk : function(): undefined {
                        N(cont.form.data(true)).comm({
                            type : NA.Objects.Request.HttpMethod.DELETE,
                            url : "rest/sample/" + cont.form.val("key")
                        }).submit(function(data) {
                            let msg;
                            if(data as number > 0) {
                                msg = N.message.get(cont.messages, "EXAP0601-0001");
                            } else {
                                msg = N.message.get(cont.messages, "EXAP0601-0002");
                            }
                            N(window).alert({
                                msg : msg,
                                onOk : function(): undefined {
                                    N("#btnList", cont.view).trigger("click");
                                }
                            }).show();
                        });
                    }
                }).show();
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
                "EXAP0601-0001" : "삭제가 완료되었습니다.",
                "EXAP0601-0002" : "삭제가 완료되지 않았습니다. 관리자에게 문의 바랍니다.",
                "EXAP0601-0003" : "삭제 하겠습니까?"
            },
            "en_US" : {
                "EXAP0601-0001" : "Deleting is complete.",
                "EXAP0601-0002" : "Deleting is not complete. Please contact the administrator.",
                "EXAP0601-0003" : "Do you want to delete it?"
            }
        }
    });

})();