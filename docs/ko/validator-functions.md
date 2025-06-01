# 함수

Validator 컴포넌트는 지정된 규칙에 대해 데이터의 유효성을 검증하는 메서드를 제공합니다. 이 문서는 N.validator 객체에서 사용 가능한 함수들을 설명합니다.

## 사용 가능한 메서드

| 이름 | 인수 | 타입 | 반환 | 설명 |
|------|------|------|------|------|
| validate | N/A | N/A | array[object[array[object]]] | 유효성 검증을 실행합니다. |
| | row | number | N/A | 유효성 검증할 데이터 목록의 행 index. |

## validate()

`validate()` 메서드는 데이터에 유효성 검증 규칙을 적용하고 유효성 검증 결과를 반환합니다.

### 규칙 지정 방식에 따른 동작

- **룰들을 객체 옵션으로 지정할 경우**: 유효성 검증된 데이터 목록 객체를 반환합니다.
- **data-validate 속성이 정의된 요소가 포함된 context 요소를 jQuery object로 지정할 경우**: 유효성 검증된 데이터 값을 지정한 요소에 보여주고 유효하지 않은 데이터에 대해서는 툴팁으로 오류 메시지를 표시합니다.

### `row` 매개변수

row 인수가 설정되지 않은 경우:
- **룰들을 객체 옵션으로 지정할 경우**: 모든 행 데이터를 유효성 검증합니다.
- **context 요소를 지정한 경우**: 첫 번째 행 인덱스(0)로 자동 지정됩니다.

### 반환 값 형식

룰들을 객체 옵션으로 지정했을 경우 다음과 같은 폼으로 데이터를 반환합니다:

```javascript
[{
    "컬럼 프로퍼티 명": [
        {
            "검증 룰": "rule",
            "검증 성공 여부": true|false,
            "검증 메시지": "Message"
        }
    ]
}]
```

> **참고**: 검증 메시지는 Config(natural.config.js)의 N.context.attr("data").validator.message 속성에서 설정할 수 있습니다.

### 예제

```javascript
// 데이터 세트의 모든 행 유효성 검증
var validationResult = new N.validator(data, {
    "numeric": [["required"], ["integer+commas"]],
    "generic": [["required"], ["korean"]]
}).validate();

// 두 번째 행(인덱스 1)만 유효성 검증
var rowValidationResult = new N.validator(data, {
    "numeric": [["required"], ["integer+commas"]],
    "generic": [["required"], ["korean"]]
}).validate(1);
```

## DOM 요소 작업

data-validate 속성이 있는 HTML 요소로 작업할 때, 요소가 포커스를 잃을 때 유효성 검증이 자동으로 적용됩니다. 그러나 수동으로 유효성 검증을 트리거할 수도 있습니다:

```javascript
// 요소에서 validate 이벤트 트리거
N("input[name='targetEle']").trigger("validate");
```

이는 포커스를 변경하지 않고 요소의 유효성을 프로그래밍 방식으로 검증해야 할 때 특히 유용합니다.

## 오류 메시지 사용자 정의

Natural-JS 구성에서 유효성 검증 규칙에 대한 오류 메시지를 사용자 정의할 수 있습니다:

```javascript
// natural.config.js에서
N.context.attr("data").validator.message = {
    required: "이 필드는 필수입니다.",
    integer: "정수만 입력해 주세요.",
    email: "유효한 이메일 주소를 입력해 주세요."
    // 다른 규칙에 대한 사용자 정의 메시지 추가
};
```

이러한 사용자 정의 메시지는 사용자에게 유효성 검증 오류를 표시할 때 사용됩니다.

## 여러 유효성 검증 규칙 사용하기

단일 필드에 여러 유효성 검증 규칙을 적용할 수 있습니다. 규칙은 순서대로 확인되며, 첫 번째로 실패하는 규칙에서 유효성 검증이 중지됩니다:

```javascript
// 먼저 필수 항목인지 확인한 다음 유효한 이메일인지 확인
var rules = [["required"], ["email"]];
```

이를 통해 여러 기준에 따라 사용자 입력에 대한 포괄적인 유효성 검증을 보장합니다.
