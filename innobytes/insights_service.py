import pandas as pd
from datetime import datetime
from database import get_db_connection
from analytics_service import get_analytics_summary
from ml_module import generate_synthetic_data

def generate_ai_insights(user_id):
    """
    Compares the current month's spending patterns against the previous month.
    Generates structured, human-readable insights.
    Saves generated insights to the SQLite database and returns them.
    """
    now = datetime.now()
    curr_month = now.month
    curr_year = now.year
    
    # Get previous month info
    prev_month = curr_month - 1 if curr_month > 1 else 12
    prev_year = curr_year if curr_month > 1 else curr_year - 1
    
    conn = get_db_connection()
    # Check if there is data
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM transactions WHERE user_id = ?", (user_id,))
    count = cursor.fetchone()[0]
    
    # If no data, generate synthetic data to demonstrate capabilities
    if count < 10:
        df_synthetic = generate_synthetic_data(user_id)
        for _, row in df_synthetic.iterrows():
            cursor.execute(
                "INSERT INTO transactions (user_id, type, category, amount, date, description) VALUES (?, ?, ?, ?, ?, ?)",
                (user_id, row['type'], row['category'], row['amount'], row['date'], row['description'])
            )
        conn.commit()
        
    # Query current month and previous month transactions using Pandas
    df_tx = pd.read_sql_query(
        "SELECT type, category, amount, date FROM transactions WHERE user_id = ?",
        conn,
        params=[user_id]
    )
    conn.close()
    
    df_tx['amount'] = pd.to_numeric(df_tx['amount'], errors='coerce').fillna(0.0)
    df_tx['date'] = pd.to_datetime(df_tx['date'])
    df_tx['month'] = df_tx['date'].dt.month
    df_tx['year'] = df_tx['date'].dt.year
    
    # Filter
    curr_df = df_tx[(df_tx['year'] == curr_year) & (df_tx['month'] == curr_month)]
    prev_df = df_tx[(df_tx['year'] == prev_year) & (df_tx['month'] == prev_month)]
    
    insights = []
    
    # Overall savings change
    curr_inc = curr_df[curr_df['type'] == 'Income']['amount'].sum()
    curr_exp = curr_df[curr_df['type'] == 'Expense']['amount'].sum()
    curr_sav = curr_inc - curr_exp
    
    prev_inc = prev_df[prev_df['type'] == 'Income']['amount'].sum()
    prev_exp = prev_df[prev_df['type'] == 'Expense']['amount'].sum()
    prev_sav = prev_inc - prev_exp
    
    # Savings Improvement Insight
    if prev_sav > 0 and curr_sav > 0:
        sav_diff_pct = ((curr_sav - prev_sav) / prev_sav) * 100
        if sav_diff_pct > 2:
            insights.append({
                "category": "Savings",
                "title": "Savings Rate Improved!",
                "content": f"🚀 Great job! Your monthly savings improved by {round(sav_diff_pct, 1)}% compared to last month (₹{round(curr_sav, 2)} vs ₹{round(prev_sav, 2)})."
            })
        elif sav_diff_pct < -2:
            insights.append({
                "category": "Savings",
                "title": "Savings Rate Dropped",
                "content": f"⚠️ Caution: Your monthly savings decreased by {round(abs(sav_diff_pct), 1)}% compared to last month. Review your variable expenditures."
            })
    elif curr_sav > 0 and prev_sav <= 0:
        insights.append({
            "category": "Savings",
            "title": "Out of the Red!",
            "content": f"🎉 Excellent! You have achieved positive savings of ₹{round(curr_sav, 2)} this month, recovering from deficit spending last month."
        })
        
    # Category Spending Changes
    curr_cat = curr_df[curr_df['type'] == 'Expense'].groupby('category')['amount'].sum()
    prev_cat = prev_df[prev_df['type'] == 'Expense'].groupby('category')['amount'].sum()
    
    for cat in curr_cat.index:
        if cat in prev_cat.index:
            c_val = curr_cat[cat]
            p_val = prev_cat[cat]
            if p_val > 0:
                diff_pct = ((c_val - p_val) / p_val) * 100
                if diff_pct > 5:
                    insights.append({
                        "category": cat,
                        "title": f"Spike in {cat} Spending",
                        "content": f"📈 Your {cat} spending increased by {round(diff_pct, 1)}% compared to last month. You spent ₹{round(c_val, 2)} this month vs ₹{round(p_val, 2)} last month."
                    })
                elif diff_pct < -5:
                    insights.append({
                        "category": cat,
                        "title": f"Savings on {cat}",
                        "content": f"📉 Good work! Your {cat} spending decreased by {round(abs(diff_pct), 1)}%. You saved ₹{round(p_val - c_val, 2)} on this category compared to last month."
                    })
                    
    # Fetch budget summaries for warning insights
    summary = get_analytics_summary(user_id, curr_month, curr_year)
    for b in summary["budget_utilization"]:
        util = b["utilization_pct"]
        if util > 100:
            insights.append({
                "category": b["category"],
                "title": f"Exceeded {b['category']} Budget",
                "content": f"❌ Budget alert! You have exceeded your {b['category']} budget limit by ₹{round(abs(b['remaining']), 2)} ({round(util, 1)}% utilization)."
            })
        elif util >= 85:
            insights.append({
                "category": b["category"],
                "title": f"Approaching {b['category']} Budget Limit",
                "content": f"🔔 Watch out! You have utilized {round(util, 1)}% of your budget for {b['category']}. Only ₹{round(b['remaining'], 2)} remains for the month."
            })
            
    # Default insights if lists are empty
    if not insights:
        insights.append({
            "category": "General",
            "title": "Welcome to AI Insights!",
            "content": "💡 Welcome to your financial command center. Once you start logging transactions across consecutive months, we will display trends and anomalies here."
        })
        
    # Write to database (insights table)
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Keep database clean, delete old insights for the current month run
    cursor.execute("DELETE FROM insights WHERE user_id = ?", (user_id,))
    
    created_at = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    for ins in insights:
        cursor.execute(
            "INSERT INTO insights (user_id, category, title, content, created_at) VALUES (?, ?, ?, ?, ?)",
            (user_id, ins["category"], ins["title"], ins["content"], created_at)
        )
    conn.commit()
    conn.close()
    
    return insights
