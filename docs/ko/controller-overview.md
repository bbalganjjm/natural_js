# 개요

Controller(N.cont)는 CVC Architecture Pattern의 Controller 레이어를 구현한 클래스입니다.

![](../../images/intr/pic4.png)
*[ Natural-ARCHITECTURE ]*

N.cont는 Controller object의 init 함수를 실행해 주고 Controller object를 반환합니다.

Controller object는 View의 요소들과 Communicator에서 검색한 데이터를 제어하는 객체입니다.

N.cont는 다음과 같이 페이지의 View 영역 바로 아래 선언되어야 합니다.

```javascript
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

N.popup, N.tab 컴포넌트나 N.comm 라이브러리로 위와 같은 구조의 페이지를 불러오면 페이지 로딩이 완료되었을 때 Controller object의 init 함수가 호출됩니다.

> Natural-ARCHITECTURE 기반 페이지가 제대로 작동하려면 반드시 N.comm 라이브러리나 N.popup, N.tab 컴포넌트로 로딩되어야 합니다.

> 페이지의 요소를 선택할 때는 반드시 view에서 find 하거나 view를 jQuery 함수의 context 인수(두 번째 인수)로 지정해야 합니다. 그렇지 않으면 다른 블록 페이지의 의도하지 않은 요소까지 선택되어 예측이 어려운 오류가 발생할 수 있습니다. 자세한 내용은 [제한 및 팁](../restrictions.md) 섹션을 참고 바랍니다.

> N(".view").cont()를 실행하면 selector로 지정한 `.view` 요소에 data-pageid="view"와 같이 pageid data 속성값이 생성됩니다.
이 pageid는 ". (점), # (샵), [ (왼쪽 대괄호), ] (오른쪽 대괄호), ' (작은따옴표), : (콜론), ( (왼쪽 괄호), ) (오른쪽 괄호), > (오른쪽 화살괄호), 공백 (스페이스), - (하이픈)" 문자들은 제거되어 pageid가 생성되니 페이지 식별값은 앞의 문자들이 포함되지 않도록 정의하는 것이 좋습니다.
예를 들면 N("page.view-01").cont()은 점과 하이픈이 제거되어 "pageview01"으로 pageid가 생성됩니다.

블록 페이지나 탭 콘텐츠 등에서 특정 페이지를 제어하기 위해 다음과 같이 Controller 오브젝트를 얻을 수 있습니다.

```javascript
var page01Cont = N("#page01").instance("cont");
page01Cont.gridInst.bind([]);
```
