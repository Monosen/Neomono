import * as vscode from 'vscode';
import { log } from './logger';

export const SUPPORTED_THEME_NAMES = ['Neomono', 'Neomono Deep', 'Neomono HC'] as const;
export type SupportedThemeName = (typeof SUPPORTED_THEME_NAMES)[number];
export type ReactorState = 'normal' | 'error' | 'warning' | 'debug';
export type ReactorIntensity = 'subtle' | 'moderate' | 'intense';

export interface ReactorConfig {
	enabled: boolean;
	intensity: ReactorIntensity;
	affectedElements: {
		statusBar: boolean;
		activityBar: boolean;
		titleBar: boolean;
		panelTitle: boolean;
		editorDiagnostics: boolean;
		editorBackground: boolean;
		tabActiveBorder: boolean;
	};
}

const COLOR_CUSTOMIZATIONS_KEY = 'colorCustomizations';
const DIAGNOSTIC_REFRESH_DELAY_MS = 150;
// Hex alpha used by the "intense" intensity to tint backgrounds with the state
// accent color (0x35 / 255 ≈ 21% opacity).
const INTENSE_BACKGROUND_ALPHA = '35';

export const MANAGED_COLOR_KEYS = [
	'statusBar.background',
	'statusBar.foreground',
	'statusBar.border',
	'statusBar.debuggingBackground',
	'statusBar.debuggingForeground',
	'activityBar.background',
	'activityBar.border',
	'titleBar.activeBackground',
	'panelTitle.activeBorder',
	'editorError.foreground',
	'editorWarning.foreground',
	'tab.activeBorder',
	'editor.background',
	'debugToolBar.background',
	'debugToolBar.border'
] as const;

type ManagedColorKey = (typeof MANAGED_COLOR_KEYS)[number];

interface ThemePalette {
	statusBarForeground: string;
	baseStatusBarBackground: string;
	baseStatusBarBorder: string;
	baseActivityBarBackground: string;
	baseTitleBarBackground: string;
	basePanelTitleBorder: string;
	baseEditorErrorForeground: string;
	baseEditorWarningForeground: string;
	baseTabActiveBorder: string;
	baseEditorBackground: string;
	error: string;
	warning: string;
	debug: string;
	errorActivityBackground: string;
	warningActivityBackground: string;
	debugActivityBackground: string;
	errorTitleBarBackground: string;
	warningTitleBarBackground: string;
	debugTitleBarBackground: string;
	errorEditorBackground: string;
	warningEditorBackground: string;
	debugEditorBackground: string;
	errorDiagnosticsForeground: string;
	warningDiagnosticsForeground: string;
	debugToolbarBackground: string;
	debugToolbarBorder: string;
}

