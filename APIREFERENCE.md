# Natural-JS API 레퍼런스

## 목차
- Natural-CORE
- Natural-ARCHITECTURE
- Natural-DATA
- Natural-UI
- Natural-UI.Shell
- Natural-TEMPLATE
- Natural-CODE

## Natural-CORE

### N.remove_
- **설명**: 컬렉션에서 제공된 인덱스 또는 식별자를 기반으로 요소를 제거합니다.
- **옵션/인수**:
  - `idx` (any): 제거할 요소의 인덱스 또는 식별자.
  - `length` (number): 컬렉션의 길이.
- **반환값**: 요소가 제거된 후 컬렉션의 인스턴스.
- **사용법**:
  ```javascript
  N(".button").remove_(1, 2);
  ```

### N.tpBind
- **설명**: 선택된 요소의 지정된 이벤트 유형에 최우선 순위로 실행되는 이벤트 핸들러를 바인딩합니다.
- **옵션/인수**:
  - `eventName` (string): 바인딩할 이벤트 이름.
  - `eventHandler` (JQuery.EventHandler): 이벤트가 발생했을 때 실행될 이벤트 핸들러 함수.
- **반환값**: 현재 객체 (체이닝 가능).
- **사용법**:
  ```javascript
  N(".button").tpBind("click", function() {
      console.log("버튼 클릭됨");
  });
  ```

### N.instance
- **설명**: UI 컴포넌트의 컨텍스트 요소 또는 뷰 요소에 저장된 컴포넌트 객체 또는 컨트롤러 객체의 인스턴스를 반환하거나 저장합니다.
- **옵션/인수**:
  - `name` (string | NC.InstanceCallback): 인스턴스 이름 또는 콜백 함수.
  - `instance` (NC.Instance, 선택적): 선택된 요소에 저장할 인스턴스 또는 인스턴스를 검색하기 위한 콜백 함수.
- **반환값**: undefined, 인스턴스 배열, 단일 인스턴스, 또는 컨텍스트 자체.
- **사용법**:
  ```javascript
  var all = N(".grid01", ".grid02").instance();
  ```

### N.vals
- **설명**: select, input[type=radio], input[type=checkbox] 등의 요소의 선택된 값을 가져오거나 선택합니다.
- **옵션/인수**:
  - `vals` (string | string[] | NC.ValsCallback, 선택적): 선택된 값을 지정하거나 콜백 함수로 처리.
- **반환값**: 선택된 값 (string 또는 string[]), 또는 요소.
- **사용법**:
  ```javascript
  var selectedValue = N(".dropdown").vals();
  ```

### N.events
- **설명**: 선택된 요소에 바인딩된 이벤트를 반환합니다.
- **옵션/인수**:
  - `eventName` (string): 이벤트 이름.
  - `namespace` (string, 선택적): 이벤트의 네임스페이스.
- **반환값**: 이벤트 객체 또는 배열.
- **사용법**:
  ```javascript
  var events = N(".button").events("click");
  ```

### N.locale
- **설명**: 프레임워크에 구성된 기본 로케일 값을 가져오거나 설정합니다.
- **옵션/인수**:
  - `str` (string, 선택적): 설정할 로케일 문자열 (예: "en_US" 또는 "ko_KR").
- **반환값**: 로케일 문자열 (설정 시 반환값 없음).
- **사용법**:
  ```javascript
  var locale = N.locale();
  N.locale("en_US");
  ```

### N.debug
- **설명**: 콘솔에 디버그 레벨의 메시지를 출력합니다.
- **인수**: 
  - `...obj` (any): 콘솔에 출력할 아이템들. 여러 타입의 인수를 전달할 수 있습니다.
- **반환값**: Console 객체
- **사용법**:
  ```javascript
  N.debug("디버그 메시지");
  N.debug(obj1, obj2, obj3);
  ```

### N.log
- **설명**: 콘솔에 일반 로그 메시지를 출력합니다.
- **인수**: 
  - `...obj` (any): 콘솔에 출력할 아이템들. 여러 타입의 인수를 전달할 수 있습니다.
- **반환값**: Console 객체
- **사용법**:
  ```javascript
  N.log("로그 메시지");
  N.log(obj1, obj2, obj3);
  ```

### N.info
- **설명**: 콘솔에 정보 레벨의 메시지를 출력합니다.
- **인수**: 
  - `...obj` (any): 콘솔에 출력할 아이템들. 여러 타입의 인수를 전달할 수 있습니다.
- **반환값**: Console 객체
- **사용법**:
  ```javascript
  N.info("정보 메시지");
  N.info(obj1, obj2, obj3);
  ```

### N.warn
- **설명**: 콘솔에 경고 레벨의 메시지를 출력합니다.
- **인수**: 
  - `...obj` (any): 콘솔에 출력할 아이템들. 여러 타입의 인수를 전달할 수 있습니다.
- **반환값**: Console 객체
- **사용법**:
  ```javascript
  N.warn("경고 메시지");
  N.warn(obj1, obj2, obj3);
  ```

### N.error
- **설명**: 에러를 발생시키고 브라우저 콘솔에 에러 메시지를 출력합니다.
- **인수**: 
  - `msg` (string): 에러 메시지.
  - `e` (Error, 선택적): 에러 객체.
- **반환값**: Error 객체
- **사용법**:
  ```javascript
  throw N.error("에러 메시지");
  ```

### N.type
- **설명**: 제공된 객체의 타입을 반환합니다.
- **옵션/인수**:
  - `obj` (any): 타입을 확인할 객체
- **반환값**: 다음 중 하나의 문자열
  - "number": 숫자 타입
  - "string": 문자열 타입
  - "array": 배열 타입
  - "object": 객체 타입
  - "function": 함수 타입
  - "date": 날짜 타입
- **사용법**:
  ```javascript
  N.type("test"); // "string" 반환
  N.type(123); // "number" 반환
  N.type([]); // "array" 반환
  ```

### N.isString
- **설명**: 주어진 객체가 문자열인지 확인합니다.
- **옵션/인수**:
  - `obj` (any): 확인할 객체
- **반환값**: boolean (문자열이면 true, 아니면 false)
- **사용법**:
  ```javascript
  N.isString("test"); // true
  N.isString(123); // false
  ```

### N.isNumeric
- **설명**: 주어진 객체가 숫자인지 확인합니다.
- **옵션/인수**:
  - `obj` (any): 확인할 객체
- **반환값**: boolean (숫자이면 true, 아니면 false)
- **사용법**:
  ```javascript
  N.isNumeric(123); // true
  N.isNumeric("123"); // true
  N.isNumeric("abc"); // false
  ```

### N.isPlainObject
- **설명**: 주어진 객체가 일반 객체인지 확인합니다.
- **옵션/인수**:
  - `obj` (any): 확인할 객체
- **반환값**: boolean (일반 객체이면 true, 아니면 false)
- **사용법**:
  ```javascript
  N.isPlainObject({}); // true
  N.isPlainObject(new Date()); // false
  ```

