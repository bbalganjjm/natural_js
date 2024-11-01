import Event = JQuery.Event;

declare type AlertWidth = {
    (this: Alert, msgContext?: NHTMLElement, msgContents?: NHTMLElement): number;
}
declare type AlertHeight = {
    (this: Alert, msgContext?: NHTMLElement, msgContents?: NHTMLElement): number;
}
declare type AlertOnOk = {
    (this: Alert, msgContext?: NHTMLElement, msgContents?: NHTMLElement): undefined | 0;
}
declare type AlertOnCancel = {
    (this: Alert, msgContext?: NHTMLElement, msgContents?: NHTMLElement): undefined | 0;
}
declare type AlertOnBeforeShow = {
    (this: Alert, msgContext?: NHTMLElement, msgContents?: NHTMLElement): void;
}
declare type AlertOnShow = {
    (this: Alert, msgContext?: NHTMLElement, msgContents?: NHTMLElement): void;
}
declare type AlertOnBeforeHide = {
    (this: Alert, msgContext?: NHTMLElement, msgContents?: NHTMLElement): void;
}
declare type AlertOnHide = {
    (this: Alert, msgContext?: NHTMLElement, msgContents?: NHTMLElement): void;
}
declare type AlertOnBeforeRemove = {
    (this: Alert, msgContext?: NHTMLElement, msgContents?: NHTMLElement): void;
}
declare type AlertOnRemove = {
    (this: Alert, msgContext?: NHTMLElement, msgContents?: NHTMLElement): void;
}

declare type ButtonOnBeforeCreate = {
    (this: Button, context: NHTMLElement, opts: ButtonOpts): void;
}
declare type ButtonOnCreate = {
    (this: Button, context: NHTMLElement, opts: ButtonOpts): void;
}
declare type DatepickerOnChangeYear = {
    (this: Datepicker, context: NHTMLElement, selYearStr: string, e: Event): void;
}
declare type DatepickerOnChangeMonth = {
    (this: Datepicker, context: NHTMLElement, selMonthStr: string, selYearStr: string, e: Event): void;
}
declare type DatepickerOnSelect = {
    (this: Datepicker, context: NHTMLElement, selDate: NDate, monthonly: boolean): void;
}
declare type DatepickerOnBeforeShow = {
    (this: Datepicker, context: NHTMLElement, contents: NHTMLElement): undefined | false;
}
declare type DatepickerOnShow = {
    (this: Datepicker, context: NHTMLElement, contents: NHTMLElement): void;
}
declare type DatepickerOnBeforeHide = {
    (this: Datepicker, context: NHTMLElement, contents: NHTMLElement): void;
}
declare type DatepickerOnHide = {
    (this: Datepicker, context: NHTMLElement): void;
}

declare type PopupWidth = {
    (this: Popup, msgContext?: NHTMLElement, msgContents?: NHTMLElement): number;
}
declare type PopupHeight = {
    (this: Popup, msgContext?: NHTMLElement, msgContents?: NHTMLElement): number;
}
declare type PopupOnOk = {
    (this: Popup, msgContext?: NHTMLElement, msgContents?: NHTMLElement): undefined | 0;
}
declare type PopupOnCancel = {
    (this: Popup, msgContext?: NHTMLElement, msgContents?: NHTMLElement): undefined | 0;
}
declare type PopupOnBeforeShow = {
    (this: Popup, msgContext?: NHTMLElement, msgContents?: NHTMLElement): void;
}
declare type PopupOnShow = {
    (this: Popup, msgContext?: NHTMLElement, msgContents?: NHTMLElement): void;
}
declare type PopupOnBeforeHide = {
    (this: Popup, msgContext?: NHTMLElement, msgContents?: NHTMLElement): void;
}
declare type PopupOnHide = {
    (this: Popup, msgContext?: NHTMLElement, msgContents?: NHTMLElement): void;
}
declare type PopupOnBeforeRemove = {
    (this: Popup, msgContext?: NHTMLElement, msgContents?: NHTMLElement): void;
}
declare type PopupOnRemove = {
    (this: Popup, msgContext?: NHTMLElement, msgContents?: NHTMLElement): void;
}
declare type PopupOnOpen = {
    (this: ControllerObject, onOpenData?: NAny): void;
}
declare type PopupOnClose = {
    (this: Popup, onCloseData?: NAny): void;
}
declare type PopupOnLoad = {
    (this: Popup, cont: ControllerObject): void;
}

