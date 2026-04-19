'use client';

import { useEffect, useState } from 'react';

type ChatModel = { id: string; name?: string; context_length?: number };
type EmbedModel = { id: string; name: string; dim: number; provider: 'openai' | 'google' };

const EXPECTED_EMBED_DIM = 1536;

export function ModelSettings() {
  const [chatModel, setChatModel] = useState('');
  const [embedModel, setEmbedModel] = useState('');
  const [chatOptions, setChatOptions] = useState<ChatModel[]>([]);
  const [embedOptions, setEmbedOptions] = useState<EmbedModel[]>([]);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [sRes, mRes] = await Promise.all([
          fetch('/api/admin/settings'),
          fetch('/api/admin/models'),
        ]);
        if (!sRes.ok) throw new Error(`settings ${sRes.status}`);
        if (!mRes.ok) throw new Error(`models ${mRes.status}`);
        const { settings } = await sRes.json();
        const { chat, embed } = await mRes.json();
        setChatModel(settings?.chat_model ?? '');
        setEmbedModel(settings?.embed_model ?? '');
        setUpdatedAt(settings?.updated_at ?? null);
        setChatOptions(chat ?? []);
        setEmbedOptions(embed ?? []);
      } catch (e) {
        setErr(String(e instanceof Error ? e.message : e));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setStatus(null);
    setSaving(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatModel: chatModel.trim(), embedModel: embedModel.trim() }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error ?? `save failed (${res.status})`);
      setUpdatedAt(body.settings?.updated_at ?? new Date().toISOString());
      setStatus('تم حفظ النماذج.');
    } catch (e) {
      setErr(String(e instanceof Error ? e.message : e));
    } finally {
      setSaving(false);
    }
  }

  const selectedEmbed = embedOptions.find((m) => m.id === embedModel);
  const dimWarning = selectedEmbed && selectedEmbed.dim !== EXPECTED_EMBED_DIM;

  if (loading) {
    return (
      <div style={panelStyle()}>
        <div style={{ color: 'var(--fg-muted)', fontWeight: 700 }}>جارٍ التحميل…</div>
      </div>
    );
  }

  return (
    <form onSubmit={save} className="ar" dir="rtl" style={panelStyle()}>
      <div style={{ display: 'grid', gap: 6, marginBottom: 8 }}>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: 'var(--fg-strong)' }}>
          نماذج الذكاء الاصطناعي
        </h2>
        <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: 'var(--fg-muted)' }}>
          يتم استخدام هذه النماذج عبر OpenRouter. مفتاح الـ API يبقى في متغيّرات البيئة.
        </p>
        {updatedAt && (
          <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--fg-muted)' }}>
            آخر تحديث: {new Date(updatedAt).toLocaleString('ar')}
          </div>
        )}
      </div>

      <Field label="نموذج المحادثة (chat)">
        <input
          required
          value={chatModel}
          onChange={(e) => setChatModel(e.target.value)}
          list="chat-models"
          placeholder="anthropic/claude-sonnet-4.6"
          style={{ ...inputStyle(), direction: 'ltr', textAlign: 'left' }}
        />
        <datalist id="chat-models">
          {chatOptions.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name ?? m.id}
            </option>
          ))}
        </datalist>
        <Hint>
          أدخل الـ handle مباشرة (مثلاً <code>openai/gpt-4o</code>) أو اختر من القائمة. النماذج
          المتاحة: Google + OpenAI ({chatOptions.length}).
        </Hint>
      </Field>

      <Field label="نموذج التضمين (embeddings)">
        <select
          required
          value={embedModel}
          onChange={(e) => setEmbedModel(e.target.value)}
          style={{ ...inputStyle(), direction: 'ltr', textAlign: 'left' }}
        >
          {!embedOptions.find((m) => m.id === embedModel) && embedModel && (
            <option value={embedModel}>{embedModel} (مخصّص)</option>
          )}
          {embedOptions.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name} — {m.dim}d
            </option>
          ))}
        </select>
        <Hint>
          عمود قاعدة البيانات يتطلّب تضمينات بطول <strong>{EXPECTED_EMBED_DIM}</strong>. تغيير
          النموذج يستلزم إعادة فهرسة جميع المقاطع.
        </Hint>
        {dimWarning && (
          <div
            role="alert"
            style={{
              marginTop: 8,
              padding: '10px 14px',
              background: 'var(--accent-2)',
              color: '#fff',
              borderRadius: 10,
              fontSize: 12,
              fontWeight: 800,
            }}
          >
            تنبيه: هذا النموذج يُنتج {selectedEmbed?.dim} بُعداً، لا يطابق المخطّط الحالي
            ({EXPECTED_EMBED_DIM}). يجب تعديل عمود <code>chunks.embedding</code> قبل الاستخدام.
          </div>
        )}
      </Field>

      {err && (
        <div role="alert" style={alertStyle('var(--accent-2)', '#fff')}>
          {err}
        </div>
      )}
      {status && !err && (
        <div style={alertStyle('var(--accent)', 'var(--accent-ink)')}>{status}</div>
      )}

      <button
        type="submit"
        disabled={saving}
        style={{
          padding: '14px 24px',
          background: 'var(--accent-2)',
          color: '#fff',
          border: 0,
          borderRadius: 12,
          fontSize: 14,
          fontWeight: 900,
          cursor: saving ? 'wait' : 'pointer',
          fontFamily: 'inherit',
        }}
      >
        {saving ? 'جارٍ الحفظ…' : 'حفظ التغييرات'}
      </button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: 'block' }}>
      <span
        style={{
          fontSize: 11,
          fontWeight: 900,
          color: 'var(--fg-muted)',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
        }}
      >
        {label}
      </span>
      <div style={{ marginTop: 6 }}>{children}</div>
    </label>
  );
}

function Hint({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ marginTop: 6, fontSize: 12, fontWeight: 700, color: 'var(--fg-muted)' }}>
      {children}
    </div>
  );
}

function panelStyle(): React.CSSProperties {
  return {
    background: 'var(--surface)',
    border: '3px solid var(--border-strong)',
    borderRadius: 22,
    padding: 28,
    display: 'grid',
    gap: 16,
  };
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
  };
}

function alertStyle(bg: string, fg: string): React.CSSProperties {
  return {
    padding: '10px 14px',
    background: bg,
    color: fg,
    borderRadius: 10,
    fontSize: 13,
    fontWeight: 800,
  };
}
