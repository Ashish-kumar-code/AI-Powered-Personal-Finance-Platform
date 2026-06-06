from database import get_db_connection
from datetime import datetime

def generate_report(user_id, month=None, year=None):
    conn = get_db_connection()
    cursor = conn.cursor()

    query = '''
        SELECT type, SUM(amount)
        FROM transactions
        WHERE user_id = ?
    '''
    params = [user_id]

    if month and year:
        query += " AND strftime('%m', date) = ? AND strftime('%Y', date) = ?"
        params += [f"{int(month):02}", str(year)]
    elif year:
        query += " AND strftime('%Y', date) = ?"
        params += [str(year)]

    query += " GROUP BY type"

    cursor.execute(query, tuple(params))
    results = cursor.fetchall()
    conn.close()

    income = 0
    expenses = 0

    for t_type, total in results:
        if t_type == "Income":
            income = total
        elif t_type == "Expense":
            expenses = total

    savings = income - expenses

    print("\n--- Financial Report ---")
    print(f"Total Income : ₹{income}")
    print(f"Total Expense: ₹{expenses}")
    print(f"Net Savings  : ₹{savings}")
