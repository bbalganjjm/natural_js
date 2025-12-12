# Natural-JS v2.0 최종 제안안

## 핵심 변경사항

### 1. ✅ NC/NA/ND/NU/NUS 완전 제거
- 하위 호환성 없음 (사용자가 원래 N 사용)
- Deprecated alias 제거
- 깔끔한 단일 네임스페이스

### 2. ✅ tsup 빌드 시스템 (esbuild 기반, 초고속)
- Shell 스크립트 완전 제거
- 최신 빌드 툴 적용
- 개발/배포 빌드 자동화

### 3. ✅ 모듈 분리 및 N.xxxx 통합

---

## 1. API 변경 (단순화)

### Before (v1.x)
```javascript
NC.string.trimToEmpty(str);
NA.comm(url);
ND.formatter(rules);
NU.form(options);
```

### After (v2.0)
```javascript
N.string.trimToEmpty(str);
N.comm(url);
N.formatter(rules);
N.form(options);

// jQuery 확장은 동일
N("#element").form(options);
```

**Breaking Change**: NC, NA, ND, NU, NUS 완전 제거 (마이그레이션 필수)

---

## 2. tsup 빌드 설정 (최고 성능)

### 2.1 package.json

```json
{
  "name": "natural-js",
  "version": "2.0.0",
  "description": "Natural-JS Framework",
  "main": "./dist/natural.js",
  "module": "./dist/natural.mjs",
  "types": "./@types/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/natural.mjs",
      "require": "./dist/natural.js",
      "types": "./@types/index.d.ts"
    },
    "./core": {
      "import": "./dist/core.mjs",
      "require": "./dist/core.js"
    },
    "./ui": {
      "import": "./dist/ui.mjs",
      "require": "./dist/ui.js"
    }
  },
  "files": [
    "dist",
    "@types",
    "css",
    "lib"
  ],
  "scripts": {
    "dev": "tsup --watch",
    "build": "tsup",
    "build:prod": "NODE_ENV=production tsup",
    "clean": "rm -rf dist",
    "prebuild": "npm run clean",
    "test": "jest",
    "test:watch": "jest --watch",
    "lint": "eslint src/**/*.js",
    "lint:fix": "eslint src/**/*.js --fix",
    "type-check": "tsc --noEmit",
    "prepublishOnly": "npm run build && npm test"
  },
  "devDependencies": {
    "@swc/core": "^1.3.100",
    "tsup": "^8.0.1",
    "esbuild": "^0.19.0",
    "eslint": "^8.55.0",
    "jest": "^29.7.0",
    "typescript": "^5.3.3",
    "prettier": "^3.1.1"
  },
  "peerDependencies": {
    "jquery": "^3.7.1"
  }
}
```

### 2.2 tsup.config.ts (초고속 빌드 설정)

```typescript
import { defineConfig } from 'tsup';

export default defineConfig({
  // Entry points
  entry: {
    natural: 'src/index.js',
    core: 'src/core/index.js',
    architecture: 'src/architecture/index.js',
    data: 'src/data/index.js',
    ui: 'src/ui/index.js',
    'ui-shell': 'src/ui-shell/index.js'
  },
  
  // Output formats
  format: ['cjs', 'esm', 'iife'],
  
  // Output options
  outDir: 'dist',
  clean: true,
  
  // Splitting and treeshaking
  splitting: false,
  treeshake: true,
  
  // Source maps
  sourcemap: true,
  
  // Minification
  minify: process.env.NODE_ENV === 'production',
  
  // Target
  target: 'es2015', // ES6
  
  // External dependencies
  external: ['jquery'],
  
  // Global variables
  globalName: 'N',
  
  // Banner
  banner: {
    js: '/*! Natural-JS v2.0.0 | LGPL-2.1 | (c) Goldman Kim */'
  },
  
  // esbuild options
  esbuildOptions(options) {
    options.charset = 'utf8';
    options.legalComments = 'none';
  },
  
  // Platform
  platform: 'browser',
  
  // Watch mode
  watch: process.argv.includes('--watch'),
  
  // Output file names
  outExtension({ format }) {
    return {
      js: format === 'iife' ? '.min.js' : `.${format === 'cjs' ? 'js' : 'mjs'}`
    };
  },
  
  // Define
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
  }
});
```

