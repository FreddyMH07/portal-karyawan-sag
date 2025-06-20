/**
 * Booking Management JavaScript
 * Portal Karyawan SAG v3.0
 */

class BookingManager {
    constructor() {
        this.bookingData = [];
        this.currentUser = getCurrentUser();
        this.initializeBooking();
    }

    initializeBooking() {
        this.setDefaultDates();
        this.loadBookingData();
        this.initializeEventListeners();
    }

    setDefaultDates() {
        const today = new Date();
        const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
        
        document.getElementById('startDate').value = today.toISOString().split('T')[0];
        document.getElementById('endDate').value = nextWeek.toISOString().split('T')[0];
        document.getElementById('tanggalBooking').value = today.toISOString().split('T')[0];
    }

    initializeEventListeners() {
        // Form validation
        const form = document.getElementById('bookingForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.submitBooking();
            });
        }

        // Time validation
        const waktuMulai = document.getElementById('waktuMulai');
        const waktuSelesai = document.getElementById('waktuSelesai');
        
        if (waktuMulai && waktuSelesai) {
            waktuMulai.addEventListener('change', () => this.validateTime());
            waktuSelesai.addEventListener('change', () => this.validateTime());
        }
    }

    validateTime() {
        const waktuMulai = document.getElementById('waktuMulai').value;
        const waktuSelesai = document.getElementById('waktuSelesai').value;
        
        if (waktuMulai && waktuSelesai && waktuMulai >= waktuSelesai) {
            showAlert('Waktu selesai harus lebih besar dari waktu mulai', 'warning');
            document.getElementById('waktuSelesai').value = '';
        }
    }

    async loadBookingData() {
        try {
            showLoading(true);
            
            const filters = {
                startDate: document.getElementById('startDate').value,
                endDate: document.getElementById('endDate').value,
                status: document.getElementById('statusFilter').value
            };

            const response = await callAPI('getBookingData', {
                filters: filters,
                userInfo: this.currentUser
            });

            if (response.success) {
                this.bookingData = response.data || [];
                this.updateBookingTable();
                showAlert('Data booking berhasil dimuat', 'success', 2000);
            } else {
                throw new Error(response.error || 'Gagal memuat data booking');
            }
        } catch (error) {
            console.error('Error loading booking data:', error);
            showAlert('Gagal memuat data booking: ' + error.message, 'danger');
        } finally {
            showLoading(false);
        }
    }

    updateBookingTable() {
        const tableBody = document.getElementById('bookingTableBody');
        if (!tableBody) return;

        tableBody.innerHTML = '';

        if (this.bookingData.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="9" class="text-center">Tidak ada data booking</td></tr>';
            return;
        }

        this.bookingData.forEach((booking, index) => {
            const tr = document.createElement('tr');
            
            const statusBadge = this.getStatusBadge(booking.Status);
            const actionButtons = this.getActionButtons(booking);
            
            tr.innerHTML = `
                <td>${index + 1}</td>
                <td><code>${booking.ID}</code></td>
                <td>${formatDateID(booking['Tanggal Booking'])}</td>
                <td>${booking['Waktu Mulai']} - ${booking['Waktu Selesai']}</td>
                <td>${booking['Ruangan/Fasilitas']}</td>
                <td>${booking.Keperluan}</td>
                <td>${booking.Pemohon}</td>
                <td>${statusBadge}</td>
                <td>${actionButtons}</td>
            `;
            
            tableBody.appendChild(tr);
        });
    }

    getStatusBadge(status) {
        const badges = {
            'Pending': '<span class="badge bg-warning">Pending</span>',
            'Approved': '<span class="badge bg-success">Approved</span>',
            'Cancelled': '<span class="badge bg-danger">Cancelled</span>'
        };
        return badges[status] || '<span class="badge bg-secondary">Unknown</span>';
    }

    getActionButtons(booking) {
        const canEdit = booking['Created By'] === this.currentUser.name || this.currentUser.role === 'admin';
        const canCancel = booking.Status === 'Pending' && canEdit;
        
        let buttons = `<button class="btn btn-sm btn-info" onclick="viewBookingDetails('${booking.ID}')" title="Lihat Detail">
                        <i class="fas fa-eye"></i>
                      </button>`;
        
        if (canEdit && booking.Status === 'Pending') {
            buttons += ` <button class="btn btn-sm btn-warning" onclick="editBooking('${booking.ID}')" title="Edit">
                          <i class="fas fa-edit"></i>
                        </button>`;
        }
        
        if (canCancel) {
            buttons += ` <button class="btn btn-sm btn-danger" onclick="cancelBooking('${booking.ID}')" title="Batalkan">
                          <i class="fas fa-times"></i>
                        </button>`;
        }
        
        return buttons;
    }

    async submitBooking() {
        try {
            const formData = this.getFormData();
            
            if (!this.validateFormData(formData)) {
                return;
            }

            showLoading(true);

            const response = await callAPI('submitBooking', {
                bookingData: formData,
                userInfo: this.currentUser
            });

            if (response.success) {
                showAlert('Booking berhasil dibuat dengan ID: ' + response.bookingId, 'success');
                this.resetForm();
                this.closeModal();
                await this.loadBookingData();
            } else {
                throw new Error(response.error || 'Gagal membuat booking');
            }
        } catch (error) {
            console.error('Error submitting booking:', error);
            showAlert('Gagal membuat booking: ' + error.message, 'danger');
        } finally {
            showLoading(false);
        }
    }

    getFormData() {
        return {
            tanggalBooking: document.getElementById('tanggalBooking').value,
            waktuMulai: document.getElementById('waktuMulai').value,
            waktuSelesai: document.getElementById('waktuSelesai').value,
            ruangan: document.getElementById('ruangan').value,
            keperluan: document.getElementById('keperluan').value,
            departemen: document.getElementById('departemen').value,
            catatan: document.getElementById('catatan').value,
            pemohon: this.currentUser.name
        };
    }

    validateFormData(data) {
        if (!data.tanggalBooking) {
            showAlert('Tanggal booking harus diisi', 'warning');
            return false;
        }

        if (!data.waktuMulai || !data.waktuSelesai) {
            showAlert('Waktu mulai dan selesai harus diisi', 'warning');
            return false;
        }

        if (data.waktuMulai >= data.waktuSelesai) {
            showAlert('Waktu selesai harus lebih besar dari waktu mulai', 'warning');
            return false;
        }

        if (!data.ruangan) {
            showAlert('Ruangan harus dipilih', 'warning');
            return false;
        }

        if (!data.keperluan.trim()) {
            showAlert('Keperluan harus diisi', 'warning');
            return false;
        }

        // Check if booking date is not in the past
        const bookingDate = new Date(data.tanggalBooking);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (bookingDate < today) {
            showAlert('Tanggal booking tidak boleh di masa lalu', 'warning');
            return false;
        }

        return true;
    }

    resetForm() {
        document.getElementById('bookingForm').reset();
        this.setDefaultDates();
    }

    closeModal() {
        const modal = bootstrap.Modal.getInstance(document.getElementById('bookingModal'));
        if (modal) {
            modal.hide();
        }
    }

    async cancelBooking(bookingId) {
        if (!confirm('Apakah Anda yakin ingin membatalkan booking ini?')) {
            return;
        }

        try {
            showLoading(true);

            const response = await callAPI('cancelBooking', {
                bookingId: bookingId,
                userInfo: this.currentUser
            });

            if (response.success) {
                showAlert('Booking berhasil dibatalkan', 'success');
                await this.loadBookingData();
            } else {
                throw new Error(response.error || 'Gagal membatalkan booking');
            }
        } catch (error) {
            console.error('Error cancelling booking:', error);
            showAlert('Gagal membatalkan booking: ' + error.message, 'danger');
        } finally {
            showLoading(false);
        }
    }
}

