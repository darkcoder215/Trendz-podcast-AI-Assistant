'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Mark } from '../Mark';
import { Ico } from '../Icons';
import { EpisodeFilterChip } from './EpisodeFilterChip';
import { CapturePrompt } from './CapturePrompt';

type Episode = {
  id: string;
  num: number;
  title_ar: string;
  guest_name_ar: string;
  youtube_id: string;
  duration_sec: number | null;
};

type Citation = {
  chunkId: string;
  episodeId: string;
  episodeNum: number;
  episodeTitle: string;
  guestName: string;
  speaker: string | null;
  startSec: number;
  timestamp: string;
  youtubeUrl: string;
  quoteAr: string;
};

type Message =
  | { role: 'user'; text: string }
  | { role: 'assistant'; text: string; citations: Citation[]; answerId: string };

export function AskClient({
  initialQuery,
  initialEpisodeId,
  episodes,
  initialQuotaLeft,
  initialCaptured,
}: {
  initialQuery: string;
  initialEpisodeId: string | null;
  episodes: Episode[];
  initialQuotaLeft: number;
  initialCaptured: boolean;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState<null | number>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedEpisodes, setSelectedEpisodes] = useState<string[]>(
    initialEpisodeId ? [initialEpisodeId] : [],
  );
  const [quotaLeft, setQuotaLeft] = useState(initialQuotaLeft);
  const [captured, setCaptured] = useState(initialCaptured);
  const [showCapture, setShowCapture] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const initialRan = useRef(false);

  useEffect(() => {
    if (!initialRan.current && initialQuery) {
      initialRan.current = true;
      void ask(initialQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuery]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 9e9, behavior: 'smooth' });
  }, [messages, loading]);

  async function ask(q: string) {
    const text = q.trim();
    if (!text || loading != null || quotaLeft <= 0) return;
    setError(null);
    setInput('');
    setMessages((m) => [...m, { role: 'user', text }]);
    setLoading(0);

    const t1 = setTimeout(() => setLoading(1), 500);
    const t2 = setTimeout(() => setLoading(2), 1400);

    try {
      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, episodeFilter: selectedEpisodes }),
      });

      clearTimeout(t1);
      clearTimeout(t2);

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        if (res.status === 429) {
          setError(body.reason ?? 'تم تجاوز الحد المسموح به.');
          if (body.error === 'quota_exceeded') setQuotaLeft(0);
        } else {
          setError('حدث خطأٌ أثناء توليد الإجابة. حاول مرة أخرى.');
        }
        setLoading(null);
        return;
      }

      const data = await res.json();
      setMessages((m) => [
        ...m,
        {
          role: 'assistant',
          text: data.text,
          citations: data.citations ?? [],
          answerId: data.answerId,
        },
      ]);
      setQuotaLeft((q0) => Math.max(0, q0 - 1));
      setLoading(null);
      if (!captured) setShowCapture(true);
    } catch (e) {
      clearTimeout(t1);
      clearTimeout(t2);
      setError(`تعذّر الاتصال بالخادم. ${String(e)}`);
      setLoading(null);
    }
  }

  return (
    <div style={{ paddingTop: 80 }}>
      <div
        className="ar"
        dir="rtl"
        style={{
          maxWidth: 980,
          margin: '0 auto',
          height: 'calc(100vh - 80px)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* header */}
        <div
          style={{
            padding: '18px 20px',
            borderBottom: '2px solid var(--border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 12,
            flexWrap: 'wrap',
          }}
        >
          <div>
            <div style={{ fontSize: 17, fontWeight: 900, color: 'var(--fg-strong)' }}>اسأل المساعد</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--fg-muted)' }}>
              يستطيع المساعد أن يخطئ — راجع المصادر دائماً.
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <EpisodeFilterChip episodes={episodes} value={selectedEpisodes} onChange={setSelectedEpisodes} />
            <span
              style={{
                padding: '8px 14px',
                background: quotaLeft < 3 ? 'var(--accent-2)' : 'var(--accent)',
                color: quotaLeft < 3 ? '#fff' : 'var(--accent-ink)',
                borderRadius: 999,
                fontSize: 12,
                fontWeight: 900,
              }}
            >
              {quotaLeft} سؤال متبقّي
            </span>
          </div>
        </div>

        {/* messages */}
        <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '28px 20px' }}>
          {messages.length === 0 && (
            <EmptyState onPick={ask} />
          )}
          {messages.map((m, i) =>
            m.role === 'user' ? (
              <UserMsg key={i} text={m.text} />
            ) : (
              <AssistantMsg
                key={i}
                answer={m.text}
                citations={m.citations}
                answerId={m.answerId}
              />
            ),
          )}
          {loading != null && <LoadingMsg stage={loading} />}
          {error && (
            <div
              role="alert"
              style={{
                margin: '8px 0 20px',
                padding: '14px 18px',
                background: 'var(--accent-2)',
                color: '#fff',
                borderRadius: 14,
                fontWeight: 800,
                fontSize: 14,
              }}
            >
              {error}
            </div>
          )}
        </div>

        {/* input */}
        <div style={{ padding: '16px 20px', borderTop: '2px solid var(--border)', background: 'var(--bg-alt)' }}>
          <div
            style={{
              background: 'var(--surface)',
              border: '3px solid var(--border-strong)',
              borderRadius: 18,
              padding: 8,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: 'var(--sh-2)',
            }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') ask(input);
              }}
              placeholder={quotaLeft === 0 ? 'لقد بلغتَ الحد الأقصى من الأسئلة' : 'اطرح سؤالك…'}
              disabled={quotaLeft === 0 || loading != null}
              style={{
                flex: 1,
                padding: '14px 18px',
                background: 'transparent',
                border: 0,
                outline: 0,
                color: 'var(--fg-strong)',
                fontSize: 16,
                fontWeight: 700,
                fontFamily: 'IBM Plex Sans Arabic',
                direction: 'rtl',
                textAlign: 'right',
              }}
            />
            <button
              onClick={() => ask(input)}
              disabled={!input.trim() || quotaLeft === 0 || loading != null}
              style={{
                padding: '14px 24px',
                background: input.trim() && quotaLeft > 0 && loading == null ? 'var(--accent-2)' : 'var(--surface-alt)',
                color: input.trim() && quotaLeft > 0 && loading == null ? '#fff' : 'var(--fg-muted)',
                border: 0,
                borderRadius: 14,
                fontWeight: 900,
                fontSize: 14,
                cursor: input.trim() && quotaLeft > 0 && loading == null ? 'pointer' : 'not-allowed',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              إرسال {Ico.send}
            </button>
          </div>
        </div>
      </div>

      {showCapture && (
        <CapturePrompt
          onDone={() => {
            setCaptured(true);
            setShowCapture(false);
          }}
          onDismiss={() => setShowCapture(false)}
        />
      )}
    </div>
  );
}

