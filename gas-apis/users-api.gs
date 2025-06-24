/**
 * Google Apps Script API untuk Users - Portal Karyawan SAG
 * Sheet: https://docs.google.com/spreadsheets/d/1UMA4dHaqG6dmJ0kWTq7NPz6xmqnTPSqJpMu4ws7TFjs/edit
 */

// Configuration
const CONFIG = {
  SHEET_ID: '1UMA4dHaqG6dmJ0kWTq7NPz6xmqnTPSqJpMu4ws7TFjs',
  SHEETS: {
    USERS: 'USERS'
  },
  USERS_COLUMNS: [
    'id', 'email', 'password', 'name', 'role', 'permissions'
  ],
  ROLES: {
    'admin': ['produksi', 'absensi', 'booking', 'asset', 'users'],
    'manager': ['produksi', 'absensi', 'booking', 'asset'],
    'supervisor': ['produksi', 'absensi', 'asset'],
    'staff': ['produksi', 'booking'],
    'hr': ['absensi', 'users'],
    'finance': ['asset'],
    'operator': ['produksi']
  }
};

/**
 * Handle CORS and routing for all requests
 */
function doGet(e) {
  return createCORSResponse({ success: true, message: 'Users API is running' });
}

function doPost(e) {
  try {
    const requestData = JSON.parse(e.postData.contents);
    const action = requestData.action;
    
    let response;
    
    switch(action) {
      case 'login':
        response = login(requestData);
        break;
      case 'register':
        response = register(requestData);
        break;
      case 'getUsers':
        response = getUsers(requestData);
        break;
      case 'getUserById':
        response = getUserById(requestData);
        break;
      case 'updateUser':
        response = updateUser(requestData);
        break;
      case 'deleteUser':
        response = deleteUser(requestData);
        break;
      case 'changePassword':
        response = changePassword(requestData);
        break;
      case 'validateToken':
        response = validateToken(requestData);
        break;
      case 'getUserPermissions':
        response = getUserPermissions(requestData);
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
 * User login
 */
function login(data) {
  try {
    const sheet = SpreadsheetApp.openById(CONFIG.SHEET_ID).getSheetByName(CONFIG.SHEETS.USERS);
    const values = sheet.getDataRange().getValues();
    
    if (values.length <= 1) {
      return { success: false, message: 'No users found' };
    }
    
    const headers = values[0];
    const rows = values.slice(1);
    
    // Find user by email
    const user = rows.find(row => {
      const userEmail = row[headers.indexOf('email')];
      return userEmail && userEmail.toLowerCase() === data.email.toLowerCase();
    });
    
    if (!user) {
      return { success: false, message: 'Email tidak ditemukan' };
    }
    
    // Check password (in production, use proper hashing)
    const storedPassword = user[headers.indexOf('password')];
    if (storedPassword !== data.password) {
      return { success: false, message: 'Password salah' };
    }
    
    // Create user object (exclude password)
    const userObj = {
      id: user[headers.indexOf('id')],
      email: user[headers.indexOf('email')],
      name: user[headers.indexOf('name')],
      role: user[headers.indexOf('role')],
      permissions: user[headers.indexOf('permissions')] || CONFIG.ROLES[user[headers.indexOf('role')]] || []
    };
    
    // Generate simple token (in production, use JWT)
    const token = generateToken(userObj);
    
    return { 
      success: true, 
      message: 'Login berhasil',
      user: userObj,
      token: token
    };
    
  } catch (error) {
    console.error('Error in login:', error);
    return { success: false, message: error.toString() };
  }
}

/**
 * User registration
 */
function register(data) {
  try {
    const sheet = SpreadsheetApp.openById(CONFIG.SHEET_ID).getSheetByName(CONFIG.SHEETS.USERS);
    const values = sheet.getDataRange().getValues();
    
    // Check if email already exists
    if (values.length > 1) {
      const headers = values[0];
      const rows = values.slice(1);
      
      const existingUser = rows.find(row => {
        const userEmail = row[headers.indexOf('email')];
        return userEmail && userEmail.toLowerCase() === data.email.toLowerCase();
      });
      
      if (existingUser) {
        return { success: false, message: 'Email sudah terdaftar' };
      }
    }
    
    // Generate new ID
    const lastRow = sheet.getLastRow();
    const newId = lastRow > 1 ? parseInt(sheet.getRange(lastRow, 1).getValue()) + 1 : 1;
    
    // Set default role and permissions
    const role = data.role || 'staff';
    const permissions = data.permissions || CONFIG.ROLES[role] || [];
    
    const newRow = [
      newId,
      data.email || '',
      data.password || '', // In production, hash the password
      data.name || '',
      role,
      Array.isArray(permissions) ? permissions.join(',') : permissions
    ];
    
    sheet.appendRow(newRow);
    
    return { 
      success: true, 
      message: 'Registrasi berhasil',
      id: newId
    };
    
  } catch (error) {
    console.error('Error in register:', error);
    return { success: false, message: error.toString() };
  }
}

/**
 * Get all users (admin only)
 */
function getUsers(data) {
  try {
    // In production, add proper authentication check
    const sheet = SpreadsheetApp.openById(CONFIG.SHEET_ID).getSheetByName(CONFIG.SHEETS.USERS);
    const values = sheet.getDataRange().getValues();
    
    if (values.length <= 1) {
      return { success: true, data: [] };
    }
    
    const headers = values[0];
    const rows = values.slice(1);
    
    const users = rows.map(row => {
      const obj = {};
      headers.forEach((header, index) => {
        if (header !== 'password') { // Exclude password from response
          obj[header] = row[index] || '';
        }
      });
      return obj;
    });
    
    return { success: true, data: users };
    
  } catch (error) {
    console.error('Error in getUsers:', error);
    return { success: false, message: error.toString() };
  }
}

/**
 * Get user by ID
 */
function getUserById(data) {
  try {
    const sheet = SpreadsheetApp.openById(CONFIG.SHEET_ID).getSheetByName(CONFIG.SHEETS.USERS);
    const values = sheet.getDataRange().getValues();
    
    if (values.length <= 1) {
      return { success: false, message: 'User tidak ditemukan' };
    }
    
    const headers = values[0];
    const rows = values.slice(1);
    
    const user = rows.find(row => row[0] == data.id);
    
    if (!user) {
      return { success: false, message: 'User tidak ditemukan' };
    }
    
    const userObj = {};
    headers.forEach((header, index) => {
      if (header !== 'password') { // Exclude password
        userObj[header] = user[index] || '';
      }
    });
    
    return { success: true, data: userObj };
    
  } catch (error) {
    console.error('Error in getUserById:', error);
    return { success: false, message: error.toString() };
  }
}

/**
 * Update user
 */
function updateUser(data) {
  try {
    const sheet = SpreadsheetApp.openById(CONFIG.SHEET_ID).getSheetByName(CONFIG.SHEETS.USERS);
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
      return { success: false, message: 'User tidak ditemukan' };
    }
    
    // Update permissions based on role if role is changed
    let permissions = data.permissions || values[rowIndex-1][5];
    if (data.role && data.role !== values[rowIndex-1][4]) {
      permissions = CONFIG.ROLES[data.role] || [];
      if (Array.isArray(permissions)) {
        permissions = permissions.join(',');
      }
    }
    
    // Update the row (don't update password here)
    const updatedRow = [
      data.id,
      data.email || values[rowIndex-1][1],
      values[rowIndex-1][2], // Keep existing password
      data.name || values[rowIndex-1][3],
      data.role || values[rowIndex-1][4],
      permissions
    ];
    
    sheet.getRange(rowIndex, 1, 1, updatedRow.length).setValues([updatedRow]);
    
    return { success: true, message: 'User berhasil diupdate' };
    
  } catch (error) {
    console.error('Error in updateUser:', error);
    return { success: false, message: error.toString() };
  }
}

/**
 * Delete user
 */
function deleteUser(data) {
  try {
    const sheet = SpreadsheetApp.openById(CONFIG.SHEET_ID).getSheetByName(CONFIG.SHEETS.USERS);
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
      return { success: false, message: 'User tidak ditemukan' };
    }
    
    sheet.deleteRow(rowIndex);
    
    return { success: true, message: 'User berhasil dihapus' };
    
  } catch (error) {
    console.error('Error in deleteUser:', error);
    return { success: false, message: error.toString() };
  }
}

/**
 * Change password
 */
function changePassword(data) {
  try {
    const sheet = SpreadsheetApp.openById(CONFIG.SHEET_ID).getSheetByName(CONFIG.SHEETS.USERS);
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
      return { success: false, message: 'User tidak ditemukan' };
    }
    
    // Verify old password
    if (values[rowIndex-1][2] !== data.oldPassword) {
      return { success: false, message: 'Password lama salah' };
    }
    
    // Update password
    sheet.getRange(rowIndex, 3).setValue(data.newPassword);
    
    return { success: true, message: 'Password berhasil diubah' };
    
  } catch (error) {
    console.error('Error in changePassword:', error);
    return { success: false, message: error.toString() };
  }
}

