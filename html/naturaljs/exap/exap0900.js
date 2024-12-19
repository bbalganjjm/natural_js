"use strict";
(function () {
    const cont = N(".exap0900").cont({
        data: [{
                "picture": "http://placehold.it/32x32",
                "name": "Dean Stanley",
                "email": "deanstanley@zentia.com",
                "password": "53e21cba9f982281b3459438",
                "balance": "1284.38",
                "phone": "+1 (920) 409-2680",
                "company": "ZENTIA",
                "active": "Y",
                "age": 26,
                "eyeColor": "green",
                "gender": "male",
                "favoriteFruit": "strawberry",
                "registered": "20140220",
                "about": "Mollit elit qui reprehenderit fugiat excepteur adipisicing sunt id proident laborum sint proident.\r\nAmet cupidatat ipsum do irure qui magna sunt pariatur commodo eiusmod ipsum qui ad culpa.\r\nNisi tempor cupidatat do tempor reprehenderit irure consectetur cupidatat deserunt fugiat.\r\nIpsum sint id ipsum voluptate duis laboris esse sunt nisi mollit dolore cupidatat.\r\n",
                "greeting": "Hello, Dean Stanley! You have 1 unread messages."
            }],
        init: function (view, request) {
            cont.setCodes(["gender", "eyeColor", "company", "favoriteFruit"], function () {
                // The N.select component must be initialized before data-related components such as N.grid or N.form are initialized.
                cont.setComponents();
                cont.setEvents();
            });
        },
        setCodes: function (codeParams, afterCodeInitFn) {
            // 1. initialize N.select and bind the code data.
            N({ codes: codeParams }).comm("html/naturaljs/exap/data/code.json").submit(function (data, request) {
                N(codeParams).each(function (i, code) {
                    N(data).datafilter("code === '" + code + "'").select(N("#" + code, cont.view)).bind();
                });
                afterCodeInitFn.call(cont);
            });
        },
        setComponents: function () {
            // 2. initialize buttons
            N(".buttons a", cont.view).button();
            // 3. initialize N.form
            cont.form01 = N([]).form({
                context: N(".form01", cont.view),
                revert: true
            });
            cont.form02 = N([]).form({
                context: N(".form02", cont.view),
                revert: true
            });
            cont.form03 = N([]).form({
                context: N(".form03", cont.view),
                revert: true
            });
        },
        setEvents: function () {
            // 3. bind events
            // 3-1. button handling.
            N(".buttons a[id^=btnBindData]", cont.view).on("click", function () {
                N("#" + this.id.replace("Bind", "Save")).instance("button").enable();
                if (!N(".buttons a[id^=btnSaveData]", cont.view).hasClass("btn_disabled__")) {
                    N("#btnSaveAll", cont.view).instance("button").enable();
                }
            });
            // 3-2. bind data to form01
            N("#btnBindData01", cont.view).on("click", function (e) {
                e.preventDefault();
                cont.form01.bind(0, cont.data);
            });
            // 3-3. bind data to form02
            N("#btnBindData02", cont.view).on("click", function (e) {
                e.preventDefault();
                cont.form02.bind(0, cont.data);
            });
            // 3-4.bind data to form03
            N("#btnBindData03", cont.view).on("click", function (e) {
                e.preventDefault();
                cont.form03.bind(0, cont.data);
            });
            // 3-5. save the form01's data
            N("#btnSaveData01", cont.view).on("click", function (e) {
                var _a;
                e.preventDefault();
                N(window).alert({
                    title: N.message.get(cont.messages, "EXAP0900-0001"),
                    msg: "<pre style='width: 450px; overflow: auto;'>" + ((_a = N.json.format(cont.form01.data(true, "picture", "name", "email", "password", "balance", "phone", "company", "active"))) === null || _a === void 0 ? void 0 : _a.replace(/\\/g, "")) + "</pre>"
                }).show();
            });
            // 3-6. save the form02's data
            N("#btnSaveData02", cont.view).on("click", function (e) {
                var _a;
                e.preventDefault();
                N(window).alert({
                    title: N.message.get(cont.messages, "EXAP0900-0001"),
                    msg: "<pre style='width: 450px; overflow: auto;'>" + ((_a = N.json.format(cont.form02.data(true, "age", "eyeColor"))) === null || _a === void 0 ? void 0 : _a.replace(/\\/g, "")) + "</pre>"
                }).show();
            });
            // 3-7. save the form03's data
            N("#btnSaveData03", cont.view).on("click", function (e) {
                var _a;
                e.preventDefault();
                N(window).alert({
                    title: N.message.get(cont.messages, "EXAP0900-0001"),
                    msg: "<pre style='width: 450px; overflow: auto;'>" + ((_a = N.json.format(cont.form03.data(true, "gender", "favoriteFruit", "registered", "about", "greeting"))) === null || _a === void 0 ? void 0 : _a.replace(/\\/g, "")) + "</pre>"
                }).show();
            });
            // 3-8. save the all forms data
            N("#btnSaveAll", cont.view).on("click", function (e) {
                var _a;
                e.preventDefault();
                // cont.data and cont.form01.data(), cont.form02.data(), cont.form03.data() are the same because they are reference to the same memory address.
                N(window).alert({
                    title: N.message.get(cont.messages, "EXAP0900-0001"),
                    msg: "<pre style='width: 450px; overflow: auto;'>" + ((_a = N.json.format(cont.data)) === null || _a === void 0 ? void 0 : _a.replace(/\\/g, "")) + "</pre>"
                }).show();
            });
            // 3-9. effect
            N(".form01, .form02, .form03", cont.view).on("mouseover", function () {
                let formEle;
                if (N(this).hasClass("form01")) {
                    formEle = N(".form01", cont.view);
                }
                else if (N(this).hasClass("form02")) {
                    formEle = N(".form02", cont.view);
                }
                else if (N(this).hasClass("form03")) {
                    formEle = N(".form03", cont.view);
                }
                formEle === null || formEle === void 0 ? void 0 : formEle.css({
                    "box-shadow": "var(--njs-elevation-vl)",
                    "opacity": "1",
                    "transform": "scale(1.03)",
                    "transition": "transform var(--njs-motion-duration-ultra-slow), box-shadow var(--njs-motion-duration-ultra-slow), opacity var(--njs-motion-duration-ultra-slow)"
                });
            });
            // 3-10. effect
            N(".form01, .form02, .form03", cont.view).on("mouseout", function () {
                N(".form01, .form02, .form03", cont.view).css({
                    "box-shadow": "",
                    "opacity": "",
                    "transform": "",
                    "transition": "transform 0.5s, box-shadow 0.5s, opacity 0.5s"
                });
            });
        },
        messages: {
            "ko_KR": {
                "EXAP0900-0001": "서버로 전송될 폼(N.form) 데이터"
            },
            "en_US": {
                "EXAP0900-0001": "Form(N.form) data to be sent to the server"
            }
        }
    });
})();
