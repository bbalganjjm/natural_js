// SPDX-License-Identifier: Apache-2.0
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import type { Plugin } from "vite";
import { employeeMock } from "./m4/mock-server.js";

function employeeFragment(): Plugin {
  return {
    name: "m4-employee-fragment",
    configureServer(server) {
      server.middlewares.use(async (request, response, next) => {
        if (request.url?.split("?")[0] !== "/m4/side-fragment.html") return next();
        try {
          const html = await readFile(new URL("./m4/side.html", import.meta.url), "utf8");
          const marker = "<template data-screen>";
          const start = html.indexOf(marker);
          const end = html.indexOf("</template>", start + marker.length);
          if (start < 0 || end < 0) {
            response.statusCode = 500;
            response.end("Employee screen template is missing.");
            return;
          }
          response.setHeader("Content-Type", "text/html; charset=utf-8");
          response.end(html.slice(start + marker.length, end).trim());
        } catch (cause) {
          next(cause);
        }
      });
    }
  };
}

export default defineConfig({
  root: fileURLToPath(new URL(".", import.meta.url)),
  plugins: [employeeFragment(), employeeMock()],
  server: {
    host: "127.0.0.1",
    port: 4173,
    strictPort: true
  }
});