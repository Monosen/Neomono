const vscode = require('vscode');
const glow = require('./glow');

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	const enableGlow = vscode.commands.registerCommand('neomono.enableNeonDreams', () => glow.enableGlow());
	const disableGlow = vscode.commands.registerCommand('neomono.disableNeonDreams', () => glow.disableGlow());
	const toggleGlow = vscode.commands.registerCommand('neomono.toggleNeonDreams', () => glow.toggleGlow());

	context.subscriptions.push(enableGlow, disableGlow, toggleGlow);
}

function deactivate() {}

module.exports = {
	activate,
	deactivate
};
