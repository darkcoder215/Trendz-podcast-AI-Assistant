import Link from 'next/link';
import { supabaseServer } from '@/lib/supabase/server';
import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';
import { BgPattern } from '@/components/BgPattern';
import { Mark } from '@/components/Mark';
import { Ico } from '@/components/Icons';
import { HomeAskBar } from '@/components/home/HomeAskBar';

export const revalidate = 60;

async function fetchHomeStats() {
  const supabase = await supabaseServer();
  const [{ count: epCount }, { count: chunksCount }] = await Promise.all([
    supabase.from('episodes').select('*', { count: 'exact', head: true }),
    supabase.from('chunks').select('*', { count: 'exact', head: true }),
  ]);
  const { data: recent } = await supabase
    .from('episodes')
    .select('id, num, title_ar, guest_name_ar, guest_photo_url, duration_sec, summary_ar, topics_ar, youtube_id')
    .order('num', { ascending: false })
    .limit(6);
  return {
    episodeCount: epCount ?? 0,
    chunkCount: chunksCount ?? 0,
    recent: recent ?? [],
  };
}

function fmtK(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}م`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}ك`;
  return String(n);
}

function BenefitsShapes() {
  // Decorative floating shapes representing: microphone, sound waves, coin,
  // lightbulb (business ideas), bar chart. Aria-hidden — purely visual.
  return (
    <div aria-hidden className="benefits-shapes">
      <div className="shape s-mic">
        <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <rect x="18" y="6" width="12" height="22" rx="6" />
          <path d="M12 22a12 12 0 0 0 24 0" />
          <path d="M24 34v6" />
          <path d="M18 40h12" />
        </svg>
      </div>
      <div className="shape s-wave">
        <svg viewBox="0 0 90 60" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round">
          <path d="M6 30h6" />
          <path d="M20 18v24" />
          <path d="M34 8v44" />
          <path d="M48 18v24" />
          <path d="M62 12v36" />
          <path d="M76 22v16" />
        </svg>
      </div>
      <div className="shape s-coin">
        <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="24" cy="24" r="18" />
          <path d="M24 12v24" />
          <path d="M30 17h-9a3 3 0 0 0 0 6h6a3 3 0 0 1 0 6h-9" />
        </svg>
      </div>
      <div className="shape s-bulb">
        <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M24 6a12 12 0 0 0-7 21.5V32h14v-4.5A12 12 0 0 0 24 6z" />
          <path d="M19 36h10" />
          <path d="M20 40h8" />
          <path d="M24 2v2M4 14l2 1M44 14l-2 1M4 24h2M42 24h2" />
        </svg>
      </div>
      <div className="shape s-chart">
        <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 42h36" />
          <rect x="10" y="26" width="6" height="14" />
          <rect x="21" y="18" width="6" height="22" />
          <rect x="32" y="10" width="6" height="30" />
          <path d="M10 14l8-6 8 4 12-8" />
        </svg>
      </div>
      <div className="shape s-ring" />
      <div className="shape s-dot-lg" />
    </div>
  );
}

function SectionHead({
  eyebrowAr,
  titleAr,
  descAr,
  center,
}: {
  eyebrowAr: string;
  titleAr: React.ReactNode;
  descAr?: string;
  center?: boolean;
}) {
  return (
    <div style={{ textAlign: center ? 'center' : 'right', maxWidth: 900, margin: center ? '0 auto' : '0' }}>
      <div
        style={{
          display: 'inline-block',
          padding: '6px 14px',
          background: 'var(--accent)',
          color: 'var(--accent-ink)',
          borderRadius: 999,
          fontSize: 12,
          fontWeight: 900,
          marginBottom: 18,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
        }}
      >
        {eyebrowAr}
      </div>
      <h2
        style={{
          fontFamily: 'IBM Plex Sans Arabic',
          fontSize: 'clamp(32px, 4.5vw, 60px)',
          fontWeight: 700,
          margin: '0 0 18px',
          lineHeight: 1.15,
          letterSpacing: '-0.03em',
          color: 'var(--fg-strong)',
        }}
      >
        {titleAr}
      </h2>
      {descAr && (
        <p style={{ fontSize: 18, lineHeight: 1.75, fontWeight: 600, color: 'var(--fg-muted)', margin: 0 }}>
          {descAr}
        </p>
      )}
    </div>
  );
}

