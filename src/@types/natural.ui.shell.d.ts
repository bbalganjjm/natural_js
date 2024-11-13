declare class NUS {
    static notify: {
        new(position: any, opts?: any): {
            options: {
                position: {
                    top: number;
                    right: number;
                };
                container: NJS;
                context: any;
                displayTime: number;
                alwaysOnTop: boolean;
                html: boolean;
                alwaysOnTopCalcTarget: string;
            };
            context(sel: any): any;
            add(msg: any, url?: any): any;
            remove(msgBoxEle: any): any;
        };
        add: (msg: any, url: any) => void;
        wrapEle: () => void;
    };
    static docs: {
        new(obj: any, opts: any): {
            options: {
                context: any;
                multi: boolean;
                maxStateful: number;
                maxTabs: number;
                addLast: boolean;
                tabScroll: boolean;
                closeAllRedirectURL: any;
                tabScrollCorrection: {
                    rightCorrectionPx: number;
                };
                msgContext: NJS;
                entireLoadIndicator: boolean;
                entireLoadScreenBlock: boolean;
                entireLoadExcludeURLs: any[];
                entireLoadRequestCnt: number;
                entireLoadRequestMaxCnt: number;
                onBeforeLoad: any;
                onLoad: any;
                onBeforeEntireLoad: any;
                onErrorEntireLoad: any;
                onEntireLoad: any;
                onBeforeActive: any;
                onActive: any;
                onBeforeInactive: any;
                onInactive: any;
                onBeforeRemoveState: any;
                onRemoveState: any;
                onBeforeRemove: any;
                onRemove: any;
                saveHistory: boolean;
                docs: {};
                alwaysOnTop: boolean;
                alwaysOnTopCalcTarget: string;
                order: any[];
                loadedDocId: any;
            };
            request: {
                options: {
                    url: any;
                    referrer: string;
                    contentType: string;
                    cache: boolean;
                    async: boolean;
                    type: string;
                    data: any;
                    dataIsArray: boolean;
                    dataType: string;
                    urlSync: boolean;
                    crossDomain: boolean;
                    browserHistory: boolean;
                    append: boolean;
                    target: any;
                };
                attrObj: {};
                obj: any;
                attr(name: any, obj_: any): any;
                removeAttr(name: any): any;
                param(name: any): any;
                get(key: any): any;
                reload(callback: any): any;
            };
            context(sel: any): any;
            add(docId: any, docNm: any, docOpts: any): any;
            active(docId: any, isFromDocsTabList: any, isNotLoaded: any): any;
            removeState(docId: any, callback: any): any;
            remove(docId: any, unconditional: any): any;
            doc(docId: any): any;
            cont(docId: any): any;
            reload(docId: any, callback: any): any;
        };
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

    notify(opts: any): {
        options: {
            position: {
                top: number;
                right: number;
            };
            container: NJS;
            context: any;
            displayTime: number;
            alwaysOnTop: boolean;
            html: boolean;
            alwaysOnTopCalcTarget: string;
        };
        context(sel: any): any;
        add(msg: any, url?: any): any;
        remove(msgBoxEle: any): any;
    };

    docs(opts: any): {
        options: {
            context: any;
            multi: boolean;
            maxStateful: number;
            maxTabs: number;
            addLast: boolean;
            tabScroll: boolean;
            closeAllRedirectURL: any;
            tabScrollCorrection: {
                rightCorrectionPx: number;
            };
            msgContext: NJS;
            entireLoadIndicator: boolean;
            entireLoadScreenBlock: boolean;
            entireLoadExcludeURLs: any[];
            entireLoadRequestCnt: number;
            entireLoadRequestMaxCnt: number;
            onBeforeLoad: any;
            onLoad: any;
            onBeforeEntireLoad: any;
            onErrorEntireLoad: any;
            onEntireLoad: any;
            onBeforeActive: any;
            onActive: any;
            onBeforeInactive: any;
            onInactive: any;
            onBeforeRemoveState: any;
            onRemoveState: any;
            onBeforeRemove: any;
            onRemove: any;
            saveHistory: boolean;
            docs: {};
            alwaysOnTop: boolean;
            alwaysOnTopCalcTarget: string;
            order: any[];
            loadedDocId: any;
        };
        request: {
            options: {
                url: any;
                referrer: string;
                contentType: string;
                cache: boolean;
                async: boolean;
                type: string;
                data: any;
                dataIsArray: boolean;
                dataType: string;
                urlSync: boolean;
                crossDomain: boolean;
                browserHistory: boolean;
                append: boolean;
                target: any;
            };
            attrObj: {};
            obj: any;
            attr(name: any, obj_: any): any;
            removeAttr(name: any): any;
            param(name: any): any;
            get(key: any): any;
            reload(callback: any): any;
        };
        context(sel: any): any;
        add(docId: any, docNm: any, docOpts: any): any;
        active(docId: any, isFromDocsTabList: any, isNotLoaded: any): any;
        removeState(docId: any, callback: any): any;
        remove(docId: any, unconditional: any): any;
        doc(docId: any): any;
        cont(docId: any): any;
        reload(docId: any, callback: any): any;
    };
}
