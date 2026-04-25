import { encode } from 'gpt-tokenizer';

export type Segment = {
  startSec: number;
  text: string;
  speaker: string | null;
  chapter: string | null;
};

export type Chunk = {
  startSec: number;
  endSec: number;
  content: string;
  speaker: string | null;
  chapter: string | null;
  tokenCount: number;
};

/**
 * YouTube auto-transcripts copied from the "Show transcript" panel have lines
 * like these (timestamp, human-readable duration, and Arabic text are all
 * concatenated together on one line, with **no spaces** between them):
 *
 *   0:022 secondsالذهب طول ما في حروف في العالم الذهب هيطلع لملا نهايه
 *   1:051 minute, 5 secondsسواء الناحيه دي او الناحيه دي افكار امريكيه
 *   2:412 minutes, 41 secondsبيبقى بالنسبه لها في ناس بتحب تظهر
 *
 * And occasional chapter markers:
 *
 *   Chapter 2: لماذا يبتعد عمر الشنيطي عن الظهور الإعلامي؟
 *
 * Our parser must:
 *   1. Pick up `MM:SS` or `HH:MM:SS` at the start of a line.
 *   2. Strip the optional human-readable duration that immediately follows.
 *   3. Keep the remaining Arabic text as content.
 *   4. Tag segments that come after a `Chapter N:` header with that chapter.
 *   5. Also tolerate the simpler layout where timestamp is on its own line.
 */

// Timestamp anchor at the start of the line (no surrounding whitespace tests —
// we always call this after trimming).
const TS_RE = /^(\d{1,2}):(\d{2})(?::(\d{2}))?/;

// Human-readable duration blob right after the timestamp. Arabic transcripts
// still use English unit words ("seconds", "minute,"). Arabic-localized
// transcripts use "ثانية/ثواني" / "دقيقة/دقائق".
const DURATION_AFTER_TS = new RegExp(
  '^' +
    '(?:' +
      '\\d+\\s*(?:minutes?|hours?|seconds?|ثواني|ثانية|دقيقة|دقائق|ساعة|ساعات)' +
      '(?:\\s*,\\s*\\d+\\s*(?:minutes?|hours?|seconds?|ثواني|ثانية|دقيقة|دقائق|ساعة|ساعات))*' +
    ')' +
    '\\s*',
);

const CHAPTER_RE = /^Chapter\s+\d+\s*:\s*(.+)$/i;
const CHAPTER_RE_AR = /^(?:الفصل|القسم)\s*\d*\s*[:\-ـ]\s*(.+)$/;

const SPEAKER_RE = /^([\u0600-\u06FFA-Za-z][\u0600-\u06FFA-Za-z\s]{0,28}):\s*(.*)$/;

export function parseTranscript(raw: string): Segment[] {
  const lines = raw.replace(/\r\n/g, '\n').split('\n');
  const segments: Segment[] = [];
  let current: Segment | null = null;
  let chapter: string | null = null;

  const pushCurrent = () => {
    if (current && current.text.trim().length > 0) {
      segments.push(current);
    }
    current = null;
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    // Chapter header?
    const ch = line.match(CHAPTER_RE) ?? line.match(CHAPTER_RE_AR);
    if (ch) {
      chapter = ch[1].trim();
      continue;
    }

    const tsMatch = line.match(TS_RE);
    if (tsMatch) {
      pushCurrent();

      const h = tsMatch[3] ? parseInt(tsMatch[1], 10) : 0;
      const m = tsMatch[3] ? parseInt(tsMatch[2], 10) : parseInt(tsMatch[1], 10);
      const s = tsMatch[3] ? parseInt(tsMatch[3], 10) : parseInt(tsMatch[2], 10);
      const startSec = h * 3600 + m * 60 + s;

      // Everything after the timestamp on this line.
      let rest = line.slice(tsMatch[0].length);
      // Strip the leading duration blob if present (glued or with a space).
      rest = rest.replace(DURATION_AFTER_TS, '').trimStart();

      current = { startSec, text: rest, speaker: null, chapter };
      continue;
    }

    // Non-timestamp line: belongs to the current segment (or pinned to t=0
    // for a short header above the first timestamp).
    if (!current) {
      current = { startSec: 0, text: '', speaker: null, chapter };
    }

    // Speaker heuristic: only accept a "Name:" prefix at the very start of a
    // segment. Anything later is treated as plain content to avoid
    // accidentally matching colons inside Arabic prose.
    if (current.text.length === 0) {
      const sp = line.match(SPEAKER_RE);
      if (sp) {
        current.speaker = sp[1].trim();
        if (sp[2]) current.text = sp[2].trim();
        continue;
      }
    }
    current.text = current.text ? `${current.text} ${line}` : line;
  }

  pushCurrent();
  return segments;
}

/**
 * Greedy-pack segments into chunks ~targetTokens long, never splitting a
 * segment. `overlapTokens` re-includes the tail of the previous chunk so
 * retrieval doesn't miss boundary context.
 */
export function packChunks(segments: Segment[], targetTokens = 400, overlapTokens = 40): Chunk[] {
  const chunks: Chunk[] = [];
  let buf: Segment[] = [];
  let bufTokens = 0;

  const flush = (nextSeg?: Segment) => {
    if (buf.length === 0) return;
    const content = buf.map((s) => s.text).join(' ').trim();
    const startSec = buf[0].startSec;
    // The chunk's true end is the moment the *next* segment begins. When
    // there is no next segment (final chunk), fall back to the last
    // segment's start — caller can post-process with episode.duration_sec.
    const endSec = nextSeg ? nextSeg.startSec : buf[buf.length - 1].startSec;
    const speakers = buf.map((s) => s.speaker).filter((x): x is string => !!x);
    const speaker = speakers.length > 0 ? speakers[0] : null;
    const chapters = buf.map((s) => s.chapter).filter((x): x is string => !!x);
    const chapter = chapters.length > 0 ? chapters[0] : null;
    chunks.push({
      startSec,
      endSec,
      content,
      speaker,
      chapter,
      tokenCount: encode(content).length,
    });
    // Overlap tail.
    if (overlapTokens > 0) {
      const overlapBuf: Segment[] = [];
      let overlapCount = 0;
      for (let i = buf.length - 1; i >= 0; i--) {
        const t = encode(buf[i].text).length;
        if (overlapCount + t > overlapTokens) break;
        overlapCount += t;
        overlapBuf.unshift(buf[i]);
      }
      buf = overlapBuf;
      bufTokens = overlapCount;
    } else {
      buf = [];
      bufTokens = 0;
    }
  };

  for (const seg of segments) {
    const t = encode(seg.text).length;
    if (bufTokens > 0 && bufTokens + t > targetTokens) flush(seg);
    buf.push(seg);
    bufTokens += t;
  }
  flush();
  return chunks;
}
