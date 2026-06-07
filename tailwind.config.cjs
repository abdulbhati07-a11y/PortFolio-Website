/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "rgba(var(--bg-primary), <alpha-value>)",
        secondary: "rgba(var(--bg-secondary), <alpha-value>)",
        tertiary: "rgba(var(--bg-tertiary), <alpha-value>)",
        glass: "rgba(var(--glass-color), <alpha-value>)",
        accent: {
          cyan: "#00D9FF",
          purple: "#A855F7",
          green: "#10B981",
          orange: "#F97316"
        },
        text: {
          primary: "rgba(var(--text-primary), <alpha-value>)",
          secondary: "rgba(var(--text-secondary), <alpha-value>)",
          tertiary: "rgba(var(--text-tertiary), <alpha-value>)"
        }
      },
      fontFamily: {
        mono: ['"Space Mono"', 'monospace'],
        sans: ['Poppins', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 20s linear infinite',
        'float': 'float 4s ease-in-out infinite',
        'gradient': 'gradient-shift 3s ease infinite',
        'fade-in-up': 'fade-in-up 0.8s ease forwards',
        'shimmer': 'shimmer 4s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        'gradient-shift': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'fade-in-up': {
          from: { opacity: '0', transform: 'translateY(30px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '0% 50%' },
          '100%': { backgroundPosition: '200% 50%' },
        },
      },
      boxShadow: {
        'glow-accent': '0 0 20px rgba(0, 217, 255, 0.4)',
        'glow-subtle': '0 0 10px rgba(0, 217, 255, 0.2)',
        'glow-purple': '0 0 20px rgba(168, 85, 247, 0.4)',
        'card': '0 8px 32px rgba(0,0,0,0.3)',
        'card-hover': '0 20px 60px rgba(0,0,0,0.4)',
      },
      backgroundSize: {
        'size-200': '200% 200%',
      },
    },
  },
  plugins: [],
}
