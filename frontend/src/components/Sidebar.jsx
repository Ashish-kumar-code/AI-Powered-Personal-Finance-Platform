import React from 'react';
import { 
  LayoutDashboard, 
  Receipt, 
  PieChart, 
  Target, 
  Briefcase, 
  FileDown, 
  LogOut,
  Sparkles,
  TrendingUp
} from 'lucide-react';

export default function Sidebar({ currentPage, setCurrentPage, onLogout, username }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'transactions', label: 'Transactions', icon: Receipt },
    { id: 'budgets', label: 'Budgets', icon: PieChart },
    { id: 'goals', label: 'Savings Goals', icon: Target },
    { id: 'portfolio', label: 'Investments', icon: Briefcase },
    { id: 'reports', label: 'Export Reports', icon: FileDown },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between h-screen sticky top-0">
      <div className="p-6">
        {/* Brand Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-600/30">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-wide">FINANCE.AI</h1>
            <span className="text-xs text-indigo-400 font-semibold flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> Predictive Suite
            </span>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="space-y-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-100'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* User Session Info Footer */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-indigo-400 text-sm">
              {username ? username.substring(0, 2).toUpperCase() : 'US'}
            </div>
            <div className="text-left leading-tight">
              <p className="text-xs font-semibold text-slate-300 truncate w-32">{username || 'User Account'}</p>
              <span className="text-[10px] text-slate-500 font-medium">Standard Plan</span>
            </div>
          </div>
          <button 
            onClick={onLogout}
            title="Log Out"
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-800 hover:text-rose-400 transition-all duration-200"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
        <div className="text-center text-[10px] text-slate-600">
          &copy; 2026 Finance.AI Dashboard
        </div>
      </div>
    </aside>
  );
}
