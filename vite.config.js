/* Vite is a Development Server & Bundler. It helps in using node packages in JS files
   and produces optimized code for production. */

import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import fg from "fast-glob";
import path from "path";
import { fileURLToPath } from "url";
import { promises as fs } from "fs";

// ESM-safe __dirname
const __dirname = path.dirname(fileURLToPath(import.meta.url));

function getHtmlEntries(dir, entries = {}) {
    const files = fsSyncReaddir(dir);
    for (const file of files) {
        const fullPath = path.resolve(dir, file);
        const stat = fsSyncStat(fullPath);
        if (stat.isDirectory()) {
            getHtmlEntries(fullPath, entries);
        } else if (file.endsWith(".html")) {
            const name = fullPath
                .replace(path.resolve(__dirname), "")
                .replace(/^[\\/]/, ""); // handle win + posix
            entries[name] = fullPath;
        }
    }
    return entries;
}

// Small sync helpers (keep your original logic but safe in ESM)
import fsSync from "fs";
const fsSyncReaddir = (p) => fsSync.readdirSync(p);
const fsSyncStat = (p) => fsSync.statSync(p);

function copyJsonMirrorSrc() {
    let resolved;
    return {
        name: "copy-json-mirror-src",
        apply: "build",
        configResolved(config) {
            resolved = config; // get root & outDir
        },
        async writeBundle() {
            const root = resolved.root; // typically process.cwd()
            const outDir = path.resolve(root, resolved.build.outDir);
            // find all json files under src
            const files = await fg("src/**/*.json", { cwd: root, dot: false });
            await Promise.all(
                files.map(async (rel) => {
                    const from = path.resolve(root, rel); // .../src/.../file.json
                    const to = path.resolve(outDir, rel); // .../dist/src/.../file.json
                    await fs.mkdir(path.dirname(to), { recursive: true });
                    await fs.copyFile(from, to);
                })
            );
        },
    };
}

export default defineConfig({
    plugins: [
        tailwindcss(),
        copyJsonMirrorSrc(),
    ],
    build: {
        rollupOptions: {
            input: {
                main: path.resolve(__dirname, "index.html"),
                ...getHtmlEntries(path.resolve(__dirname, "src")),
            },
        },
    },
});
