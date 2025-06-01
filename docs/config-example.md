# Config Example

This is a sample configuration file (natural.config.js) that shows how to set up Natural-JS.

```javascript
(function(N) {
    // Set Natural-JS Config
    N.context.attr("core", {
        // Basic settings
        "locale" : "en_US",
        "sgChkdVal" : "Y", // Default value when one checkbox is checked in N().vals method
        "sgUnChkdVal" : "N", // Default value when one checkbox is unchecked in N().vals method
        "spltSepa" : "$@^", // String separator used in Natural-JS
        "gcMode" : "full", // Garbage collection mode of N.gc function
        "charByteLength" : 3 // Set the default byte length of multi-byte characters
    });

    N.context.attr("architecture", {
        // Required for page-based applications
        "page" : {
            "context" : ".main-content"
        },
        "cont" : {
            // Define AOP settings here
        },
        "comm" : {
            "filters" : [
                // Define Communication Filters here
            ],
            "request" : {
                // Global options for N.comm.request
            }
        }
    });

    N.context.attr("data", {
        "formatter" : {
            "date" : {
                "dateSepa" : "-", // Year, month, day separator
                "timeSepa" : ":", // Hour, minute, second separator
                // Date format functions
                "Ym" : function() {
                    return "Y" + this.dateSepa + "m";
                },
                "Ymd" : function() {
                    return "Y" + this.dateSepa + "m" + this.dateSepa + "d";
                }
                // ... other date formats
            }
        },
        "validator" : {
            // User-defined validation rules
            "userRules" : {
                // Define custom validation rules here
            },
            // Error messages
            "message" : {
                "ko_KR" : {
                    // Korean error messages
                },
                "en_US" : {
                    // English error messages
                }
            }
        }
    });

    N.context.attr("ui", {
        // Required for UI components
        "alert" : {
            "container" : ".main-content",
            "global" : {
                "okBtnStyle" : {
                    "color" : "yellowgreen",
                    "size" : "medium"
                },
                "cancelBtnStyle" : {
                    "size" : "medium"
                }
            }
        },
        // Other UI component settings
        "datepicker" : {
            "monthonlyOpts" : {
                "yearsPanelPosition" : "top",
                "monthsPanelPosition" : "top"
            }
        }
    });

    // Additional package configurations as needed
    N.context.attr("ui.shell", {
        // Shell UI components settings
    });

    N.context.attr("template", {
        // Template settings
    });

    N.context.attr("code", {
        // Code inspection settings
    });

})(N);
```

This example shows the basic structure of a Natural-JS configuration file. You should customize it according to your application's requirements.
