export default /** @type {import('astro').AstroUserConfig} */ ({
    // all options are optional; these values are the defaults
    projectRoot: './',
    public: './public/',
    dist: './dist/',
    src: './src/',
    renderers: [
      '@astrojs/renderer-svelte'
    ],
    vite: {},
  });