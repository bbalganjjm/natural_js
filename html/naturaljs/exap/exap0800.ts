(function () {

    const cont = N(".exap0800").cont({
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
            N(".searchBox a", cont.view).button();

            // 3. initialize forms
            // 3-1. initialize search form and add new row data
            cont.searchForm = N([]).form({
                context : N("div.searchBox li.inputs", cont.view)
            }).add();
            // 3-2. initialize detail form
            cont.detailForm = N([]).form({
                context : N("#detail", cont.view),
                revert : true,
                autoUnbind : true
            });

            // 4. initialize N.grid and bind empty data for data list
            cont.grid = N([]).grid({
                context : N("#grid", cont.view),
                data : [],
                height : 408,
                resizable : true,
                sortable : true,
                addSelect : false,
                selectScroll : false,
                select : true,
                filter : true,
                unselect : false,
                addTop : true,
                onSelect : function(index, rowEle, data, beforeRow) {
                    // Grid row select event

                    // cont.detailForm.row() = -1 is unbind flag
                    if(cont.detailForm.row() > -1 &&  data[index].rowStatus !== "insert") {
                        if(!cont.detailForm.validate()) {
                            return false;
                        }
                    }

                    if(this.context("> tbody:eq(" + beforeRow + ")").hasClass("row_data_changed__")) {
                        if(index !== cont.detailForm.row()) {
                            N(window).alert({
                                msg : N.message.get(cont.messages, "EXAP0800-0003"),
                                confirm : true,
                                onOk : function() {
                                    // 5. bind data to detail form;
                                    cont.detailForm.bind(index, data);
                                    rowEle.trigger("click");
                                }
                            }).show();
                        }
                    } else {
                        // 5. bind data to detail form;
                        cont.detailForm.bind(index, data);
                    }
                },
                onBind : function(context, data, isFirstPage, isLastPage) {
                    if(isFirstPage) {
                        this.select(0);
                    }
                }
            });
        },
        setEvents : function() {
            // 6. bind events
            // 6-1. Search button
            N("#btnSearch", cont.view).on("click", function(e) {
                e.preventDefault();
                if(cont.searchForm.validate()) {
                    N(cont.searchForm.data()).comm("html/naturaljs/exap/data/sample.json").submit(function(data) {
                        // N.grid bind
                        cont.grid.bind(data);
                    });
                }
            }).trigger("click"); // Auto retrieve

            // 6-2. Save button
            N("#btnSave", cont.view).on("click", function(e) {
                e.preventDefault();

                if(cont.grid.data("modified").length === 0) {
                    N.notify.add(N.message.get(cont.messages, "EXAP0800-0001"));
                    return false;
                }

                // do validate;
                // cont.detailForm.row() = -1 is unbind flag
                if(cont.detailForm.row() > -1) {
                    if(!cont.detailForm.validate()) {
                        return false;
                    }
                }

                N(window).alert({
                    msg : N.message.get(cont.messages, "EXAP0800-0005"),
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
            });

            // 6-3 New button
            N("#btnAdd", cont.view).on("click", function(e) {
                e.preventDefault();

                if(cont.detailForm.validate()) {
                    // Add row from N.form
                    cont.detailForm.add();
                }
            });

            // 6-4 Delete button
            N("#btnDelete", cont.view).on("click", function(e) {
                e.preventDefault();

                // Remove row from N.grid
                cont.detailForm.remove();
            });

            // 6-5 Revert button
            N("#btnRevert", cont.view).on("click", function(e) {
                e.preventDefault();

                if(cont.grid.data("modified").length === 0) {
                    N.notify.add(N.message.get(cont.messages, "EXAP0800-0001"));
                    return false;
                }

                cont.detailForm.revert();
            });
        },
        messages : {
            "ko_KR" : {
                "EXAP0800-0001" : "변경된 데이터가 없습니다.",
                "EXAP0800-0002" : "저장이 완료되었습니다.",
                "EXAP0800-0003" : "데이터를 수정 중입니다. 선택한 행의 데이터를 조회 하겠습니까?",
                "EXAP0800-0005" : "저장 하시겠습니까?",
                "EXAP0800-0006" : " - 입력 : {0} 건",
                "EXAP0800-0007" : " - 수정 : {0} 건",
                "EXAP0800-0008" : " - 삭제 : {0} 건"
            },
            "en_US" : {
                "EXAP0800-0001" : "No changed data",
                "EXAP0800-0002" : "Saving is complete.",
                "EXAP0800-0003" : "You are on the editing the data. are you sure you want to retrieve the data from the selected row?",
                "EXAP0800-0005" : "Do you want to save it?",
                "EXAP0800-0006" : " - Create : {0} rows",
                "EXAP0800-0007" : " - Update : {0} rows",
                "EXAP0800-0008" : " - Delete : {0} rows"
            }
        }
    });

})();