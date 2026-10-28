/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#FFF0F5",
        primary: "#FFD700",
        secondary: "#87CEEB",
        textColor: "#333333",
      },
      borderRadius: {
        xl: "24px",
      },
      keyframes: {
        bounceSmall: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        pop: {
          "0%": { transform: "scale(0.9)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
      animation: {
        bounceSmall: "bounceSmall 2s infinite ease-in-out",
        pop: "pop 0.3s ease-out forwards",
      },
    },
  },
  plugins: [],
};
