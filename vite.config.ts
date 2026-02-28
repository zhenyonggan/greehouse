import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from "vite-tsconfig-paths";
import { traeBadgePlugin } from 'vite-plugin-trae-solo-badge';

// https://vite.dev/config/
export default defineConfig({
  build: {
    sourcemap: 'hidden',
  },
  server: {
    proxy: {
      '/api/qweather': {
        target: 'https://api.qweather.com/v7',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/qweather/, '')
      },
      '/api/geo': {
        target: 'https://geoapi.qweather.com/v2',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/geo/, '')
      },
      '/api/aikenong': {
        target: 'https://znapi.aikenong.com.cn',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/aikenong/, ''),
        secure: false // Allow self-signed certs if needed, though aikenong has valid cert
      }
    }
  },
  plugins: [
    react({
      babel: {
        plugins: [
          'react-dev-locator',
        ],
      },
    }),
    traeBadgePlugin({
      variant: 'dark',
      position: 'bottom-right',
      prodOnly: true,
      clickable: true,
      clickUrl: 'https://www.trae.ai/solo?showJoin=1',
      autoTheme: true,
      autoThemeTarget: '#root'
    }), 
    tsconfigPaths()
  ],
})
