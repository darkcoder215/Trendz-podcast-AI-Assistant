/* TRENDZ UI KIT — Buttons, cards, badges, forms, nav, player, etc. */

const { useState, useEffect, useRef } = React;

/* =================== Section wrapper =================== */
window.Section = function Section({ id, eyebrow, title, desc, children, bg = 'var(--bg)', fg = 'var(--fg)', accent = 'var(--accent)', full = false, py = 96 }) {
  return (
    <section id={id} style={{ background: bg, color: fg, padding: `${py}px ${full ? 0 : '8vw'}`, position: 'relative', overflow: 'hidden' }}>
      <div style={{ maxWidth: full ? '100%' : 1360, margin: '0 auto', position: 'relative', zIndex: 2 }}>
        {(eyebrow || title) && (
          <header style={{ display: 'flex', alignItems: 'baseline', gap: 24, marginBottom: 48, flexWrap: 'wrap', borderBottom: `1px solid ${fg === 'var(--fg)' ? 'rgba(255,255,255,0.12)' : 'rgba(39,55,115,0.12)'}`, paddingBottom: 24 }}>
            {eyebrow && <span style={{ fontFamily:'Mont', fontWeight:700, fontSize:13, letterSpacing:'0.18em', textTransform:'uppercase', color: accent }}>{eyebrow}</span>}
            {title && <h2 style={{ fontFamily:'Mont', fontWeight:900, fontSize: 'clamp(32px, 4vw, 56px)', lineHeight: 1, margin: 0, letterSpacing:'-0.02em' }}>{title}</h2>}
            {desc && <p style={{ marginLeft: 'auto', maxWidth: 420, fontSize: 15, opacity: 0.75, lineHeight: 1.55, margin: 0 }}>{desc}</p>}
          </header>
        )}
        {children}
      </div>
    </section>
  );
};

/* =================== Buttons =================== */
window.Btn = function Btn({ variant = 'primary', children, icon, iconRight, size = 'md', onClick, style = {} }) {
  const sizes = { sm: { p:'8px 14px', fs:13 }, md: { p:'12px 22px', fs:14 }, lg: { p:'16px 28px', fs:16 } };
  const s = sizes[size];
  const variants = {
    primary:   { background:'var(--accent)', color:'var(--bg)', border:'2px solid var(--accent)' },
    secondary: { background:'transparent', color:'var(--fg)', border:'2px solid currentColor' },
    sienna:    { background:'var(--sienna)', color:'#fff', border:'2px solid var(--sienna)' },
    ghost:     { background:'transparent', color:'var(--fg)', border:'2px solid transparent' },
    chip:      { background:'rgba(255,255,255,0.1)', color:'var(--fg)', border:'1px solid rgba(255,255,255,0.2)' },
  };
  return (
    <button onClick={onClick} style={{
      ...variants[variant],
      padding: s.p, fontSize: s.fs, fontFamily:'Mont', fontWeight:700,
      borderRadius: 'var(--r-pill)', cursor:'pointer', display:'inline-flex',
      alignItems:'center', gap:10, letterSpacing:0.2,
      transition:'transform .15s ease, box-shadow .15s ease, background .2s',
      ...style
    }}
    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
    >
      {icon && <span style={{display:'inline-flex'}}>{icon}</span>}
      {children}
      {iconRight && <span style={{display:'inline-flex'}}>{iconRight}</span>}
    </button>
  );
};

/* =================== Badges / pills =================== */
window.Badge = function Badge({ children, color = 'var(--accent)', fg = 'var(--bg)' }) {
  return <span style={{
    display:'inline-flex', alignItems:'center', gap:6, padding:'5px 12px',
    borderRadius:'var(--r-pill)', background: color, color: fg,
    fontFamily:'Mont', fontWeight:700, fontSize:11, textTransform:'uppercase', letterSpacing:'0.1em'
  }}>{children}</span>;
};

/* =================== Swatch (for color palette display) =================== */
window.Swatch = function Swatch({ name, hex, rgb, cmyk, fg = '#fff' }) {
  return (
    <div style={{ background: hex, color: fg, padding:22, borderRadius: 'var(--r-md)', minHeight:180, display:'flex', flexDirection:'column', justifyContent:'space-between' }}>
      <div>
        <div style={{ fontFamily:'Mont', fontWeight:700, fontSize:18 }}>{name}</div>
      </div>
      <div style={{ fontSize:11, lineHeight:1.7, opacity:0.95 }}>
        <div style={{fontWeight:700}}>{hex}</div>
        {rgb && <div>RGB {rgb}</div>}
        {cmyk && <div>CMYK {cmyk}</div>}
      </div>
    </div>
  );
};

