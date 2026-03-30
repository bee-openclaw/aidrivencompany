/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        surface: {
          base: '#0a0f1a',
          1: '#1a2235',
          2: '#243049',
          rail: '#060a14',
        },
        node: {
          idea: '#a78bfa',
          icp: '#fbbf24',
          feature: '#60a5fa',
          pricing: '#34d399',
          channel: '#f472b6',
          campaign: '#fb923c',
          proof: '#22d3ee',
          metric: '#818cf8',
          risk: '#f87171',
          decision: '#a3e635',
          goal: '#c084fc',
          milestone: '#38bdf8',
          workflow: '#94a3b8',
          agent: '#2dd4bf',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'pulse-soft': 'pulseSoft 2s ease infinite',
        glow: 'glow 2s ease infinite',
        float: 'float 3s ease infinite',
        'spin-slow': 'spin 8s linear infinite',
        'gradient-shift': 'gradientShift 3s ease infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '0.5' },
          '50%': { opacity: '1' },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 8px 2px var(--glow-color, rgba(245, 158, 11, 0.3))' },
          '50%': { boxShadow: '0 0 16px 4px var(--glow-color, rgba(245, 158, 11, 0.5))' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        gradientShift: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
      },
    },
  },
  plugins: [],
};
