/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#f8f9ff",
        surface: "#f8f9ff",
        "surface-dim": "#cbdbf5",
        "surface-bright": "#f8f9ff",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#eff4ff",
        "surface-container": "#e5eeff",
        "surface-container-high": "#dce9ff",
        "surface-container-highest": "#d3e4fe",
        "on-surface": "#0b1c30",
        "on-surface-variant": "#434655",
        "inverse-surface": "#213145",
        "inverse-on-surface": "#eaf1ff",
        outline: "#737686",
        "outline-variant": "#c3c6d7",
        "surface-tint": "#0053db",
        primary: {
          DEFAULT: "#004ac6",
          container: "#2563eb",
          hover: "#1d4ed8"
        },
        "on-primary": "#ffffff",
        "primary-container": "#2563eb",
        "on-primary-container": "#eeefff",
        "inverse-primary": "#b4c5ff",
        secondary: {
          DEFAULT: "#4b41e1",
          container: "#645efb"
        },
        "on-secondary": "#ffffff",
        "secondary-container": "#645efb",
        "on-secondary-container": "#fffbff",
        tertiary: {
          DEFAULT: "#006242",
          container: "#007d55"
        },
        "on-tertiary": "#ffffff",
        "tertiary-container": "#007d55",
        "on-tertiary-container": "#bdffdb",
        error: {
          DEFAULT: "#ba1a1a",
          container: "#ffdad6"
        },
        "on-error": "#ffffff",
        "error-container": "#ffdad6",
        "on-error-container": "#93000a",
        canvas: "#F8FAFC",
        "surface-card": "#FFFFFF",
        "border-subtle": "#E2E8F0",
        status: {
          critical: "#EF4444",
          warning: "#F59E0B",
          success: "#10B981",
          info: "#2563EB"
        },
        "status-critical": "#EF4444",
        "status-warning": "#F59E0B",
      },
      fontFamily: {
        headline: ["Plus Jakarta Sans", "sans-serif"],
        "headline-xl": ["Plus Jakarta Sans", "sans-serif"],
        "headline-lg": ["Plus Jakarta Sans", "sans-serif"],
        "headline-md": ["Plus Jakarta Sans", "sans-serif"],
        body: ["Inter", "sans-serif"],
        "body-lg": ["Inter", "sans-serif"],
        "body-md": ["Inter", "sans-serif"],
        "body-sm": ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
        "label-lg": ["JetBrains Mono", "monospace"],
        "label-md": ["JetBrains Mono", "monospace"],
        "label-sm": ["JetBrains Mono", "monospace"],
      },
      spacing: {
        gutter: "1rem",
        "gutter-lg": "1.5rem",
        margin: "1rem",
        "margin-lg": "2rem",
        "space-xs": "0.25rem",
        "space-sm": "0.5rem",
        "space-md": "0.75rem",
        "space-lg": "1rem",
        "space-xl": "1.5rem",
      }
    },
  },
  plugins: [],
}
