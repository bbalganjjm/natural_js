# Validator Validation Rule List

The Validator component provides various validation rules to verify that data meets specific criteria. Rule names are not case-sensitive.

## ["required"]

**Return**: boolean

Required input. Validates that a value has been entered.

## ["alphabet"]

**Return**: boolean

Only English characters are allowed.

## ["integer"]

**Return**: boolean

Only numbers (integer) are allowed.

## ["korean"]

**Return**: boolean

Only Korean characters are allowed.

## ["alphabet+integer"]

**Return**: boolean

Only alphanumeric (letters and integers) characters are allowed (separated by +, order is irrelevant).

## ["integer+korean"]

**Return**: boolean

Only numbers (integer) and Hangul characters are allowed (separated by +, order is irrelevant).

## ["alphabet+korean"]

**Return**: boolean

Only English and Korean characters are allowed (separated by +, order is irrelevant).

## ["alphabet+integer+korean"]

**Return**: boolean

Only English, numbers (integer), and Hangul characters are allowed (separated by +, order is irrelevant).

## ["integer+dash"]

**Return**: boolean

Only numbers (integer) and dash (-) characters are allowed (separated by +, order is irrelevant).

## ["integer+commas"]

**Return**: boolean

Only numbers (integer) and commas (,) are allowed (separated by +, order is irrelevant).

## ["number"]

**Return**: boolean

Only numbers (integer), comma (,), and dot (.) characters are allowed.

## ["decimal", length]

**Return**: boolean

You can enter up to the "length" digit of the decimal (limited) point.

## ["phone", isPartialDigits]

**Return**: boolean

Checks if the input matches a South Korean phone number format.

If isPartialDigits is true, it will pass even if only 1 of the last 4 digits of the phone number is entered.

## ["email"]

**Return**: boolean

Checks if the input matches the e-mail format.

## ["url"]

**Return**: boolean

Checks if the input matches a URL format.

## ["zipcode"]

**Return**: boolean

Checks if the input matches the format of a postal code in Korea.

## ["rrn"]

**Return**: boolean

Checks if the input matches the Korean Resident Registration Number format.

## ["ssn"]

**Return**: boolean

Checks if the input matches the US Social Security Number format.

## ["frn"]

**Return**: boolean

Checks if the input matches the format of the alien registration number in Korea.

## ["frn_rrn"]

**Return**: boolean

Checks if the input matches either the alien registration number or resident registration number format.

## ["kbrn"]

**Return**: boolean

Checks if the input matches the Korean business registration number format.

## ["kcn"]

**Return**: boolean

Checks if the input matches the Korean corporate number format.

## ["date"]

**Return**: boolean

Checks if the input matches a valid date format.

## ["time"]

**Return**: boolean

Checks if the input matches a valid time format.

## ["accept", "word"]

**Return**: boolean

Only the exact "word" value is allowed.

## ["notAccept", "word"]

**Return**: boolean

Any value except the exact "word" value is allowed.

## ["match", "word"]

**Return**: boolean

Only values that contain the "word" value are allowed.

## ["notMatch", "word"]

**Return**: boolean

Only values that do not contain the "word" value are allowed.

## ["acceptFileExt", "fileExtention"]

**Return**: boolean

Only files with the "fileExtention" extension are allowed.

## ["notAcceptFileExt", "fileExtention"]

**Return**: boolean

Files with the "fileExtention" extension are not allowed.

## ["equalTo", "input"]

**Return**: boolean

Input is allowed only when the value matches the value of the specified "input" element.

## ["maxlength", length]

**Return**: boolean

Only input with character count less than or equal to "length" is allowed.

## ["minlength", length]

**Return**: boolean

Only input with character count greater than or equal to "length" is allowed.

## ["rangelength", startLength, endLength]

**Return**: boolean

Only input with character count between "startLength" and "endLength" (inclusive) is allowed.

## ["maxbyte", byteLength, defaultCharByteLength]

**Return**: boolean

Only input with byte length less than or equal to "byteLength" is allowed.

defaultCharByteLength is the default byte length for Hangul, Hangul special characters, etc., excluding English, numbers, and basic special characters. If not entered, the value of N.context.attr("core").charByteLength of Config(natural.config.js) is applied.

## ["minbyte", byteLength, defaultCharByteLength]

**Return**: boolean

Only input with byte length greater than or equal to "byteLength" is allowed.

defaultCharByteLength is the default byte length for Hangul, Hangul special characters, etc., excluding English, numbers, and basic special characters. If not entered, the value of N.context.attr("core").charByteLength of Config(natural.config.js) is applied.

## ["rangebyte", startByteLength, endByteLength, defaultCharByteLength]

**Return**: boolean

Only input with byte length between "startByteLength" and "endByteLength" (inclusive) is allowed.

defaultCharByteLength is the default byte length for Hangul, Hangul special characters, etc., excluding English, numbers, and basic special characters. If not entered, the value of N.context.attr("core").charByteLength of Config(natural.config.js) is applied.

## ["maxvalue", number]

**Return**: boolean

Only values less than or equal to "number" are allowed.

## ["minvalue", number]

**Return**: boolean

Only values greater than or equal to "number" are allowed.

## ["rangevalue", startNumber, endNumber]

**Return**: boolean

Only values between "startNumber" and "endNumber" (inclusive) are allowed.

## ["regexp", "regexp string", "flag", "message"]

**Return**: boolean

Validates the input against the provided regular expression pattern. If validation fails, the specified "message" is displayed as a tooltip.

Regular expression evaluation is executed as follows:
```
\{regexp string}\{flag}
```

If there is no "flag", enter it as an empty value.

If "message" is not entered, the default message ("It Can't pass the field verification.") is displayed.
