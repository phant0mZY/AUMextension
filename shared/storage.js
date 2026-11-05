/**
 * Amrita Student Companion - Chrome Local Storage Manager
 * 
 * Provides safe, promise-based access to chrome.storage.local.
 * Adheres to the versioned schema and prevents overwriting valid snapshots with empty data.
 */

const STORAGE_KEY = "amrita_companion_data";

const DEFAULT_STATE = {
  schemaVersion: 1,
  marks: {
    lastUpdated: null,
    semester: null,
    courses: []
  },
  attendance: {
    lastUpdated: null,
    semester: null,
    courses: []
  },
  settings: {
    attendanceThreshold: 75
  }
};

/**
 * Checks if chrome.storage is available in the current context.
 */
function isChromeStorageAvailable() {
  return typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local;
}

/**
 * Retrieves the full companion state from chrome.storage.local.
 * @returns {Promise<typeof DEFAULT_STATE>}
 */
async function getStorageData() {
  if (!isChromeStorageAvailable()) {
    console.warn("[Amrita Companion] chrome.storage.local unavailable. Using session fallback.");
    const fallback = window.__AMRITA_LOCAL_DATA__ || JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    return fallback || structuredClone(DEFAULT_STATE);
  }

  return new Promise((resolve) => {
    chrome.storage.local.get([STORAGE_KEY], (result) => {
      if (chrome.runtime.lastError) {
        console.error("[Amrita Companion] Storage read error:", chrome.runtime.lastError);
        resolve(structuredClone(DEFAULT_STATE));
        return;
      }
      const data = result[STORAGE_KEY];
      if (!data || data.schemaVersion !== 1) {
        resolve(structuredClone(DEFAULT_STATE));
      } else {
        resolve(data);
      }
    });
  });
}

/**
 * Saves state into chrome.storage.local.
 * @param {object} updatedData
 * @returns {Promise<boolean>}
 */
async function setStorageData(updatedData) {
  if (!isChromeStorageAvailable()) {
    window.__AMRITA_LOCAL_DATA__ = updatedData;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
    return true;
  }

  return new Promise((resolve, reject) => {
    chrome.storage.local.set({ [STORAGE_KEY]: updatedData }, () => {
      if (chrome.runtime.lastError) {
        console.error("[Amrita Companion] Storage write error:", chrome.runtime.lastError);
        reject(chrome.runtime.lastError);
      } else {
        resolve(true);
      }
    });
  });
}

/**
 * Saves a new marks snapshot without overwriting if the new payload is empty/invalid.
 * @param {{ semester?: string, courses: Array }} marksPayload
 */
async function saveMarksSnapshot(marksPayload) {
  if (!marksPayload || !Array.isArray(marksPayload.courses) || marksPayload.courses.length === 0) {
    console.warn("[Amrita Companion] Attempted to save empty marks. Rejected to protect existing snapshot.");
    return false;
  }

  const current = await getStorageData();
  current.marks = {
    lastUpdated: new Date().toISOString(),
    semester: marksPayload.semester || current.marks.semester || null,
    courses: marksPayload.courses
  };

  return setStorageData(current);
}

/**
 * Saves a new attendance snapshot without overwriting if the new payload is empty/invalid.
 * @param {{ semester?: string, courses: Array }} attendancePayload
 */
async function saveAttendanceSnapshot(attendancePayload) {
  if (!attendancePayload || !Array.isArray(attendancePayload.courses) || attendancePayload.courses.length === 0) {
    console.warn("[Amrita Companion] Attempted to save empty attendance. Rejected to protect existing snapshot.");
    return false;
  }

  const current = await getStorageData();
  current.attendance = {
    lastUpdated: new Date().toISOString(),
    semester: attendancePayload.semester || current.attendance.semester || null,
    courses: attendancePayload.courses
  };

  return setStorageData(current);
}

/**
 * Updates settings such as attendanceThreshold.
 * @param {object} newSettings
 */
async function updateSettings(newSettings) {
  const current = await getStorageData();
  current.settings = {
    ...current.settings,
    ...newSettings
  };
  return setStorageData(current);
}

/**
 * Clears all locally stored academic data.
 */
async function clearAllData() {
  const resetState = structuredClone(DEFAULT_STATE);
  return setStorageData(resetState);
}

/**
 * Populates sample data for preview and development.
 */
async function loadSampleData() {
  if (typeof SAMPLE_DATA !== 'undefined') {
    return setStorageData(structuredClone(SAMPLE_DATA));
  }
  return false;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    getStorageData,
    setStorageData,
    saveMarksSnapshot,
    saveAttendanceSnapshot,
    updateSettings,
    clearAllData,
    loadSampleData,
    DEFAULT_STATE
  };
}

