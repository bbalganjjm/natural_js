export class NaturalJS {
    static VERSION: {
        "Natural-JS": string;
        "Natural-CORE": string;
        "Natural-ARCHITECTURE": string;
        "Natural-DATA": string;
        "Natural-UI": string;
        "Natural-UI.Shell": string;
    };
    static get version(): {
        "Natural-JS": string;
        "Natural-CORE": string;
        "Natural-ARCHITECTURE": string;
        "Natural-DATA": string;
        "Natural-UI": string;
        "Natural-UI.Shell": string;
    };
    /**
     * Initializes and returns a new N object based on jQuery objects with the provided selector and context argument values.
     */
    constructor(selector: any, context: any);
    selector: string;
}
export function N(selector: any, context: any): NaturalJS;
