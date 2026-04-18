'use client';

import { useEffect, useRef, useState } from 'react';
import { Ico } from '../Icons';

type Episode = {
  id: string;
  num: number;
  title_ar: string;
  guest_name_ar: string;
};

export function EpisodeFilterChip({
  episodes,
  value,
  onChange,
}: {
  episodes: Episode[];
  value: string[];
  onChange: (next: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const count = value.length;
  const label = count === 0 ? 'جميع الحلقات' : `${count} حلقة محددة`;

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen((s) => !s)}
        style={{
          padding: '8px 14px',
          background: count > 0 ? 'var(--accent-2)' : 'var(--surface)',
          color: count > 0 ? '#fff' : 'var(--fg)',
          border: '2px solid ' + (count > 0 ? 'var(--accent-2)' : 'var(--border-strong)'),
          borderRadius: 999,
          fontSize: 12,
          fontWeight: 900,
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          fontFamily: 'inherit',
        }}
      >
        {Ico.filter} {label}
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            marginTop: 8,
            insetInlineEnd: 0,
            minWidth: 320,
            maxHeight: 400,
            overflowY: 'auto',
            background: 'var(--surface)',
            border: '2px solid var(--border-strong)',
            borderRadius: 16,
            padding: 8,
            boxShadow: 'var(--sh-3)',
            zIndex: 40,
          }}
        >
          <div
            style={{
              padding: '8px 12px',
              fontSize: 11,
              fontWeight: 900,
              color: 'var(--fg-muted)',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <span>حدّد الحلقات</span>
            {count > 0 && (
              <button
                onClick={() => onChange([])}
                style={{ background: 'transparent', border: 0, color: 'var(--accent-2)', fontWeight: 900, fontSize: 11, cursor: 'pointer' }}
              >
                مسح
              </button>
            )}
          </div>
          {episodes.length === 0 ? (
            <div style={{ padding: 16, fontSize: 13, color: 'var(--fg-muted)', textAlign: 'center' }}>لا توجد حلقات بعد.</div>
          ) : (
            episodes.map((ep) => {
              const on = value.includes(ep.id);
              return (
                <button
                  key={ep.id}
                  onClick={() => {
                    onChange(on ? value.filter((x) => x !== ep.id) : [...value, ep.id]);
                  }}
                  style={{
                    width: '100%',
                    textAlign: 'right',
                    padding: '10px 12px',
                    background: on ? 'var(--accent)' : 'transparent',
                    color: on ? 'var(--accent-ink)' : 'var(--fg)',
                    border: 0,
                    borderRadius: 10,
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 10,
                    fontFamily: 'inherit',
                  }}
                >
                  <span style={{ minWidth: 0, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    ح{ep.num} · {ep.title_ar}
                  </span>
                  {on && Ico.check}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
