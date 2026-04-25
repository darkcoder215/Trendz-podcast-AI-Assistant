import Link from 'next/link';
import Image from 'next/image';
import { supabaseServer } from '@/lib/supabase/server';
import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';
import { BgPattern } from '@/components/BgPattern';
import { Ico } from '@/components/Icons';

export const revalidate = 60;

type GuestRow = {
  guest_name_ar: string;
  guest_role_ar: string | null;
  guest_photo_url: string | null;
  episodes: number;
  citations: number;
  last_cited_at: string | null;
};

async function fetchLeaderboardData() {
  const supabase = await supabaseServer();
  const [{ data: guests }, { count: totalQuestions }, { count: totalAnswers }] = await Promise.all([
    supabase
      .from('guest_leaderboard')
      .select('*')
      .order('citations', { ascending: false })
      .limit(50),
    supabase.from('questions').select('*', { count: 'exact', head: true }),
    supabase.from('answers').select('*', { count: 'exact', head: true }),
  ]);
  return {
    guests: (guests ?? []) as GuestRow[],
    totalQuestions: totalQuestions ?? 0,
    totalAnswers: totalAnswers ?? 0,
  };
}

function Initials({ name }: { name: string }) {
  const parts = name.split(/\s+/).slice(0, 2);
  const initials = parts.map((p) => p[0]).join('');
  return <>{initials}</>;
}

