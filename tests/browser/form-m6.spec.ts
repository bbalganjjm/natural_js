import { expect, test } from "@playwright/test";

test("Form keeps choice groups raw, accessible, and scoped to their MDI forms", async ({ page }) => {
  await page.goto("/");
  const result = await page.evaluate(async () => {
    const { bindForm, createRows } = await import("/m3-fixture.ts");
    const markup = `<fieldset><legend>Priority</legend>
      <label><input type="radio" name="priority" value="low" data-field="profile.priority" required>Low</label>
      <label><input type="radio" name="priority" value="high" data-field="profile.priority">High</label>
      <output data-error-for="profile.priority"></output></fieldset>
      <fieldset><legend>Tags</legend>
      <label><input type="checkbox" value="red" data-field="profile.tags" required>Red</label>
      <label><input type="checkbox" value="blue" data-field="profile.tags">Blue</label>
      <output data-error-for="profile.tags"></output></fieldset>
      <label>Skills <select multiple data-field="profile.skills">
        <option value="ts">TS</option><option value="js">JS</option></select></label>
      <label>Active <input type="checkbox" data-field="profile.active"></label>`;
    const roots = [document.createElement("form"), document.createElement("form")];
    for (const root of roots) { root.innerHTML = markup; document.body.append(root); }
    const rows = createRows([
      { profile: { priority: "low" as string | null, tags: ["red"], skills: ["ts"], active: false } },
      { profile: { priority: "high" as string | null, tags: ["blue"], skills: ["js"], active: true } }
    ]);
    const [first, second] = rows.entries();
    const forms = roots.map(root => bindForm(root, { rows }));
    forms[0].bind(first.id);
    forms[1].bind(second.id);
    const radio = (root: HTMLElement, value: string) =>
      root.querySelector<HTMLInputElement>(`input[type="radio"][value="${value}"]`)!;
    const firstHigh = radio(roots[0], "high");
    const secondHigh = radio(roots[1], "high");
    firstHigh.click();
    const mdiScoped = secondHigh.checked && rows.get(first.id)?.value.profile.priority === "high";
    const firstBlue = roots[0].querySelector<HTMLInputElement>('input[value="blue"]')!;
    firstBlue.click();
    const skills = roots[0].querySelector<HTMLSelectElement>("select")!;
    for (const option of skills.options) option.selected = true;
    skills.dispatchEvent(new Event("change", { bubbles: true }));
    roots[0].querySelector<HTMLInputElement>('input[data-field="profile.active"]')!.click();
    const edited = forms[0].read();
    const changed = rows.changes().length;

    for (const input of roots[0].querySelectorAll<HTMLInputElement>('input[type="radio"]')) input.checked = false;
    firstHigh.dispatchEvent(new Event("change", { bubbles: true }));
    const visible = forms[0].validate(first.id);
    const error = roots[0].querySelector<HTMLOutputElement>('[data-error-for="profile.priority"]')!;
    const accessible = [...roots[0].querySelectorAll<HTMLInputElement>('input[type="radio"]')]
      .every(input => input.getAttribute("aria-invalid") === "true" &&
        input.getAttribute("aria-describedby") === error.id);
    const storedDuringDraft = rows.get(first.id)?.value.profile.priority;
    forms[0].bind(second.id);
    const hidden = forms[0].validate(first.id);
    forms[0].bind(first.id);
    const draftRestored = !radio(roots[0], "low").checked && !radio(roots[0], "high").checked;
    radio(roots[0], "low").click();
    const resolved = forms[0].validate(first.id).valid &&
      rows.get(first.id)?.value.profile.priority === "low";
    for (const input of roots[0].querySelectorAll<HTMLInputElement>('input[data-field="profile.tags"]')) {
      input.checked = false;
    }
    firstBlue.dispatchEvent(new Event("change", { bubbles: true }));
    const tagsStoredDuringDraft = rows.get(first.id)?.value.profile.tags;
    forms[0].bind(second.id);
    const hiddenTags = forms[0].validate(first.id).issues.map(item => [item.field, item.rule, !!item.element]);
    forms[0].bind(first.id);
    const tagsDraftRestored = [...roots[0].querySelectorAll<HTMLInputElement>(
      'input[data-field="profile.tags"]')].every(input => !input.checked);
    roots[0].querySelector<HTMLInputElement>('input[value="red"]')!.click();
    const tagsResolved = forms[0].validate(first.id).valid &&
      JSON.stringify(rows.get(first.id)?.value.profile.tags) === '["red"]';
    rows.revert(first.id);
    const reverted = forms[0].read();
    const ids = [...document.querySelectorAll("[id]")].map(element => element.id);
    const uniqueIds = new Set(ids).size === ids.length;
    forms.forEach(form => form.dispose());
    const restoredAria = !firstHigh.hasAttribute("aria-invalid") &&
      !firstHigh.hasAttribute("aria-describedby") && !error.hasAttribute("id");
    roots.forEach(root => root.remove());
    rows.dispose();
    return {
      mdiScoped, edited, changed, visible: visible.issues.map(item => item.rule),
      accessible, storedDuringDraft, hidden: hidden.issues.map(item => [item.rule, !!item.element]),
      draftRestored, resolved, tagsStoredDuringDraft, hiddenTags,
      tagsDraftRestored, tagsResolved, reverted, uniqueIds, restoredAria
    };
  });
  expect(result).toEqual({
    mdiScoped: true,
    edited: { profile: { priority: "high", tags: ["red", "blue"], skills: ["ts", "js"], active: true } },
    changed: 1, visible: ["html"], accessible: true, storedDuringDraft: "high",
    hidden: [["html", false]], draftRestored: true, resolved: true,
    tagsStoredDuringDraft: ["red", "blue"], hiddenTags: [["profile.tags", "html", false]],
    tagsDraftRestored: true, tagsResolved: true,
    reverted: { profile: { priority: "low", tags: ["red"], skills: ["ts"], active: false } },
    uniqueIds: true, restoredAria: true
  });
});

