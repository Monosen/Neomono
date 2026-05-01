#!/usr/bin/env node
/**
 * Generate Neomono Deep theme from Neomono base theme.
 * Applies a "deep" transformation to background and accent colors.
 */

const fs = require('node:fs');
const path = require('node:path');

const BASE_THEME_PATH = path.join(__dirname, '..', 'themes', 'Neomono-color-theme.json');
const DEEP_THEME_PATH = path.join(__dirname, '..', 'themes', 'Neomono-Deep-color-theme.json');

// Color mapping: original -> deep variant
const COLOR_MAP = {
    // Backgrounds (darker, more saturated)
    '#282a36': '#1a1c29',
    '#1e1f29': '#12131c',
    '#15161e': '#0c0d14',
    '#44475a': '#2d3044',
    '#21222c': '#151620',

    // Foregrounds (slightly dimmed for less eye strain)
    '#f8f8f2': '#e8e8e0',

    // Comment/muted (deeper)
    '#6272a4': '#4a5678',

    // Accents (more saturated, deeper)
    '#bd93f9': '#a576e0',
    '#8be9fd': '#6dd0e8',
    '#ff79c6': '#e85aa8',
    '#50fa7b': '#3dd660',
    '#ff5555': '#e04040',
    '#ffb86c': '#e89e50',
    '#f1fa8c': '#d8e070',

    // Accent variants (hover states, etc.)
    '#a3f0ff': '#85d6e8',
    '#ff92d0': '#d870a8',
    '#9580e6': '#7a65c8',
    '#ff6e6e': '#d05050',
    '#69ff94': '#50d878',
    '#ffffa5': '#d8d880',
    '#d6acff': '#b890e0',
    '#ff92df': '#d870b0',
    '#a4ffff': '#85d8e8',

    // Tab active (adjust alpha)
    '#bd93f960': '#a576e060',
};

function transformColor(color) {
    // Handle colors with alpha channel (8 chars) or 3/4 chars shorthand
    if (color.startsWith('#')) {
        // Direct match
        if (COLOR_MAP[color]) {
            return COLOR_MAP[color];
        }

        // Try matching the base color part (without alpha)
        const baseColor = color.length === 9 ? color.slice(0, 7) : color;
        const alpha = color.length === 9 ? color.slice(7) : '';

        if (COLOR_MAP[baseColor]) {
            const transformed = COLOR_MAP[baseColor];
            // If original had alpha and transformed doesn't, append it
            if (alpha && transformed.length === 7) {
                return transformed + alpha;
            }
            return transformed;
        }
    }
    return color;
}

function transformValue(value) {
    if (typeof value === 'string') {
        return transformColor(value);
    }
    return value;
}

function main() {
    if (!fs.existsSync(BASE_THEME_PATH)) {
        console.error(`Base theme not found: ${BASE_THEME_PATH}`);
        process.exit(1);
    }

    const baseTheme = JSON.parse(fs.readFileSync(BASE_THEME_PATH, 'utf8'));

    // Transform colors object
    const deepColors = {};
    for (const [key, value] of Object.entries(baseTheme.colors || {})) {
        deepColors[key] = transformValue(value);
    }

    // Transform semanticTokenColors
    const deepSemantic = {};
    for (const [key, value] of Object.entries(baseTheme.semanticTokenColors || {})) {
        deepSemantic[key] = transformValue(value);
    }

    // Transform tokenColors
    const deepTokenColors = (baseTheme.tokenColors || []).map((token) => ({
        ...token,
        settings: {
            ...token.settings,
            foreground: token.settings?.foreground ? transformValue(token.settings.foreground) : undefined
        }
    }));

    const deepTheme = {
        name: 'Neomono Deep',
        colors: deepColors,
        semanticHighlighting: baseTheme.semanticHighlighting,
        semanticTokenColors: deepSemantic,
        tokenColors: deepTokenColors
    };

    fs.writeFileSync(DEEP_THEME_PATH, JSON.stringify(deepTheme, null, 2) + '\n', 'utf8');

    const originalColors = Object.keys(baseTheme.colors || {}).length;
    const transformedColors = Object.keys(COLOR_MAP).length;
    console.log(`✓ Generated Neomono Deep theme`);
    console.log(`  ${originalColors} workbench colors`);
    console.log(`  ${baseTheme.tokenColors?.length || 0} token colors`);
    console.log(`  ${transformedColors} colors transformed`);
    console.log(`  Saved to: ${DEEP_THEME_PATH}`);
}

main();
