# Amrita Student Companion — One-Click Windows Installer

This folder contains `Install-Amrita-Companion.bat`, a lightweight, dependency-free Windows installer that places the extension directly onto the student's **Desktop** for fast and effortless loading into Chrome.

---

## 📌 Repository Information

- **Download Source:** `https://github.com/phant0mZY/AUMextension/archive/refs/heads/main.zip`
- **Installation Location:** `Desktop\AmritaStudentCompanion`

---

## 🚀 How to Use It (For Students)

1. **Download `Install-Amrita-Companion.bat`** (or save it from the `installer/` directory).
2. **Double-click `Install-Amrita-Companion.bat`** to run it.
3. The installer automatically:
   - Downloads the latest extension release ZIP directly from GitHub.
   - Extracts the extension right to your **Desktop** (`Desktop\AmritaStudentCompanion`).
   - Recursively locates the exact folder containing `manifest.json`.
   - **Copies the exact folder path directly to your Windows clipboard.**
   - Automatically opens File Explorer at the extension folder on your Desktop.
   - Automatically launches Google Chrome directly to `chrome://extensions`.
4. In Chrome:
   - Toggle ON **Developer mode** (top-right corner).
   - Click the **Load unpacked** button (top-left corner).
   - In the file dialog, click **Desktop** on the left sidebar, open `AmritaStudentCompanion`, and click **Select Folder** (or simply click the address bar, press **Ctrl + V**, hit Enter, and click **Select Folder**).

> [!IMPORTANT]
> The extension files are saved right on your Desktop (`Desktop\AmritaStudentCompanion`). Do not delete or move this folder from your Desktop, because Google Chrome loads and runs the extension directly from this location.

---

## 🔒 Security & Privacy Guarantees

- **No Administrator Privileges Required:** Installs completely on the student's Desktop with normal user permissions.
- **Zero External Dependencies:** Built with 100% native Windows tools (`curl.exe`, `tar.exe`, `explorer.exe`). No Python, Node.js, Git, or third-party runtimes needed.
- **Never Bypasses Chrome Security:** Strictly respects Google Chrome's Manifest V3 security model by guiding students through the official "Load unpacked" process.
- **Safe Version Upgrades:** Automatically clears the older installed directory on the Desktop before extracting the new version, preventing orphaned or conflicting files.

---

## 📤 Sharing with Other Students

To share the extension with classmates:
1. Give them the direct download link for `Install-Amrita-Companion.bat`:
   ```text
   https://raw.githubusercontent.com/phant0mZY/AUMextension/main/installer/Install-Amrita-Companion.bat
   ```
2. They double-click the file and follow the prompt. Setup takes under 30 seconds!
