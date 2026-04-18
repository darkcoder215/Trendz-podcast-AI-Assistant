/* Madrasa AI — shared chrome (nav, footer, shared components) */

const { useState, useEffect, useRef } = React;

window.Mark = function Mark({ size=24, color='currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" style={{ display:'block' }}>
      <rect x="6"  y="24" width="6" height="18" fill={color}/>
      <rect x="15" y="18" width="6" height="24" fill={color}/>
      <rect x="24" y="10" width="6" height="32" fill={color}/>
      <rect x="33" y="4"  width="6" height="38" fill={color}/>
      <circle cx="9"  cy="20" r="3" fill={color}/>
      <circle cx="36" cy="44" r="3" fill={color}/>
    </svg>
  );
};

window.Ico = {
  send:<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M2 21l21-9L2 3v7l15 2-15 2z"/></svg>,
  spark:<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 7.6L22 12l-7.6 2.4L12 22l-2.4-7.6L2 12l7.6-2.4z"/></svg>,
  play:<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>,
  pause:<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M6 4h4v16H6zm8 0h4v16h-4z"/></svg>,
  clock:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2" strokeLinecap="round"/></svg>,
  flame:<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2s4 4 4 8a4 4 0 0 1-8 0c0-1.5.5-3 1.5-4C8 7 7 5.5 7 5.5S5 8 5 12a7 7 0 0 0 14 0c0-5-7-10-7-10z"/></svg>,
  bookmark:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 2h12v20l-6-4-6 4z"/></svg>,
  copy:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M4 16V4h12"/></svg>,
  trophy:<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M7 4h10v3h3v4a4 4 0 0 1-4 4h-.5A5 5 0 0 1 13 17.9V20h3v2H8v-2h3v-2.1A5 5 0 0 1 7.5 15H7a4 4 0 0 1-4-4V7h3V4zm0 5H5v2a2 2 0 0 0 2 2V9zm10 0v4a2 2 0 0 0 2-2V9h-2z"/></svg>,
  lock:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 1 1 8 0v3"/></svg>,
  arrowLeft:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>,
  arrowRight:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>,
  check:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7"/></svg>,
  plus:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>,
  menu:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M4 6h16M4 12h16M4 18h16"/></svg>,
  close:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>,
};