test("local Form reads group values and rejects ambiguous declarations", async ({ page }) => {
  await page.goto("/");
  const result = await page.evaluate(async () => {
    const { bindForm } = await import("/m3-fixture.ts");
    const root = document.createElement("form");
    root.innerHTML = `<label><input type="radio" name="choice" value="a" data-field="choice" required>A</label>
      <label><input type="radio" name="choice" value="b" data-field="choice">B</label>
      <output data-error-for="choice"></output>
      <label><input type="checkbox" value="x" data-field="tags" required>X</label>
      <label><input type="checkbox" value="y" data-field="tags">Y</label>
      <label><select multiple required data-field="options"><option value="one">One</option>
        <option value="two">Two</option></select></label>
      <label><input type="checkbox" required data-field="enabled"></label>`;
    document.body.append(root);
    const form = bindForm(root);
    const empty = form.validate().issues.map(item => [item.field, item.rule]);
    root.querySelector<HTMLInputElement>('input[value="b"]')!.click();
    root.querySelector<HTMLInputElement>('input[value="y"]')!.click();
    const select = root.querySelector<HTMLSelectElement>("select")!;
    select.options[1].selected = true;
    select.dispatchEvent(new Event("change", { bubbles: true }));
    root.querySelector<HTMLInputElement>('input[data-field="enabled"]')!.click();
    const read = form.read();
    const valid = form.validate().valid;
    form.dispose();
    root.remove();

    const error = (markup: string, options?: Parameters<typeof bindForm>[1]) => {
      const node = document.createElement("div");
      node.innerHTML = markup;
      document.body.append(node);
      let code = "";
      try { bindForm(node, options); }
      catch (cause) { code = (cause as { code: string }).code; }
      node.remove();
      return code;
    };
    const outerForm = document.createElement("form");
    outerForm.innerHTML = '<div><input type="radio" name="choice" data-field="choice"></div>';
    document.body.append(outerForm);
    let externalOwner = "";
    try { bindForm(outerForm.querySelector("div")!); }
    catch (cause) { externalOwner = (cause as { code: string }).code; }
    outerForm.remove();
    return {
      empty, read, valid, externalOwner,
      noRadioOwner: error('<input type="radio" name="choice" data-field="choice">'),
      duplicateText: error('<input data-field="x"><input data-field="x">'),
      duplicateChoice: error('<input type="checkbox" value="x" data-field="tags">' +
        '<input type="checkbox" value="x" data-field="tags">'),
      arrayParser: error('<select multiple data-field="options"></select>',
        { parse: { options: value => value } }),
      booleanParser: error('<input type="checkbox" data-field="enabled">',
        { parse: { enabled: value => value } })
    };
  });
  expect(result).toEqual({
    empty: [["choice", "html"], ["tags", "html"], ["options", "html"], ["enabled", "html"]],
    read: { choice: "b", tags: ["y"], options: ["two"], enabled: true }, valid: true,
    noRadioOwner: "FORM_RADIO_OWNER", externalOwner: "FORM_RADIO_OWNER",
    duplicateText: "FORM_FIELD_REPEAT",
    duplicateChoice: "FORM_GROUP_VALUE", arrayParser: "FORM_PARSE_CONTROL",
    booleanParser: "FORM_PARSE_CONTROL"
  });
});
