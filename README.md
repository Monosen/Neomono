<div align="center">
  <img src="assets/neomono-icon.jpg" width="150" alt="Neomono Icon" />
  <h1>Neomono</h1>
  <p>
    <b>A vibrant, futuristic dark theme with neon accents for modern developers.</b>
  </p>

  <!-- BADGES_START -->
  <p>
    <a href="https://marketplace.visualstudio.com/items?itemName=Monosen.neomono">
      <img src="https://img.shields.io/visual-studio-marketplace/v/Monosen.neomono?style=for-the-badge&color=C792EA&logo=visual-studio-code&label=VS%20Code" alt="VS Code Marketplace Version" />
    </a>
    <a href="https://open-vsx.org/extension/Monosen/neomono">
      <img src="https://img.shields.io/open-vsx/v/Monosen/neomono?style=for-the-badge&color=C792EA&logo=eclipseide&label=Open%20VSX" alt="Open VSX Version" />
    </a>
    <a href="https://marketplace.visualstudio.com/items?itemName=Monosen.neomono">
      <img src="https://img.shields.io/visual-studio-marketplace/d/Monosen.neomono?style=for-the-badge&color=89DDFF&logo=visual-studio-code" alt="Downloads" />
    </a>
    <a href="https://marketplace.visualstudio.com/items?itemName=Monosen.neomono">
      <img src="https://img.shields.io/visual-studio-marketplace/r/Monosen.neomono?style=for-the-badge&color=C3E88D&logo=visual-studio-code" alt="Rating" />
    </a>
    <a href="https://github.com/Monosen/Neomono/blob/master/LICENSE">
      <img src="https://img.shields.io/github/license/Monosen/Neomono?style=for-the-badge&color=f07178&logo=github" alt="License" />
    </a>
  </p>
  <!-- BADGES_END -->

  <p>
    <a href="README.md">English</a> • <a href="README.es.md">Español</a>
  </p>
</div>

---

## 📦 Installation & Usage

1.  Install **Neomono** from the VS Code Marketplace.
2.  Select a variant: `Ctrl+K` `Ctrl+T` > **Neomono**, **Neomono Deep** or **Neomono HC** (high-contrast for accessibility).

> [!NOTE]
> Neon Dreams (the glow effect) is intentionally not enabled on **Neomono HC** — pure-black backgrounds with extra `text-shadow` would lower the contrast ratio that makes the HC variant useful.

## ✨ Neon Dreams Effect

Enable the glow effect for a full cyberpunk experience.

1.  Select the theme: `Ctrl+K` `Ctrl+T` > **Neomono** or **Neomono Deep**.
2.  Run command **`Neomono: Enable Neon Dreams`** (or **`Neomono: Toggle Neon Dreams`**).
3.  Restart VS Code when prompted.

> [!NOTE]
> You may see a "Your Code installation appears to be corrupt" warning in VS Code. This is normal and safe — the extension modifies VS Code's core files to inject the glow effect. You can safely dismiss this warning.

### Customizing the Glow Brightness

In your `settings.json`:

```json
"neomono.neonDreams.brightness": 0.45
```

The value should be a float from 0 to 1, where 0.0 is fully transparent and 1.0 is fully bright. The default is 0.45. To see changes, rerun **Neomono: Enable Neon Dreams**.

### Disable Glow, Keep Chrome Updates

If you want editor chrome updates without the text glow:

```json
"neomono.neonDreams.glow": false
```

### Commands

| Command | Description |
| --- | --- |
| `Neomono: Enable Neon Dreams` | Enable the glow effect (requires restart). |
| `Neomono: Disable Neon Dreams` | Remove the glow effect (requires restart). |
| `Neomono: Toggle Neon Dreams` | Enable or disable depending on current state. |
| `Neomono: Enable Reactor Glow` | Enable reactive UI colors. |
| `Neomono: Disable Reactor Glow` | Disable reactive UI colors. |
| `Neomono: Toggle Reactor Glow` | Toggle reactive UI colors. |
| `Neomono: Reset Reactor Customizations` | Remove every Reactor-managed key from your `workbench.colorCustomizations`. |

