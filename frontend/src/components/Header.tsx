import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

interface HeaderProps {
  isConnected: boolean;
  latency?: number;
  title?: string;
  subtitle?: string;
}

const TERMINAL_OPTIONS = [
  { id: 'ER-DESK-1', label: 'ER-DESK-1 (Intake Hub)' },
  { id: 'ICU-STATION-A', label: 'ICU-STATION-A (ICU Floor)' },
  { id: 'GEN-WARD-B', label: 'GEN-WARD-B (General Ward)' },
  { id: 'ADMIN-TERM-01', label: 'ADMIN-TERM-01 (Operations)' },
];

export const Header: React.FC<HeaderProps> = ({
  isConnected,
  latency = 38,
  title = 'MediFlow Clinical Hub',
  subtitle = 'Real-time Hospital Bed Allocation & Triage',
}) => {
  const { user, switchTerminal } = useAuth();

  return (
    <header className="fixed top-0 left-64 right-0 h-16 bg-surface-card border-b border-border-subtle z-40 px-6 flex items-center justify-between">
      {/* Title & Subtitle */}
      <div className="flex flex-col">
        <h1 className="font-headline font-bold text-lg text-on-surface leading-tight">
          {title}
        </h1>
        <p className="text-xs text-on-surface-variant font-medium">{subtitle}</p>
      </div>

      {/* Action Strip: Sync Status, Terminal Switcher, OCC Demo */}
      <div className="flex items-center gap-3">
        {/* Sub-100ms STOMP WebSocket Sync Indicator */}
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-mono font-medium shadow-2xs transition-colors ${
            isConnected
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-red-50 text-red-800 border-red-200 animate-pulse'
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'
            }`}
          />
          <span className="hidden sm:inline">
            {isConnected ? 'STOMP Live' : 'Reconnecting...'}
          </span>
          <span className="font-bold border-l pl-2 border-emerald-200/60">
            {isConnected ? `${latency}ms` : 'Offline'}
          </span>
        </div>

        {/* Terminal Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-50 border border-border-subtle rounded-lg px-2.5 py-1 text-xs font-mono">
          <span className="material-symbols-outlined text-slate-400 text-[16px]">
            point_of_sale
          </span>
          <select
            value={user?.terminalId || 'ER-DESK-1'}
            onChange={(e) => switchTerminal(e.target.value)}
            className="bg-transparent border-none text-xs font-mono font-semibold text-slate-800 focus:outline-none cursor-pointer"
            title="Switch Active Clinical Terminal"
          >
            {TERMINAL_OPTIONS.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        {/* Quick Demo Trigger Link */}
        <Link
          to="/demo"
          className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 transition-colors text-xs font-semibold"
        >
          <span className="material-symbols-outlined text-[16px]">bolt</span>
          <span>Race Sim</span>
        </Link>
      </div>
    </header>
  );
};