export default async function HomePage() {
  const { episodeCount, chunkCount, recent } = await fetchHomeStats();

  const benefits = [
    { icon: '💡', titleAr: 'استخلاص الرؤى', descAr: 'حوّل ساعاتٍ من الاستماع إلى رؤى مركّزة في ثوانٍ — دون الحاجة إلى مشاهدة الحلقة كاملة.' },
    { icon: '🎯', titleAr: 'إجابات بمصادر', descAr: 'كل إجابة مدعومة باقتباسات مباشرة وطابع زمني دقيق — اضغط لتنتقل إلى اللحظة بالضبط.' },
    { icon: '🔍', titleAr: 'بحث عابر للحلقات', descAr: 'اسأل سؤالاً واحداً يجمع لك وجهات نظر من عدة حلقات وضيوف مختلفين في إجابةٍ موحّدة.' },
    { icon: '🎬', titleAr: 'ينقلك للحظة المحددة', descAr: 'كل اقتباس مرفق برابط يوتيوب يفتح الحلقة عند الثانية بالضبط — وفّر دقائق من البحث.' },
    { icon: '📲', titleAr: 'بطاقة للمشاركة', descAr: 'شارك الرؤية التي نالت إعجابك على لينكدإن ببطاقة عالية الجودة مع ذكر الضيف والحلقة.' },
    { icon: '⚡', titleAr: 'تحديث مستمر', descAr: 'كل حلقة جديدة تُضاف لقاعدة المعرفة تلقائياً بعد رفعها من لوحة الإدارة.' },
  ];

  const steps = [
    { n: '١', titleAr: 'اسأل بلغتك', descAr: 'اطرح سؤالك بالعربية الفصحى أو باللهجة — المساعد يفهم الاثنتين.' },
    { n: '٢', titleAr: 'يبحث المساعد', descAr: 'يفحص النصوص المفرّغة ويُرتّب أفضل المقاطع حسب المعنى لا الكلمات.' },
    { n: '٣', titleAr: 'إجابة مُستخلَصة', descAr: 'يستخلص إجابةً مركّزةً مع اقتباسات وطابع زمني دقيق لكل مصدر.' },
    { n: '٤', titleAr: 'استمع للمصدر', descAr: 'اضغط على أي اقتباس لتنتقل مباشرةً إلى تلك اللحظة في الحلقة.' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--fg)' }}>
      <Nav active="home" />

      {/* Hero */}
      <section className="ar fade-in hero-section" dir="rtl" style={{ padding: '170px 20px 100px', position: 'relative', overflow: 'hidden' }}>
        <BgPattern opacity={0.8} />
        <div className="hero-deco" style={{ top: 180, left: 60, width: 96, height: 96, borderRadius: '50%', background: 'var(--accent-3)', opacity: 0.35 }} />
        <div className="hero-deco" style={{ top: 240, right: 110, width: 18, height: 18, borderRadius: '50%', background: 'var(--accent-2)' }} />
        <div className="hero-deco" style={{ bottom: 80, right: 60, width: 160, height: 160, borderRadius: '50%', border: '3px solid var(--accent)', opacity: 0.25 }} />

        <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              padding: '8px 18px',
              background: 'var(--accent)',
              color: 'var(--accent-ink)',
              border: '2px solid var(--accent)',
              borderRadius: 999,
              fontSize: 13,
              fontWeight: 900,
              marginBottom: 32,
              letterSpacing: '0.02em',
            }}
          >
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-ink)' }} />
            مدعوم بالذكاء الاصطناعي · {fmtK(episodeCount)} حلقة · {fmtK(chunkCount)} مقطع
          </div>

          <h1
            style={{
              fontFamily: 'IBM Plex Sans Arabic',
              fontSize: 'clamp(44px, 8vw, 104px)',
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: '-0.03em',
              margin: '0 0 28px',
              color: 'var(--fg-strong)',
            }}
          >
            اِسأل البودكاست.
            <br />
            <span style={{ color: 'var(--accent-2)' }}>احصل على الإجابة فوراً.</span>
          </h1>

          <p
            style={{
              fontSize: 'clamp(16px, 2.5vw, 22px)',
              lineHeight: 1.7,
              fontWeight: 600,
              color: 'var(--fg-muted)',
              maxWidth: 760,
              margin: '0 auto 44px',
            }}
          >
            مساعدٌ ذكيٌّ استمع نيابةً عنك إلى كل حلقات «مدرسة الاستثمار». اطرح سؤالك،
            واحصل على إجابةٍ <strong style={{ color: 'var(--fg-strong)' }}>مُستخلَصةٍ من الحلقات</strong>، مع مصادرَ دقيقةٍ بالثانية.
          </p>

          <HomeAskBar />

          {/* Stats strip */}
          <div
            style={{
              marginTop: 80,
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: 20,
              maxWidth: 900,
            }}
          >
            {[
              { v: fmtK(episodeCount), l: 'حلقة مُفهرَسة' },
              { v: fmtK(chunkCount), l: 'مقطع قابل للبحث' },
              { v: '١٠', l: 'أسئلة مجانية لكل زائر' },
              { v: 'ثوانٍ', l: 'متوسط زمن الإجابة' },
            ].map((s, i) => (
              <div
                key={s.l}
                style={{
                  background: 'var(--surface)',
                  border: '3px solid var(--border-strong)',
                  borderRadius: 18,
                  padding: '22px 18px',
                  boxShadow: i % 2 === 0 ? 'var(--sh-brutal)' : 'var(--sh-2)',
                }}
              >
                <div style={{ fontFamily: 'Mont', fontWeight: 900, fontSize: 40, color: 'var(--accent-2)', lineHeight: 1 }}>{s.v}</div>
                <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--fg)', marginTop: 10 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="ar benefits-section cv-auto" dir="rtl" style={{ padding: '120px 20px', background: 'var(--bg-alt)' }}>
        <BenefitsShapes />
        <div style={{ maxWidth: 1280, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <SectionHead
            eyebrowAr="لماذا Madrasa AI"
            titleAr="محتوى البودكاست بين يديك، مُنظَّماً وقابلاً للسؤال."
            descAr="حلقات «مدرسة الاستثمار» مليئة بالحكمة — لكن المحتوى الطويل يصعب استحضاره لحظة تحتاجه. هنا يأتي دور المساعد."
            center
          />
          <div className="benefits-grid">
            {benefits.map((it, i) => (
              <div
                key={it.titleAr}
                className="benefit-card"
                style={{
                  boxShadow: i % 2 === 0 ? 'var(--sh-brutal)' : 'var(--sh-2)',
                  animationDelay: `${i * 90}ms`,
                }}
              >
                <div className="icon-wrap"><span>{it.icon}</span></div>
                <h3 style={{ fontFamily: 'IBM Plex Sans Arabic', fontSize: 22, fontWeight: 700, margin: '0 0 14px', color: 'var(--fg-strong)' }}>
                  {it.titleAr}
                </h3>
                <p style={{ fontSize: 16, lineHeight: 1.8, fontWeight: 600, color: 'var(--fg-muted)', margin: 0 }}>{it.descAr}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="ar cv-auto" dir="rtl" style={{ padding: '120px 20px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <SectionHead eyebrowAr="كيف يعمل" titleAr="من السؤال إلى الإجابة في أقل من دقيقة." center />
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 24,
              marginTop: 80,
              position: 'relative',
            }}
          >
            {steps.map((s) => (
              <div key={s.n} style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
                <div
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: '50%',
                    background: 'var(--accent)',
                    color: 'var(--accent-ink)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 24px',
                    fontFamily: 'IBM Plex Sans Arabic',
                    fontWeight: 700,
                    fontSize: 34,
                    border: '4px solid var(--bg)',
                    boxShadow: '0 0 0 4px var(--accent)',
                  }}
                >
                  {s.n}
                </div>
                <h3 style={{ fontFamily: 'IBM Plex Sans Arabic', fontSize: 22, fontWeight: 700, margin: '0 0 12px', color: 'var(--fg-strong)' }}>
                  {s.titleAr}
                </h3>
                <p style={{ fontSize: 15, lineHeight: 1.75, fontWeight: 600, color: 'var(--fg-muted)', margin: 0 }}>{s.descAr}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Episodes */}
      <section className="ar cv-auto" dir="rtl" style={{ padding: '120px 20px', background: 'var(--bg-alt)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', gap: 20, flexWrap: 'wrap' }}>
            <SectionHead eyebrowAr="الحلقات الأخيرة" titleAr="ابدأ من حلقة واسأل عنها." descAr="كل الحلقات مُفهرَسة وجاهزة للسؤال." />
            <Link href="/ask" style={{ color: 'var(--accent-2)', fontSize: 15, fontWeight: 900, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              اسأل المساعد {Ico.arrowLeft}
            </Link>
          </div>
          {recent.length === 0 ? (
            <div
              style={{
                marginTop: 40,
                padding: 32,
                background: 'var(--surface)',
                border: '3px dashed var(--border)',
                borderRadius: 22,
                textAlign: 'center',
                color: 'var(--fg-muted)',
                fontWeight: 700,
              }}
            >
              لا توجد حلقات بعد — يقوم المشرف برفع أول حلقة من لوحة الإدارة.
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: 24,
                marginTop: 60,
              }}
            >
              {recent.map((ep) => (
                <div
                  key={ep.id}
                  className="fade-up"
                  style={{
                    background: 'var(--surface)',
                    border: '3px solid var(--border-strong)',
                    borderRadius: 22,
                    padding: 24,
                    boxShadow: 'var(--sh-2)',
                    transition: 'transform .2s, box-shadow .2s',
                  }}
                >
                  <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
                    <div
                      style={{
                        width: 96,
                        height: 96,
                        borderRadius: 14,
                        background: ep.guest_photo_url
                          ? 'transparent'
                          : 'linear-gradient(135deg, var(--accent) 0%, var(--accent-2) 100%)',
                        flexShrink: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        overflow: 'hidden',
                      }}
                    >
                      {ep.guest_photo_url ? (
                        <img
                          src={ep.guest_photo_url}
                          alt={ep.guest_name_ar}
                          loading="lazy"
                          decoding="async"
                          width={96}
                          height={96}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <div style={{ fontFamily: 'Mont', fontWeight: 900, fontSize: 40, color: '#fff' }}>{ep.num}</div>
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, color: 'var(--accent-2)', fontWeight: 900, marginBottom: 6, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                        حلقة {ep.num}
                      </div>
                      <h3 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 6px', lineHeight: 1.4, color: 'var(--fg-strong)' }}>
                        {ep.title_ar}
                      </h3>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--fg-muted)' }}>مع {ep.guest_name_ar}</div>
                    </div>
                  </div>
                  {ep.summary_ar && (
                    <p style={{ fontSize: 14, lineHeight: 1.7, fontWeight: 600, color: 'var(--fg-muted)', margin: '0 0 16px' }}>
                      {ep.summary_ar}
                    </p>
                  )}
                  {ep.topics_ar && ep.topics_ar.length > 0 && (
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
                      {ep.topics_ar.slice(0, 3).map((t: string) => (
                        <span
                          key={t}
                          style={{
                            fontSize: 11,
                            fontWeight: 800,
                            padding: '4px 10px',
                            background: 'var(--surface-alt)',
                            color: 'var(--fg-strong)',
                            borderRadius: 999,
                            border: '2px solid var(--border)',
                          }}
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                  <Link
                    href={`/ask?ep=${ep.id}`}
                    style={{
                      display: 'inline-block',
                      padding: '10px 18px',
                      background: 'var(--accent)',
                      color: 'var(--accent-ink)',
                      borderRadius: 999,
                      fontSize: 13,
                      fontWeight: 900,
                    }}
                  >
                    اسأل عن الحلقة
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="ar cv-auto" dir="rtl" style={{ padding: '100px 20px' }}>
        <div
          style={{
            maxWidth: 1100,
            margin: '0 auto',
            background: 'var(--accent)',
            color: 'var(--accent-ink)',
            borderRadius: 32,
            padding: 'clamp(48px, 8vw, 90px) clamp(24px, 5vw, 60px)',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
            border: '4px solid var(--fg-strong)',
            boxShadow: 'var(--sh-brutal)',
          }}
        >
          <div style={{ position: 'absolute', top: -80, right: -80, width: 320, height: 320, borderRadius: '50%', background: 'var(--accent-2)', opacity: 0.25 }} />
          <div style={{ position: 'absolute', bottom: -70, left: -70, width: 240, height: 240, borderRadius: '50%', background: 'var(--accent-4)', opacity: 0.3 }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
              <Mark size={60} color="var(--accent-ink)" />
            </div>
            <h2
              style={{
                fontFamily: 'IBM Plex Sans Arabic',
                fontSize: 'clamp(28px, 5vw, 56px)',
                fontWeight: 700,
                margin: '0 0 20px',
                letterSpacing: '-0.03em',
                color: 'var(--accent-ink)',
              }}
            >
              ساعة واحدة مع المساعد
              <br />= ١٠ ساعات استماع.
            </h2>
            <p style={{ fontSize: 'clamp(15px, 2vw, 19px)', fontWeight: 700, maxWidth: 580, margin: '0 auto 40px', lineHeight: 1.7, opacity: 0.85 }}>
              كل زائر يحصل على ١٠ أسئلة مجاناً — بدون تسجيل، بدون بطاقة ائتمانية.
            </p>
            <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link
                href="/ask"
                style={{
                  padding: '18px 36px',
                  background: 'var(--fg-strong)',
                  color: '#fff',
                  borderRadius: 999,
                  fontSize: 16,
                  fontWeight: 900,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                ابدأ الآن {Ico.arrowLeft}
              </Link>
              <Link
                href="/leaderboard"
                style={{
                  padding: '18px 36px',
                  background: 'transparent',
                  color: 'var(--accent-ink)',
                  border: '3px solid var(--accent-ink)',
                  borderRadius: 999,
                  fontSize: 16,
                  fontWeight: 900,
                }}
              >
                شوف المتصدّرين
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
