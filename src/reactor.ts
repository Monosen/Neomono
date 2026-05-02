import * as vscode from 'vscode';

export const SUPPORTED_THEME_NAMES = ['Neomono', 'Neomono Deep'] as const;
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
	}
};

const INTENSITY_LEVELS: Record<ReactorIntensity, number> = {
	subtle: 0,
	moderate: 1,
	intense: 2
};

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
		enabled: config.get<boolean>('enabled', true),
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

export function createManagedColorOverrides(
	themeName: SupportedThemeName,
	state: ReactorState,
	config: ReactorConfig
): Partial<Record<ManagedColorKey, string>> {
	if (!config.enabled || state === 'normal') {
		return {};
	}

	const palette = THEME_PALETTES[themeName];
	const overrides: Partial<Record<ManagedColorKey, string>> = {};

	if (config.affectedElements.statusBar) {
		const accent = state === 'debug' ? palette.debug : state === 'error' ? palette.error : palette.warning;
		overrides['statusBar.background'] = accent;
		overrides['statusBar.foreground'] = palette.statusBarForeground;
		overrides['statusBar.border'] = accent;
		if (state === 'debug') {
			overrides['statusBar.debuggingBackground'] = palette.debug;
			overrides['statusBar.debuggingForeground'] = palette.statusBarForeground;
		}
	}

	if (config.affectedElements.activityBar) {
		const intenseActivityBackground =
			state === 'debug'
				? withAlpha(palette.debug, '35')
				: state === 'error'
					? withAlpha(palette.error, '35')
					: withAlpha(palette.warning, '35');
		overrides['activityBar.background'] =
			state === 'debug'
				? pickByIntensity([
					palette.baseActivityBarBackground,
					palette.debugActivityBackground,
					intenseActivityBackground
				], config.intensity)
				: state === 'error'
					? pickByIntensity([
						palette.baseActivityBarBackground,
						palette.errorActivityBackground,
						intenseActivityBackground
					], config.intensity)
					: pickByIntensity([
						palette.baseActivityBarBackground,
						palette.warningActivityBackground,
						intenseActivityBackground
					], config.intensity);
		overrides['activityBar.border'] = state === 'debug' ? palette.debug : state === 'error' ? palette.error : palette.warning;
	}

	if (config.affectedElements.titleBar) {
		const intenseTitleBarBackground =
			state === 'debug'
				? palette.debugActivityBackground
				: state === 'error'
					? palette.errorActivityBackground
					: palette.warningActivityBackground;
		overrides['titleBar.activeBackground'] =
			state === 'debug'
				? pickByIntensity([
					palette.baseTitleBarBackground,
					palette.debugTitleBarBackground,
					intenseTitleBarBackground
				], config.intensity)
				: state === 'error'
					? pickByIntensity([
						palette.baseTitleBarBackground,
						palette.errorTitleBarBackground,
						intenseTitleBarBackground
					], config.intensity)
					: pickByIntensity([
						palette.baseTitleBarBackground,
						palette.warningTitleBarBackground,
						intenseTitleBarBackground
					], config.intensity);
	}

	if (config.affectedElements.panelTitle) {
		overrides['panelTitle.activeBorder'] = state === 'debug' ? palette.debug : state === 'error' ? palette.error : palette.warning;
	}

	if (config.affectedElements.editorDiagnostics) {
		if (state === 'error') {
			overrides['editorError.foreground'] = pickByIntensity([
				palette.baseEditorErrorForeground,
				palette.errorDiagnosticsForeground,
				palette.error
			], config.intensity);
		} else if (state === 'warning') {
			overrides['editorWarning.foreground'] = pickByIntensity([
				palette.baseEditorWarningForeground,
				palette.warningDiagnosticsForeground,
				palette.warning
			], config.intensity);
		}
	}

	if (config.affectedElements.tabActiveBorder) {
		overrides['tab.activeBorder'] = state === 'debug' ? palette.debug : state === 'error' ? palette.error : palette.warning;
	}

	if (config.affectedElements.editorBackground) {
		overrides['editor.background'] =
			state === 'debug'
				? pickByIntensity([
					palette.baseEditorBackground,
					palette.debugEditorBackground,
					palette.debugActivityBackground
				], config.intensity)
				: state === 'error'
					? pickByIntensity([
						palette.baseEditorBackground,
						palette.errorEditorBackground,
						palette.errorActivityBackground
					], config.intensity)
					: pickByIntensity([
						palette.baseEditorBackground,
						palette.warningEditorBackground,
						palette.warningActivityBackground
					], config.intensity);
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

	lastAppliedSignature = nextSignature;
	await workbenchConfig.update(COLOR_CUSTOMIZATIONS_KEY, next, vscode.ConfigurationTarget.Global);
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

export function deactivateReactor(): void {
	if (refreshTimer) {
		clearTimeout(refreshTimer);
		refreshTimer = undefined;
	}

	lastAppliedSignature = undefined;
	void updateColorCustomizations('normal', { ...getReactorConfig(), enabled: false });
}

/**
 * Enable Reactor Glow by setting the configuration option.
 */
export async function enableReactor(): Promise<void> {
	const config = vscode.workspace.getConfiguration('neomono.reactor');
	const currentEnabled = config.get<boolean>('enabled', true);

	if (currentEnabled) {
		vscode.window.showInformationMessage(vscode.l10n.t('reactor.alreadyEnabled'));
		return;
	}

	await config.update('enabled', true, vscode.ConfigurationTarget.Global);
	vscode.window.showInformationMessage(vscode.l10n.t('reactor.enabled'));
}

/**
 * Disable Reactor Glow by setting the configuration option and clearing overrides.
 */
export async function disableReactor(): Promise<void> {
	const config = vscode.workspace.getConfiguration('neomono.reactor');
	const currentEnabled = config.get<boolean>('enabled', true);

	if (!currentEnabled) {
		vscode.window.showInformationMessage(vscode.l10n.t('reactor.alreadyDisabled'));
		return;
	}

	await config.update('enabled', false, vscode.ConfigurationTarget.Global);
	vscode.window.showInformationMessage(vscode.l10n.t('reactor.disabled'));
}

/**
 * Toggle Reactor Glow on/off.
 */
export async function toggleReactor(): Promise<void> {
	const config = vscode.workspace.getConfiguration('neomono.reactor');
	const currentEnabled = config.get<boolean>('enabled', true);

	if (currentEnabled) {
		await disableReactor();
	} else {
		await enableReactor();
	}
}
