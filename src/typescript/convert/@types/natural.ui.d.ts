declare class N {
    private constructor();
    alert(msg: any, vars: any): any;
    button(opts: any): any;
    datepicker(opts: any): any;
    popup(opts: any): any;
    tab(opts: any): any;
    select(opts: any): any;
    form(opts: any): any;
    list(opts: any): any;
    grid(opts: any): any;
    pagination(opts: any): any;
    tree(opts: any): any;
}
declare namespace N {
    namespace ui {
        namespace iteration {
            function render(i: any, limit: any, delay: any, lastIdx: any, callType: any): void;
            function select(compNm: any): void;
            function checkAll(compNm: any): void;
            function checkSingle(compNm: any): void;
            function move(fromRow: any, toRow: any, compNm: any): {
                render: (i: any, limit: any, delay: any, lastIdx: any, callType: any) => void;
                select: (compNm: any) => void;
                checkAll: (compNm: any) => void;
                checkSingle: (compNm: any) => void;
                move: (fromRow: any, toRow: any, compNm: any) => any;
                copy: (fromRow: any, toRow: any, compNm: any) => any;
            };
            function copy(fromRow: any, toRow: any, compNm: any): {
                render: (i: any, limit: any, delay: any, lastIdx: any, callType: any) => void;
                select: (compNm: any) => void;
                checkAll: (compNm: any) => void;
                checkSingle: (compNm: any) => void;
                move: (fromRow: any, toRow: any, compNm: any) => any;
                copy: (fromRow: any, toRow: any, compNm: any) => any;
            };
        }
        namespace draggable {
            function events(eventNameSpace: any, startHandler: any, moveHandler: any, endHandler: any): void;
            function moveX(x: any, min: any, max: any): boolean;
            function moveY(y: any, min: any, max: any): boolean;
        }
        namespace scroll {
            function paging(contextWrapEle: any, defSPSize: any, rowEleLength: any, rowTagName: any, bindOpt: any): void;
        }
        namespace utils {
            function wrapHandler(opts: any, compNm: any, eventNm: any): void;
            function isTextInput(tagName: any, type: any): boolean;
        }
    }
    namespace alert {
        function constructor(obj: any, msg: any, vars: any): this;
        function wrapEle(): void;
        function resetOffSetEle(opts: any): void;
        function wrapInputEle(): void;
    }
    function button(obj: any, opts: any): this;
    function datepicker(obj: any, opts: any): this;
    function popup(obj: any, opts: any, ...args: any[]): this;
    function tab(obj: any, opts: any): void;
    function select(data: any, opts: any): this;
    function form(data: any, opts: any): this;
    function list(data: any, opts: any): this;
    function grid(data: any, opts: any): this;
    function pagination(data: any, opts: any): this;
    function tree(data: any, opts: any): this;
}
declare function Button(obj: any, opts: any): this;
declare class Button {
    constructor(obj: any, opts: any);
    options: {
        context: any;
        size: string;
        color: string;
        type: string;
        disable: boolean;
        onBeforeCreate: any;
        onCreate: any;
    };
}
declare function Datepicker(obj: any, opts: any): this;
declare class Datepicker {
    constructor(obj: any, opts: any);
    options: {
        context: any;
        contents: JQuery<HTMLElement>;
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
}
declare function Popup(obj: any, opts: any, ...args: any[]): this;
declare class Popup {
    constructor(obj: any, opts: any, ...args: any[]);
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
}
declare function Tab(obj: any, opts: any): void;
declare class Tab {
    constructor(obj: any, opts: any);
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
}
declare function Select(data: any, opts: any): this;
declare class Select {
    constructor(data: any, opts: any);
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
}
declare function Form(data: any, opts: any): this;
declare class Form {
    constructor(data: any, opts: any);
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
}
declare function List(data: any, opts: any): this;
declare class List {
    constructor(data: any, opts: any);
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
}
declare function Grid(data: any, opts: any): this;
declare class Grid {
    constructor(data: any, opts: any);
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
}
declare function Pagination(data: any, opts: any): this;
declare class Pagination {
    constructor(data: any, opts: any);
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
}
declare function Tree(data: any, opts: any): this;
declare class Tree {
    constructor(data: any, opts: any);
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
}
