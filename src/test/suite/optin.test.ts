import * as assert from 'assert';
import * as vscode from 'vscode';
import {
	maybePromptReactorOptIn,
	REACTOR_PROMPT_SHOWN_KEY,
	SUPPORTED_THEMES
} from '../../extension';

/**
 * Tests for the Reactor Glow opt-in prompt (extension.ts → maybePromptReactorOptIn).
 *
 * We stub:
 *  - `context.globalState` with an in-memory Map-backed fake.
 *  - `vscode.workspace.getConfiguration` to return whatever theme / reactor.enabled
 *    each test wants without writing to user settings.
 *  - `vscode.window.showInformationMessage` to capture the call and return a
 *    pre-programmed answer.
 *  - `onAccept` (the second argument of `maybePromptReactorOptIn`) with a spy,
 *    so we never invoke the real `reactor.enableReactor`.
 */

interface FakeMemento extends vscode.Memento {
	readonly __store: Map<string, unknown>;
}

function makeFakeGlobalState(): FakeMemento {
	const store = new Map<string, unknown>();
	const memento = {
		__store: store,
		keys(): readonly string[] {
			return Array.from(store.keys());
		},
		get<T>(key: string, defaultValue?: T): T | undefined {
			return store.has(key) ? (store.get(key) as T) : defaultValue;
		},
		async update(key: string, value: unknown): Promise<void> {
			if (value === undefined) {
				store.delete(key);
			} else {
				store.set(key, value);
			}
		},
		setKeysForSync(_keys: readonly string[]): void {
			/* not used */
		}
	};
	return memento as unknown as FakeMemento;
}

function makeFakeContext(globalState: FakeMemento): vscode.ExtensionContext {
	return { globalState } as unknown as vscode.ExtensionContext;
}

interface ConfigStub {
	colorTheme: string;
	reactorEnabled: boolean;
}

function installConfigStub(stub: ConfigStub): () => void {
	const original = vscode.workspace.getConfiguration;
	const getConfig = ((section?: string) => {
		if (section === 'workbench') {
			return {
				get: <T>(key: string, def?: T) =>
					(key === 'colorTheme' ? (stub.colorTheme as unknown as T) : def)
			};
		}
		if (section === 'neomono.reactor') {
			return {
				get: <T>(key: string, def?: T) =>
					(key === 'enabled' ? (stub.reactorEnabled as unknown as T) : def)
			};
		}
		return original(section);
	}) as typeof vscode.workspace.getConfiguration;

	(vscode.workspace as unknown as { getConfiguration: typeof vscode.workspace.getConfiguration }).getConfiguration = getConfig;
	return () => {
		(vscode.workspace as unknown as { getConfiguration: typeof vscode.workspace.getConfiguration }).getConfiguration = original;
	};
}

interface NotificationSpy {
	calls: unknown[][];
	respondWith?: string | undefined;
	restore: () => void;
}

function installNotificationSpy(): NotificationSpy {
	const original = vscode.window.showInformationMessage;
	const spy: NotificationSpy = {
		calls: [],
		respondWith: undefined,
		restore: () => {
			(vscode.window as unknown as { showInformationMessage: typeof vscode.window.showInformationMessage }).showInformationMessage = original;
		}
	};
	(vscode.window as unknown as { showInformationMessage: unknown }).showInformationMessage =
		(...args: unknown[]) => {
			spy.calls.push(args);
			return Promise.resolve(spy.respondWith);
		};
	return spy;
}

