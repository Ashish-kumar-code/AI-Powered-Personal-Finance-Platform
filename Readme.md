# 💰 AI-Powered Personal Finance Analytics Platform

An advanced, full-stack personal finance management and predictive analytics suite designed for Data Analytics and Full-Stack Engineering portfolios. The platform decouples a legacy Python CLI system into a modern **Flask JSON REST API** backend and a **Vite + React SPA** frontend styled with **Tailwind CSS** and powered by **Chart.js** visualizations.

---

## 🚀 Key Features

* **Interactive Analytical Dashboard:** Real-time metrics dashboard featuring KPI cards, Line charts (monthly expense trends), Pie charts (category allocations), and Bar charts (budget utilization).
* **Pandas Analytics Engine:** Leverages Pandas to calculate granular financial indices, including category expenditure totals, budget compliance margins, savings rates, and a composite **Financial Health Score** (0-100 score weighing margins and budget compliance).
* **Daily Spending Heatmap:** A GitHub-style calendar contribution grid that dynamically colors cells based on daily transaction volumes over the last 365 days.
* **Scikit-Learn Predictive Modeling:**
  * **Expense Forecasting:** Fits a Linear Regression model on historical transactions to forecast expenditure trends for the next 3 months.
  * **Goal Timeline Prediction:** Projects how many months it will take to achieve a specific savings goal based on rolling net-savings rates.
  * **Smart Budgets Recommender:** Proposes optimized monthly budgets per category based on historical moving averages.
* **Natural Language AI Insights:** Compares month-over-month spending behaviors to output human-readable alerts (e.g. *"Food spending increased by 15% this month due to weekend dining transactions. We recommend reducing budget by 10% next month."*).
* **Multi-Format Reports Exporter:** Instantly compiles financial summaries into downloadable tabular **CSVs**, styled **Excel spreadsheets** (using `openpyxl`), or professionally formatted **PDF reports** (using `ReportLab`) containing graphs, tables, and AI recommendations.
* **Clean Decoupled Architecture:** Communication over JSON REST APIs with cross-origin session support and fallback headers (`X-User-ID` or `Authorization Bearer`).

---

## 🛠️ Tech Stack

### Backend
* **Language & Core:** Python 3.10+, Flask
* **Data Processing & Analytics:** Pandas, NumPy
* **Machine Learning:** Scikit-learn, Joblib
* **Database:** SQLite3
* **Document Exporters:** ReportLab (PDF), Openpyxl (Excel)
* **Server Gateway:** Gunicorn (Production)

### Frontend
* **Core & Build Tool:** React 18+, Vite, Javascript
* **Styling & Icons:** Tailwind CSS v3, Lucide React
* **Charts & Visualizations:** Chart.js, React-chartjs-2
* **Deployments:** Vercel SPA rewrite config (`vercel.json`)

---

## 📐 System Architecture

```text
+-----------------------+      JSON REST APIs      +------------------------+
|  Vite + React Client  | <======================> |    Flask Web Server    |
|   (Vercel SPA Node)   |   CORS / Auth Headers    |   (Render Container)   |
+-----------------------+                          +------------------------+
       |                                                      ||
       |-- Sidebar Router                                     |-- auth.py
       |-- KPICard Rows                                       |-- transactions.py & budget.py
       |-- Chart.js Canvas (Line/Bar/Pie)                      |-- analytics_service.py (Pandas)
       |-- Github-style Heatmap Grid                          |-- ml_module.py (Scikit-Learn)
       |-- AI Insights Card                                   |-- insights_service.py (MoM Variance)
       |-- Exporter Forms                                     |-- reports_service.py (PDF/XLSX/CSV)
                                                              ||
                                                   +------------------------+
                                                   |     SQLite Database    |
                                                   |      (finance.db)      |
                                                   +------------------------+
```

---

## 📁 Repository Directory Structure