const THEME_PALETTES: Record<SupportedThemeName, ThemePalette> = {
	Neomono: {
		statusBarForeground: '#282a36',
		baseStatusBarBackground: '#bd93f9',
		baseStatusBarBorder: '#bd93f9',
		baseActivityBarBackground: '#282a36',
		baseTitleBarBackground: '#1e1f29',
		basePanelTitleBorder: '#bd93f9',
		baseEditorErrorForeground: '#ff5555',
		baseEditorWarningForeground: '#ffb86c',
		baseTabActiveBorder: '#bd93f900',
		baseEditorBackground: '#282a36',
		error: '#ff5555',
		warning: '#ffb86c',
		debug: '#8be9fd',
		errorActivityBackground: '#ff555520',
		warningActivityBackground: '#ffb86c20',
		debugActivityBackground: '#8be9fd20',
		errorTitleBarBackground: '#ff555515',
		warningTitleBarBackground: '#ffb86c15',
		debugTitleBarBackground: '#8be9fd15',
		errorEditorBackground: '#2d222a',
		warningEditorBackground: '#2d2a22',
		debugEditorBackground: '#222a2d',
		errorDiagnosticsForeground: '#ff6e6e',
		warningDiagnosticsForeground: '#ffcfa0',
		debugToolbarBackground: '#44475a',
		debugToolbarBorder: '#8be9fd'
	},
	'Neomono Deep': {
		statusBarForeground: '#1a1c29',
		baseStatusBarBackground: '#a576e0',
		baseStatusBarBorder: '#a576e0',
		baseActivityBarBackground: '#1a1c29',
		baseTitleBarBackground: '#12131c',
		basePanelTitleBorder: '#a576e0',
		baseEditorErrorForeground: '#e04040',
		baseEditorWarningForeground: '#e89e50',
		baseTabActiveBorder: '#a576e000',
		baseEditorBackground: '#1a1c29',
		error: '#e04040',
		warning: '#e89e50',
		debug: '#6dd0e8',
		errorActivityBackground: '#e0404020',
		warningActivityBackground: '#e89e5020',
		debugActivityBackground: '#6dd0e820',
		errorTitleBarBackground: '#e0404015',
		warningTitleBarBackground: '#e89e5015',
		debugTitleBarBackground: '#6dd0e815',
		errorEditorBackground: '#20181c',
		warningEditorBackground: '#201c18',
		debugEditorBackground: '#182024',
		errorDiagnosticsForeground: '#f06a6a',
		warningDiagnosticsForeground: '#f3ba82',
		debugToolbarBackground: '#2d3044',
		debugToolbarBorder: '#6dd0e8'
	},
	'Neomono HC': {
		// HC keeps everything pure black + saturated accents. We bias the
		// state colors towards the brightest tone so contrast stays high
		// even when Reactor tints panels.
		statusBarForeground: '#000000',
		baseStatusBarBackground: '#d4a8ff',
		baseStatusBarBorder: '#ffffff',
		baseActivityBarBackground: '#000000',
		baseTitleBarBackground: '#000000',
		basePanelTitleBorder: '#d4a8ff',
		baseEditorErrorForeground: '#ff7878',
		baseEditorWarningForeground: '#ffc88a',
		baseTabActiveBorder: '#ffffff',
		baseEditorBackground: '#000000',
		error: '#ff7878',
		warning: '#ffc88a',
		debug: '#a8f2ff',
		errorActivityBackground: '#ff787828',
		warningActivityBackground: '#ffc88a28',
		debugActivityBackground: '#a8f2ff28',
		errorTitleBarBackground: '#ff78781f',
		warningTitleBarBackground: '#ffc88a1f',
		debugTitleBarBackground: '#a8f2ff1f',
		errorEditorBackground: '#1a0808',
		warningEditorBackground: '#1a1408',
		debugEditorBackground: '#08141a',
		errorDiagnosticsForeground: '#ff9090',
		warningDiagnosticsForeground: '#ffd9a8',
		debugToolbarBackground: '#1f1f1f',
		debugToolbarBorder: '#a8f2ff'
	}
};

const INTENSITY_LEVELS: Record<ReactorIntensity, number> = {
	subtle: 0,
	moderate: 1,
	intense: 2
};

// Module-level state. The extension lives in a single host process per VS Code
// session, so this is effectively a singleton owned by activateReactor / deactivateReactor.
// If you ever need multi-instance Reactors (e.g. per-window), wrap this in a class.
let refreshTimer: NodeJS.Timeout | undefined;
let lastAppliedSignature: string | undefined;

function getActiveTheme(): string {
	return vscode.workspace.getConfiguration('workbench').get<string>('colorTheme', '');
}

function isSupportedTheme(themeName: string): themeName is SupportedThemeName {
	return SUPPORTED_THEME_NAMES.includes(themeName as SupportedThemeName);
}

export function getReactorConfig(): ReactorConfig {
	const config = vscode.workspace.getConfiguration('neomono.reactor');
	return {
		// Opt-in by default: we don't want to write to the user's
		// workbench.colorCustomizations on first install without consent.
		enabled: config.get<boolean>('enabled', false),
		intensity: config.get<ReactorIntensity>('intensity', 'moderate'),
		affectedElements: {
			statusBar: config.get<boolean>('affectStatusBar', true),
			activityBar: config.get<boolean>('affectActivityBar', true),
			titleBar: config.get<boolean>('affectTitleBar', true),
			panelTitle: config.get<boolean>('affectPanelTitle', true),
			editorDiagnostics: config.get<boolean>('affectEditorDiagnostics', true),
			editorBackground: config.get<boolean>('affectEditorBackground', false),
			tabActiveBorder: config.get<boolean>('affectTabBorder', true)
		}
	};
}

export function getReactorState(
	isDebugging: boolean,
	diagnostics: readonly Pick<vscode.Diagnostic, 'severity'>[]
): ReactorState {
	if (isDebugging) {
		return 'debug';
	}

	if (diagnostics.some((diagnostic) => diagnostic.severity === vscode.DiagnosticSeverity.Error)) {
		return 'error';
	}

	if (diagnostics.some((diagnostic) => diagnostic.severity === vscode.DiagnosticSeverity.Warning)) {
		return 'warning';
	}

	return 'normal';
}

