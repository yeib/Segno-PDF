import { promptPassword } from '../modules/signatures/passwordModal.js';
import { t } from '../modules/translations.js';

/**
 * Vincula el manejador de contraseñas de PDF.js a la tarea de carga activa.
 * @param {import('pdfjs-dist').PDFDocumentLoadingTask} loadingTask
 */
export function attachPdfPasswordHandler(loadingTask) {
    if (!loadingTask) return;
    loadingTask.onPassword = async (updatePassword, reason) => {
        // reason === 2 significa contraseña incorrecta
        const isWrong = reason === 2;
        const hint = isWrong ? t('modal.pw.pdf_wrong') : t('modal.pw.pdf_hint');
        const pwd = await promptPassword(t('modal.pw.pdf_title'), hint);
        if (pwd !== null) {
            updatePassword(pwd);
        } else {
            updatePassword(new Error('PASSWORD_CANCELLED'));
        }
    };
}

/**
 * Sanitiza el mensaje de error de carga de PDF para evitar spanglish y guiar al usuario.
 * @param {Error} error
 * @returns {string}
 */
export function formatPdfLoadError(error) {
    if (!error) return t('viewer.error_open');
    if (
        error.name === 'PasswordException' ||
        error.message?.includes('Password') ||
        error.message?.includes('PASSWORD_CANCELLED') ||
        error.message?.includes('No password given')
    ) {
        return t('viewer.password_required');
    }
    return `${t('viewer.error_open')} (${error.message || ''})`.trim();
}
