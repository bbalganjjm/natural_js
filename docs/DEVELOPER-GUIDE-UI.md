# Natural-UI 개발자 가이드

Natural-UI는 Natural-JS의 UI 컴포넌트 라이브러리로, 웹 애플리케이션 개발에 필요한 다양한 UI 컴포넌트를 제공합니다. 이 문서에서는 Natural-UI 컴포넌트의 개요와 주요 특징을 설명합니다.

## 목차

1. [개요](#개요)
2. [UI 컴포넌트](#ui-컴포넌트)
   - [Alert](#alert)
   - [Button](#button)
   - [Datepicker](#datepicker)
   - [Form](#form)
   - [Grid](#grid)
   - [List](#list)
   - [Pagination](#pagination)
   - [Popup](#popup)
   - [Select](#select)
   - [Tab](#tab)
   - [Tree](#tree)
3. [UI.Shell 컴포넌트](#uishell-컴포넌트)
   - [Documents](#documents)
   - [Notify](#notify)
4. [공통 기능](#공통-기능)
   - [이벤트 처리](#이벤트-처리)
   - [스타일링](#스타일링)
   - [테마 지원](#테마-지원)

## 개요

Natural-UI는 Natural-JS의 기반 위에 구축된 UI 컴포넌트 라이브러리입니다. 이 라이브러리는 웹 애플리케이션 개발에 필요한 다양한 UI 컴포넌트를 제공하며, 모든 컴포넌트는 jQuery와 통합되어 사용하기 쉽게 설계되어 있습니다.

Natural-UI의 주요 특징은 다음과 같습니다:

- **일관된 API**: 모든 컴포넌트는 일관된 방식으로 초기화, 설정, 데이터 바인딩이 가능합니다.
- **테마 지원**: 라이트 테마와 다크 테마를 지원하며, 사용자 정의 테마도 구성할 수 있습니다.
- **반응형 디자인**: 다양한 화면 크기에 대응할 수 있도록 설계되었습니다.
- **접근성**: 웹 접근성 표준을 준수하여 개발되었습니다.
- **데이터 바인딩**: JSON 데이터와 쉽게 연동할 수 있는 데이터 바인딩 기능을 제공합니다.

## UI 컴포넌트

Natural-UI는 다양한 UI 컴포넌트를 제공합니다. 각 컴포넌트에 대한 상세한 가이드는 해당 컴포넌트의 문서를 참조하세요.

### Alert

[Alert](DEVELOPER-GUIDE-UI-Alert.md) 컴포넌트는 window.alert이나 window.confirm과 같은 메시지 대화 상자를 레이어 팝업 형태로 표현합니다.

### Button

[Button](DEVELOPER-GUIDE-UI-Button.md) 컴포넌트는 HTML의 기본 버튼 요소를 확장하여 다양한 스타일과 기능을 제공합니다.

### Datepicker

[Datepicker](DEVELOPER-GUIDE-UI-Datepicker.md) 컴포넌트는 날짜 선택을 위한 캘린더 UI를 제공합니다.

### Form

[Form](DEVELOPER-GUIDE-UI-Form.md) 컴포넌트는 HTML 폼 요소를 데이터와 바인딩하고 유효성 검사 기능을 제공합니다.

### Grid

[Grid](DEVELOPER-GUIDE-UI-Grid.md) 컴포넌트는 데이터를 테이블 형태로 표시하고 편집할 수 있는 기능을 제공합니다.

### List

[List](DEVELOPER-GUIDE-UI-List.md) 컴포넌트는 데이터를 목록 형태로 표시하는 기능을 제공합니다.

### Pagination

[Pagination](DEVELOPER-GUIDE-UI-Pagination.md) 컴포넌트는 페이지 네비게이션을 제공합니다.

### Popup

[Popup](DEVELOPER-GUIDE-UI-Popup.md) 컴포넌트는 모달 또는 모달리스 형태의 팝업 창을 제공합니다.

### Select

[Select](DEVELOPER-GUIDE-UI-Select.md) 컴포넌트는 HTML의 기본 select 요소를 확장하여 다양한 스타일과 기능을 제공합니다.

### Tab

[Tab](DEVELOPER-GUIDE-UI-Tab.md) 컴포넌트는 탭 기반의 인터페이스를 제공합니다.

### Tree

[Tree](DEVELOPER-GUIDE-UI-Tree.md) 컴포넌트는 계층 구조의 데이터를 트리 형태로 표시합니다.

## UI.Shell 컴포넌트

Natural-UI.Shell은 웹 애플리케이션의 쉘(외부 프레임) 영역을 구성하는 컴포넌트를 제공합니다.

### Documents

[Documents](DEVELOPER-GUIDE-UI.Shell-Documents.md) 컴포넌트는 MDI(Multi Document Interface) 또는 SDI(Single Document Interface) 형태로 페이지를 관리하는 컨테이너입니다.

### Notify

[Notify](DEVELOPER-GUIDE-UI.Shell-Notify.md) 컴포넌트는 사용자에게 알림 메시지를 표시하는 기능을 제공합니다.

## 공통 기능

Natural-UI 컴포넌트들은 다음과 같은 공통 기능을 제공합니다.

### 이벤트 처리

모든 컴포넌트는 표준 DOM 이벤트를 지원하며, 컴포넌트별 특화된 이벤트도 제공합니다. 이벤트 핸들러는 jQuery의 `.on()` 메서드를 통해 등록할 수 있습니다.

```javascript
N("#myButton").on("click", function() {
    // 버튼 클릭 시 처리할 코드
}).button();
```

### 스타일링

Natural-UI 컴포넌트는 기본적으로 natural.ui.css 파일의 스타일을 사용합니다. 사용자 정의 스타일을 적용하려면 다음과 같은 방법을 사용할 수 있습니다:

1. CSS 클래스 오버라이드: 컴포넌트에 사용된 CSS 클래스를 오버라이드하여 스타일을 변경합니다.
2. 인라인 스타일: 컴포넌트 요소에 직접 스타일을 적용합니다.
3. 컴포넌트 옵션: 일부 컴포넌트는 스타일 관련 옵션을 제공합니다.

### 테마 지원

Natural-UI는 라이트 테마와 다크 테마를 기본으로 제공합니다. 테마는 다음과 같이 전환할 수 있습니다:

```javascript
// 다크 테마로 전환
N.context.attr("ui").theme = "dark";

// 라이트 테마로 전환
N.context.attr("ui").theme = "light";
```

커스텀 테마를 구성하려면 CSS 변수를 재정의하는 방식으로 구현할 수 있습니다.

이 문서에서는 Natural-UI의 개요와 주요 특징을 살펴보았습니다. 각 컴포넌트에 대한 자세한 정보는 해당 컴포넌트의 문서를 참조하세요.
