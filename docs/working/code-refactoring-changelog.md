# Code 패키지 리팩토링 변경 로그

## 일자
2025-12-16

## 개요
`backup/v1.x/src/natural.code.js` (198 lines)를 `src/code` 패키지로 완전 리팩토링

---

## 파일 구조 변경

### Before
```
backup/v1.x/src/
└── natural.code.js (198 lines)
    └── NCD 클래스
```

### After
```
src/code/
├── inspection.js (198 lines)
│   └── Code 클래스
└── index.js (6 lines)
```

---

## 주요 변경사항

### 1. 클래스명 변경
- **Before**: `NCD`
- **After**: `Code`
- **이유**: N 통합 구조 (`N.code`)

### 2. Import 문 변경
**Before**:
```javascript
import { N } from "./natural.js.js";
import { NC } from "./natural.core.js";
import { NA } from "./natural.architecture.js";
```

**After**:
```javascript
import { error as createError, warn, log } from '../core/helpers/logger.js';
import { isEmpty, startsWith, trimToEmpty } from '../core/utils/string.js';
import { is as isBrowser } from '../core/utils/browser.js';
import { get as getMessage } from '../core/utils/message.js';
import { Context } from '../architecture/context/context.js';
```

### 3. severityLevels 구현
**Before**:
```javascript
static severityLevels = Object.freeze({
    BLOCKER: ["Blocker", "darkred", NC.error],
    CRITICAL: ["Critical", "red", NC.error],
    MAJOR: ["Major", "orange", NC.warn],
    MINOR: ["Minor", "black", NC.log]
});
```

**After**:
```javascript
static severityLevels = Object.freeze({
    BLOCKER: ["Blocker", "darkred", createError],
    CRITICAL: ["Critical", "red", createError],
    MAJOR: ["Major", "orange", warn],
    MINOR: ["Minor", "black", log]
});
```

### 4. inspection.test() 구현
**변경사항**:
- `NA.context` → `Context`
- `NC.error` → `createError`
- `N(rules)` → `N()(rules)` (런타임 import)

### 5. inspection.rules 구현
**NoContextSpecifiedInSelector**:
- `NC.string.startsWith` → `startsWith`
- `NC.string.trimToEmpty` → `trimToEmpty`
- `NC.warn` → `warn`
- `NCD.severityLevels` → `Code.severityLevels`
- `NC.message.get` → `getMessage`

**UseTheComponentsValMethod**:
- `NC.string.isEmpty` → `isEmpty`
- `NC.string.startsWith` → `startsWith`
- `NC.warn` → `warn`
- `NCD.severityLevels` → `Code.severityLevels`
- `NC.message.get` → `getMessage`

### 6. inspection.report.console 구현
**변경사항**:
- `NCD.severityLevels` → `Code.severityLevels`
- `NA.context` → `Context`
- `NC.browser.is` → `isBrowser`
- `N(data)` → `N()(data)` (런타임 import)

### 7. addSourceURL() 구현
**변경사항**: 없음 (순수 문자열 처리)

---

## N.js 통합

### src/N.js 변경

**Import 추가**:
```javascript
// Code
import { Code } from './code/inspection.js';
```

**Static Property 추가**:
```javascript
// Static Properties - Code
static code = Code;
```

---

## 함수/메서드 매핑

| 원본 (NCD) | 리팩토링 (Code) | 상태 |
|-----------|----------------|------|
| `NCD.severityLevels` | `Code.severityLevels` | ✅ |
| `NCD.inspection.test()` | `Code.inspection.test()` | ✅ |
| `NCD.inspection.rules` | `Code.inspection.rules` | ✅ |
| `NCD.inspection.report.console()` | `Code.inspection.report.console()` | ✅ |
| `NCD.addSourceURL()` | `Code.addSourceURL()` | ✅ |

---

## 의존성 변경

### Before (natural.code.js)
```javascript
import { N } from "./natural.js.js";
import { NC } from "./natural.core.js";
import { NA } from "./natural.architecture.js";
```

### After (inspection.js)
```javascript
// Core
import { error, warn, log } from '../core/helpers/logger.js';
import { isEmpty, startsWith, trimToEmpty } from '../core/utils/string.js';
import { is } from '../core/utils/browser.js';
import { get } from '../core/utils/message.js';

// Architecture
import { Context } from '../architecture/context/context.js';
```

---

## API 변경 요약

### 공개 API (호환 유지)
- ✅ `N.code.severityLevels`
- ✅ `N.code.inspection.test(codes, rules)`
- ✅ `N.code.inspection.rules`
- ✅ `N.code.inspection.report.console(data, url)`
- ✅ `N.code.addSourceURL(codes, sourceURL)`

### 내부 API (모듈 import로 변경)
- `NC.error` → `createError`
- `NC.warn` → `warn`
- `NC.log` → `log`
- `NC.string.*` → `StringUtils.*`
- `NC.browser.is` → `isBrowser`
- `NC.message.get` → `getMessage`
- `NA.context` → `Context`

---

## 테스트 영향도

### 변경 필요
- ❌ 없음 (공개 API 호환)

### 사용 예시 (변경 없음)
```javascript
// Before
const report = N.code.inspection.test(codes);
N.code.inspection.report.console(report, url);

// After (동일)
const report = N.code.inspection.test(codes);
N.code.inspection.report.console(report, url);
```

---

## 브레이킹 체인지
**없음** - 모든 공개 API 호환성 유지

---

## 다음 단계
- ✅ Code 패키지 완료
- ⬜ Template 패키지 검토 예정

---

## 참고
- 원본: `backup/v1.x/src/natural.code.js`
- 리팩토링: `src/code/inspection.js`
- 통합: `src/N.js`

