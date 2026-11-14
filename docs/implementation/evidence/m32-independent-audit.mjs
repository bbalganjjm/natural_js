import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { dir, required, sha, read, json, normalized, git, reference, verifyRef, verifyProtection,
  unchangedEvidence, inventory, tree, output, tests, parentCollection, retainedProof, browserProof,
  archive, performance } from "./stage-metadata.mjs";

const logStem = "node_modules/.cache/m32-independent-audit";
let destination = logStem + ".log";
for (let number = 2; fs.existsSync(destination); number++) destination = logStem + "-" + number + ".log";
const baseline = "3a9a2c8c8ac978dd39df66c5e9a864ee062ce56c";
const report = { kind: "independent_recorded_byte_audit", stage: "M3.2", started: new Date().toISOString(), baseline,
  helper: reference("node_modules/.cache/m32-independent-audit.mjs"),
  limits: ["Only existing recorded bytes are read; no compiler, browser, benchmark, model or project checker is invoked.",
    "Shared independently reviewed metadata functions rederive archive, performance and case proofs; actual commands, maps and attempts are separately checked here.",
    "Historical runtime is preserved rather than rerun. This raw audit confers no additional public-contract or omission approval, whole-family closure, Safari, manual assistive-technology or token result."] };

try {
  const [receiptPath, expectedHash] = process.argv.slice(2);
  assert.equal(process.argv.length, 4); assert(/^[0-9a-f]{64}$/.test(expectedHash ?? ""));
  assert.equal(sha(read(receiptPath)), expectedHash, "Announced immutable R0");
  const receipt = json(receiptPath); assert.equal(receipt.schema, "natural-js-recorded-runtime/v1");
  assert.equal(receipt.prefix, "m32"); assert.equal(receipt.stage, "M3.2"); assert.equal(receipt.baseline_commit, baseline);
  report.receipt = { path: receiptPath, sha256: expectedHash, bytes: read(receiptPath).length };
  report.shared_read_only_metadata = reference("node_modules/.cache/stage-metadata.mjs");
  verifyRef(receipt.setup); const setup = json(receipt.setup.path);
  assert.equal(setup.baseline_commit, baseline); assert.equal(setup.head, baseline); assert.equal(setup.stage, "M3.2");
  assert.equal(report.shared_read_only_metadata.sha256, setup.helpers.find(ref => /stage-metadata-/.test(ref.path)).sha256);
  verifyProtection(setup); unchangedEvidence(baseline, "m32");
  const textFixtures = new Set(["tools/benchmark-m4.mjs", "tools/benchmark-grid-viewport.mjs", "examples/vite/benchmark.ts", "examples/vite/benchmark.html"]);
  report.protected_files = setup.protected_files.map(ref => {
    verifyRef(ref); const committed = git("show", baseline + ":" + ref.path), isTextFixture = textFixtures.has(ref.path);
    assert.deepEqual(isTextFixture ? normalized(read(ref.path)) : read(ref.path), isTextFixture ? normalized(committed) : committed, ref.path);
    return { ...ref, baseline_match: isTextFixture ? "UTF-8; CRLF normalized to LF" : "raw bytes" };
  });
  verifyRef(setup.parent_receipt); const previous = json(setup.parent_receipt.path);
  assert.equal(previous.checks.unit.passed, 150); assert.equal(previous.checks.full_suites.chromium.passed, 857);
  report.parent = setup.parent_receipt;
  const baselineEvidence = git("ls-tree", "-r", "--name-only", baseline, "--", dir).toString().trim().split("\n");
  report.historical_evidence = { baseline_files: baselineEvidence.length, unchanged_against_git: true,
    allowed_current_queue_update: dir + "/m5-completion-run.json", historical_runtime_recertified: false };

  verifyRef(receipt.inputs); assert.equal(receipt.inputs.entries, 205);
  report.inputs = receipt.inputs;
  const files = inventory(), current = Object.fromEntries(files.map(file => [file, sha(normalized(read(file)))]));
  assert.deepEqual(Object.keys(json(receipt.inputs.path)), files); assert.deepEqual(json(receipt.inputs.path), current);
  verifyRef(receipt.records); const records = read(receipt.records.path).toString().trim().split(/\r?\n/).map(JSON.parse);
  assert.equal(records.length, receipt.recorded_attempts); const latest = new Map();
  for (const record of records) if (required.includes(record.label)) latest.set(record.label, record);
  assert.equal(latest.size, 16); assert.equal(receipt.canonical_gates, 16);
  assert.deepEqual(Object.fromEntries(required.map(label => [label, latest.get(label)])), receipt.canonical);
  const other = records.filter(record => latest.get(record.label) !== record);
  assert.deepEqual(other, receipt.retained_other_attempts); assert(other.every(record => record.label.startsWith("focused-") || required.includes(record.label)));
  const development = other.filter(record => record.label.startsWith("focused-")), superseded = other.filter(record => required.includes(record.label));
  const maps = new Map(), every = [];
  function recorded(record, canonical) {
    every.push(record);
    for (const name of ["before", "after"]) {
      verifyRef(record[name]); const map = json(record[name].path); maps.set(record[name].path, map);
      assert.deepEqual(Object.keys(map), files); assert.equal(record[name].entries, 205);
    }
    assert.equal(record.sources_unchanged, record.before.sha256 === record.after.sha256);
    assert.equal(record.helpers_unchanged, true);
    for (const ref of record.helpers) { verifyRef(ref); assert.equal(sha(read(ref.source)), ref.sha256); }
    if (record.stdout) { output(record.stdout); verifyRef(record.stderr); }
    for (const ref of record.attachments ?? []) verifyRef(ref);
    if (canonical) {
      assert.equal(record.exit_code, 0); assert(!record.driver_signal && !record.close_signal && !record.spawn_error && !record.validation_error && !record.error);
      assert.equal(record.sources_unchanged, true); assert.equal(record.before.sha256, receipt.inputs.sha256); assert.equal(record.after.sha256, receipt.inputs.sha256);
    }
    for (const child of record.children ?? []) recorded(child, canonical);
  }
  for (const record of records) recorded(record, latest.get(record.label) === record);
  assert(maps.size > 1);
  for (const map of maps.values()) assert(files.filter(file => map[file] !== current[file]).every(file => file === "tests/browser/communicator-protocol.spec.ts"));
  const leaf = records.flatMap(record => record.children ?? [record]).toSorted((a, b) => Date.parse(a.started) - Date.parse(b.started));
  let finished = -Infinity;
  for (const command of leaf) { assert(Date.parse(command.started) >= finished); assert(Date.parse(command.finished) >= Date.parse(command.started)); finished = Date.parse(command.finished); }
  for (const ref of receipt.retained_files) verifyRef(ref);
  for (const ref of receipt.builder) verifyRef(ref);
  const starts = fs.readdirSync(dir).filter(file => file.startsWith("m32-") && file.endsWith("-start.json"));
  const results = fs.readdirSync(dir).filter(file => file.startsWith("m32-") && file.endsWith("-result.json"));
  assert.equal(starts.length, results.length); assert.equal(results.length, every.length); assert.deepEqual(receipt.incomplete_command_starts, []);
  for (const file of starts) {
    const start = json(dir + "/" + file), result = json(dir + "/" + file.replace(/-start\.json$/, "-result.json"));
    const actual = every.filter(item => item.label === result.label && item.started === result.started); assert.equal(actual.length, 1);
    const comparable = { ...actual[0] }; delete comparable.build_outputs; delete comparable.artifact;
    assert.deepEqual(comparable, result);
    for (const key of ["label", "started", "before", "helpers"]) assert.deepEqual(start[key], result[key]);
    if (start.args) assert.deepEqual(start.args, result.args);
    assert(receipt.retained_files.some(ref => ref.path === dir + "/" + file));
    assert(receipt.retained_files.some(ref => ref.path === dir + "/" + file.replace(/-start\.json$/, "-result.json")));
  }
  const text = record => output(record.stdout).toString("utf8").replace(/\u001b\[[0-9;]*[A-Za-z]/g, "");
  const failed = records.filter(record => record.exit_code !== 0), failedFocus = failed.filter(record => record.label.startsWith("focused-"));
  assert.deepEqual(failedFocus.map(record => record.label), ["focused-chromium", "focused-webkit"]);
  assert(failed.filter(record => !record.label.startsWith("focused-")).every(record => record.label === "browser-webkit"));
  assert(failed.every(record => record.children.length === 2 && record.complete === false && record.coverage === null));
  const developmentUnits = other.filter(record => record.label === "focused-unit"); assert.equal(developmentUnits.length, 1);
  assert.equal(developmentUnits[0].exit_code, 0); assert.match(text(developmentUnits[0]), /Tests\s+155 passed/);
  report.attempts = { records: records.length, development: development.length, superseded_canonical: superseded.length, final_gates: latest.size, leaf_commands: leaf.length,
    captured_start_result_pairs: starts.length, maps: [...maps].map(([file, map]) => ({ file, sha256: sha(read(file)), entries: Object.keys(map).length, current_differences: files.filter(key => map[key] !== current[key]) })),
    original_failed_browsers: [], focused_unit: { stdout: developmentUnits[0].stdout, passed: 155 },
    limit: "Original auth/strict platform assertions and superseded full-suite failures retain zero final canonical credit. A successful unchanged retry does not explain an earlier failure." };

  const npm = path.join(path.dirname(process.execPath), "node_modules/npm/bin/npm-cli.js");
  assert.deepEqual(latest.get("build").args, ["node_modules/typescript/bin/tsc", "-p", "tsconfig.json"]);
  assert.deepEqual(latest.get("types").args, ["node_modules/typescript/bin/tsc", "-p", "tsconfig.json", "--noEmit"]);
  assert.deepEqual(latest.get("unit").args, ["node_modules/vitest/vitest.mjs", "run"]);
  const examples = files.filter(file => file.startsWith("examples/vite/") && file.endsWith(".ts") && !["vite.config.ts", "mock-server.ts"].includes(path.basename(file)));
  assert.deepEqual(latest.get("example-types").args, ["node_modules/typescript/bin/tsc", "--ignoreConfig", "--strict", "--noEmit", "--target", "ES2022", "--module", "NodeNext", "--moduleResolution", "NodeNext", "--lib", "ES2022,DOM", ...examples]);
  assert.deepEqual(latest.get("build").build_outputs, tree("build"));
  assert.match(text(latest.get("unit")), /Tests\s+155 passed/); assert(!/\b\d+ (failed|skipped|todo)\b/.test(text(latest.get("unit"))));
  assert.deepEqual(receipt.checks.unit, { passed: 155 });
  const completeTests = new Map(); report.browsers = [];
  for (const record of records.filter(record => record.children)) {
    const focused = record.label.startsWith("focused-"), engine = record.label.slice(8);
    assert(["chromium", "firefox", "webkit"].includes(engine)); assert.equal(record.shards, 1); assert.equal(record.workers, focused ? 1 : 2);
    const primaryFocus = focused && JSON.stringify(record.focus_paths) === JSON.stringify(["tests/browser/communicator-protocol.spec.ts", "tests/browser/m4-screen.spec.ts"]);
    if (focused && !primaryFocus) assert.deepEqual(record.focus_paths, ["tests/browser/tree-date-screen.spec.ts"]);
    if (!focused) assert.deepEqual(record.focus_paths, []);
    assert.deepEqual(record.children.map(child => child.label), [record.label + "-list", record.label + "-run-1"]);
    const [listRecord, runRecord] = record.children, list = JSON.parse(output(listRecord.stdout)), run = JSON.parse(output(runRecord.stdout));
    for (const [index, child] of record.children.entries()) {
      const flag = child.args.find(arg => arg.startsWith("--output=")); assert(flag && flag.startsWith("--output=docs/implementation/evidence/m32-"));
      assert.deepEqual(child.args, ["node_modules/@playwright/test/cli.js", "test", "-c", "tests/playwright.config.ts", ...record.focus_paths,
        "--project=" + engine, "--workers=" + record.workers, "--retries=0", "--reporter=json", flag, ...(index ? [] : ["--list"])]);
      assert.deepEqual(child.environment, { PLAYWRIGHT_BROWSERS_PATH: engine === "firefox" ? path.resolve("node_modules/.cache/playwright-m6") : null });
      const data = index ? run : list; assert.equal(data.config.workers, record.workers); assert.equal(data.config.shard, null);
      assert(data.config.projects.every(project => project.retries === 0));
    }
    assert(tests(list).every(item => item.test.results.length === 0));
    const expectedCases = focused ? primaryFocus ? 44 : 4 : 876;
    const listedTests = tests(list), actualTests = tests(run); assert.equal(listedTests.length, expectedCases);
    assert.deepEqual(run.errors, []); assert.deepEqual(actualTests.map(item => [item.id, item.semantic]).sort(), listedTests.map(item => [item.id, item.semantic]).sort());
    const annotations = actualTests.flatMap(item => (item.test.annotations ?? []).filter(note => note.type === "platform-conformance-limit")
      .map(note => ({ semantic: JSON.parse(item.semantic), description: note.description })));
    if (record.exit_code) {
      const expected = !focused ? { passed: 875, failed: 1 } : engine === "chromium" ? { passed: 43, failed: 1 } : { passed: 42, failed: 2 };
      assert(!focused || primaryFocus);
      assert.equal(run.stats.expected, expected.passed); assert.equal(run.stats.unexpected, expected.failed);
      assert.equal(run.stats.skipped, 0); assert.equal(run.stats.flaky, 0); assert.equal(record.complete, false);
      const failures = actualTests.filter(item => ["failed", "timedOut", "interrupted"].includes(item.test.results[0]?.status)); assert.equal(failures.length, expected.failed);
      for (const item of actualTests) {
        assert.equal(item.test.results.length, 1); assert.equal(item.test.results[0].retry, 0);
        assert(["passed", "failed", "timedOut", "interrupted"].includes(item.test.results[0].status));
      }
      if (!focused) {
        assert.equal(engine, "webkit"); assert.equal(JSON.parse(failures[0].semantic)[0], "tree-date-screen.spec.ts");
        assert(JSON.parse(failures[0].semantic).at(-1).startsWith("stack connects Tree and DatePicker"));
        assert.equal(record.before.sha256, receipt.inputs.sha256); assert.equal(annotations.length, 2);
      } else if (engine === "chromium") assert.equal(JSON.parse(failures[0].semantic).at(-1), "native XHR open credentials satisfy a local browser-managed Basic challenge");
      else assert.deepEqual(failures.map(item => JSON.parse(item.semantic).at(-1)).sort(), ["native request recipes preserve query JSON repeated keys headers and explicit bodies", "second-origin credentials use native browser CORS and explicit include or omit"].sort());
      report.attempts.original_failed_browsers.push({ label: record.label, before: record.before, list: listRecord.stdout, run: runRecord.stdout,
        ...expected, failed_cases: failures.map(item => ({ semantic: JSON.parse(item.semantic), actual_status: item.test.results[0].status, errors: item.test.results[0].errors })),
        attachments: record.attachments, canonical_credit: 0, platform_annotations: annotations,
        scope: focused ? "Original development/native assertion outcome; no framework bug-fix credit." : "Unchanged existing Tree/date timeout. Later diagnostic/retry passes do not establish its cause." });
      continue;
    }
    assert.equal(record.complete, true); const proof = browserProof(list, [{ listed: list, report: run }], engine);
    assert.deepEqual(proof, record.coverage); assert.equal(proof.passed, expectedCases);
    for (const item of actualTests) { assert.deepEqual(item.test.results[0].errors, []); assert.equal(item.test.status, "expected"); }
    if (engine === "webkit" && (!focused || primaryFocus)) {
      assert.equal(annotations.length, 2); assert(annotations.some(note => note.description.includes("cookie withholding is not certified")));
      assert(annotations.some(note => note.description.includes("wire omission is not certified")));
    } else assert.deepEqual(annotations, []);
    if (!focused) { assert.deepEqual(proof, receipt.checks.full_suites[engine]); completeTests.set(engine, listedTests); }
    report.browsers.push({ label: record.label, purpose: focused ? primaryFocus ? "primary_protocol_and_M4" : "unchanged_tree_date_diagnostic" : "canonical_full",
      input_manifest: record.before, final_source_credit: record.before.sha256 === receipt.inputs.sha256,
      workers: record.workers, shards: 1, ...proof, list: listRecord.stdout, run: runRecord.stdout, platform_annotations: annotations });
  }
  assert.equal(completeTests.size, 3); assert.equal(report.attempts.original_failed_browsers.length, failed.length);
  for (const engine of ["chromium", "firefox", "webkit"]) {
    assert(report.browsers.some(item => item.label === "focused-" + engine && item.purpose === "primary_protocol_and_M4" && item.final_source_credit));
    assert(report.browsers.some(item => item.label === "focused-" + engine && item.purpose === "unchanged_tree_date_diagnostic" && item.final_source_credit && item.passed === 4));
  }
  const currentTests = completeTests.get("chromium"), parentTests = parentCollection(previous);
  const retention = retainedProof(parentTests, currentTests, previous.checks.unit.passed, 155); assert.deepEqual(retention, receipt.parent_case_retention);
  const parentKeys = new Set(parentTests.map(item => item.retained)), added = currentTests.filter(item => !parentKeys.has(item.retained));
  assert.equal(added.length, 19);
  const titles = [...read("tests/browser/communicator-protocol.spec.ts").toString().matchAll(/^test\("([^"]+)"/gm)].map(match => match[1]);
  assert.equal(titles.length, 16); titles.push("closing during a delayed native XHR search does not update a removed page",
    ...["side", "stack"].map(layout => layout + " runs actual search edit and save through the opt-in native employee sender"));
  assert.deepEqual(added.map(item => JSON.parse(item.semantic).at(-1)).sort(), titles.sort());
  assert.equal(added.filter(item => JSON.parse(item.semantic)[0] === "communicator-protocol.spec.ts").length, 16);
  assert.equal(added.filter(item => JSON.parse(item.semantic)[0] === "m4-screen.spec.ts").length, 3);
  const semantic = receipt.checks.full_suites.chromium.semantic_identities_sha256;
  for (const engine of ["firefox", "webkit"]) assert.equal(receipt.checks.full_suites[engine].semantic_identities_sha256, semantic);
  assert.deepEqual(receipt.count_changes_from_parent, { unit: 5, browser: 19 });
  report.case_retention = { ...retention, new_browser_cases: added.map(item => JSON.parse(item.semantic)), added_unit_cases: 5,
    new_unit_breakdown: { captured_custom_sender_contracts: 5 }, full_families_closed: 0 };

  const controlPath = dir + "/m32-native-control-observation.json", control = json(controlPath);
  assert(receipt.retained_files.some(ref => ref.path === controlPath)); verifyRef(control.script); verifyRef(control.output);
  assert.equal(control.output.sha256, "128f0b6f95a4f3a56f85383c0fa4b07ce1d61aec8d940900697b4886a5476ab4");
  assert.equal(control.kind, "native_engine_control_not_framework_gate"); assert.equal(control.platform, "win32"); assert.equal(control.exit_code, 0);
  const vectors = json(control.output.path); assert.equal(vectors.length, 11);
  const credentialVectors = vectors.slice(0, 9), bodyVectors = vectors.slice(9);
  assert.deepEqual(credentialVectors.map(item => [item.credentials, item.kind]), ["omit", "same-origin", "include"].flatMap(mode => ["url", "request", "clone"].map(kind => [mode, kind])));
  for (const item of credentialVectors) {
    assert.equal(item.constructed, item.credentials); assert.equal(item.cloned, item.kind === "url" ? null : item.credentials);
    assert.equal(item.echo.headers.cookie, "employee-control=yes"); assert.notEqual(new URL(item.echo.headers.origin).host, item.echo.headers.host);
  }
  assert.deepEqual(bodyVectors.map(item => item.kind), ["string", "bytes"]);
  for (const item of bodyVectors) { assert.deepEqual(item.before, []); assert.equal(item.echo.headers["content-type"], "application/x-www-form-urlencoded"); assert.equal(item.echo.body, "raw text"); }
  assert.deepEqual(control.findings.credentials, credentialVectors.map(item => ({ kind: item.kind, requested: item.credentials, constructed: item.constructed, cloned: item.cloned, cookie: item.echo.headers.cookie })));
  assert.deepEqual(control.findings.content_type, bodyVectors.map(item => ({ kind: item.kind, before: item.before, wire: item.echo.headers["content-type"] })));
  const nativeSource = read(control.script.path).toString(); assert(nativeSource.includes("import { webkit }")); assert(!nativeSource.includes("createCommunicator"));
  assert(!nativeSource.includes("src/comm") && !nativeSource.includes("natural_js/comm"));
  report.native_platform_limits = { observation: reference(controlPath), script: control.script, output: control.output,
    native_credential_vectors: 9, native_deleted_header_vectors: 2, findings: control.findings,
    final_full_webkit_annotation_count: report.browsers.find(item => item.label === "browser-webkit").platform_annotations.length,
    scope: "Pinned Windows WebKit native delegation only. Cookie/header withholding remains an unresolved platform-conformance/release boundary, not a standards pass or approved omission.", canonical_gate_credit: 0 };
  report.original_failure_diagnostics = [];
  for (const record of failed) {
    for (const ref of record.attachments ?? []) {
      verifyRef(ref);
      if (ref.path.endsWith(".zip")) {
        const members = execFileSync("tar", ["-tf", ref.path], { encoding: "utf8", maxBuffer: 16 * 1024 * 1024 }).trim().split(/\r?\n/);
        assert.equal(new Set(members).size, members.length); assert(members.every(file => !path.isAbsolute(file) && !file.split("/").includes("..")));
        assert(!members.some(file => /^(src|screenshots|screencast)\//.test(file) || file.includes("src@")));
        const events = members.filter(file => file.endsWith(".trace")).flatMap(file => execFileSync("tar", ["-xOf", ref.path, file], { encoding: "utf8", maxBuffer: 16 * 1024 * 1024 }).split(/\r?\n/).filter(Boolean).map(JSON.parse));
        assert(events.length > 0); assert(!events.some(event => event.type === "screencast-frame"));
        report.original_failure_diagnostics.push({ ...ref, kind: "actual_failed_browser_trace", archive_members: members.length, trace_events: events.length, source_or_screencast_capture: false, canonical_credit: 0 });
      } else if (/context\.(?:txt|md)$/.test(ref.path)) report.original_failure_diagnostics.push({ ...ref, kind: "actual_failed_browser_context", canonical_credit: 0 });
    }
  }
  assert(report.original_failure_diagnostics.some(item => item.kind === "actual_failed_browser_trace"));
  const decisionPath = dir + "/m32-approved-omissions.json", decision = json(decisionPath);
  assert(receipt.retained_files.some(ref => ref.path === decisionPath)); verifyRef(decision.proposal);
  assert.equal(decision.status, "approved_exact_five_only"); assert.equal(decision.user_response.answer, "5개만 제외 승인 (추천)");
  assert.deepEqual(decision.decisions.map(item => [item.id, item.decision]), ["O01", "O02", "O03", "O04", "O05"].map(id => [id, "approved_narrow_omission"]));
  assert.deepEqual(read(decision.proposal.path), git("show", baseline + ":" + decision.proposal.path));
  report.approved_omissions = { record: reference(decisionPath), exact_ids: decision.decisions.map(item => item.id), original_proposal_unchanged: true,
    scope: "Explicit external user decision only; no runtime, whole-family or platform-limit approval is conferred by this audit." };
  const setupObservationPath = dir + "/m32-setup-observation.json"; assert(receipt.retained_files.some(ref => ref.path === setupObservationPath));
  report.setup_observation = { record: reference(setupObservationPath), recorded: json(setupObservationPath), canonical_credit: 0 };
  const attemptObservationPath = dir + "/m32-retained-attempt-observations.json";
  assert(receipt.retained_files.some(ref => ref.path === attemptObservationPath));
  assert.equal(sha(read(attemptObservationPath)), "2ed3a821322b2fc59a4649774d3689a279fb64339a50ee197ba9de04903bfcdb");
  const observation = json(attemptObservationPath), treeObservation = observation.tree_date_full;
  verifyRef(observation.native_wire.observation); verifyRef(treeObservation.record); verifyRef(treeObservation.input); verifyRef(treeObservation.trace);
  assert.equal(treeObservation.passed, 875); assert.equal(treeObservation.failed, 1); assert.equal(treeObservation.source_change, false);
  assert.equal(treeObservation.input.sha256, receipt.inputs.sha256); assert(treeObservation.cause.startsWith("Unproven."));
  assert(treeObservation.full_reexecution.startsWith("In progress at capture"));
  assert(failed.some(record => record.label === "browser-webkit" && record.started === json(treeObservation.record.path).started));
  assert.equal(treeObservation.diagnostic.length, 3);
  for (const diagnostic of treeObservation.diagnostic) {
    verifyRef(diagnostic.input); assert.equal(diagnostic.cases, 4); assert.equal(diagnostic.exit_code, 0);
    assert(report.browsers.some(item => item.label === diagnostic.engine && item.purpose === "unchanged_tree_date_diagnostic" && item.passed === 4 && item.input_manifest.sha256 === diagnostic.input.sha256));
  }
  report.retained_attempt_observations = { record: reference(attemptObservationPath), observations: observation,
    scope: "Exact immutable pending-at-capture observations are preserved; the provided final runtime receipt owns the later unchanged reexecution result. No causal explanation is inferred from a later pass." };
  const dateAuditPath = dir + "/m32-independent-date-trace-audit.json";
  assert(receipt.retained_files.some(ref => ref.path === dateAuditPath));
  assert.equal(sha(read(dateAuditPath)), "8f64f49b2a8dbf93082542136c8860d8df97962a6e4804db003018518d4e03d9");
  const dateAudit = json(dateAuditPath); verifyRef(dateAudit.zip); verifyRef(dateAudit.input_manifest);
  assert.equal(dateAudit.input_manifest.sha256, receipt.inputs.sha256);
  const dateTrace = execFileSync("tar", ["-xOf", dateAudit.zip.path, dateAudit.trace_member.path], { maxBuffer: 16 * 1024 * 1024 });
  assert.equal(sha(dateTrace), dateAudit.trace_member.sha256); assert.equal(dateTrace.length, dateAudit.trace_member.bytes);
  report.independent_date_trace_inspection = { record: reference(dateAuditPath), zip: dateAudit.zip, trace_member: dateAudit.trace_member,
    limits: dateAudit.limits, scope: "Preserved independent DOM-decoding report bound to the exact raw trace member. The earlier fill-while-modal theory is not supported; no event-level cause or framework fix is claimed." };
  const protocolSnapshotPath = dir + "/m32-protocol.json";
  assert(receipt.retained_files.some(ref => ref.path === protocolSnapshotPath));
  assert.equal(sha(read(protocolSnapshotPath)), "ea71519a4e743362c10287ed500bccec1ac2dcb54a918144dacf34ebe6ac9b57");
  const protocolSnapshot = json(protocolSnapshotPath);
  for (const [file, expected] of Object.entries(protocolSnapshot.independent_source_review.source_sha256)) assert.equal(current[file], expected, file);
  report.immutable_source_snapshot = { record: reference(protocolSnapshotPath), status: protocolSnapshot.status,
    scope: "Pre-canonical source/focus acceptance snapshot, preserved without rewriting its pending-at-capture final-runtime/document fields." };

  verifyRef(latest.get("pack").artifact); const descriptor = json(latest.get("pack").artifact.path);
  const actualArchive = archive(descriptor); assert.deepEqual(actualArchive, receipt.checks.artifact); assert.equal(actualArchive.files, 203);
  assert.deepEqual(latest.get("pack").args, [npm, "pack", "--json", "--pack-destination", path.dirname(descriptor.tarball)]);
  const packList = JSON.parse(text(latest.get("pack"))); assert.equal(packList.length, 1);
  for (const [key, value] of Object.entries(packList[0])) assert.deepEqual(descriptor[key], value);
  report.artifact = actualArchive;
  verifyRef(previous.checks.artifact.tarball);
  const parentDeclarations = previous.checks.artifact.actual_payloads.filter(item => item.path.endsWith(".d.ts"));
  const packedDeclarations = actualArchive.actual_payloads.filter(item => item.path.endsWith(".d.ts"));
  assert.equal(parentDeclarations.length, 40); assert.equal(packedDeclarations.length, 40);
  assert.deepEqual(packedDeclarations.map(item => item.path).sort(), parentDeclarations.map(item => item.path).sort());
  const changedDeclarations = packedDeclarations.filter(item => item.sha256 !== parentDeclarations.find(previous => previous.path === item.path).sha256);
  assert.deepEqual(changedDeclarations.map(item => item.path), ["build/comm/index.d.ts"]);
  assert(read("build/comm/index.d.ts").toString().includes("send?: (request: Request) => Promise<Response>;"));
  report.declaration_delta = { parent_tarball: previous.checks.artifact.tarball, current_tarball: actualArchive.tarball,
    declarations: 40, unchanged_declarations: 39, changed_declarations: changedDeclarations,
    scope: "One reviewed optional sender field changes only the existing comm declaration; no declaration filename or named export is added." };
  const packageJSON = json("package.json"), oldPackage = JSON.parse(git("show", baseline + ":package.json"));
  assert.deepEqual(packageJSON.exports, oldPackage.exports); assert.equal(Object.keys(packageJSON.exports).length, 5); assert.equal(Object.keys(packageJSON.dependencies ?? {}).length, 0);
  const parentInputs = json(previous.inputs.path);
  const changedRuntime = files.filter(file => file.startsWith("src/") && parentInputs[file] !== current[file]); assert.deepEqual(changedRuntime, ["src/comm/index.ts"]);
  assert.equal(current["src/comm/index.ts"], "c46d7811c48e932c019bc5d09169d983a034b38fb51dd323b6b29fc68f8198be");
  assert.equal(current["tests/browser/communicator-protocol.spec.ts"], "1047481cc974f77067c89ae7b64f098c0556f2b6fad9d7f8dfe84dd2a4e8cb11");
  report.public_surface = { changed_runtime_files: changedRuntime, public_entries_unchanged: true, runtime_dependencies: 0,
    new_named_exports: 0, reviewed_new_option: "createCommunicator.send(request: Request): Promise<Response>" };
  report.installed = [];
  for (const label of ["consumers", "packed-chromium", "packed-firefox", "packed-webkit", "packed-chrome", "packed-edge"]) {
    const record = latest.get(label), expected = label === "consumers" ? [npm, "run", "test:consumers", "--", "--tarball", descriptor.tarball, "--sha256", descriptor.sha256]
      : [npm, "run", "test:packed-browser", "--", "--tarball", descriptor.tarball, "--sha256", descriptor.sha256, "--browser", label.slice(7)];
    assert.deepEqual(record.args, expected); const value = text(record); assert(value.includes(descriptor.sha256));
    assert(label === "consumers" ? value.includes("JS installed consumer passed.") && value.includes("TS installed consumer passed.") : value.includes("Packed browser consumer passed (" + label.slice(7) + " "));
    report.installed.push({ label, stdout: record.stdout, stderr: record.stderr, actual_tarball_sha256: descriptor.sha256 });
  }
  assert(read("tests/consumers/browser/main.js").toString().includes("state.checkRequests = async () =>"));
  assert(read("tools/check-packed-browser.mjs").toString().includes("window.packedConsumer.checkRequests()"));
  assert(read("tools/check-packed-browser.mjs").toString().includes("Installed requests must preserve captured plain hooks, explicit application stages and aborted completion."));
  for (const [label, file] of [["binding-performance", "benchmark-m4.mjs"], ["viewport-performance", "benchmark-grid-viewport.mjs"]])
    assert.deepEqual(latest.get(label).args, ["tools/" + file, "--browser=chromium", "--runs=5", "--warmup=2"]);
  const perf = performance(JSON.parse(text(latest.get("binding-performance"))), JSON.parse(text(latest.get("viewport-performance"))));
  assert.deepEqual(perf.binding_budgets, previous.checks.performance.binding_budgets);
  assert.deepEqual(perf.viewport_budgets, previous.checks.performance.viewport_budgets);
  assert.deepEqual(perf, receipt.checks.performance); report.performance = perf;
  const lock = "js/natural_js/@types/package-lock.json"; assert.equal(git("diff", baseline, "--", "v1").length, 0);
  assert.equal(git("status", "--porcelain", "--untracked-files=all", "--", "v1").length, 0);
  assert.equal(git("ls-files", "--", lock).length, 0); assert(git("check-ignore", lock).length > 0);
  assert.equal(git("branch", "--show-current").toString().trim(), "2.0.0-alpha.0");
  report.protection = { v1_unchanged: true, original_lock_ignored_untracked: true, branch: "2.0.0-alpha.0", head: git("rev-parse", "HEAD").toString().trim() };
  report.status = "approved_independent_recorded_raw_evidence";
} catch (error) { report.status = "failed"; report.error = { message: error.message, stack: error.stack }; process.exitCode = 1; }
report.finished = new Date().toISOString(); fs.writeFileSync(destination, JSON.stringify(report, null, 2) + "\n", { flag: "wx" });
console.log(JSON.stringify({ status: report.status, output: destination, records: report.attempts?.records, inputs: report.inputs?.entries,
  suites: report.browsers?.map(item => [item.label, item.passed]), package_files: report.artifact?.files, medians: report.performance?.raw_medians,
  budgets: report.performance?.checked_budgets, error: report.error?.message }));
