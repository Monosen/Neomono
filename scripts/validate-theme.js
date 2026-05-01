#!/usr/bin/env node
/**
 * Validate all Neomono color themes:
 *  - Every JSON file parses.
 *  - Every value in `colors` is a valid hex color (#RGB, #RRGGBB, #RRGGBBAA).
 *  - Every token color foreground is a valid hex color.
 *  - There are no duplicate keys in `colors`.
 */

const fs = require('node:fs');
const path = require('node:path');

const THEMES_DIR = path.join(__dirname, '..', 'themes');
const HEX_RE = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;

function fail(message) {
    console.error(`✗ ${message}`);
    process.exitCode = 1;
}

function ok(message) {
    console.log(`✓ ${message}`);
}

function findDuplicateKeys(jsonText) {
    const duplicates = [];
    const keyRe = /"([^"\\]|\\.)*"\s*:/g;
    const seenByDepth = [new Set()];
    let depth = 0;
    for (let i = 0; i < jsonText.length; i++) {
        const ch = jsonText[i];
        if (ch === '{') {
            depth++;
            seenByDepth[depth] = new Set();
        } else if (ch === '}') {
            seenByDepth[depth] = undefined;
            depth--;
        } else if (ch === '"') {
            keyRe.lastIndex = i;
            const match = keyRe.exec(jsonText);
            if (match && match.index === i) {
                const rawKey = match[0].slice(1, match[0].lastIndexOf('"'));
                const seen = seenByDepth[depth];
                if (seen) {
                    if (seen.has(rawKey)) {
                        duplicates.push(rawKey);
                    } else {
                        seen.add(rawKey);
                    }
                }
                i = match.index + match[0].length - 1;
            }
        } else if (ch === '\\') {
            i++;
        }
    }
    return duplicates;
}

function validateTheme(themePath) {
    const themeName = path.basename(themePath);
    console.log(`\nValidating ${themeName}...`);

    if (!fs.existsSync(themePath)) {
        fail(`Theme file not found at ${themePath}`);
        return;
    }

    const raw = fs.readFileSync(themePath, 'utf8');

    let theme;
    try {
        theme = JSON.parse(raw);
    } catch (error) {
        fail(`Theme JSON is invalid: ${error.message}`);
        return;
    }
    ok('Theme JSON parses');

    const duplicates = findDuplicateKeys(raw);
    if (duplicates.length > 0) {
        fail(`Duplicate keys found: ${[...new Set(duplicates)].join(', ')}`);
    } else {
        ok('No duplicate keys');
    }

    if (!theme.colors || typeof theme.colors !== 'object') {
        fail('Missing `colors` object');
    } else {
        let invalid = 0;
        for (const [key, value] of Object.entries(theme.colors)) {
            if (typeof value !== 'string' || !HEX_RE.test(value)) {
                fail(`Invalid color for "${key}": ${JSON.stringify(value)}`);
                invalid++;
            }
        }
        if (invalid === 0) {
            ok(`All ${Object.keys(theme.colors).length} workbench colors are valid hex`);
        }
    }

    if (Array.isArray(theme.tokenColors)) {
        let invalid = 0;
        for (const [index, token] of theme.tokenColors.entries()) {
            const fg = token?.settings?.foreground;
            if (fg !== undefined && (typeof fg !== 'string' || !HEX_RE.test(fg))) {
                fail(`Invalid tokenColors[${index}].settings.foreground: ${JSON.stringify(fg)}`);
                invalid++;
            }
        }
        if (invalid === 0) {
            ok(`All ${theme.tokenColors.length} tokenColors entries have valid foregrounds`);
        }
    }
}

function main() {
    if (!fs.existsSync(THEMES_DIR)) {
        fail(`Themes directory not found at ${THEMES_DIR}`);
        return;
    }

    const themeFiles = fs.readdirSync(THEMES_DIR)
        .filter(f => f.endsWith('-color-theme.json'))
        .map(f => path.join(THEMES_DIR, f));

    if (themeFiles.length === 0) {
        fail(`No theme files found in ${THEMES_DIR}`);
        return;
    }

    console.log(`Found ${themeFiles.length} theme(s) to validate`);

    for (const themePath of themeFiles) {
        validateTheme(themePath);
    }

    if (process.exitCode && process.exitCode !== 0) {
        console.error('\nTheme validation failed.');
    } else {
        console.log('\nAll theme validations passed.');
    }
}

main();
