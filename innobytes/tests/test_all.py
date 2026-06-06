import unittest
from auth import register_user, login_user
from transactions import add_transaction, view_transactions, delete_transaction
from reports import generate_report
from backup import backup_database, restore_database
from database import get_db_connection

class TestFinanceApp(unittest.TestCase):

    def create_test_user_and_login(self):
        username = "testuser"
        password = "testpass"
        register_user(username, password)
        return login_user(username, password)
    
    def setUp(self):
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM users WHERE username = ?", ("testuser",))
        conn.commit()
        conn.close()
        register_user("testuser", "testpass")

    def test_auth(self):
         user_id = login_user("testuser", "testpass")
         self.assertIsInstance(user_id, int)
         return user_id 


   


    def test_transactions_and_reports(self):
        user_id = self.test_auth()
        add_transaction(user_id, "Income", "TestSalary", 5000, "June income")
        print("\n🧾 Viewing transactions:")
        view_transactions(user_id)
        print("\n📊 Generating report:")
        generate_report(user_id, month=6, year=2025)

    
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM transactions WHERE user_id = ? ORDER BY id DESC LIMIT 1", (user_id,))
        result = cursor.fetchone()
        if result:
            delete_transaction(user_id, result[0])
        conn.close()


    def test_backup_and_restore(self):
        backup_database()
        restore_database()

if __name__ == "__main__":
    unittest.main()
