팁
===

###데이터 관련 컴포넌트에 비어있는 객체를 바인드하여 초기화 하기
```
nFormInstance.unbind().bind(0, []); // N.form
nGridInstance.bind([]); // N.grid
nListInstance.bind([]); // N.list
nSelectInstance.bind([]); // N.select
nPaginationInstance.bind([]); // N.pagination
nTreeInstance.bind([]); // N.tree
```
