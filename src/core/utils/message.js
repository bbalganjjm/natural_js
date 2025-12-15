/**
 * Natural-JS Message Utilities
 */

// Temporary placeholder for NC.locale (will be injected from N.js)
let NCLocale;

const getLocale = () => NCLocale || (() => "en_US");

export class MessageUtils {
    /**
     * Replace message variables for NC.message.get
     */
    static replaceMsgVars(msg, vars) {
        if (vars !== undefined) {
            for (let i = 0; i < vars.length; i++) {
                msg = msg.split("{" + String(i) + "}").join(vars[i]);
            }
        }
        return msg;
    }

    /**
     * Get message from message resource
     */
    static get(resource, key, vars) {
        const locale = getLocale()();
        const msg = resource[locale][key];
        return msg !== undefined ? MessageUtils.replaceMsgVars(msg, vars) : key;
    }
}

// Export individual methods
export const { replaceMsgVars, get } = MessageUtils;

// Setter for locale function
export const setLocaleFunction = (fn) => {
    NCLocale = fn;
};
