# jQuery Selector 확장

Natural-CORE 에는 CSS1~3에서 지원되지 않는 형태의 패턴 검색을 위해 요소의 속성 값을 정규 표현식으로 평가할 수 있는 regexp 필터 셀렉터가 확장되어 있습니다. 이를 통해 보다 복잡한 형태의 요소 검색을 지원합니다.

## 구문

```
[selector]:regexp(attributeName[:propertyName], expr)
```

반환: jQuery Object

### 매개변수

- **selector**
  - Type: string
  - 기본 selector 문자열입니다.
  - 생략할 경우 모든 요소에 대해 평가가 이뤄지기 때문에 가능하면 기본 selector를 지정하는 것이 좋습니다.

- **attributeName**
  - Type: string
  - 평가하려는 값을 갖고 있는 HTML DOM 요소의 속성 명입니다.
  - 아래에 나열된 속성을 제외한 모든 속성 값은 `.attr(attributeName)` 함수의 반환 값으로 평가됩니다.
    - **data**: 요소의 data속성을 추출합니다. 반드시 propertyName으로 하위 속성을 지정해야 합니다. `.data(properyName)` 함수의 반환 값과 같습니다.
    - **css**: 요소의 css 속성을 추출합니다. 반드시 propertyName으로 하위 속성을 지정해야 합니다. `.css(propertyName)` 함수의 반환 값과 같습니다.
    - **class**: 요소의 class 속성을 추출합니다. class 속성 값이 둘 이상인 요소의 경우 각 클래스에 대해 평가가 수행됩니다.

- **propertyName**
  - Type: string
  - attributeName이 data 혹은 css인 경우 하위 속성을 의미합니다.
  - 이외의 경우 값을 지정해도 무시됩니다.

- **expr**
  - Type: string
  - 정규 표현식 문자열입니다. 큰따옴표나 작은따옴표로 감싸지 않아야 합니다.

  ```javascript
  /* href 속성에 "Mr.Lee" 혹은 "Mr.Kim"을 포함하는 모든 a 태그 추출 */
  N("a:regexp(href, 'Mr\\.(Lee|Kim)')"); // (X)
  N('a:regexp(href, "Mr\\.(Lee|Kim)")'); // (X)
  N("a:regexp(href, Mr\\.(Lee|Kim))"); // (O)
  ```

## :regexp 필터 속성 및 예제

### 1. 다중 class 속성 값을 가진 요소 필터링

```html
<div class="someClassA classB"></div>

N("div:regexp(class, ^someClass)")
```

```html
<div class="searchBtn"></div>
<div class="searchBtn"></div>
<div class="searchButton"></div>

N("div:regexp(class, Btn$|Button$)")
```

### 2. data속성의 프로퍼티 명으로 필터링

```html
<div data-sample="test-1"></div>
<div data-sample="test-2"></div>

N("div:regexp(data:sample, test-[1-2])")
```

### 3. css 속성의 프로퍼티 명으로 필터링

```html
<div style="width:128px;"></div>

N("div:regexp(css:width, ^128px)")
```

### 4. id 속성 값으로 필터링

```html
<div id="page-1"><div id="page-2"><div id="page-3">

N("div:regexp(id, page-[0-9])")
```
