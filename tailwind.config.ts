import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: '#000000',
          secondary: '#080808',
          subtle: '#101010',
        },
        surface: {
          DEFAULT: '#121212',
          hover: '#1B1B1B',
          elevated: '#161616',
          card: '#0D0D0D',
        },
        border: {
          DEFAULT: 'rgba(255, 255, 255, 0.12)',
          subtle: 'rgba(255, 255, 255, 0.06)',
          strong: 'rgba(255, 255, 255, 0.28)',
        },
        text: {
          primary: '#FFFFFF',
          secondary: '#A3A3A3',
          muted: '#737373',
          dim: '#484848',
        },
        accent: {
          DEFAULT: '#FFFFFF',
          hover: '#E5E5E5',
          muted: 'rgba(255, 255, 255, 0.1)',
          glow: 'rgba(255, 255, 255, 0.2)',
          contrast: '#000000',
        },
        glyph: {
          red: '#EF4444',
          white: '#FFFFFF',
          dim: '#2A2A2A',
        },
        success: '#FFFFFF',
        warning: '#D4D4D8',
        danger: '#EF4444',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Space Mono"', 'monospace'],
        ndot: ['"Space Mono"', 'monospace'],
      },
      borderRadius: {
        xl: '14px',
        '2xl': '20px',
        '3xl': '28px',
        '4xl': '36px',
        full: '9999px',
      },
      animation: {
        'fade-in': 'fadeIn 0.25s ease-out forwards',
        'slide-up': 'slideUp 0.3s ease-out forwards',
        'pulse-subtle': 'pulseSubtle 2.2s infinite ease-in-out',
        blink: 'blink 1.2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.45' },
        },
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
