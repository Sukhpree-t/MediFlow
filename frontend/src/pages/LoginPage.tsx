import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import { Activity, Shield, Terminal, ArrowRight, CheckCircle2 } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('arjun.mehta@mediflow.org');
  const [password, setPassword] = useState('MediFlow@2026');
  const [terminalId, setTerminalId] = useState('ER-DESK-1');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const terminals = ['ER-DESK-1', 'ICU-STATION-A', 'GEN-WARD-B', 'MOBILE-TABLET-3'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await api.post('/auth/login', {
        email,
        password,
        terminalId,
      });
      login(res.data);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCoordinator = () => {
    setEmail('arjun.mehta@mediflow.org');
    setPassword('MediFlow@2026');
    setTerminalId('ER-DESK-1');
  };

  const fillDemoNurse = () => {
    setEmail('simran.kaur@mediflow.org');
    setPassword('MediFlow@2026');
    setTerminalId('ICU-STATION-A');
  };

  return (
    <div className="min-h-screen bg-canvas flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
            <Activity className="w-7 h-7" />
          </div>
        </div>
        <h2 className="mt-4 text-center text-2xl font-bold font-headline tracking-tight text-slate-900">
          MediFlow Hospital Hub
        </h2>
        <p className="mt-1 text-center text-xs font-mono text-slate-500">
          Real-Time Bed Allocation & Smart Triage System
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 shadow-xl shadow-slate-200/50 rounded-2xl border border-slate-200 sm:px-10">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Clinical Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-sm rounded-lg border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 p-2.5 border"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full text-sm rounded-lg border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 p-2.5 border"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Assigned Terminal
              </label>
              <select
                value={terminalId}
                onChange={(e) => setTerminalId(e.target.value)}
                className="w-full text-sm rounded-lg border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 p-2.5 bg-white border"
              >
                {terminals.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex justify-center items-center gap-2 py-2.5 px-4 rounded-lg font-semibold text-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-md transition-colors"
            >
              {loading ? 'Authenticating...' : 'Sign In to Station'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Login Preset Buttons */}
          <div className="mt-6 pt-6 border-t border-slate-100">
            <span className="text-[11px] font-mono font-medium text-slate-400 uppercase tracking-wider block mb-2.5">
              1-Click Demo Presets
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={fillDemoCoordinator}
                className="p-2 text-left rounded-lg border border-blue-100 bg-blue-50/50 hover:bg-blue-50 text-blue-900 transition-colors"
              >
                <div className="text-xs font-bold font-headline">ER Coordinator</div>
                <div className="text-[10px] text-blue-600 font-mono">Arjun Mehta (DESK-1)</div>
              </button>
              <button
                type="button"
                onClick={fillDemoNurse}
                className="p-2 text-left rounded-lg border border-purple-100 bg-purple-50/50 hover:bg-purple-50 text-purple-900 transition-colors"
              >
                <div className="text-xs font-bold font-headline">Ward Nurse</div>
                <div className="text-[10px] text-purple-600 font-mono">Simran Kaur (ICU-A)</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
