/**
 * Amrita Student Companion — Background Service Worker
 * 
 * Orchestrates background-tab synchronization:
 * - Detects portal login events
 * - Opens background tabs (active: false)
 * - Receives extraction completion messages from content scripts
 * - Closes background tabs cleanly
 * - Prevents duplicate concurrent syncs
 * - Handles session timeouts and manual refresh triggers
 */

const AUMS_CAS_LOGIN_URL = "https://aumscn.amrita.edu/cas/login?service=https%3A%2F%2Faumscn.amrita.edu%2Faums%2FJsp%2FCommon%2Findex.jsp";
const AUMS_POST_LOGIN_ROUTE = "/aums/Jsp/Common/index.jsp";
const AUMS_MARKS_URL = "https://aumscn.amrita.edu/aums/Jsp/Marks/ViewPublishedMark.jsp?action=UMS-EVAL_STUDMARKVIEW_INIT_SCREEN#amrita-sync=marks";
let isAttendanceSyncing = false;
let isMarksSyncing = false;

// Store tab IDs of background sync tabs so we only close tabs we created
let attendanceTabId = null;
let marksTabId = null;

// Timeout handles
let attendanceTimeout = null;
let marksTimeout = null;

// Cooldown to avoid syncing repeatedly on every page click (5 minutes minimum between auto-syncs)
const AUTO_SYNC_COOLDOWN_MS = 5 * 60 * 1000;
let lastAttendanceAutoSync = 0;
let lastMarksAutoSync = 0;

/**
 * Initiates background synchronization for MyAmrita Attendance.
 * @param {boolean} isManual - whether triggered manually by user
 */
async function startAttendanceSync(isManual = false) {
  if (isAttendanceSyncing) {
    console.log("[Amrita Sync] Attendance sync already in progress. Skipping.");
    return;
  }

  const now = Date.now();
  if (!isManual && (now - lastAttendanceAutoSync < AUTO_SYNC_COOLDOWN_MS)) {
    console.log("[Amrita Sync] Attendance auto-sync on cooldown. Skipping.");
    return;
  }

  isAttendanceSyncing = true;
  lastAttendanceAutoSync = now;

  await updateSyncStatus("attendance", "syncing", "Connecting to MyAmrita in background...");

  console.log("[Amrita Sync] Opening background tab for MyAmrita attendance...");
  
  // Open attendance URL in a silent background tab (active: false)
  // We append #amrita-sync=attendance so the content script knows it was launched for background sync
  chrome.tabs.create(
    {
      url: "https://students.amrita.edu/client/class-attendance#amrita-sync=attendance",
      active: false
    },
    (tab) => {
      if (chrome.runtime.lastError || !tab) {
        console.error("[Amrita Sync] Failed to create background tab:", chrome.runtime.lastError);
        isAttendanceSyncing = false;
        updateSyncStatus("attendance", "error", "Failed to open background tab");
        return;
      }

      attendanceTabId = tab.id;

      // 25-second watchdog timer to close tab if page fails to load or session expired
      clearTimeout(attendanceTimeout);
      attendanceTimeout = setTimeout(async () => {
        if (isAttendanceSyncing) {
          console.warn("[Amrita Sync] Attendance sync timed out after 25s.");
          isAttendanceSyncing = false;
          if (attendanceTabId) {
            chrome.tabs.remove(attendanceTabId, () => {});
            attendanceTabId = null;
          }
          await updateSyncStatus("attendance", "timeout", "Sync timed out. Verify your MyAmrita login.");
        }
      }, 25000);
    }
  );
}

/**
 * Initiates background synchronization for AUMS Internal Marks.
 * @param {boolean} isManual - whether triggered manually by user
 */
async function startMarksSync(isManual = false) {
  if (isMarksSyncing) {
    console.log("[Amrita Sync] Marks sync already in progress. Skipping.");
    return;
  }

  const now = Date.now();
  if (!isManual && (now - lastMarksAutoSync < AUTO_SYNC_COOLDOWN_MS)) {
    console.log("[Amrita Sync] Marks auto-sync on cooldown. Skipping.");
    return;
  }

  isMarksSyncing = true;
  lastMarksAutoSync = now;

  await updateSyncStatus("marks", "syncing", "Connecting to AUMS in background...");

  console.log("[Amrita Sync] Opening background tab for AUMS marks...");

  // Open AUMS marks direct route in a silent background tab (active: false)
  chrome.tabs.create(
    {
      url: "https://aumscn.amrita.edu/aums/Jsp/Marks/ViewPublishedMark.jsp?action=UMS-EVAL_STUDMARKVIEW_INIT_SCREEN#amrita-sync=marks",
      active: false
    },
    (tab) => {
      if (chrome.runtime.lastError || !tab) {
        console.error("[Amrita Sync] Failed to create AUMS tab:", chrome.runtime.lastError);
        isMarksSyncing = false;
        updateSyncStatus("marks", "error", "Failed to open AUMS background tab");
        return;
      }

      marksTabId = tab.id;

      // 25-second watchdog timer
      clearTimeout(marksTimeout);
      marksTimeout = setTimeout(async () => {
        if (isMarksSyncing) {
          console.warn("[Amrita Sync] Marks sync timed out after 25s.");
          isMarksSyncing = false;
          if (marksTabId) {
            chrome.tabs.remove(marksTabId, () => {});
            marksTabId = null;
          }
          await updateSyncStatus("marks", "timeout", "Sync timed out. Verify your AUMS login.");
        }
      }, 25000);
    }
  );
}

