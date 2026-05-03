<div align="center">
  <img src="assets/neomono-icon.jpg" width="150" alt="Neomono Icon" />
  <h1>Neomono</h1>
  <p>
    <b>Un tema oscuro vibrante y futurista con acentos neón para desarrolladores modernos.</b>
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

## 📦 Instalación y Uso

1.  Instala **Neomono** desde el Marketplace de VS Code.
2.  Selecciona una variante: `Ctrl+K` `Ctrl+T` > **Neomono**, **Neomono Deep** o **Neomono HC** (alto contraste para accesibilidad).

> [!NOTE]
> Neon Dreams (el efecto glow) está intencionalmente desactivado para **Neomono HC** — los fondos negros puros con `text-shadow` adicional reducirían el ratio de contraste que hace útil la variante HC.

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
| `Neomono: Restablecer personalizaciones de Reactor` | Elimina todas las claves gestionadas por Reactor de tu `workbench.colorCustomizations`. |

### Ajustes

| Ajuste | Por defecto | Descripción |
| --- | --- | --- |
| `neomono.neonDreams.brightness` | `0.45` | Brillo del glow (0.0 transparente, 1.0 brillo máximo). |
| `neomono.neonDreams.glow` | `true` | Habilita el efecto text-shadow de glow. |
| `neomono.neonDreams.showNotifications` | `true` | Muestra notificaciones cuando Neon Dreams cambia de estado. |
| `neomono.reactor.enabled` | `false` | Habilita Reactor Glow (colores reactivos de la interfaz). Opt-in: la primera vez que abras VS Code con un theme Neomono activo se mostrará una notificación para activarlo. |
| `neomono.reactor.intensity` | `"moderate"` | Qué tan intensos deben sentirse los cambios de color. |
| `neomono.reactor.affectStatusBar` | `true` | Permite que Reactor recoloque la barra de estado. |
| `neomono.reactor.affectActivityBar` | `true` | Permite que Reactor recoloque la barra de actividad. |
| `neomono.reactor.affectTitleBar` | `true` | Permite que Reactor tiña la barra de título. |
| `neomono.reactor.affectEditorDiagnostics` | `true` | Intensifica los colores de errores y advertencias del editor. |
| `neomono.reactor.affectEditorBackground` | `false` | Agrega un tinte sutil al fondo del editor según el estado. |
| `neomono.reactor.affectTabBorder` | `true` | Recolorea el borde de la pestaña activa. |

## Seguridad y cómo funciona Neon Dreams

Neon Dreams es opt-in. Cuando ejecutas `Neomono: Habilitar Neon Dreams`, la extensión hace los siguientes cambios en tu instalación local de VS Code (similar a Synthwave '84 y otros temas con efecto glow):

1. Escribe un pequeño `neomono-glow.js` junto al `workbench.html` de VS Code (normalmente en `out/vs/code/electron-sandbox/workbench/` o `electron-browser/...`).
2. Inserta una única etiqueta `<script src="neomono-glow.js"></script>` en `workbench.html`, envuelta en marcadores `<!-- NEOMONO-GLOW-START -->` / `<!-- NEOMONO-GLOW-END -->` para poder retirarse limpiamente después.
3. Actualiza el campo `checksums` de `product.json` de VS Code para que deje de mostrar la advertencia "installation appears to be corrupt". Sólo se tocan las entradas cuyo SHA-256 real ha cambiado.

Qué se ejecuta al cargar el tema: una IIFE pequeña (~80 líneas) que localiza el elemento `.vscode-tokens-styles` de VS Code, copia las reglas de Neomono / Neomono Deep y las reemite con `text-shadow` para que los tokens brillen. **No** hace peticiones de red, no lee ficheros adicionales, no toca otra configuración.

### Qué implica para ti

- Todos los cambios son locales. Nada viaja por la red.
- Si actualizas VS Code, el parche se pierde (porque VS Code reinstala sus ficheros). Vuelve a ejecutar `Neomono: Habilitar Neon Dreams`.
- Modificar archivos del core puede requerir permisos de escritura en el directorio de instalación de VS Code. En Linux/Mac puede implicar ejecutar VS Code con sudo una vez, o instalar VS Code en tu directorio de usuario.

### Cómo deshacerlo a mano

Si algo va mal y la extensión no está disponible, puedes revertir manualmente:

1. Abre `workbench.html` (la ruta aparece en el error de la extensión si lo hay) y elimina todo lo que haya entre `<!-- NEOMONO-GLOW-START -->` y `<!-- NEOMONO-GLOW-END -->`.
2. Borra el fichero `neomono-glow.js` que está al lado.
3. Opcionalmente, restaura `product.json` desde el instalador de VS Code (o convive con la advertencia de corrupción hasta la siguiente actualización de VS Code).

O bien la forma fácil: ejecuta `Neomono: Deshabilitar Neon Dreams` y recarga.

## 🐞 Reportar bugs

Neomono escribe todo lo que hace en un **canal de Output** propio para que
puedas adjuntarlo cuando algo falle:

1. Abre la vista **Output** (`View → Output`, o `Ctrl+Shift+U`).
2. En el desplegable de la derecha, elige **Neomono**.
3. Reproduce el bug y copia el contenido del panel en tu
   [reporte de bug](https://github.com/Monosen/Neomono/issues/new?template=bug_report.yml).

El log incluye marcas de tiempo y nivel (`info` / `warn` / `error`), y los
errores incluyen el stack trace. Nada se envía automáticamente — el panel es
sólo local.

## 📄 Licencia

Licencia MIT - ver [LICENSE](LICENSE).

---

<div align="center">
  Hecho con ❤️ por <a href="https://github.com/Monosen">Monosen</a>
</div>
