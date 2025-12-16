/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Clinical Theme (Admin, Specialist, Mother)
        medical: {
          50: '#F0FDFA',
          100: '#CCFBF1',
          500: '#14B8A6',
          600: '#0D9488',
          700: '#0F766E', // Primary Clinical
          800: '#115E59',
          900: '#134E4A',
        },
        slate: {
          50: '#F8FAFC', // Clinical Background
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B', // Clinical Secondary
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
        },
        // Play Theme (Child Mode)
        play: {
          success: '#86EFAC', // Soft Green
          magic: '#C084FC',   // Soft Purple
          reward: '#FDE047',  // Sunny Yellow
          bg: '#E0F2FE',      // Sky Blue Background
          sky: '#7DD3FC',     // Darker Sky for borders
          text: '#0369A1',    // Readable blue text
        },
      },
      fontFamily: {
        // Clinical Fonts
        sans: ['var(--font-inter)', 'var(--font-cairo)', 'sans-serif'],
        // Play Fonts
        rounded: ['var(--font-fredoka)', 'var(--font-tajawal)', 'sans-serif'],
      },
      borderRadius: {
        '3xl': '1.5rem', // For Play buttons
      },
      boxShadow: {
        'play': '0 10px 15px -3px rgba(3, 105, 161, 0.2), 0 4px 6px -2px rgba(3, 105, 161, 0.1)', // Fun shadow
        'play-hover': '0 20px 25px -5px rgba(3, 105, 161, 0.2), 0 10px 10px -5px rgba(3, 105, 161, 0.1)',
      }
    },
  },
  plugins: [],
};
