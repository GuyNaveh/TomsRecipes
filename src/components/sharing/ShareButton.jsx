import React, { useState } from 'react';
import Button from '../ui/Button.jsx';
import ShareModal from './ShareModal.jsx';
import { isSupabaseConfigured } from '../../api/supabase.js';

export default function ShareButton({ type, payload, className = '', size = 'sm' }) {
  const [open, setOpen] = useState(false);

  if (!isSupabaseConfigured()) return null;

  return (
    <>
      <Button
        variant="ghost"
        size={size}
        className={`text-xs ${className}`}
        onClick={(e) => {
          e.stopPropagation();
          setOpen(true);
        }}
      >
        🔗 שתף
      </Button>
      <ShareModal
        open={open}
        onClose={() => setOpen(false)}
        type={type}
        payload={payload}
      />
    </>
  );
}
