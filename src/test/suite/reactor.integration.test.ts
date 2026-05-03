import * as assert from 'assert';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as vscode from 'vscode';
import {
	activateReactor,
	deactivateReactor,
	resetReactorCustomizations,
	MANAGED_COLOR_KEYS,
	SUPPORTED_THEME_NAMES
} from '../../reactor';

/**
 * Integration tests for Reactor Glow.
 *
 * These tests drive the full subscription pipeline (`activateReactor` → diagnostic
 * collection → debounce → `workbench.colorCustomizations.update`) inside the real
 * VS Code Test runner, against a temporary user-data directory provided by
 * `@vscode/test-electron`. They are intentionally tolerant on timings and always
 * clean up the user settings they touch.
 */

// Internal helper: wait long enough for `scheduleRefresh` (debounce 150 ms) +
// VS Code's async settings write to land. Polls until a predicate is satisfied
// to avoid flakiness on slower CI runners.
async function waitFor<T>(
	predicate: () => T | undefined,
	{ timeoutMs = 5000, intervalMs = 100 }: { timeoutMs?: number; intervalMs?: number } = {}
): Promise<T> {
	const start = Date.now();
	while (Date.now() - start < timeoutMs) {
		const result = predicate();
		if (result !== undefined && result !== false) {
			return result as T;
		}
		await new Promise((resolve) => setTimeout(resolve, intervalMs));
	}
	throw new Error(`waitFor timed out after ${timeoutMs}ms`);
}

function makeFakeContext(): vscode.ExtensionContext {
	const subs: vscode.Disposable[] = [];
	return {
		subscriptions: subs,
		dispose: () => subs.forEach((d) => { try { d.dispose(); } catch { /* noop */ } })
	} as unknown as vscode.ExtensionContext;
}

function readScopedCustomizations(): Record<string, unknown> | undefined {
	const cust = vscode.workspace.getConfiguration('workbench').get<Record<string, unknown>>('colorCustomizations', {});
	const scoped = cust[`[${SUPPORTED_THEME_NAMES[0]}]`];
	return (scoped && typeof scoped === 'object') ? (scoped as Record<string, unknown>) : undefined;
}

suite('Reactor Glow integration', function () {
	this.timeout(20000);

	let context: vscode.ExtensionContext & { dispose: () => void };
	let diagCollection: vscode.DiagnosticCollection;
	let originalTheme: string | undefined;
	let tmpFile: string;
	let tmpUri: vscode.Uri;

	suiteSetup(async function () {
		this.timeout(20000);

		// Snapshot user state we are about to mutate so we can restore it.
		originalTheme = vscode.workspace.getConfiguration('workbench').get<string>('colorTheme');

		// Force the active theme to "Neomono" so refreshReactorState produces
		// non-normal states. (refreshReactorState short-circuits to 'normal' if
		// the active theme is not in SUPPORTED_THEME_NAMES.)
		await vscode.workspace.getConfiguration('workbench').update(
			'colorTheme',
			SUPPORTED_THEME_NAMES[0],
			vscode.ConfigurationTarget.Global
		);

		// Enable Reactor (it's opt-in by default after M4).
		await vscode.workspace.getConfiguration('neomono.reactor').update(
			'enabled', true, vscode.ConfigurationTarget.Global
		);

		// Clean any pre-existing managed customizations from previous runs.
		await resetReactorCustomizations();

		// Activate Reactor with a fake context that we control disposal of.
		context = makeFakeContext() as typeof context;
		diagCollection = vscode.languages.createDiagnosticCollection('neomono-integration-test');

		// Open a real file so getActiveEditorDiagnostics() has a uri to query.
		tmpFile = path.join(os.tmpdir(), `neomono-reactor-${Date.now()}.ts`);
		fs.writeFileSync(tmpFile, 'export const sample = 1;\n', 'utf8');
		tmpUri = vscode.Uri.file(tmpFile);
		const doc = await vscode.workspace.openTextDocument(tmpUri);
		await vscode.window.showTextDocument(doc);

		activateReactor(context);
	});

	suiteTeardown(async function () {
		this.timeout(20000);

		try { diagCollection?.dispose(); } catch { /* noop */ }
		try { deactivateReactor(); } catch { /* noop */ }
		try { context?.dispose(); } catch { /* noop */ }

		await resetReactorCustomizations().catch(() => { /* noop */ });

		await vscode.workspace.getConfiguration('neomono.reactor').update(
			'enabled', undefined, vscode.ConfigurationTarget.Global
		).then(undefined, () => { /* noop */ });

		await vscode.workspace.getConfiguration('workbench').update(
			'colorTheme', originalTheme, vscode.ConfigurationTarget.Global
		).then(undefined, () => { /* noop */ });

		try {
			await vscode.commands.executeCommand('workbench.action.closeActiveEditor');
		} catch { /* noop */ }

		try { if (fs.existsSync(tmpFile)) { fs.unlinkSync(tmpFile); } } catch { /* noop */ }
	});

	test('with no diagnostics, no managed keys are present in the [Neomono] scope', async function () {
		this.timeout(8000);

		diagCollection.clear();

		// Wait until either: the scoped block doesn't exist, or it exists but
		// contains none of our managed keys.
		await waitFor(() => {
			const scoped = readScopedCustomizations();
			if (!scoped) {
				return true;
			}
			return MANAGED_COLOR_KEYS.every((key) => scoped[key] === undefined);
		});
	});

	test('with an error diagnostic on the active editor, error overrides land in [Neomono]', async function () {
		this.timeout(15000);

		diagCollection.set(tmpUri, [
			new vscode.Diagnostic(
				new vscode.Range(0, 0, 0, 5),
				'fake error from integration test',
				vscode.DiagnosticSeverity.Error
			)
		]);

		const scoped = await waitFor(() => {
			const s = readScopedCustomizations();
			return s && typeof s['statusBar.background'] === 'string' ? s : undefined;
		}, { timeoutMs: 8000 });

		assert.match(
			scoped['statusBar.background'] as string,
			/^#[0-9a-fA-F]{6,8}$/,
			'statusBar.background should be a hex color in error state'
		);
		// editorError.foreground should also exist with the affectEditorDiagnostics default.
		if (typeof scoped['editorError.foreground'] === 'string') {
			assert.match(scoped['editorError.foreground'] as string, /^#[0-9a-fA-F]{6,8}$/);
		}
	});

	test('clearing diagnostics rolls back the scoped overrides to the normal state', async function () {
		this.timeout(15000);

		diagCollection.set(tmpUri, [
			new vscode.Diagnostic(
				new vscode.Range(0, 0, 0, 5),
				'fake warning from integration test',
				vscode.DiagnosticSeverity.Warning
			)
		]);
		await waitFor(() => {
			const s = readScopedCustomizations();
			return s && typeof s['statusBar.background'] === 'string' ? s : undefined;
		}, { timeoutMs: 8000 });

		diagCollection.clear();

		await waitFor(() => {
			const scoped = readScopedCustomizations();
			if (!scoped) {
				return true;
			}
			return MANAGED_COLOR_KEYS.every((key) => scoped[key] === undefined);
		}, { timeoutMs: 8000 });
	});
});
