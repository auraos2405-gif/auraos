/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}', '../../packages/ui/src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'deep-space': '#090B17',
        'aura-violet': '#8B5CFF',
        'electric-blue': '#3B82F6',
        'aura-magenta': '#FF4DFF',
      },
      fontFamily: { sans: ['Inter', 'Poppins', 'sans-serif'] },
    },
  },
  plugins: [],
};

