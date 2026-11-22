import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { LoginPage } from './pages/LoginPage';
import { LiveWardPage } from './pages/LiveWardPage';
import { ErTriagePage } from './pages/ErTriagePage';
import { AuditSyncPage } from './pages/AuditSyncPage';
import { useWebSocket } from './hooks/useWebSocket';
import { Bed, AuditLog } from './types';

const AppRoutes: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [beds, setBeds] = useState<Bed[]>([]);
  const [liveLogs, setLiveLogs] = useState<AuditLog[]>([]);

  // Real-time WebSocket hook receiving server STOMP broadcasts
  const { isConnected, latency } = useWebSocket({
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

  return (
    <div className="min-h-screen bg-canvas flex flex-col">
      {isAuthenticated && <Navbar isConnected={isConnected} latency={latency} />}
      <main className="flex-1">
        <Routes>
          <Route
            path="/login"
            element={!isAuthenticated ? <LoginPage /> : <Navigate to="/" replace />}
          />
          <Route
            path="/"
            element={
              isAuthenticated ? (
                <LiveWardPage beds={beds} setBeds={setBeds} />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/triage"
            element={isAuthenticated ? <ErTriagePage /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/audit"
            element={
              isAuthenticated ? (
                <AuditSyncPage logs={liveLogs} latency={latency} />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
};

export default App;
