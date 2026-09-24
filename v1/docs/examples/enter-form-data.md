---
type: Example
title: Enter form data
description: Block page that creates a new row with N.form add(), validates it, asks for confirmation with N.alert and posts it with N.comm, with a revert button.
tags: [ui, example, form, create]
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

A data entry panel: [N.form](../ui/form.md) creates an empty row with `rowStatus: "insert"`, the user fills it, and Save validates, confirms and posts it. Use it for "new record" screens; the same markup becomes an edit screen in [Edit form data](edit-form-data.md).

# Scenario

The block page `exap0300.html` loads four code lists, renders them into a radio group and three selects, and creates a form with one new row. Save validates every field, asks "Do you want to save it?" and posts the row; the server answers with the number of inserted rows. Revert puts the fields back to the values the row was created with.

# Components used

| Component | Role on this page | Reference |
|---|---|---|
| `N(".exap0300").cont({...})` | Controller | [N.cont](../architecture/controller.md) |
| `N(obj).comm(url).submit(callback)` | Loads code lists, posts the new row | [N.comm](../architecture/communicator.md) |
| `N(rows).select({...}).bind()` | Gender radios and the Eye color, Company and Favorite fruit selects | [N.select](../ui/select.md) |
| `N(elements).button(opts)` | Styles the Save and Revert links | [N.button](../ui/button.md) |
| `N([]).form({ context, revert: true }).add()` | The new row; `validate()`, `data(true)`, `revert()` | [N.form](../ui/form.md) |
| `data-validate`, `data-format` | Field rules and display formats | [N.validator](../data/validator.md), [N.formatter](../data/formatter.md) |
| `N(window).alert({...}).show()` | Confirmation and result dialogs | [N.alert](../ui/alert.md) |
| `N.message.get(resource, key)` | Locale-specific texts kept in the controller | [N.message](../core/message.md) |

# View

