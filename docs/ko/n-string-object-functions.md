# N.string 객체의 함수

N.string 은 문자열 관련 유틸리티 함수들을 모아놓은 객체입니다.

"N.string.{함수명}(arg[0...N])"와 같이 사용할 수 있습니다.

## N.string.contains

**반환**: boolean

입력한 문자열이 포함되어 있으면 true를 반환합니다.

### 매개변수

#### context

**Type**: string

검사 될 대상 문자열을 입력합니다.

#### str

**Type**: string

검사할 문자열을 입력합니다.

## N.string.endsWith

**반환**: boolean

입력한 문자열로 끝나면 true를 반환합니다.

### 매개변수

#### context

**Type**: string

검사 될 대상 문자열을 입력합니다.

#### str

**Type**: string

검사할 문자열을 입력합니다.

## N.string.startsWith

**반환**: boolean

입력한 문자열로 시작하면 true를 반환합니다.

### 매개변수

#### context

**Type**: string

검사 될 대상 문자열을 입력합니다.

#### str

**Type**: string

검사할 문자열을 입력합니다.

## N.string.insertAt

**반환**: string

문자열의 원하는 위치에 입력한 문자열을 삽입합니다.

### 매개변수

#### context

**Type**: string

삽입될 대상 문자열을 입력합니다.

#### idx

**Type**: number

문자열을 삽입할 위치(index)를 입력합니다.

#### str

**Type**: string

삽입할 문자열을 입력합니다.

## N.string.removeWhitespace

**반환**: string

문자열에서 모든 공백을 제거합니다.

### 매개변수

#### str

**Type**: string

공백을 제거할 대상 문자열을 입력합니다.

## N.string.lpad

**반환**: string

입력한 길이만큼 입력한 문자로 왼쪽부터 채워줍니다.

### 매개변수

#### context

**Type**: string

대상 문자열을 입력합니다.

#### length

**Type**: number

채울 길이를 입력합니다.

#### str

**Type**: string

채울 문자를 입력합니다.

## N.string.rpad

**반환**: string

입력한 길이만큼 입력한 문자로 오른쪽부터 채워줍니다.

### 매개변수

#### context

**Type**: string

대상 문자열을 입력합니다.

#### length

**Type**: number

채울 길이를 입력합니다.

#### str

**Type**: string

채울 문자를 입력합니다.

## N.string.byteLength

**반환**: string

입력한 문자열의 byte 길이를 반환합니다.

> 정확한 byte의 길이는 아니고 DBMS에서 처리되는 한글이나 한자 등의 byte 길이를 3byte(UTF-8)로 계산하고 영문자, 숫자 등은 1 바이트로 계산한 결과입니다.
>
> 한글이나 한자 등의 byte 길이가 3byte가 아닌 경우 Config(natural.config.js)의 N.context.attr("core").charByteLength 속성 값을 변경하면 됩니다.

### 매개변수

#### str

**Type**: string

길이를 검사할 문자열을 입력합니다.

## N.string.isEmpty

**반환**: string

null, undefined 또는 비어 있는 문자열("")인지 검사합니다.

### 매개변수

#### str

**Type**: string

검사할 문자열을 입력합니다.

## N.string.trim

**반환**: string

문자열이 입력되면 입력한 문자열의 앞 뒤 공백을 제거하고 null이나 undefined가 입력되면 비어있는 문자열("")을 반환합니다.

> N.string.trim 은 String.prototype.trim 메서드를 그대로 사용합니다.

### 매개변수

#### str

**Type**: string|null|undefined

공백을 제거할 대상 문자열을 입력합니다.

## N.string.trimToEmpty

**반환**: string

문자열이 입력되면 입력한 문자열의 앞 뒤 공백을 제거하고 null이나 undefined가 입력되면 비어있는 문자열("")을 반환합니다.

> N.string.trim 은 String.prototype.trim 메서드를 그대로 사용합니다.

### 매개변수

#### str

**Type**: string|null|undefined

공백을 제거할 대상 문자열을 입력합니다.

## N.string.trimToNull

**반환**: string|null

문자열이 입력되면 입력한 문자열의 앞 뒤 공백을 제거하고 null이나 undefined가 입력되면 null을 반환합니다.

### 매개변수

#### str

**Type**: string|null|undefined

공백을 제거할 대상 문자열을 입력합니다.

## N.string.trimToUndefined

**반환**: string|undefined

문자열이 입력되면 입력한 문자열의 앞 뒤 공백을 제거하고 null이나 undefined가 입력되면 undefined를 반환합니다.

### 매개변수

#### str

**Type**: string|null|undefined

공백을 제거할 대상 문자열을 입력합니다.

## N.string.trimToZero

**반환**: string

문자열이 입력되면 입력한 문자열의 앞 뒤 공백을 제거하고 null이나 undefined가 입력되면 "0" 문자를 반환합니다.

### 매개변수

#### str

**Type**: string|null|undefined

공백을 제거할 대상 문자열을 입력합니다.

## N.string.trimToVal

**반환**: string

문자열이 입력되면 입력한 문자열의 앞 뒤 공백을 제거하고 null이나 undefined가 입력되면 val(arguments[1]) 인수 값을 반환합니다.

### 매개변수

#### str

**Type**: string|null|undefined

공백을 제거할 대상 문자열을 입력합니다.

#### val

**Type**: string

반환될 문자열을 입력합니다.
