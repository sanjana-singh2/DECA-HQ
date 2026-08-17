import { useState } from 'react';
import { useAuthContext } from '../context/AuthContext';
import {
  loginUser,
  logoutUser,
  registerUser,
  resetPassword,
} from '../services/authService';

export function useAuth() {
  const { session, userProfile, loading, refreshProfile } = useAuthContext();
  const [authLoading, setAuthLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (email: string, password: string) => {
    setAuthLoading(true);
    setError(null);
    try {
      await loginUser(email, password);
    } catch (e: any) {
      setError(mapSupabaseError(e.message));
    } finally {
      setAuthLoading(false);
    }
  };

  const register = async (params: {
    email: string;
    password: string;
    fullName: string;
    grade: number;
  }) => {
    setAuthLoading(true);
    setError(null);
    try {
      await registerUser(params);
      return true;
    } catch (e: any) {
      setError(mapSupabaseError(e.message));
      return false;
    } finally {
      setAuthLoading(false);
    }
  };

  const logout = async () => {
    setAuthLoading(true);
    try {
      await logoutUser();
    } finally {
      setAuthLoading(false);
    }
  };

  const forgotPassword = async (email: string) => {
    setAuthLoading(true);
    setError(null);
    try {
      await resetPassword(email);
      return true;
    } catch (e: any) {
      setError(mapSupabaseError(e.message));
      return false;
    } finally {
      setAuthLoading(false);
    }
  };

  return {
    user: userProfile,
    session,
    isLoading: loading || authLoading,
    error,
    isAuthenticated: !!session,
    isOfficer: userProfile?.role === 'officer' || userProfile?.role === 'advisor',
    isAdvisor: userProfile?.role === 'advisor',
    login,
    register,
    logout,
    forgotPassword,
    refreshProfile,
  };
}

function mapSupabaseError(message: string): string {
  if (message.includes('Invalid login credentials')) return 'Incorrect email or password.';
  if (message.includes('User already registered')) return 'An account with that email already exists.';
  if (message.includes('Password should be')) return 'Password must be at least 6 characters.';
  if (message.includes('Unable to validate')) return 'Please enter a valid email address.';
  if (message.includes('Email rate limit')) return 'Too many attempts. Please try again later.';
  if (message.includes('Network')) return 'Network error. Check your connection.';
  return message || 'An unexpected error occurred. Please try again.';
}
