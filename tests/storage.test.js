const assert = require("node:assert/strict");
const test = require("node:test");

function storageMock(entries = {}) {
  const values = new Map(Object.entries(entries));
  return {
    getItem: (key) => values.has(key) ? values.get(key) : null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key),
    has: (key) => values.has(key),
  };
}

test("read recupera JSON corrompido e remove a entrada invalida", () => {
  global.localStorage = storageMock({ broken: "{not-json" });
  delete require.cache[require.resolve("../storage.js")];
  const { read } = require("../storage.js");
  const fallback = [];
  const result = read("broken", fallback, Array.isArray);
  assert.deepEqual(result, []);
  assert.notEqual(result, fallback);
  assert.equal(global.localStorage.has("broken"), false);
});

test("read rejeita estrutura inesperada", () => {
  global.localStorage = storageMock({ items: JSON.stringify({ invalid: true }) });
  const { read } = require("../storage.js");
  assert.deepEqual(read("items", [], Array.isArray), []);
});

test("write nao derruba a aplicacao quando o navegador recusa persistencia", () => {
  global.localStorage = { setItem: () => { throw new Error("quota"); } };
  const { write } = require("../storage.js");
  assert.equal(write("items", []), false);
});

test("remove nao derruba a aplicacao quando o storage esta indisponivel", () => {
  global.localStorage = { removeItem: () => { throw new Error("blocked"); } };
  const { remove } = require("../storage.js");
  assert.equal(remove("items"), false);
});
