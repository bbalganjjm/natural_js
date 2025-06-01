# 생성자

Natural-JS의 Formatter 컴포넌트는 지정된 규칙에 따라 데이터를 포맷팅하는 기능을 제공합니다. 이 문서는 Formatter 인스턴스를 생성하고 초기화하는 방법을 설명합니다.

## N.formatter 생성자

| 이름 | 인수 | 타입 | 반환 | 설명 |
|------|------|------|------|------|
| N.formatter | N/A | N/A | N.formatter | N.formatter 인스턴스를 생성합니다. |
| | data | array[object] | N/A | 서식화할 데이터를 지정합니다. |
| | rules\|context | object\|jQuery object | N/A | 포맷 규칙을 지정합니다. |

## Formatter 인스턴스 생성하기

Formatter 인스턴스는 두 가지 방법으로 생성할 수 있습니다:

### 생성자 사용하기

```javascript
var formatter = new N.formatter(data, rules|context);
```

### jQuery 플러그인 메서드 사용하기

```javascript
var formatter = N(data).formatter(rules|context);
```

객체 인스턴스를 생성하는 방식은 다르지만 "new N.formatter()"로 생성한 인스턴스와 "N().formatter"로 생성한 인스턴스는 동일합니다. N() 함수의 첫 번째 인수가 new N.formatter 생성자의 첫 번째 인수로 설정됩니다.

## 포맷 규칙 지정하기

포맷 규칙은 두 가지 방법으로 지정할 수 있습니다:

### 1. 객체 옵션으로 지정

```javascript
// { "컬럼 프로퍼티 명" : [["룰명", arguments[0], arguments[1]... ]] }
new N.formatter(data, {
    "numeric" : [["trimtoempty"], ["numeric", "#,###.##0000"]],
    "generic" : [["trimtoempty"], ["generic", "@@ABCD"]],
    "limit" : [["trimtoempty"], ["limit", "13", "..."]],
    "etc" : [["date", 12]]
}).format();
```

### 2. data-format 속성이 있는 HTML 요소를 통해 지정

```html
<div class="formatter-context">
    <!-- [ ["룰명", "arguments[0]", "arguments[1]"], ... ] -->
    <input id="limit" type="text" data-format='[["trimtoempty"], ["limit", "13", "..." ]]' />
</div>
```

```javascript
N.formatter(data, N(".formatter-context", view)).format();
```

## 동적으로 포맷 규칙 변경하기

선언형으로 포맷 룰을 지정했을 때 동적으로 포맷 룰을 변경하려면, 해당 입력 요소의 "format" 데이터 속성 값에 포맷 룰을 다시 지정하면 됩니다:

```javascript
N("#limit").data("format", [["trimtoempty"]])
```

이렇게 하면 요소와 연결된 포맷 규칙이 업데이트되고 다음에 포맷팅이 트리거될 때 적용됩니다.
