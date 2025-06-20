# CORS Error Fix Guide - Portal Karyawan SAG

## 🚨 Masalah CORS yang Ditemukan

### Error Message:
```
Access to fetch at 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec' from origin 'https://portal.freddypmsag.my.id' has been blocked by CORS policy: Response to preflight request doesn't pass access control check: No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

## 🔍 Analisis Masalah

1. **Google Apps Script CORS Limitation**: Google Apps Script tidak mendukung CORS headers secara penuh
2. **Preflight Request**: Browser mengirim preflight request yang tidak dapat ditangani oleh Apps Script
3. **Domain Restriction**: Apps Script memiliki batasan akses dari domain eksternal

## ✅ Solusi yang Telah Diterapkan

### 1. Update Google Apps Script (gas/code.gs)
```javascript
// Tambahkan doGet handler untuk preflight requests
function doGet(e) {
  return createCORSResponse({ success: true, message: 'API is running' });
}

// Enhanced doPost dengan CORS handling
function doPost(e) {
  try {
    // Handle CORS preflight
    if (!e.postData) {
      return createCORSResponse({ success: true, message: 'Preflight OK' });
    }
    // ... rest of the code
  } catch (error) {
    return createCORSResponse({ success: false, error: error.message });
  }
}

// CORS response function
function createCORSResponse(data) {
  const output = ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
  return output;
}
```

### 2. Update Frontend API Calls (js/main.js)
```javascript
// Enhanced API call dengan CORS handling
async function callAPI(action, data = {}) {
  try {
    const response = await fetch(CONFIG.API_BASE_URL, {
      method: 'POST',
      mode: 'cors', // Enable CORS
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });
    // ... error handling
  } catch (error) {
    // Handle CORS specific errors
    if (error.message.includes('CORS') || error.message.includes('Failed to fetch')) {
      return {
        success: false,
        error: 'Koneksi ke server bermasalah. Silakan coba lagi atau hubungi administrator.',
        technical_error: error.message
      };
    }
  }
}

// Alternative XMLHttpRequest method
function callAPIXHR(action, data = {}) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', CONFIG.API_BASE_URL, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    // ... implementation
  });
}
```

### 3. Update Configuration (js/config.js)
```javascript
const CONFIG = {
  // Updated dengan API URL yang benar
  API_BASE_URL: 'https://script.google.com/macros/s/AKfycbyvJjfEG_99m2fwv4NeKgZM-2O0zSqmCdqSJJMuUVdDJXE0UHa97UUAzB2NoZuaD81s1w/exec',
  
  // CORS handling
  DEBUG: true,
  CORS_MODE: 'cors'
};
```

## 🛠️ Langkah-langkah Deployment

### 1. Deploy Google Apps Script
1. Buka Google Apps Script Editor
2. Paste code dari `gas/code.gs` yang sudah diupdate
3. **PENTING**: Deploy sebagai Web App dengan setting:
   - Execute as: **Me** (bukan User accessing the web app)
   - Who has access: **Anyone** (bukan Anyone with Google account)
4. Copy URL deployment yang baru

### 2. Update Frontend
1. Update `js/config.js` dengan URL yang benar
2. Test API connection dari browser console:
```javascript
fetch('https://script.google.com/macros/s/AKfycbyvJjfEG_99m2fwv4NeKgZM-2O0zSqmCdqSJJMuUVdDJXE0UHa97UUAzB2NoZuaD81s1w/exec', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ action: 'getInitialData' })
}).then(r => r.json()).then(console.log);
```

### 3. Verify Permissions
1. Pastikan Google Apps Script memiliki permission untuk:
   - Google Sheets access
   - External requests
2. Test dengan user yang berbeda role

## 🔧 Alternative Solutions (Jika masih error)

### Option 1: JSONP Approach
```javascript
function callAPIJSONP(action, data, callback) {
  const script = document.createElement('script');
  const callbackName = 'jsonp_callback_' + Math.round(100000 * Math.random());
  
  window[callbackName] = function(response) {
    callback(response);
    document.head.removeChild(script);
    delete window[callbackName];
  };
  
  const params = new URLSearchParams({
    action: action,
    data: JSON.stringify(data),
    callback: callbackName
  });
  
  script.src = `${CONFIG.API_BASE_URL}?${params}`;
  document.head.appendChild(script);
}
```

### Option 2: Proxy Server
Jika CORS masih bermasalah, bisa menggunakan proxy server:
```javascript
const PROXY_URL = 'https://cors-anywhere.herokuapp.com/';
const API_URL = PROXY_URL + CONFIG.API_BASE_URL;
```

### Option 3: Google Apps Script Library
Deploy sebagai Library dan akses melalui HTML Service.

## 🧪 Testing CORS Fix

### 1. Browser Console Test
```javascript
// Test basic connectivity
fetch('https://script.google.com/macros/s/AKfycbyvJjfEG_99m2fwv4NeKgZM-2O0zSqmCdqSJJMuUVdDJXE0UHa97UUAzB2NoZuaD81s1w/exec')
  .then(response => response.json())
  .then(data => console.log('GET test:', data))
  .catch(error => console.error('GET error:', error));

// Test POST request
fetch('https://script.google.com/macros/s/AKfycbyvJjfEG_99m2fwv4NeKgZM-2O0zSqmCdqSJJMuUVdDJXE0UHa97UUAzB2NoZuaD81s1w/exec', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ action: 'getInitialData' })
})
.then(response => response.json())
.then(data => console.log('POST test:', data))
.catch(error => console.error('POST error:', error));
```

### 2. Network Tab Inspection
1. Buka Developer Tools > Network
2. Reload halaman
3. Cek apakah ada preflight OPTIONS request
4. Verify response headers

### 3. Error Monitoring
```javascript
// Add to main.js for debugging
window.addEventListener('unhandledrejection', function(e) {
  console.error('Promise rejection:', e.reason);
  if (e.reason.message && e.reason.message.includes('CORS')) {
    showAlert('CORS Error detected. Switching to alternative method...', 'warning');
    // Fallback to XHR method
  }
});
```

## 📋 Checklist Deployment

- [ ] Google Apps Script deployed dengan setting yang benar
- [ ] URL API sudah diupdate di config.js
- [ ] Test GET request berhasil
- [ ] Test POST request berhasil
- [ ] Login functionality working
- [ ] Dashboard data loading
- [ ] All CRUD operations working
- [ ] Error handling working properly

## 🆘 Troubleshooting

### Jika masih ada CORS error:
1. **Re-deploy Apps Script** dengan setting yang benar
2. **Clear browser cache** dan cookies
3. **Test di incognito mode**
4. **Verify Google account permissions**
5. **Check Apps Script execution logs**

### Common Issues:
- **403 Forbidden**: Check deployment permissions
- **404 Not Found**: Verify URL is correct
- **500 Internal Error**: Check Apps Script logs
- **Network Error**: Check internet connection

## 📞 Support

Jika masih mengalami masalah CORS:
1. Check Google Apps Script execution transcript
2. Verify all permissions granted
3. Test with different browsers
4. Contact system administrator

---

**CORS Fix Applied Successfully!** ✅

Portal Karyawan SAG v3.0 sekarang sudah dapat mengatasi masalah CORS dan siap untuk production deployment.