window.Nav = function Nav({ active='home' }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', h); h();
    return () => window.removeEventListener('scroll', h);
  }, []);
  const links = [
    { id:'home', labelAr:'الرئيسية', href:'Madrasa AI - Home.html' },
    { id:'ask',  labelAr:'اسأل المساعد', href:'Madrasa AI - Ask.html' },
    { id:'leaderboard', labelAr:'المتصدرون والأسئلة', href:'Madrasa AI - Leaderboard.html' },
  ];
  return (
    <nav className="ar" dir="rtl" style={{
      position:'fixed', top:0, left:0, right:0, zIndex:50,
      padding: scrolled ? '12px 40px' : '20px 40px',
      background: scrolled ? 'color-mix(in srgb, var(--bg) 85%, transparent)' : 'transparent',
      backdropFilter: scrolled ? 'blur(16px)' : 'none',
      WebkitBackdropFilter: scrolled ? 'blur(16px)' : 'none',
      borderBottom: scrolled ? '2px solid var(--border)' : '2px solid transparent',
      transition:'all .25s', display:'flex', alignItems:'center', gap:32
    }}>
      <a href="Madrasa AI - Home.html" style={{ display:'flex', alignItems:'center', gap:10, color:'var(--fg)' }}>
        <div style={{ width:40, height:40, borderRadius:10, background:'var(--accent)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'var(--sh-2)' }}>
          <Mark size={22} color="var(--accent-ink)"/>
        </div>
        <div>
          <div style={{ fontFamily:'Mont', fontWeight:900, fontSize:16, letterSpacing:'-0.01em', lineHeight:1, color:'var(--fg-strong)' }}>Madrasa <span style={{color:'var(--accent-2)'}}>AI</span></div>
          <div style={{ fontSize:10, fontWeight:700, color:'var(--fg-muted)', marginTop:3 }}>مُقدّم من تريندز</div>
        </div>
      </a>
      <div style={{ display:'flex', gap:6, marginRight:'auto' }}>
        {links.map(l => (
          <a key={l.id} href={l.href} style={{
            padding:'10px 18px', borderRadius:999, fontSize:14, fontWeight:800,
            color: active === l.id ? 'var(--accent-ink)' : 'var(--fg)',
            background: active === l.id ? 'var(--accent)' : 'transparent',
            transition:'all .15s'
          }}>{l.labelAr}</a>
        ))}
      </div>
      <div style={{ display:'flex', gap:12, alignItems:'center' }}>
        <a href="Madrasa AI - Ask.html" style={{ fontSize:13, color:'var(--fg-muted)', fontWeight:700 }}>تسجيل الدخول</a>
        <a href="Madrasa AI - Ask.html" style={{ padding:'11px 22px', background:'var(--accent-2)', color:'#fff', borderRadius:999, fontSize:13, fontWeight:900, boxShadow:'var(--sh-2)' }}>
          جرّب مجاناً
        </a>
      </div>
    </nav>
  );
};

window.Footer = function Footer() {
  return (
    <footer className="ar" dir="rtl" style={{ padding:'72px 40px 40px', borderTop:'2px solid var(--border)', background:'var(--bg-alt)', color:'var(--fg)' }}>
      <div style={{ maxWidth:1280, margin:'0 auto', display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr', gap:40 }}>
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
            <div style={{ width:44, height:44, borderRadius:10, background:'var(--accent)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Mark size={24} color="var(--accent-ink)"/>
            </div>
            <div style={{ fontFamily:'Mont', fontWeight:900, fontSize:20, color:'var(--fg-strong)' }}>Madrasa <span style={{color:'var(--accent-2)'}}>AI</span></div>
          </div>
          <p style={{ fontSize:15, lineHeight:1.8, fontWeight:600, color:'var(--fg-muted)', maxWidth:380 }}>
            مساعدٌ ذكيٌّ مبنيٌّ على كل حلقات بودكاست «مدرسة الاستثمار». اسأل، افهم، طبّق — مع مصادرَ دقيقة لكل إجابة.
          </p>
        </div>
        <FooterCol title="المنتج" links={['اسأل المساعد','الحلقات','المتصدرون','الشارات']}/>
        <FooterCol title="الشركة" links={['عن تريندز','فريقنا','الشراكات','اتصل بنا']}/>
        <FooterCol title="قانوني" links={['الخصوصية','الشروط','الاستخدام','الأمان']}/>
      </div>
      <div style={{ maxWidth:1280, margin:'48px auto 0', paddingTop:24, borderTop:'2px solid var(--border)', display:'flex', justifyContent:'space-between', fontSize:13, fontWeight:700, color:'var(--fg-muted)' }}>
        <div>© ٢٠٢٦ مدرسة الاستثمار. جميع الحقوق محفوظة.</div>
        <div>صُنع بـ ❤ في الإمارات</div>
      </div>
    </footer>
  );
};

function FooterCol({ title, links }) {
  return (
    <div>
      <div style={{ fontSize:13, fontWeight:900, marginBottom:18, color:'var(--accent-2)', letterSpacing:'0.05em', textTransform:'uppercase' }}>{title}</div>
      <div style={{ display:'grid', gap:12 }}>
        {links.map(l => <a key={l} style={{ fontSize:14, fontWeight:700, color:'var(--fg-muted)' }}>{l}</a>)}
      </div>
    </div>
  );
}

/* Background decoration — soft accent blobs */
window.BgPattern = function BgPattern({ opacity=0.5 }) {
  return (
    <div style={{ position:'absolute', inset:0, pointerEvents:'none', opacity, zIndex:0,
      backgroundImage: `
        radial-gradient(circle at 20% 30%, color-mix(in srgb, var(--accent-3) 35%, transparent) 0%, transparent 45%),
        radial-gradient(circle at 80% 70%, color-mix(in srgb, var(--accent-2) 25%, transparent) 0%, transparent 45%)`,
    }}/>
  );
};
