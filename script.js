/* =========================
   GLOBAL STATE
========================= */
let expenses = JSON.parse(localStorage.getItem("expenses")) || [];

/* =========================
   STORAGE
========================= */
function saveExpensesToStorage() {
  localStorage.setItem("expenses", JSON.stringify(expenses));
}

/* =========================
   ADD EXPENSE
========================= */
function addExpense() {
  const amountInput = document.getElementById("amount");
  const categoryInput = document.getElementById("category");
  const descriptionInput = document.getElementById("description");

  const amount = Number(amountInput.value);
  const category = categoryInput.value;
  const description = descriptionInput.value.trim();

  if (amount <= 0 || description === "") {
    alert("Please enter valid amount and description");
    return;
  }

  expenses.push({
    amount,
    category,
    description
  });

  saveExpensesToStorage();
  refreshUI();

  amountInput.value = "";
  descriptionInput.value = "";
}

/* =========================
   DISPLAY EXPENSES
========================= */
function displayExpenses() {
  const list = document.getElementById("expenseList");
  list.innerHTML = "";

  expenses.forEach(exp => {
    const li = document.createElement("li");
    li.textContent = `₹${exp.amount} - ${exp.category} - ${exp.description}`;
    list.appendChild(li);
  });
}

/* =========================
   CATEGORY SUMMARY
========================= */
function displayCategorySummary() {
  const summary = {
    Mess: 0,
    Books: 0,
    Travel: 0,
    Entertainment: 0
  };

  expenses.forEach(exp => {
    summary[exp.category] += exp.amount;
  });

  const list = document.getElementById("categorySummary");
  list.innerHTML = "";

  for (let cat in summary) {
    const li = document.createElement("li");
    li.textContent = `${cat}: ₹${summary[cat]}`;
    list.appendChild(li);
  }
}

/* =========================
   SEMESTER BUDGET
========================= */
function checkSemesterBudget() {
  const budgetValue = document.getElementById("semesterBudget").value;
  const status = document.getElementById("budgetStatus");

  if (!budgetValue) {
    status.textContent = "";
    return;
  }

  const budget = Number(budgetValue);
  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);

  if (totalSpent > budget) {
    status.textContent = `⚠️ Budget exceeded! Spent ₹${totalSpent}`;
    status.style.color = "red";
  } else {
    status.textContent = `Remaining Balance: ₹${budget - totalSpent}`;
    status.style.color = "green";
  }
}

/* =========================
   EVENT PLANNER
========================= */
function attendEvent() {
  const name = document.getElementById("eventName").value.trim();
  const cost = Number(document.getElementById("eventCost").value);
  const impact = document.getElementById("eventImpact");

  if (name === "" || cost <= 0) {
    alert("Please enter valid event name and cost");
    return;
  }

  expenses.push({
    amount: cost,
    category: "Entertainment",
    description: `Event: ${name}`
  });

  saveExpensesToStorage();
  refreshUI();

  impact.textContent = `You attended "${name}". Monthly spending increased by ₹${cost}`;
  impact.style.color = "red";

  document.getElementById("eventName").value = "";
  document.getElementById("eventCost").value = "";
}

function skipEvent() {
  const name = document.getElementById("eventName").value.trim();
  const cost = Number(document.getElementById("eventCost").value);
  const impact = document.getElementById("eventImpact");

  if (name === "" || cost <= 0) {
    alert("Please enter valid event name and cost");
    return;
  }

  impact.textContent = `You skipped "${name}". You saved ₹${cost} this month`;
  impact.style.color = "green";

  document.getElementById("eventName").value = "";
  document.getElementById("eventCost").value = "";
}

/* =========================
   MONTHLY REPORT
========================= */
function generateMonthlyReport() {
  const reportArea = document.getElementById("monthlyReport");

  if (expenses.length === 0) {
    reportArea.textContent = "No expenses recorded this month.";
    return;
  }

  let totalSpent = 0;
  const categoryTotals = {};

  expenses.forEach(exp => {
    totalSpent += exp.amount;
    categoryTotals[exp.category] =
      (categoryTotals[exp.category] || 0) + exp.amount;
  });

  let topCategory = "";
  let maxAmount = 0;
  for (let cat in categoryTotals) {
    if (categoryTotals[cat] > maxAmount) {
      maxAmount = categoryTotals[cat];
      topCategory = cat;
    }
  }

  const reportText = `
MONTHLY FINANCE REPORT
----------------------
Total Spent: ₹${totalSpent}

Category Breakdown:
${Object.entries(categoryTotals)
  .map(([c, a]) => `${c}: ₹${a}`)
  .join("\n")}

Top Insights:
• Highest spending category: ${topCategory} (₹${maxAmount})
• Total spent this month: ₹${totalSpent}
• Keep tracking to control your budget
`;

  reportArea.textContent = reportText.trim();
}

/* =========================
   EXPORT REPORT
========================= */
function exportReport() {
  const reportText = document.getElementById("monthlyReport").textContent;

  if (!reportText) {
    alert("Please generate the report first");
    return;
  }

  const blob = new Blob([reportText], { type: "text/plain" });
  const link = document.createElement("a");

  link.href = URL.createObjectURL(blob);
  link.download = "monthly-report.txt";
  link.click();
}

/* =========================
   HELPER
========================= */
function refreshUI() {
  displayExpenses();
  displayCategorySummary();
  checkSemesterBudget();
}

/* =========================
   INITIAL LOAD
========================= */
refreshUI();



