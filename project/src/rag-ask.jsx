/* ASK PAGE — Chat interface, theme-aware, bold-first */
const { useState, useEffect, useRef } = React;

function getQueryParam(name) {
  const u = new URL(window.location.href);
  return u.searchParams.get(name) || '';
}

function UserMsg({ text }) {
  return (
    <div style={{ display:'flex', gap:14, marginBottom:28 }}>
      <div style={{ width:40, height:40, borderRadius:'50%', background:'var(--accent-2)', color:'#fff', fontWeight:900, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:15 }}>أ</div>
      <div style={{ background:'var(--surface-alt)', color:'var(--fg-strong)', padding:'14px 20px', borderRadius:'4px 18px 18px 18px', fontSize:16, fontWeight:700, lineHeight:1.6, maxWidth:640, border:'2px solid var(--border)' }}>{text}</div>
    </div>
  );
}

function Loading({ stage }) {
  const stages = ['أبحث في النصوص…', 'أُرتّب أفضل المقاطع…', 'أستخلص إجابتك…'];
  return (
    <div style={{ display:'flex', gap:14, marginBottom:28 }}>
      <div style={{ width:40, height:40, borderRadius:12, background:'var(--accent)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
        <Mark size={20} color="var(--accent-ink)"/>
      </div>
      <div style={{ flex:1 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, fontSize:14, fontWeight:900, color:'var(--accent-2)', marginBottom:14 }}>
          <div style={{ display:'flex', gap:5 }}>
            <span style={{ width:8, height:8, borderRadius:'50%', background:'var(--accent-2)', animation:'pulse 1.4s ease-in-out infinite' }}/>
            <span style={{ width:8, height:8, borderRadius:'50%', background:'var(--accent-2)', animation:'pulse 1.4s ease-in-out 0.2s infinite' }}/>
            <span style={{ width:8, height:8, borderRadius:'50%', background:'var(--accent-2)', animation:'pulse 1.4s ease-in-out 0.4s infinite' }}/>
          </div>
          {stages[stage]}
        </div>
        <div style={{ display:'grid', gap:10 }}>
          <div style={{ height:14, background:'var(--surface-alt)', borderRadius:6, width:'90%' }}/>
          <div style={{ height:14, background:'var(--surface-alt)', borderRadius:6, width:'70%' }}/>
          <div style={{ height:14, background:'var(--surface-alt)', borderRadius:6, width:'85%' }}/>
        </div>
      </div>
      <style>{`@keyframes pulse { 0%,100%{opacity:.3} 50%{opacity:1} }`}</style>
    </div>
  );
}

function renderWithBold(text) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p,i) => {
    if (p.startsWith('**') && p.endsWith('**')) {
      return <mark key={i}>{p.slice(2,-2)}</mark>;
    }
    return <span key={i}>{p}</span>;
  });
}

