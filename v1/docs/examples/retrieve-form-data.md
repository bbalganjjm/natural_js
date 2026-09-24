---
type: Example
title: Retrieve form data
description: Block page that loads one record through N.comm and shows it read-only in an N.form bound to td and img elements, with data-format rules.
tags: [ui, example, form, detail]
sources:
  - id: cont
    resource: ../../src/natural.architecture.js
    title: NA.cont controller registration
    symbol: NA.cont
    git_blob: 6a2a3ec3eacc37ed37e23e2cf51491fffc1565b2
    symbol_sha1: 8c6c783164aa
  - id: comm
    resource: ../../src/natural.architecture.js
    title: NA.comm communicator
    symbol: NA.comm
    git_blob: 6a2a3ec3eacc37ed37e23e2cf51491fffc1565b2
    symbol_sha1: 40c48fda4ea0
  - id: attr
    resource: ../../src/natural.architecture.js
    title: NA.comm.request.prototype.attr (page parameters)
    symbol: NA.comm.request.prototype.attr
    git_blob: 6a2a3ec3eacc37ed37e23e2cf51491fffc1565b2
    symbol_sha1: 8101f576ac81
  - id: form
    resource: ../../src/natural.ui.js
    title: NU.form implementation
    symbol: NU.form
    git_blob: 50229404558dabe92cdea2d02cd1c45a2481cf49
    symbol_sha1: 5aea28d52d8a
  - id: formatter
    resource: ../../src/natural.data.js
    title: ND.formatter implementation
    symbol: ND.formatter
    git_blob: fe1db485648b4837702cf1c321934b6a78c1344b
    symbol_sha1: e20695aa680a
  - id: mask-generic
    resource: ../../src/natural.core.js
    title: NC.mask.prototype.setGeneric (used by the generic format rule)
    symbol: NC.mask.prototype.setGeneric
    git_blob: d6b29764f7cd8d776f63de84b6c5d38be87f1c76
    symbol_sha1: e822e4867f95
  - id: legacy
    resource: https://github.com/bbalganjjm/natural_js/blob/8877a4a49c2363a3358cb266bd798cb698283412/docs/DEVELOPER-GUIDE-EXAMPLES.md
    title: Legacy examples guide (removed)
generated: { by: claude-code/unknown, at: 2026-09-24T05:36:00Z }
---

A detail panel that shows one record without editing: [N.form](../ui/form.md) binds the row to `td` and `img` elements, which display values but never write them back. Use it for view-only detail screens; for editing see [Edit form data](edit-form-data.md).

# Scenario

The block page `exap0200.html` receives the record id as a page parameter (`request.attr("id")`), posts it to the server, and binds the returned row to a table. Phone, balance and date values are formatted on display; the e-mail address is partly masked.

# Components used

| Component | Role on this page | Reference |
|---|---|---|
| `N(".exap0200").cont({...})` | Controller; `init(view, request)` receives the page parameters | [N.cont](../architecture/controller.md) |
| `request.attr("id")` | Reads the id set by the page that loaded this one | [N.comm.request](../architecture/request.md) |
| `N(obj).comm(url).submit(callback)` | Loads the record | [N.comm](../architecture/communicator.md) |
| `N([]).form(context)` + `bind(0, data)` | Shows the row | [N.form](../ui/form.md) |
| `data-format` | Display formats (`phone`, `commas`, `date`, `mask`) | [N.formatter](../data/formatter.md) |

# View

```html
<article class="exap0200">
    <table id="detail" style="width: 100%;">
        <tr>
            <th rowspan="6" style="width: 15%;">Picture</th>
            <td rowspan="6" style="width: 35%; text-align: center; vertical-align: middle;">
                <img id="picture" src="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs%3D" style="height: 100px;">
            </td>
            <th style="width: 15%;">Name</th>
            <td id="name" style="width: 35%;"></td>
        </tr>
        <tr><th>Email</th><td id="email" data-format='[["mask", "email"]]'></td></tr>
        <tr><th>Phone</th><td id="phone" data-format='[["phone"]]'></td></tr>
        <tr><th>Balance</th><td id="balance" data-format='[["commas"]]'></td></tr>
        <tr><th>Registered</th><td id="registered" data-format='[["date", 8]]'></td></tr>
        <tr><th>Company</th><td id="company"></td></tr>
    </table>
</article>
```

# Controller

Put this script in a `<script type="text/javascript">` element right after `</article>` in the same file.

