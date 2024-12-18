(function () {

    const cont = N(".exap0700").cont({
        init : function(view, request) {
            cont.setCodes([ "gender", "eyeColor" ], function() {
                // The N.select component must be initialized before data-related components such as N.grid or N.form are initialized.
                cont.setComponents();
                cont.setEvents();
            });
        },
        setCodes : function(codeParams: string[], afterCodeInitFn: Function) {
            // 1. initialize N.select and bind the code data.
            N({ codes : codeParams }).comm("html/naturaljs/exap/data/code.json").submit(function(data, request) {
                N(codeParams).each(function(i, code) {
                    N(data as NC.JSONObject[]).datafilter("code === '" + code + "'").select(N(".searchBox #" + code, cont.view)).bind();
                });

                afterCodeInitFn.call(cont);
            });
        },
        setComponents : function() {
            // 2. initialize buttons
            N(".buttons a", cont.view).button();

            // 3. initialize N.form and add new row data for search box
            cont.form = N([]).form({
                context : N("div.searchBox li.inputs", cont.view)
            }).add();

            // 4. initialize N.grid and bind empty data for data list
            cont.grid = N([]).grid({
                context : N("#grid", cont.view),
                data : [],
                height : 350,
                resizable : true,
                sortable : true,
                select : true,
                unselect : false,
                onSelect : function(index, rowEle, data) { // Grid row select event

                    // 5. initialize N.popup and open.
                    const popupOpts: NU.Options.Popup = {
                        url : "html/naturaljs/exap/exap0701.html",
                        title : N.message.get(cont.messages, "EXAP0700-0001"),
                        alwaysOnTop : true,
                        button : false,
                        closeMode : "remove",
                        onOpen : "onOpen",
                        opener : cont
                    };

                    // Full size popup option for mobile
                    if(N(window).width() as number <= 414) {
                        popupOpts.draggable = false;
                        popupOpts.onShow = function(msgContext, msgContents) {
                            cont.scrollTop = N(window).scrollTop();
                            N("html, body").css("overflow", "hidden");
                        }
                        popupOpts.onBeforeRemove = function(msgContext, msgContents) {
                            N("html, body").css("overflow", "");
                            N(window).scrollTop(cont.scrollTop);
                        }
                        popupOpts.width = function(msgContext, msgContents) {
                            return N(window).width() as number;
                        };
                        popupOpts.height = function(msgContext, msgContents) {
                            return N(window).height() as number - msgContents?.show().find(".msg_title_box__").height();
                        };
                    }

                    N().popup(popupOpts).open({
                        grid : cont.grid,
                        data : data,
                        row : index
                    });
                },
                filter : true
            });
        },
        setEvents : function() {
            // 6. bind events
            // 6-1. Save button
            N("#btnSave", cont.view).on("click", function(e) {
                e.preventDefault();

                if(cont.grid.data("modified").length === 0) {
                    N.notify.add(N.message.get(cont.messages, "EXAP0700-0003"));
                    return false;
                }

                if(cont.grid.validate()) {
                    N(window).alert({
                        msg : N.message.get(cont.messages, "EXAP0700-0005"),
                        confirm : true,
                        onOk : function() {
                            N(cont.grid.data("modified")).comm({
                                type : NA.Objects.Request.HttpMethod.PUT,
                                dataIsArray : true, // When sending multiple rows of data(array<json object>).
                                url : "html/naturaljs/exap/data/sample.json"
                            }).submit(function(data) {
                                let msg = N.message.get(cont.messages, "EXAP0500-0002") + "<br>";
                                const cnt = (data as { insert: string }).insert;
                                msg += N.message.get(cont.messages, "EXAP0500-0006", [cnt]) + "<br>";
                                msg += N.message.get(cont.messages, "EXAP0500-0007", [cnt]) + "<br>";
                                msg += N.message.get(cont.messages, "EXAP0500-0008", [cnt]);
                                N(window).alert({
                                    msg : msg,
                                    onOk : function() {
                                        N("#btnSearch", cont.view).trigger("click");
                                    }
                                }).show();
                            });
                        }
                    }).show();
                }
            });
            // 6-2. Search button
            N("#btnSearch", cont.view).on("click", function(e) {
                e.preventDefault();
                if(cont.form.validate()) {
                    N(cont.form.data(true)).comm("html/naturaljs/exap/data/sample.json").submit(function(data) {
                        // Data bind to N.grid
                        cont.grid.bind(data);
                    });
                }
            }).trigger("click"); // Auto retrieve
        },
        messages : {
            "ko_KR" : {
                "EXAP0700-0001" : "상세",
                "EXAP0700-0002" : "저장이 완료되었습니다.",
                "EXAP0700-0003" : "변경된 데이터가 없습니다.",
                "EXAP0700-0005" : "저장 하시겠습니까?",
                "EXAP0700-0006" : " - 입력 : {0} 건",
                "EXAP0700-0007" : " - 수정 : {0} 건",
                "EXAP0700-0008" : " - 삭제 : {0} 건"
            },
            "en_US" : {
                "EXAP0700-0001" : "Detail",
                "EXAP0700-0002" : "Saving is complete.",
                "EXAP0700-0003" : "No changed data.",
                "EXAP0700-0005" : "Do you want to save it?",
                "EXAP0700-0006" : " - Create : {0} rows",
                "EXAP0700-0007" : " - Update : {0} rows",
                "EXAP0700-0008" : " - Delete : {0} rows"
            }
        }
    });

})();