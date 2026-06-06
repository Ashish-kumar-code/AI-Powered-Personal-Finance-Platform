import sqlite3
from datetime import datetime
def create_budget_table():
    conn = sqlite3.connect("finance.db")
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS budgets (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            category TEXT,
            amount REAL,
            month TEXT,
            year TEXT
        )
    """)
    conn.commit()     
    conn.close()


def set_budget(user_id, category, amount, month, year):
    create_budget_table()
    conn = sqlite3.connect("finance.db")
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO budgets (user_id, category, amount, month, year)
        VALUES (?, ?, ?, ?, ?)
    """, (user_id, category, amount, str(month), str(year)))
    conn.commit()
    conn.close()
    print(f" Budget of ₹{amount} set for {category} in {month}/{year}.")

def check_budget(user_id, category, amount, month, year):
    conn = sqlite3.connect("finance.db")
    cursor = conn.cursor()

    cursor.execute("""
        SELECT amount FROM budgets 
        WHERE user_id=? AND category=? AND month=? AND year=?
    """, (user_id, category, str(month), str(year)))
    result = cursor.fetchone()

    if result:
        budget_limit = result[0]
        cursor.execute("""
            SELECT SUM(amount) FROM transactions
            WHERE user_id=? AND type='Expense' AND category=? AND 
                  strftime('%m', date) = ? AND strftime('%Y', date) = ?
        """, (user_id, category, f"{int(month):02}", str(year)))
        total_spent = cursor.fetchone()[0] or 0

        if total_spent + amount > budget_limit:
            print(f" Warning: Budget exceeded for {category}!")
        else:
            print(f" Remaining budget for {category}: ₹{budget_limit - total_spent - amount}")
    else:
        print(f" No budget set for {category} in {month}/{year}")

    conn.close()
def show_budget_summary(user_id, month, year):
    create_budget_table()
    conn = sqlite3.connect("finance.db")
    cursor = conn.cursor()

    cursor.execute("""
        SELECT category, amount FROM budgets 
        WHERE user_id=? AND month=? AND year=?
    """, (user_id, str(month), str(year)))
    budgets = cursor.fetchall()

    if not budgets:
        print("\n No budgets set for this month.\n")
        conn.close()
        return

    print(f"\n--- Budget Summary for {month}/{year} ---")
    print(f"{'Category':<15}{'Budget':<10}{'Spent':<10}{'Remaining/Excess':<20}")
    print("-" * 55)

    for category, budget_amount in budgets:
        cursor.execute("""
            SELECT SUM(amount) FROM transactions
            WHERE user_id=? AND type='Expense' AND category=? AND 
                  strftime('%m', date) = ? AND strftime('%Y', date) = ?
        """, (user_id, category, f"{int(month):02}", str(year)))
        total_spent = cursor.fetchone()[0] or 0
        difference = budget_amount - total_spent
        status = f"₹{difference:.2f}"
        if difference < 0:
            status = f"-₹{abs(difference):.2f} (Exceeded)"
        print(f"{category:<15}₹{budget_amount:<9.2f}₹{total_spent:<9.2f}{status:<20}")

    print("-" * 55)
    conn.close()
    

