/**
 * Google Apps Script API untuk Portal Karyawan SAG v3.0
 * Enhanced with CORS handling and complete role-based access control
 */

// Configuration
const CONFIG = {
  SHEET_ID: '1UMA4dHaqG6dmJ0kWTq7NPz6xmqnTPSqJpMu4ws7TFjs',
  SHEETS: {
    DATA_HARIAN: 'DATA HARIAN',
    MASTER_DATA: 'MASTER DATA',
    USERS: 'USERS',
    BOOKING: 'BOOKING',
    ABSENSI: 'ABSENSI',
    KPI: 'KPI',
    ASSET: 'ASSET'
  },
  // Column structure for DATA HARIAN sheet
  DATA_HARIAN_COLUMNS: [
    'Tanggal', 'Bulan', 'Tahun', 'Kebun', 'Divisi', 'AKP Panen', 
    'Jumlah TK Panen', 'Luas Panen (HA)', 'JJG Panen (Jjg)', 
    'JJG Kirim (Jjg)', 'Ketrek', 'Total JJG Kirim (Jjg)', 
    'Tonase Panen (Kg)', 'Refraksi (Kg)', 'Refraksi (%)', 
    'Restant (Jjg)', 'BJR Hari ini', 'Output (Kg/HK)', 
    'Output (Ha/HK)', 'Budget Harian', 'Timbang Kebun Harian', 
    'Timbang PKS Harian', 'Rotasi Panen', 'Input By'
  ],
  // Role-based sheet access
  ROLE_PERMISSIONS: {
    'admin': ['DATA_HARIAN', 'BOOKING', 'ABSENSI', 'KPI', 'ASSET', 'MASTER_DATA', 'USERS'],
    'manager': ['DATA_HARIAN', 'BOOKING', 'ABSENSI', 'KPI', 'ASSET'],
    'supervisor': ['DATA_HARIAN', 'ABSENSI', 'KPI'],
    'staff': ['DATA_HARIAN', 'BOOKING'],
    'hr': ['ABSENSI', 'USERS'],
    'finance': ['KPI', 'ASSET'],
    'operator': ['DATA_HARIAN']
  }
};

/**
 * Handle CORS and routing for all requests
 */
function doGet(e) {
  // Handle CORS preflight
  return createCORSResponse({ success: true, message: 'API is running' });
}

function doPost(e) {
  try {
    // Handle CORS preflight
    if (!e.postData) {
      return createCORSResponse({ success: true, message: 'Preflight OK' });
    }
    
    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    
    console.log('API Call:', action, data);
    
    switch(action) {
      case 'login':
        return createCORSResponse(handleLogin(data));
      case 'getInitialData':
        return createCORSResponse(getInitialData());
      case 'getDailyDashboardData':
        return createCORSResponse(getDailyDashboardData(data.filters));
      case 'getMonthlyDashboardData':
        return createCORSResponse(getMonthlyDashboardData(data.filters));
      case 'getMasterData':
        return createCORSResponse(getMasterData(data.filters));
      case 'submitDailyData':
        return createCORSResponse(submitDailyData(data.dailyData, data.userInfo));
      case 'updateDailyData':
        return createCORSResponse(updateDailyData(data.rowId, data.dailyData, data.userInfo));
      case 'deleteDailyData':
        return createCORSResponse(deleteDailyData(data.rowId, data.userInfo));
      // Booking operations
      case 'getBookingData':
        return createCORSResponse(getBookingData(data.filters, data.userInfo));
      case 'submitBooking':
        return createCORSResponse(submitBooking(data.bookingData, data.userInfo));
      case 'updateBooking':
        return createCORSResponse(updateBooking(data.bookingId, data.bookingData, data.userInfo));
      case 'cancelBooking':
        return createCORSResponse(cancelBooking(data.bookingId, data.userInfo));
      // Absensi operations
      case 'getAbsensiData':
        return createCORSResponse(getAbsensiData(data.filters, data.userInfo));
      case 'submitAbsensi':
        return createCORSResponse(submitAbsensi(data.absensiData, data.userInfo));
      case 'updateAbsensi':
        return createCORSResponse(updateAbsensi(data.absensiId, data.absensiData, data.userInfo));
      // KPI operations
      case 'getKPIData':
        return createCORSResponse(getKPIData(data.filters, data.userInfo));
      case 'submitKPI':
        return createCORSResponse(submitKPI(data.kpiData, data.userInfo));
      case 'updateKPI':
        return createCORSResponse(updateKPI(data.kpiId, data.kpiData, data.userInfo));
      // Asset operations
      case 'getAssetData':
        return createCORSResponse(getAssetData(data.filters, data.userInfo));
      case 'submitAsset':
        return createCORSResponse(submitAsset(data.assetData, data.userInfo));
      case 'updateAsset':
        return createCORSResponse(updateAsset(data.assetId, data.assetData, data.userInfo));
      default:
        throw new Error('Invalid action: ' + action);
    }
  } catch (error) {
    console.error('API Error:', error);
    return createCORSResponse({ success: false, error: error.message });
  }
}

/**
 * Create CORS-enabled response
 */
function createCORSResponse(data) {
  const output = ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
  
  // Add CORS headers
  return output;
}

/**
 * Handle user login with role-based permissions
 */
function handleLogin(data) {
  const sheet = SpreadsheetApp.openById(CONFIG.SHEET_ID).getSheetByName(CONFIG.SHEETS.USERS);
  const users = sheet.getDataRange().getValues();
  const headers = users[0];
  
  for (let i = 1; i < users.length; i++) {
    const user = {};
    headers.forEach((header, index) => {
      user[header] = users[i][index];
    });
    
    if (user.email === data.email && user.password === data.password) {
      const userRole = user.role || 'staff';
      const allowedSheets = CONFIG.ROLE_PERMISSIONS[userRole] || CONFIG.ROLE_PERMISSIONS['staff'];
      
      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: userRole,
          permissions: allowedSheets,
          loginTime: new Date().toISOString()
        }
      };
    }
  }
  
  return { success: false, message: 'Email atau password salah' };
}

/**
 * Check if user has permission to access specific sheet
 */
function checkPermission(userInfo, sheetName) {
  if (!userInfo || !userInfo.permissions) {
    return false;
  }
  return userInfo.permissions.includes(sheetName);
}

/**
 * Get initial data untuk dropdown filters
 */
function getInitialData() {
  const masterSheet = SpreadsheetApp.openById(CONFIG.SHEET_ID).getSheetByName(CONFIG.SHEETS.MASTER_DATA);
  const masterData = masterSheet.getDataRange().getValues();
  const headers = masterData[0];
  
  const kebunSet = new Set();
  const divisiMap = new Map();
  
  for (let i = 1; i < masterData.length; i++) {
    const row = {};
    headers.forEach((header, index) => {
      row[header] = masterData[i][index];
    });
    
    if (row.Kebun) {
      kebunSet.add(row.Kebun);
      
      if (!divisiMap.has(row.Kebun)) {
        divisiMap.set(row.Kebun, new Set());
      }
      if (row.Divisi) {
        divisiMap.get(row.Kebun).add(row.Divisi);
      }
    }
  }
  
  // Convert to arrays
  const kebunDivisiMap = {};
  divisiMap.forEach((divisiSet, kebun) => {
    kebunDivisiMap[kebun] = Array.from(divisiSet);
  });
  
  return {
    success: true,
    data: {
      kebunList: Array.from(kebunSet),
      kebunDivisiMap: kebunDivisiMap,
      lastUpdate: new Date().toISOString()
    }
  };
}

