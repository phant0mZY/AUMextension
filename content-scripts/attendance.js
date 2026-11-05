/**
 * Amrita Student Companion - Attendance Extractor & Background Sync Agent
 * Automatically extracts attendance from MyAmrita (students.amrita.edu).
 */

(function () {
  const isBackgroundSyncTab = window.location.hash.includes("amrita-sync=attendance");
  console.log("[Amrita Companion] Attendance script initialized. BackgroundSync:", isBackgroundSyncTab, "URL:", window.location.href);

  // 1. Session Expiration / Login Detection
  if (
    window.location.pathname.includes("/login") ||
    document.querySelector("input[type='password']") !== null ||
    document.body.innerText.includes("Session Expired") ||
    document.body.innerText.includes("Please login again")
  ) {
    console.warn("[Amrita Companion] MyAmrita session is expired or not logged in.");
    if (chrome?.runtime?.sendMessage) {
      chrome.runtime.sendMessage({ action: "PORTAL_SESSION_EXPIRED", portal: "attendance" });
    }
    return;
  }

  // 2. Odd Semester Auto-Selection (if on class-attendance page)
  function ensureOddSemesterSelected() {
    const termSelect = document.querySelector("select[name='academic_term_id']");
    if (!termSelect) return false;

    const currentOption = termSelect.options[termSelect.selectedIndex];
    const currentText = currentOption ? currentOption.textContent : "";

    // If currently selected option is already an Odd Semester, we are on the right report!
    if (currentText.toLowerCase().includes("odd sem")) {
      return false; // Already selected
    }

    // Look for the latest Odd Semester option
    for (let i = 0; i < termSelect.options.length; i++) {
      const opt = termSelect.options[i];
      if (opt.textContent.toLowerCase().includes("odd sem")) {
        console.log("[Amrita Companion] Switching semester dropdown to:", opt.textContent);
        termSelect.selectedIndex = i;
        if (termSelect.form) {
          termSelect.form.submit();
        } else {
          termSelect.dispatchEvent(new Event("change", { bubbles: true }));
        }
        return true; // Form submitted
      }
    }
    return false;
  }

  // Check semester selection immediately
  if (ensureOddSemesterSelected()) {
    return; // Wait for page to reload with Odd Semester
  }

  // 3. Attendance Table Extraction
  let lastExtractedHash = null;

  function findAttendanceTable() {
    const homeTab = document.getElementById("home_tab");
    if (homeTab) return homeTab;

    // Fallback: search all tables
    const tables = document.querySelectorAll("table");
    for (const table of tables) {
      const text = table.textContent;
      if (text.includes("Present") && (text.includes("Course") || text.includes("Total") || text.includes("Percentage"))) {
        return table;
      }
    }
    return null;
  }

  function extractAttendance() {
    const table = findAttendanceTable();
    if (!table) return false;

    const rows = Array.from(table.querySelectorAll("tr"));
    if (rows.length < 2) return false;

    // Header inspection
    const headerCells = Array.from(rows[0].querySelectorAll("th, td")).map(c => c.textContent.trim().toLowerCase());
    
    let courseCol = headerCells.findIndex(h => h.includes("course"));
    let totalCol = headerCells.findIndex(h => h.includes("total"));
    let presentCol = headerCells.findIndex(h => h.includes("present"));
    let pctCol = headerCells.findIndex(h => h.includes("percentage") || h.includes("%"));

    if (courseCol === -1) courseCol = 2;
    if (totalCol === -1) totalCol = 4;
    if (presentCol === -1) presentCol = 5;
    if (pctCol === -1) pctCol = 8;

    const extractedCourses = [];

    for (let i = 1; i < rows.length; i++) {
      const cells = Array.from(rows[i].querySelectorAll("th, td"));
      if (cells.length <= Math.max(courseCol, totalCol, presentCol)) continue;

      const rawCourseText = cells[courseCol].textContent.trim();
      const codeMatch = rawCourseText.match(/([0-9]{2}[A-Za-z]{3}[0-9]{3})/);
      if (!codeMatch) continue;

      const courseCode = codeMatch[1].toUpperCase();
      const conducted = parseInt(cells[totalCol].textContent.trim(), 10) || 0;
      const attended = parseInt(cells[presentCol].textContent.trim(), 10) || 0;

      let pct = 0;
      if (pctCol !== -1 && cells[pctCol]) {
        pct = parseFloat(cells[pctCol].textContent.trim()) || 0;
      }
      if (pct === 0 && conducted > 0) {
        pct = Math.round((attended / conducted) * 1000) / 10;
      }

      const courseName = typeof getCourseName === "function" ? getCourseName(courseCode) : courseCode;

      extractedCourses.push({
        courseCode: courseCode,
        courseName: courseName,
        classesAttended: attended,
        classesConducted: conducted,
        percentage: pct
      });
    }

    if (extractedCourses.length === 0) return false;

    const contentHash = JSON.stringify(extractedCourses);
    if (contentHash === lastExtractedHash) return true;
    lastExtractedHash = contentHash;

    // Semester name
    let semName = "Odd Semester";
    const termSelect = document.querySelector("select[name='academic_term_id']");
    if (termSelect && termSelect.selectedIndex >= 0) {
      semName = termSelect.options[termSelect.selectedIndex].textContent.trim();
    }

    const payload = {
      semester: semName,
      courses: extractedCourses
    };

    if (typeof saveAttendanceSnapshot === "function") {
      saveAttendanceSnapshot(payload).then(() => {
        console.log("[Amrita Companion] Attendance snapshot successfully stored locally!");

        // Notify background service worker that sync is complete
        if (chrome?.runtime?.sendMessage) {
          chrome.runtime.sendMessage({
            action: "ATTENDANCE_SYNC_COMPLETE",
            courseCount: extractedCourses.length
          });
        }

        // Only show interactive on-page banner if user is viewing this tab directly
        if (!isBackgroundSyncTab) {
          showPortalSyncBanner(`✓ Synced attendance for ${extractedCourses.length} courses!`);
        }
      });
    }

    return true;
  }

  function showPortalSyncBanner(message) {
    let banner = document.getElementById("amrita-companion-attn-banner");
    if (!banner) {
      banner = document.createElement("div");
      banner.id = "amrita-companion-attn-banner";
      banner.style.cssText = `
        position: fixed;
        bottom: 24px;
        right: 24px;
        z-index: 2147483647;
        background: #0f172a;
        color: #ffffff;
        padding: 12px 18px;
        border-radius: 10px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.4);
        display: flex;
        align-items: center;
        gap: 12px;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        font-size: 13px;
        border: 1px solid #334155;
      `;
      document.body.appendChild(banner);
    }

    banner.innerHTML = `
      <div style="width: 26px; height: 26px; border-radius: 6px; background: #10b981; color: #fff; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 14px;">✓</div>
      <div>
        <div style="font-weight: 600; color: #f8fafc;">${message}</div>
        <div style="font-size: 11px; color: #94a3b8;">Amrita Student Companion</div>
      </div>
      <button id="amrita-open-dash-attn-btn" style="margin-left: 8px; background: #a41d23; color: #fff; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 600;">Open Dashboard ↗</button>
    `;

    document.getElementById("amrita-open-dash-attn-btn")?.addEventListener("click", () => {
      if (typeof chrome !== "undefined" && chrome.runtime) {
        window.open(chrome.runtime.getURL("dashboard/dashboard.html"), "_blank");
      }
    });

    setTimeout(() => {
      if (banner && banner.parentNode) {
        banner.style.opacity = "0.85";
      }
    }, 7000);
  }

  // Periodic polling for asynchronous AJAX loading (MyAmrita loads table via request-head.php)
  [400, 1200, 2500, 4500].forEach(delay => {
    setTimeout(extractAttendance, delay);
  });

  // Observe subsequent AJAX page changes
  const observer = new MutationObserver(() => {
    extractAttendance();
  });
  observer.observe(document.documentElement || document.body, { childList: true, subtree: true });
})();
