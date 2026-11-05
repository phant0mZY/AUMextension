# Amrita Student Companion (Chrome Extension)

> A personal, privacy-focused academic dashboard and class-skip calculator built for Amrita Vishwa Vidyapeetham students.

---

## 🔒 Privacy & Security Guarantees

- **100% Client-Side:** All internal marks and attendance data remain inside your browser's `chrome.storage.local`.
- **Zero Credentials Collected:** We never ask for, intercept, or store your passwords or session tokens. You log in directly to official Amrita portals (`aumscn.amrita.edu` and `students.amrita.edu`).
- **No External Servers or Analytics:** Zero external network requests are made. No databases, tracking scripts, or cloud servers are used.
- **Easy Data Reset:** You can purge all cached academic snapshots at any time with one click from the Dashboard Settings.

---

## 🚀 How to Load and Test the Extension in Chrome (Unpacked Mode)

1. Open **Google Chrome**.
2. In the address bar, type:
   ```text
   chrome://extensions
   ```
   and press **Enter**.
3. In the top-right corner of the Extensions page, enable **Developer mode** (toggle switch).
4. Click the **Load unpacked** button in the top-left corner.
5. In the file picker dialog, navigate to and select this project directory:
   ```text
   C:\AUMextension
   ```
6. You will see **Amrita Student Companion** appear in your list of extensions with an icon and version `1.0.0` without any errors!
7. Pin the extension to your Chrome toolbar by clicking the puzzle icon (Extensions menu) and selecting the pin next to **Amrita Student Companion**.

---

## 🧪 Testing Phase 1 Features

1. Click the **Amrita Student Companion** toolbar icon to open the popup.
2. In the popup, click **⚡ Load MCA Sample Data** to populate realistic course data.
3. Observe how the popup dynamically updates with total courses and overall attendance.
4. Click **Open Academic Dashboard** (or click the button in the popup) to open the dashboard tab.
5. In the dashboard:
   - View your overall attendance, total enrolled courses, and evaluated internal marks average.
   - Switch between **Attendance & Skip Calculator** and **Internal Marks** tabs.
   - Try the interactive class-skip stepper (`+` / `-`) on any subject card to see your projected attendance and recovery requirements update in real time.
   - Click **⚙️ Settings** to adjust your target attendance threshold (default 75%) or test data clearing.

---

## 📂 Architecture & Directory Structure

```text
c:\AUMextension\
├── manifest.json                  # Manifest V3 configuration & permissions
├── assets/
│   └── icons/                     # Extension icons (16px, 32px, 48px, 128px)
├── popup/
│   ├── popup.html                 # Quick toolbar popup interface
│   ├── popup.css                  # Modern styling for popup
│   └── popup.js                   # Popup logic and quick actions
├── dashboard/
│   ├── dashboard.html             # Full-tab academic dashboard interface
│   ├── dashboard.css              # Responsive modern design system
│   └── dashboard.js               # Dashboard controller and reactive calculations
├── shared/
│   ├── courses.js                 # Course code to title dictionary (e.g. 26CSA502)
│   ├── calculations.js            # Pure math for attendance %, projections & recovery
│   ├── storage.js                 # Safe wrapper for chrome.storage.local
│   ├── sample-data.js             # Realistic MCA sample dataset for development
│   └── utils.js                   # Formatting helpers and status badges
├── content-scripts/
│   ├── aums-marks.js              # AUMS marks extraction script (Phase 3)
│   └── attendance.js              # Attendance extraction script (Phase 4)
├── attendance_source.txt          # Reference HTML source from logged-in portal
├── marks_source.txt               # Reference HTML source from logged-in portal
└── README.md
```

---

## 🗺️ Roadmap & Phases

- [x] **Phase 1: Project Setup & Core Shell** (Manifest V3, popup, full dashboard, sample data, settings)
- [ ] **Phase 2: Class-Skip Calculator Deepening & Unit Tests** (Refining edge cases & formulas)
- [ ] **Phase 3: AUMS Marks Extraction** (Parsing `marks_source.txt` from AUMS portal)
- [ ] **Phase 4: Attendance Extraction** (Parsing `attendance_source.txt` from MyAmrita portal)
- [ ] **Phase 5: Final Polish, Packaging & Production Readiness**