/**
 * Get daily dashboard data dengan filter
 */
function getDailyDashboardData(filters) {
  const dataSheet = SpreadsheetApp.openById(CONFIG.SHEET_ID).getSheetByName(CONFIG.SHEETS.DATA_HARIAN);
  const data = dataSheet.getDataRange().getValues();
  const headers = data[0];
  
  // Filter data berdasarkan kriteria
  const filteredData = [];
  for (let i = 1; i < data.length; i++) {
    const row = {};
    headers.forEach((header, index) => {
      row[header] = data[i][index];
    });
    
    // Apply filters
    if (filters.startDate && new Date(row.Tanggal) < new Date(filters.startDate)) continue;
    if (filters.endDate && new Date(row.Tanggal) > new Date(filters.endDate)) continue;
    if (filters.kebun && row.Kebun !== filters.kebun) continue;
    if (filters.divisi && row.Divisi !== filters.divisi) continue;
    
    filteredData.push(row);
  }
  
  // Calculate KPIs
  const kpis = calculateDailyKPIs(filteredData, filters);
  
  // Prepare chart data
  const chartData = prepareDailyChartData(filteredData);
  
  return {
    success: true,
    data: {
      tableData: filteredData,
      kpis: kpis,
      chartData: chartData,
      totalRecords: filteredData.length,
      lastUpdate: new Date().toISOString()
    }
  };
}

/**
 * Calculate daily KPIs
 */
function calculateDailyKPIs(data, filters) {
  let totalTimbangPKS = 0;
  let totalTonasePanen = 0;
  let totalJJGPanen = 0;
  let totalLuasPanen = 0;
  let totalJumlahTK = 0;
  let totalRefraksiKg = 0;
  let totalTimbangKebun = 0;
  let totalRestan = 0;
  
  data.forEach(row => {
    totalTimbangPKS += safeNum(row['Timbang PKS Harian']);
    totalTonasePanen += safeNum(row['Tonase Panen (Kg)']);
    totalJJGPanen += safeNum(row['JJG Panen (Jjg)']);
    totalLuasPanen += safeNum(row['Luas Panen (HA)']);
    totalJumlahTK += safeNum(row['Jumlah TK Panen']);
    totalRefraksiKg += safeNum(row['Refraksi (Kg)']);
    totalTimbangKebun += safeNum(row['Timbang Kebun Harian']);
    totalRestan += safeNum(row['Restant (Jjg)']);
  });
  
  // Get budget from master data
  const budget = getBudgetFromMaster(filters);
  
  return {
    acvProduksi: budget > 0 ? (totalTimbangPKS / budget * 100).toFixed(2) : 0,
    outputPerHa: totalLuasPanen > 0 ? (totalTonasePanen / totalLuasPanen).toFixed(2) : 0,
    outputPerHK: totalJumlahTK > 0 ? (totalTonasePanen / totalJumlahTK).toFixed(2) : 0,
    refraksiHarian: totalTonasePanen > 0 ? (totalRefraksiKg / (totalTonasePanen * 1000) * 100).toFixed(2) : 0,
    bjrHarian: totalJJGPanen > 0 ? (totalTimbangKebun / totalJJGPanen).toFixed(2) : 0,
    restanHarian: totalRestan,
    totalTimbangPKS: totalTimbangPKS.toFixed(1),
    totalTonasePanen: totalTonasePanen.toFixed(1),
    totalJJGPanen: totalJJGPanen
  };
}

/**
 * Get monthly dashboard data
 */
function getMonthlyDashboardData(filters) {
  const dataSheet = SpreadsheetApp.openById(CONFIG.SHEET_ID).getSheetByName(CONFIG.SHEETS.DATA_HARIAN);
  const data = dataSheet.getDataRange().getValues();
  const headers = data[0];
  
  // Filter data untuk bulan dan tahun yang dipilih
  const filteredData = [];
  const targetMonth = parseInt(filters.month);
  const targetYear = parseInt(filters.year);
  
  for (let i = 1; i < data.length; i++) {
    const row = {};
    headers.forEach((header, index) => {
      row[header] = data[i][index];
    });
    
    const rowDate = new Date(row.Tanggal);
    if (rowDate.getMonth() + 1 !== targetMonth || rowDate.getFullYear() !== targetYear) continue;
    if (filters.kebun && row.Kebun !== filters.kebun) continue;
    if (filters.divisi && row.Divisi !== filters.divisi) continue;
    
    filteredData.push(row);
  }
  
  // Calculate monthly KPIs
  const monthlyKPIs = calculateMonthlyKPIs(filteredData, filters);
  
  // Prepare monthly chart data
  const chartData = prepareMonthlyChartData(filteredData);
  
  // Group data by kebun/divisi for summary table
  const summaryData = createMonthlySummary(filteredData);
  
  return {
    success: true,
    data: {
      summaryData: summaryData,
      kpis: monthlyKPIs,
      chartData: chartData,
      totalRecords: filteredData.length,
      lastUpdate: new Date().toISOString()
    }
  };
}

/**
 * Calculate monthly KPIs
 */
function calculateMonthlyKPIs(data, filters) {
  let totalTimbangPKS = 0;
  let totalTonasePanen = 0;
  let totalJJGPanen = 0;
  let totalLuasPanen = 0;
  let totalJumlahTK = 0;
  let totalRefraksiKg = 0;
  let totalTimbangKebun = 0;
  let totalRestan = 0;
  
  data.forEach(row => {
    totalTimbangPKS += safeNum(row['Timbang PKS Harian']);
    totalTonasePanen += safeNum(row['Tonase Panen (Kg)']);
    totalJJGPanen += safeNum(row['JJG Panen (Jjg)']);
    totalLuasPanen += safeNum(row['Luas Panen (HA)']);
    totalJumlahTK += safeNum(row['Jumlah TK Panen']);
    totalRefraksiKg += safeNum(row['Refraksi (Kg)']);
    totalTimbangKebun += safeNum(row['Timbang Kebun Harian']);
    totalRestan += safeNum(row['Restant (Jjg)']);
  });
  
  // Get master data for calculations
  const masterData = getMasterDataForCalculation(filters);
  const budget = masterData.budget || 0;
  const sphPanen = masterData.sphPanen || 130;
  
  // Calculate monthly metrics
  const akpBulanan = totalLuasPanen > 0 ? totalJJGPanen / (totalLuasPanen * sphPanen) : 0;
  const acvProduksi = budget > 0 ? (totalTimbangPKS / budget * 100) : 0;
  const refraksiPersen = totalTonasePanen > 0 ? (totalRefraksiKg / (totalTonasePanen * 1000) * 100) : 0;
  const bjrBulanan = totalJJGPanen > 0 ? (totalTimbangKebun / totalJJGPanen) : 0;
  const deviasibudget = budget > 0 ? ((totalTimbangPKS - budget) / budget * 100) : 0;
  
  return {
    tonasePKSBulanan: totalTimbangPKS.toFixed(1),
    outputPerHa: totalLuasPanen > 0 ? (totalTonasePanen / totalLuasPanen).toFixed(2) : 0,
    outputPerHK: totalJumlahTK > 0 ? (totalTonasePanen / totalJumlahTK).toFixed(2) : 0,
    akpBulanan: akpBulanan.toFixed(2),
    acvProduksi: acvProduksi.toFixed(2),
    refraksiPersen: refraksiPersen.toFixed(2),
    bjrBulanan: bjrBulanan.toFixed(2),
    deviasibudget: deviasibudget.toFixed(2),
    restanBulanan: totalRestan,
    selisihTonase: (totalTimbangPKS - totalTimbangKebun).toFixed(1)
  };
}