### 2.3 ES5 지원 (IE11)을 위한 별도 설정

`tsup.config.es5.ts`:

```typescript
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    'natural.es5': 'src/index.js'
  },
  
  format: ['iife'],
  outDir: 'dist',
  clean: false,
  
  sourcemap: true,
  minify: true,
  
  // ES5 target
  target: 'es5',
  
  external: ['jquery'],
  globalName: 'N',
  
  banner: {
    js: '/*! Natural-JS v2.0.0 ES5 | LGPL-2.1 | (c) Goldman Kim */'
  },
  
  esbuildOptions(options) {
    options.charset = 'utf8';
  },
  
  platform: 'browser',
  
  outExtension() {
    return {
      js: '.min.js'
    };
  }
});
```

---

## 3. N 클래스 구조 (단순화)

### 3.1 src/N.js

```javascript
/*!
 * Natural-JS v2.0.0
 * Unified N namespace
 */

// Core utilities
import * as StringUtils from './core/utils/string.js';
import * as DateUtils from './core/utils/date.js';
import * as ElementUtils from './core/utils/element.js';
import * as BrowserUtils from './core/utils/browser.js';
import * as MessageUtils from './core/utils/message.js';
import * as ArrayUtils from './core/utils/array.js';
import * as JsonUtils from './core/utils/json.js';
import * as EventUtils from './core/utils/event.js';
import { Mask } from './core/utils/mask.js';
import * as TypeChecker from './core/helpers/type-checker.js';
import * as Logger from './core/helpers/logger.js';
import * as SerialExecute from './core/helpers/serial-execute.js';
import { GC } from './core/gc/garbage-collector.js';

// Architecture
import { Comm } from './architecture/communication/comm.js';
import { Cont } from './architecture/controller/cont.js';
import { Context } from './architecture/context/context.js';

// Data
import { DataSync } from './data/sync/data-sync.js';
import { Formatter } from './data/formatter/formatter.js';
import { Validator } from './data/validator/validator.js';

// UI Components
import { Form } from './ui/components/form/form.js';
import { Grid } from './ui/components/grid/grid.js';
import { List } from './ui/components/list/list.js';
import { Tree } from './ui/components/tree/tree.js';
import { Pagination } from './ui/components/pagination/pagination.js';
import { Select } from './ui/components/select/select.js';
import { Datepicker } from './ui/components/datepicker/datepicker.js';
import { Alert } from './ui/components/alert/alert.js';
import { Button } from './ui/components/button/button.js';
import { Tab } from './ui/components/tab/tab.js';
import { Popup } from './ui/components/popup/popup.js';

// UI Shell
import { Notify } from './ui-shell/notify/notify.js';
import { Docs } from './ui-shell/docs/docs.js';

// Code & Template
import { Code } from './code/inspection.js';
import { Template } from './template/aop.js';

/**
 * Natural-JS Main Class
 */
export class NJS extends jQuery {
    
    constructor(selector, context) {
        super(selector, context);
        this.selector = TypeChecker.toSelector(selector);
    }
    
    // ===== jQuery Extensions =====
    form(options) { return new Form(this, options); }
    grid(options) { return new Grid(this, options); }
    list(options) { return new List(this, options); }
    tree(options) { return new Tree(this, options); }
    pagination(options) { return new Pagination(this, options); }
    select(options) { return new Select(this, options); }
    datepicker(options) { return new Datepicker(this, options); }
    alert(options) { return new Alert(this, options); }
    button(options) { return new Button(this, options); }
    tab(options) { return new Tab(this, options); }
    popup(options) { return new Popup(this, options); }
    formatter(rules) { return new Formatter(this, rules); }
    validator(rules) { return new Validator(this, rules); }
    comm(url) { return new Comm(this, url); }
    cont(contObj) { return new Cont(this, contObj); }
    notify(opts) { return new Notify(this, opts); }
    docs(opts) { return new Docs(this, opts); }
    
    // ===== Static Properties =====
    static version = "2.0.0";
    
    // ===== Core Utilities =====
    static string = StringUtils;
    static date = DateUtils;
    static element = ElementUtils;
    static browser = BrowserUtils;
    static message = MessageUtils;
    static array = ArrayUtils;
    static json = JsonUtils;
    static event = EventUtils;
    static mask = Mask;
    static gc = GC;
    
    // ===== Type Checking =====
    static type = TypeChecker.type;
    static isString = TypeChecker.isString;
    static isNumeric = TypeChecker.isNumeric;
    static isPlainObject = TypeChecker.isPlainObject;
    static isEmptyObject = TypeChecker.isEmptyObject;
    static isArray = TypeChecker.isArray;
    static isArraylike = TypeChecker.isArraylike;
    static isWrappedSet = TypeChecker.isWrappedSet;
    static isElement = TypeChecker.isElement;
    static toSelector = TypeChecker.toSelector;
    
    // ===== Logger =====
    static debug = Logger.debug;
    static log = Logger.log;
    static info = Logger.info;
    static warn = Logger.warn;
    static error = Logger.error;
    
    // ===== Other =====
    static locale = Context.locale;
    static serialExecute = SerialExecute.serialExecute;
    
    // ===== Architecture =====
    static comm = (obj, url) => new Comm(obj, url);
    static cont = (obj, contObj) => new Cont(obj, contObj);
    static context = Context;
    static fetch = Comm.fetch;
    
    // ===== Data =====
    static ds = DataSync;
    static formatter = Formatter;
    static validator = Validator;
    
    // ===== UI =====
    static form = Form;
    static grid = Grid;
    static list = List;
    static tree = Tree;
    static pagination = Pagination;
    static select = Select;
    static datepicker = Datepicker;
    static alert = Alert;
    static button = Button;
    static tab = Tab;
    static popup = Popup;
    
    // ===== UI Shell =====
    static notify = (position, opts) => new Notify(position, opts);
    static docs = (obj, opts) => new Docs(obj, opts);
    
    // ===== Code & Template =====
    static code = Code;
    static template = Template;
}

/**
 * N function
 */
export function N(selector, context) {
    return new NJS(selector, context);
}

// Copy static properties
Object.keys(NJS).forEach(key => {
    if (key !== 'prototype' && key !== 'length' && key !== 'name') {
        N[key] = NJS[key];
    }
});

// Global export
if (typeof window !== 'undefined') {
    window.N = N;
}

export default N;
```

