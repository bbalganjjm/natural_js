declare type AlertOpts = {
    context?: window | NHTMLElement | null;
    msg: string;
    vars?: string[] | undefined;
    html?: boolean;
    top?: number | undefined;
    left?: number | undefined;
    width?: AlertWidth | number;
    height?: AlertHeight | number;
    isInput?: boolean;
    isWindow?: boolean;
    title?: string;
    button?: boolean;
    okButtonOpts?: ButtonOpts | null;
    cancelButtonOpts?: ButtonOpts | null;
    closeMode?: "hide" | "remove";
    modal?: boolean;
    onOk?: AlertOnOk | null;
    onCancel?: AlertOnCancel | null;
    onBeforeShow?: AlertOnBeforeShow | null;
    onShow?: AlertOnShow | null;
    onBeforeHide?: AlertOnBeforeHide | null;
    onHide?: AlertOnHide | null;
    onBeforeRemove?: AlertOnBeforeRemove | null;
    onRemove?: AlertOnRemove | null;
    overlayColor?: "string" | null;
    overlayClose?: boolean;
    escClose?: boolean;
    confirm?: boolean;
    alwaysOnTop?: boolean;
    alwaysOnTopCalcTarget?: string;
    dynPos?: boolean;
    windowScrollLock?: boolean;
    draggable?: boolean;
    draggableOverflowCorrection?: boolean;
    draggableOverflowCorrectionAddValues?: {
        top?: number;
        bottom?: number;
        left?: number;
        right?: number
    };
    saveMemory?: boolean;
};

declare type ButtonOpts = {
    context?: NHTMLElement | null;
    size?: "none" | "smaller" | "small" | "medium" | "large" | "big";
    color?: "none" | "primary" | "primary_container" | "secondary" | "secondary_container" | "tertiary" | "tertiary_container";
    type?: "none" | "filled" | "outlined" | "elevated";
    disable?: boolean;
    onBeforeCreate?: ButtonOnBeforeCreate | null;
    onCreate?: ButtonOnCreate | null;
}

declare type DatepickerOpts = {
    context?: NHTMLElement | null;
    monthonly?: boolean;
    focusin?: boolean;
    yearsPanelPosition?: "left" | "top";
    monthsPanelPosition?: "left" | "top";
    minYear?: number;
    maxYear?: number;
    yearChangeInput?: boolean;
    monthChangeInput?: boolean;
    touchMonthChange?: boolean;
    scrollMonthChange?: boolean;
    minDate?: string;
    maxDate?: string;
    holiday?: {
        "repeat"?: {
            [key: string]: string | string[]
        } | null;
        "once"?: {
            [key: string]: string | string[]
        } | null;
    };
    onChangeYear?: DatepickerOnChangeYear | null;
    onChangeMonth?: DatepickerOnChangeMonth | null;
    onSelect?: DatepickerOnSelect | null;
    onBeforeShow?: DatepickerOnBeforeShow | null;
    onShow?: DatepickerOnShow | null;
    onBeforeHide?: DatepickerOnBeforeHide | null;
    onHide?: DatepickerOnHide | null;
}

declare type PopupOpts = {
    context?: NHTMLElement | null;
    url? : string,
    title?: string;
    button?: boolean;
    modal? : boolean,
    top?: number | undefined;
    left?: number | undefined;
    width?: PopupWidth | number;
    height?: PopupHeight | number;
    opener? : ControllerObject | null,
    closeMode?: "hide" | "remove";
    alwaysOnTop?: boolean;
    confirm?: boolean;
    overlayClose?: boolean;
    escClose?: boolean;
    onOk?: PopupOnOk | null;
    onCancel?: PopupOnCancel | null;
    onBeforeShow?: PopupOnBeforeShow | null;
    onShow?: PopupOnShow | null;
    onBeforeHide?: PopupOnBeforeHide | null;
    onHide?: PopupOnHide | null;
    onBeforeRemove?: PopupOnBeforeRemove | null;
    onRemove?: PopupOnRemove | null;
    onOpen : string | PopupOnOpen | null,
    onOpenData : NAny | null,
    onClose : PopupOnClose | null,
    onCloseData : NAny | null,
    onLoad : PopupOnLoad | null,
    preload : boolean,
    dynPos?: boolean;
    windowScrollLock?: boolean;
    draggable?: boolean;
    draggableOverflowCorrection?: boolean;
    draggableOverflowCorrectionAddValues?: {
        top?: number;
        bottom?: number;
        left?: number;
        right?: number
    };
    saveMemory?: boolean;
}

declare type EachTabOpts = {
    url?: string;
    active?: boolean;
    preload?: boolean;
    onOpen?: string | TabOnOpen;
    disable?: boolean;
    stateless?: boolean
}
declare type TabOpts = {
    context?: NHTMLElement | null;
    links?: NHTMLElement | null;
    tabOpts?: EachTabOpts;
    randomSel?: boolean;
    opener?: ControllerObject | null;
    onActive?: TabOnActive | null;
    onLoad?: TabOnLoad | null;
    blockOnActiveWhenCreate?: boolean;
    contents?: NHTMLElement | null;
    tabScroll?: boolean;
    tabScrollCorrection?: {
        tabContainerWidthCorrectionPx?: number;
        tabContainerWidthReCalcDelayTime?: number;
    }
}

