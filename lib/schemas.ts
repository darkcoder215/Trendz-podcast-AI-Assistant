import { z } from 'zod';

export const askRequestSchema = z.object({
  text: z.string().min(3).max(500),
  episodeFilter: z.array(z.string().uuid()).max(20).optional().default([]),
});
export type AskRequest = z.infer<typeof askRequestSchema>;

export const identifyRequestSchema = z.object({
  name: z
    .string()
    .min(1)
    .max(80)
    .regex(/^[^<>{}]*$/, { message: 'invalid_chars' }),
  email: z.string().email().max(160),
});
export type IdentifyRequest = z.infer<typeof identifyRequestSchema>;

export const adminEpisodeSchema = z.object({
  num: z.number().int().positive().max(100000),
  titleAr: z.string().min(2).max(200),
  guestNameAr: z.string().min(2).max(120),
  guestRoleAr: z.string().max(160).optional().nullable(),
  youtubeUrl: z.string().url(),
  guestPhotoUrl: z.string().url().optional().nullable(),
  publishedAt: z.string().date().optional().nullable(),
  topicsAr: z.array(z.string().min(1).max(60)).max(10).optional().default([]),
  summaryAr: z.string().max(2000).optional().nullable(),
  durationSec: z.number().int().nonnegative().optional().nullable(),
});
export type AdminEpisodeInput = z.infer<typeof adminEpisodeSchema>;

export const adminIngestSchema = z.object({
  episodeId: z.string().uuid(),
  transcriptRaw: z.string().min(50).max(500_000),
});
export type AdminIngestInput = z.infer<typeof adminIngestSchema>;
