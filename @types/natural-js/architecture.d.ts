declare namespace N {
    function comm (url: RequestOptions | string): Communicator;
    function cont (callback: object): N;
}

declare interface N {
    constructor(selector: JQuery.Selector, context?: Element): N;
    comm (url: RequestOptions | string): Communicator;
    cont (callback: object): N;
}

declare type SubmitCallbackFunction = {
    (this: Communicator | NOrHTMLElement, data: object | object[] | Controller, request?: Communicator.request): void;
}

declare type RequestOptions = {
    url: string,
    referrer? : string,
    contentType? : string,
    cache? : boolean,
    async? : boolean,
    type? : "POST" | "GET" | "PUT" | "DELETE" | "HEAD" | "OPTIONS" | "TRACE" | "CONNECT" | "PATCH",
    data? : object | object[] | N<object>,
    dataIsArray? : boolean,
    dataType? : "json" | "xml" | "script" | "html",
    urlSync? : boolean,
    crossDomain? : boolean,
    // browserHistory : true, // TODO
    append? : boolean,
    target? : N<HTMLElement>
}

declare interface Communicator {
    submit(callback?: SubmitCallbackFunction): this | JQuery.jqXHR
    request: request;
}

declare interface request {
    attr (name: string, obj_?: any): Communicator;
    removeAttr (name: string): Communicator;
    param (name?: string): object | string;
    get (key?: string): RequestOptions | string | boolean | object | object[] | N<object> | N<HTMLElement>;
    reload (callback?: SubmitCallbackFunction): Communicator;
}

// declare namespace N.config {
//     // TODO
// }

declare namespace N.context {
    type attrObj = {};
    function attr (name: string, obj_?: any): any;
}
