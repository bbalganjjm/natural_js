---
type: Plan
title: Natural-JS 2.0 M3.2 native protocol workflows
description: Preserve native HTTP and custom XHR transfer workflows through one captured sender and explicit application wire recipes.
tags: [meta, plan, communication, migration]
status: draft
sources:
  - id: evidence
    resource: evidence/m32final-verification.json
    title: Tool-inclusive M3.2 runtime, source and independent acceptance
    git_blob: c44fa622097d0c1b7073701598a2fe394014db57
  - id: runtime
    resource: ../../src/comm/index.ts
    title: Existing Request, Response, phase-error and cancellation owner
    git_blob: 4b05ebaa4121885a96f53e8a3b32dd38e1498704
  - id: legacy
    resource: ../../v1/src/natural.architecture.js
    title: Shipped request merging and AjaxSettings transport forwarding
    git_blob: 6a2a3ec3eacc37ed37e23e2cf51491fffc1565b2
  - id: settings
    resource: ../../v1/@types/natural.architecture.misc.d.ts
    title: Inherited native transport settings
    git_blob: a4966b6dbfd8512ec810d218aa059eb812613e37
  - id: jquery
    resource: ../../v1/lib/jquery-3.7.1.min.js
    title: Actual inherited XHR, headers, authentication and conversion branches
    git_blob: 7f37b5d99122b4928505d1e0ac5ca7279edd56ed
  - id: example
    resource: ../../examples/vite/m4/employees.ts
    title: Existing two-layout CVC request caller
    git_blob: dfdf60b97c10a347ff46177c1abf34f9eb5d7fb7
  - id: baseline
    resource: evidence/m31-verification.json
    title: Accepted M3.1 source, runtime, raw and document checkpoint
    git_blob: 27585d85c2bdb82cd4483da9b3cd4f0a0d7c0907
  - id: registry
    resource: evidence/remaining-work-plan.json
    title: M3.2 scope and remaining owners
    git_blob: a18ff58091c2eb8d8050ba8222d6b3285a078a11
  - id: omissions
    resource: omission-decision.md
    title: Exact five approved omissions and retained outcomes
    git_blob: 5305f70fbe67d4f65d29ea081806c80d396f0a6b
generated: { by: codex/gpt-6, at: 2026-11-14T18:01:25Z }
verified:
  - { by: codex/gpt-6, at: 2026-11-14T18:01:25Z }
---

# Goal

Preserve ordinary HTTP through native Request/Response and explicit application wire/decoding functions. Add one optional captured send(request: Request): Promise<Response> because inherited xhr/xhrFields actually support custom native transfers, upload/download progress and browser-managed authentication. Default transport remains fetch. Add no export, dependency, transport registry or AjaxSettings serializer.[^runtime][^legacy][^settings][^jquery]

# Checkpoint

M3.1 is accepted and pushed as 3a9a2c8 on 2.0.0-alpha.0: 203 inputs, 150 units, 857 full cases per engine and one exact 203-file package. Its evidence remains immutable. M3.2 source/callers and the documentation discovery correction have independent connected review. The fresh m32final receipt records 22 attempts and sixteen latest passing canonical groups on 205 inputs, 155 Vitest units and 876 full cases per engine. Immediate-parent runtime, browser identities and declarations are unchanged. Preserve the separate original 34-attempt history, including 17 development records and one superseded full WebKit timeout. Only O01-O05 are approved; all other outcomes remain required.[^evidence][^baseline][^registry][^omissions]

# Steps

1. Recheck the accepted M3.1 Git/source checkpoint and every affected caller. Retain existing callback capture, application phases, page cancellation, errors and native response processing.
2. Add send only to createCommunicator options. Capture the supplied function once, validate it with prepare/after and invoke it plainly inside REQUEST_NETWORK. Validate its resolved Response there. When absent, look up fetch at request execution; do not capture a default fetch reference during creation. Existing perform still races cancellation and suppresses late results before after/HTTP/decode.
3. Implement one application-only employee XHR sender outside package src/build. Each call owns a fresh native request. Buffer finite prepared body bytes to preserve multipart boundaries; check cancellation before/after buffering and immediately before send. Release native handlers and abort on caller/page cancellation or observer failure. Handle null bodies for 204/205/304/HEAD and network status0. Keep responseURL metadata in application context because synthetic Response.url is empty.
4. Make the existing two-layout M4 screen opt into that sender with ?transport=xhr. Keep default Fetch and the existing request/busy owner. Disclose unsupported opt-in XHR policies: credentials omit, nondefault cache/referrer, manual redirects, opaque/no-cors, integrity and arbitrary streaming. Native Fetch remains available for those policies.
5. Execute ordinary native recipes for relative URL/method/headers/auth, encoded q JSON and repeated fields, FormData/raw/URL-encoded bodies, credentials/CORS/cache, explicit conditional 304 recovery, status/header access, text/XML/charset/custom/empty decoding and request-local navigation guards. Preserve business identifiers and existing rowStatus payload recipes; add no general serializer, converter graph or cache library.
6. Verify real second-origin credential include/omit and allowed/denied preflight. A denied simple CORS request may reach the server; assert blocked response delivery. A denied preflight must prevent the protected request. Verify native username/password challenge authentication; an explicit Basic header alone is insufficient.
7. Verify actual uploaded/received bytes and monotonic upload/download notifications without requiring an event count. Include unknown-length reads, same-URL independent calls, observer failure, native network error, timeout/page/caller abort, buffer-then-abort with no native start and quiet late observers. Test native Request/Response replacement and pending custom-sender cancellation through the existing owner.
8. Add captured/plain/invalid sender units, actual protocol and both M4 layout browser cases, and installed JS/TS/five-browser witnesses. Freeze separately; run strict types, units, all three complete source engines, one actual package in isolated consumers and the original thirty performance budgets. Retain every attempt and complete old/new case identities.
9. Update implemented draft API/example/migration contracts, indexes/log/current queue and exact coverage evidence together. Independently review source/callers, raw evidence and final semantic bodies; changed/full docs require zero errors/warnings before the separate commit/push.

