// SPDX-License-Identifier: Apache-2.0
// Recreate the fixed clean source before rerunning the baseline:
// git worktree add --detach -- node_modules/.cache/m10-bench-e184 e1844c2e
// node tools/benchmark-m10-grid.mjs --source=node_modules/.cache/m10-bench-e184 --compare-source=. > comparison.json
// git worktree remove -- node_modules/.cache/m10-bench-e184
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";
import { createServer } from "vite";

const schema = "natural-js-m10-grid-benchmark/v1";
const repository = fileURLToPath(new URL("..", import.meta.url));

function argumentsFrom(argv) {
  const values = new Map();
  for (const arg of argv) {
    const match = /^--(source|compare-source|rows|fields|page-size|runs|warmup)=(.+)$/.exec(arg);
    if (!match) throw new Error(`Unknown argument: ${arg}`);
    values.set(match[1], match[2]);
  }
  const positive = (name, fallback, minimum = 1) => {
    const value = Number(values.get(name) ?? fallback);
    if (!Number.isSafeInteger(value) || value < minimum) throw new Error(`${name} must be an integer >= ${minimum}.`);
    return value;
  };
  const source = path.resolve(repository, values.get("source") ?? ".");
  const compareSource = values.has("compare-source") ? path.resolve(repository, values.get("compare-source")) : null;
  const rows = positive("rows", 5000);
  const fields = positive("fields", 10);
  const pageSize = positive("page-size", 50);
  const runs = positive("runs", 5);
  const warmup = positive("warmup", 2, 0);
  if (rows % pageSize !== 0) throw new Error("rows must divide evenly into page-size for the round trip.");
  if (runs > 30 || warmup > 10 || fields > 30) throw new Error("runs, warmup, or fields exceed the supported benchmark limit.");
  return { source, compareSource, rows, fields, pageSize, runs, warmup };
}

function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

async function forcedMemory(session) {
  await session.send("HeapProfiler.collectGarbage");
  const { metrics } = await session.send("Performance.getMetrics");
  const heapBytes = metrics.find(metric => metric.name === "JSHeapUsedSize")?.value ?? null;
  let domCounters = null;
  try {
    const { documents, nodes, jsEventListeners } = await session.send("Memory.getDOMCounters");
    domCounters = { documents, nodes, jsEventListeners };
  } catch {
    // DOM counters are diagnostic only; old Chromium CDP implementations may omit them.
  }
  return { heapBytes, domCounters };
}

function summary(samples) {
  const stages = ["bindMs", "pageStartMs", "roundTripMs", "transitionMedianMs", "transitionP95Ms"];
  return Object.fromEntries(stages.map(stage => [stage, {
    median: median(samples.map(sample => sample[stage])),
    min: Math.min(...samples.map(sample => sample[stage])),
    max: Math.max(...samples.map(sample => sample[stage]))
  }]));
}

