# Neomono — Roadmap de mejoras

Este documento es el plan vivo de mejoras del proyecto. Cada ítem tiene un
checkbox; conforme se completan se marcan aquí. Los bloques **"Hecho"** al
inicio recogen lo que ya está mergeado para no perder contexto.

> Convenciones:
> - 🟢 = quick win (≤15 min) · 🟡 = medio (15–60 min) · 🟠 = grande (1h+) · 🔴 = producto
> - **Impacto**: bajo / medio / alto
> - **Esfuerzo**: real estimado, no marketing

---

## ✅ Hecho

### Round 1 · Mecánicos / DX (estabilidad base)

- [x] `activationEvents: ["onStartupFinished"]` para que el Reactor arranque al abrir VS Code.
- [x] Migración npm → **pnpm** (`packageManager`, `.npmrc` con `store-dir`, `pnpm-workspace.yaml` retirado).
- [x] `pretest` que compila TS antes de `vscode-test`.
- [x] Versiones alineadas: `@types/node ^20.17.0`, `typescript ^5.7.2`, `engines.vscode ^1.85.0`, `engines.node >=18`.
- [x] Fix `scripts/validate-commands.js` (apuntaba a `extension.js`, no existía; ahora lee `extension.ts`).
- [x] Scripts de validación: `validate:theme`, `validate:i18n`, `validate:commands` y umbrella `validate`.
- [x] `.gitignore` y `.vscodeignore` endurecidos (`*.tsbuildinfo`, `.npmrc`, `*.map`, `out/test/**`, `src/templates/**`).

### Round 2 · TypeScript ESLint

- [x] `typescript-eslint` instalado.
- [x] `eslint.config.js` reescrito en flat config con bloques separados para `scripts/*.js` (CommonJS) y `src/**/*.ts` (typescript-eslint recommended).
- [x] `lint` con `--max-warnings 0`.

### Round 3 · Calidad de código y estabilidad

- [x] Refactor de `reactor.ts`: 5 ternarios anidados → helpers `stateAccent`, `stateActivityBackground`, `stateTitleBarBackground`, `stateEditorBackground`.
- [x] Pure helper extraído: `computeResetCustomizations(existing)` testeable sin tocar VS Code.
- [x] Try/catch en `updateColorCustomizations`, `enableReactor`, `disableReactor`, `resetReactorCustomizations` y caché de "last applied" no se actualiza si el write falla.
- [x] Glow runtime extraído a un template real `src/templates/glow-runtime.js` con dos placeholders (`__TOKEN_REPLACEMENTS_JSON__`, `__DISABLE_GLOW__`) sustituidos con `replaceAll`.
- [x] Double-injection guard (`window.__neomonoGlowInstalled__`).
- [x] `activateGlow(context)` que regenera el JS al cambiar `neomono.neonDreams.brightness` o `.glow` (debounced 250 ms).
- [x] JSDoc en todos los exports de `glow.ts` y `reactor.ts`.
- [x] Tests nuevos: `glow-generator.test.ts`, tests de `activateGlow`, tests de `computeResetCustomizations`.
- [x] Helpers compartidos `src/test/suite/_helpers.ts` (deduplica `findProjectRoot`).
- [x] Sección "Security & how Neon Dreams works" añadida a `README.md` y `README.es.md`.
- [x] CI partido en jobs (test matrix Node `[18, 20, 22]` + validate + package) bajo `xvfb-run`.

### Round 4 · Mayor impacto, mayor esfuerzo (M1–M5)

- [x] **M1** · Bundling con **esbuild**: `out/extension.js` minified ~17 KB, VSIX 381 KB con 18 archivos. `vsce package --no-dependencies` (ya no se publica `node_modules/`). Scripts: `build`, `build:dev`, `watch`, `typecheck`, `clean`.
- [x] **M2** · `.github/dependabot.yml` con grupos (`eslint`, `@types/*`, `@vscode/*`) para npm y GitHub Actions, semanal, prefix Conventional Commit.
- [x] **M3** · `scripts/extract-changelog.js` + `release.yml` que usa el bloque del CHANGELOG como body del GitHub Release (con `generate_release_notes` añadiendo notas por commit debajo).
- [x] **M4** · Reactor **opt-in**: `neomono.reactor.enabled` default `false` + notif one-shot al primer arranque con theme Neomono activo (estado en `globalState`). 3 strings i18n nuevos (EN/ES).
- [x] **M5** · `src/logger.ts` con OutputChannel "Neomono", lazy-init, `dispose()` en `deactivate()`. `console.warn`/`console.error` reemplazados (9 sitios).

---

## 🚧 Pendiente

### 🟢 Quick wins (≤15 min cada una)

