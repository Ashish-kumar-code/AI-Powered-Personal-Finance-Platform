import os
import pandas as pd
import numpy as np
from datetime import datetime
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
import joblib
from database import get_db_connection

MODELS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "models")
os.makedirs(MODELS_DIR, exist_ok=True)

def generate_synthetic_data(user_id):
    """
    Generates realistic synthetic historical transactions for cold-start training.
    """
    import random
    categories = ["Food", "Rent", "Travel", "Entertainment", "Utilities"]
    data = []
    
    # Generate 12 months of historical data
    now = datetime.now()
    for i in range(12, 0, -1):
        month_date = now - pd.DateOffset(months=i)
        
        # Monthly Income
        income_amt = 60000 + random.randint(-2000, 2000)
        data.append({
            "user_id": user_id,
            "type": "Income",
            "category": "Salary",
            "amount": income_amt,
            "date": month_date.strftime("%Y-%m-05"),
            "description": "Monthly Salary"
        })
        
        # Monthly Expenses
        # Rent (Fixed)
        data.append({
            "user_id": user_id,
            "type": "Expense",
            "category": "Rent",
            "amount": 18000,
            "date": month_date.strftime("%Y-%m-01"),
            "description": "Rent Payment"
        })
        
        # Food (Variable with slight upward trend)
        food_amt = 8000 + (12 - i) * 150 + random.randint(-500, 500)
        data.append({
            "user_id": user_id,
            "type": "Expense",
            "category": "Food",
            "amount": food_amt,
            "date": month_date.strftime("%Y-%m-10"),
            "description": "Groceries & Dining"
        })
        
        # Travel
        travel_amt = 4000 + random.randint(-1000, 1500)
        data.append({
            "user_id": user_id,
            "type": "Expense",
            "category": "Travel",
            "amount": travel_amt,
            "date": month_date.strftime("%Y-%m-15"),
            "description": "Commute"
        })
        
        # Entertainment
        ent_amt = 5000 + random.randint(-2000, 2000)
        data.append({
            "user_id": user_id,
            "type": "Expense",
            "category": "Entertainment",
            "amount": ent_amt,
            "date": month_date.strftime("%Y-%m-20"),
            "description": "Movies & Outings"
        })
        
        # Utilities
        util_amt = 3000 + random.randint(-300, 300)
        data.append({
            "user_id": user_id,
            "type": "Expense",
            "category": "Utilities",
            "amount": util_amt,
            "date": month_date.strftime("%Y-%m-25"),
            "description": "Electricity & WiFi"
        })
        
    return pd.DataFrame(data)

def train_and_save_forecast_model(user_id):
    """
    Trains a LinearRegression model to forecast monthly expenses.
    Saves the model to disk and returns evaluation metrics.
    """
    conn = get_db_connection()
    df_tx = pd.read_sql_query(
        "SELECT type, amount, date FROM transactions WHERE user_id = ?",
        conn,
        params=[user_id]
    )
    conn.close()
    
    # If insufficient data (< 6 transaction rows), seed with synthetic data
    if len(df_tx[df_tx['type'] == 'Expense']) < 10:
        df_tx = generate_synthetic_data(user_id)
        
    df_tx['amount'] = pd.to_numeric(df_tx['amount'], errors='coerce').fillna(0.0)
    df_tx['date'] = pd.to_datetime(df_tx['date'])
    
    # Aggregate by Year-Month
    df_expense = df_tx[df_tx['type'] == 'Expense'].copy()
    df_expense['year_month'] = df_expense['date'].dt.to_period('M')
    
    monthly_data = df_expense.groupby('year_month')['amount'].sum().reset_index()
    monthly_data['timestamp'] = monthly_data['year_month'].dt.to_timestamp()
    
    # Feature Engineering: Year, Month, Sequential Month Index
    monthly_data['year'] = monthly_data['timestamp'].dt.year
    monthly_data['month'] = monthly_data['timestamp'].dt.month
    monthly_data['month_index'] = np.arange(len(monthly_data))
    
    X = monthly_data[['year', 'month', 'month_index']].values
    y = monthly_data['amount'].values
    
    # Train Model
    model = LinearRegression()
    model.fit(X, y)
    
    # Save Model
    model_path = os.path.join(MODELS_DIR, f"forecast_model_{user_id}.joblib")
    joblib.dump(model, model_path)
    
    # Save training data configuration for prediction reference
    config_path = os.path.join(MODELS_DIR, f"forecast_config_{user_id}.joblib")
    joblib.dump({"last_month_index": int(monthly_data['month_index'].max())}, config_path)
    
    # Calculate evaluation metrics
    y_pred = model.predict(X)
    mse = float(mean_squared_error(y, y_pred))
    rmse = float(np.sqrt(mse))
    mae = float(mean_absolute_error(y, y_pred))
    
    # R2 Score (handling small data edge cases)
    if len(y) > 1:
        r2 = float(r2_score(y, y_pred))
    else:
        r2 = 1.0
        
    return {
        "mse": mse,
        "rmse": rmse,
        "mae": mae,
        "r2_score": r2
    }