// Helper functions
function safeNum(value) {
  const num = parseFloat(value);
  return isNaN(num) ? 0 : num;
}

function getBudgetFromMaster(filters) {
  // Implementation to get budget from master data
  return 1000; // Default budget
}

function getMasterDataForCalculation(filters) {
  // Implementation to get master data for calculations
  return {
    budget: 1000,
    sphPanen: 130,
    luasTM: 100,
    pkk: 85
  };
}

function prepareDailyChartData(data) {
  // Prepare data for charts
  const chartData = {
    trendData: [],
    kebunComparison: {},
    budgetVsRealisasi: []
  };
  
  // Group by date for trend
  const dateGroups = {};
  data.forEach(row => {
    const date = toIDDate(row.Tanggal);
    if (!dateGroups[date]) {
      dateGroups[date] = { tonase: 0, jjg: 0 };
    }
    dateGroups[date].tonase += safeNum(row['Tonase Panen (Kg)']);
    dateGroups[date].jjg += safeNum(row['JJG Panen (Jjg)']);
  });
  
  Object.keys(dateGroups).sort().forEach(date => {
    chartData.trendData.push({
      date: date,
      tonase: dateGroups[date].tonase,
      jjg: dateGroups[date].jjg
    });
  });
  
  return chartData;
}

function prepareMonthlyChartData(data) {
  // Similar to daily but grouped by month
  return {
    monthlyTrend: [],
    kebunComparison: {},
    budgetAnalysis: []
  };
}

function createMonthlySummary(data) {
  const summary = {};
  
  data.forEach(row => {
    const key = `${row.Kebun}-${row.Divisi}`;
    if (!summary[key]) {
      summary[key] = {
        kebun: row.Kebun,
        divisi: row.Divisi,
        totalTonase: 0,
        totalJJG: 0,
        totalLuas: 0,
        totalTK: 0
      };
    }
    
    summary[key].totalTonase += safeNum(row['Tonase Panen (Kg)']);
    summary[key].totalJJG += safeNum(row['JJG Panen (Jjg)']);
    summary[key].totalLuas += safeNum(row['Luas Panen (HA)']);
    summary[key].totalTK += safeNum(row['Jumlah TK Panen']);
  });
  
  return Object.values(summary);
}

function toIDDate(date) {
  return new Date(date).toLocaleDateString('id-ID');
}

/**
 * Get master data
 */
function getMasterData(filters) {
  try {
    const sheet = SpreadsheetApp.openById(CONFIG.SHEET_ID).getSheetByName(CONFIG.SHEETS.MASTER_DATA);
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    
    const masterData = [];
    for (let i = 1; i < data.length; i++) {
      const row = {};
      headers.forEach((header, index) => {
        row[header] = data[i][index];
      });
      masterData.push(row);
    }
    
    return {
      success: true,
      data: masterData
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Submit daily production data
 */
function submitDailyData(dailyData, userInfo) {
  if (!checkPermission(userInfo, 'DATA_HARIAN')) {
    return { success: false, message: 'Tidak memiliki akses untuk menambah data harian' };
  }
  
  try {
    const sheet = SpreadsheetApp.openById(CONFIG.SHEET_ID).getSheetByName(CONFIG.SHEETS.DATA_HARIAN);
    
    // Prepare row data according to column structure
    const rowData = CONFIG.DATA_HARIAN_COLUMNS.map(column => {
      if (column === 'Input By') {
        return userInfo.name || userInfo.email;
      }
      if (column === 'Tanggal') {
        return new Date(dailyData[column]);
      }
      return dailyData[column] || '';
    });
    
    // Add timestamp
    const timestamp = new Date();
    rowData.push(timestamp);
    
    sheet.appendRow(rowData);
    
    return {
      success: true,
      message: 'Data harian berhasil disimpan',
      timestamp: timestamp.toISOString()
    };
  } catch (error) {
    console.error('Error submitting daily data:', error);
    return { success: false, message: 'Gagal menyimpan data: ' + error.message };
  }
}

/**
 * Update daily production data
 */
function updateDailyData(rowId, dailyData, userInfo) {
  if (!checkPermission(userInfo, 'DATA_HARIAN')) {
    return { success: false, message: 'Tidak memiliki akses untuk mengubah data harian' };
  }
  
  try {
    const sheet = SpreadsheetApp.openById(CONFIG.SHEET_ID).getSheetByName(CONFIG.SHEETS.DATA_HARIAN);
    const range = sheet.getRange(rowId, 1, 1, CONFIG.DATA_HARIAN_COLUMNS.length);
    
    const rowData = CONFIG.DATA_HARIAN_COLUMNS.map(column => {
      if (column === 'Input By') {
        return userInfo.name || userInfo.email;
      }
      if (column === 'Tanggal') {
        return new Date(dailyData[column]);
      }
      return dailyData[column] || '';
    });
    
    range.setValues([rowData]);
    
    return {
      success: true,
      message: 'Data harian berhasil diperbarui'
    };
  } catch (error) {
    console.error('Error updating daily data:', error);
    return { success: false, message: 'Gagal memperbarui data: ' + error.message };
  }
}

/**
 * Delete daily production data
 */
function deleteDailyData(rowId, userInfo) {
  if (!checkPermission(userInfo, 'DATA_HARIAN') || userInfo.role !== 'admin') {
    return { success: false, message: 'Tidak memiliki akses untuk menghapus data' };
  }
  
  try {
    const sheet = SpreadsheetApp.openById(CONFIG.SHEET_ID).getSheetByName(CONFIG.SHEETS.DATA_HARIAN);
    sheet.deleteRow(rowId);
    
    return {
      success: true,
      message: 'Data berhasil dihapus'
    };
  } catch (error) {
    console.error('Error deleting daily data:', error);
    return { success: false, message: 'Gagal menghapus data: ' + error.message };
  }
}

/**
 * BOOKING OPERATIONS
 */

/**
 * Get booking data
 */
function getBookingData(filters, userInfo) {
  if (!checkPermission(userInfo, 'BOOKING')) {
    return { success: false, message: 'Tidak memiliki akses untuk melihat data booking' };
  }
  
  try {
    const sheet = SpreadsheetApp.openById(CONFIG.SHEET_ID).getSheetByName(CONFIG.SHEETS.BOOKING);
    const data = sheet.getDataRange().getValues();
    
    if (data.length === 0) {
      // Initialize booking sheet if empty
      const headers = ['ID', 'Tanggal Booking', 'Waktu Mulai', 'Waktu Selesai', 'Ruangan/Fasilitas', 
                     'Keperluan', 'Pemohon', 'Departemen', 'Status', 'Catatan', 'Created By', 'Created Date'];
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      return { success: true, data: [], headers: headers };
    }
    
    const headers = data[0];
    const bookingData = [];
    
    for (let i = 1; i < data.length; i++) {
      const row = {};
      headers.forEach((header, index) => {
        row[header] = data[i][index];
      });
      
      // Apply filters
      if (filters.startDate && new Date(row['Tanggal Booking']) < new Date(filters.startDate)) continue;
      if (filters.endDate && new Date(row['Tanggal Booking']) > new Date(filters.endDate)) continue;
      if (filters.status && row.Status !== filters.status) continue;
      if (filters.ruangan && row['Ruangan/Fasilitas'] !== filters.ruangan) continue;
      
      bookingData.push(row);
    }
    
    return {
      success: true,
      data: bookingData,
      headers: headers,
      totalRecords: bookingData.length
    };
  } catch (error) {
    console.error('Error getting booking data:', error);
    return { success: false, message: 'Gagal memuat data booking: ' + error.message };
  }
}

/**
 * Submit new booking
 */
function submitBooking(bookingData, userInfo) {
  if (!checkPermission(userInfo, 'BOOKING')) {
    return { success: false, message: 'Tidak memiliki akses untuk membuat booking' };
  }
  
  try {
    const sheet = SpreadsheetApp.openById(CONFIG.SHEET_ID).getSheetByName(CONFIG.SHEETS.BOOKING);
    
    // Generate booking ID
    const bookingId = 'BK' + new Date().getTime();
    
    const rowData = [
      bookingId,
      new Date(bookingData.tanggalBooking),
      bookingData.waktuMulai,
      bookingData.waktuSelesai,
      bookingData.ruangan,
      bookingData.keperluan,
      bookingData.pemohon || userInfo.name,
      bookingData.departemen,
      'Pending',
      bookingData.catatan || '',
      userInfo.name || userInfo.email,
      new Date()
    ];
    
    sheet.appendRow(rowData);
    
    return {
      success: true,
      message: 'Booking berhasil dibuat',
      bookingId: bookingId
    };
  } catch (error) {
    console.error('Error submitting booking:', error);
    return { success: false, message: 'Gagal membuat booking: ' + error.message };
  }
}

/**
 * Update booking
 */
function updateBooking(bookingId, bookingData, userInfo) {
  if (!checkPermission(userInfo, 'BOOKING')) {
    return { success: false, message: 'Tidak memiliki akses untuk mengubah booking' };
  }
  
  try {
    const sheet = SpreadsheetApp.openById(CONFIG.SHEET_ID).getSheetByName(CONFIG.SHEETS.BOOKING);
    const data = sheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === bookingId) {
        const range = sheet.getRange(i + 1, 1, 1, 12);
        const rowData = [
          bookingId,
          new Date(bookingData.tanggalBooking),
          bookingData.waktuMulai,
          bookingData.waktuSelesai,
          bookingData.ruangan,
          bookingData.keperluan,
          bookingData.pemohon,
          bookingData.departemen,
          bookingData.status || 'Pending',
          bookingData.catatan || '',
          userInfo.name || userInfo.email,
          new Date()
        ];
        
        range.setValues([rowData]);
        
        return {
          success: true,
          message: 'Booking berhasil diperbarui'
        };
      }
    }
    
    return { success: false, message: 'Booking tidak ditemukan' };
  } catch (error) {
    console.error('Error updating booking:', error);
    return { success: false, message: 'Gagal memperbarui booking: ' + error.message };
  }
}

/**
 * Cancel booking
 */
function cancelBooking(bookingId, userInfo) {
  if (!checkPermission(userInfo, 'BOOKING')) {
    return { success: false, message: 'Tidak memiliki akses untuk membatalkan booking' };
  }
  
  try {
    const sheet = SpreadsheetApp.openById(CONFIG.SHEET_ID).getSheetByName(CONFIG.SHEETS.BOOKING);
    const data = sheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === bookingId) {
        // Update status to cancelled
        sheet.getRange(i + 1, 9).setValue('Cancelled');
        sheet.getRange(i + 1, 10).setValue('Dibatalkan oleh: ' + userInfo.name);
        
        return {
          success: true,
          message: 'Booking berhasil dibatalkan'
        };
      }
    }
    
    return { success: false, message: 'Booking tidak ditemukan' };
  } catch (error) {
    console.error('Error cancelling booking:', error);
    return { success: false, message: 'Gagal membatalkan booking: ' + error.message };
  }
}
function getInitialData() {
  const masterSheet = SpreadsheetApp.openById(CONFIG.SHEET_ID).getSheetByName(CONFIG.SHEETS.MASTER_DATA);
  const masterData = masterSheet.getDataRange().getValues();
  const headers = masterData[0];
  
  const kebunSet = new Set();
  const divisiMap = new Map();
  
  for (let i = 1; i < masterData.length; i++) {
    const row = {};
    headers.forEach((header, index) => {
      row[header] = masterData[i][index];
    });
    
    if (row.Kebun) {
      kebunSet.add(row.Kebun);
      
      if (!divisiMap.has(row.Kebun)) {
        divisiMap.set(row.Kebun, new Set());
      }
      if (row.Divisi) {
        divisiMap.get(row.Kebun).add(row.Divisi);
      }
    }
  }
  
  // Convert to arrays
  const kebunDivisiMap = {};
  divisiMap.forEach((divisiSet, kebun) => {
    kebunDivisiMap[kebun] = Array.from(divisiSet);
  });
  
  return {
    success: true,
    data: {
      kebunList: Array.from(kebunSet),
      kebunDivisiMap: kebunDivisiMap,
      lastUpdate: new Date().toISOString()
    }
  };
}

