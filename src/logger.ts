import * as vscode from 'vscode';

/**
 * Centralised logger backed by a dedicated VS Code OutputChannel.
 *
 * - Use {@link log.info}, {@link log.warn}, {@link log.error} from anywhere.
 * - Channel name: "Neomono". Users can open it from `Output` view → channel
 *   dropdown → "Neomono", and copy/paste it into bug reports.
 * - The channel is created lazily on first use so module imports stay cheap.
 * - Errors printed via {@link log.error} also include the stack when available.
 */

let channel: vscode.OutputChannel | undefined;

function getChannel(): vscode.OutputChannel {
	if (!channel) {
		channel = vscode.window.createOutputChannel('Neomono');
	}
	return channel;
}

function timestamp(): string {
	const d = new Date();
	const pad = (n: number, w = 2) => String(n).padStart(w, '0');
	return (
		`${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}` +
		`.${pad(d.getMilliseconds(), 3)}`
	);
}

function format(level: string, message: string): string {
	return `[${timestamp()}] [${level}] ${message}`;
}

function appendError(error: unknown): void {
	if (error instanceof Error) {
		getChannel().appendLine(`  ${error.name}: ${error.message}`);
		if (error.stack) {
			getChannel().appendLine(error.stack);
		}
	} else {
		getChannel().appendLine(`  ${String(error)}`);
	}
}

export const log = {
	info(message: string): void {
		getChannel().appendLine(format('info', message));
	},

	warn(message: string, error?: unknown): void {
		getChannel().appendLine(format('warn', message));
		if (error !== undefined) {
			appendError(error);
		}
	},

	error(message: string, error?: unknown): void {
		getChannel().appendLine(format('error', message));
		if (error !== undefined) {
			appendError(error);
		}
	},

	/** Show the OutputChannel without stealing focus. Used by error notifications. */
	show(): void {
		getChannel().show(true);
	},

	/** Dispose the underlying channel. Called from the extension's deactivate(). */
	dispose(): void {
		channel?.dispose();
		channel = undefined;
	}
};
