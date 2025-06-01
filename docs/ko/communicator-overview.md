# Communicator 개요

Communicator(N.comm)는 Natural-JS의 CVC(Communicator-View-Controller) 아키텍처 패턴에서 Communicator 계층을 구현하는 클래스입니다. 클라이언트 측 애플리케이션과 서버 측 서비스 간의 인터페이스 역할을 합니다.

## CVC 아키텍처 패턴

CVC 아키텍처 패턴은 클라이언트 측 애플리케이션을 세 가지 구별된 계층으로 분리합니다:

1. **Communicator**: 서버와의 모든 통신을 처리
2. **View**: 프레젠테이션 계층과 사용자 인터페이스를 관리
3. **Controller**: Communicator와 View 사이를 조정

![CVC 아키텍처 패턴](images/intr/pic5.png)

CVC 패턴을 구현하면 클라이언트 브라우저 구현이 서버 기술 및 아키텍처와 독립적으로 유지되며, 디자인과 개발 영역을 완전히 분리하여 복잡성을 줄일 수 있습니다.

## Communicator의 목적

N.comm은 서버와의 Ajax 통신을 지원하는 라이브러리로, 애플리케이션이 다음과 같은 작업을 수행할 수 있게 합니다:

- 서버에서 콘텐츠나 데이터 요청
- 서버에 매개변수 및 데이터 전송
- 서버 응답 처리
- 지정된 요소에 HTML 콘텐츠 삽입
- 표준화된 방식으로 오류 처리

## 주요 특징

### 1. 유연한 매개변수 처리

Communicator는 서버 통신을 위한 다양한 유형의 매개변수를 처리할 수 있습니다:

- JSON 객체
- 폼 데이터
- 배열
- 문자열 매개변수
- HTML 요소

### 2. UI 컴포넌트와의 통합

N.comm은 다른 Natural-JS 컴포넌트와 원활하게 통합됩니다:

- N.form, N.grid, N.list 컴포넌트에서 자동으로 데이터 추출 가능
- 서버에서 반환된 HTML을 지정된 요소에 삽입 가능
- 서버 응답 처리를 위한 콜백 지원

### 3. 통신 필터

N.comm은 통신 프로세스의 다른 단계에서 공통 로직을 실행할 수 있는 Communication Filter 메커니즘을 제공합니다:

- **beforeInit**: N.comm이 초기화되기 전에 실행
- **afterInit**: N.comm이 초기화된 후에 실행
- **beforeSend**: 서버에 요청을 보내기 전에 실행
- **success**: 서버에서 성공 응답이 전달됐을 때 실행
- **error**: 통신 중 오류가 발생했을 때 실행
- **complete**: 통신이 완료된 후(성공 또는 실패 여부에 관계없이) 실행

### 4. 페이지 로딩 지원

N.comm은 HTML 페이지를 지정된 요소에 로드하는 기능을 제공합니다:

- 전체 페이지 또는 페이지 조각 로딩 지원
- 로드된 페이지에 매개변수 전달 가능
- 적절한 페이지 초기화를 위한 Controller 시스템과 통합

### 5. 확장성

Communicator는 추가 기능으로 확장될 수 있습니다:

- 사용자 정의 요청 유형
- 응답 전처리
- 오류 처리 전략
- 사용자 정의 매개변수 직렬화

## Controller 객체와의 통합

Communicator 인스턴스는 특정 명명 규칙을 사용하여 Controller 객체의 멤버 변수로 선언될 수 있습니다:

```javascript
"c.{서비스명}": function() {
    return N(params).comm({url});
}
```

이 접근 방식은 다음과 같은 이점을 제공합니다:

- 데이터 흐름을 한눈에 볼 수 있음
- 선언된 Communicator에 AOP(관점 지향 프로그래밍)를 적용할 수 있음
- 애플리케이션 전체에서 서버 통신을 처리하는 방법 표준화

## 기본 사용 패턴

Communicator는 요청을 구성하고 실행하기 위한 빌더 패턴을 따릅니다:

```javascript
// 기본 데이터 요청
N.comm("data.json").submit(function(data) {
    console.log(data);
});

// 매개변수가 있는 요청
N({"param": "value"}).comm("data.json").submit(function(data) {
    console.log(data);
});

// HTML을 요소에 로드
N("#targetElement").comm("page.html").submit();

// 페이지 매개변수 포함
N("#targetElement").comm("page.html").request.attr("pageParam", "value").submit();
```

## 중요 참고 사항

- N.comm이 호출되거나 `new` 연산자로 인스턴스화되면 Communicator.request 객체 인스턴스가 생성되어 객체의 `request` 속성에 바인딩됩니다.
- 객체나 배열 매개변수가 있는 GET 요청의 경우, 매개변수는 URL 인코딩되어 "q" 매개변수 키에 할당됩니다.
- `N.comm(params, url).submit()`와 같이 사용하면 dataIsArray 옵션이 true로 설정되지 않아도 매개변수가 배열 타입으로 전송됩니다.
- Controller 객체 내에서 사용할 때, Communicator 인스턴스는 일반적으로 `cont["c.서비스명"]().submit()`과 같이 함수 실행을 통해 접근됩니다.

Communicator 컴포넌트를 효과적으로 사용하면 애플리케이션은 CVC 아키텍처 패턴의 원칙에 따라 서버 통신과 사용자 인터페이스 관심사 사이의 깔끔한 분리를 구현할 수 있습니다.
