/* Applications — podcast cards, player, newsletter, social cards */

const { useState, useEffect, useRef } = React;

/* =============== PODCAST PLAYER =============== */
window.PodcastPlayer = function PodcastPlayer({ episode }) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(32);
  useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => setProgress(p => (p >= 100 ? 0 : p + 0.5)), 150);
    return () => clearInterval(t);
  }, [playing]);

  return (
    <div style={{
      background:'linear-gradient(135deg, var(--delft-blue), #1d2a5a)',
      color:'#fff', borderRadius:'var(--r-lg)', padding:28, display:'grid',
      gridTemplateColumns:'120px 1fr', gap:24, position:'relative', overflow:'hidden',
      boxShadow:'var(--sh-3)'
    }}>
      <div style={{ position:'absolute', top:-30, right:-30, width:140, height:140, borderRadius:'50%', background:'rgba(139,216,189,0.15)'}}/>
      <div style={{
        width:120, height:120, borderRadius:'var(--r-md)',
        background:'var(--tiffany)', display:'flex', alignItems:'center', justifyContent:'center',
        position:'relative', zIndex:1
      }}>
        <LogoMark color="#273773" size={60}/>
      </div>
      <div style={{ position:'relative', zIndex:1 }}>
        <div style={{ display:'flex', gap:8, marginBottom:8, alignItems:'center' }}>
          <Badge color="var(--sienna)" fg="#fff">EP {episode.num}</Badge>
          <span style={{ fontSize:12, opacity:0.7 }}>{episode.duration}</span>
        </div>
        <h3 className="ar" style={{ margin:'4px 0 4px', fontSize:20, fontWeight:700, lineHeight:1.3 }}>{episode.titleAr}</h3>
        <div style={{ fontSize:13, opacity:0.7, marginBottom:16 }} className="ar">{episode.guestAr}</div>

        {/* progress */}
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <button onClick={() => setPlaying(p => !p)} style={{
            width:44, height:44, borderRadius:'50%', border:'none',
            background:'var(--tiffany)', color:'#273773', cursor:'pointer',
            display:'flex', alignItems:'center', justifyContent:'center'
          }}>
            {playing ? Icon.pause : Icon.play}
          </button>
          <div style={{ flex:1 }}>
            <div style={{ height:4, background:'rgba(255,255,255,0.15)', borderRadius:2, position:'relative' }}>
              <div style={{ position:'absolute', left:0, top:0, height:'100%', width:`${progress}%`, background:'var(--tiffany)', borderRadius:2 }}/>
              <div style={{ position:'absolute', left:`${progress}%`, top:'50%', transform:'translate(-50%, -50%)', width:12, height:12, borderRadius:'50%', background:'#fff' }}/>
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, marginTop:6, opacity:0.6 }}>
              <span>{Math.floor(progress/100 * 47)}:{String(Math.floor((progress/100 * 47 * 60) % 60)).padStart(2,'0')}</span>
              <span>47:18</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* =============== EPISODE CARD (repository grid) =============== */
window.EpisodeCard = function EpisodeCard({ ep, variant = 'default' }) {
  const bgs = ['#273773', '#8bd8bd', '#f96e46', '#efc846'];
  const bg = bgs[ep.num % bgs.length];
  const fg = bg === '#efc846' || bg === '#8bd8bd' ? '#273773' : '#fff';
  return (
    <div style={{
      background: bg, color: fg, borderRadius:'var(--r-md)', overflow:'hidden',
      position:'relative', aspectRatio: '3/4', display:'flex', flexDirection:'column',
      justifyContent:'space-between', padding:20, cursor:'pointer',
      transition:'transform .2s, box-shadow .2s'
    }}
    onMouseEnter={e => { e.currentTarget.style.transform='translateY(-6px)'; e.currentTarget.style.boxShadow='var(--sh-3)';}}
    onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='none';}}
    >
      {/* bg decor */}
      <div style={{ position:'absolute', top:-20, right:-20, width:80, height:80, borderRadius:'50%', background:'rgba(255,255,255,0.1)'}}/>
      <div style={{ position:'absolute', bottom:20, left:-10, width:50, height:10, background:'currentColor', opacity:0.15, transform:'rotate(-25deg)', borderRadius:5 }}/>

      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
        <div style={{ fontFamily:'Mont', fontWeight:900, fontSize:36, lineHeight:1, opacity:0.95 }}>
          {String(ep.num).padStart(2,'0')}
        </div>
        <TrendzMark color={fg} size={12}/>
      </div>

      <div>
        <h3 className="ar" style={{ fontSize:20, fontWeight:700, lineHeight:1.3, margin:'0 0 8px' }}>{ep.titleAr}</h3>
        <div className="ar" style={{ fontSize:13, opacity:0.75 }}>{ep.guestAr}</div>
        <div style={{ display:'flex', alignItems:'center', gap:8, marginTop:14, fontSize:11, opacity:0.8 }}>
          {Icon.play} {ep.duration}
        </div>
      </div>
    </div>
  );
};

