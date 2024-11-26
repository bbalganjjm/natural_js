declare class NUS {

    notify(opts?: NUS.Options.Notify): NUS.Notify;
    docs(opts?: NUS.Options.Documents): NUS.Documents;

    static notify: {
        new(position: NUS.Options.NotifyPosition, opts?: NUS.Options.Notify): NUS.Notify;
        add: (msg: any, url: any) => void;
        wrapEle: () => void;
    };

    static docs: {
        new(obj: NJS<HTMLElement[]>, opts: NUS.Options.Documents): NUS.Documents;
        createLoadIndicator: () => any;
        updateLoadIndicator: (entireLoadRequestCnt: any, entireLoadRequestMaxCnt: any) => any;
        removeLoadIndicator: () => any;
        errorLoadIndicator: () => any;
        wrapEle: () => void;
        wrapScroll: () => void;
        clearScrollPosition: (tabEle: any, isActive: any) => void;
        loadContent: (docOpts: any, callback: any) => void;
        closeBtnControl: () => void;
        inactivateTab: () => void;
        activateTab: (docId_: any, isFromDocsTabList_: any, isNotLoaded_: any) => void;
        showTabContents: (docId_: any) => boolean;
        hideTabContents: (docId_: any) => void;
        remove: (targetTabEle: any) => void;
    };

}

declare namespace NUS {

    interface Notify {
        options: NUS.Options.Notify;
        context(sel?: JQuery.Selector): NJS<HTMLElement[]>;
        add(msg: string, url?: string): this;
        remove(msgBoxEle: NJS<HTMLElement[]>): this;
    }

    interface Documents {
        options: NUS.Options.Documents;
        request: NA.Request;
        context(sel?: JQuery.Selector): NJS<HTMLElement[]>;
        add(docId: string, docNm: string, docOpts: DocOpts): this;
        active(docId: string, isFromDocsTabList?: boolean, isNotLoaded?: boolean): this;
        removeState(docId: string, callback: NUS.Callbacks.Documents.RemoveState): this;
        remove(docId: string, unconditional?: boolean): this;
        doc(docId: string): NUS.Options.DocsObject | NUS.Options.DocOpts;
        cont(docId: string): NA.Controller.Object;
        reload(docId: string, callback: NA.Request.SubmitCallback): this;
    }

}