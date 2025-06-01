# 예제

이 문서는 Natural-JS 애플리케이션에서 Validator 컴포넌트를 사용하는 방법에 대한 실용적인 예제를 제공합니다. 이 예제들은 다양한 유효성 검증 시나리오와 구현 접근 방식을 다룹니다.

## 1. HTML 요소에 유효성 검증 규칙 선언하기

`data-validate` 속성을 사용하여 HTML 요소에 직접 유효성 검증 규칙을 선언할 수 있습니다. 이는 폼을 다룰 때 특히 유용합니다.

```html
<input id="col01" type="text" data-validate='[["required"]]'>
```

위와 같이 입력 요소에 선언하면, 포커스가 요소를 떠날 때 유효성 검증이 실행됩니다. 유효성 검증에 실패하면 실패 원인이 입력 요소 옆에 툴팁으로 표시됩니다.

## 2. N.validator 라이브러리 직접 사용하기

N.validator 라이브러리 메서드를 직접 사용하여 문자열을 프로그래밍 방식으로 검증할 수 있습니다.

```javascript
// N.validator.{rule}("유효성 검증할 문자열", ...arguments);

// 값이 1과 9 사이에 있는지 확인
N.validator.rangevalue("유효성 검증 문자열", [1, 9]); // 반환값: false
```

이 예제에서는 `rangevalue` 규칙을 적용하여 값이 지정된 범위 내에 있는지 확인합니다.

## 3. Validator 이벤트 수동으로 트리거하기

Validator에 입력 요소를 지정하면 해당 입력 요소에 "validate" 이벤트가 생성됩니다. 이 이벤트는 jQuery의 trigger 메서드를 사용하여 직접 트리거할 수 있습니다.

```javascript
// 요소에서 유효성 검증 트리거
N("input[name='targetEle']").trigger("validate");
```

## 4. 동적으로 유효성 검증 규칙 변경하기

요소에 유효성 검증 규칙을 동적으로 변경하고 즉시 적용할 수 있습니다:

```javascript
N("selector").data("validate", [["required"]]).trigger("validate");
```

> **중요**: 이 코드가 제대로 작동하려면 컴포넌트에 데이터를 바인딩하기 전에 대상 요소의 data-validate 속성에 하나 이상의 유효성 검증 규칙이 선언되어 있어야 합니다.

## 5. 복잡한 유효성 검증 예제

이 예제는 데이터셋의 다른 속성에 여러 유효성 검증 규칙을 적용하는 방법을 보여줍니다:

```javascript
// 샘플 데이터
var data = [
    {
        id: 1,
        email: "user@example.com",
        phone: "0101234567",
        age: 25
    }
];

// 여러 규칙으로 validator 생성
var validationResult = new N.validator(data, {
    "email": [["required"], ["email"]],
    "phone": [["required"], ["phone"]],
    "age": [["required"], ["rangevalue", 18, 65]]
}).validate();

console.log(validationResult);
// 출력 형식:
// [{
//   "email": [
//     { "rule": "required", "success": true, "message": "" },
//     { "rule": "email", "success": true, "message": "" }
//   ],
//   "phone": [
//     { "rule": "required", "success": true, "message": "" },
//     { "rule": "phone", "success": false, "message": "유효한 전화번호를 입력해 주세요." }
//   ],
//   "age": [
//     { "rule": "required", "success": true, "message": "" },
//     { "rule": "rangevalue", "success": true, "message": "" }
//   ]
// }]
```

## 6. 폼 유효성 검증 작업하기

이 예제는 제출 전에 폼의 유효성을 검증하는 방법을 보여줍니다:

```html
<form id="registrationForm">
    <div>
        <label for="email">이메일:</label>
        <input id="email" name="email" type="text" data-validate='[["required"], ["email"]]'>
    </div>
    <div>
        <label for="password">비밀번호:</label>
        <input id="password" name="password" type="password" data-validate='[["required"], ["minlength", 8]]'>
    </div>
    <button type="submit">등록</button>
</form>

<script>
N("#registrationForm").on("submit", function(e) {
    e.preventDefault();
    
    // 폼 요소 가져오기
    var formElements = N(this).find("[data-validate]");
    
    // 모든 요소에서 유효성 검증 트리거
    formElements.trigger("validate");
    
    // 유효성 검증 실패 여부 확인
    var hasErrors = formElements.filter(function() {
        return N(this).data("validate-error") === true;
    }).length > 0;
    
    if (!hasErrors) {
        // 폼 제출 또는 데이터 처리
        console.log("폼이 유효합니다. 제출을 진행합니다.");
    } else {
        console.log("폼에 오류가 있습니다. 수정해 주세요.");
    }
});
</script>
```

## 7. 사용자 정의 유효성 검증 함수

복잡한 유효성 검증 시나리오를 위해 사용자 정의 유효성 검증 함수를 만들 수도 있습니다:

```javascript
// 사용자 정의 유효성 검증 함수 정의
N.validator.customPasswordValidation = function(value) {
    // 비밀번호는 하나 이상의 대문자, 하나 이상의 소문자,
    // 하나 이상의 숫자를 포함하고 최소 8자 이상이어야 합니다
    var hasUpperCase = /[A-Z]/.test(value);
    var hasLowerCase = /[a-z]/.test(value);
    var hasNumbers = /\d/.test(value);
    var hasMinLength = value.length >= 8;
    
    return hasUpperCase && hasLowerCase && hasNumbers && hasMinLength;
};

// 사용자 정의 유효성 검증 사용
N("#password").data("validate", [["required"], ["customPasswordValidation"]]);
```

사용 가능한 유효성 검증 규칙의 전체 목록은 [유효성 검증 룰 목록](validator-validation-rule-list.md) 문서를 참조하세요.
