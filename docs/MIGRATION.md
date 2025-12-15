# Natural-JS v1.x → v2.0 마이그레이션 가이드

## 개요

Natural-JS v2.0은 네임스페이스를 통합하고 모듈 구조를 개선한 메이저 버전입니다.

## Breaking Changes

### 1. 네임스페이스 통합

**v1.x (이전)**:
```javascript
NC.string.trimToEmpty(str);
NA.comm({ url: "/api" }).submit();
ND.formatter(rules).format(data);
NU.form / NU.grid / NU.alert
NUS.notify / NUS.docs
```

**v2.0 (현재)**:
```javascript
N.string.trimToEmpty(str);
N.comm({ url: "/api" }).submit();
N.formatter(rules).format(data);
N.form / N.grid / N.alert
N.notify / N.docs
```

### 2. jQuery 체이닝 (변경 없음)

jQuery 확장 메서드는 동일하게 사용:

```javascript
// v1.x와 v2.0 모두 동일
N("#form").form({ data: [...] });
N("#grid").grid({ data: [...] });
N("#list").list({ data: [...] });
```

### 3. 빌드 시스템 변경

**v1.x**:
- Shell 스크립트 기반 (`compiler/*.sh`)
- 빌드 시간: ~30초

**v2.0**:
- NPM 기반 (`npm run build`)
- tsup 빌드 시스템
- 빌드 시간: ~1초

## 마이그레이션 방법

### 자동 마이그레이션 (권장)

```bash
# 1. Dry-run으로 변경 사항 미리 확인
npm run migrate -- --dry-run

# 2. 백업과 함께 실제 마이그레이션
npm run migrate -- --backup

# 3. 특정 디렉토리만 마이그레이션
npm run migrate -- --path=./src --backup
```

### 수동 마이그레이션

IDE의 검색/바꾸기 기능 사용 (정규식 모드):

1. `\bNC\.` → `N.`
2. `\bNA\.` → `N.`
3. `\bND\.` → `N.`
4. `\bNU\.` → `N.` (정적 사용만)
5. `\bNUS\.` → `N.`

**주의**: jQuery 체인 메서드는 변경하지 마세요!

## 호환성

### 완전 호환
- ✅ jQuery 3.7.1
- ✅ ES5+ (IE11 포함)
- ✅ 모든 API 기능
- ✅ 컴포넌트 옵션
- ✅ 이벤트 핸들러

### 변경 사항
- ❌ NC/NA/ND/NU/NUS 네임스페이스 (완전 제거)
- ❌ compiler/*.sh (제거)

## 번들 구조

### v1.x
```
natural.js.js
natural.core.js
natural.architecture.js
natural.data.js
natural.ui.js
natural.ui.shell.js
natural.code.js
natural.template.js
```

### v2.0
```
dist/natural.js          - CJS (358KB)
dist/natural.mjs         - ESM (358KB)
dist/natural.min.js      - IIFE (377KB)
dist/natural.es5.min.js  - IIFE ES5 (209KB)

개별 패키지:
dist/core.js, core.mjs, core.min.js
dist/architecture.js, architecture.mjs, architecture.min.js
dist/data.js, data.mjs, data.min.js
dist/ui.js, ui.mjs, ui.min.js
dist/ui-shell.js, ui-shell.mjs, ui-shell.min.js
```

## 사용 예시

### Before (v1.x)
```javascript
import { NC } from 'natural.core.js';
import { NA } from 'natural.architecture.js';
import { ND } from 'natural.data.js';
import { NU } from 'natural.ui.js';

NC.string.trimToEmpty(str);
NA.comm({ url: "/api" }).submit();
ND.formatter(rules).format(data);

N("#form").form();
N("#grid").grid();
```

### After (v2.0)
```javascript
import N from '@bbalganjjm/natural_js';
// 또는
const N = require('@bbalganjjm/natural_js');

N.string.trimToEmpty(str);
N.comm({ url: "/api" }).submit();
N.formatter(rules).format(data);

N("#form").form();
N("#grid").grid();
```

## 추가 정보

- GitHub: https://github.com/bbalganjjm/natural_js
- Docs: https://bbalganjjm.github.io/natural_js
- Issues: https://github.com/bbalganjjm/natural_js/issues
