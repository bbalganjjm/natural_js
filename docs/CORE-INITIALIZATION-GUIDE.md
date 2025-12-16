# Core 패키지 초기화 가이드

Natural-JS Core 패키지는 **N.js에서 자동으로 초기화**됩니다. 이 가이드는 초기화 과정과 내부 구조를 설명합니다.

## 개요

Core 패키지의 초기화는 `src/N.js`에서 자동으로 수행됩니다:

1. **`applyJQueryExtensions()`** - jQuery 프로토타입 확장 (자동)
2. **`initRegexpFilter()`** - jQuery regexp filter selector 확장 (자동)
3. **`initDateFormatter()`** - Date.prototype.formatDate 확장 (자동)

**개발자는 별도의 초기화 코드를 작성할 필요가 없습니다.**

## 초기화 함수 상세

### 1. applyJQueryExtensions()

**위치**: `src/core/extensions/jquery-extensions.js`

**역할**: jQuery.fn에 Natural-JS 전용 메서드를 추가합니다.

**추가되는 메서드**:
- `remove_(idx, length)` - 배열에서 요소 제거
- `tpBind(eventName, handler)` - 최우선 순위로 이벤트 바인딩
- `instance(name, instance)` - 컴포넌트 인스턴스 get/set
- `vals(vals)` - select/checkbox/radio 요소의 값 get/set
- `events(eventName, namespace)` - 바인딩된 이벤트 조회

**초기화**: `src/N.js`에서 자동 호출 (Line 59)

**사용 예시**:
```javascript
// N.js import 시 자동으로 초기화됨
import N from './N.js';

// 이후 N() 또는 jQuery()에서 사용 가능
N('.grid').instance('grid');
jQuery('input[name="agree"]').vals();
```

---

### 2. initRegexpFilter()

**위치**: `src/core/extensions/jquery-regexp-filter.js`

**역할**: jQuery selector에 `:regexp()` 의사 선택자를 추가하여 정규식 기반 요소 필터링을 지원합니다.

**지원되는 필터 타입**:
- **기본 속성**: `attribute, regexp`
- **Data 속성**: `data:propertyName, regexp`
- **Class 속성**: `class, regexp`
- **CSS 속성**: `css:propertyName, regexp`

**초기화**: `src/N.js`에서 자동 호출 (Line 60)

**사용 예시**:
```javascript
// N.js import 시 자동으로 초기화됨
import N from './N.js';

// 이후 N() 또는 jQuery()에서 사용 가능
N('div:regexp(class, ^prefix.*)');                    // class가 "prefix"로 시작하는 div
jQuery('input:regexp(data:validation, ^required)');   // data-validation이 "required"로 시작
N('span:regexp(css:color, ^rgb)');                    // color CSS가 "rgb"로 시작
jQuery('[data-role]:regexp(data-role, ^(admin|manager))'); // data-role이 admin 또는 manager
```

---

### 3. initDateFormatter()

**위치**: `src/core/utils/date.js`

**역할**: Date.prototype에 `formatDate()` 메서드를 추가하여 PHP 스타일의 날짜 포맷팅을 지원합니다.

**지원되는 포맷**:
- `Y`, `y` - 년도
- `m`, `n`, `M`, `F` - 월
- `d`, `j`, `D`, `l` - 일
- `H`, `h`, `G`, `g` - 시간
- `i` - 분
- `s` - 초
- `a`, `A` - am/pm
- 기타 PHP date() 함수 호환 포맷

**초기화**: `src/N.js`에서 자동 호출 (Line 61)

**사용 예시**:
```javascript
// N.js import 시 자동으로 초기화됨
import N from './N.js';

// 이후 모든 Date 객체에서 사용 가능
const now = new Date();
now.formatDate("Y-m-d H:i:s");  // "2025-12-16 14:30:00"
now.formatDate("D, M d Y");     // "Mon, Dec 16 2025"
now.formatDate("Y년 m월 d일");   // "2025년 12월 16일"
```

---

## 자동 초기화

