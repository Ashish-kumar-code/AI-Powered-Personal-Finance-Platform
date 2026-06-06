from database import get_db_connection
from datetime import datetime

def add_transaction(user_id, type, category, amount, description, date=None):
    conn = get_db_connection()
    cursor = conn.cursor()
    if date is None:
        date = datetime.now().strftime("%Y-%m-%d")

    cursor.execute('''
        INSERT INTO transactions (user_id, type, category, amount, date, description)
        VALUES (?, ?, ?, ?, ?, ?)
    ''', (user_id, type, category, amount, date, description))

    conn.commit()
    conn.close()
    print(f"✅ {type} entry added successfully.")

def view_transactions(user_id):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute('''
        SELECT id, type, category, amount, date, description
        FROM transactions
        WHERE user_id = ?
        ORDER BY date DESC
    ''', (user_id,))

    transactions = cursor.fetchall()
    conn.close()

    if transactions:
        print("\n--- Your Transactions ---")
        for t in transactions:
            print(f"[{t[0]}] {t[1]} | {t[2]} | ₹{t[3]} | {t[4]} | {t[5]}")
    else:
        print("No transactions found.")

def delete_transaction(user_id, transaction_id):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute('''
        DELETE FROM transactions
        WHERE id = ? AND user_id = ?
    ''', (transaction_id, user_id))

    conn.commit()
    conn.close()
    print("✅ Transaction deleted.")

