import React, { useState, useEffect } from 'react';
import { Target, Sparkles, Plus, RefreshCw, Trophy, Brain } from 'lucide-react';

export default function Goals({ userId, API_BASE }) {
  const [goals, setGoals] = useState([]);
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [category, setCategory] = useState('');

  const [activeGoalId, setActiveGoalId] = useState(null);
  const [goalForecast, setGoalForecast] = useState(null);
  const [forecastLoading, setForecastLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [updateAmt, setUpdateAmt] = useState('');

  const fetchGoals = async () => {
    try {
      const response = await fetch(`${API_BASE}/goals`, {
        headers: { 'X-User-ID': String(userId) }
      });
      const data = await response.json();
      setGoals(data);
      if (data.length > 0 && !activeGoalId) {
        setActiveGoalId(data[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchGoalForecast = async (gId) => {
    if (!gId) return;
    setForecastLoading(true);
    try {
      const response = await fetch(`${API_BASE}/predictions?goal_id=${gId}`, {
        headers: { 'X-User-ID': String(userId) }
      });
      const data = await response.json();
      setGoalForecast(data.goal_achievement_prediction);
    } catch (err) {
      console.error(err);
    } finally {
      setForecastLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, [userId]);

  useEffect(() => {
    if (activeGoalId) {
      fetchGoalForecast(activeGoalId);
    } else {
      setGoalForecast(null);
    }
  }, [activeGoalId, goals]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch(`${API_BASE}/goals`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-User-ID': String(userId)
        },
        body: JSON.stringify({ 
          name, 
          target_amount: parseFloat(targetAmount), 
          current_amount: parseFloat(currentAmount || 0), 
          target_date: targetDate, 
          category 
        })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setMessage('Savings Goal set!');
        setName('');
        setTargetAmount('');
        setCurrentAmount('');
        setTargetDate('');
        setCategory('');
        fetchGoals();
      } else {
        setMessage(data.message || 'Error saving goal.');
      }
    } catch (err) {
      setMessage('Failed to send request.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAmount = async (e) => {
    e.preventDefault();
    if (!activeGoalId || !updateAmt) return;
    
    try {
      const response = await fetch(`${API_BASE}/goals/${activeGoalId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'X-User-ID': String(userId)
        },
        body: JSON.stringify({ current_amount: parseFloat(updateAmt) })
      });

      if (response.ok) {
        setUpdateAmt('');
        fetchGoals();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const categories = ['Vehicle', 'Real Estate', 'Vacation', 'Emergency Fund', 'Retirement', 'Education', 'Gadget', 'Other'];

  return (
    <div className="flex-1 bg-slate-950 p-8 overflow-y-auto text-left">
      <header className="mb-8">
        <h2 className="text-2xl font-bold text-white tracking-tight">Savings Goals Tracking</h2>
        <p className="text-xs text-slate-400 font-medium">Define your financial targets and model achievement timelines</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column: Setup goals */}
        <div className="lg:col-span-1 space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800/80 shadow-md">
            <h3 className="text-sm font-semibold text-slate-300 mb-6 flex items-center gap-2">
              <Target className="w-4 h-4 text-indigo-400" />
              <span>Define Savings Goal</span>
            </h3>

            {message && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold rounded-xl text-center mb-6">
                {message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-2 uppercase tracking-wider">Goal Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. New Electric Car"
                  className="w-full bg-slate-950 border border-slate-800/80 focus:border-indigo-500 rounded-xl py-3 px-4 text-sm text-slate-200 outline-none"
                />
              </div>

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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-2 uppercase tracking-wider">Target (INR)</label>
                  <input
                    type="number"
                    required
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    placeholder="₹0.00"
                    className="w-full bg-slate-950 border border-slate-800/80 focus:border-indigo-500 rounded-xl py-3 px-4 text-sm text-slate-200 outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-2 uppercase tracking-wider">Initial Savings</label>
                  <input
                    type="number"
                    value={currentAmount}
                    onChange={(e) => setCurrentAmount(e.target.value)}
                    placeholder="₹0.00"
                    className="w-full bg-slate-950 border border-slate-800/80 focus:border-indigo-500 rounded-xl py-3 px-4 text-sm text-slate-200 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-2 uppercase tracking-wider">Target Date</label>
                <input
                  type="date"
                  required
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800/80 focus:border-indigo-500 rounded-xl py-3 px-4 text-sm text-slate-200 outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white font-bold rounded-xl py-3 px-4 text-sm flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <Plus className="w-4 h-4" />
                Initialize Goal
              </button>
            </form>
          </div>
        </div>

        {/* Right column: Goals Tracker and Timeline Predictions */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800/80 shadow-md">
            <h3 className="text-sm font-semibold text-slate-300 mb-6">Active Targets</h3>

            <div className="space-y-6">
              {goals.length > 0 ? (
                goals.map((g) => {
                  const isActive = activeGoalId === g.id;
                  return (
                    <div 
                      key={g.id} 
                      onClick={() => setActiveGoalId(g.id)}
                      className={`p-4 rounded-xl border text-xs transition-all duration-200 cursor-pointer ${
                        isActive 
                          ? 'border-indigo-500/50 bg-indigo-600/5 shadow-[0_0_12px_rgba(99,102,241,0.05)]' 
                          : 'border-slate-800/60 bg-slate-950/20 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-bold text-sm text-slate-200">{g.name}</h4>
                          <span className="text-[10px] text-slate-500 font-medium">Category: {g.category} | Target Date: {g.target_date}</span>
                        </div>
                        <span className="font-bold text-slate-200">
                          ₹{g.current_amount.toLocaleString('en-IN')} / <span className="text-slate-500">₹{g.target_amount.toLocaleString('en-IN')}</span>
                        </span>
                      </div>

                      {/* Progress bar */}
                      <div className="h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800/80 mb-2">
                        <div 
                          className="h-full bg-indigo-600 rounded-full transition-all"
                          style={{ width: `${Math.min(100, g.progress_pct)}%` }}
                        ></div>
                      </div>

                      <div className="flex justify-between text-[10px] text-slate-500">
                        <span className="font-semibold">{g.progress_pct}% Completed</span>
                        <span>₹{(g.target_amount - g.current_amount).toLocaleString('en-IN')} remaining</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12 text-slate-500 text-xs">
                  No active goals set. Start by initializing a goal.
                </div>
              )}
            </div>
          </div>

          {/* Predictor Dashboard */}
          {activeGoalId && (
            <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800/80 shadow-md">
              <h3 className="text-sm font-semibold text-slate-300 mb-6 flex items-center gap-2">
                <Brain className="w-4 h-4 text-indigo-400 animate-pulse" />
                <span>AI Goal Completion Timeline Model</span>
              </h3>

              {forecastLoading ? (
                <div className="py-8 flex justify-center text-slate-500 text-xs font-semibold gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-indigo-500" />
                  Calculating forecasting curves...
                </div>
              ) : goalForecast ? (
                <div className="space-y-6 text-left">
                  {/* Warning / Success Block */}
                  <div className={`p-4 rounded-xl border text-xs font-semibold leading-relaxed flex gap-3 ${
                    goalForecast.months_required === -1 
                      ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' 
                      : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-300'
                  }`}>
                    <Trophy className="w-5 h-5 flex-shrink-0" />
                    <div>
                      <p className="font-bold text-white mb-1">
                        {goalForecast.months_required === -1 ? 'Goal Deficit Warning' : 'Timeline Prediction Result'}
                      </p>
                      <p>{goalForecast.message}</p>
                    </div>
                  </div>

                  {/* Increment amount panel */}
                  {goalForecast.months_required !== -1 && (
                    <form onSubmit={handleUpdateAmount} className="flex gap-3 border-t border-slate-800/80 pt-6">
                      <div className="flex-1">
                        <label className="text-[10px] font-bold text-slate-500 block mb-2 uppercase tracking-wider">Update Current Savings Balance</label>
                        <input
                          type="number"
                          required
                          value={updateAmt}
                          onChange={(e) => setUpdateAmt(e.target.value)}
                          placeholder="New total savings balance..."
                          className="w-full bg-slate-950 border border-slate-800/80 focus:border-indigo-500 rounded-xl py-2.5 px-4 text-xs text-slate-200 outline-none"
                        />
                      </div>
                      <button
                        type="submit"
                        className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl px-5 text-xs h-10 mt-6 cursor-pointer"
                      >
                        Update
                      </button>
                    </form>
                  )}
                </div>
              ) : (
                <div className="text-center py-6 text-slate-500 text-xs">
                  No prediction curves compiled.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
