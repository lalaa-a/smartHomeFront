/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Surfaces — deep slate charcoal, never pure black
        background: '#12161C',
        surface: '#1B212B',
        'surface-raised': '#232B38',
        border: '#2C3444',

        // Text
        'text-primary': '#EDEEF0',
        'text-muted': '#8A93A3',

        // Accents — semantic, not decorative
        'accent-amber': '#E8A33D',
        'accent-cyan': '#4FD1C5',
        danger: '#E85D4B',
        warning: '#F2C94C',
        success: '#6FCF97',
      },
      borderRadius: {
        sm: '4px',
        lg: '8px',
      },
    },
  },
  plugins: [],
};
