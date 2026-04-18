'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Mark } from './Mark';
import { Ico } from './Icons';

type Active = 'home' | 'ask' | 'leaderboard' | null;

export function Nav({ active = null, quotaLeft }: { active?: Active; quotaLeft?: number | null }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', h);
    h();
    return () => window.removeEventListener('scroll', h);
  }, []);

  const links: { id: Exclude<Active, null>; labelAr: string; href: string }[] = [
    { id: 'home', labelAr: 'الرئيسية', href: '/' },
    { id: 'ask', labelAr: 'اسأل المساعد', href: '/ask' },
    { id: 'leaderboard', labelAr: 'المتصدرون والأسئلة', href: '/leaderboard' },
  ];

  return (
    <nav
      className="ar"
      dir="rtl"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        padding: scrolled ? '12px 20px' : '20px 20px',
        background: scrolled ? 'color-mix(in srgb, var(--bg) 85%, transparent)' : 'transparent',
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(16px)' : 'none',
        borderBottom: scrolled ? '2px solid var(--border)' : '2px solid transparent',
        transition: 'all .25s',
        display: 'flex',
        alignItems: 'center',
        gap: 20,
      }}
    >
      <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--fg)' }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: 'var(--accent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--sh-2)',
          }}
        >
          <Mark size={22} color="var(--accent-ink)" />
        </div>
        <div>
          <div style={{ fontFamily: 'Mont', fontWeight: 900, fontSize: 16, letterSpacing: '-0.01em', lineHeight: 1, color: 'var(--fg-strong)' }}>
            Madrasa <span style={{ color: 'var(--accent-2)' }}>AI</span>
          </div>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--fg-muted)', marginTop: 3 }}>مُقدّم من تريندز</div>
        </div>
      </Link>

      {/* Desktop links */}
      <div className="hide-on-mobile" style={{ display: 'flex', gap: 6, marginRight: 'auto' }}>
        {links.map((l) => (
          <Link
            key={l.id}
            href={l.href}
            style={{
              padding: '10px 18px',
              borderRadius: 999,
              fontSize: 14,
              fontWeight: 800,
              color: active === l.id ? 'var(--accent-ink)' : 'var(--fg)',
              background: active === l.id ? 'var(--accent)' : 'transparent',
              transition: 'all .15s',
            }}
          >
            {l.labelAr}
          </Link>
        ))}
      </div>

      <div className="hide-on-mobile" style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        {typeof quotaLeft === 'number' && (
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
        )}
        <Link
          href="/ask"
          style={{
            padding: '11px 22px',
            background: 'var(--accent-2)',
            color: '#fff',
            borderRadius: 999,
            fontSize: 13,
            fontWeight: 900,
            boxShadow: 'var(--sh-2)',
          }}
        >
          جرّب مجاناً
        </Link>
      </div>

      {/* Mobile menu */}
      <button
        className="show-on-mobile"
        aria-label="فتح القائمة"
        onClick={() => setOpen((s) => !s)}
        style={{
          marginRight: 'auto',
          padding: 10,
          background: 'var(--surface)',
          border: '2px solid var(--border-strong)',
          borderRadius: 12,
          color: 'var(--fg-strong)',
          cursor: 'pointer',
        }}
      >
        {open ? Ico.close : Ico.menu}
      </button>

      {open && (
        <div
          className="show-on-mobile"
          style={{
            position: 'absolute',
            top: '100%',
            right: 12,
            left: 12,
            marginTop: 8,
            background: 'var(--surface)',
            border: '2px solid var(--border-strong)',
            borderRadius: 16,
            padding: 10,
            display: 'grid',
            gap: 4,
            boxShadow: 'var(--sh-3)',
          }}
        >
          {links.map((l) => (
            <Link
              key={l.id}
              href={l.href}
              onClick={() => setOpen(false)}
              style={{
                padding: '12px 14px',
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 800,
                color: active === l.id ? 'var(--accent-ink)' : 'var(--fg)',
                background: active === l.id ? 'var(--accent)' : 'transparent',
              }}
            >
              {l.labelAr}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
