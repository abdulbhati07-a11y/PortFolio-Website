import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';

const configured = Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
const redis = configured ? Redis.fromEnv() : null;

const chatLimiter = redis ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(8, '1 m'), prefix: 'abdullah:chat' }) : null;
const contactLimiter = redis ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(3, '10 m'), prefix: 'abdullah:contact' }) : null;
const localChatRequests = new Map<string, number[]>();

export async function limitRequest(kind: 'chat' | 'contact', request: Request) {
  if (!configured) {
    if (kind === 'chat' && !process.env.OPENAI_API_KEY) {
      const key = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local';
      const now = Date.now();
      if (localChatRequests.size > 5000) localChatRequests.clear();
      const recent = (localChatRequests.get(key) || []).filter((time) => now - time < 60000);
      if (recent.length >= 8) return { ok: false, status: 429, reason: 'Too many requests. Please try again later.' };
      recent.push(now);
      localChatRequests.set(key, recent);
      return { ok: true, status: 200, reason: '' };
    }
    return { ok: process.env.NODE_ENV !== 'production', status: 503, reason: kind === 'chat' ? 'Chat is temporarily unavailable.' : 'Message service is temporarily unavailable.' };
  }
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const result = await (kind === 'chat' ? chatLimiter! : contactLimiter!).limit(ip);
  return { ok: result.success, status: 429, reason: 'Too many requests. Please try again later.' };
}
