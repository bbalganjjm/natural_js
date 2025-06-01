# Natural-UI.Shell Notify 컴포넌트 개발자 가이드

Natural-UI.Shell의 Notify(N.notify) 컴포넌트는 사용자의 확인 과정이 필요 없는 전역 알림 메시지를 지정한 위치에 표시해 주는 UI 컴포넌트입니다.

## 목차

1. [개요](#개요)
2. [생성자](#생성자)
3. [기본 옵션](#기본-옵션)
4. [함수](#함수)
5. [사용 예제](#사용-예제)
6. [주의 사항](#주의-사항)

## 개요

Notify(N.notify)는 사용자의 확인 과정이 필요 없는 전역 알림 메시지를 지정한 위치에 표시해 주는 UI 컴포넌트입니다. Alert(N.alert)은 콘텐츠 영역의 메시지를 처리하는 용도이고 N.notify는 사이트 전역의 메시지를 처리하는 용도입니다. 때문에 N.alert의 컴포넌트 요소는 각각의 View 요소 안에 생성되고 N.notify는 document.body 요소에 생성됩니다.

## 생성자

### N.notify

`N.notify` 인스턴스를 생성합니다.

```javascript
var notify = new N.notify(position, opts);
```

| 인자 | 타입 | 설명 |
|------|------|------|
| position | object | 메시지가 표시될 위치를 설정합니다. 기본 옵션의 position 옵션과 같습니다. |
| opts | object | 컴포넌트의 기본 옵션 객체를 지정합니다. |

### N(obj).notify

jQuery 플러그인 메소드로 N.notify 객체 인스턴스를 생성합니다.

```javascript
var notify = N(position).notify(opts);
```

객체 인스턴스를 생성하는 방식은 다르지만 `new N.notify()`로 생성한 인스턴스와 `N().notify`로 생성한 인스턴스는 동일합니다. N() 함수의 첫 번째 인수가 new N.notify 생성자의 첫 번째 인수로 설정됩니다.

| 인자 | 타입 | 설명 |
|------|------|------|
| opts | object | N.notify 함수의 두 번째 인수(opts)와 같습니다. |

## 기본 옵션

| 이름 | 타입 | 기본값 | 필수 | 설명 |
|------|------|--------|------|------|
| position | object | { top: 10, right: 10 } | O | 메시지가 표시될 위치를 설정합니다.<br>옵션 객체의 left / right / top / bottom 속성으로 지정할 수 있습니다. |
| container | jQuery object | N("body") | X | 메시지 요소들을 담는 메시지 container가 저장될 요소를 지정합니다.<br>N.alert이나 N.popup은 개별 페이지들이 메시지 container가 됩니다. |
| displayTime | number | 7 | X | 메시지가 표시될 시간을 초 단위로 설정합니다. |
| html | boolean | false | X | true로 설정하면 메시지의 HTML이 적용됩니다. |
| alwaysOnTop | boolean | false | X | true로 설정하면 메시지 대화 상자를 항상 최 상위에 표시합니다. |
| alwaysOnTopCalcTarget | string | div, span, ul, p, nav, article, section, header, footer, aside | X | alwaysOnTop 옵션 적용 시 최 상위 z-index를 계산하기 위한 대상 요소들을 지정합니다.<br>jQuery selector 구문으로 지정합니다.<br>N.notify 관련 요소들이 다른 요소에 의해 가려질 때 가리고 있는 요소 셀렉터를 추가해 주세요. |

## 함수

| 이름 | 인자 | 타입 | 반환 | 설명 |
|------|------|------|------|------|
| context | selector | string | jQuery object | 메시지 컨테이너 요소를 반환합니다.<br><br>jQuery selector 구문을 입력하면 context 요소에서 지정한 요소를 찾아서 반환합니다. |
| add | msg, url | string, string | jQuery object | 메시지 알림을 생성합니다.<br><br>**msg**: 메시지 텍스트를 입력합니다.<br>**url**: 메시지를 클릭했을 때 이동할 URL을 입력합니다. |
| remove | msgBoxEle | jQuery object | N.notify | 메시지 대화 상자를 제거합니다.<br><br>**msgBoxEle**: 제거할 메시지 요소를 지정합니다. |

## 사용 예제

### 1. 메시지를 표시하기 위한 세 가지 방법

```javascript
// 옵션을 지정해서 메시지 표시
N.notify(opts).add(msg, url);

// 옵션 지정 없이 기본 옵션으로 메시지 표시
N.notify.add(msg, url);

// 메시지 대화 상자의 위치를 지정하고 옵션을 지정해서 메시지 표시
N(position).notify(opts).add(msg, url);
```

### 2. 우측 하단에 메시지 표시, 메시지 클릭 시 페이지 이동

```javascript
N({
    top: 5,
    right: 10
}).notify().add("The Natural-JS API manual has been updated.", "http://bbalganjjm.github.io/natural_js/");
```

### 3. HTML 내용을 포함한 메시지 표시

```javascript
N({
    bottom: 10,
    right: 10
}).notify({
    html: true
}).add("<b>Bold</b> and <i>italic</i> text in notification.", "https://example.com");
```

### 4. 메시지 표시 시간 변경하기

```javascript
// 메시지를 15초 동안 표시
N.notify({
    displayTime: 15
}).add("This message will be displayed for 15 seconds.");
```

### 5. 메시지를 항상 최상위에 표시하기

```javascript
N.notify({
    alwaysOnTop: true
}).add("This message will always stay on top of other elements.");
```

### 6. 메시지 수동으로 제거하기

```javascript
// 메시지 생성
var msgBox = N.notify().add("This is a notification message.");

// 생성된 메시지를 3초 후에 수동으로 제거
setTimeout(function() {
    N.notify().remove(msgBox);
}, 3000);
```

## 주의 사항

1. Notify 컴포넌트는 사용자의 확인 과정이 필요 없는 전역 알림 메시지를 표시하는 데 사용합니다. 사용자의 확인이 필요한 메시지는 Alert 컴포넌트를 사용하는 것이 좋습니다.

2. Notify 컴포넌트는 기본적으로 document.body 요소에 생성됩니다. 따라서 여러 개의 메시지가 동시에 표시될 경우, 메시지들이 위에서부터 아래로 쌓이게 됩니다.

3. displayTime 옵션 값이 너무 작으면 사용자가 메시지를 읽기 전에 사라질 수 있으므로 적절한 값을 설정하는 것이 중요합니다.

4. html 옵션을 true로 설정하여 HTML 코드가 포함된 메시지를 표시할 때는 XSS(Cross-Site Scripting) 공격에 주의해야 합니다. 신뢰할 수 없는 소스의 데이터를 그대로 HTML로 표시하지 마세요.

5. alwaysOnTop 옵션이 true로 설정된 경우, 메시지는 항상 최상위에 표시됩니다. 이는 다른 중요한 UI 요소를 가릴 수 있으므로 필요한 경우에만 사용하세요.

6. url 인자를 사용하여 메시지 클릭 시 페이지 이동 기능을 구현할 때는 사용자에게 충분한 정보를 제공하여 어디로 이동하는지 알 수 있게 해야 합니다.