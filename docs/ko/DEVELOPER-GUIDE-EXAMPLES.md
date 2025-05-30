# Natural-JS 예제 가이드

Natural-JS로 개발할 때 참고할 수 있는 다양한 예제 컬렉션입니다. 이 문서에서는 실제 애플리케이션 개발 시 자주 사용되는 패턴과 구현 방법을 설명합니다.

## 목차

1. [데이터 목록 조회](#데이터-목록-조회)
2. [폼 데이터 조회](#폼-데이터-조회)
3. [폼 데이터 입력](#폼-데이터-입력)
4. [폼 데이터 수정](#폼-데이터-수정)
5. [데이터 그리드 CRUD(헤더고정형)](#데이터-그리드-crud헤더고정형)
6. [데이터 그리드 CRUD(리스트형)](#데이터-그리드-crud리스트형)
7. [화면전환 CRUD(페이징)](#화면전환-crud페이징)
8. [팝업 CRUD](#팝업-crud)
9. [마스터 그리드 & 디테일 폼](#마스터-그리드--디테일-폼)
10. [멀티 폼 바인딩](#멀티-폼-바인딩)

## 데이터 목록 조회

검색 박스(N.form)와 데이터 그리드(N.grid)가 조합된 데이터 목록 예제입니다.

### 구현 개요

1. 코드 데이터 초기화 및 바인딩
2. N.button 컴포넌트 초기화
3. N.form 컴포넌트 초기화 및 검색 조건 데이터 생성
4. N.grid 컴포넌트 초기화 및 빈 데이터 바인딩
5. 검색 버튼 이벤트 처리

### HTML 구조

```html
<div class="searchBox">
    <ul>
        <li class="inputs">
            <label>Name<input id="name" type="text" data-validate="[["alphabet+integer"]]"></label>
            <label>Gender<input id="gender" type="radio"></label>
            <label>Eye Color<select id="eyeColor"><option></option></select></label>
        </li>
        <li class="buttons">
            <a id="btnSearch" href="#">
                <span lang="ko_KR">조회</span>
            </a>
        </li>
    </ul>
</div>

<table id="grid" class="grid__" style="width: 100%;">
    <colgroup>
        <col style="width: 9%;">
        <col style="width: 17%;">
        <col style="width: auto;">
        <col style="width: 11%;">
        <col style="width: 13%;">
        <col style="width: 7%;">
        <col style="width: 13%;">
        <col style="width: 12%;">
    </colgroup>
    <thead>
        <tr>
            <th>Index</th>
            <th>Name</th>
            <th>Email</th>
            <th>Gender</th>
            <th>Eye Color</th>
            <th>Age</th>
            <th>Company</th>
            <th>Active</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td id="index" style="text-align: center;"></td>
            <td id="name"></td>
            <td id="email"></td>
            <td id="gender" style="text-align: center;"></td>
            <td id="eyeColor" style="text-align: center;"></td>
            <td id="age"></td>
            <td id="company"></td>
            <td style="text-align: center;"><span id="isActive"></span></td>
        </tr>
    </tbody>
</table>
```

### JavaScript 구현

```typescript
const cont = N(".exap0100").cont({
    init: function (view, request) {
        cont.setCodes(["gender", "eyeColor"], function () {
            // N.select 컴포넌트는 N.grid나 N.form과 같은 데이터 관련 컴포넌트보다 먼저 초기화되어야 합니다
            cont.setComponents();
            cont.setEvents();
        });
    },
    setCodes: function (codeParams: string[], afterCodeInitFn: Function) {
        // 1. N.select 초기화 및 코드 데이터 바인딩
        N({codes: codeParams}).comm("html/naturaljs/exap/data/code.json").submit(function (data, request) {
            N(codeParams).each(function (i, code) {
                N(data as NC.JSONObject[]).datafilter("code === '" + code + "'").select(N(".searchBox #" + code, cont.view)).bind();
            });

            afterCodeInitFn.call(cont);
        });
    },
    setComponents: function () {
        // 2. N.button 초기화
        N(".buttons a", cont.view).button();

        // 3. N.form 초기화 및 새 행 데이터 추가
        cont.form = N([]).form({
            context: N("div.searchBox li.inputs", cont.view),
            revert: true
        }).add();

        // 4. N.grid 초기화 및 빈 데이터 바인딩
        cont.grid = N([]).grid({
            context: N("#grid", cont.view),
            data: [],
            height: 350,
            resizable: true,
            sortable: true,
            filter: true
        }).bind();
    },
    setEvents: function () {
        // 5. 이벤트 바인딩
        N("#btnSearch", cont.view).on("click", function (e) {
            e.preventDefault();
            if (cont.form.validate()) {
                N(cont.form.data(true)).comm("html/naturaljs/exap/data/sample.json").submit(function (data, request) {
                    cont.grid.bind(data);
                });
            }
        });
    },
    messages: {
        "ko_KR": {},
        "en_US": {}
    }
});
```

### 주요 기능

- 검색 조건 입력 폼 구현
- 코드 데이터(성별, 눈 색상) 바인딩
- 검색 버튼 이벤트 처리
- 데이터 그리드 표시 및 필터링, 정렬 기능 제공

## 폼 데이터 조회

폼(N.form)을 이용하여 폼 데이터를 조회하는 예제입니다.

### 구현 개요

1. N.button 컴포넌트 초기화
2. N.form 컴포넌트 초기화
3. 폼 데이터 바인딩

### HTML 구조

```html
<table id="detail" class="form__" style="width: 100%;">
    <tr>
        <th rowspan="11" style="width: 15%;">picture</th>
        <td rowspan="11" style="width: 35%; text-align: center; vertical-align: middle;"><img id="picture" src="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs%3D" style="height: 100px;"></td>
        <th style="width: 15%;">Name</th>
        <td id="name" style="width: 35%;"></td>
    </tr>
    <tr>
        <th>Email</th>
        <td id="email"></td>
    </tr>
    <tr>
        <th>Password</th>
        <td id="key" data-format="[["generic", "@@＊＊＊＊＊＊"]]"></td>
    </tr>
    <!-- 추가 필드들... -->
</table>
```

### JavaScript 구현

```typescript
const cont = N(".exap0200").cont({
    init : function(view, request) {
        cont._key = "101";
        cont.setComponents();
    },
    setComponents : function() {
        // 1. 버튼 초기화
        N(".buttons a", cont.view).button();

        // 2. N.form 초기화
        cont.form = N([]).form(N("#detail", cont.view));

        // 2-1. 폼 데이터 바인딩
        N.comm("html/naturaljs/exap/data/" + cont._key + ".json").submit(function(data) {
            // N.form으로 데이터 바인딩
            cont.form.bind(0, data);
        });
    },
    messages : {
        "ko_KR" : {},
        "en_US" : {}
    }
});
```

### 주요 기능

- 단일 데이터 조회 및 표시
- 데이터 포맷팅 (암호, 날짜, 통화 등)
- 읽기 전용 폼 구현

## 폼 데이터 입력

폼(N.form)을 이용하여 새로운 데이터를 생성하는 예제입니다.

### 구현 개요

1. 코드 데이터 초기화 및 바인딩
2. N.button 컴포넌트 초기화
3. N.form 컴포넌트 초기화 및 새 데이터 생성
4. 저장, 되돌리기 버튼 이벤트 처리

### HTML 구조

```html
<div class="searchBox">
    <ul>
        <li class="buttons">
            <a id="btnSave" href="#">
                <span lang="ko_KR">저장</span>
            </a>
            <a id="btnRevert" href="#">
                <span lang="ko_KR">되돌리기</span>
            </a>
        </li>
    </ul>
</div>

<table id="detail" class="form__" style="width: 100%;">
    <tr>
        <th rowspan="11" style="width: 15%;">picture</th>
        <td rowspan="11" style="width: 35%; text-align: center; vertical-align: middle;"><img id="picture" src="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs%3D" style="height: 100px;"></td>
        <th style="width: 15%;"><label for="name">Name</label></th>
        <td style="width: 35%;"><input id="name" type="text" data-validate="[["required"]]"></td>
    </tr>
    <!-- 추가 필드들... -->
</table>
```

### JavaScript 구현

```typescript
const cont = N(".exap0300").cont({
    init : function(view, request) {
        cont.setCodes([ "gender", "eyeColor", "company", "favoriteFruit" ], function() {
            // N.select 컴포넌트는 N.grid나 N.form과 같은 데이터 관련 컴포넌트보다 먼저 초기화되어야 합니다
            cont.setComponents();
            cont.setEvents();
        });
    },
    setCodes : function(codeParams: string[], afterCodeInitFn: Function) {
        // 1. N.select 초기화 및 코드 데이터 바인딩
        N({ codes : codeParams }).comm("html/naturaljs/exap/data/code.json").submit(function(data, request) {
            N(codeParams).each(function(i, code) {
                N(data as NC.JSONObject[]).datafilter("code === '" + code + "'").select(N("#detail #" + code, cont.view)).bind();
            });

            afterCodeInitFn.call(cont);
        });
    },
    setComponents : function() {
        // 2. N.button 초기화
        N(".buttons a", cont.view).button();

        // 3. N.form 초기화 및 새 데이터 생성
        cont.form = N([]).form({
            context : N("#detail", cont.view),
            revert : true
        }).add();
    },
    setEvents : function() {
        // 4. 이벤트 바인딩
        // 4-1 서버에 데이터 저장
        N("#btnSave", cont.view).on("click", function(e) {
            e.preventDefault();
            if(cont.form.validate()) {
                N(window).alert({
                    msg : N.message.get(cont.messages, "EXAP0300-0003"),
                    confirm : true,
                    onOk : function(): undefined {
                        N(cont.form.data(true)).comm({
                            type : NA.Objects.Request.HttpMethod.POST,
                            url : "html/naturaljs/exap/data/sample.json"
                        }).submit(function(data) {
                            let msg;
                            if(data as number > 0) {
                                msg = N.message.get(cont.messages, "EXAP0300-0001");
                            } else {
                                msg = N.message.get(cont.messages, "EXAP0300-0002");
                            }
                            N(window).alert(msg).show();
                        });
                    }
                }).show();
            }
        });
        // 4-2 초기화된 데이터로 리셋
        N("#btnRevert", cont.view).on("click", function(e) {
            e.preventDefault();
            cont.form.revert();
        });
    },
    messages : {
        "ko_KR" : {
            "EXAP0300-0001" : "저장이 완료되었습니다.",
            "EXAP0300-0002" : "저장이 완료되지 않았습니다. 관리자에게 문의 바랍니다.",
            "EXAP0300-0003" : "저장이 하겠습니까?"
        },
        "en_US" : {
            "EXAP0300-0001" : "Saving is complete.",
            "EXAP0300-0002" : "Saving is not complete. Please contact the administrator.",
            "EXAP0300-0003" : "Do you want to save it?"
        }
    }
});
```

### 주요 기능

- 새 데이터 입력 폼 구현
- 필수 입력 필드 및 유효성 검증 규칙 적용
- 데이터 포맷팅 (날짜, 숫자 등)
- 저장 및 되돌리기 기능

## 폼 데이터 수정

폼(N.form)을 이용하여 조회한 데이터를 수정하는 예제입니다.

### 구현 개요

1. 코드 데이터 초기화 및 바인딩
2. N.button 컴포넌트 초기화
3. N.form 컴포넌트 초기화 및 데이터 바인딩
4. 저장, 되돌리기 버튼 이벤트 처리

### HTML 구조

```html
<div class="searchBox">
    <ul>
        <li class="buttons">
            <a id="btnSave" href="#">
                <span lang="ko_KR">저장</span>
            </a>
            <a id="btnRevert" href="#">
                <span lang="ko_KR">되돌리기</span>
            </a>
        </li>
    </ul>
</div>

<table id="detail" class="form__" style="width: 100%;">
    <!-- 입력 필드들... -->
</table>
```

### JavaScript 구현

```typescript
const cont = N(".exap0400").cont({
    init : function(view, request) {
        cont._key = "101";
        cont.setCodes([ "gender", "eyeColor", "company", "favoriteFruit" ], function() {
            // N.select 컴포넌트는 N.grid나 N.form과 같은 데이터 관련 컴포넌트보다 먼저 초기화되어야 합니다
            cont.setComponents();
            cont.setEvents();
        });
    },
    setCodes : function(codeParams: string[], afterCodeInitFn: Function) {
        // 1. N.select 초기화 및 코드 데이터 바인딩
        N({ codes : codeParams }).comm("html/naturaljs/exap/data/code.json").submit(function(data, request) {
            N(codeParams).each(function(i, code) {
                N(data as NC.JSONObject[]).datafilter("code === '" + code + "'").select(N("#detail #" + code as string, cont.view)).bind();
            });

            afterCodeInitFn.call(cont);
        });
    },
    setComponents : function() {
        // 2. 버튼 초기화
        N(".buttons a", cont.view).button();

        // 3. N.form 초기화
        cont.form = N([]).form({
            context : N("#detail", cont.view),
            revert : true
        });

        // 3-1. N.form 데이터 바인딩
        N.comm("html/naturaljs/exap/data/" + cont._key + ".json").submit(function(data) {
            // N.form으로 데이터 바인딩
            cont.form.bind(0, data);
        });
    },
    setEvents : function() {
        // 4. 이벤트 바인딩
        // 4-1 서버에 데이터 저장
        N("#btnSave", cont.view).on("click", function(e) {
            e.preventDefault();
            if(cont.form.data(true)[0].rowStatus === undefined) {
                N.notify.add(N.message.get(cont.messages, "EXAP0400-0004"));
                return false;
            }
            if(cont.form.validate()) {
                N(window).alert({
                    msg : N.message.get(cont.messages, "EXAP0400-0003"),
                    confirm : true,
                    onOk : function(): undefined {
                        N(cont.form.data(true)).comm({
                            type : NA.Objects.Request.HttpMethod.PATCH,
                            url : "html/naturaljs/exap/data/" + cont._key + ".json"
                        }).submit(function(data) {
                            let msg;
                            if(data as number > 0) {
                                msg = N.message.get(cont.messages, "EXAP0400-0001");
                            } else {
                                msg = N.message.get(cont.messages, "EXAP0400-0002");
                            }
                            N(window).alert(msg).show();
                        });
                    }
                }).show();
            }
        });

        // 4-2 초기화된 데이터로 리셋
        N("#btnRevert", cont.view).on("click", function(e) {
            e.preventDefault();
            cont.form.revert();
        });
    },
    messages : {
        "ko_KR" : {
            "EXAP0400-0001" : "수정이 완료되었습니다.",
            "EXAP0400-0002" : "수정이 완료되지 않았습니다. 관리자에게 문의 바랍니다.",
            "EXAP0400-0003" : "저장이 하겠습니까?",
            "EXAP0400-0004" : "변경된 데이터가 없습니다."
        },
        "en_US" : {
            "EXAP0400-0001" : "Editing is complete.",
            "EXAP0400-0002" : "Editing is not complete. Please contact the administrator.",
            "EXAP0400-0003" : "Do you want to save it?",
            "EXAP0400-0004" : "No changed data."
        }
    }
});
```

### 주요 기능

- 기존 데이터 불러오기 및 수정
- 변경 데이터 감지
- PATCH 메서드를 통한 변경 데이터만 서버에 전송
- 유효성 검증 및 데이터 포맷팅

## 데이터 그리드 CRUD(헤더고정형)

데이터 그리드(N.grid(헤더고정형))에서 직접 입력, 조회, 수정, 삭제를 처리하는 예제입니다.

### 구현 개요

1. 코드 데이터 초기화 및 바인딩
2. N.button 컴포넌트 초기화
3. N.form 컴포넌트 초기화 (검색 조건용)
4. N.grid 컴포넌트 초기화 (헤더고정형)
5. 조회, 추가, 삭제, 저장 버튼 이벤트 처리

### HTML 구조

```html
<div class="searchBox">
    <ul>
        <li class="inputs">
            <!-- 검색 조건 필드들... -->
        </li>
        <li class="buttons">
            <a id="btnAdd" href="#">
                <span lang="ko_KR">추가</span>
            </a>
            <a id="btnDelete" href="#">
                <span lang="ko_KR">삭제</span>
            </a>
            <a id="btnSave" href="#">
                <span lang="ko_KR">저장</span>
            </a>
            <a id="btnSearch" href="#">
                <span lang="ko_KR">조회</span>
            </a>
        </li>
    </ul>
</div>

<table id="grid" class="grid__" style="width: 100%;">
    <colgroup>
        <!-- 컬럼 너비 설정... -->
    </colgroup>
    <thead>
        <tr>
            <th rowspan="3">
                <input lang="ko_KR" id="checkAll" type="checkbox" title="전체 체크">
            </th>
            <th rowspan="3">Index</th>
            <th colspan="7">Privacy</th>
        </tr>
        <tr>
            <th rowspan="2">Name</th>
            <th>Email</th>
            <th data-filter="true">Gender</th>
            <th data-filter="true">Eye Color</th>
            <th rowspan="2" data-filter="true">Age</th>
            <th data-filter="true">Registered</th>
            <th data-filter="true">Active</th>
        </tr>
        <tr>
            <th colspan="3">About</th>
            <th colspan="2">Greeting</th>
        </tr>
    </thead>
    <tbody>
        <!-- 데이터 행 템플릿... -->
    </tbody>
</table>
```

### JavaScript 구현

```typescript
const cont = N(".exap0500").cont({
    init : function(view, request) {
        cont.setCodes([ "gender", "eyeColor" ], function() {
            // N.select 컴포넌트는 N.grid나 N.form과 같은 데이터 관련 컴포넌트보다 먼저 초기화되어야 합니다
            cont.setComponents();
            cont.setEvents();
        });
    },
    setCodes : function(codeParams: string[], afterCodeInitFn: Function) {
        // 1. N.select 초기화 및 코드 데이터 바인딩
        N({ codes : codeParams }).comm("html/naturaljs/exap/data/code.json").submit(function(data, request) {
            N(codeParams).each(function(i, code) {
                const filteredData = N(data as NC.JSONObject[]).datafilter("code === '" + code + "'");
                filteredData.select(N(".searchBox #" + code, cont.view)).bind();
                filteredData.select(N(".grid__ #" + code, cont.view)).bind();
            });

            afterCodeInitFn.call(cont);
        });
    },
    setComponents : function() {
        // 2. 버튼 초기화
        N(".buttons a", cont.view).button();

        // 3. N.form 초기화 및 검색 박스용 새 행 데이터 추가
        cont.form = N([]).form({
            context : N(".searchBox", cont.view),
            revert : true
        }).add();

        // 4. N.grid 초기화 및 데이터 목록용 빈 데이터 바인딩
        cont.grid = N([]).grid({
            context : N("#grid", cont.view),
            height : 350,
            resizable : false,
            sortable : true,
            more : true,
            checkAll : "#checkAll",
            checkAllTarget : ".checkAllTarget"
        }).bind();
    },
    setEvents : function() {
        // 5. 이벤트 바인딩
        // 5-1. 검색 버튼
        N("#btnSearch", cont.view).on("click", function(e) {
            e.preventDefault();
            if(cont.form.validate()) {
                N(cont.form.data(true)).comm("html/naturaljs/exap/data/sample.json").submit(function(data, request) {
                    // N.grid로 데이터 바인딩
                    cont.grid.bind(data);
                });
            }
        });
        // 5-2. 추가 버튼
        N("#btnAdd", cont.view).on("click", function(e) {
            e.preventDefault();
            cont.grid.add();
        });
        // 5-3. 삭제 버튼
        N("#btnDelete", cont.view).on("click", function(e) {
            e.preventDefault();
            const checkedIndexs = cont.grid.check();
            if(checkedIndexs.length > 0) {
                N(window).alert({
                    msg : N.message.get(cont.messages, "EXAP0500-0001"),
                    confirm : true,
                    onOk : function(): undefined {
                        cont.grid.remove(checkedIndexs);
                    }
                }).show();
            } else {
                N(window).alert(N.message.get(cont.messages, "EXAP0500-0004")).show();
            }
        });
        // 5-4. 저장 버튼
        N("#btnSave", cont.view).on("click", function(e) {
            e.preventDefault();

            if(cont.grid.data("modified").length === 0) {
                N.notify.add(N.message.get(cont.messages, "EXAP0500-0003"));
                return false;
            }

            if(cont.grid.validate()) {
                N(window).alert({
                    msg : N.message.get(cont.messages, "EXAP0500-0005"),
                    confirm : true,
                    onOk : function(): undefined {
                        N(cont.grid.data("modified")).comm({
                            type : NA.Objects.Request.HttpMethod.PUT,
                            dataIsArray : true, // 다중 행 데이터(배열)를 전송할 때
                            url : "html/naturaljs/exap/data/sample.json"
                        }).submit(function(data) {
                            // 성공 메시지 표시 및 데이터 재조회
                        });
                    }
                }).show();
            }
        });
    },
    messages : {
        "ko_KR" : {
            "EXAP0500-0001" : "삭제 하시겠습니까?\n저장 버튼을 누르기 전까지는 DB에 반영되지 않습니다.",
            "EXAP0500-0002" : "저장이 완료되었습니다.",
            "EXAP0500-0003" : "변경된 데이터가 없습니다.",
            "EXAP0500-0004" : "선택된 행이 없습니다.",
            "EXAP0500-0005" : "저장 하시겠습니까?",
            "EXAP0500-0006" : " - 입력 : {0} 건",
            "EXAP0500-0007" : " - 수정 : {0} 건",
            "EXAP0500-0008" : " - 삭제 : {0} 건"
        },
        "en_US" : {
            // 영문 메시지...
        }
    }
});
```

### 주요 기능

- 헤더고정형 복합 그리드 구현
- 체크박스를 통한 다중 행 선택 및 삭제
- 데이터 필터링 및 정렬
- 유효성 검증 및 데이터 포맷팅
- 변경 데이터 감지 및 일괄 처리

## 데이터 그리드 CRUD(리스트형)

데이터 그리드(N.grid(리스트형))에서 직접 입력, 조회, 수정, 삭제를 처리하는 예제입니다.

### 구현 개요

1. 코드 데이터 초기화 및 바인딩
2. N.button 컴포넌트 초기화
3. N.form 컴포넌트 초기화 (검색 조건용)
4. N.grid 컴포넌트 초기화 (리스트형)
5. 조회, 추가, 삭제, 저장 버튼 이벤트 처리

### HTML 구조

```html
<div class="searchBox">
    <ul>
        <li class="inputs">
            <!-- 검색 조건 필드들... -->
        </li>
        <li class="buttons">
            <a id="btnAdd" href="#">
                <span lang="ko_KR">추가</span>
            </a>
            <a id="btnDelete" href="#">
                <span lang="ko_KR">삭제</span>
            </a>
            <a id="btnSave" href="#">
                <span lang="ko_KR">저장</span>
            </a>
            <a id="btnSearch" href="#">
                <span lang="ko_KR">조회</span>
            </a>
        </li>
    </ul>
</div>

<table id="grid" class="grid__" style="width: 100%;">
    <colgroup>
        <!-- 컬럼 너비 설정... -->
    </colgroup>
    <thead>
        <tr>
            <th>
                <input lang="ko_KR" id="checkAll" type="checkbox" title="전체 체크">
            </th>
            <th>Name</th>
            <th data-filter="true">Email</th>
            <th data-filter="true">Gender</th>
            <th data-filter="true">Eye Color</th>
            <th data-filter="true">Age</th>
            <th data-filter="true">Registered</th>
            <th data-filter="true">Active</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td style="text-align: center;"><input class="checkAllTarget" type="checkbox"></td>
            <td><input id="name" type="text" data-validate="[["required"]]"></td>
            <td><input id="email" type="text" data-validate="[["required"], ["email"]]"></td>
            <td style="text-align: center;">
                <select id="gender" data-validate="[["required"]]">
                    <option lang="ko_KR" value="">선택</option>
                </select>
            </td>
            <td style="text-align: center;">
                <select id="eyeColor" data-validate="[["required"]]">
                    <option lang="ko_KR" value="">선택</option>
                </select>
            </td>
            <td><input id="age" type="text" data-validate="[["required"], ["integer"]]"></td>
            <td><input id="registered" type="text" data-format="[["date", 8, "date"]]" data-validate="[["required"]]"></td>
            <td style="text-align: center;"><input id="isActive" type="checkbox"></td>
        </tr>
    </tbody>
</table>
```

### JavaScript 구현

헤더고정형 그리드와 유사하지만, 그리드 초기화 옵션에서 다음과 같은 차이가 있습니다:

```typescript
// N.grid 초기화 (리스트형)
cont.grid = N([]).grid({
    context : N("table#grid", cont.view),
    resizable : true, // 리스트형 그리드에서는 resizable이 true로 설정됩니다
    sortable : true,
    checkAll : "#checkAll",
    checkAllTarget : ".checkAllTarget"
}).bind();
```

### 주요 기능

- 리스트형 그리드 구현 (헤더고정형보다 단순한 구조)
- 체크박스를 통한 다중 행 선택 및 삭제
- 데이터 필터링 및 정렬
- 컬럼 크기 조정 지원
- 유효성 검증 및 데이터 포맷팅
- 변경 데이터 감지 및 일괄 처리

## 화면전환 CRUD(페이징)

페이지네이션을 활용한 CRUD 구현 예제입니다. 이 예제에서는 목록 화면과 상세 화면을 전환하며 데이터를 관리하는 방법을 보여줍니다.

## 팝업 CRUD

팝업 창을 활용한 CRUD 구현 예제입니다. 목록 화면에서 팝업 창을 통해 데이터 상세 조회, 입력, 수정을 처리하는 방법을 보여줍니다.

## 마스터 그리드 & 디테일 폼

마스터-디테일 관계의 데이터를 관리하는 예제입니다. 마스터 그리드에서 선택한 데이터에 따라 디테일 폼의 내용이 변경되는 구현 방법을 보여줍니다.

## 멀티 폼 바인딩

하나의 데이터를 여러 폼에 바인딩하는 예제입니다. 탭이나 패널로 구분된 여러 폼에 동일한 데이터를 표시하고 관리하는 방법을 보여줍니다.