```html
<article class="exap0300">
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

Every input declares `type="text"` explicitly: an `input` without a `type` attribute is not treated as a text input by N.form and N.formatter.

# Controller

Put this script in a `<script type="text/javascript">` element right after `</article>` in the same file.

```js
(function () {
    const cont = N(".exap0300").cont({
        init: function (view, request) {
            cont.setCodes(["gender", "eyeColor", "company", "favoriteFruit"], function () {
                cont.setComponents();
                cont.setEvents();
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
            }).add();
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
            if (!cont.form.validate()) {
                return;
            }
            N(window).alert({
                msg: N.message.get(cont.messages, "EXAP0300-0003"),
                confirm: true,
                onOk: function () {
                    // type defaults to "POST"
                    N(cont.form.data(true)).comm("user/insert.json").submit(function (data, request) {
                        const key = data > 0 ? "EXAP0300-0001" : "EXAP0300-0002";
                        N(window).alert(N.message.get(cont.messages, key)).show();
                    });
                }
            }).show();
        },
        messages: {
            ko_KR: {
                "EXAP0300-0001": "Saving is complete.",
                "EXAP0300-0002": "Saving is not complete. Please contact the administrator.",
                "EXAP0300-0003": "Do you want to save it?"
            },
            en_US: {
                "EXAP0300-0001": "Saving is complete.",
                "EXAP0300-0002": "Saving is not complete. Please contact the administrator.",
                "EXAP0300-0003": "Do you want to save it?"
            }
        }
    });
})();
```

The `ko_KR` texts are placeholders; a real application writes them in Korean. Keep an entry for every locale the application switches to: `N.message.get` throws when the current locale (`N.locale()`, `ko_KR` in the shipped configuration) has no entry, and returns the key when only the key is missing.[^message]

# Server contract

| Endpoint | Request | Response |
|---|---|---|
| `code/getList.json` | `POST`, JSON body `{"codes":["gender","eyeColor","company","favoriteFruit"]}` | JSON array of `{ "group", "name", "value" }` code rows |
| `user/insert.json` | `POST`, JSON body: the new row, for example `{"name":"Kim","email":"kim@example.com","gender":"female","eyeColor":"blue","age":"32","balance":"3250000","registered":"20240115","company":"acme","favoriteFruit":"apple","isActive":"Y","rowStatus":"insert"}` | The number of inserted rows, for example `1` |

`balance` and `registered` arrive unformatted (`3250000`, `20240115`): the inputs display the formatted value, but the format is removed on focusin and the form writes the value as typed (or as `Ymd` digits from the datepicker) into the row. `isActive` is `"Y"` or `"N"` (`core.sgChkdVal` / `core.sgUnChkdVal` in the shipped configuration).[^vals]

# How it works

- **Codes first.** `N.select` generates the Gender radios (all with `name="gender"`) and fills the selects before the form is created, because the form looks up its elements on its first bind and caches them.[^select] [^form]
- **New row.** `add()` reads the current values of every input into a new row, `{ name: "", email: "", gender: "", eyeColor: "", age: "", balance: "", registered: "", company: "", favoriteFruit: "", isActive: "N", rowStatus: "insert" }`, inserts it at index 0, binds it and, because of `revert: true`, keeps a copy for `revert()`.[^form]
- **Editing.** Text inputs write into the row on focusout (only when their `data-validate` rules pass), selects on change, radios and the checkbox on click. `rowStatus` stays `"insert"`.[^form]
- **Formats.** `commas` and `date` format the value on bind and focusout and remove the format on focusin. `["date", 8, "date"]` also turns the input into an [N.datepicker](../ui/datepicker.md) that writes the selected date as `Ymd` digits.
- **Validation.** `validate()` removes the formats, runs every rule of every bound input (radios included, because `N.select` marked the template radio with `select_template__`), formats again, and returns `false` when any input failed; the failing inputs show a tooltip.[^form]
- **Confirmation.** `N(window).alert({ msg, confirm: true, onOk })` shows OK and Cancel; OK runs `onOk` and closes the dialog (return `0` from `onOk` to keep it open).[^alert]
- **Request.** `N(cont.form.data(true))` wraps `[row]`, and the communicator sends that row as JSON with the default `type: "POST"`.[^request]
- **Revert.** `revert()` replaces the row with the copy taken by `add()` and binds it again.

# Variations

Start the next entry after a successful save. `add()` copies what the inputs currently show, so restore the initial markup values first:

```js
N(cont.form.data(true)).comm("user/insert.json").submit(function (data) {
    if (data > 0) {
        N.notify.add(N.message.get(cont.messages, "EXAP0300-0001"));
        cont.form.unbind().add();   // fresh row with rowStatus "insert" at index 0
    }
});
```

Keep the confirmation open until the server answers:

```js
N(window).alert({
    msg: N.message.get(cont.messages, "EXAP0300-0003"),
    confirm: true,
    onOk: function () {
        const dialog = this;
        N(cont.form.data(true)).comm("user/insert.json").submit(function (data) {
            dialog.remove();
        });
        return 0;   // only the number 0 keeps the dialog open
    }
}).show();
```

- **Send selected keys only**: `N(cont.form.data(true, "name", "email", "age")).comm("user/insert.json")`.
- **Pages outside N.docs**: the shipped `ui.alert.container` points into the [N.docs](../ui-shell/documents.md) content area; set `N.context.attr("ui").alert.container = "body"` or every `N.alert` throws. See [N.alert](../ui/alert.md).

# Pitfalls

`NA` is not a global at runtime: `src/natural.js.js` exposes only `window.N`, and `NA.Objects.Request.HttpMethod` exists only as a TypeScript `const enum`.[^njs] In JavaScript the legacy expression throws a `ReferenceError`. Write the method as a string, or leave it out, since `"POST"` is the default. See [TypeScript](../setup/typescript.md).

```js
// Wrong (legacy): N(cont.form.data(true)).comm({ type: NA.Objects.Request.HttpMethod.POST, url: "html/naturaljs/exap/data/sample.json" })
N(cont.form.data(true)).comm({ type: "POST", url: "user/insert.json" });
N(cont.form.data(true)).comm("user/insert.json");   // same request
```

Write `data-validate` and `data-format` JSON inside single-quoted attributes; backslashes do not escape quotes in HTML.

```html
// Wrong (legacy): <input id="name" type="text" data-validate="[[\"required\"]]">
<input id="name" type="text" data-validate='[["required"]]'>
```

Saving twice sends the same row twice with `rowStatus: "insert"`: after a successful insert, disable Save, start a new row (see Variations) or move to the edit screen.

jQuery runs a block page's inline script as a global script, so keep `const cont` inside a function; a top-level declaration throws a `SyntaxError` when the page is loaded again.

```js
// Wrong (legacy): const cont = N(".exap0300").cont({ init: (view, request) => { /* ... */ } });
(function () {
    const cont = N(".exap0300").cont({ init: function (view, request) { /* ... */ } });
})();
```

# Related

- [N.form](../ui/form.md) - `add()`, `validate()`, `revert()`, `unbind()` and the element binding rules.
- [N.validator](../data/validator.md) - the `required`, `email`, `integer`, `date` and `maxlength` rules.
- [N.alert](../ui/alert.md) - `confirm`, `onOk` and the dialog container.
- [N.message](../core/message.md) - locale-first message resources.
- [Edit form data](edit-form-data.md) - load an existing row into the same form and update it.

[^message]: NC.message implementation
[^vals]: NC.prototype.vals (single checkbox values)
[^select]: NU.select implementation
[^form]: NU.form implementation
[^alert]: NU.alert implementation
[^request]: NA.comm.request defaults and body serialization
[^njs]: N global and factory installation (only window.N is exported)
