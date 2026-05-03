import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { log } from '../logger';
import { fixChecksums } from './checksum';
import { getConfig } from './config';
import { isGlowPatched, MARKER_REGEX, SCRIPT_TAG } from './markers';
import { resolveWorkbenchPaths } from './paths';
import { generateGlowJs } from './template';

const CONFIG_REFRESH_DEBOUNCE_MS = 250;
let configRefreshTimer: NodeJS.Timeout | undefined;

/** Test-only: cancel any pending debounce timer and clear it. */
export function _resetDebounceForTests(): void {
	if (configRefreshTimer) {
		clearTimeout(configRefreshTimer);
		configRefreshTimer = undefined;
	}
}

function isPermissionError(error: unknown): boolean {
	return error instanceof Error && /EACCES|EPERM/.test((error as NodeJS.ErrnoException).code || '');
}

async function offerReload(message: string, showNotifications: boolean): Promise<void> {
	if (!showNotifications) {
		return;
	}
	const reloadLabel = vscode.l10n.t('neonDreams.action.reloadWindow');
	const selection = await vscode.window.showInformationMessage(message, reloadLabel);
	if (selection === reloadLabel) {
		vscode.commands.executeCommand('workbench.action.reloadWindow');
	}
}

/**
 * Enable Neon Dreams: regenerate the runtime JS with current settings, inject
 * the `<script>` tag into `workbench.html`, fix `product.json` checksums, and
 * offer the user a "Reload Window" notification. Idempotent — if the patch is
 * already present, just refreshes the JS.
 */
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
		const jsContent = generateGlowJs(disableGlow, brightness);
		fs.writeFileSync(jsFile, jsContent, 'utf-8');

		let html = fs.readFileSync(htmlFile, 'utf-8');

		if (isGlowPatched(html)) {
			// Already patched — just refresh JS and checksums
			fixChecksums();
			await offerReload(vscode.l10n.t('neonDreams.enabledNeedsRefresh'), showNotifications);
			return;
		}

		// Remove any previous (stale) patch before injecting a fresh one
		html = html.replace(MARKER_REGEX, '');
		const patched = html.replace(/<\/html>/i, `${SCRIPT_TAG}\n</html>`);
		fs.writeFileSync(htmlFile, patched, 'utf-8');

		const checksumsFixed = fixChecksums();

		await cleanupCustomCssImports();

		const message = checksumsFixed
			? vscode.l10n.t('neonDreams.enabledNeedsReload')
			: vscode.l10n.t('neonDreams.enabledChecksumWarning');
		await offerReload(message, showNotifications);
	} catch (error) {
		if (isPermissionError(error)) {
			vscode.window.showErrorMessage(vscode.l10n.t('neonDreams.permissionDenied'));
		} else {
			vscode.window.showErrorMessage(
				vscode.l10n.t('neonDreams.enableError', error instanceof Error ? error.message : String(error))
			);
		}
	}
}

/**
 * Disable Neon Dreams: strip the patch from `workbench.html`, delete the
 * runtime JS, fix checksums, and offer a "Reload Window" notification. Safe to
 * call when the patch is not installed (no-op aside from a notification).
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

		html = html.replace(MARKER_REGEX, '');
		fs.writeFileSync(htmlFile, html, 'utf-8');

		if (fs.existsSync(jsFile)) {
			fs.unlinkSync(jsFile);
		}

		const checksumsFixed = fixChecksums();
		const message = checksumsFixed
			? vscode.l10n.t('neonDreams.disabledNeedsReload')
			: vscode.l10n.t('neonDreams.disabledChecksumWarning');
		await offerReload(message, showNotifications);
	} catch (error) {
		if (isPermissionError(error)) {
			vscode.window.showErrorMessage(vscode.l10n.t('neonDreams.permissionDenied'));
		} else {
			vscode.window.showErrorMessage(
				vscode.l10n.t('neonDreams.disableError', error instanceof Error ? error.message : String(error))
			);
		}
	}
}

/**
 * Inverse of whatever Neon Dreams currently is: enable if disabled, disable if
 * enabled. Falls back to enabling if `workbench.html` cannot be read.
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
	} catch (error) {
		log.warn('Could not read workbench.html, falling back to enable', error);
		await enableGlow();
	}
}

/**
 * Hook live configuration updates: when the user changes
 * `neomono.neonDreams.brightness` or `neomono.neonDreams.glow`, regenerate the
 * injected JS and offer a reload — but only if Neon Dreams is already patched.
 * If it isn't, we stay silent (no surprise patching).
 */
export function activateGlow(context: vscode.ExtensionContext): void {
	context.subscriptions.push(
		vscode.workspace.onDidChangeConfiguration((event) => {
			if (!event.affectsConfiguration('neomono.neonDreams.brightness')
				&& !event.affectsConfiguration('neomono.neonDreams.glow')) {
				return;
			}

			const paths = resolveWorkbenchPaths();
			if (!paths) {
				return;
			}

			let html: string;
			try {
				html = fs.readFileSync(paths.htmlFile, 'utf-8');
			} catch (error) {
				log.warn('Could not read workbench.html for live refresh', error);
				return;
			}

			if (!isGlowPatched(html)) {
				return;
			}

			if (configRefreshTimer) {
				clearTimeout(configRefreshTimer);
			}

			configRefreshTimer = setTimeout(() => {
				configRefreshTimer = undefined;
				void enableGlow();
			}, CONFIG_REFRESH_DEBOUNCE_MS);
		})
	);
}

/**
 * Clean up any Neomono entries from the Custom CSS Loader settings.
 * Silently skips if the Custom CSS Loader extension is not installed.
 *
 * Exported only to make the legacy migration testable; production code reaches
 * it through {@link enableGlow}.
 */
export async function cleanupCustomCssImports(): Promise<void> {
	const customCssExtension = vscode.extensions.getExtension('be5invis.vscode-custom-css');
	if (!customCssExtension) {
		return;
	}

	try {
		const config = vscode.workspace.getConfiguration();
		const currentImports = config.get<string[]>('vscode_custom_css.imports', []);

		// Walk up out/glow/ → out/ → extension root, then themes/.
		const extensionDir = path.dirname(path.dirname(__dirname));
		const glowCssFiles = ['neomono-glow.css', 'neomono-deep-glow.css'];
		const allGlowUris = glowCssFiles.map((cssFile: string) => {
			const glowCssPath = path.join(extensionDir, 'themes', cssFile);
			return vscode.Uri.file(glowCssPath).toString();
		});

		const cleaned = currentImports.filter((item: string) => !allGlowUris.includes(item));

		if (cleaned.length !== currentImports.length) {
			await config.update('vscode_custom_css.imports', cleaned, vscode.ConfigurationTarget.Global);
		}
	} catch (error) {
		// Custom CSS Loader may not be installed or its setting may not be registered.
		log.warn('Custom CSS Loader cleanup skipped', error);
	}
}
