import * as path from 'path';
import * as fs from 'fs';
import { ALL_GLOW_REPLACEMENTS } from './maps';

const TEMPLATE_FILENAME = 'glow-runtime.js';

/** Placeholder strings substituted at build time. Kept private so that the
 *  template file itself never needs to change. */
const PLACEHOLDER_TOKEN_MAP = '__TOKEN_REPLACEMENTS_JSON__';
const PLACEHOLDER_DISABLE_GLOW = '__DISABLE_GLOW__';

let cachedTemplate: string | undefined;

/** Reset the in-memory template cache. Test-only; never call from production. */
export function _resetTemplateCacheForTests(): void {
	cachedTemplate = undefined;
}

function loadGlowTemplate(): string {
	if (cachedTemplate !== undefined) {
		return cachedTemplate;
	}

	// At runtime the compiled module lives at out/glow/template.js, so the
	// templates copied by scripts/copy-templates.js sit one level up under
	// out/templates/.
	const templatePath = path.join(__dirname, '..', 'templates', TEMPLATE_FILENAME);
	cachedTemplate = fs.readFileSync(templatePath, 'utf-8');
	return cachedTemplate;
}

/**
 * Generate the JS that gets injected into VS Code's workbench.html.
 *
 * Reads `out/templates/glow-runtime.js` and substitutes its two build-time
 * placeholders with the token replacement map (with the user's brightness
 * already baked in as alpha) and the DISABLE_GLOW flag.
 *
 * @param disableGlow  If true, the runtime keeps original colors instead of glowing.
 * @param brightness   Glow strength in [0, 1]. Out-of-range values are clamped.
 * @returns A self-contained JS source string ready to write to disk.
 */
export function generateGlowJs(disableGlow: boolean, brightness: number): string {
	const clamped = Math.max(0, Math.min(1, brightness));
	const alphaHex = Math.floor(clamped * 255).toString(16).toUpperCase().padStart(2, '0');

	const tokenMap: Record<string, string> = {};
	for (const [color, replacement] of Object.entries(ALL_GLOW_REPLACEMENTS)) {
		tokenMap[color] = replacement.replace(/\[ALPHA\]/g, alphaHex);
	}

	const tokenMapJson = JSON.stringify(tokenMap, null, 4);
	const disableGlowLiteral = disableGlow ? 'true' : 'false';

	return loadGlowTemplate()
		.replaceAll(PLACEHOLDER_TOKEN_MAP, tokenMapJson)
		.replaceAll(PLACEHOLDER_DISABLE_GLOW, disableGlowLiteral);
}
