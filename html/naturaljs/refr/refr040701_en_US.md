Overview
===

Form(N.form) is a UI component that binds or creates single row data to an element(block elements such as div and table) specified by the context option.

<p class="alert">N.form works with components in the Natural-DATA package to simplify the process of data formatting and input validation. See the [Declaration Options] tab for details.</p>
<p class="alert">If the property name(column name) of the bound data object matches the value of the id attribute of the element, the data is bound. To use data formatting and validation, data must be bound to elements.</p>
<p class="alert">N.form 의 context 요소를 다시 N.form 이나 데이터 관련 컴포넌트(N.grid, N.list 등)의 context 로 지정 하면 오류가 발생 하거나 데이터 정합성이 깨질 수 있습니다. N.form 의 context 요소들을 중복 되지 않게 나누어 지정 하던 지 컬럼 데이터가 중복 되지 않게 나누어 바인드 해야 합니다. context 요소나 데이터를 분리하는 방법은 예제 > <a href="#ZXhhcDA5MDAlMjQlRUIlQTklODAlRUQlOEIlQjAlMjAlRUQlOEYlQkMlMjAlRUIlQjAlOTQlRUMlOUQlQjglRUIlOTMlOUMkaHRtbCUyRm5hdHVyYWxqcyUyRmV4YXAlMkZleGFwMDkwMC5odG1s">멀티 폼 바인드</a> 메뉴의 소스를 참고 바랍니다.</p>
<p class="alert">신규입력이나 검색 블록 등 데이터를 신규로 생성해야하는 폼 등은 add 메서드를 호출하여 폼 안의 입력요소들을 기본으로 데이터를 생성하고 수정이나 조회 등 데이터를 요소들에 바인드 해야 하는 폼은 bind 메서드를 호출 해서 사용 해야 합니다. bind 메서드와 add 메서드는 폼의 용도에 따라 반드시 구분하여 사용되야 하며 폼을 add 한 후 같은 폼 인스턴스로 생성 된 row 에 다시 bind 하면 폼이 정상적으로 작동하지 않을 수 있습니다. add 하면서 기본값을 지정 해야 한다면 add 의 인자로 기본값이 될 data 를 넣어 주세요. 어쩔수 없이 add 나 bind 후 같은 폼요소에 다시 bind 해야 한 다면 add 나 bind 후 unbind 를 호출 한 다음 bind 를 호출 바랍니다.</p>
<p class="alert">When changing the value of input element or changing data with "val" method, rowStatus property is created, in the rowStatus property, input is "insert", modification is "update", and deletion is "delete".</p>