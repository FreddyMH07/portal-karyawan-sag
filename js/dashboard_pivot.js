/**
 * Dashboard Pivot Analysis JavaScript
 * Portal Karyawan SAG v3.0
 */

class PivotDashboard {
    constructor() {
        this.rawData = [];
        this.pivotData = [];
        this.currentChart = null;
        this.currentUser = getCurrentUser();
        this.initializePivot();
    }

    initializePivot() {
        this.setDefaultDates();
        this.loadInitialData();
        this.initializeEventListeners();
    }

    setDefaultDates() {
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        
        document.getElementById('startDate').value = startOfMonth.toISOString().split('T')[0];
        document.getElementById('endDate').value = today.toISOString().split('T')[0];
    }

    initializeEventListeners() {
        // Analysis type change
        const analysisType = document.getElementById('analysisType');
        if (analysisType) {
            analysisType.addEventListener('change', () => this.updateFieldOptions());
        }

        // Chart type change
        const chartType = document.getElementById('chartType');
        if (chartType) {
            chartType.addEventListener('change', () => this.updateChartOptions());
        }
    }

    async loadInitialData() {
        try {
            showLoading(true);
            
            const filters = {
                startDate: document.getElementById('startDate').value,
                endDate: document.getElementById('endDate').value
            };

            const response = await callAPI('getDailyDashboardData', {
                filters: filters,
                userInfo: this.currentUser
            });

            if (response.success) {
                this.rawData = response.data.tableData || [];
                this.populateFieldOptions();
                showAlert('Data berhasil dimuat', 'success', 2000);
            } else {
                throw new Error(response.error || 'Gagal memuat data');
            }
        } catch (error) {
            console.error('Error loading data:', error);
            showAlert('Gagal memuat data: ' + error.message, 'danger');
        } finally {
            showLoading(false);
        }
    }

    populateFieldOptions() {
        if (this.rawData.length === 0) return;

        const numericFields = [];
        const categoricalFields = [];
        const dateFields = [];

        // Analyze field types from first row
        const sampleRow = this.rawData[0];
        Object.keys(sampleRow).forEach(field => {
            const value = sampleRow[field];
            
            if (field.toLowerCase().includes('tanggal') || field.toLowerCase().includes('date')) {
                dateFields.push(field);
            } else if (typeof value === 'number' || !isNaN(parseFloat(value))) {
                numericFields.push(field);
            } else {
                categoricalFields.push(field);
            }
        });

        // Populate dropdowns
        this.populateSelect('xAxisField', [...categoricalFields, ...dateFields]);
        this.populateSelect('yAxisField', numericFields);
        this.populateSelect('groupByField', categoricalFields);
        this.populateSelect('aggregateField', numericFields);
    }

