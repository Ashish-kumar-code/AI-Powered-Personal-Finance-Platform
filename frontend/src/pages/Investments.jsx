import React, { useState } from 'react';
import { Briefcase, Plus, TrendingUp, AlertCircle, PieChart as ChartIcon } from 'lucide-react';

export default function Investments() {
  const [investments, setInvestments] = useState([
    { id: 1, name: 'Index Funds (Nifty 50)', category: 'Stocks', amount: 120000, returns: 12.4 },
    { id: 2, name: 'Bitcoin (BTC)', category: 'Crypto', amount: 45000, returns: 28.5 },
    { id: 3, name: 'Sovereign Gold Bonds', category: 'Gold', amount: 30000, returns: 8.2 },
    { id: 4, name: 'Fixed Deposit (HDFC)', category: 'Cash/Bonds', amount: 150000, returns: 7.1 },
  ]);

  const [name, setName] = useState('');
  const [category, setCategory] = useState('Stocks');
  const [amount, setAmount] = useState('');
  const [returns, setReturns] = useState('');

  const handleAdd = (e) => {
    e.preventDefault();
    if (!name || !amount) return;

    setInvestments(prev => [
      ...prev,
      {
        id: Date.now(),
        name,
        category,
        amount: parseFloat(amount),
        returns: parseFloat(returns || 0)
      }
    ]);

    setName('');
    setAmount('');
    setReturns('');
  };

  const totalPortfolio = investments.reduce((acc, curr) => acc + curr.amount, 0);
  
  // Calculate category aggregates
  const categoriesMap = {};
  investments.forEach(inv => {
    categoriesMap[inv.category] = (categoriesMap[inv.category] || 0) + inv.amount;
  });

  return (
    <div className="flex-1 bg-slate-950 p-8 overflow-y-auto text-left">
      <header className="mb-8">
        <h2 className="text-2xl font-bold text-white tracking-tight">Investment Tracking</h2>
        <p className="text-xs text-slate-400 font-medium">Log portfolios, track yields, and audit allocations</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Form */}
        <div className="lg:col-span-1 space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800/80 shadow-md">
            <h3 className="text-sm font-semibold text-slate-300 mb-6 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-indigo-400" />
              <span>Log Asset</span>
            </h3>

            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-2 uppercase tracking-wider">Asset Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. NASDAQ ETF"
                  className="w-full bg-slate-950 border border-slate-800/80 focus:border-indigo-500 rounded-xl py-3 px-4 text-sm text-slate-200 outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-2 uppercase tracking-wider">Asset Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800/80 focus:border-indigo-500 rounded-xl py-3 px-4 text-sm text-slate-400 outline-none appearance-none cursor-pointer"
                >
                  <option value="Stocks">Stocks / Mutual Funds</option>
                  <option value="Bonds">Bonds</option>
                  <option value="Crypto">Crypto</option>
                  <option value="Gold">Gold</option>
                  <option value="Real Estate">Real Estate</option>
                  <option value="Cash/Bonds">Cash / Fixed Deposit</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-2 uppercase tracking-wider">Invested Value</label>
                  <input
                    type="number"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="₹0.00"
                    className="w-full bg-slate-950 border border-slate-800/80 focus:border-indigo-500 rounded-xl py-3 px-4 text-sm text-slate-200 outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-2 uppercase tracking-wider">Yield / Returns %</label>
                  <input
                    type="number"
                    step="0.1"
                    value={returns}
                    onChange={(e) => setReturns(e.target.value)}
                    placeholder="e.g. 12%"
                    className="w-full bg-slate-950 border border-slate-800/80 focus:border-indigo-500 rounded-xl py-3 px-4 text-sm text-slate-200 outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl py-3 px-4 text-sm flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <Plus className="w-4 h-4" />
                Add Asset
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Portfolio aggregates */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            {/* Total Portfolio Value */}
            <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800/80 shadow-md flex flex-col justify-center">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Portfolio Net Worth</span>
              <h3 className="text-3xl font-extrabold text-white">₹{totalPortfolio.toLocaleString('en-IN')}</h3>
              <span className="text-xs text-emerald-400 font-bold flex items-center gap-1 mt-2">
                <TrendingUp className="w-3.5 h-3.5" /> +10.2% Total Weighted Yield
              </span>
            </div>

            {/* Asset Allocation Metrics */}
            <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800/80 shadow-md text-xs">
              <h4 className="font-bold text-slate-300 mb-4 flex items-center gap-2">
                <ChartIcon className="w-4 h-4 text-indigo-400" />
                <span>Asset Allocations</span>
              </h4>
              <div className="space-y-3">
                {Object.keys(categoriesMap).map((cat, idx) => {
                  const amt = categoriesMap[cat];
                  const pct = totalPortfolio > 0 ? (amt / totalPortfolio) * 100 : 0;
                  return (
                    <div key={idx} className="flex justify-between items-center text-slate-300">
                      <span className="font-semibold">{cat}</span>
                      <span className="font-bold text-slate-200">
                        ₹{amt.toLocaleString('en-IN')} ({pct.toFixed(0)}%)
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Holdings Register */}
          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800/80 shadow-md">
            <h3 className="text-sm font-semibold text-slate-300 mb-6">Holdings Register</h3>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-slate-500 border-b border-slate-800/80 text-[11px] font-bold uppercase tracking-wider">
                    <th className="pb-3 text-left">Asset</th>
                    <th className="pb-3 text-left">Category</th>
                    <th className="pb-3 text-right">Invested Value</th>
                    <th className="pb-3 text-right">Yield</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50 text-slate-300">
                  {investments.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-800/20 transition-all">
                      <td className="py-3 font-semibold text-slate-200">{inv.name}</td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 rounded bg-slate-850 border border-slate-800 text-[10px] font-bold text-slate-400">
                          {inv.category}
                        </span>
                      </td>
                      <td className="py-3 text-right font-bold">₹{inv.amount.toLocaleString('en-IN')}</td>
                      <td className="py-3 text-right font-bold text-emerald-400">+{inv.returns}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
