# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tree-date-screen.spec.ts >> stack connects Tree and DatePicker to independent CVC Forms
- Location: tests\browser\tree-date-screen.spec.ts:5:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('[data-screen="1"]').locator('[data-date-dialog]').locator('[data-date-value="2027-12-04"]')

```

# Page snapshot

```yaml
- generic [ref=e1]:
  - banner [ref=e2]:
    - heading "People and dates · stacked" [level=1] [ref=e3]
    - button "Open another workspace" [ref=e4] [cursor=pointer]
    - link "Side-by-side layout" [ref=e5]:
      - /url: /m11/side.html
  - paragraph [ref=e6]: Select a person with the tree, edit their name or date, and inspect the raw changes. The two workspaces have independent data.
  - main [ref=e7]:
    - article "Workspace 1" [ref=e9]:
      - generic [ref=e10]:
        - heading "Workspace 1" [level=2] [ref=e11]
        - button "Close workspace" [ref=e12] [cursor=pointer]
      - generic [ref=e13]:
        - region "Selected person" [ref=e14]:
          - heading "Details" [level=3] [ref=e15]
          - generic [ref=e16]:
            - generic [ref=e17]:
              - text: Name
              - textbox "Name" [ref=e18]: Lin Updated
            - status [ref=e19]
            - generic [ref=e20]:
              - text: Role
              - textbox "Role" [ref=e21]: Engineer
            - status [ref=e22]
            - generic [ref=e23]:
              - text: Review date
              - textbox "Review date" [ref=e24]: 2026-10-13
            - status [ref=e25]
            - generic [ref=e26]:
              - button "Choose review date" [ref=e27] [cursor=pointer]
              - button "Validate for save" [ref=e28] [cursor=pointer]
              - button "Revert changes" [ref=e29] [cursor=pointer]
          - status [ref=e30]: Valid changes ready to save
          - heading "Raw Rows changes" [level=4] [ref=e31]
          - generic "Changed data" [ref=e32]: "[ { \"id\": 3, \"status\": \"update\", \"value\": { \"key\": \"lin\", \"parent\": \"product\", \"name\": \"Lin Updated\", \"role\": \"Engineer\", \"date\": \"2026-10-13\" } } ]"
        - region "People hierarchy" [ref=e33]:
          - heading "People" [level=3] [ref=e34]
          - paragraph [ref=e35]: Arrow keys move focus. Enter selects. Right and Left expand and collapse.
          - tree "People in workspace 1" [ref=e36]:
            - treeitem "ProductTeam" [expanded] [level=1] [ref=e37]:
              - button "Toggle children" [expanded] [ref=e38] [cursor=pointer]: −
              - group [ref=e40]:
                - treeitem "AdaDesigner" [level=2] [ref=e41]: +
                - treeitem "Lin UpdatedEngineer" [level=2] [selected] [ref=e43]: +
            - treeitem "ResearchTeam" [level=1] [ref=e45]:
              - button "Toggle children" [ref=e46] [cursor=pointer]: +
              - text: +
          - status [ref=e48]: "Selected: Lin Updated"
      - dialog "Choose review date" [ref=e49]:
        - generic [ref=e50]:
          - generic [ref=e51]:
            - button "Previous month" [ref=e52] [cursor=pointer]: Previous
            - heading "October 2026" [level=3] [ref=e53]
            - button "Next month" [ref=e54] [cursor=pointer]: Next
          - grid "October 2026" [ref=e55]:
            - rowgroup [ref=e56]:
              - row [ref=e57]:
                - columnheader "Mo" [ref=e58]
                - columnheader "Tu" [ref=e59]
                - columnheader "We" [ref=e60]
                - columnheader "Th" [ref=e61]
                - columnheader "Fr" [ref=e62]
                - columnheader "Sa" [ref=e63]
                - columnheader "Su" [ref=e64]
            - rowgroup [ref=e65]:
              - row [ref=e66]:
                - gridcell [ref=e67]:
                  - button "Monday, September 28, 2026" [ref=e68] [cursor=pointer]: "28"
                - gridcell [ref=e69]:
                  - button "Tuesday, September 29, 2026" [ref=e70] [cursor=pointer]: "29"
                - gridcell [ref=e71]:
                  - button "Wednesday, September 30, 2026" [ref=e72] [cursor=pointer]: "30"
                - gridcell [ref=e73]:
                  - button "Thursday, October 1, 2026" [ref=e74] [cursor=pointer]: "1"
                - gridcell [ref=e75]:
                  - button "Friday, October 2, 2026" [ref=e76] [cursor=pointer]: "2"
                - gridcell [ref=e77]:
                  - button "Saturday, October 3, 2026" [ref=e78] [cursor=pointer]: "3"
                - gridcell [ref=e79]:
                  - button "Sunday, October 4, 2026" [ref=e80] [cursor=pointer]: "4"
              - row [ref=e81]:
                - gridcell [ref=e82]:
                  - button "Monday, October 5, 2026" [ref=e83] [cursor=pointer]: "5"
                - gridcell [ref=e84]:
                  - button "Tuesday, October 6, 2026" [ref=e85] [cursor=pointer]: "6"
                - gridcell [ref=e86]:
                  - button "Wednesday, October 7, 2026" [ref=e87] [cursor=pointer]: "7"
                - gridcell [ref=e88]:
                  - button "Thursday, October 8, 2026" [ref=e89] [cursor=pointer]: "8"
                - gridcell [ref=e90]:
                  - button "Friday, October 9, 2026" [ref=e91] [cursor=pointer]: "9"
                - gridcell [ref=e92]:
                  - button "Saturday, October 10, 2026" [ref=e93] [cursor=pointer]: "10"
                - gridcell [ref=e94]:
                  - button "Sunday, October 11, 2026" [ref=e95] [cursor=pointer]: "11"
              - row [ref=e96]:
                - gridcell [ref=e97]:
                  - button "Monday, October 12, 2026" [ref=e98] [cursor=pointer]: "12"
                - gridcell [selected] [ref=e99]:
                  - button "Tuesday, October 13, 2026" [active] [ref=e100] [cursor=pointer]: "13"
                - gridcell [ref=e101]:
                  - button "Wednesday, October 14, 2026" [ref=e102] [cursor=pointer]: "14"
                - gridcell [ref=e103]:
                  - button "Thursday, October 15, 2026" [ref=e104] [cursor=pointer]: "15"
                - gridcell [ref=e105]:
                  - button "Friday, October 16, 2026" [ref=e106] [cursor=pointer]: "16"
                - gridcell [ref=e107]:
                  - button "Saturday, October 17, 2026" [ref=e108] [cursor=pointer]: "17"
                - gridcell [ref=e109]:
                  - button "Sunday, October 18, 2026" [ref=e110] [cursor=pointer]: "18"
              - row [ref=e111]:
                - gridcell [ref=e112]:
                  - button "Monday, October 19, 2026" [ref=e113] [cursor=pointer]: "19"
                - gridcell [ref=e114]:
                  - button "Tuesday, October 20, 2026" [ref=e115] [cursor=pointer]: "20"
                - gridcell [ref=e116]:
                  - button "Wednesday, October 21, 2026" [ref=e117] [cursor=pointer]: "21"
                - gridcell [ref=e118]:
                  - button "Thursday, October 22, 2026" [ref=e119] [cursor=pointer]: "22"
                - gridcell [ref=e120]:
                  - button "Friday, October 23, 2026" [ref=e121] [cursor=pointer]: "23"
                - gridcell [ref=e122]:
                  - button "Saturday, October 24, 2026" [ref=e123] [cursor=pointer]: "24"
                - gridcell [ref=e124]:
                  - button "Sunday, October 25, 2026" [ref=e125] [cursor=pointer]: "25"
              - row [ref=e126]:
                - gridcell [ref=e127]:
                  - button "Monday, October 26, 2026" [ref=e128] [cursor=pointer]: "26"
                - gridcell [ref=e129]:
                  - button "Tuesday, October 27, 2026" [ref=e130] [cursor=pointer]: "27"
                - gridcell [ref=e131]:
                  - button "Wednesday, October 28, 2026" [ref=e132] [cursor=pointer]: "28"
                - gridcell [ref=e133]:
                  - button "Thursday, October 29, 2026" [ref=e134] [cursor=pointer]: "29"
                - gridcell [ref=e135]:
                  - button "Friday, October 30, 2026" [ref=e136] [cursor=pointer]: "30"
                - gridcell [ref=e137]:
                  - button "Saturday, October 31, 2026" [ref=e138] [cursor=pointer]: "31"
                - gridcell [ref=e139]:
                  - button "Sunday, November 1, 2026" [ref=e140] [cursor=pointer]: "1"
              - row [ref=e141]:
                - gridcell [ref=e142]:
                  - button "Monday, November 2, 2026" [ref=e143] [cursor=pointer]: "2"
                - gridcell [ref=e144]:
                  - button "Tuesday, November 3, 2026" [ref=e145] [cursor=pointer]: "3"
                - gridcell [ref=e146]:
                  - button "Wednesday, November 4, 2026" [ref=e147] [cursor=pointer]: "4"
                - gridcell [ref=e148]:
                  - button "Thursday, November 5, 2026" [ref=e149] [cursor=pointer]: "5"
                - gridcell [ref=e150]:
                  - button "Friday, November 6, 2026" [ref=e151] [cursor=pointer]: "6"
                - gridcell [ref=e152]:
                  - button "Saturday, November 7, 2026" [ref=e153] [cursor=pointer]: "7"
                - gridcell [ref=e154]:
                  - button "Sunday, November 8, 2026" [ref=e155] [cursor=pointer]: "8"
          - button "Today" [ref=e157] [cursor=pointer]
        - paragraph [ref=e158]: Arrow keys move by day or week; Page Up and Page Down change month. Enter chooses. Escape cancels.
        - button "Cancel" [ref=e159] [cursor=pointer]
    - article "Workspace 2" [ref=e161]:
      - generic [ref=e162]:
        - heading "Workspace 2" [level=2] [ref=e163]
        - button "Close workspace" [ref=e164] [cursor=pointer]
      - generic [ref=e165]:
        - region "Selected person" [ref=e166]:
          - heading "Details" [level=3] [ref=e167]
          - generic [ref=e168]:
            - generic [ref=e169]:
              - text: Name
              - textbox "Name" [ref=e170]: Ada
            - status [ref=e171]
            - generic [ref=e172]:
              - text: Role
              - textbox "Role" [ref=e173]: Designer
            - status [ref=e174]
            - generic [ref=e175]:
              - text: Review date
              - textbox "Review date" [ref=e176]: 2026-10-05
            - status [ref=e177]
            - generic [ref=e178]:
              - button "Choose review date" [ref=e179] [cursor=pointer]
              - button "Validate for save" [ref=e180] [cursor=pointer]
              - button "Revert changes" [ref=e181] [cursor=pointer]
          - status [ref=e182]
          - heading "Raw Rows changes" [level=4] [ref=e183]
          - generic "Changed data" [ref=e184]: "[]"
        - region "People hierarchy" [ref=e185]:
          - heading "People" [level=3] [ref=e186]
          - paragraph [ref=e187]: Arrow keys move focus. Enter selects. Right and Left expand and collapse.
          - tree "People in workspace 2" [ref=e188]:
            - treeitem "ProductTeam" [expanded] [level=1] [ref=e189]:
              - button "Toggle children" [expanded] [ref=e190] [cursor=pointer]: −
              - group [ref=e192]:
                - treeitem "AdaDesigner" [level=2] [selected] [ref=e193]: +
                - treeitem "LinEngineer" [level=2] [ref=e195]: +
            - treeitem "ResearchTeam" [level=1] [ref=e197]:
              - button "Toggle children" [ref=e198] [cursor=pointer]: +
              - text: +
          - status [ref=e200]: "Selected: Ada"
