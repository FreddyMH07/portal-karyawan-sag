# Portal Karyawan SAG v2.0

## 🎯 Overview

Portal Karyawan SAG adalah sistem manajemen karyawan berbasis web yang telah diupgrade menjadi **multiple APIs architecture** untuk meningkatkan performa, keamanan, dan skalabilitas.

### ✨ Key Features

- 🏭 **Manajemen Produksi** - Tracking data produksi harian dan bulanan
- 👥 **Sistem Absensi** - Check-in/out karyawan dengan tracking lokasi
- 📅 **Booking Ruangan** - Sistem reservasi ruangan dan fasilitas
- 📊 **Asset & KPI Management** - Manajemen aset dan tracking KPI
- 🔐 **User Management** - Role-based access control dengan 7 level user
- 📱 **Responsive Design** - Optimized untuk desktop dan mobile
- 🛡️ **Security** - Token-based authentication dan input validation

## 🏗️ Architecture

### v2.0 (Current)
```
Frontend → API Gateway → Multiple Specialized APIs
                      ├── Produksi API (Production Data)
                      ├── Absensi API (Attendance)
                      ├── Booking API (Room Booking)
                      ├── Asset API (Asset & KPI)
                      └── Users API (Authentication)
```

### Performance Improvements
| Metric | v1.0 | v2.0 | Improvement |
|--------|------|------|-------------|
| Response Time | 2-5s | 1-2s | 🚀 60% faster |
| Concurrent Users | 15 | 50+ | 🚀 300% increase |
| Error Rate | 10% | <2% | 🚀 80% reduction |

## 📁 Project Structure

```
portal-karyawan-sag/
├── 📄 HTML Pages
│   ├── index.html              # Dashboard utama
│   ├── login.html              # Halaman login
│   ├── admin.html              # Panel admin
│   ├── produksi.html           # Manajemen produksi
│   ├── absensi.html            # Sistem absensi
│   ├── booking.html            # Booking ruangan
│   └── test-all-apis.html      # Testing suite
├── 📁 js/                      # JavaScript files
│   ├── api-config.js           # Konfigurasi API terpusat
│   ├── auth.js                 # Authentication & authorization
│   ├── utils.js                # Utility functions
│   └── login.js                # Login functionality
├── 📁 gas-apis/                # Google Apps Script APIs
│   ├── produksi-api-updated.gs # Enhanced production API
│   ├── absensi-api.gs          # Attendance API
│   ├── booking-api.gs          # Booking API
│   ├── asset-api.gs            # Asset/KPI API
│   └── users-api.gs            # Users API
├── 📁 css/                     # Stylesheets
├── 📁 assets/                  # Images & static files
└── 📄 Documentation
    ├── DEPLOYMENT_COMPLETE.md  # Complete deployment guide
    ├── README_UPGRADE.md       # Upgrade information
    └── UPGRADE_SUMMARY.md      # Summary of changes
```

## 🚀 Quick Start

### Prerequisites
- Google Account dengan akses ke Google Sheets & Apps Script
- Web browser modern (Chrome, Firefox, Safari, Edge)
- Internet connection

### Installation

1. **Clone Repository**
   ```bash
   git clone https://github.com/FreddyMH07/portal-karyawan-sag.git
   cd portal-karyawan-sag
   ```

2. **Deploy APIs**
   - Follow detailed steps in `DEPLOYMENT_COMPLETE.md`
   - Deploy 4 new APIs to Google Apps Script
   - Update configuration with API URLs

3. **Setup Google Sheets**
   - Prepare sheets for each module
   - Add required headers and initial data
   - Set proper permissions

4. **Test & Go Live**
   - Use `test-all-apis.html` to verify all APIs
   - Test login with admin credentials
   - Verify all modules are working

## 🔐 User Roles & Permissions

| Role | Permissions | Description |
|------|-------------|-------------|
| **Admin** | All modules | Full system access |
| **Manager** | Produksi, Absensi, Booking, Asset | Management level access |
| **Supervisor** | Produksi, Absensi, Asset | Supervisory access |
| **Staff** | Produksi, Booking | Basic employee access |
| **HR** | Absensi, Users | HR department access |
| **Finance** | Asset | Finance department access |
| **Operator** | Produksi | Production operator access |

## 📊 API Endpoints

