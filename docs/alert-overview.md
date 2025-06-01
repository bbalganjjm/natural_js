# Alert - Overview

Alert(N.alert) is a UI component that displays message dialogs such as window.alert or window.confirm in the form of layer popups.

## 기본 특징

* 창과 유사한 형태의 알림 메시지 대화 상자를 표시합니다.
* window.alert 또는 window.confirm과 동일한 기능을 제공하지만 UI를 사용자 정의할 수 있습니다.
* 두 가지 모드로 동작할 수 있습니다:
  * 전체 화면 오버레이 모드 (기본 모달 대화 상자)
  * 입력 요소에 연결된 툴팁 형태
* 다양한 옵션을 통해 알림의 동작과 표시 방식을 커스터마이즈할 수 있습니다.

## 중요 고려사항

> **주의:** Alert 대화 상자가 표시되지 않고 오류가 발생하는 경우, [Config(natural.config.js)](html/naturaljs/refr/refr0102.html)의 `N.context.attr("ui").alert.container` 속성에 N.alert 관련 요소가 저장될 요소를 jQuery 선택자 문자열로 지정해야 합니다.

## 사용 시나리오

Alert 컴포넌트는 다음과 같은 상황에서 사용하기 적합합니다:

1. **사용자 확인이 필요한 메시지 표시**
   * 작업 성공/실패 알림
   * 경고 메시지
   * 사용자 확인이 필요한 정보 제공

2. **입력 유효성 검증 오류 표시**
   * 입력 필드 근처에 오류 메시지 툴팁으로 표시
   * 양식 제출 전 유효성 검증 결과 표시

3. **중요 작업 전 확인 요청**
   * 삭제 작업 전 확인
   * 중요한 변경 사항 적용 전 확인

## Alert vs Notify

* **Alert(N.alert)**: 콘텐츠 영역 내에서 메시지를 처리하기 위한 컴포넌트입니다. 각 View 요소 내부에 컴포넌트 요소가 생성됩니다.
* **Notify(N.notify)**: 사이트 전체에서 메시지를 처리하기 위한 컴포넌트입니다. document.body 요소에 생성됩니다.

## 기본 사용법

```javascript
// 기본 알림 표시
N().alert("안녕하세요, Natural-JS입니다.").show();

// 확인/취소 버튼이 있는 확인 대화 상자
N().alert({
    msg: "변경 사항을 저장하시겠습니까?",
    buttons: [{
        text: "저장",
        click: function() {
            // 저장 로직
            this.close();
        }
    }, {
        text: "취소",
        click: function() {
            this.close();
        }
    }]
}).show();

// 특정 컨테이너에 알림 표시
N(".alertContainer").alert("컨테이너 내부에 표시되는 메시지입니다.").show();

// 입력 필드에 오류 메시지 툴팁 표시
N("#username").alert("사용자 이름은 필수 항목입니다.").show();
```

## 다음 단계

Alert 컴포넌트에 대한 자세한 내용은 다음 문서를 참조하세요:
* [Alert - API DEMO](html/naturaljs/refr/refr040102.html)
* [Alert - 생성자](html/naturaljs/refr/refr040103.html)
* [Alert - 기본 옵션](html/naturaljs/refr/refr040104.html)
* [Alert - 함수](html/naturaljs/refr/refr040105.html)
* [Alert - 예제](html/naturaljs/refr/refr040106.html)
