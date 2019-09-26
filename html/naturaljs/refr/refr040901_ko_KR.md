개요
===

Grid(N.grid)는 TABLE 요소에 데이터를 바인드하여 멀티 컬럼 형태로 데이터 목록을 표현 해 주는 UI 컴포넌트입니다.
<p class="alert">헤더고정형, 리스트형 두 가지 타입의 그리드를 제공 합니다.</p>
<p class="alert">그리드로 만들어질 TABLE 요소의 넓이는 고정(px등)이든 가변(%)이든 반드시 넓이가 지정 되어야 합니다.</p>
<p class="alert">입력요소의 값을 변경하거나 val 메서드로 데이터를 변경하면 rowStatus 프로퍼티가 생성되고, 입력은 "insert", 수정은 "update", 삭제는 "delete" 값이 입력 됩니다.</p>