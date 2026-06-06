import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Pie, Bar } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Common chart options for slate/dark theme
const chartOptionsBase = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: {
        color: '#9ca3af', // gray-400
        font: {
          family: 'Plus Jakarta Sans',
          size: 11,
          weight: '500'
        }
      }
    },
    tooltip: {
      backgroundColor: '#0f172a', // slate-900
      titleColor: '#f8fafc',
      bodyColor: '#cbd5e1',
      borderColor: '#334155',
      borderWidth: 1,
      padding: 10,
      titleFont: { family: 'Plus Jakarta Sans', weight: 'bold' },
      bodyFont: { family: 'Plus Jakarta Sans' }
    }
  },
  scales: {
    x: {
      grid: { color: '#1e293b' },
      ticks: { color: '#64748b', font: { family: 'Plus Jakarta Sans', size: 10 } }
    },
    y: {
      grid: { color: '#1e293b' },
      ticks: { color: '#64748b', font: { family: 'Plus Jakarta Sans', size: 10 } }
    }
  }
};

export function MonthlyTrendChart({ data = {} }) {
  // Sort keys
  const months = Object.keys(data).sort();
  const values = months.map(m => data[m]);

  const chartData = {
    labels: months.map(m => {
      const parts = m.split('-');
      if (parts.length === 2) {
        const date = new Date(parts[0], parts[1] - 1);
        return date.toLocaleString('default', { month: 'short', year: '2-digit' });
      }
      return m;
    }),
    datasets: [
      {
        label: 'Monthly Expenses',
        data: values,
        borderColor: 'rgb(99, 102, 241)', // indigo-500
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        fill: true,
        tension: 0.4,
        borderWidth: 2.5,
        pointRadius: 4,
        pointBackgroundColor: 'rgb(99, 102, 241)',
        pointHoverRadius: 6,
      }
    ]
  };

  const options = {
    ...chartOptionsBase,
    plugins: {
      ...chartOptionsBase.plugins,
      legend: { display: false } // hide legend for single dataset line chart
    }
  };

  return (
    <div className="h-64 w-full">
      {months.length > 0 ? (
        <Line data={chartData} options={options} />
      ) : (
        <div className="h-full flex items-center justify-center text-slate-500 text-sm">
          No trend data logged yet.
        </div>
      )}
    </div>
  );
}

export function CategoryAllocationChart({ data = {} }) {
  const categories = Object.keys(data);
  const values = categories.map(c => data[c]);

  const chartData = {
    labels: categories,
    datasets: [
      {
        data: values,
        backgroundColor: [
          'rgba(99, 102, 241, 0.75)',  // Indigo
          'rgba(16, 185, 129, 0.75)',  // Emerald
          'rgba(244, 63, 94, 0.75)',   // Rose
          'rgba(245, 158, 11, 0.75)',  // Amber
          'rgba(6, 182, 212, 0.75)',   // Cyan
          'rgba(168, 85, 247, 0.75)',  // Purple
        ],
        borderColor: '#0f172a', // slate-900 border
        borderWidth: 2,
        hoverOffset: 6
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      ...chartOptionsBase.plugins,
      legend: {
        position: 'right',
        labels: {
          color: '#cbd5e1',
          font: { family: 'Plus Jakarta Sans', size: 11, weight: '500' },
          boxWidth: 12,
          padding: 12
        }
      }
    }
  };

  return (
    <div className="h-64 w-full relative py-2">
      {categories.length > 0 ? (
        <Pie data={chartData} options={options} />
      ) : (
        <div className="h-full flex items-center justify-center text-slate-500 text-sm">
          No expenses recorded this month.
        </div>
      )}
    </div>
  );
}

export function BudgetComparisonChart({ budgets = [] }) {
  const categories = budgets.map(b => b.category);
  const limits = budgets.map(b => b.budget);
  const spends = budgets.map(b => b.spent);

  const chartData = {
    labels: categories,
    datasets: [
      {
        label: 'Budget Limit',
        data: limits,
        backgroundColor: 'rgba(51, 65, 85, 0.4)', // slate-700
        borderColor: 'rgb(71, 85, 105)',
        borderWidth: 1,
        borderRadius: 6,
      },
      {
        label: 'Actual Spent',
        data: spends,
        backgroundColor: spends.map((s, idx) => 
          s > limits[idx] ? 'rgba(244, 63, 94, 0.75)' : 'rgba(16, 185, 129, 0.75)'
        ),
        borderColor: spends.map((s, idx) => 
          s > limits[idx] ? 'rgb(244, 63, 94)' : 'rgb(16, 185, 129)'
        ),
        borderWidth: 1.5,
        borderRadius: 6,
      }
    ]
  };

  const options = {
    ...chartOptionsBase,
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#64748b', font: { family: 'Plus Jakarta Sans', size: 10 } }
      },
      y: {
        grid: { color: '#1e293b' },
        ticks: { color: '#64748b', font: { family: 'Plus Jakarta Sans', size: 10 } }
      }
    }
  };

  return (
    <div className="h-64 w-full">
      {categories.length > 0 ? (
        <Bar data={chartData} options={options} />
      ) : (
        <div className="h-full flex items-center justify-center text-slate-500 text-sm">
          No category budgets configured yet.
        </div>
      )}
    </div>
  );
}
