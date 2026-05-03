#!/usr/bin/env node
/**
 * Snapshot tests for the `tokenColors` arrays in our themes.
 *
 * Why: a typo or accidental sort change in `tokenColors` silently changes the
 * coloring of real-world TS/JS/Python files. `vscode-tmgrammar-test` is great
 * for grammar tokenization but doesn't help here because we don't ship a
 * grammar — we ship a *theme* that consumes other extensions' grammars.
 *
 * What this does: serialises each theme's `tokenColors` into a deterministic
 * shape (sorted by scope, fontStyle normalised, comments stripped) and
 * compares it against a checked-in snapshot under `themes/__snapshots__/`.
 *
 * Usage:
 *   node scripts/snapshot-tokencolors.js          # check
 *   node scripts/snapshot-tokencolors.js --update # rewrite snapshots
 */

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const THEMES_DIR = path.join(ROOT, 'themes');
const SNAP_DIR = path.join(THEMES_DIR, '__snapshots__');

const update = process.argv.includes('--update');

const themes = [
    { file: 'Neomono-color-theme.json', label: 'Neomono' },
    { file: 'Neomono-Deep-color-theme.json', label: 'Neomono Deep' },
    { file: 'Neomono-HC-color-theme.json', label: 'Neomono HC' }
];

function normaliseEntry(entry) {
    const scopes = Array.isArray(entry.scope)
        ? [...entry.scope].sort()
        : (typeof entry.scope === 'string' ? [entry.scope] : []);

    const settings = entry.settings || {};
    const normalised = {
        scopes,
        foreground: settings.foreground || null,
        fontStyle: settings.fontStyle || ''
    };
    return normalised;
}

function buildSnapshot(themeJson) {
    const tokenColors = Array.isArray(themeJson.tokenColors) ? themeJson.tokenColors : [];

    const flat = [];
    for (const entry of tokenColors) {
        const norm = normaliseEntry(entry);
        for (const scope of norm.scopes) {
            flat.push({
                scope,
                foreground: norm.foreground,
                fontStyle: norm.fontStyle
            });
        }
        if (norm.scopes.length === 0) {
            // Default token rule (no scope): keep it as a single ʟʟ entry so we
            // notice if it ever changes.
            flat.push({
                scope: '<<default>>',
                foreground: norm.foreground,
                fontStyle: norm.fontStyle
            });
        }
    }

    flat.sort((a, b) => a.scope.localeCompare(b.scope));

    return {
        count: flat.length,
        entries: flat
    };
}

function readJson(filePath) {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function ensureSnapDir() {
    fs.mkdirSync(SNAP_DIR, { recursive: true });
}

function snapshotPath(label) {
    return path.join(SNAP_DIR, `${label.replace(/\s+/g, '-')}.tokencolors.snap.json`);
}

let exitCode = 0;
ensureSnapDir();

for (const theme of themes) {
    const themePath = path.join(THEMES_DIR, theme.file);
    if (!fs.existsSync(themePath)) {
        console.error(`✗ Theme file missing: ${theme.file}`);
        exitCode = 1;
        continue;
    }

    const json = readJson(themePath);
    const snapshot = buildSnapshot(json);
    const serialised = JSON.stringify(snapshot, null, 2) + '\n';

    const snapPath = snapshotPath(theme.label);

    if (update || !fs.existsSync(snapPath)) {
        fs.writeFileSync(snapPath, serialised, 'utf8');
        console.log(`✓ ${theme.label}: snapshot ${update ? 'updated' : 'created'} (${snapshot.count} scope entries)`);
        continue;
    }

    const existing = fs.readFileSync(snapPath, 'utf8');
    if (existing === serialised) {
        console.log(`✓ ${theme.label}: snapshot matches (${snapshot.count} scope entries)`);
    } else {
        const prevCount = (() => {
            try { return JSON.parse(existing).count; } catch { return '?'; }
        })();
        console.error(`✗ ${theme.label}: snapshot drift (was ${prevCount}, now ${snapshot.count})`);
        console.error(`  Run: pnpm run snapshot:tokencolors:update`);
        exitCode = 1;
    }
}

process.exit(exitCode);
