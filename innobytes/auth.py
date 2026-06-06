import sqlite3
import hashlib
from database import get_db_connection

def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()

def register_user(username, password):
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("INSERT INTO users (username, password) VALUES (?, ?)", (username, hash_password(password)))
        conn.commit()
        print("✅ Registration successful!")
        return True
    except sqlite3.IntegrityError:
        print("❌ Username already exists.")
        return False
    finally:
      conn.close()

def login_user(username, password):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT id FROM users WHERE username = ? AND password = ?", (username, hash_password(password)))
    result = cursor.fetchone()
    conn.close()

    if result:
        print("✅ Login successful!")
        return result[0]  # return user_id
    else:
        print("❌ Invalid username or password.")
        return None
