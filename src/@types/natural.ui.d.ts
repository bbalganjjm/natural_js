declare class NU {
    static ui: {
        iteration: {
            render: (i: any, limit: any, delay: any, lastIdx: any, callType: any) => void;
            select: (compNm: any) => void;
            checkAll: (compNm: any) => void;
            checkSingle: (compNm: any) => void;
            move: (fromRow: any, toRow: any, compNm: any) => any;
            copy: (fromRow: any, toRow: any, compNm: any) => any;
        };
        draggable: {
            events: (eventNameSpace: any, startHandler: any, moveHandler: any, endHandler: any) => void;
            /**
             * This function is not working in less than IE 9
             */
            moveX: (x: any, min: any, max: any) => boolean;
            /**
             * This function is not working in less than IE 9
             */
            moveY: (y: any, min: any, max: any) => boolean;
        };
        scroll: {
            paging: (contextWrapEle: any, defSPSize: any, rowEleLength: any, rowTagName: any, bindOpt: any) => void;
        };
        utils: {
            /**
             * Wraps component event options and global event options in NA.config.
             */
            wrapHandler: (opts: any, compNm: any, eventNm: any) => void;
            /**
             * Determines whether this is a text input field.
             */
            isTextInput: (tagName: any, type: any) => boolean;
        };
    };
    static alert: {
        new(obj: N, msg: NU.alert.prototype.options, vars?: any): {
            options: {
                obj: any;
                context: any;
                container: any;
                msgContext: N;
                msgContents: any;
                msg: string;
                vars: any;
                html: boolean;
                top: any;
                left: any;
                width: number;
                height: number;
                isInput: boolean;
                isWindow: any;
                title: any;
                button: boolean;
                okButtonOpts: any;
                cancelButtonOpts: any;
                closeMode: string;
                modal: boolean;
                onOk: any;
                onCancel: any;
                onBeforeShow: any;
                onShow: any;
                onBeforeHide: any;
                onHide: any;
                onBeforeRemove: any;
                onRemove: any;
                overlayColor: any;
                overlayClose: boolean;
                escClose: boolean;
                confirm: boolean;
                alwaysOnTop: boolean;
                alwaysOnTopCalcTarget: string;
                dynPos: boolean;
                windowScrollLock: boolean;
                draggable: boolean;
                draggableOverflowCorrection: boolean;
                draggableOverflowCorrectionAddValues: {
                    top: number;
                    bottom: number;
                    left: number;
                    right: number;
                };
                saveMemory: boolean;
            };
            context(sel: any): any;
            show(): any;
            hide(): any;
            remove(): any;
        };
        wrapEle: () => void;
        resetOffSetEle: (opts: any) => void;
        wrapInputEle: () => void;
    };
    static button: {
        new(obj: any, opts: any): {
            options: {
                context: any;
                size: string;
                color: string;
                type: string;
                disable: boolean;
                onBeforeCreate: any;
                onCreate: any;
            };
            context(sel: any): any;
            disable(): any;
            enable(): any;
        };
        wrapEle: () => void;
    };
    static datepicker: {
        new(obj: any, opts: any): {
            options: {
                context: any;
                contents: N;
                monthonly: boolean;
                focusin: boolean;
                yearsPanelPosition: string;
                monthsPanelPosition: string;
                minYear: number;
                maxYear: number;
                yearChangeInput: boolean;
                monthChangeInput: boolean;
                touchMonthChange: boolean;
                scrollMonthChange: boolean;
                minDate: any;
                maxDate: any;
                holiday: {
                    repeat: any;
                    once: any;
                };
                onChangeYear: any;
                onChangeMonth: any;
                onSelect: any;
                onBeforeShow: any;
                onShow: any;
                onBeforeHide: any;
                onHide: any;
            };
            context(sel: any): any;
            show(): any;
            formEleOrgPosition: any;
            hide(...args: any[]): any;
        };
        context: () => any;
        checkMinMaxDate: () => boolean;
        wrapEle: () => void;
        createContents: () => any;
        yearPaging: (yearItems: any, currYear: any, addCnt: any, absolute: any) => void;
        selectItems: (opts: any, value: any, format: any, yearsPanel: any, monthsPanel: any, daysPanel: any) => void;
    };
    static popup: {
        new(obj: any, opts: any, ...args: any[]): {
            options: {
                context: any;
                url: any;
                title: any;
                button: boolean;
                modal: boolean;
                top: any;
                left: any;
                height: number;
                width: number;
                opener: any;
                closeMode: string;
                alwaysOnTop: boolean;
                confirm: boolean;
                overlayClose: boolean;
                escClose: boolean;
                onOk: any;
                onCancel: any;
                onBeforeShow: any;
                onShow: any;
                onBeforeHide: any;
                onHide: any;
                onBeforeRemove: any;
                onRemove: any;
                onOpen: any;
                onOpenData: any;
                onClose: any;
                onCloseData: any;
                onLoad: any;
                preload: boolean;
                dynPos: boolean;
                windowScrollLock: boolean;
                draggable: boolean;
                draggableOverflowCorrection: boolean;
                draggableOverflowCorrectionAddValues: {
                    top: number;
                    bottom: number;
                    left: number;
                    right: number;
                };
                saveMemory: boolean;
            };
            context(sel: any): any;
            open(onOpenData: any): any;
            close(onCloseData: any): any;
            changeEvent(name: any, callback: any): any;
            remove(): any;
        };
        wrapEle: () => void;
        loadContent: (callback: any) => void;
        popOpen: (onOpenData: any, cont: any) => void;
    };
    static tab: {
        new(obj: any, opts: any): {
            options: {
                context: any;
                links: any;
                tabOpts: any[];
                randomSel: boolean;
                opener: any;
                onActive: any;
                onLoad: any;
                blockOnActiveWhenCreate: boolean;
                contents: any;
                tabScroll: boolean;
                tabScrollCorrection: {
                    tabContainerWidthCorrectionPx: number;
                    tabContainerWidthReCalcDelayTime: number;
                };
            };
            context(sel: any): any;
            open(idx: any, onOpenData: any, isFirst: any): any | {
                index: any;
                tab: any;
                content: any;
                cont: any;
            };
            disable(idx: any): any;
            enable(idx: any): any;
            cont(idx: any): any;
        };
        wrapEle: () => void;
        wrapScroll: () => void;
        loadContent: (url: any, targetIdx: any, callback: any, isFirst: any) => void;
    };
    static select: {
        new(data: any, opts: any): {
            options: {
                data: any;
                context: any;
                key: any;
                val: any;
                append: boolean;
                direction: string;
                type: number;
                template: any;
            };
            data(selFlag: any): any;
            context(sel: any): any;
            bind(data: any): any;
            index(idx: any): any;
            val(val: any): any;
            remove(val: any): any;
            reset(selFlag: any): any;
        };
        wrapEle: () => void;
    };
    static form: {
        new(data: any, opts: any): {
            options: {
                data: any;
                row: number;
                context: any;
                validate: boolean;
                autoUnbind: boolean;
                state: any;
                html: boolean;
                addTop: boolean;
                fRules: any;
                vRules: any;
                extObj: any;
                extRow: number;
                revert: boolean;
                cache: boolean;
                unbind: boolean;
                tpBind: boolean;
                onBeforeBindValue: any;
                onBindValue: any;
                onBeforeBind: any;
                onBind: any;
                InitialData: any;
            };
            data(selFlag: any, ...args: any[]): any;
            row(before: any): any;
            context(sel: any): any;
            /**
             * arguments[2]... arguments[n] are the columns to be bound.
             */
            bindEvents: {
                /**
                 * validate
                 */
                validate: (ele: any, opts: any, eleType: any, isTextInput: any) => void;
                /**
                 * dataSync
                 */
                dataSync: (ele: any, opts: any, vals: any, eleType: any) => void;
                /**
                 * Enter key event
                 */
                enterKey: (ele: any, opts: any) => void;
                /**
                 * format
                 */
                format: (ele: any, opts: any, eleType: any, vals: any, key: any) => void;
            };
            bind(row: any, data: any, ...args: any[]): any;
            unbind(state: any): any;
            add(data: any, row: any): any;
            remove(): any;
            revert(): any;
            validate(): boolean;
            val(key: any, val: any, notify: any): any;
            update(row: any, key: any): any;
        };
    };
    static list: {
        new(data: any, opts: any): {
            options: {
                data: any;
                row: number;
                beforeRow: number;
                context: any;
                height: number;
                validate: boolean;
                html: boolean;
                addTop: boolean;
                addSelect: boolean;
                vResizable: boolean;
                windowScrollLock: boolean;
                select: boolean;
                unselect: boolean;
                multiselect: boolean;
                checkAll: any;
                checkAllTarget: any;
                checkSingleTarget: any;
                hover: boolean;
                revert: boolean;
                createRowDelay: number;
                scrollPaging: {
                    idx: number;
                    size: number;
                };
                fRules: any;
                vRules: any;
                appendScroll: boolean;
                addScroll: boolean;
                selectScroll: boolean;
                checkScroll: boolean;
                validateScroll: boolean;
                cache: boolean;
                tpBind: boolean;
                rowHandlerBeforeBind: any;
                rowHandler: any;
                onBeforeSelect: any;
                onSelect: any;
                onBind: any;
            };
            tempRowEle: any;
            contextEle: any;
            data(rowStatus: any, ...args: any[]): any;
            context(sel: any): any;
            contextBodyTemplate(sel: any): any;
            select(row: any, isAppend: any): any;
            check(row: any, isAppend: any): any;
            /**
             * callType arguments is call type about scrollPaging(internal) or data filter(internal) or data append(external)
             * callType : "append" | "list.bind" | "list.update"
             */
            bind(data: any, callType: any, ...args: any[]): any;
            add(data: any, row: any): any;
            remove(row: any): any;
            revert(row: any): any;
            validate(row: any): boolean;
            val(row: any, key: any, val: any): any;
            move(fromRow: any, toRow: any): any;
            copy(fromRow: any, toRow: any): any;
            update(row: any, key: any): any;
        };
        createScroll: () => void;
        vResize: (contextWrapEle: any) => void;
    };
    static grid: {
        new(data: any, opts: any): {
            options: {
                data: any;
                row: number;
                beforeRow: number;
                context: any;
                height: number;
                fixedcol: number;
                more: boolean;
                validate: boolean;
                html: boolean;
                addTop: boolean;
                addSelect: boolean;
                filter: boolean;
                resizable: boolean;
                vResizable: boolean;
                sortable: boolean;
                windowScrollLock: boolean;
                select: boolean;
                unselect: boolean;
                multiselect: boolean;
                checkAll: any;
                checkAllTarget: any;
                checkSingleTarget: any;
                hover: boolean;
                revert: boolean;
                createRowDelay: number;
                scrollPaging: {
                    idx: number;
                    size: number;
                };
                fRules: any;
                vRules: any;
                appendScroll: boolean;
                addScroll: boolean;
                selectScroll: boolean;
                checkScroll: boolean;
                validateScroll: boolean;
                cache: boolean;
                tpBind: boolean;
                pastiable: boolean;
                rowHandlerBeforeBind: any;
                rowHandler: any;
                onBeforeSelect: any;
                onSelect: any;
                onBind: any;
                misc: {
                    resizableCorrectionWidth: number;
                    resizableLastCellCorrectionWidth: number;
                    resizeBarCorrectionLeft: number;
                    resizeBarCorrectionHeight: number;
                    fixedcolHeadMarginTop: number;
                    fixedcolHeadMarginLeft: number;
                    fixedcolHeadHeight: number;
                    fixedcolBodyMarginTop: number;
                    fixedcolBodyMarginLeft: number;
                    fixedcolBodyBindHeight: number;
                    fixedcolBodyAddHeight: number;
                    fixedcolRootContainer: any;
                };
                currMoveToRow: number;
            };
            tempRowEle: any;
            tableMap: any;
            thead: any;
            contextEle: any;
            rowSpanIds: any;
            data(rowStatus: any, ...args: any[]): any;
            context(sel: any): any;
            contextHead(sel: any): any;
            contextBodyTemplate(sel: any): any;
            select(row: any, isAppend: any): any;
            check(row: any, isAppend: any): any;
            /**
             * callType arguments is call type about scrollPaging(internal), data filter(internal), data append(external), DataSync's update.
             * callType : "append" | "grid.bind" | "grid.dataFilter" | "grid.sort" | "grid.update"
             */
            bind(data: any, callType: any, ...args: any[]): any;
            add(data: any, row: any): any;
            remove(row: any): any;
            revert(row: any): any;
            validate(row: any): boolean;
            val(row: any, key: any, val: any): any;
            move(fromRow: any, toRow: any): any;
            copy(fromRow: any, toRow: any): any;
            show(colIdxs: any): any;
            hide(colIdxs: any): any;
            update(row: any, key: any): any;
        };
        /**
         * Convert HTML Table To 2D Array
         * Reference from CHRIS WEST'S BLOG : http://cwestblog.com/2016/08/21/javascript-snippet-convert-html-table-to-2d-array/
         */
        tableCells: (tbl: any, opt_cellValueGetter: any) => any[][];
        tableMap: () => {
            colgroup: any[];
            thead: any[][];
            tbody: any[][];
            tfoot: any[][];
        };
        setTheadCellInfo: () => void;
        removeColgroup: () => void;
        fixColumn: () => void;
        fixHeader: () => void;
        vResize: (gridWrap: any, contextWrapEle: any, tfootWrap: any) => void;
        more: () => void;
        resize: () => void;
        sort: () => void;
        dataFilter: () => void;
        rowSpan: (i: any, rowEle: any, bfRowEle: any, rowData: any, bfRowData: any, colId: any) => void;
        paste: () => void;
    };
    static pagination: {
        new(data: any, opts: any): {
            options: {
                data: any;
                context: any;
                totalCount: number;
                countPerPage: number;
                countPerPageSet: number;
                pageNo: number;
                onChange: any;
                blockOnChangeWhenBind: boolean;
                currPageNavInfo: any;
            };
            linkEles: any;
            data(selFlag: any): any;
            context(sel: any): any;
            bind(data: any, totalCount: any, ...args: any[]): any;
            totalCount(totalCount: any): number | any;
            pageNo(pageNo: any): number | any;
            countPerPage(countPerPage: any): number | any;
            countPerPageSet(countPerPageSet: any): number | any;
            currPageNavInfo(): any;
        };
        wrapEle: () => {
            body: any;
            page: any;
            first: any;
            prev: any;
            next: any;
            last: any;
        };
        changePageSet: (linkEles: any, opts: any, isRemake: any) => {
            pageNo: any;
            countPerPage: any;
            countPerPageSet: any;
            totalCount: any;
            pageCount: number;
            pageSetCount: number;
            currSelPageSet: number;
            startPage: number;
            endPage: number;
            startRowIndex: number;
            startRowNum: number;
            endRowIndex: number;
            endRowNum: number;
        };
    };
    static tree: {
        new(data: any, opts: any): {
            options: {
                data: any;
                context: any;
                key: any;
                val: any;
                level: any;
                parent: any;
                folderSelectable: boolean;
                checkbox: boolean;
                onSelect: any;
                onCheck: any;
            };
            data(selFlag: any, ...args: any[]): any;
            context(sel: any): any;
            bind(data: any): any;
            select(val: any): any;
            expand(): any;
            collapse(isFirstNodeOpen: any): any;
        };
    };

    alert(msg: any, vars?: any): {
        options: {
            obj: any;
            context: any;
            container: any;
            msgContext: N;
            msgContents: any;
            msg: any;
            vars: any;
            html: boolean;
            top: any;
            left: any;
            width: number;
            height: number;
            isInput: boolean;
            isWindow: any;
            title: any;
            button: boolean;
            okButtonOpts: any;
            cancelButtonOpts: any;
            closeMode: string;
            modal: boolean;
            onOk: any;
            onCancel: any;
            onBeforeShow: any;
            onShow: any;
            onBeforeHide: any;
            onHide: any;
            onBeforeRemove: any;
            onRemove: any;
            overlayColor: any;
            overlayClose: boolean;
            escClose: boolean;
            confirm: boolean;
            alwaysOnTop: boolean;
            alwaysOnTopCalcTarget: string;
            dynPos: boolean;
            windowScrollLock: boolean;
            draggable: boolean;
            draggableOverflowCorrection: boolean;
            draggableOverflowCorrectionAddValues: {
                top: number;
                bottom: number;
                left: number;
                right: number;
            };
            saveMemory: boolean;
        };
        context(sel: any): any;
        show(): any;
        hide(): any;
        remove(): any;
    };

    button(opts: any): any;

    datepicker(opts: any): {
        options: {
            context: any;
            contents: N;
            monthonly: boolean;
            focusin: boolean;
            yearsPanelPosition: string;
            monthsPanelPosition: string;
            minYear: number;
            maxYear: number;
            yearChangeInput: boolean;
            monthChangeInput: boolean;
            touchMonthChange: boolean;
            scrollMonthChange: boolean;
            minDate: any;
            maxDate: any;
            holiday: {
                repeat: any;
                once: any;
            };
            onChangeYear: any;
            onChangeMonth: any;
            onSelect: any;
            onBeforeShow: any;
            onShow: any;
            onBeforeHide: any;
            onHide: any;
        };
        context(sel: any): any;
        show(): any;
        formEleOrgPosition: any;
        hide(...args: any[]): any;
    };

    popup(opts: any): {
        options: {
            context: any;
            url: any;
            title: any;
            button: boolean;
            modal: boolean;
            top: any;
            left: any;
            height: number;
            width: number;
            opener: any;
            closeMode: string;
            alwaysOnTop: boolean;
            confirm: boolean;
            overlayClose: boolean;
            escClose: boolean;
            onOk: any;
            onCancel: any;
            onBeforeShow: any;
            onShow: any;
            onBeforeHide: any;
            onHide: any;
            onBeforeRemove: any;
            onRemove: any;
            onOpen: any;
            onOpenData: any;
            onClose: any;
            onCloseData: any;
            onLoad: any;
            preload: boolean;
            dynPos: boolean;
            windowScrollLock: boolean;
            draggable: boolean;
            draggableOverflowCorrection: boolean;
            draggableOverflowCorrectionAddValues: {
                top: number;
                bottom: number;
                left: number;
                right: number;
            };
            saveMemory: boolean;
        };
        context(sel: any): any;
        open(onOpenData: any): any;
        close(onCloseData: any): any;
        changeEvent(name: any, callback: any): any;
        remove(): any;
    };

    tab(opts: any): {
        options: {
            context: any;
            links: any;
            tabOpts: any[];
            randomSel: boolean;
            opener: any;
            onActive: any;
            onLoad: any;
            blockOnActiveWhenCreate: boolean;
            contents: any;
            tabScroll: boolean;
            tabScrollCorrection: {
                tabContainerWidthCorrectionPx: number;
                tabContainerWidthReCalcDelayTime: number;
            };
        };
        context(sel: any): any;
        open(idx: any, onOpenData: any, isFirst: any): any | {
            index: any;
            tab: any;
            content: any;
            cont: any;
        };
        disable(idx: any): any;
        enable(idx: any): any;
        cont(idx: any): any;
    };

    select(opts: any): {
        options: {
            data: any;
            context: any;
            key: any;
            val: any;
            append: boolean;
            direction: string;
            type: number;
            template: any;
        };
        data(selFlag: any): any;
        context(sel: any): any;
        bind(data: any): any;
        index(idx: any): any;
        val(val: any): any;
        remove(val: any): any;
        reset(selFlag: any): any;
    };

    form(opts: any): {
        options: {
            data: any;
            row: number;
            context: any;
            validate: boolean;
            autoUnbind: boolean;
            state: any;
            html: boolean;
            addTop: boolean;
            fRules: any;
            vRules: any;
            extObj: any;
            extRow: number;
            revert: boolean;
            cache: boolean;
            unbind: boolean;
            tpBind: boolean;
            onBeforeBindValue: any;
            onBindValue: any;
            onBeforeBind: any;
            onBind: any;
            InitialData: any;
        };
        data(selFlag: any, ...args: any[]): any;
        row(before: any): any;
        context(sel: any): any;
        /**
         * arguments[2]... arguments[n] are the columns to be bound.
         */
        bindEvents: {
            /**
             * validate
             */
            validate: (ele: any, opts: any, eleType: any, isTextInput: any) => void;
            /**
             * dataSync
             */
            dataSync: (ele: any, opts: any, vals: any, eleType: any) => void;
            /**
             * Enter key event
             */
            enterKey: (ele: any, opts: any) => void;
            /**
             * format
             */
            format: (ele: any, opts: any, eleType: any, vals: any, key: any) => void;
        };
        bind(row: any, data: any, ...args: any[]): any;
        unbind(state: any): any;
        add(data: any, row: any): any;
        remove(): any;
        revert(): any;
        validate(): boolean;
        val(key: any, val: any, notify: any): any;
        update(row: any, key: any): any;
    };

    list(opts: any): {
        options: {
            data: any;
            row: number;
            beforeRow: number;
            context: any;
            height: number;
            validate: boolean;
            html: boolean;
            addTop: boolean;
            addSelect: boolean;
            vResizable: boolean;
            windowScrollLock: boolean;
            select: boolean;
            unselect: boolean;
            multiselect: boolean;
            checkAll: any;
            checkAllTarget: any;
            checkSingleTarget: any;
            hover: boolean;
            revert: boolean;
            createRowDelay: number;
            scrollPaging: {
                idx: number;
                size: number;
            };
            fRules: any;
            vRules: any;
            appendScroll: boolean;
            addScroll: boolean;
            selectScroll: boolean;
            checkScroll: boolean;
            validateScroll: boolean;
            cache: boolean;
            tpBind: boolean;
            rowHandlerBeforeBind: any;
            rowHandler: any;
            onBeforeSelect: any;
            onSelect: any;
            onBind: any;
        };
        tempRowEle: any;
        contextEle: any;
        data(rowStatus: any, ...args: any[]): any;
        context(sel: any): any;
        contextBodyTemplate(sel: any): any;
        select(row: any, isAppend: any): any;
        check(row: any, isAppend: any): any;
        /**
         * callType arguments is call type about scrollPaging(internal) or data filter(internal) or data append(external)
         * callType : "append" | "list.bind" | "list.update"
         */
        bind(data: any, callType: any, ...args: any[]): any;
        add(data: any, row: any): any;
        remove(row: any): any;
        revert(row: any): any;
        validate(row: any): boolean;
        val(row: any, key: any, val: any): any;
        move(fromRow: any, toRow: any): any;
        copy(fromRow: any, toRow: any): any;
        update(row: any, key: any): any;
    };

    grid(opts: any): {
        options: {
            data: any;
            row: number;
            beforeRow: number;
            context: any;
            height: number;
            fixedcol: number;
            more: boolean;
            validate: boolean;
            html: boolean;
            addTop: boolean;
            addSelect: boolean;
            filter: boolean;
            resizable: boolean;
            vResizable: boolean;
            sortable: boolean;
            windowScrollLock: boolean;
            select: boolean;
            unselect: boolean;
            multiselect: boolean;
            checkAll: any;
            checkAllTarget: any;
            checkSingleTarget: any;
            hover: boolean;
            revert: boolean;
            createRowDelay: number;
            scrollPaging: {
                idx: number;
                size: number;
            };
            fRules: any;
            vRules: any;
            appendScroll: boolean;
            addScroll: boolean;
            selectScroll: boolean;
            checkScroll: boolean;
            validateScroll: boolean;
            cache: boolean;
            tpBind: boolean;
            pastiable: boolean;
            rowHandlerBeforeBind: any;
            rowHandler: any;
            onBeforeSelect: any;
            onSelect: any;
            onBind: any;
            misc: {
                resizableCorrectionWidth: number;
                resizableLastCellCorrectionWidth: number;
                resizeBarCorrectionLeft: number;
                resizeBarCorrectionHeight: number;
                fixedcolHeadMarginTop: number;
                fixedcolHeadMarginLeft: number;
                fixedcolHeadHeight: number;
                fixedcolBodyMarginTop: number;
                fixedcolBodyMarginLeft: number;
                fixedcolBodyBindHeight: number;
                fixedcolBodyAddHeight: number;
                fixedcolRootContainer: any;
            };
            currMoveToRow: number;
        };
        tempRowEle: any;
        tableMap: any;
        thead: any;
        contextEle: any;
        rowSpanIds: any;
        data(rowStatus: any, ...args: any[]): any;
        context(sel: any): any;
        contextHead(sel: any): any;
        contextBodyTemplate(sel: any): any;
        select(row: any, isAppend: any): any;
        check(row: any, isAppend: any): any;
        /**
         * callType arguments is call type about scrollPaging(internal), data filter(internal), data append(external), DataSync's update.
         * callType : "append" | "grid.bind" | "grid.dataFilter" | "grid.sort" | "grid.update"
         */
        bind(data: any, callType: any, ...args: any[]): any;
        add(data: any, row: any): any;
        remove(row: any): any;
        revert(row: any): any;
        validate(row: any): boolean;
        val(row: any, key: any, val: any): any;
        move(fromRow: any, toRow: any): any;
        copy(fromRow: any, toRow: any): any;
        show(colIdxs: any): any;
        hide(colIdxs: any): any;
        update(row: any, key: any): any;
    };

    pagination(opts: any): {
        options: {
            data: any;
            context: any;
            totalCount: number;
            countPerPage: number;
            countPerPageSet: number;
            pageNo: number;
            onChange: any;
            blockOnChangeWhenBind: boolean;
            currPageNavInfo: any;
        };
        linkEles: any;
        data(selFlag: any): any;
        context(sel: any): any;
        bind(data?: any, totalCount?: any, ...args?: any[]): any;
        totalCount(totalCount: any): number | any;
        pageNo(pageNo: any): number | any;
        countPerPage(countPerPage: any): number | any;
        countPerPageSet(countPerPageSet: any): number | any;
        currPageNavInfo(): any;
    };

    tree(opts: any): {
        options: {
            data: any;
            context: any;
            key: any;
            val: any;
            level: any;
            parent: any;
            folderSelectable: boolean;
            checkbox: boolean;
            onSelect: any;
            onCheck: any;
        };
        data(selFlag: any, ...args: any[]): any;
        context(sel: any): any;
        bind(data: any): any;
        select(val: any): any;
        expand(): any;
        collapse(isFirstNodeOpen: any): any;
    };
}
