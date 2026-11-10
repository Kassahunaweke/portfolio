// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  // Old addresses keep working after the November 2026 reorganisation.
  redirects: {
    '/publications': '/cv#publications',
    '/software': '/data-software',
  },
});
