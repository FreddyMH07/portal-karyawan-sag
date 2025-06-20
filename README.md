<<<<<<< HEAD
# Portal Karyawan SAG

Portal Karyawan SAG adalah sistem manajemen terintegrasi untuk PT Sawit Asahan Graha yang menggabungkan dashboard produksi, sistem booking, manajemen absensi, KPI tracking, dan asset management dalam satu platform dengan role-based access control.

## 🚀 Features

### Dashboard Produksi
- **Dashboard Harian**: Monitoring produksi harian dengan KPI real-time
- **Dashboard Bulanan**: Analisis trend produksi bulanan
- **Dashboard Pivot**: Analisis data multi-dimensi dengan pivot table

### Sistem Booking
- Booking ruang meeting dan fasilitas
- Manajemen jadwal dan konfirmasi otomatis
- Status tracking dan cancellation

### Manajemen Absensi
- Input dan tracking kehadiran karyawan
- Multi-shift support
- Location-based check-in/out
- Laporan absensi per departemen

### KPI Management
- Target vs realisasi tracking
- Auto-calculation achievement percentage
- Grade assignment (A/B/C/D)
- Performance monitoring per divisi

### Asset Management
- Inventory tracking dan monitoring
- Maintenance scheduling
- Asset condition monitoring
- Depreciation tracking

### Fitur Umum
- **Role-Based Access Control**: 7 level akses (Admin, Manager, Supervisor, Staff, HR, Finance, Operator)
- **Real-time Data**: Sinkronisasi langsung dengan Google Sheets
- **Responsive Design**: Optimal di desktop dan mobile
- **Export Data**: Export ke Excel/PDF
- **Advanced Filtering**: Filter data berdasarkan berbagai kriteria
- **Audit Trail**: Tracking semua perubahan data

## 🛠️ Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Backend**: Google Apps Script
- **Database**: Google Sheets
- **Charts**: Chart.js
- **UI Framework**: Bootstrap 5
- **Icons**: Font Awesome

## 📊 Sheet Structure

### DATA HARIAN (Updated)
**Kolom lengkap:**
- Tanggal, Bulan, Tahun, Kebun, Divisi
- AKP Panen, Jumlah TK Panen, Luas Panen (HA)
- JJG Panen (Jjg), JJG Kirim (Jjg), Ketrek
- Total JJG Kirim (Jjg), Tonase Panen (Kg)
- Refraksi (Kg), Refraksi (%), Restant (Jjg)
- BJR Hari ini, Output (Kg/HK), Output (Ha/HK)
- Budget Harian, Timbang Kebun Harian
- Timbang PKS Harian, Rotasi Panen, Input By

### BOOKING
- ID, Tanggal Booking, Waktu Mulai/Selesai
- Ruangan/Fasilitas, Keperluan, Pemohon
- Departemen, Status, Catatan
- Created By, Created Date

### ABSENSI
- ID, Tanggal, NIK, Nama Karyawan
- Departemen, Shift, Jam Masuk/Keluar
- Status Kehadiran, Keterangan
- Lokasi Check-in/out, Created By

### KPI
- ID, Periode, Departemen, Kebun, Divisi
- Target/Realisasi Produksi, Kualitas, Efisiensi
- Achievement (%), Skor Total, Grade
- Catatan, Created By

### ASSET
- ID, Kode Asset, Nama Asset, Kategori
- Lokasi, Kondisi, Tanggal Pembelian
- Harga Pembelian, Nilai Buku, Status
- PIC, Maintenance Schedule, Catatan

## 🔐 Role-Based Access Control

### Admin
**Full access ke semua modul:**
- DATA_HARIAN, BOOKING, ABSENSI, KPI, ASSET
- MASTER_DATA, USERS
- Delete permissions

### Manager
**Managerial access:**
- DATA_HARIAN, BOOKING, ABSENSI, KPI, ASSET

### Supervisor
**Operational supervision:**
- DATA_HARIAN, ABSENSI, KPI

### Staff
**Basic operations:**
- DATA_HARIAN, BOOKING

### HR
**Human Resources:**
- ABSENSI, USERS

