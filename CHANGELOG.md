# Changelog

All notable changes to Natural-JS will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed
- Natural-UI CSS 클래스 누락 보완 (grid 고정 헤더/컬럼, tab link, form invalid, checked row 등)으로 신규 TypeScript 컴포넌트와 스타일 일치
- 스타일 로딩 순서 안내 추가 (`tokens.css` → `light.css`/`dark.css` → `natural.ui.css`)로 테마 변수 초기화 문제 예방

## [2.0.0-alpha.0] - 2024-12-05

### 🚀 Major Changes

#### Complete TypeScript Rewrite
- **전체 코드베이스를 TypeScript로 재작성** - strict mode 적용
- **jQuery 의존성 완전 제거** - 네이티브 DOM API 및 fetch API 사용
- **ESM(ES Modules) 전환** - CommonJS 지원 중단
- **SSR(Server-Side Rendering) 지원** - 서버 및 클라이언트 양쪽에서 실행 가능

#### New Monorepo Structure
- `@natural-js/shared` - 공유 유틸리티 및 환경 감지
- `@natural-js/core` - 핵심 유틸리티 (string, date, array, json, browser, event, message, mask, type, element, gc)
- `@natural-js/architecture` - CVC 아키텍처 (Communicator, Controller, Context, AOP)
- `@natural-js/data` - 데이터 처리 (Formatter, Validator, DataSync)
- `@natural-js/ui` - UI 컴포넌트 (Alert, Button, Datepicker, Popup, Tab, Select, Form, List, Grid, Pagination, Tree)
- `@natural-js/ui-shell` - Shell 컴포넌트 (Notify, Documents)
- `@natural-js/template` - AOP 템플릿 처리
- `@natural-js/code` - 코드 검사 도구
- `@natural-js/natural` - 통합 패키지 및 레거시 API 래퍼

### ✨ New Features

#### Shared Module (`@natural-js/shared`)
- `isServer()`, `isBrowser()` - 환경 감지 유틸리티
- `getDocument()`, `getWindow()`, `getNavigator()`, `getLocation()` - 안전한 전역 객체 접근
- `NaturalElement` 클래스 - jQuery 대체 DOM 추상화 계층
  - 체이닝 API 지원
  - CSS 선택자 기반 요소 선택
  - 이벤트 위임 지원
  - 속성/스타일/클래스 조작
  - DOM 탐색 (find, parent, children, siblings, closest)

#### Core Module (`@natural-js/core`)
- **String Utilities**: `contains`, `startsWith`, `endsWith`, `insertAt`, `removeWhitespace`, `lpad`, `rpad`, `isEmpty`, `byteLength`, `trimToEmpty`, `trimToNull`, `trimToUndefined`, `trimToZero`, `trimToVal`
- **Date Utilities**: `formatDate` (PHP 스타일 40+ 포맷 문자 지원), `diff`, `strToDateStrArr`, `strToDate`, `format`, `dateToTs`, `tsToDate`, `dateList`
- **Array Utilities**: `deduplicate`, `uniqueArray`, `intersection`, `difference`, `flatten`, `groupBy`, `chunk`
- **JSON Utilities**: `parse`, `stringify`, `formatJSON`, `deepClone`, `merge`, `pick`, `omit`, `deepEqual`
- **Browser Utilities**: `getCookie`, `setCookie`, `cookie`, `removeCookie`, `msieVersion`, `is`, `contextPath`, `scrollbarWidth`, `isTouchDevice`, `viewportInfo`
- **Event Utilities**: `isNumberKey`, `isCtrlKey`, `isShiftKey`, `isAltKey`, `isFnKey`, `isEnterKey`, `keyCode`, `preventDefault`, `stopPropagation`, `windowScrollLock`, `detectCSSTransitionEnd`, `detectCSSAnimationEnd`
- **Message Utilities**: `replaceMsgVars`, `get`, `has`, `getLocales`, `create`, `getAll`
- **Mask Class**: 일반/숫자 입력 마스킹, 복합 포맷 규칙 지원
- **Type Utilities**: `type`, `isString`, `isNumeric`, `isPlainObject`, `isArray`, `isFunction`, `isEmptyObject`, `isArraylike`, `isNaturalElement`
- **Element Utilities**: `toOpts`, `toRules`, `toData`, `maxZindex`, `closest`, `matches`
- **GC Utilities**: `minimum`, `full`, `registerEvent`, `unregisterEvents`
- **defineConfig()** - 타입 안전 설정 헬퍼

#### Architecture Module (`@natural-js/architecture`)
- **NaturalHttpClient** - fetch 기반 HTTP 클라이언트
  - 요청/응답 인터셉터
  - 요청 취소 (AbortController)
  - 타임아웃 설정
  - 자동 JSON 파싱
- **FilterChain** - Communication Filter 시스템
  - `beforeInit`, `afterInit`, `beforeSend`, `success`, `error`, `complete` 필터
  - 필터 체인 순차 실행
- **Communicator** - N.comm() API 구현
  - `submit()`, `error()` 메서드
  - HTML 페이지 로드 및 Controller init 자동 실행
- **Request** - 요청 객체 관리
  - `attr()`, `removeAttr()`, `param()`, `get()`, `reload()` 메서드
- **Controller** - N.cont() API 구현
  - init 트리거 및 view 바인딩
  - data-pageid 속성 자동 설정
- **Context** - N.context API 구현
  - 전역 설정 저장소
  - `attr()` 메서드로 설정 접근
