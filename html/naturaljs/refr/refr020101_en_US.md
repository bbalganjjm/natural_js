Overview
===

Controller(N.cont) 는 CVC Architecture Pattern 의 Controller 영역을 구현한 클래스 입니다.

Controller 는 View 의 요소들과 Communicator 로 조회 한 데이터를 제어 하는 객체인 Controller object 를 실행 해 주는 역할을 담당 합니다.

N.cont 는 다음과 같이 페이지의 View 영역 바로 아래 선언 되어야 합니다.

```
<div id="view">
	<p>View 영역</p>
</div>

<script type="text/javascript">
	N("#view").cont({ //  Controller object
		init : function(view, request) {
			// 페이지 로딩 후 최초 실행되는 영역
		}
	});
</script>
```

N.popup, N.tab 컴포넌트나 N.comm 라이브러리는 위와 같은 구조로 만들어진 페이지를 불러 오면 페이지 로딩이 완료 되었을 때 Controller object(N.cont 의 첫번째 인자) 의 init 함수를 호출 해 줍니다.

<p class="alert">Natural-ARCHITECTURE 기반으로 구성된 페이지들은 무조건 N.comm 이나 N.popup, N.tab 으로 불러와야 정상적으로 작동 됩니다.</p>

init 함수는 View(jQuery Object) 요소와 [Communicator.request](#cmVmcjAyMDQlMjRDb21tdW5pY2F0b3IucmVxdWVzdCRodG1sJTJGbmF0dXJhbGpzJTJGcmVmciUyRnJlZnIwMjA0Lmh0bWw=) 객체를 인자로 반환 합니다.

블록 페이지나 탭 컨텐츠 등 에서 특정 페이지를 제어하려면 다음과 같이 Controller object 를 얻어 오면 됩니다. 

```
var page01Cont = N("#page01").instance("cont");
page01Cont.gridInst.bind([]);
```