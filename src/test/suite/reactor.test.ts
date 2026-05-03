import * as assert from 'assert';
import * as vscode from 'vscode';
import * as reactor from '../../reactor';

suite('Reactor Module Tests', () => {
	test('should export activateReactor function', () => {
		assert.strictEqual(typeof reactor.activateReactor, 'function');
	});

	test('should export deactivateReactor function', () => {
		assert.strictEqual(typeof reactor.deactivateReactor, 'function');
	});

	test('should export supported theme names', () => {
		assert.deepStrictEqual(reactor.SUPPORTED_THEME_NAMES, ['Neomono', 'Neomono Deep']);
	});

	test('should export enableReactor function', () => {
		assert.strictEqual(typeof reactor.enableReactor, 'function');
	});

	test('should export disableReactor function', () => {
		assert.strictEqual(typeof reactor.disableReactor, 'function');
	});

	test('should export toggleReactor function', () => {
		assert.strictEqual(typeof reactor.toggleReactor, 'function');
	});
});

suite('Reactor State Resolution', () => {
	test('returns normal without diagnostics or debug session', () => {
		const state = reactor.getReactorState(false, []);
		assert.strictEqual(state, 'normal');
	});

	test('returns error when file has errors', () => {
		const state = reactor.getReactorState(false, [
			{ severity: vscode.DiagnosticSeverity.Error }
		]);
		assert.strictEqual(state, 'error');
	});

	test('returns warning when file has only warnings', () => {
		const state = reactor.getReactorState(false, [
			{ severity: vscode.DiagnosticSeverity.Warning }
		]);
		assert.strictEqual(state, 'warning');
	});

	test('prioritizes debug over diagnostics', () => {
		const state = reactor.getReactorState(true, [
			{ severity: vscode.DiagnosticSeverity.Error },
			{ severity: vscode.DiagnosticSeverity.Warning }
		]);
		assert.strictEqual(state, 'debug');
	});
});

suite('Reactor Color Customizations', () => {
	const enabledConfig: reactor.ReactorConfig = {
		enabled: true,
		intensity: 'moderate',
		affectedElements: {
			statusBar: true,
			activityBar: true,
			titleBar: true,
			panelTitle: true,
			editorDiagnostics: true,
			editorBackground: false,
			tabActiveBorder: true
		}
	};

	test('creates debug overrides for Neomono', () => {
		const overrides = reactor.createManagedColorOverrides('Neomono', 'debug', enabledConfig);
		assert.strictEqual(overrides['statusBar.background'], '#8be9fd');
		assert.strictEqual(overrides['activityBar.border'], '#8be9fd');
		assert.strictEqual(overrides['debugToolBar.border'], '#8be9fd');
		assert.strictEqual(overrides['tab.activeBorder'], '#8be9fd');
		assert.strictEqual(overrides['editor.background'], undefined);
	});

	test('creates warning overrides for Neomono Deep', () => {
		const overrides = reactor.createManagedColorOverrides('Neomono Deep', 'warning', enabledConfig);
		assert.strictEqual(overrides['statusBar.background'], '#e89e50');
		assert.strictEqual(overrides['activityBar.border'], '#e89e50');
		assert.strictEqual(overrides['editorWarning.foreground'], '#f3ba82');
		assert.strictEqual(overrides['debugToolBar.border'], undefined);
	});

	test('returns no overrides when disabled', () => {
		const overrides = reactor.createManagedColorOverrides('Neomono', 'error', {
			...enabledConfig,
			enabled: false
		});
		assert.deepStrictEqual(overrides, {});
	});

	test('merges scoped overrides without removing unrelated customizations', () => {
		const merged = reactor.mergeReactorColorCustomizations(
			{
				'editorCursor.foreground': '#ffffff',
				'[Neomono]': {
					'activityBar.background': '#000000',
					'editorCursor.foreground': '#123456'
				}
			},
			'error',
			enabledConfig
		);

		assert.strictEqual(merged['editorCursor.foreground'], '#ffffff');
		assert.strictEqual((merged['[Neomono]'] as Record<string, string>)['editorCursor.foreground'], '#123456');
		assert.strictEqual((merged['[Neomono]'] as Record<string, string>)['statusBar.background'], '#ff5555');
		assert.strictEqual((merged['[Neomono Deep]'] as Record<string, string>)['statusBar.background'], '#e04040');
	});

	test('removes managed overrides when state goes back to normal', () => {
		const merged = reactor.mergeReactorColorCustomizations(
			{
				'[Neomono]': {
					'statusBar.background': '#ff5555',
					'editorCursor.foreground': '#123456'
				}
			},
			'normal',
			enabledConfig
		);

		assert.strictEqual((merged['[Neomono]'] as Record<string, string>)['statusBar.background'], undefined);
		assert.strictEqual((merged['[Neomono]'] as Record<string, string>)['editorCursor.foreground'], '#123456');
		assert.strictEqual(merged['[Neomono Deep]'], undefined);
	});

	test('computeResetCustomizations strips managed keys from scoped maps', () => {
		const next = reactor.computeResetCustomizations({
			'editor.background': '#000000',
			'[Neomono]': {
				'statusBar.background': '#ff5555',
				'editorCursor.foreground': '#ffffff'
			},
			'[Neomono Deep]': {
				'statusBar.background': '#e04040'
			}
		});

		assert.strictEqual(next['editor.background'], '#000000', 'unrelated keys preserved');
		assert.strictEqual(
			(next['[Neomono]'] as Record<string, string>)['statusBar.background'],
			undefined,
			'managed key removed from scoped map'
		);
		assert.strictEqual(
			(next['[Neomono]'] as Record<string, string>)['editorCursor.foreground'],
			'#ffffff',
			'unrelated scoped key preserved'
		);
		assert.strictEqual(next['[Neomono Deep]'], undefined,
			'now-empty scoped map removed entirely');
	});

	test('computeResetCustomizations is a no-op on customizations without Reactor keys', () => {
		const input = {
			'editor.background': '#1e1e1e',
			'[Default Dark+]': { 'statusBar.background': '#222222' }
		};
		const next = reactor.computeResetCustomizations(input);
		assert.deepStrictEqual(next, input);
	});

	test('adds editor background tint only when enabled', () => {
		const overrides = reactor.createManagedColorOverrides('Neomono', 'error', {
			...enabledConfig,
			affectedElements: {
				...enabledConfig.affectedElements,
				editorBackground: true
			}
		});

		assert.strictEqual(overrides['editor.background'], '#2d222a');
	});
});
