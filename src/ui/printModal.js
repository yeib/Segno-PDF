import { invoke } from '@tauri-apps/api/core';
import { getCurrentPdf, getCurrentPdfPath } from '../core/pdfViewer.js';
import { showAlert } from '../modules/confirmModal.js';
import { t } from '../modules/translations.js';
import { buildPrintModalHtml, ICONS } from './printModalTemplate.js';
import { updatePreviewSheet as updateSheetLayout, drawAnnotationsOnCanvas } from './printPreviewHelper.js';

let modalEl = null;
let currentPreviewPage = 1;
let currentCopies = 1;
let currentRangeMode = 'all';
let currentOrientation = 'auto';
let printerList = [];
let currentPageNaturalIsLandscape = false;

function ensureModal() {
    if (modalEl) return modalEl;

    modalEl = document.createElement('div');
    modalEl.id = 'yeib-print-modal';
    modalEl.className = 'modal-overlay';
    modalEl.style.cssText = 'position: fixed; inset: 0; z-index: 100095; display: none; align-items: center; justify-content: center; backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); background: rgba(5, 8, 15, 0.82); box-sizing: border-box; padding: 16px;';
    modalEl.innerHTML = buildPrintModalHtml();

    document.body.appendChild(modalEl);

    modalEl.querySelector('#btn-yeib-print-close').addEventListener('click', closePrintModal);
    modalEl.querySelector('#btn-yeib-print-cancel').addEventListener('click', closePrintModal);
    modalEl.querySelector('#btn-yeib-print-submit').addEventListener('click', handleDispatchPrint);
    modalEl.querySelector('#btn-refresh-printers').addEventListener('click', loadPrinters);

    // Copies events
    modalEl.querySelector('#btn-copies-dec').addEventListener('click', () => updateCopies(currentCopies - 1));
    modalEl.querySelector('#btn-copies-inc').addEventListener('click', () => updateCopies(currentCopies + 1));

    // Range segmented control
    modalEl.querySelector('#btn-range-all').addEventListener('click', () => setRangeMode('all'));
    modalEl.querySelector('#btn-range-custom').addEventListener('click', () => setRangeMode('custom'));

    // Orientation segmented control
    modalEl.querySelector('#btn-orient-auto').addEventListener('click', () => setOrientation('auto'));
    modalEl.querySelector('#btn-orient-portrait').addEventListener('click', () => setOrientation('portrait'));
    modalEl.querySelector('#btn-orient-landscape').addEventListener('click', () => setOrientation('landscape'));

    // Reactive controls
    modalEl.querySelector('#print-paper-size').addEventListener('change', updatePreviewSheet);
    modalEl.querySelector('#print-scale-mode').addEventListener('change', updatePreviewSheet);
    modalEl.querySelector('#print-color-mode').addEventListener('change', updatePreviewSheet);

    // Preview page buttons
    modalEl.querySelector('#btn-print-prev-page').addEventListener('click', () => {
        const pdf = getCurrentPdf();
        if (pdf && currentPreviewPage > 1) renderPreview(currentPreviewPage - 1);
    });
    modalEl.querySelector('#btn-print-next-page').addEventListener('click', () => {
        const pdf = getCurrentPdf();
        if (pdf && currentPreviewPage < pdf.numPages) renderPreview(currentPreviewPage + 1);
    });

    modalEl.addEventListener('click', (e) => {
        if (e.target === modalEl) closePrintModal();
    });

    return modalEl;
}

function updateCopies(val) {
    currentCopies = Math.max(1, Math.min(99, val));
    modalEl.querySelector('#print-copies-val').textContent = currentCopies;
}

function setRangeMode(mode) {
    currentRangeMode = mode;
    const isAll = mode === 'all';
    const btnAll = modalEl.querySelector('#btn-range-all');
    const btnCustom = modalEl.querySelector('#btn-range-custom');
    const inputCont = modalEl.querySelector('#print-custom-range-container');

    btnAll.style.background = isAll ? '#4f46e5' : 'transparent';
    btnAll.style.color = isAll ? '#fff' : '#94a3b8';
    btnCustom.style.background = isAll ? 'transparent' : '#4f46e5';
    btnCustom.style.color = isAll ? '#94a3b8' : '#fff';
    inputCont.style.display = isAll ? 'none' : 'flex';
    if (!isAll) inputCont.querySelector('input').focus();
}

function setOrientation(mode) {
    currentOrientation = mode;
    ['auto', 'portrait', 'landscape'].forEach((m) => {
        const btn = modalEl.querySelector(`#btn-orient-${m}`);
        const active = m === mode;
        btn.style.background = active ? '#4f46e5' : 'transparent';
        btn.style.color = active ? '#fff' : '#94a3b8';
    });
    updatePreviewSheet();
}

function updatePreviewSheet() {
    updateSheetLayout(modalEl, currentOrientation, currentPageNaturalIsLandscape, currentPreviewPage);
}

