(function () {

    const cont = N(".exap0600").cont({
        init : function(view, request) {
            cont.setCodes([ "gender", "eyeColor" ], function() {
                // The N.select component must be initialized before data-related components such as N.grid or N.form are initialized.
                cont.setComponents();
                cont.setEvents();
            });
        },
        setCodes : function(codeParams: string[], afterCodeInitFn: Function) {
            // 1. initialize N.select and bind the code data.
            N({ codes : codeParams }).comm("html/naturaljs/exap/data/code.json").submit(function(data, request) {
                N(codeParams).each(function(i, code) {
                    N(data as NC.JSONObject[]).datafilter("code === '" + code + "'").select(N(".searchBox #" + code, cont.view)).bind();
                });

                afterCodeInitFn.call(cont);
            });
        },
        setComponents : function() {
            // 2. initialize buttons
            N(".buttons a", cont.view).button();

            // 3. initialize N.form and add new row data for search box
            cont.form = N([]).form({
                context : N("div.searchBox li.inputs", cont.view),
                revert : true
            });
            if(cont.request?.attr("scData") === undefined) {
                cont.form.add();
            } else {
                cont.form.bind(0, cont.request?.attr("scData"));
            }

            // 4. initialize N.grid and bind empty data for data list
            cont.grid = N([]).grid({
                context : N("#grid", cont.view),
                data : [],
                resizable : true,
                sortable : true,
                select : true,
                fixedcol : 2,
                filter : false,
                onSelect : function(index, rowEle, data) {
                    // Grid row select event
                    N("#subContext", cont.view).comm("html/naturaljs/exap/exap0601.html")
                        .request.attr("selData", [ data[index] ]) // send selected row data
                        .request.attr("scData", cont.form.data()) // send search condition data
                        .request.attr("pageNo", cont.pagination.pageNo())
                        .submit();
                }
            });

            // 5. initialize N.pagination
            cont.pagination = N().pagination({
                context : N("#pagination", cont.view),
                countPerPage : 15,
                onChange : function(pageNo, selEle, selData, currPageNavInfo) {
                    // Data bind with N.grid
                    cont.grid.bind(selData);
                }
            });
        },
        setEvents : function() {
            // 6. bind events
            // 6-1. Search button
            N("#btnSearch", cont.view).on("click", function(e) {
                e.preventDefault();
                if(cont.form.validate()) {
                    // Temporary code
                    N(cont.form.data()).comm("html/naturaljs/exap/data/sample.json").submit(function(data) {
                        cont.pagination.pageNo(cont.request?.attr("pageNo") !== undefined ? cont.request?.attr("pageNo") : 1).bind(data);
                        cont.request?.removeAttr("pageNo");
                    });
                }
            }).trigger("click"); // Auto retrieve

            // 6-2. Add button
            N("#btnAdd", cont.view).on("click", function(e) {
                e.preventDefault();
                // Grid row select event
                N("#subContext", cont.view).comm("html/naturaljs/exap/exap0602.html")
                    .request.attr("scData", cont.form.data()) // send search condition data
                    .request.attr("pageNo", cont.pagination.pageNo()) // send pagination's pageNo
                    .submit();
            });
        },
        messages : {
            "ko_KR" : {
            },
            "en_US" : {
            }
        }
    });

})();