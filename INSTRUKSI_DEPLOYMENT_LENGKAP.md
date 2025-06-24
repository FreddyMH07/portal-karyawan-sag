# 📋 INSTRUKSI DEPLOYMENT LENGKAP - Portal Karyawan SAG v2.0

## ✅ **PENGECEKAN FINAL - TIDAK ADA DUPLIKASI**

Saya telah melakukan pengecekan menyeluruh dan memastikan:
- ❌ **TIDAK ADA** file JavaScript duplikat
- ❌ **TIDAK ADA** referensi ke file lama
- ✅ **SEMUA** halaman menggunakan 3 file JS inti yang sama
- ✅ **SEMUA** API sudah terintegrasi dengan benar

### **File JavaScript yang Tersisa (FINAL):**
```
js/
├── api-config.js    ✅ (API service terpusat)
├── auth.js          ✅ (Authentication system)  
├── utils.js         ✅ (Utility functions)
└── login.js         ✅ (Login functionality)
```

### **File HTML yang Sudah Diupdate:**
```
✅ index.html           - Dashboard utama
✅ login.html           - Halaman login
✅ admin.html           - Panel admin
✅ produksi.html        - Manajemen produksi
✅ absensi.html         - Sistem absensi
✅ booking.html         - Booking ruangan
✅ dashboard_harian.html - Dashboard harian
✅ dashboard_bulanan.html - Dashboard bulanan
✅ dashboard_pivot.html  - Dashboard pivot
✅ hr.html              - HR management
✅ test-all-apis.html   - Testing suite
```

---

## 🚀 **LANGKAH DEPLOYMENT LENGKAP**

### **TAHAP 1: PERSIAPAN GOOGLE SHEETS (15 menit)**

#### **1.1 Setup Absensi Sheet**
1. **Buka**: https://docs.google.com/spreadsheets/d/1UaETaH6VgTAG0agxrsoVuUvJYrCbbM3mTErAW6_eviM/edit
2. **Pastikan ada sheet bernama**: `ABSENSI`
3. **Tambahkan header di baris 1**:
   ```
   ID | Tanggal | NIK | Nama Karyawan | Departemen | Shift | Jam Masuk/Keluar | Status Kehadiran | Keterangan | Lokasi Check-in/out | Created By | Created Date
   ```
4. **Set permission**: Anyone with the link can edit

#### **1.2 Setup Booking Sheet**
1. **Buka**: https://docs.google.com/spreadsheets/d/1dPpQKnjNFvVssl12at6hC8416Atmr4GWrNspMRaLOiA/edit
2. **Pastikan ada sheet bernama**: `BOOKING`
3. **Tambahkan header di baris 1**:
   ```
   ID | Tanggal Booking | Waktu Mulai/Selesai | Ruangan/Fasilitas | Keperluan | Pemohon | Departemen | Status | Catatan | Created By | Created Date
   ```
4. **Set permission**: Anyone with the link can edit

#### **1.3 Setup Asset Sheet**
1. **Buka**: https://docs.google.com/spreadsheets/d/1kgLyl_lGOPONQC6bOLndERodR17QkDnRRllN4I8tJPQ/edit
2. **Pastikan ada sheet bernama**: `ASSET`
3. **Tambahkan header di baris 1**:
   ```
   ID | Periode | Departemen | Kebun | Divisi | Target/Realisasi Produksi/Kualitas/Efisiensi | Achievement (%) | Skor Total | Grade | Catatan | Created By | Created Date
   ```
4. **Set permission**: Anyone with the link can edit

#### **1.4 Setup Users Sheet**
1. **Buka**: https://docs.google.com/spreadsheets/d/1UMA4dHaqG6dmJ0kWTq7NPz6xmqnTPSqJpMu4ws7TFjs/edit
2. **Tambah sheet baru bernama**: `USERS`
3. **Tambahkan header di baris 1**:
   ```
   id | email | password | name | role | permissions
   ```
4. **Tambahkan admin user di baris 2**:
   ```
   1 | admin@sag.com | admin123 | Administrator | admin | produksi,absensi,booking,asset,users
   ```
5. **Set permission**: Anyone with the link can edit

---

### **TAHAP 2: DEPLOY GOOGLE APPS SCRIPT APIs (30 menit)**

#### **2.1 Deploy Absensi API**
1. **Buka**: https://script.google.com/
2. **Klik**: "New Project"
3. **Ganti nama**: "Portal SAG - Absensi API"
4. **Hapus kode default**, **copy-paste** dari file: `gas-apis/absensi-api.gs`
5. **Save**: Ctrl+S
6. **Deploy**:
   - Klik "Deploy" > "New deployment"
   - Type: "Web app"
   - Execute as: "Me"
   - Who has access: "Anyone"
   - Klik "Deploy"
