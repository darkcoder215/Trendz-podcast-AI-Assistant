import { Mark } from './Mark';

function FooterCol({ title, links }: { title: string; links: string[] }) {
  return (
    <div>
      <div
        style={{
          fontSize: 13,
          fontWeight: 900,
          marginBottom: 18,
          color: 'var(--accent-2)',
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
        }}
      >
        {title}
      </div>
      <div style={{ display: 'grid', gap: 12 }}>
        {links.map((l) => (
          <a key={l} style={{ fontSize: 14, fontWeight: 700, color: 'var(--fg-muted)' }}>
            {l}
          </a>
        ))}
      </div>
    </div>
  );
}

export function Footer() {
  return (
    <footer
      className="ar"
      dir="rtl"
      style={{
        padding: '72px 20px 40px',
        borderTop: '2px solid var(--border)',
        background: 'var(--bg-alt)',
        color: 'var(--fg)',
      }}
    >
      <div
        style={{
          maxWidth: 1280,
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 40,
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div style={{ width: 44, height: 44, borderRadius: 10, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Mark size={24} color="var(--accent-ink)" />
            </div>
            <div style={{ fontFamily: 'Mont', fontWeight: 900, fontSize: 20, color: 'var(--fg-strong)' }}>
              Madrasa <span style={{ color: 'var(--accent-2)' }}>AI</span>
            </div>
          </div>
          <p style={{ fontSize: 15, lineHeight: 1.8, fontWeight: 600, color: 'var(--fg-muted)', maxWidth: 380 }}>
            مساعدٌ ذكيٌّ مبنيٌّ على كل حلقات بودكاست «مدرسة الاستثمار». اسأل، افهم، طبّق — مع مصادرَ دقيقة لكل إجابة.
          </p>
        </div>
        <FooterCol title="المنتج" links={['اسأل المساعد', 'الحلقات', 'المتصدرون', 'الشارات']} />
        <FooterCol title="الشركة" links={['عن تريندز', 'فريقنا', 'الشراكات', 'اتصل بنا']} />
        <FooterCol title="قانوني" links={['الخصوصية', 'الشروط', 'الاستخدام', 'الأمان']} />
      </div>
      <div
        style={{
          maxWidth: 1280,
          margin: '48px auto 0',
          paddingTop: 24,
          borderTop: '2px solid var(--border)',
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: 13,
          fontWeight: 700,
          color: 'var(--fg-muted)',
          flexWrap: 'wrap',
          gap: 10,
        }}
      >
        <div>© ٢٠٢٦ مدرسة الاستثمار. جميع الحقوق محفوظة.</div>
        <div>صُنع بـ ❤ في الإمارات</div>
      </div>
    </footer>
  );
}