### Finance
**Financial tracking:**
- KPI, ASSET

### Operator
**Production data:**
- DATA_HARIAN

## 🚀 Getting Started

### Prerequisites
- Google Account dengan akses Google Sheets dan Apps Script
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Installation

1. **Clone Repository**
   ```bash
   git clone https://github.com/yourusername/portal-karyawan-sag.git
   cd portal-karyawan-sag
   ```

2. **Setup Google Sheets**
   - Buat Google Sheets baru
   - Copy Sheet ID dari URL: `1UMA4dHaqG6dmJ0kWTq7NPz6xmqnTPSqJpMu4ws7TFjs`

3. **Deploy Google Apps Script**
   - Buka Google Apps Script (script.google.com)
   - Buat project baru
   - Copy code dari `gas/code.gs`
   - Jalankan `initializeAllSheets()` untuk setup otomatis
   - Deploy sebagai web app
   - Copy deployment URL

4. **Configure Frontend**
   - Update `js/config.js` dengan API URL
   - Test koneksi ke backend

5. **Setup Users**
   - Tambahkan user di sheet USERS dengan role yang sesuai
   - Format: id, email, password, name, role

## 📁 Project Structure

```
portal-karyawan-sag/
├── index.html              # Landing page
├── login.html              # Login page
├── dashboard_harian.html   # Daily dashboard
├── dashboard_bulanan.html  # Monthly dashboard
├── dashboard_pivot.html    # Pivot dashboard
├── produksi.html          # Production management
├── hr.html                # HR management
├── css/
│   └── style.css          # Main stylesheet
├── js/
│   ├── config.js          # Configuration
│   ├── login.js           # Login functionality
│   ├── main.js            # Common functions
│   ├── dashboard_harian.js # Daily dashboard logic
│   ├── dashboard_bulanan.js # Monthly dashboard logic
│   └── produksi.js        # Production management
├── gas/
│   └── code.gs            # Google Apps Script backend (UPDATED)
├── assets/
│   └── logo-PTSAG.png     # Company logo
├── SHEET_STRUCTURE.md     # Detailed sheet documentation
├── DEPLOYMENT.md          # Deployment guide
└── README.md
```

## 🔧 API Endpoints

### Authentication
- `login` - Login dengan role-based permissions

### Data Operations
- `getDailyDashboardData` - Dashboard data harian
- `getMonthlyDashboardData` - Dashboard data bulanan
- `submitDailyData` - Submit data produksi
- `updateDailyData` - Update data produksi
- `deleteDailyData` - Delete data (admin only)

### Module-Specific APIs
- **Booking**: `getBookingData`, `submitBooking`, `updateBooking`, `cancelBooking`
- **Absensi**: `getAbsensiData`, `submitAbsensi`, `updateAbsensi`
- **KPI**: `getKPIData`, `submitKPI`, `updateKPI`
- **Asset**: `getAssetData`, `submitAsset`, `updateAsset`

## ✨ New Features

### Auto-Calculation
- **KPI**: Achievement percentage dan grade otomatis
- **Asset**: Depreciation calculation
- **Absensi**: Working hours calculation

### Enhanced Security
- Permission checking pada setiap API call
- User activity logging
- Data validation dan sanitization

### Improved UX
- Role-based menu visibility
- Context-aware forms
- Real-time validation feedback

## 🔒 Security Features

- **Authentication**: Secure login dengan role validation
- **Authorization**: Granular permission control
- **Data Integrity**: Input validation dan error handling
- **Audit Trail**: Complete activity logging
- **Access Control**: Sheet-level permission enforcement

## 📈 Performance Optimization

- **Efficient Data Loading**: Filtered queries untuk reduce payload
- **Caching Strategy**: Smart caching untuk frequently accessed data
- **Lazy Loading**: On-demand resource loading
- **Optimized Queries**: Minimal API calls dengan batch operations
=======
# Portal Karyawan PT Sahabat Agro Group

Portal web modern untuk digitalisasi karyawan dan manajemen operasional PT Sahabat Agro Group.

## 🚀 Fitur Utama