Natural-JS는 `src/N.js`에서 자동으로 Core 패키지를 초기화합니다:

```javascript
// src/N.js (자동 초기화 부분)

// Apply global extensions
applyJQueryExtensions();    // Line 59
initRegexpFilter();         // Line 60
initDateFormatter();        // Line 61

// Inject Context to locale helper
setLocaleContext(Context);  // Line 64
```

### 개발자가 할 일

**없습니다.** Natural-JS를 import하면 자동으로 초기화됩니다:

```javascript
// ESM
import N from 'natural-js';

// CommonJS
const N = require('natural-js');

// 이미 모든 Core 기능이 활성화되어 사용 가능
N('.grid').instance('grid');
N('div:regexp(class, ^test)').addClass('matched');
new Date().formatDate("Y-m-d");
N.locale();  // 현재 locale 조회
```

---

## Context 주입 패턴 (내부 구조)

많은 Core 유틸리티는 `N.context`에 의존합니다. `src/N.js`에서 자동으로 context를 주입합니다:

```javascript
// src/N.js에서 자동으로 수행 (Line 64)
setLocaleContext(Context);

// 기타 context 주입은 각 모듈에서 getContext() 함수를 통해 동적으로 처리
```

개발자는 이 과정을 신경 쓸 필요가 없으며, `N.locale()`, `N.string`, `N.date` 등의 API를 바로 사용할 수 있습니다.

---

## 브라우저 환경에서의 사용

```html
<!DOCTYPE html>
<html>
<head>
    <script src="lib/jquery-3.7.1.min.js"></script>
    <script type="module">
        // Natural-JS import 시 자동 초기화
        import N from './dist/natural.mjs';
        
        // 바로 사용 가능
        N('.grid').instance('grid', gridInstance);
        N('div:regexp(class, ^test)').addClass('matched');
        new Date().formatDate("Y-m-d");
        N.locale("ko_KR");
    </script>
</head>
<body>
    <!-- content -->
</body>
</html>
```

---

## Node.js 환경에서의 사용

```javascript
// ESM
import N from 'natural-js';

// CommonJS
const N = require('natural-js');

// 자동 초기화 완료, 바로 사용 가능
N('.grid').instance('grid');
N.locale();
```

---

## 주의사항

### 1. jQuery 의존성
- Natural-JS는 jQuery 3.x 이상이 필요합니다.
- jQuery를 Natural-JS보다 **먼저** 로드해야 합니다.

### 2. 자동 초기화
- Natural-JS를 import하면 **자동으로 모든 Core 기능이 초기화**됩니다.
- 별도의 초기화 코드가 필요하지 않습니다.

### 3. TypeScript 지원
- 모든 API는 타입 정의가 제공됩니다.
- `N.locale()`, `N.string`, `N.date` 등의 형태로 타입 안전하게 사용 가능합니다.

### 4. 글로벌 export
- 브라우저 환경에서는 `window.N`으로도 접근 가능합니다.

---

## 문제 해결

### jQuery 확장 메서드가 작동하지 않음
```javascript
// 원인: jQuery가 로드되지 않았거나 Natural-JS보다 늦게 로드됨
// 해결: jQuery를 먼저 로드
<script src="jquery-3.7.1.min.js"></script>
<script type="module" src="natural.mjs"></script>
```

### N is not defined 오류
```javascript
// 원인: Natural-JS가 import되지 않음
// 해결: import 추가
import N from 'natural-js';

// 또는 브라우저에서
<script src="natural.min.js"></script>
// window.N으로 접근 가능
```

### locale 값이 변경되지 않음
```javascript
// 올바른 사용법
N.locale("ko_KR");  // setter
const current = N.locale();  // getter

// Context를 통한 접근도 가능
N.context.attr("core").locale = "ko_KR";
```

---

## 참고 자료

- [Core 패키지 구조](./project-structure.instructions.mdc)
- [타입 정의](../@types/index.d.ts)
- [Core 리팩토링 검토](./working/core-refactoring-review.md)
- [Natural-JS 공식 문서](https://bbalganjjm.github.io/natural_js/)

