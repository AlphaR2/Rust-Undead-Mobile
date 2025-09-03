/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary_yellow: "#F6BE00",
        primary_black: "#101012",
        primary_white: "#EFE8E8"
      },
    },
  },
  plugins: [],
};
