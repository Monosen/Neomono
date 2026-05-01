#!/usr/bin/env node
/**
 * Validate that i18n bundles have the same keys across all locales.
 */

const fs = require('node:fs');
const path = require('node:path');

const L10N_DIR = path.join(__dirname, '..', 'l10n');

function fail(message) {
    console.error(`✗ ${message}`);
    process.exitCode = 1;
}

function ok(message) {
    console.log(`✓ ${message}`);
}

function getBundleFiles() {
    if (!fs.existsSync(L10N_DIR)) {
        fail(`l10n directory not found at ${L10N_DIR}`);
        return [];
    }

    return fs.readdirSync(L10N_DIR)
        .filter(f => f.startsWith('bundle.l10n') && f.endsWith('.json'))
        .map(f => ({
            name: f,
            path: path.join(L10N_DIR, f)
        }));
}

function loadBundle(filePath) {
    try {
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (error) {
        fail(`Invalid JSON in ${path.basename(filePath)}: ${error.message}`);
        return null;
    }
}

function main() {
    const bundles = getBundleFiles();

    if (bundles.length < 2) {
        ok(`Only ${bundles.length} locale file(s) found, nothing to compare`);
        return;
    }

    const loaded = bundles.map(b => ({
        ...b,
        data: loadBundle(b.path)
    })).filter(b => b.data !== null);

    if (loaded.length < 2) {
        return;
    }

    const base = loaded[0];
    const baseKeys = Object.keys(base.data).sort();

    let allMatch = true;

    for (let i = 1; i < loaded.length; i++) {
        const other = loaded[i];
        const otherKeys = Object.keys(other.data).sort();

        const missingInOther = baseKeys.filter(k => !otherKeys.includes(k));
        const missingInBase = otherKeys.filter(k => !baseKeys.includes(k));

        if (missingInOther.length > 0) {
            fail(`Keys in ${base.name} but missing in ${other.name}: ${missingInOther.join(', ')}`);
            allMatch = false;
        }

        if (missingInBase.length > 0) {
            fail(`Keys in ${other.name} but missing in ${base.name}: ${missingInBase.join(', ')}`);
            allMatch = false;
        }
    }

    if (allMatch) {
        ok(`All ${loaded.length} locale bundles have synchronized keys (${baseKeys.length} keys)`);
    }
}

main();
