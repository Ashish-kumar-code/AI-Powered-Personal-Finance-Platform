import unittest
import os
import sys

# Ensure backend folder is in path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import get_db_connection
from auth import register_user, login_user
from transactions import add_transaction
from analytics_service import get_analytics_summary
from ml_module import forecast_expenses, recommend_budgets
from insights_service import generate_ai_insights

class TestAnalyticsPlatform(unittest.TestCase):
    
    @classmethod
    def setUpClass(cls):
        # Create a test user
        cls.username = "analyticstestuser"
        cls.password = "testpassword"
        register_user(cls.username, cls.password)
        cls.user_id = login_user(cls.username, cls.password)
        
        # Clear existing test user records
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM transactions WHERE user_id = ?", (cls.user_id,))
        cursor.execute("DELETE FROM budgets WHERE user_id = ?", (cls.user_id,))
        cursor.execute("DELETE FROM goals WHERE user_id = ?", (cls.user_id,))
        cursor.execute("DELETE FROM insights WHERE user_id = ?", (cls.user_id,))
        cursor.execute("DELETE FROM notifications WHERE user_id = ?", (cls.user_id,))
        conn.commit()
        conn.close()
        
        # Log a few dummy transactions for the current month
        add_transaction(cls.user_id, "Income", "Salary", 50000, "Monthly salary")
        add_transaction(cls.user_id, "Expense", "Food", 6000, "Groceries")
        add_transaction(cls.user_id, "Expense", "Travel", 2500, "Bus pass")
        add_transaction(cls.user_id, "Expense", "Utilities", 3000, "Wifi and electric")
        
    def test_pandas_analytics_summary(self):
        summary = get_analytics_summary(self.user_id)
        
        # Verify keys exist
        self.assertIn("total_income", summary)
        self.assertIn("total_expense", summary)
        self.assertIn("savings_rate", summary)
        self.assertIn("financial_health_score", summary)
        self.assertIn("heatmap_data", summary)
        self.assertIn("category_spending", summary)
        
        # Verify specific calculations
        self.assertEqual(summary["total_income"], 50000.0)
        self.assertEqual(summary["total_expense"], 11500.0) # 6000 + 2500 + 3000
        self.assertEqual(summary["savings_rate"], 77.0) # ((50000-11500)/50000)*100 = 77%
        self.assertGreaterEqual(summary["financial_health_score"], 10)
        self.assertLessEqual(summary["financial_health_score"], 100)
        
    def test_ml_forecaster_and_recommender(self):
        forecasts = forecast_expenses(self.user_id, steps=2)
        self.assertEqual(len(forecasts), 2)
        self.assertIn("predicted_amount", forecasts[0])
        
        recommendations = recommend_budgets(self.user_id)
        self.assertGreater(len(recommendations), 0)
        self.assertIn("recommended_budget", recommendations[0])
        
    def test_ai_insights_generation(self):
        insights = generate_ai_insights(self.user_id)
        self.assertGreater(len(insights), 0)
        self.assertIn("content", insights[0])
        self.assertIn("title", insights[0])

if __name__ == "__main__":
    unittest.main()