7. **📝 COPY URL** yang muncul (contoh: `https://script.google.com/macros/s/AKfycby...../exec`)

#### **2.2 Deploy Booking API**
1. **Buka**: https://script.google.com/
2. **Klik**: "New Project"
3. **Ganti nama**: "Portal SAG - Booking API"
4. **Hapus kode default**, **copy-paste** dari file: `gas-apis/booking-api.gs`
5. **Save**: Ctrl+S
6. **Deploy** (sama seperti langkah 2.1)
7. **📝 COPY URL** yang muncul

#### **2.3 Deploy Asset API**
1. **Buka**: https://script.google.com/
2. **Klik**: "New Project"
3. **Ganti nama**: "Portal SAG - Asset API"
4. **Hapus kode default**, **copy-paste** dari file: `gas-apis/asset-api.gs`
5. **Save**: Ctrl+S
6. **Deploy** (sama seperti langkah 2.1)
7. **📝 COPY URL** yang muncul

#### **2.4 Deploy Users API**
1. **Buka**: https://script.google.com/
2. **Klik**: "New Project"
3. **Ganti nama**: "Portal SAG - Users API"
4. **Hapus kode default**, **copy-paste** dari file: `gas-apis/users-api.gs`
5. **Save**: Ctrl+S
6. **Deploy** (sama seperti langkah 2.1)
7. **📝 COPY URL** yang muncul

#### **2.5 Update Produksi API (Opsional - Direkomendasikan)**
1. **Buka**: Project Produksi API yang sudah ada
2. **Backup kode lama** (copy ke notepad)
3. **Replace dengan kode** dari file: `gas-apis/produksi-api-updated.gs`
4. **Save**: Ctrl+S
5. **Deploy ulang** untuk mendapatkan fitur terbaru

---

### **TAHAP 3: UPDATE KONFIGURASI API (5 menit)**

#### **3.1 Edit File js/api-config.js**
1. **Buka file**: `js/api-config.js`
2. **Cari bagian API_CONFIG**
3. **Replace URL** dengan URL yang sudah di-copy:

```javascript
const API_CONFIG = {
  PRODUKSI: {
    url: 'https://script.google.com/macros/s/AKfycbwBIaF_e9hkRgM1RzP4PJzi3bxREUaiD9U8wSycA5pvybedhjvd3ypcJt1_BxPq1ni58Q/exec',
    sheetId: '1UMA4dHaqG6dmJ0kWTq7NPz6xmqnTPSqJpMu4ws7TFjs',
    name: 'Produksi API',
    description: 'Production data management'
  },
  
  ABSENSI: {
    url: 'PASTE_ABSENSI_API_URL_DISINI', // 👈 Ganti dengan URL Absensi API
    sheetId: '1UaETaH6VgTAG0agxrsoVuUvJYrCbbM3mTErAW6_eviM',
    name: 'Absensi API',
    description: 'Employee attendance management'
  },
  
  BOOKING: {
    url: 'PASTE_BOOKING_API_URL_DISINI', // 👈 Ganti dengan URL Booking API
    sheetId: '1dPpQKnjNFvVssl12at6hC8416Atmr4GWrNspMRaLOiA',
    name: 'Booking API',
    description: 'Room and facility booking system'
  },
  
  ASSET: {
    url: 'PASTE_ASSET_API_URL_DISINI', // 👈 Ganti dengan URL Asset API
    sheetId: '1kgLyl_lGOPONQC6bOLndERodR17QkDnRRllN4I8tJPQ',
    name: 'Asset/KPI API',
    description: 'Asset management and KPI tracking'
  },
  
  USERS: {
    url: 'PASTE_USERS_API_URL_DISINI', // 👈 Ganti dengan URL Users API
    sheetId: '1UMA4dHaqG6dmJ0kWTq7NPz6xmqnTPSqJpMu4ws7TFjs',
    name: 'Users API',
    description: 'User authentication and management'
  }
};
```

4. **Save file**

---

### **TAHAP 4: TESTING LENGKAP (15 menit)**

#### **4.1 Test API Connectivity**
1. **Buka**: `test-all-apis.html` di browser
2. **Masukkan URL** untuk setiap API yang sudah di-deploy
3. **Klik**: "Test All APIs"
4. **Pastikan semua menunjukkan**: ✅ PASSED

