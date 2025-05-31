# Natural-JS

Natural-JS는 기업용 웹 애플리케이션의 사용자 인터페이스를 직관적이고 쉽고 빠르게 구현할 수 있도록 설계된 JavaScript 아키텍처 프레임워크입니다.

## Natural-JS의 특징

### CVC 아키텍처 패턴 기반의 Natural-ARCHITECTURE 프레임워크

Natural-JS는 CVC(Communicator-View-Controller) 아키텍처 패턴 기반의 Natural-ARCHITECTURE 프레임워크를 제공합니다.

- **AOP**  
  Controller 객체의 사용자 정의 함수에 AOP(Aspect-Oriented Programming)를 적용할 수 있습니다.

- **Communication Filter**  
  서버와 주고받는 모든 데이터를 필터링할 수 있는 Communication Filter 기능을 제공합니다.

- **웹 컴포넌트**  
  페이지를 블록 단위로 개발할 수 있는 아키텍처를 제공합니다. 이 페이지 블록들은 Tab이나 Popup의 콘텐츠나 SPA(Single Page Application)의 페이지 콘텐츠, MSA(Micro Service Architecture)의 웹 컴포넌트로 로드할 수 있습니다.

- **UI 개발의 분업화**  
  UI 소스 코드 안에서 개발 영역과 프레젠테이션 영역을 완벽하게 분리하여 웹 퍼블리셔와 스크립트 개발자 또는 백엔드 개발자와 프론트엔드 개발자의 역할을 분리하여 프로젝트를 진행할 수 있습니다.

### 데이터 표현과 Rich-UI 개발을 위한 UI 컴포넌트

Natural-JS는 데이터 표현과 컨트롤, Rich-UI 개발을 위한 다양한 UI 컴포넌트를 제공합니다.

- **데이터 처리 컴포넌트**  
  데이터를 요소에 바인딩하거나 바인딩된 데이터를 제어할 수 있는 Grid, List, Form, Select, Pagination, Tree 컴포넌트를 제공합니다.

- **UI 컴포넌트**  
  Rich-UI 개발을 지원하는 Alert, Popup, Tab, Button, Datepicker, Notify, Documents 컴포넌트를 제공합니다.

- **양방향 데이터 바인딩**  
  서로 다른 UI 컴포넌트에 같은 데이터를 바인딩하면 데이터가 실시간으로 동기화되고 상호작용을 합니다.

- **컴포넌트 디자인**  
  컴포넌트 스타일을 쉽게 변경할 수 있고, 사이트의 공통 스타일이 컴포넌트에 자동으로 적용되게 할 수 있습니다.

### 데이터를 손쉽게 다룰 수 있는 라이브러리

Natural-JS는 데이터를 손쉽게 다룰 수 있는 라이브러리를 제공합니다.

- **데이터 서식화**  
  데이터 값의 서식을 손쉽게 지정할 수 있는 Formatter 라이브러리를 제공합니다.

- **데이터 유효성 검증**  
  입력 값의 유효성을 손쉽게 검증(Validate)할 수 있는 Validator 라이브러리를 제공합니다.

- **데이터 유틸리티**  
  데이터를 조작하거나 가공할 수 있는 filter, sort 등의 라이브러리를 제공합니다.

### 추가 기능

- 모바일 브라우저(ES5이상)와 터치 디바이스를 지원하고 모바일 하이브리드 앱과의 연동을 지원합니다.
- TypeScript를 지원하기 위해 타입 선언 파일을 제공합니다.

## Natural-JS의 구성

Natural-JS는 다음과 같은 패키지 구성요소로 이루어져 있습니다:

![Natural-JS 구조](../../images/core.png)

- **Natural-CORE**  
  프레임워크 공통 라이브러리 패키지.

![Natural-ARCHITECTURE](../../images/architecture.png)

- **Natural-ARCHITECTURE**  
  복잡한 웹 UI 환경을 구조화하고 단순화해주는 아키텍처 프레임워크 패키지.

![Natural-DATA](../../images/data.png)

- **Natural-DATA**  
  데이터 처리 및 데이터 동기화와 관련된 확장 모듈 패키지.

![Natural-UI](../../images/ui.png)

- **Natural-UI**  
  HTML 기반의 UI 컴포넌트 패키지.

## 수상

- 2018 제12회 공개SW 개발자대회 - 금상
- 2016 제10회 공개SW 개발자대회 - 동상
- 2012 제24회 글로벌 소프트웨어 공모대전 - 동상

자세한 아키텍처 구조와 설명은 소개 > Natural-JS 소개 페이지의 내용을 참고하세요.
