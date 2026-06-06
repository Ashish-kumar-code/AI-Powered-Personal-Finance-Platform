import React from 'react';
import { Lightbulb, AlertTriangle, Sparkles, TrendingUp, Info } from 'lucide-react';

export default function AIInsightsPanel({ insights = [] }) {
  const getIcon = (category) => {
    switch (category?.toLowerCase()) {
      case 'savings':
        return <Sparkles className="w-5 h-5 text-emerald-400" />;
      case 'food':
      case 'travel':
      case 'entertainment':
        return <AlertTriangle className="w-5 h-5 text-amber-400" />;
      case 'general':
      case 'info':
        return <Info className="w-5 h-5 text-indigo-400" />;
      default:
        return <Lightbulb className="w-5 h-5 text-indigo-400" />;
    }
  };

  const getBorderColor = (category) => {
    switch (category?.toLowerCase()) {
      case 'savings':
        return 'border-emerald-500/20 bg-emerald-500/5 hover:border-emerald-500/35';
      case 'food':
      case 'travel':
      case 'entertainment':
        return 'border-amber-500/20 bg-amber-500/5 hover:border-amber-500/35';
      default:
        return 'border-slate-800/80 bg-slate-900/40 hover:border-indigo-500/20';
    }
  };

  return (
    <div className="p-6 rounded-2xl bg-slate-900/50 backdrop-blur-sm border border-slate-800/80 shadow-md h-full flex flex-col">
      <h3 className="text-sm font-semibold text-slate-400 mb-6 flex items-center gap-2">
        <Lightbulb className="w-4 h-4 text-indigo-400" />
        <span>AI Analytics Advisor</span>
      </h3>

      <div className="space-y-4 overflow-y-auto flex-1 max-h-[300px] scrollbar-none pr-1">
        {insights.length > 0 ? (
          insights.map((ins, index) => (
            <div 
              key={index} 
              className={`p-4 rounded-xl border transition-all duration-300 flex gap-3.5 items-start text-left ${getBorderColor(ins.category)}`}
            >
              <div className="mt-0.5 flex-shrink-0">
                {getIcon(ins.category)}
              </div>
              <div>
                <h4 className="text-xs font-bold text-white tracking-wide mb-1">{ins.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed font-medium">{ins.content}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="h-full flex items-center justify-center text-slate-500 text-xs py-10">
            Analyzing transaction log. Insights will render shortly.
          </div>
        )}
      </div>
    </div>
  );
}
