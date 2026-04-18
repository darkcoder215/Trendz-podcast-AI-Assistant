/**
 * First-line guardrails for user questions.
 *
 * Goals:
 * 1. Block obvious prompt-injection / jailbreak attempts before we embed or
 *    pay OpenRouter.
 * 2. Block hate speech, slurs, sexual content, and personal abuse.
 * 3. Catch simple obfuscation (zero-width chars, control codes, homoglyph
 *    spoofing) used to smuggle payloads.
 *
 * This is *layered* — the system prompt ALSO instructs the LLM to refuse
 * these categories. If either layer catches it, we refuse.
 */

export type GuardCode =
  | 'prompt_injection'
  | 'hate'
  | 'sexual'
  | 'abuse'
  | 'suspicious';

export type GuardrailResult =
  | { ok: true; cleaned: string }
  | { ok: false; code: GuardCode; reasonAr: string };

// --- Prompt-injection patterns (EN + AR) ------------------------------------
const PROMPT_INJECTION = [
  /ignore\s+(all\s+)?(the\s+)?(previous|prior|above|system)\s+(instructions?|prompts?|rules?|messages?)/i,
  /disregard\s+(the\s+)?(system\s+)?(prompt|instructions?|rules?)/i,
  /forget\s+(everything|all|what)\s+(you|i)\s+(know|said|told|were|was)/i,
  /(you\s+are|act|pretend|role[\s-]?play)\s+(now\s+)?(as\s+)?(a\s+|an\s+)?(new\s+|different\s+)?(dan|developer\s+mode|jailbreak|unrestricted|uncensored|evil|god)/i,
  /(switch|enter|enable)\s+(to\s+)?(dev|developer|jailbreak|unrestricted|god|admin|root)\s*mode/i,
  /\bprompt\s*(leak|dump|print|reveal|show|expose|display)\b/i,
  /\bsystem\s*(prompt|message|instructions?)\s*(leak|dump|print|reveal|show|expose)/i,
  /override\s+(your|all|the)\s+(instructions?|constraints?|rules?|guardrails?)/i,
  /bypass\s+(your|the|all)\s+(safety|filter|guardrail|rule|restriction)/i,
  /\bdan\b.{0,40}\b(mode|prompt|jailbreak)\b/i,
  /```\s*(system|instructions?|prompt)\s*\n/i,
  // Template-injection style
  /\{\{\s*(system|prompt|role)\s*\}\}/i,
  // Arabic
  /تجاهل\s+(كل\s+|جميع\s+)?(التعليمات|التوجيهات|القواعد|السياق|الرسائل)\s*(السابقة|اعلاه|الخفية)?/,
  /انس\s+(كل|جميع)?\s*(ما\s+)?(قيل|قيل\s+لك|تم|السابق|التعليمات|قواعدك)/,
  /(تصرف|تظاهر|العب\s+دور)\s+(كأنك|أنك)/,
  /اكشف\s+(التعليمات|برومبت|الرسالة\s+النظامية|الـ\s*system\s*prompt)/i,
  /تجاوز\s+(القيود|القواعد|الحواجز|التوجيهات)/,
];

// --- Hate / slurs (non-exhaustive; we rely on the LLM layer for the long tail) ----
const HATE = [
  /\b(kill|murder|exterminate|gas|lynch|massacre)\s+(all\s+)?(the\s+)?(jews?|muslims?|arabs?|blacks?|whites?|christians?|gays?|lesbians?|trans(gender)?|refugees?|immigrants?)/i,
  /(sub[\s-]?human|inferior\s+(race|people)|apes?)\s+(race|ethnicity|species)/i,
  /\b(nigger|faggot|kike|spic|chink|towelhead|raghead|tranny)s?\b/i,
  /holocaust\s+(was\s+)?(fake|didn'?t\s+happen|hoax)/i,
  /hitler\s+(was\s+)?(right|good|hero)/i,
  // Arabic
  /(اقتل|اذبح|ابادة|تصفية)\s+(كل\s+)?(اليهود|المسلمين|العرب|المسيحيين|الشيعة|السنة|الاقباط|الأكراد)/,
  /(عرق|دين|شعب)\s+(حقير|ادنى|اقل|ناقص|متخلف)/,
];

// --- Sexual content / solicitation ---
const SEXUAL = [
  /\b(porn|pornograph(y|ic)|nude|naked|erotic|explicit|fetish|orgasm|masturbat(e|ion)|penis|vagina|blowjob|handjob|anal|rape|incest|bestiality|pedophil)/i,
  /\b(sexual\s+(act|fantasy|roleplay|story))\b/i,
  /(اغتصاب|إباحي(ة|ات)?|عاري(ة)?|عريان|قضيب|مهبل|شرج(ي)?|استمناء|ممارسة\s+جنسية|علاقة\s+جنسية|مثير(ة)?\s+جنسياً|سحاق|لواط)/,
];

// --- Personal abuse / insults aimed at guests/hosts ---
const ABUSE = [
  /\b(fuck\s*(you|off|this)|shit\s*head|asshole|motherfucker|dickhead|cunt|bitch|bastard|pig|retard)\b/i,
  /(يا\s+(حمار|كلب|خنزير|بهيم|كذاب|قذر|حقير)|انقلع|اخرس|اسكت\s+يا)/,
  /كس\s*(ك|أمك|اختك)/,
];

// --- Suspicious obfuscation ---
const SUSPICIOUS_CONTROL = /[\u0000-\u0008\u000B-\u001F\u007F\u200B-\u200F\u202A-\u202E\u2066-\u2069]/; // control + zero-width + bidi

function containsAny(patterns: RegExp[], text: string): boolean {
  return patterns.some((re) => re.test(text));
}

/**
 * Normalize before screening: strip control/zero-width chars (also returned
 * to the caller as the cleaned question so embedding doesn't see smuggled
 * bytes). Collapse whitespace.
 */
function normalize(raw: string): string {
  return raw
    .replace(/[\u0000-\u0008\u000B-\u001F\u007F\u200B-\u200F\u202A-\u202E\u2066-\u2069]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function screenQuestion(raw: string): GuardrailResult {
  // Check the ORIGINAL for smuggling attempts before we clean.
  if (SUSPICIOUS_CONTROL.test(raw)) {
    return {
      ok: false,
      code: 'suspicious',
      reasonAr: 'تم رصد محارف غير مرئية في سؤالك. يُرجى إعادة كتابة السؤال بنصٍّ واضح.',
    };
  }

  const cleaned = normalize(raw);
  if (cleaned.length < 3) {
    return { ok: false, code: 'suspicious', reasonAr: 'السؤال قصير جداً.' };
  }

  if (containsAny(PROMPT_INJECTION, cleaned)) {
    return {
      ok: false,
      code: 'prompt_injection',
      reasonAr:
        'لن أتجاوز تعليماتي أو أكشفها. اطرح سؤالاً فعلياً عن محتوى الحلقات من فضلك.',
    };
  }

  if (containsAny(HATE, cleaned)) {
    return {
      ok: false,
      code: 'hate',
      reasonAr: 'لا أُجيب على أسئلة فيها خطاب كراهية أو تحريض.',
    };
  }

  if (containsAny(SEXUAL, cleaned)) {
    return {
      ok: false,
      code: 'sexual',
      reasonAr: 'هذا السؤال خارج نطاق المساعد — لا أتعامل مع محتوى جنسي.',
    };
  }

  if (containsAny(ABUSE, cleaned)) {
    return {
      ok: false,
      code: 'abuse',
      reasonAr: 'رجاءً اطرح سؤالك بأسلوب لائق وبلا إهانات.',
    };
  }

  return { ok: true, cleaned };
}
