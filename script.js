(() => {
  "use strict";

  const STORAGE_KEYS = {
    expenses: "cfm.expenses.v2",
    budget: "cfm.semesterBudget.v2"
  };
  const CATEGORIES = ["Mess", "Books", "Travel", "Entertainment", "Accommodation", "Other"];
  const CATEGORY_LABELS = {
    Mess: "Food & mess",
    Books: "Books & supplies",
    Travel: "Travel",
    Entertainment: "Entertainment",
    Accommodation: "Accommodation",
    Other: "Other"
  };
  const CATEGORY_COLORS = {
    Mess: "#4968e8",
    Books: "#8264d8",
    Travel: "#16a681",
    Entertainment: "#df9a24",
    Accommodation: "#d66b83",
    Other: "#8491a6"
  };
  const { validDate, validMoney, escapeHTML } = window.CFMUtils;
  const $ = (id) => document.getElementById(id);
  let expenses = loadExpenses();
  let semesterBudget = loadBudget();
  let lastReportText = "";
  let toastTimer;

  function safeRead(key, fallback) {
    try {
      const value = localStorage.getItem(key);
      return value === null ? fallback : JSON.parse(value);
    } catch (error) {
      console.warn("Could not read saved data:", error);
      return fallback;
    }
  }

  function loadExpenses() {
    const data = safeRead(STORAGE_KEYS.expenses, safeRead("expenses", []));
    if (!Array.isArray(data)) return [];
    return data.filter((item) =>
      item && Number.isFinite(Number(item.amount)) && Number(item.amount) > 0 &&
      typeof item.description === "string"
    ).map((item) => ({
      id: String(item.id || makeId()),
      amount: Number(item.amount),
      category: CATEGORIES.includes(item.category) ? item.category : "Other",
      description: item.description.slice(0, 90),
      date: validDate(item.date) ? item.date : todayISO(),
      paymentMethod: String(item.paymentMethod || "Other"),
      createdAt: Number(item.createdAt || Date.now())
    }));
  }

  function loadBudget() {
    const value = safeRead(STORAGE_KEYS.budget, safeRead("semesterBudget", null));
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  }

  function persist() {
    try {
      localStorage.setItem(STORAGE_KEYS.expenses, JSON.stringify(expenses));
      localStorage.setItem(STORAGE_KEYS.budget, JSON.stringify(semesterBudget));
    } catch (error) {
      console.error("Could not save data:", error);
      showToast("Could not save data in this browser. Check storage settings.");
    }
  }

  function makeId() {
    return typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  function todayISO() {
    const now = new Date();
    const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 10);
  }

  function validDate(value) {
    if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const [year, month, day] = value.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
  }

  function validMoney(value, maximum = 10000000) {
    const amount = Number(value);
    return Number.isFinite(amount) && amount > 0 && amount <= maximum;
  }

  function currency(value) {
    return new Intl.NumberFormat("en-IN", {
      style: "currency", currency: "INR", maximumFractionDigits: 2
    }).format(Number(value) || 0);
  }

  function dateLabel(value) {
    if (!validDate(value)) return "—";
    return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" })
      .format(new Date(`${value}T00:00:00`));
  }

  function showToast(message) {
    const toast = $("toast");
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2800);
  }

  function totalSpent(items = expenses) {
    return window.CFMUtils.totalSpent(items);
  }

  function categoryTotals(items = expenses) {
    return window.CFMUtils.categoryTotals(items, CATEGORIES);
  }

  function renderOverview() {
    const total = totalSpent();
    $("totalSpent").textContent = currency(total);
    $("transactionCount").textContent = String(expenses.length);

    if (semesterBudget !== null) {
      const remaining = semesterBudget - total;
      $("remainingBalance").textContent = currency(remaining);
      $("balanceCaption").textContent = remaining < 0 ? "Over your semester budget" : "Available within your budget";
    } else {
      $("remainingBalance").textContent = "Not set";
      $("balanceCaption").textContent = "Set a budget to track your balance";
    }

    const totals = categoryTotals();
    const top = Object.entries(totals).sort((a, b) => b[1] - a[1]).find(([, amount]) => amount > 0);
    $("topCategory").textContent = top ? (CATEGORY_LABELS[top[0]] || top[0]) : "—";
    $("topCategoryCaption").textContent = top ? `${currency(top[1])} recorded` : "Category with the highest spend";
  }

  function renderExpenses() {
    const tbody = $("expenseTableBody");
    const query = $("transactionSearch").value.trim().toLowerCase();
    const category = $("categoryFilter").value;
    const filtered = expenses
      .filter((item) => category === "All" || item.category === category)
      .filter((item) => `${item.description} ${item.category} ${item.paymentMethod}`.toLowerCase().includes(query))
      .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt);

    tbody.innerHTML = "";
    $("emptyTransactions").style.display = filtered.length ? "none" : "block";
    if (!filtered.length) {
      $("emptyTransactions").innerHTML = expenses.length
        ? '<span class="empty-icon">⌕</span><strong>No matching expenses</strong><p>Try another search or category filter.</p>'
        : '<span class="empty-icon">↕</span><strong>No expenses yet</strong><p>Add your first transaction to populate this list.</p>';
    }

    filtered.forEach((item) => {
      const row = document.createElement("tr");
      const icon = item.category === "Mess" ? "☕" : item.category === "Books" ? "▤" :
        item.category === "Travel" ? "↗" : item.category === "Entertainment" ? "✦" :
        item.category === "Accommodation" ? "⌂" : "•";
      row.innerHTML = `
        <td><div class="expense-name"><span class="expense-avatar">${icon}</span><span>${escapeHTML(item.description)}<small class="expense-subtitle">Recorded expense</small></span></div></td>
        <td><span class="category-badge">${escapeHTML(CATEGORY_LABELS[item.category] || item.category)}</span></td>
        <td>${dateLabel(item.date)}</td>
        <td>${escapeHTML(item.paymentMethod)}</td>
        <td class="amount-cell">${currency(item.amount)}</td>
        <td><button class="delete-button" type="button" data-delete="${escapeHTML(item.id)}" aria-label="Delete expense ${escapeHTML(item.description)}" title="Delete expense">×</button></td>`;
      tbody.appendChild(row);
    });
    $("transactionSummary").textContent = `${filtered.length} of ${expenses.length} transaction${expenses.length === 1 ? "" : "s"}`;
  }

  function renderCategories() {
    const root = $("categorySummary");
    const totals = categoryTotals();
    const overall = totalSpent();
    const entries = Object.entries(totals).filter(([, amount]) => amount > 0).sort((a, b) => b[1] - a[1]);
    if (!entries.length) {
      root.innerHTML = '<div class="category-empty">No category data yet.<br/>Add expenses to see your spending breakdown.</div>';
      return;
    }
    root.innerHTML = entries.map(([category, amount]) => {
      const percentage = overall ? Math.round((amount / overall) * 100) : 0;
      return `<div class="category-row">
        <div class="category-name"><span class="category-dot" style="background:${CATEGORY_COLORS[category]}"></span>${escapeHTML(CATEGORY_LABELS[category] || category)}<span class="category-percent">${percentage}%</span></div>
        <div class="category-amount">${currency(amount)}</div>
        <div class="category-bar"><span style="width:${percentage}%;--bar-color:${CATEGORY_COLORS[category]}"></span></div>
      </div>`;
    }).join("");
  }

  function renderBudget() {
    const total = totalSpent();
    const budget = semesterBudget;
    $("semesterBudget").value = budget === null ? "" : String(budget);
    $("budgetSpent").textContent = `${currency(total)} spent`;
    $("budgetSpentMini").textContent = currency(total);
    $("budgetLimitLabel").textContent = budget === null ? "No budget set" : `${currency(budget)} budget`;

    if (budget === null) {
      $("budgetPercent").textContent = "0%";
      $("budgetProgress").style.width = "0%";
      $("budgetProgress").classList.remove("over-budget");
      $("budgetRemainingMini").textContent = "—";
      $("budgetStatus").className = "status-message";
      $("budgetStatus").textContent = "Set a semester budget to see your progress.";
      return;
    }

    const rawPercent = budget > 0 ? (total / budget) * 100 : 0;
    const percent = Math.round(rawPercent);
    const remaining = budget - total;
    $("budgetPercent").textContent = `${percent}%`;
    $("budgetProgress").style.width = `${Math.min(rawPercent, 100)}%`;
    $("budgetProgress").classList.toggle("over-budget", remaining < 0);
    $("budgetRemainingMini").textContent = currency(remaining);
    if (remaining < 0) {
      $("budgetStatus").className = "status-message warning";
      $("budgetStatus").textContent = `Budget exceeded by ${currency(Math.abs(remaining))}. Review recent spending.`;
    } else if (rawPercent >= 80) {
      $("budgetStatus").className = "status-message warning";
      $("budgetStatus").textContent = `You have used ${percent}% of your budget. ${currency(remaining)} remains.`;
    } else {
      $("budgetStatus").className = "status-message success";
      $("budgetStatus").textContent = `You are within budget with ${currency(remaining)} remaining.`;
    }
  }

  function renderAll() {
    renderOverview();
    renderExpenses();
    renderCategories();
    renderBudget();
  }

  function addExpense({ amount, category, description, date, paymentMethod }) {
    expenses.push({
      id: makeId(), amount: Number(amount), category, description: description.trim().slice(0, 90),
      date: validDate(date) ? date : todayISO(), paymentMethod: paymentMethod || "Other", createdAt: Date.now()
    });
    persist();
    renderAll();
  }

  function onExpenseSubmit(event) {
    event.preventDefault();
    const amount = Number($("amount").value);
    const description = $("description").value.trim();
    const date = $("expenseDate").value;
    const category = $("category").value;
    if (!description || description.length > 90) {
      showToast("Enter a description between 1 and 90 characters.");
      $("description").focus();
      return;
    }
    if (!validMoney(amount)) {
      showToast("Enter an amount greater than ₹0 and no more than ₹1,00,00,000.");
      $("amount").focus();
      return;
    }
    if (!validDate(date)) {
      showToast("Choose a valid expense date.");
      $("expenseDate").focus();
      return;
    }
    if (!CATEGORIES.includes(category)) {
      showToast("Choose a valid expense category.");
      return;
    }
    addExpense({ amount, description, category, date, paymentMethod: $("paymentMethod").value });
    $("expenseForm").reset();
    $("expenseDate").value = todayISO();
    $("description").focus();
    showToast("Expense saved successfully.");
  }

  function onBudgetSubmit(event) {
    event.preventDefault();
    const value = Number($("semesterBudget").value);
    if (!validMoney(value, 100000000)) {
      showToast("Enter a budget greater than ₹0 and no more than ₹10,00,00,000.");
      $("semesterBudget").focus();
      return;
    }
    semesterBudget = value;
    persist();
    renderAll();
    showToast("Semester budget updated.");
  }

  function onEventSubmit(event) {
    event.preventDefault();
    const name = $("eventName").value.trim();
    const cost = Number($("eventCost").value);
    const date = $("eventDate").value;
    if (!name || name.length > 90 || !validMoney(cost) || !validDate(date)) {
      showToast("Enter an event name, valid date, and cost greater than ₹0.");
      return;
    }
    addExpense({ amount: cost, category: "Entertainment", description: `Event: ${name}`, date, paymentMethod: "Other" });
    $("eventImpact").className = "event-impact success";
    $("eventImpact").textContent = `"${name}" was added as an expense for ${currency(cost)}. Your recorded spending has increased by ${currency(cost)}.`;
    $("eventForm").reset();
    $("eventDate").value = todayISO();
    showToast("Event added to expenses.");
  }

  function skipEvent() {
    const name = $("eventName").value.trim();
    const cost = Number($("eventCost").value);
    if (!name || name.length > 90 || !validMoney(cost) || !validDate($("eventDate").value)) {
      showToast("Enter an event name, valid date, and estimated cost first.");
      return;
    }
    $("eventImpact").className = "event-impact warning";
    $("eventImpact").textContent = `If you skip "${name}", you keep ${currency(cost)} in your budget. This is an estimate only; no expense was added.`;
  }

  function monthKey(date) {
    return date.slice(0, 7);
  }

  function generateMonthlyReport() {
    const month = $("reportMonth").value || todayISO().slice(0, 7);
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) {
      showToast("Choose a valid month for the report.");
      return;
    }
    const items = expenses.filter((item) => monthKey(item.date) === month);
    const total = totalSpent(items);
    const totals = categoryTotals(items);
    const entries = Object.entries(totals).filter(([, amount]) => amount > 0).sort((a, b) => b[1] - a[1]);
    const monthLabel = new Intl.DateTimeFormat("en-IN", { month: "long", year: "numeric" }).format(new Date(`${month}-01T00:00:00`));
    const top = entries[0];
    const average = items.length ? total / items.length : 0;
    const reportLines = [
      "CAMPUS FINANCE MANAGER — MONTHLY REPORT",
      `Period: ${monthLabel}`,
      `Generated: ${new Date().toLocaleString("en-IN")}`,
      "",
      `Total spent: ${currency(total)}`,
      `Transactions: ${items.length}`,
      `Average transaction: ${currency(average)}`,
      `Top category: ${top ? `${CATEGORY_LABELS[top[0]]} (${currency(top[1])})` : "No spending recorded"}`,
      "",
      "CATEGORY BREAKDOWN",
      ...(entries.length ? entries.map(([category, amount]) => `${CATEGORY_LABELS[category]}: ${currency(amount)} (${Math.round(amount / total * 100)}%)`) : ["No expenses recorded for this month."]),
      "",
      "INSIGHTS",
      ...(items.length ? [
        top ? `• Highest spending category: ${CATEGORY_LABELS[top[0]]}.` : "• No category data available.",
        `• You recorded ${items.length} transaction${items.length === 1 ? "" : "s"} this month.`,
        semesterBudget !== null ? `• Semester budget status: ${currency(semesterBudget - totalSpent())} remaining against all recorded spending.` : "• Set a semester budget to track your overall balance."
      ] : ["• Add expenses dated in this month to generate useful insights."]),
      "",
      "Note: This report is based only on entries saved in this browser."
    ];
    lastReportText = reportLines.join("\n");
    const root = $("monthlyReport");
    if (!items.length) {
      root.innerHTML = `<div class="report-placeholder"><span>▤</span><strong>No expenses for ${escapeHTML(monthLabel)}</strong><p>Add expenses for this month, then generate the report again.</p></div>`;
      showToast("No expenses found for the selected month.");
      return;
    }
    root.innerHTML = `
      <div class="report-header"><div><h3>${escapeHTML(monthLabel)} report</h3><p>Generated ${escapeHTML(new Date().toLocaleDateString("en-IN"))}</p></div><div class="report-total"><strong>${currency(total)}</strong><span>Total spending</span></div></div>
      <div class="report-insights">
        <div class="insight-card"><span>TRANSACTIONS</span><strong>${items.length}</strong></div>
        <div class="insight-card"><span>AVERAGE SPEND</span><strong>${currency(average)}</strong></div>
        <div class="insight-card"><span>TOP CATEGORY</span><strong>${escapeHTML(top ? CATEGORY_LABELS[top[0]] : "—")}</strong></div>
      </div>
      <div class="report-breakdown">${entries.map(([category, amount]) => `<div class="report-breakdown-row"><span>${escapeHTML(CATEGORY_LABELS[category])} · ${Math.round(amount / total * 100)}%</span><strong>${currency(amount)}</strong></div>`).join("")}</div>
      <p class="report-note">${escapeHTML(top ? `Your highest spending category this month was ${CATEGORY_LABELS[top[0]]}.` : "No category insights are available.")} ${semesterBudget !== null ? `Total recorded spending across all dates is ${currency(totalSpent())}, against a semester budget of ${currency(semesterBudget)}.` : "Set a semester budget to monitor your overall balance."}</p>`;
    showToast("Monthly report generated.");
  }

  function exportReport() {
    if (!lastReportText) {
      generateMonthlyReport();
      if (!lastReportText) return;
    }
    const blob = new Blob([lastReportText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `campus-finance-report-${$("reportMonth").value || todayISO().slice(0, 7)}.txt`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    showToast("Report export started.");
  }

  function deleteExpense(id) {
    const expense = expenses.find((item) => item.id === id);
    if (!expense) return;
    if (!window.confirm(`Delete "${expense.description}" (${currency(expense.amount)})?`)) return;
    expenses = expenses.filter((item) => item.id !== id);
    persist();
    renderAll();
    showToast("Expense deleted.");
  }

  function clearAll() {
    if (!expenses.length && semesterBudget === null) {
      showToast("There is no saved data to clear.");
      return;
    }
    if (!window.confirm("Clear all expenses and the semester budget from this browser? This cannot be undone.")) return;
    expenses = [];
    semesterBudget = null;
    lastReportText = "";
    persist();
    renderAll();
    $("monthlyReport").innerHTML = '<div class="report-placeholder"><span>▤</span><strong>Your report will appear here</strong><p>Select a month and generate a report.</p></div>';
    showToast("All local data cleared.");
  }

  function initialize() {
    const now = new Date();
    $("currentDate").textContent = new Intl.DateTimeFormat("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" }).format(now);
    $("expenseDate").value = todayISO();
    $("eventDate").value = todayISO();
    $("reportMonth").value = todayISO().slice(0, 7);
    $("description").maxLength = 90;
    $("eventName").maxLength = 90;

    $("expenseForm").addEventListener("submit", onExpenseSubmit);
    $("budgetForm").addEventListener("submit", onBudgetSubmit);
    $("eventForm").addEventListener("submit", onEventSubmit);
    $("skipEvent").addEventListener("click", skipEvent);
    $("generateReport").addEventListener("click", generateMonthlyReport);
    $("exportReport").addEventListener("click", exportReport);
    $("transactionSearch").addEventListener("input", renderExpenses);
    $("categoryFilter").addEventListener("change", renderExpenses);
    $("expenseTableBody").addEventListener("click", (event) => {
      const button = event.target.closest("[data-delete]");
      if (button) deleteExpense(button.dataset.delete);
    });
    $("clearExpenses").addEventListener("click", clearAll);
    $("addExpenseShortcut").addEventListener("click", () => {
      $("add-expense").scrollIntoView({ behavior: "smooth", block: "start" });
      $("description").focus({ preventScroll: true });
    });
    renderAll();
  }

  document.addEventListener("DOMContentLoaded", initialize);
})();
