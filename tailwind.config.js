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
    // Agrega esto en la sección extend.keyframes
    keyframes: {
      float: {
        '0%, 100%': { transform: 'translateY(0)' },
        '50%': { transform: 'translateY(-10px)' },
      }
    },
    // Y esto en la sección extend.animation
    animation: {
      float: 'float 6s ease-in-out infinite',
      pulse: 'pulse 8s cubic-bezier(0.4, 0, 0.6, 1) infinite',
    }
  },
  plugins: [],
}