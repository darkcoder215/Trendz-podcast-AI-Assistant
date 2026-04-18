/* LEADERBOARD + FAQ + BADGES PAGE — theme-aware, bold-first */
const { useState, useEffect } = React;

function Hero() {
  return (
    <section className="ar" dir="rtl" style={{ padding:'150px 40px 70px', position:'relative', overflow:'hidden' }}>
      <BgPattern opacity={0.7}/>
      <div style={{ maxWidth:1280, margin:'0 auto', textAlign:'center', position:'relative', zIndex:1 }}>
        <div style={{ display:'inline-block', padding:'6px 16px', background:'var(--accent)', color:'var(--accent-ink)', borderRadius:999, fontSize:12, fontWeight:900, marginBottom:20, letterSpacing:'0.06em', textTransform:'uppercase' }}>المجتمع</div>
        <h1 style={{ fontFamily:'IBM Plex Sans Arabic', fontSize:'clamp(48px, 6.5vw, 84px)', fontWeight:700, margin:'0 0 18px', letterSpacing:'-0.03em', color:'var(--fg-strong)', lineHeight:1.1 }}>
          المتصدّرون، الشارات<br/>
          <span style={{color:'var(--accent-2)'}}>والأسئلة الأكثر شيوعاً.</span>
        </h1>
        <p style={{ fontSize:19, fontWeight:600, color:'var(--fg-muted)', maxWidth:660, margin:'0 auto', lineHeight:1.7 }}>
          تنافس، تعلّم، واربح شارات كلما تعمّقت في الأسئلة.
        </p>
      </div>
    </section>
  );
}

function StatsStrip() {
  const stats = [
    { v:'١٢,٤٨٠', l:'عضو نشط', c:'var(--accent-2)' },
    { v:'٨٩,٢١٠', l:'سؤال هذا الشهر', c:'var(--accent)' },
    { v:'٤٢,٦٣٠', l:'رؤية محفوظة', c:'var(--accent-4)' },
    { v:'٦٤٥ ألف', l:'دقيقة مُوَفَّرة', c:'var(--accent-2)' },
  ];
  return (
    <div style={{ maxWidth:1200, margin:'0 auto 70px', padding:'0 40px', display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:18 }}>
      {stats.map((s,i) => (
        <div key={s.l} style={{ padding:'28px 22px', background:'var(--surface)', border:'3px solid var(--border-strong)', borderRadius:18, textAlign:'center', boxShadow: i%2===0 ? 'var(--sh-brutal)' : 'var(--sh-2)' }}>
          <div style={{ fontFamily:'Mont', fontWeight:900, fontSize:36, color:s.c, lineHeight:1 }}>{s.v}</div>
          <div style={{ fontSize:13, fontWeight:800, color:'var(--fg)', marginTop:12 }}>{s.l}</div>
        </div>
      ))}
    </div>
  );
}

