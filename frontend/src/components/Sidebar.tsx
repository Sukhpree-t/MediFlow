import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  triageWaitingCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ triageWaitingCount = 0 }) => {
  const { user, logout } = useAuth();

  const getRoleDisplayName = (role?: string) => {
    switch (role) {
      case 'ROLE_ER_COORDINATOR':
        return 'ER Coordinator';
      case 'ROLE_WARD_NURSE':
        return 'Ward Charge Nurse';
      case 'ROLE_ADMIN':
        return 'Clinical Administrator';
      default:
        return 'Clinical Staff';
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return 'MF';
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-surface-card border-r border-border-subtle z-50 flex flex-col justify-between select-none">
      <div className="flex flex-col">
        {/* Brand Header */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-border-subtle bg-surface-card">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary-container flex items-center justify-center text-white shadow-sm">
              <span className="material-symbols-outlined text-[20px]">vital_signs</span>
            </div>
            <div className="flex flex-col">
              <span className="font-headline font-bold text-lg tracking-tight text-on-surface leading-none">
                MediFlow
              </span>
              <span className="font-mono text-[11px] text-on-surface-variant font-medium tracking-wider mt-0.5">
                CLINICAL OS
              </span>
            </div>
          </div>
          <span className="font-mono text-[11px] bg-slate-100 text-on-surface-variant px-2 py-0.5 rounded-md border border-border-subtle">
            v3.2.4
          </span>
        </div>

        {/* Navigation Section */}
        <div className="p-4">
          <span className="font-mono text-[11px] uppercase tracking-wider text-outline px-2.5 mb-2 block font-semibold">
            Clinical Operations
          </span>
          <nav className="flex flex-col gap-1">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2.5 rounded-xl transition-all whitespace-nowrap text-sm font-medium ${
                  isActive
                    ? 'bg-primary-container text-white font-semibold shadow-sm'
                    : 'text-on-surface-variant hover:bg-slate-100 hover:text-on-surface'
                }`
              }
            >
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[18px]">grid_view</span>
                <span>Live Ward Grid</span>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
            </NavLink>

            <NavLink
              to="/triage"
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2.5 rounded-xl transition-all whitespace-nowrap text-sm font-medium ${
                  isActive
                    ? 'bg-primary-container text-white font-semibold shadow-sm'
                    : 'text-on-surface-variant hover:bg-slate-100 hover:text-on-surface'
                }`
              }
            >
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[18px]">emergency</span>
                <span>ER Triage Queue</span>
              </div>
              {triageWaitingCount > 0 ? (
                <span className="px-2 py-0.5 rounded-full text-xs font-mono font-semibold bg-red-100 text-red-700">
                  {triageWaitingCount}
                </span>
              ) : null}
            </NavLink>

            <NavLink
              to="/audit"
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2.5 rounded-xl transition-all whitespace-nowrap text-sm font-medium ${
                  isActive
                    ? 'bg-primary-container text-white font-semibold shadow-sm'
                    : 'text-on-surface-variant hover:bg-slate-100 hover:text-on-surface'
                }`
              }
            >
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[18px]">sync_saved_locally</span>
                <span>Audit & Concurrency</span>
              </div>
            </NavLink>

            <NavLink
              to="/demo"
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2.5 rounded-xl transition-all whitespace-nowrap text-sm font-medium ${
                  isActive
                    ? 'bg-primary-container text-white font-semibold shadow-sm'
                    : 'text-on-surface-variant hover:bg-slate-100 hover:text-on-surface'
                }`
              }
            >
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[18px]">bolt</span>
                <span>OCC Simulation Demo</span>
              </div>
              <span className="font-mono text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-semibold">
                RACE
              </span>
            </NavLink>

            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2.5 rounded-xl transition-all whitespace-nowrap text-sm font-medium ${
                  isActive
                    ? 'bg-primary-container text-white font-semibold shadow-sm'
                    : 'text-on-surface-variant hover:bg-slate-100 hover:text-on-surface'
                }`
              }
            >
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[18px]">admin_panel_settings</span>
                <span>Admin Management</span>
              </div>
            </NavLink>
          </nav>
        </div>
      </div>

      {/* Clinician Card & Logout Footer */}
      <div className="p-4 border-t border-border-subtle bg-slate-50/50">
        <div className="p-3 bg-white rounded-xl border border-border-subtle shadow-xs flex flex-col gap-2.5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-sm">
              {getInitials(user?.fullName)}
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-sm font-semibold text-on-surface truncate">
                {user?.fullName || 'Active Clinician'}
              </span>
              <span className="text-[11px] text-on-surface-variant truncate">
                {getRoleDisplayName(user?.role)}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
            <div className="flex items-center gap-1.5 text-slate-500 font-mono text-[11px]">
              <span className="material-symbols-outlined text-[14px]">desktop_windows</span>
              <span>{user?.terminalId || 'ER-DESK-1'}</span>
            </div>
            <button
              onClick={logout}
              className="text-xs text-red-600 hover:text-red-700 font-medium flex items-center gap-1 hover:underline"
              title="Sign Out"
            >
              <span className="material-symbols-outlined text-[14px]">logout</span>
              <span>Exit</span>
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};
