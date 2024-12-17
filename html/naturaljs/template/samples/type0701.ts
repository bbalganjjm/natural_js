(function () {

    const cont: NT.Objects.Controller.Object = N(".type0701").cont({
        "p.select.gender": ["gender"],
        "p.select.eyeColor": ["eyeColor"],
        "p.form.search": {
            "usage": "search-box"
        },
        "p.tab.master": {
            "tabScroll": true
        },
        "e.btnSearch.click": function (e) {
            e.preventDefault();
            // 활성화된 탭 페이지에서 컨트롤러 가져오기
            const cCont: NT.Objects.Controller.Object = cont["p.tab.master"].cont();
            cCont["p.form.search"].bind(0, cont["p.form.search"].data());
            cCont["e.btnSearch.click"].trigger("click");
        },
        "e.gender.change": {
            target: "#search #gender",
            handler: function (e) {
                cont["e.btnSearch.click"].trigger("click");
            }
        },
        "e.eyeColor.change": {
            target: "#search #eyeColor",
            handler: function (e) {
                cont["e.btnSearch.click"].trigger("click");
            }
        },
        init: function (view, request) {
        }
    });

})();