Overview
===

List(N.list)는 ul>li 요소를 context 옵션으로 지정하여 단일 컬럼 형태로 데이터 목록을 생성 해 주는 UI 컴포넌트입니다.

<p class="alert">N.grid works with components in the Natural-DATA package to simplify the process of data formatting and input validation. See the [Declaration Options] tab for details.</p>
<p class="alert">If the property name(column name) of the bound data object matches the value of the id attribute of the element, the data is bound. To use data formatting and validation, data must be bound to elements.</p>
<p class="alert">When changing the value of input element or changing data with "val" method, rowStatus property is created, in the rowStatus property, input is "insert", modification is "update", and deletion is "delete".</p>