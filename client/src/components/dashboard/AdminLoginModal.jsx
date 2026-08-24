import React, { useState } from 'react';
import { Lock, User, KeyRound, ShieldCheck, Trophy, AlertTriangle, ArrowRight } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

export default function AdminLoginModal({ onLoginSuccess, onCancelReturnHome }) {
  const { t } = useLanguage();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.message || 'Login gagal. Periksa username dan password.');
      }

      // Save session
      localStorage.setItem('sportbook_user', JSON.stringify(data.data));
      onLoginSuccess(data.data);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = (demoUser, demoPass) => {
    setUsername(demoUser);
    setPassword(demoPass);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/90 backdrop-blur-md">
      <div className="bg-white rounded-card shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
        
        {/* Brand Header */}
        <div className="bg-navy text-white p-6 text-center relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/20 rounded-full blur-xl pointer-events-none" />
          
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center mx-auto mb-3 shadow-lg shadow-primary/30">
            <Trophy className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-xl font-extrabold tracking-tight">Sport<span className="text-primary">Book</span> Management</h3>
          <p className="text-xs text-slate-400 mt-1">Portal Login Staff & Operator Venue</p>
        </div>

        {/* Login Form */}
        <div className="p-6 space-y-5">

          {errorMsg && (
            <div className="p-3.5 rounded bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Username Staff *</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  placeholder="Masukkan username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-button font-semibold text-navy focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Password *</label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  placeholder="Masukkan password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-button font-semibold text-navy focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary hover:bg-primary-hover text-white text-xs font-extrabold rounded-button shadow-md flex items-center justify-center space-x-2 disabled:opacity-50 transition-all"
            >
              {loading ? (
                <span>Memproses Login...</span>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>MASUK DASHBOARD</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials Assistant */}
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <span className="text-[11px] font-bold text-slate-500 block text-center">Akun Akses Berdasarkan Level Role:</span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('admin', 'admin123')}
                className="p-2 rounded-button bg-blue-50 hover:bg-blue-100 border border-blue-200 text-left transition-colors"
              >
                <span className="text-[10px] font-extrabold text-primary block">Level 1: ADMIN</span>
                <span className="text-[10px] text-slate-600">User: admin / admin123</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('operator', 'op123')}
                className="p-2 rounded-button bg-orange-light hover:bg-orange-100 border border-orange/30 text-left transition-colors"
              >
                <span className="text-[10px] font-extrabold text-orange block">Level 2: OPERATOR</span>
                <span className="text-[10px] text-slate-600">User: operator / op123</span>
              </button>
            </div>
          </div>

          <div className="text-center pt-2">
            <button
              onClick={onCancelReturnHome}
              className="text-xs font-semibold text-slate-500 hover:text-navy underline"
            >
              Kembali ke Landing Page Utama
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
