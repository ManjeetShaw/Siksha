// /** @type {import('tailwindcss').Config} */
// export default {
//     darkMode: 'class',
//    content: [
//     "./index.html",
//     "./src/**/*.{js,ts,jsx,tsx}",
//   ],
//   theme: {
//     extend: {
//       fontFamily: {
//         orbiton: ["orbiton", "sans-serif"],
//       },
//     },
//   },
//   plugins: [],
// }

/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
   content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        orbiton: ["orbiton", "sans-serif"],
        display: ["'Plus Jakarta Sans'", "sans-serif"],
      },
      colors: {
        brand: {
          orange: "#FF7A50",
          coral: "#FF3E68",
          cream: "#FFF6F1",
          ink: "#20160F",
          muted: "#8A7C74",
        },
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(135deg, #FF8A5B 0%, #FF3E68 100%)",
        "brand-gradient-soft": "linear-gradient(135deg, rgba(255,138,91,0.12) 0%, rgba(255,62,104,0.12) 100%)",
      },
      boxShadow: {
        soft: "0 4px 24px -4px rgba(32,22,15,0.06)",
        card: "0 2px 12px -2px rgba(32,22,15,0.05)",
      },
    },
  },
  plugins: [],
}


