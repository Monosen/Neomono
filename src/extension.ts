import * as vscode from 'vscode';
import * as glow from './glow';
import * as reactor from './reactor';
import { log } from './logger';

/** globalState key persisting whether we already showed the opt-in prompt. */
export const REACTOR_PROMPT_SHOWN_KEY = 'neomono.reactorPromptShown';
/** Themes that count as "user is using Neomono" for prompt purposes. */
export const SUPPORTED_THEMES = ['Neomono', 'Neomono Deep', 'Neomono HC'] as const;

/**
 * Entry point. Registers commands and wires the Reactor + Glow listeners.
 * Each subsystem activation is wrapped so a failure in one doesn't disable
 * the rest of the extension.
 */
export function activate(context: vscode.ExtensionContext): void {
	log.info('Neomono activating...');

	const enableGlow = vscode.commands.registerCommand('neomono.enableNeonDreams', () => glow.enableGlow());
	const disableGlow = vscode.commands.registerCommand('neomono.disableNeonDreams', () => glow.disableGlow());
	const toggleGlow = vscode.commands.registerCommand('neomono.toggleNeonDreams', () => glow.toggleGlow());

	const enableReactor = vscode.commands.registerCommand('neomono.enableReactorGlow', () => reactor.enableReactor());
	const disableReactor = vscode.commands.registerCommand('neomono.disableReactorGlow', () => reactor.disableReactor());
	const toggleReactor = vscode.commands.registerCommand('neomono.toggleReactorGlow', () => reactor.toggleReactor());
	const resetReactor = vscode.commands.registerCommand('neomono.resetReactorCustomizations', () => reactor.resetReactorCustomizations());

	context.subscriptions.push(
		enableGlow, disableGlow, toggleGlow,
		enableReactor, disableReactor, toggleReactor, resetReactor
	);

	try {
		reactor.activateReactor(context);
	} catch (error) {
		log.error('Reactor activation failed', error);
	}

	try {
		glow.activateGlow(context);
	} catch (error) {
		log.error('Glow activation failed', error);
	}

	void maybePromptReactorOptIn(context);

	log.info('Neomono activated.');
}

/**
 * The first time the user is using a Neomono theme and Reactor Glow is still
 * at its opt-in default (disabled), surface a single notification offering to
 * turn it on. We persist a flag in globalState so we never bother the user twice.
 *
 * Exported so tests can drive it with a stubbed `globalState`, a stubbed
 * `vscode.window.showInformationMessage`, and a fake `onAccept` callback.
 *
 * @param context The active `ExtensionContext`. Only `globalState` is used.
 * @param onAccept Invoked when the user clicks "Enable Reactor Glow" in the
 *                 notification. Defaults to {@link reactor.enableReactor} in
 *                 production; tests pass a spy.
 */
export async function maybePromptReactorOptIn(
	context: vscode.ExtensionContext,
	onAccept: () => Promise<void> = () => reactor.enableReactor()
): Promise<void> {
	if (context.globalState.get<boolean>(REACTOR_PROMPT_SHOWN_KEY)) {
		return;
	}

	const activeTheme = vscode.workspace.getConfiguration('workbench').get<string>('colorTheme', '');
	if (!SUPPORTED_THEMES.includes(activeTheme as typeof SUPPORTED_THEMES[number])) {
		// Don't prompt on installs where another theme is in use.
		return;
	}

	const reactorEnabled = vscode.workspace.getConfiguration('neomono.reactor').get<boolean>('enabled', false);
	if (reactorEnabled) {
		// User explicitly enabled it already (or upgraded from an older version
		// where it was on by default) — no need to ask.
		await context.globalState.update(REACTOR_PROMPT_SHOWN_KEY, true);
		return;
	}

	const enableLabel = vscode.l10n.t('reactor.prompt.enable');
	const dismissLabel = vscode.l10n.t('reactor.prompt.notNow');
	const message = vscode.l10n.t('reactor.prompt.message');

	const choice = await vscode.window.showInformationMessage(message, enableLabel, dismissLabel);
	await context.globalState.update(REACTOR_PROMPT_SHOWN_KEY, true);

	if (choice === enableLabel) {
		await onAccept();
	}
}

export function deactivate(): void {
	try {
		reactor.deactivateReactor();
	} catch (error) {
		log.error('Reactor deactivation failed', error);
	}
	log.dispose();
}
