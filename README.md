# Natural-JS

[![NPM Version](https://img.shields.io/npm/v/@bbalganjjm/natural_js.svg)](https://www.npmjs.com/package/@bbalganjjm/natural_js)
[![License](https://img.shields.io/badge/license-LGPL%20v2.1-blue.svg)](https://www.gnu.org/licenses/old-licenses/lgpl-2.1.html)

Natural-JS는 jQuery 기반의 강력하고 유연한 JavaScript UI/Architecture 프레임워크입니다.

## ✨ v2.0 주요 변경사항

- 🎯 **네임스페이스 통합**: NC/NA/ND/NU/NUS → `N` 단일 네임스페이스
- ⚡ **빌드 시스템 현대화**: Shell 스크립트 → tsup (30배 빠름)
- 📦 **모듈 구조 개선**: 8개 파일 → 50개 모듈
- 🔄 **자동 마이그레이션**: `npm run migrate`
- ✅ **100% 기능 유지**: 모든 컴포넌트 및 API

## 설치

```bash
npm install @bbalganjjm/natural_js jquery
```

## 빠른 시작

### Browser (CDN)

```html
<script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
<script src="dist/natural.min.js"></script>

<script>
// Core utilities
const trimmed = N.string.trimToEmpty('  test  ');
console.log(N.type([])); // "array"

// UI Components
N("#myForm").form({ data: [{ name: "John", age: 25 }] });
N("#myGrid").grid({ 
    data: [...],
    height: 300,
    sortable: true
});

// Communication
N.comm({ url: "/api/data" }).submit(function(data) {
    console.log("Data received:", data);
});
</script>
```

### Node.js (CommonJS)

```javascript
const N = require('@bbalganjjm/natural_js');

// Core utilities  
N.string.trimToEmpty('  test  ');
N.date.format(new Date(), 'yyyy-MM-dd');

// Data processing
N.formatter(rules).format(data);
N.validator(rules).validate(data);
```

### ES Modules

```javascript
import N from '@bbalganjjm/natural_js';

// Same as above
N.string.trimToEmpty('  test  ');
```

## 주요 기능

### Core Utilities
- **N.string**: 문자열 처리 (trimToEmpty, contains, etc.)
- **N.date**: 날짜 처리 (format, strToDate, etc.)
- **N.type**: 타입 체크 (type, isString, isArray, etc.)
- **N.element**: DOM 요소 처리
- **N.browser**: 브라우저 정보
- **N.array**: 배열 처리
- **N.json**: JSON 처리
- **N.event**: 이벤트 처리

### Architecture
- **N.comm**: Ajax 통신 (Communication Filter 지원)
- **N.fetch**: Fetch API wrapper
- **N.cont**: Controller (CVC 패턴)
- **N.context**: 애플리케이션 Context

### Data
- **N.ds**: DataSync (양방향 데이터 바인딩)
- **N.formatter**: 데이터 포맷팅
- **N.validator**: 데이터 유효성 검사
- **N.data**: 데이터 필터링/정렬

### UI Components
- **N.form**: 폼 데이터 바인딩
- **N.grid**: 그리드 (테이블, 고정컬럼, 정렬, 필터링)
- **N.list**: 리스트 (단일 컬럼)
- **N.select**: 셀렉트 박스
- **N.pagination**: 페이지네이션
- **N.tree**: 트리 (계층형 데이터)
- **N.alert**: 알림 대화상자
- **N.button**: 버튼 스타일링
- **N.popup**: 팝업
- **N.tab**: 탭
- **N.datepicker**: 날짜 선택기

### UI Shell
- **N.notify**: 전역 알림
- **N.docs**: MDI/SDI 문서 컨테이너

## 사용 예시

### Form 컴포넌트
```javascript
const data = [{ name: "John", age: 25, email: "john@example.com" }];

N(data).form({
    context: N("#myForm"),
    validate: true,
    onBind: function(context, data, row) {
        console.log("Form bound:", data);
    }
}).bind();
```

### Grid 컴포넌트
```javascript
N(data).grid({
    context: N("#myGrid"),
    height: 300,
    fixedcol: 2,
    sortable: true,
    multiselect: true,
    onSelect: function(row, rowEle, rowData) {
        console.log("Selected row:", row, rowData);
    }
}).bind();
```

### Communication
```javascript
N.comm({ 
    url: "/api/users",
    type: "GET",
    dataType: "json"
}).submit(function(data) {
    N("#userGrid").grid({ data: data }).bind();
});
```

### Data Formatting & Validation
```javascript
// Formatting
const formatted = N.formatter.trimToEmpty("  test  "); // "test"
N(data).formatter({
    name: ["upper"],
    age: ["trimToZero"]
}).format();

// Validation
const result = N.validator.required("value"); // true/false
N(data).validator({
    name: [["required"], ["minlength", 2]],
    email: [["required"], ["email"]]
}).validate();
```

## 빌드

```bash
# Development (watch mode)
npm run dev

# Production build
npm run build

# ES5 build (IE11)
npm run build:es5

# Clean
npm run clean
```

## 마이그레이션 (v1.x → v2.0)

자동 마이그레이션 도구 사용:

```bash
npm run migrate -- --backup
```

자세한 내용은 [MIGRATION.md](docs/MIGRATION.md)를 참고하세요.

## 문서

- [마이그레이션 가이드](docs/MIGRATION.md)
- [변경 로그](CHANGELOG.md)
- [API 문서](https://bbalganjjm.github.io/natural_js)

## 브라우저 지원

- Chrome (최신)
- Firefox (최신)
- Safari (최신)
- Edge (최신)
- IE11 (ES5 빌드)

## 라이선스

LGPL v2.1

## 작성자

Goldman Kim (bbalganjjm@gmail.com)

## 기여

Issues와 Pull Requests는 언제나 환영합니다!

- GitHub: https://github.com/bbalganjjm/natural_js
- Issues: https://github.com/bbalganjjm/natural_js/issues
