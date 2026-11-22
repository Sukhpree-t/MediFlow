import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Activity, LayoutGrid, ClipboardList, ShieldAlert, LogOut, Terminal } from 'lucide-react';

interface NavbarProps {
  isConnected: boolean;
  latency: number;
}

export const Navbar: React.FC<NavbarProps> = ({ isConnected, latency }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navLinks = [
    { to: '/', label: 'Ward Grid', icon: LayoutGrid },
    { to: '/triage', label: 'ER Triage', icon: ClipboardList },
    { to: '/audit', label: 'Audit & Sync', icon: ShieldAlert },
  ];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Navigation */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm">
                <Activity className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-headline font-bold text-lg leading-tight tracking-tight text-slate-900">
                  MediFlow
                </span>
                <span className="text-[10px] font-mono text-blue-600 font-semibold tracking-wider uppercase">
                  Real-Time Bed Hub
                </span>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.to;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Status & User Terminal Info */}
          <div className="flex items-center gap-3">
            {/* Live STOMP sync status pill */}
            <div
              className={`flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-mono font-medium border ${
                isConnected
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border-rose-200'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
                }`}
              />
              <span>{isConnected ? `Connected • ${latency}ms` : 'Disconnected'}</span>
            </div>

            {/* Terminal info */}
            {user && (
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 text-xs font-mono text-slate-700">
                <Terminal className="w-3.5 h-3.5 text-slate-500" />
                <span>{user.terminalId}</span>
              </div>
            )}

            {/* User profile / Logout */}
            {user && (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <div className="flex flex-col text-right hidden sm:block">
                  <span className="text-xs font-semibold text-slate-900">{user.fullName}</span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {user.role.replace('ROLE_', '')}
                  </span>
                </div>
                <button
                  onClick={logout}
                  title="Sign Out"
                  className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
