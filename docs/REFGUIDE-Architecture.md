# Natural-JS 아키텍처 가이드북

## Natural-ARCHITECTURE 개요

Natural-ARCHITECTURE는 Natural-JS의 아키텍처를 구성하는 라이브러리 패키지입니다. 이 프레임워크는 CVC(Communicator-View-Controller) Architecture Pattern을 구현하고 있으며, 개발 업무 영역을 명확하게 구분해주어 각 영역별 전문가들로 분업할 수 있는 기반을 제공합니다.

## CVC(Communicator-View-Controller) Architecture Pattern

CVC 패턴은 Model-View-Controller(MVC) 패턴을 기반으로 하는 아키텍처 패턴입니다. 클라이언트 브라우저 영역을 Communicator-View-Controller 아키텍처로 구성하고, 서버 전체를 Model 영역으로 정의하는 클라이언트 중심의 아키텍처 패턴입니다.

CVC 패턴의 주요 이점:
- 클라이언트 브라우저 구현 기술이 서버 기술 및 서버 아키텍처 종속성에서 벗어날 수 있습니다.
- 디자인 영역과 개발 영역을 완벽하게 분리하여 개발의 복잡성을 낮출 수 있습니다.

## Controller (N.cont)

Controller(N.cont)는 CVC Architecture Pattern의 Controller 레이어를 구현한 클래스입니다. N.cont는 Controller object의 init 함수를 실행해 주고 Controller object를 반환합니다. Controller object는 View의 요소들과 Communicator에서 검색한 데이터를 제어하는 객체입니다.

### 기본 사용법

Controller는 페이지의 View 영역 바로 아래에 선언되어야 합니다.

```html
<article class="view">
    <p>View 영역</p>
</article>

<script type="text/javascript">
    N(".view").cont({ //  Controller object
        init : function(view, request) {
            // 초기화 로직
        }
    });
</script>
```

N.popup, N.tab 컴포넌트나 N.comm 라이브러리로 위와 같은 구조의 페이지를 불러오면 페이지 로딩이 완료되었을 때 Controller object의 init 함수가 호출됩니다.

### Controller object의 주요 상수

Controller object에는 다음과 같은 주요 상수들이 정의되어 있습니다:

1. **view**: Controller가 제어하는 view 요소입니다. init 함수의 첫 번째 인수 값과 동일합니다.
2. **request**: Communicator.request 객체 인스턴스입니다. init 함수의 두 번째 인수 값과 동일합니다.
3. **caller**: N.popup이나 N.tab 컴포넌트로 호출된 페이지일 경우, 이 페이지를 로드한 N.popup이나 N.tab 인스턴스입니다.
4. **opener**: N.popup이나 N.tab 컴포넌트로 호출된 페이지일 경우, 이 페이지를 로드한 컴포넌트 인스턴스가 포함된 부모 페이지의 Controller object입니다.

### 페이지 요소 선택 시 주의사항

페이지의 요소를 선택할 때는 반드시 view에서 find하거나 view를 jQuery 함수의 context 인수(두 번째 인수)로 지정해야 합니다. 그렇지 않으면 다른 블록 페이지의 의도하지 않은 요소까지 선택되어 예측이 어려운 오류가 발생할 수 있습니다.

```javascript
N(".view").cont({
    init : function(view, request) {
        // 올바른 요소 선택 방법
        N("selector", view).hide();  // 또는
        view.find("selector").hide();
    }
});
```

## View

View는 별도의 구현체가 없으며, 블록 페이지의 HTML 요소 영역이 View로 정의됩니다. Controller object에서는 view 상수를 통해 View 요소에 접근할 수 있습니다.

## AOP (Aspect-Oriented Programming)

Natural-ARCHITECTURE는 Controller object를 대상으로 AOP(Aspect-Oriented Programming)를 지원합니다. AOP는 관심사의 분리를 통해 코드의 모듈성을 높이는 프로그래밍 패러다임입니다.

### AOP 설정 방법

AOP 설정은 Config(natural.config.js) 파일의 `N.context.attr("architecture").cont.pointcuts` 객체와 `N.context.attr("architecture").cont.advisors` 속성에 정의합니다.

#### pointcuts 객체

