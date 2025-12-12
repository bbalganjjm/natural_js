# Natural-JS `any` 사용 현황 맵핑

> 작성일: 2025-12-12
> 목적: 타입 안전성 강화를 위한 any 사용 위치 및 개선 우선순위 파악

## 요약

- **총 `any` 사용 횟수**: 127개
- **파일 수**: 11개
- **개선 목표**: 127개 → ~30개 (75% 감소)

---

## 파일별 분포

| 파일 | any 횟수 | 우선순위 | 비고 |
|-----|---------|---------|------|
| natural.core.d.ts | 40 | 높음 | 외부 경계, 로깅 함수 |
| natural.ui.d.ts | 49 | 중간 | 내부 구현 세부사항 많음 |
| natural.architecture.misc.d.ts | 7 | 높음 | 옵션 객체, Controller |
| natural.ui.misc.d.ts | 6 | 중간 | 옵션 데이터 |
| natural.ui.shell.d.ts | 4 | 중간 | Request 관련 |
| natural.architecture.d.ts | 9 | 높음 | Communicator, Context |
| natural_js-tests.ts | 3 | 낮음 | 테스트 코드 |
| natural.js.d.ts | 3 | 높음 | 글로벌 API |
| natural.template.misc.d.ts | 4 | 낮음 | 선택적 모듈 |
| natural.ui.shell.misc.d.ts | 1 | 낮음 | 주석만 |
| natural.template.d.ts | 1 | 낮음 | 선택적 모듈 |

---

## 1. natural.core.d.ts (40개) - 우선순위: 높음

### 외부 경계 API (개선 권장)

#### 1.1 remove_ 메서드
```typescript
// Line 8, 12
remove_(idx: any, length: number): NC;
```
**문제**: `idx`가 any
**실제 구현**: number | T (배열 요소 타입)
**개선안**: `idx: number | unknown`

#### 1.2 tpBind 메서드
```typescript
// Line 22
tpBind(eventName: string, eventHandler: JQuery.EventHandler<HTMLElement, any>): NC;
```
**문제**: jQuery 이벤트 핸들러의 데이터 타입이 any
**개선안**: `JQuery.EventHandler<HTMLElement, unknown>`

#### 1.3 로깅 함수들 (높은 우선순위)
```typescript
// Lines 158, 163, 167, 172, 176, 181, 185, 190
static debug(...obj: any): Console;
static log(...obj: any): Console;
static info(...obj: any): Console;
static warn(...obj: any): Console;
```
**문제**: 가변 인자가 any
**실제 사용**: console에 전달되는 임의의 값
**개선안**: `...obj: unknown[]`

#### 1.4 타입 체크 함수들
```typescript
// Lines 209, 214, 218, 223, 227, 232, 237, 242, 251, 255, 260, 265, 270, 274, 279, 283, 288
static type(obj: any): NC.ObjectType | string;
static isString(obj: any): boolean;
static isNumeric(obj: any): boolean;
static isPlainObject(obj: any): boolean;
static isEmptyObject(obj: any): boolean;
static isArray(obj: any): boolean;
static isArraylike(obj: any): boolean;
static isWrappedSet(obj: any): boolean;
static isElement(obj: any): boolean;
```
**문제**: 모든 타입 체크 함수가 `obj: any`
**실제**: 타입을 체크하는 함수이므로 any가 타당할 수도 있음
**개선안**: `obj: unknown` (더 안전)

#### 1.5 toSelector
```typescript
// Line 292
static toSelector(el: NJS<HTMLElement[]> | HTMLElement | HTMLElement[] | any): string;
```
**문제**: 마지막 fallback이 any
**개선안**: `| unknown` 또는 제거

#### 1.6 serialExecute
```typescript
// Line 307
static serialExecute(...args: unknown[]): JQuery.Deferred<any>[];
```
**문제**: Deferred 타입이 any
**개선안**: `JQuery.Deferred<unknown>[]`

### 주석 내 any (개선 불필요)
- Line 331, 387, 880: 주석 내에서 "any"라는 단어 사용 (타입이 아님)

**개선 우선순위**:
1. 🔴 로깅 함수 (debug/log/info/warn) - 4개
2. 🔴 타입 체크 함수들 - 9개
3. 🟡 remove_, tpBind - 2개
4. 🟡 serialExecute Deferred - 1개

---

## 2. natural.ui.d.ts (49개) - 우선순위: 중간