### N.isEmptyObject
- **설명**: 주어진 객체가 비어있는지 확인합니다.
- **옵션/인수**:
  - `obj` (any): 확인할 객체
- **반환값**: boolean (객체가 비어있으면 true, 아니면 false)
- **사용법**:
  ```javascript
  N.isEmptyObject({}); // true
  N.isEmptyObject({name: "test"}); // false
  ```

### N.isArray
- **설명**: 주어진 객체가 배열인지 확인합니다.
- **옵션/인수**:
  - `obj` (any): 확인할 객체
- **반환값**: boolean (배열이면 true, 아니면 false)
- **사용법**:
  ```javascript
  N.isArray([]); // true
  N.isArray({}); // false
  ```

### N.serialExecute
- **설명**: 비동기 함수들을 직렬로 실행합니다.
- **옵션/인수**:
  - `args` (Array): 실행할 함수들의 배열
- **반환값**: Promise
- **사용법**:
  ```javascript
  N.serialExecute([
    async () => { /* 작업 1 */ },
    async () => { /* 작업 2 */ }
  ]);
  ```

### N.gc
- **설명**: 가비지 컬렉션 작업을 수행하는 유틸리티
- **옵션**:
  - `full()`: 전체 가비지 컬렉션을 수행
  - `ds()`: ND.ds의 옵저버블에서 가비지 인스턴스 제거
- **사용법**:
  ```javascript
  N.gc.full(); // 전체 GC 수행
  N.gc.ds(); // 데이터 옵저버블 정리
  ```

### N.string
- **설명**: 문자열 처리를 위한 유틸리티 함수들을 제공합니다.
- **메서드**:
  - `contains(context: string, str: string)`: context 문자열에 str이 포함되어 있는지 확인
  - `format(str: string, ...args: any[])`: 문자열 포맷팅
  - `trimToEmpty(str: string)`: 문자열을 트림하고 null/undefined일 경우 빈 문자열 반환
  - `startsWith(context: string, str: string)`: 문자열이 특정 문자열로 시작하는지 확인
  - `endsWith(context: string, str: string)`: 문자열이 특정 문자열로 끝나는지 확인
  - `isEmpty(str: string)`: 문자열이 비어있는지 확인
  - `byteLength(str: string, charByteLength: number)`: 문자열의 바이트 길이 계산
- **사용법**:
  ```javascript
  N.string.contains("Hello World", "World"); // true
  N.string.format("Hello {0}", "World"); // "Hello World"
  N.string.trimToEmpty(null); // ""
  ```

### N.json
- **설명**: JSON 데이터를 처리하기 위한 유틸리티 함수들을 제공합니다.
- **메서드**:
  - `mapFromKeys(obj: object, ...keys: string[])`: 특정 키만 추출하여 새로운 객체 생성
  - `mergeJsonArray(arr1: object[], arr2: object[], key: string)`: 두 JSON 배열을 특정 키를 기준으로 병합
  - `format(oData: object, sIndent: number)`: JSON 데이터를 포맷팅된 문자열로 변환
- **사용법**:
  ```javascript
  const result = N.json.mapFromKeys({ id: 1, name: "John", age: 30 }, "id", "name");
  console.log(result); // { id: 1, name: "John" }
  ```

### N.date
- **설명**: 날짜 처리를 위한 유틸리티 함수들을 제공합니다.
- **메서드**:
  - `diff(refDateStr: string, targetDateStr: string)`: 두 날짜 간의 차이 계산
  - `format(str: string, format: string)`: 날짜 문자열을 특정 포맷으로 변환
  - `dateToTs(dateObj: Date)`: Date 객체를 타임스탬프로 변환
  - `tsToDate(tsNum: number)`: 타임스탬프를 Date 객체로 변환
- **사용법**:
  ```javascript
  const diff = N.date.diff("20230101", "20230110");
  console.log(diff); // 9
  ```

### N.element
- **설명**: HTML 요소를 처리하기 위한 유틸리티 함수들을 제공합니다.
- **메서드**:
  - `toOpts(ele: HTMLElement)`: data-opts 속성을 객체로 변환
  - `maxZindex(ele: HTMLElement)`: 요소의 최대 z-index 계산
- **사용법**:
  ```javascript
  const opts = N.element.toOpts(document.querySelector("#myElement"));
  ```

### N.browser
- **설명**: 브라우저 관련 유틸리티 함수들을 제공합니다.
- **메서드**:
  - `cookie(name: string, value?: string)`: 쿠키 설정 및 조회
  - `contextPath()`: 애플리케이션의 컨텍스트 경로 반환
- **사용법**:
  ```javascript
  const path = N.browser.contextPath();
  ```

### N.message
- **설명**: 다국어 메시지 처리를 위한 유틸리티 함수들을 제공합니다.
- **메서드**:
  - `replaceMsgVars(msg: string, vars: string[])`: 메시지 내 변수 치환
  - `get(resource: object, key: string, vars: string[])`: 다국어 메시지 가져오기
- **사용법**:
  ```javascript
  const msg = N.message.get({ en_US: { greeting: "Hello {0}" } }, "greeting", ["World"]);
  console.log(msg); // "Hello World"
  ```

### N.array
- **설명**: 배열 처리를 위한 유틸리티 함수들을 제공합니다.
- **메서드**:
  - `deduplicate(arr: object[], key: string)`: 배열 중복 제거
- **사용법**:
  ```javascript
  const unique = N.array.deduplicate([{ id: 1 }, { id: 1 }, { id: 2 }], "id");
  console.log(unique); // [{ id: 1 }, { id: 2 }]
  ```

### N.event
- **설명**: 이벤트 처리를 위한 유틸리티 함수들을 제공합니다.
- **메서드**:
  - `isNumberRelatedKeys(e: Event)`: 숫자 입력 관련 키인지 확인
  - `disable(e: Event)`: 이벤트 비활성화
- **사용법**:
  ```javascript
  document.addEventListener("keydown", (e) => {
      if (!N.event.isNumberRelatedKeys(e)) {
          N.event.disable(e);
      }
  });
  ```

## Natural-ARCHITECTURE

### N.comm
- **설명**: 서버와의 Ajax 통신을 지원하는 라이브러리로, 서버에서 콘텐츠나 데이터를 요청하거나 매개변수를 전달합니다.
- **옵션/인수**:
  - `url` (string | NA.Options.Request): 요청을 보낼 URL 또는 요청 옵션 객체.
- **반환값**: Communicator 인스턴스.
- **사용법**:
  - `N.comm(url)`
- **예제**:
  ```javascript
  // JSON 데이터 요청
  N.comm("data.json").submit(function(data, request) {
      console.log("데이터:", data);
      console.log("요청 정보:", request);
  });

  // HTML 페이지 요청
  N("#page-container").comm("page.html").submit(function(controller) {
      console.log("컨트롤러 객체:", controller);
  });

  // Promise 사용
  const fetchData = async () => {
      const data = await N.comm("data.json").submit();
      console.log("데이터:", data);
  };
  ```

