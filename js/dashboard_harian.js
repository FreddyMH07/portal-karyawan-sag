// Advanced Dashboard Harian functionality - Enhanced v3.1 (NO ID EDITION)

class DailyDashboard {
    constructor() {
        this.productionData = [];
        this.filteredData = [];
        this.kebunDivisiMap = {};
        this.charts = {};
        this.editingIndex = null; // track row being edited

        if (typeof requireAuth !== 'function' || !requireAuth()) return;
        this.initializeDashboard();
    }

    async initializeDashboard() {
        this.setDefaultDates();
        this.initializeEventListeners();
        await this.loadInitialData();
        await this.loadDashboardData();
    }

    setDefaultDates() {
        const today = new Date();
        const startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        document.getElementById('startDate').value = startDate.toISOString().split('T')[0];
        document.getElementById('endDate').value = today.toISOString().split('T')[0];
    }

    initializeEventListeners() {
        document.getElementById('filterBtn')?.addEventListener('click', () => this.applyFilters());
        document.getElementById('exportBtn')?.addEventListener('click', () => this.exportData());
        document.getElementById('resetBtn')?.addEventListener('click', () => this.resetFilters());
        document.getElementById('refreshBtn')?.addEventListener('click', () => this.loadDashboardData());
        document.getElementById('kebunFilter')?.addEventListener('change', e => this.updateDivisiDropdown(e.target.value));
        window.addNewRecord = () => this.addNewRecord();
        window.editRecord = (index) => this.editRecord(index);
        window.deleteRecord = (index) => this.deleteRecord(index);
        window.saveData = () => this.saveData();
    }

    async loadInitialData() {
        try {
            const response = await callAPI('getInitialData', {});
            if (response.success) {
                this.kebunDivisiMap = response.data.kebunDivisiMap;
                this.populateKebunDropdown();
            }
        } catch (error) {
            showAlert('Gagal memuat data awal', 'warning');
        }
    }

    populateKebunDropdown() {
        const kebunSelect = document.getElementById('kebunFilter');
        if (!kebunSelect) return;
        kebunSelect.innerHTML = '<option value="">Semua Kebun</option>';
        Object.keys(this.kebunDivisiMap).forEach(kebun => {
            const option = document.createElement('option');
            option.value = kebun;
            option.textContent = kebun;
            kebunSelect.appendChild(option);
        });
    }

    updateDivisiDropdown(selectedKebun) {
        const divisiSelect = document.getElementById('divisiFilter');
        if (!divisiSelect) return;
        divisiSelect.innerHTML = '<option value="">Semua Divisi</option>';
        if (selectedKebun && this.kebunDivisiMap[selectedKebun]) {
            this.kebunDivisiMap[selectedKebun].forEach(divisi => {
                const option = document.createElement('option');
                option.value = divisi;
                option.textContent = divisi;
                divisiSelect.appendChild(option);
            });
        }
    }

    getFilters() {
        return {
            startDate: document.getElementById('startDate')?.value || '',
            endDate: document.getElementById('endDate')?.value || '',
            kebun: document.getElementById('kebunFilter')?.value || '',
            divisi: document.getElementById('divisiFilter')?.value || ''
        };
    }

    async loadDashboardData() {
        try {
            showLoading(true);
            const filters = this.getFilters();
            const response = await callAPI('getDailyDashboardData', { filters });
            if (response.success) {
                this.productionData = response.data.tableData || [];
                this.filteredData = this.productionData;
                this.updateKPICards(response.data.kpis || {});
                this.updateCharts(response.data.chartData || {});
                this.updateDataTable();
                showAlert('Data berhasil dimuat', 'success', 2000);
            } else {
                throw new Error(response.error || 'Gagal memuat data');
            }
        } catch (error) {
            showAlert('Gagal memuat data dashboard: ' + error.message, 'danger');
        } finally {
            showLoading(false);
        }
    }

    async applyFilters() {
        await this.loadDashboardData();
    }

