import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  CreditCard, 
  PiggyBank, 
  Heart, 
  Bell, 
  RefreshCw, 
  AlertTriangle 
} from 'lucide-react';

import KPICard from '../components/KPICard';
import { MonthlyTrendChart, CategoryAllocationChart } from '../components/Charts';
import ExpenseHeatmap from '../components/ExpenseHeatmap';
import AIInsightsPanel from '../components/AIInsightsPanel';

export default function Dashboard({ userId, API_BASE }) {
  const [data, setData] = useState(null);
  const [insights, setInsights] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch analytics
      const analyticRes = await fetch(`${API_BASE}/analytics`, {
        headers: { 'X-User-ID': String(userId) }
      });
      const analyticData = await analyticRes.json();
      setData(analyticData);

      // Fetch AI insights
      const insightRes = await fetch(`${API_BASE}/insights`, {
        headers: { 'X-User-ID': String(userId) }
      });
      const insightData = await insightRes.json();
      setInsights(insightData);

      // Fetch notifications
      const notifRes = await fetch(`${API_BASE}/notifications`, {
        headers: { 'X-User-ID': String(userId) }
      });
      const notifData = await notifRes.json();
      setNotifications(notifData);
    } catch (err) {
      console.error('Error fetching dashboard summary:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [userId]);

  const markNotifRead = async (notifId) => {
    try {
      await fetch(`${API_BASE}/notifications/${notifId}`, {
        method: 'PUT',
        headers: { 'X-User-ID': String(userId) }
      });
      setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, is_read: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const unreadNotifications = notifications.filter(n => !n.is_read);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-950 text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 animate-spin text-indigo-500" />
          <p className="text-sm font-medium">Loading predictive dashboard...</p>
        </div>
      </div>
    );
  }

  const kpis = [
    {
      title: 'Monthly Income',
      value: `₹${data?.total_income?.toLocaleString('en-IN') || '0.00'}`,
      delta: 12,
      isPositiveTrend: true,
      subtext: 'vs. last month average',
      icon: TrendingUp,
      glowColor: 'emerald'
    },
    {
      title: 'Monthly Expenses',
      value: `₹${data?.total_expense?.toLocaleString('en-IN') || '0.00'}`,
      delta: 5,
      isPositiveTrend: false,
      subtext: 'vs. last month average',
      icon: CreditCard,
      glowColor: 'rose'
    },
    {
      title: 'Net Savings',
      value: `₹${(data?.total_income - data?.total_expense)?.toLocaleString('en-IN') || '0.00'}`,
      subtext: `Savings Rate: ${data?.savings_rate || 0}%`,
      icon: PiggyBank,
      glowColor: 'indigo'
    },
    {
      title: 'Financial Health Score',
      value: `${data?.financial_health_score || 50} / 100`,
      subtext: data?.financial_health_score >= 80 ? 'Excellent' : data?.financial_health_score >= 60 ? 'Healthy' : 'Needs Optimization',
      icon: Heart,
      glowColor: 'amber'
    }
  ];

  return (
    <div className="flex-1 bg-slate-950 p-8 overflow-y-auto text-left">
      {/* Header bar */}
      <header className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Financial Command Center</h2>
          <p className="text-xs text-slate-400 font-medium">Predictive budgets and data aggregates at a glance</p>
        </div>
        
        <div className="flex items-center gap-4 relative">
          <button 
            onClick={() => fetchDashboardData()}
            className="p-2.5 rounded-xl border border-slate-800 bg-slate-900/40 text-slate-400 hover:text-white transition-colors"
            title="Refresh Ledger"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          
          {/* Notification Icon */}
          <div className="relative">
            <button 
              onClick={() => setShowNotifDropdown(!showNotifDropdown)}
              className="p-2.5 rounded-xl border border-slate-800 bg-slate-900/40 text-slate-400 hover:text-white transition-colors relative"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifications.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-rose-500 text-white font-extrabold text-[9px] flex items-center justify-center animate-bounce">
                  {unreadNotifications.length}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifDropdown && (
              <div className="absolute right-0 mt-3 w-80 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-4 z-50">
                <h4 className="text-xs font-bold text-slate-300 border-b border-slate-800 pb-2 mb-3">System Warnings</h4>
                <div className="space-y-3 max-h-[200px] overflow-y-auto pr-1">
                  {unreadNotifications.length > 0 ? (
                    unreadNotifications.map((n) => (
                      <div key={n.id} className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-start gap-2 text-left">
                        <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-[10px] font-bold text-white">{n.title}</p>
                          <p className="text-[9px] text-slate-400 mt-0.5 leading-relaxed">{n.message}</p>
                          <button 
                            onClick={() => markNotifRead(n.id)}
                            className="text-[8px] text-indigo-400 font-bold mt-1.5 hover:text-indigo-300 block"
                          >
                            Dismiss alert
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-[10px] text-slate-500 text-center py-4">No active system warnings.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* KPI Cards Row */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {kpis.map((kpi, idx) => (
          <KPICard key={idx} {...kpi} />
        ))}
      </section>

      {/* Charts Section */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900/50 border border-slate-800/80 shadow-md">
          <h3 className="text-sm font-semibold text-slate-400 mb-6">Historical Expense Trend</h3>
          <MonthlyTrendChart data={data?.monthly_expense_trend} />
        </div>
        
        <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800/80 shadow-md">
          <h3 className="text-sm font-semibold text-slate-400 mb-6">Monthly Category Allocation</h3>
          <CategoryAllocationChart data={data?.category_spending} />
        </div>
      </section>

      {/* Lower Section (Heatmap & AI Insights) */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ExpenseHeatmap data={data?.heatmap_data} />
        </div>
        
        <div>
          <AIInsightsPanel insights={insights} />
        </div>
      </section>
    </div>
  );
}