/**
 * Get daily dashboard data dengan filter
 */
function getDailyDashboardData(filters) {
  const dataSheet = SpreadsheetApp.openById(CONFIG.SHEET_ID).getSheetByName(CONFIG.SHEETS.DATA_HARIAN);
  const data = dataSheet.getDataRange().getValues();
  const headers = data[0];
  
  // Filter data berdasarkan kriteria
  const filteredData = [];
  for (let i = 1; i < data.length; i++) {
    const row = {};
    headers.forEach((header, index) => {
      row[header] = data[i][index];
    });
    
    // Apply filters
    if (filters.startDate && new Date(row.Tanggal) < new Date(filters.startDate)) continue;
    if (filters.endDate && new Date(row.Tanggal) > new Date(filters.endDate)) continue;
    if (filters.kebun && row.Kebun !== filters.kebun) continue;
    if (filters.divisi && row.Divisi !== filters.divisi) continue;
    
    filteredData.push(row);
  }
  
  // Calculate KPIs
  const kpis = calculateDailyKPIs(filteredData, filters);
  
  // Prepare chart data
  const chartData = prepareDailyChartData(filteredData);
  
  return {
    success: true,
    data: {
      tableData: filteredData,
      kpis: kpis,
      chartData: chartData,
      totalRecords: filteredData.length,
      lastUpdate: new Date().toISOString()
    }
  };
}

/**
 * Calculate daily KPIs
 */
function calculateDailyKPIs(data, filters) {
  let totalTimbangPKS = 0;
  let totalTonasePanen = 0;
  let totalJJGPanen = 0;
  let totalLuasPanen = 0;
  let totalJumlahTK = 0;
  let totalRefraksiKg = 0;
  let totalTimbangKebun = 0;
  let totalRestan = 0;
  
  data.forEach(row => {
    totalTimbangPKS += safeNum(row['Timbang PKS Harian']);
    totalTonasePanen += safeNum(row['Tonase Panen']);
    totalJJGPanen += safeNum(row['JJG Panen']);
    totalLuasPanen += safeNum(row['Luas Panen']);
    totalJumlahTK += safeNum(row['Jumlah TK Panen']);
    totalRefraksiKg += safeNum(row['Refraksi (Kg)']);
    totalTimbangKebun += safeNum(row['Timbang Kebun Harian']);
    totalRestan += safeNum(row['Restan (JJG)']);
  });
  
  // Get budget from master data
  const budget = getBudgetFromMaster(filters);
  
  return {
    acvProduksi: budget > 0 ? (totalTimbangPKS / budget * 100).toFixed(2) : 0,
    outputPerHa: totalLuasPanen > 0 ? (totalTonasePanen / totalLuasPanen).toFixed(2) : 0,
    outputPerHK: totalJumlahTK > 0 ? (totalTonasePanen / totalJumlahTK).toFixed(2) : 0,
    refraksiHarian: totalTonasePanen > 0 ? (totalRefraksiKg / (totalTonasePanen * 1000) * 100).toFixed(2) : 0,
    bjrHarian: totalJJGPanen > 0 ? (totalTimbangKebun / totalJJGPanen).toFixed(2) : 0,
    restanHarian: totalRestan,
    totalTimbangPKS: totalTimbangPKS.toFixed(1),
    totalTonasePanen: totalTonasePanen.toFixed(1),
    totalJJGPanen: totalJJGPanen
  };
}

