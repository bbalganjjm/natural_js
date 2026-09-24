import { expect, test } from "@playwright/test";

test("Form keeps invalid edits out of Rows and exposes authored errors accessibly", async ({ page }) => {
  await page.goto("/");
  const result = await page.evaluate(async () => {
    const { bindForm, createRows } = await import("/m3-fixture.ts");
    const roots = [document.createElement("form"), document.createElement("form")];
    for (const root of roots) {
      root.innerHTML = `
        <label>Name <input data-field="profile.name" required></label>
        <output data-error-for="profile.name"></output>
        <label>Salary <input data-field="salary" data-format='[["suffix"]]' inputmode="numeric"></label>
        <output data-error-for="salary"></output>
        <label>Email <input data-field="email" type="email" data-validate='[["companyEmail"]]'></label>
        <output data-error-for="email"></output>`;
      document.body.append(root);
    }
    const rows = createRows([{ profile: { name: "Ada" }, salary: 120, email: "ada@example.com" }]);
    const id = rows.entries()[0].id;
    const options = {
      rows,
      parse: { salary: (text: string) => {
        const value = Number(text);
        if (!Number.isFinite(value)) throw new Error("Enter a number");
        return value;
      } },
      rules: {
        format: { suffix: (value: string) => `${value} units` },
        validate: { companyEmail: (value: string) =>
          value.endsWith("@example.com") || "Use a company email" }
      }
    };
    const first = bindForm(roots[0], options);
    const second = bindForm(roots[1], options);
    let duplicateCode = "none";
    try { bindForm(roots[0], options); } catch (cause) {
      duplicateCode = (cause as { code?: string }).code ?? "none";
    }
    first.bind(id);
    second.bind(id);
    const name = roots[0].querySelector<HTMLInputElement>('[data-field="profile.name"]')!;
    const salary = roots[0].querySelector<HTMLInputElement>('[data-field="salary"]')!;
    const email = roots[0].querySelector<HTMLInputElement>('[data-field="email"]')!;
    const nameError = roots[0].querySelector<HTMLElement>('[data-error-for="profile.name"]')!;
    const secondNameError = roots[1].querySelector<HTMLElement>('[data-error-for="profile.name"]')!;
    const distinctIds = nameError.id !== secondNameError.id &&
      document.querySelectorAll(`#${nameError.id}`).length === 1;

    name.value = "";
    name.dispatchEvent(new Event("input", { bubbles: true }));
    const rejectedName = rows.get(id)?.value.profile.name === "Ada" &&
      name.getAttribute("aria-invalid") === "true" &&
      name.getAttribute("aria-describedby") === nameError.id &&
      nameError.textContent !== "" && !first.validate().valid;

    name.value = "Bea";
    name.dispatchEvent(new Event("input", { bubbles: true }));
    email.value = "bea@other.com";
    email.dispatchEvent(new Event("input", { bubbles: true }));
    const rejectedEmail = rows.get(id)?.value.email === "ada@example.com" &&
      roots[0].querySelector('[data-error-for="email"]')?.textContent === "Use a company email";
    email.value = "bea@example.com";
    email.dispatchEvent(new Event("input", { bubbles: true }));

    const formatted = salary.value;
    salary.focus();
    const rawOnFocus = salary.value;
    salary.value = "250";
    salary.dispatchEvent(new Event("input", { bubbles: true }));
    salary.blur();
    const afterBlur = salary.value;
    const rawSalary = rows.get(id)?.value.salary;
    const read = first.read();
    const valid = first.validate().valid;
    first.dispose();
    second.dispose();
    const rebound = bindForm(roots[0], options);
    rebound.dispose();
    const restored = !name.hasAttribute("aria-describedby") &&
      !name.hasAttribute("aria-invalid") && !nameError.hasAttribute("id") &&
      !nameError.hasAttribute("aria-live");
    name.value = "Ignored";
    name.dispatchEvent(new Event("input", { bubbles: true }));
    const afterDispose = rows.get(id)?.value.profile.name;
    roots.forEach(root => root.remove());
    rows.dispose();
    return { duplicateCode, distinctIds, rejectedName, rejectedEmail, formatted, rawOnFocus,
      afterBlur, rawSalary, read, valid, restored, afterDispose };
  });
  expect(result).toEqual({
    duplicateCode: "FORM_IN_USE",
    distinctIds: true,
    rejectedName: true,
    rejectedEmail: true,
    formatted: "120 units",
    rawOnFocus: "120",
    afterBlur: "250 units",
    rawSalary: 250,
    read: { profile: { name: "Bea" }, salary: 250, email: "bea@example.com" },
    valid: true,
    restored: true,
    afterDispose: "Bea"
  });
});

