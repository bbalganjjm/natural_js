declare type AlertOpts = {
    context?: window | NHTMLElement | JQuery.Selector | null;
    msg: string;
    vars?: string[] | undefined;
    html?: boolean;
    top?: number | undefined;
    left?: number | undefined;
    width?: number;
    height?: number;
    isInput?: boolean;
    isWindow?: boolean;
    title?: string;
    button?: boolean;
    okButtonOpts?: ButtonOpts | null;
    cancelButtonOpts?: ButtonOpts | null;
    closeMode?: string;
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
    context?: NHTMLElement | JQuery.Selector | null;
    size?: "none" | "smaller" | "small" | "medium" | "large" | "big";
    color?: "none" | "primary" | "primary_container" | "secondary" | "secondary_container" | "tertiary" | "tertiary_container";
    type?: "none" | "filled" | "outlined" | "elevated";
    disable?: boolean;
    onBeforeCreate?: ButtonOnBeforeCreate | null;
    onCreate?: ButtonOnCreate | null;
}

declare type DatepickerOpts = {
    context?: NHTMLElement | JQuery.Selector | null;
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
    onChangeYear?: DatepickerOnSelect | null;
    onChangeMonth?: null;
    onSelect?: null;
    onBeforeShow?: null;
    onShow?: null;
    onBeforeHide?: null;
    onHide?: null;
}

declare type PopupOpts = {

}

declare type TabOpts = {

}

declare type SelectOpts = {

}

declare type FormOpts = {

}

declare type ListOpts = {

}

declare type GridOpts = {

}

declare type PaginationOpts = {

}

declare type TreeOpts = {

}