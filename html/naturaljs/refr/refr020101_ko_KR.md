개요
===

Controller(N.cont)는 CVC Architecture Pattern의 Controller 레이어를 구현한 클래스입니다.

![](images/intr/pic4.png)
<center>[ Natural-ARCHITECTURE ]</center>

N.cont는 Controller object의 init 함수를 실행해 주고 Controller object를 반환합니다.
<p class="alert">Controller object는 View의 요소들과 Communicator에서 검색 한 데이터를 제어하는 객체입니다.</p>

N.cont는 다음과 같이 페이지의 View 영역 바로 아래 선언 되어야 합니다.

```
<article class="view">
    <p>View 영역</p>
</article>

<script type="text/javascript">
    N(".view").cont({ //  Controller object
        init : function(view, request) {
        }
    });
</script>
```

N.popup, N.tab 컴포넌트나 N.comm 라이브러리로 위와 같은 구조의 페이지를 불러 오면 페이지 로딩이 완료 되었을 때 Controller object의 init 함수가 호출 됩니다.
<p class="alert">Natural-ARCHITECTURE 기반 페이지가 제대로 작동하려면 반드시 N.comm 라이브러리나 N.popup, N.tab 컴포넌트로 로드 되어야 합니다.</p>
<p class="alert">페이지의 요소를 선택할 때는 반드시 view에서 find 하거나 view를 jQuery 함수의 context 인자(두 번째 인자)로 지정해야 합니다. 그렇지 않으면 다른 블록 페이지의 의도하지 않은 요소까지 선택되어 예측이 어려운 오류가 발생할 수 있습니다. 자세한 내용은 <a href="#cmVmcjA2MDElMjQlRUMlQTAlOUMlRUQlOTUlOUMlMjAlRUIlQjAlOEYlMjAlRUQlOEMlODEkaHRtbCUyRm5hdHVyYWxqcyUyRnJlZnIlMkZyZWZyMDYwMS5odG1s">제한 및 팁</a> 메뉴를 참고 바랍니다.</p>

블록 페이지나 탭 컨텐츠 등에서 특정 페이지를 제어하기 위해 다음과 같이 Controller 오브젝트를 얻을 수 있습니다.

```
var page01Cont = N("#page01").instance("cont");
page01Cont.gridInst.bind([]);
```