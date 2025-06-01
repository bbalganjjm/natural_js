# Alert 생성자

Natural-JS의 Alert 컴포넌트는 직접 생성자 메서드와 jQuery 플러그인 메서드라는 두 가지 방식으로 인스턴스화할 수 있습니다.

## 생성자 메서드

### N.alert

**반환**: N.alert 인스턴스

N.alert의 인스턴스를 생성합니다.

```javascript
var alert = new N.alert(context, opts|msg);
var alert = new N.alert(context, opts|msg, vars);
```

#### 매개변수

##### context
**Type**: window | jQuery object | jQuery selector string

context 옵션을 설정합니다. 기본 옵션의 context 옵션과 같습니다.

##### opts|msg
**Type**: string | object

string 타입의 인수를 입력하면 기본 옵션의 msg 옵션으로 설정됩니다.

> **참고**: msg 인수는 메시지 문자열, jQuery object, HTML 문자열이나 HTML 요소를 지정할 수 있습니다.

object 타입으로 인수를 입력하면 컴포넌트의 기본 옵션 객체로 지정됩니다.

##### vars
**Type**: array

기본 옵션의 vars 옵션으로 설정됩니다.

### N(obj).alert

**반환**: N.alert 인스턴스

N.alert의 객체 인스턴스를 jQuery 플러그인 방식으로 생성합니다.

```javascript
var alert = N(context).alert(opts|msg);
var alert = N(context).alert(opts|msg, vars);
```

객체 인스턴스를 생성하는 방식은 다르지만 "new N.alert()"로 생성한 인스턴스와 "N().alert"로 생성한 인스턴스는 동일합니다. N() 함수의 첫 번째 인수가 new N.alert 생성자의 첫 번째 인수로 설정됩니다.

#### 매개변수

##### opts|msg
**Type**: string | object

N.alert 함수의 두 번째 인수(opts|msg)와 같습니다.

##### vars
**Type**: array

N.alert 함수의 세 번째 인수(vars)와 같습니다.

## 사용 예제

### 기본 메시지 문자열을 사용한 알림

```javascript
// 직접 생성자 사용
var alert1 = new N.alert(window, "이것은 알림 메시지입니다");
alert1.show();

// jQuery 플러그인 메서드 사용
var alert2 = N(window).alert("이것은 알림 메시지입니다");
alert2.show();
```

### 사용자 정의 옵션을 사용한 알림

```javascript
// 직접 생성자 사용
var alert1 = new N.alert(window, {
    msg: "이것은 사용자 정의 알림입니다",
    width: 400,
    height: 200,
    buttons: [{
        text: "확인",
        click: function() {
            this.close();
        }
    }]
});
alert1.show();

// jQuery 플러그인 메서드 사용
var alert2 = N(window).alert({
    msg: "이것은 사용자 정의 알림입니다",
    width: 400,
    height: 200,
    buttons: [{
        text: "확인",
        click: function() {
            this.close();
        }
    }]
});
alert2.show();
```

### 변수 대체를 사용한 알림

```javascript
// 직접 생성자 사용
var alert1 = new N.alert(window, "안녕하세요, {0}님! 귀하의 점수는 {1}점입니다.", ["홍길동", 95]);
alert1.show();

// jQuery 플러그인 메서드 사용
var alert2 = N(window).alert("안녕하세요, {0}님! 귀하의 점수는 {1}점입니다.", ["홍길동", 95]);
alert2.show();
```

## 관련 문서

- [Alert 개요](../../alert-overview.md)
- [Alert 기본 옵션](../../alert-default-options.md)
- [Alert 함수](../../alert-functions.md)
- [Alert 예제](../../alert-examples.md)
