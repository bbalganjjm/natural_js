import JSONObject = NC.JSONObject;

declare class NU {

    alert(msg: NU.Options.Alert | string, vars?: string[]): NU.Alert;
    button(opts?: NU.Options.Button): NU.Button;
    datepicker(opts?: NU.Options.Datepicker): NU.Datepicker;
    popup(opts?: NU.Options.Popup): NU.Popup;
    tab(opts?: NU.Options.Tab): NU.Tab;
    // In the code proposal, the properties of NJS are also displayed, so the properties of NJS are excluded.
    select<T extends NU.Options.Select | NJS<HTMLElement>>(opts?: T): NU.Select;
    // In the code proposal, the properties of NJS are also displayed, so the properties of NJS are excluded.
    form<T extends NU.Options.Form | NJS<HTMLElement>>(opts?: T): NU.Form;
    // In the code proposal, the properties of NJS are also displayed, so the properties of NJS are excluded.
    list<T extends NU.Options.List | NJS<HTMLElement>>(opts?: T): NU.List;
    // In the code proposal, the properties of NJS are also displayed, so the properties of NJS are excluded.
    grid<T extends NU.Options.Grid | NJS<HTMLElement>>(opts?: T): NU.Grid;
    // In the code proposal, the properties of NJS are also displayed, so the properties of NJS are excluded.
    pagination<T extends NU.Options.Pagination | NJS<HTMLElement>>(opts: T): NU.Pagination;
    // In the code proposal, the properties of NJS are also displayed, so the properties of NJS are excluded.
    tree<T extends NU.Options.Tree | NJS<HTMLElement>>(opts: T): NU.Tree;

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
        new(obj: NJS<HTMLElement>, msg: NU.Options.Alert | string, vars?: string[]): NU.Alert;
        wrapEle: () => void;
        resetOffSetEle: (opts: any) => void;
        wrapInputEle: () => void;
    };

    static button: {
        new(obj: NJS<HTMLElement>, opts?: NU.Options.Button): NU.Button;
        wrapEle: () => void;
    };

    static datepicker: {
        new(obj: NJS<HTMLElement>, opts?: NU.Options.Datepicker): NU.Datepicker;
        context: () => any;
        checkMinMaxDate: () => boolean;
        wrapEle: () => void;
        createContents: () => any;
        yearPaging: (yearItems: any, currYear: any, addCnt: any, absolute: any) => void;
        selectItems: (opts: any, value: any, format: any, yearsPanel: any, monthsPanel: any, daysPanel: any) => void;
    };

    static popup: {
        new(obj: NJS<HTMLElement>, opts?: NU.Options.Popup): NU.Popup;
        wrapEle: () => void;
        loadContent: (callback: any) => void;
        popOpen: (onOpenData: any, cont: any) => void;
    };

    static tab: {
        new(obj: NJS<HTMLElement>, opts?: NU.Options.Tab): NU.Tab;
        wrapEle: () => void;
        wrapScroll: () => void;
        loadContent: (url: any, targetIdx: any, callback: any, isFirst: any) => void;
    };

    static select: {
        new(data: NJS<JSONObject[]>, opts?: NU.Options.Select | NJS<HTMLElement>): NU.Select;
        wrapEle: () => void;
    };

    static form: {
        new(data: NJS<JSONObject[]>, opts?: NU.Options.Form | NJS<HTMLElement>): NU.Form;
    };

    static list: {
        new(data: NJS<JSONObject[]>, opts?: NU.Options.List | NJS<HTMLElement>): NU.List;
        createScroll: () => void;
        vResize: (contextWrapEle: any) => void;
    };

    static grid: {
        new(data: NJS<JSONObject[]>, opts?: NU.Options.Grid | NJS<HTMLElement>): NU.Grid;
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
        new(data: NJS<JSONObject[]>, opts?: NU.Options.Pagination | NJS<HTMLElement>): NU.Pagination;
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
        new(data: NJS<JSONObject[]>, opts?: NU.Options.Tree | NJS<HTMLElement>): NU.Tree;
    };

}

declare namespace NU {

    import JSONObject = NC.JSONObject;

    interface Alert {
        options: NU.Options.Alert;
        context(sel?: JQuery.Selector): NJS<HTMLElement>;
        show(): this;
        hide(): this;
        remove(): this;
    }

    interface Button {
        options: NU.Options.Button;
        context(sel?: JQuery.Selector): NJS<HTMLElement>;
        disable(): this;
        enable(): this;
    }

    interface Datepicker {
        options: NU.Options.Datepicker;
        context(sel?: JQuery.Selector): NJS<HTMLElement>;
        show(): this;
        hide(): this;
    }

    interface Popup {
        options: NU.Options.Popup;
        context(sel?: JQuery.Selector): NJS<HTMLElement>;
        open(onOpenData?: any): this;
        close(onCloseData?: any): this;
        remove(): this;
    }

    interface Tab {
        options: NU.Options.Tab;
        context(sel?: JQuery.Selector): NJS<HTMLElement>;
        open(idx: number, onOpenData?: any, isFirst?: boolean): this;
        open(idx?: number, onOpenData?: any, isFirst?: boolean): {
            index: number;
            tab: NJS<HTMLElement>;
            content: NJS<HTMLElement>;
            cont: NA.Controller.Object;
        };
        disable(idx: number): this;
        enable(idx: number): this;
        cont(idx?: number): NA.Controller.Object;
    };

    interface Select {
        options: NU.Options.Select;
        data(selFlag: true): JSONObject[];
        data(selFlag: false): NJS<NC.JSONObject[]>;
        data(): JSONObject[];
        context(sel?: JQuery.Selector): NJS<HTMLElement>;
        bind(data?: NJS<NC.JSONObject[]>): this;
        index(): number;
        index(idx: number): this;
        val(val: any): this;
        remove(val: any): this;
        reset(selFlag: any): this;
    }

    interface Form {
        options: NU.Options.Form;
        data(selFlag: true, ...args?: string[]): JSONObject[];
        data(selFlag: false): NJS<NC.JSONObject[]>;
        data(): JSONObject[];
        row(before?: "before"): number;
        context(sel?: JQuery.Selector): NJS<HTMLElement>;
        // === 여기부터
        bindEvents: {
            validate: (ele: any, opts: any, eleType: any, isTextInput: any) => void;
            dataSync: (ele: any, opts: any, vals: any, eleType: any) => void;
            enterKey: (ele: any, opts: any) => void;
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
        context(sel?: JQuery.Selector): NJS<HTMLElement>;
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
        context(sel?: JQuery.Selector): NJS<HTMLElement>;
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
        context(sel?: JQuery.Selector): NJS<HTMLElement>;
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
        context(sel?: JQuery.Selector): NJS<HTMLElement>;
        bind(data: any): any;
        select(val: any): any;
        expand(): any;
        collapse(isFirstNodeOpen: any): any;
    }

}


