# Portal Karyawan SAG - Deployment Guide

## Overview
Portal Karyawan SAG telah diupgrade dari sistem single API menjadi multiple APIs untuk meningkatkan modularitas, performa, dan maintainability.

## API Architecture

### 1. API Produksi (Existing)
- **URL**: https://script.google.com/macros/s/AKfycbwBIaF_e9hkRgM1RzP4PJzi3bxREUaiD9U8wSycA5pvybedhjvd3ypcJt1_BxPq1ni58Q/exec
- **Sheet**: https://docs.google.com/spreadsheets/d/1UMA4dHaqG6dmJ0kWTq7NPz6xmqnTPSqJpMu4ws7TFjs/edit
- **Sheets**: DATA HARIAN, MASTER DATA
- **Status**: ✅ Already deployed

### 2. API Absensi (New)
- **Sheet**: https://docs.google.com/spreadsheets/d/1UaETaH6VgTAG0agxrsoVuUvJYrCbbM3mTErAW6_eviM/edit
- **Sheets**: ABSENSI
- **Code**: `gas-apis/absensi-api.gs`
- **Status**: 🔄 Need to deploy

### 3. API Booking (New)
- **Sheet**: https://docs.google.com/spreadsheets/d/1dPpQKnjNFvVssl12at6hC8416Atmr4GWrNspMRaLOiA/edit
- **Sheets**: BOOKING
- **Code**: `gas-apis/booking-api.gs`
- **Status**: 🔄 Need to deploy

### 4. API Asset/KPI (New)
- **Sheet**: https://docs.google.com/spreadsheets/d/1kgLyl_lGOPONQC6bOLndERodR17QkDnRRllN4I8tJPQ/edit
- **Sheets**: ASSET
- **Code**: `gas-apis/asset-api.gs`
- **Status**: 🔄 Need to deploy

### 5. API Users (New)
- **Sheet**: https://docs.google.com/spreadsheets/d/1UMA4dHaqG6dmJ0kWTq7NPz6xmqnTPSqJpMu4ws7TFjs/edit (same as Produksi)
- **Sheets**: USERS
- **Code**: `gas-apis/users-api.gs`
- **Status**: 🔄 Need to deploy

## Deployment Steps

### Step 1: Prepare Google Sheets

#### 1.1 Absensi Sheet
1. Open: https://docs.google.com/spreadsheets/d/1UaETaH6VgTAG0agxrsoVuUvJYrCbbM3mTErAW6_eviM/edit
2. Ensure sheet has tab named "ABSENSI"
3. Add headers: ID, Tanggal, NIK, Nama Karyawan, Departemen, Shift, Jam Masuk/Keluar, Status Kehadiran, Keterangan, Lokasi Check-in/out, Created By, Created Date

#### 1.2 Booking Sheet
1. Open: https://docs.google.com/spreadsheets/d/1dPpQKnjNFvVssl12at6hC8416Atmr4GWrNspMRaLOiA/edit
2. Ensure sheet has tab named "BOOKING"
3. Add headers: ID, Tanggal Booking, Waktu Mulai/Selesai, Ruangan/Fasilitas, Keperluan, Pemohon, Departemen, Status, Catatan, Created By, Created Date

#### 1.3 Asset Sheet
1. Open: https://docs.google.com/spreadsheets/d/1kgLyl_lGOPONQC6bOLndERodR17QkDnRRllN4I8tJPQ/edit
2. Ensure sheet has tab named "ASSET"
3. Add headers: ID, Periode, Departemen, Kebun, Divisi, Target/Realisasi Produksi/Kualitas/Efisiensi, Achievement (%), Skor Total, Grade, Catatan, Created By, Created Date

#### 1.4 Users Sheet
1. Open: https://docs.google.com/spreadsheets/d/1UMA4dHaqG6dmJ0kWTq7NPz6xmqnTPSqJpMu4ws7TFjs/edit
2. Add new tab named "USERS"
3. Add headers: id, email, password, name, role, permissions

### Step 2: Deploy Google Apps Script APIs

#### 2.1 Deploy Absensi API
1. Go to https://script.google.com/
2. Create new project: "Portal SAG - Absensi API"
3. Copy code from `gas-apis/absensi-api.gs`
4. Save and deploy as web app:
   - Execute as: Me
   - Who has access: Anyone
5. Copy the deployment URL
6. Update `js/api-config.js` with the new URL

#### 2.2 Deploy Booking API
1. Go to https://script.google.com/
2. Create new project: "Portal SAG - Booking API"
3. Copy code from `gas-apis/booking-api.gs`
4. Save and deploy as web app:
   - Execute as: Me
   - Who has access: Anyone
5. Copy the deployment URL
6. Update `js/api-config.js` with the new URL

#### 2.3 Deploy Asset API
1. Go to https://script.google.com/
2. Create new project: "Portal SAG - Asset API"
3. Copy code from `gas-apis/asset-api.gs`
4. Save and deploy as web app:
   - Execute as: Me
   - Who has access: Anyone
5. Copy the deployment URL
6. Update `js/api-config.js` with the new URL

#### 2.4 Deploy Users API
1. Go to https://script.google.com/
2. Create new project: "Portal SAG - Users API"
3. Copy code from `gas-apis/users-api.gs`
4. Save and deploy as web app:
   - Execute as: Me
   - Who has access: Anyone
