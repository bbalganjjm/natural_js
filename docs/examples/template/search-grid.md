---
type: Example
title: "Template: search form + grid"
description: Natural-TEMPLATE screen with a search form bound to common codes, a fixed-header grid with header filters and a search button, declared with p., c. and e. properties.
tags: [template, example, grid, search]
sources:
  - id: codes
    resource: ../../../src/natural.template.js
    title: NT.aop.codes (p.select code binding)
    symbol: NT.aop.codes
    git_blob: 12443d41516c0d55118adf1c98aff68405cce2d6
    symbol_sha1: a2cf3eac0450
  - id: components
    resource: ../../../src/natural.template.js
    title: NT.aop.components (component creation, search-box usage, action)
    symbol: NT.aop.components
    git_blob: 12443d41516c0d55118adf1c98aff68405cce2d6
    symbol_sha1: e60d19c0f4b2
  - id: events
    resource: ../../../src/natural.template.js
    title: NT.aop.events (e.* binding)
    symbol: NT.aop.events
    git_blob: 12443d41516c0d55118adf1c98aff68405cce2d6
    symbol_sha1: 02c30b39f119
  - id: grid
    resource: ../../../src/natural.ui.js
    title: NU.grid implementation
    symbol: NU.grid
    git_blob: 50229404558dabe92cdea2d02cd1c45a2481cf49
    symbol_sha1: 3ba583d8d43c
  - id: form
    resource: ../../../src/natural.ui.js
    title: NU.form implementation
    symbol: NU.form
    git_blob: 50229404558dabe92cdea2d02cd1c45a2481cf49
    symbol_sha1: 5aea28d52d8a
  - id: select
    resource: ../../../src/natural.ui.js
    title: NU.select implementation
    symbol: NU.select
    git_blob: 50229404558dabe92cdea2d02cd1c45a2481cf49
    symbol_sha1: 8518b356a7d1
  - id: comm
    resource: ../../../src/natural.architecture.js
    title: NA.comm (submit, promise mode)
    symbol: NA.comm
    git_blob: 6a2a3ec3eacc37ed37e23e2cf51491fffc1565b2
    symbol_sha1: 40c48fda4ea0
  - id: cont
    resource: ../../../src/natural.architecture.js
    title: NA.cont (Controller registration, trInit)
    symbol: NA.cont
    git_blob: 6a2a3ec3eacc37ed37e23e2cf51491fffc1565b2
    symbol_sha1: 8c6c783164aa
  - id: legacy
    resource: https://github.com/bbalganjjm/natural_js/blob/8877a4a49c2363a3358cb266bd798cb698283412/docs/DEVELOPER-GUIDE-TEMPLATE-EXAMPLES.md
    title: Legacy Natural-TEMPLATE example guide (removed)
generated: { by: claude-code/unknown, at: 2026-09-24T05:36:00Z }
---

The simplest Natural-TEMPLATE screen: a search form whose selects are filled from common codes, a search button, and a read-only grid that shows the result. Copy it as the starting point for any retrieve-only list screen. It requires an activated Natural-TEMPLATE (both advisors); see [Natural-TEMPLATE conventions](../../template/conventions.md).

# Scenario

- The user enters a name and picks a gender and an eye color; the two selects are filled from the common-code service before the page initializes.
- Search (button click or Enter in any search input) validates the form, sends the search conditions and binds the result rows to the grid.
- Changing the eye color searches immediately.
- The grid has a fixed header, header value filters and a row counter above it.

# Components used

| Declaration | Becomes | Purpose |
|---|---|---|
| `p.select.gender`, `p.select.eyeColor` | array of [N.select](../../ui/select.md) | Options from the common codes `gender` and `eyeColor`. |
| `p.form.search` | [N.form](../../ui/form.md) with `usage: "search-box"` | Holds the search conditions as one row; Enter clicks `.btn-search`. |
| `p.grid.master` | [N.grid](../../ui/grid.md) | Fixed header (`height: 350`), header filters, empty bind before `init`. |
| `c.getSampleList` | function returning an [N.comm](../../architecture/communicator.md) | Sends the current search row. |
| `e.btnSearch.click`, `e.eyeColor.change` | bound jQuery elements | Search button (gets [N.button](../../ui/button.md)) and eye color change. |

# View

