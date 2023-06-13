import svelte from '@astrojs/svelte';
import tailwind from '@astrojs/tailwind';
import { defineConfig } from "astro/config";
import image from "@astrojs/image";

// https://astro.build/config
export default defineConfig( /** @type {import('astro').AstroUserConfig} */{
  // all options are optional; these values are the defaults
  root: './',
  publicDir: './public/',
  outDir: './dist/',
  srcDir: './src/',
  site: 'https://acl-sappey.netlify.app/',
  integrations: [svelte(), tailwind(), image()],
  vite: {
    server: {
      // configure vite for HMR with Gitpod
      hmr: process.env.GITPOD_WORKSPACE_URL ? {
        // removes the protocol and replaces it with the port we're connecting to
        host: process.env.GITPOD_WORKSPACE_URL.replace('https://', '3000-'),
        protocol: 'wss',
        clientPort: 443
      } : true
    }
  }
});