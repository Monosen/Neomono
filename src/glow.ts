import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as crypto from 'crypto';

// ── Markers used in workbench.html ──────────────────────────────────────────

const START_MARKER = '<!-- NEOMONO-GLOW-START -->';
const END_MARKER = '<!-- NEOMONO-GLOW-END -->';
const SCRIPT_TAG = `${START_MARKER}<script src="neomono-glow.js"></script>${END_MARKER}`;
const MARKER_REGEX = /\s*<!-- NEOMONO-GLOW-START -->.*?<!-- NEOMONO-GLOW-END -->/gs;

// ── Token color replacement maps ────────────────────────────────────────────
// These map hex colors (as they appear in VS Code's generated token CSS)
// to glow-enhanced CSS declarations. VS Code generates a <style class="vscode-tokens-styles">
// tag with rules like `.mtk1 { color: #bd93f9; }`. We intercept that CSS and replace
// the color declarations with glow-enhanced versions.

interface GlowMap {
	[hexColor: string]: string;
}

// Token color replacement maps with [ALPHA] placeholder.
// [ALPHA] is replaced at build time with a 2-digit hex opacity derived from
// the user's brightness setting (0.0→00, 1.0→FF).
const NEOMONO_GLOW_MAP: GlowMap = {
	'#bd93f9': 'color: #bd93f9; text-shadow: 0 0 2px #bd93f9[ALPHA], 0 0 10px #6231a7[ALPHA];',
	'#8be9fd': 'color: #8be9fd; text-shadow: 0 0 2px #100f2e[ALPHA], 0 0 8px #8be9fd[ALPHA];',
	'#ff79c6': 'color: #ff79c6; text-shadow: 0 0 2px #100f2e[ALPHA], 0 0 10px #ff79c6[ALPHA];',
	'#50fa7b': 'color: #50fa7b; text-shadow: 0 0 2px #100f2e[ALPHA], 0 0 10px #25a243[ALPHA];',
	'#ff5555': 'color: #ff5555; text-shadow: 0 0 2px #100f2e[ALPHA], 0 0 10px #ff5555[ALPHA];',
	'#f1fa8c': 'color: #f1fa8c; text-shadow: 0 0 2px #100f2e[ALPHA], 0 0 10px #f1fa8c[ALPHA];',
	'#ffb86c': 'color: #ffb86c; text-shadow: 0 0 2px #100f2e[ALPHA], 0 0 10px #ffb86c[ALPHA];',
};

const NEOMONO_DEEP_GLOW_MAP: GlowMap = {
	'#a576e0': 'color: #a576e0; text-shadow: 0 0 2px #a576e0[ALPHA], 0 0 10px #5a2d8f[ALPHA];',
	'#6dd0e8': 'color: #6dd0e8; text-shadow: 0 0 2px #0a1920[ALPHA], 0 0 8px #6dd0e8[ALPHA];',
	'#e85aa8': 'color: #e85aa8; text-shadow: 0 0 2px #0a1920[ALPHA], 0 0 10px #e85aa8[ALPHA];',
	'#3dd660': 'color: #3dd660; text-shadow: 0 0 2px #0a1920[ALPHA], 0 0 10px #1a8030[ALPHA];',
	'#e04040': 'color: #e04040; text-shadow: 0 0 2px #0a1920[ALPHA], 0 0 10px #e04040[ALPHA];',
	'#d8e070': 'color: #d8e070; text-shadow: 0 0 2px #0a1920[ALPHA], 0 0 10px #d8e070[ALPHA];',
	'#e8a070': 'color: #e8a070; text-shadow: 0 0 2px #0a1920[ALPHA], 0 0 10px #e8a070[ALPHA];',
};

// Combined map for both themes — we detect which one is active at runtime
const ALL_GLOW_REPLACEMENTS: GlowMap = { ...NEOMONO_GLOW_MAP, ...NEOMONO_DEEP_GLOW_MAP };

// ── Configuration ───────────────────────────────────────────────────────────

interface NeonDreamsConfig {
	brightness: number;
	glow: boolean;
	showNotifications: boolean;
}

function getConfig(): NeonDreamsConfig {
	const config = vscode.workspace.getConfiguration('neomono.neonDreams');
	return {
		brightness: config.get<number>('brightness', 0.45),
		glow: config.get<boolean>('glow', true),
		showNotifications: config.get<boolean>('showNotifications', true)
	};
}

// ── Path resolution ────────────────────────────────────────────────────────

