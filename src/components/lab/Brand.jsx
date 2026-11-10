import React from 'react';

export default function Brand({ href, onClick }) {
  const mark = <>
    <span className="brand-symbol" aria-hidden="true"><svg viewBox="0 0 52 52" fill="none" focusable="false"><path d="M7 41 24 8l17 33M14 29h20" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/><circle cx="43" cy="10" r="3" fill="currentColor"/></svg></span>
    <span className="brand-wordmark"><strong>ABDULLAH<span className="brand-period">.</span></strong><small>DESIGN × INTELLIGENCE</small></span>
  </>;
  return href
    ? <a className="lab-mark brand-lockup" href={href} onClick={onClick} aria-label="Abdullah portfolio home">{mark}</a>
    : <span className="lab-mark brand-lockup">{mark}</span>;
}
