// Template y estructura HTML del modal de impresión nativa Yeib (Dark Glassmorphism)

export const ICONS = {
    printer: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6"/><rect x="6" y="14" width="12" height="8" rx="1"/></svg>`,
    refresh: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 21h5v-5"/></svg>`,
    check: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>`,
    close: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>`
};

export function buildPrintModalHtml() {
    return `
      <div style="width: 100%; max-width: 900px; height: 580px; max-height: 88vh; display: flex; flex-direction: column; overflow: hidden; border-radius: 16px; background-color: #0a0e17; border: 1px solid rgba(255, 255, 255, 0.1); box-shadow: 0 25px 80px rgba(0, 0, 0, 0.85); color: #f8fafc;">
        <!-- Header -->
        <div style="display: flex; align-items: center; justify-content: space-between; padding: 14px 20px; border-bottom: 1px solid rgba(255, 255, 255, 0.08); background: rgba(255, 255, 255, 0.02); flex-shrink: 0;">
          <div style="display: flex; align-items: center; gap: 12px; min-width: 0;">
            <div style="width: 36px; height: 36px; border-radius: 10px; background: rgba(99, 102, 241, 0.15); border: 1px solid rgba(99, 102, 241, 0.35); display: flex; align-items: center; justify-content: center; color: #818cf8; flex-shrink: 0;">
              ${ICONS.printer}
            </div>
            <div style="min-width: 0;">
              <h2 id="print-modal-title" style="font-size: 14px; font-weight: 700; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Impresión Nativa Yeib</h2>
              <p style="font-size: 11px; color: #94a3b8; margin: 2px 0 0 0;">Motor directo Win32 GDI sin diálogo de navegador</p>
            </div>
          </div>
          <button id="btn-yeib-print-close" type="button" style="width: 30px; height: 30px; border-radius: 8px; background: rgba(255, 255, 255, 0.06); border: 1px solid rgba(255, 255, 255, 0.1); color: #94a3b8; display: flex; align-items: center; justify-content: center; cursor: pointer;">
            ${ICONS.close}
          </button>
        </div>

        <!-- Body -->
        <div style="flex: 1; display: flex; min-height: 0; overflow: hidden;">
          <!-- Left: Preview Pane -->
          <div style="flex: 1; display: flex; flex-direction: column; background: #070a12; border-right: 1px solid rgba(255, 255, 255, 0.08); min-width: 0; overflow: hidden;">
            <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px 18px; border-bottom: 1px solid rgba(255, 255, 255, 0.06); background: rgba(255, 255, 255, 0.02); flex-shrink: 0;">
              <span style="font-size: 11px; font-weight: 600; letter-spacing: 0.05em; color: #94a3b8; text-transform: uppercase;">Vista previa de impresión</span>
              <div style="display: flex; align-items: center; gap: 8px;">
                <button id="btn-print-prev-page" type="button" style="background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); color: #94a3b8; width: 22px; height: 22px; border-radius: 4px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 11px;">‹</button>
                <span id="print-preview-page-info" style="padding: 2px 8px; border-radius: 12px; background: rgba(99, 102, 241, 0.15); border: 1px solid rgba(99, 102, 241, 0.3); color: #a5b4fc; font-size: 11px; font-weight: 500;">Página 1</span>
                <button id="btn-print-next-page" type="button" style="background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); color: #94a3b8; width: 22px; height: 22px; border-radius: 4px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 11px;">›</button>
              </div>
            </div>
            <div style="flex: 1; display: flex; align-items: center; justify-content: center; padding: 24px; min-height: 0; overflow: hidden; background: radial-gradient(circle at center, rgba(30, 41, 59, 0.35) 0%, rgba(7, 10, 18, 0.8) 100%);">
              <div id="print-preview-sheet" style="position: relative; width: 255px; height: 360px; background: #ffffff; border-radius: 6px; box-shadow: 0 16px 45px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.12); overflow: hidden; display: flex; align-items: center; justify-content: center; transition: width 0.28s cubic-bezier(0.16, 1, 0.3, 1), height 0.28s cubic-bezier(0.16, 1, 0.3, 1); box-sizing: border-box;">
                <canvas id="print-preview-canvas" style="width: 100%; height: 100%; object-fit: contain; padding: 4px; box-sizing: border-box; display: block; transition: filter 0.2s ease;"></canvas>
                <span id="print-preview-badge" style="position: absolute; bottom: 8px; right: 8px; padding: 2px 7px; border-radius: 4px; background: rgba(15, 23, 42, 0.85); color: #ffffff; font-size: 10px; font-weight: 600; pointer-events: none; letter-spacing: 0.02em; backdrop-filter: blur(4px);">Pág. 1</span>
              </div>
            </div>
          </div>

          <!-- Right: Controls Pane -->
          <div style="width: 320px; flex-shrink: 0; padding: 16px 20px; overflow-y: auto; display: flex; flex-direction: column; gap: 14px; background: #0c111d; box-sizing: border-box;">
            <!-- Printer -->
            <div style="display: flex; flex-direction: column; gap: 8px;">
              <div style="display: flex; align-items: center; justify-content: space-between;">
                <label style="font-size: 12px; font-weight: 600; color: #f8fafc; display: flex; align-items: center; gap: 6px;">
                  <span style="color: #818cf8;">${ICONS.printer}</span> Destino de impresión
                </label>
                <button id="btn-refresh-printers" type="button" title="Actualizar impresoras" style="background: none; border: none; color: #94a3b8; cursor: pointer; padding: 2px; display: flex;">
                  ${ICONS.refresh}
                </button>
              </div>
              <select id="print-printer-select" style="width: 100%; padding: 8px 10px; border-radius: 8px; background: #131926; border: 1px solid rgba(255, 255, 255, 0.12); color: #f8fafc; font-size: 12px; outline: none; box-sizing: border-box; cursor: pointer;"></select>
              <div id="print-printer-status" style="display: flex; align-items: center; justify-content: space-between; font-size: 11px; color: #94a3b8;">
                <span style="display: flex; align-items: center; gap: 4px; color: #34d399;">${ICONS.check} Lista</span>
              </div>
            </div>

            <div style="height: 1px; background: rgba(255, 255, 255, 0.07);"></div>

            <!-- Copies -->
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <div style="display: flex; flex-direction: column;">
                <span style="font-size: 12px; font-weight: 600;">Copias</span>
                <span style="font-size: 11px; color: #64748b;">Número de juegos</span>
              </div>
              <div style="display: flex; align-items: center; gap: 6px;">
                <button id="btn-copies-dec" type="button" style="width: 28px; height: 28px; border-radius: 6px; background: rgba(255, 255, 255, 0.08); border: 1px solid rgba(255, 255, 255, 0.12); color: #fff; cursor: pointer; font-weight: bold; display: flex; align-items: center; justify-content: center;">-</button>
                <span id="print-copies-val" style="min-width: 24px; text-align: center; font-size: 13px; font-weight: 600;">1</span>
                <button id="btn-copies-inc" type="button" style="width: 28px; height: 28px; border-radius: 6px; background: rgba(255, 255, 255, 0.08); border: 1px solid rgba(255, 255, 255, 0.12); color: #fff; cursor: pointer; font-weight: bold; display: flex; align-items: center; justify-content: center;">+</button>
              </div>
            </div>

            <div style="height: 1px; background: rgba(255, 255, 255, 0.07);"></div>

            <!-- Page Range -->
            <div style="display: flex; flex-direction: column; gap: 8px;">
              <span style="font-size: 12px; font-weight: 600;">Páginas</span>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; padding: 3px; border-radius: 8px; background: #131926;">
                <button id="btn-range-all" type="button" style="padding: 6px; border-radius: 6px; border: none; font-size: 11px; font-weight: 600; cursor: pointer; background: #4f46e5; color: #fff; transition: all 0.15s ease;">Todas</button>
                <button id="btn-range-custom" type="button" style="padding: 6px; border-radius: 6px; border: none; font-size: 11px; font-weight: 600; cursor: pointer; background: transparent; color: #94a3b8; transition: all 0.15s ease;">Personalizado</button>
              </div>
              <div id="print-custom-range-container" style="display: none; flex-direction: column; gap: 4px;">
                <input id="print-range-input" type="text" placeholder="Ej: 1-3, 5" value="" style="width: 100%; padding: 6px 10px; border-radius: 8px; background: #131926; border: 1px solid rgba(255, 255, 255, 0.12); color: #f8fafc; font-size: 12px; outline: none; box-sizing: border-box;" />
              </div>
            </div>

            <div style="height: 1px; background: rgba(255, 255, 255, 0.07);"></div>

            <!-- Orientation -->
            <div style="display: flex; flex-direction: column; gap: 8px;">
              <span style="font-size: 12px; font-weight: 600;">Orientación</span>
              <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 4px; padding: 3px; border-radius: 8px; background: #131926;">
                <button id="btn-orient-auto" type="button" style="padding: 6px; border-radius: 6px; border: none; font-size: 11px; font-weight: 600; cursor: pointer; background: #4f46e5; color: #fff;">Auto</button>
                <button id="btn-orient-portrait" type="button" style="padding: 6px; border-radius: 6px; border: none; font-size: 11px; font-weight: 600; cursor: pointer; background: transparent; color: #94a3b8;">Vertical</button>
                <button id="btn-orient-landscape" type="button" style="padding: 6px; border-radius: 6px; border: none; font-size: 11px; font-weight: 600; cursor: pointer; background: transparent; color: #94a3b8;">Horizontal</button>
              </div>
            </div>

            <div style="height: 1px; background: rgba(255, 255, 255, 0.07);"></div>

            <!-- Paper & Scale -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
              <div style="display: flex; flex-direction: column; gap: 6px;">
                <span style="font-size: 12px; font-weight: 600;">Papel</span>
                <select id="print-paper-size" style="width: 100%; padding: 7px 8px; border-radius: 8px; background: #131926; border: 1px solid rgba(255, 255, 255, 0.12); color: #f8fafc; font-size: 12px; outline: none; box-sizing: border-box; cursor: pointer;">
                  <option value="auto">Auto</option>
                  <option value="letter">Carta</option>
                  <option value="a4">A4</option>
                  <option value="legal">Oficio</option>
                  <option value="a3">A3</option>
                  <option value="a5">A5</option>
                </select>
              </div>
              <div style="display: flex; flex-direction: column; gap: 6px;">
                <span style="font-size: 12px; font-weight: 600;">Ajuste</span>
                <select id="print-scale-mode" style="width: 100%; padding: 7px 8px; border-radius: 8px; background: #131926; border: 1px solid rgba(255, 255, 255, 0.12); color: #f8fafc; font-size: 12px; outline: none; box-sizing: border-box; cursor: pointer;">
                  <option value="fit">Ajustar</option>
                  <option value="actual">Real</option>
                  <option value="fill">Rellenar</option>
                </select>
              </div>
            </div>

            <!-- Color -->
            <div style="display: flex; flex-direction: column; gap: 6px;">
              <span style="font-size: 12px; font-weight: 600;">Color</span>
              <select id="print-color-mode" style="width: 100%; padding: 7px 8px; border-radius: 8px; background: #131926; border: 1px solid rgba(255, 255, 255, 0.12); color: #f8fafc; font-size: 12px; outline: none; box-sizing: border-box; cursor: pointer;">
                <option value="color">A Color</option>
                <option value="grayscale">Blanco y negro</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div style="display: flex; align-items: center; justify-content: flex-end; gap: 10px; padding: 12px 20px; border-top: 1px solid rgba(255, 255, 255, 0.08); background: #070a12; flex-shrink: 0;">
          <button id="btn-yeib-print-cancel" type="button" style="padding: 7px 16px; border-radius: 8px; background: rgba(255, 255, 255, 0.06); border: 1px solid rgba(255, 255, 255, 0.12); color: #cbd5e1; font-size: 12px; font-weight: 600; cursor: pointer;">Cancelar</button>
          <button id="btn-yeib-print-submit" type="button" style="display: flex; align-items: center; gap: 6px; padding: 7px 20px; border-radius: 8px; background: #4f46e5; border: none; color: #ffffff; font-size: 12px; font-weight: 600; cursor: pointer; transition: opacity 0.15s ease;">
            ${ICONS.printer} <span>Imprimir</span>
          </button>
        </div>
      </div>
    `;
}