function resolveWorkbenchPaths(): { htmlFile: string; jsFile: string } | null {
	const appRoot = vscode.env.appRoot;
	const base = path.join(appRoot, 'out', 'vs', 'code');

	const electronBaseCandidates = [
		'electron-sandbox',
		'electron-browser'
	];

	const htmlCandidates = [
		'workbench.esm.html',
		'workbench.html'
	];

	for (const electronBase of electronBaseCandidates) {
		for (const htmlFile of htmlCandidates) {
			const fullPath = path.join(base, electronBase, 'workbench', htmlFile);
			if (fs.existsSync(fullPath)) {
				return {
					htmlFile: fullPath,
					jsFile: path.join(base, electronBase, 'workbench', 'neomono-glow.js')
				};
			}
		}
	}

	return null;
}

function resolveProductJsonPath(): string | null {
	const appRoot = vscode.env.appRoot;
	const productJsonPath = path.join(appRoot, 'product.json');
	return fs.existsSync(productJsonPath) ? productJsonPath : null;
}

// ── Checksum fixing ─────────────────────────────────────────────────────────

function computeChecksum(filePath: string): string | null {
	try {
		const content = fs.readFileSync(filePath);
		return crypto.createHash('sha256').update(content).digest('base64').replace(/=+$/, '');
	} catch {
		return null;
	}
}

function resolveChecksumFilePath(appRoot: string, relativePath: string): string | null {
	const withOut = path.join(appRoot, 'out', relativePath);
	if (fs.existsSync(withOut)) {
		return withOut;
	}
	const direct = path.join(appRoot, relativePath);
	if (fs.existsSync(direct)) {
		return direct;
	}
	return null;
}

function fixChecksums(): boolean {
	const productJsonPath = resolveProductJsonPath();
	if (!productJsonPath) {
		return false;
	}

	let productJson: Record<string, unknown>;
	try {
		const raw = fs.readFileSync(productJsonPath, 'utf-8');
		productJson = JSON.parse(raw);
	} catch {
		return false;
	}

	const checksums = productJson.checksums;
	if (!checksums || typeof checksums !== 'object') {
		return false;
	}

	const appRoot = vscode.env.appRoot;
	let changed = false;

	for (const [filePath, _expectedChecksum] of Object.entries(checksums as Record<string, string>)) {
		const fullFilePath = resolveChecksumFilePath(appRoot, filePath);
		if (!fullFilePath) {
			continue;
		}

		const actualChecksum = computeChecksum(fullFilePath);
		if (actualChecksum && actualChecksum !== _expectedChecksum) {
			(checksums as Record<string, string>)[filePath] = actualChecksum;
			changed = true;
		}
	}

	if (changed) {
		try {
			const json = JSON.stringify(productJson, null, '\t');
			fs.writeFileSync(productJsonPath, json, 'utf-8');
			return true;
		} catch {
			return false;
		}
	}

	return true;
}

// ── JS generation ──────────────────────────────────────────────────────────

function escapeForJsString(str: string): string {
	return str.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n');
}