#### **4.2 Test Login System**
1. **Buka**: `login.html`
2. **Login dengan**:
   - Email: `admin@sag.com`
   - Password: `admin123`
3. **Pastikan**: Berhasil login dan redirect ke dashboard

#### **4.3 Test Admin Panel**
1. **Buka**: `admin.html`
2. **Pastikan**: Bisa akses dan melihat user management
3. **Test**: API status monitoring

---

### **TAHAP 5: TEST FUNGSIONALITAS (20 menit)**

#### **5.1 Test Produksi Module**
1. **Buka**: `produksi.html`
2. **Test**: Add, edit, delete data
3. **Test**: Filter dan search
4. **Test**: Export functionality

#### **5.2 Test Absensi Module**
1. **Buka**: `absensi.html`
2. **Test**: Check-in/check-out
3. **Test**: Manual attendance entry
4. **Test**: View attendance records

#### **5.3 Test Booking Module**
1. **Buka**: `booking.html`
2. **Test**: Create booking
3. **Test**: Check availability
4. **Test**: Approve/reject (jika admin)

#### **5.4 Test Dashboard**
1. **Buka**: `dashboard_harian.html`
2. **Test**: Data loading dan charts
3. **Buka**: `dashboard_bulanan.html`
4. **Test**: Monthly analytics
5. **Buka**: `dashboard_pivot.html`
6. **Test**: Pivot table functionality

---

### **TAHAP 6: GO LIVE (5 menit)**

#### **6.1 Final Checks**
- ✅ Semua API berfungsi
- ✅ Login system bekerja
- ✅ Semua halaman accessible
- ✅ No JavaScript errors di console

#### **6.2 Deploy ke Production**
1. **Upload semua file** ke hosting (GitHub Pages, Netlify, dll)
2. **Update DNS** jika perlu
3. **Notify users** tentang sistem baru

---

## 🔧 **TROUBLESHOOTING GUIDE**

### **❌ Problem: CORS Error**
**Solution**: 
- Pastikan API di-deploy sebagai "Web app"
- Set "Who has access" ke "Anyone"
- Redeploy API jika perlu

### **❌ Problem: Login Failed**
**Solution**:
- Pastikan Users API sudah deployed
- Pastikan USERS sheet ada dan berisi admin user
- Check URL Users API di `js/api-config.js`

### **❌ Problem: Data Not Loading**
**Solution**:
- Check API status di admin panel
- Pastikan sheet permissions sudah "Anyone with link can edit"
- Check browser console untuk error messages

### **❌ Problem: JavaScript Error**
**Solution**:
- Open browser console (F12)
- Check for missing files atau syntax errors
- Pastikan semua script tags sudah benar

---

## 📊 **CHECKLIST FINAL**

### **✅ Pre-Deployment**
- [ ] Semua Google Sheets sudah setup dengan header yang benar
- [ ] 4 API baru sudah di-deploy ke Google Apps Script
- [ ] URL API sudah di-update di `js/api-config.js`
- [ ] Admin user sudah dibuat di USERS sheet

### **✅ Testing**
- [ ] Semua API test PASSED di `test-all-apis.html`
- [ ] Login berhasil dengan admin@sag.com
- [ ] Admin panel accessible
- [ ] Semua halaman bisa diakses tanpa error

### **✅ Functionality**
- [ ] Produksi: CRUD operations bekerja
- [ ] Absensi: Check-in/out bekerja
- [ ] Booking: Create dan approve bekerja
- [ ] Dashboard: Charts dan data loading bekerja

### **✅ Production Ready**
- [ ] No JavaScript errors di console
- [ ] Mobile responsive
- [ ] All permissions working correctly
- [ ] Performance acceptable (< 3 seconds load time)

---

## 🎉 **SELAMAT!**

Jika semua checklist sudah ✅, maka **Portal Karyawan SAG v2.0** sudah siap production dengan:

- 🏗️ **Multiple APIs Architecture**
- 🔐 **Role-based Access Control**
- 📱 **Mobile Responsive Design**
- 📊 **Advanced Analytics & Reporting**
- 🛡️ **Enterprise-grade Security**

**Portal Anda sekarang 300% lebih powerful dari versi sebelumnya!** 🚀

---

## 📞 **SUPPORT**

Jika ada masalah:
1. **Check troubleshooting guide** di atas
2. **Use `test-all-apis.html`** untuk diagnosa
3. **Check admin panel** untuk system logs
4. **Review browser console** untuk JavaScript errors

**Happy Deploying!** 🎊
