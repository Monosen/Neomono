<div align="center">
  <img src="assets/neomono-icon.jpg" width="150" alt="Neomono Icon" />
  <h1>Neomono</h1>
  <p>
    <b>A vibrant, futuristic dark theme with neon accents for modern developers.</b>
  </p>

  <!-- BADGES_START -->
  <p>
    <a href="https://marketplace.visualstudio.com/items?itemName=Monosen.neomono">
      <img src="https://img.shields.io/visual-studio-marketplace/v/Monosen.neomono?style=for-the-badge&color=C792EA&logo=visual-studio-code" alt="Version" />
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
2.  Select the theme: `Ctrl+K` `Ctrl+T` > **Neomono**.

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

### Settings

| Setting | Default | Description |
| --- | --- | --- |
| `neomono.neonDreams.brightness` | `0.45` | Glow brightness (0.0 transparent, 1.0 fully bright). |
| `neomono.neonDreams.glow` | `true` | Enable the text-shadow glow effect. |
| `neomono.neonDreams.showNotifications` | `true` | Show notifications when Neon Dreams changes state. |
| `neomono.reactor.enabled` | `true` | Enable Reactor Glow (reactive UI colors). |
| `neomono.reactor.intensity` | `"moderate"` | How strong Reactor Glow shifts should feel. |
| `neomono.reactor.affectStatusBar` | `true` | Let Reactor recolor the status bar. |
| `neomono.reactor.affectActivityBar` | `true` | Let Reactor recolor the activity bar. |
| `neomono.reactor.affectTitleBar` | `true` | Let Reactor tint the title bar. |
| `neomono.reactor.affectEditorDiagnostics` | `true` | Intensify editor error and warning colors. |
| `neomono.reactor.affectEditorBackground` | `false` | Add a subtle state-based tint to the editor background. |
| `neomono.reactor.affectTabBorder` | `true` | Recolor the active tab border. |

## 📄 License

MIT License - see [LICENSE](LICENSE).

---

<div align="center">
  Made with ❤️ by <a href="https://github.com/Monosen">Monosen</a>
</div>
