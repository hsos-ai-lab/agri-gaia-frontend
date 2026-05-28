import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        port: 80,
        host: true,
        allowedHosts: ['.agri-gaia.dev'],
    },
    // Guard against the dev-server optimizeDeps regression (seen on vite 8.0.14)
    // that splits the Emotion/MUI graph across chunks and throws
    // "init_emotion_react_..._esm is not defined" at runtime. Pre-bundle the
    // graph as one unit and dedupe so only one copy of each is bundled.
    resolve: {
        dedupe: ['@emotion/react', '@emotion/styled', 'react', 'react-dom'],
    },
    optimizeDeps: {
        include: ['@emotion/react', '@emotion/styled', '@mui/material'],
    },
});
