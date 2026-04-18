/* Main App — composes all sections of the design system */

const { useState, useEffect } = React;

const THEMES = [
  { id: 'classic', name: 'Classic', bg: '#273773', accent: '#8bd8bd' },
  { id: 'mint',    name: 'Mint',    bg: '#8bd8bd', accent: '#273773' },
  { id: 'light',   name: 'Light',   bg: '#ffffff', accent: '#273773' },
  { id: 'ink',     name: 'Ink',     bg: '#0f1631', accent: '#8bd8bd' },
  { id: 'sienna',  name: 'Sienna',  bg: '#f96e46', accent: '#273773' },
  { id: 'saffron', name: 'Saffron', bg: '#efc846', accent: '#273773' },
];

const EPISODES = [
  { num:29, titleAr:'الخوف هو المُحرك وليس الشغف',  guestAr:'مع صلاح أبو المجد',   duration:'47:18' },
  { num:28, titleAr:'بناء الأصول بالوقت',            guestAr:'مع أحمد الخالد',      duration:'52:04' },
  { num:27, titleAr:'وظيفة الأحلام وهم',             guestAr:'مع ليلى القحطاني',    duration:'41:33' },
  { num:26, titleAr:'رأس المال الحقيقي هو التركيز',  guestAr:'مع خالد المنصور',     duration:'55:47' },
  { num:25, titleAr:'لماذا تخسر معظم الشركات الناشئة', guestAr:'مع نورا الشمري',    duration:'38:12' },
  { num:24, titleAr:'القرار المؤجل قرار',             guestAr:'مع عمر العمري',      duration:'49:56' },
  { num:23, titleAr:'الاستثمار في المعرفة',           guestAr:'مع سارة الفلاسي',    duration:'44:21' },
  { num:22, titleAr:'كيف تبني فريقاً لا يُهزم',        guestAr:'مع يوسف الهاشمي',    duration:'58:09' },
];

/* =========== Tweaks panel =========== */
function Tweaks({ theme, setTheme, showEditMode }) {
  if (!showEditMode) return null;
  return (
    <div style={{
      position:'fixed', bottom:24, right:24, zIndex:1000,
      background:'#111', color:'#fff', borderRadius:16, padding:20,
      boxShadow:'0 20px 50px rgba(0,0,0,0.4)', width:260, fontFamily:'Mont'
    }}>
      <div style={{ fontSize:11, letterSpacing:'0.18em', textTransform:'uppercase', color:'#8bd8bd', fontWeight:700, marginBottom:12 }}>Tweaks</div>
      <div style={{ fontSize:13, marginBottom:10, opacity:0.7 }}>Color theme</div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6 }}>
        {THEMES.map(t => (
          <button key={t.id} onClick={() => setTheme(t.id)} style={{
            background: t.bg, color: t.accent, border: theme === t.id ? '2px solid #8bd8bd' : '2px solid transparent',
            padding:'10px 8px', borderRadius:8, fontSize:11, fontWeight:700, cursor:'pointer',
            fontFamily:'Mont'
          }}>{t.name}</button>
        ))}
      </div>
    </div>
  );
}

/* =========== COVER =========== */
function Cover() {
  return (
    <section data-screen-label="01 Cover" style={{ minHeight:'100vh', padding:'8vw', position:'relative', overflow:'hidden', background:'var(--bg)', color:'var(--fg)' }}>
      {/* chart lines in bg */}
      <svg style={{ position:'absolute', bottom:0, right:0, width:'55%', height:'60%', opacity:0.25 }} viewBox="0 0 600 400">
        {[60,120,180,240,300,360,420].map((x,i) => {
          const h = [80,140,110,200,260,220,320][i];
          return <rect key={i} x={x} y={400 - h} width="36" height={h} fill="none" stroke="var(--accent)" strokeWidth="2" />;
        })}
      </svg>

      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', position:'relative', zIndex:2 }}>
        <div style={{ fontFamily:'Mont', fontSize:13, opacity:0.7, letterSpacing:'0.1em' }}>Brand Guidelines · v1.0 · 2026</div>
        <TrendzMark color="var(--accent)" size={16}/>
      </div>

      <div style={{ position:'absolute', bottom:'8vw', left:'8vw', right:'8vw', zIndex:2 }}>
        <div style={{ fontFamily:'Mont', fontSize:14, color:'var(--accent)', letterSpacing:'0.2em', textTransform:'uppercase', fontWeight:700, marginBottom:20 }}>Investment School × Trendz</div>
        <h1 style={{ fontFamily:'Mont', fontSize:'clamp(64px, 11vw, 180px)', fontWeight:900, lineHeight:0.88, margin:0, letterSpacing:'-0.03em' }}>
          Design<br/>
          <span style={{ color:'var(--accent)'}}>System</span>
        </h1>
        <div style={{ marginTop:40, display:'flex', gap:32, alignItems:'flex-end', flexWrap:'wrap' }}>
          <Logo size={130} color="var(--fg)" accent="var(--accent)" tagline/>
          <div style={{ maxWidth:440, fontSize:15, opacity:0.8, lineHeight:1.6 }}>
            A complete identity + interaction system for <b>مدرسة الاستثمار</b> — covering brand, product, editorial, social, and podcast surfaces.
          </div>
        </div>
      </div>
    </section>
  );
}

/* =========== NAV =========== */
function SideNav({ sections }) {
  const [active, setActive] = useState(sections[0].id);
  useEffect(() => {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => e.isIntersecting && setActive(e.target.id));
    }, { rootMargin: '-45% 0px -45% 0px' });
    sections.forEach(s => { const el = document.getElementById(s.id); if (el) obs.observe(el); });
    return () => obs.disconnect();
  }, []);
  return (
    <nav style={{
      position:'fixed', top:'50%', left:20, transform:'translateY(-50%)', zIndex:100,
      display:'flex', flexDirection:'column', gap:8, padding:10,
      background:'rgba(0,0,0,0.5)', borderRadius:'var(--r-pill)',
      backdropFilter:'blur(10px)'
    }}>
      {sections.map(s => (
        <a key={s.id} href={`#${s.id}`} title={s.label} style={{
          width:12, height:12, borderRadius:'50%',
          background: active === s.id ? 'var(--tiffany)' : 'rgba(255,255,255,0.3)',
          display:'block', transition:'all .2s', transform: active === s.id ? 'scale(1.4)' : 'none',
          textDecoration:'none'
        }}/>
      ))}
    </nav>
  );
}

