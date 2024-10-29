declare type InstanceFunction = {
    (this: object, name: string, instance: object): void;
}
declare type ValsFunction = {
    (this: N, index: number, selEle: N): void;
}
declare interface N extends JQuery {
    remove_(idx: number | string, length: number): this;
    tpBind(): this;
    instance(name: string | function, instance?: InstanceFunction): this | undefined;
    vals(vals?: ValsFunction): string | string[] | this;
    events(eventName?: string, namespace: string): undefined | object | JQuery.EventHandler
}
declare function N(selector: any, context?: any): N;