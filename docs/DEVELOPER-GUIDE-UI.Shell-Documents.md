# Natural-UI.Shell - Documents (N.docs)

Natural-JS의 Documents 컴포넌트(N.docs)는 Natural-JS 기반의 메뉴 페이지를 MDI(Multiple Document Interface) 또는 SDI(Single Document Interface) 구조로 표시하는 페이지 컨테이너입니다. 이 문서에서는 Documents 컴포넌트의 기능, 옵션, 사용 방법 등에 대해 상세히 설명합니다.

## 1. 개요

Documents 컴포넌트는 웹 애플리케이션에서 여러 페이지를 탭 형태로 관리할 수 있는 기능을 제공합니다. MDI 모드에서는 여러 개의 탭을 열어 콘텐츠를 관리할 수 있으며, SDI 모드에서는 단일 페이지만 표시합니다. 주요 기능으로는:

- 최대 페이지 수 및 최대 상태 유지 페이지 수 지정
- 로딩 인디케이터 제공
- 탭 간 파라미터 전달
- 다양한 이벤트 핸들러 지원

## 2. 생성자

Documents 컴포넌트는 다음과 같은 방식으로 생성할 수 있습니다:

### 2.1 N.docs 생성자

```javascript
var docs = new N.docs(context, opts);
```

- **context**: Documents를 적용할 block 요소 (jQuery 객체 또는 selector 문자열)
- **opts**: 컴포넌트의 기본 옵션 객체

### 2.2 jQuery 플러그인 방식

```javascript
var docs = N(context).docs(opts);
```

두 방식 모두 동일한 기능을 제공합니다. N() 함수의 첫 번째 인수가 new N.docs 생성자의 첫 번째 인수로 설정됩니다.

## 3. 기본 옵션

Documents 컴포넌트는 다양한 옵션을 제공하여 동작을 사용자 정의할 수 있습니다.

| 이름 | 타입 | 기본값 | 필수 | 설명 |
|------|------|--------|------|------|
| context | jQuery 객체 또는 selector 문자열 | null | O | N.docs를 적용할 block 요소를 지정합니다. |
| multi | boolean | true | X | true 설정 시 탭 기반 MDI 형태로 생성되고, false 설정 시 SDI 형태로 생성됩니다.<br>- true: 탭과 페이지 콘텐츠들을 표시<br>- false: 탭은 표시하지 않고 단 한 개의 페이지 콘텐츠만 표시 |
| maxStateful | number | 0 | X | multi 옵션이 true인 경우, 최대 상태 유지 탭 콘텐츠 수를 설정합니다. 새로운 콘텐츠를 열 때 열려있는 탭 콘텐츠의 개수가 이 값을 초과하면 가장 먼저 열린 탭 콘텐츠의 상태가 제거됩니다. 값이 0이면 제한하지 않습니다. |
| maxTabs | number | 0 | X | multi 옵션이 true인 경우, 최대 탭 콘텐츠 수를 설정합니다. 탭 개수가 이 값을 초과하면 더 이상 탭을 열 수 없습니다. 값이 0이면 제한하지 않습니다. |
| addLast | boolean | false | X | true 설정 시 add 메서드 호출 시 새로운 탭이 마지막에 추가됩니다. |
| tabScroll | boolean | false | X | true 설정 시 탭들을 마우스 드래그나 터치로 스크롤할 수 있습니다. |
| tabScrollCorrection | object | false | X | 탭 요소에 영향을 주는 스타일(CSS)에 의해 마지막 탭이 잘리거나 여백이 생길 때 조정 옵션을 제공합니다.<br>rightCorrectionPx: 마지막 탭 모양을 보정하는 옵션 |
| closeAllRedirectURL | string | null | X | "모두 닫기" 버튼 클릭 시 동작을 정의합니다. null이면 활성 탭을 제외한 모든 탭이 닫히고, URL 문자열 입력 시 해당 URL로 리디렉션됩니다. |
| entireLoadIndicator | boolean | false | X | true 설정 시 페이지 로딩 시 실행되는 모든 Ajax 요청이 완료될 때까지 진행 상태 바를 표시합니다. |
| entireLoadScreenBlock | boolean | false | X | true 설정 시 페이지 로딩 시 실행되는 모든 Ajax 요청이 완료될 때까지 화면을 차단하여 중복 제출을 방지합니다. |
| entireLoadExcludeURLs | array | [] | X | entireLoad 관련 이벤트나 옵션에서 제외할 URL 목록을 지정합니다. |
| alwaysOnTop | boolean | false | X | true 설정 시 메뉴 목록 대화 상자를 항상 최상위에 표시합니다. |
| alwaysOnTopCalcTarget | string | 'div, span, ul, p, nav, article, section, header, footer, aside' | X | alwaysOnTop 옵션 적용 시 z-index 계산 대상 요소를 지정합니다. |

### 3.1 이벤트 관련 옵션