function generateGlowJs(disableGlow: boolean, brightness: number): string {
	// Clamp and convert brightness (0-1) to 2-digit hex alpha (00-FF)
	const clamped = Math.max(0, Math.min(1, brightness));
	const alphaHex = Math.floor(clamped * 255).toString(16).toUpperCase().padStart(2, '0');

	// Build the token replacement map as a JS object literal,
	// substituting [ALPHA] with the computed hex value.
	const mapEntries = Object.entries(ALL_GLOW_REPLACEMENTS)
		.map(([color, replacement]) => {
			const withAlpha = replacement.replace(/\[ALPHA\]/g, alphaHex);
			return '\t\t\'' + color + '\': \'' + escapeForJsString(withAlpha) + '\'';
		})
		.join(',\n');

	const js = [
		'(function() {',
		'\t\'use strict\';',
		'',
		'\tconst TOKEN_REPLACEMENTS = {',
		mapEntries,
		'\t};',
		'',
		"\tconst THEME_NAMES = ['Neomono', 'Neomono Deep'];",
		'\tconst DISABLE_GLOW = ' + disableGlow + ';',
		'',
		'\tfunction isNeomonoTheme() {',
		'\t\tconst htmlTheme = document.documentElement.getAttribute(\'data-vscode-theme-name\');',
		'\t\tconst bodyTheme = document.body.getAttribute(\'data-vscode-theme-name\');',
		'\t\treturn THEME_NAMES.includes(htmlTheme) || THEME_NAMES.includes(bodyTheme);',
		'\t}',
		'',
		'\tfunction hasNeomonoColors(styles) {',
		'\t\treturn Object.keys(TOKEN_REPLACEMENTS).some(function(color) {',
		'\t\t\treturn styles.includes(color);',
		'\t\t});',
		'\t}',
		'',
		'\tfunction replaceTokens(styles) {',
		'\t\treturn Object.keys(TOKEN_REPLACEMENTS).reduce(function(acc, color) {',
		'\t\t\tconst re = new RegExp(\'color: \' + color + \';\', \'gi\');',
		'\t\t\treturn acc.replace(re, TOKEN_REPLACEMENTS[color]);',
		'\t\t}, styles);',
		'\t}',
		'',
		'\tfunction initGlow() {',
		'\t\tif (document.getElementById(\'neomono-glow-styles\')) {',
		'\t\t\treturn true;',
		'\t\t}',
		'',
		'\t\tconst tokensEl = document.querySelector(\'.vscode-tokens-styles\');',
		'\t\tif (!tokensEl) {',
		'\t\t\treturn false;',
		'\t\t}',
		'',
		'\t\tif (!isNeomonoTheme()) {',
		'\t\t\treturn false;',
		'\t\t}',
		'',
		'\t\tif (!hasNeomonoColors(tokensEl.innerText)) {',
		'\t\t\treturn false;',
		'\t\t}',
		'',
		'\t\tconst originalStyles = tokensEl.innerText;',
		'\t\tconst updatedStyles = DISABLE_GLOW',
		'\t\t\t? originalStyles',
		'\t\t\t: replaceTokens(originalStyles);',
		'',
		'\t\tconst newStyleTag = document.createElement(\'style\');',
		'\t\tnewStyleTag.id = \'neomono-glow-styles\';',
		'\t\tnewStyleTag.textContent = updatedStyles.replace(/(\\r\\n|\\n|\\r)/gm, \'\');',
		'\t\tdocument.body.appendChild(newStyleTag);',
		'',
		'\t\treturn true;',
		'\t}',
		'',
		'\t// Try immediately',
		'\tinitGlow();',
		'',
		'\t// Watch for DOM changes',
		'\tconst observer = new MutationObserver(function() {',
		'\t\tif (initGlow()) {',
		'\t\t\tobserver.disconnect();',
		'\t\t}',
		'\t});',
		'\tobserver.observe(document.body, { childList: true, subtree: true });',
		'',
		'\t// Polling fallback',
		'\tlet attempts = 0;',
		'\tconst poll = setInterval(function() {',
		'\t\tattempts++;',
		'\t\tif (initGlow() || attempts > 60) {',
		'\t\t\tclearInterval(poll);',
		'\t\t}',
		'\t}, 500);',
		'})();'
	];

	return js.join('\n');
}

// ── Patching ───────────────────────────────────────────────────────────────

function isGlowPatched(htmlContent: string): boolean {
	return htmlContent.includes(START_MARKER);
}

export async function enableGlow(): Promise<void> {
	const { showNotifications } = getConfig();

	const paths = resolveWorkbenchPaths();
	if (!paths) {
		vscode.window.showErrorMessage(vscode.l10n.t('neonDreams.workbenchNotFound'));
		return;
	}

	const { htmlFile, jsFile } = paths;
	const config = getConfig();
	const disableGlow = !config.glow;
	const brightness = config.brightness;

	try {
		// Generate the glow JS
		const jsContent = generateGlowJs(disableGlow, brightness);
		fs.writeFileSync(jsFile, jsContent, 'utf-8');

		// Patch workbench.html
		let html = fs.readFileSync(htmlFile, 'utf-8');

		if (isGlowPatched(html)) {
			// Already patched — just update JS and fix checksums
			fixChecksums();
			const reloadLabel = vscode.l10n.t('neonDreams.action.reloadWindow');
			if (showNotifications) {
				const selection = await vscode.window.showInformationMessage(
					vscode.l10n.t('neonDreams.enabledNeedsRefresh'),
					reloadLabel
				);
				if (selection === reloadLabel) {
					vscode.commands.executeCommand('workbench.action.reloadWindow');
				}
			}
			return;
		}

		// Remove any previous patch (cleanup)
		html = html.replace(MARKER_REGEX, '');

		// Inject our script tag before </html>
		const patched = html.replace(/<\/html>/i, `${SCRIPT_TAG}\n</html>`);

		fs.writeFileSync(htmlFile, patched, 'utf-8');

		// Fix checksums
		const checksumsFixed = fixChecksums();

		// Clean up any leftover Custom CSS Loader imports
		await cleanupCustomCssImports();

		const reloadLabel = vscode.l10n.t('neonDreams.action.reloadWindow');
		let message = vscode.l10n.t('neonDreams.enabledNeedsReload');
		if (!checksumsFixed) {
			message = vscode.l10n.t('neonDreams.enabledChecksumWarning');
		}

		if (showNotifications) {
			const selection = await vscode.window.showInformationMessage(message, reloadLabel);
			if (selection === reloadLabel) {
				vscode.commands.executeCommand('workbench.action.reloadWindow');
			}
		}
	} catch (error) {
		const isPermissionError = error instanceof Error && /EACCES|EPERM/.test((error as NodeJS.ErrnoException).code || '');
		if (isPermissionError) {
			vscode.window.showErrorMessage(vscode.l10n.t('neonDreams.permissionDenied'));
		} else {
			vscode.window.showErrorMessage(
				vscode.l10n.t('neonDreams.enableError', error instanceof Error ? error.message : String(error))
			);
		}
	}
}

