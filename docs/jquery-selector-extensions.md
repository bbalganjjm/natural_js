# jQuery Selector Extensions

Natural-CORE extends the regexp filter selector that can evaluate element attribute values as regular expressions to search for patterns that are not supported in CSS1~3. This supports more complex element search.

## Syntax

```
[selector]:regexp(attributeName[:propertyName], expr)
```

Return: jQuery Object

### Parameters

- **selector**
  - Type: string
  - Default selector string.
  - If omitted, it is recommended to specify the default selector if possible, because all elements are evaluated.

- **attributeName**
  - Type: string
  - The attribute name of the HTML DOM element whose value you want to evaluate.
  - All property values except those listed below are evaluated as the return value of the `.attr(attributeName)` function.
    - **data**: Extract the element's data attribute. You must specify a child property with propertyName. Equivalent to the return value of the `.data(properyName)` function.
    - **css**: Extract the element's css attribute. You must specify a child property with propertyName. Equivalent to the return value of the `.css(propertyName)` function.
    - **class**: Extract the element's class attribute. For elements with more than one class attribute value, evaluation is performed for each class.

- **propertyName**
  - Type: string
  - If attributeName is data or css, it means sub-attribute.
  - In other cases, specifying a value is ignored.

- **expr**
  - Type: string
  - Regular expression string. It should not be enclosed in double or single quotation marks.

  ```javascript
  /* Extract all a tags that contain "Mr.Lee" or "Mr.Kim" in the href attribute. */
  N("a:regexp(href, 'Mr\\.(Lee|Kim)')"); // (X)
  N('a:regexp(href, "Mr\\.(Lee|Kim)")'); // (X)
  N("a:regexp(href, Mr\\.(Lee|Kim))"); // (O)
  ```

## :regexp Filter Attribute and Examples

### 1. Filtering elements with multiple class attribute values

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

### 2. Filter by property name of data attribute

```html
<div data-sample="test-1"></div>
<div data-sample="test-2"></div>

N("div:regexp(data:sample, test-[1-2])")
```

### 3. Filter by property name of css attribute

```html
<div style="width:128px;"></div>

N("div:regexp(css:width, ^128px)")
```

### 4. Filter by id attribute value

```html
<div id="page-1"><div id="page-2"><div id="page-3">

N("div:regexp(id, page-[0-9])")
```