### N.cont
- **설명**: Natural-JS의 MVC 아키텍처에서 컨트롤러를 정의하고 관리합니다. 컨트롤러는 뷰(View)와 데이터를 제어하는 객체입니다.
- **옵션/인수**:
  - `contObj` (NA.Objects.Controller.Object): 컨트롤러 객체.
- **반환값**: 컨트롤러 객체 인스턴스.
- **사용법**:
  ```javascript
  // 컨트롤러 정의
  N(".view").cont({
      init: function(view, request) {
          console.log("뷰 요소:", view);
          console.log("요청 객체:", request);
      }
  });

  // 컨트롤러 인스턴스 가져오기
  var controller = N("#page01").instance("cont");
  controller.someMethod();
  ```

### N.context
- **설명**: Natural-JS의 환경 설정과 글로벌 상태를 관리하는 컨텍스트 객체입니다.
- **메서드**:
  - `attr(name: string)`: 컨텍스트에 저장된 데이터를 조회.
  - `attr(name: string, obj: any)`: 컨텍스트에 데이터를 저장.
- **사용법**:
  ```javascript
  // 데이터 조회
  var coreConfig = N.context.attr("core");

  // 데이터 설정
  N.context.attr("ui", {
      alert: {
          container: "#alertContainer"
      }
  });

  // 데이터 업데이트
  N.context.attr("architecture", {
      comm: {
          defaultContentType: "application/json"
      }
  });
  ```

### N.config
- **설명**: Natural-JS의 운영 환경 설정, AOP 설정, 통신 필터 설정, UI 컴포넌트의 글로벌 옵션값을 저장합니다.
- **패키지별 설정**:
  - `N.context.attr("core")`: Natural-CORE 패키지 라이브러리의 기본 설정.
  - `N.context.attr("architecture")`: Natural-ARCHITECTURE 패키지 라이브러리의 기본 설정.
  - `N.context.attr("data")`: Natural-DATA 패키지 라이브러리의 기본 설정.
  - `N.context.attr("ui")`: Natural-UI 패키지 라이브러리의 기본 설정.
  - `N.context.attr("ui.shell")`: Natural-UI.Shell 패키지 라이브러리의 기본 설정.
- **사용법**:
  ```javascript
  // 환경 설정 예시
  N.context.attr("architecture", {
      page: {
          context: "#page"
      },
      comm: {
          defaultContentType: "application/json"
      }
  });

  // 필터 설정
  N.context.attr("architecture").comm.filters = {
      beforeSendFilters: [{
          name: "로딩 표시",
          handler: function(request) {
              console.log("요청 전 로딩 표시");
          }
      }],
      successFilters: [{
          name: "응답 처리",
          handler: function(request, response) {
              console.log("응답 데이터 처리:", response);
          }
      }]
  };
  ```

### Request 객체
- **설명**: 서버와의 통신을 위한 요청 객체를 정의합니다.
- **속성**:
  - `url` (string): 요청을 보낼 URL
  - `method` (string): HTTP 메서드 (GET, POST, PUT, DELETE)
  - `contentType` (string): 요청의 Content-Type
  - `dataType` (string): 응답 데이터 타입 (json, xml, html, text 등)
  - `success` (function): 통신 성공 시 실행될 콜백 함수
  - `error` (function): 통신 실패 시 실행될 콜백 함수
- **사용법**:
  ```javascript
  var request = new N.Request({
      url: "/api/data",
      method: "POST",
      contentType: "application/json",
      dataType: "json",
      success: function(data) {
          console.log("데이터 수신 성공:", data);
      },
      error: function(xhr, status, error) {
          console.error("통신 실패:", error);
      }
  });
  ```

### Filter 객체
- **설명**: 서버 통신 전후에 실행되는 필터를 정의합니다.
- **필터 종류**:
  - `beforeInitFilters`: 통신 초기화 전 실행
  - `afterInitFilters`: 통신 초기화 후 실행
  - `beforeSendFilters`: 요청 전송 전 실행
  - `successFilters`: 통신 성공 시 실행
  - `errorFilters`: 통신 실패 시 실행
  - `completeFilters`: 통신 완료 시 실행
- **사용법**:
  ```javascript
  N.context.attr("architecture").comm.filters = {
      beforeSendFilters: [{
          name: "로딩 표시",
          handler: function(request) {
              // 통신 시작 전 로딩 표시
          }
      }],
      successFilters: [{
          name: "응답 처리",
          handler: function(request, response) {
              // 응답 데이터 처리
          }
      }]
  };
  ```

## Natural-DATA

### N.formatter
- **설명**: 데이터 포맷팅을 위한 유틸리티입니다. 입력 데이터 세트(배열 형태의 JSON 객체)를 포맷팅하여 포맷된 데이터 세트를 반환합니다.  
  - HTML 요소의 `data-format` 속성을 기반으로 포맷팅 규칙을 선언적으로 지정할 수 있습니다.
  - 문자열 단위로도 포맷팅이 가능합니다.
  - 포맷팅 규칙은 여러 개를 조합하여 사용할 수 있습니다.
- **포맷 규칙**:
  - `commas`: 숫자에 천 단위 구분자 적용
  - `phone`: 전화번호 포맷 적용
  - `rrn`: 주민등록번호 포맷 적용
  - `ssn`: 사회보장번호 포맷 적용
  - `kbrn`: 사업자등록번호 포맷 적용
  - `kcn`: 법인등록번호 포맷 적용
  - `date`: 날짜 포맷 적용
  - `time`: 시간 포맷 적용
  - `upper`: 대문자 변환
  - `lower`: 소문자 변환
  - `capitalize`: 첫 글자만 대문자로 변환
  - `zipcode`: 우편번호 포맷 적용
  - `trimToEmpty`: 문자열을 트림하고 null/undefined일 경우 빈 문자열 반환
  - `limit`: 문자열 길이 제한 후 특정 문자 추가
  - `replace`: 문자열 치환
  - `lpad`: 왼쪽 채우기
  - `rpad`: 오른쪽 채우기
  - `mask`: 문자열 마스킹
  - `generic`: 사용자 정의 포맷
  - `numeric`: 숫자 포맷
- **사용법**:
  ```javascript
  // HTML 선언적 방식
  <input type="text" data-format="phone" />
  <input type="text" data-format="rrn" />
  
  // 자바스크립트 방식
  N("#phone").format("phone");
  N("#amount").format("commas");

  // 데이터 세트 포맷팅
  const data = [{ amount: "1000" }];
  const formatted = N.formatter(data, { amount: [["commas"]] }).format();
  console.log(formatted); // [{ amount: "1,000" }]

  // 문자열 포맷팅
  const formattedString = N.formatter("1234567890", [["phone"]]);
  console.log(formattedString); // "123-456-7890"
  ```

### N.validator
- **설명**: 입력값의 유효성을 검사하는 유틸리티입니다.  
  - HTML 요소의 `data-validate` 속성을 기반으로 유효성 검사를 선언적으로 지정할 수 있습니다.
  - 문자열 단위로도 유효성 검사가 가능합니다.
  - 유효성 검사 실패 시, 기본적으로 오류 메시지를 표시합니다.
