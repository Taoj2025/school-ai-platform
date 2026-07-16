import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Primary Brand Colors (深青色系)
        brand: {
          DEFAULT: 'var(--brand)',
          strong: 'var(--brand-strong)',
          light: 'var(--brand-light)',
          text: 'var(--brand-text)',
        },
        // Custom colors matching design system
        bg: 'var(--bg)',
        panel: 'var(--panel)',
        'panel-soft': 'var(--panel-soft)',
        text: 'var(--text)',
        muted: 'var(--muted)',
        border: 'var(--border)',
        accent: 'var(--accent)',
        // Status colors
        warning: 'var(--warning)',
        danger: 'var(--danger)',
        good: 'var(--good)',
        info: 'var(--info)',
        // Sidebar
        sidebar: {
          bg: 'var(--sidebar-bg)',
          text: 'var(--sidebar-text)',
          muted: 'var(--sidebar-muted)',
          item: 'var(--sidebar-item)',
        },
        // Primary replacement
        primary: {
          50: '#d9ebe7',
          100: '#b3d7cf',
          200: '#8dc3b7',
          300: '#67af9f',
          400: '#419b87',
          500: '#23675f',
          600: '#174f49',
          700: '#123a36',
          800: '#0c2624',
          900: '#071312',
        },
      },
      fontFamily: {
        sans: ['Microsoft JhengHei', 'Microsoft YaHei', 'Arial', 'system-ui', 'sans-serif'],
        mono: ['var(--font-roboto-mono)', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '8px',
      },
      boxShadow: {
        panel: 'var(--shadow)',
        'panel-sm': 'var(--shadow-sm)',
      },
    },
  },
  plugins: [],
};

export default config;
