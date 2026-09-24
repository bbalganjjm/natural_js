// SPDX-License-Identifier: Apache-2.0
import { readFile } from "node:fs/promises";
import type { IncomingMessage, ServerResponse } from "node:http";
import type { Plugin } from "vite";

type Employee = {
  id: string;
  name: string;
  email: string;
  salary: number;
  profile: { team: string; department?: string };
  a: { aa?: number; bb?: number }[];
  chosen: number | null;
};
type Change = { status: "insert" | "update" | "delete"; value: Employee };

const seed = JSON.parse(await readFile(new URL("./employees.json", import.meta.url), "utf8")) as Employee[];
const sessions = new Map<string, Employee[]>();

function respond(response: ServerResponse, status: number, body?: unknown): void {
  response.statusCode = status;
  if (body !== undefined) {
    response.setHeader("Content-Type", "application/json; charset=utf-8");
    response.end(JSON.stringify(body));
  } else {
    response.end();
  }
}

async function json(request: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  for await (const chunk of request) chunks.push(Buffer.from(chunk));
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

export function employeeMock(): Plugin {
  return {
    name: "m4-employee-mock",
    configureServer(server) {
      server.middlewares.use(async (request, response, next) => {
        const url = new URL(request.url ?? "/", "http://localhost");
        if (!url.pathname.startsWith("/api/employees/")) return next();
        if (request.method !== "POST") return respond(response, 405);
        try {
          const session = url.searchParams.get("session") ?? "default";
          const current = sessions.get(session) ?? structuredClone(seed);
          sessions.set(session, current);
          if (url.pathname === "/api/employees/search") {
            const body = await json(request) as { query?: unknown };
            const query = String(body.query ?? "").trim().toLowerCase();
            if (query === "slow") await new Promise(resolve => setTimeout(resolve, 600));
            if (query === "error") return respond(response, 503, { error: "Mock search failure" });
            if (query === "empty") return respond(response, 200, []);
            return respond(response, 200, current.filter(employee =>
              !query || employee.name.toLowerCase().includes(query) ||
              employee.email.toLowerCase().includes(query)
            ));
          }
          if (url.pathname === "/api/employees/save") {
            const changes = await json(request) as Change[];
            if (!Array.isArray(changes)) return respond(response, 400, { error: "Expected changes array" });
            const next = structuredClone(current);
            for (const change of changes) {
              const index = next.findIndex(employee => employee.id === change.value.id);
              if (change.status === "delete") {
                if (index >= 0) next.splice(index, 1);
              } else if (change.status === "update" && index >= 0) {
                next[index] = structuredClone(change.value);
              } else if (change.status === "insert" && index < 0) {
                next.push(structuredClone(change.value));
              } else {
                return respond(response, 409, { error: "Change conflicts with mock data" });
              }
            }
            sessions.set(session, next);
            return respond(response, 204);
          }
          next();
        } catch {
          respond(response, 400, { error: "Invalid mock request" });
        }
      });
    }
  };
}