# Template 패키지 리팩토링 변경 로그

## 일자
2025-12-16

## 개요
`backup/v1.x/src/natural.template.js` (392 lines)를 `src/architecture/controller/template-aop.js`로 완전 리팩토링 및 **Architecture 패키지로 이동**

---

## 🎯 주요 결정: 패키지 위치 변경

### Before (잘못된 위치)
```
src/template/
├── aop.js (392 lines)
└── index.js
```

### After (올바른 위치)
```
src/architecture/controller/
├── controller.js
├── aop.js (메서드 AOP)
└── template-aop.js (392 lines) ✅
```

### 이동 이유
1. **역할**: Controller 초기화 보조 기능
2. **호출**: Controller.trInit()에서 호출
3. **관심사**: Architecture 영역
4. **의존성**: Controller, Context와 밀접

---

## 주요 변경사항

### 1. 클래스명 변경
- **Before**: `NT.aop`
- **After**: `TemplateAOP`
- **이유**: N 통합 구조 (`N.template`)

### 2. Import 문 변경
**Before**:
```javascript
import { N } from "./natural.js.js";
import { NC } from "./natural.core.js";
import { NA } from "./natural.architecture.js";
```

**After**:
```javascript
import { error as createError, warn } from '../../core/helpers/logger.js';
import { type as getType } from '../../core/helpers/type-checker.js';
import { startsWith } from '../../core/utils/string.js';
import { is as isBrowser } from '../../core/utils/browser.js';
import { get as getMessage } from '../../core/utils/message.js';
import { Context } from '../context/context.js';
```

### 3. 버그 수정 (8곳)
**Before**:
```javascript
throw createError(NC.message.get(Context.attr("template").message, "MSG-0001"));
```

**After**:
```javascript
throw createError(getMessage(Context.attr("template").message, "MSG-0001"));
```

### 4. jQuery 직접 사용 → N() 런타임 import (20곳)
**Before**:
```javascript
jQuery(selectList).each(...)
jQuery().select(opts)
jQuery("[id='...']", cont.view)
```

**After**:
```javascript
N()(selectList).each(...)
N()().select(opts)
N()("[id='...']", cont.view)
```

### 5. StringUtils/BrowserUtils 사용
**Before**:
```javascript
NC.string.startsWith(prop, "p.")
NC.browser.is("ie")
```

**After**:
```javascript
startsWith(prop, "p.")
isBrowser("ie")
```

---

## 함수/메서드 매핑

| 원본 (NT.aop) | 리팩토링 (TemplateAOP) | 상태 |
|---------------|------------------------|------|
| `NT.aop.codes()` | `TemplateAOP.codes()` | ✅ |
| `NT.aop.template()` | `TemplateAOP.template()` | ✅ |
| `NT.aop.components()` | `TemplateAOP.components()` | ✅ |
| `NT.aop.events()` | `TemplateAOP.events()` | ✅ |

---

## 버그 수정 상세

### 1. NC.message.get() 참조 오류 (8곳)
| 파일 | 라인 | Before | After |
|------|------|--------|-------|
| codes() | 81 | NC.message.get | getMessage |
| codes() | 118 | NC.message.get | getMessage |
| codes() | 127 | NC.message.get | getMessage |
| codes() | 144 | NC.message.get | getMessage |
| components() | 303 | NC.message.get | getMessage |
| components() | 306 | NC.message.get | getMessage |
| events() | 325 | NC.message.get | getMessage |
| events() | 383 | NC.message.get | getMessage |

### 2. jQuery 직접 사용 (20곳)
| 함수 | 변경 수 | 상태 |
|------|---------|------|
| codes() | 8곳 | ✅ |
| template() | 1곳 | ✅ |
| components() | 6곳 | ✅ |
| events() | 5곳 | ✅ |

---

## 파일 구조 변경

### 삭제된 파일
- `src/template/aop.js` ❌
- `src/template/index.js` ❌

### 생성된 파일
- `src/architecture/controller/template-aop.js` ✅

### 수정된 파일
- `src/architecture/index.js` (export 추가)
- `src/N.js` (import 및 static 프로퍼티 추가)

---

## Architecture 패키지 통합

### src/architecture/index.js 변경
**추가**:
```javascript
export { TemplateAOP } from './controller/template-aop.js';
```

### src/architecture/controller/ 구조
```
controller/
├── controller.js (Controller 클래스)
├── aop.js (메서드 AOP)
└── template-aop.js (컴포넌트/이벤트 AOP) ✅
```

---

## N.js 통합

### src/N.js 변경

**Import 추가**:
```javascript
import { TemplateAOP } from './architecture/controller/template-aop.js';
```

**Static Property 추가**:
```javascript
// Static Properties - Template
static template = TemplateAOP;
```

---

## API 변경 요약

### 공개 API (호환 유지)
- ✅ `N.template.codes(cont, joinPoint)`
- ✅ `N.template.template(cont, joinPoint)`
- ✅ `N.template.components(cont, prop, compActionDefer)`
- ✅ `N.template.events(cont, prop)`

### 내부 API (모듈 import로 변경)
- `NC.message.get` → `getMessage`
- `NC.string.startsWith` → `startsWith`
- `NC.browser.is` → `isBrowser`
- `NC.type` → `getType`
- `NC.error` → `createError`
- `NC.warn` → `warn`
- `NA.context` → `Context`
- `N(...)` → `N()(...)` (런타임)
- `jQuery(...)` → `N()(...)`

---

## 테스트 영향도

### 변경 필요
- ❌ 없음 (공개 API 호환)

### 사용 예시 (변경 없음)
```javascript
// Controller 정의
const controller = {
    "p.form.userForm": { ... },
    "p.grid.userList": { ... },
    "e.btnSearch.click": function() { ... }
};

// Before
N(".view").cont(controller);

// After (동일)
N(".view").cont(controller);
```

---

## 브레이킹 체인지
**없음** - 모든 공개 API 호환성 유지

---

## 다음 단계
- ✅ Template 완료 (Architecture로 통합)
- ✅ 5개 주요 패키지 모두 완료

---

## 참고
- 원본: `backup/v1.x/src/natural.template.js`
- 리팩토링: `src/architecture/controller/template-aop.js`
- 통합: `src/architecture/index.js`, `src/N.js`
- 삭제: `src/template/` 폴더

