/**
 * Google Apps Script API untuk Asset/KPI - Portal Karyawan SAG
 * Sheet: https://docs.google.com/spreadsheets/d/1kgLyl_lGOPONQC6bOLndERodR17QkDnRRllN4I8tJPQ/edit
 */

// Configuration
const CONFIG = {
  SHEET_ID: '1kgLyl_lGOPONQC6bOLndERodR17QkDnRRllN4I8tJPQ',
  SHEETS: {
    ASSET: 'ASSET'
  },
  ASSET_COLUMNS: [
    'ID', 'Periode', 'Departemen', 'Kebun', 'Divisi', 
    'Target/Realisasi Produksi/Kualitas/Efisiensi', 'Achievement (%)', 
    'Skor Total', 'Grade', 'Catatan', 'Created By', 'Created Date'
  ]
};

/**
 * Handle CORS and routing for all requests
 */
function doGet(e) {
  return createCORSResponse({ success: true, message: 'Asset/KPI API is running' });
}

function doPost(e) {
  try {
    const requestData = JSON.parse(e.postData.contents);
    const action = requestData.action;
    
    let response;
    
    switch(action) {
      case 'getAssets':
        response = getAssets(requestData);
        break;
      case 'addAsset':
        response = addAsset(requestData);
        break;
      case 'updateAsset':
        response = updateAsset(requestData);
        break;
      case 'deleteAsset':
        response = deleteAsset(requestData);
        break;
      case 'getAssetsByPeriode':
        response = getAssetsByPeriode(requestData);
        break;
      case 'getAssetsByDepartemen':
        response = getAssetsByDepartemen(requestData);
        break;
      case 'getKPISummary':
        response = getKPISummary(requestData);
        break;
      case 'calculateGrade':
        response = calculateGrade(requestData);
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
  
  return output;
}

/**
 * Get all asset/KPI data with optional filters
 */
function getAssets(data) {
  try {
    const sheet = SpreadsheetApp.openById(CONFIG.SHEET_ID).getSheetByName(CONFIG.SHEETS.ASSET);
    const values = sheet.getDataRange().getValues();
    
    if (values.length <= 1) {
      return { success: true, data: [] };
    }
    
    const headers = values[0];
    const rows = values.slice(1);
    
    let assetData = rows.map(row => {
      const obj = {};
      headers.forEach((header, index) => {
        obj[header] = row[index] || '';
      });
      return obj;
    });
    
    // Apply filters if provided
    if (data.filters) {
      if (data.filters.periode) {
        assetData = assetData.filter(item => 
          item.Periode.toLowerCase().includes(data.filters.periode.toLowerCase())
        );
      }
      
      if (data.filters.departemen) {
        assetData = assetData.filter(item => 
          item.Departemen.toLowerCase().includes(data.filters.departemen.toLowerCase())
        );
      }
      
      if (data.filters.kebun) {
        assetData = assetData.filter(item => 
          item.Kebun.toLowerCase().includes(data.filters.kebun.toLowerCase())
        );
      }
      
      if (data.filters.divisi) {
        assetData = assetData.filter(item => 
          item.Divisi.toLowerCase().includes(data.filters.divisi.toLowerCase())
        );
      }
      
      if (data.filters.grade) {
        assetData = assetData.filter(item => 
          item.Grade.toLowerCase() === data.filters.grade.toLowerCase()
        );
      }
    }
    
    return { success: true, data: assetData };
    
  } catch (error) {
    console.error('Error in getAssets:', error);
    return { success: false, message: error.toString() };
  }
}

/**
 * Add new asset/KPI record
 */
function addAsset(data) {
  try {
    const sheet = SpreadsheetApp.openById(CONFIG.SHEET_ID).getSheetByName(CONFIG.SHEETS.ASSET);
    
    // Generate new ID
    const lastRow = sheet.getLastRow();
    const newId = lastRow > 1 ? parseInt(sheet.getRange(lastRow, 1).getValue()) + 1 : 1;
    
    // Calculate grade based on achievement
    const achievement = parseFloat(data.achievement) || 0;
    const grade = calculateGradeFromAchievement(achievement);
    
    const newRow = [
      newId,
      data.periode || '',
      data.departemen || '',
      data.kebun || '',
      data.divisi || '',
      data.targetRealisasi || '',
      achievement,
      data.skorTotal || achievement,
      grade,
      data.catatan || '',
      data.createdBy || 'System',
      new Date().toISOString()
    ];
    
    sheet.appendRow(newRow);
    
    return { 
      success: true, 
      message: 'Data Asset/KPI berhasil ditambahkan',
      id: newId,
      grade: grade
    };
    
  } catch (error) {
    console.error('Error in addAsset:', error);
    return { success: false, message: error.toString() };
  }
}

/**
 * Update asset/KPI record
 */
function updateAsset(data) {
  try {
    const sheet = SpreadsheetApp.openById(CONFIG.SHEET_ID).getSheetByName(CONFIG.SHEETS.ASSET);
    const values = sheet.getDataRange().getValues();
    
    // Find row by ID
    let rowIndex = -1;
    for (let i = 1; i < values.length; i++) {
      if (values[i][0] == data.id) {
        rowIndex = i + 1;
        break;
      }
    }
    
    if (rowIndex === -1) {
      return { success: false, message: 'Data Asset/KPI tidak ditemukan' };
    }
    
    // Calculate grade if achievement is updated
    let grade = values[rowIndex-1][8]; // Keep existing grade
    if (data.achievement !== undefined) {
      const achievement = parseFloat(data.achievement) || 0;
      grade = calculateGradeFromAchievement(achievement);
    }
    
    // Update the row
    const updatedRow = [
      data.id,
      data.periode || values[rowIndex-1][1],
      data.departemen || values[rowIndex-1][2],
      data.kebun || values[rowIndex-1][3],
      data.divisi || values[rowIndex-1][4],
      data.targetRealisasi || values[rowIndex-1][5],
      data.achievement !== undefined ? parseFloat(data.achievement) : values[rowIndex-1][6],
      data.skorTotal !== undefined ? parseFloat(data.skorTotal) : values[rowIndex-1][7],
      grade,
      data.catatan || values[rowIndex-1][9],
      values[rowIndex-1][10], // Keep original Created By
      values[rowIndex-1][11]  // Keep original Created Date
    ];
    
    sheet.getRange(rowIndex, 1, 1, updatedRow.length).setValues([updatedRow]);
    
    return { 
      success: true, 
      message: 'Data Asset/KPI berhasil diupdate',
      grade: grade
    };
    
  } catch (error) {
    console.error('Error in updateAsset:', error);
    return { success: false, message: error.toString() };
  }
}

/**
 * Delete asset/KPI record
 */
function deleteAsset(data) {
  try {
    const sheet = SpreadsheetApp.openById(CONFIG.SHEET_ID).getSheetByName(CONFIG.SHEETS.ASSET);
    const values = sheet.getDataRange().getValues();
    
    // Find row by ID
    let rowIndex = -1;
    for (let i = 1; i < values.length; i++) {
      if (values[i][0] == data.id) {
        rowIndex = i + 1;
        break;
      }
    }
    
    if (rowIndex === -1) {
      return { success: false, message: 'Data Asset/KPI tidak ditemukan' };
    }
    
    sheet.deleteRow(rowIndex);
    
    return { success: true, message: 'Data Asset/KPI berhasil dihapus' };
    
  } catch (error) {
    console.error('Error in deleteAsset:', error);
    return { success: false, message: error.toString() };
  }
}

/**
 * Get assets by periode
 */
function getAssetsByPeriode(data) {
  try {
    const filters = {
      periode: data.periode
    };
    
    return getAssets({ filters: filters });
    
  } catch (error) {
    console.error('Error in getAssetsByPeriode:', error);
    return { success: false, message: error.toString() };
  }
}

/**
 * Get assets by departemen
 */
function getAssetsByDepartemen(data) {
  try {
    const filters = {
      departemen: data.departemen
    };
    
    return getAssets({ filters: filters });
    
  } catch (error) {
    console.error('Error in getAssetsByDepartemen:', error);
    return { success: false, message: error.toString() };
  }
}

/**
 * Get KPI summary
 */
function getKPISummary(data) {
  try {
    const allData = getAssets(data);
    if (!allData.success) return allData;
    
    const assets = allData.data;
    
    // Calculate summary statistics
    const summary = {
      totalRecords: assets.length,
      averageAchievement: 0,
      gradeDistribution: {
        'A': 0,
        'B': 0,
        'C': 0,
        'D': 0,
        'F': 0
      },
      departemenSummary: {},
      kebunSummary: {}
    };
    
    let totalAchievement = 0;
    
    assets.forEach(asset => {
      // Calculate average achievement
      const achievement = parseFloat(asset['Achievement (%)']) || 0;
      totalAchievement += achievement;
      
      // Count grade distribution
      const grade = asset.Grade || 'F';
      if (summary.gradeDistribution[grade] !== undefined) {
        summary.gradeDistribution[grade]++;
      }
      
      // Departemen summary
      const dept = asset.Departemen || 'Unknown';
      if (!summary.departemenSummary[dept]) {
        summary.departemenSummary[dept] = {
          count: 0,
          totalAchievement: 0,
          averageAchievement: 0
        };
      }
      summary.departemenSummary[dept].count++;
      summary.departemenSummary[dept].totalAchievement += achievement;
      summary.departemenSummary[dept].averageAchievement = 
        summary.departemenSummary[dept].totalAchievement / summary.departemenSummary[dept].count;
      
      // Kebun summary
      const kebun = asset.Kebun || 'Unknown';
      if (!summary.kebunSummary[kebun]) {
        summary.kebunSummary[kebun] = {
          count: 0,
          totalAchievement: 0,
          averageAchievement: 0
        };
      }
      summary.kebunSummary[kebun].count++;
      summary.kebunSummary[kebun].totalAchievement += achievement;
      summary.kebunSummary[kebun].averageAchievement = 
        summary.kebunSummary[kebun].totalAchievement / summary.kebunSummary[kebun].count;
    });
    
    summary.averageAchievement = assets.length > 0 ? totalAchievement / assets.length : 0;
    
    return { success: true, data: summary };
    
  } catch (error) {
    console.error('Error in getKPISummary:', error);
    return { success: false, message: error.toString() };
  }
}

/**
 * Calculate grade based on achievement percentage
 */
function calculateGrade(data) {
  try {
    const achievement = parseFloat(data.achievement) || 0;
    const grade = calculateGradeFromAchievement(achievement);
    
    return { 
      success: true, 
      grade: grade,
      achievement: achievement
    };
    
  } catch (error) {
    console.error('Error in calculateGrade:', error);
    return { success: false, message: error.toString() };
  }
}

/**
 * Helper function to calculate grade from achievement percentage
 */
function calculateGradeFromAchievement(achievement) {
  if (achievement >= 90) return 'A';
  if (achievement >= 80) return 'B';
  if (achievement >= 70) return 'C';
  if (achievement >= 60) return 'D';
  return 'F';
}
