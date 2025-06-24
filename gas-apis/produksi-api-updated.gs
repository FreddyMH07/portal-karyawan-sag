/**
 * Google Apps Script API untuk Produksi - Portal Karyawan SAG v2.0
 * Updated version with enhanced features and compatibility
 * Sheet: https://docs.google.com/spreadsheets/d/1UMA4dHaqG6dmJ0kWTq7NPz6xmqnTPSqJpMu4ws7TFjs/edit
 */

// Configuration
const CONFIG = {
  SHEET_ID: '1UMA4dHaqG6dmJ0kWTq7NPz6xmqnTPSqJpMu4ws7TFjs',
  SHEETS: {
    DATA_HARIAN: 'DATA HARIAN',
    MASTER_DATA: 'MASTER DATA'
  },
  DATA_HARIAN_COLUMNS: [
    'Tanggal', 'Bulan', 'Tahun', 'Kebun', 'Divisi', 'AKP Panen', 
    'Jumlah TK Panen', 'Luas Panen (HA)', 'JJG Panen (Jjg)', 
    'JJG Kirim (Jjg)', 'Ketrek', 'Total JJG Kirim (Jjg)', 
    'Tonase Panen (Kg)', 'Refraksi (Kg)', 'Refraksi (%)', 
    'Restant (Jjg)', 'BJR Hari ini', 'Output (Kg/HK)', 
    'Output (Ha/HK)', 'Budget Harian', 'Timbang Kebun Harian', 
    'Timbang PKS Harian', 'Rotasi Panen', 'Input By'
  ],
  MASTER_DATA_COLUMNS: [
    'Kebun', 'Divisi', 'SPH_Panen', 'Luas_TM', 'Budget Alokasi', 
    'PKK', 'Bulan', 'Tahun'
  ]
};

/**
 * Handle CORS and routing for all requests
 */
function doGet(e) {
  return createCORSResponse({ 
    success: true, 
    message: 'Produksi API v2.0 is running',
    version: '2.0',
    endpoints: [
      'getData', 'addData', 'updateData', 'deleteData',
      'getMasterData', 'addMasterData', 'updateMasterData',
      'getDataByDate', 'getDataByKebun', 'getDataByDivisi',
      'getStatistics', 'exportData'
    ]
  });
}

function doPost(e) {
  try {
    const requestData = JSON.parse(e.postData.contents);
    const action = requestData.action;
    
    let response;
    
    switch(action) {
      // Data Harian operations
      case 'getData':
        response = getData(requestData);
        break;
      case 'addData':
        response = addData(requestData);
        break;
      case 'updateData':
        response = updateData(requestData);
        break;
      case 'deleteData':
        response = deleteData(requestData);
        break;
      
      // Master Data operations
      case 'getMasterData':
        response = getMasterData(requestData);
        break;
      case 'addMasterData':
        response = addMasterData(requestData);
        break;
      case 'updateMasterData':
        response = updateMasterData(requestData);
        break;
      
      // Enhanced queries
      case 'getDataByDate':
        response = getDataByDate(requestData);
        break;
      case 'getDataByKebun':
        response = getDataByKebun(requestData);
        break;
      case 'getDataByDivisi':
        response = getDataByDivisi(requestData);
        break;
      case 'getStatistics':
        response = getStatistics(requestData);
        break;
      case 'exportData':
        response = exportData(requestData);
        break;
      
      // Legacy compatibility
      case 'addProduksi':
        response = addData(requestData);
        break;
      case 'getProduksi':
        response = getData(requestData);
        break;
      
      default:
        response = { success: false, message: 'Invalid action: ' + action };
    }
    
    return createCORSResponse(response);
    
  } catch (error) {
    console.error('Error in doPost:', error);
    return createCORSResponse({ 
      success: false, 
      message: 'Server error: ' + error.toString(),
      error: error.toString()
    });
  }
}

/**
 * Create CORS response
 */
function createCORSResponse(data) {
  const output = ContentService.createTextOutput(JSON.stringify(data));
  output.setMimeType(ContentService.MimeType.JSON);
  
  return output;
}

/**
 * Get production data with filters
 */
