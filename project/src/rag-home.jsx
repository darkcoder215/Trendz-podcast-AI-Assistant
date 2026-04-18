/* LANDING PAGE — Arabic-first, business grade, BOLD + theme-aware */

const { useState, useEffect } = React;

function Hero() {
  const [q, setQ] = useState('');
  const suggestions = [
    'ما هو الدافع الحقيقي لرواد الأعمال؟',
    'إزاي أبدأ أستثمر بأقل مبلغ؟',
    'إيه سر العائد المركّب؟',
  ];
  return (
    <section className="ar" dir="rtl" style={{ padding:'170px 40px 100px', position:'relative', overflow:'hidden' }}>
      <BgPattern opacity={0.8}/>
      {/* floating shapes */}
      <div style={{ position:'absolute', top:180, left:60, width:96, height:96, borderRadius:'50%', background:'var(--accent-3)', opacity:0.35 }}/>
      <div style={{ position:'absolute', top:320, left:160, width:40, height:10, background:'var(--accent-2)', opacity:0.7, transform:'rotate(-30deg)', borderRadius:6 }}/>
      <div style={{ position:'absolute', top:240, right:110, width:18, height:18, borderRadius:'50%', background:'var(--accent-2)' }}/>
      <div style={{ position:'absolute', bottom:80, right:60, width:160, height:160, borderRadius:'50%', border:'3px solid var(--accent)', opacity:0.25 }}/>
      <div style={{ position:'absolute', top:120, right:'22%', width:8, height:40, background:'var(--accent-4)', borderRadius:4, transform:'rotate(15deg)' }}/>

      <div style={{ maxWidth:1100, margin:'0 auto', position:'relative', zIndex:1, textAlign:'center' }}>
        <div style={{ display:'inline-flex', alignItems:'center', gap:10, padding:'8px 18px', background:'var(--accent)', color:'var(--accent-ink)', border:'2px solid var(--accent)', borderRadius:999, fontSize:13, fontWeight:900, marginBottom:32, letterSpacing:'0.02em' }}>
          <span style={{ width:8, height:8, borderRadius:'50%', background:'var(--accent-ink)' }}/>
          إصدار تجريبي · ٤٧ حلقة مُفهرَسة · ٢.٨ مليون كلمة
        </div>

        <h1 style={{ fontFamily:'IBM Plex Sans Arabic', fontSize:'clamp(54px, 8vw, 104px)', fontWeight:700, lineHeight:1.05, letterSpacing:'-0.03em', margin:'0 0 28px', color:'var(--fg-strong)' }}>
          اِسأل البودكاست.<br/>
          <span style={{ color:'var(--accent-2)' }}>احصل على الإجابة فوراً.</span>
        </h1>

        <p style={{ fontSize:22, lineHeight:1.7, fontWeight:600, color:'var(--fg-muted)', maxWidth:760, margin:'0 auto 44px' }}>
          مساعدٌ ذكيٌّ استمع نيابةً عنك إلى كل حلقات «مدرسة الاستثمار». اطرح سؤالك،
          واحصل على إجابةٍ <strong style={{color:'var(--fg-strong)'}}>مُستخلَصةٍ من الحلقات</strong>، مع مصادرَ دقيقةٍ بالثانية.
        </p>

        {/* Big ask box */}
        <div style={{ maxWidth:720, margin:'0 auto 20px', background:'var(--surface)', border:'3px solid var(--border-strong)', borderRadius:20, padding:10, display:'flex', alignItems:'center', gap:10, boxShadow:'var(--sh-brutal)' }}>
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') window.location.href = `Madrasa AI - Ask.html?q=${encodeURIComponent(q)}`; }}
            placeholder="اكتب سؤالك هنا…"
            style={{ flex:1, padding:'16px 22px', background:'transparent', border:0, outline:0, color:'var(--fg-strong)', fontSize:17, fontWeight:700, fontFamily:'IBM Plex Sans Arabic', direction:'rtl', textAlign:'right' }}
          />
          <a href={`Madrasa AI - Ask.html${q ? `?q=${encodeURIComponent(q)}` : ''}`} style={{
            padding:'14px 30px', background:'var(--accent-2)', color:'#fff',
            borderRadius:14, fontWeight:900, fontSize:16, display:'inline-flex', alignItems:'center', gap:8
          }}>
            <span>اسأل الآن</span>
            {Ico.arrowLeft}
          </a>
        </div>

        <div style={{ display:'flex', flexWrap:'wrap', gap:10, justifyContent:'center', marginTop:24 }}>
          <span style={{ fontSize:13, fontWeight:700, color:'var(--fg-muted)', alignSelf:'center' }}>جرّب:</span>
          {suggestions.map(s => (
            <a key={s} href={`Madrasa AI - Ask.html?q=${encodeURIComponent(s)}`} style={{
              padding:'8px 16px', background:'var(--surface)', border:'2px solid var(--border)',
              borderRadius:999, fontSize:14, fontWeight:700, color:'var(--fg)'
            }}>{s}</a>
          ))}
        </div>

        {/* Stats strip */}
        <div style={{ marginTop:80, display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:20, maxWidth:900, margin:'96px auto 0' }}>
          {[
            { v:'٤٧', l:'حلقة مُفهرَسة' },
            { v:'٢.٨م', l:'كلمة في الأرشيف' },
            { v:'٣٢ثـ', l:'متوسط زمن الإجابة' },
            { v:'+١٢ك', l:'سؤال هذا الشهر' }
          ].map(s => (
            <div key={s.l} style={{ background:'var(--surface)', border:'3px solid var(--border-strong)', borderRadius:18, padding:'22px 18px', boxShadow:'var(--sh-brutal)' }}>
              <div style={{ fontFamily:'Mont', fontWeight:900, fontSize:46, color:'var(--accent-2)', lineHeight:1 }}>{s.v}</div>
              <div style={{ fontSize:14, fontWeight:800, color:'var(--fg)', marginTop:10 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SectionHead({ eyebrowAr, titleAr, descAr, center }) {
  return (
    <div style={{ textAlign: center ? 'center' : 'right', maxWidth: 900, margin: center ? '0 auto' : '0' }}>
      <div style={{ display:'inline-block', padding:'6px 14px', background:'var(--accent)', color:'var(--accent-ink)', borderRadius:999, fontSize:12, fontWeight:900, marginBottom:18, letterSpacing:'0.06em', textTransform:'uppercase' }}>{eyebrowAr}</div>
      <h2 style={{ fontFamily:'IBM Plex Sans Arabic', fontSize:'clamp(38px, 4.5vw, 60px)', fontWeight:700, margin:'0 0 18px', lineHeight:1.15, letterSpacing:'-0.03em', color:'var(--fg-strong)' }}>{titleAr}</h2>
      {descAr && <p style={{ fontSize:18, lineHeight:1.75, fontWeight:600, color:'var(--fg-muted)', margin:0 }}>{descAr}</p>}
    </div>
  );
}

function Benefits() {
  const items = [
    { icon:'💡', titleAr:'استخلاص الرؤى',
      descAr:'حوّل ساعاتٍ من الاستماع إلى رؤى مركّزة في ثوانٍ — دون الحاجة إلى مشاهدة الحلقة كاملة.' },
    { icon:'🎯', titleAr:'إجابات بمصادر',
      descAr:'كل إجابة مدعومة باقتباسات مباشرة وطابع زمني دقيق — اضغط لتنتقل إلى اللحظة بالضبط.' },
    { icon:'🔍', titleAr:'بحث عابر للحلقات',
      descAr:'اسأل سؤالاً واحداً يجمع لك وجهات نظر من عدة حلقات وضيوف مختلفين في إجابةٍ موحّدة.' },
    { icon:'📚', titleAr:'حفظ الرؤى',
      descAr:'احفظ الاقتباسات والمقاطع المهمة في مكتبتك الخاصة، وارجع إليها متى شئت.' },
    { icon:'🏆', titleAr:'شارات وتحديات',
      descAr:'اربح نقاط خبرة وشارات كلما تعمّقت في الأسئلة، وتنافس على قمة المتصدّرين.' },
    { icon:'⚡', titleAr:'تحديث مستمر',
      descAr:'كل حلقة جديدة تُضاف لقاعدة المعرفة تلقائياً خلال ساعتين من النشر.' },
  ];
  return (
    <section className="ar" dir="rtl" style={{ padding:'140px 40px', background:'var(--bg-alt)', position:'relative' }}>
      <div style={{ maxWidth:1280, margin:'0 auto' }}>
        <SectionHead
          eyebrowAr="لماذا Madrasa AI"
          titleAr="محتوى البودكاست بين يديك، مُنظَّماً وقابلاً للسؤال."
          descAr="حلقات «مدرسة الاستثمار» مليئة بالحكمة — لكن المحتوى الطويل يصعب استحضاره لحظة تحتاجه. هنا يأتي دور المساعد."
          center
        />
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(340px, 1fr))', gap:22, marginTop:72 }}>
          {items.map((it, i) => (
            <div key={it.titleAr} style={{
              padding:36, background:'var(--surface)', border:'3px solid var(--border-strong)', borderRadius:22,
              transition:'all .2s', boxShadow: i%2===0 ? 'var(--sh-brutal)' : 'var(--sh-2)'
            }}>
              <div style={{ fontSize:42, marginBottom:20 }}>{it.icon}</div>
              <h3 style={{ fontFamily:'IBM Plex Sans Arabic', fontSize:24, fontWeight:700, margin:'0 0 14px', color:'var(--fg-strong)' }}>{it.titleAr}</h3>
              <p style={{ fontSize:16, lineHeight:1.8, fontWeight:600, color:'var(--fg-muted)', margin:0 }}>{it.descAr}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { n:'١', titleAr:'اسأل بلغتك', descAr:'اطرح سؤالك بالعربية الفصحى أو باللهجة — المساعد يفهم الاثنتين.' },
    { n:'٢', titleAr:'يبحث المساعد', descAr:'يفحص ٢.٨ مليون كلمة من النصوص المفرّغة ويُرتّب أفضل المقاطع.' },
    { n:'٣', titleAr:'إجابة مُستخلَصة', descAr:'يستخلص إجابةً مركّزةً مع اقتباسات وطابع زمني دقيق لكل مصدر.' },
    { n:'٤', titleAr:'استمع للمصدر', descAr:'اضغط على أي اقتباس لتنتقل مباشرةً إلى تلك اللحظة في الحلقة.' },
  ];
  return (
    <section className="ar" dir="rtl" style={{ padding:'140px 40px' }}>
      <div style={{ maxWidth:1280, margin:'0 auto' }}>
        <SectionHead
          eyebrowAr="كيف يعمل"
          titleAr="من السؤال إلى الإجابة في أقل من دقيقة."
          center
        />
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:24, marginTop:80, position:'relative' }}>
          {/* Connection line */}
          <div style={{ position:'absolute', top:36, right:'12%', left:'12%', height:4, background:'linear-gradient(90deg, var(--accent) 0%, var(--accent-2) 100%)', borderRadius:2, zIndex:0 }}/>
          {steps.map(s => (
            <div key={s.n} style={{ position:'relative', zIndex:1, textAlign:'center' }}>
              <div style={{ width:72, height:72, borderRadius:'50%', background:'var(--accent)', color:'var(--accent-ink)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 24px', fontFamily:'IBM Plex Sans Arabic', fontWeight:700, fontSize:34, border:'4px solid var(--bg)', boxShadow:'0 0 0 4px var(--accent)' }}>{s.n}</div>
              <h3 style={{ fontFamily:'IBM Plex Sans Arabic', fontSize:22, fontWeight:700, margin:'0 0 12px', color:'var(--fg-strong)' }}>{s.titleAr}</h3>
              <p style={{ fontSize:15, lineHeight:1.75, fontWeight:600, color:'var(--fg-muted)', margin:0 }}>{s.descAr}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function DemoPreview() {
  return (
    <section className="ar" dir="rtl" style={{ padding:'100px 40px 140px', background:'var(--bg-alt)' }}>
      <div style={{ maxWidth:1280, margin:'0 auto' }}>
        <SectionHead
          eyebrowAr="نموذج تفاعلي"
          titleAr="شوف المساعد وهو بيشتغل."
          descAr="إجابة حقيقية على سؤال شائع، مع مصادر من حلقتين مختلفتين."
          center
        />
        <div style={{ marginTop:72, background:'var(--surface)', borderRadius:28, padding:40, border:'3px solid var(--border-strong)', maxWidth:960, margin:'72px auto 0', boxShadow:'var(--sh-brutal)' }}>
          {/* User message */}
          <div style={{ display:'flex', gap:16, justifyContent:'flex-start', marginBottom:32 }}>
            <div style={{ width:48, height:48, borderRadius:'50%', background:'var(--accent-2)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:900, fontSize:18, flexShrink:0 }}>أ</div>
            <div style={{ background:'var(--surface-alt)', color:'var(--fg-strong)', padding:'16px 22px', borderRadius:'4px 20px 20px 20px', fontSize:17, fontWeight:700, lineHeight:1.6 }}>
              هل الخوف أم الشغف هو اللي بيحرّك رواد الأعمال؟
            </div>
          </div>
          {/* Assistant */}
          <div style={{ display:'flex', gap:16 }}>
            <div style={{ width:48, height:48, borderRadius:12, background:'var(--accent)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <Mark size={24} color="var(--accent-ink)"/>
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:12, color:'var(--accent-2)', fontWeight:900, marginBottom:12, letterSpacing:'0.04em', textTransform:'uppercase' }}>Madrasa AI · استخلصتُ الإجابة من ٣ مقاطع</div>
              <div style={{ fontSize:17, lineHeight:1.9, fontWeight:600, color:'var(--fg-strong)' }}>
                وفقاً لصلاح أبو المجد في الحلقة ٢٩، فإن <mark>الخوف — لا الشغف — هو المحرّك الحقيقي</mark> وراء معظم رواد الأعمال. الشغف عنده إلى حدٍّ كبير وهم، والدافع الفعلي هو الخوف من الجمود.
                <br/><br/>
                المهم هو التمييز بين <mark style={{background:'var(--accent-2)',color:'#fff'}}>الخوف الصحي</mark> الذي يحرّكك، و<mark style={{background:'var(--accent-2)',color:'#fff'}}>الخوف المشلول</mark> الذي يجمّدك.
              </div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:10, marginTop:22 }}>
                {['٠١:١٨','١٢:٤٠','٢٢:١٥'].map(t => (
                  <span key={t} style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'8px 14px', background:'var(--accent)', color:'var(--accent-ink)', borderRadius:999, fontSize:13, fontWeight:900 }}>
                    {Ico.play} حلقة ٢٩ · {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div style={{ textAlign:'center', marginTop:36 }}>
            <a href="Madrasa AI - Ask.html" style={{ padding:'16px 32px', background:'var(--accent-2)', color:'#fff', borderRadius:999, fontSize:15, fontWeight:900, display:'inline-flex', alignItems:'center', gap:8, boxShadow:'var(--sh-2)' }}>
              جرّب المساعد الآن {Ico.arrowLeft}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function Episodes() {
  return (
    <section className="ar" dir="rtl" style={{ padding:'140px 40px' }}>
      <div style={{ maxWidth:1280, margin:'0 auto' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'end', gap:20, flexWrap:'wrap' }}>
          <SectionHead eyebrowAr="الحلقات الأخيرة" titleAr="ابدأ من حلقة واسأل عنها." descAr="كل الحلقات مُفهرَسة وجاهزة للسؤال."/>
          <a style={{ color:'var(--accent-2)', fontSize:15, fontWeight:900, display:'inline-flex', alignItems:'center', gap:6 }}>
            كل الحلقات {Ico.arrowLeft}
          </a>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(380px, 1fr))', gap:24, marginTop:60 }}>
          {EPISODES_DATA.map(ep => (
            <div key={ep.id} style={{ background:'var(--surface)', border:'3px solid var(--border-strong)', borderRadius:22, padding:26, transition:'all .2s', boxShadow:'var(--sh-2)' }}
              onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-4px)'; e.currentTarget.style.boxShadow='var(--sh-brutal)';}}
              onMouseLeave={e=>{e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='var(--sh-2)';}}
            >
              <div style={{ display:'flex', gap:18, marginBottom:18 }}>
                {/* Episode placeholder */}
                <div style={{ width:118, height:118, borderRadius:14, background:'linear-gradient(135deg, var(--accent) 0%, var(--accent-2) 100%)', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', position:'relative', overflow:'hidden' }}>
                  <div style={{ position:'absolute', inset:0, backgroundImage:'repeating-linear-gradient(45deg, transparent 0 10px, rgba(255,255,255,0.12) 10px 11px)'}}/>
                  <div style={{ fontFamily:'Mont', fontWeight:900, fontSize:44, color:'#fff', position:'relative' }}>{ep.num}</div>
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:12, color:'var(--accent-2)', fontWeight:900, marginBottom:6, letterSpacing:'0.04em', textTransform:'uppercase' }}>حلقة {ep.num} · {ep.duration}</div>
                  <h3 style={{ fontSize:19, fontWeight:700, margin:'0 0 6px', lineHeight:1.4, color:'var(--fg-strong)' }}>{ep.titleAr}</h3>
                  <div style={{ fontSize:14, fontWeight:700, color:'var(--fg-muted)' }}>مع {ep.guestAr}</div>
                </div>
              </div>
              <p style={{ fontSize:15, lineHeight:1.75, fontWeight:600, color:'var(--fg-muted)', margin:'0 0 20px' }}>{ep.summaryAr}</p>
              <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:20 }}>
                {ep.topicsAr.map(t => <span key={t} style={{ fontSize:12, fontWeight:800, padding:'5px 12px', background:'var(--surface-alt)', color:'var(--fg-strong)', borderRadius:999, border:'2px solid var(--border)' }}>{t}</span>)}
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', borderTop:'2px solid var(--border)', paddingTop:16 }}>
                <div style={{ fontSize:13, fontWeight:800, color:'var(--fg-muted)' }}>{fmtK(ep.plays)} استماع</div>
                <a href={`Madrasa AI - Ask.html?ep=${ep.id}`} style={{ padding:'10px 18px', background:'var(--accent)', color:'var(--accent-ink)', borderRadius:999, fontSize:13, fontWeight:900 }}>اسأل عن الحلقة</a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  const plans = [
    { nameAr:'مجاني', priceAr:'٠', periodAr:'/شهر', descAr:'ابدأ الاستكشاف',
      features:['٢٠ سؤال يومياً','وصول لكل الحلقات','مصادر بالطابع الزمني','شارات ومتصدّرون'], cta:'ابدأ مجاناً' },
    { nameAr:'برو', priceAr:'٢٩', periodAr:'/شهر', popular:true, descAr:'للمستثمرين الجادّين',
      features:['أسئلة غير محدودة','حفظ الرؤى والمقاطع','تحليل عبر الحلقات','دعم سريع','تصدير PDF'], cta:'اشترك في برو' },
    { nameAr:'فِرَق', priceAr:'٩٩', periodAr:'/شهر', descAr:'للشركات والمؤسسات',
      features:['كل مزايا برو','حتى ١٠ أعضاء','لوحة تحكّم للفريق','تكاملات API','مدير حساب مخصّص'], cta:'تواصل معنا' },
  ];
  return (
    <section className="ar" dir="rtl" style={{ padding:'140px 40px', background:'var(--bg-alt)' }}>
      <div style={{ maxWidth:1200, margin:'0 auto' }}>
        <SectionHead eyebrowAr="الأسعار" titleAr="ابدأ مجاناً. ترقَّ حين تحتاج." center/>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(300px, 1fr))', gap:22, marginTop:72 }}>
          {plans.map(p => (
            <div key={p.nameAr} style={{
              padding:40, borderRadius:24,
              background: p.popular ? 'var(--accent)' : 'var(--surface)',
              color: p.popular ? 'var(--accent-ink)' : 'var(--fg)',
              border: p.popular ? '4px solid var(--fg-strong)' : '3px solid var(--border-strong)',
              position:'relative',
              boxShadow: p.popular ? 'var(--sh-brutal)' : 'var(--sh-2)'
            }}>
              {p.popular && <div style={{ position:'absolute', top:-16, right:28, padding:'6px 16px', background:'var(--accent-2)', color:'#fff', borderRadius:999, fontSize:12, fontWeight:900, letterSpacing:'0.05em', textTransform:'uppercase' }}>الأكثر شيوعاً</div>}
              <div style={{ fontSize:14, fontWeight:900, marginBottom:10, letterSpacing:'0.05em', textTransform:'uppercase', color: p.popular ? 'var(--accent-ink)' : 'var(--accent-2)' }}>{p.nameAr}</div>
              <div style={{ fontSize:15, fontWeight:700, marginBottom:24, color: p.popular ? 'var(--accent-ink)' : 'var(--fg-muted)', opacity: p.popular ? 0.85 : 1 }}>{p.descAr}</div>
              <div style={{ display:'flex', alignItems:'baseline', gap:8, marginBottom:28 }}>
                <span style={{ fontFamily:'Mont', fontWeight:900, fontSize:62, letterSpacing:'-0.03em' }}>${p.priceAr}</span>
                <span style={{ fontSize:16, fontWeight:700, opacity:0.7 }}>{p.periodAr}</span>
              </div>
              <div style={{ display:'grid', gap:14, marginBottom:32 }}>
                {p.features.map(f => (
                  <div key={f} style={{ display:'flex', gap:12, alignItems:'center', fontSize:15, fontWeight:700 }}>
                    <span style={{ width:22, height:22, borderRadius:'50%', background: p.popular ? 'var(--accent-ink)' : 'var(--accent)', color: p.popular ? 'var(--accent)' : 'var(--accent-ink)', display:'inline-flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>{Ico.check}</span>
                    {f}
                  </div>
                ))}
              </div>
              <a href="Madrasa AI - Ask.html" style={{
                display:'block', textAlign:'center', padding:'16px',
                background: p.popular ? 'var(--fg-strong)' : 'var(--accent-2)',
                color: '#fff',
                borderRadius:14, fontSize:15, fontWeight:900
              }}>{p.cta}</a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="ar" dir="rtl" style={{ padding:'120px 40px' }}>
      <div style={{ maxWidth:1100, margin:'0 auto', background:'var(--accent)', color:'var(--accent-ink)', borderRadius:32, padding:'90px 60px', textAlign:'center', position:'relative', overflow:'hidden', border:'4px solid var(--fg-strong)', boxShadow:'var(--sh-brutal)' }}>
        <div style={{ position:'absolute', top:-80, right:-80, width:320, height:320, borderRadius:'50%', background:'var(--accent-2)', opacity:0.25 }}/>
        <div style={{ position:'absolute', bottom:-70, left:-70, width:240, height:240, borderRadius:'50%', background:'var(--accent-4)', opacity:0.3 }}/>
        <div style={{ position:'relative', zIndex:1 }}>
          <Mark size={64} color="var(--accent-ink)"/>
          <h2 style={{ fontFamily:'IBM Plex Sans Arabic', fontSize:'clamp(38px, 5vw, 58px)', fontWeight:700, margin:'28px 0 20px', letterSpacing:'-0.03em', color:'var(--accent-ink)' }}>
            ساعة واحدة مع المساعد<br/>= ١٠ ساعات استماع.
          </h2>
          <p style={{ fontSize:19, fontWeight:700, maxWidth:580, margin:'0 auto 40px', lineHeight:1.7, opacity:0.85 }}>
            انضم إلى ١٢ ألف مستخدم بيستخرجوا الرؤى بذكاء — بدل ما يسمعوا ساعات.
          </p>
          <div style={{ display:'flex', gap:14, justifyContent:'center', flexWrap:'wrap' }}>
            <a href="Madrasa AI - Ask.html" style={{ padding:'18px 36px', background:'var(--fg-strong)', color:'#fff', borderRadius:999, fontSize:16, fontWeight:900, display:'inline-flex', alignItems:'center', gap:8 }}>
              جرّب مجاناً — بدون بطاقة {Ico.arrowLeft}
            </a>
            <a href="Madrasa AI - Leaderboard.html" style={{ padding:'18px 36px', background:'transparent', color:'var(--accent-ink)', border:'3px solid var(--accent-ink)', borderRadius:999, fontSize:16, fontWeight:900 }}>
              شوف المتصدّرين
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function App() {
  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)', color:'var(--fg)' }}>
      <Nav active="home"/>
      <Hero/>
      <Benefits/>
      <HowItWorks/>
      <DemoPreview/>
      <Episodes/>
      <Pricing/>
      <CTA/>
      <Footer/>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
