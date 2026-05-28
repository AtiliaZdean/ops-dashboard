// vite.config.js
// vite is our frontend build tool - this is its configuration file

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig ({
  plugins: [
    react(),
    tailwindcss(), // enables tailwind css processing
  ],
})