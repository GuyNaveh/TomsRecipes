import { useState, useEffect } from 'react';
import { getSupabaseClient, isSupabaseConfigured } from '../api/supabase.js';

export function useAuth() {
  const configured = isSupabaseConfigured();

  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(configured);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!configured) {
      setLoading(false);
      return;
    }

    const sb = getSupabaseClient();
    if (!sb) {
      setLoading(false);
      return;
    }

    // Get initial session
    sb.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    // Listen to changes
    const { data: { subscription } } = sb.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const noop = async () => {};

  if (!configured) {
    return {
      user: null,
      session: null,
      loading: false,
      error: null,
      signIn: noop,
      signInOTP: noop,
      verifyOTP: noop,
      signOut: noop,
    };
  }

  async function signIn({ email, password }) {
    setError(null);
    const sb = getSupabaseClient();
    if (!sb) return;
    const { error: err } = await sb.auth.signInWithPassword({ email, password });
    if (err) setError(err.message);
    return err;
  }

  async function signInOTP({ phone }) {
    setError(null);
    const sb = getSupabaseClient();
    if (!sb) return;
    const { error: err } = await sb.auth.signInWithOtp({ phone });
    if (err) setError(err.message);
    return err;
  }

  async function verifyOTP({ phone, token }) {
    setError(null);
    const sb = getSupabaseClient();
    if (!sb) return;
    const { error: err } = await sb.auth.verifyOtp({ phone, token, type: 'sms' });
    if (err) setError(err.message);
    return err;
  }

  async function signOut() {
    const sb = getSupabaseClient();
    if (!sb) return;
    await sb.auth.signOut();
  }

  return { user, session, loading, error, signIn, signInOTP, verifyOTP, signOut };
}
