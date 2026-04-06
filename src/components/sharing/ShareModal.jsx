import React, { useState } from 'react';
import Modal from '../ui/Modal.jsx';
import Button from '../ui/Button.jsx';
import Input from '../ui/Input.jsx';
import Spinner from '../ui/Spinner.jsx';
import { getSupabaseClient, isSupabaseConfigured } from '../../api/supabase.js';

export default function ShareModal({ open, onClose, type, payload }) {
  const [tab, setTab] = useState('link');
  const [generatingLink, setGeneratingLink] = useState(false);
  const [shareUrl, setShareUrl] = useState(null);
  const [copied, setCopied] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviting, setInviting] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState(false);
  const [error, setError] = useState(null);

  if (!open) return null;

  if (!isSupabaseConfigured()) {
    return (
      <Modal open={open} onClose={onClose} title="שיתוף" size="sm">
        <p className="text-slate-400 text-sm text-center py-4">
          יש להגדיר Supabase כדי לשתף תוכן
        </p>
        <div className="flex justify-end mt-4">
          <Button variant="ghost" onClick={onClose}>סגור</Button>
        </div>
      </Modal>
    );
  }

  const linkLabel = type === 'plan' ? 'לינק לתפריט' : 'לינק למתכון';
  const sharePathPrefix = type === 'plan' ? '/share/plan/' : '/share/recipe/';

  async function generateLink() {
    setGeneratingLink(true);
    setError(null);
    try {
      const supabase = getSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();
      const insert = {
        type: type === 'plan' ? 'plan' : 'recipe',
        owner_id: user.id,
        recipe_id: type === 'recipe' ? payload.id : null,
        plan_date: type === 'plan' ? payload.date : null,
      };
      const { data, error: err } = await supabase
        .from('shares')
        .insert(insert)
        .select()
        .single();
      if (err) throw err;
      setShareUrl(window.location.origin + sharePathPrefix + data.token);
    } catch (e) {
      setError('שגיאה ביצירת לינק: ' + (e.message || ''));
    } finally {
      setGeneratingLink(false);
    }
  }

  async function copyToClipboard() {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function sendInvite() {
    if (!inviteEmail.trim()) return;
    setInviting(true);
    setError(null);
    setInviteSuccess(false);
    try {
      const supabase = getSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();
      const { error: err } = await supabase
        .from('invitations')
        .insert({ inviter_id: user.id, invitee_email: inviteEmail.trim() });
      if (err) throw err;
      setInviteSuccess(true);
      setInviteEmail('');
    } catch (e) {
      setError('שגיאה בשליחת הזמנה: ' + (e.message || ''));
    } finally {
      setInviting(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="שיתוף" size="md">
      {/* Tabs */}
      <div className="flex gap-1 bg-slate-800 rounded-lg p-1 mb-4">
        {[
          { key: 'link', label: linkLabel },
          { key: 'invite', label: 'הזמן משתמש' },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => { setTab(t.key); setError(null); setShareUrl(null); setInviteSuccess(false); }}
            className={`flex-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              tab === t.key ? 'bg-teal-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {error && (
        <p className="text-red-400 text-sm mb-3 bg-red-900/20 border border-red-800/30 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      {tab === 'link' && (
        <div className="flex flex-col gap-4">
          <p className="text-slate-400 text-sm">
            {type === 'plan'
              ? 'כל מי שיש לו את הלינק יוכל לצפות בתפריט זה'
              : 'כל מי שיש לו את הלינק יוכל לצפות במתכון זה'}
          </p>
          {!shareUrl ? (
            <Button onClick={generateLink} loading={generatingLink} disabled={generatingLink}>
              🔗 צור לינק לשיתוף
            </Button>
          ) : (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 bg-slate-800 border border-slate-600 rounded-lg px-3 py-2">
                <span className="text-slate-300 text-sm flex-1 truncate" dir="ltr">{shareUrl}</span>
                <Button size="sm" variant="secondary" onClick={copyToClipboard}>
                  {copied ? '✓ הועתק' : 'העתק'}
                </Button>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setShareUrl(null)}>
                צור לינק חדש
              </Button>
            </div>
          )}
        </div>
      )}

      {tab === 'invite' && (
        <div className="flex flex-col gap-4">
          <p className="text-slate-400 text-sm">
            המוזמן יוכל לראות את כל המתכונים שלך לאחר הרשמה
          </p>
          {inviteSuccess && (
            <p className="text-emerald-400 text-sm bg-emerald-900/20 border border-emerald-800/30 rounded-lg px-3 py-2">
              ✓ הזמנה נשלחה בהצלחה!
            </p>
          )}
          <div className="flex gap-2">
            <Input
              placeholder="כתובת אימייל"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendInvite()}
              dir="ltr"
              className="flex-1"
            />
            <Button onClick={sendInvite} loading={inviting} disabled={inviting || !inviteEmail.trim()}>
              הזמן
            </Button>
          </div>
        </div>
      )}

      <div className="flex justify-end mt-4">
        <Button variant="ghost" onClick={onClose}>סגור</Button>
      </div>
    </Modal>
  );
}
