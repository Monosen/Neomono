import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as crypto from 'crypto';

// ── Markers used in workbench.html ──────────────────────────────────────────

const START_MARKER = '<!-- NEOMONO-GLOW-START -->';
const END_MARKER = '<!-- NEOMONO-GLOW-END -->';
const SCRIPT_TAG = `${START_MARKER}<script src="neomono-glow.js"></script>${END_MARKER}`;
const MARKER_REGEX = /\s*<!-- NEOMONO-GLOW-START -->.*?<!-- NEOMONO-GLOW-END -->/gs;

// ── Theme-to-CSS mapping ────────────────────────────────────────────────────

const THEME_GLOW_MAP: Record<string, string> = {
	'Neomono': 'neomono-glow.css',
	'Neomono Deep': 'neomono-deep-glow.css'
};

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

/**
 * Resolve workbench HTML path and associated JS file path.
 * Handles different VS Code versions and installation layouts.
 */
function resolveWorkbenchPaths(): { htmlFile: string; jsFile: string } | null {
	const appRoot = vscode.env.appRoot;
	const base = path.join(appRoot, 'out', 'vs', 'code');

	const electronBaseCandidates = [
		'electron-sandbox',   // VS Code 1.70+ (newer)
		'electron-browser'     // VS Code 1.70- and 1.102+ (legacy)
	];

	const htmlCandidates = [
		'workbench.esm.html',  // VS Code 1.94+
		'workbench.html'       // Older versions
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

/**
 * Resolve the product.json path for checksum fixing.
 */
function resolveProductJsonPath(): string | null {
	const appRoot = vscode.env.appRoot;
	const productJsonPath = path.join(appRoot, 'product.json');
	return fs.existsSync(productJsonPath) ? productJsonPath : null;
}

// ── Checksum fixing ─────────────────────────────────────────────────────────

/**
 * Compute a VS Code-compatible checksum for a file.
 * Uses SHA-256 encoded as base64url (no padding).
 */
function computeChecksum(filePath: string): string | null {
	try {
		const content = fs.readFileSync(filePath);
		return crypto.createHash('sha256').update(content).digest('base64').replace(/=+$/, '');
	} catch {
		return null;
	}
}

/**
 * Fix checksums in product.json after modifying VS Code core files.
 * This prevents the "Your Code installation appears to be corrupt" warning.
 */
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
		const fullFilePath = path.join(appRoot, filePath);
		if (!fs.existsSync(fullFilePath)) {
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

/**
 * Read all glow CSS files and combine them into a single CSS string.
 */
function readAllGlowCss(): string {
	const extensionDir = path.dirname(__dirname);
	const themesDir = path.join(extensionDir, 'themes');
	const parts: string[] = [];

	for (const cssFile of Object.values(THEME_GLOW_MAP)) {
		const cssPath = path.join(themesDir, cssFile);
		try {
			const content = fs.readFileSync(cssPath, 'utf-8');
			// Strip CSS comment blocks (they're not needed at runtime)
			const stripped = content.replace(/\/\*[\s\S]*?\*\//g, '').trim();
			if (stripped) {
				parts.push(stripped);
			}
		} catch {
			// Skip missing files gracefully
		}
	}

	return parts.join('\n');
}

/**
 * Generate the JS file content that injects the glow CSS into the DOM.
 * The glow brightness can be configured via neomono.neonDreams.brightness.
 */
function generateGlowJs(cssContent: string, brightness: number): string {
	const disableGlow = !getConfig().glow;

	// Apply brightness to the CSS if glow is enabled
	let finalCss = cssContent;
	if (!disableGlow) {
		// The text-shadow values already use opacity via hex alpha.
		// Brightness is already baked into the CSS files.
		// Future enhancement: dynamically adjust brightness.
	}

	// Escape backticks and ${} in CSS content for template literal
	const escapedCss = finalCss.replace(/`/g, '\\`').replace(/\$\{/g, '\\${');

	return `(function(){
	var s=document.createElement('style');
	s.id='neomono-glow-styles';
	s.textContent=\`${escapedCss}\`;
	document.head.appendChild(s);
})();`;
}

// ── Patching ───────────────────────────────────────────────────────────────

function isGlowPatched(htmlContent: string): boolean {
	return htmlContent.includes(START_MARKER);
}

/**
 * Apply the glow patch to workbench.html and write the JS file.
 */
export async function enableGlow(): Promise<void> {
	const { showNotifications } = getConfig();

	const paths = resolveWorkbenchPaths();
	if (!paths) {
		vscode.window.showErrorMessage(vscode.l10n.t('neonDreams.workbenchNotFound'));
		return;
	}

	const { htmlFile, jsFile } = paths;

	// Read CSS content
	const cssContent = readAllGlowCss();
	if (!cssContent) {
		vscode.window.showErrorMessage(vscode.l10n.t('neonDreams.cssNotFound'));
		return;
	}

	// Generate JS
	const jsContent = generateGlowJs(cssContent, getConfig().brightness);

	try {
		// Write JS file
		fs.writeFileSync(jsFile, jsContent, 'utf-8');

		// Patch workbench.html
		let html = fs.readFileSync(htmlFile, 'utf-8');

		if (isGlowPatched(html)) {
			// Already patched — just update JS and fix checksums
			fixChecksums();
			const reloadLabel = vscode.l10n.t('neonDreams.action.reloadWindow');
			if (showNotifications) {
				const selection = await vscode.window.showInformationMessage(
					vscode.l10n.t('neonDreams.alreadyEnabledRefresh'),
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

/**
 * Remove the glow patch from workbench.html and delete the JS file.
 */
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

/**
 * Toggle the glow on or off.
 */
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
 * This helps users migrate from the old method to the new one.
 */
async function cleanupCustomCssImports(): Promise<void> {
	const config = vscode.workspace.getConfiguration();
	const currentImports = config.get<string[]>('vscode_custom_css.imports', []);
	const allGlowUris = Object.values(THEME_GLOW_MAP).map((cssFile: string) => {
		const glowCssPath = path.join(path.dirname(__dirname), 'themes', cssFile);
		return vscode.Uri.file(glowCssPath).toString();
	});

	const cleaned = currentImports.filter((item: string) => !allGlowUris.includes(item));

	if (cleaned.length !== currentImports.length) {
		await config.update('vscode_custom_css.imports', cleaned, vscode.ConfigurationTarget.Global);
	}
}