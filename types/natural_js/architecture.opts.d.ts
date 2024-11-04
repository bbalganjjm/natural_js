declare type RequestOpts = {
    url: string,
    referrer?: string,
    contentType?: string,
    cache?: boolean,
    async?: boolean,
    type?: "POST" | "GET" | "PUT" | "DELETE" | "HEAD" | "OPTIONS" | "TRACE" | "CONNECT" | "PATCH",
    data?: object | object[] | N<JQuery.TypeOrArray<object>>,
    dataIsArray?: boolean,
    dataType?: "json" | "xml" | "script" | "html",
    urlSync?: boolean,
    crossDomain?: boolean,
    // browserHistory : true, // TODO
    append?: boolean,
    target?: NHTMLElement
}