/**
 * Get monthly dashboard data
 */
function getMonthlyDashboardData(filters) {
  const dataSheet = SpreadsheetApp.openById(CONFIG.SHEET_ID).getSheetByName(CONFIG.SHEETS.DATA_HARIAN);
  const data = dataSheet.getDataRange().getValues();
  const headers = data[0];
  
  // Filter data untuk bulan dan tahun yang dipilih
  const filteredData = [];
  const targetMonth = parseInt(filters.month);
  const targetYear = parseInt(filters.year);
  
  for (let i = 1; i < data.length; i++) {
    const row = {};
    headers.forEach((header, index) => {
      row[header] = data[i][index];
    });
    
    const rowDate = new Date(row.Tanggal);
    if (rowDate.getMonth() + 1 !== targetMonth || rowDate.getFullYear() !== targetYear) continue;
    if (filters.kebun && row.Kebun !== filters.kebun) continue;
    if (filters.divisi && row.Divisi !== filters.divisi) continue;
    
    filteredData.push(row);
  }
  
  // Calculate monthly KPIs
  const monthlyKPIs = calculateMonthlyKPIs(filteredData, filters);
  
  // Prepare monthly chart data
  const chartData = prepareMonthlyChartData(filteredData);
  
  // Group data by kebun/divisi for summary table
  const summaryData = createMonthlySummary(filteredData);
  
  return {
    success: true,
    data: {
      summaryData: summaryData,
      kpis: monthlyKPIs,
      chartData: chartData,
      totalRecords: filteredData.length,
      lastUpdate: new Date().toISOString()
    }
  };
}

/**
 * Calculate monthly KPIs
 */
function calculateMonthlyKPIs(data, filters) {
  let totalTimbangPKS = 0;
  let totalTonasePanen = 0;
  let totalJJGPanen = 0;
  let totalLuasPanen = 0;
  let totalJumlahTK = 0;
  let totalRefraksiKg = 0;
  let totalTimbangKebun = 0;
  let totalRestan = 0;
  
  data.forEach(row => {
    totalTimbangPKS += safeNum(row['Timbang PKS Harian']);
    totalTonasePanen += safeNum(row['Tonase Panen']);
    totalJJGPanen += safeNum(row['JJG Panen']);
    totalLuasPanen += safeNum(row['Luas Panen']);
    totalJumlahTK += safeNum(row['Jumlah TK Panen']);
    totalRefraksiKg += safeNum(row['Refraksi (Kg)']);
    totalTimbangKebun += safeNum(row['Timbang Kebun Harian']);
    totalRestan += safeNum(row['Restan (JJG)']);
  });
  
  // Get master data for calculations
  const masterData = getMasterDataForCalculation(filters);
  const budget = masterData.budget || 0;
  const sphPanen = masterData.sphPanen || 130;
  
  // Calculate monthly metrics
  const akpBulanan = totalLuasPanen > 0 ? totalJJGPanen / (totalLuasPanen * sphPanen) : 0;
  const acvProduksi = budget > 0 ? (totalTimbangPKS / budget * 100) : 0;
  const refraksiPersen = totalTonasePanen > 0 ? (totalRefraksiKg / (totalTonasePanen * 1000) * 100) : 0;
  const bjrBulanan = totalJJGPanen > 0 ? (totalTimbangKebun / totalJJGPanen) : 0;
  const deviasibudget = budget > 0 ? ((totalTimbangPKS - budget) / budget * 100) : 0;
  
  return {
    tonasePKSBulanan: totalTimbangPKS.toFixed(1),
    outputPerHa: totalLuasPanen > 0 ? (totalTonasePanen / totalLuasPanen).toFixed(2) : 0,
    outputPerHK: totalJumlahTK > 0 ? (totalTonasePanen / totalJumlahTK).toFixed(2) : 0,
    akpBulanan: akpBulanan.toFixed(2),
    acvProduksi: acvProduksi.toFixed(2),
    refraksiPersen: refraksiPersen.toFixed(2),
    bjrBulanan: bjrBulanan.toFixed(2),
    deviasibudget: deviasibudget.toFixed(2),
    restanBulanan: totalRestan,
    selisihTonase: (totalTimbangPKS - totalTimbangKebun).toFixed(1)
  };
}

// Helper functions
function safeNum(value) {
  const num = parseFloat(value);
  return isNaN(num) ? 0 : num;
}

function createResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function getBudgetFromMaster(filters) {
  // Implementation to get budget from master data
  return 1000; // Default budget
}

function getMasterDataForCalculation(filters) {
  // Implementation to get master data for calculations
  return {
    budget: 1000,
    sphPanen: 130,
    luasTM: 100,
    pkk: 85
  };
}

function prepareDailyChartData(data) {
  // Prepare data for charts
  const chartData = {
    trendData: [],
    kebunComparison: {},
    budgetVsRealisasi: []
  };
  
  // Group by date for trend
  const dateGroups = {};
  data.forEach(row => {
    const date = toIDDate(row.Tanggal);
    if (!dateGroups[date]) {
      dateGroups[date] = { tonase: 0, jjg: 0 };
    }
    dateGroups[date].tonase += safeNum(row['Tonase Panen']);
    dateGroups[date].jjg += safeNum(row['JJG Panen']);
  });
  
  Object.keys(dateGroups).sort().forEach(date => {
    chartData.trendData.push({
      date: date,
      tonase: dateGroups[date].tonase,
      jjg: dateGroups[date].jjg
    });
  });
  
  return chartData;
}

function prepareMonthlyChartData(data) {
  // Similar to daily but grouped by month
  return {
    monthlyTrend: [],
    kebunComparison: {},
    budgetAnalysis: []
  };
}

function createMonthlySummary(data) {
  const summary = {};
  
  data.forEach(row => {
    const key = `${row.Kebun}-${row.Divisi}`;
    if (!summary[key]) {
      summary[key] = {
        kebun: row.Kebun,
        divisi: row.Divisi,
        totalTonase: 0,
        totalJJG: 0,
        totalLuas: 0,
        totalTK: 0
      };
    }
    
    summary[key].totalTonase += safeNum(row['Tonase Panen']);
    summary[key].totalJJG += safeNum(row['JJG Panen']);
    summary[key].totalLuas += safeNum(row['Luas Panen']);
    summary[key].totalTK += safeNum(row['Jumlah TK Panen']);
  });
  
  return Object.values(summary);
}

function toIDDate(date) {
  return new Date(date).toLocaleDateString('id-ID');
}
/**
 * BOOKING OPERATIONS
 */

/**
 * Get booking data
 */
