(function() {

    const cont: NT.Objects.Controller.Object = N(".type0401").cont({
        "p.select.gender" : [ "gender" ],
        "p.select.eyeColor" : [ "eyeColor" ],
        "p.select.company" : [ "company" ],
        "p.select.favoriteFruit" : [ "favoriteFruit" ],
        "p.select.age" : [ "c.getSampleCodeList", "age", "age", function(data) {
            return N(N.array.deduplicate(data, "age")).datasort("age");
        }],
        "p.form.search" : {
            "usage" : {
                "search-box" : {
                    "defaultButton" : ".btn-search",
                    "events" : [{
                        "event" : "focusin",
                        "target" : "#name",
                        "handler" : function(e) {
                            N.log(e);
                        }
                    }]
                }
            }
        },
        "p.form.detail" : {
            revert : true,
            autoUnbind : true
        },
        "p.grid.master" : {
            height : 486,
            select : true,
            selectScroll : false,
            onSelect : function(index, rowEle, data, beforeRow, e) {
                // 전처리

                (window as any).APP.comm.utils.selectNBind.call(this, {
                    args: arguments,
                    cont : cont,
                    form : "p.form.detail"
                });

                // 후처리
            },
            onBind : function(context, data, isFirstPage, isLastPage) {
                if(isFirstPage) {
                    this.select(0);
                }
            }
        },
        "p.popup.dept" : {
            url : "html/naturaljs/template/samples/type04P0.html",
            onOpen : "onOpen",
            height: 621,
            onClose : function(onCloseData) {
                if (onCloseData) {
                    cont["p.form.detail"]
                        .val("deptNm", onCloseData.deptNm)
                        .val("deptCd", onCloseData.deptCd);
                }
            }
        },
        "c.getSampleCodeList" : function() {
            return N.comm("sample/getSampleList.json");
        },
        "c.getSampleList" : function() {
            return cont["p.form.search"].data(false).comm("sample/getSampleList.json");
        },
        "c.saveSample" : function() {
            return N(cont["p.grid.master"].data("modified")).comm({
                dataIsArray : true, // Array 타입의 여러 행데이터가 1 개 일 때는 자동으로 Object 로 변환됩니다. 자동으로 변환되지 않게 하려면 dataIsArray 옵션을 true 로 지정해 주세요.
                url : "sample/saveSample.json"
            });
        },
        "e.btnSearch.click" : function(e) {
            e.preventDefault();

            if (cont["p.form.search"].validate()) {
                cont["c.getSampleList"]().submit(function(data) {
                    // N.grid bind
                    cont["p.grid.master"].bind(data as JSONObject[]);
                });
            }
        },
        "e.age.change" : {
            target : "#search #age",
            handler : function(e) {
                cont["e.btnSearch.click"].trigger("click");
            }
        },
        "e.eyeColor.change" : {
            target : "#search #eyeColor",
            handler : function(e) {
                cont["e.btnSearch.click"].trigger("click");
            }
        },
        "e.btnDeptCd.click" : function(e) {
            e.preventDefault();
            cont["p.popup.dept"].open(cont["p.form.detail"].data(true)[0]);
        },
        "e.btnSave.click" : function(e) {
            e.preventDefault();

            return (window as any).APP.comm.utils.save.call(this, {
                cont : cont,
                comm : "c.saveSample",
                changed : "p.grid.master",
                validate : "p.form.detail",
                before : function() {
                    // TODO
                },
                after : function(data: JSONObject[]) {
                    cont["e.btnSearch.click"].trigger("click");
                }
            });
        },
        "e.btnAdd.click" : function(e) {
            e.preventDefault();

            if (cont["p.form.detail"].validate()) {
                cont["p.form.detail"].add();
            }
        },
        "e.btnDelete.click" : function(e) {
            e.preventDefault();

            cont["p.form.detail"].remove();
        },
        "e.btnRevert.click" : function(e) {
            e.preventDefault();

            if (cont["p.grid.master"].data("modified").length === 0) {
                N(window).alert(N.message.get((window as any).APP.comm.messages, "COMM-0001")).show();
                return false;
            }

            cont["p.form.detail"].revert();
        },
        init : function(view, request) {
            // cont.opener 는 탭이 포함된 부모페이지의 Controller object.
            if(cont.opener) {
                cont["p.form.search"].context().hide().prev("h3").hide().prev(".view-intro").hide();
                view.find("#btnSearch").hide();
                // 부모 페이지 컨트롤러의 검색 버튼 클릭
                cont.opener["e.btnSearch.click"].trigger("click");
            } else {
                cont["e.btnSearch.click"].trigger("click");
            }
        }
    });

})();