/**
 * Natural-JS Architecture Context
 */

export class Context {
    static attrObj = {};

    static attr(name, obj) {
        if (name !== undefined) {
            if (obj !== undefined) {
                Context.attrObj[name] = obj;
            } else {
                return Context.attrObj[name];
            }
        }

        return this;
    }
}

export default Context;