def forecast_expenses(user_id, steps=3):
    """
    Loads model and forecasts expenses for the next 'steps' months.
    """
    model_path = os.path.join(MODELS_DIR, f"forecast_model_{user_id}.joblib")
    config_path = os.path.join(MODELS_DIR, f"forecast_config_{user_id}.joblib")
    
    # Train if models don't exist
    if not os.path.exists(model_path) or not os.path.exists(config_path):
        train_and_save_forecast_model(user_id)
        
    model = joblib.load(model_path)
    config = joblib.load(config_path)
    
    last_idx = config["last_month_index"]
    now = datetime.now()
    
    forecasts = []
    for i in range(1, steps + 1):
        future_date = now + pd.DateOffset(months=i)
        year = future_date.year
        month = future_date.month
        idx = last_idx + i
        
        pred_amount = float(model.predict([[year, month, idx]])[0])
        pred_amount = max(0.0, pred_amount)  # Expense cannot be negative
        
        forecasts.append({
            "year": year,
            "month": month,
            "predicted_amount": round(pred_amount, 2)
        })
        
    return forecasts

def predict_savings_goal_achievement(user_id, goal_id):
    """
    Predicts the number of months required to reach a specific savings goal.
    """
    conn = get_db_connection()
    # Fetch Goal
    cursor = conn.cursor()
    cursor.execute(
        "SELECT name, target_amount, current_amount FROM goals WHERE id = ? AND user_id = ?",
        (goal_id, user_id)
    )
    goal = cursor.fetchone()
    
    if not goal:
        conn.close()
        return {"error": "Goal not found"}
        
    g_name, target, current = goal[0], float(goal[1]), float(goal[2])
    remaining_amount = target - current
    
    # Calculate average net savings from transactions
    df_tx = pd.read_sql_query(
        "SELECT type, amount, date FROM transactions WHERE user_id = ?",
        conn,
        params=[user_id]
    )
    conn.close()
    
    if len(df_tx) < 10:
        df_tx = generate_synthetic_data(user_id)
        
    df_tx['amount'] = pd.to_numeric(df_tx['amount'], errors='coerce').fillna(0.0)
    df_tx['date'] = pd.to_datetime(df_tx['date'])
    df_tx['year_month'] = df_tx['date'].dt.to_period('M')
    
    monthly_inc = df_tx[df_tx['type'] == 'Income'].groupby('year_month')['amount'].sum()
    monthly_exp = df_tx[df_tx['type'] == 'Expense'].groupby('year_month')['amount'].sum()
    
    monthly_savings = monthly_inc.add(-monthly_exp, fill_value=0.0)
    avg_monthly_savings = float(monthly_savings.mean()) if not monthly_savings.empty else 5000.0
    
    # Ensure savings rate is positive to reach goal
    if avg_monthly_savings <= 0:
        return {
            "goal_name": g_name,
            "months_required": -1,
            "message": "Warning: Your average net savings are currently negative. You cannot reach this goal with current habits."
        }
        
    months_req = remaining_amount / avg_monthly_savings
    target_completion_date = (datetime.now() + pd.DateOffset(months=int(np.ceil(months_req)))).strftime("%B %Y")
    
    return {
        "goal_name": g_name,
        "months_required": round(months_req, 1),
        "target_completion_date": target_completion_date,
        "avg_monthly_savings": round(avg_monthly_savings, 2),
        "message": f"Estimated achievement in {round(months_req, 1)} months ({target_completion_date}) saving ₹{round(avg_monthly_savings, 2)}/mo."
    }

def recommend_budgets(user_id):
    """
    Scans recent transaction history and recommends optimal category budgets.
    """
    conn = get_db_connection()
    df_tx = pd.read_sql_query(
        "SELECT type, category, amount, date FROM transactions WHERE user_id = ?",
        conn,
        params=[user_id]
    )
    conn.close()
    
    if len(df_tx) < 10:
        df_tx = generate_synthetic_data(user_id)
        
    df_tx['amount'] = pd.to_numeric(df_tx['amount'], errors='coerce').fillna(0.0)
    df_tx['date'] = pd.to_datetime(df_tx['date'])
    
    df_expense = df_tx[df_tx['type'] == 'Expense'].copy()
    if df_expense.empty:
        return []
        
    # Group by category and month to get monthly spending
    df_expense['month_year'] = df_expense['date'].dt.to_period('M')
    cat_monthly = df_expense.groupby(['category', 'month_year'])['amount'].sum().reset_index()
    
    # Calculate average spending per category
    cat_avg = cat_monthly.groupby('category')['amount'].mean().reset_index()
    
    recommendations = []
    for _, row in cat_avg.iterrows():
        cat = row['category']
        avg_spend = float(row['amount'])
        
        # Apply smart adjustments:
        # Round up budget to nearest 500 and add a slight 5% constraint reduction or cushion
        suggested = int(np.ceil((avg_spend * 1.05) / 500.0) * 500.0)
        
        recommendations.append({
            "category": cat,
            "average_spending": round(avg_spend, 2),
            "recommended_budget": suggested,
            "reason": f"Based on your monthly average spend of ₹{round(avg_spend, 2)} with a 5% cushion."
        })
        
    return recommendations
