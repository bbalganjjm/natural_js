# Natural-UI Tree 컴포넌트 개발자 가이드

Natural-UI의 Tree(N.tree) 컴포넌트는 계층적 데이터를 트리 요소로 만들어 주는 UI 컴포넌트입니다.

## 목차

1. [개요](#개요)
2. [생성자](#생성자)
3. [기본 옵션](#기본-옵션)
4. [함수](#함수)
5. [사용 예제](#사용-예제)
6. [주의 사항](#주의-사항)

## 개요

Tree(N.tree)는 계층적 데이터를 트리 요소로 만들어 주는 UI 컴포넌트입니다. 노드에 체크박스를 추가하여 그룹 선택을 할 수 있습니다.

## 생성자

### N.tree

`N.tree` 인스턴스를 생성합니다.

```javascript
var tree = new N.tree(data, opts|context);
```

| 인자 | 타입 | 설명 |
|------|------|------|
| data | json object array | data 옵션을 설정합니다. 기본 옵션의 data 옵션과 같습니다. |
| opts\|context | object \| jQuery Selector(string \| jQuery object) | 컴포넌트의 기본 옵션 객체를 지정합니다. jQuery selector 문자열이나 jQuery object를 입력하면 기본 옵션의 context 옵션으로 설정됩니다. |

### N(obj).tree

jQuery 플러그인 메소드로 N.tree 객체 인스턴스를 생성합니다.

```javascript
var tree = N(data).tree(opts|context);
```

객체 인스턴스를 생성하는 방식은 다르지만 `new N.tree()`로 생성한 인스턴스와 `N().tree`로 생성한 인스턴스는 동일합니다. N() 함수의 첫 번째 인수가 new N.tree 생성자의 첫 번째 인수로 설정됩니다.

| 인자 | 타입 | 설명 |
|------|------|------|
| opts\|context | object \| jQuery Selector(string \| jQuery object) | N.tree 함수의 두 번째 인수(opts)와 같습니다. |

## 기본 옵션

| 이름 | 타입 | 기본값 | 필수 | 설명 |
|------|------|--------|------|------|
| data | json object array | undefined | O | N.tree에 바인딩할 데이터를 지정합니다. |
| context | jQuery object\|jquery selector string | null | O | N.tree를 적용할 block(div) 요소를 지정합니다. |
| key | string | null | O | 노드 명으로 표시될 데이터의 프로퍼티명을 지정합니다. |
| val | string | null | O | 노드 값으로 설정될 데이터의 프로퍼티명을 지정합니다. |
| parent | string | null | O | 부모노드 값으로 설정될 데이터의 프로퍼티명을 지정합니다. |
| level | string | level |  | 노드 레벨로 설정될 데이터의 프로퍼티명을 지정합니다.<br>level 옵션은 필수 옵션이 아니지만 지정하면 트리 렌더링 속도가 더 빨라집니다. |
| folderSelectable | string | false |  | true로 설정하면 폴더 노드를 선택할 수 있습니다.<br>옵션 값이 true 이면 [+]아이콘을 클릭하여 폴더를 확장할 수 있고 노드명을 클릭하면 노드가 선택됩니다.<br>옵션 값이 false 이면 폴더 노드명을 클릭했을 때 폴더가 선택되지 않고 폴더를 확장합니다. |
| checkbox | boolean | false |  | true로 설정하면 체크박스가 노드명 앞에 추가됩니다.<br>체크박스가 체크되면 하위 노드들이 모두 체크되고 onCheck 이벤트 핸들러가 실행됩니다. |
| onSelect | function | null |  | 노드가 선택되었을 때 실행되는 이벤트 핸들러를 정의합니다.<br><br>```javascript
onSelect : function(selNodeIndex, selNodeEle, selNodeData) {
    // this : N.tree 인스턴스
    // selNodeIndex : 선택된 노드의 index
    // selNodeEle : 선택된 노드의 요소
    // selNodeData : 선택된 노드의 row data
}
``` |
| onCheck | function | null |  | 노드가 체크되었을 때 실행되는 이벤트 핸들러를 정의합니다.<br><br>```javascript
onCheck : function(selNodeIndex, selNodeEle, selNodeData
                , checkedElesIndexes, checkedEles, checkedElesData
                , checkFlag) {
    // this : N.tree 인스턴스
    // selNodeIndex : 선택된 노드의 index
    // selNodeEle : 선택된 노드의 요소
    // selNodeData : 선택된 노드의 row data
    // checkedElesIndexes : 체크된 노드들의 index
    // checkedEles : 체크된 노드들의 요소
    // checkedElesData : 체크된 노드들의 row data
    // checkFlag : 체크 여부
}
``` |

## 함수

| 이름 | 인자 | 타입 | 반환 | 설명 |
|------|------|------|------|------|
| data | selFlag, arguments[1], arguments[2], ... | boolean\|string | json object array\|jQuery object[json object array] | 컴포넌트에 바인딩된 최신 데이터를 반환합니다.<br><br>**selFlag**: 반환되는 데이터의 타입을 결정하거나 데이터를 필터링하기 위한 구분 값입니다.<br>selFlag 인수 값에 따라 다음과 같은 데이터를 반환합니다.<br>- undefined(selFlag 옵션이 지정되지 않은 경우): json object array 타입의 데이터를 반환합니다.<br>- false: 컴포넌트에 바인딩되어 있는 jQuery object[json object array] 타입의 원래 유형의 데이터를 반환합니다.<br>- "selected": 선택된 노드의 데이터를 반환합니다(array[object] 타입).<br>- "checked": 체크된 노드의 데이터를 반환합니다(array[object] 타입).<br>- "checkedInLastNode": 체크된 모든 요소들의 마지막 노드의 데이터를 반환합니다(array[object] 타입).<br><br>data 메서드로 가져온 데이터를 다른 데이터 관련 컴포넌트에 바인딩할 때는 반드시 "false"로 설정하여 원래 유형의 데이터를 바인딩해야 양방향 데이터 바인딩이 활성화됩니다.<br><br>**arguments[1], arguments[2], ...**: data 메서드의 두 번째 인수부터 n 번째 인수까지 데이터의 프로퍼티명을 인수로 지정하면 지정한 프로퍼티 값만 추출한 객체를 반환합니다.<br>첫 번째 인수를 "selected" 나 "checked", "checkedInLastNode"로 지정했을 때만 작동됩니다.<br><br>```javascript
var treeInst = N([]).tree(".context")
    .bind([{ col01 : "", col02 : "", col03 : "", col04 : "", col05 : "", col06 : "" }]);
treeInst.data("checked", "col01", "col02", "col03");
    // [{ col01 : "", col02 : "", col03 : "" }]
``` |
| context | selector | string | jQuery object | context 요소를 반환합니다.<br><br>jQuery selector 구문을 입력하면 context 요소에서 지정한 요소를 찾아서 반환합니다. |
| bind | data | string | N.tree | 컴포넌트에 데이터를 바인딩하여 context 옵션으로 지정한 요소 안에 Tree를 생성합니다. |
| select | val | string | string\|N.tree | 노드를 선택하거나 선택된 노드 값을 반환합니다.<br><br>인수가 없으면 선택된 노드 값을 가져오고 첫 번째 인수를 입력하면 입력된 값으로 노드를 선택합니다. |
| expand | - | - | N.tree | 모든 트리 노드를 펼칩니다. |
| collapse | isFirstNodeOpen | boolean | N.tree | 모든 트리 노드를 접습니다.<br><br>isFirstNodeOpen 인자가 true로 설정되면 첫 번째 노드를 제외한 모든 노드가 접힙니다. |

## 사용 예제

### 예제 데이터

모든 예제에서 사용하는 데이터 형식입니다.

```javascript
var data = [
    {
        "key": "Root",
        "val": "0",
        "level": 1,
        "parent": null
    }, {
        "key": "Key(node name) 1",
        "val": "1",
        "level": 2,
        "parent": "0"
    }, {
        "key": "Key(node name) 2",
        "val": "2",
        "level": 2,
        "parent": "0"
    }, {
        "key": "Key(node name) 3",
        "val": "3",
        "level": 2,
        "parent": "0"
    }, {
        "key": "Key(node name) 4",
        "val": "4",
        "level": 2,
        "parent": "0"
    }, {
        "key": "Key(node name) 1-1",
        "val": "11",
        "level": 3,
        "parent": "1"
    }, {
        "key": "Key(node name) 2-1",
        "val": "21",
        "level": 3,
        "parent": "2"
    }, {
        "key": "Key(node name) 2-2",
        "val": "22",
        "level": 3,
        "parent": "2"
    }, {
        "key": "Key(node name) 2-3",
        "val": "23",
        "level": 4,
        "parent": "2"
    }, {
        "key": "Key(node name) 3-1",
        "val": "31",
        "level": 4,
        "parent": "3"
    }, {
        "key": "Key(node name) 2-2-1",
        "val": "221",
        "level": 4,
        "parent": "22"
    }, {
        "key": "Key(node name) 2-2-2",
        "val": "222",
        "level": 4,
        "parent": "22"
    }, {
        "key": "Key(node name) 2-2-1-1",
        "val": "2211",
        "level": 5,
        "parent": "221"
    }, {
        "key": "Key(node name) 2-2-1-2",
        "val": "2212",
        "level": 5,
        "parent": "221"
    }, {
        "key": "Key(node name) 2-2-1-3",
        "val": "2213",
        "level": 5,
        "parent": "221"
    }
]
```

### 1. 기본 Tree 생성 하기

```html
<div class="treeBlock"></div>

<script type="text/javascript">
    N(data).tree(".treeBlock").bind();
</script>
```

### 2. 체크박스 Tree 생성 하기

```html
<div class="treeBlock"></div>

<script type="text/javascript">
    N(data).tree({
        context: ".treeBlock",
        checkbox: true
    }).bind();
</script>
```

### 3. 노드 선택 이벤트 처리하기

```html
<div class="treeBlock"></div>

<script type="text/javascript">
    N(data).tree({
        context: ".treeBlock",
        onSelect: function(selNodeIndex, selNodeEle, selNodeData) {
            console.log("선택된 노드:", selNodeData);
        }
    }).bind();
</script>
```

### 4. 체크박스 이벤트 처리하기

```html
<div class="treeBlock"></div>

<script type="text/javascript">
    N(data).tree({
        context: ".treeBlock",
        checkbox: true,
        onCheck: function(selNodeIndex, selNodeEle, selNodeData, checkedElesIndexes, checkedEles, checkedElesData, checkFlag) {
            console.log("체크 상태:", checkFlag);
            console.log("체크된 노드들:", checkedElesData);
        }
    }).bind();
</script>
```

### 5. 전역 설정으로 Tree 사용하기

Natural-JS의 Config(natural.config.js)에 다음과 같이 전역 옵션을 설정하면 더 간편하게 Tree를 사용할 수 있습니다.

```javascript
N.context.attr("ui", {
    ...
    "tree": {
        "key": "key",
        "val": "val",
        "level": "level",
        "parent": "parent"
    }
    ...
});

// 전역 설정을 사용하는 경우
N(data).tree(".treeBlock").bind(); // key, val, level, parent 옵션을 별도로 지정할 필요가 없음
```

### 6. Tree 노드 데이터 가져오기

```javascript
var tree = N(data).tree(".treeBlock").bind();

// 전체 데이터 가져오기
var allData = tree.data();

// 선택된 노드 데이터 가져오기
var selectedData = tree.data("selected");

// 체크된 노드 데이터 가져오기
var checkedData = tree.data("checked");

// 체크된 노드의 마지막 노드들만 가져오기
var lastNodeData = tree.data("checkedInLastNode");

// 특정 프로퍼티만 가져오기
var specificProps = tree.data("checked", "key", "val");
```

### 7. Tree 노드 조작하기

```javascript
var tree = N(data).tree(".treeBlock").bind();

// 특정 노드 선택하기
tree.select("22"); // val 값이 "22"인 노드 선택

// 선택된 노드 값 가져오기
var selectedNodeVal = tree.select();

// 모든 노드 펼치기
tree.expand();

// 모든 노드 접기
tree.collapse();

// 첫 번째 노드만 열린 상태로 유지하고 나머지 접기
tree.collapse(true);
```

## 주의 사항

1. Tree 컴포넌트에 바인딩되는 데이터는 계층 구조를 표현할 수 있는 부모-자식 관계 정보를 포함해야 합니다. 이를 위해 각 노드에는 `parent` 프로퍼티가 필요합니다.

2. 데이터 바인딩 시 `key`, `val`, `parent` 프로퍼티는 필수적으로 지정해야 합니다. `level` 프로퍼티는 필수는 아니지만, 지정하면 트리 렌더링 속도가 향상됩니다.

3. 전역 설정(Config)에 Tree 컴포넌트 관련 옵션을 미리 정의해 두면 매번 옵션을 설정하지 않아도 되어 편리합니다.

4. 폴더 노드의 선택 가능 여부를 제어하려면 `folderSelectable` 옵션을 사용하세요. 이 옵션이 `false`인 경우, 폴더 노드를 클릭하면 노드가 선택되지 않고 폴더가 확장/축소됩니다.

5. 체크박스 기능을 사용할 때는 상위 노드를 체크하면 모든 하위 노드도 자동으로 체크됩니다. 이 동작은 변경할 수 없습니다.

6. Tree 컴포넌트를 다른 데이터 관련 컴포넌트와 연동할 때는 `data(false)` 메서드를 사용하여 원래 유형의 데이터를 바인딩해야 양방향 데이터 바인딩이 활성화됩니다.