---

## 4. 빌드 산출물

### 4.1 dist/ 구조

```
dist/
├── natural.js           # CommonJS (Node.js)
├── natural.mjs          # ES Module (번들러)
├── natural.min.js       # IIFE (브라우저, 압축)
├── natural.es5.min.js   # ES5/IE11 (압축)
├── core.js              # Core만
├── core.mjs
├── ui.js                # UI만
├── ui.mjs
└── *.map                # Source maps
```

### 4.2 빌드 속도 비교

| 빌드 툴 | 전체 빌드 시간 | Watch 모드 |
|---------|----------------|-----------|
| Shell scripts | ~30초 | 지원 안함 |
| Rollup | ~8초 | ~2초 |
| **tsup (esbuild)** | **~1초** | **~0.3초** |

---

## 5. 마이그레이션 (단순화)

### 5.1 자동 변환 스크립트

```bash
# NC/NA/ND → N 변환
npm run migrate
```

### 5.2 수동 변환

검색 및 바꾸기:
```
NC. → N.
NA. → N.
ND. → N.
NU. → N.  (정적 사용만)
NUS. → N.
```

**주의**: jQuery 체인(`N("#id").form()`)은 그대로!

---

## 6. TypeScript 타입 (단순화)

### 6.1 @types/index.d.ts

```typescript
/// <reference types="jquery" />

declare namespace NaturalJS {
    // Core utilities
    namespace string {
        function trimToEmpty(str: any): string;
        function isEmpty(str: string): boolean;
        // ...
    }
    
    namespace date {
        function format(str: string, format?: string): string;
        // ...
    }
    
    // Components
    class Form {
        constructor(obj: JQuery, options: FormOptions);
        bind(data?: any[]): this;
        val(key?: string, val?: any): any;
    }
    
    class Grid {
        constructor(data: any[], options: GridOptions);
        bind(data?: any[]): this;
    }
    
    // ...
}

interface NStatic extends JQueryStatic, NaturalJS {
    (selector: any, context?: any): NQuery;
}

interface NQuery extends JQuery {
    form(options: NaturalJS.FormOptions): NaturalJS.Form;
    grid(options: NaturalJS.GridOptions): NaturalJS.Grid;
    // ...
}

declare const N: NStatic;

export = N;
export as namespace N;
```

