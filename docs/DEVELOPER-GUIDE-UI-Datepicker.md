# Natural-JS Datepicker 컴포넌트 개발자 가이드

Natural-JS의 Datepicker(N.datepicker)는 context 옵션으로 지정한 텍스트 입력 요소에서 날짜나 월을 선택할 수 있는 캘린더 팝업을 표시하는 UI 컴포넌트입니다.

## 개요

Datepicker는 사용자가 텍스트 입력 필드에서 날짜를 쉽게 선택할 수 있도록 캘린더 형식의 인터페이스를 제공합니다. 텍스트 입력 요소에 `data-format` 속성에 "date" 규칙을 선언하고 데이터 관련 컴포넌트와 연동하면 간단하게 Datepicker를 사용할 수 있습니다.

참고할 수 있는 관련 메뉴:
- [Form](https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0407.html)의 [선언적 옵션] 탭
- [List](https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0408.html)의 [선언적 옵션] 탭
- [Grid](https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0409.html)의 [선언적 옵션] 탭
- [Formatter](https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0301.html)의 [Format 규칙 목록] 탭에 있는 ["date", 4|6|8|10|12|14, "month"|"date"] 규칙

## 생성자(Constructor)

### N.datepicker

```javascript
var datepicker = new N.datepicker(context, opts);
```

- **context** (jQuery 객체 또는 jQuery 셀렉터 문자열): Datepicker가 적용될 입력 요소를 설정합니다. 기본 옵션의 context 옵션과 동일합니다.
- **opts** (객체): 컴포넌트의 기본 옵션 객체를 지정합니다.
- **반환 값**: N.datepicker 인스턴스

### N(obj).datepicker

jQuery 플러그인 메서드로 N.datepicker 객체 인스턴스를 생성합니다.

```javascript
var datepicker = N(context).datepicker(opts);
```

- **opts** (객체): N.datepicker 함수의 두번째 인자(opts)와 동일합니다.
- **반환 값**: N.datepicker 인스턴스

`new N.datepicker()`로 생성한 인스턴스와 `N().datepicker`로 생성한 인스턴스는 객체 인스턴스를 생성하는 방법만 다를 뿐 동일합니다.

## 기본 옵션(Default Options)

| 옵션명 | 타입 | 기본값 | 필수 여부 | 설명 |
|--------|------|---------|-----------|------|
| context | jQuery 객체 또는 jQuery 셀렉터 문자열 | null | O | N.datepicker가 적용되는 입력 요소를 지정합니다.<br>`<input class="datepicker-context" type="text">` |
| yearsPanelPosition | string(left\|top) | left | | top으로 설정하면 연도 선택 요소가 상단에 생성됩니다. |
| monthsPanelPosition | string(left\|top) | left | | top으로 설정하면 월 선택 요소가 상단에 생성됩니다. |
| minYear | number | 200 | | yearsPanelPosition 옵션 값이 "top"일 때 선택할 수 있는 이전 연도의 수를 설정합니다. |
| maxYear | number | 200 | | yearsPanelPosition 옵션 값이 "top"일 때 선택할 수 있는 이후 연도의 수를 설정합니다. |
| yearChangeInput | boolean | false | | true로 설정하면 연도가 변경될 때 변경된 날짜가 즉시 입력 요소에 적용됩니다. |
| monthChangeInput | boolean | false | | true로 설정하면 월이 변경될 때 변경된 날짜가 즉시 입력 요소에 적용됩니다. |
| touchMonthChange | boolean | false | | true로 설정하면 터치로 좌우 드래그 할 때 월이 변경됩니다. |
| scrollMonthChange | boolean | false | | true로 설정하면 마우스 휠을 스크롤할 때 월이 변경됩니다. |
| monthonly | boolean | false | | true로 설정하면 연도와 월만 선택할 수 있는 Monthpicker가 표시됩니다. |
| focusin | boolean | true | | false로 설정하면 입력 요소에 커서가 포커스될 때 datepicker가 표시되지 않습니다. |
| minDate | string | null | | 설정한 날짜보다 이전 날짜가 선택되거나 입력되면 입력이 차단됩니다. |
| maxDate | string | null | | 설정한 날짜보다 이후 날짜가 선택되거나 입력되면 입력이 차단됩니다. |
| holiday | object[object[string\|array]] | { "repeat": null, "once": null } | | 휴일 옵션을 설정하면 Datepicker에 휴일이 표시됩니다. |
| onSelect | function | null | | 날짜 또는 월(monthonly 옵션이 true로 설정된 경우)이 선택될 때 실행되는 이벤트 핸들러를 정의합니다. |
| onBeforeShow | function | null | | 데이트 피커가 표시되기 전에 실행되는 이벤트 핸들러를 정의합니다. |
| onShow | function | null | | 데이트 피커가 표시된 후에 실행되는 이벤트 핸들러를 정의합니다. |
| onBeforeHide | function | null | | 데이트 피커가 닫히기 전에 실행되는 이벤트 핸들러를 정의합니다. |
| onHide | function | null | | 데이트 피커가 닫히고(닫히는 효과가 끝난 후) 실행되는 이벤트 핸들러를 정의합니다. |
| onChangeYear | function | null | | 연도가 변경될 때 실행되는 이벤트 핸들러를 정의합니다. |
| onChangeMonth | function | null | | 월이 변경될 때 실행되는 이벤트 핸들러를 정의합니다. |

