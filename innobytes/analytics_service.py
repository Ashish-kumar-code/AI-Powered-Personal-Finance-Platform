import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from database import get_db_connection

def get_analytics_summary(user_id, month=None, year=None):
    """
    Computes financial metrics using Pandas.
    Returns a dictionary of metrics.
    """
    conn = get_db_connection()
    
    # Load transactions
    df_tx = pd.read_sql_query(
        "SELECT id, type, category, amount, date, description FROM transactions WHERE user_id = ?",
        conn,
        params=[user_id]
    )
    
    # Load budgets
    df_budgets = pd.read_sql_query(
        "SELECT id, category, amount, month, year FROM budgets WHERE user_id = ?",
        conn,
        params=[user_id]
    )
    
    conn.close()
    
    # Defaults if no transactions exist
    if df_tx.empty:
        return {
            "total_income": 0.0,
            "total_expense": 0.0,
            "savings_rate": 0.0,
            "avg_monthly_spending": 0.0,
            "highest_spending_category": "N/A",
            "monthly_expense_trend": {},
            "category_spending": {},
            "budget_utilization": [],
            "financial_health_score": 50,  # Neutral default
            "heatmap_data": {}
        }
        
    # Ensure proper data types
    df_tx['amount'] = pd.to_numeric(df_tx['amount'], errors='coerce').fillna(0.0)
    df_tx['date'] = pd.to_datetime(df_tx['date'], errors='coerce')
    df_tx = df_tx.dropna(subset=['date'])
    
    # Filter by month/year if provided, otherwise default to current month/year for current summaries
    now = datetime.now()
    active_month = int(month) if month else now.month
    active_year = int(year) if year else now.year
    
    # Calculate totals
    total_income = df_tx[(df_tx['type'] == 'Income') & (df_tx['date'].dt.year == active_year) & (df_tx['date'].dt.month == active_month)]['amount'].sum()
    total_expense = df_tx[(df_tx['type'] == 'Expense') & (df_tx['date'].dt.year == active_year) & (df_tx['date'].dt.month == active_month)]['amount'].sum()
    
    # Savings Rate: (Income - Expense) / Income * 100
    savings_rate = 0.0
    if total_income > 0:
        savings_rate = ((total_income - total_expense) / total_income) * 100
        
    # Monthly expense trend (group by Year-Month)
    df_expense = df_tx[df_tx['type'] == 'Expense'].copy()
    df_expense['year_month'] = df_expense['date'].dt.to_period('M').astype(str)
    
    if not df_expense.empty:
        monthly_expense_trend = df_expense.groupby('year_month')['amount'].sum().to_dict()
        avg_monthly_spending = float(df_expense.groupby('year_month')['amount'].sum().mean())
    else:
        monthly_expense_trend = {}
        avg_monthly_spending = 0.0
        
    # Category spending analysis for the current month
    df_curr_expense = df_tx[(df_tx['type'] == 'Expense') & (df_tx['date'].dt.year == active_year) & (df_tx['date'].dt.month == active_month)]
    
    if not df_curr_expense.empty:
        category_spending = df_curr_expense.groupby('category')['amount'].sum().to_dict()
        highest_spending_category = str(df_curr_expense.groupby('category')['amount'].sum().idxmax())
    else:
        category_spending = {}
        highest_spending_category = "N/A"
        
    # Budget Utilization
    budget_utilization = []
    # Normalize budgets types
    if not df_budgets.empty:
        df_budgets['amount'] = pd.to_numeric(df_budgets['amount'], errors='coerce').fillna(0.0)
        # Filter for active month/year
        df_curr_budgets = df_budgets[(df_budgets['month'].astype(str) == str(active_month)) & (df_budgets['year'].astype(str) == str(active_year))]
        
        for _, b_row in df_curr_budgets.iterrows():
            cat = b_row['category']
            b_amount = float(b_row['amount'])
            spent = float(category_spending.get(cat, 0.0))
            remaining = b_amount - spent
            util_pct = (spent / b_amount * 100) if b_amount > 0 else 0.0
            budget_utilization.append({
                "category": cat,
                "budget": b_amount,
                "spent": spent,
                "remaining": remaining,
                "utilization_pct": util_pct
            })
            
    # Generate Heatmap data (daily sum of expenses for last 365 days)
    end_date = datetime.now()
    start_date = end_date - timedelta(days=365)
    df_heatmap = df_tx[(df_tx['type'] == 'Expense') & (df_tx['date'] >= start_date) & (df_tx['date'] <= end_date)]
    
    if not df_heatmap.empty:
        heatmap_data = df_heatmap.groupby(df_heatmap['date'].dt.strftime('%Y-%m-%d'))['amount'].sum().to_dict()
    else:
        heatmap_data = {}
        
    # Financial Health Score (0-100)
    # 1. Savings Rate weight (40 points): Full points if savings_rate >= 30%. Linear scale down.
    score_savings = max(0.0, min(40.0, (savings_rate / 30.0) * 40.0)) if savings_rate > 0 else 0.0
    
    # 2. Budget Compliance weight (30 points): Start at 30, deduct 5 points for every category that exceeded budget
    score_budget = 30.0
    exceeded_count = sum(1 for b in budget_utilization if b['remaining'] < 0)
    score_budget = max(0.0, score_budget - (exceeded_count * 7.5))
    
    # 3. Monthly Spend Margin weight (30 points): If monthly expenses < 70% of income.
    # Score = (1 - (expense / income)) * 30. Max 30.
    score_margin = 0.0
    if total_income > 0:
        ratio = total_expense / total_income
        if ratio <= 0.7:
            score_margin = 30.0
        else:
            score_margin = max(0.0, (1.0 - ratio) * 100.0)  # scale down
            score_margin = min(30.0, score_margin)
    else:
        score_margin = 15.0  # default half points if no income
        
    financial_health_score = int(round(score_savings + score_budget + score_margin))
    financial_health_score = max(10, min(100, financial_health_score))
    
    return {
        "total_income": float(total_income),
        "total_expense": float(total_expense),
        "savings_rate": float(round(savings_rate, 2)),
        "avg_monthly_spending": float(round(avg_monthly_spending, 2)),
        "highest_spending_category": highest_spending_category,
        "monthly_expense_trend": monthly_expense_trend,
        "category_spending": category_spending,
        "budget_utilization": budget_utilization,
        "financial_health_score": financial_health_score,
        "heatmap_data": heatmap_data
    }
