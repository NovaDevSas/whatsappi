module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        gray: {
          200: '#e5e7eb',
          // Add other gray shades if needed
        },
      },
      borderRadius: {
        'xl': '0.75rem',
      }
    },
  },
  plugins: [],
}