import { t } from '../translations.js';
import { renderVaults, getEsignLang } from './vault.js';
import { promptNewPassword } from './passwordModal.js';
import { showAlert } from '../confirmModal.js';
import { generateVisualStamp, generateFooterStamp } from './stampRenderer.js';

export async function onGenerateStamp({ inputName, inputDetail, inputExtra, stampModal, esignVault }) {
    const name = inputName.value.trim();
    if (!name) return;
    const detail = inputDetail.value.trim();
    const extra = inputExtra ? inputExtra.value.trim() : '';

    stampModal.style.display = 'none';

    try {
        const now = new Date();
        const activeLang = getEsignLang();

        const [dataUrlEs, footerDataUrlEs, dataUrlEn, footerDataUrlEn] = await Promise.all([
            generateVisualStamp({ name, detail, extra }, now, 'es'),
            generateFooterStamp({ name, detail, extra }, now, 'es'),
            generateVisualStamp({ name, detail, extra }, now, 'en'),
            generateFooterStamp({ name, detail, extra }, now, 'en')
        ]);

        const saved = JSON.parse(localStorage.getItem('inkit_esigns') || '[]');

        const password = await promptNewPassword(
            t('modal.pfx_new.title'),
            t('modal.pfx_new.hint')
        );

        let outPath = null;
        if (password !== null && password.trim() !== '') {
            const { documentDir, join } = await import('@tauri-apps/api/path');
            const { mkdir } = await import('@tauri-apps/plugin-fs');
            const { invoke } = await import('@tauri-apps/api/core');

            const docsPath = await documentDir();
            const folderPath = await join(docsPath, 'Segno PDF', 'Identities');
            await mkdir(folderPath, { recursive: true });

            outPath = await join(folderPath, `${name.replace(/\s+/g, '_')}_Identity.pfx`);

            if (outPath) {
                try {
                    await invoke('create_pfx', { name, detail, password, outPath });
                } catch (e) {
                    console.error(e);
                    await showAlert('Segno', t('alert.error_create_cert') + e, 'error');
                    outPath = null;
                }
            }
        }

        saved.push({
            name,
            detail,
            extra,
            pfxPath: outPath,
            dataUrl: activeLang === 'en' ? dataUrlEn : dataUrlEs,
            footerDataUrl: activeLang === 'en' ? footerDataUrlEn : footerDataUrlEs,
            dataUrlEs,
            footerDataUrlEs,
            dataUrlEn,
            footerDataUrlEn
        });

        localStorage.setItem('inkit_esigns', JSON.stringify(saved));
        renderVaults();
        if (esignVault) esignVault.style.display = 'flex';
    } catch (err) {
        console.error('Error generando identidad:', err);
        await showAlert('Segno', t('alert.error_create_cert') + err, 'error');
    }
}

export async function onImportPfxStamp({
    pfxImportPassword,
    selectedPfxPath,
    stampModal,
    esignVault
}) {
    const password = pfxImportPassword.value;
    if (!selectedPfxPath) {
        await showAlert('Segno', t('alert.pfx_invalid'), 'error');
        return;
    }

    try {
        const { invoke } = await import('@tauri-apps/api/core');
        const info = await invoke('validate_pfx_password', {
            path: selectedPfxPath,
            password
        });

        const name = (info.common_name && info.common_name.trim()) || 'Certificado Digital';
        const detailParts = [];
        if (info.organization) detailParts.push(info.organization);
        if (info.email) detailParts.push(info.email);
        const detail = detailParts.join(' • ');

        let extra = '';
        if (info.valid_to) {
            extra = `Vence: ${info.valid_to}`;
        }

        const now = new Date();
        const activeLang = getEsignLang();

        const [dataUrlEs, footerDataUrlEs, dataUrlEn, footerDataUrlEn] = await Promise.all([
            generateVisualStamp({ name, detail, extra }, now, 'es'),
            generateFooterStamp({ name, detail, extra }, now, 'es'),
            generateVisualStamp({ name, detail, extra }, now, 'en'),
            generateFooterStamp({ name, detail, extra }, now, 'en')
        ]);

        const saved = JSON.parse(localStorage.getItem('inkit_esigns') || '[]');
        saved.push({
            name,
            detail,
            extra,
            pfxPath: selectedPfxPath,
            dataUrl: activeLang === 'en' ? dataUrlEn : dataUrlEs,
            footerDataUrl: activeLang === 'en' ? footerDataUrlEn : footerDataUrlEs,
            dataUrlEs,
            footerDataUrlEs,
            dataUrlEn,
            footerDataUrlEn
        });

        localStorage.setItem('inkit_esigns', JSON.stringify(saved));
        renderVaults();

        stampModal.style.display = 'none';
        if (esignVault) esignVault.style.display = 'flex';
        await showAlert('Segno', t('alert.pfx_imported'), 'info');
    } catch (err) {
        console.error('Error importando PFX:', err);
        const errStr = String(err);
        if (errStr.includes('Contraseña incorrecta') || errStr.includes('mac verify error') || errStr.includes('password')) {
            await showAlert('Segno', t('alert.pfx_wrong_pw'), 'error');
        } else if (errStr.includes('No se encontró certificado')) {
            await showAlert('Segno', t('alert.pfx_missing_cert'), 'error');
        } else {
            await showAlert('Segno', t('alert.error_pfx_import') + err, 'error');
        }
    }
}
