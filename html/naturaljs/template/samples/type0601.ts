(function() {

    const cont: NT.Objects.Controller.Object = N(".type0601").cont({
        "p.select.gender": {
            code: "gender"
        },
        "p.select.eyeColor": [ "eyeColor" ],
        "p.tree.master": {
            key: "deptNm",
            val: "deptCd",
            parent: "pDeptCd",
            level: "deptLv",
            folderSelectable: true,
            onSelect: (selNodeIndex, selNodeEle, selNodeData) => {
                cont["c.getSampleList"]({
                    deptCd: selNodeData.deptCd
                }).submit(function(data) {
                    cont["p.grid.detail"].bind(data as NC.JSONObject[]);
                });
            }
        },
        "p.grid.detail": {
            "action": [ "hide", [ 9, 10 ] ],
            height: 450,
            filter: false,
            checkAll: "#checkAll",
            checkAllTarget: ".checkAllTarget"
        },
        "c.getSampleDeptList": (): NA.Communicator => N.comm("sample/getSampleDeptList.json"),
        "c.getSampleList": (params: object): NA.Communicator => N(params).comm("sample/getSampleList.json"),
        "c.saveSample": (): NA.Communicator => N(cont["p.grid.detail"].data("modified")).comm({
            dataIsArray: true, // Array 타입의 여러 행데이터가 1 개 일 때는 자동으로 Object 로 변환됩니다. 자동으로 변환되지 않게 하려면 dataIsArray 옵션을 true 로 지정해 주세요.
            url: "sample/saveSample.json"
        }),
        "e.expandCollapse.click": function(e) {
            e.preventDefault();
            if (N(this).data("status") === "expand") {
                N(".button-panel .expand", cont.view).hide();
                N(".button-panel .collapse", cont.view).show();
                cont["p.tree.master"].collapse(true);
                N(this).data("status", "collapse");
            } else {
                N(".button-panel .expand", cont.view).show();
                N(".button-panel .collapse", cont.view).hide();
                cont["p.tree.master"].expand();
                N(this).data("status", "expand");
            }
        },
        "e.btnSave.click": function(e) {
            e.preventDefault();

            return (window as any).APP.comm.utils.save.call(this, {
                cont: cont,
                comm: "c.saveSample",
                changed: "p.grid.detail",
                validate: "p.grid.detail",
                after: function(data: NC.JSONObject[]) {
                    cont["p.tree.master"].context(".tree_active__").trigger("click");
                }
            });
        },
        "e.btnAdd.click": function(e) {
            e.preventDefault();
            cont["p.grid.detail"].add();
        },
        "e.btnDelete.click": function(e) {
            e.preventDefault();

            return (window as any).APP.comm.utils.del.call(this, {
                cont: cont,
                inst: "p.grid.detail"
            });
        },
        init: function(view, request) {
            cont["p.grid.detail"].bind();
            cont["c.getSampleDeptList"]().submit(function(data) {
                cont["p.tree.master"].bind(data as NC.JSONObject[]);
            });
        }
    });

})();