// Global functions for button handlers
function loadBookingData() {
    if (window.bookingManager) {
        window.bookingManager.loadBookingData();
    }
}

function submitBooking() {
    if (window.bookingManager) {
        window.bookingManager.submitBooking();
    }
}

function cancelBooking(bookingId) {
    if (window.bookingManager) {
        window.bookingManager.cancelBooking(bookingId);
    }
}

function viewBookingDetails(bookingId) {
    const booking = window.bookingManager.bookingData.find(b => b.ID === bookingId);
    if (booking) {
        const details = `
            <strong>ID:</strong> ${booking.ID}<br>
            <strong>Tanggal:</strong> ${formatDateID(booking['Tanggal Booking'])}<br>
            <strong>Waktu:</strong> ${booking['Waktu Mulai']} - ${booking['Waktu Selesai']}<br>
            <strong>Ruangan:</strong> ${booking['Ruangan/Fasilitas']}<br>
            <strong>Keperluan:</strong> ${booking.Keperluan}<br>
            <strong>Pemohon:</strong> ${booking.Pemohon}<br>
            <strong>Departemen:</strong> ${booking.Departemen || '-'}<br>
            <strong>Status:</strong> ${booking.Status}<br>
            <strong>Catatan:</strong> ${booking.Catatan || '-'}
        `;
        
        showAlert(details, 'info', 10000);
    }
}

function editBooking(bookingId) {
    showAlert('Fitur edit booking akan segera tersedia', 'info');
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    if (requireAuth()) {
        window.bookingManager = new BookingManager();
    }
});
