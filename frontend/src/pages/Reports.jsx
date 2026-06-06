import React, { useState, useEffect } from 'react';
import { FileDown, Download, Sparkles, RefreshCw, FileText, CheckCircle } from 'lucide-react';

export default function Reports({ userId, API_BASE }) {
  const [reports, setReports] = useState([]);
  const [format, setFormat] = useState('pdf');
  const [month, setMonth] = useState(String(new Date().getMonth() + 1));
  const [year, setYear] = useState(String(new Date().getFullYear()));
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const fetchReportsList = async () => {
    try {
      const response = await fetch(`${API_BASE}/reports`, {
        headers: { 'X-User-ID': String(userId) }
      });
      const data = await response.json();
      setReports(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchReportsList();
  }, [userId]);

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch(`${API_BASE}/reports/generate`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-User-ID': String(userId)
        },
        body: JSON.stringify({ 
          report_type: 'monthly',
          month: parseInt(month),
          year: parseInt(year),
          format 
        })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setMessage('Report compiled successfully!');
        fetchReportsList();
        
        // Auto trigger browser download
        const downloadUrl = `${API_BASE}/reports/download?format=${format}&month=${month}&year=${year}&X-User-ID=${userId}`;
        window.open(downloadUrl, '_blank');
      } else {
        setMessage(data.message || 'Compilation failed.');
      }
    } catch (err) {
      setMessage('Failed to send request.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (rep) => {
    const downloadUrl = `${API_BASE}/reports/download?format=${rep.file_path.includes('pdf') ? 'pdf' : rep.file_path.includes('excel') ? 'excel' : 'csv'}&month=${rep.month}&year=${rep.year}&X-User-ID=${userId}`;
    window.open(downloadUrl, '_blank');
  };

  const months = [
    { value: '1', label: 'January' }, { value: '2', label: 'February' }, { value: '3', label: 'March' },
    { value: '4', label: 'April' }, { value: '5', label: 'May' }, { value: '6', label: 'June' },
    { value: '7', label: 'July' }, { value: '8', label: 'August' }, { value: '9', label: 'September' },
    { value: '10', label: 'October' }, { value: '11', label: 'November' }, { value: '12', label: 'December' }
  ];

  return (
    <div className="flex-1 bg-slate-950 p-8 overflow-y-auto text-left">
      <header className="mb-8">
        <h2 className="text-2xl font-bold text-white tracking-tight">Report Export Hub</h2>
        <p className="text-xs text-slate-400 font-medium">Download data statements in PDF, Excel spreadsheet, or raw CSV formats</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column: Setup config */}
        <div className="lg:col-span-1">
          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800/80 shadow-md">
            <h3 className="text-sm font-semibold text-slate-300 mb-6 flex items-center gap-2">
              <FileDown className="w-4 h-4 text-indigo-400" />
              <span>Compile Statement</span>
            </h3>

            {message && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold rounded-xl text-center mb-6 flex items-center gap-1.5 justify-center">
                <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>{message}</span>
              </div>
            )}

            <form onSubmit={handleGenerate} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-2 uppercase tracking-wider">Format</label>
                <div className="grid grid-cols-3 gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800/80">
                  {['pdf', 'excel', 'csv'].map((fmt) => (
                    <button
                      key={fmt}
                      type="button"
                      onClick={() => setFormat(fmt)}
                      className={`py-2 px-3 rounded-lg text-[10px] font-bold uppercase transition-all ${
                        format === fmt ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {fmt}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-2 uppercase tracking-wider">Month</label>
                <select
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800/80 focus:border-indigo-500 rounded-xl py-3 px-4 text-sm text-slate-400 outline-none appearance-none cursor-pointer"
                >
                  {months.map(m => <option key={m.value} className="bg-slate-950" value={m.value}>{m.label}</option>)}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-2 uppercase tracking-wider">Year</label>
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800/80 focus:border-indigo-500 rounded-xl py-3 px-4 text-sm text-slate-400 outline-none appearance-none cursor-pointer"
                >
                  <option className="bg-slate-950" value="2025">2025</option>
                  <option className="bg-slate-950" value="2026">2026</option>
                  <option className="bg-slate-950" value="2027">2027</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white font-bold rounded-xl py-3 px-4 text-sm flex items-center justify-center gap-2 cursor-pointer transition-all mt-6"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Compile & Export
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right column: Generated reports history */}
        <div className="lg:col-span-2">
          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800/80 shadow-md h-full">
            <h3 className="text-sm font-semibold text-slate-300 mb-6">Generated Statements Registry</h3>

            <div className="space-y-3.5 max-h-[400px] overflow-y-auto pr-1">
              {reports.length > 0 ? (
                reports.map((rep) => (
                  <div key={rep.id} className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between gap-4 text-xs hover:border-indigo-500/20 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-600/10 rounded-xl text-indigo-400 border border-indigo-500/15">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-200 uppercase text-[10px] tracking-wide">
                          {rep.report_type} Financial Summary
                        </h4>
                        <span className="text-[9px] text-slate-500 font-medium block mt-0.5">
                          Period: {months.find(m => m.value === String(rep.month))?.label} {rep.year} | Generated: {rep.created_at}
                        </span>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleDownload(rep)}
                      className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[10px] cursor-pointer shadow shadow-indigo-600/20 transition-all"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Get File
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-16 text-slate-500 text-xs">
                  No statements compiled in history registry.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
