/**
 * Natural-JS Architecture Controller
 */

import { error as createError } from '../../core/helpers/logger.js';
import { isPlainObject, isString, isElement } from '../../core/helpers/type-checker.js';

export class Controller {
    constructor(obj, contObj) {
        if (obj === undefined || contObj === undefined) {
            throw createError("[N.cont]You must input arguments[0] and arguments[1]");
        }

        this.obj = obj;
        this.contObj = contObj;
        
        // Initialize controller
        this.trInit();
        
        return obj;
    }

    trInit() {
        const contObj = this.contObj;
        const obj = this.obj;

        if (contObj.init) {
            contObj.init.call(obj, contObj);
        }

        return this;
    }

    static trInit(cont, request) {
        if (cont && cont.init) {
            cont.init.call(cont.view, cont, request);
        }
    }
}

export const cont = (obj, contObj) => new Controller(obj, contObj);
export default Controller;
