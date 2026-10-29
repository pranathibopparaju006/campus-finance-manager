"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const { validDate, validMoney, escapeHTML, totalSpent, categoryTotals } = require("../finance-utils.js");

test("validDate accepts valid ISO calendar dates", () => {
  assert.equal(validDate("2024-02-29"), true);
  assert.equal(validDate("2025-12-31"), true);
});
test("validDate rejects malformed and impossible dates", () => {
  for (const value of ["2025-02-29", "2025-13-01", "2025-04-31", "01-01-2025", "", null, 20250101]) {
    assert.equal(validDate(value), false, String(value));
  }
});
test("validMoney enforces positive finite amounts and maximum", () => {
  assert.equal(validMoney("0.01"), true);
  assert.equal(validMoney("10000000"), true);
  for (const value of [0, -1, "abc", Infinity, NaN, "10000000.01"]) assert.equal(validMoney(value), false, String(value));
  assert.equal(validMoney("100000000", 100000000), true);
  assert.equal(validMoney("100000001", 100000000), false);
});
test("escapeHTML encodes HTML-sensitive characters", () => {
  assert.equal(escapeHTML(`<script title="x">Tom & 'Jerry'</script>`),
    "&lt;script title=&quot;x&quot;&gt;Tom &amp; &#39;Jerry&#39;&lt;/script&gt;");
  assert.equal(escapeHTML(42), "42");
});
test("totalSpent totals records and handles an empty list", () => {
  assert.equal(totalSpent([{ amount: 10 }, { amount: 2.5 }, { amount: 0 }]), 12.5);
  assert.equal(totalSpent([]), 0);
});
test("categoryTotals sums categories and includes zero-value categories", () => {
  assert.deepEqual(categoryTotals([
    { category: "Mess", amount: 40 }, { category: "Books", amount: 100 },
    { category: "Mess", amount: 10 }, { category: "Unknown", amount: 5 }
  ], ["Mess", "Books", "Travel"]), { Mess: 50, Books: 100, Travel: 0, Unknown: 5 });
});
