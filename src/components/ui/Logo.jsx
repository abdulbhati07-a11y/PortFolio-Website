import React, { useId } from 'react';

/**
 * Brand mark: a stylized "A" peak drawn as a cyan→blue gradient stroke with a
 * circuit node in place of the crossbar — nodes + connection lines echo the
 * tech-constellation motif used across the site. Pure inline SVG: crisp at
 * any size, zero assets, inherits nothing from the theme so it reads
 * identically in light and dark.
 */
const Logo = ({ size = 32, className = '', glow = false }) => {
  const uid = useId();
  const gradId = `logo-grad-${uid}`;

  return (
    <svg
      viewBox="0 0 48 48"
      width={size}
      height={size}
      className={className}
      style={glow ? { filter: 'drop-shadow(0 0 10px rgba(0,212,255,0.45))' } : undefined}
      role="img"
      aria-label="Muhammad Abdullah Bhatti logo"
    >
      <defs>
        <linearGradient id={gradId} x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#0077ff" />
          <stop offset="55%" stopColor="#00b4d8" />
          <stop offset="100%" stopColor="#00d4ff" />
        </linearGradient>
      </defs>

      {/* "A" peak — open at the base for a modern, forward feel */}
      <path
        d="M9 40 L24 8 L39 40"
        fill="none"
        stroke={`url(#${gradId})`}
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Circuit crossbar: node + trace stubs instead of a plain bar */}
      <line
        x1="17.5" y1="30" x2="21" y2="30"
        stroke={`url(#${gradId})`}
        strokeWidth="3.4"
        strokeLinecap="round"
      />
      <line
        x1="27" y1="30" x2="30.5" y2="30"
        stroke={`url(#${gradId})`}
        strokeWidth="3.4"
        strokeLinecap="round"
      />
      <circle cx="24" cy="30" r="3.2" fill="#00d4ff" />
    </svg>
  );
};

export default Logo;