### 1. Portal Produksi
- **Dashboard Harian**: Monitoring produksi real-time dengan filter dinamis
- **Dashboard Bulanan**: Analisis agregasi data bulanan dan trend
- **Pivot Analisis**: Komparasi antar PT, divisi, dan periode waktu
- **Rawat Kebun**: Monitoring aktivitas perawatan kebun
- **Upah Karyawan**: Pengelolaan gaji dan insentif pekerja

### 2. Portal HR
- **Booking Ruangan**: Sistem booking dengan QR code dan Google Calendar
- **Absensi Digital**: Sistem absensi dan rekap kehadiran
- **KPI Management**: Input dan monitoring KPI karyawan
- **Asset Movement**: Tracking movement asset perusahaan

### 3. Portal Umum & Helpdesk
- **Company Info**: Informasi perusahaan dan pengumuman
- **Helpdesk**: Sistem ticketing untuk IT dan maintenance
- **SOP**: Standard Operating Procedures

## 🔐 Sistem Login

### Demo Accounts
```
Admin:
Email: admin@sahabatagro.co.id
Password: admin123

Manager Produksi:
Email: produksi@sahabatagro.co.id
Password: produksi123

HR Manager:
Email: hr@sahabatagro.co.id
Password: hr123

Karyawan:
Email: user@sahabatagro.co.id
Password: user123
```

### Login Features
- Email/Password authentication
- Google OAuth integration
- Role-based access control
- Remember me functionality
- Session management

## 📊 Data Integration

### Google Sheets Integration
- **Production Data**: https://docs.google.com/spreadsheets/d/1UMA4dHaqG6dmJ0kWTq7NPz6xmqnTPSqJpMu4ws7TFjs/edit?usp=sharing
- Real-time data fetching
- Automatic formula calculations
- Export capabilities (PDF, Excel, CSV)

### Key Formulas
```javascript
// ACV Production
ACV = (Total Timbang PKS Harian / Budget Alokasi Bulanan) * 100

// AKP Bulanan
AKP = SUM(JJG Panen) / (SUM(Luas Panen) * SPH Panen)

// BJR Bulanan
BJR = SUM(Tonase Panen) / SUM(Total JJG Kirim)

// Refraksi %
Refraksi = SUM(Refraksi Kg) / SUM(Tonase Panen Kg) * 100
```

## 🛠️ Teknologi

### Frontend
- **HTML5**: Semantic markup
- **CSS3**: Custom styling with CSS variables
- **Bootstrap 5**: Responsive framework
- **JavaScript ES6+**: Modern JavaScript features
- **Chart.js**: Data visualization
- **DataTables**: Interactive tables

### Backend/API
- **Google Apps Script**: Default backend for Google Sheets integration
- **Node.js/Express**: Alternative backend option
- **MongoDB Atlas**: Database option for scalability

### Libraries & Dependencies
- Font Awesome 6.0.0
- jQuery 3.7.0
- Bootstrap 5.3.0
- DataTables 1.13.6

## 📁 Struktur Project

```
portal-karyawan-sag/
├── index.html              # Portal utama
├── login.html              # Halaman login
├── produksi.html           # Portal produksi
├── dashboard_harian.html   # Dashboard harian
├── dashboard_bulanan.html  # Dashboard bulanan
├── dashboard_pivot.html    # Pivot analisis
├── hr.html                 # Portal HR
├── booking.html            # Booking ruangan
├── absensi.html           # Absensi digital
├── kpi.html               # KPI management
├── asset.html             # Asset movement
├── umum.html              # Portal umum
├── helpdesk.html          # Helpdesk
├── rawat.html             # Rawat kebun
├── upah.html              # Upah karyawan
├── assets/                # Images dan icons
│   ├── logo-PTSAG.png
│   └── favicon.ico
├── css/
│   └── style.css          # Custom styling
├── js/
│   ├── login.js           # Login functionality
│   ├── main.js            # Main portal logic
│   ├── produksi.js        # Production dashboard
│   ├── hr.js              # HR functionality
│   └── utils.js           # Utility functions
└── README.md
```

## 🚀 Cara Deploy

