/**
 * Natural-JS Architecture Controller Class
 * UI logic management with AOP support
 */

import { error as createError } from '../../core/helpers/logger.js';
import { isPlainObject, isString } from '../../core/helpers/type-checker.js';
import { Context } from '../context/context.js';

// Import N function at runtime to avoid circular dependency
const N = () => window.N;

export class Controller {
    constructor(obj, contObj) {
        // Handle duplicate id
        if(obj.attr("id") !== undefined && N()("[id='" + obj.attr("id") + "']").length > 1) {
            obj = N()("#" + obj.attr("id") + ":not([data-pageid])");
        } else {
            const selector = obj.selector;
            if(obj.length > 1) {
                obj = N()(obj.selector + ":not([data-pageid])");
                obj.selector = selector;
            }
        }
        
        // Set data-pageid (remove special characters from selector)
        obj.attr("data-pageid", obj.attr("id") ? obj.attr("id") : obj.selector.replace(/\.|\#|\[|\]|\'|\"|\:|\(|\)|\>| |\-/gi, ""));
        obj.addClass("view_context__");

        // Set instance
        obj.instance("cont", contObj);

        // Set view
        contObj.view = obj;
        return contObj;
    }

    /**
     * "init" method trigger
     */
    static trInit(cont, request) {
        // Set request attribute
        cont.request = request;

        // AOP processing
        Controller.aop.wrap.call(this, cont);

        // Run Controller's "init" method
        if(cont.init !== undefined) {
            cont.init(cont.view, request);
        }
    }

    /**
     * AOP processing module
     */
    static aop = {
        pointcuts : {
            "regexp" : {
                "fn" : function(param, contFrag, fnChain){
                    const regexp = param instanceof RegExp ? param : new RegExp(param);
                    return regexp.test(fnChain);
                }
            }
        },
        wrap : function(cont) {
            const archContext = Context.attr("architecture");
            if (archContext?.cont &&
                archContext.cont.advisors &&
                archContext.cont.advisors.length > 0) {
                const o = archContext.cont;

                jQuery(o.advisors).each(function (idx, advisor) {
                    let pointcut;
                    if (!isPlainObject(advisor.pointcut)) {
                        advisor.pointcut = { "type": "regexp", "param": advisor.pointcut };
                        if(isString(advisor.pointcut.param)){
                            advisor.pointcut.selector = advisor.pointcut.selector || advisor.pointcut.param.substring(0, advisor.pointcut.param.lastIndexOf(":"));
                            advisor.pointcut.param = advisor.pointcut.param.substring(advisor.pointcut.param.lastIndexOf(":") + 1);
                        }
                    }

                    pointcut = o.pointcuts ? (o.pointcuts[advisor.pointcut.type] || Controller.aop.pointcuts[advisor.pointcut.type]) : Controller.aop.pointcuts[advisor.pointcut.type];

                    if(!pointcut){
                        throw createError("[N.cont.aop.wrap]Unknown pointcut type : " + advisor.pointcut.type);
                    }

                    if(advisor.pointcut.selector && !cont.view.is(advisor.pointcut.selector)){
                        return;
                    }

                    const wrapFn = function(contFrag, fnPath){

                        for (const x in contFrag) {
                            if (!contFrag.hasOwnProperty(x)) continue;

                            if(typeof contFrag[x] === "function") {
                                if (pointcut.fn(advisor.pointcut.param, contFrag, fnPath + x)) {
                                    const real = contFrag[x];

                                    contFrag[x] = (function (real, x) {
                                        let wrappedFn;

                                        switch(advisor.adviceType){
                                            case "before":
                                                wrappedFn = function(){
                                                    const args = [].slice.call(arguments);
                                                    advisor.fn.call(advisor, contFrag, fnPath + x, args);
                                                    return real.apply(contFrag, args);
                                                };
                                                break;
                                            case "after":
                                                wrappedFn = function(){
                                                    const args = [].slice.call(arguments);
                                                    const result = real.apply(contFrag, args);
                                                    advisor.fn.call(advisor, contFrag, fnPath + x, args, result);
                                                    return result;
                                                };
                                                break;
                                            case "around":
                                                wrappedFn = function(){
                                                    const args = [].slice.call(arguments);
                                                    return advisor.fn.call(advisor, contFrag, fnPath + x, args, {
                                                        "contFrag" : contFrag,
                                                        "args" : args,
                                                        "real" : real,
                                                        "proceed" : function(){
                                                            return this.real.apply(this.contFrag, this.args);
                                                        }
                                                    });
                                                };
                                                break;
                                            case "error":
                                                wrappedFn = function(){
                                                    const args = [].slice.call(arguments);
                                                    let result;
                                                    try{
                                                        result = real.apply(contFrag, args);
                                                    } catch(e) {
                                                        if (advisor.adviceType === "error") {
                                                            result = advisor.fn.call(advisor, contFrag, fnPath + x, args, e);
                                                        } else {
                                                            throw e;
                                                        }
                                                    }
                                                    return result;
                                                };
                                                break;
                                        }
                                        return wrappedFn;
                                    })(real, x);
                                }
                            } else if(isPlainObject(contFrag[x])) {
                                wrapFn.call(this, contFrag[x], fnPath + x + ".");
                            }
                        }
                    };
                    wrapFn.call(this, cont, "");
                });
            }
        }
    };
}

export const cont = (obj, contObj) => new Controller(obj, contObj);
export default Controller;
