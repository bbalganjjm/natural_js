import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import { employeeMock } from "./m4/mock-server.js";

export default defineConfig({
  root: fileURLToPath(new URL(".", import.meta.url)),
  plugins: [employeeMock()],
  server: {
    host: "127.0.0.1",
    port: 4173,
    strictPort: true
  }
});
