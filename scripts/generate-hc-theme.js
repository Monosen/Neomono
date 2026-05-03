#!/usr/bin/env node
/**
 * Generate the "Neomono HC" (high-contrast dark) theme from the base Neomono
 * theme. The transformation:
 *
 *   - Drops backgrounds to pure black (#000000) for maximum contrast.
 *   - Promotes accents to their saturated form (matches WCAG AA on black).
 *   - Lifts the default foreground to pure white (#ffffff).
 *   - Forces every contrast border to be opaque so the workbench regions are
 *     always distinguishable, which is the whole point of an HC theme.
 *
 * This is generated, not authored. Tweaks should land here, not in the JSON,
 * so re-running the script always produces the same output.
 */

const fs = require('node:fs');
const path = require('node:path');

const BASE_THEME_PATH = path.join(__dirname, '..', 'themes', 'Neomono-color-theme.json');
const HC_THEME_PATH = path.join(__dirname, '..', 'themes', 'Neomono-HC-color-theme.json');

// Keys that should always be opaque in HC mode so panels/sidebars/editor splits
// are visually separated.
const FORCE_BORDER_KEYS = new Set([
    'contrastBorder',
    'contrastActiveBorder',
    'focusBorder',
    'sideBar.border',
    'editorGroup.border',
    'editorGroupHeader.border',
    'panel.border',
    'titleBar.border',
    'statusBar.border',
    'activityBar.border',
    'tab.border',
    'tab.activeBorder',
    'menubar.selectionBorder',
    'menu.selectionBorder',
    'editorWidget.border',
    'editorSuggestWidget.border',
    'editorHoverWidget.border',
    'notifications.border',
    'notificationCenterHeader.border',
    'breadcrumb.activeSelectionBackground',
    'sideBySideEditor.horizontalBorder',
    'sideBySideEditor.verticalBorder'
]);

const HIGH_CONTRAST_BORDER = '#ffffff';

// Background overrides — reach for true black where the base used near-black.
const BG_OVERRIDES = {
    '#282a36': '#000000',
    '#1e1f29': '#000000',
    '#15161e': '#000000',
    '#21222c': '#000000',
    '#44475a': '#1f1f1f',
    '#100f2e': '#000000',
    '#0a0a18': '#000000'
};

// Foreground promotion — anything close to the base default goes to pure white.
const FG_OVERRIDES = {
    '#f8f8f2': '#ffffff',
    '#e8e8e0': '#ffffff'
};

// Accent boost — slightly brighter / more saturated to keep contrast on pure black.
const ACCENT_OVERRIDES = {
    '#bd93f9': '#d4a8ff',
    '#8be9fd': '#a8f2ff',
    '#ff79c6': '#ff9ad6',
    '#50fa7b': '#7dff9c',
    '#ff5555': '#ff7878',
    '#ffb86c': '#ffc88a',
    '#f1fa8c': '#f8ffb0',
    '#6272a4': '#a0b0cc'
};

const ALL_OVERRIDES = { ...BG_OVERRIDES, ...FG_OVERRIDES, ...ACCENT_OVERRIDES };

function transformColor(color) {
    if (typeof color !== 'string' || !color.startsWith('#')) {
        return color;
    }

    const hasAlpha = color.length === 9;
    const base = hasAlpha ? color.slice(0, 7) : color;
    const alpha = hasAlpha ? color.slice(7) : '';

    const lower = base.toLowerCase();
    if (ALL_OVERRIDES[lower]) {
        const replacement = ALL_OVERRIDES[lower];
        // Preserve alpha if present and replacement is plain hex.
        if (alpha && replacement.length === 7) {
            return replacement + alpha;
        }
        return replacement;
    }
    return color;
}

function main() {
    if (!fs.existsSync(BASE_THEME_PATH)) {
        console.error(`Base theme not found: ${BASE_THEME_PATH}`);
        process.exit(1);
    }

    const base = JSON.parse(fs.readFileSync(BASE_THEME_PATH, 'utf8'));

    const hcColors = {};
    for (const [key, value] of Object.entries(base.colors || {})) {
        hcColors[key] = transformColor(value);
    }

    // Force every border-like key to be a fully opaque white so that workbench
    // regions are always visually delimited. We do this *after* the per-color
    // transform so it always wins.
    for (const key of FORCE_BORDER_KEYS) {
        if (key in hcColors || key === 'contrastBorder' || key === 'contrastActiveBorder' || key === 'focusBorder') {
            hcColors[key] = HIGH_CONTRAST_BORDER;
        }
    }

    const hcSemantic = {};
    for (const [key, value] of Object.entries(base.semanticTokenColors || {})) {
        hcSemantic[key] = transformColor(value);
    }

    const hcTokenColors = (base.tokenColors || []).map((token) => ({
        ...token,
        settings: {
            ...token.settings,
            foreground: token.settings?.foreground ? transformColor(token.settings.foreground) : undefined
        }
    }));

    const hcTheme = {
        name: 'Neomono HC',
        type: 'hc',
        colors: hcColors,
        semanticHighlighting: base.semanticHighlighting,
        semanticTokenColors: hcSemantic,
        tokenColors: hcTokenColors
    };

    fs.writeFileSync(HC_THEME_PATH, JSON.stringify(hcTheme, null, 2) + '\n', 'utf8');

    console.log(`✓ Generated Neomono HC theme`);
    console.log(`  ${Object.keys(hcColors).length} workbench colors`);
    console.log(`  ${hcTokenColors.length} token colors`);
    console.log(`  ${Object.keys(ALL_OVERRIDES).length} colors transformed`);
    console.log(`  Saved to: ${HC_THEME_PATH}`);
}

main();
