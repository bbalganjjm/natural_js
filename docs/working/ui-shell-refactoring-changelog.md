# UI.Shell 패키지 리팩토링 변경 로그

## 일자
2025-12-16

## 개요
`backup/v1.x/src/natural.ui.shell.js` (1,071 lines)를 `src/ui-shell/` (1,116 lines)로 완전 리팩토링

---

## 주요 변경사항

### 1. 클래스명 변경
- **Before**: `NUS.notify`, `NUS.docs`
- **After**: `Notify`, `Docs`
- **이유**: N 통합 구조 (`N.ui.shell.Notify`, `N.ui.shell.Docs`)

### 2. Import 문 변경
**Before**:
```javascript
import { N } from "./natural.js.js";
import { NC } from "./natural.core.js";
import { NA } from "./natural.architecture.js";
import { NU } from "./natural.ui.js";
```

**After (Notify)**:
```javascript
import { error as createError } from '../../core/helpers/logger.js';
import { isEmptyObject, isWrappedSet } from '../../core/helpers/type-checker.js';
import { startsWith } from '../../core/utils/string.js';
import { maxZindex } from '../../core/utils/element.js';
import { whichTransitionEvent } from '../../core/utils/event.js';
import { get as getMessage } from '../../core/utils/message.js';
import { Context } from '../../architecture/context/context.js';
```

**After (Docs)**:
```javascript
import { error as createError, warn } from '../../core/helpers/logger.js';
import { type as getType } from '../../core/helpers/type-checker.js';
import { trimToZero } from '../../core/utils/string.js';
import { maxZindex } from '../../core/utils/element.js';
import { is as isBrowser } from '../../core/utils/browser.js';
import { whichTransitionEvent, getMaxDuration } from '../../core/utils/event.js';
import { get as getMessage } from '../../core/utils/message.js';
import { Context } from '../../architecture/context/context.js';
import { Controller } from '../../architecture/controller/controller.js';
import { Communicator } from '../../architecture/communication/communicator.js';
import { Request } from '../../architecture/communication/request.js';
```

### 3. 버그 수정 (55개 이상)

#### Notify.js (5개)
| 라인 | Before | After |
|------|--------|-------|
| 42 | NC.isWrappedSet | isWrappedSet |
| 82 | NC.element.maxZindex | maxZindex |
| 111 | NC.string.startsWith | startsWith |
| 127 | NC.message.get | getMessage |
| 143 | NC.event.whichTransitionEvent | whichTransitionEvent |

#### Docs.js (50개 이상)
| 기능 | 변경 수 | 상태 |
|------|---------|------|
| NC.message.get → getMessage | 15곳 | ✅ |
| NC.event.whichTransitionEvent → whichTransitionEvent | 8곳 | ✅ |
| NC.event.getMaxDuration → getMaxDuration | 1곳 | ✅ |
| NC.element.maxZindex → maxZindex | 4곳 | ✅ |
| NC.string.trimToZero → trimToZero | 4곳 | ✅ |
| NC.browser.is → isBrowser | 2곳 | ✅ |
| NC.type → getType | 2곳 | ✅ |
| NC.warn → warn | 4곳 | ✅ |
| NC.error → createError | 1곳 | ✅ |
| NA.context → Context | 8곳 | ✅ |
| NA.comm → Communicator | 3곳 | ✅ |
| NA.cont.trInit → Controller.trInit | 1곳 | ✅ |
| NUS.notify → N().ui.shell.Notify | 1곳 | ✅ |
| NU.ui.draggable → N().ui.draggable | 1곳 | ✅ |
| jQuery 직접 사용 → N() | 40곳 | ✅ |
| N() 직접 사용 → N()() | 40곳 | ✅ |

### 4. jQuery 직접 사용 → N() 런타임 import
**Before** (여러 곳):
```javascript
jQuery(window)
jQuery(document)
jQuery("<div></div>")
jQuery(".selector")
```

**After**:
```javascript
const N = () => window.N;

N()(window)
N()(document)
N()("<div></div>")
N()(".selector")
```

---

## 함수/메서드 매핑

### Notify
| 원본 (NUS.notify) | 리팩토링 (Notify) | 상태 |
|------------------|-------------------|------|
| `constructor()` | `constructor()` | ✅ |
| `static add()` | `static add()` | ✅ |
| `static wrapEle()` | `static wrapEle()` | ✅ |
| `context()` | `context()` | ✅ |
| `add()` | `add()` | ✅ |
| `remove()` | `remove()` | ✅ |

