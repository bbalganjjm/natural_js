(function() {

    const cont: NT.Objects.Controller.Object = N(".type0201").cont({
        "p.select.gender" : [ "gender" ],
        "p.select.eyeColor" : [ "eyeColor" ],
        "p.form.search" : {
            "usage" : "search-box"
        },
        "p.grid.master" : {
            height : 350,
            resizable : false,
            checkAll : "#checkAll",
            checkAllTarget : ".checkAllTarget",
            scrollPaging : {
                size : 15
            }
        },
        "p.popup.dept" : {
            url : "html/naturaljs/template/samples/type04P0.html",
            onOpen : "onOpen",
            height: 621,
            onClose : function(onCloseData) {
                if (onCloseData) {
                    cont["p.grid.master"]
                        .val(cont.selIdx, "deptNm", onCloseData.deptNm)
                        .val(cont.selIdx, "deptCd", onCloseData.deptCd);
                }
            }
        },
        "c.getSampleList" : function() {
            return cont["p.form.search"].data(false).comm("sample/getSampleList.json");
        },
        "c.saveSample" : function() {
            return N(cont["p.grid.master"].data("modified")).comm({
                dataIsArray : true, // Array 타입의 여러 행데이터가 1 개 일 때는 자동으로 Object로 변환됩니다. 자동으로 변환되지 않게 하려면 dataIsArray 옵션을 true로 지정해 주세요.
                url : "sample/saveSample.json"
            });
        },
        "e.btnSearch.click" : function(e) {
            e.preventDefault();

            if (cont["p.form.search"].validate()) {
                cont["c.getSampleList"]().submit(function(data) {
                    // N.grid bind
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
        "e.btnSave.click" : function(e) {
            e.preventDefault();

            return (window as any).APP.comm.utils.save.call(this, {
                cont : cont,
                comm : "c.saveSample",
                changed : "p.grid.master",
                validate : "p.grid.master",
                after : function(data: NC.JSONObject[]) {
                    cont["e.btnSearch.click"].trigger("click");
                }
            });
        },
        "e.btnAdd.click" : function(e) {
            e.preventDefault();

            cont["p.grid.master"].add();
        },
        "e.btnDelete.click" : function(e) {
            e.preventDefault();

            return (window as any).APP.comm.utils.del.call(this, {
                cont : cont,
                inst : "p.grid.master"
            });
        },
        "e.btnDeptCd.click" : function(e, idx) {
            e.preventDefault();

            cont.selIdx = idx;
            cont["p.popup.dept"].open(cont["p.grid.master"].data()[idx]);
        },
        "e.registered.onSelect" : function(e, inputEle, selDate, isMonthonly, idx) {
            e.preventDefault();
            // 선택한 날짜가 오늘 날짜보다 크면 #isActive 요소 체크, 아니면 체크 해제.
            //  - 입력 요소를 jQuery val 메서드로 직접 다루지 말고 반드시 컴포넌트 인스턴스의 val 메서드로 값을 입력해주세요.
            //  - 입력 요소를 jQuery val 메서드로 직접 다루면 컴포넌트 내부 데이터셋과 동기화되지 않습니다.
            if(N.date.diff((new Date()).formatDate("Ymd"), selDate.obj.formatDate(selDate.format)) > 0) {
                cont["p.grid.master"].val(idx, "isActive", "Y");
            } else {
                cont["p.grid.master"].val(idx, "isActive", "N");
            }
        },
        init : function(view, request) {
            // cont.opener는 탭이 포함된 부모페이지의 Controller object.
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