function AssistantMsg({ answer, citations, onCite, playingAt }) {
  const [displayed, setDisplayed] = useState('');
  useEffect(() => {
    setDisplayed('');
    let i = 0;
    const t = setInterval(() => {
      i += 3;
      setDisplayed(answer.slice(0, i));
      if (i >= answer.length) clearInterval(t);
    }, 14);
    return () => clearInterval(t);
  }, [answer]);

  const paras = displayed.split('\n\n');
  return (
    <div style={{ display:'flex', gap:14, marginBottom:32 }}>
      <div style={{ width:40, height:40, borderRadius:12, background:'var(--accent)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
        <Mark size={20} color="var(--accent-ink)"/>
      </div>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:12, color:'var(--accent-2)', fontWeight:900, marginBottom:12, letterSpacing:'.05em', textTransform:'uppercase' }}>
          MADRASA AI · استخلصتُ الإجابة من {citations.length} مقاطع
        </div>
        <div style={{ fontSize:16, fontWeight:600, lineHeight:1.95, color:'var(--fg-strong)' }}>
          {paras.map((p,i) => <p key={i} style={{ margin:'0 0 14px' }}>{renderWithBold(p)}{i === paras.length-1 && displayed.length < answer.length && <span style={{ display:'inline-block', width:3, height:20, background:'var(--accent-2)', marginRight:2, verticalAlign:'middle', animation:'caret 1s step-end infinite' }}/>}</p>)}
        </div>
        {displayed.length >= answer.length && citations.length > 0 && (
          <>
            <div style={{ marginTop:20, padding:'16px 18px', background:'var(--surface-alt)', border:'2px solid var(--border-strong)', borderRadius:14 }}>
              <div style={{ fontSize:12, color:'var(--accent-2)', fontWeight:900, marginBottom:12, letterSpacing:'.04em', textTransform:'uppercase' }}>📎 المصادر · اضغط لتنتقل إلى اللحظة</div>
              <div style={{ display:'grid', gap:10 }}>
                {citations.map((c, i) => {
                  const ep = EPISODES_DATA.find(e => e.id === c.epId);
                  const isPlaying = playingAt && playingAt.epId === c.epId && playingAt.sec === c.sec;
                  return (
                    <button key={i} onClick={() => onCite(c)} style={{
                      textAlign:'right', padding:'12px 16px',
                      background: isPlaying ? 'var(--accent)' : 'var(--surface)',
                      color: isPlaying ? 'var(--accent-ink)' : 'var(--fg-strong)',
                      border: isPlaying ? '2px solid var(--accent)' : '2px solid var(--border)',
                      borderRadius:12, cursor:'pointer', display:'flex', gap:14, alignItems:'flex-start', transition:'all .15s', fontFamily:'inherit'
                    }}>
                      <div style={{ padding:'6px 12px', background:'var(--accent-2)', color:'#fff', borderRadius:8, fontSize:12, fontWeight:900, flexShrink:0, display:'flex', alignItems:'center', gap:5 }}>
                        {Ico.play} ح{ep?.num} · {c.t}
                      </div>
                      <div style={{ fontSize:14, fontWeight:600, lineHeight:1.7, fontStyle:'italic' }}>«{c.quoteAr}»</div>
                    </button>
                  );
                })}
              </div>
            </div>
            <div style={{ display:'flex', gap:10, marginTop:16 }}>
              <IconAction icon={Ico.copy} label="نسخ"/>
              <IconAction icon={Ico.bookmark} label="حفظ"/>
              <IconAction icon="👍" label="مفيد"/>
              <IconAction icon="👎" label="غير مفيد"/>
            </div>
          </>
        )}
      </div>
      <style>{`@keyframes caret { 0%,50%{opacity:1} 51%,100%{opacity:0} }`}</style>
    </div>
  );
}

function IconAction({ icon, label }) {
  return (
    <button style={{
      padding:'8px 14px', background:'var(--surface)', border:'2px solid var(--border)',
      borderRadius:10, color:'var(--fg)', fontSize:13, fontWeight:800, cursor:'pointer', display:'inline-flex', alignItems:'center', gap:6
    }}>{icon} {label}</button>
  );
}

