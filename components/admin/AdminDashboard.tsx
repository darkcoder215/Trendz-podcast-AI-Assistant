'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase/browser';
import { Ico } from '../Icons';
import { EpisodeUpload } from './EpisodeUpload';

type Episode = {
  id: string;
  num: number;
  title_ar: string;
  guest_name_ar: string;
  youtube_url: string;
  guest_photo_url: string | null;
  created_at: string;
};

export function AdminDashboard({ episodes, adminEmail }: { episodes: Episode[]; adminEmail: string }) {
  const router = useRouter();
  const [tab, setTab] = useState<'episodes' | 'upload'>('upload');

  async function logout() {
    await supabaseBrowser().auth.signOut();
    router.push('/settings/login');
    router.refresh();
  }

  return (
    <div className="ar" dir="rtl" style={{ maxWidth: 1100, margin: '0 auto', padding: 20 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 28,
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div>
          <div
            style={{
              display: 'inline-block',
              padding: '6px 14px',
              background: 'var(--accent-4)',
              color: '#0f1631',
              borderRadius: 999,
              fontSize: 11,
              fontWeight: 900,
              marginBottom: 12,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
            }}
          >
            🔐 لوحة الإدارة
          </div>
          <h1
            style={{
              fontFamily: 'IBM Plex Sans Arabic',
              fontSize: 36,
              fontWeight: 700,
              margin: 0,
              color: 'var(--fg-strong)',
              letterSpacing: '-0.02em',
            }}
          >
            إدارة الحلقات
          </h1>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--fg-muted)', marginTop: 8 }}>
            مسجّل كـ <span style={{ color: 'var(--accent-2)' }}>{adminEmail}</span>
          </div>
        </div>
        <button
          onClick={logout}
          style={{
            padding: '10px 18px',
            background: 'var(--surface)',
            border: '2px solid var(--border-strong)',
            borderRadius: 12,
            fontSize: 13,
            fontWeight: 900,
            cursor: 'pointer',
            color: 'var(--fg-strong)',
            fontFamily: 'inherit',
          }}
        >
          تسجيل الخروج
        </button>
      </div>

      <div
        style={{
          display: 'inline-flex',
          padding: 4,
          background: 'var(--surface)',
          border: '2px solid var(--border-strong)',
          borderRadius: 14,
          marginBottom: 24,
        }}
      >
        {(
          [
            ['upload', 'رفع حلقة جديدة'],
            ['episodes', `الحلقات المرفوعة (${episodes.length})`],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            style={{
              padding: '10px 18px',
              background: tab === id ? 'var(--accent)' : 'transparent',
              color: tab === id ? 'var(--accent-ink)' : 'var(--fg)',
              border: 0,
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 900,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'upload' ? <EpisodeUpload onDone={() => router.refresh()} /> : <EpisodeList episodes={episodes} />}
    </div>
  );
}

function EpisodeList({ episodes }: { episodes: Episode[] }) {
  if (episodes.length === 0) {
    return (
      <div
        style={{
          padding: 40,
          background: 'var(--surface)',
          border: '3px dashed var(--border)',
          borderRadius: 22,
          textAlign: 'center',
          color: 'var(--fg-muted)',
          fontWeight: 700,
        }}
      >
        لم تقم برفع أي حلقة بعد.
      </div>
    );
  }
  return (
    <div
      style={{
        background: 'var(--surface)',
        border: '3px solid var(--border-strong)',
        borderRadius: 20,
        overflow: 'hidden',
      }}
    >
      {episodes.map((ep, i) => (
        <div
          key={ep.id}
          style={{
            padding: '18px 20px',
            display: 'grid',
            gridTemplateColumns: '70px 1fr auto',
            gap: 16,
            alignItems: 'center',
            borderBottom: i === episodes.length - 1 ? 0 : '2px solid var(--border)',
          }}
        >
          <div
            style={{
              fontFamily: 'Mont',
              fontWeight: 900,
              fontSize: 24,
              color: 'var(--accent-2)',
              textAlign: 'center',
              background: 'var(--surface-alt)',
              borderRadius: 12,
              padding: '10px 0',
            }}
          >
            #{ep.num}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 900, color: 'var(--fg-strong)', marginBottom: 4 }}>{ep.title_ar}</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--fg-muted)' }}>مع {ep.guest_name_ar}</div>
          </div>
          <a
            href={ep.youtube_url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: '8px 14px',
              background: 'var(--accent)',
              color: 'var(--accent-ink)',
              borderRadius: 999,
              fontSize: 12,
              fontWeight: 900,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            يوتيوب {Ico.arrowLeft}
          </a>
        </div>
      ))}
    </div>
  );
}