/**
 * Updates status indicators in chrome.storage.local
 */
async function updateSyncStatus(portal, state, message) {
  try {
    const data = await chrome.storage.local.get(["amrita_sync_state"]);
    const current = data.amrita_sync_state || {};
    current[portal] = {
      state: state, // 'idle' | 'syncing' | 'success' | 'expired' | 'error' | 'timeout'
      message: message,
      lastAttempt: new Date().toISOString()
    };
    await chrome.storage.local.set({ amrita_sync_state: current });
  } catch (err) {
    console.error("[Amrita Sync] Storage update error:", err);
  }
}

/**
 * Listen for messages from content scripts or popup/dashboard UI
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // 1. Manual sync request from UI
  if (message.action === "TRIGGER_SYNC") {
    if (message.target === "ATTENDANCE" || message.target === "ALL") {
      startAttendanceSync(true);
    }
    if (message.target === "MARKS" || message.target === "ALL") {
      startMarksSync(true);
    }
    sendResponse({ status: "started" });
    return true;
  }

  // 2. Attendance Sync Completed
  if (message.action === "ATTENDANCE_SYNC_COMPLETE") {
    console.log("[Amrita Sync] Received ATTENDANCE_SYNC_COMPLETE from tab", sender.tab?.id);
    clearTimeout(attendanceTimeout);
    isAttendanceSyncing = false;

    updateSyncStatus("attendance", "success", "Synced successfully");

    // Close the temporary background tab if it was created by us
    if (sender.tab && (sender.tab.id === attendanceTabId || sender.tab.url?.includes("#amrita-sync=attendance"))) {
      chrome.tabs.remove(sender.tab.id, () => {
        console.log("[Amrita Sync] Closed MyAmrita background tab.");
      });
      attendanceTabId = null;
    }
    sendResponse({ received: true });
    return true;
  }

  // 3. Marks Sync Completed
  if (message.action === "MARKS_SYNC_COMPLETE") {
    console.log("[Amrita Sync] Received MARKS_SYNC_COMPLETE from tab", sender.tab?.id);
    clearTimeout(marksTimeout);
    isMarksSyncing = false;

    updateSyncStatus("marks", "success", "Synced successfully");

    // Close the temporary background tab if it was created by us
    if (sender.tab && (sender.tab.id === marksTabId || sender.tab.url?.includes("#amrita-sync=marks"))) {
      chrome.tabs.remove(sender.tab.id, () => {
        console.log("[Amrita Sync] Closed AUMS background tab.");
      });
      marksTabId = null;
    }
    sendResponse({ received: true });
    return true;
  }

  // 4. Session Expired or Login Required
  if (message.action === "PORTAL_SESSION_EXPIRED") {
    console.warn(`[Amrita Sync] Portal session expired for: ${message.portal}`);
    if (message.portal === "attendance") {
      clearTimeout(attendanceTimeout);
      isAttendanceSyncing = false;
      updateSyncStatus("attendance", "expired", "Session expired. Please log into MyAmrita.");
      if (sender.tab?.id === attendanceTabId) {
        chrome.tabs.remove(sender.tab.id, () => {});
        attendanceTabId = null;
      }
    } else if (message.portal === "marks") {
      clearTimeout(marksTimeout);
      isMarksSyncing = false;
      updateSyncStatus("marks", "expired", "Session expired. Please log into AUMS.");
      if (sender.tab?.id === marksTabId) {
        chrome.tabs.remove(sender.tab.id, () => {});
        marksTabId = null;
      }
    }
    sendResponse({ received: true });
    return true;
  }
});

/**
 * Automatic login detection:
 * Monitors tabs completing navigation to logged-in dashboard routes.
 */
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url) {
    // 1. MyAmrita login success detection
    // When a student logs into MyAmrita, they land on /client/index or /client/dashboard
    if (
      tab.url.startsWith("https://students.amrita.edu/client/") &&
      !tab.url.includes("login") &&
      !tab.url.includes("signout") &&
      !tab.url.includes("#amrita-sync=attendance")
    ) {
      console.log("[Amrita Sync] Detected active MyAmrita login in tab", tabId);
      startAttendanceSync(false);
    }

    // 2. AUMS login success detection
    // CAS authenticates at /cas/login?service=... and redirects to /aums/Jsp/Common/index.jsp
    if (
      (tab.url.includes("aumscn.amrita.edu/aums/") || tab.url.includes(AUMS_POST_LOGIN_ROUTE)) &&
      !tab.url.includes("/cas/") &&
      !tab.url.includes("login") &&
      !tab.url.includes("#amrita-sync=marks")
    ) {
      console.log("[Amrita Sync] Detected active AUMS session (landed on post-CAS index.jsp) in tab", tabId);
      startMarksSync(false);
    }
  }
});

