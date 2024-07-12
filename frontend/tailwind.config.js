/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/components/**/*.jsx","./src/pages/**/*.jsx", "./src/*.{html,jsx}", "./index.html"],
  theme: {
    fontFamily: {
      poppins: ["Poppins", "sans-serif"],
      rowdies: ["Rowdies", "sans-serif"],
    },
    extend: {},
  },
  plugins: [],
}

