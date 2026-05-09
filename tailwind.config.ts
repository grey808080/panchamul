/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Industrial Orange — primary brand color
        primary: {
          DEFAULT: '#FF6B00',
          light:   '#FF7D26',
          dark:    '#E05A00',
        },
        // Secondary accent (kept for compatibility, maps to orange family)
        secondary: {
          DEFAULT: '#FF6B00',
          light:   '#FF7D26',
          dark:    '#E05A00',
        },
        // Dark industrial surfaces (hero, navbar, footer)
        surface: {
          bg:       '#0D0D0D',
          card:     '#141414',
          elevated: '#1E1E1E',
          border:   '#2A2A2A',
        },
        // Text on dark surfaces
        ink: {
          primary:   '#F5F5F5',  // white-ish — headings on dark
          secondary: '#D1D5DB',  // slate-300 — body text on dark, passes WCAG AA
          muted:     '#9CA3AF',  // slate-400 — secondary info on dark, passes WCAG AA at large sizes
        },
      },
      fontFamily: {
        sans:    ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Rajdhani', 'Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        // Industrial — tighter radius than the previous soft design
        DEFAULT: '4px',
        sm:  '2px',
        md:  '4px',
        lg:  '6px',
        xl:  '8px',
        '2xl': '10px',
        '3xl': '12px',
        full: '9999px',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-in':   'slideIn 0.3s ease-out',
        'fade-in':    'fadeIn 0.5s ease-out forwards',
        'float':      'float 6s ease-in-out infinite',
      },
      keyframes: {
        slideIn: {
          '0%':   { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        fadeIn: {
          '0%':   { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-12px)' },
        },
      },
      boxShadow: {
        'orange':    '0 4px 24px rgba(255, 107, 0, 0.25)',
        'orange-lg': '0 8px 40px rgba(255, 107, 0, 0.35)',
        'card':      '0 1px 3px rgba(0,0,0,0.4)',
        'card-hover':'0 4px 16px rgba(0,0,0,0.6)',
      },
    },
  },
  plugins: [],
}