async function measureSource(browser, baseURL, source, options) {
  const data = path.join(source, "src/data/index.ts").replaceAll("\\", "/");
  const grid = path.join(source, "src/ui/grid.ts").replaceAll("\\", "/");
  const modules = { data, grid };
  const samples = [];
  let userAgent = "";
  for (let index = 0; index < options.warmup + options.runs; index++) {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    page.setDefaultTimeout(180_000);
    const session = await page.context().newCDPSession(page);
    try {
      await session.send("Performance.enable");
      await page.goto(new URL("benchmark.html", baseURL).href);
      if (!userAgent) userAgent = await page.evaluate(() => navigator.userAgent);
      await page.evaluate(async ({ modules, rows: count, fields: fieldCount, pageSize }) => {
        const [{ createRows }, { bindGrid }] = await Promise.all([
          import(`/@fs/${modules.data}`),
          import(`/@fs/${modules.grid}`)
        ]);
        const fieldNames = Array.from({ length: fieldCount }, (_, field) => `f${field}`);
        const values = Array.from({ length: count }, (_, row) =>
          Object.fromEntries(fieldNames.map((name, field) => [name, `row-${row + 1}-field-${field}`])));
        const table = document.createElement("table");
        table.innerHTML = `<caption>Grid benchmark</caption><thead><tr>${fieldNames.map(name => `<th scope="col">${name}</th>`).join("")}</tr></thead><tbody><tr data-row-template>${fieldNames.map(name => `<td data-field="${name}"></td>`).join("")}</tr></tbody>`;
        document.body.append(table);
        const store = createRows(values);
        const pageCount = count / pageSize;
        window.m10GridBenchmark = {
          bind() {
            const start = performance.now();
            this.grid = bindGrid(table, { rows: store });
            const bindMs = performance.now() - start;
            const renderedRows = table.tBodies[0].rows.length;
            if (renderedRows !== count) throw new Error(`Initial Grid render: ${renderedRows} rows, expected ${count}.`);
            return { bindMs, renderedRows, preGcHeapBytes: performance.memory?.usedJSHeapSize ?? null };
          },
          firstPage() {
            const start = performance.now();
            this.grid.setPage({ page: 1, size: pageSize });
            const pageStartMs = performance.now() - start;
            const renderedRows = table.tBodies[0].rows.length;
            if (renderedRows !== pageSize) throw new Error(`Page 1: ${renderedRows} rows, expected ${pageSize}.`);
            return { pageStartMs, renderedRows };
          },
          roundTrip() {
            const durations = [];
            for (let page = 2; page <= pageCount; page++) {
              const start = performance.now();
              this.grid.setPage({ page, size: pageSize });
              durations.push(performance.now() - start);
            }
            for (let page = pageCount - 1; page >= 1; page--) {
              const start = performance.now();
              this.grid.setPage({ page, size: pageSize });
              durations.push(performance.now() - start);
            }
            if (table.tBodies[0].rows.length !== pageSize || this.grid.page()?.page !== 1) {
              throw new Error("Grid did not return to page 1 with the expected DOM row count.");
            }
            const sorted = [...durations].sort((a, b) => a - b);
            return {
              roundTripMs: durations.reduce((total, value) => total + value, 0),
              transitions: durations.length,
              transitionMedianMs: sorted[Math.floor(sorted.length / 2)],
              transitionP95Ms: sorted[Math.ceil(sorted.length * 0.95) - 1],
              transitionMaxMs: sorted.at(-1),
              renderedRows: table.tBodies[0].rows.length,
              firstCell: table.tBodies[0].rows[0]?.cells[0]?.textContent
            };
          },
          dispose() {
            this.grid?.dispose();
            store.dispose();
            table.remove();
          }
        };
      }, { modules, rows: options.rows, fields: options.fields, pageSize: options.pageSize });
      const rowsOnly = await forcedMemory(session);
      const initial = await page.evaluate(() => window.m10GridBenchmark.bind());
      const afterBind = await forcedMemory(session);
      const first = await page.evaluate(() => window.m10GridBenchmark.firstPage());
      const afterFirst = await forcedMemory(session);
      const traversal = await page.evaluate(() => window.m10GridBenchmark.roundTrip());
      const afterTraversal = await forcedMemory(session);
      const expectedTransitions = 2 * (options.rows / options.pageSize - 1);
      if (traversal.transitions !== expectedTransitions || traversal.firstCell !== "row-1-field-0") {
        throw new Error("Page traversal did not cover the expected round trip.");
      }
      if (index >= options.warmup) {
        samples.push({
          bindMs: initial.bindMs,
          initialRows: initial.renderedRows,
          initialPreGcHeapBytes: initial.preGcHeapBytes,
          pageStartMs: first.pageStartMs,
          pageStartRows: first.renderedRows,
          roundTripMs: traversal.roundTripMs,
          transitions: traversal.transitions,
          transitionMedianMs: traversal.transitionMedianMs,
          transitionP95Ms: traversal.transitionP95Ms,
          transitionMaxMs: traversal.transitionMaxMs,
          finalRows: traversal.renderedRows,
          rowsOnly,
          afterBind,
          afterFirst,
          afterTraversal
        });
      }
      await page.evaluate(() => window.m10GridBenchmark.dispose());
    } finally {
      await session.detach();
      await page.close();
    }
  }
  return { samples, userAgent };
}