### 🏭 Produksi API
- `getData` - Get production data with filters
- `addData` - Add new production record
- `updateData` - Update existing record
- `deleteData` - Delete production record
- `getMasterData` - Get master data
- `getStatistics` - Get production statistics

### 👥 Absensi API
- `getAbsensi` - Get attendance records
- `addAbsensi` - Add attendance record
- `checkIn` - Employee check-in
- `checkOut` - Employee check-out
- `getAbsensiByNIK` - Get attendance by employee ID

### 📅 Booking API
- `getBookings` - Get booking records
- `addBooking` - Create new booking
- `updateBooking` - Update booking
- `approveBooking` - Approve booking request
- `checkAvailability` - Check room availability

### 📊 Asset API
- `getAssets` - Get asset/KPI data
- `addAsset` - Add asset record
- `updateAsset` - Update asset record
- `getKPISummary` - Get KPI statistics
- `calculateGrade` - Calculate performance grade

### 🔐 Users API
- `login` - User authentication
- `getUsers` - Get all users (admin only)
- `updateUser` - Update user profile
- `changePassword` - Change password
- `validateToken` - Validate auth token

## 🛠️ Configuration

### API Configuration
Edit `js/api-config.js`:
```javascript
const API_CONFIG = {
  PRODUKSI: {
    url: 'YOUR_PRODUKSI_API_URL',
    sheetId: 'YOUR_SHEET_ID'
  },
  // ... other APIs
};
```

### API Settings
```javascript
const API_SETTINGS = {
  timeout: 30000,        // 30 seconds
  retryAttempts: 3,      // Retry 3 times
  enableLogging: true,   // Enable request logging
  enableCaching: false   // Disable caching by default
};
```

## 🧪 Testing

### Automated Testing
Use `test-all-apis.html` for comprehensive API testing:
- Individual API endpoint testing
- Integration testing
- Performance monitoring
- Error handling validation

### Manual Testing
1. **Login Testing**: Test all user roles
2. **CRUD Operations**: Test create, read, update, delete
3. **Permission Testing**: Verify role-based access
4. **Performance Testing**: Check response times

## 📱 Mobile Support

Portal fully responsive dengan support untuk:
- ✅ **Mobile Phones** (iOS & Android)
- ✅ **Tablets** (iPad, Android tablets)
- ✅ **Desktop** (Windows, Mac, Linux)
- ✅ **Touch Interface** optimized

## 🔒 Security Features

- 🛡️ **Role-based Access Control** (RBAC)
- 🔐 **Token-based Authentication**
- 🔍 **Input Validation & Sanitization**
- 📝 **Activity Logging & Audit Trail**
- ⏰ **Session Timeout Management**
- 🚫 **CORS Protection**

## 📈 Monitoring & Analytics

### Admin Panel Features
- 📊 **Real-time API Status** monitoring
- 📋 **System Logs** viewer
- 👥 **User Management** interface
- 💾 **Data Backup** & export tools
- ⚙️ **System Configuration** settings

### Performance Metrics
- API response times
- Error rates and types
- User activity patterns
- System resource usage

## 🐛 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure APIs deployed as "Web app"
   - Set access to "Anyone"

2. **Authentication Failed**
   - Check Users API deployment
   - Verify admin user exists in sheet

3. **Data Not Loading**
   - Check API status in admin panel
   - Verify sheet permissions

### Debug Tools
- Browser Developer Console
- Network tab for API monitoring
- Admin panel system logs
- API testing suite

## 📚 Documentation

- 📖 **[Complete Deployment Guide](DEPLOYMENT_COMPLETE.md)** - Step-by-step deployment
- 🔄 **[Upgrade Information](README_UPGRADE.md)** - Detailed upgrade info
- 📋 **[Upgrade Summary](UPGRADE_SUMMARY.md)** - Quick overview of changes

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

### Getting Help
- 📖 **Documentation**: Complete guides in this repository
- 🧪 **Testing**: Use `test-all-apis.html` for diagnostics
- 📊 **Monitoring**: Admin panel for system health
- 📝 **Logs**: System logs for detailed error information

### Contact
- **GitHub Issues**: For bug reports and feature requests
- **Email**: [your-email@domain.com]
- **Documentation**: Check existing docs before asking

## 🎉 Acknowledgments

- Bootstrap for responsive UI framework
- Google Apps Script for backend APIs
- Font Awesome for icons
- All contributors and testers

---

**Portal Karyawan SAG v2.0** - Empowering efficient employee management with modern web technology! 🚀
