declare class NUS {
    static notify: {
        new(position: any, opts?: any): NUS.Notify;
        add: (msg: any, url: any) => void;
        wrapEle: () => void;
    };
    static docs: {
        new(obj: any, opts: any): NUS.Documents;
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
        context(sel: any): any;
        add(msg: any, url?: any): any;
        remove(msgBoxEle: any): any;
    }

    interface Documents {
        options: NUS.Options.Documents;
        request: NA.Request;
        context(sel: any): any;
        add(docId: any, docNm: any, docOpts: any): any;
        active(docId: any, isFromDocsTabList: any, isNotLoaded: any): any;
        removeState(docId: any, callback: any): any;
        remove(docId: any, unconditional: any): any;
        doc(docId: any): any;
        cont(docId: any): any;
        reload(docId: any, callback: any): any;
    }

}