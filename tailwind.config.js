export default {content: [
  './index.html',
  './src/**/*.{js,ts,jsx,tsx}'
],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#07111F',
          800: '#0B1829',
          700: '#101F33',
          600: '#16293F',
        },
        electric: {
          DEFAULT: '#00AEEF',
          soft: '#5FD2F7',
        },
        tech: {
          DEFAULT: '#59C414',
          soft: '#8FE04F',
        },
        silver: {
          DEFAULT: '#C7D2DC',
          dark: '#8A99A8',
        },
      },
      fontFamily: {
        display: ['Sora', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 40px -10px rgba(0,174,239,0.55)',
        'glow-green': '0 0 40px -10px rgba(89,196,20,0.55)',
      },
      backgroundImage: {
        'silver-sheen':
          'linear-gradient(120deg, #FFFFFF 0%, #C7D2DC 40%, #8A99A8 60%, #FFFFFF 100%)',
      },
    },
  },
  plugins: [],
}