pointcuts 객체는 advisor에서 사용할 사용자 pointcut을 정의합니다. pointcut은 반드시 fn 속성에 함수를 정의해야 하며, 함수의 반환값(boolean)은 advice의 적용 여부를 결정합니다.

```javascript
"pointcuts" : {
    "regexp" : {
        "fn" : function(param, cont, fnChain){
            var regexp = param instanceof RegExp ? param : new RegExp(param);
            return regexp.test(fnChain);
        }
    }
}
```

Natural-ARCHITECTURE의 AOP에는 정규식으로 평가하는 'regexp' pointcut이 기본 내장되어 있어, 특별한 경우가 아니면 pointcut을 따로 지정하지 않아도 됩니다.

#### advisors 객체

advisors 객체는 Controller 객체의 특정 함수를 가로채서 추가 동작을 수행하는 역할을 합니다.

```javascript
"advisors" : [{
    "pointcut" : "^init$",
    "adviceType" : "before",
    "fn" : function(cont, fnChain, args){
        console.log("call me before %s", fnChain);
    }
}]
```

주요 속성:
- **pointcut**: advisor가 적용될 pointcut을 정의합니다.
- **adviceType**: advisor의 실행 시점을 설정합니다 (before, after, around, error).
- **fn**: advisor 함수를 정의합니다.

### AOP 활용 사례

AOP는 다음과 같은 경우에 유용하게 활용할 수 있습니다:

1. 모든 페이지에 공통코드를 불러와 컴포넌트에 바인딩하기
2. 로드된 페이지의 컴포넌트들을 자동으로 초기화하기
3. 에러 처리를 위한 로직 통합하기

## Communicator (N.comm)

Communicator(N.comm)는 CVC Architecture Pattern의 Communicator 레이어를 구현한 클래스입니다. N.comm은 서버에 콘텐츠나 데이터를 요청하거나 파라미터를 전달하는 등 서버와의 Ajax 통신을 지원하는 라이브러리입니다.

### 기본 사용법

Communicator는 다음과 같은 형태로 사용합니다:

```javascript
// JSON 데이터 요청
N.comm("data.json").submit(function(data) {
    console.log(data);
});

// HTML 페이지 요청 및 삽입
N.comm(N("#contents"), "page.html").submit();

// 파라미터 전송
N.comm({ "param": "value" }, "data.json").submit(function(data) {
    console.log(data);
});
```

N.comm 함수나 N().comm 메서드를 호출할 때 설정한 옵션(opts)은 Communicator.request 객체의 옵션으로 설정됩니다.

## Communicator.request

Communicator.request는 N.comm이 초기화될 때마다 생성되는 요청 정보 객체입니다. N.comm() 함수의 옵션은 Communicator.request.options 객체에 저장되어 서버 요청의 헤더나 파라미터로 전달됩니다.

### 주요 함수

1. **attr()**: 로드할 페이지로 전달할 데이터를 지정하거나 전달된 데이터를 가져옵니다.
   ```javascript
   // 데이터 전달하기
   N("#section").comm("page.html")
       .request.attr("data1", { data: ["1", "2"] })
       .submit();
   
   // 데이터 가져오기
   var data1 = request.attr("data1");
   ```

2. **param()**: 브라우저의 URL에서 GET 파라미터 값을 추출합니다.
   ```javascript
   var value = request.param("paramName");
   ```

3. **get()**: Communicator.request 인스턴스에 설정된 기본 옵션 정보를 가져옵니다.
   ```javascript
   var options = request.get();
   ```

4. **reload()**: Communicator로 로드한 블록 페이지를 다시 로딩합니다.
   ```javascript
   request.reload(function(html, request) {
       console.log("페이지가 재로딩 되었습니다.");
   });
   ```

### 주요 옵션

1. **append** (boolean, 기본값: false): true로 설정하면 로드된 페이지를 덮어쓰지 않고 target 옵션으로 지정한 요소에 추가합니다.
2. **urlSync** (boolean, 기본값: true): false로 설정하면 요청 시와 응답 시의 location.href가 달라도 응답을 차단하지 않습니다.
3. **target** (jQuery object, 기본값: null): HTML 콘텐츠를 삽입할 요소를 지정합니다.
4. **type** (string, 기본값: "POST"): 요청에 사용할 HTTP 메소드를 지정합니다.
5. **dataType** (string, 기본값: "json"): 서버 응답 데이터의 유형을 설정합니다.

