#!/usr/bin/env node
/**
 * Copy src/templates/** to out/templates/** so the runtime template files
 * are available next to the compiled JS modules. Cross-platform replacement
 * for `cp -R src/templates out/`.
 */

const fs = require('node:fs');
const path = require('node:path');

const SRC = path.join(__dirname, '..', 'src', 'templates');
const DST = path.join(__dirname, '..', 'out', 'templates');

function copyRecursive(src, dst) {
    const stat = fs.statSync(src);
    if (stat.isDirectory()) {
        fs.mkdirSync(dst, { recursive: true });
        for (const entry of fs.readdirSync(src)) {
            copyRecursive(path.join(src, entry), path.join(dst, entry));
        }
    } else {
        fs.mkdirSync(path.dirname(dst), { recursive: true });
        fs.copyFileSync(src, dst);
    }
}

function main() {
    if (!fs.existsSync(SRC)) {
        console.error(`✗ Templates source directory not found: ${SRC}`);
        process.exit(1);
    }

    fs.rmSync(DST, { recursive: true, force: true });
    copyRecursive(SRC, DST);

    const fileCount = fs.readdirSync(DST).length;
    console.log(`✓ Copied ${fileCount} template file(s) to ${path.relative(process.cwd(), DST)}`);
}

main();
