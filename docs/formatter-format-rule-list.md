# Formatter Format Rule List

The Formatter component provides various format rules to convert data into specific formats. Rule names are not case-sensitive.

## ["commas"]

**Return**: string

Adds commas(,) at thousand separators. It processes only the part before the decimal point, if present.

## ["rrn"]

**Return**: string

Convert to South Korean resident registration number format.

## ["ssn"]

**Return**: string

Convert to US Social Security number format.

## ["kbrn"]

**Return**: string

Convert to South Korean business registration number format.

## ["kcn"]

**Return**: string

Convert to South Korean corporate number format.

## ["upper"]

**Return**: string

Convert to uppercase.

## ["lower"]

**Return**: string

Convert to lowercase.

## ["capitalize"]

**Return**: string

Converts the first alphabetic character to uppercase.

## ["zipcode"]

**Return**: string

Convert to South Korean zip code format.

## ["phone"]

**Return**: string

Convert to South Korean phone number format.

## ["realnum"]

**Return**: string

Remove meaningless zeros.

```
0100.0 -> 100
0100.10 -> 100.1
```

## ["trimToEmpty"]

**Return**: string

Removes the first and last whitespace from a string. If the input string is null or undefined, it is converted to an empty string.

## ["trimToZero"]

**Return**: string

Removes the first and last whitespace from a string. If the input string is empty, null, or undefined, it is converted to 0.

## ["trimToVal", "valStr"]

**Return**: string

Removes the first and last whitespace from a string. If the input string is empty, null, or undefined, it is converted to valStr.

## ["date", 4|6|8|10|12|14, "month"|"date", { "datepicker options" : "" }]

**Return**: string

Converts to date format.

The global date format can be set in the N.context.attr("data").formatter.date property of Config(natural.config.js).

1. The following is the description of the second argument value.

If you specify the length as a number type, it is converted as follows.

- 4: Year
- 6: Year-Month
- 8: Year-Month-Day
- 10: Year-Month-Day Hour
- 12: Year-Month-Day Hour:Minute
- 14: Year-Month-Day Hour:Minute:Second

If you specify a date format rule as a string type, it is converted as follows.

- Y: Year(4 digits)
- y: year(2 digits)
- m: month
- d: day
- H: Hour
- i: minute
- s: second

```
"1999/12/31" : "Y/m/d"
"99/12/31" : "y/m/d"
"31/12" : "d/m"
"12/31/1999" : "m/d/Y"
"1999-12-31 12:01:59" : "Y-m-d H:i:s"
```

2. The following is the description of the third argument value.

- date: Datepicker is displayed.
- month: Monthpicker is displayed.

3. In the fourth argument, if you declare Datepicker's options as a JSON-formatted string, the component's options apply.

## ["time", 2|4|6]

**Return**: string

Convert to time format.

The global character format to separate time can be set in the N.context.attr("data").formatter.timeSepa property of Config(natural.config.js).

If you specify the length as number type in the second argument, it is converted as follows.

- 2: Hour
- 4: Hour:Minute
- 6: Hour:Minute:Second

## ["limit", cutLength, "replaceStr"]

**Return**: string

Cuts the string by "cutLength" and appends "replacementStr" after it.

## ["replace", "targetStr", "replaceStr"]

**Return**: string

Replace "targetStr" with "replaceStr".

## ["lpad", length, "fill string"]

**Return**: string

Fill with "fill string" from the left as much as "length".

## ["rpad", length, "fill string"]

**Return**: string

Fill with "fill string" from the right as much as "length".

## ["mask", "phone", "masking character"]

**Return**: string

Masking the phone number of Korea.

If the "masking character" argument is not entered, it is replaced with the "*" character.

## ["mask", "email", "masking character"]

**Return**: string

Masking the email address.

If the "masking character" argument is not entered, it is replaced with the "*" character.

## ["mask", "address", "masking character"]

**Return**: string

Masking the address.

If the "masking character" argument is not entered, it is replaced with the "*" character.

## ["mask", "name", "masking character"]

**Return**: string

Masking the name.

If the "masking character" argument is not entered, it is replaced with the "*" character.

## ["mask", "rrn", "masking character"]

