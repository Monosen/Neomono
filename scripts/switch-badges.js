#!/usr/bin/env node
/**
 * Swap README badges between VS Code Marketplace and Open VSX variants.
 *
 * Usage:
 *   node scripts/switch-badges.js vscode
 *   node scripts/switch-badges.js ovsx
 *
 * The badges block must be delimited by `<!-- BADGES_START -->` and
 * `<!-- BADGES_END -->` in each target README file.
 */

const fs = require('node:fs');
const path = require('node:path');

const TARGETS = ['vscode', 'ovsx', 'both'];
const target = process.argv[2];

if (!TARGETS.includes(target)) {
    console.error(`Please specify a target. One of: ${TARGETS.join(', ')}`);
    process.exit(1);
}

const badges = {
    vscode: `
  <p>
    <a href="https://marketplace.visualstudio.com/items?itemName=Monosen.neomono">
      <img src="https://img.shields.io/visual-studio-marketplace/v/Monosen.neomono?style=for-the-badge&color=C792EA&logo=visual-studio-code" alt="Version" />
    </a>
    <a href="https://marketplace.visualstudio.com/items?itemName=Monosen.neomono">
      <img src="https://img.shields.io/visual-studio-marketplace/d/Monosen.neomono?style=for-the-badge&color=89DDFF&logo=visual-studio-code" alt="Downloads" />
    </a>
    <a href="https://marketplace.visualstudio.com/items?itemName=Monosen.neomono">
      <img src="https://img.shields.io/visual-studio-marketplace/r/Monosen.neomono?style=for-the-badge&color=C3E88D&logo=visual-studio-code" alt="Rating" />
    </a>
    <a href="https://github.com/Monosen/Neomono/blob/master/LICENSE">
      <img src="https://img.shields.io/github/license/Monosen/Neomono?style=for-the-badge&color=f07178&logo=github" alt="License" />
    </a>
  </p>`,
    ovsx: `
  <p>
    <a href="https://open-vsx.org/extension/Monosen/neomono">
      <img src="https://img.shields.io/open-vsx/v/Monosen/neomono?style=for-the-badge&color=C792EA&logo=open-vsx" alt="Version" />
    </a>
    <a href="https://open-vsx.org/extension/Monosen/neomono">
      <img src="https://img.shields.io/open-vsx/dt/Monosen/neomono?style=for-the-badge&color=89DDFF&logo=open-vsx" alt="Downloads" />
    </a>
    <a href="https://github.com/Monosen/Neomono">
      <img src="https://img.shields.io/github/stars/Monosen/Neomono?style=for-the-badge&color=C3E88D&logo=github" alt="Stars" />
    </a>
    <a href="https://github.com/Monosen/Neomono/blob/master/LICENSE">
      <img src="https://img.shields.io/github/license/Monosen/Neomono?style=for-the-badge&color=f07178&logo=github" alt="License" />
    </a>
  </p>`,
    both: `
  <p>
    <a href="https://marketplace.visualstudio.com/items?itemName=Monosen.neomono">
      <img src="https://img.shields.io/visual-studio-marketplace/v/Monosen.neomono?style=for-the-badge&color=C792EA&logo=visual-studio-code&label=VS%20Code" alt="VS Code Marketplace Version" />
    </a>
    <a href="https://open-vsx.org/extension/Monosen/neomono">
      <img src="https://img.shields.io/open-vsx/v/Monosen/neomono?style=for-the-badge&color=C792EA&logo=eclipseide&label=Open%20VSX" alt="Open VSX Version" />
    </a>
    <a href="https://marketplace.visualstudio.com/items?itemName=Monosen.neomono">
      <img src="https://img.shields.io/visual-studio-marketplace/d/Monosen.neomono?style=for-the-badge&color=89DDFF&logo=visual-studio-code" alt="Downloads" />
    </a>
    <a href="https://marketplace.visualstudio.com/items?itemName=Monosen.neomono">
      <img src="https://img.shields.io/visual-studio-marketplace/r/Monosen.neomono?style=for-the-badge&color=C3E88D&logo=visual-studio-code" alt="Rating" />
    </a>
    <a href="https://github.com/Monosen/Neomono/blob/master/LICENSE">
      <img src="https://img.shields.io/github/license/Monosen/Neomono?style=for-the-badge&color=f07178&logo=github" alt="License" />
    </a>
  </p>`
};

const files = [
    path.join(__dirname, '..', 'README.md'),
    path.join(__dirname, '..', 'README.es.md')
];

const markerRe = /<!-- BADGES_START -->[\s\S]*?<!-- BADGES_END -->/;

let changed = 0;
let skipped = 0;
let errors = 0;

for (const file of files) {
    const name = path.basename(file);
    if (!fs.existsSync(file)) {
        console.warn(`- ${name}: file not found`);
        errors++;
        continue;
    }

    const original = fs.readFileSync(file, 'utf8');
    if (!markerRe.test(original)) {
        console.warn(`- ${name}: markers not found`);
        errors++;
        continue;
    }

    const updated = original.replace(
        markerRe,
        `<!-- BADGES_START -->${badges[target]}\n  <!-- BADGES_END -->`
    );

    if (updated === original) {
        console.log(`= ${name}: already up to date (${target})`);
        skipped++;
        continue;
    }

    fs.writeFileSync(file, updated, 'utf8');
    console.log(`✓ ${name}: updated badges to ${target}`);
    changed++;
}

console.log(`\nDone. ${changed} changed, ${skipped} unchanged, ${errors} errors.`);
process.exitCode = errors > 0 ? 1 : 0;