### Settings

| Setting | Default | Description |
| --- | --- | --- |
| `neomono.neonDreams.brightness` | `0.45` | Glow brightness (0.0 transparent, 1.0 fully bright). |
| `neomono.neonDreams.glow` | `true` | Enable the text-shadow glow effect. |
| `neomono.neonDreams.showNotifications` | `true` | Show notifications when Neon Dreams changes state. |
| `neomono.reactor.enabled` | `false` | Enable Reactor Glow (reactive UI colors). Opt-in: a one-time prompt is shown the first time you open VS Code with a Neomono theme active. |
| `neomono.reactor.intensity` | `"moderate"` | How strong Reactor Glow shifts should feel. |
| `neomono.reactor.affectStatusBar` | `true` | Let Reactor recolor the status bar. |
| `neomono.reactor.affectActivityBar` | `true` | Let Reactor recolor the activity bar. |
| `neomono.reactor.affectTitleBar` | `true` | Let Reactor tint the title bar. |
| `neomono.reactor.affectEditorDiagnostics` | `true` | Intensify editor error and warning colors. |
| `neomono.reactor.affectEditorBackground` | `false` | Add a subtle state-based tint to the editor background. |
| `neomono.reactor.affectTabBorder` | `true` | Recolor the active tab border. |

## Security & how Neon Dreams works

Neon Dreams is opt-in. When you run `Neomono: Enable Neon Dreams`, the extension makes the following changes to your local VS Code installation (similar to Synthwave '84 and other glow-style themes):

1. Writes a small `neomono-glow.js` next to VS Code's `workbench.html` (typically under `out/vs/code/electron-sandbox/workbench/` or `electron-browser/...`).
2. Inserts a single `<script src="neomono-glow.js"></script>` tag into `workbench.html`, wrapped in `<!-- NEOMONO-GLOW-START -->` / `<!-- NEOMONO-GLOW-END -->` markers so it can be removed cleanly later.
3. Updates the `checksums` field of VS Code's `product.json` so VS Code stops showing the "installation appears to be corrupt" warning. Only the entries whose actual SHA-256 has changed are touched.

What runs at theme load time: a small IIFE (~80 lines) that finds VS Code's `.vscode-tokens-styles` element, copies the rules of Neomono / Neomono Deep, and re-emits them with `text-shadow` so the tokens glow. It does **not** make network requests, read files, or touch any other configuration.

### What this means for you

- All changes are local. Nothing is sent over the network.
- If you update VS Code, the patch is wiped (because VS Code reinstalls its own files). Just run `Neomono: Enable Neon Dreams` again.
- Modifying core files may require write access to VS Code's install dir. On Linux/Mac that may mean running VS Code with sudo once, or installing VS Code in your user directory.

### How to undo manually

If something goes wrong and the extension is unavailable, you can revert by hand:

1. Open `workbench.html` (path is reported in the extension error if any) and delete everything between `<!-- NEOMONO-GLOW-START -->` and `<!-- NEOMONO-GLOW-END -->`.
2. Delete the sibling `neomono-glow.js` file.
3. Optionally restore `product.json` from your VS Code installer (or just live with the corruption warning until the next VS Code update).

Or, the friendly way: run `Neomono: Disable Neon Dreams` and reload.

## 🐞 Reporting bugs

Neomono writes everything it does to a dedicated **Output channel** so you can
share it when something goes wrong:

1. Open the **Output** view (`View → Output`, or `Ctrl+Shift+U`).
2. In the dropdown on the right, pick **Neomono**.
3. Reproduce the bug, then copy the panel content into your
   [bug report](https://github.com/Monosen/Neomono/issues/new?template=bug_report.yml).

The log includes timestamps and the level (`info` / `warn` / `error`), and
errors include the stack trace. Nothing is sent automatically — the panel is
local-only.

## 📄 License

MIT License - see [LICENSE](LICENSE).

---

<div align="center">
  Made with ❤️ by <a href="https://github.com/Monosen">Monosen</a>
</div>
