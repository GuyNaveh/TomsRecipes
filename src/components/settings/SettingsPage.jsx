import React, { useState } from 'react';
import { useSettings } from '../../hooks/useSettings.js';
import { getSupabaseClient } from '../../api/supabase.js';
import { storage } from '../../storage/storage.js';
import Card from '../ui/Card.jsx';
import Button from '../ui/Button.jsx';
import Input from '../ui/Input.jsx';

function SectionTitle({ children }) {
  return (
    <h2 className="text-base font-semibold text-slate-100 mb-4">{children}</h2>
  );
}

function SuccessMsg({ msg }) {
  if (!msg) return null;
  return (
    <p className="text-sm text-teal-400 mt-2">{msg}</p>
  );
}

function ErrorMsg({ msg }) {
  if (!msg) return null;
  return (
    <p className="text-sm text-red-400 mt-2">{msg}</p>
  );
}

// ── Section 1: Claude API ─────────────────────────────────────────────────────
function ClaudeSection({ settings, updateSettings }) {
  const [apiKey, setApiKey] = useState(settings.claudeApiKey || '');
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState('');

  function handleSave() {
    updateSettings({ claudeApiKey: apiKey });
    storage.reinitStorage();
    setSaved('המפתח נשמר בהצלחה');
    setTimeout(() => setSaved(''), 3000);
  }

  return (
    <Card className="p-5">
      <SectionTitle>מפתח Claude</SectionTitle>
      <div className="flex flex-col gap-3">
        <div className="relative">
          <Input
            label="מפתח API"
            type={showKey ? 'text' : 'password'}
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk-ant-..."
            dir="ltr"
          />
          <button
            type="button"
            onClick={() => setShowKey((v) => !v)}
            className="absolute left-2 bottom-2 text-xs text-slate-400 hover:text-slate-200 transition-colors"
          >
            {showKey ? 'הסתר' : 'הצג'}
          </button>
        </div>
        <p className="text-xs text-slate-500">המפתח נשמר רק במכשיר זה</p>
        <div>
          <Button onClick={handleSave}>שמור</Button>
          <SuccessMsg msg={saved} />
        </div>
      </div>
    </Card>
  );
}

// ── Section 2: Supabase ───────────────────────────────────────────────────────
function SupabaseSection({ settings, updateSettings }) {
  const [url, setUrl] = useState(settings.supabaseUrl || '');
  const [anonKey, setAnonKey] = useState(settings.supabaseAnonKey || '');
  const [testing, setTesting] = useState(false);
  const [testMsg, setTestMsg] = useState('');
  const [testOk, setTestOk] = useState(false);
  const [saved, setSaved] = useState('');

  async function handleTest() {
    setTesting(true);
    setTestMsg('');
    try {
      // Save current values temporarily so getSupabaseClient picks them up
      const tempSettings = JSON.parse(localStorage.getItem('matakon_settings') || '{}');
      localStorage.setItem(
        'matakon_settings',
        JSON.stringify({ ...tempSettings, supabaseUrl: url, supabaseAnonKey: anonKey })
      );
      storage.reinitStorage();
      const sb = getSupabaseClient();
      if (!sb) {
        setTestOk(false);
        setTestMsg('נא למלא כתובת URL ומפתח');
        setTesting(false);
        return;
      }
      const { error } = await sb
        .from('recipes')
        .select('count', { count: 'exact', head: true });
      if (error) {
        setTestOk(false);
        setTestMsg('חיבור נכשל: ' + error.message);
      } else {
        setTestOk(true);
        setTestMsg('החיבור הצליח!');
      }
    } catch (err) {
      setTestOk(false);
      setTestMsg('שגיאה: ' + (err.message || 'בדיקה נכשלה'));
    } finally {
      setTesting(false);
    }
  }

  function handleSave() {
    updateSettings({ supabaseUrl: url, supabaseAnonKey: anonKey });
    storage.reinitStorage();
    setSaved('הגדרות Supabase נשמרו');
    setTimeout(() => setSaved(''), 3000);
  }

  return (
    <Card className="p-5">
      <SectionTitle>Supabase (אופציונלי — עבור גיבוי ענן ושיתוף)</SectionTitle>
      <div className="flex flex-col gap-3">
        <Input
          label="Supabase URL"
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://xxxx.supabase.co"
          dir="ltr"
        />
        <Input
          label="Anon Key"
          type="password"
          value={anonKey}
          onChange={(e) => setAnonKey(e.target.value)}
          placeholder="eyJ..."
          dir="ltr"
        />
        <div className="flex items-center gap-3 flex-wrap">
          <Button variant="secondary" loading={testing} onClick={handleTest}>
            בדוק חיבור
          </Button>
          {testMsg && (
            <span className={`text-sm ${testOk ? 'text-teal-400' : 'text-red-400'}`}>
              {testMsg}
            </span>
          )}
        </div>
        <p className="text-xs text-slate-500">
          כשמוגדר, הנתונים מסונכרנים לענן ומתאפשרים שיתוף והזמנת משתמשים
        </p>
        <div>
          <Button onClick={handleSave}>שמור</Button>
          <SuccessMsg msg={saved} />
        </div>
      </div>
    </Card>
  );
}

