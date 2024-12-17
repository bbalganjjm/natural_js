(function() {

    const cont: NT.Objects.Controller.Object = N(".type0101").cont({
        "p.select.gender" : [ "gender" ],
        "p.select.eyeColor" : [ "eyeColor" ],
        "p.select.favoriteFruit" : [ "favoriteFruit" ],
        "p.form.search" : {
            "usage" : "search-box"
        },
        "p.grid.master" : {
            "action" : "bind",
            filter : false,
            height : 350,
            onBind : function(context, data) {
                N("#totalCnt", cont.view).text(N.formatter.commas(String(data.length)));
            }
        },
        "c.getSampleList" : function() {
            return cont["p.form.search"].data(false).comm("sample/getSampleBigList.json");
        },
        "e.btnSearch.click" : async function(e) {
            e.preventDefault();

            if (cont["p.form.search"].validate()) {
                cont["p.grid.master"].bind(await cont["c.getSampleList"]().submit());
            }
        },
        "e.eyeColor.change" : {
            target : "#search #eyeColor",
            handler : function(e) {
                cont["e.btnSearch.click"].trigger("click");
            }
        },
        init : function(view, request) {
            // cont.opener는 탭이 포함된 부모페이지의 Controller object.
            if(cont.opener) {
                cont["p.form.search"].context().hide().prev("h3").hide().prev(".view-intro").hide();
                view.find("#btnSearch").hide();
            }
        }
    });

})();