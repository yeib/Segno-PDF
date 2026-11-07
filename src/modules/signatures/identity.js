import { t } from '../translations.js';
import { setEsignLang } from './vault.js';
import { signCurrentPdfWithPfx } from './signService.js';
import { onGenerateStamp, onImportPfxStamp } from './identityOps.js';

export { SEAL_TEXTS, formatStampDate, generateVisualStamp, generateFooterStamp } from './stampRenderer.js';
export { signAndExport } from './signService.js';

export function setupIdentity() {
    const btnNewIdentity = document.getElementById('btn-new-identity');
    const btnImportIdentity = document.getElementById('btn-import-identity');
    const btnEsignLangEs = document.getElementById('btn-esign-lang-es');
    const btnEsignLangEn = document.getElementById('btn-esign-lang-en');

    const stampModal = document.getElementById('stamp-modal');
    const tabPfxCreate = document.getElementById('tab-pfx-create');
    const tabPfxImport = document.getElementById('tab-pfx-import');
    const pfxCreateSection = document.getElementById('pfx-create-section');
    const pfxImportSection = document.getElementById('pfx-import-section');
    const stampModalHeading = document.getElementById('stamp-modal-heading');
    const stampModalDesc = document.getElementById('stamp-modal-desc');

    const inputName = document.getElementById('stamp-input-name');
    const inputDetail = document.getElementById('stamp-input-detail');
    const inputExtra = document.getElementById('stamp-input-extra');

    const btnBrowsePfx = document.getElementById('btn-browse-pfx');
    const pfxChosenFilename = document.getElementById('pfx-chosen-filename');
    const pfxImportPassword = document.getElementById('pfx-import-password');

    const btnCancelStamp = document.getElementById('btn-cancel-stamp');
    const btnGenerateStamp = document.getElementById('btn-generate-stamp');
    const esignVault = document.getElementById('esign-vault');

    let currentTab = 'create';
    let selectedPfxPath = null;

    function setTab(tab) {
        currentTab = tab;
        if (tab === 'create') {
            tabPfxCreate?.classList.add('active');
            tabPfxImport?.classList.remove('active');
            if (pfxCreateSection) pfxCreateSection.style.display = 'flex';
            if (pfxImportSection) pfxImportSection.style.display = 'none';
            if (stampModalHeading) stampModalHeading.textContent = t('modal.stamp.title');
            if (stampModalDesc) stampModalDesc.textContent = t('modal.stamp.desc');
            if (btnGenerateStamp) btnGenerateStamp.textContent = t('modal.btn.generate');
        } else {
            tabPfxImport?.classList.add('active');
            tabPfxCreate?.classList.remove('active');
            if (pfxImportSection) pfxImportSection.style.display = 'flex';
            if (pfxCreateSection) pfxCreateSection.style.display = 'none';
            if (stampModalHeading) stampModalHeading.textContent = t('modal.pfx.tab_import');
            if (stampModalDesc) stampModalDesc.textContent = t('modal.pfx.hint');
            if (btnGenerateStamp) btnGenerateStamp.textContent = t('modal.btn.import');
            if (pfxImportPassword) pfxImportPassword.value = '';
        }
    }

    tabPfxCreate?.addEventListener('click', () => setTab('create'));
    tabPfxImport?.addEventListener('click', () => setTab('import'));

    btnEsignLangEs?.addEventListener('click', (e) => {
        e.stopPropagation();
        setEsignLang('es');
    });
    btnEsignLangEn?.addEventListener('click', (e) => {
        e.stopPropagation();
        setEsignLang('en');
    });

    if (btnNewIdentity) {
        btnNewIdentity.addEventListener('click', () => {
            setTab('create');
            if (stampModal) stampModal.style.display = 'flex';
            if (inputName) inputName.value = '';
            if (inputDetail) inputDetail.value = '';
            if (inputExtra) inputExtra.value = '';
            inputName?.focus();
        });
    }

    async function pickPfxFile() {
        const { open } = await import('@tauri-apps/plugin-dialog');
        const selected = await open({
            multiple: false,
            filters: [{ name: 'PKCS#12 Certificate', extensions: ['pfx', 'p12'] }]
        });
        if (!selected) return null;

        selectedPfxPath = selected;
        const fileName = selected.split(/[/\\]/).pop() || '';

        if (pfxChosenFilename) {
            pfxChosenFilename.textContent = fileName;
            pfxChosenFilename.style.color = '#10b981';
        }
        pfxImportPassword?.focus();
        return selected;
    }

    btnBrowsePfx?.addEventListener('click', async () => {
        await pickPfxFile();
    });

    btnImportIdentity?.addEventListener('click', async () => {
        const picked = await pickPfxFile();
        if (!picked) return;
        setTab('import');
        if (stampModal) stampModal.style.display = 'flex';
        pfxImportPassword?.focus();
    });

    const btnSignPfx = document.getElementById('btn-sign-pfx');
    if (btnSignPfx) {
        btnSignPfx.addEventListener('click', () => signCurrentPdfWithPfx());
    }

    btnCancelStamp?.addEventListener('click', () => {
        if (stampModal) stampModal.style.display = 'none';
    });

    btnGenerateStamp?.addEventListener('click', () => {
        if (currentTab === 'create') {
            void onGenerateStamp({ inputName, inputDetail, inputExtra, stampModal, esignVault });
        } else {
            void onImportPfxStamp({
                pfxImportPassword,
                selectedPfxPath,
                stampModal,
                esignVault
            });
        }
    });
}
