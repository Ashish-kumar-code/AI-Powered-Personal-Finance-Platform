import os
import sqlite3
from io import BytesIO
from datetime import datetime
from flask import Flask, render_template, request, redirect, session, url_for, jsonify, send_file
from flask_cors import CORS

from database import init_db, get_db_connection
from auth import register_user, login_user
from transactions import add_transaction, view_transactions, delete_transaction
from budget import set_budget, show_budget_summary

# Import new analytics, ML, insights, and report services
from analytics_service import get_analytics_summary
from ml_module import forecast_expenses, predict_savings_goal_achievement, recommend_budgets, train_and_save_forecast_model
from insights_service import generate_ai_insights
from reports_service import generate_pdf_report, generate_excel_report, generate_csv_report

app = Flask(__name__)
# Use environment variable for secret key in production
app.secret_key = os.environ.get("SECRET_KEY", "change_this_secret_key")

# Enable CORS for frontend integration
CORS(app, supports_credentials=True, resources={r"/api/*": {"origins": "*"}})

init_db()

# =====================================================================
# CORE UTILITIES & HELPER FUNCTIONS
# =====================================================================

def get_current_user_id():
    """
    Extracts user_id from session or fallback headers for React SPA integration.
    """
    if "user_id" in session:
        return session["user_id"]
        
    # Check X-User-ID header
    x_user_id = request.headers.get("X-User-ID")
    if x_user_id:
        try:
            return int(x_user_id)
        except ValueError:
            pass
            
    # Check Authorization Bearer header
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        try:
            return int(auth_header.split(" ")[1])
        except ValueError:
            pass
            
    return None

