import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { RUNTIME_FILENAME } from './markers';

/** Resolved on-disk locations of the patch target files. */
export interface WorkbenchPaths {
	htmlFile: string;
	jsFile: string;
}

/**
 * Locate `workbench.html` (or `workbench.esm.html`) inside the active VS Code
 * installation. The exact path varies by VS Code version, OS and whether VS
 * Code is using the legacy electron-browser renderer or the newer
 * electron-sandbox one, so we probe a small list of known candidates.
 *
 * @returns The HTML and JS paths if a candidate exists on disk, or `null` if
 *          no known layout matches (typically a future VS Code version).
 */
export function resolveWorkbenchPaths(): WorkbenchPaths | null {
	const appRoot = vscode.env.appRoot;
	const base = path.join(appRoot, 'out', 'vs', 'code');

	const electronBaseCandidates = [
		'electron-sandbox',
		'electron-browser'
	];

	const htmlCandidates = [
		'workbench.esm.html',
		'workbench.html'
	];

	for (const electronBase of electronBaseCandidates) {
		for (const htmlFile of htmlCandidates) {
			const fullPath = path.join(base, electronBase, 'workbench', htmlFile);
			if (fs.existsSync(fullPath)) {
				return {
					htmlFile: fullPath,
					jsFile: path.join(base, electronBase, 'workbench', RUNTIME_FILENAME)
				};
			}
		}
	}

	return null;
}

/**
 * Path to VS Code's `product.json` if it exists. We touch it from the checksum
 * fixer to suppress the "installation appears to be corrupt" warning after the
 * patch.
 */
export function resolveProductJsonPath(): string | null {
	const appRoot = vscode.env.appRoot;
	const productJsonPath = path.join(appRoot, 'product.json');
	return fs.existsSync(productJsonPath) ? productJsonPath : null;
}
