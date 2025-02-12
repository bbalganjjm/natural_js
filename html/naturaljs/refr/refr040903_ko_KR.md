## 생성자

### N.grid

**return** : `N.grid`

`N.grid` 인스턴스를 생성합니다.

```javascript
var grid = new N.grid(data, opts[context]);
```

#### arguments[0] : data
- **type** : `json object array`
- `data` 옵션을 설정합니다. 기본 옵션의 `data` 옵션과 같습니다.

#### arguments[1] : opts|context
- **type** : `object | jQuery Selector(string | jQuery object)`
- 컴포넌트의 기본 옵션 객체를 지정합니다.

> ⚠️ jQuery selector 문자열이나 jQuery object를 입력하면 기본 옵션의 context 옵션으로 설정됩니다.

---

### N(obj).grid

**return** : `N.grid`

`N.grid`의 객체 인스턴스를 jQuery 플러그인 방식으로 생성합니다.

```javascript
var grid = N(data).grid(opts[context]);
```

객체 인스턴스를 생성하는 방식은 다르지만 `new N.grid`로 생성한 인스턴스와 `N().grid`로 생성한 인스턴스는 동일합니다. `N()` 함수의 첫 번째 인수가 `new N.grid` 생성자의 첫 번째 인수로 설정됩니다.

#### arguments[0] : opts|context
- **type** : `object | jQuery Selector(string | jQuery object)`
- `N.grid` 함수의 두 번째 인수(`opts`)와 같습니다.

