import * as fs from 'fs';
import * as path from 'path';

/**
 * Walk up from `startDir` until a directory containing `package.json` is found.
 * Throws if the project root cannot be located before reaching the filesystem root.
 */
export function findProjectRoot(startDir: string): string {
	let current = startDir;
	while (current !== path.dirname(current)) {
		if (fs.existsSync(path.join(current, 'package.json'))) {
			return current;
		}
		current = path.dirname(current);
	}
	throw new Error('Could not find project root');
}

export const PROJECT_ROOT = findProjectRoot(__dirname);
