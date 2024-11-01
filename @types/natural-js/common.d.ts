declare type Primitive = string | number | boolean | null;
declare type NHTMLElement = N<JQuery.TypeOrArray<HTMLElement>>
declare type NOrHTMLElement = NHTMLElement | HTMLElement;
declare type JSONValue = Primitive | JSONObject | JSONValue[];
declare type JSONObject = {
    [key: string]: JSONValue;
}
declare type NJSONObject = N<JQuery.TypeOrArray<JSONObject>> | JSONObject
declare type NJSONObjectArray = N<JQuery.TypeOrArray<JSONObject>> | JSONObject[]
declare type NAny = T | NOrHTMLElement | JSONValue | JSONObject;
declare type NDate = {
    obj: Date;
    format: string;
}
declare type RuleObj = {
    id: {
        ruleName: [[string, ...[]]];
    }
}

declare namespace N {
    const version: Version;

    type Version = {
        "Natural-CORE": string;
        "Natural-ARCHITECTURE": string;
        "Natural-DATA": string;
        "Natural-UI": string;
        "Natural-UI.Shell": string;
        "Natural-TEMPLATE": string;
        "Natural-CODE": string;
    };
}
