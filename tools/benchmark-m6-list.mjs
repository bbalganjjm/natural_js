// SPDX-License-Identifier: Apache-2.0
// Reproducible M6 List + Pagination browser benchmark.
// node tools/benchmark-m6-list.mjs > docs/implementation/evidence/m6-list-chromium.json
import os from "node:os";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";
import { createServer } from "vite";

const schema = "natural-js-m6-list-benchmark/v1";
const counts = [100, 1000];
const stages = ["initial", "pageStart", "pageNext", "pageBack", "dispose"];
const runs = 5;
const warmup = 2;

function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}

function summarize(count, samples) {
  const metrics = {};
  for (const stage of stages) {
    const values = samples.map(sample => sample[stage]);
    metrics[stage] = {
      medianMs: median(values.map(value => value.durationMs)),
      medianElementCount: median(values.map(value => value.elementCount)),
      medianVisibleRows: median(values.map(value => value.visibleRows)),
      medianDuplicateIdCount: median(values.map(value => value.duplicateIdCount)),
      samples: values
    };
  }
  return { count, metrics };
}

async function main() {
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
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    await page.goto(new URL("benchmark.html", baseURL).href);
    const modules = {
      data: fileURLToPath(new URL("../src/data/index.ts", import.meta.url)).replaceAll("\\", "/"),
      list: fileURLToPath(new URL("../src/ui/list.ts", import.meta.url)).replaceAll("\\", "/"),
      pagination: fileURLToPath(new URL("../src/ui/pagination.ts", import.meta.url)).replaceAll("\\", "/")
    };
    const scenarios = [];
    for (const count of counts) {
      const samples = await page.evaluate(async ({ modules, count, runs, warmup }) => {
        const [{ createRows }, { bindList }, { bindPagination }] = await Promise.all([
          import(`/@fs/${modules.data}`),
          import(`/@fs/${modules.list}`),
          import(`/@fs/${modules.pagination}`)
        ]);
        const makeData = () => Array.from({ length: count }, (_, index) => {
          const row = {};
          for (let field = 0; field < 10; field++) row[`f${field}`] = `row-${index + 1}-field-${field}`;
          return row;
        });
        const oneRun = () => {
          const host = document.createElement("section");
          const fields = Array.from({ length: 10 }, (_, index) => `<span data-field="f${index}"></span>`).join("");
          host.innerHTML = `<ul><li data-row-template><button type="button" data-select-row>Choose</button>${fields}</li><li data-empty hidden>No rows</li></ul><nav aria-label="Pages"><button type="button" data-page-prev>Previous</button><button type="button" data-page-template><span data-page-number></span></button><button type="button" data-page-next>Next</button><output data-page-status></output></nav>`;
          document.body.append(host);
          const root = host.querySelector("ul");
          const nav = host.querySelector("nav");
          const rows = createRows(makeData());
          let list;
          let pagination;
          const inspect = durationMs => {
            const ids = [...document.querySelectorAll("[id]")].map(element => element.id);
            return {
              durationMs,
              elementCount: host.querySelectorAll("*").length,
              visibleRows: root.querySelectorAll("li:not([data-row-template]):not([data-empty])").length,
              duplicateIdCount: ids.length - new Set(ids).size
            };
          };
          const measure = action => {
            const started = performance.now();
            action();
            return inspect(performance.now() - started);
          };
          const requireRows = expected => {
            const actual = root.querySelectorAll("li:not([data-row-template]):not([data-empty])").length;
            if (actual !== expected) throw new Error(`Expected ${expected} visible rows, got ${actual}.`);
          };
          try {
            const result = {};
            result.initial = measure(() => { list = bindList(root, { rows }); });
            requireRows(count);
            result.pageStart = measure(() => {
              list.setPage({ page: 1, size: 25 });
              pagination = bindPagination(nav, {
                state: list.page(),
                onPage(request) {
                  list.setPage(request);
                  pagination.set(list.page());
                }
              });
            });
            requireRows(25);
            result.pageNext = measure(() => nav.querySelector("[data-page-next]").click());
            requireRows(25);
            if (list.page().page !== 2 || pagination.state().page !== 2) throw new Error("Next page did not settle.");
            result.pageBack = measure(() => nav.querySelector("[data-page-prev]").click());
            requireRows(25);
            if (list.page().page !== 1 || pagination.state().page !== 1) throw new Error("Previous page did not settle.");
            result.dispose = measure(() => { pagination.dispose(); list.dispose(); });
            if (root.querySelectorAll("[data-row-template]").length !== 1) throw new Error("List template was not restored.");
            return result;
          } finally {
            pagination?.dispose();
            list?.dispose();
            rows.dispose();
            host.remove();
          }
        };
        const output = [];
        for (let index = 0; index < warmup + runs; index++) {
          const sample = oneRun();
          if (index >= warmup) output.push(sample);
        }
        return output;
      }, { modules, count, runs, warmup });
      scenarios.push(summarize(count, samples));
    }
    return {
      schema,
      status: "ok",
      timestamp: new Date().toISOString(),
      environment: {
        platform: process.platform,
        architecture: process.arch,
        cpuModel: os.cpus()[0]?.model ?? null,
        browser: "chromium",
        browserVersion: browser.version(),
        mode: "Vite development server, headless Playwright"
      },
      method: {
        counts, runs, warmup, fields: 10, pageSize: 25,
        initial: "Rows are created before timing. bindList immediately renders all rows.",
        pageStart: "List.setPage(1, 25) and bindPagination are timed together after full bind.",
        pageNext: "Click authored Next button; callback updates List and controlled Pagination. Row records were already created by the full initial bind.",
        pageBack: "Click authored Previous button; callback updates List and Pagination.",
        dispose: "Dispose Pagination and List. Rows.dispose and host removal are excluded."
      },
      scenarios
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