    resetFilters() {
        document.getElementById('startDate').value = '';
        document.getElementById('endDate').value = '';
        document.getElementById('kebunFilter').value = '';
        document.getElementById('divisiFilter').value = '';
        this.setDefaultDates();
        this.updateDivisiDropdown('');
        this.loadDashboardData();
        showAlert('Filter telah direset', 'info', 2000);
    }

    exportData() {
        if (this.filteredData.length === 0) {
            showAlert('Tidak ada data untuk diekspor', 'warning');
            return;
        }
        const filename = `data_harian_${new Date().toISOString().split('T')[0]}.csv`;
        exportToCSV(this.filteredData, filename);
        showAlert('Data berhasil diekspor', 'success');
    }

    // --- Helper: Populate dropdown di MODAL dari master ---
populateModalKebunDivisi() {
    // Kebun
    const kebunSelect = document.getElementById('modalKebun');
    kebunSelect.innerHTML = '<option value="">Pilih Kebun</option>';
    Object.keys(this.kebunDivisiMap).forEach(kebun => {
        const option = document.createElement('option');
        option.value = kebun;
        option.textContent = kebun;
        kebunSelect.appendChild(option);
    });
    // Divisi: kosong dulu, baru isi setelah pilih kebun
    const divisiSelect = document.getElementById('modalDivisi');
    divisiSelect.innerHTML = '<option value="">Pilih Divisi</option>';
},

// --- Saat kebun modal berubah, update divisi modal ---
updateModalDivisiDropdown(selectedKebun) {
    const divisiSelect = document.getElementById('modalDivisi');
    divisiSelect.innerHTML = '<option value="">Pilih Divisi</option>';
    if (selectedKebun && this.kebunDivisiMap[selectedKebun]) {
        this.kebunDivisiMap[selectedKebun].forEach(divisi => {
            const option = document.createElement('option');
            option.value = divisi;
            option.textContent = divisi;
            divisiSelect.appendChild(option);
        });
    }
},


    updateKPICards(kpis) {
        const acvElement = document.getElementById('acvProduksi');
        if (acvElement) acvElement.textContent = formatNumber(kpis.acvProduksi || 0, 2) + '%';
        const outputHaElement = document.getElementById('outputPerHa');
        if (outputHaElement) outputHaElement.textContent = formatNumber(kpis.outputPerHa || 0, 2);
        const outputHkElement = document.getElementById('outputPerHK');
        if (outputHkElement) outputHkElement.textContent = formatNumber(kpis.outputPerHK || 0, 2);
        const refraksiElement = document.getElementById('refraksiHarian');
        if (refraksiElement) refraksiElement.textContent = formatNumber(kpis.refraksiHarian || 0, 2) + '%';
        const bjrElement = document.getElementById('bjrHarian');
        if (bjrElement) bjrElement.textContent = formatNumber(kpis.bjrHarian || 0, 2);
        const restanElement = document.getElementById('restanHarian');
        if (restanElement) restanElement.textContent = formatNumber(kpis.restanHarian || 0, 0);
    }

    updateCharts(chartData) {
        this.createTrendChart(chartData.trendData || []);
        this.createKebunComparisonChart(chartData.kebunComparison || {});
    }

