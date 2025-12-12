# Natural-JS 공개 API 인벤토리

> 작성일: 2025-12-12
> 목적: TypeScript 타입 정의 리팩토링을 위한 실제 구현 기반 API 목록

## 요약

- **소스 파일**: 8개 (src/*.js)
- **타입 파일**: 17개 (@types/*.d.ts)
- **패키지**: 6개 (CORE, ARCHITECTURE, DATA, UI, UI.Shell, + CODE/TEMPLATE)
- **타입스크립트 컴파일 상태**: ✅ 에러 없음

---

## 1. natural.js.js

**역할**: 전역 엔트리, 패키지 통합, jQuery 확장

### 공개 API

#### 글로벌 함수
- `N(selector, context)` - jQuery 확장 컬렉션 반환

#### 클래스
- `NJS` - jQuery를 확장한 클래스
  - `constructor(selector, context)`
  - `static version` - 버전 정보 객체

#### 버전 정보
```javascript
{
  "Natural-JS": "1.0.0",
  "Natural-CORE": "1.0.1",
  "Natural-ARCHITECTURE": "1.0.0",
  "Natural-DATA": "1.0.0",
  "Natural-UI": "1.0.0",
  "Natural-UI.Shell": "1.0.0"
  // "Natural-CODE": 런타임 추가 (선택적)
  // "Natural-TEMPLATE": 런타임 추가 (선택적)
}
```

#### jQuery 확장
- `NC`, `NA`, `ND`, `NU`, `NUS`의 prototype 메서드들이 `jQuery.fn`에 주입됨
- 예외: `constructor`, `request`는 제외

**대응 타입 파일**: `@types/natural.js.d.ts`

---

## 2. natural.core.js (NC)

**역할**: 유틸리티 클래스 (문자열, 날짜, 엘리먼트, 이벤트 등)

### 인스턴스 메서드 (jQuery.fn에 주입)
- `remove_(idx, length)` - 배열 요소 제거
- `tpBind(eventName, eventHandler)` - 최상위 우선순위 이벤트 바인딩
- `instance(name, instance)` - 컴포넌트 인스턴스 저장/조회
- `vals(vals)` - select/checkbox/radio 값 조회/설정
- `events(eventName, namespace)` - 바인딩된 이벤트 조회

### 정적 메서드

#### 로케일/로깅
- `locale(str?)` - 로케일 조회/설정
- `debug(...obj)` - 디버그 로그
- `log(...obj)` - 일반 로그
- `info(...obj)` - 정보 로그
- `warn(...obj)` - 경고 로그
- `error(msg, e?)` - 에러 발생

#### 타입 체크
- `type(obj)` - 객체 타입 식별
- `isString(obj)` - 문자열 여부
- `isNumeric(obj)` - 숫자 여부
- `isPlainObject(obj)` - 순수 객체 여부
- `isEmptyObject(obj)` - 빈 객체 여부
- `isArray(obj)` - 배열 여부
- `isArraylike(obj)` - 유사 배열 여부
- `isWrappedSet(obj)` - jQuery 객체 여부
- `isElement(obj)` - DOM 엘리먼트 여부

#### 유틸리티
- `toSelector(el)` - CSS 선택자 문자열 변환
- `serialExecute(...args)` - 직렬 실행

#### 네임스페이스 클래스
- `gc` - 가비지 컬렉션
  - `minimum()` - 최소 GC
  - `full()` - 전체 GC
  - `ds()` - DataSync 인스턴스 GC
- `string` - 문자열 유틸 (28개 메서드)
- `date` - 날짜 유틸 (7개 메서드)
- `element` - 엘리먼트 유틸 (5개 메서드)
  - `toOpts(ele)` - opts 데이터 추출
  - `toRules(ele, ruleset)` - 규칙 객체 생성
  - `toData(eles)` - JSON 데이터 객체 생성
  - `dataChanged(eles)` - 데이터 변경 이펙트
  - `maxZindex(ele)` - 최대 z-index 계산
- `browser` - 브라우저 유틸 (6개 메서드)
- `message` - 메시지 유틸 (2개 메서드)
- `array` - 배열 유틸 (1개 메서드)
- `json` - JSON 유틸 (3개 메서드)
- `event` - 이벤트 유틸 (7개 메서드)
- `mask` - 마스크 유틸 (포맷팅용)

**대응 타입 파일**: `@types/natural.core.d.ts`, `@types/natural.core.misc.d.ts`

---

## 3. natural.architecture.js (NA)

**역할**: 아키텍처 (통신, 컨트롤러, 컨텍스트, 설정)

### 인스턴스 메서드 (jQuery.fn에 주입)
- `comm(url)` - Communicator 인스턴스 생성
- `request()` - Request 생성
- `cont(contObj)` - Controller 객체 초기화

### 정적 멤버
- `ajax` - jQuery.ajax 참조
- `comm` - Communicator 클래스
- `cont` - Controller 클래스
- `context` - Context 클래스
- `config` - Config 클래스

**대응 타입 파일**: `@types/natural.architecture.d.ts`, `@types/natural.architecture.misc.d.ts`

---

## 4. natural.data.js (ND)

**역할**: 데이터 처리 (포맷팅, 검증, 조작)

### 인스턴스 메서드 (jQuery.fn에 주입)
- `formatter(rules?)` - Formatter 인스턴스 생성
- `validator(rules?)` - Validator 인스턴스 생성
- `ds(opts)` - DataSync 인스턴스 생성

### 정적 메서드
- `data` 네임스페이스 (데이터 조작 함수들)

**대응 타입 파일**: `@types/natural.data.d.ts`, `@types/natural.data.misc.d.ts`

---

## 5. natural.ui.js (NU)

**역할**: UI 컴포넌트 (Alert, Button, Datepicker, Popup, Tab, Select, Form, List, Grid, Pagination, Tree)

### 인스턴스 메서드 (jQuery.fn에 주입)

#### 기본 UI
- `alert(msg, vars?)` - Alert 인스턴스
- `button(opts?)` - Button 인스턴스
- `datepicker(opts?)` - Datepicker 인스턴스
- `popup(opts?)` - Popup 인스턴스
- `tab(opts?)` - Tab 인스턴스

#### 데이터 UI
- `select(opts?)` - Select 인스턴스
- `form(opts?)` - Form 인스턴스
- `list(opts?)` - List 인스턴스
- `grid(opts?)` - Grid 인스턴스
- `pagination(opts)` - Pagination 인스턴스
- `tree(opts?)` - Tree 인스턴스

**대응 타입 파일**: `@types/natural.ui.d.ts`, `@types/natural.ui.misc.d.ts`

---

## 6. natural.ui.shell.js (NUS)

**역할**: Shell 컴포넌트 (전역 알림, 문서 컨테이너)

### 인스턴스 메서드 (jQuery.fn에 주입)
- `notify(opts)` - Notify 인스턴스
- `docs(opts)` - Documents 인스턴스

### 특별 처리
- `N.notify(position, opts)` - 전역 함수로도 노출
- `N.notify.add` - 정적 메서드로도 노출

**대응 타입 파일**: `@types/natural.ui.shell.d.ts`, `@types/natural.ui.shell.misc.d.ts`

---

## 7. natural.code.js (NCD) - 선택적

**역할**: 코드 에디터 컴포넌트

**대응 타입 파일**: `@types/natural.code.d.ts`, `@types/natural.code.misc.d.ts`

---

## 8. natural.template.js (NT) - 선택적

**역할**: 템플릿 엔진

**대응 타입 파일**: `@types/natural.template.d.ts`, `@types/natural.template.misc.d.ts`

---

## 타입 파일 구조 요약

| 소스 파일 | 메인 타입 | misc 타입 | 비고 |
|----------|----------|----------|------|
| natural.js.js | natural.js.d.ts | - | 글로벌 진입점 |
| natural.core.js | natural.core.d.ts | natural.core.misc.d.ts | 공통 타입 정의 |
| natural.architecture.js | natural.architecture.d.ts | natural.architecture.misc.d.ts | 옵션/콜백 많음 |
| natural.data.js | natural.data.d.ts | natural.data.misc.d.ts | 규칙 타입 중심 |
| natural.ui.js | natural.ui.d.ts | natural.ui.misc.d.ts | 가장 큰 파일들 |
| natural.ui.shell.js | natural.ui.shell.d.ts | natural.ui.shell.misc.d.ts | 문서 관련 |
| natural.code.js | natural.code.d.ts | natural.code.misc.d.ts | 선택적 |
| natural.template.js | natural.template.d.ts | natural.template.misc.d.ts | 선택적 |

**총 17개 타입 파일**:
- 1개: index.d.ts (엔트리)
- 8개: *.d.ts (메인)
- 8개: *.misc.d.ts (세부)

---

## 주요 패턴

### 1. jQuery 확장 패턴
```javascript
// src/natural.js.js
[NC.prototype, NA.prototype, ...].forEach(prototype => {
    Object.getOwnPropertyNames(prototype)
        .forEach(key => {
            if (key !== "constructor" && key !== "request") {
                jQuery.fn[key] = prototype[key];
            }
        });
});
```

### 2. 인스턴스 저장 패턴
```javascript
// 인스턴스 키: "name__" 형태
N(".grid").data("grid__", gridInstance);
N(".grid").instance("grid"); // 조회
```

### 3. 정적 클래스 패턴
```javascript
// NC.string, NC.date 등
static string = class {
    static contains(context, str) { ... }
    static isEmpty(str) { ... }
};
```

### 4. 컨트롤러 패턴
```javascript
N(".view").cont({
    init: function(view, request) {
        // view: NJS<HTMLElement[]>
        // request: NA.Request
    }
});
```

---

## 검증 체크리스트

- [x] 타입스크립트 컴파일 에러 없음
- [x] 8개 소스 파일 모두 확인
- [x] 주요 공개 API 목록 작성
- [x] 타입 파일 대응 관계 확인
- [x] 패턴 문서화

**다음 단계**: ANY-USAGE-MAP.md 작성
