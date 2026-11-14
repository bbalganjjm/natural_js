import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import { dir, required, sha, read, json, normalized, git, reference, verifyRef, verifyProtection,
  unchangedEvidence, inventory, tree, output, tests, parentCollection, retainedProof, browserProof, archive, performance } from "./stage-metadata.mjs";

const self = "node_modules/.cache/m34-independent-audit.mjs", stem = "node_modules/.cache/m34-independent-audit";
let destination = stem + ".log";
for (let n = 2; fs.existsSync(destination); n++) destination = stem + "-" + n + ".log";
const baseline = "b1d16082af4b938b1a885c8508f6243c886c3435";
const report = { kind: "independent_recorded_byte_audit", stage: "M3.4", started: new Date().toISOString(), baseline,
  helper: reference(self), limits: ["Only existing recorded bytes are read. No compiler, browser, benchmark, model, or project checker is invoked.",
    "Shared reviewed metadata routines decode actual archive, performance, and browser proofs; exact source, commands, attempts, and inheritance are separately checked below.",
    "This audit grants no full-family closure, omission, release, native-conformance, Safari, manual assistive-technology, or token result. Historical failures keep their original scope."] };

try {
  const [receiptPath, expectedHash] = process.argv.slice(2);
  assert.equal(process.argv.length, 4); assert(/^[0-9a-f]{64}$/.test(expectedHash ?? ""));
  assert.equal(sha(read(receiptPath)), expectedHash, "Announced immutable M3.4 receipt");
  const receipt = json(receiptPath); assert.equal(receipt.schema, "natural-js-recorded-runtime/v1");
  assert.equal(receipt.stage, "M3.4"); assert.equal(receipt.prefix, "m34"); assert.equal(receipt.baseline_commit, baseline);
  report.receipt = { path: receiptPath, sha256: expectedHash, bytes: read(receiptPath).length };
  verifyRef(receipt.setup); const setup = json(receipt.setup.path);
  assert.equal(setup.stage, "M3.4"); assert.equal(setup.head, baseline); assert.equal(setup.baseline_commit, baseline); assert.equal(setup.working_parent, null);
  verifyProtection(setup); unchangedEvidence(baseline, "m34");
  report.shared_read_only_metadata = reference("node_modules/.cache/stage-metadata.mjs");
  assert.equal(report.shared_read_only_metadata.sha256, setup.helpers.find(ref => /stage-metadata-/.test(ref.path)).sha256);
  verifyRef(setup.parent_receipt); assert.equal(setup.parent_receipt.path, dir + "/m33-runtime-receipt.json");
  assert.equal(setup.parent_receipt.sha256, "70d16be00cf5848b46f9707ca1a67dfb985a4b4866d87721ef5cc6d85f740479");
  const previous = json(setup.parent_receipt.path); assert.equal(previous.recorded_attempts, 24);
  assert.equal(previous.checks.unit.passed, 155); assert.equal(previous.checks.full_suites.chromium.passed, 891);
  for (const ref of [...previous.retained_files, ...previous.builder]) verifyRef(ref);
  const parentFiles = [];
  for (const name of fs.readdirSync(dir).filter(name => name.startsWith("m33-"))) {
    const file = dir + "/" + name; parentFiles.push(...(fs.statSync(file).isDirectory() ? tree(file) : [reference(file)]));
  }
  const protectedParent = setup.protected_files.filter(ref => ref.path.startsWith(dir + "/m33-"));
  assert.deepEqual(protectedParent.map(ref => ref.path).sort(), parentFiles.map(ref => ref.path).sort());
  for (const ref of protectedParent) { verifyRef(ref); assert.deepEqual(read(ref.path), git("show", baseline + ":" + ref.path), ref.path); }
  const attributes = reference(dir + "/.gitattributes"); assert.equal(attributes.sha256, "48747480eddba024928d03be9bf83dc579e5515768647507a767e8187a85c9ab");
  assert.deepEqual(read(attributes.path), Buffer.from("** -text\n")); assert.deepEqual(read(attributes.path), git("show", baseline + ":" + attributes.path));
  assert.deepEqual(git("check-attr", "-z", "text", "--", attributes.path, receiptPath).toString().split("\0"),
    [attributes.path, "text", "unset", receiptPath, "text", "unset", ""]);
  report.parent = { receipt: setup.parent_receipt, original_attempts: 24, exact_committed_parent_prefix_files: protectedParent.length,
    raw_git_attributes: attributes, scope: "Committed M3.3 and all protected ancestors retain their exact bytes, attempts, controls, and prior limitations; no historical runtime is rerun or recertified." };

  verifyRef(receipt.inputs); assert.equal(receipt.inputs.entries, 207);
  const files = inventory(), current = Object.fromEntries(files.map(file => [file, sha(normalized(read(file)))])), oldInputs = json(previous.inputs.path);
  assert.deepEqual(Object.keys(json(receipt.inputs.path)), files); assert.deepEqual(json(receipt.inputs.path), current);
  assert.deepEqual(files.filter(file => !Object.hasOwn(oldInputs, file)), ["tests/browser/page-lifecycle.spec.ts"]);
  assert.deepEqual(Object.keys(oldInputs).filter(file => !Object.hasOwn(current, file)), []);
  const approved = {
    "src/page/index.ts": "40ff870b56f0a22bf3a1c7481dc5262887e04606de6e415f5829a95b41d96c1a",
    "tests/consumers/browser/main.js": "7d9da190a9789b213edd29fd4ecdd3423458a696d05fb92f30e5132624efd069",
    "tests/consumers/ts/check.ts": "442d9ad7daae2d102af291d381e2511a4c36bf59d5921f8bc738424e73552588",
    "tools/check-packed-browser.mjs": "f12951fb8c63d9e701b752067442b94ef2084709d72e12c0ab416b9143249763",
    "tests/browser/page-lifecycle.spec.ts": "b068fe473cbc8013759a582493d5896cc85be72d7191614832c43d33c3d164b6"
  };
  const changed = files.filter(file => current[file] !== oldInputs[file]); assert.deepEqual(changed.toSorted(), Object.keys(approved).sort());
  for (const [file, expected] of Object.entries(approved)) assert.equal(current[file], expected, file);
  const snapshot = reference(dir + "/m34-page-lifetime.json"); assert.equal(snapshot.sha256, "769715866013ff1201bab28a7782d288188ed62213b0e9df8530625b6772e925");
  const source = json(snapshot.path); assert.deepEqual(source.independent_source_review.source_sha256, approved);
  verifyRef(source.independent_source_review.report); assert.equal(source.independent_source_review.report.sha256, "e243b5ab25568523a553f0194afe3420e48a91fbc9cbcdf91aff1e733d36d31e");
  verifyRef(source.declarations); assert.equal(source.declarations.sha256, "db2be3ac08979e41b7d6b6cdda7d704099d0494de6a699028bc9121ffcd04992");
  assert.equal(source.runtime_receipt, null); assert.equal(source.independent_raw_review, "pending"); assert.equal(source.independent_documents, "pending");
  report.inputs = { ...receipt.inputs, changed_paths: changed, added_paths: ["tests/browser/page-lifecycle.spec.ts"] };
  report.source_review = { snapshot, connected_review: source.independent_source_review.report, owned_paths: 5, source_sha256: approved,
    scope: "Immutable pre-canonical source/focus observations keep their pending-at-capture fields. The final wrapper owns later acceptance." };

  verifyRef(receipt.records); const records = read(receipt.records.path).toString().trim().split(/\r?\n/).filter(Boolean).map(JSON.parse);
  assert.equal(records.length, receipt.recorded_attempts); const latest = new Map();
  for (const record of records) if (required.includes(record.label)) latest.set(record.label, record);
  assert.deepEqual([...latest.keys()].sort(), [...required].sort()); assert.equal(receipt.canonical_gates, 16);
  assert.deepEqual(Object.fromEntries(required.map(label => [label, latest.get(label)])), receipt.canonical);
  const other = records.filter(record => latest.get(record.label) !== record); assert.deepEqual(other, receipt.retained_other_attempts);
  assert.equal(other.length, 7); assert(other.every(record => record.label.startsWith("focused-")));
  const every = [], maps = new Map();
  function recorded(record) {
    every.push(record); assert.equal(record.exit_code, 0); assert(!record.driver_signal && !record.close_signal && !record.spawn_error && !record.validation_error && !record.error);
    assert.equal(record.sources_unchanged, true); assert.equal(record.helpers_unchanged, true);
    for (const key of ["before", "after"]) { verifyRef(record[key]); assert.equal(record[key].entries, 207); assert.equal(record[key].sha256, receipt.inputs.sha256);
      const values = json(record[key].path); assert.deepEqual(values, current); maps.set(record[key].path, values); }
    if (record.stdout) { output(record.stdout); verifyRef(record.stderr); }
    for (const ref of [...record.helpers, ...(record.attachments ?? [])]) verifyRef(ref);
    for (const ref of record.helpers) assert.equal(sha(read(ref.source)), ref.sha256);
    for (const child of record.children ?? []) recorded(child);
  }
  for (const record of records) recorded(record);
  const leaf = records.flatMap(record => record.children ?? [record]).toSorted((a, b) => Date.parse(a.started) - Date.parse(b.started));
  let finish = -Infinity;
  for (const record of leaf) { assert(Date.parse(record.started) >= finish); finish = Date.parse(record.finished); assert(finish >= Date.parse(record.started)); }
  for (const ref of [...receipt.retained_files, ...receipt.builder]) verifyRef(ref);
  const starts = fs.readdirSync(dir).filter(name => name.startsWith("m34-") && name.endsWith("-start.json")), results = fs.readdirSync(dir).filter(name => name.startsWith("m34-") && name.endsWith("-result.json"));
  assert.equal(starts.length, results.length); assert.equal(starts.length, every.length); assert.deepEqual(receipt.incomplete_command_starts, []);
  for (const name of starts) {
    const start = json(dir + "/" + name), result = json(dir + "/" + name.replace(/-start\.json$/, "-result.json"));
    const found = every.filter(record => record.label === result.label && record.started === result.started); assert.equal(found.length, 1);
    const actual = { ...found[0] }; delete actual.build_outputs; delete actual.artifact; assert.deepEqual(actual, result);
    for (const key of ["label", "started", "before", "helpers"]) assert.deepEqual(start[key], result[key]);
    if (start.args) assert.deepEqual(start.args, result.args);
    for (const file of [name, name.replace(/-start\.json$/, "-result.json")]) assert(receipt.retained_files.some(ref => ref.path === dir + "/" + file));
  }
  report.attempts = { records: records.length, development: other.length, latest_canonical: latest.size, failures: 0,
    leaf_commands: leaf.length, captured_start_result_pairs: starts.length, maps: [...maps].map(([file]) => reference(file)) };
  const text = record => output(record.stdout).toString("utf8").replace(/\u001b\[[0-9;]*[A-Za-z]/g, ""), npm = path.join(path.dirname(process.execPath), "node_modules/npm/bin/npm-cli.js");
  assert.deepEqual(latest.get("build").args, ["node_modules/typescript/bin/tsc", "-p", "tsconfig.json"]);
  assert.deepEqual(latest.get("types").args, ["node_modules/typescript/bin/tsc", "-p", "tsconfig.json", "--noEmit"]);
  assert.deepEqual(latest.get("unit").args, ["node_modules/vitest/vitest.mjs", "run"]);
  const examples = files.filter(file => file.startsWith("examples/vite/") && file.endsWith(".ts") && !["vite.config.ts", "mock-server.ts"].includes(path.basename(file)));
  assert.deepEqual(latest.get("example-types").args, ["node_modules/typescript/bin/tsc", "--ignoreConfig", "--strict", "--noEmit", "--target", "ES2022", "--module", "NodeNext", "--moduleResolution", "NodeNext", "--lib", "ES2022,DOM", ...examples]);
  assert.deepEqual(latest.get("build").build_outputs, tree("build"));
  for (const record of [latest.get("unit"), ...other.filter(record => record.label === "focused-unit")]) assert.match(text(record), /Tests\s+155 passed/);
  assert(!/\b\d+ (failed|skipped|todo)\b/.test(text(latest.get("unit")))); assert.deepEqual(receipt.checks.unit, { passed: 155 });
  report.browsers = []; let collection, semanticHash;
  for (const record of records.filter(record => record.children)) {
    const focused = record.label.startsWith("focused-"), engine = record.label.slice(8); assert(["chromium", "firefox", "webkit"].includes(engine));
    assert.equal(record.shards, 1); assert.equal(record.workers, focused ? 1 : 2); assert.equal(record.complete, true);
    assert.deepEqual(record.focus_paths, focused ? ["tests/browser/page-lifecycle.spec.ts", "tests/browser/page.spec.ts", "tests/browser/page-loading.spec.ts", "tests/browser/popup.spec.ts", "tests/browser/tabs.spec.ts", "tests/browser/documents.spec.ts"] : []);
    assert.deepEqual(record.children.map(child => child.label), [record.label + "-list", record.label + "-run-1"]);
    const [listRecord, runRecord] = record.children, list = JSON.parse(output(listRecord.stdout)), run = JSON.parse(output(runRecord.stdout));
    for (const [index, child] of record.children.entries()) { const flag = child.args.find(arg => arg.startsWith("--output=")); assert(flag?.startsWith("--output=docs/implementation/evidence/m34-"));
      assert.deepEqual(child.args, ["node_modules/@playwright/test/cli.js", "test", "-c", "tests/playwright.config.ts", ...record.focus_paths,
        "--project=" + engine, "--workers=" + record.workers, "--retries=0", "--reporter=json", flag, ...(index ? [] : ["--list"])]);
      assert.deepEqual(child.environment, { PLAYWRIGHT_BROWSERS_PATH: engine === "firefox" ? path.resolve("node_modules/.cache/playwright-m6") : null }); }
    assert.equal(list.config.workers, record.workers); assert.equal(run.config.workers, record.workers); assert.equal(list.config.shard, null); assert.equal(run.config.shard, null);
    assert(tests(list).every(item => item.test.results.length === 0));
    const proof = browserProof(list, [{ listed: list, report: run }], engine); assert.equal(proof.passed, focused ? 62 : 906); assert.deepEqual(proof, record.coverage);
    const annotations = tests(run).flatMap(item => (item.test.annotations ?? []).filter(note => note.type === "platform-conformance-limit").map(note => ({ semantic: JSON.parse(item.semantic), description: note.description })));
    if (!focused && engine === "webkit") { assert.equal(annotations.length, 2); assert(annotations.some(note => note.description.includes("cookie withholding is not certified"))); assert(annotations.some(note => note.description.includes("wire omission is not certified"))); }
    else assert.deepEqual(annotations, []);
    if (!focused) { assert.deepEqual(proof, receipt.checks.full_suites[engine]); semanticHash ??= proof.semantic_identities_sha256; assert.equal(proof.semantic_identities_sha256, semanticHash); if (engine === "chromium") collection = tests(list); }
    report.browsers.push({ label: record.label, input: record.before, ...proof, list: listRecord.stdout, run: runRecord.stdout, platform_annotations: annotations });
  }
  for (const engine of ["chromium", "firefox", "webkit"]) assert(report.browsers.some(record => record.label === "focused-" + engine && record.passed === 62));
  const parentTests = parentCollection(previous), retention = retainedProof(parentTests, collection, 155, 155); assert.deepEqual(retention, receipt.parent_case_retention);
  assert.deepEqual(receipt.count_changes_from_parent, { unit: 0, browser: 15 });
  const parentKeys = new Set(parentTests.map(item => item.retained)), added = collection.filter(item => !parentKeys.has(item.retained));
  assert.equal(added.length, 15); assert(added.every(item => JSON.parse(item.semantic)[0] === "page-lifecycle.spec.ts"));
  const spec = read("tests/browser/page-lifecycle.spec.ts").toString(), titles = [...spec.matchAll(/^test\("([^"]+)"/gm)].map(match => match[1]);
  for (const match of spec.matchAll(/^  test\(`([^`]+)`/gm)) for (const kind of ["null", "undefined"]) titles.push(match[1].replaceAll("${kind}", kind));
  assert.equal(titles.length, 15); assert.deepEqual(added.map(item => JSON.parse(item.semantic).at(-1)).sort(), titles.sort());
  report.case_retention = { ...retention, added_unit_cases: 0, new_browser_cases: added.map(item => JSON.parse(item.semantic)), full_families_closed: 0 };

  const packed = latest.get("pack"); verifyRef(packed.artifact); const descriptor = json(packed.artifact.path), actualArchive = archive(descriptor);
  assert.deepEqual(actualArchive, receipt.checks.artifact); assert.equal(actualArchive.files, 203);
  assert.equal(actualArchive.tarball.sha256, "bc89851fb0ab02b069188f3df678f6e9ee76ab724e4f89898d0a58be0facfeff");
  assert.equal(actualArchive.tarball.bytes, 359787); assert.equal(actualArchive.unpacked_bytes, 1822689);
  assert.deepEqual(packed.args, [npm, "pack", "--json", "--pack-destination", path.dirname(descriptor.tarball)]);
  const rawPack = JSON.parse(text(packed)); assert.equal(rawPack.length, 1); for (const [key, value] of Object.entries(rawPack[0])) assert.deepEqual(descriptor[key], value);
  const parentPayloads = previous.checks.artifact.actual_payloads, declarations = actualArchive.actual_payloads.filter(ref => ref.path.endsWith(".d.ts"));
  const parentDeclarations = parentPayloads.filter(ref => ref.path.endsWith(".d.ts")); assert.equal(declarations.length, 40); assert.deepEqual(declarations, parentDeclarations);
  assert.deepEqual(actualArchive.actual_payloads.map(ref => ref.path), parentPayloads.map(ref => ref.path));
  const changedPayloads = actualArchive.actual_payloads.filter(ref => ref.sha256 !== parentPayloads.find(old => old.path === ref.path).sha256);
  assert.deepEqual(changedPayloads.map(ref => ref.path).sort(), ["build/page/index.d.ts.map", "build/page/index.js", "build/page/index.js.map", "src/page/index.ts"].sort());
  assert.notEqual(actualArchive.tarball.sha256, previous.checks.artifact.tarball.sha256);
  report.artifact = { ...actualArchive, declarations: 40, unchanged_declarations: 40, changed_declarations: [], changed_payloads: changedPayloads,
    scope: "Runtime Page source/JS and map changes only. The actual new tar is decoded independently; all forty declaration payloads and filenames remain byte-identical." };
  report.installed = [];
  for (const label of ["consumers", "packed-chromium", "packed-firefox", "packed-webkit", "packed-chrome", "packed-edge"]) {
    const record = latest.get(label), expected = label === "consumers" ? [npm, "run", "test:consumers", "--", "--tarball", descriptor.tarball, "--sha256", descriptor.sha256]
      : [npm, "run", "test:packed-browser", "--", "--tarball", descriptor.tarball, "--sha256", descriptor.sha256, "--browser", label.slice(7)];
    assert.deepEqual(record.args, expected); const value = text(record); assert(value.includes(descriptor.sha256));
    assert(label === "consumers" ? value.includes("JS installed consumer passed.") && value.includes("TS installed consumer passed.") : value.includes("Packed browser consumer passed (" + label.slice(7) + " "));
    report.installed.push({ label, stdout: record.stdout, stderr: record.stderr, actual_tarball_sha256: descriptor.sha256 });
  }
  assert(read("tools/check-packed-browser.mjs").toString().includes("undefinedCause: true"));
  for (const [label, file] of [["binding-performance", "benchmark-m4.mjs"], ["viewport-performance", "benchmark-grid-viewport.mjs"]]) assert.deepEqual(latest.get(label).args, ["tools/" + file, "--browser=chromium", "--runs=5", "--warmup=2"]);
  const perf = performance(JSON.parse(text(latest.get("binding-performance"))), JSON.parse(text(latest.get("viewport-performance"))));
  assert.deepEqual(perf, receipt.checks.performance); assert.deepEqual(perf.binding_budgets, previous.checks.performance.binding_budgets); assert.deepEqual(perf.viewport_budgets, previous.checks.performance.viewport_budgets); report.performance = perf;
  const decision = reference(dir + "/m32-approved-omissions.json"); assert.equal(decision.sha256, "359f3ce21a32c354f092d3b146d810bf2b3b4966bfea791142f888208f056817");
  assert.deepEqual(json(decision.path).decisions.map(item => [item.id, item.decision]), ["O01", "O02", "O03", "O04", "O05"].map(id => [id, "approved_narrow_omission"]));
  const oldPackage = JSON.parse(git("show", baseline + ":package.json")); assert.deepEqual(json("package.json").exports, oldPackage.exports); assert.equal(Object.keys(json("package.json").dependencies ?? {}).length, 0);
  assert.equal(git("diff", baseline, "--", "v1").length, 0); assert.equal(git("status", "--porcelain", "--untracked-files=all", "--", "v1").length, 0);
  const lock = "js/natural_js/@types/package-lock.json"; assert.equal(git("ls-files", "--", lock).length, 0); assert(git("check-ignore", lock).length > 0);
  assert.equal(git("branch", "--show-current").toString().trim(), "2.0.0-alpha.0");
  report.protection = { v1_unchanged: true, original_lock_ignored: true, public_entries_unchanged: true, runtime_dependencies: 0,
    branch: "2.0.0-alpha.0", head: git("rev-parse", "HEAD").toString().trim(), approved_omissions: decision, inherited_native_and_failure_limits_unchanged: true };
  report.status = "approved_independent_recorded_raw_evidence";
} catch (error) { report.status = "failed"; report.error = { message: error.message, stack: error.stack }; process.exitCode = 1; }
report.finished = new Date().toISOString(); fs.writeFileSync(destination, JSON.stringify(report, null, 2) + "\n", { flag: "wx" });
console.log(JSON.stringify({ status: report.status, output: destination, records: report.attempts?.records, inputs: report.inputs?.entries,
  suites: report.browsers?.map(record => [record.label, record.passed]), package_files: report.artifact?.files,
  medians: report.performance?.raw_medians, budgets: report.performance?.checked_budgets, error: report.error?.message }));
