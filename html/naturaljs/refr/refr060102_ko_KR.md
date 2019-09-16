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

###N.gird 에 검색 폼의 데이터를 파라미터로 서버에서 조회한 데이터를 바인드 하기
```
var searchForm = N(".searchForm").add();
var masterGrid = N([]).grid(".masterGrid");
searchForm.data(false).comm("getSampleList.json").submit(function(data) {
	masterGrid.bind(data);
});
```

###N.gird 의 변경 된 데이터 목록을 서버로 전송하기
```
var masterGrid = N([]).grid(".masterGrid").add();
N(masterGrid.data("modified")).comm({
	"dataIsArray": true,
	"url": "getSampleList.json"
}).submit(function(data) {
	masterGrid.bind(data);
});
```