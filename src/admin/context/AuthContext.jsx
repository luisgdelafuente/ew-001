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

  const logDebug = (message, data) => {
    console.log(`[Auth Debug] ${message}:`, data);
  };

  // Error logging function
  const logError = (message, error) => {
    console.error(`[Auth Error] ${message}:`, error);
    setError(error.message || 'An unknown error occurred');
  };

  // Function to ensure user exists in public.users table
  const ensureUserExists = async (authUser) => {
    try {
      logDebug('Ensuring user exists', { userId: authUser.id });
      
      // Check if user exists in public.users
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('id, email, role')
        .eq('id', authUser.id)
        .maybeSingle();

      if (checkError) throw checkError;

      if (!existingUser) {
        logDebug('User not found in public.users, creating new record');
        
        // Create new user record with default role
        const { data: newUser, error: insertError } = await supabase
          .from('users')
          .insert({
            id: authUser.id,
            email: authUser.email,
            role: authUser.email === 'admin@epicaworks.com' ? 'admin' : 'editor',
            created_at: new Date().toISOString()
          })
          .select()
          .single();

        if (insertError) throw insertError;
        
        logDebug('New user created', { role: newUser.role });
        return newUser;
      }

      logDebug('Existing user found', { role: existingUser.role });
      return existingUser;
    } catch (error) {
      logError('Error ensuring user exists', error);
      return { role: 'editor' }; // Fallback to default role
    }
  };

  useEffect(() => {
    const getSession = async () => {
      setLoading(true);
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) throw error;
        
        if (session?.user) {
          setSession(session);
          setUser(session.user);
          
          // Ensure user exists and get role
          const userData = await ensureUserExists(session.user);
          setUserRole(userData.role);
        } else {
          setSession(null);
          setUser(null);
          setUserRole(null);
        }
      } catch (error) {
        console.error('Error getting session:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    
    getSession();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      
      if (session?.user) {
        setSession(session);
        setUser(session.user);
        
        const userData = await ensureUserExists(session.user);
        setUserRole(userData.role);
      } else {
        setSession(null);
        setUser(null);
        setUserRole(null);
      }
      
      setLoading(false);
    });
    
    return () => {
      subscription?.unsubscribe();
    };
  }, []);
  
  const signIn = async (email, password) => {
    try {
      logDebug('Attempting sign in', { email });
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      // Ensure user exists in public.users table
      if (data.user) {
        const userData = await ensureUserExists(data.user);
        logDebug('Sign in successful', { user: data.user, role: userData.role });
      }
      
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
      
      if (error) throw error;
      
      logDebug('Sign out successful');
    } catch (error) {
      logError('Error signing out', error);
      throw error;
    }
  };
  
  const hasRole = (requiredRole) => {
    logDebug('Checking role', { userRole, requiredRole });
    
    if (!userRole) return false;
    
    if (requiredRole === 'admin') {
      return userRole === 'admin';
    }
    
    if (requiredRole === 'editor') {
      return ['admin', 'editor'].includes(userRole);
    }
    
    return false;
  };
  
  // Session timeout handling
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