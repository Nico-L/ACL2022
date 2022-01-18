// tailwind.config.cjs
module.exports = {
  content: [
    './public/**/*.html',
    './src/**/*.{astro,js,jsx,svelte,ts,tsx,vue}',
  ],
  theme: {
    extend: {
      minWidth: {
        '200px': '200px',
        '32': '8rem'
      },
      maxWidth:  {
        '200px': '200px',
        '1024px': '1024px'
      },
      spacing: {
        "200px": "200px",
      }
    },
    colors: {
      "bleuClair": "#5db7c5",
      gray: {
        100: "#f7fafc",
        200: "#edf2f7",
        300: "#e2e8f0",
        400: "#cbd5e0",
        500: "#a0aec0",
        600: "#718096",
        700: "#4a5568",
        800: "#2d3748",
        900: "#1a202c"
      }
    }
  },
  variants: {
    cursor: ["hover", "focus", "disabled"],
    backgroundColor: ["hover", "focus", "disabled"],
    display: ["responsive", "disabled"],
    maxWidth: ["responsive"]
  },
};