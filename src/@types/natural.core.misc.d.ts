declare namespace NC {

    type Primitive = string | number | boolean | null;
    type JSONValue = Primitive | JSONObject | JSONValue[];
    type JSONObject = {
        [key: string]: JSONValue;
    }

    type Date = {
        obj: Date;
        format: string;
    }

    type EventObject = object[]
    type EventsObject = {
        [key: string]: EventObject;
    }

    type RuleObj = {
        id: {
            ruleName: [[string, ...[]]];
        }
    }


    type InstanceCallback = {
        (this: T, instanceName: string, instance: T): void;
    }
    type ValsCallback = {
        (this: NJS, index: number, selEle: NJS): void;
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