### Docs
| 원본 (NUS.docs) | 리팩토링 (Docs) | 상태 |
|----------------|-----------------|------|
| `constructor()` | `constructor()` | ✅ |
| `static createLoadIndicator()` | `static createLoadIndicator()` | ✅ |
| `static updateLoadIndicator()` | `static updateLoadIndicator()` | ✅ |
| `static removeLoadIndicator()` | `static removeLoadIndicator()` | ✅ |
| `static errorLoadIndicator()` | `static errorLoadIndicator()` | ✅ |
| `static wrapEle()` | `static wrapEle()` | ✅ |
| `static wrapScroll()` | `static wrapScroll()` | ✅ |
| `static clearScrollPosition()` | `static clearScrollPosition()` | ✅ |
| `static loadContent()` | `static loadContent()` | ✅ |
| `static closeBtnControl()` | `static closeBtnControl()` | ✅ |
| `static inactivateTab()` | `static inactivateTab()` | ✅ |
| `static activateTab()` | `static activateTab()` | ✅ |
| `static showTabContents()` | `static showTabContents()` | ✅ |
| `static hideTabContents()` | `static hideTabContents()` | ✅ |
| `static remove()` | `static remove()` | ✅ |
| `context()` | `context()` | ✅ |
| `add()` | `add()` | ✅ |
| `active()` | `active()` | ✅ |
| `removeState()` | `removeState()` | ✅ |
| `remove()` | `remove()` | ✅ |
| `doc()` | `doc()` | ✅ |
| `cont()` | `cont()` | ✅ |
| `reload()` | `reload()` | ✅ |

---

## 파일 구조 변경

### Before
```
backup/v1.x/src/
└── natural.ui.shell.js (1,071 lines)
```

### After
```
src/ui-shell/
├── index.js (7 lines)
├── notify/
│   └── notify.js (155 lines)
└── docs/
    └── docs.js (961 lines)
```

---

## N.js 통합

### src/N.js 변경

**Import 추가**:
```javascript
// UI Shell
import { Notify } from './ui-shell/notify/notify.js';
import { Docs } from './ui-shell/docs/docs.js';
```

**Static Property 추가**:
```javascript
// Static Properties - UI Shared
static ui = class {
    static shell = class {
        static Notify = Notify;
        static Docs = Docs;
    };
    // ... other ui properties
};
```

**Prototype Method 추가**:
```javascript
// Prototype Methods - UI Shell
notify(opts) {
    return new Notify(this, opts);
}

docs(opts) {
    return new Docs(this, opts);
}
```

---

## API 변경 요약

### 공개 API (호환 유지)
- ✅ `N().notify(opts)` / `N.ui.shell.Notify`
- ✅ `N().docs(opts)` / `N.ui.shell.Docs`
- ✅ 모든 메서드 시그니처 유지
- ✅ 모든 옵션 유지

### 내부 API (모듈 import로 변경)
- `NC.isWrappedSet` → `isWrappedSet`
- `NC.message.get` → `getMessage`
- `NC.element.maxZindex` → `maxZindex`
- `NC.event.whichTransitionEvent` → `whichTransitionEvent`
- `NC.event.getMaxDuration` → `getMaxDuration`
- `NC.string.startsWith` → `startsWith`
- `NC.string.trimToZero` → `trimToZero`
- `NC.browser.is` → `isBrowser`
- `NC.type` → `getType`
- `NC.warn` → `warn`
- `NC.error` → `createError`
- `NA.context` → `Context`
- `NA.comm` → `Communicator`
- `NA.cont.trInit` → `Controller.trInit`
- `NUS.notify` → `N().ui.shell.Notify`
- `NU.ui.draggable` → `N().ui.draggable`
- `N(...)` → `N()(...)`
- `jQuery(...)` → `N()(...)`

---

## 테스트 영향도

### 변경 필요
- ❌ 없음 (공개 API 호환)

### 사용 예시 (변경 없음)
```javascript
// Notify
// Before
N().notify({ ... }).add("메시지");

// After (동일)
N().notify({ ... }).add("메시지");

// Docs
// Before
N("#container").docs({ ... }).add("id", "name", { ... });

// After (동일)
N("#container").docs({ ... }).add("id", "name", { ... });
```

---

## 브레이킹 체인지
**없음** - 모든 공개 API 호환성 유지

---

## 다음 단계
- ✅ UI.Shell 완료
- ✅ 6개 주요 패키지 모두 완료

---

## 참고
- 원본: `backup/v1.x/src/natural.ui.shell.js`
- 리팩토링: `src/ui-shell/notify/notify.js`, `src/ui-shell/docs/docs.js`
- 통합: `src/ui-shell/index.js`, `src/N.js`