```html
<article class="type0101">
    <div id="search" class="search-panel">
        <ul>
            <li><label><span>Name</span><input id="name" type="text" data-validate='[["maxlength", 30]]'></label></li>
            <li><label><span>Gender</span><select id="gender"><option value="">Select</option></select></label></li>
            <li><label><span>Eye color</span><select id="eyeColor"><option value="">Select</option></select></label></li>
        </ul>
    </div>

    <div class="button-panel">
        <span>Rows: <strong id="totalCnt">0</strong></span>
        <button id="btnSearch" class="btn-search" data-opts='{ "color": "primary" }'>Search</button>
    </div>

    <table id="master">
        <thead>
            <tr><th>No.</th><th>Name</th><th>Gender</th><th>Age</th><th>Eye color</th><th>Company</th><th>Email</th></tr>
        </thead>
        <tbody>
            <tr>
                <td id="index" style="text-align: center;"></td>
                <td id="name"></td>
                <td id="gender"></td>
                <td id="age" style="text-align: right;"></td>
                <td id="eyeColor"></td>
                <td id="company"></td>
                <td id="email"></td>
            </tr>
        </tbody>
    </table>
</article>
```

The page class `type0101` becomes the page id (`data-pageid="type0101"`), which Natural-TEMPLATE uses as the event namespace (`click.type0101`). Element ids repeat between the search form and the grid row template on purpose: each component only binds ids inside its own context.

# Controller

```html
<script type="text/javascript">
(() => {
    const cont = N(".type0101").cont({
        "p.select.gender": [ "gender" ],                 // [code]: key/val from N.context.attr("ui").select
        "p.select.eyeColor": [ "eyeColor" ],
        "p.form.search": { usage: "search-box" },
        "p.grid.master": {
            height: 350,
            filter: true,                                // header value filters (default false)
            action: "bind",                              // grid.bind() before init: shows the empty message
            onBind: function (context, data, isFirstPage, isLastPage) {
                N("#totalCnt", cont.view).text(N.formatter.commas(String(data.length)));
            }
        },

        "c.getSampleList": () => cont["p.form.search"].data(false).comm("sample/getSampleBigList.json"),

        "e.btnSearch.click": function (e) {
            e.preventDefault();
            if (cont["p.form.search"].validate()) {
                cont["c.getSampleList"]().submit(function (data) {
                    cont["p.grid.master"].bind(data);
                });
            }
        },
        "e.eyeColor.change": {
            target: "#search #eyeColor",                 // the search select, not the grid column
            handler: function (e) {
                cont["e.btnSearch.click"].trigger("click");
            }
        },

        init: function (view, request) {
            // Selects, form, grid (already bound empty) and events are ready here.
        }
    });
})();
</script>
```

# Server contract

The page assumes these lines after the shipped `N.context.attr(...)` blocks of `natural.config.js` (see [Configuration](../../setup/configuration.md)); the shipped file sets `codeUrl` and `codeKey` to `null` and defines no `ui.select`:

```js
N.context.attr("template").aop.codes.codeUrl = "code/getCodeList.json";
N.context.attr("template").aop.codes.codeKey = "group";
N.context.attr("ui").select = { key: "codeName", val: "code" };   // label and value properties of a code row
```

The `^init$` and `^onOpen` advisors from [Natural-TEMPLATE conventions](../../template/conventions.md) must be registered in `architecture.cont.advisors` as well.

| Request | Sent by | Body (shipped config: POST JSON) | Response |
|---|---|---|---|
| `codeUrl` | `NT.aop.codes`, once for all `code` selects | `{"codes":["gender","eyeColor"]}` | array of code rows; the rows whose `group` equals the code are bound to each select |
| `sample/getSampleBigList.json` | `c.getSampleList` | the search row, for example `{"name":"Kim","gender":"female","eyeColor":"","rowStatus":"insert"}` | array of rows with `index`, `name`, `gender`, `age`, `eyeColor`, `company`, `email` |

```json
[
    { "group": "gender", "code": "male", "codeName": "Male" },
    { "group": "gender", "code": "female", "codeName": "Female" },
    { "group": "eyeColor", "code": "blue", "codeName": "Blue" }
]
```

The search row carries `rowStatus: "insert"` because the search box creates its row with `add()`; the server can ignore it.

# How it works

1. **Codes.** The `^init$` advisor calls `N.template.aop.codes`. Both `p.select` declarations are `[code]` arrays, so they share one request to `codeUrl`. Every `select`, radio or checkbox with the id `gender` (or `eyeColor`) in the view gets its own `N.select`, and the property becomes an array of instances. `init` waits for this response.[^codes]
2. **Components**, in declaration order. `p.form.search` becomes `N([]).form({ context: N("#search", view), usage: "search-box" })`; the search box adds the class `search_box__`, calls `add()` so the form has a row built from the current input values, and binds Enter in every input to click `.btn-search`.[^components] `p.grid.master` becomes an `N.grid` on `#master`, and its `action` is queued.
3. **Events.** `#btnSearch` gets `N.button` (its `data-opts` apply) and a `click.type0101` handler; the property now holds the button element. `e.eyeColor.change` uses the object form because `#eyeColor` is also a column id of the grid; the `target` selector pins it to the search select.[^events]
4. **Action** `bind()`: the grid renders its empty row, and `onBind` sets the counter to 0.
5. **init** runs last.
6. **Search.** `c.getSampleList` runs at click time, so `data(false).comm(url)` sends the current search row (the communicator sends the first object of the wrapper). The response is bound with `bind(data)`; rows render asynchronously and `onBind` updates the counter. After a header filter, `onBind` fires again with only the visible rows.[^grid][^comm]

