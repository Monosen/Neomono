<div align="center">
  <img src="assets/neomono-icon.png" width="150" alt="Neomono Icon" />
  <h1>Neomono</h1>
  <p>
    <b>Un tema oscuro vibrante y futurista con acentos neón para desarrolladores modernos.</b>
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

## 🎨 Características

**Neomono** trae una estética cyberpunk a tu VS Code. Diseñado para largas sesiones de codificación con alto contraste y colores neón vibrantes que resaltan sobre un fondo oscuro profundo.

- **Fondo**: Azul-Gris Profundo (`#263238`)
- **Palabras clave**: Púrpura Neón (`#C792EA`)
- **Funciones**: Azul Eléctrico (`#82AAFF`)
- **Cadenas**: Verde Neón Suave (`#C3E88D`)
- **Variables**: Cyan Brillante (`#EEFFFF`)

## 💻 Lenguajes Soportados

Neomono está optimizado para una amplia variedad de lenguajes de programación:

- **Web**: JavaScript, TypeScript, HTML, CSS, React (JSX/TSX)
- **Backend**: Python, Go, Rust, Java, C#, PHP, Ruby
- **Scripting**: Bash/Shell, SQL
- **Datos**: JSON, YAML, Markdown

Revisa la carpeta `examples/` en el repositorio para ver ejemplos de código en cada lenguaje.

## 📦 Instalación

1. Abre **Visual Studio Code**.
2. Ve a la vista de **Extensiones** (`Ctrl+Shift+X` o `Cmd+Shift+X`).
3. Busca `Neomono`.
4. Haz clic en **Instalar**.
5. Haz clic en **Establecer Tema de Color** y selecciona **Neomono**.

## 🚀 Uso

Una vez instalado, puedes cambiar al tema en cualquier momento:

1. Presiona `Ctrl+K` y luego `Ctrl+T` (o `Cmd+K` `Cmd+T` en macOS).
2. Selecciona **Neomono** de la lista.

## ✨ Efecto Neon Dreams (Opcional)

Para una experiencia aún más inmersiva, puedes habilitar el efecto **Neon Dreams** que añade brillo y efectos visuales adicionales:

### Requisitos

1. Instala la extensión [Custom CSS and JS Loader](https://marketplace.visualstudio.com/items?itemName=be5invis.vscode-custom-css):
   ```
   ext install be5invis.vscode-custom-css
   ```

### Activación

1. Abre la paleta de comandos (`Ctrl+Shift+P` o `Cmd+Shift+P`).
2. Ejecuta el comando: **Neomono: Enable Neon Dreams**.
3. Si es la primera vez, se te pedirá que instales la extensión "Custom CSS and JS Loader".
4. Una vez instalada, ejecuta el comando: **Reload Custom CSS and JS** desde la paleta de comandos.
5. Reinicia VS Code cuando se te solicite.

### Desactivación

1. Abre la paleta de comandos.
2. Ejecuta el comando: **Neomono: Disable Neon Dreams**.
3. Ejecuta: **Reload Custom CSS and JS**.
4. Reinicia VS Code.

### ⚠️ Advertencia "[Unsupported]"

Después de activar Neon Dreams, es **normal** que veas el mensaje `[Unsupported]` en la barra de título de VS Code. Esto sucede porque la extensión Custom CSS and JS Loader modifica archivos de VS Code para inyectar los efectos visuales personalizados.

**¿Es esto un problema?**
- ❌ No, tu VS Code funciona perfectamente
- ✅ Es una advertencia estándar que aparece con todas las extensiones que modifican estilos
- ✅ Extensiones populares como Synthwave '84 y Power Mode generan el mismo mensaje

**Para ocultar la advertencia (opcional):**

Agrega esto a tu `settings.json`:

```json
"window.titleBarStyle": "custom"
```

O simplemente ignora el mensaje - es completamente seguro.

> **Nota**: Este método no requiere permisos de administrador y es compatible con actualizaciones de VS Code.

## 🤝 Contribuir

¡Issues y Pull Requests son bienvenidos! Visita el [Repositorio de GitHub](https://github.com/Monosen/Neomono).

## 📄 Licencia

Este proyecto está licenciado bajo la Licencia MIT - consulta el archivo [LICENSE](LICENSE) para más detalles.

---

<div align="center">
  Hecho con ❤️ por <a href="https://github.com/Monosen">Monosen</a>
</div>

