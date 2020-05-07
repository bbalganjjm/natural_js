개요
===

Controller(N.cont) 는 CVC Architecture Pattern 의 Controller 레이어를 구현한 클래스 입니다.

![](images/intr/pic4.png)
<center>[ Natural-ARCHITECTURE ]</center>

N.cont 는 Controller object 의 init 함수를 실행 해 주고 Controller object 를 반환 합니다.
<p class="alert">Controller object 는 View 의 요소들과 Communicator 에서 검색 한 데이터를 제어하는 객체 입니다.</p>

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

N.popup, N.tab 컴포넌트나 N.comm 라이브러리로 위 와 같은 구조의 페이지를 불러 오면 페이지 로딩이 완료 되었을 때 Controller object 의 init 함수가 호출 됩니다.
<p class="alert">Natural-ARCHITECTURE 기반 페이지가 제대로 작동하려면 반드시 N.comm 라이브러리나 N.popup, N.tab 컴포넌트로 로드 되어야 합니다.</p>

블록 페이지나 탭 컨텐츠 등 에서 특정 페이지를 제어하기 위해 다음과 같이 Controller 오브젝트를 얻을 수 있습니다.

```
var page01Cont = N("#page01").instance("cont");
page01Cont.gridInst.bind([]);
```