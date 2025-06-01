# Natural-DATA 모듈 개발자 가이드

Natural-DATA 모듈은 데이터 조작, 검증, 형식화 및 관련 작업을 위한 라이브러리를 제공하는 Natural-JS의 핵심 모듈입니다. 이 모듈은 사용자 인터페이스와 서버 간의 데이터 흐름을 효율적으로 관리하는 데 필수적인 도구를 제공합니다.

## 목차

1. [Formatter](#formatter)
   - [개요](#formatter-개요)
   - [생성자](#formatter-생성자)
   - [메소드](#formatter-메소드)
   - [사용 예제](#formatter-사용-예제)
   - [포맷 규칙 목록](#formatter-포맷-규칙-목록)
2. [Validator](#validator)
   - [개요](#validator-개요)
   - [생성자](#validator-생성자)
   - [함수](#함수)
   - [유효성 검증 룰 목록](#유효성-검증-룰-목록)
   - [예제](#예제)
3. [Natural-DATA 라이브러리](#natural-data-라이브러리)
   - [개요](#natural-data-라이브러리-개요)
   - [메소드](#natural-data-라이브러리-메소드)
   - [사용 예제](#natural-data-라이브러리-사용-예제)
   - [고급 활용](#natural-data-라이브러리-고급-활용)

## Formatter

<a name="formatter-개요"></a>
### 개요

Formatter(N.formatter)는 입력 데이터 세트(JSON 객체 배열)를 형식화하고 형식화된 데이터 세트를 반환하는 라이브러리입니다.

- 데이터 형식 규칙이 data-format 속성으로 선언된 요소들을 감싸는 요소를 규칙 세트 대신 입력하면, 해당 요소에 형식화된 문자열을 표시합니다.
  이 경우 요소가 텍스트를 입력하는 요소라면, 커서가 포커스를 받을 때는 원래 데이터 문자열을 표시하고, 포커스가 빠졌을 때는 형식화된 문자열을 표시합니다.
- 데이터 세트가 아닌 문자열에도 형식화를 적용할 수 있습니다.

<a name="formatter-생성자"></a>
### 생성자

#### N.formatter

`N.formatter` 인스턴스를 생성합니다.

```javascript
var formatter = new N.formatter(data, rules|context);
```

| 인자 | 타입 | 설명 |
|------|------|------|
| data | array[object] | 형식화할 데이터를 지정합니다. |
| rules\|context | object\|jQuery object | 형식 규칙은 다음 두 가지 유형으로 지정할 수 있습니다. |

**규칙을 객체 옵션으로 지정하는 경우:**

```javascript
// { "컬럼 속성 이름" : [["규칙 이름", 인자[0], 인자[1]... ] }
new N.formatter(data, {
    "numeric" : [["trimtoempty"], ["numeric", "#,###.##0000"]],
    "generic" : [["trimtoempty"], ["generic", "@@ABCD"]],
    "limit" : [["trimtoempty"], ["limit", "13", "..."]],
    "etc" : [["date", 12]]
}).format();
```

**data-validate 속성이 정의된 요소를 포함하는 컨텍스트 요소를 jQuery 객체로 지정하는 경우:**

```html
<div class="formatter-context">
    <!-- [ ["규칙 이름", "인자[0]", "인자[1]"], ... ] -->
    <input id="limit" type="text" data-format='[["trimtoempty"], ["limit", "13", "..." ]]' />
</div>
```

```javascript
N.formatter(data, N(".formatter-context", view)).format();
```

**동적으로 형식 규칙을 변경하고 싶은 경우:**

```javascript
N("#limit").data("format", [["trimtoempty"]])
```

#### N(obj).formatter

jQuery 플러그인 메소드로 N.formatter 객체 인스턴스를 생성합니다.

```javascript
var formatter = N(data).formatter(rules|context);
```

객체 인스턴스를 생성하는 방법은 다르지만, "new N.formatter()"로 생성된 인스턴스와 "N().formatter"로 생성된 인스턴스는 동일합니다. N() 함수의 첫 번째 인자는 새 N.formatter 생성자의 첫 번째 인자로 설정됩니다.

<a name="formatter-메소드"></a>
### 메소드

#### format

형식화를 실행합니다.

```javascript
formatter.format(row);
```

| 인자 | 타입 | 설명 |
|------|------|------|
| row | number | 형식화할 데이터 목록의 행 인덱스. |

row 인자가 설정되지 않으면 다음과 같이 작동합니다:
- 규칙을 객체 옵션으로 지정했을 경우: 모든 행 데이터를 형식화합니다.
- data-validate 속성이 정의된 요소를 포함하는 컨텍스트 요소를 jQuery 객체로 지정했을 경우: 자동으로 첫 번째 행 인덱스로 지정됩니다.

규칙을 객체 옵션으로 지정한 경우, 다음 형태로 데이터를 반환합니다:

```javascript
[{
    "컬럼 속성 이름" : "형식화된 데이터 값"
}]
```

#### unformat

원본 데이터로 대체하거나 반환합니다.

```javascript
formatter.unformat(row, key);
```

| 인자 | 타입 | 설명 |
|------|------|------|
| row | number | 데이터 목록에서 형식 해제할 행의 인덱스. |
| key | string | 행 데이터에서 형식 해제할 열 속성의 이름. |

<a name="formatter-사용-예제"></a>
### 사용 예제

#### 1. N.form이나 N.grid로 데이터를 바인딩하기 전에 열 값이 바인딩될 요소의 data-format 속성에 형식 규칙을 선언

```html
<input id="startDate" type="text" data-format='[["date", 8]]'>
```

위와 같이 HTML 요소에 선언하면, 요소가 포커스를 잃을 때 형식화가 적용되고, 요소가 다시 포커스를 받을 때는 형식화가 제거됩니다.

```html
<span id="startDate" data-format='[["date", 8]]'></span>
```

위와 같이 입력이 아닌 요소에 형식 규칙을 선언하면, 형식화된 값이 요소의 텍스트로 설정됩니다.

Formatter는 N.grid나 N.form과 같은 UI 컴포넌트의 요소에 형식화된 값을 바인딩하지 않고, 원본 입력 데이터는 변경하지 않은 채 표시되는 값만 형식화합니다. 따라서 서버로 데이터를 전송할 때 형식을 해제할 필요가 없습니다.

#### 2. N.formatter 라이브러리를 사용한 형식화

요소에 형식 규칙을 선언할 때, data-format='[["limit", 12, "..."]]' 속성 값에서 "date"는 형식화 규칙이고, 8은 형식 매개변수이며, 형식화할 문자열은 입력 요소의 값이나 다른 요소의 텍스트입니다.

형식 규칙 함수를 명령으로 처리하는 방법은 다음과 같습니다:

```javascript
// N.formatter.{rule}("형식화할 문자열", ...인자);

N.formatter.limit("abcdefghijklmn", [12, "..."]); // 'abcdefghijkl...'
```

#### 3. 요소에 바인딩된 formatter 관련 이벤트를 직접 트리거하기

Formatter에 규칙 대신 입력 요소를 지정하면, 해당 입력 요소에 "format"과 "unformat" 이벤트가 생성됩니다. 이 이벤트들은 jQuery의 trigger 메소드를 사용하여 직접 트리거할 수 있습니다.

```javascript
N("input[name='targetEle']").trigger("unformat");

N("input[name='targetEle']").trigger("format");
```

#### 4. 형식 규칙을 동적으로 변경하고 즉시 적용하기

```javascript
N("selector").data("format", [["trimtoempty"]]).trigger("format");
```

코드가 제대로 작동하려면, 컴포넌트에 데이터를 바인딩하기 전에 대상 요소의 data-format 속성에 최소한 하나의 형식 규칙이 선언되어 있어야 합니다.

<a name="formatter-포맷-규칙-목록"></a>
### 포맷 규칙 목록

형식 규칙 이름은 대소문자를 구별하지 않습니다.

| 규칙명 | 설명 |
|-------|------|
| ["commas"] | 천 단위 구분자 쉼표(,)를 추가합니다. 소수점이 있는 경우 소수점 앞 부분만 처리합니다. |
| ["rrn"] | 한국의 주민등록번호 형식으로 변환합니다. |
| ["ssn"] | 미국의 사회보장번호 형식으로 변환합니다. |
| ["kbrn"] | 한국의 사업자등록번호 형식으로 변환합니다. |
| ["kcn"] | 한국의 법인번호 형식으로 변환합니다. |
| ["upper"] | 대문자로 변환합니다. |
| ["lower"] | 소문자로 변환합니다. |
| ["capitalize"] | 첫 번째 알파벳 문자를 대문자로 변환합니다. |
| ["zipcode"] | 한국 우편번호 형식으로 변환합니다. |
| ["phone"] | 한국 전화번호 형식으로 변환합니다. |
| ["realnum"] | 의미 없는 0을 제거합니다. 예: 0100.0 -> 100, 0100.10 -> 100.1 |
| ["trimToEmpty"] | 문자열의 처음과 마지막 공백을 제거합니다. 입력 문자열이 null이나 undefined인 경우 빈 문자열로 변환됩니다. |
| ["trimToZero"] | 문자열의 처음과 마지막 공백을 제거합니다. 입력 문자열이 빈 문자열, null이나 undefined인 경우 0으로 변환됩니다. |
| ["trimToVal", "valStr"] | 문자열의 처음과 마지막 공백을 제거합니다. 입력 문자열이 빈 문자열, null이나 undefined인 경우 valStr으로 변환됩니다. |
| ["date", 4\|6\|8\|10\|12\|14, "month"\|"date", { "datepicker options" : "" }] | 날짜 형식으로 변환합니다. |

날짜 형식에 대한 자세한 설명:
1. 두 번째 인자 값 설명
   - 숫자 타입으로 길이를 지정하면 다음과 같이 변환됩니다:
     - 4: 연도
     - 6: 연도-월
     - 8: 연도-월-일
     - 10: 연도-월-일 시
     - 12: 연도-월-일 시:분
     - 14: 연도-월-일 시:분:초
   - 문자열 타입으로 날짜 형식 규칙을 지정하면 다음과 같이 변환됩니다:
     - Y: 연도(4자리)
     - y: 연도(2자리)
     - m: 월
     - d: 일
     - H: 시
     - i: 분
     - s: 초

     예시:
     - "1999/12/31" : "Y/m/d"
     - "99/12/31" : "y/m/d"
     - "31/12" : "d/m"
     - "12/31/1999" : "m/d/Y"
     - "1999-12-31 12:01:59" : "Y-m-d H:i:s"

2. 세 번째 인자 값 설명
   - date : Datepicker가 표시됩니다.
   - month : Monthpicker가 표시됩니다.

3. 네 번째 인자에 JSON 형식의 문자열로 Datepicker의 옵션을 선언하면 컴포넌트의 옵션이 적용됩니다.

| 규칙명 | 설명 |
|-------|------|
| ["time", 2\|4\|6] | 시간 형식으로 변환합니다. |

시간 형식에 대한 자세한 설명:
- 두 번째 인자에 숫자 타입으로 길이를 지정하면 다음과 같이 변환됩니다:
  - 2: 시
  - 4: 시:분
  - 6: 시:분:초

| 규칙명 | 설명 |
|-------|------|
| ["limit", cutLength, "replaceStr"] | 문자열을 "cutLength"로 자르고 그 뒤에 "replaceStr"을 추가합니다. |
| ["replace", "targetStr", "replaceStr"] | "targetStr"을 "replaceStr"로 대체합니다. |
| ["lpad", length, "fill string"] | "length"만큼 왼쪽에서부터 "fill string"으로 채웁니다. |
| ["rpad", length, "fill string"] | "length"만큼 오른쪽에서부터 "fill string"으로 채웁니다. |
| ["mask", "phone", "masking character"] | 한국 전화번호를 마스킹합니다. "masking character" 인자가 입력되지 않으면 "*" 문자로 대체됩니다. |
| ["mask", "email", "masking character"] | 이메일 주소를 마스킹합니다. "masking character" 인자가 입력되지 않으면 "*" 문자로 대체됩니다. |
| ["mask", "address", "masking character"] | 주소를 마스킹합니다. "masking character" 인자가 입력되지 않으면 "*" 문자로 대체됩니다. |
| ["mask", "name", "masking character"] | 이름을 마스킹합니다. "masking character" 인자가 입력되지 않으면 "*" 문자로 대체됩니다. |
| ["mask", "rrn", "masking character"] | 한국의 주민등록번호를 마스킹합니다. "masking character" 인자가 입력되지 않으면 "*" 문자로 대체됩니다. |
| ["generic", "사용자서식"] | 사용자 형식을 사용하여 문자열을 형식화합니다. |

generic 규칙과 numeric 규칙은 Mask JavaScript API (v0.4b) 라이브러리를 기반으로 개발되었습니다. 날짜 마스킹 부분은 제거되었고, 한글 인식 부분과 0보다 작은 값(소수점 이후 값)에 대한 처리가 추가되었으며, * 문자와 공백 문자를 허용하도록 기능이 변경되었습니다(기존 * 문자는 ~ 문자로 변환).

| 마스크 문자 | 설명 |
|-----------|------|
| # | 숫자, 공백 문자 |
| @ | 한글(자음/모음), 영문자, 공백 문자 |
| ~ | 한글(자음/모음), 영문자, 숫자, 공백 문자 |

| 규칙명 | 설명 |
|-------|------|
| ["numeric" "사용자서식", "option"] | 사용자 형식을 사용하여 숫자 문자열을 형식화합니다. |

옵션 인자 값에 따라 소수점은 다음과 같이 처리됩니다:
- ceil : 올림(소수점 처리 가능)
- floor : 내림(소수점 처리 가능)
- round : 반올림(소수점 처리 가능)

## Validator

<a name="validator-개요"></a>
### 개요

Validator(N.validator)는 입력 데이터 세트(json 객체 배열)를 검증하고 검증 결과 데이터 세트를 반환하는 라이브러리입니다.

data-validate 속성으로 검증 규칙이 선언된 입력 요소를 감싸는 요소를 인자로 입력하면, 입력 요소의 커서가 포커스를 잃을 때 해당 요소에 입력된 값이 검증되고, 검증에 실패하면 입력 요소 근처에 툴팁 형태의 오류 메시지가 표시됩니다.

데이터 세트가 아닌 문자열로도 검증이 가능합니다.

<a name="validator-생성자"></a>
### 생성자

#### N.validator

`N.validator` 인스턴스를 생성합니다.

```javascript
var validator = new N.validator(data, rules|context);
```

| 인자 | 타입 | 설명 |
|------|------|------|
| data | array[object] | 검증할 데이터를 지정합니다. |
| rules\|context | object\|jQuery object | 검증 규칙은 다음 두 가지 유형으로 지정할 수 있습니다. |

**규칙을 객체 옵션으로 지정하는 경우:**

```javascript
// { "컬럼 속성 이름" : [["규칙 이름", 인자[0], 인자[1]... ] }
new N.validator(data, {
    "numeric" : [["required"], ["integer+commas"]],
    "generic" : [["required"], ["korean"]],
    "limit" : [["required"], ["alphabet"]]
}).validate();
```

**data-validate 속성이 정의된 요소를 포함하는 컨텍스트 요소를 jQuery 객체로 지정하는 경우:**

```html
<div class="validator-context">
    <!-- [ ["규칙 이름", "인자[0]", "인자[1]"], ... ] -->
    <input id="numeric" type="text" data-validate='[["required"], ["integer+commas"]]'/>
</div>
```

```javascript
N.validator(data, N(".validator-context", view)).validate();
```

**동적으로 검증 규칙을 변경하고 싶은 경우:**

```javascript
N("#numeric").data("validate", [["required"], ["integer"]])
```

#### N(obj).validator

jQuery 플러그인 메소드로 N.validator 객체 인스턴스를 생성합니다.

```javascript
var validator = N(data).validator(rules|context);
```

객체 인스턴스를 생성하는 방법은 다르지만, "new N.validator()"로 생성된 인스턴스와 "N().validator"로 생성된 인스턴스는 동일합니다. N() 함수의 첫 번째 인자는 새 N.validator 생성자의 첫 번째 인자로 설정됩니다.

### 함수

#### validate

지정된 데이터의 유효성을 검증합니다.

```javascript
validator.validate([row]);
```

| 인자 | 타입 | 필수 | 설명 |
|------|------|------|------|
| row | number | X | 유효성 검증할 데이터 목록의 행 index. 입력하지 않으면 전체 행 데이터가 검증됩니다. |

#### 반환값

* **Object**: 유효성 검증 결과 데이터. 검증에 실패한 요소는 포커스가 주어지고 툴팁 형태로 오류 메시지가 표시됩니다.

> 검증 메시지는 Config(natural.config.js)의 N.context.attr("data").validator.message 속성에서 설정할 수 있습니다.

### 유효성 검증 룰 목록

검증 룰 이름은 대소문자를 구분하지 않습니다.

| 룰명 | 설명 |
|------|------|
| ["required"] | 필수입력 |
| ["alphabet"] | 영문자만 입력 가능 |
| ["integer"] | 숫자(정수)만 입력 가능 |
| ["korean"] | 한글만 입력 가능 |
| ["alphabet+integer"] | 영문자와 숫자(정수)만 입력 가능(+로 구분하고 순서는 관계없음) |
| ["integer+korean"] | 숫자(정수)와 한글만 입력 가능(+로 구분하고 순서는 관계없음) |
| ["alphabet+korean"] | 영문자와 한글만 입력 가능(+로 구분하고 순서는 관계없음) |
| ["alphabet+integer+korean"] | 영문자, 숫자(정수), 한글만 입력 가능(+로 구분하고 순서는 관계없음) |
| ["integer+dash"] | 숫자(정수), 대시(-)만 입력 가능(+로 구분하고 순서는 관계없음) |
| ["integer+commas"] | 숫자(정수), 콤마(,)만 입력 가능(+로 구분하고 순서는 관계없음) |
| ["number"] | 숫자(정수), 콤마(,), 점(.)만 입력 가능 |
| ["decimal", length] | (유한)소수 점 length 번째 자리까지 입력 가능 |
| ["phone", isPartialDigits] | 전화번호 형식에 맞는지 검사. isPartialDigits 이 true 이면 전화번호 마지막 4자리중 1자리만 입력되어도 통과 됩니다. |
| ["email"] | e-mail 형식에 맞는지 검사 |
| ["url"] | URL 형식에 맞는지 검사 |
| ["zipcode"] | 우편번호 형식에 맞는지 검사 |
| ["rrn"] | 주민등록번호 형식과 일치하는지 검사 |
| ["ssn"] | 미국 사회보장번호 형식에 맞는지 검사 |
| ["frn"] | 외국인등록번호 형식과 일치하는지 검사 |
| ["frn_rrn"] | 외국인등록번호 또는 주민등록번호 형식과 일치하는지 검사 |
| ["kbrn"] | 사업자등록번호 형식과 일치하는지 검사 |
| ["kcn"] | 법인번호 형식과 일치하는지 검사 |
| ["date"] | 날짜 형식과 일치하는지 검사 |
| ["time"] | 시간 형식과 일치하는지 검사 |
| ["accept", "word"] | "word" 값만 입력 가능 |
| ["notAccept", "word"] | "word" 값만 입력 불가능 |
| ["match", "word"] | "word" 값이 포함된 값만 입력 가능 |
| ["notMatch", "word"] | "word"가 포함된 값은 입력 불가능 |
| ["acceptFileExt", "fileExtention"] | "fileExtention" 값이 포함된 확장자만 입력 가능 |
| ["notAcceptFileExt", "fileExtention"] | "fileExtention"가 포함된 확장자는 입력 불가능 |
| ["equalTo", "input"] | "input"의 값과 같아야 입력 가능 |
| ["maxlength", length] | length 이하의 글자 수만 입력 가능 |
| ["minlength", length] | length 이상의 글자 수만 입력 가능 |
| ["rangelength", startLength, endLength] | startLength 글자 수에서 endLength 글자 수까지만 입력 가능 |
| ["maxbyte", byteLength, defaultCharByteLength] | byteLength 바이트 이하만 입력 가능. defaultCharByteLength는 영문, 숫자, 기본 특수문자 등을 제외한 한글, 한글 특수 문자 등의 기본 바이트 길이입니다. 입력하지 않으면 Config(natural.config.js)의 N.context.attr("core").charByteLength 값이 적용됩니다. |
| ["minbyte", byteLength, defaultCharByteLength] | byteLength 바이트 이상만 입력 가능. defaultCharByteLength는 영문, 숫자, 기본 특수문자 등을 제외한 한글, 한글 특수 문자 등의 기본 바이트 길이입니다. 입력하지 않으면 Config(natural.config.js)의 N.context.attr("core").charByteLength 값이 적용됩니다. |
| ["rangebyte", startByteLength, endByteLength, defaultCharByteLength] | startByteLength 바이트에서 endByteLength 바이트 까지만 입력 가능. defaultCharByteLength는 영문, 숫자, 기본 특수문자 등을 제외한 한글, 한글 특수 문자 등의 기본 바이트 길이입니다. 입력하지 않으면 Config(natural.config.js)의 N.context.attr("core").charByteLength 값이 적용됩니다. |
| ["maxvalue", number] | "value" 이하의 값만 입력 가능 |
| ["minvalue", number] | "value" 이상의 값만 입력 가능 |
| ["rangevalue", startNumber, endNumber] | "startValue" 값에서 "endValue" 값 까지만 입력 가능 |
| ["regexp", "regexp string", "flag", "message"] | 입력한 "regexp string"의 조건으로 유효성 검증 후 검증에 실패하면 "message" 값을 툴팁으로 표시합니다. 정규식 평가는 \{regexp string}\{flag} 형태로 실행됩니다. "flag"가 없으면 빈 값으로 넣어주세요. "message"를 입력하지 않으면 기본 메시지("필드 검증에 통과하지 못했습니다.")가 표시됩니다. |

### 예제

#### 1. 입력 요소에 유효성 검증 규칙 선언하기

```html
<input id="col01" type="text" data-validate='[["required"]]'>
```

위와 같이 입력 요소에 선언하면, 포커스가 해당 요소에서 벗어날 때 유효성 검증이 실행되며, 유효성 검증에 실패할 경우 실패 원인을 입력 요소 옆에 툴팁으로 보여 줍니다.

#### 2. N.validator 라이브러리를 사용하여 유효성 검증하기

입력 요소에 data-validate='[["rangevalue", 1, 9]]' 와 같이 검증 규칙을 선언하면 프레임워크 내부에서는 "rangevalue" 다음의 1과 9를 [1, 9]와 같이 Array 형태로 변환하여 N.validator.rangevalue 함수의 인수로 실행합니다.

유효성 검증 규칙 함수를 명령으로 처리하는 방법은 다음과 같습니다.

```javascript
// N.validator.{rule}("String to validate", ...arguments);
N.validator.rangevalue("Validation string", [1, 9]); // false
```

#### 3. 요소에 바인딩된 Validator 관련 이벤트를 직접 실행하기

Validator는 룰 대신 입력 요소를 지정하면, 해당 입력 요소에 "validate" 이벤트를 생성합니다. 이 이벤트는 jQuery의 trigger 메서드를 통해 직접 실행할 수 있습니다.

```javascript
N("input[name='targetEle']").trigger("validate");
```

#### 4. 동적으로 유효성 검증 규칙을 변경하고 즉시 반영하기

```javascript
N("selector").data("validate", [["required"]]).trigger("validate");
```

## Natural-DATA 라이브러리

<a name="natural-data-라이브러리-개요"></a>
### 개요

Natural-DATA 라이브러리는 JSON 객체 배열 형태의 데이터를 정렬, 필터링, 가공하는 메소드와 기능을 제공합니다. 이 라이브러리를 통해 클라이언트 사이드에서 데이터를 효율적으로 조작할 수 있습니다.

<a name="natural-data-라이브러리-메소드"></a>
### 메소드

#### N.data.filter

지정된 조건에 일치하는 데이터를 추출합니다.

```javascript
var filteredData = N.data.filter(data, condition);
```

| 인자 | 타입 | 반환값 | 설명 |
|------|------|--------|------|
| data | json object array | N/A | 필터링할 데이터 |
| condition | function\|string | N/A | 필터링 조건을 지정합니다. |

조건을 지정하는 방법은 두 가지가 있습니다:

1. **함수를 인자로 지정하는 경우**:
   함수에서 true를 반환하는 행만 필터링됩니다.

   ```javascript
   var fData = N.data.filter([
       { name : "John", age : 18 },
       { name : "Mike", age : 16 },
       { name : "Mike", age : 14 }
   ], function(item) {
       return item.name === "Mike" && item.age === 16;
   });

   console.log(fData); // [{ name : "Mike", age : 16 }]
   ```

2. **문자열 조건을 인자로 지정하는 경우**:
   조건 문자열과 일치하는 행만 필터링됩니다.

   ```javascript
   var fData = N.data.filter([
       { name : "John", age : 18 },
       { name : "Mike", age : 16 },
       { name : "Mike", age : 14 }
   ], 'name === "Mike"');

   console.log(fData); // [{ name : "Mike", age : 16 }, { name : "Mike", age : 14 }]
   ```

**참고:**
- 함수로 조건을 처리하는 것이 문자열로 조건을 지정하는 것보다 빠릅니다.
- 문자열로 조건을 지정하는 방식은 AND(&&)와 OR(||) 표현식을 지원하지 않으며, 단일 조건식만 사용할 수 있습니다.

#### N.data.sort

지정된 "key" 인자 값을 기준으로 데이터를 정렬합니다.

```javascript
var sortedData = N.data.sort(data, key, reverse);
```

| 인자 | 타입 | 반환값 | 설명 |
|------|------|--------|------|
| data | json object array | json object array | 정렬할 데이터 |
| key | string | N/A | 정렬 기준이 될 객체의 속성명 |
| reverse | boolean | N/A | true로 설정하면 내림차순으로 정렬됩니다. |

#### N(data).datafilter

jQuery 플러그인 메소드로 N.data.filter 함수를 실행합니다.

```javascript
var filteredData = N(data).datafilter(condition);
```

N() 함수의 첫 번째 인자는 새로운 N.data.filter 생성자의 첫 번째 인자로 설정됩니다.

| 인자 | 타입 | 반환값 | 설명 |
|------|------|--------|------|
| condition | function\|string | jQuery object[json object] | N.data.filter의 condition 인자와 동일합니다. |

#### N(data).datasort

jQuery 플러그인 메소드로 N.data.sort 함수를 실행합니다.

```javascript
var sortedData = N(data).datasort(condition);
```

N() 함수의 첫 번째 인자는 새로운 N.data.sort 생성자의 첫 번째 인자로 설정됩니다.

| 인자 | 타입 | 반환값 | 설명 |
|------|------|--------|------|
| key | string | jQuery object[json object] | N.data.sort의 key 인자와 동일합니다. |
| reverse | boolean | N/A | N.data.sort의 reverse 인자와 동일합니다. |

<a name="natural-data-라이브러리-사용-예제"></a>
### 사용 예제

#### 1. 데이터 필터링 예제

```javascript
// 샘플 데이터
var users = [
    { id: 1, name: "John", age: 28, active: true },
    { id: 2, name: "Mike", age: 32, active: false },
    { id: 3, name: "Sarah", age: 25, active: true },
    { id: 4, name: "David", age: 35, active: true }
];

// 함수를 사용한 필터링
var activeUsers = N.data.filter(users, function(user) {
    return user.active === true && user.age < 30;
});
console.log(activeUsers); // [{ id: 1, name: "John", age: 28, active: true }, { id: 3, name: "Sarah", age: 25, active: true }]

// 문자열을 사용한 필터링
var userNamedMike = N.data.filter(users, 'name === "Mike"');
console.log(userNamedMike); // [{ id: 2, name: "Mike", age: 32, active: false }]

// jQuery 플러그인 메소드 사용
var activeUsersJQuery = N(users).datafilter(function(user) {
    return user.active === true;
});
console.log(activeUsersJQuery); // jQuery 객체 내에 [{ id: 1, name: "John", age: 28, active: true }, { id: 3, name: "Sarah", age: 25, active: true }, { id: 4, name: "David", age: 35, active: true }]
```

#### 2. 데이터 정렬 예제

```javascript
// 샘플 데이터
var products = [
    { id: 1, name: "Laptop", price: 1200 },
    { id: 2, name: "Phone", price: 800 },
    { id: 3, name: "Tablet", price: 500 },
    { id: 4, name: "Desktop", price: 1500 }
];

// 가격 오름차순 정렬
var sortedByPrice = N.data.sort(products, "price", false);
console.log(sortedByPrice); 
// [{ id: 3, name: "Tablet", price: 500 }, { id: 2, name: "Phone", price: 800 }, { id: 1, name: "Laptop", price: 1200 }, { id: 4, name: "Desktop", price: 1500 }]

// 이름 내림차순 정렬
var sortedByName = N.data.sort(products, "name", true);
console.log(sortedByName);
// [{ id: 3, name: "Tablet", price: 500 }, { id: 2, name: "Phone", price: 800 }, { id: 1, name: "Laptop", price: 1200 }, { id: 4, name: "Desktop", price: 1500 }]

// jQuery 플러그인 메소드 사용
var sortedByPriceJQuery = N(products).datasort("price", true); // 가격 내림차순
console.log(sortedByPriceJQuery); // jQuery 객체 내에 정렬된 제품 목록
```

<a name="natural-data-라이브러리-고급-활용"></a>
### 고급 활용

#### 필터링과 정렬 조합하기

데이터를 먼저 필터링한 후 정렬하여 원하는 데이터 세트를 얻을 수 있습니다.

```javascript
// 샘플 데이터
var items = [
    { category: "A", value: 10, available: true },
    { category: "B", value: 5, available: false },
    { category: "A", value: 8, available: true },
    { category: "C", value: 12, available: true },
    { category: "B", value: 15, available: true }
];

// 가용한 항목만 필터링한 후 value 기준으로 정렬
var filteredAndSorted = N.data.sort(
    N.data.filter(items, function(item) {
        return item.available === true;
    }),
    "value",
    true // 내림차순
);

console.log(filteredAndSorted);
// [
//   { category: "C", value: 12, available: true },
//   { category: "A", value: 10, available: true },
//   { category: "A", value: 8, available: true },
//   { category: "B", value: 15, available: true }
// ]
```

#### 복잡한 필터링 조건 적용하기

필터링 함수를 사용하여 복잡한 조건을 적용할 수 있습니다.

```javascript
// 샘플 데이터
var transactions = [
    { date: "2023-01-15", amount: 120, type: "income" },
    { date: "2023-01-20", amount: 80, type: "expense" },
    { date: "2023-02-05", amount: 200, type: "income" },
    { date: "2023-02-10", amount: 50, type: "expense" },
    { date: "2023-03-01", amount: 300, type: "income" }
];

// 2023년 2월의 수입 거래만 필터링
var februaryIncome = N.data.filter(transactions, function(transaction) {
    return transaction.date.startsWith("2023-02") && transaction.type === "income";
});

console.log(februaryIncome);
// [{ date: "2023-02-05", amount: 200, type: "income" }]
```

Natural-DATA 라이브러리는 클라이언트 측에서 JSON 데이터를 효율적으로 처리하기 위한 간단하면서도 강력한 도구를 제공합니다. 필터링과 정렬 기능을 통해 서버에서 전송된 데이터를 추가적인 서버 요청 없이 클라이언트 측에서 가공하고 표시할 수 있습니다.