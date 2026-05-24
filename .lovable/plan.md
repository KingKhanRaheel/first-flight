
## Why publishing to Netlify fails today

The project is a **TanStack Start SSR app** currently configured for **Cloudflare Workers** (via `wrangler.jsonc` + `@cloudflare/vite-plugin`). Running `npm run build` produces a Worker bundle in `.output/` / `dist/<worker>/`, **not** a static `index.html`. Netlify's current `netlify.toml` expects a static site in `dist/` with `index.html`, which is why it fails with "no index.html file".

We need to switch the build to a Netlify-compatible SSR target so Netlify gets:
- A static `dist/` (or `dist/client`) with built assets + a fallback HTML
- A Netlify **Function** (or Edge Function) that handles SSR for all routes

## Plan

### 1. Switch build target to Netlify
- Remove the Cloudflare Worker pieces from the build path:
  - Drop `wrangler.jsonc` from being the deploy target (keep file but not used for Netlify).
  - In `vite.config.ts`, configure `@lovable.dev/vite-tanstack-config` to use the **Netlify** TanStack Start target instead of the default Cloudflare one. TanStack Start ships a Netlify preset that emits `netlify/functions/server.mjs` + a `dist/` of static assets.
- Add `@netlify/functions` (types) as a devDependency if needed.

### 2. Rewrite `netlify.toml`
Replace with config that points to the SSR function and serves static assets first:

```toml
[build]
  publish = "dist/client"
  command = "npm run build"

[build.environment]
  NODE_VERSION = "20.19.0"

[functions]
  directory = "dist/server"
  node_bundler = "esbuild"

# All non-static requests go to the SSR handler
[[redirects]]
  from = "/*"
  to = "/.netlify/functions/server"
  status = 200
```

(Exact `publish` and `functions` paths will match whatever the TanStack Netlify preset emits — verified during implementation.)

### 3. Keep the existing SSR error wrapper working
- The current `src/server.ts` is a Cloudflare Worker `fetch` export. Netlify functions use a different signature. Either:
  - Use TanStack Start's Netlify preset directly (it already wires SSR + error handling), and leave `src/server.ts` unused for Netlify; OR
  - Adapt `src/server.ts` into a Netlify handler that wraps the SSR entry the same way.
- Default: rely on the preset to keep things simple.

### 4. Environment variables on Netlify
Document that the user must add these in **Netlify → Site settings → Environment variables** (mirroring `.env`):
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_SUPABASE_PROJECT_ID`
- `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (server runtime)
- `LOVABLE_API_KEY` (for the Lovable AI Gateway used by the recommendations server fn)

Without these, the deployed site will build but server functions will crash at runtime.

### 5. Verify
- Run `npm run build` locally in the sandbox after changes; confirm `dist/client/` contains assets and a Netlify function is emitted.
- Push to Netlify and confirm the homepage renders and `/dashboard` loads after sign-in.

## Open question / heads-up

Lovable's **native publishing** (one-click Publish button) already handles SSR for this stack without any of the above — it's the supported path. Netlify works, but you'll be responsible for setting all env vars and re-deploying on changes. If Netlify isn't a hard requirement, native publish is significantly less work. Confirm you want to proceed with Netlify and I'll execute the plan above.
