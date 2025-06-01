# Validator 검증 룰 목록

Validator 컴포넌트는 데이터가 특정 기준을 충족하는지 확인하기 위한 다양한 유효성 검증 룰을 제공합니다. 룰 명은 대문자와 소문자를 다르게 인식하지 않습니다.

## ["required"]

**반환**: boolean

필수입력. 값이 입력되었는지 검증합니다.

## ["alphabet"]

**반환**: boolean

영문자만 입력 가능합니다.

## ["integer"]

**반환**: boolean

숫자(정수)만 입력 가능합니다.

## ["korean"]

**반환**: boolean

한글만 입력 가능합니다.

## ["alphabet+integer"]

**반환**: boolean

영문자와 숫자(정수)만 입력 가능합니다(+로 구분하고 순서는 관계없음).

## ["integer+korean"]

**반환**: boolean

숫자(정수)와 한글만 입력 가능합니다(+로 구분하고 순서는 관계없음).

## ["alphabet+korean"]

**반환**: boolean

영문자와 한글만 입력 가능합니다(+로 구분하고 순서는 관계없음).

## ["alphabet+integer+korean"]

**반환**: boolean

영문자, 숫자(정수), 한글만 입력 가능합니다(+로 구분하고 순서는 관계없음).

## ["integer+dash"]

**반환**: boolean

숫자(정수), 대시(-)만 입력 가능합니다(+로 구분하고 순서는 관계없음).

## ["integer+commas"]

**반환**: boolean

숫자(정수), 콤마(,)만 입력 가능합니다(+로 구분하고 순서는 관계없음).

## ["number"]

**반환**: boolean

숫자(정수), 콤마(,), 점(.)만 입력 가능합니다.

## ["decimal", length]

**반환**: boolean

(유한)소수 점 length 번째 자리까지 입력 가능합니다.

## ["phone", isPartialDigits]

**반환**: boolean

전화번호 형식에 맞는지 검사합니다.

isPartialDigits 이 true 이면 전화번호 마지막 4자리중 1자리만 입력되어도 통과 됩니다.

## ["email"]

**반환**: boolean

e-mail 형식에 맞는지 검사합니다.

## ["url"]

**반환**: boolean

URL 형식에 맞는지 검사합니다.

## ["zipcode"]

**반환**: boolean

우편번호 형식에 맞는지 검사합니다.

## ["rrn"]

**반환**: boolean

주민등록번호 형식과 일치하는지 검사합니다.

## ["ssn"]

**반환**: boolean

미국 사회보장번호 형식에 맞는지 검사합니다.

## ["frn"]

**반환**: boolean

외국인등록번호 형식과 일치하는지 검사합니다.

## ["frn_rrn"]

**반환**: boolean

외국인등록번호 또는 주민등록번호 형식과 일치하는지 검사합니다.

## ["kbrn"]

**반환**: boolean

사업자등록번호 형식과 일치하는지 검사합니다.

## ["kcn"]

**반환**: boolean

법인번호 형식과 일치하는지 검사합니다.

## ["date"]

**반환**: boolean

날짜 형식과 일치하는지 검사합니다.

## ["time"]

**반환**: boolean

시간 형식과 일치하는지 검사합니다.

## ["accept", "word"]

**반환**: boolean

"word" 값만 입력 가능합니다.

## ["notAccept", "word"]

**반환**: boolean

"word" 값만 입력 불가능합니다.

## ["match", "word"]

**반환**: boolean

"word" 값이 포함된 값만 입력 가능합니다.

## ["notMatch", "word"]

**반환**: boolean

"word"가 포함된 값은 입력 불가능합니다.

## ["acceptFileExt", "fileExtention"]

**반환**: boolean

"fileExtention" 값이 포함된 확장자만 입력 가능합니다.

## ["notAcceptFileExt", "fileExtention"]

**반환**: boolean

"fileExtention"가 포함된 확장자는 입력 불가능합니다.

## ["equalTo", "input"]

**반환**: boolean

"input"의 값과 같아야 입력 가능합니다.

## ["maxlength", length]

**반환**: boolean

length 이하의 글자 수만 입력 가능합니다.

## ["minlength", length]

**반환**: boolean

length 이상의 글자 수만 입력 가능합니다.

## ["rangelength", startLength, endLength]

**반환**: boolean

startLength 글자 수에서 endLength 글자 수까지만 입력 가능합니다.

## ["maxbyte", byteLength, defaultCharByteLength]

**반환**: boolean

byteLength 바이트 이하만 입력 가능합니다.

defaultCharByteLength는 영문, 숫자, 기본 특수문자 등을 제외한 한글, 한글 특수 문자 등의 기본 바이트 길이입니다. 입력하지 않으면 Config(natural.config.js)의 N.context.attr("core").charByteLength 값이 적용됩니다.

## ["minbyte", byteLength, defaultCharByteLength]

**반환**: boolean

byteLength 바이트 이상만 입력 가능합니다.

defaultCharByteLength는 영문, 숫자, 기본 특수문자 등을 제외한 한글, 한글 특수 문자 등의 기본 바이트 길이입니다. 입력하지 않으면 Config(natural.config.js)의 N.context.attr("core").charByteLength 값이 적용됩니다.

## ["rangebyte", startByteLength, endByteLength, defaultCharByteLength]

**반환**: boolean

startByteLength 바이트에서 endByteLength 바이트 까지만 입력 가능합니다.

defaultCharByteLength는 영문, 숫자, 기본 특수문자 등을 제외한 한글, 한글 특수 문자 등의 기본 바이트 길이입니다. 입력하지 않으면 Config(natural.config.js)의 N.context.attr("core").charByteLength 값이 적용됩니다.

## ["maxvalue", number]

**반환**: boolean

"value" 이하의 값만 입력 가능합니다.

## ["minvalue", number]

**반환**: boolean

"value" 이상의 값만 입력 가능합니다.

## ["rangevalue", startNumber, endNumber]

**반환**: boolean

"startValue" 값에서 "endValue" 값 까지만 입력 가능합니다.

## ["regexp", "regexp string", "flag", "message"]

**반환**: boolean

입력한 "regexp string"의 조건으로 유효성 검증 후 검증에 실패하면 "message" 값을 툴팁으로 표시합니다.

정규식 평가는 다음과 같이 실행됩니다:
```
\{regexp string}\{flag}
```

"flag"가 없으면 빈 값으로 넣어주세요.

"message"를 입력하지 않으면 기본 메시지("필드 검증에 통과하지 못했습니다.")가 표시됩니다.
