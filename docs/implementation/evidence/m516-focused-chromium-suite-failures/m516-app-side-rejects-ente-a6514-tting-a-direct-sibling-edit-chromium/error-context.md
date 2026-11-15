# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: m516-app.spec.ts >> side rejects entered creation without clearing the old row draft or committing a direct sibling edit
- Location: tests\browser\m516-app.spec.ts:62:3

# Error details

```
Error: expect(locator).toHaveValue(expected) failed

Locator:  locator('[data-page="employees"]').locator('[data-role="detail"]').locator('[data-field="name"]')
Expected: "Uncommitted candidate"
Received: "Ada"
Timeout:  5000ms

Call log:
  - Expect "toHaveValue" locator('[data-page="employees"]').locator('[data-role="detail"]').locator('[data-field="name"]') with timeout 5000ms
  - waiting for locator('[data-page="employees"]').locator('[data-role="detail"]').locator('[data-field="name"]')
    14 × locator resolved to <input required="" data-field="name" data-field-changed="false" aria-describedby="natural-form-error-1"/>
       - unexpected value "Ada"

```

```yaml
- textbox "Name": Ada
```

# Test source

```ts
  1   | // SPDX-License-Identifier: Apache-2.0
  2   | import { expect, test } from "@playwright/test";
  3   | import type { Locator } from "@playwright/test";
  4   | 
  5   | async function countBindings(output: Locator): Promise<void> {
  6   |   await output.evaluate(element => {
  7   |     element.setAttribute("data-bind-count", "0");
  8   |     const observer = new MutationObserver(records => {
  9   |       element.setAttribute("data-bind-count", String(Number(element.getAttribute("data-bind-count")) + records.length));
  10  |     });
  11  |     observer.observe(element, { childList: true });
  12  |   });
  13  | }
  14  | 
  15  | for (const layout of ["side", "stack"] as const) {
  16  |   test(layout + " creates from entered fields without changing the old row and keeps captured creation distinct", async ({ page }) => {
  17  |     const errors: Error[] = [];
  18  |     page.on("pageerror", error => errors.push(error));
  19  |     await page.goto("/m4/" + layout + ".html");
  20  |     const screen = page.locator('[data-page="employees"]'), detail = screen.locator('[data-role="detail"]');
  21  |     await expect(screen.locator("tbody tr")).toHaveCount(3);
  22  |     await screen.locator("tbody tr").filter({ hasText: "Ada" }).locator("[data-select-row]").click();
  23  |     await detail.evaluate(root => {
  24  |       const values = { name: "Entered employee", email: "entered@example.com", salary: "222,000",
  25  |         "profile.team": "Operations", "profile.department": "Delivery" };
  26  |       for (const [field, value] of Object.entries(values)) root.querySelector<HTMLInputElement>('[data-field="' + field + '"]')!.value = value;
  27  |     });
  28  |     await screen.locator('[data-action="add-entered"]').click();
  29  |     await expect(screen.locator("tbody tr")).toHaveCount(4);
  30  |     const inserted = screen.locator("tbody tr").first();
  31  |     await expect(inserted.locator('[data-field="id"]')).toHaveText("NEW-1");
  32  |     await expect(inserted.locator('[data-field="name"]')).toHaveText("Entered employee");
  33  |     await expect(inserted.locator("select")).toHaveValue("22");
  34  |     await expect(inserted.locator("select option")).toHaveText(["Choose", "11"]);
  35  |     await expect(screen.locator("tbody tr").filter({ hasText: "E-101" }).locator('[data-field="name"]')).toHaveText("Ada");
  36  |     const saving = page.waitForRequest(request => request.url().includes("/api/employees/save"));
  37  |     await screen.locator('[data-action="save"]').click();
  38  |     expect((await saving).postDataJSON()).toEqual([{ status: "insert", value: {
  39  |       id: "NEW-1", name: "Entered employee", email: "entered@example.com", salary: 222000,
  40  |       profile: { team: "Operations", department: "Delivery" }, a: [{ aa: 11, bb: 22 }, {}], chosen: 22
  41  |     } }]);
  42  |     await expect(screen.locator('[data-role="status"]')).toHaveText("Saved");
  43  |     await screen.locator('[data-action="add"]').click();
  44  |     await expect(screen.locator("tbody tr")).toHaveCount(5);
  45  |     await expect(detail.locator('[data-field="name"]')).toHaveValue("");
  46  |     await expect(detail.locator('[data-field="email"]')).toHaveValue("");
  47  |     await expect(detail.locator('[data-field="salary"]')).toHaveValue("0");
  48  |     await expect(detail.locator('[data-field="profile.team"]')).toHaveValue("");
  49  |     await expect(screen.locator("tbody tr").filter({ hasText: "NEW-2" }).locator("select option")).toHaveText(["Choose"]);
  50  |     await screen.locator('[data-action="delete"]').click();
  51  |     await expect(screen.locator("tbody tr")).toHaveCount(4);
  52  |     await expect(screen.locator('[data-role="status"]')).toHaveText("New employee removed");
  53  |     await expect(detail.locator('[data-field="name"]')).toHaveValue("");
  54  |     await expect(detail.locator('[data-field="salary"]')).toHaveValue("0");
  55  |     await expect(detail).not.toHaveAttribute("data-row-status", "delete");
  56  |     expect(await detail.locator("input").evaluateAll(inputs => inputs.every(input => !input.disabled))).toBe(true);
  57  |     await screen.locator('[data-action="restore-selection"]').click();
  58  |     await expect(screen.locator("tbody tr")).toHaveCount(4);
  59  |     expect(errors).toEqual([]);
  60  |   });
  61  | 
  62  |   test(layout + " rejects entered creation without clearing the old row draft or committing a direct sibling edit", async ({ page }) => {
  63  |     await page.goto("/m4/" + layout + ".html");
  64  |     const screen = page.locator('[data-page="employees"]'), detail = screen.locator('[data-role="detail"]');
  65  |     await screen.locator("tbody tr").filter({ hasText: "Ada" }).locator("[data-select-row]").click();
  66  |     const email = detail.locator('[data-field="email"]');
  67  |     await email.fill("invalid");
  68  |     await detail.locator('[data-field="name"]').evaluate((input: HTMLInputElement) => { input.value = "Uncommitted candidate"; });
  69  |     await screen.locator('[data-action="add-entered"]').click();
  70  |     await expect(screen.locator("tbody tr")).toHaveCount(3);
  71  |     await expect(screen.locator("tbody tr").filter({ hasText: "E-101" }).locator('[data-field="name"]')).toHaveText("Ada");
> 72  |     await expect(detail.locator('[data-field="name"]')).toHaveValue("Uncommitted candidate");
      |                                                         ^ Error: expect(locator).toHaveValue(expected) failed
  73  |     await expect(email).toHaveValue("invalid");
  74  |     await expect(email).toHaveAttribute("aria-invalid", "true");
  75  |     await expect(screen.locator('[data-role="error"]')).not.toBeEmpty();
  76  |     await screen.locator("tbody tr").filter({ hasText: "Grace" }).locator("[data-select-row]").click();
  77  |     await screen.locator("tbody tr").filter({ hasText: "Ada" }).locator("[data-select-row]").click();
  78  |     await expect(detail.locator('[data-field="name"]')).toHaveValue("Ada");
  79  |     await expect(email).toHaveValue("invalid");
  80  |     await screen.locator('[data-action="restore-selection"]').click();
  81  |     await expect(email).toHaveValue("ada@example.com");
  82  |     await expect(email).not.toHaveAttribute("aria-invalid", "true");
  83  |     await expect(screen.locator("tbody tr")).toHaveCount(3);
  84  |   });
  85  | 
  86  |   test(layout + " restores the complete selection point once while received revert keeps its original meaning", async ({ page }) => {
  87  |     let saves = 0;
  88  |     await page.route("**/api/employees/save?*", route => {
  89  |       saves++;
  90  |       return route.fulfill({ status: 503, contentType: "application/json", body: '{"error":"Keep selection changes"}' });
  91  |     });
  92  |     await page.goto("/m4/" + layout + ".html");
  93  |     const screen = page.locator('[data-page="employees"]'), detail = screen.locator('[data-role="detail"]');
  94  |     const grace = screen.locator("tbody tr").filter({ hasText: "E-102" });
  95  |     await grace.locator("[data-select-row]").click();
  96  |     await detail.locator('[data-field="name"]').fill("Grace prior");
  97  |     await screen.locator("tbody tr").filter({ hasText: "Ada" }).locator("[data-select-row]").click();
  98  |     await grace.locator("[data-select-row]").click();
  99  |     await detail.locator('[data-field="name"]').fill("Grace later");
  100 |     await detail.locator('[data-field="profile.department"]').fill("Later optional field");
  101 |     const output = screen.locator('[data-role="selected"]');
  102 |     await countBindings(output);
  103 |     await screen.locator('[data-action="restore-selection"]').click();
  104 |     await expect(output).toHaveAttribute("data-bind-count", "1");
  105 |     await expect(detail.locator('[data-field="name"]')).toHaveValue("Grace prior");
  106 |     await expect(detail.locator('[data-field="profile.department"]')).toHaveValue("");
  107 |     await expect(grace).toHaveAttribute("data-row-status", "update");
  108 |     const saving = page.waitForRequest(request => request.url().includes("/api/employees/save"));
  109 |     await screen.locator('[data-action="save"]').click();
  110 |     const changes = (await saving).postDataJSON();
  111 |     expect(changes).toHaveLength(1);
  112 |     expect(changes[0]).toMatchObject({ status: "update", value: { id: "E-102", name: "Grace prior", profile: { team: "Research" } } });
  113 |     expect(Object.hasOwn(changes[0].value.profile, "department")).toBe(false);
  114 |     await expect(screen.locator('[data-role="status"]')).toHaveText("Save failed");
  115 |     await screen.locator('[data-action="revert"]').click();
  116 |     await expect(detail.locator('[data-field="name"]')).toHaveValue("Grace");
  117 |     await expect(detail.locator('[data-field="profile.department"]')).toHaveValue("");
  118 |     await screen.locator('[data-action="save"]').click();
  119 |     await expect(screen.locator('[data-role="status"]')).toHaveText("No changes");
  120 |     expect(saves).toBe(1);
  121 |   });
  122 | 
  123 |   test(layout + " retains deleted detail and restores a changed selection once without affecting a declaration sibling", async ({ page }) => {
  124 |     const errors: Error[] = [];
  125 |     page.on("pageerror", error => errors.push(error));
  126 |     await page.goto("/m4/" + layout + ".html?declarations=async");
  127 |     const screens = page.locator('[data-page="employees"]');
  128 |     await expect(screens.first().locator('[data-role="status"]')).toHaveText("Employee declarations ready");
  129 |     await page.locator('[data-action="open"]').click();
  130 |     await expect(screens).toHaveCount(2);
  131 |     const first = screens.first(), second = screens.nth(1), detail = first.locator('[data-role="detail"]');
  132 |     await expect(second.locator('[data-role="status"]')).toHaveText("Employee declarations ready");
  133 |     await first.locator("tbody tr").filter({ hasText: "Ada" }).locator("[data-select-row]").click();
  134 |     await detail.locator('[data-field="name"]').fill("Ada preview");
  135 |     await detail.locator('[data-field="salary"]').fill("125000");
  136 |     await detail.locator('[data-field="salary"]').blur();
  137 |     await detail.locator('[data-field="email"]').fill("invalid");
  138 |     await first.locator('[data-action="delete"]').click();
  139 |     await expect(first.locator("tbody tr")).toHaveCount(2);
  140 |     await expect(detail).toHaveAttribute("data-row-status", "delete");
  141 |     await expect(detail.locator('[data-field="name"]')).toHaveValue("Ada preview");
  142 |     await expect(detail.locator('[data-field="email"]')).toHaveValue("ada@example.com");
  143 |     await expect(first.locator('[data-role="selected"]')).toHaveText("Deleted: Ada preview");
  144 |     expect(await detail.locator("input").evaluateAll(inputs => inputs.every(input => input.disabled))).toBe(true);
  145 |     expect(await detail.evaluate(form => (form as HTMLElement).inert)).toBe(false);
  146 |     await expect(first.locator('[data-action="restore-selection"]')).toBeEnabled();
  147 |     await expect(first.locator('[data-action="save"]')).toBeEnabled();
  148 |     await expect(first.locator('[data-action="close"]')).toBeEnabled();
  149 |     await first.locator('[data-action="add-entered"]').click();
  150 |     await expect(first.locator('[data-role="error"]')).toHaveText("Select or restore an employee before copying entered fields.");
  151 |     await detail.evaluate((form: HTMLFormElement) => form.reset());
  152 |     await expect(detail.locator('[data-field="name"]')).toHaveValue("Ada preview");
  153 |     await expect(detail.locator('[data-field="salary"]')).toHaveValue("125,000");
  154 |     const selected = first.locator('[data-role="selected"]');
  155 |     await countBindings(selected);
  156 |     await first.locator('[data-action="restore-selection"]').click();
  157 |     await expect(selected).toHaveAttribute("data-bind-count", "1");
  158 |     await expect(selected).toHaveText("Selected: Ada");
  159 |     await expect(detail).not.toHaveAttribute("data-row-status", "delete");
  160 |     await expect(detail.locator('[data-field="name"]')).toHaveValue("Ada");
  161 |     expect(await detail.locator("input").evaluateAll(inputs => inputs.every(input => !input.disabled))).toBe(true);
  162 |     await expect(first.locator("tbody tr")).toHaveCount(3);
  163 |     await expect(second.locator('[data-role="selected"]')).toHaveText("Selected: Grace");
  164 |     await first.locator('[data-action="delete"]').click();
  165 |     const retained = await first.elementHandle();
  166 |     if (!retained) throw new Error("Employee page was not mounted.");
  167 |     await detail.evaluate((form: HTMLFormElement) => {
  168 |       form.reset();
  169 |       form.closest('[data-page="employees"]')!.querySelector<HTMLButtonElement>('[data-action="close"]')!.click();
  170 |     });
  171 |     await expect(screens).toHaveCount(1);
  172 |     const removed = await retained.evaluate(root => root.outerHTML);
```