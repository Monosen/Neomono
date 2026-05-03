/**
 * Token color → glow CSS replacement maps.
 *
 * VS Code generates a `<style class="vscode-tokens-styles">` tag with rules
 * like `.mtk1 { color: #bd93f9; }`. The runtime injected by the patcher
 * intercepts that CSS and replaces every `color: <hex>;` declaration listed
 * here with the matching glow-enhanced declaration (a `text-shadow` halo
 * on top of the original color).
 *
 * `[ALPHA]` is a placeholder that the build step replaces with a 2-digit hex
 * opacity derived from the user's brightness setting (0.0 → `00`, 1.0 → `FF`).
 */

export interface GlowMap {
	[hexColor: string]: string;
}

/** Glow replacements for the standard "Neomono" theme. */
export const NEOMONO_GLOW_MAP: GlowMap = {
	// Neon accent colors
	'#bd93f9': 'color: #bd93f9; text-shadow: 0 0 2px #bd93f9[ALPHA], 0 0 10px #6231a7[ALPHA];',
	'#8be9fd': 'color: #8be9fd; text-shadow: 0 0 2px #100f2e[ALPHA], 0 0 8px #8be9fd[ALPHA];',
	'#ff79c6': 'color: #ff79c6; text-shadow: 0 0 2px #100f2e[ALPHA], 0 0 10px #ff79c6[ALPHA];',
	'#50fa7b': 'color: #50fa7b; text-shadow: 0 0 2px #100f2e[ALPHA], 0 0 10px #25a243[ALPHA];',
	'#ff5555': 'color: #ff5555; text-shadow: 0 0 2px #100f2e[ALPHA], 0 0 10px #ff5555[ALPHA];',
	'#f1fa8c': 'color: #f1fa8c; text-shadow: 0 0 2px #100f2e[ALPHA], 0 0 10px #f1fa8c[ALPHA];',
	'#ffb86c': 'color: #ffb86c; text-shadow: 0 0 2px #100f2e[ALPHA], 0 0 10px #ffb86c[ALPHA];',
	// Default foreground — subtle halo so plain text doesn't look flat
	'#f8f8f2': 'color: #f8f8f2; text-shadow: 0 0 2px #f8f8f2[ALPHA];',
};

/** Glow replacements for the "Neomono Deep" theme. */
export const NEOMONO_DEEP_GLOW_MAP: GlowMap = {
	// Neon accent colors
	'#a576e0': 'color: #a576e0; text-shadow: 0 0 2px #a576e0[ALPHA], 0 0 10px #5a2d8f[ALPHA];',
	'#6dd0e8': 'color: #6dd0e8; text-shadow: 0 0 2px #0a1920[ALPHA], 0 0 8px #6dd0e8[ALPHA];',
	'#e85aa8': 'color: #e85aa8; text-shadow: 0 0 2px #0a1920[ALPHA], 0 0 10px #e85aa8[ALPHA];',
	'#3dd660': 'color: #3dd660; text-shadow: 0 0 2px #0a1920[ALPHA], 0 0 10px #1a8030[ALPHA];',
	'#e04040': 'color: #e04040; text-shadow: 0 0 2px #0a1920[ALPHA], 0 0 10px #e04040[ALPHA];',
	'#d8e070': 'color: #d8e070; text-shadow: 0 0 2px #0a1920[ALPHA], 0 0 10px #d8e070[ALPHA];',
	'#e8a070': 'color: #e8a070; text-shadow: 0 0 2px #0a1920[ALPHA], 0 0 10px #e8a070[ALPHA];',
	'#e89e50': 'color: #e89e50; text-shadow: 0 0 2px #0a1920[ALPHA], 0 0 10px #e89e50[ALPHA];',
	// Default foreground — subtle halo so plain text doesn't look flat
	'#e8e8e0': 'color: #e8e8e0; text-shadow: 0 0 2px #e8e8e0[ALPHA];',
};

/**
 * Combined replacements for both themes. The runtime detects which theme is
 * active and, since hex colors don't overlap between Neomono and Neomono Deep,
 * the merged map can be looked up unconditionally.
 */
export const ALL_GLOW_REPLACEMENTS: GlowMap = { ...NEOMONO_GLOW_MAP, ...NEOMONO_DEEP_GLOW_MAP };
