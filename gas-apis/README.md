# Portal Karyawan SAG - Multiple APIs Structure

## API Endpoints

### 1. API Produksi
- **URL**: https://script.google.com/macros/s/AKfycbwBIaF_e9hkRgM1RzP4PJzi3bxREUaiD9U8wSycA5pvybedhjvd3ypcJt1_BxPq1ni58Q/exec
- **Sheet**: https://docs.google.com/spreadsheets/d/1UMA4dHaqG6dmJ0kWTq7NPz6xmqnTPSqJpMu4ws7TFjs/edit
- **Sheets**: DATA HARIAN, MASTER DATA

### 2. API Absensi
- **Sheet**: https://docs.google.com/spreadsheets/d/1UaETaH6VgTAG0agxrsoVuUvJYrCbbM3mTErAW6_eviM/edit
- **Sheets**: ABSENSI

### 3. API Booking
- **Sheet**: https://docs.google.com/spreadsheets/d/1dPpQKnjNFvVssl12at6hC8416Atmr4GWrNspMRaLOiA/edit
- **Sheets**: BOOKING

### 4. API Asset/KPI
- **Sheet**: https://docs.google.com/spreadsheets/d/1kgLyl_lGOPONQC6bOLndERodR17QkDnRRllN4I8tJPQ/edit
- **Sheets**: ASSET

### 5. API Users
- **Sheet**: https://docs.google.com/spreadsheets/d/1UMA4dHaqG6dmJ0kWTq7NPz6xmqnTPSqJpMu4ws7TFjs/edit
- **Sheets**: USERS

## Deployment Instructions

1. Create separate Google Apps Script projects for each API
2. Deploy each as web app with execute permissions for "Anyone"
3. Update the frontend to use the new API endpoints