### 내부 구현 세부사항 (대부분 낮은 우선순위)

#### 2.1 내부 유틸 객체
```typescript
// Lines 157-174
render: (i: any, limit: any, delay: any, lastIdx: any, callType: any) => void;
select: (compNm: any) => void;
checkAll: (compNm: any) => void;
// ... 등등
```
**문제**: 내부 구현 세부사항이 타입 정의에 노출됨
**실제**: 사용자가 직접 호출하지 않는 내부 API
**개선안**: 
- 옵션 A: private 인터페이스로 분리
- 옵션 B: 구체적 타입 지정
- 옵션 C: unknown으로 변경

#### 2.2 공개 API (개선 권장)
```typescript
// Line 232
createContents(): any;

// Line 260
popOpen(onOpenData: any, cont: NA.Objects.Controller.Object): void;

// Lines 536, 542, 546, 552, 578, 585, 601
open(onOpenData?: any): NU.Popup;
close(onCloseData?: any): NU.Popup;
open(idx: number, onOpenData?: any, isFirst?: boolean): NU.Tab;
```
**문제**: 이벤트 데이터가 any
**실제**: 사용자가 전달하는 임의의 데이터
**개선안**: `unknown` (타입 가드 필요)

#### 2.3 tableCells
```typescript
// Line 359
tableCells(tbl: any, opt_cellValueGetter: any): any[][];
```
**문제**: 모든 파라미터가 any
**개선안**: 구체적 타입 지정 필요

**개선 우선순위**:
1. 🟡 open/close 이벤트 데이터 - 8개
2. 🟢 내부 유틸 - 나머지 (낮은 우선순위)

---

## 3. natural.architecture.misc.d.ts (7개) - 우선순위: 높음

### 옵션 객체 및 Controller

#### 3.1 Request 인터페이스
```typescript
// Line 6
interface Request extends Omit<JQuery.Ajax.AjaxSettingsBase<any>, ...> {
```
**문제**: jQuery Ajax의 제네릭이 any
**개선안**: `JQuery.Ajax.AjaxSettingsBase<unknown>`

#### 3.2 주석 내 설명
Lines 12, 30, 52, 149: 주석에서 "any"라는 단어 사용 (타입이 아님)

#### 3.3 콜백 함수
```typescript
// Line 123
(this: NA.Objects.Controller.Object, onOpenData?: any): void;
```
**문제**: 이벤트 데이터가 any
**개선안**: `unknown`

#### 3.4 Controller.BaseObject
```typescript
// Line 207
interface BaseObject {
    [key: string]: any;
    ...
}
```
**문제**: 인덱서 시그니처가 any
**실제**: 사용자 정의 속성 허용
**개선안**: `[key: string]: unknown` (명시적 속성 뒤에 위치)

**개선 우선순위**:
1. 🔴 BaseObject 인덱서 - 1개 (높음)
2. 🟡 Request 제네릭 - 1개
3. 🟡 콜백 데이터 - 1개

---

## 4. natural.architecture.d.ts (9개) - 우선순위: 높음

### Communicator 및 Context API

```typescript
// Line 218
attr(name: string): any;

// Line 241
attr(name: string, obj: any): NA.Communicator;

// Line 274
get(key: string): any;

// Lines 359, 363
attr(name: string): any;

// Line 373
attr(name: string, obj: any): NA.Context;
```

**문제**: 속성 값이 any
**실제**: 설정 값 저장/조회
**개선안**: 
- `attr(name: string): unknown`
- `attr(name: string, obj: unknown): NA.Communicator`

**개선 우선순위**: 🔴 높음 (외부 API)

---

## 5. natural.ui.misc.d.ts (6개) - 우선순위: 중간

### 옵션 데이터

```typescript
// Line 1159
onOpenData?: any;

// Line 1222
onCloseData?: any;

// Line 2764 (주석)
"Elements with readonly or disabled attributes do not accept any values."

// Lines 3368, 3371, 3379
(this: NA.Objects.Controller.Object, onOpenData?: any): void;
(this: NU.Popup, onCloseData?: any): void;
(this: NA.Objects.Controller.Object, onOpenData?: any): void;
```

**개선안**: `onOpenData?: unknown`, `onCloseData?: unknown`

**개선 우선순위**: 🟡 중간

---

## 6. natural.js.d.ts (3개) - 우선순위: 높음

### 글로벌 API

