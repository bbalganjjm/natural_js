# N.context.attr("core") - Configurations of Natural-CORE

| Name | Default | Required | Description |
|------|---------|----------|-------------|
| locale | ko_KR | O | Default locale. Natural-JS handles multilingual messages with this setting value. You should specify Full Locale like en_US and you can change the setting value with N.locale function. |
| sgChkdVal | Y | O | Default value when one checkbox is checked in N().vals method. Define according to the project data standards such as "Y", "1", and "on". |
| sgUnChkdVal | N | O | Default value when one checkbox is unchecked in N().vals method. Define according to the project data standards such as "N", "0", and "off". |
| spltSepa | $@^ | O | String separator used in Natural-JS. |
| gcMode | full | O | Garbage collection mode of N.gc function. For more information, refer to the [Function of N.gc Object](n-gc-object-functions.md) section. |
| charByteLength | 3 | O | Set the default byte length of characters except single-byte characters such as English and numeric characters. charByteLength is used in logic that checks the length of a string, such as N.string.byteLength function and maxbyte, minbyte, rangebyte verification rules, etc. |
