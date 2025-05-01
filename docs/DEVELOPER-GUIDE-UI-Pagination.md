# Natural-UI Pagination 컴포넌트 개발자 가이드

Natural-UI의 Pagination(N.pagination) 컴포넌트는 목록 데이터나 전체 행 수로 페이징 인덱스를 생성해 주는 UI 컴포넌트입니다.

## 목차

1. [개요](#개요)
2. [생성자](#생성자)
3. [기본 옵션](#기본-옵션)
4. [함수](#함수)
5. [사용 예제](#사용-예제)
6. [주의 사항](#주의-사항)

## 개요

Pagination(N.pagination)은 목록 데이터나 전체 행 수로 페이징 인덱스를 생성해 주는 UI 컴포넌트입니다. N.pagination의 context 요소는 div>ul>li>a 요소들로 구성됩니다. N.pagination 컴포넌트로 SQL 페이징에 대한 파라미터를 생성하거나 json object array 유형의 전체 목록 데이터를 페이징 할 수 있습니다.

## 생성자

### N.pagination

`N.pagination` 인스턴스를 생성합니다.

```javascript
var pagination = new N.pagination(data, opts|context);
```

| 인자 | 타입 | 설명 |
|------|------|------|
| data | json object array | data 옵션을 설정합니다. 기본 옵션의 data 옵션과 같습니다. |
| opts\|context | object \| jQuery Selector(string \| jQuery object) | 컴포넌트의 기본 옵션 객체를 지정합니다. jQuery selector 문자열이나 jQuery object를 입력하면 기본 옵션의 context 옵션으로 설정됩니다. |

### N(obj).pagination

jQuery 플러그인 메소드로 N.pagination 객체 인스턴스를 생성합니다.

```javascript
var pagination = N(data).pagination(opts|context);
```

객체 인스턴스를 생성하는 방식은 다르지만 `new N.pagination()`로 생성한 인스턴스와 `N().pagination`로 생성한 인스턴스는 동일합니다. N() 함수의 첫 번째 인수가 new N.pagination 생성자의 첫 번째 인수로 설정됩니다.

| 인자 | 타입 | 설명 |
|------|------|------|
| opts\|context | object \| jQuery Selector(string \| jQuery object) | N.pagination 함수의 두 번째 인수(opts)와 같습니다. |

## 기본 옵션

| 이름 | 타입 | 기본값 | 필수 | 설명 |
|------|------|--------|------|------|
| data | json object array | undefined | O | N.pagination에 바인딩할 데이터를 지정합니다.<br>data옵션이 지정되면 totalCount 값이 자동으로 계산되어 설정되므로 totalCount 값을 0으로 설정하거나 설정하지 않아야 합니다.<br>DB 페이징을 하는 경우 data 옵션을 지정하지 말고 totalCount 값만 서버에서 가져와 설정하기 바랍니다. |
| context | jQuery object\|jquery selector string | null | O | N.pagination을 적용할 context 요소를 지정합니다.<br>N.pagination의 context 요소는 반드시 div 태그 안에 ul, li 태그로 작성해야 합니다.<br><br>**처음 페이지, 마지막 페이지, 이전 페이지, 다음 페이지**<br>ul 태그의 li 태그에 a 태그를 넣어서 작성합니다.<br>처음 페이지와 이전 페이지 요소, 마지막 페이지와 다음 페이지 요소는 ul 태그를 분리하여 작성합니다.<br>처음 페이지, 마지막 페이지 링크와 관련된 태그들을 작성하지 않으면 관련 기능이 비활성화됩니다.<br><br>**페이지 인덱스**<br>ul 태그의 li 태그에 a 태그를 넣어서 작성합니다.<br><br>```html
<div class="pagination-context">
    <ul>
        <li><a href="#">first</a></li>
        <li><a href="#">prev</a></li>
    </ul>
    <ul>
        <li><a href="#"><span>1</span></a></li>
    </ul>
    <ul>
        <li><a href="#">next</a></li>
        <li><a href="#">last</a></li>
    </ul>
</div>
``` |
| totalCount | number | 0 | O | 페이징될 목록의 전체 행 수를 설정합니다.<br>DB 페이징을 하는 경우 data 옵션을 지정하지 말고 totalCount 값만 서버에서 가져와 설정하기 바랍니다. |
| countPerPage | number | 10 |  | 페이지 당 행 수를 설정합니다. |
| countPerPageSet | number | 10 |  | 페이지 세트당 페이지 수를 설정합니다. |
| pageNo | number | 1 |  | N.pagination을 초기화한 다음 최초로 표시할 페이지의 번호를 설정합니다. |
| blockOnChangeWhenBind | boolean | false |  | true로 설정하면 bind 메서드를 호출할 때 onChange 이벤트를 실행하지 않습니다. |
| onChange | function | null |  | 페이지가 전환될 때 실행되는 이벤트 핸들러를 정의합니다.<br><br>```javascript
onChange : function(pageNo, selEle, selData, currPageNavInfo) {
    // this : N.pagination 인스턴스
    // pageNo : 페이지 번호
    // selEle : 선택된 페이지 이동 요소
    // selData : 선택된 페이지의 데이터 목록
    // currPageNavInfo : 이벤트가 발생했을 때의 페이지 정보
}
``` |

### currPageNavInfo 객체 정보

다음은 onChange 이벤트 핸들러의 currPageNavInfo 인수가 가지고 있는 속성들입니다.

| 속성 | 설명 |
|------|------|
| pageNo | 현재 페이지 번호 |
| countPerPage | 페이지 당 행 수 |
| countPerPageSet | 페이지 세트당 페이지 수 |
| currSelPageSet | 현재 페이지 세트 번호 |
| pageCount | 전체 페이지 수 |
| pageSetCount | 전체 페이지 세트 수 |
| totalCount | 전체 행 수 |
| startPage | 현재 페이지 세트 중 첫 번째 페이지 번호 |
| startRowIndex | 선택한 페이지의 첫 번째 행 인덱스 |
| startRowNum | 선택한 페이지의 첫 번째 행 번호 |
| endPage | 현재 페이지 세트 중 마지막 페이지 번호 |
| endRowIndex | 선택한 페이지의 마지막 행 인덱스 |
| endRowNum | 선택한 페이지의 마지막 행 번호 |

DB 페이징을 하는 경우 서버에서 totalCount 값을 먼저 가져온 다음 onChange 이벤트 핸들러의 currPageNavInfo 인수 값을 서버에 파라미터로 전송하여 페이징 된 데이터를 조회할 수 있습니다. 이 페이징 된 데이터를 onChange 이벤트에서 N.grid 나 N.list에 페이지가 바뀔 때마다 바인딩해 주면 됩니다.

```javascript
var grid = N(data).grid(".grid-context");

N.comm("getTotalCnt.json").submit(function(data){
    N(data).pagination({
        context: ".pagination-context",
        totalCount: data.totalCount,
        onChange: function(pageNo, selEle, selData, currPageNavInfo) {
            N(currPageNavInfo).comm("getPagedDataList.json").submit(function(data){
                grid.bind(selData);
            });
        }
    }).bind();
});
```

blockOnChangeWhenBind 옵션이 true로 설정되어있을 경우 페이징 버튼들을 클릭할 때만 이벤트가 실행됩니다.

## 함수

| 이름 | 인자 | 타입 | 반환 | 설명 |
|------|------|------|------|------|
| data | selFlag | boolean | json object array\|jQuery object[json object array] | 컴포넌트에 바인딩된 최신 데이터를 반환합니다.<br><br>selFlag 인수 값에 따라 다음과 같은 데이터를 반환합니다.<br>- undefined(selFlag 옵션이 지정되지 않은 경우): json object array 타입의 데이터를 반환합니다.<br>- false: 컴포넌트에 바인딩되어 있는 jQuery object[json object array] 타입의 원래 유형의 데이터를 반환합니다.<br><br>data 메서드로 가져온 데이터를 다른 데이터 관련 컴포넌트에 바인딩할 때는 반드시 "false"로 설정하여 원래 유형의 데이터를 바인딩해야 양방향 데이터 바인딩이 활성화됩니다. |
| context | selector | string | jQuery object | context 요소를 반환합니다.<br><br>jQuery selector 구문을 입력하면 context 요소에서 지정한 요소를 찾아서 반환합니다. |
| bind | data\|totalCount, totalCount | array[object]\|number, number | N.pagination | context 옵션으로 지정한 요소에 데이터를 바인딩하여 Pagination을 생성합니다.<br><br>첫 번째 인자:<br>- 인수 타입이 number 이면 totalCount로 설정되고 array 타입이면 data로 지정됩니다.<br><br>두 번째 인자:<br>- Pagination을 위한 데이터의 총 행 수를 입력합니다. |
| pageNo | pageNo | number | number\|N.pagination | 페이지 번호 값을 가져오거나 설정합니다.<br><br>- 인수가 없으면 pageNo 값을 가져오고 첫 번째 인수를 입력하면 입력된 값으로 pageNo가 설정됩니다.<br>- N.pagination의 옵션 값만 변경되므로 이 함수를 실행한 후 bind 메서드를 실행해줘야 바뀐 값이 페이지네이션에 표시됩니다. |
| totalCount | totalCount | number | number\|N.pagination | 전체 행 수 값을 가져오거나 설정합니다.<br><br>- 인수가 없으면 totalCount 값을 가져오고 첫 번째 인수를 입력하면 입력된 값으로 totalCount가 설정됩니다.<br>- N.pagination의 옵션 값만 변경되므로 이 함수를 실행한 후 bind 메서드를 실행해줘야 바뀐 값이 페이지네이션에 표시됩니다. |
| countPerPage | countPerPage | number | number\|N.pagination | 페이지 당 행 수 값을 가져오거나 설정합니다.<br><br>- 인수가 없으면 countPerPage 값을 가져오고 첫 번째 인수를 입력하면 입력된 값으로 countPerPage가 설정됩니다.<br>- N.pagination의 옵션 값만 변경되므로 이 함수를 실행한 후 bind 메서드를 실행해줘야 바뀐 값이 페이지네이션에 표시됩니다. |
| countPerPageSet | countPerPageSet | number | number\|N.pagination | 페이지 세트당 페이지 수 값을 가져오거나 설정합니다.<br><br>- 인수가 없으면 countPerPageSet 값을 가져오고 첫 번째 인수를 입력하면 입력된 값으로 countPerPageSet가 설정됩니다.<br>- N.pagination의 옵션 값만 변경되므로 이 함수를 실행한 후 bind 메서드를 실행해줘야 바뀐 값이 페이지네이션에 표시됩니다. |
| currPageNavInfo | - | - | N.pagination | 페이징 정보 객체를 반환합니다.<br><br>currPageNavInfo 객체 정보에는 페이지 번호, 페이지 당 행 수, 페이지 세트당 페이지 수 등 다양한 페이징 관련 정보가 포함되어 있습니다. |

## 사용 예제

### 1. Pagination에 데이터 바인딩하기

```html
<div class="pagination">
    <ul>
        <li><a href="#" title="첫페이지">first</a></li> <!-- 첫 페이지로 가기 버튼이 필요 없으면 이 태그는 작성하지 않아도 됩니다. -->
        <li><a href="#" title="이전페이지">prev</a></li>
    </ul>
    <ul>
        <li><a href="#"><span>1</span></a></li>
    </ul>
    <ul>
        <li><a href="#" title="다음페이지">next</a></li>
        <li><a href="#" title="마지막페이지">last</a></li> <!-- 마지막 페이지로 가기 버튼이 필요 없으면 이 태그는 작성하지 않아도 됩니다. -->
    </ul>
</div>

<script type="text/javascript">
    N.comm("data.json").submit(function(data){
        N(data).pagination({
            context: ".pagination",
            onChange: function(pageNo, selEle, selData, currPageNavInfo) {
                // 페이지 전환 시 실행되는 이벤트 핸들러.
                N.log(selData);
            }
        }).bind();
    });
</script>
```

### 2. 세 번째 페이지를 기본 선택하여 Pagination 생성하기

```html
<div class="pagination">
    <ul>
        <li><a href="#">first</a></li>
        <li><a href="#">prev</a></li>
    </ul>
    <ul>
        <li><a href="#"><span>1</span></a></li>
    </ul>
    <ul>
        <li><a href="#">next</a></li>
        <li><a href="#">last</a></li>
    </ul>
</div>

<script type="text/javascript">
    N.comm("data.json").submit(function(data){
        N(data).pagination({
            context: ".pagination",
            onChange: function(pageNo, selEle, selData, currPageNavInfo) {
                N.log(selData);
            }
        }).
        pageNo(3)
        .bind();
    });
</script>
```

### 3. N.pagination과 N.grid를 연동하여 그리드 데이터를 페이징 하기

```html
<table class="pagination">
    <thead>
        <tr>
            <th>name</th>
            <th>age</th>
            <th>gender</th>
            <th>email</th>
            <th>registered</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td id="name"></td>
            <td id="age"></td>
            <td id="gender"></td>
            <td id="email"></td>
            <td id="registered"></td>
        </tr>
    </tbody>
</table>

<div class="pagination">
    <ul>
        <li><a href="#">first</a></li>
        <li><a href="#">prev</a></li>
    </ul>
    <ul>
        <li><a href="#"><span>1</span></a></li>
    </ul>
    <ul>
        <li><a href="#">next</a></li>
        <li><a href="#">last</a></li>
    </ul>
</div>

<script type="text/javascript">
    var grid = N(data).grid(".pagination"); // 1. N.grid 초기화.

    N.comm("data.json").submit(function(data){ // 2. 서버 데이터 조회.
        N(data).pagination({ // 3. N.pagination 초기화.
            context: ".pagination",
            onChange: function(pageNo, selEle, selData, currPageNavInfo) {
                grid.bind(selData); // 4. 페이징 된 데이터를 N.grid에 바인딩.
            }
        }).bind();
    });
</script>
```

### 4. SQL 페이징 하기

SQL 페이징 시 먼저 totalCount값을 서버에서 가져온 다음 currPageNavInfo 정보를 서버에 전달해서 반환된 페이징 데이터를 N.grid에 바인딩하는 방식으로 SQL 페이징을 처리할 수 있습니다.

```html
<table class="pagination">
    <thead>
        <tr>
            <th>name</th>
            <th>age</th>
            <th>gender</th>
            <th>email</th>
            <th>registered</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td id="name"></td>
            <td id="age"></td>
            <td id="gender"></td>
            <td id="email"></td>
            <td id="registered"></td>
        </tr>
    </tbody>
</table>

<div class="pagination">
    <ul>
        <li><a href="#">first</a></li>
        <li><a href="#">prev</a></li>
    </ul>
    <ul>
        <li><a href="#"><span>1</span></a></li>
    </ul>
    <ul>
        <li><a href="#">next</a></li>
        <li><a href="#">last</a></li>
    </ul>
</div>

<script type="text/javascript">
    var grid = N(data).grid(".pagination"); // 1. N.grid 초기화

    N.comm("retrieveCnt.json").submit(function(data){ // 2. totalCount 값 가져오기
        N(data).pagination({
            context: ".pagination",
            totalCount: data.totalCount,
            onChange: function(pageNo, selEle, selData, currPageNavInfo) {
                N(currPageNavInfo)
                .comm("data.json").submit(function(data){ // 3. 페이징 정보를 서버로 전달하여 페이징 된 데이터 조회
                    grid.bind(selData); // 4. 페이징 된 데이터를 N.grid에 바인딩
                });
            }
        }).bind();
    });
</script>
```

페이징 된 데이터에 totalCount 값이 있을 경우 다음과 같이 N.pagination의 bind 메서드에 totalCount 값을 입력하여 데이터가 조회될 때마다 페이징 인덱스를 생성할 수도 있습니다. 이러한 페이징 방식은 페이지가 바뀔 때마다 페이지네이션 인덱싱을 다시 한다는 단점이 있는 반면 데이터 조회 후 다른 사용자가 데이터를 추가하거나 삭제하여도 페이징을 정확하게 할 수 있는 장점이 있습니다.

```javascript
<script type="text/javascript">
    var grid = N(data).grid(".pagination"); // 1. N.grid 초기화.

    var pagination = N(data).pagination({ // 2. N.pagination 초기화.
        context: ".pagination",
        blockOnChangeWhenBind : true, // bind 함수를 호출할 때 onChange 이벤트를 차단하기 위한 옵션(false로 설정하면 무한루프에 빠짐)
        onChange: function(pageNo, selEle, selData, currPageNavInfo) {
            N(currPageNavInfo)
            .comm("data.json").submit(function(data){ // 7. totalCount 값이 포함된 데이터 조회.
                pagination.bind(data[0] && data[0].totalCount ? data[0].totalCount : 0); // 8. N.pagination의 bind 메서드의 인수에 totalCount를 입력하여 페이징 인덱스 재 생성.
                grid.bind(data); // 9. 페이징 된 데이터를 N.grid에 바인딩.
            });
        }
    }).bind();

    N(".btn-search").on("click", function() { // 데이터 조회 버튼 이벤트
        pagination.pageNo(1).bind(); // 3. 첫 번째 페이지로 이동하여 currPageNavInfo 정보 초기화.
        N(pagination.currPageNavInfo())
        .comm("data.json").submit(function(data){ // 4. totalCount 값이 포함된 데이터 조회.
            pagination.bind(data[0] && data[0].totalCount ? data[0].totalCount : 0 ); // 5. N.pagination의 bind 메서드의 인수에 totalCount를 입력하여 페이징 인덱스 재 생성.
            grid.bind(data); // 6. 페이징 된 데이터를 N.grid에 바인딩.
        });
    });
</script>
```

## 주의 사항

1. Pagination 컴포넌트의 context 요소는 반드시 div 태그 안에 ul, li 태그로 작성해야 합니다.

2. data 옵션이 지정되면 totalCount 값이 자동으로 계산되어 설정되므로 totalCount 값을 0으로 설정하거나 설정하지 않아야 합니다.

3. DB 페이징을 하는 경우 data 옵션을 지정하지 말고 totalCount 값만 서버에서 가져와 설정하는 것이 좋습니다.

4. blockOnChangeWhenBind 옵션을 true로 설정하면 bind 메서드를 호출할 때 onChange 이벤트가 실행되지 않으므로, 무한 루프를 방지할 수 있습니다.

5. 페이징 인덱스를 재생성할 때는 bind 메서드를 호출해야 합니다. pageNo, totalCount, countPerPage, countPerPageSet 등의 함수를 실행한 후에는 반드시 bind 메서드를 실행해야 변경된 값이 페이지네이션에 반영됩니다.