def trigger_budget_notifications(user_id, category, spent_amount, month, year):
    """
    Checks if spent amount in a category exceeds budget limit, and raises notifications.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT amount FROM budgets WHERE user_id=? AND category=? AND month=? AND year=?",
        (user_id, category, str(month), str(year))
    )
    result = cursor.fetchone()
    
    if result:
        budget_limit = result[0]
        # Sum actual spent
        cursor.execute("""
            SELECT SUM(amount) FROM transactions
            WHERE user_id=? AND type='Expense' AND category=? AND 
                  strftime('%m', date) = ? AND strftime('%Y', date) = ?
        """, (user_id, category, f"{int(month):02}", str(year)))
        total_spent = cursor.fetchone()[0] or 0.0
        
        if total_spent > budget_limit:
            # Create a notification in the DB
            title = f"Budget Exceeded: {category}"
            msg = f"Alert! You have spent ₹{total_spent:.2f} on {category}, exceeding your limit of ₹{budget_limit:.2f}."
            created_at = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            cursor.execute(
                "INSERT INTO notifications (user_id, title, message, is_read, created_at) VALUES (?, ?, ?, 0, ?)",
                (user_id, title, msg, created_at)
            )
            conn.commit()
    conn.close()

# =====================================================================
# LEGACY HTML WEB ROUTES (Jinja2 Templates Compatibility)
# =====================================================================

@app.route("/")
def home():
    logged_in = "user_id" in session
    user_id = session.get("user_id")
    
    txs = []
    summary_data = []
    
    if logged_in and user_id:
        # Load legacy transactions to render
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT id, type, category, amount, date, description FROM transactions WHERE user_id = ? ORDER BY date DESC", (user_id,))
        txs = cursor.fetchall()
        
        # Load legacy budgets
        now = datetime.now()
        cursor.execute("SELECT category, amount FROM budgets WHERE user_id = ? AND month = ? AND year = ?", (user_id, str(now.month), str(now.year)))
        budgets = cursor.fetchall()
        
        for cat, b_amt in budgets:
            cursor.execute("""
                SELECT SUM(amount) FROM transactions
                WHERE user_id=? AND type='Expense' AND category=? AND 
                      strftime('%m', date) = ? AND strftime('%Y', date) = ?
            """, (user_id, cat, f"{now.month:02}", str(now.year)))
            total_spent = cursor.fetchone()[0] or 0.0
            summary_data.append({
                "category": cat,
                "budget": b_amt,
                "spent": total_spent,
                "remaining": b_amt - total_spent
            })
        conn.close()
        
    return render_template(
        "dashboard.html",
        show_register=not logged_in,
        show_login=not logged_in,
        show_dashboard=logged_in,
        transactions=txs,
        summary=summary_data
    )

@app.route("/register", methods=["POST"])
def register():
    username = request.form["username"]
    password = request.form["password"]
    register_user(username, password)
    return redirect(url_for("home"))

@app.route("/login", methods=["POST"])
def login():
    username = request.form["username"]
    password = request.form["password"]
    user_id = login_user(username, password)
    if user_id:
        session["user_id"] = user_id
    return redirect(url_for("home"))

@app.route("/logout")
def logout():
    session.clear()
    return redirect(url_for("home"))

@app.route("/add_transaction", methods=["POST"])
def add_txn_html():
    user_id = session.get("user_id")
    if not user_id:
        return redirect(url_for("home"))
        
    t_type = request.form["type"]
    category = request.form["category"]
    amount = float(request.form["amount"])
    description = request.form.get("description", "")
    
    add_transaction(user_id, t_type, category, amount, description)
    
    # Check budget constraints
    now = datetime.now()
    if t_type == "Expense":
        trigger_budget_notifications(user_id, category, amount, now.month, now.year)
        
    return redirect(url_for("home"))

@app.route("/delete/<int:transaction_id>")
def delete_txn_html(transaction_id):
    user_id = session.get("user_id")
    if user_id:
        delete_transaction(user_id, transaction_id)
    return redirect(url_for("home"))

@app.route("/set_budget", methods=["POST"])
def set_budget_html():
    user_id = session.get("user_id")
    if not user_id:
        return redirect(url_for("home"))
        
    category = request.form["category"]
    amount = float(request.form["amount"])
    month = request.form["month"]
    year = request.form["year"]
    
    # Convert month names to integer index strings if needed
    try:
        month_val = int(month)
    except ValueError:
        # Assume textual month names like "June"
        try:
            month_val = datetime.strptime(month, "%B").month
        except ValueError:
            month_val = datetime.now().month
            
    set_budget(user_id, category, amount, str(month_val), str(year))
    return redirect(url_for("home"))

# =====================================================================
# REST JSON API ENDPOINTS (React SPA Frontend Integration)
# =====================================================================

@app.route("/api/auth/register", methods=["POST"])
def api_register():
    data = request.get_json() or {}
    username = data.get("username")
    password = data.get("password")
    
    if not username or not password:
        return jsonify({"success": False, "message": "Missing username or password."}), 400
        
    success = register_user(username, password)
    if success:
        return jsonify({"success": True, "message": "User registered successfully!"})
    else:
        return jsonify({"success": False, "message": "Username already exists."}), 400

@app.route("/api/auth/login", methods=["POST"])
def api_login():
    data = request.get_json() or {}
    username = data.get("username")
    password = data.get("password")
    
    if not username or not password:
        return jsonify({"success": False, "message": "Missing credentials."}), 400
        
    user_id = login_user(username, password)
    if user_id:
        session["user_id"] = user_id
        return jsonify({
            "success": True,
            "message": "Login successful!",
            "user_id": user_id,
            "username": username
        })
    else:
        return jsonify({"success": False, "message": "Invalid username or password."}), 401

@app.route("/api/auth/logout", methods=["POST"])
def api_logout():
    session.clear()
    return jsonify({"success": True, "message": "Logged out successfully!"})

@app.route("/api/transactions", methods=["GET", "POST"])
def api_transactions():
    user_id = get_current_user_id()
    if not user_id:
        return jsonify({"success": False, "message": "Unauthorized"}), 401
        
    if request.method == "GET":
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT id, type, category, amount, date, description FROM transactions WHERE user_id = ? ORDER BY date DESC", (user_id,))
        rows = cursor.fetchall()
        conn.close()
        
        txs = []
        for r in rows:
            txs.append({
                "id": r[0],
                "type": r[1],
                "category": r[2],
                "amount": r[3],
                "date": r[4],
                "description": r[5]
            })
        return jsonify(txs)
        
    elif request.method == "POST":
        data = request.get_json() or {}
        t_type = data.get("type")
        category = data.get("category")
        amount = data.get("amount")
        description = data.get("description", "")
        date = data.get("date")  # Format: YYYY-MM-DD
        
        if not t_type or not category or amount is None:
            return jsonify({"success": False, "message": "Missing required fields."}), 400
            
        try:
            amount_val = float(amount)
        except ValueError:
            return jsonify({"success": False, "message": "Amount must be a number."}), 400
            
        # Write transaction
        add_transaction(user_id, t_type, category, amount_val, description, date)
        
        # Trigger budgets warning check if expense
        if t_type == "Expense":
            dt = datetime.strptime(date, "%Y-%m-%d") if date else datetime.now()
            trigger_budget_notifications(user_id, category, amount_val, dt.month, dt.year)
            
        return jsonify({"success": True, "message": "Transaction added successfully!"})

@app.route("/api/transactions/<int:transaction_id>", methods=["DELETE"])
def api_delete_transaction(transaction_id):
    user_id = get_current_user_id()
    if not user_id:
        return jsonify({"success": False, "message": "Unauthorized"}), 401
        
    delete_transaction(user_id, transaction_id)
    return jsonify({"success": True, "message": "Transaction deleted!"})

@app.route("/api/budgets", methods=["GET", "POST"])
def api_budgets():
    user_id = get_current_user_id()
    if not user_id:
        return jsonify({"success": False, "message": "Unauthorized"}), 401
        
    if request.method == "GET":
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT id, category, amount, month, year FROM budgets WHERE user_id = ?", (user_id,))
        rows = cursor.fetchall()
        conn.close()
        
        budgets = []
        for r in rows:
            budgets.append({
                "id": r[0],
                "category": r[1],
                "amount": r[2],
                "month": r[3],
                "year": r[4]
            })
        return jsonify(budgets)
        
    elif request.method == "POST":
        data = request.get_json() or {}
        category = data.get("category")
        amount = data.get("amount")
        month = data.get("month")
        year = data.get("year")
        
        if not category or amount is None or not month or not year:
            return jsonify({"success": False, "message": "Missing required fields."}), 400
            
        set_budget(user_id, category, float(amount), str(month), str(year))
        return jsonify({"success": True, "message": "Budget limit set successfully!"})

@app.route("/api/budgets/summary", methods=["GET"])
def api_budget_summary():
    user_id = get_current_user_id()
    if not user_id:
        return jsonify({"success": False, "message": "Unauthorized"}), 401
        
    month = request.args.get("month")
    year = request.args.get("year")
    
    summary = get_analytics_summary(user_id, month, year)
    return jsonify(summary["budget_utilization"])

# =====================================================================
# GOALS API
# =====================================================================

@app.route("/api/goals", methods=["GET", "POST"])
def api_goals():
    user_id = get_current_user_id()
    if not user_id:
        return jsonify({"success": False, "message": "Unauthorized"}), 401
        
    conn = get_db_connection()
    cursor = conn.cursor()
    
    if request.method == "GET":
        cursor.execute(
            "SELECT id, name, target_amount, current_amount, target_date, category, status FROM goals WHERE user_id = ?",
            (user_id,)
        )
        rows = cursor.fetchall()
        conn.close()
        
        goals = []
        for r in rows:
            goals.append({
                "id": r[0],
                "name": r[1],
                "target_amount": r[2],
                "current_amount": r[3],
                "target_date": r[4],
                "category": r[5],
                "status": r[6],
                "progress_pct": round((r[3]/r[2]*100.0), 1) if r[2] > 0 else 0.0
            })
        return jsonify(goals)
        
    elif request.method == "POST":
        data = request.get_json() or {}
        name = data.get("name")
        target_amount = data.get("target_amount")
        current_amount = data.get("current_amount", 0.0)
        target_date = data.get("target_date")
        category = data.get("category")
        
        if not name or not target_amount or not target_date or not category:
            conn.close()
            return jsonify({"success": False, "message": "Missing required fields."}), 400
            
        cursor.execute(
            "INSERT INTO goals (user_id, name, target_amount, current_amount, target_date, category, status) VALUES (?, ?, ?, ?, ?, ?, 'active')",
            (user_id, name, float(target_amount), float(current_amount), target_date, category)
        )
        conn.commit()
        conn.close()
        return jsonify({"success": True, "message": "Financial savings goal created!"})

@app.route("/api/goals/<int:goal_id>", methods=["PUT", "DELETE"])
def api_manage_goal(goal_id):
    user_id = get_current_user_id()
    if not user_id:
        return jsonify({"success": False, "message": "Unauthorized"}), 401
        
    conn = get_db_connection()
    cursor = conn.cursor()
    
    if request.method == "PUT":
        data = request.get_json() or {}
        current_amount = data.get("current_amount")
        status = data.get("status")
        
        if current_amount is None and not status:
            conn.close()
            return jsonify({"success": False, "message": "Nothing to update."}), 400
            
        if current_amount is not None:
            cursor.execute("UPDATE goals SET current_amount = ? WHERE id = ? AND user_id = ?", (float(current_amount), goal_id, user_id))
        if status:
            cursor.execute("UPDATE goals SET status = ? WHERE id = ? AND user_id = ?", (status, goal_id, user_id))
            
        conn.commit()
        conn.close()
        return jsonify({"success": True, "message": "Goal updated successfully."})
        
    elif request.method == "DELETE":
        cursor.execute("DELETE FROM goals WHERE id = ? AND user_id = ?", (goal_id, user_id))
        conn.commit()
        conn.close()
        return jsonify({"success": True, "message": "Goal deleted."})

# =====================================================================
# ANALYTICS & ML & INSIGHTS API
# =====================================================================

@app.route("/api/analytics", methods=["GET"])
def api_analytics():
    user_id = get_current_user_id()
    if not user_id:
        return jsonify({"success": False, "message": "Unauthorized"}), 401
        
    month = request.args.get("month")
    year = request.args.get("year")
    
    summary = get_analytics_summary(user_id, month, year)
    return jsonify(summary)

@app.route("/api/predictions", methods=["GET"])
def api_predictions():
    user_id = get_current_user_id()
    if not user_id:
        return jsonify({"success": False, "message": "Unauthorized"}), 401
        
    goal_id = request.args.get("goal_id")
    
    # Train forecaster
    train_and_save_forecast_model(user_id)
    
    expense_forecast = forecast_expenses(user_id, steps=3)
    budget_recs = recommend_budgets(user_id)
    
    goal_forecast = None
    if goal_id:
        goal_forecast = predict_savings_goal_achievement(user_id, int(goal_id))
        
    return jsonify({
        "expense_forecast": expense_forecast,
        "budget_recommendations": budget_recs,
        "goal_achievement_prediction": goal_forecast
    })

@app.route("/api/insights", methods=["GET"])
def api_insights():
    user_id = get_current_user_id()
    if not user_id:
        return jsonify({"success": False, "message": "Unauthorized"}), 401
        
    insights = generate_ai_insights(user_id)
    return jsonify(insights)

@app.route("/api/notifications", methods=["GET"])
def api_notifications():
    user_id = get_current_user_id()
    if not user_id:
        return jsonify({"success": False, "message": "Unauthorized"}), 401
        
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, title, message, is_read, created_at FROM notifications WHERE user_id = ? ORDER BY created_at DESC", (user_id,))
    rows = cursor.fetchall()
    conn.close()
    
    notifs = []
    for r in rows:
        notifs.append({
            "id": r[0],
            "title": r[1],
            "message": r[2],
            "is_read": bool(r[3]),
            "created_at": r[4]
        })
    return jsonify(notifs)

@app.route("/api/notifications/<int:notification_id>", methods=["PUT"])
def api_read_notification(notification_id):
    user_id = get_current_user_id()
    if not user_id:
        return jsonify({"success": False, "message": "Unauthorized"}), 401
        
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?", (notification_id, user_id))
    conn.commit()
    conn.close()
    return jsonify({"success": True, "message": "Notification marked as read!"})

# =====================================================================
# DOWNLOAD REPORTS API
# =====================================================================

@app.route("/api/reports", methods=["GET"])
def api_reports_list():
    user_id = get_current_user_id()
    if not user_id:
        return jsonify({"success": False, "message": "Unauthorized"}), 401
        
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, report_type, month, year, file_path, created_at FROM reports WHERE user_id = ? ORDER BY created_at DESC", (user_id,))
    rows = cursor.fetchall()
    conn.close()
    
    reps = []
    for r in rows:
        reps.append({
            "id": r[0],
            "report_type": r[1],
            "month": r[2],
            "year": r[3],
            "file_path": r[4],
            "created_at": r[5]
        })
    return jsonify(reps)

@app.route("/api/reports/generate", methods=["POST"])
def api_generate_report():
    user_id = get_current_user_id()
    if not user_id:
        return jsonify({"success": False, "message": "Unauthorized"}), 401
        
    data = request.get_json() or {}
    report_type = data.get("report_type", "monthly")
    month = data.get("month")
    year = data.get("year")
    fmt = data.get("format", "pdf").lower()
    
    now = datetime.now()
    m_val = int(month) if month else now.month
    y_val = int(year) if year else now.year
    
    # Generate file dynamic label
    created_at = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    file_path = f"/api/reports/download?format={fmt}&month={m_val}&year={y_val}"
    
    # Create record in DB
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Fetch report statistics to cache in database row
    summary = get_analytics_summary(user_id, m_val, y_val)
    total_income = summary["total_income"]
    total_expense = summary["total_expense"]
    net_savings = total_income - total_expense
    
    cursor.execute(
        "INSERT INTO reports (user_id, report_type, month, year, total_income, total_expense, net_savings, file_path, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        (user_id, report_type, m_val, y_val, total_income, total_expense, net_savings, file_path, created_at)
    )
    conn.commit()
    conn.close()
    
    return jsonify({"success": True, "message": "Report generated successfully!", "download_url": file_path})

@app.route("/api/reports/download", methods=["GET"])
def api_download_report():
    # Keep user validation check relaxed to allow browser downloads directly
    user_id = get_current_user_id() or session.get("user_id") or 1  # Fallback to test user if direct get
    
    fmt = request.args.get("format", "pdf").lower()
    month = request.args.get("month")
    year = request.args.get("year")
    
    now = datetime.now()
    m = int(month) if month else now.month
    y = int(year) if year else now.year
    
    if fmt == "pdf":
        pdf_bytes = generate_pdf_report(user_id, m, y)
        return send_file(
            BytesIO(pdf_bytes),
            mimetype="application/pdf",
            as_attachment=True,
            download_name=f"finance_report_{m}_{y}.pdf"
        )
    elif fmt == "excel" or fmt == "xlsx":
        xlsx_bytes = generate_excel_report(user_id, m, y)
        return send_file(
            BytesIO(xlsx_bytes),
            mimetype="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            as_attachment=True,
            download_name=f"finance_report_{m}_{y}.xlsx"
        )
    elif fmt == "csv":
        csv_bytes = generate_csv_report(user_id, m, y)
        return send_file(
            BytesIO(csv_bytes),
            mimetype="text/csv",
            as_attachment=True,
            download_name=f"finance_ledger_{m}_{y}.csv"
        )
    else:
        return "Unsupported format", 400

if __name__ == "__main__":
    app.run(debug=True, port=5000)