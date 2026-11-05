/**
 * Amrita Student Companion - Popup Script with Background Sync Support
 */

document.addEventListener("DOMContentLoaded", async () => {
  const quickAttendance = document.getElementById("quick-attendance");
  const quickAttendanceHint = document.getElementById("quick-attendance-hint");
  const quickMarks = document.getElementById("quick-marks");
  const quickMarksHint = document.getElementById("quick-marks-hint");
  const attnSyncTime = document.getElementById("attn-sync-time");
  const marksSyncTime = document.getElementById("marks-sync-time");
  const sessionAlert = document.getElementById("session-alert");
  const sessionAlertText = document.getElementById("session-alert-text");

  const syncAllBtn = document.getElementById("sync-all-btn");
  const syncAttnBtn = document.getElementById("sync-attn-btn");
  const syncMarksBtn = document.getElementById("sync-marks-btn");
  const openDashboardBtn = document.getElementById("open-dashboard-btn");
  const loadSampleBtn = document.getElementById("load-sample-btn");
  const clearSampleBtn = document.getElementById("clear-sample-btn");

  // Load and display current storage stats
  async function refreshPopupUI() {
    const data = await getStorageData();

    // Check sync status in storage
    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      chrome.storage.local.get(["amrita_sync_state"], (res) => {
        const syncState = res.amrita_sync_state || {};
        
        // Session expiry alerts
        if (syncState.attendance?.state === "expired") {
          sessionAlert.style.display = "flex";
          sessionAlertText.textContent = "MyAmrita session expired. Click to log in.";
          sessionAlert.onclick = () => window.open("https://students.amrita.edu/client/index", "_blank");
        } else if (syncState.marks?.state === "expired") {
          sessionAlert.style.display = "flex";
          sessionAlertText.textContent = "AUMS session expired. Click to log in.";
          sessionAlert.onclick = () => window.open("https://aumscn.amrita.edu/cas/login?service=https%3A%2F%2Faumscn.amrita.edu%2Faums%2FJsp%2FCommon%2Findex.jsp", "_blank");
        } else if (syncState.attendance?.state === "syncing" || syncState.marks?.state === "syncing") {
          sessionAlert.style.display = "flex";
          sessionAlert.style.backgroundColor = "#e0f2fe";
          sessionAlert.style.borderColor = "#bae6fd";
          sessionAlert.style.color = "#0369a1";
          sessionAlertText.textContent = "Syncing academic data in background...";
        } else {
          sessionAlert.style.display = "none";
        }
      });
    }

    // Attendance stats
    const attnCourses = data.attendance?.courses || [];
    if (attnCourses.length > 0) {
      let totalAttended = 0;
      let totalConducted = 0;
      attnCourses.forEach(c => {
        totalAttended += (c.classesAttended || 0);
        totalConducted += (c.classesConducted || 0);
      });
      const avg = totalConducted > 0 ? ((totalAttended / totalConducted) * 100).toFixed(1) : 0;
      quickAttendance.textContent = `${avg}%`;
      quickAttendanceHint.textContent = `${attnCourses.length} subjects tracked`;
    } else {
      quickAttendance.textContent = "--";
      quickAttendanceHint.textContent = "No snapshot yet";
    }
    attnSyncTime.textContent = `Last: ${formatLastUpdated(data.attendance?.lastUpdated)}`;

    // Marks stats
    const marksCourses = data.marks?.courses || [];
    if (marksCourses.length > 0) {
      let totalAssessments = 0;
      marksCourses.forEach(c => {
        totalAssessments += (c.assessments?.length || 0);
      });
      quickMarks.textContent = `${marksCourses.length} Courses`;
      quickMarksHint.textContent = `${totalAssessments} assessments logged`;
    } else {
      quickMarks.textContent = "--";
      quickMarksHint.textContent = "No snapshot yet";
    }
    marksSyncTime.textContent = `Last: ${formatLastUpdated(data.marks?.lastUpdated)}`;
  }

  // Open the full dashboard page in a new Chrome tab
  openDashboardBtn.addEventListener("click", () => {
    if (typeof chrome !== 'undefined' && chrome.tabs && chrome.runtime) {
      chrome.tabs.create({ url: chrome.runtime.getURL("dashboard/dashboard.html") });
    } else {
      window.open("../dashboard/dashboard.html", "_blank");
    }
  });

  // Manual Trigger Sync Handlers
  syncAllBtn.addEventListener("click", () => {
    syncAllBtn.textContent = "⏳ Syncing...";
    chrome.runtime.sendMessage({ action: "TRIGGER_SYNC", target: "ALL" }, () => {
      setTimeout(refreshPopupUI, 1000);
      setTimeout(() => { syncAllBtn.innerHTML = '<span class="sync-icon">🔄</span> Sync All'; }, 3000);
    });
  });

  syncAttnBtn.addEventListener("click", () => {
    syncAttnBtn.textContent = "⏳";
    chrome.runtime.sendMessage({ action: "TRIGGER_SYNC", target: "ATTENDANCE" }, () => {
      setTimeout(refreshPopupUI, 1000);
      setTimeout(() => { syncAttnBtn.textContent = "🔄"; }, 3000);
    });
  });

  syncMarksBtn.addEventListener("click", () => {
    syncMarksBtn.textContent = "⏳";
    chrome.runtime.sendMessage({ action: "TRIGGER_SYNC", target: "MARKS" }, () => {
      setTimeout(refreshPopupUI, 1000);
      setTimeout(() => { syncMarksBtn.textContent = "🔄"; }, 3000);
    });
  });

  // Developer sample data button
  loadSampleBtn.addEventListener("click", async () => {
    await loadSampleData();
    await refreshPopupUI();
  });

  // Reset data button
  clearSampleBtn.addEventListener("click", async () => {
    if (confirm("Reset all stored academic data?")) {
      await clearAllData();
      await refreshPopupUI();
    }
  });

  // Auto-refresh when storage changes
  if (typeof chrome !== 'undefined' && chrome.storage?.onChanged) {
    chrome.storage.onChanged.addListener(() => {
      refreshPopupUI();
    });
  }

  await refreshPopupUI();
});
