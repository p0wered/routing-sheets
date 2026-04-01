import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': {
        // Согласовано с профилем по умолчанию `dotnet run` (http в launchSettings.json → порт 5145).
        // Для HTTPS: `dotnet run --launch-profile https` и target `https://localhost:7050` + secure: false.
        target: 'http://localhost:5145',
        changeOrigin: true,
      },
    },
  },
})
