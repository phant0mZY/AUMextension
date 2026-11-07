@echo off
setlocal EnableDelayedExpansion

title Amrita Student Companion - Setup Assistant
color 0F

echo ==============================================================================
echo            Amrita Student Companion - Chrome Extension Installer
echo ==============================================================================
echo  A personal academic dashboard and class-skip calculator for Amrita students.
echo  This script downloads the extension to your Desktop for easy loading in Chrome.
echo ==============================================================================
echo.

REM -----------------------------------------------------------------------------
REM Determine Student's Desktop Directory
REM -----------------------------------------------------------------------------
set "DESKTOP_PATH=%USERPROFILE%\Desktop"
if exist "%OneDrive%\Desktop" set "DESKTOP_PATH=%OneDrive%\Desktop"
if exist "%OneDriveConsumer%\Desktop" set "DESKTOP_PATH=%OneDriveConsumer%\Desktop"
set "INSTALL_BASE=%DESKTOP_PATH%\AmritaStudentCompanion"

REM -----------------------------------------------------------------------------
REM Step 1: Download latest extension ZIP
REM -----------------------------------------------------------------------------
set "REPO_ZIP_URL=https://github.com/phant0mZY/AUMextension/archive/refs/heads/main.zip"
set "FALLBACK_ZIP_URL=https://github.com/phant0mZY/AUMextension/archive/refs/heads/master.zip"
set "TEMP_ZIP=%TEMP%\AmritaStudentCompanion_setup.zip"

echo [Step 1/4] Downloading latest extension archive...
echo ------------------------------------------------------------------------------
echo Source: https://github.com/phant0mZY/AUMextension
echo.

if exist "!TEMP_ZIP!" del /f /q "!TEMP_ZIP!" >nul 2>&1

where curl.exe >nul 2>&1
if %ERRORLEVEL% NEQ 0 goto :download_powershell

:download_curl
echo Downloading via Windows curl...
curl.exe -L -f --progress-bar -o "!TEMP_ZIP!" "!REPO_ZIP_URL!"
if exist "!TEMP_ZIP!" goto :download_validate

echo Main branch download failed. Trying master branch...
curl.exe -L -f --progress-bar -o "!TEMP_ZIP!" "!FALLBACK_ZIP_URL!"
goto :download_validate

:download_powershell
echo Downloading via PowerShell...
powershell -NoProfile -Command "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; try { Invoke-WebRequest -Uri '!REPO_ZIP_URL!' -OutFile '!TEMP_ZIP!' -UseBasicParsing } catch { Invoke-WebRequest -Uri '!FALLBACK_ZIP_URL!' -OutFile '!TEMP_ZIP!' -UseBasicParsing }"

:download_validate
if not exist "!TEMP_ZIP!" goto :download_error

set "ZIP_SIZE=0"
for %%A in ("!TEMP_ZIP!") do set "ZIP_SIZE=%%~zA"
if !ZIP_SIZE! LEQ 0 goto :download_error

echo [OK] Files downloaded successfully (!ZIP_SIZE! bytes).
echo.
goto :extract_step

:download_error
echo.
echo [ERROR] Download failed!
echo Could not download the extension from:
echo   !REPO_ZIP_URL!
echo.
echo Troubleshooting:
echo  1. Ensure your internet connection is active.
echo  2. Verify that the GitHub repository is publicly accessible.
echo.
if exist "!TEMP_ZIP!" del /f /q "!TEMP_ZIP!" >nul 2>&1
pause
exit /b 1

REM -----------------------------------------------------------------------------
REM Step 2: Extract to Desktop\AmritaStudentCompanion
REM -----------------------------------------------------------------------------
:extract_step
echo [Step 2/4] Extracting extension to your Desktop...
echo ------------------------------------------------------------------------------
echo Destination: !INSTALL_BASE!

REM Replace older downloaded version safely
if exist "!INSTALL_BASE!" (
    echo Clearing older installed files on Desktop...
    rd /s /q "!INSTALL_BASE!" >nul 2>&1
)

mkdir "!INSTALL_BASE!" >nul 2>&1

where tar.exe >nul 2>&1
if %ERRORLEVEL% NEQ 0 goto :extract_powershell

echo Extracting archive using Windows tar...
tar.exe -xf "!TEMP_ZIP!" -C "!INSTALL_BASE!"
goto :extract_finish

:extract_powershell
echo Extracting archive using PowerShell...
powershell -NoProfile -Command "Expand-Archive -Path '!TEMP_ZIP!' -DestinationPath '!INSTALL_BASE!' -Force"

:extract_finish
if exist "!TEMP_ZIP!" del /f /q "!TEMP_ZIP!" >nul 2>&1
echo [OK] Extraction completed.
echo.

