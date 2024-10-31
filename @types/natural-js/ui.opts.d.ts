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

declare type AlertOnOk = {
    (this: Alert, msgContext?: NHTMLElement, msgContents?: NHTMLElement): void;
}

declare type AlertOnCancel = {
    (this: Alert, msgContext?: NHTMLElement, msgContents?: NHTMLElement): void;
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

declare type ButtonOpts = {
    context?: NHTMLElement | JQuery.Selector | null;
    size?: "none" | "smaller" | "small" | "medium" | "large" | "big";
    color?: "none" | "primary" | "primary_container" | "secondary" | "secondary_container" | "tertiary" | "tertiary_container";
    type?: "none" | "filled" | "outlined" | "elevated";
    disable?: boolean;
    onBeforeCreate?: ButtonOnBeforeCreate | null;
    onCreate?: ButtonOnCreate | null;
}

declare type ButtonOnBeforeCreate = {
    (this: Button, context: NHTMLElement, opts: ButtonOpts): void;
}

declare type ButtonOnCreate = {
    (this: Button, context: NHTMLElement, opts: ButtonOpts): void;
}

declare type DatepickerOpts = {

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