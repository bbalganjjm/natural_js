# 함수

Formatter 컴포넌트는 데이터에 포맷팅 규칙을 적용하고 포맷팅을 원래 값으로 되돌리는 메서드를 제공합니다. 이 문서는 N.formatter 객체에서 사용 가능한 함수들을 설명합니다.

## 사용 가능한 메서드

| 이름 | 인수 | 타입 | 반환 | 설명 |
|------|------|------|------|------|
| format | N/A | N/A | array[object] | 서식화를 실행합니다. |
| | row | number | N/A | 서식화할 데이터 목록의 행 index. |
| unformat | N/A | N/A | array[object] | 원래 데이터로 치환하거나 반환합니다. |
| | row | number | N/A | 데이터 목록에서 unformat 할 행의 index. |
| | key | string | N/A | 행 데이터에서 unformat 할 컬럼 프로퍼티 명. |

## format()

`format()` 메서드는 데이터에 포맷팅 규칙을 적용하고 포맷팅된 데이터를 반환합니다.

### 규칙 지정 방식에 따른 동작

- **룰들을 객체 옵션으로 지정할 경우**: 서식화된 데이터 목록 객체를 반환합니다.
- **data-format 속성이 정의된 요소가 포함된 context 요소를 jQuery object로 지정할 경우**: 서식화된 데이터 값을 지정 한 요소에 보여 줍니다.

### `row` 매개변수

row 인수가 설정되지 않은 경우:
- **룰들을 객체 옵션으로 지정할 경우**: 모든 행 데이터를 서식화합니다.
- **context 요소를 지정한 경우**: 첫 번째 행 인덱스(0)로 자동 지정됩니다.

### 반환 값 형식

룰들을 객체 옵션으로 지정했을 경우 다음과 같은 폼으로 데이터를 반환합니다:

```javascript
[{
    "컬럼 프로퍼티 명": "서식화된 데이터 값"
}]
```

### 예제

```javascript
// 데이터 세트의 모든 행 포맷팅
var formattedData = new N.formatter(data, {
    "numeric": [["numeric", "#,###.##"]]
}).format();

// 두 번째 행(인덱스 1)만 포맷팅
var formattedRow = new N.formatter(data, {
    "numeric": [["numeric", "#,###.##"]]
}).format(1);
```

## unformat()

`unformat()` 메서드는 포맷팅된 데이터를 원래 값으로 되돌립니다.

### 매개변수

- **row**: 어떤 행을 unformat할지 지정합니다. 제공되지 않으면 모든 행이 unformat됩니다.
- **key**: 어떤 컬럼을 unformat할지 지정합니다. 제공되지 않으면 모든 컬럼이 unformat됩니다.

### 예제

```javascript
// formatter 인스턴스 생성
var formatter = new N.formatter(data, {
    "numeric": [["numeric", "#,###.##"]],
    "date": [["date", 8]]
});

// 데이터 포맷팅
var formattedData = formatter.format();

// 나중에 모든 데이터 unformat
var originalData = formatter.unformat();

// 또는 행 2의 "numeric" 컬럼만 unformat
formatter.unformat(2, "numeric");
```

## DOM 요소 작업

data-format 속성이 있는 HTML 요소로 작업할 때, 요소가 포커스를 얻거나 잃을 때 포맷 및 언포맷 작업이 자동으로 적용됩니다. 그러나 수동으로 이러한 이벤트를 트리거할 수도 있습니다:

```javascript
// 요소에서 unformat 이벤트 트리거
N("input[name='targetEle']").trigger("unformat");

// 요소에서 format 이벤트 트리거
N("input[name='targetEle']").trigger("format");
```

이는 포커스를 변경하지 않고 요소의 포맷팅을 프로그래밍 방식으로 업데이트해야 할 때 특히 유용합니다.
