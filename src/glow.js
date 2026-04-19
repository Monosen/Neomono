const vscode = require('vscode');
const path = require('path');

const CUSTOM_CSS_EXTENSION_ID = 'be5invis.vscode-custom-css';
const CUSTOM_CSS_IMPORTS_KEY = 'vscode_custom_css.imports';
const RELOAD_CUSTOM_CSS_COMMAND = 'extension.reloadCustomCSS';

function getGlowCssUri() {
    const glowCssPath = path.join(__dirname, '..', 'themes', 'neomono-glow.css');
    return vscode.Uri.file(glowCssPath).toString();
}

function isCustomCssExtensionInstalled() {
    return vscode.extensions.getExtension(CUSTOM_CSS_EXTENSION_ID) !== undefined;
}

function getNeomonoConfig() {
    const config = vscode.workspace.getConfiguration('neomono.neonDreams');
    return {
        autoReload: config.get('autoReload', true),
        showNotifications: config.get('showNotifications', true)
    };
}

function isGlowEnabled() {
    const imports = vscode.workspace.getConfiguration().get(CUSTOM_CSS_IMPORTS_KEY) || [];
    return imports.includes(getGlowCssUri());
}

async function updateImports(mutator) {
    const config = vscode.workspace.getConfiguration();
    const current = config.get(CUSTOM_CSS_IMPORTS_KEY) || [];
    const next = mutator([...current]);
    await config.update(CUSTOM_CSS_IMPORTS_KEY, next, vscode.ConfigurationTarget.Global);
}

async function reloadCustomCss() {
    try {
        await vscode.commands.executeCommand(RELOAD_CUSTOM_CSS_COMMAND);
    } catch {
        // The command is only available when the Custom CSS extension is installed.
    }
}

function showInfo(message, ...actions) {
    const { showNotifications } = getNeomonoConfig();
    if (!showNotifications) {
        return Promise.resolve(undefined);
    }
    return vscode.window.showInformationMessage(message, ...actions);
}

function showWarning(message, ...actions) {
    const { showNotifications } = getNeomonoConfig();
    if (!showNotifications) {
        return Promise.resolve(undefined);
    }
    return vscode.window.showWarningMessage(message, ...actions);
}

async function enableGlow() {
    try {
        const glowCssUri = getGlowCssUri();

        if (isGlowEnabled()) {
            showInfo(vscode.l10n.t('neonDreams.alreadyEnabled'));
            return;
        }

        await updateImports((imports) => {
            imports.push(glowCssUri);
            return imports;
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

async function disableGlow() {
    try {
        const glowCssUri = getGlowCssUri();

        if (!isGlowEnabled()) {
            showInfo(vscode.l10n.t('neonDreams.notEnabled'));
            return;
        }

        await updateImports((imports) => imports.filter((item) => item !== glowCssUri));

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

async function toggleGlow() {
    if (isGlowEnabled()) {
        await disableGlow();
    } else {
        await enableGlow();
    }
}

module.exports = {
    enableGlow,
    disableGlow,
    toggleGlow
};
