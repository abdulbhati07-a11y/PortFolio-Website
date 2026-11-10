import React, { useEffect, useRef, useState } from 'react';
import { DEVELOPER_INFO } from '../../utils/constants';

const username = DEVELOPER_INFO.github.replace(/\/$/, '').split('/').pop();
const featured = [
  { name: 'Vision_Guard', html_url: 'https://github.com/abdulbhati07-a11y/Vision_Guard', language: 'Python' },
  { name: 'Ecommerce_DataScience', html_url: 'https://github.com/abdulbhati07-a11y/Ecommerce_DataScience', language: 'Python' },
  { name: 'Pawfect-Petsitting', html_url: 'https://github.com/abdulbhati07-a11y/Pawfect-Petsitting', language: 'React' },
  { name: 'LunaWashweb', html_url: 'https://github.com/abdulbhati07-a11y/LunaWashweb', language: 'React' },
];

const dateLabel = value => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
};

export default function SocialActivity() {
  const section = useRef(null);
  const [state, setState] = useState({ status: 'idle', repos: [] });

  useEffect(() => {
    const controller = new AbortController();
    let disposed = false;
    let requested = false;
    let timeout;

    const load = async () => {
      if (requested) return;
      requested = true;
      setState({ status: 'loading', repos: [] });
      try {
        const cacheKey = `public-repos:${username}`;
        let cached = null;
        try { cached = JSON.parse(sessionStorage.getItem(cacheKey) || 'null'); } catch { /* Optional cache. */ }
        if (cached && Date.now() - cached.savedAt < 15 * 60 * 1000 && cached.repos?.length) {
          if (!disposed) setState({ status: 'ready', repos: cached.repos });
          return;
        }
        timeout = window.setTimeout(() => controller.abort(), 6500);
        const response = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}/repos?type=owner&sort=pushed&direction=desc&per_page=8`, {
          headers: { Accept: 'application/vnd.github+json' },
          signal: controller.signal,
        });
        if (!response.ok) throw new Error(`GitHub returned ${response.status}`);
        const data = await response.json();
        if (!Array.isArray(data)) throw new Error('Unexpected GitHub response');
        const repos = data.filter(repo => !repo.fork && !repo.archived && repo.html_url?.startsWith(`${DEVELOPER_INFO.github}/`)).slice(0, 4).map(repo => ({
          name: repo.name,
          html_url: repo.html_url,
          language: repo.language || 'Repository',
          pushed_at: repo.pushed_at,
        }));
        if (!repos.length) throw new Error('No public repositories found');
        try { sessionStorage.setItem(cacheKey, JSON.stringify({ savedAt: Date.now(), repos })); } catch { /* Optional cache. */ }
        if (!disposed) setState({ status: 'ready', repos });
      } catch {
        if (!disposed) setState({ status: 'fallback', repos: featured });
      } finally {
        window.clearTimeout(timeout);
      }
    };

    const observer = 'IntersectionObserver' in window
      ? new IntersectionObserver(entries => { if (entries[0].isIntersecting) { observer.disconnect(); load(); } }, { rootMargin: '350px' })
      : null;
    if (observer && section.current) observer.observe(section.current);
    else load();
    return () => { disposed = true; observer?.disconnect(); controller.abort(); window.clearTimeout(timeout); };
  }, []);

  const rows = state.status === 'ready' || state.status === 'fallback' ? state.repos : [];

  return <section className="lab-section social-activity" id="activity" ref={section} aria-labelledby="activity-title">
    <div className="section-kicker"><span className="micro">PUBLIC WORK & CONNECTIONS</span><span className="micro">FOLLOW THE PROCESS ↗</span></div>
    <div className="social-activity-intro"><div><span className="micro accent">BEYOND THE BOOKSHELF</span><h2 id="activity-title">The work<br /><em>keeps moving.</em></h2></div><p>Explore recent public code on GitHub and connect with me on LinkedIn.</p></div>
    <div className="social-activity-grid">
      <div className="activity-ledger">
        <div className="activity-ledger-head"><div><span className="activity-platform">G<span>H</span></span><div><span className="micro">GITHUB / PUBLIC REPOSITORIES</span><strong>@{username}</strong></div></div><a href={DEVELOPER_INFO.github} target="_blank" rel="noreferrer" data-magnetic="button">Visit profile <span aria-hidden="true">↗</span></a></div>
        <p className="activity-status" aria-live="polite">{state.status === 'ready' ? 'Recently pushed public repositories · updates from GitHub' : state.status === 'fallback' ? 'Live updates are unavailable · selected repositories below' : 'Loading recent public work…'}</p>
        <div className="activity-rows">{rows.length ? rows.map((repo, index) => <a href={repo.html_url} target="_blank" rel="noreferrer" className="activity-row" key={repo.html_url}><span className="activity-number">0{index + 1}</span><span className="activity-repo"><strong>{repo.name.replaceAll('_', ' ')}</strong><small>{repo.language}</small></span><span className="activity-date">{state.status === 'ready' && repo.pushed_at ? `Pushed ${dateLabel(repo.pushed_at)}` : 'VIEW CODE'}</span><span className="activity-arrow" aria-hidden="true">↗</span></a>) : Array.from({ length: 4 }, (_, index) => <span className="activity-loading" aria-hidden="true" key={index} />)}</div>
        <a className="activity-all" href={`${DEVELOPER_INFO.github}?tab=repositories`} target="_blank" rel="noreferrer">See all public repositories <span aria-hidden="true">↗</span></a>
      </div>
      <div className="linkedin-card"><span className="micro">PROFESSIONAL NETWORK / LINKEDIN</span><div className="linkedin-mark" aria-hidden="true">in</div><div><h3>Let’s connect<br /><em>beyond the code.</em></h3><p>Find my professional profile, follow what I’m learning, and start a conversation about web or data science work.</p></div><a href={DEVELOPER_INFO.linkedin} target="_blank" rel="noreferrer" data-magnetic="button">Connect on LinkedIn <span aria-hidden="true">↗</span></a></div>
    </div>
  </section>;
}
