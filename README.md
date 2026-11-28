# Muhammad Abdullah Bhatti — Immersive Portfolio

An original developer desk and a complete Flat portfolio built with Next.js App Router, React, TypeScript, Three.js, GSAP, Tailwind CSS, and Framer Motion. This branch preserves the existing public assets, project screenshots, resumes, and certificates.

## Routes
- `/` — custom tiled room with staged lighting, bounded drag navigation, a robot portfolio guide, project blueprints, and Projects, Experience, About, and Contact.
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

Open `http://localhost:3000`. The room and Flat route work without API credentials. The room robot uses a local guide grounded in the shared verified content. Flat mode offers server chat with limited answers from verified portfolio facts without an OpenAI key. Contact delivery requires the service settings below.

## Spotify speaker

**Enter with sound** enables a very quiet synthesized room hum with a gradual fade. **Enter without sound** starts silently. The room sound button toggles the hum; Spotify playback temporarily fades it out, then restores it on pause if room sound is still enabled. Background tabs suspend the hum.

Click the room’s speaker or the music button, search by song title or artist, then select a result. The result list includes artist, artwork, duration, and a **Show more songs** action. Press play in Spotify’s embedded player after selecting. The speaker display follows the selected title and actual playback events. Minimize keeps playback available during room navigation; Close stops it.

Catalog search uses Spotify’s official Web API through `/api/spotify/search`. Create a Spotify developer app and set `SPOTIFY_CLIENT_ID` and `SPOTIFY_CLIENT_SECRET` in `.env.local` and the hosting environment, then restart the server. Set `SPOTIFY_MARKET` to an ISO country code (default `PK`). Production search also requires the existing Upstash rate limit configuration. No credentials or access tokens are returned to the browser. Missing credentials show an honest unavailable state; there is no simulated catalog. The existing validated `/api/spotify` oEmbed route resolves metadata when Spotify advances to another track.

Spotify controls full-song/preview availability, login and browser support; catalog search credentials do not grant unrestricted playback. Development-mode app owners currently need Spotify Premium. See [Spotify search](https://developer.spotify.com/documentation/web-api/reference/search), [client credentials](https://developer.spotify.com/documentation/web-api/tutorials/client-credentials-flow), and [development-mode requirements](https://developer.spotify.com/documentation/web-api/tutorials/february-2026-migration-guide).

## Environment variables
Set these only on the server, in `.env.local` or deployment platform settings:

- `OPENAI_API_KEY`: optional key for richer streaming assistant responses. Without it, a limited server-side portfolio guide answers common verified questions and declines unknown claims.
- `OPENAI_MODEL`: optional model ID; default is `gpt-4o-mini`.
- `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`: production rate limiting for AI chat, contact, and Spotify search. With no OpenAI key, the limited portfolio guide uses a local per-process limit. AI and contact requests are rejected in production if the rate limit service is missing.
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
