# N 객체의 함수

N 객체의 코어 및 유틸리티 함수입니다.

## N

**반환**: jQuery object

Natural-JS의 플러그인 타입으로 제공되는 라이브러리들과 N 객체의 멤버 변수나 함수가 정의되어있는 core 객체입니다.

N(selector)를 실행하면 jQuery의 init 메서드의 인수로 selector가 입력되어 Naturl-JS와 jQuery가 동시에 초기화됩니다.

```javascript
var divs = N("div");
```

### 매개변수

#### selector

**Type**: selector string|function|element|array[element]|jQuery object|object

jQuery selector와 같습니다. 자세한 내용은 [jQuery()](https://api.jquery.com/jQuery/) 함수의 selector 인수의 설명을 참고 바랍니다.

#### context

**Type**: selector string|jQuery object[element]

selector 인수에 selector 문자열을 입력했을 때 context 인수로 지정된 요소 안에 있는 요소만 선택합니다.

## N.version["package name"]

**반환**: string

Natural-JS의 패키지별 버전을 반환합니다.

- Natural-CORE의 패키지의 버전: N.version["Natural-CORE"]
- Natural-ARCHITECTURE의 패키지의 버전: N.version["Natural-ARCHITECTURE"]
- Natural-DATA의 패키지의 버전: N.version["Natural-DATA"]
- Natural-UI의 패키지의 버전: N.version["Natural-UI"]
- Natural-UI.Shell의 패키지의 버전: N.version["Natural-UI.Shell"]

## N.locale

**반환**: undefined

프레임웍에 설정된 로케일 값을 가져오거나 설정할 수 있습니다.

> 설정된 로케일 값에 따라서 프레임워크의 기본 메시지들이 다국어 처리됩니다.
>
> 미리 등록된 다국어 메시지 세트는 en_US, ko_KR이 있고 Config(natural.config.js)의 message 속성에서 수정할 수 있습니다.
>
> 프레임웍의 기본 로케일은 Config(natural.config.js)의 N.context.attr("core").locale 속성 값으로 설정할 수 있습니다.

### 매개변수

#### locale

**Type**: string

"en_US", "ko_KR" 등의 로케일 문자열

## N.debug

**반환**: undefined

브라우저 콘솔에 debug 메시지를 출력합니다.

> window.console.debug 함수와 같습니다. 브라우저에서 window.console.debug 함수를 지원하지 않으면 메시지가 출력되지 않습니다.

### 매개변수

#### msg

**Type**: string

메시지 텍스트.

## N.log

**반환**: undefined

브라우저 콘솔에 log 메시지를 출력합니다.

> window.console.log 함수와 같습니다. 브라우저에서 window.console.log 함수를 지원하지 않으면 메시지가 출력되지 않습니다.

### 매개변수

#### msg

**Type**: string

메시지 텍스트.

## N.info

**반환**: undefined

브라우저 콘솔에 info 메시지를 출력합니다.

> window.console.info 함수와 같습니다. 브라우저에서 window.console.info 함수를 지원하지 않으면 메시지가 출력되지 않습니다.

### 매개변수

#### msg

**Type**: string

메시지 텍스트.

## N.warn

**반환**: undefined

브라우저 콘솔에 warn 메시지를 출력합니다.

> window.console.warn 함수와 같습니다. 브라우저에서 window.console.warn 함수를 지원하지 않으면 메시지가 출력되지 않습니다.

### 매개변수

#### msg

**Type**: string

메시지 텍스트.

## N.error

**반환**: ErrorThrown

에러를 발생시키고 에러 메시지를 브라우저 콘솔에 출력합니다.

> N.error 함수는 ErrorThrown 객체를 반환하기 때문에 오류를 발생 시키려면 N.error 함수 앞에 throw 구문을 선언해야 합니다.

```javascript
throw N.error("에러가 발생했습니다.");
```

### 매개변수

#### msg

**Type**: string

에러 메시지 텍스트.

#### e

**Type**: ErrorThrown

ErrorThrown 객체가 지정된 경우 지정된 객체를 사용하여 오류를 발생 시킵니다.

## N.type

**반환**: string

지정한 객체의 타입("number", "string", "array", "object", "function", "date")을 반환합니다.

### 매개변수

#### obj

**Type**: anything

타입을 확인할 객체.

## N.isString

**반환**: boolean

입력한 객체가 string 타입인지 검사합니다.

### 매개변수

#### obj

**Type**: anything

타입을 확인할 객체.

## N.isNumeric

**반환**: boolean

입력한 객체가 숫자 타입인지 검사합니다.

> N.isNumeric 은 jQuery.isNumeric 함수를 그대로 사용합니다.

### 매개변수

#### obj

**Type**: anything

타입을 확인할 객체.

## N.isPlainObject

**반환**: boolean

입력한 객체가 순수한 객체 타입인지 검사합니다.

> typeof N() 나 N.type(N())을 실행하면 "object"로 반환되지만 N.isPlainObject 이러한 오브젝트를 순수한 오브젝트로 평가하지 않습니다. new Object() 나 객체 리터럴({})로 생성한 오브젝트만 true가 반환됩니다.
>
> N.isPlainObject 은 jQuery.isPlainObject 함수를 그대로 사용합니다.

### 매개변수

#### obj

**Type**: anything

타입을 확인할 객체.

## N.isEmptyObject

**반환**: boolean

입력한 객체가 비어 있는 객체인지 검사합니다.

> "" 나 {}, []는 모두 비어 있는 객체에서 true를 반환 하지만 [{}]는 객체 안에 다른 빈 객체가 있으므로 false가 반환됩니다.

### 매개변수

#### obj

**Type**: anything

타입을 확인할 객체.

## N.isArray

**반환**: boolean

입력한 객체가 array 타입인지 검사합니다.

> N.isArray 은 Array.isArray 함수를 그대로 사용합니다.

### 매개변수

#### obj

**Type**: anything

타입을 확인할 객체.

## N.isArraylike

**반환**: boolean

입력한 객체가 array와 비슷한 타입인지 검사합니다.

> jQuery object 도 겉 보기에는 array와 유사하여 true를 반환합니다. array, jQuery object를 둘 다 같은 오브젝트로 평가하고 싶을 때 사용하세요.

### 매개변수

#### obj

**Type**: anything

타입을 확인할 객체.

## N.isWrappedSet

**반환**: boolean

입력한 객체가 N()이나 $(), jQuery()로 초기화 한 jQuery object 타입인지 검사합니다.

### 매개변수

#### obj

**Type**: anything

타입을 확인할 객체.

## N.isElement

**반환**: boolean

N()이나 $(), jQuery()의 인수로 지정된 객체가 HTML 요소인지 검사합니다.

### 매개변수

#### obj

**Type**: jQuery object

유형을 확인할 jQuery object.

## N.toSelector

**반환**: boolean

N() 함수의 인수로 입력 된 객체의 selector 를 추출 합니다.

### 매개변수

#### obj

**Type**: jQuery object|object

selector 를 추출 할 jQuery object 나 object.

## N.serialExecute

**반환**: [jQuery Deferred Objects]

비동기 실행 로직의 계층적 콜백들을 jQuery.Deferred를 사용하여 직렬로 표기할 수 있게 해 주는 함수입니다.

- 비동기로 작동하는 로직과 그 로직의 전처리, 후처리 로직을 하나의 함수 블록으로 만들어서 N.serialExecute 함수의 인수로 입력하면 됩니다.
- 입력된 인수의 순서대로 함수들이 실행됩니다. 다음 인수로 정의한 함수 블록을 실행하기 위해서는 비동기 로직이 끝나는 시점 또는 다음 함수가 실행되어야 하는 시점에 defer(Deferred) 인수의 resolve 메서드를 실행해야 합니다.
- defer.resolve 메서드의 인수들은 그다음 실행될 함수 블록의 두 번째 인수부터 순서대로 지정됩니다.
- 각 함수 블록의 this와 return 객체는 인수로 입력된 함수 블록들의 Deferred 객체들이 담겨 있는 array 객체입니다.
- 이 this를 이용해서 첫 번째 함수 블록의 비동기 로직의 완료 시점에 this[3].resolve()와 같이 실행하면 두 번째, 세 번째 함수 블록을 건너뛰고 네 번째 함수 블록을 실행시킬 수 있습니다.
  
  > 비동기 로직의 시작 시점에는 아직 다음 함수 블록의 Deferred 객체가 생성되지 않았기 때문에 해당 함수 블록 앞에 정의된 함수 블록들은 참조 가능하나 이후에 정의된 함수 블록은 참조가 불가능합니다.

### 예제

다음과 같은 일반적인 비동기 실행 로직이 있습니다.

```javascript
setTimeout(function() {
    setTimeout(function() {
        setTimeout(function() {
            setTimeout(function() {
                N.log("4번 로직 완료");
            }, 500);
            N.log("3번 로직 완료");
        }, 500);
        N.log("2번 로직 완료");
    }, 500);
    N.log("1번 로직 완료");
}, 500);
```

N.serialExecute를 사용하면 위와 같은 계층적 비동기 로직을 아래와 같이 직렬로 선언할 수 있습니다.

```javascript
var defers = N.serialExecute(
    function(defer){
        setTimeout(function() {
            defer.resolve("0", "1");
            N.log("1번 로직 완료");
        }, 500);
    },
    function(defer, arg0, arg1){
        setTimeout(function() {
            defer.resolve(arg0, arg1);
            N.log("2번 로직 완료", arg0, arg1);
        }, 500);
    },
    function(defer, arg0, arg1){
        setTimeout(function() {
            defer.resolve(arg0, arg1);
            N.log("3번 로직 완료", arg0, arg1);
        }, 500);
    },
    function(defer, arg0){
        setTimeout(function() {
            defer.resolve();
            N.log("4번 로직 완료", arg0);
        }, 500);
    }
);
```

추가로, jQuery $.when을 사용하면 위 소스코드에서 반환된 defers 변수 객체로 함수 블록들을 그룹 지어 해당 그룹의 함수 블록들이 모두 완료된 후 로직을 실행시킬 수도 있습니다.

```javascript
// 두 번째, 세 번째 함수 블록이 모두 완료되면 로직을 실행
$.when(defers[1], defers[2]).done(function(arguments[0], arguments[1]) {
    // arguments[0], arguments[1] 은 각 함수 블록에서 defer.resolve 함수를 실행할 때 인수로 지정한 오브젝트들입니다.
    N.log("2번, 3번 로직 모두 완료.");
});

// 전체 함수 블록들이 모두 완료되면 로직을 실행
$.when.apply($, defers).done(function(arguments[0], arguments[1], arguments[2], arguments[3]) {
    // arguments[0], arguments[1], arguments[2], arguments[3] 은 각 함수 블록에서 defer.resolve 함수를 호출할 때 인수로 지정한 오브젝트들입니다.
    N.log("1번, 2번, 3번, 4번 전체 로직 완료.");
});
```
