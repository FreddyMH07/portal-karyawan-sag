// Production portal functionality
class ProductionManager {
    constructor() {
        this.currentUser = null;
        this.productionData = [];
        this.initializeProduction();
    }

    initializeProduction() {
        this.checkAuthentication();
        this.loadUserInfo();
        this.initializeEventListeners();
        this.loadProductionStats();
        this.loadRecentActivity();
    }

    checkAuthentication() {
        const session = localStorage.getItem('sag_session');
        const tempSession = sessionStorage.getItem('sag_temp_session');
        
        if (!session && !tempSession) {
            window.location.href = 'login.html';
            return;
        }

        try {
            const sessionData = JSON.parse(session || tempSession);
            this.currentUser = sessionData.user;
            
            // Check production access permission
            if (!this.currentUser.permissions.includes('produksi') && this.currentUser.role !== 'admin') {
                alert('Anda tidak memiliki akses ke portal produksi');
                window.location.href = 'index.html';
                return;
            }
        } catch (error) {
            console.error('Session parsing error:', error);
            window.location.href = 'login.html';
        }
    }

    loadUserInfo() {
        if (this.currentUser) {
            document.getElementById('userName').textContent = this.currentUser.name;
        }
    }

    initializeEventListeners() {
        // Logout button
        document.getElementById('logoutBtn').addEventListener('click', (e) => {
            e.preventDefault();
            this.logout();
        });

        // Global functions for buttons
        window.refreshData = () => this.refreshData();
        window.exportData = () => this.exportData();
    }

    async loadProductionStats() {
        try {
            // Simulate loading production data from Google Sheets
            const stats = await this.fetchProductionStats();
            
            document.getElementById('todayProduction').textContent = stats.todayProduction;
            document.getElementById('acvProduction').textContent = stats.acvProduction + '%';
            document.getElementById('bjrDaily').textContent = stats.bjrDaily;
            document.getElementById('refraksi').textContent = stats.refraksi + '%';
            
        } catch (error) {
            console.error('Error loading production stats:', error);
            this.showAlert('Gagal memuat data produksi', 'warning');
        }
    }

    async fetchProductionStats() {
        // Simulate API call to Google Sheets
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Demo data - replace with actual Google Sheets API call
        const demoData = {
            todayProduction: (Math.random() * 50 + 20).toFixed(1),
            acvProduction: (Math.random() * 30 + 70).toFixed(1),
            bjrDaily: (Math.random() * 5 + 15).toFixed(2),
            refraksi: (Math.random() * 3 + 1).toFixed(2)
        };
        
        return demoData;
    }

    async loadRecentActivity() {
        try {
            const activities = await this.fetchRecentActivity();
            this.renderRecentActivity(activities);
        } catch (error) {
            console.error('Error loading recent activity:', error);
        }
    }

    async fetchRecentActivity() {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Demo data
        const kebunList = ['PT. PAL', 'PT. LSP RS', 'PT. LSP PR', 'CANDIMAS', 'PT. HSBS'];
        const divisiList = ['Divisi 1', 'Divisi 2', 'Divisi 3', 'Divisi 4'];
        const aktivitasList = ['Panen TBS', 'Input Data', 'Update BJR', 'Cek Kualitas', 'Maintenance'];
        const statusList = ['Selesai', 'Proses', 'Pending'];
        
        const activities = [];
        for (let i = 0; i < 10; i++) {
            const now = new Date();
            const randomHours = Math.floor(Math.random() * 24);
            const activityTime = new Date(now.getTime() - (randomHours * 60 * 60 * 1000));
            
            activities.push({
                waktu: activityTime.toLocaleString('id-ID'),
                kebun: kebunList[Math.floor(Math.random() * kebunList.length)],
                divisi: divisiList[Math.floor(Math.random() * divisiList.length)],
                aktivitas: aktivitasList[Math.floor(Math.random() * aktivitasList.length)],
                status: statusList[Math.floor(Math.random() * statusList.length)]
            });
        }
        
        return activities;
    }

