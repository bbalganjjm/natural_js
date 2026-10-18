import assert from "node:assert/strict";
import { FrameworkError } from "@bbalganjjm/natural_js";
import { mountPage } from "@bbalganjjm/natural_js/page";
import { createRows } from "@bbalganjjm/natural_js/data";
import { createCommunicator } from "@bbalganjjm/natural_js/comm";
import { bindForm, bindGrid, bindList, bindSelect, bindPagination, openPopup, bindTabs, bindTree, bindDatePicker, bindNotify, bindDocuments } from "@bbalganjjm/natural_js/ui";

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
assert.equal(typeof bindList, "function");
assert.equal(typeof bindSelect, "function");
assert.equal(typeof bindPagination, "function");
assert.equal(typeof openPopup, "function");
assert.equal(typeof bindTabs, "function");
assert.equal(typeof bindTree, "function");
assert.equal(typeof bindDatePicker, "function");
assert.equal(typeof bindNotify, "function");
assert.equal(typeof bindDocuments, "function");

const rows = createRows([{ name: "A", options: [{ value: "one" }] }, { name: "B", options: [] }]);
const id = rows.entries()[0].id;
rows.set(id, "name", "B");
assert.equal(rows.get(id).value.name, "B");
assert.equal(rows.changes()[0].status, "update");
rows.revert(id);
assert.equal(rows.get(id).value.name, "A");
const secondId = rows.entries()[1].id;
const batches = [];
const stop = rows.subscribe(event => batches.push(event));
rows.setMany([
  { id, values: { name: "First", options: [{ value: "two" }] } },
  { id: secondId, values: { name: "Second" } }
]);
assert.equal(batches.length, 1);
assert.deepEqual(batches[0], { type: "setMany", ids: [id, secondId], changed: true });
assert(Object.isFrozen(batches[0]) && Object.isFrozen(batches[0].ids));
assert.deepEqual(rows.entries().map(row => row.id), [id, secondId]);
assert.equal(rows.get(id).value.options[0].value, "two");
assert.throws(() => { rows.get(id).value.name = "Bypass batch"; }, TypeError);
assert.throws(() => rows.get(id).value.options.push({ value: "Bypass nested snapshot" }), TypeError);
assert.deepEqual(rows.changes().map(row => row.status), ["update", "update"]);
const before = rows.entries();
assert.throws(() => rows.setMany([
  { id, values: { name: "Must not commit" } }, { id: secondId, values: { name: undefined } }
]));
assert.equal(rows.entries(), before, "An invalid later patch must preserve the complete batch.");
assert.equal(batches.length, 1);
rows.setMany([{ id, values: { name: "First" } }]);
assert.equal(batches.length, 1, "A net no-op must not notify installed consumers.");
stop();
rows.revert();
assert.deepEqual(rows.entries().map(row => row.value.name), ["A", "B"]);
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

await assert.rejects(import("@bbalganjjm/natural_js/ui/form"), {
  code: "ERR_PACKAGE_PATH_NOT_EXPORTED"
});
