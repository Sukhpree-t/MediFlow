import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserSession } from '../types';

interface AuthContextType {
  user: UserSession | null;
  login: (session: UserSession) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserSession | null>(() => {
    const saved = sessionStorage.getItem('mediflow_user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = (session: UserSession) => {
    sessionStorage.setItem('mediflow_jwt', session.token);
    sessionStorage.setItem('mediflow_user', JSON.stringify(session));
    setUser(session);
  };

  const logout = () => {
    sessionStorage.removeItem('mediflow_jwt');
    sessionStorage.removeItem('mediflow_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