- [x] **`extensionKind: ["ui", "workspace"]`** en `package.json` para que el extension funcione en VS Code Remote (SSH/WSL/Codespaces).
- [x] **Categorías ampliadas**: añadido `"Visualization"` además de `"Themes"`.
- [x] **Gallery banner color** del Marketplace: `#bd93f9` (Dracula) → `#0E0017` (deep purple Neomono).
- [x] **`pnpm.onlyBuiltDependencies: ["esbuild"]`** en `package.json` para silenciar el aviso de pnpm 9 sobre el postinstall de esbuild.
- [x] ~~**Sponsor link** (`sponsor.url`)~~ — **descartado**: el autor confirma que no tiene GH Sponsors ni Ko-fi.
- [x] **README**: badges combinados (variante `both` añadida a `scripts/switch-badges.js`, nuevo `pnpm badges:both`). Ahora aparecen VS Code Marketplace + Open VSX + Downloads + Rating + License juntos.
- [x] **README**: nueva sección **🐞 Reporting bugs / Reportar bugs** que explica cómo abrir Output → Neomono y adjuntarlo. Y de paso corregido el default de `neomono.reactor.enabled` en la tabla de settings (era `true`, ahora `false` tras M4).

### 🟡 Medio (15–60 min)

- [x] **Walkthrough nativo** (`contributes.walkthroughs.neomono.gettingStarted`) con **4 pasos**: (1) elegir theme, (2) activar Neon Dreams, (3) activar Reactor Glow, (4) dónde encontrar los logs. Cada paso con `completionEvents` reales (`onSettingChanged:workbench.colorTheme`, `onCommand:*`, etc) para que VS Code marque el progreso solo. 10 strings i18n nuevos en `package.nls.{json,es.json}` (sincronizados, 30 keys cada uno). Nota: `validate:i18n` sólo cubre los bundles de runtime (`l10n/bundle.l10n.*.json`); falta extenderlo a `package.nls.*` (añadido a la lista pendiente más abajo).
- [ ] **StatusBarItem** `$(zap) Neomono` que muestra si Glow/Reactor están activos y abre QuickPick con todos los comandos.
- [x] **Tests para `logger.ts`** (`src/test/suite/logger.test.ts`, 9 tests): lazy-init (no se crea el channel hasta el primer `log.*`), reuso del singleton, formato `[hh:mm:ss.mmm] [level] message`, niveles `info`/`warn`/`error`, error con `Error` (Name + message + stack), error con valor no-Error (coerción `String()`), `warn` sin error → 1 sola línea, `show(true)` no roba foco, `dispose()` libera el channel y permite re-crear. Stub de `vscode.window.createOutputChannel` con un fake channel.
- [x] **Tests para el opt-in del Reactor** (`src/test/suite/optin.test.ts`, 7 tests). Para hacerlo testeable, `maybePromptReactorOptIn` se exportó y ahora acepta un callback `onAccept` inyectable (default = `reactor.enableReactor`). Tests cubren: (1) no-op si el flag de globalState ya está `true`, (2) no-op si el theme no es Neomono (sin marcar el flag), (3) marca el flag sin promptear si Reactor ya está habilitado, (4) prompt + onAccept cuando se acepta, (5) prompt + sin onAccept cuando se rechaza, (6) sin onAccept cuando se cierra con Escape (`undefined`), (7) verifica que se pasa el mensaje localizado + ambos botones traducidos. Stubs in-memory de `globalState`, `getConfiguration` y `showInformationMessage`.
- [x] **CodeQL** workflow (`.github/workflows/codeql.yml`) — análisis `javascript-typescript` con suite `security-and-quality` en cada push, PR a master/main, y semanal (domingos 06:00 UTC).
- [ ] **`vsce ls` en CI como guardrail**: test que falla si el VSIX incluye archivos no esperados (whitelist).
- [ ] **PR comment con tamaño del VSIX**: alarma si crece >X% respecto a `master`.
- [ ] **Helper `t(key, ...args)` tipado** contra las claves del bundle (genera `.d.ts` desde `bundle.l10n.json`) para evitar typos.
- [ ] **Extender `validate:i18n`** para que también valide `package.nls.{json,es.json}` (hoy solo cubre `l10n/bundle.l10n.*.json`). Útil ahora que el walkthrough vive en nls.

### 🟠 Grande (1h+)

