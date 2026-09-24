import assert from "node:assert/strict";
import { FrameworkError } from "@bbalganjjm/natural_js";
import { mountPage } from "@bbalganjjm/natural_js/page";
import { createRows } from "@bbalganjjm/natural_js/data";
import { createCommunicator } from "@bbalganjjm/natural_js/comm";
import { bindForm, bindGrid } from "@bbalganjjm/natural_js/ui";

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
assert.equal(typeof mountPage, "function");
assert.equal(typeof bindForm, "function");
assert.equal(typeof bindGrid, "function");

const rows = createRows([{ name: "A", options: [{ value: "one" }] }]);
const id = rows.entries()[0].id;
rows.set(id, "name", "B");
assert.equal(rows.get(id).value.name, "B");
assert.equal(rows.changes()[0].status, "update");
rows.revert(id);
assert.equal(rows.get(id).value.name, "A");
rows.dispose();

const originalFetch = globalThis.fetch;
globalThis.fetch = async request => {
  assert.equal(request.url, "https://example.test/api/employees");
  assert.equal(request.method, "POST");
  assert.deepEqual(await request.json(), [{ name: "A" }]);
  return new Response('[{"name":"A"}]', { status: 200 });
};
try {
  const comm = createCommunicator({ baseURL: new URL("https://example.test/api/") });
  const result = await comm.request({
    url: "employees", method: "POST", json: [{ name: "A" }]
  });
  assert.deepEqual(result, [{ name: "A" }]);
} finally {
  globalThis.fetch = originalFetch;
}