    createTrendChart(trendData) {
        const ctx = document.getElementById('trendChart');
        if (!ctx) return;
        if (this.charts.trendChart) this.charts.trendChart.destroy();
        this.charts.trendChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: trendData.map(item => formatDateID(item.date)),
                datasets: [{
                    label: 'Tonase Panen (Kg)',
                    data: trendData.map(item => item.tonase),
                    borderColor: '#007bff',
                    backgroundColor: 'rgba(0, 123, 255, 0.1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: { display: true, text: 'Trend Produksi Harian' }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: { display: true, text: 'Tonase (Kg)' }
                    }
                }
            }
        });
    }

    createKebunComparisonChart(kebunData) {
        const ctx = document.getElementById('kebunChart');
        if (!ctx) return;
        if (this.charts.kebunChart) this.charts.kebunChart.destroy();
        const labels = Object.keys(kebunData);
        const data = Object.values(kebunData);
        this.charts.kebunChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Total Produksi (Kg)',
                    data: data,
                    backgroundColor: [
                        '#28a745', '#007bff', '#ffc107',
                        '#dc3545', '#17a2b8', '#6f42c1'
                    ]
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: { display: true, text: 'Perbandingan Produksi per Kebun' }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: { display: true, text: 'Tonase (Kg)' }
                    }
                }
            }
        });
    }

    updateDataTable() {
        const tableBody = document.getElementById('dataTableBody');
        if (!tableBody) return;
        tableBody.innerHTML = '';
        if (this.filteredData.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="12" class="text-center">Tidak ada data</td></tr>';
            return;
        }
        this.filteredData.forEach((row, index) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${index + 1}</td>
                <td>${formatDateID(row['Tanggal'])}</td>
                <td>${row['Kebun'] || '-'}</td>
                <td>${row['Divisi'] || '-'}</td>
                <td>${formatNumber(row['Luas Panen (HA)'] || 0, 2)}</td>
                <td>${formatNumber(row['JJG Panen (Jjg)'] || 0, 0)}</td>
                <td>${formatNumber(row['Tonase Panen (Kg)'] || 0, 1)}</td>
                <td>${formatNumber(row['BJR Hari ini'] || 0, 2)}</td>
                <td>${formatNumber(row['Output (Kg/HK)'] || 0, 2)}</td>
                <td>${row['Input By'] || '-'}</td>
                <td>
                  <button class="btn btn-sm btn-warning" onclick="editRecord(${index})">Edit</button>
                  <button class="btn btn-sm btn-danger" onclick="deleteRecord(${index})">Delete</button>
                </td>
            `;
            tableBody.appendChild(tr);
        });
        // Update record count
        const recordCount = document.getElementById('recordCount');
        if (recordCount) {
            recordCount.textContent = `Total: ${this.filteredData.length} record`;
        }
    }

    // ---- CRUD & Helper Functions ----

addNewRecord() {
    document.getElementById('modalTitle').textContent = 'Tambah Data Produksi';
    document.getElementById('dataForm').reset();
    this.populateModalKebunDivisi();
    document.getElementById('modalKebun').addEventListener('change', e => {
        this.updateModalDivisiDropdown(e.target.value);
    });
    document.getElementById('modalTanggal').value = new Date().toISOString().split('T')[0];
    const modal = new bootstrap.Modal(document.getElementById('dataModal'));
    modal.show();
},



editRecord(index) {
    // ...find record by index/ID...
    this.populateModalKebunDivisi();
    document.getElementById('modalKebun').value = record.Kebun;
    this.updateModalDivisiDropdown(record.Kebun);
    document.getElementById('modalDivisi').value = record.Divisi;
    // ...set value lainnya...
    document.getElementById('modalKebun').addEventListener('change', e => {
        this.updateModalDivisiDropdown(e.target.value);
    });
    // ...show modal...
},

    
    deleteRecord(index) {
        if (confirm('Apakah Anda yakin ingin menghapus data ini?')) {
            // Jika kamu ingin ke backend, panggil callAPI('deleteDailyData', { rowId: index + 2 }) (baris 2 = row pertama data)
            this.filteredData.splice(index, 1);
            this.updateDataTable();
            showAlert('Data berhasil dihapus', 'success');
        }
    }

    saveData() {
        const form = document.getElementById('dataForm');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }
        // Pastikan mapping sesuai sheet
        const formData = {
            'Tanggal': document.getElementById('modalTanggal').value,
            'Kebun': document.getElementById('modalKebun').value,
            'Divisi': document.getElementById('modalDivisi').value,
            'Luas Panen (HA)': parseFloat(document.getElementById('modalLuasPanen').value),
            'JJG Panen (Jjg)': parseInt(document.getElementById('modalJJGPanen').value),
            'Tonase Panen (Kg)': parseFloat(document.getElementById('modalTonase').value),
            'BJR Hari ini': parseFloat(document.getElementById('modalBJR')?.value) || 0,
            'Output (Kg/HK)': parseFloat(document.getElementById('modalOutputHK')?.value) || 0,
            'Input By': getCurrentUser?.() || 'User'
        };
        // Auto-calc fields
        formData['BJR Hari ini'] = (formData['Tonase Panen (Kg)'] && formData['JJG Panen (Jjg)'])
            ? (formData['Tonase Panen (Kg)'] * 1000 / formData['JJG Panen (Jjg)']).toFixed(2)
            : 0;
        // Save
        if (this.editingIndex !== null) {
            // Edit mode
            Object.assign(this.filteredData[this.editingIndex], formData);
            showAlert('Data berhasil diperbarui', 'success');
        } else {
            // Add new
            this.filteredData.unshift(formData);
            showAlert('Data berhasil ditambah', 'success');
        }
        this.updateDataTable();
        const modal = bootstrap.Modal.getInstance(document.getElementById('dataModal'));
        modal.hide();
    }

    // ----- Master Data Card -----
    async updateMasterDataCard(filters) {
        try {
            const response = await callAPI('getMasterData', { filters });
            if (response.success) {
                this.renderMasterDataCard(response.data);
            }
        } catch (error) {
            console.error('Error loading master data:', error);
        }
    }

    renderMasterDataCard(masterData) {
        let masterCard = document.getElementById('masterDataCard');
        if (!masterCard) {
            masterCard = document.createElement('div');
            masterCard.id = 'masterDataCard';
            masterCard.className = 'chart-card mb-4';
            const summaryRow = document.querySelector('.row.mb-4');
            summaryRow?.parentNode.insertBefore(masterCard, summaryRow.nextSibling);
        }
        masterCard.innerHTML = `
            <h5 class="mb-3"><i class="fas fa-database me-2"></i>Master Data Info</h5>
            <div class="row">
                <div class="col-md-3">
                    <div class="text-center">
                        <h6 class="text-muted">Budget Bulanan</h6>
                        <h4 class="text-primary">${masterData.budget || 0} Ton</h4>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="text-center">
                        <h6 class="text-muted">SPH Panen</h6>
                        <h4 class="text-info">${masterData.sphPanen || 130}</h4>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="text-center">
                        <h6 class="text-muted">Luas TM</h6>
                        <h4 class="text-success">${masterData.luasTM || 0} Ha</h4>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="text-center">
                        <h6 class="text-muted">PKK</h6>
                        <h4 class="text-warning">${masterData.pkk || 85}%</h4>
                    </div>
                </div>
            </div>
        `;
    }
}

// Helper untuk konversi tanggal Google Sheet ke input type=date
function toInputDate(dateString) {
    if (!dateString) return '';
    const d = new Date(dateString);
    if (isNaN(d)) return '';
    return d.toISOString().split('T')[0];
}

// Dummy getCurrentUser kalau belum implementasi login
function getCurrentUser() { return 'User'; }

// Loading spinner
function showLoading(show = true) {
    let el = document.getElementById('globalLoadingSpinner');
    if (!el) {
        el = document.createElement('div');
        el.id = 'globalLoadingSpinner';
        el.innerHTML = `
            <div class="position-fixed top-50 start-50 translate-middle" style="z-index:9999">
                <div class="spinner-border text-primary" style="width:4rem;height:4rem;" role="status">
                  <span class="visually-hidden">Loading...</span>
                </div>
            </div>
        `;
        document.body.appendChild(el);
    }
    el.style.display = show ? 'block' : 'none';
    if (!show) setTimeout(() => el.remove(), 500);
}

// == INIT ==
document.addEventListener('DOMContentLoaded', () => {
    window.dailyDashboard = new DailyDashboard();
});

// HTML onclick handler
function applyFilters()   { window.dailyDashboard?.applyFilters(); }
function resetFilters()   { window.dailyDashboard?.resetFilters(); }
function exportData()     { window.dailyDashboard?.exportData(); }
function refreshData()    { window.dailyDashboard?.loadDashboardData(); }
