<div align="center">
  <img src="assets/neomono-icon.png" width="150" alt="Neomono Icon" />
  <h1>Neomono</h1>
  <p>
    <b>A vibrant, futuristic dark theme with neon accents for modern developers.</b>
  </p>

  <!-- Badges -->
  <p>
    <a href="https://marketplace.visualstudio.com/items?itemName=Monosen.neomono">
      <img src="https://img.shields.io/visual-studio-marketplace/v/Monosen.neomono?style=flat-square&color=C792EA" alt="Version" />
    </a>
    <a href="https://marketplace.visualstudio.com/items?itemName=Monosen.neomono">
      <img src="https://img.shields.io/visual-studio-marketplace/i/Monosen.neomono?style=flat-square&color=89DDFF" alt="Installs" />
    </a>
    <a href="https://github.com/Monosen/Neomono/blob/master/LICENSE">
      <img src="https://img.shields.io/github/license/Monosen/Neomono?style=flat-square&color=f07178" alt="License" />
    </a>
  </p>

  <p>
    <a href="README.md">English</a> • <a href="README.es.md">Español</a>
  </p>
</div>

---

## 🎨 Features

**Neomono** brings a cyberpunk aesthetic to your VS Code. Designed for long coding sessions with high contrast and vibrant neon colors that pop against a deep dark background.

- **Background**: Deep Blue-Grey (`#263238`)
- **Keywords**: Neon Purple (`#C792EA`)
- **Functions**: Electric Blue (`#82AAFF`)
- **Strings**: Soft Neon Green (`#C3E88D`)
- **Variables**: Bright Cyan (`#EEFFFF`)

## 💻 Supported Languages

Neomono is optimized for a wide variety of programming languages:

- **Web**: JavaScript, TypeScript, HTML, CSS, React (JSX/TSX)
- **Backend**: Python, Go, Rust, Java, C#, PHP, Ruby
- **Scripting**: Bash/Shell, SQL
- **Data**: JSON, YAML, Markdown

Check the `examples/` folder in the repository to see code examples in each language.

## 📦 Installation

1. Open **Visual Studio Code**.
2. Go to the **Extensions** view (`Ctrl+Shift+X` or `Cmd+Shift+X`).
3. Search for `Neomono`.
4. Click **Install**.
5. Click **Set Color Theme** and select **Neomono**.

## 🚀 Usage

Once installed, you can switch to the theme anytime:

1. Press `Ctrl+K` then `Ctrl+T` (or `Cmd+K` `Cmd+T` on macOS).
2. Select **Neomono** from the list.

## ✨ Neon Dreams Effect (Optional)

For an even more immersive experience, you can enable the **Neon Dreams** effect which adds glow and additional visual effects:

### Requirements

1. Install the [Custom CSS and JS Loader](https://marketplace.visualstudio.com/items?itemName=be5invis.vscode-custom-css) extension:
   ```
   ext install be5invis.vscode-custom-css
   ```

### Activation

1. Open the command palette (`Ctrl+Shift+P` or `Cmd+Shift+P`).
2. Run the command: **Neomono: Enable Neon Dreams**.
3. If it's your first time, you'll be prompted to install the "Custom CSS and JS Loader" extension.
4. Once installed, run the command: **Reload Custom CSS and JS** from the command palette.
5. Restart VS Code when prompted.

### Deactivation

1. Open the command palette.
2. Run the command: **Neomono: Disable Neon Dreams**.
3. Run: **Reload Custom CSS and JS**.
4. Restart VS Code.

### ⚠️ "[Unsupported]" Warning

After activating Neon Dreams, it's **normal** to see the `[Unsupported]` message in VS Code's title bar. This happens because the Custom CSS and JS Loader extension modifies VS Code files to inject custom visual effects.

**Is this a problem?**
- ❌ No, your VS Code works perfectly
- ✅ It's a standard warning that appears with all extensions that modify styles
- ✅ Popular extensions like Synthwave '84 and Power Mode generate the same message

**To hide the warning (optional):**

Add this to your `settings.json`:

```json
"window.titleBarStyle": "custom"
```

Or simply ignore the message - it's completely safe.

> **Note**: This method doesn't require administrator permissions and is compatible with VS Code updates.

## 🤝 Contributing

Issues and Pull Requests are welcome! Check out the [GitHub Repository](https://github.com/Monosen/Neomono).

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  Made with ❤️ by <a href="https://github.com/Monosen">Monosen</a>
</div>
