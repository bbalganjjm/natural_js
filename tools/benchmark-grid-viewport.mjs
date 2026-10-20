// SPDX-License-Identifier: Apache-2.0
// Run after npm run build; stdout is the complete reproducible JSON result.
import assert from "node:assert/strict";
import os from "node:os";
import { fileURLToPath } from "node:url";
import { chromium, firefox, webkit } from "@playwright/test";
import { createServer } from "vite";

const schema = "natural-js-grid-viewport-benchmark/v1";
const count = 5000;
const stages = ["initial", "reveal", "scroll", "columns", "paste", "move", "dispose"];
const budgets = { flat: { initial: 120, reveal: 100, scroll: 100, columns: 150, paste: 2000, move: 100 },
  nested: { initial: 180, reveal: 100, scroll: 100, columns: 150, paste: 2000, move: 100 },
  blocks: { initial: 35, reveal: 100, scroll: 120, columns: 100, paste: 85, move: 100 } };
const cleanupBudget = { nodes: 8, jsEventListeners: 0, documents: 0 };
function argumentsFrom(args) {
  const values = new Map();
  for (const arg of args) {
    const match = /^--(browser|runs|warmup)=(.+)$/.exec(arg);
    if (!match || values.has(match[1])) throw new Error(`Unknown or repeated argument: ${arg}`);
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
  const sorted = [...values].sort((a, b) => a - b), middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

async function main() {
  const options = argumentsFrom(process.argv.slice(2));
  const workspace = fileURLToPath(new URL("..", import.meta.url));
  const source = relative => "/@fs/" + fileURLToPath(new URL(relative, import.meta.url)).replaceAll("\\", "/");
  const modules = { ui: source("../build/ui/index.js"), data: source("../build/data/index.js") };
  const server = await createServer({ root: workspace, configFile: false, logLevel: "silent",
    server: { host: "127.0.0.1", port: 0, strictPort: false, fs: { allow: [workspace] } },
    plugins: [{ name: "viewport-benchmark-page", configureServer(vite) {
      vite.middlewares.use((request, response, next) => {
        if (request.url !== "/__viewport-benchmark") return next();
        response.setHeader("Content-Type", "text/html; charset=utf-8");
        response.end('<!doctype html><html lang="en"><head><title>Grid viewport benchmark</title><link rel="icon" href="data:,"></head><body><main></main></body></html>');
      });
    } }] });
  let browser;
  try {
    await server.listen();
    const address = server.httpServer.address(); assert(address && typeof address !== "string");
    browser = await ({ chromium, firefox, webkit })[options.browser].launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    const errors = []; page.on("pageerror", error => errors.push(error.message));
    await page.goto(`http://127.0.0.1:${address.port}/__viewport-benchmark`);
    await page.evaluate(async input => {
      window.viewportBenchmarkModules = { ...await import(input.ui), ...await import(input.data) };
    }, modules);
    const cdp = options.browser === "chromium" ? await page.context().newCDPSession(page) : null;
    const counters = async () => {
      if (!cdp) return null;
      await cdp.send("HeapProfiler.collectGarbage");
      return cdp.send("Memory.getDOMCounters");
    };
    const scenarios = [];
    for (const kind of ["flat", "nested", "blocks"]) {
      const samples = [];
      for (let run = 0; run < options.runs + options.warmup; run++) {
        const beforeFixture = await counters();
        const sample = await page.evaluate(async ({ kind, count }) => {
          const { bindGrid, createRows } = window.viewportBenchmarkModules;
          const assert = (condition, message) => { if (!condition) throw new Error(message); };
          const blocks = kind === "blocks";
          const physicalRows = blocks ? 2 : 1;
          const pasteCount = blocks ? 100 : 1000;
          const root = document.createElement("section");
          root.setAttribute("aria-label", "Benchmark employees");
          root.tabIndex = 0; root.style.cssText = "height:400px;width:700px;overflow:auto;";
          const authoredRoot = root.getAttribute("style");
          root.innerHTML = blocks ? `<table><caption>Five thousand two-row employee records with adjacent group merges</caption>
            <thead><tr><th scope="col" data-column="person">Group</th><th scope="col" data-column="score">Score</th><th scope="col" data-column="detail">Detail</th></tr></thead>
            <tbody data-row-template><tr><th scope="rowgroup" data-column="person" rowspan="2" data-merge="group"><span data-field="group"></span></th>
              <td data-column="score"><span data-field="name"></span><label>Score <input data-field="score" inputmode="numeric" required></label><output data-error-for="score"></output></td>
              <td data-column="detail"><button type="button" data-select-row>Select record</button></td></tr>
            <tr><td data-column="score">Employee note</td><td data-column="detail"><label>Note <input data-field="note" required></label></td></tr></tbody></table>`
            : `<table><caption>Five thousand variable-height employee rows</caption>
            <thead><tr><th scope="col" data-column="person">Employee</th><th scope="col" data-column="score">Score</th><th scope="col" data-column="detail">Detail</th></tr></thead>
            <tbody><tr data-row-template><th scope="row" data-column="person"><span data-field="name"></span>
              <button type="button" data-select-row>Select row</button></th>
            <td data-column="score"><label>Score <input data-field="${kind === "nested" ? "profile.score" : "score"}" inputmode="numeric" required></label>
              <output data-error-for="${kind === "nested" ? "profile.score" : "score"}"></output></td>
            <td data-column="detail">${kind === "nested" ? '<label>Choice <select data-field="profile.choice" data-options="profile.choices" data-option-label="label" data-option-value="value"></select></label>'
              : '<label>Note <input data-field="note" required></label>'}</td></tr></tbody></table>`;
          const style = document.createElement("style");
          style.textContent = `section[aria-label="Benchmark employees"] table {width:680px;table-layout:fixed;border-collapse:collapse;font:14px/20px sans-serif}
            section[aria-label="Benchmark employees"] th,section[aria-label="Benchmark employees"] td {padding:4px;text-align:left;vertical-align:top;overflow-wrap:anywhere}
            section[aria-label="Benchmark employees"] tbody tr:not([aria-hidden="true"]) {height:${blocks ? 40 : 48}px}
            section[aria-label="Benchmark employees"] input,section[aria-label="Benchmark employees"] select {width:100px;min-height:28px}
            section[aria-label="Benchmark employees"] button {display:block;min-height:28px}
            section[aria-label="Benchmark employees"] output {display:block} section[aria-label="Benchmark employees"] output:empty {display:none}`;
          document.head.append(style); document.querySelector("main").append(root);
          const table = root.querySelector("table"); const original = table.outerHTML;
          const data = Array.from({ length: count }, (_, index) => {
            const name = `Employee ${index + 1}` + (index % 7 === 0 ? " with an authored name wrapping over several lines in its row header" : "");
            return kind === "nested" ? { name, profile: { score: index, choice: 10,
              choices: [{ label: "Ten", value: 10 }, { label: "Twenty", value: 20 }] } }
              : { name, score: index, note: `Note ${index + 1}`, ...(blocks ? { group: `Group ${Math.floor(index / 25)}` } : {}) };
          });
          const rows = createRows(data); const ids = rows.entries().map(row => row.id);
          const scoreField = kind === "nested" ? "profile.score" : "score";
          const paste = Array.from({ length: pasteCount }, (_, index) => `${index + 100}\t${kind === "nested" ? "20" : `Pasted ${index + 1}`}`).join("\n");
          const events = []; const stop = rows.subscribe(event => events.push(event));
          let grid; let maximumMounted = 0; let maximumElements = 0;
          const mounted = () => table.tBodies[0].hasAttribute("data-row-template") && !table.hasAttribute("aria-rowcount") ? []
            : [...table.tBodies[0].rows].filter(row => row.getAttribute("aria-hidden") !== "true" && !row.hasAttribute("data-row-template"));
          const inspect = durationMs => {
            const records = mounted(); const elementCount = table.querySelectorAll("*").length;
            const walker = document.createTreeWalker(table, NodeFilter.SHOW_ALL); let nodeCount = 1;
            while (walker.nextNode()) nodeCount++;
            maximumMounted = Math.max(maximumMounted, records.length); maximumElements = Math.max(maximumElements, elementCount);
            assert(blocks ? records.length <= 64 : records.length < 80, `The ${kind} fixture mounted ${records.length} physical rows.`);
            const bounds = root.getBoundingClientRect();
            const top = bounds.top + root.clientTop, bottom = top + root.clientHeight;
            const intersecting = records.filter(row => {
              const rect = row.getBoundingClientRect();
              return rect.height > 0 && rect.bottom > top && rect.top < bottom;
            }).map(row => Number(row.getAttribute("aria-rowindex")));
            const measuredHeightRange = records.length ? [Math.min(...records.map(row => row.getBoundingClientRect().height)),
              Math.max(...records.map(row => row.getBoundingClientRect().height))] : [];
            if (records.length) {
              assert(intersecting.length > 0, "Mounted data rows must actually intersect the scroll viewport.");
              assert(measuredHeightRange[0] < measuredHeightRange[1], "The fixture must contain different measured row heights.");
            }
            let recordGeometry;
            let nativeMerges;
            if (blocks) {
              const groups = new Map();
              for (const row of records) {
                const index = Math.floor((Number(row.getAttribute("aria-rowindex")) - 2) / physicalRows);
                if (!groups.has(index)) groups.set(index, []);
                groups.get(index).push(row);
              }
              recordGeometry = [...groups].map(([index, group]) => {
                assert(group.length === physicalRows, "A mounted authored record must keep both physical rows.");
                const rects = group.map(row => row.getBoundingClientRect());
                return { index, top: rects[0].top, bottom: rects.at(-1).bottom,
                  height: rects.at(-1).bottom - rects[0].top, rowHeights: rects.map(rect => rect.height) };
              });
              nativeMerges = [...table.querySelectorAll("tbody [data-merge]")].filter(cell => cell.rowSpan > physicalRows).map(cell => {
                const physical = [...table.tBodies[0].rows];
                const start = physical.indexOf(cell.parentElement);
                const segment = physical.slice(start, start + cell.rowSpan);
                assert(segment.length === cell.rowSpan && segment.every(row => !row.hasAttribute("data-grid-spacer")),
                  "A native merge cannot cross a viewport spacer or escape its mounted records.");
                return { rowIndex: Number(cell.parentElement.getAttribute("aria-rowindex")), rowSpan: cell.rowSpan,
                  height: cell.getBoundingClientRect().height };
              });
              if (records.length) assert(recordGeometry.every(group => group.height > 0), "Mounted record blocks need positive native height.");
            }
            return { durationMs, mountedRowCount: records.length, logicalRowCount: rows.entries().length,
              elementCount, nodeCount, spacerCount: table.querySelectorAll('tbody tr[aria-hidden="true"]').length,
              scrollTop: root.scrollTop, intersectingRowIndexes: intersecting, measuredHeightRange,
              ...(blocks ? { mountedLogicalRowCount: recordGeometry.length, recordGeometry, nativeMerges } : {}) };
          };
          const geometry = () => [root.scrollTop.toFixed(2), root.scrollHeight, table.getAttribute("aria-rowcount"),
            ...mounted().map(row => `${row.getAttribute("aria-rowindex")}:${row.getBoundingClientRect().top.toFixed(2)}:${row.getBoundingClientRect().height.toFixed(2)}`)].join("|");
          const settled = async () => {
            let previous = geometry(), stable = 0;
            for (let frame = 0; frame < 15; frame++) {
              await new Promise(resolve => requestAnimationFrame(resolve));
              const next = geometry(); stable = next === previous ? stable + 1 : 0; previous = next;
              if (stable >= 2) return;
            }
            throw new Error("Viewport geometry did not settle within fifteen animation frames.");
          };
          const timed = async action => {
            const start = performance.now(); action(); await settled(); return inspect(performance.now() - start);
          };
          const initial = await timed(() => {
            grid = bindGrid(table, { rows, viewport: { root, estimate: blocks ? 80 : 48, overscan: 3 }, paste: true, multiple: true,
              columns: [{ key: "person", width: 240 }, { key: "score", width: 220 }, { key: "detail", width: 220 }],
              parse: { [scoreField]: input => /^\d+$/.test(input) ? Number(input) : undefined } });
          });
          assert(table.getAttribute("aria-rowcount") === String(count * physicalRows + 1), "Logical native table count differs.");
          if (blocks) assert(initial.nativeMerges.length > 0, "The authored block benchmark must exercise adjacent native merges.");
          const input = mounted()[0].querySelector("input"); input.focus({ preventScroll: true });
          input.value = "-"; input.setSelectionRange(0, 1); input.dispatchEvent(new Event("input", { bubbles: true }));
          assert(!grid.validate(ids[0]).valid, "The benchmark draft must remain invalid outside Rows.");
          const reveal = await timed(() => grid.reveal(ids[2499]));
          const target = () => mounted().find(row => Number(row.getAttribute("aria-rowindex")) === 2499 * physicalRows + 2);
          assert(target(), "Reveal must mount the requested logical row.");
          const targetStart = target().getBoundingClientRect();
          const targetEnd = blocks ? target().nextElementSibling.getBoundingClientRect() : targetStart;
          const revealed = { top: targetStart.top, bottom: targetEnd.bottom, height: targetEnd.bottom - targetStart.top };
          const region = root.getBoundingClientRect();
          const visibleTop = region.top + root.clientTop, visibleBottom = visibleTop + root.clientHeight;
          assert(revealed.bottom > visibleTop && revealed.top < visibleBottom &&
            (revealed.height > root.clientHeight || revealed.top >= visibleTop - 1 && revealed.bottom <= visibleBottom + 1),
          "Reveal must place the requested row inside the usable viewport, not merely mount it.");
          assert(document.activeElement === input && input.isConnected && input.value === "-" && input.selectionStart === 0 && input.selectionEnd === 1,
            "A distant focus pin must preserve the editor node, draft and caret.");
          const scroll = await timed(() => { root.scrollTop += 320; root.dispatchEvent(new Event("scroll")); });
          assert(Math.min(...scroll.intersectingRowIndexes) > Math.min(...reveal.intersectingRowIndexes),
            "A forward scroll must advance the intersecting logical window.");
          const columns = await timed(() => grid.setColumns([...grid.columns()].reverse().map(column => ({ ...column,
            width: column.key === "person" ? 180 : 250 }))));
          // Restore clipboard field order before timing its independent operation.
          grid.setColumns([...grid.columns()].reverse()); await settled();
          let pasted;
          const pasteMetric = await timed(() => { pasted = grid.paste(paste, { id: ids[1000], field: scoreField }); });
          assert(pasted.valid && events.length === 1 && events[0].type === "setMany" && events[0].ids.length === pasteCount,
            `Offscreen paste must validate and publish exactly one ${pasteCount}-record batch.`);
          assert(rows.entries().every((row, index) => row.id === ids[index]), "Viewport operations must preserve every RowId.");
          const last = rows.get(ids[999 + pasteCount]).value;
          assert((kind === "nested" ? last.profile.score : last.score) === 99 + pasteCount, "Last offscreen score differs.");
          assert(kind === "nested" ? last.profile.choice === 20 : last.note === `Pasted ${pasteCount}`, "Last offscreen detail lost its raw type or value.");
          assert(document.activeElement === input && input.value === "-", "Unrelated invalid draft must survive offscreen paste.");
          grid.checkAll(true, "visible"); assert(grid.checkedIds().length === count, "Mounted window cannot narrow logical checks.");
          const moved = rows.get(ids[count - 1]);
          const move = await timed(() => rows.move(moved.id, ids[2499]));
          assert(rows.entries()[2499].id === moved.id && rows.get(moved.id) === moved,
            "Moving before a stable target must change order while preserving the snapshot.");
          assert(events.length === 2 && events[1].type === "move" && events[1].id === moved.id,
            "Moving a row must publish exactly one coherent move event.");
          assert(document.activeElement === input && input.value === "-" && input.selectionStart === 0 && input.selectionEnd === 1,
            "A moved viewport window must preserve the unrelated focused draft and caret.");
          const metrics = { initial, reveal, scroll, columns, paste: pasteMetric, move };
          window.viewportBenchmark = { root, table, rows, grid, style, original, authoredRoot, settled, inspect, metrics, stop,
            get maximumMounted() { return maximumMounted; }, get maximumElements() { return maximumElements; } };
          return { ...metrics };
        }, { kind, count });
        const beforeCycles = await counters();
        const cycles = await page.evaluate(async () => {
          const h = window.viewportBenchmark;
          const windows = [];
          for (let index = 0; index < 20; index++) {
            const requestedScrollTop = h.root.scrollHeight * (index % 2 ? .12 : .87);
            h.root.scrollTop = requestedScrollTop;
            h.root.dispatchEvent(new Event("scroll")); await h.settled();
            const metric = h.inspect(0);
            windows.push({ requestedScrollTop, scrollTop: metric.scrollTop, intersectingRowIndexes: metric.intersectingRowIndexes,
              ...(metric.recordGeometry ? { recordGeometry: metric.recordGeometry, nativeMerges: metric.nativeMerges } : {}) });
          }
          return { count: 20, maximumMounted: h.maximumMounted, maximumElements: h.maximumElements, windows };
        });
        const afterCycles = await counters();
        const disposed = await page.evaluate(async () => {
          const h = window.viewportBenchmark; h.root.dispatchEvent(new Event("scroll"));
          const start = performance.now(); h.grid.dispose(); await h.settled(); const metric = h.inspect(performance.now() - start);
          if (h.table.outerHTML !== h.original || h.root.getAttribute("style") !== h.authoredRoot ||
              h.table.querySelectorAll("[data-row-template]").length !== 1 || h.table.querySelector('tr[aria-hidden="true"]')) {
            throw new Error("Disposal did not restore the exact authored table, root style and template.");
          }
          let lateMutations = 0;
          const observer = new MutationObserver(records => { lateMutations += records.length; });
          observer.observe(h.root, { attributes: true, childList: true, subtree: true, characterData: true });
          h.root.dispatchEvent(new Event("scroll"));
          await h.settled(); await new Promise(resolve => setTimeout(resolve, 0));
          lateMutations += observer.takeRecords().length; observer.disconnect();
          if (lateMutations || h.table.outerHTML !== h.original || h.root.getAttribute("style") !== h.authoredRoot) {
            throw new Error("Late scroll/measurement/frame work changed disposed markup or root style.");
          }
          h.stop(); h.rows.dispose(); h.root.remove(); h.style.remove(); delete window.viewportBenchmark;
          return { metric, exactAuthoredMarkup: true, quietAfterLateEvents: true, observedLateMutations: lateMutations };
        });
        const beforeFocusRelease = await counters();
        await page.evaluate(async () => {
          const outside = document.querySelector("main");
          const authoredTabIndex = outside.getAttribute("tabindex");
          outside.tabIndex = -1; outside.focus({ preventScroll: true });
          if (authoredTabIndex === null) outside.removeAttribute("tabindex");
          else outside.setAttribute("tabindex", authoredTabIndex);
          document.getSelection()?.removeAllRanges();
          await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
        });
        const afterDispose = await counters();
        sample.dispose = disposed.metric;
        sample.cycling = cycles;
        sample.cleanup = { exactAuthoredMarkup: disposed.exactAuthoredMarkup, quietAfterLateEvents: disposed.quietAfterLateEvents,
          observedLateMutations: disposed.observedLateMutations };
        sample.domCounters = { beforeFixture, beforeCycles, afterCycles, beforeFocusRelease, afterDispose };
        if (cdp) {
          assert(afterCycles.nodes <= beforeCycles.nodes + cycles.maximumElements * 2,
            "Post-GC DOM node growth exceeds two live viewport windows after twenty cycles.");
          assert(afterCycles.jsEventListeners <= beforeCycles.jsEventListeners + 20,
            "Post-GC event listener growth exceeds twenty after repeated scrolling.");
          for (const [counter, allowance] of Object.entries(cleanupBudget)) {
            assert(afterDispose[counter] <= beforeFixture[counter] + allowance,
              `Post-disposal ${counter} ${afterDispose[counter]} exceed pre-fixture ${beforeFixture[counter]} plus ${allowance}; counters=${JSON.stringify({ beforeFixture, beforeCycles, afterCycles, beforeFocusRelease, afterDispose })}.`);
          }
        }
        if (run >= options.warmup) samples.push(sample);
      }
      scenarios.push({ count, kind, metrics: Object.fromEntries(stages.map(stage => [stage, {
        medianMs: median(samples.map(sample => sample[stage].durationMs)),
        medianMountedRowCount: median(samples.map(sample => sample[stage].mountedRowCount)),
        medianElementCount: median(samples.map(sample => sample[stage].elementCount)),
        medianNodeCount: median(samples.map(sample => sample[stage].nodeCount)),
        samples: samples.map(sample => sample[stage])
      }])), samples });
    }
    assert.deepEqual(errors, [], "The benchmark produced browser errors.");
    const failures = options.browser === "chromium" ? scenarios.flatMap(scenario => Object.entries(budgets[scenario.kind])
      .filter(([stage, limit]) => scenario.metrics[stage].medianMs > limit)
      .map(([stage, limit]) => ({ kind: scenario.kind, stage, medianMs: scenario.metrics[stage].medianMs, budgetMs: limit }))) : [];
    return { schema, status: failures.length ? "budget-failed" : "ok", timestamp: new Date().toISOString(),
      environment: { platform: process.platform, architecture: process.arch, cpuModel: os.cpus()[0]?.model ?? null,
        logicalCpuCount: os.cpus().length, browser: options.browser, browserVersion: browser.version(),
        userAgent: await page.evaluate(() => navigator.userAgent), mode: "Isolated Vite development server, headless Playwright" },
      method: { count, kinds: ["flat", "nested", "blocks"], runs: options.runs, warmup: options.warmup, rootHeight: 400,
        estimate: 48, overscan: 3, mountedBound: 80,
        blocks: { physicalRowsPerRecord: 2, estimate: 80, mountedBound: 64, pasteRecords: 100,
          merge: "Adjacent scalar group keys span complete two-row records; each native merge stays inside a consecutive mounted segment." },
        timing: "Rows and authored HTML prepared outside timing. Each operation includes two successive stable animation-frame geometry observations; fail after fifteen frames.",
        focus: "One invalid draft editor remains pinned with its exact node and caret while a distant variable-height window renders.",
        paste: "Flat/nested paste one thousand offscreen records; blocks paste one hundred. Each changes two fields in one atomic event; nested detail uses numeric Select values.",
        move: "Move the last of five thousand stored rows before a stable row near the current window; one event, unchanged snapshot and pinned draft/caret. Includes settled DOM with a 100ms same-host Chromium median budget.",
        geometry: "Every live checkpoint requires intersecting mounted data rows and different measured row heights; reveal verifies the complete requested record rectangle and forward scroll advances logical intersection. Blocks record native physical-row heights, record bounds and merge spans; twenty cycle windows record actual intersections.",
        cleanup: "Exact authored markup/style after disposal, then observe zero mutations across late scroll and stable frames; this observes quiet work, not a direct cancelAnimationFrame call.",
        memory: cdp ? "Chromium CDP forces GC before DOM counters; twenty-cycle growth remains bounded by two viewport element counts and twenty listeners. After detaching the fixture, record native focus/selection retention, release it by focusing the existing external main and clearing document ranges, wait two frames, then require the stated pre-fixture cleanup budget. No JavaScript heap-retention claim."
          : "CDP DOM counters unavailable for this engine; no retained-node, listener or heap claim.",
        cleanupBudget: cdp ? cleanupBudget : null,
        budgets: "Host-relative Chromium medians declared before measurement; other engines report samples without applying Chromium thresholds." },
      budgets, failures, scenarios };
  } finally {
    await browser?.close(); await server.close();
  }
}

try {
  const result = await main(); process.stdout.write(JSON.stringify(result) + "\n");
  if (result.status !== "ok") process.exitCode = 1;
} catch (error) {
  process.stdout.write(JSON.stringify({ schema, status: "error", message: String(error), stack: error.stack }) + "\n");
  process.exitCode = 1;
}
