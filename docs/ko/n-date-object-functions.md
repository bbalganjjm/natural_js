# N.date 객체의 함수

N.date은 날짜 제어 관련 유틸리티 함수들을 모아놓은 객체입니다.

"N.date.{함수명}(arg[0...N])"와 같이 사용할 수 있습니다.

## N.date.diff

**반환**: string

입력한 두 날짜 간 일수 차이를 반환합니다.

### 매개변수

#### refDateStr

**Type**: string

기준 날짜를 8자리 날짜 문자열(YYYYmmdd)로 입력합니다.

#### targetDateStr

**Type**: string

계산할 날짜를 8자리 날짜 문자열(YYYYmmdd)로 입력합니다.

## N.date.strToDateStrArr

**반환**: array

입력된 날짜 문자열과 입력된 날짜 서식을 기준으로 array 타입의 날짜 객체[년(number|string), 월(number|string), 일(number|string)]를 생성합니다.

### 매개변수

#### str

**Type**: string

날짜 문자열을 입력합니다.

#### format

**Type**: string

입력한 날짜 문자열의 서식(format)을 입력(필수입력)합니다.

- Y : 년
- m : 월
- d : 일
- 예) "19991231" : "Ymd"
- 예) "3112" : "dm"
- 예) "12311999" : "mdY"

#### isString

**Type**: boolean

true를 입력하면 결과 array 객체에 날짜를 number 타입이 아닌 string 타입으로 저장합니다.

## N.date.strToDate

**반환**: object

입력된 날짜/시간 문자열을 date 객체로 변환하고 객체의 속성에 저장하여 반환합니다. 반환되는 객체의 속성은 다음과 같습니다.

```javascript
{
    obj : date object,
    format : Date format string
}
```

### 매개변수

#### str

**Type**: string

날짜 + 시간 문자열을 입력합니다.

- "19991231" : "1999-12-31 00:00:00"
- "1999123103" : "1999-12-31 03:00:00"
- "199912310348" : "1999-12-31 03:48:00"
- "19991231034856" : "1999-12-31 03:48:56"

#### format

**Type**: string

입력한 날짜 문자열의 서식(format)을 입력(필수입력)합니다.

- Y : 년
- m : 월
- d : 일
- H : 시
- i : 분
- s : 초
- 예) "19991231" : "Ymd"
- 예) "3112" : "dm"
- 예) "12311999" : "mdY"
- 예) "19991231120159" : "YmdHis"

format 인수를 입력하지 않으면 입력한 날짜 문자열의 길이에 따라 다음과 같이 자동으로 설정됩니다.

- 4자리 : "Y"
- 6자리 : "Y-m"
- 8자리 : "Y-m-d"
- 10자리 : "Y-m-d H"
- 12자리 : "Y-m-d H:i"
- 14자리 : "Y-m-d H:i:s"

대시(-), 콜론(:) 등의 날짜와 시간을 구분하는 문자는 Config(natural.config.js)의 N.context.attr("data").formatter.date 오브젝트의 함수들로 정의되어 있습니다. 날짜/시간 구분 문자는 해당 함수의 return 문자열로 변경할 수 있습니다.

## N.date.format

**반환**: string

입력된 날짜 + 시간 문자열을 입력된 날짜 서식을 기준으로 서식화(format)합니다.

### 매개변수

#### str

**Type**: string

날짜 + 시간 문자열을 입력합니다.

#### format

**Type**: string

입력한 날짜 문자열의 서식(format)을 입력(필수입력)합니다.

- Y : 년
- m : 월
- d : 일
- H : 시
- i : 분
- s : 초

**예제**:
```javascript
N.date.format("19991231120159", "Y-m-d H:i:s") // "1999-12-31 12:01:59"
N.date.format("19991231120159", "Y/m/d H:i:s") // "1999/12/31 12:01:59"
N.date.format("19991231120159", "Y.m.d H:i") // "1999.12.31 12:01"
N.date.format("19991231120159", N.context.attr("data").formatter.date.YmdHis()) // "1999-12-31 12:01:59"
```

대시(-), 콜론(:) 등의 날짜와 시간을 구분하는 문자는 Config(natural.config.js)의 N.context.attr("data").formatter.date 오브젝트의 함수들로 정의되어 있습니다. 날짜/시간 구분 문자는 해당 함수의 return 문자열로 변경할 수 있습니다.

## N.date.dateToTs

**반환**: number

date 객체를 Timestamp로 변환합니다.

dateObj 인수를 입력하지 않으면 현재 날짜와 시간으로 변환합니다.

### 매개변수

#### dateObj

**Type**: date object

Timestamp로 변환할 date 객체를 입력합니다.

## N.date.tsToDate

**반환**: date object

Timestamp를 date 객체 변환합니다.

tsNum 인수를 입력하지 않으면 현재 날짜와 시간으로 변환합니다.

### 매개변수

#### tsNum

**Type**: number

date 객체로 변환할 Timestamp를 입력합니다.

## N.date.dateList

**반환**: array[array[date]]

연도 + 월별 날짜 객체 목록을 반환합니다.

### 매개변수

#### year

**Type**: number

기준 연도를 입력합니다.

#### month

**Type**: number

기준 월을 입력합니다.
