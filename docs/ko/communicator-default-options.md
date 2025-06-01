# 기본 옵션

N.comm 함수나 N().comm 메서드를 호출할 때 설정한 옵션(opts)은 Communicator.request 객체의 옵션으로 설정됩니다.
Communicator.request 객체의 옵션에 대한 자세한 내용은 [Communicator.request 기본 옵션](communicator-request-default-options.md)을 참고 바랍니다.

다음 표는 Communicator 객체의 기본 옵션 목록입니다:

| 이름 | 유형 | 기본값 | 필수 | 설명 |
|------|------|--------|------|------|
| append | boolean | false | X | true로 설정하면 로드된 페이지를 덮어쓰지 않고 target 옵션으로 지정한 요소에 추가합니다. |
| urlSync | boolean | true | X | false로 설정하면 서버로 요청할 때의 location.href와 서버에서 응답을 받았을 때의 location.href가 다르더라도 응답을 차단하지 않습니다.<br>**참고**: 알 수 없는 이유로 서버 응답이 차단되었을 경우 이 옵션을 false로 설정해서 테스트해 보세요. |
| dataIsArray | boolean | false | X | true로 설정하면 N().comm에서 N 함수의 인수로 지정한 파라미터 객체를 array 타입으로 지정할 수 있습니다.<br>**참고**: Communicator를 N(params).comm(url).submit();와 같이 사용할 때 params의 객체 타입이 array일 때 dataIsArray 옵션이 false로 지정되어 있다면 array의 첫 번째 오브젝트만 전송됩니다. 이 문제의 원인은 jQuery 함수의 인수를 array(jQuery([{}])) 또는 object($({}))로 설정한 후에 get 함수를 호출하면 둘 다 array([{}])를 반환하기 때문입니다. 불편하더라도 array를 서버에 전송할 때는 dataIsArray를 true로 설정하거나 object에 array를 담아서 사용 바랍니다.<br>**참고**: Communicator를 N.comm(params, url).submit();와 같이 사용하면 dataIsArray 옵션을 true로 지정하지 않아도 params를 jQuery object로 만들지 않기 때문에 array 타입으로 전송됩니다.<br>**참고**: Natural-ARCHITECTURE v0.8.1.4 버전 이후에 적용되었습니다. |
| target | jQuery object | null | X | HTML 콘텐츠를 삽입할 요소를 지정합니다.<br>**참고**: Communicator를 N(".block").comm("page.html").submit();와 같이 사용할 경우 N("#block") 요소 오브젝트가 target 속성 값으로 지정됩니다. |
| contentType | string | application/json; charset=utf-8 | O | 서버 요청에 대한 contentType을 지정합니다.<br>**참고**: contentType 옵션은 jQuery.ajax 함수의 옵션이 그대로 적용됩니다. [jQuery.ajax](http://api.jquery.com/jquery.ajax/) 매뉴얼의 settings 부분에서 contentType 속성을 참고하세요. |
| cache | boolean | false | X | true로 설정하면 요청된 페이지가 브라우저에 의해 캐싱됩니다.<br>**참고**: cache 옵션은 jQuery.ajax 함수의 옵션이 그대로 적용됩니다. [jQuery.ajax](http://api.jquery.com/jquery.ajax/) 매뉴얼의 settings 부분에서 cache 속성을 참고하세요. |
| type | string | POST | X | 요청에 사용할 HTTP method(예: "POST", "GET", "PUT")<br>**참고**: type 옵션은 jQuery.ajax 함수의 옵션이 그대로 적용됩니다. [jQuery.ajax](http://api.jquery.com/jquery.ajax/) 매뉴얼의 settings 부분에서 type 속성을 참고하세요. |
| data | json object array¹\|json object | null | X | 서버로 전송될 데이터. string이 아닌 경우 string으로 변환됩니다.<br>**참고**: data 옵션은 jQuery.ajax 함수의 옵션이 그대로 적용됩니다. [jQuery.ajax](http://api.jquery.com/jquery.ajax/) 매뉴얼의 settings 부분에서 data 속성을 참고하세요. |
| dataType | string(xml, json, script, or html) | "json" | X | 서버 응답 데이터의 유형(xml, json, script, or html)을 설정합니다.<br>**참고**: dataType 옵션은 jQuery.ajax 함수의 옵션이 그대로 적용됩니다. [jQuery.ajax](http://api.jquery.com/jquery.ajax/) 매뉴얼의 settings 부분에서 dataType 속성을 참고하세요. |
| crossDomain | boolean | false | X | 동일한 도메인에서 crossDomain 요청(예: JSONP)을 강제로 수행하려면 crossDomain 값을 true로 설정하세요. 이를 통해서 다른 도메인으로 서버 사이드 리다이렉션 하는 것 등이 가능해집니다.<br>**참고**: crossDomain 옵션은 jQuery.ajax 함수의 옵션이 그대로 적용됩니다. [jQuery.ajax](http://api.jquery.com/jquery.ajax/) 매뉴얼의 settings 부분에서 crossDomain 속성을 참고하세요. |

**참고**: N.comm은 jQuery.ajax 모듈을 사용하여 Ajax 요청을 처리합니다. jQuery.ajax의 beforeSend, success, error, complete 옵션을 제외한 옵션들은 N.comm에서도 그대로 적용됩니다.

---

**주석**

1. JSON 포멧의 객체가 담겨있는 array 객체.
