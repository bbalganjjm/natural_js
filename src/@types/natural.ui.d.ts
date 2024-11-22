declare class NU {

    alert(msg: NU.Options.Alert | string, vars?: any): NU.Alert;
    button(opts?: NU.Options.Button): NU.Button;
    datepicker(opts?: NU.Options.Datepicker): NU.Datepicker;
    popup(opts?: NU.Options.Popup): NU.Popup;
    tab(opts?: NU.Options.Tab): NU.Tab;
    select(opts?: NU.Options.Select): NU.Select;
    form(opts?: NU.Options.Form): NU.Form;
    list(opts?: NU.Options.List): NU.List;
    grid(opts?: NU.Options.Grid): NU.Grid;
    pagination(opts: NU.Options.Pagination): NU.Pagination;
    tree(opts: NU.Options.Tree): NU.Tree;

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
        new(obj: N, msg: NU.Options.Alert | string, vars?: any): NU.Alert;
        wrapEle: () => void;
        resetOffSetEle: (opts: any) => void;
        wrapInputEle: () => void;
    };

    static button: {
        new(obj: any, opts?: any): NU.Button;
        wrapEle: () => void;
    };

    static datepicker: {
        new(obj: any, opts: any): NU.Datepicker;
        context: () => any;
        checkMinMaxDate: () => boolean;
        wrapEle: () => void;
        createContents: () => any;
        yearPaging: (yearItems: any, currYear: any, addCnt: any, absolute: any) => void;
        selectItems: (opts: any, value: any, format: any, yearsPanel: any, monthsPanel: any, daysPanel: any) => void;
    };

    static popup: {
        new(obj: any, opts): NU.Popup;
        wrapEle: () => void;
        loadContent: (callback: any) => void;
        popOpen: (onOpenData: any, cont: any) => void;
    };

    static tab: {
        new(obj: any, opts: any): NU.Tab;
        wrapEle: () => void;
        wrapScroll: () => void;
        loadContent: (url: any, targetIdx: any, callback: any, isFirst: any) => void;
    };

    static select: {
        new(data: any, opts: any): NU.Select;
        wrapEle: () => void;
    };

    static form: {
        new(data: any, opts: any): NU.Form;
    };

    static list: {
        new(data: any, opts: any): NU.List;
        createScroll: () => void;
        vResize: (contextWrapEle: any) => void;
    };

    static grid: {
        new(data: any, opts: any): NU.Grid;
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
        new(data: any, opts: any): NU.Pagination;
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
        new(data: any, opts: any): NU.Tree;
    };

}

declare namespace NU {

    interface Alert {
        options: NU.Options.Alert;
        context(sel: any): any;
        show(): any;
        hide(): any;
        remove(): any;
    }

    interface Button {
        options: NU.Options.Button;
        context(sel: any): any;
        disable(): any;
        enable(): any;
    }

    interface Datepicker {
        options: NU.Options.Datepicker;
        context(sel: any): any;
        show(): any;
        formEleOrgPosition: any;
        hide(...args: any[]): any;
    }

    interface Popup {
        options: NU.Options.Popup;
        context(sel: any): any;
        open(onOpenData: any): any;
        close(onCloseData: any): any;
        changeEvent(name: any, callback: any): any;
        remove(): any;
    }

    interface Tab {
        options: NU.Options.Tab;
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

    interface Select {
        options: NU.Options.Select;
        data(selFlag: any): any;
        context(sel: any): any;
        bind(data: any): any;
        index(idx: any): any;
        val(val: any): any;
        remove(val: any): any;
        reset(selFlag: any): any;
    }

    interface Form {
        options: NU.Options.Form;
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
    }

    interface List {
        options: NU.Options.List;
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
    }

    interface Grid {
        options: NU.Options.Grid;
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
    }

    interface Pagination {
        options: NU.Options.Pagination;
        linkEles: any;
        data(selFlag: any): any;
        context(sel: any): any;
        bind(data?: any, totalCount?: any, ...args?: any[]): any;
        totalCount(totalCount: any): number | any;
        pageNo(pageNo: any): number | any;
        countPerPage(countPerPage: any): number | any;
        countPerPageSet(countPerPageSet: any): number | any;
        currPageNavInfo(): any;
    }

    interface Tree {
        options: NU.Options.Tree;
        data(selFlag: any, ...args: any[]): any;
        context(sel: any): any;
        bind(data: any): any;
        select(val: any): any;
        expand(): any;
        collapse(isFirstNodeOpen: any): any;
    }

}


