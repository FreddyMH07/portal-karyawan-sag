// js/auth.js (VERSI FINAL YANG DISESUAIKAN)

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
 * Fungsi ini memetakan portalId ke izin yang sesuai di backend.
 * @param {string} portalId - Nama portal dari atribut onclick (misal: 'produksi', 'hr', 'umum')
 */
function accessPortal(portalId) {
    let hasAccess = false;
    let requiredPermissions = [];

    // Gunakan 'switch' untuk memetakan portalId ke izin yang dibutuhkan dari backend
    switch (portalId) {
        case 'produksi':
            // Untuk mengakses Portal Produksi, user harus punya izin 'DATA_HARIAN'
            requiredPermissions = ['DATA_HARIAN'];
            break;

        case 'hr':
            // Portal HR bisa diakses jika user punya izin 'ABSENSI' ATAU 'BOOKING' ATAU 'USERS'
            // Kita masukkan semua kemungkinan izin ke dalam array
            requiredPermissions = ['ABSENSI', 'BOOKING', 'USERS'];
            break;

        case 'umum':
            // Asumsi Portal Umum berisi data Aset dan KPI
            // Bisa diakses jika user punya izin 'ASSET' ATAU 'KPI'
            requiredPermissions = ['ASSET', 'KPI'];
            break;

        default:
            // Jika portalId tidak dikenal, langsung tolak akses
            showAlert('Portal tidak dikenal.', 'warning');
            return;
    }

    // Loop untuk memeriksa apakah user punya SALAH SATU dari izin yang dibutuhkan.
    // Fungsi hasPermission() ini ada di main.js dan akan bekerja dengan benar.
    for (const permission of requiredPermissions) {
        if (hasPermission(permission)) {
            hasAccess = true;
            break; // Jika satu saja izin terpenuhi, langsung beri akses & hentikan loop.
        }
    }

    // Terakhir, arahkan pengguna jika punya akses, atau tampilkan pesan error jika tidak.
    if (hasAccess) {
        window.location.href = `${portalId}.html`;
    } else {
        showAlert('Anda tidak memiliki izin untuk mengakses portal ini.', 'danger');
    }
}