- **검증 규칙**:
  - `required`: 필수 입력 검사
  - `number`: 숫자 여부 검사
  - `email`: 이메일 형식 검사
  - `url`: URL 형식 검사
  - `date`: 날짜 형식 검사
  - `time`: 시간 형식 검사
  - `accept`: 허용된 값 검사
  - `match`: 정규식 패턴 매칭 검사
  - `equalTo`: 다른 필드와 값이 동일한지 검사
  - `maxlength`: 최대 길이 검사
  - `minlength`: 최소 길이 검사
  - `rangelength`: 길이 범위 검사
  - `maxvalue`: 최대값 검사
  - `minvalue`: 최소값 검사
  - `rangevalue`: 값 범위 검사
- **사용법**:
  ```javascript
  // HTML 선언적 방식
  <input type="text" data-validate="required" />
  <input type="text" data-validate="email" />
  
  // 자바스크립트 방식
  if (N("#email").validate("email")) {
      console.log("유효한 이메일 주소입니다.");
  }

  // 데이터 세트 유효성 검사
  const data = [{ email: "test@example.com" }];
  const validationResult = N.validator(data, { email: [["email"]] }).validate();
  console.log(validationResult);

  // 문자열 유효성 검사
  const isValid = N.validator("test@example.com", [["email"]]);
  console.log(isValid); // true
  ```

### N.ds (DataSync)
- **설명**: 양방향 데이터 바인딩을 처리하는 모듈입니다.
- **주요 기능**:
  - UI 요소와 데이터 객체 간의 자동 동기화
  - 데이터 변경 감지 및 UI 업데이트
  - 폼 데이터의 자동 수집 및 바인딩
- **사용법**:
  ```javascript
  // 데이터 바인딩
  const data = { name: "홍길동", age: 30 };
  N("#form").bind(data);

  // 데이터 동기화 설정
  N.ds.observe(data, function(changes) {
      console.log("데이터 변경:", changes);
  });

  // 데이터 변경 알림
  const dsInstance = N.ds.instance(data);
  dsInstance.notify(0, "name");
  ```

### N.data
- **설명**: 배열(JSON 객체 배열) 타입 데이터의 정렬, 필터링, 정제를 위한 메서드와 함수를 제공합니다.
- **주요 메서드**:
  - `filter(data, condition)`: 조건에 맞는 데이터만 필터링
  - `sort(data, key, reverse)`: 데이터를 지정된 키로 정렬
  - `toJSON(data)`: 데이터를 JSON 문자열로 변환
  - `fromJSON(jsonStr)`: JSON 문자열을 데이터 객체로 변환
  - `copy(data)`: 데이터의 깊은 복사본 생성
- **사용법**:
  ```javascript
  const users = [
      { name: "홍길동", age: 30 },
      { name: "김철수", age: 25 }
  ];

  // 나이순 정렬
  const sorted = N.data.sort(users, "age");

  // 나이가 25세 이상인 사용자만 필터링
  const adults = N.data.filter(users, user => user.age >= 25);

  console.log(sorted);
  console.log(adults);

  // JSON 변환
  const jsonString = N.data.toJSON(users);
  console.log(jsonString);

  // JSON 문자열에서 객체로 변환
  const parsedData = N.data.fromJSON(jsonString);
  console.log(parsedData);

  // 데이터 복사
  const copiedData = N.data.copy(users);
  console.log(copiedData);
  ```

## Natural-UI

### N.alert
- **설명**: 경고 메시지 다이얼로그를 생성하고 관리하는 컴포넌트입니다.
- **옵션/인수**:
  - `context` (Window | NJS<HTMLElement[]>): Alert가 표시될 영역을 지정합니다. `modal` 옵션이 `true`일 경우, `context`로 지정된 요소를 덮는 오버레이가 생성됩니다.
  - `msg` (string | NJS<HTMLElement[]>): 표시할 메시지 내용입니다. 문자열, HTML 요소, 또는 jQuery 객체를 사용할 수 있습니다.
  - `vars` (string[]): 메시지 내 변수(예: `{0}`)를 대체할 값 배열입니다.
  - `html` (boolean): 메시지 내용에 HTML을 적용할지 여부를 설정합니다. 기본값은 `false`입니다.
  - `top` (number): 메시지 다이얼로그의 상단 위치(px).
  - `left` (number): 메시지 다이얼로그의 좌측 위치(px).
  - `width` (number | function): 다이얼로그의 너비(px). 함수로 지정할 경우, `msgContext`와 `msgContents`를 인수로 받아 너비를 반환합니다.
  - `height` (number | function): 다이얼로그의 높이(px). 함수로 지정할 경우, `msgContext`와 `msgContents`를 인수로 받아 높이를 반환합니다.
  - `title` (string): 다이얼로그의 제목. 설정하지 않으면 제목 표시줄이 생성되지 않습니다.
  - `button` (boolean): 기본 버튼(확인/취소 버튼)을 표시할지 여부. 기본값은 `true`입니다.
  - `okButtonOpts` (NU.Options.Button): 확인 버튼에 적용할 버튼 옵션.
  - `cancelButtonOpts` (NU.Options.Button): 취소 버튼에 적용할 버튼 옵션.
  - `closeMode` ("hide" | "remove"): 다이얼로그 닫기 시 요소를 숨길지(`hide`) 또는 제거할지(`remove`) 설정합니다.
  - `modal` (boolean): 모달 오버레이를 생성할지 여부. 기본값은 `true`입니다.
  - `overlayClose` (boolean): 오버레이 클릭 시 다이얼로그를 닫을지 여부. 기본값은 `true`입니다.
  - `overlayColor` (string | null): 오버레이 배경색.
  - `escClose` (boolean): ESC 키로 다이얼로그를 닫을지 여부. 기본값은 `true`입니다.
  - `confirm` (boolean): 확인/취소 버튼을 모두 표시할지 여부. 기본값은 `false`입니다.
  - `alwaysOnTop` (boolean): 다이얼로그를 항상 최상단에 표시할지 여부. 기본값은 `false`입니다.
  - `alwaysOnTopCalcTarget` (string): 최상단 z-index 계산 시 참조할 요소를 지정합니다.
  - `dynPos` (boolean): 브라우저 크기 조정 시 다이얼로그 위치를 자동으로 조정할지 여부. 기본값은 `true`입니다.
  - `windowScrollLock` (boolean): 다이얼로그 표시 중 브라우저 스크롤을 비활성화할지 여부. 기본값은 `true`입니다.
  - `draggable` (boolean): 다이얼로그를 드래그 가능하게 할지 여부. 기본값은 `false`입니다.
  - `draggableOverflowCorrection` (boolean): 드래그 시 화면 밖으로 벗어난 다이얼로그를 자동으로 이동시킬지 여부. 기본값은 `true`입니다.
  - `draggableOverflowCorrectionAddValues` (object): 드래그 시 다이얼로그 위치 보정값.
    - `top` (number): 상단 보정값.
    - `bottom` (number): 하단 보정값.
    - `left` (number): 좌측 보정값.
    - `right` (number): 우측 보정값.
  - `saveMemory` (boolean): 메모리 사용량을 줄이기 위해 불필요한 참조 요소를 제거할지 여부. 기본값은 `false`입니다.
