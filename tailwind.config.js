/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sidebar: '#1a1f36',
        'sidebar-hover': '#252b45',
        accent: '#7c3aed',
        'accent-hover': '#6d28d9',
        success: '#10b981',
        'success-hover': '#059669',
      },
    },
  },
  plugins: [],
}
