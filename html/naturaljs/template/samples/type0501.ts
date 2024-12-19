(function() {

    const cont: NT.Objects.Controller.Object = N(".type0501").cont({
        "p.select.gender" : [ "gender" ],
        "p.select.eyeColor" : [ "eyeColor" ],
        "p.select.company" : [ "company" ],
        "p.select.favoriteFruit" : [ "favoriteFruit" ],
        "p.form.search" : {
            "usage" : "search-box"
        },
        "p.form.detail" : {
            revert : true,
            autoUnbind : true,
            onBind : function(context, rowData) {
                // 2.3. 로딩바 업데이트
                N.docs.updateLoadIndicator.call((window as any).APP.indx.docs, 0, 2);
                // 3. 로딩바 제거
                N.docs.removeLoadIndicator.call((window as any).APP.indx.docs);
            }
        },
        "p.list.codeMaster" : {
            height : 463,
            select : true,
            onSelect : function(index, rowEle, data, beforeRow, e) {
                // onSelect 함수는 .data("selected") 함수 전에 실행되므로 부자연 스럽지만 setTimeout(0)을 넣어줌.
                setTimeout(function() {
                    cont["c.getSampleList"]().submit(function(data) {
                        cont["p.grid.master"].bind(data as NC.JSONObject[]);
                    });
                }, 0);
            },
            onBind : function(context, data, isFirstPage, isLastPage) {
                if(isFirstPage) {
                    this.select(0);
                }

                // 2.2. 로딩바 업데이트
                N.docs.updateLoadIndicator.call((window as any).APP.indx.docs, 1, 2);
            }
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

                // 2.1. 로딩바 업데이트
                N.docs.updateLoadIndicator.call((window as any).APP.indx.docs, 2, 2);
            }
        },
        "p.popup.dept" : {
            url : "html/naturaljs/template/samples/type04P0.html",
            onOpen : "onOpen",
            height: 621,
            onClose : function(onCloseData) {
                if (onCloseData) {
                    cont["p.form.detail"].val("deptNm", onCloseData.deptNm);
                    cont["p.form.detail"].val("deptCd", onCloseData.deptCd);
                }
            }
        },
        "c.getSampleCodeCompanyList" : function() {
            return cont["p.form.search"].data(false).comm("sample/code/getSampleCodeCompanyList.json");
        },
        "c.getSampleList" : function() {
            const params: NC.JSONObject = {};
            if(cont["p.list.codeMaster"].data("selected").length > 0) {
                params.company = cont["p.list.codeMaster"].data("selected")[0].val;
            }
            return N(params).comm("sample/getSampleList.json");
        },
        "c.saveSample" : function() {
            return N(cont["p.grid.master"].data("modified")).comm({
                dataIsArray : true, // Array 타입의 여러 행데이터가 1 개 일 때는 자동으로 Object 로 변환됩니다. 자동으로 변환되지 않게 하려면 dataIsArray 옵션을 true 로 지정해 주세요.
                url : "sample/saveSample.json"
            });
        },
        "e.btnSearch.click" : function(e) {
            e.preventDefault();

            // 1. 로딩바 생성
            N.docs.createLoadIndicator.call((window as any).APP.indx.docs);

            if (cont["p.form.search"].validate()) {
                cont["c.getSampleCodeCompanyList"]().submit(function(data) {
                    cont["p.list.codeMaster"].bind(data as NC.JSONObject[]);
                });
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
                after : function(data: NC.JSONObject[]) {
                    cont["p.list.codeMaster"].select(cont["p.list.codeMaster"].select());
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
            cont["e.btnSearch.click"].trigger("click");
        }
    });

})();