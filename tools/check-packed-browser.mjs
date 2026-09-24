import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { cpSync, mkdtempSync, readFileSync, realpathSync, rmSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium, firefox, webkit, expect } from "@playwright/test";
import { createServer } from "vite";

const packageDir = fileURLToPath(new URL("..", import.meta.url));
const fixtureDir = path.join(packageDir, "tests", "consumers", "browser");
const npmCli = process.env.npm_execpath;
const browsers = new Map([
  ["chromium", { engine: chromium }],
  ["firefox", { engine: firefox }],
  ["webkit", { engine: webkit }],
  ["chrome", { engine: chromium, channel: "chrome" }],
  ["edge", { engine: chromium, channel: "msedge" }]
]);

function options(args) {
  const usage = "Use --tarball <path.tgz> --sha256 <64-hex-digest> [--browser chromium|firefox|webkit|chrome|edge].";
  if (args.length % 2 !== 0) throw new Error(usage);
  const values = new Map();
  for (let index = 0; index < args.length; index += 2) {
    const name = args[index];
    const value = args[index + 1];
    if (!["--tarball", "--sha256", "--browser"].includes(name) ||
        values.has(name) || !value || value.startsWith("--")) throw new Error(usage);
    values.set(name, value);
  }
  const expected = values.get("--sha256");
  const browserName = values.get("--browser") ?? "chromium";
  if (!values.has("--tarball") || !expected || !/^[0-9a-f]{64}$/i.test(expected) ||
      !browsers.has(browserName)) throw new Error(usage);
  const candidate = path.resolve(values.get("--tarball"));
  const file = statSync(candidate, { throwIfNoEntry: false });
  if (!candidate.toLowerCase().endsWith(".tgz") || !file?.isFile()) {
    throw new Error("Tarball must be an existing .tgz file.");
  }
  const tarball = realpathSync(candidate);
  const actual = createHash("sha256").update(readFileSync(tarball)).digest("hex");
  if (actual !== expected.toLowerCase()) {
    throw new Error(`Tarball SHA-256 mismatch: expected ${expected.toLowerCase()}, got ${actual}.`);
  }
  return { tarball, sha256: actual, browserName };
}

if (!npmCli) throw new Error("Run through npm run so npm_execpath is available.");
const { tarball, sha256, browserName } = options(process.argv.slice(2));
const tempParent = realpathSync(tmpdir());
const tempRoot = realpathSync(mkdtempSync(path.join(tempParent, "natural-js-packed-browser-")));
const consumerDir = path.join(tempRoot, "app");
let vite;
let browser;

function removeOwnedTempRoot() {
  const relative = path.relative(tempParent, tempRoot);
  if (!relative.startsWith("natural-js-packed-browser-") || relative.includes(path.sep) ||
      relative === "." || path.isAbsolute(relative)) {
    throw new Error(`Refusing to remove an unexpected temporary path: ${tempRoot}`);
  }
  rmSync(tempRoot, { recursive: true });
}