function getActiveEditorDiagnostics(): readonly vscode.Diagnostic[] {
	const uri = vscode.window.activeTextEditor?.document.uri;
	return uri ? vscode.languages.getDiagnostics(uri) : [];
}

function getCurrentReactorState(): ReactorState {
	return getReactorState(vscode.debug.activeDebugSession !== undefined, getActiveEditorDiagnostics());
}

function asObjectRecord(value: unknown): Record<string, unknown> {
	return value !== null && typeof value === 'object' && !Array.isArray(value)
		? { ...(value as Record<string, unknown>) }
		: {};
}

function stripManagedKeys(entry: Record<string, unknown>): Record<string, unknown> {
	const next = { ...entry };
	for (const key of MANAGED_COLOR_KEYS) {
		delete next[key];
	}
	return next;
}

function pickByIntensity<T>(values: readonly [T, T, T], intensity: ReactorIntensity): T {
	return values[INTENSITY_LEVELS[intensity]];
}

function withAlpha(hexColor: string, alpha: string): string {
	return `${hexColor.slice(0, 7)}${alpha}`;
}

// Active state colors per state — used wherever we just need "the accent color for this state"
function stateAccent(state: Exclude<ReactorState, 'normal'>, palette: ThemePalette): string {
	switch (state) {
		case 'debug':
			return palette.debug;
		case 'error':
			return palette.error;
		case 'warning':
			return palette.warning;
	}
}

// Soft semi-transparent background tint per state
function stateActivityBackground(state: Exclude<ReactorState, 'normal'>, palette: ThemePalette): string {
	switch (state) {
		case 'debug':
			return palette.debugActivityBackground;
		case 'error':
			return palette.errorActivityBackground;
		case 'warning':
			return palette.warningActivityBackground;
	}
}

function stateTitleBarBackground(state: Exclude<ReactorState, 'normal'>, palette: ThemePalette): string {
	switch (state) {
		case 'debug':
			return palette.debugTitleBarBackground;
		case 'error':
			return palette.errorTitleBarBackground;
		case 'warning':
			return palette.warningTitleBarBackground;
	}
}

function stateEditorBackground(state: Exclude<ReactorState, 'normal'>, palette: ThemePalette): string {
	switch (state) {
		case 'debug':
			return palette.debugEditorBackground;
		case 'error':
			return palette.errorEditorBackground;
		case 'warning':
			return palette.warningEditorBackground;
	}
}

export function createManagedColorOverrides(
	themeName: SupportedThemeName,
	state: ReactorState,
	config: ReactorConfig
): Partial<Record<ManagedColorKey, string>> {
	if (!config.enabled || state === 'normal') {
		return {};
	}

	const palette = THEME_PALETTES[themeName];
	const accent = stateAccent(state, palette);
	const activityBg = stateActivityBackground(state, palette);
	const titleBarBg = stateTitleBarBackground(state, palette);
	const editorBg = stateEditorBackground(state, palette);
	const intenseActivityBackground = withAlpha(accent, INTENSE_BACKGROUND_ALPHA);
	const overrides: Partial<Record<ManagedColorKey, string>> = {};

	if (config.affectedElements.statusBar) {
		overrides['statusBar.background'] = accent;
		overrides['statusBar.foreground'] = palette.statusBarForeground;
		overrides['statusBar.border'] = accent;
		if (state === 'debug') {
			overrides['statusBar.debuggingBackground'] = palette.debug;
			overrides['statusBar.debuggingForeground'] = palette.statusBarForeground;
		}
	}

	if (config.affectedElements.activityBar) {
		overrides['activityBar.background'] = pickByIntensity(
			[palette.baseActivityBarBackground, activityBg, intenseActivityBackground],
			config.intensity
		);
		overrides['activityBar.border'] = accent;
	}

	if (config.affectedElements.titleBar) {
		overrides['titleBar.activeBackground'] = pickByIntensity(
			[palette.baseTitleBarBackground, titleBarBg, activityBg],
			config.intensity
		);
	}

	if (config.affectedElements.panelTitle) {
		overrides['panelTitle.activeBorder'] = accent;
	}

	if (config.affectedElements.editorDiagnostics) {
		if (state === 'error') {
			overrides['editorError.foreground'] = pickByIntensity(
				[palette.baseEditorErrorForeground, palette.errorDiagnosticsForeground, palette.error],
				config.intensity
			);
		} else if (state === 'warning') {
			overrides['editorWarning.foreground'] = pickByIntensity(
				[palette.baseEditorWarningForeground, palette.warningDiagnosticsForeground, palette.warning],
				config.intensity
			);
		}
	}

	if (config.affectedElements.tabActiveBorder) {
		overrides['tab.activeBorder'] = accent;
	}

	if (config.affectedElements.editorBackground) {
		overrides['editor.background'] = pickByIntensity(
			[palette.baseEditorBackground, editorBg, activityBg],
			config.intensity
		);
	}

	if (state === 'debug') {
		overrides['debugToolBar.background'] = palette.debugToolbarBackground;
		overrides['debugToolBar.border'] = palette.debugToolbarBorder;
	}

	return overrides;
}

