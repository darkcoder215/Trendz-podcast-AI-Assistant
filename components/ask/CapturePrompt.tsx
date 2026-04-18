'use client';

import { useState } from 'react';
import { Mark } from '../Mark';
import { Ico } from '../Icons';

export function CapturePrompt({ onDone, onDismiss }: { onDone: () => void; onDismiss: () => void }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    if (trimmedName.length < 1 || trimmedName.length > 80) {
      setErr('الاسم مطلوب');
      return;
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(trimmedEmail)) {
      setErr('بريد إلكتروني غير صحيح');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/identify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmedName, email: trimmedEmail }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setErr(body.error ?? 'تعذّر الحفظ.');
        setSubmitting(false);
        return;
      }
      onDone();
    } catch (e) {
      setErr(String(e));
      setSubmitting(false);
    }
  }

  return (
    <div
      dir="rtl"
      className="ar fade-in"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 22, 49, 0.55)',
        zIndex: 9500,
        display: 'grid',
        placeItems: 'center',
        padding: 20,
      }}
      onClick={onDismiss}
    >
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={submit}
        style={{
          width: '100%',
          maxWidth: 460,
          background: 'var(--surface)',
          border: '3px solid var(--border-strong)',
          borderRadius: 24,
          padding: 28,
          boxShadow: 'var(--sh-brutal)',
          position: 'relative',
        }}
      >
        <button
          type="button"
          aria-label="إغلاق"
          onClick={onDismiss}
          style={{
            position: 'absolute',
            top: 16,
            insetInlineStart: 16,
            background: 'var(--surface-alt)',
            border: '2px solid var(--border)',
            borderRadius: 10,
            width: 36,
            height: 36,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--fg)',
          }}
        >
          {Ico.close}
        </button>

        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: 16,
            background: 'var(--accent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 16,
          }}
        >
          <Mark size={32} color="var(--accent-ink)" />
        </div>

        <h2
          style={{
            fontFamily: 'IBM Plex Sans Arabic',
            fontSize: 22,
            fontWeight: 700,
            margin: '0 0 8px',
            color: 'var(--fg-strong)',
          }}
        >
          شاركنا اسمك وبريدك
        </h2>
        <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--fg-muted)', lineHeight: 1.7, margin: '0 0 20px' }}>
          نحرص على تحسين المساعد لك. بإدخال معلوماتك ستصلك نصائح، تحديثات، ومفاجآت من فريق «مدرسة الاستثمار». لن نشارك بياناتك مع أي طرف ثالث.
        </p>

        <label style={{ display: 'block', marginBottom: 12 }}>
          <span style={{ fontSize: 12, fontWeight: 900, color: 'var(--fg-muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            الاسم
          </span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={80}
            required
            style={{
              display: 'block',
              width: '100%',
              marginTop: 6,
              padding: '12px 14px',
              background: 'var(--surface-alt)',
              border: '2px solid var(--border)',
              borderRadius: 12,
              fontSize: 15,
              fontWeight: 700,
              color: 'var(--fg-strong)',
              fontFamily: 'inherit',
              direction: 'rtl',
            }}
          />
        </label>

        <label style={{ display: 'block', marginBottom: 16 }}>
          <span style={{ fontSize: 12, fontWeight: 900, color: 'var(--fg-muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            البريد الإلكتروني
          </span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            maxLength={160}
            required
            autoComplete="email"
            style={{
              display: 'block',
              width: '100%',
              marginTop: 6,
              padding: '12px 14px',
              background: 'var(--surface-alt)',
              border: '2px solid var(--border)',
              borderRadius: 12,
              fontSize: 15,
              fontWeight: 700,
              color: 'var(--fg-strong)',
              fontFamily: 'inherit',
              direction: 'ltr',
            }}
          />
        </label>

        {err && (
          <div
            role="alert"
            style={{
              marginBottom: 14,
              padding: '10px 14px',
              background: 'var(--accent-2)',
              color: '#fff',
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 800,
            }}
          >
            {err}
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={onDismiss}
            style={{
              padding: '12px 18px',
              background: 'transparent',
              border: '2px solid var(--border)',
              borderRadius: 12,
              fontSize: 13,
              fontWeight: 800,
              cursor: 'pointer',
              color: 'var(--fg)',
              fontFamily: 'inherit',
            }}
          >
            لاحقاً
          </button>
          <button
            type="submit"
            disabled={submitting}
            style={{
              padding: '12px 22px',
              background: 'var(--accent-2)',
              color: '#fff',
              border: 0,
              borderRadius: 12,
              fontSize: 13,
              fontWeight: 900,
              cursor: submitting ? 'wait' : 'pointer',
              fontFamily: 'inherit',
            }}
          >
            {submitting ? '…' : 'أرسل'}
          </button>
        </div>
      </form>
    </div>
  );
}
