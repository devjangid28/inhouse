import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const storedUser = sessionStorage.getItem('user');
        const localUser = localStorage.getItem('user');

        if (storedUser && mounted) {
          try {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
          } catch (parseError) {
            console.error('Error parsing stored user:', parseError);
            sessionStorage.removeItem('user');
            localStorage.removeItem('user');
            setUser(null);
          }
        } else if (localUser && mounted) {
          try {
            const parsedUser = JSON.parse(localUser);
            setUser(parsedUser);
            sessionStorage.setItem('user', localUser);
          } catch (parseError) {
            console.error('Error parsing stored user:', parseError);
            localStorage.removeItem('user');
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
    };
  }, []);

  const signUp = async (email, password, fullName) => {
    try {
      const response = await fetch('http://localhost:5000/api/users/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email, password, full_name: fullName })
      });

      const contentType = response.headers.get('content-type') || '';
      const payload = contentType.includes('application/json') ? await response.json() : { error: await response.text() };

      if (!response.ok) {
        throw new Error(payload?.error || `Registration failed (${response.status})`);
      }

      const userData = {
        user: {
          id: payload.data.id,
          email: payload.data.email,
          user_metadata: { full_name: payload.data.full_name }
        }
      };

      setUser(userData.user);
      const userJSON = JSON.stringify(userData.user);
      localStorage.setItem('user', userJSON);
      sessionStorage.setItem('user', userJSON);

      return { data: userData, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  const signIn = async (email, password) => {
    try {
      const response = await fetch('http://localhost:5000/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const contentType = response.headers.get('content-type') || '';
      const payload = contentType.includes('application/json') ? await response.json() : { error: await response.text() };

      if (!response.ok) {
        throw new Error(payload?.error || `Login failed (${response.status})`);
      }

      const userData = {
        user: {
          id: payload.data.id,
          email: payload.data.email,
          user_metadata: { full_name: payload.data.full_name }
        }
      };

      setUser(userData.user);
      const userJSON = JSON.stringify(userData.user);
      localStorage.setItem('user', userJSON);
      sessionStorage.setItem('user', userJSON);

      return { data: userData, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  const signOut = async () => {
    try {
      setUser(null);
      localStorage.removeItem('user');
      sessionStorage.removeItem('user');
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
