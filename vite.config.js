import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import fg from "fast-glob";
import path from "path";
import { fileURLToPath } from "url";
import { promises as fs } from "fs";
import fsSync from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const fsSyncReaddir = (p) => fsSync.readdirSync(p);
const fsSyncStat = (p) => fsSync.statSync(p);

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
                .replace(/^[\\/]/, "");
            entries[name] = fullPath;
        }
    }
    return entries;
}

function getJsEntries(dir, entries = {}) {
    const files = fsSyncReaddir(dir);
    for (const file of files) {
        const fullPath = path.resolve(dir, file);
        const stat = fsSyncStat(fullPath);
        if (stat.isDirectory()) {
            getJsEntries(fullPath, entries);
        } else if (file.endsWith(".js")) {
            const name = fullPath
                .replace(path.resolve(__dirname), "")
                .replace(/^[\\/]/, "")
                .replace(/\.js$/, '');
            entries[name] = fullPath;
        }
    }
    return entries;
}

function copyJsonMirrorSrc() {
    let resolved;
    return {
        name: "copy-files-mirror-src",
        apply: "build",
        configResolved(config) {
            resolved = config;
        },
        async writeBundle() {
            const root = resolved.root;
            const outDir = path.resolve(root, resolved.build.outDir);

            // Copy JSON files
            const jsonFiles = await fg("src/**/*.json", { cwd: root, dot: false });
            await Promise.all(
                jsonFiles.map(async (rel) => {
                    const from = path.resolve(root, rel);
                    const to = path.resolve(outDir, rel);
                    await fs.mkdir(path.dirname(to), { recursive: true });
                    await fs.copyFile(from, to);
                })
            );

            // Copy PHP files
            const phpFiles = await fg("src/**/*.php", { cwd: root, dot: false });
            await Promise.all(
                phpFiles.map(async (rel) => {
                    const from = path.resolve(root, rel);
                    const to = path.resolve(outDir, rel);
                    await fs.mkdir(path.dirname(to), { recursive: true });
                    await fs.copyFile(from, to);
                })
            );

            // Copy SQL files
            const sqlFiles = await fg("src/**/*.sql", { cwd: root, dot: false });
            await Promise.all(
                sqlFiles.map(async (rel) => {
                    const from = path.resolve(root, rel);
                    const to = path.resolve(outDir, rel);
                    await fs.mkdir(path.dirname(to), { recursive: true });
                    await fs.copyFile(from, to);
                })
            );

            // Copy HTML files from src
            const htmlFiles = await fg("src/**/*.html", { cwd: root, dot: false });
            await Promise.all(
                htmlFiles.map(async (rel) => {
                    const from = path.resolve(root, rel);
                    const to = path.resolve(outDir, rel);
                    await fs.mkdir(path.dirname(to), { recursive: true });
                    await fs.copyFile(from, to);
                })
            );

            // Copy CSS files from src (original source files, not processed)
            const cssFiles = await fg("src/**/*.css", { cwd: root, dot: false });
            await Promise.all(
                cssFiles.map(async (rel) => {
                    const from = path.resolve(root, rel);
                    const to = path.resolve(outDir, rel);
                    await fs.mkdir(path.dirname(to), { recursive: true });
                    await fs.copyFile(from, to);
                })
            );

            // Copy root level files including .env
            const rootFiles = ['DbSchema.sql', 'LICENSE', 'README.md', 'index.html', '.env'];
            await Promise.all(
                rootFiles.map(async (file) => {
                    const from = path.resolve(root, file);
                    const to = path.resolve(outDir, file);
                    try {
                        await fs.copyFile(from, to);
                    } catch (e) {
                        // File might not exist, skip
                    }
                })
            );

            // Move the processed styles.css from dist root to dist/src/common (overwriting the copied source)
            const stylesSource = path.resolve(outDir, 'styles.css');
            const stylesDest = path.resolve(outDir, 'src', 'common', 'styles.css');
            try {
                await fs.copyFile(stylesSource, stylesDest);
                await fs.unlink(stylesSource);
            } catch (e) {
                // Styles file might not exist or already moved
            }
        },
    };
}

export default defineConfig({
    plugins: [tailwindcss(), copyJsonMirrorSrc()],
    build: {
        outDir: "dist",
        assetsDir: "",
        target: "esnext",
        minify: false,
        rollupOptions: {
            input: {
                main: path.resolve(__dirname, "index.html"),
                ...getHtmlEntries(path.resolve(__dirname, "src")),
                ...getJsEntries(path.resolve(__dirname, "src")),
            },
            preserveEntrySignatures: "strict",
            output: {
                manualChunks: undefined,
                entryFileNames: (chunkInfo) => {
                    const id = chunkInfo.facadeModuleId;
                    if (!id || id.startsWith('\0')) {
                        return chunkInfo.name + ".js";
                    }
                    const rel = path.relative(__dirname, id);
                    return rel.replace(/^[\\/]/, "");
                },
                chunkFileNames: (chunkInfo) => {
                    const id = chunkInfo.facadeModuleId;
                    if (!id || id.startsWith('\0')) {
                        return "chunks/" + chunkInfo.name + ".js";
                    }
                    const rel = path.relative(__dirname, id);
                    return rel.replace(/^[\\/]/, "");
                },
                assetFileNames: (assetInfo) => {
                    const original = assetInfo.originalFileName || assetInfo.name;
                    if (!original || original.startsWith('\0')) {
                        return "assets/" + assetInfo.name;
                    }
                    return original.replace(/^\//, "");
                }
            }
        },
        esbuild: {
            minify: false,
        },
    },
});
