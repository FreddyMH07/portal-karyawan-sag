<<<<<<< HEAD
// Advanced Dashboard Harian functionality - Adopsi dari plantation-dashboard
=======
// Dashboard Harian functionality
>>>>>>> 5781cb1529a94802cc9a79f6b48d25d517be3804
class DailyDashboard {
    constructor() {
        this.productionData = [];
        this.filteredData = [];
<<<<<<< HEAD
        this.masterData = {};
        this.kebunDivisiMap = {};
        this.charts = {};
        this.dataTable = null;
        this.apiUrl = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec';
        this.initializeDashboard();
    }

    async initializeDashboard() {
        this.setDefaultDates();
        this.initializeEventListeners();
        await this.loadInitialData();
        await this.loadDashboardData();
    }

    async loadInitialData() {
        try {
            const response = await this.callAPI('getInitialData', {});
            if (response.success) {
                this.kebunDivisiMap = response.data.kebunDivisiMap;
                this.populateKebunDropdown();
            }
        } catch (error) {
            console.error('Error loading initial data:', error);
            this.showAlert('Gagal memuat data awal', 'warning');
        }
    }

    populateKebunDropdown() {
        const kebunSelect = document.getElementById('kebunFilter');
        kebunSelect.innerHTML = '<option value="">Semua Kebun</option>';
        
        Object.keys(this.kebunDivisiMap).forEach(kebun => {
            const option = document.createElement('option');
            option.value = kebun;
            option.textContent = kebun;
            kebunSelect.appendChild(option);
        });

        // Add event listener for kebun change
        kebunSelect.addEventListener('change', (e) => {
            this.updateDivisiDropdown(e.target.value);
        });
    }

