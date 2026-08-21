import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        cream: "#F8F6EA",
        gold: {
          DEFAULT: "#9D743A",
          light: "#C79A5D",
          dark: "#7A5A2C",
        },
        ink: {
          DEFAULT: "#352C29",
          soft: "#57493F",
        },
      },
      fontFamily: {
        display: ["var(--font-quiche)", "Georgia", "serif"],
        body: ["var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      maxWidth: {
        content: "1200px",
      },
      letterSpacing: {
        wide2: "0.08em",
      },
    },
  },
  plugins: [],
};

export default config;