export async function disableGlow(): Promise<void> {
	const { showNotifications } = getConfig();

	const paths = resolveWorkbenchPaths();
	if (!paths) {
		vscode.window.showErrorMessage(vscode.l10n.t('neonDreams.workbenchNotFound'));
		return;
	}

	const { htmlFile, jsFile } = paths;

	try {
		let html = fs.readFileSync(htmlFile, 'utf-8');

		if (!isGlowPatched(html)) {
			if (showNotifications) {
				vscode.window.showInformationMessage(vscode.l10n.t('neonDreams.notEnabled'));
			}
			return;
		}

		// Remove the patch
		html = html.replace(MARKER_REGEX, '');
		fs.writeFileSync(htmlFile, html, 'utf-8');

		// Delete JS file
		if (fs.existsSync(jsFile)) {
			fs.unlinkSync(jsFile);
		}

		// Fix checksums
		const checksumsFixed = fixChecksums();

		const reloadLabel = vscode.l10n.t('neonDreams.action.reloadWindow');
		let message = vscode.l10n.t('neonDreams.disabledNeedsReload');
		if (!checksumsFixed) {
			message = vscode.l10n.t('neonDreams.disabledChecksumWarning');
		}

		if (showNotifications) {
			const selection = await vscode.window.showInformationMessage(message, reloadLabel);
			if (selection === reloadLabel) {
				vscode.commands.executeCommand('workbench.action.reloadWindow');
			}
		}
	} catch (error) {
		const isPermissionError = error instanceof Error && /EACCES|EPERM/.test((error as NodeJS.ErrnoException).code || '');
		if (isPermissionError) {
			vscode.window.showErrorMessage(vscode.l10n.t('neonDreams.permissionDenied'));
		} else {
			vscode.window.showErrorMessage(
				vscode.l10n.t('neonDreams.disableError', error instanceof Error ? error.message : String(error))
			);
		}
	}
}

export async function toggleGlow(): Promise<void> {
	const paths = resolveWorkbenchPaths();
	if (!paths) {
		vscode.window.showErrorMessage(vscode.l10n.t('neonDreams.workbenchNotFound'));
		return;
	}

	try {
		const html = fs.readFileSync(paths.htmlFile, 'utf-8');
		if (isGlowPatched(html)) {
			await disableGlow();
		} else {
			await enableGlow();
		}
	} catch {
		await enableGlow();
	}
}

/**
 * Clean up any Neomono entries from the Custom CSS Loader settings.
 * Silently skips if the Custom CSS Loader extension is not installed.
 */
async function cleanupCustomCssImports(): Promise<void> {
	const customCssExtension = vscode.extensions.getExtension('be5invis.vscode-custom-css');
	if (!customCssExtension) {
		return;
	}

	try {
		const config = vscode.workspace.getConfiguration();
		const currentImports = config.get<string[]>('vscode_custom_css.imports', []);

		const extensionDir = path.dirname(__dirname);
		const glowCssFiles = ['neomono-glow.css', 'neomono-deep-glow.css'];
		const allGlowUris = glowCssFiles.map((cssFile: string) => {
			const glowCssPath = path.join(extensionDir, 'themes', cssFile);
			return vscode.Uri.file(glowCssPath).toString();
		});

		const cleaned = currentImports.filter((item: string) => !allGlowUris.includes(item));

		if (cleaned.length !== currentImports.length) {
			await config.update('vscode_custom_css.imports', cleaned, vscode.ConfigurationTarget.Global);
		}
	} catch {
		// Silently ignore
	}
}
