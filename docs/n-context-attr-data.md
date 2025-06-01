# N.context.attr("data") - Configurations of Natural-DATA

| Name | Default | Required | Description |
|------|---------|----------|-------------|
| formatter.userRules | - | X | Custom format rules. Function name becomes rule name. `str`: Target string of format, `args`: Format option. The function must return a formatted string. Example:<br>```javascript<br>"userRules" : {<br>    "userRule" : function(str, args) {<br>        return str;<br>    }<br>}<br>``` |
| formatter.date | - | X | Specifies the date format to be used globally for the application. Date/time format: Y: year, m: month, d: day, H: hour, i: minute, s: second |
| formatter.date.dateSepa | - | O | Year, month, day separator |
| formatter.date.timeSepa | : | O | Hour, minute, second separator |
| formatter.date.Ym | `function() { return "Y" + this.dateSepa + "m"; }` | O | Year, month format function. The format is specified in the return statement. |
| formatter.date.Ymd | `function() { return "Y" + this.dateSepa + "m" + this.dateSepa + "d"; }` | O | Year, month, day format function. The format is specified in the return statement. |
| formatter.date.YmdH | `function() { return this.Ymd() + " H"; }` | O | Year, month, day, hour format function. The format is specified in the return statement. |
| formatter.date.YmdHi | `function() { return this.Ymd() + " H" + this.timeSepa + "i"; }` | O | Year, month, day, hour, minute format function. The format is specified in the return statement. |
| formatter.date.YmdHis | `function() { return this.Ymd() + " H" + this.timeSepa + "i" + this.timeSepa + "s"; }` | O | Year, month, day, hour, minute, second format function. The format is specified in the return statement. |
| validator.userRules | - | X | Custom validation rules. Function name becomes rule name. The validation failure message is defined in the following N.context.attr("data").validator.message object with a property name same as the function name for each language. `str`: Target string of validation, `args`: validation options. The function must return true if validation succeeds, false if it fails. Example:<br>```javascript<br>"userRules" : {<br>    "userRule" : function(str, args) {<br>        return true;<br>    }<br>}<br>``` |
| validator.message | `{ "ko_KR" : { ... }, "en_US" : { ... } }` | O | Validation error multilingual message. To add a language, copy the language set, specify the language set object property name as its locale string, and define the message. |