    updateDivisiDropdown(selectedKebun) {
        const divisiSelect = document.getElementById('divisiFilter');
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

    async callAPI(action, data) {
        const payload = {
            action: action,
            ...data
        };

        const response = await fetch(this.apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
=======
        this.charts = {};
        this.dataTable = null;
        this.initializeDashboard();
    }

    initializeDashboard() {
        this.setDefaultDates();
        this.initializeEventListeners();
        this.loadDashboardData();
>>>>>>> 5781cb1529a94802cc9a79f6b48d25d517be3804
    }

    setDefaultDates() {
        const today = new Date();
        const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        
        document.getElementById('startDate').value = lastWeek.toISOString().split('T')[0];
        document.getElementById('endDate').value = today.toISOString().split('T')[0];
    }

    initializeEventListeners() {
        // Global functions
        window.applyFilters = () => this.applyFilters();
        window.resetFilters = () => this.resetFilters();
        window.refreshDashboard = () => this.refreshDashboard();
        window.exportDailyData = () => this.exportDailyData();
        window.addNewRecord = () => this.addNewRecord();
        window.editRecord = (id) => this.editRecord(id);
        window.deleteRecord = (id) => this.deleteRecord(id);
        window.saveData = () => this.saveData();
    }

    async loadDashboardData() {
        try {
<<<<<<< HEAD
            this.showLoading(true);
            
            const filters = this.getFilters();
            const response = await this.callAPI('getDailyDashboardData', { filters });
            
            if (response.success) {
                this.productionData = response.data.tableData;
                this.filteredData = [...this.productionData];
                
                // Update dashboard components
                this.updateSummaryCards(response.data.kpis);
                this.renderCharts(response.data.chartData);
                this.renderDataTable();
                this.updateMasterDataCard(filters);
                
                this.showAlert(`Data berhasil dimuat. ${this.filteredData.length} record ditemukan.`, 'success');
            } else {
                throw new Error(response.error || 'Gagal memuat data');
            }
            
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            this.showAlert('Gagal memuat data dashboard: ' + error.message, 'danger');
            // Load demo data as fallback
            await this.loadDemoData();
=======
            // Show loading state
            this.showLoading(true);
            
            // Simulate API call to Google Sheets
            this.productionData = await this.fetchProductionData();
            this.filteredData = [...this.productionData];
            
            // Update dashboard
            this.updateSummaryCards();
            this.renderCharts();
            this.renderDataTable();
            
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            this.showAlert('Gagal memuat data dashboard', 'danger');
>>>>>>> 5781cb1529a94802cc9a79f6b48d25d517be3804
        } finally {
            this.showLoading(false);
        }
    }

<<<<<<< HEAD
    getFilters() {
        return {
            startDate: document.getElementById('startDate').value,
            endDate: document.getElementById('endDate').value,
            kebun: document.getElementById('kebunFilter').value,
            divisi: document.getElementById('divisiFilter').value
        };
    }

    async updateMasterDataCard(filters) {
        try {
            const response = await this.callAPI('getMasterData', { filters });
            if (response.success) {
                this.renderMasterDataCard(response.data);
            }
        } catch (error) {
            console.error('Error loading master data:', error);
        }
    }

    renderMasterDataCard(masterData) {
        // Create or update master data card
        let masterCard = document.getElementById('masterDataCard');
        if (!masterCard) {
            masterCard = document.createElement('div');
            masterCard.id = 'masterDataCard';
            masterCard.className = 'chart-card mb-4';
            
            // Insert after summary cards
            const summaryRow = document.querySelector('.row.mb-4');
            summaryRow.parentNode.insertBefore(masterCard, summaryRow.nextSibling);
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

=======
>>>>>>> 5781cb1529a94802cc9a79f6b48d25d517be3804
    async fetchProductionData() {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Generate demo data
        const kebunList = ['PT. PAL', 'PT. LSP RS', 'PT. LSP PR', 'CANDIMAS', 'PT. HSBS'];
<<<<<<< HEAD
        const divisiList = ['Divisi 1', 'Divisi 2', 'Divisi 3', 'Divisi 4'];
=======
        const divisiList = ['Divisi 1', 'Divisi 2', 'Divisi 3', 'Divisi 4', 'INTI', 'PLASMA'];
>>>>>>> 5781cb1529a94802cc9a79f6b48d25d517be3804
        const data = [];
        
        for (let i = 0; i < 30; i++) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            
            const luasPanen = Math.random() * 10 + 5;
            const jjgPanen = Math.floor(Math.random() * 1000 + 500);
            const tonase = Math.random() * 20 + 10;
            const bjr = tonase * 1000 / jjgPanen;
            const refraksi = Math.random() * 3 + 1;
            const akp = jjgPanen / (luasPanen * 130); // Assuming SPH = 130
            
            data.push({
                id: i + 1,
                tanggal: date.toISOString().split('T')[0],
                kebun: kebunList[Math.floor(Math.random() * kebunList.length)],
                divisi: divisiList[Math.floor(Math.random() * divisiList.length)],
                luasPanen: luasPanen.toFixed(2),
                jjgPanen: jjgPanen,
                tonase: tonase.toFixed(1),
                bjr: bjr.toFixed(2),
                refraksi: refraksi.toFixed(2),
                akp: akp.toFixed(2)
            });
        }
        
        return data.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
    }

    applyFilters() {
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;
        const kebun = document.getElementById('kebunFilter').value;
        const divisi = document.getElementById('divisiFilter').value;
        
        this.filteredData = this.productionData.filter(item => {
            let match = true;
            
            if (startDate && item.tanggal < startDate) match = false;
            if (endDate && item.tanggal > endDate) match = false;
            if (kebun && item.kebun !== kebun) match = false;
            if (divisi && item.divisi !== divisi) match = false;
            
            return match;
        });
        
        this.updateSummaryCards();
        this.renderCharts();
        this.renderDataTable();
        
        this.showAlert(`Filter diterapkan. Menampilkan ${this.filteredData.length} data.`, 'success');
    }

    resetFilters() {
        document.getElementById('startDate').value = '';
        document.getElementById('endDate').value = '';
        document.getElementById('kebunFilter').value = '';
        document.getElementById('divisiFilter').value = '';
        
        this.setDefaultDates();
        this.filteredData = [...this.productionData];
        
        this.updateSummaryCards();
        this.renderCharts();
        this.renderDataTable();
        
        this.showAlert('Filter direset', 'info');
    }

    updateSummaryCards() {
        const totalProduksi = this.filteredData.reduce((sum, item) => sum + parseFloat(item.tonase), 0);
        const totalJJG = this.filteredData.reduce((sum, item) => sum + parseInt(item.jjgPanen), 0);
        const avgBJR = this.filteredData.length > 0 ? 
            this.filteredData.reduce((sum, item) => sum + parseFloat(item.bjr), 0) / this.filteredData.length : 0;
        
        // Calculate ACV Production (demo calculation)
        const budgetBulanan = 1000; // Demo budget
        const acvProduction = (totalProduksi / budgetBulanan) * 100;
        
        document.getElementById('totalProduksi').textContent = totalProduksi.toFixed(1);
        document.getElementById('totalJJG').textContent = totalJJG.toLocaleString('id-ID');
        document.getElementById('avgBJR').textContent = avgBJR.toFixed(2);
        document.getElementById('acvProduction').textContent = acvProduction.toFixed(1) + '%';
    }

    renderCharts() {
        this.renderProductionChart();
        this.renderKebunChart();
    }

    renderProductionChart() {
        const ctx = document.getElementById('productionChart').getContext('2d');
        
        // Destroy existing chart
        if (this.charts.production) {
            this.charts.production.destroy();
        }
        
        // Group data by date
        const dateGroups = {};
        this.filteredData.forEach(item => {
            if (!dateGroups[item.tanggal]) {
                dateGroups[item.tanggal] = 0;
            }
            dateGroups[item.tanggal] += parseFloat(item.tonase);
        });
        
        const dates = Object.keys(dateGroups).sort();
        const productions = dates.map(date => dateGroups[date]);
        
        this.charts.production = new Chart(ctx, {
            type: 'line',
            data: {
                labels: dates.map(date => new Date(date).toLocaleDateString('id-ID')),
                datasets: [{
                    label: 'Produksi (Ton)',
                    data: productions,
                    borderColor: '#2E7D32',
                    backgroundColor: 'rgba(46, 125, 50, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Produksi (Ton)'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Tanggal'
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    }
                }
            }
        });
    }

    renderKebunChart() {
        const ctx = document.getElementById('kebunChart').getContext('2d');
        
        // Destroy existing chart
        if (this.charts.kebun) {
            this.charts.kebun.destroy();
        }
        
        // Group data by kebun
        const kebunGroups = {};
        this.filteredData.forEach(item => {
            if (!kebunGroups[item.kebun]) {
                kebunGroups[item.kebun] = 0;
            }
            kebunGroups[item.kebun] += parseFloat(item.tonase);
        });
        
        const kebuns = Object.keys(kebunGroups);
        const productions = Object.values(kebunGroups);
        
        this.charts.kebun = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: kebuns,
                datasets: [{
                    data: productions,
                    backgroundColor: [
                        '#2E7D32',
                        '#4CAF50',
                        '#81C784',
                        '#FF9800',
                        '#2196F3'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    renderDataTable() {
        const tbody = document.querySelector('#dailyProductionTable tbody');
        tbody.innerHTML = '';
        
        this.filteredData.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${new Date(item.tanggal).toLocaleDateString('id-ID')}</td>
                <td>${item.kebun}</td>
                <td>${item.divisi}</td>
                <td>${item.luasPanen}</td>
                <td>${parseInt(item.jjgPanen).toLocaleString('id-ID')}</td>
                <td>${parseFloat(item.tonase).toLocaleString('id-ID')}</td>
                <td>${item.bjr}</td>
                <td>${item.refraksi}%</td>
                <td>${item.akp}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary me-1" onclick="editRecord(${item.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteRecord(${item.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
        
        // Initialize or update DataTable
        if (this.dataTable) {
            this.dataTable.destroy();
        }
        
        this.dataTable = $('#dailyProductionTable').DataTable({
            pageLength: 10,
            lengthChange: true,
            searching: true,
            ordering: true,
            info: true,
            autoWidth: false,
            language: {
                url: '//cdn.datatables.net/plug-ins/1.13.6/i18n/id.json'
            }
        });
    }

    addNewRecord() {
        document.getElementById('modalTitle').textContent = 'Tambah Data Produksi';
        document.getElementById('dataForm').reset();
        document.getElementById('modalTanggal').value = new Date().toISOString().split('T')[0];
        
        const modal = new bootstrap.Modal(document.getElementById('dataModal'));
        modal.show();
    }

    editRecord(id) {
        const record = this.productionData.find(item => item.id === id);
        if (!record) return;
        
        document.getElementById('modalTitle').textContent = 'Edit Data Produksi';
        document.getElementById('modalTanggal').value = record.tanggal;
        document.getElementById('modalKebun').value = record.kebun;
        document.getElementById('modalDivisi').value = record.divisi;
        document.getElementById('modalLuasPanen').value = record.luasPanen;
        document.getElementById('modalJJGPanen').value = record.jjgPanen;
        document.getElementById('modalTonase').value = record.tonase;
        
        const modal = new bootstrap.Modal(document.getElementById('dataModal'));
        modal.show();
    }

    deleteRecord(id) {
        if (confirm('Apakah Anda yakin ingin menghapus data ini?')) {
            this.productionData = this.productionData.filter(item => item.id !== id);
            this.applyFilters();
            this.showAlert('Data berhasil dihapus', 'success');
        }
    }

    saveData() {
        const form = document.getElementById('dataForm');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }
        
        const formData = {
            tanggal: document.getElementById('modalTanggal').value,
            kebun: document.getElementById('modalKebun').value,
            divisi: document.getElementById('modalDivisi').value,
            luasPanen: parseFloat(document.getElementById('modalLuasPanen').value),
            jjgPanen: parseInt(document.getElementById('modalJJGPanen').value),
            tonase: parseFloat(document.getElementById('modalTonase').value)
        };
        
        // Calculate BJR and AKP
        formData.bjr = (formData.tonase * 1000 / formData.jjgPanen).toFixed(2);
        formData.akp = (formData.jjgPanen / (formData.luasPanen * 130)).toFixed(2);
        formData.refraksi = (Math.random() * 3 + 1).toFixed(2); // Demo refraksi
        formData.id = Date.now(); // Generate ID
        
        this.productionData.unshift(formData);
        this.applyFilters();
        
        const modal = bootstrap.Modal.getInstance(document.getElementById('dataModal'));
        modal.hide();
        
        this.showAlert('Data berhasil disimpan', 'success');
    }

    async refreshDashboard() {
        await this.loadDashboardData();
        this.showAlert('Dashboard berhasil diperbarui', 'success');
    }

    exportDailyData() {
        const exportData = this.filteredData.map(item => ({
            'Tanggal': item.tanggal,
            'Kebun': item.kebun,
            'Divisi': item.divisi,
            'Luas Panen (Ha)': item.luasPanen,
            'JJG Panen': item.jjgPanen,
            'Tonase (Kg)': item.tonase,
            'BJR (Kg/JJG)': item.bjr,
            'Refraksi (%)': item.refraksi,
            'AKP': item.akp
        }));
        
        Utils.exportToCSV(exportData, `produksi-harian-${new Date().toISOString().split('T')[0]}.csv`);
        this.showAlert('Data berhasil diekspor', 'success');
    }

    showLoading(show) {
        // Implementation for loading state
        const loadingElements = document.querySelectorAll('.stat-card h4');
        loadingElements.forEach(el => {
            if (show) {
                el.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
            }
        });
    }

    showAlert(message, type) {
        const existingAlerts = document.querySelectorAll('.alert');
        existingAlerts.forEach(alert => alert.remove());

        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
        alertDiv.style.cssText = 'top: 100px; right: 20px; z-index: 1050; min-width: 300px;';
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;

        document.body.appendChild(alertDiv);

        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.remove();
            }
        }, 5000);
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new DailyDashboard();
});