export default async function LeaderboardPage() {
  const { guests, totalQuestions, totalAnswers } = await fetchLeaderboardData();
  const top3 = guests.slice(0, 3);
  const rest = guests.slice(3);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--fg)' }}>
      <Nav active="leaderboard" />

      <section className="ar fade-in" dir="rtl" style={{ padding: '130px 20px 60px', position: 'relative', overflow: 'hidden' }}>
        <BgPattern opacity={0.7} />
        <div style={{ maxWidth: 1280, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div
            style={{
              display: 'inline-block',
              padding: '6px 16px',
              background: 'var(--accent)',
              color: 'var(--accent-ink)',
              borderRadius: 999,
              fontSize: 12,
              fontWeight: 900,
              marginBottom: 20,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
            }}
          >
            ضيوف البودكاست
          </div>
          <h1
            style={{
              fontFamily: 'IBM Plex Sans Arabic',
              fontSize: 'clamp(36px, 6.5vw, 84px)',
              fontWeight: 700,
              margin: '0 0 18px',
              letterSpacing: '-0.03em',
              color: 'var(--fg-strong)',
              lineHeight: 1.1,
            }}
          >
            الضيوف الأكثر استشهاداً
            <br />
            <span style={{ color: 'var(--accent-2)' }}>في إجابات المساعد.</span>
          </h1>
          <p style={{ fontSize: 18, fontWeight: 600, color: 'var(--fg-muted)', maxWidth: 660, margin: '0 auto', lineHeight: 1.7 }}>
            كل مرة يُستشهَد بضيف في إجابة، يرتفع في القائمة. الأرقام حقيقية ومحدَّثة تلقائياً.
          </p>
        </div>
      </section>

      {/* Stats strip */}
      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto 56px',
          padding: '0 20px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 16,
        }}
      >
        {[
          { v: String(guests.length), l: 'ضيف في القائمة', c: 'var(--accent-2)' },
          { v: String(totalQuestions), l: 'سؤال هذا الشهر', c: 'var(--accent)' },
          { v: String(totalAnswers), l: 'إجابة مُستخلَصة', c: 'var(--accent-4)' },
          { v: String(guests.reduce((s, g) => s + g.citations, 0)), l: 'اقتباس مُوَثّق', c: 'var(--accent-2)' },
        ].map((s, i) => (
          <div
            key={s.l}
            style={{
              padding: '24px 20px',
              background: 'var(--surface)',
              border: '3px solid var(--border-strong)',
              borderRadius: 18,
              textAlign: 'center',
              boxShadow: i % 2 === 0 ? 'var(--sh-brutal)' : 'var(--sh-2)',
            }}
          >
            <div style={{ fontFamily: 'Mont', fontWeight: 900, fontSize: 32, color: s.c, lineHeight: 1 }}>{s.v}</div>
            <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--fg)', marginTop: 12 }}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* Featured top 3 */}
      <section className="ar" dir="rtl" style={{ padding: '0 20px 60px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          {guests.length === 0 ? (
            <div
              style={{
                padding: 40,
                background: 'var(--surface)',
                border: '3px dashed var(--border)',
                borderRadius: 22,
                textAlign: 'center',
                color: 'var(--fg-muted)',
                fontWeight: 700,
              }}
            >
              لا توجد استشهادات بعد — كن أول من يسأل ويحرّك هذه القائمة.
            </div>
          ) : (
            <>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: 18,
                  marginBottom: 24,
                }}
              >
                {top3.map((g, i) => (
                  <div
                    key={g.guest_name_ar}
                    style={{
                      padding: 28,
                      background: i === 0 ? 'var(--accent)' : 'var(--surface)',
                      color: i === 0 ? 'var(--accent-ink)' : 'var(--fg-strong)',
                      border: '3px solid var(--border-strong)',
                      borderRadius: 22,
                      boxShadow: i === 0 ? 'var(--sh-brutal)' : 'var(--sh-2)',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        position: 'absolute',
                        top: -20,
                        insetInlineStart: -20,
                        fontFamily: 'Mont',
                        fontWeight: 900,
                        fontSize: 140,
                        color: i === 0 ? 'rgba(15,22,49,0.08)' : 'rgba(249,110,70,0.08)',
                        lineHeight: 1,
                      }}
                    >
                      #{i + 1}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 18, position: 'relative' }}>
                      <div
                        style={{
                          width: 64,
                          height: 64,
                          borderRadius: 16,
                          background: g.guest_photo_url ? undefined : 'var(--accent-2)',
                          color: '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 900,
                          fontSize: 17,
                          fontFamily: 'IBM Plex Sans Arabic',
                          border: '3px solid var(--fg-strong)',
                          flexShrink: 0,
                          overflow: 'hidden',
                          position: 'relative',
                        }}
                      >
                        {g.guest_photo_url ? (
                          <Image src={g.guest_photo_url} alt="" fill sizes="64px" style={{ objectFit: 'cover' }} />
                        ) : (
                          <Initials name={g.guest_name_ar} />
                        )}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 18, fontWeight: 900, lineHeight: 1.3 }}>{g.guest_name_ar}</div>
                        {g.guest_role_ar && (
                          <div style={{ fontSize: 12, fontWeight: 800, opacity: 0.75, marginTop: 4 }}>{g.guest_role_ar}</div>
                        )}
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
                      <GuestStat v={g.citations.toLocaleString('ar')} l="اقتباس" big accent={i !== 0} />
                      <GuestStat v={String(g.episodes)} l="حلقات" accent={i !== 0} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Rest of table */}
              {rest.length > 0 && (
                <div
                  style={{
                    background: 'var(--surface)',
                    border: '3px solid var(--border-strong)',
                    borderRadius: 22,
                    overflow: 'hidden',
                    boxShadow: 'var(--sh-1)',
                  }}
                >
                  <div
                    className="lb-row"
                    style={{
                      padding: '16px 20px',
                      fontSize: 12,
                      color: 'var(--accent-2)',
                      fontWeight: 900,
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase',
                      borderBottom: '3px solid var(--border-strong)',
                      background: 'var(--surface-alt)',
                    }}
                  >
                    <div>#</div>
                    <div>الضيف</div>
                    <div style={{ textAlign: 'center' }}>اقتباسات</div>
                    <div className="lb-col-episodes" style={{ textAlign: 'center' }}>حلقات</div>
                  </div>
                  {rest.map((g, i) => (
                    <div
                      key={g.guest_name_ar}
                      className="lb-row"
                      style={{
                        padding: '16px 20px',
                        borderBottom: i === rest.length - 1 ? 0 : '2px solid var(--border)',
                      }}
                    >
                      <div style={{ fontFamily: 'Mont', fontWeight: 900, fontSize: 18, color: 'var(--fg-muted)' }}>#{i + 4}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div
                          style={{
                            width: 42,
                            height: 42,
                            borderRadius: '50%',
                            background: g.guest_photo_url ? undefined : 'var(--accent-2)',
                            color: '#fff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 900,
                            fontSize: 12,
                            border: '2px solid var(--fg-strong)',
                            flexShrink: 0,
                            overflow: 'hidden',
                            position: 'relative',
                          }}
                        >
                          {g.guest_photo_url ? (
                            <Image src={g.guest_photo_url} alt="" fill sizes="42px" style={{ objectFit: 'cover' }} />
                          ) : (
                            <Initials name={g.guest_name_ar} />
                          )}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: 14.5, fontWeight: 900, color: 'var(--fg-strong)' }}>{g.guest_name_ar}</div>
                          {g.guest_role_ar && (
                            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--fg-muted)', marginTop: 2 }}>{g.guest_role_ar}</div>
                          )}
                        </div>
                      </div>
                      <div style={{ textAlign: 'center', fontFamily: 'Mont', fontWeight: 900, fontSize: 15, color: 'var(--accent-2)' }}>
                        {g.citations.toLocaleString('ar')}
                      </div>
                      <div className="lb-col-episodes" style={{ textAlign: 'center', fontSize: 14, fontWeight: 900, color: 'var(--fg-strong)' }}>{g.episodes}</div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="ar" dir="rtl" style={{ padding: '40px 20px 100px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          <Link
            href="/ask"
            style={{
              padding: '16px 32px',
              background: 'var(--accent-2)',
              color: '#fff',
              borderRadius: 999,
              fontSize: 15,
              fontWeight: 900,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: 'var(--sh-2)',
            }}
          >
            اسأل الآن — وشارك في تحريك الترتيب {Ico.arrowLeft}
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function GuestStat({ v, l, big, accent }: { v: string; l: string; big?: boolean; accent?: boolean }) {
  return (
    <div style={{ textAlign: 'center', padding: '10px 4px' }}>
      <div style={{ fontFamily: 'Mont', fontWeight: 900, fontSize: big ? 22 : 18, color: accent ? 'var(--accent-2)' : 'inherit', lineHeight: 1 }}>{v}</div>
      <div style={{ fontSize: 10, fontWeight: 800, opacity: 0.7, marginTop: 6, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{l}</div>
    </div>
  );
}
