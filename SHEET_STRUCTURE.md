# Portal Karyawan SAG - Sheet Structure & Role-Based Access

## Overview
Portal Karyawan SAG telah diperbarui dengan struktur sheet yang lengkap dan sistem role-based access control untuk memisahkan akses berdasarkan peran pengguna.

## Sheet Structure

### 1. DATA HARIAN
**Kolom yang telah diperbarui:**
- Tanggal
- Bulan  
- Tahun
- Kebun
- Divisi
- AKP Panen
- Jumlah TK Panen
- Luas Panen (HA)
- JJG Panen (Jjg)
- JJG Kirim (Jjg)
- Ketrek
- Total JJG Kirim (Jjg)
- Tonase Panen (Kg)
- Refraksi (Kg)
- Refraksi (%)
- Restant (Jjg)
- BJR Hari ini
- Output (Kg/HK)
- Output (Ha/HK)
- Budget Harian
- Timbang Kebun Harian
- Timbang PKS Harian
- Rotasi Panen
- Input By

### 2. BOOKING
**Kolom:**
- ID
- Tanggal Booking
- Waktu Mulai
- Waktu Selesai
- Ruangan/Fasilitas
- Keperluan
- Pemohon
- Departemen
- Status
- Catatan
- Created By
- Created Date

### 3. ABSENSI
**Kolom:**
- ID
- Tanggal
- NIK
- Nama Karyawan
- Departemen
- Shift
- Jam Masuk
- Jam Keluar
- Status Kehadiran
- Keterangan
- Lokasi Check-in
- Lokasi Check-out
- Created By
- Created Date

### 4. KPI
**Kolom:**
- ID
- Periode
- Departemen
- Kebun
- Divisi
- Target Produksi
- Realisasi Produksi
- Achievement (%)
- Target Kualitas
- Realisasi Kualitas
- Target Efisiensi
- Realisasi Efisiensi
- Skor Total
- Grade
- Catatan
- Created By
- Created Date

### 5. ASSET
**Kolom:**
- ID
- Kode Asset
- Nama Asset
- Kategori
- Lokasi
- Kondisi
- Tanggal Pembelian
- Harga Pembelian
- Nilai Buku
- Status
- PIC
- Maintenance Terakhir
- Maintenance Berikutnya
- Catatan
- Created By
- Created Date

## Role-Based Access Control

### Admin
**Akses penuh ke semua sheet:**
- DATA_HARIAN
- BOOKING
- ABSENSI
- KPI
- ASSET
- MASTER_DATA
- USERS

### Manager
**Akses ke:**
- DATA_HARIAN
- BOOKING
- ABSENSI
- KPI
- ASSET

### Supervisor
**Akses ke:**
- DATA_HARIAN
- ABSENSI
- KPI

### Staff
**Akses ke:**
- DATA_HARIAN
- BOOKING

### HR
**Akses ke:**
- ABSENSI
- USERS

### Finance
**Akses ke:**
- KPI
- ASSET

### Operator
**Akses ke:**
- DATA_HARIAN

## API Endpoints

### Authentication
- `login` - Login dengan role-based permissions

### Data Harian
- `getDailyDashboardData` - Get dashboard data harian
- `submitDailyData` - Submit data produksi harian
- `updateDailyData` - Update data produksi harian
- `deleteDailyData` - Delete data produksi harian (admin only)

### Booking
- `getBookingData` - Get data booking
- `submitBooking` - Submit booking baru
- `updateBooking` - Update booking
- `cancelBooking` - Cancel booking

### Absensi
- `getAbsensiData` - Get data absensi
- `submitAbsensi` - Submit data absensi
- `updateAbsensi` - Update data absensi

### KPI
- `getKPIData` - Get data KPI
- `submitKPI` - Submit data KPI (auto-calculate achievement & grade)
- `updateKPI` - Update data KPI

### Asset
- `getAssetData` - Get data asset
- `submitAsset` - Submit data asset baru
- `updateAsset` - Update data asset

## Features

### Auto-calculation
- **KPI**: Achievement percentage, total score, dan grade otomatis dihitung
- **DATA HARIAN**: Input By otomatis terisi dengan nama user yang login

### Security
- Role-based access control untuk setiap sheet
- Permission checking pada setiap operasi
- User tracking pada setiap input/update

### Data Validation
- Automatic ID generation untuk setiap record
- Timestamp tracking untuk audit trail
- Input validation dan error handling

## Setup Instructions

1. **Google Sheets Setup:**
   - Pastikan Google Sheets sudah dibuat dengan ID yang benar
   - Jalankan fungsi `initializeAllSheets()` untuk membuat struktur sheet otomatis

2. **User Management:**
   - Setup user di sheet USERS dengan kolom: id, email, password, name, role
   - Role harus sesuai dengan yang didefinisikan di ROLE_PERMISSIONS

3. **Deployment:**
   - Deploy Google Apps Script sebagai web app
   - Update API URL di frontend
   - Test semua endpoint dengan user berbeda role

## Usage Examples

### Submit Daily Data
```javascript
const response = await callAPI('submitDailyData', {
  dailyData: {
    Tanggal: '2024-06-20',
    Bulan: 6,
    Tahun: 2024,
    Kebun: 'Kebun A',
    Divisi: 'Divisi 1',
    // ... other fields
  },
  userInfo: currentUser
});
```

### Submit Booking
```javascript
const response = await callAPI('submitBooking', {
  bookingData: {
    tanggalBooking: '2024-06-21',
    waktuMulai: '09:00',
    waktuSelesai: '11:00',
    ruangan: 'Meeting Room A',
    keperluan: 'Rapat Koordinasi',
    // ... other fields
  },
  userInfo: currentUser
});
```

## Notes
- Semua sheet akan otomatis dibuat dengan header yang sesuai jika belum ada
- Setiap operasi akan dicatat dengan timestamp dan user yang melakukan
- Permission akan dicek pada setiap API call
- Data akan difilter berdasarkan parameter yang diberikan