function getData(data) {
  try {
    const sheet = SpreadsheetApp.openById(CONFIG.SHEET_ID).getSheetByName(CONFIG.SHEETS.DATA_HARIAN);
    const values = sheet.getDataRange().getValues();
    
    if (values.length <= 1) {
      return { success: true, data: [] };
    }
    
    const headers = values[0];
    const rows = values.slice(1);
    
    let produksiData = rows.map(row => {
      const obj = {};
      headers.forEach((header, index) => {
        obj[header] = row[index] || '';
      });
      return obj;
    });
    
    // Apply filters if provided
    if (data.filters) {
      produksiData = applyFilters(produksiData, data.filters);
    }
    
    // Apply pagination if provided
    if (data.page && data.limit) {
      const startIndex = (data.page - 1) * data.limit;
      const endIndex = startIndex + data.limit;
      produksiData = produksiData.slice(startIndex, endIndex);
    }
    
    return { 
      success: true, 
      data: produksiData,
      total: produksiData.length,
      page: data.page || 1,
      limit: data.limit || produksiData.length
    };
    
  } catch (error) {
    console.error('Error in getData:', error);
    return { success: false, message: error.toString() };
  }
}

/**
 * Add new production data
 */
function addData(data) {
  try {
    const sheet = SpreadsheetApp.openById(CONFIG.SHEET_ID).getSheetByName(CONFIG.SHEETS.DATA_HARIAN);
    
    // Prepare data row based on column structure
    const newRow = CONFIG.DATA_HARIAN_COLUMNS.map(column => {
      switch(column) {
        case 'Tanggal':
          return data.tanggal || new Date().toISOString().split('T')[0];
        case 'Bulan':
          return data.bulan || new Date().getMonth() + 1;
        case 'Tahun':
          return data.tahun || new Date().getFullYear();
        case 'Kebun':
          return data.kebun || '';
        case 'Divisi':
          return data.divisi || '';
        case 'AKP Panen':
          return data.akpPanen || '';
        case 'Jumlah TK Panen':
          return data.jumlahTKPanen || 0;
        case 'Luas Panen (HA)':
          return data.luasPanen || 0;
        case 'JJG Panen (Jjg)':
          return data.jjgPanen || 0;
        case 'JJG Kirim (Jjg)':
          return data.jjgKirim || 0;
        case 'Ketrek':
          return data.ketrek || 0;
        case 'Total JJG Kirim (Jjg)':
          return (parseFloat(data.jjgKirim || 0) + parseFloat(data.ketrek || 0));
        case 'Tonase Panen (Kg)':
          return data.tonasePanen || 0;
        case 'Refraksi (Kg)':
          return data.refraksi || 0;
        case 'Refraksi (%)':
          return data.refraksiPersen || 0;
        case 'Restant (Jjg)':
          return data.restant || 0;
        case 'BJR Hari ini':
          return data.bjrHariIni || 0;
        case 'Output (Kg/HK)':
          return data.outputKgHK || 0;
        case 'Output (Ha/HK)':
          return data.outputHaHK || 0;
        case 'Budget Harian':
          return data.budgetHarian || 0;
        case 'Timbang Kebun Harian':
          return data.timbangKebunHarian || 0;
        case 'Timbang PKS Harian':
          return data.timbangPKSHarian || 0;
        case 'Rotasi Panen':
          return data.rotasiPanen || '';
        case 'Input By':
          return data.inputBy || 'System';
        default:
          return '';
      }
    });
    
    sheet.appendRow(newRow);
    
    return { 
      success: true, 
      message: 'Data produksi berhasil ditambahkan',
      data: newRow
    };
    
  } catch (error) {
    console.error('Error in addData:', error);
    return { success: false, message: error.toString() };
  }
}

/**
 * Update production data
 */
function updateData(data) {
  try {
    const sheet = SpreadsheetApp.openById(CONFIG.SHEET_ID).getSheetByName(CONFIG.SHEETS.DATA_HARIAN);
    const values = sheet.getDataRange().getValues();
    
    if (!data.rowIndex || data.rowIndex < 2) {
      return { success: false, message: 'Invalid row index' };
    }
    
    const headers = values[0];
    const rowIndex = parseInt(data.rowIndex);
    
    // Update specific cells
    Object.keys(data).forEach(key => {
      if (key !== 'action' && key !== 'rowIndex') {
        const columnIndex = headers.indexOf(key);
        if (columnIndex !== -1) {
          sheet.getRange(rowIndex, columnIndex + 1).setValue(data[key]);
        }
      }
    });
    
    return { success: true, message: 'Data produksi berhasil diupdate' };
    
  } catch (error) {
    console.error('Error in updateData:', error);
    return { success: false, message: error.toString() };
  }
}