function EpisodeInfo({ episode, seekTo, onSeekDone }) {
  const [playing, setPlaying] = useState(false);
  const [curSec, setCurSec] = useState(0);

  useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => setCurSec(s => Math.min(s+1, episode.durationSec)), 1000);
    return () => clearInterval(t);
  }, [playing, episode.durationSec]);

  useEffect(() => {
    if (seekTo != null) { setCurSec(seekTo); setPlaying(true); onSeekDone?.(); }
  }, [seekTo]);

  const pct = (curSec / episode.durationSec) * 100;

  return (
    <div className="ar" dir="rtl" style={{ padding:24, borderRight:'2px solid var(--border)', background:'var(--bg-alt)', height:'calc(100vh - 80px)', position:'sticky', top:80, overflowY:'auto' }}>
      <div style={{ fontSize:12, color:'var(--accent-2)', fontWeight:900, marginBottom:16, letterSpacing:'.06em', textTransform:'uppercase' }}>🎧 الحلقة الحالية</div>

      <div style={{ width:'100%', aspectRatio:'1', borderRadius:20, background:'linear-gradient(135deg, var(--accent) 0%, var(--accent-2) 100%)', position:'relative', overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:20, border:'3px solid var(--border-strong)', boxShadow:'var(--sh-brutal)' }}>
        <div style={{ position:'absolute', inset:0, backgroundImage:'repeating-linear-gradient(45deg, transparent 0 14px, rgba(255,255,255,0.12) 14px 15px)'}}/>
        <div style={{ fontFamily:'Mont', fontWeight:900, fontSize:120, color:'#fff', position:'relative', letterSpacing:'-0.05em' }}>{episode.num}</div>
      </div>

      <div style={{ fontSize:12, color:'var(--accent-2)', fontWeight:900, marginBottom:8, letterSpacing:'.04em', textTransform:'uppercase' }}>حلقة {episode.num} · {episode.duration}</div>
      <h3 style={{ fontSize:20, fontWeight:900, margin:'0 0 10px', lineHeight:1.35, color:'var(--fg-strong)' }}>{episode.titleAr}</h3>
      <div style={{ fontSize:14, fontWeight:800, color:'var(--fg-muted)', marginBottom:20 }}>{episode.guestAr} · {episode.guestRoleAr}</div>

      {/* player */}
      <div style={{ background:'var(--surface)', border:'2px solid var(--border-strong)', borderRadius:14, padding:'14px 16px', display:'flex', alignItems:'center', gap:14, marginBottom:20 }}>
        <button onClick={()=>setPlaying(!playing)} style={{ width:44, height:44, borderRadius:'50%', background:'var(--accent-2)', color:'#fff', border:0, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
          {playing ? Ico.pause : Ico.play}
        </button>
        <div style={{ flex:1 }}>
          <div style={{ height:6, background:'var(--surface-alt)', borderRadius:3, overflow:'hidden' }}>
            <div style={{ height:'100%', width:`${pct}%`, background:'var(--accent-2)' }}/>
          </div>
          <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, fontWeight:900, color:'var(--fg-muted)', marginTop:8, fontFamily:'Mont' }}>
            <span>{fmtTime(curSec)}</span>
            <span>{episode.duration}</span>
          </div>
        </div>
      </div>

      <p style={{ fontSize:14, fontWeight:600, lineHeight:1.75, color:'var(--fg)', margin:'0 0 18px' }}>{episode.summaryAr}</p>

      <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:20 }}>
        {episode.topicsAr?.map(t => <span key={t} style={{ fontSize:12, fontWeight:800, padding:'5px 12px', background:'var(--surface)', color:'var(--fg-strong)', borderRadius:999, border:'2px solid var(--border)' }}>{t}</span>)}
      </div>

      <div style={{ padding:'14px 16px', background:'var(--surface)', border:'2px solid var(--border)', borderRadius:12, display:'flex', justifyContent:'space-between', fontSize:13, fontWeight:800, color:'var(--fg)' }}>
        <span>{fmtK(episode.plays)} استماع</span>
        <span style={{color:'var(--accent-2)'}}>حلقة #{episode.num}</span>
      </div>
    </div>
  );
}

