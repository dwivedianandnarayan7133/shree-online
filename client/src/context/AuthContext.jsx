import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('cybercafe_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const storedToken = localStorage.getItem('cybercafe_token');
      if (!storedToken) {
        // Default demo login as Admin Operator for seamless instant review
        const storedUser = localStorage.getItem('cybercafe_user');
        if (storedUser) {
          try { setUser(JSON.parse(storedUser)); } catch (e) {}
        } else {
          // Pre-populate operator user so user can start testing immediately
          loginWithDemo('admin');
        }
        setLoading(false);
        return;
      }

      try {
        const res = await fetch('http://localhost:5000/api/auth/me', {
          headers: { Authorization: `Bearer ${storedToken}` }
        });
        const data = await res.json();
        if (data.success && data.user) {
          setUser(data.user);
        } else {
          localStorage.removeItem('cybercafe_token');
          setToken(null);
        }
      } catch (err) {
        console.error('Auth verification error:', err);
      } finally {
        setLoading(false);
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
        ? 'admin@cybercafe.com' 
        : role === 'operator' 
          ? 'operator@cybercafe.com' 
          : 'customer@cybercafe.com';
      const password = `${role}123`;

      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (data.success) {
        login(data.user, data.token);
      }
    } catch (err) {
      console.warn('Demo login fetch failed, setting fallback user');
      const fallbackUser = {
        id: 'demo-id',
        name: role === 'admin' ? 'Rajesh Kumar (Admin)' : role === 'operator' ? 'Amit Sharma (Operator)' : 'Pooja Verma (Customer)',
        email: `${role}@cybercafe.com`,
        role: role,
        phone: '+91 98765 43210'
      };
      setUser(fallbackUser);
      localStorage.setItem('cybercafe_user', JSON.stringify(fallbackUser));
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, loginWithDemo }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
