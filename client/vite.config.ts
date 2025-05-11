import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import envPrefix from 'vite-plugin-environment';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  envPrefix: "APP_",
  
})