### 1. GitHub Pages
```bash
# Clone repository
git clone <repository-url>
cd portal-karyawan-sag

# Push ke GitHub
git add .
git commit -m "Initial commit"
git push origin main

# Enable GitHub Pages di repository settings
```

### 2. Netlify
```bash
# Drag & drop folder ke Netlify dashboard
# atau connect dengan GitHub repository
```

### 3. Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### 4. Local Development
```bash
# Menggunakan Python
python -m http.server 8000

# Menggunakan Node.js
npx http-server

# Akses di browser: http://localhost:8000
```

## 🔧 Konfigurasi

### Google Sheets API
1. Buat project di Google Cloud Console
2. Enable Google Sheets API
3. Buat service account dan download credentials
4. Share Google Sheet dengan service account email
5. Update API configuration di `js/config.js`

### Environment Variables
```javascript
// js/config.js
const CONFIG = {
    GOOGLE_SHEETS_ID: 'your-sheet-id',
    API_BASE_URL: 'your-api-url',
    GOOGLE_CLIENT_ID: 'your-google-oauth-client-id'
};
```

## 📱 Responsive Design

Portal ini fully responsive dan mobile-ready:
- **Desktop**: Full sidebar navigation
- **Tablet**: Collapsible sidebar
- **Mobile**: Bottom navigation dan optimized layout

## 🎨 Corporate Identity

Menggunakan warna dan style sesuai PT Sahabat Agro Group:
- **Primary**: #2E7D32 (Green)
- **Secondary**: #4CAF50 (Light Green)
- **Accent**: #81C784 (Lighter Green)
- **Warning**: #FF9800 (Orange)
- **Info**: #2196F3 (Blue)

## 📈 Performance

- **Lazy Loading**: Images dan components
- **Caching**: Browser caching untuk assets
- **Minification**: CSS dan JS minified untuk production
- **CDN**: Bootstrap dan libraries dari CDN

## 🔒 Security

- **Role-based Access**: Different access levels
- **Session Management**: Secure session handling
- **Input Validation**: Client dan server-side validation
- **HTTPS**: SSL/TLS encryption (production)
>>>>>>> 5781cb1529a94802cc9a79f6b48d25d517be3804

## 🐛 Troubleshooting

### Common Issues

<<<<<<< HEAD
1. **Permission Denied**
   - Check user role di USERS sheet
   - Verify ROLE_PERMISSIONS configuration

2. **Sheet Not Found**
   - Run `initializeAllSheets()` di Apps Script
   - Check sheet names match CONFIG.SHEETS

3. **API Errors**
   - Check Google Apps Script deployment
   - Verify SHEET_ID configuration

## 📞 Support & Documentation

- **Sheet Structure**: Lihat `SHEET_STRUCTURE.md`
- **Deployment Guide**: Lihat `DEPLOYMENT.md`
- **API Documentation**: Inline comments di `gas/code.gs`

## 🤝 Contributing

1. Fork repository
2. Create feature branch
3. Follow coding standards
4. Test dengan multiple roles
5. Submit pull request

## 📄 License

Proprietary software of PT Sawit Asahan Graha.

---

**Portal Karyawan SAG v3.0** - Enhanced with Role-Based Access Control & Multi-Module Management
=======
1. **Login tidak berfungsi**
   - Check browser console untuk error
   - Pastikan session storage enabled
   - Clear browser cache

2. **Data tidak muncul**
   - Check Google Sheets permissions
   - Verify API configuration
   - Check network connectivity

3. **Responsive issues**
   - Clear browser cache
   - Check viewport meta tag
   - Test di different devices

## 📞 Support

Untuk bantuan teknis atau pertanyaan:
- **Email**: it@sahabatagro.co.id
- **Internal Helpdesk**: Gunakan fitur helpdesk di portal
- **Documentation**: Lihat folder `docs/` untuk panduan detail

## 📄 License

© 2024 PT Sahabat Agro Group. All rights reserved.

---

**Portal Karyawan SAG** - One-stop solution untuk digitalisasi karyawan dan manajemen operasional.
>>>>>>> 5781cb1529a94802cc9a79f6b48d25d517be3804
