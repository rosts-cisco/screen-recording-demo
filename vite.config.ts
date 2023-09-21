import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

export default defineConfig({
  plugins: [react()],
  base: '/screen-recording-demo/',
  server: {
    port: 5555,
  },
});
