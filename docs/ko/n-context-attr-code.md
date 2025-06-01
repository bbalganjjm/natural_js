# N.context.attr("code") - Natural-CODE 환경설정

| 이름 | 기본값 | 필수 | 설명 |
|------|---------|----------|-------------|
| abortOnError | false | O | ERROR 유형의 코드가 검출되었을 때 ERROR를 발생하여 로직을 중단할지 여부를 지정합니다. |
| excludes | [] | O | 검사 대상에서 제외할 구문들을 문자열로 정의합니다. 검출된 코드 내용 중 다음 문자열이 포함되어 있으면 제외 처리됩니다.<br>예시:<br>```javascript<br>excludes : [ ".index-header", ".page-header", ".index-lefter", ".index-contents", ".index-footer" ]<br>``` |
| message | `{ "ko_KR" : { ... }, "en_US" : { ... } }` | O | 코드 검사 다국어 메시지. |
