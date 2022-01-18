export default /** @type {import('astro').AstroUserConfig} */ ({
    // all options are optional; these values are the defaults
    projectRoot: './',
    public: './public/',
    dist: './dist/',
    src: './src/',
    renderers: [
      '@astrojs/renderer-svelte'
    ],
    vite: {
      server: {
        hmr: {
          host: '24678-rose-deer-7ksxq7g7.ws-eu27.gitpod.io',
          clientPort: 443
        }
      }
    },
  });