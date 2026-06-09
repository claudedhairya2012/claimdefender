import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        midnight: {
          bg: '#0B0F19',
          surface: '#1E293B',
          surfaceHover: '#334155',
          border: '#475569',
          text: '#F8FAFC',
          textMuted: '#94A3B8',
          emerald: '#10B981',
          emeraldHover: '#059669',
          blue: '#3B82F6',
          blueHover: '#2563EB',
          success: '#22C55E',
          warning: '#F59E0B',
          error: '#EF4444',
        }
      },
      backgroundImage: {
        'midnight-gradient': 'linear-gradient(135deg, #0B0F19 0%, #1E293B 100%)',
        'emerald-gradient': 'linear-gradient(135deg, #10B981 0%, #3B82F6 100%)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'slide-up': 'slideUp 0.3s ease-out',
        'fade-in': 'fadeIn 0.5s ease-out',
        'pulse-emerald': 'pulse-emerald 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'pulse-emerald': {
          '0%, 100%': {
            opacity: '1',
            boxShadow: '0 0 0 0 rgba(16, 185, 129, 0.7)',
          },
          '50%': {
            opacity: '0.8',
            boxShadow: '0 0 0 10px rgba(16, 185, 129, 0)',
          },
        }
      }
    },
  },
  plugins: [],
}

export default config
