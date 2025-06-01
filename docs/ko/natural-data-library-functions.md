# 함수

Natural-DATA 라이브러리는 JSON 객체 배열을 조작하기 위한 강력한 함수를 제공합니다. 이 문서는 사용 가능한 함수와 그 사용법을 설명합니다.

## 사용 가능한 메서드

| 이름 | 인수 | 타입 | 반환 | 설명 |
|------|------|------|------|------|
| N.data.filter | N/A | N/A | json object array | 지정한 조건과 일치하는 데이터를 추출합니다. |
| | data | json object array | N/A | 필터링할 data |
| | condition | function\|string | N/A | 필터링 조건을 지정합니다. |
| N.data.sort | N/A | N/A | json object array | 지정한 "key" 인수 값을 기준으로 데이터를 정렬합니다. |
| | data | json object array | N/A | 정렬할 data |
| | key | string | N/A | 정렬 기준이 될 object의 프로퍼티 명 |
| | reverse | boolean | N/A | true로 설정하면 내림차순으로 정렬됩니다. |
| N(data).datafilter | N/A | N/A | jQuery object[json object] | N.data.filter 함수를 jQuery 플러그인 방식으로 실행합니다. |
| | condition | function\|string | N/A | N.data.filter의 condition 인수와 같습니다. |
| N(data).datasort | N/A | N/A | jQuery object[json object] | N.data.sort 함수를 jQuery 플러그인 방식으로 실행합니다. |
| | key | string | N/A | N.data.sort의 key 인수와 같습니다. |
| | reverse | boolean | N/A | N.data.sort의 reverse 인수와 같습니다. |

## N.data.filter

`N.data.filter` 함수는 지정된 조건과 일치하는 JSON 객체 배열에서 데이터를 추출합니다.

### 함수 조건 사용하기

함수가 조건으로 지정되면 함수에서 true를 반환하는 행만 필터링된 결과에 포함됩니다:

```javascript
var data = [
    { name: "John", age: 18 },
    { name: "Mike", age: 16 },
    { name: "Mike", age: 14 }
];

var filteredData = N.data.filter(data, function(item) {
    return item.name === "Mike" && item.age === 16;
});

console.log(filteredData); // [{ name: "Mike", age: 16 }]
```

### 문자열 조건 사용하기

조건 문자열을 지정하면 조건과 일치하는 행만 필터링된 결과에 포함됩니다:

```javascript
var data = [
    { name: "John", age: 18 },
    { name: "Mike", age: 16 },
    { name: "Mike", age: 14 }
];

var filteredData = N.data.filter(data, 'name === "Mike"');

console.log(filteredData); // [{ name: "Mike", age: 16 }, { name: "Mike", age: 14 }]
```

> **참고**: 문자열로 조건을 지정하는 것보다 함수로 조건을 처리하는 방식이 더 빠릅니다. 문자열로 조건을 지정하는 방식은 and(&&)나 or(||) 연산식을 지원하지 않고 단일 조건식만 지원합니다.

## N.data.sort

`N.data.sort` 함수는 지정된 속성을 기준으로 JSON 객체 배열을 정렬합니다.

```javascript
var data = [
    { name: "John", age: 18 },
    { name: "Mike", age: 16 },
    { name: "Alex", age: 20 }
];

// 이름별 정렬 (오름차순)
var sortedByName = N.data.sort(data, "name");
console.log(sortedByName);
// [{ name: "Alex", age: 20 }, { name: "John", age: 18 }, { name: "Mike", age: 16 }]

// 나이별 정렬 (내림차순)
var sortedByAgeDesc = N.data.sort(data, "age", true);
console.log(sortedByAgeDesc);
// [{ name: "Alex", age: 20 }, { name: "John", age: 18 }, { name: "Mike", age: 16 }]
```

## jQuery 플러그인 메서드

### N(data).datafilter

`N(data).datafilter` 메서드는 `N.data.filter`의 jQuery 플러그인 버전입니다:

```javascript
var data = [
    { name: "John", age: 18 },
    { name: "Mike", age: 16 },
    { name: "Mike", age: 14 }
];

var filteredData = N(data).datafilter(function(item) {
    return item.age > 15;
});

console.log(filteredData); // [{ name: "John", age: 18 }, { name: "Mike", age: 16 }]
```

### N(data).datasort

`N(data).datasort` 메서드는 `N.data.sort`의 jQuery 플러그인 버전입니다:

```javascript
var data = [
    { name: "John", age: 18 },
    { name: "Mike", age: 16 },
    { name: "Alex", age: 20 }
];

var sortedData = N(data).datasort("name");
console.log(sortedData);
// [{ name: "Alex", age: 20 }, { name: "John", age: 18 }, { name: "Mike", age: 16 }]
```

## 고급 사용 예제

### 필터와 정렬 조합하기

필터와 정렬 작업을 연결하여 더 복잡한 데이터 변환을 만들 수 있습니다:

```javascript
var data = [
    { name: "John", age: 18, active: true },
    { name: "Mike", age: 16, active: false },
    { name: "Alex", age: 20, active: true },
    { name: "Sarah", age: 17, active: true }
];

// 활성 사용자를 필터링하고 나이별로 정렬 (내림차순)
var result = N.data.sort(
    N.data.filter(data, function(item) {
        return item.active === true;
    }), 
    "age", 
    true
);

console.log(result);
// [{ name: "Alex", age: 20, active: true }, 
//  { name: "John", age: 18, active: true }, 
//  { name: "Sarah", age: 17, active: true }]
```

### jQuery 플러그인 체이닝 사용하기

```javascript
var data = [
    { name: "John", age: 18, active: true },
    { name: "Mike", age: 16, active: false },
    { name: "Alex", age: 20, active: true },
    { name: "Sarah", age: 17, active: true }
];

// jQuery 플러그인 메서드 체이닝
var result = N(data)
    .datafilter(function(item) {
        return item.active === true;
    })
    .datasort("name");

console.log(result);
// [{ name: "Alex", age: 20, active: true }, 
//  { name: "John", age: 18, active: true }, 
//  { name: "Sarah", age: 17, active: true }]
```

## 성능 고려사항

- 필터링에는 문자열 조건보다 함수 조건을 사용하는 것이 더 효율적입니다
- 대규모 데이터셋의 경우 정렬해야 하는 항목 수를 줄이기 위해 정렬하기 전에 필터링을 고려하세요
- 여러 작업을 연결할 때는 대규모 데이터셋에 미치는 성능 영향에 주의하세요
