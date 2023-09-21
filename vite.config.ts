import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  root: path.join(__dirname, 'src'),
  base: '/screen-recording-demo/',
  server: {
    port: 5555,
  },
  build: {
    outDir: path.join(__dirname, 'dist'),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        app: path.resolve(__dirname, 'src', '/index.html'),
        appMinimal: path.resolve(__dirname, 'src', '/minimal//index.html'),
      },
    },
  },
});
