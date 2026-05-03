import * as assert from 'assert';
import * as path from 'path';
import * as fs from 'fs';
import * as glow from '../../glow';
import { PROJECT_ROOT } from './_helpers';

// Note: full integration tests that modify VS Code files require elevated
// permissions. We test what we can without side effects.

suite('Glow Module Structure Tests', () => {
	test('should export enableGlow function', () => {
		assert.strictEqual(typeof glow.enableGlow, 'function');
	});

	test('should export disableGlow function', () => {
		assert.strictEqual(typeof glow.disableGlow, 'function');
	});

	test('should export toggleGlow function', () => {
		assert.strictEqual(typeof glow.toggleGlow, 'function');
	});

	test('should export activateGlow function', () => {
		assert.strictEqual(typeof glow.activateGlow, 'function');
	});

	test('activateGlow registers a config-change subscription on the context', async () => {
		const subscriptions: { dispose(): void }[] = [];
		const fakeContext = {
			subscriptions
		} as unknown as import('vscode').ExtensionContext;

		glow.activateGlow(fakeContext);

		assert.ok(subscriptions.length >= 1,
			'activateGlow should push at least one disposable to context.subscriptions');
		assert.strictEqual(typeof subscriptions[0].dispose, 'function',
			'pushed item should be a Disposable');

		// Clean up so the subscription doesn't leak across other tests
		for (const sub of subscriptions) {
			sub.dispose();
		}
	});
});

suite('Glow CSS Files Tests', () => {
	test('neomono-glow.css should exist', () => {
		const glowPath = path.join(PROJECT_ROOT, 'themes', 'neomono-glow.css');
		assert.ok(fs.existsSync(glowPath), 'neomono-glow.css should exist');
	});

	test('neomono-deep-glow.css should exist', () => {
		const glowPath = path.join(PROJECT_ROOT, 'themes', 'neomono-deep-glow.css');
		assert.ok(fs.existsSync(glowPath), 'neomono-deep-glow.css should exist');
	});

	test('neomono-glow.css should be scoped to Neomono theme', () => {
		const glowPath = path.join(PROJECT_ROOT, 'themes', 'neomono-glow.css');
		const content = fs.readFileSync(glowPath, 'utf8');
		assert.ok(content.includes('[data-vscode-theme-name="Neomono"]'),
			'Should be scoped to Neomono theme exactly');
	});

	test('neomono-deep-glow.css should be scoped to Neomono Deep theme', () => {
		const glowPath = path.join(PROJECT_ROOT, 'themes', 'neomono-deep-glow.css');
		const content = fs.readFileSync(glowPath, 'utf8');
		assert.ok(content.includes('[data-vscode-theme-name="Neomono Deep"]'),
			'Should be scoped to Neomono Deep theme exactly');
	});

	test('glow CSS files should have matching structure', () => {
		const standardPath = path.join(PROJECT_ROOT, 'themes', 'neomono-glow.css');
		const deepPath = path.join(PROJECT_ROOT, 'themes', 'neomono-deep-glow.css');

		const standardContent = fs.readFileSync(standardPath, 'utf8');
		const deepContent = fs.readFileSync(deepPath, 'utf8');

		const standardClasses = (standardContent.match(/\.mtk\d+/g) || []).sort();
		const deepClasses = (deepContent.match(/\.mtk\d+/g) || []).sort();

		assert.deepStrictEqual(standardClasses, deepClasses,
			'Both glow files should style the same token classes');
	});
});

suite('Theme Files Tests', () => {
	test('Neomono theme JSON should exist and be valid', () => {
		const themePath = path.join(PROJECT_ROOT, 'themes', 'Neomono-color-theme.json');
		assert.ok(fs.existsSync(themePath), 'Theme file should exist');

		const theme = JSON.parse(fs.readFileSync(themePath, 'utf8'));
		assert.strictEqual(theme.name, 'Neomono', 'Should have correct name');
		assert.ok(theme.colors, 'Should have colors object');
		assert.ok(Array.isArray(theme.tokenColors), 'Should have tokenColors array');
	});

	test('Neomono Deep theme JSON should exist and be valid', () => {
		const themePath = path.join(PROJECT_ROOT, 'themes', 'Neomono-Deep-color-theme.json');
		assert.ok(fs.existsSync(themePath), 'Deep theme file should exist');

		const theme = JSON.parse(fs.readFileSync(themePath, 'utf8'));
		assert.strictEqual(theme.name, 'Neomono Deep', 'Should have correct name');
		assert.ok(theme.colors, 'Should have colors object');
		assert.ok(Array.isArray(theme.tokenColors), 'Should have tokenColors array');
	});

	test('Both themes should have same structure', () => {
		const standardPath = path.join(PROJECT_ROOT, 'themes', 'Neomono-color-theme.json');
		const deepPath = path.join(PROJECT_ROOT, 'themes', 'Neomono-Deep-color-theme.json');

		const standard = JSON.parse(fs.readFileSync(standardPath, 'utf8'));
		const deep = JSON.parse(fs.readFileSync(deepPath, 'utf8'));

		const standardColorKeys = Object.keys(standard.colors).sort();
		const deepColorKeys = Object.keys(deep.colors).sort();

		assert.deepStrictEqual(standardColorKeys, deepColorKeys,
			'Both themes should define the same workbench colors');

		assert.strictEqual(standard.tokenColors.length, deep.tokenColors.length,
			'Both themes should have same number of token colors');
	});
});
