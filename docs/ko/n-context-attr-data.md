# N.context.attr("data") - Natural-DATA 환경설정

| 이름 | 기본값 | 필수 | 설명 |
|------|---------|----------|-------------|
| formatter.userRules | - | X | 사용자 정의 포맷 룰. 함수 명이 룰 명이 됨. `str`: 포맷 대상 문자열, `args`: 포맷 옵션. 함수는 포맷된 문자열을 반환해야 합니다. 예시:<br>```javascript<br>"userRules" : {<br>    "userRule" : function(str, args) {<br>        return str;<br>    }<br>}<br>``` |
| formatter.date | - | X | 응용 프로그램에 전체적으로 사용될 날짜 형식을 지정합니다. 날짜/시간 포맷: Y: 년, m: 월, d: 일, H: 시, i: 분, s: 초 |
| formatter.date.dateSepa | - | O | 년, 월, 일 구분 문자 |
| formatter.date.timeSepa | : | O | 시, 분, 초 구분 문자 |
| formatter.date.Ym | `function() { return "Y" + this.dateSepa + "m"; }` | O | 년, 월 포맷 함수, return 구문에서 포맷을 지정합니다. |
| formatter.date.Ymd | `function() { return "Y" + this.dateSepa + "m" + this.dateSepa + "d"; }` | O | 년, 월, 일 Format 함수, return 구문에서 포맷을 지정합니다. |
| formatter.date.YmdH | `function() { return this.Ymd() + " H"; }` | O | 년, 월, 일, 시 Format 함수, return 구문에서 포맷을 지정합니다. |
| formatter.date.YmdHi | `function() { return this.Ymd() + " H" + this.timeSepa + "i"; }` | O | 년, 월, 일, 시, 분 Format 함수, return 구문에서 포맷을 지정합니다. |
| formatter.date.YmdHis | `function() { return this.Ymd() + " H" + this.timeSepa + "i" + this.timeSepa + "s"; }` | O | 시, 분, 초 Format 함수, return 구문에서 포맷을 지정합니다. |
| validator.userRules | - | X | 사용자 정의 유효성 검증 룰. 함수 명이 룰 명이 됨. 검증 실패 메시지는 아래 N.context.attr("data").validator.message 객체에 언어별로 함수명과 같은 프로퍼티명으로 정의. `str`: 유효성 검증 대상 문자열, `args`: 유효성 검증 옵션. 함수는 유효성 검증에 성공하면 true를, 실패하면 false를 반환해야 합니다. 예시:<br>```javascript<br>"userRules" : {<br>    "userRule" : function(str, args) {<br>        return true;<br>    }<br>}<br>``` |
| validator.message | `{ "ko_KR" : { ... }, "en_US" : { ... } }` | O | 유효성 검증 오류 다국어 메시지. 언어를 추가하려면 언어 세트를 복사하고 언어 세트 오브젝트 프로퍼티 명을 해당 로케일 문자열로 지정하고 메시지를 정의합니다. |
