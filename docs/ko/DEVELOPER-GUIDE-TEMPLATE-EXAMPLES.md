# Natural-TEMPLATE 예제 가이드

Natural-TEMPLATE은 Natural-JS 기반의 웹 애플리케이션 개발을 정형화하여 코드 가독성과 개발 생산성을 크게 향상시켜 주는 라이브러리입니다. 이 문서는 다양한 Natural-TEMPLATE 예제를 설명하고, 각 예제에서 보여주는 주요 기능과 구현 방법을 자세히 소개합니다.

## 목차

- [소개](#소개)
- [예제 목록](#예제-목록)
- [템플릿 예제](#템플릿-예제)
  - [조회폼+그리드](#조회폼그리드)
  - [조회폼+그리드(CRUD)](#조회폼그리드crud)
  - [조회폼+그리드+페이징](#조회폼그리드페이징)
  - [조회폼+그리드+상세폼(수평배치)](#조회폼그리드상세폼수평배치)
  - [조회폼+그리드+상세폼(수직배치)](#조회폼그리드상세폼수직배치)
  - [조회폼+리스트+그리드+상세폼](#조회폼리스트그리드상세폼)
  - [트리+그리드(CRUD)](#트리그리드crud)
  - [조회폼+탭](#조회폼탭)

## 소개

Natural-TEMPLATE 예제는 실제 프로젝트에서 자주 사용되는 화면 패턴을 미리 구현해 놓은 템플릿입니다. 각 예제는 Natural-JS의 다양한 컴포넌트들을 조합하여 구현되었으며, 개발자가 쉽게 이해하고 활용할 수 있도록 설계되었습니다.

이 가이드에서는 실제 프로젝트에서 자주 사용되는 템플릿 패턴별로 예제를 소개하고, 각 예제의 구현 방법과 주요 기능을 상세히 설명합니다. 각 예제는 개별적으로 독립적인 기능을 보여주지만, 모든 예제는 Natural-TEMPLATE의 기본 코드 작성 규칙을 따릅니다.

Natural-TEMPLATE의 기본 개발 가이드는 [Natural-TEMPLATE 개발 가이드](DEVELOPER-GUIDE-TEMPLATE.md) 문서를 참고하세요.

## 예제 목록

Natural-TEMPLATE은 다음과 같은 다양한 패턴의 템플릿 예제를 제공합니다:

1. [조회폼+그리드](#조회폼그리드) - 기본적인 검색 화면과 데이터 그리드 구성
2. [조회폼+그리드(CRUD)](#조회폼그리드crud) - 그리드에서 직접 데이터 입력/수정/삭제가 가능한 구성
3. [조회폼+그리드+페이징](#조회폼그리드페이징) - 페이징 기능이 포함된 그리드 구성
4. [조회폼+그리드+상세폼(수평배치)](#조회폼그리드상세폼수평배치) - 그리드와 상세 폼이 수평으로 배치된 구성
5. [조회폼+그리드+상세폼(수직배치)](#조회폼그리드상세폼수직배치) - 그리드와 상세 폼이 수직으로 배치된 구성
6. [조회폼+리스트+그리드+상세폼](#조회폼리스트그리드상세폼) - 리스트와 그리드, 상세 폼이 결합된 복합 구성
7. [트리+그리드(CRUD)](#트리그리드crud) - 트리 컴포넌트와 그리드가 결합된 구성
8. [조회폼+탭](#조회폼탭) - 탭 컴포넌트와 검색 폼이 결합된 구성

## 템플릿 예제

### 조회폼+그리드

**개요**
조회폼(N.form)과 그리드(N.grid)로 구성된 간단한 예제입니다. 검색 조건을 입력하여 데이터를 조회하고, 그 결과를 그리드에 표시하는 가장 기본적인 패턴입니다.

**주요 기능**
- 공통코드 데이터를 자동으로 조회한 후 N.select 컴포넌트를 초기화하고 코드 데이터를 바인딩
- 11만 건 이상의 대용량 데이터 바인딩 및 빠른 속도의 소팅, 필터링 처리

**코드 구조**

HTML 구조:
```html
<article class="type0101 view-code">
    <!-- 페이지 소개 부분 -->
    <div class="view-intro">
        <h1>조회폼+그리드</h1>
        <ul class="view-desc">
            <!-- 설명 내용 -->
        </ul>
    </div>

    <!-- 검색 폼 부분 -->
    <h3>N.form</h3>
    <div id="search" class="form__">
        <div class="search-panel">
            <ul>
                <li><label><span>Name</span><input id="name" type="text"></label></li>
                <li><label><span>Gender</span><select id="gender"><option value="">선택</option></select></label></li>
                <li><label><span>Eye Color</span><select id="eyeColor"><option value="">선택</option></select></label></li>
            </ul>
        </div>
    </div>

    <!-- 그리드 부분 -->
    <div class="flex-horizental">
        <h3>N.grid</h3>
        <div class="button-panel">
            <button id="btnSearch" data-opts="{ "color": "primary" }">조회</button>
        </div>
    </div>
    <table id="master" class="grid__">
        <!-- 그리드 컬럼 정의 -->
        <colgroup>...</colgroup>
        <thead>...</thead>
        <tbody>...</tbody>
        <tfoot>...</tfoot>
    </table>
</article>
```

Controller 구현:
```javascript
const cont = N(".type0101").cont({
    // 컴포넌트 초기화 및 옵션 설정
    "p.select.gender" : [ "gender" ],
    "p.select.eyeColor" : [ "eyeColor" ],
    "p.select.favoriteFruit" : [ "favoriteFruit" ],
    "p.form.search" : {
        "usage" : "search-box"
    },
    "p.grid.master" : {
        "action" : "bind",
        filter : false,
        height : 350,
        onBind : function(context, data) {
            N("#totalCnt", cont.view).text(N.formatter.commas(String(data.length)));
        }
    },
    
    // 데이터 통신 정의
    "c.getSampleList" : function() {
        return cont["p.form.search"].data(false).comm("sample/getSampleBigList.json");
    },
    
    // 이벤트 핸들러 정의
    "e.btnSearch.click" : async function(e) {
        e.preventDefault();

        if (cont["p.form.search"].validate()) {
            cont["p.grid.master"].bind(await cont["c.getSampleList"]().submit());
        }
    },
    "e.eyeColor.change" : {
        target : "#search #eyeColor",
        handler : function(e) {
            cont["e.btnSearch.click"].trigger("click");
        }
    },
    
    // 초기화 함수
    init : function(view, request) {
        // cont.opener는 탭이 포함된 부모페이지의 Controller object
        if(cont.opener) {
            cont["p.form.search"].context().hide().prev("h3").hide().prev(".view-intro").hide();
            view.find("#btnSearch").hide();
        }
    }
});
```

**핵심 포인트**
- `p.select.{id}` 형태로 공통코드 데이터를 자동으로 초기화하고 바인딩
- 폼 유효성 검사(`validate()`) 후 데이터 조회
- 그리드의 `filter` 옵션을 통한 필터링 기능
- `e.{요소id}.{이벤트유형}` 형태로 이벤트 핸들러 정의

### 조회폼+그리드(CRUD)

**개요**
조회폼(N.form)과 그리드(N.grid)로 구성된 CRUD(Create, Read, Update, Delete) 기능이 포함된 예제입니다. 그리드에서 직접 데이터를 입력, 수정, 삭제할 수 있는 패턴입니다.

**주요 기능**
- 그리드(N.grid)로 입력/조회/수정/삭제 가능
- 공통코드 데이터 자동 초기화 및 바인딩
- 그리드 행 안의 버튼이나 요소 컨트롤
- 그리드 내에서 팝업과 연동 방법

**코드 구조**

HTML 구조:
```html
<article class="type0201 view-code">
    <!-- 페이지 소개 부분 -->
    <div class="view-intro">...</div>

    <!-- 검색 폼 부분 -->
    <h3>N.form</h3>
    <div id="search" class="form__">...</div>

    <!-- 그리드 부분 -->
    <div class="flex-horizental">
        <h3 style="max-width: 100px;">N.grid</h3>
        <div class="button-panel">
            <button id="btnSearch">조회</button>
            <button id="btnAdd">추가</button>
            <button id="btnDelete">삭제</button>
            <button id="btnSave">저장</button>
        </div>
    </div>
    <table id="master" class="grid__">
        <!-- 그리드 컬럼 정의 -->
        <colgroup>...</colgroup>
        <thead>...</thead>
        <tbody>
            <!-- 편집 가능한 그리드 행 구성 -->
            <tr>
                <td rowspan="2" style="text-align: center;"><input class="checkAllTarget" type="checkbox"></td>
                <td id="index" style="text-align: center;" rowspan="2"></td>
                <td rowspan="2"><input id="name" type="text" data-validate="[["required"]]"></td>
                <!-- 기타 입력 필드 -->
            </tr>
            <tr>
                <!-- 두 번째 행 입력 필드 -->
            </tr>
        </tbody>
        <tfoot>...</tfoot>
    </table>
</article>
```

Controller 구현:
```javascript
const cont = N(".type0201").cont({
    // 컴포넌트 초기화 및 옵션 설정
    "p.select.gender" : [ "gender" ],
    "p.select.eyeColor" : [ "eyeColor" ],
    "p.form.search" : {
        "usage" : "search-box"
    },
    "p.grid.master" : {
        height : 350,
        resizable : false,
        checkAll : "#checkAll",
        checkAllTarget : ".checkAllTarget",
        scrollPaging : {
            size : 15
        }
    },
    "p.popup.dept" : {
        url : "html/naturaljs/template/samples/type04P0.html",
        onOpen : "onOpen",
        height: 621,
        onClose : function(onCloseData) {
            if (onCloseData) {
                cont["p.grid.master"]
                    .val(cont.selIdx, "deptNm", onCloseData.deptNm)
                    .val(cont.selIdx, "deptCd", onCloseData.deptCd);
            }
        }
    },
    
    // 데이터 통신 정의
    "c.getSampleList" : function() {
        return cont["p.form.search"].data(false).comm("sample/getSampleList.json");
    },
    "c.saveSample" : function() {
        return N(cont["p.grid.master"].data("modified")).comm({
            dataIsArray : true,
            url : "sample/saveSample.json"
        });
    },
    
    // 이벤트 핸들러 정의
    "e.btnSearch.click" : function(e) {
        e.preventDefault();

        if (cont["p.form.search"].validate()) {
            cont["c.getSampleList"]().submit(function(data) {
                cont["p.grid.master"].bind(data);
            });
        }
    },
    "e.btnSave.click" : function(e) {
        e.preventDefault();

        return APP.comm.utils.save.call(this, {
            cont : cont,
            comm : "c.saveSample",
            changed : "p.grid.master",
            validate : "p.grid.master",
            after : function(data) {
                cont["e.btnSearch.click"].trigger("click");
            }
        });
    },
    "e.btnAdd.click" : function(e) {
        e.preventDefault();
        cont["p.grid.master"].add();
    },
    "e.btnDelete.click" : function(e) {
        e.preventDefault();
        return APP.comm.utils.del.call(this, {
            cont : cont,
            inst : "p.grid.master"
        });
    },
    "e.btnDeptCd.click" : function(e, idx) {
        e.preventDefault();
        cont.selIdx = idx;
        cont["p.popup.dept"].open(cont["p.grid.master"].data()[idx]);
    },
    
    // 초기화 함수
    init : function(view, request) {
        // 초기화 로직
        if(cont.opener) {
            // 부모 페이지 존재 시 처리 로직
        } else {
            cont["e.btnSearch.click"].trigger("click");
        }
    }
});
```

**핵심 포인트**
- 체크박스를 통한 행 선택 (`checkAll`, `checkAllTarget` 옵션)
- 그리드 데이터 조작 메서드: `add()`, `remove()` 등
- 그리드 행 내 버튼을 통한 팝업 연동 (부서 조회 팝업)
- 데이터 변경 감지 및 저장 (`data("modified")`)
- 유효성 검사 (`data-validate`)

### 조회폼+그리드+페이징

**개요**
조회폼(N.form)과 그리드(N.grid), 페이지네이션(N.pagination)으로 구성된 예제입니다. 서버 측 페이징을 구현하는 패턴을 보여줍니다.

**주요 기능**
- 페이지네이션 컴포넌트(N.pagination)를 통한 서버 측 페이징 처리
- 공통코드 데이터 자동 초기화 및 바인딩

**코드 구조**

HTML 구조:
```html
<article class="type0301 view-code">
    <!-- 페이지 소개 부분 -->
    <div class="view-intro">...</div>

    <!-- 검색 폼 부분 -->
    <h3>N.form</h3>
    <div id="search" class="form__">...</div>

    <!-- 그리드 부분 -->
    <div class="flex-horizental">
        <h3>N.grid + N.pagination(DB)</h3>
        <div class="button-panel">
            <button id="btnSearch">조회</button>
        </div>
    </div>
    <div style="position: relative; min-height: 483px;">
        <table id="master" class="grid__">...</table>
    </div>

    <!-- 페이징 부분 -->
    <div class="pagination-box">
        <div id="masterPagination">
            <ul>
                <li><a href="#" title="처음">first</a></li>
                <li><a href="#" title="이전">prev</a></li>
            </ul>
            <ul>
                <li><a href="#"><span>1</span></a></li>
            </ul>
            <ul>
                <li><a href="#" title="다음">next</a></li>
                <li><a href="#" title="마지막">last</a></li>
            </ul>
        </div>
    </div>
</article>
```

Controller 구현:
```javascript
const cont = N(".type0301").cont({
    // 컴포넌트 초기화 및 옵션 설정
    "p.select.gender" : [ "gender" ],
    "p.select.eyeColor" : [ "eyeColor" ],
    "p.form.search" : {
        "usage" : "search-box"
    },
    "p.grid.master" : {
        resizable : true,
        filter : false,
        fixedcol : 3,
        checkAll : "#checkAll",
        checkAllTarget : ".checkAllTarget",
        createRowDelay : 0
    },
    "p.pagination.masterPagination" : {
        blockOnChangeWhenBind : true,
        countPerPage : 15,
        onChange : function(pageNo, selEle, selData, currPageNavInfo) {
            cont["c.getSampleList"]().submit(function(data) {
                let totalCount = 0;
                if(Array.isArray(data) && data[0] && data[0].totalCount) {
                    totalCount = data[0].totalCount;
                }
                cont["p.pagination.masterPagination"].bind(totalCount);
                cont["p.grid.master"].bind(data);
            });
        }
    },
    
    // 데이터 통신 정의
    "c.getSampleList" : function() {
        return N($.extend(cont["p.form.search"].data()[0], cont["p.pagination.masterPagination"].currPageNavInfo())).comm(
            "sample/getSamplePaginationList.json");
    },
    
    // 이벤트 핸들러 정의
    "e.btnSearch.click" : function(e) {
        e.preventDefault();

        if (cont["p.form.search"].validate()) {
            cont["p.pagination.masterPagination"].pageNo(1).bind();
            cont["c.getSampleList"]().submit(function(data) {
                let totalCount = 0;
                if(Array.isArray(data) && data[0] && data[0].totalCount) {
                    totalCount = data[0].totalCount;
                }
                cont["p.pagination.masterPagination"].bind(totalCount);
                cont["p.grid.master"].bind(data);
            });
        }
    },
    
    // 기타 이벤트 핸들러
    "e.gender.change" : {
        target : "#search #gender",
        handler : function(e) {
            cont["e.btnSearch.click"].trigger("click");
        }
    },
    "e.eyeColor.change" : {
        target : "#search #eyeColor",
        handler : function(e) {
            cont["e.btnSearch.click"].trigger("click");
        }
    },
    
    // 초기화 함수
    init : function(view, request) {
        // 초기화 로직
        if(cont.opener) {
            // 부모 페이지 존재 시 처리 로직
        } else {
            cont["e.btnSearch.click"].trigger("click");
        }
    }
});
```

**핵심 포인트**
- 페이지네이션 컴포넌트(`p.pagination.masterPagination`) 초기화
- 서버에서 페이징 정보 관리 (totalCount 활용)
- `onChange` 이벤트를 통한 페이지 변경 시 데이터 로드
- `currPageNavInfo()`를 통해 현재 페이지 정보 획득
- 검색 시 페이지 번호 초기화 (`pageNo(1)`)

### 조회폼+그리드+상세폼(수평배치)

**개요**
조회폼(N.form)과 그리드(N.grid)와 연동된 상세 데이터 폼(N.form)으로 구성된 예제입니다. 그리드에서 선택한 행의 상세 정보를 옆에 배치된 폼에 표시하는 패턴입니다.

**주요 기능**
- 그리드 행 선택 시 상세 폼으로 데이터 바인딩
- 다양한 입력 컴포넌트 활용 (select, radio, checkbox 등)
- 팝업과 상세 폼 연동

**코드 구조**

HTML 구조:
```html
<article class="type0401 view-code">
    <!-- 페이지 소개 부분 -->
    <div class="view-intro">...</div>

    <!-- 검색 폼 부분 -->
    <h3>N.form</h3>
    <div id="search" class="form__">...</div>

    <div class="flex-horizental">
        <!-- 그리드 영역 -->
        <div style="max-width: 33%;">
            <div class="flex-horizental">
                <h3>N.grid</h3>
                <div class="button-panel">
                    <button id="btnSearch">조회</button>
                    <button id="btnSave">저장</button>
                </div>
            </div>
            <table id="master" class="grid__">...</table>
        </div>

        <!-- 상세 폼 영역 (수평 배치) -->
        <div>
            <div class="flex-horizental">
                <h3>N.form</h3>
                <div class="button-panel">
                    <button id="btnAdd">추가</button>
                    <button id="btnDelete">삭제</button>
                    <button id="btnRevert">초기화</button>
                </div>
            </div>
            <ul id="detail" class="form__">
                <!-- 다양한 폼 요소들 -->
                <li>
                    <label>
                        <span>Default Picture</span>
                        <img id="picture" style="height: 56px;">
                    </label>
                </li>
                <li>
                    <label>
                        <span>Name</span>
                        <input id="name" type="text" data-validate="[["required"]]">
                    </label>
                </li>
                <!-- 기타 폼 요소들 -->
            </ul>
        </div>
    </div>
</article>
```

Controller 구현:
```javascript
const cont = N(".type0401").cont({
    // 컴포넌트 초기화 및 옵션 설정
    "p.select.gender" : [ "gender" ],
    "p.select.eyeColor" : [ "eyeColor" ],
    "p.select.company" : [ "company" ],
    "p.select.favoriteFruit" : [ "favoriteFruit" ],
    "p.select.age" : [ "c.getSampleCodeList", "age", "age", function(data) {
        return N(N.array.deduplicate(data, "age")).datasort("age");
    }],
    "p.form.search" : {
        "usage" : "search-box"
    },
    "p.form.detail" : {
        revert : true,
        autoUnbind : true
    },
    "p.grid.master" : {
        height : 486,
        select : true,
        selectScroll : false,
        onSelect : function(index, rowEle, data, beforeRow, e) {
            // 전처리
            APP.comm.utils.selectNBind.call(this, {
                args: arguments,
                cont : cont,
                form : "p.form.detail"
            });
            // 후처리
        },
        onBind : function(context, data, isFirstPage, isLastPage) {
            if(isFirstPage) {
                this.select(0);
            }
        }
    },
    "p.popup.dept" : {
        url : "html/naturaljs/template/samples/type04P0.html",
        onOpen : "onOpen",
        height: 621,
        onClose : function(onCloseData) {
            if (onCloseData) {
                cont["p.form.detail"]
                    .val("deptNm", onCloseData.deptNm)
                    .val("deptCd", onCloseData.deptCd);
            }
        }
    },
    
    // 데이터 통신 정의
    "c.getSampleCodeList" : function() {
        return N.comm("sample/getSampleList.json");
    },
    "c.getSampleList" : function() {
        return cont["p.form.search"].data(false).comm("sample/getSampleList.json");
    },
    "c.saveSample" : function() {
        return N(cont["p.grid.master"].data("modified")).comm({
            dataIsArray : true,
            url : "sample/saveSample.json"
        });
    },
    
    // 이벤트 핸들러 정의
    "e.btnSearch.click" : function(e) {
        e.preventDefault();

        if (cont["p.form.search"].validate()) {
            cont["c.getSampleList"]().submit(function(data) {
                cont["p.grid.master"].bind(data);
            });
        }
    },
    "e.btnDeptCd.click" : function(e) {
        e.preventDefault();
        cont["p.popup.dept"].open(cont["p.form.detail"].data(true)[0]);
    },
    "e.btnSave.click" : function(e) {
        e.preventDefault();
        return APP.comm.utils.save.call(this, {
            cont : cont,
            comm : "c.saveSample",
            changed : "p.grid.master",
            validate : "p.form.detail",
            after : function(data) {
                cont["e.btnSearch.click"].trigger("click");
            }
        });
    },
    "e.btnAdd.click" : function(e) {
        e.preventDefault();
        if (cont["p.form.detail"].validate()) {
            cont["p.form.detail"].add();
        }
    },
    "e.btnDelete.click" : function(e) {
        e.preventDefault();
        cont["p.form.detail"].remove();
    },
    "e.btnRevert.click" : function(e) {
        e.preventDefault();
        if (cont["p.grid.master"].data("modified").length === 0) {
            N(window).alert(N.message.get(APP.comm.messages, "COMM-0001")).show();
            return false;
        }
        cont["p.form.detail"].revert();
    },
    
    // 초기화 함수
    init : function(view, request) {
        // 초기화 로직
        if(cont.opener) {
            // 부모 페이지 존재 시 처리 로직
        } else {
            cont["e.btnSearch.click"].trigger("click");
        }
    }
});
```

**핵심 포인트**
- 그리드의 `onSelect` 이벤트를 활용한 상세 폼과의 연동
- 상세 폼의 `revert`, `autoUnbind` 옵션 활용
- 다양한 데이터 바인딩 방식 (공통코드, 일반 데이터)
- 폼 데이터 처리 메서드: `add()`, `remove()`, `revert()`
- 팝업과 상세 폼 연동 (`p.popup.dept`)

### 조회폼+그리드+상세폼(수직배치)

**개요**
조회폼(N.form)과 그리드(N.grid)와 연동된 상세 데이터 폼(N.form)으로 구성된 예제입니다. 그리드 아래에 상세 폼이 배치되는 패턴입니다.

**주요 기능**
- 그리드 행 선택 시 상세 폼으로 데이터 바인딩
- 다양한 입력 컴포넌트 활용
- 팝업과 상세 폼 연동

**코드 구조**

HTML 구조:
```html
<article class="type0402 view-code">
    <!-- 페이지 소개 부분 -->
    <div class="view-intro">...</div>

    <!-- 검색 폼 부분 -->
    <h3>N.form</h3>
    <div id="search" class="form__">...</div>

    <!-- 그리드 부분 -->
    <div class="flex-horizental">
        <h3>N.grid</h3>
        <div class="button-panel">
            <button id="btnSearch">조회</button>
            <button id="btnSave">저장</button>
        </div>
    </div>
    <table id="master" class="grid__">...</table>

    <!-- 상세 폼 영역 (수직 배치) -->
    <div>
        <div class="flex-horizental">
            <h3>N.form</h3>
            <div class="button-panel">
                <button id="btnAdd">추가</button>
                <button id="btnDelete">삭제</button>
                <button id="btnRevert">초기화</button>
            </div>
        </div>
        <ul id="detail" class="form__">
            <!-- 다양한 폼 요소들 -->
        </ul>
    </div>
</article>
```

Controller 구현:
```javascript
const cont = N(".type0402").cont({
    // 컴포넌트 초기화 및 옵션 설정
    "p.select.gender" : {
        "code" : "gender",
        "selected" : "male"
    },
    "p.select.eyeColor" : {
        "code" : "eyeColor"
    },
    "p.select.company" : {
        "code" : "company"
    },
    "p.select.favoriteFruit" : {
        "code" : "favoriteFruit"
    },
    "p.select.age" : {
        "comm" : "c.getSampleCodeList",
        key : "age",
        val : "age",
        "filter" : function(data) {
            return N(N.array.deduplicate(data, "age")).datasort("age");
        },
        "selected" : "22"
    },
    "p.form.search" : {
        "usage" : "search-box"
    },
    "p.form.detail" : {
        revert : true,
        autoUnbind : true
    },
    "p.grid.master" : {
        height : 200,
        select : true,
        selectScroll : false,
        onSelect : function(index, rowEle, data, beforeRow, e) {
            // 전처리
            APP.comm.utils.selectNBind.call(this, {
                args: arguments,
                cont : cont,
                form : "p.form.detail"
            });
            // 후처리
        },
        onBind : function(context, data, isFirstPage, isLastPage) {
            if(isFirstPage) {
                this.select(0);
            }
        }
    },
    
    // 이하 기능은 수평배치 예제와 동일
    // ...
});
```

**핵심 포인트**
- 수평 배치 예제와 기능적으로 동일하지만 UI 레이아웃이 수직으로 구성
- 컴포넌트 옵션 선언 방식의 차이 (array 형태 vs object 형태)
- 그리드 높이 차이 (수평형보다 작음)

### 조회폼+리스트+그리드+상세폼

이 템플릿은 조회폼, 리스트, 그리드, 그리고 상세폼을 함께 사용한 복합 패턴입니다. 메인 리스트에서 선택한 항목에 따라 관련 데이터를 그리드에 표시하고, 그리드에서 선택한 행의 상세 정보를 폼에 표시합니다.

### 트리+그리드(CRUD)

이 템플릿은 트리 컴포넌트와 그리드를 함께 사용한 패턴입니다. 트리에서 선택한 노드에 해당하는 데이터를 그리드에 표시하고, 그리드에서 CRUD 작업을 수행할 수 있습니다.

### 조회폼+탭

이 템플릿은 조회폼과 탭 컴포넌트를 함께 사용한 패턴입니다. 탭별로 다른 내용을 표시하고, 각 탭에서 필요한 기능을 구현할 수 있습니다.

## 활용 방법

Natural-TEMPLATE 예제는 다음과 같은 방법으로 활용할 수 있습니다:

1. **샘플 코드 참조**: 각 예제의 HTML과 JavaScript 코드를 참조하여 유사한 기능을 구현할 수 있습니다.
2. **템플릿 복사 및 수정**: 예제 코드를 복사하여 프로젝트의 요구사항에 맞게 수정하여 사용할 수 있습니다.
3. **컴포넌트 조합 학습**: 다양한 Natural-JS 컴포넌트들이 어떻게 조합되어 사용되는지 학습할 수 있습니다.
4. **표준 코딩 패턴 익히기**: Natural-TEMPLATE의 코드 작성 규칙을 익혀 일관성 있는 코드를 작성할 수 있습니다.

각 예제는 해당 화면 패턴에 대한 가장 기본적인 구조를 제공하며, 필요에 따라 기능을 추가하거나 수정하여 사용할 수 있습니다.