import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Calendar, DollarSign, Tag, FileText } from 'lucide-react';

export default function Transactions({ userId, API_BASE }) {
  const [transactions, setTransactions] = useState([]);
  const [type, setType] = useState('Expense');
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const fetchTransactions = async () => {
    try {
      const response = await fetch(`${API_BASE}/transactions`, {
        headers: { 'X-User-ID': String(userId) }
      });
      const data = await response.json();
      setTransactions(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [userId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch(`${API_BASE}/transactions`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-User-ID': String(userId)
        },
        body: JSON.stringify({ type, category, amount: parseFloat(amount), date, description })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setMessage('Transaction added successfully!');
        setAmount('');
        setDescription('');
        setCategory('');
        fetchTransactions();
      } else {
        setMessage(data.message || 'Error logging transaction.');
      }
    } catch (err) {
      setMessage('Failed to send request.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (txId) => {
    if (!window.confirm('Delete this transaction?')) return;
    try {
      const response = await fetch(`${API_BASE}/transactions/${txId}`, {
        method: 'DELETE',
        headers: { 'X-User-ID': String(userId) }
      });
      if (response.ok) {
        fetchTransactions();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const categories = type === 'Income' 
    ? ['Salary', 'Freelance', 'Investments', 'Gifts', 'Other']
    : ['Food', 'Rent', 'Travel', 'Entertainment', 'Utilities', 'Shopping', 'Insurance', 'Other'];

  return (
    <div className="flex-1 bg-slate-950 p-8 overflow-y-auto text-left">
      <header className="mb-8">
        <h2 className="text-2xl font-bold text-white tracking-tight">Transactions Ledger</h2>
        <p className="text-xs text-slate-400 font-medium">Log and audit your financial cashflow history</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Form */}
        <div className="lg:col-span-1">
          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800/80 shadow-md sticky top-8">
            <h3 className="text-sm font-semibold text-slate-300 mb-6">Log New Entry</h3>

            {message && (
              <div className={`p-3.5 rounded-xl text-xs font-semibold mb-6 border text-center ${
                message.includes('success') 
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                  : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
              }`}>
                {message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Type selector */}
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-2 uppercase tracking-wider">Type</label>
                <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800/80">
                  <button
                    type="button"
                    onClick={() => { setType('Expense'); setCategory(''); }}
                    className={`py-2 px-4 rounded-lg text-xs font-bold transition-all ${type === 'Expense' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                  >
                    Expense
                  </button>
                  <button
                    type="button"
                    onClick={() => { setType('Income'); setCategory(''); }}
                    className={`py-2 px-4 rounded-lg text-xs font-bold transition-all ${type === 'Income' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                  >
                    Income
                  </button>
                </div>
              </div>

              {/* Amount */}
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-2 uppercase tracking-wider">Amount (INR)</label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-slate-950/50 border border-slate-800/80 focus:border-indigo-500 rounded-xl py-3.5 pl-12 pr-4 text-sm text-slate-200 outline-none"
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-2 uppercase tracking-wider">Category</label>
                <div className="relative">
                  <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <select
                    required
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-950/50 border border-slate-800/80 focus:border-indigo-500 rounded-xl py-3.5 pl-12 pr-4 text-sm text-slate-400 outline-none appearance-none cursor-pointer"
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat, idx) => (
                      <option key={idx} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Date */}
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-2 uppercase tracking-wider">Date</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-slate-950/50 border border-slate-800/80 focus:border-indigo-500 rounded-xl py-3.5 pl-12 pr-4 text-sm text-slate-200 outline-none"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-2 uppercase tracking-wider">Description (Optional)</label>
                <div className="relative">
                  <FileText className="absolute left-4 top-12 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <textarea
                    rows="2"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Note details here..."
                    className="w-full bg-slate-950/50 border border-slate-800/80 focus:border-indigo-500 rounded-xl pt-3 pb-3 pl-12 pr-4 text-sm text-slate-200 outline-none"
                  ></textarea>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white font-bold rounded-xl py-3 px-4 text-sm flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <Plus className="w-4 h-4" />
                Add Record
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: List Table */}
        <div className="lg:col-span-2">
          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800/80 shadow-md">
            <h3 className="text-sm font-semibold text-slate-300 mb-6">Recent Ledger Items</h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-slate-500 border-b border-slate-800/80 text-[11px] font-bold uppercase tracking-wider">
                    <th className="pb-3 text-left">Date</th>
                    <th className="pb-3 text-left">Type</th>
                    <th className="pb-3 text-left">Category</th>
                    <th className="pb-3 text-left">Description</th>
                    <th className="pb-3 text-right">Amount</th>
                    <th className="pb-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {transactions.length > 0 ? (
                    transactions.map((tx) => (
                      <tr key={tx.id} className="text-slate-300 hover:bg-slate-800/20 transition-all">
                        <td className="py-3 text-xs font-semibold text-slate-400">{tx.date}</td>
                        <td className="py-3">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            tx.type === 'Income' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                          }`}>
                            {tx.type}
                          </span>
                        </td>
                        <td className="py-3 font-semibold text-slate-200">{tx.category}</td>
                        <td className="py-3 text-xs text-slate-400 max-w-[150px] truncate" title={tx.description}>{tx.description || '-'}</td>
                        <td className={`py-3 text-right font-bold ${
                          tx.type === 'Income' ? 'text-emerald-400' : 'text-slate-100'
                        }`}>
                          {tx.type === 'Expense' ? '-' : ''}₹{tx.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 text-center">
                          <button
                            onClick={() => handleDelete(tx.id)}
                            className="p-1 rounded text-slate-500 hover:bg-slate-800 hover:text-rose-400 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="py-10 text-center text-slate-500 text-xs">
                        No financial records found. Use the logger panel to get started.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
