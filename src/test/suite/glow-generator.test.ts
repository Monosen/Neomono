import * as assert from 'assert';
import {
	generateGlowJs,
	isGlowPatched,
	MARKER_REGEX,
	START_MARKER,
	END_MARKER
} from '../../glow';

suite('generateGlowJs — alpha encoding', () => {
	test('brightness 0 produces alpha 00', () => {
		const js = generateGlowJs(false, 0);
		assert.ok(js.includes('#bd93f900'),
			'Expected #bd93f900 in generated JS at brightness 0');
	});

	test('brightness 1 produces alpha FF', () => {
		const js = generateGlowJs(false, 1);
		assert.ok(js.includes('#bd93f9FF'),
			'Expected #bd93f9FF in generated JS at brightness 1');
	});

	test('brightness 0.5 produces alpha 7F', () => {
		const js = generateGlowJs(false, 0.5);
		// Math.floor(0.5 * 255) = 127 = 0x7F
		assert.ok(js.includes('#bd93f97F'),
			'Expected alpha 7F at brightness 0.5');
	});

	test('brightness > 1 is clamped to FF', () => {
		const js = generateGlowJs(false, 99);
		assert.ok(js.includes('#bd93f9FF'), 'Should clamp to FF');
		assert.ok(!/#bd93f9(?!FF)[0-9A-F]{2}/.test(js.replace(/#bd93f9FF/g, '')),
			'Should not produce alpha values beyond FF');
	});

	test('brightness < 0 is clamped to 00', () => {
		const js = generateGlowJs(false, -1);
		assert.ok(js.includes('#bd93f900'), 'Should clamp to 00');
	});
});

suite('generateGlowJs — DISABLE_GLOW flag', () => {
	test('disableGlow=false sets flag to false in generated JS', () => {
		const js = generateGlowJs(false, 0.5);
		assert.ok(/DISABLE_GLOW = false;/.test(js));
	});

	test('disableGlow=true sets flag to true in generated JS', () => {
		const js = generateGlowJs(true, 0.5);
		assert.ok(/DISABLE_GLOW = true;/.test(js));
	});
});

suite('generateGlowJs — token map coverage', () => {
	test('includes both Neomono and Neomono Deep theme names', () => {
		const js = generateGlowJs(false, 0.5);
		assert.ok(js.includes("'Neomono'"));
		assert.ok(js.includes("'Neomono Deep'"));
	});

	test('includes all standard Neomono accent colors as keys', () => {
		const js = generateGlowJs(false, 0.5);
		const expectedKeys = ['#bd93f9', '#8be9fd', '#ff79c6', '#50fa7b', '#ff5555', '#f1fa8c', '#ffb86c'];
		for (const color of expectedKeys) {
			assert.ok(js.includes(`"${color}":`), `Expected color key "${color}" in TOKEN_REPLACEMENTS JSON`);
		}
	});

	test('includes all Neomono Deep accent colors as keys', () => {
		const js = generateGlowJs(false, 0.5);
		const expectedKeys = ['#a576e0', '#6dd0e8', '#e85aa8', '#3dd660', '#e04040', '#d8e070', '#e8a070', '#e89e50'];
		for (const color of expectedKeys) {
			assert.ok(js.includes(`"${color}":`), `Expected color key "${color}" in TOKEN_REPLACEMENTS JSON`);
		}
	});

	test('output is wrapped as IIFE', () => {
		const js = generateGlowJs(false, 0.5);
		assert.ok(/\(function\s*\(\)\s*\{/.test(js), 'Should start with IIFE');
		assert.ok(js.trimEnd().endsWith('})();'));
	});

	test('does not contain unresolved [ALPHA] placeholders', () => {
		const js = generateGlowJs(false, 0.42);
		assert.ok(!js.includes('[ALPHA]'), 'All alpha placeholders should be substituted');
	});

	test('does not contain unresolved build-time placeholders', () => {
		const js = generateGlowJs(false, 0.5);
		assert.ok(!/__[A-Z_]+__/.test(js),
			'No __FOO__ build-time placeholders should remain in the output');
	});

	test('contains the double-injection guard', () => {
		const js = generateGlowJs(false, 0.5);
		assert.ok(js.includes('__neomonoGlowInstalled__'),
			'Runtime should set a global flag to prevent double injection');
	});
});

suite('isGlowPatched and MARKER_REGEX', () => {
	test('returns true when start marker is present', () => {
		const html = `<html><body></body>${START_MARKER}<script></script>${END_MARKER}</html>`;
		assert.strictEqual(isGlowPatched(html), true);
	});

	test('returns false on a clean workbench.html', () => {
		const html = '<html><body></body></html>';
		assert.strictEqual(isGlowPatched(html), false);
	});

	test('MARKER_REGEX strips a single patch cleanly', () => {
		const html = `<html><body></body>\n  ${START_MARKER}<script src="x"></script>${END_MARKER}\n</html>`;
		const cleaned = html.replace(MARKER_REGEX, '');
		assert.ok(!cleaned.includes(START_MARKER));
		assert.ok(!cleaned.includes(END_MARKER));
		assert.ok(cleaned.includes('<body></body>'));
		assert.ok(cleaned.includes('</html>'));
	});

	test('MARKER_REGEX strips multiple patches without being greedy across them', () => {
		const html = [
			'<html><body>x</body>',
			`${START_MARKER}<script src="a"></script>${END_MARKER}`,
			'<p>middle</p>',
			`${START_MARKER}<script src="b"></script>${END_MARKER}`,
			'</html>'
		].join('\n');
		const cleaned = html.replace(MARKER_REGEX, '');
		assert.ok(!cleaned.includes(START_MARKER));
		assert.ok(!cleaned.includes(END_MARKER));
		assert.ok(cleaned.includes('<p>middle</p>'),
			'Content between two patches must be preserved (regex must not be greedy across patches)');
	});
});