```text
FINANCE/
├── DEPLOYMENT_GUIDE.md          # Guide for Render/Vercel setups
├── PROJECT_ROADMAP.md           # Product Requirements (PRD) & logical designs
├── README.md                    # Main developer documentation (This file)
├── finance.db                   # SQLite database (Root instance)
│
├── innobytes/                   # Backend Python Application
│   ├── app.py                   # REST API routes and Flask entry point
│   ├── auth.py                  # Core user authentication services
│   ├── transactions.py          # Legacy transaction database operations
│   ├── budget.py                # Legacy budget database operations
│   ├── database.py              # SQLite schema initializations
│   ├── migrate_db.py            # Migration script adding upgraded tables
│   ├── analytics_service.py     # Pandas engine & Financial Health Score
│   ├── ml_module.py             # Scikit-learn regressors & predictive services
│   ├── insights_service.py      # AI natural language feedback compiler
│   ├── reports_service.py       # Exporter utility (PDF, Excel, CSV)
│   ├── main.py                  # Legacy Command Line Interface (CLI)
│   │
│   ├── models/                  # Joblib serialized ML models (.joblib)
│   ├── generated_reports/       # Directory caching exported files
│   ├── templates/               # Legacy Jinja2 fallback HTML pages
│   ├── backups/                 # Database backups directory
│   │
│   ├── requirements.txt         # Declared python dependencies
│   ├── Dockerfile               # Container build settings for Render
│   └── tests/                   # Python unittest suites
│       ├── test_all.py          # Core database & CRUD tests
│       └── test_analytics.py    # Idempotent analytics & ML engine tests
│
└── frontend/                    # Frontend React Single Page App
    ├── package.json             # Declared NPM dependencies
    ├── vite.config.js           # Vite server settings
    ├── tailwind.config.js       # Tailwind content content-scanning
    ├── postcss.config.js        # PostCSS configs
    ├── vercel.json              # Vercel SPA redirects
    ├── index.html               # Main index wrapper (contains SEO tags)
    │
    └── src/
        ├── main.jsx             # React DOM entry point
        ├── index.css            # Base styles + glassmorphism tokens
        ├── App.jsx              # Router & session controller
        │
        ├── components/          # Reusable UI widgets
        │   ├── Sidebar.jsx      # Navigation links
        │   ├── KPICard.jsx      # Individual summary cards
        │   ├── Charts.jsx       # ChartJS Line, Pie, and Bar graphs
        │   ├── ExpenseHeatmap.jsx # Contribution calendar activity grid
        │   └── AIInsightsPanel.jsx # AI recommendations lists
        │
        └── pages/               # Primary page routes
            ├── Auth.jsx         # Signin & Signup
            ├── Dashboard.jsx    # Master dashboard grid
            ├── Transactions.jsx # Ledger additions & histories
            ├── Budgets.jsx      # Set bounds & utilization indicators
            ├── Goals.jsx        # Savings targets & ML timeline forecasts
            ├── Investments.jsx  # Net worth asset allocators
            └── Reports.jsx      # Exporter options & download triggers
```

---

## 🗄️ Database Upgraded Schema

SQLite tables defined inside `database.py`:

* **`users`:** `id (PK)`, `username (UNIQUE)`, `password (SHA-256)`
* **`transactions`:** `id (PK)`, `user_id (FK)`, `type (Income/Expense)`, `category`, `amount`, `date`, `description`
* **`budgets`:** `id (PK)`, `user_id (FK)`, `category`, `amount`, `month`, `year`
* **`goals`:** `id (PK)`, `user_id (FK)`, `name`, `target_amount`, `current_amount`, `target_date`, `category`, `status (active/completed)`
* **`reports`:** `id (PK)`, `user_id (FK)`, `report_type`, `month`, `year`, `total_income`, `total_expense`, `net_savings`, `file_path`, `created_at`
* **`predictions`:** `id (PK)`, `user_id (FK)`, `prediction_type`, `target_month`, `target_year`, `predicted_amount`, `created_at`
* **`insights`:** `id (PK)`, `user_id (FK)`, `category`, `title`, `content`, `created_at`
* **`notifications`:** `id (PK)`, `user_id (FK)`, `title`, `message`, `is_read`, `created_at`

