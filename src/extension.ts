import * as vscode from 'vscode';
import * as glow from './glow';
import * as reactor from './reactor';

/**
 * @param context - The VS Code extension context
 */
export function activate(context: vscode.ExtensionContext): void {
	const enableGlow = vscode.commands.registerCommand('neomono.enableNeonDreams', () => glow.enableGlow());
	const disableGlow = vscode.commands.registerCommand('neomono.disableNeonDreams', () => glow.disableGlow());
	const toggleGlow = vscode.commands.registerCommand('neomono.toggleNeonDreams', () => glow.toggleGlow());

	const enableReactor = vscode.commands.registerCommand('neomono.enableReactorGlow', () => reactor.enableReactor());
	const disableReactor = vscode.commands.registerCommand('neomono.disableReactorGlow', () => reactor.disableReactor());
	const toggleReactor = vscode.commands.registerCommand('neomono.toggleReactorGlow', () => reactor.toggleReactor());

	context.subscriptions.push(
		enableGlow, disableGlow, toggleGlow,
		enableReactor, disableReactor, toggleReactor
	);
	reactor.activateReactor(context);
}

export function deactivate(): void {
	reactor.deactivateReactor();
}