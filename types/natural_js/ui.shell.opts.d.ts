declare type NotifyPositionOpts = {
    top?: number;
    right?: number;
}
declare type NotifyOpts = {
    position?: NotifyPositionOpts;
    container?: NHTMLElement;
    context?: NHTMLElement | null;
    displayTime?: number;
    alwaysOnTop?: boolean;
    html?: boolean;
    alwaysOnTopCalcTarget?: string;
}

declare type DocsObject = {
    [key: string]: DocOpts;
}
declare type DocOpts = {
    docId?: string;
    docNm?: string;
    url?: string;
    urlSync?: boolean;
    onBeforeLoad?: DocumentsOnBeforeLoad | null;
    onLoad?: DocumentsOnLoad | null;
    onBeforeActive?: DocumentsOnBeforeActive | null;
    onActive?: DocumentsOnActive | null;
    onBeforeInactive?: DocumentsOnBeforeInactive | null;
    onInactive?: DocumentsOnInactive | null;
    onBeforeRemoveState?: DocumentsOnBeforeRemoveState | null;
    onRemoveState?: DocumentsORemoveState | null;
    onBeforeRemove?: DocumentsOnBeforeRemove | null;
    onRemove?: DocumentsOnRemove | null;
    stateless?: boolean
};
declare type DocsOpts = {
    context?: NHTMLElement | null;
    multi?: boolean;
    maxStateful?: number;
    maxTabs?: number;
    addLast?: boolean;
    tabScroll?: boolean;
    closeAllRedirectURL?: string | null;
    tabScrollCorrection?: {
        rightCorrectionPx?: number;
    };
    msgContext?: N<JQuery.TypeOrArray<window>>;
    entireLoadIndicator?: boolean;
    entireLoadScreenBlock?: boolean;
    entireLoadExcludeURLs?: string[];
    entireLoadRequestCnt?: number;
    entireLoadRequestMaxCnt?: number;
    onBeforeLoad?: DocumentsOnBeforeLoad | null;
    onLoad?: DocumentsOnLoad | null;
    onBeforeEntireLoad?: DocumentsOnBeforeEntireLoad | null;
    onErrorEntireLoad?: DocumentsOnErrorEntireLoad | null;
    onEntireLoad?: DocumentsOnEntireLoad | null;
    onBeforeActive?: DocumentsOnBeforeActive | null;
    onActive?: DocumentsOnActive | null;
    onBeforeInactive?: DocumentsOnBeforeInactive | null;
    onInactive?: DocumentsOnInactive | null;
    onBeforeRemoveState?: DocumentsOnBeforeRemoveState | null;
    onRemoveState?: DocumentsOnRemoveState | null;
    onBeforeRemove?: DocumentsOnBeforeRemove | null;
    onRemove?: DocumentsOnRemove | null;
    saveHistory?: boolean;
    docs?: DocsObject;
    alwaysOnTop?: boolean;
    alwaysOnTopCalcTarget?: string;
    order?: string[];
    loadedDocId?: string | null;
}