/* =========== THE APP =========== */
function App() {
  const initial = localStorage.getItem('trendz.theme') || 'classic';
  const [theme, setTheme] = useState(initial);
  const [showEditMode, setShowEditMode] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('trendz.theme', theme);
  }, [theme]);

  useEffect(() => {
    const onMsg = (e) => {
      if (e.data?.type === '__activate_edit_mode') setShowEditMode(true);
      if (e.data?.type === '__deactivate_edit_mode') setShowEditMode(false);
    };
    window.addEventListener('message', onMsg);
    window.parent.postMessage({type: '__edit_mode_available'}, '*');
    return () => window.removeEventListener('message', onMsg);
  }, []);

  const sections = [
    {id:'cover', label:'Cover'}, {id:'philosophy', label:'Philosophy'},
    {id:'logo', label:'Logo'}, {id:'color', label:'Color'},
    {id:'type', label:'Type'}, {id:'pattern', label:'Pattern'},
    {id:'components', label:'UI Kit'}, {id:'web', label:'Web'},
    {id:'podcast', label:'Podcast'}, {id:'newsletter', label:'Newsletter'},
    {id:'social', label:'Social'}, {id:'deck', label:'Deck'}
  ];

  return (
    <div style={{ background:'var(--bg)', color:'var(--fg)' }}>
      <SideNav sections={sections}/>
      <Cover/>

      {/* ============ PHILOSOPHY ============ */}
      <Section id="philosophy" eyebrow="01 / Philosophy" title="What we stand for">
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(280px, 1fr))', gap:24, marginBottom:48 }}>
          {[
            { k:'Clarity', v:'Financial literacy in plain Arabic. No jargon, no gatekeeping.' },
            { k:'Rigor',   v:'Every episode is researched. Charts and sources earn their place.' },
            { k:'Growth',  v:'The logo is a chart. We start small and compound — honestly.' },
          ].map(({k,v}) => (
            <div key={k} style={{ borderTop:'2px solid var(--accent)', paddingTop:20 }}>
              <h3 style={{ fontFamily:'Mont', fontWeight:900, fontSize:28, margin:'0 0 10px' }}>{k}</h3>
              <p style={{ margin:0, opacity:0.75, lineHeight:1.6, fontSize:14 }}>{v}</p>
            </div>
          ))}
        </div>
        <div style={{ padding:'40px 32px', background:'rgba(139,216,189,0.08)', border:'1px solid rgba(139,216,189,0.2)', borderRadius:'var(--r-lg)', display:'grid', gridTemplateColumns:'1fr 1fr', gap:48, alignItems:'center' }}>
          <div>
            <div style={{ fontSize:11, letterSpacing:'0.2em', color:'var(--accent)', fontWeight:700, textTransform:'uppercase', marginBottom:12 }}>The rationale</div>
            <p style={{ fontSize:18, lineHeight:1.5, margin:0 }}>The logo abstracts "مدرسة الاستثمار" into parallel vertical bars — a chart drawn from Arabic letterforms. Growth, literally spelled out.</p>
          </div>
          <div style={{ display:'flex', justifyContent:'center' }}>
            <Logo size={200} color="var(--fg)" accent="var(--accent)"/>
          </div>
        </div>
      </Section>

      {/* ============ LOGO ============ */}
      <Section id="logo" eyebrow="02 / Logo" title="Identity marks" bg="var(--bg-alt)">
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:16, marginBottom:24 }}>
          {[
            { bg:'var(--delft-blue)', c:'#fff', a:'var(--tiffany)', l:'Primary · on blue'},
            { bg:'var(--tiffany)',    c:'var(--delft-blue)', a:'var(--delft-blue)', l:'Primary · on mint'},
            { bg:'#000', c:'#fff', a:'#fff', l:'Mono · reversed'},
            { bg:'#fff', c:'var(--delft-blue)', a:'var(--delft-blue)', l:'Mono · on light'},
          ].map((v,i) => (
            <div key={i} style={{ background:v.bg, padding:'40px 24px', borderRadius:'var(--r-md)', display:'flex', flexDirection:'column', alignItems:'center', gap:18, aspectRatio:'4/3' }}>
              <Logo size={110} color={v.c} accent={v.a}/>
              <div style={{ fontSize:11, color:v.c, opacity:0.7, fontFamily:'Mont', fontWeight:600 }}>{v.l}</div>
            </div>
          ))}
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:16 }}>
          <div style={{ background:'rgba(255,255,255,0.04)', borderRadius:'var(--r-md)', padding:24 }}>
            <Badge color="var(--tiffany)" fg="var(--delft-blue)">Scaling</Badge>
            <p style={{fontSize:13, opacity:0.7, marginTop:10, lineHeight:1.5}}>Min 20px on screen, 0.25″ in print. Legibility over visibility.</p>
            <div style={{ display:'flex', alignItems:'end', gap:16, justifyContent:'center', padding:16, background:'rgba(0,0,0,0.2)', borderRadius:8 }}>
              <Logo size={100} color="#fff" accent="var(--tiffany)"/>
              <Logo size={60} color="#fff" accent="var(--tiffany)"/>
              <Logo size={36} color="#fff" accent="var(--tiffany)"/>
            </div>
          </div>
          <div style={{ background:'rgba(255,255,255,0.04)', borderRadius:'var(--r-md)', padding:24 }}>
            <Badge color="var(--sienna)" fg="#fff">Clear space</Badge>
            <p style={{fontSize:13, opacity:0.7, marginTop:10, lineHeight:1.5}}>Keep x-height distance on all sides. Don't crowd.</p>
            <div style={{ display:'flex', justifyContent:'center', padding:16, position:'relative', background:'rgba(0,0,0,0.2)', borderRadius:8 }}>
              <div style={{ border:'1px dashed rgba(139,216,189,0.5)', padding:28, borderRadius:8 }}>
                <Logo size={80} color="#fff" accent="var(--tiffany)"/>
              </div>
            </div>
          </div>
          <div style={{ background:'rgba(255,255,255,0.04)', borderRadius:'var(--r-md)', padding:24 }}>
            <Badge color="var(--saffron)" fg="var(--delft-blue)">Partnership</Badge>
            <p style={{fontSize:13, opacity:0.7, marginTop:10, lineHeight:1.5}}>Wordmark always first. 1px separator, equal height.</p>
            <div style={{ display:'flex', alignItems:'center', gap:14, justifyContent:'center', padding:16, background:'rgba(0,0,0,0.2)', borderRadius:8 }}>
              <Logo size={60} color="#fff" accent="var(--tiffany)"/>
              <div style={{ width:1, height:44, background:'rgba(255,255,255,0.3)' }}/>
              <div style={{ color:'#fff', fontFamily:'Mont', fontWeight:900, fontSize:18, letterSpacing:'-0.03em'}}>PARTNER</div>
            </div>
          </div>
        </div>
      </Section>

      {/* ============ COLOR ============ */}
      <Section id="color" eyebrow="03 / Color" title="The palette">
        <div style={{ marginBottom:16, fontSize:13, letterSpacing:'0.15em', textTransform:'uppercase', color:'var(--accent)', fontWeight:700 }}>Primary</div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:48 }}>
          <div>
            <Swatch name="Delft Blue" hex="#273773" rgb="39 55 115" cmyk="87 65 21 8"/>
            <div style={{ display:'flex' }}>
              <Tint hex="#273773" pct={75} alpha={0.75}/>
              <Tint hex="#273773" pct={50} fg="#273773" alpha={0.5}/>
              <Tint hex="#273773" pct={20} fg="#273773" alpha={0.2}/>
            </div>
          </div>
          <div>
            <Swatch name="Tiffany Blue" hex="#8bd8bd" fg="#273773" rgb="139 216 189" cmyk="46 2 21 0"/>
            <div style={{ display:'flex' }}>
              <Tint hex="#8bd8bd" pct={75} fg="#273773" alpha={0.75}/>
              <Tint hex="#8bd8bd" pct={50} fg="#273773" alpha={0.5}/>
              <Tint hex="#8bd8bd" pct={20} fg="#273773" alpha={0.2}/>
            </div>
          </div>
        </div>

        <div style={{ marginBottom:16, fontSize:13, letterSpacing:'0.15em', textTransform:'uppercase', color:'var(--accent)', fontWeight:700 }}>Secondary</div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:16, marginBottom:48 }}>
          {[
            {n:'Burnt Sienna', h:'#f96e46', rgb:'249 110 70', cmyk:'2 67 73 0'},
            {n:'Saffron', h:'#efc846', rgb:'239 200 70', cmyk:'7 20 79 0', fg:'#273773'},
            {n:'Misty Rose', h:'#ffe3e3', rgb:'255 227 227', cmyk:'0 11 9 0', fg:'#273773'},
          ].map(c => (
            <div key={c.n}>
              <Swatch name={c.n} hex={c.h} rgb={c.rgb} cmyk={c.cmyk} fg={c.fg || '#fff'}/>
              <div style={{ display:'flex' }}>
                <Tint hex={c.h} pct={75} fg={c.fg || '#fff'} alpha={0.75}/>
                <Tint hex={c.h} pct={50} fg={c.fg || '#273773'} alpha={0.5}/>
                <Tint hex={c.h} pct={20} fg={c.fg || '#273773'} alpha={0.2}/>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginBottom:16, fontSize:13, letterSpacing:'0.15em', textTransform:'uppercase', color:'var(--accent)', fontWeight:700 }}>Neutrals</div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:12, marginBottom:48 }}>
          {[['Slate Grey','#333333'],['Dim Grey','#666666'],['Dark Grey','#999999'],['Mist','#f5f6f8']].map(([n,h]) => (
            <div key={n} style={{ background:h, color: h==='#f5f6f8'?'#273773':'#fff', padding:20, borderRadius:'var(--r-sm)', fontFamily:'Mont', fontWeight:700, display:'flex', flexDirection:'column', justifyContent:'space-between', minHeight:96 }}>
              <span>{n}</span>
              <span style={{fontSize:11, opacity:0.8}}>{h}</span>
            </div>
          ))}
        </div>

        {/* Balance 50-35-5-5-5 */}
        <div style={{ marginBottom:16, fontSize:13, letterSpacing:'0.15em', textTransform:'uppercase', color:'var(--accent)', fontWeight:700 }}>Balance · 50/35/5/5/5</div>
        <div style={{ display:'flex', height:160, borderRadius:'var(--r-md)', overflow:'hidden', marginBottom:48 }}>
          <div style={{flex:50, background:'#273773', color:'#8bd8bd', display:'flex', alignItems:'flex-start', padding:20}}>
            <div style={{ fontFamily:'Mont', fontWeight:900, fontSize:44, letterSpacing:'-0.03em' }}>50<span style={{fontSize:22}}>%</span></div>
          </div>
          <div style={{flex:35, background:'#8bd8bd', color:'#273773', display:'flex', alignItems:'flex-start', padding:20}}>
            <div style={{ fontFamily:'Mont', fontWeight:900, fontSize:44, letterSpacing:'-0.03em'}}>35<span style={{fontSize:22}}>%</span></div>
          </div>
          <div style={{flex:5, background:'#f96e46', color:'#fff', display:'flex', alignItems:'flex-start', padding:'20px 10px', fontFamily:'Mont', fontWeight:900, fontSize:14}}>5%</div>
          <div style={{flex:5, background:'#efc846', color:'#273773', display:'flex', alignItems:'flex-start', padding:'20px 10px', fontFamily:'Mont', fontWeight:900, fontSize:14}}>5%</div>
          <div style={{flex:5, background:'#ffe3e3', color:'#f96e46', display:'flex', alignItems:'flex-start', padding:'20px 10px', fontFamily:'Mont', fontWeight:900, fontSize:14}}>5%</div>
        </div>

        {/* Theme switcher */}
        <div style={{ marginBottom:16, fontSize:13, letterSpacing:'0.15em', textTransform:'uppercase', color:'var(--accent)', fontWeight:700 }}>Theme modes — try them</div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(6, 1fr)', gap:12 }}>
          {THEMES.map(t => (
            <button key={t.id} onClick={() => setTheme(t.id)} style={{
              background: t.bg, padding:'20px 14px', borderRadius:'var(--r-md)', border: theme===t.id?`3px solid ${t.accent}`:'3px solid transparent',
              cursor:'pointer', fontFamily:'Mont', fontWeight:700, color:t.accent, fontSize:13, textAlign:'left',
              display:'flex', flexDirection:'column', gap:8, alignItems:'flex-start'
            }}>
              <div style={{ display:'flex', gap:4 }}>
                {['#273773','#8bd8bd','#f96e46','#efc846'].map(c => <div key={c} style={{width:14, height:14, borderRadius:'50%', background:c, border:'2px solid rgba(255,255,255,0.2)'}}/>)}
              </div>
              <div>{t.name}</div>
            </button>
          ))}
        </div>
      </Section>

      {/* ============ TYPE ============ */}
      <Section id="type" eyebrow="04 / Typography" title="Mont + IBM Plex Sans Arabic" bg="var(--bg-alt)">
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:32 }}>
          <div>
            <div style={{ fontFamily:'Mont', fontSize:12, letterSpacing:'0.2em', textTransform:'uppercase', color:'var(--accent)', fontWeight:700, marginBottom:12 }}>English · Mont</div>
            <div style={{ fontFamily:'Mont', fontSize:140, fontWeight:900, lineHeight:1, letterSpacing:'-0.04em' }}>Aa</div>
            <div style={{ fontSize:12, opacity:0.6, letterSpacing:'0.1em', margin:'20px 0 8px' }}>BOOK · REGULAR · SEMIBOLD · BOLD · HEAVY</div>
            <div style={{ display:'grid', gap:14, marginTop:18 }}>
              {[[300,'Book'],[400,'Regular'],[600,'Semibold'],[700,'Bold'],[900,'Heavy']].map(([w,n]) => (
                <div key={w} style={{ display:'flex', alignItems:'baseline', gap:16, borderTop:'1px solid rgba(255,255,255,0.1)', paddingTop:14 }}>
                  <span style={{ fontFamily:'Mont', fontWeight:w, fontSize:32 }}>The quick brown fox</span>
                  <span style={{ marginLeft:'auto', fontSize:11, opacity:0.6 }}>Mont {n}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontFamily:'Mont', fontSize:12, letterSpacing:'0.2em', textTransform:'uppercase', color:'var(--accent)', fontWeight:700, marginBottom:12 }}>عربي · IBM Plex Sans Arabic</div>
            <div className="ar" style={{ fontSize:140, fontWeight:700, lineHeight:1 }}>أب</div>
            <div style={{ fontSize:12, opacity:0.6, letterSpacing:'0.1em', margin:'20px 0 8px' }}>REGULAR · SEMIBOLD · BOLD</div>
            <div style={{ display:'grid', gap:14, marginTop:18 }}>
              {[[400,'Regular'],[600,'Semibold'],[700,'Bold']].map(([w,n]) => (
                <div key={w} style={{ display:'flex', alignItems:'baseline', gap:16, borderTop:'1px solid rgba(255,255,255,0.1)', paddingTop:14 }}>
                  <span className="ar" style={{ fontFamily:'IBM Plex Sans Arabic', fontWeight:w, fontSize:28 }}>نتعلم من قصص رواد الأعمال</span>
                  <span style={{ marginLeft:'auto', fontSize:11, opacity:0.6 }}>Plex {n}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* type scale */}
        <div style={{ marginTop:64 }}>
          <div style={{ fontFamily:'Mont', fontSize:12, letterSpacing:'0.2em', textTransform:'uppercase', color:'var(--accent)', fontWeight:700, marginBottom:20 }}>Type scale</div>
          <div style={{ display:'grid', gap:14 }}>
            {[
              ['Display',  80, 900, 'Invest in yourself first'],
              ['H1',       56, 900, 'The school of investment'],
              ['H2',       40, 700, 'Every episode is a lesson'],
              ['H3',       28, 700, 'Growth compounds quietly'],
              ['Body Lg',  18, 400, 'Long-form essays and show notes live here — breathing room matters.'],
              ['Body',     15, 400, 'Standard UI text for paragraphs, cards, and metadata.'],
              ['Caption',  12, 600, 'EYEBROWS · METADATA · TIMESTAMPS'],
            ].map(([l,s,w,t]) => (
              <div key={l} style={{ display:'grid', gridTemplateColumns:'100px 70px 1fr', alignItems:'baseline', gap:24, borderBottom:'1px solid rgba(255,255,255,0.08)', paddingBottom:10 }}>
                <span style={{ fontSize:11, fontFamily:'Mont', opacity:0.6, letterSpacing:'0.1em', textTransform:'uppercase' }}>{l}</span>
                <span style={{ fontSize:11, fontFamily:'Mont', opacity:0.4 }}>{s}/{w}</span>
                <span style={{ fontFamily:'Mont', fontSize:s, fontWeight:w, lineHeight:1.1, letterSpacing: s > 40 ? '-0.02em' : '0' }}>{t}</span>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ============ PATTERN ============ */}
      <Section id="pattern" eyebrow="05 / Pattern" title="Brand pattern">
        <div style={{ display:'grid', gridTemplateColumns:'1fr 2fr', gap:32, alignItems:'stretch' }}>
          <div style={{ background:'rgba(255,255,255,0.04)', padding:32, borderRadius:'var(--r-lg)' }}>
            <p style={{ fontSize:15, lineHeight:1.65, opacity:0.8, margin:'0 0 24px' }}>
              The pattern isolates a motif from the wordmark — a repeated ش-like glyph paired with accent slashes.
              Use on merchandise, social backgrounds, and section breaks. Never on top of the logo.
            </p>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              <div style={{ padding:12, background:'rgba(139,216,189,0.1)', borderRadius:8, fontSize:11, opacity:0.8 }}><b style={{color:'var(--accent)'}}>DO</b> · keep 1 full tile margin</div>
              <div style={{ padding:12, background:'rgba(249,110,70,0.1)', borderRadius:8, fontSize:11, opacity:0.8 }}><b style={{color:'var(--sienna)'}}>DON'T</b> · stretch the motif</div>
            </div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
            <div style={{ aspectRatio:'16/10', background:'var(--delft-blue)', borderRadius:'var(--r-md)', overflow:'hidden', position:'relative' }}>
              <BrandPattern color="#8bd8bd" opacity={0.9} scale={1}/>
            </div>
            <div style={{ aspectRatio:'16/10', background:'#fff', borderRadius:'var(--r-md)', overflow:'hidden', position:'relative' }}>
              <BrandPattern color="#273773" opacity={1} scale={1}/>
            </div>
            <div style={{ aspectRatio:'16/10', background:'var(--tiffany)', borderRadius:'var(--r-md)', overflow:'hidden', position:'relative' }}>
              <BrandPattern color="#273773" opacity={0.6} scale={0.7}/>
            </div>
            <div style={{ aspectRatio:'16/10', background:'var(--sienna)', borderRadius:'var(--r-md)', overflow:'hidden', position:'relative' }}>
              <BrandPattern color="#fff" opacity={0.35} scale={1.2}/>
            </div>
          </div>
        </div>
      </Section>

      {/* ============ UI KIT / COMPONENTS ============ */}
      <Section id="components" eyebrow="06 / UI Kit" title="Components" bg="var(--bg-alt)">
        <div style={{ display:'grid', gridTemplateColumns:'repeat(2, 1fr)', gap:24 }}>
          {/* Buttons */}
          <div style={{ padding:28, background:'rgba(255,255,255,0.04)', borderRadius:'var(--r-md)' }}>
            <div style={{ fontSize:11, letterSpacing:'0.18em', textTransform:'uppercase', color:'var(--accent)', fontWeight:700, marginBottom:16 }}>Buttons</div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:10 }}>
              <Btn variant="primary">Listen now</Btn>
              <Btn variant="secondary">Subscribe</Btn>
              <Btn variant="sienna">New episode</Btn>
              <Btn variant="ghost">Read more</Btn>
              <Btn variant="chip" size="sm">+ Topic</Btn>
              <Btn variant="primary" icon={Icon.play}>Play</Btn>
              <Btn variant="primary" size="lg" iconRight={Icon.arrow}>All episodes</Btn>
            </div>
          </div>
          {/* Inputs */}
          <div style={{ padding:28, background:'rgba(255,255,255,0.04)', borderRadius:'var(--r-md)' }}>
            <div style={{ fontSize:11, letterSpacing:'0.18em', textTransform:'uppercase', color:'var(--accent)', fontWeight:700, marginBottom:16 }}>Inputs</div>
            <div style={{ display:'grid', gap:10 }}>
              <div style={{ display:'flex', alignItems:'center', gap:10, background:'rgba(255,255,255,0.08)', padding:'10px 16px', borderRadius:'var(--r-pill)' }}>
                {Icon.search}
                <input placeholder="Search episodes…" style={{ background:'transparent', border:0, outline:0, color:'var(--fg)', fontFamily:'Mont', fontSize:14, flex:1 }}/>
              </div>
              <input placeholder="your@email.com" style={{ padding:'12px 18px', borderRadius:'var(--r-sm)', border:'1px solid rgba(255,255,255,0.15)', background:'transparent', color:'var(--fg)', fontFamily:'Mont', fontSize:14 }}/>
              <div style={{ display:'flex', gap:8 }}>
                <Btn variant="primary" size="sm">Subscribe</Btn>
                <Btn variant="chip" size="sm">Later</Btn>
              </div>
            </div>
          </div>
          {/* Badges */}
          <div style={{ padding:28, background:'rgba(255,255,255,0.04)', borderRadius:'var(--r-md)' }}>
            <div style={{ fontSize:11, letterSpacing:'0.18em', textTransform:'uppercase', color:'var(--accent)', fontWeight:700, marginBottom:16 }}>Badges</div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
              <Badge color="var(--tiffany)" fg="var(--delft-blue)">New</Badge>
              <Badge color="var(--sienna)" fg="#fff">EP 29</Badge>
              <Badge color="var(--saffron)" fg="var(--delft-blue)">Trending</Badge>
              <Badge color="rgba(255,255,255,0.1)" fg="var(--fg)">47:18</Badge>
              <Badge color="var(--rose)" fg="var(--sienna)">Free</Badge>
            </div>
          </div>
          {/* Avatars/tag */}
          <div style={{ padding:28, background:'rgba(255,255,255,0.04)', borderRadius:'var(--r-md)' }}>
            <div style={{ fontSize:11, letterSpacing:'0.18em', textTransform:'uppercase', color:'var(--accent)', fontWeight:700, marginBottom:16 }}>Guest tag</div>
            <div style={{ display:'flex', gap:12, alignItems:'center' }}>
              <div style={{ width:52, height:52, borderRadius:'50%', background:'linear-gradient(135deg, var(--tiffany), var(--delft-blue-75))', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Mont', fontWeight:900, color:'#fff', fontSize:18 }}>SA</div>
              <div>
                <div className="ar" style={{ fontWeight:700, fontSize:15 }}>صلاح أبو المجد</div>
                <div style={{ fontSize:12, opacity:0.6 }}>Serial founder · Cairo</div>
              </div>
            </div>
          </div>
        </div>

        {/* sample podcast player */}
        <div style={{ marginTop:24 }}>
          <div style={{ fontSize:11, letterSpacing:'0.18em', textTransform:'uppercase', color:'var(--accent)', fontWeight:700, marginBottom:16 }}>Podcast player</div>
          <PodcastPlayer episode={EPISODES[0]}/>
        </div>
      </Section>

      {/* ============ WEB ============ */}
      <Section id="web" eyebrow="07 / Website" title="Website & landing">
        <WebsiteHero/>
        <div style={{ marginTop:24, display:'grid', gridTemplateColumns:'1fr 1fr', gap:24 }}>
          <Card style={{ padding:32 }}>
            <Badge color="var(--tiffany)" fg="var(--delft-blue)">Interactive tool</Badge>
            <h3 style={{ fontFamily:'Mont', fontSize:28, fontWeight:900, margin:'14px 0 8px', color:'var(--delft-blue)'}}>Compound calculator</h3>
            <p style={{ color:'#666', fontSize:14, margin:'0 0 20px' }}>A simple tool we link from the podcast to visualize what we discuss.</p>
            <div style={{ display:'flex', gap:8, alignItems:'end', height:120, background:'var(--mist)', borderRadius:10, padding:16 }}>
              {[8,12,16,22,30,40,54,72,95].map((h,i) => (
                <div key={i} style={{ flex:1, height:`${h}%`, background: i > 6 ? 'var(--sienna)' : 'var(--delft-blue)', borderRadius:3 }}/>
              ))}
            </div>
          </Card>
          <Card style={{ padding:32 }}>
            <Badge color="var(--sienna)" fg="#fff">Repository</Badge>
            <h3 style={{ fontFamily:'Mont', fontSize:28, fontWeight:900, margin:'14px 0 8px', color:'var(--delft-blue)'}}>Show notes archive</h3>
            <p style={{ color:'#666', fontSize:14, margin:'0 0 20px' }}>Every episode gets a searchable transcript, pull-quotes, and citations.</p>
            <div style={{ display:'grid', gap:8 }}>
              {EPISODES.slice(0,3).map(e => (
                <div key={e.num} style={{ display:'flex', alignItems:'center', gap:10, background:'var(--mist)', padding:'10px 14px', borderRadius:8 }}>
                  <div style={{ fontFamily:'Mont', fontWeight:900, color:'var(--sienna)', width:28 }}>{String(e.num).padStart(2,'0')}</div>
                  <div className="ar" style={{ flex:1, fontSize:13, fontWeight:600, color:'var(--delft-blue)' }}>{e.titleAr}</div>
                  <div style={{ fontSize:11, color:'#666'}}>{e.duration}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </Section>

      {/* ============ PODCAST REPO ============ */}
      <Section id="podcast" eyebrow="08 / Podcast" title="Episode repository" bg="var(--bg-alt)">
        {/* filters */}
        <div style={{ display:'flex', gap:10, marginBottom:24, flexWrap:'wrap' }}>
          {['All','Entrepreneurship','Markets','Mindset','Crypto','Personal finance','Startups'].map((t,i) => (
            <Btn key={t} variant={i === 0 ? 'primary' : 'chip'} size="sm">{t}</Btn>
          ))}
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(220px, 1fr))', gap:16 }}>
          {EPISODES.map(e => <EpisodeCard key={e.num} ep={e}/>)}
        </div>

        {/* podcast covers */}
        <div style={{ marginTop:48 }}>
          <div style={{ fontSize:11, letterSpacing:'0.18em', textTransform:'uppercase', color:'var(--accent)', fontWeight:700, marginBottom:16 }}>Platform covers · Apple · Spotify · Anghami · Google</div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(6, 1fr)', gap:10 }}>
            {[
              {bg:'#273773', c:'#fff', a:'#8bd8bd'},
              {bg:'#8bd8bd', c:'#273773', a:'#273773'},
              {bg:'#273773', c:'#fff', a:'#8bd8bd', corner:'sienna'},
              {bg:'#f96e46', c:'#fff', a:'#fff'},
              {bg:'#efc846', c:'#273773', a:'#273773'},
              {bg:'#ffe3e3', c:'#f96e46', a:'#f96e46'},
            ].map((v, i) => (
              <div key={i} style={{ aspectRatio:1, background:v.bg, borderRadius:'var(--r-sm)', display:'flex', alignItems:'center', justifyContent:'center', position:'relative', overflow:'hidden' }}>
                {v.corner && <div style={{ position:'absolute', top:8, right:8, width:30, height:4, background:'var(--sienna)', transform:'rotate(-20deg)', borderRadius:2 }}/>}
                <div style={{ position:'absolute', top:8, left:8 }}><TrendzMark color={v.a} size={9}/></div>
                <Logo size={56} color={v.c} accent={v.a}/>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ============ NEWSLETTER ============ */}
      <Section id="newsletter" eyebrow="09 / Newsletter" title="Weekly editorial">
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:48, alignItems:'center' }}>
          <div>
            <h3 style={{ fontFamily:'Mont', fontSize:40, fontWeight:900, margin:'0 0 14px', letterSpacing:'-0.02em', lineHeight:1 }}>
              <span style={{color:'var(--accent)'}}>TRENDZ</span><br/>Weekly
            </h3>
            <p style={{ fontSize:16, lineHeight:1.6, opacity:0.8, margin:'0 0 20px' }}>A Friday digest of the week's episode, the key idea, one chart worth framing, and three reads to send to your group chat.</p>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:14, marginBottom:24 }}>
              {[['42','issues'],['18k','readers'],['4.8','rating']].map(([n,l]) => (
                <div key={l} style={{ borderLeft:'2px solid var(--accent)', paddingLeft:12 }}>
                  <div style={{ fontFamily:'Mont', fontWeight:900, fontSize:28, color:'var(--accent)' }}>{n}</div>
                  <div style={{ fontSize:11, opacity:0.6, textTransform:'uppercase', letterSpacing:'0.12em' }}>{l}</div>
                </div>
              ))}
            </div>
            <div style={{ display:'flex', gap:8, maxWidth:400 }}>
              <input placeholder="your@email.com" style={{ flex:1, padding:'12px 18px', borderRadius:'var(--r-pill)', border:'1px solid rgba(255,255,255,0.2)', background:'transparent', color:'var(--fg)', fontFamily:'Mont', fontSize:14 }}/>
              <Btn variant="primary">Subscribe</Btn>
            </div>
          </div>
          <NewsletterPreview/>
        </div>
      </Section>

      {/* ============ SOCIAL ============ */}
      <Section id="social" eyebrow="10 / Social" title="Social media system" bg="var(--bg-alt)">
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:20, marginBottom:40 }}>
          <SocialCard variant="guest"/>
          <SocialCard variant="lesson"/>
          <SocialCard variant="quote"/>
        </div>

        {/* Facebook cover */}
        <div style={{ marginBottom:32 }}>
          <div style={{ fontSize:11, letterSpacing:'0.18em', textTransform:'uppercase', color:'var(--accent)', fontWeight:700, marginBottom:12 }}>Facebook cover</div>
          <div style={{ background:'var(--tiffany)', borderRadius:'var(--r-md)', padding:30, position:'relative', overflow:'hidden', aspectRatio:'820/312', color:'var(--delft-blue)' }}>
            <BrandShapes/>
            <div style={{ display:'flex', alignItems:'center', gap:24, height:'100%', position:'relative', zIndex:2 }}>
              <div style={{ fontFamily:'Mont', fontWeight:900, fontSize:40, lineHeight:1.1, letterSpacing:'-0.02em', maxWidth:'50%' }}>
                <div className="ar" style={{ fontSize:38, direction:'rtl', textAlign:'right' }}>استمع لبودكاست<br/>مدرسة الاستثمار</div>
                <div style={{ display:'flex', gap:12, marginTop:18, fontSize:14, alignItems:'center' }}>
                  <span style={{display:'inline-flex', width:32, height:32, borderRadius:'50%', background:'var(--delft-blue)', color:'#fff', alignItems:'center', justifyContent:'center'}}>{Icon.spotify}</span>
                  <span style={{display:'inline-flex', width:32, height:32, borderRadius:'50%', background:'var(--delft-blue)', color:'#fff', alignItems:'center', justifyContent:'center'}}>{Icon.youtube}</span>
                  <span style={{display:'inline-flex', width:32, height:32, borderRadius:'50%', background:'var(--delft-blue)', color:'#fff', alignItems:'center', justifyContent:'center'}}>{Icon.apple}</span>
                </div>
              </div>
              <div style={{ marginLeft:'auto', display:'flex', gap:4, alignItems:'end', height:'60%' }}>
                {[40,60,50,80,95,120,145].map((h,i) => <div key={i} style={{ width:18, height:h, background:'var(--delft-blue)', borderRadius:2 }}/>)}
              </div>
            </div>
          </div>
        </div>

        {/* Profile circles per platform */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:20 }}>
          {[
            { name:'Facebook · 360×360', bgs:['var(--delft-blue)','var(--tiffany)','var(--delft-blue)'] },
            { name:'LinkedIn / X · 300×300', bgs:['var(--delft-blue)','var(--tiffany)','var(--delft-blue)'] },
            { name:'Instagram · 110×110', bgs:['var(--delft-blue)','var(--tiffany)','var(--delft-blue)'] },
          ].map(p => (
            <div key={p.name} style={{ padding:24, background:'rgba(255,255,255,0.04)', borderRadius:'var(--r-md)' }}>
              <div style={{ fontSize:11, letterSpacing:'0.15em', textTransform:'uppercase', color:'var(--accent)', fontWeight:700, marginBottom:16 }}>{p.name}</div>
              <div style={{ display:'flex', gap:12, justifyContent:'center' }}>
                {p.bgs.map((bg, i) => {
                  const c = bg.includes('tiffany') ? 'var(--delft-blue)' : '#fff';
                  return <div key={i} style={{ width:76, height:76, borderRadius:'50%', background:bg, display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <Logo size={50} color={c} accent={c}/>
                  </div>;
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Phone mocks */}
        <div style={{ marginTop:48 }}>
          <div style={{ fontSize:11, letterSpacing:'0.18em', textTransform:'uppercase', color:'var(--accent)', fontWeight:700, marginBottom:16 }}>Story & reel templates</div>
          <div style={{ display:'flex', gap:20, justifyContent:'center', flexWrap:'wrap' }}>
            <PhoneMock>
              <div style={{ padding:24, height:'100%', display:'flex', flexDirection:'column', justifyContent:'space-between', position:'relative' }}>
                <BrandShapes/>
                <Logo size={80} color="#fff" accent="var(--tiffany)"/>
                <div>
                  <div className="ar" style={{ color:'#fff', fontSize:14, fontWeight:600, marginBottom:10 }}>متحمسين للهوية البصرية الجديدة لمدرسة الاستثمار؟</div>
                  <Btn variant="primary" size="sm" style={{width:'100%', justifyContent:'center'}}>🔥 أكيد</Btn>
                </div>
              </div>
            </PhoneMock>
            <PhoneMock>
              <div style={{ padding:24, height:'100%', display:'flex', flexDirection:'column', justifyContent:'space-between', background:'linear-gradient(180deg, rgba(139,216,189,0.3), var(--delft-blue))' }}>
                <Logo size={70} color="#fff" accent="var(--tiffany)"/>
                <div className="ar" style={{ textAlign:'center', color:'#fff', fontSize:16, fontWeight:700, lineHeight:1.5 }}>
                  تابعوا البودكاست<br/>من خلال اللينك التالي
                  <div style={{ marginTop:14 }}><Btn variant="primary" size="sm">🔗 LINK</Btn></div>
                </div>
                <div/>
              </div>
            </PhoneMock>
            <PhoneMock>
              <div style={{ padding:20, height:'100%', display:'flex', flexDirection:'column', gap:14, position:'relative' }}>
                <BrandShapes/>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <Logo size={44} color="#fff" accent="var(--tiffany)"/>
                  <TrendzMark color="var(--tiffany)" size={10}/>
                </div>
                <div className="ar" style={{ color:'#fff', fontSize:18, fontWeight:700, textAlign:'center' }}>حلقة جديدة<br/><span style={{fontSize:12, opacity:0.7}}>9م بتوقيت الإمارات</span></div>
                <div style={{ width:100, height:100, borderRadius:'50%', background:'var(--tiffany)', margin:'0 auto', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--delft-blue)', fontFamily:'Mont', fontWeight:900 }}>Guest</div>
                <div style={{ background:'rgba(255,255,255,0.1)', padding:'8px 14px', borderRadius:8, fontFamily:'Mont', fontWeight:700, fontSize:18, color:'#fff', textAlign:'center', letterSpacing:'0.1em' }}>
                  10:19:04
                </div>
              </div>
            </PhoneMock>
          </div>
        </div>
      </Section>

      {/* ============ DECK ============ */}
      <Section id="deck" eyebrow="11 / Presentation" title="Slide templates">
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
          {/* slide 1 */}
          <div style={{ aspectRatio:'16/9', background:'var(--delft-blue)', color:'#fff', borderRadius:'var(--r-md)', padding:40, position:'relative', overflow:'hidden', display:'flex', flexDirection:'column', justifyContent:'space-between' }}>
            <div style={{ fontFamily:'Mont', fontSize:11, letterSpacing:'0.2em', textTransform:'uppercase', color:'var(--tiffany)', fontWeight:700 }}>2026 · Investor Update</div>
            <div>
              <h3 style={{ fontFamily:'Mont', fontWeight:900, fontSize:42, lineHeight:1, margin:'0 0 12px', letterSpacing:'-0.02em' }}>The school<br/>of investment</h3>
              <div style={{ fontFamily:'Mont', fontSize:14, color:'var(--tiffany)', fontWeight:600 }}>Mansour Al-Derei · Founder</div>
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'end' }}>
              <Logo size={54} color="#fff" accent="var(--tiffany)"/>
              <div style={{ fontFamily:'Mont', fontSize:56, fontWeight:900, color:'var(--tiffany)' }}>01</div>
            </div>
          </div>
          {/* slide 2 — section header */}
          <div style={{ aspectRatio:'16/9', background:'var(--tiffany)', color:'var(--delft-blue)', borderRadius:'var(--r-md)', padding:40, position:'relative', overflow:'hidden', display:'flex', flexDirection:'column', justifyContent:'space-between' }}>
            <div style={{ fontFamily:'Mont', fontSize:11, letterSpacing:'0.2em', textTransform:'uppercase', fontWeight:700 }}>Section 02</div>
            <h3 style={{ fontFamily:'Mont', fontWeight:900, fontSize:64, margin:0, letterSpacing:'-0.03em', lineHeight:1 }}>Audience.</h3>
            <div style={{ position:'absolute', right:-40, bottom:-40, width:220, height:220, borderRadius:'50%', background:'var(--delft-blue)', opacity:0.15 }}/>
          </div>
          {/* slide 3 — data */}
          <div style={{ aspectRatio:'16/9', background:'#fff', color:'var(--delft-blue)', borderRadius:'var(--r-md)', padding:40, display:'grid', gridTemplateColumns:'1fr 1fr', gap:30 }}>
            <div>
              <Badge color="var(--sienna)" fg="#fff">Growth</Badge>
              <h3 style={{ fontFamily:'Mont', fontSize:32, fontWeight:900, margin:'12px 0', lineHeight:1 }}>47 episodes · 7.7M listeners</h3>
              <p style={{ fontSize:13, color:'#666', lineHeight:1.5 }}>Arabic-speaking entrepreneurs across the GCC, North Africa, and the diaspora. 62% new each quarter.</p>
            </div>
            <div style={{ display:'flex', alignItems:'end', gap:6 }}>
              {[20,28,34,46,52,70,88].map((h,i) => (
                <div key={i} style={{ flex:1, height:`${h}%`, background: i === 6 ? 'var(--sienna)' : 'var(--delft-blue)', borderRadius:3 }}/>
              ))}
            </div>
          </div>
          {/* slide 4 — quote */}
          <div style={{ aspectRatio:'16/9', background:'var(--bg-alt)', color:'#fff', borderRadius:'var(--r-md)', padding:40, position:'relative', display:'flex', flexDirection:'column', justifyContent:'center' }}>
            <div style={{ fontFamily:'Mont', fontWeight:900, fontSize:120, lineHeight:0.4, color:'var(--tiffany)', opacity:0.5 }}>"</div>
            <div className="ar" style={{ fontSize:30, fontWeight:700, lineHeight:1.4, textAlign:'right', direction:'rtl', margin:'10px 0 14px' }}>الخوف هو المحرك وليس الشغف</div>
            <div className="ar" style={{ fontSize:14, opacity:0.7, direction:'rtl', textAlign:'right' }}>— صلاح أبو المجد · EP 29</div>
          </div>
        </div>
      </Section>

      {/* ============ FOOTER ============ */}
      <footer style={{ background:'var(--bg-alt)', color:'var(--fg)', padding:'60px 8vw 40px', borderTop:'1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ maxWidth:1360, margin:'0 auto', display:'flex', gap:40, alignItems:'flex-start', justifyContent:'space-between', flexWrap:'wrap' }}>
          <div>
            <Logo size={80} color="var(--fg)" accent="var(--accent)"/>
            <p style={{ fontSize:13, opacity:0.6, maxWidth:320, marginTop:16, lineHeight:1.6 }}>
              This is a living design system. Fork it, extend it, build with it — then send us what you made.
            </p>
          </div>
          <div style={{ display:'flex', gap:60 }}>
            <div>
              <div style={{ fontFamily:'Mont', fontSize:11, letterSpacing:'0.18em', textTransform:'uppercase', color:'var(--accent)', fontWeight:700, marginBottom:12 }}>Resources</div>
              <div style={{ display:'grid', gap:8, fontSize:13, opacity:0.75 }}>
                <div>Logo files</div><div>Font kit</div><div>Pattern SVGs</div><div>Color tokens (CSS)</div>
              </div>
            </div>
            <div>
              <div style={{ fontFamily:'Mont', fontSize:11, letterSpacing:'0.18em', textTransform:'uppercase', color:'var(--accent)', fontWeight:700, marginBottom:12 }}>Version</div>
              <div style={{ fontSize:13, opacity:0.75 }}>v1.0 · April 2026</div>
              <div style={{ fontSize:13, opacity:0.75 }}>Maintained by TRENDZ Studio</div>
            </div>
          </div>
        </div>
        <div style={{ maxWidth:1360, margin:'48px auto 0', display:'flex', justifyContent:'space-between', fontSize:11, opacity:0.4, letterSpacing:'0.1em', textTransform:'uppercase' }}>
          <span>© 2026 TRENDZ × Investment School</span>
          <span>Press · to toggle tweaks</span>
        </div>
      </footer>

      <Tweaks theme={theme} setTheme={setTheme} showEditMode={showEditMode}/>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
