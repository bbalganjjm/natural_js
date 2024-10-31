declare interface N {
    alert(msg: string | AlertOpts, vars?: string[]): Alert;
    button(opts?: ButtonOpts): Button[];
    datepicker(opts?: DatepickerOpts): Datepicker;
    popup(opts?: PopupOpts): Popup;
    tab(opts?: TabOpts): Tab;
    select(opts?: SelectOpts): Select;
    form(opts?: FormOpts): Form;
    list(opts?: ListOpts): List;
    grid(opts?: GridOpts): Grid;
    pagination(opts?: PaginationOpts): Pagination;
    tree(opts?: TreeOpts): Tree;
}

declare namespace N {
    function alert(obj: NHTMLElement, msg: string | AlertOpts, vars?: string[]): Alert;
    function button(obj: NHTMLElement, opts?: ButtonOpts): Button[];
    function datepicker(obj: NHTMLElement, opts?: DatepickerOpts): Datepicker;
    function popup(obj: NHTMLElement, opts?: PopupOpts): Popup;
    function tab(obj: NHTMLElement, opts?: TabOpts): Tab;
    function select(obj: NJSONObject, opts?: SelectOpts): Select;
    function form(obj: NJSONObject, opts?: FormOpts): Form;
    function list(obj: NJSONObject, opts?: ListOpts): List;
    function grid(obj: NJSONObject, opts?: GridOpts): Grid;
    function pagination(obj: NJSONObject, opts?: PaginationOpts): Pagination;
    function tree(obj: NJSONObject, opts?: TreeOpts): Tree;
}

declare interface Alert {
    context(sel?: NHTMLElement | JQuery.Selector): NHTMLElement;
    show(): this;
    hide(): this;
    remove(): this;
}

declare interface Button {
    context(sel?: NHTMLElement | JQuery.Selector): NHTMLElement;
    disable(): this;
    enable(): this;
}

declare interface Datepicker {
    context(sel?: NHTMLElement | JQuery.Selector): NHTMLElement;
    show(): this;
    hide(): this;
}

declare interface Popup {
    context(sel?: NHTMLElement | JQuery.Selector): NHTMLElement;
    open(onOpenData: NAny): this;
    close(onCloseData: NAny): this;
    changeEvent(name: string, callback: T): this;
    remove(): this;
}

declare interface Tab {
    context(sel?: NHTMLElement | JQuery.Selector): NHTMLElement;
    open(idx: number, onOpenData: NAny, isFirst: boolean): this;
    disable(idx: number): this;
    enable(idx: number): this;
    cont(idx: number): ControllerObject;
}

declare interface Select {
    data(selFlag?: boolean): NJSONObject | JSONObject;
    context(sel?: NHTMLElement | JQuery.Selector): NHTMLElement;
    bind(data?: NJSONObjectArray): this;
    index(idx?: number): number | this;
    val(val?: Primitive): Primitive | this;
    remove(val?: Primitive): this;
    reset(selFlag?: boolean): this;
}

declare interface Form {
    data(selFlag?: boolean): NJSONObject | JSONObject;
    row(before: number): number;
    context(sel?: NHTMLElement | JQuery.Selector): NHTMLElement;
    bindEvents: {
        validate(ele: NHTMLElement, opts: FormOpts, eleType: string, isTextInput: boolean): void;
        dataSync(ele: NHTMLElement, opts: FormOpts, vals: JSONObject, eleType: string): void;
        enterKey(ele: NHTMLElement, opts: FormOpts): void;
        format(ele: NHTMLElement, opts: FormOpts, eleType: string, key: string): void;
    },
    bind(row: number, data: NJSONObjectArray): this;
    add(data?: number | JSONObject, row: number): this;
    remove(): this;
    revert(): this;
    validate(): boolean;
    val(key: string, val?: Primitive, notify: boolean): Primitive | this;
    update(row: number, key?: string): this;
}

declare interface List {
    data(selFlag?: false | "modified" | "selected" | "checked" | "insert" | "update" | "delete"): NJSONObject | JSONObject;
    context(sel?: NHTMLElement | JQuery.Selector): NHTMLElement;
    contextBodyTemplate(sel?: NHTMLElement | JQuery.Selector): NHTMLElement;
    select(row?: number | number[], isAppend?: boolean): N<number[]> | this;
    check(row?: number | number[], isAppend?: boolean): N<number[]> | this;
    bind(data: NJSONObjectArray, callType?: "append" | "list.bind" | "list.update"): this;
    add(data?: number | JSONObject, row?: number): this;
    remove(row?: number): this;
    revert(row?: number): this;
    validate(row?: number): boolean;
    val(row: number, key: string, val?: Primitive): Primitive | this;
    move(fromRow: number, toRow: number): this;
    copy(fromRow: number, toRow: number): this;
    update(row: number, key?: string): this;
}

declare interface Grid {
    data(selFlag?: false | "modified" | "selected" | "checked" | "insert" | "update" | "delete"): NJSONObject | JSONObject;
    context(sel?: NHTMLElement | JQuery.Selector): NHTMLElement;
    contextHead(sel?: NHTMLElement | JQuery.Selector): NHTMLElement;
    contextBodyTemplate(sel?: NHTMLElement | JQuery.Selector): NHTMLElement;
    select(row?: number | number[], isAppend?: boolean): N<number[]> | this;
    check(row?: number | number[], isAppend?: boolean): N<number[]> | this;
    bind(data: NJSONObjectArray, callType?: "append" | "grid.bind" | "grid.dataFilter" | "grid.sort" | "grid.update"): this;
    add(data?: number | JSONObject, row?: number): this;
    remove(row?: number): this;
    revert(row?: number): this;
    validate(row?: number): boolean;
    val(row: number, key: string, val?: Primitive): Primitive | this;
    move(fromRow: number, toRow: number): this;
    copy(fromRow: number, toRow: number): this;
    show(colIdxs: number): this;
    hide(colIdxs: number): this;
    update(row: number, key?: string): this;
}

declare type CurrPageNavInfo = {
    pageNo: number;
    countPerPage: number;
    countPerPageSet: number;
    totalCount: number;
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
declare interface Pagination {
    data(selFlag?: false): NJSONObject | JSONObject;
    context(sel?: NHTMLElement | JQuery.Selector): NHTMLElement;
    bind(data: NJSONObjectArray, totalCount?: number): this;
    totalCount(totalCount?: number): number | this;
    pageNo(pageNo?: number): number | this;
    countPerPage(countPerPage?: number): number | this;
    countPerPageSet(countPerPageSet?: number): number | this;
    currPageNavInfo(): CurrPageNavInfo;
}

declare interface Tree {
    data(selFlag?: false | "selected" | "checked" | "checkedInLastNode"): NJSONObject | JSONObject;
    context(sel?: NHTMLElement | JQuery.Selector): NHTMLElement;
    bind(data: NJSONObjectArray): this;
    // TODO val(row: number, key: string, val?: Primitive): Primitive | this;
    select(val?: Primitive): Primitive | this;
    // TODO check(vals?: Primitive[]): Primitive[] | this;
    expand(): this;
    collapse(): this;
    // TODO update(row: number, key?: string): this;
}