import * as vscode from 'vscode';
import * as path from 'path';

const CUSTOM_CSS_EXTENSION_ID = 'be5invis.vscode-custom-css';
const CUSTOM_CSS_IMPORTS_KEY = 'vscode_custom_css.imports';
const RELOAD_CUSTOM_CSS_COMMAND = 'extension.reloadCustomCSS';

/**
 * Map of theme labels to their corresponding glow CSS files.
 * Each theme in the Neomono family can have its own glow variant.
 */
const THEME_GLOW_MAP: Record<string, string> = {
    'Neomono': 'neomono-glow.css',
    'Neomono Deep': 'neomono-deep-glow.css'
};

/**
 * Get the currently active color theme from VS Code settings.
 * @returns The active theme name
 */
function getActiveTheme(): string {
    return vscode.workspace.getConfiguration('workbench').get<string>('colorTheme', '');
}

/**
 * Get the glow CSS URI for a specific theme.
 * Falls back to the default neomono-glow.css if the theme has no dedicated glow.
 * @param themeName - The name of the theme
 * @returns The URI string for the glow CSS file
 */
function getGlowCssUri(themeName: string): string {
    const cssFile = THEME_GLOW_MAP[themeName] || 'neomono-glow.css';
    const glowCssPath = path.join(__dirname, '..', 'themes', cssFile);
    return vscode.Uri.file(glowCssPath).toString();
}

/**
 * Get all known glow CSS URIs for the Neomono theme family.
 * Used to clean up any orphaned glow styles when disabling or switching themes.
 * @returns Array of glow CSS URI strings
 */
function getAllGlowCssUris(): string[] {
    return Object.values(THEME_GLOW_MAP).map((cssFile: string) => {
        const glowCssPath = path.join(__dirname, '..', 'themes', cssFile);
        return vscode.Uri.file(glowCssPath).toString();
    });
}

function isCustomCssExtensionInstalled(): boolean {
    return vscode.extensions.getExtension(CUSTOM_CSS_EXTENSION_ID) !== undefined;
}

interface NeomonoConfig {
    autoReload: boolean;
    showNotifications: boolean;
}

function getNeomonoConfig(): NeomonoConfig {
    const config = vscode.workspace.getConfiguration('neomono.neonDreams');
    return {
        autoReload: config.get<boolean>('autoReload', true),
        showNotifications: config.get<boolean>('showNotifications', true)
    };
}

/**
 * Check if any Neomono glow CSS is currently imported.
 * @returns True if any glow CSS is imported
 */
function isGlowEnabled(): boolean {
    const imports = vscode.workspace.getConfiguration().get<string[]>(CUSTOM_CSS_IMPORTS_KEY) || [];
    const allGlowUris = getAllGlowCssUris();
    return allGlowUris.some((uri) => imports.includes(uri));
}

/**
 * Check if the glow CSS for the currently active theme is imported.
 * @returns True if the active theme's glow is enabled
 */
function isActiveThemeGlowEnabled(): boolean {
    const imports = vscode.workspace.getConfiguration().get<string[]>(CUSTOM_CSS_IMPORTS_KEY) || [];
    const activeTheme = getActiveTheme();
    const glowUri = getGlowCssUri(activeTheme);
    return imports.includes(glowUri);
}

async function updateImports(mutator: (imports: string[]) => string[]): Promise<void> {
    const config = vscode.workspace.getConfiguration();
    const current = config.get<string[]>(CUSTOM_CSS_IMPORTS_KEY) || [];
    const next = mutator([...current]);
    await config.update(CUSTOM_CSS_IMPORTS_KEY, next, vscode.ConfigurationTarget.Global);
}

async function reloadCustomCss(): Promise<void> {
    try {
        await vscode.commands.executeCommand(RELOAD_CUSTOM_CSS_COMMAND);
    } catch {
        // The command is only available when the Custom CSS extension is installed.
    }
}

function showInfo(message: string, ...actions: string[]): Thenable<string | undefined> {
    const { showNotifications } = getNeomonoConfig();
    if (!showNotifications) {
        return Promise.resolve(undefined);
    }
    return vscode.window.showInformationMessage(message, ...actions);
}

function showWarning(message: string, ...actions: string[]): Thenable<string | undefined> {
    const { showNotifications } = getNeomonoConfig();
    if (!showNotifications) {
        return Promise.resolve(undefined);
    }
    return vscode.window.showWarningMessage(message, ...actions);
}

export async function enableGlow(): Promise<void> {
    try {
        const activeTheme = getActiveTheme();
        const glowCssUri = getGlowCssUri(activeTheme);

        if (isActiveThemeGlowEnabled()) {
            showInfo(vscode.l10n.t('neonDreams.alreadyEnabled'));
            return;
        }

        // Remove any other Neomono glow CSS first (in case user switched themes)
        await updateImports((imports) => {
            const allGlowUris = getAllGlowCssUris();
            const cleaned = imports.filter((item) => !allGlowUris.includes(item));
            cleaned.push(glowCssUri);
            return cleaned;
        });

        const installLabel = vscode.l10n.t('neonDreams.action.installExtension');
        const reloadLabel = vscode.l10n.t('neonDreams.action.reloadCss');

        if (!isCustomCssExtensionInstalled()) {
            const selection = await showInfo(
                vscode.l10n.t('neonDreams.enabledNeedsExtension'),
                installLabel
            );
            if (selection === installLabel) {
                await vscode.commands.executeCommand(
                    'workbench.extensions.installExtension',
                    CUSTOM_CSS_EXTENSION_ID
                );
            }
            return;
        }

        const { autoReload } = getNeomonoConfig();
        if (autoReload) {
            await reloadCustomCss();
            return;
        }

        const selection = await showInfo(
            vscode.l10n.t('neonDreams.enabledNeedsReload'),
            reloadLabel
        );
        if (selection === reloadLabel) {
            await reloadCustomCss();
        }
    } catch (error) {
        vscode.window.showErrorMessage(
            vscode.l10n.t('neonDreams.enableError', error instanceof Error ? error.message : String(error))
        );
    }
}

export async function disableGlow(): Promise<void> {
    try {
        if (!isGlowEnabled()) {
            showInfo(vscode.l10n.t('neonDreams.notEnabled'));
            return;
        }

        // Remove all Neomono glow CSS entries
        await updateImports((imports) => {
            const allGlowUris = getAllGlowCssUris();
            return imports.filter((item) => !allGlowUris.includes(item));
        });

        if (!isCustomCssExtensionInstalled()) {
            showWarning(vscode.l10n.t('neonDreams.disabledNoExtension'));
            return;
        }

        const { autoReload } = getNeomonoConfig();
        if (autoReload) {
            await reloadCustomCss();
            return;
        }

        const reloadLabel = vscode.l10n.t('neonDreams.action.reloadCss');
        const selection = await showInfo(
            vscode.l10n.t('neonDreams.disabledNeedsReload'),
            reloadLabel
        );
        if (selection === reloadLabel) {
            await reloadCustomCss();
        }
    } catch (error) {
        vscode.window.showErrorMessage(
            vscode.l10n.t('neonDreams.disableError', error instanceof Error ? error.message : String(error))
        );
    }
}

export async function toggleGlow(): Promise<void> {
    if (isActiveThemeGlowEnabled()) {
        await disableGlow();
    } else {
        await enableGlow();
    }
}
