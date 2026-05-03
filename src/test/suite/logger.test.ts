import * as assert from 'assert';
import * as vscode from 'vscode';
import { log } from '../../logger';

/**
 * Tests for src/logger.ts.
 *
 * The logger module owns a singleton OutputChannel. We stub
 * `vscode.window.createOutputChannel` so we can capture every appended line
 * without touching the real Output panel. After each test we restore the
 * original creator and call `log.dispose()` to reset the module-local channel.
 */

interface FakeChannel extends vscode.OutputChannel {
	__lines: string[];
	__shows: number;
	__disposed: boolean;
}

function makeFakeChannel(name: string): FakeChannel {
	const lines: string[] = [];
	let shows = 0;
	let disposed = false;

	return {
		name,
		__lines: lines,
		get __shows() { return shows; },
		set __shows(v: number) { shows = v; },
		get __disposed() { return disposed; },
		set __disposed(v: boolean) { disposed = v; },
		append(value: string) { lines.push(value); },
		appendLine(value: string) { lines.push(value); },
		clear() { lines.length = 0; },
		// VS Code's signature is `show(preserveFocus?: boolean)` and
		// `show(column?: ViewColumn, preserveFocus?: boolean)` (deprecated).
		show(_columnOrPreserve?: vscode.ViewColumn | boolean, _preserveFocus?: boolean) {
			shows++;
		},
		hide() { /* noop */ },
		replace(value: string) { lines.length = 0; lines.push(value); },
		dispose() { disposed = true; }
	} as unknown as FakeChannel;
}

suite('Logger', () => {
	const origCreate = vscode.window.createOutputChannel;
	let createCalls: string[] = [];
	let lastChannel: FakeChannel | undefined;

	setup(() => {
		createCalls = [];
		lastChannel = undefined;

		(vscode.window as unknown as { createOutputChannel: unknown }).createOutputChannel = (name: string) => {
			createCalls.push(name);
			lastChannel = makeFakeChannel(name);
			return lastChannel;
		};
	});

	teardown(() => {
		log.dispose();
		(vscode.window as unknown as { createOutputChannel: unknown }).createOutputChannel = origCreate;
	});

	test('does not create the channel until the first log call (lazy init)', () => {
		assert.strictEqual(createCalls.length, 0, 'channel should not be created on import');
		log.info('hello');
		assert.deepStrictEqual(createCalls, ['Neomono']);
	});

	test('subsequent log calls reuse the same channel (single instance)', () => {
		log.info('one');
		log.warn('two');
		log.error('three');
		assert.strictEqual(createCalls.length, 1, 'channel should be created exactly once');
		assert.strictEqual(lastChannel!.__lines.length, 3);
	});

	test('formats lines as "[hh:mm:ss.mmm] [level] message"', () => {
		log.info('hello world');
		const line = lastChannel!.__lines[0];
		assert.match(
			line,
			/^\[\d{2}:\d{2}:\d{2}\.\d{3}\] \[info\] hello world$/,
			`unexpected format: ${line}`
		);
	});

	test('warn / error use their own level token', () => {
		log.warn('warning here');
		log.error('error here');
		assert.match(lastChannel!.__lines[0], /\[warn\] warning here$/);
		assert.match(lastChannel!.__lines[1], /\[error\] error here$/);
	});

	test('error with an Error instance appends "Name: message" and the stack', () => {
		const err = new Error('boom');
		log.error('failed', err);

		const lines = lastChannel!.__lines;
		assert.strictEqual(lines.length, 3, `expected 3 lines, got ${lines.length}: ${JSON.stringify(lines)}`);
		assert.match(lines[0], /\[error\] failed$/);
		assert.strictEqual(lines[1], '  Error: boom');
		assert.ok(lines[2].includes('Error: boom'), 'third line should be the stack');
	});

	test('error with a non-Error value coerces with String()', () => {
		log.error('failed', { code: 42 });
		const lines = lastChannel!.__lines;
		assert.strictEqual(lines.length, 2);
		assert.strictEqual(lines[1], '  [object Object]');
	});

	test('warn without an error argument does not add a second line', () => {
		log.warn('plain warning');
		assert.strictEqual(lastChannel!.__lines.length, 1);
	});

	test('show() forwards to OutputChannel.show(true) without focus', () => {
		log.info('init'); // force channel creation
		log.show();
		assert.strictEqual(lastChannel!.__shows, 1);
	});

	test('dispose() releases the channel and a later log creates a new one', () => {
		log.info('first');
		const firstChannel = lastChannel!;
		log.dispose();
		assert.strictEqual(firstChannel.__disposed, true, 'first channel should be disposed');

		log.info('second');
		assert.strictEqual(createCalls.length, 2, 'a new channel should be created after dispose');
		assert.notStrictEqual(lastChannel, firstChannel);
	});
});
