declare type InstanceFunction = {
    (this: object, name: string, instance: object): void;
}
declare type ValsFunction = {
    (this: N, index: number, selEle: N): void;
}
declare type NHTMLElement = N<HTMLElement[]>
declare interface N extends JQuery {
    remove_(idx: number | string, length: number): this;
    tpBind(): this;
    instance(name: string | function, instance?: InstanceFunction): this | undefined;
    vals(vals?: ValsFunction): string | string[] | this;
    events(eventName?: string, namespace: string): undefined | object | JQuery.EventHandler
}
declare function N(selector: any, context?: any): N;

declare namespace N {
    const version: Version;

    type Version = {
        "Natural-CORE": string,
        "Natural-ARCHITECTURE": string,
        "Natural-DATA": string,
        "Natural-UI": string,
        "Natural-UI.Shell": string,
        "Natural-TEMPLATE": string,
        "Natural-CODE": string
    };
}

