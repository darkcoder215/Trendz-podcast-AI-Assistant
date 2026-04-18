'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Ico } from '../Icons';

const SUGGESTIONS = [
  'ما هو الدافع الحقيقي لرواد الأعمال؟',
  'إزاي أبدأ أستثمر بأقل مبلغ؟',
  'إيه سر العائد المركّب؟',
];

export function HomeAskBar() {
  const router = useRouter();
  const [q, setQ] = useState('');

  const submit = () => {
    const trimmed = q.trim();
    const href = trimmed ? `/ask?q=${encodeURIComponent(trimmed)}` : '/ask';
    router.push(href);
  };

  return (
    <>
      <div
        style={{
          maxWidth: 720,
          margin: '0 auto 20px',
          background: 'var(--surface)',
          border: '3px solid var(--border-strong)',
          borderRadius: 20,
          padding: 10,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          boxShadow: 'var(--sh-brutal)',
          flexWrap: 'wrap',
        }}
      >
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') submit();
          }}
          placeholder="اكتب سؤالك هنا…"
          style={{
            flex: 1,
            minWidth: 200,
            padding: '16px 22px',
            background: 'transparent',
            border: 0,
            outline: 0,
            color: 'var(--fg-strong)',
            fontSize: 17,
            fontWeight: 700,
            fontFamily: 'IBM Plex Sans Arabic',
            direction: 'rtl',
            textAlign: 'right',
          }}
        />
        <button
          onClick={submit}
          style={{
            padding: '14px 30px',
            background: 'var(--accent-2)',
            color: '#fff',
            borderRadius: 14,
            fontWeight: 900,
            fontSize: 16,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            border: 0,
            cursor: 'pointer',
          }}
        >
          <span>اسأل الآن</span>
          {Ico.arrowLeft}
        </button>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center', marginTop: 24 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--fg-muted)', alignSelf: 'center' }}>جرّب:</span>
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            onClick={() => router.push(`/ask?q=${encodeURIComponent(s)}`)}
            style={{
              padding: '8px 16px',
              background: 'var(--surface)',
              border: '2px solid var(--border)',
              borderRadius: 999,
              fontSize: 13,
              fontWeight: 700,
              color: 'var(--fg)',
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            {s}
          </button>
        ))}
      </div>
    </>
  );
}
