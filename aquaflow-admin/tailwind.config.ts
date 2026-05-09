import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0077B6',    // main CTAs, active navigation
        secondary: '#00B4D8',  // secondary buttons, highlights
        accent: '#90E0EF',     // badges, tags, chips
        success: '#2D9B5A',    // delivered status
        warning: '#F4A261',    // pending status, low stock
        error: '#E63946',      // failed delivery, overdue
        background: '#F8FAFC', // page background
        'card-bg': '#FFFFFF',  // cards, panels
        'text-primary': '#1A202C',
        'text-secondary': '#718096',
        border: '#E2E8F0',
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        'card': '12px',
        'btn': '8px',
        'input': '6px',
      },
      boxShadow: {
        'card': '0 2px 8px rgba(0,0,0,0.08)',
      },
      width: {
        'sidebar': '240px',
        'sidebar-collapsed': '64px',
      },
      height: {
        'topbar': '64px',
      },
      screens: {
        'xs': '480px',
      },
      spacing: {
        'content': '24px',
      }
    },
  },
  plugins: [
    function({ addBase, addComponents, addUtilities }: any) {
      addBase({
        'body': {
          '@apply bg-slate-50 text-slate-900': {},
        },
        '::-webkit-scrollbar-track': {
          '@apply bg-transparent': {},
        },
        '::-webkit-scrollbar-thumb': {
          '@apply bg-slate-300 rounded-full hover:bg-slate-400 transition-colors': {},
        },
      });
      addComponents({
        '.ant-layout': {
          '@apply bg-transparent': {},
        },
        '.ant-menu': {
          '@apply bg-transparent border-none': {},
        },
        '.ant-menu-item': {
          '@apply rounded-lg transition-all duration-200': {},
        },
        '.ant-menu-item-selected': {
          '@apply bg-blue-600 !important': {},
        },
        '.glass-card': {
          '@apply shadow-sm rounded-xl': {},
          'background': 'rgba(255, 255, 255, 0.7)',
          'backdrop-filter': 'blur(10px)',
          'border': '1px solid rgba(255, 255, 255, 0.3)',
        },
      });
    },
  ],
}

export default config;
