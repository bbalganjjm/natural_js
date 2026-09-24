# M8 fixed agent tasks

The three archives overlay the exact source tree at `f659f1d8c86ad39925eda44b55d569b175e96e57`. They contain authored fixtures and frozen browser acceptance, not agent solutions. The tar files are deliberately kept out of the npm package.

To reconstruct a task in a new empty directory, generate the baseline with `git archive --format=tar --output=baseline.tar f659f1d8c86ad39925eda44b55d569b175e96e57`. Extract `baseline.tar`, then `taskN-seed.tar` into that directory. Run `npm ci` there, initialize a new Git repository, and commit the extracted tree as one seed commit. This removes parent-history solutions from the evaluation checkout. Do not edit its fixed test or Playwright config.

The baseline tar SHA-256 is `4F0AF4527034494F737D1563E24CD891B30A5C2DB40EBF28A2A537F50DF66191`. The task tar SHA-256 hashes are:

| Task | SHA-256 |
|---|---|
| 1 | `8AE5F81F2F58EFF35B9788C3A61B42E8C8B6176B46781F13A00CCCA63BC4052E` |
| 2 | `BA39CC15DD2EAA6294D19A25537C987C113DF3B5F0AC222A7E15DC233A484990` |
| 3 | `C1C035DF3CF1E2AA320C8365E56A1D87E5F351AC48E2B88AA2376AD19FBFB38D` |

The supplemental `task1-mdi-qa.spec.mjs` checks document IDs while both screens are live. Copy it into the reconstructed checkout's `tests/browser/` to run it with the evaluation Playwright config; it is outside the frozen scoring test.

The respective `taskN-brief.md` files define acceptance. `meter.mjs --work <checkout>` records content reads, searches, filename listings, and diff reviews. Keep its output untruncated and separate build/test logs from read-context bytes. The full protocol and results live in [the M8 evaluation concept](../../../docs/implementation/m8-eval.md).