function Sidebar({ onPick, onStartOver, recent }) {
  return (
    <div className="ar" dir="rtl" style={{ height:'calc(100vh - 80px)', position:'sticky', top:80, padding:22, overflowY:'auto', borderLeft:'2px solid var(--border)', background:'var(--bg-alt)' }}>
      <button onClick={onStartOver} style={{ width:'100%', padding:'14px 18px', background:'var(--accent-2)', color:'#fff', border:0, borderRadius:14, fontWeight:900, fontSize:15, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8, marginBottom:28, boxShadow:'var(--sh-2)' }}>
        {Ico.plus} محادثة جديدة
      </button>

      <div style={{ fontSize:12, color:'var(--accent-2)', fontWeight:900, marginBottom:14, letterSpacing:'.06em', textTransform:'uppercase' }}>الأسئلة الشائعة</div>
      <div style={{ display:'grid', gap:8, marginBottom:30 }}>
        {FAQ.slice(0,5).map((f,i) => (
          <button key={i} onClick={() => onPick(f.qAr)} style={{ textAlign:'right', padding:'12px 14px', background:'var(--surface)', border:'2px solid var(--border)', borderRadius:12, color:'var(--fg-strong)', fontSize:13.5, fontWeight:700, lineHeight:1.55, cursor:'pointer', fontFamily:'inherit' }}>
            <div>{f.qAr}</div>
            <div style={{ fontSize:11, fontWeight:800, color:'var(--accent-2)', marginTop:6 }}>{f.hits.toLocaleString('ar')} سألوا</div>
          </button>
        ))}
      </div>

      {recent.length > 0 && (
        <>
          <div style={{ fontSize:12, color:'var(--accent-2)', fontWeight:900, marginBottom:12, letterSpacing:'.06em', textTransform:'uppercase' }}>أسئلتك الأخيرة</div>
          <div style={{ display:'grid', gap:4 }}>
            {recent.slice(0,8).map((r,i) => (
              <button key={i} onClick={()=>onPick(r)} style={{ textAlign:'right', padding:'10px 12px', background:'transparent', border:0, color:'var(--fg)', fontSize:13, fontWeight:700, cursor:'pointer', borderRadius:8, fontFamily:'inherit' }}>• {r}</button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function ChatApp() {
  const initialQ = getQueryParam('q');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(null);
  const [seekTo, setSeekTo] = useState(null);
  const [currentEp, setCurrentEp] = useState(EPISODES_DATA[0]);
  const [recent, setRecent] = useState([]);
  const [queriesLeft, setQueriesLeft] = useState(17);
  const scrollRef = useRef(null);

  useEffect(() => { if (initialQ) ask(initialQ); }, []);
  useEffect(() => { scrollRef.current?.scrollTo({ top: 9e9, behavior:'smooth' }); }, [messages, loading]);

  function ask(q) {
    if (!q.trim()) return;
    setInput('');
    setRecent(r => [q, ...r.filter(x => x !== q)].slice(0, 10));
    setMessages(m => [...m, { role:'user', text:q }]);
    setLoading(0);
    setTimeout(()=>setLoading(1), 700);
    setTimeout(()=>setLoading(2), 1400);
    setTimeout(() => {
      const key = findAnswerKey(q);
      const a = RAG_ANSWERS[key];
      setMessages(m => [...m, { role:'assistant', text:a.answerAr, citations:a.citations }]);
      setLoading(null);
      setQueriesLeft(n => Math.max(0, n-1));
      if (a.citations?.[0]) {
        const ep = EPISODES_DATA.find(e => e.id === a.citations[0].epId);
        if (ep) setCurrentEp(ep);
      }
    }, 2100);
  }

  function handleCite(c) {
    const ep = EPISODES_DATA.find(e => e.id === c.epId);
    if (ep) { setCurrentEp(ep); setSeekTo(c.sec); }
  }

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)', color:'var(--fg)' }}>
      <Nav active="ask"/>
      <div className="ask-grid" style={{ display:'grid', gridTemplateColumns:'260px minmax(0, 1fr) 340px', gap:0, paddingTop:80 }}>
        <style>{`
          @media (max-width: 1200px) {
            .ask-grid { grid-template-columns: minmax(0, 1fr) 320px !important; }
            .ask-sidebar-left { display: none !important; }
          }
          @media (max-width: 900px) {
            .ask-grid { grid-template-columns: minmax(0, 1fr) !important; }
            .ask-episode { display: none !important; }
          }
        `}</style>
        {/* left sidebar */}
        <div className="ask-sidebar-left"><Sidebar onPick={ask} onStartOver={() => setMessages([])} recent={recent}/></div>

        {/* center chat */}
        <div className="ar" dir="rtl" style={{ display:'flex', flexDirection:'column', height:'calc(100vh - 80px)' }}>
          {/* header */}
          <div style={{ padding:'18px 28px', borderBottom:'2px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <div>
              <div style={{ fontSize:17, fontWeight:900, color:'var(--fg-strong)' }}>اسأل المساعد</div>
              <div style={{ fontSize:12, fontWeight:700, color:'var(--fg-muted)' }}>يستطيع المساعد أن يخطئ — راجع المصادر دائماً.</div>
            </div>
            <div style={{ display:'flex', gap:8, alignItems:'center' }}>
              <span style={{ padding:'8px 14px', background: queriesLeft < 5 ? 'var(--accent-2)' : 'var(--accent)', color: queriesLeft < 5 ? '#fff' : 'var(--accent-ink)', borderRadius:999, fontSize:12, fontWeight:900 }}>
                {queriesLeft} سؤال متبقّي
              </span>
            </div>
          </div>

          {/* messages */}
          <div ref={scrollRef} style={{ flex:1, overflowY:'auto', padding:'32px 36px' }}>
            {messages.length === 0 && (
              <div style={{ maxWidth:660, margin:'6vh auto 0', textAlign:'center' }}>
                <div style={{ width:84, height:84, borderRadius:20, background:'var(--accent)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 28px', boxShadow:'var(--sh-brutal)' }}>
                  <Mark size={44} color="var(--accent-ink)"/>
                </div>
                <h1 style={{ fontFamily:'IBM Plex Sans Arabic', fontSize:42, fontWeight:700, margin:'0 0 16px', letterSpacing:'-0.02em', color:'var(--fg-strong)' }}>أهلاً بك في <span style={{color:'var(--accent-2)'}}>Madrasa AI</span></h1>
                <p style={{ fontSize:17, fontWeight:600, color:'var(--fg-muted)', lineHeight:1.7, margin:'0 0 36px' }}>
                  مساعدٌ ذكيٌّ مبنيٌّ على ٤٧ حلقة من «مدرسة الاستثمار». اسأل أي شيء — وسأستخلص لك الإجابة بمصادر دقيقة.
                </p>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                  {FAQ.slice(0,4).map((f,i) => (
                    <button key={i} onClick={()=>ask(f.qAr)} style={{ textAlign:'right', padding:'16px 18px', background:'var(--surface)', border:'2px solid var(--border-strong)', borderRadius:16, cursor:'pointer', color:'var(--fg-strong)', fontFamily:'inherit', boxShadow: i%2? 'var(--sh-2)':'var(--sh-brutal)' }}>
                      <div style={{ fontSize:14.5, fontWeight:700, lineHeight:1.55, marginBottom:10 }}>{f.qAr}</div>
                      <div style={{ fontSize:11, color:'var(--accent-2)', fontWeight:900, letterSpacing:'.04em', textTransform:'uppercase' }}>حلقة {f.epNum} · {f.hits.toLocaleString('ar')} سألوا</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((m,i) => m.role === 'user'
              ? <UserMsg key={i} text={m.text}/>
              : <AssistantMsg key={i} answer={m.text} citations={m.citations||[]} onCite={handleCite} playingAt={null}/>
            )}
            {loading != null && <Loading stage={loading}/>}
          </div>

          {/* input */}
          <div style={{ padding:'20px 28px', borderTop:'2px solid var(--border)', background:'var(--bg-alt)' }}>
            <div style={{ background:'var(--surface)', border:'3px solid var(--border-strong)', borderRadius:18, padding:8, display:'flex', alignItems:'center', gap:8, boxShadow:'var(--sh-2)' }}>
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') ask(input); }}
                placeholder="اطرح سؤالك…"
                disabled={queriesLeft === 0}
                style={{ flex:1, padding:'14px 18px', background:'transparent', border:0, outline:0, color:'var(--fg-strong)', fontSize:16, fontWeight:700, fontFamily:'IBM Plex Sans Arabic', direction:'rtl', textAlign:'right' }}
              />
              <button onClick={()=>ask(input)} disabled={!input.trim() || queriesLeft === 0} style={{ padding:'14px 24px', background:input.trim() && queriesLeft>0 ? 'var(--accent-2)' : 'var(--surface-alt)', color: input.trim() && queriesLeft>0 ? '#fff':'var(--fg-muted)', border:0, borderRadius:14, fontWeight:900, fontSize:14, cursor: input.trim() && queriesLeft>0 ? 'pointer':'not-allowed', display:'inline-flex', alignItems:'center', gap:6 }}>
                إرسال {Ico.send}
              </button>
            </div>
          </div>
        </div>

        {/* right episode viewer */}
        <div className="ask-episode"><EpisodeInfo episode={currentEp} seekTo={seekTo} onSeekDone={()=>setSeekTo(null)}/></div>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<ChatApp/>);
