# N.context.attr("core") - Natural-CORE 환경설정

| 이름 | 기본값 | 필수 | 설명 |
|------|---------|----------|-------------|
| locale | ko_KR | O | 기본 로케일. Natural-JS는 이 설정값으로 다국어 메시지를 처리합니다. ko_KR처럼 Full Locale을 지정해야 하고 N.locale 함수로 설정값을 명령으로 변경할 수 있습니다. |
| sgChkdVal | Y | O | N().vals 메서드에서 체크박스가 한 개 일 경우 체크되었을 때 기본 값. "Y", "1", "on" 등 프로젝트 데이터 표준에 맞춰 정의 바랍니다. |
| sgUnChkdVal | N | O | N().vals 메서드에서 체크박스가 한 개 일 경우 체크 해제되었을 때 기본 값. "N", "0", "off" 등 프로젝트 데이터 표준에 맞춰 정의 바랍니다. |
| spltSepa | $@^ | O | Natural-JS에서 사용하는 문자열 구분자. |
| gcMode | full | O | N.gc 함수의 가비지 컬렉션 모드. 자세한 내용은 [N.gc 객체의 함수](../n-gc-object-functions.md) 섹션을 참고하세요. |
| charByteLength | 3 | O | 영문, 숫자 등 1바이트 문자를 제외한 문자들의 기본 바이트 길이를 설정합니다. charByteLength는 N.string.byteLength 함수 및 maxbyte, minbyte, rangebyte 검증 룰 등 문자열의 길이를 체크하는 로직에서 사용합니다. |