test("local Form reads nested fields and row validation leaves another bound row alone", async ({ page }) => {
  await page.goto("/");
  const result = await page.evaluate(async () => {
    const { bindForm, createRows } = await import("/m3-fixture.ts");
    const searchRoot = document.createElement("form");
    searchRoot.innerHTML = '<label>Search <input data-field="filter.term" value="Ada"></label>';
    document.body.append(searchRoot);
    const search = bindForm(searchRoot);
    const firstRead = search.read();
    const input = searchRoot.querySelector("input")!;
    input.value = "Bea";
    const secondRead = search.read();
    const detached = firstRead.filter !== secondRead.filter;

    const detailRoot = document.createElement("form");
    detailRoot.innerHTML = '<label>Email <input type="email" required data-field="email"></label><output data-error-for="email"></output>';
    document.body.append(detailRoot);
    const rows = createRows([{ email: "first@example.com" }, { email: "broken" }]);
    const [first, second] = rows.entries();
    const detail = bindForm(detailRoot, { rows });
    detail.bind(first.id);
    const otherResult = detail.validate(second.id);
    const firstStillVisible = detailRoot.querySelector("input")!.value === "first@example.com";
    const localResult = search.validate();
    search.dispose();
    detail.dispose();
    rows.dispose();
    searchRoot.remove();
    detailRoot.remove();
    return { firstRead, secondRead, detached, otherValid: otherResult.valid,
      otherIssues: otherResult.issues.map(issue => [issue.rowId, issue.field, issue.rule]),
      firstStillVisible, localValid: localResult.valid, secondId: second.id };
  });
  expect(result.firstRead).toEqual({ filter: { term: "Ada" } });
  expect(result.secondRead).toEqual({ filter: { term: "Bea" } });
  expect(result.detached).toBe(true);
  expect(result.otherValid).toBe(false);
  expect(result.otherIssues).toEqual([[result.secondId, "email", "html"]]);
  expect(result.firstStillVisible).toBe(true);
  expect(result.localValid).toBe(true);
});
test("Form retains invalid drafts by row and resolves cross-field candidates", async ({ page }) => {
  await page.goto("/");
  const result = await page.evaluate(async () => {
    const { bindForm, createRows } = await import("/m3-fixture.ts");
    const root = document.createElement("form");
    root.innerHTML = `<label>Password <input data-field="password"></label>
      <label>Confirm <input data-field="confirm" data-validate='[["equalTo","password"]]'></label>
      <output data-error-for="confirm"></output>`;
    document.body.append(root);
    const rows = createRows([{ password: "old", confirm: "old" }, { password: "other", confirm: "other" }, { password: "third", confirm: "third" }]);
    const [first, second, third] = rows.entries();
    const form = bindForm(root, { rows });
    const password = root.querySelector<HTMLInputElement>('[data-field="password"]')!;
    const confirm = root.querySelector<HTMLInputElement>('[data-field="confirm"]')!;
    const edit = (element: HTMLInputElement, value: string) => {
      element.value = value;
      element.dispatchEvent(new Event("input", { bubbles: true }));
    };

    form.bind(first.id);
    edit(confirm, "mismatch");
    const firstRaw = rows.get(first.id)?.value.confirm;
    form.bind(second.id);
    edit(confirm, "broken");
    const hidden = form.validate(first.id);
    const all = form.validate();
    const secondStillVisible = confirm.value === "broken";
    const errorBefore = root.querySelector("[data-error-for]")!.textContent;
    rows.revert(third.id);
    const unrelatedRevertKeepsError = root.querySelector("[data-error-for]")!.textContent === errorBefore;
    form.bind(first.id);
    const restored = confirm.value;
    const cachedEntries = rows.entries();
    rows.revert(first.id);
    const cleared = confirm.value;
    const cacheKept = rows.entries() === cachedEntries;

    edit(confirm, "new");
    edit(password, "new");
    const merged = rows.get(first.id)?.value;
    const valid = form.validate(first.id).valid;
    const secondRetained = !form.validate(second.id).valid;
    form.bind(second.id);
    edit(confirm, "broken");
    rows.replace([{ password: "replacement", confirm: "replacement" }]);
    const afterReplace = form.validate();
    form.dispose();
    rows.dispose();
    root.remove();
    return {
      firstId: first.id, firstRaw, hiddenIssues: hidden.issues.map(issue => [issue.rowId, issue.rule, !!issue.element]),
      allIssues: all.issues.map(issue => [issue.rowId, issue.rule]), secondStillVisible, unrelatedRevertKeepsError,
      restored, cleared, cacheKept, merged, valid, secondRetained, afterReplace
    };
  });
  expect(result).toEqual({
    firstId: 1, firstRaw: "old", hiddenIssues: [[1, "equalTo", false]],
    allIssues: [[2, "equalTo"], [1, "equalTo"]], secondStillVisible: true, unrelatedRevertKeepsError: true,
    restored: "mismatch", cleared: "old", cacheKept: true,
    merged: { password: "new", confirm: "new" }, valid: true, secondRetained: true,
    afterReplace: { valid: true, issues: [] }
  });
});

