// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import fs from "node:fs";
import path from "node:path";

const polyfillJsxDevPlugin = () => ({
  name: "polyfill-jsx-dev",
  transform(code: string, id: string) {
    if (id.includes("react-jsx-dev-runtime")) {
      return {
        code: code.replace(
          "exports.jsxDEV = void 0;",
          "var jsxRuntime = require('react/jsx-runtime'); exports.jsxDEV = jsxRuntime.jsx || jsxRuntime.jsxs;",
        ),
        map: null,
      };
    }
  },
});

export default defineConfig({
  vite: {
    plugins: [polyfillJsxDevPlugin()],
  },
  tanstackStart: {
    prerender: {
      failOnError: false,
    },
    spa: {
      enabled: true,
      prerender: {
        failOnError: false,
      },
    },
  },
  nitro: {
    hooks: {
      compiled() {
        const shellHtmlPath = path.resolve("dist/client/_shell.html");
        const indexHtmlPath = path.resolve("dist/client/index.html");
        if (fs.existsSync(shellHtmlPath) && !fs.existsSync(indexHtmlPath)) {
          fs.copyFileSync(shellHtmlPath, indexHtmlPath);
        }

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
