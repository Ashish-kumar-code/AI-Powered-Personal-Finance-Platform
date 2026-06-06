import React, { useState, useEffect } from 'react';
import { Plus, Check, Brain, Sliders, ChevronRight } from 'lucide-react';

export default function Budgets({ userId, API_BASE }) {
  const [budgets, setBudgets] = useState([]);
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [month, setMonth] = useState(String(new Date().getMonth() + 1));
  const [year, setYear] = useState(String(new Date().getFullYear()));
  
  const [mlRecs, setMlRecs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const fetchBudgetSummary = async () => {
    try {
      // Get budget summaries for active month/year
      const response = await fetch(`${API_BASE}/analytics?month=${month}&year=${year}`, {
        headers: { 'X-User-ID': String(userId) }
      });
      const data = await response.json();
      setBudgets(data.budget_utilization || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMLRecommendations = async () => {
    try {
      const response = await fetch(`${API_BASE}/predictions`, {
        headers: { 'X-User-ID': String(userId) }
      });
      const data = await response.json();
      setMlRecs(data.budget_recommendations || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchBudgetSummary();
  }, [userId, month, year]);

  useEffect(() => {
    fetchMLRecommendations();
  }, [userId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch(`${API_BASE}/budgets`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-User-ID': String(userId)
        },
        body: JSON.stringify({ category, amount: parseFloat(amount), month, year })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setMessage('Budget limit set!');
        setAmount('');
        setCategory('');
        fetchBudgetSummary();
      } else {
        setMessage(data.message || 'Error setting budget.');
      }
    } catch (err) {
      setMessage('Failed to send request.');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyRecommendation = (rec) => {
    setCategory(rec.category);
    setAmount(rec.recommended_budget);
  };

  const categories = ['Food', 'Rent', 'Travel', 'Entertainment', 'Utilities', 'Shopping', 'Insurance', 'Other'];
  const months = [
    { value: '1', label: 'January' }, { value: '2', label: 'February' }, { value: '3', label: 'March' },
    { value: '4', label: 'April' }, { value: '5', label: 'May' }, { value: '6', label: 'June' },
    { value: '7', label: 'July' }, { value: '8', label: 'August' }, { value: '9', label: 'September' },
    { value: '10', label: 'October' }, { value: '11', label: 'November' }, { value: '12', label: 'December' }
  ];

  return (
    <div className="flex-1 bg-slate-950 p-8 overflow-y-auto text-left">
      <header className="mb-8 flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Category Budget Planner</h2>
          <p className="text-xs text-slate-400 font-medium">Establish and monitor monthly expenditure bounds</p>
        </div>

        {/* Date Selector */}
        <div className="flex gap-2 bg-slate-900 border border-slate-800 p-1.5 rounded-xl">
          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="bg-transparent text-xs font-bold text-slate-200 outline-none cursor-pointer"
          >
            {months.map(m => <option key={m.value} className="bg-slate-950" value={m.value}>{m.label}</option>)}
          </select>
          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="bg-transparent text-xs font-bold text-slate-200 outline-none cursor-pointer"
          >
            <option className="bg-slate-950" value="2025">2025</option>
            <option className="bg-slate-950" value="2026">2026</option>
            <option className="bg-slate-950" value="2027">2027</option>
          </select>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Columns: Form & ML Recs */}
        <div className="lg:col-span-1 space-y-6">
          {/* Form */}
          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800/80 shadow-md">
            <h3 className="text-sm font-semibold text-slate-300 mb-6 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-400" />
              <span>Configure Threshold</span>
            </h3>

            {message && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold rounded-xl text-center mb-6">
                {message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-2 uppercase tracking-wider">Category</label>
                <select
                  required
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800/80 focus:border-indigo-500 rounded-xl py-3 px-4 text-sm text-slate-400 outline-none appearance-none cursor-pointer"
                >
                  <option value="">Select Category</option>
                  {categories.map((cat, idx) => <option key={idx} value={cat}>{cat}</option>)}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-2 uppercase tracking-wider">Limit Amount (INR)</label>
                <input
                  type="number"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="₹0.00"
                  className="w-full bg-slate-950 border border-slate-800/80 focus:border-indigo-500 rounded-xl py-3 px-4 text-sm text-slate-200 outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white font-bold rounded-xl py-3 px-4 text-sm flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <Plus className="w-4 h-4" />
                Set Budget
              </button>
            </form>
          </div>

          {/* ML Recommendations */}
          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800/80 shadow-md">
            <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
              <Brain className="w-4 h-4 text-indigo-400" />
              <span>Smart Allocator Recommendations</span>
            </h3>
            <p className="text-[10px] text-slate-500 mb-6 leading-relaxed">
              AI recommendations dynamically calculated from past spending trends.
            </p>

            <div className="space-y-3">
              {mlRecs.length > 0 ? (
                mlRecs.map((rec, idx) => (
                  <div key={idx} className="p-3 bg-slate-950/40 border border-slate-800 rounded-xl flex items-center justify-between gap-3 text-xs">
                    <div>
                      <p className="font-bold text-slate-200">{rec.category}</p>
                      <p className="text-[10px] text-indigo-400 font-semibold mt-0.5">Rec: ₹{rec.recommended_budget}</p>
                    </div>
                    <button
                      onClick={() => handleApplyRecommendation(rec)}
                      className="p-1.5 rounded-lg bg-indigo-600/15 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-600 hover:text-white transition-all"
                      title="Apply recommended value"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-slate-600 text-xs font-semibold">
                  Insufficient spending history to forecast recommendations.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Budgets Utilizations */}
        <div className="lg:col-span-2">
          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800/80 shadow-md h-full">
            <h3 className="text-sm font-semibold text-slate-300 mb-6">Actual Spending vs. Budget Limits</h3>

            <div className="space-y-6">
              {budgets.length > 0 ? (
                budgets.map((b, idx) => {
                  const util = Math.min(100, b.utilization_pct);
                  const isOver = b.spent > b.budget;
                  
                  return (
                    <div key={idx} className="space-y-2.5">
                      <div className="flex justify-between items-baseline text-xs">
                        <div>
                          <span className="font-bold text-slate-200">{b.category}</span>
                          <span className="text-slate-500 text-[10px] ml-2">
                            ({b.utilization_pct.toFixed(0)}% utilized)
                          </span>
                        </div>
                        <span className="font-semibold text-slate-300">
                          ₹{b.spent.toLocaleString('en-IN')} / <span className="text-slate-500">₹{b.budget.toLocaleString('en-IN')}</span>
                        </span>
                      </div>
                      
                      {/* Bar tracker */}
                      <div className="h-3.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800/80 p-[2px]">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${isOver ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.3)]' : 'bg-emerald-500'}`}
                          style={{ width: `${util}%` }}
                        ></div>
                      </div>

                      {/* Sub-note */}
                      <div className="flex justify-between text-[10px] font-medium">
                        <span className={isOver ? 'text-rose-400 font-bold' : 'text-slate-500'}>
                          {isOver ? `Exceeded limit by ₹${Math.abs(b.remaining).toLocaleString('en-IN')}` : 'Within budget limits'}
                        </span>
                        <span className="text-slate-500">
                          {isOver ? 'Over budget' : `₹${b.remaining.toLocaleString('en-IN')} remaining`}
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-16 text-slate-500 text-xs">
                  No budgets configured for {months.find(m => m.value === month)?.label} {year}.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
