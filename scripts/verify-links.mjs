import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { projects, resumes, certificates, profile } from '../src/content/portfolio.ts';

const local = [
  profile.portrait,
  ...projects.map((project) => project.image).filter(Boolean),
  ...resumes.flatMap((item) => [item.pdf, item.docx]),
  ...certificates.flatMap((item) => [item.file, item.image]),
];
const missing = local.filter((item) => !existsSync(join('public', decodeURI(item.slice(1)))));
for (const item of missing) console.log('MISSING LOCAL', item);

const urls = [...new Set([
  profile.github, profile.linkedin,
  ...projects.flatMap((project) => [project.live, project.source]).filter(Boolean),
])];
const results = await Promise.all(urls.map(async (url) => {
  try {
    const response = await fetch(url, { method: 'HEAD', redirect: 'follow', signal: AbortSignal.timeout(15000) });
    return { url, status: response.status, ok: response.ok };
  } catch (error) {
    return { url, status: 'NETWORK_ERROR', ok: false, error: error instanceof Error ? error.message : String(error) };
  }
}));
for (const item of results) console.log(item.ok ? 'OK' : 'CHECK', item.status, item.url, item.error || '');
if (missing.length) process.exitCode = 1;
