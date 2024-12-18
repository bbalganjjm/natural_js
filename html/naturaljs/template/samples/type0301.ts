(function() {

    const cont: NT.Objects.Controller.Object = N(".type0301").cont({
        "p.select.gender" : [ "gender" ],
        "p.select.eyeColor" : [ "eyeColor" ],
        "p.form.search" : {
            "usage" : "search-box"
        },
        "p.grid.master" : {
            resizable : true,
            filter : false,
            fixedcol : 3,
            checkAll : "#checkAll",
            checkAllTarget : ".checkAllTarget",
            createRowDelay : 0
        },
        "p.pagination.masterPagination" : {
            blockOnChangeWhenBind : true,
            countPerPage : 15,
            onChange : function(pageNo, selEle, selData, currPageNavInfo) {
                cont["c.getSampleList"]().submit(function(data) {
                    let totalCount = 0;
                    if(Array.isArray(data) && data[0] && data[0].totalCount) {
                        totalCount = data[0].totalCount;
                    }
                    cont["p.pagination.masterPagination"].bind(totalCount);
                    cont["p.grid.master"].bind(data as NC.JSONObject[]);
                });
            }
        },
        "c.getSampleList" : function() {
            return N($.extend(cont["p.form.search"].data()[0], cont["p.pagination.masterPagination"].currPageNavInfo())).comm(
                "sample/getSamplePaginationList.json");
        },
        "e.btnSearch.click" : function(e) {
            e.preventDefault();

            if (cont["p.form.search"].validate()) {
                cont["p.pagination.masterPagination"].pageNo(1).bind();
                cont["c.getSampleList"]().submit(function(data) {
                    let totalCount = 0;
                    if(Array.isArray(data) && data[0] && data[0].totalCount) {
                        totalCount = data[0].totalCount;
                    }
                    cont["p.pagination.masterPagination"].bind(totalCount);
                    cont["p.grid.master"].bind(data as NC.JSONObject[]);
                });
            }
        },
        "e.gender.change" : {
            target : "#search #gender",
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