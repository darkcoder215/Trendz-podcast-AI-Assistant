'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Ico } from '../Icons';

export function SharePanel({
  answerId,
  guestName,
  episodeNum,
  episodeTitle,
  youtubeUrl,
}: {
  answerId: string;
  guestName: string;
  episodeNum: number | null;
  episodeTitle: string | null;
  youtubeUrl: string;
}) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [busy, setBusy] = useState(false);

  const imgSrc = `/api/share-card/${answerId}`;

  const shareText = useMemo(() => {
    const title = episodeNum ? `حلقة ${episodeNum}` : 'هذه الحلقة';
    return `تعلّمت شيئاً جديداً من ${guestName} في ${title} من بودكاست Madrasa AI — شكراً على هذه القيمة! 🎙️\n\n${youtubeUrl || ''}`;
  }, [guestName, episodeNum, youtubeUrl]);

  const linkedinUrl = useMemo(() => {
    const siteUrl = typeof window !== 'undefined'
      ? `${window.location.origin}/share/${answerId}?utm=share-card`
      : `https://madrasa.trendz.app/share/${answerId}`;
    const u = new URL('https://www.linkedin.com/sharing/share-offsite/');
    u.searchParams.set('url', siteUrl);
    return u.toString();
  }, [answerId]);

  async function download() {
    setBusy(true);
    try {
      const res = await fetch(imgSrc);
      const blob = await res.blob();
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `madrasa-ai-${answerId}.png`;
      link.click();
      URL.revokeObjectURL(link.href);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="ar" dir="rtl" style={{ maxWidth: 1100, margin: '0 auto', padding: 20 }}>
      <div style={{ marginBottom: 24 }}>
        <Link href="/ask" style={{ fontSize: 13, fontWeight: 800, color: 'var(--accent-2)', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          {Ico.arrowRight} العودة للمحادثة
        </Link>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 360px)',
          gap: 32,
        }}
      >
        {/* Preview */}
        <div
          style={{
            position: 'relative',
            aspectRatio: '1/1',
            background: 'var(--surface-alt)',
            border: '3px solid var(--border-strong)',
            borderRadius: 24,
            overflow: 'hidden',
            boxShadow: 'var(--sh-brutal)',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imgSrc}
            alt="بطاقة المشاركة"
            onLoad={() => setImgLoaded(true)}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              opacity: imgLoaded ? 1 : 0,
              transition: 'opacity .3s',
            }}
          />
          {!imgLoaded && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'grid',
                placeItems: 'center',
                color: 'var(--fg-muted)',
                fontWeight: 800,
              }}
            >
              جاري إنشاء البطاقة…
            </div>
          )}
        </div>

        {/* Actions */}
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
            بطاقة جاهزة للمشاركة
          </div>
          <h1
            style={{
              fontFamily: 'IBM Plex Sans Arabic',
              fontSize: 30,
              fontWeight: 700,
              margin: '0 0 16px',
              color: 'var(--fg-strong)',
              letterSpacing: '-0.02em',
            }}
          >
            شارك هذه الرؤية على لينكدإن
          </h1>
          <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--fg-muted)', lineHeight: 1.8, margin: '0 0 20px' }}>
            نزّل البطاقة بجودة عالية، وأرفقها مع منشورك. لا تنسَ <strong>ذكر الضيف {guestName}</strong> — سيسعده أن يعرف أنك استفدت.
          </p>

          {episodeTitle && (
            <div
              style={{
                padding: '14px 16px',
                background: 'var(--surface)',
                border: '2px solid var(--border)',
                borderRadius: 14,
                marginBottom: 20,
              }}
            >
              <div style={{ fontSize: 12, fontWeight: 900, color: 'var(--accent-2)', marginBottom: 4, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                المصدر
              </div>
              <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--fg-strong)' }}>
                حلقة {episodeNum} · {episodeTitle}
              </div>
            </div>
          )}

          <div
            style={{
              padding: '14px 16px',
              background: 'var(--surface-alt)',
              border: '2px solid var(--border)',
              borderRadius: 14,
              marginBottom: 20,
              fontSize: 14,
              fontWeight: 600,
              lineHeight: 1.8,
              whiteSpace: 'pre-wrap',
            }}
          >
            {shareText}
          </div>

          <div style={{ display: 'grid', gap: 10 }}>
            <button
              onClick={download}
              disabled={busy}
              style={{
                padding: '14px 20px',
                background: 'var(--accent-2)',
                color: '#fff',
                border: 0,
                borderRadius: 14,
                fontSize: 14,
                fontWeight: 900,
                cursor: busy ? 'wait' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                fontFamily: 'inherit',
              }}
            >
              {Ico.download} تنزيل البطاقة (PNG)
            </button>
            <a
              href={linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: '14px 20px',
                background: 'var(--accent)',
                color: 'var(--accent-ink)',
                border: 0,
                borderRadius: 14,
                fontSize: 14,
                fontWeight: 900,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                textDecoration: 'none',
              }}
            >
              {Ico.share} مشاركة على لينكدإن
            </a>
            <button
              onClick={() => navigator.clipboard.writeText(shareText)}
              style={{
                padding: '12px 20px',
                background: 'var(--surface)',
                border: '2px solid var(--border-strong)',
                borderRadius: 14,
                fontSize: 13,
                fontWeight: 800,
                cursor: 'pointer',
                color: 'var(--fg-strong)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                fontFamily: 'inherit',
              }}
            >
              {Ico.copy} نسخ النص
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 880px) {
          div[style*="grid-template-columns: minmax(0, 1fr) minmax(0, 360px)"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