function Leaderboard() {
  const [period, setPeriod] = useState('month');
  return (
    <section className="ar" dir="rtl" style={{ padding:'0 40px 90px' }}>
      <div style={{ maxWidth:1280, margin:'0 auto' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'end', marginBottom:36, gap:20, flexWrap:'wrap' }}>
          <div>
            <div style={{ display:'inline-block', padding:'6px 14px', background:'var(--accent-4)', color:'#0f1631', borderRadius:999, fontSize:12, fontWeight:900, marginBottom:14, letterSpacing:'0.04em', textTransform:'uppercase' }}>🏆 المتصدّرون</div>
            <h2 style={{ fontFamily:'IBM Plex Sans Arabic', fontSize:44, fontWeight:700, margin:0, letterSpacing:'-0.03em', color:'var(--fg-strong)' }}>أبطال هذا الشهر</h2>
          </div>
          <div style={{ display:'inline-flex', padding:5, background:'var(--surface)', border:'2px solid var(--border-strong)', borderRadius:14 }}>
            {[['week','الأسبوع'],['month','الشهر'],['year','السنة'],['all','الكل']].map(([id,label]) => (
              <button key={id} onClick={()=>setPeriod(id)} style={{ padding:'10px 18px', background: period===id?'var(--accent)':'transparent', color: period===id?'var(--accent-ink)':'var(--fg)', border:0, borderRadius:10, fontSize:13, fontWeight:900, cursor:'pointer', fontFamily:'inherit' }}>{label}</button>
            ))}
          </div>
        </div>

        {/* Top 3 podium */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1.15fr 1fr', gap:18, marginBottom:44, alignItems:'end' }}>
          <PodiumCard user={LEADERBOARD[1]} place={2} h={190}/>
          <PodiumCard user={LEADERBOARD[0]} place={1} h={230}/>
          <PodiumCard user={LEADERBOARD[2]} place={3} h={170}/>
        </div>

        {/* Rest of table */}
        <div style={{ background:'var(--surface)', border:'3px solid var(--border-strong)', borderRadius:22, overflow:'hidden', boxShadow:'var(--sh-2)' }}>
          <div style={{ padding:'16px 24px', display:'grid', gridTemplateColumns:'60px 1fr 140px 110px 110px', gap:20, fontSize:12, color:'var(--accent-2)', fontWeight:900, letterSpacing:'0.05em', textTransform:'uppercase', borderBottom:'3px solid var(--border-strong)', background:'var(--surface-alt)' }}>
            <div>#</div><div>العضو</div><div style={{ textAlign:'center' }}>نقاط الخبرة</div><div style={{ textAlign:'center' }}>الشارات</div><div style={{ textAlign:'center' }}>المتواصل</div>
          </div>
          {LEADERBOARD.slice(3).map(u => (
            <div key={u.rank} style={{ padding:'16px 24px', display:'grid', gridTemplateColumns:'60px 1fr 140px 110px 110px', gap:20, alignItems:'center', borderBottom:'2px solid var(--border)', background: u.isYou?'var(--accent)':'transparent', color: u.isYou?'var(--accent-ink)':'var(--fg)' }}>
              <div style={{ fontFamily:'Mont', fontWeight:900, fontSize:19, color: u.isYou?'var(--accent-ink)':'var(--fg-muted)' }}>#{u.rank}</div>
              <div style={{ display:'flex', alignItems:'center', gap:14 }}>
                <div style={{ width:44, height:44, borderRadius:'50%', background:u.color, color: u.color==='#efc846'||u.color==='#8bd8bd' ?'#273773':'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:900, fontSize:13, border:'2px solid var(--fg-strong)' }}>{u.avatar}</div>
                <div>
                  <div style={{ fontSize:15, fontWeight:800 }}>{u.nameAr} {u.isYou && <span style={{ fontSize:11, padding:'3px 10px', background:'var(--fg-strong)', color:'var(--accent)', borderRadius:999, marginRight:6, fontWeight:900, letterSpacing:'0.05em', textTransform:'uppercase' }}>أنت</span>}</div>
                </div>
              </div>
              <div style={{ textAlign:'center', fontFamily:'Mont', fontWeight:900, fontSize:16, color: u.isYou?'var(--accent-ink)':'var(--accent-2)' }}>{u.xp.toLocaleString('ar')}</div>
              <div style={{ textAlign:'center', fontSize:14, fontWeight:800 }}>{u.badges}</div>
              <div style={{ textAlign:'center', display:'inline-flex', alignItems:'center', justifyContent:'center', gap:4, color: u.isYou ? 'var(--accent-ink)' : (u.streak>20?'var(--accent-2)':'var(--fg)'), fontSize:14, fontWeight:900 }}>
                {Ico.flame} {u.streak}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PodiumCard({ user, place, h }) {
  const medal = ['🥇','🥈','🥉'][place-1];
  const ring = ['#efc846','#c0c0c0','#cd7f32'][place-1];
  return (
    <div style={{ position:'relative' }}>
      <div style={{ textAlign:'center', marginBottom:18 }}>
        <div style={{ fontSize:38, marginBottom:10 }}>{medal}</div>
        <div style={{ width:82, height:82, borderRadius:'50%', background:user.color, color: user.color==='#efc846'||user.color==='#8bd8bd'?'#273773':'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:900, fontSize:22, margin:'0 auto 14px', boxShadow:`0 0 0 5px ${ring}`, fontFamily:'IBM Plex Sans Arabic' }}>{user.avatar}</div>
        <div style={{ fontSize:16, fontWeight:900, color:'var(--fg-strong)' }}>{user.nameAr}</div>
        <div style={{ fontFamily:'Mont', fontWeight:900, fontSize:32, color:'var(--accent-2)', marginTop:6 }}>{user.xp.toLocaleString('ar')}</div>
        <div style={{ fontSize:12, fontWeight:800, color:'var(--fg-muted)', letterSpacing:'0.05em', textTransform:'uppercase' }}>نقطة خبرة</div>
      </div>
      <div style={{ height:h, background: place===1?'var(--accent-4)':'var(--surface-alt)', border:`3px solid ${place===1?'#d8a820':'var(--border-strong)'}`, borderRadius:'16px 16px 0 0', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Mont', fontWeight:900, fontSize:86, color: place===1?'#8a6a10':'var(--fg-muted)', opacity: place===1?0.55:0.4 }}>
        {place}
      </div>
    </div>
  );
}

function TopGuests() {
  const [sortBy, setSortBy] = useState('citations');
  const sorted = [...GUESTS].sort((a,b) => sortBy==='citations' ? b.citations-a.citations : sortBy==='episodes' ? b.episodes-a.episodes : parseInt(b.askRate)-parseInt(a.askRate));
  return (
    <section className="ar" dir="rtl" style={{ padding:'90px 40px', background:'var(--bg-alt)' }}>
      <div style={{ maxWidth:1280, margin:'0 auto' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'end', marginBottom:36, gap:20, flexWrap:'wrap' }}>
          <div>
            <div style={{ display:'inline-block', padding:'6px 14px', background:'var(--accent-2)', color:'#fff', borderRadius:999, fontSize:12, fontWeight:900, marginBottom:14, letterSpacing:'0.05em', textTransform:'uppercase' }}>🎙️ الضيوف الأكثر تأثيراً</div>
            <h2 style={{ fontFamily:'IBM Plex Sans Arabic', fontSize:44, fontWeight:700, margin:0, letterSpacing:'-0.03em', color:'var(--fg-strong)' }}>أبرز ضيوف «مدرسة الاستثمار».</h2>
            <p style={{ fontSize:16, fontWeight:600, color:'var(--fg-muted)', marginTop:14, maxWidth:620, lineHeight:1.7 }}>الضيوف الذين يُستشهَد بكلامهم أكثر من غيرهم في إجابات المساعد — مرتّبون حسب عدد الاقتباسات ومعدّل البحث عنهم.</p>
          </div>
          <div style={{ display:'inline-flex', padding:5, background:'var(--surface)', border:'2px solid var(--border-strong)', borderRadius:14 }}>
            {[['citations','اقتباسات'],['episodes','حلقات'],['askRate','بحث']].map(([id,label]) => (
              <button key={id} onClick={()=>setSortBy(id)} style={{ padding:'10px 18px', background: sortBy===id?'var(--accent)':'transparent', color: sortBy===id?'var(--accent-ink)':'var(--fg)', border:0, borderRadius:10, fontSize:13, fontWeight:900, cursor:'pointer', fontFamily:'inherit' }}>{label}</button>
            ))}
          </div>
        </div>

        {/* Top 3 featured cards */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:18, marginBottom:18 }}>
          {sorted.slice(0,3).map((g, i) => (
            <div key={g.nameAr} style={{ padding:28, background: i===0 ? 'var(--accent)' : 'var(--surface)', color: i===0 ? 'var(--accent-ink)' : 'var(--fg-strong)', border:'3px solid var(--border-strong)', borderRadius:22, boxShadow: i===0 ? 'var(--sh-brutal)' : 'var(--sh-2)', position:'relative', overflow:'hidden' }}>
              <div style={{ position:'absolute', top:-20, left:-20, fontFamily:'Mont', fontWeight:900, fontSize:140, color: i===0 ? 'rgba(15,22,49,0.08)' : 'rgba(249,110,70,0.08)', lineHeight:1 }}>#{i+1}</div>
              <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:18, position:'relative' }}>
                <div style={{ width:64, height:64, borderRadius:16, background:g.color, color: g.color==='#efc846'||g.color==='#8bd8bd' ? '#273773' : '#fff', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:900, fontSize:17, fontFamily:'IBM Plex Sans Arabic', border:'3px solid var(--fg-strong)', flexShrink:0 }}>{g.avatar}</div>
                <div style={{ minWidth:0 }}>
                  <div style={{ fontSize:18, fontWeight:900, lineHeight:1.3 }}>{g.nameAr}</div>
                  <div style={{ fontSize:12, fontWeight:800, opacity:0.75, marginTop:4 }}>{g.roleAr}</div>
                </div>
              </div>
              <blockquote style={{ margin:'0 0 20px', padding:'14px 16px', background: i===0 ? 'rgba(15,22,49,0.08)' : 'var(--surface-alt)', borderRadius:12, fontSize:14, fontWeight:700, lineHeight:1.6, fontStyle:'italic', borderRight: `3px solid ${i===0?'var(--accent-ink)':'var(--accent-2)'}` }}>
                «{g.topQuoteAr}»
              </blockquote>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:10, marginBottom:16 }}>
                <GuestStat v={g.citations.toLocaleString('ar')} l="اقتباس" big accent={i!==0}/>
                <GuestStat v={g.episodes} l="حلقات" accent={i!==0}/>
                <GuestStat v={g.askRate} l="بحث" accent={i!==0}/>
              </div>
              <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                {g.tagsAr.map(t => <span key={t} style={{ fontSize:11, fontWeight:800, padding:'5px 10px', background: i===0 ? 'rgba(15,22,49,0.1)' : 'var(--surface-alt)', color: i===0 ? 'var(--accent-ink)' : 'var(--fg-strong)', borderRadius:999, border: i===0 ? '1.5px solid rgba(15,22,49,0.2)' : '1.5px solid var(--border)' }}>{t}</span>)}
              </div>
            </div>
          ))}
        </div>

        {/* Rest of table */}
        <div style={{ background:'var(--surface)', border:'3px solid var(--border-strong)', borderRadius:22, overflow:'hidden', boxShadow:'var(--sh-1)' }}>
          <div style={{ padding:'16px 24px', display:'grid', gridTemplateColumns:'60px 1fr 220px 110px 110px 110px', gap:18, fontSize:12, color:'var(--accent-2)', fontWeight:900, letterSpacing:'0.05em', textTransform:'uppercase', borderBottom:'3px solid var(--border-strong)', background:'var(--surface-alt)' }}>
            <div>#</div><div>الضيف</div><div>المواضيع</div><div style={{ textAlign:'center' }}>اقتباسات</div><div style={{ textAlign:'center' }}>حلقات</div><div style={{ textAlign:'center' }}>معدّل البحث</div>
          </div>
          {sorted.slice(3).map((g, i) => (
            <div key={g.nameAr} style={{ padding:'18px 24px', display:'grid', gridTemplateColumns:'60px 1fr 220px 110px 110px 110px', gap:18, alignItems:'center', borderBottom: i === sorted.length-4 ? 0 : '2px solid var(--border)' }}>
              <div style={{ fontFamily:'Mont', fontWeight:900, fontSize:19, color:'var(--fg-muted)' }}>#{i+4}</div>
              <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                <div style={{ width:42, height:42, borderRadius:'50%', background:g.color, color: g.color==='#efc846'||g.color==='#8bd8bd' ? '#273773' : '#fff', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:900, fontSize:12, border:'2px solid var(--fg-strong)', flexShrink:0 }}>{g.avatar}</div>
                <div style={{ minWidth:0 }}>
                  <div style={{ fontSize:14.5, fontWeight:900, color:'var(--fg-strong)' }}>{g.nameAr}</div>
                  <div style={{ fontSize:12, fontWeight:700, color:'var(--fg-muted)', marginTop:2 }}>{g.roleAr}</div>
                </div>
              </div>
              <div style={{ display:'flex', gap:4, flexWrap:'wrap' }}>
                {g.tagsAr.slice(0,2).map(t => <span key={t} style={{ fontSize:11, fontWeight:800, padding:'4px 9px', background:'var(--surface-alt)', color:'var(--fg-strong)', borderRadius:999, border:'1.5px solid var(--border)' }}>{t}</span>)}
              </div>
              <div style={{ textAlign:'center', fontFamily:'Mont', fontWeight:900, fontSize:16, color:'var(--accent-2)' }}>{g.citations.toLocaleString('ar')}</div>
              <div style={{ textAlign:'center', fontSize:14, fontWeight:900, color:'var(--fg-strong)' }}>{g.episodes}</div>
              <div style={{ textAlign:'center', fontSize:14, fontWeight:900, color:'var(--fg-strong)' }}>{g.askRate}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function GuestStat({ v, l, big, accent }) {
  return (
    <div style={{ textAlign:'center', padding:'10px 4px', background:'transparent' }}>
      <div style={{ fontFamily:'Mont', fontWeight:900, fontSize: big ? 22 : 18, color: accent ? 'var(--accent-2)' : 'inherit', lineHeight:1 }}>{v}</div>
      <div style={{ fontSize:10, fontWeight:800, opacity:0.7, marginTop:6, letterSpacing:'0.04em', textTransform:'uppercase' }}>{l}</div>
    </div>
  );
}

function Badges() {
  return (
    <section className="ar" dir="rtl" style={{ padding:'90px 40px', background:'var(--bg-alt)' }}>
      <div style={{ maxWidth:1280, margin:'0 auto' }}>
        <div style={{ marginBottom:36 }}>
          <div style={{ display:'inline-block', padding:'6px 14px', background:'var(--accent-2)', color:'#fff', borderRadius:999, fontSize:12, fontWeight:900, marginBottom:14, letterSpacing:'0.05em', textTransform:'uppercase' }}>🏅 الشارات</div>
          <h2 style={{ fontFamily:'IBM Plex Sans Arabic', fontSize:44, fontWeight:700, margin:0, letterSpacing:'-0.03em', color:'var(--fg-strong)' }}>اجمع شاراتك.</h2>
          <p style={{ fontSize:17, fontWeight:600, color:'var(--fg-muted)', marginTop:14 }}>لكل نشاط تقوم به في المساعد مكافأة. ربحتَ <strong style={{color:'var(--accent-2)'}}>٤ شارات</strong> حتى الآن من أصل ١٢.</p>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(260px, 1fr))', gap:18 }}>
          {BADGES.map((b,i) => (
            <div key={b.nameAr} style={{ padding:28, background: b.earned?'var(--surface)':'var(--surface-alt)', border: b.earned?'3px solid var(--border-strong)':'2px dashed var(--border)', borderRadius:20, position:'relative', boxShadow: b.earned ? (i%2===0?'var(--sh-brutal)':'var(--sh-2)') : 'none' }}>
              <div style={{ fontSize:48, marginBottom:16, filter: b.earned?'none':'grayscale(1)', opacity: b.earned?1:0.45 }}>{b.icon}</div>
              <div style={{ fontSize:17, fontWeight:900, marginBottom:6, color:'var(--fg-strong)' }}>{b.nameAr}</div>
              <div style={{ fontSize:13, fontWeight:600, color:'var(--fg-muted)', lineHeight:1.65 }}>{b.descAr}</div>
              {b.earned ? (
                <div style={{ marginTop:16, display:'inline-flex', alignItems:'center', gap:6, padding:'6px 14px', background:'var(--accent)', color:'var(--accent-ink)', borderRadius:999, fontSize:12, fontWeight:900, letterSpacing:'0.04em', textTransform:'uppercase' }}>
                  {Ico.check} حصلت عليها
                </div>
              ) : (
                <div style={{ marginTop:16 }}>
                  <div style={{ height:8, background:'var(--border)', borderRadius:4, overflow:'hidden' }}>
                    <div style={{ height:'100%', width:`${(b.progress||0)*100}%`, background:'var(--accent-2)' }}/>
                  </div>
                  <div style={{ fontSize:12, fontWeight:800, color:'var(--fg-muted)', marginTop:8 }}>التقدّم: {Math.round((b.progress||0)*100)}٪</div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQSection() {
  const [filter, setFilter] = useState('all');
  const filtered = filter === 'all' ? FAQ : FAQ.filter(f => f.epNum === Number(filter));
  return (
    <section className="ar" dir="rtl" style={{ padding:'90px 40px' }}>
      <div style={{ maxWidth:1280, margin:'0 auto' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'end', marginBottom:36, gap:20, flexWrap:'wrap' }}>
          <div>
            <div style={{ display:'inline-block', padding:'6px 14px', background:'var(--accent)', color:'var(--accent-ink)', borderRadius:999, fontSize:12, fontWeight:900, marginBottom:14, letterSpacing:'0.05em', textTransform:'uppercase' }}>💬 الأسئلة الأكثر شيوعاً</div>
            <h2 style={{ fontFamily:'IBM Plex Sans Arabic', fontSize:44, fontWeight:700, margin:0, letterSpacing:'-0.03em', color:'var(--fg-strong)' }}>اللي سألها المجتمع.</h2>
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <Chip on={filter==='all'} onClick={()=>setFilter('all')}>الكل</Chip>
            <Chip on={filter==='29'} onClick={()=>setFilter('29')}>حلقة ٢٩</Chip>
            <Chip on={filter==='28'} onClick={()=>setFilter('28')}>حلقة ٢٨</Chip>
          </div>
        </div>
        <div style={{ display:'grid', gap:12 }}>
          {filtered.map((f,i) => (
            <a key={i} href={`Madrasa AI - Ask.html?q=${encodeURIComponent(f.qAr)}`} style={{ padding:'20px 26px', background:'var(--surface)', border:'2px solid var(--border-strong)', borderRadius:16, display:'flex', justifyContent:'space-between', alignItems:'center', gap:20, transition:'all .15s', boxShadow:'var(--sh-1)' }}
              onMouseEnter={e=>{ e.currentTarget.style.transform='translateX(-6px)'; e.currentTarget.style.boxShadow='var(--sh-brutal)'; }}
              onMouseLeave={e=>{ e.currentTarget.style.transform='translateX(0)'; e.currentTarget.style.boxShadow='var(--sh-1)'; }}
            >
              <div style={{ display:'flex', gap:16, alignItems:'center', flex:1 }}>
                <div style={{ width:42, height:42, borderRadius:12, background:'var(--accent)', color:'var(--accent-ink)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Mont', fontWeight:900, fontSize:14, flexShrink:0 }}>{String(i+1).padStart(2,'0')}</div>
                <div>
                  <div style={{ fontSize:16, fontWeight:800, marginBottom:4, color:'var(--fg-strong)' }}>{f.qAr}</div>
                  <div style={{ fontSize:12, fontWeight:800, color:'var(--fg-muted)', letterSpacing:'0.04em', textTransform:'uppercase' }}>حلقة {f.epNum} · {f.hits.toLocaleString('ar')} شخص سألوا</div>
                </div>
              </div>
              <div style={{ color:'var(--accent-2)', fontSize:14, fontWeight:900, display:'flex', alignItems:'center', gap:6 }}>اسأل {Ico.arrowLeft}</div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function Chip({ on, onClick, children }) {
  return <button onClick={onClick} style={{ padding:'10px 16px', background: on?'var(--accent)':'var(--surface)', color: on?'var(--accent-ink)':'var(--fg)', border: on?'2px solid var(--accent)':'2px solid var(--border)', borderRadius:999, fontSize:13, fontWeight:900, cursor:'pointer', fontFamily:'inherit' }}>{children}</button>;
}

function App() {
  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)', color:'var(--fg)' }}>
      <Nav active="leaderboard"/>
      <Hero/>
      <StatsStrip/>
      <Leaderboard/>
      <TopGuests/>
      <Badges/>
      <FAQSection/>
      <Footer/>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
