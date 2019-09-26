Overview
===

Form(N.form) 은 context 옵션으로 지정한 요소(div, table 등의 block 요소)에 단건 로우 데이터를 바인드하거나 생성하는  UI 컴포넌트입니다.

<p class="alert">N.form 은 Natural-DATA 패키지의 컴포넌트들과 연동하여 데이터 포멧팅과 입력값의 유효성 검증을 간단하게 처리 할 수 있는 기능을 제공 합니다. 자세한 내용은 [선언형옵션] 탭을 참고 해 주세요.</p>
<p class="alert">바인딩 된 데이터 오브젝트의 프로퍼티명(컬럼명)과 요소의 id 속성 값이 일치하면 데이터가 바인딩 됩니다. 데이터가 요소에 바인딩 되어야 데이터 포멧팅과 유효성 검증이 활성화 됩니다.</p>
<p class="alert">N.form 의 context 요소를 다시 N.form 이나 데이터 관련 컴포넌트(N.grid, N.list 등)의 context 로 지정 하면 오류가 발생 하거나 데이터 정합성이 깨질 수 있습니다. N.form 의 context 요소들을 중복 되지 않게 나누어 지정 하던 지 컬럼 데이터가 중복 되지 않게 나누어 바인드 해야 합니다. context 요소나 데이터를 분리하는 방법은 예제 > <a href="#ZXhhcDA5MDAlMjQlRUIlQTklODAlRUQlOEIlQjAlMjAlRUQlOEYlQkMlMjAlRUIlQjAlOTQlRUMlOUQlQjglRUIlOTMlOUMkaHRtbCUyRm5hdHVyYWxqcyUyRmV4YXAlMkZleGFwMDkwMC5odG1s">멀티 폼 바인드</a> 메뉴의 소스를 참고 바랍니다.</p>
<p class="alert">신규입력이나 검색 블록 등 데이터를 신규로 생성해야하는 폼 등은 add 메서드를 호출하여 폼 안의 입력요소들을 기본으로 데이터를 생성하고 수정이나 조회 등 데이터를 요소들에 바인드 해야 하는 폼은 bind 메서드를 호출 해서 사용 해야 합니다. bind 메서드와 add 메서드는 폼의 용도에 따라 반드시 구분하여 사용되야 하며 폼을 add 한 후 같은 폼 인스턴스로 생성 된 row 에 다시 bind 하면 폼이 정상적으로 작동하지 않을 수 있습니다. add 하면서 기본값을 지정 해야 한다면 add 의 인자로 기본값이 될 data 를 넣어 주세요. 어쩔수 없이 add 나 bind 후 같은 폼요소에 다시 bind 해야 한 다면 add 나 bind 후 unbind 를 호출 한 다음 bind 를 호출 바랍니다.</p>
<p class="alert">입력요소의 값을 변경하거나 val 메서드로 데이터를 변경하면 rowStatus 프로퍼티가 생성되고 입력은 "insert", 수정은 "update", 삭제는 "delete" 값이 입력 됩니다.</p>