export function mergeReactorColorCustomizations(
	existing: Record<string, unknown>,
	state: ReactorState,
	config: ReactorConfig
): Record<string, unknown> {
	const next = { ...existing };

	for (const themeName of SUPPORTED_THEME_NAMES) {
		const scopedKey = `[${themeName}]`;
		const currentScoped = asObjectRecord(next[scopedKey]);
		const cleanedScoped = stripManagedKeys(currentScoped);
		const overrides = createManagedColorOverrides(themeName, state, config);

		if (Object.keys(overrides).length > 0) {
			next[scopedKey] = { ...cleanedScoped, ...overrides };
		} else if (Object.keys(cleanedScoped).length > 0) {
			next[scopedKey] = cleanedScoped;
		} else {
			delete next[scopedKey];
		}
	}

	return next;
}

async function updateColorCustomizations(state: ReactorState, config: ReactorConfig): Promise<void> {
	const workbenchConfig = vscode.workspace.getConfiguration('workbench');
	const existing = asObjectRecord(workbenchConfig.get<Record<string, unknown>>(COLOR_CUSTOMIZATIONS_KEY, {}));
	const next = mergeReactorColorCustomizations(existing, state, config);
	const nextSignature = JSON.stringify(next);

	if (nextSignature === lastAppliedSignature) {
		return;
	}

	try {
		await workbenchConfig.update(COLOR_CUSTOMIZATIONS_KEY, next, vscode.ConfigurationTarget.Global);
		lastAppliedSignature = nextSignature;
	} catch (error) {
		// If the write fails, don't cache the signature: we want the next refresh
		// to retry instead of believing the broken state was applied.
		log.error('Failed to update workbench.colorCustomizations', error);
	}
}

async function refreshReactorState(): Promise<void> {
	const config = getReactorConfig();
	const activeTheme = getActiveTheme();
	const state = config.enabled && isSupportedTheme(activeTheme) ? getCurrentReactorState() : 'normal';
	await updateColorCustomizations(state, config);
}

function scheduleRefresh(delay = DIAGNOSTIC_REFRESH_DELAY_MS): void {
	if (refreshTimer) {
		clearTimeout(refreshTimer);
	}

	refreshTimer = setTimeout(() => {
		refreshTimer = undefined;
		void refreshReactorState();
	}, delay);
}

/**
 * Wire Reactor Glow into the host: subscribe to diagnostics, debug sessions,
 * the active editor, theme changes and our own configuration so the workbench
 * color customizations stay in sync with the current state.
 */
export function activateReactor(context: vscode.ExtensionContext): void {
	context.subscriptions.push(
		vscode.languages.onDidChangeDiagnostics((event) => {
			const activeUri = vscode.window.activeTextEditor?.document.uri;
			if (!activeUri) {
				return;
			}

			if (event.uris.some((uri) => uri.toString() === activeUri.toString())) {
				scheduleRefresh();
			}
		}),
		vscode.debug.onDidStartDebugSession(() => scheduleRefresh(0)),
		vscode.debug.onDidTerminateDebugSession(() => scheduleRefresh(0)),
		vscode.window.onDidChangeActiveTextEditor(() => scheduleRefresh(0)),
		vscode.window.onDidChangeActiveColorTheme(() => scheduleRefresh(0)),
		vscode.workspace.onDidChangeConfiguration((event) => {
			if (
				event.affectsConfiguration('neomono.reactor') ||
				event.affectsConfiguration('workbench.colorTheme')
			) {
				scheduleRefresh(0);
			}
		})
	);

	scheduleRefresh(0);
}

/**
 * Tear Reactor Glow down: cancel any pending refresh and clear the managed
 * customizations from the user's settings (so the UI returns to base colors).
 */
