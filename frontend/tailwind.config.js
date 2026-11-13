/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          main: "#080808",
          secondary: "#111111",
          card: "#171717",
          cardHover: "#1f1f1f"
        },
        cyber: {
          orange: "#FF8A00",
          orangeLight: "#FFB347",
          green: "#00C784",
          red: "#FF4545",
          yellow: "#FFC247",
          purple: "#A855F7"
        }
      },
      fontFamily: {
        mono: ["JetBrains Mono", "Courier New", "monospace"],
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"]
      },
      boxShadow: {
        'glow-orange': '0 0 15px rgba(255, 138, 0, 0.3)',
        'glow-green': '0 0 15px rgba(0, 199, 132, 0.3)',
        'glow-red': '0 0 15px rgba(255, 69, 69, 0.3)'
      }
    },
  },
  plugins: [],
}

