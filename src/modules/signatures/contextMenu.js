import { t } from '../translations.js';
import { imageAnnotations, state } from './state.js';
import {
    applyFooterSize,
    createSizeHandler,
    opacityButtonIds,
    setupAllPages,
    setupDelete,
    setupLink,
    setupOpacity
} from './contextMenuHandlers.js';

export function showImageContextMenu(anno, img, scale, event) {
    const menu = document.getElementById('sig-context-menu');
    if (!menu) return;

    menu.style.display = 'flex';

    const opacityContainer = document.getElementById('sig-ctx-opacity-container');
    if (opacityContainer) opacityContainer.style.display = 'block';

    const bannerButton = document.getElementById('sig-ctx-banner');
    if (bannerButton) {
        bannerButton.style.display = 'flex';
    }

    const linkButton = document.getElementById('sig-ctx-link');
    const master = anno.groupId
        && imageAnnotations.find(item => item.groupId === anno.groupId && item.isMaster);
    if (linkButton) {
        linkButton.style.display = !anno.isMaster && master ? 'inline-flex' : 'none';
        if (!anno.isMaster && master) {
            const isLinked = anno.isLinked;
            linkButton.textContent = t(isLinked ? 'ctx.unlink' : 'ctx.link_master');
            linkButton.dataset.action = isLinked ? 'unlink' : 'link';
        }
    }

    const opacity = anno.opacity || 1.0;
    const activeOpacityButton = opacity >= 0.95 ? 'btn-op-100'
        : opacity >= 0.8 ? 'btn-op-85'
            : opacity >= 0.5 ? 'btn-op-60' : 'btn-op-30';
    opacityButtonIds.forEach(id => {
        document.getElementById(id)?.classList.toggle('active', id === activeOpacityButton);
    });

    const rect = menu.getBoundingClientRect();
    let top = event.clientY;
    let left = event.clientX;
    if (top + rect.height > window.innerHeight) top -= rect.height;
    if (left + rect.width > window.innerWidth) left -= rect.width;
    if (top < 10) top = 10;
    if (left < 10) left = 10;
    menu.style.left = `${left}px`;
    menu.style.top = `${top}px`;
}

export function setupInteractionsMenu(renderImageAnnotation) {
    const menu = document.getElementById('sig-context-menu');
    document.addEventListener('click', event => {
        if (menu && menu.style.display === 'flex' && !menu.contains(event.target)) {
            menu.style.display = 'none';
        }
    });

    document.addEventListener('contextmenu', event => {
        if (menu && menu.style.display === 'flex' && !menu.contains(event.target) && !event.target.classList.contains('img-annotation')) {
            menu.style.display = 'none';
        }
    });

    document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && menu && menu.style.display === 'flex') {
            menu.style.display = 'none';
        }
    });

    setupDelete(menu);
    const applySize = createSizeHandler(menu);
    document.getElementById('sig-ctx-s')?.addEventListener('click', () => applySize('S'));
    document.getElementById('sig-ctx-m')?.addEventListener('click', () => applySize('M'));
    document.getElementById('sig-ctx-l')?.addEventListener('click', () => applySize('L'));
    document.getElementById('sig-ctx-banner')?.addEventListener('click', () => {
        const anno = state.ctxMenuActiveAnno;
        const img = state.ctxMenuActiveImg;
        if (!anno || !img) return;
        applyFooterSize(anno, img, state.ctxMenuActiveScale, menu);
    });
    setupOpacity(menu);
    setupLink();
    setupAllPages(menu, renderImageAnnotation);
}