declare type SelectOpts = {
    data?: NJSONObjectArray;
    context?: NHTMLElement | null;
    key?: string;
    val?: string;
    append?: boolean;
    direction?: "h" | "v";
    type?: 0 | 1 | 2 | 3 | 4;
    template?: NHTMLElement | null;
}

declare type FormOpts = {
    data?: NJSONObjectArray;
    row?: number;
    context?: NHTMLElement | null;
    validate?: boolean;
    autoUnbind?: boolean;
    state?: "add" | "bind" | "revert" | "update" | null;
    html?: boolean;
    addTop?: boolean;
    fRules?: Rules | null;
    vRules?: Rules | null;
    extObj?: List | Grid | null;
    extRow?: number;
    revert?: boolean;
    cache?: boolean;
    unbind?: boolean;
    tpBind?: boolean;
    onBeforeBindValue?: FormOnBeforeBindValue | null;
    onBindValue?: FormOnBindValue | null;
    onBeforeBind?: FormOnBeforeBind | null;
    onBind?: FormOnBind | null;
    InitialData?: NJSONObject;
}

declare type ListOpts = {
    data?: NJSONObjectArray;
    row?: number;
    beforeRow?: number;
    context?: NHTMLElement | null;
    height?: number;
    validate?: boolean;
    html?: boolean;
    addTop?: boolean;
    addSelect?: boolean;
    vResizable?: boolean;
    windowScrollLock?: boolean;
    select?: boolean;
    unselect?: boolean;
    multiselect?: boolean;
    checkAll?: JQuery.Selector;
    checkAllTarget?: JQuery.Selector;
    checkSingleTarget?: JQuery.Selector;
    hover?: boolean;
    revert?: boolean;
    createRowDelay?: number;
    scrollPaging?: {
        idx?: number;
        size?: number;
    };
    fRules?: Rules | null;
    vRules?: Rules | null;
    appendScroll?: boolean;
    addScroll?: boolean;
    selectScroll?: boolean;
    checkScroll?: boolean;
    validateScroll?: boolean;
    cache?: boolean;
    tpBind?: boolean;
    rowHandlerBeforeBind?: ListRowHandlerBeforeBind | null;
    rowHandler?: ListRowHandler | null;
    onBeforeSelect?: ListOnBeforeSelect | null;
    onSelect?: ListOnSelect | null;
    onBind?: ListOnBind | null;
}

declare type GridMisc = {
    resizableCorrectionWidth?: number;
    resizableLastCellCorrectionWidth?: number;
    resizeBarCorrectionLeft?: number;
    resizeBarCorrectionHeight?: number;
    fixedcolHeadMarginTop?: number;
    fixedcolHeadMarginLeft?: number;
    fixedcolHeadHeight?: number;
    fixedcolBodyMarginTop?: number;
    fixedcolBodyMarginLeft?: number;
    fixedcolBodyBindHeight?: number;
    fixedcolBodyAddHeight?: number;
    fixedcolRootContainer?: JQuery.Selector | null;
}
declare type GridOpts = {
    data?: NJSONObject;
    row?: number;
    beforeRow?: number;
    context?: NHTMLElement | null;
    height?: number;
    fixedcol?: number;
    more?: boolean | string[];
    validate?: boolean;
    html?: boolean;
    addTop?: boolean;
    addSelect?: boolean;
    filter?: boolean;
    resizable?: boolean;
    vResizable?: boolean;
    sortable?: boolean;
    windowScrollLock?: boolean;
    select?: boolean;
    unselect?: boolean;
    multiselect?: boolean;
    checkAll?: JQuery.Selector;
    checkAllTarget?: JQuery.Selector;
    checkSingleTarget?: JQuery.Selector;
    hover?: boolean;
    revert?: boolean;
    createRowDelay?: number;
    scrollPaging?: {
        idx?: number;
        size?: number;
    };
    fRules?: Rules | null;
    vRules?: Rules | null;
    appendScroll?: boolean;
    addScroll?: boolean;
    selectScroll?: boolean;
    checkScroll?: boolean;
    validateScroll?: boolean;
    cache?: boolean;
    tpBind?: boolean;
    pastiable?: boolean;
    rowHandlerBeforeBind?: GridRowHandlerBeforeBind | null;
    rowHandler?: GridRowHandler | null;
    onBeforeSelect?: GridOnBeforeSelect | null;
    onSelect?: GridOnSelect | null;
    onBind?: GridOnBind | null;
    misc?: GridMisc;
    currMoveToRow?: number;
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
declare type PaginationOpts = {
    data?: NJSONObject;
    context?: NHTMLElement | null;
    totalCount?: number;
    countPerPage?: number;
    countPerPageSet?: number;
    pageNo?: number;
    onChange?: PaginationOnChange | null;
    blockOnChangeWhenBind?: boolean;
    currPageNavInfo?: CurrPageNavInfo | null;
}

declare type TreeOpts = {
    data?: NJSONObject;
    context?: NHTMLElement | null;
    key?: string;
    val?: string;
    level?: string;
    parent?: string;
    folderSelectable?: boolean;
    checkbox?: boolean;
    onSelect?: TreeOnSelect | null;
    onCheck?: TreeOnCheck | null;
}