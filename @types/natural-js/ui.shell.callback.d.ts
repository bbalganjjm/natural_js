declare type DocumentsRemoveStateCallback = {
    (this: Documents, docId?: string): void;
}

declare type DocumentsOnBeforeEntireLoad = {
    (this: Documents, docId?: string): void;
}
declare type DocumentsOnErrorEntireLoad = {
    (this: Documents, e: Error, request: Request, xhr: JQueryXHR, textStatus: "success" | "error", submitCallback: SubmitCallback): void;
}
declare type DocumentsOnEntireLoad = {
    (this: Documents, docId?: string, entireLoadRequestCnt: number, entireLoadRequestMaxCnt: number): void;
}

declare type DocumentsOnBeforeLoad = {
    (this: Documents, docId?: string, target: NHTMLElement): void;
}
declare type DocumentsOnLoad = {
    (this: Documents, docId?: string): void;
}
declare type DocumentsOnBeforeActive = {
    (this: Documents, docId?: string, isFromDocsTabList: boolean, isNotLoaded: boolean): void;
}
declare type DocumentsOnActive = {
    (this: Documents, docId?: string, isFromDocsTabList: boolean, isNotLoaded: boolean): void;
}
declare type DocumentsOnBeforeInactive = {
    (this: Documents, docId?: string): void;
}
declare type DocumentsOnInactive = {
    (this: Documents, docId?: string): void;
}
declare type DocumentsOnBeforeRemoveState = {
    (this: Documents, docId?: string): void;
}
declare type DocumentsOnRemoveState = {
    (this: Documents, docId?: string): void;
}
declare type DocumentsOnBeforeRemove = {
    (this: Documents, docId?: string): void;
}
declare type DocumentsOnRemove = {
    (this: Documents, docId?: string): void;
}