try {
  cpSync(fixtureDir, consumerDir, { recursive: true });
  execFileSync(process.execPath, [npmCli,
    "install", "--offline", "--no-save", "--package-lock=false", "--ignore-scripts",
    "--no-audit", "--no-fund", tarball
  ], { cwd: consumerDir, stdio: "inherit" });

  vite = await createServer({
    root: consumerDir,
    configFile: false,
    logLevel: "error",
    server: { host: "127.0.0.1", port: 0, strictPort: false }
  });
  await vite.listen();
  const address = vite.httpServer.address();
  assert(address && typeof address !== "string");
  const url = `http://127.0.0.1:${address.port}/`;

  const selected = browsers.get(browserName);
  browser = await selected.engine.launch({ headless: true, ...(selected.channel && { channel: selected.channel }) });
  const page = await browser.newPage();
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  page.on("console", message => {
    if (message.type() === "error") errors.push(message.text());
  });
  await page.goto(url);
  try {
    await page.waitForFunction(() => window.packedConsumer?.ready || window.packedConsumer?.error,
      undefined, { timeout: 20_000 });
  } catch (cause) {
    throw new Error("Packed consumer did not initialize: " + (errors.join(" | ") || cause.message),
      { cause });
  }
  const setupError = await page.evaluate(() => window.packedConsumer.error);
  assert(!setupError, `Packed consumer setup failed: ${setupError}`);

  for (const [slot, name] of [["a", "Ada"], ["b", "Bea"]]) {
    const host = page.locator(`[data-host="${slot}"]`);
    await expect(host.locator("article")).toHaveCount(1);
    await expect(host.locator("form input")).toHaveValue(name);
    await expect(host.locator("tbody [data-field='person.name']")).toHaveText(name);
    await expect(host.locator("select option")).toHaveText(["Choose", "Eleven", "Twenty two"]);
    await expect(host.locator("select")).toHaveValue("11");
  }
  const ids = await page.evaluate(() => [...document.querySelectorAll("[id]")].map(item => item.id));
  assert.equal(new Set(ids).size, ids.length, "Live CVC screens contain duplicate IDs.");
  assert.equal(ids.length, 2, "Expected one accessible Form error region per screen.");
  const described = await page.evaluate(() => [...document.querySelectorAll("form")].every(form =>
    form.querySelector("input").getAttribute("aria-describedby") === form.querySelector("output").id));
  assert(described, "Form errors must be described by unique, connected regions.");

  const first = page.locator('[data-host="a"]');
  await first.locator("form input").fill("Ann");
  await expect(first.locator("tbody [data-field='person.name']")).toHaveText("Ann");
  await expect(page.locator('[data-host="b"] form input')).toHaveValue("Bea");
  await first.locator("select").selectOption("22");
  assert.equal(await page.evaluate(() => window.packedConsumer.screens.a.rows.entries()[0].value.choice),
    22, "Nested row-local Select must keep its raw number value.");
  await first.locator('[data-action="save"]').click();
  assert.deepEqual(await page.evaluate(() => window.packedConsumer.outputs), ["a"]);

  const disposed = await page.evaluate(async () => {
    const firstScreen = window.packedConsumer.screens.a;
    const handle = window.packedConsumer.handles.a;
    const removedRoot = handle.root;
    const oldButton = removedRoot.querySelector('[data-action="save"]');
    const outputCount = window.packedConsumer.outputs.length;
    await handle.dispose();
    oldButton.click();
    return {
      hostEmpty: !document.querySelector('[data-host="a"]').firstElementChild,
      pageRootGone: handle.root === null,
      ownedResourcesDisposed: firstScreen.disposed,
      noLateOutput: window.packedConsumer.outputs.length === outputCount,
      otherScreenPresent: !!document.querySelector('[data-host="b"] article')
    };
  });
  assert.deepEqual(disposed, {
    hostEmpty: true, pageRootGone: true, ownedResourcesDisposed: true,
    noLateOutput: true, otherScreenPresent: true
  });
  const reloaded = await page.evaluate(async () => {
    const state = window.packedConsumer;
    const oldScreen = state.screens.b;
    await state.handles.b.reload();
    return {
      oldDisposed: oldScreen.disposed,
      newInstance: state.screens.b !== oldScreen,
      rootCount: document.querySelectorAll('[data-host="b"] article').length
    };
  });
  assert.deepEqual(reloaded, { oldDisposed: true, newInstance: true, rootCount: 1 });
  await expect(page.locator('[data-host="b"] form input')).toHaveValue("Bea");
  await page.evaluate(async () => window.packedConsumer.handles.b.dispose());
  await expect(page.locator("article")).toHaveCount(0);
  assert.deepEqual(errors, [], `Browser errors: ${errors.join(" | ")}`);
  process.stdout.write(`Packed browser consumer passed (${browserName} ${browser.version()}, ${process.platform}, SHA-256 ${sha256}).\n`);
} finally {
  await Promise.allSettled([browser?.close(), vite?.close()]);
  removeOwnedTempRoot();
}
