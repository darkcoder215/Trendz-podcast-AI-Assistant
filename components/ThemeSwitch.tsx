'use client';

import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

export function ThemeSwitch() {
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? window.localStorage.getItem('madrasa-theme') : null;
    if (stored === 'light' || stored === 'dark') setTheme(stored);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      window.localStorage.setItem('madrasa-theme', theme);
    } catch {}
  }, [theme]);

  return (
    <div className="theme-switch" role="radiogroup" aria-label="اختيار المظهر">
      <button
        role="radio"
        aria-checked={theme === 'light'}
        aria-pressed={theme === 'light'}
        onClick={() => setTheme('light')}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </svg>
        فاتح
      </button>
      <button
        role="radio"
        aria-checked={theme === 'dark'}
        aria-pressed={theme === 'dark'}
        onClick={() => setTheme('dark')}
      >
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 14.5A8 8 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5z" /></svg>
        داكن
      </button>
    </div>
  );
}
