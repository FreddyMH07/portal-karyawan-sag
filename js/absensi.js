/**
 * Absensi Management JavaScript
 * Portal Karyawan SAG v3.0
 */

class AbsensiManager {
    constructor() {
        this.absensiData = [];
        this.currentUser = getCurrentUser();
        this.initializeAbsensi();
    }

    initializeAbsensi() {
        this.setDefaultDates();
        this.loadAbsensiData();
        this.initializeEventListeners();
        this.detectLocation();
    }

    setDefaultDates() {
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        
        document.getElementById('startDate').value = startOfMonth.toISOString().split('T')[0];
        document.getElementById('endDate').value = today.toISOString().split('T')[0];
        document.getElementById('tanggalAbsensi').value = today.toISOString().split('T')[0];
    }

    initializeEventListeners() {
        // Form validation
        const form = document.getElementById('absensiForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.submitAbsensi();
            });
        }

        // NIK input untuk auto-fill nama
        const nikInput = document.getElementById('nik');
        if (nikInput) {
            nikInput.addEventListener('blur', () => this.autoFillEmployeeData());
        }

        // Status change handler
        const statusSelect = document.getElementById('statusKehadiran');
        if (statusSelect) {
            statusSelect.addEventListener('change', () => this.handleStatusChange());
        }
    }

    detectLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    document.getElementById('lokasiCheckin').value = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
                },
                (error) => {
                    console.log('Location detection failed:', error);
                    document.getElementById('lokasiCheckin').value = 'Lokasi tidak terdeteksi';
                }
            );
        }
    }

    async autoFillEmployeeData() {
        const nik = document.getElementById('nik').value;
        if (!nik) return;

        // Simulate employee data lookup
        // In real implementation, this would call an API
        const employeeData = this.getEmployeeByNIK(nik);
        if (employeeData) {
            document.getElementById('namaKaryawan').value = employeeData.nama;
            document.getElementById('departemen').value = employeeData.departemen;
        }
    }

    getEmployeeByNIK(nik) {
        // Mock employee data - replace with actual API call
        const employees = {
            '001': { nama: 'John Doe', departemen: 'Produksi' },
            '002': { nama: 'Jane Smith', departemen: 'HR' },
            '003': { nama: 'Bob Johnson', departemen: 'Finance' }
        };
        return employees[nik] || null;
    }

    handleStatusChange() {
        const status = document.getElementById('statusKehadiran').value;
        const jamMasukInput = document.getElementById('jamMasuk');
        const jamKeluarInput = document.getElementById('jamKeluar');
        
        // Auto-set times based on status
        if (status === 'Hadir') {
            if (!jamMasukInput.value) {
                jamMasukInput.value = '08:00';
            }
            if (!jamKeluarInput.value) {
                jamKeluarInput.value = '17:00';
            }
        } else if (status === 'Terlambat') {
            if (!jamMasukInput.value) {
                jamMasukInput.value = '08:30';
            }
        } else if (status === 'Tidak Hadir' || status === 'Izin' || status === 'Sakit') {
            jamMasukInput.value = '';
            jamKeluarInput.value = '';
        }
    }

    async loadAbsensiData() {
        try {
            showLoading(true);
            
            const filters = {
                startDate: document.getElementById('startDate').value,
                endDate: document.getElementById('endDate').value,
                departemen: document.getElementById('departemenFilter').value,
                status: document.getElementById('statusFilter').value
            };

            const response = await callAPI('getAbsensiData', {
                filters: filters,
                userInfo: this.currentUser
            });

            if (response.success) {
                this.absensiData = response.data || [];
                this.updateAbsensiTable();
                this.updateQuickStats();
                showAlert('Data absensi berhasil dimuat', 'success', 2000);
            } else {
                throw new Error(response.error || 'Gagal memuat data absensi');
            }
        } catch (error) {
            console.error('Error loading absensi data:', error);
            showAlert('Gagal memuat data absensi: ' + error.message, 'danger');
        } finally {
            showLoading(false);
        }
    }

    updateAbsensiTable() {
        const tableBody = document.getElementById('absensiTableBody');
        if (!tableBody) return;

        tableBody.innerHTML = '';

        if (this.absensiData.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="11" class="text-center">Tidak ada data absensi</td></tr>';
            return;
        }

        this.absensiData.forEach((absensi, index) => {
            const tr = document.createElement('tr');
            
            const statusBadge = this.getStatusBadge(absensi['Status Kehadiran']);
            const actionButtons = this.getActionButtons(absensi);
            
            tr.innerHTML = `
                <td>${index + 1}</td>
                <td>${formatDateID(absensi.Tanggal)}</td>
                <td>${absensi.NIK}</td>
                <td>${absensi['Nama Karyawan']}</td>
                <td>${absensi.Departemen}</td>
                <td>${absensi.Shift}</td>
                <td>${absensi['Jam Masuk'] || '-'}</td>
                <td>${absensi['Jam Keluar'] || '-'}</td>
                <td>${statusBadge}</td>
                <td>${absensi.Keterangan || '-'}</td>
                <td>${actionButtons}</td>
            `;
            
            tableBody.appendChild(tr);
        });

        // Update record count
        const recordCount = document.getElementById('recordCount');
        if (recordCount) {
            recordCount.textContent = `Total: ${this.absensiData.length} record`;
        }
    }

    getStatusBadge(status) {
        const badges = {
            'Hadir': '<span class="badge bg-success">Hadir</span>',
            'Terlambat': '<span class="badge bg-warning">Terlambat</span>',
            'Tidak Hadir': '<span class="badge bg-danger">Tidak Hadir</span>',
            'Izin': '<span class="badge bg-info">Izin</span>',
            'Sakit': '<span class="badge bg-secondary">Sakit</span>',
            'Cuti': '<span class="badge bg-primary">Cuti</span>'
        };
        return badges[status] || '<span class="badge bg-secondary">Unknown</span>';
    }

    getActionButtons(absensi) {
        const canEdit = this.currentUser.role === 'admin' || this.currentUser.role === 'hr';
        
        let buttons = `<button class="btn btn-sm btn-info" onclick="viewAbsensiDetails('${absensi.ID}')" title="Lihat Detail">
                        <i class="fas fa-eye"></i>
                      </button>`;
        
        if (canEdit) {
            buttons += ` <button class="btn btn-sm btn-warning" onclick="editAbsensi('${absensi.ID}')" title="Edit">
                          <i class="fas fa-edit"></i>
                        </button>`;
        }
        
        return buttons;
    }

    updateQuickStats() {
        const today = new Date().toISOString().split('T')[0];
        const todayData = this.absensiData.filter(item => 
            item.Tanggal && item.Tanggal.includes(today)
        );

        const stats = {
            hadir: todayData.filter(item => item['Status Kehadiran'] === 'Hadir').length,
            terlambat: todayData.filter(item => item['Status Kehadiran'] === 'Terlambat').length,
            tidakHadir: todayData.filter(item => item['Status Kehadiran'] === 'Tidak Hadir').length,
            izinSakit: todayData.filter(item => 
                ['Izin', 'Sakit', 'Cuti'].includes(item['Status Kehadiran'])
            ).length
        };

        document.getElementById('hadirHariIni').textContent = stats.hadir;
        document.getElementById('terlambat').textContent = stats.terlambat;
        document.getElementById('tidakHadir').textContent = stats.tidakHadir;
        document.getElementById('izinSakit').textContent = stats.izinSakit;
    }

    async submitAbsensi() {
        try {
            const formData = this.getFormData();
            
            if (!this.validateFormData(formData)) {
                return;
            }

            showLoading(true);

            const response = await callAPI('submitAbsensi', {
                absensiData: formData,
                userInfo: this.currentUser
            });

            if (response.success) {
                showAlert('Data absensi berhasil disimpan dengan ID: ' + response.absensiId, 'success');
                this.resetForm();
                this.closeModal();
                await this.loadAbsensiData();
            } else {
                throw new Error(response.error || 'Gagal menyimpan absensi');
            }
        } catch (error) {
            console.error('Error submitting absensi:', error);
            showAlert('Gagal menyimpan absensi: ' + error.message, 'danger');
        } finally {
            showLoading(false);
        }
    }

    getFormData() {
        return {
            tanggal: document.getElementById('tanggalAbsensi').value,
            nik: document.getElementById('nik').value,
            namaKaryawan: document.getElementById('namaKaryawan').value,
            departemen: document.getElementById('departemen').value,
            shift: document.getElementById('shift').value,
            jamMasuk: document.getElementById('jamMasuk').value,
            jamKeluar: document.getElementById('jamKeluar').value,
            statusKehadiran: document.getElementById('statusKehadiran').value,
            keterangan: document.getElementById('keterangan').value,
            lokasiCheckin: document.getElementById('lokasiCheckin').value
        };
    }

    validateFormData(data) {
        if (!data.tanggal) {
            showAlert('Tanggal harus diisi', 'warning');
            return false;
        }

        if (!data.nik) {
            showAlert('NIK harus diisi', 'warning');
            return false;
        }

        if (!data.namaKaryawan.trim()) {
            showAlert('Nama karyawan harus diisi', 'warning');
            return false;
        }

        if (!data.departemen) {
            showAlert('Departemen harus dipilih', 'warning');
            return false;
        }

        if (!data.shift) {
            showAlert('Shift harus dipilih', 'warning');
            return false;
        }

        if (!data.statusKehadiran) {
            showAlert('Status kehadiran harus dipilih', 'warning');
            return false;
        }

        // Validate time format if present
        if (data.jamMasuk && data.jamKeluar && data.jamMasuk >= data.jamKeluar) {
            showAlert('Jam keluar harus lebih besar dari jam masuk', 'warning');
            return false;
        }

        return true;
    }

    resetForm() {
        document.getElementById('absensiForm').reset();
        this.setDefaultDates();
        this.detectLocation();
    }

    closeModal() {
        const modal = bootstrap.Modal.getInstance(document.getElementById('absensiModal'));
        if (modal) {
            modal.hide();
        }
    }

    exportAbsensi() {
        if (this.absensiData.length === 0) {
            showAlert('Tidak ada data untuk diekspor', 'warning');
            return;
        }

        const filename = `absensi_${new Date().toISOString().split('T')[0]}.csv`;
        exportToCSV(this.absensiData, filename);
        showAlert('Data absensi berhasil diekspor', 'success');
    }
}

