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
        rally: {
          black: '#08080A',
          white: '#FFFFFF',
          offwhite: '#F8F9FB',
          blue: '#2563EB',
          'blue-dark': '#1D4ED8',
          'blue-light': '#EFF4FF',
          'blue-glow': 'rgba(37, 99, 235, 0.12)',
          text: '#111118',
          'text-sec': '#52525E',
          'text-muted': '#8E8E9A',
          border: '#E4E4EA',
        },
      },
      fontFamily: {
        serif: ['Instrument Serif', 'serif'],
        sans: ['Satoshi', 'sans-serif'],
      },
      borderRadius: {
        card: '16px',
        button: '100px',
        input: '14px',
      },
    },
  },
  plugins: [],
};

export default config;
