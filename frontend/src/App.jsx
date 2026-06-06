import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Budgets from './pages/Budgets';
import Goals from './pages/Goals';
import Investments from './pages/Investments';
import Reports from './pages/Reports';

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000/api";

export default function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('finance_user');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [currentPage, setCurrentPage] = useState('dashboard');

  useEffect(() => {
    if (user) {
      localStorage.setItem('finance_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('finance_user');
    }
  }, [user]);

  const handleLoginSuccess = (userId, username) => {
    setUser({ userId, username });
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentPage('dashboard');
  };

  if (!user) {
    return <Auth onLoginSuccess={handleLoginSuccess} API_BASE={API_BASE} />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard userId={user.userId} API_BASE={API_BASE} />;
      case 'transactions':
        return <Transactions userId={user.userId} API_BASE={API_BASE} />;
      case 'budgets':
        return <Budgets userId={user.userId} API_BASE={API_BASE} />;
      case 'goals':
        return <Goals userId={user.userId} API_BASE={API_BASE} />;
      case 'portfolio':
        return <Investments />;
      case 'reports':
        return <Reports userId={user.userId} API_BASE={API_BASE} />;
      default:
        return <Dashboard userId={user.userId} API_BASE={API_BASE} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden text-slate-100 font-sans">
      {/* Sidebar Navigation */}
      <Sidebar 
        currentPage={currentPage} 
        setCurrentPage={setCurrentPage} 
        onLogout={handleLogout}
        username={user.username}
      />
      
      {/* Dynamic Main Page Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {renderPage()}
      </main>
    </div>
  );
}
