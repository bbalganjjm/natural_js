# Natural-JS Core 레퍼런스 가이드

## 목차
- [N() & N](#n--n)
  - [개요](#개요)
  - [jQuery selector 확장](#jquery-selector-확장)
  - [jQuery plugin 확장 메서드](#jquery-plugin-확장-메서드)
- [N 객체의 함수](#n-객체의-함수)
- [N.gc 객체의 함수](#ngc-객체의-함수)
- [N.string 객체의 함수](#nstring-객체의-함수)
- [N.element 객체의 함수](#nelement-객체의-함수)
- [N.date 객체의 함수](#ndate-객체의-함수)
- [N.browser 객체의 함수](#nbrowser-객체의-함수)
- [N.message 객체의 함수](#nmessage-객체의-함수)
- [N.array 객체의 함수](#narray-객체의-함수)
- [N.json 객체의 함수](#njson-객체의-함수)
- [N.event 객체의 함수](#nevent-객체의-함수)

## N() & N

### 개요

N()은 Natural-JS 코어 메서드입니다. 전달된 인수를 기반으로 DOM에서 요소를 찾거나 HTML 문자열을 전달하여 생성된 일치하는 요소의 컬렉션을 반환합니다.

N은 Natural-JS의 공통 함수가 정의되어 있는 코어 클래스입니다.

> N()은 jQuery() 함수를 확장한 객체입니다. 때문에 $() 나 jQuery()로 대체하여 사용 가능합니다. 그러나 N 오브젝트의 로컬 함수들은 jQuery 나 $ 오브젝트에서 사용이 불 가능합니다.

### jQuery selector 확장

Natural-CORE에는 CSS1~3에서 지원되지 않는 형태의 패턴 검색을 위해 요소의 속성 값을 정규 표현식으로 평가할 수 있는 regexp 필터 셀렉터가 확장되어 있습니다. 이를 통해 보다 복잡한 형태의 요소 검색을 지원합니다.

#### [selector] :regexp(attributeName[:propertyName], expr)

**Return**: jQuery Object

- **selector**
  - **Type**: string
  - 기본 selector 문자열입니다.
  - 생략할 경우 모든 요소에 대해 평가가 이뤄지기 때문에 가능하면 기본 selector를 지정하는 것이 좋습니다.

- **attributeName**
  - **Type**: string
  - 평가하려는 값을 갖고 있는 HTML DOM 요소의 속성 명입니다.
  - 아래에 나열된 속성을 제외한 모든 속성 값은 `.attr(attributeName)` 함수의 반환 값으로 평가됩니다.
    - **data**: 요소의 data속성을 추출합니다. 반드시 propertyName으로 하위 속성을 지정해야 합니다. `.data(properyName)` 함수의 반환 값과 같습니다.
    - **css**: 요소의 css 속성을 추출합니다. 반드시 propertyName으로 하위 속성을 지정해야 합니다. `.css(propertyName)` 함수의 반환 값과 같습니다.
    - **class**: 요소의 class 속성을 추출합니다. class 속성 값이 둘 이상인 요소의 경우 각 클래스에 대해 평가가 수행됩니다.

- **propertyName**
  - **Type**: string
  - attributeName이 data 혹은 css인 경우 하위 속성을 의미합니다.
  - 이외의 경우 값을 지정해도 무시됩니다.

- **expr**
  - **Type**: string
  - 정규 표현식 문자열입니다. 큰따옴표나 작은따옴표로 감싸지 않아야 합니다.

**올바른 사용 예**:
```javascript
/* href 속성에 "Mr.Lee" 혹은 "Mr.Kim"을 포함하는 모든 a 태그 추출 */
N("a:regexp(href, 'Mr\\.(Lee|Kim)')"); // (X)
N('a:regexp(href, "Mr\\.(Lee|Kim)")'); // (X)
N("a:regexp(href, Mr\\.(Lee|Kim))"); // (O)
```

#### :regexp 필터 속성 및 예제

1. **다중 class 속성 값을 가진 요소 필터링**
```html
<div class="someClassA classB"></div>
```
```javascript
N("div:regexp(class, ^someClass)")
```

```html
<div class="searchBtn"></div>
<div class="searchBtn"></div>
<div class="searchButton"></div>
```
```javascript
N("div:regexp(class, Btn$|Button$)")
```

2. **data속성의 프로퍼티 명으로 필터링**
```html
<div data-sample="test-1"></div>
<div data-sample="test-2"></div>
```
```javascript
N("div:regexp(data:sample, test-[1-2])")
```

3. **css 속성의 프로퍼티 명으로 필터링**
```html
<div style="width:128px;"></div>
```
```javascript
N("div:regexp(css:width, ^128px)")
```

4. **id 속성 값으로 필터링**
```html
<div id="page-1"><div id="page-2"><div id="page-3">
```
```javascript
N("div:regexp(id, page-[0-9])")
```

### jQuery plugin 확장 메서드

Natural-JS에서는 jQuery plugin 형태로 제공되는 CORE 유틸리티 함수들이 있습니다. 다음은 주요 함수들에 대한 설명입니다.

#### N("selector").instance()

**Return**: object

UI 컴포넌트의 context 요소나 View 요소에서 컴포넌트 객체의 인스턴스 또는 Controller object를 반환하거나 객체 인스턴스를 요소에 저장합니다.

Natural-JS는 탭이나 팝업 등의 블록 콘텐츠를 쉽게 제어하기 위해서 컴포넌트나 라이브러리 초기화 시 지정한 템플릿(context 나 view) 요소에 생성된 객체 인스턴스를 저장합니다.

다음과 같이 인수의 개수와 타입에 따라서 다르게 작동됩니다:

1. **인수 없음**: 선택한 요소에 저장되어 있는 모든 인스턴스를 반환
   ```javascript
   var all = N(".grid01", ".grid02").instance();
   ```
   반환된 인스턴스가 1이면 원래 인스턴스 객체가 반환됩니다. 인스턴스가 두 개 이상인 경우 배열에 저장되어 반환됩니다. 반환된 인스턴스가 없으면 undefined가 반환됩니다.

2. **함수 인수**: 선택한 요소에 저장되어 있는 모든 인스턴스를 콜백의 함수의 인수로 지정
   ```javascript
   var all = N(".grid01", ".grid02").instance(function(instanceId, instance) {
       // this : instance
       // instanceId : 저장된 인스턴스의 식별자
       // instance : 저장된 인스턴스
   });
   ```
   인스턴스의 개수만큼 콜백 함수가 실행됩니다.

3. **문자열 인수**: 선택한 요소에 instanceId가 "name"으로 저장되어 있는 모든 인스턴스를 반환
   ```javascript
   var all = N(".grid01", ".grid02").instance("name");
   ```
   반환된 인스턴스가 1이면 원래 인스턴스 객체가 반환됩니다. 인스턴스가 두 개 이상인 경우 배열에 저장되어 반환됩니다. 반환된 인스턴스가 없으면 undefined가 반환됩니다.

4. **문자열과 함수 인수**: 선택한 요소에 instanceId가 "name"으로 저장되어 있는 모든 인스턴스를 콜백 함수의 인수로 반환
   ```javascript
   var all = N(".grid01", ".grid02").instance("name", function(instanceId, instance) {
       // this : instance
       // instanceId : 저장된 인스턴스의 식별자
       // instance : 저장된 인스턴스
   });
   ```
   인스턴스의 개수만큼 콜백 함수가 실행됩니다.

5. **문자열과 객체 인수**: 선택한 요소에 instance를 "name"으로 저장
   ```javascript
   N(".grid01").instance("name", instance);
   ```
   인스턴스 저장 시 instance 인수가 function 타입이면 정상작동하지 않을 수 있습니다. function 타입을 제외한 object나 string과 같은 타입을 instance 인수로 지정해야 합니다.

##### 인스턴스 저장 위치

미리 정의되어 있는 인스턴스 명은 다음과 같습니다:

| 컴포넌트 | 인스턴스 명 | 저장 위치 |
|---------|-----------|----------|
| N.cont | cont | - |
| N.alert | alert | .block_overlay_msg__ 요소에 저장되어 있음 |
| N.button | button | - |
| N.datepicker | datepicker | - |
| N.popup | popup | 로드된 팝업 콘텐츠의 Controller object는 .block_overlay_msg__ > .msg_box__ > .view_context__ 요소에 저장됨 |
| N.tab | tab | 로드된 탭 콘텐츠의 Controller object는 .tab__ > .{tab 콘텐츠 요소 id} > .view_context__ 요소에 저장됨 |
| N.select | select | - |
| N.form | form | - |
| N.list | list | - |
| N.grid | grid | - |
| N.pagination | pagination | - |
| N.tree | tree | - |
| N.notify | notify | - |
| N.docs | docs | - |

인스턴스의 저장 위치가 별도로 명시되어 있지 않은 컴포넌트는 context 옵션으로 지정한 요소에 저장됩니다.

## N 객체의 함수

N 객체의 코어 및 유틸리티 함수입니다.

#### N([selector[, context]])

**Return**: jQuery object

Natural-JS의 플러그인 타입으로 제공되는 라이브러리들과 N 객체의 멤버 변수나 함수가 정의되어있는 core 객체입니다.

N(selector)를 실행하면 jQuery의 init 메서드의 인수로 selector가 입력되어 Naturl-JS와 jQuery가 동시에 초기화됩니다.

```javascript
var divs = N("div");
```

- **selector**: selector string|function|element|array[element]|jQuery object|object - jQuery selector와 같습니다. 자세한 내용은 jQuery() 함수의 selector 인수의 설명을 참고 바랍니다.
- **context**: selector string|jQuery object[element] - selector 인수에 selector 문자열을 입력했을 때 context 인수로 지정된 요소 안에 있는 요소만 선택합니다.

#### N.version["package name"]

**Return**: string

Natural-JS의 패키지별 버전을 반환합니다.

- Natural-CORE의 패키지의 버전: `N.version["Natural-CORE"]`
- Natural-ARCHITECTURE의 패키지의 버전: `N.version["Natural-ARCHITECTURE"]`
- Natural-DATA의 패키지의 버전: `N.version["Natural-DATA"]`
- Natural-UI의 패키지의 버전: `N.version["Natural-UI"]`
- Natural-UI.Shell의 패키지의 버전: `N.version["Natural-UI.Shell"]`

#### N.locale([locale])

**Return**: undefined

프레임웍에 설정된 로케일 값을 가져오거나 설정할 수 있습니다.
설정된 로케일 값에 따라서 프레임워크의 기본 메시지들이 다국어 처리됩니다.

미리 등록된 다국어 메시지 세트는 en_US, ko_KR이 있고 Config(natural.config.js)의 message 속성에서 수정할 수 있습니다.
프레임웍의 기본 로케일은 Config(natural.config.js)의 N.context.attr("core").locale 속성 값으로 설정할 수 있습니다.

- **locale**: string - "en_US", "ko_KR" 등의 로케일 문자열

#### N.debug(msg)

**Return**: undefined

브라우저 콘솔에 debug 메시지를 출력합니다.
window.console.debug 함수와 같습니다. 브라우저에서 window.console.debug 함수를 지원하지 않으면 메시지가 출력되지 않습니다.

- **msg**: string - 메시지 텍스트

#### N.log(msg)

**Return**: undefined

브라우저 콘솔에 log 메시지를 출력합니다.
window.console.log 함수와 같습니다. 브라우저에서 window.console.log 함수를 지원하지 않으면 메시지가 출력되지 않습니다.

- **msg**: string - 메시지 텍스트

#### N.info(msg)

**Return**: undefined

브라우저 콘솔에 info 메시지를 출력합니다.
window.console.info 함수와 같습니다. 브라우저에서 window.console.info 함수를 지원하지 않으면 메시지가 출력되지 않습니다.

- **msg**: string - 메시지 텍스트

#### N.warn(msg)

**Return**: undefined

브라우저 콘솔에 warn 메시지를 출력합니다.
window.console.warn 함수와 같습니다. 브라우저에서 window.console.warn 함수를 지원하지 않으면 메시지가 출력되지 않습니다.

- **msg**: string - 메시지 텍스트

#### N.error(msg[, e])

**Return**: ErrorThrown

에러를 발생시키고 에러 메시지를 브라우저 콘솔에 출력합니다.
N.error 함수는 ErrorThrown 객체를 반환하기 때문에 오류를 발생 시키려면 N.error 함수 앞에 throw 구문을 선언해야 합니다.

```javascript
throw N.error("에러가 발생했습니다.");
```

- **msg**: string - 에러 메시지 텍스트
- **e**: ErrorThrown - ErrorThrown 객체가 지정된 경우 지정된 객체를 사용하여 오류를 발생 시킵니다.

#### N.type(obj)

**Return**: string

지정한 객체의 타입("number", "string", "array", "object", "function", "date")을 반환합니다.

- **obj**: anything - 타입을 확인할 객체

#### N.isString(obj)

**Return**: boolean

입력한 객체가 string 타입인지 검사합니다.

- **obj**: anything - 타입을 확인할 객체

#### N.isNumeric(obj)

**Return**: boolean

입력한 객체가 숫자 타입인지 검사합니다.
N.isNumeric은 jQuery.isNumeric 함수를 그대로 사용합니다.

- **obj**: anything - 타입을 확인할 객체

#### N.isPlainObject(obj)

**Return**: boolean

입력한 객체가 순수한 객체 타입인지 검사합니다.

typeof N() 나 N.type(N())을 실행하면 "object"로 반환되지만 N.isPlainObject 이러한 오브젝트를 순수한 오브젝트로 평가하지 않습니다. new Object() 나 객체 리터럴({})로 생성한 오브젝트만 true가 반환됩니다.

N.isPlainObject은 jQuery.isPlainObject 함수를 그대로 사용합니다.

- **obj**: anything - 타입을 확인할 객체

#### N.isEmptyObject(obj)

**Return**: boolean

입력한 객체가 비어 있는 객체인지 검사합니다.
"" 나 {}, []는 모두 비어 있는 객체에서 true를 반환 하지만 [{}]는 객체 안에 다른 빈 객체가 있으므로 false가 반환됩니다.

- **obj**: anything - 타입을 확인할 객체

#### N.isArray(obj)

**Return**: boolean

입력한 객체가 array 타입인지 검사합니다.
N.isArray는 Array.isArray 함수를 그대로 사용합니다.

- **obj**: anything - 타입을 확인할 객체

#### N.isArraylike(obj)

**Return**: boolean

입력한 객체가 array와 비슷한 타입인지 검사합니다.
jQuery object도 겉 보기에는 array와 유사하여 true를 반환합니다. array, jQuery object를 둘 다 같은 오브젝트로 평가하고 싶을 때 사용하세요.

- **obj**: anything - 타입을 확인할 객체

#### N.isWrappedSet(obj)

**Return**: boolean

입력한 객체가 N()이나 $(), jQuery()로 초기화 한 jQuery object 타입인지 검사합니다.

- **obj**: anything - 타입을 확인할 객체

#### N.isElement(obj)

**Return**: boolean

N()이나 $(), jQuery()의 인수로 지정된 객체가 HTML 요소인지 검사합니다.

- **obj**: jQuery object - 유형을 확인할 jQuery object

#### N.toSelector(obj)

**Return**: boolean

N() 함수의 인수로 입력 된 객체의 selector를 추출합니다.

- **obj**: jQuery object|object - selector를 추출할 jQuery object나 object

#### N.serialExecute(fn1, fn2, ...)

**Return**: [jQuery Deferred Objects]

비동기 실행 로직의 계층적 콜백들을 jQuery.Deferred를 사용하여 직렬로 표기할 수 있게 해 주는 함수입니다.

비동기로 작동하는 로직과 그 로직의 전처리, 후처리 로직을 하나의 함수 블록으로 만들어서 N.serialExecute 함수의 인수로 입력하면 됩니다. 입력된 인수의 순서대로 함수들이 실행됩니다. 

다음 인수로 정의한 함수 블록을 실행하기 위해서는 비동기 로직이 끝나는 시점 또는 다음 함수가 실행되어야 하는 시점에 defer(Deferred) 인수의 resolve 메서드를 실행해야 합니다. defer.resolve 메서드의 인수들은 그다음 실행될 함수 블록의 두 번째 인수부터 순서대로 지정됩니다.

각 함수 블록의 this와 return 객체는 인수로 입력된 함수 블록들의 Deferred 객체들이 담겨 있는 array 객체입니다. 이 this를 이용해서 첫 번째 함수 블록의 비동기 로직의 완료 시점에 this[3].resolve()와 같이 실행하면 두 번째, 세 번째 함수 블록을 건너뛰고 네 번째 함수 블록을 실행시킬 수 있습니다.

비동기 로직의 시작 시점에는 아직 다음 함수 블록의 Deferred 객체가 생성되지 않았기 때문에 해당 함수 블록 앞에 정의된 함수 블록들은 참조 가능하나 이후에 정의된 함수 블록은 참조가 불가능합니다.

**예제**

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

## N.gc 객체의 함수

N.gc는 Natural-JS의 가비지 컬렉션 관련 유틸리티 함수들을 모아놓은 객체입니다.

"N.gc.{함수명}(arg[0...N])"와 같이 사용할 수 있습니다.

#### N.gc.minimum()

**Return**: boolean

Natural-JS의 컴포넌트와 라이브러리에서 사용되는 요소와 이벤트에 대한 최소한의 자원을 회수합니다.

N.comm으로 Config(natural.config.js)의 N.context.attr("architecture").page.context 영역에 페이지를 불러올 경우 N.gc[N.context.attr("core").gcMode]()가 자동으로 실행됩니다.

#### N.gc.full()

**Return**: boolean

Natural-JS의 컴포넌트와 라이브러리에서 사용되는 요소와 이벤트에 대한 모든 자원을 회수합니다.

SPA(Single Page Application)로 사이트를 제작할 때 브라우저의 메모리가 페이지를 열 때마다 증가한다면 어딘가에서 메모리 누수가 발생하는 것입니다. N.comm에서 자동으로 포착할 수 없는 부분을 파악하여 N.gc.full()을 실행해 주면 해당 현상이 개선될 수 있습니다.

## N.string 객체의 함수

N.string은 문자열 관련 유틸리티 함수들을 모아놓은 객체입니다.

"N.string.{함수명}(arg[0...N])"와 같이 사용할 수 있습니다.

#### N.string.contains(context, str)

**Return**: boolean

입력한 문자열이 포함되어 있으면 true를 반환합니다.

- **context**: string - 검사 될 대상 문자열을 입력합니다.
- **str**: string - 검사할 문자열을 입력합니다.

#### N.string.endsWith(context, str)

**Return**: boolean

입력한 문자열로 끝나면 true를 반환합니다.

- **context**: string - 검사 될 대상 문자열을 입력합니다.
- **str**: string - 검사할 문자열을 입력합니다.

#### N.string.startsWith(context, str)

**Return**: boolean

입력한 문자열로 시작하면 true를 반환합니다.

- **context**: string - 검사 될 대상 문자열을 입력합니다.
- **str**: string - 검사할 문자열을 입력합니다.

#### N.string.insertAt(context, idx, str)

**Return**: string

문자열의 원하는 위치에 입력한 문자열을 삽입합니다.

- **context**: string - 삽입될 대상 문자열을 입력합니다.
- **idx**: number - 문자열을 삽입할 위치(index)를 입력합니다.
- **str**: string - 삽입할 문자열을 입력합니다.

#### N.string.removeWhitespace(str)

**Return**: string

문자열에서 모든 공백을 제거합니다.

- **str**: string - 공백을 제거할 대상 문자열을 입력합니다.

#### N.string.lpad(context, length, str)

**Return**: string

입력한 길이만큼 입력한 문자로 왼쪽부터 채워줍니다.

- **context**: string - 대상 문자열을 입력합니다.
- **length**: number - 채울 길이를 입력합니다.
- **str**: string - 채울 문자를 입력합니다.

#### N.string.rpad(context, length, str)

**Return**: string

입력한 길이만큼 입력한 문자로 오른쪽부터 채워줍니다.

- **context**: string - 대상 문자열을 입력합니다.
- **length**: number - 채울 길이를 입력합니다.
- **str**: string - 채울 문자를 입력합니다.

#### N.string.byteLength(str)

**Return**: string

입력한 문자열의 byte 길이를 반환합니다.

정확한 byte의 길이는 아니고 DBMS에서 처리되는 한글이나 한자 등의 byte 길이를 3byte(UTF-8)로 계산하고 영문자, 숫자 등은 1 바이트로 계산한 결과입니다.

한글이나 한자 등의 byte 길이가 3byte가 아닌 경우 Config(natural.config.js)의 N.context.attr("core").charByteLength 속성 값을 변경하면 됩니다.

- **str**: string - 길이를 검사할 문자열을 입력합니다.

#### N.string.isEmpty(str)

**Return**: string

null, undefined 또는 비어 있는 문자열("")인지 검사합니다.

- **str**: string - 검사할 문자열을 입력합니다.

#### N.string.trim(str)

**Return**: string

문자열이 입력되면 입력한 문자열의 앞 뒤 공백을 제거하고 null이나 undefined가 입력되면 비어있는 문자열("")을 반환합니다.

N.string.trim은 String.prototype.trim 메서드를 그대로 사용합니다.

- **str**: string|null|undefined - 공백을 제거할 대상 문자열을 입력합니다.

#### N.string.trimToEmpty(str)

**Return**: string

문자열이 입력되면 입력한 문자열의 앞 뒤 공백을 제거하고 null이나 undefined가 입력되면 비어있는 문자열("")을 반환합니다.

N.string.trim은 String.prototype.trim 메서드를 그대로 사용합니다.

- **str**: string|null|undefined - 공백을 제거할 대상 문자열을 입력합니다.

#### N.string.trimToNull(str)

**Return**: string|null

문자열이 입력되면 입력한 문자열의 앞 뒤 공백을 제거하고 null이나 undefined가 입력되면 null을 반환합니다.

- **str**: string|null|undefined - 공백을 제거할 대상 문자열을 입력합니다.

#### N.string.trimToUndefined(str)

**Return**: string|undefined

문자열이 입력되면 입력한 문자열의 앞 뒤 공백을 제거하고 null이나 undefined가 입력되면 undefined를 반환합니다.

- **str**: string|null|undefined - 공백을 제거할 대상 문자열을 입력합니다.

#### N.string.trimToZero(str)

**Return**: string

문자열이 입력되면 입력한 문자열의 앞 뒤 공백을 제거하고 null이나 undefined가 입력되면 "0" 문자를 반환합니다.

- **str**: string|null|undefined - 공백을 제거할 대상 문자열을 입력합니다.

#### N.string.trimToVal(str, val)

**Return**: string

문자열이 입력되면 입력한 문자열의 앞 뒤 공백을 제거하고 null이나 undefined가 입력되면 val(arguments[1]) 인수 값을 반환합니다.

- **str**: string|null|undefined - 공백을 제거할 대상 문자열을 입력합니다.
- **val**: string - 반환될 문자열을 입력합니다.

## N.element 객체의 함수

N.element는 HTML 요소 관련 유틸리티 함수들을 모아놓은 객체입니다.

"N.element.{함수명}(arg[0...N])"와 같이 사용할 수 있습니다.

#### N.element.toData(eles)

**Return**: boolean

지정한 입력 요소들의 id와 value 속성 값으로 JSON 오브젝트를 생성합니다.

N.form의 add 메서드에서 초기 데이터를 생성할 때 사용합니다.

```javascript
// #box 요소 안에 있는 입력 요소의 값들을 json 데이터로 변환
var data = N.element.toData($("#box").find(":input"));
```

- **eles**: jQuery object - 입력 요소만 선택된 jQuery object를 입력합니다.

#### N.element.maxZindex([ele])

**Return**: number

지정한 요소 중에서 가장 높은 z-index 값을 반환합니다.

```javascript
var maxZindex = N.element.maxZindex($("div"));
```

- **ele**: jQuery object - 대상 요소들을 jQuery object를 입력합니다. 입력하지 않으면 $("div, span, ul, p, nav, article, section")가 기본 값으로 지정됩니다.

## N.date 객체의 함수

N.date은 날짜 제어 관련 유틸리티 함수들을 모아놓은 객체입니다.

"N.date.{함수명}(arg[0...N])"와 같이 사용할 수 있습니다.

#### N.date.diff(refDateStr, targetDateStr)

**Return**: string

입력한 두 날짜 간 일수 차이를 반환합니다.

- **refDateStr**: string - 기준 날짜를 8자리 날짜 문자열(YYYYmmdd)로 입력합니다.
- **targetDateStr**: string - 계산할 날짜를 8자리 날짜 문자열(YYYYmmdd)로 입력합니다.

#### N.date.strToDateStrArr(str, format[, isString])

**Return**: array

입력된 날짜 문자열과 입력된 날짜 서식을 기준으로 array 타입의 날짜 객체[년(number|string), 월(number|string), 일(number|string)]를 생성합니다.

- **str**: string - 날짜 문자열을 입력합니다.
- **format**: string - 입력한 날짜 문자열의 서식(format)을 입력(필수입력)합니다.
  - Y : 년
  - m : 월
  - d : 일
  - 예) "19991231" : "Ymd"
  - 예) "3112" : "dm"
  - 예) "12311999" : "mdY"
- **isString**: boolean - true를 입력하면 결과 array 객체에 날짜를 number 타입이 아닌 string 타입으로 저장합니다.

#### N.date.strToDate(str[, format])

**Return**: string

입력된 날짜/시간 문자열을 date 객체로 변환하고 객체의 속성에 저장하여 반환합니다. 반환되는 객체의 속성은 다음과 같습니다.
```javascript
{
    obj : date object,
    format : Date format string
}
```

- **str**: string - 날짜 + 시간 문자열을 입력합니다.
  - "19991231" : "1999-12-31 00:00:00"
  - "1999123103" : "1999-12-31 03:00:00"
  - "199912310348" : "1999-12-31 03:48:00"
  - "19991231034856" : "1999-12-31 03:48:56"
- **format**: string - 입력한 날짜 문자열의 서식(format)을 입력(필수입력)합니다.
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

#### N.date.format(str, format)

**Return**: array

입력된 날짜 + 시간 문자열을 입력된 날짜 서식을 기준으로 서식화(format)합니다.

- **str**: string - 날짜 + 시간 문자열을 입력합니다.
- **format**: string - 입력한 날짜 문자열의 서식(format)을 입력(필수입력)합니다.
  - Y : 년
  - m : 월
  - d : 일
  - H : 시
  - i : 분
  - s : 초

예제:
```javascript
N.date.format("19991231120159", "Y-m-d H:i:s") // "1999-12-31 12:01:59"
N.date.format("19991231120159", "Y/m/d H:i:s") // "1999/12/31 12:01:59"
N.date.format("19991231120159", "Y.m.d H:i") // "1999.12.31 12:01"
N.date.format("19991231120159", N.context.attr("data").formatter.date.YmdHis()) // "1999-12-31 12:01:59"
```

대시(-), 콜론(:) 등의 날짜와 시간을 구분하는 문자는 Config(natural.config.js)의 N.context.attr("data").formatter.date 오브젝트의 함수들로 정의되어 있습니다. 날짜/시간 구분 문자는 해당 함수의 return 문자열로 변경할 수 있습니다.

#### N.date.dateToTs([dateObj])

**Return**: number

date 객체를 Timestamp로 변환합니다.
dateObj 인수를 입력하지 않으면 현재 날짜와 시간으로 변환합니다.

- **dateObj**: date object - Timestamp로 변환할 date 객체를 입력합니다.

#### N.date.tsToDate([tsNum])

**Return**: date object

Timestamp를 date 객체 변환합니다.
tsNum 인수를 입력하지 않으면 현재 날짜와 시간으로 변환합니다.

- **tsNum**: number - date 객체로 변환할 Timestamp를 입력합니다.

## N.browser 객체의 함수

N.browser는 browser 관련 유틸리티 함수들을 모아놓은 객체입니다.

"N.browser.{함수명}(arg[0...N])"와 같이 사용할 수 있습니다.

#### N.browser.cookie(name, value, expiredays[, domain])

**Return**: undefined

브라우저 쿠키를 생성합니다.

- **name**: string - 쿠키명을 입력합니다.
- **value**: string - 쿠키값을 입력합니다.
- **expiredays**: number - 쿠키의 만료일을 입력합니다.
- **domain**: string - 쿠키가 생성될 도메인을 입력합니다.

#### N.browser.removeCookie(name[, domain])

**Return**: undefined

생성된 쿠키를 제거합니다.

- **name**: string - 쿠키명을 입력합니다.
- **domain**: string - 제거할 쿠키의 도메인을 입력합니다.

#### N.browser.msieVersion()

**Return**: number

접속한 MSIE(Microsoft Internet Explorer)의 버전을 가져옵니다. MSIE가 아닐 경우 0을 반환합니다.

#### N.browser.is(name)

**Return**: boolean

접속한 브라우저나 모바일 OS가 입력한 name 인수 값과 일치하면 true를 반환합니다.

- **name**: string - 브라우저명이나 모바일 OS명을 입력합니다.
  - "opera": Opera Browser.
  - "firefox": Mozilla Firefox Browser.
  - "safari": Apple Safari Browser.
  - "chrome": Google Chrome Browser.
  - "ie": Microsoft Internet Explorer Browser.
  - "android": Google Android OS
  - "ios": Apple iOS

#### N.browser.contextPath()

**Return**: string

브라우저 URL에서 컨텍스트 경로를 반환합니다.

#### N.browser.scrollbarWidth()

**Return**: number

브라우저 스크롤바의 넓이를 반환합니다.

## N.message 객체의 함수

N.message는 다국어 메시지 처리 관련 유틸리티 함수들을 모아놓은 객체입니다.

"N.message.{함수명}(arg[0...N])"와 같이 사용할 수 있습니다.

#### N.message.get(resource, key[, vars])

**Return**: string

입력된 메시지 리소스에서 현재 설정된 로케일에 맞는 메시지를 반환해 줍니다.

프레임웍의 기본 로케일은 Config(natural.config.js)의 N.context.attr("core").locale 속성 값으로 설정할 수 있습니다.

- **resource**: object - 메시지 리소스 객체를 지정합니다.
  
  메시지 리소스는 object 타입으로 생성하고 다음과 같이 로케일 별 메시지 세트를 구성해야 합니다.
  ```javascript
  var message = {
      "ko_KR" : {
          key : "안녕 {0}."
      },
      "en_US" : {
          key : "Hello {0}."
      }
  }
  
  var msg = N.message.get(message, "key", ["Natural-JS"]);
  
  // msg : "Hello Natural-JS."
  ```
  
- **key**: string - 메시지 프로퍼티명.
- **vars**: array - 메시지의 변수를 입력한 값으로 치환해 줍니다. 메시지에 선언된 {index}와 같은 변수가 vars 옵션으로 설정 한 array의 index에 해당하는 값으로 치환됩니다.

## N.array 객체의 함수

N.array는 배열 관련 유틸리티 함수들을 모아놓은 객체입니다.

"N.array.{함수명}(arg[0...N])"와 같이 사용할 수 있습니다.

#### N.array.deduplicate(arr[, key])

**Return**: array

array에서 중복된 요소를 제거합니다.

array에 object가 담겨 있을 경우 두 번째 인수로 오브젝트의 프로퍼티명을 입력하면 입력한 프로퍼티를 기준으로 중복된 오브젝트를 제거합니다.

- **arr**: array - 중복을 제거할 array를 입력합니다.
- **key**: string - array에 object가 저장되어 있을 경우 중복된 요소를 제거할 기준 프로퍼티명을 입력합니다.

## N.json 객체의 함수

N.json은 json object 관련 유틸리티 함수들을 모아놓은 객체입니다.

"N.json.{함수명}(arg[0...N])"와 같이 사용할 수 있습니다.

#### N.json.mergeJsonArray(arr1, arr2[, key])

**Return**: json object array

json object가 담겨 있는 array 두 개를 병합합니다.

arr1 인수를 기준으로 arr2 인수를 병합하고 중복된 요소를 제외합니다.
세 번째 인수로 오브젝트의 프로퍼티명을 지정하면 해당 프로퍼티를 기준으로 중복된 요소를 제외합니다.
arr1 인수로 지정한 객체는 병합되더라도 메모리 참조는 변경되지 않습니다.

- **arr1**: json object array - 원본 json object array를 입력합니다.
- **arr2**: json object array - 병합할 json object array를 입력합니다.
- **key**: string - 병합할 기준 프로퍼티명(필수 인수 아님)을 입력합니다.

#### N.json.format(obj, indent)

**Return**: string

json object를 보기 좋게 formatting 해 줍니다.

- **obj**: json object array|json object - json object 나 json object가 저장되어 있는 array를 입력합니다.
- **indent**: number - 들여 쓰기 될 공백 수를 입력합니다.

## N.event 객체의 함수

N.event는 event 관련 유틸리티 함수들을 모아놓은 객체입니다.

"N.event.{함수명}(arg[0...N])"와 같이 사용할 수 있습니다.

#### N.event.isNumberRelatedKeys(e)

**Return**: boolean

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

```javascript
$("input").on("keydown", function(e) {
    if(N.event.isNumberRelatedKeys(e)) {
        // TODO
    }
});
```

Datepicker(N.datepicker)에서 숫자와 관련 키 입력을 차단하기 위해 사용합니다.

- **e**: Event - Key Event 객체를 입력합니다.

#### N.event.disable(e)

**Return**: boolean

지정한 요소에 바인딩되어 있는 이벤트들의 실행을 차단할 수 있는 이벤트 핸들러입니다.

N().tpBind 메서드를 사용해서 요소 이벤트의 제일 앞단에 N.event.disable 이벤트 핸들러를 바인딩합니다.

```javascript
// 클릭 방지
$("selector").tpBind("click", N.event.disable);

// 클릭 방지 해제
$("selector").off("click", N.event.disable);
```

- **e**: Event - 이벤트 핸들러의 Event 객체 인수를 입력합니다.