---
type: Example
title: Edit form data
description: Block page that loads a record into an N.form, detects edits through rowStatus, and sends the updated row with an N.comm PATCH request after confirmation.
tags: [ui, example, form, update]
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
  - id: request
    resource: ../../src/natural.architecture.js
    title: NA.comm.request defaults and body serialization
    symbol: NA.comm.request
    git_blob: 6a2a3ec3eacc37ed37e23e2cf51491fffc1565b2
    symbol_sha1: b2f7caecba91
  - id: form
    resource: ../../src/natural.ui.js
    title: NU.form implementation
    symbol: NU.form
    git_blob: 50229404558dabe92cdea2d02cd1c45a2481cf49
    symbol_sha1: 5aea28d52d8a
  - id: select
    resource: ../../src/natural.ui.js
    title: NU.select implementation
    symbol: NU.select
    git_blob: 50229404558dabe92cdea2d02cd1c45a2481cf49
    symbol_sha1: 8518b356a7d1
  - id: button
    resource: ../../src/natural.ui.js
    title: NU.button implementation
    symbol: NU.button
    git_blob: 50229404558dabe92cdea2d02cd1c45a2481cf49
    symbol_sha1: c3c35975533f
  - id: alert
    resource: ../../src/natural.ui.js
    title: NU.alert implementation
    symbol: NU.alert
    git_blob: 50229404558dabe92cdea2d02cd1c45a2481cf49
    symbol_sha1: 5933b105d560
  - id: notify
    resource: ../../src/natural.ui.shell.js
    title: NUS.notify implementation
    symbol: NUS.notify
    git_blob: 3f3aeab9b8fce8ba7d797c4ae9c6ea4fba94be1b
    symbol_sha1: 00af5ad03855
  - id: message
    resource: ../../src/natural.core.js
    title: NC.message implementation
    symbol: NC.message
    git_blob: d6b29764f7cd8d776f63de84b6c5d38be87f1c76
    symbol_sha1: 6818eb3bc817
  - id: vals
    resource: ../../src/natural.core.js
    title: NC.prototype.vals (single checkbox values)
    symbol: NC.prototype.vals
    git_blob: d6b29764f7cd8d776f63de84b6c5d38be87f1c76
    symbol_sha1: 4178ea152b93
  - id: njs
    resource: ../../src/natural.js.js
    title: N global and factory installation (only window.N is exported)
    git_blob: 769075f826ac33f5416a15452e949d5ea3af4f02
  - id: legacy
    resource: https://github.com/bbalganjjm/natural_js/blob/8877a4a49c2363a3358cb266bd798cb698283412/docs/DEVELOPER-GUIDE-EXAMPLES.md
    title: Legacy examples guide (removed)
generated: { by: claude-code/unknown, at: 2026-09-24T05:36:00Z }
---

An edit panel: [N.form](../ui/form.md) binds a record loaded from the server, marks it `rowStatus: "update"` as soon as the user changes a field, and Save sends the row back. Use it for "change an existing record" screens; [Enter form data](enter-form-data.md) is the creation counterpart with the same markup.

# Scenario

The block page `exap0400.html` receives the record id as a page parameter, loads the code lists, creates the form and binds the record. Save does nothing but show a notice when no field changed; otherwise it validates, asks for confirmation and sends the row with `PATCH`. Revert restores the loaded values. After a successful update the record is loaded again.

# Components used

| Component | Role on this page | Reference |
|---|---|---|
| `N(".exap0400").cont({...})` | Controller; `request.attr("id")` holds the record id | [N.cont](../architecture/controller.md), [N.comm.request](../architecture/request.md) |
| `N(obj).comm(url \| opts).submit(callback)` | Loads codes and the record, sends the update | [N.comm](../architecture/communicator.md) |
| `N(rows).select({...}).bind()` | Gender radios and three selects | [N.select](../ui/select.md) |
| `N(elements).button(opts)` | Styles the Save and Revert links | [N.button](../ui/button.md) |
| `N([]).form({ context, revert: true })` | `bind(0, data)`, `data(true)`, `validate()`, `revert()` | [N.form](../ui/form.md) |
| `N.notify.add(msg)` | "No changed data." notice | [N.notify](../ui-shell/notify.md) |
| `N(window).alert({...}).show()` | Confirmation and result dialogs | [N.alert](../ui/alert.md) |
| `N.message.get(resource, key)` | Texts kept in the controller | [N.message](../core/message.md) |

