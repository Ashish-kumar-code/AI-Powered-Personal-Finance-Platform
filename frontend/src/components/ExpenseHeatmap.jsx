import React from 'react';

export default function ExpenseHeatmap({ data = {} }) {
  // Generate date keys for the last 365 days
  const days = [];
  const now = new Date();
  
  // Start 365 days ago, adjust to align weeks (e.g. starting on Sunday)
  const startDate = new Date();
  startDate.setDate(now.getDate() - 365);
  
  // Align to Sunday
  const startDayOffset = startDate.getDay();
  startDate.setDate(startDate.getDate() - startDayOffset);

  const totalDaysToRender = 371; // roughly 53 weeks * 7 days
  const currentDate = new Date(startDate);
  
  for (let i = 0; i < totalDaysToRender; i++) {
    days.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  // Helper to color cells based on daily spend volume
  const getCellColor = (dateStr) => {
    const spend = data[dateStr];
    if (!spend || spend === 0) return 'bg-slate-800/80 hover:bg-slate-700/80';
    if (spend < 1000) return 'bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-900/20';
    if (spend < 5000) return 'bg-indigo-800/90 hover:bg-indigo-700';
    if (spend < 15000) return 'bg-indigo-600 hover:bg-indigo-500';
    return 'bg-indigo-400 hover:bg-indigo-300';
  };

  // Group days into weeks (columns of 7 days)
  const weeks = [];
  let currentWeek = [];
  
  days.forEach((day, index) => {
    currentWeek.push(day);
    if (currentWeek.length === 7 || index === days.length - 1) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });

  const monthLabels = [];
  let prevMonth = -1;
  
  days.forEach((day, index) => {
    if (index % 7 === 0) { // check at the start of each week column
      const month = day.getMonth();
      if (month !== prevMonth) {
        monthLabels.push({
          label: day.toLocaleString('default', { month: 'short' }),
          colIndex: Math.floor(index / 7)
        });
        prevMonth = month;
      }
    }
  });

  return (
    <div className="p-6 rounded-2xl bg-slate-900/50 backdrop-blur-sm border border-slate-800/80 shadow-md">
      <h3 className="text-sm font-semibold text-slate-400 mb-6 flex items-center justify-between">
        <span>Daily Expense Heatmap</span>
        <span className="text-[10px] text-slate-500">Activity grid over past 365 days</span>
      </h3>
      
      <div className="overflow-x-auto pb-2 scrollbar-thin">
        <div className="min-w-[700px] flex flex-col">
          {/* Month Header Row */}
          <div className="flex text-[10px] text-slate-500 font-medium h-4 mb-1 relative ml-8">
            {monthLabels.map((m, idx) => (
              <span 
                key={idx} 
                className="absolute" 
                style={{ left: `${m.colIndex * 13}px` }}
              >
                {m.label}
              </span>
            ))}
          </div>
          
          <div className="flex gap-[3px]">
            {/* Day of Week Sidebar labels */}
            <div className="flex flex-col justify-between text-[9px] text-slate-500 font-semibold w-8 pr-2 h-[105px]">
              <span>Mon</span>
              <span>Wed</span>
              <span>Fri</span>
            </div>

            {/* Weeks Columns */}
            <div className="flex gap-[3px]">
              {weeks.map((week, wIdx) => (
                <div key={wIdx} className="flex flex-col gap-[3px]">
                  {week.map((day, dIdx) => {
                    const dateStr = day.toISOString().split('T')[0];
                    const spend = data[dateStr] || 0;
                    return (
                      <div
                        key={dIdx}
                        className={`w-[10px] h-[10px] rounded-[2px] transition-colors duration-150 relative group cursor-pointer ${getCellColor(dateStr)}`}
                      >
                        {/* Tooltip on hover */}
                        <div className="hidden group-hover:flex absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-slate-950 border border-slate-800 text-[10px] text-slate-200 px-2.5 py-1.5 rounded-lg whitespace-nowrap shadow-2xl z-50 pointer-events-none flex-col items-center leading-tight">
                          <span className="font-bold text-indigo-400">₹{spend.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                          <span className="text-slate-500 text-[8px] mt-0.5">{day.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Legend */}
      <div className="flex items-center justify-end gap-2 text-[10px] text-slate-500 mt-4 pr-1">
        <span>Less</span>
        <div className="w-[10px] h-[10px] rounded-[2px] bg-slate-800/80"></div>
        <div className="w-[10px] h-[10px] rounded-[2px] bg-indigo-950/80"></div>
        <div className="w-[10px] h-[10px] rounded-[2px] bg-indigo-800/90"></div>
        <div className="w-[10px] h-[10px] rounded-[2px] bg-indigo-600"></div>
        <div className="w-[10px] h-[10px] rounded-[2px] bg-indigo-400"></div>
        <span>More</span>
      </div>
    </div>
  );
}
