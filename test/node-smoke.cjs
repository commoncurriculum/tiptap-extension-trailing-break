// Verifies the package loads via require() (older Node / CommonJS consumers).
const assert = require("node:assert");
const mod = require("tiptap-extension-trailing-break");

assert.strictEqual(mod.default, mod.TrailingBreak);
assert.strictEqual(typeof mod.addTrailingBreaks, "function");
console.log("CJS require OK");