/* ---------------- Subcomponents ---------------- */

function EmptyState({ onPick }: { onPick: (q: string) => void }) {
  const suggestions = [
    'ما هو الدافع الحقيقي لرواد الأعمال؟',
    'إزاي أبدأ أستثمر بأقل مبلغ؟',
    'إيه سر العائد المركّب؟',
    'كيف أفرّق بين الخوف الصحي والمشلول؟',
  ];
  return (
    <div className="fade-up" style={{ maxWidth: 660, margin: '6vh auto 0', textAlign: 'center' }}>
      <div
        style={{
          width: 84,
          height: 84,
          borderRadius: 20,
          background: 'var(--accent)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 28px',
          boxShadow: 'var(--sh-brutal)',
        }}
      >
        <Mark size={44} color="var(--accent-ink)" />
      </div>
      <h1
        style={{
          fontFamily: 'IBM Plex Sans Arabic',
          fontSize: 'clamp(28px, 5vw, 42px)',
          fontWeight: 700,
          margin: '0 0 16px',
          letterSpacing: '-0.02em',
          color: 'var(--fg-strong)',
        }}
      >
        أهلاً بك في <span style={{ color: 'var(--accent-2)' }}>Madrasa AI</span>
      </h1>
      <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--fg-muted)', lineHeight: 1.7, margin: '0 0 32px' }}>
        مساعدٌ ذكيٌّ مبنيٌّ على حلقات «مدرسة الاستثمار». اسأل أي شيء — وسأستخلص لك الإجابة بمصادر دقيقة.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
        {suggestions.map((s, i) => (
          <button
            key={s}
            onClick={() => onPick(s)}
            style={{
              textAlign: 'right',
              padding: '16px 18px',
              background: 'var(--surface)',
              border: '2px solid var(--border-strong)',
              borderRadius: 16,
              cursor: 'pointer',
              color: 'var(--fg-strong)',
              fontFamily: 'inherit',
              boxShadow: i % 2 ? 'var(--sh-2)' : 'var(--sh-brutal)',
              fontSize: 14.5,
              fontWeight: 700,
              lineHeight: 1.55,
              transition: 'transform .15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

function UserMsg({ text }: { text: string }) {
  return (
    <div className="fade-up" style={{ display: 'flex', gap: 14, marginBottom: 24 }}>
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          background: 'var(--accent-2)',
          color: '#fff',
          fontWeight: 900,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          fontSize: 15,
        }}
      >
        أ
      </div>
      <div
        style={{
          background: 'var(--surface-alt)',
          color: 'var(--fg-strong)',
          padding: '14px 20px',
          borderRadius: '4px 18px 18px 18px',
          fontSize: 16,
          fontWeight: 700,
          lineHeight: 1.6,
          maxWidth: 640,
          border: '2px solid var(--border)',
        }}
      >
        {text}
      </div>
    </div>
  );
}

function LoadingMsg({ stage }: { stage: number }) {
  const stages = ['أبحث في النصوص…', 'أُرتّب أفضل المقاطع…', 'أستخلص إجابتك…'];
  return (
    <div style={{ display: 'flex', gap: 14, marginBottom: 28 }}>
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 12,
          background: 'var(--accent)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Mark size={20} color="var(--accent-ink)" />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, fontWeight: 900, color: 'var(--accent-2)', marginBottom: 14 }}>
          <div style={{ display: 'flex', gap: 5 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-2)', animation: 'pulse-dot 1.4s ease-in-out infinite' }} />
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-2)', animation: 'pulse-dot 1.4s ease-in-out 0.2s infinite' }} />
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-2)', animation: 'pulse-dot 1.4s ease-in-out 0.4s infinite' }} />
          </div>
          {stages[stage]}
        </div>
        <div style={{ display: 'grid', gap: 10 }}>
          <div style={{ height: 14, background: 'var(--surface-alt)', borderRadius: 6, width: '90%' }} />
          <div style={{ height: 14, background: 'var(--surface-alt)', borderRadius: 6, width: '70%' }} />
          <div style={{ height: 14, background: 'var(--surface-alt)', borderRadius: 6, width: '85%' }} />
        </div>
      </div>
    </div>
  );
}

function renderWithBold(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) => {
    if (p.startsWith('**') && p.endsWith('**')) return <mark key={i}>{p.slice(2, -2)}</mark>;
    return <span key={i}>{p}</span>;
  });
}

function stripCitationMarkers(text: string) {
  return text.replace(/\s*\[ep:\d+@\d{1,2}:\d{2}\]/g, '');
}

function AssistantMsg({
  answer,
  citations,
  answerId,
}: {
  answer: string;
  citations: Citation[];
  answerId: string;
}) {
  const [displayed, setDisplayed] = useState('');
  const clean = stripCitationMarkers(answer);

  useEffect(() => {
    setDisplayed('');
    let i = 0;
    const t = setInterval(() => {
      i += 3;
      setDisplayed(clean.slice(0, i));
      if (i >= clean.length) clearInterval(t);
    }, 14);
    return () => clearInterval(t);
  }, [clean]);

  const paragraphs = displayed.split('\n\n');
  const done = displayed.length >= clean.length;

  return (
    <div className="fade-up" style={{ display: 'flex', gap: 14, marginBottom: 32 }}>
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 12,
          background: 'var(--accent)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Mark size={20} color="var(--accent-ink)" />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 12,
            color: 'var(--accent-2)',
            fontWeight: 900,
            marginBottom: 12,
            letterSpacing: '.05em',
            textTransform: 'uppercase',
          }}
        >
          MADRASA AI · استخلصتُ الإجابة من {citations.length} مقاطع
        </div>
        <div style={{ fontSize: 16, fontWeight: 600, lineHeight: 1.95, color: 'var(--fg-strong)' }}>
          {paragraphs.map((p, i) => (
            <p key={i} style={{ margin: '0 0 14px' }}>
              {renderWithBold(p)}
              {i === paragraphs.length - 1 && !done && (
                <span
                  style={{
                    display: 'inline-block',
                    width: 3,
                    height: 20,
                    background: 'var(--accent-2)',
                    marginInlineStart: 2,
                    verticalAlign: 'middle',
                    animation: 'caret 1s step-end infinite',
                  }}
                />
              )}
            </p>
          ))}
        </div>
        {done && citations.length > 0 && (
          <>
            <div
              style={{
                marginTop: 20,
                padding: '16px 18px',
                background: 'var(--surface-alt)',
                border: '2px solid var(--border-strong)',
                borderRadius: 14,
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  color: 'var(--accent-2)',
                  fontWeight: 900,
                  marginBottom: 12,
                  letterSpacing: '.04em',
                  textTransform: 'uppercase',
                }}
              >
                📎 المصادر · اضغط لتفتح اللحظة على يوتيوب
              </div>
              <div style={{ display: 'grid', gap: 10 }}>
                {citations.map((c) => (
                  <a
                    key={c.chunkId}
                    href={c.youtubeUrl || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      textAlign: 'right',
                      padding: '12px 16px',
                      background: 'var(--surface)',
                      color: 'var(--fg-strong)',
                      border: '2px solid var(--border)',
                      borderRadius: 12,
                      cursor: 'pointer',
                      display: 'flex',
                      gap: 14,
                      alignItems: 'flex-start',
                      transition: 'transform .15s, box-shadow .15s',
                      fontFamily: 'inherit',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = 'var(--sh-2)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div
                      style={{
                        padding: '6px 12px',
                        background: 'var(--accent-2)',
                        color: '#fff',
                        borderRadius: 8,
                        fontSize: 12,
                        fontWeight: 900,
                        flexShrink: 0,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 5,
                      }}
                    >
                      {Ico.play} ح{c.episodeNum} · {c.timestamp}
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.7, fontStyle: 'italic' }}>«{c.quoteAr}»</div>
                  </a>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 16, flexWrap: 'wrap' }}>
              <Link
                href={`/share/${answerId}`}
                style={{
                  padding: '10px 16px',
                  background: 'var(--accent)',
                  color: 'var(--accent-ink)',
                  border: '0',
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 900,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  textDecoration: 'none',
                }}
              >
                {Ico.share} شارك البطاقة
              </Link>
              <button
                onClick={() => navigator.clipboard.writeText(clean)}
                style={{
                  padding: '10px 16px',
                  background: 'var(--surface)',
                  border: '2px solid var(--border)',
                  borderRadius: 10,
                  color: 'var(--fg)',
                  fontSize: 13,
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                {Ico.copy} نسخ
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
