import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import { dir, required, sha, read, json, normalized, git, reference, verifyRef, verifyProtection,
  inventory, tree, output, tests, parentCollection, retainedProof, browserProof, archive, performance } from "./stage-metadata.mjs";

const self = "node_modules/.cache/m32final-independent-audit.mjs";
const stem = "node_modules/.cache/m32final-independent-audit";
let destination = stem + ".log";
for (let n = 2; fs.existsSync(destination); n++) destination = stem + "-" + n + ".log";
const baseline = "3a9a2c8c8ac978dd39df66c5e9a864ee062ce56c";
const parentPath = dir + "/m32-runtime-receipt.json";
const parentHash = "74d9c886f6591039e827e135243a16d21917ba933e0b8c15973498d1a9112cb2";
const report = { kind: "independent_recorded_byte_audit", stage: "M3.2 final checker boundary", started: new Date().toISOString(), baseline,
  helper: reference(self), limits: ["Only recorded bytes are read. This helper runs no compiler, browser, benchmark, model, or project checker.",
    "The original M3.2 receipt remains immutable. New canonical runs do not rewrite its failures, native controls, pending-at-capture documents, or independent approval.",
    "Shared reviewed metadata routines decode actual archive/performance/case data. Commands, sources, parent protection, and platform annotations are checked independently below."] };

