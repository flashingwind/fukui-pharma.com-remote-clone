import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import fs from 'fs';
import path from 'path';

// Plugin to resolve images from public directory
const resolvePublicImages = {
  name: 'resolve-public-images',
  apply: 'build',
  resolveId(id) {
    // Handle absolute paths like /access/image.jpg
    if (id.match(/^\/[a-z-]+\/.*\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
      const filePath = path.join('./public', id);
      if (fs.existsSync(filePath)) {
        return { id, external: true };
      }
      // If file doesn't exist, return external so it doesn't fail
      return { id, external: true };
    }
    return null;
  },
};

export default defineConfig({
  site: 'https://fukui-pharma.com',
  integrations: [react()],
  output: 'static',
  outDir: './dist',
  publicDir: './public',
  srcDir: './src',
  vite: {
    plugins: [resolvePublicImages],
  },
});
