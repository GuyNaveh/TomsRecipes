import React from 'react';
import { isSupabaseConfigured } from '../../api/supabase.js';
import { useAuth } from '../../hooks/useAuth.js';
import Spinner from '../ui/Spinner.jsx';
import LoginPage from './LoginPage.jsx';

export default function AuthGate({ children }) {
  const configured = isSupabaseConfigured();
  const { user, loading } = useAuth();

  if (!configured) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return <>{children}</>;
}
