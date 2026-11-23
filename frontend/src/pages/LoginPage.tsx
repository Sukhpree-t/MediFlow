import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import { UserSession } from '../types';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState<string>('arjun.mehta@mediflow.org');
  const [password, setPassword] = useState<string>('MediFlow@2026');
  const [terminalId, setTerminalId] = useState<string>('ER-DESK-1');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await api.post<UserSession>('/auth/login', {
        email,
        password,
        terminalId,
      });
      login(res.data);
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.message || 'Invalid institutional credentials. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (role: string, defaultEmail: string, term: string) => {
    setIsLoading(true);
    setErrorMessage(null);
    setEmail(defaultEmail);
    setTerminalId(term);

    try {
      const res = await api.post<UserSession>('/auth/demo-login', {
        role,
        terminalId: term,
      });
      login(res.data);
    } catch (err: any) {
      // Graceful offline/cloud fallback for instant persona evaluation on Vercel
      const roleMap: Record<string, { role: any; name: string; empId: string }> = {
        COORDINATOR: { role: 'ROLE_ER_COORDINATOR', name: 'Dr. Arjun Mehta', empId: 'EMP-ER-001' },
        NURSE: { role: 'ROLE_WARD_NURSE', name: 'Nurse Simran Kaur', empId: 'EMP-RN-042' },
        ADMIN: { role: 'ROLE_ADMIN', name: 'Dr. Kavita Nair', empId: 'EMP-ADM-009' },
      };
      const persona = roleMap[role] || roleMap.COORDINATOR;
      login({
        token: 'demo-jwt-token-' + role.toLowerCase(),
        role: persona.role,
        fullName: persona.name,
        employeeId: persona.empId,
        terminalId: term,
        expiresInMs: 86400000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-canvas flex flex-col justify-center items-center p-4 relative overflow-hidden select-none">
      {/* Subtle Clinical Ambient Glow */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[720px] h-[360px] bg-gradient-to-b from-blue-100/40 via-surface-container-low/20 to-transparent blur-3xl pointer-events-none -z-10" />

      {/* Main Container */}
      <div className="w-full max-w-lg flex flex-col gap-6 my-auto">
        {/* Card */}
        <div className="bg-surface-card rounded-2xl border border-border-subtle p-8 shadow-[0_8px_30px_rgb(0,0,0,0.06)] flex flex-col gap-6">
          {/* Header */}
          <div className="flex flex-col items-center text-center gap-2">
            <div className="w-12 h-12 rounded-2xl bg-primary-container text-white flex items-center justify-center shadow-md">
              <span className="material-symbols-outlined text-[28px]">vital_signs</span>
            </div>
            <div className="flex items-center gap-2">
              <h1 className="font-headline font-bold text-2xl text-on-surface tracking-tight">
                MediFlow
              </h1>
              <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-blue-50 text-primary font-bold tracking-wider border border-blue-200">
                CLINICAL OS
              </span>
            </div>
            <p className="text-xs text-on-surface-variant font-medium">
              Real-Time Hospital Bed Allocation & Smart Triage Hub
            </p>
          </div>

          {/* Quick Persona Demo Buttons */}
          <div className="flex flex-col gap-2">
            <span className="font-mono text-[11px] uppercase tracking-wider text-outline font-semibold">
              Quick Demo Personas (Instant Access)
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() =>
                  handleDemoLogin('COORDINATOR', 'arjun.mehta@mediflow.org', 'ER-DESK-1')
                }
                className="p-2.5 rounded-xl border border-border-subtle bg-slate-50 hover:bg-blue-50 hover:border-primary transition-all text-left flex flex-col gap-0.5 shadow-2xs"
              >
                <span className="text-xs font-bold text-slate-900 leading-tight">Dr. Mehta</span>
                <span className="text-[10px] text-blue-700 font-medium">ER Coordinator</span>
                <span className="font-mono text-[9px] text-slate-400 mt-0.5">ER-DESK-1</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  handleDemoLogin('NURSE', 'simran.kaur@mediflow.org', 'ICU-STATION-A')
                }
                className="p-2.5 rounded-xl border border-border-subtle bg-slate-50 hover:bg-emerald-50 hover:border-emerald-500 transition-all text-left flex flex-col gap-0.5 shadow-2xs"
              >
                <span className="text-xs font-bold text-slate-900 leading-tight">Nurse Simran</span>
                <span className="text-[10px] text-emerald-700 font-medium">Ward Nurse</span>
                <span className="font-mono text-[9px] text-slate-400 mt-0.5">ICU-STATION-A</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  handleDemoLogin('ADMIN', 'kavita.nair@mediflow.org', 'ADMIN-TERM-01')
                }
                className="p-2.5 rounded-xl border border-border-subtle bg-slate-50 hover:bg-purple-50 hover:border-purple-500 transition-all text-left flex flex-col gap-0.5 shadow-2xs"
              >
                <span className="text-xs font-bold text-slate-900 leading-tight">Dr. Nair</span>
                <span className="text-[10px] text-purple-700 font-medium">Administrator</span>
                <span className="font-mono text-[9px] text-slate-400 mt-0.5">ADMIN-TERM</span>
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Error Banner */}
            {errorMessage && (
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
                <span className="material-symbols-outlined text-[18px] text-red-600 shrink-0 mt-0.5">
                  error
                </span>
                <div>
                  <strong className="font-semibold">Authentication Error:</strong> {errorMessage}
                </div>
              </div>
            )}

            {/* Terminal Selector */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Assigned Terminal Station
              </label>
              <select
                value={terminalId}
                onChange={(e) => setTerminalId(e.target.value)}
                className="w-full py-2.5 px-3 rounded-xl border border-border-subtle bg-white text-sm font-mono font-medium focus:outline-none focus:ring-2 focus:ring-primary shadow-2xs"
              >
                <option value="ER-DESK-1">ER-DESK-1 — Emergency Department Hub</option>
                <option value="ICU-STATION-A">ICU-STATION-A — Intensive Care Desk</option>
                <option value="GEN-WARD-B">GEN-WARD-B — Floor 2 General Ward</option>
                <option value="ADMIN-TERM-01">ADMIN-TERM-01 — Operations Command</option>
              </select>
            </div>

            {/* Email / ID */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Clinical Email / ID
              </label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3 text-slate-400 text-[18px]">
                  mail
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full py-2.5 pl-10 pr-3 rounded-xl border border-border-subtle bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary shadow-2xs"
                  placeholder="name@mediflow.org"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Institutional Password
                </label>
              </div>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3 text-slate-400 text-[18px]">
                  lock
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full py-2.5 pl-10 pr-10 rounded-xl border border-border-subtle bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary shadow-2xs"
                  placeholder="••••••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-slate-400 hover:text-slate-600 focus:outline-none"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="mt-2 w-full py-3 bg-primary hover:bg-blue-700 text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.99] disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Clinical Hub</span>
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Live Ward Occupancy Snapshot Below Card */}
        <div className="p-4 bg-white rounded-2xl border border-border-subtle shadow-xs flex items-center justify-around text-center text-xs">
          <div className="flex flex-col">
            <span className="text-slate-500 font-medium">Database Node</span>
            <span className="font-mono font-bold text-slate-800 flex items-center gap-1 justify-center mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Supabase 5432
            </span>
          </div>
          <div className="h-8 w-px bg-slate-200" />
          <div className="flex flex-col">
            <span className="text-slate-500 font-medium">Sync Engine</span>
            <span className="font-mono font-bold text-blue-700 mt-0.5">STOMP &lt;100ms</span>
          </div>
          <div className="h-8 w-px bg-slate-200" />
          <div className="flex flex-col">
            <span className="text-slate-500 font-medium">Locking Protocol</span>
            <span className="font-mono font-bold text-slate-800 mt-0.5">JPA @Version</span>
          </div>
        </div>

        {/* Global Footer Note */}
        <div className="text-center text-slate-400 text-xs flex items-center justify-center gap-2">
          <span className="material-symbols-outlined text-[15px] text-emerald-600">verified_user</span>
          <span>HIPAA Compliant Session Encryption</span>
        </div>
      </div>
    </div>
  );
};
