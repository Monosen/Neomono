import * as vscode from 'vscode';
import * as glow from './glow';

/**
 * @param context - The VS Code extension context
 */
export function activate(context: vscode.ExtensionContext): void {
	const enableGlow = vscode.commands.registerCommand('neomono.enableNeonDreams', () => glow.enableGlow());
	const disableGlow = vscode.commands.registerCommand('neomono.disableNeonDreams', () => glow.disableGlow());
	const toggleGlow = vscode.commands.registerCommand('neomono.toggleNeonDreams', () => glow.toggleGlow());

	context.subscriptions.push(enableGlow, disableGlow, toggleGlow);
}

export function deactivate(): void {}
