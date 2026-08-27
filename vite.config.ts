// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import fs from "node:fs";
import path from "node:path";

export default defineConfig({
  esbuild: {
    jsx: "automatic",
    jsxDev: false,
  },
  react: {
    jsxDev: false,
  },
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
    prerender: {
      enabled: true,
    },
    spa: {
      enabled: true,
      prerender: {
        outputPath: "/index.html",
      },
    },
  },
  nitro: {
    hooks: {
      compiled() {
        const serverJsPath = path.resolve("dist/server/server.js");
        const code = `import server from './index.mjs';

export default {
  async fetch(request, env = {}, context = { waitUntil() {} }) {
    const store = new Map();
    const proxyReq = new Proxy(request, {
      get(target, prop) {
        if (store.has(prop)) return store.get(prop);
        const val = Reflect.get(target, prop);
        return typeof val === 'function' ? val.bind(target) : val;
      },
      set(target, prop, value) {
        store.set(prop, value);
        return true;
      },
      getOwnPropertyDescriptor(target, prop) {
        if (store.has(prop)) {
          return { value: store.get(prop), writable: true, enumerable: true, configurable: true };
        }
        let curr = target;
        while (curr) {
          const desc = Object.getOwnPropertyDescriptor(curr, prop);
          if (desc) {
            if (desc.get || desc.set) {
              return { value: store.get(prop), writable: true, enumerable: true, configurable: true };
            }
            return desc;
          }
          curr = Object.getPrototypeOf(curr);
        }
        return undefined;
      },
      has(target, prop) {
        return store.has(prop) || Reflect.has(target, prop);
      }
    });
    return server.fetch(proxyReq, env || {}, context || { waitUntil() {} });
  }
};
`;
        fs.writeFileSync(serverJsPath, code);
      },
    },
    output: {
      dir: "dist",
      serverDir: "dist/server",
      publicDir: "dist/client",
    },
  },
});