### holiday 옵션 설정 예시

holiday 옵션은 아래와 같이 repeat 객체와 once 객체로 설정할 수 있습니다.

```javascript
{
    "repeat" : {
        "0619" : "Holiday1",
        "0620" : "Holiday3",
        "0621" : ["Holiday6", "Holiday7"],
        "0622" : ["Holiday9", "Holiday10"]
    },
    "once" : {
        "20200619" : "Holiday2",
        "20200620" : ["Holiday4", "Holiday5"],
        "20200621" : "Holiday8",
        "20200622" : ["Holiday11", "Holiday12"]
    }
}
```

repeat 객체에는 매년 반복되는 휴일을 연도를 제외하고 입력합니다. once 객체에는 매년 반복되지 않는 휴일을 연도, 월, 일 형식으로 입력합니다.

동일한 날짜에 두 개 이상의 휴일이 있는 경우 Array 타입으로 여러 휴일 이름을 지정할 수 있습니다.

[Config(natural.config.js)](https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0102.html)의 N.context.attr("ui").datepicker.holiday 속성에 설정하면 모든 Datepicker에 적용됩니다.

```javascript
N.comm("getHolidayList.json").submit(function(data) {
    var once = {};
    N(data).each(function() {
        once[this.holidayDate] = this.holidayName;
    });
    if(N.context.attr("ui").datepicker.holiday === undefined) {
        N.context.attr("ui").datepicker.holiday = {};
    }
    N.context.attr("ui").datepicker.holiday.once = once;
});
```

휴일로 표시되는 요소에는 "Datepicker_holiday__" 클래스 속성 값이 추가됩니다.

### 이벤트 핸들러 함수 매개변수

#### onSelect

```javascript
onSelect : function(context, selDate, monthonly) {
    // this : N.datepicker 인스턴스
    // context : context 요소
    // selDate : 선택된 날짜의 Date 객체
    //      selDate = {
    //          obj: Date 객체,
    //          format: 날짜 형식(Formatter > Format 규칙 목록 탭 > "date" 규칙에서 "문자열 타입으로 날짜 형식 지정" 참조)
    //      }
    //      selDate.obj.formatDate("d/m/Y") => "26/09/2024";
    // monthonly : monthonly 옵션 값
}
```

#### onBeforeShow

```javascript
onBeforeShow : function(context, contents) {
    // this : N.datepicker 인스턴스
    // context : context 요소
    // contents : Datepicker 패널 요소
}
```

#### onShow

```javascript
onShow : function(context, contents) {
    // this : N.datepicker 인스턴스
    // context : context 요소
    // contents : Datepicker 패널 요소
}
```

#### onBeforeHide

```javascript
onBeforeHide : function(context, contents) {
    // this : N.datepicker 인스턴스
    // context : context 요소
    // contents : Datepicker 패널 요소
}
```

#### onHide

```javascript
onHide : function(context) {
    // this : N.datepicker 인스턴스
    // context : context 요소
}
```

#### onChangeYear

```javascript
onChangeYear : function(context, year, e) {
    // this : N.datepicker 인스턴스
    // context : context 요소
    // year : 선택한 연도
    // e : 이벤트 객체
}
```

