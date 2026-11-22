/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "#F8FAFC",
        "surface-card": "#FFFFFF",
        "border-subtle": "#E2E8F0",
        primary: {
          DEFAULT: "#004ac6",
          container: "#2563eb",
          hover: "#1d4ed8"
        },
        status: {
          critical: "#EF4444",
          warning: "#F59E0B",
          success: "#10B981",
          info: "#3B82F6"
        }
      },
      fontFamily: {
        headline: ["Plus Jakarta Sans", "sans-serif"],
        body: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"]
      }
    },
  },
  plugins: [],
}
