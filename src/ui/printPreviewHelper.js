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

/**
 * Superpone las anotaciones del usuario (resaltadores, firmas, sellos, lápiz y texto mecanografiado)
 * sobre el canvas de la página al renderizar la vista previa o enviar a la impresora.
 */
export async function drawAnnotationsOnCanvas(ctx, pageNum, scale) {
    if (!ctx) return;

    // 1. Capa de Resaltadores
    try {
        const { highlightAnnotations } = await import('../modules/highlights.js');
        const pageHighlights = (highlightAnnotations || []).filter((h) => h.pageNum === pageNum);
        for (const hl of pageHighlights) {
            if (hl.points && hl.points.length > 1) {
                ctx.save();
                ctx.beginPath();
                ctx.strokeStyle = hl.color || '#facc15';
                ctx.lineWidth = 16 * scale;
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
                const isRgba = hl.color && hl.color.includes('rgba');
                ctx.globalAlpha = isRgba ? 1.0 : (hl.opacity !== undefined ? hl.opacity : 0.4);
                ctx.moveTo(hl.points[0].x * scale, hl.points[0].y * scale);
                for (let i = 1; i < hl.points.length; i++) {
                    ctx.lineTo(hl.points[i].x * scale, hl.points[i].y * scale);
                }
                ctx.stroke();
                ctx.restore();
            }
        }
    } catch (_) {}

    // 2. Capa de Imágenes (Firmas, Sellos, Trazos de Lápiz)
    try {
        const { imageAnnotations } = await import('../modules/signatures.js');
        const pageImages = (imageAnnotations || []).filter((img) => img.pageNum === pageNum);
        for (const imgAnno of pageImages) {
            await new Promise((resolve) => {
                const img = new Image();
                img.onload = () => {
                    ctx.save();
                    ctx.globalAlpha = imgAnno.opacity !== undefined ? imgAnno.opacity : 1.0;
                    ctx.drawImage(
                        img,
                        imgAnno.x * scale,
                        imgAnno.y * scale,
                        imgAnno.width * scale,
                        imgAnno.height * scale
                    );
                    ctx.restore();
                    resolve();
                };
                img.onerror = resolve;
                img.src = imgAnno.dataUrl;
            });
        }
    } catch (_) {}

    // 3. Capa de Texto Mecanografiado (Typewriter)
    try {
        const { annotations } = await import('../modules/typewriter.js');
        const pageTexts = (annotations || []).filter((txt) => txt.pageNum === pageNum);
        for (const txt of pageTexts) {
            ctx.save();
            const fontSize = txt.fontSize * scale;
            ctx.font = `${fontSize}px Arial, sans-serif`;
            ctx.textBaseline = 'top';

            if (txt.bgColor && txt.bgColor !== 'transparent') {
                const bg = txt.bgColor === 'white' ? '#ffffff'
                    : txt.bgColor === 'gray' ? '#f0f0f0'
                    : txt.bgColor === 'black' ? '#000000' : txt.bgColor;
                ctx.fillStyle = bg;
                const textWidth = ctx.measureText(txt.text).width;
                ctx.fillRect(
                    txt.x * scale - (2 * scale),
                    txt.y * scale - (2 * scale),
                    textWidth + (4 * scale),
                    fontSize + (4 * scale)
                );
            }

            ctx.fillStyle = txt.bgColor === 'black' && txt.color === '#000000' ? '#ffffff' : (txt.color || '#000000');
            ctx.fillText(txt.text, txt.x * scale, txt.y * scale);
            ctx.restore();
        }
    } catch (_) {}
}