# Variations

- **Search button without the class**: set the Enter target explicitly with `"p.form.search": { usage: { "search-box": { defaultButton: "#btnSearch" } } }`. See [p.{component}.{id} declarations](../../template/component-declaration.md).
- **Search on load**: call `cont["e.btnSearch.click"].trigger("click")` in `init`, as the other template examples do.
- **Server-side paging**: add an [N.pagination](../../ui/pagination.md) and query page by page; see [Template: search form + grid + paging](search-grid-paging.md).
- **Editing rows**: put inputs in the row template and add save and delete buttons; see [Template: search form + grid (CRUD)](search-grid-crud.md).
- **Detail of the selected row**: see [Template: search form + grid + detail form (horizontal)](search-grid-detail-horizontal.md).

# Pitfalls

The legacy example listed "data filtering with the grid's `filter` option" as a feature but set `filter: false`, which is the default and turns the header filters off.[^grid]

```js
// Wrong (legacy): "p.grid.master": { action: "bind", filter: false, height: 350 }   // presented as a filtering demo
"p.grid.master": { action: "bind", filter: true, height: 350 }
```

Declare a `p.select` only for ids that exist as a `select`, radio or checkbox in the view. The legacy controller declared `favoriteFruit` without such an element: the code group is still requested, the property becomes an empty array, and when no element at all has that id the component step throws `MSG-0005` and `init` never runs.[^codes][^components]

```html
// Wrong (legacy): "p.select.favoriteFruit": [ "favoriteFruit" ] with no #favoriteFruit select in the view
<li><label><span>Favorite fruit</span><select id="favoriteFruit"><option value="">Select</option></select></label></li>
```

Enter in a search box clicks `.btn-search`, not the button you bound. The legacy markup had no such class, so Enter did nothing.[^components]

```html
// Wrong (legacy): <button id="btnSearch" data-opts='{ "color": "primary" }'>Search</button>
<button id="btnSearch" class="btn-search" data-opts='{ "color": "primary" }'>Search</button>
```

`await comm.submit()` resolves with the raw response: data returned by `success` filters is ignored, and without an `error()` handler a failed request also throws an uncaught `NC.error`. Use the callback form, which receives the filtered data. See [N.comm](../../architecture/communicator.md).[^comm]

```js
// Wrong (legacy): cont["p.grid.master"].bind(await cont["c.getSampleList"]().submit());
cont["c.getSampleList"]().submit(function (data) { cont["p.grid.master"].bind(data); });
```

The legacy `init` hid the search form when `cont.opener` was set. `N.popup` and `N.tab` currently drop their `opener` option, including the `opener: cont` that Natural-TEMPLATE adds to `p.popup` and `p.tab` declarations, so that branch never runs (see Known issues on [N.cont](../../architecture/controller.md)). Pass a flag through the popup's `open(onOpenData)` instead.[^cont]

```js
// Wrong (legacy): init: (view, request) => { if (cont.opener) { cont["p.form.search"].context().hide(); } }
onOpen: function (onOpenData) { if (onOpenData && onOpenData.embedded) { cont["p.form.search"].context().hide(); } }
```

# Related

- [Natural-TEMPLATE conventions](../../template/conventions.md) - activation, lifecycle and the `p.` / `c.` / `e.` naming rules used here.
- [p.{component}.{id} declarations](../../template/component-declaration.md) - `p.select` forms, `usage: "search-box"` and `action`.
- [e.{id}.{event} event binding](../../template/event-binding.md) - function and `{ target, handler }` forms.
- [N.grid](../../ui/grid.md) - `height`, `filter`, `bind()` and `onBind`.
- [N.form](../../ui/form.md) - `add()`, `data(false)` and `validate()` of the search form.
- [Retrieve a data list](../retrieve-data-list.md) - the same kind of screen written without Natural-TEMPLATE.

[^codes]: NT.aop.codes (p.select code binding)
[^components]: NT.aop.components (component creation, search-box usage, action)
[^events]: NT.aop.events (e.* binding)
[^grid]: NU.grid implementation
[^comm]: NA.comm (submit, promise mode)
[^cont]: NA.cont (Controller registration, trInit)
