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
