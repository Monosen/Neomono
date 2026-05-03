/*
 * Neomono Glow runtime - injected into VS Code's workbench.html.
 *
 * This file has two build-time placeholders (see PLACEHOLDER_* constants in
 * src/glow.ts):
 *   - the TOKEN_REPLACEMENTS literal below is replaced with a JSON object
 *     mapping hex color -> CSS declaration with brightness baked in.
 *   - the DISABLE_GLOW literal below is replaced with 'true' or 'false'.
 *
 * It is plain ES2015 JavaScript and runs verbatim inside VS Code's renderer
 * process. It is copied to out/templates/ at compile time by
 * scripts/copy-templates.js. Never load this file as JS in raw form: running
 * it with placeholders unresolved would throw.
 */

(function () {
    'use strict';

    // Marker on the global object so we can't accidentally inject twice
    // (e.g. if VS Code re-renders workbench).
    if (window.__neomonoGlowInstalled__) {
        return;
    }
    window.__neomonoGlowInstalled__ = true;

    var TOKEN_REPLACEMENTS = __TOKEN_REPLACEMENTS_JSON__;
    var THEME_NAMES = ['Neomono', 'Neomono Deep'];
    var DISABLE_GLOW = __DISABLE_GLOW__;
    var STYLE_ID = 'neomono-glow-styles';
    var POLL_INTERVAL_MS = 500;
    var POLL_MAX_ATTEMPTS = 60;

    function isNeomonoTheme() {
        var htmlTheme = document.documentElement.getAttribute('data-vscode-theme-name');
        var bodyTheme = document.body.getAttribute('data-vscode-theme-name');
        return THEME_NAMES.indexOf(htmlTheme) !== -1 || THEME_NAMES.indexOf(bodyTheme) !== -1;
    }

    function hasNeomonoColors(styles) {
        var keys = Object.keys(TOKEN_REPLACEMENTS);
        for (var i = 0; i < keys.length; i++) {
            if (styles.indexOf(keys[i]) !== -1) {
                return true;
            }
        }
        return false;
    }

    function replaceTokens(styles) {
        var keys = Object.keys(TOKEN_REPLACEMENTS);
        var output = styles;
        for (var i = 0; i < keys.length; i++) {
            var color = keys[i];
            var re = new RegExp('color: ' + color + ';', 'gi');
            output = output.replace(re, TOKEN_REPLACEMENTS[color]);
        }
        return output;
    }

    function initGlow() {
        if (document.getElementById(STYLE_ID)) {
            return true;
        }

        var tokensEl = document.querySelector('.vscode-tokens-styles');
        if (!tokensEl) {
            return false;
        }

        if (!isNeomonoTheme()) {
            return false;
        }

        if (!hasNeomonoColors(tokensEl.innerText)) {
            return false;
        }

        var originalStyles = tokensEl.innerText;
        var updatedStyles = DISABLE_GLOW ? originalStyles : replaceTokens(originalStyles);

        var newStyleTag = document.createElement('style');
        newStyleTag.id = STYLE_ID;
        newStyleTag.textContent = updatedStyles.replace(/(\r\n|\n|\r)/gm, '');
        document.body.appendChild(newStyleTag);

        return true;
    }

    // Try immediately
    initGlow();

    // Watch for DOM changes
    var observer = new MutationObserver(function () {
        if (initGlow()) {
            observer.disconnect();
        }
    });
    observer.observe(document.body, { childList: true, subtree: true });

    // Polling fallback in case MutationObserver misses the tokens element
    var attempts = 0;
    var poll = setInterval(function () {
        attempts++;
        if (initGlow() || attempts > POLL_MAX_ATTEMPTS) {
            clearInterval(poll);
        }
    }, POLL_INTERVAL_MS);
})();
