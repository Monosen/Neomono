const vscode = require('vscode');
const fs = require('fs');
const path = require('path');

// Get VS Code installation directory from the executable path
const vscodeAppPath = path.dirname(process.execPath);
const cssPath = path.join(vscodeAppPath, 'resources', 'app', 'out', 'vs', 'workbench', 'workbench.desktop.main.css');

function enableGlow() {
    try {
        const glowCssPath = path.join(__dirname, '..', 'themes', 'neomono-glow.css');
        const glowCss = fs.readFileSync(glowCssPath, 'utf-8');
        
        let cssContent = fs.readFileSync(cssPath, 'utf-8');
        
        if (cssContent.includes('/* Neomono Glow Effect */')) {
            vscode.window.showInformationMessage('Neon Dreams is already enabled!');
            return;
        }

        // Append our custom CSS
        fs.appendFileSync(cssPath, '\n' + glowCss);
        
        vscode.window.showInformationMessage('Neon Dreams enabled! Please restart VS Code to see the changes.', 'Restart').then(selection => {
            if (selection === 'Restart') {
                vscode.commands.executeCommand('workbench.action.reloadWindow');
            }
        });

    } catch (error) {
        vscode.window.showErrorMessage('Failed to enable Neon Dreams: ' + error.message);
        if (error.code === 'EACCES') {
            vscode.window.showErrorMessage('Permission denied. Please run VS Code as Administrator.');
        }
    }
}

function disableGlow() {
    try {
        let cssContent = fs.readFileSync(cssPath, 'utf-8');
        
        if (!cssContent.includes('/* Neomono Glow Effect */')) {
            vscode.window.showInformationMessage('Neon Dreams is not enabled.');
            return;
        }

        // Remove our custom CSS (this is a simple implementation, might need more robust parsing)
        const glowCssPath = path.join(__dirname, '..', 'themes', 'neomono-glow.css');
        const glowCss = fs.readFileSync(glowCssPath, 'utf-8');
        
        // We can't easily just replace the string because of potential whitespace diffs or if we appended it.
        // A safer way for this simple append approach is to read the file and truncate it if we know we appended to the end,
        // OR simpler: replace the exact string we appended.
        
        const newCssContent = cssContent.replace('\n' + glowCss, '');
        fs.writeFileSync(cssPath, newCssContent);

        vscode.window.showInformationMessage('Neon Dreams disabled! Please restart VS Code.', 'Restart').then(selection => {
            if (selection === 'Restart') {
                vscode.commands.executeCommand('workbench.action.reloadWindow');
            }
        });

    } catch (error) {
        vscode.window.showErrorMessage('Failed to disable Neon Dreams: ' + error.message);
        if (error.code === 'EACCES') {
            vscode.window.showErrorMessage('Permission denied. Please run VS Code as Administrator.');
        }
    }
}

module.exports = {
    enableGlow,
    disableGlow
};
