Overview
===

Grid(N.grid)는 table 요소를 context 옵션으로 지정하여 멀티 컬럼 형태로 데이터 목록을 생성 해 주는 UI 컴포넌트입니다.

<p class="alert">N.grid works with components in the Natural-DATA package to simplify the process of data formatting and input validation. See the [Declaration Options] tab for details.</p>
<p class="alert">If the property name(column name) of the bound data object matches the value of the id attribute of the element, the data is bound. To use data formatting and validation, data must be bound to elements.</p>
<p class="alert">그리드로 만들어질 TABLE 요소의 넓이는 고정(px등)이든 가변(%)이든 반드시 넓이가 지정 되어야 합니다.</p>
<p class="alert">헤더고정형, 리스트형 두 가지 타입의 그리드를 제공 합니다.</p>
<p class="alert">When changing the value of input element or changing data with "val" method, rowStatus property is created, in the rowStatus property, input is "insert", modification is "update", and deletion is "delete".</p>