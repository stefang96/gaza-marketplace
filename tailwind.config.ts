import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/features/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        page: "var(--page)",
        surface: "var(--surface)",
        "surface-2": "var(--surface-2)",
        line: "var(--line)",
        "line-2": "var(--line-2)",
        ink: "var(--ink)",
        "ink-soft": "var(--ink-soft)",
        muted: "var(--muted)",
        accent: "var(--accent)",
        "accent-strong": "var(--accent-strong)",
        "accent-soft": "var(--accent-soft)",
        green: "var(--green)",
        "green-soft": "var(--green-soft)",
        coral: "var(--coral)",
        amber: "var(--amber)",
        blue: "var(--blue)",
      },
      fontFamily: {
        display: ["var(--font-display)", "ui-sans-serif", "system-ui", "sans-serif"],
        sans: ["var(--font-body)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "var(--radius)",
        card: "var(--radius)",
        lg: "20px",
        xl: "24px",
      },
      boxShadow: {
        soft: "0 1px 2px rgba(26,28,37,0.04), 0 8px 24px rgba(26,28,37,0.06)",
        "soft-lg": "0 2px 4px rgba(26,28,37,0.05), 0 16px 40px rgba(26,28,37,0.08)",
        focus: "0 0 0 3px var(--accent-soft)",
      },
    },
  },
  plugins: [],
};

export default config;
