import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_BASE } from '../services/config';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('cybercafe_user');
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem('cybercafe_token') || null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const storedToken = localStorage.getItem('cybercafe_token');
      if (!storedToken) return;

      try {
        const res = await fetch(`${API_BASE}/auth/me`, {
          headers: { Authorization: `Bearer ${storedToken}` }
        });
        const data = await res.json();
        if (data.success && data.user) {
          setUser(data.user);
          localStorage.setItem('cybercafe_user', JSON.stringify(data.user));
        }
      } catch (err) {
        console.warn('Auth check notice:', err.message);
      }
    };

    fetchUser();
  }, []);

  const login = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('cybercafe_token', authToken);
    localStorage.setItem('cybercafe_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('cybercafe_token');
    localStorage.removeItem('cybercafe_user');
  };

  const loginWithDemo = async (role = 'admin') => {
    try {
      const email = role === 'admin' 
        ? 'kdshree778@gmail.com' 
        : role === 'operator' 
          ? 'operator@cybercafe.com' 
          : role === 'owner'
            ? 'onlinebaba111111@gmail.com'
            : 'citizen@gmail.com';
      const password = role === 'admin' ? 'admin123' : role === 'operator' ? 'operator123' : 'owner123';

      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (data.success) {
        login(data.user, data.token);
        return;
      }
    } catch (err) {
      console.warn('Demo login API fallback triggered');
    }

    const fallbackUser = {
      id: `user-${role}`,
      name: role === 'admin' ? 'Kamal Narayan Dwivedi (Admin MD)' : role === 'operator' ? 'Desk Operator (Mahuli)' : role === 'owner' ? 'Krishan Narayan Dwivedi (Owner)' : 'Citizen Applicant',
      email: role === 'admin' ? 'kdshree778@gmail.com' : role === 'operator' ? 'operator@cybercafe.com' : 'onlinebaba111111@gmail.com',
      role: role,
      phone: role === 'admin' ? '8090794210' : '9161400719'
    };
    login(fallbackUser, 'demo-token-active');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, loginWithDemo }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
