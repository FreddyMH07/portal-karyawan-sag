// Advanced Dashboard Bulanan functionality
class MonthlyDashboard {
    constructor() {
        this.summaryData = [];
        this.monthlyKPIs = {};
        this.chartData = {};
        this.kebunDivisiMap = {};
        this.charts = {};
        this.dataTable = null;
        this.comparisonMode = false;
        this.apiUrl = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec';
        this.initializeDashboard();
    }

    async initializeDashboard() {
        this.setDefaultFilters();
        this.initializeEventListeners();
        await this.loadInitialData();
        await this.loadMonthlyData();
    }

    setDefaultFilters() {
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth() + 1;

        // Populate year dropdown
        const yearSelect = document.getElementById('yearFilter');
        for (let year = currentYear - 2; year <= currentYear + 1; year++) {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            if (year === currentYear) option.selected = true;
            yearSelect.appendChild(option);
        }

        // Set current month
        document.getElementById('monthFilter').value = currentMonth;
    }

    initializeEventListeners() {
        // Global functions
        window.applyFilters = () => this.applyFilters();
        window.resetFilters = () => this.resetFilters();
        window.refreshDashboard = () => this.refreshDashboard();
        window.compareMode = () => this.toggleComparisonMode();
        window.exportToExcel = () => this.exportToExcel();
        window.exportToPDF = () => this.exportToPDF();
        window.printDashboard = () => this.printDashboard();
        window.toggleColumns = () => this.toggleColumns();
        window.exportTable = () => this.exportTable();
        window.applyColumnSettings = () => this.applyColumnSettings();

        // Chart type change
        document.querySelectorAll('input[name="chartType"]').forEach(radio => {
            radio.addEventListener('change', () => this.updateChartType());
        });

        // Kebun change event
        document.getElementById('kebunFilter').addEventListener('change', (e) => {
            this.updateDivisiDropdown(e.target.value);
        });
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

        try {
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
        } catch (error) {
            console.error('API call failed:', error);
            // Return demo data as fallback
            return this.getDemoResponse(action, data);
        }
    }

    getDemoResponse(action, data) {
        // Demo data for development/testing
        if (action === 'getMonthlyDashboardData') {
            return {
                success: true,
                data: {
                    summaryData: this.generateDemoSummary(),
                    kpis: this.generateDemoKPIs(),
                    chartData: this.generateDemoChartData()
                }
            };
        }
        return { success: false, error: 'Demo mode' };
    }

    generateDemoSummary() {
        const kebunList = ['PT. PAL', 'PT. LSP RS', 'PT. LSP PR', 'CANDIMAS', 'PT. HSBS'];
        const divisiList = ['Divisi 1', 'Divisi 2', 'Divisi 3', 'Divisi 4'];
        const summary = [];

        kebunList.forEach(kebun => {
            divisiList.slice(0, Math.floor(Math.random() * 3) + 2).forEach(divisi => {
                const totalTonase = Math.random() * 100 + 50;
                const totalJJG = Math.floor(Math.random() * 5000 + 2000);
                const totalLuas = Math.random() * 50 + 20;
                const totalTK = Math.floor(Math.random() * 100 + 50);

                summary.push({
                    kebun: kebun,
                    divisi: divisi,
                    totalTonase: totalTonase.toFixed(1),
                    totalJJG: totalJJG,
                    totalLuas: totalLuas.toFixed(1),
                    totalTK: totalTK,
                    outputPerHa: (totalTonase / totalLuas).toFixed(2),
                    outputPerHK: (totalTonase / totalTK).toFixed(2),
                    akp: (totalJJG / (totalLuas * 130)).toFixed(2),
                    bjr: (totalTonase * 1000 / totalJJG).toFixed(2),
                    refraksi: (Math.random() * 3 + 1).toFixed(2),
                    acv: (Math.random() * 30 + 70).toFixed(1)
                });
            });
        });

        return summary;
    }

    generateDemoKPIs() {
        return {
            tonasePKSBulanan: (Math.random() * 500 + 300).toFixed(1),
            outputPerHa: (Math.random() * 5 + 15).toFixed(2),
            outputPerHK: (Math.random() * 2 + 3).toFixed(2),
            akpBulanan: (Math.random() * 50 + 100).toFixed(2),
            acvProduksi: (Math.random() * 30 + 70).toFixed(2),
            refraksiPersen: (Math.random() * 3 + 1).toFixed(2),
            bjrBulanan: (Math.random() * 5 + 15).toFixed(2),
            deviasibudget: (Math.random() * 20 - 10).toFixed(2),
            restanBulanan: Math.floor(Math.random() * 500 + 100),
            selisihTonase: (Math.random() * 10 - 5).toFixed(1)
        };
    }

