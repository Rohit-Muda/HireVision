import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { auth } from '../services/firebase';
import { signInWithCustomToken, signOut } from 'firebase/auth';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('hv_user');
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  });
  const [loading, setLoading] = useState(true);

  // Fetch fresh user on mount if token exists
  useEffect(() => {
    const token = localStorage.getItem('hv_token');
    if (token) {
      api.get('/auth/me')
        .then(res => {
          setUser(res.data.user);
          localStorage.setItem('hv_user', JSON.stringify(res.data.user));
        })
        .catch(() => {
          localStorage.removeItem('hv_token');
          localStorage.removeItem('hv_user');
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { idToken, user: userData } = res.data;
    localStorage.setItem('hv_token', idToken);
    localStorage.setItem('hv_user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  }, []);

  const register = useCallback(async (email, password, name, role) => {
    const res = await api.post('/auth/register', { email, password, name, role });
    const { customToken, user: userData } = res.data;
    // Sign in with custom token to get an ID token
    const firebaseCredential = await signInWithCustomToken(auth, customToken);
    const idToken = await firebaseCredential.user.getIdToken();
    localStorage.setItem('hv_token', idToken);
    localStorage.setItem('hv_user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  }, []);

  const logout = useCallback(async () => {
    await signOut(auth).catch(() => {});
    localStorage.removeItem('hv_token');
    localStorage.removeItem('hv_user');
    setUser(null);
  }, []);

  const updateUser = useCallback((updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('hv_user', JSON.stringify(updatedUser));
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
