(function () {

    const cont = N(".exap0500").cont({
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
                    const filteredData = N(data as NC.JSONObject[]).datafilter("code === '" + code + "'");
                    filteredData.select(N(".searchBox #" + code, cont.view)).bind();
                    filteredData.select(N(".grid__ #" + code, cont.view)).bind();
                });

                afterCodeInitFn.call(cont);
            });
        },
        setComponents : function() {
            // 2. initialize buttons
            N(".buttons a", cont.view).button();

            // 3. initialize N.form and add new row data for search box
            cont.form = N([]).form({
                context : N("div.searchBox li.inputs", cont.view),
                revert : true
            }).add();

            // 4. initialize N.grid and bind empty data for data list
            cont.grid = N([]).grid({
                context : N("table#grid", cont.view),
                resizable : true,
                sortable : true,
                checkAll : "#checkAll",
                checkAllTarget : ".checkAllTarget"
            }).bind();
        },
        setEvents : function() {
            // 5. bind events
            // 5-1. Search button
            N("#btnSearch", cont.view).on("click", function(e) {
                e.preventDefault();
                if(cont.form.validate()) {
                    N(cont.form.data(true)).comm("html/naturaljs/exap/data/sample.json").submit(function(data, request) {
                        // Data bind by N.grid
                        cont.grid.bind(data);
                    });
                }
            });
            // 5-2. Add button
            N("#btnAdd", cont.view).on("click", function(e) {
                e.preventDefault();
                cont.grid.add();
            });
            // 5-3. Delete button
            N("#btnDelete", cont.view).on("click", function(e) {
                e.preventDefault();
                const checkedIndexs = cont.grid.check();
                if(checkedIndexs.length > 0) {
                    N(window).alert({
                        msg : N.message.get(cont.messages, "EXAP0510-0001"),
                        confirm : true,
                        onOk : function(): undefined {
                            cont.grid.remove(checkedIndexs);
                        }
                    }).show();
                } else {
                    N(window).alert(N.message.get(cont.messages, "EXAP0510-0004")).show();
                }
            });
            // 5-4. Save delete
            N("#btnSave", cont.view).on("click", function(e) {
                e.preventDefault();

                if(cont.grid.data("modified").length === 0) {
                    N.notify.add(N.message.get(cont.messages, "EXAP0510-0003"));
                    return false;
                }

                if(cont.grid.validate()) {
                    N(window).alert({
                        msg : N.message.get(cont.messages, "EXAP0510-0005"),
                        confirm : true,
                        onOk : function(): undefined {
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
                                    onOk : function(): undefined {
                                        N("#btnSearch", cont.view).trigger("click");
                                    }
                                }).show();
                            });
                        }
                    }).show();
                }
            });
        },
        messages : {
            "ko_KR" : {
                "EXAP0510-0001" : "삭제 하시겠습니까?<br/>저장 버튼을 누르기 전까지는 DB에 반영되지 않습니다.",
                "EXAP0510-0002" : "저장이 완료되었습니다.",
                "EXAP0510-0003" : "변경된 데이터가 없습니다.",
                "EXAP0510-0004" : "선택된 행이 없습니다.",
                "EXAP0510-0005" : "저장 하시겠습니까?",
                "EXAP0500-0006" : " - 입력 : {0} 건",
                "EXAP0500-0007" : " - 수정 : {0} 건",
                "EXAP0500-0008" : " - 삭제 : {0} 건"
            },
            "en_US" : {
                "EXAP0510-0001" : "Do you want to delete it?<br/>It will not be stored in the DB until you press the save button.",
                "EXAP0510-0002" : "Saving is complete.",
                "EXAP0510-0003" : "No changed data.",
                "EXAP0510-0004" : "No rows selected.",
                "EXAP0510-0005" : "Do you want to save it?",
                "EXAP0500-0006" : " - Create : {0} rows",
                "EXAP0500-0007" : " - Update : {0} rows",
                "EXAP0500-0008" : " - Delete : {0} rows"
            }
        }
    });

})();