// ── Section 3: Cook Names ─────────────────────────────────────────────────────
function CookNamesSection({ settings, updateSettings }) {
  const [names, setNames] = useState(() => [...(settings.cookNames || [])]);
  const [newName, setNewName] = useState('');
  const [saved, setSaved] = useState('');
  const [err, setErr] = useState('');

  function handleAdd() {
    const trimmed = newName.trim();
    if (!trimmed) return;
    if (names.includes(trimmed)) {
      setErr('השם כבר קיים ברשימה');
      return;
    }
    setErr('');
    setNames((prev) => [...prev, trimmed]);
    setNewName('');
  }

  function handleDelete(name) {
    setNames((prev) => prev.filter((n) => n !== name));
  }

  function handleSave() {
    if (names.length < 2) {
      setErr('נדרשים לפחות 2 שמות');
      return;
    }
    setErr('');
    updateSettings({ cookNames: names });
    storage.reinitStorage();
    setSaved('שמות המבשלים נשמרו');
    setTimeout(() => setSaved(''), 3000);
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') handleAdd();
  }

  return (
    <Card className="p-5">
      <SectionTitle>שמות מבשלים</SectionTitle>
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap gap-2">
          {names.map((name) => (
            <span
              key={name}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-700 text-slate-200 text-sm"
            >
              {name}
              <button
                type="button"
                onClick={() => handleDelete(name)}
                className="text-slate-400 hover:text-red-400 transition-colors text-xs leading-none"
                aria-label={`הסר ${name}`}
              >
                ✕
              </button>
            </span>
          ))}
          {names.length === 0 && (
            <span className="text-sm text-slate-500">אין שמות ברשימה</span>
          )}
        </div>

        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <Input
              label="הוסף שם"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="שם מבשל..."
            />
          </div>
          <Button variant="secondary" onClick={handleAdd} className="mb-0.5">
            הוסף
          </Button>
        </div>

        <ErrorMsg msg={err} />

        <div>
          <Button onClick={handleSave}>שמור</Button>
          <SuccessMsg msg={saved} />
        </div>
      </div>
    </Card>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function SettingsPage() {
  const { settings, updateSettings } = useSettings();

  return (
    <div className="flex flex-col gap-5 max-w-2xl mx-auto">
      <h1 className="text-xl font-bold text-slate-100">הגדרות</h1>
      <ClaudeSection settings={settings} updateSettings={updateSettings} />
      <SupabaseSection settings={settings} updateSettings={updateSettings} />
      <CookNamesSection settings={settings} updateSettings={updateSettings} />
    </div>
  );
}
