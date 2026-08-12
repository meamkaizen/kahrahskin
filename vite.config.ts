import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(({command}) => {
  // Social crawlers need absolute og:image / og:url values.
  //
  // Order matters: APP_URL if set, otherwise Netlify's own read-only build
  // variables. Static hosts serve the built HTML as-is with no server to fill
  // the placeholder in later, so it has to be resolved here or previews break.
  // DEPLOY_PRIME_URL is preferred over URL so branch and preview deploys point
  // at themselves rather than production.
  // On a production deploy use the canonical site URL, so shared links point at
  // kahrahskin.netlify.app rather than main--kahrahskin.netlify.app. Branch and
  // preview deploys point at themselves.
  const netlifyUrl =
    process.env.CONTEXT === 'production'
      ? process.env.URL || process.env.DEPLOY_PRIME_URL
      : process.env.DEPLOY_PRIME_URL || process.env.URL;

  const fromEnv = process.env.APP_URL || netlifyUrl || '';
  // Trimmed: a stray space in an env var would otherwise end up inside the tag.
  const appUrl = fromEnv.trim().replace(/\/+$/, '');
  const siteUrl = appUrl || (command === 'serve' ? 'http://localhost:3000' : '');

  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'kahrah-inject-site-url',
        transformIndexHtml(html: string) {
          return siteUrl ? html.split('__SITE_URL__').join(siteUrl) : html;
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