async function main() {
  const options = argumentsFrom(process.argv.slice(2));
  const sourceRevision = execFileSync("git", ["-C", options.source, "rev-parse", "HEAD"], { encoding: "utf8" }).trim();
  const sourceDirty = execFileSync("git", ["-C", options.source, "status", "--porcelain", "--untracked-files=no"], { encoding: "utf8" }).trim() !== "";
  const gridSha256 = createHash("sha256").update(readFileSync(path.join(options.source, "src/ui/grid.ts"))).digest("hex");
  const compareRevision = options.compareSource
    ? execFileSync("git", ["-C", options.compareSource, "rev-parse", "HEAD"], { encoding: "utf8" }).trim()
    : null;
  const compareDirty = options.compareSource
    ? execFileSync("git", ["-C", options.compareSource, "status", "--porcelain", "--untracked-files=no"], { encoding: "utf8" }).trim() !== ""
    : null;
  const compareGridSha256 = options.compareSource
    ? createHash("sha256").update(readFileSync(path.join(options.compareSource, "src/ui/grid.ts"))).digest("hex")
    : null;
  const configFile = fileURLToPath(new URL("../examples/vite/vite.config.ts", import.meta.url));
  const server = await createServer({
    configFile,
    logLevel: "silent",
    server: { host: "127.0.0.1", port: 0, strictPort: false, fs: { allow: [repository, options.source, options.compareSource].filter(Boolean) } }
  });
  let browser;
  try {
    await server.listen();
    const baseURL = server.resolvedUrls?.local[0];
    if (!baseURL) throw new Error("Vite did not report a local URL.");
    browser = await chromium.launch({ headless: true, args: ["--enable-precise-memory-info"] });
    const primary = await measureSource(browser, baseURL, options.source, options);
    const comparison = options.compareSource
      ? await measureSource(browser, baseURL, options.compareSource, options)
      : null;
    const { samples, userAgent } = primary;
    if (gridSha256 !== createHash("sha256").update(readFileSync(path.join(options.source, "src/ui/grid.ts"))).digest("hex")) {
      throw new Error("Grid source changed during the benchmark; discard this result.");
    }
    if (options.compareSource &&
        compareGridSha256 !== createHash("sha256").update(readFileSync(path.join(options.compareSource, "src/ui/grid.ts"))).digest("hex")) {
      throw new Error("Comparison Grid source changed during the benchmark; discard this result.");
    }
    return {
      schema,
      status: "ok",
      timestamp: new Date().toISOString(),
      source: { revision: sourceRevision, dirty: sourceDirty, gridSha256 },
      environment: {
        platform: process.platform,
        architecture: process.arch,
        cpuModel: os.cpus()[0]?.model ?? null,
        logicalCpuCount: os.cpus().length,
        browser: "chromium",
        browserVersion: browser.version(),
        userAgent,
        mode: options.compareSource
          ? "Same Vite server and headless Chromium process, serial source runs on fresh pages"
          : "Vite development server on an ephemeral port; headless Playwright"
      },
      method: {
        rows: options.rows,
        fields: options.fields,
        pageSize: options.pageSize,
        pages: options.rows / options.pageSize,
        pageTransitions: 2 * (options.rows / options.pageSize - 1),
        warmup: options.warmup,
        runs: options.runs,
        newPagePerRun: true,
        initial: "Create Rows before timing; bindGrid renders all rows before paging.",
        navigation: "Set page 1, traverse page 2 through last page, then return to page 1; measure synchronous setPage only.",
        memory: "Chromium CDP forced GC before each stage's JSHeapUsedSize and DOM node counters. The pre-GC post-bind performance.memory sample is instantaneous, not a peak. Heap deltas include Grid and browser allocations; DOM counters include the page and Vite client, not just Grid. Neither metric directly counts retained Grid records."
      },
      summary: summary(samples),
      samples,
      comparison: comparison ? {
        source: { revision: compareRevision, dirty: compareDirty, gridSha256: compareGridSha256 },
        summary: summary(comparison.samples),
        samples: comparison.samples
      } : undefined
    };
  } finally {
    await browser?.close();
    await server.close();
  }
}

try {
  process.stdout.write(`${JSON.stringify(await main())}\n`);
} catch (cause) {
  process.stdout.write(`${JSON.stringify({ schema, status: "error", message: String(cause) })}\n`);
  process.exitCode = 1;
}
