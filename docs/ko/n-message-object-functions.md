# N.message 객체의 함수

N.message은 다국어 메시지 처리 관련 유틸리티 함수들을 모아놓은 객체입니다.

"N.message.{함수명}(arg[0...N])"와 같이 사용할 수 있습니다.

## N.message.get

**반환**: string

입력된 메시지 리소스에서 현재 설정된 로케일에 맞는 메시지를 반환해 줍니다.

프레임웍의 기본 로케일은 Config(natural.config.js)의 N.context.attr("core").locale 속성 값으로 설정할 수 있습니다.

### 매개변수

#### resource

**Type**: object

메시지 리소스 객체를 지정합니다.

메시지 리소스는 object 타입으로 생성하고 다음과 같이 로케일 별 메시지 세트를 구성해야 합니다.

```javascript
var message = {
    "ko_KR" : {
        key : "안녕 {0}."
    },
    "en_US" : {
        key : "Hello {0}."
    }
}

var msg = N.message.get(message, "key", ["Natural-JS"]);

// msg : "Hello Natural-JS."
```

#### key

**Type**: string

메시지 프로퍼티명.

#### vars

**Type**: array

메시지의 변수를 입력한 값으로 치환해 줍니다.

메시지에 선언된 {index}와 같은 변수가 vars 옵션으로 설정 한 array의 index에 해당하는 값으로 치환됩니다.