// Global functions for button handlers
function loadAbsensiData() {
    if (window.absensiManager) {
        window.absensiManager.loadAbsensiData();
    }
}

function submitAbsensi() {
    if (window.absensiManager) {
        window.absensiManager.submitAbsensi();
    }
}

function exportAbsensi() {
    if (window.absensiManager) {
        window.absensiManager.exportAbsensi();
    }
}

function viewAbsensiDetails(absensiId) {
    const absensi = window.absensiManager.absensiData.find(a => a.ID === absensiId);
    if (absensi) {
        const details = `
            <strong>ID:</strong> ${absensi.ID}<br>
            <strong>Tanggal:</strong> ${formatDateID(absensi.Tanggal)}<br>
            <strong>NIK:</strong> ${absensi.NIK}<br>
            <strong>Nama:</strong> ${absensi['Nama Karyawan']}<br>
            <strong>Departemen:</strong> ${absensi.Departemen}<br>
            <strong>Shift:</strong> ${absensi.Shift}<br>
            <strong>Jam Masuk:</strong> ${absensi['Jam Masuk'] || '-'}<br>
            <strong>Jam Keluar:</strong> ${absensi['Jam Keluar'] || '-'}<br>
            <strong>Status:</strong> ${absensi['Status Kehadiran']}<br>
            <strong>Lokasi:</strong> ${absensi['Lokasi Check-in'] || '-'}<br>
            <strong>Keterangan:</strong> ${absensi.Keterangan || '-'}
        `;
        
        showAlert(details, 'info', 10000);
    }
}

function editAbsensi(absensiId) {
    showAlert('Fitur edit absensi akan segera tersedia', 'info');
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    if (requireAuth()) {
        window.absensiManager = new AbsensiManager();
    }
});
