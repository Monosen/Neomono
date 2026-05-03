#!/usr/bin/env node
/**
 * Extract the body of a single version section from CHANGELOG.md and print it
 * to stdout. Designed to be used in CI (release.yml) to populate GitHub release
 * bodies from the same source of truth as the in-repo changelog.
 *
 * Usage:
 *   node scripts/extract-changelog.js 0.0.9          # extract a tagged release
 *   node scripts/extract-changelog.js Unreleased     # extract the Unreleased block
 */

const fs = require('node:fs');
const path = require('node:path');

const CHANGELOG = path.join(__dirname, '..', 'CHANGELOG.md');

function fail(message) {
    console.error(`✗ ${message}`);
    process.exit(1);
}

function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function main() {
    const target = process.argv[2];
    if (!target) {
        fail('Missing version argument. Usage: extract-changelog.js <version | "Unreleased">');
    }

    if (!fs.existsSync(CHANGELOG)) {
        fail(`CHANGELOG.md not found at ${CHANGELOG}`);
    }

    const text = fs.readFileSync(CHANGELOG, 'utf8');

    // A section header looks like:  ## [0.0.9] - 2026-...   or   ## [Unreleased]
    const headerPattern = new RegExp(
        `^##\\s*\\[${escapeRegex(target)}\\][^\\n]*\\n`,
        'm'
    );

    const headerMatch = text.match(headerPattern);
    if (!headerMatch) {
        fail(`Section [${target}] not found in CHANGELOG.md`);
    }

    const startIndex = (headerMatch.index ?? 0) + headerMatch[0].length;
    const remainder = text.slice(startIndex);

    // The next "## [" header (any version) ends our section.
    const nextHeaderMatch = remainder.match(/^##\s*\[/m);
    const body = nextHeaderMatch
        ? remainder.slice(0, nextHeaderMatch.index ?? remainder.length)
        : remainder;

    process.stdout.write(body.trim() + '\n');
}

main();
