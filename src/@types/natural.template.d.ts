declare class NT {
    static readonly aop: {
        codes(cont: NA.Controller.Object, joinPoint: function): void;
        template(cont: NA.Controller.Object, joinPoint: function): void;
        components(cont: NA.Controller.Object, prop: string, compActionDefer: JQuery.Deferred[]): void;
        events(cont: NA.Controller.Object, prop: string): void;
    };
}