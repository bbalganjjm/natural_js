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

declare type ButtonOnBeforeCreate = {
    (this: Button, context: NHTMLElement, opts: ButtonOpts): void;
}
declare type ButtonOnCreate = {
    (this: Button, context: NHTMLElement, opts: ButtonOpts): void;
}

declare type DatepickerOnSelect = {
    (this: Datepicker, context: NHTMLElement, selDate: NDate, monthonly: boolean): void;
}