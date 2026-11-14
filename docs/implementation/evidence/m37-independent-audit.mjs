import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import { dir, required, sha, read, json, normalized, git, reference, verifyRef, verifyProtection,
  unchangedEvidence, inventory, tree, output, tests, parentCollection, retainedProof, browserProof, archive, performance } from "./stage-metadata.mjs";

const self = "node_modules/.cache/m37-independent-audit.mjs", stem = "node_modules/.cache/m37-independent-audit";
let destination = stem + ".log";
for (let n = 2; fs.existsSync(destination); n++) destination = stem + "-" + n + ".log";
const baseline = "96d5e66ccfa2a90eec53e3307302ae3d140e1644";
const report = { kind: "independent_recorded_byte_audit", stage: "M3.7", started: new Date().toISOString(), baseline,
  helper: reference(self), limits: ["Only existing recorded bytes are read. No compiler, browser, benchmark, model, or project checker is invoked.",
    "Shared reviewed metadata routines decode actual archive, performance, and browser proofs; exact source, commands, attempts, and inheritance are separately checked below.",
    "This audit grants no full-family closure, omission, release, native-conformance, Safari, manual assistive-technology, or token result. Historical failures keep their original scope."] };

try {
  const [receiptPath, expectedHash] = process.argv.slice(2);
  assert.equal(process.argv.length, 4); assert(/^[0-9a-f]{64}$/.test(expectedHash ?? ""));
  assert.equal(sha(read(receiptPath)), expectedHash, "Announced immutable M3.7 receipt");
  const receipt = json(receiptPath); assert.equal(receipt.schema, "natural-js-recorded-runtime/v1");
  assert.equal(receipt.stage, "M3.7"); assert.equal(receipt.prefix, "m37"); assert.equal(receipt.baseline_commit, baseline);
  report.receipt = { path: receiptPath, sha256: expectedHash, bytes: read(receiptPath).length };
  verifyRef(receipt.setup); const setup = json(receipt.setup.path);
  assert.equal(setup.stage, "M3.7"); assert.equal(setup.head, baseline); assert.equal(setup.baseline_commit, baseline); assert.equal(setup.working_parent, null);
  verifyProtection(setup); unchangedEvidence(baseline, "m37");
  report.shared_read_only_metadata = reference("node_modules/.cache/stage-metadata.mjs");
  assert.equal(report.shared_read_only_metadata.sha256, setup.helpers.find(ref => /stage-metadata-/.test(ref.path)).sha256);
  verifyRef(setup.parent_receipt); assert.equal(setup.parent_receipt.path, dir + "/m36-runtime-receipt.json");
  assert.equal(setup.parent_receipt.sha256, "932790a7a467c0c5a62f48e229324a1e25569d4eb6e558a6b8f66b5ab9017cd4");
  const previous = json(setup.parent_receipt.path); assert.equal(previous.recorded_attempts, 28);
  assert.equal(previous.checks.unit.passed, 217); assert.equal(previous.checks.full_suites.chromium.passed, 933);
  for (const ref of [...previous.retained_files, ...previous.builder]) verifyRef(ref);
  const parentFiles = [];
  for (const name of fs.readdirSync(dir).filter(name => name.startsWith("m36-"))) {
    const file = dir + "/" + name; parentFiles.push(...(fs.statSync(file).isDirectory() ? tree(file) : [reference(file)]));
  }
  const protectedParent = setup.protected_files.filter(ref => ref.path.startsWith(dir + "/m36-"));
  assert.deepEqual(protectedParent.map(ref => ref.path).sort(), parentFiles.map(ref => ref.path).sort());
  for (const ref of protectedParent) { verifyRef(ref); assert.deepEqual(read(ref.path), git("show", baseline + ":" + ref.path), ref.path); }
  const attributes = reference(dir + "/.gitattributes"); assert.equal(attributes.sha256, "48747480eddba024928d03be9bf83dc579e5515768647507a767e8187a85c9ab");
  assert.deepEqual(read(attributes.path), Buffer.from("** -text\n")); assert.deepEqual(read(attributes.path), git("show", baseline + ":" + attributes.path));
  assert.deepEqual(git("check-attr", "-z", "text", "--", attributes.path, receiptPath).toString().split("\0"),
    [attributes.path, "text", "unset", receiptPath, "text", "unset", ""]);
  report.parent = { receipt: setup.parent_receipt, original_attempts: 28, exact_committed_parent_prefix_files: protectedParent.length,
    raw_git_attributes: attributes, scope: "Committed M3.6 and all protected ancestors retain their exact bytes, attempts, controls, and prior limitations; no historical runtime is rerun or recertified." };

  verifyRef(receipt.inputs); assert.equal(receipt.inputs.entries, 219);
  const files = inventory(), current = Object.fromEntries(files.map(file => [file, sha(normalized(read(file)))])), oldInputs = json(previous.inputs.path);
  assert.deepEqual(Object.keys(json(receipt.inputs.path)), files); assert.deepEqual(json(receipt.inputs.path), current);
  const addedInputs = ["examples/vite/m4/employee-codes.json", "examples/vite/m4/employee-start.json", "tests/browser/list-row-bindings.spec.ts", "tests/browser/m37-declarations.spec.ts"];
  assert.deepEqual(files.filter(file => !Object.hasOwn(oldInputs, file)).sort(), addedInputs.sort());
  assert.deepEqual(Object.keys(oldInputs).filter(file => !Object.hasOwn(current, file)), []);
  const snapshot = reference(dir + "/m37-declarations.json"); assert.equal(snapshot.sha256, "4970bbfb0a318a9fa7fec2c09919d0eafddb8ff069e167e55d1ed3d5a79bfa6d");
  const source = json(snapshot.path), approved = source.independent_source_review.source_sha256;
  const changed = files.filter(file => current[file] !== oldInputs[file]); assert.deepEqual(changed.toSorted(), Object.keys(approved).sort()); assert.equal(changed.length, 16);
  for (const [file, expected] of Object.entries(approved)) assert.equal(current[file], expected, file);
  verifyRef(source.independent_source_review.report); assert.equal(source.independent_source_review.report.sha256, "edfb44b193ccbd26a76bfff403e65550cf36dfe7e971ca8928c2a44fc9715422");
  const independentReview = json(source.independent_source_review.report.path); assert.deepEqual(independentReview.source_sha256, approved);
  for (const ref of Object.values(source.independent_source_review.coverage)) verifyRef(ref);
  verifyRef(source.baseline.receipt); assert.equal(source.baseline.commit, baseline); assert.equal(source.baseline.receipt.sha256, "a2ff6623063430830fb150941fd0fb3dbb65c48dde9ede1020595888aaa6ad4d");
  verifyRef(source.declarations); assert.equal(source.declarations.sha256, "06fc4733c5039a749d83b425f9da34d1f66e19459d0cf8d1507e6c8a5c9a73d9");
  verifyRef(source.written_plan); assert.equal(source.written_plan.sha256, "d39fe702a08400fdf293aa5935a6ab0ad9cacb392b5ae994e32804e65760a3eb");
  verifyRef(source.development.cache_static_finding); assert.equal(source.development.cache_static_finding.sha256, "cf9b9158def42ee5b50e1f28babde6153b6132ff07140f5232fa48cf12472a18");
  assert.equal(source.development.current_failed_project_attempts, 0); assert.equal(source.development.focus_each_engine, 101);
  assert.equal(source.runtime_receipt, null); assert.equal(source.independent_raw_review, "pending"); assert.equal(source.independent_documents, "pending");
  assert.deepEqual(source.witnesses, { new_unit_cases: 0, new_browser_cases: 22, list_browser: 11, employee_browser: 11, files: ["tests/browser/list-row-bindings.spec.ts", "tests/browser/m37-declarations.spec.ts"] });
  report.inputs = { ...receipt.inputs, changed_paths: changed, added_paths: addedInputs };
  report.source_review = { snapshot, connected_review: source.independent_source_review.report, composite: source.independent_source_review.coverage, owned_paths: 16, source_sha256: approved,
    scope: "Composite independent reviewers retain disjoint runtime/installed, application and authored List-fixture coverage. Immutable source/focus fields stay pending at capture; the final wrapper owns later acceptance." };

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
    for (const key of ["before", "after"]) { verifyRef(record[key]); assert.equal(record[key].entries, 219); assert.equal(record[key].sha256, receipt.inputs.sha256);
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
  const starts = fs.readdirSync(dir).filter(name => name.startsWith("m37-") && name.endsWith("-start.json")), results = fs.readdirSync(dir).filter(name => name.startsWith("m37-") && name.endsWith("-result.json"));
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
  for (const record of [latest.get("unit"), ...other.filter(record => record.label === "focused-unit")]) assert.match(text(record), /Tests\s+217 passed/);
  assert(!/\b\d+ (failed|skipped|todo)\b/.test(text(latest.get("unit")))); assert.deepEqual(receipt.checks.unit, { passed: 217 });
  report.browsers = []; let collection, semanticHash;
  for (const record of records.filter(record => record.children)) {
    const focused = record.label.startsWith("focused-"), engine = record.label.slice(8); assert(["chromium", "firefox", "webkit"].includes(engine));
    assert.equal(record.shards, 1); assert.equal(record.workers, focused ? 1 : 2); assert.equal(record.complete, true);
    assert.deepEqual(record.focus_paths, focused ? ["tests/browser/list-row-bindings.spec.ts", "tests/browser/m37-declarations.spec.ts", "tests/browser/grid-callbacks.spec.ts", "tests/browser/grid-recipes.spec.ts", "tests/browser/list.spec.ts", "tests/browser/collection-values.spec.ts", "tests/browser/m4-screen.spec.ts", "tests/browser/m36-advice.spec.ts"] : []);
    assert.deepEqual(record.children.map(child => child.label), [record.label + "-list", record.label + "-run-1"]);
    const [listRecord, runRecord] = record.children, list = JSON.parse(output(listRecord.stdout)), run = JSON.parse(output(runRecord.stdout));
    for (const [index, child] of record.children.entries()) { const flag = child.args.find(arg => arg.startsWith("--output=")); assert(flag?.startsWith("--output=docs/implementation/evidence/m37-"));
      assert.deepEqual(child.args, ["node_modules/@playwright/test/cli.js", "test", "-c", "tests/playwright.config.ts", ...record.focus_paths,
        "--project=" + engine, "--workers=" + record.workers, "--retries=0", "--reporter=json", flag, ...(index ? [] : ["--list"])]);
      assert.deepEqual(child.environment, { PLAYWRIGHT_BROWSERS_PATH: engine === "firefox" ? path.resolve("node_modules/.cache/playwright-m6") : null }); }
    assert.equal(list.config.workers, record.workers); assert.equal(run.config.workers, record.workers); assert.equal(list.config.shard, null); assert.equal(run.config.shard, null);
    assert(tests(list).every(item => item.test.results.length === 0));
    const proof = browserProof(list, [{ listed: list, report: run }], engine); assert.equal(proof.passed, focused ? 101 : 955); assert.deepEqual(proof, record.coverage);
    const annotations = tests(run).flatMap(item => (item.test.annotations ?? []).filter(note => note.type === "platform-conformance-limit").map(note => ({ semantic: JSON.parse(item.semantic), description: note.description })));
    if (!focused && engine === "webkit") { assert.equal(annotations.length, 2); assert(annotations.some(note => note.description.includes("cookie withholding is not certified"))); assert(annotations.some(note => note.description.includes("wire omission is not certified"))); }
    else assert.deepEqual(annotations, []);
    if (!focused) { assert.deepEqual(proof, receipt.checks.full_suites[engine]); semanticHash ??= proof.semantic_identities_sha256; assert.equal(proof.semantic_identities_sha256, semanticHash); if (engine === "chromium") collection = tests(list); }
    report.browsers.push({ label: record.label, input: record.before, ...proof, list: listRecord.stdout, run: runRecord.stdout, platform_annotations: annotations });
  }
  for (const engine of ["chromium", "firefox", "webkit"]) assert(report.browsers.some(record => record.label === "focused-" + engine && record.passed === 101));
  const parentTests = parentCollection(previous), retention = retainedProof(parentTests, collection, 217, 217); assert.deepEqual(retention, receipt.parent_case_retention);
  assert.deepEqual(receipt.count_changes_from_parent, { unit: 0, browser: 22 });
  const parentKeys = new Set(parentTests.map(item => item.retained)), added = collection.filter(item => !parentKeys.has(item.retained));
  assert.equal(added.length, 22); assert.equal(added.filter(item => JSON.parse(item.semantic)[0] === "list-row-bindings.spec.ts").length, 11);
  assert.equal(added.filter(item => JSON.parse(item.semantic)[0] === "m37-declarations.spec.ts").length, 11);
  report.case_retention = { ...retention, added_unit_cases: 0, new_browser_cases: added.map(item => JSON.parse(item.semantic)), full_families_closed: 0 };

  const packed = latest.get("pack"); verifyRef(packed.artifact); const descriptor = json(packed.artifact.path), actualArchive = archive(descriptor);
  assert.deepEqual(actualArchive, receipt.checks.artifact); assert.equal(actualArchive.files, 208);
  assert.equal(actualArchive.tarball.sha256, "4194aba11bdb1c2d583c3440685efa42b7e87068cc0dacb00a506eae74cea61c"); assert.equal(actualArchive.tarball.bytes, 372081); assert.equal(actualArchive.unpacked_bytes, 1878852);
  assert.deepEqual(packed.args, [npm, "pack", "--json", "--pack-destination", path.dirname(descriptor.tarball)]);
  const rawPack = JSON.parse(text(packed)); assert.equal(rawPack.length, 1); for (const [key, value] of Object.entries(rawPack[0])) assert.deepEqual(descriptor[key], value);
  const parentPayloads = previous.checks.artifact.actual_payloads, byPath = new Map(parentPayloads.map(ref => [ref.path, ref])), declarations = actualArchive.actual_payloads.filter(ref => ref.path.endsWith(".d.ts")), parentDeclarations = parentPayloads.filter(ref => ref.path.endsWith(".d.ts"));
  assert.equal(declarations.length, 41); assert.equal(parentDeclarations.length, 41);
  assert.deepEqual(actualArchive.actual_payloads.map(ref => ref.path).sort(), [...byPath.keys()].sort());
  const changedDeclarations = declarations.filter(ref => byPath.get(ref.path).sha256 !== ref.sha256), expectedDeclarations = ["build/ui/grid-hooks.d.ts", "build/ui/grid.d.ts", "build/ui/list.d.ts"];
  assert.deepEqual(changedDeclarations.map(ref => ref.path).sort(), expectedDeclarations); assert.equal(declarations.length - changedDeclarations.length, 38);
  const declarationProof = json(source.declarations.path); verifyRef(declarationProof.parent); verifyRef(declarationProof.artifact);
  assert.deepEqual(declarationProof.parent, setup.parent_receipt); assert.deepEqual(declarationProof.artifact, actualArchive.tarball); assert.equal(declarationProof.entries, 41); assert.equal(declarationProof.unchanged, 38);
  assert.deepEqual(declarationProof.changed, expectedDeclarations); assert.deepEqual(declarationProof.added, []); assert.deepEqual(declarationProof.removed, []);
  const changedPayloads = actualArchive.actual_payloads.filter(ref => byPath.get(ref.path).sha256 !== ref.sha256);
  const expectedPayloads = ["grid-hooks", "grid", "list"].flatMap(name => ["build/ui/" + name + ".d.ts", "build/ui/" + name + ".d.ts.map", "build/ui/" + name + ".js", "build/ui/" + name + ".js.map", "src/ui/" + name + ".ts"]);
  assert.deepEqual(changedPayloads.map(ref => ref.path).sort(), expectedPayloads.sort()); assert.notEqual(actualArchive.tarball.sha256, previous.checks.artifact.tarball.sha256);
  report.artifact = { ...actualArchive, declarations: 41, unchanged_declarations: 38, changed_declarations: changedDeclarations, added_declarations: [], changed_payloads: changedPayloads,
    scope: "All208 parent package filenames remain. Only List.onRowBind adds inferred public behavior; three UI source/JS/declaration/map families change. Public UI entry and all other declarations stay byte-identical." };
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
