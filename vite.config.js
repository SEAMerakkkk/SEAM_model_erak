import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Replace 'SEAM_model_erak' with your repository name
  base: "/SEAM_model_erak/",
  server: {
    port: 3000, // Optional: Define the local development server port
  },
  build: {
    outDir: "dist", // Default output directory
    sourcemap: true, // Optional: Generate source maps for debugging
  },
  resolve: {
    alias: {
      // Optional: Add aliases for commonly used paths
      "@": "/src",
    },
  },
});