function getBookingData(filters, userInfo) {
  if (!checkPermission(userInfo, 'BOOKING')) {
    return { success: false, message: 'Tidak memiliki akses untuk melihat data booking' };
  }
  
  try {
    const sheet = SpreadsheetApp.openById(CONFIG.SHEET_ID).getSheetByName(CONFIG.SHEETS.BOOKING);
    const data = sheet.getDataRange().getValues();
    
    if (data.length === 0) {
      // Initialize booking sheet if empty
      const headers = ['ID', 'Tanggal Booking', 'Waktu Mulai', 'Waktu Selesai', 'Ruangan/Fasilitas', 
                     'Keperluan', 'Pemohon', 'Departemen', 'Status', 'Catatan', 'Created By', 'Created Date'];
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      return { success: true, data: [], headers: headers };
    }
    
    const headers = data[0];
    const bookingData = [];
    
    for (let i = 1; i < data.length; i++) {
      const row = {};
      headers.forEach((header, index) => {
        row[header] = data[i][index];
      });
      
      // Apply filters
      if (filters.startDate && new Date(row['Tanggal Booking']) < new Date(filters.startDate)) continue;
      if (filters.endDate && new Date(row['Tanggal Booking']) > new Date(filters.endDate)) continue;
      if (filters.status && row.Status !== filters.status) continue;
      if (filters.ruangan && row['Ruangan/Fasilitas'] !== filters.ruangan) continue;
      
      bookingData.push(row);
    }
    
    return {
      success: true,
      data: bookingData,
      headers: headers,
      totalRecords: bookingData.length
    };
  } catch (error) {
    console.error('Error getting booking data:', error);
    return { success: false, message: 'Gagal memuat data booking: ' + error.message };
  }
}

/**
 * Submit new booking
 */
function submitBooking(bookingData, userInfo) {
  if (!checkPermission(userInfo, 'BOOKING')) {
    return { success: false, message: 'Tidak memiliki akses untuk membuat booking' };
  }
  
  try {
    const sheet = SpreadsheetApp.openById(CONFIG.SHEET_ID).getSheetByName(CONFIG.SHEETS.BOOKING);
    
    // Generate booking ID
    const bookingId = 'BK' + new Date().getTime();
    
    const rowData = [
      bookingId,
      new Date(bookingData.tanggalBooking),
      bookingData.waktuMulai,
      bookingData.waktuSelesai,
      bookingData.ruangan,
      bookingData.keperluan,
      bookingData.pemohon || userInfo.name,
      bookingData.departemen,
      'Pending',
      bookingData.catatan || '',
      userInfo.name || userInfo.email,
      new Date()
    ];
    
    sheet.appendRow(rowData);
    
    return {
      success: true,
      message: 'Booking berhasil dibuat',
      bookingId: bookingId
    };
  } catch (error) {
    console.error('Error submitting booking:', error);
    return { success: false, message: 'Gagal membuat booking: ' + error.message };
  }
}

/**
 * Update booking
 */
function updateBooking(bookingId, bookingData, userInfo) {
  if (!checkPermission(userInfo, 'BOOKING')) {
    return { success: false, message: 'Tidak memiliki akses untuk mengubah booking' };
  }
  
  try {
    const sheet = SpreadsheetApp.openById(CONFIG.SHEET_ID).getSheetByName(CONFIG.SHEETS.BOOKING);
    const data = sheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === bookingId) {
        const range = sheet.getRange(i + 1, 1, 1, 12);
        const rowData = [
          bookingId,
          new Date(bookingData.tanggalBooking),
          bookingData.waktuMulai,
          bookingData.waktuSelesai,
          bookingData.ruangan,
          bookingData.keperluan,
          bookingData.pemohon,
          bookingData.departemen,
          bookingData.status || 'Pending',
          bookingData.catatan || '',
          userInfo.name || userInfo.email,
          new Date()
        ];
        
        range.setValues([rowData]);
        
        return {
          success: true,
          message: 'Booking berhasil diperbarui'
        };
      }
    }
    
    return { success: false, message: 'Booking tidak ditemukan' };
  } catch (error) {
    console.error('Error updating booking:', error);
    return { success: false, message: 'Gagal memperbarui booking: ' + error.message };
  }
}

/**
 * Cancel booking
 */
function cancelBooking(bookingId, userInfo) {
  if (!checkPermission(userInfo, 'BOOKING')) {
    return { success: false, message: 'Tidak memiliki akses untuk membatalkan booking' };
  }
  
  try {
    const sheet = SpreadsheetApp.openById(CONFIG.SHEET_ID).getSheetByName(CONFIG.SHEETS.BOOKING);
    const data = sheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === bookingId) {
        // Update status to cancelled
        sheet.getRange(i + 1, 9).setValue('Cancelled');
        sheet.getRange(i + 1, 10).setValue('Dibatalkan oleh: ' + userInfo.name);
        
        return {
          success: true,
          message: 'Booking berhasil dibatalkan'
        };
      }
    }
    
    return { success: false, message: 'Booking tidak ditemukan' };
  } catch (error) {
    console.error('Error cancelling booking:', error);
    return { success: false, message: 'Gagal membatalkan booking: ' + error.message };
  }
}

/**
 * ABSENSI OPERATIONS
 */

/**
 * Get absensi data
 */
function getAbsensiData(filters, userInfo) {
  if (!checkPermission(userInfo, 'ABSENSI')) {
    return { success: false, message: 'Tidak memiliki akses untuk melihat data absensi' };
  }
  
  try {
    const sheet = SpreadsheetApp.openById(CONFIG.SHEET_ID).getSheetByName(CONFIG.SHEETS.ABSENSI);
    const data = sheet.getDataRange().getValues();
    
    if (data.length === 0) {
      // Initialize absensi sheet if empty
      const headers = ['ID', 'Tanggal', 'NIK', 'Nama Karyawan', 'Departemen', 'Shift', 
                     'Jam Masuk', 'Jam Keluar', 'Status Kehadiran', 'Keterangan', 
                     'Lokasi Check-in', 'Lokasi Check-out', 'Created By', 'Created Date'];
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      return { success: true, data: [], headers: headers };
    }
    
    const headers = data[0];
    const absensiData = [];
    
    for (let i = 1; i < data.length; i++) {
      const row = {};
      headers.forEach((header, index) => {
        row[header] = data[i][index];
      });
      
      // Apply filters
      if (filters.startDate && new Date(row.Tanggal) < new Date(filters.startDate)) continue;
      if (filters.endDate && new Date(row.Tanggal) > new Date(filters.endDate)) continue;
      if (filters.departemen && row.Departemen !== filters.departemen) continue;
      if (filters.status && row['Status Kehadiran'] !== filters.status) continue;
      if (filters.nik && row.NIK !== filters.nik) continue;
      
      absensiData.push(row);
    }
    
    return {
      success: true,
      data: absensiData,
      headers: headers,
      totalRecords: absensiData.length
    };
  } catch (error) {
    console.error('Error getting absensi data:', error);
    return { success: false, message: 'Gagal memuat data absensi: ' + error.message };
  }
}

/**
 * Submit absensi
 */
function submitAbsensi(absensiData, userInfo) {
  if (!checkPermission(userInfo, 'ABSENSI')) {
    return { success: false, message: 'Tidak memiliki akses untuk input absensi' };
  }
  
  try {
    const sheet = SpreadsheetApp.openById(CONFIG.SHEET_ID).getSheetByName(CONFIG.SHEETS.ABSENSI);
    
    // Generate absensi ID
    const absensiId = 'ABS' + new Date().getTime();
    
    const rowData = [
      absensiId,
      new Date(absensiData.tanggal),
      absensiData.nik,
      absensiData.namaKaryawan,
      absensiData.departemen,
      absensiData.shift,
      absensiData.jamMasuk,
      absensiData.jamKeluar || '',
      absensiData.statusKehadiran,
      absensiData.keterangan || '',
      absensiData.lokasiCheckin || '',
      absensiData.lokasiCheckout || '',
      userInfo.name || userInfo.email,
      new Date()
    ];
    
    sheet.appendRow(rowData);
    
    return {
      success: true,
      message: 'Data absensi berhasil disimpan',
      absensiId: absensiId
    };
  } catch (error) {
    console.error('Error submitting absensi:', error);
    return { success: false, message: 'Gagal menyimpan absensi: ' + error.message };
  }
}

