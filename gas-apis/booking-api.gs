/**
 * Google Apps Script API untuk Booking - Portal Karyawan SAG
 * Sheet: https://docs.google.com/spreadsheets/d/1dPpQKnjNFvVssl12at6hC8416Atmr4GWrNspMRaLOiA/edit
 */

// Configuration
const CONFIG = {
  SHEET_ID: '1dPpQKnjNFvVssl12at6hC8416Atmr4GWrNspMRaLOiA',
  SHEETS: {
    BOOKING: 'BOOKING'
  },
  BOOKING_COLUMNS: [
    'ID', 'Tanggal Booking', 'Waktu Mulai/Selesai', 'Ruangan/Fasilitas', 
    'Keperluan', 'Pemohon', 'Departemen', 'Status', 'Catatan', 
    'Created By', 'Created Date'
  ]
};

/**
 * Handle CORS and routing for all requests
 */
function doGet(e) {
  return createCORSResponse({ success: true, message: 'Booking API is running' });
}

function doPost(e) {
  try {
    const requestData = JSON.parse(e.postData.contents);
    const action = requestData.action;
    
    let response;
    
    switch(action) {
      case 'getBookings':
        response = getBookings(requestData);
        break;
      case 'addBooking':
        response = addBooking(requestData);
        break;
      case 'updateBooking':
        response = updateBooking(requestData);
        break;
      case 'deleteBooking':
        response = deleteBooking(requestData);
        break;
      case 'approveBooking':
        response = approveBooking(requestData);
        break;
      case 'rejectBooking':
        response = rejectBooking(requestData);
        break;
      case 'getBookingsByDate':
        response = getBookingsByDate(requestData);
        break;
      case 'getBookingsByRoom':
        response = getBookingsByRoom(requestData);
        break;
      case 'checkAvailability':
        response = checkAvailability(requestData);
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
 * Get all booking data with optional filters
 */
function getBookings(data) {
  try {
    const sheet = SpreadsheetApp.openById(CONFIG.SHEET_ID).getSheetByName(CONFIG.SHEETS.BOOKING);
    const values = sheet.getDataRange().getValues();
    
    if (values.length <= 1) {
      return { success: true, data: [] };
    }
    
    const headers = values[0];
    const rows = values.slice(1);
    
    let bookingData = rows.map(row => {
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
        bookingData = bookingData.filter(item => {
          const itemDate = new Date(item['Tanggal Booking']);
          return itemDate >= startDate && itemDate <= endDate;
        });
      }
      
      if (data.filters.ruangan) {
        bookingData = bookingData.filter(item => 
          item['Ruangan/Fasilitas'].toLowerCase().includes(data.filters.ruangan.toLowerCase())
        );
      }
      
      if (data.filters.status) {
        bookingData = bookingData.filter(item => 
          item.Status.toLowerCase() === data.filters.status.toLowerCase()
        );
      }
      
      if (data.filters.pemohon) {
        bookingData = bookingData.filter(item => 
          item.Pemohon.toLowerCase().includes(data.filters.pemohon.toLowerCase())
        );
      }
    }
    
    return { success: true, data: bookingData };
    
  } catch (error) {
    console.error('Error in getBookings:', error);
    return { success: false, message: error.toString() };
  }
}

/**
 * Add new booking
 */
function addBooking(data) {
  try {
    const sheet = SpreadsheetApp.openById(CONFIG.SHEET_ID).getSheetByName(CONFIG.SHEETS.BOOKING);
    
    // Check availability first
    const availabilityCheck = checkAvailability({
      tanggalBooking: data.tanggalBooking,
      waktuMulaiSelesai: data.waktuMulaiSelesai,
      ruanganFasilitas: data.ruanganFasilitas
    });
    
    if (!availabilityCheck.success || !availabilityCheck.available) {
      return { 
        success: false, 
        message: 'Ruangan/fasilitas tidak tersedia pada waktu yang dipilih' 
      };
    }
    
    // Generate new ID
    const lastRow = sheet.getLastRow();
    const newId = lastRow > 1 ? parseInt(sheet.getRange(lastRow, 1).getValue()) + 1 : 1;
    
    const newRow = [
      newId,
      data.tanggalBooking || new Date().toISOString().split('T')[0],
      data.waktuMulaiSelesai || '',
      data.ruanganFasilitas || '',
      data.keperluan || '',
      data.pemohon || '',
      data.departemen || '',
      data.status || 'Pending',
      data.catatan || '',
      data.createdBy || 'System',
      new Date().toISOString()
    ];
    
    sheet.appendRow(newRow);
    
    return { 
      success: true, 
      message: 'Booking berhasil ditambahkan',
      id: newId
    };
    
  } catch (error) {
    console.error('Error in addBooking:', error);
    return { success: false, message: error.toString() };
  }
}

/**
 * Update booking
 */
function updateBooking(data) {
  try {
    const sheet = SpreadsheetApp.openById(CONFIG.SHEET_ID).getSheetByName(CONFIG.SHEETS.BOOKING);
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
      return { success: false, message: 'Booking tidak ditemukan' };
    }
    
    // Check availability if time/room is being changed
    if (data.tanggalBooking || data.waktuMulaiSelesai || data.ruanganFasilitas) {
      const availabilityCheck = checkAvailability({
        tanggalBooking: data.tanggalBooking || values[rowIndex-1][1],
        waktuMulaiSelesai: data.waktuMulaiSelesai || values[rowIndex-1][2],
        ruanganFasilitas: data.ruanganFasilitas || values[rowIndex-1][3],
        excludeId: data.id
      });
      
      if (!availabilityCheck.success || !availabilityCheck.available) {
        return { 
          success: false, 
          message: 'Ruangan/fasilitas tidak tersedia pada waktu yang dipilih' 
        };
      }
    }
    
    // Update the row
    const updatedRow = [
      data.id,
      data.tanggalBooking || values[rowIndex-1][1],
      data.waktuMulaiSelesai || values[rowIndex-1][2],
      data.ruanganFasilitas || values[rowIndex-1][3],
      data.keperluan || values[rowIndex-1][4],
      data.pemohon || values[rowIndex-1][5],
      data.departemen || values[rowIndex-1][6],
      data.status || values[rowIndex-1][7],
      data.catatan || values[rowIndex-1][8],
      values[rowIndex-1][9], // Keep original Created By
      values[rowIndex-1][10] // Keep original Created Date
    ];
    
    sheet.getRange(rowIndex, 1, 1, updatedRow.length).setValues([updatedRow]);
    
    return { success: true, message: 'Booking berhasil diupdate' };
    
  } catch (error) {
    console.error('Error in updateBooking:', error);
    return { success: false, message: error.toString() };
  }
}

/**
 * Delete booking
 */
function deleteBooking(data) {
  try {
    const sheet = SpreadsheetApp.openById(CONFIG.SHEET_ID).getSheetByName(CONFIG.SHEETS.BOOKING);
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
      return { success: false, message: 'Booking tidak ditemukan' };
    }
    
    sheet.deleteRow(rowIndex);
    
    return { success: true, message: 'Booking berhasil dihapus' };
    
  } catch (error) {
    console.error('Error in deleteBooking:', error);
    return { success: false, message: error.toString() };
  }
}

/**
 * Approve booking
 */
function approveBooking(data) {
  try {
    return updateBooking({
      id: data.id,
      status: 'Approved',
      catatan: data.catatan || 'Booking disetujui'
    });
  } catch (error) {
    console.error('Error in approveBooking:', error);
    return { success: false, message: error.toString() };
  }
}

/**
 * Reject booking
 */
function rejectBooking(data) {
  try {
    return updateBooking({
      id: data.id,
      status: 'Rejected',
      catatan: data.catatan || 'Booking ditolak'
    });
  } catch (error) {
    console.error('Error in rejectBooking:', error);
    return { success: false, message: error.toString() };
  }
}

/**
 * Get bookings by date
 */
function getBookingsByDate(data) {
  try {
    const filters = {
      startDate: data.date,
      endDate: data.date
    };
    
    return getBookings({ filters: filters });
    
  } catch (error) {
    console.error('Error in getBookingsByDate:', error);
    return { success: false, message: error.toString() };
  }
}

/**
 * Get bookings by room
 */
function getBookingsByRoom(data) {
  try {
    const filters = {
      ruangan: data.ruangan
    };
    
    return getBookings({ filters: filters });
    
  } catch (error) {
    console.error('Error in getBookingsByRoom:', error);
    return { success: false, message: error.toString() };
  }
}

/**
 * Check room availability
 */
function checkAvailability(data) {
  try {
    const sheet = SpreadsheetApp.openById(CONFIG.SHEET_ID).getSheetByName(CONFIG.SHEETS.BOOKING);
    const values = sheet.getDataRange().getValues();
    
    if (values.length <= 1) {
      return { success: true, available: true };
    }
    
    const headers = values[0];
    const rows = values.slice(1);
    
    // Parse time range
    const timeRange = data.waktuMulaiSelesai.split('-');
    if (timeRange.length !== 2) {
      return { success: false, message: 'Format waktu tidak valid. Gunakan format: HH:MM-HH:MM' };
    }
    
    const startTime = timeRange[0].trim();
    const endTime = timeRange[1].trim();
    
    // Check for conflicts
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const bookingId = row[0];
      const bookingDate = row[1];
      const bookingTime = row[2];
      const bookingRoom = row[3];
      const bookingStatus = row[7];
      
      // Skip if this is the same booking being updated
      if (data.excludeId && bookingId == data.excludeId) {
        continue;
      }
      
      // Skip rejected bookings
      if (bookingStatus === 'Rejected') {
        continue;
      }
      
      // Check if same room and date
      if (bookingRoom === data.ruanganFasilitas && 
          new Date(bookingDate).toDateString() === new Date(data.tanggalBooking).toDateString()) {
        
        // Parse existing booking time
        const existingTimeRange = bookingTime.split('-');
        if (existingTimeRange.length === 2) {
          const existingStart = existingTimeRange[0].trim();
          const existingEnd = existingTimeRange[1].trim();
          
          // Check for time overlap
          if (timeOverlap(startTime, endTime, existingStart, existingEnd)) {
            return { 
              success: true, 
              available: false, 
              message: `Ruangan sudah dibooking pada waktu ${bookingTime}` 
            };
          }
        }
      }
    }
    
    return { success: true, available: true };
    
  } catch (error) {
    console.error('Error in checkAvailability:', error);
    return { success: false, message: error.toString() };
  }
}

/**
 * Check if two time ranges overlap
 */
function timeOverlap(start1, end1, start2, end2) {
  const time1Start = timeToMinutes(start1);
  const time1End = timeToMinutes(end1);
  const time2Start = timeToMinutes(start2);
  const time2End = timeToMinutes(end2);
  
  return time1Start < time2End && time2Start < time1End;
}

/**
 * Convert time string to minutes
 */
function timeToMinutes(timeStr) {
  const parts = timeStr.split(':');
  return parseInt(parts[0]) * 60 + parseInt(parts[1]);
}