/* =============== SOCIAL CARDS =============== */
window.SocialCard = function SocialCard({ variant }) {
  if (variant === 'guest') {
    return (
      <div style={{ aspectRatio: '1', background:'var(--delft-blue)', color:'#fff', borderRadius:'var(--r-md)', padding:24, position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', bottom:-10, right:-10, opacity:0.3 }}>
          <BrandPattern color="#8bd8bd" opacity={0.3}/>
        </div>
        <div style={{ display:'flex', gap:10, alignItems:'center', marginBottom:14 }}>
          <Logo size={50} color="#fff" accent="#8bd8bd"/>
          <div style={{ width:1, height:32, background:'#fff', opacity:0.3 }}/>
          <TrendzMark color="#8bd8bd" size={14}/>
        </div>
        <div className="ar" style={{ fontSize:18, fontWeight:700, marginBottom:8 }}>بودكاست مع منصور الدرعي</div>
        <div style={{ position:'absolute', bottom:24, left:24, right:24, height:'45%',
          background: 'linear-gradient(135deg, var(--tiffany), var(--delft-blue-75))',
          borderRadius:'var(--r-sm)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, opacity:0.8
        }}>[ Guest photo ]</div>
      </div>
    );
  }
  if (variant === 'lesson') {
    return (
      <div style={{ aspectRatio: '1', background:'var(--tiffany)', color:'var(--delft-blue)', borderRadius:'var(--r-md)', padding:28, position:'relative', overflow:'hidden', display:'flex', flexDirection:'column', justifyContent:'space-between' }}>
        <div style={{ display:'flex', gap:10, alignItems:'center' }}>
          <Logo size={40} color="var(--delft-blue)" accent="var(--delft-blue)"/>
          <div style={{ width:1, height:28, background:'var(--delft-blue)', opacity:0.3 }}/>
          <TrendzMark color="var(--delft-blue)" size={12}/>
        </div>
        <div style={{ position:'relative' }}>
          <div style={{ fontFamily:'Mont', fontWeight:900, fontSize:96, lineHeight:0.9, color:'var(--delft-blue)', letterSpacing:'-0.04em' }}>8</div>
          <div className="ar" style={{ position:'absolute', bottom:20, right:0, fontSize:20, fontWeight:700 }}>دروس<br/>أساسية</div>
        </div>
        <div className="ar" style={{ fontSize:14, fontWeight:600 }}>في إدارة الأزمات لكل رائد أعمال</div>
      </div>
    );
  }
  if (variant === 'quote') {
    return (
      <div style={{ aspectRatio: '1', background:'var(--delft-blue)', color:'#fff', borderRadius:'var(--r-md)', padding:32, position:'relative', overflow:'hidden', display:'flex', flexDirection:'column', justifyContent:'space-between' }}>
        <div style={{ fontFamily:'Mont', fontWeight:900, fontSize:80, lineHeight:0.5, color:'var(--tiffany)', opacity:0.6 }}>"</div>
        <div className="ar" style={{ fontSize:22, fontWeight:700, lineHeight:1.4, textAlign:'right' }}>
          الخوف هو المحرك وليس الشغف
        </div>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div className="ar" style={{ fontSize:12, opacity:0.7 }}>— صلاح أبو المجد</div>
          <Logo size={36} color="#fff" accent="var(--tiffany)"/>
        </div>
      </div>
    );
  }
  return null;
};

/* =============== NEWSLETTER =============== */
window.NewsletterPreview = function NewsletterPreview() {
  return (
    <div style={{ background:'#fff', color:'var(--delft-blue)', borderRadius:'var(--r-md)', overflow:'hidden', boxShadow:'var(--sh-3)', maxWidth:560, margin:'0 auto' }}>
      {/* email header */}
      <div style={{ padding:'12px 20px', background:'#f5f6f8', fontSize:11, color:'#666', borderBottom:'1px solid #eee', display:'flex', justifyContent:'space-between' }}>
        <span><b>TRENDZ Weekly</b> — Issue #42</span>
        <span>Apr 18, 2026</span>
      </div>
      <div style={{ background:'var(--delft-blue)', color:'#fff', padding:'36px 32px', position:'relative' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
          <Logo size={60} color="#fff" accent="var(--tiffany)"/>
          <TrendzMark color="var(--tiffany)" size={14}/>
        </div>
        <div style={{ fontFamily:'Mont', fontSize:12, color:'var(--tiffany)', letterSpacing:'0.18em', textTransform:'uppercase', fontWeight:700, marginBottom:10 }}>This week</div>
        <h2 style={{ fontSize:34, fontWeight:900, margin:0, lineHeight:1.05, letterSpacing:'-0.02em' }}>Fear, not passion,<br/>drives founders.</h2>
      </div>
      <div style={{ padding:'32px', fontSize:14, lineHeight:1.7, color:'#333' }}>
        <p style={{marginTop:0}}>In episode 29, Salah Abu Al-Majd unpacks why most first-time entrepreneurs misread their own motivation — and how to turn fear into fuel instead of friction.</p>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, margin:'20px 0' }}>
          <div style={{ background:'var(--rose)', padding:16, borderRadius:'var(--r-sm)' }}>
            <div style={{ fontSize:10, color:'var(--sienna)', fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase'}}>Key idea</div>
            <div style={{ fontSize:13, fontWeight:600, marginTop:4, color:'var(--delft-blue)'}}>Reframe risk as information</div>
          </div>
          <div style={{ background:'var(--tiffany-20)', padding:16, borderRadius:'var(--r-sm)' }}>
            <div style={{ fontSize:10, color:'var(--delft-blue)', fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase'}}>Chart</div>
            <div style={{ display:'flex', gap:3, alignItems:'end', height:34, marginTop:6 }}>
              {[20,35,28,60,48,72].map((h,i) => <div key={i} style={{flex:1, height:h+'%', background:'var(--delft-blue)', borderRadius:2}}/>)}
            </div>
          </div>
        </div>
        <Btn variant="primary" size="sm" style={{ background:'var(--delft-blue)', borderColor:'var(--delft-blue)', color:'#fff'}}>Listen to episode →</Btn>
      </div>
    </div>
  );
};

/* =============== PHONE MOCK =============== */
window.PhoneMock = function PhoneMock({ children }) {
  return (
    <div style={{ width:260, aspectRatio: '9/19.5', background:'#111', borderRadius:40, padding:8, boxShadow:'var(--sh-3)', flexShrink:0 }}>
      <div style={{ width:'100%', height:'100%', borderRadius:32, overflow:'hidden', background:'var(--delft-blue)', position:'relative' }}>
        <div style={{ position:'absolute', top:8, left:'50%', transform:'translateX(-50%)', width:80, height:22, background:'#000', borderRadius:12, zIndex:10 }}/>
        {children}
      </div>
    </div>
  );
};

/* =============== WEBSITE HERO MOCK =============== */
window.WebsiteHero = function WebsiteHero() {
  return (
    <div style={{ borderRadius:'var(--r-lg)', overflow:'hidden', boxShadow:'var(--sh-3)', background:'var(--delft-blue)', color:'#fff' }}>
      {/* browser chrome */}
      <div style={{ background:'#1a2456', padding:'10px 16px', display:'flex', alignItems:'center', gap:10, fontSize:12, color:'rgba(255,255,255,0.5)' }}>
        <div style={{ display:'flex', gap:6 }}>
          {['#ff5f57','#febc2e','#28c840'].map(c => <div key={c} style={{width:10, height:10, borderRadius:'50%', background:c}}/>)}
        </div>
        <div style={{ background:'rgba(255,255,255,0.08)', padding:'4px 12px', borderRadius:6, flex:1, maxWidth:380, marginLeft:20 }}>
          trendz.fm/investment-school
        </div>
      </div>
      <div style={{ padding:'32px 48px 0' }}>
        {/* nav */}
        <nav style={{ display:'flex', alignItems:'center', gap:24, fontFamily:'Mont', fontWeight:600, fontSize:13, marginBottom:48 }}>
          <Logo size={60} color="#fff" accent="var(--tiffany)"/>
          <div style={{ display:'flex', gap:24, marginLeft:'auto', opacity:0.85 }}>
            <a style={{color:'#fff', textDecoration:'none'}}>Episodes</a>
            <a style={{color:'#fff', textDecoration:'none'}}>Guests</a>
            <a style={{color:'#fff', textDecoration:'none'}}>Topics</a>
            <a style={{color:'#fff', textDecoration:'none'}}>About</a>
          </div>
          <Btn variant="primary" size="sm">Subscribe</Btn>
        </nav>
      </div>
      <div style={{ padding:'0 48px 48px', display:'grid', gridTemplateColumns:'1.2fr 1fr', gap:40, alignItems:'center' }}>
        <div>
          <Badge color="var(--tiffany)" fg="var(--delft-blue)">New episode · #29</Badge>
          <h1 style={{ fontSize:64, fontWeight:900, lineHeight:0.95, letterSpacing:'-0.03em', margin:'18px 0 20px' }}>
            Learn to <span style={{color:'var(--tiffany)'}}>invest</span><br/>in every <em style={{fontStyle:'normal', color:'var(--sienna)'}}>episode</em>.
          </h1>
          <p className="ar" style={{ fontSize:18, lineHeight:1.6, opacity:0.85, marginBottom:28, maxWidth:480 }}>
            مدرسة الاستثمار — بودكاست أسبوعي مع منصور الدرعي نتعلم فيه من قصص رواد الأعمال والمستثمرين.
          </p>
          <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
            <Btn variant="primary" icon={Icon.play}>Listen now</Btn>
            <Btn variant="secondary" icon={Icon.spotify}>Spotify</Btn>
            <Btn variant="ghost" icon={Icon.apple}>Apple</Btn>
          </div>
          <div style={{ display:'flex', gap:32, marginTop:40, fontFamily:'Mont' }}>
            {[['47', 'Episodes'],['7.7M', 'Listeners'],['5.0', 'Rating']].map(([n,l]) => (
              <div key={l}><div style={{fontSize:28, fontWeight:900, color:'var(--tiffany)'}}>{n}</div><div style={{fontSize:11, opacity:0.6, textTransform:'uppercase', letterSpacing:'0.15em'}}>{l}</div></div>
            ))}
          </div>
        </div>
        <div style={{ position:'relative' }}>
          <div style={{ position:'absolute', top:-20, right:-10, width:100, height:100, borderRadius:'50%', background:'var(--tiffany)', opacity:0.3 }}/>
          <div style={{ position:'absolute', bottom:-20, left:-10, width:50, height:10, background:'var(--sienna)', transform:'rotate(-30deg)', borderRadius:5 }}/>
          <PodcastPlayer episode={{num:29, titleAr:'الخوف هو المحرك وليس الشغف', guestAr:'مع صلاح أبو المجد', duration:'47:18'}}/>
          <div style={{ marginTop:16, display:'grid', gap:10 }}>
            {[{num:28, titleAr:'بناء الأصول بالوقت', guestAr:'مع أحمد الخالد', duration:'52:04'}].map((e,i) => (
              <div key={i} style={{ background:'rgba(255,255,255,0.06)', padding:14, borderRadius:'var(--r-md)', display:'flex', alignItems:'center', gap:14 }}>
                <div style={{ width:40, height:40, borderRadius:'50%', background:'var(--tiffany)', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--delft-blue)'}}>{Icon.play}</div>
                <div style={{flex:1}}>
                  <div className="ar" style={{fontSize:13, fontWeight:600}}>{e.titleAr}</div>
                  <div className="ar" style={{fontSize:11, opacity:0.6}}>{e.guestAr} · {e.duration}</div>
                </div>
                <Badge color="var(--sienna)" fg="#fff">EP {e.num}</Badge>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

Object.assign(window, {
  PodcastPlayer: window.PodcastPlayer, EpisodeCard: window.EpisodeCard,
  SocialCard: window.SocialCard, NewsletterPreview: window.NewsletterPreview,
  PhoneMock: window.PhoneMock, WebsiteHero: window.WebsiteHero
});