## Communication Filter

Communication Filter는 N.comm을 통해 서버와 통신하는 모든 요청과 응답 또는 에러 발생 단계에서 공통 로직을 실행할 수 있는 기능입니다.

### 필터 단계

1. **beforeInit**: N.comm이 초기화되기 전에 실행됩니다.
2. **afterInit**: N.comm이 초기화된 후에 실행됩니다.
3. **beforeSend**: 서버에 요청을 보내기 전에 실행됩니다.
4. **success**: 서버에서 성공 응답이 전달됐을 때 실행됩니다.
5. **error**: 서버에서 에러 응답이 전달됐을 때 실행됩니다.
6. **complete**: 서버의 응답이 완료되면 실행됩니다.

### 필터 정의 방법

필터는 natural.config.js 파일의 N.context.attr("architecture").comm.filters 속성에 정의합니다.

```javascript
"filters" : {
    "basicFilter" : {
        "order": 1,
        "beforeInit" : function(obj) {
            // N.comm 초기화 전 처리
        },
        "afterInit" : function(request) {
            // N.comm 초기화 후 처리
        },
        "beforeSend" : function(request, xhr, settings) {
            // 서버 요청 전 처리 (로딩 이미지 표시 등)
        },
        "success" : function(request, data, textStatus, xhr) {
            // 성공 응답 처리
            return data; // 데이터를 수정하여 반환 가능
        },
        "error" : function(request, xhr, textStatus, errorThrown) {
            // 에러 응답 처리 (에러 메시지 표시 등)
        },
        "complete" : function(request, xhr, textStatus) {
            // 응답 완료 후 처리 (로딩 이미지 제거 등)
        }
    }
}
```

### 필터 활용 예시

Communication Filter는 다음과 같은 경우에 유용하게 활용할 수 있습니다:
- 요청 전후로 로딩 이미지 표시/제거
- 서버 응답 데이터 공통 처리 (에러 코드 확인 등)
- 세션 타임아웃 처리
- API 호출 로깅
- 공통 헤더 추가 (인증 토큰 등)

## Context (N.context)

Context(N.context)는 Natural-JS 기반 애플리케이션의 Life-Cycle(페이지가 적재되고 다른 URL로 redirect되기 전까지) 안에서 데이터의 영속성을 보장하는 공간입니다. Natural-JS의 환경설정 값과 프레임워크 공통 메시지 등이 N.context 객체에 저장됩니다.

### 주요 함수

**attr()**: Context에 데이터를 저장하거나 가져오는 함수입니다.

```javascript
// 데이터 저장하기
N.context.attr("globalInfo", {
    userId: "jeff1942",
    userNm: "Jeff Beck"
});

// 데이터 가져오기
var globalInfo = N.context.attr("globalInfo");
```

### 활용 예시

N.context는 다음과 같은 경우에 유용하게 활용할 수 있습니다:
- 전역 환경설정 저장
- 사용자 정보 저장
- 다국어 메시지 관리
- 페이지 간 데이터 공유
- 애플리케이션 상태 관리

## 정리

Natural-ARCHITECTURE는 CVC(Communicator-View-Controller) 패턴을 기반으로 한 클라이언트 중심의 아키텍처로, 다음과 같은 주요 구성요소를 제공합니다:

1. **Controller (N.cont)**: View의 요소와 Communicator에서 가져온 데이터를 제어
2. **View**: HTML 요소 영역으로 별도의 구현체 없음
3. **AOP**: Controller 객체에 관심사 분리를 적용하여 공통 기능 구현
4. **Communicator (N.comm)**: 서버와의 통신을 담당
5. **Communication Filter**: 서버 통신 과정에서 공통 로직 실행
6. **Context (N.context)**: 애플리케이션 생명주기 내에서 데이터 영속성 보장

이러한 구성요소들을 활용하면 클라이언트 어플리케이션의 구조를 체계적으로 설계하고, 개발 영역 간의 명확한 분리를 통해 유지보수성과 생산성을 높일 수 있습니다.
