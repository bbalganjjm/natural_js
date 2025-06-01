# 예제

이 문서는 Natural-JS 애플리케이션에서 Formatter 컴포넌트를 사용하는 방법에 대한 실용적인 예제를 제공합니다. 이 예제들은 다양한 포맷팅 시나리오와 구현 접근 방식을 다룹니다.

## 1. HTML 요소에 포맷 규칙 선언하기

`data-format` 속성을 사용하여 HTML 요소에 직접 포맷 규칙을 선언할 수 있습니다. 이는 폼이나 데이터 표시를 다룰 때 특히 유용합니다.

### 입력 요소의 경우

```html
<input id="startDate" type="text" data-format='[["date", 8]]'>
```

위와 같이 입력 요소에 선언하면, 포커스가 요소를 떠날 때 포맷팅이 적용되고 요소에 다시 포커스가 맞춰지면 포맷팅이 제거됩니다. 이를 통해 사용자는 포맷팅된 표시를 유지하면서 원시 값을 편집할 수 있습니다.

### 비입력 요소의 경우

```html
<span id="startDate" data-format='[["date", 8]]'></span>
```

비입력 요소에 포맷 규칙을 선언하면, 포맷팅된 값이 요소의 텍스트 내용으로 설정됩니다.

> **참고**: Formatter는 N.grid나 N.form 등의 UI 컴포넌트에서 포맷팅된 값을 요소에 바인딩하지 않습니다. 원본 입력 데이터를 변경하지 않고 표시되는 값만 포맷팅합니다. 따라서 서버로 데이터를 보낼 때 데이터를 언포맷할 필요가 없습니다.

## 2. N.formatter 라이브러리 직접 사용하기

N.formatter 라이브러리 메서드를 직접 사용하여 문자열을 프로그래밍 방식으로 포맷팅할 수 있습니다.

```javascript
// N.formatter.{rule}("포맷할 문자열", ...arguments);

N.formatter.limit("abcdefghijklmn", [12, "..."]); // 반환값: 'abcdefghijkl...'
```

이 예제에서는 `limit` 규칙을 적용하여 문자열을 12자로 자르고 끝에 "..."를 추가합니다.

## 3. Formatter 이벤트 수동으로 트리거하기

Formatter에 입력 요소를 지정하면 입력 요소에 "format" 및 "unformat" 이벤트가 생성됩니다. 이러한 이벤트는 jQuery의 trigger 메서드를 사용하여 직접 트리거할 수 있습니다.

```javascript
// 요소 언포맷 (원시 값 표시)
N("input[name='targetEle']").trigger("unformat");

// 요소 포맷 (포맷팅된 값 표시)
N("input[name='targetEle']").trigger("format");
```

## 4. 동적으로 포맷 규칙 변경하기

요소에 포맷 규칙을 동적으로 변경하고 즉시 적용할 수 있습니다:

```javascript
N("selector").data("format", [["trimtoempty"]]).trigger("format");
```

> **중요**: 이 코드가 제대로 작동하려면 컴포넌트에 데이터를 바인딩하기 전에 대상 요소의 data-format 속성에 하나 이상의 포맷 규칙이 선언되어 있어야 합니다.

## 5. 복잡한 포맷팅 예제

이 예제는 데이터셋의 다른 속성에 여러 포맷 규칙을 적용하는 방법을 보여줍니다:

```javascript
// 샘플 데이터
var data = [
    {
        id: 1,
        amount: 12345.678,
        created: "20250601",
        description: "이것은 잘라내야 하는 매우 긴 설명입니다"
    }
];

// 여러 규칙으로 formatter 생성
var formatted = new N.formatter(data, {
    "amount": [["trimtoempty"], ["numeric", "#,###.##"]],
    "created": [["date", 8, "yyyy-MM-dd"]],
    "description": [["limit", 20, "..."]]
}).format();

console.log(formatted);
// 출력:
// [{
//   "id": 1,
//   "amount": "12,345.68",
//   "created": "2025-06-01",
//   "description": "이것은 잘라내야 하는..."
// }]
```

## 6. 폼 요소 작업하기

이 예제는 폼에 포맷팅을 적용하는 방법을 보여줍니다:

```html
<form id="userForm">
    <div>
        <label for="phone">전화번호:</label>
        <input id="phone" name="phone" type="text" data-format='[["phone"]]'>
    </div>
    <div>
        <label for="amount">금액:</label>
        <input id="amount" name="amount" type="text" data-format='[["numeric", "#,###.##"]]'>
    </div>
</form>

<script>
N("#userForm").on("submit", function(e) {
    e.preventDefault();
    
    // 폼 요소를 통해 접근할 때 폼 값은 자동으로 원래(포맷팅되지 않은) 상태입니다
    var formData = {
        phone: N("#phone").val(),
        amount: N("#amount").val()
    };
    
    // 서버에 formData 전송...
});
</script>
```

이 예제에서 사용자는 폼 필드에서 포맷팅된 값을 보지만, 폼을 제출할 때는 원래 포맷팅되지 않은 값이 사용됩니다.

사용 가능한 포맷 규칙의 전체 목록은 [포맷 룰 목록](formatter-format-rule-list.md) 문서를 참조하세요.
