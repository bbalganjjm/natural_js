import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { dir, required, sha, read, json, normalized, git, reference, verifyRef, verifyProtection,
  unchangedEvidence, inventory, tree, output, tests, parentCollection, retainedProof, browserProof, archive, performance } from "./stage-metadata.mjs";

const self = "node_modules/.cache/m36-independent-audit.mjs", stem = "node_modules/.cache/m36-independent-audit";
let destination = stem + ".log";
for (let n = 2; fs.existsSync(destination); n++) destination = stem + "-" + n + ".log";
const baseline = "99aef8b0ce2897dbcd20fcf5cae4a80b6baa4450";
const report = { kind: "independent_recorded_byte_audit", stage: "M3.6", started: new Date().toISOString(), baseline,
  helper: reference(self), limits: ["Only existing recorded bytes are read. No compiler, browser, benchmark, model, or project checker is invoked.",
    "Shared reviewed metadata routines decode actual archive, performance, and browser proofs; exact source, commands, attempts, and inheritance are separately checked below.",
    "This audit grants no full-family closure, omission, release, native-conformance, Safari, manual assistive-technology, or token result. Historical failures keep their original scope."] };

try {
  const [receiptPath, expectedHash] = process.argv.slice(2);
  assert.equal(process.argv.length, 4); assert(/^[0-9a-f]{64}$/.test(expectedHash ?? ""));
  assert.equal(sha(read(receiptPath)), expectedHash, "Announced immutable M3.6 receipt");
  const receipt = json(receiptPath); assert.equal(receipt.schema, "natural-js-recorded-runtime/v1");
  assert.equal(receipt.stage, "M3.6"); assert.equal(receipt.prefix, "m36"); assert.equal(receipt.baseline_commit, baseline);
  report.receipt = { path: receiptPath, sha256: expectedHash, bytes: read(receiptPath).length };
  verifyRef(receipt.setup); const setup = json(receipt.setup.path);
  assert.equal(setup.stage, "M3.6"); assert.equal(setup.head, baseline); assert.equal(setup.baseline_commit, baseline); assert.equal(setup.working_parent, null);
  verifyProtection(setup); unchangedEvidence(baseline, "m36");
  report.shared_read_only_metadata = reference("node_modules/.cache/stage-metadata.mjs");
  assert.equal(report.shared_read_only_metadata.sha256, setup.helpers.find(ref => /stage-metadata-/.test(ref.path)).sha256);
  verifyRef(setup.parent_receipt); assert.equal(setup.parent_receipt.path, dir + "/m35-runtime-receipt.json");
  assert.equal(setup.parent_receipt.sha256, "8fcd4267841d2ee55fe84343a642383fe8e071ee61864b4bcb784b14a1d53d57");
  const previous = json(setup.parent_receipt.path); assert.equal(previous.recorded_attempts, 27);
  assert.equal(previous.checks.unit.passed, 163); assert.equal(previous.checks.full_suites.chromium.passed, 911);
  for (const ref of [...previous.retained_files, ...previous.builder]) verifyRef(ref);
  const parentFiles = [];
  for (const name of fs.readdirSync(dir).filter(name => name.startsWith("m35-"))) {
    const file = dir + "/" + name; parentFiles.push(...(fs.statSync(file).isDirectory() ? tree(file) : [reference(file)]));
  }
  const protectedParent = setup.protected_files.filter(ref => ref.path.startsWith(dir + "/m35-"));
  assert.deepEqual(protectedParent.map(ref => ref.path).sort(), parentFiles.map(ref => ref.path).sort());
  for (const ref of protectedParent) { verifyRef(ref); assert.deepEqual(read(ref.path), git("show", baseline + ":" + ref.path), ref.path); }
  const attributes = reference(dir + "/.gitattributes"); assert.equal(attributes.sha256, "48747480eddba024928d03be9bf83dc579e5515768647507a767e8187a85c9ab");
  assert.deepEqual(read(attributes.path), Buffer.from("** -text\n")); assert.deepEqual(read(attributes.path), git("show", baseline + ":" + attributes.path));
  assert.deepEqual(git("check-attr", "-z", "text", "--", attributes.path, receiptPath).toString().split("\0"),
    [attributes.path, "text", "unset", receiptPath, "text", "unset", ""]);
  report.parent = { receipt: setup.parent_receipt, original_attempts: 27, exact_committed_parent_prefix_files: protectedParent.length,
    raw_git_attributes: attributes, scope: "Committed M3.5 and all protected ancestors retain their exact bytes, attempts, controls, and prior limitations; no historical runtime is rerun or recertified." };

  verifyRef(receipt.inputs); assert.equal(receipt.inputs.entries, 215);
  const files = inventory(), current = Object.fromEntries(files.map(file => [file, sha(normalized(read(file)))])), oldInputs = json(previous.inputs.path);
  assert.deepEqual(Object.keys(json(receipt.inputs.path)), files); assert.deepEqual(json(receipt.inputs.path), current);
  const addedInputs = ["examples/vite/m4/employee-setup.json", "src/page/advice.ts", "tests/browser/fixtures/advice-controller.ts", "tests/browser/m36-advice.spec.ts", "tests/browser/page-advice.spec.ts", "tests/page-advice.test.ts"];
  assert.deepEqual(files.filter(file => !Object.hasOwn(oldInputs, file)).sort(), addedInputs.sort());
  assert.deepEqual(Object.keys(oldInputs).filter(file => !Object.hasOwn(current, file)), []);
  const correction = reference(dir + "/m36-source-correction.json"); assert.equal(correction.sha256, "3e1ac656e0cd0af61d9a8a8f79324c35b9dd1842aa19fbb01664ba064a95469e");
  const corrected = json(correction.path), approved = corrected.source_sha256;
  const changed = files.filter(file => current[file] !== oldInputs[file]); assert.deepEqual(changed.toSorted(), Object.keys(approved).sort()); assert.equal(changed.length, 12);
  for (const [file, expected] of Object.entries(approved)) assert.equal(current[file], expected, file);
  const snapshot = reference(dir + "/m36-automatic-advice.json"); assert.equal(snapshot.sha256, "6623bf2056e259f5a2eba13be9b435b3db7f6b8c1a606c5c4f1473d6ce37cf84");
  const source = json(snapshot.path); assert.deepEqual(source.independent_source_review.source_sha256, approved);
  verifyRef(source.independent_source_review.report); assert.equal(source.independent_source_review.report.sha256, "a6a7ea736e9c1463e9047863b687c25163db347a84d1db04aa85458ca0fe5c41");
  for (const ref of Object.values(source.independent_source_review.coverage)) if (typeof ref === "object") verifyRef(ref);
  verifyRef(source.declarations); assert.equal(source.declarations.sha256, "3f4532235081a57b0337f691026159b2799c80d0b97dd239940506f5eed304ab");
  verifyRef(source.written_plan); verifyRef(source.contract); assert.equal(source.written_plan.sha256, "514496c4b18849b2a5a13e96d667582fcc75a3f4a89dfb0dd469ed8d0de6426b"); assert.equal(source.contract.sha256, "1441bc3772066e21555cc663cc51ff3a80732426a3f3c7aba49a870362049de8");
  assert.equal(source.runtime_receipt, null); assert.equal(source.independent_raw_review, "pending"); assert.equal(source.independent_documents, "pending");
  verifyRef(source.development.diagnosis); assert.equal(source.development.diagnosis.sha256, "9de24ca3606e97ffb516052849ef4de138e579a90cb1431921560c99aeb4cbc6");
  const diagnostic = json(source.development.diagnosis.path); for (const ref of [diagnostic.before, diagnostic.after, diagnostic.expression, diagnostic.original_fixture, diagnostic.helper]) verifyRef(ref);
  assert.deepEqual(diagnostic.before, diagnostic.after); assert.equal(diagnostic.before.entries, 214);
  assert.equal(diagnostic.original_fixture.sha256, "8bb4bf4c07ce05d6b8d61f4bf8a7af71e43d00ba6f4995078c5e94b5ceb2be6e");
  assert.equal(diagnostic.expression.sha256, "bf1b1993a6a0f54169ab860e0f12f3116277fc6f554c25a170cc56a88126dc72");
  assert.equal(diagnostic.outcome.cause.name, "ReferenceError"); assert.equal(diagnostic.outcome.cause.message, "_classPrivateFieldInitSpec is not defined");
  const copiedDiagnosticHelper = reference(dir + "/m36-class-diagnostic.mjs"); assert.equal(copiedDiagnosticHelper.sha256, diagnostic.helper.sha256);
  const initialInputs = json(diagnostic.before.path), expectedInitial = { ...current }; delete expectedInitial["tests/browser/fixtures/advice-controller.ts"]; expectedInitial["tests/browser/page-advice.spec.ts"] = diagnostic.original_fixture.sha256;
  assert.deepEqual(initialInputs, expectedInitial);
  report.inputs = { ...receipt.inputs, changed_paths: changed, added_paths: addedInputs, initial_transport_inputs: diagnostic.before, initial_to_current_changes: ["tests/browser/page-advice.spec.ts", "tests/browser/fixtures/advice-controller.ts"] };
  report.source_review = { snapshot, correction, connected_review: source.independent_source_review.report, composite: source.independent_source_review.coverage, owned_paths: 12, source_sha256: approved,
    scope: "Composite owners retain independent core/app/original-fixture/transport scope; this raw auditor does not independently re-approve its authored original fixtures. Pending-at-capture fields stay immutable." };
  report.transport_diagnostic = { reference: source.development.diagnosis, expression: diagnostic.expression, original_fixture: diagnostic.original_fixture, executed_helper: copiedDiagnosticHelper, actual_outcome: diagnostic.outcome, canonical_credit: 0 };
  verifyRef(receipt.records); const records = read(receipt.records.path).toString().trim().split(/\r?\n/).filter(Boolean).map(JSON.parse);
  assert.equal(records.length, receipt.recorded_attempts); const latest = new Map();
  for (const record of records) if (required.includes(record.label)) latest.set(record.label, record);
  assert.deepEqual([...latest.keys()].sort(), [...required].sort()); assert.equal(receipt.canonical_gates, 16);
  assert.deepEqual(Object.fromEntries(required.map(label => [label, latest.get(label)])), receipt.canonical);
  const other = records.filter(record => latest.get(record.label) !== record); assert.deepEqual(other, receipt.retained_other_attempts);
  assert.equal(other.length, 12); assert(other.every(record => record.label.startsWith("focused-")));
  const every = [], maps = new Map();
  function recorded(record, canonical) {
    every.push(record); assert(!record.driver_signal && !record.close_signal && !record.spawn_error && !record.validation_error);
    if (record.exit_code !== 0) { assert.equal(record.exit_code, 1); assert(["focused-chromium", "focused-chromium-run-1"].includes(record.label)); assert(!canonical); }
    else assert(!record.error);
    assert.equal(record.sources_unchanged, true); assert.equal(record.helpers_unchanged, true);
    for (const key of ["before", "after"]) {
      verifyRef(record[key]); const values = json(record[key].path); maps.set(record[key].path, values);
      if (record[key].entries === 214) { assert(!canonical); assert.equal(record[key].sha256, diagnostic.before.sha256); assert.deepEqual(values, initialInputs); }
      else { assert.equal(record[key].entries, 215); assert.equal(record[key].sha256, receipt.inputs.sha256); assert.deepEqual(values, current); }
    }
    assert.equal(record.before.sha256, record.after.sha256);
    if (record.stdout) { output(record.stdout); verifyRef(record.stderr); }
    for (const ref of [...record.helpers, ...(record.attachments ?? [])]) verifyRef(ref);
    for (const ref of record.helpers) assert.equal(sha(read(ref.source)), ref.sha256);
    for (const child of record.children ?? []) recorded(child, canonical);
  }
  for (const record of records) recorded(record, latest.get(record.label) === record);
  assert.equal(records.filter(record => record.before.entries === 214).length, 5);
  const leaf = records.flatMap(record => record.children ?? [record]).toSorted((a, b) => Date.parse(a.started) - Date.parse(b.started));
  let finish = -Infinity;
  for (const record of leaf) { assert(Date.parse(record.started) >= finish); finish = Date.parse(record.finished); assert(finish >= Date.parse(record.started)); }
  for (const ref of [...receipt.retained_files, ...receipt.builder]) verifyRef(ref);
  const starts = fs.readdirSync(dir).filter(name => name.startsWith("m36-") && name.endsWith("-start.json")), results = fs.readdirSync(dir).filter(name => name.startsWith("m36-") && name.endsWith("-result.json"));
  assert.equal(starts.length, results.length); assert.equal(starts.length, every.length); assert.deepEqual(receipt.incomplete_command_starts, []);
  for (const name of starts) {
    const start = json(dir + "/" + name), result = json(dir + "/" + name.replace(/-start\.json$/, "-result.json"));
    const found = every.filter(record => record.label === result.label && record.started === result.started); assert.equal(found.length, 1);
    const actual = { ...found[0] }; delete actual.build_outputs; delete actual.artifact; assert.deepEqual(actual, result);
    for (const key of ["label", "started", "before", "helpers"]) assert.deepEqual(start[key], result[key]);
    if (start.args) assert.deepEqual(start.args, result.args);
    for (const file of [name, name.replace(/-start\.json$/, "-result.json")]) assert(receipt.retained_files.some(ref => ref.path === dir + "/" + file));
  }
  const failed = records.filter(record => record.exit_code !== 0); assert.equal(failed.length, 1); assert.equal(failed[0].label, "focused-chromium"); assert.equal(failed[0].before.entries, 214);
  report.attempts = { records: records.length, development: other.length, latest_canonical: latest.size, failures: failed.length,
    initial_transport_records: 5, current_source_records: records.length - 5, leaf_commands: leaf.length, captured_start_result_pairs: starts.length,
    maps: [...maps].map(([file, values]) => ({ ...reference(file), entries: Object.keys(values).length })) };
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
  const focusPaths = ["tests/browser/page-advice.spec.ts", "tests/browser/m36-advice.spec.ts", "tests/browser/page-lifecycle.spec.ts", "tests/browser/page-loading.spec.ts", "tests/browser/m4-screen.spec.ts"];
  for (const record of records.filter(record => record.children)) {
    const focused = record.label.startsWith("focused-"), engine = record.label.slice(8); assert(["chromium", "firefox", "webkit"].includes(engine));
    assert.equal(record.shards, 1); assert.equal(record.workers, focused ? 1 : 2); assert.deepEqual(record.focus_paths, focused ? focusPaths : []);
    assert.deepEqual(record.children.map(child => child.label), [record.label + "-list", record.label + "-run-1"]);
    const [listRecord, runRecord] = record.children, list = JSON.parse(output(listRecord.stdout)), run = JSON.parse(output(runRecord.stdout));
    for (const [index, child] of record.children.entries()) {
      const flag = child.args.find(arg => arg.startsWith("--output=")); assert(flag?.startsWith("--output=docs/implementation/evidence/m36-"));
      assert.deepEqual(child.args, ["node_modules/@playwright/test/cli.js", "test", "-c", "tests/playwright.config.ts", ...record.focus_paths,
        "--project=" + engine, "--workers=" + record.workers, "--retries=0", "--reporter=json", flag, ...(index ? [] : ["--list"])]);
      assert.deepEqual(child.environment, { PLAYWRIGHT_BROWSERS_PATH: engine === "firefox" ? path.resolve("node_modules/.cache/playwright-m6") : null });
    }
    assert.equal(list.config.workers, record.workers); assert.equal(run.config.workers, record.workers); assert.equal(list.config.shard, null); assert.equal(run.config.shard, null);
    const listed = tests(list), actual = tests(run); assert(tests(list).every(item => item.test.results.length === 0)); assert.equal(listed.length, focused ? 80 : 933);
    assert.deepEqual(actual.map(item => [item.id, item.semantic]).sort(), listed.map(item => [item.id, item.semantic]).sort()); assert.deepEqual(run.errors, []);
    const annotations = actual.flatMap(item => (item.test.annotations ?? []).filter(note => note.type === "platform-conformance-limit").map(note => ({ semantic: JSON.parse(item.semantic), description: note.description })));
    if (!focused && engine === "webkit") { assert.equal(annotations.length, 2); assert(annotations.some(note => note.description.includes("cookie withholding is not certified"))); assert(annotations.some(note => note.description.includes("wire omission is not certified"))); }
    else assert.deepEqual(annotations, []);
    if (record.exit_code) {
      assert.equal(focused, true); assert.equal(engine, "chromium"); assert.equal(record.complete, false); assert.equal(record.coverage, null);
      assert.equal(run.stats.expected, 79); assert.equal(run.stats.unexpected, 1); assert.equal(run.stats.skipped, 0); assert.equal(run.stats.flaky, 0);
      const failures = actual.filter(item => ["failed", "timedOut", "interrupted"].includes(item.test.results[0]?.status)); assert.equal(failures.length, 1);
      for (const item of actual) { assert.equal(item.test.results.length, 1); assert.equal(item.test.results[0].retry, 0); }
      assert.equal(JSON.parse(failures[0].semantic)[0], "page-advice.spec.ts"); assert.equal(JSON.parse(failures[0].semantic).at(-1), "two real pages discover nested methods and class lifecycle methods through native predicates with independent receivers");
      report.attempts.original_failed_browser = { label: record.label, input: record.before, passed: 79, failed: 1, actual_status: failures[0].test.results[0].status,
        errors: failures[0].test.results[0].errors, list: listRecord.stdout, run: runRecord.stdout, attachments: record.attachments, canonical_credit: 0,
        scope: "Original serialized test class used unavailable transform helpers. The diagnostic records the exact ReferenceError against unchanged production code; correcting test transport is not framework fix credit." }; continue;
    }
    assert.equal(record.complete, true); const proof = browserProof(list, [{ listed: list, report: run }], engine); assert.deepEqual(proof, record.coverage); assert.equal(proof.passed, focused ? 80 : 933);
    if (!focused) { assert.deepEqual(proof, receipt.checks.full_suites[engine]); semanticHash ??= proof.semantic_identities_sha256; assert.equal(proof.semantic_identities_sha256, semanticHash); if (engine === "chromium") collection = listed; }
    report.browsers.push({ label: record.label, input: record.before, ...proof, list: listRecord.stdout, run: runRecord.stdout, platform_annotations: annotations });
  }
  for (const engine of ["chromium", "firefox", "webkit"]) assert(report.browsers.some(record => record.label === "focused-" + engine && record.passed === 80 && record.input.entries === 215));
  report.original_failure_diagnostics = [];
  for (const ref of failed.flatMap(record => record.attachments ?? [])) {
    verifyRef(ref);
    if (ref.path.endsWith(".zip")) {
      const members = execFileSync("tar", ["-tf", ref.path], { encoding: "utf8", maxBuffer: 16 * 1024 * 1024 }).trim().split(/\r?\n/);
      assert.equal(new Set(members).size, members.length); assert(members.every(file => !path.isAbsolute(file) && !file.split("/").includes("..")));
      assert(!members.some(file => /^(src|screenshots|screencast)\//.test(file) || file.includes("src@")));
      const events = members.filter(file => file.endsWith(".trace")).flatMap(file => execFileSync("tar", ["-xOf", ref.path, file], { encoding: "utf8", maxBuffer: 16 * 1024 * 1024 }).split(/\r?\n/).filter(Boolean).map(JSON.parse));
      assert(events.length); assert(!events.some(event => event.type === "screencast-frame"));
      report.original_failure_diagnostics.push({ ...ref, kind: "actual_failed_browser_trace", archive_members: members.length, trace_events: events.length, canonical_credit: 0 });
    } else report.original_failure_diagnostics.push({ ...ref, kind: ref.path.endsWith("/error-context.md") ? "actual_failed_browser_context" : ref.path.endsWith("/.last-run.json") ? "retained_browser_run_metadata" : "retained_run_attachment", canonical_credit: 0 });
  }
  assert(report.original_failure_diagnostics.some(item => item.kind === "actual_failed_browser_trace"));
  const parentTests = parentCollection(previous), retention = retainedProof(parentTests, collection, 163, 217); assert.deepEqual(retention, receipt.parent_case_retention);
  assert.deepEqual(receipt.count_changes_from_parent, { unit: 54, browser: 22 });
  const parentKeys = new Set(parentTests.map(item => item.retained)), added = collection.filter(item => !parentKeys.has(item.retained)); assert.equal(added.length, 22);
  assert.equal(added.filter(item => JSON.parse(item.semantic)[0] === "page-advice.spec.ts").length, 16); assert.equal(added.filter(item => JSON.parse(item.semantic)[0] === "m36-advice.spec.ts").length, 6);
  report.case_retention = { ...retention, added_unit_cases: 54, new_browser_cases: added.map(item => JSON.parse(item.semantic)), full_families_closed: 0 };
  const packed = latest.get("pack"); verifyRef(packed.artifact); const descriptor = json(packed.artifact.path), actualArchive = archive(descriptor);
  assert.deepEqual(actualArchive, receipt.checks.artifact); assert.equal(actualArchive.files, 208);
  assert.equal(actualArchive.tarball.sha256, "e81cbaa02b5e8b9d9fd8aee8acb5504b902fa44c8a9ed4625783ef977ecf040e"); assert.equal(actualArchive.tarball.bytes, 370661); assert.equal(actualArchive.unpacked_bytes, 1872927);
  assert.deepEqual(packed.args, [npm, "pack", "--json", "--pack-destination", path.dirname(descriptor.tarball)]);
  const rawPack = JSON.parse(text(packed)); assert.equal(rawPack.length, 1); for (const [key, value] of Object.entries(rawPack[0])) assert.deepEqual(descriptor[key], value);
  const parentPayloads = previous.checks.artifact.actual_payloads, byPath = new Map(parentPayloads.map(ref => [ref.path, ref])), declarations = actualArchive.actual_payloads.filter(ref => ref.path.endsWith(".d.ts")), parentDeclarations = parentPayloads.filter(ref => ref.path.endsWith(".d.ts"));
  assert.equal(declarations.length, 41); assert.equal(parentDeclarations.length, 40);
  const changedDeclarations = declarations.filter(ref => byPath.has(ref.path) && byPath.get(ref.path).sha256 !== ref.sha256), addedDeclarations = declarations.filter(ref => !byPath.has(ref.path));
  assert.deepEqual(changedDeclarations.map(ref => ref.path), ["build/page/index.d.ts"]); assert.deepEqual(addedDeclarations.map(ref => ref.path), ["build/page/advice.d.ts"]);
  const declarationProof = json(source.declarations.path); assert.equal(declarationProof.entries, 41); assert.equal(declarationProof.parent_entries, 40); assert.equal(declarationProof.unchanged, 39);
  assert.deepEqual(declarationProof.changed, changedDeclarations.map(ref => ({ path: ref.path, before: byPath.get(ref.path).sha256, after: ref.sha256 }))); assert.deepEqual(declarationProof.added, addedDeclarations); assert.deepEqual(declarationProof.removed, []);
  assert.deepEqual(declarationProof.current_tarball, actualArchive.tarball); assert.deepEqual(declarationProof.parent_tarball, previous.checks.artifact.tarball);
  const changedPayloads = actualArchive.actual_payloads.filter(ref => byPath.has(ref.path) && byPath.get(ref.path).sha256 !== ref.sha256), addedPayloads = actualArchive.actual_payloads.filter(ref => !byPath.has(ref.path));
  assert.deepEqual(changedPayloads.map(ref => ref.path).sort(), ["build/page/index.d.ts", "build/page/index.d.ts.map", "build/page/index.js", "build/page/index.js.map", "src/page/index.ts"].sort());
  const newFiles = ["build/page/advice.d.ts", "build/page/advice.d.ts.map", "build/page/advice.js", "build/page/advice.js.map", "src/page/advice.ts"];
  assert.deepEqual(addedPayloads.map(ref => ref.path).sort(), newFiles.sort()); assert.deepEqual(actualArchive.actual_payloads.map(ref => ref.path).sort(), [...byPath.keys(), ...newFiles].sort());
  assert.notEqual(actualArchive.tarball.sha256, previous.checks.artifact.tarball.sha256);
  report.artifact = { ...actualArchive, declarations: 41, unchanged_declarations: 39, changed_declarations: changedDeclarations, added_declarations: addedDeclarations, changed_payloads: changedPayloads, added_payloads: addedPayloads,
    scope: "One PageDefinition field and PageAdvice type; five new private Page-module payloads and five changed Page-index payloads. All 203 parent package filenames remain." };
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