# View

The markup is the entry form of [Enter form data](enter-form-data.md) with the page class `exap0400`:

```html
<article class="exap0400">
    <div class="searchBox">
        <ul>
            <li class="buttons">
                <a id="btnSave" href="#">Save</a>
                <a id="btnRevert" href="#">Revert</a>
            </li>
        </ul>
    </div>

    <table id="detail" style="width: 100%;">
        <tr>
            <th style="width: 15%;"><label for="name">Name</label></th>
            <td style="width: 35%;"><input id="name" type="text" data-validate='[["required"], ["maxlength", 50]]'></td>
            <th style="width: 15%;"><label for="email">Email</label></th>
            <td style="width: 35%;"><input id="email" type="text" data-validate='[["required"], ["email"]]'></td>
        </tr>
        <tr>
            <th>Gender</th>
            <td><input id="gender" type="radio" data-validate='[["required"]]'></td>
            <th><label for="eyeColor">Eye color</label></th>
            <td><select id="eyeColor" data-validate='[["required"]]'><option value="">Select</option></select></td>
        </tr>
        <tr>
            <th><label for="age">Age</label></th>
            <td><input id="age" type="text" data-validate='[["required"], ["integer"]]'></td>
            <th><label for="balance">Balance</label></th>
            <td><input id="balance" type="text" data-format='[["commas"]]' data-validate='[["integer"]]'></td>
        </tr>
        <tr>
            <th><label for="registered">Registered</label></th>
            <td><input id="registered" type="text" data-format='[["date", 8, "date"]]' data-validate='[["required"], ["date"]]'></td>
            <th><label for="company">Company</label></th>
            <td><select id="company"><option value="">Select</option></select></td>
        </tr>
        <tr>
            <th><label for="favoriteFruit">Favorite fruit</label></th>
            <td><select id="favoriteFruit"><option value="">Select</option></select></td>
            <th><label for="isActive">Active</label></th>
            <td><input id="isActive" type="checkbox"></td>
        </tr>
    </table>
</article>
```

# Controller

Put this script in a `<script type="text/javascript">` element right after `</article>` in the same file.