- **이벤트 옵션**:
  - `onOk` (function): 확인 버튼 클릭 시 실행되는 이벤트 핸들러.
    - **인수**:
      - `msgContext` (HTMLElement[]): 메시지 오버레이 요소.
      - `msgContents` (HTMLElement[]): 메시지 다이얼로그 요소.
    - **예제**:
      ```javascript
      onOk: function(msgContext, msgContents) {
          console.log("확인 버튼 클릭됨");
      }
      ```
  - `onCancel` (function): 취소 버튼 클릭 또는 ESC 키 입력 시 실행되는 이벤트 핸들러.
    - **인수**:
      - `msgContext` (HTMLElement[]): 메시지 오버레이 요소.
      - `msgContents` (HTMLElement[]): 메시지 다이얼로그 요소.
    - **예제**:
      ```javascript
      onCancel: function(msgContext, msgContents) {
          console.log("취소 버튼 클릭됨");
      }
      ```
  - `onBeforeShow` (function): 다이얼로그 표시 전 실행되는 이벤트 핸들러.
    - **인수**:
      - `msgContext` (HTMLElement[]): 메시지 오버레이 요소.
      - `msgContents` (HTMLElement[]): 메시지 다이얼로그 요소.
  - `onShow` (function): 다이얼로그 표시 후 실행되는 이벤트 핸들러.
  - `onBeforeHide` (function): 다이얼로그 숨기기 전 실행되는 이벤트 핸들러.
  - `onHide` (function): 다이얼로그 숨긴 후 실행되는 이벤트 핸들러.
  - `onBeforeRemove` (function): 다이얼로그 제거 전 실행되는 이벤트 핸들러.
  - `onRemove` (function): 다이얼로그 제거 후 실행되는 이벤트 핸들러.
- **사용법**:
  ```javascript
  N(window).alert({
      msg: "안녕하세요, {0}!",
      vars: ["Natural-JS"],
      onOk: function(msgContext, msgContents) {
          console.log("확인 버튼 클릭됨");
      }
  }).show();
  ```

### N.button
- **설명**: 버튼 컴포넌트를 생성하고 관리합니다.
- **옵션/인수**:
  - `context` (NJS<HTMLElement[]>): 버튼이 적용될 요소.
  - `size` ("none" | "smaller" | "small" | "medium" | "large" | "big"): 버튼 크기.
  - `color` ("none" | "primary" | "secondary" | "tertiary"): 버튼 색상.
  - `type` ("none" | "filled" | "outlined" | "elevated"): 버튼 스타일.
  - `disable` (boolean): 버튼 비활성화 여부. 기본값은 `false`입니다.
- **이벤트 옵션**:
  - `onBeforeCreate` (function): 버튼 생성 전 실행되는 이벤트 핸들러.
    - **인수**:
      - `context` (HTMLElement[]): 버튼 요소.
      - `opts` (object): 버튼 옵션.
  - `onCreate` (function): 버튼 생성 후 실행되는 이벤트 핸들러.
    - **인수**:
      - `context` (HTMLElement[]): 버튼 요소.
      - `opts` (object): 버튼 옵션.
- **사용법**:
  ```javascript
  N("#myButton").button({
      size: "large",
      color: "primary",
      onCreate: function(context, opts) {
          console.log("버튼 생성 완료");
      }
  });
  ```

### N.datepicker
- **설명**: 날짜 선택 컴포넌트를 생성하고 관리합니다.
- **옵션/인수**:
  - `context` (NJS<HTMLElement[]>): Datepicker가 적용될 입력 요소.
  - `monthonly` (boolean): 월만 선택 가능하게 설정. 기본값은 `false`입니다.
  - `focusin` (boolean): 입력 요소 포커스 시 Datepicker 표시 여부. 기본값은 `true`입니다.
  - `minDate` (string): 선택 가능한 최소 날짜.
  - `maxDate` (string): 선택 가능한 최대 날짜.
- **이벤트 옵션**:
  - `onChangeYear` (function): 연도 변경 시 실행되는 이벤트 핸들러.
    - **인수**:
      - `context` (HTMLElement[]): Datepicker 요소.
      - `year` (number): 선택된 연도.
      - `e` (Event): 이벤트 객체.
- **사용법**:
  ```javascript
  N("#dateInput").datepicker({
      minDate: "2023-01-01",
      maxDate: "2023-12-31",
      onChangeYear: function(context, year, e) {
          console.log("연도 변경됨:", year);
      }
  });
  ```

### N.popup
- **설명**: 팝업 창을 생성하고 관리하는 컴포넌트입니다.
- **옵션/인수**:
  - `context` (NJS<HTMLElement[]>): 팝업이 적용될 요소.
  - `url` (string): 팝업에 로드할 콘텐츠의 URL.
  - `width` (number): 팝업의 너비(px).
  - `height` (number): 팝업의 높이(px).
  - `modal` (boolean): 모달 팝업 여부. 기본값은 `true`입니다.
  - `draggable` (boolean): 팝업을 드래그 가능하게 설정. 기본값은 `false`입니다.
  - `resizable` (boolean): 팝업 크기 조정 가능 여부. 기본값은 `false`입니다.
  - `closeButton` (boolean): 닫기 버튼 표시 여부. 기본값은 `true`입니다.
  - `escClose` (boolean): ESC 키로 팝업 닫기 여부. 기본값은 `true`입니다.
- **이벤트 옵션**:
  - `onOpen` (function): 팝업 열기 시 실행되는 이벤트 핸들러.
    - **인수**:
      - `context` (HTMLElement[]): 팝업 요소.
      - `data` (any): 팝업 열기 시 전달된 데이터.
  - `onClose` (function): 팝업 닫기 시 실행되는 이벤트 핸들러.
    - **인수**:
      - `context` (HTMLElement[]): 팝업 요소.
      - `data` (any): 팝업 닫기 시 전달된 데이터.
- **사용법**:
  ```javascript
  N("#popupContainer").popup({
      url: "/content.html",
      width: 400,
      height: 300,
      onOpen: function(context, data) {
          console.log("팝업 열림:", data);
      },
      onClose: function(context, data) {
          console.log("팝업 닫힘:", data);
      }
  }).open();
  ```

### N.tab
- **설명**: 탭 컴포넌트를 생성하고 관리합니다.
- **옵션/인수**:
  - `context` (NJS<HTMLElement[]>): 탭이 적용될 요소.
  - `activeIndex` (number): 기본 활성화 탭의 인덱스. 기본값은 `0`입니다.
  - `loadOnDemand` (boolean): 탭 콘텐츠를 필요 시 로드할지 여부. 기본값은 `false`입니다.
  - `animation` (boolean): 탭 전환 시 애니메이션 효과 여부. 기본값은 `true`입니다.
