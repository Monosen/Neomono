/**
 * Public surface of the Glow subsystem.
 *
 * Internally split into:
 *   - markers.ts     — marker constants + `isGlowPatched`
 *   - maps.ts        — token-color → glow-CSS replacement maps
 *   - config.ts      — `neomono.neonDreams.*` reader
 *   - paths.ts       — workbench / product.json path resolution
 *   - checksum.ts    — SHA-256 fixer for product.json
 *   - template.ts    — runtime JS template loader + `generateGlowJs`
 *   - patcher.ts     — `enableGlow` / `disableGlow` / `toggleGlow` / `activateGlow`
 *
 * Consumers should `import * as glow from './glow'` (or named imports from
 * `'./glow'`) and never reach into the submodules — they're implementation
 * details that may move.
 */

export {
	START_MARKER,
	END_MARKER,
	MARKER_REGEX,
	SCRIPT_TAG,
	RUNTIME_FILENAME,
	isGlowPatched
} from './markers';

export type { GlowMap } from './maps';
export {
	NEOMONO_GLOW_MAP,
	NEOMONO_DEEP_GLOW_MAP,
	ALL_GLOW_REPLACEMENTS
} from './maps';

export type { NeonDreamsConfig } from './config';
export { getConfig } from './config';

export type { WorkbenchPaths } from './paths';
export { resolveWorkbenchPaths, resolveProductJsonPath } from './paths';

export {
	computeChecksum,
	resolveChecksumFilePath,
	fixChecksums
} from './checksum';

export {
	generateGlowJs,
	_resetTemplateCacheForTests
} from './template';

export {
	enableGlow,
	disableGlow,
	toggleGlow,
	activateGlow,
	cleanupCustomCssImports,
	_resetDebounceForTests
} from './patcher';