try {
  const [receiptPath, expectedHash] = process.argv.slice(2);
  assert.equal(process.argv.length, 4); assert(/^[0-9a-f]{64}$/.test(expectedHash ?? ""));
  assert.equal(sha(read(receiptPath)), expectedHash, "Announced final immutable runtime receipt");
  const receipt = json(receiptPath);
  assert.equal(receipt.schema, "natural-js-recorded-runtime/v1"); assert.equal(receipt.prefix, "m32final");
  assert.equal(receipt.baseline_commit, baseline); assert.equal(receipt.stage, "M3.2");
  report.receipt = { path: receiptPath, sha256: expectedHash, bytes: read(receiptPath).length };
  assert.equal(sha(read(parentPath)), parentHash);
  const previous = json(parentPath); assert.equal(previous.prefix, "m32"); assert.equal(previous.recorded_attempts, 34);
  verifyRef(previous.setup); verifyRef(previous.inputs); verifyRef(previous.records);
  for (const ref of [...previous.retained_files, ...previous.builder]) verifyRef(ref);
  const oldAudit = reference(dir + "/m32-independent-audit.json");
  assert.equal(oldAudit.sha256, "88dacfac3c7268f338af7301da3c05b3c4b06ac71f0776aa8db213d4c12052d1");
  assert.equal(json(oldAudit.path).status, "approved_independent_recorded_raw_evidence");
  assert.equal(json(oldAudit.path).receipt.sha256, parentHash);
  const changedHistorical = git("diff", "--name-only", "--no-renames", "--diff-filter=MD", "-z", baseline, "--", dir).toString().split("\0").filter(Boolean);
  assert.deepEqual(changedHistorical.filter(file => !file.startsWith(dir + "/m32final-") && file !== dir + "/m5-completion-run.json"), []);
  verifyRef(receipt.setup); const setup = json(receipt.setup.path);
  assert.equal(setup.baseline_commit, baseline); assert.equal(setup.head, baseline); assert.equal(setup.stage, "M3.2");
  assert.equal(setup.parent_receipt.path, parentPath); assert.equal(setup.parent_receipt.sha256, parentHash);
  verifyRef(setup.parent_receipt); verifyProtection(setup);
  assert.equal(setup.working_parent.mode, "explicit-sha256-same-stage");
  assert.deepEqual(setup.working_parent.receipt, setup.parent_receipt); assert.equal(setup.working_parent.prefix, "m32");
  assert.equal(setup.working_parent.r0_retained_files, previous.retained_files.length);
  assert.equal(setup.working_parent.additional_snapshot_credit, "Immutable bookkeeping only; not original R0 runtime or document acceptance.");
  for (const ref of setup.working_parent.snapshot) verifyRef(ref);
  const metadataReviews = [
    ["node_modules/.cache/stage-run.mjs", "98c755b1b338cd400a66bee111002856562a5ef270b2779fc94b359dbad53588"],
    ["node_modules/.cache/stage-git.mjs", "6f9a61f916a56c2bcb04630d498dbaed826a57e859bfde243d29dc9a4b1bd1b4"],
    ["node_modules/.cache/stage-working-parent-selfcheck.json", "ec735b0f83b595cf14bf3e3aca1ff27484316a5fde0335fdcc00af81e9d99abd"]
  ];
  for (const [file, expected] of metadataReviews) assert.equal(sha(read(file)), expected);
  report.reviewed_working_parent_helpers = metadataReviews.map(([file]) => reference(file));
  report.shared_read_only_metadata = reference("node_modules/.cache/stage-metadata.mjs");
  assert.equal(report.shared_read_only_metadata.sha256, setup.helpers.find(ref => /stage-metadata-/.test(ref.path)).sha256);
  const parentProtected = setup.protected_files.filter(ref => ref.path.startsWith(dir + "/m32-"));
  assert(parentProtected.some(ref => ref.path === parentPath));
  const parentFiles = [];
  for (const name of fs.readdirSync(dir).filter(name => name.startsWith("m32-"))) {
    const target = dir + "/" + name;
    parentFiles.push(...(fs.statSync(target).isDirectory() ? tree(target) : [reference(target)]));
  }
  assert.deepEqual(parentProtected.map(ref => ref.path).sort(), parentFiles.map(ref => ref.path).sort(), "Exact complete post-R0 parent evidence snapshot");
  assert.deepEqual(parentProtected.toSorted((a, b) => a.path.localeCompare(b.path)), setup.working_parent.snapshot);
  for (const ref of parentProtected) verifyRef(ref);
  const rawContexts = parentProtected.filter(ref => ref.path.endsWith("/error-context.md"));
  assert.equal(rawContexts.length, 4, "The four real raw Markdown contexts stay byte-exact");
  const attributes = reference(dir + "/.gitattributes");
  assert.deepEqual(read(attributes.path), Buffer.from("** -text\n"));
  const attributePaths = [attributes.path, parentPath, ...rawContexts.map(ref => ref.path)];
  const attrResult = git("check-attr", "-z", "text", "--", ...attributePaths).toString().split("\0");
  assert.equal(attrResult.pop(), "");
  assert.deepEqual(attrResult, attributePaths.flatMap(file => [file, "text", "unset"]));
  const oldApproval = reference("node_modules/.cache/m32-final-document-approval.json");
  assert.equal(oldApproval.sha256, "70ffc124cca064fdb912ba05ec7ae78a919eb1d284349d8f2b833936b48636ca");
  const oldWrapper = reference(dir + "/m32-verification.json");
  assert.equal(oldWrapper.sha256, "f009e5aa3334702a5439156a47c2b1f518d2a47ec2fc1b73f3b5c0ae766beccb");
  const rawParent = new Set(previous.retained_files.map(ref => ref.path));
  assert.deepEqual(setup.working_parent.additional_snapshot_paths,
    setup.working_parent.snapshot.filter(ref => !rawParent.has(ref.path) && ref.path !== parentPath).map(ref => ref.path));
  const parentRecords = read(previous.records.path).toString().trim().split(/\r?\n/).filter(Boolean).map(JSON.parse);
  assert.equal(parentRecords.length, 34);
  const parentFailures = parentRecords.filter(record => record.exit_code !== 0).map(record => {
    const run = JSON.parse(output(record.children.at(-1).stdout));
    return { label: record.label, before: record.before, stdout: record.children.at(-1).stdout,
      passed: run.stats.expected, unexpected: run.stats.unexpected,
      failures: tests(run).filter(item => ["failed", "timedOut", "interrupted"].includes(item.test.results[0]?.status))
        .map(item => ({ semantic: JSON.parse(item.semantic), status: item.test.results[0].status })), canonical_credit: 0 };
  });
  assert.deepEqual(parentFailures.map(record => [record.label, record.passed, record.unexpected]), [["focused-chromium", 43, 1], ["focused-webkit", 42, 2], ["browser-webkit", 875, 1]]);
  assert.equal(parentFailures.at(-1).failures[0].status, "timedOut");
  report.parent = { receipt: reference(parentPath), accepted_independent_raw_audit: oldAudit,
    original_attempts: previous.recorded_attempts, original_runtime_files: previous.retained_files.length,
    original_failed_attempts: parentFailures, historical_baseline_evidence_unchanged: true,
    post_R0_protected_files: parentProtected.filter(ref => !rawParent.has(ref.path)),
    exact_parent_prefix_files: parentProtected.length, raw_markdown_contexts: rawContexts,
    working_parent_mode: setup.working_parent.mode, working_parent_snapshot_sha256: sha(JSON.stringify(setup.working_parent.snapshot)),
    preserved_prior_semantic_approval: oldApproval, preserved_pending_wrapper: oldWrapper,
    exact_byte_git_attributes: { ...attributes, runtime_input_inventory_member: false, attribute: "text:unset", checked_paths: attributePaths },
    scope: "Original R0 and its references are immutable. Later parent-prefix metadata is protected separately and is not represented as part of original R0." };

  verifyRef(receipt.inputs); assert.equal(receipt.inputs.entries, 205);
  const files = inventory(), current = Object.fromEntries(files.map(file => [file, sha(normalized(read(file)))]));
  assert.deepEqual(Object.keys(json(receipt.inputs.path)), files); assert.deepEqual(json(receipt.inputs.path), current);
  const parentInputs = json(previous.inputs.path);
  const changedInputs = files.filter(file => parentInputs[file] !== current[file]);
  assert(changedInputs.includes("tools/knowledge-docs/knowledge-docs.mjs"));
  assert(changedInputs.every(file => ["tools/knowledge-docs/knowledge-docs.mjs", "tools/knowledge-docs/knowledge-docs.test.mjs"].includes(file)));
  assert.deepEqual(files.filter(file => file.startsWith("src/") && parentInputs[file] !== current[file]), []);
  assert.equal(current["tools/knowledge-docs/knowledge-docs.mjs"], "14be100273a57d1de02fffd888016ae1d9f427b0a33f525b8795ae00c10eb5b4");
  assert.equal(current["tools/knowledge-docs/knowledge-docs.test.mjs"], "c0cc1c5a8ef3ce075aae469b70bdb36c1d4895278ea6d0e7168ef623471c25a1");
  report.inputs = { ...receipt.inputs, changed_from_parent: changedInputs, runtime_source_changes_from_parent: 0 };
  const sourceSnapshot = reference(dir + "/m32final-source.json");
  assert.equal(sourceSnapshot.sha256, "1182ba20fb1fe67a532d4e76cb847ed6679078be7d0e1950e621a1147d554c55");
  const source = json(sourceSnapshot.path); assert.equal(Object.keys(source.independent_source_review.source_sha256).length, 13);
  for (const [file, expected] of Object.entries(source.independent_source_review.source_sha256)) assert.equal(sha(normalized(read(file))), expected, file);
  verifyRef(source.repository_metadata.evidence_attributes); assert.deepEqual(source.repository_metadata.evidence_attributes, attributes);
  for (const ref of source.diagnostics) verifyRef(ref); verifyRef(source.metadata_helper_review);
  report.source_review = { record: sourceSnapshot, owned_paths: 13, runtime_inventory_paths: 205, attributes_outside_runtime_inventory: attributes,
    scope: "Ten original caller/runtime paths unchanged, two existing documentation-tool paths corrected, and exact evidence-local raw-byte attributes added." };

  verifyRef(receipt.records); const records = read(receipt.records.path).toString().trim().split(/\r?\n/).filter(Boolean).map(JSON.parse);
  assert.equal(records.length, receipt.recorded_attempts);
  const latest = new Map(); for (const record of records) if (required.includes(record.label)) latest.set(record.label, record);
  assert.deepEqual([...latest.keys()].sort(), [...required].sort()); assert.equal(receipt.canonical_gates, 16);
  assert.deepEqual(Object.fromEntries(required.map(label => [label, latest.get(label)])), receipt.canonical);
  assert.deepEqual(records.filter(record => latest.get(record.label) !== record), receipt.retained_other_attempts);
  const every = [], maps = new Map();
  function recorded(record, canonical) {
    every.push(record);
    for (const key of ["before", "after"]) {
      verifyRef(record[key]); assert.equal(record[key].entries, 205);
      const map = json(record[key].path); assert.deepEqual(Object.keys(map), files); maps.set(record[key].path, map);
    }
    if (record.stdout) { output(record.stdout); verifyRef(record.stderr); }
    for (const ref of [...record.helpers, ...(record.attachments ?? [])]) verifyRef(ref);
    assert.equal(record.sources_unchanged, record.before.sha256 === record.after.sha256);
    assert.equal(record.helpers_unchanged, true);
    if (canonical) {
      assert.equal(record.exit_code, 0); assert(!record.driver_signal && !record.close_signal && !record.spawn_error && !record.validation_error && !record.error);
      assert(record.sources_unchanged); assert.equal(record.before.sha256, receipt.inputs.sha256); assert.equal(record.after.sha256, receipt.inputs.sha256);
      for (const ref of record.helpers) assert.equal(sha(read(ref.source)), ref.sha256);
    }
    for (const child of record.children ?? []) recorded(child, canonical);
  }
  for (const record of records) recorded(record, latest.get(record.label) === record);
  for (const map of maps.values()) assert(files.filter(file => map[file] !== current[file]).every(file => changedInputs.includes(file)));
  const leaf = records.flatMap(record => record.children ?? [record]).toSorted((a, b) => Date.parse(a.started) - Date.parse(b.started));
  let last = -Infinity;
  for (const record of leaf) { assert(Date.parse(record.started) >= last); last = Date.parse(record.finished); assert(last >= Date.parse(record.started)); }
  for (const ref of [...receipt.retained_files, ...receipt.builder]) verifyRef(ref);
  const checkerDiagnostics = [];
  for (const ref of receipt.retained_files.filter(ref => /\/m32final-docs-regression.*\.json$/.test(ref.path))) {
    const value = json(ref.path);
    if (!value.kind || !value.command) continue;
    verifyRef(value.before); verifyRef(value.after); verifyRef(value.stdout); verifyRef(value.stderr);
    assert.deepEqual(value.command, [process.execPath, "--test", "tools/knowledge-docs/knowledge-docs.test.mjs"]);
    assert.equal(value.sources_unchanged, true);
    assert.equal(value.before.sha256, value.after.sha256);
    const result = output(value.stdout).toString("utf8");
    assert.match(result, /tests\s+1/);
    const red = value.kind === "Windows_case_variant_regression_before_path_relative_correction";
    assert.equal(value.exit_code, red ? 1 : 0);
    assert.match(result, red ? /pass\s+0/ : /pass\s+1/); assert.match(result, red ? /fail\s+1/ : /fail\s+0/);
    if (red) assert.match(result, /DOCS\/implementation\/EVIDENCE\/run-1\/failure\/error-context\.md: error stamp: no frontmatter/);
    checkerDiagnostics.push({ record: ref, input: value.before, stdout: value.stdout, exit_code: value.exit_code, kind: value.kind,
      current_source: value.before.sha256 === receipt.inputs.sha256, canonical_gate_credit: 0, Vitest_unit_credit: 0 });
  }
  assert.equal(checkerDiagnostics.length, 3);
  assert.equal(checkerDiagnostics.filter(value => value.exit_code === 1).length, 1);
  assert(checkerDiagnostics.some(value => value.current_source && value.exit_code === 0), "A real separate checker regression must cover the final frozen source");
  report.separate_checker_regressions = checkerDiagnostics;
  const starts = fs.readdirSync(dir).filter(name => name.startsWith("m32final-") && name.endsWith("-start.json"));
  const results = fs.readdirSync(dir).filter(name => name.startsWith("m32final-") && name.endsWith("-result.json"));
  const pairedResults = new Set(starts.map(name => name.replace(/-start\.json$/, "-result.json")));
  assert.equal(starts.length, every.length); assert.deepEqual(receipt.incomplete_command_starts, []);
  const separateResults = results.filter(name => !pairedResults.has(name));
  for (const name of separateResults) {
    const value = json(dir + "/" + name);
    assert(value.kind && !value.label, "An unpaired result is explicitly separate metadata, not an unjournaled framework command");
    assert(receipt.retained_files.some(ref => ref.path === dir + "/" + name));
  }
  for (const name of starts) {
    const start = json(dir + "/" + name), result = json(dir + "/" + name.replace(/-start\.json$/, "-result.json"));
    const matches = every.filter(record => record.label === result.label && record.started === result.started); assert.equal(matches.length, 1);
    const actual = { ...matches[0] }; delete actual.build_outputs; delete actual.artifact; assert.deepEqual(actual, result);
    for (const key of ["label", "started", "before", "helpers"]) assert.deepEqual(start[key], result[key]);
    if (start.args) assert.deepEqual(start.args, result.args);
    for (const file of [name, name.replace(/-start\.json$/, "-result.json")]) assert(receipt.retained_files.some(ref => ref.path === dir + "/" + file));
  }
  report.attempts = { records: records.length, latest_canonical: latest.size, other_attempts: receipt.retained_other_attempts.length,
    leaf_commands: leaf.length, captured_start_result_pairs: starts.length,
    separate_metadata_result_files: separateResults.map(name => reference(dir + "/" + name)),
    input_maps: [...maps].map(([file, map]) => ({ path: file, sha256: sha(read(file)), entries: Object.keys(map).length })),
    original_parent_attempts: 34, parent_attempts_reclassified: false };
  report.attempts.superseded = receipt.retained_other_attempts.map(record => {
    assert(required.includes(record.label), "No new focused development run is represented as a canonical retry");
    assert.equal(record.sources_unchanged, true);
    const errors = record.stderr ? output(record.stderr).toString("utf8") : "";
    return { label: record.label, started: record.started, exit_code: record.exit_code, before: record.before, stdout: record.stdout,
      stderr: record.stderr, native_error_codes: [...new Set(errors.match(/ERR_[A-Z_]+/g) ?? [])], canonical_credit: 0,
      scope: "Retained superseded attempt. A later passing attempt supplies no cause or framework-fix inference." };
  });
  const text = record => output(record.stdout).toString("utf8").replace(/\u001b\[[0-9;]*[A-Za-z]/g, "");
  const npm = path.join(path.dirname(process.execPath), "node_modules/npm/bin/npm-cli.js");
  assert.deepEqual(latest.get("build").args, ["node_modules/typescript/bin/tsc", "-p", "tsconfig.json"]);
  assert.deepEqual(latest.get("types").args, ["node_modules/typescript/bin/tsc", "-p", "tsconfig.json", "--noEmit"]);
  const examples = files.filter(file => file.startsWith("examples/vite/") && file.endsWith(".ts") && !["vite.config.ts", "mock-server.ts"].includes(path.basename(file)));
  assert.deepEqual(latest.get("example-types").args, ["node_modules/typescript/bin/tsc", "--ignoreConfig", "--strict", "--noEmit", "--target", "ES2022", "--module", "NodeNext", "--moduleResolution", "NodeNext", "--lib", "ES2022,DOM", ...examples]);
  assert.deepEqual(latest.get("build").build_outputs, tree("build"));
  assert.deepEqual(latest.get("unit").args, ["node_modules/vitest/vitest.mjs", "run"]);
  assert.match(text(latest.get("unit")), /Tests\s+155 passed/); assert(!/\b\d+ (failed|skipped|todo)\b/.test(text(latest.get("unit"))));
  assert.deepEqual(receipt.checks.unit, { passed: 155 });
  report.browsers = []; let collection;
  for (const engine of ["chromium", "firefox", "webkit"]) {
    const record = latest.get("browser-" + engine);
    assert.equal(record.workers, 2); assert.equal(record.shards, 1); assert.deepEqual(record.focus_paths, []);
    assert.equal(record.complete, true); assert.deepEqual(record.children.map(child => child.label), [record.label + "-list", record.label + "-run-1"]);
    const [listRecord, runRecord] = record.children, list = JSON.parse(output(listRecord.stdout)), run = JSON.parse(output(runRecord.stdout));
    for (const [index, child] of record.children.entries()) {
      const flag = child.args.find(arg => arg.startsWith("--output=")); assert(flag?.startsWith("--output=docs/implementation/evidence/m32final-"));
      assert.deepEqual(child.args, ["node_modules/@playwright/test/cli.js", "test", "-c", "tests/playwright.config.ts", "--project=" + engine,
        "--workers=2", "--retries=0", "--reporter=json", flag, ...(index ? [] : ["--list"])]);
      assert.deepEqual(child.environment, { PLAYWRIGHT_BROWSERS_PATH: engine === "firefox" ? path.resolve("node_modules/.cache/playwright-m6") : null });
    }
    assert.equal(list.config.workers, 2); assert.equal(run.config.workers, 2); assert.equal(list.config.shard, null); assert.equal(run.config.shard, null);
    assert(tests(list).every(item => item.test.results.length === 0));
    const proof = browserProof(list, [{ listed: list, report: run }], engine);
    assert.equal(proof.passed, 876); assert.deepEqual(proof, record.coverage); assert.deepEqual(proof, receipt.checks.full_suites[engine]);
    const notes = tests(run).flatMap(item => (item.test.annotations ?? []).filter(note => note.type === "platform-conformance-limit").map(note => ({ semantic: JSON.parse(item.semantic), description: note.description })));
    if (engine === "webkit") { assert.equal(notes.length, 2); assert(notes.some(note => note.description.includes("cookie withholding is not certified"))); assert(notes.some(note => note.description.includes("wire omission is not certified"))); }
    else assert.deepEqual(notes, []);
    report.browsers.push({ engine, ...proof, list: listRecord.stdout, run: runRecord.stdout, platform_annotations: notes });
    if (engine === "chromium") collection = tests(list);
  }
  const retention = retainedProof(parentCollection(previous), collection, 155, 155);
  assert.deepEqual(retention, receipt.parent_case_retention); assert.deepEqual(receipt.count_changes_from_parent, { unit: 0, browser: 0 });
  const oldSetup = json(previous.setup.path); verifyRef(oldSetup.parent_receipt); const oldParent = json(oldSetup.parent_receipt.path);
  const cumulative = retainedProof(parentCollection(oldParent), collection, oldParent.checks.unit.passed, 155);
  assert.equal(cumulative.parent_unit_count, 150); assert.equal(cumulative.parent_browser_count, 857);
  report.case_retention = { immediate_parent: retention, cumulative_from_committed_M31: cumulative, new_cases_in_checker_fix: 0, full_families_closed: 0 };

  const packed = latest.get("pack"); verifyRef(packed.artifact); const descriptor = json(packed.artifact.path), actualArchive = archive(descriptor);
  assert.deepEqual(actualArchive, receipt.checks.artifact); assert.equal(actualArchive.files, 203);
  assert.deepEqual(packed.args, [npm, "pack", "--json", "--pack-destination", path.dirname(descriptor.tarball)]);
  const rawPack = JSON.parse(text(packed)); assert.equal(rawPack.length, 1);
  for (const [key, value] of Object.entries(rawPack[0])) assert.deepEqual(descriptor[key], value);
  const declarations = actualArchive.actual_payloads.filter(ref => ref.path.endsWith(".d.ts"));
  const oldDeclarations = previous.checks.artifact.actual_payloads.filter(ref => ref.path.endsWith(".d.ts"));
  assert.equal(declarations.length, 40); assert.deepEqual(declarations, oldDeclarations);
  assert.deepEqual(actualArchive.actual_payloads, previous.checks.artifact.actual_payloads);
  assert.equal(actualArchive.tarball.sha256, previous.checks.artifact.tarball.sha256, "The announced new archive is byte-identical to the immediate parent");
  assert.equal(actualArchive.tarball.bytes, previous.checks.artifact.tarball.bytes);
  const beforeM32Declarations = oldParent.checks.artifact.actual_payloads.filter(ref => ref.path.endsWith(".d.ts"));
  const cumulativeDeclarationDelta = declarations.filter(ref => ref.sha256 !== beforeM32Declarations.find(old => old.path === ref.path)?.sha256);
  assert.deepEqual(cumulativeDeclarationDelta.map(ref => ref.path), ["build/comm/index.d.ts"]);
  report.artifact = { ...actualArchive, raw_archive_equal_to_parent: actualArchive.tarball.sha256 === previous.checks.artifact.tarball.sha256,
    package_payloads_equal_to_parent: true, declarations: 40, declaration_changes_from_parent: 0, cumulative_declaration_changes_from_M31: cumulativeDeclarationDelta };
  report.installed = [];
  for (const label of ["consumers", "packed-chromium", "packed-firefox", "packed-webkit", "packed-chrome", "packed-edge"]) {
    const record = latest.get(label), args = label === "consumers" ? [npm, "run", "test:consumers", "--", "--tarball", descriptor.tarball, "--sha256", descriptor.sha256]
      : [npm, "run", "test:packed-browser", "--", "--tarball", descriptor.tarball, "--sha256", descriptor.sha256, "--browser", label.slice(7)];
    assert.deepEqual(record.args, args); const value = text(record); assert(value.includes(descriptor.sha256));
    assert(label === "consumers" ? value.includes("JS installed consumer passed.") && value.includes("TS installed consumer passed.") : value.includes("Packed browser consumer passed (" + label.slice(7) + " "));
    report.installed.push({ label, stdout: record.stdout, stderr: record.stderr, actual_tarball_sha256: descriptor.sha256 });
  }
  for (const [label, file] of [["binding-performance", "benchmark-m4.mjs"], ["viewport-performance", "benchmark-grid-viewport.mjs"]])
    assert.deepEqual(latest.get(label).args, ["tools/" + file, "--browser=chromium", "--runs=5", "--warmup=2"]);
  const perf = performance(JSON.parse(text(latest.get("binding-performance"))), JSON.parse(text(latest.get("viewport-performance"))));
  assert.deepEqual(perf, receipt.checks.performance); assert.deepEqual(perf.binding_budgets, previous.checks.performance.binding_budgets);
  assert.deepEqual(perf.viewport_budgets, previous.checks.performance.viewport_budgets); report.performance = perf;

  const immutable = {
    "m32-native-control-observation.json": "846a35416dc89b5770543dd2dd1e7fc570809b9abf77e67498be7b4b9569092b",
    "m32-native-control-output.json": "128f0b6f95a4f3a56f85383c0fa4b07ce1d61aec8d940900697b4886a5476ab4",
    "m32-retained-attempt-observations.json": "2ed3a821322b2fc59a4649774d3689a279fb64339a50ee197ba9de04903bfcdb",
    "m32-independent-date-trace-audit.json": "8f64f49b2a8dbf93082542136c8860d8df97962a6e4804db003018518d4e03d9",
    "m32-approved-omissions.json": "359f3ce21a32c354f092d3b146d810bf2b3b4966bfea791142f888208f056817",
    "m32-protocol.json": "ea71519a4e743362c10287ed500bccec1ac2dcb54a918144dacf34ebe6ac9b57"
  };
  report.preserved_observations = [];
  for (const [name, expected] of Object.entries(immutable)) { const ref = reference(dir + "/" + name); assert.equal(ref.sha256, expected); report.preserved_observations.push(ref); }
  const decision = json(dir + "/m32-approved-omissions.json"); assert.equal(decision.status, "approved_exact_five_only");
  assert.deepEqual(decision.decisions.map(item => [item.id, item.decision]), ["O01", "O02", "O03", "O04", "O05"].map(id => [id, "approved_narrow_omission"]));
  assert.deepEqual(read(decision.proposal.path), git("show", baseline + ":" + decision.proposal.path));
  const beforePackage = JSON.parse(git("show", baseline + ":package.json")); assert.deepEqual(json("package.json").exports, beforePackage.exports);
  assert.equal(Object.keys(json("package.json").dependencies ?? {}).length, 0);
  assert.equal(git("diff", baseline, "--", "v1").length, 0); assert.equal(git("status", "--porcelain", "--untracked-files=all", "--", "v1").length, 0);
  assert.equal(git("branch", "--show-current").toString().trim(), "2.0.0-alpha.0");
  report.protection = { protected_parent_evidence_exact: true, v1_unchanged: true, public_entries_unchanged: true, runtime_dependencies: 0,
    branch: "2.0.0-alpha.0", head: git("rev-parse", "HEAD").toString().trim(), original_M32_approval_or_check_failure_superseded_without_rewriting: true };
  report.status = "approved_independent_recorded_raw_evidence";
} catch (error) { report.status = "failed"; report.error = { message: error.message, stack: error.stack }; process.exitCode = 1; }
report.finished = new Date().toISOString(); fs.writeFileSync(destination, JSON.stringify(report, null, 2) + "\n", { flag: "wx" });
console.log(JSON.stringify({ status: report.status, output: destination, records: report.attempts?.records, inputs: report.inputs?.entries,
  suites: report.browsers?.map(item => [item.engine, item.passed]), package_files: report.artifact?.files, medians: report.performance?.raw_medians,
  budgets: report.performance?.checked_budgets, error: report.error?.message }));
