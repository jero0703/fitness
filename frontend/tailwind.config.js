/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#F8FAFC",
        sidebar: "#111827",
        primary: {
          DEFAULT: "#22C55E",
          hover: "#16A34A",
          light: "#DCFCE7",
          dark: "#15803D"
        },
        secondary: {
          DEFAULT: "#14B8A6",
          hover: "#0D9488",
          light: "#CCFBF1",
          dark: "#0F766E"
        },
        card: "#FFFFFF",
        textMain: "#1F2937",
        textMuted: "#64748B",
        borderSubtle: "#E2E8F0"
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
