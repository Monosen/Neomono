<div align="center">
  <img src="assets/neomono-icon.jpg" width="150" alt="Neomono Icon" />
  <h1>Neomono</h1>
  <p>
    <b>Un tema oscuro vibrante y futurista con acentos neón para desarrolladores modernos.</b>
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

## 📦 Instalación y Uso

1.  Instala **Neomono** desde el Marketplace de VS Code.
2.  Selecciona el tema: `Ctrl+K` `Ctrl+T` > **Neomono**.

## ✨ Efecto Neon Dreams

Habilita el efecto de brillo para una experiencia cyberpunk completa.

1.  Selecciona el tema: `Ctrl+K` `Ctrl+T` > **Neomono** o **Neomono Deep**.
2.  Ejecuta el comando **`Neomono: Habilitar Neon Dreams`** (o **`Neomono: Alternar Neon Dreams`**).
3.  Reinicia VS Code cuando se te pida.

> [!NOTE]
> Puedes ver una advertencia "Your Code installation appears to be corrupt" en VS Code. Esto es normal y seguro — la extensión modifica archivos internos de VS Code para inyectar el efecto glow. Puedes descartar esta advertencia con seguridad.

### Personalizar el brillo del glow

En tu `settings.json`:

```json
"neomono.neonDreams.brightness": 0.45
```

El valor debe ser un decimal de 0 a 1, donde 0.0 es totalmente transparente y 1.0 es brillo máximo. El valor por defecto es 0.45. Para ver los cambios, ejecuta de nuevo **Neomono: Habilitar Neon Dreams**.

### Deshabilitar glow, mantener chrome

Si quieres las actualizaciones del chrome del editor sin el glow de texto:

```json
"neomono.neonDreams.glow": false
```

### Comandos

| Comando | Descripción |
| --- | --- |
| `Neomono: Habilitar Neon Dreams` | Habilita el efecto glow (requiere reinicio). |
| `Neomono: Deshabilitar Neon Dreams` | Elimina el efecto glow (requiere reinicio). |
| `Neomono: Alternar Neon Dreams` | Habilita o deshabilita según el estado actual. |
| `Neomono: Habilitar Reactor Glow` | Habilita los colores reactivos de la interfaz. |
| `Neomono: Deshabilitar Reactor Glow` | Deshabilita los colores reactivos de la interfaz. |
| `Neomono: Alternar Reactor Glow` | Alterna los colores reactivos de la interfaz. |

### Ajustes

| Ajuste | Por defecto | Descripción |
| --- | --- | --- |
| `neomono.neonDreams.brightness` | `0.45` | Brillo del glow (0.0 transparente, 1.0 brillo máximo). |
| `neomono.neonDreams.glow` | `true` | Habilita el efecto text-shadow de glow. |
| `neomono.neonDreams.showNotifications` | `true` | Muestra notificaciones cuando Neon Dreams cambia de estado. |
| `neomono.reactor.enabled` | `true` | Habilita Reactor Glow (colores reactivos de la interfaz). |
| `neomono.reactor.intensity` | `"moderate"` | Qué tan intensos deben sentirse los cambios de color. |
| `neomono.reactor.affectStatusBar` | `true` | Permite que Reactor recoloque la barra de estado. |
| `neomono.reactor.affectActivityBar` | `true` | Permite que Reactor recoloque la barra de actividad. |
| `neomono.reactor.affectTitleBar` | `true` | Permite que Reactor tiña la barra de título. |
| `neomono.reactor.affectEditorDiagnostics` | `true` | Intensifica los colores de errores y advertencias del editor. |
| `neomono.reactor.affectEditorBackground` | `false` | Agrega un tinte sutil al fondo del editor según el estado. |
| `neomono.reactor.affectTabBorder` | `true` | Recolorea el borde de la pestaña activa. |

## 📄 Licencia

Licencia MIT - ver [LICENSE](LICENSE).

---

<div align="center">
  Hecho con ❤️ por <a href="https://github.com/Monosen">Monosen</a>
</div>
