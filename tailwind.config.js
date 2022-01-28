// tailwind.config.cjs
module.exports = {
  content: [
    './public/**/*.html',
    './src/**/*.{astro,js,jsx,svelte,ts,tsx,vue}',
  ],
  theme: {
    extend: {
      borderWidth: {
        '6': '6px',
        '10': '10px',
      },
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
      "bleuClair": "#5DB7C5",
      "rougeClair": "#AB2728",
      "jauneClair": "#f8c311",
      "vertClair": "#87c618",
      rouge: {
        100: "#FFA6A7",
        200: "#FF8D8E",
        300: "#F87475",
        400: "#DE5A5B",
        500: "#C54142",
        600: "#AB2728",
        700: "#920E0F",
        800: "#780000",
        900: "#5F0000"
      },
      bleu: {
        100: "#C3FFFF",
        200: "#AAFFFF",
        300: "#90EAF8",
        400: "#77D1DF",
        500: "#5DB7C5",
        600: "#449EAC",
        700: "#2A8492",
        800: "#116B79",
        900: "#00515F"
      },
      vert: {
        100: "#E0FF9E",
        200: "#C7EC85",
        300: "#AED36C",
        400: "#94B952",
        500: "#7BA039",
        600: "#61861F",
        700: "#486D06",
        800: "#2E5300",
        900: "#153A00"
      },
      jaune: {
        100: "#FFFF77",
        200: "#FFFF5E",
        300: "#FFF644",
        400: "#FFDD2B",
        500: "#F8C311",
        600: "#DFAA00",
        700: "#C59000",
        800: "#AC7700",
        900: "#925D00"
      },
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