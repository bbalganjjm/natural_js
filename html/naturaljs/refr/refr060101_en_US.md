Restrictions
===
###jQuery 기능 사용 제한
1. jQuery.ajax 함수를 사용하면 Communication Filter 기능을  사용 할 수 없습니다. 반드시 서버와의 통신은  Communicator(N.comm)를 사용 해야 합니다.
2. UI 컴포넌트로 데이터를 바인딩 한 입력요소에  jQuery.val 함수를 사용하여 값을 변경하면  화면의 값만 변경 되고 내부 데이터는 변경 되지 않습니다. 반드시 컴포넌트의 val 메서드를 사용 해야 합니다.

###jQuery 로 요소 선택 시 주의 사항
jQuery 로 요소를 선택할 때는 반드시 view 에서 find 하거나 view를 context 로 지정 해 줘야 합니다.
```
N(".pageId").cont({
	init: function(view, request) {
		$("selector", view);
		view.find("selector");
	}
});
```