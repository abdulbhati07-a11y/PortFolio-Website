import { z } from 'zod';
import { limitRequest } from '@/lib/rate-limit';

export const runtime = 'nodejs';

const contactSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.email().max(160),
  message: z.string().trim().min(10).max(3000),
  website: z.string().max(0).optional(),
});

export async function POST(request: Request) {
  if (Number(request.headers.get('content-length') || 0) > 6000) return new Response('Request too large', { status: 413 });
  let input: z.infer<typeof contactSchema>;
  try { input = contactSchema.parse(await request.json()); } catch { return new Response('Please check the form fields.', { status: 400 }); }
  const rate = await limitRequest('contact', request);
  if (!rate.ok) return new Response(rate.reason, { status: rate.status });
  const { EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, EMAILJS_PUBLIC_KEY } = process.env;
  if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY) return new Response('The message service is not configured.', { status: 503 });
  try {
    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service_id: EMAILJS_SERVICE_ID,
        template_id: EMAILJS_TEMPLATE_ID,
        user_id: EMAILJS_PUBLIC_KEY,
        template_params: { from_name: input.name, from_email: input.email, subject: 'New Portfolio Message', message: input.message, to_name: 'Developer', reply_to: input.email },
      }),
    });
    if (!response.ok) return new Response('Message delivery failed. Please use the email link.', { status: 502 });
    return Response.json({ sent: true });
  } catch { return new Response('Message delivery failed. Please use the email link.', { status: 502 }); }
}