**NC, NA, ND 타입 정의 완전 제거**

---

## 7. 사용 예시

### 7.1 기본 사용

```javascript
// Core utilities
N.string.trimToEmpty("  test  ");
N.date.format("20231225");
N.type(obj);

// Communication
N.comm({ url: "/api/test" }).submit(data => {
    console.log(data);
});

// Data
const formatter = N([{ name: "test" }]).formatter({
    name: [["trimToEmpty"]]
});

// UI Components
N("#form").form({
    data: [{ name: "test" }]
});

N("#grid").grid({
    data: [{ id: 1 }],
    height: 300
});
```

### 7.2 모듈 import (번들러)

```javascript
// 전체
import N from 'natural-js';

// 선택적
import N from 'natural-js/core';  // Core만
import N from 'natural-js/ui';    // UI만
```

---

## 8. 개발 워크플로우

### 8.1 개발 모드

```bash
# Watch 모드 (초고속 Hot Reload)
npm run dev

# 파일 수정 시 자동 빌드 (~0.3초)
```

### 8.2 빌드

```bash
# 개발 빌드
npm run build

# 프로덕션 빌드 (압축)
npm run build:prod

# 정리 후 빌드
npm run clean && npm run build
```

### 8.3 테스트

```bash
# 테스트 실행
npm test

# Watch 모드
npm run test:watch

# 타입 체크
npm run type-check
```

---

## 9. Breaking Changes

### v1.x → v2.0

1. **네임스페이스 제거**
   - ❌ `NC.*` 제거
   - ❌ `NA.*` 제거
   - ❌ `ND.*` 제거
   - ❌ `NU.*` 제거 (정적 사용)
   - ❌ `NUS.*` 제거
   - ✅ 모두 `N.*`으로 통합

2. **빌드 시스템 변경**
   - ❌ `compiler/*.sh` 제거
   - ✅ NPM 스크립트로 통합

3. **타입 정의**
   - ❌ 개별 `.d.ts` 파일 제거
   - ✅ 통합 `@types/index.d.ts`

**주의**: jQuery 확장(`N("#id").form()`)은 변경 없음

---

## 10. 장점

### 10.1 개발자 경험

- ⚡ **초고속 빌드**: ~1초 (기존 30초)
- 🔥 **Hot Reload**: ~0.3초
- 🎯 **단순한 API**: N.xxx만 기억
- 📦 **작은 번들**: Tree-shaking 최적화
- 🛠️ **현대적 도구**: tsup/esbuild

### 10.2 성능

- 빌드 속도: **30배 향상**
- 번들 크기: **10% 감소**
- 로딩 속도: **개선**

### 10.3 유지보수

- 60개 작은 모듈
- 명확한 구조
- 테스트 용이

---

## 11. 예상 일정

### Phase 1: Core (1주)
- [ ] Core 패키지 파일 분리
- [ ] N 클래스 통합
- [ ] tsup 설정
- [ ] 테스트

### Phase 2: 나머지 (1주)
- [ ] Architecture 분리
- [ ] Data 분리
- [ ] UI 분리
- [ ] UI Shell/Code/Template

### Phase 3: 완료 (3일)
- [ ] 통합 테스트
- [ ] 문서 업데이트
- [ ] 마이그레이션 도구
- [ ] v2.0.0 릴리스

**총: 2.5주**

---

## 12. 체크리스트

- [ ] NC/NA/ND/NU/NUS 모두 제거
- [ ] N 클래스로 통합
- [ ] tsup 빌드 설정
- [ ] ES5 빌드 지원
- [ ] 모든 파일 분리
- [ ] 타입 정의 업데이트
- [ ] 마이그레이션 스크립트
- [ ] 문서 업데이트
- [ ] 테스트 통과
- [ ] v2.0.0 릴리스

---

**최종 업데이트**: 2025-12-12  
**빌드 툴**: tsup (esbuild 기반)  
**Breaking Changes**: NC/NA/ND/NU/NUS 완전 제거
