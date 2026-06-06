import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function KPICard({ title, value, icon: Icon, subtext, delta, isPositiveTrend, glowColor }) {
  const glowClasses = {
    indigo: 'hover:shadow-indigo-500/10 border-slate-800/80 hover:border-indigo-500/30',
    emerald: 'hover:shadow-emerald-500/10 border-slate-800/80 hover:border-emerald-500/30',
    rose: 'hover:shadow-rose-500/10 border-slate-800/80 hover:border-rose-500/30',
    amber: 'hover:shadow-amber-500/10 border-slate-800/80 hover:border-amber-500/30',
  };

  return (
    <div className={`p-6 rounded-2xl bg-slate-900/50 backdrop-blur-sm border transition-all duration-300 shadow-md ${glowClasses[glowColor] || 'hover:shadow-slate-500/5'}`}>
      <div className="flex justify-between items-start mb-4">
        <span className="text-sm font-semibold text-slate-400">{title}</span>
        <div className={`p-2.5 rounded-xl ${
          glowColor === 'emerald' ? 'bg-emerald-500/10 text-emerald-400' :
          glowColor === 'rose' ? 'bg-rose-500/10 text-rose-400' :
          glowColor === 'amber' ? 'bg-amber-500/10 text-amber-400' :
          'bg-indigo-500/10 text-indigo-400'
        }`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      
      <div className="flex items-baseline gap-2 mb-1">
        <h3 className="text-2xl font-bold text-white tracking-tight">{value}</h3>
        {delta !== undefined && (
          <span className={`text-xs font-bold flex items-center ${isPositiveTrend ? 'text-emerald-400' : 'text-rose-400'}`}>
            {isPositiveTrend ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
            {delta}%
          </span>
        )}
      </div>
      
      <p className="text-xs text-slate-500 font-medium">{subtext}</p>
    </div>
  );
}