test("built-in Form rules keep raw values and direct fill replaces formatted text", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(async () => {
    const { bindForm, createRows } = await import("/m3-fixture.ts");
    const root = document.createElement("form");
    root.setAttribute("data-form-test", "");
    root.innerHTML = `<label>Email <input data-field="email" data-validate='[["required"],["email"]]'></label>
      <output data-error-for="email"></output>
      <label>Salary <input data-field="salary" data-format='[["commas"]]'></label>`;
    document.body.append(root);
    const rows = createRows([{ email: "ada@example.com", salary: 1200 }]);
    const form = bindForm(root, { rows });
    form.bind(rows.entries()[0].id);
    rows.subscribe(() => { root.dataset.salary = String(rows.entries()[0].value.salary); });
  });
  const root = page.locator("[data-form-test]");
  const email = root.locator('[data-field="email"]');
  await email.fill("bad");
  await expect(email).toHaveAttribute("aria-invalid", "true");
  await expect(root.locator('[data-error-for="email"]')).toHaveText("Enter an email address.");
  await email.fill("valid@example.com");
  await expect(email).not.toHaveAttribute("aria-invalid", "true");
  const salary = root.locator('[data-field="salary"]');
  await expect(salary).toHaveValue("1,200");
  await salary.fill("2500");
  await expect(salary).toHaveValue("2500");
  await expect(root).toHaveAttribute("data-salary", "2500");
  await salary.blur();
  await expect(salary).toHaveValue("2,500");
});
test("parser failures retain drafts and null raw values can format", async ({ page }) => {
  await page.goto("/");
  const result = await page.evaluate(async () => {
    const { bindForm, createRows } = await import("/m3-fixture.ts");
    const root = document.createElement("form");
    root.innerHTML = `<label>Label <input data-field="label" data-format='[["trimtoval","N/A"]]'></label>
      <label>Count <input data-field="count"></label><output data-error-for="count"></output>`;
    document.body.append(root);
    const rows = createRows([{ label: null as string | null, count: 1 }]);
    const id = rows.entries()[0].id;
    let mode = "throw";
    const form = bindForm(root, {
      rows,
      parse: { count: () => {
        if (mode === "throw") throw new Error("");
        return undefined;
      } }
    });
    form.bind(id);
    const label = root.querySelector<HTMLInputElement>('[data-field="label"]')!;
    const count = root.querySelector<HTMLInputElement>('[data-field="count"]')!;
    const initial = label.value;
    label.focus();
    const rawOnFocus = label.value;
    label.blur();
    const afterBlur = label.value;
    count.value = "7";
    count.dispatchEvent(new Event("input", { bubbles: true }));
    const thrown = form.validate(id).issues[0];
    mode = "undefined";
    count.value = "8";
    count.dispatchEvent(new Event("input", { bubbles: true }));
    const missing = form.validate(id).issues[0];
    form.bind(null);
    form.bind(id);
    const restored = count.value;
    const stored = rows.get(id)?.value;
    form.dispose();
    rows.dispose();
    root.remove();
    return { initial, rawOnFocus, afterBlur, thrown: [thrown.rule, thrown.message],
      missing: [missing.rule, missing.message], restored, stored };
  });
  expect(result).toEqual({
    initial: "N/A", rawOnFocus: "", afterBlur: "N/A",
    thrown: ["parse", "Input could not be parsed."],
    missing: ["parse", "Input could not be parsed."],
    restored: "8", stored: { label: null, count: 1 }
  });
});
test("local file input validates its filename and row-bound file input fails clearly", async ({ page }) => {
  await page.goto("/");
  const initial = await page.evaluate(async () => {
    const { bindForm, createRows } = await import("/m3-fixture.ts");
    const root = document.createElement("form");
    root.dataset.fileTest = "";
    const input = document.createElement("input");
    input.type = "file";
    input.required = true;
    input.dataset.field = "file";
    input.setAttribute("data-validate", '[["acceptFileExt","png"]]');
    const error = document.createElement("output");
    error.dataset.errorFor = "file";
    root.append(input, error);
    document.body.append(root);
    const form = bindForm(root);
    root.addEventListener("change", () => {
      root.dataset.valid = String(form.validate().valid);
      root.dataset.name = String(form.read().file);
    });
    const emptyValid = form.validate().valid;

    const rowRoot = document.createElement("form");
    rowRoot.innerHTML = '<input type="file" data-field="file">';
    document.body.append(rowRoot);
    const rows = createRows([{ file: "stored.png" }]);
    let rowError = "";
    try { bindForm(rowRoot, { rows }); }
    catch (cause) { rowError = (cause as { code: string }).code; }
    rows.dispose();
    rowRoot.remove();
    const multipleRoot = document.createElement("form");
    multipleRoot.innerHTML = '<input type="file" multiple data-field="files">';
    let multipleError = "";
    try { bindForm(multipleRoot); }
    catch (cause) { multipleError = (cause as { code: string }).code; }
    return { emptyValid, rowError, multipleError };
  });
  expect(initial).toEqual({ emptyValid: false, rowError: "FORM_FILE_ROWS", multipleError: "FORM_FILE_MULTIPLE" });
  const root = page.locator("[data-file-test]");
  const input = root.locator('input[type="file"]');
  await input.setInputFiles({ name: "bad.txt", mimeType: "text/plain", buffer: Buffer.from("bad") });
  await expect(root).toHaveAttribute("data-valid", "false");
  await expect(root).toHaveAttribute("data-name", "bad.txt");
  await expect(input).toHaveAttribute("aria-invalid", "true");
  await input.setInputFiles({ name: "good.png", mimeType: "image/png", buffer: Buffer.from("good") });
  await expect(root).toHaveAttribute("data-valid", "true");
  await expect(root).toHaveAttribute("data-name", "good.png");
  await expect(input).not.toHaveAttribute("aria-invalid", "true");
});

