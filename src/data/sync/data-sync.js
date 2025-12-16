/**
 * Natural-JS Data Sync
 * Simplified version - full implementation in original natural.data.js lines 34-100
 */

import { warn } from '../../core/helpers/logger.js';
import { Context } from '../../architecture/context/context.js';

export class DataSync {
    constructor(inst, isReg) {
        const pageContext = jQuery(Context.attr("architecture")?.page?.context || "body");
        if(pageContext.length === 0) {
            warn("[ND.ds]Context element is missing.");
        }
        
        let dataSyncTemp = pageContext.find("var#data_sync_temp__");
        if(dataSyncTemp.length === 0) {
            dataSyncTemp = pageContext.append('<var id="data_sync_temp__"></var>').find("var#data_sync_temp__");
        }
        this.viewContext = dataSyncTemp;

        let siglInst = this.viewContext.instance("ds");
        if (siglInst !== undefined) {
            siglInst.inst = inst;
            if(isReg !== undefined && isReg === true) {
                siglInst.observable.push(inst);
            }
        } else {
            siglInst = this;
            siglInst.inst = inst;
            siglInst.observable = [];
            siglInst.observable.push(inst);
            this.viewContext.instance("ds", siglInst);
        }

        return siglInst;
    }

    static instance(inst, isReg) {
        return new DataSync(inst, isReg);
    }

    remove() {
        const inst = this.inst;
        const observable = this.observable;
        if (inst && observable) {
            for (let i = 0; i < observable.length; i++) {
                if (observable[i] === inst) {
                    observable.splice(i, 1);
                }
            }
        }
        return this;
    }

    notify(row, key) {
        const inst = this.inst;
        const observable = this.observable;
        if (inst && observable) {
            for (let i = 0; i < observable.length; i++) {
                if (inst !== observable[i] && inst.options.data === observable[i].options.data) {
                    // Check if observable is a Form instance and handle accordingly
                    const Form = window.N?.form;
                    if(Form && observable[i] instanceof Form) {
                        if(row === observable[i].row()) {
                            observable[i].update(row, key);
                        }
                    } else {
                        observable[i].update(row, key);
                    }
                }
            }
        }
        return this;
    }
}

export const ds = DataSync;
export default DataSync;
