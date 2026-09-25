import type { Config } from "tailwindcss";
const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: { extend: { colors: { mint: "#55C98A", mintSoft: "#F0FBF5", forest: "#166534", charcoal: "#1F2937", emeraldDeep: "#059669" }, boxShadow: { premium: "0 20px 60px rgba(15, 23, 42, 0.08)" } } },
  plugins: []
};
export default config;