- **AOP** - Aspect-Oriented Programming
  - `before`, `after`, `around`, `error` advice 타입
  - 포인트컷 매칭

#### Data Module (`@natural-js/data`)
- **Formatter** - 데이터 포맷팅
  - `commas`, `rrn`, `ssn`, `kbrn`, `kcn`, `upper`, `lower`, `capitalize`, `date`, `time`, `phone`, `mask`, `generic`, `numeric` 등
  - `format()`, `unformat()` 메서드
- **Validator** - 데이터 검증
  - `required`, `alphabet`, `integer`, `korean`, `email`, `url`, `date`, `time`, `phone`, `rrn`, `regexp` 등
  - `validate()` 메서드 및 ValidationResult 반환
- **DataSync** - 컴포넌트 간 데이터 동기화
  - Observable 패턴 기반
  - `instance()`, `remove()`, `notify()` 메서드

#### UI Module (`@natural-js/ui`)
- **Alert** - 메시지 다이얼로그
  - `show()`, `hide()`, `remove()` 메서드
  - confirm, prompt 모드
  - 드래그 가능
- **Button** - 버튼 컴포넌트
  - `enable()`, `disable()`, `context()` 메서드
- **Datepicker** - 날짜 선택기
  - 월/연도 선택 지원
  - 다국어 지원
  - 날짜 범위 제한
- **Popup** - 레이어 팝업
  - modal/non-modal 모드
  - `open()`, `close()`, `remove()` 메서드
- **Tab** - 탭 컴포넌트
  - 동적 탭 추가/제거
  - `open()`, `disable()`, `enable()` 메서드
- **Select** - 선택 컴포넌트
  - select, checkbox, radio 지원
  - `bind()`, `val()`, `index()`, `reset()` 메서드
- **Form** - 폼 컴포넌트
  - 데이터 바인딩
  - `val()`, `data()`, `validate()`, `update()` 메서드
- **List** - 리스트 컴포넌트
  - 템플릿 기반 행 렌더링
  - 양방향 데이터 바인딩
  - `bind()`, `add()`, `remove()`, `select()`, `check()` 메서드
- **Grid** - 그리드 컴포넌트
  - 고정 헤더/열
  - 컬럼 리사이즈
  - 정렬/필터링
  - `bind()`, `add()`, `remove()`, `select()`, `check()`, `sort()`, `filter()` 메서드
- **Pagination** - 페이지네이션
  - `bind()`, `totalCount()`, `pageNo()` 메서드
- **Tree** - 트리 컴포넌트
  - 계층 데이터 표시
  - 노드 확장/축소
  - `bind()`, `expand()`, `collapse()` 메서드

#### UI.Shell Module (`@natural-js/ui-shell`)
- **Notify** - 토스트 알림
  - `info()`, `success()`, `warning()`, `error()` 정적 메서드
  - 자동 사라짐
- **Documents** - MDI 문서 관리자
  - 탭 기반 페이지 관리
  - `add()`, `remove()`, `get()` 메서드

#### Template Module (`@natural-js/template`)
- 공통 코드 자동 바인딩 (`p.select.*`)
- 컴포넌트 초기화 (`p.*`)
- 이벤트 바인딩 (`e.*`)

#### Code Module (`@natural-js/code`)
- 정적 코드 분석
- 선택자 컨텍스트 누락 감지
- `val()` 메서드 잘못된 사용 감지

### 🔧 Configuration Changes

#### New Configuration System
- **defineConfig()** 헬퍼 함수
- **타입 안전** 설정 옵션
- **fromLegacyConfig()** - 기존 설정 변환 유틸리티
- **createPreset()** - 프리셋 생성 유틸리티

```typescript
// natural.config.ts
import { defineConfig } from '@natural-js/core';

export default defineConfig({
  core: { locale: 'ko_KR' },
  architecture: { page: { context: '#contents' } },
  ui: { alert: { container: '#contents' } }
});
```

### 📦 Build System

- **pnpm workspace** 기반 모노레포
- **tsup** 빌드 도구
- **Vitest** 테스트 프레임워크
- **ESLint + Prettier** 코드 품질 도구

### 🧪 Testing

- 전체 모듈 단위 테스트
- 통합 테스트 (`__tests__/integration`)
- 80%+ 코드 커버리지 목표

### 📚 Documentation

- 마이그레이션 가이드 (`docs/MIGRATION-GUIDE.md`)
- API 레퍼런스 (개별 모듈별)
- 개발자 가이드 (기존 문서 유지)

### ⚠️ Breaking Changes

1. **jQuery 제거** - jQuery 의존 코드는 네이티브 API로 변경 필요
2. **ES Modules 전용** - CommonJS `require()` 사용 불가
3. **strict null checks** - null/undefined 처리 강화
4. **설정 파일 형식** - `natural.config.js` → `natural.config.ts` (선택사항)

### 🔄 Migration

기존 Natural-JS 1.x 프로젝트는 `@natural-js/natural` 패키지의 레거시 래퍼를 통해 점진적으로 마이그레이션할 수 있습니다.

```typescript
// 레거시 호환 모드
import { N } from '@natural-js/natural';

// 기존 코드 그대로 사용 가능
N('.selector').cont({ ... });
```

자세한 내용은 [마이그레이션 가이드](docs/MIGRATION-GUIDE.md)를 참조하세요.

---

## [1.x] - Previous Versions

이전 버전 히스토리는 [GitHub Releases](https://github.com/bbalganjjm/natural_js/releases)를 참조하세요.