5. Copy the deployment URL
6. Update `js/api-config.js` with the new URL

### Step 3: Update Frontend Configuration

1. Open `js/api-config.js`
2. Replace placeholder URLs with actual deployed URLs:

```javascript
const API_CONFIG = {
  PRODUKSI: {
    url: 'https://script.google.com/macros/s/AKfycbwBIaF_e9hkRgM1RzP4PJzi3bxREUaiD9U8wSycA5pvybedhjvd3ypcJt1_BxPq1ni58Q/exec',
    sheetId: '1UMA4dHaqG6dmJ0kWTq7NPz6xmqnTPSqJpMu4ws7TFjs'
  },
  ABSENSI: {
    url: 'YOUR_DEPLOYED_ABSENSI_API_URL',
    sheetId: '1UaETaH6VgTAG0agxrsoVuUvJYrCbbM3mTErAW6_eviM'
  },
  BOOKING: {
    url: 'YOUR_DEPLOYED_BOOKING_API_URL',
    sheetId: '1dPpQKnjNFvVssl12at6hC8416Atmr4GWrNspMRaLOiA'
  },
  ASSET: {
    url: 'YOUR_DEPLOYED_ASSET_API_URL',
    sheetId: '1kgLyl_lGOPONQC6bOLndERodR17QkDnRRllN4I8tJPQ'
  },
  USERS: {
    url: 'YOUR_DEPLOYED_USERS_API_URL',
    sheetId: '1UMA4dHaqG6dmJ0kWTq7NPz6xmqnTPSqJpMu4ws7TFjs'
  }
};
```

### Step 4: Test APIs

#### 4.1 Test Each API Individually
Use the test script or Postman to test each API:

```javascript
// Test Absensi API
fetch('YOUR_ABSENSI_API_URL', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ action: 'getAbsensi' })
})

// Test Booking API
fetch('YOUR_BOOKING_API_URL', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ action: 'getBookings' })
})

// Test Asset API
fetch('YOUR_ASSET_API_URL', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ action: 'getAssets' })
})

// Test Users API
fetch('YOUR_USERS_API_URL', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ action: 'getUsers' })
})
```

#### 4.2 Test Frontend Integration
1. Open the application in browser
2. Test login functionality
3. Test each module (Produksi, Absensi, Booking, Asset)
4. Verify data is loading correctly

### Step 5: Setup Initial Data

#### 5.1 Create Admin User
1. Open Users sheet
2. Add first admin user manually:
   - id: 1
   - email: admin@sag.com
   - password: admin123 (change this!)
   - name: Administrator
   - role: admin
   - permissions: produksi,absensi,booking,asset,users

#### 5.2 Test Login
1. Go to login page
2. Login with admin credentials
3. Access admin panel at `admin.html`

## API Endpoints Reference

### Absensi API
- `getAbsensi` - Get all absensi data
- `addAbsensi` - Add new absensi record
- `updateAbsensi` - Update absensi record
- `deleteAbsensi` - Delete absensi record
- `checkIn` - Employee check in
- `checkOut` - Employee check out
- `getAbsensiByNIK` - Get absensi by employee NIK
- `getAbsensiByDate` - Get absensi by date range

### Booking API
- `getBookings` - Get all booking data
- `addBooking` - Add new booking
- `updateBooking` - Update booking
- `deleteBooking` - Delete booking
- `approveBooking` - Approve booking
- `rejectBooking` - Reject booking
- `checkAvailability` - Check room availability

### Asset API
- `getAssets` - Get all asset/KPI data
- `addAsset` - Add new asset record
- `updateAsset` - Update asset record
- `deleteAsset` - Delete asset record
- `getKPISummary` - Get KPI summary statistics
- `calculateGrade` - Calculate grade from achievement

### Users API
- `login` - User authentication
- `register` - Register new user
- `getUsers` - Get all users (admin only)
- `updateUser` - Update user
- `deleteUser` - Delete user
- `changePassword` - Change user password
- `validateToken` - Validate authentication token

## Security Considerations

1. **Password Hashing**: In production, implement proper password hashing
2. **JWT Tokens**: Replace simple token system with JWT
3. **Rate Limiting**: Implement rate limiting on APIs
4. **Input Validation**: Add comprehensive input validation
5. **HTTPS Only**: Ensure all communications use HTTPS
6. **Access Control**: Implement proper role-based access control

## Monitoring and Maintenance

1. **API Status Monitoring**: Use admin panel to monitor API status
2. **Error Logging**: Implement comprehensive error logging
3. **Data Backup**: Regular backup of Google Sheets data
4. **Performance Monitoring**: Monitor API response times
5. **Security Audits**: Regular security audits

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure APIs are deployed with proper CORS headers
2. **Authentication Failures**: Check user credentials and token validation
3. **Sheet Access Errors**: Verify sheet permissions and IDs
4. **API Timeouts**: Check Google Apps Script execution limits

### Debug Steps

1. Check browser console for errors
2. Verify API URLs in configuration
3. Test APIs individually using Postman
4. Check Google Apps Script logs
5. Verify sheet structure and permissions

## Support

For technical support or questions:
1. Check the troubleshooting section
2. Review API logs in Google Apps Script
3. Test individual API endpoints
4. Contact system administrator