```typescript
// Line 9
declare function N(selector?: NC.Selector, context?: ...): NJS<any>;

// Line 25
[index: number]: T extends Array<any> ? T[number] : never;

// Line 37
const version: NJS<any>["version"];
```

**문제**: 제네릭 타입이 any
**개선안**:
- `NJS<HTMLElement>` 또는 `NJS<any>` 유지 (현재 구현상 타당할 수 있음)
- `T extends Array<infer U> ? U : never` (infer 사용)

**개선 우선순위**: 🔴 높음 (핵심 API)

---

## 7. natural.ui.shell.d.ts (4개) - 우선순위: 중간

```typescript
// Line 269
attr(name: string, obj?: any): DocumentsRequest;

// Line 302
get(key: string): any;
```

**개선안**: `obj?: unknown`, `any → unknown`

---

## 8. natural_js-tests.ts (3개) - 우선순위: 낮음

```typescript
// Lines 11-12
NC.serialExecute(function(a: any) {
}, function(b: any, c: any) {
```

**비고**: 테스트 코드, 개선 불필요 (실제 사용 예시)

---

## 9. 선택적 모듈 (template, code) - 우선순위: 낮음

### natural.template.d.ts (1개)
```typescript
// Line 5
components(cont: ..., prop: string, compActionDefer: JQuery.Deferred<any>[]): void;
```

### natural.template.misc.d.ts (4개)
```typescript
// Lines 7, 13, 116, 156
action?: string | [string, ...any[]];
(this: HTMLElement, e: JQuery.Event, ...args: any[]): void;
[K in `c.${string}`]: (...args: any[]) => NA.Communicator;
```

### natural.ui.shell.misc.d.ts (1개)
Line 321: 주석 내 "any" 단어

---

## 개선 로드맵

### Phase 1: 외부 경계 API (우선순위 높음) - 30개
- [x] natural.core.d.ts
  - [ ] 로깅 함수 (debug/log/info/warn) → unknown[] (4개)
  - [ ] 타입 체크 함수 → unknown (9개)
  - [ ] remove_, tpBind → unknown (2개)
  - [ ] serialExecute Deferred → unknown (1개)

- [x] natural.js.d.ts
  - [ ] NJS 인덱서 → infer U (1개)
  - [ ] N() 반환 타입 검토 (1개)

- [x] natural.architecture.d.ts
  - [ ] attr, get → unknown (6개)

- [x] natural.architecture.misc.d.ts
  - [ ] BaseObject 인덱서 → unknown (1개)
  - [ ] Request 제네릭 → unknown (1개)
  - [ ] 콜백 데이터 → unknown (1개)

**소계**: ~27개

### Phase 2: 옵션 및 이벤트 데이터 (우선순위 중간) - 20개
- [x] natural.ui.d.ts
  - [ ] open/close 이벤트 데이터 → unknown (8개)
  - [ ] createContents, popOpen → unknown (2개)

- [x] natural.ui.misc.d.ts
  - [ ] onOpenData, onCloseData → unknown (6개)

- [x] natural.ui.shell.d.ts
  - [ ] attr, get → unknown (4개)

**소계**: ~20개

### Phase 3: 내부 구현 (우선순위 낮음) - 나머지
- [x] natural.ui.d.ts 내부 유틸 (~40개)
- [x] 선택적 모듈 (~5개)
- [x] 테스트 코드 (유지)

**목표**: Phase 1-2 완료 시 any 사용 127개 → ~80개 (37% 감소)
**최종 목표**: ~30개 (75% 감소)는 Phase 3 일부 포함 필요

---

## 우선순위 기준

### 🔴 높음 (즉시 개선)
- 외부 경계 공개 API
- 사용자가 직접 호출하는 함수
- 타입 안전성에 큰 영향
- 예: 로깅 함수, Controller.BaseObject, N()

### 🟡 중간 (2차 개선)
- 옵션 객체 속성
- 이벤트 데이터
- 내부 API이지만 확장 가능성
- 예: onOpenData, attr/get

### 🟢 낮음 (3차 또는 보류)
- 내부 구현 세부사항
- 사용자가 직접 접근 안 함
- 선택적 모듈
- 테스트 코드
- 예: 내부 유틸 함수들

---

## 검증 체크리스트

- [x] any 사용 127개 확인
- [x] 파일별 분포 정리
- [x] 우선순위 분류
- [x] 개선안 제시
- [x] 로드맵 수립

**다음 단계**: 작업 2 (공통 타입 정리) 진행