---

## 🔌 REST API JSON Endpoints

| Method | Endpoint | Description | Headers / Query Params | Request Body |
|---|---|---|---|---|
| **POST** | `/api/auth/register` | Register a new user | | `{username, password}` |
| **POST** | `/api/auth/login` | Secure authentication | | `{username, password}` |
| **POST** | `/api/auth/logout` | Clear user session cookies | | |
| **GET** | `/api/transactions` | Fetch user transaction registry | `X-User-ID` | |
| **POST** | `/api/transactions` | Add a new ledger entry | `X-User-ID` | `{type, category, amount, date, description}` |
| **DELETE**| `/api/transactions/<id>` | Delete transaction | `X-User-ID` | |
| **GET** | `/api/budgets` | Fetch active budget margins | `X-User-ID` | |
| **POST** | `/api/budgets` | Set category monthly limits | `X-User-ID` | `{category, amount, month, year}` |
| **GET** | `/api/budgets/summary`| Fetch spent vs budget progress | `X-User-ID`, `?month=X&year=Y` | |
| **GET** | `/api/goals` | Fetch active savings targets | `X-User-ID` | |
| **POST** | `/api/goals` | Initialize a new savings goal | `X-User-ID` | `{name, target_amount, current_amount, target_date, category}` |
| **PUT** | `/api/goals/<id>` | Update goal savings balance | `X-User-ID` | `{current_amount, status}` |
| **DELETE**| `/api/goals/<id>` | Delete savings goal | `X-User-ID` | |
| **GET** | `/api/analytics` | Fetch Pandas analytics overview | `X-User-ID`, `?month=X&year=Y` | |
| **GET** | `/api/predictions` | Fetch ML predictions and budget recommendations | `X-User-ID`, `?goal_id=X` | |
| **GET** | `/api/insights` | Fetch AI natural language comments | `X-User-ID` | |
| **GET** | `/api/notifications` | Fetch system budget warning alerts | `X-User-ID` | |
| **PUT** | `/api/notifications/<id>`| Mark alert notification as read | `X-User-ID` | |
| **GET** | `/api/reports` | List generated statements history | `X-User-ID` | |
| **POST** | `/api/reports/generate`| Compile a new spreadsheet/PDF | `X-User-ID` | `{report_type, month, year, format}` |
| **GET** | `/api/reports/download` | Trigger statement file download stream | `X-User-ID`, `?format=pdf&month=X&year=Y` | |

---

## ⚙️ Installation & Local Setup

### Prerequisites
* Python 3.10 or higher
* Node.js 18 or higher (with npm)

### Step 1: Set up the Python Backend
1. Navigate to the backend folder:
   ```bash
   cd innobytes
   ```
2. Install the required libraries:
   ```bash
   pip install -r requirements.txt
   ```
3. Run database migrations to create the upgraded schema:
   ```bash
   python migrate_db.py
   ```
4. Run the Flask application server:
   ```bash
   python app.py
   ```
   *The backend will boot up at `http://localhost:5000`.*

### Step 2: Set up the React Frontend
1. Open a new terminal window and navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install the required Node dependencies:
   ```bash
   npm install
   ```
3. Boot up the Vite dev server:
   ```bash
   npm run dev
   ```
   *The frontend will run at `http://localhost:5173`.*
4. Open the link in a browser, register an account, and begin logging entries!

---

## 🧪 Testing and Validation

### Running Backend Unittests
Execute the Python test runner from the `innobytes` directory to verify auth, database CRUD, backups, Pandas analytics, and Scikit-learn services:
```bash
python -m unittest discover tests
```

### Running Frontend Verification Build
Verify that the React code compiles to optimized static assets without warnings or errors:
```bash
cd frontend
npm run build
```
<<<<<<< HEAD
The compiled files are generated in `frontend/dist/`.
=======
The compiled files are generated in `frontend/dist/`.
>>>>>>> 1496111 (chore: repo cleanup - add .gitignore/.dockerignore and untrack local artifacts)