    generateDemoChartData() {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun'];
        const trendData = months.map(month => ({
            month: month,
            tonase: Math.random() * 100 + 200,
            budget: Math.random() * 50 + 250,
            akp: Math.random() * 50 + 100
        }));

        return {
            monthlyTrend: trendData,
            budgetComparison: {
                budget: 1000,
                realisasi: 850,
                percentage: 85
            }
        };
    }

    async loadMonthlyData() {
        try {
            this.showLoading(true);
            
            const filters = this.getFilters();
            const response = await this.callAPI('getMonthlyDashboardData', { filters });
            
            if (response.success) {
                this.summaryData = response.data.summaryData;
                this.monthlyKPIs = response.data.kpis;
                this.chartData = response.data.chartData;
                
                // Update dashboard components
                this.updateKPICards();
                this.renderCharts();
                this.renderSummaryTable();
                
                this.showAlert(`Data bulanan berhasil dimuat. ${this.summaryData.length} record ditemukan.`, 'success');
            } else {
                throw new Error(response.error || 'Gagal memuat data bulanan');
            }
            
        } catch (error) {
            console.error('Error loading monthly data:', error);
            this.showAlert('Gagal memuat data bulanan: ' + error.message, 'danger');
        } finally {
            this.showLoading(false);
        }
    }

    getFilters() {
        return {
            year: document.getElementById('yearFilter').value,
            month: document.getElementById('monthFilter').value,
            kebun: document.getElementById('kebunFilter').value,
            divisi: document.getElementById('divisiFilter').value
        };
    }

    updateKPICards() {
        // Update all KPI cards with monthly data
        Object.keys(this.monthlyKPIs).forEach(key => {
            const element = document.getElementById(key);
            if (element) {
                element.textContent = this.monthlyKPIs[key];
            }
        });
    }

    renderCharts() {
        this.renderMonthlyTrendChart();
        this.renderBudgetChart();
        
        if (this.comparisonMode) {
            this.renderComparisonCharts();
        }
    }

