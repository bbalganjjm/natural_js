# 필터 객체의 기본 옵션 및 함수

Communication Filters는 통신 생명주기에 강력한 후크(hook)를 제공합니다. 각 필터 객체는 통신 프로세스를 가로채고 수정하기 위해 다음 옵션 및 함수 중 하나 이상을 구현할 수 있습니다.

| 이름 | 유형 | 기본값 | 필수 | 설명 |
|------|------|--------|------|------|
| order | number | undefined | X | 필터 오브젝트의 실행 순서를 설정합니다.<br><br>**참고**: order 속성이 정의된 필터들이 먼저 실행된 다음 order 속성이 정의되지 않은 필터들이 실행됩니다. |
| beforeInit | function | undefined | X | N.comm이 초기화되기 전 실행되는 함수입니다.<br><br>**참고**: Controller object의 init 메서드가 실행되기 전이 아니고 N.comm이 인스턴스화 되기 전에 실행되는 이벤트입니다.<br><br>다음과 같은 객체나 값이 이벤트 핸들러 함수의 인수로 지정됩니다:<br>- obj: Communicator의 comm 메서드를 호출하기 전에 N() 함수의 인수로 지정된 파라미터 데이터 객체 또는 페이지가 삽입될 요소입니다.<br><br>**참고**: 파라미터 데이터가 object 타입 이면 Communicator에서 문자열로 변환하기 전의 원래 오브젝트(jQuery object 타입)가 반환되고 element 타입 이면 선택한 요소가 반환됩니다.<br><br>**참고**: obj를 수정하여 반환하면 반환된 obj가 모든 Communicator에 적용됩니다.<br><br>**참고**: 이벤트 핸들러 함수에서 Error 객체를 반환하면 다음 단계의 필터가 실행되지 않습니다.<br>```javascript
...
beforeInit: function(obj) {
    if(data && data.fail){
        return new Error("이 이후의 필터 실행이 중지됩니다.");
    }
}
...
``` |
| afterInit | function | undefined | X | N.comm이 초기화된 후 실행되는 함수입니다.<br><br>**참고**: Controller object의 init 메서드가 실행되기 전이 아니고 N.comm이 인스턴스화 되기 전에 실행되는 이벤트입니다.<br><br>다음과 같은 객체나 값이 이벤트 핸들러 함수의 인수로 지정됩니다:<br>- request(arguments[0]): Communicator.request<br><br>**참고**: 이벤트 핸들러 함수에서 Error 객체를 반환하면 다음 단계의 필터가 실행되지 않습니다.<br>```javascript
...
afterInit: function(request) {
    if(data && data.fail){
        return new Error("이 이후의 필터 실행 중지");
    }
}
...
``` |
| beforeSend | function | undefined | X | 서버에 요청을 보내기 전에 실행되는 함수입니다.<br><br>다음과 같은 객체나 값이 이벤트 핸들러 함수의 인수로 지정됩니다:<br>- request(arguments[0]): Communicator.request<br>- xhr(arguments[1]): jQuery XMLHTTPRequest<br>- settings(arguments[2]): jQuery XMLHTTPRequest의 [요청 정보](http://api.jquery.com/jquery.ajax/)<br><br>**참고**: 이벤트 핸들러 함수에서 Error 객체를 반환하면 다음 단계의 필터가 실행되지 않습니다.<br>```javascript
...
beforeSend: function(request, xhr, settings) {
    if(data && data.fail){
        return new Error("이 이후의 필터 실행 중지");
    }
}
...
``` |
| success | function | undefined | X | 요청이 성공했을 때 실행되는 함수입니다.<br><br>**참고**: data 인수를 수정해서 return 하면 수정된 data를 모든 N.comm의 응답 data로 받을 수 있습니다.<br><br>다음과 같은 객체나 값이 이벤트 핸들러 함수의 인수로 지정됩니다:<br>- request(arguments[0]): Communicator.request<br>- data(arguments[1]): 서버 응답 데이터(JSON, HTML 등)<br>- textStatus(arguments[2]): 서버 응답 상태("success", "notmodified", "nocontent", "error", "timeout", "abort", or "parsererror")<br>- xhr(arguments[3]): jQuery XMLHTTPRequest<br><br>**참고**: 이벤트 핸들러 함수에서 Error 객체를 반환하면 다음 단계의 필터가 실행되지 않습니다.<br>```javascript
...
success: function(request, data, textStatus, xhr) {
    if(data && data.fail){
        return new Error("이 이후의 필터 실행 중지");
    }
}
...
``` |
| error | function | undefined | X | 서버에서 에러가 발생했을 때 실행되는 함수입니다.<br><br>다음과 같은 객체나 값이 이벤트 핸들러 함수의 인수로 지정됩니다:<br>- request(arguments[0]): Communicator.request<br>- xhr(arguments[1]): jQuery XMLHTTPRequest<br>- textStatus(arguments[2]): 서버 응답 상태("timeout", "error", "abort", and "parsererror")<br>- errorThrown(arguments[3]): Error thrown object<br><br>**참고**: 이벤트 핸들러 함수에서 Error 객체를 반환하면 다음 단계의 필터가 실행되지 않습니다.<br>```javascript
...
error: function(request, xhr, textStatus, errorThrown) {
    if(data && data.fail){
        return new Error("이 이후의 필터 실행 중지");
    }
}
...
``` |
| complete | function | undefined | X | 서버의 응답이 완료되었을 때 실행되는 함수입니다.<br><br>다음과 같은 객체나 값이 이벤트 핸들러 함수의 인수로 지정됩니다:<br>- request(arguments[0]): Communicator.request<br>- xhr(arguments[1]): jQuery XMLHTTPRequest<br>- textStatus(arguments[2]): 서버 응답 상태("success", "notmodified", "nocontent", "error", "timeout", "abort", or "parsererror")<br><br>**참고**: 이벤트 핸들러 함수에서 Error 객체를 반환하면 다음 단계의 필터가 실행되지 않습니다.<br>```javascript
...
complete: function(request, xhr, textStatus) {
    if(data && data.fail){
        return new Error("이 이후의 필터 실행 중지");
    }
}
...
``` |

## 필터 함수 반환 값

필터 함수는 통신 프로세스의 흐름을 제어하기 위해 다양한 값을 반환할 수 있습니다:

1. **아무것도 반환하지 않음(undefined)**: 필터 체인이 정상적으로 계속됩니다.
2. **Error 객체 반환**: 필터 체인이 중단되고 현재 단계에서 더 이상 필터가 실행되지 않습니다.
3. **수정된 데이터 객체 반환(success 함수에서)**: 수정된 데이터가 통신 프로세스의 나머지 부분에서 사용됩니다.

## 필터 실행 순서

여러 필터가 정의된 경우 다음 순서로 실행됩니다:

1. `order` 속성이 정의된 필터는 `order` 값의 오름차순으로 실행됩니다.
2. `order` 속성이 없는 필터는 구성에 정의된 순서대로 실행됩니다.
