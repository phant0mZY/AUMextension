/**
 * Amrita Student Companion — Academic Dashboard Controller
 */

document.addEventListener("DOMContentLoaded", async () => {
  // DOM Elements
  const overallStatusPill = document.getElementById("overall-status-pill");
  const overallStatusText = document.getElementById("overall-status-text");
  const marksLastUpdated = document.getElementById("marks-last-updated");
  const attendanceLastUpdated = document.getElementById("attendance-last-updated");

  const metricOverallAttn = document.getElementById("metric-overall-attn");
  const metricAttnBadge = document.getElementById("metric-attn-badge");
  const metricOverallClasses = document.getElementById("metric-overall-classes");
  const metricCourseCount = document.getElementById("metric-course-count");
  const metricSemBadge = document.getElementById("metric-sem-badge");
  const metricMarksAvg = document.getElementById("metric-marks-avg");
  const metricMarksCount = document.getElementById("metric-marks-count");
  const metricDangerCount = document.getElementById("metric-danger-count");
  const metricThresholdBadge = document.getElementById("metric-threshold-badge");
  const metricDangerSubtext = document.getElementById("metric-danger-subtext");

  const tabBtns = document.querySelectorAll(".tab-btn");
  const tabPanels = document.querySelectorAll(".tab-panel");

  const attendanceEmpty = document.getElementById("attendance-empty");
  const attendanceList = document.getElementById("attendance-list");
  const marksEmpty = document.getElementById("marks-empty");
  const marksList = document.getElementById("marks-list");

  // Settings Modal Elements
  const settingsModal = document.getElementById("settings-modal");
  const settingsToggleBtn = document.getElementById("settings-toggle-btn");
  const settingsCloseBtn = document.getElementById("settings-close-btn");
  const thresholdInput = document.getElementById("threshold-input");
  const clearAllDataBtn = document.getElementById("clear-all-data-btn");
  const loadDevSampleBtns = document.querySelectorAll(".load-dev-sample-btn");

  let currentData = null;

  // Initialize and load UI
  async function init() {
    currentData = await getStorageData();
    thresholdInput.value = currentData.settings?.attendanceThreshold || 75;
    renderDashboard();
  }

  // Render full dashboard
  function renderDashboard() {
    const threshold = Number(currentData.settings?.attendanceThreshold) || 75;
    metricThresholdBadge.textContent = `Threshold < ${threshold}%`;

    const attnCourses = currentData.attendance?.courses || [];
    const marksCourses = currentData.marks?.courses || [];

    // Timestamps
    marksLastUpdated.textContent = `Marks: ${formatLastUpdated(currentData.marks?.lastUpdated)}`;
    attendanceLastUpdated.textContent = `Attendance: ${formatLastUpdated(currentData.attendance?.lastUpdated)}`;

    // Top status pill
    if (attnCourses.length > 0 || marksCourses.length > 0) {
      overallStatusPill.className = "status-indicator status-synced";
      overallStatusText.textContent = "Data Snapshot Active";
    } else {
      overallStatusPill.className = "status-indicator";
      overallStatusText.textContent = "No Live Snapshot";
    }

    // Render Metrics
    renderOverviewMetrics(attnCourses, marksCourses, threshold);

    // Render Attendance Section
    renderAttendanceSection(attnCourses, threshold);

    // Render Marks Section
    renderMarksSection(marksCourses);

    checkSyncState();
  }

  // Calculate & display top overview cards
  function renderOverviewMetrics(attnCourses, marksCourses, threshold) {
    // 1. Overall Attendance
    if (attnCourses.length > 0) {
      let totalAttended = 0;
      let totalConducted = 0;
      let belowThresholdCount = 0;

      attnCourses.forEach(c => {
        totalAttended += (c.classesAttended || 0);
        totalConducted += (c.classesConducted || 0);
        const pct = calculateAttendancePercentage(c.classesAttended, c.classesConducted);
        if (pct < threshold) belowThresholdCount++;
      });

      const overallPct = calculateAttendancePercentage(totalAttended, totalConducted);
      metricOverallAttn.textContent = `${overallPct}%`;
      metricOverallClasses.textContent = `${totalAttended} of ${totalConducted} classes attended`;

      const statusMeta = getAttendanceStatus(overallPct, threshold);
      metricAttnBadge.textContent = statusMeta.label;
      metricAttnBadge.className = `metric-badge badge-${statusMeta.status}`;

      metricDangerCount.textContent = belowThresholdCount;
      metricDangerSubtext.textContent = belowThresholdCount === 1 
        ? "1 course below target" 
        : `${belowThresholdCount} courses below target`;
    } else {
      metricOverallAttn.textContent = "--%";
      metricAttnBadge.textContent = "No Data";
      metricAttnBadge.className = "metric-badge badge-neutral";
      metricOverallClasses.textContent = "0 of 0 classes attended";
      metricDangerCount.textContent = "0";
      metricDangerSubtext.textContent = "No attendance data";
    }

    // 2. Course Count & Semester
    const sem = currentData.attendance?.semester || currentData.marks?.semester || "Current Sem";
    metricSemBadge.textContent = sem;
    const uniqueCodes = new Set([
      ...attnCourses.map(c => c.courseCode),
      ...marksCourses.map(c => c.courseCode)
    ]);
    metricCourseCount.textContent = uniqueCodes.size || (attnCourses.length || marksCourses.length);

    // 3. Internal Marks Average
    if (marksCourses.length > 0) {
      let totalMarksEarned = 0;
      let totalMaxMarks = 0;
      let assessmentCount = 0;

      marksCourses.forEach(c => {
        (c.assessments || []).forEach(a => {
          if (typeof a.marks === 'number' && typeof a.maxMarks === 'number' && a.maxMarks > 0) {
            totalMarksEarned += a.marks;
            totalMaxMarks += a.maxMarks;
            assessmentCount++;
          }
        });
      });

      if (totalMaxMarks > 0) {
        const marksAvgPct = ((totalMarksEarned / totalMaxMarks) * 100).toFixed(1);
        metricMarksAvg.textContent = `${marksAvgPct}%`;
        metricMarksCount.textContent = `${assessmentCount} assessments`;
      } else {
        metricMarksAvg.textContent = "--";
        metricMarksCount.textContent = "Grades Pending";
      }
    } else {
      metricMarksAvg.textContent = "--%";
      metricMarksCount.textContent = "0 exams";
    }
  }

  // Render Attendance Cards with Skip Calculator
  function renderAttendanceSection(courses, threshold) {
    if (!courses || courses.length === 0) {
      attendanceEmpty.style.display = "block";
      attendanceList.innerHTML = "";
      return;
    }

    attendanceEmpty.style.display = "none";
    attendanceList.innerHTML = "";

    courses.forEach((course) => {
      const code = course.courseCode || "N/A";
      const name = course.courseName || getCourseName(code);
      const attended = Number(course.classesAttended) || 0;
      const conducted = Number(course.classesConducted) || 0;
      const currentPct = calculateAttendancePercentage(attended, conducted);

      const card = document.createElement("div");
      card.className = "course-card";

      // Status color
      let barColor = "var(--color-success)";
      if (currentPct < threshold) {
        barColor = "var(--color-danger)";
      } else if (currentPct < threshold + 10) {
        barColor = "var(--color-warning)";
      }

      card.innerHTML = `
        <div class="course-info">
          <div class="course-header">
            <span class="course-code">${code}</span>
            <span class="course-name">${name}</span>
          </div>

          <div class="attendance-progress-row">
            <div class="progress-track" title="Threshold: ${threshold}%">
              <div class="progress-fill" style="width: ${Math.min(100, currentPct)}%; background-color: ${barColor};"></div>
              <div class="progress-threshold-marker" style="left: ${threshold}%;" title="Threshold Marker (${threshold}%)"></div>
            </div>
            <strong style="font-size: 15px; color: ${barColor};">${currentPct}%</strong>
          </div>

          <div class="attendance-stats-text">
            <span>Attended: <strong>${attended}</strong> / ${conducted} classes conducted</span>
          </div>
        </div>

        <div class="calculator-box">
          <div class="calculator-title">
            <span>Skip Calculator</span>
            <span class="threshold-tag" style="font-size: 10px; color: var(--text-muted);">Target: ${threshold}%</span>
          </div>

          <div class="stepper-row">
            <span class="stepper-label">Classes to skip:</span>
            <div class="stepper-controls">
              <button class="step-btn btn-minus" aria-label="Decrease classes to skip">−</button>
              <input type="number" class="step-input" min="0" max="50" value="0">
              <button class="step-btn btn-plus" aria-label="Increase classes to skip">+</button>
            </div>
          </div>

          <div class="calc-result-row">
            <div class="calc-projected">
              <span>Projected Attendance:</span>
              <strong class="projected-value">${currentPct}%</strong>
            </div>
            <div class="calc-recovery recovery-message"></div>
          </div>
        </div>
      `;

      // Wire interactive calculator
      const stepInput = card.querySelector(".step-input");
      const minusBtn = card.querySelector(".btn-minus");
      const plusBtn = card.querySelector(".btn-plus");
      const projectedVal = card.querySelector(".projected-value");
      const recoveryMsg = card.querySelector(".recovery-message");

      function updateCalculator() {
        const skipped = Math.max(0, parseInt(stepInput.value, 10) || 0);
        stepInput.value = skipped;

        const projected = calculateProjectedAttendance(attended, conducted, skipped);
        projectedVal.textContent = `${projected}%`;

        if (projected >= threshold) {
          projectedVal.style.color = "var(--color-success)";
          const safeToSkip = calculateBunkableClasses(attended, conducted + skipped, threshold);
          if (safeToSkip > 0) {
            recoveryMsg.innerHTML = `<span style="color: var(--color-success);">✓ Safe: Can skip up to ${safeToSkip} more classes.</span>`;
          } else {
            recoveryMsg.innerHTML = `<span style="color: var(--color-warning);">⚠️ On the edge: Any further skip drops below ${threshold}%.</span>`;
          }
        } else {
          projectedVal.style.color = "var(--color-danger)";
          // Recovery calculation
          const effectiveConducted = conducted + skipped;
          const recoveryNeeded = calculateRecoveryClasses(attended, effectiveConducted, threshold);
          recoveryMsg.innerHTML = `<span style="color: var(--color-danger);">⚠️ Below target: Attend next <strong>${recoveryNeeded}</strong> classes consecutively to reach ${threshold}%.</span>`;
        }
      }

      minusBtn.addEventListener("click", () => {
        let v = parseInt(stepInput.value, 10) || 0;
        if (v > 0) {
          stepInput.value = v - 1;
          updateCalculator();
        }
      });

      plusBtn.addEventListener("click", () => {
        let v = parseInt(stepInput.value, 10) || 0;
        stepInput.value = v + 1;
        updateCalculator();
      });

      stepInput.addEventListener("input", updateCalculator);

      // Initial run for each card
      updateCalculator();

      attendanceList.appendChild(card);
    });
  }

  // Render Internal Marks Section
  function renderMarksSection(courses) {
    if (!courses || courses.length === 0) {
      marksEmpty.style.display = "block";
      marksList.innerHTML = "";
      return;
    }

    marksEmpty.style.display = "none";
    marksList.innerHTML = "";

    courses.forEach((course) => {
      const code = course.courseCode || "N/A";
      const name = course.courseName || getCourseName(code);
      const assessments = course.assessments || [];

      const card = document.createElement("div");
      card.className = "marks-card";

      let rowsHtml = "";
      if (assessments.length === 0) {
        rowsHtml = `<tr><td colspan="4" style="text-align: center; color: var(--text-muted);">No marks recorded for this course yet.</td></tr>`;
      } else {
        assessments.forEach(a => {
          const examName = a.examName || "Assessment";
          const examType = a.examType || "Regular";
          const marks = (typeof a.marks === 'number') ? a.marks : "—";
          const maxMarks = (typeof a.maxMarks === 'number') ? a.maxMarks : "—";
          const pct = (typeof a.marks === 'number' && typeof a.maxMarks === 'number' && a.maxMarks > 0)
            ? `${Math.round((a.marks / a.maxMarks) * 100)}%`
            : "—";

          rowsHtml += `
            <tr>
              <td><strong>${examName}</strong></td>
              <td><span class="course-code" style="font-size: 11px;">${examType}</span></td>
              <td class="marks-score">${marks} / ${maxMarks}</td>
              <td style="font-weight: 600; color: var(--text-muted);">${pct}</td>
            </tr>
          `;
        });
      }

      card.innerHTML = `
        <div class="marks-card-header">
          <div class="course-header">
            <span class="course-code">${code}</span>
            <span class="course-name">${name}</span>
          </div>
          <span style="font-size: 12px; color: var(--text-muted);">${assessments.length} assessment${assessments.length !== 1 ? 's' : ''}</span>
        </div>
        <div class="marks-table-wrapper">
          <table class="marks-table">
            <thead>
              <tr>
                <th>Exam / Component</th>
                <th>Type</th>
                <th>Marks Earned</th>
                <th>Score</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
        </div>
      `;

      marksList.appendChild(card);
    });
  }

  // Tab navigation
  tabBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      tabBtns.forEach(b => b.classList.remove("active"));
      tabPanels.forEach(p => p.classList.remove("active"));

      btn.classList.add("active");
      const targetPanel = document.getElementById(btn.dataset.tab);
      if (targetPanel) targetPanel.classList.add("active");
    });
  });

  // Settings Modal Controls
  settingsToggleBtn.addEventListener("click", () => {
    settingsModal.style.display = "flex";
  });

  settingsCloseBtn.addEventListener("click", () => {
    settingsModal.style.display = "none";
  });

  settingsModal.addEventListener("click", (e) => {
    if (e.target === settingsModal) {
      settingsModal.style.display = "none";
    }
  });

  // Threshold changes
  thresholdInput.addEventListener("change", async () => {
    const val = parseInt(thresholdInput.value, 10);
    if (!isNaN(val) && val >= 50 && val <= 95) {
      await updateSettings({ attendanceThreshold: val });
      currentData = await getStorageData();
      renderDashboard();
    }
  });

  // Sample data load buttons
  loadDevSampleBtns.forEach(btn => {
    btn.addEventListener("click", async () => {
      await loadSampleData();
      currentData = await getStorageData();
      renderDashboard();
      settingsModal.style.display = "none";
    });
  });

  const dashSyncAllBtn = document.getElementById("dash-sync-all-btn");
  const dashSyncAttnBtn = document.getElementById("dash-sync-attn-btn");
  const dashSyncMarksBtn = document.getElementById("dash-sync-marks-btn");
  const dashSyncStateMsg = document.getElementById("dash-sync-state-msg");

  // Sync button event listeners
  if (dashSyncAllBtn) {
    dashSyncAllBtn.addEventListener("click", () => {
      dashSyncAllBtn.textContent = "⏳ Syncing...";
      chrome.runtime?.sendMessage({ action: "TRIGGER_SYNC", target: "ALL" }, () => {
        setTimeout(async () => {
          currentData = await getStorageData();
          renderDashboard();
          dashSyncAllBtn.innerHTML = "🔄 Sync Portals";
        }, 1500);
      });
    });
  }

  if (dashSyncAttnBtn) {
    dashSyncAttnBtn.addEventListener("click", () => {
      dashSyncAttnBtn.textContent = "⏳ Syncing Attendance...";
      chrome.runtime?.sendMessage({ action: "TRIGGER_SYNC", target: "ATTENDANCE" }, () => {
        setTimeout(async () => {
          currentData = await getStorageData();
          renderDashboard();
          dashSyncAttnBtn.innerHTML = "🔄 Sync Attendance";
        }, 1500);
      });
    });
  }

  if (dashSyncMarksBtn) {
    dashSyncMarksBtn.addEventListener("click", () => {
      dashSyncMarksBtn.textContent = "⏳ Syncing Marks...";
      chrome.runtime?.sendMessage({ action: "TRIGGER_SYNC", target: "MARKS" }, () => {
        setTimeout(async () => {
          currentData = await getStorageData();
          renderDashboard();
          dashSyncMarksBtn.innerHTML = "🔄 Sync Marks";
        }, 1500);
      });
    });
  }

  // Update sync state message
  function checkSyncState() {
    if (typeof chrome !== 'undefined' && chrome.storage?.local && dashSyncStateMsg) {
      chrome.storage.local.get(["amrita_sync_state"], (res) => {
        const syncState = res.amrita_sync_state || {};
        if (syncState.attendance?.state === "expired") {
          dashSyncStateMsg.innerHTML = '<span style="color: var(--color-danger);">⚠️ MyAmrita session expired. <a href="https://students.amrita.edu/client/index" target="_blank" style="color: var(--color-danger); text-decoration: underline;">Log in to MyAmrita</a></span>';
        } else if (syncState.marks?.state === "expired") {
          dashSyncStateMsg.innerHTML = '<span style="color: var(--color-danger);">⚠️ AUMS session expired. <a href="https://aumscn.amrita.edu/cas/login?service=https%3A%2F%2Faumscn.amrita.edu%2Faums%2FJsp%2FCommon%2Findex.jsp" target="_blank" style="color: var(--color-danger); text-decoration: underline;">Log in to AUMS (CAS)</a></span>';
        } else if (syncState.attendance?.state === "syncing" || syncState.marks?.state === "syncing") {
          dashSyncStateMsg.innerHTML = '<span style="color: #0284c7;">🔄 Background synchronization in progress...</span>';
        } else {
          dashSyncStateMsg.innerHTML = '';
        }
      });
    }
  }

  // Clear data
  clearAllDataBtn.addEventListener("click", async () => {
    if (confirm("Are you sure you want to delete all locally stored marks and attendance data? This cannot be undone.")) {
      await clearAllData();
      currentData = await getStorageData();
      renderDashboard();
      settingsModal.style.display = "none";
    }
  });

  // Listen to chrome.storage changes so dashboard auto-updates if data changes in another tab
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.onChanged) {
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === "local" && changes[STORAGE_KEY]) {
        currentData = changes[STORAGE_KEY].newValue || structuredClone(DEFAULT_STATE);
        renderDashboard();
      }
    });
  }

  await init();
});

