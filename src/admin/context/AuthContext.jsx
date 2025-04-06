import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Debug logging function
  const logDebug = (message, data = {}) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Auth Debug] ${message}`, data);
    }
  };

  // Error logging function
  const logError = (message, error) => {
    console.error(`[Auth Error] ${message}:`, error);
    setError(error.message || 'An unknown error occurred');
  };

  useEffect(() => {
    const getSession = async () => {
      setLoading(true);
      try {
        logDebug('Fetching session');
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }
        
        if (data?.session) {
          logDebug('Session found', { userId: data.session.user.id });
          setSession(data.session);
          setUser(data.session.user);
          
          try {
            logDebug('Fetching user role', { userId: data.session.user.id });
            const { data: userData, error: userError } = await supabase
              .from('users')
              .select('role')
              .eq('id', data.session.user.id)
              .single();
            
            if (userError) {
              throw userError;
            }
            
            if (userData) {
              logDebug('User role found', { role: userData.role });
              setUserRole(userData.role);
            } else {
              logDebug('No user role found, using default');
              setUserRole('editor'); // Default fallback
            }
          } catch (error) {
            logError('Error fetching user role', error);
            setUserRole('editor'); // Default fallback
          }
        } else {
          logDebug('No session found');
        }
      } catch (error) {
        logError('Error getting session', error);
      } finally {
        setLoading(false);
      }
    };
    
    getSession();
    
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      logDebug('Auth state changed', { event });
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        try {
          logDebug('Fetching user role after auth change', { userId: session.user.id });
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('role')
            .eq('id', session.user.id)
            .single();
          
          if (userError) {
            throw userError;
          }
          
          if (userData) {
            logDebug('User role updated', { role: userData.role });
            setUserRole(userData.role);
          } else {
            logDebug('No user role found after auth change, using default');
            setUserRole('editor'); // Default fallback
          }
        } catch (error) {
          logError('Error updating user role', error);
          setUserRole('editor'); // Default fallback
        }
      } else {
        logDebug('Clearing user role');
        setUserRole(null);
      }
      
      setLoading(false);
    });
    
    return () => {
      logDebug('Cleaning up auth listener');
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);
  
  const signIn = async (email, password) => {
    try {
      logDebug('Attempting sign in', { email });
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        throw error;
      }
      
      logDebug('Sign in successful');
      return data;
    } catch (error) {
      logError('Error signing in', error);
      throw error;
    }
  };
  
  const signOut = async () => {
    try {
      logDebug('Attempting sign out');
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }
      
      logDebug('Sign out successful');
    } catch (error) {
      logError('Error signing out', error);
      throw error;
    }
  };
  
  const hasRole = (requiredRole) => {
    if (!userRole) return false;
    
    if (requiredRole === 'admin') {
      return userRole === 'admin';
    }
    
    if (requiredRole === 'editor') {
      return ['admin', 'editor'].includes(userRole);
    }
    
    return false;
  };
  
  useEffect(() => {
    let inactivityTimer;
    
    const resetTimer = () => {
      clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(() => {
        if (user) {
          logDebug('Session timeout - signing out');
          signOut();
        }
      }, 30 * 60 * 1000); // 30 minutes
    };
    
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    if (user) {
      logDebug('Setting up inactivity timer');
      resetTimer();
      
      events.forEach(event => {
        window.addEventListener(event, resetTimer);
      });
    }
    
    return () => {
      logDebug('Cleaning up inactivity timer');
      clearTimeout(inactivityTimer);
      events.forEach(event => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [user]);
  
  const value = {
    session,
    user,
    userRole,
    loading,
    error,
    signIn,
    signOut,
    hasRole
  };
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};