export class NCD {
    static severityLevels: Readonly<{
        BLOCKER: (string | typeof NC.error)[];
        CRITICAL: (string | typeof NC.error)[];
        MAJOR: any[];
        MINOR: any[];
    }>;
    static inspection: {
        new (): {};
        test(codes: any, rules: any): false | any[];
        rules: {
            /**
             * Detect code that does not specify view in the context of jQuery Selector.
             */
            NoContextSpecifiedInSelector: (codes: any, excludes: any, report: any) => void;
            /**
             * Detects code using jQuery's val method instead of the val method of the Natural-UI component.
             */
            UseTheComponentsValMethod: (codes: any, excludes: any, report: any) => void;
        };
        report: {
            console: (data: any, url: any) => boolean;
        };
    };
    static addSourceURL(codes: any, sourceURL: any): any;
}
import { NC } from "./natural.core";
