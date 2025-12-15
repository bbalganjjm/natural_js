# Changelog

Natural-JS v2.0.0 변경 로그

## [2.0.0] - 2024-12-12

### 🎉 주요 변경사항

#### 네임스페이스 통합
**BREAKING CHANGE**: NC, NA, ND, NU, NUS, NCD, NT → N 단일 네임스페이스로 통합

- ❌ `NC.string.trimToEmpty()` → ✅ `N.string.trimToEmpty()`
- ❌ `NA.comm()` → ✅ `N.comm()`
- ❌ `ND.formatter()` → ✅ `N.formatter()`
- ❌ `NU.form` → ✅ `N.form`
- ❌ `NUS.notify` → ✅ `N.notify`

**jQuery 체이닝은 동일**: `N("#id").form()`, `N("#grid").grid()`

#### 빌드 시스템 현대화
- ❌ Shell 스크립트 (`compiler/*.sh`) 제거
- ✅ NPM scripts + tsup 빌드 시스템 도입
- ✅ 빌드 시간: 30초 → 1초 (30배 향상)
- ✅ HMR 지원 (`npm run dev`)

#### 모듈 구조 개선
- 8개 monolithic 파일 → 50개 모듈로 분리
- Feature 기반 디렉토리 구조
- Tree-shaking 최적화
- 명확한 의존성 관리

### ✨ Added

**빌드 스크립트**:
- `npm run dev` - Watch 모드 (HMR)
- `npm run build` - ES6 빌드 (CJS, ESM, IIFE)
- `npm run build:prod` - Production 빌드 (최적화)
- `npm run build:es5` - ES5/IE11 빌드
- `npm run clean` - dist/ 정리
- `npm run migrate` - v1.x → v2.0 자동 마이그레이션
- `npm run type-check` - TypeScript 타입 체크

**빌드 산출물**:
- `dist/natural.js` - CJS (358KB)
- `dist/natural.mjs` - ESM (358KB)
- `dist/natural.min.js` - IIFE (377KB)
- `dist/natural.es5.min.js` - IIFE ES5 (209KB)
- 개별 패키지 번들 (core, architecture, data, ui, ui-shell)

**타입 정의**:
- `@types/index.d.ts` 단일 파일로 통합 (9,489줄)
- N 네임스페이스로 통합

**문서**:
- `docs/MIGRATION.md` - 마이그레이션 가이드
- `CHANGELOG.md` - 변경 로그
- `test-browser-integration.html` - 브라우저 테스트

### 🔄 Changed

**디렉토리 구조**:
```
src/
├── core/              (15 files, 1,450 lines)
│   ├── helpers/       - TypeChecker, Logger, SerialExecute
│   ├── utils/         - String, Date, Element, Browser, Message, Array, JSON, Event, Mask
│   ├── extensions/    - jQuery extensions
│   └── gc/            - Garbage Collector
├── architecture/      (6 files, 320 lines)
│   ├── communication/ - Fetch, Communicator, Request
│   ├── controller/    - Controller
│   └── context/       - Context
├── data/              (5 files, 345 lines)
│   ├── sync/          - DataSync
│   ├── formatter/     - Formatter
│   ├── validator/     - Validator
│   └── filters/       - DataFilter
├── ui/                (17 files, 9,500+ lines)
│   ├── shared/        - Iteration, Draggable, UIUtils, Scroll
│   └── components/    - Form, Grid, List, Alert, Button, Popup, Tab, Datepicker, Select, Pagination, Tree
├── ui-shell/          (3 files, 1,100 lines)
│   ├── notify/        - Notify
│   └── docs/          - Docs
├── code/              (2 files, 200 lines)
│   └── inspection.js  - Code inspection
├── template/          (2 files, 400 lines)
│   └── aop.js         - Template AOP
├── N.js               - Main unified class
└── index.js           - Entry point
```

**빌드 설정**:
- `tsup.config.ts` - ES6/ES2015 빌드
- `tsup.config.es5.ts` - ES5/IE11 빌드

### 📦 Dependencies

**추가**:
- `tsup@^8.0.1` - 빌드 도구
- `esbuild@^0.19.0` - 번들러 (tsup 내부)
- `@swc/core@^1.3.100` - Transpiler
- `typescript@^5.3.3` - 타입 체크

**유지**:
- `jquery@^3.7.1` - Peer dependency

### 🗑️ Deprecated & Removed

**완전 제거**:
- ❌ `NC` namespace
- ❌ `NA` namespace
- ❌ `ND` namespace
- ❌ `NU` namespace (정적 사용만)
- ❌ `NUS` namespace
- ❌ `NCD` namespace
- ❌ `NT` namespace
- ❌ `compiler/*.sh` - Shell 빌드 스크립트
- ❌ 개별 `@types/*.d.ts` - 타입 정의 파일들

## 성능 개선

- **빌드 시간**: 30초 → 1초 (30배 향상)
- **번들 크기**: 280KB → 377KB (Full 기능 유지)
- **ES5 번들**: 260KB → 209KB (-20%, 최적화)
- **모듈 수**: 8개 → 50개 (모듈화)

## 호환성

### 유지되는 것
- ✅ jQuery 3.7.1
- ✅ ES5+ 지원 (IE11 포함)
- ✅ 모든 컴포넌트 기능 (Grid 고정컬럼, 병합 등)
- ✅ 모든 API 메서드
- ✅ 이벤트 핸들러
- ✅ 옵션 구조
- ✅ jQuery 체이닝

### 변경되는 것
- ⚠️ NC/NA/ND/NU/NUS → N 네임스페이스
- ⚠️ Import 방식 변경 (개별 파일 → 단일 패키지)

## 마이그레이션 도구

### 자동 마이그레이션
```bash
npm run migrate -- --backup
```

### 수동 마이그레이션
IDE 검색/바꾸기 (정규식):
- `\bNC\.` → `N.`
- `\bNA\.` → `N.`
- `\bND\.` → `N.`
- `\bNU\.` → `N.`
- `\bNUS\.` → `N.`

## 예제

### Before (v1.x)
```javascript
NC.string.trimToEmpty(str);
NA.comm({ url: "/api/data" }).submit(function(data) {
    ND.formatter(rules).format(data);
    N("#grid").grid({ data: data });
});

const alert = new NU.alert(N(window), "Hello");
const notify = new NUS.notify("top", { message: "Success" });
```

### After (v2.0)
```javascript
N.string.trimToEmpty(str);
N.comm({ url: "/api/data" }).submit(function(data) {
    N.formatter(rules).format(data);
    N("#grid").grid({ data: data });
});

const alert = new N.alert(N(window), "Hello");
const notify = new N.notify("top", { message: "Success" });
```

## 문의

- GitHub Issues: https://github.com/bbalganjjm/natural_js/issues
- Email: bbalganjjm@gmail.com