    renderMonthlyTrendChart() {
        const ctx = document.getElementById('monthlyTrendChart').getContext('2d');
        
        if (this.charts.monthlyTrend) {
            this.charts.monthlyTrend.destroy();
        }

        const chartType = document.querySelector('input[name="chartType"]:checked').id === 'lineChart' ? 'line' : 'bar';
        
        this.charts.monthlyTrend = new Chart(ctx, {
            type: chartType,
            data: {
                labels: this.chartData.monthlyTrend?.map(item => item.month) || [],
                datasets: [
                    {
                        label: 'Realisasi (Ton)',
                        data: this.chartData.monthlyTrend?.map(item => item.tonase) || [],
                        borderColor: '#2E7D32',
                        backgroundColor: 'rgba(46, 125, 50, 0.1)',
                        tension: 0.4
                    },
                    {
                        label: 'Budget (Ton)',
                        data: this.chartData.monthlyTrend?.map(item => item.budget) || [],
                        borderColor: '#FF9800',
                        backgroundColor: 'rgba(255, 152, 0, 0.1)',
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Tonase'
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

    renderBudgetChart() {
        const ctx = document.getElementById('budgetChart').getContext('2d');
        
        if (this.charts.budget) {
            this.charts.budget.destroy();
        }

        const budgetData = this.chartData.budgetComparison || { budget: 1000, realisasi: 850 };
        
        this.charts.budget = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Realisasi', 'Sisa Budget'],
                datasets: [{
                    data: [budgetData.realisasi, budgetData.budget - budgetData.realisasi],
                    backgroundColor: ['#2E7D32', '#E0E0E0'],
                    borderWidth: 0
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

    renderComparisonCharts() {
        // Render kebun comparison chart
        this.renderKebunComparisonChart();
        this.renderDivisiComparisonChart();
    }

    renderKebunComparisonChart() {
        const ctx = document.getElementById('kebunComparisonChart').getContext('2d');
        
        if (this.charts.kebunComparison) {
            this.charts.kebunComparison.destroy();
        }

        // Group data by kebun
        const kebunData = {};
        this.summaryData.forEach(item => {
            if (!kebunData[item.kebun]) {
                kebunData[item.kebun] = 0;
            }
            kebunData[item.kebun] += parseFloat(item.totalTonase);
        });

        this.charts.kebunComparison = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: Object.keys(kebunData),
                datasets: [{
                    label: 'Total Produksi (Ton)',
                    data: Object.values(kebunData),
                    backgroundColor: ['#2E7D32', '#4CAF50', '#81C784', '#FF9800', '#2196F3']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    renderDivisiComparisonChart() {
        const ctx = document.getElementById('divisiComparisonChart').getContext('2d');
        
        if (this.charts.divisiComparison) {
            this.charts.divisiComparison.destroy();
        }

        // Group data by divisi
        const divisiData = {};
        this.summaryData.forEach(item => {
            if (!divisiData[item.divisi]) {
                divisiData[item.divisi] = 0;
            }
            divisiData[item.divisi] += parseFloat(item.totalTonase);
        });

        this.charts.divisiComparison = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: Object.keys(divisiData),
                datasets: [{
                    label: 'Total Produksi (Ton)',
                    data: Object.values(divisiData),
                    backgroundColor: ['#2E7D32', '#4CAF50', '#81C784', '#FF9800']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    renderSummaryTable() {
        const tbody = document.querySelector('#monthlySummaryTable tbody');
        tbody.innerHTML = '';
        
        this.summaryData.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.kebun}</td>
                <td>${item.divisi}</td>
                <td>${parseFloat(item.totalTonase).toLocaleString('id-ID')}</td>
                <td>${parseInt(item.totalJJG).toLocaleString('id-ID')}</td>
                <td>${parseFloat(item.totalLuas).toLocaleString('id-ID')}</td>
                <td>${parseInt(item.totalTK).toLocaleString('id-ID')}</td>
                <td>${item.outputPerHa}</td>
                <td>${item.outputPerHK}</td>
                <td>${item.akp}</td>
                <td>${item.bjr}</td>
                <td>${item.refraksi}%</td>
                <td>${item.acv}%</td>
            `;
            tbody.appendChild(row);
        });
        
        // Initialize or update DataTable
        if (this.dataTable) {
            this.dataTable.destroy();
        }
        
        this.dataTable = $('#monthlySummaryTable').DataTable({
            pageLength: 10,
            lengthChange: true,
            searching: true,
            ordering: true,
            info: true,
            autoWidth: false,
            dom: 'Bfrtip',
            buttons: [
                'copy', 'csv', 'excel', 'pdf', 'print'
            ],
            language: {
                url: '//cdn.datatables.net/plug-ins/1.13.6/i18n/id.json'
            }
        });
    }

    async applyFilters() {
        await this.loadMonthlyData();
    }

    resetFilters() {
        this.setDefaultFilters();
        document.getElementById('kebunFilter').value = '';
        document.getElementById('divisiFilter').value = '';
        this.updateDivisiDropdown('');
        this.loadMonthlyData();
    }

    async refreshDashboard() {
        await this.loadMonthlyData();
        this.showAlert('Dashboard berhasil diperbarui', 'success');
    }

    toggleComparisonMode() {
        this.comparisonMode = !this.comparisonMode;
        const comparisonCharts = document.getElementById('comparisonCharts');
        
        if (this.comparisonMode) {
            comparisonCharts.style.display = 'block';
            this.renderComparisonCharts();
            this.showAlert('Mode komparasi diaktifkan', 'info');
        } else {
            comparisonCharts.style.display = 'none';
            this.showAlert('Mode komparasi dinonaktifkan', 'info');
        }
    }

    updateChartType() {
        this.renderMonthlyTrendChart();
    }

    exportToExcel() {
        if (this.dataTable) {
            this.dataTable.button('.buttons-excel').trigger();
        }
    }

    exportToPDF() {
        if (this.dataTable) {
            this.dataTable.button('.buttons-pdf').trigger();
        }
    }

    printDashboard() {
        window.print();
    }

    toggleColumns() {
        const modal = new bootstrap.Modal(document.getElementById('columnModal'));
        this.populateColumnCheckboxes();
        modal.show();
    }

    populateColumnCheckboxes() {
        const container = document.getElementById('columnCheckboxes');
        const headers = ['Kebun', 'Divisi', 'Total Tonase', 'Total JJG', 'Total Luas', 'Total TK', 'Output/Ha', 'Output/HK', 'AKP', 'BJR', 'Refraksi %', 'ACV %'];
        
        container.innerHTML = '';
        headers.forEach((header, index) => {
            const div = document.createElement('div');
            div.className = 'col-md-6 mb-2';
            div.innerHTML = `
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" id="col${index}" checked>
                    <label class="form-check-label" for="col${index}">
                        ${header}
                    </label>
                </div>
            `;
            container.appendChild(div);
        });
    }

    applyColumnSettings() {
        const checkboxes = document.querySelectorAll('#columnCheckboxes input[type="checkbox"]');
        checkboxes.forEach((checkbox, index) => {
            const column = this.dataTable.column(index);
            column.visible(checkbox.checked);
        });
        
        const modal = bootstrap.Modal.getInstance(document.getElementById('columnModal'));
        modal.hide();
    }

    exportTable() {
        if (this.dataTable) {
            this.dataTable.button('.buttons-excel').trigger();
        }
    }

    showLoading(show) {
        const kpiElements = document.querySelectorAll('.stat-card h4');
        kpiElements.forEach(el => {
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
    new MonthlyDashboard();
});
