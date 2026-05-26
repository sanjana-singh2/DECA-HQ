/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        'deca-blue': {
          50: '#eff6ff', 100: '#dbeafe', 200: '#bfdbfe', 300: '#93c5fd',
          400: '#60a5fa', 500: '#3b82f6', 600: '#1a56db', 700: '#1d4ed8',
          800: '#1e40af', 900: '#1e3a8a', 950: '#172554',
        },
        cream: {
          50:  '#FDFAF5',
          100: '#F5F0E8',
          200: '#EDE8DF',
          300: '#E0D9CE',
          400: '#CEC5B8',
        },
        lav: {
          50:  '#F0EFF9',
          100: '#E3E2F5',
          200: '#C9C7EB',
          300: '#ADA9DF',
          400: '#908BD4',
          500: '#756FC9',
          600: '#6260B8',
          700: '#4F4D99',
          800: '#3C3B7A',
          900: '#2A295C',
        },
        'deca-dark': {
          100: '#1e1e2e', 200: '#181825', 300: '#11111b',
        },
      },
      fontFamily: {
        serif:            ['DMSerifDisplay_400Regular'],
        'serif-italic':   ['DMSerifDisplay_400Regular_Italic'],
        inter:            ['Inter_400Regular'],
        'inter-medium':   ['Inter_500Medium'],
        'inter-semibold': ['Inter_600SemiBold'],
        'inter-bold':     ['Inter_700Bold'],
      },
    },
  },
  plugins: [],
};