declare type TabOnOpen = {
    (this: ControllerObject, onOpenData?: NAny): void;
}
declare type TabOnActive = {
    (this: Tab, selTabIdx: number, selTabEle: NHTMLElement, selContentEle: NHTMLElement, links: NHTMLElement, contents: NHTMLElement): void;
}
declare type TabOnLoad = {
    (this: Tab, selTabIdx: number, selTabEle: NHTMLElement, selContentEle: NHTMLElement, cont: ControllerObject): void;
}

declare type FormOnBeforeBindValue = {
    (this: Form, ele: NHTMLElement, val: Primitive | Primitive[], action: "bind" | "val"): Primitive | Primitive[];
}
declare type FormOnBindValue = {
    (this: Form, ele: NHTMLElement, val: Primitive | Primitive[], action: "bind" | "val"): void;
}
declare type FormOnBeforeBind = {
    (this: Form, context: NHTMLElement, vals: JSONObject): void;
}
declare type FormOnBind = {
    (this: Form, context: NHTMLElement, vals: JSONObject): void;
}

declare type ListRowHandlerBeforeBind = {
    (this: List, rowIdx: number, rowEle: NHTMLElement, rowData: JSONObject): void;
}
declare type ListRowHandler = {
    (this: List, rowIdx: number, rowEle: NHTMLElement, rowData: JSONObject): void;
}
declare type ListOnBeforeSelect = {
    (this: List, rowIdx: number, rowEle: NHTMLElement, rowData: NJSONObjectArray, beforeRowIdx: number, e: JQuery.Event): undefined | false;
}
declare type ListOnSelect = {
    (this: List, rowIdx: number, rowEle: NHTMLElement, rowData: NJSONObjectArray, beforeRowIdx: number, e: JQuery.Event): void;
}
declare type ListOnBind = {
    (this: List, context: NHTMLElement, data: NJSONObjectArray, isFirstPage: boolean, isLastPage: boolean): void;
}

declare type GridRowHandlerBeforeBind = {
    (this: Grid, rowIdx: number, rowEle: NHTMLElement, rowData: JSONObject): void;
}
declare type GridRowHandler = {
    (this: Grid, rowIdx: number, rowEle: NHTMLElement, rowData: JSONObject): void;
}
declare type GridOnBeforeSelect = {
    (this: Grid, rowIdx: number, rowEle: NHTMLElement, rowData: NJSONObjectArray, beforeRowIdx: number, e: JQuery.Event): undefined | false;
}
declare type GridOnSelect = {
    (this: Grid, rowIdx: number, rowEle: NHTMLElement, rowData: NJSONObjectArray, beforeRowIdx: number, e: JQuery.Event): void;
}
declare type GridOnBind = {
    (this: Grid, context: NHTMLElement, data: NJSONObjectArray, isFirstPage: boolean, isLastPage: boolean): void;
}

declare type PaginationOnChange = {
    (this: Pagination, pageNo: number, selEle: NHTMLElement, selData: JSONObject[], currPageNavInfo: CurrPageNavInfo): void;
}

declare type TreeOnSelect = {
    (this: Tree, selNodeIndex: number, selNodeEle: NHTMLElement, selNodeData: JSONObject): void;
}
declare type TreeOnCheck = {
    (this: Tree, selNodeIndex: number, selNodeEle: NHTMLElement, selNodeData: JSONObject
        , checkedElesIndexes: number[], checkedEles: NHTMLElement, checkedElesData: JSONObject[]
        , checkFlag: boolean): void;
}