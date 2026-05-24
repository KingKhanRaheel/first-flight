// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, cloudflare (build-only),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import netlify from "@netlify/vite-plugin-tanstack-start";

// Deploy target: Netlify (SSR via Netlify Functions).
// - Disable the bundled Cloudflare plugin so the build produces a Netlify-compatible output.
// - Add the official @netlify/vite-plugin-tanstack-start plugin to emit the SSR function.
// - Keep src/server.ts wired as the SSR entry so our error-handling wrapper still runs.
export default defineConfig({
  cloudflare: false,
  plugins: [netlify()],
  tanstackStart: {
    server: { entry: "server" },
  },
});