**Return**: string

Masking the Resident registration number of Korea.

If the "masking character" argument is not entered, it is replaced with the "*" character.

## ["generic", "user format"]

**Return**: string

Formats a string using a user format.

The generic and numeric rules were developed based on the [Mask JavaScript API (v0.4b)](https://pengoworks.com/workshop/js/mask/) library. The date masking part was removed, and the Hangul recognition part and processing for values less than 0(values after the decimal point) were added, and the function was changed to allow * characters and space characters(existing * character is converted to ~ character). For detailed usage and examples, please refer to [here](https://pengoworks.com/workshop/js/mask/).

- #: Number, Space character
- @: Hangul(consonants/vowels), English characters, Space characters
- ~: Hangul(consonants/vowels), English characters, Number, Space characters

The following is an example of using Generic Mask in the Mask JavaScript API homepage.

```
mask: ~~~~'~-~~~
string: namesdan
result: name's-dan

mask: (###) ###-####
string: 614-777-6094
result: (614) 777-6094

mask: (###) ###-####
string: 6147776094
result: (614) 777-6094

mask: (###) ###-####
string: 614.777.6094
result: (614) 777-6094

mask: (###) ###-####
string: 6147a76094
result: 6147a76094

mask: (###) #x*-####
string: 6147a76094
result: (614) 7a7-6094

mask: ###.###.####
string: 614-777-6094
result: 614.777.6094

mask: ###/###.####
string: 614-777-6094
result: 614/777.6094

mask: phone !#: ###/###.####
string: 614-777-6094
result: phone !: 614/777.6094
```

## ["numeric" "user format", "option"]

**Return**: string

Formats a numeric string using a user format.

Depending on the value of the option argument, the decimal point is processed as follows.

- ceil: Ceil(possible decimal point processing)
- floor: Floor(possible decimal point processing)
- round: Round(decimal point processing possible)

The generic and numeric rules were developed based on the [Mask JavaScript API (v0.4b)](https://pengoworks.com/workshop/js/mask/) library. The date masking part was removed, and the Hangul recognition part and processing for values less than 0(values after the decimal point) were added, and the function was changed to allow * characters and space characters(existing * character is converted to ~ character). For detailed usage and examples, please refer to the link above.

The following is an example of using Numeric Mask in the Mask JavaScript API homepage.

```
mask: 0#####.##
string: 534
result: 000534

mask: 0#####.00
string: 534
result: 000534.00

mask: 0#####.##
string: 534.23
result: 000534.23

mask: 000000.##
string: 534.23
result: 000534.23

mask: +##,###.##
string: 534.23
result: +534.23

mask: #,###.##
string: 999,034,256.5252
result: 999,034,256.53

mask: #,###.##
string: 1,999,034,256.5252
result: 1,999,034,256.53

mask: #,###.##
string: 1,034,256.5252
result: 1,034,256.53

mask: #,###
string: 1,034,256.5242
result: 1,034,256

mask: -(#,###.##)
string: -534.23
result: (-534.23)

mask: (-#,###.##)
string: -534.23
result: (-534.23)

mask: (#,###.##)
string: -534.23
result: (534.23)

mask: (#,###.##)
string: 534.23
result: 534.23

mask: +#,###.##
string: 534.23
result: +534.23

mask: +#,###.##
string: -534.23
result: -534.23

mask: $#,###.##
string: -534.23
result: -$534.23

mask: $#,###.##
string: 53-4.23
result: 53-4.23

mask: $#,###.##
string: --534.23
result: --534.23

mask:
string: dan
result: dan

mask:
string: 6147776094
result: 6147776094

mask: #,###.#0
string: 1,034,256.5242
result: 1,034,256.52

mask: #,###.##
string: 4,256.529
result: 4,256.53

mask: #,###.000000
string: 4,256.529
result: 4,256.529000

mask: #,###.0
string: 4,256.589
result: 4,256.6

mask: #,###.00
string: 4,256.5
result: 4,256.50

mask: #,###.#0
string: 4,256.5
result: 4,256.50

mask: $#,###.##
string: 4,256.5
result: $4,256.5

mask: #,###.##
string: 4,256.5
result: 4,256.5
```
