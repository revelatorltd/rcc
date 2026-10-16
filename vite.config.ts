import { createReadStream, existsSync, readdirSync, readFileSync } from "node:fs";
import { extname, join, normalize } from "node:path";
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";

/**
 * Where the app is served from: the root locally, and on GitHub Pages the repository's path —
 * `main` at it, an initiative at `initiative/<name>/` under it. The workflow names it.
 */
const BASE = process.env.APP_BASE ?? "/";

/** The design system's file assets, where the installed package keeps them. */
const SYSTEM_ASSETS = "node_modules/@revelator/pro-ui/dist/assets";

/** The app's own public files, addressed from the root in its sources — none, where it has none. */
const PUBLIC = existsSync("public") ? readdirSync("public") : [];

/**
 * The system's FILE assets, served where the package says they are.
 *
 * Most of what the system ships — a store's mark, a format mark — is inlined into the bundle as a
 * data URI. The flags are not: there are two hundred and fifty of them and inlining the set would
 * put every country in the world into a bundle that draws three. So they are emitted as files,
 * and a file's URL in a library build is absolute from the SITE root — `/assets/albania.svg`.
 * The package cannot know where it will be mounted, so the app says: served from the package in
 * development, copied beside the build, and every root address — the system's and the app's
 * own public files — moved under the base the build is served at.
 */
const systemAssets = (): Plugin => ({
  name: "system-assets",
  configureServer(server) {
    server.middlewares.use("/assets", (request, response, next) => {
      const name = normalize(decodeURIComponent((request.url ?? "").split("?")[0] ?? ""));
      if (name.includes("..") || extname(name) !== ".svg") return next();
      response.setHeader("Content-Type", "image/svg+xml");
      createReadStream(join(SYSTEM_ASSETS, name)).on("error", next).pipe(response);
    });
  },
  transform(code, id) {
    if (BASE === "/" || !/\.(js|ts|tsx)$/.test(id.split("?")[0] ?? "")) return null;
    const roots = new RegExp(`(["'\`])/(assets/[\\w-]+\\.svg${PUBLIC.map((one) => `|${one}`).join("")})`, "g");
    return roots.test(code) ? code.replace(roots, `$1${BASE}$2`) : null;
  },
  generateBundle() {
    for (const name of readdirSync(SYSTEM_ASSETS))
      if (extname(name) === ".svg")
        this.emitFile({
          type: "asset",
          fileName: `assets/${name}`,
          source: readFileSync(join(SYSTEM_ASSETS, name)),
        });
  },
});

// The design system is an installed package, pre-bundled as any dependency is: `npm run ds:update`
// changes the lockfile, and a changed lockfile is what makes Vite bundle it again.
export default defineConfig({
  base: BASE,
  plugins: [react(), systemAssets()],
  server: { port: 5180 },
});
