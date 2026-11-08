export function getPaperAspect(paperSize) {
    switch (paperSize) {
        case 'legal': return 14 / 8.5;
        case 'letter': return 11 / 8.5;
        case 'a3':
        case 'a4':
        case 'a5': return 297 / 210;
        default: return 297 / 210;
    }
}

export function updatePreviewSheet(modalEl, currentOrientation, currentPageNaturalIsLandscape, currentPreviewPage) {
    if (!modalEl) return;
    const sheetEl = modalEl.querySelector('#print-preview-sheet');
    const canvas = modalEl.querySelector('#print-preview-canvas');
    const badge = modalEl.querySelector('#print-preview-badge');
    if (!sheetEl || !canvas) return;

    const paperSize = modalEl.querySelector('#print-paper-size')?.value || 'auto';
    const scaleMode = modalEl.querySelector('#print-scale-mode')?.value || 'fit';
    const colorMode = modalEl.querySelector('#print-color-mode')?.value || 'color';

    const paperAspect = getPaperAspect(paperSize);
    const isLandscape =
        currentOrientation === 'landscape' ||
        (currentOrientation === 'auto' && currentPageNaturalIsLandscape);

    let sheetW, sheetH;
    if (isLandscape) {
        sheetH = 250;
        sheetW = Math.min(430, Math.round(250 * paperAspect));
    } else {
        sheetH = 360;
        sheetW = Math.round(360 / paperAspect);
    }

    sheetEl.style.width = `${sheetW}px`;
    sheetEl.style.height = `${sheetH}px`;

    canvas.style.objectFit = scaleMode === 'fill' ? 'cover' : 'contain';
    canvas.style.padding = scaleMode === 'actual' ? '18px' : '4px';
    canvas.style.filter = colorMode === 'grayscale' ? 'grayscale(100%) contrast(1.04)' : 'none';

    if (badge) {
        const orientLabel = isLandscape ? 'Horizontal' : 'Vertical';
        const paperLabel = paperSize === 'auto' ? 'Auto' : paperSize.toUpperCase();
        badge.textContent = `Pág. ${currentPreviewPage} · ${paperLabel} (${orientLabel})`;
    }
}