```js
(function () {
    const cont = N(".exap0400").cont({
        init: function (view, request) {
            cont.id = request.attr("id");
            cont.setCodes(["gender", "eyeColor", "company", "favoriteFruit"], function () {
                cont.setComponents();
                cont.setEvents();
                cont.load();
            });
        },
        setCodes: function (groups, callback) {
            N({ codes: groups }).comm("code/getList.json").submit(function (data, request) {
                groups.forEach(function (group) {
                    N(data).datafilter(function (row) {
                        return row.group === group;
                    }).select({
                        context: N("#detail #" + group, cont.view),
                        key: "name",
                        val: "value"
                    }).bind();
                });
                callback();
            });
        },
        setComponents: function () {
            N(".buttons a", cont.view).button({ size: "medium", color: "primary", type: "filled" });

            cont.form = N([]).form({
                context: N("#detail", cont.view),
                revert: true
            });
        },
        load: function () {
            N({ id: cont.id }).comm("user/getDetail.json").submit(function (data, request) {
                cont.form.bind(0, data);   // data: [ { ... } ]
            });
        },
        setEvents: function () {
            N("#btnSave", cont.view).on("click", function (e) {
                e.preventDefault();
                cont.save();
            });
            N("#btnRevert", cont.view).on("click", function (e) {
                e.preventDefault();
                cont.form.revert();
            });
        },
        save: function () {
            const row = cont.form.data(true)[0];
            if (row === undefined || row.rowStatus === undefined) {
                N.notify.add(N.message.get(cont.messages, "EXAP0400-0004"));
                return;
            }
            if (!cont.form.validate()) {
                return;
            }
            N(window).alert({
                msg: N.message.get(cont.messages, "EXAP0400-0003"),
                confirm: true,
                onOk: function () {
                    N(cont.form.data(true)).comm({
                        url: "user/update.json",
                        type: "PATCH"
                    }).submit(function (data, request) {
                        const key = data > 0 ? "EXAP0400-0001" : "EXAP0400-0002";
                        N(window).alert(N.message.get(cont.messages, key)).show();
                        if (data > 0) {
                            cont.load();
                        }
                    });
                }
            }).show();
        },
        messages: {
            ko_KR: {
                "EXAP0400-0001": "Editing is complete.",
                "EXAP0400-0002": "Editing is not complete. Please contact the administrator.",
                "EXAP0400-0003": "Do you want to save it?",
                "EXAP0400-0004": "No changed data."
            },
            en_US: {
                "EXAP0400-0001": "Editing is complete.",
                "EXAP0400-0002": "Editing is not complete. Please contact the administrator.",
                "EXAP0400-0003": "Do you want to save it?",
                "EXAP0400-0004": "No changed data."
            }
        }
    });
})();
```

The `ko_KR` texts are placeholders; keep an entry for every locale the application uses, because `N.message.get` throws when the current locale has none.[^message]

# Server contract

| Endpoint | Request | Response |
|---|---|---|
| `code/getList.json` | `POST`, JSON body `{"codes":["gender","eyeColor","company","favoriteFruit"]}` | JSON array of `{ "group", "name", "value" }` code rows |
| `user/getDetail.json` | `POST`, JSON body `{"id":"101"}` | JSON **array** holding the row: `[{ "id": "101", "name": "Kim Min-ji", "email": "minji@example.com", "gender": "female", "eyeColor": "blue", "age": "32", "balance": "3250000", "registered": "20140325", "company": "acme", "favoriteFruit": "apple", "isActive": "Y" }]` |
| `user/update.json` | `PATCH`, JSON body: the whole row including `"id"` and `"rowStatus": "update"` | The number of updated rows, for example `1` |

Send every value that lands in a text input as a string and `isActive` as `"Y"` / `"N"` (`core.sgChkdVal` / `core.sgUnChkdVal`); see Pitfalls for why.[^vals]

# How it works

- **Loading.** `bind(0, data)` replaces the form's data with the response array, renders row 0 and, with `revert: true`, takes a copy of that row for `revert()`. Keys without an element (`id`) stay in the row and are sent back with it.[^form]
- **Change detection.** The first edit of a field (focusout for text inputs when their rules pass, change for selects, click for radios and the checkbox) writes the value, sets `rowStatus: "update"`, adds `data_changed__` to the element and `row_data_changed__` to the form context.[^form] Save reads `cont.form.data(true)[0].rowStatus`: `undefined` means nothing changed.
- **No-change notice.** `N.notify.add(msg)` shows a self-closing global message; it returns `undefined`, so it is not chained.[^notify]
- **Validation and confirmation.** `validate()` checks every bound input and returns a boolean; the OK button of the confirm dialog runs `onOk`.[^alert]
- **Request.** `N(cont.form.data(true)).comm({ url, type: "PATCH" })` sends the **whole** row as JSON, not only the changed fields.[^request]
- **Revert.** `revert()` replaces the row with the copy taken by `bind(0, data)`; the copy has no `rowStatus`, so the row counts as unchanged again.[^form]
- **Reload.** After a successful update, `cont.load()` binds the fresh row: the change classes are removed, `rowStatus` is gone and the revert copy is renewed.

# Variations

Send only some columns (the key and the editable fields):

