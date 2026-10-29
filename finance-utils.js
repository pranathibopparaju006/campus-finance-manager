(function (root, factory) {
  "use strict";
  const utils = factory();
  if (typeof module === "object" && module.exports) module.exports = utils;
  if (root) root.CFMUtils = utils;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";
  function validDate(value) {
    if (typeof value !== "string" || !/^\\d{4}-\\d{2}-\\d{2}$/.test(value)) return false;
    const [year, month, day] = value.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
  }
  function validMoney(value, maximum = 10000000) {
    const amount = Number(value);
    return Number.isFinite(amount) && amount > 0 && amount <= maximum;
  }
  function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, (char) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    })[char]);
  }
  function totalSpent(items = []) {
    return items.reduce((sum, item) => sum + item.amount, 0);
  }
  function categoryTotals(items = [], categories = []) {
    const totals = Object.fromEntries(categories.map((category) => [category, 0]));
    items.forEach((item) => { totals[item.category] = (totals[item.category] || 0) + item.amount; });
    return totals;
  }
  return { validDate, validMoney, escapeHTML, totalSpent, categoryTotals };
});
