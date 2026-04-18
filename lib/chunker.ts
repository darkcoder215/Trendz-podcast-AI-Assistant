import { encode } from 'gpt-tokenizer';

export type Segment = {
  startSec: number;
  text: string;
  speaker?: string | null;
};

export type Chunk = {
  startSec: number;
  endSec: number;
  content: string;
  speaker: string | null;
  tokenCount: number;
};

const TS_RE = /^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*$/;

/**
 * Parse a YouTube auto-transcript. Expected format (common YT export):
 *
 *   00:42
 *   [speaker:] utterance text here
 *   01:18
 *   another line of text
 *
 * Timestamps on their own line. Speaker optional, prefixed with `name:`
 * (Arabic or Latin). Everything else is treated as content for the most
 * recent timestamp.
 */
export function parseTranscript(raw: string): Segment[] {
  const lines = raw.replace(/\r\n/g, '\n').split('\n');
  const segments: Segment[] = [];
  let current: Segment | null = null;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    const ts = line.match(TS_RE);
    if (ts) {
      if (current && current.text.trim().length > 0) segments.push(current);
      const h = ts[3] ? parseInt(ts[1], 10) : 0;
      const m = ts[3] ? parseInt(ts[2], 10) : parseInt(ts[1], 10);
      const s = ts[3] ? parseInt(ts[3], 10) : parseInt(ts[2], 10);
      current = {
        startSec: h * 3600 + m * 60 + s,
        text: '',
        speaker: null,
      };
      continue;
    }

    if (!current) {
      // Content before the first timestamp — pin to t=0.
      current = { startSec: 0, text: '', speaker: null };
    }

    const speakerMatch = line.match(/^([\u0600-\u06FFA-Za-z\u200B-\u200F\s]{1,30}):\s*(.*)$/);
    if (speakerMatch && current.text.length === 0) {
      current.speaker = speakerMatch[1].trim();
      const rest = speakerMatch[2].trim();
      if (rest) current.text = rest;
    } else {
      current.text = current.text ? `${current.text} ${line}` : line;
    }
  }
  if (current && current.text.trim().length > 0) segments.push(current);
  return segments;
}

/**
 * Greedy pack segments into chunks of roughly `targetTokens` tokens, never
 * splitting a segment. `overlap` re-includes the tail of the prior chunk
 * to avoid losing context at boundaries.
 */
export function packChunks(segments: Segment[], targetTokens = 400, overlapTokens = 40): Chunk[] {
  const chunks: Chunk[] = [];
  let buf: Segment[] = [];
  let bufTokens = 0;

  const flush = () => {
    if (buf.length === 0) return;
    const content = buf.map((s) => s.text).join(' ');
    const startSec = buf[0].startSec;
    const endSec = buf[buf.length - 1].startSec;
    const speakers = buf.map((s) => s.speaker).filter((x): x is string => !!x);
    const speaker = speakers.length > 0 ? speakers[0] : null;
    chunks.push({
      startSec,
      endSec,
      content: content.trim(),
      speaker,
      tokenCount: encode(content).length,
    });
    // Overlap tail.
    if (overlapTokens > 0) {
      let overlapBuf: Segment[] = [];
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
    if (bufTokens > 0 && bufTokens + t > targetTokens) flush();
    buf.push(seg);
    bufTokens += t;
  }
  flush();
  return chunks;
}
