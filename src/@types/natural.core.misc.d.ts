declare namespace NC {

    type InstanceCallback = {
        (this: T, instanceName: string, instance: T): void;
    }
    type ValsCallback = {
        (this: NHTMLElement, index: number, selEle: NHTMLElement): void;
    }
    type EventObject = object[]
    type EventsObject = {
        [key: string]: EventObject;
    }

    type Date = {
        obj: Date;
        format: string;
    }

    type Primitive = string | number | boolean | null;
    type JSONValue = Primitive | JSONObject | JSONValue[];
    type JSONObject = {
        [key: string]: JSONValue;
    }

    type RuleObj = {
        id: {
            ruleName: [[string, ...[]]];
        }
    }

    /**
     * Enumeration representing types of web browsers.
     */
    enum BrowserType {
        OPERA = "opera",
        FIREFOX = "firefox",
        SAFARI = "safari",
        CHROME = "chrome",
        IE = "ie",
        IOS = "ios",
        ANDROID = "android"
    }

    type MessageResourceObj = {
        [key: string]: {
            [key: string]: string;
        }
    }

    enum ObjectType {
        NUMBER = "number",
        STRING = "string",
        ARRAY = "array",
        OBJECT = "object",
        FUNCTION = "function",
        DATE = "date"
    }
}
