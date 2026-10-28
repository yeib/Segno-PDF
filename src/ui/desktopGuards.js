/**
 * Bloquea atajos del navegador web y comportamientos indeseables de WebView2
 * para garantizar una experiencia de aplicación de escritorio 100% nativa en el ecosistema Yeib.
 */

function isEditableTextInput(el) {
  if (!el) return false;
  if (el.tagName === 'TEXTAREA' || el.isContentEditable) return true;
  if (el.tagName === 'INPUT') {
    const type = (el.type || 'text').toLowerCase();
    const nonTextTypes = [
      'range',
      'checkbox',
      'radio',
      'button',
      'submit',
      'reset',
      'color',
      'file',
      'image'
    ];
    return !nonTextTypes.includes(type) && !el.readOnly && !el.disabled;
  }
  const editableParent = el.closest && el.closest('input, textarea, [contenteditable="true"]');
  if (editableParent && editableParent !== el) {
    return isEditableTextInput(editableParent);
  }
  return false;
}

export function setupDesktopGuards(options = {}) {
  if (typeof window === 'undefined') return;

  // 1. Bloquear menú contextual nativo de Edge/Chromium, pero PERMITIRLO exclusivamente en inputs de texto y textareas
  // Se excluyen explícitamente sliders (range), checkboxes, radios y botones
  document.addEventListener(
    'contextmenu',
    (e) => {
      const target = e.target;
      if (isEditableTextInput(target)) {
        return;
      }
      e.preventDefault();
    },
    true
  );

  // 2. Prevenir zoom accidental con Ctrl + Scroll del ratón (el visor maneja su propio zoom)
  window.addEventListener(
    'wheel',
    (e) => {
      if (e.ctrlKey) {
        e.preventDefault();
      }
    },
    { passive: false }
  );

  // 3. Bloquear hotkeys parásitos del navegador
  window.addEventListener(
    'keydown',
    (e) => {
      // Desactivar todas las teclas de función F1 a F12
      // EXCEPTO Alt+F4 (para que el usuario siempre pueda cerrar la app con Windows)
      const isFunctionKey = e.key.startsWith('F') && /^F([1-9]|1[0-2])$/.test(e.key);
      if (isFunctionKey && !e.altKey) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }

      // Alt + Flecha Izquierda / Derecha (Navegación web historial atrás/adelante)
      if (
        e.altKey &&
        (e.key === 'ArrowLeft' ||
          e.key === 'ArrowRight' ||
          e.code === 'ArrowLeft' ||
          e.code === 'ArrowRight')
      ) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }

      // Atajos con Ctrl o Meta (Cmd)
      if (e.ctrlKey || e.metaKey) {
        const code = e.code;
        const key = e.key ? e.key.toLowerCase() : '';

        // Ctrl + P (Imprimir) - PERMITIDO en InkIt para imprimir PDF
        if ((code === 'KeyP' || key === 'p') && !options.allowPrint) {
          e.preventDefault();
          e.stopPropagation();
          return;
        }

        // Ctrl + F (Buscar nativo de Edge)
        if ((code === 'KeyF' || key === 'f') && !options.allowSearch) {
          e.preventDefault();
          e.stopPropagation();
          return;
        }

        // Ctrl + U (Ver código fuente HTML)
        if (code === 'KeyU' || key === 'u') {
          e.preventDefault();
          e.stopPropagation();
          return;
        }

        // Ctrl + J (Descargas de Edge)
        if (code === 'KeyJ' || key === 'j') {
          e.preventDefault();
          e.stopPropagation();
          return;
        }

        // Ctrl + H (Historial de Edge)
        if (code === 'KeyH' || key === 'h') {
          e.preventDefault();
          e.stopPropagation();
          return;
        }

        // Ctrl + G (Buscar siguiente en Edge)
        if (code === 'KeyG' || key === 'g') {
          e.preventDefault();
          e.stopPropagation();
          return;
        }

        // Ctrl + S (Guardar página como HTML) - PERMITIDO si allowSave (para guardado de PDF)
        if ((code === 'KeyS' || key === 's') && !options.allowSave) {
          e.preventDefault();
          e.stopPropagation();
          return;
        }

        // Ctrl + O (Abrir archivo web) - PERMITIDO si allowOpen (para abrir PDF)
        if ((code === 'KeyO' || key === 'o') && !options.allowOpen) {
          e.preventDefault();
          e.stopPropagation();
          return;
        }

        // Zoom por teclado (Ctrl + '+' / '-' / '0')
        if (!options.allowZoomKeys && (key === '+' || key === '-' || key === '=' || key === '0')) {
          e.preventDefault();
          e.stopPropagation();
          return;
        }

        // Ctrl + Shift + I / J / C (DevTools Chromium)
        if (
          e.shiftKey &&
          (code === 'KeyI' ||
            code === 'KeyJ' ||
            code === 'KeyC' ||
            key === 'i' ||
            key === 'j' ||
            key === 'c')
        ) {
          e.preventDefault();
          e.stopPropagation();
          return;
        }

        // Ctrl + R / Ctrl + Shift + R (Recargas que reinician la app)
        if (code === 'KeyR' || key === 'r') {
          e.preventDefault();
          e.stopPropagation();
          return;
        }
      }
    },
    { capture: true }
  );
}
