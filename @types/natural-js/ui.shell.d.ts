declare interface N {
    notify(opts?: NotifyOpts): Notify;
    docs(opts?: DocsOpts): Documents;
}

declare namespace N {
    function notify(obj: NotifyPositionOpts | NotifyOpts, opts?: NotifyOpts): Notify;
    function docs(obj: NHTMLElement, opts?: DocsOpts): Documents;
}

declare interface Notify {
    context(sel?: NHTMLElement | JQuery.Selector): NHTMLElement;
    add(msg: string, url?: string): this;
    remove(msgBoxEle: NHTMLElement): this;
}

declare interface Documents {
    context(sel?: NHTMLElement | JQuery.Selector): NHTMLElement;
    add(docId: string, docNm: string, docOpts: DocOpts): this;
    active(docId: string, isFromDocsTabList?: boolean, isNotLoaded?: boolean): this;
    removeState(docId: string, callback: DocumentsRemoveStateCallback): this;
    remove(docId: string, unconditional?: boolean): this;
    doc(docId: string): DocsObject | DocOpts;
    cont(docId: string): ControllerObject;
    reload(docId: string, callback: SubmitCallback): this;
}