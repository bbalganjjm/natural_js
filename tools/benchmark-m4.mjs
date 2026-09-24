// Reproducible M4 browser binding benchmark. Run after `npm run build`:
// node tools/benchmark-m4.mjs --browser=chromium --runs=5 --warmup=2 > m4-benchmark.json
import os from "node:os";
import { fileURLToPath } from "node:url";
import { chromium, firefox, webkit } from "@playwright/test";
import { createServer } from "vite";

const schema = "natural-js-m4-benchmark/v1";
const stages = ["initial", "rebind", "edit", "sort", "filter", "dispose"];
const kinds = ["flat", "nested-auto", "nested-explicit"];
const counts = [100, 1000];

function argumentsFrom(argv) {
  const values = new Map();
  for (const arg of argv) {
    const match = /^--(browser|runs|warmup)=(.+)$/.exec(arg);
    if (!match) throw new Error(`Unknown argument: ${arg}`);
    values.set(match[1], match[2]);
  }
  const browser = values.get("browser") ?? "chromium";
  const runs = Number(values.get("runs") ?? 5);
  const warmup = Number(values.get("warmup") ?? 2);
  if (!["chromium", "firefox", "webkit"].includes(browser)) throw new Error("Unknown browser.");
  if (!Number.isInteger(runs) || runs < 3 || runs > 50) throw new Error("runs must be between 3 and 50.");
  if (!Number.isInteger(warmup) || warmup < 0 || warmup > 20) throw new Error("warmup must be between 0 and 20.");
  return { browser, runs, warmup };
}

function median(values) {
  const sorted = [...values].sort((left, right) => left - right);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

function summarize(count, kind, samples) {
  const metrics = {};
  for (const stage of stages) {
    const stageSamples = samples.map((run) => run[stage]);
    const heap = stageSamples.map((sample) => sample.usedJSHeapBytes);
    metrics[stage] = {
      medianMs: median(stageSamples.map((sample) => sample.durationMs)),
      medianElementCount: median(stageSamples.map((sample) => sample.elementCount)),
      medianRowCount: median(stageSamples.map((sample) => sample.rowCount)),
      medianUsedJSHeapBytes: heap.every((value) => value !== null) ? median(heap) : null,
      samples: stageSamples
    };
  }
  return { count, kind, metrics };
}


function summarizeLegacy(count, samples) {
  const metrics = {};
  for (const stage of ["initial", "rebind", "edit", "sort"]) {
    const stageSamples = samples.map((run) => run[stage]);
    const heap = stageSamples.map((sample) => sample.usedJSHeapBytes);
    metrics[stage] = {
      medianMs: median(stageSamples.map((sample) => sample.durationMs)),
      medianElementCount: median(stageSamples.map((sample) => sample.elementCount)),
      medianRowCount: median(stageSamples.map((sample) => sample.rowCount)),
      medianDuplicateIdCount: median(stageSamples.map((sample) => sample.duplicateIdCount)),
      medianUsedJSHeapBytes: heap.every((value) => value !== null) ? median(heap) : null,
      samples: stageSamples
    };
  }
  return { count, metrics };
}

async function legacyOneRun(browser, count) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  try {
    await page.goto("data:text/html,<html><body></body></html>");
    for (const resource of [
      "../v1/lib/jquery-3.7.1.min.js",
      "../v1/dist/natural.js.es6.min.js",
      "../v1/dist/natural.config.js"
    ]) {
      await page.addScriptTag({ path: fileURLToPath(new URL(resource, import.meta.url)) });
    }
    return await page.evaluate(async (size) => {
      const N = window.N;
      const fields = Array.from({ length: 10 }, (_, index) => "f" + index);
      const makeData = (version) => Array.from({ length: size }, (_, index) => {
        const text = "row-" + String(index + 1).padStart(4, "0") + "-v" + version;
        return Object.fromEntries(fields.map((field) => [field, text]));
      });
      const data = makeData(0);
      const replacement = makeData(1);
      const table = document.createElement("table");
      table.innerHTML = "<thead><tr>" +
        fields.map((field) => '<th scope="col">' + field + "</th>").join("") +
        "</tr></thead><tbody><tr>" +
        fields.map((field) => '<td id="' + field + '"></td>').join("") +
        "</tr></tbody>";
      document.body.append(table);
      let completed;
      let grid;
      const options = {
        context: N(table),
        height: 0,
        createRowDelay: 0,
        sortable: true,
        onBind() { completed?.(); }
      };

      function inspect(durationMs) {
        const seen = new Set();
        let duplicateIdCount = 0;
        for (const element of table.querySelectorAll("[id]")) {
          if (seen.has(element.id)) duplicateIdCount++;
          else seen.add(element.id);
        }
        return {
          durationMs,
          elementCount: table.querySelectorAll("*").length,
          rowCount: table.querySelectorAll("tbody tr").length,
          duplicateIdCount,
          usedJSHeapBytes: performance.memory?.usedJSHeapSize ?? null
        };
      }

      function check(first) {
        if (table.querySelectorAll("tbody tr").length !== size ||
          table.tBodies[0]?.rows[0]?.cells[0]?.textContent !== first) {
          throw new Error("1.x Grid did not finish the expected render.");
        }
      }

      async function timedBind(action, first) {
        let timeout;
        const ready = new Promise((resolve, reject) => {
          completed = resolve;
          timeout = setTimeout(() => reject(new Error("1.x Grid onBind did not fire.")), 10_000);
        });
        const started = performance.now();
        try {
          action();
          await ready;
        } finally {
          clearTimeout(timeout);
          completed = undefined;
        }
        check(first);
        return inspect(performance.now() - started);
      }

      const initial = await timedBind(() => {
        grid = N(data).grid(options);
        grid.bind();
      }, data[0].f0);
      const rebind = await timedBind(() => grid.bind(replacement), replacement[0].f0);
      const editedAt = performance.now();
      grid.val(0, "f0", "edited-field");
      check("edited-field");
      const edit = inspect(performance.now() - editedAt);
      const header = grid.thead.find("th").first();
      await timedBind(() => header.trigger("click"), "edited-field");
      const sort = await timedBind(() => header.trigger("click"), replacement[size - 1].f0);
      return { initial, rebind, edit, sort };
    }, count);
  } finally {
    await page.close();
  }
}

