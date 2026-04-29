/**
 * Firebase Configuration & Initialization
 * Geoportal Kriminalitas
 */

// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-storage.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-auth.js";

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyAF1F7swRNaYUYUDk3X8w9Yp5pSnTm1gWg",
  authDomain: "geoportalkriminalitas.firebaseapp.com",
  projectId: "geoportalkriminalitas",
  storageBucket: "geoportalkriminalitas.firebasestorage.app",
  messagingSenderId: "838654341673",
  appId: "1:838654341673:web:308b8c4429152ca4d5e238",
  measurementId: "G-3ZGH62H9LS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore Database
const db = getFirestore(app);

// Initialize Storage
const storage = getStorage(app);

// Initialize Authentication
const auth = getAuth(app);

console.log('✅ Firebase initialized successfully');
console.log('📍 Project:', firebaseConfig.projectId);

// ============================================
// FIRESTORE OPERATIONS - CREATE
// ============================================

/**
 * Add new report to Firestore
 */
async function addReport(reportData) {
  try {
    const docRef = await db.collection("laporan").add({
      ...reportData,
      status: reportData.status || 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    console.log('✅ Report added with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('❌ Error adding report:', error);
    throw error;
  }
}

/**
 * Upload photo to Firebase Storage
 */
async function uploadPhoto(file, reportId) {
  try {
    if (!file) return null;

    // Validate file
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      throw new Error('Format foto tidak didukung. Gunakan JPG, PNG, GIF, atau WebP');
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new Error('Ukuran foto terlalu besar. Maksimal 5MB');
    }

    const storageRef = storage.ref(`foto/${reportId}/${file.name}`);
    await storageRef.put(file);
    const photoUrl = await storageRef.getDownloadURL();

    console.log('✅ Photo uploaded:', photoUrl);
    return photoUrl;
  } catch (error) {
    console.error('❌ Error uploading photo:', error);
    throw error;
  }
}

// ============================================
// FIRESTORE OPERATIONS - READ
// ============================================

/**
 * Get all reports from Firestore
 */
async function getAllReports() {
  try {
    const querySnapshot = await db.collection("laporan").get();
    const reports = [];
    querySnapshot.forEach((doc) => {
      reports.push({
        id: doc.id,
        ...doc.data()
      });
    });
    console.log('📊 Retrieved', reports.length, 'reports');
    return reports;
  } catch (error) {
    console.error('❌ Error getting reports:', error);
    throw error;
  }
}

/**
 * Get report by ID
 */
async function getReportById(reportId) {
  try {
    const doc = await db.collection("laporan").doc(reportId).get();
    if (doc.exists()) {
      return { id: doc.id, ...doc.data() };
    } else {
      console.log('❌ Report not found');
      return null;
    }
  } catch (error) {
    console.error('❌ Error getting report:', error);
    throw error;
  }
}

/**
 * Get filtered reports
 */
async function getReportsFiltered(filters = {}) {
  try {
    let query = db.collection("laporan");

    if (filters.jenis) {
      query = query.where('jenis', '==', filters.jenis);
    }

    if (filters.tingkat) {
      query = query.where('tingkat', '==', filters.tingkat);
    }

    if (filters.status) {
      query = query.where('status', '==', filters.status);
    }

    const querySnapshot = await query.get();
    const reports = [];
    querySnapshot.forEach((doc) => {
      reports.push({
        id: doc.id,
        ...doc.data()
      });
    });

    console.log('🔍 Filtered reports:', reports.length);
    return reports;
  } catch (error) {
    console.error('❌ Error filtering reports:', error);
    throw error;
  }
}

/**
 * Real-time listener for reports
 */
function onReportsUpdate(callback) {
  try {
    const unsubscribe = db.collection("laporan").onSnapshot((snapshot) => {
      const reports = [];
      snapshot.forEach((doc) => {
        reports.push({
          id: doc.id,
          ...doc.data()
        });
      });
      console.log('🔔 Real-time update:', reports.length, 'reports');
      callback(reports);
    });
    return unsubscribe;
  } catch (error) {
    console.error('❌ Error setting up listener:', error);
    throw error;
  }
}

// ============================================
// FIRESTORE OPERATIONS - UPDATE
// ============================================

/**
 * Update report
 */
async function updateReport(reportId, updateData) {
  try {
    await db.collection("laporan").doc(reportId).update({
      ...updateData,
      updatedAt: new Date()
    });
    console.log('✅ Report updated:', reportId);
    return true;
  } catch (error) {
    console.error('❌ Error updating report:', error);
    throw error;
  }
}

/**
 * Update report status
 */
async function updateReportStatus(reportId, status) {
  try {
    const validStatuses = ['pending', 'ditangani', 'selesai'];
    if (!validStatuses.includes(status)) {
      throw new Error('Status tidak valid');
    }

    await updateReport(reportId, { status });
    console.log('✅ Report status updated to:', status);
    return true;
  } catch (error) {
    console.error('❌ Error updating status:', error);
    throw error;
  }
}

// ============================================
// FIRESTORE OPERATIONS - DELETE
// ============================================

/**
 * Delete report
 */
async function deleteReport(reportId) {
  try {
    await db.collection("laporan").doc(reportId).delete();
    console.log('🗑️ Report deleted:', reportId);
    return true;
  } catch (error) {
    console.error('❌ Error deleting report:', error);
    throw error;
  }
}

// ============================================
// STATISTICS
// ============================================

/**
 * Get statistics
 */
async function getStatistics() {
  try {
    const reports = await getAllReports();
    
    const stats = {
      totalLaporan: reports.length,
      laporanDitangani: reports.filter(r => r.status === 'ditangani').length,
      laporanPending: reports.filter(r => r.status === 'pending').length,
      laporanSelesai: reports.filter(r => r.status === 'selesai').length,
      tingkatHigh: reports.filter(r => r.tingkat === 'high').length,
      tingkatMedium: reports.filter(r => r.tingkat === 'medium').length,
      tingkatLow: reports.filter(r => r.tingkat === 'low').length
    };

    console.log('📊 Statistics:', stats);
    return stats;
  } catch (error) {
    console.error('❌ Error getting statistics:', error);
    throw error;
  }
}

// ============================================
// AUTHENTICATION
// ============================================

/**
 * Sign up user
 */
async function signUp(email, password) {
  try {
    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
    console.log('✅ User signed up:', userCredential.user.email);
    return userCredential.user;
  } catch (error) {
    console.error('❌ Error signing up:', error);
    throw error;
  }
}

/**
 * Sign in user
 */
async function signIn(email, password) {
  try {
    const userCredential = await auth.signInWithEmailAndPassword(email, password);
    console.log('✅ User signed in:', userCredential.user.email);
    return userCredential.user;
  } catch (error) {
    console.error('❌ Error signing in:', error);
    throw error;
  }
}

/**
 * Sign out user
 */
async function signOut() {
  try {
    await auth.signOut();
    console.log('✅ User signed out');
    return true;
  } catch (error) {
    console.error('❌ Error signing out:', error);
    throw error;
  }
}

/**
 * Get current user
 */
function getCurrentUser() {
  return auth.currentUser;
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Format date
 */
function formatDate(timestamp) {
  if (!timestamp) return '-';
  const date = timestamp instanceof Date ? timestamp : timestamp.toDate();
  return date.toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Format date short
 */
function formatDateShort(timestamp) {
  if (!timestamp) return '-';
  const date = timestamp instanceof Date ? timestamp : timestamp.toDate();
  return date.toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

/**
 * Capitalize string
 */
function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Generate unique ID
 */
function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// ============================================
// EXPORT FUNCTIONS
// ============================================

// Make functions globally available
window.firebaseApp = {
  // Create
  addReport,
  uploadPhoto,
  
  // Read
  getAllReports,
  getReportById,
  getReportsFiltered,
  onReportsUpdate,
  
  // Update
  updateReport,
  updateReportStatus,
  
  // Delete
  deleteReport,
  
  // Statistics
  getStatistics,
  
  // Auth
  signUp,
  signIn,
  signOut,
  getCurrentUser,
  
  // Utilities
  formatDate,
  formatDateShort,
  capitalize,
  generateId
};

// Also export Firestore instance for direct access
window.db = db;
window.storage = storage;
window.auth = auth;

console.log('✅ Firebase functions exported globally');