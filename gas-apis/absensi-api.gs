/**
 * Google Apps Script API untuk Absensi - Portal Karyawan SAG
 * Sheet: https://docs.google.com/spreadsheets/d/1UaETaH6VgTAG0agxrsoVuUvJYrCbbM3mTErAW6_eviM/edit
 */

// Configuration
const CONFIG = {
  SHEET_ID: '1UaETaH6VgTAG0agxrsoVuUvJYrCbbM3mTErAW6_eviM',
  SHEETS: {
    ABSENSI: 'ABSENSI'
  },
  ABSENSI_COLUMNS: [
    'ID', 'Tanggal', 'NIK', 'Nama Karyawan', 'Departemen', 
    'Shift', 'Jam Masuk/Keluar', 'Status Kehadiran', 'Keterangan', 
    'Lokasi Check-in/out', 'Created By', 'Created Date'
  ]
};

/**
 * Handle CORS and routing for all requests
 */
function doGet(e) {
  return createCORSResponse({ success: true, message: 'Absensi API is running' });
}

function doPost(e) {
  try {
    const requestData = JSON.parse(e.postData.contents);
    const action = requestData.action;
    
    let response;
    
    switch(action) {
      case 'getAbsensi':
        response = getAbsensi(requestData);
        break;
      case 'addAbsensi':
        response = addAbsensi(requestData);
        break;
      case 'updateAbsensi':
        response = updateAbsensi(requestData);
        break;
      case 'deleteAbsensi':
        response = deleteAbsensi(requestData);
        break;
      case 'getAbsensiByNIK':
        response = getAbsensiByNIK(requestData);
        break;
      case 'getAbsensiByDate':
        response = getAbsensiByDate(requestData);
        break;
      case 'checkIn':
        response = checkIn(requestData);
        break;
      case 'checkOut':
        response = checkOut(requestData);
        break;
      default:
        response = { success: false, message: 'Invalid action' };
    }
    
    return createCORSResponse(response);
    
  } catch (error) {
    console.error('Error in doPost:', error);
    return createCORSResponse({ 
      success: false, 
      message: 'Server error: ' + error.toString() 
    });
  }
}

/**
 * Create CORS response
 */