```

# Test source

```ts
  1   | import { expect, test } from "@playwright/test";
  2   | import AxeBuilder from "@axe-core/playwright";
  3   | 
  4   | for (const layout of ["side", "stack"] as const) {
  5   |   test(`${layout} connects Tree and DatePicker to independent CVC Forms`, async ({ page }) => {
  6   |     const errors: Error[] = [];
  7   |     page.on("pageerror", error => errors.push(error));
  8   |     await page.goto(`/m11/${layout}.html`);
  9   |     const first = page.locator('[data-screen="1"]');
  10  |     const second = page.locator('[data-screen="2"]');
  11  |     await expect(first).toHaveAttribute("data-lifecycle", "active");
  12  |     await expect(second).toHaveAttribute("data-lifecycle", "active");
  13  |     expect(await first.getAttribute("data-controller")).not.toBe(await second.getAttribute("data-controller"));
  14  |     const ada = first.getByRole("treeitem", { name: /^Ada\s*Designer$/ });
  15  |     const product = first.getByRole("treeitem", { name: /^Product\s*Team$/ });
  16  |     await expect(ada).toHaveAttribute("aria-selected", "true");
  17  |     await ada.focus();
  18  |     await page.keyboard.press("ArrowUp");
  19  |     await expect(product).toBeFocused();
  20  |     await expect(ada).toHaveAttribute("aria-selected", "true");
  21  |     await page.keyboard.press("ArrowLeft");
  22  |     await expect(product).toHaveAttribute("aria-expanded", "false");
  23  |     await page.keyboard.press("ArrowRight");
  24  |     await page.keyboard.press("ArrowRight");
  25  |     await expect(ada).toBeFocused();
  26  |     await page.keyboard.press("ArrowDown");
  27  |     const lin = first.getByRole("treeitem", { name: /^Lin\s*Engineer$/ });
  28  |     await expect(lin).toBeFocused();
  29  |     await page.keyboard.press("Enter");
  30  |     await expect(first.locator('input[data-field="name"]')).toHaveValue("Lin");
  31  |     await expect(second.locator('input[data-field="name"]')).toHaveValue("Ada");
  32  | 
  33  |     await first.locator('input[data-field="name"]').fill("Lin Updated");
  34  |     await expect(first.getByRole("treeitem", { name: /^Lin Updated\s*Engineer$/ })).toHaveAttribute("aria-selected", "true");
  35  |     await expect(first.locator("[data-changes]")).toContainText('"name": "Lin Updated"');
  36  |     const opener = first.locator("[data-open-date]");
  37  |     await opener.click();
  38  |     const dialog = first.locator("[data-date-dialog]");
  39  |     await expect(dialog).toBeVisible();
  40  |     await expect(dialog.locator('[data-date-value="2026-10-12"]')).toBeFocused();
  41  |     await page.keyboard.press("ArrowRight");
  42  |     await expect(dialog.locator('[data-date-value="2026-10-13"]')).toBeFocused();
  43  |     await page.keyboard.press("Enter");
  44  |     await expect(dialog).not.toBeVisible();
  45  |     await expect(opener).toBeFocused();
  46  |     await expect(first.locator('input[data-field="date"]')).toHaveValue("2026-10-13");
  47  |     await expect(first.locator("[data-changes]")).toContainText('"date": "2026-10-13"');
  48  |     await expect(second.locator('input[data-field="date"]')).toHaveValue("2026-10-05");
  49  | 
  50  |     await first.getByRole("button", { name: "Validate for save" }).click();
  51  |     await expect(first.locator("[data-result]")).toHaveText("Valid changes ready to save");
  52  |     await opener.click();
  53  |     await expect(dialog.locator('[data-date-value="2026-10-13"]')).toBeFocused();
  54  |     await page.keyboard.press("Enter");
  55  |     await expect(dialog).not.toBeVisible();
  56  |     await expect(opener).toBeFocused();
  57  |     await opener.click();
  58  |     await page.keyboard.press("PageDown");
  59  |     await expect(dialog.locator('[data-date-value="2026-11-13"]')).toBeFocused();
  60  |     await page.keyboard.press("Escape");
  61  |     await expect(dialog).not.toBeVisible();
  62  |     await expect(opener).toBeFocused();
  63  |     await expect(first.locator('input[data-field="date"]')).toHaveValue("2026-10-13");
  64  |     await opener.click();
  65  |     await expect(dialog.locator('[data-date-value="2026-10-13"]')).toBeFocused();
  66  |     await page.keyboard.press("Escape");
  67  |     await first.locator('input[data-field="date"]').fill("2027-11-01");
  68  |     await opener.click();
> 69  |     await dialog.locator('[data-date-value="2027-12-04"]').click();
      |                                                            ^ Error: locator.click: Test timeout of 30000ms exceeded.
  70  |     await expect(dialog).not.toBeVisible();
  71  |     await expect(opener).toBeFocused();
  72  |     await expect(first.locator('input[data-field="date"]')).toHaveValue("2027-12-04");
  73  |     await first.getByRole("button", { name: "Revert changes" }).click();
  74  |     await expect(first.locator('input[data-field="name"]')).toHaveValue("Lin");
  75  |     await expect(first.locator('input[data-field="date"]')).toHaveValue("2026-10-12");
  76  |     await expect(first.locator("[data-changes]")).toHaveText("[]");
  77  |     expect(errors).toEqual([]);
  78  |   });
  79  | 
  80  |   test(`${layout} keeps authored MDI labels clean through modal use and repeated disposal`, async ({ page }) => {
  81  |     const errors: Error[] = [];
  82  |     page.on("pageerror", error => errors.push(error));
  83  |     await page.setViewportSize({ width: 320, height: 700 });
  84  |     await page.goto(`/m11/${layout}.html`);
  85  |     await page.addStyleTag({ content: "* { line-height: 1.5 !important; letter-spacing: .12em !important; word-spacing: .16em !important; } p { margin-bottom: 2em !important; }" });
  86  |     const first = page.locator('[data-screen="1"]');
  87  |     const second = page.locator('[data-screen="2"]');
  88  |     await expect(second).toHaveAttribute("data-lifecycle", "active");
  89  |     expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
  90  |     const tags = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22a", "wcag22aa"];
  91  |     const closed = await new AxeBuilder({ page }).withTags(tags).analyze();
  92  |     expect(closed.violations.map(violation => ({ id: violation.id, nodes: violation.nodes.map(node => node.target) }))).toEqual([]);
  93  |     await first.locator("[data-open-date]").click();
  94  |     const dialog = first.locator("[data-date-dialog]");
  95  |     await expect(dialog).toBeVisible();
  96  |     const opened = await new AxeBuilder({ page }).withTags(tags).analyze();
  97  |     expect(opened.violations.map(violation => ({ id: violation.id, nodes: violation.nodes.map(node => node.target) }))).toEqual([]);
  98  |     const references = await page.evaluate(() => {
  99  |       const targets = new Map<string, Element[]>();
  100 |       for (const element of document.querySelectorAll("[id]")) targets.set(element.id, [...targets.get(element.id) ?? [], element]);
  101 |       const duplicates = [...targets].filter(([, elements]) => elements.length !== 1).map(([id]) => id);
  102 |       const dangling: string[] = [];
  103 |       for (const element of document.querySelectorAll("[aria-labelledby], [aria-describedby]")) {
  104 |         for (const attribute of ["aria-labelledby", "aria-describedby"]) {
  105 |           for (const id of (element.getAttribute(attribute) ?? "").split(/\s+/).filter(Boolean)) {
  106 |             const target = targets.get(id);
  107 |             if (target?.length !== 1 || target[0].closest("[data-screen]") !== element.closest("[data-screen]")) dangling.push(id);
  108 |           }
  109 |         }
  110 |       }
  111 |       return { duplicates, dangling };
  112 |     });
  113 |     expect(references).toEqual({ duplicates: [], dangling: [] });
  114 |     await dialog.getByRole("button", { name: "Cancel", exact: true }).click();
  115 |     await expect(first.locator("[data-open-date]")).toBeFocused();
  116 |     await first.locator("[data-remove-screen]").click();
  117 |     await expect(first).toHaveCount(0);
  118 |     await expect(page.locator("[data-add-screen]")).toBeFocused();
  119 |     await page.locator("[data-add-screen]").click();
  120 |     const third = page.locator('[data-screen="3"]');
  121 |     await expect(third).toHaveAttribute("data-lifecycle", "active");
  122 |     await third.locator("[data-open-date]").click();
  123 |     await third.locator('[data-date-value="2026-10-07"]').click();
  124 |     await expect(third.locator('input[data-field="date"]')).toHaveValue("2026-10-07");
  125 |     await expect(second.locator('input[data-field="date"]')).toHaveValue("2026-10-05");
  126 |     await third.locator("[data-open-date]").click();
  127 |     await third.locator("[data-remove-screen]").evaluate(button => (button as HTMLButtonElement).click());
  128 |     await expect(third).toHaveCount(0);
  129 |     await expect(page.locator("dialog[open]")).toHaveCount(0);
  130 |     expect(errors).toEqual([]);
  131 |   });
  132 | }
  133 | 
```