| 이름 | 타입 | 기본값 | 필수 | 설명 |
|------|------|--------|------|------|
| onBeforeLoad | function | null | X | 콘텐츠가 로딩되기 전 실행되는 이벤트입니다. |
| onLoad | function | null | X | 페이지가 로딩된 후 실행되는 이벤트입니다. |
| onBeforeEntireLoad | function | null | X | 페이지 로딩 시 Ajax 요청들이 캡처되기 전 실행되는 이벤트입니다. |
| onErrorEntireLoad | function | null | X | 페이지 로딩 완료 후 Ajax 요청 중 에러 발생 시 실행되는 이벤트입니다. |
| onEntireLoad | function | null | X | 페이지 로딩 완료 후 모든 Ajax 요청이 완료된 후 실행되는 이벤트입니다. |
| onBeforeActive | function | null | X | 탭이 활성화되기 전 실행되는 이벤트입니다. |
| onActive | function | null | X | 탭이 활성화된 후 실행되는 이벤트입니다. |
| onBeforeInactive | function | null | X | 탭이 비활성화되기 전 실행되는 이벤트입니다. |
| onInactive | function | null | X | 탭이 비활성화된 후 실행되는 이벤트입니다. |
| onBeforeRemoveState | function | null | X | 탭의 상태가 제거되기 전 실행되는 이벤트입니다. |
| onRemoveState | function | null | X | 탭의 상태가 제거된 후 실행되는 이벤트입니다. |
| onBeforeRemove | function | null | X | 탭이 제거되기 전 실행되는 이벤트입니다. |
| onRemove | function | null | X | 탭이 제거된 후 실행되는 이벤트입니다. |

각 이벤트 핸들러 함수는 다음과 같은 형태로 사용할 수 있습니다:

```javascript
onLoad: function(docId) {
    // docId: document id
    var doc = this.doc(docId); // document 정보 가져오기
    var cont = this.cont(docId); // document의 Controller object 가져오기
    var view = cont.view;
    var request = cont.request;
}
```

## 4. Document.request

Document.request(N.docs.request)는 단독으로 사용할 수 없고, N.docs로 콘텐츠를 로딩할 때마다 생성되는 객체입니다. request는 요청 정보를 갖고 있으며, attr 메서드로 document 간 파라미터를 전달할 수 있습니다.

```javascript
// 파라미터 설정 예시
var docs = N("container selector").docs();
docs.request.attr("pageParam", { "param": 1 }).add("page id", "page name", { url: "url" });

// 또는 리로드 시
docs.request.attr("pageParam", { "param": 1 }).reload();
```

로드된 콘텐츠의 Controller object에서는 다음과 같이 파라미터를 얻을 수 있습니다:

```javascript
N("page id").cont({
    init: function(view, request) {
        N.log(request.attr("pageParam")); // --> { param: 1 }
        // request 객체는 Controller object에서 this.request 속성으로도 참조 가능
    }
});
```

Document.request는 Communicator.request 모듈을 사용합니다. 자세한 내용은 Communicator.request 모듈 문서를 참고하세요.

## 5. 주요 함수

Documents 컴포넌트는 다양한 기능을 제공하는 메서드들을 제공합니다.

| 이름 | 인자 | 반환 타입 | 설명 |
|------|------|-----------|------|
| context | N/A 또는 selector(string) | jQuery object | context 요소를 반환합니다. selector 인자를 입력하면 context 요소에서 지정한 요소를 찾아 반환합니다. |
| add | docId(string), docNm(string), docOpts(object) | N.docs | 새로운 탭 콘텐츠를 추가합니다. 동일한 ID를 가진 탭이 이미 있으면 해당 콘텐츠가 활성화됩니다. |
| active | docId(string) | N.docs | 지정한 탭 콘텐츠를 활성화합니다. |
| removeState | docId(string) | N.docs | 지정한 탭 콘텐츠의 상태를 제거합니다. |
| remove | docId(string), unconditional(boolean) | N.docs | 지정한 탭 콘텐츠를 제거합니다. unconditional이 true면 페이지에 수정된 데이터가 있어도 무조건 제거합니다. |
| doc | docId(string) | object 또는 array | 지정한 탭 콘텐츠의 정보를 가져옵니다. docId를 입력하지 않으면 모든 탭 콘텐츠 정보를 배열로 반환합니다. |
| cont | docId(string) | object | 지정한 탭 콘텐츠의 Controller object를 가져옵니다. |
| reload | docId(string), callback(function) | N.docs | 지정한 탭 콘텐츠를 다시 로드합니다. reload 함수 실행 전 request.attr로 값을 지정하지 않았다면 이전 request 객체의 값이 유지됩니다. |

### 5.1 add 메서드의 docOpts 옵션

docOpts 객체에는 다음과 같은 속성을 설정할 수 있습니다:

