(function() {

    const cont: NT.Objects.Controller.Object = N(".type04P0").cont({
        "p.form.search" : {
            "usage" : "search-box"
        },
        "p.grid.master" : {
            height : 300,
            select : true,
            onBind : function(context, data) {
                if (data.length == 1) {
                    this.select(0);
                    cont["e.btnOk.click"].trigger("click");
                }
            }
        },
        "c.getSampleDeptList" : function() {
            cont["p.form.search"].val("isList", true);
            return cont["p.form.search"].data(false).comm("sample/getSampleDeptList.json");
        },
        "e.btnSearch.click" : function(e) {
            e.preventDefault();
            if (cont["p.form.search"].validate()) {
                cont["c.getSampleDeptList"]().submit(function(data) {
                    // N.grid bind
                    cont["p.grid.master"].bind(data as NC.JSONObject[]);
                });
            }
        },
        "e.btnOk.click" : function(e) {
            e.preventDefault();
            cont.caller?.close(cont["p.grid.master"].data()[cont["p.grid.master"].select()[0]]);
        },
        "e.btnCancel.click" : function(e) {
            e.preventDefault();
            cont.caller?.close();
        },
        "e.row.dblclick" : function(e) {
            cont["e.btnOk.click"].trigger("click");
        },
        init : function(view, request) {
            cont["e.btnSearch.click"].trigger("click");
        },
        onOpen : function(onOpenData) {
        }
    });

})();