```js
N(cont.form.data(true, "id", "name", "email", "age")).comm({ url: "user/update.json", type: "PATCH" }).submit(function (data) {
    /* ... */
});
```

Send only the fields the user changed, using the `data_changed__` class the form puts on edited elements (radios and checkboxes carry `name`, generated radios have no `id`):

```js
const keys = cont.form.context(".data_changed__").map(function () {
    return this.name || this.id;
}).get();
N(cont.form.data(true, ...["id"].concat(keys))).comm({ url: "user/update.json", type: "PATCH" }).submit(function (data) { /* ... */ });
```

- **Open from a list**: the list page loads this page with `N("#detailBox", view).comm("exap0400.html").request.attr("id", id).submit();`. See [Retrieve a data list](retrieve-data-list.md).
- **Delete button**: `cont.form.remove()` sets `rowStatus: "delete"` on a loaded row; send it the same way.
- **Pages outside N.docs**: set `N.context.attr("ui").alert.container = "body"`; see [N.alert](../ui/alert.md).

# Pitfalls

`NA` is not a global at runtime (only `window.N` is exported) and `NA.Objects.Request.HttpMethod` is a TypeScript `const enum`; the legacy expression throws a `ReferenceError` in JavaScript.[^njs] Use the string.

```js
// Wrong (legacy): N(cont.form.data(true)).comm({ type: NA.Objects.Request.HttpMethod.PATCH, url: `html/naturaljs/exap/data/${cont._key}.json` })
N(cont.form.data(true)).comm({ type: "PATCH", url: "user/update.json" });
```

`data(true)` returns the bound row as it is: every key, plus `rowStatus`. The legacy guide said this example sends "only changed data"; it sends the whole record. Project columns explicitly (see Variations).[^form]

```js
// Wrong (legacy): N(cont.form.data(true)).comm(...)   // expecting only the changed fields in the body
N(cont.form.data(true, "id", "name", "email")).comm({ type: "PATCH", url: "user/update.json" });
```

Until the record has been bound, `cont.form.data(true)` is `[undefined]`; the controller above checks `row === undefined` before reading `rowStatus`.

Leaving a text input compares the row value with the input's string value using `!==`, so a number bound to a text input (`"age": 32`) is converted to `"32"` and the row gets `rowStatus: "update"` without any edit, which defeats the no-change check (see [N.form](../ui/form.md) Known issues).[^form] A boolean bound to a single checkbox throws a `TypeError`, because a single checkbox accepts only `sgChkdVal` / `sgUnChkdVal`.[^vals] Have the server send strings, or convert while binding:

```js
cont.form = N([]).form({
    context: N("#detail", cont.view),
    revert: true,
    onBeforeBindValue: function (ele, value, action) {
        if (typeof value === "number") {
            return String(value);
        }
        if (typeof value === "boolean") {
            return value ? "Y" : "N";
        }
    }
});
```

jQuery runs a block page's inline script as a global script, so keep `const cont` inside a function; a top-level declaration throws a `SyntaxError` when the page is loaded again.

```js
// Wrong (legacy): const cont = N(".exap0400").cont({ init: (view, request) => { /* ... */ } });
(function () {
    const cont = N(".exap0400").cont({ init: function (view, request) { /* ... */ } });
})();
```

# Related

- [N.form](../ui/form.md) - `bind(row, data)`, `rowStatus`, `revert()`, `data(true, ...cols)` and Known issues.
- [N.notify](../ui-shell/notify.md) - `N.notify.add` and its options.
- [N.comm](../architecture/communicator.md) - request options and error handlers.
- [Enter form data](enter-form-data.md) - the creation screen with the same markup.
- [Retrieve form data](retrieve-form-data.md) - the read-only version of the panel.

[^message]: NC.message implementation
[^vals]: NC.prototype.vals (single checkbox values)
[^form]: NU.form implementation
[^notify]: NUS.notify implementation
[^alert]: NU.alert implementation
[^request]: NA.comm.request defaults and body serialization
[^njs]: N global and factory installation (only window.N is exported)
