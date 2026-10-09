import { createContext, useContext, useEffect, useState } from 'react';
import { authApi } from '../api';

const AuthContext = createContext(null);

function storedAdmin() {
  try {
    return JSON.parse(localStorage.getItem('ruangwarga_admin'));
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(storedAdmin);
  const [token, setToken] = useState(() => localStorage.getItem('ruangwarga_token'));

  useEffect(() => {
    const expire = () => {
      setAdmin(null);
      setToken(null);
    };
    window.addEventListener('admin-session-expired', expire);
    return () => window.removeEventListener('admin-session-expired', expire);
  }, []);

  const login = async (credentials) => {
    const result = await authApi.login(credentials);
    localStorage.setItem('ruangwarga_token', result.token);
    localStorage.setItem('ruangwarga_admin', JSON.stringify(result.admin));
    setToken(result.token);
    setAdmin(result.admin);
    return result;
  };

  const logout = () => {
    localStorage.removeItem('ruangwarga_token');
    localStorage.removeItem('ruangwarga_admin');
    setToken(null);
    setAdmin(null);
  };

  return <AuthContext.Provider value={{ admin, token, login, logout }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
