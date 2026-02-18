import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        pitch: {
          dark: '#1a3a0f',
          DEFAULT: '#2d5016',
          light: '#3d6b1f',
        },
        correct: '#22c55e',
        incorrect: '#ef4444',
      },
      backgroundImage: {
        'pitch-gradient': 'linear-gradient(to bottom, #2d5016, #3d6b1f)',
      },
    },
  },
  plugins: [],
};
export default config;