export async function openPrintModal() {
    const pdf = getCurrentPdf();
    if (!pdf) {
        await showAlert(t('alert.title.attention') || 'Atención', t('alert.open_first') || 'Abre un PDF primero', 'warning');
        return;
    }

    const modal = ensureModal();
    const path = getCurrentPdfPath() || '';
    const fileName = path.split(/[/\\]/).pop() || 'Documento';
    modal.querySelector('#print-modal-title').textContent = `Impresión Nativa Yeib · ${fileName}`;
    modal.querySelector('#btn-range-all').textContent = `Todas (${pdf.numPages})`;

    modal.style.display = 'flex';
    currentPreviewPage = 1;
    updateCopies(1);
    setRangeMode('all');
    setOrientation('auto');

    await renderPreview(1);
    await loadPrinters();
}

export function closePrintModal() {
    if (modalEl) modalEl.style.display = 'none';
}

async function renderPreview(pageNum) {
    const pdf = getCurrentPdf();
    if (!pdf) return;
    try {
        currentPreviewPage = Math.max(1, Math.min(pdf.numPages, pageNum));
        const page = await pdf.getPage(currentPreviewPage);
        const viewport = page.getViewport({ scale: 1.0 });
        currentPageNaturalIsLandscape = viewport.width > viewport.height;

        const canvas = modalEl.querySelector('#print-preview-canvas');
        const ctx = canvas.getContext('2d');
        const scaledViewport = page.getViewport({ scale: 2.0 });
        canvas.width = scaledViewport.width;
        canvas.height = scaledViewport.height;

        await page.render({ canvasContext: ctx, viewport: scaledViewport }).promise;
        await drawAnnotationsOnCanvas(ctx, currentPreviewPage, 2.0);
        modalEl.querySelector('#print-preview-page-info').textContent = `${currentPreviewPage} de ${pdf.numPages}`;
        updatePreviewSheet();
    } catch (e) {
        console.warn('Error en preview de impresión:', e);
    }
}

async function loadPrinters() {
    const select = modalEl.querySelector('#print-printer-select');
    const statusEl = modalEl.querySelector('#print-printer-status');
    select.innerHTML = '<option value="">Buscando impresoras...</option>';
    try {
        printerList = await invoke('yeib_list_printers');
        select.innerHTML = '';
        if (!printerList || printerList.length === 0) {
            select.innerHTML = '<option value="">No se encontraron impresoras</option>';
            statusEl.innerHTML = '<span style="color: #ef4444;">Sin impresoras</span>';
            return;
        }
        for (const p of printerList) {
            const opt = document.createElement('option');
            opt.value = p.name;
            opt.textContent = `${p.name}${p.isDefault ? ' (Predeterminada)' : ''}`;
            if (p.isDefault) opt.selected = true;
            select.appendChild(opt);
        }
        statusEl.innerHTML = `<span style="display: flex; align-items: center; gap: 4px; color: #34d399;">${ICONS.check} Lista</span>`;
    } catch (err) {
        select.innerHTML = '<option value="">Error listando impresoras</option>';
        statusEl.innerHTML = '<span style="color: #ef4444;">Error al listar</span>';
    }
}

async function handleDispatchPrint() {
    const pdf = getCurrentPdf();
    if (!pdf) return;

    const submitBtn = modalEl.querySelector('#btn-yeib-print-submit');
    submitBtn.disabled = true;
    submitBtn.style.opacity = '0.6';
    submitBtn.querySelector('span').textContent = 'Procesando...';

    try {
        const printerName = modalEl.querySelector('#print-printer-select').value;
        const pageRange = currentRangeMode === 'all' ? '' : modalEl.querySelector('#print-range-input').value.trim();
        const paperSize = modalEl.querySelector('#print-paper-size').value;
        const scaleMode = modalEl.querySelector('#print-scale-mode').value;
        const colorMode = modalEl.querySelector('#print-color-mode').value;

        const total = pdf.numPages;
        const pagesDataUrls = [];
        for (let i = 1; i <= total; i++) {
            const page = await pdf.getPage(i);
            const viewport = page.getViewport({ scale: 2.0 });
            const canvas = document.createElement('canvas');
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            await page.render({ canvasContext: ctx, viewport }).promise;
            await drawAnnotationsOnCanvas(ctx, i, 2.0);
            pagesDataUrls.push(canvas.toDataURL('image/png'));
        }

        const path = getCurrentPdfPath() || 'Documento';
        const fileName = path.split(/[/\\]/).pop().replace(/\.[^/.]+$/, '');

        const spec = {
            printerName,
            documentTitle: fileName || 'Documento Yeib',
            copies: currentCopies,
            collate: true,
            pageRange,
            orientation: currentOrientation,
            colorMode,
            scaleMode,
            paperSize
        };

        const result = await invoke('yeib_print_pages', {
            spec,
            pages: pagesDataUrls,
            pagesBase64: pagesDataUrls
        });

        closePrintModal();
        await showAlert('Impresión Exitosa', `Documento enviado a "${result.printerName}" (${result.pagesPrinted} páginas).`, 'success');
    } catch (err) {
        console.error('Error al imprimir:', err);
        await showAlert('Error al imprimir', String(err?.message || err), 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.style.opacity = '1';
        submitBtn.querySelector('span').textContent = 'Imprimir';
    }
}
