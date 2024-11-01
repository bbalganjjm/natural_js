declare namespace N {
    function comm(url: RequestOpts | string): Communicator;
    function cont(callback: object): N;
}

declare interface N {
    comm(url: RequestOpts | string): Communicator;
    cont(callback: object): ControllerObject;
}
declare type ControllerObject = {
    [key: string]: NAny;
    view: NHTMLElement;
    request: request;
    caller?: ControllerObject;
    opener?: ControllerObject;
}

declare type SubmitCallback = {
    (this: Communicator | NOrHTMLElement, data: object | object[] | Controller, request?: Communicator.request): void;
}
declare type ErrorCallback = {
    (this: Communicator, xhr: JQueryXHR, textStatus: "success" | "error", e: Error, request?: Communicator.request, submitCallback: SubmitCallback): void;
}

declare interface Communicator {
    request: request;
    submit(callback?: SubmitCallback): this | JQuery.jqXHR
    error(callback?: ErrorCallback): this
}

declare interface request {
    attr(name: string, obj_?: NAny): Communicator;
    removeAttr(name: string): Communicator;
    param(name?: string): object | string;
    get(key?: string): RequestOpts | string | boolean | object | object[] | N<JQuery.TypeOrArray<object>> | NHTMLElement;
    reload(callback?: SubmitCallback): Communicator;
}

// declare namespace N.config {
//     // TODO
// }

declare namespace N.context {
    type attrObj = {};

    function attr(name: string, obj_?: NAny): NAny;
}
