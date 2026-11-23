import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { ConnectionLostBanner } from './components/ConnectionLostBanner';
import { LoginPage } from './pages/LoginPage';
import { LiveWardPage } from './pages/LiveWardPage';
import { ErTriagePage } from './pages/ErTriagePage';
import { AuditSyncPage } from './pages/AuditSyncPage';
import { RaceConditionDemoPage } from './pages/RaceConditionDemoPage';
import { AdminPage } from './pages/AdminPage';
import { useWebSocket } from './hooks/useWebSocket';
import { Bed, AuditLog } from './types';

// Global React Error Boundary to prevent white screen crashes
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Unhandled UI Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center font-sans">
          <div className="max-w-md bg-white p-8 rounded-2xl border border-red-200 shadow-xl flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[28px]">error</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900">Application Error</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              {this.state.error?.message || 'An unexpected rendering error occurred.'}
            </p>
            <button
              onClick={() => {
                sessionStorage.clear();
                window.location.href = '/login';
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 shadow-md transition-all"
            >
              Reset & Reload Login
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const AppLayout: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const [beds, setBeds] = useState<Bed[]>([]);
  const [liveLogs, setLiveLogs] = useState<AuditLog[]>([]);

  // Real-time WebSocket hook receiving server STOMP broadcasts
  const { isConnected, latency, reconnect } = useWebSocket({
    onBedUpdate: (updatedBed) => {
      setBeds((prev) => {
        const exists = prev.some((b) => b.id === updatedBed.id);
        if (exists) {
          return prev.map((b) => (b.id === updatedBed.id ? updatedBed : b));
        }
        return [...prev, updatedBed];
      });
    },
    onAuditLog: (newLog) => {
      setLiveLogs((prev) => [newLog, ...prev]);
    },
  });

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  // Derive header titles based on pathname
  const getHeaderContext = () => {
    switch (location.pathname) {
      case '/triage':
        return {
          title: 'ER Triage Queue & Intake',
          subtitle: 'Prioritized live queue using Emergency Severity Index (ESI)',
        };
      case '/audit':
        return {
          title: 'Audit Logs & Concurrency Monitor',
          subtitle: 'Sub-100ms real-time event stream & JPA optimistic lock guard',
        };
      case '/demo':
        return {
          title: 'OCC Collision Simulation (Demo)',
          subtitle: 'Multi-terminal race condition & collision handling verification',
        };
      case '/admin':
        return {
          title: 'Clinical Administration Console',
          subtitle: 'Hospital user governance & Supabase database telemetry',
        };
      default:
        return {
          title: 'Main Clinical Ward (ICU & General)',
          subtitle: 'Real-time bed allocation matrix & telemetry monitoring',
        };
    }
  };

  const { title, subtitle } = getHeaderContext();

  return (
    <div className="min-h-screen bg-canvas flex text-on-surface antialiased font-body">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area offset by sidebar */}
      <div className="flex-1 ml-64 flex flex-col min-w-0">
        {/* Connection Lost Banner */}
        {!isConnected && <ConnectionLostBanner onReconnect={reconnect} />}

        {/* Top Header */}
        <Header isConnected={isConnected} latency={latency} title={title} subtitle={subtitle} />

        {/* Page Views with top margin for fixed header */}
        <main className="flex-1 pt-16 bg-canvas">
          <Routes>
            <Route path="/" element={<LiveWardPage beds={beds} setBeds={setBeds} />} />
            <Route path="/triage" element={<ErTriagePage />} />
            <Route path="/audit" element={<AuditSyncPage logs={liveLogs} latency={latency} />} />
            <Route path="/demo" element={<RaceConditionDemoPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/login" element={<Navigate to="/" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <AppLayout />
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;
