const vscode = require('vscode');
const path = require('path');

async function isCustomCssExtensionInstalled() {
    const extension = vscode.extensions.getExtension('be5invis.vscode-custom-css');
    return extension !== undefined;
}

async function enableGlow() {
    try {
        const glowCssPath = path.join(__dirname, '..', 'themes', 'neomono-glow.css');
        const glowCssUri = vscode.Uri.file(glowCssPath).toString();
        
        const config = vscode.workspace.getConfiguration();
        const customCssImports = config.get('vscode_custom_css.imports') || [];
        
        if (customCssImports.includes(glowCssUri)) {
            vscode.window.showInformationMessage('¡Neon Dreams ya está habilitado!');
            return;
        }
        
        customCssImports.push(glowCssUri);
        await config.update('vscode_custom_css.imports', customCssImports, vscode.ConfigurationTarget.Global);
        
        const extensionInstalled = await isCustomCssExtensionInstalled();
        
        if (!extensionInstalled) {
            vscode.window.showInformationMessage(
                '✨ ¡Neon Dreams configurado! Ahora necesitas instalar la extensión "Custom CSS and JS Loader" para aplicar los efectos.',
                'Instalar Extensión'
            ).then(selection => {
                if (selection === 'Instalar Extensión') {
                    vscode.commands.executeCommand('workbench.extensions.installExtension', 'be5invis.vscode-custom-css');
                }
            });
        } else {
            vscode.window.showInformationMessage(
                '✨ ¡Neon Dreams habilitado! Ahora ejecuta el comando "Reload Custom CSS and JS" para aplicar los cambios.',
                'Recargar CSS'
            ).then(selection => {
                if (selection === 'Recargar CSS') {
                    vscode.commands.executeCommand('extension.reloadCustomCSS');
                }
            });
        }

    } catch (error) {
        vscode.window.showErrorMessage('Error al habilitar Neon Dreams: ' + error.message);
    }
}

async function disableGlow() {
    try {
        const glowCssPath = path.join(__dirname, '..', 'themes', 'neomono-glow.css');
        const glowCssUri = vscode.Uri.file(glowCssPath).toString();
        
        const config = vscode.workspace.getConfiguration();
        let customCssImports = config.get('vscode_custom_css.imports') || [];
        
        if (!customCssImports.includes(glowCssUri)) {
            vscode.window.showInformationMessage('Neon Dreams no está habilitado.');
            return;
        }
        
        customCssImports = customCssImports.filter(item => item !== glowCssUri);
        await config.update('vscode_custom_css.imports', customCssImports, vscode.ConfigurationTarget.Global);

        const extensionInstalled = await isCustomCssExtensionInstalled();
        
        if (!extensionInstalled) {
            vscode.window.showWarningMessage(
                '🌙 Neon Dreams deshabilitado en la configuración. Nota: La extensión "Custom CSS and JS Loader" no está instalada.'
            );
        } else {
            vscode.window.showInformationMessage(
                '🌙 Neon Dreams deshabilitado. Ejecuta el comando "Reload Custom CSS and JS" para aplicar los cambios.',
                'Recargar CSS'
            ).then(selection => {
                if (selection === 'Recargar CSS') {
                    vscode.commands.executeCommand('extension.reloadCustomCSS');
                }
            });
        }

    } catch (error) {
        vscode.window.showErrorMessage('Error al deshabilitar Neon Dreams: ' + error.message);
    }
}

module.exports = {
    enableGlow,
    disableGlow
};
