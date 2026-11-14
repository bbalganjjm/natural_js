import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { dir, required, sha, read, json, normalized, git, reference, verifyRef, verifyProtection,
  unchangedEvidence, inventory, tree, output, tests, parentCollection, retainedProof, browserProof, archive, performance } from "./stage-metadata.mjs";

const self = "node_modules/.cache/m33-independent-audit.mjs", stem = "node_modules/.cache/m33-independent-audit";
let destination = stem + ".log";
for (let n = 2; fs.existsSync(destination); n++) destination = stem + "-" + n + ".log";
const baseline = "86be062fcbc30015a3671d629ef45df6779aeae8";
const report = { kind: "independent_recorded_byte_audit", stage: "M3.3", started: new Date().toISOString(), baseline,
  helper: reference(self), limits: ["Only existing recorded bytes are read; no compiler, browser, benchmark, model, or project checker is invoked.",
    "Shared independently reviewed metadata functions decode archive, performance, and browser data. Actual commands, attempts, source maps, additions, and parent protection are checked below.",
    "Original failures retain zero final credit. No causal explanation, framework fix, omission, whole-family closure, release, Safari, manual assistive-technology, or token result is inferred."] };

try {
  const [receiptPath, expectedHash] = process.argv.slice(2);
  assert.equal(process.argv.length, 4); assert(/^[0-9a-f]{64}$/.test(expectedHash ?? ""));
  assert.equal(sha(read(receiptPath)), expectedHash, "Announced immutable M3.3 receipt");
  const receipt = json(receiptPath); assert.equal(receipt.schema, "natural-js-recorded-runtime/v1");
  assert.equal(receipt.stage, "M3.3"); assert.equal(receipt.prefix, "m33"); assert.equal(receipt.baseline_commit, baseline);
  report.receipt = { path: receiptPath, sha256: expectedHash, bytes: read(receiptPath).length };
  verifyRef(receipt.setup); const setup = json(receipt.setup.path);
  assert.equal(setup.stage, "M3.3"); assert.equal(setup.head, baseline); assert.equal(setup.baseline_commit, baseline);
  assert.equal(setup.working_parent, null, "Ordinary committed-parent mode is retained");
  verifyProtection(setup); unchangedEvidence(baseline, "m33");
  report.shared_read_only_metadata = reference("node_modules/.cache/stage-metadata.mjs");
  assert.equal(report.shared_read_only_metadata.sha256, setup.helpers.find(ref => /stage-metadata-/.test(ref.path)).sha256);
  verifyRef(setup.parent_receipt); assert.equal(setup.parent_receipt.path, dir + "/m32final-runtime-receipt.json");
  assert.equal(setup.parent_receipt.sha256, "03bc37761bd88d2a93852f6e570238a1195455c108935d02f61be11c8c09da30");
  const previous = json(setup.parent_receipt.path); assert.equal(previous.recorded_attempts, 22);
  assert.equal(previous.checks.unit.passed, 155); assert.equal(previous.checks.full_suites.chromium.passed, 876);
  for (const ref of [...previous.retained_files, ...previous.builder]) verifyRef(ref);
  const parentFiles = [];
  for (const name of fs.readdirSync(dir).filter(name => name.startsWith("m32final-"))) {
    const file = dir + "/" + name; parentFiles.push(...(fs.statSync(file).isDirectory() ? tree(file) : [reference(file)]));
  }
  const protectedParent = setup.protected_files.filter(ref => ref.path.startsWith(dir + "/m32final-"));
  assert.deepEqual(protectedParent.map(ref => ref.path).sort(), parentFiles.map(ref => ref.path).sort());
  for (const ref of protectedParent) { verifyRef(ref); assert.deepEqual(read(ref.path), git("show", baseline + ":" + ref.path), ref.path); }
  const attributes = reference(dir + "/.gitattributes"); assert.equal(attributes.sha256, "48747480eddba024928d03be9bf83dc579e5515768647507a767e8187a85c9ab");
  assert.deepEqual(read(attributes.path), Buffer.from("** -text\n")); assert.deepEqual(read(attributes.path), git("show", baseline + ":" + attributes.path));
  const attrPaths = [attributes.path, receiptPath];
  assert.deepEqual(git("check-attr", "-z", "text", "--", ...attrPaths).toString().split("\0"), [...attrPaths.flatMap(file => [file, "text", "unset"]), ""]);
  report.parent = { receipt: setup.parent_receipt, original_attempts: 22, exact_committed_parent_prefix_files: protectedParent.length,
    raw_git_attributes: attributes, scope: "Immediate parent M32final is committed. Its original M32 ancestors, native controls, failures, and 298-path bookkeeping snapshot retain their own immutable scope." };

  verifyRef(receipt.inputs); assert.equal(receipt.inputs.entries, 206);
  const files = inventory(), current = Object.fromEntries(files.map(file => [file, sha(normalized(read(file)))]));
  assert.deepEqual(Object.keys(json(receipt.inputs.path)), files); assert.deepEqual(json(receipt.inputs.path), current);
  const beforeInputs = json(previous.inputs.path);
  assert.deepEqual(files.filter(file => !Object.hasOwn(beforeInputs, file)), ["tests/browser/page-loading.spec.ts"]);
  assert.deepEqual(Object.keys(beforeInputs).filter(file => !Object.hasOwn(current, file)), []);
  const changed = files.filter(file => beforeInputs[file] !== current[file]);
  const approved = {
    "src/page/index.ts": "b8b00a8ac5ff4f2c383c0e11fa6b09256488b7b0544fc1b0cebb81df1a7150bf",
    "tests/browser/page-loading.spec.ts": "b6a280bafb74f842a5d825f490c900012f7e13d768b969f6f11e3b90fd9f227c",
    "tests/consumers/browser/main.js": "206d0e6ac9f6fd4ba0513c47b116d671ee46b0fce3c471ed8e731207c5038ee2",
    "tests/consumers/ts/check.ts": "d3f77eab9247a3012523ef9a1799a3f32878b23c6b4e784e4615ba864156dc44",
    "tools/check-packed-browser.mjs": "83009118fed084a6d18eb63e6b7dbc04ccca423da43588263a8e23a76cbfec2e"
  };
  assert.deepEqual(changed.sort(), Object.keys(approved).sort());
  for (const [file, expected] of Object.entries(approved)) assert.equal(current[file], expected, file);
  const snapshot = reference(dir + "/m33-html-loading.json"); assert.equal(snapshot.sha256, "c71f07290f1fa64d948b474b9aa7a90333c482577f6865c97f384df344f489b0");
  const source = json(snapshot.path); assert.deepEqual(source.independent_source_review.source_sha256, approved);
  assert.equal(source.runtime_receipt, null); assert.equal(source.independent_raw_review, "pending"); assert.equal(source.independent_documents, "pending");
  const sourceReview = reference(dir + "/m33-independent-source-review.json"); assert.equal(sourceReview.sha256, "360c6bdd08a90d598864db88eb0ceaf7b4b554818d396c75073d9e95fbbde23f");
  report.inputs = { ...receipt.inputs, added_paths: ["tests/browser/page-loading.spec.ts"], changed_paths: changed };
  report.source_review = { snapshot, connected_review: sourceReview, owned_paths: 5, source_sha256: approved,
    scope: "The pre-canonical source/focus snapshot keeps pending-at-capture fields unchanged; the final wrapper owns later acceptance." };

  verifyRef(receipt.records); const records = read(receipt.records.path).toString().trim().split(/\r?\n/).filter(Boolean).map(JSON.parse);
  assert.equal(records.length, receipt.recorded_attempts); const latest = new Map();
  for (const record of records) if (required.includes(record.label)) latest.set(record.label, record);
  assert.deepEqual([...latest.keys()].sort(), [...required].sort()); assert.equal(receipt.canonical_gates, 16);
  assert.deepEqual(Object.fromEntries(required.map(label => [label, latest.get(label)])), receipt.canonical);
  const other = records.filter(record => latest.get(record.label) !== record); assert.deepEqual(other, receipt.retained_other_attempts);
  const every = [], maps = new Map();
  function recorded(record, canonical) {
    every.push(record);
    for (const key of ["before", "after"]) { verifyRef(record[key]); assert.equal(record[key].entries, 206);
      const values = json(record[key].path); assert.deepEqual(Object.keys(values), files); maps.set(record[key].path, values); }
    assert.equal(record.sources_unchanged, record.before.sha256 === record.after.sha256); assert.equal(record.helpers_unchanged, true);
    if (record.stdout) { output(record.stdout); verifyRef(record.stderr); }
    for (const ref of [...record.helpers, ...(record.attachments ?? [])]) verifyRef(ref);
    if (canonical) { assert.equal(record.exit_code, 0); assert(!record.driver_signal && !record.close_signal && !record.spawn_error && !record.validation_error && !record.error);
      assert(record.sources_unchanged); assert.equal(record.before.sha256, receipt.inputs.sha256); assert.equal(record.after.sha256, receipt.inputs.sha256);
      for (const ref of record.helpers) assert.equal(sha(read(ref.source)), ref.sha256); }
    for (const child of record.children ?? []) recorded(child, canonical);
  }
  for (const record of records) recorded(record, latest.get(record.label) === record);
  for (const map of maps.values()) assert(files.filter(file => map[file] !== current[file]).every(file => file === "tests/browser/page-loading.spec.ts"));
  const leaf = records.flatMap(record => record.children ?? [record]).toSorted((a, b) => Date.parse(a.started) - Date.parse(b.started));
  let finish = -Infinity;
  for (const record of leaf) { assert(Date.parse(record.started) >= finish); finish = Date.parse(record.finished); assert(finish >= Date.parse(record.started)); }
  for (const ref of [...receipt.retained_files, ...receipt.builder]) verifyRef(ref);
  const starts = fs.readdirSync(dir).filter(name => name.startsWith("m33-") && name.endsWith("-start.json"));
  const results = fs.readdirSync(dir).filter(name => name.startsWith("m33-") && name.endsWith("-result.json"));
  assert.equal(starts.length, results.length); assert.equal(starts.length, every.length); assert.deepEqual(receipt.incomplete_command_starts, []);
  for (const name of starts) {
    const start = json(dir + "/" + name), result = json(dir + "/" + name.replace(/-start\.json$/, "-result.json"));
    const found = every.filter(record => record.label === result.label && record.started === result.started); assert.equal(found.length, 1);
    const actual = { ...found[0] }; delete actual.build_outputs; delete actual.artifact; assert.deepEqual(actual, result);
    for (const key of ["label", "started", "before", "helpers"]) assert.deepEqual(start[key], result[key]);
    if (start.args) assert.deepEqual(start.args, result.args);
    for (const file of [name, name.replace(/-start\.json$/, "-result.json")]) assert(receipt.retained_files.some(ref => ref.path === dir + "/" + file));
  }
  const text = record => output(record.stdout).toString("utf8").replace(/\u001b\[[0-9;]*[A-Za-z]/g, "");
  const failed = records.filter(record => record.exit_code !== 0);
  assert.deepEqual(failed.map(record => record.label), ["focused-chromium"]);
  const dev = other.filter(record => record.label.startsWith("focused-")), superseded = other.filter(record => required.includes(record.label));
  assert.equal(dev.length, 8); assert.equal(superseded.length, 0);
  report.attempts = { records: records.length, development: dev.length, superseded_canonical: superseded.length, latest_canonical: latest.size,
    leaf_commands: leaf.length, captured_start_result_pairs: starts.length,
    maps: [...maps].map(([file, values]) => ({ path: file, sha256: sha(read(file)), entries: Object.keys(values).length, current_differences: files.filter(key => values[key] !== current[key]) })) };
  const npm = path.join(path.dirname(process.execPath), "node_modules/npm/bin/npm-cli.js");
  assert.deepEqual(latest.get("build").args, ["node_modules/typescript/bin/tsc", "-p", "tsconfig.json"]);
  assert.deepEqual(latest.get("types").args, ["node_modules/typescript/bin/tsc", "-p", "tsconfig.json", "--noEmit"]);
  assert.deepEqual(latest.get("unit").args, ["node_modules/vitest/vitest.mjs", "run"]);
  const examples = files.filter(file => file.startsWith("examples/vite/") && file.endsWith(".ts") && !["vite.config.ts", "mock-server.ts"].includes(path.basename(file)));
  assert.deepEqual(latest.get("example-types").args, ["node_modules/typescript/bin/tsc", "--ignoreConfig", "--strict", "--noEmit", "--target", "ES2022", "--module", "NodeNext", "--moduleResolution", "NodeNext", "--lib", "ES2022,DOM", ...examples]);
  assert.deepEqual(latest.get("build").build_outputs, tree("build"));
  for (const record of [latest.get("unit"), ...dev.filter(record => record.label === "focused-unit")]) assert.match(text(record), /Tests\s+155 passed/);
  assert(!/\b\d+ (failed|skipped|todo)\b/.test(text(latest.get("unit")))); assert.deepEqual(receipt.checks.unit, { passed: 155 });
  report.browsers = []; let collection;
  for (const record of records.filter(record => record.children)) {
    const focused = record.label.startsWith("focused-"), engine = record.label.slice(8);
    assert(["chromium", "firefox", "webkit"].includes(engine)); assert.equal(record.shards, 1); assert.equal(record.workers, focused ? 1 : 2);
    assert.deepEqual(record.focus_paths, focused ? ["tests/browser/page-loading.spec.ts", "tests/browser/page.spec.ts", "tests/browser/popup.spec.ts", "tests/browser/tabs.spec.ts", "tests/browser/documents.spec.ts"] : []);
    assert.deepEqual(record.children.map(child => child.label), [record.label + "-list", record.label + "-run-1"]);
    const [listRecord, runRecord] = record.children, list = JSON.parse(output(listRecord.stdout)), run = JSON.parse(output(runRecord.stdout));
    for (const [index, child] of record.children.entries()) { const flag = child.args.find(arg => arg.startsWith("--output=")); assert(flag?.startsWith("--output=docs/implementation/evidence/m33-"));
      assert.deepEqual(child.args, ["node_modules/@playwright/test/cli.js", "test", "-c", "tests/playwright.config.ts", ...record.focus_paths,
        "--project=" + engine, "--workers=" + record.workers, "--retries=0", "--reporter=json", flag, ...(index ? [] : ["--list"])]);
      assert.deepEqual(child.environment, { PLAYWRIGHT_BROWSERS_PATH: engine === "firefox" ? path.resolve("node_modules/.cache/playwright-m6") : null }); }
    assert.equal(list.config.workers, record.workers); assert.equal(run.config.workers, record.workers); assert.equal(list.config.shard, null); assert.equal(run.config.shard, null);
    assert(tests(list).every(item => item.test.results.length === 0));
    const expected = focused ? 47 : 891, listed = tests(list), actual = tests(run); assert.equal(listed.length, expected);
    assert.deepEqual(actual.map(item => [item.id, item.semantic]).sort(), listed.map(item => [item.id, item.semantic]).sort());
    const annotations = actual.flatMap(item => (item.test.annotations ?? []).filter(note => note.type === "platform-conformance-limit").map(note => ({ semantic: JSON.parse(item.semantic), description: note.description })));
    if (record.exit_code !== 0) {
      assert.equal(record.label, "focused-chromium"); assert.equal(run.stats.expected, 46); assert.equal(run.stats.unexpected, 1); assert.equal(run.stats.skipped, 0); assert.equal(run.stats.flaky, 0);
      const failures = actual.filter(item => ["failed", "timedOut", "interrupted"].includes(item.test.results[0]?.status)); assert.equal(failures.length, 1);
      assert.equal(JSON.parse(failures[0].semantic).at(-1), "HTML loaders capture once, use plain calls and remain independent across shared declarations and reload");
      assert.deepEqual(annotations, []);
      report.retained_original_failure = { label: record.label, input: record.before, list: listRecord.stdout, run: runRecord.stdout,
        passed: 46, failed: 1, failure: { semantic: JSON.parse(failures[0].semantic), status: failures[0].test.results[0].status, errors: failures[0].test.results[0].errors },
        attachments: record.attachments, canonical_credit: 0,
        scope: "The callback fixture needed an explicit strict directive after browser serialization. The framework already called it plainly; no production bug-fix or RED/GREEN claim." };
      continue;
    }
    const proof = browserProof(list, [{ listed: list, report: run }], engine); assert.equal(proof.passed, expected); assert.deepEqual(proof, record.coverage); assert.equal(record.complete, true);
    if (!focused && engine === "webkit") { assert.equal(annotations.length, 2); assert(annotations.some(note => note.description.includes("cookie withholding is not certified"))); assert(annotations.some(note => note.description.includes("wire omission is not certified"))); }
    else assert.deepEqual(annotations, []);
    if (!focused) { assert.deepEqual(proof, receipt.checks.full_suites[engine]); if (engine === "chromium") collection = listed; }
    report.browsers.push({ label: record.label, input: record.before, ...proof, list: listRecord.stdout, run: runRecord.stdout, platform_annotations: annotations });
  }
  for (const engine of ["chromium", "firefox", "webkit"]) assert(report.browsers.some(record => record.label === "focused-" + engine && record.passed === 47 && record.input.sha256 === receipt.inputs.sha256));
  const retention = retainedProof(parentCollection(previous), collection, 155, 155); assert.deepEqual(retention, receipt.parent_case_retention);
  assert.deepEqual(receipt.count_changes_from_parent, { unit: 0, browser: 15 });
  const parentKeys = new Set(parentCollection(previous).map(item => item.retained)); const added = collection.filter(item => !parentKeys.has(item.retained));
  assert.equal(added.length, 15); assert(added.every(item => JSON.parse(item.semantic)[0] === "page-loading.spec.ts"));
  const titles = [...read("tests/browser/page-loading.spec.ts").toString().matchAll(/^test\("([^"]+)"/gm)].map(match => match[1]);
  titles.push(...["script", "event attribute", "executable URL", "srcdoc"].map(name => "native and custom HTML reject " + name + " inside multiply nested templates before insertion"));
  assert.deepEqual(added.map(item => JSON.parse(item.semantic).at(-1)).sort(), titles.sort());
  report.case_retention = { ...retention, added_unit_cases: 0, new_browser_cases: added.map(item => JSON.parse(item.semantic)), full_families_closed: 0 };
  report.failure_diagnostics = [];
  for (const ref of report.retained_original_failure.attachments ?? []) {
    verifyRef(ref);
    if (ref.path.endsWith(".zip")) {
      const members = execFileSync("tar", ["-tf", ref.path], { encoding: "utf8", maxBuffer: 16 * 1024 * 1024 }).trim().split(/\r?\n/);
      assert.equal(new Set(members).size, members.length); assert(members.every(file => !path.isAbsolute(file) && !file.split("/").includes("..")));
      assert(!members.some(file => /^(src|screenshots|screencast)\//.test(file) || file.includes("src@")));
      const events = members.filter(file => file.endsWith(".trace")).flatMap(file => execFileSync("tar", ["-xOf", ref.path, file], { encoding: "utf8", maxBuffer: 16 * 1024 * 1024 }).split(/\r?\n/).filter(Boolean).map(JSON.parse));
      assert(events.length > 0); assert(!events.some(event => event.type === "screencast-frame"));
      report.failure_diagnostics.push({ ...ref, kind: "actual_failed_trace", archive_members: members.length, trace_events: events.length, canonical_credit: 0 });
    } else report.failure_diagnostics.push({ ...ref,
      kind: /(?:error-context\.md|context\.(?:txt|md))$/.test(ref.path) ? "actual_failed_context" : "retained_browser_run_metadata",
      canonical_credit: 0 });
  }
  assert(report.failure_diagnostics.some(ref => ref.kind === "actual_failed_trace"));

  const packed = latest.get("pack"); verifyRef(packed.artifact); const descriptor = json(packed.artifact.path), actualArchive = archive(descriptor);
  assert.deepEqual(actualArchive, receipt.checks.artifact); assert.equal(actualArchive.files, 203);
  assert.equal(actualArchive.tarball.sha256, "2d443c48d62ae2a06bfe534b6c0bf3704f1974445a83483b872c78a1c8a0812e");
  assert.equal(actualArchive.tarball.bytes, 359573); assert.equal(actualArchive.unpacked_bytes, 1821447);
  assert.deepEqual(packed.args, [npm, "pack", "--json", "--pack-destination", path.dirname(descriptor.tarball)]);
  const rawPack = JSON.parse(text(packed)); assert.equal(rawPack.length, 1); for (const [key, value] of Object.entries(rawPack[0])) assert.deepEqual(descriptor[key], value);
  const parentPayloads = previous.checks.artifact.actual_payloads, declarations = actualArchive.actual_payloads.filter(ref => ref.path.endsWith(".d.ts"));
  assert.equal(declarations.length, 40);
  const changedDeclarations = declarations.filter(ref => ref.sha256 !== parentPayloads.find(old => old.path === ref.path)?.sha256);
  assert.deepEqual(changedDeclarations.map(ref => ref.path), ["build/page/index.d.ts"]);
  const changedPayloads = actualArchive.actual_payloads.filter(ref => ref.sha256 !== parentPayloads.find(old => old.path === ref.path)?.sha256);
  assert.deepEqual(changedPayloads.map(ref => ref.path).sort(), ["build/page/index.d.ts", "build/page/index.d.ts.map", "build/page/index.js", "build/page/index.js.map", "src/page/index.ts"].sort());
  assert.notEqual(actualArchive.tarball.sha256, previous.checks.artifact.tarball.sha256);
  assert(read("build/page/index.d.ts").toString().includes("loadHtml?: (url: URL, signal: AbortSignal) => Promise<string>;"));
  report.artifact = { ...actualArchive, declarations: 40, unchanged_declarations: 39, changed_declarations: changedDeclarations,
    changed_payloads: changedPayloads, scope: "Actual new Page source/JS/declaration and maps; archive identity is newly derived, not inherited from M32final." };
  report.installed = [];
  for (const label of ["consumers", "packed-chromium", "packed-firefox", "packed-webkit", "packed-chrome", "packed-edge"]) {
    const record = latest.get(label), expected = label === "consumers" ? [npm, "run", "test:consumers", "--", "--tarball", descriptor.tarball, "--sha256", descriptor.sha256]
      : [npm, "run", "test:packed-browser", "--", "--tarball", descriptor.tarball, "--sha256", descriptor.sha256, "--browser", label.slice(7)];
    assert.deepEqual(record.args, expected); const value = text(record); assert(value.includes(descriptor.sha256));
    assert(label === "consumers" ? value.includes("JS installed consumer passed.") && value.includes("TS installed consumer passed.") : value.includes("Packed browser consumer passed (" + label.slice(7) + " "));
    report.installed.push({ label, stdout: record.stdout, stderr: record.stderr, actual_tarball_sha256: descriptor.sha256 });
  }
  assert(read("tests/consumers/browser/main.js").toString().includes("state.checkPageLoading = async () =>"));
  assert(read("tools/check-packed-browser.mjs").toString().includes("window.packedConsumer.checkPageLoading()"));
  for (const [label, file] of [["binding-performance", "benchmark-m4.mjs"], ["viewport-performance", "benchmark-grid-viewport.mjs"]]) assert.deepEqual(latest.get(label).args, ["tools/" + file, "--browser=chromium", "--runs=5", "--warmup=2"]);
  const perf = performance(JSON.parse(text(latest.get("binding-performance"))), JSON.parse(text(latest.get("viewport-performance"))));
  assert.deepEqual(perf, receipt.checks.performance); assert.deepEqual(perf.binding_budgets, previous.checks.performance.binding_budgets); assert.deepEqual(perf.viewport_budgets, previous.checks.performance.viewport_budgets);
  report.performance = perf;
  const decision = reference(dir + "/m32-approved-omissions.json"); assert.equal(decision.sha256, "359f3ce21a32c354f092d3b146d810bf2b3b4966bfea791142f888208f056817");
  assert.deepEqual(json(decision.path).decisions.map(item => [item.id, item.decision]), ["O01", "O02", "O03", "O04", "O05"].map(id => [id, "approved_narrow_omission"]));
  const oldPackage = JSON.parse(git("show", baseline + ":package.json")); assert.deepEqual(json("package.json").exports, oldPackage.exports); assert.equal(Object.keys(json("package.json").dependencies ?? {}).length, 0);
  assert.equal(git("diff", baseline, "--", "v1").length, 0); assert.equal(git("status", "--porcelain", "--untracked-files=all", "--", "v1").length, 0);
  const lock = "js/natural_js/@types/package-lock.json"; assert.equal(git("ls-files", "--", lock).length, 0); assert(git("check-ignore", lock).length > 0);
  assert.equal(git("branch", "--show-current").toString().trim(), "2.0.0-alpha.0");
  report.protection = { v1_unchanged: true, ignored_original_lock: true, public_entries_unchanged: true, runtime_dependencies: 0,
    branch: "2.0.0-alpha.0", head: git("rev-parse", "HEAD").toString().trim(), approved_omissions: decision, old_Windows_WebKit_and_Tree_Edge_limits_unchanged: true };
  report.status = "approved_independent_recorded_raw_evidence";
} catch (error) { report.status = "failed"; report.error = { message: error.message, stack: error.stack }; process.exitCode = 1; }
report.finished = new Date().toISOString(); fs.writeFileSync(destination, JSON.stringify(report, null, 2) + "\n", { flag: "wx" });
console.log(JSON.stringify({ status: report.status, output: destination, records: report.attempts?.records, inputs: report.inputs?.entries,
  suites: report.browsers?.map(record => [record.label, record.passed]), package_files: report.artifact?.files,
  medians: report.performance?.raw_medians, budgets: report.performance?.checked_budgets, error: report.error?.message }));
