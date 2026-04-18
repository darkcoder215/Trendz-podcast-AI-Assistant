'use client';

import { useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase/browser';

export function EpisodeUpload({ onDone }: { onDone: () => void }) {
  const [num, setNum] = useState('');
  const [titleAr, setTitleAr] = useState('');
  const [guestNameAr, setGuestNameAr] = useState('');
  const [guestRoleAr, setGuestRoleAr] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [summaryAr, setSummaryAr] = useState('');
  const [topicsAr, setTopicsAr] = useState('');
  const [transcriptRaw, setTranscriptRaw] = useState('');
  const [guestPhoto, setGuestPhoto] = useState<File | null>(null);

  const [status, setStatus] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus(null);
    setErr(null);
    setLoading(true);
    try {
      let photoUrl: string | null = null;

      // 1. Upload guest photo via authenticated Supabase browser client.
      //    RLS policy restricts this bucket's writes to admins only.
      if (guestPhoto) {
        if (guestPhoto.size > 4 * 1024 * 1024) {
          setErr('الصورة أكبر من ٤ ميجابايت.');
          setLoading(false);
          return;
        }
        if (!/^image\/(png|jpeg|webp)$/.test(guestPhoto.type)) {
          setErr('صيغة الصورة غير مدعومة (يرجى PNG / JPEG / WEBP).');
          setLoading(false);
          return;
        }
        const supabase = supabaseBrowser();
        const ext = guestPhoto.name.split('.').pop() ?? 'jpg';
        const path = `guest-${Date.now()}.${ext}`;
        setStatus('رفع الصورة…');
        const { error: upErr } = await supabase.storage.from('guest-photos').upload(path, guestPhoto, {
          cacheControl: '3600',
          upsert: false,
          contentType: guestPhoto.type,
        });
        if (upErr) throw upErr;
        const { data: urlData } = supabase.storage.from('guest-photos').getPublicUrl(path);
        photoUrl = urlData.publicUrl;
      }

      // 2. Create episode row
      setStatus('حفظ بيانات الحلقة…');
      const epRes = await fetch('/api/admin/episodes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          num: Number(num),
          titleAr,
          guestNameAr,
          guestRoleAr: guestRoleAr || null,
          youtubeUrl,
          guestPhotoUrl: photoUrl,
          summaryAr: summaryAr || null,
          topicsAr: topicsAr
            ? topicsAr.split(/[,،]/).map((s) => s.trim()).filter(Boolean)
            : [],
        }),
      });
      if (!epRes.ok) {
        const body = await epRes.json().catch(() => ({}));
        throw new Error(body.error ?? `episode insert failed (${epRes.status})`);
      }
      const { episode } = await epRes.json();

      // 3. Ingest transcript
      setStatus('تقطيع النص وتوليد التضمينات… (قد تستغرق دقيقة)');
      const ingestRes = await fetch('/api/admin/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ episodeId: episode.id, transcriptRaw }),
      });
      if (!ingestRes.ok) {
        const body = await ingestRes.json().catch(() => ({}));
        throw new Error(body.error ?? `ingest failed (${ingestRes.status})`);
      }
      const ingestData = await ingestRes.json();
      setStatus(`تم! عدد المقاطع: ${ingestData.chunkCount}`);
      // Reset form
      setNum('');
      setTitleAr('');
      setGuestNameAr('');
      setGuestRoleAr('');
      setYoutubeUrl('');
      setSummaryAr('');
      setTopicsAr('');
      setTranscriptRaw('');
      setGuestPhoto(null);
      onDone();
    } catch (e) {
      setErr(String(e instanceof Error ? e.message : e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      className="ar"
      dir="rtl"
      style={{
        background: 'var(--surface)',
        border: '3px solid var(--border-strong)',
        borderRadius: 22,
        padding: 28,
        display: 'grid',
        gap: 16,
      }}
    >
      <Field label="رقم الحلقة" required>
        <input
          type="number"
          min={1}
          required
          value={num}
          onChange={(e) => setNum(e.target.value)}
          style={inputStyle()}
        />
      </Field>
      <Field label="عنوان الحلقة" required>
        <input required value={titleAr} onChange={(e) => setTitleAr(e.target.value)} style={inputStyle()} />
      </Field>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
        <Field label="اسم الضيف" required>
          <input required value={guestNameAr} onChange={(e) => setGuestNameAr(e.target.value)} style={inputStyle()} />
        </Field>
        <Field label="صفة الضيف">
          <input value={guestRoleAr} onChange={(e) => setGuestRoleAr(e.target.value)} style={inputStyle()} />
        </Field>
      </div>
      <Field label="رابط اليوتيوب" required>
        <input
          type="url"
          required
          value={youtubeUrl}
          onChange={(e) => setYoutubeUrl(e.target.value)}
          placeholder="https://youtu.be/..."
          style={{ ...inputStyle(), direction: 'ltr' }}
        />
      </Field>
      <Field label="صورة الضيف (PNG / JPEG / WEBP)">
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={(e) => setGuestPhoto(e.target.files?.[0] ?? null)}
          style={inputStyle()}
        />
      </Field>
      <Field label="ملخّص قصير">
        <textarea
          rows={2}
          value={summaryAr}
          onChange={(e) => setSummaryAr(e.target.value)}
          style={{ ...inputStyle(), resize: 'vertical' }}
        />
      </Field>
      <Field label="المواضيع (افصل بينها بفاصلة)">
        <input value={topicsAr} onChange={(e) => setTopicsAr(e.target.value)} style={inputStyle()} placeholder="ريادة الأعمال, التمويل, ..." />
      </Field>
      <Field label="نص الحلقة (Transcript من يوتيوب)" required>
        <textarea
          required
          rows={14}
          value={transcriptRaw}
          onChange={(e) => setTranscriptRaw(e.target.value)}
          placeholder={'00:42\nأهلاً بك...\n01:18\nالشغف وهم...'}
          style={{ ...inputStyle(), resize: 'vertical', fontFamily: 'monospace', fontSize: 13 }}
        />
      </Field>

      {err && (
        <div role="alert" style={{ padding: '10px 14px', background: 'var(--accent-2)', color: '#fff', borderRadius: 10, fontSize: 13, fontWeight: 800 }}>
          {err}
        </div>
      )}
      {status && !err && (
        <div style={{ padding: '10px 14px', background: 'var(--accent)', color: 'var(--accent-ink)', borderRadius: 10, fontSize: 13, fontWeight: 800 }}>
          {status}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        style={{
          padding: '14px 24px',
          background: 'var(--accent-2)',
          color: '#fff',
          border: 0,
          borderRadius: 12,
          fontSize: 14,
          fontWeight: 900,
          cursor: loading ? 'wait' : 'pointer',
          fontFamily: 'inherit',
        }}
      >
        {loading ? 'جارٍ الرفع…' : 'رفع الحلقة وفهرستها'}
      </button>
    </form>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label style={{ display: 'block' }}>
      <span style={{ fontSize: 11, fontWeight: 900, color: 'var(--fg-muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
        {label} {required && <span style={{ color: 'var(--accent-2)' }}>*</span>}
      </span>
      <div style={{ marginTop: 6 }}>{children}</div>
    </label>
  );
}

function inputStyle(): React.CSSProperties {
  return {
    width: '100%',
    padding: '12px 14px',
    background: 'var(--surface-alt)',
    border: '2px solid var(--border)',
    borderRadius: 12,
    fontSize: 15,
    fontWeight: 700,
    color: 'var(--fg-strong)',
    fontFamily: 'inherit',
    direction: 'rtl',
  };
}
