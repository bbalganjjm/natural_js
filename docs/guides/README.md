# Natural-JS 2.0 가이드 데모 실행 안내

## 실행 방법
- 정적 서버로 열기: 리포지토리 루트에서 `pnpm dlx serve docs/guides` 실행 후 브라우저에서 `http://localhost:3000` (serve 기본 포트 기준) 접속
- 또는 파일 직접 열기: `docs/guides/index.html`을 브라우저로 열어도 되지만, 모듈 로딩 정책에 따라 정적 서버 사용을 권장

## 공통 의존성
- `../../packages/natural/dist/index.js` (ESM 번들)
- `../../css/natural.ui.css`
- `docs/guides/common.css`, `docs/guides/common.js`

## 데모 페이지
- `index.html`: 네비게이션 및 버전 확인
- `architecture-core.html`: Context 설정, AOP(advisors), Comm 필터, Core 유틸
- `data.html`: Formatter/Validator, data-format/data-validate 선언형, data.filter/sort
- `ui-form-list-grid.html`: Form/List/Grid/Pagination, data-sort/filter/rowspan, data-format/validate
- `ui-controls.html`: Button/Tab/Select/Datepicker/Alert/Popup/Notify/Tree, data-opts
- `template-ts-shell.html`: Template p./c./e. 자동 초기화 데모, jsdoc 타입 안내, UI Shell Notify

## 테스트 체크리스트
- 모든 페이지에서 콘솔 패널에 로그가 찍히는지 확인
- data-* 선언형 옵션(특히 data-format/data-validate/data-sort/data-filter/data-rowspan/data-opts)이 적용되는지 확인
- AOP 어드바이스(before/after/around/error) 호출 여부 확인
- Comm 필터(beforeInit/beforeSend/success/complete) 로그 확인
- Form/List/Grid validate(), data() 결과와 Pagination 페이지 교체 확인
- Button enable/disable, Tab active/disable, Select 바인딩, Datepicker 표시, Alert/Popup/Notify 동작 확인
- Template 데모에서 p./c./e. 프로퍼티가 자동 초기화되고 save() 호출 결과 로그 확인

## 주의 사항
- 브라우저 모듈 로딩이 차단되면 정적 서버로 실행하세요.
- 네트워크 요청은 `data:` URL을 사용해 오프라인에서도 동작하도록 구성했습니다.