suite('Reactor opt-in prompt', () => {
	let restoreConfig: (() => void) | undefined;
	let notif: NotificationSpy | undefined;

	teardown(() => {
		restoreConfig?.();
		restoreConfig = undefined;
		notif?.restore();
		notif = undefined;
	});

	test('does nothing if the prompt was already shown', async () => {
		const gs = makeFakeGlobalState();
		await gs.update(REACTOR_PROMPT_SHOWN_KEY, true);
		restoreConfig = installConfigStub({ colorTheme: SUPPORTED_THEMES[0], reactorEnabled: false });
		notif = installNotificationSpy();

		let acceptCalls = 0;
		await maybePromptReactorOptIn(makeFakeContext(gs), async () => { acceptCalls++; });

		assert.strictEqual(notif.calls.length, 0, 'should not show a notification');
		assert.strictEqual(acceptCalls, 0, 'should not call onAccept');
	});

	test('does nothing when the active theme is not a Neomono theme', async () => {
		const gs = makeFakeGlobalState();
		restoreConfig = installConfigStub({ colorTheme: 'Default Dark+', reactorEnabled: false });
		notif = installNotificationSpy();

		let acceptCalls = 0;
		await maybePromptReactorOptIn(makeFakeContext(gs), async () => { acceptCalls++; });

		assert.strictEqual(notif.calls.length, 0);
		assert.strictEqual(acceptCalls, 0);
		assert.strictEqual(
			gs.get(REACTOR_PROMPT_SHOWN_KEY),
			undefined,
			'should NOT mark the prompt as shown when we silently bail on theme mismatch'
		);
	});

	test('marks the prompt as shown without prompting if Reactor is already enabled', async () => {
		const gs = makeFakeGlobalState();
		restoreConfig = installConfigStub({ colorTheme: 'Neomono Deep', reactorEnabled: true });
		notif = installNotificationSpy();

		let acceptCalls = 0;
		await maybePromptReactorOptIn(makeFakeContext(gs), async () => { acceptCalls++; });

		assert.strictEqual(notif.calls.length, 0, 'should not prompt when already enabled');
		assert.strictEqual(acceptCalls, 0);
		assert.strictEqual(
			gs.get(REACTOR_PROMPT_SHOWN_KEY),
			true,
			'should still set the flag so the prompt never appears later'
		);
	});

	test('shows the prompt and calls onAccept when the user clicks Enable', async () => {
		const gs = makeFakeGlobalState();
		restoreConfig = installConfigStub({ colorTheme: 'Neomono', reactorEnabled: false });
		notif = installNotificationSpy();
		notif.respondWith = vscode.l10n.t('reactor.prompt.enable');

		let acceptCalls = 0;
		await maybePromptReactorOptIn(makeFakeContext(gs), async () => { acceptCalls++; });

		assert.strictEqual(notif.calls.length, 1, 'expected exactly one notification');
		assert.strictEqual(acceptCalls, 1, 'onAccept should be invoked exactly once');
		assert.strictEqual(gs.get(REACTOR_PROMPT_SHOWN_KEY), true);
	});

	test('shows the prompt and does NOT call onAccept when the user dismisses', async () => {
		const gs = makeFakeGlobalState();
		restoreConfig = installConfigStub({ colorTheme: 'Neomono', reactorEnabled: false });
		notif = installNotificationSpy();
		notif.respondWith = vscode.l10n.t('reactor.prompt.notNow');

		let acceptCalls = 0;
		await maybePromptReactorOptIn(makeFakeContext(gs), async () => { acceptCalls++; });

		assert.strictEqual(notif.calls.length, 1);
		assert.strictEqual(acceptCalls, 0);
		assert.strictEqual(
			gs.get(REACTOR_PROMPT_SHOWN_KEY),
			true,
			'flag must be set even on dismissal so we never re-prompt'
		);
	});

	test('does not call onAccept when the notification is dismissed via Escape (undefined)', async () => {
		const gs = makeFakeGlobalState();
		restoreConfig = installConfigStub({ colorTheme: 'Neomono', reactorEnabled: false });
		notif = installNotificationSpy();
		notif.respondWith = undefined; // user closed without picking

		let acceptCalls = 0;
		await maybePromptReactorOptIn(makeFakeContext(gs), async () => { acceptCalls++; });

		assert.strictEqual(acceptCalls, 0);
		assert.strictEqual(gs.get(REACTOR_PROMPT_SHOWN_KEY), true);
	});

	test('passes the localised message and both labels to showInformationMessage', async () => {
		const gs = makeFakeGlobalState();
		restoreConfig = installConfigStub({ colorTheme: 'Neomono', reactorEnabled: false });
		notif = installNotificationSpy();

		await maybePromptReactorOptIn(makeFakeContext(gs), async () => { /* noop */ });

		const [message, ...buttons] = notif.calls[0];
		assert.strictEqual(typeof message, 'string');
		assert.ok((message as string).length > 0);
		assert.deepStrictEqual(buttons, [
			vscode.l10n.t('reactor.prompt.enable'),
			vscode.l10n.t('reactor.prompt.notNow')
		]);
	});
});
