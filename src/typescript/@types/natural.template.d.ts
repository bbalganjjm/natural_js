export class NT {
    static aop: {
        new (): {};
        codes(cont: any, joinPoint: any): void;
        template(cont: any, joinPoint: any): void;
        components(cont: any, prop: any, compActionDefer: any): void;
        events(cont: any, prop: any): void;
    };
}