/**
 * Delete production data
 */
function deleteData(data) {
  try {
    const sheet = SpreadsheetApp.openById(CONFIG.SHEET_ID).getSheetByName(CONFIG.SHEETS.DATA_HARIAN);
    
    if (!data.rowIndex || data.rowIndex < 2) {
      return { success: false, message: 'Invalid row index' };
    }
    
    sheet.deleteRow(parseInt(data.rowIndex));
    
    return { success: true, message: 'Data produksi berhasil dihapus' };
    
  } catch (error) {
    console.error('Error in deleteData:', error);
    return { success: false, message: error.toString() };
  }
}

/**
 * Get master data
 */
function getMasterData(data) {
  try {
    const sheet = SpreadsheetApp.openById(CONFIG.SHEET_ID).getSheetByName(CONFIG.SHEETS.MASTER_DATA);
    const values = sheet.getDataRange().getValues();
    
    if (values.length <= 1) {
      return { success: true, data: [] };
    }
    
    const headers = values[0];
    const rows = values.slice(1);
    
    const masterData = rows.map(row => {
      const obj = {};
      headers.forEach((header, index) => {
        obj[header] = row[index] || '';
      });
      return obj;
    });
    
    return { success: true, data: masterData };
    
  } catch (error) {
    console.error('Error in getMasterData:', error);
    return { success: false, message: error.toString() };
  }
}

/**
 * Add master data
 */
function addMasterData(data) {
  try {
    const sheet = SpreadsheetApp.openById(CONFIG.SHEET_ID).getSheetByName(CONFIG.SHEETS.MASTER_DATA);
    
    const newRow = CONFIG.MASTER_DATA_COLUMNS.map(column => {
      switch(column) {
        case 'Kebun': return data.kebun || '';
        case 'Divisi': return data.divisi || '';
        case 'SPH_Panen': return data.sphPanen || 0;
        case 'Luas_TM': return data.luasTM || 0;
        case 'Budget Alokasi': return data.budgetAlokasi || 0;
        case 'PKK': return data.pkk || '';
        case 'Bulan': return data.bulan || new Date().getMonth() + 1;
        case 'Tahun': return data.tahun || new Date().getFullYear();
        default: return '';
      }
    });
    
    sheet.appendRow(newRow);
    
    return { success: true, message: 'Master data berhasil ditambahkan' };
    
  } catch (error) {
    console.error('Error in addMasterData:', error);
    return { success: false, message: error.toString() };
  }
}

/**
 * Update master data
 */
function updateMasterData(data) {
  try {
    const sheet = SpreadsheetApp.openById(CONFIG.SHEET_ID).getSheetByName(CONFIG.SHEETS.MASTER_DATA);
    
    if (!data.rowIndex || data.rowIndex < 2) {
      return { success: false, message: 'Invalid row index' };
    }
    
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const rowIndex = parseInt(data.rowIndex);
    
    Object.keys(data).forEach(key => {
      if (key !== 'action' && key !== 'rowIndex') {
        const columnIndex = headers.indexOf(key);
        if (columnIndex !== -1) {
          sheet.getRange(rowIndex, columnIndex + 1).setValue(data[key]);
        }
      }
    });
    
    return { success: true, message: 'Master data berhasil diupdate' };
    
  } catch (error) {
    console.error('Error in updateMasterData:', error);
    return { success: false, message: error.toString() };
  }
}

/**
 * Get data by date range
 */
function getDataByDate(data) {
  try {
    const filters = {
      startDate: data.startDate,
      endDate: data.endDate
    };
    
    return getData({ filters: filters });
    
  } catch (error) {
    console.error('Error in getDataByDate:', error);
    return { success: false, message: error.toString() };
  }
}

/**
 * Get data by kebun
 */
function getDataByKebun(data) {
  try {
    const filters = {
      kebun: data.kebun
    };
    
    return getData({ filters: filters });
    
  } catch (error) {
    console.error('Error in getDataByKebun:', error);
    return { success: false, message: error.toString() };
  }
}

/**
 * Get data by divisi
 */
