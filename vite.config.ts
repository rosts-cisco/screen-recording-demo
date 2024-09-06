import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
  plugins: [react()],

  root: path.join(__dirname, 'src'),
  base: '/screen-recording-demo/',
  publicDir: path.join(__dirname, 'public'),
  build: {
    outDir: path.join(__dirname, 'dist'),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        app: path.resolve(__dirname, 'src', '/index.html'),
        'app-minimal': path.resolve(__dirname, 'src', '/minimal/index.html'),
        'app-message': path.resolve(__dirname, 'src', '/message/index.html'),
      },
    },
  },

  server: {
    port: 5555,
  },
});
