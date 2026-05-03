/**
 * HTML marker constants and detection helpers for the Neon Dreams patch.
 *
 * The patcher wraps its injected `<script>` tag with these comments so it can
 * later be located and stripped without touching anything else in the file.
 */

/** HTML comment marker we wrap our injected `<script>` with. */
export const START_MARKER = '<!-- NEOMONO-GLOW-START -->';

/** Closing counterpart of {@link START_MARKER}. */
export const END_MARKER = '<!-- NEOMONO-GLOW-END -->';

/** Filename of the runtime JS we drop next to `workbench.html`. */
export const RUNTIME_FILENAME = 'neomono-glow.js';

/** The exact `<script>` tag we inject into `workbench.html`. */
export const SCRIPT_TAG = `${START_MARKER}<script src="${RUNTIME_FILENAME}"></script>${END_MARKER}`;

/**
 * Matches a single Neomono patch (start marker through end marker, including any
 * preceding whitespace) anywhere in `workbench.html`. Non-greedy so that multiple
 * patches in the same file are removed individually instead of swallowing
 * everything between them.
 */
export const MARKER_REGEX = /\s*<!-- NEOMONO-GLOW-START -->.*?<!-- NEOMONO-GLOW-END -->/gs;

/**
 * Returns `true` when the given `workbench.html` content already contains a
 * Neomono Glow patch (i.e. our START_MARKER is present). Useful as a guard
 * before deciding whether to enable, disable, or refresh the patch.
 */
export function isGlowPatched(htmlContent: string): boolean {
	return htmlContent.includes(START_MARKER);
}
