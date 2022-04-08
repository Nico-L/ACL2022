export default /** @type {import('astro').AstroUserConfig} */ ({
    // all options are optional; these values are the defaults
    projectRoot: './',
    public: './public/',
    dist: './dist/',
    src: './src/',
    buildOptions: {
      site: 'https://acl-sappey.netlify.app/',
    },
    renderers: [
      '@astrojs/renderer-svelte'
    ], vite: {
      server: {
        // configure vite for HMR with Gitpod
        hmr: process.env.GITPOD_WORKSPACE_URL
          ? {
              // removes the protocol and replaces it with the port we're connecting to
              host: process.env.GITPOD_WORKSPACE_URL.replace('https://', '3001-'),
              protocol: 'wss',
              clientPort: 443
            }
          : true
      }
    },
 /*   vite: {
      server: {
        host: true,
        hmr: {
          host: '24678-rose-deer-7ksxq7g7.ws-eu34.gitpod.io',
          clientPort: 443
        }
      }
    }, */
  });