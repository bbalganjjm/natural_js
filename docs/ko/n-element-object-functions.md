# N.element 객체의 함수

N.element은 HTML 요소 관련 유틸리티 함수들을 모아놓은 객체입니다.

"N.element.{함수명}(arg[0...N])"와 같이 사용할 수 있습니다.

## N.element.toData

**반환**: object

지정한 입력 요소들의 id와 value 속성 값으로 JSON 오브젝트를 생성합니다.

N.form의 add 메서드에서 초기 데이터를 생성할 때 사용합니다.

### 매개변수

#### eles

**Type**: jQuery object

입력 요소만 선택된 jQuery object를 입력합니다.

**예제**:
```javascript
// #box 요소 안에 있는 입력 요소의 값들을 json 데이터로 변환
var data = N.element.toData($("#box").find(":input"));
```

## N.element.maxZindex

**반환**: number

지정한 요소 중에서 가장 높은 z-index 값을 반환합니다.

### 매개변수

#### ele

**Type**: jQuery object

대상 요소들을 jQuery object를 입력합니다.

입력하지 않으면 $("div, span, ul, p, nav, article, section")가 기본 값으로 지정됩니다.

**예제**:
```javascript
var maxZindex = N.element.maxZindex($("div"));
```