- **이벤트 옵션**:
  - `onChange` (function): 탭 변경 시 실행되는 이벤트 핸들러.
    - **인수**:
      - `context` (HTMLElement[]): 탭 요소.
      - `index` (number): 활성화된 탭의 인덱스.
  - `onLoad` (function): 탭 콘텐츠 로드 시 실행되는 이벤트 핸들러.
    - **인수**:
      - `context` (HTMLElement[]): 탭 콘텐츠 요소.
      - `index` (number): 로드된 탭의 인덱스.
- **사용법**:
  ```javascript
  N("#tabContainer").tab({
      activeIndex: 1,
      loadOnDemand: true,
      onChange: function(context, index) {
          console.log("탭 변경됨:", index);
      },
      onLoad: function(context, index) {
          console.log("탭 콘텐츠 로드됨:", index);
      }
  });
  ```

### N.select
- **설명**: 드롭다운 또는 선택 컴포넌트를 생성하고 관리합니다.
- **옵션/인수**:
  - `context` (NJS<HTMLElement[]>): 선택 컴포넌트가 적용될 요소.
  - `data` (Array<object>): 드롭다운에 표시할 데이터 배열.
  - `valueField` (string): 데이터에서 값으로 사용할 필드 이름.
  - `textField` (string): 데이터에서 텍스트로 사용할 필드 이름.
  - `placeholder` (string): 기본 표시 텍스트.
  - `multiple` (boolean): 다중 선택 가능 여부. 기본값은 `false`입니다.
- **이벤트 옵션**:
  - `onChange` (function): 선택 변경 시 실행되는 이벤트 핸들러.
    - **인수**:
      - `context` (HTMLElement[]): 선택 요소.
      - `value` (any): 선택된 값.
  - `onOpen` (function): 드롭다운 열기 시 실행되는 이벤트 핸들러.
  - `onClose` (function): 드롭다운 닫기 시 실행되는 이벤트 핸들러.
- **사용법**:
  ```javascript
  N("#dropdown").select({
      data: [
          { id: 1, name: "Option 1" },
          { id: 2, name: "Option 2" }
      ],
      valueField: "id",
      textField: "name",
      placeholder: "Select an option",
      onChange: function(context, value) {
          console.log("선택된 값:", value);
      }
  });
  ```

### N.form
- **설명**: 폼 데이터를 관리하고 양방향 데이터 바인딩을 지원하는 컴포넌트입니다.
- **옵션/인수**:
  - `context` (NJS<HTMLElement[]>): 폼이 적용될 요소.
  - `validate` (boolean): 유효성 검사 활성화 여부. 기본값은 `true`입니다.
  - `autoBind` (boolean): 데이터 변경 시 자동으로 바인딩할지 여부. 기본값은 `true`입니다.
- **이벤트 옵션**:
  - `onValidate` (function): 유효성 검사 시 실행되는 이벤트 핸들러.
    - **인수**:
      - `context` (HTMLElement[]): 폼 요소.
      - `isValid` (boolean): 유효성 검사 결과.
  - `onBind` (function): 데이터 바인딩 시 실행되는 이벤트 핸들러.
    - **인수**:
      - `context` (HTMLElement[]): 폼 요소.
      - `data` (object): 바인딩된 데이터.
- **사용법**:
  ```javascript
  N("#formContainer").form({
      validate: true,
      onValidate: function(context, isValid) {
          console.log("유효성 검사 결과:", isValid);
      },
      onBind: function(context, data) {
          console.log("데이터 바인딩 완료:", data);
      }
  });
  ```

### N.list
- **설명**: 리스트 데이터를 관리하고 UI와 동기화하는 컴포넌트입니다.
- **옵션/인수**:
  - `context` (NJS<HTMLElement[]>): 리스트가 적용될 요소.
  - `selectable` (boolean): 항목 선택 가능 여부. 기본값은 `false`입니다.
  - `multiSelect` (boolean): 다중 선택 가능 여부. 기본값은 `false`입니다.
- **이벤트 옵션**:
  - `onSelect` (function): 항목 선택 시 실행되는 이벤트 핸들러.
    - **인수**:
      - `context` (HTMLElement[]): 리스트 요소.
      - `selectedItems` (Array): 선택된 항목 데이터.
  - `onBind` (function): 데이터 바인딩 시 실행되는 이벤트 핸들러.
    - **인수**:
      - `context` (HTMLElement[]): 리스트 요소.
      - `data` (Array): 바인딩된 데이터.
- **사용법**:
  ```javascript
  N("#listContainer").list({
      selectable: true,
      multiSelect: true,
      onSelect: function(context, selectedItems) {
          console.log("선택된 항목:", selectedItems);
      },
      onBind: function(context, data) {
          console.log("리스트 데이터 바인딩 완료:", data);
      }
  });
  ```

### N.grid
- **설명**: 테이블 형태의 데이터를 관리하고 UI와 동기화하는 컴포넌트입니다.
- **옵션/인수**:
  - `context` (NJS<HTMLElement[]>): 그리드가 적용될 요소.
  - `sortable` (boolean): 열 정렬 가능 여부. 기본값은 `false`입니다.
  - `filterable` (boolean): 열 필터링 가능 여부. 기본값은 `false`입니다.
- **이벤트 옵션**:
  - `onSort` (function): 열 정렬 시 실행되는 이벤트 핸들러.
    - **인수**:
      - `context` (HTMLElement[]): 그리드 요소.
      - `column` (string): 정렬된 열 이름.
      - `order` ("asc" | "desc"): 정렬 순서.
  - `onFilter` (function): 열 필터링 시 실행되는 이벤트 핸들러.
    - **인수**:
      - `context` (HTMLElement[]): 그리드 요소.
      - `filters` (object): 적용된 필터 조건.
- **사용법**:
  ```javascript
  N("#gridContainer").grid({
      sortable: true,
      filterable: true,
      onSort: function(context, column, order) {
          console.log("정렬된 열:", column, "순서:", order);
      },
      onFilter: function(context, filters) {
          console.log("적용된 필터:", filters);
      }
  });
  ```

### N.pagination
- **설명**: 페이지 네비게이션을 관리하는 컴포넌트입니다.
- **옵션/인수**:
  - `context` (NJS<HTMLElement[]>): 페이지네이션이 적용될 요소.
  - `totalCount` (number): 전체 데이터 개수.
  - `pageSize` (number): 페이지당 데이터 개수.
- **이벤트 옵션**:
  - `onPageChange` (function): 페이지 변경 시 실행되는 이벤트 핸들러.
    - **인수**:
      - `context` (HTMLElement[]): 페이지네이션 요소.
      - `pageNo` (number): 현재 페이지 번호.
- **사용법**:
  ```javascript
  N("#paginationContainer").pagination({
      totalCount: 100,
      pageSize: 10,
      onPageChange: function(context, pageNo) {
          console.log("현재 페이지:", pageNo);
      }
  });
  ```

## Natural-UI.Shell