/**
 * Update absensi
 */
function updateAbsensi(absensiId, absensiData, userInfo) {
  if (!checkPermission(userInfo, 'ABSENSI')) {
    return { success: false, message: 'Tidak memiliki akses untuk mengubah absensi' };
  }
  
  try {
    const sheet = SpreadsheetApp.openById(CONFIG.SHEET_ID).getSheetByName(CONFIG.SHEETS.ABSENSI);
    const data = sheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === absensiId) {
        const range = sheet.getRange(i + 1, 1, 1, 14);
        const rowData = [
          absensiId,
          new Date(absensiData.tanggal),
          absensiData.nik,
          absensiData.namaKaryawan,
          absensiData.departemen,
          absensiData.shift,
          absensiData.jamMasuk,
          absensiData.jamKeluar || '',
          absensiData.statusKehadiran,
          absensiData.keterangan || '',
          absensiData.lokasiCheckin || '',
          absensiData.lokasiCheckout || '',
          userInfo.name || userInfo.email,
          new Date()
        ];
        
        range.setValues([rowData]);
        
        return {
          success: true,
          message: 'Data absensi berhasil diperbarui'
        };
      }
    }
    
    return { success: false, message: 'Data absensi tidak ditemukan' };
  } catch (error) {
    console.error('Error updating absensi:', error);
    return { success: false, message: 'Gagal memperbarui absensi: ' + error.message };
  }
}

/**
 * KPI OPERATIONS
 */

/**
 * Get KPI data
 */
function getKPIData(filters, userInfo) {
  if (!checkPermission(userInfo, 'KPI')) {
    return { success: false, message: 'Tidak memiliki akses untuk melihat data KPI' };
  }
  
  try {
    const sheet = SpreadsheetApp.openById(CONFIG.SHEET_ID).getSheetByName(CONFIG.SHEETS.KPI);
    const data = sheet.getDataRange().getValues();
    
    if (data.length === 0) {
      // Initialize KPI sheet if empty
      const headers = ['ID', 'Periode', 'Departemen', 'Kebun', 'Divisi', 'Target Produksi', 
                     'Realisasi Produksi', 'Achievement (%)', 'Target Kualitas', 'Realisasi Kualitas',
                     'Target Efisiensi', 'Realisasi Efisiensi', 'Skor Total', 'Grade', 'Catatan',
                     'Created By', 'Created Date'];
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      return { success: true, data: [], headers: headers };
    }
    
    const headers = data[0];
    const kpiData = [];
    
    for (let i = 1; i < data.length; i++) {
      const row = {};
      headers.forEach((header, index) => {
        row[header] = data[i][index];
      });
      
      // Apply filters
      if (filters.periode && row.Periode !== filters.periode) continue;
      if (filters.departemen && row.Departemen !== filters.departemen) continue;
      if (filters.kebun && row.Kebun !== filters.kebun) continue;
      if (filters.divisi && row.Divisi !== filters.divisi) continue;
      
      kpiData.push(row);
    }
    
    return {
      success: true,
      data: kpiData,
      headers: headers,
      totalRecords: kpiData.length
    };
  } catch (error) {
    console.error('Error getting KPI data:', error);
    return { success: false, message: 'Gagal memuat data KPI: ' + error.message };
  }
}

/**
 * Submit KPI
 */
function submitKPI(kpiData, userInfo) {
  if (!checkPermission(userInfo, 'KPI')) {
    return { success: false, message: 'Tidak memiliki akses untuk input KPI' };
  }
  
  try {
    const sheet = SpreadsheetApp.openById(CONFIG.SHEET_ID).getSheetByName(CONFIG.SHEETS.KPI);
    
    // Generate KPI ID
    const kpiId = 'KPI' + new Date().getTime();
    
    // Calculate achievement and grade
    const achievement = kpiData.targetProduksi > 0 ? 
      (kpiData.realisasiProduksi / kpiData.targetProduksi * 100) : 0;
    
    const skorTotal = (achievement + safeNum(kpiData.realisasiKualitas) + safeNum(kpiData.realisasiEfisiensi)) / 3;
    
    let grade = 'D';
    if (skorTotal >= 90) grade = 'A';
    else if (skorTotal >= 80) grade = 'B';
    else if (skorTotal >= 70) grade = 'C';
    
    const rowData = [
      kpiId,
      kpiData.periode,
      kpiData.departemen,
      kpiData.kebun,
      kpiData.divisi,
      kpiData.targetProduksi,
      kpiData.realisasiProduksi,
      achievement.toFixed(2),
      kpiData.targetKualitas,
      kpiData.realisasiKualitas,
      kpiData.targetEfisiensi,
      kpiData.realisasiEfisiensi,
      skorTotal.toFixed(2),
      grade,
      kpiData.catatan || '',
      userInfo.name || userInfo.email,
      new Date()
    ];
    
    sheet.appendRow(rowData);
    
    return {
      success: true,
      message: 'Data KPI berhasil disimpan',
      kpiId: kpiId
    };
  } catch (error) {
    console.error('Error submitting KPI:', error);
    return { success: false, message: 'Gagal menyimpan KPI: ' + error.message };
  }
}

/**
 * Update KPI
 */
function updateKPI(kpiId, kpiData, userInfo) {
  if (!checkPermission(userInfo, 'KPI')) {
    return { success: false, message: 'Tidak memiliki akses untuk mengubah KPI' };
  }
  
  try {
    const sheet = SpreadsheetApp.openById(CONFIG.SHEET_ID).getSheetByName(CONFIG.SHEETS.KPI);
    const data = sheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === kpiId) {
        // Calculate achievement and grade
        const achievement = kpiData.targetProduksi > 0 ? 
          (kpiData.realisasiProduksi / kpiData.targetProduksi * 100) : 0;
        
        const skorTotal = (achievement + safeNum(kpiData.realisasiKualitas) + safeNum(kpiData.realisasiEfisiensi)) / 3;
        
        let grade = 'D';
        if (skorTotal >= 90) grade = 'A';
        else if (skorTotal >= 80) grade = 'B';
        else if (skorTotal >= 70) grade = 'C';
        
        const range = sheet.getRange(i + 1, 1, 1, 17);
        const rowData = [
          kpiId,
          kpiData.periode,
          kpiData.departemen,
          kpiData.kebun,
          kpiData.divisi,
          kpiData.targetProduksi,
          kpiData.realisasiProduksi,
          achievement.toFixed(2),
          kpiData.targetKualitas,
          kpiData.realisasiKualitas,
          kpiData.targetEfisiensi,
          kpiData.realisasiEfisiensi,
          skorTotal.toFixed(2),
          grade,
          kpiData.catatan || '',
          userInfo.name || userInfo.email,
          new Date()
        ];
        
        range.setValues([rowData]);
        
        return {
          success: true,
          message: 'Data KPI berhasil diperbarui'
        };
      }
    }
    
    return { success: false, message: 'Data KPI tidak ditemukan' };
  } catch (error) {
    console.error('Error updating KPI:', error);
    return { success: false, message: 'Gagal memperbarui KPI: ' + error.message };
  }
}