test("built-in required rejects an unchecked checkbox and custom required can override it", async ({ page }) => {
  await page.goto("/");
  const result = await page.evaluate(async () => {
    const { bindForm } = await import("/m3-fixture.ts");
    const root = document.createElement("form");
    root.innerHTML = '<input type="checkbox" data-field="consent" data-validate=' +
      "'[[\"required\"]]'>";
    document.body.append(root);
    const form = bindForm(root);
    const unchecked = form.validate();
    const checkbox = root.querySelector<HTMLInputElement>("input")!;
    checkbox.checked = true;
    checkbox.dispatchEvent(new Event("change", { bubbles: true }));
    const checked = form.validate();

    const customRoot = root.cloneNode(true) as HTMLElement;
    const customCheckbox = customRoot.querySelector<HTMLInputElement>("input")!;
    customCheckbox.checked = false;
    document.body.append(customRoot);
    const custom = bindForm(customRoot, { rules: { validate: { required: () => true } } });
    const customResult = custom.validate();
    form.dispose();
    custom.dispose();
    root.remove();
    customRoot.remove();
    return {
      unchecked: [unchecked.valid, unchecked.issues.map(issue => issue.rule)],
      checked: checked.valid,
      custom: customResult.valid
    };
  });
  expect(result).toEqual({ unchecked: [false, ["required"]], checked: true, custom: true });
});

