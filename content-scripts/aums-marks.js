/**
 * Amrita Student Companion - AUMS Marks Extractor & Background Sync Agent
 * Automatically extracts internal marks from AUMS.
 */

(function () {
  const isBackgroundSyncTab = window.location.hash.includes("amrita-sync=marks");
  console.log("[Amrita Companion] Marks script active. BackgroundSync:", isBackgroundSyncTab, "URL:", window.location.href);

  // 1. Session Expiration / CAS Login Detection
  if (
    window.location.href.includes("/cas/") ||
    window.location.pathname.includes("/login") ||
    document.querySelector("input[name*='pass'], input[type='password']") !== null ||
    document.body.innerText.includes("Session Expired") ||
    document.body.innerText.includes("Invalid Session")
  ) {
    console.warn("[Amrita Companion] AUMS session is expired or currently on CAS login page.");
    if (chrome?.runtime?.sendMessage) {
      chrome.runtime.sendMessage({ action: "PORTAL_SESSION_EXPIRED", portal: "marks" });
    }
    return;
  }

  // 2. Semester 1 Auto-Selection
  function ensureSemester1Selected() {
    const semSelect = document.getElementById("htmlPageTopContainer_selectStep") || document.querySelector("select[name*='selectStep']");
    if (!semSelect) return false;

    // Check if a valid semester is already selected (e.g. value != "0")
    if (semSelect.value !== "0" && semSelect.selectedIndex > 0) {
      return false; // Already selected!
    }

    // Find the option corresponding to Semester 1
    for (let i = 0; i < semSelect.options.length; i++) {
      const opt = semSelect.options[i];
      if (opt.textContent.trim() === "1" || opt.textContent.toLowerCase().includes("sem 1")) {
        console.log("[Amrita Companion] Auto-selecting Semester 1 in AUMS dropdown:", opt.textContent);
        semSelect.selectedIndex = i;

        // AUMS uses formSubmit('UMS-EVAL_STUDMARKVIEW_SELSEM_SCREEN')
        if (typeof window.formSubmit === "function") {
          window.formSubmit("UMS-EVAL_STUDMARKVIEW_SELSEM_SCREEN");
        } else {
          // Fallback: set hidden input and submit
          const actionInput = document.querySelector("input[name='action']") || document.querySelector("input[name*='action']");
          if (actionInput) actionInput.value = "UMS-EVAL_STUDMARKVIEW_SELSEM_SCREEN";
          if (semSelect.form) semSelect.form.submit();
        }
        return true;
      }
    }
    return false;
  }

  // Check semester selection immediately
  if (ensureSemester1Selected()) {
    return; // Wait for AUMS to reload with Semester 1
  }

  // 3. Marks Table Extraction
  let lastExtractedHash = null;

  function findMarksTable() {
    const marksDiv = document.getElementById("marks");
    if (marksDiv) {
      const table = marksDiv.querySelector("table");
      if (table) return table;
    }

    const tables = document.querySelectorAll("table");
    for (const table of tables) {
      const text = table.textContent;
      if (text.includes("Exam Name") && (text.includes("Academic Period") || text.includes("Exam Type"))) {
        return table;
      }
    }
    return null;
  }

  function extractMarks() {
    const table = findMarksTable();
    if (!table) return false;

    const rows = Array.from(table.querySelectorAll("tr"));
    if (rows.length < 2) return false;

    const headerCells = Array.from(rows[0].querySelectorAll("th, td")).map(c => c.textContent.trim());
    if (headerCells.length < 4) return false;

    const courseIndexMap = {};
    for (let i = 3; i < headerCells.length; i++) {
      const match = headerCells[i].match(/([0-9]{2}[A-Za-z]{3}[0-9]{3})/);
      if (match) {
        courseIndexMap[i] = match[1].toUpperCase();
      }
    }

    const detectedCodes = Object.values(courseIndexMap);
    if (detectedCodes.length === 0) return false;

    let semester = "Semester 1";
    const semSelect = document.getElementById("htmlPageTopContainer_selectStep");
    if (semSelect && semSelect.options && semSelect.selectedIndex >= 0) {
      const semText = semSelect.options[semSelect.selectedIndex].textContent.trim();
      if (semText && semText !== "Select") {
        semester = semText.toLowerCase().includes("sem") ? semText : `Semester ${semText}`;
      }
    }

    const coursesMap = {};
    detectedCodes.forEach(code => {
      coursesMap[code] = {
        courseCode: code,
        courseName: typeof getCourseName === "function" ? getCourseName(code) : code,
        assessments: []
      };
    });

    for (let r = 1; r < rows.length; r++) {
      const cells = Array.from(rows[r].querySelectorAll("th, td")).map(c => c.textContent.trim());
      if (cells.length < 3) continue;

      const examName = cells[0];
      const examType = cells[2] || "Regular";

      Object.entries(courseIndexMap).forEach(([colIdx, code]) => {
        const idx = parseInt(colIdx, 10);
        if (idx < cells.length) {
          const valStr = cells[idx].replace(/\u00a0/g, "").trim();
          if (valStr && valStr !== "-" && valStr.toLowerCase() !== "np") {
            const marksNum = parseFloat(valStr);
            if (!isNaN(marksNum)) {
              coursesMap[code].assessments.push({
                examName: examName,
                examType: examType,
                marks: marksNum,
                maxMarks: null
              });
            }
          }
        }
      });
    }

    const coursesArray = Object.values(coursesMap);
    const contentHash = JSON.stringify(coursesArray);
    if (contentHash === lastExtractedHash) return true;
    lastExtractedHash = contentHash;

    const payload = {
      semester: semester,
      courses: coursesArray
    };

    if (typeof saveMarksSnapshot === "function") {
      saveMarksSnapshot(payload).then(() => {
        console.log("[Amrita Companion] Marks snapshot successfully stored locally!");

        // Notify background service worker
        if (chrome?.runtime?.sendMessage) {
          chrome.runtime.sendMessage({
            action: "MARKS_SYNC_COMPLETE",
            courseCount: coursesArray.length
          });
        }

        if (!isBackgroundSyncTab) {
          showPortalSyncBanner(`✓ Synced marks for ${coursesArray.length} courses!`);
        }
      });
    }

    return true;
  }

  function showPortalSyncBanner(message) {
    let banner = document.getElementById("amrita-companion-marks-banner");
    if (!banner) {
      banner = document.createElement("div");
      banner.id = "amrita-companion-marks-banner";
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
      <div style="width: 26px; height: 26px; border-radius: 6px; background: #a41d23; color: #fff; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 14px;">A</div>
      <div>
        <div style="font-weight: 600; color: #f8fafc;">${message}</div>
        <div style="font-size: 11px; color: #94a3b8;">Amrita Student Companion</div>
      </div>
      <button id="amrita-open-dash-marks-btn" style="margin-left: 8px; background: #a41d23; color: #fff; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 600;">Open Dashboard ↗</button>
    `;

    document.getElementById("amrita-open-dash-marks-btn")?.addEventListener("click", () => {
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

  [400, 1200, 2500, 4500].forEach(delay => {
    setTimeout(extractMarks, delay);
  });

  const observer = new MutationObserver(() => {
    extractMarks();
  });
  observer.observe(document.documentElement || document.body, { childList: true, subtree: true });
})();
