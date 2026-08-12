import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(({command}) => {
  // Social crawlers need absolute og:image / og:url values. APP_URL is used
  // when set; otherwise the placeholder survives the build and the Express
  // server fills it in per request from the incoming host.
  const appUrl = (process.env.APP_URL || '').replace(/\/+$/, '');
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
