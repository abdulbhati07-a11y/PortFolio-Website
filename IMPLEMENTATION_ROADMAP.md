# Immersive portfolio implementation roadmap

## Confirmed product decisions
- Next.js App Router, React, TypeScript, React Three Fiber, Drei, Tailwind CSS, and Framer Motion.
- Four room destinations: Projects, Journey, About, Contact.
- One shared typed content source for the room, Flat route, project pages, and assistant knowledge.
- Complete /flat experience independent of WebGL.
- Streaming /api/chat with server-side credentials and production rate limiting.
- Original Abdullah-branded room, models, lighting, and interface design. The reference is a quality and interaction benchmark; no reference assets or source are copied.
- Develop on codex/immersive-portfolio. Production deployment requires separate approval.

## Reconciled repository conflicts
1. The original Vite app has no Three.js dependency. The Next.js app replaces the active entry point while public assets remain.
2. Existing project data is duplicated across constants.js, lab.js, and Bookshelf.jsx. src/content/portfolio.ts is the new canonical source.
3. VisionGuard's evaluation statement conflicts across old files. No metric or recall claim is published until supported by its repository evidence.
   Public URL checks returned 404 for VisionGuard, E-Commerce Data, PawFect, AI Text Summarizer, and Algorithm Visualizer source repositories. The owner confirmed these repositories are private. Their source actions are hidden and the case studies explain why. The AI Text Summarizer demo returned 200 on a retry after its first timeout.
4. The owner confirmed fifth semester at the University of Management and Technology, Lahore. This now appears in both modes.
5. No employment history is supported by the supplied materials. Journey presents learning and projects without invented jobs or dates.
6. The old assistant is local rules. The new assistant uses a streaming server route, a controlled knowledge source, and an explicit unavailable state when credentials are missing.
7. Hosting was not configured in the repository. A Node-capable Next.js deployment and rate limit store are required for live chat and contact.
8. The reference's independent Flat mode could not be verified. The new /flat route is specified and implemented as a first-class experience.

## File-by-file plan and acceptance

| Phase | Files | Acceptance |
| --- | --- | --- |
| 1. Framework | package.json, package-lock.json, next.config.ts, tsconfig.json, postcss.config.js, tailwind.config.js, src/app/layout.tsx, src/app/globals.css | TypeScript and production build pass; routes render. |
| 2. Content | src/content/portfolio.ts, public/assets, public/*.pdf | All supported projects and documents appear; missing actions are hidden; disputed facts are neutral. |
| 3. Flat | src/app/flat/page.tsx, src/components/flat/FlatDesktop.tsx, src/app/projects/[slug]/page.tsx | Four complete destinations, filters, pagination, case studies, social links, resumes and certificates work without WebGL. |
| 4. Room | src/components/experience/ImmersiveExperience.tsx, BootSequence.tsx, DeskScene.tsx, RoomDetails.tsx, WindowManager.tsx, src/lib/quality.ts | Original detailed room, object destinations, camera transitions, boot skip, sound consent, mobile quality profile, and WebGL fallback work. |
| 5. Services | src/app/api/chat/route.ts, src/app/api/contact/route.ts, src/lib/knowledge.ts, src/lib/rate-limit.ts, src/components/shared/*, .env.example | Input validation and rate limits; secrets remain server-side; assistant streams approved answers; contact submits or reports an honest delivery error. |
| 6. Verification | tests/e2e/portfolio.spec.ts, playwright.config.ts, README.md | Typecheck, build, browser paths, keyboard, error states, responsive layouts and factual audit pass. |

## Measurable quality gates
- Every room destination opens from both its object and dock, and closes with Escape or Back to room.
- Project filters show only their category; pagination reaches all projects; every project has a dedicated URL.
- /flat contains equivalent Projects, Journey, About and Contact content with all downloadable files.
- The boot can be bypassed immediately. Sound starts only after visitor action and preference persists.
- WebGL failure exposes a working Flat link and does not hide information.
- Keyboard focus is visible. Reduced motion removes nonessential animation. Layout has no horizontal overflow at 390px.
- Chat rejects malformed requests, respects a 500-character user limit, rate limits in production, and never has a client-side API key.
- Contact rejects invalid data, rate limits in production, and reports success only after the mail service confirms delivery.
- Measure LCP, INP, CLS and room frame rate on defined test devices. Targets: LCP <= 2.5s, INP <= 200ms, CLS <= 0.1; do not claim achievement without measurements.
- Production build and automated browser tests pass before a deployment preview. Production deployment requires explicit approval.

## Outstanding external inputs
- Evidence for disputed VisionGuard evaluation, e-commerce dataset provenance, and any project outcome metrics.
- OpenAI API key, production Redis rate-limit credentials, EmailJS credentials, and Node-capable hosting configuration.
- Optional licensed ambient audio and higher fidelity 3D art assets.

## Verification on the feature branch
- `npm run typecheck`, `npm run lint`, and `npm run build` pass.
- The browser suite covers room navigation and previews, the desk bot, the independent Flat route, WebGL fallback, mobile layouts, case studies, and service behavior. The limited server-side portfolio guide answers verified facts without credentials; AI streaming and contact success are tested with mocked responses. Live external services remain unverified.
- A single local Edge lab run measured Flat LCP at about 1.6 s and room frame rate at about 37 FPS after scene optimization. These are machine-specific samples, not field performance results. INP and production Core Web Vitals remain unmeasured.
- The link audit confirms local asset paths. Its external requests were blocked by the current network sandbox, so live link availability needs a check from an unrestricted connection before publication.
- The current 3D room uses original procedural geometry and materials. Higher fidelity art assets and further device testing would improve fidelity to the reference's visual polish.