test("visible and hidden Form drafts obey native text length constraints", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(async () => {
    const { bindForm, createRows } = await import("/m3-fixture.ts");
    const root = document.createElement("form");
    root.dataset.lengthTest = "";
    root.innerHTML = '<label>Name <input data-field="name" minlength="4"></label>' +
      '<output data-error-for="name"></output>';
    document.body.append(root);
    const rows = createRows([{ name: "first" }, { name: "second" }]);
    const [first, second] = rows.entries();
    const form = bindForm(root, { rows });
    form.bind(first.id);
    root.addEventListener("check-hidden", () => {
      const visible = form.validate();
      const stored = rows.get(first.id)?.value.name;
      form.bind(second.id);
      const hidden = form.validate(first.id);
      root.dataset.result = JSON.stringify({
        visible: visible.issues.map(issue => issue.rule),
        hidden: hidden.issues.map(issue => [issue.rule, !!issue.element]),
        stored,
        shown: root.querySelector<HTMLInputElement>("input")!.value
      });
    });
  });
  const root = page.locator("[data-length-test]");
  const input = root.locator("input");
  await input.fill("ab");
  await expect(input).toHaveAttribute("aria-invalid", "true");
  await page.evaluate(() => document.querySelector("[data-length-test]")!
    .dispatchEvent(new Event("check-hidden")));
  expect(JSON.parse((await root.getAttribute("data-result"))!)).toEqual({
    visible: ["html"], hidden: [["html", false]], stored: "first", shown: "second"
  });
});

