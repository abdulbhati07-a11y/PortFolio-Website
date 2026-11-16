import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';

const configured = Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
const redis = configured ? Redis.fromEnv() : null;

const chatLimiter = redis ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(8, '1 m'), prefix: 'abdullah:chat' }) : null;
const contactLimiter = redis ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(3, '10 m'), prefix: 'abdullah:contact' }) : null;

export async function limitRequest(kind: 'chat' | 'contact', request: Request) {
  if (!configured) return {
    ok: process.env.NODE_ENV !== 'production',
    status: 503,
    reason: kind === 'chat' ? 'Chat is temporarily unavailable.' : 'Message service is temporarily unavailable.',
  };
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const result = await (kind === 'chat' ? chatLimiter! : contactLimiter!).limit(ip);
  return { ok: result.success, status: 429, reason: 'Too many requests. Please try again later.' };
}
