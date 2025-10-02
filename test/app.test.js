import test from "node:test";
import assert from "node:assert/strict";
import { getGreeting } from "../app.js";

test("greeting contains build id", () => {
  process.env.BUILD_ID = "abc123";
  assert.match(getGreeting(), /abc123/);
});
