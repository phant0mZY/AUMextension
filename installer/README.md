# Amrita Student Companion — One-Click Windows Installer

This folder contains `Install-Amrita-Companion.bat`, a lightweight, dependency-free Windows installer that makes installing and updating the **Amrita Student Companion** Chrome extension effortless for any student.

---

## 📌 Repository Information

- **GitHub Repository:** `https://github.com/phant0mZY/AUMextension`
- **Install Location:** `%LOCALAPPDATA%\AmritaStudentCompanion`

> [!NOTE]
> Before classmates can download the complete extension via the installer, make sure your latest code has been pushed to GitHub:
> ```powershell
> git add .
> git commit -m "Release Amrita Student Companion with Background Sync"
> git push origin main
> ```

---

## 🚀 How to Use It (For Students)

1. **Download `Install-Amrita-Companion.bat`** (or save it from the `installer/` directory).
2. **Double-click `Install-Amrita-Companion.bat`** to run it.
3. When prompted, press **Enter** to use the default repository (`https://github.com/phant0mZY/AUMextension`) or enter a custom fork URL.
4. The installer automatically:
   - Downloads the latest extension release ZIP using Windows `curl`.
   - Safely replaces any older installation in `%LOCALAPPDATA%\AmritaStudentCompanion`.
   - Extracts all files using built-in Windows `tar`.
   - Recursively locates the exact folder containing `manifest.json`.
   - **Copies the folder path directly to your Windows clipboard.**
   - Automatically opens File Explorer at that folder.
   - Automatically launches Google Chrome directly to `chrome://extensions`.
5. In Chrome:
   - Toggle ON **Developer mode** (top-right corner).
   - Click the **Load unpacked** button (top-left corner).
   - In the file dialog, click the address bar, press **Ctrl + V** to paste the copied folder path, press **Enter**, and click **Select Folder**.

---

## 🔒 Security & Privacy Guarantees

- **No Administrator Privileges Required:** Installs completely within the student's personal user profile (`%LOCALAPPDATA%`).
- **Zero External Dependencies:** Built with 100% native Windows tools (`curl.exe`, `tar.exe`, `explorer.exe`). No Python, Node.js, Git, or third-party software needed.
- **Never Bypasses Chrome Security:** Strictly respects Google Chrome's Manifest V3 security model by guiding students through the official "Load unpacked" process.
- **Safe Version Upgrades:** Automatically clears the older installed directory before extracting the new version, preventing orphaned or conflicting files.

---

## 📤 Sharing with Other Students

To share the extension with classmates:
1. Give them the link to download `Install-Amrita-Companion.bat`:
   ```text
   https://github.com/phant0mZY/AUMextension/raw/main/installer/Install-Amrita-Companion.bat
   ```
2. They double-click the file and follow the prompt. Setup takes under 30 seconds!
