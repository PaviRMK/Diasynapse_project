import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

const TOKEN_KEY = 'diasynapse_token';
const USER_KEY = 'diasynapse_user';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [loading, setLoading] = useState(true);

  // Restore authenticated session on mount using token verification
  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      const savedToken = localStorage.getItem(TOKEN_KEY);
      if (!savedToken) {
        if (isMounted) {
          setUser(null);
          setLoading(false);
        }
        return;
      }

      try {
        const response = await api.getMe(savedToken);
        if (isMounted) {
          if (response?.user) {
            setUser(response.user);
            setToken(savedToken);
            localStorage.setItem(USER_KEY, JSON.stringify(response.user));
          } else {
            // Invalid response
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(USER_KEY);
            setUser(null);
            setToken(null);
          }
        }
      } catch (err) {
        // Token invalid, expired, or backend rejected
        console.warn('Session verification failed, logging out:', err?.message || err);
        if (isMounted) {
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(USER_KEY);
          setUser(null);
          setToken(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    initAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await api.login({ email, password });
      if (!response?.token || !response?.user) {
        throw new Error('Authentication response was invalid.');
      }

      localStorage.setItem(TOKEN_KEY, response.token);
      localStorage.setItem(USER_KEY, JSON.stringify(response.user));
      setToken(response.token);
      setUser(response.user);
      return { success: true };
    } finally {
      setLoading(false);
    }
  };

  const signup = async ({ name, email, password, diabetesType, dob }) => {
    setLoading(true);
    try {
      const response = await api.register({ name, email, password, diabetesType, dob });
      if (!response?.token || !response?.user) {
        throw new Error('Registration response was invalid.');
      }

      localStorage.setItem(TOKEN_KEY, response.token);
      localStorage.setItem(USER_KEY, JSON.stringify(response.user));
      setToken(response.token);
      setUser(response.user);
      return { success: true };
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updatedData) => {
    setLoading(true);
    try {
      const currentToken = token || localStorage.getItem(TOKEN_KEY);
      if (!currentToken) {
        throw new Error('No active authenticated session.');
      }

      const response = await api.updateProfile(currentToken, updatedData);
      const updatedUser = response?.user || { ...user, ...updatedData };
      localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
      setUser(updatedUser);
      return { success: true };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, signup, updateProfile, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
