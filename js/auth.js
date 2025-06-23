// js/auth.js (VERSI BARU YANG SUDAH DIPERBAIKI)

/**
 * Memeriksa apakah ada sesi yang valid di localStorage.
 * Versi ini sudah disesuaikan untuk membaca 'sag_session' dari login.js
 */
function getValidSession() {
    try {
        // BACA KUNCI 'sag_session' YANG BENAR
        const sessionStr = localStorage.getItem('sag_session');
        if (!sessionStr) {
            return null; // Tidak ada sesi
        }

        const sessionData = JSON.parse(sessionStr);
        const expiry = localStorage.getItem('sag_session_expiry');

        // Jika 'remember me' tidak dicentang, sesi hanya ada di sessionStorage
        if (!sessionData.rememberMe) {
            const tempSession = sessionStorage.getItem('sag_temp_session');
            return tempSession ? JSON.parse(tempSession) : null;
        }

        // Jika 'remember me' dicentang, cek masa berlakunya
        if (expiry && Date.now() < parseInt(expiry)) {
            // Sesi valid, kembalikan data user
            return sessionData;
        } else {
            // Sesi kedaluwarsa
            localStorage.removeItem('sag_session');
            localStorage.removeItem('sag_session_expiry');
            return null;
        }

    } catch (e) {
        console.error("Gagal memvalidasi sesi:", e);
        return null;
    }
}

/**
 * Menangani klik pada kartu portal di halaman utama.
 * (Tidak ada perubahan di sini, tetap sama)
 */
function accessPortal(portalId) {
    console.log(`Pengguna mencoba mengakses portal: ${portalId}`);
    
    if (typeof hasPermission === 'function' && hasPermission(`access_${portalId}`)) {
        window.location.href = `${portalId}.html`;
    } else if (typeof showAlert === 'function') {
        showAlert('Anda tidak memiliki izin untuk mengakses portal ini.', 'danger');
    } else {
        alert('Anda tidak memiliki izin untuk mengakses portal ini.');
    }
}
