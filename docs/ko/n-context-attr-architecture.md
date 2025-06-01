# N.context.attr("architecture") - Natural-ARCHITECTURE 환경설정

| 이름 | 기본값 | 필수 | 설명 |
|------|---------|----------|-------------|
| page.context | .docs__ > .docs_contents__.visible__ | O | 메인 콘텐츠가 삽입될 요소를 jQuery Selector 문법으로 지정합니다. [Documents](../docs-overview.md)(N.docs) 컴포넌트를 사용하면 따로 지정하지 않아도 되지만 그렇지 않은 경우에는 **반드시 지정**해야 합니다. SPA(Single Page Application)가 아니면 "body"로 설정해 주세요. |
| cont | - | X | Controller [AOP](../aop-overview.md) 관련 설정. |
| comm.filters | - | X | [Communication Filter](../communication-filter-overview.md) 관련 설정. |
| comm.request | - | X | [Communicator.request](../communicator-request-overview.md)의 전역 옵션. |
