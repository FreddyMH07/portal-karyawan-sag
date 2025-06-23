// js/auth.js

function getValidSession() {
    try {
        const sessionData = localStorage.getItem('currentUser');
        const sessionExpiry = localStorage.getItem('sag_session_expiry');

        if (!sessionData || !sessionExpiry) return null;
        if (new Date(sessionExpiry) < new Date()) {
            localStorage.removeItem('currentUser');
            localStorage.removeItem('sag_session_expiry');
            return null;
        }
        return { user: JSON.parse(sessionData) };
    } catch (e) {
        console.error("Gagal memvalidasi sesi:", e);
        return null;
    }
}

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
