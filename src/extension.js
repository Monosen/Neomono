const vscode = require('vscode');
const glow = require('./glow');

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	let enableGlow = vscode.commands.registerCommand('neomono.enableNeonDreams', function () {
		glow.enableGlow();
	});

	let disableGlow = vscode.commands.registerCommand('neomono.disableNeonDreams', function () {
		glow.disableGlow();
	});

	context.subscriptions.push(enableGlow);
	context.subscriptions.push(disableGlow);
}

function deactivate() {}

module.exports = {
	activate,
	deactivate
}
