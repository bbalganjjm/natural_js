# 함수

다음 표는 Communicator 객체에서 사용 가능한 함수 목록입니다:

| 이름 | 인자 | 유형 | 반환 | 설명 |
|------|------|------|------|------|
| submit | N/A | N/A | N.comm | 서버에 요청을 보내고 성공한 서버 응답이 수신될 때 실행될 콜백 함수를 등록합니다.<br><br>submit 함수에 callback 인수를 입력하지 않으면 Promise와 호환되는 xhr 객체가 반환되어 async / await 문법을 사용할 수 있습니다.<br><br>```javascript
// JSON Data
const fn1 = async () => {
    const data = await N.comm("data.json").submit();
};

// Catch exception
const fn2 = () => await N.comm("data.json").submit().then((data) => {
    console.log(data);
}).catch((e) => {
    console.error(e);
});

// HTML page
const fn3 = async () => {
    const data = await N("#page-container").comm("page.html").submit();
    console.log(data); // HTML Text
};
``` |
| | callback | function (사용자 정의) | N/A | 요청이 성공했을 때 서버의 응답을 처리하는 콜백 함수를 정의합니다.<br><br>HTML 페이지를 요청하면 콜백 함수의 인수로 로드한 페이지의 Controller object가 반환되고 이 외의 요청은 data 객체와 Communicator.request 객체가 반환됩니다.<br><br>```javascript
// JSON Data
N.comm("data.json").submit(function(data, request) {
    N.log(data, request);
});

// HTML page
N("#page-container").comm("page.html").submit(function(cont) {
    N.log(cont); // cont : Controller object
});
``` |
| error | N/A | N/A | N.comm | submit 함수 호출 후 서버에서 Error 응답이 수신되거나 submit 메서드의 콜백 함수에서 에러가 발생했을 때 실행될 콜백 함수를 등록합니다.<br><br>**참고**: error 메서드를 여러 번 호출하여 콜백 함수를 여러 개 등록할 수 있습니다. |
| | callback | function (사용자 정의) | N/A | 에러가 발생했을 때 에러를 처리하는 콜백 함수를 정의합니다.<br><br>콜백 함수의 this는 생성된 N.comm 인스턴스이고 다음과 같은 인수를 반환합니다:<br><br>- xhr(arguments[2]) : jQuery XMLHTTPRequest<br>- textStatus(arguments[3]) : "success"(submit 콜백에서 에러 발생 시) 또는 "error"(서버에서 오류 발생 시)<br>- e(arguments[0]) : ErrorThrown<br>- request(arguments[1]) : Communicator.request<br>- callback(arguments[4]) : textStatus 값이 "success"일 때 submit 메서드의 인수로 지정한 콜백 함수.<br><br>```javascript
N.comm("data.json").error(function(xhr, textStatus, e, request, callback) {
    // 2. col01.length 오류에 대한 첫 번째 오류 처리
}).error(function(xhr, textStatus, e, request, callback) {
    // 3. col01.length 오류에 대한 두 번째 오류 처리
}).submit(function(data, request) {
    var col01;
    col01.length; // 1. undefined 관련 오류 발생
});
``` |
