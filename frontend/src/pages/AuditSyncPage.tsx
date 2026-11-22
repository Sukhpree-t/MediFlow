import React, { useState, useEffect } from 'react';
import { AuditLog } from '../types';
import api from '../api/client';
import { ShieldAlert, Zap, History, Terminal } from 'lucide-react';

interface AuditSyncPageProps {
  logs: AuditLog[];
  latency: number;
}

export const AuditSyncPage: React.FC<AuditSyncPageProps> = ({ logs: liveLogs, latency }) => {
  const [logs, setLogs] = useState<AuditLog[]>([]);

  useEffect(() => {
    fetchLogs();
  }, []);

  // Merge live logs when arriving from STOMP
  useEffect(() => {
    if (liveLogs.length > 0) {
      setLogs((prev) => {
        const ids = new Set(prev.map((l) => l.id));
        const newOnes = liveLogs.filter((l) => !ids.has(l.id));
        return [...newOnes, ...prev];
      });
    }
  }, [liveLogs]);

  const fetchLogs = async () => {
    try {
      const res = await api.get('/audit-logs?limit=50');
      setLogs(res.data);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    }
  };

  const getActionStyle = (action: string) => {
    switch (action) {
      case 'BED_ALLOCATED':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'LOCK_RETRY_RESOLVED':
        return 'bg-amber-50 text-amber-800 border-amber-200 font-bold';
      case 'BED_RELEASED':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'STATUS_UPDATED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header and Telemetry Stats */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-blue-600" />
            <h1 className="font-headline font-bold text-xl text-slate-900">
              Audit Log & WebSocket Latency Monitor
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time streaming ledger of all optimistic locking events, allocations, and version transitions.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-center">
            <span className="text-[10px] font-mono text-slate-400 block uppercase">
              Current Latency
            </span>
            <span className="text-lg font-mono font-bold text-emerald-600">
              {latency} ms
            </span>
          </div>
          <div className="px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-center">
            <span className="text-[10px] font-mono text-slate-400 block uppercase">
              Logged Events
            </span>
            <span className="text-lg font-mono font-bold text-slate-900">{logs.length}</span>
          </div>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-headline font-bold text-sm text-slate-900 flex items-center gap-2">
            <History className="w-4 h-4 text-slate-500" /> Live Audit Trail
          </h2>
          <span className="text-xs font-mono text-slate-400">Auto-streaming via STOMP /topic/audit</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Action Type</th>
                <th className="py-3 px-4">Bed Code</th>
                <th className="py-3 px-4">Version Transition</th>
                <th className="py-3 px-4">Terminal / Origin</th>
                <th className="py-3 px-4">Staff Role</th>
                <th className="py-3 px-4 text-right">Latency</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 text-slate-500 text-[11px]">
                    {new Date(log.createdAt).toLocaleTimeString()}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[11px] border ${getActionStyle(
                        log.actionType
                      )}`}
                    >
                      {log.actionType}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-900">{log.bedCode || '—'}</td>
                  <td className="py-3 px-4 text-blue-700 font-semibold">
                    {log.versionTransition || '—'}
                  </td>
                  <td className="py-3 px-4 text-slate-600 text-[11px] flex items-center gap-1">
                    <Terminal className="w-3 h-3 text-slate-400" />
                    {log.terminalId || 'SYSTEM'}
                  </td>
                  <td className="py-3 px-4 text-slate-500 text-[11px]">
                    {log.staffRole?.replace('ROLE_', '') || '—'}
                  </td>
                  <td className="py-3 px-4 text-right font-semibold text-emerald-600 text-[11px]">
                    {log.latencyMs ? `${log.latencyMs}ms` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
