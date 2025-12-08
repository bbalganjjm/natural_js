# Natural-JS 2.0 API Reference

이 문서는 Natural-JS 2.0의 주요 API를 설명합니다.

## Table of Contents

- [Natural-JS 2.0 API Reference](#natural-js-20-api-reference)
  - [Table of Contents](#table-of-contents)
  - [Installation](#installation)
  - [Package Overview](#package-overview)
  - [@natural-js/shared](#natural-jsshared)
    - [Environment Detection](#environment-detection)
    - [NaturalElement](#naturalelement)
  - [@natural-js/core](#natural-jscore)
    - [String Utilities](#string-utilities)
    - [Date Utilities](#date-utilities)
    - [Array Utilities](#array-utilities)
    - [JSON Utilities](#json-utilities)
    - [Browser Utilities](#browser-utilities)
    - [Event Utilities](#event-utilities)
    - [Message Utilities](#message-utilities)
    - [Mask Class](#mask-class)
    - [Type Utilities](#type-utilities)
    - [Element Utilities](#element-utilities)
    - [GC Utilities](#gc-utilities)
    - [Configuration](#configuration)
  - [@natural-js/architecture](#natural-jsarchitecture)
    - [Communicator](#communicator)
    - [Controller](#controller)
    - [Context](#context)
    - [HTTP Client](#http-client)
    - [Filter Chain](#filter-chain)
  - [@natural-js/data](#natural-jsdata)
    - [Formatter](#formatter)
    - [Validator](#validator)
    - [DataSync](#datasync)
    - [Data Utilities](#data-utilities)
  - [@natural-js/ui](#natural-jsui)
    - [Alert](#alert)
    - [Button](#button)
    - [Datepicker](#datepicker)
    - [Popup](#popup)
    - [Tab](#tab)
    - [Select](#select)
    - [Form](#form)
    - [List](#list)
    - [Grid](#grid)
    - [Pagination](#pagination)
    - [Tree](#tree)
  - [@natural-js/ui-shell](#natural-jsui-shell)
    - [Notify](#notify)
    - [Documents](#documents)
  - [@natural-js/natural (Unified Package)](#natural-jsnatural-unified-package)
    - [Legacy API](#legacy-api)

## Installation

```bash
# 전체 패키지
pnpm add @natural-js/natural

# 개별 패키지
pnpm add @natural-js/core @natural-js/ui
```

## Package Overview

| Package | Description |
|---------|-------------|
| `@natural-js/shared` | 환경 감지, DOM 추상화 계층 |
| `@natural-js/core` | 핵심 유틸리티 함수 |
| `@natural-js/architecture` | CVC 아키텍처 구현 |
| `@natural-js/data` | 데이터 포맷팅, 검증, 동기화 |
| `@natural-js/ui` | UI 컴포넌트 |
| `@natural-js/ui-shell` | Shell 컴포넌트 |
| `@natural-js/template` | 템플릿 AOP 처리 |
| `@natural-js/code` | 코드 검사 도구 |
| `@natural-js/natural` | 통합 패키지 |

> UI 스타일을 사용할 때는 `tokens.css` → `light.css`/`dark.css` → `natural.ui.css` 순으로 로드하세요. 순서가 바뀌면 색상 변수가 초기화되지 않아 컴포넌트 스타일이 깨질 수 있습니다.

---

## @natural-js/shared

### Environment Detection

```typescript
import {
  isServer,
  isBrowser,
  getDocument,
  getWindow,
  getNavigator,
  getLocation
} from '@natural-js/shared';

// 서버/브라우저 환경 감지
if (isBrowser()) {
  console.log('Running in browser');
}

if (isServer()) {
  console.log('Running on server');
}

// 안전한 전역 객체 접근 (SSR 호환)
const doc = getDocument(); // Document | null
const win = getWindow();   // Window | null
```

### NaturalElement

jQuery 대체 DOM 추상화 클래스입니다.

```typescript
import { NaturalElement, N } from '@natural-js/shared';

// 요소 선택
const el = N('#myId');
const els = N('.myClass');

// 체이닝
N('.container')
  .addClass('active')
  .css('color', 'blue')
  .on('click', () => console.log('Clicked'));

// 메서드
el.addClass('className');     // 클래스 추가
el.removeClass('className');  // 클래스 제거
el.toggleClass('className');  // 클래스 토글
el.hasClass('className');     // 클래스 확인

el.attr('name');              // 속성 읽기
el.attr('name', 'value');     // 속성 설정
el.removeAttr('name');        // 속성 제거

el.data('key');               // data-* 읽기
el.data('key', 'value');      // data-* 설정

el.css('property');           // 스타일 읽기
el.css('property', 'value');  // 스타일 설정

el.val();                     // 값 읽기
el.val('newValue');           // 값 설정

el.text();                    // 텍스트 읽기
el.text('content');           // 텍스트 설정

el.html();                    // HTML 읽기
el.html('<span>content</span>'); // HTML 설정

el.append('<div>child</div>');   // 자식 추가
el.prepend('<div>child</div>');  // 첫 자식 추가
el.before('<div>sibling</div>'); // 이전 형제 추가
el.after('<div>sibling</div>');  // 다음 형제 추가
el.remove();                     // 요소 제거
el.empty();                      // 자식 모두 제거

el.show();     // 표시
el.hide();     // 숨김
el.toggle();   // 토글

// DOM 탐색
el.find('.child');     // 자손 검색
el.parent();           // 부모
el.parents('.ancestor'); // 조상들
el.children();         // 자식들
el.siblings();         // 형제들
el.closest('.ancestor'); // 가장 가까운 조상
el.next();             // 다음 형제
el.prev();             // 이전 형제

// 이벤트
el.on('click', handler);
el.on('click', '.child', handler); // 이벤트 위임
el.off('click', handler);
el.trigger('click');

// 배열 유사 메서드
el.get(0);      // 인덱스로 요소 가져오기
el.eq(0);       // 인덱스로 NaturalElement 가져오기
el.first();     // 첫 번째 요소
el.last();      // 마지막 요소
el.each((el, i) => {}); // 순회
el.map((el, i) => el);  // 매핑
```

---

## @natural-js/core

### String Utilities

```typescript
import { StringUtils } from '@natural-js/core';

StringUtils.contains('hello world', 'world');  // true
StringUtils.startsWith('hello', 'he');         // true
StringUtils.endsWith('hello', 'lo');           // true
StringUtils.insertAt('hello', 2, '--');        // 'he--llo'
StringUtils.removeWhitespace(' hello world '); // 'helloworld'
StringUtils.lpad('123', 5, '0');               // '00123'
StringUtils.rpad('123', 5, '0');               // '12300'
StringUtils.isEmpty('');                        // true
StringUtils.byteLength('hello');               // 5
StringUtils.trimToEmpty(null);                 // ''
StringUtils.trimToNull('  ');                  // null
StringUtils.trimToZero(undefined);             // 0
```

### Date Utilities

```typescript
import { DateUtils } from '@natural-js/core';

// PHP 스타일 날짜 포맷팅
DateUtils.formatDate(new Date(), 'Y-m-d H:i:s'); // '2024-12-05 10:30:00'

// 날짜 차이 계산
DateUtils.diff('20241201', '20241205', 'day'); // 4

// 문자열 → Date
DateUtils.strToDate('20241205');
DateUtils.strToDate('2024-12-05', '-');

// 날짜 리스트 생성
DateUtils.dateList('20241201', '20241205'); // ['20241201', ..., '20241205']
```

### Array Utilities

```typescript
import { ArrayUtils } from '@natural-js/core';

ArrayUtils.deduplicate([1, 2, 2, 3]);           // [1, 2, 3]
ArrayUtils.intersection([1, 2], [2, 3]);        // [2]
ArrayUtils.difference([1, 2, 3], [2]);          // [1, 3]
ArrayUtils.flatten([[1, 2], [3, 4]]);           // [1, 2, 3, 4]
ArrayUtils.groupBy([{a: 1}, {a: 1}, {a: 2}], 'a'); // {1: [...], 2: [...]}
ArrayUtils.chunk([1, 2, 3, 4, 5], 2);           // [[1, 2], [3, 4], [5]]
```

### JSON Utilities

```typescript
import { JsonUtils } from '@natural-js/core';

JsonUtils.parse('{"key": "value"}');
JsonUtils.stringify({ key: 'value' });
JsonUtils.formatJSON('{"key":"value"}', 2);    // 들여쓰기 적용
JsonUtils.deepClone({ nested: { value: 1 } }); // 깊은 복사
JsonUtils.merge({a: 1}, {b: 2});               // {a: 1, b: 2}
JsonUtils.pick({ a: 1, b: 2 }, ['a']);         // {a: 1}
JsonUtils.omit({ a: 1, b: 2 }, ['a']);         // {b: 2}
JsonUtils.deepEqual({ a: 1 }, { a: 1 });       // true
```

### Browser Utilities

```typescript
import { BrowserUtils } from '@natural-js/core';

BrowserUtils.getCookie('name');
BrowserUtils.setCookie('name', 'value', { expires: 7 });
BrowserUtils.removeCookie('name');
BrowserUtils.is.chrome;       // true/false
BrowserUtils.is.firefox;
BrowserUtils.is.safari;
BrowserUtils.is.mobile;
BrowserUtils.contextPath();   // '/app'
BrowserUtils.scrollbarWidth(); // 17
BrowserUtils.isTouchDevice(); // true/false
BrowserUtils.viewportInfo();  // { width, height, scrollX, scrollY }
```

### Event Utilities

```typescript
import { EventUtils } from '@natural-js/core';

EventUtils.isEnterKey(event);       // true/false
EventUtils.isCtrlKey(event);
EventUtils.isShiftKey(event);
EventUtils.keyCode(event);          // 13
EventUtils.preventDefault(event);
EventUtils.stopPropagation(event);
EventUtils.windowScrollLock(true);  // 스크롤 잠금
EventUtils.windowScrollLock(false); // 스크롤 해제
```

### Message Utilities

```typescript
import { MessageUtils } from '@natural-js/core';

// 메시지 등록
MessageUtils.create('ko_KR', {
  'greeting': '안녕하세요, {0}님!',
  'error.required': '{0}은(는) 필수 항목입니다.'
});

// 메시지 조회
MessageUtils.get('greeting', ['홍길동']);        // '안녕하세요, 홍길동님!'
MessageUtils.get('error.required', ['이름']);    // '이름은(는) 필수 항목입니다.'

// 로케일 확인
MessageUtils.getLocales();  // ['ko_KR', 'en_US']
MessageUtils.has('greeting'); // true
```

### Mask Class

```typescript
import { Mask } from '@natural-js/core';

const mask = new Mask('#input', {
  pattern: '###-####-####',
  placeholder: '_'
});

// 숫자 마스크
const numMask = new Mask('#number', {
  numeric: true,
  prefix: '$',
  thousandSeparator: ',',
  decimalPlaces: 2
});
```

### Type Utilities

```typescript
import { TypeUtils } from '@natural-js/core';

TypeUtils.type('hello');           // 'string'
TypeUtils.isString('hello');       // true
TypeUtils.isNumeric('123');        // true
TypeUtils.isNumeric(123);          // true
TypeUtils.isArray([]);             // true
TypeUtils.isFunction(() => {});    // true
TypeUtils.isPlainObject({});       // true
TypeUtils.isEmptyObject({});       // true
TypeUtils.isArraylike(nodeList);   // true
TypeUtils.isNaturalElement(N()); // true
```

### Element Utilities

```typescript
import { ElementUtils } from '@natural-js/core';

// data-opts 속성에서 옵션 파싱
const opts = ElementUtils.toOpts(element); // { key: 'value' }

// data-validate 속성에서 규칙 파싱
const rules = ElementUtils.toRules(element); // [['required'], ['email']]

// 폼 데이터 추출
const data = ElementUtils.toData(formElement); // { name: 'value', ... }

// 최대 z-index 계산
const maxZ = ElementUtils.maxZindex(); // 1000

// 조상 요소 찾기
const parent = ElementUtils.closest(element, '.container');

// 선택자 매칭
const matches = ElementUtils.matches(element, '.active');
```

### GC Utilities

```typescript
import { GCUtils } from '@natural-js/core';

// 이벤트 등록 (나중에 일괄 해제 가능)
GCUtils.registerEvent(element, 'click', handler);

// 특정 요소의 이벤트 모두 해제
GCUtils.unregisterEvents(element);

// 최소 가비지 컬렉션
GCUtils.minimum(containerElement);

// 전체 가비지 컬렉션
GCUtils.full(containerElement);
```

### Configuration

```typescript
import { defineConfig, loadConfig, getConfig } from '@natural-js/core';

// 설정 정의
const config = defineConfig({
  core: {
    locale: 'ko_KR',
    dateFormat: 'yyyy-MM-dd'
  },
  architecture: {
    page: { context: '#contents' }
  },
  ui: {
    alert: { container: '#contents' },
    grid: { height: 300 }
  }
});

// 설정 로드
loadConfig(config);

// 설정 조회
const locale = getConfig('core.locale'); // 'ko_KR'
const gridHeight = getConfig('ui.grid.height'); // 300
```

---

## @natural-js/architecture

### Communicator

```typescript
import { Communicator } from '@natural-js/architecture';

// 기본 사용
const comm = new Communicator('/api/users');
comm.submit((data) => {
  console.log(data);
});

// 옵션 설정
const comm = new Communicator({
  url: '/api/users',
  type: 'POST',
  data: { name: 'John' },
  contentType: 'application/json',
  timeout: 5000
});

// 에러 핸들링
comm.error((error) => {
  console.error(error);
});

// Promise 사용
const data = await comm.submit();

// 요청 취소
comm.abort();
```

### Controller

```typescript
import { Controller, defineController } from '@natural-js/architecture';

// 클래스 스타일
class MyController extends Controller {
  init(view, request) {
    this.initComponents();
    this.bindEvents();
  }

  initComponents() {
    // 컴포넌트 초기화
  }

  bindEvents() {
    // 이벤트 바인딩
  }
}

// 객체 스타일
defineController('.myPage', {
  init(view, request) {
    this.initComponents();
  },
  initComponents() {}
});
```

### Context

```typescript
import { Context } from '@natural-js/architecture';

// 값 설정
Context.set('architecture.page.context', '#contents');
Context.set('ui.alert.container', '#contents');

// 값 조회
const pageContext = Context.get<string>('architecture.page.context');

// 전체 설정 조회
const archConfig = Context.get<object>('architecture');
```

### HTTP Client

```typescript
import { NaturalHttpClient } from '@natural-js/architecture';

const client = new NaturalHttpClient({
  baseUrl: '/api',
  timeout: 10000
});

// 인터셉터 등록
client.addRequestInterceptor((config) => {
  config.headers = {
    ...config.headers,
    Authorization: `Bearer ${token}`
  };
  return config;
});

client.addResponseInterceptor((response) => {
  return response.data;
});

// 요청
const users = await client.get<User[]>('/users');
const newUser = await client.post<User>('/users', { name: 'John' });
await client.put('/users/1', { name: 'Jane' });
await client.delete('/users/1');
```

### Filter Chain

```typescript
import { FilterChain } from '@natural-js/architecture';

const filterChain = new FilterChain();

// 필터 등록
filterChain.register('beforeSend', (request, options) => {
  // 요청 전 처리
  request.headers['X-Custom-Header'] = 'value';
  return request;
});

filterChain.register('success', (response, options) => {
  // 성공 응답 처리
  return response.data;
});

filterChain.register('error', (error, options) => {
  // 에러 처리
  console.error('API Error:', error);
});

filterChain.register('complete', (options) => {
  // 완료 후 처리
});
```

---

## @natural-js/data

### Formatter

```typescript
import { Formatter, format, unformat } from '@natural-js/data';

// 인스턴스 사용
const formatter = new Formatter([
  ['commas'],
  ['date', 8]
]);
const formatted = formatter.format([{ amount: 1000000, date: '20241205' }]);
// [{ amount: '1,000,000', date: '2024-12-05' }]

const unformatted = formatter.unformat(formatted);
// [{ amount: 1000000, date: '20241205' }]

// 개별 함수 사용
format.commas(1000000);        // '1,000,000'
format.date('20241205', 8);    // '2024-12-05'
format.phone('01012345678');   // '010-1234-5678'
format.rrn('9001011234567');   // '900101-1234567'
format.upper('hello');         // 'HELLO'
format.lower('HELLO');         // 'hello'
format.capitalize('hello');    // 'Hello'

unformat.commas('1,000,000');  // 1000000
unformat.date('2024-12-05');   // '20241205'
```

### Validator

```typescript
import { Validator, validate } from '@natural-js/data';

// 인스턴스 사용
const validator = new Validator([
  ['required'],
  ['email']
]);
const result = validator.validate([{ email: '' }]);
// { valid: false, errors: [...] }

// 개별 규칙 검증
validate.required('');          // false
validate.required('value');     // true
validate.email('test@email.com'); // true
validate.integer('123');        // true
validate.alphabet('abc');       // true
validate.korean('한글');        // true
validate.url('https://...');    // true
validate.date('20241205');      // true
validate.phone('01012345678');  // true
validate.rrn('9001011234567');  // true (주민등록번호)
validate.regexp('abc', /^[a-z]+$/); // true
```

### DataSync

```typescript
import { DataSync } from '@natural-js/data';

// 인스턴스 생성/조회
const ds = DataSync.instance('myData');

// 데이터 설정
ds.set([{ id: 1, name: 'John' }]);

// 변경 알림
ds.notify();

// 구독
const unsubscribe = ds.subscribe((data, changes) => {
  console.log('Data changed:', data, changes);
});

// 구독 해제
unsubscribe();

// 인스턴스 제거
DataSync.remove('myData');
```

### Data Utilities

```typescript
import { DataUtils } from '@natural-js/data';

const data = [
  { id: 1, name: 'John', age: 30, dept: 'Sales' },
  { id: 2, name: 'Jane', age: 25, dept: 'IT' },
  { id: 3, name: 'Bob', age: 35, dept: 'Sales' }
];

// 필터링
DataUtils.filter(data, { dept: 'Sales' });
// [{ id: 1, ... }, { id: 3, ... }]

// 정렬
DataUtils.sort(data, 'age', 'asc');
DataUtils.sort(data, ['dept', 'age'], ['asc', 'desc']);

// 그룹화
DataUtils.groupBy(data, 'dept');
// { Sales: [...], IT: [...] }

// 집계
DataUtils.sum(data, 'age');      // 90
DataUtils.avg(data, 'age');      // 30
DataUtils.max(data, 'age');      // 35
DataUtils.min(data, 'age');      // 25
DataUtils.count(data);           // 3
```

---

## @natural-js/ui

### Alert

```typescript
import { Alert } from '@natural-js/ui';

// 기본 알림
const alert = new Alert({
  msg: '저장되었습니다.',
  container: '#contents'
});
alert.show();

// 확인 다이얼로그
new Alert({
  msg: '삭제하시겠습니까?',
  confirm: true,
  onOk: () => console.log('확인'),
  onCancel: () => console.log('취소')
}).show();

// 입력 프롬프트
new Alert({
  msg: '이름을 입력하세요.',
  input: true,
  onOk: (value) => console.log('입력값:', value)
}).show();

// 메서드
alert.show();
alert.hide();
alert.remove();
```

### Button

```typescript
import { Button } from '@natural-js/ui';

const btn = new Button({
  context: '#myButton',
  onClick: () => console.log('Clicked')
});

btn.disable();
btn.enable();
```

### Datepicker

```typescript
import { Datepicker } from '@natural-js/ui';

const picker = new Datepicker({
  context: '#dateInput',
  format: 'yyyy-MM-dd',
  minDate: new Date(),
  maxDate: new Date(2025, 11, 31),
  onSelect: (date) => console.log('Selected:', date)
});

// 메서드
picker.val();             // 현재 값
picker.val('2024-12-05'); // 값 설정
picker.open();
picker.close();
```

### Popup

```typescript
import { Popup } from '@natural-js/ui';

// URL 기반 팝업
const popup = new Popup({
  url: '/page/detail.html',
  title: '상세 정보',
  width: 600,
  height: 400,
  modal: true,
  draggable: true,
  onOpen: () => console.log('Opened'),
  onClose: () => console.log('Closed')
});
popup.open();

// 인라인 팝업
new Popup({
  context: '#popupContent',
  title: '팝업 제목'
}).open();

// 메서드
popup.open();
popup.close();
popup.remove();
```

### Tab

```typescript
import { Tab } from '@natural-js/ui';

const tab = new Tab({
  context: '#tabContainer',
  onOpen: (index, url) => console.log('Tab opened:', index)
});

// 메서드
tab.open(1);              // 인덱스로 열기
tab.open('#tab2');        // ID로 열기
tab.disable(2);           // 탭 비활성화
tab.enable(2);            // 탭 활성화
tab.context(0);           // 탭 콘텐츠 영역 가져오기
```

### Select

```typescript
import { Select } from '@natural-js/ui';

// select 요소
const select = new Select({
  context: '#mySelect',
  key: 'name',
  val: 'code',
  selected: '01'
});
select.bind([
  { code: '01', name: 'Option 1' },
  { code: '02', name: 'Option 2' }
]);

// checkbox/radio
const radio = new Select({
  context: '#genderGroup',
  type: 'radio',
  key: 'label',
  val: 'value'
});

// 메서드
select.val();             // 선택된 값
select.val('02');         // 값 설정
select.index();           // 선택된 인덱스
select.data();            // 전체 데이터
select.selectedData();    // 선택된 데이터
select.reset();           // 초기화
```

### Form

```typescript
import { Form } from '@natural-js/ui';

const form = new Form({
  context: '#searchForm',
  onBind: (data) => console.log('Bound:', data)
});

// 데이터 바인딩
form.bind([{ name: 'John', age: 30 }]);

// 메서드
form.val();                         // 현재 데이터
form.val('name', 'Jane');           // 필드 값 설정
form.data();                        // 전체 데이터 배열
form.data('modified');              // 수정된 데이터
form.validate();                    // 유효성 검사
form.update(0, 'name', 'Bob');      // 데이터 업데이트
form.add();                         // 새 행 추가
form.remove(0);                     // 행 삭제
form.revert(0);                     // 변경사항 취소
```

### List

```typescript
import { List } from '@natural-js/ui';

const list = new List({
  context: '#userList',  // ul 요소
  height: 300,
  onSelect: (index, data) => console.log('Selected:', data)
});

list.bind([
  { id: 1, name: 'John' },
  { id: 2, name: 'Jane' }
]);

// 메서드
list.add({ id: 3, name: 'Bob' });  // 행 추가
list.remove(0);                     // 행 삭제
list.select(1);                     // 행 선택
list.val(0);                        // 행 데이터
list.val(0, 'name', 'Updated');     // 값 수정
list.data();                        // 전체 데이터
list.data('modified');              // 수정된 데이터
list.revert(0);                     // 변경 취소
list.check([0, 1]);                 // 체크
list.check();                       // 체크된 인덱스
```

### Grid

```typescript
import { Grid } from '@natural-js/ui';

const grid = new Grid({
  context: '#userGrid',  // table 요소
  height: 300,
  resizable: true,
  sortable: true,
  checkAll: '#checkAll',
  checkAllTarget: '.check',
  onSelect: (index, data) => console.log('Selected:', data)
});

grid.bind([
  { id: 1, name: 'John', email: 'john@email.com' },
  { id: 2, name: 'Jane', email: 'jane@email.com' }
]);

// 메서드
grid.add();                        // 새 행 추가
grid.remove([0, 1]);               // 행 삭제
grid.select(0);                    // 행 선택
grid.select();                     // 선택된 인덱스
grid.check([0, 1]);                // 체크 설정
grid.check();                      // 체크된 인덱스
grid.val(0);                       // 행 데이터
grid.val(0, 'name', 'Updated');    // 값 수정
grid.data();                       // 전체 데이터
grid.data('modified');             // 수정된 데이터
grid.data('selected');             // 선택된 데이터
grid.data('checked');              // 체크된 데이터
grid.validate();                   // 유효성 검사
grid.revert(0);                    // 변경 취소
grid.sort('name', 'asc');          // 정렬
grid.filter({ name: 'John' });     // 필터링
```

### Pagination

```typescript
import { Pagination } from '@natural-js/ui';

const paging = new Pagination({
  context: '#pagination',
  totalCount: 100,
  countPerPage: 10,
  pageNo: 1,
  onChange: (pageNo) => loadData(pageNo)
});

// 메서드
paging.bind(200);           // 총 개수로 초기화
paging.totalCount(150);     // 총 개수 설정
paging.pageNo(3);           // 페이지 이동
paging.countPerPage(20);    // 페이지당 개수 설정
paging.first();             // 첫 페이지
paging.last();              // 마지막 페이지
paging.prev();              // 이전 페이지
paging.next();              // 다음 페이지
```

### Tree

```typescript
import { Tree } from '@natural-js/ui';

const tree = new Tree({
  context: '#treeContainer',
  idKey: 'id',
  parentKey: 'parentId',
  nameKey: 'name',
  onSelect: (node) => console.log('Selected:', node)
});

tree.bind([
  { id: 1, parentId: null, name: 'Root' },
  { id: 2, parentId: 1, name: 'Child 1' },
  { id: 3, parentId: 1, name: 'Child 2' },
  { id: 4, parentId: 2, name: 'Grandchild' }
]);

// 메서드
tree.expand(1);            // 노드 확장
tree.collapse(1);          // 노드 축소
tree.expandAll();          // 전체 확장
tree.collapseAll();        // 전체 축소
tree.select(2);            // 노드 선택
tree.data();               // 전체 데이터
```

---

## @natural-js/ui-shell

### Notify

```typescript
import { Notify } from '@natural-js/ui-shell';

// 정적 메서드
Notify.info('정보 메시지');
Notify.success('성공 메시지');
Notify.warning('경고 메시지');
Notify.error('오류 메시지');

// 인스턴스 사용
const notify = new Notify({
  position: 'top-right',
  duration: 3000
});
notify.add('메시지', 'info');
notify.remove(id);
notify.clear();
```

### Documents

```typescript
import { Documents } from '@natural-js/ui-shell';

const docs = new Documents({
  context: '#docsContainer',
  maxTabs: 10,
  onOpen: (docId) => console.log('Opened:', docId),
  onClose: (docId) => console.log('Closed:', docId)
});

// 문서(탭) 추가
docs.add('doc1', '문서 제목', { url: '/page/doc1.html' });

// 메서드
docs.add(id, title, options);
docs.remove(id);
docs.get(id);              // 문서 컨텍스트 가져오기
docs.cont(id);             // 문서 컨트롤러 가져오기
```

---

## @natural-js/natural (Unified Package)

### Legacy API

기존 Natural-JS 1.x 스타일 API를 지원합니다.

```typescript
import { N } from '@natural-js/natural';

// DOM 선택
const el = N('#selector');

// 유틸리티 (N.* 정적 메서드)
N.string.isEmpty('');
N.date.format(new Date(), 'Y-m-d');
N.array.deduplicate([1, 1, 2]);
N.json.deepClone({ a: 1 });
N.browser.cookie('name', 'value');
N.event.preventDefault(e);
N.message.get('key');
N.type.isString('');

// 통신
N.comm('/api/data').submit((data) => {});

// 컨트롤러
N('.page').cont({
  init(view, request) {}
});

// 컨텍스트
N.context.attr('key', value);
N.context.attr('key');

// UI 컴포넌트
N([]).grid({ context: '#grid' }).bind(data);
N(window).alert({ msg: '메시지' }).show();
N('#date').datepicker();

// 데이터
N.formatter(['commas']).format(data);
N.validator(['required']).validate(data);
```

---

문서에 대한 질문이나 오류 발견 시 [GitHub Issues](https://github.com/bbalganjjm/natural_js/issues)에 등록해 주세요.

