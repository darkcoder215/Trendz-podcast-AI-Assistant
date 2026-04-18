'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase/browser';
import { Mark } from '../Mark';

export function AdminLogin({ initialError }: { initialError: string | null }) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState<string | null>(initialError);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    const supabase = supabaseBrowser();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setErr(error.message);
      setLoading(false);
      return;
    }
    // Let the server-side check confirm admin status.
    router.push('/settings');
    router.refresh();
  }

  return (
    <div className="ar" dir="rtl" style={{ maxWidth: 460, margin: '40px auto', padding: 20 }}>
      <form
        onSubmit={submit}
        style={{
          background: 'var(--surface)',
          border: '3px solid var(--border-strong)',
          borderRadius: 24,
          padding: 32,
          boxShadow: 'var(--sh-brutal)',
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 14,
            background: 'var(--accent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 20,
          }}
        >
          <Mark size={28} color="var(--accent-ink)" />
        </div>
        <h1
          style={{
            fontFamily: 'IBM Plex Sans Arabic',
            fontSize: 26,
            fontWeight: 700,
            margin: '0 0 8px',
            color: 'var(--fg-strong)',
          }}
        >
          دخول الإدارة
        </h1>
        <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--fg-muted)', margin: '0 0 24px', lineHeight: 1.7 }}>
          مخصّص لفريق تريندز لرفع الحلقات. الدخول محميّ بكلمة مرور، والصلاحيات تتحقّق على الخادم.
        </p>

        <label style={{ display: 'block', marginBottom: 14 }}>
          <span style={{ fontSize: 11, fontWeight: 900, color: 'var(--fg-muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            البريد
          </span>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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

        <label style={{ display: 'block', marginBottom: 20 }}>
          <span style={{ fontSize: 11, fontWeight: 900, color: 'var(--fg-muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            كلمة المرور
          </span>
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '14px',
            background: 'var(--accent-2)',
            color: '#fff',
            border: 0,
            borderRadius: 12,
            fontSize: 14,
            fontWeight: 900,
            cursor: loading ? 'wait' : 'pointer',
            fontFamily: 'inherit',
          }}
        >
          {loading ? '…' : 'تسجيل الدخول'}
        </button>
      </form>
    </div>
  );
}
