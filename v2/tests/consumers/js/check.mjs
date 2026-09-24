import assert from "node:assert/strict";
import { FrameworkError } from "@bbalganjjm/natural_js";

const cause = new Error("original");
const error = new FrameworkError({
  code: "CONSUMER_CHECK",
  api: "installed-package",
  message: "Installed JavaScript import works.",
  cause
});

assert.ok(error instanceof Error);
assert.equal(error.code, "CONSUMER_CHECK");
assert.equal(error.api, "installed-package");
assert.equal(error.cause, cause);