test("Form clears a committed draft after a subscriber error but keeps a rejected draft", async ({ page }) => {
  await page.goto("/");
  const result = await page.evaluate(async () => {
    const { bindForm, createRows } = await import("/m3-fixture.ts");
    const errors: string[] = [];
    const onError = (event: ErrorEvent) => {
      errors.push(event.error?.message ?? event.message);
      event.preventDefault();
    };
    window.addEventListener("error", onError);

    const root = document.createElement("form");
    root.innerHTML = '<input data-field="name">';
    document.body.append(root);
    const rows = createRows([{ name: "old" }]);
    const id = rows.entries()[0].id;
    const unsubscribe = rows.subscribe(() => { throw new Error("subscriber failed"); });
    const form = bindForm(root, { rows });
    form.bind(id);
    const input = root.querySelector("input")!;
    input.value = "new";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    unsubscribe();
    const committed = rows.get(id)?.value.name;
    rows.set(id, "name", "external");
    const afterExternal = rows.get(id)?.value.name;

    const rejectedRoot = document.createElement("form");
    rejectedRoot.innerHTML = '<input data-field="name">';
    document.body.append(rejectedRoot);
    const rejectedRows = createRows([{ name: "original" }]);
    const rejectedId = rejectedRows.entries()[0].id;
    const rejected = bindForm(rejectedRoot, { rows: rejectedRows, parse: { name: () => new Date() } });
    rejected.bind(rejectedId);
    const rejectedInput = rejectedRoot.querySelector("input")!;
    rejectedInput.value = "draft";
    rejectedInput.dispatchEvent(new Event("input", { bubbles: true }));
    rejected.bind(null);
    rejected.bind(rejectedId);
    const retained = rejectedInput.value;
    const rejectedStored = rejectedRows.get(rejectedId)?.value.name;

    window.removeEventListener("error", onError);
    form.dispose();
    rejected.dispose();
    rows.dispose();
    rejectedRows.dispose();
    root.remove();
    rejectedRoot.remove();
    return { committed, afterExternal, retained, rejectedStored, errors };
  });
  expect(result).toEqual({
    committed: "new", afterExternal: "external", retained: "draft", rejectedStored: "original",
    errors: ["subscriber failed", "Rows require acyclic JSON-compatible values."]
  });
});
test("Form rejects display formatters on controls without text display semantics", async ({ page }) => {
  await page.goto("/");
  const codes = await page.evaluate(async () => {
    const { bindForm } = await import("/m3-fixture.ts");
    const controls = ["checkbox", "file", "number", "select"];
    return controls.map(kind => {
      const root = document.createElement("form");
      const control = kind === "select" ? document.createElement("select") : document.createElement("input");
      if (control instanceof HTMLInputElement) control.type = kind;
      control.dataset.field = "value";
      control.setAttribute("data-format", '[["commas"]]');
      root.append(control);
      document.body.append(root);
      let code = "";
      try { bindForm(root); }
      catch (cause) { code = (cause as { code: string }).code; }
      root.remove();
      return code;
    });
  });
  expect(codes).toEqual(Array(4).fill("FORM_FORMAT_CONTROL"));
});
test("hidden Form length checks use entered text before parsing", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(async () => {
    const { bindForm, createRows } = await import("/m3-fixture.ts");
    const root = document.createElement("form");
    root.dataset.parsedLengthTest = "";
    const input = document.createElement("input");
    input.dataset.field = "name";
    input.minLength = 4;
    input.setAttribute("data-validate", '[["equalTo","match"]]');
    root.append(input);
    document.body.append(root);
    const rows = createRows([{ name: "old", match: "ok" }, { name: "second", match: "second" }]);
    const [first, second] = rows.entries();
    const form = bindForm(root, { rows, parse: { name: value => value.slice(0, 1) } });
    form.bind(first.id);
    root.addEventListener("check-hidden", () => {
      const visible = form.validate();
      form.bind(second.id);
      const hidden = form.validate(first.id);
      root.dataset.result = JSON.stringify({
        visible: visible.issues.map(issue => issue.rule),
        hidden: hidden.issues.map(issue => issue.rule),
        stored: rows.get(first.id)?.value.name
      });
    });
  });
  const root = page.locator("[data-parsed-length-test]");
  await root.locator("input").fill("abcd");
  await page.evaluate(() => document.querySelector("[data-parsed-length-test]")!
    .dispatchEvent(new Event("check-hidden")));
  expect(JSON.parse((await root.getAttribute("data-result"))!)).toEqual({
    visible: ["equalTo"], hidden: ["equalTo"], stored: "old"
  });
});
test("external Rows.set clears stale Form errors without running validators in its subscriber", async ({ page }) => {
  await page.goto("/");
  const result = await page.evaluate(async () => {
    const { bindForm, createRows } = await import("/m3-fixture.ts");
    const root = document.createElement("form");
    root.innerHTML = '<input data-field="name" data-validate=' +
      "'[[\"validName\"]]'><output data-error-for=\"name\"></output><input data-field=\"peer\">";
    document.body.append(root);
    const rows = createRows([{ name: "bad", peer: "safe" }]);
    const id = rows.entries()[0].id;
    let calls = 0;
    const form = bindForm(root, { rows, rules: {
      validate: { validName: (value, _args, context) => {
        calls++;
        if (context.values.peer === "trap") throw new Error("validator should not run in Rows.set");
        return value === "good" || "Use a good name.";
      } }
    } });
    form.bind(id);
    const input = root.querySelector<HTMLInputElement>('[data-field="name"]')!;
    const error = root.querySelector<HTMLElement>('[data-error-for="name"]')!;
    const initial = form.validate();
    const firstCalls = calls;
    rows.set(id, "name", "good");
    const cleared = input.getAttribute("aria-invalid") !== "true" && error.textContent === "";
    const noValidationOnSet = calls === firstCalls;

    input.value = "draft";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    const draftHeld = rows.get(id)?.value.name === "good";
    const beforePeer = calls;
    let peerSetError = "";
    try { rows.set(id, "peer", "trap"); }
    catch (cause) { peerSetError = String(cause); }
    const noValidationWithDraft = calls === beforePeer;
    const draftVisible = input.value === "draft";
    const staleDraftErrorCleared = input.getAttribute("aria-invalid") !== "true" && error.textContent === "";
    form.dispose();
    rows.dispose();
    root.remove();
    return {
      initialRules: initial.issues.map(issue => issue.rule), cleared, noValidationOnSet,
      draftHeld, peerSetError, noValidationWithDraft, draftVisible, staleDraftErrorCleared
    };
  });
  expect(result).toEqual({
    initialRules: ["validName"], cleared: true, noValidationOnSet: true,
    draftHeld: true, peerSetError: "", noValidationWithDraft: true,
    draftVisible: true, staleDraftErrorCleared: true
  });
});

