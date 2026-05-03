#!/usr/bin/env node
/**
 * Build the extension with esbuild.
 *
 * - Bundles src/extension.ts and its TypeScript dependencies into a single
 *   out/extension.js (CommonJS, Node target, externalises `vscode`).
 * - Copies src/templates/** to out/templates/** afterwards (the runtime
 *   template is loaded with fs.readFileSync, not bundled).
 * - Production build is minified and has no source map; --watch and --dev
 *   produce sourcemap'd, non-minified output.
 *
 * Usage:
 *   node scripts/build.js                 # production build
 *   node scripts/build.js --dev           # dev build (sourcemap, no minify)
 *   node scripts/build.js --watch         # dev build that rebuilds on change
 */

const esbuild = require('esbuild');
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'out');
const watch = process.argv.includes('--watch');
const dev = watch || process.argv.includes('--dev');

/** @type {import('esbuild').BuildOptions} */
const options = {
    entryPoints: [path.join(ROOT, 'src', 'extension.ts')],
    bundle: true,
    outfile: path.join(ROOT, 'out', 'extension.js'),
    platform: 'node',
    target: 'node18',
    format: 'cjs',
    sourcemap: dev,
    minify: !dev,
    treeShaking: true,
    // VS Code provides `vscode` at runtime; never try to bundle it.
    external: ['vscode'],
    logLevel: 'info'
};

function copyTemplates() {
    const result = spawnSync(
        process.execPath,
        [path.join(__dirname, 'copy-templates.js')],
        { stdio: 'inherit' }
    );
    if (result.status !== 0) {
        process.exit(result.status ?? 1);
    }
}

async function main() {
    if (watch) {
        const ctx = await esbuild.context({
            ...options,
            plugins: [{
                name: 'copy-templates-and-log',
                setup(build) {
                    build.onEnd((result) => {
                        if (result.errors.length === 0) {
                            copyTemplates();
                        }
                    });
                }
            }]
        });
        await ctx.watch();
        console.log('[build] esbuild watching for changes — Ctrl+C to stop.');
        // Keep the process alive
        return;
    }

    // Production builds start from a clean out/ so we never ship stale files
    // (e.g. .js modules left behind by a previous `tsc`-based `compile`).
    fs.rmSync(OUT, { recursive: true, force: true });
    await esbuild.build(options);
    copyTemplates();
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
