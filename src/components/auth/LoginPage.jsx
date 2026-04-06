import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useAuth } from '../../hooks/useAuth.js';
import Card from '../ui/Card.jsx';
import Button from '../ui/Button.jsx';
import Input from '../ui/Input.jsx';
import Spinner from '../ui/Spinner.jsx';

// ── Email / Password tab ──────────────────────────────────────────────────────
function EmailTab({ signIn }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!email.trim() || !password.trim()) {
      setError('נא למלא אימייל וסיסמה');
      return;
    }

    if (isRegister) {
      if (password !== confirmPassword) {
        setError('הסיסמאות אינן תואמות');
        return;
      }
      setLoading(true);
      try {
        const raw = localStorage.getItem('matakon_settings') || '{}';
        const { supabaseUrl, supabaseAnonKey } = JSON.parse(raw);
        const sb = createClient(supabaseUrl, supabaseAnonKey);
        const { error: err } = await sb.auth.signUp({ email, password });
        if (err) {
          setError(translateError(err.message));
        } else {
          setSuccessMsg('נשלח אימייל אימות — בדוק את תיבת הדואר שלך');
        }
      } catch (err) {
        setError('שגיאה בהרשמה: ' + err.message);
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(true);
      const err = await signIn({ email, password });
      setLoading(false);
      if (err) {
        setError(translateError(err.message || String(err)));
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      <Input
        label="אימייל"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="user@example.com"
        dir="ltr"
        autoComplete="email"
      />
      <Input
        label="סיסמה"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="••••••••"
        dir="ltr"
        autoComplete={isRegister ? 'new-password' : 'current-password'}
      />
      {isRegister && (
        <Input
          label="אימות סיסמה"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="••••••••"
          dir="ltr"
          autoComplete="new-password"
        />
      )}

      {error && <p className="text-sm text-red-400">{error}</p>}
      {successMsg && <p className="text-sm text-teal-400">{successMsg}</p>}

      <Button type="submit" loading={loading} className="w-full justify-center">
        {isRegister ? 'הרשמה' : 'התחבר'}
      </Button>

      <button
        type="button"
        onClick={() => { setIsRegister((v) => !v); setError(''); setSuccessMsg(''); }}
        className="text-sm text-teal-400 hover:text-teal-300 transition-colors text-center"
      >
        {isRegister ? 'יש לך חשבון? כניסה' : 'משתמש חדש? הרשמה'}
      </button>
    </form>
  );
}

// ── Phone OTP tab ─────────────────────────────────────────────────────────────
function PhoneTab({ signInOTP, verifyOTP }) {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSend(e) {
    e.preventDefault();
    setError('');
    if (!phone.trim()) {
      setError('נא להזין מספר טלפון');
      return;
    }
    setLoading(true);
    const err = await signInOTP({ phone: phone.trim() });
    setLoading(false);
    if (err) {
      setError(translateError(err.message || String(err)));
    } else {
      setSent(true);
    }
  }

  async function handleVerify(e) {
    e.preventDefault();
    setError('');
    if (!otp.trim()) {
      setError('נא להזין קוד אימות');
      return;
    }
    setLoading(true);
    const err = await verifyOTP({ phone: phone.trim(), token: otp.trim() });
    setLoading(false);
    if (err) {
      setError(translateError(err.message || String(err)));
    }
  }

  if (!sent) {
    return (
      <form onSubmit={handleSend} className="flex flex-col gap-4" noValidate>
        <Input
          label="מספר טלפון"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+972..."
          dir="ltr"
          autoComplete="tel"
        />
        <p className="text-xs text-slate-500">הזן מספר עם קידומת בינלאומית, לדוגמה: +972501234567</p>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <Button type="submit" loading={loading} className="w-full justify-center">
          שלח קוד
        </Button>
      </form>
    );
  }

  return (
    <form onSubmit={handleVerify} className="flex flex-col gap-4" noValidate>
      <p className="text-sm text-slate-400">קוד SMS נשלח למספר {phone}</p>
      <Input
        label="קוד אימות"
        type="text"
        inputMode="numeric"
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
        placeholder="123456"
        dir="ltr"
        autoComplete="one-time-code"
        maxLength={6}
      />
      {error && <p className="text-sm text-red-400">{error}</p>}
      <Button type="submit" loading={loading} className="w-full justify-center">
        אמת קוד
      </Button>
      <button
        type="button"
        onClick={() => { setSent(false); setOtp(''); setError(''); }}
        className="text-sm text-slate-400 hover:text-slate-200 transition-colors text-center"
      >
        שנה מספר טלפון
      </button>
    </form>
  );
}

// ── Error translation ─────────────────────────────────────────────────────────
function translateError(msg) {
  if (!msg) return 'אירעה שגיאה לא ידועה';
  const m = msg.toLowerCase();
  if (m.includes('invalid login credentials') || m.includes('invalid credentials')) {
    return 'פרטי ההתחברות שגויים';
  }
  if (m.includes('email not confirmed')) return 'האימייל טרם אומת — בדוק את תיבת הדואר';
  if (m.includes('user already registered')) return 'כתובת האימייל כבר רשומה במערכת';
  if (m.includes('password')) return 'הסיסמה חלשה מדי — השתמש ב-6 תווים לפחות';
  if (m.includes('rate limit')) return 'יותר מדי ניסיונות — נסה שוב מאוחר יותר';
  if (m.includes('network')) return 'שגיאת רשת — בדוק את החיבור לאינטרנט';
  return msg;
}

// ── Main LoginPage ────────────────────────────────────────────────────────────
export default function LoginPage() {
  const { signIn, signInOTP, verifyOTP } = useAuth();
  const [tab, setTab] = useState('email');

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm flex flex-col gap-6">
        {/* Logo / Title */}
        <div className="text-center">
          <div className="text-5xl mb-2">🍳</div>
          <h1 className="font-heading text-3xl font-bold text-slate-100">מתכונן</h1>
          <p className="text-slate-400 text-sm mt-1">מתכנן הארוחות החכם</p>
        </div>

        <Card className="p-6">
          {/* Tabs */}
          <div className="flex rounded-lg overflow-hidden border border-slate-700 mb-5">
            <button
              type="button"
              onClick={() => setTab('email')}
              className={`flex-1 py-2 text-sm font-medium transition-colors ${
                tab === 'email'
                  ? 'bg-teal-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              כניסה עם אימייל
            </button>
            <button
              type="button"
              onClick={() => setTab('phone')}
              className={`flex-1 py-2 text-sm font-medium transition-colors ${
                tab === 'phone'
                  ? 'bg-teal-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              כניסה עם נייד
            </button>
          </div>

          {tab === 'email' ? (
            <EmailTab signIn={signIn} />
          ) : (
            <PhoneTab signInOTP={signInOTP} verifyOTP={verifyOTP} />
          )}
        </Card>
      </div>
    </div>
  );
}
