# Deployment Guide - Portal Karyawan SAG v3.0

## Quick Deployment Steps

### 1. Google Sheets Setup
1. Buka Google Sheets dan buat spreadsheet baru
2. Copy Sheet ID dari URL (contoh: `1UMA4dHaqG6dmJ0kWTq7NPz6xmqnTPSqJpMu4ws7TFjs`)
3. Rename spreadsheet menjadi "Portal Karyawan SAG Database"

### 2. Google Apps Script Deployment
1. Buka [Google Apps Script](https://script.google.com)
2. Klik "New Project"
3. Hapus code default dan paste seluruh isi dari `gas/code.gs`
4. Ganti `SHEET_ID` di CONFIG dengan Sheet ID Anda
5. Save project dengan nama "Portal Karyawan SAG API"
6. Klik "Deploy" > "New deployment"
7. Pilih type: "Web app"
8. Execute as: "Me"
9. Who has access: "Anyone"
10. Deploy dan copy Web app URL

### 3. Initialize Database
1. Di Apps Script editor, pilih function `initializeAllSheets`
2. Klik "Run" untuk membuat semua sheet dengan header yang benar
3. Verify bahwa sheets berikut telah dibuat:
   - DATA HARIAN
   - BOOKING
   - ABSENSI
   - KPI
   - ASSET
   - MASTER DATA
   - USERS

### 4. Setup Users
1. Buka sheet "USERS" di Google Sheets
2. Tambahkan user dengan format:
   ```
   id | email | password | name | role
   1  | admin@sag.com | admin123 | Admin User | admin
   2  | manager@sag.com | manager123 | Manager User | manager
   3  | staff@sag.com | staff123 | Staff User | staff
   ```

### 5. Frontend Configuration
1. Edit file `js/config.js`
2. Update `API_URL` dengan Web app URL dari step 2
3. Test koneksi dengan membuka `login.html`

### 6. Test Deployment
1. Buka `login.html` di browser
2. Login dengan salah satu user yang dibuat
3. Test semua fitur sesuai role
4. Verify data tersimpan di Google Sheets

## Role Setup Guide

### Admin Role
```javascript
// Full access - dapat mengakses semua sheet
role: 'admin'
permissions: ['DATA_HARIAN', 'BOOKING', 'ABSENSI', 'KPI', 'ASSET', 'MASTER_DATA', 'USERS']
```

### Manager Role
```javascript
// Managerial access
role: 'manager'  
permissions: ['DATA_HARIAN', 'BOOKING', 'ABSENSI', 'KPI', 'ASSET']
```

### Other Roles
- **supervisor**: DATA_HARIAN, ABSENSI, KPI
- **staff**: DATA_HARIAN, BOOKING
- **hr**: ABSENSI, USERS
- **finance**: KPI, ASSET
- **operator**: DATA_HARIAN

## Troubleshooting

### Common Issues

1. **"Permission denied" error**
   - Check Google Apps Script permissions
   - Make sure deployment is set to "Anyone"

2. **"Sheet not found" error**
   - Run `initializeAllSheets()` function
   - Check SHEET_ID in CONFIG

3. **Login not working**
   - Check USERS sheet format
   - Verify user data is correct

4. **Data not saving**
   - Check API URL in config.js
   - Verify Google Sheets permissions

### Debug Steps

1. **Check Apps Script Logs**
   - Go to Apps Script editor
   - View > Logs
   - Look for error messages

2. **Test API Directly**
   - Use Postman or browser to test API endpoints
   - Check response format

3. **Browser Console**
   - Open browser developer tools
   - Check console for JavaScript errors

## Production Deployment

### Security Checklist
- [ ] Change default passwords
- [ ] Set up proper user roles
- [ ] Enable HTTPS for frontend hosting
- [ ] Review Google Sheets sharing permissions
- [ ] Test all role-based access controls

### Performance Optimization
- [ ] Enable caching in browser
- [ ] Optimize image sizes
- [ ] Minify CSS/JS files
- [ ] Use CDN for external libraries

### Monitoring
- [ ] Set up Google Apps Script execution monitoring
- [ ] Monitor Google Sheets API usage
- [ ] Set up user activity logging
- [ ] Regular backup of Google Sheets data

## Maintenance

### Regular Tasks
1. **Weekly**: Check system logs and performance
2. **Monthly**: Review user access and permissions
3. **Quarterly**: Backup data and test restore procedures
4. **Annually**: Security audit and password updates

### Updates
1. Update `gas/code.gs` in Apps Script
2. Redeploy web app if needed
3. Update frontend files
4. Test all functionality
5. Notify users of changes

## Support

For technical support:
- Check documentation in `SHEET_STRUCTURE.md`
- Review API comments in `gas/code.gs`
- Contact system administrator

---

**Deployment completed successfully!** 🎉

Your Portal Karyawan SAG v3.0 is now ready to use with full role-based access control and multi-module management.