The new public contract stays specific:

```ts
const comm = createCommunicator({
  send: request => sendEmployee(request, { progress: showTransfer })
});
await comm.request({ url, method: "POST", body: formData, signal });
```

sendEmployee and showTransfer are application code. Request preparation, error/cancellation and response decoding remain framework responsibilities.[^runtime][^example]

## Completion correction: raw evidence and documentation discovery

The original selected runtime receipt remains immutable at evidence/m32-runtime-receipt.json. Final documentation stamping then failed because the shared checker walk treated four raw Playwright error-context.md files under docs/implementation/evidence as OKF concepts. Preserve those Markdown bytes, their traces and the failed fingerprint log; do not add synthetic frontmatter or rewrite the recorded receipt.

The correction reviews both callers of walk: concept checking and directory stamping. A path-relative boundary excludes only the designated raw evidence directory, including Windows case variants. Active concepts still receive normal validation, and explicit file stamping still requires frontmatter. The existing checker test and OKF conventions record that boundary. Three separate Node diagnostics retain an initial canonical-case pass, a real Windows case-variant RED and the final path-relative GREEN. They earn no Vitest-unit or browser credit. Require final changed/full checks to report 90 concepts, five reserved files and zero errors/warnings while all original raw Markdown hashes stay unchanged.

The four original raw contexts contain CRLF bytes. Evidence-local .gitattributes sets ** -text so Git preserves those recorded bytes without changing global configuration. The source review includes that metadata path, and index/commit proof must compare raw bytes and text:unset. This file is outside runtime/package inputs.

Both documentation-tool files belong to the frozen input inventory. The separate m32final run therefore repeats all sixteen canonical groups with the original M3.2 R0 as an explicitly hash-bound same-stage parent. The source review owns thirteen paths: ten unchanged original runtime/caller paths, two corrected documentation-tool paths and the raw-byte attribute. The original 34-attempt journal, 291 R0 retained paths, pending document projection and initial document approval stay immutable. A separate 298-path snapshot protects post-R0 bookkeeping without adding retrospective acceptance. The final wrapper supersedes document status only. Runtime source, authored templates, browser/benchmark fixtures, public declarations and dependencies do not change relative to the immediate parent; no extra feature family closes.

# Next action

Complete independent final-document acceptance and the separate M3.2 commit/push from the tool-inclusive checkpoint, then begin M3.3. Apply only the exact approved O01-O05 boundaries. Shared HTML loading stays M3.3; metadata/configuration/advice/declarations and shell aggregation retain their numbered owners.[^registry][^omissions]

# Decisions

- Native factory/progress/authentication is an actual inherited capability despite no known repository progress application. Preserve it through the explicit sender, not a global fetch replacement or public XHR wrapper library.
- The opt-in example supports a documented finite-body subset; it does not emulate every Fetch policy. Ordinary native Fetch outcomes remain supported separately.
- Source-status classifications are precise: submit already replaces raw beforeSend/success/error/complete options; browserHistory is TODO; an unused isLocal flag alone proves no application deployment behavior. Unknown file/extension deployments stay explicit in the original owning inventory, not silently certified by HTTP tests.
- Existing rules, used utilities, CVC, authored HTML/CSS and component ownership remain unchanged. No whole-family closure, additional omission, npm publication, tag or master/v1 change.

# Verification log

All sixteen fresh canonical groups pass on the final 205-input map, 155 Vitest units and 876 cases per engine. The actual 203-file tar is byte-identical to the original M3.2 tar; JS/TS and all five installed browsers pass on that exact artifact. The original thirty budgets, sixty medians and 300 duration samples pass. Relative to the immediate parent there is no runtime, case or declaration delta; only the communicator declaration differs among forty files from M3.1.[^evidence][^baseline]

Preserve the separate original 34-attempt history and its initial auth/strict native-wire failures. Its unchanged Tree/date fixture first passed 875 cases and timed out once; isolated 4-case diagnostics in all engines and later complete suites pass. Fresh installed Edge initially reported ERR_NO_BUFFER_SPACE; a later all-five-browser run passes. Neither failure has a proven cause or production fix. The three Node checker diagnostics are separate from both histories’ Vitest/browser coverage. Final independent raw/document acceptance belongs to the new wrapper; the original R0, pending wrapper and initial approval are not rewritten.[^evidence]

# Open questions

O01-O05 are explicitly approved, not blanket retirement of R07 or another family. Direct Fetch controls reproduce two Windows WebKit wire-policy differences: cookies are sent for omit/same-origin, and the engine adds Content-Type after header deletion. Preserve strict initial failures, controls and exact native-parity tests; do not claim cookie/header withholding conformance. The browser/release owner retains those measured platform limitations. Other protocol outcomes must be tested or stay explicitly open in their original owners.[^omissions][^registry]

[^evidence]: Tool-inclusive M3.2 runtime, source and independent acceptance
[^runtime]: Existing Request, Response, phase-error and cancellation owner
[^legacy]: Shipped request merging and AjaxSettings transport forwarding
[^settings]: Inherited native transport settings
[^jquery]: Actual inherited XHR, headers, authentication and conversion branches
[^example]: Existing two-layout CVC request caller
[^baseline]: Accepted M3.1 source, runtime, raw and document checkpoint
[^registry]: M3.2 scope and remaining owners
[^omissions]: Exact five approved omissions and retained outcomes
