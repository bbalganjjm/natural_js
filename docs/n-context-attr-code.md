# N.context.attr("code") - Configurations of Natural-CODE

| Name | Default | Required | Description |
|------|---------|----------|-------------|
| abortOnError | false | O | Specifies whether to stop the logic by throwing an ERROR when a code of ERROR type is detected. |
| excludes | [] | O | Defines the statements to exclude from the scan as a string. If the detected code contains the following string, it is excluded.<br>Example:<br>```javascript<br>excludes : [ ".index-header", ".page-header", ".index-lefter", ".index-contents", ".index-footer" ]<br>``` |
| message | `{ "ko_KR" : { ... }, "en_US" : { ... } }` | O | Multilingual Message of Code inspection. |
