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

## 🐛 Troubleshooting

### Common Issues

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
