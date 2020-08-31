제한
===
###⊙ jQuery 기능 사용제한
1. jQuery.ajax 함수를 사용하면 Communication Filter 기능을  사용할 수 없습니다. 반드시 서버와의 통신은  Communicator(N.comm)를 사용해야 합니다.
2. UI 컴포넌트를 사용해서 데이터를 바인딩 한 입력 요소에 jQuery.val 함수를 사용하여 값을 변경하면 화면의 값만 변경되고 내부 데이터는 변경되지 않습니다. 반드시 컴포넌트 인스턴스의 val 메서드를 사용해야 합니다.

###⊙ 요소 선택 시 주의 사항
페이지의 요소를 선택할 때는 반드시 view에서 find하거나 view를 jQuery 함수의 context 인자(두 번째 인자)로 지정해야 합니다. 그렇지 않으면 다른 블록 페이지의 의도하지 않은 요소까지 선택되어 예측이 어려운 오류가 발생할 수 있습니다.
```
N(".pageId").cont({
    init: function(view, request) {
        $("selector", view);
        view.find("selector");
    }
});
```