#### onChangeMonth

```javascript
onChangeMonth : function(context, month, year, e) {
    // this : N.datepicker 인스턴스
    // context : context 요소
    // month : 선택한 월
    // year : 선택한 연도
    // e : 이벤트 객체
}
```

## jQuery 이벤트(jQuery Events)

Datepicker의 context에 지정된 입력 요소에 다음 이벤트 핸들러를 바인딩할 수 있습니다.
컴포넌트 초기화 시 동일한 이름의 이벤트가 이미 바인딩되어 있는 경우, 초기화 시 지정된 이벤트가 먼저 실행됩니다.

### onSelect

날짜 또는 월(monthonly 옵션이 true로 설정된 경우)이 선택될 때 실행되는 이벤트 핸들러를 정의합니다.

```javascript
$("context").on("onSelect", function(e, context, selDate, monthonly) {
    // e : 이벤트 객체
    // context : context 요소
    // selDate : 선택한 날짜의 Date 객체
    // monthonly : monthonly 옵션 값
});
```

### onBeforeShow

데이트피커가 표시되기 전에 실행되는 이벤트 핸들러를 정의합니다.

```javascript
$("context").on("onBeforeShow", function(e, context, contents) {
    // e : 이벤트 객체
    // context : context 요소
    // contents : Datepicker 패널 요소
});
```

### onShow

데이트피커가 표시된 후에 실행되는 이벤트 핸들러를 정의합니다.

```javascript
$("context").on("onShow", function(e, context, contents) {
    // e : 이벤트 객체
    // context : context 요소
    // contents : Datepicker 패널 요소
});
```

### onBeforeHide

데이트피커가 닫히기 전에 실행되는 이벤트 핸들러를 정의합니다.

```javascript
$("context").on("onBeforeHide", function(e, context, contents) {
    // e : 이벤트 객체
    // context : context 요소
    // contents : Datepicker 패널 요소
});
```

### onHide

데이트피커가 닫히고(닫히는 효과가 끝난 후) 실행되는 이벤트 핸들러를 정의합니다.

```javascript
$("context").on("onHide", function(e, context) {
    // e : 이벤트 객체
    // context : context 요소
});
```

### onChangeYear

연도가 변경될 때 실행되는 이벤트 핸들러를 정의합니다.

```javascript
$("context").on("onHide", function(e, context, year, oe) {
    // e : 이벤트 객체
    // context : context 요소
    // year : 선택한 연도
    // oe : 원본 이벤트 객체
});
```

### onChangeMonth

월이 변경될 때 실행되는 이벤트 핸들러를 정의합니다.

```javascript
$("context").on("onHide", function(e, month, year, oe) {
    // e : 이벤트 객체
    // context : context 요소
    // month : 선택한 월
    // year : 선택한 연도
    // oe : 원본 이벤트 객체
});
```

## 메서드(Methods)

### context

```javascript
datepicker.context([selector]);
```

- **selector** (string, 선택 사항): jQuery 셀렉터 문법을 입력하면 context 요소에서 지정된 요소를 찾아 반환합니다.
- **반환 값**: jQuery 객체 (context 요소를 반환합니다.)

### show

```javascript
datepicker.show();
```

- **반환 값**: N.datepicker (데이트피커를 표시합니다.)

### hide

```javascript
datepicker.hide();
```

- **반환 값**: N.datepicker (데이트피커를 숨깁니다.)

## 예제(Examples)

### 1. Datepicker 생성하기

```html
<input class="datepicker" type="text">

<script type="text/javascript">
    N(".datepicker").datepicker();
</script>
```

### 2. Monthpicker 생성하기

```html
<input class="datepicker" type="text">

<script type="text/javascript">
    N(".datepicker").datepicker({
        monthonly: true
    });
</script>
```

### 3. N.form, N.grid 또는 N.list로 데이터를 바인딩할 때 "date" 형식 규칙을 지정하여 자동으로 Datepicker 생성하기

```html
<div class="form">
    <input id="datepicker" type="text" data-format='
[["date", 8, "date"]]
'>
</div>

<script type="text/javascript">
    N({ datepicker: "20141212" }).form(".form").bind();
</script>
```