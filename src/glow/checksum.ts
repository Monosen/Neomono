import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as crypto from 'crypto';
import { log } from '../logger';
import { resolveProductJsonPath } from './paths';

/**
 * SHA-256 of `filePath` in the same encoding VS Code uses for `product.json`
 * (base64 with trailing `=` padding stripped). Returns `null` if the file
 * cannot be read; callers should treat that as "skip this entry".
 */
export function computeChecksum(filePath: string): string | null {
	try {
		const content = fs.readFileSync(filePath);
		return crypto.createHash('sha256').update(content).digest('base64').replace(/=+$/, '');
	} catch (error) {
		log.warn(`Could not compute checksum for ${filePath}`, error);
		return null;
	}
}

/**
 * Resolve a `product.json` checksum entry to a real on-disk file, accounting
 * for the fact that VS Code stores some paths relative to `appRoot/out/`
 * (renderer assets) and others relative to `appRoot/` directly (top-level
 * scripts).
 */
export function resolveChecksumFilePath(appRoot: string, relativePath: string): string | null {
	const withOut = path.join(appRoot, 'out', relativePath);
	if (fs.existsSync(withOut)) {
		return withOut;
	}
	const direct = path.join(appRoot, relativePath);
	if (fs.existsSync(direct)) {
		return direct;
	}
	return null;
}

/**
 * Recompute the SHA-256 of every file referenced by `product.json#checksums`
 * and persist the new values back. Only entries whose actual checksum has
 * changed are touched, so this is a no-op when the patch is already in sync.
 *
 * @returns `true` if the file was either already up to date or was rewritten
 *          successfully; `false` if `product.json` is missing/unreadable or if
 *          the rewrite failed.
 */
export function fixChecksums(): boolean {
	const productJsonPath = resolveProductJsonPath();
	if (!productJsonPath) {
		return false;
	}

	let productJson: Record<string, unknown>;
	try {
		const raw = fs.readFileSync(productJsonPath, 'utf-8');
		productJson = JSON.parse(raw);
	} catch (error) {
		log.warn('Could not read or parse product.json', error);
		return false;
	}

	const checksums = productJson.checksums;
	if (!checksums || typeof checksums !== 'object') {
		return false;
	}

	const appRoot = vscode.env.appRoot;
	let changed = false;

	for (const [filePath, expectedChecksum] of Object.entries(checksums as Record<string, string>)) {
		const fullFilePath = resolveChecksumFilePath(appRoot, filePath);
		if (!fullFilePath) {
			continue;
		}

		const actualChecksum = computeChecksum(fullFilePath);
		if (actualChecksum && actualChecksum !== expectedChecksum) {
			(checksums as Record<string, string>)[filePath] = actualChecksum;
			changed = true;
		}
	}

	if (changed) {
		try {
			const json = JSON.stringify(productJson, null, '\t');
			fs.writeFileSync(productJsonPath, json, 'utf-8');
			return true;
		} catch (error) {
			log.warn('Could not write updated product.json checksums', error);
			return false;
		}
	}

	return true;
}
