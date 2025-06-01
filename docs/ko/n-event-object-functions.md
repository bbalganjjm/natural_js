# N.event 객체의 함수

N.event은 event 관련 유틸리티 함수들을 모아놓은 객체입니다.

"N.event.{함수명}(arg[0...N])"와 같이 사용할 수 있습니다.

## N.event.isNumberRelatedKeys

**반환**: boolean

눌러진 키가 숫자와 관련된 키이면 true를 반환합니다.

숫자키와 관련된 키 목록은 다음과 같습니다:

- 97 : a Ctrl + a Select All
- 65 : A Ctrl + A Select All
- 99 : c Ctrl + c Copy
- 67 : C Ctrl + C Copy
- 118 : v Ctrl + v paste
- 86 : V Ctrl + V paste
- 115 : s Ctrl + s save
- 83 : S Ctrl + S save
- 112 : p Ctrl + p print
- 80 : P Ctrl + P print
- 8 : backspace
- 9 : tab
- 27 : escape
- 13 : enter
- 35 : Home & shiftKey + #
- 36 : End & shiftKey + $
- 37 : left arrow & shiftKey + %
- 39 : right arrow & '
- 46 : delete & .
- 45 : Ins & -

**예제**:
```javascript
$("input").on("keydown", function(e) {
    if(N.event.isNumberRelatedKeys(e)) {
        // TODO
    }
});
```

Datepicker(N.datepicker)에서 숫자와 관련 키 입력을 차단하기 위해 사용합니다.

### 매개변수

#### e

**Type**: Event

Key Event 객체를 입력합니다.

## N.event.disable

**반환**: boolean

지정한 요소에 바인딩되어 있는 이벤트들의 실행을 차단할 수 있는 이벤트 핸들러입니다. N().tpBind 메서드를 사용해서 요소 이벤트의 제일 앞단에 N.event.disable 이벤트 핸들러를 바인딩합니다.

**예제**:
```javascript
// 클릭 방지
$("selector").tpBind("click", N.event.disable);
// 클릭 방지 해제
$("selector").off("click", N.event.disable);
```

### 매개변수

#### e

**Type**: Event

이벤트 핸들러의 Event 객체 인수를 입력합니다.