    populateSelect(selectId, options) {
        const select = document.getElementById(selectId);
        if (!select) return;

        select.innerHTML = '<option value="">Pilih Field</option>';
        options.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option;
            optionElement.textContent = option;
            select.appendChild(optionElement);
        });
    }

    updateFieldOptions() {
        const analysisType = document.getElementById('analysisType').value;
        const fieldsContainer = document.getElementById('fieldsContainer');
        
        if (!fieldsContainer) return;

        // Show/hide relevant field selectors based on analysis type
        const xAxisGroup = document.getElementById('xAxisGroup');
        const yAxisGroup = document.getElementById('yAxisGroup');
        const groupByGroup = document.getElementById('groupByGroup');
        const aggregateGroup = document.getElementById('aggregateGroup');

        // Reset visibility
        [xAxisGroup, yAxisGroup, groupByGroup, aggregateGroup].forEach(group => {
            if (group) group.style.display = 'block';
        });

        switch (analysisType) {
            case 'comparison':
                if (yAxisGroup) yAxisGroup.style.display = 'none';
                break;
            case 'trend':
                if (groupByGroup) groupByGroup.style.display = 'none';
                break;
            case 'correlation':
                if (aggregateGroup) aggregateGroup.style.display = 'none';
                break;
        }
    }

    updateChartOptions() {
        const chartType = document.getElementById('chartType').value;
        // Additional chart-specific options can be added here
        console.log('Chart type changed to:', chartType);
    }

    // MISSING FUNCTION - Added generateAnalysis
    async generateAnalysis() {
        try {
            const config = this.getAnalysisConfig();
            
            if (!this.validateConfig(config)) {
                return;
            }

            showLoading(true);

            // Process data based on configuration
            const processedData = this.processData(config);
            
            // Generate visualization
            this.createVisualization(processedData, config);
            
            // Update summary
            this.updateSummary(processedData, config);

            showAlert('Analisis berhasil dibuat', 'success');
        } catch (error) {
            console.error('Error generating analysis:', error);
            showAlert('Gagal membuat analisis: ' + error.message, 'danger');
        } finally {
            showLoading(false);
        }
    }

    getAnalysisConfig() {
        return {
            analysisType: document.getElementById('analysisType').value,
            chartType: document.getElementById('chartType').value,
            xAxisField: document.getElementById('xAxisField').value,
            yAxisField: document.getElementById('yAxisField').value,
            groupByField: document.getElementById('groupByField').value,
            aggregateField: document.getElementById('aggregateField').value,
            aggregateFunction: document.getElementById('aggregateFunction').value
        };
    }

    validateConfig(config) {
        if (!config.analysisType) {
            showAlert('Pilih jenis analisis', 'warning');
            return false;
        }

        if (!config.chartType) {
            showAlert('Pilih jenis chart', 'warning');
            return false;
        }

        if (!config.xAxisField) {
            showAlert('Pilih field untuk X-Axis', 'warning');
            return false;
        }

        if (config.analysisType !== 'pivot' && !config.aggregateField) {
            showAlert('Pilih field untuk agregasi', 'warning');
            return false;
        }

        return true;
    }

    processData(config) {
        let processedData = [];

        switch (config.analysisType) {
            case 'comparison':
                processedData = this.processComparisonData(config);
                break;
            case 'trend':
                processedData = this.processTrendData(config);
                break;
            case 'correlation':
                processedData = this.processCorrelationData(config);
                break;
            case 'pivot':
                processedData = this.processPivotData(config);
                break;
            default:
                processedData = this.processDefaultData(config);
        }

        return processedData;
    }

    processComparisonData(config) {
        const grouped = {};
        
        this.rawData.forEach(row => {
            const key = row[config.xAxisField];
            const value = safeNumber(row[config.aggregateField]);
            
            if (!grouped[key]) {
                grouped[key] = [];
            }
            grouped[key].push(value);
        });

        return Object.keys(grouped).map(key => ({
            label: key,
            value: this.aggregate(grouped[key], config.aggregateFunction)
        }));
    }

    processTrendData(config) {
        const sorted = this.rawData
            .filter(row => row[config.xAxisField])
            .sort((a, b) => new Date(a[config.xAxisField]) - new Date(b[config.xAxisField]));

        return sorted.map(row => ({
            label: formatDateID(row[config.xAxisField]),
            value: safeNumber(row[config.aggregateField])
        }));
    }

    processCorrelationData(config) {
        return this.rawData
            .filter(row => row[config.xAxisField] && row[config.yAxisField])
            .map(row => ({
                x: safeNumber(row[config.xAxisField]),
                y: safeNumber(row[config.yAxisField]),
                label: row.Kebun || row.Divisi || 'Data Point'
            }));
    }

    processPivotData(config) {
        // Create pivot table structure
        const pivot = {};
        const rows = new Set();
        const cols = new Set();

        this.rawData.forEach(row => {
            const rowKey = row[config.xAxisField];
            const colKey = row[config.groupByField] || 'Total';
            const value = safeNumber(row[config.aggregateField]);

            rows.add(rowKey);
            cols.add(colKey);

            if (!pivot[rowKey]) {
                pivot[rowKey] = {};
            }
            if (!pivot[rowKey][colKey]) {
                pivot[rowKey][colKey] = [];
            }
            pivot[rowKey][colKey].push(value);
        });

        // Aggregate values
        Object.keys(pivot).forEach(rowKey => {
            Object.keys(pivot[rowKey]).forEach(colKey => {
                pivot[rowKey][colKey] = this.aggregate(pivot[rowKey][colKey], config.aggregateFunction);
            });
        });

        return {
            pivot: pivot,
            rows: Array.from(rows),
            cols: Array.from(cols)
        };
    }

    processDefaultData(config) {
        return this.rawData.map((row, index) => ({
            label: `Data ${index + 1}`,
            value: safeNumber(row[config.aggregateField])
        }));
    }

    aggregate(values, func) {
        if (values.length === 0) return 0;

        switch (func) {
            case 'sum':
                return values.reduce((a, b) => a + b, 0);
            case 'avg':
                return values.reduce((a, b) => a + b, 0) / values.length;
            case 'min':
                return Math.min(...values);
            case 'max':
                return Math.max(...values);
            case 'count':
                return values.length;
            default:
                return values.reduce((a, b) => a + b, 0);
        }
    }

    createVisualization(data, config) {
        const ctx = document.getElementById('analysisChart');
        if (!ctx) return;

        // Destroy existing chart
        if (this.currentChart) {
            this.currentChart.destroy();
        }

        if (config.chartType === 'pivot') {
            this.createPivotTable(data, config);
            return;
        }

        const chartConfig = this.getChartConfig(data, config);
        this.currentChart = new Chart(ctx, chartConfig);
    }

    getChartConfig(data, config) {
        const baseConfig = {
            type: config.chartType,
            data: {
                labels: data.map(item => item.label),
                datasets: [{
                    label: config.aggregateField,
                    data: data.map(item => item.value),
                    backgroundColor: CONFIG.DEFAULTS.CHART_COLORS,
                    borderColor: CONFIG.DEFAULTS.CHART_COLORS[0],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: `${config.analysisType.toUpperCase()} - ${config.aggregateField}`
                    }
                }
            }
        };

        // Customize based on chart type
        switch (config.chartType) {
            case 'scatter':
                baseConfig.data.datasets[0].data = data.map(item => ({
                    x: item.x,
                    y: item.y
                }));
                break;
            case 'line':
                baseConfig.options.scales = {
                    y: { beginAtZero: true }
                };
                break;
        }

        return baseConfig;
    }

    createPivotTable(data, config) {
        const container = document.getElementById('pivotTableContainer');
        if (!container) return;

        let html = '<div class="table-responsive"><table class="table table-bordered table-sm">';
        
        // Header
        html += '<thead class="table-dark"><tr><th>' + config.xAxisField + '</th>';
        data.cols.forEach(col => {
            html += '<th>' + col + '</th>';
        });
        html += '</tr></thead>';

        // Body
        html += '<tbody>';
        data.rows.forEach(row => {
            html += '<tr><td><strong>' + row + '</strong></td>';
            data.cols.forEach(col => {
                const value = data.pivot[row] && data.pivot[row][col] ? data.pivot[row][col] : 0;
                html += '<td>' + formatNumber(value, 2) + '</td>';
            });
            html += '</tr>';
        });
        html += '</tbody></table></div>';

        container.innerHTML = html;
    }

    updateSummary(data, config) {
        const summaryContainer = document.getElementById('analysisSummary');
        if (!summaryContainer) return;

        let summary = `<h6>Ringkasan Analisis</h6>`;
        summary += `<p><strong>Jenis Analisis:</strong> ${config.analysisType}</p>`;
        summary += `<p><strong>Field Utama:</strong> ${config.aggregateField}</p>`;
        
        if (Array.isArray(data)) {
            const values = data.map(item => item.value).filter(v => !isNaN(v));
            if (values.length > 0) {
                summary += `<p><strong>Total Data:</strong> ${values.length}</p>`;
                summary += `<p><strong>Nilai Tertinggi:</strong> ${formatNumber(Math.max(...values), 2)}</p>`;
                summary += `<p><strong>Nilai Terendah:</strong> ${formatNumber(Math.min(...values), 2)}</p>`;
                summary += `<p><strong>Rata-rata:</strong> ${formatNumber(values.reduce((a, b) => a + b, 0) / values.length, 2)}</p>`;
            }
        }

        summaryContainer.innerHTML = summary;
    }

    // MISSING FUNCTION - Added resetAnalysis
    resetAnalysis() {
        // Reset form
        document.getElementById('analysisType').value = '';
        document.getElementById('chartType').value = '';
        document.getElementById('xAxisField').value = '';
        document.getElementById('yAxisField').value = '';
        document.getElementById('groupByField').value = '';
        document.getElementById('aggregateField').value = '';
        document.getElementById('aggregateFunction').value = 'sum';

        // Clear chart
        if (this.currentChart) {
            this.currentChart.destroy();
            this.currentChart = null;
        }

        // Clear pivot table
        const pivotContainer = document.getElementById('pivotTableContainer');
        if (pivotContainer) {
            pivotContainer.innerHTML = '';
        }

        // Clear summary
        const summaryContainer = document.getElementById('analysisSummary');
        if (summaryContainer) {
            summaryContainer.innerHTML = '<p class="text-muted">Pilih konfigurasi analisis dan klik Generate untuk melihat hasil.</p>';
        }

        showAlert('Analisis telah direset', 'info');
    }

    async refreshData() {
        await this.loadInitialData();
    }
}

// Global functions for button handlers
function generateAnalysis() {
    if (window.pivotDashboard) {
        window.pivotDashboard.generateAnalysis();
    }
}

function resetAnalysis() {
    if (window.pivotDashboard) {
        window.pivotDashboard.resetAnalysis();
    }
}

function refreshData() {
    if (window.pivotDashboard) {
        window.pivotDashboard.refreshData();
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    if (requireAuth()) {
        window.pivotDashboard = new PivotDashboard();
    }
});
