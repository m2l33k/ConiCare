// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Mother's Theme (Medical/Clean)
        medical: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          500: '#0ea5e9', // Sky Blue
          600: '#0284c7',
          900: '#0c4a6e',
        },
        // Child's Theme (Cartoonish/Vibrant)
        cartoon: {
          bg: '#a855f7', // Purple
          primary: '#facc15', // Yellow
          secondary: '#ef4444', // Red
          success: '#22c55e', // Green
        }
      },
      fontFamily: {
        regular: ['Inter-Regular'],
        bold: ['Inter-Bold'],
        child: ['Comic-Sans-Bold'], // Placeholder for a fun font
        arabic: ['Cairo-Regular'],
        arabicBold: ['Cairo-Bold'],
      }
    },
  },
  plugins: [],
}