```javascript
var docOpts = {
    url: "url",                // document URL
    urlSync: true,             // 서버 요청/응답 시 location.href가 다르면 응답을 차단
    docId: docId,              // document 아이디
    docNm: docNm,              // document 명
    onBeforeLoad: function() {},       // 이 document에만 적용되는 onBeforeLoad 이벤트
    onLoad: function() {},             // 이 document에만 적용되는 onLoad 이벤트
    onBeforeActive: function() {},     // 이 document에만 적용되는 onBeforeActive 이벤트
    onActive: function() {},           // 이 document에만 적용되는 onActive 이벤트
    onBeforeInactive: function() {},   // 이 document에만 적용되는 onBeforeInactive 이벤트
    onInactive: function() {},         // 이 document에만 적용되는 onInactive 이벤트
    onBeforeRemoveState: function() {}, // 이 document에만 적용되는 onBeforeRemoveState 이벤트
    onRemoveState: function() {},      // 이 document에만 적용되는 onRemoveState 이벤트
    onBeforeRemove: function() {},     // 이 document에만 적용되는 onBeforeRemove 이벤트
    onRemove: function() {},           // 이 document에만 적용되는 onRemove 이벤트
    stateless: false           // 탭 콘텐츠의 상태 유지 여부
};
```

여기에 설정된 이벤트들은 전역 이벤트가 실행된 다음 실행됩니다.

## 6. 유틸리티 함수

Documents 컴포넌트는 로딩 인디케이터를 제어하는 유틸리티 함수를 제공합니다.

| 이름 | 인자 | 반환 타입 | 설명 |
|------|------|-----------|------|
| N.doc.createLoadIndicator | N/A | N.docs | 로딩바와 화면 클릭을 차단하는 요소를 원하는 지점에서 생성합니다. |
| N.doc.updateLoadIndicator | entireLoadRequestCnt(number), entireLoadRequestMaxCnt(number) | N.docs | 로딩바의 진행률을 원하는 지점에서 업데이트합니다. entireLoadRequestCnt는 남은 로딩 프로세스 수로, 완료될 때까지 1씩 감소합니다. entireLoadRequestMaxCnt는 전체 로딩 프로세스 수입니다. |
| N.doc.removeLoadIndicator | N/A | N.docs | 로딩바와 화면 클릭을 차단하는 요소를 원하는 지점에서 제거합니다. |

이 함수들은 N.docs 인스턴스의 컨텍스트에서 실행해야 합니다:

```javascript
var docsInst = N("#docsContainer").docs();
// ...
N.docs.createLoadIndicator.call(docsInst);
// ...
N.docs.updateLoadIndicator.call(docsInst, 2, 2);
// ...
N.docs.updateLoadIndicator.call(docsInst, 1, 2);
// ...
N.docs.updateLoadIndicator.call(docsInst, 0, 2);
// ...
N.docs.removeLoadIndicator.call(docsInst);
```

이 함수들을 오버라이드하여 로딩바와 화면 차단 요소를 다른 스타일로 표시할 수 있습니다.

## 7. 사용 예제

### 7.1 기본 사용 예제

```html
<section class="docsContainer"></section>

<script type="text/javascript">
    var docs = N(".docsContainer").docs();
    docs.add("ex-0001", "Example page", { url: "ex.html" });
</script>
```

### 7.2 파라미터 전달 예제

```html
<section class="docsContainer"></section>

<script type="text/javascript">
    var docs = N(".docsContainer").docs();
    docs.request.attr("a", 1)
        .request.attr("b", 2)
        .add("ex", "예제", { url: "ex.html" });

    // ex.html의 Controller object의 init 함수에서 request.attr("a")와 request.attr("b")로 파라미터 접근 가능
</script>
```

## 8. 주의사항 및 권장 사항

1. SPA(Single Page Application)로 개발할 때 closeAllRedirectURL 옵션에 홈(메인 인덱스)으로 이동하는 URL을 입력하여 탭 전체가 닫힐 때 페이지 리디렉션이 일어나도록 설정하는 것이 좋습니다. 이렇게 하면 브라우저의 가비지 리소스들이 정리됩니다.

2. N.docs 관련 요소들이 다른 요소에 의해 가려질 때는 alwaysOnTopCalcTarget 옵션에 가리고 있는 요소의 셀렉터를 추가해 주세요.

3. maxStateful과 maxTabs 옵션을 적절히 설정하여 브라우저 성능을 관리하는 것이 좋습니다.

4. 이벤트 핸들러에서 this는 N.docs 인스턴스를 가리킵니다. 이를 통해 doc(), cont() 등의 메서드에 접근할 수 있습니다.

## 9. 관련 컴포넌트

Documents 컴포넌트는 다음 컴포넌트들과 함께 사용하면 더욱 강력한 웹 애플리케이션을 구축할 수 있습니다:

- [Controller](./DEVELOPER-GUIDE-ARCHITECTURE.md): 페이지 컨트롤러
- [Communicator](./DEVELOPER-GUIDE-ARCHITECTURE.md): Ajax 통신 모듈
- [Tab](./DEVELOPER-GUIDE-UI-Tab.md): 탭 컴포넌트 
- [Notify](./DEVELOPER-GUIDE-UI.Shell-Notify.md): 알림 컴포넌트