export function deactivateReactor(): void {
	if (refreshTimer) {
		clearTimeout(refreshTimer);
		refreshTimer = undefined;
	}

	lastAppliedSignature = undefined;
	void updateColorCustomizations('normal', { ...getReactorConfig(), enabled: false });
}

async function setReactorEnabled(value: boolean): Promise<boolean> {
	const config = vscode.workspace.getConfiguration('neomono.reactor');
	try {
		await config.update('enabled', value, vscode.ConfigurationTarget.Global);
		return true;
	} catch (error) {
		log.error(`Failed to set neomono.reactor.enabled = ${value}`, error);
		vscode.window.showErrorMessage(
			vscode.l10n.t('reactor.toggleError', error instanceof Error ? error.message : String(error))
		);
		return false;
	}
}

/**
 * Enable Reactor Glow by flipping the configuration option.
 */
export async function enableReactor(): Promise<void> {
	const config = vscode.workspace.getConfiguration('neomono.reactor');
	const currentEnabled = config.get<boolean>('enabled', false);

	if (currentEnabled) {
		vscode.window.showInformationMessage(vscode.l10n.t('reactor.alreadyEnabled'));
		return;
	}

	if (await setReactorEnabled(true)) {
		vscode.window.showInformationMessage(vscode.l10n.t('reactor.enabled'));
	}
}

/**
 * Disable Reactor Glow by flipping the configuration option (overrides are cleared
 * automatically by the next state refresh that follows the config change event).
 */
export async function disableReactor(): Promise<void> {
	const config = vscode.workspace.getConfiguration('neomono.reactor');
	const currentEnabled = config.get<boolean>('enabled', false);

	if (!currentEnabled) {
		vscode.window.showInformationMessage(vscode.l10n.t('reactor.alreadyDisabled'));
		return;
	}

	if (await setReactorEnabled(false)) {
		vscode.window.showInformationMessage(vscode.l10n.t('reactor.disabled'));
	}
}

/**
 * Toggle `neomono.reactor.enabled`. Internally delegates to {@link enableReactor}
 * or {@link disableReactor} so the user gets the same notifications as a manual
 * toggle.
 */
export async function toggleReactor(): Promise<void> {
	const config = vscode.workspace.getConfiguration('neomono.reactor');
	const currentEnabled = config.get<boolean>('enabled', false);

	if (currentEnabled) {
		await disableReactor();
	} else {
		await enableReactor();
	}
}

/**
 * Pure helper: given the current `workbench.colorCustomizations` object, return a
 * new object with every Reactor-managed key (and any now-empty scoped maps for
 * Neomono / Neomono Deep) removed. Exported separately so it can be unit-tested
 * without touching VS Code state.
 */
export function computeResetCustomizations(
	existing: Record<string, unknown>
): Record<string, unknown> {
	const next = { ...existing };

	for (const themeName of SUPPORTED_THEME_NAMES) {
		const scopedKey = `[${themeName}]`;
		const currentScoped = asObjectRecord(next[scopedKey]);
		const cleanedScoped = stripManagedKeys(currentScoped);

		if (Object.keys(cleanedScoped).length > 0) {
			next[scopedKey] = cleanedScoped;
		} else {
			delete next[scopedKey];
		}
	}

	return next;
}

/**
 * Remove every Reactor-managed key from the user's `workbench.colorCustomizations`,
 * including the per-theme scoped maps `[Neomono]` and `[Neomono Deep]`. Useful when
 * uninstalling or when the user wants to start from a clean slate.
 */
export async function resetReactorCustomizations(): Promise<void> {
	const workbenchConfig = vscode.workspace.getConfiguration('workbench');
	const existing = asObjectRecord(workbenchConfig.get<Record<string, unknown>>(COLOR_CUSTOMIZATIONS_KEY, {}));
	const next = computeResetCustomizations(existing);

	lastAppliedSignature = undefined;

	try {
		await workbenchConfig.update(COLOR_CUSTOMIZATIONS_KEY, next, vscode.ConfigurationTarget.Global);
	} catch (error) {
		log.error('Failed to update workbench.colorCustomizations during reset', error);
		vscode.window.showErrorMessage(
			vscode.l10n.t('reactor.customizationsResetError', error instanceof Error ? error.message : String(error))
		);
		return;
	}

	vscode.window.showInformationMessage(vscode.l10n.t('reactor.customizationsReset'));
}