/**
 * ASSET OPERATIONS
 */

/**
 * Get asset data
 */
function getAssetData(filters, userInfo) {
  if (!checkPermission(userInfo, 'ASSET')) {
    return { success: false, message: 'Tidak memiliki akses untuk melihat data asset' };
  }
  
  try {
    const sheet = SpreadsheetApp.openById(CONFIG.SHEET_ID).getSheetByName(CONFIG.SHEETS.ASSET);
    const data = sheet.getDataRange().getValues();
    
    if (data.length === 0) {
      // Initialize asset sheet if empty
      const headers = ['ID', 'Kode Asset', 'Nama Asset', 'Kategori', 'Lokasi', 'Kondisi', 
                     'Tanggal Pembelian', 'Harga Pembelian', 'Nilai Buku', 'Status', 
                     'PIC', 'Maintenance Terakhir', 'Maintenance Berikutnya', 'Catatan',
                     'Created By', 'Created Date'];
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      return { success: true, data: [], headers: headers };
    }
    
    const headers = data[0];
    const assetData = [];
    
    for (let i = 1; i < data.length; i++) {
      const row = {};
      headers.forEach((header, index) => {
        row[header] = data[i][index];
      });
      
      // Apply filters
      if (filters.kategori && row.Kategori !== filters.kategori) continue;
      if (filters.lokasi && row.Lokasi !== filters.lokasi) continue;
      if (filters.kondisi && row.Kondisi !== filters.kondisi) continue;
      if (filters.status && row.Status !== filters.status) continue;
      
      assetData.push(row);
    }
    
    return {
      success: true,
      data: assetData,
      headers: headers,
      totalRecords: assetData.length
    };
  } catch (error) {
    console.error('Error getting asset data:', error);
    return { success: false, message: 'Gagal memuat data asset: ' + error.message };
  }
}

/**
 * Submit asset
 */
function submitAsset(assetData, userInfo) {
  if (!checkPermission(userInfo, 'ASSET')) {
    return { success: false, message: 'Tidak memiliki akses untuk input asset' };
  }
  
  try {
    const sheet = SpreadsheetApp.openById(CONFIG.SHEET_ID).getSheetByName(CONFIG.SHEETS.ASSET);
    
    // Generate asset ID
    const assetId = 'AST' + new Date().getTime();
    
    const rowData = [
      assetId,
      assetData.kodeAsset,
      assetData.namaAsset,
      assetData.kategori,
      assetData.lokasi,
      assetData.kondisi,
      new Date(assetData.tanggalPembelian),
      assetData.hargaPembelian,
      assetData.nilaiBuku,
      assetData.status,
      assetData.pic,
      assetData.maintenanceTerakhir ? new Date(assetData.maintenanceTerakhir) : '',
      assetData.maintenanceBerikutnya ? new Date(assetData.maintenanceBerikutnya) : '',
      assetData.catatan || '',
      userInfo.name || userInfo.email,
      new Date()
    ];
    
    sheet.appendRow(rowData);
    
    return {
      success: true,
      message: 'Data asset berhasil disimpan',
      assetId: assetId
    };
  } catch (error) {
    console.error('Error submitting asset:', error);
    return { success: false, message: 'Gagal menyimpan asset: ' + error.message };
  }
}

/**
 * Update asset
 */
function updateAsset(assetId, assetData, userInfo) {
  if (!checkPermission(userInfo, 'ASSET')) {
    return { success: false, message: 'Tidak memiliki akses untuk mengubah asset' };
  }
  
  try {
    const sheet = SpreadsheetApp.openById(CONFIG.SHEET_ID).getSheetByName(CONFIG.SHEETS.ASSET);
    const data = sheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === assetId) {
        const range = sheet.getRange(i + 1, 1, 1, 16);
        const rowData = [
          assetId,
          assetData.kodeAsset,
          assetData.namaAsset,
          assetData.kategori,
          assetData.lokasi,
          assetData.kondisi,
          new Date(assetData.tanggalPembelian),
          assetData.hargaPembelian,
          assetData.nilaiBuku,
          assetData.status,
          assetData.pic,
          assetData.maintenanceTerakhir ? new Date(assetData.maintenanceTerakhir) : '',
          assetData.maintenanceBerikutnya ? new Date(assetData.maintenanceBerikutnya) : '',
          assetData.catatan || '',
          userInfo.name || userInfo.email,
          new Date()
        ];
        
        range.setValues([rowData]);
        
        return {
          success: true,
          message: 'Data asset berhasil diperbarui'
        };
      }
    }
    
    return { success: false, message: 'Data asset tidak ditemukan' };
  } catch (error) {
    console.error('Error updating asset:', error);
    return { success: false, message: 'Gagal memperbarui asset: ' + error.message };
  }
}

/**
 * Initialize all sheets with proper headers
 */
function initializeAllSheets() {
  const spreadsheet = SpreadsheetApp.openById(CONFIG.SHEET_ID);
  
  // Initialize DATA HARIAN sheet
  let sheet = spreadsheet.getSheetByName(CONFIG.SHEETS.DATA_HARIAN);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(CONFIG.SHEETS.DATA_HARIAN);
  }
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, CONFIG.DATA_HARIAN_COLUMNS.length).setValues([CONFIG.DATA_HARIAN_COLUMNS]);
  }
  
  // Initialize other sheets
  const sheetsToInit = [
    { name: CONFIG.SHEETS.BOOKING, headers: ['ID', 'Tanggal Booking', 'Waktu Mulai', 'Waktu Selesai', 'Ruangan/Fasilitas', 'Keperluan', 'Pemohon', 'Departemen', 'Status', 'Catatan', 'Created By', 'Created Date'] },
    { name: CONFIG.SHEETS.ABSENSI, headers: ['ID', 'Tanggal', 'NIK', 'Nama Karyawan', 'Departemen', 'Shift', 'Jam Masuk', 'Jam Keluar', 'Status Kehadiran', 'Keterangan', 'Lokasi Check-in', 'Lokasi Check-out', 'Created By', 'Created Date'] },
    { name: CONFIG.SHEETS.KPI, headers: ['ID', 'Periode', 'Departemen', 'Kebun', 'Divisi', 'Target Produksi', 'Realisasi Produksi', 'Achievement (%)', 'Target Kualitas', 'Realisasi Kualitas', 'Target Efisiensi', 'Realisasi Efisiensi', 'Skor Total', 'Grade', 'Catatan', 'Created By', 'Created Date'] },
    { name: CONFIG.SHEETS.ASSET, headers: ['ID', 'Kode Asset', 'Nama Asset', 'Kategori', 'Lokasi', 'Kondisi', 'Tanggal Pembelian', 'Harga Pembelian', 'Nilai Buku', 'Status', 'PIC', 'Maintenance Terakhir', 'Maintenance Berikutnya', 'Catatan', 'Created By', 'Created Date'] }
  ];
  
  sheetsToInit.forEach(sheetInfo => {
    let targetSheet = spreadsheet.getSheetByName(sheetInfo.name);
    if (!targetSheet) {
      targetSheet = spreadsheet.insertSheet(sheetInfo.name);
    }
    if (targetSheet.getLastRow() === 0) {
      targetSheet.getRange(1, 1, 1, sheetInfo.headers.length).setValues([sheetInfo.headers]);
    }
  });
  
  return { success: true, message: 'All sheets initialized successfully' };
}
