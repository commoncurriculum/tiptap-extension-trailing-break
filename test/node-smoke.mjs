// Verifies the package loads in Node's native ESM loader (no bundler).
import assert from "node:assert";
import TrailingBreak, * as mod from "tiptap-extension-trailing-break";

assert.strictEqual(TrailingBreak, mod.TrailingBreak);
assert.strictEqual(typeof mod.addTrailingBreaks, "function");
assert.strictEqual(typeof mod.getHTMLWithTrailingBreaks, "function");
console.log("ESM import OK");