function getDataByDivisi(data) {
  try {
    const filters = {
      divisi: data.divisi
    };
    
    return getData({ filters: filters });
    
  } catch (error) {
    console.error('Error in getDataByDivisi:', error);
    return { success: false, message: error.toString() };
  }
}

/**
 * Get statistics
 */
function getStatistics(data) {
  try {
    const allData = getData({});
    if (!allData.success) return allData;
    
    const produksiData = allData.data;
    
    const stats = {
      totalRecords: produksiData.length,
      totalTonase: 0,
      totalJJG: 0,
      averageBJR: 0,
      kebunStats: {},
      divisiStats: {},
      monthlyStats: {}
    };
    
    let totalBJR = 0;
    let bjrCount = 0;
    
    produksiData.forEach(item => {
      // Total calculations
      const tonase = parseFloat(item['Tonase Panen (Kg)']) || 0;
      const jjg = parseFloat(item['JJG Panen (Jjg)']) || 0;
      const bjr = parseFloat(item['BJR Hari ini']) || 0;
      
      stats.totalTonase += tonase;
      stats.totalJJG += jjg;
      
      if (bjr > 0) {
        totalBJR += bjr;
        bjrCount++;
      }
      
      // Kebun stats
      const kebun = item.Kebun || 'Unknown';
      if (!stats.kebunStats[kebun]) {
        stats.kebunStats[kebun] = { tonase: 0, jjg: 0, count: 0 };
      }
      stats.kebunStats[kebun].tonase += tonase;
      stats.kebunStats[kebun].jjg += jjg;
      stats.kebunStats[kebun].count++;
      
      // Divisi stats
      const divisi = item.Divisi || 'Unknown';
      if (!stats.divisiStats[divisi]) {
        stats.divisiStats[divisi] = { tonase: 0, jjg: 0, count: 0 };
      }
      stats.divisiStats[divisi].tonase += tonase;
      stats.divisiStats[divisi].jjg += jjg;
      stats.divisiStats[divisi].count++;
      
      // Monthly stats
      const bulan = item.Bulan || 'Unknown';
      if (!stats.monthlyStats[bulan]) {
        stats.monthlyStats[bulan] = { tonase: 0, jjg: 0, count: 0 };
      }
      stats.monthlyStats[bulan].tonase += tonase;
      stats.monthlyStats[bulan].jjg += jjg;
      stats.monthlyStats[bulan].count++;
    });
    
    stats.averageBJR = bjrCount > 0 ? totalBJR / bjrCount : 0;
    
    return { success: true, data: stats };
    
  } catch (error) {
    console.error('Error in getStatistics:', error);
    return { success: false, message: error.toString() };
  }
}

/**
 * Export data
 */
function exportData(data) {
  try {
    const dataHarian = getData({});
    const masterData = getMasterData({});
    
    const exportData = {
      dataHarian: dataHarian.success ? dataHarian.data : [],
      masterData: masterData.success ? masterData.data : [],
      exportDate: new Date().toISOString(),
      totalRecords: (dataHarian.success ? dataHarian.data.length : 0) + 
                   (masterData.success ? masterData.data.length : 0)
    };
    
    return { success: true, data: exportData };
    
  } catch (error) {
    console.error('Error in exportData:', error);
    return { success: false, message: error.toString() };
  }
}

/**
 * Apply filters to data
 */
function applyFilters(data, filters) {
  let filteredData = data;
  
  if (filters.startDate && filters.endDate) {
    const startDate = new Date(filters.startDate);
    const endDate = new Date(filters.endDate);
    filteredData = filteredData.filter(item => {
      const itemDate = new Date(item.Tanggal);
      return itemDate >= startDate && itemDate <= endDate;
    });
  }
  
  if (filters.kebun) {
    filteredData = filteredData.filter(item => 
      item.Kebun && item.Kebun.toLowerCase().includes(filters.kebun.toLowerCase())
    );
  }
  
  if (filters.divisi) {
    filteredData = filteredData.filter(item => 
      item.Divisi && item.Divisi.toLowerCase().includes(filters.divisi.toLowerCase())
    );
  }
  
  if (filters.bulan) {
    filteredData = filteredData.filter(item => 
      item.Bulan == filters.bulan
    );
  }
  
  if (filters.tahun) {
    filteredData = filteredData.filter(item => 
      item.Tahun == filters.tahun
    );
  }
  
  return filteredData;
}
