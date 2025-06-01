# Formatter 포맷 룰 목록

Formatter 컴포넌트는 데이터를 특정 형식으로 변환하기 위한 다양한 포맷 룰을 제공합니다. 룰 명은 대문자와 소문자를 다르게 인식하지 않습니다.

## ["commas"]

**반환**: string

천 단위로 콤마(,)를 추가해 줍니다. 소수점이 있어도 소수점 앞부분만 처리합니다.

## ["rrn"]

**반환**: string

주민등록번호 형식으로 변환합니다.

## ["ssn"]

**반환**: string

미국 사회보장번호 형식으로 변환합니다.

## ["kbrn"]

**반환**: string

사업자등록번호 형식으로 변환합니다.

## ["kcn"]

**반환**: string

법인번호 형식으로 변환합니다.

## ["upper"]

**반환**: string

대문자로 변환합니다.

## ["lower"]

**반환**: string

소문자로 변환합니다.

## ["capitalize"]

**반환**: string

첫 번째 영문자를 대문자로 변환합니다.

## ["zipcode"]

**반환**: string

우편번호 형식으로 변환합니다.

## ["phone"]

**반환**: string

전화번호 형식으로 변환합니다.

## ["realnum"]

**반환**: string

의미 없는 0을 제거합니다.

```
0100.0 -> 100
0100.10 -> 100.1
```

## ["trimToEmpty"]

**반환**: string

문자열의 처음과 마지막 공백을 제거합니다. 입력된 문자열이 null 이거나 undefined 이면 비어있는 문자열로 변환합니다.

## ["trimToZero"]

**반환**: string

문자열의 처음과 마지막 공백을 제거합니다. 입력된 문자열이 비어있거나 null, undefined 이면 0을 변환합니다.

## ["trimToVal", "valStr"]

**반환**: string

문자열의 처음과 마지막 공백을 제거합니다. 입력된 문자열이 비어있거나 null, undefined 이면 valStr 으로 변환합니다.

## ["date", 4|6|8|10|12|14, "month"|"date", { "datepicker options" : "" }]

**반환**: string

날짜 형식으로 변환합니다.

전역 날짜 형식은 Config(natural.config.js)의 N.context.attr("data").formatter.date 속성에서 설정할 수 있습니다.

1. 다음은 두 번째 인수 값에 대한 설명입니다.

number 타입으로 길이를 지정하면 다음과 같이 변환됩니다.

- 4: 년
- 6: 년-월
- 8: 년-월-일
- 10: 년-월-일 시
- 12: 년-월-일 시:분
- 14: 년-월-일 시:분:초

string 타입으로 데이트 포맷 룰을 지정하면 다음과 같이 변환됩니다.

- Y: 년(4자리)
- y: 년(2자리)
- m: 월
- d: 일
- H: 시
- i: 분
- s: 초

```
"1999/12/31" : "Y/m/d"
"99/12/31" : "y/m/d"
"31/12" : "d/m"
"12/31/1999" : "m/d/Y"
"1999-12-31 12:01:59" : "Y-m-d H:i:s"
```

2. 다음은 세 번째 인수 값에 대한 설명입니다.

- date: Datepicker가 표시됩니다.
- month: Monthpicker가 표시됩니다.

3. 네 번째 인수는 Datepicker의 옵션들을 JSON 형식의 문자열로 선언하면 컴포넌트의 옵션이 적용됩니다.

## ["time", 2|4|6]

**반환**: string

시간 형식으로 변환합니다.

시간을 구분하는 문자 형식은 Config(natural.config.js)의 N.context.attr("data").formatter.date 속성에서 설정할 수 있습니다.

두번째 인수에 number 타입으로 길이를 지정하면 다음과 같이 변환됩니다.

- 2: 시
- 4: 시:분
- 6: 시:분:초

## ["limit", cutLength, "replaceStr"]

**반환**: string

"cutLength" 만큼 문자열을 자르고 그 뒤에 "replacementStr" 을 추가합니다.

## ["replace", "targetStr", "replaceStr"]

**반환**: string

"targetStr" 을 "replaceStr" 으로 치환합니다.

## ["lpad", length, "fill string"]

**반환**: string

"length"만큼 왼쪽부터 "fill string"으로 채워 줍니다.

## ["rpad", length, "fill string"]

**반환**: string

"length"만큼 오른쪽부터 "fill string"으로 채워 줍니다.

## ["mask", "phone", "masking character"]

**반환**: string

전화번호를 마스킹합니다.

"masking character" 인수를 입력하지 않으면 "*" 문자로 치환됩니다.

## ["mask", "email", "masking character"]

**반환**: string

이메일 주소를 마스킹합니다.

"masking character" 인수를 입력하지 않으면 "*" 문자로 치환됩니다.

## ["mask", "address", "masking character"]

**반환**: string

주소를 마스킹합니다.

"masking character" 인수를 입력하지 않으면 "*" 문자로 치환됩니다.

## ["mask", "name", "masking character"]

**반환**: string

이름을 마스킹합니다.

"masking character" 인수를 입력하지 않으면 "*" 문자로 치환됩니다.

## ["mask", "rrn", "masking character"]

**반환**: string

주민등록 번호를 마스킹합니다.

"masking character" 인수를 입력하지 않으면 "*" 문자로 치환됩니다.

## ["generic", "사용자서식"]

**반환**: string

사용자 서식을 이용하여 문자열을 서식화합니다.

generic과 numeric 룰은 [Mask JavaScript API (v0.4b)](https://pengoworks.com/workshop/js/mask/) 라이브러리를 기본으로 개발되었습니다. Date 마스킹 부분은 제거하고 한글 인식 부분과 0보다 작은 값들(수수점 뒤 값들)에 대한 처리를 추가하고 * 문자와 공백 문자를 허용(기존 * 문자는 ~ 문자로 변환됨) 하도록 기능을 변경했습니다. 자세한 사용법과 예는 [여기](https://pengoworks.com/workshop/js/mask/)를 참고하세요.

- #: 숫자, 공백문자
- @: 한글(자음/모음), 영문자, 공백문자
- ~: 한글(자음/모음), 영문자, 숫자, 공백문자

다음은 Mask JavaScript API 홈페이지에 있는 Generic Mask 사용 예입니다.

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

## ["numeric" "사용자서식", "option"]

**반환**: string

사용자 서식을 이용하여 숫자 문자열을 서식화합니다.

option 인수 값에 따라 소수점을 다음과 같이 처리합니다.

- ceil: 무조건 올림(소수점 처리 가능)
- floor: 무조건 버림(소수점 처리 가능)
- round: 반올림(소수점 처리 가능)

generic과 numeric 룰은 [Mask JavaScript API (v0.4b)](https://pengoworks.com/workshop/js/mask/) 라이브러리를 기본으로 개발되었습니다. Date 마스킹 부분은 제거하고 한글 인식 부분과 0보다 작은 값들(수수점 뒤 값들)에 대한 처리를 추가하고 * 문자와 공백 문자를 허용(기존 * 문자는 ~ 문자로 변환됨) 하도록 기능을 변경했습니다. 자세한 사용법과 예는 위 링크를 참고하세요.

다음은 Mask JavaScript API 홈페이지에 있는 Numeric Mask 사용 예입니다.

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
