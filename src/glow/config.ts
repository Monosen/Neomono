import * as vscode from 'vscode';

/** Snapshot of the user's `neomono.neonDreams.*` settings at one point in time. */
export interface NeonDreamsConfig {
	brightness: number;
	glow: boolean;
	showNotifications: boolean;
}

/** Read the current `neomono.neonDreams.*` settings with safe defaults. */
export function getConfig(): NeonDreamsConfig {
	const config = vscode.workspace.getConfiguration('neomono.neonDreams');
	return {
		brightness: config.get<number>('brightness', 0.45),
		glow: config.get<boolean>('glow', true),
		showNotifications: config.get<boolean>('showNotifications', true)
	};
}
