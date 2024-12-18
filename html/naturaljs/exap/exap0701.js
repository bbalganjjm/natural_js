"use strict";
(function () {
    const cont = N(".exap0701").cont({
        init: function (view, request) {
            this.setComponents(this);
            this.setEvents(this);
        },
        setComponents: function () {
            // 1. initialize buttons
            N(".buttons a", cont.view).button();
            // 2. initialize N.form
            cont.form = N([]).form(N("#detail", cont.view));
        },
        setEvents: function () {
            // 3. bind events
            // 3-1 Go to create page
            N("#btnAdd", cont.view).on("click", function (e) {
                var _a;
                e.preventDefault();
                // FIXME remove this code.
                N.ds.instance(cont.form).remove();
                // Grid row select event
                N((_a = cont.view) === null || _a === void 0 ? void 0 : _a.parent()).comm("html/naturaljs/exap/exap0702.html")
                    .request.attr("selData", cont.selData) // send selected row data
                    .request.attr("caller", cont.caller) // send caller(this popup opener instance) object
                    .request.attr("mode", "create") // edit mode flag
                    .submit();
            });
            // 3-2 Go to edit page
            N("#btnEdit", cont.view).on("click", function (e) {
                var _a;
                e.preventDefault();
                // Grid row select event
                N((_a = cont.view) === null || _a === void 0 ? void 0 : _a.parent()).comm("html/naturaljs/exap/exap0702.html")
                    .request.attr("selData", cont.selData) // send selected row data
                    .request.attr("caller", cont.caller) // send caller(this popup opener instance) object
                    .request.attr("mode", "edit") // edit mode flag
                    .submit();
            });
            // 3-3 Delete
            N("#btnDelete", cont.view).on("click", function (e) {
                e.preventDefault();
                N(window).alert({
                    msg: N.message.get(cont.messages, "EXAP0701-0001"),
                    confirm: true,
                    onOk: function () {
                        var _a;
                        // remove row
                        cont.selData.grid.remove(cont.selData.row);
                        (_a = cont.caller) === null || _a === void 0 ? void 0 : _a.close();
                    }
                }).show();
            });
            // 3-4 Close this popup
            N("#btnClose", cont.view).on("click", function (e) {
                var _a;
                e.preventDefault();
                (_a = cont.caller) === null || _a === void 0 ? void 0 : _a.close();
            });
        },
        onOpen: function (onOpenData) {
            cont.selData = onOpenData;
            // 4. Data bind that transferred by onOpen's argument
            cont.form.bind(cont.selData.row, cont.selData.data);
        },
        messages: {
            "ko_KR": {
                "EXAP0701-0001": "삭제 하겠습니까?<br/>부모페이지의 그리드에서 저장 버튼을 누르기 전까지는 DB에 반영되지 않습니다."
            },
            "en_US": {
                "EXAP0701-0001": "Do you want to delete it?<br/>It will not be stored in the DB until you press the save button of data grid on parent page."
            }
        }
    });
})();
