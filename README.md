# Muhammad Abdullah Bhatti — Immersive Portfolio

An original developer desk and a complete Flat portfolio built with Next.js App Router, React, TypeScript, React Three Fiber, Drei, Tailwind CSS, and Framer Motion. This branch preserves the existing public assets, project screenshots, resumes, and certificates.

## Routes
- `/` — full room view with hover previews, a desk robot that opens the assistant, and Projects, Journey, About, and Contact.
- `/flat` — complete portfolio without WebGL.
- `/projects/[slug]` — shareable project case studies.
- `/api/chat` — server-side streaming portfolio assistant.
- `/api/contact` — validated contact submission.

## Local setup
Requires Node.js 20.9 or newer.

```powershell
npm install
Copy-Item .env.example .env.local
npm run dev
```

Open `http://localhost:3000`. The room and Flat route work without API credentials. Chat gives limited answers from verified portfolio facts without an OpenAI key. Contact delivery requires the service settings below.

## Environment variables
Set these only on the server, in `.env.local` or deployment platform settings:

- `OPENAI_API_KEY`: optional key for richer streaming assistant responses. Without it, a limited server-side portfolio guide answers common verified questions and declines unknown claims.
- `OPENAI_MODEL`: optional model ID; default is `gpt-4o-mini`.
- `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`: production rate limiting for AI chat and contact. With no OpenAI key, the limited portfolio guide uses a local per-process limit. AI and contact requests are rejected in production if the rate limit service is missing.
- `EMAILJS_SERVICE_ID`, `EMAILJS_TEMPLATE_ID`, `EMAILJS_PUBLIC_KEY`: existing contact delivery service, now called from the server. The template expects `from_name`, `from_email`, `subject`, `message`, and `to_name`.

No API key is exposed through a `NEXT_PUBLIC_` variable.

## Checks
```powershell
npm run typecheck
npm run lint
npm run build
npm run test:e2e
```

End-to-end tests use the locally installed Microsoft Edge and expect a dev server at `http://localhost:3000`.

## Content and claims
`src/content/portfolio.ts` is the single source for both modes and project pages. Assistant answers are grounded in this content through `src/lib/knowledge.ts`. The owner confirmed fifth semester at the University of Management and Technology, Lahore. VisionGuard evaluation remains disputed, and five project repositories are private; their public source actions are hidden. Do not add employment, metrics, completion dates, or technical capabilities without evidence.

## Deployment
Deploy to a host that supports the Next.js Node.js runtime and route handlers. Configure the server environment variables before enabling chat and contact in production. Run the checks above, create a deploy preview, verify its routes and API behavior, then switch the live domain only after the owner's explicit approval. A static export cannot run the streaming assistant or contact routes.

The current live portfolio is untouched by this feature branch. See `IMPLEMENTATION_ROADMAP.md` for acceptance gates and outstanding inputs.
