import { createContext, useContext, useState } from 'react';
import { loginRequest, registerRequest } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('authToken'));
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('authUser');
    try {
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const persist = (nextToken, nextUser) => {
    if (nextToken) {
      localStorage.setItem('authToken', nextToken);
      localStorage.setItem('authUser', JSON.stringify(nextUser));
    } else {
      localStorage.removeItem('authToken');
      localStorage.removeItem('authUser');
    }
    setToken(nextToken);
    setUser(nextUser);
  };

  const login = async (email, password) => {
    const data = await loginRequest(email, password);
    persist(data.token, data.user);
    return data.user;
  };

  const register = async (email, password, name) => {
    const data = await registerRequest(email, password, name);
    persist(data.token, data.user);
    return data.user;
  };

  const logout = () => {
    persist(null, null);
  };

  const value = {
    token,
    user,
    isAuthenticated: !!token,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside an <AuthProvider>');
  }
  return ctx;
}