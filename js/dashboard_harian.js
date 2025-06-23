// Advanced Dashboard Harian functionality - Enhanced v3.1
// Versi revisi tanpa id dan CRUD berbasis index array

class DailyDashboard {
    constructor() {
        this.productionData = [];
        this.filteredData = [];
        this.masterData = {};
        this.kebunDivisiMap = {};
        this.charts = {};
        this.dataTable = null;

        if (typeof requireAuth !== 'function' || !requireAuth()) return; // stop if not login

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
        const startDateInput = document.getElementById('startDate');
        const endDateInput = document.getElementById('endDate');
        if (startDateInput) startDateInput.value = startDate.toISOString().split('T')[0];
        if (endDateInput) endDateInput.value = today.toISOString().split('T')[0];
    }

    initializeEventListeners() {
        document.getElementById('filterBtn')?.addEventListener('click', () => this.applyFilters());
        document.getElementById('exportBtn')?.addEventListener('click', () => this.exportData());
        document.getElementById('resetBtn')?.addEventListener('click', () => this.resetFilters());
        document.getElementById('refreshBtn')?.addEventListener('click', () => this.loadDashboardData());
        document.getElementById('kebunFilter')?.addEventListener('change', e => this.updateDivisiDropdown(e.target.value));

        // Modal & CRUD events (handler global)
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
        const recordCount = document.getElementById('recordCount');
        if (recordCount) {
            recordCount.textContent = `Total: ${this.filteredData.length} record`;
        }
    }

    // ---- CRUD & Helper Functions ----

    addNewRecord() {
        document.getElementById('modalTitle').textContent = 'Tambah Data Produksi';
        document.getElementById('dataForm').reset();
        document.getElementById('modalTanggal').value = new Date().toISOString().split('T')[0];
        const modal = new bootstrap.Modal(document.getElementById('dataModal'));
        modal.show();

        // Set mode tambah
        window.currentEditIndex = null;
    }

    editRecord(index) {
        const record = this.filteredData[index];
        if (!record) return;
        document.getElementById('modalTitle').textContent = 'Edit Data Produksi';
        document.getElementById('modalTanggal').value = formatDateInput(record['Tanggal']);
        document.getElementById('modalKebun').value = record['Kebun'];
        document.getElementById('modalDivisi').value = record['Divisi'];
        document.getElementById('modalLuasPanen').value = record['Luas Panen (HA)'];
        document.getElementById('modalJJGPanen').value = record['JJG Panen (Jjg)'];
        document.getElementById('modalTonase').value = record['Tonase Panen (Kg)'];

        // Simpan index record yang diedit
        window.currentEditIndex = index;

        const modal = new bootstrap.Modal(document.getElementById('dataModal'));
        modal.show();
    }

    deleteRecord(index) {
        if (confirm('Apakah Anda yakin ingin menghapus data ini?')) {
            // Hapus dari productionData
            const dataIndex = this.productionData.indexOf
