/**
 * The design system the app is built from, taken in as a versioned archive.
 *
 * The app builds on GitHub, where the design system's repository is not beside it, so it
 * carries the package it was built against: `vendor/` holds one archive, named for the package's
 * version and the design system's commit, and `package.json` depends on that file. This builds the
 * design system checked out beside the app, packs it, puts the archive in place of the last one
 * and installs it — run whenever the app should take the design system as it is now.
 */
import { execFileSync } from "node:child_process";
import { readdirSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

const app = resolve(import.meta.dirname, "..");
const system = resolve(app, "../ui-components");
const vendor = join(app, "vendor");
const run = (command, args, cwd) => execFileSync(command, args, { cwd, stdio: "inherit" });

run("npm", ["run", "build"], system);
const commit = execFileSync("git", ["rev-parse", "--short", "HEAD"], { cwd: system }).toString().trim();
const { version } = JSON.parse(readFileSync(join(system, "package.json"), "utf8"));

for (const old of readdirSync(vendor)) rmSync(join(vendor, old));
run("npm", ["pack", "--pack-destination", vendor], system);
const packed = readdirSync(vendor).find((one) => one.endsWith(".tgz"));
const named = `revelator-pro-ui-${version}-${commit}.tgz`;
renameSync(join(vendor, packed), join(vendor, named));

const manifest = JSON.parse(readFileSync(join(app, "package.json"), "utf8"));
manifest.dependencies["@revelator/pro-ui"] = `file:vendor/${named}`;
writeFileSync(join(app, "package.json"), `${JSON.stringify(manifest, null, 2)}\n`);

// The archive is named for the commit, so one rebuilt at the SAME commit keeps its name — and npm,
// trusting the lock's integrity, would reinstall the copy it already had. The package is forgotten
// first, so what is installed is always the archive just packed.
const lock = JSON.parse(readFileSync(join(app, "package-lock.json"), "utf8"));
delete lock.packages?.["node_modules/@revelator/pro-ui"]?.integrity;
writeFileSync(join(app, "package-lock.json"), `${JSON.stringify(lock, null, 2)}\n`);
rmSync(join(app, "node_modules/@revelator/pro-ui"), { recursive: true, force: true });
rmSync(join(app, "node_modules/.vite"), { recursive: true, force: true });
run("npm", ["install"], app);
console.log(`The app is built against the design system at ${commit} (${version}).`);
