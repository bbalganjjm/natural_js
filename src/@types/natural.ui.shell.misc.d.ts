declare namespace NUS {

    namespace Options {

        type Notify = {
            position: {
                top: number;
                right: number;
            };
            container: NJS<HTMLElement>;
            context: any;
            displayTime: number;
            alwaysOnTop: boolean;
            html: boolean;
            alwaysOnTopCalcTarget: string;
        };

        type Documents = {
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
            msgContext: NJS<HTMLElement>;
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
        }

    }

    namespace EventHandlers {

        namespace Documents {
            type OnBeforeCreate = {
                (this: NU.Button, context: NJS<HTMLElement>, opts: NU.Options.Button): void;
            }
        }

    }

}