    renderRecentActivity(activities) {
        const tbody = document.querySelector('#recentActivityTable tbody');
        tbody.innerHTML = '';
        
        activities.forEach(activity => {
            const statusClass = {
                'Selesai': 'success',
                'Proses': 'warning',
                'Pending': 'danger'
            }[activity.status] || 'secondary';
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${activity.waktu}</td>
                <td>${activity.kebun}</td>
                <td>${activity.divisi}</td>
                <td>${activity.aktivitas}</td>
                <td><span class="badge bg-${statusClass}">${activity.status}</span></td>
            `;
            tbody.appendChild(row);
        });
        
        // Initialize DataTable if not already initialized
        if (!$.fn.DataTable.isDataTable('#recentActivityTable')) {
            $('#recentActivityTable').DataTable({
                pageLength: 5,
                lengthChange: false,
                searching: true,
                ordering: true,
                info: true,
                autoWidth: false,
                language: {
                    url: '//cdn.datatables.net/plug-ins/1.13.6/i18n/id.json'
                }
            });
        }
    }

    async refreshData() {
        const refreshBtn = document.querySelector('button[onclick="refreshData()"]');
        const originalText = refreshBtn.innerHTML;
        
        refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i>Refreshing...';
        refreshBtn.disabled = true;
        
        try {
            await Promise.all([
                this.loadProductionStats(),
                this.loadRecentActivity()
            ]);
            
            this.showAlert('Data berhasil diperbarui', 'success');
        } catch (error) {
            console.error('Refresh error:', error);
            this.showAlert('Gagal memperbarui data', 'danger');
        } finally {
            refreshBtn.innerHTML = originalText;
            refreshBtn.disabled = false;
        }
    }

    exportData() {
        // Create export data
        const exportData = {
            timestamp: new Date().toISOString(),
            user: this.currentUser.name,
            stats: {
                todayProduction: document.getElementById('todayProduction').textContent,
                acvProduction: document.getElementById('acvProduction').textContent,
                bjrDaily: document.getElementById('bjrDaily').textContent,
                refraksi: document.getElementById('refraksi').textContent
            }
        };
        
        // Export as JSON
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `produksi-stats-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
        this.showAlert('Data berhasil diekspor', 'success');
    }

    logout() {
        localStorage.removeItem('sag_session');
        localStorage.removeItem('sag_session_expiry');
        sessionStorage.removeItem('sag_temp_session');
        window.location.href = 'login.html';
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

// Google Sheets Integration Class
class GoogleSheetsAPI {
    constructor() {
        this.sheetId = '1UMA4dHaqG6dmJ0kWTq7NPz6xmqnTPSqJpMu4ws7TFjs';
        this.apiKey = 'YOUR_GOOGLE_SHEETS_API_KEY'; // Replace with actual API key
    }

    async fetchSheetData(range) {
        try {
            const url = `https://sheets.googleapis.com/v4/spreadsheets/${this.sheetId}/values/${range}?key=${this.apiKey}`;
            const response = await fetch(url);
            const data = await response.json();
            return data.values || [];
        } catch (error) {
            console.error('Google Sheets API error:', error);
            throw error;
        }
    }

    async getProductionData() {
        try {
            const data = await this.fetchSheetData('Sheet1!A:Z');
            return this.processProductionData(data);
        } catch (error) {
            console.error('Error fetching production data:', error);
            return this.getDemoData();
        }
    }

    processProductionData(rawData) {
        if (!rawData.length) return [];
        
        const headers = rawData[0];
        const rows = rawData.slice(1);
        
        return rows.map(row => {
            const item = {};
            headers.forEach((header, index) => {
                item[header] = row[index] || '';
            });
            return item;
        });
    }

    getDemoData() {
        // Return demo data when API is not available
        return [
            {
                tanggal: '2024-01-15',
                kebun: 'PT. PAL',
                divisi: 'Divisi 1',
                produksi: '25.5',
                bjr: '18.2',
                refraksi: '2.1'
            }
            // Add more demo data as needed
        ];
    }
}

// Initialize production manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ProductionManager();
});