function createCORSResponse(data) {
  const output = ContentService.createTextOutput(JSON.stringify(data));
  output.setMimeType(ContentService.MimeType.JSON);
  
  // Add CORS headers
  const response = HtmlService.createHtmlOutput();
  response.addMetaTag('Access-Control-Allow-Origin', '*');
  response.addMetaTag('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.addMetaTag('Access-Control-Allow-Headers', 'Content-Type');
  
  return output;
}

/**
 * Get all absensi data with optional filters
 */
function getAbsensi(data) {
  try {
    const sheet = SpreadsheetApp.openById(CONFIG.SHEET_ID).getSheetByName(CONFIG.SHEETS.ABSENSI);
    const values = sheet.getDataRange().getValues();
    
    if (values.length <= 1) {
      return { success: true, data: [] };
    }
    
    const headers = values[0];
    const rows = values.slice(1);
    
    let absensiData = rows.map(row => {
      const obj = {};
      headers.forEach((header, index) => {
        obj[header] = row[index] || '';
      });
      return obj;
    });
    
    // Apply filters if provided
    if (data.filters) {
      if (data.filters.startDate && data.filters.endDate) {
        const startDate = new Date(data.filters.startDate);
        const endDate = new Date(data.filters.endDate);
        absensiData = absensiData.filter(item => {
          const itemDate = new Date(item.Tanggal);
          return itemDate >= startDate && itemDate <= endDate;
        });
      }
      
      if (data.filters.departemen) {
        absensiData = absensiData.filter(item => 
          item.Departemen.toLowerCase().includes(data.filters.departemen.toLowerCase())
        );
      }
      
      if (data.filters.nik) {
        absensiData = absensiData.filter(item => 
          item.NIK.toString().includes(data.filters.nik.toString())
        );
      }
    }
    
    return { success: true, data: absensiData };
    
  } catch (error) {
    console.error('Error in getAbsensi:', error);
    return { success: false, message: error.toString() };
  }
}

/**
 * Add new absensi record
 */
function addAbsensi(data) {
  try {
    const sheet = SpreadsheetApp.openById(CONFIG.SHEET_ID).getSheetByName(CONFIG.SHEETS.ABSENSI);
    
    // Generate new ID
    const lastRow = sheet.getLastRow();
    const newId = lastRow > 1 ? parseInt(sheet.getRange(lastRow, 1).getValue()) + 1 : 1;
    
    const newRow = [
      newId,
      data.tanggal || new Date().toISOString().split('T')[0],
      data.nik || '',
      data.namaKaryawan || '',
      data.departemen || '',
      data.shift || '',
      data.jamMasukKeluar || '',
      data.statusKehadiran || '',
      data.keterangan || '',
      data.lokasiCheckInOut || '',
      data.createdBy || 'System',
      new Date().toISOString()
    ];
    
    sheet.appendRow(newRow);
    
    return { 
      success: true, 
      message: 'Absensi berhasil ditambahkan',
      id: newId
    };
    
  } catch (error) {
    console.error('Error in addAbsensi:', error);
    return { success: false, message: error.toString() };
  }
}

/**
 * Update absensi record
 */
function updateAbsensi(data) {
  try {
    const sheet = SpreadsheetApp.openById(CONFIG.SHEET_ID).getSheetByName(CONFIG.SHEETS.ABSENSI);
    const values = sheet.getDataRange().getValues();
    
    // Find row by ID
    let rowIndex = -1;
    for (let i = 1; i < values.length; i++) {
      if (values[i][0] == data.id) {
        rowIndex = i + 1; // +1 because sheet rows are 1-indexed
        break;
      }
    }
    
    if (rowIndex === -1) {
      return { success: false, message: 'Data absensi tidak ditemukan' };
    }
    
    // Update the row
    const updatedRow = [
      data.id,
      data.tanggal || values[rowIndex-1][1],
      data.nik || values[rowIndex-1][2],
      data.namaKaryawan || values[rowIndex-1][3],
      data.departemen || values[rowIndex-1][4],
      data.shift || values[rowIndex-1][5],
      data.jamMasukKeluar || values[rowIndex-1][6],
      data.statusKehadiran || values[rowIndex-1][7],
      data.keterangan || values[rowIndex-1][8],
      data.lokasiCheckInOut || values[rowIndex-1][9],
      values[rowIndex-1][10], // Keep original Created By
      values[rowIndex-1][11]  // Keep original Created Date
    ];
    
    sheet.getRange(rowIndex, 1, 1, updatedRow.length).setValues([updatedRow]);
    
    return { success: true, message: 'Absensi berhasil diupdate' };
    
  } catch (error) {
    console.error('Error in updateAbsensi:', error);
    return { success: false, message: error.toString() };
  }
}

/**
 * Delete absensi record
 */
function deleteAbsensi(data) {
  try {
    const sheet = SpreadsheetApp.openById(CONFIG.SHEET_ID).getSheetByName(CONFIG.SHEETS.ABSENSI);
    const values = sheet.getDataRange().getValues();
    
    // Find row by ID
    let rowIndex = -1;
    for (let i = 1; i < values.length; i++) {
      if (values[i][0] == data.id) {
        rowIndex = i + 1; // +1 because sheet rows are 1-indexed
        break;
      }
    }
    
    if (rowIndex === -1) {
      return { success: false, message: 'Data absensi tidak ditemukan' };
    }
    
    sheet.deleteRow(rowIndex);
    
    return { success: true, message: 'Absensi berhasil dihapus' };
    
  } catch (error) {
    console.error('Error in deleteAbsensi:', error);
    return { success: false, message: error.toString() };
  }
}

/**
 * Get absensi by NIK
 */
function getAbsensiByNIK(data) {
  try {
    const allData = getAbsensi({});
    if (!allData.success) return allData;
    
    const filteredData = allData.data.filter(item => 
      item.NIK.toString() === data.nik.toString()
    );
    
    return { success: true, data: filteredData };
    
  } catch (error) {
    console.error('Error in getAbsensiByNIK:', error);
    return { success: false, message: error.toString() };
  }
}

/**
 * Get absensi by date range
 */
function getAbsensiByDate(data) {
  try {
    const filters = {
      startDate: data.startDate,
      endDate: data.endDate
    };
    
    return getAbsensi({ filters: filters });
    
  } catch (error) {
    console.error('Error in getAbsensiByDate:', error);
    return { success: false, message: error.toString() };
  }
}

/**
 * Check in function
 */
function checkIn(data) {
  try {
    const checkInData = {
      tanggal: new Date().toISOString().split('T')[0],
      nik: data.nik,
      namaKaryawan: data.namaKaryawan,
      departemen: data.departemen,
      shift: data.shift || 'Regular',
      jamMasukKeluar: new Date().toLocaleTimeString('id-ID'),
      statusKehadiran: 'Masuk',
      keterangan: data.keterangan || 'Check In',
      lokasiCheckInOut: data.lokasi || '',
      createdBy: data.createdBy || data.namaKaryawan
    };
    
    return addAbsensi(checkInData);
    
  } catch (error) {
    console.error('Error in checkIn:', error);
    return { success: false, message: error.toString() };
  }
}

/**
 * Check out function
 */
function checkOut(data) {
  try {
    const checkOutData = {
      tanggal: new Date().toISOString().split('T')[0],
      nik: data.nik,
      namaKaryawan: data.namaKaryawan,
      departemen: data.departemen,
      shift: data.shift || 'Regular',
      jamMasukKeluar: new Date().toLocaleTimeString('id-ID'),
      statusKehadiran: 'Keluar',
      keterangan: data.keterangan || 'Check Out',
      lokasiCheckInOut: data.lokasi || '',
      createdBy: data.createdBy || data.namaKaryawan
    };
    
    return addAbsensi(checkOutData);
    
  } catch (error) {
    console.error('Error in checkOut:', error);
    return { success: false, message: error.toString() };
  }
}