```js
(function () {
    const cont = N(".exap0200").cont({
        init: function (view, request) {
            cont.form = N([]).form(N("#detail", view));
            cont.load(request.attr("id"));
        },
        load: function (id) {
            N({ id: id }).comm("user/getDetail.json").submit(function (data, request) {
                cont.form.bind(0, data);
            });
        }
    });
})();
```

The page that opens this one passes the id, for example `N("#detailBox", view).comm("exap0200.html").request.attr("id", "101").submit();` (`request.attr(name, value)` returns the communicator, so `.submit()` can follow).[^attr]

# Server contract

| Endpoint | Request | Response |
|---|---|---|
| `user/getDetail.json` | `POST`, JSON body `{"id":"101"}` | JSON **array** holding the row: `[{ "id": "101", "picture": "img/101.png", "name": "Kim Min-ji", "email": "minji@example.com", "phone": "01012345678", "balance": "3250000", "registered": "20140325", "company": "ACME" }]` |

With these values the panel shows `mi***@example.com` (the last three characters of the local part are masked), `010-1234-5678`, `3,250,000` and `2014-03-25` (the `date` rule with `8` uses `N.context.attr("data").formatter.date.Ymd()`, `Y-m-d` in the shipped configuration). See [N.formatter](../data/formatter.md).

# How it works

- **Construction.** `N([]).form(element)`: an argument that is not a plain object is the context, and the form binds row `0`. The constructor renders nothing.[^form]
- **Binding.** `bind(0, data)` replaces the form's data with the response array, then walks the **keys of row 0**: the `img` gets its `src`, other non-input elements get `.text(value)`, and elements with `data-format` get the formatted value from [N.formatter](../data/formatter.md).[^form] [^formatter]
- **Read-only by construction.** `td`, `span` and `img` elements have no change events, so nothing is written back and `rowStatus` never changes.
- **Extra keys.** Keys without a matching element (`id`) stay in the row: read them with `cont.form.val("id")` or `cont.form.data(true)[0].id`.

# Variations

Load another record into the same panel. `bind()` only touches elements whose `id` is a key of the new row, so reset the markup first:

```js
cont.form.unbind().bind(0, data);   // unbind() restores the initial markup values
```

- **Detail from a grid without a request**: create the form on the grid's own data, `grid.data(false).form("#detail")`, and call `detail.bind(row, data)` from the grid's `onSelect`; see the master-detail example in [N.form](../ui/form.md).
- **HTML values**: `N([]).form({ context: N("#detail", view), html: true })` renders non-input values with `.html()`. Escape user-supplied content yourself.
- **Editable version**: replace the `td` cells with `input`, `select` and `textarea` elements; see [Edit form data](edit-form-data.md).

# Pitfalls

`bind(row, data)` reads `data[row]`. When the server returns a single object instead of an array, nothing is bound and the form's data becomes that object. Wrap it:

```js
cont.form.bind(0, Array.isArray(data) ? data : [data]);
```

The legacy password cell used a `generic` pattern as a mask, inside a broken attribute (backslashes do not escape quotes in HTML). Even with correct quoting, `generic` is not a mask: a value that does not fit the pattern is returned unchanged, so `["generic", "@@＊＊＊＊＊＊"]` shows `ab＊＊＊＊＊＊` for `abcdef12` but `a1b2c3` in clear text.[^mask-generic] Never send secrets to the client; mask them on the server, or use a `mask` rule such as `[["mask", "email"]]` for display-only masking.

```html
// Wrong (legacy): <td id="key" data-format="[[\"generic\", \"@@＊＊＊＊＊＊\"]]"></td>
<td id="maskedKey"></td>
```

jQuery runs a block page's inline script as a global script, so keep `const cont` inside a function; a top-level declaration throws a `SyntaxError` when the page is loaded again.

```js
// Wrong (legacy): const cont = N(".exap0200").cont({ init: (view, request) => { /* ... */ } });
(function () {
    const cont = N(".exap0200").cont({ init: function (view, request) { /* ... */ } });
})();
```

# Related

- [N.form](../ui/form.md) - element binding rules, `bind(row, data)` and `unbind()`.
- [N.formatter](../data/formatter.md) - the `date`, `commas`, `phone`, `mask` and `generic` rules.
- [N.comm.request](../architecture/request.md) - passing page parameters with `request.attr`.
- [Retrieve a data list](retrieve-data-list.md) - the list screen that opens a detail.
- [Edit form data](edit-form-data.md) - the editable version of this panel.

[^attr]: NA.comm.request.prototype.attr (page parameters)
[^form]: NU.form implementation
[^formatter]: ND.formatter implementation
[^mask-generic]: NC.mask.prototype.setGeneric (used by the generic format rule)