### N.notify
- **설명**: 알림 메시지를 표시하는 컴포넌트입니다.
- **옵션/인수**:
  - `position` (object): 메시지가 표시될 위치를 설정합니다.
    - `left` (number, 선택적): 왼쪽 위치(px).
    - `right` (number, 선택적): 오른쪽 위치(px).
    - `top` (number, 선택적): 상단 위치(px).
    - `bottom` (number, 선택적): 하단 위치(px).
  - `container` (NJS<HTMLElement[]>): 메시지 요소를 포함할 글로벌 메시지 컨테이너. 기본값은 `N("body")`.
  - `context` (NJS<HTMLElement[]>): 메시지를 표시할 요소의 인스턴스.
  - `displayTime` (number): 메시지가 표시될 시간(초). 기본값은 `7`.
  - `alwaysOnTop` (boolean): 메시지 다이얼로그를 항상 최상단에 표시할지 여부. 기본값은 `false`.
  - `html` (boolean): 메시지 내용에 HTML을 적용할지 여부. 기본값은 `false`.
  - `alwaysOnTopCalcTarget` (string): 최상단 z-index 계산 시 참조할 요소를 지정. 기본값은 `"div, span, ul, p, nav, article, section, header, footer, aside"`.
- **이벤트 옵션**:
  - 없음.
- **사용법**:
  ```javascript
  N.notify({
      position: { top: 10, right: 10 },
      displayTime: 5,
      html: true,
      alwaysOnTop: true
  }).add("알림 메시지", "https://example.com");
  ```

### N.docs
- **설명**: 문서 탭을 관리하는 컴포넌트로, MDI(Multiple-Document Interface) 또는 SDI(Single-Document Interface) 형식으로 문서를 관리합니다.
- **옵션/인수**:
  - `context` (NJS<HTMLElement[]>): N.docs가 적용될 요소.
  - `multi` (boolean): MDI 형식으로 생성할지 여부. 기본값은 `true`.
  - `maxStateful` (number): 상태를 유지할 탭 콘텐츠의 최대 개수. 기본값은 `0`(제한 없음).
  - `maxTabs` (number): 열 수 있는 탭 콘텐츠의 최대 개수. 기본값은 `0`(제한 없음).
  - `addLast` (boolean): 새 탭을 마지막에 추가할지 여부. 기본값은 `false`.
  - `tabScroll` (boolean): 탭을 마우스 드래그 또는 터치로 스크롤할 수 있도록 설정. 기본값은 `false`.
  - `tabScrollCorrection` (object): 탭 스크롤 시 스타일로 인해 발생하는 문제를 보정.
    - `rightCorrectionPx` (number): 마지막 탭이 잘리거나 간격이 생길 때 보정값(px). 기본값은 `0`.
  - `closeAllRedirectURL` (string | null): "모두 닫기" 버튼 클릭 시 리디렉션할 URL. 기본값은 `null`.
  - `entireLoadIndicator` (boolean): 페이지 로드 시 모든 Ajax 요청 완료까지 진행 표시줄을 표시할지 여부. 기본값은 `false`.
  - `entireLoadScreenBlock` (boolean): 페이지 로드 중 화면을 차단할지 여부. 기본값은 `false`.
  - `entireLoadExcludeURLs` (string[]): 전체 로드 관련 이벤트에서 제외할 URL 목록. 기본값은 `[]`.
  - `alwaysOnTop` (boolean): 메뉴 리스트 다이얼로그를 항상 최상단에 표시할지 여부. 기본값은 `false`.
  - `alwaysOnTopCalcTarget` (string): 최상단 z-index 계산 시 참조할 요소를 지정. 기본값은 `"div, span, ul, p, nav, article, section, header, footer, aside"`.
- **이벤트 옵션**:
  - `onBeforeLoad` (function): 콘텐츠 로드 전 실행.
    - **인수**:
      - `docId` (string): 문서 ID.
      - `target` (HTMLElement[]): 콘텐츠가 로드될 요소.
    - **예제**:
      ```javascript
      onBeforeLoad: function(docId, target) {
          console.log("로드 전:", docId, target);
      }
      ```
  - `onLoad` (function): 페이지 로드 후 실행.
    - **인수**:
      - `docId` (string): 문서 ID.
    - **예제**:
      ```javascript
      onLoad: function(docId) {
          console.log("로드 완료:", docId);
      }
      ```
  - `onBeforeActive` (function): 탭 활성화 전 실행.
    - **인수**:
      - `docId` (string): 문서 ID.
    - **예제**:
      ```javascript
      onBeforeActive: function(docId) {
          console.log("활성화 전:", docId);
      }
      ```
  - `onActive` (function): 탭 활성화 후 실행.
    - **인수**:
      - `docId` (string): 문서 ID.
    - **예제**:
      ```javascript
      onActive: function(docId) {
          console.log("활성화 완료:", docId);
      }
      ```
  - `onBeforeRemove` (function): 탭 제거 전 실행.
    - **인수**:
      - `docId` (string): 문서 ID.
    - **예제**:
      ```javascript
      onBeforeRemove: function(docId) {
          console.log("제거 전:", docId);
      }
      ```
  - `onRemove` (function): 탭 제거 후 실행.
    - **인수**:
      - `docId` (string): 문서 ID.
    - **예제**:
      ```javascript
      onRemove: function(docId) {
          console.log("제거 완료:", docId);
      }
      ```
- **사용법**:
  ```javascript
  N("#docsContainer").docs({
      multi: true,
      maxTabs: 5,
      onLoad: function(docId) {
          console.log("문서 로드 완료:", docId);
      },
      onBeforeRemove: function(docId) {
          console.log("문서 제거 전:", docId);
      }
  }).add("doc1", "문서 1", { url: "/doc1.html" });
  ```

## Natural-TEMPLATE

### N.template
- **설명**: HTML 템플릿을 동적으로 처리하고 UI 컴포넌트를 초기화하는 유틸리티입니다.
- **메서드**:
  - `render(templateId: string, data: object)`: 지정된 템플릿 ID와 데이터를 사용하여 HTML을 렌더링합니다.
  - `bind(context: HTMLElement, data: object)`: HTML 요소와 데이터를 바인딩합니다.
  - `initialize(context: HTMLElement)`: 지정된 컨텍스트 내의 UI 컴포넌트를 초기화합니다.
- **사용법**:
  ```javascript
  // 템플릿 렌더링
  const html = N.template.render("templateId", { name: "홍길동" });
  document.getElementById("container").innerHTML = html;

  // 데이터 바인딩
  N.template.bind(document.getElementById("form"), { name: "홍길동", age: 30 });

  // UI 컴포넌트 초기화
  N.template.initialize(document.getElementById("container"));
  ```

### N.template.options
- **설명**: 템플릿에서 사용할 수 있는 추가 옵션을 정의합니다.
- **옵션**:
  - `action` (string | [string, ...any[]]): 컴포넌트 초기화 후 실행할 함수와 인수.
  - `usage` (string | object): 템플릿의 용도를 정의합니다. 예를 들어, "search-box"로 설정하면 검색 박스 폼으로 동작합니다.
    - `search-box`:
      - `defaultButton` (JQuery.Selector): 기본 버튼 선택자.
      - `events` (Array): 이벤트 정의 배열.
        - `event` (string): 이벤트 이름.
        - `target` (JQuery.Selector): 이벤트 대상.
        - `handler` (function): 이벤트 핸들러.