window.Tint = function Tint({ hex, pct, fg = '#fff', alpha = 1 }) {
  // produce tint by blending with white
  const rgb = hex.replace('#','').match(/.{2}/g).map(h => parseInt(h,16));
  const mix = rgb.map(c => Math.round(c + (255-c) * (1 - alpha))).map(c => c.toString(16).padStart(2,'0')).join('');
  return (
    <div style={{ background: '#'+mix, color: fg, padding:'10px 14px', fontSize:11, fontFamily:'Mont', fontWeight:600 }}>{pct}%</div>
  );
};

/* =================== Card =================== */
window.Card = function Card({ children, style = {}, hover = true, onClick }) {
  return (
    <div onClick={onClick} style={{
      background:'var(--surface)', color:'var(--fg-on-surface)',
      borderRadius:'var(--r-lg)', padding:24, boxShadow:'var(--sh-2)',
      transition:'transform .2s ease, box-shadow .2s ease',
      cursor: onClick ? 'pointer' : 'default',
      ...style
    }}
    onMouseEnter={e => { if (hover) { e.currentTarget.style.transform='translateY(-4px)'; e.currentTarget.style.boxShadow='var(--sh-3)';} }}
    onMouseLeave={e => { if (hover) { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='var(--sh-2)';} }}
    >{children}</div>
  );
};

/* =================== Icons (minimal set) =================== */
window.Icon = {
  play:  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>,
  pause: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M6 4h4v16H6zm8 0h4v16h-4z"/></svg>,
  arrow: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>,
  spotify: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm4.6 14.4c-.2.3-.6.4-.9.2-2.5-1.5-5.6-1.9-9.3-1-.4.1-.7-.1-.8-.5s.1-.7.5-.8c4-.9 7.5-.5 10.3 1.2.3.2.4.6.2.9zm1.2-2.7c-.2.4-.7.5-1.1.2-2.8-1.7-7.1-2.2-10.5-1.2-.4.1-.9-.1-1-.6-.1-.4.1-.9.6-1 3.9-1.2 8.7-.6 11.9 1.4.4.2.5.8.1 1.2zm.1-2.8C14.5 9 8.5 8.8 5.4 9.7c-.5.2-1.1-.1-1.2-.7-.2-.5.1-1.1.7-1.2 3.6-1.1 10.2-.9 14.2 1.5.5.3.6 1 .3 1.5-.3.4-1 .6-1.5.3z"/></svg>,
  youtube: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M23.5 7.2a3 3 0 0 0-2.1-2.1C19.6 4.7 12 4.7 12 4.7s-7.6 0-9.4.4A3 3 0 0 0 .5 7.2C.1 9 .1 12 .1 12s0 3 .4 4.8a3 3 0 0 0 2.1 2.1c1.8.4 9.4.4 9.4.4s7.6 0 9.4-.4a3 3 0 0 0 2.1-2.1c.4-1.8.4-4.8.4-4.8s0-3-.4-4.8zM9.7 15.6V8.4l6.2 3.6-6.2 3.6z"/></svg>,
  apple: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.6 17.3c-.7 1-1.4 2-2.5 2s-1.4-.7-2.6-.7-1.6.7-2.6.7-1.8-1-2.5-2.1c-1.5-2.1-2.6-5.9-1.1-8.5.7-1.3 2.1-2.1 3.5-2.2 1.1 0 2.1.7 2.7.7.6 0 1.9-.9 3.2-.8.6 0 2.1.2 3.1 1.8-3 1.6-2.5 5.9.8 7.1zm-3.2-13C14.9 3.5 15.7 2.6 17 2.5c.1 1.1-.4 2.3-1 3-.7.8-1.7 1.4-2.8 1.3-.1-1.1.5-2.2 1.2-2.9z"/></svg>,
  search: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>,
  close: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>,
  menu: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>,
  headphones: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 14v-2a9 9 0 0 1 18 0v2M3 14a2 2 0 0 1 2-2h1v6H5a2 2 0 0 1-2-2v-2zm18 0a2 2 0 0 0-2-2h-1v6h1a2 2 0 0 0 2-2v-2z"/></svg>,
  mic: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 14a3 3 0 0 0 3-3V5a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.9V21h2v-3.1A7 7 0 0 0 19 11h-2z"/></svg>,
  chart: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M3 21V6m0 15h18M8 17V10m5 7V7m5 10V13"/></svg>,
};

Object.assign(window, {
  Section: window.Section, Btn: window.Btn, Badge: window.Badge,
  Swatch: window.Swatch, Tint: window.Tint, Card: window.Card, Icon: window.Icon
});
