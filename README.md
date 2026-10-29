# Campus Finance Manager

[![GitHub Actions](https://github.com/pranathibopparaju006/campus-finance-manager/actions/workflows/static-checks.yml/badge.svg)](https://github.com/pranathibopparaju006/campus-finance-manager/actions/workflows/static-checks.yml)
**A Student Expense Tracking and Budget Planning Web Application**

[Live Demo](https://pranathibopparaju006.github.io/campus-finance-manager/) | [GitHub Repository](https://github.com/pranathibopparaju006/campus-finance-manager)

Campus Finance Manager helps college students track daily expenses, manage their semester budget, compare campus event costs, and generate monthly spending reports through a responsive browser-based dashboard.

> **Project scope:** This is a client-side web application. Data is stored in the current browser using `localStorage`. It does not include a backend server, user authentication, or cross-device synchronization.

## Features

- **Expense tracking:** Record expenses with amount, description, category, date, and payment method.
- **Dashboard metrics:** View total spending, transaction count, remaining semester balance, and top spending category.
- **Budget monitoring:** Set a semester budget and monitor budget usage.
- **Transaction management:** Search, filter, and delete expense entries.
- **Category analytics:** Compare expenses across spending categories.
- **Campus event planner:** Estimate event costs and compare attending versus skipping an event.
- **Monthly reports:** View monthly totals, average transaction amount, category breakdowns, and insights.
- **Report export:** Download a generated monthly report as a text file.
- **Local data persistence:** Keep saved expenses and budget information across browser refreshes on the same browser.
- **Responsive design:** Support desktop, tablet, and mobile screens.
- **Input validation:** Validate required fields, monetary amounts, dates, categories, and report month selections.

## Quality and Safety Checks

- Reject invalid calendar dates, including impossible dates.
- Validate monetary values against the limits specified by the application.
- Escape user-provided text before displaying it in generated tables and reports.
- Release report object URLs after initiating downloads.
- Keep data within the local browser; clearing browser storage or switching devices may remove or hide saved information.
- GitHub Actions checks JavaScript syntax and verifies that required project files and local assets referenced by the HTML exist.

## Technology Stack

- HTML5
- CSS3
- Vanilla JavaScript
- Browser `localStorage`

No package installation or build step is required.

## Screenshots

### Dashboard

![Campus Finance Manager Dashboard](screenshots/dashboard.png)

### Spending by Category

![Spending by Category](screenshots/category-summary.png)

### Campus Event Planner

![Campus Event Planner](screenshots/event-planner.png)

### Monthly Report

![Monthly Report](screenshots/monthly-report.png)

## Run Locally

1. Clone or download this repository.
2. Open `index.html` in a modern browser.

Alternatively, start a local development server from the project folder:

```bash
python -m http.server 8000
```

Open `http://localhost:8000` in your browser.

## How to Use

1. Add an expense with its description, amount, category, date, and payment method.
2. Set your semester budget to view the remaining balance and usage percentage.
3. Use search and category filters to find transactions.
4. Enter a campus event and its estimated cost. Choose the available option to record the expense or compare potential savings.
5. Select a month to generate a spending report and export it as a text file if needed.

## Data and Privacy

This project stores data in the browser profile on the device where it is used. Clearing browser storage or switching browsers or devices may remove or hide saved entries.

Do not use this demo to store sensitive financial information. The application does not connect to a bank account or verify transactions.

## Project Structure

```text
campus-finance-manager/
├── .github/
│   └── workflows/
│       └── static-checks.yml
├── index.html
├── style.css
├── script.js
├── README.md
└── screenshots/
    ├── dashboard.png
    ├── category-summary.png
    ├── event-planner.png
    └── monthly-report.png
```

## Future Improvements

- Backend API and database persistence
- Authentication and user-specific accounts
- PDF and CSV report export
- Browser-based end-to-end tests
- More detailed charts and recurring expenses

## Author

**Pranathi**

GitHub: [pranathibopparaju006](https://github.com/pranathibopparaju006)