async function main() {
  const options = argumentsFrom(process.argv.slice(2));
  const configFile = fileURLToPath(new URL("../examples/vite/vite.config.ts", import.meta.url));
  const server = await createServer({
    configFile,
    logLevel: "silent",
    server: { host: "127.0.0.1", port: 0, strictPort: false }
  });
  let browser;
  try {
    await server.listen();
    const baseURL = server.resolvedUrls?.local[0];
    if (!baseURL) throw new Error("Vite did not report a local URL.");

    const launchers = { chromium, firefox, webkit };
    browser = await launchers[options.browser].launch({
      headless: true,
      ...(options.browser === "chromium" ? { args: ["--enable-precise-memory-info"] } : {})
    });
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    await page.goto(new URL("benchmark.html", baseURL).href);
    await page.waitForFunction(() => typeof window.runM4Benchmark === "function");
    const userAgent = await page.evaluate(() => navigator.userAgent);
    const scenarios = [];
    for (const count of counts) {
      for (const kind of kinds) {
        const samples = await page.evaluate(
          (input) => window.runM4Benchmark(input),
          { count, kind, runs: options.runs, warmup: options.warmup }
        );
        scenarios.push(summarize(count, kind, samples));
      }
    }

    const nestedComparison = counts.map((count) => {
      const automatic = scenarios.find((item) => item.count === count && item.kind === "nested-auto");
      const explicit = scenarios.find((item) => item.count === count && item.kind === "nested-explicit");
      return {
        count,
        initialMedianDifferenceMs: automatic.metrics.initial.medianMs - explicit.metrics.initial.medianMs,
        rebindMedianDifferenceMs: automatic.metrics.rebind.medianMs - explicit.metrics.rebind.medianMs
      };
    });

    const legacyScenarios = [];
    for (const count of counts) {
      const samples = [];
      for (let index = 0; index < options.warmup + options.runs; index++) {
        const sample = await legacyOneRun(browser, count);
        if (index >= options.warmup) samples.push(sample);
      }
      legacyScenarios.push(summarizeLegacy(count, samples));
    }

    return {
      schema,
      status: "ok",
      timestamp: new Date().toISOString(),
      environment: {
        platform: process.platform,
        architecture: process.arch,
        cpuModel: os.cpus()[0]?.model ?? null,
        logicalCpuCount: os.cpus().length,
        browser: options.browser,
        browserVersion: browser.version(),
        userAgent,
        mode: "Vite development server, headless Playwright"
      },
      method: {
        counts,
        kinds,
        runs: options.runs,
        warmup: options.warmup,
        columns: 10,
        initial: "Rows created before timing; bindGrid and completed DOM rendering timed.",
        rebind: "Rows.replace and completed DOM rendering timed.",
        edit: "Rows.set of one visible field and completed DOM update timed.",
        sort: "Grid.setSort descending and completed DOM reorder timed.",
        filter: "Grid.setFilter to even rows and completed DOM update timed.",
        dispose: "Grid.dispose timed; Rows.dispose and host cleanup excluded.",
        nestedExplicit: "Same Grid and data; application scans rendered rows and fills each Select with DOM APIs, caching option-array identity. This rendering comparison does not implement typed user selection.",
        memory: "usedJSHeapBytes is an instantaneous browser value where exposed; garbage collection is not controlled."
      },
      scenarios,
      nestedComparison,
      legacyComparison: {
        status: "measured-with-limits",
        method: "Preserved jQuery 3.7.1, natural.js.es6.min.js, and natural.config.js; one fresh page per run; height 0 and createRowDelay 0; constructor and bind through onBind completion; ten text fields; second sortable header click for descending order.",
        sharedStages: ["initial", "rebind", "edit", "sort"],
        scenarios: legacyScenarios,
        exclusions: {
          filter: "1.x filtering replaces Grid's data wrapper with visible rows, while 2.0 keeps one Rows store and filters presentation only. A timed filter would test different data ownership.",
          dispose: "1.x Grid has no per-instance dispose method equivalent to GridHandle.dispose; global garbage collection is a different operation.",
          nestedSelect: "1.x Select receives its option list separately and does not bind a row-local nested array automatically."
        },
        caveats: [
          "1.x clones a tbody and Form per row, requiring duplicate field IDs; 2.0 keeps one tbody and ID-free row templates.",
          "1.x rebind accepts application data without the immutable deep clone and change tracking performed by 2.0 Rows.replace.",
          "1.x sort measures a header click and rebind after an unmeasured ascending click; 2.0 sort measures setSort on existing rows.",
          "Only shared end-to-end UI stages are directly timed; results are architecture-level evidence, not isolated algorithm scores."
        ]
      }
    };
  } finally {
    await browser?.close();
    await server.close();
  }
}

try {
  process.stdout.write(`${JSON.stringify(await main())}\n`);
} catch (error) {
  process.stdout.write(`${JSON.stringify({ schema, status: "error", message: String(error) })}\n`);
  process.exitCode = 1;
}
