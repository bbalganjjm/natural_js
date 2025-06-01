# N.context.attr("ui") - Natural-UI 환경설정

| 이름 | 기본값 | 필수 | 설명 |
|------|---------|----------|-------------|
| alert.container | .docs__ > .docs_contents__.visible__ | O | N.alert, N.popup 컴포넌트의 요소들이 저장될 요소를 jQuery Selector 문법으로 지정합니다. 특별한 경우가 아니면 N.context.attr("architecture").page.context 값과 같은 값을 정의해 주세요. [Documents](../docs-overview.md)(N.docs) 컴포넌트를 사용하면 따로 지정하지 않아도 되지만 그렇지 않은 경우에는 **반드시 지정**해야 합니다. SPA(Single Page Application)가 아니면 "body"로 설정해 주세요. |
| alert.global.okBtnStyle | `{ color : "yellowgreen", "size" : "medium" }` | X | N.alert의 확인 버튼 스타일. 버튼 컴포넌트의 옵션으로 지정합니다. |
| alert.global.cancelBtnStyle | `{ "size" : "medium" }` | X | N.alert의 취소 버튼 스타일. 버튼 컴포넌트의 옵션으로 지정합니다. |
| alert.input.displayTimeout | 7000 | O | context 옵션에 입력 요소를 지정했을 때 표시되는 메시지 다이얼로그의 표시 시간(ms). |
| alert.input.closeBtn | &times; | O | context 옵션에 입력 요소를 지정했을 때 표시되는 메시지 다이얼로그의 닫기 버튼 디자인, html 태그 입력 가능. |
| alert.message | `{ "ko_KR" : { ... }, "en_US" : { ... } }` | O | N.alert의 다국어 메시지. |
| datepicker.monthonlyOpts.yearsPanelPosition | top | O | monthonly 옵션이 true 일 때 연도 선택 요소의 위치를 지정합니다. "left" 나 "top"으로 설정해 주세요. |
| datepicker.monthonlyOpts.monthsPanelPosition | top | O | monthonly 옵션이 true 일 때 월 선택 요소의 위치를 지정합니다. "left" 나 "top"으로 설정해 주세요. |
| datepicker.message | `{ "ko_KR" : { ... }, "en_US" : { ... } }` | O | N.datepicker의 다국어 메시지. |
| list.message | `{ "ko_KR" : { ... }, "en_US" : { ... } }` | O | N.list의 다국어 메시지. |
| grid.message (정렬 표시자) | `{ "asc" : "▼", "desc" : "▲" }` | O | Sort 기능이 활성화되었을 때 정렬 방향 표시 구분자, HTML 태그를 입력해도 됩니다. |
| grid.message (다국어) | `{ "ko_KR" : { ... }, "en_US" : { ... } }` | O | N.grid의 다국어 메시지. |