test("untouched stored text has the same visible and hidden length result", async ({ page }) => {
  await page.goto("/");
  const result = await page.evaluate(async () => {
    const { bindForm, createRows } = await import("/m3-fixture.ts");
    const root = document.createElement("form");
    root.innerHTML = '<input data-field="name" minlength="4">';
    document.body.append(root);
    const rows = createRows([{ name: "ab" }, { name: "long" }]);
    const [first, second] = rows.entries();
    const form = bindForm(root, { rows });
    form.bind(first.id);
    const visible = form.validate(first.id);
    form.bind(second.id);
    const hidden = form.validate(first.id);
    const shown = root.querySelector("input")!.value;
    form.dispose();
    rows.dispose();
    root.remove();
    return { visible: visible.issues.map(issue => issue.rule),
      hidden: hidden.issues.map(issue => issue.rule), shown };
  });
  expect(result).toEqual({ visible: [], hidden: [], shown: "long" });
});

test("validate commits a draft made valid by an external row update without rebinding", async ({ page }) => {
  await page.goto("/");
  const result = await page.evaluate(async () => {
    const { bindForm, createRows } = await import("/m3-fixture.ts");
    const root = document.createElement("form");
    root.innerHTML = '<input data-field="confirm" data-validate=' + "'[[\"equalTo\",\"password\"]]'>";
    document.body.append(root);
    const rows = createRows([{ password: "old", confirm: "old" }, { password: "other", confirm: "other" }]);
    const [first, second] = rows.entries();
    const form = bindForm(root, { rows });
    form.bind(first.id);
    const input = root.querySelector("input")!;
    input.value = "new";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    form.bind(second.id);
    rows.set(first.id, "password", "new");
    const before = rows.get(first.id)?.value.confirm;
    const result = form.validate();
    const after = rows.get(first.id)?.value.confirm;
    const shown = input.value;
    form.dispose();
    rows.dispose();
    root.remove();
    return { before, valid: result.valid, after, shown };
  });
  expect(result).toEqual({ before: "old", valid: true, after: "new", shown: "other" });
});