- [x] **Cobertura con `c8`** instalada (`c8@11`). Config en `.c8rc.json` (incluye `out/**/*.js`, excluye tests/templates/scripts/d.ts). Scripts: `pnpm test:coverage` (genera HTML + lcov + text summary) y `pnpm coverage:check` (con thresholds 50% lines/funcs/statements, 40% branches — punto de partida deliberadamente bajo). CI: nuevo job `coverage` (Node 20, ubuntu, `continue-on-error: true` mientras se afina) que sube `coverage/` como artifact. `coverage/`, `.nyc_output/` añadidos a `.gitignore` y `.vscodeignore`.
- [x] **Refactor `glow.ts`** (499 LOC monolíticos) → 7 submódulos en `src/glow/`:
  - `markers.ts` (37 LOC) — START/END/RUNTIME/SCRIPT_TAG, `MARKER_REGEX`, `isGlowPatched`
  - `maps.ts` (49 LOC) — `GlowMap` + `NEOMONO_GLOW_MAP` + `NEOMONO_DEEP_GLOW_MAP` + `ALL_GLOW_REPLACEMENTS`
  - `config.ts` (16 LOC) — `NeonDreamsConfig` + `getConfig`
  - `paths.ts` (52 LOC) — `WorkbenchPaths` + `resolveWorkbenchPaths` + `resolveProductJsonPath`
  - `checksum.ts` (97 LOC) — `computeChecksum` + `resolveChecksumFilePath` + `fixChecksums`
  - `template.ts` (54 LOC) — template loader + `generateGlowJs` + `_resetTemplateCacheForTests`
  - `patcher.ts` (220 LOC) — `enableGlow` + `disableGlow` + `toggleGlow` + `activateGlow` + `cleanupCustomCssImports` (con helpers extraídos: `isPermissionError`, `offerReload`)
  - `index.ts` (54 LOC) — barrel que reexporta toda la API pública para mantener `import * as glow from './glow'` retro-compatible
  
  El bundle de esbuild **bajó** de 17.4 KB → 17.1 KB (tree-shaking mejor con módulos separados). Tests existentes intactos. `cleanupCustomCssImports` ahora exportado para futuros tests. Helpers `_resetTemplateCacheForTests` y `_resetDebounceForTests` añadidos para aislar estado entre tests.
- [x] **CI multi-OS**: matrix con `include` que combina `ubuntu-latest × {18, 20, 22}` + `windows-latest × 20` + `macos-latest × 20`. Steps `Run tests` condicionados con `if: matrix.xvfb` para usar `xvfb-run` solo en Linux. Coge regresiones de paths/EOL/permisos sin disparar los minutos de CI.
- [x] **Tests integración Reactor con workspace real** (`src/test/suite/reactor.integration.test.ts`, 3 tests). Snapshot del theme original, fuerza `workbench.colorTheme = "Neomono"`, habilita `neomono.reactor.enabled`, abre un archivo temporal y activa `activateReactor`. Cubre: (1) sin diagnósticos → ningún `MANAGED_COLOR_KEY` en `[Neomono]`, (2) error forzado en el editor activo → `statusBar.background` aparece como hex y `editorError.foreground` también si el setting respectivo está activo, (3) limpiar diagnósticos → vuelven a quitarse los overrides. Helper `waitFor()` con polling para tolerar el debounce de 150 ms y el async write de settings. Teardown agresivo: `resetReactorCustomizations`, `dispose` de subscriptions, restaura el theme original, borra el archivo temporal.
- [x] **Snapshots de `tokenColors`** + tooling para grammar tests.
  - Como Neomono es un *theme* (no aporta grammars), `vscode-tmgrammar-test` por sí solo no detecta regresiones de color. Implementado un snapshot-test propio: `scripts/snapshot-tokencolors.js` serializa cada `tokenColors` array de forma determinista (un entry por scope, ordenado, fontStyle normalizado) y compara contra `themes/__snapshots__/*.snap.json`. 132 scope entries por theme.
  - Scripts: `pnpm validate:tokencolors` (check) y `pnpm snapshot:tokencolors:update` (regen). El check se incluye en `pnpm validate`.
  - `vscode-tmgrammar-test@0.1.3` queda instalado para añadir tests de tokenización contra grammars reales si más adelante se incorporan fixtures bajo `tests/grammar/` (documentado en `CONTRIBUTING.md`).
  - `themes/__snapshots__/**` y `tests/**` añadidos al `.vscodeignore` para que no se publiquen al VSIX.
- [x] **Neomono HC (High Contrast)** añadido. `scripts/generate-hc-theme.js` deriva la variante HC desde Neomono base (backgrounds → `#000000`, foregrounds → `#ffffff`, accents saturados, **bordes opacos** para los 22 keys clave: `contrastBorder`, `sideBar.border`, `editor.border`, etc). Registrado en `contributes.themes` como `uiTheme: "hc-black"`. Incluido en el snapshot de `tokenColors` (132 entries). El Reactor lo soporta con palette HC propia (3.ª entrada en `THEME_PALETTES`). El **Glow** se desactiva intencionalmente en HC (los `text-shadow` rompen el ratio de contraste de accesibilidad). Scripts: `pnpm generate:hc`, `pnpm generate:themes` (Deep + HC en uno).
- [ ] **Variante Light de Neomono**: deliberadamente **NO** generada por script. Un theme Light de calidad no se obtiene por flip automático de uno Dark; los Light que funcionan (Solarized Light, GitHub Light, etc) están diseñados a mano partiendo de una paleta pensada para fondo claro. Pendiente de decisión de diseño manual del autor.

### 🔴 Producto / Marketplace (requiere intervención humana)

- [ ] **Screenshots reales** en `assets/screenshots/` (theme aplicado a TS/Python/JSX, glow on/off, Reactor en estado debug y error) embebidas en `README.md`.
- [ ] **Demo GIF** corto (≤5 s) de Reactor cambiando colores al meter un error. Aceptado por Marketplace.