- **사용법**:
  ```javascript
  const options = {
      action: ["initialize", { param1: "value1" }],
      usage: {
          "search-box": {
              defaultButton: "#searchButton",
              events: [
                  {
                      event: "click",
                      target: "#searchButton",
                      handler: function(e) {
                          console.log("검색 버튼 클릭됨");
                      }
                  }
              ]
          }
      }
  };
  ```

### N.template.select
- **설명**: 선택 요소를 동적으로 생성하고 데이터를 바인딩합니다.
- **옵션**:
  - `code` (string): 공통 코드 분류 코드.
  - `comm` (string): 데이터를 가져올 Communicator 이름.
  - `data` (Array<object>): 직접 바인딩할 데이터 배열.
  - `key` (string): 선택 요소의 라벨로 사용할 데이터 속성 이름.
  - `val` (string): 선택 요소의 값으로 사용할 데이터 속성 이름.
  - `filter` (function): 데이터를 바인딩하기 전에 필터링하는 함수.
  - `selected` (string): 기본 선택 값.
- **사용법**:
  ```javascript
  N.template.select({
      code: "userRoles",
      key: "roleName",
      val: "roleId",
      selected: "admin",
      filter: function(data) {
          return data.filter(item => item.active);
      }
  });
  ```

### N.template.events
- **설명**: 템플릿에서 이벤트를 정의하고 처리합니다.
- **옵션**:
  - `target` (JQuery.Selector): 이벤트 대상.
  - `handler` (function): 이벤트 핸들러.
- **사용법**:
  ```javascript
  const events = {
      target: "#submitButton",
      handler: function(e) {
          console.log("버튼 클릭됨");
      }
  };
  ```

### N.template.components
- **설명**: 템플릿 내에서 UI 컴포넌트를 초기화합니다.
- **옵션**:
  - `context` (HTMLElement): 초기화할 컴포넌트가 포함된 컨텍스트.
  - `defer` (JQuery.Deferred[]): 초기화 작업을 비동기로 처리하기 위한 Deferred 객체 배열.
- **사용법**:
  ```javascript
  N.template.components({
      context: document.getElementById("container"),
      defer: []
  });
  ```

### N.template.aop
- **설명**: 템플릿 처리에 AOP(관점 지향 프로그래밍)를 적용합니다.
- **메서드**:
  - `codes(cont: object, joinPoint: unknown)`: 공통 코드 처리.
  - `template(cont: object, joinPoint: unknown)`: 템플릿 처리.
  - `components(cont: object, prop: string, compActionDefer: JQuery.Deferred<any>[])`: 컴포넌트 초기화.
  - `events(cont: object, prop: string)`: 이벤트 처리.
- **사용법**:
  ```javascript
  N.template.aop.codes(controller, joinPoint);
  N.template.aop.template(controller, joinPoint);
  ```

## Natural-CODE

### NCD.SeverityLevels
- **설명**: 코드 검사 결과의 심각도 수준을 정의하는 열거형입니다.
- **값**:
  - `BLOCKER`: 심각한 문제로 즉시 수정이 필요.
  - `CRITICAL`: 중요한 문제로 가능한 빨리 수정이 필요.
  - `MAJOR`: 주요 문제로 수정이 권장됨.
  - `MINOR`: 경미한 문제로 수정이 선택 사항.
- **사용법**:
  ```typescript
  const level = NCD.SeverityLevels.BLOCKER;
  console.log(level); // "Blocker"
  ```

### NCD.CodeInspectionResult
- **설명**: 코드 검사 결과를 나타내는 객체입니다.
- **속성**:
  - `level` (SeverityLevels): 문제의 심각도 수준.
  - `message` (string): 문제에 대한 설명 메시지.
  - `line` (number): 문제가 발생한 코드의 줄 번호.
  - `code` (string): 문제가 발생한 코드의 내용.
- **사용법**:
  ```typescript
  const result: NCD.CodeInspectionResult = {
      level: NCD.SeverityLevels.CRITICAL,
      message: "Selector is missing a context.",
      line: 42,
      code: "N('.button')"
  };
  console.log(result.message);
  ```

### NCD.inspection.test
- **설명**: 코드 검사 도구로, 제공된 코드와 규칙을 기반으로 문제를 검사합니다.
- **옵션/인수**:
  - `codes` (string): 검사할 코드 문자열.
  - `rules` (string[], 선택적): 적용할 검사 규칙의 이름 배열. 생략 시 모든 규칙이 적용됩니다.
- **반환값**:
  - `boolean`: 문제가 없으면 `true`.
  - `NCD.CodeInspectionResult[]`: 문제가 있으면 문제 목록을 반환.
- **사용법**:
  ```typescript
  const codes = "N('.button')";
  const results = NCD.inspection.test(codes);
  if (Array.isArray(results)) {
      results.forEach(result => console.log(result.message));
  }
  ```

### NCD.inspection.rules
- **설명**: 코드 검사 규칙을 정의합니다.
- **메서드**:
  - `NoContextSpecifiedInSelector(codes: string, excludes: string[], report: NCD.CodeInspectionResult[])`: 선택자에 컨텍스트가 지정되지 않은 경우를 검사.
  - `UseTheComponentsValMethod(codes: string, excludes: string[], report: NCD.CodeInspectionResult[])`: `val()` 메서드 대신 `N.vals()`를 사용하도록 권장.
- **사용법**:
  ```typescript
  const report: NCD.CodeInspectionResult[] = [];
  NCD.inspection.rules.NoContextSpecifiedInSelector("N('.button')", [], report);
  console.log(report);
  ```

### NCD.inspection.report.console
- **설명**: 검사 결과를 브라우저 콘솔에 출력합니다.
- **옵션/인수**:
  - `data` (NCD.CodeInspectionResult[]): 검사 결과 배열.
  - `url` (string): 관련 문서나 리소스의 URL.
- **반환값**: `false` 또는 `undefined`.
- **사용법**:
  ```typescript
  const results: NCD.CodeInspectionResult[] = [
      { level: NCD.SeverityLevels.MAJOR, message: "Example issue", line: 10, code: "N('.example')" }
  ];
  NCD.inspection.report.console(results, "https://example.com/docs");
  ```

### NCD.addSourceURL
- **설명**: 코드 문자열에 소스 URL을 추가합니다. 디버깅 시 유용합니다.
- **옵션/인수**:
  - `codes` (string): 소스 URL을 추가할 코드 문자열.
  - `sourceURL` (string): 추가할 소스 URL.
- **반환값**: 소스 URL이 추가된 코드 문자열.
- **사용법**:
  ```typescript
  const codes = "console.log('Hello, world!');";
  const updatedCodes = NCD.addSourceURL(codes, "example.js");
  console.log(updatedCodes);
  ```