/**
 * Validate token (simple implementation)
 */
function validateToken(data) {
  try {
    // In production, implement proper JWT validation
    const token = data.token;
    if (!token) {
      return { success: false, message: 'Token tidak valid' };
    }
    
    // Simple token validation (decode base64)
    try {
      const decoded = Utilities.base64Decode(token);
      const userStr = Utilities.newBlob(decoded).getDataAsString();
      const user = JSON.parse(userStr);
      
      return { success: true, user: user };
    } catch (e) {
      return { success: false, message: 'Token tidak valid' };
    }
    
  } catch (error) {
    console.error('Error in validateToken:', error);
    return { success: false, message: error.toString() };
  }
}

/**
 * Get user permissions
 */
function getUserPermissions(data) {
  try {
    const userResult = getUserById(data);
    if (!userResult.success) return userResult;
    
    const user = userResult.data;
    let permissions = user.permissions;
    
    if (typeof permissions === 'string') {
      permissions = permissions.split(',');
    }
    
    if (!Array.isArray(permissions)) {
      permissions = CONFIG.ROLES[user.role] || [];
    }
    
    return { 
      success: true, 
      permissions: permissions,
      role: user.role
    };
    
  } catch (error) {
    console.error('Error in getUserPermissions:', error);
    return { success: false, message: error.toString() };
  }
}

/**
 * Generate simple token (in production, use JWT)
 */
function generateToken(user) {
  const tokenData = {
    id: user.id,
    email: user.email,
    role: user.role,
    timestamp: new Date().getTime()
  };
  
  const tokenStr = JSON.stringify(tokenData);
  return Utilities.base64Encode(tokenStr);
}
