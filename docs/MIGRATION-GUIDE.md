# Natural-JS 2.0 Migration Guide

Natural-JS 1.x (jQuery 기반)에서 Natural-JS 2.0 (TypeScript 기반)으로 마이그레이션하기 위한 가이드입니다.

## Table of Contents

- [Natural-JS 2.0 Migration Guide](#natural-js-20-migration-guide)
  - [Table of Contents](#table-of-contents)
  - [Overview](#overview)
    - [주요 변경사항](#주요-변경사항)
    - [호환성 정책](#호환성-정책)
  - [설치 및 환경 설정](#설치-및-환경-설정)
    - [1. 패키지 설치](#1-패키지-설치)
    - [2. TypeScript 설정](#2-typescript-설정)
    - [3. 빌드 설정](#3-빌드-설정)
  - [jQuery 제거에 따른 코드 변경](#jquery-제거에-따른-코드-변경)
    - [DOM 선택자](#dom-선택자)
    - [DOM 조작](#dom-조작)
    - [이벤트 바인딩](#이벤트-바인딩)
    - [AJAX 통신](#ajax-통신)
    - [유틸리티 함수](#유틸리티-함수)
  - [API 변경사항](#api-변경사항)
    - [N() 함수](#n-함수)
    - [N.comm() 통신](#ncomm-통신)
    - [N.cont() 컨트롤러](#ncont-컨트롤러)
    - [N.context 컨텍스트](#ncontext-컨텍스트)
    - [UI 컴포넌트](#ui-컴포넌트)
  - [TypeScript 마이그레이션](#typescript-마이그레이션)
    - [타입 import](#타입-import)
    - [컴포넌트 타입 정의](#컴포넌트-타입-정의)
    - [옵션 타입](#옵션-타입)
  - [SSR (Server-Side Rendering) 지원](#ssr-server-side-rendering-지원)
    - [환경 감지](#환경-감지)
    - [SSR 호환 코드 작성](#ssr-호환-코드-작성)
  - [natural.config 마이그레이션](#naturalconfig-마이그레이션)
    - [기존 JavaScript 설정](#기존-javascript-설정)
    - [새로운 TypeScript 설정](#새로운-typescript-설정)
  - [코드 변환 예제](#코드-변환-예제)
    - [1. 기본 페이지 구조](#1-기본-페이지-구조)
    - [2. 데이터 통신](#2-데이터-통신)
    - [3. Grid 컴포넌트 사용](#3-grid-컴포넌트-사용)
  - [자주 묻는 질문 (FAQ)](#자주-묻는-질문-faq)
  - [문제 해결](#문제-해결)

## Overview

### 주요 변경사항

| 항목 | Natural-JS 1.x | Natural-JS 2.0 |
|------|---------------|----------------|
| **언어** | JavaScript (ES5/ES6) | TypeScript (strict mode) |
| **모듈 시스템** | IIFE/UMD | ESM (ES Modules) |
| **DOM 라이브러리** | jQuery 의존 | 네이티브 DOM API |
| **HTTP 클라이언트** | jQuery.ajax | fetch API |
| **패키지 구조** | 단일 파일 | 모노레포 (pnpm workspace) |
| **SSR 지원** | 미지원 | 완전 지원 |
| **타입 안전성** | JSDoc | TypeScript strict mode |

### 호환성 정책

Natural-JS 2.0은 기존 API와의 **하위 호환성을 제공**합니다. 레거시 코드는 `@natural-js/natural` 패키지의 래퍼를 통해 대부분 그대로 동작합니다.

```typescript
// 레거시 API 사용 (호환 모드)
import { N } from '@natural-js/natural';

N('.selector').cont({
  init: function(view, request) {
    // 기존 코드 그대로 동작
  }
});
```

## 설치 및 환경 설정

### 1. 패키지 설치

```bash
# npm
npm install @natural-js/natural

# pnpm (권장)
pnpm add @natural-js/natural

# yarn
yarn add @natural-js/natural
```

개별 패키지 설치:

```bash
pnpm add @natural-js/core @natural-js/architecture @natural-js/data @natural-js/ui
```

### 2. TypeScript 설정

`tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "declaration": true,
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"]
}
```

### 3. 빌드 설정

`vite.config.ts` 또는 `webpack.config.js`에서 Natural-JS 패키지를 외부 의존성으로 설정하거나 번들에 포함시킵니다.

## jQuery 제거에 따른 코드 변경

### DOM 선택자

```javascript
// Before (jQuery)
var element = $('#myId');
var elements = $('.myClass');
var nested = $('div > span.active');

// After (Natural-JS 2.0)
import { N } from '@natural-js/natural';

const element = N('#myId');
const elements = N('.myClass');
const nested = N('div > span.active');
```

### DOM 조작

```javascript
// Before (jQuery)
$('#element').addClass('active').removeClass('inactive');
$('#element').attr('data-value', '123');
$('#element').css('color', 'red');
$('#element').html('<span>Content</span>');
$('#parent').append('<div>New Element</div>');

// After (Natural-JS 2.0)
N('#element').addClass('active').removeClass('inactive');
N('#element').attr('data-value', '123');
N('#element').css('color', 'red');
N('#element').html('<span>Content</span>');
N('#parent').append('<div>New Element</div>');
```

### 이벤트 바인딩

```javascript
// Before (jQuery)
$('#button').on('click', function(e) {
  e.preventDefault();
  console.log('Clicked!');
});

$('#list').on('click', '.item', function(e) {
  console.log('Item clicked:', $(this).data('id'));
});

// After (Natural-JS 2.0)
N('#button').on('click', (e) => {
  e.preventDefault();
  console.log('Clicked!');
});

N('#list').on('click', '.item', function(e) {
  console.log('Item clicked:', N(this).data('id'));
});
```

### AJAX 통신

```javascript
// Before (jQuery.ajax)
$.ajax({
  url: '/api/data',
  type: 'POST',
  data: { name: 'test' },
  dataType: 'json',
  success: function(response) {
    console.log(response);
  },
  error: function(xhr, status, error) {
    console.error(error);
  }
});

// After (Natural-JS 2.0 - N.comm)
N.comm({
  url: '/api/data',
  type: 'POST',
  data: { name: 'test' }
}).submit(function(response) {
  console.log(response);
}).error(function(err) {
  console.error(err);
});

// 또는 Promise 기반
const response = await N.comm('/api/data').submit();
```

### 유틸리티 함수

```javascript
// Before (jQuery)
$.extend({}, obj1, obj2);
$.each(array, function(index, item) {});
$.isArray(value);
$.isFunction(value);
$.proxy(fn, context);

// After (Natural-JS 2.0)
import { N } from '@natural-js/natural';

// Object 확장
Object.assign({}, obj1, obj2);
// 또는
N.json.merge({}, obj1, obj2);

// 배열 반복
array.forEach((item, index) => {});
// 또는
N.array.each(array, (item, index) => {});

// 타입 체크
N.type.isArray(value);
N.type.isFunction(value);

// 컨텍스트 바인딩
fn.bind(context);
```

## API 변경사항

### N() 함수

```typescript
import { N, type NaturalElement } from '@natural-js/natural';

// 기본 사용법 (변경 없음)
const el = N('#selector');

// 새로운 기능: TypeScript 타입 지원
const el: NaturalElement = N('#selector');

// HTML 문자열에서 요소 생성
const newEl = N('<div class="container"></div>');
```

### N.comm() 통신

```typescript
import { N } from '@natural-js/natural';

// 기본 사용 (하위 호환)
N.comm('/api/data').submit((data) => {
  console.log(data);
});

// 새로운 기능: Promise 지원
const data = await N.comm('/api/data').submit();

// 새로운 기능: 요청 취소
const request = N.comm('/api/data');
request.submit((data) => {});
request.abort(); // 요청 취소

// 새로운 기능: 타임아웃 설정
N.comm({
  url: '/api/data',
  timeout: 5000
}).submit();
```

### N.cont() 컨트롤러

```typescript
// 기존 방식 (하위 호환)
N('.page').cont({
  init: function(view, request) {
    this.initComponents();
  },
  initComponents: function() {}
});

// 새로운 방식: TypeScript 클래스
import { Controller } from '@natural-js/architecture';

class PageController extends Controller {
  init(view: NaturalElement, request: Request): void {
    this.initComponents();
  }

  private initComponents(): void {
    // ...
  }
}

// 또는 defineController 헬퍼 사용
import { defineController } from '@natural-js/architecture';

const controller = defineController('.page', {
  init(view, request) {
    this.initComponents();
  },
  initComponents() {}
});
```

### N.context 컨텍스트

```typescript
// 기존 방식 (하위 호환)
N.context.attr('architecture', { page: { context: '#contents' }});
const pageContext = N.context.attr('architecture').page.context;

// 새로운 방식: 타입 안전 API
import { Context } from '@natural-js/architecture';

Context.set('architecture.page.context', '#contents');
const pageContext = Context.get<string>('architecture.page.context');
```

### UI 컴포넌트

```typescript
// 기존 방식 (하위 호환)
N([]).grid({
  context: N('.grid'),
  height: 300
}).bind(data);

// 새로운 방식: 직접 import
import { Grid } from '@natural-js/ui';

const grid = new Grid({
  context: '.grid',
  height: 300
});
grid.bind(data);
```

## TypeScript 마이그레이션

### 타입 import

```typescript
// 핵심 타입
import type {
  NaturalElement,
  NaturalConfig,
  RequestConfig,
  ResponseData
} from '@natural-js/natural';

// 컴포넌트별 타입
import type {
  GridOptions,
  FormOptions,
  AlertOptions
} from '@natural-js/ui';

// 데이터 타입
import type {
  FormatterRules,
  ValidatorRules,
  ValidationResult
} from '@natural-js/data';
```

### 컴포넌트 타입 정의

```typescript
import { Grid, type GridOptions, type GridData } from '@natural-js/ui';

interface User {
  id: number;
  name: string;
  email: string;
  age: number;
}

const gridOptions: GridOptions<User> = {
  context: '.grid',
  height: 300,
  resizable: true,
  sortable: true
};

const grid = new Grid<User>(gridOptions);
const userData: User[] = await fetchUsers();
grid.bind(userData);

// 타입 안전한 데이터 접근
const selectedUsers: User[] = grid.data('selected');
```

### 옵션 타입

```typescript
import { defineConfig } from '@natural-js/core';

export default defineConfig({
  core: {
    locale: 'ko_KR',
    dateFormat: 'yyyy-MM-dd'
  },
  architecture: {
    page: {
      context: '#contents'
    },
    comm: {
      url: '/api',
      timeout: 30000
    }
  },
  ui: {
    alert: {
      container: '#contents',
      draggable: true
    },
    grid: {
      height: 300,
      resizable: true
    }
  }
});
```

## SSR (Server-Side Rendering) 지원

### 환경 감지

```typescript
import { isServer, isBrowser, getDocument, getWindow } from '@natural-js/shared';

// 환경에 따른 조건부 실행
if (isBrowser()) {
  // 브라우저 전용 코드
  const doc = getDocument();
  doc.addEventListener('DOMContentLoaded', () => {});
}

if (isServer()) {
  // 서버 전용 코드
  console.log('Running on server');
}
```

### SSR 호환 코드 작성

```typescript
import { N, isServer } from '@natural-js/natural';

class MyComponent {
  private el: NaturalElement | null = null;

  constructor(selector: string) {
    // SSR 환경에서는 DOM 접근을 지연
    if (!isServer()) {
      this.el = N(selector);
      this.init();
    }
  }

  // hydrate 메서드로 클라이언트에서 초기화
  hydrate(selector: string): void {
    this.el = N(selector);
    this.init();
  }

  private init(): void {
    // 초기화 로직
  }
}
```

## natural.config 마이그레이션

### 기존 JavaScript 설정

```javascript
// natural.config.js (1.x)
N.context.attr("architecture", {
  "page": {
    "context": "#contents"
  },
  "comm": {
    "url": function() {
      return N(this).attr("action");
    },
    "contentType": "application/json; charset=utf-8",
    "filters": {
      "beforeSend": function(request, xhr, options) {
        // ...
      },
      "success": function(data, statusText, xhr, options) {
        return data;
      },
      "error": function(xhr, statusText, error, options) {
        // ...
      }
    }
  }
});

N.context.attr("ui", {
  "alert": {
    "container": "#contents"
  },
  "grid": {
    "height": 300
  }
});
```

### 새로운 TypeScript 설정

```typescript
// natural.config.ts (2.0)
import { defineConfig, type NaturalConfig } from '@natural-js/core';

export default defineConfig({
  architecture: {
    page: {
      context: '#contents'
    },
    comm: {
      url: (element) => element?.getAttribute('action') ?? '',
      contentType: 'application/json; charset=utf-8',
      filters: {
        beforeSend: (request, options) => {
          // 인터셉터 로직
          return request;
        },
        success: (response, options) => {
          return response.data;
        },
        error: (error, options) => {
          console.error('Communication error:', error);
        }
      }
    }
  },
  ui: {
    alert: {
      container: '#contents'
    },
    grid: {
      height: 300
    }
  }
});
```

## 코드 변환 예제

### 1. 기본 페이지 구조

**Before (1.x):**

```html
<!-- page.html -->
<article id="myPage">
  <div class="content"></div>
</article>

<script>
N(".myPage").cont({
  init: function(view, request) {
    N(".content", view).text("Hello World");
  }
});
</script>
```

**After (2.0):**

```html
<!-- page.html -->
<article id="myPage">
  <div class="content"></div>
</article>

<script type="module">
import { N } from '@natural-js/natural';

N(".myPage").cont({
  init(view, request) {
    N(".content", view).text("Hello World");
  }
});
</script>
```

### 2. 데이터 통신

**Before (1.x):**

```javascript
N(".page").cont({
  init: function(view, request) {
    var self = this;
    N.comm("/api/users").submit(function(data) {
      self.renderUsers(data);
    });
  },
  renderUsers: function(users) {
    // ...
  }
});
```

**After (2.0):**

```typescript
import { N, type NaturalElement } from '@natural-js/natural';

interface User {
  id: number;
  name: string;
}

N(".page").cont({
  async init(view: NaturalElement, request) {
    const users = await N.comm<User[]>("/api/users").submit();
    this.renderUsers(users);
  },
  
  renderUsers(users: User[]) {
    // ...
  }
});
```

### 3. Grid 컴포넌트 사용

**Before (1.x):**

```javascript
N(".page").cont({
  init: function(view, request) {
    this.grid = N([]).grid({
      context: N(".grid", view),
      height: 300,
      resizable: true,
      sortable: true
    });

    N.comm("/api/users").submit(function(data) {
      this.grid.bind(data);
    }.bind(this));
  }
});
```

**After (2.0):**

```typescript
import { N, Grid } from '@natural-js/natural';

interface User {
  id: number;
  name: string;
  email: string;
}

N(".page").cont({
  grid: null as Grid<User> | null,

  async init(view, request) {
    this.grid = N<User>([]).grid({
      context: N(".grid", view),
      height: 300,
      resizable: true,
      sortable: true
    });

    const users = await N.comm<User[]>("/api/users").submit();
    this.grid.bind(users);
  }
});
```

## 자주 묻는 질문 (FAQ)

### Q: jQuery 없이도 기존 코드가 동작하나요?

A: 네, Natural-JS 2.0의 `NaturalElement` 클래스가 jQuery와 유사한 API를 제공합니다. 대부분의 jQuery 메서드가 호환됩니다.

### Q: 기존 프로젝트에서 점진적으로 마이그레이션할 수 있나요?

A: 네, `@natural-js/natural` 패키지의 레거시 래퍼를 사용하면 기존 코드를 그대로 유지하면서 점진적으로 새로운 API로 전환할 수 있습니다.

### Q: Communication Filter는 어떻게 변경되었나요?

A: fetch API 기반으로 재구현되었지만, 기존 필터 체인(beforeInit, afterInit, beforeSend, success, error, complete)은 그대로 지원됩니다.

### Q: SSR을 사용하지 않아도 되나요?

A: 네, SSR은 선택사항입니다. 기존처럼 브라우저 전용으로 사용할 수 있습니다.

### Q: 번들 크기는 어떻게 변했나요?

A: Tree-shaking을 지원하여 사용하는 기능만 번들에 포함됩니다. 전체 크기는 기존과 비슷하지만, 필요한 모듈만 import하면 크기를 줄일 수 있습니다.

## 문제 해결

### "Cannot find module '@natural-js/natural'"

```bash
# 패키지 재설치
pnpm install

# TypeScript 경로 확인
# tsconfig.json에 다음 추가
{
  "compilerOptions": {
    "moduleResolution": "bundler"
  }
}
```

### "document is not defined" (SSR 환경)

```typescript
// 환경 체크 추가
import { isBrowser } from '@natural-js/shared';

if (isBrowser()) {
  // DOM 관련 코드
}
```

### 기존 jQuery 플러그인이 동작하지 않음

Natural-JS 2.0은 jQuery를 포함하지 않습니다. jQuery 플러그인을 사용하려면 별도로 jQuery를 설치하세요.

```bash
pnpm add jquery
```

```typescript
import $ from 'jquery';
import { N } from '@natural-js/natural';

// jQuery와 Natural-JS를 함께 사용
$('.jquery-plugin').myPlugin();
N('.natural-component').grid({ ... });
```

---

마이그레이션 관련 문의사항은 [GitHub Issues](https://github.com/bbalganjjm/natural_js/issues)에 등록해 주세요.

