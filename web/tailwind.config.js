/** @type {import('tailwindcss').Config} */
module.exports = {
  // Isso é o pulo do gato: muda de 'media' (sistema) para 'class' (manual)
  darkMode: 'class', 
  
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./app.vue",
    "./error.vue",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}