REM -----------------------------------------------------------------------------
REM Step 3: Locate exact folder containing manifest.json
REM -----------------------------------------------------------------------------
echo [Step 3/4] Locating extension manifest...
echo ------------------------------------------------------------------------------

set "MANIFEST_COUNT=0"
set "FIRST_MANIFEST="
set "SELECTED_MANIFEST="

for /r "%INSTALL_BASE%" %%F in (manifest.json) do (
    if exist "%%F" (
        set /a MANIFEST_COUNT+=1
        if !MANIFEST_COUNT! EQU 1 set "FIRST_MANIFEST=%%F"
        if exist "%%~dpFpopup" set "SELECTED_MANIFEST=%%F"
        if exist "%%~dpFcontent-scripts" set "SELECTED_MANIFEST=%%F"
    )
)

if !MANIFEST_COUNT! EQU 0 goto :no_manifest_found

if !MANIFEST_COUNT! EQU 1 (
    set "SELECTED_MANIFEST=!FIRST_MANIFEST!"
    echo [OK] Located extension package.
) else (
    if not defined SELECTED_MANIFEST set "SELECTED_MANIFEST=!FIRST_MANIFEST!"
    echo [NOTE] Detected !MANIFEST_COUNT! manifest.json files in archive.
    echo Selected primary package: !SELECTED_MANIFEST!
)

REM Extract directory from manifest path
for %%D in ("!SELECTED_MANIFEST!") do set "EXTENSION_DIR=%%~dpD"
if "!EXTENSION_DIR:~-1!"=="\" set "EXTENSION_DIR=!EXTENSION_DIR:~0,-1!"

echo Manifest Path   : !SELECTED_MANIFEST!
echo Extension Folder: !EXTENSION_DIR!
echo.
goto :launch_step

:no_manifest_found
echo.
echo [ERROR] manifest.json was not found in the extracted archive!
echo Extraction folder: !INSTALL_BASE!
echo.
echo Extracted directory contents:
dir /s /b "!INSTALL_BASE!"
echo.
echo Please ensure the repository contains a valid Chrome extension manifest.
pause
exit /b 1

REM -----------------------------------------------------------------------------
REM Step 4: Open Chrome and File Explorer
REM -----------------------------------------------------------------------------
:launch_step
echo [Step 4/4] Opening Chrome Extensions and File Explorer...
echo ------------------------------------------------------------------------------

REM Copy path to clipboard for student convenience
echo|set /p="!EXTENSION_DIR!"|clip
echo [OK] Folder path copied to clipboard: "!EXTENSION_DIR!"

REM Open File Explorer at the exact extension folder
start "" explorer.exe "!EXTENSION_DIR!"
echo [OK] File Explorer opened at extension folder.

REM Locate Chrome executable
set "CHROME_EXE="
if exist "%ProgramFiles%\Google\Chrome\Application\chrome.exe" (
    set "CHROME_EXE=%ProgramFiles%\Google\Chrome\Application\chrome.exe"
) else if exist "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" (
    set "CHROME_EXE=%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe"
) else if exist "%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe" (
    set "CHROME_EXE=%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe"
)

if defined CHROME_EXE (
    start "" "!CHROME_EXE!" "chrome://extensions"
    echo [OK] Chrome opened to chrome://extensions
) else (
    start "" "chrome://extensions" >nul 2>&1
    if !ERRORLEVEL! NEQ 0 (
        echo [NOTE] Could not open Chrome automatically.
        echo Please manually open Google Chrome and navigate to: chrome://extensions
    ) else (
        echo [OK] Chrome opened to chrome://extensions
    )
)

echo.
echo ==============================================================================
echo  Chrome Extensions is now open, and your extension folder is on your Desktop!
echo ==============================================================================
echo.
echo  Follow these remaining steps to complete the installation:
echo.
echo   1. In Chrome, turn on "Developer mode" in the top-right corner.
echo.
echo   2. Click the "Load unpacked" button in the top-left corner.
echo.
echo   3. In the folder picker window that opens:
echo      - Click "Desktop" on the left sidebar.
echo      - Select the "AmritaStudentCompanion" folder.
echo        (OR click the address bar, press [Ctrl + V], and press Enter).
echo.
echo   4. Click "Select Folder".
echo.
echo   5. The Amrita Student Companion extension will immediately appear in Chrome!
echo.
echo ==============================================================================
echo  IMPORTANT:
echo  The extension folder is saved on your Desktop:
echo    !EXTENSION_DIR!
echo.
echo  Do not delete this folder from your Desktop, because Chrome runs the
echo  extension directly from this location.
echo.
echo  Status:
echo   [OK] Downloaded and placed on Desktop successfully
echo   [OK] Chrome and File Explorer opened
echo   [..] Waiting for you to complete the manual steps in Chrome above...
echo ==============================================================================
echo.
echo When you have finished loading the extension in Chrome, press any key to exit.
pause >nul
exit /b 0
